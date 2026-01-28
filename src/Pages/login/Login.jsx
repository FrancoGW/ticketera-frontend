import "./Style.css";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import React, { useState, useEffect } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import {
  Container,
  Flex,
  Input,
  Button,
  Heading,
  Text,
  InputGroup,
  InputRightElement,
  Icon,
  Link,
  useToast,
  Box,
  VStack,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/context/AuthContext";
import { useLocation, useNavigate } from "react-router";

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

function Login() {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      // Si es admin, redirigir al dashboard
      const userRoles = user?.roles || (user?.rol ? [user.rol] : []);
      const isAdmin = userRoles.some(role => String(role).toLowerCase() === 'admin');
      
      let redirectTo = location?.state?.from?.pathname || "/";
      if (isAdmin && redirectTo === "/") {
        redirectTo = "/admin";
      }
      navigate(redirectTo);
    }
  }, [user, location, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "El correo es requerido";
        if (!String(value).toLowerCase().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          return "Email inválido";
        }
        return "";
      case "password":
        if (!value) return "La contraseña es requerida";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    
    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast({
        title: "¡Bienvenido!",
        description: "Has ingresado correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log(error);
      if (error?.response?.status === 401) {
        toast({
          title: "Error de autenticación",
          description: "El correo o la contraseña son incorrectos",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error al iniciar sesión",
          description: "Por favor, intenta nuevamente",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box
        minH="calc(100vh - 80px)"
        bgGradient="linear(to-br, #000, #1a1a1a)"
        position="relative"
        overflow="hidden"
        py={{ base: 12, md: 20 }}
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

        <Container maxW="container.md" px={4} position="relative" zIndex={1}>
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="center"
            gap={{ base: 8, lg: 16 }}
            minH="60vh"
          >
            {/* Left Side - Welcome Text */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ flex: 1, maxWidth: "500px" }}
            >
              <VStack spacing={6} align={{ base: "center", lg: "flex-start" }} textAlign={{ base: "center", lg: "left" }}>
                <motion.div variants={itemVariants}>
                  <Heading
                    as="h1"
                    fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                    color="white"
                    fontWeight="800"
                    letterSpacing="-0.02em"
                    lineHeight="1.1"
                    mb={4}
                  >
                    Bienvenido de vuelta
                  </Heading>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    color="rgba(255, 255, 255, 0.7)"
                    lineHeight="1.6"
                    maxW="400px"
                  >
                    Accede a tu cuenta y continúa gestionando tus eventos de manera sencilla
                  </Text>
                </motion.div>
              </VStack>
            </motion.div>

            {/* Right Side - Login Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{ flex: 1, maxWidth: "450px", width: "100%" }}
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
                      Iniciar Sesión
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      Ingresa tus credenciales para continuar
                    </Text>
                  </VStack>

                  <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <VStack spacing={5}>
                      <FormControl isInvalid={errors.email}>
                        <Input
                          type="email"
                          name="email"
                          placeholder="Correo electrónico"
                          value={email}
                          onChange={handleInputChange}
                          size="lg"
                          fontSize="md"
                          borderRadius="lg"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            borderColor: "black",
                            boxShadow: "0 0 0 1px black",
                          }}
                          _hover={{
                            borderColor: "gray.300",
                          }}
                          fontFamily="secondary"
                        />
                        <FormErrorMessage>{errors.email}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.password}>
                        <InputGroup size="lg">
                          <Input
                            type={show ? "text" : "password"}
                            name="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={handleInputChange}
                            fontSize="md"
                            borderRadius="lg"
                            border="2px solid"
                            borderColor="gray.200"
                            _focus={{
                              borderColor: "black",
                              boxShadow: "0 0 0 1px black",
                            }}
                            _hover={{
                              borderColor: "gray.300",
                            }}
                            fontFamily="secondary"
                          />
                          <InputRightElement width="3rem">
                            <Button
                              h="1.75rem"
                              size="sm"
                              variant="ghost"
                              onClick={handleClick}
                              _hover={{ bg: "transparent" }}
                              _active={{ bg: "transparent" }}
                            >
                              <Icon
                                as={show ? FaRegEyeSlash : FaRegEye}
                                color="gray.500"
                                boxSize={5}
                              />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>

                      <Flex justify="flex-end" w="100%">
                        <Link
                          href="/recover-password"
                          fontSize="sm"
                          color="gray.600"
                          _hover={{ color: "black", textDecoration: "underline" }}
                          fontFamily="secondary"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </Flex>

                      <Button
                        type="submit"
                        w="100%"
                        size="lg"
                        bg="black"
                        color="white"
                        fontSize="md"
                        fontWeight="600"
                        borderRadius="lg"
                        _hover={{
                          bg: "#1a1a1a",
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        _active={{
                          transform: "translateY(0)",
                        }}
                        fontFamily="secondary"
                        isLoading={isLoading}
                        loadingText="Iniciando sesión..."
                        transition="all 0.2s"
                      >
                        Iniciar Sesión
                      </Button>
                    </VStack>
                  </form>

                  <Flex
                    justify="center"
                    align="center"
                    gap={2}
                    fontSize="sm"
                    color="gray.600"
                  >
                    <Text fontFamily="secondary">¿No tienes cuenta?</Text>
                    <Link
                      href="/register"
                      color="black"
                      fontWeight="600"
                      _hover={{ color: "#1a1a1a", textDecoration: "underline" }}
                      fontFamily="secondary"
                    >
                      Regístrate
                    </Link>
                  </Flex>
                </VStack>
              </Box>
            </motion.div>
          </Flex>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default Login;
