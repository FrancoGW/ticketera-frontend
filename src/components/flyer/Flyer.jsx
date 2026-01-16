import React from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  Button,
  Container,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { FiPlus } from "react-icons/fi";
import background from "/assets/img/slide/sliderrr.webp";

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: 0.4,
      ease: "easeOut",
    },
  },
};

const Flyer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateEvent = () => {
    // Si está logueado, permitir crear evento (aunque sea buyer).
    // Si no está logueado, redirigir a login.
    if (user) return navigate("/seller/new-event");
    return navigate("/login");
  };

  return (
    <Box 
      position="relative" 
      width="100%" 
      height={{ base: "50vh", md: "45vh", lg: "40vh" }}
      minHeight={{ base: "400px", md: "450px", lg: "500px" }}
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      {/* Background con overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        backgroundImage={`url(${background})`}
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        filter="blur(3px)"
        transform="scale(1.1)"
        _after={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bg: "rgba(0, 0, 0, 0.6)",
          zIndex: 1,
        }}
      />

      {/* Contenido del Hero */}
      <Container
        maxW="7xl"
        position="relative"
        zIndex={2}
        height="100%"
        display="flex"
        alignItems="center"
        px={{ base: 4, md: 6, lg: 8 }}
      >
        <Flex
          direction="column"
          width={{ base: "100%", sm: "90%", md: "70%", lg: "50%", xl: "40%" }}
          maxW={{ base: "100%", lg: "600px" }}
          gap={{ base: 4, md: 5, lg: 6 }}
          color="white"
          justifyContent="center"
          py={{ base: 8, md: 12, lg: 16 }}
        >
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            <Heading
              as="h1"
              fontSize={{ base: "xl", sm: "2xl", md: "3xl", lg: "4xl", xl: "5xl" }}
              fontWeight="800"
              fontFamily="primary"
              lineHeight={{ base: "1.3", md: "1.2" }}
              mb={{ base: 4, md: 5, lg: 6 }}
            >
              Creá un evento inolvidable y compartilo con el mundo
            </Heading>
          </motion.div>

          <motion.div
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            <Text
              fontSize={{ base: "sm", sm: "md", md: "md", lg: "lg" }}
              fontWeight="300"
              fontFamily="secondary"
              lineHeight={{ base: "1.6", md: "1.7" }}
              opacity={0.95}
              mb={{ base: 5, md: 6, lg: 8 }}
            >
              Vendé entradas, butacas y consumiciones y recibí el 100% de tus
              ventas al instante
            </Text>
          </motion.div>

          <motion.div 
            variants={buttonVariants} 
            initial="hidden" 
            animate="visible"
            width={{ base: "100%", sm: "auto" }}
          >
            <Button
              as={motion.button}
              size={{ base: "md", md: "lg" }}
              bg="white"
              color="black"
              fontSize={{ base: "sm", md: "md", lg: "lg" }}
              fontWeight="600"
              fontFamily="secondary"
              px={{ base: 6, md: 8 }}
              py={{ base: 5, md: 6 }}
              borderRadius="md"
              width={{ base: "100%", sm: "auto" }}
              minW={{ base: "100%", sm: "200px" }}
              _hover={{
                bg: "gray.100",
                transform: "translateY(-2px)",
                boxShadow: "xl",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.2s"
              onClick={handleCreateEvent}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              leftIcon={<FiPlus />}
            >
              Crear mi evento
            </Button>
          </motion.div>
        </Flex>
      </Container>
    </Box>
  );
};

export default Flyer;
