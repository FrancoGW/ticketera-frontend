import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useToast,
  Spinner,
  Center,
  Card,
  CardBody,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Badge,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { RiQrScanLine } from 'react-icons/ri';
import { qrApi } from '../../Api/qr';

const SellerScanner = () => {
  const [scannerUrl, setScannerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  
  // URL base del frontend
  const FRONTEND_BASE_URL = 'https://ticketera-frontend-swart.vercel.app';

  useEffect(() => {
    loadScannerUrl();
  }, []);

  const loadScannerUrl = async () => {
    try {
      setIsLoading(true);
      
      // Función para validar si una URL es válida
      const isValidUrl = (url) => {
        if (!url || typeof url !== 'string') return false;
        // Rechazar URLs que contengan "undefined"
        if (url.includes('undefined')) return false;
        // Aceptar URLs completas (http/https)
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return true;
        }
        // Aceptar paths que empiecen con /
        if (url.startsWith('/')) {
          return true;
        }
        return false;
      };
      
      // PRIORIDAD 1: Generar token de validador (requiere autenticación)
      // El endpoint /qr/generate-validator requiere Authorization: Bearer ${userToken}
      // y devuelve { token: "...", expiresIn: 7200 }
      try {
        const validatorResponse = await qrApi.generateValidatorUrl();
        console.log('Respuesta de generateValidatorUrl:', validatorResponse);
        
        // El backend devuelve { token: "...", expiresIn: 7200 }
        if (validatorResponse?.data?.token) {
          const validatorToken = validatorResponse.data.token;
          const expiresIn = validatorResponse.data.expiresIn || 7200; // 2 horas por defecto
          const scannerPath = '/validator/qr-scanner';
          const finalUrl = `${FRONTEND_BASE_URL}${scannerPath}?token=${encodeURIComponent(validatorToken)}`;
          setScannerUrl(finalUrl);
          
          // Guardar información del token para referencia
          console.log(`✅ Token de validador generado. Expira en ${expiresIn} segundos (${expiresIn / 3600} horas)`);
          return;
        }
      } catch (validatorError) {
        console.error('Error generando token de validador:', validatorError);
        toast({
          title: 'Error',
          description: validatorError?.response?.data?.message || 'No se pudo generar el token de validador. Verifica tu conexión o contacta al administrador.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // FALLBACK: Intentar obtener la URL desde otro endpoint (si existe)
      try {
        const { data } = await qrApi.getScannerUrl();
        if (data?.validatorUrl && isValidUrl(data.validatorUrl)) {
          if (data.validatorUrl.startsWith('http://') || data.validatorUrl.startsWith('https://')) {
            setScannerUrl(data.validatorUrl);
            return;
          }
          if (data.validatorUrl.startsWith('/')) {
            setScannerUrl(`${FRONTEND_BASE_URL}${data.validatorUrl}`);
            return;
          }
        }
      } catch (apiError) {
        console.log('Endpoint alternativo no disponible');
      }
      
      // Si no se pudo generar el token, mostrar error
      if (!scannerUrl) {
        toast({
          title: 'Error',
          description: 'No se pudo obtener el token de validador. Por favor, intenta nuevamente o contacta al administrador.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
      
    } catch (error) {
      console.error('Error cargando URL del scanner:', error);
      
      // Fallback: construir URL básica
      const finalUrl = buildScannerUrl();
      setScannerUrl(finalUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const copyUrl = () => {
    if (!scannerUrl) {
      toast({
        title: 'Error',
        description: 'No hay URL disponible para copiar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    navigator.clipboard.writeText(scannerUrl);
    toast({
      title: 'Enlace copiado',
      description: 'El enlace del scanner se ha copiado al portapapeles',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const openScanner = () => {
    if (!scannerUrl) {
      toast({
        title: 'Error',
        description: 'No hay URL disponible',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    window.open(scannerUrl, '_blank');
  };

  return (
    <Box
      w="100%"
      minH="calc(100vh - 80px)"
      bg="gray.50"
      py={{ base: 6, md: 8 }}
      px={{ base: 2, md: 0 }}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading
              as="h1"
              fontFamily="secondary"
              color="tertiary"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              mb={2}
            >
              Scanner de Tickets
            </Heading>
            <Text
              fontFamily="secondary"
              color="gray.600"
              fontSize="md"
            >
              Scanner para escanear solo los QRs de tus eventos. Compartí el enlace con tus validadores.
            </Text>
          </Box>

          {isLoading ? (
            <Center py={20}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="primary"
                size="xl"
              />
            </Center>
          ) : (
            <>
              {/* Card principal con el URL */}
              <Card
                boxShadow="lg"
                borderRadius="xl"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                overflow="hidden"
              >
                <CardBody p={{ base: 4, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    <Flex 
                      align={{ base: "flex-start", sm: "center" }} 
                      gap={3}
                      direction={{ base: "column", sm: "row" }}
                    >
                      <Box
                        p={3}
                        bg="linear-gradient(135deg, #b78dea 0%, #9d6dd8 100%)"
                        borderRadius="lg"
                        color="white"
                        flexShrink={0}
                      >
                        <RiQrScanLine size={24} />
                      </Box>
                      <Box flex="1" minW={0}>
                        <Text
                          fontFamily="secondary"
                          fontWeight="600"
                          fontSize="sm"
                          color="gray.500"
                          mb={1}
                        >
                          Enlace del Scanner
                        </Text>
                        <Text
                          fontFamily="secondary"
                          fontWeight="500"
                          fontSize={{ base: "md", md: "lg" }}
                          color="tertiary"
                        >
                          Solo valida QRs de tus eventos
                        </Text>
                      </Box>
                      <Badge
                        colorScheme="green"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        flexShrink={0}
                      >
                        Activo
                      </Badge>
                    </Flex>

                    <Box>
                      <InputGroup size="lg">
                        <Input
                          value={scannerUrl}
                          readOnly
                          fontFamily="secondary"
                          bg="gray.50"
                          borderColor="gray.300"
                          fontSize={{ base: "sm", md: "md" }}
                          pr={{ base: "100px", md: "120px" }}
                          _focus={{
                            borderColor: "primary",
                            boxShadow: "0 0 0 1px primary"
                          }}
                          overflow="hidden"
                          textOverflow="ellipsis"
                        />
                        <InputRightElement 
                          width="auto" 
                          pr={2}
                          h="100%"
                        >
                          <HStack spacing={1}>
                            <IconButton
                              icon={<FiCopy />}
                              aria-label="Copiar enlace"
                              onClick={copyUrl}
                              colorScheme="primary"
                              variant="ghost"
                              size="sm"
                              _hover={{ bg: "primary.100", color: "primary.600" }}
                            />
                            <IconButton
                              icon={<FiExternalLink />}
                              aria-label="Abrir scanner"
                              onClick={openScanner}
                              colorScheme="primary"
                              variant="ghost"
                              size="sm"
                              _hover={{ bg: "primary.100", color: "primary.600" }}
                            />
                          </HStack>
                        </InputRightElement>
                      </InputGroup>
                      {scannerUrl && (
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          mt={2}
                          fontFamily="secondary"
                          wordBreak="break-all"
                        >
                          {scannerUrl}
                        </Text>
                      )}
                    </Box>

                    <HStack 
                      spacing={4} 
                      flexWrap="wrap"
                      justify={{ base: "stretch", sm: "flex-start" }}
                    >
                      <Button
                        leftIcon={<FiCopy />}
                        onClick={copyUrl}
                        bg="primary"
                        color="white"
                        _hover={{
                          bg: "buttonHover",
                          transform: "translateY(-2px)",
                          boxShadow: "lg"
                        }}
                        fontFamily="secondary"
                        fontWeight="500"
                        px={6}
                        py={6}
                        borderRadius="lg"
                        transition="all 0.2s"
                        w={{ base: "100%", sm: "auto" }}
                        minW={{ base: "auto", sm: "160px" }}
                      >
                        Copiar Enlace
                      </Button>
                      <Button
                        leftIcon={<FiExternalLink />}
                        onClick={openScanner}
                        variant="outline"
                        borderColor="primary"
                        color="primary"
                        _hover={{
                          bg: "primary",
                          color: "white",
                          transform: "translateY(-2px)",
                          boxShadow: "lg"
                        }}
                        fontFamily="secondary"
                        fontWeight="500"
                        px={6}
                        py={6}
                        borderRadius="lg"
                        transition="all 0.2s"
                        w={{ base: "100%", sm: "auto" }}
                        minW={{ base: "auto", sm: "160px" }}
                      >
                        Abrir Scanner
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Información adicional */}
              <Alert
                status="info"
                borderRadius="lg"
                bg="blue.50"
                border="1px solid"
                borderColor="blue.200"
              >
                <AlertIcon color="blue.500" />
                <Box flex="1">
                  <AlertTitle fontFamily="secondary" fontSize="md" mb={1}>
                    ¿Cómo funciona?
                  </AlertTitle>
                  <AlertDescription fontFamily="secondary" fontSize="sm" color="gray.700">
                    Este scanner valida únicamente los códigos QR de los tickets de tus eventos. 
                    Compartí el enlace con tus validadores o personal de entrada para que escaneen desde sus dispositivos.
                  </AlertDescription>
                </Box>
              </Alert>

              {/* Instrucciones */}
              <Card
                boxShadow="md"
                borderRadius="xl"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
              >
                <CardBody p={{ base: 4, md: 6 }}>
                  <VStack spacing={4} align="stretch">
                    <Heading
                      as="h3"
                      fontFamily="secondary"
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="600"
                      color="tertiary"
                    >
                      Instrucciones para validadores
                    </Heading>
                    <VStack spacing={3} align="stretch" pl={{ base: 2, md: 4 }}>
                      <Flex align="start" gap={3}>
                        <Badge
                          bg="primary"
                          color="white"
                          borderRadius="full"
                          w={6}
                          h={6}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          flexShrink={0}
                          mt={0.5}
                        >
                          1
                        </Badge>
                        <Text 
                          fontFamily="secondary" 
                          fontSize={{ base: "sm", md: "sm" }} 
                          color="gray.700"
                          lineHeight="1.6"
                        >
                          Abre el enlace del scanner en tu dispositivo móvil
                        </Text>
                      </Flex>
                      <Flex align="start" gap={3}>
                        <Badge
                          bg="primary"
                          color="white"
                          borderRadius="full"
                          w={6}
                          h={6}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          flexShrink={0}
                          mt={0.5}
                        >
                          2
                        </Badge>
                        <Text 
                          fontFamily="secondary" 
                          fontSize={{ base: "sm", md: "sm" }} 
                          color="gray.700"
                          lineHeight="1.6"
                        >
                          Permite el acceso a la cámara cuando se solicite
                        </Text>
                      </Flex>
                      <Flex align="start" gap={3}>
                        <Badge
                          bg="primary"
                          color="white"
                          borderRadius="full"
                          w={6}
                          h={6}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          flexShrink={0}
                          mt={0.5}
                        >
                          3
                        </Badge>
                        <Text 
                          fontFamily="secondary" 
                          fontSize={{ base: "sm", md: "sm" }} 
                          color="gray.700"
                          lineHeight="1.6"
                        >
                          Apunta la cámara hacia el código QR del ticket
                        </Text>
                      </Flex>
                      <Flex align="start" gap={3}>
                        <Badge
                          bg="primary"
                          color="white"
                          borderRadius="full"
                          w={6}
                          h={6}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="xs"
                          fontWeight="bold"
                          flexShrink={0}
                          mt={0.5}
                        >
                          4
                        </Badge>
                        <Text 
                          fontFamily="secondary" 
                          fontSize={{ base: "sm", md: "sm" }} 
                          color="gray.700"
                          lineHeight="1.6"
                        >
                          El sistema validará automáticamente el ticket y mostrará su estado
                        </Text>
                      </Flex>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default SellerScanner;
