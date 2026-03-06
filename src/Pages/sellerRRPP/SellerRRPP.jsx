import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Select,
  FormControl,
  FormLabel,
  Button,
  Input,
  Flex,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Center,
  Spinner,
  Divider,
  Icon,
  SimpleGrid,
  InputGroup,
  InputRightAddon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { RiUserLine, RiPercentLine, RiTicketLine } from "react-icons/ri";
import eventApi from "../../Api/event";

const SellerRRPP = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventData, setEventData] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [rrppLoading, setRrppLoading] = useState(false);

  // Form agregar
  const [newRrppName, setNewRrppName] = useState("");
  const [newRrppCode, setNewRrppCode] = useState("");
  const [newRrppDiscount, setNewRrppDiscount] = useState("");

  // Form editar
  const [editingRrppId, setEditingRrppId] = useState(null);
  const [editRrppName, setEditRrppName] = useState("");
  const [editRrppCode, setEditRrppCode] = useState("");
  const [editRrppDiscount, setEditRrppDiscount] = useState("");

  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      setLoadingEvents(true);
      try {
        const { data } = await eventApi.getUserEvents(1, 100);
        setEvents(data.events || []);
        if (data.events?.length && !selectedEventId) {
          setSelectedEventId(data.events[0]._id);
        }
      } catch (e) {
        toast({ title: "Error al cargar eventos", status: "error", duration: 4000 });
      } finally {
        setLoadingEvents(false);
      }
    };
    fetch();
  }, []);

  useEffect(() => {
    if (!selectedEventId || !events.length) {
      setEventData(null);
      return;
    }
    const ev = events.find((e) => e._id === selectedEventId);
    setEventData(ev || null);
    setEditingRrppId(null);
  }, [selectedEventId, events]);

  const rrppList = Array.isArray(eventData?.rrpp) ? eventData.rrpp : [];

  const getTicketsSoldByRrpp = (rrpp) => {
    if (!rrpp?.ticketsSelled?.length) return 0;
    return rrpp.ticketsSelled.reduce((sum, t) => sum + (t.quantity || 0), 0);
  };

  const totalTicketsEvent = eventData?.tickets?.reduce((s, t) => s + (t.selled || 0), 0) || 0;
  const totalTicketsViaRrpp = rrppList.reduce((s, r) => s + getTicketsSoldByRrpp(r), 0);

  const handleAddRrpp = async (e) => {
    e.preventDefault();
    const name = newRrppName?.trim();
    if (!name || !eventData?._id) {
      toast({ title: "Nombre requerido", status: "warning", duration: 3000 });
      return;
    }
    const discount = newRrppDiscount !== "" ? Math.min(100, Math.max(0, Number(newRrppDiscount))) / 100 : undefined;
    setRrppLoading(true);
    try {
      const { data } = await eventApi.createRrpp(eventData._id, {
        name,
        code: newRrppCode?.trim() || undefined,
        discountPercentage: discount,
      });
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      setNewRrppName("");
      setNewRrppCode("");
      setNewRrppDiscount("");
      toast({ title: "RRPP agregado", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo agregar", status: "error", duration: 4000 });
    } finally {
      setRrppLoading(false);
    }
  };

  const handleStartEditRrpp = (r) => {
    setEditingRrppId(r._id);
    setEditRrppName(r.fullname || "");
    setEditRrppCode(r.code || "");
    setEditRrppDiscount(r.discountPercentage ? String(Math.round(r.discountPercentage * 100)) : "");
  };

  const handleCancelEditRrpp = () => {
    setEditingRrppId(null);
    setEditRrppName("");
    setEditRrppCode("");
    setEditRrppDiscount("");
  };

  const handleSaveRrpp = async () => {
    if (!editingRrppId || !eventData?._id) return;
    const discount = editRrppDiscount !== "" ? Math.min(100, Math.max(0, Number(editRrppDiscount))) / 100 : 0;
    setRrppLoading(true);
    try {
      const { data } = await eventApi.updateRrpp(eventData._id, editingRrppId, {
        name: editRrppName?.trim() || "",
        code: editRrppCode?.trim() || undefined,
        discountPercentage: discount,
      });
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      handleCancelEditRrpp();
      toast({ title: "RRPP actualizado", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo actualizar", status: "error", duration: 4000 });
    } finally {
      setRrppLoading(false);
    }
  };

  const handleDeleteRrpp = async (rrppId) => {
    if (!window.confirm("¿Eliminar este revendedor? Las ventas ya asociadas no se modifican.") || !eventData?._id) return;
    setRrppLoading(true);
    try {
      const { data } = await eventApi.deleteRrpp(eventData._id, rrppId);
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      if (editingRrppId === rrppId) handleCancelEditRrpp();
      toast({ title: "RRPP eliminado", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo eliminar", status: "error", duration: 4000 });
    } finally {
      setRrppLoading(false);
    }
  };

  if (loadingEvents) {
    return (
      <Center minH="40vh">
        <Spinner size="xl" color="primary" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={8} px={{ base: 4, md: 8 }}>
      <VStack align="stretch" spacing={8}>

        {/* Header */}
        <Box>
          <Heading fontFamily="secondary" color="tertiary" size="xl" mb={1}>
            RRPP — Revendedores
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Configurá los revendedores de tu evento y asignales un descuento opcional para sus compradores.
          </Text>
        </Box>

        {/* Selector de evento */}
        <FormControl>
          <FormLabel fontFamily="secondary" fontWeight="600">Evento</FormLabel>
          <Select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            placeholder="Seleccionar evento"
            size="lg"
            borderColor="gray.300"
            borderRadius="lg"
            _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>{ev.title}</option>
            ))}
          </Select>
        </FormControl>

        {eventData && (
          <>
            {/* Métricas resumen */}
            <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
              <Card borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardBody>
                  <HStack spacing={3}>
                    <Box bg="black" borderRadius="lg" p={2}>
                      <Icon as={RiUserLine} color="white" boxSize={5} />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontFamily="secondary">Revendedores</Text>
                      <Text fontSize="2xl" fontWeight="700" fontFamily="secondary">{rrppList.length}</Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
              <Card borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardBody>
                  <HStack spacing={3}>
                    <Box bg="black" borderRadius="lg" p={2}>
                      <Icon as={RiTicketLine} color="white" boxSize={5} />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontFamily="secondary">Entradas vía RRPP</Text>
                      <Text fontSize="2xl" fontWeight="700" fontFamily="secondary">{totalTicketsViaRrpp}</Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
              <Card borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardBody>
                  <HStack spacing={3}>
                    <Box bg="black" borderRadius="lg" p={2}>
                      <Icon as={RiPercentLine} color="white" boxSize={5} />
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" fontFamily="secondary">% del total vendido</Text>
                      <Text fontSize="2xl" fontWeight="700" fontFamily="secondary">
                        {totalTicketsEvent > 0 ? ((totalTicketsViaRrpp / totalTicketsEvent) * 100).toFixed(1) : "0"}%
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Listado de RRPP */}
            <Card borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
              <CardHeader pb={2}>
                <Heading size="md" fontFamily="secondary">Revendedores de {eventData.title}</Heading>
              </CardHeader>
              <CardBody pt={2}>
                {rrppList.length === 0 ? (
                  <Box py={8} textAlign="center">
                    <Icon as={RiUserLine} boxSize={10} color="gray.300" mb={3} />
                    <Text color="gray.400" fontFamily="secondary">Aún no hay revendedores. Agregá el primero abajo.</Text>
                  </Box>
                ) : (
                  <VStack align="stretch" spacing={3} mb={6}>
                    {rrppList.map((r) => {
                      const sold = getTicketsSoldByRrpp(r);
                      const pct = totalTicketsEvent > 0 ? ((sold / totalTicketsEvent) * 100).toFixed(1) : "0";
                      const discountPct = r.discountPercentage ? Math.round(r.discountPercentage * 100) : 0;

                      if (editingRrppId === r._id) {
                        return (
                          <Box key={r._id} p={4} border="2px solid" borderColor="black" borderRadius="xl" bg="gray.50">
                            <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={3} mb={3}>
                              <FormControl>
                                <FormLabel fontSize="xs" fontFamily="secondary" color="gray.600">Nombre</FormLabel>
                                <Input
                                  size="sm"
                                  borderRadius="lg"
                                  value={editRrppName}
                                  onChange={(e) => setEditRrppName(e.target.value)}
                                  placeholder="Nombre del RRPP"
                                  _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontFamily="secondary" color="gray.600">Código</FormLabel>
                                <Input
                                  size="sm"
                                  borderRadius="lg"
                                  value={editRrppCode}
                                  onChange={(e) => setEditRrppCode(e.target.value)}
                                  placeholder="Ej: JUAN24"
                                  _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                />
                              </FormControl>
                              <FormControl>
                                <FormLabel fontSize="xs" fontFamily="secondary" color="gray.600">Descuento para el comprador</FormLabel>
                                <InputGroup size="sm">
                                  <Input
                                    borderRadius="lg"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={editRrppDiscount}
                                    onChange={(e) => setEditRrppDiscount(e.target.value)}
                                    placeholder="0"
                                    _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                                  />
                                  <InputRightAddon borderRadius="lg" bg="gray.100">%</InputRightAddon>
                                </InputGroup>
                              </FormControl>
                            </SimpleGrid>
                            <Flex gap={2} justify="flex-end">
                              <Button size="sm" bg="black" color="white" _hover={{ bg: "#1a1a1a" }} borderRadius="lg" leftIcon={<CheckIcon />} onClick={handleSaveRrpp} isLoading={rrppLoading}>
                                Guardar
                              </Button>
                              <Button size="sm" variant="outline" borderRadius="lg" leftIcon={<CloseIcon boxSize={2} />} onClick={handleCancelEditRrpp}>
                                Cancelar
                              </Button>
                            </Flex>
                          </Box>
                        );
                      }

                      return (
                        <Flex
                          key={r._id}
                          p={4}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="xl"
                          align={{ base: "flex-start", sm: "center" }}
                          justify="space-between"
                          direction={{ base: "column", sm: "row" }}
                          gap={3}
                          _hover={{ borderColor: "gray.300", bg: "gray.50" }}
                          transition="all 0.15s"
                        >
                          <HStack spacing={3} flexWrap="wrap">
                            <Box bg="gray.100" borderRadius="full" p={2}>
                              <Icon as={RiUserLine} boxSize={4} color="gray.600" />
                            </Box>
                            <Box>
                              <Text fontWeight="600" fontFamily="secondary" fontSize="sm">{r.fullname}</Text>
                              <HStack spacing={2} mt={1} flexWrap="wrap">
                                {r.code && (
                                  <Badge colorScheme="gray" borderRadius="md" fontSize="xs" px={2}>
                                    {r.code}
                                  </Badge>
                                )}
                                {discountPct > 0 && (
                                  <Badge colorScheme="green" borderRadius="md" fontSize="xs" px={2}>
                                    {discountPct}% OFF
                                  </Badge>
                                )}
                                <Badge variant="outline" colorScheme="blue" borderRadius="md" fontSize="xs" px={2}>
                                  {sold} entradas · {pct}%
                                </Badge>
                              </HStack>
                            </Box>
                          </HStack>
                          <HStack spacing={2}>
                            <Tooltip label="Editar" placement="top">
                              <IconButton
                                icon={<EditIcon />}
                                size="sm"
                                variant="ghost"
                                borderRadius="lg"
                                onClick={() => handleStartEditRrpp(r)}
                                aria-label="Editar RRPP"
                              />
                            </Tooltip>
                            <Tooltip label="Eliminar" placement="top">
                              <IconButton
                                icon={<DeleteIcon />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                borderRadius="lg"
                                onClick={() => handleDeleteRrpp(r._id)}
                                aria-label="Eliminar RRPP"
                              />
                            </Tooltip>
                          </HStack>
                        </Flex>
                      );
                    })}
                  </VStack>
                )}

                <Divider mb={5} />

                {/* Formulario agregar RRPP */}
                <Box>
                  <Text fontFamily="secondary" fontWeight="600" fontSize="sm" mb={3} color="gray.700">
                    Agregar revendedor
                  </Text>
                  <Flex as="form" onSubmit={handleAddRrpp} direction={{ base: "column", md: "row" }} gap={3} alignItems="flex-end">
                    <FormControl flex="2" minW="140px">
                      <FormLabel fontSize="xs" color="gray.600" fontFamily="secondary">Nombre *</FormLabel>
                      <Input
                        size="sm"
                        borderRadius="lg"
                        value={newRrppName}
                        onChange={(e) => setNewRrppName(e.target.value)}
                        placeholder="Ej: Juan Pérez"
                        _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                      />
                    </FormControl>
                    <FormControl flex="1" minW="110px">
                      <FormLabel fontSize="xs" color="gray.600" fontFamily="secondary">Código (opcional)</FormLabel>
                      <Input
                        size="sm"
                        borderRadius="lg"
                        value={newRrppCode}
                        onChange={(e) => setNewRrppCode(e.target.value)}
                        placeholder="Ej: JP24"
                        _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                      />
                    </FormControl>
                    <FormControl flex="1" minW="130px">
                      <FormLabel fontSize="xs" color="gray.600" fontFamily="secondary">Descuento (opcional)</FormLabel>
                      <InputGroup size="sm">
                        <Input
                          borderRadius="lg"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={newRrppDiscount}
                          onChange={(e) => setNewRrppDiscount(e.target.value)}
                          placeholder="0"
                          _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
                        />
                        <InputRightAddon borderRadius="lg" bg="gray.100">%</InputRightAddon>
                      </InputGroup>
                    </FormControl>
                    <Button
                      type="submit"
                      size="sm"
                      bg="black"
                      color="white"
                      borderRadius="lg"
                      _hover={{ bg: "#1a1a1a", transform: "translateY(-1px)" }}
                      isLoading={rrppLoading}
                      px={6}
                      flexShrink={0}
                    >
                      Agregar
                    </Button>
                  </Flex>
                </Box>
              </CardBody>
            </Card>

            {/* Tabla de métricas */}
            {rrppList.length > 0 && (
              <Card borderRadius="xl" boxShadow="sm" border="1px solid" borderColor="gray.200">
                <CardHeader pb={2}>
                  <Heading size="md" fontFamily="secondary">Métricas de ventas</Heading>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Total vendidas: {totalTicketsEvent} · Vía RRPP: {totalTicketsViaRrpp}
                  </Text>
                </CardHeader>
                <CardBody pt={0}>
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th fontFamily="secondary">Revendedor</Th>
                          <Th fontFamily="secondary">Código</Th>
                          <Th fontFamily="secondary">Descuento</Th>
                          <Th isNumeric fontFamily="secondary">Entradas</Th>
                          <Th isNumeric fontFamily="secondary">% del total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rrppList.map((r) => {
                          const sold = getTicketsSoldByRrpp(r);
                          const pct = totalTicketsEvent > 0 ? ((sold / totalTicketsEvent) * 100).toFixed(1) : "0";
                          const discountPct = r.discountPercentage ? Math.round(r.discountPercentage * 100) : 0;
                          return (
                            <Tr key={r._id}>
                              <Td fontWeight="500" fontFamily="secondary">{r.fullname || "—"}</Td>
                              <Td>{r.code ? <Badge colorScheme="gray">{r.code}</Badge> : <Text color="gray.400">—</Text>}</Td>
                              <Td>
                                {discountPct > 0
                                  ? <Badge colorScheme="green">{discountPct}% OFF</Badge>
                                  : <Text color="gray.400" fontSize="xs">Sin descuento</Text>
                                }
                              </Td>
                              <Td isNumeric fontFamily="secondary" fontWeight="600">{sold}</Td>
                              <Td isNumeric fontFamily="secondary">{pct}%</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </VStack>
    </Container>
  );
};

export default SellerRRPP;
