import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Icon,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MdStorefront, MdLogout } from "react-icons/md";
import pointOfSaleApi from "../../Api/pointOfSale";
import { useAuth } from "../../auth/context/AuthContext";

const PdvHome = () => {
  const [pdvs, setPdvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  useEffect(() => {
    loadMyPdvs();
  }, []);

  const loadMyPdvs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await pointOfSaleApi.getMyPdvAccess();
      setPdvs(data?.pointsOfSale || []);
    } catch (err) {
      console.error("Error loading PDVs:", err);
      setError("No se pudieron cargar los puntos de venta");
      toast({ title: "Error", description: "No se pudieron cargar los puntos de venta", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/pdv/login");
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column">
      <Box bg="black" px={6} py={4}>
        <Flex align="center" justify="space-between" maxW="600px" mx="auto">
          <Text color="white" fontWeight="bold" fontSize="lg" letterSpacing="wider">
            GETPASS
          </Text>
          <HStack spacing={3}>
            <Text color="gray.300" fontSize="sm" display={{ base: "none", sm: "block" }}>
              {user?.email}
            </Text>
            <Button
              size="sm"
              variant="ghost"
              color="white"
              leftIcon={<Icon as={MdLogout} />}
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={handleLogout}
            >
              Salir
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Container maxW="600px" py={8} px={4} flex="1">
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" mb={1}>
              Tus puntos de venta
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Seleccioná el punto de venta desde donde vas a operar hoy
            </Text>
          </Box>

          {loading && (
            <Flex justify="center" py={12}>
              <Spinner size="xl" color="black" />
            </Flex>
          )}

          {error && (
            <Alert status="error" borderRadius="xl">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!loading && !error && pdvs.length === 0 && (
            <Box bg="white" borderRadius="2xl" p={8} textAlign="center" boxShadow="sm">
              <Icon as={MdStorefront} boxSize={12} color="gray.300" mb={4} />
              <Heading size="sm" color="gray.500" mb={2}>
                Sin puntos de venta asignados
              </Heading>
              <Text fontSize="sm" color="gray.400">
                El organizador todavía no te asignó acceso a ningún punto de venta. Contactalo para que te invite.
              </Text>
            </Box>
          )}

          {!loading && pdvs.map((pdv) => (
            <Box
              key={pdv._id}
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              overflow="hidden"
              transition="box-shadow 0.2s"
              _hover={{ boxShadow: "md" }}
            >
              <Flex align="center" justify="space-between" p={5}>
                <HStack spacing={4}>
                  <Flex
                    w="48px"
                    h="48px"
                    bg="black"
                    borderRadius="xl"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon as={MdStorefront} color="white" boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontWeight="700" fontSize="md">
                      {pdv.name}
                    </Text>
                    {pdv.code && (
                      <Badge colorScheme="gray" fontSize="xs" borderRadius="md">
                        {pdv.code}
                      </Badge>
                    )}
                  </Box>
                </HStack>
                <Button
                  bg="black"
                  color="white"
                  borderRadius="xl"
                  size="sm"
                  _hover={{ bg: "#1a1a1a", transform: "translateY(-1px)" }}
                  _active={{ bg: "#1a1a1a", transform: "translateY(0)" }}
                  transition="all 0.2s"
                  onClick={() => navigate(`/pdv/${pdv._id}`)}
                >
                  Abrir
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Container>
    </Flex>
  );
};

export default PdvHome;
