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
  Flex
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { qrApi } from "../../Api/qr";
import { getObjDate } from "../../common/utils";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

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

  return (
    <Badge 
      size="lg" 
      colorScheme={getStatusColor(qrState)}
      p={3}
      borderRadius="md"
      fontSize="lg"
    >
      {getStatusText(qrState)}
    </Badge>
  );
};

export default function Scanner() {
  const [qrInfo, setQrInfo] = useState(null);
  const [qrInfoLoading, setQrInfoLoading] = useState(false);
  const [qrStateLoading, setQrStateLoading] = useState(false);
  const [qrState, setQrState] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const lastScannedQR = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    checkValidatorPermissions();
    requestCameraPermission();
  }, []);

  const checkValidatorPermissions = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwt_decode(token);
      if (decoded.rol === 'validator') {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos de validador",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      }
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
      const token = localStorage.getItem('token');
      const { data } = await qrApi.getQrInfo(qrId, token);
      setQrInfo(data);
      
      // Sonido de éxito al escanear
      new Audio('/assets/sounds/beep.mp3').play().catch(e => console.log('Error reproduciendo sonido:', e));
      
    } catch (error) {
      console.error('Error obteniendo información del QR:', error);
      toast({
        title: "Error",
        description: "No se pudo obtener la información del ticket",
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
      const token = localStorage.getItem('token');
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
        description: "Error al validar el ticket",
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const objDate = getObjDate(dateString);
    return `${objDate.date} - Inicio: ${objDate.timeStart} - Fin: ${objDate.timeEnd}`;
  };

  if (!hasPermission) {
    return (
      <>
        <Header />
        <Container maxW="container.md" py={8} marginTop={300}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error de cámara</AlertTitle>
            <AlertDescription>
              No se pudo acceder a la cámara. Por favor, verifica los permisos en tu navegador.
            </AlertDescription>
          </Alert>
          <Button 
            mt={4} 
            onClick={() => window.location.reload()}
            colorScheme="blue"
          >
            Reintentar
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <Container maxW="container.md" py={8} marginTop={40}>
        <Heading 
          size="lg" 
          textAlign="center" 
          mb={6}
          color="Black"
          fontFamily="Monument Extended"
        >
          Escanea un QR
        </Heading>

        {qrInfoLoading ? (
          <Center h="50vh">
            <VStack spacing={4}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
              <Text>Procesando ticket...</Text>
            </VStack>
          </Center>
        ) : qrInfo ? (
          <VStack spacing={6} align="stretch">
            <Box p={6} borderWidth={1} borderRadius="lg" bg="white" shadow="md">
              <VStack spacing={4}>
                <Heading size="md" textAlign="center">
                  Información del Ticket
                </Heading>
                
                <Box w="100%">
                  <Text fontWeight="bold">Evento:</Text>
                  <Text>{qrInfo.eventTitle}</Text>
                </Box>

                <Box w="100%">
                  <Text fontWeight="bold">Fecha:</Text>
                  <Text>{formatDate(qrInfo.eventDate)}</Text>
                </Box>

                <Box w="100%">
                  <Text fontWeight="bold">Tipo de Ticket:</Text>
                  <Text>{qrInfo.ticketTitle}</Text>
                </Box>

                {qrState && (
                  <Flex justify="center" w="100%" py={4}>
                    <QrStatus qrState={qrState} />
                  </Flex>
                )}

                <Button
                  onClick={validateTicket}
                  isLoading={qrStateLoading}
                  colorScheme="teal"
                  isDisabled={!!qrState}
                  w="100%"
                >
                  Validar Ticket
                </Button>

                <Button
                  onClick={resetScanner}
                  colorScheme="purple"
                  w="100%"
                >
                  Escanear Otro Ticket
                </Button>
              </VStack>
            </Box>
          </VStack>
        ) : (
          isScanning && (
            <Box borderRadius="lg" overflow="hidden" shadow="md">
              <QrReader
                onResult={(result, error) => {
                  if (result) {
                    handleScan(result.text);
                  }
                  if (error && !error.message?.includes('video')) {
                    console.error("Error QR:", error);
                  }
                }}
                constraints={{
                  facingMode: "environment"
                }}
                videoStyle={{ width: '100%', height: '40vh' }}
                containerStyle={{ width: '100%', height: '40vh' }}
              />
            </Box>
          )
        )}
      </Container>
      <Footer />
    </>
  );
}