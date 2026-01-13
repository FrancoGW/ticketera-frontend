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
import { motion } from "framer-motion";
import { getObjDate } from "../../common/utils";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: index * 0.1,
    },
  }),
};

export default function EventCard({
  id,
  pictures,
  title,
  dates,
  addressRef,
  cheapestTicket,
  index = 0,
}) {
  const navigate = useNavigate();

  return (
    <Flex
      as={motion.div}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{
        scale: 1.05,
        y: -10,
        transition: {
          duration: 0.3,
          ease: "easeInOut",
        },
      }}
      whileTap={{
        scale: 0.98,
      }}
      flexDir={{base:'row' ,md:'column'}}
      w={{base:'100%',md:'300px'}}
      h={{base:"150px",md:"auto"}}
      mb="6"
      boxShadow="rgba(0, 0, 0, 0.35) 0px 5px 15px"
      cursor="pointer"
      onClick={() => navigate(`/event/${id}`)}
      borderRadius="md"
      overflow="hidden"
      bg="white"
      _hover={{
        boxShadow: "rgba(0, 0, 0, 0.5) 0px 10px 25px",
      }}
      transition="box-shadow 0.3s ease"
    >
      <Image
        as={motion.img}
        minHeight={{base:"150px",md:"300px"}}
        src={
          pictures
            ? (pictures.startsWith('http') ? pictures : "data:image/png;base64," + pictures)
            : "./imagenes/img1.jpeg"
        }
        alt=""
        h={{base:'150px',md:'300px'}}
        minW={{base:"150px",md:"100%"}}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        objectFit="cover"
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
          as={motion.button}
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          Comprar ahora
        </Button>
      </Flex>
    </Flex>
  );
}
