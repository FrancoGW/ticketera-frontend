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
  InputGroup,
  InputRightElement,
  Icon,
  Link,
  useToast,
  Box,
} from "@chakra-ui/react";
import userApi from "../../Api/user";
import { useLocation, useNavigate } from "react-router";
import jwt_decode from "jwt-decode";
import { useDispatch } from "react-redux";

function Login() {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true)
    e.preventDefault();
    try {
      const { data } = await userApi.login(email, password);
      const token = data.token;
      if (token) {
        // decode token
        const decodedToken = jwt_decode(token);

        localStorage.setItem("token", token);
        toast({
          title: "Ingresaste correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      setEmail("");
      setPassword("");
      if (location.state) {
        navigate(location.state.from);
        return;
      }
      navigate("/");
    } catch (error) {
      console.log(error)
      if (error?.response?.status === 401) {
        toast({
          title: "El correo o la contraseña son incorrectos",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
    setIsLoading(false)
  };

  return (
    <>
      <Header />
      <Container
        maxW="100vw"
        minH="70vh"
        className="p-4 background-radial-gradient overflow-hidden"
      >
        <Flex
          justifyContent="center"
          alignItems="center"
          w="100%"
          h="100%"
          gap="20"
          position="relative"
        >
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
            fontFamily="primary"
          >
            Los mejores aliados<br />
            <span style={{ color: "hsl(218, 81%, 75%)" }}>para tu evento</span>
          </Heading>
          <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            w="100%"
            maxW="370px"
            bg="#f1f2f3"
            py="5"
            px="8"
            borderRadius="10px"
            zIndex="10"
          >
            <Heading as="h2" mb="6" fontFamily="secondary">
              Ingresa
            </Heading>
            <form onSubmit={handleSubmit}>
              <InputGroup size="md" mb="5">
                <Input
                  pr="4.5rem"
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  fontFamily="secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
              <InputGroup size="md" mb="5">
                <Input
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fontFamily="secondary"
                />
                <InputRightElement mr="1">
                  <Button
                    bg="none"
                    _hover=""
                    _active=""
                    h="1.75rem"
                    size="sm"
                    onClick={handleClick}
                  >
                    {show ? (
                      <Icon as={FaRegEyeSlash} />
                    ) : (
                      <Icon as={FaRegEye} />
                    )}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <Button
                w="100%"
                type="submit"
                onClick={(e) => handleSubmit(e)}
                bg="primary"
                borderRadius="5px"
                color="#fff"
                _hover={{ bg: "buttonHover" }}
                _active={{ bg: "buttonHover" }}
                fontFamily="secondary"
                fontWeight="normal"
                isLoading={isLoading}
              >
                Iniciar sesión
              </Button>
            </form>
            <Link
              href="/recover-password"
              color="primary"
              mt="5"
              _hover={{ color: "primary" }}
              fontFamily="secondary"
            >
              Recuperar contraseña
            </Link>
            <Link
              href="/register"
              color="primary"
              mt="5"
              _hover={{ color: "primary" }}
              fontFamily="secondary"
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </Flex>
        </Flex>
      </Container>
      <Footer />
    </>
  );
}

export default Login;
