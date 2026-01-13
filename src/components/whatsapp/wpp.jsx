import React from 'react'
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"


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
      <AnimatePresence>
        {showButton && (
          <motion.button
            onClick={handleWhatsAppClick}
            className="whatsappButton"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <i className="fab fa-whatsapp"></i>
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showMessage && (
          <motion.div
            className="message"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <p>¿En qué puedo ayudarte?</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



export default wpp