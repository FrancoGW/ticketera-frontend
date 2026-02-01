import React from "react";
import { 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Box,
  VStack,
  HStack,
  SimpleGrid,
  Avatar,
  Icon,
  Image,
  useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { 
  FiTrendingUp,
  FiZap,
  FiGlobe,
  FiCheck
} from "react-icons/fi";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Componente de pelotitas flotantes animadas
const FloatingBubbles = () => {
  const bubbles = [
    { size: 20, x: "10%", y: "20%", duration: 6, delay: 0 },
    { size: 35, x: "80%", y: "15%", duration: 8, delay: 1 },
    { size: 15, x: "70%", y: "70%", duration: 5, delay: 0.5 },
    { size: 28, x: "20%", y: "75%", duration: 7, delay: 2 },
    { size: 12, x: "50%", y: "10%", duration: 4, delay: 1.5 },
    { size: 25, x: "90%", y: "50%", duration: 9, delay: 0.8 },
    { size: 18, x: "5%", y: "50%", duration: 6, delay: 2.5 },
    { size: 10, x: "40%", y: "80%", duration: 5, delay: 3 },
    { size: 22, x: "60%", y: "30%", duration: 7, delay: 1.2 },
    { size: 14, x: "30%", y: "45%", duration: 6, delay: 0.3 },
    { size: 30, x: "85%", y: "85%", duration: 8, delay: 2.2 },
    { size: 16, x: "15%", y: "60%", duration: 5, delay: 1.8 },
  ];

  return (
    <>
      {bubbles.map((bubble, index) => (
        <motion.div
          key={index}
          style={{
            position: "absolute",
            left: bubble.x,
            top: bubble.y,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            borderRadius: "50%",
            backgroundColor: "#B78DEA",
            opacity: 0.25,
            filter: "blur(1px)",
          }}
          animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 15, 0, -15, 0],
            scale: [1, 1.2, 1, 0.8, 1],
            opacity: [0.25, 0.35, 0.25, 0.15, 0.25],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: bubble.delay,
          }}
        />
      ))}
    </>
  );
};

function Nosotros() {
  const bgGradient = useColorModeValue(
    "linear(to-br, gray.50, white)",
    "linear(to-br, gray.900, gray.800)"
  );

  return (
    <Box minH="100vh" bg="white">
      <Header />
      
      {/* Hero Section */}
      <MotionBox
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        bgGradient="linear(to-br, #000, #1a1a1a)"
        color="white"
        py={{ base: 20, md: 32 }}
        px={4}
        position="relative"
        overflow="hidden"
      >
        {/* Pelotitas flotantes animadas */}
        <FloatingBubbles />
        
        <Container maxW="6xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
              fontWeight="800"
              letterSpacing="-0.02em"
              lineHeight="1.1"
            >
              Somos GetPass
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              maxW="2xl"
              opacity={0.9}
              fontWeight="300"
              lineHeight="1.6"
            >
              La plataforma de eventos que está transformando la forma en que 
              las personas crean, gestionan y disfrutan de experiencias inolvidables.
            </Text>
          </VStack>
        </Container>
      </MotionBox>

      {/* Sobre GetPass Section */}
      <Container maxW="6xl" py={{ base: 16, md: 24 }} px={4}>
        <MotionBox
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
        >
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center" maxW="3xl">
              <Heading
                as="h2"
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="700"
                letterSpacing="-0.01em"
              >
                ¿Qué es GetPass?
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="gray.600"
                lineHeight="1.8"
              >
                GetPass es una plataforma integral de gestión de eventos que permite 
                crear, buscar, compartir y asistir a todo tipo de experiencias. Desde 
                festivales de música hasta conferencias, workshops, eventos deportivos 
                y mucho más.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="100%">
              <MotionBox
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                p={8}
                borderRadius="2xl"
                bg="gray.50"
                _hover={{ 
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                  transition: "all 0.3s"
                }}
              >
                <Icon as={FiZap} boxSize={10} color="black" mb={4} />
                <Heading fontSize="xl" fontWeight="600" mb={3}>
                  Fácil de Usar
                </Heading>
                <Text color="gray.600" lineHeight="1.7">
                  Crea tu evento en minutos con nuestra interfaz intuitiva. 
                  Gestiona entradas, butacas y consumiciones desde un solo lugar.
                </Text>
              </MotionBox>

              <MotionBox
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                p={8}
                borderRadius="2xl"
                bg="gray.50"
                _hover={{ 
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                  transition: "all 0.3s"
                }}
              >
                <Icon as={FiTrendingUp} boxSize={10} color="black" mb={4} />
                <Heading fontSize="xl" fontWeight="600" mb={3}>
                  Pago Inmediato
                </Heading>
                <Text color="gray.600" lineHeight="1.7">
                  Recibe el 100% de tus ventas al instante. Sin comisiones ocultas, 
                  sin esperas. Tu dinero en tu cuenta inmediatamente.
                </Text>
              </MotionBox>

              <MotionBox
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                p={8}
                borderRadius="2xl"
                bg="gray.50"
                _hover={{ 
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                  transition: "all 0.3s"
                }}
              >
                <Icon as={FiGlobe} boxSize={10} color="black" mb={4} />
                <Heading fontSize="xl" fontWeight="600" mb={3}>
                  Alcance Global
                </Heading>
                <Text color="gray.600" lineHeight="1.7">
                  Llega a audiencias de todo el mundo. Comparte tus eventos y 
                  conecta con asistentes de cualquier lugar.
                </Text>
              </MotionBox>
            </SimpleGrid>

            {/* Formas de venta (alineado con /vender) */}
            <VStack spacing={6} w="100%" pt={8}>
              <Heading
                as="h3"
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight="700"
                letterSpacing="-0.01em"
                textAlign="center"
              >
                Formas de venta
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="gray.600"
                lineHeight="1.8"
                textAlign="center"
                maxW="2xl"
              >
                Tres opciones para que cobres como prefieras: SIMPLE, FAST y CUSTOM.
              </Text>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="100%" pt={4}>
              {[
                {
                  planName: "SIMPLE",
                  title: "Depósito Directo",
                  priceLabel: "Directo a tu CBU",
                  priceSubtext: "Suscripción GetPass, para pequeños eventos",
                  topBadge: null,
                  iconType: "emoji",
                  emoji: "🏦",
                  description: "Configurá tu CBU y recibí pagos directamente en tu cuenta bancaria.",
                  features: ["CBU o alias para recibir", "Depósito automático", "Sin cargo por servicio para tus clientes"],
                  borderColor: "#B78DEA",
                  bg: "white",
                },
                {
                  planName: "FAST",
                  title: "Mercado Pago",
                  priceLabel: "Sin cargo",
                  priceSubtext: "Solo comisión estándar MP",
                  topBadge: "Popular",
                  iconType: "logo",
                  logoSrc: "/assets/img/mercadopago.png",
                  description: "Pagos instantáneos y seguros. Conectá tu cuenta y empezá a vender ya.",
                  features: ["Pagos al instante", "Requiere cuenta de Mercado Pago", "La opción más rápida"],
                  borderColor: "#B78DEA",
                  bg: "white",
                },
                {
                  planName: "CUSTOM",
                  title: "A tu medida",
                  priceLabel: "Entradas desde",
                  priceSubtext: "ARS 119.99 c/u",
                  topBadge: "Próximamente",
                  iconType: "emoji",
                  emoji: "🎟️",
                  description: "Selecciona cuántas entradas querés vender, pagá, vendé!",
                  features: ["Compra paquetes de GP-COINS", "Un GP-COIN = 1 Entrada", "Varios métodos de pago", "Sin cargo por servicio para tus clientes"],
                  borderColor: "gray.300",
                  bg: "gray.50",
                },
              ].map((plan) => (
                <MotionBox
                  key={plan.planName}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  p={6}
                  borderRadius="xl"
                  bg={plan.bg}
                  border="2px solid"
                  borderColor={plan.borderColor}
                  position="relative"
                  h="100%"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "lg",
                    transition: "all 0.3s",
                  }}
                >
                  {plan.topBadge && (
                    <Box
                      position="absolute"
                      top={-3}
                      right={4}
                      bg={plan.topBadge === "Popular" ? "#B78DEA" : "gray.500"}
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                    >
                      {plan.topBadge}
                    </Box>
                  )}
                  <Flex align="center" gap={4} mb={4}>
                    <Flex
                      w="56px"
                      h="56px"
                      borderRadius="xl"
                      bg={plan.topBadge === "Popular" ? "purple.50" : "gray.100"}
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      {plan.iconType === "logo" ? (
                        <Image
                          src={plan.logoSrc}
                          alt={plan.title}
                          maxW="44px"
                          maxH="44px"
                          objectFit="contain"
                        />
                      ) : (
                        <Text fontSize="2xl">{plan.emoji}</Text>
                      )}
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="800" letterSpacing="wider" color="gray.700">
                        {plan.planName}
                      </Text>
                      <Heading fontSize="lg" fontWeight="600" color="black">
                        {plan.title}
                      </Heading>
                    </VStack>
                  </Flex>
                  <Text fontWeight="700" fontSize="md" color="gray.800" mb={1}>
                    {plan.priceLabel}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={3}>
                    {plan.priceSubtext}
                  </Text>
                  <Text fontSize="sm" color="gray.600" lineHeight="1.6" mb={4}>
                    {plan.description}
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <HStack key={i} spacing={2} align="center">
                        <Icon as={FiCheck} color="#B78DEA" boxSize={4} />
                        <Text fontSize="sm" color="gray.600">
                          {feature}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </MotionBox>
              ))}
              </SimpleGrid>
            </VStack>
          </VStack>
        </MotionBox>
      </Container>

      {/* Equipo Section */}
      <Box bg="black" color="white" py={{ base: 16, md: 24 }}>
        <Container maxW="6xl" px={4}>
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <VStack spacing={12}>
              <VStack spacing={4} textAlign="center" maxW="3xl">
                <Heading
                  as="h2"
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="700"
                  letterSpacing="-0.01em"
                >
                  Conoce a Nuestro Equipo
                </Heading>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  opacity={0.8}
                  lineHeight="1.8"
                >
                  Un equipo apasionado trabajando juntos para hacer de GetPass 
                  la mejor plataforma de eventos.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8} w="100%">
                {[
                  { 
                    name: "Lautaro Garay", 
                    role: "Founder & FullStack Developer", 
                    image: "/assets/img/lauta.jpeg" 
                  },
                  { 
                    name: "Sebastian Dikowiec", 
                    role: "Co-Founder & System Engineer", 
                    image: "/assets/img/seba-dico.png" 
                  },
                  { 
                    name: "Tobias Cantarella", 
                    role: "Co-Founder & Sales Manager", 
                    image: "/assets/img/pancho.png" 
                  },
                  { 
                    name: "Sebastian Tost", 
                    role: "Co-Founder & Sales Manager", 
                    image: "/assets/img/seba.png" 
                  }
                ].map((member, index) => (
                  <MotionBox
                    key={index}
                    variants={fadeInUp}
                    textAlign="center"
                    _hover={{ 
                      transform: "translateY(-8px)",
                      transition: "all 0.3s"
                    }}
                  >
                    <Avatar
                      size="xl"
                      src={member.image}
                      name={member.name}
                      mb={4}
                      border="4px solid"
                      borderColor="white"
                    />
                    <Heading fontSize="lg" fontWeight="600" mb={1}>
                      {member.name}
                    </Heading>
                    <Text fontSize="sm" opacity={0.7}>
                      {member.role}
                    </Text>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bgGradient="linear(to-r, #000, #1a1a1a)" py={16} px={4}>
        <Container maxW="4xl">
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <VStack spacing={8} textAlign="center" color="white">
              <Heading
                as="h2"
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="700"
              >
                ¿Listo para crear tu próximo evento?
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                opacity={0.9}
                maxW="2xl"
              >
                Únete a miles de organizadores que ya confían en GetPass para 
                hacer realidad sus eventos.
              </Text>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

export default Nosotros;