import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  Center,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { FiTrendingUp, FiDollarSign, FiRefreshCw, FiCalendar } from "react-icons/fi";
import { paymentApi } from "../../Api/payment";
import eventApi from "../../Api/event";

const StatCard = ({ icon: Icon, label, value, subtext, colorScheme = "primary" }) => (
  <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200" overflow="hidden">
    <CardBody p={6}>
      <VStack align="stretch" spacing={3}>
        <Box
          p={3}
          borderRadius="lg"
          bg={`${colorScheme}.50`}
          color={`${colorScheme}.600`}
          w="fit-content"
        >
          <Icon size={24} />
        </Box>
        <Text fontSize="sm" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
        <Heading as="h3" fontSize={{ base: "2xl", md: "3xl" }} fontFamily="secondary" fontWeight="bold">
          {value}
        </Heading>
        {subtext && (
          <Text fontSize="sm" color="gray.500">
            {subtext}
          </Text>
        )}
      </VStack>
    </CardBody>
  </Card>
);

const SellerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [statsRes, eventsRes] = await Promise.all([
          paymentApi.getSellerStats().catch(() => ({ data: null })),
          eventApi.getUserEvents(1, 100).catch(() => ({ data: { events: [] } })),
        ]);
        const statsData = statsRes?.data;
        setStats(statsData ?? {
          totalSales: 0,
          totalRevenue: 0,
          totalEarnings: 0,
          totalRefunds: 0,
          eventsCount: eventsRes?.data?.events?.length ?? 0,
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Error al cargar estadísticas",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setStats({
          totalSales: 0,
          totalRevenue: 0,
          totalEarnings: 0,
          totalRefunds: 0,
          eventsCount: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  if (isLoading) {
    return (
      <Center minH="calc(100vh - 200px)">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="primary" size="xl" />
      </Center>
    );
  }

  const formatMoney = (n) => {
    if (n == null || isNaN(n)) return "—";
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
  };

  return (
    <Box w="100%" minH="calc(100vh - 80px)" bg="gray.50" py={{ base: 6, md: 8 }} px={{ base: 2, md: 0 }}>
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading
              as="h1"
              fontFamily="secondary"
              color="tertiary"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              mb={2}
            >
              Estadísticas de ventas
            </Heading>
            <Text fontFamily="secondary" color="gray.600" fontSize="md">
              Resumen de ventas, ganancias y devoluciones de tus eventos
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6}>
            <StatCard
              icon={FiCalendar}
              label="Eventos activos"
              value={stats?.eventsCount ?? 0}
              subtext="Eventos que creaste"
              colorScheme="blue"
            />
            <StatCard
              icon={FiTrendingUp}
              label="Entradas vendidas"
              value={stats?.totalSales ?? 0}
              subtext="Total de tickets vendidos"
              colorScheme="green"
            />
            <StatCard
              icon={FiDollarSign}
              label="Ganancias"
              value={formatMoney(stats?.totalEarnings)}
              subtext="Después de comisiones"
              colorScheme="purple"
            />
            <StatCard
              icon={FiRefreshCw}
              label="Devoluciones"
              value={stats?.totalRefunds ?? 0}
              subtext="Tickets devueltos o cancelados"
              colorScheme="orange"
            />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default SellerDashboard;
