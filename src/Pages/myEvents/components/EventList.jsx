import {
  Box,
  Card,
  CardBody,
  CardFooter,
  Button,
  Text,
  Flex,
  CardHeader,
  Link,
  Heading,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Image,
  useToast,
  List,
  ListItem,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CourtesyTicketModal from "./CourtesyTicketModal";
import AsyncSelect from "react-select/async";
import AddDates from "../../../components/AddDates";
import axios from "axios";
import eventApi from "../../../Api/event";
import { bufferToBase64, getBase64FromFile, validateSelectedImg } from "../../../common/utils";
import FileInput from "../../../components/FileInput/FileInput";

const EventsList = ({ event, setEventDetails }) => {
  const navigate = useNavigate();
  const { data: user } = useSelector((state) => state.user);
  const isDemoMode = user?.isDemo === true || event?.isDemo === true;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [eventData, setEventData] = useState(event);
  const [eventDates, setEventDates] = useState(event?.dates || []);
  const [selectedProvince, setSelectedProvince] = useState(event?.addressRef?.province || "");
  const [selectedLocality, setSelectedLocality] = useState(event?.addressRef?.locality || "");
  const [newPicture, setNewPicture] = useState("");
  const [newRrppName, setNewRrppName] = useState("");
  const [newRrppCode, setNewRrppCode] = useState("");
  const [editingRrppId, setEditingRrppId] = useState(null);
  const [editRrppName, setEditRrppName] = useState("");
  const [editRrppCode, setEditRrppCode] = useState("");
  const [rrppLoading, setRrppLoading] = useState(false);
  const [newConsumicionName, setNewConsumicionName] = useState("");
  const [newConsumicionPrice, setNewConsumicionPrice] = useState("");
  const [newConsumicionDescription, setNewConsumicionDescription] = useState("");
  const [newConsumicionStock, setNewConsumicionStock] = useState("");
  const [newConsumicionFile, setNewConsumicionFile] = useState(null);
  const [newConsumicionPreview, setNewConsumicionPreview] = useState(null);
  const [editingConsumicionId, setEditingConsumicionId] = useState(null);
  const [editConsumicionName, setEditConsumicionName] = useState("");
  const [editConsumicionPrice, setEditConsumicionPrice] = useState("");
  const [editConsumicionDescription, setEditConsumicionDescription] = useState("");
  const [editConsumicionStock, setEditConsumicionStock] = useState("");
  const [editConsumicionFile, setEditConsumicionFile] = useState(null);
  const [editConsumicionPreview, setEditConsumicionPreview] = useState(null);
  const [consumicionLoading, setConsumicionLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (event) setEventData(event);
  }, [event]);

  const getTotalTicketsSelled = () => {
    let total = 0;
    event?.tickets?.forEach((ticket) => {
      total += ticket.selled;
    });
    return total;
  };

  const rrppList = Array.isArray(eventData?.rrpp) ? eventData.rrpp : [];

  const handleAddRrpp = async (e) => {
    e.preventDefault();
    const name = newRrppName?.trim();
    if (!name) {
      toast({ title: "Nombre requerido", status: "warning", duration: 3000 });
      return;
    }
    setRrppLoading(true);
    try {
      const { data } = await eventApi.createRrpp(eventData._id, { name, code: newRrppCode?.trim() || undefined });
      setEventData(data.event);
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
    if (!editingRrppId) return;
    setRrppLoading(true);
    try {
      const { data } = await eventApi.updateRrpp(eventData._id, editingRrppId, { name: editRrppName?.trim() || "", code: editRrppCode?.trim() || undefined });
      setEventData(data.event);
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
    if (!window.confirm("¿Eliminar este revendedor? Las ventas ya asociadas no se modifican.")) return;
    setRrppLoading(true);
    try {
      const { data } = await eventApi.deleteRrpp(eventData._id, rrppId);
      setEventData(data.event);
      if (editingRrppId === rrppId) handleCancelEditRrpp();
      toast({ title: "RRPP eliminado", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo eliminar", status: "error", duration: 4000 });
    } finally {
      setRrppLoading(false);
    }
  };

  const consumicionesList = Array.isArray(eventData?.consumiciones) ? eventData.consumiciones : [];

  const handleAddConsumicion = async (e) => {
    e.preventDefault();
    const name = newConsumicionName?.trim();
    const price = parseFloat(newConsumicionPrice);
    if (!name || isNaN(price) || price < 0) {
      toast({ title: "Nombre y precio válido requeridos", status: "warning", duration: 3000 });
      return;
    }
    setConsumicionLoading(true);
    try {
      let imageUrl;
      if (newConsumicionFile) {
        const { data: uploadRes } = await eventApi.uploadConsumicionImage(newConsumicionFile);
        imageUrl = uploadRes?.imageUrl;
      }
      const { data } = await eventApi.createConsumicion(eventData._id, {
        name,
        price,
        description: newConsumicionDescription?.trim() || undefined,
        imageUrl: imageUrl || undefined,
        stock: newConsumicionStock !== '' ? (parseInt(newConsumicionStock, 10) >= 0 ? parseInt(newConsumicionStock, 10) : undefined) : undefined,
      });
      setEventData(data.event);
      setNewConsumicionName("");
      setNewConsumicionPrice("");
      setNewConsumicionDescription("");
      setNewConsumicionStock("");
      setNewConsumicionFile(null);
      setNewConsumicionPreview(null);
      toast({ title: "Consumición agregada", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo agregar", status: "error", duration: 4000 });
    } finally {
      setConsumicionLoading(false);
    }
  };

  const handleStartEditConsumicion = (c) => {
    setEditingConsumicionId(c._id);
    setEditConsumicionName(c.name || "");
    setEditConsumicionPrice(String(c.price ?? ""));
    setEditConsumicionDescription(c.description || "");
    setEditConsumicionStock(c.stock !== undefined && c.stock !== null ? String(c.stock) : "");
    setEditConsumicionFile(null);
    setEditConsumicionPreview(null);
  };

  const handleCancelEditConsumicion = () => {
    setEditingConsumicionId(null);
    setEditConsumicionName("");
    setEditConsumicionPrice("");
    setEditConsumicionDescription("");
    setEditConsumicionStock("");
    setEditConsumicionFile(null);
    setEditConsumicionPreview(null);
  };

  const handleSaveConsumicion = async () => {
    if (!editingConsumicionId) return;
    const price = parseFloat(editConsumicionPrice);
    if (isNaN(price) || price < 0) {
      toast({ title: "Precio debe ser un número mayor o igual a 0", status: "warning", duration: 3000 });
      return;
    }
    setConsumicionLoading(true);
    try {
      let imageUrl;
      if (editConsumicionFile) {
        const { data: uploadRes } = await eventApi.uploadConsumicionImage(editConsumicionFile);
        imageUrl = uploadRes?.imageUrl;
      }
      const { data } = await eventApi.updateConsumicion(eventData._id, editingConsumicionId, {
        name: editConsumicionName?.trim() || "",
        price,
        description: editConsumicionDescription?.trim() || undefined,
        stock: editConsumicionStock !== '' ? (parseInt(editConsumicionStock, 10) >= 0 ? parseInt(editConsumicionStock, 10) : undefined) : undefined,
        ...(imageUrl !== undefined && { imageUrl }),
      });
      setEventData(data.event);
      handleCancelEditConsumicion();
      toast({ title: "Consumición actualizada", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo actualizar", status: "error", duration: 4000 });
    } finally {
      setConsumicionLoading(false);
    }
  };

  const handleDeleteConsumicion = async (consumicionId) => {
    if (!window.confirm("¿Eliminar esta consumición del catálogo?")) return;
    setConsumicionLoading(true);
    try {
      const { data } = await eventApi.deleteConsumicion(eventData._id, consumicionId);
      setEventData(data.event);
      if (editingConsumicionId === consumicionId) handleCancelEditConsumicion();
      toast({ title: "Consumición eliminada", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "No se pudo eliminar", status: "error", duration: 4000 });
    } finally {
      setConsumicionLoading(false);
    }
  };

  const moreDetailsClick = () => {
    const details = {
      _id: event._id,
      title: event.title,
      tickets: event.tickets,
    };
    setEventDetails(details);
  };


  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    if (name.includes("addressRef")) {
      const [, inputName] = name.split(".");
      setEventData({
        ...eventData,
        addressRef: {
          ...eventData.addressRef,
          [inputName]: value,
        },
      });
    } else if (name === "pictures") {
      if (!validateSelectedImg(e.target.files[0])) {
        e.target.value = "";
        return;
      }
      setNewPicture(e.target.files[0]);
    } else if (name === "adultsOnly") {
      value = value === "true";
      setEventData({
        ...eventData,
        [name]: value,
      });
    } else if (name === "serviceFeePercentage") {
      const pct = Math.min(100, Math.max(0, Number(value) || 0));
      setEventData({
        ...eventData,
        serviceFeePercentage: pct / 100,
      });
    } else {
      setEventData({
        ...eventData,
        [name]: value,
      });
    }
  };

  const loadOptions = (inputValue) => {
    return axios
      .get(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${inputValue}&provincia=${selectedProvince}&aplanar=true&campos=estandar`)
      .then(({ data }) => data.localidades);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDemoMode) return;
    
    const updatedEvent = {
      ...eventData,
      dates: eventDates,
      pictures: newPicture ? await getBase64FromFile(newPicture) : eventData.pictures,
    };

    delete updatedEvent.addressRef;
    if (updatedEvent.sellingMethod === "FAST") delete updatedEvent.serviceFeePercentage;

    const updatedAddress = {
      ...eventData.addressRef,
      province: selectedProvince,
      locality: selectedLocality,
    };

    try {
      const { data } = await eventApi.updateEvent(eventData._id, {
        event: updatedEvent,
        address: updatedAddress,
      });
      
      toast({
        title: "Evento actualizado correctamente",
        status: "success",
        duration: 3000,
      });
      
      setIsDetailsModalOpen(false);
    } catch (error) {
      toast({
        title: "Error al actualizar el evento",
        status: "error",
        duration: 3000,
      });
    }
  };

  const loadImage = () => {
    if (newPicture) return URL.createObjectURL(newPicture);
    if (!eventData?.pictures) return "/assets/img/loading.svg";
    
    // If it's already a URL (Cloudinary), return it directly
    if (typeof eventData.pictures === 'string' && (eventData.pictures.startsWith('http://') || eventData.pictures.startsWith('https://'))) {
      return eventData.pictures;
    }
    
    // Handle Buffer format (old format - backward compatibility)
    if (eventData.pictures.type === "Buffer" || eventData.pictures.type === "buffer") {
      const base64Picture = bufferToBase64(eventData.pictures.data || eventData.pictures);
      return "data:image/png;base64," + base64Picture;
    }
    
    // Handle base64 string (old format)
    if (typeof eventData.pictures === 'string') {
      return eventData.pictures.startsWith('data:image') ? eventData.pictures : "data:image/png;base64," + eventData.pictures;
    }
    
    return "/assets/img/loading.svg";
  };

  return (
    <>
      <Card 
        mt="0" 
        maxW="full"
        boxShadow="md"
        border="1px solid"
        borderColor="gray.100"
        borderRadius="lg"
        _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
        transition="all 0.2s"
      >
        <CardHeader pb="2">
          <Heading as="h4" size="lg" fontFamily="secondary" fontWeight="600">{event.title}</Heading>
        </CardHeader>
        <CardBody pb="2">
          <Flex gap="1" flexDir="column">
            <Text fontSize="sm" fontFamily="secondary" color="gray.600" fontWeight="500">
              Entradas Vendidas: <Text as="span" color="primary" fontWeight="bold">{getTotalTicketsSelled()}</Text>
            </Text>
          </Flex>
        </CardBody>
        <CardFooter justify="flex-end" pt="2">
          <Flex flexDir="column" width="100%" alignItems="stretch" gap="3">
            <Button
              p={4}
              bg="primary"
              borderRadius="lg"
              color="#fff"
              _hover={{ bg: "buttonHover", transform: "translateY(-1px)", boxShadow: "md" }}
              _active={{ bg: "buttonHover" }}
              textDecoration="none"
              w="100%"
              fontFamily="secondary"
              fontWeight="500"
              onClick={() => setIsDetailsModalOpen(true)}
              transition="all 0.2s"
            >
              Detalles del evento
            </Button>

            <Button
              bg="primary"
              p={4}
              borderRadius="lg"
              color="#fff"
              textDecoration="none"
              w="100%"
              fontFamily="secondary"
              fontWeight="500"
              onClick={moreDetailsClick}
              _hover={{ bg: "buttonHover", transform: "translateY(-1px)", boxShadow: "md" }}
              _active={{ bg: "buttonHover" }}
              transition="all 0.2s"
            >
              Detalles de entradas
            </Button>

            <Button
              bg="primary"
              p={4}
              borderRadius="lg"
              color="#fff"
              textDecoration="none"
              w="100%"
              fontFamily="secondary"
              fontWeight="500"
              _hover={{ bg: "buttonHover", transform: "translateY(-1px)", boxShadow: "md" }}
              _active={{ bg: "buttonHover" }}
              transition="all 0.2s"
              onClick={() => navigate(`/seller/tickets?eventId=${event._id}`)}
            >
              Administrar tickets
            </Button>

            <Button
              bg="primary"
              p={4}
              borderRadius="lg"
              color="#fff"
              textDecoration="none"
              w="100%"
              fontFamily="secondary"
              fontWeight="500"
              onClick={onOpen}
              _hover={{ bg: "buttonHover", transform: "translateY(-1px)", boxShadow: "md" }}
              _active={{ bg: "buttonHover" }}
              transition="all 0.2s"
            >
              Generar Ticket de Cortesía
            </Button>
          </Flex>
        </CardFooter>
      </Card>

      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} size={{ base: "full", md: "6xl" }} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW={{ base: "100vw", md: "90vw" }} borderRadius={{ base: 0, md: "md" }}>
          <ModalHeader fontSize={{ base: "lg", md: "xl" }}>Editar Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {isDemoMode && (
              <Alert status="info" mb={4} borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Cuenta demo</AlertTitle>
                  <AlertDescription>No podés modificar los datos del evento. Solo podés ver la información y usar la landing de prueba.</AlertDescription>
                </Box>
              </Alert>
            )}
            <Flex direction={{ base: "column", md: "row" }} gap={{ base: 6, md: 8 }}>
              <Box flex="1" minW={0}>
                <form onSubmit={handleSubmit}>
                  <FormControl id="title" isRequired mb={4}>
                    <FormLabel>Nombre del Evento</FormLabel>
                    <Input
                      name="title"
                      value={eventData?.title || ""}
                      onChange={handleInputChange}
                      isReadOnly={isDemoMode}
                    />
                  </FormControl>

                  <FormControl id="adultsOnly" isRequired mb={4}>
                    <FormLabel>Evento para mayores de 18 años</FormLabel>
                    <Select
                      name="adultsOnly"
                      value={eventData?.adultsOnly?.toString()}
                      onChange={handleInputChange}
                      isDisabled={isDemoMode}
                    >
                      <option value="true">Si</option>
                      <option value="false">No</option>
                    </Select>
                  </FormControl>

                  <FormControl id="description" isRequired mb={4}>
                    <FormLabel>Descripción del Evento</FormLabel>
                    <Textarea
                      name="description"
                      value={eventData?.description || ""}
                      onChange={handleInputChange}
                      isReadOnly={isDemoMode}
                    />
                  </FormControl>

                  <FormControl id="dates" mb={4}>
                    <FormLabel>Fechas del evento</FormLabel>
                    <AddDates dates={eventDates} setDates={setEventDates} isReadOnly={isDemoMode} />
                  </FormControl>

                  <FormControl id="province" isRequired mb={4}>
                    <FormLabel>Provincia</FormLabel>
                    <Select
                      name="province"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      isDisabled={isDemoMode}
                    >
                      <option value="Buenos Aires">Buenos Aires</option>
                      <option value="Ciudad Autónoma de Buenos Aires">Ciudad Autónoma de Buenos Aires</option>
                      <option value="Catamarca">Catamarca</option>
                      <option value="Chaco">Chaco</option>
                      <option value="Chubut">Chubut</option>
                      <option value="Córdoba">Córdoba</option>
                      <option value="Corrientes">Corrientes</option>
                      <option value="Entre Ríos">Entre Ríos</option>
                      <option value="Formosa">Formosa</option>
                      <option value="Jujuy">Jujuy</option>
                      <option value="La Pampa">La Pampa</option>
                      <option value="La Rioja">La Rioja</option>
                      <option value="Mendoza">Mendoza</option>
                      <option value="Misiones">Misiones</option>
                      <option value="Neuquén">Neuquén</option>
                      <option value="Río Negro">Río Negro</option>
                      <option value="Salta">Salta</option>
                      <option value="San Juan">San Juan</option>
                      <option value="San Luis">San Luis</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Santa Fe">Santa Fe</option>
                      <option value="Santiago del Estero">Santiago del Estero</option>
                      <option value="Tierra del Fuego">Tierra del Fuego</option>
                      <option value="Tucumán">Tucumán</option>
                    </Select>
                  </FormControl>

                  <FormControl id="locality" isRequired mb={4}>
                    <FormLabel>Localidad</FormLabel>
                    <AsyncSelect
                      placeholder="Ingresa un nombre para buscar la localidad"
                      loadOptions={loadOptions}
                      onChange={(value) => setSelectedLocality(value.localidad_censal_nombre)}
                      value={{
                        localidad_censal_nombre: selectedLocality
                      }}
                      getOptionLabel={(e) => e.localidad_censal_nombre}
                      getOptionValue={(e) => e.localidad_censal_nombre}
                      isDisabled={isDemoMode}
                    />
                  </FormControl>

                  <FormControl id="direction" isRequired mb={4}>
                    <FormLabel>Dirección</FormLabel>
                    <Input
                      name="addressRef.direction"
                      value={eventData?.addressRef?.direction || ""}
                      onChange={handleInputChange}
                      isReadOnly={isDemoMode}
                    />
                  </FormControl>

                  <FormControl id="place" isRequired mb={4}>
                    <FormLabel>Nombre del establecimiento</FormLabel>
                    <Input
                      name="addressRef.place"
                      value={eventData?.addressRef?.place || ""}
                      onChange={handleInputChange}
                      isReadOnly={isDemoMode}
                    />
                  </FormControl>

                  <FormControl id="postalCode" isRequired mb={4}>
                    <FormLabel>Código postal</FormLabel>
                    <Input
                      name="addressRef.postalCode"
                      type="number"
                      value={eventData?.addressRef?.postalCode || ""}
                      onChange={handleInputChange}
                      isReadOnly={isDemoMode}
                    />
                  </FormControl>

                  {(eventData?.sellingMethod === "SIMPLE" || eventData?.sellingMethod === "CUSTOM") && (
                    <FormControl id="serviceFeePercentage" mb={4}>
                      <FormLabel>Cargo por servicio para clientes (%)</FormLabel>
                      <Input
                        name="serviceFeePercentage"
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        value={eventData?.serviceFeePercentage != null ? Math.round(Number(eventData.serviceFeePercentage) * 100) : ""}
                        onChange={handleInputChange}
                        placeholder="0"
                        isReadOnly={isDemoMode}
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Solo para CBU y Tokens. Por defecto 0%. Si querés cobrar un cargo a los compradores, configurá el porcentaje acá.
                      </Text>
                    </FormControl>
                  )}

                  {eventData?.sellingMethod === "FAST" && (
                    <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                      <Text fontSize="sm" fontWeight="500">Cargo por servicio (Mercado Pago)</Text>
                      <Text fontSize="xs" color="gray.600">Lo configura GetPass desde el panel de administración. Por defecto 10%.</Text>
                    </Box>
                  )}

                  {!isDemoMode && (
                    <>
                      <Button type="submit" colorScheme="blue" mr={3}>
                        Guardar cambios
                      </Button>
                      <Button onClick={() => setIsDetailsModalOpen(false)}>Cancelar</Button>
                    </>
                  )}
                </form>

                <Heading as="h4" size="sm" mt={6} mb={3} fontFamily="secondary">RRPP (Revendedores)</Heading>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Los compradores pueden asociar la venta a un revendedor ingresando el código o eligiéndolo.
                </Text>
                <List spacing={2} mb={4}>
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
                            isDisabled={isDemoMode}
                          />
                          <Input
                            size="sm"
                            value={editRrppCode}
                            onChange={(e) => setEditRrppCode(e.target.value)}
                            placeholder="Código (opcional)"
                            flex="1"
                            minW="100px"
                            isDisabled={isDemoMode}
                          />
                          <Button size="sm" colorScheme="blue" onClick={handleSaveRrpp} isLoading={rrppLoading} isDisabled={isDemoMode}>Guardar</Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEditRrpp}>Cancelar</Button>
                        </>
                      ) : (
                        <>
                          <Text as="span" fontWeight="500">{r.fullname}</Text>
                          {r.code && <Badge colorScheme="gray">{r.code}</Badge>}
                          {!isDemoMode && (
                            <>
                              <Button size="xs" variant="outline" onClick={() => handleStartEditRrpp(r)}>Editar</Button>
                              <Button size="xs" variant="outline" colorScheme="red" onClick={() => handleDeleteRrpp(r._id)}>Eliminar</Button>
                            </>
                          )}
                        </>
                      )}
                    </ListItem>
                  ))}
                </List>
                {!isDemoMode && (
                <Flex as="form" onSubmit={handleAddRrpp} gap={2} flexWrap="wrap" alignItems="flex-end">
                  <FormControl flex="1" minW="120px">
                    <FormLabel fontSize="sm">Nombre</FormLabel>
                    <Input size="sm" value={newRrppName} onChange={(e) => setNewRrppName(e.target.value)} placeholder="Nombre del RRPP" />
                  </FormControl>
                  <FormControl flex="1" minW="100px">
                    <FormLabel fontSize="sm">Código (opcional)</FormLabel>
                    <Input size="sm" value={newRrppCode} onChange={(e) => setNewRrppCode(e.target.value)} placeholder="Ej: JUAN24" />
                  </FormControl>
                  <Button size="sm" type="submit" colorScheme="blue" isLoading={rrppLoading}>Agregar RRPP</Button>
                </Flex>
                )}

                <Heading as="h4" size="sm" mt={6} mb={3} fontFamily="secondary">Consumiciones</Heading>
                <Text fontSize="sm" color="gray.600" mb={3}>
                  Catálogo de bebidas, comida u otros ítems que podés vender en el evento.
                </Text>
                <List spacing={2} mb={4}>
                  {consumicionesList.map((c) => (
                    <ListItem key={c._id} display="flex" alignItems="center" gap={2} flexWrap="wrap">
                      {editingConsumicionId === c._id ? (
                        <>
                          <Box>
                            {(editConsumicionPreview || c.imageUrl) && (
                              <Image src={editConsumicionPreview || c.imageUrl} alt="" boxSize="12" objectFit="cover" borderRadius="md" mr={2} />
                            )}
                            <FormControl>
                              <FormLabel fontSize="xs">Foto</FormLabel>
                              <FileInput size="sm" accept="image/*" value={editConsumicionFile?.name} onChange={(e) => { const f = e.target.files?.[0]; setEditConsumicionFile(f || null); setEditConsumicionPreview(f ? URL.createObjectURL(f) : null); }} />
                            </FormControl>
                          </Box>
                          <Input size="sm" value={editConsumicionName} onChange={(e) => setEditConsumicionName(e.target.value)} placeholder="Nombre" flex="1" minW="100px" isDisabled={isDemoMode} />
                          <Input size="sm" type="number" min={0} step={0.01} value={editConsumicionPrice} onChange={(e) => setEditConsumicionPrice(e.target.value)} placeholder="Precio" w="90px" isDisabled={isDemoMode} />
                          <Input size="sm" value={editConsumicionDescription} onChange={(e) => setEditConsumicionDescription(e.target.value)} placeholder="Descripción (opc.)" flex="1" minW="100px" isDisabled={isDemoMode} />
                          <Input size="sm" type="number" min={0} value={editConsumicionStock} onChange={(e) => setEditConsumicionStock(e.target.value)} placeholder="Stock" w="80px" isDisabled={isDemoMode} />
                          <Button size="sm" colorScheme="blue" onClick={handleSaveConsumicion} isLoading={consumicionLoading} isDisabled={isDemoMode}>Guardar</Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEditConsumicion}>Cancelar</Button>
                        </>
                      ) : (
                        <>
                          {c.imageUrl && <Image src={c.imageUrl} alt={c.name} boxSize="10" objectFit="cover" borderRadius="md" />}
                          <Text as="span" fontWeight="500">{c.name}</Text>
                          <Badge colorScheme="green">${Number(c.price).toLocaleString()}</Badge>
                          {c.description && <Text as="span" fontSize="sm" color="gray.500">{c.description}</Text>}
                          <Text as="span" fontSize="xs" color="gray.500">Stock: {c.stock !== undefined && c.stock !== null ? c.stock : "Sin límite"}</Text>
                          {!isDemoMode && (
                            <>
                              <Button size="xs" variant="outline" onClick={() => handleStartEditConsumicion(c)}>Editar</Button>
                              <Button size="xs" variant="outline" colorScheme="red" onClick={() => handleDeleteConsumicion(c._id)}>Eliminar</Button>
                            </>
                          )}
                        </>
                      )}
                    </ListItem>
                  ))}
                </List>
                {!isDemoMode && (
                <>
                <Flex as="form" onSubmit={handleAddConsumicion} gap={2} flexWrap="wrap" alignItems="flex-end">
                  <FormControl w="auto">
                    <FormLabel fontSize="sm">Foto (opc.)</FormLabel>
                    <Flex align="center" gap={2}>
                      {newConsumicionPreview && <Image src={newConsumicionPreview} alt="" boxSize="12" objectFit="cover" borderRadius="md" />}
                      <FileInput size="sm" accept="image/*" value={newConsumicionFile?.name} onChange={(e) => { const f = e.target.files?.[0]; setNewConsumicionFile(f || null); setNewConsumicionPreview(f ? URL.createObjectURL(f) : null); }} />
                    </Flex>
                  </FormControl>
                  <FormControl flex="1" minW="100px">
                    <FormLabel fontSize="sm">Nombre</FormLabel>
                    <Input size="sm" value={newConsumicionName} onChange={(e) => setNewConsumicionName(e.target.value)} placeholder="Ej: Cerveza" />
                  </FormControl>
                  <FormControl w="90px">
                    <FormLabel fontSize="sm">Precio ($)</FormLabel>
                    <Input size="sm" type="number" min={0} step={0.01} value={newConsumicionPrice} onChange={(e) => setNewConsumicionPrice(e.target.value)} placeholder="0" />
                  </FormControl>
                  <FormControl flex="1" minW="120px">
                    <FormLabel fontSize="sm">Descripción (opc.)</FormLabel>
                    <Input size="sm" value={newConsumicionDescription} onChange={(e) => setNewConsumicionDescription(e.target.value)} placeholder="Opcional" />
                  </FormControl>
                  <Button size="sm" type="submit" colorScheme="blue" isLoading={consumicionLoading}>Agregar</Button>
                </Flex>
                <FormControl maxW="100px" mt={2}>
                  <FormLabel fontSize="sm">Stock (opc.)</FormLabel>
                  <Input size="sm" type="number" min={0} value={newConsumicionStock} onChange={(e) => setNewConsumicionStock(e.target.value)} placeholder="Sin límite" />
                </FormControl>
                </>
                )}
              </Box>

              <Box w={{ base: "100%", md: "300px" }} flexShrink={0}>
                <Text fontSize="lg" fontWeight="semibold" mb={3}>Portada del evento</Text>
                <Image
                  src={loadImage()}
                  alt="Event cover"
                  mb={4}
                  borderRadius="md"
                  w="100%"
                  maxH={{ base: "220px", md: "none" }}
                  objectFit="cover"
                />
                {!isDemoMode && (
                <FormControl>
                  <FileInput
                    name="pictures"
                    accept="image/*"
                    value={newPicture?.name}
                    onChange={handleInputChange}
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    La imagen debe medir 800 x 800 píxeles y no pesar más de 1MB.
                  </Text>
                </FormControl>
                )}
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      <CourtesyTicketModal isOpen={isOpen} onClose={onClose} event={event} />
    </>
  );
};

export default EventsList;