import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Flex,
  useToast,
  Text,
  Spinner
} from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Sidebar from "../../components/sideBar/sideBar";
import eventApi from "../../Api/event";

const CommissionPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingEventId, setUpdatingEventId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventApi.getEventsbyAdmin({ page: 1, limit: 100 });
      console.log('Full API response:', response);
      console.log('Response data:', response.data);
      console.log('Events array:', response.data.events);
      
      // Verificar que commissionPercentage esté presente
      const eventsWithCommission = await Promise.all(
        response.data.events.map(async (event) => {
          console.log(`Event ${event.title} - Raw event object:`, event);
          console.log(`Event ${event.title} - commissionPercentage:`, event.commissionPercentage);
          console.log(`Event ${event.title} - All keys:`, Object.keys(event));
          
          // Si el commissionPercentage no viene en la respuesta, intentar obtenerlo del evento completo
          if (event.commissionPercentage === undefined || event.commissionPercentage === null) {
            try {
              console.log(`Fetching full event data for ${event.title} (${event._id})`);
              const fullEventResponse = await eventApi.getEventById(event._id);
              const fullEvent = fullEventResponse.data?.event;
              console.log(`Full event data for ${event.title}:`, fullEvent);
              console.log(`Full event commissionPercentage:`, fullEvent?.commissionPercentage);
              
              return {
                ...event,
                commissionPercentage: fullEvent?.commissionPercentage !== undefined && fullEvent?.commissionPercentage !== null
                  ? Number(fullEvent.commissionPercentage) // Ya viene como decimal (0.2 = 20%)
                  : 0
              };
            } catch (error) {
              console.error(`Error fetching full event for ${event.title}:`, error);
              return {
                ...event,
                commissionPercentage: 0
              };
            }
          }
          
          return {
            ...event,
            commissionPercentage: event.commissionPercentage !== undefined && event.commissionPercentage !== null
              ? Number(event.commissionPercentage) // Ya viene como decimal (0.2 = 20%)
              : 0
          };
        })
      );
      
      console.log('Events with commission:', eventsWithCommission);
      setEvents(eventsWithCommission);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error al cargar eventos",
        description: "No se pudieron cargar los eventos. Por favor, intente nuevamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommissionChange = async (eventId, newCommission) => {
    if (newCommission < 0 || newCommission > 100) {
      toast({
        title: "Error",
        description: "La comisión debe estar entre 0 y 100%",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setUpdatingEventId(eventId);
      // Convertir el porcentaje ingresado (20) a decimal (0.2) para el backend
      const commissionDecimal = newCommission / 100;
      await eventApi.updateCommissionPercentage(eventId, commissionDecimal);
      
      // Recargar los eventos desde el servidor para asegurar que tenemos los datos actualizados
      await loadEvents();

      toast({
        title: "Comisión actualizada",
        description: `La comisión se ha actualizado a ${newCommission}%`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating commission:', error);
      toast({
        title: "Error al actualizar la comisión",
        description: error.response?.data?.message || "Ha ocurrido un error al actualizar la comisión",
        status: "error",
        duration: 3000,
      });
    } finally {
      setUpdatingEventId(null);
    }
  };

  if (isLoading) {
    return (
      <Flex minH="100vh" bg="gray.50">
        <Sidebar />
        <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
          <Header />
          <Flex justify="center" align="center" minH="calc(100vh - 80px)">
            <Spinner size="xl" />
          </Flex>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
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
              mb={8}
              fontSize="2xl"
              fontWeight="bold"
            >
              Gestión de Comisiones
            </Heading>

            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="md"
              border="1px solid"
              borderColor="gray.100"
              overflow="hidden"
            >
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th fontFamily="secondary" fontWeight="600">Evento</Th>
                    <Th fontFamily="secondary" fontWeight="600">Organizador</Th>
                    <Th fontFamily="secondary" fontWeight="600">Comisión Actual (%)</Th>
                    <Th fontFamily="secondary" fontWeight="600">Nueva Comisión (%)</Th>
                    <Th fontFamily="secondary" fontWeight="600">Acción</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {events.map((event) => (
                    <EventRow
                      key={event._id}
                      event={event}
                      onCommissionChange={handleCommissionChange}
                      isLoading={updatingEventId === event._id}
                    />
                  ))}
                </Tbody>
              </Table>
            </Box>

            {events.length === 0 && (
              <Flex 
                justify="center" 
                align="center" 
                py={20}
                flexDirection="column"
                gap={4}
              >
                <Text 
                  textAlign="center" 
                  fontSize="lg"
                  color="gray.500"
                  fontFamily="secondary"
                >
                  No hay eventos disponibles
                </Text>
              </Flex>
            )}
          </Container>
        </Box>
        
        <Footer />
      </Box>
    </Flex>
  );
};

const EventRow = ({ event, onCommissionChange, isLoading }) => {
  // Inicializar con el valor actual del commissionPercentage
  // IMPORTANTE: En el backend se guarda como decimal (0.2 = 20%, 0.15 = 15%)
  // Para mostrarlo como porcentaje, multiplicamos por 100
  const commissionDecimal = event.commissionPercentage !== undefined && event.commissionPercentage !== null 
    ? Number(event.commissionPercentage) 
    : 0;
  // Convertir a porcentaje para mostrar (0.2 -> 20, 0.15 -> 15)
  const currentCommission = commissionDecimal * 100;
  const [newCommission, setNewCommission] = useState('');

  // Log para debugging - verificar que el valor se está recibiendo correctamente
  React.useEffect(() => {
    console.log(`EventRow - Event: ${event.title}`, {
      commissionPercentage: event.commissionPercentage,
      type: typeof event.commissionPercentage,
      currentCommission: currentCommission,
      fullEvent: event
    });
  }, [event.commissionPercentage, currentCommission, event.title, event]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || (Number(value) >= 0 && Number(value) <= 100)) {
      setNewCommission(value);
    }
  };

  return (
    <Tr _hover={{ bg: "gray.50" }}>
      <Td fontFamily="secondary">{event.title}</Td>
      <Td fontFamily="secondary">{event.userEmail}</Td>
      <Td fontFamily="secondary" fontWeight="500">{currentCommission}%</Td>
      <Td>
        <Input
          type="number"
          value={newCommission}
          onChange={handleInputChange}
          placeholder={`Actual: ${currentCommission}%`}
          w="120px"
          min="0"
          max="100"
          borderColor="gray.200"
          _focus={{ 
            borderColor: "primary", 
            boxShadow: "0 0 0 1px primary" 
          }}
          borderRadius="lg"
        />
      </Td>
      <Td>
        <Button
          bg="primary"
          color="white"
          _hover={{ 
            bg: "buttonHover",
            transform: "translateY(-1px)",
            boxShadow: "md"
          }}
          isLoading={isLoading}
          onClick={() => {
            if (newCommission) {
              onCommissionChange(event._id, Number(newCommission));
              setNewCommission('');
            }
          }}
          isDisabled={!newCommission || isLoading}
          fontFamily="secondary"
          fontWeight="500"
          size="sm"
          borderRadius="lg"
          transition="all 0.2s"
        >
          Actualizar
        </Button>
      </Td>
    </Tr>
  );
};

export default CommissionPage;