import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  useToast,
  Card,
  CardBody,
  Spinner,
  Center,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  HStack,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FiRefreshCw, FiCheck, FiX } from "react-icons/fi";
import userApi from "../../Api/user";

const AdminPlanRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const toast = useToast();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await userApi.getPendingPlanChangeRequests();
      setRequests(res?.data?.requests || []);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al cargar solicitudes",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (userId) => {
    setActioningId(userId);
    try {
      await userApi.approvePlanChange(userId);
      toast({
        title: "Solicitud aprobada",
        description: "Recordá gestionar el cambio de plan con el organizador.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      await loadRequests();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al aprobar",
        description: e.response?.data?.message || "Intentá de nuevo.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (userId) => {
    setActioningId(userId);
    try {
      await userApi.rejectPlanChange(userId);
      toast({
        title: "Solicitud rechazada",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      await loadRequests();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al rechazar",
        description: e.response?.data?.message || "Intentá de nuevo.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setActioningId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <Box py={6} px={{ base: 4, md: 8 }}>
      <Container maxW="6xl">
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <Heading fontFamily="secondary" color="tertiary" size="lg">
              Solicitudes de cambio de plan
            </Heading>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              size="sm"
              onClick={loadRequests}
              isLoading={loading}
              fontFamily="secondary"
            >
              Actualizar
            </Button>
          </HStack>

          <Text fontFamily="secondary" color="gray.600" fontSize="sm">
            Organizadores que solicitaron un cambio de plan. Aprobá o rechazá y luego gestioná el cambio con el organizador (ej. configurar Mercado Pago, CBU, etc.).
          </Text>

          <Card>
            <CardBody>
              {loading ? (
                <Center py={10}>
                  <Spinner size="lg" colorScheme="primary" />
                </Center>
              ) : requests.length === 0 ? (
                <Center py={10}>
                  <Text fontFamily="secondary" color="gray.500">
                    No hay solicitudes de cambio de plan pendientes.
                  </Text>
                </Center>
              ) : (
                <TableContainer>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th fontFamily="secondary">Organizador</Th>
                        <Th fontFamily="secondary">Email</Th>
                        <Th fontFamily="secondary">Plan solicitado</Th>
                        <Th fontFamily="secondary">Fecha</Th>
                        <Th fontFamily="secondary" textAlign="right">
                          Acciones
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {requests.map((r) => (
                        <Tr key={r._id}>
                          <Td fontFamily="secondary">
                            {[r.firstname, r.lastname].filter(Boolean).join(" ") || "-"}
                          </Td>
                          <Td fontFamily="secondary">{r.email}</Td>
                          <Td>
                            <Badge colorScheme="blue" fontFamily="secondary">
                              {r.pendingPlanChange?.requestedPlanName || "-"}
                            </Badge>
                          </Td>
                          <Td fontFamily="secondary" fontSize="xs" color="gray.600">
                            {formatDate(r.pendingPlanChange?.requestedAt)}
                          </Td>
                          <Td textAlign="right">
                            <HStack justify="flex-end" spacing={2}>
                              <Tooltip label="Aprobar solicitud">
                                <IconButton
                                  icon={<FiCheck />}
                                  colorScheme="green"
                                  size="sm"
                                  aria-label="Aprobar"
                                  isLoading={actioningId === r._id}
                                  onClick={() => handleApprove(r._id)}
                                />
                              </Tooltip>
                              <Tooltip label="Rechazar solicitud">
                                <IconButton
                                  icon={<FiX />}
                                  colorScheme="red"
                                  size="sm"
                                  aria-label="Rechazar"
                                  isLoading={actioningId === r._id}
                                  onClick={() => handleReject(r._id)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminPlanRequests;
