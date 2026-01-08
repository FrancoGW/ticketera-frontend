// components/AuthModal/AuthModal.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack
} from '@chakra-ui/react';

const AuthModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      isCentered 
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay 
        bg='blackAlpha.300'
        backdropFilter='blur(10px)'
      />
      <ModalContent>
        <ModalHeader textAlign="center">Iniciar Sesión o Registrarse</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Text textAlign="center">
              Para poder comprar tickets, necesitas tener una cuenta. 
              Por favor, inicia sesión o regístrate.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <VStack width="full" spacing={3}>
            <Button 
              colorScheme="blue" 
              width="full"
              onClick={() => navigate('/login')}
            >
              Iniciar Sesión
            </Button>
            <Button 
              variant="outline" 
              colorScheme="blue" 
              width="full"
              onClick={() => navigate('/register')}
            >
              Registrarse
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;