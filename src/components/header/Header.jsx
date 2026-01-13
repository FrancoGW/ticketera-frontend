import { React, useEffect, useState, useRef, memo } from "react";
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
  VStack,
  HStack,
} from "@chakra-ui/react";
import { IoMdContact } from "react-icons/io";
import { 
  FiHome, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiPlus,
  FiShoppingBag,
  FiBarChart2
} from "react-icons/fi";
import { RiTicket2Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import logo from "/assets/img/logo.png";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "../../auth/context/AuthContext";
import "./Style.css";

function Header() {
  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure();
  const [hidden, setHidden] = useState(!isOpen);
  const { user, logout, isLoading: authLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const hasAnimated = useRef(false);

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

  // Marcar que el header ya se animó después del primer render
  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true;
    }
  }, []);

  // Verificar si el header ya se animó usando sessionStorage
  const shouldAnimate = !sessionStorage.getItem('headerAnimated');
  
  useEffect(() => {
    if (shouldAnimate) {
      sessionStorage.setItem('headerAnimated', 'true');
    }
  }, [shouldAnimate]);

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
        initial={shouldAnimate ? { y: -100 } : false}
        animate={{ y: 0 }}
        transition={shouldAnimate ? { duration: 0.5, ease: "easeOut" } : { duration: 0 }}
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
          bg="rgba(255, 255, 255, 0.1)"
          backdropFilter="blur(10px)"
          _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
          _active={{ bg: "rgba(255, 255, 255, 0.15)" }}
          aria-label="open menu"
          display={{ base: "flex", md: "none" }}
          position={isOpen ? "fixed" : "absolute"}
          right="4"
          top="4"
          zIndex="300"
          color="white"
          borderRadius="full"
          w="48px"
          h="48px"
          alignItems="center"
          justifyContent="center"
          as={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            initial={false}
            animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!isOpen ? (
              <HamburgerIcon w="24px" h="24px" />
            ) : (
              <CloseIcon w="24px" h="24px" />
            )}
          </motion.div>
        </Button>

        {/* Backdrop */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(8px)",
                zIndex: 199,
                display: "block",
              }}
              onClick={getButtonProps().onClick}
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                damping: 30, 
                stiffness: 300,
                duration: 0.4
              }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "85%",
                maxWidth: "400px",
                height: "100vh",
                backgroundColor: "#1a1a1a",
                zIndex: 200,
                boxShadow: "-10px 0 30px rgba(0, 0, 0, 0.3)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Flex
                flexDir="column"
                w="100%"
                h="100%"
                px={6}
                py={8}
                overflowY="auto"
              >
                {/* Header with Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  mb={8}
                >
                  <Link href="/" display="block" mb={6}>
                    <img 
                      src={logo} 
                      alt="Logo" 
                      style={{ 
                        width: "120px", 
                        height: "auto",
                        filter: "brightness(0) invert(1)"
                      }} 
                    />
                  </Link>
                  <Divider borderColor="rgba(255, 255, 255, 0.1)" />
                </motion.div>

                {/* Menu Items */}
                <VStack 
                  align="stretch" 
                  spacing={2}
                  flex="1"
                >
                  {/* Public Links */}
                  <MobileMenuItem
                    href="/about-us"
                    icon={FiHome}
                    label="Sobre PaseTicket"
                    delay={0.15}
                    onClick={getButtonProps().onClick}
                  />
                  <MobileMenuItem
                    href="/Contact"
                    icon={IoMdContact}
                    label="Contacto"
                    delay={0.2}
                    onClick={getButtonProps().onClick}
                  />

                  {user && (
                    <>
                      <Box h={4} />
                      <MobileMenuItem
                        href="/profile"
                        icon={FiUser}
                        label="Mi Perfil"
                        delay={0.25}
                        onClick={getButtonProps().onClick}
                      />

                      {hasRole("admin") && (
                        <MobileMenuItem
                          href="/admin/events"
                          icon={FiSettings}
                          label="Administrar"
                          delay={0.3}
                          onClick={getButtonProps().onClick}
                        />
                      )}

                      {hasRole("pdv") && (
                        <>
                          <MobileMenuItem
                            href="/pdv/dashboard"
                            icon={FiBarChart2}
                            label="Panel PDV"
                            delay={0.3}
                            onClick={getButtonProps().onClick}
                          />
                          <MobileMenuItem
                            href="/pdv/tickets"
                            icon={FiShoppingBag}
                            label="Mis Ventas"
                            delay={0.35}
                            onClick={getButtonProps().onClick}
                          />
                          <MobileMenuItem
                            href="/pdv/special-tickets"
                            icon={RiTicket2Line}
                            label="Tickets Especiales"
                            delay={0.4}
                            onClick={getButtonProps().onClick}
                          />
                        </>
                      )}

                      {(hasRole("seller") || hasRole("admin")) && (
                        <MobileMenuItem
                          href="/profile/my-events"
                          icon={FiHome}
                          label="Mis Eventos"
                          delay={0.35}
                          onClick={getButtonProps().onClick}
                        />
                      )}

                      <MobileMenuItem
                        href="/profile/my-tickets"
                        icon={RiTicket2Line}
                        label="Mis E-Tickets"
                        delay={0.4}
                        onClick={getButtonProps().onClick}
                      />

                      <Box h={4} />
                      <Divider borderColor="rgba(255, 255, 255, 0.1)" />
                      <Box h={2} />

                      <MobileMenuItem
                        href="#"
                        icon={FiLogOut}
                        label="Cerrar Sesión"
                        delay={0.45}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLogout();
                          getButtonProps().onClick();
                        }}
                        isDestructive
                      />

                      <Box h={4} />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Link href="/new-event" onClick={getButtonProps().onClick}>
                          <Button
                            bg="linear-gradient(135deg, #b78dea 0%, #9d6dd8 100%)"
                            color="white"
                            size="lg"
                            w="100%"
                            fontFamily="secondary"
                            fontWeight="600"
                            fontSize="md"
                            py={6}
                            borderRadius="xl"
                            leftIcon={<FiPlus />}
                            _hover={{
                              bg: "linear-gradient(135deg, #9d6dd8 0%, #b78dea 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 10px 25px rgba(183, 141, 234, 0.3)",
                            }}
                            transition="all 0.3s"
                            as={motion.button}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Crear Evento
                          </Button>
                        </Link>
                      </motion.div>
                    </>
                  )}

                  {!user && (
                    <>
                      <Box h={4} />
                      <MobileMenuItem
                        href="/login"
                        icon={FiUser}
                        label="Iniciar Sesión"
                        delay={0.25}
                        onClick={getButtonProps().onClick}
                      />
                      <MobileMenuItem
                        href="/register"
                        icon={FiPlus}
                        label="Regístrate"
                        delay={0.3}
                        onClick={getButtonProps().onClick}
                        isPrimary
                      />
                    </>
                  )}
                </VStack>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
      </Flex>
    </>
  );
}

// Mobile Menu Item Component
const MobileMenuItem = ({ href, icon, label, delay = 0, onClick, isDestructive = false, isPrimary = false }) => {
  const IconComponent = icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay,
        type: "spring",
        damping: 25,
        stiffness: 200
      }}
    >
      <Link
        href={href}
        onClick={onClick}
        display="block"
        textDecoration="none"
        _hover={{ textDecoration: "none" }}
      >
        <Flex
          align="center"
          px={4}
          py={4}
          borderRadius="xl"
          bg={isPrimary ? "rgba(183, 141, 234, 0.1)" : "rgba(255, 255, 255, 0.05)"}
          border="1px solid"
          borderColor={isPrimary ? "rgba(183, 141, 234, 0.3)" : "rgba(255, 255, 255, 0.1)"}
          _hover={{
            bg: isPrimary ? "rgba(183, 141, 234, 0.2)" : "rgba(255, 255, 255, 0.1)",
            borderColor: isPrimary ? "rgba(183, 141, 234, 0.5)" : "rgba(255, 255, 255, 0.2)",
            transform: "translateX(8px)",
          }}
          transition="all 0.2s"
          cursor="pointer"
          as={motion.div}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <Box
            p={2}
            borderRadius="lg"
            bg={isPrimary ? "rgba(183, 141, 234, 0.2)" : "rgba(255, 255, 255, 0.1)"}
            mr={4}
          >
            <Icon
              as={IconComponent}
              boxSize={5}
              color={isDestructive ? "#ff6b6b" : isPrimary ? "#b78dea" : "white"}
            />
          </Box>
          <Text
            fontFamily="secondary"
            fontSize="md"
            fontWeight="500"
            color={isDestructive ? "#ff6b6b" : "white"}
            flex="1"
          >
            {label}
          </Text>
        </Flex>
      </Link>
    </motion.div>
  );
};

export default memo(Header);