import React, { useState, useEffect } from "react";
import {
  Box, Container, Flex, Heading, Text, Button, Spinner, Alert, AlertIcon,
  VStack, HStack, Icon, Badge, useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { MdLocalBar, MdLogout, MdArrowForward } from "react-icons/md";
import eventApi from "../../Api/event";
import { useAuth } from "../../auth/context/AuthContext";
import { getEventImage } from "../../utils/eventUtils";

const BarScannerHome = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await eventApi.getBarScannerEvents();
      setEvents(data?.events || []);
    } catch (err) {
      toast({ title: "Error al cargar eventos", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column">
      <Box bg="black" px={6} py={4}>
        <Flex align="center" justify="space-between" maxW="600px" mx="auto">
          <HStack spacing={3}>
            <Icon as={MdLocalBar} color="white" boxSize={5} />
            <Text color="white" fontWeight="bold" fontSize="lg">Scanner de barra</Text>
          </HStack>
          <Button size="sm" variant="ghost" color="white" leftIcon={<Icon as={MdLogout} />}
            _hover={{ bg: "whiteAlpha.200" }} onClick={() => { logout(); navigate("/login"); }}>
            Salir
          </Button>
        </Flex>
      </Box>

      <Container maxW="600px" py={8} px={4} flex="1">
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="lg" mb={1}>Tus eventos</Heading>
            <Text color="gray.500" fontSize="sm">
              Seleccioná el evento para escanear QRs y gestionar entregas en la barra
            </Text>
          </Box>

          {loading && <Flex justify="center" py={12}><Spinner size="xl" color="black" /></Flex>}

          {!loading && events.length === 0 && (
            <Box bg="white" borderRadius="2xl" p={8} textAlign="center" boxShadow="sm">
              <Icon as={MdLocalBar} boxSize={12} color="gray.300" mb={4} />
              <Heading size="sm" color="gray.500" mb={2}>Sin eventos asignados</Heading>
              <Text fontSize="sm" color="gray.400">
                El organizador todavía no te asignó acceso al scanner de barra. Contactalo.
              </Text>
            </Box>
          )}

          {!loading && events.map((event) => {
            const img = getEventImage(event.pictures);
            return (
              <Box key={event._id} bg="white" borderRadius="2xl" boxShadow="sm"
                overflow="hidden" _hover={{ boxShadow: "md" }} transition="box-shadow 0.2s">
                <Flex align="center" justify="space-between" p={4} gap={4}>
                  <HStack spacing={3} flex="1" minW={0}>
                    <Box w="48px" h="48px" borderRadius="xl" overflow="hidden" flexShrink={0}
                      bg={img ? "transparent" : "gray.100"} display="flex" alignItems="center" justifyContent="center">
                      {img
                        ? <img src={img} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <Icon as={MdLocalBar} color="gray.400" boxSize={6} />}
                    </Box>
                    <Text fontWeight="700" fontSize="md" noOfLines={2}>{event.title}</Text>
                  </HStack>
                  <Button bg="black" color="white" borderRadius="xl" size="sm" flexShrink={0}
                    rightIcon={<Icon as={MdArrowForward} />}
                    _hover={{ bg: "#1a1a1a", transform: "translateY(-1px)" }}
                    transition="all 0.2s"
                    onClick={() => navigate(`/bar-scanner/${event._id}`)}>
                    Abrir
                  </Button>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Container>
    </Flex>
  );
};

export default BarScannerHome;
