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
  Flex,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Center,
  Spinner,
  Image,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import eventApi from "../../Api/event";
import FileInput from "../../components/FileInput/FileInput";

const SellerConsumiciones = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [eventData, setEventData] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [consumicionLoading, setConsumicionLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [newPreview, setNewPreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      setLoadingEvents(true);
      try {
        const { data } = await eventApi.getUserEvents(1, 100);
        setEvents(data.events || []);
        if (data.events?.length && !selectedEventId) setSelectedEventId(data.events[0]._id);
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
    setEditingId(null);
  }, [selectedEventId, events]);

  const list = Array.isArray(eventData?.consumiciones) ? eventData.consumiciones : [];

  const handleAdd = async (e) => {
    e.preventDefault();
    const name = newName?.trim();
    const price = parseFloat(newPrice);
    if (!name || isNaN(price) || price < 0 || !eventData?._id) {
      toast({ title: "Nombre y precio válido requeridos", status: "warning", duration: 3000 });
      return;
    }
    setConsumicionLoading(true);
    try {
      let imageUrl;
      if (newFile) {
        const { data: uploadRes } = await eventApi.uploadConsumicionImage(newFile);
        imageUrl = uploadRes?.imageUrl;
      }
      const { data } = await eventApi.createConsumicion(eventData._id, {
        name,
        price,
        description: newDescription?.trim() || undefined,
        imageUrl: imageUrl || undefined,
        stock: newStock !== '' ? (parseInt(newStock, 10) >= 0 ? parseInt(newStock, 10) : undefined) : undefined,
      });
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      setNewName("");
      setNewPrice("");
      setNewDescription("");
      setNewStock("");
      setNewFile(null);
      setNewPreview(null);
      toast({ title: "Consumición agregada", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo agregar", status: "error", duration: 4000 });
    } finally {
      setConsumicionLoading(false);
    }
  };

  const handleStartEdit = (c) => {
    setEditingId(c._id);
    setEditName(c.name || "");
    setEditPrice(String(c.price ?? ""));
    setEditDescription(c.description || "");
    setEditStock(c.stock !== undefined && c.stock !== null ? String(c.stock) : "");
    setEditFile(null);
    setEditPreview(c.imageUrl || null);
    onEditOpen();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
    setEditDescription("");
    setEditStock("");
    setEditFile(null);
    setEditPreview(null);
    onEditClose();
  };

  const handleSave = async () => {
    if (!editingId || !eventData?._id) return;
    const price = parseFloat(editPrice);
    if (isNaN(price) || price < 0) {
      toast({ title: "Precio debe ser mayor o igual a 0", status: "warning", duration: 3000 });
      return;
    }
    setConsumicionLoading(true);
    try {
      let imageUrl;
      if (editFile) {
        const { data: uploadRes } = await eventApi.uploadConsumicionImage(editFile);
        imageUrl = uploadRes?.imageUrl;
      }
      const { data } = await eventApi.updateConsumicion(eventData._id, editingId, {
        name: editName?.trim() || "",
        price,
        description: editDescription?.trim() || undefined,
        stock: editStock !== '' ? (parseInt(editStock, 10) >= 0 ? parseInt(editStock, 10) : undefined) : undefined,
        ...(imageUrl !== undefined && { imageUrl }),
      });
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      handleCancelEdit();
      toast({ title: "Consumición actualizada", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo actualizar", status: "error", duration: 4000 });
    } finally {
      setConsumicionLoading(false);
    }
  };

  const handleDelete = async (consumicionId) => {
    if (!window.confirm("¿Eliminar esta consumición del catálogo?") || !eventData?._id) return;
    setConsumicionLoading(true);
    try {
      const { data } = await eventApi.deleteConsumicion(eventData._id, consumicionId);
      setEventData(data.event);
      setEvents((prev) => prev.map((ev) => (ev._id === eventData._id ? data.event : ev)));
      if (editingId === consumicionId) handleCancelEdit();
      toast({ title: "Consumición eliminada", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo eliminar", status: "error", duration: 4000 });
    } finally {
      setConsumicionLoading(false);
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
          Consumiciones
        </Heading>
        <Text color="gray.600">
          Elegí un evento y armá el catálogo de bebidas, comida u otros ítems que quieras vender. También podés editarlo desde Mis Eventos → Detalles del evento.
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
          <Text color="gray.500">Seleccioná un evento para gestionar el catálogo de consumiciones.</Text>
        )}

        {eventData && (
          <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
            <CardHeader>
              <Heading size="md" fontFamily="secondary">
                Catálogo — {eventData.title}
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              {list.length === 0 ? (
                <Text color="gray.500">Aún no hay consumiciones. Agregá ítems abajo.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={6}>
                  {list.map((c) => (
                    <Card key={c._id} variant="outline" borderRadius="lg" overflow="hidden" borderColor="gray.200" _hover={{ borderColor: "primary", shadow: "md" }}>
                      <Flex p={4} gap={3} align="flex-start">
                        <Box flexShrink={0}>
                          {c.imageUrl ? (
                            <Image src={c.imageUrl} alt={c.name} boxSize="16" objectFit="cover" borderRadius="md" />
                          ) : (
                            <Center boxSize="16" bg="gray.100" borderRadius="md">
                              <Text fontSize="2xl" color="gray.400">🍽</Text>
                            </Center>
                          )}
                        </Box>
                        <Box flex={1} minW={0}>
                          <Text fontWeight="600" fontSize="md" noOfLines={1}>{c.name}</Text>
                          <Badge colorScheme="green" mt={1}>${Number(c.price).toLocaleString()}</Badge>
                          {c.description && (
                            <Text fontSize="sm" color="gray.500" noOfLines={2} mt={1}>{c.description}</Text>
                          )}
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Stock: {c.stock !== undefined && c.stock !== null ? c.stock : "Sin límite"}
                          </Text>
                          <Flex gap={2} mt={2} flexWrap="wrap">
                            <Tooltip label="Editar">
                              <IconButton size="sm" aria-label="Editar" icon={<EditIcon />} variant="outline" onClick={() => handleStartEdit(c)} />
                            </Tooltip>
                            <Tooltip label="Eliminar">
                              <IconButton size="sm" aria-label="Eliminar" icon={<DeleteIcon />} variant="outline" colorScheme="red" onClick={() => handleDelete(c._id)} />
                            </Tooltip>
                          </Flex>
                        </Box>
                      </Flex>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
              <Box as="form" onSubmit={handleAdd}>
                <Flex gap={3} flexWrap="wrap" alignItems="flex-end" mb={3}>
                  <FormControl w="auto">
                    <FormLabel fontSize="sm">Foto (opc.)</FormLabel>
                    <Flex align="center" gap={2}>
                      {newPreview && <Image src={newPreview} alt="" boxSize="14" objectFit="cover" borderRadius="md" />}
                      <FileInput size="sm" accept="image/*" value={newFile?.name} onChange={(e) => { const f = e.target.files?.[0]; setNewFile(f || null); setNewPreview(f ? URL.createObjectURL(f) : null); }} />
                    </Flex>
                  </FormControl>
                  <FormControl flex="1" minW="140px">
                    <FormLabel fontSize="sm">Nombre</FormLabel>
                    <Input size="sm" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Cerveza, Pizza" />
                  </FormControl>
                  <FormControl w="100px">
                    <FormLabel fontSize="sm">Precio ($)</FormLabel>
                    <Input size="sm" type="number" min={0} step={0.01} value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="0" />
                  </FormControl>
                  <FormControl flex="1" minW="120px">
                    <FormLabel fontSize="sm">Descripción (opc.)</FormLabel>
                    <Input size="sm" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Opcional" />
                  </FormControl>
                  <Button size="sm" type="submit" colorScheme="blue" isLoading={consumicionLoading}>Agregar consumición</Button>
                </Flex>
                <FormControl maxW="120px">
                  <FormLabel fontSize="sm">Stock (opc.)</FormLabel>
                  <Input
                    size="sm"
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    placeholder="Sin límite"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>Dejá vacío para sin límite</Text>
                </FormControl>
              </Box>

              <Modal isOpen={isEditOpen} onClose={handleCancelEdit} size="lg">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Editar consumición</ModalHeader>
                  <ModalBody>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>Foto (opc.)</FormLabel>
                        <Flex align="center" gap={3}>
                          {(editPreview || (list.find((x) => x._id === editingId)?.imageUrl)) && (
                            <Image src={editPreview || list.find((x) => x._id === editingId)?.imageUrl} alt="" boxSize="20" objectFit="cover" borderRadius="md" />
                          )}
                          <FileInput size="sm" accept="image/*" value={editFile?.name} onChange={(e) => { const f = e.target.files?.[0]; setEditFile(f || null); setEditPreview(f ? URL.createObjectURL(f) : (list.find((x) => x._id === editingId)?.imageUrl || null)); }} />
                        </Flex>
                      </FormControl>
                      <FormControl>
                        <FormLabel>Nombre</FormLabel>
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nombre" />
                      </FormControl>
                      <Flex gap={4}>
                        <FormControl>
                          <FormLabel>Precio ($)</FormLabel>
                          <Input type="number" min={0} step={0.01} value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Stock (opc.)</FormLabel>
                          <Input type="number" min={0} value={editStock} onChange={(e) => setEditStock(e.target.value)} placeholder="Sin límite" />
                        </FormControl>
                      </Flex>
                      <FormControl>
                        <FormLabel>Descripción (opc.)</FormLabel>
                        <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Opcional" />
                      </FormControl>
                    </VStack>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleCancelEdit}>Cancelar</Button>
                    <Button colorScheme="blue" onClick={handleSave} isLoading={consumicionLoading}>Guardar</Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default SellerConsumiciones;
