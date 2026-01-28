import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Badge,
  VStack,
} from "@chakra-ui/react";
import { FiGift } from "react-icons/fi";
import AsyncSelect from "react-select/async";
import AddDates from "../../components/AddDates";
import eventApi from "../../Api/event";
import ticketApi from "../../Api/ticket";
import CourtesyTicketModal from "../../Pages/myEvents/components/CourtesyTicketModal";
import {
  bufferToBase64,
  getBase64FromFile,
  validateSelectedImg,
} from "../../common/utils";
import axios from "axios";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const AdminEventCard = ({ event, pictures, id, title, status, onStatusChange, onDelete }) => {
  const navigate = useNavigate();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
  const [isCourtesyTicketModalOpen, setIsCourtesyTicketModalOpen] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
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
      // Actualizar el estado local sin recargar la página
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      toast({
        title: "Error al eliminar el evento",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleRejectEvent = async (id) => {
    setIsLoading(true);
    try {
      await eventApi.actualizeEventStatus(id, "rejected");
      setUpdateEventStatus({ status: "rejected" });
      toast({
        title: "Evento rechazado",
        description: "El evento ha sido rechazado correctamente",
        status: "success",
        duration: 3000,
      });
      // Actualizar el estado local sin recargar la página
      if (onStatusChange) {
        onStatusChange(id, "rejected");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo rechazar el evento",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEvent = async (id) => {
    setIsLoading(true);
    try {
      await eventApi.actualizeEventStatus(id, "approved");
      setUpdateEventStatus({ status: "approved" });
      toast({
        title: "Evento aprobado",
        description: "El evento ha sido aprobado correctamente",
        status: "success",
        duration: 3000,
      });
      // Actualizar el estado local sin recargar la página
      if (onStatusChange) {
        onStatusChange(id, "approved");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo aprobar el evento",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
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
        w="100%"
        maxW="350px"
        minH="500px"
        bg="white"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        _hover={{
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-4px)",
        }}
        transition="all 0.3s ease"
        position="relative"
      >
        {pictures && (
          <Box
            position="relative"
            w="100%"
            h="200px"
            overflow="hidden"
          >
            <Image
              src={
                pictures
                  ? (typeof pictures === 'string' && (pictures.startsWith('http://') || pictures.startsWith('https://'))
                      ? pictures
                      : "data:image/png;base64," + pictures)
                  : "/imagenes/img1.jpeg"
              }
              alt={title}
              w="100%"
              h="100%"
              objectFit="cover"
            />
            {/* Badge de estado */}
            <Badge
              position="absolute"
              top={3}
              right={3}
              colorScheme={
                updateEventStatus.status === "approved" ? "green" :
                updateEventStatus.status === "rejected" ? "red" : "orange"
              }
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="600"
              textTransform="uppercase"
            >
              {updateEventStatus.status === "approved" ? "Aprobado" :
               updateEventStatus.status === "rejected" ? "Rechazado" : "Pendiente"}
            </Badge>
          </Box>
        )}
        {isLoading ? (
          <Flex w="100%" align="center" justify="center" h="300px">
            <Image src="/assets/img/loading.svg" />
          </Flex>
        ) : (
          <Flex
            flexDir="column"
            align="stretch"
            flex="1"
            p={5}
            gap={3}
          >
            <Heading
              as="h2"
              fontSize={
                title.length > 40 ? "lg" : title.length > 30 ? "xl" : "2xl"
              }
              fontFamily="secondary"
              fontWeight="600"
              color="gray.800"
              lineHeight="1.2"
              noOfLines={2}
              mb={1}
            >
              {title}
            </Heading>


            <VStack spacing={3} align="stretch" mt="auto">
              <Button
                bg="black"
                borderRadius="lg"
                color="white"
                _hover={{ bg: "gray.800", transform: "translateY(-2px)" }}
                _active={{ bg: "gray.800" }}
                fontFamily="secondary"
                fontWeight="500"
                size="md"
                onClick={() => navigate(`/admin/events/${id}`)}
                transition="all 0.2s"
              >
                Detalles del evento
              </Button>

              {/* Botón de Tickets de Cortesía - Solo para eventos aprobados */}
              {updateEventStatus.status === "approved" && (
                <Button
                  bgGradient="linear(to-r, purple.500, purple.600)"
                  borderRadius="lg"
                  color="white"
                  _hover={{ 
                    bgGradient: "linear(to-r, purple.600, purple.700)",
                    transform: "translateY(-2px)",
                    boxShadow: "md"
                  }}
                  _active={{ bgGradient: "linear(to-r, purple.600, purple.700)" }}
                  fontFamily="secondary"
                  fontWeight="500"
                  size="md"
                  leftIcon={<FiGift />}
                  onClick={async () => {
                    try {
                      // Cargar los detalles completos del evento con tickets y fechas
                      const response = await eventApi.getEventById(id);
                      setEventDetails(response.data.event);
                      setIsCourtesyTicketModalOpen(true);
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "No se pudieron cargar los detalles del evento",
                        status: "error",
                        duration: 3000,
                      });
                    }
                  }}
                  transition="all 0.2s"
                >
                  Tickets de Cortesía
                </Button>
              )}

              {/* Botones de Aprobar/Rechazar según el status */}
              {updateEventStatus.status === "pending" && (
                <>
                  <Button
                    colorScheme="green"
                    borderRadius="lg"
                    onClick={() => handleApproveEvent(id)}
                    isLoading={isLoading}
                    fontFamily="secondary"
                    fontWeight="500"
                    size="md"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  >
                    Aprobar
                  </Button>
                  <Button
                    colorScheme="orange"
                    borderRadius="lg"
                    onClick={() => handleRejectEvent(id)}
                    isLoading={isLoading}
                    fontFamily="secondary"
                    fontWeight="500"
                    size="md"
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                  >
                    Rechazar
                  </Button>
                </>
              )}

              {updateEventStatus.status === "approved" && (
                <Button
                  colorScheme="orange"
                  borderRadius="lg"
                  onClick={() => handleRejectEvent(id)}
                  isLoading={isLoading}
                  fontFamily="secondary"
                  fontWeight="500"
                  size="md"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                >
                  Rechazar
                </Button>
              )}

              {updateEventStatus.status === "rejected" && (
                <Button
                  colorScheme="green"
                  borderRadius="lg"
                  onClick={() => handleApproveEvent(id)}
                  isLoading={isLoading}
                  fontFamily="secondary"
                  fontWeight="500"
                  size="md"
                  transition="all 0.2s"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                >
                  Aprobar
                </Button>
              )}

              <Button
                colorScheme="red"
                borderRadius="lg"
                onClick={() => setIsDeleteAlertOpen(true)}
                fontFamily="secondary"
                fontWeight="500"
                size="md"
                transition="all 0.2s"
                _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
              >
                Eliminar
              </Button>
            </VStack>
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

      {/* Modal de Tickets de Cortesía */}
      {eventDetails && (
        <CourtesyTicketModal
          isOpen={isCourtesyTicketModalOpen}
          onClose={() => {
            setIsCourtesyTicketModalOpen(false);
            setEventDetails(null);
          }}
          event={eventDetails}
        />
      )}
    </>
  );
};

export default AdminEventCard;
