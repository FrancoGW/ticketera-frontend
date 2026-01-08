import React from 'react'
import { useEffect, useState } from "react"


const wpp = () => {
  const [showButton, setShowButton] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const isMessageShown = localStorage.getItem('messageShown');

    if (!isMessageShown) {
      const timer = setTimeout(() => {
        setShowButton(true);
        setShowMessage(true);
        localStorage.setItem('messageShown', true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setShowButton(true);
    }
  }, []);

  const handleWhatsAppClick = () => {
    window.open('https://api.whatsapp.com/send?phone=3794799421', '_blank');
  };

  useEffect(() => {
    if (showButton) {
      const messageTimer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);

      return () => clearTimeout(messageTimer);
    }
  }, [showButton]);

  return (
    <div className="App">
      {showButton && (
        <button
          onClick={handleWhatsAppClick}
          className="whatsappButton"
          style={{
            opacity: showButton ? 1 : 0,
            transition: 'opacity 1s ease-in-out'
          }}
        >
          <i className="fab fa-whatsapp"></i>
        </button>
      )}
      {showMessage && (
        <div
          className="message"
          style={{
            opacity: showMessage ? 1 : 0,
            transition: 'opacity 1s ease-in-out'
          }}
        >
          <p>¿En qué puedo ayudarte?</p>
        </div>
      )}
    </div>
  );
}



export default wpp