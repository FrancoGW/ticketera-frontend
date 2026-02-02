import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Icon,
  Flex,
  SimpleGrid,
  Divider,
  Badge,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { FiCreditCard, FiCheck, FiUserPlus, FiEdit3, FiCreditCard as FiPayment, FiArrowRight } from 'react-icons/fi';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const MotionBox = motion(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

const ACCENT = '#B78DEA';
const CARD_BG = '#161616';
const CARD_BG_BLUR = 'rgba(22, 22, 22, 0.6)';
const CARD_BORDER = 'rgba(255,255,255,0.08)';
const CARD_BORDER_ACTIVE = 'rgba(183, 141, 234, 0.5)';
const TEXT_MUTED = 'rgba(255,255,255,0.65)';
const TEXT_WHITE = 'white';

const LandingVender = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateOrganizerAccount = () => {
    if (user) {
      navigate('/seller/new-event');
    } else {
      navigate('/register', { state: { organizer: true } });
    }
  };

  const handleContactAdvisor = () => {
    navigate('/contact');
  };

  const paymentMethods = [
    {
      id: 1,
      planName: 'SIMPLE',
      title: 'Depósito Directo',
      priceLabel: 'Directo a tu CBU',
      priceSubtext: 'Suscripción GetPass, para pequeños eventos',
      topBadge: null,
      iconType: 'emoji',
      emoji: '🏦',
      description: 'Configurá tu CBU y recibí pagos directamente en tu cuenta bancaria.',
      features: [
        'CBU o alias para recibir',
        'Depósito automático',
        'Sin intermediarios de pago',
        'Sin cargo por servicio para tus clientes',
        'Soporte 24hs x WhatsApp',
      ],
      hasButton: true,
      buttonText: 'Hablar con un asesor',
      buttonAction: handleContactAdvisor,
      isActive: false,
    },
    {
      id: 2,
      planName: 'FAST',
      title: 'Mercado Pago',
      priceLabel: 'Sin cargo',
      priceSubtext: 'Solo comisión estándar MP',
      topBadge: 'Popular',
      iconType: 'logo',
      logoSrc: '/assets/img/mercadopago.png',
      description: 'Pagos instantáneos y seguros. Conectá tu cuenta y empezá a vender ya.',
      features: [
        'Pagos al instante',
        'Requiere cuenta de Mercado Pago',
        'La opción más rápida',
        'Soporte 24hs x WhatsApp',
      ],
      hasButton: true,
      buttonText: 'Crear cuenta organizador',
      buttonAction: handleCreateOrganizerAccount,
      isActive: true,
    },
    {
      id: 3,
      planName: 'CUSTOM',
      title: 'A tu medida',
      priceLabel: 'Entradas desde',
      priceSubtext: 'ARS 119.99 c/u',
      topBadge: 'Próximamente',
      iconType: 'emoji',
      emoji: '🎟️',
      description: 'Selecciona cuántas entradas querés vender, pagá, vendé!',
      features: [
        'Compra paquetes de GP-COINS',
        'Un GP-COIN = 1 Entrada',
        'Varios métodos de pago',
        'Sin cargo por servicio para tus clientes',
        'Soporte 24hs x WhatsApp',
      ],
      hasButton: true,
      buttonText: 'Hablar con un asesor',
      buttonAction: handleContactAdvisor,
      isActive: false,
    },
  ];

  return (
    <Box minH="100vh" bg="#000">
      <Header />
      <Container maxW="container.xl" py={12} pt={{ base: 24, md: 28 }} px={{ base: 4, md: 8 }}>
        <MotionBox variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero */}
          <VStack spacing={6} mb={16} textAlign="center">
            <MotionBox variants={itemVariants}>
              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontFamily="secondary"
                fontWeight="bold"
                color={TEXT_WHITE}
                mb={4}
              >
                ¿Cómo vender en GetPass?
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color={TEXT_MUTED} maxW="3xl">
                Tres métodos de pago. Mercado Pago ya está disponible: es el más rápido para empezar a vender.
              </Text>
            </MotionBox>
          </VStack>

          {/* Cómo funciona */}
          <MotionBox variants={itemVariants} mb={20}>
            <VStack spacing={12} align="stretch">
              <VStack spacing={4} textAlign="center">
                <Heading
                  as="h2"
                  fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                  fontFamily="secondary"
                  fontWeight="bold"
                  color={TEXT_WHITE}
                >
                  ¿Cómo funciona?
                </Heading>
                <Text
                  fontSize={{ base: 'md', md: 'lg' }}
                  color={TEXT_MUTED}
                  lineHeight="tall"
                  maxW="3xl"
                  mx="auto"
                >
                  Comenzar a vender tus eventos es más fácil de lo que imaginas. El proceso está diseñado para que puedas tener tu primer evento activo en pocos minutos.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
                {[
                  {
                    number: '01',
                    icon: FiUserPlus,
                    title: 'Registro rápido y sencillo',
                    description: (
                      <>
                        Podés{' '}
                        <Box
                          as="span"
                          color={ACCENT}
                          fontWeight="600"
                          cursor="pointer"
                          onClick={() => navigate('/register', { state: { organizer: true } })}
                          textDecoration="underline"
                          _hover={{ opacity: 0.9 }}
                        >
                          crear tu cuenta de productor ahora mismo
                        </Box>
                        {' '}o registrarte cuando crees tu primer evento. Solo necesitás unos datos básicos.
                      </>
                    ),
                  },
                  {
                    number: '02',
                    icon: FiEdit3,
                    title: 'Configuración intuitiva',
                    description: 'Conectás Mercado Pago y completás los datos de tu evento: nombre, descripción, fechas, precios y ubicación. La interfaz te guía en cada paso.',
                  },
                  {
                    number: '03',
                    icon: FiPayment,
                    title: 'Vinculación y publicación',
                    description: 'Vinculás tu cuenta de Mercado Pago con un solo clic. Tu evento queda publicado y disponible para la venta. Depósito directo y Tokens llegarán pronto.',
                  },
                ].map((step, index) => (
                  <MotionBox key={index} variants={itemVariants}>
                    <Box
                      bg={CARD_BG}
                      borderRadius="2xl"
                      p={{ base: 6, md: 8 }}
                      border="1px solid"
                      borderColor={CARD_BORDER}
                      h="100%"
                      display="flex"
                      flexDirection="column"
                      position="relative"
                      overflow="hidden"
                      _hover={{
                        borderColor: 'whiteAlpha.200',
                        boxShadow: '0 0 0 1px rgba(255,255,255,0.06)',
                      }}
                      transition="all 0.3s ease"
                    >
                      <Box
                        position="absolute"
                        top={4}
                        right={4}
                        fontSize="5xl"
                        fontWeight="900"
                        color="whiteAlpha.06"
                        lineHeight="1"
                        fontFamily="mono"
                        zIndex={0}
                      >
                        {step.number}
                      </Box>
                      <VStack spacing={5} align="flex-start" position="relative" zIndex={1}>
                        <Box
                          p={4}
                          borderRadius="xl"
                          bgGradient="linear(135deg, #B78DEA 0%, #9d6dd8 100%)"
                          color="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          _hover={{ transform: 'scale(1.05)' }}
                          transition="transform 0.3s"
                        >
                          <Icon as={step.icon} boxSize={7} />
                        </Box>
                        <VStack spacing={3} align="flex-start" flex={1}>
                          <Heading
                            as="h3"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontFamily="secondary"
                            fontWeight="bold"
                            color={TEXT_WHITE}
                            lineHeight="shorter"
                          >
                            {step.title}
                          </Heading>
                          <Text fontSize={{ base: 'sm', md: 'md' }} color={TEXT_MUTED} lineHeight="tall">
                            {step.description}
                          </Text>
                        </VStack>
                      </VStack>
                    </Box>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>

          {/* Métodos de venta */}
          <MotionBox variants={itemVariants} mb={16}>
            <VStack spacing={10} mb={10}>
              <Heading
                as="h2"
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontFamily="secondary"
                fontWeight="bold"
                color={TEXT_WHITE}
                textAlign="center"
              >
                Elige tu método de venta
              </Heading>
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color={TEXT_MUTED}
                textAlign="center"
                maxW="2xl"
              >
                Los mismos métodos que en GetPass. Mercado Pago está activo y es la forma más rápida de cobrar.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }} alignItems="stretch">
              {paymentMethods.map((method) => (
                <MotionBox
                  key={method.id}
                  variants={itemVariants}
                  transform={method.isActive ? { base: 'none', md: 'scale(1.02)' } : undefined}
                  zIndex={method.isActive ? 1 : 0}
                  position="relative"
                >
                  <Card
                    bg={CARD_BG_BLUR}
                    sx={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
                    borderRadius="2xl"
                    overflow="visible"
                    border="1px solid"
                    borderColor={method.isActive ? ACCENT : CARD_BORDER}
                    position="relative"
                    h="100%"
                    display="flex"
                    flexDirection="column"
                    boxShadow={
                      method.isActive
                        ? `0 8px 32px ${ACCENT}30, 0 0 0 1px ${ACCENT}40`
                        : '0 4px 24px rgba(0,0,0,0.4)'
                    }
                    _hover={{
                      borderColor: method.isActive ? ACCENT : 'whiteAlpha.2',
                      boxShadow: method.isActive
                        ? `0 12px 40px ${ACCENT}35, 0 0 0 1px ${ACCENT}50`
                        : '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
                    }}
                    transition="all 0.3s ease"
                  >
                    {/* Badge arriba (Popular o Próximamente) */}
                    {method.topBadge && (
                      <Flex justify="center" position="absolute" top={-4} left={0} right={0} zIndex={2}>
                        <Badge
                          bg={method.topBadge === 'Popular' ? ACCENT : 'whiteAlpha.300'}
                          color={method.topBadge === 'Popular' ? 'white' : 'whiteAlpha.800'}
                          fontSize="xs"
                          fontWeight="700"
                          px={5}
                          py={2}
                          borderRadius="full"
                          textTransform="uppercase"
                          letterSpacing="wider"
                          boxShadow={method.topBadge === 'Popular' ? `0 4px 16px ${ACCENT}60` : '0 4px 16px rgba(0,0,0,0.3)'}
                        >
                          {method.topBadge}
                        </Badge>
                      </Flex>
                    )}

                    <CardBody
                      p={{ base: 6, md: 8 }}
                      pt={method.topBadge ? 8 : 6}
                      position="relative"
                      zIndex={1}
                      flex={1}
                      display="flex"
                      flexDirection="column"
                    >
                      <VStack spacing={6} align="stretch" h="100%" flex={1}>
                        {/* Header: icono + nombre del plan */}
                        <Flex align="center" gap={4}>
                          <Box
                            boxSize="56px"
                            borderRadius="xl"
                            bg={method.isActive ? `${ACCENT}20` : 'whiteAlpha.06'}
                            border="1px solid"
                            borderColor={method.isActive ? `${ACCENT}40` : 'whiteAlpha.08'}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            flexShrink={0}
                          >
                            {method.iconType === 'logo' ? (
                              <Image
                                src={method.logoSrc}
                                alt={method.title}
                                maxW="44px"
                                maxH="44px"
                                w="auto"
                                h="auto"
                                objectFit="contain"
                                mx="auto"
                              />
                            ) : (
                              <Text fontSize="2xl" opacity={0.95} textAlign="center">{method.emoji}</Text>
                            )}
                          </Box>
                          <Text
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="800"
                            color={method.isActive ? ACCENT : TEXT_WHITE}
                            letterSpacing="wider"
                          >
                            {method.planName}
                          </Text>
                        </Flex>

                        {/* Título */}
                        <Heading
                          as="h3"
                          fontSize={{ base: 'lg', md: 'xl' }}
                          fontFamily="secondary"
                          fontWeight="bold"
                          color={TEXT_WHITE}
                          lineHeight="shorter"
                        >
                          {method.title}
                        </Heading>

                        {/* Precio / valor (estilo pricing) */}
                        <Box>
                          <Text
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontWeight="800"
                            color={method.isActive ? ACCENT : TEXT_WHITE}
                            lineHeight="1"
                            letterSpacing="tight"
                          >
                            {method.priceLabel}
                          </Text>
                          <Text color={TEXT_MUTED} fontSize="sm" mt={1}>
                            {method.priceSubtext}
                          </Text>
                        </Box>

                        <Text color={TEXT_MUTED} lineHeight="tall" fontSize="sm" flexShrink={0}>
                          {method.description}
                        </Text>

                        <Divider borderColor="whiteAlpha.12" />

                        {/* Lista de features */}
                        <VStack spacing={3} align="stretch" flex={1}>
                          {method.features.map((feature, idx) => (
                            <HStack key={idx} spacing={3} align="center">
                              <Flex
                                boxSize={5}
                                borderRadius="full"
                                bg={method.isActive ? ACCENT : 'whiteAlpha.2'}
                                align="center"
                                justify="center"
                                flexShrink={0}
                              >
                                <Icon as={FiCheck} boxSize={3} color="white" />
                              </Flex>
                              <Text
                                color={TEXT_MUTED}
                                fontSize="sm"
                                fontWeight="500"
                                flex={1}
                                lineHeight="tall"
                              >
                                {feature}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>

                        {/* CTA */}
                        {method.hasButton && (
                          <Button
                            mt="auto"
                            pt={2}
                            bg={method.buttonText === 'Hablar con un asesor' ? 'transparent' : ACCENT}
                            color="white"
                            size="lg"
                            fontWeight="700"
                            fontSize="sm"
                            py={6}
                            borderRadius="xl"
                            rightIcon={method.buttonText === 'Hablar con un asesor' ? undefined : <FiArrowRight />}
                            border={method.buttonText === 'Hablar con un asesor' ? '2px solid' : 'none'}
                            borderColor="whiteAlpha.3"
                            _hover={{
                              bg: method.buttonText === 'Hablar con un asesor' ? 'whiteAlpha.08' : '#9d6dd8',
                              borderColor: method.buttonText === 'Hablar con un asesor' ? 'whiteAlpha.4' : undefined,
                              transform: 'translateY(-2px)',
                              boxShadow: method.buttonText === 'Hablar con un asesor' ? 'none' : `0 8px 24px ${ACCENT}40`,
                            }}
                            _active={{ transform: 'translateY(0)' }}
                            transition="all 0.3s ease"
                            onClick={method.buttonAction}
                            w="100%"
                          >
                            {method.buttonText}
                          </Button>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionBox>

          {/* Soporte WhatsApp */}
          <MotionBox variants={itemVariants} mb={12}>
            <Box
              bg={CARD_BG}
              borderRadius="2xl"
              border="1px solid"
              borderColor="whiteAlpha.1"
              overflow="hidden"
              position="relative"
              _hover={{
                borderColor: 'rgba(37, 211, 102, 0.3)',
                boxShadow: '0 0 30px rgba(37, 211, 102, 0.08)',
              }}
              transition="all 0.3s"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="3px"
                bgGradient="linear(to-r, #25D366, #128C7E)"
              />
              <Box p={8}>
                <HStack
                  spacing={6}
                  justify={{ base: 'center', md: 'flex-start' }}
                  flexWrap="wrap"
                  align="center"
                >
                  <Box
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    bgGradient="linear(to-br, #25D366, #128C7E)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 4px 20px rgba(37, 211, 102, 0.35)"
                    _hover={{ transform: 'scale(1.05)' }}
                    transition="transform 0.3s"
                  >
                    <Box as="i" className="fab fa-whatsapp" fontSize="32px" color="white" />
                  </Box>
                  <VStack spacing={2} align={{ base: 'center', md: 'flex-start' }} flex={1} minW="200px">
                    <Heading as="h3" fontSize="2xl" fontFamily="secondary" fontWeight="bold" color={TEXT_WHITE}>
                      Soporte 24hs x WhatsApp
                    </Heading>
                    <Text
                      color={TEXT_MUTED}
                      textAlign={{ base: 'center', md: 'left' }}
                      fontSize="md"
                      maxW="500px"
                    >
                      Todas nuestras opciones incluyen soporte dedicado las 24 horas del día
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </Box>
          </MotionBox>
        </MotionBox>
      </Container>
      <Footer />
    </Box>
  );
};

export default LandingVender;
