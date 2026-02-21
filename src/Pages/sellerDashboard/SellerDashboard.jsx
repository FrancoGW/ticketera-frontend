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
  CardHeader,
  Center,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  TableCaption,
  Badge,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiDollarSign,
  FiRefreshCw,
  FiCalendar,
  FiCreditCard,
  FiPieChart,
} from "react-icons/fi";
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
import { paymentApi } from "../../Api/payment";
import eventApi from "../../Api/event";

const PAYMENT_METHOD_LABELS = {
  mercadopago: "Mercado Pago",
  cbu: "CBU / Transferencia",
  gpcoins: "Tokens (GP-Coins)",
};

const PAYMENT_METHOD_COLORS = {
  mercadopago: "#009EE3",
  cbu: "#00B1EA",
  gpcoins: "#B78DEA",
};

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
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [statsRes, eventsRes] = await Promise.all([
          paymentApi.getSellerStats().catch(() => ({ data: null })),
          eventApi.getUserEvents(1, 100).catch(() => ({ data: { events: [] } })),
        ]);
        const statsData = statsRes?.data;
        const byPaymentMethod = statsData?.byPaymentMethod ?? { mercadopago: 0, cbu: 0, gpcoins: 0 };
        const sales = statsData?.sales ?? [];
        setStats({
          ...(statsData ?? {}),
          totalSales: statsData?.totalSales ?? 0,
          totalRevenue: statsData?.totalRevenue ?? 0,
          totalEarnings: statsData?.totalEarnings ?? 0,
          totalRefunds: statsData?.totalRefunds ?? 0,
          eventsCount: statsData?.eventsCount ?? eventsRes?.data?.events?.length ?? 0,
          byPaymentMethod,
          sales,
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
          byPaymentMethod: { mercadopago: 0, cbu: 0, gpcoins: 0 },
          sales: [],
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

  const formatDate = (d) => {
    if (!d) return "—";
    const date = new Date(d);
    return new Intl.DateTimeFormat("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const byMethodDataFull = [
    { name: "Mercado Pago", value: stats?.byPaymentMethod?.mercadopago ?? 0, color: PAYMENT_METHOD_COLORS.mercadopago },
    { name: "CBU / Transferencia", value: stats?.byPaymentMethod?.cbu ?? 0, color: PAYMENT_METHOD_COLORS.cbu },
    { name: "Tokens (GP-Coins)", value: stats?.byPaymentMethod?.gpcoins ?? 0, color: PAYMENT_METHOD_COLORS.gpcoins },
  ];
  const byMethodData = byMethodDataFull.filter((item) => item.value > 0);

  const salesByDay = (stats?.sales ?? []).reduce((acc, s) => {
    const day = s.date ? new Date(s.date).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";
    if (!day) return acc;
    const existing = acc.find((x) => x.fecha === day);
    if (existing) {
      existing.ventas += s.totalAmount || 0;
      existing.entradas += s.quantity || 0;
    } else {
      acc.push({ fecha: day, ventas: s.totalAmount || 0, entradas: s.quantity || 0 });
    }
    return acc;
  }, []);
  salesByDay.sort((a, b) => new Date(a.fecha.split("/").reverse().join("-")) - new Date(b.fecha.split("/").reverse().join("-")));

  const hasSales = (stats?.sales ?? []).length > 0;

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
              Resumen de ventas, ganancias, medios de pago y registro de compradores
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

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {byMethodData.length > 0 ? (
                <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
                  <CardHeader>
                    <Flex align="center" gap={2}>
                      <FiPieChart />
                      <Heading size="md" fontFamily="secondary">
                        Ventas por medio de pago
                      </Heading>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={0}>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={byMethodData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ name, value }) => (value > 0 ? `${name}: ${formatMoney(value)}` : null)}
                        >
                          {byMethodData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatMoney(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              ) : (
                <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
                  <CardHeader>
                    <Flex align="center" gap={2}>
                      <FiPieChart />
                      <Heading size="md" fontFamily="secondary">
                        Ventas por medio de pago
                      </Heading>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.500" fontSize="sm">
                      Mercado Pago, CBU/Transferencia y Tokens (GP-Coins). Cuando tengas ventas, acá vas a ver el desglose.
                    </Text>
                  </CardBody>
                </Card>
              )}

              {salesByDay.length > 0 ? (
                <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
                  <CardHeader>
                    <Flex align="center" gap={2}>
                      <FiTrendingUp />
                      <Heading size="md" fontFamily="secondary">
                        Ventas en el tiempo
                      </Heading>
                    </Flex>
                  </CardHeader>
                  <CardBody pt={0}>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={salesByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `$${v}`} />
                        <Tooltip formatter={(value) => [formatMoney(value), "Ventas"]} />
                        <Line type="monotone" dataKey="ventas" stroke="#B78DEA" strokeWidth={2} name="Ventas" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardBody>
                </Card>
              ) : (
                <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
                  <CardHeader>
                    <Flex align="center" gap={2}>
                      <FiTrendingUp />
                      <Heading size="md" fontFamily="secondary">
                        Ventas en el tiempo
                      </Heading>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.500" fontSize="sm">
                      Acá vas a ver la evolución de ventas por día cuando tengas compras.
                    </Text>
                  </CardBody>
                </Card>
              )}

              <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200" gridColumn={{ base: "1", lg: "1 / -1" }}>
                <CardHeader>
                  <Flex align="center" gap={2}>
                    <FiCreditCard />
                    <Heading size="md" fontFamily="secondary">
                      Monto por medio de pago
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody pt={0}>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={byMethodDataFull} layout="vertical" margin={{ left: 20, right: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} />
                        <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => formatMoney(value)} />
                        <Bar dataKey="value" name="Monto" fill="#B78DEA" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                </CardBody>
              </Card>
            </SimpleGrid>

          <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200">
            <CardHeader>
              <Heading size="md" fontFamily="secondary">
                Registro de compras
              </Heading>
              <Text fontSize="sm" color="gray.500">
                Quién compró entradas, fecha, monto y medio de pago
              </Text>
            </CardHeader>
            <CardBody pt={0} overflowX="auto">
              {hasSales ? (
                <TableContainer>
                  <Table size={isMobile ? "sm" : "md"} variant="simple">
                    <TableCaption placement="top">
                      Total: {(stats?.sales ?? []).length} operación(es)
                    </TableCaption>
                    <Thead>
                      <Tr bg="gray.50">
                        <Th fontFamily="secondary">Nombre</Th>
                        <Th fontFamily="secondary">Apellido</Th>
                        <Th fontFamily="secondary">Email</Th>
                        <Th fontFamily="secondary">Fecha y hora</Th>
                        <Th isNumeric fontFamily="secondary">Cant.</Th>
                        <Th fontFamily="secondary">Monto</Th>
                        <Th fontFamily="secondary">Medio de pago</Th>
                        <Th fontFamily="secondary">Evento</Th>
                        <Th fontFamily="secondary">Entrada</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {(stats?.sales ?? []).map((sale) => (
                        <Tr key={sale._id} _hover={{ bg: "gray.50" }}>
                          <Td fontWeight="500">{sale.firstName || "—"}</Td>
                          <Td>{sale.lastName || "—"}</Td>
                          <Td fontSize="sm">{sale.email || "—"}</Td>
                          <Td whiteSpace="nowrap" fontSize="sm">
                            {formatDate(sale.date)}
                          </Td>
                          <Td isNumeric>{sale.quantity ?? "—"}</Td>
                          <Td whiteSpace="nowrap">{formatMoney(sale.totalAmount)}</Td>
                          <Td>
                            <Badge
                              colorScheme={sale.paymentMethod === "mercadopago" ? "blue" : sale.paymentMethod === "cbu" ? "teal" : "purple"}
                              fontSize="xs"
                            >
                              {PAYMENT_METHOD_LABELS[sale.paymentMethod] ?? sale.paymentMethod ?? "—"}
                            </Badge>
                          </Td>
                          <Td fontSize="sm" maxW="120px" isTruncated title={sale.eventTitle}>
                            {sale.eventTitle || "—"}
                          </Td>
                          <Td fontSize="sm">{sale.ticketTitle || "—"}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Box py={8} textAlign="center" color="gray.500">
                  <Text>Aún no hay compras registradas para tus eventos.</Text>
                </Box>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default SellerDashboard;
