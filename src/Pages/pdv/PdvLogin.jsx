import React, { useState, useEffect } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import {
  Box,
  Container,
  Flex,
  Input,
  Button,
  Heading,
  Text,
  InputGroup,
  InputRightElement,
  Icon,
  useToast,
  VStack,
  FormControl,
  FormErrorMessage,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

const PdvLogin = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const toast = useToast();
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/pdv");
    }
  }, [user, navigate]);

  const validate = () => {
    const errs = {};
    if (!email) errs.email = "El email es requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Email inválido";
    if (!password) errs.password = "La contraseña es requerida";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      setIsLoading(true);
      await login(email.trim().toLowerCase(), password);
      navigate("/pdv");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Email o contraseña incorrectos";
      toast({ title: "Error", description: msg, status: "error", duration: 4000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50" align="center" justify="center" px={4}>
      <Box w="full" maxW="400px">
        <VStack spacing={8}>
          <VStack spacing={2} textAlign="center">
            <Box
              bg="black"
              borderRadius="xl"
              px={4}
              py={2}
              mb={2}
            >
              <Text color="white" fontWeight="bold" fontSize="lg" letterSpacing="wider">
                GETPASS
              </Text>
            </Box>
            <Heading size="lg" fontWeight="700">
              Punto de venta
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Ingresá con las credenciales que te envió el organizador
            </Text>
          </VStack>

          <Box
            w="full"
            bg="white"
            borderRadius="2xl"
            boxShadow="lg"
            p={8}
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={5}>
                <FormControl isInvalid={!!errors.email}>
                  <Input
                    type="email"
                    placeholder="Tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                    bg="gray.50"
                    _focus={{ bg: "white", borderColor: "black" }}
                  />
                  {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
                </FormControl>

                <FormControl isInvalid={!!errors.password}>
                  <InputGroup size="lg">
                    <Input
                      type={show ? "text" : "password"}
                      placeholder="Contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      borderRadius="xl"
                      bg="gray.50"
                      _focus={{ bg: "white", borderColor: "black" }}
                    />
                    <InputRightElement>
                      <Icon
                        as={show ? FaRegEyeSlash : FaRegEye}
                        cursor="pointer"
                        color="gray.400"
                        onClick={() => setShow((p) => !p)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
                </FormControl>

                <Button
                  type="submit"
                  w="full"
                  size="lg"
                  bg="black"
                  color="white"
                  borderRadius="xl"
                  fontWeight="600"
                  _hover={{ bg: "#1a1a1a", transform: "translateY(-1px)", boxShadow: "lg" }}
                  _active={{ bg: "#1a1a1a", transform: "translateY(0)" }}
                  transition="all 0.2s"
                  isLoading={isLoading}
                >
                  Ingresar al punto de venta
                </Button>
              </VStack>
            </form>
          </Box>

          <Text fontSize="xs" color="gray.400" textAlign="center">
            ¿Olvidaste tu contraseña?{" "}
            <Text as="span" color="black" cursor="pointer" textDecor="underline" onClick={() => navigate("/recover-password")}>
              Recuperala acá
            </Text>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
};

export default PdvLogin;
