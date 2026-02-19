import { Grid, Image, Flex, Button, Text, Divider, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import EventCard from "../eventCard/EventCard.jsx";
import eventApi from "../../Api/event";

function EventContainer() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsPage, setEventsPage] = useState(1);
  const [noMoreEvents, setNoMoreEvents] = useState(false);
  const [isMoreEventsClicked, setIsMoreEventsClicked] = useState(false);
  const [searchBarValues, setSearchBarValues] = useState({});

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const res = await eventApi.getEvents({
          page: 1,
          limit: 10,
          status: 'approved',
          hasMercadoPago: true // Solo mostrar eventos de organizadores con Mercado Pago configurado
        });
        if (res.data && res.data.events) {
          setEvents(res.data.events);
          if (res.data.events.length < 10) {
            setNoMoreEvents(true);
          }
        }
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
  }, []);

  const getMoreEvents = async () => {
    setIsLoading(true);
    try {
      const res = await eventApi.getEvents({
        page: eventsPage + 1,
        limit: 10,
        status: 'approved',
        hasMercadoPago: true // Solo mostrar eventos de organizadores con Mercado Pago configurado
      });
      setEvents([...events, ...res.data.events]);
      setEventsPage(eventsPage + 1);
      if (res.data.events.length === 0 || res.data.events.length < 10) {
        setNoMoreEvents(true);
        setIsMoreEventsClicked(true);
      }
    } catch (error) {
      // console.log(error);
    }
    setIsLoading(false);
  };

  return (
    <motion.div
      id="hola"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Flex flexDir={{ base: "column" }} minH="40vh">
        <Grid
          templateColumns={"repeat(auto-fill, minmax(270px, 1fr))"}
          gap={8}
          w="100%"
          justifyItems="center"
        >
          {events?.map((event, index) => {
            // El backend ya filtra los eventos por Mercado Pago configurado
            // Solo mostramos eventos aprobados
            if (event.status === "approved") {
              return (
                <EventCard
                  key={event._id}
                  id={event._id}
                  pictures={event.pictures}
                  title={event.title}
                  dates={event.dates}
                  addressRef={event.addressRef}
                  cheapestTicket={event.cheapestTicket}
                  index={index}
                />
              );
            }
            return null;
          })}
        </Grid>
        {isLoading && (
          <Flex
            w="100%"
            minH="40vh"
            align="center"
            justify="center"
            flexDirection="column"
            gap={6}
            bg="gray.50"
            py={12}
            mx={{ base: -4, md: 0 }}
            px={{ base: 4, md: 0 }}
          >
            <Flex position="relative" align="center" justify="center" flexDirection="column" gap={4}>
              <Image src="/assets/img/loading.svg" maxW="80px" alt="" />
              <Image
                src="/assets/Logo/icon_ifavico.svg"
                alt="GetPass"
                maxW="48px"
                objectFit="contain"
              />
            </Flex>
          </Flex>
        )}
        {events.length === 0 && !isLoading && (
          <Flex w="100%" align="center" justify="center" py={16}>
            <Text
              fontSize="xl"
              fontWeight="400"
              fontFamily="secondary"
              color="gray.600"
            >
              No hay eventos disponibles en este momento
            </Text>
          </Flex>
        )}
        {events.length > 0 && !isLoading && !noMoreEvents && (
          <Flex w="100%" align="center" justify="center" mb="4">
            <Button
              as={motion.button}
              bg="primary"
              color="white"
              _hover={{
                borderTop: "1px solid #000",
                color: "white",
                bg: "buttonHover",
              }}
              _active=""
              borderRadius="xl"
              fontFamily="secondary"
              fontWeight="400"
              onClick={getMoreEvents}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Ver más eventos
            </Button>
          </Flex>
        )}
        {noMoreEvents && !isLoading && isMoreEventsClicked && (
          <Flex w="100%" align="center" justify="center" py={8}>
            <Text
              fontSize="lg"
              fontWeight="400"
              fontFamily="secondary"
              color="gray.600"
            >
              No hay más eventos para mostrar.
            </Text>
          </Flex>
        )}
      </Flex>
    </motion.div>
  );
}

export default EventContainer;
