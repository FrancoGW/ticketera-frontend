import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  useToast,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Text,
  Divider,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react';
import { FiRefreshCw, FiSend, FiSearch } from 'react-icons/fi';
import { paymentApi } from '../../Api/payment';
import ticketApi from '../../Api/ticket';
import eventApi from '../../Api/event';

export default function AdminSoporte() {
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchDni, setSearchDni] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [transferRow, setTransferRow] = useState(null);
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const { isOpen: isTransferModalOpen, onOpen: onTransferModalOpen, onClose: onTransferModalClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await eventApi.getEventsbyAdmin({ page: 1, limit: 500 });
        if (!cancelled && res?.data?.events) setEvents(res.data.events);
      } catch (e) {
        if (!cancelled) toast({ title: 'Error al cargar eventos', status: 'error', duration: 3000, isClosable: true });
      }
    })();
    return () => { cancelled = true; };
  }, [toast]);

  const handleSyncPayment = async () => {
    const id = paymentId?.trim();
    if (!id) {
      toast({
        title: 'ID requerido',
        description: 'Ingresá el número de operación de Mercado Pago (ej: 146886151026).',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await paymentApi.syncPayment(id);
      toast({
        title: data?.ok ? 'Pago sincronizado' : 'Resultado',
        description: data?.message || (data?.ok ? 'El pago se actualizó correctamente.' : 'Revisá el ID o el estado en Mercado Pago.'),
        status: data?.ok ? 'success' : 'info',
        duration: 6000,
        isClosable: true,
      });
      if (data?.ok) setPaymentId('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al sincronizar.';
      toast({
        title: 'Error',
        description: msg,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTickets = async () => {
    const eid = eventId?.trim();
    const email = searchEmail?.trim();
    const dni = searchDni?.trim();
    if (!eid) {
      toast({ title: 'Seleccioná un evento', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    if (!email && !dni) {
      toast({ title: 'Ingresá email o DNI del dueño del ticket', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const { data } = await ticketApi.adminSearchTicketsByEvent(eid, email || undefined, dni || undefined);
      setSearchResults(data?.items || []);
      if (!(data?.items?.length)) {
        toast({ title: 'Sin resultados', description: 'No se encontraron entradas con ese email o DNI en este evento.', status: 'info', duration: 4000, isClosable: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al buscar.';
      toast({ title: 'Error', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setSearchLoading(false);
    }
  };

  const openTransferModal = (row) => {
    setTransferRow(row);
    setNewOwnerEmail('');
    onTransferModalOpen();
  };

  const handleAdminTransfer = async () => {
    if (!transferRow?.qrId || !newOwnerEmail?.trim()) {
      toast({ title: 'Ingresá el email del nuevo destinatario', status: 'warning', duration: 3000, isClosable: true });
      return;
    }
    setTransferLoading(true);
    try {
      const { data } = await ticketApi.adminTransferTicketByQr(transferRow.qrId, newOwnerEmail.trim());
      toast({
        title: 'Ticket transferido',
        description: data?.message || 'El destinatario recibirá el QR por email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setSearchResults((prev) => prev.filter((r) => r.qrId !== transferRow.qrId));
      onTransferModalClose();
      setTransferRow(null);
      setNewOwnerEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al transferir.';
      toast({ title: 'Error', description: msg, status: 'error', duration: 6000, isClosable: true });
    } finally {
      setTransferLoading(false);
    }
  };

  return (
    <Box pt={{ base: 6, md: 8 }} pb={8} px={{ base: 4, md: 6 }}>
      <Container maxW="container.md">
        <Heading as="h1" size="lg" fontFamily="secondary" mb={6}>
          Soporte
        </Heading>

        <VStack align="stretch" spacing={6}>
          <Card>
            <CardBody>
              <Heading as="h2" size="md" fontFamily="secondary" mb={2}>
                Pagos
              </Heading>
              <Text color="gray.600" fontSize="sm" mb={4}>
                Sincronizar un pago ya aprobado en Mercado Pago que quedó en pendiente (por ejemplo, si el webhook no llegó). Siempre se usa el <strong>número de operación</strong> de Mercado Pago (ej. en el detalle del pago aparece como &quot;Operación #146886151026&quot;).
              </Text>
              <Divider my={4} />
              <FormControl>
                <FormLabel>Número de operación (Mercado Pago)</FormLabel>
                <HStack align="flex-end" spacing={3} flexWrap="wrap" mt={2}>
                  <Input
                    placeholder="Ej: 146886151026"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    type="text"
                    maxW="xs"
                    size="md"
                  />
                  <Button
                    leftIcon={<FiRefreshCw />}
                    colorScheme="primary"
                    size="md"
                    onClick={handleSyncPayment}
                    isLoading={loading}
                    loadingText="Sincronizando…"
                  >
                    Sincronizar pago
                  </Button>
                </HStack>
              </FormControl>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Heading as="h2" size="md" fontFamily="secondary" mb={2}>
                Transferir ticket (admin)
              </Heading>
              <Text color="gray.600" fontSize="sm" mb={4}>
                Elegí el evento y buscá la entrada por email o DNI del dueño actual (datos de la compra). Luego transferila al nuevo email. Se genera un nuevo QR y el destinatario lo recibe por correo (no necesita cuenta).
              </Text>
              <Divider my={4} />
              <FormControl mb={3}>
                <FormLabel>Evento</FormLabel>
                <Select
                  placeholder="Seleccionar evento"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  maxW="md"
                >
                  {events.map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <HStack align="flex-end" spacing={3} flexWrap="wrap" mb={4}>
                <FormControl maxW="xs">
                  <FormLabel>Email del dueño</FormLabel>
                  <Input
                    placeholder="ejemplo@mail.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTickets()}
                  />
                </FormControl>
                <FormControl maxW="xs">
                  <FormLabel>DNI del dueño</FormLabel>
                  <Input
                    placeholder="Ej: 12345678"
                    value={searchDni}
                    onChange={(e) => setSearchDni(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchTickets()}
                  />
                </FormControl>
                <Button
                  leftIcon={<FiSearch />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={handleSearchTickets}
                  isLoading={searchLoading}
                  loadingText="Buscando…"
                >
                  Buscar tickets
                </Button>
              </HStack>
              {searchResults.length > 0 && (
                <Box overflowX="auto" mt={4}>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Evento</Th>
                        <Th>Ticket</Th>
                        <Th>Cliente</Th>
                        <Th>Email</Th>
                        <Th>DNI</Th>
                        <Th>Acción</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {searchResults.map((row) => (
                        <Tr key={row.qrId}>
                          <Td>{row.eventTitle}</Td>
                          <Td>{row.ticketTitle}</Td>
                          <Td>{row.customerName || '—'}</Td>
                          <Td>{row.customerEmail || '—'}</Td>
                          <Td>{row.customerDni || '—'}</Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="teal"
                              leftIcon={<FiSend />}
                              onClick={() => openTransferModal(row)}
                            >
                              Transferir
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
              {searchLoading && (
                <Center py={4}>
                  <Spinner size="md" colorScheme="teal" />
                </Center>
              )}
            </CardBody>
          </Card>

          <Modal isOpen={isTransferModalOpen} onClose={() => { onTransferModalClose(); setTransferRow(null); }} size="md">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader fontFamily="secondary">Transferir entrada</ModalHeader>
              <ModalBody>
                {transferRow && (
                  <>
                    <Text mb={2}>
                      <strong>{transferRow.ticketTitle}</strong> — {transferRow.eventTitle}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3}>
                      Actual: {transferRow.customerEmail || transferRow.customerName || '—'}
                    </Text>
                    <FormControl>
                      <FormLabel>Email del nuevo destinatario</FormLabel>
                      <Input
                        type="email"
                        placeholder="nuevo@ejemplo.com"
                        value={newOwnerEmail}
                        onChange={(e) => setNewOwnerEmail(e.target.value)}
                      />
                    </FormControl>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={2} onClick={() => { onTransferModalClose(); setTransferRow(null); }}>
                  Cancelar
                </Button>
                <Button
                  colorScheme="teal"
                  leftIcon={<FiSend />}
                  onClick={handleAdminTransfer}
                  isLoading={transferLoading}
                  isDisabled={!newOwnerEmail?.trim()}
                >
                  Transferir ticket
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
}
