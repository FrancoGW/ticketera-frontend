import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import { Container, Flex, Heading, Text, Spinner, Button, Link } from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import userApi from "../../Api/user";
import api from "../../config/axios.config";

const ConfirmUpdateEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    // Token: primero de searchParams, luego de window.location (por si hay redirecciones)
    let token = searchParams.get("token");
    if (!token && typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      token = params.get("token");
    }
    if (!token) {
      setStatus("error");
      setMessage("Enlace inválido. Falta el token. Solicitá uno nuevo desde tu perfil.");
      return;
    }
    didRun.current = true;

    const confirm = async () => {
      try {
        const { data } = await userApi.confirmUpdateEmail(token);
        if (data?.token) {
          api.setToken(data.token);
        }
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "El enlace expiró o no es válido. Solicitá uno nuevo desde tu perfil."
        );
      }
    };

    confirm();
  }, [searchParams]);

  return (
    <>
      <Header />
      <Container
        maxW="md"
        minH="60vh"
        my="10"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          w="100%"
          py="10"
          px="6"
          bg="gray.50"
          borderRadius="xl"
          textAlign="center"
        >
          {status === "loading" && (
            <>
              <Spinner size="xl" color="primary" mb="4" />
              <Heading as="h2" size="md" fontFamily="secondary" color="gray.700">
                Confirmando tu nuevo email...
              </Heading>
            </>
          )}
          {status === "success" && (
            <>
              <Heading as="h2" size="lg" fontFamily="secondary" color="green.600" mb="4">
                Su mail se cambió con éxito
              </Heading>
              <Text fontFamily="secondary" color="gray.600" mb="8">
                Tu dirección de correo fue actualizada correctamente.
              </Text>
              <Link
                as={RouterLink}
                to="/profile"
                replace
                fontFamily="secondary"
                fontWeight="600"
                color="primary"
                _hover={{ color: "buttonHover", textDecoration: "underline" }}
                fontSize="md"
                display="inline-block"
                py="3"
                px="6"
                borderRadius="lg"
                bg="white"
                border="2px solid"
                borderColor="primary"
              >
                Volver a mi perfil
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <Heading as="h2" size="md" fontFamily="secondary" color="red.600" mb="4">
                No se pudo actualizar el email
              </Heading>
              <Text fontFamily="secondary" color="gray.600" mb="6">
                {message}
              </Text>
              <Button
                as={RouterLink}
                to="/profile"
                bg="primary"
                color="white"
                _hover={{ bg: "buttonHover" }}
                fontFamily="secondary"
                replace
              >
                Volver a mi perfil
              </Button>
            </>
          )}
        </Flex>
      </Container>
      <Footer />
    </>
  );
};

export default ConfirmUpdateEmail;
