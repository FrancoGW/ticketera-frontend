import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import { Button, Container, Flex, Text, useToast } from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Heading,
} from "@chakra-ui/react";
import "./Style.css";
import { useState } from "react";
import userApi from "../../Api/user";

function Contact() {
  const [formValues, setformValues] = useState({
    name: "",
    email: "",
    message: "",
  })
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    setformValues({
      ...formValues,
      [e.target.name]: e.target.value
    })
  }

  const sendContactEmail = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await userApi.sendContactEmail(formValues)
      toast({
        title: "Correo enviado",
        description: "El correo se envió correctamente",
        status: "success",
        duration: 9000,
        isClosable: true,
      })
      setformValues({
        name: "",
        email: "",
        message: "",
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el correo",
        status: "error",
        duration: 9000,
        isClosable: true,
      })
    }
    setIsLoading(false)
  }

  return (
    <>
      <Header />
      <Flex pt="2rem" pb="2rem">
        <Container className="" maxW="container.sm">
          <Heading
            mb="10"
            textAlign="center"
            as="h2"
            fontFamily="secondary"
            fontWeight="semibold"
            color="tertiary"
          >
            CONTÁCTANOS
          </Heading>
          <Flex boxShadow="lg" p="8">
            <form onSubmit={sendContactEmail} style={{ width: "100%" }}>
              <FormControl
                action=""
                isRequired
                w="100%"
                display="flex"
                flexDir="column"
                gap="8"
              >
                <Flex flexDir="column">
                  <FormLabel fontFamily="secondary">Nombre</FormLabel>
                  <Input 
                    type="text" 
                    placeholder="Nombre Completo" 
                    name="name"
                    onChange={handleInputChange}
                    value={formValues.name}
                  />
                </Flex>
                <Flex flexDir="column">
                  <FormLabel>E-mail</FormLabel>
                  <Input
                    className="mail"
                    type="email"
                    placeholder="Correo Electrónico"
                    name="email"
                    onChange={handleInputChange}
                    value={formValues.email}
                  />
                </Flex>

                <Flex flexDir="column">
                  <FormLabel fontFamily="secondary">Tu Mensaje</FormLabel>
                  <Textarea
                    placeholder="Tu mensaje"
                    name="message"
                    onChange={handleInputChange}
                    value={formValues.message}
                    id=""
                    resize="none"
                  ></Textarea>
                </Flex>
                <Button
                  type="submit"
                  bg="primary"
                  borderRadius="5px"
                  color="#fff"
                  _hover={{ bg: "buttonHover" }}
                  _active={{ bg: "buttonHover" }}
                  fontFamily="secondary"
                  fontWeight="normal"
                  isLoading={isLoading}
                >
                  Enviar
                </Button>
              </FormControl>
            </form>
          </Flex>
          <Text textAlign="center" mt="8" fontFamily="secondary">
            * Los comentarios y descripción del evento ingresados son de
            exclusiva responsabilidad del ORGANIZADOR. El ORGANIZADOR es el
            único y exclusivo responsable de la producción y organización del
            evento. PASETICKET no se responsabiliza por declaraciones emitidas
            por los mismos. La recaudación de las entradas en su totalidad
            también es resonsabilidad del ORGANIZADOR. PASETICKET es una
            plataforma de terceros sin responsabilidad en cancelaciones y/o
            modificaciones en los eventos*
          </Text>
        </Container>
      </Flex>
      <Footer />
    </>
  );
}

export default Contact;
