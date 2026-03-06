import React, { useState, useEffect, useCallback } from "react";
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
  InputGroup,
  InputLeftElement,
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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  MdArrowBack,
  MdPrint,
  MdEmail,
  MdCheckCircle,
  MdLogout,
  MdStorefront,
  MdSearch,
  MdHistory,
  MdShoppingCart,
} from "react-icons/md";
import ticketApi from "../../Api/ticket";
import pointOfSaleApi from "../../Api/pointOfSale";
import { useAuth } from "../../auth/context/AuthContext";
import ThermalTicket from "../../components/ThermalTicket/ThermalTicket";
import { getEventImage } from "../../utils/eventUtils";

const DEMO_QR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAABsElEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBuAABHgAAAABJRU5ErkJggg==";

const PDV_PAYMENT_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "mercadopago", label: "Mercado Pago" },
];

const PAYMENT_LABELS = { efectivo: "Efectivo", transferencia: "Transferencia", mercadopago: "Mercado Pago" };

const EventCard = ({ event, onSell }) => {
  const totalAvailable = (event.tickets || []).reduce((s, t) => s + (t.available || 0), 0);
  const hasConsumiciones = (event.consumiciones || []).length > 0;
  const hasSome = totalAvailable > 0 || hasConsumiciones;
  const coverImg = getEventImage(event.pictures);

  return (
    <Card
      borderRadius="2xl"
      boxShadow="sm"
      overflow="hidden"
      opacity={hasSome ? 1 : 0.5}
      transition="box-shadow 0.2s, transform 0.15s"
      _hover={hasSome ? { boxShadow: "lg", transform: "translateY(-2px)" } : {}}
      cursor={hasSome ? "pointer" : "default"}
      onClick={hasSome ? () => onSell(event) : undefined}
    >
      <Flex direction={{ base: "column", sm: "row" }}>
        {coverImg ? (
          <Box
            w={{ base: "100%", sm: "120px" }}
            h={{ base: "160px", sm: "auto" }}
            flexShrink={0}
            overflow="hidden"
          >
            <Image
              src={coverImg}
              alt={event.title}
              w="100%"
              h="100%"
              objectFit="cover"
            />
          </Box>
        ) : (
          <Flex
            w={{ base: "100%", sm: "120px" }}
            h={{ base: "80px", sm: "auto" }}
            bg="gray.100"
            align="center"
            justify="center"
            flexShrink={0}
          >
            <Icon as={MdStorefront} boxSize={8} color="gray.300" />
          </Flex>
        )}

        <CardBody p={4}>
          <Flex justify="space-between" align="flex-start" gap={3}>
            <Box flex="1" minW={0}>
              <Text fontWeight="700" fontSize="md" noOfLines={2} mb={1}>
                {event.title}
              </Text>
              {event.addressRef && (
                <Text color="gray.500" fontSize="xs" mb={2}>
                  {event.addressRef.province}, {event.addressRef.locality}
                </Text>
              )}
              <HStack spacing={2} flexWrap="wrap">
                {totalAvailable > 0 && (
                  <Badge colorScheme="green" borderRadius="md" fontSize="xs">
                    {totalAvailable} entradas
                  </Badge>
                )}
                {hasConsumiciones && (
                  <Badge colorScheme="purple" borderRadius="md" fontSize="xs">
                    {event.consumiciones.length} consumiciones
                  </Badge>
                )}
                {!hasSome && (
                  <Badge colorScheme="red" borderRadius="md" fontSize="xs">Sin stock</Badge>
                )}
              </HStack>
            </Box>
            <Button
              bg="black"
              color="white"
              borderRadius="xl"
              size="sm"
              flexShrink={0}
              _hover={{ bg: "#1a1a1a" }}
              isDisabled={!hasSome}
              onClick={(e) => { e.stopPropagation(); onSell(event); }}
            >
              Vender
            </Button>
          </Flex>
        </CardBody>
      </Flex>
    </Card>
  );
};

const PdvPanel = () => {
  const { pdvId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  const [pdv, setPdv] = useState(null);
  const [events, setEvents] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saleTab, setSaleTab] = useState(0);

  // Ticket sale state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketQty, setTicketQty] = useState(1);

  // Consumacion sale state (tab separado)
  const [selectedConsumacion, setSelectedConsumacion] = useState(null);
  const [consumacionQty, setConsumacionQty] = useState(1);

  // Combo: consumaciones agregadas junto con la entrada
  const [comboItems, setComboItems] = useState({}); // {consumacionId: qty}

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
      setError(err.response?.data?.message || "No se pudo cargar el punto de venta o no tenés acceso");
    } finally {
      setLoading(false);
    }
  };

  const loadSales = useCallback(async () => {
    try {
      setLoadingSales(true);
      const { data } = await pointOfSaleApi.getPdvSales(pdvId);
      setSales(data?.sales || []);
    } catch (err) {
      toast({ title: "Error al cargar ventas", status: "error", duration: 3000 });
    } finally {
      setLoadingSales(false);
    }
  }, [pdvId]);

  useEffect(() => {
    if (activeTab === 1) loadSales();
  }, [activeTab, loadSales]);

  const filteredEvents = events.filter((e) =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.addressRef?.locality?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenSale = (event) => {
    const availableTickets = (event.tickets || []).filter((t) => t.available > 0);
    const availableConsumiciones = event.consumiciones || [];
    setSelectedEvent(event);
    setSelectedTicket(availableTickets[0] || null);
    setTicketQty(1);
    setSelectedConsumacion(availableConsumiciones[0] || null);
    setConsumacionQty(1);
    setComboItems({});
    setPdvPaymentType("efectivo");
    setCustomerData({ email: "", firstname: "", lastname: "" });
    setSaleTab(availableTickets.length > 0 ? 0 : 1);
    onSaleOpen();
  };

  const handleCloseSale = () => {
    setSelectedEvent(null);
    setSelectedTicket(null);
    setSelectedConsumacion(null);
    onSaleClose();
  };

  const isDemo = user?.isDemo === true;

  const handleConfirmSale = async () => {
    if (!customerData.email) {
      toast({ title: "Ingresá el email del cliente", status: "error", duration: 2000 });
      return;
    }

    // Modo demo: simular venta sin llamar a la API
    if (isDemo) {
      const name = [customerData.firstname, customerData.lastname].filter(Boolean).join(" ") || customerData.email;
      const comboList = Object.entries(comboItems)
        .filter(([, qty]) => qty > 0)
        .map(([consumacionId, quantity]) => ({ consumacionId, quantity }));

      if (saleTab === 0) {
        if (!selectedTicket) { toast({ title: "Seleccioná un tipo de entrada", status: "error", duration: 2000 }); return; }
        const comboTotal = availableConsumiciones
          .filter((c) => comboItems[c._id] > 0)
          .reduce((s, c) => s + c.price * (comboItems[c._id] || 0), 0);
        setLastSale({
          paymentId: `demo-${Date.now()}`,
          type: "ticket",
          isDemo: true,
          eventName: selectedEvent.title,
          itemName: selectedTicket.title,
          quantity: ticketQty,
          total: selectedTicket.price * ticketQty + comboTotal,
          customerName: name,
          customerEmail: customerData.email,
          paymentType: pdvPaymentType,
          qrImages: Array.from({ length: ticketQty }, () => DEMO_QR),
          pdvName: pdv?.name,
          comboItems: comboList,
        });
      } else {
        if (!selectedConsumacion) { toast({ title: "Seleccioná una consumación", status: "error", duration: 2000 }); return; }
        setLastSale({
          paymentId: `demo-${Date.now()}`,
          type: "consumacion",
          isDemo: true,
          eventName: selectedEvent.title,
          itemName: selectedConsumacion.name,
          quantity: consumacionQty,
          total: selectedConsumacion.price * consumacionQty,
          customerName: name,
          customerEmail: customerData.email,
          paymentType: pdvPaymentType,
          qrImages: [],
          pdvName: pdv?.name,
        });
      }
      onSaleClose();
      onSuccessOpen();
      return;
    }

    try {
      setIsProcessing(true);

      if (saleTab === 0) {
        if (!selectedTicket) { toast({ title: "Seleccioná un tipo de entrada", status: "error", duration: 2000 }); return; }
        const comboList = Object.entries(comboItems)
          .filter(([, qty]) => Number(qty) > 0)
          .map(([consumacionId, quantity]) => ({ consumacionId, quantity: Number(quantity) }));
        const comboTotal = availableConsumiciones
          .filter((c) => comboItems[c._id] > 0)
          .reduce((s, c) => s + c.price * (comboItems[c._id] || 0), 0);
        const { data } = await ticketApi.sellTicket({
          eventId: selectedEvent._id,
          ticketId: selectedTicket._id,
          quantity: ticketQty,
          customerEmail: customerData.email,
          customerFirstname: customerData.firstname,
          customerLastname: customerData.lastname,
          pointOfSaleId: pdvId,
          pdvPaymentType,
          consumacionesOrden: comboList.length > 0 ? comboList : undefined,
        });
        setLastSale({
          paymentId: data.paymentId,
          type: "ticket",
          eventName: selectedEvent.title,
          itemName: selectedTicket.title,
          quantity: ticketQty,
          total: selectedTicket.price * ticketQty + comboTotal,
          customerName: [customerData.firstname, customerData.lastname].filter(Boolean).join(" ") || customerData.email,
          customerEmail: customerData.email,
          paymentType: pdvPaymentType,
          qrImages: data.qrImages || [],
          pdvName: pdv?.name,
          comboItems: comboList,
        });
      } else {
        if (!selectedConsumacion) { toast({ title: "Seleccioná una consumación", status: "error", duration: 2000 }); return; }
        const { data } = await ticketApi.sellConsumicion({
          eventId: selectedEvent._id,
          consumacionId: selectedConsumacion._id,
          quantity: consumacionQty,
          customerEmail: customerData.email,
          customerFirstname: customerData.firstname,
          customerLastname: customerData.lastname,
          pointOfSaleId: pdvId,
          pdvPaymentType,
        });
        setLastSale({
          paymentId: data.paymentId,
          type: "consumacion",
          eventName: selectedEvent.title,
          itemName: selectedConsumacion.name,
          quantity: consumacionQty,
          total: data.consumacion?.total || selectedConsumacion.price * consumacionQty,
          customerName: [customerData.firstname, customerData.lastname].filter(Boolean).join(" ") || customerData.email,
          customerEmail: customerData.email,
          paymentType: pdvPaymentType,
          qrImages: [],
          pdvName: pdv?.name,
        });
      }

      onSaleClose();
      onSuccessOpen();
      loadPanel();
    } catch (err) {
      toast({ title: "Error en la venta", description: err.response?.data?.message || err.message, status: "error", duration: 5000 });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => window.print();

  const handleResendEmail = async () => {
    if (!lastSale?.paymentId) return;
    try {
      setIsResending(true);
      await ticketApi.resendPdvSaleEmail(lastSale.paymentId);
      toast({ title: "Email reenviado", description: `Enviado a ${lastSale.customerEmail}`, status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error al reenviar", description: err.response?.data?.message || "No se pudo reenviar", status: "error", duration: 3000 });
    } finally {
      setIsResending(false);
    }
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
        <Box bg="black" px={6} py={4}><Text color="white" fontWeight="bold" fontSize="lg">GETPASS</Text></Box>
        <Container maxW="700px" py={8} px={4}>
          <Alert status="error" borderRadius="xl" mb={4}><AlertIcon />{error || "Punto de venta no encontrado"}</Alert>
          <Button leftIcon={<Icon as={MdArrowBack} />} onClick={() => navigate("/pdv")}>Volver</Button>
        </Container>
      </Flex>
    );
  }

  const availableTickets = selectedEvent ? (selectedEvent.tickets || []).filter((t) => t.available > 0) : [];
  const availableConsumiciones = selectedEvent ? (selectedEvent.consumiciones || []) : [];

  return (
    <Flex minH="100vh" bg="gray.50" direction="column">
      {/* Header */}
      <Box bg="black" px={6} py={4}>
        <Flex align="center" justify="space-between" maxW="800px" mx="auto">
          <HStack spacing={3}>
            <Button size="sm" variant="ghost" color="white" leftIcon={<Icon as={MdArrowBack} />}
              _hover={{ bg: "whiteAlpha.200" }} onClick={() => navigate("/pdv")}>
              Mis PDVs
            </Button>
            <Text color="gray.400" display={{ base: "none", sm: "block" }}>›</Text>
            <Text color="white" fontWeight="600" display={{ base: "none", sm: "block" }}>{pdv.name}</Text>
          </HStack>
          <Button size="sm" variant="ghost" color="white" leftIcon={<Icon as={MdLogout} />}
            _hover={{ bg: "whiteAlpha.200" }} onClick={() => { logout(); navigate("/pdv/login"); }}>
            Salir
          </Button>
        </Flex>
      </Box>

      <Container maxW="800px" py={5} px={4} flex="1">
        <HStack mb={5}>
          <Icon as={MdStorefront} color="gray.500" />
          <Heading size="md">{pdv.name}</Heading>
          {pdv.code && <Badge colorScheme="gray">{pdv.code}</Badge>}
        </HStack>

        <Tabs index={activeTab} onChange={setActiveTab} variant="soft-rounded" colorScheme="blackAlpha">
          <TabList mb={5} gap={2}>
            <Tab fontSize="sm" _selected={{ bg: "black", color: "white" }}>
              <Icon as={MdShoppingCart} mr={2} />Eventos
            </Tab>
            <Tab fontSize="sm" _selected={{ bg: "black", color: "white" }}>
              <Icon as={MdHistory} mr={2} />Ventas del día
            </Tab>
          </TabList>

          <TabPanels>
            {/* TAB: Eventos */}
            <TabPanel p={0}>
              <InputGroup mb={4}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar evento..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  bg="white"
                  borderRadius="xl"
                  boxShadow="sm"
                />
              </InputGroup>

              {filteredEvents.length === 0 ? (
                <Box bg="white" borderRadius="2xl" p={8} textAlign="center" boxShadow="sm">
                  <Text color="gray.500">
                    {search ? "No se encontraron eventos con ese nombre." : "No hay eventos disponibles para este punto de venta."}
                  </Text>
                </Box>
              ) : (
                <Stack spacing={3}>
                  {filteredEvents.map((event) => (
                    <EventCard key={event._id} event={event} onSell={handleOpenSale} />
                  ))}
                </Stack>
              )}
            </TabPanel>

            {/* TAB: Historial de ventas */}
            <TabPanel p={0}>
              {loadingSales ? (
                <Flex justify="center" py={8}><Spinner color="black" /></Flex>
              ) : sales.length === 0 ? (
                <Box bg="white" borderRadius="2xl" p={8} textAlign="center" boxShadow="sm">
                  <Text color="gray.500">No hay ventas registradas todavía en este punto de venta.</Text>
                </Box>
              ) : (
                <Box bg="white" borderRadius="2xl" boxShadow="sm" overflow="hidden">
                  <TableContainer>
                    <Table size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Cliente</Th>
                          <Th>Ítem</Th>
                          <Th>Cant.</Th>
                          <Th>Total</Th>
                          <Th>Pago</Th>
                          <Th>Tipo</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {sales.map((sale) => (
                          <Tr key={sale._id} _hover={{ bg: "gray.50" }}>
                            <Td>
                              <Text fontSize="xs" fontWeight="500">{sale.customerName || sale.customerEmail}</Text>
                              <Text fontSize="xs" color="gray.400">{sale.customerEmail}</Text>
                            </Td>
                            <Td>
                              <Text fontSize="xs" fontWeight="500">{sale.ticketTitle}</Text>
                              <Text fontSize="xs" color="gray.400" noOfLines={1}>{sale.eventTitle}</Text>
                            </Td>
                            <Td><Text fontSize="xs">{sale.quantity}</Text></Td>
                            <Td><Text fontSize="xs" fontWeight="600">${sale.total?.toLocaleString()}</Text></Td>
                            <Td>
                              <Badge fontSize="xs" colorScheme={
                                sale.pdvPaymentType === "efectivo" ? "green" :
                                sale.pdvPaymentType === "transferencia" ? "blue" : "purple"
                              }>
                                {PAYMENT_LABELS[sale.pdvPaymentType] || sale.pdvPaymentType}
                              </Badge>
                            </Td>
                            <Td>
                              <Badge fontSize="xs" colorScheme={sale.isConsumacion ? "purple" : "blue"}>
                                {sale.isConsumacion ? "Consumación" : "Entrada"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                  <Box p={4} borderTopWidth="1px">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">{sales.length} ventas</Text>
                      <Text fontSize="sm" fontWeight="700">
                        Total: ${sales.reduce((s, sale) => s + (sale.total || 0), 0).toLocaleString()}
                      </Text>
                    </Flex>
                  </Box>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Modal de venta */}
      <Modal isOpen={isSaleOpen} onClose={handleCloseSale} size={{ base: "full", sm: "lg" }} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent borderRadius={{ base: 0, sm: "2xl" }}>
          <ModalHeader borderBottomWidth="1px" pb={3}>
            <Text fontSize="md" fontWeight="700" noOfLines={1}>{selectedEvent?.title}</Text>
            <Text fontSize="sm" color="gray.500" fontWeight="normal">Nueva venta</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={5}>
            <Stack spacing={4}>
              {/* Tipo de venta: Entradas o Consumaciones */}
              <Tabs index={saleTab} onChange={setSaleTab} variant="soft-rounded" colorScheme="blackAlpha" size="sm">
                <TabList>
                  <Tab _selected={{ bg: "black", color: "white" }} isDisabled={availableTickets.length === 0}>
                    Entradas ({availableTickets.length})
                  </Tab>
                  <Tab _selected={{ bg: "black", color: "white" }} isDisabled={availableConsumiciones.length === 0}>
                    Consumaciones ({availableConsumiciones.length})
                  </Tab>
                </TabList>

                <TabPanels mt={4}>
                  {/* Panel Entradas */}
                  <TabPanel p={0}>
                    <Stack spacing={3}>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Tipo de entrada</FormLabel>
                        <Select
                          value={selectedTicket?._id || ""}
                          onChange={(e) => {
                            const t = availableTickets.find((x) => x._id === e.target.value);
                            setSelectedTicket(t || null);
                            setTicketQty(1);
                          }}
                          borderRadius="lg"
                          placeholder={availableTickets.length === 0 ? "Sin disponibilidad" : undefined}
                        >
                          {availableTickets.map((t) => (
                            <option key={t._id} value={t._id}>
                              {t.title} — ${t.price} ({t.available} disp.)
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      {selectedTicket && (
                        <FormControl isRequired>
                          <FormLabel fontSize="sm">Cantidad</FormLabel>
                          <NumberInput min={1} max={selectedTicket.available} value={ticketQty}
                            onChange={(v) => { const n = parseInt(v, 10); if (!isNaN(n)) setTicketQty(n); }}>
                            <NumberInputField borderRadius="lg" />
                            <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      )}
                      {selectedTicket && (
                        <>
                          {/* Agregar consumaciones al combo */}
                          {availableConsumiciones.length > 0 && (
                            <Accordion allowToggle>
                              <AccordionItem border="none">
                                <AccordionButton px={0} _hover={{ bg: "transparent" }}>
                                  <Text fontSize="sm" color="gray.500" flex="1" textAlign="left">
                                    + Agregar consumaciones al combo
                                  </Text>
                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel px={0} pt={2}>
                                  <Stack spacing={2}>
                                    {availableConsumiciones.map((c) => (
                                      <Flex key={c._id} align="center" justify="space-between" bg="gray.50" borderRadius="lg" px={3} py={2}>
                                        <HStack spacing={2} flex="1">
                                          {c.imageUrl && <Image src={c.imageUrl} alt={c.name} w="32px" h="32px" objectFit="cover" borderRadius="md" />}
                                          <Box>
                                            <Text fontSize="sm" fontWeight="500">{c.name}</Text>
                                            <Text fontSize="xs" color="gray.500">${c.price}</Text>
                                          </Box>
                                        </HStack>
                                        <HStack spacing={1}>
                                          <Button size="xs" variant="ghost" onClick={() => setComboItems((p) => ({ ...p, [c._id]: Math.max(0, (p[c._id] || 0) - 1) }))}>−</Button>
                                          <Text fontSize="sm" w="20px" textAlign="center">{comboItems[c._id] || 0}</Text>
                                          <Button size="xs" variant="ghost" onClick={() => setComboItems((p) => ({ ...p, [c._id]: (p[c._id] || 0) + 1 }))}>+</Button>
                                        </HStack>
                                      </Flex>
                                    ))}
                                  </Stack>
                                </AccordionPanel>
                              </AccordionItem>
                            </Accordion>
                          )}

                          <Box bg="gray.50" borderRadius="xl" p={3}>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm" color="gray.600">Entrada x{ticketQty}</Text>
                              <Text fontSize="sm">${selectedTicket.price * ticketQty}</Text>
                            </Flex>
                            {availableConsumiciones.filter((c) => comboItems[c._id] > 0).map((c) => (
                              <Flex key={c._id} justify="space-between" mb={1}>
                                <Text fontSize="sm" color="gray.600">{c.name} x{comboItems[c._id]}</Text>
                                <Text fontSize="sm">${c.price * comboItems[c._id]}</Text>
                              </Flex>
                            ))}
                            <Divider my={1} />
                            <Flex justify="space-between">
                              <Text fontSize="sm" fontWeight="700">Total</Text>
                              <Text fontSize="sm" fontWeight="700">
                                ${selectedTicket.price * ticketQty + availableConsumiciones.filter((c) => comboItems[c._id] > 0).reduce((s, c) => s + c.price * comboItems[c._id], 0)}
                              </Text>
                            </Flex>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </TabPanel>

                  {/* Panel Consumaciones */}
                  <TabPanel p={0}>
                    <Stack spacing={3}>
                      {availableConsumiciones.length === 0 ? (
                        <Text color="gray.500" fontSize="sm">Este evento no tiene consumaciones disponibles.</Text>
                      ) : (
                        <>
                          <SimpleGrid columns={2} spacing={2} mb={2}>
                            {availableConsumiciones.map((c) => (
                              <Box
                                key={c._id}
                                borderWidth="2px"
                                borderColor={selectedConsumacion?._id === c._id ? "black" : "gray.200"}
                                borderRadius="xl"
                                p={3}
                                cursor="pointer"
                                onClick={() => { setSelectedConsumacion(c); setConsumacionQty(1); }}
                                bg={selectedConsumacion?._id === c._id ? "gray.50" : "white"}
                                transition="border-color 0.15s"
                              >
                                {c.imageUrl && (
                                  <Image src={c.imageUrl} alt={c.name} h="60px" w="100%" objectFit="cover"
                                    borderRadius="md" mb={2} />
                                )}
                                <Text fontSize="sm" fontWeight="600" noOfLines={1}>{c.name}</Text>
                                <Text fontSize="sm" color="gray.600">${c.price}</Text>
                                {c.stock !== undefined && c.stock !== null && (
                                  <Text fontSize="xs" color={c.stock > 0 ? "green.500" : "red.400"}>
                                    {c.stock > 0 ? `${c.stock} disponibles` : "Sin stock"}
                                  </Text>
                                )}
                              </Box>
                            ))}
                          </SimpleGrid>
                          {selectedConsumacion && (
                            <FormControl>
                              <FormLabel fontSize="sm">Cantidad</FormLabel>
                              <NumberInput min={1}
                                max={selectedConsumacion.stock ?? 999}
                                value={consumacionQty}
                                onChange={(v) => { const n = parseInt(v, 10); if (!isNaN(n)) setConsumacionQty(n); }}>
                                <NumberInputField borderRadius="lg" />
                                <NumberInputStepper><NumberIncrementStepper /><NumberDecrementStepper /></NumberInputStepper>
                              </NumberInput>
                            </FormControl>
                          )}
                          {selectedConsumacion && (
                            <Box bg="gray.50" borderRadius="xl" p={3}>
                              <Flex justify="space-between">
                                <Text fontSize="sm" color="gray.600">Subtotal</Text>
                                <Text fontSize="sm" fontWeight="700">${selectedConsumacion.price * consumacionQty}</Text>
                              </Flex>
                            </Box>
                          )}
                        </>
                      )}
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Divider />

              <FormControl isRequired>
                <FormLabel fontSize="sm">Medio de pago</FormLabel>
                <Select value={pdvPaymentType} onChange={(e) => setPdvPaymentType(e.target.value)} borderRadius="lg">
                  {PDV_PAYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm">Email del cliente</FormLabel>
                <Input type="email" value={customerData.email}
                  onChange={(e) => setCustomerData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="cliente@email.com" borderRadius="lg" />
              </FormControl>

              <Flex gap={3}>
                <FormControl>
                  <FormLabel fontSize="sm">Nombre</FormLabel>
                  <Input value={customerData.firstname}
                    onChange={(e) => setCustomerData((p) => ({ ...p, firstname: e.target.value }))}
                    placeholder="Nombre" borderRadius="lg" />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm">Apellido</FormLabel>
                  <Input value={customerData.lastname}
                    onChange={(e) => setCustomerData((p) => ({ ...p, lastname: e.target.value }))}
                    placeholder="Apellido" borderRadius="lg" />
                </FormControl>
              </Flex>
            </Stack>
          </ModalBody>

          <ModalFooter borderTopWidth="1px" gap={3}>
            <Button variant="ghost" onClick={handleCloseSale} borderRadius="xl">Cancelar</Button>
            <Button bg="black" color="white" borderRadius="xl" flex="1" _hover={{ bg: "#1a1a1a" }}
              isDisabled={
                !customerData.email ||
                (saleTab === 0 && !selectedTicket) ||
                (saleTab === 1 && !selectedConsumacion)
              }
              isLoading={isProcessing}
              onClick={handleConfirmSale}>
              Confirmar venta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de éxito */}
      <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} size={{ base: "full", sm: "md" }} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent borderRadius={{ base: 0, sm: "2xl" }}>
          <ModalBody py={8}>
            {lastSale && (
              <VStack spacing={6}>
                <Flex w="72px" h="72px" bg="green.50" borderRadius="full" align="center" justify="center">
                  <Icon as={MdCheckCircle} boxSize={10} color="green.500" />
                </Flex>
                <Box textAlign="center">
                  <Heading size="md" mb={1}>
                    {lastSale.isDemo ? "Venta simulada (demo)" : "¡Venta registrada!"}
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    {lastSale.isDemo
                      ? "En modo demo la venta es ilustrativa, no descuenta stock ni envía emails reales."
                      : lastSale.type === "ticket"
                      ? "El ticket se envió por email al cliente"
                      : "La consumación se registró correctamente"}
                  </Text>
                </Box>

                <Box w="full" bg="gray.50" borderRadius="xl" p={4}>
                  <Stack spacing={2}>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Evento</Text>
                      <Text fontSize="sm" fontWeight="500" maxW="60%" textAlign="right">{lastSale.eventName}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">{lastSale.type === "ticket" ? "Entrada" : "Consumación"}</Text>
                      <Text fontSize="sm">{lastSale.itemName}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Cantidad</Text>
                      <Text fontSize="sm">{lastSale.quantity}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Cliente</Text>
                      <Text fontSize="sm">{lastSale.customerEmail}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text fontSize="sm" color="gray.600">Pago</Text>
                      <Text fontSize="sm">{PAYMENT_LABELS[lastSale.paymentType]}</Text>
                    </Flex>
                    <Divider />
                    <Flex justify="space-between">
                      <Text fontWeight="700">Total</Text>
                      <Text fontWeight="700" fontSize="lg">${lastSale.total?.toLocaleString()}</Text>
                    </Flex>
                  </Stack>
                </Box>

                {lastSale.qrImages?.length > 0 && (
                  <Box w="full">
                    <Text fontSize="sm" color="gray.500" textAlign="center" mb={3}>
                      QR{lastSale.qrImages.length > 1 ? "s" : ""} generados:
                    </Text>
                    <Flex wrap="wrap" justify="center" gap={2}>
                      {lastSale.qrImages.map((qr, i) => (
                        <Image key={i} src={qr} alt={`QR ${i + 1}`} w="90px" h="90px" borderRadius="lg" />
                      ))}
                    </Flex>
                  </Box>
                )}

                <Stack w="full" spacing={3}>
                  <Button w="full" bg="black" color="white" borderRadius="xl"
                    leftIcon={<Icon as={MdPrint} />} _hover={{ bg: "#1a1a1a" }} onClick={handlePrint}>
                    Imprimir ticket
                  </Button>
                  {lastSale.type === "ticket" && (
                    <Button w="full" variant="outline" borderRadius="xl"
                      leftIcon={<Icon as={MdEmail} />} isLoading={isResending} onClick={handleResendEmail}>
                      Reenviar email al cliente
                    </Button>
                  )}
                  <Button w="full" variant="ghost" borderRadius="xl" onClick={onSuccessClose}>
                    Nueva venta
                  </Button>
                </Stack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Componente de impresión térmica */}
      {lastSale && (
        <ThermalTicket
          tickets={lastSale.qrImages}
          eventName={lastSale.eventName}
          ticketType={lastSale.itemName}
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
