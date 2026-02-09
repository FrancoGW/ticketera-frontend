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
  Box,
  Card,
  CardBody,
  Badge,
  Divider,
  VStack,
  HStack,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { RiCalendar2Line, RiMapPinLine, RiTicket2Line } from "react-icons/ri";
import { paymentApi } from "../../Api/payment";
import cbuApi from "../../Api/cbu";
import { getObjDate, isDateIncluded } from "../../common/utils";
import VenueMapSelector from "../venueMap/VenueMapSelector";

const EventDetails = () => {
  const { id } = useParams();
  console.log('Event ID from params:', id);

  const [event, setEvent] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [ticketsToBuy, setTicketsToBuy] = useState({});
  const [subtotal, setSubtotal] = useState(0); // Subtotal de tickets
  const [serviceCharge, setServiceCharge] = useState(0); // Cargo por servicio calculado
  const [total, setTotal] = useState(0); // Total final
  const [selectedDate, setSelectedDate] = useState(0);
  const [dateTickets, setDateTickets] = useState([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [cbuCheckoutData, setCbuCheckoutData] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const { isOpen: isCbuModalOpen, onOpen: onCbuModalOpen, onClose: onCbuModalClose } = useDisclosure();
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
    // Si cambia la fecha, reiniciar selección de zona para evitar tickets no disponibles
    setSelectedZoneId("");
  }, [selectedDate]);

  const handleSelectedDate = (e) => {
    console.log('Date selection changed to:', e.target.value);
    setSelectedDate(e.target.value);
    resetTicketsToBuy();
  };



  const resetTicketsToBuy = () => {
    console.log('Resetting tickets to buy');
    setTicketsToBuy({});
    setSubtotal(0);
    setServiceCharge(0);
    setTotal(0);
    setDiscount(0);
    setDiscountCode("");
  };

  const validateDiscountCode = async () => {
    setIsValidatingCode(true);
    try {
      const { data } = await paymentApi.validateDiscountCode(discountCode);
      if (data.isValid) {
        const newDiscount = data.discountAmount;
        setDiscount(newDiscount);
        
        // Recalcular el total con el descuento
        const newTotal = subtotal + serviceCharge - newDiscount;
        setTotal(newTotal);
        
        toast({
          title: "Código aplicado",
          description: `Se aplicó un descuento de $${newDiscount}`,
          status: "success",
          duration: 3000,
        });
      } else {
        setDiscount(0);
        
        // Recalcular el total sin descuento
        const newTotal = subtotal + serviceCharge;
        setTotal(newTotal);
        
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
    if (!eventData?.tickets) {
      console.log('No tickets available in event data');
      return [];
    }
    
    if (!Array.isArray(eventData.tickets)) {
      console.log('Tickets is not an array:', eventData.tickets);
      return [];
    }

    // Si no hay fechas en el evento, mostrar todos los tickets
    if (!eventData?.dates || eventData.dates.length === 0) {
      console.log('No dates in event, showing all tickets');
      return eventData.tickets;
    }
    
    if (!eventData.dates[selectedDate]) {
      console.log('Selected date index out of range');
      return eventData.tickets || [];
    }
    
    const date = eventData.dates[selectedDate];
    console.log('Selected date:', date);
    const objDate = getObjDate(date);
    console.log('Parsed date object:', objDate);
    
    // Filtrar tickets que coincidan con la fecha seleccionada
    // Si un ticket no tiene fechas asignadas, también se muestra (para compatibilidad)
    const tickets = eventData.tickets.filter((ticket) => {
      // Si el ticket no tiene fechas, mostrarlo (tickets sin restricción de fecha)
      if (!ticket.dates || !Array.isArray(ticket.dates) || ticket.dates.length === 0) {
        return true;
      }
      // Si tiene fechas, verificar si coincide con la fecha seleccionada
      return isDateIncluded(objDate, ticket.dates);
    });
    
    console.log('Filtered tickets:', tickets);
    
    // Si no hay tickets que coincidan, mostrar todos los tickets disponibles
    // (para evitar que no se muestre nada cuando hay tickets pero no coinciden fechas)
    if (tickets.length === 0 && eventData.tickets.length > 0) {
      console.log('No tickets match the selected date, showing all tickets');
      return eventData.tickets;
    }
    
    return tickets;
  };

  const addTicketToBuy = (ticket, quantity) => {
    console.log('Adding ticket to buy:', { ticket, quantity });
    if (quantity < 0) return;
    if (quantity > 50) return;

    // Guardar la cantidad y el precio del ticket
    const ticketToBuy = {
      [ticket._id]: {
        quantity,
        price: ticket.price, // Guardar el precio unitario
      },
    };
    const tickets = { ...ticketsToBuy, ...ticketToBuy };
    console.log('Updated tickets to buy:', tickets);
    setTicketsToBuy(tickets);
    
    // Calcular el subtotal de tickets
    const newSubtotal = Object.values(tickets).reduce((sum, ticketData) => {
      return sum + (ticketData.price * ticketData.quantity);
    }, 0);
    setSubtotal(newSubtotal);

    // Calcular el cargo por servicio usando serviceFeePercentage del evento
    // serviceFeePercentage viene como decimal (0.2 = 20%, 0.1 = 10%)
    const serviceFeePercentage = event?.serviceFeePercentage || 0;
    const newServiceCharge = newSubtotal * serviceFeePercentage;
    setServiceCharge(newServiceCharge);

    // Calcular el total: subtotal + cargo por servicio - descuento
    const newTotal = newSubtotal + newServiceCharge - discount;
    setTotal(newTotal);

    console.log('Calculated:', {
      subtotal: newSubtotal,
      serviceFeePercentage,
      serviceCharge: newServiceCharge,
      discount,
      total: newTotal
    });
  };

  const buyTicket = async () => {
    console.log('Starting ticket purchase...');
    
    // Validar que haya tickets seleccionados
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

    // Validar que haya una fecha seleccionada si el evento tiene fechas
    if (event.dates && event.dates.length > 0 && !event.dates[selectedDate]) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha válida",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    const tickets = [];

    for (const ticket in ticketsToBuy) {
      if (ticketsToBuy[ticket].quantity > 0) {
        tickets.push({
          ticketId: ticket,
          quantity: ticketsToBuy[ticket].quantity,
        });
      }
    }

    if (tickets.length === 0) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "No hay tickets válidos para comprar",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const checkoutData = {
      ticketsToBuy: tickets,
      description: event.title,
      selectedDate: event.dates && event.dates.length > 0 ? event.dates[selectedDate] : null,
      discountCode: discountCode || undefined,
      discountAmount: discount || undefined,
    };

    console.log('Checkout data:', checkoutData);

    try {
      console.log('Creating checkout...');
      const { data } = await paymentApi.createCheckout(checkoutData);
      console.log('Checkout created:', data);
      
      if (data.useCbu) {
        setCbuCheckoutData(data);
        onCbuModalOpen();
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No se recibió la URL de checkout del servidor");
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "No se pudo procesar la compra. Por favor intenta nuevamente.";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCbuProof = async () => {
    if (!cbuCheckoutData || !proofFile) {
      toast({ title: "Subí el comprobante de pago", status: "warning", duration: 3000, isClosable: true });
      return;
    }
    setIsSubmittingProof(true);
    try {
      const { data: uploadRes } = await cbuApi.uploadProofImage(proofFile);
      const proofImageUrl = uploadRes?.url;
      if (!proofImageUrl) throw new Error("No se pudo subir el comprobante");
      await cbuApi.createProof({
        eventId: cbuCheckoutData.eventId,
        ticketItems: cbuCheckoutData.ticketsToBuy,
        selectedDate: cbuCheckoutData.selectedDate,
        proofImageUrl,
        amount: cbuCheckoutData.totalAmount,
      });
      toast({
        title: "Comprobante enviado",
        description: "El organizador revisará tu pago y te enviará las entradas por email.",
        status: "success",
        duration: 6000,
        isClosable: true,
      });
      onCbuModalClose();
      setCbuCheckoutData(null);
      setProofFile(null);
      setProofPreview(null);
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.message || "No se pudo enviar", status: "error", duration: 4000, isClosable: true });
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const zones = Array.isArray(event?.venueMap?.zones) ? event.venueMap.zones : [];
  const selectedZone = selectedZoneId ? zones.find((z) => z.id === selectedZoneId) : null;
  const selectedZoneTicketId = selectedZone?.ticketRefs?.[0];
  const zoneFilteredTickets = selectedZoneTicketId
    ? dateTickets.filter((t) => t._id === selectedZoneTicketId)
    : dateTickets;

  return (
    <>
      <Header />
      <Box 
        bg="gray.50" 
        minH="calc(100vh - 80px)" 
        pt={{ base: "100px", md: "100px" }}
        pb={8}
      >
        <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
          <Flex flexDir={{ base: "column", lg: "row" }} gap={8}>
            {/* Columna Principal */}
            <Flex
              flex="1"
              flexDirection="column"
              gap={6}
            >
              {/* Card de Información del Evento */}
              <Card
                boxShadow="xl"
                borderRadius="xl"
                overflow="hidden"
                bg="white"
              >
                <Box
                  position="relative"
                  h="200px"
                  bgGradient="linear(to-r, primary, buttonHover)"
                  display={{ base: "block", lg: "none" }}
                >
                  <Image
                    src={
                      event.pictures
                        ? (typeof event.pictures === 'string' && (event.pictures.startsWith('http://') || event.pictures.startsWith('https://'))
                            ? event.pictures
                            : "data:image/png;base64," + event.pictures)
                        : "./imagenes/img1.jpeg"
                    }
                    alt={event.title}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                </Box>
                
                <CardBody p={6}>
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Heading
                        as="h1"
                        fontSize={{ base: "2xl", md: "3xl" }}
                        fontWeight="700"
                        fontFamily="secondary"
                        color="tertiary"
                        mb={2}
                        lineHeight="1.2"
                      >
                        {event.title}
                      </Heading>
                      {event.addressRef?.place && (
                        <Text fontSize="lg" color="gray.600" fontFamily="secondary">
                          {event.addressRef.place}
                        </Text>
                      )}
                    </Box>

                    {event.description && (
                      <Text
                        fontSize="md"
                        color="gray.700"
                        fontFamily="secondary"
                        lineHeight="1.6"
                      >
                        {event.description}
                      </Text>
                    )}

                    <Divider />

                    <VStack align="stretch" spacing={3}>
                      <HStack>
                        <Icon
                          as={RiMapPinLine}
                          color="primary"
                          boxSize={5}
                        />
                        <Text
                          fontSize="md"
                          color="gray.700"
                          fontFamily="secondary"
                        >
                          {event.addressRef?.place}, {event.addressRef?.direction}
                        </Text>
                      </HStack>

                      {event?.dates && event.dates.length > 0 && (
                        <HStack>
                          <Icon
                            as={RiCalendar2Line}
                            color="primary"
                            boxSize={5}
                          />
                          <Select
                            onChange={handleSelectedDate}
                            value={selectedDate}
                            fontFamily="secondary"
                            borderColor="gray.300"
                            _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                            borderRadius="md"
                          >
                            {event.dates.map((date, index) => {
                              const objDate = getObjDate(date);
                              return (
                                <option key={index} value={index}>
                                  {objDate.date} - {objDate.timeStart} a {objDate.timeEnd}
                                </option>
                              );
                            })}
                          </Select>
                        </HStack>
                      )}

                      {event.adultsOnly && (
                        <Badge
                          colorScheme="red"
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                          w="fit-content"
                        >
                          +18 Años
                        </Badge>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Selector de zona (si existe mapa) */}
              {event?.venueMap?.imageUrl && zones.length > 0 && (
                <Box>
                  <VenueMapSelector
                    venueMap={event.venueMap}
                    tickets={dateTickets}
                    selectedZoneId={selectedZoneId}
                    onSelectZone={(z) => {
                      setSelectedZoneId(z.id);
                      resetTicketsToBuy();
                    }}
                  />
                  {selectedZone && (
                    <Box mt={4} p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <Text fontFamily="secondary" fontWeight="700" color="black">
                        Zona seleccionada: {selectedZone.name}
                      </Text>
                      <Text fontFamily="secondary" color="gray.600" mt={1}>
                        Ticket:{" "}
                        <b>
                          {zoneFilteredTickets?.[0]?.title || "No disponible para esta fecha"}
                        </b>
                        {zoneFilteredTickets?.[0]?.price != null && (
                          <>
                            {" "}— Precio: <b>${Number(zoneFilteredTickets[0].price).toLocaleString()}</b>
                          </>
                        )}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}

              {/* Card de Tickets */}
              <Card
                boxShadow="xl"
                borderRadius="xl"
                bg="white"
              >
                <CardBody p={6}>
                  <VStack align="stretch" spacing={6}>
                    <Heading
                      as="h2"
                      fontSize="xl"
                      fontFamily="secondary"
                      color="tertiary"
                      fontWeight="600"
                    >
                      Selecciona tus entradas
                    </Heading>

                    {zoneFilteredTickets && zoneFilteredTickets.length > 0 ? (
                      <VStack align="stretch" spacing={4}>
                        {zoneFilteredTickets.map((ticket) => {
                          const isSoldOut = ticket.selled >= ticket?.maxEntries;
                          const quantity = ticketsToBuy[ticket._id]?.quantity || 0;
                          
                          return (
                            <Box
                              key={ticket._id}
                              p={{ base: 4, md: 5 }}
                              border="2px solid"
                              borderColor={isSoldOut ? "red.200" : "gray.200"}
                              borderRadius="xl"
                              bg={isSoldOut ? "red.50" : "white"}
                              _hover={{
                                borderColor: isSoldOut ? "red.300" : "primary",
                                boxShadow: "md",
                              }}
                              transition="all 0.2s"
                            >
                              <Flex
                                justify="space-between"
                                align="center"
                                gap={4}
                                direction="row"
                              >
                                <Box flex="1" minW={0}>
                                  <Heading
                                    as="h3"
                                    fontSize={{ base: "sm", md: "lg" }}
                                    fontFamily="secondary"
                                    fontWeight="600"
                                    mb={1}
                                    noOfLines={1}
                                  >
                                    {ticket.title}
                                  </Heading>
                                  <Text
                                    fontSize={{ base: "lg", md: "2xl" }}
                                    fontWeight="700"
                                    color="primary"
                                    fontFamily="secondary"
                                  >
                                    ${ticket.price?.toLocaleString() || 0}
                                  </Text>
                                  {ticket.ticketType && ticket.ticketType !== "GENERAL" && (
                                    <Badge
                                      colorScheme="blue"
                                      fontSize="xs"
                                      mt={1}
                                    >
                                      {ticket.ticketType}
                                    </Badge>
                                  )}
                                </Box>

                                <Box flexShrink={0}>
                                  {isSoldOut ? (
                                    <Badge
                                      colorScheme="red"
                                      fontSize={{ base: "sm", md: "md" }}
                                      px={3}
                                      py={2}
                                      borderRadius="md"
                                    >
                                      Agotado
                                    </Badge>
                                  ) : (
                                    <HStack 
                                      spacing={2}
                                    >
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          addTicketToBuy(
                                            ticket,
                                            Math.max(0, quantity - 1)
                                          )
                                        }
                                        isDisabled={quantity === 0}
                                        borderRadius="full"
                                        minW="36px"
                                        h="36px"
                                        fontSize="md"
                                        bg="gray.100"
                                        _hover={{ bg: "gray.200" }}
                                        p={0}
                                      >
                                        -
                                      </Button>
                                      <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) =>
                                          addTicketToBuy(
                                            ticket,
                                            parseInt(e.target.value) || 0
                                          )
                                        }
                                        w="50px"
                                        h="36px"
                                        textAlign="center"
                                        borderColor="gray.300"
                                        _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                                        min={0}
                                        max={50}
                                        fontSize="sm"
                                        fontWeight="600"
                                        p={0}
                                      />
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          addTicketToBuy(ticket, quantity + 1)
                                        }
                                        isDisabled={
                                          quantity >= 50 ||
                                          quantity >=
                                            (ticket?.maxEntries - ticket?.selled || 50)
                                        }
                                        borderRadius="full"
                                        minW="36px"
                                        h="36px"
                                        fontSize="md"
                                        bg="black"
                                        color="white"
                                        _hover={{ bg: "#1a1a1a" }}
                                        p={0}
                                      >
                                        +
                                      </Button>
                                    </HStack>
                                  )}
                                </Box>
                              </Flex>
                            </Box>
                          );
                        })}
                      </VStack>
                    ) : (
                      <Alert
                        status="info"
                        borderRadius="md"
                        bg="blue.50"
                        borderColor="blue.200"
                      >
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="600" fontFamily="secondary">
                            No hay tickets disponibles
                          </Text>
                          <Text fontSize="sm" fontFamily="secondary">
                            No hay tickets disponibles para esta fecha. Intenta seleccionar otra fecha.
                          </Text>
                        </Box>
                      </Alert>
                    )}

                    <Divider />

                    {/* Código de Descuento */}
                    <Box>
                      <Text
                        fontSize={{ base: "md", md: "sm" }}
                        fontWeight="600"
                        mb={3}
                        fontFamily="secondary"
                        color="gray.700"
                      >
                        ¿Tienes un código de descuento?
                      </Text>
                      <Flex direction="column" gap={3}>
                        <Input
                          placeholder="Ingresa tu código"
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                          borderColor="gray.300"
                          borderWidth="2px"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                          fontFamily="secondary"
                          size={{ base: "md", md: "sm" }}
                          borderRadius="lg"
                        />
                        <Button
                          onClick={validateDiscountCode}
                          isLoading={isValidatingCode}
                          isDisabled={!discountCode}
                          bg="black"
                          color="white"
                          _hover={{ bg: "#1a1a1a" }}
                          fontFamily="secondary"
                          w="100%"
                          size={{ base: "md", md: "sm" }}
                          borderRadius="lg"
                          fontWeight="600"
                        >
                          Aplicar
                        </Button>
                      </Flex>
                      {discount > 0 && (
                        <Text
                          color="green.600"
                          fontSize="sm"
                          mt={3}
                          fontWeight="600"
                          fontFamily="secondary"
                        >
                          ✓ Descuento aplicado: -${discount.toLocaleString()}
                        </Text>
                      )}
                    </Box>

                    <Divider />

                    {/* Resumen de Compra */}
                    <Box
                      p={4}
                      bg="gray.50"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <VStack align="stretch" spacing={3}>
                        <Flex justify="space-between" fontFamily="secondary" align="center">
                          <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>Subtotal:</Text>
                          <Text fontWeight="600" fontSize={{ base: "md", md: "lg" }}>${subtotal.toLocaleString()}</Text>
                        </Flex>
                        
                        {serviceCharge > 0 && (
                          <Flex justify="space-between" fontFamily="secondary" align="center">
                            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>Cargo por servicio:</Text>
                            <Text fontWeight="600" fontSize={{ base: "md", md: "lg" }}>${serviceCharge.toLocaleString()}</Text>
                          </Flex>
                        )}
                        
                        {discount > 0 && (
                          <Flex justify="space-between" fontFamily="secondary" align="center">
                            <Text color="green.600" fontSize={{ base: "sm", md: "md" }}>Descuento:</Text>
                            <Text color="green.600" fontWeight="700" fontSize={{ base: "md", md: "lg" }}>
                              -${discount.toLocaleString()}
                            </Text>
                          </Flex>
                        )}
                        
                        <Divider borderColor="gray.300" />
                        
                        <Flex justify="space-between" fontFamily="secondary" align="center" pt={1}>
                          <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="700" color="black">
                            Total:
                          </Text>
                          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="700" color="black">
                            ${total.toLocaleString()}
                          </Text>
                        </Flex>
                      </VStack>
                    </Box>

                    {/* Botón de Compra */}
                    {localStorage.getItem("token") ? (
                      <Button
                        bg="black"
                        color="white"
                        size={{ base: "lg", md: "lg" }}
                        _hover={{ bg: "#1a1a1a", transform: "translateY(-2px)", boxShadow: "xl" }}
                        _active={{ bg: "#1a1a1a", transform: "translateY(0)" }}
                        borderRadius="lg"
                        leftIcon={<RiTicket2Line />}
                        isDisabled={!total || total === 0}
                        onClick={buyTicket}
                        isLoading={isLoading}
                        fontFamily="secondary"
                        fontWeight="600"
                        py={{ base: 6, md: 6 }}
                        w="100%"
                        transition="all 0.2s"
                      >
                        Comprar entradas
                      </Button>
                    ) : (
                      <Button
                        bg="black"
                        color="white"
                        size={{ base: "lg", md: "lg" }}
                        _hover={{ bg: "#1a1a1a" }}
                        borderRadius="lg"
                        onClick={() => navigate("/login")}
                        fontFamily="secondary"
                        fontWeight="600"
                        py={{ base: 6, md: 6 }}
                        w="100%"
                      >
                        Inicia sesión para comprar
                      </Button>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </Flex>

            {/* Sidebar con Imagen - Solo Desktop */}
            <Box
              w={{ base: "0", lg: "400px" }}
              flexShrink={0}
              display={{ base: "none", lg: "block" }}
            >
              <Card
                boxShadow="xl"
                borderRadius="xl"
                overflow="hidden"
                position="sticky"
                top="100px"
              >
                <Box
                  position="relative"
                  h="500px"
                  bgGradient="linear(to-b, gray.100, gray.200)"
                >
                  <Image
                    src={
                      event.pictures
                        ? (typeof event.pictures === 'string' && (event.pictures.startsWith('http://') || event.pictures.startsWith('https://'))
                            ? event.pictures
                            : "data:image/png;base64," + event.pictures)
                        : "./imagenes/img1.jpeg"
                    }
                    alt={event.title}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                </Box>
              </Card>
            </Box>
          </Flex>
        </Container>
      </Box>
      <Footer />

      {/* Modal CBU - Transferencia y comprobante */}
      <Modal isOpen={isCbuModalOpen} onClose={onCbuModalClose} size="lg">
        <ModalOverlay />
        <ModalContent fontFamily="secondary" borderRadius="xl">
          <ModalHeader>Pago por transferencia</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {cbuCheckoutData && (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="sm" color="gray.600">
                  Realizá la transferencia al siguiente CBU/Alias y subí el comprobante.
                </Text>
                <Box p={4} bg="gray.50" borderRadius="lg">
                  {cbuCheckoutData.cbuInfo?.cbu && (
                    <Box mb={2}>
                      <Text fontSize="xs" color="gray.500">CBU</Text>
                      <Text fontWeight="700" fontSize="lg" letterSpacing="1px">{cbuCheckoutData.cbuInfo.cbu}</Text>
                    </Box>
                  )}
                  {cbuCheckoutData.cbuInfo?.alias && (
                    <Box mb={2}>
                      <Text fontSize="xs" color="gray.500">Alias</Text>
                      <Text fontWeight="700" fontSize="lg">{cbuCheckoutData.cbuInfo.alias}</Text>
                    </Box>
                  )}
                  {cbuCheckoutData.cbuInfo?.bankName && (
                    <Box mb={2}>
                      <Text fontSize="xs" color="gray.500">Banco</Text>
                      <Text fontWeight="600">{cbuCheckoutData.cbuInfo.bankName}</Text>
                    </Box>
                  )}
                  <Box>
                    <Text fontSize="xs" color="gray.500">Monto a transferir</Text>
                    <Text fontWeight="700" fontSize="xl" color="green.600">${cbuCheckoutData.totalAmount?.toLocaleString("es-AR")}</Text>
                  </Box>
                </Box>
                <FormControl>
                  <Text mb={2} fontSize="sm" fontWeight="500">Comprobante de pago (imagen)</Text>
                  <Input type="file" accept="image/*" onChange={handleProofFileChange} p={1} />
                  {proofPreview && (
                    <Box mt={2}>
                      <Image src={proofPreview} alt="Vista previa" maxH="120px" borderRadius="md" />
                    </Box>
                  )}
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCbuModalClose}>Cancelar</Button>
            <Button colorScheme="green" onClick={handleSubmitCbuProof} isLoading={isSubmittingProof} isDisabled={!proofFile}>
              Enviar comprobante
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
// sad
export default EventDetails;
