import React from 'react'
import "./Style.css"
import {Flex, Heading, Link} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import logo from "/assets/img/logo.png"

const footerVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function Footer() {
    const navigate = useNavigate()
  
    return (
    <motion.div
      className='footer'
      variants={footerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
    >
        <div className='contentInformation'>
            <div className='categories'>
                <Heading as="h3" fontFamily="secondary" fontWeight="500" fontSize="26px" mb="3">CATEGORÍAS</Heading>
                <Link
                  className='item'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  Presencial
                </Link>
                
            </div>
            <div className='event'>
                <Heading as="h3" fontFamily="secondary" fontWeight="500" fontSize="26px" mb="3">TU EVENTO</Heading>
                <Link
                  className='item'
                  href='/producers'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  ¿Eres Productor? Conocé más aquí
                </Link>
                <Link
                  className='item'
                  href='/new-event'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  Crear Evento
                </Link>
                <Link
                  className='item'
                  href='/politics'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  Términos y Condiciones
                </Link>
            </div>
            <div className='information'>
                <Heading as="h3" fontFamily="secondary" fontWeight="500" fontSize="26px" mb="3" translate="no">YVY PASS</Heading>
                <Link
                  className='item'
                  href='/about-us'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  ¿Qué es YVY PASS?
                </Link>
                <Link
                  className='item'
                  href='/faq'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  Preguntas Frecuentes
                </Link>
                <Link
                  className='item'
                  href='/register'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  Regístrate
                </Link>
                <Link
                  className='item'
                  href='/contact'
                  fontFamily="secondary"
                  fontWeight="300"
                  as={motion.a}
                  whileHover={{ x: 5, color: "#4dd0e1" }}
                  transition={{ duration: 0.2 }}
                >
                  Contacto
                </Link>

            </div>


        </div>
        <Flex
          className='contentLogo'
          onClick={() => navigate("/")}
          mt={{base: "6", sm: "0"}}
          as={motion.div}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          cursor="pointer"
        >
           <Link className='logo'><img src={logo} alt="" /></Link> 
           <div className='contentNumbers'>
               <Heading
                 as="h3"
                 color="#fff"
                 fontFamily="secondary"
                 fontWeight="500"
                 _hover={{color: "#4dd0e1"}}
                 transition="ease-in-out 0.1s"
                 cursor="pointer"
                 translate="no"
               >
                 YVY PASS
               </Heading>
           </div>
        </Flex>


    </motion.div>
  )
}

export default Footer