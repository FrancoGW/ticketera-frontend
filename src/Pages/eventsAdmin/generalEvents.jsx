import { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  Heading,
  Container,
  Grid,
  Flex,
  Image,
  Button,
  Text,
  Input,
  Box,
} from "@chakra-ui/react";
import AdminEventCard from "../../components/adminEventCard/AdminEventCard";
import eventApi from "../../Api/event";
import MetricsPage from "./MetricsPage";
import Sidebar from "../../components/sideBar/sideBar";
import { useNavigate } from "react-router-dom";

const initialQuery = {
  page: 1,
  limit: 8,
};

function GeneralEvents() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [noMoreEvents, setNoMoreEvents] = useState(false);
  const [eventsPage, setEventsPage] = useState(1);
  const [isMoreEventsClicked, setIsMoreEventsClicked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getEventsbyAdmin = () => {
      try {
        eventApi.getEventsbyAdmin(initialQuery).then((res) => {
          setEvents(res.data.events);
          setIsLoading(false);
          if (res.data.events.length < initialQuery.limit) {
            setNoMoreEvents(true);
          }
        });
      } catch (error) {
        console.log(error);
      }
    };
    getEventsbyAdmin();
  }, []);

  const getMoreEvents = async () => {
    setIsLoading(true);
    try {
      const res = await eventApi.getEventsbyAdmin({
        ...initialQuery,
        page: eventsPage + 1,
      });
      setEvents([...events, ...res.data.events]);
      setEventsPage(eventsPage + 1);
      if (res.data.events.length === 0 || res.data.events.length < initialQuery.limit) {
        setNoMoreEvents(true);
        setIsMoreEventsClicked(true);
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Flex justify="space-between" align="center" mb={8}>
              <Heading 
                as="h1" 
                fontFamily="secondary" 
                color="tertiary" 
                fontSize="2xl"
                fontWeight="bold"
              >
                Administra los eventos
              </Heading>
              <Button
                onClick={() => navigate('/admin/new-event')}
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
              >
                Crear Evento
              </Button>
            </Flex>
 
            <Box mb={8}>
              <Input
                placeholder="Buscar evento por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
                bg="white"
                borderColor="gray.200"
                borderWidth="2px"
                _hover={{ borderColor: "gray.300" }}
                _focus={{ 
                  borderColor: "primary", 
                  boxShadow: "0 0 0 3px rgba(0,0,0,0.1)" 
                }}
                borderRadius="lg"
                maxW="500px"
              />
            </Box>
            
            <Grid
              templateColumns="repeat(auto-fill, minmax(280px, 1fr))"
              gap={6}
              w="100%"
            >
              {filteredEvents?.map((event) => (
                <AdminEventCard
                  key={event._id}
                  event={event}
                  pictures={event.pictures}
                  id={event._id}
                  title={event.title}
                  status={event.status}
                />
              ))}
            </Grid>
 
            {isLoading && (
              <Flex w="100%" align="center" justify="center" py={20}>
                <Image src="/assets/img/loading.svg" />
              </Flex>
            )}
            
            {filteredEvents.length === 0 && !isLoading && (
              <Flex 
                w="100%" 
                align="center" 
                justify="center" 
                py={20}
                flexDirection="column"
                gap={4}
              >
                <Heading as="h2" textAlign="center" color="gray.500" fontSize="xl">
                  No hay eventos creados
                </Heading>
                <Text color="gray.400" fontFamily="secondary">
                  Comienza creando tu primer evento
                </Text>
              </Flex>
            )}
            
            {events.length > 0 && !isLoading && !noMoreEvents && searchTerm === "" && (
              <Flex w="100%" align="center" justify="center" mt={8}>
                <Button
                  bg="primary"
                  color="white"
                  _hover={{
                    color: "white",
                    bg: "buttonHover",
                    transform: "translateY(-2px)",
                    boxShadow: "lg"
                  }}
                  borderRadius="lg"
                  fontFamily="secondary"
                  fontWeight="500"
                  px={8}
                  py={6}
                  onClick={getMoreEvents}
                >
                  Ver más eventos
                </Button>
              </Flex>
            )}
            
            {noMoreEvents && !isLoading && isMoreEventsClicked && searchTerm === "" && (
              <Flex w="100%" align="center" justify="center" py={10}>
                <Text fontSize="lg" fontWeight="500" fontFamily="secondary" color="gray.500">
                  No hay más eventos para mostrar.
                </Text>
              </Flex>
            )}
          </Container>
        </Box>
        
        <Footer />
      </Box>
    </Flex>
  );
}

export default GeneralEvents;