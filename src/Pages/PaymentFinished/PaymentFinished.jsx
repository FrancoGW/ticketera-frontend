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

const PaymentComponent = ({ paymentResult, errorMessage }) => {
  switch (paymentResult) {
    case 'success':
      return <PaymentApproved />
    case 'failure':
      return <PaymentDeclined message={errorMessage} />
    case 'pending':
      return <PaymentInProcess />
  }
}

function PaymentFinished() {
  const [paymentResult, setPaymentResult] = useState('')
  const [errorMessage, setErrorMessage] = useState('')


  useEffect(() => {
    const paymentStatus = getQueryValue('paymentStatus')
    setPaymentResult(paymentStatus)
  
  }, [])

  return (
    <>
      <Header />
        <PaymentComponent paymentResult={paymentResult} errorMessage={errorMessage} />
      <Footer />
    </>
  );
}

export default PaymentFinished;
