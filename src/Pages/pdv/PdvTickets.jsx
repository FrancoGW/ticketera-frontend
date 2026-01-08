import React, { useState, useEffect } from 'react';
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
  useToast,
  Stack,
  Text
} from '@chakra-ui/react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ticketApi from '../../Api/ticket';

const PdvTickets = () => {
  const [tickets, setTickets] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await ticketApi.getPdvTickets();
      setTickets(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los tickets',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDownload = async (ticketId) => {
    try {
      const response = await ticketApi.downloadTicket(ticketId);
      // Crear blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${ticketId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el ticket',
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
          <Heading>Tickets Vendidos</Heading>
          
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Evento</Th>
                <Th>Cliente</Th>
                <Th>Fecha de Venta</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tickets.map((ticket) => (
                <Tr key={ticket._id}>
                  <Td>{ticket.eventTitle}</Td>
                  <Td>{ticket.customerEmail}</Td>
                  <Td>{new Date(ticket.soldDate).toLocaleDateString()}</Td>
                  <Td>{ticket.status}</Td>
                  <Td>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => handleDownload(ticket._id)}
                    >
                      Descargar
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {tickets.length === 0 && (
            <Box textAlign="center" py="8">
              <Text>No hay tickets vendidos aún</Text>
            </Box>
          )}
        </Stack>
      </Container>
      <Footer />
    </div>
  );
};

export default PdvTickets;