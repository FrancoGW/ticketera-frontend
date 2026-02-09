import "./Style.css";
import { useEffect, useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
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
  FormControl,
  FormErrorMessage,
  Box,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import userApi from "../../Api/user";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../auth/context/AuthContext";

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

const initialUserData = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  repeatPassword: "",
  phoneNumber: "",
  dni: "",
  roles: ["user"],
};

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateDNI = (dni) => {
  return dni.length >= 7 && dni.length <= 10 && /^\d+$/.test(dni);
};

const validatePhoneNumber = (phone) => {
  return phone.length >= 8 && phone.length <= 15;
};

function Register() {
  const location = useLocation();
  const isOrganizerSignup = location.state?.organizer === true;

  const [userData, setUserData] = useState(() => ({
    ...initialUserData,
    roles: isOrganizerSignup ? ["seller"] : initialUserData.roles,
  }));
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "El correo es requerido";
        if (!validateEmail(value)) return "Email inválido";
        return "";
      case "password":
        if (!value) return "La contraseña es requerida";
        if (!validatePassword(value))
          return "La contraseña debe tener al menos 6 caracteres";
        return "";
      case "repeatPassword":
        if (!value) return "Confirma tu contraseña";
        if (value !== userData.password) return "Las contraseñas no coinciden";
        return "";
      case "dni":
        if (!value) return "El DNI es requerido";
        if (!validateDNI(value)) return "DNI inválido (7-10 dígitos)";
        return "";
      case "phoneNumber":
        if (!value) return "El teléfono es requerido";
        if (!validatePhoneNumber(value))
          return "Número de teléfono inválido";
        return "";
      case "firstname":
        if (!value.trim()) return "El nombre es requerido";
        return "";
      case "lastname":
        if (!value.trim()) return "El apellido es requerido";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(userData).forEach((key) => {
      if (key !== "roles") {
        const error = validateField(key, userData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      const { repeatPassword, ...userDataToSend } = userData;

      const response = await userApi.createUser(userDataToSend);

      if (response?.status === 201 || response?.data) {
        const isSeller = userData.roles?.includes("seller");
        const data = response?.data || response;
        toast({
          title: "¡Registro exitoso!",
          description: isSeller
            ? "Tu cuenta de organizador está lista. Elegí tu plan de venta."
            : "Tu cuenta ha sido creada. Por favor inicia sesión.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setUserData({ ...initialUserData, roles: initialUserData.roles });
        if (isSeller && data?.token) {
          localStorage.setItem("token", data.token);
          await checkAuth();
          navigate("/vender", { replace: true });
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: "Error en el registro",
        description:
          error.response?.data?.message || "Por favor, intenta nuevamente",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
              <VStack
                spacing={6}
                align={{ base: "center", lg: "flex-start" }}
                textAlign={{ base: "center", lg: "left" }}
              >
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
                    Únete a GetPass
                  </Heading>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    color="rgba(255, 255, 255, 0.7)"
                    lineHeight="1.6"
                    maxW="400px"
                  >
                    Crea tu cuenta y comienza a gestionar tus eventos de forma
                    profesional
                  </Text>
                </motion.div>
              </VStack>
            </motion.div>

            {/* Right Side - Register Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              style={{ flex: 1, maxWidth: "500px", width: "100%" }}
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
                      {isOrganizerSignup ? "Crear cuenta organizador" : "Crear Cuenta"}
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      {isOrganizerSignup
                        ? "Completá el formulario. Después elegí tu plan de venta en la siguiente pantalla."
                        : "Completa el formulario para registrarte"}
                    </Text>
                  </VStack>

                  <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <VStack spacing={5}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <FormControl isInvalid={errors.firstname}>
                          <Input
                            placeholder="Nombre"
                            name="firstname"
                            value={userData.firstname}
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
                          <FormErrorMessage>{errors.firstname}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.lastname}>
                          <Input
                            placeholder="Apellido"
                            name="lastname"
                            value={userData.lastname}
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
                          <FormErrorMessage>{errors.lastname}</FormErrorMessage>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl isInvalid={errors.email}>
                        <Input
                          placeholder="Correo electrónico"
                          name="email"
                          type="email"
                          value={userData.email}
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

                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="100%">
                        <FormControl isInvalid={errors.dni}>
                          <Input
                            placeholder="DNI"
                            name="dni"
                            value={userData.dni}
                            onChange={handleInputChange}
                            type="text"
                            maxLength={10}
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
                          <FormErrorMessage>{errors.dni}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={errors.phoneNumber}>
                          <Input
                            placeholder="Teléfono"
                            name="phoneNumber"
                            value={userData.phoneNumber}
                            onChange={handleInputChange}
                            type="tel"
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
                          <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>
                        </FormControl>
                      </SimpleGrid>

                      <FormControl isInvalid={errors.password}>
                        <InputGroup size="lg">
                          <Input
                            placeholder="Contraseña"
                            name="password"
                            type={show ? "text" : "password"}
                            value={userData.password}
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
                              onClick={() => setShow(!show)}
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

                      <FormControl isInvalid={errors.repeatPassword}>
                        <InputGroup size="lg">
                          <Input
                            placeholder="Confirmar contraseña"
                            name="repeatPassword"
                            type={showRepeat ? "text" : "password"}
                            value={userData.repeatPassword}
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
                              onClick={() => setShowRepeat(!showRepeat)}
                              _hover={{ bg: "transparent" }}
                              _active={{ bg: "transparent" }}
                            >
                              <Icon
                                as={showRepeat ? FaRegEyeSlash : FaRegEye}
                                color="gray.500"
                                boxSize={5}
                              />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                        <FormErrorMessage>{errors.repeatPassword}</FormErrorMessage>
                      </FormControl>

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
                        loadingText="Creando cuenta..."
                        transition="all 0.2s"
                      >
                        Registrarse
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
                    <Text fontFamily="secondary">¿Ya tienes cuenta?</Text>
                    <Link
                      href="/login"
                      color="black"
                      fontWeight="600"
                      _hover={{ color: "#1a1a1a", textDecoration: "underline" }}
                      fontFamily="secondary"
                    >
                      Inicia sesión
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

export default Register;
