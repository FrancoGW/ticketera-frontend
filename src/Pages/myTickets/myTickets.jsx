import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  Container,
  Heading,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  Box,
  AccordionIcon,
  AccordionPanel,
  Text,
  useToast,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import ticketApi from "../../Api/ticket";
import TicketInfo from "./components/TicketInfo";

function MyTickets() {
  const [tickets, setTickets] = useState({});
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    const getTickets = async () => {
      try {
        const { data } = await ticketApi.getTicketsByUser();
        setTickets(data.ticketsByEvent);
      } catch (error) {
        console.log(error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los tickets",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
      setIsLoading(false)
    };
    getTickets();
  }, []);

  return (
    <div>
      <Header />
      <Container maxW="7xl" minH="70vh" my="10">
        <Heading fontFamily="secondary" color="tertiary" as="h1" mb="10">Mis Tickets</Heading>
        {isLoading && <Flex justifyContent="center">
            <Spinner size='xl' color="primary" />
          </Flex>}
        {!Object.keys(tickets).length && !isLoading && (
          <Text fontSize="xl" textAlign="center" fontFamily="secondary" mt="10">Aún no compraste ningún ticket. Cuando adquieras alguno se mostrará aquí.</Text>
        )}
        <Accordion allowToggle>
          {Object.keys(tickets)?.map((key) => {
            const ticketsData = tickets[key];
            return (
              <AccordionItem key={key} >
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontFamily="secondary">
                      {ticketsData.eventTitle}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>

                  <TableContainer mt="10">
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th fontFamily="secondary">Ticket</Th>
                          <Th fontFamily="secondary">Lugar y fecha</Th>
                          <Th fontFamily="secondary">Valor</Th>
                          <Th fontFamily="secondary">QR</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {ticketsData.tickets.map((ticket, index) => (
                          <TicketInfo
                            ticket={ticket}
                            index={index}
                            ticketsData={ticketsData}
                          />
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      </Container>
      <Footer />
    </div>
  );
}

export default MyTickets;
