import { Box, Container, Heading, Text, VStack, Card, CardBody, Flex, Badge, Button, Icon } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { FiSettings, FiCreditCard } from "react-icons/fi";
import { RiQrCodeLine } from "react-icons/ri";

const PLAN_INFO = {
  SIMPLE: {
    name: "SIMPLE",
    title: "Depósito Directo",
    description: "Directo a tu CBU. Suscripción GetPass para pequeños eventos.",
    icon: FiCreditCard,
    color: "blue",
  },
  FAST: {
    name: "FAST",
    title: "Mercado Pago",
    description: "Pagos al instante. Solo comisión estándar MP.",
    icon: FiCreditCard,
    color: "purple",
  },
  CUSTOM: {
    name: "CUSTOM",
    title: "A tu medida",
    description: "Entradas desde ARS 119.99 c/u. GP-COINS.",
    icon: RiQrCodeLine,
    color: "teal",
  },
};

const SellerSettings = () => {
  const { data: user } = useSelector((state) => state.user);

  const hasMercadoPago =
    user?.mercadoPago?.hasAuthorized === true || user?.oauth?.mercadoPago?.hasAuthorized === true;

  const currentPlan = hasMercadoPago ? "FAST" : null;
  const planInfo = currentPlan ? PLAN_INFO[currentPlan] : null;

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
              Configuración del organizador
            </Heading>
            <Text fontFamily="secondary" color="gray.600" fontSize="md">
              Forma de venta activa y opciones disponibles
            </Text>
          </Box>

          <Card borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200" overflow="hidden">
            <CardBody p={6}>
              <VStack align="stretch" spacing={6}>
                <Flex align="center" gap={3}>
                  <Box p={3} borderRadius="lg" bg="gray.100" color="gray.600">
                    <FiSettings size={24} />
                  </Box>
                  <Box>
                    <Text fontWeight="700" fontSize="lg" color="gray.800">
                      Forma de venta actual
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      GetPass ofrece 3 opciones: SIMPLE, FAST y CUSTOM
                    </Text>
                  </Box>
                </Flex>

                {planInfo ? (
                  <Card borderRadius="lg" border="2px solid" borderColor={`${planInfo.color}.200`} bg={`${planInfo.color}.50`}>
                    <CardBody p={5}>
                      <Flex align="center" justify="space-between" flexWrap="wrap" gap={4}>
                        <Flex align="center" gap={4}>
                          <Box p={2} borderRadius="lg" bg={`${planInfo.color}.100`} color={`${planInfo.color}.600`}>
                            <Icon as={planInfo.icon} boxSize={7} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Badge colorScheme={planInfo.color} fontSize="sm" mb={1}>
                              {planInfo.name}
                            </Badge>
                            <Text fontWeight="700" fontSize="lg">
                              {planInfo.title}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {planInfo.description}
                            </Text>
                          </VStack>
                        </Flex>
                        <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                          Activo
                        </Badge>
                      </Flex>
                    </CardBody>
                  </Card>
                ) : (
                  <Card borderRadius="lg" border="2px dashed" borderColor="gray.300" bg="gray.50">
                    <CardBody p={6}>
                      <VStack spacing={4}>
                        <Text fontWeight="600" color="gray.600">
                          Aún no tenés configurada una forma de venta
                        </Text>
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          En /vender podés elegir entre SIMPLE (Depósito Directo), FAST (Mercado Pago) o CUSTOM (GP-COINS).
                        </Text>
                        <Button as={RouterLink} to="/vender" colorScheme="primary" size="md">
                          Ver formas de venta
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                )}

                <Box pt={2}>
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    Opciones disponibles
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {Object.entries(PLAN_INFO).map(([key, info]) => (
                      <Flex key={key} align="center" justify="space-between" py={2} px={3} bg="gray.50" borderRadius="md">
                        <Text fontWeight="500" fontSize="sm">
                          {info.name} — {info.title}
                        </Text>
                        {currentPlan === key ? (
                          <Badge colorScheme="green" fontSize="xs">En uso</Badge>
                        ) : (
                          <Badge colorScheme="gray" fontSize="xs">Disponible</Badge>
                        )}
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default SellerSettings;
