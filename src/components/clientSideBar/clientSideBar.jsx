import { Box, VStack, Icon, Text, Flex, Heading, Divider } from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import { RiTicket2Line } from "react-icons/ri";

const ClientSidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/profile', icon: FiUser, label: 'Mi Perfil' },
    { path: '/profile/my-tickets', icon: RiTicket2Line, label: 'Mis Tickets' }
  ];

  const isActive = (path) => {
    // Para /profile, solo coincidir exactamente
    if (path === '/profile') {
      return location.pathname === path;
    }
    // Para otras rutas, permitir coincidencias con subrutas
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <Box
      position="fixed"
      left={0}
      top="80px"
      w={{ base: "0", md: "280px" }}
      h="calc(100vh - 80px)"
      bg="primary"
      color="white"
      py={6}
      zIndex={10}
      overflowY="auto"
      borderRight="1px solid"
      borderColor="rgba(255, 255, 255, 0.1)"
      boxShadow="2xl"
      display={{ base: "none", md: "block" }}
    >
      <VStack spacing={2} align="stretch" px={4}>
        <Heading 
          as="h2" 
          fontSize="xs" 
          fontWeight="bold" 
          textTransform="uppercase" 
          letterSpacing="wider"
          color="rgba(255, 255, 255, 0.6)"
          mb={2}
          px={4}
        >
          Mi Cuenta
        </Heading>
        <Divider borderColor="rgba(255, 255, 255, 0.1)" mb={2} />
        {menuItems.map(item => {
          const active = isActive(item.path);
          return (
            <Link to={item.path} key={item.path} style={{ textDecoration: 'none' }}>
              <Flex
                align="center"
                p={4}
                bg={active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}
                color={active ? 'white' : 'rgba(255, 255, 255, 0.8)'}
                _hover={{ 
                  bg: active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateX(4px)',
                  color: 'white'
                }}
                transition="all 0.2s ease"
                borderRadius="lg"
                position="relative"
                cursor="pointer"
                fontWeight={active ? '600' : '400'}
              >
                {active && (
                  <Box
                    position="absolute"
                    left={0}
                    top="50%"
                    transform="translateY(-50%)"
                    w="4px"
                    h="60%"
                    bg="white"
                    borderRadius="0 4px 4px 0"
                  />
                )}
                <Icon 
                  as={item.icon} 
                  boxSize={5}
                  mr={4}
                  opacity={active ? 1 : 0.8}
                />
                <Text 
                  fontFamily="secondary"
                  fontSize="md"
                >
                  {item.label}
                </Text>
              </Flex>
            </Link>
          );
        })}
      </VStack>
    </Box>
  );
};

export default ClientSidebar;
