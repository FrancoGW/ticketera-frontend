import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ClientSidebar from "../../components/clientSideBar/clientSideBar";
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
  Card,
  CardBody,
  VStack,
  Center,
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
        if (data && data.ticketsByEvent && Object.keys(data.ticketsByEvent).length > 0) {
          setTickets(data.ticketsByEvent);
        } else {
          // No hay tickets, pero no es un error
          setTickets({});
        }
      } catch (error) {
        console.log(error);
        
        // Solo mostrar error si es un error real del servidor (no 404)
        const status = error?.response?.status;
        const isNotFound = status === 404;
        const isServerError = status >= 500;
        
        // Si es 404 o no hay datos, no mostrar error (es normal que no haya tickets)
        if (!isNotFound && isServerError) {
          toast({
            title: "Error",
            description: "No se pudieron cargar los tickets. Por favor, intenta más tarde.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
        
        // En cualquier caso, establecer tickets vacío para mostrar el mensaje de "no hay tickets"
        setTickets({});
      } finally {
        setIsLoading(false);
      }
    };
    getTickets();
  }, [toast]);

  return (
    <Flex minH="100vh" bg="gray.50">
      <ClientSidebar />
      <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
        <Header />
        
        <Box
          as="main"
          minH="calc(100vh - 80px)"
          pb={20}
          bg="white"
          pt={8}
        >
          <Container maxW="6xl" px={{ base: 4, md: 8 }} py={8}>
            <VStack align="stretch" spacing={6}>
              <Heading 
                fontFamily="secondary" 
                color="tertiary" 
                fontSize="3xl"
                fontWeight="bold"
                mb={2}
              >
                Mis Tickets
              </Heading>

              {isLoading && (
                <Center py={20}>
                  <Spinner size='xl' color="primary" thickness="4px" />
                </Center>
              )}

              {!Object.keys(tickets).length && !isLoading && (
                <Card boxShadow="md" borderRadius="xl" bg="white">
                  <CardBody p={10}>
                    <Center>
                      <VStack spacing={4}>
                        <Text fontSize="xl" textAlign="center" fontFamily="secondary" color="gray.600">
                          Aún no compraste ningún ticket
                        </Text>
                        <Text fontSize="md" textAlign="center" fontFamily="secondary" color="gray.500">
                          Cuando adquieras alguno se mostrará aquí
                        </Text>
                      </VStack>
                    </Center>
                  </CardBody>
                </Card>
              )}

              {Object.keys(tickets).length > 0 && !isLoading && (
                <Card boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="gray.200" bg="white">
                  <CardBody p={6}>
                    <Accordion allowToggle>
                      {Object.keys(tickets)?.map((key) => {
                        const ticketsData = tickets[key];
                        return (
                          <AccordionItem key={key} border="none" mb={4} _last={{ mb: 0 }}>
                            <h2>
                              <AccordionButton
                                bg="gray.50"
                                borderRadius="lg"
                                _hover={{ bg: "gray.100" }}
                                py={4}
                                px={4}
                              >
                                <Box flex="1" textAlign="left" fontFamily="secondary" fontWeight="600" fontSize="lg">
                                  {ticketsData.eventTitle}
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel px={0} pt={4}>
                              <TableContainer>
                                <Table size="md" variant="simple">
                                  <Thead>
                                    <Tr>
                                      <Th fontFamily="secondary" color="gray.600" fontWeight="600">Ticket</Th>
                                      <Th fontFamily="secondary" color="gray.600" fontWeight="600">Lugar y fecha</Th>
                                      <Th fontFamily="secondary" color="gray.600" fontWeight="600">Valor</Th>
                                      <Th fontFamily="secondary" color="gray.600" fontWeight="600">QR</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {ticketsData.tickets && ticketsData.tickets.map((ticket, index) => (
                                      <TicketInfo
                                        key={index}
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
                  </CardBody>
                </Card>
              )}
            </VStack>
          </Container>
        </Box>
        
        <Footer />
      </Box>
    </Flex>
  );
}

export default MyTickets;
