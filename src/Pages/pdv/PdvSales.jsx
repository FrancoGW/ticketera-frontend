import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Card,
  CardBody,
  Select,
  Button,
  HStack,
  Icon,
  Flex,
  Badge,
  InputGroup,
  Input,
  InputLeftElement
} from '@chakra-ui/react';
import { FiDownload, FiCalendar, FiDollarSign, FiSearch } from 'react-icons/fi';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ticketApi from '../../Api/ticket';

const PdvSales = () => {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    monthSales: 0,
    weekSales: 0,
    totalTickets: 0
  });
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  useEffect(() => {
    loadSales();
  }, [filterPeriod]);

  const loadSales = async () => {
    try {
      // Simularemos la respuesta hasta tener el endpoint real
      const response = {
        data: {
          sales: [
            {
              _id: '1',
              eventName: 'Concierto Rock',
              customerName: 'Juan Pérez',
              ticketType: 'VIP',
              quantity: 2,
              amount: 100,
              date: new Date(),
              status: 'completed',
              paymentMethod: 'efectivo'
            },
            // Más ventas simuladas...
          ],
          stats: {
            totalSales: 5000,
            monthSales: 1200,
            weekSales: 500,
            totalTickets: 25
          }
        }
      };

      setSales(response.data.sales);
      setStats(response.data.stats);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las ventas',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDownloadReport = async () => {
    try {
      // Aquí iría la lógica para descargar el reporte
      toast({
        title: 'Éxito',
        description: 'Reporte descargado correctamente',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo descargar el reporte',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'green',
      pending: 'yellow',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  const filteredSales = sales.filter(sale => 
    sale.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Header />
      <Container maxW="7xl" py="8" mt="5rem">
        <Stack spacing={6}>
          <Flex justify="space-between" align="center">
            <Heading size="lg">Registro de Ventas</Heading>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="blue"
              onClick={handleDownloadReport}
            >
              Descargar Reporte
            </Button>
          </Flex>

          <Card>
            <CardBody>
              <StatGroup gap={8}>
                <Stat>
                  <StatLabel>Ventas Totales</StatLabel>
                  <StatNumber color="green.500">
                    <Icon as={FiDollarSign} />
                    {stats.totalSales}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Ventas del Mes</StatLabel>
                  <StatNumber color="blue.500">
                    <Icon as={FiDollarSign} />
                    {stats.monthSales}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Ventas de la Semana</StatLabel>
                  <StatNumber color="purple.500">
                    <Icon as={FiDollarSign} />
                    {stats.weekSales}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Tickets Vendidos</StatLabel>
                  <StatNumber color="orange.500">
                    {stats.totalTickets}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </CardBody>
          </Card>

          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Buscar por evento o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              maxW="200px"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">Todas las ventas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </Select>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Evento</Th>
                <Th>Cliente</Th>
                <Th>Tipo de Ticket</Th>
                <Th>Cantidad</Th>
                <Th>Monto</Th>
                <Th>Método de Pago</Th>
                <Th>Estado</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSales.map((sale) => (
                <Tr key={sale._id}>
                  <Td>{new Date(sale.date).toLocaleDateString()}</Td>
                  <Td>{sale.eventName}</Td>
                  <Td>{sale.customerName}</Td>
                  <Td>{sale.ticketType}</Td>
                  <Td>{sale.quantity}</Td>
                  <Td>
                    <Icon as={FiDollarSign} />
                    {sale.amount}
                  </Td>
                  <Td>{sale.paymentMethod}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(sale.status)}>
                      {sale.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {filteredSales.length === 0 && (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">No se encontraron ventas</Text>
            </Box>
          )}
        </Stack>
      </Container>
      <Footer />
    </div>
  );
};

export default PdvSales;