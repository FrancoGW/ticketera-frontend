import { Grid, Image, Flex, Button, Text, Divider } from "@chakra-ui/react";
import { useEffect, useState } from "react";
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
          status: 'approved'
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
    <div id="hola">
      <Flex  flexDir={{ base: "column" }} minH="40vh">

        <Grid
          templateColumns={"repeat(auto-fill, minmax(270px, 1fr))"}
          gap={6}
          w="100%"
          my="10"
          justifyItems="center"
        >
          {events?.map((event) => {
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
                />
              );
            }
          })}
        </Grid>
        {isLoading && (
          <Flex w="100%" align="center" justify="center">
            <Image src="/assets/img/loading.svg" />
          </Flex>
        )}
        {events.length === 0 && !isLoading && (
          <Flex w="100%" align="center" justify="center">
            <Text fontSize="2xl" fontWeight="500" fontFamily="secondary">
              No hay eventos disponibles en este momento
            </Text>
          </Flex>
        )}
        {events.length > 0 && !isLoading && !noMoreEvents && (
          <Flex w="100%" align="center" justify="center" mb="4">
            <Button
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
            >
              Ver más eventos
            </Button>
          </Flex>
        )}
        {noMoreEvents && !isLoading && isMoreEventsClicked && (
          <Flex w="100%" align="center" justify="center" my="10">
            <Text fontSize="2xl" fontWeight="500" fontFamily="secondary">
              No hay más eventos para mostrar.
            </Text>
          </Flex>
        )}
      </Flex>
    </div>
  );
}

export default EventContainer;
