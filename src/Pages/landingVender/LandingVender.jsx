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
  useColorModeValue,
  SimpleGrid,
  Divider,
  Badge,
  Image,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { FiDollarSign, FiCreditCard, FiSettings, FiCheck, FiUserPlus, FiEdit3, FiCreditCard as FiPayment, FiArrowRight } from 'react-icons/fi';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

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

const LandingVender = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const bgGradient = useColorModeValue(
    'linear(to-b, gray.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );

  const handleCreateOrganizerAccount = () => {
    if (user) {
      navigate('/seller/new-event');
    } else {
      navigate('/register');
    }
  };

  const handleContactAdvisor = () => {
    navigate('/contact');
  };

  const plans = [
    {
      id: 1,
      title: 'Holding',
      icon: FiDollarSign,
      description: 'Nosotros nos hacemos cargo de los ingresos de tu evento y hacemos el depósito del dinero a una cuenta bancaria.',
      features: [
        'Gestión completa de ingresos',
        'Depósito automático a cuenta bancaria',
        'Sin preocupaciones administrativas',
        'Soporte 24hs x WhatsApp',
      ],
      hasButton: true,
      buttonText: 'Hablar con un asesor',
      buttonAction: handleContactAdvisor,
    },
    {
      id: 2,
      title: 'Forma Directa',
      icon: FiCreditCard,
      description: 'Te registras como organizador de eventos, conectas tu cuenta de Mercado Pago, generas tickets y empiezas a vender.',
      features: [
        'Control total de tus ventas',
        'Integración con Mercado Pago',
        'Gestión autónoma',
        'Soporte 24hs x WhatsApp',
      ],
      hasButton: true,
      buttonText: 'Crear cuenta organizador',
      buttonAction: handleCreateOrganizerAccount,
    },
    {
      id: 3,
      title: 'A Medida',
      icon: FiSettings,
      description: 'Si necesitas vender butacas o mesas, podemos ayudarte a generar tu evento personalizado con cualquiera de los dos métodos de cobranza.',
      features: [
        'Solución personalizada',
        'Butacas y mesas',
        'Elige tu método de cobro',
        'Soporte 24hs x WhatsApp',
      ],
      hasButton: true,
      buttonText: 'Hablar con un asesor',
      buttonAction: handleContactAdvisor,
    },
  ];

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Header />
      <Container maxW="container.xl" py={12} mt="80px">
        <MotionBox variants={containerVariants} initial="hidden" animate="visible">
          {/* Hero Section */}
          <VStack spacing={6} mb={12} textAlign="center">
            <MotionBox variants={itemVariants}>
              <Heading
                as="h1"
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
                fontFamily="secondary"
                fontWeight="bold"
                color="primary"
                mb={4}
              >
                ¿Cómo vender en GetPass?
              </Heading>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" maxW="3xl">
                Ofrecemos 3 formas de vender tus eventos. Elige la que mejor se adapte a tus necesidades.
              </Text>
            </MotionBox>
          </VStack>

          {/* How It Works Section */}
          <MotionBox variants={itemVariants} mb={16}>
            <VStack spacing={10} align="stretch">
              <VStack spacing={4} textAlign="center">
                <Heading
                  as="h2"
                  fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                  fontFamily="secondary"
                  fontWeight="bold"
                  color="primary"
                >
                  ¿Cómo funciona?
                </Heading>
                <Text 
                  fontSize={{ base: 'md', md: 'lg' }} 
                  color="gray.600" 
                  lineHeight="tall"
                  maxW="3xl"
                  mx="auto"
                >
                  Comenzar a vender tus eventos es más fácil de lo que imaginas. El proceso está diseñado para que puedas tener tu primer evento activo en pocos minutos, sin complicaciones técnicas ni trámites burocráticos.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }} mt={4}>
                {[
                  {
                    number: '01',
                    icon: FiUserPlus,
                    title: 'Registro rápido y sencillo',
                    description: (
                      <>
                        Podés{' '}
                        <Box as="span" color="purple.600" fontWeight="600" cursor="pointer" 
                          onClick={() => navigate('/producers')} textDecoration="underline"
                          _hover={{ color: 'purple.700' }}>
                          crear tu cuenta de productor ahora mismo
                        </Box>
                        {' '}o registrarte directamente cuando crees tu primer evento. Solo necesitás unos datos básicos y estás listo para comenzar.
                      </>
                    ),
                    gradient: 'linear-gradient(135deg, #b78dea 0%, #9d6dd8 100%)',
                  },
                  {
                    number: '02',
                    icon: FiEdit3,
                    title: 'Configuración intuitiva',
                    description: 'Una vez dentro de la plataforma, elegís el método de cobranza que prefieras (Holding o Forma Directa) y completás los datos de tu evento: nombre, descripción, fechas, precios y ubicación. Nuestra interfaz te guía en cada paso.',
                    gradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                  },
                  {
                    number: '03',
                    icon: FiPayment,
                    title: 'Vinculación de pagos y publicación',
                    description: 'Si elegiste la Forma Directa, vinculás tu cuenta de Mercado Pago con un solo clic. Si preferiste Holding, ingresás tu CBU o alias para recibir los depósitos. ¡Y listo! Tu evento ya está publicado y disponible para la venta.',
                    gradient: 'linear-gradient(135deg, #38b2ac 0%, #319795 100%)',
                  },
                ].map((step, index) => (
                  <MotionBox
                    key={index}
                    variants={itemVariants}
                    position="relative"
                  >
                    <Box
                      bg="white"
                      borderRadius="2xl"
                      p={{ base: 6, md: 8 }}
                      boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
                      border="1px solid"
                      borderColor="gray.100"
                      h="100%"
                      display="flex"
                      flexDirection="column"
                      position="relative"
                      overflow="hidden"
                      _hover={{
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                        borderColor: 'gray.200',
                      }}
                      transition="all 0.3s ease"
                    >
                      {/* Number Badge */}
                      <Box
                        position="absolute"
                        top={4}
                        right={4}
                        fontSize="6xl"
                        fontWeight="900"
                        color="gray.100"
                        lineHeight="1"
                        fontFamily="mono"
                        zIndex={0}
                      >
                        {step.number}
                      </Box>

                      <VStack spacing={5} align="flex-start" position="relative" zIndex={1}>
                        {/* Icon */}
                        <Box
                          p={4}
                          borderRadius="xl"
                          bgGradient={step.gradient}
                          color="white"
                          boxShadow="lg"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          _hover={{
                            transform: 'scale(1.1) rotate(5deg)',
                          }}
                          transition="all 0.3s ease"
                        >
                          <Icon as={step.icon} boxSize={7} />
                        </Box>

                        {/* Content */}
                        <VStack spacing={3} align="flex-start" flex="1">
                          <Heading
                            as="h3"
                            fontSize={{ base: 'xl', md: '2xl' }}
                            fontFamily="secondary"
                            fontWeight="bold"
                            color="gray.800"
                            lineHeight="shorter"
                          >
                            {step.title}
                          </Heading>
                          <Text 
                            fontSize={{ base: 'sm', md: 'md' }} 
                            color="gray.600" 
                            lineHeight="tall"
                          >
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

          {/* Plans Grid */}
          <MotionBox variants={itemVariants} mb={12}>
            <VStack spacing={10} mb={10}>
              <Heading
                as="h2"
                fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
                fontFamily="secondary"
                fontWeight="bold"
                color="primary"
                textAlign="center"
              >
                Elige tu método de venta
              </Heading>
              <Text 
                fontSize={{ base: 'md', md: 'lg' }} 
                color="gray.600" 
                textAlign="center"
                maxW="2xl"
              >
                Tres opciones diseñadas para adaptarse a las necesidades de tu evento, sin importar su tamaño o complejidad.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
              {plans.map((plan, index) => (
                <MotionCard
                  key={plan.id}
                  variants={itemVariants}
                  bg="gray.900"
                  borderRadius="3xl"
                  boxShadow="0 8px 30px rgba(0, 0, 0, 0.5)"
                  overflow="hidden"
                  border="2px solid"
                  borderColor="gray.700"
                  position="relative"
                  h="100%"
                  display="flex"
                  flexDirection="column"
                  _hover={{
                    transform: 'translateY(-16px) scale(1.02)',
                    boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8)`,
                    borderColor: 'gray.600',
                  }}
                  transition="all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  {/* Top Accent Bar */}
                  <Box
                    h="6px"
                    bg="gray.800"
                    w="100%"
                    position="relative"
                    zIndex={1}
                  />
                  
                  <CardBody p={{ base: 6, md: 8 }} position="relative" zIndex={1} flex="1" display="flex" flexDirection="column">
                    <VStack spacing={6} align="stretch" h="100%">
                      {/* Icon & Title Section */}
                      <VStack spacing={4} align="stretch">
                        <Flex justify="space-between" align="flex-start">
                          <Box
                            p={6}
                            borderRadius="2xl"
                            bg="gray.800"
                            color="white"
                            boxShadow="0 8px 24px rgba(0, 0, 0, 0.5)"
                            position="relative"
                            border="2px solid"
                            borderColor="gray.700"
                            _hover={{
                              transform: 'scale(1.1) rotate(5deg)',
                              borderColor: 'gray.600',
                            }}
                            transition="all 0.3s ease"
                          >
                            <Icon as={plan.icon} boxSize={8} />
                          </Box>
                          <Badge
                            bg="gray.800"
                            color="gray.300"
                            fontSize="xs"
                            fontWeight="700"
                            px={3}
                            py={1.5}
                            borderRadius="full"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            border="1px solid"
                            borderColor="gray.700"
                          >
                            {index === 1 ? 'Popular' : `Opción ${index + 1}`}
                          </Badge>
                        </Flex>

                        <Heading
                          as="h3"
                          fontSize={{ base: 'xl', md: '2xl' }}
                          fontFamily="secondary"
                          fontWeight="bold"
                          color="white"
                          lineHeight="shorter"
                          mt={2}
                        >
                          {plan.title}
                        </Heading>
                        
                        <Text 
                          color="gray.400" 
                          lineHeight="tall"
                          fontSize={{ base: 'sm', md: 'md' }}
                          minH="60px"
                        >
                          {plan.description}
                        </Text>
                      </VStack>

                      <Divider borderColor="gray.700" borderWidth="1px" />

                      {/* Features */}
                      <VStack spacing={4} align="stretch" flex="1">
                        <Text 
                          fontSize="sm" 
                          fontWeight="700" 
                          color="gray.500" 
                          textTransform="uppercase"
                          letterSpacing="wide"
                          mb={2}
                        >
                          Incluye:
                        </Text>
                        {plan.features.map((feature, idx) => (
                          <HStack key={idx} spacing={3} align="flex-start">
                            <Box
                              as={motion.div}
                              whileHover={{ scale: 1.3, rotate: 10 }}
                              transition={{ type: "spring", stiffness: 400 }}
                            >
                              <Icon
                                as={FiCheck}
                                boxSize={6}
                                color="gray.400"
                                mt={0.5}
                              />
                            </Box>
                            <Text 
                              color="gray.300" 
                              fontSize={{ base: 'sm', md: 'md' }}
                              fontWeight="500"
                              flex="1"
                              lineHeight="tall"
                            >
                              {feature}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>

                      {/* Button */}
                      {plan.hasButton && (
                        <Button
                          mt={6}
                          bg={plan.buttonText === 'Hablar con un asesor' ? 'blue.500' : 'purple.600'}
                          color="white"
                          size="lg"
                          fontWeight="700"
                          fontSize={{ base: 'sm', md: 'md' }}
                          py={7}
                          borderRadius="xl"
                          rightIcon={plan.buttonText === 'Hablar con un asesor' ? undefined : <FiArrowRight />}
                          boxShadow={plan.buttonText === 'Hablar con un asesor' ? '0 4px 16px rgba(59, 130, 246, 0.4)' : '0 4px 16px rgba(147, 51, 234, 0.4)'}
                          _hover={{
                            bg: plan.buttonText === 'Hablar con un asesor' ? 'blue.600' : 'purple.700',
                            transform: 'translateY(-3px)',
                            boxShadow: plan.buttonText === 'Hablar con un asesor' ? '0 12px 32px rgba(59, 130, 246, 0.6)' : '0 12px 32px rgba(147, 51, 234, 0.6)',
                          }}
                          _active={{
                            transform: 'translateY(-1px)',
                          }}
                          transition="all 0.3s ease"
                          onClick={plan.buttonAction}
                          w="100%"
                        >
                          {plan.buttonText}
                        </Button>
                      )}
                      
                      {!plan.hasButton && (
                        <Box h={10} />
                      )}
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </SimpleGrid>
          </MotionBox>

          {/* Support Section */}
          <MotionBox variants={itemVariants} mb={12}>
            <Card 
              bg="white"
              borderRadius="2xl"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.08)"
              border="2px solid"
              borderColor="green.200"
              overflow="hidden"
              position="relative"
              _hover={{
                boxShadow: '0 8px 30px rgba(37, 211, 102, 0.2)',
                borderColor: 'green.300',
              }}
              transition="all 0.3s"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                h="4px"
                bgGradient="linear(to-r, #25D366, #128C7E)"
              />
              <CardBody p={8}>
                <HStack 
                  spacing={6} 
                  justify={{ base: 'center', md: 'flex-start' }} 
                  flexWrap="wrap"
                  align="center"
                >
                  <Box
                    position="relative"
                    w="64px"
                    h="64px"
                    borderRadius="full"
                    bgGradient="linear(to-br, #25D366, #128C7E)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 4px 15px rgba(37, 211, 102, 0.4)"
                    _hover={{
                      transform: 'scale(1.1) rotate(5deg)',
                    }}
                    transition="all 0.3s"
                  >
                    <Box
                      as="i"
                      className="fab fa-whatsapp"
                      fontSize="32px"
                      color="white"
                    />
                  </Box>
                  <VStack 
                    spacing={2} 
                    align={{ base: 'center', md: 'flex-start' }}
                    flex="1"
                    minW="200px"
                  >
                    <Heading
                      as="h3"
                      fontSize="2xl"
                      fontFamily="secondary"
                      fontWeight="bold"
                      color="gray.800"
                    >
                      Soporte 24hs x WhatsApp
                    </Heading>
                    <Text 
                      color="gray.600" 
                      textAlign={{ base: 'center', md: 'left' }}
                      fontSize="md"
                      maxW="500px"
                    >
                      Todas nuestras opciones incluyen soporte dedicado las 24 horas del día
                    </Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </MotionBox>

        </MotionBox>
      </Container>
      <Footer />
    </Box>
  );
};

export default LandingVender;
