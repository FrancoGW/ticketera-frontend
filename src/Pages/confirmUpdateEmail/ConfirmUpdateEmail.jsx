import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Flex, Heading, Text, Spinner, Button } from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import userApi from "../../Api/user";
import api from "../../config/axios.config";

const ConfirmUpdateEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Enlace inválido. Falta el token.");
      return;
    }

    const confirm = async () => {
      try {
        const { data } = await userApi.confirmUpdateEmail(token);
        if (data?.token) {
          api.setToken(data.token);
        }
        setStatus("success");
        setMessage("Email actualizado correctamente. Redirigiendo a tu perfil...");
        setTimeout(() => navigate("/profile", { replace: true }), 2000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "El enlace expiró o no es válido. Solicitá uno nuevo desde tu perfil."
        );
      }
    };

    confirm();
  }, [searchParams, navigate]);

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
          py="8"
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
              <Heading as="h2" size="md" fontFamily="secondary" color="green.600" mb="2">
                ¡Listo!
              </Heading>
              <Text fontFamily="secondary" color="gray.600">
                {message}
              </Text>
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
                bg="primary"
                color="white"
                _hover={{ bg: "buttonHover" }}
                onClick={() => navigate("/profile", { replace: true })}
                fontFamily="secondary"
              >
                Ir a mi perfil
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
