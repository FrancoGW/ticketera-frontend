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
  useToast
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useState } from "react";
import CourtesyTicketModal from "./CourtesyTicketModal";
import AsyncSelect from "react-select/async";
import AddDates from "../../../components/AddDates";
import axios from "axios";
import eventApi from "../../../Api/event";
import { bufferToBase64, getBase64FromFile, validateSelectedImg } from "../../../common/utils";

const EventsList = ({ event, setEventDetails }) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [eventData, setEventData] = useState(event);
  const [eventDates, setEventDates] = useState(event?.dates || []);
  const [selectedProvince, setSelectedProvince] = useState(event?.addressRef?.province || "");
  const [selectedLocality, setSelectedLocality] = useState(event?.addressRef?.locality || "");
  const [newPicture, setNewPicture] = useState("");
  const toast = useToast();

  const getTotalTicketsSelled = () => {
    let total = 0;
    event?.tickets?.forEach((ticket) => {
      total += ticket.selled;
    });
    return total;
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
    
    const updatedEvent = {
      ...eventData,
      dates: eventDates,
      pictures: newPicture ? await getBase64FromFile(newPicture) : eventData.pictures,
    };

    delete updatedEvent.addressRef;

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
              isDisabled
              title="Funcionalidad en desarrollo"
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

      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} size="6xl">
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader>Editar Evento</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex justifyContent="space-between" gap={8}>
              <Box flex="1">
                <form onSubmit={handleSubmit}>
                  <FormControl id="title" isRequired mb={4}>
                    <FormLabel>Nombre del Evento</FormLabel>
                    <Input
                      name="title"
                      value={eventData?.title || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl id="adultsOnly" isRequired mb={4}>
                    <FormLabel>Evento para mayores de 18 años</FormLabel>
                    <Select
                      name="adultsOnly"
                      value={eventData?.adultsOnly?.toString()}
                      onChange={handleInputChange}
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
                    />
                  </FormControl>

                  <FormControl id="dates" mb={4}>
                    <FormLabel>Fechas del evento</FormLabel>
                    <AddDates dates={eventDates} setDates={setEventDates} />
                  </FormControl>

                  <FormControl id="province" isRequired mb={4}>
                    <FormLabel>Provincia</FormLabel>
                    <Select
                      name="province"
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
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
                    />
                  </FormControl>

                  <FormControl id="direction" isRequired mb={4}>
                    <FormLabel>Dirección</FormLabel>
                    <Input
                      name="addressRef.direction"
                      value={eventData?.addressRef?.direction || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl id="place" isRequired mb={4}>
                    <FormLabel>Nombre del establecimiento</FormLabel>
                    <Input
                      name="addressRef.place"
                      value={eventData?.addressRef?.place || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl id="postalCode" isRequired mb={4}>
                    <FormLabel>Código postal</FormLabel>
                    <Input
                      name="addressRef.postalCode"
                      type="number"
                      value={eventData?.addressRef?.postalCode || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <Button type="submit" colorScheme="blue" mr={3}>
                    Guardar cambios
                  </Button>
                  <Button onClick={() => setIsDetailsModalOpen(false)}>Cancelar</Button>
                </form>
              </Box>

              <Box w="300px">
                <Text fontSize="xl" mb={4}>Portada del evento</Text>
                <Image
                  src={loadImage()}
                  alt="Event cover"
                  mb={4}
                />
                <FormControl>
                  <Input
                    type="file"
                    name="pictures"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    La imagen debe medir 800 x 800 píxeles y no pesar más de 1MB.
                  </Text>
                </FormControl>
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