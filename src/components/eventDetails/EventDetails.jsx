import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import eventApi from "../../Api/event";
import {
  Container,
  Flex,
  Heading,
  Text,
  Icon,
  Image,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  FormControl,
} from "@chakra-ui/react";
import { RiCalendar2Line, RiMapPinLine, RiTicket2Line } from "react-icons/ri";
import { paymentApi } from "../../Api/payment";
import { getObjDate, isDateIncluded } from "../../common/utils";

const EventDetails = () => {
  const { id } = useParams();
  console.log('Event ID from params:', id);

  const [event, setEvent] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [ticketsToBuy, setTicketsToBuy] = useState({});
  const [serviceCost, setServiceCost] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedDate, setSelectedDate] = useState(0);
  const [dateTickets, setDateTickets] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const getEventData = async () => {
      try {
        console.log('Fetching event data...');
        const { data: eventData } = await eventApi.getEventById(id)
        console.log('Event data received:', eventData);
        setEvent(eventData.event);
        const selectedTickets = selectTicketsOfSelectedDate(eventData.event);
        console.log('Selected tickets for initial date:', selectedTickets);
        setDateTickets(selectedTickets);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast({
          title: "Error",
          description: "Ocurrio un error al obtener los datos del evento.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    }
    getEventData()
  }, []);

  useEffect(() => {
    console.log('Selected date changed to:', selectedDate);
    console.log('Current event state:', event);
    const newDateTickets = selectTicketsOfSelectedDate(event);
    console.log('New date tickets:', newDateTickets);
    setDateTickets(newDateTickets);
  }, [selectedDate]);

  const handleSelectedDate = (e) => {
    console.log('Date selection changed to:', e.target.value);
    setSelectedDate(e.target.value);
    resetTicketsToBuy();
  };



  const resetTicketsToBuy = () => {
    console.log('Resetting tickets to buy');
    setTicketsToBuy({});
    setServiceCost(0);
    setTotal(0);
    setDiscount(0);
    setDiscountCode("");
  };

  const validateDiscountCode = async () => {
    setIsValidatingCode(true);
    try {
      const { data } = await paymentApi.validateDiscountCode(discountCode);
      if (data.isValid) {
        setDiscount(data.discountAmount);
        toast({
          title: "Código aplicado",
          description: `Se aplicó un descuento de $${data.discountAmount}`,
          status: "success",
          duration: 3000,
        });
      } else {
        setDiscount(0);
        toast({
          title: "Código inválido",
          description: "El código ingresado no es válido o está vencido",
          status: "error",
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo validar el código de descuento",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsValidatingCode(false);
    }
  };

  const selectTicketsOfSelectedDate = (eventData) => {
    console.log('Selecting tickets for event data:', eventData);
    if (!eventData?.dates || !eventData?.tickets) {
      console.log('No dates or tickets available in event data');
      return [];
    }
    
    if (!eventData.dates[selectedDate]) {
      console.log('Selected date index out of range');
      return eventData.tickets || [];
    }
    
    const date = eventData.dates[selectedDate];
    console.log('Selected date:', date);
    const objDate = getObjDate(date);
    console.log('Parsed date object:', objDate);
    
    if (!Array.isArray(eventData.tickets)) {
      console.log('Tickets is not an array:', eventData.tickets);
      return [];
    }
    
    const tickets = eventData.tickets.filter((ticket) => {
      if (!ticket.dates || !Array.isArray(ticket.dates)) {
        return false;
      }
      return isDateIncluded(objDate, ticket.dates);
    });
    console.log('Filtered tickets:', tickets);
    return tickets;
  };

  const addTicketToBuy = (ticket, quantity) => {
    console.log('Adding ticket to buy:', { ticket, quantity });
    if (quantity < 0) return;
    if (quantity > 50) return;

    // const comission_percentage 

    const ticketToBuy = {
      [ticket._id]: {
        quantity,
        serviceCost: 420,
        totalPrice: ticket.price * quantity,
      },
    };
    const tickets = { ...ticketsToBuy, ...ticketToBuy };
    console.log('Updated tickets to buy:', tickets);
    setTicketsToBuy(tickets);
    const newServiceCost = calculateServiceCost(tickets);
    console.log('New service cost:', newServiceCost);
    setServiceCost(newServiceCost);
    const newTotal = calculateTotal(tickets);
    console.log('New total:', newTotal);
    setTotal(newTotal);
  };

  const calculateServiceCost = (tickets) => {
    let serviceCost = 0;
    for (const ticket in tickets) {
      serviceCost += tickets[ticket].serviceCost;
    }
    console.log('Calculated service cost:', serviceCost);
    return serviceCost;
  };

  const calculateTotal = (tickets) => {
    let total = 0;
    const serviceCost = calculateServiceCost(tickets);
    for (const ticket in tickets) {
      total += tickets[ticket].totalPrice;
    }
    const finalTotal = total + serviceCost - discount;
    console.log('Calculated total:', finalTotal);
    return finalTotal;
  };

  const buyTicket = async () => {
    console.log('Starting ticket purchase...');
    setIsLoading(true);
    const tickets = [];

    for (const ticket in ticketsToBuy) {
      tickets.push({
        ticketId: ticket,
        quantity: ticketsToBuy[ticket].quantity,
      });
    }

    const checkoutData = {
      ticketsToBuy: tickets,
      description: event.title,
      selectedDate: event.dates[selectedDate],
      discountCode: discountCode,
      discountAmount: discount,
    };

    console.log('Checkout data:', checkoutData);

    try {
      console.log('Creating checkout...');
      const { data } = await paymentApi.createCheckout(checkoutData);
      console.log('Checkout created:', data);
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la compra",
        status: "error",
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  return (
    <>
      <Header />
      <Container maxW="container.xl" p="0" my="8" h="auto">
        <Flex flexDir={{ base: "column", md: "row" }} px="2">
          <Flex
            w={{ base: "100%", md: "75%" }}
            flexDirection="column"
            gap="5"
            justify="center"
          >
            <Flex
              p="6"
              flexDir="column"
              gap="6"
              boxShadow="lg"
              borderRadius="md"
              fontFamily="secondary"
            >
              <Heading
                as="h2"
                fontSize="3xl"
                fontWeight="700"
                textTransform="uppercase"
                fontFamily="secondary"
              >
                {event.title}, {event.addressRef?.place}
              </Heading>
              <Text as="h2" fontSize="lg" fontWeight="500" color="black">
                {event.description}.
              </Text>
              <Flex align="center">
                <Icon
                  color="primary"
                  w="25px"
                  h="25px"
                  mr="6"
                  as={RiMapPinLine}
                />
                <Text
                  as="h2"
                  fontSize="md"
                  fontWeight="300"
                  textTransform="uppercase"
                >
                  {event.addressRef?.place}, {event.addressRef?.direction}.
                </Text>
              </Flex>
              <Flex color="#323DB9" alignItems="center">
                <Icon
                  w="25px"
                  h="25px"
                  mr="3"
                  color="primary"
                  as={RiCalendar2Line}
                />
                <Select
                  onChange={handleSelectedDate}
                  value={selectedDate}
                  color="black"
                  fontWeight="300"
                  textTransform="uppercase"
                >
                  {event?.dates?.map((date, index) => {
                    const objDate = getObjDate(date);

                    return (
                      <option key={index} value={index}>
                        {objDate.date} - Inicio: {objDate.timeStart} - Fin:{" "}
                        {objDate.timeEnd}
                      </option>
                    );
                  })}
                </Select>
              </Flex>
              <Text as="h3" fontSize="md" fontWeight="500" color="red">
                {event.adultsOnly && "Evento solo para Mayores de 18 Años."}
              </Text>
            </Flex>
            <Flex
              h="100%"
              p="6"
              flexDir="column"
              gap="6"
              boxShadow="lg"
              borderRadius="md"
              fontFamily="secondary"
            >
              <TableContainer>
                <Table variant="striped" colorScheme="purple">
                  <Thead>
                    <Tr>
                      <Th fontFamily="secondary">Tipo de ticket</Th>
                      <Th fontFamily="secondary">Valor</Th>
                      <Th fontFamily="secondary">Cantidad</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {dateTickets && dateTickets.length > 0 ? (
                      dateTickets.map((ticket) => {
                        return (
                          <Tr key={ticket._id}>
                            <Td>{ticket.title}</Td>
                            <Td>$ {ticket.price}</Td>
                            <Td>
                              {ticket.selled >= ticket?.maxEntries ? (
                                <Text
                                  as="h2"
                                  fontSize="lg"
                                  fontWeight="500"
                                  color="red"
                                >
                                  Agotado
                                </Text>
                              ) : (
                                <Input
                                  type="number"
                                  style={{ maxWidth: 50 }}
                                  onChange={(e) =>
                                    addTicketToBuy(ticket, parseInt(e.target.value) || 0)
                                  }
                                  value={(ticketsToBuy[ticket._id]?.quantity) || ""}
                                  border="2px"
                                  borderColor="#000"
                                  _hover={{ bg: "none" }}
                                  pe="0.3rem"
                                  ps="0.3rem"
                                  min={0}
                                />
                              )}
                            </Td>
                          </Tr>
                        );
                      })
                    ) : (
                      <Tr>
                        <Td colSpan={3} textAlign="center" py={8}>
                          <Text fontSize="md" color="gray.500">
                            No hay tickets disponibles para esta fecha
                          </Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>

              <Flex gap="4" alignItems="center">
                <FormControl>
                  <Input
                    placeholder="Código de descuento"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    maxWidth="200px"
                  />
                </FormControl>
                <Button
                  onClick={validateDiscountCode}
                  isLoading={isValidatingCode}
                  disabled={!discountCode}
                  size="md"
                  bgColor="#000"
                  color="#fff"
                  fontWeight='300'
                  _hover={{bgColor:'#000'}}
                >
                  Aplicar
                </Button>
              </Flex>

              {discount > 0 && (
                <Text color="green.500" fontSize="md">
                  Descuento aplicado: -${discount}
                </Text>
              )}

              <Text
                as="h2"
                color="red"
                fontSize="md"
                style={{ alignSelf: "flex-start", marginTop: 12 }}
              >
                Cargo por servicio: $ {serviceCost}
              </Text>

              {discount > 0 && (
                <Text
                  as="h2"
                  color="green.500"
                  fontSize="md"
                  style={{ alignSelf: "flex-start" }}
                >
                  Descuento: -${discount}
                </Text>
              )}

              <Flex gap="1rem">
                <Text
                  as="h2"
                  fontSize="1.5rem"
                  style={{ alignSelf: "flex-start", marginTop: 12 }}
                >
                  Total: $ {total}
                </Text>
              </Flex>
              {localStorage.getItem("token") ? (
                <Button
                  bg="primary"
                  color="white"
                  _hover={{ bg: "buttonHover" }}
                  _active=""
                  borderRadius="lg"
                  leftIcon={<RiTicket2Line />}
                  marginTop="12px"
                  disabled={!total}
                  onClick={buyTicket}
                  isLoading={isLoading}
                  type="button"
                  fontWeight={500}
                >
                  Comprar mi entrada
                </Button>
              ) : (
                <Button
                  bg="primary"
                  color="white"
                  _hover={{bgColor:'#000'}}
                  _active=""
                  borderRadius="lg"
                  marginTop="12px"
                  fontWeight="500"
                  onClick={() => navigate("/login")}
                  
                >
                  Inicia sesión para comprar tu entrada
                </Button>
              )}
            </Flex>
          </Flex>
          <Flex
            w={{ base: "100%", md: "25%" }}
            h="100%"
            bg="#f1f1f1"
            mt={{ base: "6", md: 0 }}
            flexDir="column"
            gap={{ base: 0, md: "6" }}
            ml={{ base: 0, md: "1rem" }}
            borderRadius="md"
          >
            <Image
              src={
                event.pictures
                  ? (typeof event.pictures === 'string' && (event.pictures.startsWith('http://') || event.pictures.startsWith('https://'))
                      ? event.pictures
                      : "data:image/png;base64," + event.pictures)
                  : "./imagenes/img1.jpeg"
              }
              alt=""
              objectFit="contain"
              w="100%"
              borderRadius="md"
            />
          </Flex>
        </Flex>
      </Container>
      <Footer />
    </>
  );
};
// sad
export default EventDetails;
