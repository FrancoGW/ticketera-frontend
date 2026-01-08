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
  InputGroup,
  InputRightElement,
  Icon,
  Link,
  useToast,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import userApi from "../../Api/user";
import { useNavigate } from "react-router";

const initialUserData = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  repeatPassword: "",
  phoneNumber: "",
  dni: "",
  roles: ["user"], // Default role
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
  return dni.length >= 7 && dni.length <= 10;
};

const validatePhoneNumber = (phone) => {
  return phone.length >= 8 && phone.length <= 15;
};

function Register() {
  const [userData, setUserData] = useState(initialUserData);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return validateEmail(value) ? "" : "Email inválido";
      case "password":
        return validatePassword(value) ? "" : "La contraseña debe tener al menos 6 caracteres";
      case "repeatPassword":
        return value === userData.password ? "" : "Las contraseñas no coinciden";
      case "dni":
        return validateDNI(value) ? "" : "DNI inválido";
      case "phoneNumber":
        return validatePhoneNumber(value) ? "" : "Número de teléfono inválido";
      default:
        return value.trim() ? "" : "Este campo es requerido";
    }
  };

  const handleInputChange = async (event) => {
    const { name, value } = event.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Check email availability
    if (name === "email" && validateEmail(value)) {
      setIsCheckingEmail(false);
  
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(userData).forEach(key => {
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
      // Remove repeatPassword and prepare data for API
      const { repeatPassword, ...userDataToSend } = userData;
      
      const response = await userApi.createUser(userDataToSend);
      
      if (response?.status === 201 || response?.data) {
        toast({
          title: "Registro exitoso",
          description: "Por favor, inicia sesión con tus credenciales",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setUserData(initialUserData);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: "Error en el registro",
        description: error.response?.data?.message || "Por favor, intenta nuevamente",
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
      <Container maxW="100vw" minH="70vh" className="p-4 background-radial-gradient overflow-hidden">
        <Flex align="center" justify="center" gap="20" position="relative">
          <Heading
            as="h1"
            size="4xl"
            color="white"
            fontWeight="bold"
            textAlign="center"
            mb="10"
            display={{ base: "none", md: "flex" }}
            flexDirection="column"
            gap="4"
            zIndex="10"
            fontFamily="primary"
          >
            Los mejores aliados <br />
            <span style={{ color: "hsl(218, 81%, 75%)" }}>para tus eventos</span>
          </Heading>
          
          <Flex
            flexDir="column"
            direction="column"
            justifyContent="center"
            alignItems="center"
            w="100%"
            maxW="400px"
            bg="#f1f2f3"
            py="5"
            px="8"
            borderRadius="10px"
            zIndex="10"
          >
            <Heading as="h2" mb="6" fontFamily="secondary">
              Regístrate
            </Heading>
            <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", gap: "1rem", flexDirection: "column" }}>
              <Flex gap="2">
                <FormControl isInvalid={errors.firstname}>
                  <Input
                    placeholder="Nombre"
                    name="firstname"
                    value={userData.firstname}
                    onChange={handleInputChange}
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
                    fontFamily="secondary"
                  />
                  <FormErrorMessage>{errors.lastname}</FormErrorMessage>
                </FormControl>
              </Flex>

              <FormControl isInvalid={errors.email}>
                <Input
                  placeholder="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  fontFamily="secondary"
                  isDisabled={isCheckingEmail}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.dni}>
                <Input
                  placeholder="DNI"
                  name="dni"
                  value={userData.dni}
                  onChange={handleInputChange}
                  fontFamily="secondary"
                  type="text"
                  maxLength={10}
                />
                <FormErrorMessage>{errors.dni}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.phoneNumber}>
                <Input
                  placeholder="Número de Teléfono"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleInputChange}
                  fontFamily="secondary"
                  type="tel"
                />
                <FormErrorMessage>{errors.phoneNumber}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.password}>
                <InputGroup>
                  <Input
                    placeholder="Contraseña"
                    name="password"
                    type={show ? "text" : "password"}
                    value={userData.password}
                    onChange={handleInputChange}
                    fontFamily="secondary"
                  />
                  <InputRightElement mr="1">
                    <Button
                      bg="none"
                      _hover={{}}
                      _active={{}}
                      h="1.75rem"
                      size="sm"
                      onClick={handleClick}
                    >
                      <Icon as={show ? FaRegEyeSlash : FaRegEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={errors.repeatPassword}>
                <InputGroup>
                  <Input
                    placeholder="Repetir Contraseña"
                    name="repeatPassword"
                    type={show ? "text" : "password"}
                    value={userData.repeatPassword}
                    onChange={handleInputChange}
                    fontFamily="secondary"
                  />
                  <InputRightElement mr="1">
                    <Button
                      bg="none"
                      _hover={{}}
                      _active={{}}
                      h="1.75rem"
                      size="sm"
                      onClick={handleClick}
                    >
                      <Icon as={show ? FaRegEyeSlash : FaRegEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.repeatPassword}</FormErrorMessage>
              </FormControl>

              <Button
                type="submit"
                w="100%"
                bg="primary"
                borderRadius="5px"
                color="#fff"
                _hover={{ bg: "buttonHover" }}
                _active={{ bg: "buttonHover" }}
                fontFamily="secondary"
                fontWeight="normal"
                isLoading={isLoading}
                isDisabled={isCheckingEmail}
              >
                Registrarse
              </Button>
            </form>
            
            <Link
              fontFamily="secondary"
              href="/login"
              color="primary"
              mt="5"
              _hover={{ color: "primary" }}
            >
              Ya tengo cuenta
            </Link>
          </Flex>
        </Flex>
      </Container>
      <Footer />
    </>
  );
}

export default Register;