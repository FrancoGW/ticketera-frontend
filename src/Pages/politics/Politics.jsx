import React from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiFileText, FiShield, FiCreditCard, FiUser, FiAlertCircle } from "react-icons/fi";
import "./style.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const termsSections = [
  {
    id: 1,
    title: "Aceptación de Términos",
    icon: FiFileText,
    content: [
      "Al acceder y utilizar GetPass, usted acepta estar sujeto a estos términos y condiciones de uso.",
      "Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.",
      "GetPass se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación.",
    ],
  },
  {
    id: 2,
    title: "Sobre GetPass",
    icon: FiShield,
    content: [
      "GetPass es una plataforma digital especializada en la comercialización de entradas digitales para eventos.",
      "Actuamos como intermediarios entre los organizadores de eventos y el público en general.",
      "Para utilizar GetPass, usted declara ser mayor de edad o, en caso contrario, contar con el consentimiento de un tutor autorizado.",
    ],
  },
  {
    id: 3,
    title: "Responsabilidades del Organizador",
    icon: FiUser,
    content: [
      "El ORGANIZADOR es responsable de los precios fijados por ingreso y la organización, producción y correcta ejecución del evento.",
      "GetPass no asume garantías por los temas anteriormente citados.",
      "El ORGANIZADOR es el encargado de agregar, modificar o quitar información sobre el evento (artistas, precio de las entradas, capacidad, ubicación, predio, edad mínima permitida).",
      "El ORGANIZADOR se reserva el derecho de admisión y permanencia.",
    ],
  },
  {
    id: 4,
    title: "Política de Devoluciones",
    icon: FiCreditCard,
    content: [
      "GetPass no realiza devoluciones una vez finalizado el proceso de compra.",
      "El cliente es responsable de prestar atención en el transcurso de selección de fecha, ubicación, sector, tipo de evento y más.",
      "Si el evento es modificado, reprogramado o cancelado, la devolución del dinero es exclusiva responsabilidad del ORGANIZADOR.",
      "En caso de suspensión del evento, los montos devueltos por el ORGANIZADOR no incluirán la comisión de GetPass (15% del costo del servicio).",
    ],
  },
  {
    id: 5,
    title: "Proceso de Compra",
    icon: FiCreditCard,
    content: [
      "La confirmación de la compra realizada está sujeta a la autorización de la empresa emisora de la tarjeta.",
      "El COMPRADOR es responsable de aceptar y confirmar los términos y condiciones antes de completar la compra.",
      "Al adquirir la entrada a través de GetPass recibirá en su correo registrado o podrá descargar de la página un código QR único que será la entrada al evento.",
    ],
  },
  {
    id: 6,
    title: "Responsabilidades del Comprador",
    icon: FiAlertCircle,
    content: [
      "Cuando reciba o descargue sus tickets, el COMPRADOR es responsable de guardarlo en un lugar seguro.",
      "GetPass no realiza cambios si estos han sido robados o extraviados.",
      "Los únicos tickets digitales válidos para el ingreso al evento son los adquiridos a través de GetPass.",
      "Evite reventa, compra de tickets robados y/o falsificaciones.",
    ],
  },
];

function Politics() {
  return (
    <>
      <Header />
      <Box
        minH="calc(100vh - 80px)"
        bgGradient="linear(to-br, #000, #1a1a1a)"
        position="relative"
        overflow="hidden"
        pt={{ base: "6rem", md: "7rem", lg: "8rem" }}
        pb={{ base: 8, md: 16 }}
      >
        {/* Background Pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.05"
          backgroundImage="radial-gradient(circle at 2px 2px, white 1px, transparent 0)"
          backgroundSize="40px 40px"
        />

        <Container maxW="container.xl" px={4} position="relative" zIndex={1}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header Section */}
            <motion.div variants={itemVariants}>
              <VStack 
                spacing={{ base: 3, md: 4 }} 
                align="center" 
                mb={{ base: 8, md: 12 }} 
                textAlign="center"
                px={{ base: 2, md: 0 }}
              >
                <Heading
                  as="h1"
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl", lg: "5xl" }}
                  color="white"
                  fontWeight="800"
                  letterSpacing="-0.02em"
                  lineHeight="1.2"
                  px={{ base: 2, md: 0 }}
                >
                  Términos y{" "}
                  <Text as="span" color="#b78dea">
                    Condiciones
                  </Text>
                </Heading>
                <Text
                  fontSize={{ base: "sm", md: "md", lg: "lg" }}
                  color="rgba(255, 255, 255, 0.7)"
                  maxW="600px"
                  lineHeight="1.6"
                  px={{ base: 4, md: 0 }}
                >
                  Última actualización: {new Date().toLocaleDateString("es-AR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </VStack>
            </motion.div>

            {/* Terms Sections */}
            <VStack spacing={8} align="stretch">
              {termsSections.map((section, index) => {
                const IconComponent = section.icon;
                return (
                  <motion.div key={section.id} variants={itemVariants}>
                    <Box
                      bg="rgba(255, 255, 255, 0.05)"
                      border="1px solid"
                      borderColor="rgba(255, 255, 255, 0.1)"
                      borderRadius="2xl"
                      p={{ base: 6, md: 8 }}
                      _hover={{
                        bg: "rgba(255, 255, 255, 0.08)",
                        borderColor: "rgba(255, 255, 255, 0.2)",
                      }}
                      transition="all 0.3s"
                    >
                      <HStack 
                        spacing={{ base: 3, md: 4 }} 
                        mb={{ base: 4, md: 6 }} 
                        align="flex-start"
                        flexWrap={{ base: "wrap", sm: "nowrap" }}
                      >
                        <Box
                          bg="#b78dea"
                          color="white"
                          p={{ base: 2, md: 3 }}
                          borderRadius="lg"
                          flexShrink={0}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon 
                            as={IconComponent} 
                            boxSize={{ base: 5, md: 6 }}
                          />
                        </Box>
                        <Heading
                          as="h2"
                          fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
                          color="white"
                          fontWeight="700"
                          fontFamily="secondary"
                          lineHeight="1.3"
                        >
                          {section.title}
                        </Heading>
                      </HStack>
                      <VStack 
                        spacing={{ base: 3, md: 4 }} 
                        align="stretch" 
                        pl={{ base: 0, sm: 12, md: 16 }}
                      >
                        {section.content.map((paragraph, pIndex) => (
                          <Flex key={pIndex} align="flex-start" gap={3}>
                            <Box
                              w="6px"
                              h="6px"
                              borderRadius="full"
                              bg="#b78dea"
                              mt={2}
                              flexShrink={0}
                            />
                            <Text
                              color="rgba(255, 255, 255, 0.8)"
                              fontSize={{ base: "sm", md: "md" }}
                              lineHeight="1.7"
                              fontFamily="secondary"
                            >
                              {paragraph}
                            </Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Box>
                  </motion.div>
                );
              })}
            </VStack>

            {/* Important Notice */}
            <motion.div variants={itemVariants}>
              <Box
                mt={{ base: 8, md: 12 }}
                p={{ base: 4, md: 6 }}
                bg="rgba(183, 141, 234, 0.1)"
                border="2px solid"
                borderColor="#b78dea"
                borderRadius="xl"
                mx={{ base: 2, md: 0 }}
              >
                <HStack spacing={3} mb={3} flexWrap="wrap">
                  <Icon as={FiAlertCircle} color="#b78dea" boxSize={{ base: 5, md: 6 }} />
                  <Heading
                    as="h3"
                    fontSize={{ base: "md", md: "lg" }}
                    color="white"
                    fontWeight="700"
                    fontFamily="secondary"
                  >
                    Aviso Importante
                  </Heading>
                </HStack>
                <Text
                  color="rgba(255, 255, 255, 0.9)"
                  fontSize={{ base: "xs", md: "sm" }}
                  lineHeight="1.7"
                  fontFamily="secondary"
                  pl={{ base: 7, md: 9 }}
                >
                  GetPass publica información otorgada por el ORGANIZADOR, por lo tanto, no es
                  responsable en cambios del evento. Así como tampoco se responsabiliza por
                  daños o lesiones sufridas durante el desarrollo del mismo.
                </Text>
              </Box>
            </motion.div>

            {/* Contact Section */}
            <motion.div variants={itemVariants}>
              <Box 
                mt={{ base: 8, md: 12 }} 
                textAlign="center"
                px={{ base: 4, md: 0 }}
              >
                <Text
                  color="rgba(255, 255, 255, 0.7)"
                  fontSize={{ base: "xs", md: "sm" }}
                  fontFamily="secondary"
                  lineHeight="1.6"
                >
                  Si tienes alguna pregunta sobre estos términos y condiciones, por favor{" "}
                  <Text as="span" color="#b78dea" fontWeight="600">
                    contáctanos
                  </Text>
                  .
                </Text>
              </Box>
            </motion.div>
          </motion.div>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default Politics;
