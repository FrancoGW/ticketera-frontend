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
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import eventApi from "../../Api/event";
import ticketApi from "../../Api/ticket";

const PdvDashboard = () => {
  // Estados principales
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados para el modal y selección
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [eventTickets, setEventTickets] = useState([]); // Este estado faltaba
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado para datos del cliente
  const [customerData, setCustomerData] = useState({
    email: "",
    firstname: "",
    lastname: "",
  });

  // Hooks de Chakra UI
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setQuantity(1); // Reset cantidad al seleccionar nuevo ticket
  };
  // Función para procesar la compra
  const handlePurchase = async () => {
    // if (
    //   selectedTicket ||
    //   customerData.email ||
    //   customerData.firstname ||
    //   customerData.lastname
    // ) {
    //   toast({
    //     title: "Error",
    //     description: "Por favor completa todos los campos requeridos",
    //     status: "error",
    //     duration: 3000,
    //   });
    //   return;
    // }

    try {
      setIsProcessing(true);
      // Aquí iría la lógica de compra
      await ticketApi.sellTicket({
        eventId: selectedEvent._id,
        ticketId: selectedTicket._id,
        quantity: quantity,
        customerEmail: customerData.email,
        customerFirstname: customerData.firstname,
        customerLastname: customerData.lastname,
      });

      toast({
        title: "Éxito",
        description: "Compra realizada correctamente",
        status: "success",
        duration: 3000,
      });

      onClose();
      loadEvents(); // Recargar eventos
      resetForm();
    } catch (error) {
      console.error("Error en la compra:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la compra",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    setCustomerData({
      email: "",
      firstname: "",
      lastname: "",
    });
    setSelectedTicket(null);
    setQuantity(1);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setSelectedEvent(null);
    setSelectedTicket(null);
    setEventTickets([]);
    setQuantity(1);
    setCustomerData({
      email: "",
      firstname: "",
      lastname: "",
    });
    onClose();
  };
  const handleQuantityChange = (value) => {
    const newValue = parseInt(value);
    if (newValue >= 1 && newValue <= selectedTicket.available) {
      setQuantity(newValue);
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await eventApi.getEvents({
        page: 1,
        limit: 10,
        status: "approved",
      });

      if (response?.data) {
        const eventsArray = Array.isArray(response.data)
          ? response.data
          : response.data.events || [];

        const eventsWithDetails = await Promise.all(
          eventsArray.map(async (event) => {
            try {
              // Obtener detalles del evento
              const { data: eventDetails } = await eventApi.getEventById(
                event._id
              );

              if (eventDetails && eventDetails.event) {
                const tickets = eventDetails.event.tickets || [];

                // Calcular disponibilidad usando maxEntries y selled
                const totalAvailable = tickets.reduce((sum, ticket) => {
                  const disponibles = ticket.maxEntries - (ticket.selled || 0);
                  return sum + (disponibles > 0 ? disponibles : 0);
                }, 0);

                return {
                  ...eventDetails.event,
                  totalAvailable,
                  tickets: tickets.map((ticket) => ({
                    ...ticket,
                    available: ticket.maxEntries - (ticket.selled || 0),
                  })),
                };
              }
              return null;
            } catch (error) {
              console.error("Error getting event details:", error);
              return null;
            }
          })
        );

        // Filtrar eventos nulos y establecer el estado
        setEvents(eventsWithDetails.filter(Boolean));
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setError("No se pudieron cargar los eventos");
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
    if (!event || !event.tickets) return;
  
    try {
      // Filtramos los tickets que tienen disponibilidad
      const availableTickets = event.tickets
        .map(ticket => ({
          ...ticket,
          available: ticket.maxEntries - (ticket.selled || 0)
        }))
        .filter(ticket => ticket.available > 0);
  
      console.log('Tickets disponibles:', availableTickets);
  
      setSelectedEvent(event);
      setEventTickets(availableTickets);
      onOpen();
    } catch (error) {
      console.error('Error al procesar tickets:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los tickets',
        status: 'error',
        duration: 3000,
      });
    }
  };
  const getObjDate = (date) => {
    try {
      const [dateString, timeStart, timeEnd] = date.split(" ");
      return {
        date: dateString,
        timeStart,
        timeEnd,
      };
    } catch (error) {
      return {
        date: "Invalid Date",
        timeStart: "",
        timeEnd: "",
      };
    }
  };
  return (
    <div>
      <Header />
      <Container maxW="7xl" py="8" mt="5rem">
        <Stack spacing={6}>
          <Heading>Panel de Ventas PDV</Heading>

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
            {events.map((event) => (
            <Card key={event._id} mb={4}>
            <CardBody>
              <Flex justify="space-between" align="top">
                <Box>
                  <Heading size="md" mb={2}>{event.title}</Heading>
                  <Text mb={2}>{event.description}</Text>
                  {event.addressRef && (
                    <Text color="gray.700" mb={2}>
                      Ubicación: {event.addressRef.province}, {event.addressRef.locality}
                    </Text>
                  )}
                  <Text color="gray.700">
                    Entradas disponibles: {
                      event.tickets?.reduce((total, ticket) => 
                        total + (ticket.maxEntries - (ticket.selled || 0)), 0
                      ) || 0
                    }
                   {console.log( event.tickets)} 
                  </Text>
                </Box>
                <Button
        colorScheme="blue"
        onClick={() => handleOpenTickets(event)}
        isDisabled={
          !event.tickets?.some(ticket => 
            (ticket.maxEntries - (ticket.selled || 0)) > 0
          )
        }
      >
        Ver tickets
      </Button>
              </Flex>
            </CardBody>
          </Card>
            ))}
            {!loading && events.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500">No hay eventos disponibles</Text>
              </Box>
            )}
          </Stack>
        </Stack>

        {/* Modal de Compra de Tickets */}
        <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedEvent?.title} - Comprar Tickets</ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email del cliente</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={customerData.email}
                    onChange={handleInputChange}
                    placeholder="ejemplo@correo.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Nombre del cliente</FormLabel>
                  <Input
                    name="firstname"
                    value={customerData.firstname}
                    onChange={handleInputChange}
                    placeholder="Nombre"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Apellido del cliente</FormLabel>
                  <Input
                    name="lastname"
                    value={customerData.lastname}
                    onChange={handleInputChange}
                    placeholder="Apellido"
                  />
                </FormControl>

                {eventTickets && eventTickets.length > 0 ? (
                  <FormControl isRequired>
                    <FormLabel>Seleccionar Ticket</FormLabel>
                    <Select
                      placeholder="Elige un tipo de ticket"
                      onChange={(e) =>
                        handleTicketSelect(
                          eventTickets.find((t) => t._id === e.target.value)
                        )
                      }
                      value={selectedTicket?._id || ""}
                    >
                      {eventTickets.map((ticket) => (
                        <option key={ticket._id} value={ticket._id}>
                          {ticket.title} - ${ticket.price} ({ticket.available}{" "}
                          disponibles)
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <Text color="gray.500">
                    No hay tickets disponibles para este evento
                  </Text>
                )}

                {selectedTicket && (
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
                )}

                {selectedTicket && (
                  <Box>
                    <Stack spacing={2}>
                      <Flex justify="space-between">
                        <Text>Precio unitario:</Text>
                        <Text>${selectedTicket.price}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>Cantidad:</Text>
                        <Text>{quantity}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontWeight="bold">Total:</Text>
                        <Text fontWeight="bold">
                          ${selectedTicket.price * quantity}
                        </Text>
                      </Flex>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onClick={handlePurchase}
                isDisabled={
                  !selectedTicket ||
                  !customerData.email ||
                  !customerData.firstname ||
                  !customerData.lastname
                }
                isLoading={isProcessing}
              >
                Confirmar Compra
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
      <Footer />
    </div>
  );
};

export default PdvDashboard;
