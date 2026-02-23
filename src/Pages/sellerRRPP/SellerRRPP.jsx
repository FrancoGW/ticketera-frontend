import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Select,
  FormControl,
  FormLabel,
  Button,
  Input,
  List,
  ListItem,
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
} from "@chakra-ui/react";
import eventApi from "../../Api/event";

const SellerRRPP = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventData, setEventData] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [rrppLoading, setRrppLoading] = useState(false);
  const [newRrppName, setNewRrppName] = useState("");
  const [newRrppCode, setNewRrppCode] = useState("");
  const [editingRrppId, setEditingRrppId] = useState(null);
  const [editRrppName, setEditRrppName] = useState("");
  const [editRrppCode, setEditRrppCode] = useState("");
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
    setRrppLoading(true);
    try {
      const { data } = await eventApi.createRrpp(eventData._id, { name, code: newRrppCode?.trim() || undefined });
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      setNewRrppName("");
      setNewRrppCode("");
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
  };

  const handleCancelEditRrpp = () => {
    setEditingRrppId(null);
    setEditRrppName("");
    setEditRrppCode("");
  };

  const handleSaveRrpp = async () => {
    if (!editingRrppId || !eventData?._id) return;
    setRrppLoading(true);
    try {
      const { data } = await eventApi.updateRrpp(eventData._id, editingRrppId, { name: editRrppName?.trim() || "", code: editRrppCode?.trim() || undefined });
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      setEditingRrppId(null);
      setEditRrppName("");
      setEditRrppCode("");
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
        <Heading fontFamily="secondary" color="tertiary" size="xl">
          RRPP (Revendedores)
        </Heading>
        <Text color="gray.600">
          Elegí un evento y configurá los revendedores. También podés hacerlo desde Mis Eventos → Detalles del evento.
        </Text>

        <FormControl>
          <FormLabel>Evento</FormLabel>
          <Select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            placeholder="Seleccionar evento"
            size="lg"
            borderColor="gray.300"
            _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px var(--chakra-colors-primary)" }}
          >
            {events.map((ev) => (
              <option key={ev._id} value={ev._id}>
                {ev.title}
              </option>
            ))}
          </Select>
        </FormControl>

        {!eventData && events.length > 0 && (
          <Text color="gray.500">Seleccioná un evento para ver y gestionar RRPP.</Text>
        )}

        {eventData && (
          <>
            <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" fontFamily="secondary">
                  Métricas por RRPP — {eventData.title}
                </Heading>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Total entradas vendidas en el evento: {totalTicketsEvent} {totalTicketsViaRrpp > 0 && ` (${totalTicketsViaRrpp} a través de RRPP)`}
                </Text>
              </CardHeader>
              <CardBody pt={0}>
                {rrppList.length === 0 ? (
                  <Text color="gray.500">Aún no hay RRPP. Agregá uno abajo.</Text>
                ) : (
                  <TableContainer>
                    <Table size="sm" variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Revendedor</Th>
                          <Th>Código</Th>
                          <Th isNumeric>Entradas vendidas</Th>
                          <Th isNumeric>% del total</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rrppList.map((r) => {
                          const sold = getTicketsSoldByRrpp(r);
                          const pct = totalTicketsEvent > 0 ? ((sold / totalTicketsEvent) * 100).toFixed(1) : "0";
                          return (
                            <Tr key={r._id}>
                              <Td fontWeight="500">{r.fullname || "—"}</Td>
                              <Td>{r.code ? <Badge colorScheme="gray">{r.code}</Badge> : "—"}</Td>
                              <Td isNumeric>{sold}</Td>
                              <Td isNumeric>{pct}%</Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </CardBody>
            </Card>

            <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
              <CardHeader>
                <Heading size="md" fontFamily="secondary">
                  Listado y configuración
                </Heading>
              </CardHeader>
              <CardBody pt={0}>
                <List spacing={3} mb={6}>
                  {rrppList.map((r) => (
                    <ListItem key={r._id} display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      {editingRrppId === r._id ? (
                        <>
                          <Input
                            size="sm"
                            value={editRrppName}
                            onChange={(e) => setEditRrppName(e.target.value)}
                            placeholder="Nombre"
                            flex="1"
                            minW="120px"
                          />
                          <Input
                            size="sm"
                            value={editRrppCode}
                            onChange={(e) => setEditRrppCode(e.target.value)}
                            placeholder="Código (opcional)"
                            flex="1"
                            minW="100px"
                          />
                          <Button size="sm" colorScheme="blue" onClick={handleSaveRrpp} isLoading={rrppLoading}>
                            Guardar
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEditRrpp}>
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Text as="span" fontWeight="500">
                            {r.fullname}
                          </Text>
                          {r.code && (
                            <Badge colorScheme="gray">{r.code}</Badge>
                          )}
                          <Button size="xs" variant="outline" onClick={() => handleStartEditRrpp(r)}>
                            Editar
                          </Button>
                          <Button size="xs" variant="outline" colorScheme="red" onClick={() => handleDeleteRrpp(r._id)}>
                            Eliminar
                          </Button>
                        </>
                      )}
                    </ListItem>
                  ))}
                </List>
                <Divider my={4} />
                <Flex as="form" onSubmit={handleAddRrpp} gap={3} flexWrap="wrap" alignItems="flex-end">
                  <FormControl flex="1" minW="140px">
                    <FormLabel fontSize="sm">Nombre</FormLabel>
                    <Input
                      size="sm"
                      value={newRrppName}
                      onChange={(e) => setNewRrppName(e.target.value)}
                      placeholder="Nombre del RRPP"
                    />
                  </FormControl>
                  <FormControl flex="1" minW="120px">
                    <FormLabel fontSize="sm">Código (opcional)</FormLabel>
                    <Input
                      size="sm"
                      value={newRrppCode}
                      onChange={(e) => setNewRrppCode(e.target.value)}
                      placeholder="Ej: JUAN24"
                    />
                  </FormControl>
                  <Button size="sm" type="submit" colorScheme="blue" isLoading={rrppLoading}>
                    Agregar RRPP
                  </Button>
                </Flex>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default SellerRRPP;
