import EventContainer from "../../components/eventContainer/EventContainer.jsx";
import Header from "../../components/header/Header.jsx";
import Footer from "../../components/footer/Footer.jsx";
import { Container, Box, Flex, Text, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaTicketAlt, FaDollarSign, FaChair, FaLock } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper";
import "swiper/css";
import Flyer from "../../components/flyer/Flyer";
import "./Style.css";

const Main = () => {
  const features = [
    {
      icon: FaTicketAlt,
      text: "Gestión de entradas",
    },
    {
      icon: FaDollarSign,
      text: "Cobros instantáneos",
    },
    {
      icon: FaChair,
      text: "Sistema de Butacas",
    },
    {
      icon: FaLock,
      text: "Holding de ingresos",
    },
  ];

  return (
    <Box w="100%" position="relative">
      <Header />
      <Box pt="5rem" position="relative">
        <Flyer />
      </Box>
      
      {/* Banner de Features - Slider */}
      <Box bg="white" py={6} borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="7xl">
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            className="features-swiper"
            style={{
              padding: "0 20px",
            }}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <SwiperSlide key={index}>
                  <Flex
                    align="center"
                    justify="center"
                    gap={3}
                    py={2}
                  >
                    <Box
                      bg="black"
                      color="white"
                      p={3}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <IconComponent size={18} />
                    </Box>
                    <Text
                      fontFamily="secondary"
                      fontSize={{ base: "sm", md: "md" }}
                      color="gray.700"
                      fontWeight="600"
                      textAlign="center"
                    >
                      {feature.text}
                    </Text>
                  </Flex>
                </SwiperSlide>
              );
            })}
          </Swiper>
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
