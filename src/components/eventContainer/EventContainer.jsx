import { Grid, Image, Flex, Button, Text, Divider } from "@chakra-ui/react";
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

  const computeCheapestTicket = (tickets) => {
    if (!Array.isArray(tickets) || tickets.length === 0) return null;
    const priced = tickets.filter((t) => t && typeof t.price === "number" && !Number.isNaN(t.price));
    if (priced.length === 0) return null;
    return priced.reduce((min, t) => (t.price < min.price ? t : min), priced[0]);
  };

  const mergeEvents = (ownEvents, publicEvents) => {
    const map = new Map();
    // Primero: propios (para que aparezcan aunque estén pending)
    (ownEvents || []).forEach((e) => {
      if (!e?._id) return;
      map.set(String(e._id), e);
    });
    // Luego: públicos (pueden traer cheapestTicket ya calculado)
    (publicEvents || []).forEach((e) => {
      if (!e?._id) return;
      // Si ya existía el mismo evento, mantenemos el más completo (priorizamos el público si trae cheapestTicket)
      const key = String(e._id);
      const prev = map.get(key);
      if (!prev) {
        map.set(key, e);
        return;
      }
      const merged = {
        ...prev,
        ...e,
        cheapestTicket: e.cheapestTicket || prev.cheapestTicket,
      };
      map.set(key, merged);
    });
    return Array.from(map.values());
  };

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        // Público (participante): solo aprobados
        const publicRes = await eventApi.getEvents({
          page: 1,
          limit: 10,
          status: 'approved',
          // Para testing/QA: no filtramos por Mercado Pago configurado.
          // Si querés reactivar el filtro, volvemos a pasar hasMercadoPago: true.
        });

        // Propios (si está logueado): incluir pending/rejected para poder testear antes de aprobación
        let ownEvents = [];
        if (token) {
          try {
            const ownRes = await eventApi.getUserEvents(1, 50);
            ownEvents = (ownRes?.data?.events || []).map((e) => ({
              ...e,
              cheapestTicket: e.cheapestTicket || computeCheapestTicket(e.tickets),
            }));
          } catch (e) {
            // No bloquear el home si falla
          }
        }

        const publicEvents = publicRes?.data?.events || [];
        const merged = mergeEvents(ownEvents, publicEvents);
        setEvents(merged);

        // Paginación: basada en públicos (los propios son “extra” para el organizador)
        if (publicEvents.length < 10) setNoMoreEvents(true);
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
        // Para testing/QA: no filtramos por Mercado Pago configurado.
      });
      // Nota: el “ver más” solo pagina públicos; los propios ya se incluyen en el primer load
      const merged = mergeEvents(events, res.data.events || []);
      setEvents(merged);
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
          })}
        </Grid>
        {isLoading && (
          <Flex w="100%" align="center" justify="center">
            <Image src="/assets/img/loading.svg" />
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
