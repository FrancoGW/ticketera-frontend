import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Container,
  Flex,
  Text,
  Spinner,
  Center
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import eventApi from "../../Api/event";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Sidebar from "../../components/sideBar/sideBar";

const COLORS = ['#000', '#4A5568', '#718096', '#A0AEC0', '#CBD5E0', '#E2E8F0'];

const MetricsPage = () => {
  const [stats, setStats] = useState({
    totalTicketsSold: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    activeEventsCount: 0,
    eventsStats: [],
    topOrganizers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      setIsLoading(true);
      try {
        const response = await eventApi.getEventStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getStats();
  }, []);

  // Preparar datos para gráficos
  const topEventsData = (stats.eventsStats || [])
    .slice(0, 10)
    .filter(event => event && event.title)
    .map(event => ({
      name: event.title && event.title.length > 20 ? event.title.substring(0, 20) + '...' : (event.title || 'Sin título'),
      ventas: event.revenue || 0,
      tickets: event.ticketsSold || 0
    }));

  const topOrganizersData = (stats.topOrganizers || [])
    .slice(0, 8)
    .filter(org => org && org.email) // Filtrar organizadores sin email
    .map(org => ({
      name: org.email ? org.email.split('@')[0] : 'Sin nombre',
      eventos: org.eventCount || 0,
      revenue: org.totalRevenue || 0
    }));

  const commissionData = [
    { name: 'Comisiones', value: stats.totalCommissions },
    { name: 'Resto', value: Math.max(0, stats.totalRevenue - stats.totalCommissions) }
  ];

  if (isLoading) {
    return (
      <Flex minH="100vh" bg="gray.50">
        <Sidebar />
        <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
          <Header />
          <Center minH="calc(100vh - 80px)" bg="white">
            <Spinner size="xl" color="primary" />
          </Center>
        </Box>
      </Flex>
    );
  }

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
            <Heading 
              as="h1" 
              fontFamily="secondary" 
              color="tertiary" 
              mb={8}
              fontSize="2xl"
              fontWeight="bold"
            >
              Métricas y Estadísticas
            </Heading>

            {/* Stats Cards */}
            <Grid 
              templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} 
              gap={6} 
              mb={8}
            >
              <Stat 
                bg="white" 
                p={6} 
                borderRadius="lg" 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <StatLabel 
                  fontSize="sm" 
                  fontWeight="500" 
                  color="gray.600"
                  mb={2}
                >
                  Eventos Activos
                </StatLabel>
                <StatNumber 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  color="primary"
                >
                  {stats.activeEventsCount}
                </StatNumber>
              </Stat>
              
              <Stat 
                bg="white" 
                p={6} 
                borderRadius="lg" 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <StatLabel 
                  fontSize="sm" 
                  fontWeight="500" 
                  color="gray.600"
                  mb={2}
                >
                  Total Entradas Vendidas
                </StatLabel>
                <StatNumber 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  color="primary"
                >
                  {stats.totalTicketsSold.toLocaleString()}
                </StatNumber>
              </Stat>

              <Stat 
                bg="white" 
                p={6} 
                borderRadius="lg" 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <StatLabel 
                  fontSize="sm" 
                  fontWeight="500" 
                  color="gray.600"
                  mb={2}
                >
                  Ingresos Totales
                </StatLabel>
                <StatNumber 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  color="primary"
                >
                  ${stats.totalRevenue.toLocaleString()}
                </StatNumber>
              </Stat>

              <Stat 
                bg="white" 
                p={6} 
                borderRadius="lg" 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <StatLabel 
                  fontSize="sm" 
                  fontWeight="500" 
                  color="gray.600"
                  mb={2}
                >
                  Ganancias en Comisiones
                </StatLabel>
                <StatNumber 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  color="green.600"
                >
                  ${stats.totalCommissions.toLocaleString()}
                </StatNumber>
              </Stat>
            </Grid>

            {/* Charts Grid */}
            <Grid 
              templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} 
              gap={6} 
              mb={8}
            >
              {/* Gráfico de Ventas por Evento */}
              <Card 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardHeader 
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Heading 
                    size="md" 
                    fontFamily="secondary"
                    fontWeight="600"
                  >
                    Ventas por Evento (Top 10)
                  </Heading>
                </CardHeader>
                <CardBody>
                  {topEventsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={topEventsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                          fontFamily="Roboto, sans-serif"
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          fontSize={12}
                          fontFamily="Roboto, sans-serif"
                        />
                        <Tooltip 
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontFamily: 'Roboto, sans-serif'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="ventas" fill="#000" name="Ingresos ($)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Center h="350px">
                      <Text color="gray.500" fontFamily="secondary">
                        No hay datos disponibles
                      </Text>
                    </Center>
                  )}
                </CardBody>
              </Card>

              {/* Gráfico de Ganancias en Comisiones */}
              <Card 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardHeader 
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Heading 
                    size="md" 
                    fontFamily="secondary"
                    fontWeight="600"
                  >
                    Distribución de Ingresos
                  </Heading>
                </CardHeader>
                <CardBody>
                  {commissionData[0].value > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={commissionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {commissionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? '#22C55E' : '#E2E8F0'} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontFamily: 'Roboto, sans-serif'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Center h="350px">
                      <Text color="gray.500" fontFamily="secondary">
                        No hay datos disponibles
                      </Text>
                    </Center>
                  )}
                </CardBody>
              </Card>

              {/* Gráfico de Organizadores con más Eventos */}
              <Card 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardHeader 
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Heading 
                    size="md" 
                    fontFamily="secondary"
                    fontWeight="600"
                  >
                    Organizadores con más Eventos (Top 8)
                  </Heading>
                </CardHeader>
                <CardBody>
                  {topOrganizersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={topOrganizersData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" fontSize={12} fontFamily="Roboto, sans-serif" />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={100}
                          fontSize={12}
                          fontFamily="Roboto, sans-serif"
                        />
                        <Tooltip 
                          formatter={(value) => value}
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontFamily: 'Roboto, sans-serif'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="eventos" fill="#4A5568" name="Cantidad de Eventos" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Center h="350px">
                      <Text color="gray.500" fontFamily="secondary">
                        No hay datos disponibles
                      </Text>
                    </Center>
                  )}
                </CardBody>
              </Card>

              {/* Gráfico de Ingresos por Organizador */}
              <Card 
                boxShadow="md"
                border="1px solid"
                borderColor="gray.100"
              >
                <CardHeader 
                  borderBottom="1px solid"
                  borderColor="gray.100"
                >
                  <Heading 
                    size="md" 
                    fontFamily="secondary"
                    fontWeight="600"
                  >
                    Ingresos por Organizador (Top 8)
                  </Heading>
                </CardHeader>
                <CardBody>
                  {topOrganizersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={topOrganizersData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                          fontFamily="Roboto, sans-serif"
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          fontSize={12}
                          fontFamily="Roboto, sans-serif"
                        />
                        <Tooltip 
                          formatter={(value) => `$${value.toLocaleString()}`}
                          contentStyle={{ 
                            backgroundColor: 'white',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontFamily: 'Roboto, sans-serif'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" fill="#718096" name="Ingresos ($)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Center h="350px">
                      <Text color="gray.500" fontFamily="secondary">
                        No hay datos disponibles
                      </Text>
                    </Center>
                  )}
                </CardBody>
              </Card>
            </Grid>
          </Container>
        </Box>
        
        <Footer />
      </Box>
    </Flex>
  );
};

export default MetricsPage;
