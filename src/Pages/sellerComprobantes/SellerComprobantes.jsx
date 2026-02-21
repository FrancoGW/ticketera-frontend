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
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Select,
  Input,
} from "@chakra-ui/react";
import { FiRefreshCw, FiCheck, FiX, FiEye } from "react-icons/fi";
import cbuApi from "../../Api/cbu";
import eventApi from "../../Api/event";

const SellerComprobantes = () => {
  const [proofs, setProofs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedProof, setSelectedProof] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isRejectOpen, onOpen: onRejectOpen, onClose: onRejectClose } = useDisclosure();
  const [rejectReason, setRejectReason] = useState("");
  const [proofToReject, setProofToReject] = useState(null);
  const toast = useToast();

  const loadProofs = async () => {
    setLoading(true);
    try {
      const res = selectedEventId
        ? await cbuApi.getProofsForEvent(selectedEventId)
        : await cbuApi.getProofs();
      setProofs(res?.data?.proofs || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error al cargar comprobantes", status: "error", duration: 4000, isClosable: true, position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await eventApi.getUserEvents(1, 100);
      setEvents(res?.data?.events || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    loadProofs();
  }, [selectedEventId]);

  const isDemoProof = (id) => String(id || "").startsWith("demo-proof-");

  const getProofQuantity = (p) => {
    if (!p.ticketItems?.length) return 0;
    return p.ticketItems.reduce((sum, it) => sum + (it.quantity || 0), 0);
  };

  const handleApprove = async (proof) => {
    const proofId = proof._id;
    setActioningId(proofId);
    if (isDemoProof(proofId)) {
      setProofs((prev) => prev.filter((x) => x._id !== proofId));
      toast({ title: "Comprobante aprobado (demo)", description: "En la cuenta demo las acciones son ilustrativas. Al aprobar, se generarían los QR y se enviarían por email.", status: "success", duration: 5000, isClosable: true, position: "bottom-right" });
      setActioningId(null);
      return;
    }
    try {
      await cbuApi.approveProof(proofId);
      toast({ title: "Comprobante aprobado", description: "Las entradas fueron enviadas por email al comprador.", status: "success", duration: 5000, isClosable: true, position: "bottom-right" });
      await loadProofs();
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.message || "Intentá de nuevo.", status: "error", duration: 4000, isClosable: true, position: "bottom-right" });
    } finally {
      setActioningId(null);
    }
  };

  const handleRejectClick = (proof) => {
    setProofToReject(proof);
    setRejectReason("");
    onRejectOpen();
  };

  const handleRejectConfirm = async () => {
    if (!proofToReject) return;
    const proofId = proofToReject._id;
    setActioningId(proofId);
    if (isDemoProof(proofId)) {
      setProofs((prev) => prev.filter((x) => x._id !== proofId));
      toast({ title: "Comprobante rechazado (demo)", description: "En la cuenta demo es ilustrativo. Al rechazar, al cliente le llegaría un mail: \"Su compra fue rechazada\".", status: "info", duration: 5000, isClosable: true, position: "bottom-right" });
      onRejectClose();
      setProofToReject(null);
      setActioningId(null);
      return;
    }
    try {
      await cbuApi.rejectProof(proofId, rejectReason);
      toast({ title: "Comprobante rechazado", description: "Se envió un mail al comprador informando el rechazo.", status: "success", duration: 4000, isClosable: true, position: "bottom-right" });
      onRejectClose();
      setProofToReject(null);
      await loadProofs();
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.message || "Intentá de nuevo.", status: "error", duration: 4000, isClosable: true, position: "bottom-right" });
    } finally {
      setActioningId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  };

  const pendingProofs = proofs.filter((p) => p.status === "pending");

  return (
    <Box py={6} px={{ base: 4, md: 8 }}>
      <Container maxW="6xl">
        <VStack align="stretch" spacing={6}>
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <Heading fontFamily="secondary" color="tertiary" size="lg">
              Comprobantes de pago (CBU)
            </Heading>
            <HStack>
              <Select
                placeholder="Todos los eventos"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                maxW="200px"
                fontFamily="secondary"
                size="sm"
              >
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </Select>
              <Button leftIcon={<FiRefreshCw />} variant="outline" size="sm" onClick={loadProofs} isLoading={loading} fontFamily="secondary">
                Actualizar
              </Button>
            </HStack>
          </HStack>

          <Text fontFamily="secondary" color="gray.600" fontSize="sm">
            Comprobantes de transferencia enviados por clientes. Aprobá o rechazá según corresponda. Al aprobar, se envían las entradas por email.
          </Text>

          <Card>
            <CardBody>
              {loading ? (
                <Center py={10}><Spinner size="lg" colorScheme="primary" /></Center>
              ) : pendingProofs.length === 0 ? (
                <Center py={10}>
                  <Text fontFamily="secondary" color="gray.500">No hay comprobantes pendientes.</Text>
                </Center>
              ) : (
                <TableContainer overflowX="auto">
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th fontFamily="secondary">Fecha y hora</Th>
                        <Th fontFamily="secondary">Nombre</Th>
                        <Th fontFamily="secondary">Mail</Th>
                        <Th fontFamily="secondary">DNI</Th>
                        <Th fontFamily="secondary">Evento</Th>
                        <Th fontFamily="secondary">Cant. tickets</Th>
                        <Th fontFamily="secondary">Comprobante</Th>
                        <Th fontFamily="secondary">Estado</Th>
                        <Th fontFamily="secondary" textAlign="right">Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pendingProofs.map((p) => (
                        <Tr key={p._id}>
                          <Td fontFamily="secondary" fontSize="xs" color="gray.600" whiteSpace="nowrap">{formatDate(p.createdAt)}</Td>
                          <Td fontFamily="secondary">{p.buyerName || "-"}</Td>
                          <Td fontFamily="secondary" fontSize="sm">{p.buyerEmail || "-"}</Td>
                          <Td fontFamily="secondary" fontSize="sm">{p.buyerDni || "-"}</Td>
                          <Td fontFamily="secondary" fontSize="sm">{p.eventRef?.title || "-"}</Td>
                          <Td fontFamily="secondary" fontWeight="600">{getProofQuantity(p)}</Td>
                          <Td>
                            {p.proofImageUrl ? (
                              <Box
                                as="button"
                                type="button"
                                onClick={() => { setSelectedProof(p); onViewOpen(); }}
                                display="block"
                                w="56px"
                                h="40px"
                                borderRadius="md"
                                overflow="hidden"
                                border="1px solid"
                                borderColor="gray.200"
                                _hover={{ borderColor: "primary", opacity: 0.9 }}
                              >
                                <Image src={p.proofImageUrl} alt="Comprobante" w="100%" h="100%" objectFit="cover" />
                              </Box>
                            ) : (
                              <Text fontSize="xs" color="gray.400">-</Text>
                            )}
                          </Td>
                          <Td>
                            <Badge colorScheme="orange" fontFamily="secondary" fontSize="xs">Pendiente</Badge>
                          </Td>
                          <Td textAlign="right">
                            <HStack justify="flex-end" spacing={2}>
                              <Tooltip label="Ver comprobante">
                                <IconButton icon={<FiEye />} size="sm" aria-label="Ver" onClick={() => { setSelectedProof(p); onViewOpen(); }} />
                              </Tooltip>
                              <Tooltip label="Aceptar">
                                <IconButton icon={<FiCheck />} colorScheme="green" size="sm" aria-label="Aceptar" isLoading={actioningId === p._id} onClick={() => handleApprove(p)} />
                              </Tooltip>
                              <Tooltip label="Rechazar">
                                <IconButton icon={<FiX />} colorScheme="red" size="sm" aria-label="Rechazar" onClick={() => handleRejectClick(p)} />
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

      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Comprobante de pago</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProof && (
              <VStack align="stretch" spacing={4}>
                <Text fontFamily="secondary"><strong>Nombre:</strong> {selectedProof.buyerName}</Text>
                <Text fontFamily="secondary"><strong>Mail:</strong> {selectedProof.buyerEmail}</Text>
                <Text fontFamily="secondary"><strong>DNI:</strong> {selectedProof.buyerDni || "-"}</Text>
                <Text fontFamily="secondary"><strong>Evento:</strong> {selectedProof.eventRef?.title || "-"}</Text>
                <Text fontFamily="secondary"><strong>Cantidad de tickets:</strong> {getProofQuantity(selectedProof)}</Text>
                <Text fontFamily="secondary"><strong>Monto:</strong> ${selectedProof.amount?.toLocaleString("es-AR")}</Text>
                <Text fontFamily="secondary"><strong>Fecha y hora:</strong> {formatDate(selectedProof.createdAt)}</Text>
                {selectedProof.proofImageUrl && (
                  <Box>
                    <Text fontFamily="secondary" fontWeight="600" mb={2}>Comprobante:</Text>
                    <Image src={selectedProof.proofImageUrl} alt="Comprobante" maxH="400px" borderRadius="md" w="100%" objectFit="contain" />
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRejectOpen} onClose={onRejectClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Rechazar comprobante</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4} fontFamily="secondary" fontSize="sm">¿Motivo del rechazo? (opcional)</Text>
            <Select placeholder="Elegir motivo" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} fontFamily="secondary" mb={3}>
              <option value="Comprobante ilegible">Comprobante ilegible</option>
              <option value="Monto incorrecto">Monto incorrecto</option>
              <option value="Transferencia no recibida">Transferencia no recibida</option>
              <option value="Otro">Otro</option>
            </Select>
            <Input
              placeholder="Escribir motivo (opcional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              fontFamily="secondary"
              size="sm"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRejectClose}>Cancelar</Button>
            <Button colorScheme="red" onClick={handleRejectConfirm} isLoading={actioningId === proofToReject?._id}>Rechazar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SellerComprobantes;
