import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import { Box, Container, Heading,Icon } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import "./Style.css";
function Productores() {
  const iconarrow = (
    <FontAwesomeIcon className="iconArrow" icon={faAnglesRight} />
  );
  return (
    <>
      <Header />

      <Container maxW="7xl" minH="70vh">
        <div className="titleProductores">
          <Heading color="#7253c9" fontFamily="secondary">
            Información para Productores
          </Heading>
        </div>
        <ul>
          <li>
            
            <div>{iconarrow}</div>
            El valor agregado por entrada es el QUINCE POR CIENTO (15%) sin posibilidad de ser 
reducido por parte de EL ORGANIZADOR, ni ser aumentado por parte del prestador de 
servicios (PASETICKET)
          </li>
          <li>
            <div>{iconarrow}</div>
            El ORGANIZADOR es responsable de los precios fijados por ingreso y la organización, 
producción y correcta ejecución del evento. Debido a esto, PASETICKET no asume 
garantías por los temas anteriormente citados.
          </li>
          <li>
            <div>{iconarrow}</div>
            El ORGANIZADOR es el encargado de agregar, modificar o quitar información sobre el 
evento (artistas, precio de las entradas, capacidad, ubicación, predio, edad mínima 
permitida).
          </li>
          <li>
          <div>{iconarrow}</div>
          EL ORGANIZADOR se reserva al derecho de admisión.
          </li>
          <li>
          <div>{iconarrow}</div>                          
          EL ORGANIZADOR dispone del capital antes de la realización del evento, por lo tanto 
PASETICKET no es responsable de reintegros una vez finalizado el mismo.
          </li>
         
        </ul>
       
      </Container>

      <Footer />
    </>
  );
}

export default Productores;
