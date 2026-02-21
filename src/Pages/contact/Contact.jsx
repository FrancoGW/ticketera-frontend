import React, { useState } from "react";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import {
  Box,
  Container,
  Flex,
  Text,
  Input,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
  Heading,
  VStack,
  useToast,
  Icon,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiMessageSquare,
  FiUser,
  FiSend,
  FiHeadphones,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import userApi from "../../Api/user";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

function Contact() {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });

    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "El nombre es requerido";
        if (value.trim().length < 2)
          return "El nombre debe tener al menos 2 caracteres";
        return "";
      case "email":
        if (!value) return "El correo electrónico es requerido";
        if (!validateEmail(value)) return "Email inválido";
        return "";
      case "message":
        if (!value.trim()) return "El mensaje es requerido";
        if (value.trim().length < 10)
          return "El mensaje debe tener al menos 10 caracteres";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      const error = validateField(key, formValues[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendContactEmail = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Por favor corrija los errores en el formulario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await userApi.sendContactEmail(formValues);
      toast({
        title: "¡Mensaje enviado!",
        description: "Nos pondremos en contacto contigo pronto.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFormValues({
        name: "",
        email: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      console.log(error);
      toast({
        title: "Error al enviar",
        description:
          error.response?.data?.message ||
          "Ocurrió un error al enviar el mensaje. Por favor, intenta nuevamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setIsLoading(false);
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: "Email",
      description: "Escribinos a nuestro correo",
      value: "contacto@getpass.com.ar",
    },
    {
      icon: FiHeadphones,
      title: "Soporte",
      description: "Atención al cliente",
      value: "Lun - Vie, 9:00 - 18:00",
    },
    {
      icon: FiMapPin,
      title: "Ubicación",
      description: "Estamos en",
      value: "Buenos Aires, Argentina",
    },
  ];

  return (
    <>
      <Header />
      <Box
        minH="calc(100vh - 80px)"
        bgGradient="linear(to-br, #000, #1a1a1a)"
        position="relative"
        overflow="hidden"
        pt={{ base: 24, md: 32 }}
        pb={{ base: 16, md: 24 }}
        px={{ base: 2, md: 0 }}
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

        <Container maxW="container.xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
          <VStack spacing={12} align="stretch">
            {/* Header Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <VStack spacing={4} textAlign="center">
                <motion.div variants={itemVariants}>
                  <Heading
                    as="h1"
                    fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                    color="white"
                    fontWeight="800"
                    letterSpacing="-0.02em"
                    lineHeight="1.1"
                  >
                    Contáctanos{" "}
                    <Text as="span" color="#b78dea">
                      y te ayudamos
                    </Text>
                  </Heading>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    color="rgba(255, 255, 255, 0.7)"
                    lineHeight="1.6"
                    maxW="600px"
                  >
                    ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Envíanos
                    un mensaje y te responderemos lo antes posible.
                  </Text>
                </motion.div>
              </VStack>
            </motion.div>

            <Flex
              direction={{ base: "column", lg: "row" }}
              gap={{ base: 8, lg: 12 }}
              align="stretch"
            >
              {/* Left Side - Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{ flex: 1, maxWidth: "400px" }}
              >
                <VStack spacing={6} align="stretch">
                  {contactInfo.map((info, index) => {
                    const IconComponent = info.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Flex
                          align="flex-start"
                          gap={4}
                          p={6}
                          borderRadius="xl"
                          bg="rgba(255, 255, 255, 0.05)"
                          border="1px solid"
                          borderColor="rgba(255, 255, 255, 0.1)"
                          _hover={{
                            bg: "rgba(255, 255, 255, 0.08)",
                            borderColor: "rgba(255, 255, 255, 0.2)",
                          }}
                          transition="all 0.3s"
                        >
                          <Box
                            bg="#b78dea"
                            color="white"
                            p={3}
                            borderRadius="lg"
                            flexShrink={0}
                          >
                            <IconComponent size={24} />
                          </Box>
                          <Box flex="1">
                            <Heading
                              fontSize="md"
                              fontWeight="700"
                              color="white"
                              mb={1}
                              fontFamily="secondary"
                            >
                              {info.title}
                            </Heading>
                            <Text
                              fontSize="sm"
                              color="rgba(255, 255, 255, 0.6)"
                              fontFamily="secondary"
                              mb={1}
                            >
                              {info.description}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="white"
                              fontWeight="500"
                              fontFamily="secondary"
                            >
                              {info.value}
                            </Text>
                          </Box>
                        </Flex>
                      </motion.div>
                    );
                  })}
                </VStack>
              </motion.div>

              {/* Right Side - Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{ flex: 1, maxWidth: "600px" }}
              >
                <Box
                  bg="white"
                  borderRadius="2xl"
                  p={{ base: 6, md: 8 }}
                  boxShadow="0 20px 60px rgba(0, 0, 0, 0.3)"
                  w="100%"
                >
                  <VStack spacing={6} align="stretch">
                    <VStack spacing={2} align="flex-start">
                      <Heading
                        as="h2"
                        fontSize="2xl"
                        fontWeight="700"
                        color="black"
                        letterSpacing="-0.01em"
                      >
                        Envíanos un mensaje
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        Completa el formulario y te responderemos pronto
                      </Text>
                    </VStack>

                    <form onSubmit={sendContactEmail} style={{ width: "100%" }}>
                      <VStack spacing={5}>
                        <FormControl isInvalid={errors.name}>
                          <FormLabel fontFamily="secondary" color="gray.700">
                            Nombre completo
                          </FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FiUser} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="Tu nombre"
                              name="name"
                              value={formValues.name}
                              onChange={handleInputChange}
                              fontSize="md"
                              borderRadius="lg"
                              border="2px solid"
                              borderColor="gray.200"
                              pl="3rem"
                              _focus={{
                                borderColor: "#b78dea",
                                boxShadow: "0 0 0 1px #b78dea",
                              }}
                              _hover={{
                                borderColor: "gray.300",
                              }}
                              fontFamily="secondary"
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.name}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.email}>
                          <FormLabel fontFamily="secondary" color="gray.700">
                            Correo electrónico
                          </FormLabel>
                          <InputGroup size="lg">
                            <InputLeftElement pointerEvents="none">
                              <Icon as={FiMail} color="gray.400" />
                            </InputLeftElement>
                            <Input
                              placeholder="tu@email.com"
                              name="email"
                              type="email"
                              value={formValues.email}
                              onChange={handleInputChange}
                              fontSize="md"
                              borderRadius="lg"
                              border="2px solid"
                              borderColor="gray.200"
                              pl="3rem"
                              _focus={{
                                borderColor: "#b78dea",
                                boxShadow: "0 0 0 1px #b78dea",
                              }}
                              _hover={{
                                borderColor: "gray.300",
                              }}
                              fontFamily="secondary"
                            />
                          </InputGroup>
                          <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.message}>
                          <FormLabel fontFamily="secondary" color="gray.700">
                            Mensaje
                          </FormLabel>
                          <Textarea
                            placeholder="Escribe tu mensaje aquí..."
                            name="message"
                            value={formValues.message}
                            onChange={handleInputChange}
                            size="lg"
                            fontSize="md"
                            borderRadius="lg"
                            border="2px solid"
                            borderColor="gray.200"
                            _focus={{
                              borderColor: "#b78dea",
                              boxShadow: "0 0 0 1px #b78dea",
                            }}
                            _hover={{
                              borderColor: "gray.300",
                            }}
                            fontFamily="secondary"
                            resize="none"
                            minH="150px"
                          />
                          <FormErrorMessage>{errors.message}</FormErrorMessage>
                        </FormControl>

                        <Button
                          type="submit"
                          w="100%"
                          size="lg"
                          bg="#b78dea"
                          color="white"
                          fontSize="md"
                          fontWeight="600"
                          borderRadius="lg"
                          _hover={{
                            bg: "#a67dd9",
                            transform: "translateY(-2px)",
                            boxShadow: "lg",
                          }}
                          _active={{
                            transform: "translateY(0)",
                          }}
                          fontFamily="secondary"
                          isLoading={isLoading}
                          loadingText="Enviando..."
                          leftIcon={<Icon as={FiSend} />}
                          transition="all 0.2s"
                        >
                          Enviar mensaje
                        </Button>
                      </VStack>
                    </form>
                  </VStack>
                </Box>
              </motion.div>
            </Flex>

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Text
                textAlign="center"
                fontSize="xs"
                color="rgba(255, 255, 255, 0.5)"
                fontFamily="secondary"
                maxW="800px"
                mx="auto"
                lineHeight="1.6"
              >
                * Los comentarios y descripción del evento ingresados son de
                exclusiva responsabilidad del ORGANIZADOR. El ORGANIZADOR es el
                único y exclusivo responsable de la producción y organización del
                evento. GetPass no se responsabiliza por declaraciones emitidas
                por los mismos. La recaudación de las entradas en su totalidad
                también es responsabilidad del ORGANIZADOR. GetPass es una
                plataforma de terceros sin responsabilidad en cancelaciones y/o
                modificaciones en los eventos*
              </Text>
            </motion.div>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default Contact;
