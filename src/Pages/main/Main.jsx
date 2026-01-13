import EventContainer from "../../components/eventContainer/EventContainer.jsx";
import Header from "../../components/header/Header.jsx";
import Footer from "../../components/footer/Footer.jsx";
import { Container, Box, Flex, Text, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaTicketAlt, FaDollarSign } from "react-icons/fa";
import Flyer from "../../components/flyer/Flyer";
import "./Style.css";

const Main = () => {
  return (
    <Box w="100%" position="relative">
      <Header />
      <Box pt="5rem" position="relative">
        <Flyer />
      </Box>
      
      {/* Banner de Features */}
      <Box bg="white" py={4} borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="7xl">
          <Flex
            align="center"
            justify="center"
            gap={8}
            flexDirection={{ base: "column", sm: "row" }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Flex align="center" gap={3}>
                <Box
                  bg="black"
                  color="white"
                  p={2}
                  borderRadius="md"
                >
                  <FaTicketAlt size={16} />
                </Box>
                <Text
                  fontFamily="secondary"
                  fontSize={{ base: "xs", md: "sm" }}
                  color="gray.700"
                  fontWeight="500"
                >
                  Gestión de entradas
                </Text>
              </Flex>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Flex align="center" gap={3}>
                <Box
                  bg="black"
                  color="white"
                  p={2}
                  borderRadius="md"
                >
                  <FaDollarSign size={16} />
                </Box>
                <Text
                  fontFamily="secondary"
                  fontSize={{ base: "xs", md: "sm" }}
                  color="gray.700"
                  fontWeight="500"
                >
                  Cobros instantáneos
                </Text>
              </Flex>
            </motion.div>
          </Flex>
        </Container>
      </Box>

      {/* Sección de Próximos Eventos */}
      <Box bg="gray.50" py={16}>
        <Container maxW="7xl" px={{ base: 4, md: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heading
              as="h2"
              fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
              fontWeight="700"
              fontFamily="primary"
              textAlign="center"
              mb={12}
              color="black"
            >
              Eventos
            </Heading>
          </motion.div>
          <EventContainer />
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default Main;
