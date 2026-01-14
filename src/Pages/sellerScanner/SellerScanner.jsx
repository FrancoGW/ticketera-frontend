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
      
      // Función para construir URL completa
      const buildScannerUrl = () => {
        const scannerPath = '/validator/qr-scanner';
        const token = localStorage.getItem('token');
        
        return token 
          ? `${FRONTEND_BASE_URL}${scannerPath}?token=${encodeURIComponent(token)}` 
          : `${FRONTEND_BASE_URL}${scannerPath}`;
      };
      
      // Intentar obtener la URL desde la API, pero validarla antes de usarla
      try {
        const { data } = await qrApi.getScannerUrl();
        if (data?.validatorUrl) {
          if (isValidUrl(data.validatorUrl)) {
            // Si la URL es válida y completa, usarla directamente
            if (data.validatorUrl.startsWith('http://') || data.validatorUrl.startsWith('https://')) {
              setScannerUrl(data.validatorUrl);
              return;
            }
            // Si es un path válido, construirla completa
            if (data.validatorUrl.startsWith('/')) {
              setScannerUrl(`${FRONTEND_BASE_URL}${data.validatorUrl}`);
              return;
            }
          } else {
            // La API devolvió una URL inválida (probablemente contiene "undefined")
            console.warn('⚠️ API devolvió URL inválida o mal formada:', data.validatorUrl);
            console.warn('Construyendo URL manualmente desde el frontend');
          }
        }
      } catch (apiError) {
        console.log('API no devolvió URL válida, construyendo manualmente');
      }
      
      // Intentar generar token de validador
      try {
        const validatorResponse = await qrApi.generateValidatorUrl();
        const urlFromApi = validatorResponse?.data?.validatorUrl || validatorResponse?.data?.url;
        if (urlFromApi && isValidUrl(urlFromApi)) {
          if (urlFromApi.startsWith('http://') || urlFromApi.startsWith('https://')) {
            setScannerUrl(urlFromApi);
            return;
          }
          if (urlFromApi.startsWith('/')) {
            setScannerUrl(`${FRONTEND_BASE_URL}${urlFromApi}`);
            return;
          }
        }
      } catch (validatorError) {
        console.log('No se pudo generar token de validador');
      }
      
      // Construir URL manualmente (siempre funciona)
      const finalUrl = buildScannerUrl();
      setScannerUrl(finalUrl);
      
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
              Comparte este enlace con tus validadores para que puedan escanear los códigos QR de los tickets
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
                          Comparte este enlace con tus validadores
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
                    Comparte este enlace único con tus validadores o personal de entrada. 
                    Ellos podrán escanear los códigos QR de los tickets directamente desde sus dispositivos móviles. 
                    El enlace es privado y solo tú puedes acceder a él.
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
