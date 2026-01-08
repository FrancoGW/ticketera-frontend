import { useState, useRef } from "react";
import {
  Flex,
  Image,
  Heading,
  Button,
  Tooltip,
  Text,
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
  useToast,
  Box,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  Switch,
} from "@chakra-ui/react";
import AsyncSelect from "react-select/async";
import AddDates from "../../components/AddDates";
import eventApi from "../../Api/event";
import ticketApi from "../../Api/ticket";
import {
  bufferToBase64,
  getBase64FromFile,
  validateSelectedImg,
} from "../../common/utils";
import axios from "axios";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminEventCard = ({ event, pictures, id, title, status }) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const cancelRef = useRef();
  const [updateEventStatus, setUpdateEventStatus] = useState({ status });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [eventData, setEventData] = useState(event);
  const [eventDates, setEventDates] = useState(event?.dates || []);
  const [selectedProvince, setSelectedProvince] = useState(
    event?.addressRef?.province || ""
  );
  const [selectedLocality, setSelectedLocality] = useState(
    event?.addressRef?.locality || ""
  );
  const [newPicture, setNewPicture] = useState("");
  const [tickets, setTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    title: "",
    price: 0,
    ticketType: "GENERAL",
    discountPercentage: 0,
    maxEntries: 0,
    dates: [
      {
        date: "",
        timeStart: "",
        timeEnd: "",
      },
    ],
    eventRef: id,
    saleStartDate: "",
    saleEndDate: "",
    visibleFrom: "",
    soldCount: 0,
  });
  const toast = useToast();

  const loadTickets = async () => {
    try {
      const response = await eventApi.getEventById(id);
      setTickets(response.data.event.tickets || []);
    } catch (error) {
      toast({
        title: "Error al cargar tickets",
        description: "No se pudieron cargar los tickets del evento",
        status: "error",
        duration: 3000,
      });
    }
  };
  // ... mantener otros estados y funciones existentes ...
  const handleCreateTicket = async () => {
    if (!newTicket.title || !newTicket.price || !newTicket.maxEntries || 
        !newTicket.dates[0].date || !newTicket.dates[0].timeStart || 
        !newTicket.dates[0].timeEnd) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        status: "error",
        duration: 3000,
      });
      return;
    }
  
    try {
      const ticketData = {
        title: newTicket.title,
        price: parseFloat(newTicket.price),
        maxEntries: parseInt(newTicket.maxEntries),
        ticketType: "GENERAL",
        discountPercentage: parseFloat(newTicket.discountPercentage) || 0,
        dates: [{
          date: newTicket.dates[0].date,
          timeStart: newTicket.dates[0].timeStart,
          timeEnd: newTicket.dates[0].timeEnd
        }],
        eventRef: id,
        saleStartDate: new Date(newTicket.saleStartDate).toISOString(),
        saleEndDate: new Date(newTicket.saleEndDate).toISOString(),
        visibleFrom: new Date(newTicket.visibleFrom).toISOString(),
        soldCount: 0
      };
  
      console.log('Datos a enviar:', ticketData);
      
      const response = await ticketApi.createTicket(ticketData);
      console.log('Respuesta:', response);
  
      toast({
        title: "Ticket creado exitosamente",
        status: "success",
        duration: 3000,
      });
  
      loadTickets();
      setNewTicket({
        title: "",
        price: 0,
        maxEntries: 0,
        ticketType: "GENERAL",
        discountPercentage: 0,
        dates: [{
          date: "",
          timeStart: "",
          timeEnd: ""
        }],
        eventRef: id,
        saleStartDate: "",
        saleEndDate: "",
        visibleFrom: "",
        soldCount: 0
      });
    } catch (error) {
      console.error('Error completo:', error);
      console.log('Datos que causaron el error:', ticketData);
      toast({
        title: "Error al crear el ticket",
        description: error.message || "Error al crear el ticket",
        status: "error",
        duration: 3000,
      });
    }
  };
  const handleUpdateTicket = async () => {
    if (
      !editingTicket.title ||
      !editingTicket.price ||
      !editingTicket.dates[0].date ||
      !editingTicket.saleStartDate ||
      !editingTicket.saleEndDate ||
      !editingTicket.visibleFrom
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await ticketApi.updateTicket(editingTicket._id, {
        title: editingTicket.title,
        price: editingTicket.price,
        dates: [
          {
            date: editingTicket.dates[0].date,
            timeStart: editingTicket.dates[0].timeStart,
            timeEnd: editingTicket.dates[0].timeEnd,
          },
        ],
        maxEntries: editingTicket.maxEntries,
        type: editingTicket.type,
        isNumbered: editingTicket.isNumbered,
        generateServiceFee: editingTicket.generateServiceFee,
        defaultConfiguration: {
          isTransferable: editingTicket.defaultConfiguration.isTransferable,
        },
        saleStartDate: editingTicket.saleStartDate,
        saleEndDate: editingTicket.saleEndDate,
        visibleFrom: editingTicket.visibleFrom,
      });

      toast({
        title: "Ticket actualizado exitosamente",
        status: "success",
        duration: 3000,
      });

      loadTickets();
      setEditingTicket(null);
    } catch (error) {
      toast({
        title: "Error al actualizar el ticket",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await ticketApi.deleteTicket(ticketId);
      toast({
        title: "Ticket eliminado exitosamente",
        status: "success",
        duration: 3000,
      });
      loadTickets();
    } catch (error) {
      toast({
        title: "Error al eliminar el ticket",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await eventApi.deleteEventById(id);
      toast({
        title: "Evento eliminado correctamente",
        status: "success",
        duration: 3000,
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error al eliminar el evento",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleRejectEvent = (id) => {
    setIsLoading(true);
    eventApi.actualizeEventStatus(id, "rejected").then((res) => {
      setUpdateEventStatus({ status: "rejected" });
      setIsLoading(false);
    });
  };

  const handleApproveEvent = (id) => {
    setIsLoading(true);
    eventApi.actualizeEventStatus(id, "approved").then((res) => {
      setUpdateEventStatus({ status: "approved" });
      setIsLoading(false);
    });
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
      .get(
        `https://apis.datos.gob.ar/georef/api/localidades?nombre=${inputValue}&provincia=${selectedProvince}&aplanar=true&campos=estandar`
      )
      .then(({ data }) => data.localidades);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedEvent = {
      ...eventData,
      dates: eventDates,
      pictures: newPicture
        ? await getBase64FromFile(newPicture)
        : eventData.pictures,
    };

    const { addressRef, ...eventWithoutAddress } = updatedEvent;

    const updatedAddress = {
      ...eventData.addressRef,
      province: selectedProvince,
      locality: selectedLocality,
    };

    try {
      await eventApi.updateEvent(eventData._id, {
        event: eventWithoutAddress,
        address: updatedAddress,
      });

      toast({
        title: "Evento actualizado correctamente",
        status: "success",
        duration: 3000,
      });

      setIsDetailsModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar:", error);
      toast({
        title: "Error al actualizar el evento",
        description: "No se pudo actualizar el evento",
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
      <Flex
        flexDir="column"
        w="300px"
        h="500px"
        mb="6"
        boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px"
        borderRadius="none"
      >
        {pictures && (
          <Image
            minH={300}
            src={
              pictures
                ? (typeof pictures === 'string' && (pictures.startsWith('http://') || pictures.startsWith('https://'))
                    ? pictures
                    : "data:image/png;base64," + pictures)
                : "/imagenes/img1.jpeg"
            }
            alt={title}
            h="50%"
            w="100%"
            borderTopRadius="none"
          />
        )}
        {isLoading ? (
          <Flex w="100%" align="center" justify="center" h="50%">
            <Image src="/assets/img/loading.svg" />
          </Flex>
        ) : (
          <Flex
            flexDir="column"
            align="center"
            h="50%"
            fontSize="smaller"
            gap="3"
          >
            <Heading
              as="h2"
              fontSize={
                title.length > 30 ? "20px" : title.length > 24 ? "18px" : "2xl"
              }
              fontFamily="secondary"
              fontWeight="500"
              mt="2"
            >
              {title}
            </Heading>


            <Button
              bg="primary"
              borderRadius="5px"
              color="#fff"
              _hover={{ bg: "buttonHover" }}
              _active={{ bg: "buttonHover" }}
              fontFamily="secondary"
              fontWeight="normal"
              w="80%"
              onClick={() => setIsDetailsModalOpen(true)}
            >
              Detalles del evento
            </Button>

           
            <Button
              w="80%"
              colorScheme="red"
              onClick={() => setIsDeleteAlertOpen(true)}
            >
              Eliminar
            </Button>
          </Flex>
        )}
      </Flex>

      {/* Modal de Tickets */}
      <Modal
        isOpen={isTicketsModalOpen}
        onClose={() => setIsTicketsModalOpen(false)}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="secondary">Gestionar Tickets</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb={6}>
              <Heading size="sm" mb={4}>
                {editingTicket ? "Editar Ticket" : "Crear Nuevo Ticket"}
              </Heading>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Nombre del Ticket</FormLabel>
                  <Input
                    value={
                      editingTicket ? editingTicket.title : newTicket.title
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          title: e.target.value,
                        });
                      } else {
                        setNewTicket({ ...newTicket, title: e.target.value });
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Precio</FormLabel>
                  <Input
                    type="number"
                    value={
                      editingTicket ? editingTicket.price : newTicket.price
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          price: e.target.value,
                        });
                      } else {
                        setNewTicket({ ...newTicket, price: e.target.value });
                      }
                    }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Cantidad de entradas</FormLabel>
                  <Input
                    type="number"
                    value={
                      editingTicket
                        ? editingTicket.maxEntries
                        : newTicket.maxEntries
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          maxEntries: parseInt(e.target.value),
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          maxEntries: parseInt(e.target.value),
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Porcentaje de descuento</FormLabel>
                  <Input
                    type="number"
                    value={
                      editingTicket
                        ? editingTicket.discountPercentage
                        : newTicket.discountPercentage
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          discountPercentage: e.target.value,
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          discountPercentage: e.target.value,
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Cantidad vendida</FormLabel>
                  <Input
                    type="number"
                    value={
                      editingTicket
                        ? editingTicket.soldCount
                        : newTicket.soldCount
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          soldCount: e.target.value,
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          soldCount: e.target.value,
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Fecha del evento</FormLabel>
                  <Input
                    type="date"
                    value={
                      editingTicket
                        ? editingTicket.dates[0].date
                        : newTicket.dates[0].date
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          dates: [
                            { ...editingTicket.dates[0], date: e.target.value },
                          ],
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          dates: [
                            { ...newTicket.dates[0], date: e.target.value },
                          ],
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Hora de inicio del evento</FormLabel>
                  <Input
                    type="time"
                    value={
                      editingTicket
                        ? editingTicket.dates[0].timeStart
                        : newTicket.dates[0].timeStart
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          dates: [
                            {
                              ...editingTicket.dates[0],
                              timeStart: e.target.value,
                            },
                          ],
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          dates: [
                            {
                              ...newTicket.dates[0],
                              timeStart: e.target.value,
                            },
                          ],
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Hora de fin del evento</FormLabel>
                  <Input
                    type="time"
                    value={
                      editingTicket
                        ? editingTicket.dates[0].timeEnd
                        : newTicket.dates[0].timeEnd
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          dates: [
                            {
                              ...editingTicket.dates[0],
                              timeEnd: e.target.value,
                            },
                          ],
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          dates: [
                            { ...newTicket.dates[0], timeEnd: e.target.value },
                          ],
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Inicio de venta</FormLabel>
                  <Input
                    type="datetime-local"
                    value={
                      editingTicket
                        ? editingTicket.saleStartDate
                        : newTicket.saleStartDate
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          saleStartDate: e.target.value,
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          saleStartDate: e.target.value,
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Fin de venta</FormLabel>
                  <Input
                    type="datetime-local"
                    value={
                      editingTicket
                        ? editingTicket.saleEndDate
                        : newTicket.saleEndDate
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          saleEndDate: e.target.value,
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          saleEndDate: e.target.value,
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Visible desde</FormLabel>
                  <Input
                    type="datetime-local"
                    value={
                      editingTicket
                        ? editingTicket.visibleFrom
                        : newTicket.visibleFrom
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          visibleFrom: e.target.value,
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          visibleFrom: e.target.value,
                        });
                      }
                    }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Tipo de Ticket</FormLabel>
                  <Select
                    value={
                      editingTicket
                        ? editingTicket.ticketType
                        : newTicket.ticketType
                    }
                    onChange={(e) => {
                      if (editingTicket) {
                        setEditingTicket({
                          ...editingTicket,
                          ticketType: e.target.value,
                        });
                      } else {
                        setNewTicket({
                          ...newTicket,
                          ticketType: e.target.value,
                        });
                      }
                    }}
                  >
                    <option value="GENERAL">General</option>
                    <option value="VIP">VIP</option>
                  </Select>
                </FormControl>

                <Button
                  colorScheme="blue"
                  onClick={
                    editingTicket ? handleUpdateTicket : handleCreateTicket
                  }
                >
                  {editingTicket ? "Actualizar Ticket" : "Crear Ticket"}
                </Button>

                {editingTicket && (
                  <Button
                    variant="outline"
                    onClick={() => setEditingTicket(null)}
                  >
                    Cancelar Edición
                  </Button>
                )}
              </Stack>
            </Box>

            <Box>
              <Heading size="sm" mb={4}>
                Tickets Existentes
              </Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Nombre</Th>
                    <Th>Precio</Th>
                    <Th>Tipo</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tickets.map((ticket) => (
                    <Tr key={ticket._id}>
                      <Td>{ticket.title}</Td>
                      <Td>${ticket.price}</Td>
                      <Td>{ticket.ticketType}</Td>
                      <Td>
                        <Flex gap={2}>
                          <EditIcon
                            cursor="pointer"
                            onClick={() => setEditingTicket(ticket)}
                          />
                          <DeleteIcon
                            cursor="pointer"
                            color="red.500"
                            onClick={() => handleDeleteTicket(ticket._id)}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              {tickets.length === 0 && (
                <Text textAlign="center" color="gray.500" my={4}>
                  No hay tickets creados
                </Text>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
      {/* Modal de Detalles del Evento */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader fontFamily="secondary">Editar Evento</ModalHeader>
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
                      <option value="Ciudad Autónoma de Buenos Aires">
                        Ciudad Autónoma de Buenos Aires
                      </option>
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
                      <option value="Santiago del Estero">
                        Santiago del Estero
                      </option>
                      <option value="Tierra del Fuego">Tierra del Fuego</option>
                      <option value="Tucumán">Tucumán</option>
                    </Select>
                  </FormControl>

                  <FormControl id="locality" isRequired mb={4}>
                    <FormLabel>Localidad</FormLabel>
                    <AsyncSelect
                      placeholder="Ingresa un nombre para buscar la localidad"
                      loadOptions={loadOptions}
                      onChange={(value) =>
                        setSelectedLocality(value.localidad_censal_nombre)
                      }
                      value={{
                        localidad_censal_nombre: selectedLocality,
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

                  <Button
                    type="submit"
                    bg="primary"
                    color="white"
                    _hover={{ bg: "buttonHover" }}
                    mr={3}
                  >
                    Guardar cambios
                  </Button>
                  <Button onClick={() => setIsDetailsModalOpen(false)}>
                    Cancelar
                  </Button>
                </form>
              </Box>

              <Box w="300px">
                <Text fontSize="xl" mb={4}>
                  Portada del evento
                </Text>
                <Image src={loadImage()} alt="Event cover" mb={4} />
                <FormControl>
                  <Input
                    type="file"
                    name="pictures"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    La imagen debe medir 800 x 800 píxeles y no pesar más de
                    1MB.
                  </Text>
                </FormControl>
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar Evento
            </AlertDialogHeader>

            <AlertDialogBody>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteAlertOpen(false)}
              >
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default AdminEventCard;
