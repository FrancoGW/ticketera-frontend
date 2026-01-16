import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Flex,
  Button,
  Text,
  Select,
  useToast,
  Heading,
  useDisclosure,
} from "@chakra-ui/react";
import TicketCard from "./components/TicketCard";
import CreateTicketModal from "./components/CreateTicketModal";
import EditTicketModal from "./components/EditTicketModal";
import ConfirmDialog from "../../components/confirmDialog/ConfirmDialog";
import useConfirmDialog from "../../hooks/useConfirmDialog";
import eventApi from "../../Api/event";
import VenueMapEditor from "../../components/venueMap/VenueMapEditor";

const TicketsPage = () => {
  console.log("🚀 TicketsPage - Component initialized");

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [tickets, setTickets] = useState([]);
  const [venueMap, setVenueMap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const toast = useToast();
  const confirmDialog = useConfirmDialog();

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const fetchEvents = async () => {
    console.log("📞 fetchEvents - Starting fetch");
    setIsLoadingEvents(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/events/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      console.log("📦 fetchEvents - Response data:", data);
      setEvents(data.events || []);
    } catch (error) {
      console.error("❌ fetchEvents - Error:", error);
      toast({
        title: "Error al cargar eventos",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchTickets = async (eventId) => {
    console.log("📞 fetchTickets - Starting fetch for eventId:", eventId);

    if (!eventId) {
      console.log("⚠️ fetchTickets - No eventId provided, resetting tickets");
      setTickets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tickets/event/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const responseData = await response.json();
      console.log("📦 fetchTickets - Raw response data:", responseData);
      console.log("🎫 fetchTickets - Tickets array:", responseData.tickets);
      console.log(
        "📊 fetchTickets - Tickets array length:",
        responseData.tickets?.length
      );

      // Important fix: Ensure we're setting an array
      const ticketsArray = Array.isArray(responseData.tickets)
        ? responseData.tickets
        : [];
      console.log("🔄 fetchTickets - Processed tickets array:", ticketsArray);

      setTickets(ticketsArray);
    } catch (error) {
      console.error("❌ fetchTickets - Error:", error);
      setTickets([]);
      toast({
        title: "Error al cargar tickets",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  //asdasd

  const handleCreateTicket = async (ticketData) => {
    console.log("📝 handleCreateTicket - Starting with data:", ticketData);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...ticketData, eventRef: selectedEvent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create ticket");
      }

      const responseData = await response.json();
      console.log("✅ handleCreateTicket - Success:", responseData);

      // Recargar tickets del evento
      if (selectedEvent) {
        await fetchTickets(selectedEvent);
      }

      onCreateClose();
      toast({
        title: "Ticket creado",
        description: "El ticket se creó correctamente",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("❌ handleCreateTicket - Error:", error);
      toast({
        title: "Error al crear ticket",
        description: error.message || "Ocurrió un error al crear el ticket",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditTicket = async (ticketId, ticketData) => {
    console.log(
      "✏️ handleEditTicket - Starting with id:",
      ticketId,
      "data:",
      ticketData
    );
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/tickets/${ticketId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(ticketData),
        }
      );

      if (!response.ok) throw new Error("Failed to update ticket");

      const updatedTicket = await response.json();
      console.log("✅ handleEditTicket - Success:", updatedTicket);

      setTickets((current) =>
        current.map((ticket) =>
          ticket._id === ticketId ? updatedTicket : ticket
        )
      );
      onEditClose();
      setSelectedTicket(null);
      toast({
        title: "Ticket actualizado",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("❌ handleEditTicket - Error:", error);
      toast({
        title: "Error al actualizar ticket",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    console.log("🗑️ handleDeleteTicket - Starting with id:", ticketId);
    confirmDialog.openDialog({
      title: "Eliminar ticket",
      message: "¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/tickets/${ticketId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to delete ticket");

          console.log("✅ handleDeleteTicket - Success");
          setTickets((current) =>
            current.filter((ticket) => ticket._id !== ticketId)
          );
          toast({
            title: "Ticket eliminado",
            status: "success",
            duration: 3000,
          });
        } catch (error) {
          console.error("❌ handleDeleteTicket - Error:", error);
          toast({
            title: "Error al eliminar ticket",
            description: error.message,
            status: "error",
            duration: 3000,
          });
        }
      },
    });
  };

  const handleEventChange = (eventId) => {
    console.log("🔄 handleEventChange - New eventId:", eventId);
    setSelectedEvent(eventId);
    setTickets([]); // Reset tickets when changing event
  };

  useEffect(() => {
    console.log("🔄 Initial useEffect - Fetching events");
    fetchEvents();
  }, []);

  useEffect(() => {
    console.log("🔄 selectedEvent useEffect - Current event:", selectedEvent);
    if (selectedEvent) {
      fetchTickets(selectedEvent);
    }
  }, [selectedEvent]);

  useEffect(() => {
    const loadVenueMap = async () => {
      if (!selectedEvent) {
        setVenueMap(null);
        return;
      }
      try {
        const { data } = await eventApi.getEventById(selectedEvent);
        setVenueMap(data?.event?.venueMap || null);
      } catch {
        setVenueMap(null);
      }
    };
    loadVenueMap();
  }, [selectedEvent]);

  const handleSaveVenueMap = async (newVenueMap) => {
    await eventApi.updateVenueMap(selectedEvent, newVenueMap);
    const { data } = await eventApi.getEventById(selectedEvent);
    setVenueMap(data?.event?.venueMap || null);
  };

  useEffect(() => {
    console.log("📊 Tickets state updated:", {
      isArray: Array.isArray(tickets),
      length: tickets.length,
      content: tickets,
    });
  }, [tickets]);

  const renderTickets = () => {
    console.log("🎨 renderTickets - Starting render with:", {
      isLoading,
      ticketsLength: tickets.length,
      isArray: Array.isArray(tickets),
      selectedEvent,
    });

    if (!selectedEvent) {
      return (
        <Flex justify="center" align="center" h="200px">
          <Text fontSize="lg" color="gray.500">
            Selecciona un evento para ver sus tickets
          </Text>
        </Flex>
      );
    }

    if (isLoading) {
      console.log("⏳ renderTickets - Showing loading state");
      return (
        <Flex justify="center" align="center" h="200px">
          <Text>Cargando tickets...</Text>
        </Flex>
      );
    }

    if (!Array.isArray(tickets)) {
      console.error("❌ renderTickets - Tickets is not an array:", tickets);
      return (
        <Text textAlign="center" fontSize="lg" mt="10">
          Error: formato de tickets inválido
        </Text>
      );
    }

    if (tickets.length === 0) {
      console.log("ℹ️ renderTickets - No tickets found");
      return (
        <Text textAlign="center" fontSize="lg" mt="10">
          No hay tickets creados para este evento
        </Text>
      );
    }

    console.log(
      "✅ renderTickets - Rendering ticket grid with",
      tickets.length,
      "tickets"
    );
    return (
            <Grid
              templateColumns={{ base: "1fr", sm: "repeat(auto-fill, minmax(300px, 1fr))" }}
              gap={6}
              w="100%"
              my="10"
            >
        {tickets.map((ticket) => {
          console.log("🎫 Rendering ticket:", ticket);
          return (
            <TicketCard
              key={ticket._id}
              ticket={ticket}
              onEdit={() => {
                setSelectedTicket(ticket);
                onEditOpen();
              }}
              onDelete={() => handleDeleteTicket(ticket._id)}
            />
          );
        })}
      </Grid>
    );
  };

  console.log("🔄 TicketsPage - Rendering with state:", {
    eventsCount: events.length,
    selectedEvent,
    ticketsCount: tickets.length,
    isLoading,
  });

  return (
    <>
      <Container 
        maxW="full" 
        px={{ base: 4, md: 8 }} 
        py={8}
      >
            <Heading 
              as="h1" 
              fontFamily="secondary" 
              color="tertiary" 
              mb={8}
              fontSize="2xl"
              fontWeight="bold"
            >
              Gestión de Tickets
            </Heading>

            <Flex 
              mb={8} 
              justify="space-between" 
              align={{ base: "flex-start", sm: "center" }} 
              flexWrap="wrap" 
              gap={4}
              direction={{ base: "column", sm: "row" }}
            >
              <Select
                placeholder="Seleccionar evento"
                value={selectedEvent}
                onChange={(e) => handleEventChange(e.target.value)}
                maxW={{ base: "100%", sm: "400px" }}
                w={{ base: "100%", sm: "auto" }}
                isDisabled={isLoadingEvents}
                size="lg"
                borderColor="gray.200"
                borderWidth="2px"
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "primary", 
                  boxShadow: "0 0 0 3px rgba(0,0,0,0.1)" 
                }}
                borderRadius="lg"
              >
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title}
                  </option>
                ))}
              </Select>

              <Button
                bg="primary"
                color="white"
                _hover={{ 
                  bg: "buttonHover",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                onClick={onCreateOpen}
                isDisabled={!selectedEvent}
                fontFamily="secondary"
                fontWeight="500"
                px={6}
                py={6}
                borderRadius="lg"
                transition="all 0.2s"
                w={{ base: "100%", sm: "auto" }}
              >
                Crear Nuevo Ticket
              </Button>
            </Flex>

            {renderTickets()}

            {selectedEvent && (
              <Box mt={10}>
                <VenueMapEditor
                  eventId={selectedEvent}
                  tickets={tickets}
                  initialVenueMap={venueMap}
                  onSaveVenueMap={handleSaveVenueMap}
                />
              </Box>
            )}

            <CreateTicketModal
              isOpen={isCreateOpen}
              onClose={onCreateClose}
              onCreate={handleCreateTicket}
              eventId={selectedEvent}
            />

            <EditTicketModal
              isOpen={isEditOpen}
              onClose={() => {
                onEditClose();
                setSelectedTicket(null);
              }}
              onEdit={handleEditTicket}
              ticket={selectedTicket}
            />
      </Container>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmColor={confirmDialog.confirmColor}
      />
    </>
  );
};

export default TicketsPage;
