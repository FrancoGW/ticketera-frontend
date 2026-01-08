import { Container, Heading } from "@chakra-ui/react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
} from "@chakra-ui/react";
import "./Style.css";
function Preguntas() {
  return (
    <div className="bodyUs">
      <Header />

      <Container maxW="7xl" minH="70vh" my="10" bg="#fff">
        <Heading fontFamily="secondary" color="#7253c9" mb="10">
          Preguntas Frecuentes
        </Heading>
        <div className="contentQuestions">
          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton _expanded={{ bg: "#000", color: "white" }}>
                  <Box as="span" flex="1" textAlign="left">
                    ¿Cómo compro la entrada?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                Es muy simple! Buscá el evento que vas a asistir, seleccioná la
                entrada, cantidad que quieras y dale clic a comprar. Luego
                finalizá el proceso siguiendo los pasos y listo.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton _expanded={{ bg: "#000", color: "white" }}>
                  <Box as="span" flex="1" textAlign="left">
                    ¿Cómo pago la entrada?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                Pagala con tarjeta de crédito o débito.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton _expanded={{ bg: "#000", color: "white" }}>
                  <Box as="span" flex="1" textAlign="left">
                    ¿Dónde recibo la entrada?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                Una vez finalizado el paso anterior y se valida la compra
                recibirás en tu correo la entrada personalizada con tus datos,
                además podes descargarla desde tu usuario en www.paseticket.com.
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton _expanded={{ bg: "#000", color: "white" }}>
                  <Box as="span" flex="1" textAlign="left">
                    ¿Cómo ingreso al evento?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                A la hora de estar en puerta, simplemente debes mostrar la
                entrada en tu celular la cual será escaneada por un acreditador
                y listo! A disfrutar!
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </Container>

      <Footer />
    </div>
  );
}

export default Preguntas;
