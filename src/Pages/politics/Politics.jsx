import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import {
  Container,
  Flex,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

import "./style.css";
function Politics() {
  return (
    <>
      <Header />

      <Container maxW="7xl" minH="70vh" my="10" fontFamily="secondary">
        <Container maxW="8xl">
          <Flex
            flexDir={{ base: "column", xl: "row" }}
            align="center"
            paddingBottom="2rem"
            gap="10"
          >
            <Flex flexDir="column">
              <Heading as="h1" fontFamily="secondary" color="#7253c9" mb="3">
                Aspectos Legales
              </Heading>
              <Text fontFamily="secondary">
                ¡Le damos la bienvenida a PASETICKET!
              </Text>
              <Heading as="h3" fontFamily="secondary" color="#7253c9" mt="8" mb="4">
                Sobre Nosotros
              </Heading>
              <Text fontFamily="secondary" mb="2">
                - PASETICKET es una empresa especializada en comercialización de
                entradas digitales para eventos a través de una plataforma
                digital.
              </Text>
              <Text fontFamily="secondary">
                - Para utilizar PASETICKET, usted declara ser mayor de edad o,
                en caso contrario, deberá contar con el consentimiento de un
                tutor autorizado.
              </Text>
            </Flex>
          </Flex>
          <List spacing={6}>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Primero
                  </Text>
                </Flex>
                PASETICKET es una plataforma digital intermediaria entre el
                ORGANIZADOR y el público. PASETICKET presta únicamente el
                servicio de comercialización, difusión y distribución de
                entradas.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Segundo
                  </Text>
                </Flex>
                El ORGANIZADOR es responsable de los precios fijados por ingreso
                y la organización, producción y correcta ejecución del evento,
                debido a eso PASETICKET no asume garantías por los temas
                anteriormente citados.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Tercero
                  </Text>
                </Flex>
                El ORGANIZADOR es el encargado de agregar, modificar o quitar
                información sobre el evento (artistas, precio de las entradas,
                capacidad, ubicación, predio, edad mínima permitida).
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Cuarto
                  </Text>
                </Flex>
                El ORGANIZADOR se reserva el derecho de admisión y permanencia.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Quinto
                  </Text>
                </Flex>
                PASETICKET no realiza devoluciones una vez finalizado el proceso
                de compra. El cliente es responsable de prestar atención en el
                transcurso de selección de fecha, ubicación, sector, tipo de
                evento y más.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Sexto
                  </Text>
                </Flex>
                Si el evento es modificado, reprogramado o cancelado, la
                devolución del dinero es exclusiva responsabilidad del
                PRODUCTOR.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Séptimo
                  </Text>
                </Flex>
                En caso de suspensión del evento los montos devueltos por el
                ORGANIZADOR no incluirán la comisión de PASETICKET. (Costo por
                servicio del QUINCE POR CIENTO (15%)).
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Octavo
                  </Text>
                </Flex>
                La confirmación de la compra realizada está sujeta a la
                autorización de la empresa emisora de la tarjeta.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Noveno
                  </Text>
                </Flex>
                El COMPRADOR es responsable de aceptar y confirmar los términos
                y condiciones.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Décimo
                  </Text>
                </Flex>
                Al adquirir la entrada a través de PASETICKET recibirá en su
                correo registrado o podrá descargar de la página un código QR
                único que será la entrada al evento.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Décimo Primero
                  </Text>
                </Flex>
                Cuando reciba o descargue sus tickets, el COMPRADOR es
                responsable de guardarlo en un lugar seguro. PASETICKET no
                realiza cambios si estos han sido robados o extraviados.
              </Flex>
            </ListItem>
            <ListItem>
              <Flex flexDirection="column">
                <Flex align="center" mt="2">
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  <Text size="17px" marginRight="1rem" fontWeight="bold">
                    Décimo Segundo
                  </Text>
                </Flex>
                Los únicos tickets digitales válidos para el ingreso al evento
                son los adquiridos a través de PASETICKET. Evite reventa, compra
                de tickets robados y/o falsificaciones.
              </Flex>
            </ListItem>
          </List>
          <Text size="20px"> *
            PASETICKET publica información otorgada por el ORGANIZADOR, por lo
            tanto, no es responsable en cambios del evento. Así como tampoco se
            responsabiliza por daños o lesiones sufridas durante el desarrollo
            del mismo. *
          </Text>
        </Container>
      </Container>

      <Footer />
    </>
  );
}

export default Politics;
