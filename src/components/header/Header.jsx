import { React, useEffect, useState } from "react";
import {
  Link,
  Button,
  Flex,
  useDisclosure,
  Icon,
  UnorderedList,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Box,
  Divider,
  Text,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { IoMdContact } from "react-icons/io";
import { motion } from "framer-motion";
import logo from "/assets/img/logo.png";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "../../auth/context/AuthContext";
import "./Style.css";

function Header() {
  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);
  const { user, logout, isLoading: authLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleBodyClass = () => {
    const body = document.querySelector("body");
    if (isOpen) {
      body.classList.add("no-scroll");
    } else {
      body.classList.remove("no-scroll");
    }
  };

  useEffect(() => {
    toggleBodyClass();
  }, [isOpen]);

  const handleLogout = async (e) => {
    e?.preventDefault();
    try {
      await logout();
    } catch (error) {
      console.error("Error en logout:", error);
      // Forzar limpieza incluso si hay error
      window.location.href = "/login";
    }
  };

  // Helper function to check roles
  const hasRole = (roleToCheck) => {
    const userRoles = user?.roles || (user?.rol ? [user.rol] : []);
    return user && Array.isArray(userRoles) && userRoles.includes(roleToCheck);
  };

  return (
    <>
      <Flex
        as={motion.div}
        className={`header ${scrolled ? "scrolled" : ""}`}
        bg="#000"
        w="100%"
        align="center"
        justify={{ base: "", sm: "space-between" }}
        px="4"
        h="5rem"
        position="fixed"
        top="0"
        left="0"
        right="0"
        zIndex={100}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        boxShadow={scrolled ? "0 2px 10px rgba(0,0,0,0.1)" : "none"}
      >
        <Link
          href="/"
          className="logo"
          w="150px"
          textDecoration="none"
          _hover={{ textDecoration: "none", opacity: 1 }}
          as={motion.a}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Heading
            color="#fff"
            fontSize="25px"
            textAlign="center"
            fontWeight="300"
            fontFamily="Monument Extended"
          >
            YVY PASS
          </Heading>
        </Link>
        <Flex
          gap="4"
          align="center"
          justify="center"
          mr="4"
          display={{ base: "none", md: "flex" }}
        >
          <UnorderedList
            display="flex"
            gap="2rem"
            alignItems="center"
            justifyContent="center"
            color="#fff"
            className="contentLinks"
          >
            <Link
              href="/about-us"
              fontSize="smaller"
              _hover={{ color: "secondary", bg: "none" }}
              fontFamily="secondary"
              translate="no"
              as={motion.a}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Sobre PaseTicket
            </Link>
            <Link
              href="/contact"
              fontSize="smaller"
              fontFamily="secondary"
              _hover={{ color: "secondary", bg: "none" }}
              as={motion.a}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              Contacto
            </Link>
            {!user && (
              <>
                <Link
                  href="/login"
                  fontSize="smaller"
                  _hover={{ color: "secondary", bg: "none" }}
                  fontFamily="secondary"
                  as={motion.a}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  Iniciar Sesion
                </Link>
                <Link
                  href="/register"
                  fontSize="smaller"
                  fontFamily="secondary"
                  _hover={{ color: "secondary", bg: "none" }}
                  as={motion.a}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  Registrate
                </Link>
              </>
            )}
            {user && (
              <Box m="0" py="10px">
                <Popover trigger={"hover"} placement={"bottom-start"}>
                  <PopoverTrigger>
                    <Box
                      bg="none"
                      _active="none"
                      fontFamily="secondary"
                      fontSize="smaller"
                      _hover={{ color: "secondary", bg: "none" }}
                      cursor="pointer"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {authLoading ? (
                        <Flex align="center">
                          <Text>Cargando</Text>
                          <Spinner size="sm" ml={2} color="white" />
                        </Flex>
                      ) : (
                        user?.firstname || user?.email?.split('@')[0] || 'Usuario'
                      )}
                      <Icon
                        ml="2"
                        as={IoMdContact}
                        fontSize="xl"
                        fill="white"
                        _hover={{ fill: "secondary" }}
                        transition="ease 0.2s"
                      />
                    </Box>
                  </PopoverTrigger>
                  <PopoverContent bg="primary" border="none" w="160px">
                    <PopoverBody display="flex" flexDir="column" gap="2" p="3">
                      <Link
                        href="/profile"
                        _hover={{ color: "secondary", bg: "none" }}
                        fontFamily="secondary"
                        textTransform='capitalize'
                      >
                        Perfil
                      </Link>
                      {hasRole("admin") && (
                        <>
                          <Divider />
                          <Link
                            href="/admin/events"
                            _hover={{ color: "secondary", bg: "none" }}
                            fontFamily="secondary"
                            textTransform='capitalize'
                          >
                            Administrar
                          </Link>
                        </>
                      )}
                      {hasRole("pdv") && (
                        <>
                          <Divider />
                          <Link
                            href="/pdv/dashboard"
                            _hover={{ color: "secondary", bg: "none" }}
                            fontFamily="secondary"
                            textTransform='capitalize'
                          >
                            Panel PDV
                          </Link>
                          <Link
                            href="/pdv/tickets"
                            _hover={{ color: "secondary", bg: "none" }}
                            fontFamily="secondary"
                            textTransform='capitalize'
                          >
                            Mis Ventas
                          </Link>
                          <Link
                            href="/pdv/special-tickets"
                            _hover={{ color: "secondary", bg: "none" }}
                            fontFamily="secondary"
                            textTransform='capitalize'
                          >
                            Tickets Especiales
                          </Link>
                        </>
                      )}
                      {(hasRole("seller") || hasRole("admin")) && (
                        <>
                          <Divider />
                          <Link
                            href="/profile/my-events"
                            _hover={{ color: "secondary", bg: "none" }}
                            fontFamily="secondary"
                            textTransform='capitalize'
                          >
                            Mis Eventos
                          </Link>
                        </>
                      )}
                      <Divider />
                      <Link
                        href="/profile/my-tickets"
                        _hover={{ color: "secondary", bg: "none" }}
                        fontFamily="secondary"
                        textTransform='capitalize'
                      >
                        Mis E-Tickets
                      </Link>
                      <Divider />
                      <Link
                        href="#"
                        onClick={handleLogout}
                        _hover={{ color: "secondary", bg: "none" }}
                        fontFamily="secondary"
                        textTransform='capitalize'
                      >
                        Cerrar Sesión
                      </Link>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </Box>
            )}
          </UnorderedList>
        </Flex>

        {/* NAVBAR MOBILE */}
        <Button
          {...getButtonProps()}
          px="3"
          bg="none"
          _hover={{ bg: "none" }}
          _active={{ border: "none" }}
          aria-label="open menu"
          display={{ base: "block", md: "none" }}
          position={isOpen ? "fixed" : "absolute"}
          right="2"
          top="5"
          zIndex="300"
          color="white"
          as={motion.button}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
        >
          {!isOpen ? (
            <HamburgerIcon w="40px" h="40px" />
          ) : (
            <CloseIcon w="30px" h="30px" />
          )}
        </Button>
        <Flex
          as={motion.div}
          {...getDisclosureProps()}
          hidden={hidden}
          initial={false}
          onAnimationStart={() => setHidden(false)}
          onAnimationComplete={() => setHidden(false)}
          animate={{
            width: isOpen ? "100vw" : "0",
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          display={{ md: "none" }}
          flexDirection="column"
          bg="#b78dea"
          overflow="hidden"
          position={isOpen ? "fixed" : "absolute"}
          right="0"
          top="0"
          height="100vh"
          zIndex="200"
        >
          <Flex
            flexDir="column"
            w="100%"
            h="100%"
            align="center"
            justify="center"
            gap="4"
            position="relative"
            display={isOpen ? "flex" : "none"}
          >
            <Link
              fontFamily="secondary"
              href="/about-us"
              _hover={{ color: "primary", bg: "none" }}
              color="#fff"
              translate="no"
              as={motion.a}
              initial={{ x: 50, opacity: 0 }}
              animate={isOpen ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              Sobre PaseTicket
            </Link>

            <Link
              fontFamily="secondary"
              href="/Contact"
              _hover={{ color: "primary", bg: "none" }}
              color="#fff"
              as={motion.a}
              initial={{ x: 50, opacity: 0 }}
              animate={isOpen ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              Contacto
            </Link>
            {user && (
              <>
                <Link
                  fontFamily="secondary"
                  href="/profile"
                  _hover={{ color: "secondary", bg: "none" }}
                  color="#fff"
                >
                  Perfil
                </Link>

                {hasRole("admin") && (
                  <Link
                    fontFamily="secondary"
                    href="/admin/events"
                    _hover={{ color: "secondary", bg: "none" }}
                    color="#fff"
                  >
                    Administrar
                  </Link>
                )}

                {hasRole("pdv") && (
                  <>
                    <Link
                      fontFamily="secondary"
                      href="/pdv/dashboard"
                      _hover={{ color: "secondary", bg: "none" }}
                      color="#fff"
                    >
                      Panel PDV
                    </Link>
                    <Link
                      fontFamily="secondary"
                      href="/pdv/tickets"
                      _hover={{ color: "secondary", bg: "none" }}
                      color="#fff"
                    >
                      Mis Ventas
                    </Link>
                    <Link
                      fontFamily="secondary"
                      href="/pdv/special-tickets"
                      _hover={{ color: "secondary", bg: "none" }}
                      color="#fff"
                    >
                      Tickets Especiales
                    </Link>
                  </>
                )}

                {(hasRole("seller") || hasRole("admin")) && (
                  <Link
                    fontFamily="secondary"
                    href="/profile/my-events"
                    _hover={{ color: "secondary", bg: "none" }}
                    color="#fff"
                  >
                    Mis Eventos
                  </Link>
                )}

                <Link
                  fontFamily="secondary"
                  href="/profile/my-tickets"
                  _hover={{ color: "secondary", bg: "none" }}
                  color="#fff"
                >
                  Mis E-Tickets
                </Link>

                <Link
                  fontFamily="secondary"
                  href="#"
                  onClick={handleLogout}
                  _hover={{ color: "secondary", bg: "none" }}
                  color="#fff"
                >
                  Cerrar Sesión
                </Link>

                <Link href="/new-event" mt="3" _hover="none" _active="none">
                  <Button
                    bg="primary"
                    size="sm"
                    color="white"
                    _hover="none"
                    _active="none"
                    transition="ease 0.2s"
                    ml="2"
                    fontFamily="secondary"
                    textTransform="uppercase"
                  >
                    CREAR EVENTO
                  </Button>
                </Link>
              </>
            )}
            {!user && (
              <>
                <Link
                  href="/login"
                  _hover={{ color: "primary", bg: "none" }}
                  fontFamily="secondary"
                  color="#fff"
                >
                  Iniciar Sesión
                </Link>

                <Link
                  href="/register"
                  _hover={{ color: "primary", bg: "none" }}
                  fontFamily="secondary"
                  color="#fff"
                >
                  Regístrate
                </Link>
              </>
            )}
            <Link
              position="absolute"
              mx="auto"
              left="0"
              right="0"
              bottom="4"
              href="/"
              w="80px"
              h="80px"
            >
              <img src={logo} alt="" />
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

export default Header;