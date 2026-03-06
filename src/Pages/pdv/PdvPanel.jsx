import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Icon,
  Badge,
  Stack,
  Card,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast,
  Divider,
  Image,
} from "@chakra-ui/react";
import { MdArrowBack, MdPrint, MdEmail, MdCheckCircle, MdLogout, MdStorefront } from "react-icons/md";
import ticketApi from "../../Api/ticket";
import pointOfSaleApi from "../../Api/pointOfSale";
import { useAuth } from "../../auth/context/AuthContext";
import ThermalTicket from "../../components/ThermalTicket/ThermalTicket";

const PDV_PAYMENT_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercadopago", label: "Mercado Pago" },
];

const PdvPanel = () => {
  const { pdvId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();
  const printRef = useRef(null);

  const [pdv, setPdv] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [eventTickets, setEventTickets] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [pdvPaymentType, setPdvPaymentType] = useState("efectivo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [customerData, setCustomerData] = useState({ email: "", firstname: "", lastname: "" });

  const [lastSale, setLastSale] = useState(null);

  const { isOpen: isSaleOpen, onOpen: onSaleOpen, onClose: onSaleClose } = useDisclosure();
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();

  useEffect(() => {
    if (pdvId) loadPanel();
  }, [pdvId]);

  const loadPanel = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await pointOfSaleApi.getPointOfSalePanel(pdvId);
      setPdv(data.pointOfSale);
      setEvents(data.events || []);
    } catch (err) {
      console.error("Error loading PDV panel:", err);
      setError(err.response?.data?.message || "No se pudo cargar el punto de venta o no tenés acceso");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSale = (event) => {
    const available = (event.tickets || []).filter((t) => t.available > 0);
    if (available.length === 0) {
      toast({ title: "Sin disponibilidad", description: "No hay entradas disponibles para este evento", status: "warning", duration: 3000 });
      return;
    }
    setSelectedEvent(event);
    setEventTickets(available);
    setSelectedTicket(null);
    setQuantity(1);
    setCustomerData({ email: "", firstname: "", lastname: "" });
    setPdvPaymentType("efectivo");
    onSaleOpen();
  };

  const handleCloseSale = () => {
    setSelectedEvent(null);
    setSelectedTicket(null);
    setEventTickets([]);
    setQuantity(1);
    setCustomerData({ email: "", firstname: "", lastname: "" });
    onSaleClose();
  };

  const handlePurchase = async () => {
    if (!selectedEvent || !selectedTicket || !customerData.email) {
      toast({ title: "Completá los datos", description: "Email del cliente y tipo de entrada son requeridos", status: "error", duration: 3000 });
      return;
    }
    try {
      setIsProcessing(true);
      const { data } = await ticketApi.sellTicket({
        eventId: selectedEvent._id,
        ticketId: selectedTicket._id,
        quantity,
        customerEmail: customerData.email,
        customerFirstname: customerData.firstname,
        customerLastname: customerData.lastname,
        pointOfSaleId: pdvId,
        pdvPaymentType,
      });

      setLastSale({
        paymentId: data.paymentId,
        eventName: selectedEvent.title,
        ticketType: selectedTicket.title,
        quantity,
        total: selectedTicket.price * quantity,
        customerName: [customerData.firstname, customerData.lastname].filter(Boolean).join(" ") || customerData.email,
        customerEmail: customerData.email,
        paymentType: pdvPaymentType,
        qrImages: data.qrImages || [],
        pdvName: pdv?.name,
      });

      onSaleClose();
      onSuccessOpen();
      loadPanel();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "No se pudo procesar la venta";
      toast({ title: "Error en la venta", description: msg, status: "error", duration: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResendEmail = async () => {
    if (!lastSale?.paymentId) return;
    try {
      setIsResending(true);
      await ticketApi.resendPdvSaleEmail(lastSale.paymentId);
      toast({ title: "Email reenviado", description: `Se reenvió el ticket a ${lastSale.customerEmail}`, status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error al reenviar", description: err.response?.data?.message || "No se pudo reenviar", status: "error", duration: 3000 });
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/pdv/login");
  };

  if (loading) {
    return (
      <Flex minH="100vh" bg="gray.50" align="center" justify="center">
        <Spinner size="xl" color="black" />
      </Flex>
    );
  }

  if (error || !pdv) {
    return (
      <Flex minH="100vh" bg="gray.50" direction="column">
        <Box bg="black" px={6} py={4}>
          <Text color="white" fontWeight="bold" fontSize="lg">GETPASS</Text>
        </Box>
        <Container maxW="600px" py={8} px={4}>
          <Alert status="error" borderRadius="xl" mb={4}>
            <AlertIcon />
            {error || "Punto de venta no encontrado o sin acceso"}
          </Alert>
          <Button leftIcon={<Icon as={MdArrowBack} />} onClick={() => navigate("/pdv")}>
            Volver
          </Button>
        </Container>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="gray.50" direction="column">
      <Box bg="black" px={6} py={4}>
        <Flex align="center" justify="space-between" maxW="700px" mx="auto">
          <HStack spacing={3}>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              leftIcon={<Icon as={MdArrowBack} />}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => navigate("/pdv")}
            >
              Puntos de venta
            </Button>
            <Text color="gray.400" display={{ base: "none", sm: "block" }}>›</Text>
            <Text color="white" fontWeight="600" display={{ base: "none", sm: "block" }}>
              {pdv.name}
            </Text>
          </HStack>
          <Button
            size="sm"
            variant="ghost"
            color="white"
            leftIcon={<Icon as={MdLogout} />}
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={handleLogout}
          >
            Salir
          </Button>
        </Flex>
      </Box>

      <Container maxW="700px" py={6} px={4} flex="1">
        <VStack spacing={6} align="stretch">
          <Box>
            <HStack mb={1}>
              <Icon as={MdStorefront} color="gray.500" />
              <Heading size="md">{pdv.name}</Heading>
              {pdv.code && <Badge colorScheme="gray">{pdv.code}</Badge>}
            </HStack>
            <Text color="gray.500" fontSize="sm">
              Seleccioná un evento para registrar una venta
            </Text>
          </Box>

          {events.length === 0 ? (
            <Box bg="white" borderRadius="2xl" p={8} textAlign="center" boxShadow="sm">
              <Text color="gray.500">No hay eventos disponibles para vender en este punto de venta.</Text>
            </Box>
          ) : (
            <Stack spacing={3}>
              {events.map((event) => {
                const totalAvailable = (event.tickets || []).reduce((s, t) => s + t.available, 0);
                const hasSome = totalAvailable > 0;
                return (
                  <Card key={event._id} borderRadius="2xl" boxShadow="sm" opacity={hasSome ? 1 : 0.55}>
                    <CardBody>
                      <Flex
                        justify="space-between"
                        align={{ base: "flex-start", sm: "center" }}
                        direction={{ base: "column", sm: "row" }}
                        gap={4}
                      >
                        <Box flex="1">
                          <Text fontWeight="700" mb={1}>{event.title}</Text>
                          {event.addressRef && (
                            <Text color="gray.500" fontSize="sm" mb={1}>
                              {event.addressRef.province}, {event.addressRef.locality}
                            </Text>
                          )}
                          <Text color={hasSome ? "green.600" : "red.400"} fontSize="sm" fontWeight="500">
                            {hasSome ? `${totalAvailable} entradas disponibles` : "Sin disponibilidad"}
                          </Text>
                        </Box>
                        <Button
                          bg="black"
                          color="white"
                          borderRadius="xl"
                          size="md"
                          _hover={{ bg: "#1a1a1a", transform: "translateY(-1px)" }}
                          _active={{ transform: "translateY(0)" }}
                          transition="all 0.2s"
                          isDisabled={!hasSome}
                          w={{ base: "100%", sm: "auto" }}
                          onClick={() => handleOpenSale(event)}
                        >
                          Vender
                        </Button>
                      </Flex>
                    </CardBody>
                  </Card>
                );
              })}
            </Stack>
          )}
        </VStack>
      </Container>

      {/* Modal de venta */}
      <Modal isOpen={isSaleOpen} onClose={handleCloseSale} size={{ base: "full", sm: "lg" }} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius={{ base: 0, sm: "2xl" }}>
          <ModalHeader borderBottomWidth="1px" pb={4}>
            <Text fontSize="md">{selectedEvent?.title}</Text>
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Nueva venta</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Tipo de entrada</FormLabel>
                <Select
                  placeholder="Elegir entrada"
                  value={selectedTicket?._id || ""}
                  onChange={(e) => {
                    const t = eventTickets.find((x) => x._id === e.target.value);
                    setSelectedTicket(t || null);
                    setQuantity(1);
                  }}
                  borderRadius="lg"
                >
                  {eventTickets.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title} — ${t.price} ({t.available} disponibles)
                    </option>
                  ))}
                </Select>
              </FormControl>

              {selectedTicket && (
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Cantidad</FormLabel>
                  <NumberInput min={1} max={selectedTicket.available} value={quantity} onChange={(v) => {
                    const n = parseInt(v, 10);
                    if (!isNaN(n) && n >= 1 && n <= selectedTicket.available) setQuantity(n);
                  }}>
                    <NumberInputField borderRadius="lg" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel fontSize="sm">Medio de pago</FormLabel>
                <Select value={pdvPaymentType} onChange={(e) => setPdvPaymentType(e.target.value)} borderRadius="lg">
                  {PDV_PAYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              <FormControl isRequired>
                <FormLabel fontSize="sm">Email del cliente</FormLabel>
                <Input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="cliente@email.com"
                  borderRadius="lg"
                />
              </FormControl>
              <Flex gap={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Nombre</FormLabel>
                  <Input
                    value={customerData.firstname}
                    onChange={(e) => setCustomerData((p) => ({ ...p, firstname: e.target.value }))}
                    placeholder="Nombre"
                    borderRadius="lg"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Apellido</FormLabel>
                  <Input
                    value={customerData.lastname}
                    onChange={(e) => setCustomerData((p) => ({ ...p, lastname: e.target.value }))}
                    placeholder="Apellido"
                    borderRadius="lg"
                  />
                </FormControl>
              </Flex>

              {selectedTicket && (
                <Box bg="gray.50" borderRadius="xl" p={4}>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">Precio unitario</Text>
                    <Text fontSize="sm">${selectedTicket.price}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="sm" color="gray.600">Cantidad</Text>
                    <Text fontSize="sm">{quantity}</Text>
                  </Flex>
                  <Divider my={2} />
                  <Flex justify="space-between">
                    <Text fontWeight="700">Total</Text>
                    <Text fontWeight="700" fontSize="lg">${selectedTicket.price * quantity}</Text>
                  </Flex>
                </Box>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" gap={3}>
            <Button variant="ghost" onClick={handleCloseSale} borderRadius="xl">
              Cancelar
            </Button>
            <Button
              bg="black"
              color="white"
              borderRadius="xl"
              flex="1"
              _hover={{ bg: "#1a1a1a" }}
              isDisabled={!selectedTicket || !customerData.email}
              isLoading={isProcessing}
              onClick={handlePurchase}
            >
              Confirmar venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de venta exitosa */}
      <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} size={{ base: "full", sm: "md" }} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: 0, sm: "2xl" }}>
          <ModalBody py={8}>
            {lastSale && (
              <VStack spacing={6}>
                <Flex
                  w="72px"
                  h="72px"
                  bg="green.50"
                  borderRadius="full"
                  align="center"
                  justify="center"
                >
                  <Icon as={MdCheckCircle} boxSize={10} color="green.500" />
                </Flex>

                <Box textAlign="center">
                  <Heading size="md" mb={1}>¡Venta registrada!</Heading>
                  <Text color="gray.500" fontSize="sm">
                    Los tickets se enviaron por email al cliente
                  </Text>
                </Box>

                <Box w="full" bg="gray.50" borderRadius="xl" p={4}>
                  <Stack spacing={2}>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Evento</Text>
                      <Text fontSize="sm" fontWeight="500" maxW="60%" textAlign="right">{lastSale.eventName}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Entrada</Text>
                      <Text fontSize="sm">{lastSale.ticketType}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Cantidad</Text>
                      <Text fontSize="sm">{lastSale.quantity}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Cliente</Text>
                      <Text fontSize="sm">{lastSale.customerEmail}</Text>
                    </Flex>
                    <Divider />
                    <Flex justify="space-between">
                      <Text fontWeight="700">Total</Text>
                      <Text fontWeight="700">${lastSale.total}</Text>
                    </Flex>
                  </Stack>
                </Box>

                {lastSale.qrImages?.length > 0 && (
                  <Box w="full">
                    <Text fontSize="sm" color="gray.500" textAlign="center" mb={3}>
                      QR{lastSale.qrImages.length > 1 ? "s" : ""} de la venta:
                    </Text>
                    <Flex wrap="wrap" justify="center" gap={2}>
                      {lastSale.qrImages.map((qr, i) => (
                        <Image key={i} src={qr} alt={`QR ${i + 1}`} w="100px" h="100px" borderRadius="lg" />
                      ))}
                    </Flex>
                  </Box>
                )}

                <Stack w="full" spacing={3}>
                  <Button
                    w="full"
                    bg="black"
                    color="white"
                    borderRadius="xl"
                    leftIcon={<Icon as={MdPrint} />}
                    _hover={{ bg: "#1a1a1a" }}
                    onClick={handlePrint}
                  >
                    Imprimir ticket
                  </Button>
                  <Button
                    w="full"
                    variant="outline"
                    borderRadius="xl"
                    leftIcon={<Icon as={MdEmail} />}
                    isLoading={isResending}
                    onClick={handleResendEmail}
                  >
                    Reenviar email al cliente
                  </Button>
                  <Button
                    w="full"
                    variant="ghost"
                    borderRadius="xl"
                    onClick={onSuccessClose}
                  >
                    Nueva venta
                  </Button>
                </Stack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Componente de impresión térmica (invisible en pantalla) */}
      {lastSale && (
        <ThermalTicket
          printRef={printRef}
          tickets={lastSale.qrImages}
          eventName={lastSale.eventName}
          ticketType={lastSale.ticketType}
          customerName={lastSale.customerName}
          customerEmail={lastSale.customerEmail}
          quantity={lastSale.quantity}
          total={lastSale.total}
          pdvName={lastSale.pdvName}
          paymentType={lastSale.paymentType}
        />
      )}
    </Flex>
  );
};

export default PdvPanel;
