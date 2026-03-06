import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import eventApi from "../../Api/event";
import ticketApi from "../../Api/ticket";
import pointOfSaleApi from "../../Api/pointOfSale";
import { useAuth } from "../../auth/context/AuthContext";

const PDV_PAYMENT_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercadopago", label: "Mercado Pago" },
];

const SellerPuntoVenta = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [pointsOfSale, setPointsOfSale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [eventTickets, setEventTickets] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedPointOfSaleId, setSelectedPointOfSaleId] = useState("");
  const [pdvPaymentType, setPdvPaymentType] = useState("efectivo");

  const [customerData, setCustomerData] = useState({
    email: "",
    firstname: "",
    lastname: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenPdv, onOpen: onOpenPdv, onClose: onClosePdv } = useDisclosure();
  const { isOpen: isOpenAccess, onOpen: onOpenAccess, onClose: onCloseAccess } = useDisclosure();
  const [pdvForm, setPdvForm] = useState({ name: "", code: "" });
  const [pdvAccessEmail, setPdvAccessEmail] = useState("");
  const [selectedPdvForAccess, setSelectedPdvForAccess] = useState(null);
  const [savingPdv, setSavingPdv] = useState(false);
  const [savingAccess, setSavingAccess] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadEvents();
    loadPointsOfSale();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setQuantity(1);
  };

  const handleQuantityChange = (value) => {
    const newValue = parseInt(value, 10);
    if (!isNaN(newValue) && selectedTicket && newValue >= 1 && newValue <= selectedTicket.available) {
      setQuantity(newValue);
    }
  };

  const handlePurchase = async () => {
    if (!selectedEvent || !selectedTicket || !customerData.email) {
      toast({
        title: "Error",
        description: "Completá email del cliente y seleccioná un ticket",
        status: "error",
        duration: 3000,
      });
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
        pointOfSaleId: selectedPointOfSaleId || undefined,
        pdvPaymentType: pdvPaymentType || "efectivo",
      });
      toast({
        title: "Venta registrada",
        description: "Las entradas se enviaron al email del cliente",
        status: "success",
        duration: 3000,
      });
      onClose();
      loadEvents();
      resetForm();
    } catch (err) {
      console.error("Error en la compra:", err);
      const message = err.response?.data?.message || err.message || "No se pudo procesar la venta";
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setCustomerData({ email: "", firstname: "", lastname: "" });
    setSelectedTicket(null);
    setQuantity(1);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedTicket(null);
    setEventTickets([]);
    setQuantity(1);
    setCustomerData({ email: "", firstname: "", lastname: "" });
    onClose();
  };

  const loadPointsOfSale = async () => {
    try {
      const { data } = await pointOfSaleApi.getPointsOfSale();
      setPointsOfSale(data?.pointsOfSale || []);
    } catch (err) {
      console.error("Error loading points of sale:", err);
    }
  };

  const handleCreatePdv = async () => {
    if (!pdvForm.name?.trim()) {
      toast({ title: "Nombre requerido", status: "warning", duration: 2000 });
      return;
    }
    try {
      setSavingPdv(true);
      await pointOfSaleApi.createPointOfSale({ name: pdvForm.name.trim(), code: pdvForm.code?.trim() });
      toast({ title: "Punto de venta creado", status: "success", duration: 2000 });
      setPdvForm({ name: "", code: "" });
      onClosePdv();
      loadPointsOfSale();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "No se pudo crear",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSavingPdv(false);
    }
  };

  const handleDeletePdv = async (id) => {
    if (!window.confirm("¿Eliminar este punto de venta?")) return;
    try {
      await pointOfSaleApi.deletePointOfSale(id);
      toast({ title: "Eliminado", status: "success", duration: 2000 });
      loadPointsOfSale();
      if (selectedPointOfSaleId === id) setSelectedPointOfSaleId("");
    } catch (err) {
      toast({ title: "Error al eliminar", status: "error", duration: 3000 });
    }
  };

  const handleCreateDemoPdv = async () => {
    try {
      setSavingPdv(true);
      await pointOfSaleApi.createPointOfSale({
        name: "Boletería principal",
        code: "PDV-01",
      });
      toast({ title: "Punto de venta de ejemplo creado", status: "success", duration: 2000 });
      loadPointsOfSale();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "No se pudo crear",
        status: "error",
        duration: 3000,
      });
    } finally {
      setSavingPdv(false);
    }
  };

  const openAccessModal = (pdv) => {
    setSelectedPdvForAccess(pdv);
    setPdvAccessEmail("");
    onOpenAccess();
  };

  const handleAddAccess = async () => {
    if (!selectedPdvForAccess || !pdvAccessEmail?.trim()) {
      toast({ title: "Ingresá un email", status: "warning", duration: 2000 });
      return;
    }
    try {
      setSavingAccess(true);
      await pointOfSaleApi.addPdvAccess(selectedPdvForAccess._id, pdvAccessEmail.trim());
      toast({ title: "Acceso agregado", status: "success", duration: 2000 });
      setPdvAccessEmail("");
      loadPointsOfSale();
      setSelectedPdvForAccess((prev) => ({
        ...prev,
        allowedUserEmails: [...(prev?.allowedUserEmails || []), pdvAccessEmail.trim().toLowerCase()],
      }));
    } catch (err) {
      toast({ title: err.response?.data?.message || "Error al agregar", status: "error", duration: 3000 });
    } finally {
      setSavingAccess(false);
    }
  };

  const handleRemoveAccess = async (email) => {
    if (!selectedPdvForAccess) return;
    try {
      setSavingAccess(true);
      await pointOfSaleApi.removePdvAccess(selectedPdvForAccess._id, email);
      toast({ title: "Acceso quitado", status: "success", duration: 2000 });
      loadPointsOfSale();
      setSelectedPdvForAccess((prev) => ({
        ...prev,
        allowedUserEmails: (prev?.allowedUserEmails || []).filter((e) => e !== email),
      }));
    } catch (err) {
      toast({ title: "Error al quitar", status: "error", duration: 3000 });
    } finally {
      setSavingAccess(false);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await eventApi.getUserEvents(1, 100);
      const list = data?.events || [];
      const withAvailability = list.map((event) => {
        const tickets = event.tickets || [];
        const ticketsWithAvailable = tickets.map((t) => ({
          ...t,
          available: Math.max(0, (t.maxEntries || 0) - (t.selled || 0)),
        }));
        return {
          ...event,
          tickets: ticketsWithAvailable,
        };
      });
      setEvents(withAvailability);
    } catch (err) {
      console.error("Error loading events:", err);
      setError("No se pudieron cargar tus eventos");
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTickets = (event) => {
    if (!event?.tickets) return;
    const availableTickets = event.tickets.filter((t) => t.available > 0);
    if (availableTickets.length === 0) {
      toast({
        title: "Sin disponibilidad",
        description: "No hay entradas disponibles para este evento",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    setSelectedEvent(event);
    setEventTickets(availableTickets);
    onOpen();
  };

  return (
    <Container maxW="7xl" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
      <Stack spacing={6}>
        <Heading fontSize={{ base: "xl", md: "2xl" }}>Punto de venta</Heading>
        <Text color="gray.600">
          Creá puntos de venta (boleterías) y registrá las ventas con el medio de pago (efectivo, transferencia, Mercado Pago). Las entradas vendidas se descuentan del total configurado por ticket.
        </Text>

        <Box>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={2} mb={3}>
            <Heading size="sm" color="gray.700">Mis puntos de venta</Heading>
            {pointsOfSale.length > 0 && (
              <Button
                size="sm"
                colorScheme="blue"
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                leftIcon={<span>+</span>}
                onClick={onOpenPdv}
              >
                Crear punto de venta
              </Button>
            )}
          </Flex>
          {pointsOfSale.length === 0 ? (
            <Box bg="gray.50" p={4} borderRadius="md" borderWidth="1px" borderStyle="dashed" borderColor="gray.200">
              <Text color="gray.600" fontSize="sm" mb={3}>
                No tenés puntos de venta. Creá uno (por ejemplo "Boletería principal") para identificar las ventas por boletería y ver por dónde se vendió cada entrada.
              </Text>
              <Flex gap={3} flexWrap="wrap">
                <Button
                  colorScheme="blue"
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: "blue.600" }}
                  size="md"
                  leftIcon={<span>+</span>}
                  onClick={onOpenPdv}
                  boxShadow="md"
                >
                  Crear punto de venta
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  colorScheme="gray"
                  onClick={handleCreateDemoPdv}
                  isLoading={savingPdv}
                >
                  Crear ejemplo (demo)
                </Button>
              </Flex>
            </Box>
          ) : (
            <Flex wrap="wrap" gap={2}>
              {pointsOfSale.map((pdv) => (
                <Flex
                  key={pdv._id}
                  align="center"
                  gap={2}
                  bg="gray.50"
                  px={3}
                  py={2}
                  borderRadius="md"
                  borderWidth="1px"
                >
                  <Text fontWeight="500">{pdv.name}</Text>
                  {pdv.code && <Text fontSize="sm" color="gray.500">({pdv.code})</Text>}
                  <Button
                    as={RouterLink}
                    to={`/seller/punto-venta/panel/${pdv._id}`}
                    size="xs"
                    colorScheme="blue"
                    variant="solid"
                  >
                    Abrir
                  </Button>
                  {pdv.userEmail === user?.email && (
                    <Button size="xs" variant="outline" colorScheme="gray" onClick={() => openAccessModal(pdv)}>
                      Gestionar acceso
                    </Button>
                  )}
                  {pdv.userEmail === user?.email && (
                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleDeletePdv(pdv._id)}>
                      Eliminar
                    </Button>
                  )}
                </Flex>
              ))}
            </Flex>
          )}
        </Box>

        <Box>
          <Heading size="sm" color="gray.700" mb={1}>Vender entradas</Heading>
          <Text color="gray.500" fontSize="sm" mb={3}>
            Hacé clic en «Vender entradas» en un evento. En el cuadro podés elegir en qué punto de venta estás vendiendo y cómo pagó el cliente (efectivo, transferencia o Mercado Pago).
          </Text>
        </Box>

        {loading && (
          <Flex justify="center" align="center" py={8}>
            <Spinner size="xl" />
          </Flex>
        )}

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Stack spacing={4}>
          {!loading && events.map((event) => (
            <Card key={event._id}>
              <CardBody>
                <Flex
                  justify="space-between"
                  align={{ base: "flex-start", sm: "center" }}
                  direction={{ base: "column", sm: "row" }}
                  gap={4}
                >
                  <Box flex="1">
                    <Heading size="sm" mb={2}>{event.title}</Heading>
                    {event.addressRef && (
                      <Text color="gray.600" fontSize="sm" mb={1}>
                        {event.addressRef.province}, {event.addressRef.locality}
                      </Text>
                    )}
                    <Text color="gray.500" fontSize="sm">
                      Entradas disponibles:{" "}
                      {event.tickets?.reduce((sum, t) => sum + t.available, 0) ?? 0}
                    </Text>
                  </Box>
                  <Button
                    colorScheme="primary"
                    onClick={() => handleOpenTickets(event)}
                    isDisabled={!event.tickets?.some((t) => t.available > 0)}
                    w={{ base: "100%", sm: "auto" }}
                  >
                    Vender entradas
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          ))}
          {!loading && events.length === 0 && (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No tenés eventos con entradas disponibles para vender.</Text>
            </Box>
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
              <FormControl>
                <FormLabel>Punto de venta</FormLabel>
                <Select
                  value={selectedPointOfSaleId}
                  onChange={(e) => setSelectedPointOfSaleId(e.target.value)}
                  placeholder="Venta directa (sin punto asignado)"
                >
                  {pointsOfSale.map((pdv) => (
                    <option key={pdv._id} value={pdv._id}>{pdv.name}{pdv.code ? ` (${pdv.code})` : ""}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Medio de pago del cliente</FormLabel>
                <Select
                  value={pdvPaymentType}
                  onChange={(e) => setPdvPaymentType(e.target.value)}
                >
                  {PDV_PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email del cliente</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={customerData.email}
                  onChange={handleInputChange}
                  placeholder="cliente@ejemplo.com"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input
                  name="firstname"
                  value={customerData.firstname}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Apellido</FormLabel>
                <Input
                  name="lastname"
                  value={customerData.lastname}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                />
              </FormControl>

              {eventTickets.length > 0 ? (
                <FormControl isRequired>
                  <FormLabel>Tipo de entrada</FormLabel>
                  <Select
                    placeholder="Elegir ticket"
                    value={selectedTicket?._id || ""}
                    onChange={(e) =>
                      handleTicketSelect(eventTickets.find((t) => t._id === e.target.value))
                    }
                  >
                    {eventTickets.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} — $ {t.price} ({t.available} disponibles)
                      </option>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Text color="gray.500">No hay tickets disponibles</Text>
              )}

              {selectedTicket && (
                <>
                  <FormControl isRequired>
                    <FormLabel>Cantidad</FormLabel>
                    <NumberInput
                      min={1}
                      max={selectedTicket.available}
                      value={quantity}
                      onChange={handleQuantityChange}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <Box pt={2}>
                    <Flex justify="space-between">
                      <Text>Precio unitario:</Text>
                      <Text>$ {selectedTicket.price}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text>Cantidad:</Text>
                      <Text>{quantity}</Text>
                    </Flex>
                    <Flex justify="space-between" fontWeight="bold">
                      <Text>Total:</Text>
                      <Text>$ {selectedTicket.price * quantity}</Text>
                    </Flex>
                  </Box>
                </>
              )}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button
              colorScheme="primary"
              onClick={handlePurchase}
              isDisabled={!selectedTicket || !customerData.email}
              isLoading={isProcessing}
            >
              Confirmar venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenPdv} onClose={onClosePdv}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear punto de venta</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={pdvForm.name}
                  onChange={(e) => setPdvForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ej: Boletería principal"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Código (opcional)</FormLabel>
                <Input
                  value={pdvForm.code}
                  onChange={(e) => setPdvForm((p) => ({ ...p, code: e.target.value }))}
                  placeholder="Ej: PDV-01"
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClosePdv}>Cancelar</Button>
            <Button
              colorScheme="blue"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              onClick={handleCreatePdv}
              isLoading={savingPdv}
            >
              Crear PDV
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isOpenAccess} onClose={onCloseAccess}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Gestionar acceso — {selectedPdvForAccess?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Agregá el email de empleados que pueden abrir este punto de venta y registrar ventas. Deben tener cuenta en la plataforma.
            </Text>
            <FormControl mb={4}>
              <FormLabel>Email del empleado</FormLabel>
              <Flex gap={2}>
                <Input
                  type="email"
                  value={pdvAccessEmail}
                  onChange={(e) => setPdvAccessEmail(e.target.value)}
                  placeholder="empleado@ejemplo.com"
                />
                <Button colorScheme="blue" onClick={handleAddAccess} isLoading={savingAccess}>
                  Agregar
                </Button>
              </Flex>
            </FormControl>
            <FormLabel>Con acceso ({selectedPdvForAccess?.allowedUserEmails?.length || 0})</FormLabel>
            {selectedPdvForAccess?.allowedUserEmails?.length ? (
              <Stack spacing={2}>
                {selectedPdvForAccess.allowedUserEmails.map((email) => (
                  <Flex key={email} justify="space-between" align="center" bg="gray.50" px={2} py={2} borderRadius="md">
                    <Text fontSize="sm">{email}</Text>
                    <Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleRemoveAccess(email)}>
                      Quitar
                    </Button>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <Text color="gray.500" fontSize="sm">Nadie además del organizador tiene acceso.</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCloseAccess}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default SellerPuntoVenta;
