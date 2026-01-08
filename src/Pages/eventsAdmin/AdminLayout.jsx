import { Box, Flex, VStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { FiHome, FiBarChart2 } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: FiHome, path: "/admin", label: "Eventos" },
    { icon: FiBarChart2, path: "/admin/metrics", label: "Métricas" }
  ];

  return (
    <Box
      h="100vh"
      w="64"
      bg="primary"
      color="white"
      px={4}
      position="fixed"
      left={0}
      top={0}
    >
      <VStack spacing={8} align="stretch" mt={8}>
        {menuItems.map((item) => (
          <Link to={item.path} key={item.path}>
            <Flex
              align="center"
              p={3}
              borderRadius="lg"
              bg={location.pathname === item.path ? "buttonHover" : "transparent"}
              _hover={{ bg: "buttonHover" }}
            >
              <Icon as={item.icon} boxSize={5} />
              <Text ml={4} fontFamily="secondary">{item.label}</Text>
            </Flex>
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;