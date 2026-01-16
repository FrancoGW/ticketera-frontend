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
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import { IoMdContact } from "react-icons/io";
import { 
  FiHome, 
  FiUser, 
  FiSettings, 
  FiLogOut, 
  FiPlus,
  FiShoppingBag,
  FiBarChart2,
  FiChevronDown
} from "react-icons/fi";
import { RiTicket2Line } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  const navigate = useNavigate();

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

  const handleCreateEvent = () => {
    // Si está logueado, permitir crear evento (aunque sea buyer).
    // Si no está logueado, redirigir a login.
    if (user) return navigate("/seller/new-event");
    return navigate("/login");
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
            GetPass
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
            gap="1.5rem"
            alignItems="center"
            justifyContent="center"
            color="#fff"
            className="contentLinks"
            listStyleType="none"
          >
            {!user && (
              <>
                <Link
                  href="/login"
                  fontSize="smaller"
                  _hover={{ color: "#fff", bg: "none" }}
                  fontFamily="secondary"
                  as={motion.a}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  fontSize="smaller"
                  fontFamily="secondary"
                  _hover={{ color: "#fff", bg: "none" }}
                  as={motion.a}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  Registrarme
                </Link>
              </>
            )}
            {user && (
              <Box m="0" py="10px">
                <Menu placement="bottom-end" closeOnSelect={true}>
                  {({ isOpen }) => (
                    <>
                      <Box
                        as={motion.div}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <MenuButton
                          as={Button}
                          variant="ghost"
                          bg={isOpen ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)"}
                          _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                          _active={{ bg: "rgba(255, 255, 255, 0.2)" }}
                          borderRadius="xl"
                          px={3}
                          py={2}
                          h="auto"
                          minW="auto"
                          fontFamily="secondary"
                          fontSize="sm"
                          fontWeight="500"
                          color="white"
                          cursor="pointer"
                          transition="all 0.2s"
                        >
                        <Flex align="center" gap={2}>
                          {authLoading ? (
                            <Flex align="center">
                              <Spinner size="sm" color="white" />
                            </Flex>
                          ) : (
                            <>
                              <Avatar
                                size="sm"
                                name={user?.firstname || user?.email?.split('@')[0] || 'Usuario'}
                                bg="linear-gradient(135deg, #b78dea 0%, #9d6dd8 100%)"
                                color="white"
                                fontWeight="700"
                                fontSize="xs"
                                border="2px solid"
                                borderColor="rgba(255, 255, 255, 0.3)"
                                boxShadow="0 2px 8px rgba(183, 141, 234, 0.3)"
                              />
                              <Text display={{ base: "none", lg: "block" }} fontWeight="500">
                                {user?.firstname || user?.email?.split('@')[0] || 'Usuario'}
                              </Text>
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                              >
                                <Icon
                                  as={FiChevronDown}
                                  fontSize="md"
                                  opacity={0.8}
                                />
                              </motion.div>
                            </>
                          )}
                        </Flex>
                        </MenuButton>
                      </Box>
                      <AnimatePresence>
                        {isOpen && (
                          <MenuList
                            as={motion.div}
                            initial={{ opacity: 0, y: -10, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.96 }}
                            transition={{
                              duration: 0.2,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            bg="rgba(26, 26, 26, 0.95)"
                            backdropFilter="blur(20px) saturate(180%)"
                            border="1px solid"
                            borderColor="rgba(255, 255, 255, 0.1)"
                            boxShadow="0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(183, 141, 234, 0.1)"
                            borderRadius="xl"
                            py={0}
                            minW="300px"
                            mt={2}
                            overflow="visible"
                            position="relative"
                            transformOrigin="top right"
                            zIndex={1000}
                            _before={{
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "1px",
                              background: "linear-gradient(90deg, transparent, rgba(183, 141, 234, 0.3), transparent)",
                              zIndex: 1,
                            }}
                            className="user-menu-dropdown user-menu-open"
                          >
                            {/* User Info Header */}
                            <Box
                              bg="rgba(183, 141, 234, 0.08)"
                              borderBottom="1px solid"
                              borderColor="rgba(255, 255, 255, 0.08)"
                              px={5}
                              py={4}
                              color="white"
                              position="relative"
                              zIndex={2}
                            >
                              <Flex align="center" gap={3}>
                                <Avatar
                                  size="md"
                                  name={user?.firstname || user?.email?.split('@')[0] || 'Usuario'}
                                  bg="linear-gradient(135deg, #b78dea 0%, #9d6dd8 100%)"
                                  color="white"
                                  fontWeight="700"
                                  fontSize="lg"
                                  border="2px solid"
                                  borderColor="rgba(183, 141, 234, 0.4)"
                                  boxShadow="0 4px 12px rgba(183, 141, 234, 0.25)"
                                />
                                <Box flex="1" minW="0">
                                  <Text
                                    fontFamily="secondary"
                                    fontSize="sm"
                                    fontWeight="700"
                                    color="white"
                                    mb={0.5}
                                    noOfLines={1}
                                    textTransform="uppercase"
                                    letterSpacing="0.5px"
                                  >
                                    {user?.firstname || user?.email?.split('@')[0] || 'Usuario'}
                                  </Text>
                                  <Text
                                    fontFamily="secondary"
                                    fontSize="xs"
                                    color="rgba(255, 255, 255, 0.5)"
                                    noOfLines={1}
                                  >
                                    {user?.email}
                                  </Text>
                                </Box>
                              </Flex>
                            </Box>

                            <Box py={2}>
                              <MenuItem
                                as={motion.div}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                onClick={() => navigate("/profile")}
                                icon={
                                  <Box
                                    p={1.5}
                                    borderRadius="md"
                                    bg="rgba(183, 141, 234, 0.15)"
                                    color="#b78dea"
                                  >
                                    <Icon as={FiUser} boxSize={4} />
                                  </Box>
                                }
                                fontFamily="secondary"
                                fontSize="sm"
                                fontWeight="500"
                                py={2.5}
                                px={4}
                                bg="transparent"
                                color="rgba(255, 255, 255, 0.9) !important"
                                _hover={{ 
                                  bg: "rgba(183, 141, 234, 0.12) !important", 
                                  color: "#b78dea !important"
                                }}
                                _focus={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                _active={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                borderRadius="lg"
                                mx={2}
                                mb={0.5}
                              >
                                Perfil
                              </MenuItem>

                              {hasRole("admin") && (
                                <>
                                  <MenuDivider mx={2} borderColor="rgba(255, 255, 255, 0.1)" />
                                  <MenuItem
                                    as={motion.div}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    onClick={() => navigate("/admin/events")}
                                    icon={
                                      <Box
                                        p={1.5}
                                        borderRadius="md"
                                        bg="rgba(183, 141, 234, 0.15)"
                                        color="#b78dea"
                                      >
                                        <Icon as={FiSettings} boxSize={4} />
                                      </Box>
                                    }
                                    fontFamily="secondary"
                                    fontSize="sm"
                                    fontWeight="500"
                                    py={2.5}
                                    px={4}
                                    bg="transparent"
                                    color="rgba(255, 255, 255, 0.9) !important"
                                    _hover={{ 
                                      bg: "rgba(183, 141, 234, 0.12) !important", 
                                      color: "#b78dea !important"
                                    }}
                                    _focus={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    _active={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    borderRadius="lg"
                                    mx={2}
                                    mb={0.5}
                                  >
                                    Administrar
                                  </MenuItem>
                                </>
                              )}

                              {hasRole("pdv") && (
                                <>
                                  <MenuDivider mx={2} borderColor="rgba(255, 255, 255, 0.1)" />
                                  <MenuItem
                                    as={motion.div}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    onClick={() => navigate("/pdv/dashboard")}
                                    icon={
                                      <Box
                                        p={1.5}
                                        borderRadius="md"
                                        bg="rgba(183, 141, 234, 0.15)"
                                        color="#b78dea"
                                      >
                                        <Icon as={FiBarChart2} boxSize={4} />
                                      </Box>
                                    }
                                    fontFamily="secondary"
                                    fontSize="sm"
                                    fontWeight="500"
                                    py={2.5}
                                    px={4}
                                    bg="transparent"
                                    color="rgba(255, 255, 255, 0.9) !important"
                                    _hover={{ 
                                      bg: "rgba(183, 141, 234, 0.12) !important", 
                                      color: "#b78dea !important"
                                    }}
                                    _focus={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    _active={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    borderRadius="lg"
                                    mx={2}
                                    mb={0.5}
                                  >
                                    Panel PDV
                                  </MenuItem>
                                  <MenuItem
                                    as={motion.div}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    onClick={() => navigate("/pdv/tickets")}
                                    icon={
                                      <Box
                                        p={1.5}
                                        borderRadius="md"
                                        bg="rgba(183, 141, 234, 0.15)"
                                        color="#b78dea"
                                      >
                                        <Icon as={FiShoppingBag} boxSize={4} />
                                      </Box>
                                    }
                                    fontFamily="secondary"
                                    fontSize="sm"
                                    fontWeight="500"
                                    py={2.5}
                                    px={4}
                                    bg="transparent"
                                    color="rgba(255, 255, 255, 0.9) !important"
                                    _hover={{ 
                                      bg: "rgba(183, 141, 234, 0.12) !important", 
                                      color: "#b78dea !important"
                                    }}
                                    _focus={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    _active={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    borderRadius="lg"
                                    mx={2}
                                    mb={0.5}
                                  >
                                    Mis Ventas
                                  </MenuItem>
                                  <MenuItem
                                    as={motion.div}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    onClick={() => navigate("/pdv/special-tickets")}
                                    icon={
                                      <Box
                                        p={1.5}
                                        borderRadius="md"
                                        bg="rgba(183, 141, 234, 0.15)"
                                        color="#b78dea"
                                      >
                                        <Icon as={RiTicket2Line} boxSize={4} />
                                      </Box>
                                    }
                                    fontFamily="secondary"
                                    fontSize="sm"
                                    fontWeight="500"
                                    py={2.5}
                                    px={4}
                                    bg="transparent"
                                    color="rgba(255, 255, 255, 0.9) !important"
                                    _hover={{ 
                                      bg: "rgba(183, 141, 234, 0.12) !important", 
                                      color: "#b78dea !important"
                                    }}
                                    _focus={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    _active={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    borderRadius="lg"
                                    mx={2}
                                    mb={0.5}
                                  >
                                    Tickets Especiales
                                  </MenuItem>
                                </>
                              )}

                              {(hasRole("seller") || hasRole("admin")) && (
                                <>
                                  <MenuDivider mx={2} borderColor="rgba(255, 255, 255, 0.1)" />
                                  <MenuItem
                                    as={motion.div}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    onClick={() => navigate("/profile/my-events")}
                                    icon={
                                      <Box
                                        p={1.5}
                                        borderRadius="md"
                                        bg="rgba(183, 141, 234, 0.15)"
                                        color="#b78dea"
                                      >
                                        <Icon as={FiHome} boxSize={4} />
                                      </Box>
                                    }
                                    fontFamily="secondary"
                                    fontSize="sm"
                                    fontWeight="500"
                                    py={2.5}
                                    px={4}
                                    bg="transparent"
                                    color="rgba(255, 255, 255, 0.9) !important"
                                    _hover={{ 
                                      bg: "rgba(183, 141, 234, 0.12) !important", 
                                      color: "#b78dea !important"
                                    }}
                                    _focus={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    _active={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                    borderRadius="lg"
                                    mx={2}
                                    mb={0.5}
                                  >
                                    Mis Eventos
                                  </MenuItem>
                                </>
                              )}

                              <MenuDivider mx={2} borderColor="rgba(255, 255, 255, 0.1)" />
                              <MenuItem
                                as={motion.div}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                onClick={() => navigate("/profile/my-tickets")}
                                icon={
                                  <Box
                                    p={1.5}
                                    borderRadius="md"
                                    bg="rgba(183, 141, 234, 0.15)"
                                    color="#b78dea"
                                  >
                                    <Icon as={RiTicket2Line} boxSize={4} />
                                  </Box>
                                }
                                fontFamily="secondary"
                                fontSize="sm"
                                fontWeight="500"
                                py={2.5}
                                px={4}
                                bg="transparent"
                                color="rgba(255, 255, 255, 0.9) !important"
                                _hover={{ 
                                  bg: "rgba(183, 141, 234, 0.12) !important", 
                                  color: "#b78dea !important"
                                }}
                                _focus={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                _active={{ bg: "rgba(183, 141, 234, 0.12) !important", color: "#b78dea !important" }}
                                borderRadius="lg"
                                mx={2}
                                mb={0.5}
                              >
                                Mis E-Tickets
                              </MenuItem>

                              <MenuDivider mx={2} borderColor="rgba(255, 255, 255, 0.1)" />
                              <MenuItem
                                as={motion.div}
                                whileHover={{ x: 4 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                onClick={handleLogout}
                                icon={
                                  <Box
                                    p={1.5}
                                    borderRadius="md"
                                    bg="rgba(239, 68, 68, 0.15)"
                                    color="#ef4444"
                                  >
                                    <Icon as={FiLogOut} boxSize={4} />
                                  </Box>
                                }
                                fontFamily="secondary"
                                fontSize="sm"
                                fontWeight="500"
                                py={2.5}
                                px={4}
                                bg="transparent"
                                color="#ef4444 !important"
                                _hover={{ 
                                  bg: "rgba(239, 68, 68, 0.12) !important", 
                                  color: "#f87171 !important"
                                }}
                                _focus={{ bg: "rgba(239, 68, 68, 0.12) !important", color: "#f87171 !important" }}
                                _active={{ bg: "rgba(239, 68, 68, 0.12) !important", color: "#f87171 !important" }}
                                borderRadius="lg"
                                mx={2}
                                mt={1}
                              >
                                Cerrar Sesión
                              </MenuItem>
                            </Box>
                          </MenuList>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </Menu>
              </Box>
            )}
          </UnorderedList>
          <Button
            onClick={handleCreateEvent}
            bg="white"
            color="black"
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="600"
            fontFamily="secondary"
            px={{ base: 4, md: 6 }}
            py={{ base: 5, md: 6 }}
            borderRadius="md"
            leftIcon={<FiPlus />}
            _hover={{
              bg: "gray.100",
              transform: "translateY(-2px)",
              boxShadow: "xl",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
            as={motion.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            ml="4"
          >
            Crear Evento
          </Button>
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
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            handleCreateEvent();
                            getButtonProps().onClick();
                          }}
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
                        icon={FiUser}
                        label="Registrarme"
                        delay={0.3}
                        onClick={getButtonProps().onClick}
                      />
                      <Box h={4} />
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Link href="/register" onClick={getButtonProps().onClick}>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCreateEvent();
                              getButtonProps().onClick();
                            }}
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