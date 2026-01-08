import {
  pdf,
  Document,
  Page,
  View,
  Image,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";

// Estilos para el PDF
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
  },
  qrContainer: {
    width: "25%",
    padding: 10,
    alignItems: "center",
  },
  qrImage: {
    width: 120,
    height: 120,
  },
  qrText: {
    fontSize: 8,
    marginTop: 5,
    textAlign: "center",
  },
});

// Componente para el PDF
const QRDocument = ({ qrCodes }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {qrCodes.map((qr) => (
        <View key={qr.id} style={pdfStyles.qrContainer}>
          <Image style={pdfStyles.qrImage} src={qr.image} />
          <Text style={pdfStyles.qrText}>{qr.id}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

// Función para generar QRs
export const generateCourtesyQR = async ({ ticketId, quantity, token }) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/tickets/generate-courtesy-qr`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketId,
        quantity: parseInt(quantity),
      }),
    }
  );

  if (!response.ok) throw new Error("Error generating QR codes");
  return response.json();
};

// Función para descargar QRs como PDF
export const downloadQRAsPDF = async ({ ticketId, token }) => {
  // Obtener QRs
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/tickets/courtesy-qrs/${ticketId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) throw new Error("Error downloading QR codes");

  const data = await response.json();
  if (!data.ok || !data.qrCodes || !data.qrCodes.length) {
    throw new Error("No QR codes available");
  }

  // Generar PDF
  const blob = await pdf(<QRDocument qrCodes={data.qrCodes} />).toBlob();

  // Descargar archivo
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `courtesy-qrs-${ticketId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return data;
};
