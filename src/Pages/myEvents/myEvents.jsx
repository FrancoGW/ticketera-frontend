import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  Container,
  Flex,
  Heading,
  Link as ChakraLink,
  useToast,
  Center,
  Spinner,
  AlertTitle,
  AlertDescription,
  Box,
  Text,
  Grid,
} from "@chakra-ui/react";
import eventApi from "../../Api/event";
import TicketsDetails from "./components/TicketsDetails";
import EventsList from "./components/EventList";
import SetupChecklist from "./components/SetupChecklist";
import { qrApi } from "../../Api/qr";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { fetchUserProfile } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";

const eventsPerPage = 8;

function MyEvents() {
  const [userEvents, setUserEvents] = useState([]);
  const [eventDetails, setEventDetails] = useState("");
  const [scannerUrl, setScannerUrl] = useState("");
  const [urlLoading, setUrlLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  // const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { data: user, loading: userLoading } = useSelector(
    (state) => state.user
  );

  const getUserEvents = async () => {
    setIsLoading(true);
    try {
      setUserEvents([]);
      const { data } = await eventApi.getUserEvents(page, eventsPerPage);
      setUserEvents(data.events);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al obtener los eventos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    window.scrollTo(0, 0);
    setIsLoading(false);
  };

  useEffect(() => {
    const getScannerUrl = async () => {
      const { data } = await qrApi.getScannerUrl();
      setScannerUrl(data.validatorUrl);
    };
    getScannerUrl();
  }, []);

  useEffect(() => {
    getUserEvents();
  }, [page]);



  const copyUrl = () => {
    navigator.clipboard.writeText(scannerUrl);
    toast({
      title: "Enlace copiado",
      description: "El enlace se ha copiado al portapapeles",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const acceptModal = () => {
    closeModal();
  };


  useEffect(() => {
    if (!user ) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  const navigate = useNavigate();

  // Renderizar un loading state mientras se carga el usuario
  if (userLoading) {
    return (
      <Center minH="calc(100vh - 80px)" bg="white">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="primary"
          size="xl"
        />
      </Center>
    );
  }

  return (
    <>
      <Container 
        maxW="full" 
        px={{ base: 4, md: 8 }} 
        py={8}
      >
            <Flex 
              justify="space-between" 
              align={{ base: "flex-start", sm: "center" }} 
              mb={8}
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <Heading 
                as="h1" 
                fontFamily="secondary" 
                color="tertiary" 
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
              >
                Mis Eventos
              </Heading>
              <Button
                onClick={() => navigate('/seller/new-event')}
                bg="primary"
                color="white"
                _hover={{
                  bg: "buttonHover",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                transition="all 0.2s"
                fontFamily="secondary"
                fontWeight="500"
                px={6}
                py={6}
                borderRadius="lg"
                w={{ base: "100%", sm: "auto" }}
              >
                Crear Evento
              </Button>
            </Flex>

            {/* Checklist de Configuración - Mostrar siempre, no esperar carga completa */}
            {!isLoading && (
              <SetupChecklist
                user={user}
                userEvents={userEvents}
                hasMercadoPago={
                  user?.mercadoPagoConfigured ||
                  user?.hasMercadoPago === true ||
                  user?.mercadoPago?.hasAuthorized === true ||
                  user?.oauth?.mercadoPago?.hasAuthorized === true ||
                  false
                }
                isAdmin={user?.roles?.includes?.("admin") || user?.rol === "admin"}
              />
            )}

            <Flex 
              flexDir={{ base: "column", lg: "row" }} 
              gap={8}
            >
              {/* Sección de Eventos */}
              <Box flex={{ base: "1", lg: "1" }} minW={{ base: "100%", lg: "400px" }}>
                <Heading 
                  as="h2" 
                  fontSize="xl" 
                  fontFamily="secondary" 
                  color="tertiary" 
                  mb={6}
                  fontWeight="600"
                >
                  Tus Eventos
                </Heading>
                
                {isLoading && (
                  <Center py={20}>
                    <Spinner
                      thickness="4px"
                      speed="0.65s"
                      emptyColor="gray.200"
                      color="primary"
                      size="xl"
                    />
                  </Center>
                )}

                {userEvents.length === 0 && !isLoading && (
                  <Box
                    bg="gray.50"
                    borderRadius="lg"
                    p={8}
                    textAlign="center"
                  >
                    <Text 
                      fontSize="lg" 
                      color="gray.500" 
                      fontFamily="secondary"
                      mb={4}
                    >
                      No tienes eventos creados
                    </Text>
                    <Button
                      onClick={() => navigate('/seller/new-event')}
                      bg="primary"
                      color="white"
                      _hover={{ bg: "buttonHover" }}
                      fontFamily="secondary"
                    >
                      Crear tu primer evento
                    </Button>
                  </Box>
                )}

                {!isLoading && userEvents.length > 0 && (
                  <Grid templateColumns="1fr" gap={4}>
                    {userEvents.map((event) => (
                      <EventsList
                        key={event._id}
                        event={event}
                        setEventDetails={setEventDetails}
                      />
                    ))}
                  </Grid>
                )}
              </Box>

              {/* Sección de Detalles */}
              <Box 
                flex={{ base: "1", lg: "1" }} 
                minW={{ base: "100%", lg: "500px" }}
                bg="white"
                borderRadius="lg"
                p={6}
                border="1px solid"
                borderColor="gray.100"
                boxShadow="sm"
              >
                <Heading 
                  as="h2" 
                  fontSize="xl" 
                  fontFamily="secondary" 
                  color="tertiary" 
                  mb={6}
                  fontWeight="600"
                >
                  Detalle de entradas vendidas
                </Heading>
                <TicketsDetails
                  eventDetails={eventDetails}
                  setEventDetails={setEventDetails}
                />
              </Box>
            </Flex>
          </Container>
    </>
  );
}

export default MyEvents;
