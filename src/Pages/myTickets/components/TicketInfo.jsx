import { Td, Tr, Button, useDisclosure, Stack } from "@chakra-ui/react";
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
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!qrCodeCanvasRef.current) {
      return
    }
    setQrCodeDataUri(qrCodeCanvasRef.current.children[0].toDataURL('image/jpg', 0.7))
  }, [qrCodeCanvasRef])

  const handleTransferSuccess = () => {
    window.location.reload()
  }

  return (
    <Tr key={index}>
      <Td>{ticket.title}</Td>
      <Td>{ticket.value}</Td>
      <Td>
        <Stack direction="row" spacing={4} align="center">
          <div ref={qrCodeCanvasRef}>
            <QRCodeCanvas style={{ width: 0, height: 0 }} value={ticket.qrId} id={`qr-code-${index}`} />
          </div>
          <PDFDownloadLink
            document={
              <QrPDF
                ticket={ticket}
                eventTitle={ticketsData.eventTitle}
                qrCodeDataUri={qrCodeDataUri}
              />
            }
            fileName={`${ticket.title} - ${ticketsData.eventTitle}`}
          >
            {({ loading }) =>
              <Button size="sm" colorScheme="gray">
                {loading ? 'Cargando QR...' : 'Descargar QR'}
              </Button>
            }
          </PDFDownloadLink>
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