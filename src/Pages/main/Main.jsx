import EventContainer from "../../components/eventContainer/EventContainer.jsx";
import Header from "../../components/header/Header.jsx";
import Footer from "../../components/footer/Footer.jsx";
import { Container, Box, Flex, Text, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper";
import "swiper/css";
import "swiper/css/effect-fade";
import Flyer from "../../components/flyer/Flyer";
import "./Style.css";

const CAROUSEL_SLIDES = [
  { id: 1, text: "Fácil de usar" },
  { id: 2, text: "Tickets al instante" },
  { id: 3, text: "Conectado con", withLogo: true },
];

const Main = () => {
  return (
    <Box w="100%" position="relative">
      <Header />
      <Box pt="5rem" position="relative">
        <Flyer />
      </Box>

      {/* Carrusel de beneficios */}
      <Box bg="white" py={4} borderBottom="1px solid" borderColor="gray.200">
        <Container maxW="7xl">
          <Swiper
            slidesPerView={1}
            spaceBetween={0}
            loop={true}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={500}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            modules={[Autoplay, EffectFade]}
            className="benefits-swiper"
          >
            {CAROUSEL_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <Flex
                  align="center"
                  justify="center"
                  gap={4}
                  py={2}
                  px={4}
                  flexDirection={{ base: "column", sm: "row" }}
                  minH="72px"
                >
                  <Text
                    fontFamily="secondary"
                    fontSize={{ base: "xl", md: "2xl" }}
                    color="gray.800"
                    fontWeight="600"
                    textAlign="center"
                  >
                    {slide.text}
                  </Text>
                  {slide.withLogo && (
                    <Box
                      as="img"
                      src="/assets/img/mercado-pago.png"
                      alt="Mercado Pago"
                      height={{ base: "48px", md: "56px" }}
                      objectFit="contain"
                      display="inline-block"
                    />
                  )}
                </Flex>
              </SwiperSlide>
            ))}
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
