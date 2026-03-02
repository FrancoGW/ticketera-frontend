import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Flex,
  Heading,
  Input,
  useToast,
  Text,
  VStack,
} from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import userApi from "../../Api/user";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const toast = useToast();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setIsSubmitting(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCountdown(30);

    try {
      const res = await userApi.recoverPassword(email);
      if (res.status === 201) {
        toast({
          title: "Revisá tu correo",
          description: "Si existe una cuenta con ese correo, te enviamos un enlace para restablecer la contraseña.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setStep(2);
      }
    } catch (error) {
      toast({
        title: "El correo no tiene cuenta asociada",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setIsSubmitting(false);
      setCountdown(0);
    }
  };

  return (
    <>
      <Header />
      <Container
        maxW="7xl"
        minH="70vh"
        pt={{ base: 24, md: 32 }}
        pb={{ base: 16, md: 24 }}
        px={{ base: 4, md: 6 }}
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
          <Heading as="h2" fontFamily="secondary">
            {step === 1 ? "Ingresa tu correo" : "Revisá tu correo"}
          </Heading>

          {step === 1 ? (
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Input
                pr="4.5rem"
                type="email"
                name="email"
                placeholder="Correo electrónico"
                fontFamily="secondary"
                my="10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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
                isDisabled={isSubmitting}
              >
                {isSubmitting
                  ? `Espera ${countdown} segundos...`
                  : "Recupera tu contraseña"}
              </Button>
            </form>
          ) : (
            <VStack spacing={4} w="100%" mt="4">
              <Text mb="4" textAlign="center" fontFamily="secondary">
                Si existe una cuenta con <strong>{email}</strong>, te enviamos un enlace. Abrí tu correo y hacé clic en el enlace para restablecer tu contraseña.
              </Text>

              <Button
                w="100%"
                variant="ghost"
                borderRadius="5px"
                onClick={() => setStep(1)}
                isDisabled={countdown > 0}
                fontFamily="secondary"
                fontWeight="normal"
              >
                {countdown > 0
                  ? `Espera ${countdown} segundos...`
                  : "Enviar otro enlace"}
              </Button>
            </VStack>
          )}
        </Flex>
      </Container>
      <Footer />
    </>
  );
};

export default RecoverPassword;
