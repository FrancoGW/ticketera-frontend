import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Input,
  Button,
  Heading,
  useToast,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  VStack,
  Spinner,
  Center
} from '@chakra-ui/react';
import ticketApi from '../../Api/ticket';
import { paymentApi } from '../../Api/payment';
import eventApi from '../../Api/event';

const LoadingState = () => (
  <Center h="50vh">
    <VStack spacing={4}>
      <Spinner size="xl" color="blue.500" thickness="4px" />
      <Text fontSize="lg">Cargando tickets...</Text>
    </VStack>
  </Center>
);

const TicketListing = () => {
  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [ticketsToBuy, setTicketsToBuy] = useState({});
  const [subtotal, setSubtotal] = useState(0); // Solo subtotal de tickets, sin cargo por servicio
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const EVENT_ID = "67567a50be392bd067d3e025";

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        setError("Error al verificar el estado de autenticación");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    await Promise.all([fetchEvent(), fetchTickets()]);
  };

  const fetchEvent = async () => {
    try {
      const response = await eventApi.getEventById(EVENT_ID);
      if (response.data?.event) {
        setEvent(response.data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await ticketApi.getTicketsByEventForUser(EVENT_ID);
      const ticketsData = response.data?.tickets || [];
      const filteredTickets = ticketsData.filter(ticket => ticket.ticketType !== 'CORTESIA');
      setTickets(filteredTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tickets disponibles",
        status: "error",
        duration: 3000,
      });
    }
  };

  const addTicketToBuy = (ticket, quantity) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  
    const validQuantity = (!quantity || isNaN(quantity)) ? 0 : quantity;
    
    if (validQuantity < 0 || validQuantity > 50) return;
    
    // Solo guardar la cantidad y el precio del ticket
    // El backend calculará el cargo por servicio y el total
    const ticketToBuy = {
      [ticket._id]: {
        quantity: validQuantity,
        price: ticket.price, // Guardar el precio unitario
      },
    };
    
    const tickets = { ...ticketsToBuy, ...ticketToBuy };
    setTicketsToBuy(tickets);
    
    // Calcular solo el subtotal de tickets (sin cargo por servicio)
    const newSubtotal = Object.values(tickets).reduce((sum, ticketData) => {
      return sum + (ticketData.price * ticketData.quantity);
    }, 0);
    setSubtotal(newSubtotal);
  };

const handlePurchase = async () => {
  if (!isAuthenticated) {
    navigate("/login");
    return;
  }

  const hasSelectedTickets = Object.values(ticketsToBuy).some(
    (ticket) => ticket.quantity > 0
  );
  if (!hasSelectedTickets) {
    toast({
      title: "Error",
      description: "Selecciona al menos un ticket para comprar",
      status: "warning",
      duration: 3000,
    });
    return;
  }

  try {
    // Transform ticketsToBuy object into the required format
    const transformedTickets = Object.entries(ticketsToBuy)
      .map(([ticketId, details]) => ({
        ticketId,
        quantity: details.quantity,
      }))
      .filter((ticket) => ticket.quantity > 0);

    const checkoutData = {
      ticketsToBuy: transformedTickets,
      description: "Compra de tickets",
      selectedDate: {
        timestampStart: Date.now(),
        timestampEnd: Date.now() + 3600 * 1000,
      },
    };

    const { data } = await paymentApi.createCheckout(checkoutData);

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      throw new Error("No checkout URL received");
    }
  } catch (error) {
    console.error("Error during checkout:", error);
    toast({
      title: "Error",
      description:
        "Hubo un error al procesar tu compra. Por favor intenta nuevamente.",
      status: "error",
      duration: 5000,
    });
  }
};

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box w="full" p={6}>
      <Heading mb={6}>Tickets Disponibles</Heading>
      {!Array.isArray(tickets) || tickets.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No hay tickets disponibles en este momento.
        </Alert>
      ) : (
        <>
          <TableContainer>
            <Table variant="striped" colorScheme="purple">
              <Thead>
                <Tr>
                  <Th>Tipo de ticket</Th>
                  <Th>Valor</Th>
                  <Th>Cantidad</Th>
                  <Th>Subtotal</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tickets.map((ticket) => (
                  <Tr key={ticket._id}>
                    <Td>{ticket.title}</Td>
                    <Td>$ {ticket.price}</Td>
                    <Td>
                      {ticket.maxEntries <= ticket.soldCount ? (
                        <Text color="red.500" fontWeight="500">Agotado</Text>
                      ) : (
                        <Input
                          type="number"
                          value={ticketsToBuy[ticket._id]?.quantity || ''}
                          onChange={(e) => addTicketToBuy(ticket, parseInt(e.target.value || '0'))}
                          min={0}
                          max={50}
                          w="20"
                          placeholder="0"
                          isDisabled={!isAuthenticated}
                        />
                      )}
                    </Td>
                    <Td>$ {ticketsToBuy[ticket._id]?.totalPrice || 0}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <Box mt={6} p={4} borderTop="1px" borderColor="gray.200">
            <Text color="gray.600" fontSize="md" mb={2}>
              Subtotal: $ {subtotal.toLocaleString()}
            </Text>
            <Text fontSize="xs" color="gray.500" mb={4} fontStyle="italic">
              El cargo por servicio y el total final se calcularán al procesar el pago
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handlePurchase}
              isDisabled={isAuthenticated && subtotal === 0}
            >
              {isAuthenticated ? `Comprar Tickets` : 'Iniciar sesión para comprar'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TicketListing;