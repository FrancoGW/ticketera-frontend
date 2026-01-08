import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
  StackDivider,
  Text,
  Heading,
  useToast,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Select,
  Switch
} from "@chakra-ui/react";
import { useEffect } from "react";
import eventApi from "../../Api/event";
import { useState } from "react";
import ticketApi from "../../Api/ticket";
import { DeleteIcon, EditIcon, AddIcon } from "@chakra-ui/icons";
import { getObjDate, isDateIncluded } from "../../common/utils";
import { useNavigate } from "react-router";

const initialTicketData = {
  title: "",
  price: "",
  dates: [],
  maxEntries: null,
  defaultConfiguration: {
    type: "GENERAL",
    isNumbered: false,
    discountType: "NONE",
    generateServiceFee: true
  }
};

const initialBatchData = {
  name: "",
  price: "",
  maxEntries: "",
  startDate: "",
  endDate: "",
};

const getEventIdFromQuery = () => {
  const query = new URLSearchParams(window.location.search);
  return query.get("eventId");
};

function CreateTicket() {
  const [event, setEvent] = useState({});
  const [tickets, setTickets] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [ticketData, setTicketData] = useState(initialTicketData);
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [batchData, setBatchData] = useState(initialBatchData);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const getEventInfo = async () => {
      const { data } = await eventApi.getEventById(getEventIdFromQuery());
      setEvent(data.event);
      setTickets(data.event.tickets);

      if (data.event.tickets?.length > 0) {
        data.event.tickets.forEach((ticket) => {
          loadBatches(ticket._id);
        });
      }
    };
    getEventInfo();
  }, []);

  const loadBatches = async (ticketId) => {
    try {
      const { data } = await ticketApi.getBatches(ticketId);
      setBatches((prevBatches) => {
        const filteredBatches = prevBatches.filter(
          (batch) => batch.ticketRef !== ticketId
        );
        return [...filteredBatches, ...data.batches];
      });
    } catch (error) {
      console.error("Error loading batches:", error);
    }
  };

  const createTicket = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (ticketData.dates?.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos una fecha",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    const ticket = {
      ...ticketData,
      eventRef: getEventIdFromQuery(),
    };

    try {
      const { data } = await ticketApi.createTicket(ticket);
      setTickets([...tickets, data.ticket]);
      setTicketData(initialTicketData);
      toast({
        title: "Éxito",
        description: "Ticket creado correctamente",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "No se pudo crear el ticket",
        status: "error",
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validación de fechas
    const now = new Date();
    const startDate = new Date(batchData.startDate);
    const endDate = new Date(batchData.endDate);

    if (startDate < now) {
      toast({
        title: "Error",
        description:
          "La fecha de inicio no puede ser anterior a la fecha actual",
        status: "error",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    if (endDate < startDate) {
      toast({
        title: "Error",
        description:
          "La fecha de fin no puede ser anterior a la fecha de inicio",
        status: "error",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    try {
      await ticketApi.createBatch({
        ...batchData,
        ticketRef: selectedTicketId,
      });

      toast({
        title: "Éxito",
        description: "Lote creado correctamente",
        status: "success",
        duration: 3000,
      });

      loadBatches(selectedTicketId);
      setIsBatchModalOpen(false);
      setBatchData(initialBatchData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el lote",
        status: "error",
        duration: 3000,
      });
    }

    setIsLoading(false);
  };

  const editTicket = (ticket) => {
    setTicketData({
      _id: ticket._id,
      title: ticket.title,
      price: ticket.price,
      dates: ticket.dates,
      maxEntries: ticket.maxEntries,
    });
    setEditMode(true);
  };

  const cancelEdit = () => {
    setTicketData(initialTicketData);
    setEditMode(false);
  };

  const deleteTicket = async (ticket) => {
    try {
      await ticketApi.deleteTicket(ticket._id);
      const newTickets = tickets.filter((t) => t._id !== ticket._id);
      setTickets(newTickets);
      toast({
        title: "Éxito",
        description: "Ticket eliminado correctamente",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el ticket",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleCheckbox = (date) => {
    if (isDateIncluded(date, ticketData.dates)) {
      const newDates = ticketData.dates.filter((d) => {
        if (
          d.date === date.date &&
          d.timeStart === date.timeStart &&
          d.timeEnd === date.timeEnd
        ) {
          return false;
        }
        return true;
      });
      setTicketData({
        ...ticketData,
        dates: newDates,
      });
    } else {
      setTicketData({
        ...ticketData,
        dates: [...ticketData.dates, date],
      });
    }
  };

  const updateTicket = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (ticketData.dates?.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos una fecha",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    const dataToUpdate = {
      title: ticketData.title,
      price: ticketData.price,
      dates: ticketData.dates,
      maxEntries: ticketData.maxEntries,
    };

    try {
      const { data } = await ticketApi.updateTicket(
        ticketData._id,
        dataToUpdate
      );
      const newTickets = tickets.map((t) => {
        if (t._id === data.updatedTicket._id) {
          return data.updatedTicket;
        }
        return t;
      });
      setTickets(newTickets);
      setTicketData(initialTicketData);
      setEditMode(false);
      toast({
        title: "Éxito",
        description: "Ticket actualizado correctamente",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el ticket",
        status: "error",
        duration: 3000,
      });
    }
    setIsLoading(false);
  };

  const handleActivateBatch = async (batchId) => {
    try {
      await ticketApi.activateBatch(batchId);
      toast({
        title: "Éxito",
        description: "Lote activado correctamente",
        status: "success",
        duration: 3000,
      });
      loadBatches(selectedTicketId);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo activar el lote",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeactivateBatch = async (batchId) => {
    try {
      await ticketApi.deactivateBatch(batchId);
      toast({
        title: "Éxito",
        description: "Lote desactivado correctamente",
        status: "success",
        duration: 3000,
      });
      loadBatches(selectedTicketId);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desactivar el lote",
        status: "error",
        duration: 3000,
      });
    }
  };
  // Añade estas funciones al inicio del componente
  const getCurrentDateTime = () => {
    const now = new Date();
    const argentinaOffset = -3;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const argentinaDate = new Date(utc + (3600000 * argentinaOffset));
    
    return {
      date: argentinaDate.toISOString().split('T')[0],
      time: argentinaDate.toTimeString().split(':').slice(0, 2).join(':')
    };
  };
  

  // Función para verificar si una fecha es anterior a la actual
  const isBeforeNow = (dateString) => {
    const now = new Date();
    const argentinaOffset = -3;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const argentinaDate = new Date(utc + 3600000 * argentinaOffset);
    const selectedDate = new Date(dateString);

    return selectedDate < argentinaDate;
  };
  return (
    <>
      <Header />
      <Container
        style={{ paddingBottom: 50, paddingTop: 20 }}
        maxW="7xl"
        minH="70vh"
      >
        {event.status !== "approved" && tickets.length === 0 && (
          <Alert
            status="warning"
            w={{ base: "100%", md: "75%" }}
            style={{ margin: "0 auto", marginBottom: 32 }}
          >
            <AlertIcon />
            Para que tu evento pueda ser revisado y aprobado por el
            administrador, debes agregar al menos un ticket.
          </Alert>
        )}
        {event.status === "approved" && tickets.length === 0 && (
          <Alert
            status="warning"
            w={{ base: "100%", md: "75%" }}
            style={{ margin: "0 auto", marginBottom: 32 }}
          >
            <AlertIcon />
            Los eventos que no posean tickets no serán visibles en el sitio.
          </Alert>
        )}

<Flex
          justifyContent="space-around"
          my="6"
          flexDir={{ base: "column", md: "row" }}
          gap="16"
          px={{ base: "5", md: "0" }}
        >
          <Box>
            <Heading as="h2" fontFamily="secondary" color="tertiary">
              Crear un ticket
            </Heading>
            <form
              onSubmit={(e) => (editMode ? updateTicket(e) : createTicket(e))}
              style={{ width: "100%" }}
              className="contentForm"
            >
              <FormControl mt="6" id="ticket-title" isRequired>
                <FormLabel>Título del ticket</FormLabel>
                <Input
                  name="ticket-title"
                  onChange={(e) =>
                    setTicketData({ ...ticketData, title: e.target.value })
                  }
                  value={ticketData.title}
                />
              </FormControl>

              <FormControl id="ticket-price" isRequired>
                <FormLabel>Precio del ticket</FormLabel>
                <Input
                  name="ticket-price"
                  type="number"
                  onChange={(e) =>
                    setTicketData({ ...ticketData, price: e.target.value })
                  }
                  value={ticketData.price}
                />
              </FormControl>

              <FormControl id="ticket-type" isRequired>
                <FormLabel>Tipo de Ticket</FormLabel>
                <Select
                  value={ticketData.defaultConfiguration.type}
                  onChange={(e) => setTicketData({
                    ...ticketData,
                    defaultConfiguration: {
                      ...ticketData.defaultConfiguration,
                      type: e.target.value
                    }
                  })}
                >
                  <option value="GENERAL">General</option>
                  <option value="VIP">VIP</option>
                </Select>
              </FormControl>

              <FormControl id="ticket-numbered">
                <FormLabel>Ticket Numerado</FormLabel>
                <Switch
                  isChecked={ticketData.defaultConfiguration.isNumbered}
                  onChange={(e) => setTicketData({
                    ...ticketData,
                    defaultConfiguration: {
                      ...ticketData.defaultConfiguration,
                      isNumbered: e.target.checked
                    }
                  })}
                />
              </FormControl>

              <FormControl id="ticket-discount" isRequired>
  <FormLabel>Tipo de Descuento</FormLabel>
  <Select
    value={ticketData.defaultConfiguration.discountType}
    onChange={(e) => setTicketData({
      ...ticketData,
      defaultConfiguration: {
        ...ticketData.defaultConfiguration,
        discountType: e.target.value
      }
    })}
  >
    <option value="NONE">Sin descuento</option>
    <option value="PERCENTAGE">Porcentaje</option>
    <option value="VALUE">Monto fijo</option>
  </Select>
</FormControl>
              <FormControl id="ticket-service-fee">
                <FormLabel>Generar Cargo por Servicio</FormLabel>
                <Switch
                  isChecked={ticketData.defaultConfiguration.generateServiceFee}
                  onChange={(e) => setTicketData({
                    ...ticketData,
                    defaultConfiguration: {
                      ...ticketData.defaultConfiguration,
                      generateServiceFee: e.target.checked
                    }
                  })}
                />
              </FormControl>

              <FormControl id="ticket-max-quantity">
                <FormLabel>Cantidad máxima de entradas</FormLabel>
                <Input
                  name="ticket-max-quantity"
                  type="number"
                  onChange={(e) =>
                    setTicketData({ ...ticketData, maxEntries: e.target.value })
                  }
                  value={ticketData.maxEntries}
                />
              </FormControl>

              <FormControl id="ticket-start-date" isRequired>
                <FormLabel>
                  Selecciona una o varias fechas a asignar al ticket
                </FormLabel>
                <Stack>
                  {event.dates?.map((date, index) => {
                    const objDate = getObjDate(date);
                    return (
                      <Checkbox
                        key={index}
                        colorScheme="purple"
                        onChange={() => handleCheckbox(objDate)}
                        isChecked={isDateIncluded(objDate, ticketData.dates)}
                        isRequired={false}
                      >
                        {objDate.date} - Inicio: {objDate.timeStart}. Fin:{" "}
                        {objDate.timeEnd}
                      </Checkbox>
                    );
                  })}
                </Stack>
              </FormControl>

              {editMode ? (
                <Flex justifyContent="space-between">
                  <Button
                    type="submit"
                    colorScheme="purple"
                    className="btn crear"
                    variant="solid"
                    size="md"
                    onSubmit={(e) => updateTicket(e)}
                    isLoading={isLoading}
                  >
                    Confirmar cambios
                  </Button>
                  <Button
                    colorScheme="red"
                    variant="solid"
                    size="md"
                    onClick={cancelEdit}
                  >
                    Cancelar
                  </Button>
                </Flex>
              ) : (
                <Button
                  type="submit"
                  bg="primary"
                  borderRadius="5px"
                  color="#fff"
                  _hover={{ bg: "buttonHover" }}
                  _active={{ bg: "buttonHover" }}
                  fontWeight="normal"
                  fontFamily="secondary"
                  isLoading={isLoading}
                >
                  Crear Ticket
                </Button>
              )}
            </form>

            <Flex
              style={{
                alignItems: "stretch",
                flexDirection: "column",
                marginTop: 10,
              }}
            >
              <Button
                type="submit"
                colorScheme="green"
                variant="solid"
                size="md"
                disabled={tickets.length === 0}
                onClick={() => navigate("/profile/my-events")}
              >
                Finalizar
              </Button>
            </Flex>
          </Box>

          <Box maxHeight="800px">
            <Card>
              <CardHeader>
                <Heading as="h2" fontFamily="secondary" color="tertiary">
                  Tickets del evento
                </Heading>
              </CardHeader>

              <CardBody style={{ maxHeight: 500, overflow: "auto" }}>
                <Stack divider={<StackDivider />} spacing="4">
                  {tickets.length === 0 && (
                    <Text fontSize="sm" color="gray.500">
                      No hay tickets creados
                    </Text>
                  )}
                  {tickets.map((ticket, index) => (
                    <Box key={index}>
                      <Flex justifyContent="space-between">
                        <Box>
                          <Heading size="xs" textTransform="uppercase">
                            {ticket.title}
                          </Heading>
                        </Box>
                        <Box>
                          <Button
                            leftIcon={<AddIcon />}
                            size="sm"
                            colorScheme="blue"
                            mr={2}
                            onClick={() => {
                              setSelectedTicketId(ticket._id);
                              setIsBatchModalOpen(true);
                            }}
                          >
                            Crear Lote
                          </Button>
                          <EditIcon
                            style={{ marginRight: 10, cursor: "pointer" }}
                            onClick={() => editTicket(ticket)}
                          />
                          <DeleteIcon
                            color="red.400"
                            cursor="pointer"
                            onClick={() => deleteTicket(ticket)}
                          />
                        </Box>
                      </Flex>
                      <Text pt="2" fontSize="sm">
                        Precio: ${ticket.price}
                      </Text>
                      <Text pt="2" fontSize="sm" mb="2">
                        Cant. máxima: {ticket.maxEntries}
                      </Text>
                      <Accordion allowMultiple>
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                Fechas asignadas al ticket
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            {ticket.dates.map((date, index) => (
                              <Text key={index} pt="2" fontSize="sm">
                                {date.date} - Inicio: {date.timeStart}. Fin:{" "}
                                {date.timeEnd}
                              </Text>
                            ))}
                          </AccordionPanel>
                        </AccordionItem>

                        {/* Sección de Lotes */}
                        <AccordionItem>
                          <h2>
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                Lotes del Ticket
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                          </h2>
                          <AccordionPanel pb={4}>
                            {batches
                              .filter((batch) => batch.ticketRef === ticket._id)
                              .map((batch, idx) => (
                                <Box
                                  key={idx}
                                  p={3}
                                  borderWidth="1px"
                                  borderRadius="lg"
                                  mb={2}
                                  backgroundColor="gray.50"
                                >
                                  <Flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <Heading size="xs">{batch.name}</Heading>
                                    <Badge
                                      colorScheme={
                                        batch.isActive ? "green" : "gray"
                                      }
                                    >
                                      {batch.isActive ? "Activo" : "Inactivo"}
                                    </Badge>
                                  </Flex>
                                  <Text fontSize="sm" mt={2}>
                                    Precio: ${batch.price}
                                  </Text>
                                  <Text fontSize="sm">
                                    Tickets disponibles: {batch.maxEntries}
                                  </Text>
                                  <Text fontSize="sm">
                                    Válido desde:{" "}
                                    {new Date(batch.startDate).toLocaleString()}
                                  </Text>
                                  <Text fontSize="sm" mb={2}>
                                    Hasta:{" "}
                                    {new Date(batch.endDate).toLocaleString()}
                                  </Text>
                                  {!batch.isActive && (
                                    <Button
                                      size="sm"
                                      colorScheme="green"
                                      onClick={() =>
                                        handleActivateBatch(batch._id)
                                      }
                                      width="100%"
                                    >
                                      Activar Lote
                                    </Button>
                                  )}
                                </Box>
                              ))}
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Box>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </Box>
        </Flex>
      </Container>

      {/* Modal para crear lotes */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Crear Nuevo Lote</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleCreateBatch}>
            <ModalBody>
              <FormControl isRequired mb={4}>
                <FormLabel>Nombre del Lote</FormLabel>
                <Input
                  placeholder="ej: Early Bird"
                  value={batchData.name}
                  onChange={(e) =>
                    setBatchData({ ...batchData, name: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Precio</FormLabel>
                <Input
                  type="number"
                  placeholder="Precio del lote"
                  value={batchData.price}
                  onChange={(e) =>
                    setBatchData({ ...batchData, price: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Cantidad de Tickets</FormLabel>
                <Input
                  type="number"
                  placeholder="Cantidad máxima de tickets"
                  value={batchData.maxEntries}
                  onChange={(e) =>
                    setBatchData({ ...batchData, maxEntries: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Fecha de Inicio</FormLabel>
                <Input
    type="date"
    value={batchData.startDate?.split('T')[0] || ''}
    min={getCurrentDateTime().date}
    onChange={(e) => {
      const currentDate = getCurrentDateTime().date;
      const selectedDate = e.target.value;
      let currentTime = getCurrentDateTime().time;
      let selectedTime = batchData.startDate?.split('T')[1] || currentTime;

      // Si es hoy, asegurarse que la hora no sea anterior a la actual
      if (selectedDate === currentDate) {
        if (selectedTime < currentTime) {
          selectedTime = currentTime;
        }
      }

      setBatchData({
        ...batchData,
        startDate: `${selectedDate}T${selectedTime}`
      });
    }}
  />
              </FormControl>
              <FormControl isRequired mb={4}>
  <FormLabel>Hora de Inicio</FormLabel>
  <Input
    type="time"
    value={batchData.startDate?.split('T')[1] || ''}
    step="300"
    onChange={(e) => {
      const selectedDate = batchData.startDate?.split('T')[0] || getCurrentDateTime().date;
      const selectedTime = e.target.value;
      const currentDate = getCurrentDateTime().date;
      const currentTime = getCurrentDateTime().time;

      // Si es hoy y la hora seleccionada es anterior a la actual, usar la hora actual
      if (selectedDate === currentDate && selectedTime < currentTime) {
        toast({
          title: "Aviso",
          description: "No puedes seleccionar una hora anterior a la actual",
          status: "warning",
          duration: 3000,
        });
        setBatchData({
          ...batchData,
          startDate: `${selectedDate}T${currentTime}`
        });
      } else {
        setBatchData({
          ...batchData,
          startDate: `${selectedDate}T${selectedTime}`
        });
      }
    }}
  />
</FormControl>
<FormControl isRequired mb={4}>
  <FormLabel>Fecha de Fin</FormLabel>
  <Input
    type="date"
    value={batchData.endDate?.split('T')[0] || ''}
    min={batchData.startDate?.split('T')[0] || getCurrentDateTime().date}
    onChange={(e) => {
      const startDateTime = batchData.startDate || `${getCurrentDateTime().date}T${getCurrentDateTime().time}`;
      const selectedDate = e.target.value;
      let selectedTime = batchData.endDate?.split('T')[1] || batchData.startDate?.split('T')[1] || getCurrentDateTime().time;

      setBatchData({
        ...batchData,
        endDate: `${selectedDate}T${selectedTime}`
      });
    }}
  />
</FormControl>

<FormControl isRequired mb={4}>
  <FormLabel>Hora de Fin</FormLabel>
  <Input
    type="time"
    value={batchData.endDate?.split('T')[1] || ''}
    step="300"
    onChange={(e) => {
      const selectedDate = batchData.endDate?.split('T')[0] || batchData.startDate?.split('T')[0] || getCurrentDateTime().date;
      const selectedTime = e.target.value;
      const startDateTime = batchData.startDate || `${getCurrentDateTime().date}T${getCurrentDateTime().time}`;

      if (new Date(`${selectedDate}T${selectedTime}`) < new Date(startDateTime)) {
        toast({
          title: "Aviso",
          description: "La hora de fin debe ser posterior a la hora de inicio",
          status: "warning",
          duration: 3000,
        });
        setBatchData({
          ...batchData,
          endDate: startDateTime
        });
      } else {
        setBatchData({
          ...batchData,
          endDate: `${selectedDate}T${selectedTime}`
        });
      }
    }}
  />
</FormControl>
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                type="submit"
                isLoading={isLoading}
              >
                Crear Lote
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsBatchModalOpen(false)}
              >
                Cancelar
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Footer />
    </>
  );
}

export default CreateTicket;
