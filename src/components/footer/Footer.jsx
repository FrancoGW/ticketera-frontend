import React from 'react'
import "./Style.css"
import {Flex, Heading, Link} from '@chakra-ui/react'
import { useNavigate } from 'react-router'
import logo from "/assets/img/logo.png"

function Footer() {
    const navigate = useNavigate()
  
    return (
    <div className='footer'>
        <div className='contentInformation'>
            <div className='categories'>
                <Heading as="h3" fontFamily="secondary" fontWeight="500" fontSize="26px" mb="3">CATEGORÍAS</Heading>
                <Link className='item' fontFamily="secondary" fontWeight="300">Presencial</Link>
                
            </div>
            <div className='event'>
                <Heading as="h3" fontFamily="secondary" fontWeight="500" fontSize="26px" mb="3">TU EVENTO</Heading>
                <Link className='item' href='/producers' fontFamily="secondary" fontWeight="300">¿Eres Productor? Conocé más aquí</Link>
                <Link className='item' href='/new-event' fontFamily="secondary" fontWeight="300">Crear Evento</Link>
                <Link className='item' href='/politics' fontFamily="secondary" fontWeight="300">Términos y Condiciones</Link>
            </div>
            <div className='information'>
                <Heading as="h3" fontFamily="secondary" fontWeight="500" fontSize="26px" mb="3" translate="no">YVY PASS</Heading>
                <Link className='item' href='/about-us' fontFamily="secondary" fontWeight="300">¿Qué es YVY PASS?</Link>
                <Link className='item' href='/faq' fontFamily="secondary" fontWeight="300">Preguntas Frecuentes</Link>
                <Link className='item' href='/register' fontFamily="secondary" fontWeight="300">Regístrate</Link>
                <Link className='item' href='/contact' fontFamily="secondary" fontWeight="300">Contacto</Link>

            </div>


        </div>
        <Flex className='contentLogo' onClick={() => navigate("/")} mt={{base: "6", sm: "0"}}>
           <Link className='logo'><img src={logo} alt="" /></Link> 
           <div className='contentNumbers'>
               <Heading as="h3" color="#fff" fontFamily="secondary" fontWeight="500" _hover={{color: "#4dd0e1"}} transition="ease-in-out 0.1s" cursor="pointer" translate="no" >YVY PASS</Heading>
           </div>
        </Flex>


    </div>
  )
}

export default Footer