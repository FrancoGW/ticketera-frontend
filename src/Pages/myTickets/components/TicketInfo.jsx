import { Td, Tr, Button, useDisclosure, Stack, Box } from "@chakra-ui/react";
import { Document, Page, View, Text as PdfText, PDFDownloadLink, StyleSheet, Image as PdfImage } from "@react-pdf/renderer";
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from "react";
import TransferTicketModal from "../../../components/TransferTicketModal/TransferTicketModal"
const styles = StyleSheet.create({
  page: {
    marginTop: 100,
    alignItems: 'center'
  },
  section: {
    width: '50%',
    margin: 10,
    padding: 10,
    textAlign: 'center'
  }
});

const QrPDF = ({ ticket, eventTitle, qrCodeDataUri }) => {
  if (!ticket || !eventTitle  || !qrCodeDataUri) {
    return null
  }


  return <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <PdfText>
          {eventTitle}
        </PdfText>
      </View>


      <View style={styles.section}>
        <PdfImage source={{ uri: qrCodeDataUri }} />
      </View>
    </Page>
  </Document>
}

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

  return (
    <Tr key={index}>
      <Td>{ticket.title}</Td>
      <Td>{ticket.value}</Td>
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