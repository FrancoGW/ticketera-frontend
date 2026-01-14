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
  Divider,
  useColorModeValue
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { 
  FiUsers, 
  FiTarget, 
  FiHeart, 
  FiTrendingUp,
  FiAward,
  FiZap,
  FiGlobe
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
      >
        <Container maxW="6xl">
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
          </VStack>
        </MotionBox>
      </Container>

      {/* Trayectoria Section */}
      <Box bg="gray.50" py={{ base: 16, md: 24 }}>
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
                  Nuestra Trayectoria
                </Heading>
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  color="gray.600"
                  lineHeight="1.8"
                >
                  Desde nuestros inicios, hemos trabajado incansablemente para 
                  democratizar el acceso a la gestión de eventos.
                </Text>
              </VStack>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
                {[
                  { year: "2020", title: "Nacimiento", desc: "Fundación de GetPass con la visión de revolucionar la industria de eventos." },
                  { year: "2021", title: "Primeros Eventos", desc: "Lanzamiento de la plataforma y gestión de los primeros eventos exitosos." },
                  { year: "2022", title: "Expansión", desc: "Crecimiento a nivel nacional y miles de eventos gestionados." },
                  { year: "2024", title: "Liderazgo", desc: "Posicionamiento como plataforma líder en gestión de eventos digitales." }
                ].map((milestone, index) => (
                  <MotionBox
                    key={index}
                    variants={fadeInUp}
                    p={6}
                    borderRadius="xl"
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    textAlign="center"
                    _hover={{ 
                      borderColor: "black",
                      transform: "translateY(-4px)",
                      transition: "all 0.3s"
                    }}
                  >
                    <Text fontSize="2xl" fontWeight="700" color="black" mb={2}>
                      {milestone.year}
                    </Text>
                    <Heading fontSize="lg" fontWeight="600" mb={2}>
                      {milestone.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.600" lineHeight="1.6">
                      {milestone.desc}
                    </Text>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Valores Section */}
      <Container maxW="6xl" py={{ base: 16, md: 24 }} px={4}>
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
                Nuestros Valores
              </Heading>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                color="gray.600"
                lineHeight="1.8"
              >
                Los principios que guían cada decisión y acción en GetPass
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="100%">
              {[
                { icon: FiTarget, title: "Excelencia", desc: "Buscamos la perfección en cada detalle de nuestra plataforma." },
                { icon: FiHeart, title: "Pasión", desc: "Amamos lo que hacemos y eso se refleja en nuestro trabajo." },
                { icon: FiUsers, title: "Comunidad", desc: "Construimos una comunidad fuerte y unida alrededor de los eventos." },
                { icon: FiAward, title: "Innovación", desc: "Estamos siempre a la vanguardia de la tecnología y las tendencias." }
              ].map((value, index) => (
                <MotionBox
                  key={index}
                  variants={fadeInUp}
                  p={8}
                  borderRadius="2xl"
                  bg="gray.50"
                  textAlign="center"
                  _hover={{ 
                    bg: "black",
                    color: "white",
                    transform: "translateY(-4px)",
                    transition: "all 0.3s",
                    "& svg": { color: "white" }
                  }}
                >
                  <Icon 
                    as={value.icon} 
                    boxSize={12} 
                    color="black" 
                    mb={4}
                    mx="auto"
                  />
                  <Heading fontSize="xl" fontWeight="600" mb={3}>
                    {value.title}
                  </Heading>
                  <Text fontSize="sm" lineHeight="1.7" opacity={0.8}>
                    {value.desc}
                  </Text>
                </MotionBox>
              ))}
            </SimpleGrid>
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
                  { name: "Equipo GetPass", role: "Fundadores", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=400&fit=crop" },
                  { name: "Equipo GetPass", role: "Desarrollo", image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop" },
                  { name: "Equipo GetPass", role: "Diseño", image: "https://images.unsplash.com/photo-1556155092-8707de31f9c4?w=400&h=400&fit=crop" },
                  { name: "Equipo GetPass", role: "Soporte", image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop" }
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