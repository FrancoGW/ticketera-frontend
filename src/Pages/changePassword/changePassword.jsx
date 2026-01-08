

// src/pages/ChangePassword/index.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Flex,
  Heading,
  Input,
  Button,
  useToast,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

const ChangePassword = () => {
  const [show, setShow] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      navigate("/recover-password");
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== repeatPassword) {
      toast({
        title: "Las contraseñas no coinciden",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    const token = new URLSearchParams(location.search).get("token");

    try {
      await userApi.updatePassword(newPassword, token);
      toast({
        title: "Contraseña actualizada con éxito",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error al actualizar la contraseña",
        description:
          error.response?.data?.message || "Por favor intenta nuevamente",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Container
        maxW="7xl"
        minH="70vh"
        my="10"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
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
          <Heading as="h2" fontFamily="secondary" mb="6">
            Nueva Contraseña
          </Heading>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <InputGroup mb="4">
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Nueva contraseña"
                fontFamily="secondary"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                  {show ? "Ocultar" : "Mostrar"}
                </Button>
              </InputRightElement>
            </InputGroup>

            <InputGroup mb="6">
              <Input
                pr="4.5rem"
                type={show ? "text" : "password"}
                placeholder="Confirmar contraseña"
                fontFamily="secondary"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
                  {show ? "Ocultar" : "Mostrar"}
                </Button>
              </InputRightElement>
            </InputGroup>

            <Button
              w="100%"
              bg="primary"
              borderRadius="5px"
              color="#fff"
              _hover={{ bg: "buttonHover" }}
              _active={{ bg: "buttonHover" }}
              type="submit"
              fontFamily="secondary"
              fontWeight="normal"
              isLoading={isSubmitting}
            >
              Actualizar Contraseña
            </Button>
          </form>
        </Flex>
      </Container>
      <Footer />
    </>
  );
};

export default ChangePassword;
