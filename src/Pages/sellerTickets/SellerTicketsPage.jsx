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
  Center,
  Spinner,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import SellerSidebar from "../../components/sellerSideBar/sellerSideBar";
import TicketCard from "../ticketsAdmin/components/TicketCard";
import CreateTicketModal from "../ticketsAdmin/components/CreateTicketModal";
import EditTicketModal from "../ticketsAdmin/components/EditTicketModal";
import eventApi from "../../Api/event";

const SellerTicketsPage = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

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
    setIsLoadingEvents(true);
    try {
      const { data } = await eventApi.getUserEvents(page, 100); // Get all events
      setEvents(data.events || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error al cargar eventos",
        description: error.message || "No se pudieron cargar los eventos",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchTickets = async (eventId) => {
    if (!eventId) {
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
      const ticketsArray = Array.isArray(responseData.tickets)
        ? responseData.tickets
        : [];
      setTickets(ticketsArray);
    } catch (error) {
      console.error("Error fetching tickets:", error);
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

  const handleCreateTicket = async (ticketData) => {
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
      console.error("Error creating ticket:", error);
      toast({
        title: "Error al crear ticket",
        description: error.message || "Ocurrió un error al crear el ticket",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleEditTicket = async (ticketId, ticketData) => {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update ticket");
      }

      // Recargar tickets del evento
      if (selectedEvent) {
        await fetchTickets(selectedEvent);
      }

      onEditClose();
      setSelectedTicket(null);
      toast({
        title: "Ticket actualizado",
        description: "El ticket se actualizó correctamente",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error al actualizar ticket",
        description: error.message || "Ocurrió un error al actualizar el ticket",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este ticket?")) {
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

        setTickets((current) =>
          current.filter((ticket) => ticket._id !== ticketId)
        );
        toast({
          title: "Ticket eliminado",
          status: "success",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error deleting ticket:", error);
        toast({
          title: "Error al eliminar ticket",
          description: error.message,
          status: "error",
          duration: 3000,
        });
      }
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    setTickets([]);
  };

  useEffect(() => {
    fetchEvents();
  }, [page]);

  // Set selected event from URL parameter when events are loaded
  useEffect(() => {
    const eventIdFromUrl = searchParams.get("eventId");
    if (eventIdFromUrl && events.length > 0 && !selectedEvent) {
      // Verify that the event exists in the user's events
      const eventExists = events.some(event => event._id === eventIdFromUrl);
      if (eventExists) {
        setSelectedEvent(eventIdFromUrl);
      }
    }
  }, [events, searchParams]);

  useEffect(() => {
    if (selectedEvent) {
      fetchTickets(selectedEvent);
    }
  }, [selectedEvent]);

  const renderTickets = () => {
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
      return (
        <Flex justify="center" align="center" h="200px">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="primary"
            size="xl"
          />
        </Flex>
      );
    }

    if (!Array.isArray(tickets)) {
      return (
        <Text textAlign="center" fontSize="lg" mt="10">
          Error: formato de tickets inválido
        </Text>
      );
    }

    if (tickets.length === 0) {
      return (
        <Text textAlign="center" fontSize="lg" mt="10" color="gray.500">
          No hay tickets creados para este evento
        </Text>
      );
    }

    return (
      <Grid
        templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        gap={6}
        w="100%"
        my="10"
      >
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket._id}
            ticket={ticket}
            onEdit={() => {
              setSelectedTicket(ticket);
              onEditOpen();
            }}
            onDelete={() => handleDeleteTicket(ticket._id)}
          />
        ))}
      </Grid>
    );
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      <SellerSidebar />
      <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
        <Header />
        <Box
          as="main"
          minH="calc(100vh - 80px)"
          pb={20}
          bg="white"
        >
          <Container 
            maxW="full" 
            px={{ base: 4, md: 8 }} 
            py={8}
          >
            <Heading 
              as="h1" 
              fontFamily="secondary" 
              color="tertiary" 
              fontSize="2xl"
              fontWeight="bold"
              mb={8}
            >
              Gestionar Tickets
            </Heading>

            <Flex
              justify="space-between"
              align="center"
              mb={8}
              flexWrap="wrap" 
              gap={4}
            >
              <Select
                placeholder="Seleccionar evento"
                value={selectedEvent}
                onChange={(e) => handleEventChange(e.target.value)}
                maxW="400px"
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
              >
                Crear Nuevo Ticket
              </Button>
            </Flex>

            {isLoadingEvents && (
              <Center py={10}>
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="primary"
                  size="xl"
                />
              </Center>
            )}

            {!isLoadingEvents && events.length === 0 && (
              <Box
                p={8}
                bg="gray.50"
                borderRadius="lg"
                textAlign="center"
              >
                <Text fontSize="lg" color="gray.600" fontFamily="secondary">
                  No tienes eventos creados aún.
                </Text>
                <Text fontSize="sm" color="gray.500" mt={2} fontFamily="secondary">
                  Crea un evento primero para poder gestionar sus tickets.
                </Text>
              </Box>
            )}

            {!isLoadingEvents && events.length > 0 && renderTickets()}

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
        </Box>
        
        <Footer />
      </Box>
    </Flex>
  );
};

export default SellerTicketsPage;




