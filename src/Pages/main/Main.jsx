import EventContainer from "../../components/eventContainer/EventContainer.jsx";
import Header from "../../components/header/Header.jsx";
import Footer from "../../components/footer/Footer.jsx";
import { Container, Box } from "@chakra-ui/react";
import Flyer from "../../components/flyer/Flyer";
import "./Style.css";

const Main = () => {
  return (
    <Box w="100%" position="relative" >
      <Header />
      <Flyer />
      <Container maxW="100vw" minH="500px" m="auto" px={{base: 1, md: "10"}}>
        <EventContainer />
      </Container>
      <Footer />
    </Box>
  );
};

export default Main;
