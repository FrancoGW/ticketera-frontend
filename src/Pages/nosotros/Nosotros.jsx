import React from "react";
import { Container, Flex, Heading, Image, Text } from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import img from "/assets/img/events.svg";
import img2 from "/assets/img/how.svg";
import img3 from "/assets/img/mision.svg";
import img4 from "/assets/img/vision.svg";
import img5 from "/assets/img/values.svg";
import "./Style.css";

function nosotros() {
  return (
    <div className="bodyUs">
      <Header />
      <Container
        width={{
          base: "100%",
          xl: "7xl",
        }}
        maxW="7xl"
        minH="70vh"
        my="10"
        display="flex"
        flexDir="column"
        gap="16"
      >
        <Flex
          flexDir={{ base: "column", md: "row" }}
          justify="center"
          align="center"
          padding={{ base: "5", xl: "20" }}
          gap="16"
          textAlign="center"
        >
          <Flex flexDir="column" gap="4" align="center">
            <Heading
              color="tertiary"
              fontFamily="primary"
              fontWeight="bold"
              fontSize={{ base: "30px", lg: "40px" }}
              as="h3"
            >
              Sobre YVY PASS
            </Heading>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              ¡Es muy fácil! debes ingresar a nuestra página de INICIO e ir
              arriba a la derecha donde dice CREAR EVENTO. Allí podrás crear tu
              evento y automáticamente generar una ticketera online ofreciendo
              todos los medios de pago (tarjetas).
            </Text>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              Accede a un panel de control, que te permitirá administrar todo lo
              que necesitas para gestionar la venta y control de acceso para tus
              eventos.
            </Text>
          </Flex>
          <Image className="usImg" src={img} alt="events" />
        </Flex>

        <Flex
          flexDir={{ base: "column-reverse", md: "row" }}
          justify="center"
          align="center"
          padding={{ base: "5", xl: "20" }}
          gap="16"
        >
          <Image className="usImg" src={img2} alt="events" />
          <Flex flexDir="column" gap="4" align="center">
            <Heading
              color="tertiary"
              fontFamily="primary"
              fontWeight="bold"
              fontSize={{ base: "30px", lg: "40px" }}
              textAlign={{ base: "center" }}
              as="h3"
            >
              ¿Cómo funciona YVY PASS?
            </Heading>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              YVY PASS es una plataforma de eventos  que te permite
              crear, buscar, compartir y asistir a tus eventos favoritos.
            </Text>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              Desde festivales de música, fiestas, conferencias, workshops,
              eventos ondemand, maratones, competencias de videojuegos,
              discotecas y mucho más.
            </Text>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              Nuestra misión es darle a todos nuestros usuarios la herramienta
              para que puedan administrar y comercializar sus eventos gratis,
              además del espacio para que puedan encontrar y saber todo lo que
              hay para hacer.
            </Text>
          </Flex>
        </Flex>

        <Flex
          flexDir={{ base: "column", md: "row" }}
          justify="center"
          align="center"
          padding={{ base: "5", xl: "20" }}
          gap="16"
        >
          <Flex flexDir="column" gap="4" align="center">
            <Heading
              color="tertiary"
              fontFamily="primary"
              fontWeight="bold"
              fontSize={{ base: "30px", lg: "40px" }}
              as="h3"
            >
              Misión
            </Heading>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              Brindar un servicio eficiente y de excelente calidad, otorgando
              comodidad y seguridad a nuestros clientes en todo momento acorde a
              las necesidades de cada uno.
            </Text>
          </Flex>
          <Image className="usImg" src={img3} alt="events" />
        </Flex>

        <Flex
          flexDir={{ base: "column-reverse", md: "row" }}
          justify="center"
          align="center"
          padding={{ base: "5", xl: "20" }}
          gap="16"
        >
          <Image className="usImg" src={img4} alt="events" />
          <Flex flexDir="column" gap="4" align="center">
            <Heading
              color="tertiary"
              fontFamily="primary"
              fontWeight="bold"
              fontSize={{ base: "30px", lg: "40px" }}
              as="h3"
            >
              Visión
            </Heading>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              Convertirnos en una empresa fuerte y consolidada en el mercado por
              medio de un excepcional servicio brindado a nuestros clientes.
            </Text>
          </Flex>
        </Flex>

        <Flex
          flexDir={{ base: "column", md: "row" }}
          justify="center"
          align="center"
          padding={{ base: "5", xl: "20" }}
          gap="16"
        >
          <Flex flexDir="column" gap="4" align="center">
            <Heading
              color="tertiary"
              fontFamily="primary"
              fontWeight="bold"
              fontSize={{ base: "30px", lg: "40px" }}
              textAlign={{ base: "center" }}
              as="h3"
            >
              Valores
            </Heading>
            <Text
              fontFamily="secondary"
              fontSize={{ base: "15px", lg: "20px" }}
              textAlign="center"
            >
              La calidad de nuestro servicio se basa en los siguientes valores:
              Seguridad, honestidad, confianza, respeto, comodidad y
              puntualidad. Además, estamos comprometidos con el medio ambiente
              cuidando el verde de nuestro planeta. Al utilizar entradas de
              formato digital evitamos la tala indiscriminada de arboles y su
              posterior utilización en tickets impresos de papel.
            </Text>
          </Flex>
          <Image className="usImg" src={img5} alt="events" />
        </Flex>
      </Container>

      <Footer />
    </div>
  );
}

export default nosotros;
