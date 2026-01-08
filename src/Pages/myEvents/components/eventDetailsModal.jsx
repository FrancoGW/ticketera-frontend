import {
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
    Button,
    Flex,
    Box,
    Image,
    Text,
    Card,
    CardBody,
    Alert,
    AlertIcon,
    useToast
  } from "@chakra-ui/react";
  import { useState, useEffect } from "react";
  import AddDates from "../../../components/AddDates";
  import AsyncSelect from "react-select/async";
  import axios from "axios";
  import { bufferToBase64, getBase64FromFile, validateSelectedImg } from "../../../common/utils";
  import eventApi from "../../../Api/event";
  
  const EventDetailsModal = ({ isOpen, onClose, event: initialEvent }) => {
    const [event, setEvent] = useState(initialEvent);
    const [eventDates, setEventDates] = useState(initialEvent?.dates || []);
    const [selectedProvince, setSelectedProvince] = useState(initialEvent?.addressRef?.province || "");
    const [selectedLocality, setSelectedLocality] = useState(initialEvent?.addressRef?.locality || "");
    const [newPicture, setNewPicture] = useState("");
    const toast = useToast();
  
    useEffect(() => {
      if (initialEvent) {
        setEvent(initialEvent);
        setEventDates(initialEvent.dates);
        setSelectedProvince(initialEvent.addressRef?.province);
        setSelectedLocality(initialEvent.addressRef?.locality);
      }
    }, [initialEvent]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      const updatedEvent = {
        ...event,
        dates: eventDates,
        pictures: newPicture ? await getBase64FromFile(newPicture) : event.pictures,
      };
  
      delete updatedEvent.addressRef;
  
      const updatedAddress = {
        ...event.addressRef,
        province: selectedProvince,
        locality: selectedLocality,
      };
  
      try {
        const { data } = await eventApi.updateEvent(event._id, {
          event: updatedEvent,
          address: updatedAddress,
        });
        
        toast({
          title: "Evento actualizado correctamente",
          status: "success",
          duration: 3000,
        });
        
        onClose();
      } catch (error) {
        toast({
          title: "Error al actualizar el evento",
          status: "error",
          duration: 3000,
        });
      }
    };
  
    const handleInputChange = (e) => {
      let name = e.target.name;
      let value = e.target.value;
  
      if (e.target.name.includes("addressRef")) {
        const [, inputName] = e.target.name.split(".");
        setEvent({
          ...event,
          addressRef: {
            ...event.addressRef,
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
        setEvent({
          ...event,
          [name]: value,
        });
      } else {
        setEvent({
          ...event,
          [name]: value,
        });
      }
    };
  
    const loadOptions = (inputValue) => {
      return axios
        .get(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${inputValue}&provincia=${selectedProvince}&aplanar=true&campos=estandar`)
        .then(({ data }) => data.localidades);
    };
  
    const deleteDate = (date) => {
      const newDates = eventDates.filter(
        (d) => d.timestampStart !== date.timestampStart || d.timestampEnd !== date.timestampEnd
      );
      setEventDates(newDates);
    };
  
    const loadImage = () => {
      if (!event?.pictures) return "/assets/img/loading.svg";
      let base64Picture = event.pictures.type === "Buffer" ? bufferToBase64(event.pictures.data) : event.pictures;
      return newPicture ? URL.createObjectURL(newPicture) : "data:image/png;base64," + base64Picture;
    };
  
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
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
                      value={event?.title || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>
  
                  <FormControl id="adultsOnly" isRequired mb={4}>
                    <FormLabel>Evento para mayores de 18 años</FormLabel>
                    <Select
                      name="adultsOnly"
                      value={event?.adultsOnly?.toString()}
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
                      value={event?.description || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>
  
                  <FormControl id="dates" mb={4}>
                    <FormLabel>Fechas del evento</FormLabel>
                    <AddDates dates={eventDates} setDates={setEventDates} />
                    <Card mt={4}>
                      <CardBody>
                        {eventDates.map((date, index) => (
                          <Box key={index} mb={2}>
                            <Text>
                              {new Date(date.timestampStart).toLocaleDateString()} - 
                              Inicio: {new Date(date.timestampStart).toLocaleTimeString()} - 
                              Fin: {new Date(date.timestampEnd).toLocaleTimeString()}
                            </Text>
                          </Box>
                        ))}
                      </CardBody>
                    </Card>
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
                      {/* Agregar el resto de las provincias */}
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
                      value={event?.addressRef?.direction || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>
  
                  <FormControl id="place" isRequired mb={4}>
                    <FormLabel>Nombre del establecimiento</FormLabel>
                    <Input
                      name="addressRef.place"
                      value={event?.addressRef?.place || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>
  
                  <FormControl id="postalCode" isRequired mb={4}>
                    <FormLabel>Código postal</FormLabel>
                    <Input
                      name="addressRef.postalCode"
                      type="number"
                      value={event?.addressRef?.postalCode || ""}
                      onChange={handleInputChange}
                    />
                  </FormControl>
  
                  <Button type="submit" colorScheme="blue" mr={3}>
                    Guardar cambios
                  </Button>
                  <Button onClick={onClose}>Cancelar</Button>
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
    );
  };
  
  export default EventDetailsModal;