import { React } from "react";
import {
  Flex,
  Image,
  Link,
  Text,
  Heading,
  Button,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";
import { useNavigate } from "react-router";
import { getObjDate } from "../../common/utils";

export default function EventCard({
  id,
  pictures,
  title,
  dates,
  addressRef,
  cheapestTicket,
}) {
  const navigate = useNavigate();

  return (
    <Flex
      flexDir={{base:'row' ,md:'column'}}
      w={{base:'100%',md:'300px'}}
      h={{base:"150px",md:"auto"}}
      mb="6"
      boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px"
      cursor="pointer"
      onClick={() => navigate(`/event/${id}`)}
      // display={{ base: "flex", md: "none" }}
      
    >
      <Image
        minHeight={{base:"150px",md:"300px"}}
        src={
          pictures
            ? (pictures.startsWith('http') ? pictures : "data:image/png;base64," + pictures)
            : "./imagenes/img1.jpeg"
        }
        alt=""
        h={{base:'150px',md:'300px'}}
        minW={{base:"150px",md:"100%"}}
      />
      <Flex
        flexDir="column"
        align={{base:'start',md:'start'}}
        justify="space-between"
        h={{base:"100%",md:'60%'}}
        minH={{base:'auto',md:'200px'}}
        width={{base:"100%",md:'auto'}}
        fontSize="smaller"
        textTransform={'capitalize'}
        gap="0.5"
      >
        <Heading 
        as="h2" 
        fontSize={{base:'15px',md:'20px'}}
        fontFamily="secondary" 
        fontWeight="500" 
        color={{base:"#000",md:"#000"}}
        my={{base:'0',md:"2"}}
        ml={{base:'0',md:"3"}}
        pb={{base:'0rem',md:"0"}}
        pt={{base:'.5rem',md:'0'}}
        bg={{base:'transparent',md:' transparent'}}
        w='100%'
        textAlign={{base:'center',md:'start'}}
        textTransform={"uppercase"}
        display={{base:'flex', md:'block'}}
        justifyContent={{base:'center'}}
        alignItems={{base:'center'}}
        >
          {title}
        </Heading>
        <Divider borderColor="#000" opacity="0.1" display={{base:'block',md:'none'}}/>

        <Flex
         align="center"
         ml={{base:"0",md:"3"}} 
         gap="2"
         justifyContent={{base:'start'}}
         marginLeft={{base:'2rem'}}
        >
          <Icon as={FaCalendarAlt} />
          <Text mt="2px" fontFamily="secondary" fontWeight="500" ml="px" textTransform='initial' fontSize={{base:'.7rem',md:'.8rem'}}>
            {dates?.length > 1 && "Prox: "}
            {getObjDate(dates[0])?.date} a las {getObjDate(dates[0])?.timeStart}
          </Text>
        </Flex>
        <Divider borderColor="#000" opacity="0.1" />
        <Flex align="center" ml={{base:'2rem', md:'3'}} gap="2">
        <Icon as={FaMapMarkerAlt} />
          <Text mt="2px" fontFamily="secondary"  fontWeight="300" fontSize={{base:'.7rem',md:'.8rem'}}>{addressRef?.place}</Text>
        </Flex>
        <Divider borderColor="#000" opacity="0.1" />
        <Flex align="center" ml={{base:'2rem', md:'3'}} mb={{base:'2'}} gap="2">
        <Icon as={FaTicketAlt} mt="1.5px" />
          <Text mt="2px" fontFamily="secondary" fontWeight="300" fontSize={{base:'.7rem',md:'.8rem'}}>A partir de ${cheapestTicket?.price}</Text>
        </Flex>

        <Button
          display={{base:"none",md:"block"}}
          bg="primary"
          w="100%"
          color="white"
          _hover={{
            borderTop: "1px solid #000",
            color: "white",
            bg: "buttonHover",
          }}
          _active=""
          borderRadius="0"
            h={{base:'40px',md:'40px'}}
          fontFamily="secondary"
          fontWeight="400"
        >
          Comprar ahora
        </Button>
      </Flex>
    </Flex>
  );
}
