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
  Text,
  Spinner,
  Center,
  HStack,
  Icon,
  VStack,
  Badge,
  Flex,
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
  Line,
} from "recharts";
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiUsers, 
  FiCalendar,
  FiBarChart2
} from "react-icons/fi";
import { RiTicket2Line as TicketIcon } from "react-icons/ri";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import eventApi from "../../Api/event";
import userApi from "../../Api/user";

const COLORS = ['#7253c9', '#4A5568', '#718096', '#A0AEC0', '#CBD5E0', '#E2E8F0'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTicketsSold: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    activeEventsCount: 0,
    totalEventsCount: 0,
    totalUsersCount: 0,
    eventsStats: [],
    topOrganizers: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Cargar estadísticas de eventos
        const statsResponse = await eventApi.getEventStats();
        const eventStats = statsResponse.data;

        // Cargar total de usuarios
        let totalUsers = 0;
        try {
          const usersResponse = await userApi.getAllUsers();
          totalUsers = usersResponse.data?.users?.length || 0;
        } catch (error) {
          console.warn('No se pudieron cargar los usuarios:', error);
        }

        // Cargar total de eventos
        let totalEvents = 0;
        try {
          const eventsResponse = await eventApi.getEventsbyAdmin({ page: 1, limit: 1 });
          totalEvents = eventsResponse.data?.total || 0;
        } catch (error) {
          console.warn('No se pudo obtener el total de eventos:', error);
        }

        setStats({
          ...eventStats,
          totalUsersCount: totalUsers,
          totalEventsCount: totalEvents,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Preparar datos para gráficos
  const topEventsData = (stats.eventsStats || [])
    .slice(0, 5)
    .filter(event => event && event.title)
    .map(event => ({
      name: event.title && event.title.length > 25 
        ? event.title.substring(0, 25) + '...' 
        : (event.title || 'Sin título'),
      ventas: event.revenue || 0,
      tickets: event.ticketsSold || 0
    }));

  const topOrganizersData = (stats.topOrganizers || [])
    .slice(0, 5)
    .filter(org => org && org.email)
    .map(org => ({
      name: org.email ? org.email.split('@')[0] : 'Sin nombre',
      eventos: org.eventCount || 0,
      revenue: org.totalRevenue || 0
    }));

  const commissionData = [
    { name: 'Ganancias', value: stats.totalCommissions },
    { name: 'Ingresos Organizadores', value: Math.max(0, stats.totalRevenue - stats.totalCommissions) }
  ];

  // Calcular porcentaje de crecimiento (simulado por ahora)
  const revenueGrowth = stats.totalRevenue > 0 ? 12.5 : 0;
  const ticketsGrowth = stats.totalTicketsSold > 0 ? 8.3 : 0;

  if (isLoading) {
    return (
      <Center minH="calc(100vh - 80px)" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="primary" thickness="4px" />
          <Text color="gray.600" fontFamily="secondary">
            Cargando dashboard...
          </Text>
        </VStack>
      </Center>
    );
  }

  const StatCard = ({ icon, label, value, color, growth, onClick }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        bg="white"
        boxShadow="md"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.100"
        cursor={onClick ? "pointer" : "default"}
        onClick={onClick}
        _hover={onClick ? { boxShadow: "lg", borderColor: "primary" } : {}}
        transition="all 0.2s"
        h="100%"
      >
        <CardBody p={6}>
          <HStack justify="space-between" mb={4}>
            <Box
              p={3}
              borderRadius="lg"
              bg={`${color}.50`}
              color={`${color}.600`}
            >
              <Icon as={icon} boxSize={6} />
            </Box>
            {growth !== undefined && (
              <Badge colorScheme="green" fontSize="xs">
                +{growth}%
              </Badge>
            )}
          </HStack>
          <Stat>
            <StatLabel 
              fontSize="sm" 
              fontWeight="500" 
              color="gray.600"
              mb={2}
            >
              {label}
            </StatLabel>
            <StatNumber 
              fontSize="2xl" 
              fontWeight="bold" 
              color={color === "green" ? "green.600" : "primary"}
            >
              {value}
            </StatNumber>
          </Stat>
        </CardBody>
      </Card>
    </motion.div>
  );

  return (
    <Container maxW="full" px={{ base: 4, md: 8 }} py={8}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <Box mb={8}>
          <Heading 
            as="h1" 
            fontFamily="secondary" 
            color="tertiary" 
            mb={2}
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
          >
            Dashboard Administrativo
          </Heading>
          <Text color="gray.600" fontSize="md">
            Resumen general de métricas y estadísticas de la plataforma
          </Text>
        </Box>

        {/* Stats Cards Grid */}
        <Grid 
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} 
          gap={6} 
          mb={8}
        >
          <StatCard
            icon={FiDollarSign}
            label="Ganancias Totales"
            value={`$${stats.totalCommissions.toLocaleString('es-AR')}`}
            color="green"
            growth={revenueGrowth}
            onClick={() => navigate('/admin/metrics')}
          />
          
          <StatCard
            icon={FiTrendingUp}
            label="Ingresos Totales"
            value={`$${stats.totalRevenue.toLocaleString('es-AR')}`}
            color="blue"
            onClick={() => navigate('/admin/metrics')}
          />

          <StatCard
            icon={TicketIcon}
            label="Tickets Vendidos"
            value={stats.totalTicketsSold.toLocaleString('es-AR')}
            color="purple"
            growth={ticketsGrowth}
            onClick={() => navigate('/admin/tickets')}
          />

          <StatCard
            icon={FiCalendar}
            label="Eventos Activos"
            value={stats.activeEventsCount}
            color="orange"
            onClick={() => navigate('/admin/events')}
          />

          <StatCard
            icon={FiCalendar}
            label="Total de Eventos"
            value={stats.totalEventsCount}
            color="teal"
            onClick={() => navigate('/admin/events')}
          />

          <StatCard
            icon={FiUsers}
            label="Total de Usuarios"
            value={stats.totalUsersCount}
            color="cyan"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>

        {/* Charts Grid */}
        <Grid 
          templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} 
          gap={6} 
          mb={8}
        >
          {/* Gráfico de Top Eventos */}
          <Card 
            boxShadow="md"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="xl"
          >
            <CardHeader 
              borderBottom="1px solid"
              borderColor="gray.100"
              pb={4}
            >
              <HStack justify="space-between">
                <Heading 
                  size="md" 
                  fontFamily="secondary"
                  fontWeight="600"
                >
                  Top 5 Eventos por Ingresos
                </Heading>
                <Icon as={FiBarChart2} color="primary" boxSize={5} />
              </HStack>
            </CardHeader>
            <CardBody>
              {topEventsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topEventsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={11}
                      fontFamily="Roboto, sans-serif"
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                      fontSize={11}
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
                    <Bar 
                      dataKey="ventas" 
                      fill="#7253c9" 
                      name="Ingresos ($)" 
                      radius={[8, 8, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Center h="300px">
                  <VStack spacing={2}>
                    <Text color="gray.500" fontFamily="secondary">
                      No hay datos disponibles
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Los gráficos se mostrarán cuando haya eventos con ventas
                    </Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>

          {/* Gráfico de Distribución de Ingresos */}
          <Card 
            boxShadow="md"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="xl"
          >
            <CardHeader 
              borderBottom="1px solid"
              borderColor="gray.100"
              pb={4}
            >
              <HStack justify="space-between">
                <Heading 
                  size="md" 
                  fontFamily="secondary"
                  fontWeight="600"
                >
                  Distribución de Ingresos
                </Heading>
                <Icon as={FiDollarSign} color="primary" boxSize={5} />
              </HStack>
            </CardHeader>
            <CardBody>
              {commissionData[0].value > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={commissionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#22C55E' : '#7253c9'} 
                        />
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
                <Center h="300px">
                  <VStack spacing={2}>
                    <Text color="gray.500" fontFamily="secondary">
                      No hay datos disponibles
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Los gráficos se mostrarán cuando haya ingresos registrados
                    </Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>

          {/* Gráfico de Top Organizadores */}
          <Card 
            boxShadow="md"
            border="1px solid"
            borderColor="gray.100"
            borderRadius="xl"
            gridColumn={{ base: "1", lg: "1 / -1" }}
          >
            <CardHeader 
              borderBottom="1px solid"
              borderColor="gray.100"
              pb={4}
            >
              <HStack justify="space-between">
                <Heading 
                  size="md" 
                  fontFamily="secondary"
                  fontWeight="600"
                >
                  Top 5 Organizadores por Eventos
                </Heading>
                <Icon as={FiUsers} color="primary" boxSize={5} />
              </HStack>
            </CardHeader>
            <CardBody>
              {topOrganizersData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topOrganizersData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" fontSize={11} fontFamily="Roboto, sans-serif" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100}
                      fontSize={11}
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
                    <Bar 
                      dataKey="eventos" 
                      fill="#7253c9" 
                      name="Cantidad de Eventos" 
                      radius={[0, 8, 8, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Center h="300px">
                  <VStack spacing={2}>
                    <Text color="gray.500" fontFamily="secondary">
                      No hay datos disponibles
                    </Text>
                    <Text fontSize="sm" color="gray.400">
                      Los gráficos se mostrarán cuando haya organizadores con eventos
                    </Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Card 
          boxShadow="md"
          border="1px solid"
          borderColor="gray.100"
          borderRadius="xl"
        >
          <CardHeader 
            borderBottom="1px solid"
            borderColor="gray.100"
            pb={4}
          >
            <Heading 
              size="md" 
              fontFamily="secondary"
              fontWeight="600"
            >
              Accesos Rápidos
            </Heading>
          </CardHeader>
          <CardBody>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
              <Box
                p={4}
                borderRadius="lg"
                bg="gray.50"
                cursor="pointer"
                _hover={{ bg: "primary", color: "white" }}
                transition="all 0.2s"
                onClick={() => navigate('/admin/metrics')}
              >
                <Text fontWeight="600" mb={1}>Ver Métricas Detalladas</Text>
                <Text fontSize="sm" color="gray.600">Análisis completo de estadísticas</Text>
              </Box>
              <Box
                p={4}
                borderRadius="lg"
                bg="gray.50"
                cursor="pointer"
                _hover={{ bg: "primary", color: "white" }}
                transition="all 0.2s"
                onClick={() => navigate('/admin/events')}
              >
                <Text fontWeight="600" mb={1}>Gestionar Eventos</Text>
                <Text fontSize="sm" color="gray.600">Ver y administrar todos los eventos</Text>
              </Box>
              <Box
                p={4}
                borderRadius="lg"
                bg="gray.50"
                cursor="pointer"
                _hover={{ bg: "primary", color: "white" }}
                transition="all 0.2s"
                onClick={() => navigate('/admin/tickets')}
              >
                <Text fontWeight="600" mb={1}>Gestionar Tickets</Text>
                <Text fontSize="sm" color="gray.600">Ver y administrar tickets</Text>
              </Box>
              <Box
                p={4}
                borderRadius="lg"
                bg="gray.50"
                cursor="pointer"
                _hover={{ bg: "primary", color: "white" }}
                transition="all 0.2s"
                onClick={() => navigate('/admin/users')}
              >
                <Text fontWeight="600" mb={1}>Gestionar Usuarios</Text>
                <Text fontSize="sm" color="gray.600">Administrar usuarios del sistema</Text>
              </Box>
            </Grid>
          </CardBody>
        </Card>
      </motion.div>
    </Container>
  );
};

export default AdminDashboard;
