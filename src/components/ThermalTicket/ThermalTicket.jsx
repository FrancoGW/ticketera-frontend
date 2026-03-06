import React from "react";

const ThermalTicket = ({ tickets, eventName, ticketType, customerName, customerEmail, quantity, total, pdvName, paymentType, printRef }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  const paymentLabels = {
    efectivo: "Efectivo",
    transferencia: "Transferencia",
    mercadopago: "Mercado Pago",
  };

  return (
    <div ref={printRef} className="thermal-ticket-wrapper">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .thermal-ticket-wrapper,
          .thermal-ticket-wrapper * { visibility: visible !important; }
          .thermal-ticket-wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 80mm !important;
            background: white !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
        .thermal-ticket-wrapper {
          display: none;
        }
        @media print {
          .thermal-ticket-wrapper {
            display: block !important;
          }
        }
      `}</style>

      <div style={{
        fontFamily: "monospace",
        fontSize: "12px",
        width: "80mm",
        padding: "4mm 4mm",
        background: "white",
        color: "black",
        lineHeight: "1.5",
      }}>
        <div style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "6px", marginBottom: "6px" }}>
          <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "2px" }}>GETPASS</div>
          <div style={{ fontSize: "10px" }}>Punto de venta: {pdvName || "—"}</div>
        </div>

        <div style={{ marginBottom: "6px" }}>
          <div style={{ fontWeight: "bold", fontSize: "14px", textAlign: "center" }}>{eventName}</div>
        </div>

        <div style={{ borderTop: "1px dashed #000", borderBottom: "1px dashed #000", padding: "6px 0", marginBottom: "6px" }}>
          <div><strong>Tipo:</strong> {ticketType}</div>
          <div><strong>Cantidad:</strong> {quantity}</div>
          <div><strong>Cliente:</strong> {customerName || "—"}</div>
          <div><strong>Email:</strong> {customerEmail}</div>
        </div>

        <div style={{ marginBottom: "6px" }}>
          <div><strong>Pago:</strong> {paymentLabels[paymentType] || paymentType}</div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}><strong>Total: ${total}</strong></div>
        </div>

        {tickets && tickets.length > 0 && (
          <div style={{ borderTop: "1px dashed #000", paddingTop: "6px", marginBottom: "6px" }}>
            <div style={{ fontSize: "10px", marginBottom: "4px", fontWeight: "bold" }}>QR ENVIADOS AL EMAIL DEL CLIENTE</div>
            {tickets.map((qrDataUrl, i) => (
              <div key={i} style={{ textAlign: "center", marginBottom: "4px" }}>
                <div style={{ fontSize: "10px" }}>Entrada {i + 1} de {tickets.length}</div>
                <img src={qrDataUrl} alt={`QR ${i + 1}`} style={{ width: "40mm", height: "40mm" }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: "1px dashed #000", paddingTop: "6px", textAlign: "center", fontSize: "10px" }}>
          <div>{dateStr} — {timeStr}</div>
          <div>getpass.com.ar</div>
        </div>
      </div>
    </div>
  );
};

export default ThermalTicket;
