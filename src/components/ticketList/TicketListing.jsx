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
  const [ticketsToBuy, setTicketsToBuy] = useState({});
  const [serviceCost, setServiceCost] = useState(0);
  const [total, setTotal] = useState(0);
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
    await fetchTickets();
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
    
    const ticketToBuy = {
      [ticket._id]: {
        quantity: validQuantity,
        // serviceCost: ticket.price * envConfig.COMMISSION_PERCENTAGE * validQuantity,
        serviceCost: 420,
        totalPrice: ticket.price * validQuantity,
      },
    };
    
    const tickets = { ...ticketsToBuy, ...ticketToBuy };
    setTicketsToBuy(tickets);
    
    const newServiceCost = calculateServiceCost(tickets);
    setServiceCost(newServiceCost);
    
    const newTotal = calculateTotal(tickets);
    setTotal(newTotal);
  };

  const calculateServiceCost = (tickets) => {
    let serviceCost = 0;
    for (const ticket in tickets) {
      serviceCost += tickets[ticket].serviceCost;
    }
    return serviceCost;
  };

  const calculateTotal = (tickets) => {
    let total = 0;
    const serviceCost = calculateServiceCost(tickets);
    for (const ticket in tickets) {
      total += tickets[ticket].totalPrice;
    }
    return total + serviceCost;
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

    // Get token from localStorage
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}payment/create-checkout`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketsToBuy: transformedTickets,
          selectedDate: {
            timestampStart: Date.now(), // You might want to get these values from props or state
            timestampEnd: Date.now() + 3600 * 1000, // Example: 1 hour later
          },
        }),
      }
    );

    //asdasd
    if (!response.ok) {
      throw new Error("Error creating checkout session");
    }

    const checkoutData = await response.json();

    // Assuming the API returns a URL to redirect to
    if (checkoutData.checkoutUrl) {
      window.location.href = checkoutData.checkoutUrl;
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
              Cargo por servicio: $ {serviceCost}
            </Text>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              Total a pagar: $ {total}
            </Text>
            <Button
              colorScheme="blue"
              size="lg"
              width="full"
              onClick={handlePurchase}
              isDisabled={isAuthenticated && total === 0}
            >
              {isAuthenticated ? `Comprar Tickets - $ ${total}` : 'Iniciar sesión para comprar'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TicketListing;