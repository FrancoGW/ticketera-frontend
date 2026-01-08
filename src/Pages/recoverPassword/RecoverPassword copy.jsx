// src/pages/RecoverPassword/index.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Flex,
  Heading,
  Input,
  useToast,
  PinInput,
  PinInputField,
  HStack,
  Text,
} from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import userApi from "../../Api/user";

const RecoverPassword = () => {
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: verification code
  const [verificationCode, setVerificationCode] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

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
          title: "Enviamos un mail a tu correo",
          description: "Por favor ingresa el código de verificación",
          status: "success",
          duration: 4000,
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

  const handleVerifyCode = async (code) => {
    try {
      const res = await userApi.verifyResetCode(email, code);
      if (res.data.tempToken) {
        navigate(`/change-password?token=${res.data.tempToken}`);
      }
    } catch (error) {
      toast({
        title: "Código inválido",
        description: "Por favor verifica el código e intenta nuevamente",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
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
          <Heading as="h2" fontFamily="secondary">
            {step === 1 ? "Ingresa tu correo" : "Verifica tu código"}
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
            <Flex direction="column" align="center" w="100%" mt="4">
              <Text mb="4" textAlign="center" fontFamily="secondary">
                Ingresa el código de 6 dígitos enviado a {email}
              </Text>
              <HStack spacing="4" justify="center" mb="6">
                <PinInput
                  otp
                  size="lg"
                  value={verificationCode}
                  onChange={setVerificationCode}
                  onComplete={handleVerifyCode}
                >
                  {[...Array(6)].map((_, i) => (
                    <PinInputField key={i} fontFamily="secondary" />
                  ))}
                </PinInput>
              </HStack>
              <Button
                w="100%"
                bg="primary"
                borderRadius="5px"
                color="#fff"
                _hover={{ bg: "buttonHover" }}
                _active={{ bg: "buttonHover" }}
                fontFamily="secondary"
                fontWeight="normal"
                onClick={() => setStep(1)}
                isDisabled={countdown > 0}
              >
                {countdown > 0
                  ? `Espera ${countdown} segundos...`
                  : "Solicitar nuevo código"}
              </Button>
            </Flex>
          )}
        </Flex>
      </Container>
      <Footer />
    </>
  );
};

export default RecoverPassword;