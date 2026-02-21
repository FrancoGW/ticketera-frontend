import { Td, Tr, Button, useDisclosure, Stack, Box } from "@chakra-ui/react";
import { Document, Page, View, Text as PdfText, PDFDownloadLink, StyleSheet, Image as PdfImage } from "@react-pdf/renderer";
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from "react";
import TransferTicketModal from "../../../components/TransferTicketModal/TransferTicketModal";

const PRIMARY = '#6B46C1';
const GRAY_LIGHT = '#F7FAFC';
const GRAY_TEXT = '#4A5568';

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: 'Helvetica',
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  content: {
    padding: 28,
    paddingTop: 100,
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 6,
  },
  ticketType: {
    fontSize: 12,
    color: GRAY_TEXT,
    marginBottom: 20,
  },
  ticketDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 280,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 6,
  },
  ticketDetailLabel: {
    fontSize: 9,
    color: GRAY_TEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ticketDetailValue: {
    fontSize: 11,
    color: '#1A202C',
    fontWeight: 'bold',
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 8,
    marginBottom: 24,
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  qrLabel: {
    fontSize: 10,
    color: GRAY_TEXT,
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: GRAY_LIGHT,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: GRAY_TEXT,
  },
});

const formatPdfDate = (date) => {
  if (!date?.timestampStart) return '—';
  const d = new Date(date.timestampStart);
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const QrPDF = ({ ticket, eventTitle, qrCodeDataUri }) => {
  if (!ticket || !eventTitle || !qrCodeDataUri) {
    return null;
  }

  const dateStr = formatPdfDate(ticket.date);
  const valueStr = typeof ticket.value === 'number' ? `$${ticket.value.toLocaleString('es-AR')}` : ticket.value;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <PdfText style={styles.logoText}>GetPass</PdfText>
          <PdfText style={styles.tagline}>Tu entrada digital</PdfText>
        </View>

        <View style={styles.content}>
          <PdfText style={styles.eventTitle}>{eventTitle}</PdfText>
          <PdfText style={styles.ticketType}>{ticket.title || 'Entrada'}</PdfText>

          <View style={styles.ticketDetail}>
            <View>
              <PdfText style={styles.ticketDetailLabel}>Fecha y hora</PdfText>
              <PdfText style={styles.ticketDetailValue}>{dateStr}</PdfText>
            </View>
            <View>
              <PdfText style={styles.ticketDetailLabel}>Valor</PdfText>
              <PdfText style={styles.ticketDetailValue}>{valueStr}</PdfText>
            </View>
          </View>

          <View style={styles.qrWrapper}>
            <PdfImage source={{ uri: qrCodeDataUri }} style={styles.qrImage} />
            <PdfText style={styles.qrLabel}>Presentá este código QR en la entrada</PdfText>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <PdfText style={styles.footerText}>GetPass · getpass.com.ar</PdfText>
        </View>
      </Page>
    </Document>
  );
};

const TicketInfo = ({ ticket, index, ticketsData }) => {
  const qrCodeCanvasRef = useRef(null)
  const [qrCodeDataUri, setQrCodeDataUri] = useState(null)
  const [isQrReady, setIsQrReady] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    // Esperar a que el QR se renderice completamente
    const timer = setTimeout(() => {
      if (qrCodeCanvasRef.current) {
        try {
          const canvas = qrCodeCanvasRef.current.querySelector('canvas');
          if (canvas) {
            const dataUri = canvas.toDataURL('image/png', 1.0);
            setQrCodeDataUri(dataUri);
            setIsQrReady(true);
          }
        } catch (error) {
          console.error('Error generando QR data URI:', error);
        }
      }
    }, 100); // Pequeño delay para asegurar que el canvas esté renderizado

    return () => clearTimeout(timer);
  }, [ticket.qrId]) // Depender del qrId en lugar del ref

  const handleTransferSuccess = () => {
    window.location.reload()
  }

  const placeAndDate = ticket.date?.timestampStart
    ? new Date(ticket.date.timestampStart).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
  const valorStr = typeof ticket.value === 'number' ? `$${ticket.value.toLocaleString('es-AR')}` : ticket.value ?? '—';

  return (
    <Tr key={index}>
      <Td>{ticket.title}</Td>
      <Td fontSize="sm" color="gray.700">{placeAndDate}</Td>
      <Td fontWeight="600">{valorStr}</Td>
      <Td>
        <Stack direction="row" spacing={4} align="center">
          <Box position="absolute" left="-9999px" visibility="hidden">
            <div ref={qrCodeCanvasRef}>
              <QRCodeCanvas 
                value={ticket.qrId || ''} 
                id={`qr-code-${index}`}
                size={200}
                level="H"
              />
            </div>
          </Box>
          {isQrReady && qrCodeDataUri ? (
            <PDFDownloadLink
              document={
                <QrPDF
                  ticket={ticket}
                  eventTitle={ticketsData.eventTitle}
                  qrCodeDataUri={qrCodeDataUri}
                />
              }
              fileName={`${ticket.title} - ${ticketsData.eventTitle}.pdf`}
            >
              {({ loading, blob, url, error }) => {
                if (error) {
                  console.error('Error generando PDF:', error);
                  return (
                    <Button size="sm" colorScheme="gray" isDisabled>
                      Error al generar PDF
                    </Button>
                  );
                }
                return (
                  <Button size="sm" colorScheme="gray" isLoading={loading}>
                    {loading ? 'Generando PDF...' : 'Descargar QR'}
                  </Button>
                );
              }}
            </PDFDownloadLink>
          ) : (
            <Button size="sm" colorScheme="gray" isDisabled isLoading>
              Preparando QR...
            </Button>
          )}
          <Button
            size="sm"
            colorScheme="blue"
            onClick={onOpen}
          >
            Transferir
          </Button>
        </Stack>

        <TransferTicketModal
          isOpen={isOpen}
          onClose={onClose}
          ticket={ticket}
          onTransferSuccess={handleTransferSuccess}
        />
      </Td>
    </Tr>
  )
}

export default TicketInfo