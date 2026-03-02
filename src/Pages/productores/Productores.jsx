import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormErrorMessage,
  VStack,
  useToast,
  InputGroup,
  InputRightElement,
  Icon,
  SimpleGrid,
  Checkbox,
  Link,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import {
  FiZap,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
} from "react-icons/fi";
import userApi from "../../Api/user";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { getPasswordError } from "../../utils/passwordValidation";
import PasswordStrengthBar from "../../components/PasswordStrengthBar/PasswordStrengthBar";

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

const initialSellerData = {
  businessName: "",
  email: "",
  cuit: "",
  phoneNumber: "",
  password: "",
  repeatPassword: "",
  roles: ["seller"],
  acceptedTerms: false,
};

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const validateCUIT = (cuit) => {
  // CUIT argentino: 11 dígitos, formato XX-XXXXXXXX-X
  const cleanCuit = cuit.replace(/-/g, "");
  return /^\d{11}$/.test(cleanCuit);
};

const validatePhoneNumber = (phone) => {
  return phone.length >= 8 && phone.length <= 15;
};

function Productores() {
  const [sellerData, setSellerData] = useState(initialSellerData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Si ya está logueado, podría redirigir o permitir continuar
    }
  }, []);

  const validateField = (name, value) => {
    switch (name) {
      case "businessName":
        if (!value.trim()) return "El nombre o razón social es requerido";
        return "";
      case "email":
        if (!value) return "El correo es requerido";
        if (!validateEmail(value)) return "Email inválido";
        return "";
      case "cuit":
        if (!value) return "El CUIT es requerido";
        if (!validateCUIT(value)) return "CUIT inválido (formato: XX-XXXXXXXX-X)";
        return "";
      case "phoneNumber":
        if (!value) return "El teléfono es requerido";
        if (!validatePhoneNumber(value))
          return "Número de teléfono inválido";
        return "";
      case "password": {
        if (!value) return "La contraseña es requerida";
        const pwdError = getPasswordError(value);
        return pwdError || "";
      }
      case "repeatPassword":
        if (!value) return "Confirma tu contraseña";
        if (value !== sellerData.password) return "Las contraseñas no coinciden";
        return "";
      default:
        return "";
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setSellerData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (type !== "checkbox") {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    } else if (name === "acceptedTerms") {
      // Limpiar error de términos cuando se marca
      setErrors((prev) => ({
        ...prev,
        acceptedTerms: "",
      }));
    }
  };

  const formatCUIT = (value) => {
    // Remover todo lo que no sea número
    const numbers = value.replace(/\D/g, "");
    // Aplicar formato XX-XXXXXXXX-X
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 10)
      return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
  };

  const handleCUITChange = (e) => {
    const formatted = formatCUIT(e.target.value);
    setSellerData((prev) => ({
      ...prev,
      cuit: formatted,
    }));
    const error = validateField("cuit", formatted);
    setErrors((prev) => ({
      ...prev,
      cuit: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(sellerData).forEach((key) => {
      if (key !== "roles" && key !== "repeatPassword" && key !== "acceptedTerms") {
        const error = validateField(key, sellerData[key]);
        if (error) newErrors[key] = error;
      }
    });
    // Validar repeatPassword por separado
    if (sellerData.password !== sellerData.repeatPassword) {
      newErrors.repeatPassword = "Las contraseñas no coinciden";
    }
    // Validar términos y condiciones
    if (!sellerData.acceptedTerms) {
      newErrors.acceptedTerms = "Debes aceptar los términos y condiciones";
    }
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
      const { repeatPassword, ...sellerDataToSend } = sellerData;
      
      // Preparar datos para el backend
      // El backend espera firstname, lastname, email, password, dni, phoneNumber
      // Usamos businessName como firstname y cuit como dni
      const userData = {
        firstname: sellerDataToSend.businessName,
        lastname: sellerDataToSend.businessName, // Usamos el mismo nombre para lastname
        email: sellerDataToSend.email,
        password: sellerDataToSend.password,
        phoneNumber: sellerDataToSend.phoneNumber,
        dni: sellerDataToSend.cuit.replace(/-/g, ""), // Enviar CUIT sin guiones en el campo dni
        roles: ["seller"],
      };

      const response = await userApi.createUser(userData);

      if (response?.status === 201 || response?.data) {
        toast({
          title: "¡Cuenta creada exitosamente!",
          description: "Tu cuenta de organizador ha sido creada. Por favor inicia sesión.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setSellerData(initialSellerData);
        navigate("/login");
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

  const features = [
    {
      icon: FiDollarSign,
      title: "Cobros instantáneos",
      description: "Recibí el dinero de tus ventas al momento, sin esperas.",
    },
    {
      icon: FiTrendingUp,
      title: "Seguimiento en tiempo real",
      description: "Controlá tus ventas desde cualquier dispositivo.",
    },
    {
      icon: FiUsers,
      title: "Gestión completa",
      description: "RRPP, staff, cajas y más en una sola plataforma.",
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
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="center"
            gap={{ base: 10, lg: 16 }}
            minH={{ base: "auto", lg: "60vh" }}
          >
            {/* Left Side - Text Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ flex: 1, maxWidth: "500px" }}
            >
              <VStack
                spacing={8}
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
                    Crea tu cuenta y publica{" "}
                    <Text as="span" color="#b78dea">
                      tu evento
                    </Text>
                  </Heading>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Text
                    fontSize={{ base: "lg", md: "xl" }}
                    color="rgba(255, 255, 255, 0.7)"
                    lineHeight="1.6"
                    maxW="400px"
                  >
                    Unite a los organizadores que ya confían en GetPass para
                    gestionar sus eventos de forma profesional.
                  </Text>
                </motion.div>

                {/* Features Section */}
                <motion.div variants={itemVariants} w="100%">
                  <SimpleGrid columns={1} spacing={6} w="100%">
                    {features.map((feature, index) => {
                      const IconComponent = feature.icon;
                      return (
                        <Flex
                          key={index}
                          align="flex-start"
                          gap={4}
                          p={4}
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
                              {feature.title}
                            </Heading>
                            <Text
                              fontSize="sm"
                              color="rgba(255, 255, 255, 0.7)"
                              fontFamily="secondary"
                              lineHeight="1.5"
                            >
                              {feature.description}
                            </Text>
                          </Box>
                        </Flex>
                      );
                    })}
                  </SimpleGrid>
                </motion.div>
              </VStack>
            </motion.div>

            {/* Right Side - Registration Form */}
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
                      Crear cuenta de organizador
                    </Heading>
                    <Text color="gray.600" fontSize="sm">
                      Completa el formulario para comenzar
                    </Text>
                  </VStack>

                  <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <VStack spacing={5}>
                      <FormControl isInvalid={errors.businessName}>
                        <Input
                          placeholder="Nombre o razón social"
                          name="businessName"
                          value={sellerData.businessName}
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
                        <FormErrorMessage>{errors.businessName}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.email}>
                        <Input
                          placeholder="Correo electrónico"
                          name="email"
                          type="email"
                          value={sellerData.email}
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

                      <FormControl isInvalid={errors.cuit}>
                        <Input
                          placeholder="CUIT (XX-XXXXXXXX-X)"
                          name="cuit"
                          value={sellerData.cuit}
                          onChange={handleCUITChange}
                          maxLength={13}
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
                        <FormErrorMessage>{errors.cuit}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.phoneNumber}>
                        <Input
                          placeholder="Número de teléfono"
                          name="phoneNumber"
                          value={sellerData.phoneNumber}
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

                      <FormControl isInvalid={errors.password}>
                        <InputGroup size="lg">
                          <Input
                            placeholder="Contraseña"
                            name="password"
                            type={show ? "text" : "password"}
                            value={sellerData.password}
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
                        <PasswordStrengthBar password={sellerData.password} />
                        <FormErrorMessage>{errors.password}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={errors.repeatPassword}>
                        <InputGroup size="lg">
                          <Input
                            placeholder="Confirmar contraseña"
                            name="repeatPassword"
                            type={showRepeat ? "text" : "password"}
                            value={sellerData.repeatPassword}
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

                      <FormControl isInvalid={errors.acceptedTerms}>
                        <Flex align="flex-start" gap={2}>
                          <Checkbox
                            name="acceptedTerms"
                            isChecked={sellerData.acceptedTerms}
                            onChange={handleInputChange}
                            colorScheme="purple"
                            size="md"
                            fontFamily="secondary"
                            mt={1}
                            flexShrink={0}
                          />
                          <Text fontSize="sm" color="gray.700" pt={1}>
                            Acepto los{" "}
                            <Link
                              as={RouterLink}
                              to="/politics"
                              color="black"
                              fontWeight="600"
                              textDecoration="underline"
                              _hover={{ color: "#b78dea" }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              términos y condiciones
                            </Link>
                          </Text>
                        </Flex>
                        <FormErrorMessage mt={1}>{errors.acceptedTerms}</FormErrorMessage>
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
                        Crear cuenta
                      </Button>
                    </VStack>
                  </form>
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

export default Productores;
