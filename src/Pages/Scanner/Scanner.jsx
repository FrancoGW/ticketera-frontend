import { 
  Box,
  Button, 
  Center, 
  Container,
  Spinner, 
  Text, 
  useToast,
  VStack,
  Heading,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Card,
  CardBody,
  HStack,
  Icon
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
import { useNavigate, useSearchParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { qrApi } from "../../Api/qr";
import { getObjDate } from "../../common/utils";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiCamera } from "react-icons/fi";
import "./Scanner.css";

const QrStatus = ({ qrState }) => {
  const getStatusColor = (state) => {
    switch (state) {
      case "valid":
        return "green";
      case "used":
        return "orange";
      case "invalid":
      default:
        return "red";
    }
  };

  const getStatusText = (state) => {
    switch (state) {
      case "valid":
        return "Ticket Válido";
      case "used":
        return "Ticket Ya Utilizado";
      case "invalid":
      default:
        return "Ticket Inválido";
    }
  };

  const getStatusIcon = (state) => {
    switch (state) {
      case "valid":
        return FiCheckCircle;
      case "used":
        return FiAlertCircle;
      case "invalid":
      default:
        return FiXCircle;
    }
  };

  return (
    <Badge 
      size="lg" 
      colorScheme={getStatusColor(qrState)}
      p={4}
      borderRadius="lg"
      fontSize="md"
      display="flex"
      alignItems="center"
      gap={2}
      w="fit-content"
      mx="auto"
    >
      <Icon as={getStatusIcon(qrState)} boxSize={5} />
      {getStatusText(qrState)}
    </Badge>
  );
};

// Viewfinder component para mejorar la UX
const Viewfinder = () => {
  return (
    <Box
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      w="280px"
      h="280px"
      pointerEvents="none"
      zIndex={10}
    >
      {/* Corner borders */}
      <Box
        position="absolute"
        top={0}
        left={0}
        w="60px"
        h="60px"
        borderTop="4px solid"
        borderLeft="4px solid"
        borderColor="purple.400"
        borderRadius="lg 0 0 0"
      />
      <Box
        position="absolute"
        top={0}
        right={0}
        w="60px"
        h="60px"
        borderTop="4px solid"
        borderRight="4px solid"
        borderColor="purple.400"
        borderRadius="0 lg 0 0"
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        w="60px"
        h="60px"
        borderBottom="4px solid"
        borderLeft="4px solid"
        borderColor="purple.400"
        borderRadius="0 0 0 lg"
      />
      <Box
        position="absolute"
        bottom={0}
        right={0}
        w="60px"
        h="60px"
        borderBottom="4px solid"
        borderRight="4px solid"
        borderColor="purple.400"
        borderRadius="0 0 lg 0"
      />
      
      {/* Scanning line animation */}
      <Box
        position="absolute"
        top="10%"
        left={0}
        right={0}
        h="2px"
        bgGradient="linear(to-r, transparent, purple.400, transparent)"
        className="scanning-line"
      />
    </Box>
  );
};

export default function Scanner({ embedded = false }) {
  const [qrInfo, setQrInfo] = useState(null);
  const [qrInfoLoading, setQrInfoLoading] = useState(false);
  const [qrStateLoading, setQrStateLoading] = useState(false);
  const [qrState, setQrState] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [validatorToken, setValidatorToken] = useState(null);
  const lastScannedQR = useRef(null);
  const errorCountRef = useRef(0);
  const [scannerKey, setScannerKey] = useState(0); // fuerza remount del QrReader al resetear
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  useEffect(() => {
    // Cuando está embebido en /admin/scanner, la ruta ya está protegida por ProtectedRoute admin
    // No hace falta comprobar permisos; el usuario ya es admin
    if (embedded) {
      requestCameraPermission();
      return;
    }

    // Obtener token de la URL si está disponible
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setValidatorToken(tokenFromUrl);
      // Guardar el token en localStorage temporalmente para las peticiones
      localStorage.setItem('validatorToken', tokenFromUrl);
    }
    
    checkValidatorPermissions(tokenFromUrl);
    requestCameraPermission();
  }, [searchParams, embedded]);

  const checkValidatorPermissions = async (tokenFromUrl = null) => {
    // Si hay token en la URL, validarlo con el backend (endpoint público)
    // El endpoint /qr/validate-token?token=... NO requiere autenticación
    if (tokenFromUrl) {
      try {
        const response = await qrApi.validateValidator(tokenFromUrl);
        // El backend devuelve { ok: true } si el token es válido
        if (response?.data?.ok === true) {
          console.log('✅ Token de validador válido');
          return; // Permitir acceso
        } else {
          throw new Error('Token no válido');
        }
      } catch (error) {
        console.error('Token de validador inválido:', error);
        const errorMessage = error?.response?.data?.message || 'El token de validador no es válido o ha expirado';
        toast({
          title: "Token inválido",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate(embedded ? '/admin' : '/');
        return;
      }
    }

    // Si no hay token en URL, verificar token del localStorage (admin o validator)
    const token = localStorage.getItem('token');
    if (!token) {
      // Si no hay token en URL ni en localStorage, redirigir al login
      toast({
        title: "Acceso requerido",
        description: embedded ? "Debes iniciar sesión como admin." : "Necesitas un token de validador para acceder al scanner",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    try {
      const decoded = jwt_decode(token);
      // Admin puede validar cualquier entrada, sin importar el evento
      if (decoded.rol === 'admin') {
        return; // Permitir acceso
      }
      // Si el usuario tiene rol validator, permitir acceso
      if (decoded.rol === 'validator') {
        return; // Permitir acceso
      }
      
      // Si no es admin ni validator, redirigir
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos de validador. Usa el enlace del scanner proporcionado por el organizador.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate(embedded ? '/admin' : '/');
    } catch (error) {
      console.error("Error validando token:", error);
      navigate('/login');
    }
  };

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      setHasPermission(false);
      toast({
        title: "Error de cámara",
        description: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleScan = async (qrId) => {
    if (!isScanning || lastScannedQR.current === qrId) return;

    lastScannedQR.current = qrId;
    setQrInfoLoading(true);
    setIsScanning(false);

    try {
      // Usar token de validador si está disponible, sino usar token del usuario
      const token = validatorToken || localStorage.getItem('validatorToken') || localStorage.getItem('token');
      const { data } = await qrApi.getQrInfo(qrId);
      setQrInfo(data);
      
      // Sonido breve al escanear (sin depender de archivo externo, evita 404)
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } catch (_) {}
      
    } catch (error) {
      console.error('Error obteniendo información del QR:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "No se pudo obtener la información del ticket",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      resetScanner();
    } finally {
      setQrInfoLoading(false);
    }
  };

  const validateTicket = async () => {
    setQrStateLoading(true);
    try {
      // Usar token de validador si está disponible, sino usar token del usuario
      const token = validatorToken || localStorage.getItem('validatorToken') || localStorage.getItem('token');
      const { data } = await qrApi.validateQr(qrInfo.qrId, token);
      setQrState(data.qrState);
      
      toast({
        title: data.qrState === 'valid' ? "Éxito" : "Advertencia",
        description: data.qrState === 'valid' 
          ? "Ticket validado correctamente" 
          : "El ticket no es válido o ya fue usado",
        status: data.qrState === 'valid' ? "success" : "warning",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error validando ticket:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Error al validar el ticket",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setQrStateLoading(false);
    }
  };

  const resetScanner = () => {
    setQrInfo(null);
    setQrState("");
    setIsScanning(true);
    lastScannedQR.current = null;
    errorCountRef.current = 0;
    setScannerKey((k) => k + 1); // fuerza remount del QrReader para evitar errores de video
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const objDate = getObjDate(dateString);
    return `${objDate.date} - Inicio: ${objDate.timeStart} - Fin: ${objDate.timeEnd}`;
  };

  // Manejar errores del QR Reader de forma silenciosa
  const handleQrError = (error) => {
    // Los errores de decodificación son normales cuando no hay QR en el frame
    // Solo loguear errores reales (no de decodificación)
    if (error) {
      const errorMessage = error.message || error.toString();
      
      // Ignorar errores comunes de decodificación y de video del QrReader
      const ignorableErrors = [
        'No QR code found',
        'QR code not found',
        'Could not find QR code',
        'Found QR code',
        'video',
        'NotFoundError',
        'NotAllowedError',
        'AbortError',
        'play',
        'interrupted',
        'e2',
        'already playing',
        'LdLk22'
      ];
      
      const shouldIgnore = ignorableErrors.some(ignorable => 
        errorMessage.toLowerCase().includes(ignorable.toLowerCase())
      );
      
      if (!shouldIgnore) {
        errorCountRef.current += 1;
        // Solo mostrar error en consola si es un error real y no es muy frecuente
        if (errorCountRef.current % 50 === 0) {
          console.warn('Error QR (ocasional):', errorMessage);
        }
      }
    }
  };

  const LayoutWrapper = ({ children }) =>
    embedded ? (
      <>{children}</>
    ) : (
      <>
        <Header />
        {children}
        <Footer />
      </>
    );

  if (hasPermission === null) {
    return (
      <LayoutWrapper>
        <Container maxW="container.md" py={8} marginTop={embedded ? 0 : 40}>
          <Center h="50vh">
            <VStack spacing={4}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="purple.500"
                size="xl"
              />
              <Text>Verificando permisos de cámara...</Text>
            </VStack>
          </Center>
        </Container>
      </LayoutWrapper>
    );
  }

  if (!hasPermission) {
    return (
      <LayoutWrapper>
        <Container maxW="container.md" py={8} marginTop={embedded ? 0 : 40}>
          <Card>
            <CardBody>
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Error de cámara</AlertTitle>
                  <AlertDescription>
                    No se pudo acceder a la cámara. Por favor, verifica los permisos en tu navegador.
                  </AlertDescription>
                </Box>
              </Alert>
              <Button 
                mt={4} 
                onClick={() => window.location.reload()}
                colorScheme="purple"
                w="100%"
                leftIcon={<Icon as={FiCamera} />}
              >
                Reintentar
              </Button>
            </CardBody>
          </Card>
        </Container>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <Container maxW="container.lg" py={6} marginTop={embedded ? 0 : 40}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VStack spacing={6} align="stretch">
            <Heading 
              size="xl" 
              textAlign="center" 
              color="gray.800"
              fontWeight="bold"
            >
              Escáner de Tickets
            </Heading>

            {qrInfoLoading ? (
              <Card>
                <CardBody>
                  <Center h="40vh">
                    <VStack spacing={4}>
                      <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="purple.500"
                        size="xl"
                      />
                      <Text fontSize="lg" fontWeight="medium">
                        Procesando ticket...
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Por favor espera
                      </Text>
                    </VStack>
                  </Center>
                </CardBody>
              </Card>
            ) : qrInfo ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card shadow="lg" borderRadius="xl">
                  <CardBody p={6}>
                    <VStack spacing={6} align="stretch">
                      <Heading size="md" textAlign="center" color="gray.700">
                        Información del Ticket
                      </Heading>
                      
                      <Box 
                        p={4} 
                        bg="gray.50" 
                        borderRadius="lg"
                        borderWidth="1px"
                        borderColor="gray.200"
                      >
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text 
                              fontSize="xs" 
                              fontWeight="bold" 
                              color="gray.500" 
                              textTransform="uppercase"
                              letterSpacing="wide"
                              mb={1}
                            >
                              Evento
                            </Text>
                            <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                              {qrInfo.eventTitle}
                            </Text>
                          </Box>

                          <Box>
                            <Text 
                              fontSize="xs" 
                              fontWeight="bold" 
                              color="gray.500" 
                              textTransform="uppercase"
                              letterSpacing="wide"
                              mb={1}
                            >
                              Fecha y Horario
                            </Text>
                            <Text fontSize="md" color="gray.700">
                              {formatDate(qrInfo.eventDate)}
                            </Text>
                          </Box>

                          <Box>
                            <Text 
                              fontSize="xs" 
                              fontWeight="bold" 
                              color="gray.500" 
                              textTransform="uppercase"
                              letterSpacing="wide"
                              mb={1}
                            >
                              Tipo de Ticket
                            </Text>
                            <Text fontSize="md" color="gray.700">
                              {qrInfo.ticketTitle}
                            </Text>
                          </Box>
                        </VStack>
                      </Box>

                      {qrState && (
                        <Box py={2}>
                          <QrStatus qrState={qrState} />
                        </Box>
                      )}

                      <HStack spacing={3}>
                        <Button
                          onClick={validateTicket}
                          isLoading={qrStateLoading}
                          colorScheme="teal"
                          isDisabled={!!qrState}
                          flex={1}
                          size="lg"
                          leftIcon={<Icon as={FiCheckCircle} />}
                        >
                          Validar Ticket
                        </Button>

                        <Button
                          onClick={resetScanner}
                          colorScheme="purple"
                          variant="outline"
                          flex={1}
                          size="lg"
                        >
                          Escanear Otro
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </motion.div>
            ) : (
              isScanning && (
                <motion.div
                  key={scannerKey}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card shadow="lg" borderRadius="xl" overflow="hidden">
                    <CardBody p={0}>
                      <Box 
                        position="relative" 
                        w="100%" 
                        h={{ base: "50vh", md: "60vh" }}
                        bg="black"
                        borderRadius="xl"
                        overflow="hidden"
                      >
                        <QrReader
                          onResult={(result, error) => {
                            if (result) {
                              handleScan(result.text);
                            }
                            // Manejar errores de forma silenciosa
                            handleQrError(error);
                          }}
                          constraints={{
                            facingMode: "environment"
                          }}
                          videoStyle={{ 
                            width: '100%', 
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          containerStyle={{ 
                            width: '100%', 
                            height: '100%'
                          }}
                          scanDelay={300}
                        />
                        <Viewfinder />
                        
                        {/* Overlay oscuro alrededor del viewfinder */}
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          bg="blackAlpha.600"
                          pointerEvents="none"
                          sx={{
                            maskImage: 'radial-gradient(ellipse 280px 280px at center, transparent 0%, transparent 40%, black 40%)',
                            WebkitMaskImage: 'radial-gradient(ellipse 280px 280px at center, transparent 0%, transparent 40%, black 40%)'
                          }}
                        />
                      </Box>
                    </CardBody>
                  </Card>
                  
                  <Text 
                    textAlign="center" 
                    color="gray.600" 
                    fontSize="sm" 
                    mt={4}
                    px={4}
                  >
                    Apunta la cámara hacia el código QR del ticket
                  </Text>
                </motion.div>
              )
            )}
          </VStack>
        </motion.div>
      </Container>
    </LayoutWrapper>
  );
}
