import { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Center,
  Spinner,
  useToast,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Document, Page, View, Text as PdfText, PDFDownloadLink, StyleSheet, Image as PdfImage } from "@react-pdf/renderer";
import { QRCodeCanvas } from "qrcode.react";
import { FiSearch, FiXCircle, FiFileText, FiDownload, FiSend } from "react-icons/fi";
import { Link } from "react-router-dom";
import ticketApi from "../../Api/ticket";
import eventApi from "../../Api/event";
import TransferTicketModal from "../../components/TransferTicketModal/TransferTicketModal";

// Estilos del PDF (mismo diseño que el que se envía por mail)
const pdfStyles = StyleSheet.create({
  page: { padding: 0, fontFamily: "Helvetica", backgroundColor: "#fff" },
  header: { backgroundColor: "#6B46C1", paddingVertical: 20, paddingHorizontal: 24, alignItems: "center" },
  logoText: { color: "#fff", fontSize: 24, fontWeight: "bold", letterSpacing: 1 },
  tagline: { color: "rgba(255,255,255,0.9)", fontSize: 9, marginTop: 4, letterSpacing: 0.5 },
  content: { padding: 28, paddingTop: 100, alignItems: "center" },
  eventTitle: { fontSize: 18, fontWeight: "bold", color: "#1A202C", textAlign: "center", marginBottom: 6 },
  ticketType: { fontSize: 12, color: "#4A5568", marginBottom: 20 },
  ticketDetail: { flexDirection: "row", justifyContent: "space-between", width: "100%", maxWidth: 280, marginBottom: 20, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#F7FAFC", borderRadius: 6 },
  ticketDetailLabel: { fontSize: 9, color: "#4A5568", textTransform: "uppercase", letterSpacing: 0.5 },
  ticketDetailValue: { fontSize: 11, color: "#1A202C", fontWeight: "bold" },
  qrWrapper: { padding: 20, backgroundColor: "#fff", borderWidth: 2, borderColor: "#6B46C1", borderRadius: 8, marginBottom: 24 },
  qrImage: { width: 160, height: 160 },
  qrLabel: { fontSize: 10, color: "#4A5568", marginTop: 12, textAlign: "center" },
  footer: { position: "absolute", bottom: 0, width: "100%", left: 0, right: 0, paddingVertical: 14, paddingHorizontal: 24, backgroundColor: "#F7FAFC", borderTopWidth: 1, borderColor: "#E2E8F0", alignItems: "center" },
  footerText: { fontSize: 9, color: "#4A5568" },
});

const QrPdfDocument = ({ eventTitle, ticketTitle, amount, qrCodeDataUri }) => {
  const valueStr = amount != null && !isNaN(amount) ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount) : "—";
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header} fixed>
          <PdfText style={pdfStyles.logoText}>GetPass</PdfText>
          <PdfText style={pdfStyles.tagline}>Tu entrada digital</PdfText>
        </View>
        <View style={pdfStyles.content}>
          <PdfText style={pdfStyles.eventTitle}>{eventTitle || "Evento"}</PdfText>
          <PdfText style={pdfStyles.ticketType}>{ticketTitle || "Entrada"}</PdfText>
          <View style={pdfStyles.ticketDetail}>
            <View>
              <PdfText style={pdfStyles.ticketDetailLabel}>Monto</PdfText>
              <PdfText style={pdfStyles.ticketDetailValue}>{valueStr}</PdfText>
            </View>
          </View>
          <View style={pdfStyles.qrWrapper}>
            <PdfImage source={{ uri: qrCodeDataUri }} style={pdfStyles.qrImage} />
            <PdfText style={pdfStyles.qrLabel}>Presentá este código QR en la entrada</PdfText>
          </View>
        </View>
        <View style={pdfStyles.footer} fixed>
          <PdfText style={pdfStyles.footerText}>GetPass · getpass.com.ar</PdfText>
        </View>
      </Page>
    </Document>
  );
};

const DownloadQrPdfButton = ({ item }) => {
  const qrCanvasRef = useRef(null);
  const [qrDataUri, setQrDataUri] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const wrapper = qrCanvasRef.current;
      if (!wrapper) return;
      const canvas = wrapper.querySelector("canvas");
      if (canvas) {
        try {
          setQrDataUri(canvas.toDataURL("image/png", 1.0));
        } catch (e) {
          console.error("Error generando QR para PDF:", e);
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [item.qrId]);

  return (
    <>
      <Box position="absolute" left="-9999px" visibility="hidden" aria-hidden="true">
        <div ref={qrCanvasRef}>
          <QRCodeCanvas value={item.qrId || ""} size={200} level="H" />
        </div>
      </Box>
      {qrDataUri ? (
        <PDFDownloadLink
          document={
            <QrPdfDocument
              eventTitle={item.eventTitle}
              ticketTitle={item.ticketTitle}
              amount={item.amount}
              qrCodeDataUri={qrDataUri}
            />
          }
          fileName={`QR - ${(item.eventTitle || "entrada").replace(/[^a-z0-9áéíóúñ\s]/gi, "")} - ${(item.ticketTitle || "ticket").replace(/[^a-z0-9áéíóúñ\s]/gi, "")}.pdf`}
        >
          {({ loading }) => (
            <Tooltip label="Descargar QR en PDF">
              <IconButton
                icon={<FiDownload />}
                size="sm"
                colorScheme="purple"
                variant="ghost"
                aria-label="Descargar QR en PDF"
                isLoading={loading}
                as="span"
                display="inline-flex"
              />
            </Tooltip>
          )}
        </PDFDownloadLink>
      ) : (
        <Tooltip label="Preparando PDF...">
          <IconButton icon={<FiDownload />} size="sm" colorScheme="purple" variant="ghost" aria-label="Descargar QR" isDisabled isLoading as="span" display="inline-flex" />
        </Tooltip>
      )}
    </>
  );
};

const SellerQRs = () => {
  const [items, setItems] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [receiptItem, setReceiptItem] = useState(null);
  const [transferItem, setTransferItem] = useState(null);
  const { isOpen: isReceiptOpen, onOpen: onReceiptOpen, onClose: onReceiptClose } = useDisclosure();
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();
  const toast = useToast();

  const loadSoldTickets = async () => {
    setIsLoading(true);
    try {
      const [soldRes, eventsRes] = await Promise.all([
        ticketApi.getSellerSoldTickets().catch(() => ({ data: { items: [] } })),
        eventApi.getUserEvents(1, 100).catch(() => ({ data: { events: [] } })),
      ]);
      setItems(soldRes?.data?.items ?? []);
      setEvents(eventsRes?.data?.events ?? []);
    } catch (e) {
      console.error(e);
      setItems([]);
      setEvents([]);
      toast({ title: "Error al cargar tickets vendidos", status: "error", duration: 3000, isClosable: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSoldTickets();
  }, []);

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = (item.customerName || "").toLowerCase();
    const email = (item.customerEmail || "").toLowerCase();
    const first = (item.customerFirstName || "").toLowerCase();
    const last = (item.customerLastName || "").toLowerCase();
    return name.includes(q) || email.includes(q) || first.includes(q) || last.includes(q);
  });

  const handleCancelQr = async (qrId) => {
    setCancellingId(qrId);
    try {
      await ticketApi.cancelSellerQr(qrId);
      toast({ title: "QR cancelado", status: "success", duration: 3000, isClosable: true });
      loadSoldTickets();
    } catch (e) {
      console.error(e);
      toast({ title: e?.response?.data?.message || "Error al cancelar QR", status: "error", duration: 3000, isClosable: true });
    } finally {
      setCancellingId(null);
    }
  };

  const handleVerComprobante = (item) => {
    setReceiptItem(item);
    onReceiptOpen();
  };

  const handleTransferir = (item) => {
    setTransferItem(item);
    onTransferOpen();
  };

  const handleTransferSuccess = () => {
    onTransferClose();
    setTransferItem(null);
    loadSoldTickets();
  };

  const formatMoney = (n) => {
    if (n == null || isNaN(n)) return "—";
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(n);
  };

  const hasNoEvents = !isLoading && events.length === 0;

  return (
    <Box w="100%" minH="calc(100vh - 80px)" bg="gray.50" py={{ base: 6, md: 8 }} px={{ base: 2, md: 0 }} position="relative">
      {hasNoEvents && (
        <Center
          position="absolute"
          inset={0}
          zIndex={0}
          pointerEvents="none"
          bg="gray.50"
          opacity={0.95}
        >
          <VStack spacing={4}>
            <Text fontFamily="secondary" fontSize="2xl" fontWeight="700" color="gray.400" textAlign="center">
              Aún no hay eventos. ¡Creá uno!
            </Text>
            <Button as={Link} to="/seller/new-event" colorScheme="primary" size="lg" pointerEvents="auto">
              Crear evento
            </Button>
          </VStack>
        </Center>
      )}

      <Container maxW="container.xl" px={{ base: 4, md: 8 }} position="relative" zIndex={1}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading
              as="h1"
              fontFamily="secondary"
              color="tertiary"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              mb={2}
            >
              Ver QRs / Tickets vendidos
            </Heading>
            <Text fontFamily="secondary" color="gray.600" fontSize="md">
              Acá podés ver todos los tickets que vendiste, buscarlos por nombre, apellido o mail. También podés cancelar un QR, ver el comprobante de pago y descargar el QR en PDF.
            </Text>
          </Box>

          {!hasNoEvents && (
            <>
              <InputGroup maxW="400px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="Buscar por nombre, apellido o mail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  borderRadius="lg"
                  bg="white"
                />
              </InputGroup>

              {isLoading ? (
                <Center py={10}>
                  <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="primary" size="xl" />
                </Center>
              ) : filtered.length === 0 ? (
                <Center py={10}>
                  <Text color="gray.500">
                    {search.trim() ? "No hay resultados para tu búsqueda." : "Aún no hay tickets vendidos."}
                  </Text>
                </Center>
              ) : (
                <Box bg="white" borderRadius="xl" boxShadow="md" border="1px solid" borderColor="gray.200" overflow="hidden">
                  <Box overflowX="auto">
                    <Table size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th>Evento</Th>
                          <Th>Ticket</Th>
                          <Th>Cliente</Th>
                          <Th>Mail</Th>
                          <Th>Monto</Th>
                          <Th>Estado</Th>
                          <Th>Acciones</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filtered.map((item) => (
                          <Tr key={item.qrId}>
                            <Td fontWeight="500">{item.eventTitle}</Td>
                            <Td>{item.ticketTitle}</Td>
                            <Td>{item.customerName || "—"}</Td>
                            <Td>{item.customerEmail || "—"}</Td>
                            <Td>{formatMoney(item.amount)}</Td>
                            <Td>
                              {item.cancelled ? (
                                <Badge colorScheme="red">Cancelado</Badge>
                              ) : item.checked ? (
                                <Badge colorScheme="green">Usado</Badge>
                              ) : (
                                <Badge colorScheme="blue">Válido</Badge>
                              )}
                            </Td>
                            <Td>
                              <Flex gap={2} wrap="wrap">
                                {!item.cancelled && (
                                  <>
                                    <Tooltip label="Cancelar QR">
                                      <IconButton
                                        icon={<FiXCircle />}
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        aria-label="Cancelar QR"
                                        isLoading={cancellingId === item.qrId}
                                        onClick={() => handleCancelQr(item.qrId)}
                                      />
                                    </Tooltip>
                                    <Tooltip label="Ver comprobante">
                                      <IconButton
                                        icon={<FiFileText />}
                                        size="sm"
                                        colorScheme="blue"
                                        variant="ghost"
                                        aria-label="Ver comprobante"
                                        onClick={() => handleVerComprobante(item)}
                                      />
                                    </Tooltip>
                                    <DownloadQrPdfButton item={item} />
                                    <Tooltip label="Transferir a otro email">
                                      <IconButton
                                        icon={<FiSend />}
                                        size="sm"
                                        colorScheme="teal"
                                        variant="ghost"
                                        aria-label="Transferir ticket"
                                        onClick={() => handleTransferir(item)}
                                      />
                                    </Tooltip>
                                  </>
                                )}
                              </Flex>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              )}
            </>
          )}
        </VStack>
      </Container>

      <Modal isOpen={isReceiptOpen} onClose={onReceiptClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="secondary">Comprobante de pago</ModalHeader>
          <ModalBody>
            {receiptItem && (
              <VStack align="stretch" spacing={3}>
                <Flex justify="space-between">
                  <Text color="gray.600">Evento</Text>
                  <Text fontWeight="600">{receiptItem.eventTitle}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Ticket</Text>
                  <Text fontWeight="600">{receiptItem.ticketTitle}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Cliente</Text>
                  <Text fontWeight="600">{receiptItem.customerName || "—"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Email</Text>
                  <Text fontWeight="600">{receiptItem.customerEmail || "—"}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Monto</Text>
                  <Text fontWeight="600">{formatMoney(receiptItem.amount)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="gray.600">Operación</Text>
                  <Text fontSize="sm" fontFamily="mono">{receiptItem.operationId || "—"}</Text>
                </Flex>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onReceiptClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <TransferTicketModal
        isOpen={isTransferOpen}
        onClose={() => { onTransferClose(); setTransferItem(null); }}
        ticket={transferItem ? { qrId: transferItem.qrId, title: transferItem.ticketTitle } : null}
        onTransferSuccess={handleTransferSuccess}
      />
    </Box>
  );
};

export default SellerQRs;
