import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useEffect, useState } from "react";
import PaymentApproved from "./components/PaymentApproved.jsx";
import PaymentDeclined from "./components/PaymentDeclined.jsx";
import PaymentInProcess from "./components/PaymentInProcess.jsx";

const getQueryValue = (key) => {
  const query = new URLSearchParams(window.location.search);
  return query.get(key);
};

const PaymentComponent = ({ paymentResult, errorMessage, isMembership }) => {
  switch (paymentResult) {
    case 'success':
    case 'approved':
      return <PaymentApproved isMembership={isMembership} />
    case 'failure':
    case 'rejected':
      return <PaymentDeclined message={errorMessage} />
    case 'pending':
      return <PaymentInProcess />
    default:
      return <PaymentDeclined message="Estado de pago desconocido" />
  }
}

function PaymentFinished() {
  const [paymentResult, setPaymentResult] = useState('')
  const [errorMessage, setErrorMessage] = useState('')


  useEffect(() => {
    // Mercado Pago Checkout Pro redirige con 'status' (approved, rejected, pending)
    // También soportamos 'paymentStatus' para compatibilidad con versiones anteriores
    const status = getQueryValue('status') || getQueryValue('paymentStatus')
    
    // Mapear estados de Mercado Pago a estados internos
    let mappedStatus = '';
    if (status === 'approved') {
      mappedStatus = 'success';
    } else if (status === 'rejected') {
      mappedStatus = 'failure';
    } else if (status === 'pending') {
      mappedStatus = 'pending';
    } else if (status === 'success' || status === 'failure') {
      // Mantener compatibilidad con estados anteriores
      mappedStatus = status;
    }
    
    setPaymentResult(mappedStatus);
    
    // Obtener información adicional del pago si está disponible
    const paymentId = getQueryValue('payment_id');
    const collectionId = getQueryValue('collection_id');
    const preferenceId = getQueryValue('preference_id');
    
    // Log para debugging (opcional)
    if (paymentId || collectionId || preferenceId) {
      console.log('Payment info:', { paymentId, collectionId, preferenceId, status });
    }
  }, [])

  const isMembership = getQueryValue('membership') === '1';

  return (
    <>
      <Header />
        <PaymentComponent paymentResult={paymentResult} errorMessage={errorMessage} isMembership={isMembership} />
      <Footer />
    </>
  );
}

export default PaymentFinished;
