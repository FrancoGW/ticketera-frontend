import React, { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Stack,
  Card,
  CardBody,
  Text,
  Button,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
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
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Link,
} from "@chakra-ui/react";
import ticketApi from "../../Api/ticket";
import pointOfSaleApi from "../../Api/pointOfSale";

const PDV_PAYMENT_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercadopago", label: "Mercado Pago" },
];

const SellerPuntoVentaPanel = () => {
  const { pdvId } = useParams();
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
  const [customerData, setCustomerData] = useState({ email: "", firstname: "", lastname: "" });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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
      console.error("Error loading panel:", err);
      setError(err.response?.data?.message || "No se pudo cargar el punto de venta");
      toast({ title: "Error", description: "No tenés acceso o el PDV no existe", status: "error", duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setQuantity(1);
  };

  const handleQuantityChange = (value) => {
    const n = parseInt(value, 10);
    if (!isNaN(n) && selectedTicket && n >= 1 && n <= selectedTicket.available) setQuantity(n);
  };

  const handlePurchase = async () => {
    if (!selectedEvent || !selectedTicket || !customerData.email) {
      toast({ title: "Error", description: "Completá email del cliente y seleccioná un ticket", status: "error", duration: 3000 });
      return;
    }
    try {
      setIsProcessing(true);
      await ticketApi.sellTicket({
        eventId: selectedEvent._id,
        ticketId: selectedTicket._id,
        quantity,
        customerEmail: customerData.email,
        customerFirstname: customerData.firstname,
        customerLastname: customerData.lastname,
        pointOfSaleId: pdvId,
        pdvPaymentType: pdvPaymentType || "efectivo",
      });
      toast({ title: "Venta registrada", description: "Las entradas se enviaron al email del cliente", status: "success", duration: 3000 });
      onClose();
      loadPanel();
      setCustomerData({ email: "", firstname: "", lastname: "" });
      setSelectedTicket(null);
      setQuantity(1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "No se pudo procesar la venta";
      toast({ title: "Error", description: msg, status: "error", duration: 4000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedTicket(null);
    setEventTickets([]);
    setQuantity(1);
    setCustomerData({ email: "", firstname: "", lastname: "" });
    onClose();
  };

  const handleOpenTickets = (event) => {
    if (!event?.tickets) return;
    const available = event.tickets.filter((t) => t.available > 0);
    if (available.length === 0) {
      toast({ title: "Sin disponibilidad", status: "warning", duration: 3000 });
      return;
    }
    setSelectedEvent(event);
    setEventTickets(available);
    onOpen();
  };

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center"><Spinner size="xl" /></Flex>
      </Container>
    );
  }

  if (error || !pdv) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error"><AlertIcon />{error || "Punto de venta no encontrado"}</Alert>
        <Button as={RouterLink} to="/seller/punto-venta" mt={4}>Volver a Punto de venta</Button>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Flex align="center" justify="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Link as={RouterLink} to="/seller/punto-venta" color="blue.500" fontSize="sm" mb={2} display="inline-block">
              ← Volver a puntos de venta
            </Link>
            <Heading fontSize={{ base: "xl", md: "2xl" }}>
              Panel: {pdv.name}
              {pdv.code && <Text as="span" fontWeight="normal" color="gray.500" fontSize="lg" ml={2}>({pdv.code})</Text>}
            </Heading>
            <Text color="gray.600" mt={1}>
              Todas las ventas que registres acá quedarán asociadas a este punto de venta.
            </Text>
          </Box>
        </Flex>

        <Stack spacing={4}>
          {events.length === 0 ? (
            <Text color="gray.500">No hay eventos disponibles para vender en este punto de venta.</Text>
          ) : (
            events.map((event) => (
              <Card key={event._id}>
                <CardBody>
                  <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} direction={{ base: "column", sm: "row" }} gap={4}>
                    <Box flex="1">
                      <Heading size="sm" mb={2}>{event.title}</Heading>
                      {event.addressRef && (
                        <Text color="gray.600" fontSize="sm" mb={1}>{event.addressRef.province}, {event.addressRef.locality}</Text>
                      )}
                      <Text color="gray.500" fontSize="sm">
                        Entradas disponibles: {event.tickets?.reduce((sum, t) => sum + t.available, 0) ?? 0}
                      </Text>
                    </Box>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleOpenTickets(event)}
                      isDisabled={!event.tickets?.some((t) => t.available > 0)}
                      w={{ base: "100%", sm: "auto" }}
                    >
                      Vender entradas
                    </Button>
                  </Flex>
                </CardBody>
              </Card>
            ))
          )}
        </Stack>
      </Stack>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedEvent?.title} — Vender entradas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Medio de pago del cliente</FormLabel>
                <Select value={pdvPaymentType} onChange={(e) => setPdvPaymentType(e.target.value)}>
                  {PDV_PAYMENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email del cliente</FormLabel>
                <Input name="email" type="email" value={customerData.email} onChange={handleInputChange} placeholder="cliente@ejemplo.com" />
              </FormControl>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input name="firstname" value={customerData.firstname} onChange={handleInputChange} placeholder="Nombre" />
              </FormControl>
              <FormControl>
                <FormLabel>Apellido</FormLabel>
                <Input name="lastname" value={customerData.lastname} onChange={handleInputChange} placeholder="Apellido" />
              </FormControl>
              {eventTickets.length > 0 && (
                <FormControl isRequired>
                  <FormLabel>Tipo de entrada</FormLabel>
                  <Select
                    placeholder="Elegir ticket"
                    value={selectedTicket?._id || ""}
                    onChange={(e) => handleTicketSelect(eventTickets.find((t) => t._id === e.target.value))}
                  >
                    {eventTickets.map((t) => (
                      <option key={t._id} value={t._id}>{t.title} — $ {t.price} ({t.available} disponibles)</option>
                    ))}
                  </Select>
                </FormControl>
              )}
              {selectedTicket && (
                <>
                  <FormControl isRequired>
                    <FormLabel>Cantidad</FormLabel>
                    <NumberInput min={1} max={selectedTicket.available} value={quantity} onChange={handleQuantityChange}>
                      <NumberInputField />
                      <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <Flex justify="space-between" fontWeight="bold">
                    <Text>Total:</Text>
                    <Text>$ {selectedTicket.price * quantity}</Text>
                  </Flex>
                </>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>Cancelar</Button>
            <Button colorScheme="blue" onClick={handlePurchase} isDisabled={!selectedTicket || !customerData.email} isLoading={isProcessing}>
              Confirmar venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SellerPuntoVentaPanel;
