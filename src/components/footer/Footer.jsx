import React from 'react'
import { 
  Box, 
  Flex, 
  Heading, 
  Link, 
  Text,
  Container,
  HStack,
  Divider
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'

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
  
  const currentYear = new Date().getFullYear();

  return (
    <Box
      className='footer'
      bg="#000"
      w="100%"
      position="relative"
      zIndex={10}
      py={{ base: 8, md: 12 }}
    >
      <Container maxW="6xl" px={{ base: 4, md: 8 }}>
        {/* Top Section: Logo and Name */}
        <Flex
          justify={{ base: "center", md: "flex-start" }}
          align="center"
          py={8}
          gap={4}
        >
          <Flex
            align="center"
            cursor="pointer"
            onClick={() => navigate("/")}
            as={motion.div}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Box
              as="img"
              src="/assets/Logo/Get_Pass_logo_white.svg"
              alt="GetPass"
              h={{ base: "28px", md: "32px" }}
              w="auto"
              objectFit="contain"
            />
          </Flex>
        </Flex>

        <Divider borderColor="rgba(255, 255, 255, 0.1)" mb={8} />

        {/* Links Section */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="center"
          align="center"
          gap={{ base: 4, md: 8 }}
          wrap="wrap"
          mb={8}
        >
          <Link
            href="/about-us"
            fontFamily="secondary"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="400"
            color="rgba(255, 255, 255, 0.8)"
            _hover={{
              color: "#fff",
              textDecoration: "none",
            }}
            transition="color 0.2s"
            as={motion.a}
            whileHover={{ y: -2 }}
          >
            ¿Qué es GetPass?
          </Link>

          <Text
            display={{ base: "none", md: "block" }}
            color="rgba(255, 255, 255, 0.3)"
            fontSize="md"
          >
            •
          </Text>

          <Link
            href="/producers"
            fontFamily="secondary"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="400"
            color="rgba(255, 255, 255, 0.8)"
            _hover={{
              color: "#fff",
              textDecoration: "none",
            }}
            transition="color 0.2s"
            as={motion.a}
            whileHover={{ y: -2 }}
          >
            Registrarme como Organizador
          </Link>

          <Text
            display={{ base: "none", md: "block" }}
            color="rgba(255, 255, 255, 0.3)"
            fontSize="md"
          >
            •
          </Text>

          <Link
            href="/politics"
            fontFamily="secondary"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="400"
            color="rgba(255, 255, 255, 0.8)"
            _hover={{
              color: "#fff",
              textDecoration: "none",
            }}
            transition="color 0.2s"
            as={motion.a}
            whileHover={{ y: -2 }}
          >
            Términos y Condiciones
          </Link>

          <Text
            display={{ base: "none", md: "block" }}
            color="rgba(255, 255, 255, 0.3)"
            fontSize="md"
          >
            •
          </Text>

          <Link
            href="/contact"
            fontFamily="secondary"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="400"
            color="rgba(255, 255, 255, 0.8)"
            _hover={{
              color: "#fff",
              textDecoration: "none",
            }}
            transition="color 0.2s"
            as={motion.a}
            whileHover={{ y: -2 }}
          >
            Soporte
          </Link>
        </Flex>

        <Divider borderColor="rgba(255, 255, 255, 0.1)" mb={6} />

        {/* Copyright Section */}
        <Flex
          justify="center"
          align="center"
          direction="column"
          gap={3}
          py={4}
        >
          <Text
            fontFamily="secondary"
            fontSize="sm"
            color="rgba(255, 255, 255, 0.6)"
            textAlign="center"
          >
            © {currentYear} GetPass. Todos los derechos reservados.
          </Text>
          <Link
            href="https://sftdevelopment.com/"
            isExternal
            fontFamily="secondary"
            fontSize="xs"
            fontWeight="500"
            color="#D8FF37"
            _hover={{
              color: "#D8FF37",
              textDecoration: "none",
            }}
          >
            Powered by SFT DEVELOPMENT
          </Link>
        </Flex>
      </Container>
    </Box>
  )
}

export default Footer
