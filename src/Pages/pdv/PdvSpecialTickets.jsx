import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Stack
} from '@chakra-ui/react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ticketApi from '../../Api/ticket';

const PdvSpecialTickets = () => {
  const [studentTickets, setStudentTickets] = useState([]);
  const [seniorTickets, setSeniorTickets] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadSpecialTickets();
  }, []);

  const loadSpecialTickets = async () => {
    try {
      const [studentsResponse, seniorsResponse] = await Promise.all([
        ticketApi.getPdvSpecialTickets('student'),
        ticketApi.getPdvSpecialTickets('senior')
      ]);

      setStudentTickets(studentsResponse.data);
      setSeniorTickets(seniorsResponse.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los tickets especiales',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <div>
      <Header />
      <Container maxW="7xl" py="8" mt="5rem">
        <Stack spacing={6}>
          <Heading>Tickets Especiales</Heading>
          
          <Tabs>
            <TabList>
              <Tab>Estudiantes</Tab>
              <Tab>Jubilados</Tab>
            </TabList>

            <TabPanels>
              {/* Panel de Estudiantes */}
              <TabPanel>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Evento</Th>
                      <Th>Precio Regular</Th>
                      <Th>Precio Estudiante</Th>
                      <Th>Disponibles</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {studentTickets.map((ticket) => (
                      <Tr key={ticket._id}>
                        <Td>{ticket.eventTitle}</Td>
                        <Td>${ticket.regularPrice}</Td>
                        <Td>${ticket.specialPrice}</Td>
                        <Td>{ticket.available}</Td>
                        <Td>
                          <Button
                            colorScheme="blue"
                            size="sm"
                          >
                            Vender
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TabPanel>

              {/* Panel de Jubilados */}
              <TabPanel>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Evento</Th>
                      <Th>Precio Regular</Th>
                      <Th>Precio Jubilado</Th>
                      <Th>Disponibles</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {seniorTickets.map((ticket) => (
                      <Tr key={ticket._id}>
                        <Td>{ticket.eventTitle}</Td>
                        <Td>${ticket.regularPrice}</Td>
                        <Td>${ticket.specialPrice}</Td>
                        <Td>{ticket.available}</Td>
                        <Td>
                          <Button
                            colorScheme="blue"
                            size="sm"
                          >
                            Vender
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Stack>
      </Container>
      <Footer />
    </div>
  );
};

export default PdvSpecialTickets;