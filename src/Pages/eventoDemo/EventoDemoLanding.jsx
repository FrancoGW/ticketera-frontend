import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import eventApi from "../../Api/event";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  Card,
  CardBody,
  Badge,
  Divider,
  VStack,
  HStack,
  Icon,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  useToast,
  Button,
  Select,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { RiCalendar2Line, RiMapPinLine, RiTicket2Line } from "react-icons/ri";
import { getObjDate } from "../../common/utils";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";

const SELLING_METHOD_LABELS = {
  FAST: "Mercado Pago (pagos instantáneos)",
  SIMPLE: "Depósito Directo / CBU",
  CUSTOM: "A tu medida / GP-COINS",
};

const EventoDemoLanding = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isOpen: isDemoModalOpen, onOpen: onDemoModalOpen, onClose: onDemoModalClose } = useDisclosure();
  const { isOpen: isLoginRequiredOpen, onOpen: onLoginRequiredOpen, onClose: onLoginRequiredClose } = useDisclosure();
  const { data: user } = useSelector((state) => state.user);
  const isLoggedIn = !!user;

  // Estado para simular la compra (todo clickeable, sin redirigir)
  const [ticketsToBuy, setTicketsToBuy] = useState({});
  const [consumicionesQty, setConsumicionesQty] = useState({});
  const [selectedRrppId, setSelectedRrppId] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const addTicketQty = (ticketId, delta) => {
    setTicketsToBuy((prev) => {
      const current = prev[ticketId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const nextState = { ...prev };
        delete nextState[ticketId];
        return nextState;
      }
      return { ...prev, [ticketId]: next };
    });
  };

  const setConsumicionQty = (consumicionId, qty) => {
    const n = Math.max(0, parseInt(String(qty), 10) || 0);
    setConsumicionesQty((prev) => (n === 0 ? (() => { const next = { ...prev }; delete next[consumicionId]; return next; })() : { ...prev, [consumicionId]: n }));
  };

  useEffect(() => {
    const fetchDemo = async () => {
      try {
        setLoading(true);
        const { data } = await eventApi.getDemoEvent();
        setEvent(data?.event || null);
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudo cargar el evento demo.",
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDemo();
  }, [toast]);

  if (loading) {
    return (
      <>
        <Header />
        <Center minH="50vh">
          <Spinner size="xl" color="primary" />
        </Center>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <Center minH="50vh">
          <Text color="gray.500">Evento demo no disponible.</Text>
        </Center>
        <Footer />
      </>
    );
  }

  const pictureSrc = event.pictures
    ? typeof event.pictures === "string" &&
      (event.pictures.startsWith("http://") || event.pictures.startsWith("https://"))
      ? event.pictures
      : "data:image/png;base64," + event.pictures
    : "./imagenes/img1.jpeg";

  const consumiciones = Array.isArray(event.consumiciones) ? event.consumiciones : [];
  const rrpp = Array.isArray(event.rrpp) ? event.rrpp : [];
  const tickets = Array.isArray(event.tickets) ? event.tickets : [];
  const dates = Array.isArray(event.dates) ? event.dates : [];

  const subtotalTickets = tickets.reduce((sum, t) => sum + (ticketsToBuy[t._id] || 0) * Number(t.price || 0), 0);
  const subtotalConsumiciones = consumiciones.reduce((sum, c, idx) => sum + (consumicionesQty[c._id ?? `consumicion-${idx}`] || 0) * Number(c.price || 0), 0);
  const serviceFee = subtotalTickets * (event.serviceFeePercentage ?? (event.sellingMethod === 'SIMPLE' || event.sellingMethod === 'CUSTOM' ? 0 : 0.1));
  const total = subtotalTickets + serviceFee + subtotalConsumiciones;
  const hasSelection = Object.keys(ticketsToBuy).some((id) => (ticketsToBuy[id] || 0) > 0) || Object.keys(consumicionesQty).some((id) => (consumicionesQty[id] || 0) > 0);
  const isTransferMethod = event.sellingMethod === "SIMPLE";
  const hasCbuInfo = isTransferMethod && event.cbuInfo && (event.cbuInfo.cbu || event.cbuInfo.alias);

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProofPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSimularCompra = () => {
    if (!isLoggedIn) {
      onLoginRequiredOpen();
      return;
    }
    onDemoModalOpen();
  };

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
          <Alert
            status="info"
            variant="left-accent"
            borderRadius="lg"
            mb={6}
            bg="blue.50"
            borderColor="blue.200"
          >
            <AlertIcon color="blue.500" />
            <Box>
              <AlertTitle fontFamily="secondary">Vista previa — Evento demo</AlertTitle>
              <AlertDescription>
                Así verían los clientes tu evento publicado: método de pago, consumiciones, RRPPs y entradas.
                Solo visible desde tu cuenta de organizador demo.
              </AlertDescription>
            </Box>
          </Alert>

          <Flex flexDir={{ base: "column", lg: "row" }} gap={8}>
            <Flex flex="1" flexDirection="column" gap={6}>
              <Card boxShadow="xl" borderRadius="xl" overflow="hidden" bg="white">
                <Box
                  position="relative"
                  h="200px"
                  bgGradient="linear(to-r, primary, buttonHover)"
                  display={{ base: "block", lg: "none" }}
                >
                  <Image
                    src={pictureSrc}
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
                      >
                        {event.title}
                      </Heading>
                      {event.addressRef?.place && (
                        <Text fontSize="lg" color="gray.600" fontFamily="secondary">
                          {event.addressRef.place}
                        </Text>
                      )}
                    </Box>

                    {event.sellingMethod && (
                      <Badge
                        colorScheme={
                          event.sellingMethod === "FAST"
                            ? "blue"
                            : event.sellingMethod === "SIMPLE"
                            ? "teal"
                            : "purple"
                        }
                        fontSize="sm"
                        px={3}
                        py={2}
                        borderRadius="lg"
                        w="fit-content"
                      >
                        Forma de venta: {SELLING_METHOD_LABELS[event.sellingMethod] || event.sellingMethod}
                      </Badge>
                    )}

                    {event.description && (
                      <Text fontSize="md" color="gray.700" fontFamily="secondary" lineHeight="1.6">
                        {event.description}
                      </Text>
                    )}

                    <Divider />

                    <VStack align="stretch" spacing={3}>
                      <HStack>
                        <Icon as={RiMapPinLine} color="primary" boxSize={5} />
                        <Text fontSize="md" color="gray.700" fontFamily="secondary">
                          {event.addressRef?.place}, {event.addressRef?.direction}
                          {event.addressRef?.locality && `, ${event.addressRef.locality}`}
                        </Text>
                      </HStack>

                      {dates.length > 0 && (
                        <HStack flexWrap="wrap" gap={2}>
                          <Icon as={RiCalendar2Line} color="primary" boxSize={5} />
                          <VStack align="start" spacing={0}>
                            {dates.map((date, index) => {
                              const obj = getObjDate(date);
                              return (
                                <Text key={index} fontSize="md" color="gray.700" fontFamily="secondary">
                                  {obj.date} — {obj.timeStart} a {obj.timeEnd}
                                </Text>
                              );
                            })}
                          </VStack>
                        </HStack>
                      )}

                      {event.adultsOnly && (
                        <Badge colorScheme="red" fontSize="sm" px={3} py={1} borderRadius="full" w="fit-content">
                          +18
                        </Badge>
                      )}
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>

              {consumiciones.length > 0 && (
                <Card boxShadow="xl" borderRadius="xl" bg="white">
                  <CardBody p={6}>
                    <Heading as="h2" size="md" fontFamily="secondary" color="tertiary" mb={4}>
                      Consumiciones
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={4}>
                      Elegí bebidas, comida u otros ítems para tu pedido.
                    </Text>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                      {consumiciones.map((c, index) => {
                        const consumicionKey = c._id ?? `consumicion-${index}`;
                        const qty = consumicionesQty[consumicionKey] || 0;
                        const maxStock = c.stock != null && c.stock !== undefined ? c.stock : 999;
                        return (
                          <Flex
                            key={consumicionKey}
                            p={3}
                            border="2px solid"
                            borderColor={qty > 0 ? "primary" : "gray.200"}
                            borderRadius="lg"
                            align="center"
                            gap={3}
                            bg={qty > 0 ? "primary.50" : "white"}
                          >
                            {c.imageUrl ? (
                              <Image src={c.imageUrl} alt={c.name} boxSize="12" objectFit="cover" borderRadius="md" />
                            ) : (
                              <Center boxSize="12" bg="gray.100" borderRadius="md">
                                <Text fontSize="xl">🍽</Text>
                              </Center>
                            )}
                            <Box flex={1} minW={0}>
                              <Text fontWeight="600" fontSize="sm">
                                {c.name}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                ${Number(c.price).toLocaleString()}
                                {maxStock < 999 && <> · Stock: {maxStock}</>}
                              </Text>
                              {c.description && (
                                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                                  {c.description}
                                </Text>
                              )}
                            </Box>
                            <HStack spacing={1}>
                              <Button
                                size="sm"
                                variant="outline"
                                isDisabled={qty <= 0}
                                onClick={() => setConsumicionQty(consumicionKey, qty - 1)}
                              >
                                −
                              </Button>
                              <Input
                                type="number"
                                min={0}
                                max={maxStock}
                                w="52px"
                                size="sm"
                                textAlign="center"
                                value={qty}
                                onChange={(e) => setConsumicionQty(consumicionKey, e.target.value)}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                isDisabled={qty >= maxStock}
                                onClick={() => setConsumicionQty(consumicionKey, qty + 1)}
                              >
                                +
                              </Button>
                            </HStack>
                          </Flex>
                        );
                      })}
                    </SimpleGrid>
                  </CardBody>
                </Card>
              )}

              {rrpp.length > 0 && (
                <Card boxShadow="xl" borderRadius="xl" bg="white">
                  <CardBody p={6}>
                    <Heading as="h2" size="md" fontFamily="secondary" color="tertiary" mb={2}>
                      Revendedor (RRPP)
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={3}>
                      ¿Comprás a través de un revendedor? Elegilo en el dropdown.
                    </Text>
                    <Select
                      value={selectedRrppId}
                      onChange={(e) => setSelectedRrppId(e.target.value)}
                      placeholder="Ninguno"
                      borderColor="gray.300"
                      _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px var(--chakra-colors-primary)" }}
                      fontFamily="secondary"
                      maxW="320px"
                    >
                      {rrpp.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.fullname || r.name}{r.code ? ` (${r.code})` : ""}
                        </option>
                      ))}
                    </Select>
                  </CardBody>
                </Card>
              )}

              {tickets.length > 0 && (
                <Card boxShadow="xl" borderRadius="xl" bg="white">
                  <CardBody p={6}>
                    <Heading as="h2" size="md" fontFamily="secondary" color="tertiary" mb={4}>
                      <HStack>
                        <RiTicket2Line />
                        <span>Entradas</span>
                      </HStack>
                    </Heading>
                    <Text fontSize="sm" color="gray.500" mb={4}>
                      Elegí la cantidad de entradas. En un evento real acá irías a pagar con el método que configuraste.
                    </Text>
                    <VStack align="stretch" spacing={3}>
                      {tickets.map((t) => {
                        const qty = ticketsToBuy[t._id] || 0;
                        const available = Math.max(0, (t.maxEntries ?? 0) - (t.selled ?? 0));
                        const isSoldOut = available <= 0;
                        return (
                          <Flex
                            key={t._id}
                            p={4}
                            border="2px solid"
                            borderColor={qty > 0 ? "primary" : "gray.200"}
                            borderRadius="xl"
                            justify="space-between"
                            align="center"
                            flexWrap="wrap"
                            gap={3}
                            bg={qty > 0 ? "primary.50" : "white"}
                          >
                            <Box>
                              <Text fontWeight="600" fontFamily="secondary">
                                {t.title}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                Vendidas: {t.selled ?? 0} / {t.maxEntries ?? 0}
                              </Text>
                            </Box>
                            <HStack spacing={2} align="center">
                              <Text fontWeight="700" color="primary" fontFamily="secondary" fontSize="xl">
                                ${Number(t.price || 0).toLocaleString()}
                              </Text>
                              <HStack spacing={1}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isDisabled={qty <= 0 || isSoldOut}
                                  onClick={() => addTicketQty(t._id, -1)}
                                >
                                  −
                                </Button>
                                <Input
                                  type="number"
                                  min={0}
                                  max={available}
                                  w="52px"
                                  size="sm"
                                  textAlign="center"
                                  value={qty}
                                  readOnly
                                  bg="gray.50"
                                  _focus={{ outline: "none" }}
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  isDisabled={isSoldOut || qty >= available}
                                  onClick={() => addTicketQty(t._id, 1)}
                                >
                                  +
                                </Button>
                              </HStack>
                              {isSoldOut && (
                                <Badge colorScheme="red" fontSize="xs">Agotado</Badge>
                              )}
                            </HStack>
                          </Flex>
                        );
                      })}
                    </VStack>

                    <Divider my={6} />

                    {hasCbuInfo && (
                      <Box mb={6}>
                        <Heading as="h3" size="sm" fontFamily="secondary" color="tertiary" mb={3}>
                          Datos para transferencia
                        </Heading>
                        <Text fontSize="sm" color="gray.600" mb={3}>
                          Realizá la transferencia y subí el comprobante para que el organizador apruebe tu pago.
                        </Text>
                        <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200" mb={4}>
                          {event.cbuInfo.cbu && (
                            <Box mb={2}>
                              <Text fontSize="xs" color="gray.500">CBU</Text>
                              <Text fontWeight="700" fontSize="lg" letterSpacing="1px" fontFamily="secondary">{event.cbuInfo.cbu}</Text>
                            </Box>
                          )}
                          {event.cbuInfo.alias && (
                            <Box mb={2}>
                              <Text fontSize="xs" color="gray.500">Alias</Text>
                              <Text fontWeight="700" fontSize="lg" fontFamily="secondary">{event.cbuInfo.alias}</Text>
                            </Box>
                          )}
                          {event.cbuInfo.bankName && (
                            <Box mb={2}>
                              <Text fontSize="xs" color="gray.500">Banco</Text>
                              <Text fontWeight="600" fontFamily="secondary">{event.cbuInfo.bankName}</Text>
                            </Box>
                          )}
                          <Box mt={2}>
                            <Text fontSize="xs" color="gray.500">Monto a transferir</Text>
                            <Text fontWeight="700" fontSize="xl" color="green.600" fontFamily="secondary">${total.toLocaleString("es-AR")}</Text>
                          </Box>
                        </Box>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" fontFamily="secondary">Comprobante de pago (captura de la transferencia)</FormLabel>
                          <Input type="file" accept="image/*" onChange={handleProofFileChange} p={1} size="sm" />
                          {proofPreview && (
                            <Box mt={2}>
                              <Image src={proofPreview} alt="Vista previa comprobante" maxH="120px" borderRadius="md" />
                            </Box>
                          )}
                        </FormControl>
                      </Box>
                    )}

                    <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                      <VStack align="stretch" spacing={2}>
                        {subtotalTickets > 0 && (
                          <Flex justify="space-between" fontFamily="secondary">
                            <Text color="gray.600">Entradas:</Text>
                            <Text fontWeight="600">${subtotalTickets.toLocaleString()}</Text>
                          </Flex>
                        )}
                        {serviceFee > 0 && (
                          <Flex justify="space-between" fontFamily="secondary">
                            <Text color="gray.600">Cargo por servicio:</Text>
                            <Text fontWeight="600">${serviceFee.toLocaleString()}</Text>
                          </Flex>
                        )}
                        {subtotalConsumiciones > 0 && (
                          <Flex justify="space-between" fontFamily="secondary">
                            <Text color="gray.600">Consumiciones:</Text>
                            <Text fontWeight="600">${subtotalConsumiciones.toLocaleString()}</Text>
                          </Flex>
                        )}
                        <Divider borderColor="gray.300" />
                        <Flex justify="space-between" fontFamily="secondary" fontWeight="700" fontSize="lg">
                          <Text>Total:</Text>
                          <Text>${total.toLocaleString()}</Text>
                        </Flex>
                      </VStack>
                      <Button
                        mt={4}
                        w="100%"
                        colorScheme="blue"
                        size="lg"
                        fontFamily="secondary"
                        onClick={handleSimularCompra}
                        isDisabled={!hasSelection}
                      >
                        {!hasSelection ? "Elegí entradas o consumiciones" : "Continuar (simular compra)"}
                      </Button>
                    </Box>
                  </CardBody>
                </Card>
              )}

              <Modal isOpen={isDemoModalOpen} onClose={onDemoModalClose} isCentered size="md">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader fontFamily="secondary">Vista demo — Sin pago real</ModalHeader>
                  <ModalBody>
                    <Text fontFamily="secondary" color="gray.700">
                      {isTransferMethod ? (
                        <>
                          En la versión real transferirías al CBU/Alias indicado, subirías la captura del comprobante y el organizador aprobaría tu pago para enviarte las entradas. Esta es una vista previa y no se realiza ninguna transferencia ni envío de comprobante.
                        </>
                      ) : (
                        <>
                          En la versión real serías redirigido a pagar con <strong>{event.sellingMethod === "FAST" ? "Mercado Pago" : "tu método configurado"}</strong>.
                          Esta es una vista previa y no se realiza ningún pago ni se reservan entradas.
                        </>
                      )}
                    </Text>
                  </ModalBody>
                  <ModalFooter>
                    <Button colorScheme="blue" onClick={onDemoModalClose}>
                      Entendido
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              <Modal isOpen={isLoginRequiredOpen} onClose={onLoginRequiredClose} isCentered size="md">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader fontFamily="secondary">Debes crearte una cuenta para comprar tu entrada</ModalHeader>
                  <ModalBody>
                    <Text fontFamily="secondary" color="gray.700">
                      Registrate o iniciá sesión para poder continuar con la compra.
                    </Text>
                  </ModalBody>
                  <ModalFooter>
                    <Button as={RouterLink} to="/register" colorScheme="blue" mr={3} onClick={onLoginRequiredClose}>
                      Registrarme
                    </Button>
                    <Button as={RouterLink} to="/login" variant="outline" onClick={onLoginRequiredClose}>
                      Iniciar sesión
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </Flex>

            <Box w={{ base: "0", lg: "400px" }} flexShrink={0} display={{ base: "none", lg: "block" }}>
              <Card boxShadow="xl" borderRadius="xl" overflow="hidden" position="sticky" top="100px">
                <Box h="500px" bgGradient="linear(to-b, gray.100, gray.200)">
                  <Image
                    src={pictureSrc}
                    alt={event.title}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                  />
                </Box>
                <CardBody p={4}>
                  <Text fontFamily="secondary" fontWeight="600" color="tertiary">
                    {event.title}
                  </Text>
                  <Badge colorScheme="blue" mt={2}>
                    Vista previa demo
                  </Badge>
                </CardBody>
              </Card>
            </Box>
          </Flex>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default EventoDemoLanding;
