import React, { useState, useRef, useEffect } from "react";
import {
  Box, Container, Flex, Heading, Text, Button, Spinner, Icon, VStack, HStack,
  Badge, Modal, ModalOverlay, ModalContent, ModalBody, ModalHeader, ModalCloseButton,
  useDisclosure, useToast, Alert, AlertIcon, Image, Divider,
} from "@chakra-ui/react";
import { QrReader } from "react-qr-reader";
import { useNavigate, useParams } from "react-router-dom";
import { MdLocalBar, MdArrowBack, MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";
import { FiCheckCircle, FiCamera } from "react-icons/fi";
import { qrApi } from "../../Api/qr";
import { useAuth } from "../../auth/context/AuthContext";

const SCAN_COOLDOWN_MS = 2500;

const BarScanner = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [isScanning, setIsScanning] = useState(true);
  const [scannerKey, setScannerKey] = useState(0);
  const [hasPermission, setHasPermission] = useState(null);
  const [qrResult, setQrResult] = useState(null); // datos del QR escaneado
  const [loading, setLoading] = useState(false);
  const [delivering, setDelivering] = useState(null); // idx en proceso de entrega
  const lastScannedRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const streamRef = useRef(null);

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();

  useEffect(() => {
    requestCamera();
    return () => stopCamera();
  }, []);

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      setHasPermission(true);
    } catch {
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const handleScan = async (result) => {
    if (!result?.text) return;
    const qrId = result.text.trim();
    const now = Date.now();
    if (qrId === lastScannedRef.current && now - lastScanTimeRef.current < SCAN_COOLDOWN_MS) return;
    lastScannedRef.current = qrId;
    lastScanTimeRef.current = now;

    setLoading(true);
    setIsScanning(false);
    try {
      const { data } = await qrApi.getQrInfoBar(qrId);
      if (!data?.ok) {
        toast({ title: "QR inválido", status: "error", duration: 2000 });
        resumeScanning();
        return;
      }
      setQrResult(data);
      onModalOpen();
    } catch {
      toast({ title: "Error al leer QR", status: "error", duration: 2000 });
      resumeScanning();
    } finally {
      setLoading(false);
    }
  };

  const resumeScanning = () => {
    lastScannedRef.current = null;
    setScannerKey((k) => k + 1);
    setIsScanning(true);
  };

  const handleClose = () => {
    onModalClose();
    setQrResult(null);
    resumeScanning();
  };

  const handleEntregar = async (idx) => {
    if (!qrResult?.paymentId) return;
    setDelivering(idx);
    try {
      const { data } = await qrApi.entregarConsumacion(qrResult.paymentId, idx);
      setQrResult((prev) => ({ ...prev, consumacionesOrden: data.consumacionesOrden }));
      toast({ title: "¡Entregado!", status: "success", duration: 1500 });
    } catch {
      toast({ title: "Error al registrar entrega", status: "error", duration: 2000 });
    } finally {
      setDelivering(null);
    }
  };

  const allDelivered =
    qrResult?.consumacionesOrden?.length > 0 &&
    qrResult.consumacionesOrden.every((c) => c.entregado);

  return (
    <Flex minH="100vh" bg="gray.900" direction="column">
      {/* Header */}
      <Box bg="black" px={6} py={4}>
        <Flex align="center" justify="space-between" maxW="600px" mx="auto">
          <HStack spacing={3}>
            <Button variant="ghost" size="sm" color="white" leftIcon={<Icon as={MdArrowBack} />}
              _hover={{ bg: "whiteAlpha.200" }} onClick={() => navigate("/bar-scanner")}>
              Eventos
            </Button>
          </HStack>
          <HStack spacing={2}>
            <Icon as={MdLocalBar} color="white" boxSize={5} />
            <Text color="white" fontWeight="bold" fontSize="md">Scanner de barra</Text>
          </HStack>
          <Box w="80px" />
        </Flex>
      </Box>

      <Container maxW="500px" py={6} px={4} flex="1" display="flex" flexDir="column" alignItems="center">
        {/* Camera area */}
        <Box
          w="full" maxW="360px" borderRadius="2xl" overflow="hidden" position="relative"
          bg="black" boxShadow="0 0 40px rgba(0,0,0,0.6)" aspectRatio="1"
        >
          {hasPermission === false && (
            <Flex h="full" align="center" justify="center" p={6} direction="column" gap={3} minH="300px">
              <Icon as={FiCamera} color="gray.400" boxSize={10} />
              <Text color="gray.400" textAlign="center" fontSize="sm">
                Sin acceso a la cámara. Habilitá los permisos e intentá de nuevo.
              </Text>
              <Button size="sm" colorScheme="purple" onClick={requestCamera}>Reintentar</Button>
            </Flex>
          )}

          {hasPermission === true && isScanning && (
            <Box position="relative" w="full" h="full" minH="300px">
              <QrReader
                key={scannerKey}
                onResult={handleScan}
                constraints={{ facingMode: "environment" }}
                containerStyle={{ width: "100%", height: "100%" }}
                videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Viewfinder overlay */}
              <Box
                position="absolute" top="50%" left="50%"
                transform="translate(-50%,-50%)"
                w="200px" h="200px" pointerEvents="none"
              >
                {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
                  <Box key={`${v}${h}`} position="absolute"
                    top={v === "top" ? 0 : "auto"} bottom={v === "bottom" ? 0 : "auto"}
                    left={h === "left" ? 0 : "auto"} right={h === "right" ? 0 : "auto"}
                    w="40px" h="40px"
                    borderTop={v === "top" ? "3px solid" : undefined}
                    borderBottom={v === "bottom" ? "3px solid" : undefined}
                    borderLeft={h === "left" ? "3px solid" : undefined}
                    borderRight={h === "right" ? "3px solid" : undefined}
                    borderColor="orange.400"
                    borderRadius={v === "top" && h === "left" ? "lg 0 0 0" : v === "top" && h === "right" ? "0 lg 0 0" : v === "bottom" && h === "left" ? "0 0 0 lg" : "0 0 lg 0"}
                  />
                ))}
              </Box>
            </Box>
          )}

          {loading && (
            <Flex position="absolute" inset={0} align="center" justify="center" bg="blackAlpha.700">
              <Spinner size="xl" color="orange.400" thickness="4px" />
            </Flex>
          )}
        </Box>

        <Text color="gray.400" mt={4} fontSize="sm" textAlign="center">
          Apuntá la cámara al QR del cliente
        </Text>
      </Container>

      {/* Modal de entrega — no se cierra hasta que el operador lo cierre */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {}}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        isCentered
        size={{ base: "full", sm: "md" }}
      >
        <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(6px)" />
        <ModalContent borderRadius={{ base: 0, sm: "2xl" }} overflow="hidden" mx={{ base: 0, sm: 4 }}>
          <ModalHeader
            bg={allDelivered ? "green.500" : qrResult?.consumacionesOrden?.length > 0 ? "orange.500" : "gray.800"}
            color="white" py={4} px={6}
            transition="background-color 0.4s"
          >
            <VStack align="start" spacing={0}>
              <HStack spacing={2}>
                <Icon as={MdLocalBar} boxSize={5} />
                <Text fontWeight="800" fontSize="lg">
                  {allDelivered ? "Todo entregado ✓" : "Pedido del cliente"}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="400" opacity={0.85}>
                {qrResult?.customerName || qrResult?.customerEmail}
              </Text>
            </VStack>
          </ModalHeader>

          <ModalBody py={5} px={5}>
            <VStack spacing={4} align="stretch">
              {/* Info entrada */}
              <Box bg="gray.50" borderRadius="xl" px={4} py={3}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" letterSpacing="wide">
                      Tipo de entrada
                    </Text>
                    <Text fontWeight="700">{qrResult?.ticketTitle}</Text>
                  </VStack>
                  <Badge
                    colorScheme={qrResult?.entryChecked ? "orange" : "green"}
                    borderRadius="full" px={3} py={1} fontSize="xs"
                  >
                    {qrResult?.entryChecked ? "Ingresó" : "Aún no ingresó"}
                  </Badge>
                </HStack>
              </Box>

              {/* Consumaciones */}
              {qrResult?.consumacionesOrden?.length > 0 ? (
                <Box>
                  <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600"
                    letterSpacing="wide" mb={2}>
                    Consumaciones del pedido
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {qrResult.consumacionesOrden.map((item, idx) => (
                      <Flex key={idx} align="center" justify="space-between"
                        bg={item.entregado ? "green.50" : "white"}
                        border="1.5px solid"
                        borderColor={item.entregado ? "green.200" : "gray.200"}
                        borderRadius="xl" px={4} py={3}
                        transition="all 0.2s"
                      >
                        <HStack spacing={3} flex="1" minW={0}>
                          {item.imageUrl && (
                            <Image src={item.imageUrl} alt={item.name} w="40px" h="40px"
                              objectFit="cover" borderRadius="lg" flexShrink={0} />
                          )}
                          <Box>
                            <Text fontWeight="600" fontSize="sm" noOfLines={1}>{item.name}</Text>
                            <Text fontSize="xs" color="gray.500">x{item.quantity} · ${item.price * item.quantity}</Text>
                          </Box>
                        </HStack>

                        {item.entregado ? (
                          <HStack spacing={1} color="green.500">
                            <Icon as={MdCheckCircle} boxSize={5} />
                            <Text fontSize="xs" fontWeight="600">Entregado</Text>
                          </HStack>
                        ) : (
                          <Button
                            size="sm" bg="orange.500" color="white" borderRadius="lg"
                            _hover={{ bg: "orange.600" }}
                            isLoading={delivering === idx}
                            onClick={() => handleEntregar(idx)}
                            flexShrink={0}
                          >
                            Entregar
                          </Button>
                        )}
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              ) : (
                <Alert status="info" borderRadius="xl">
                  <AlertIcon />
                  <Text fontSize="sm">Este ticket no tiene consumaciones en el pedido.</Text>
                </Alert>
              )}

              <Divider />

              <Button
                size="lg" bg="black" color="white" borderRadius="xl" w="full"
                _hover={{ bg: "#1a1a1a" }}
                onClick={handleClose}
              >
                Cerrar
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default BarScanner;
