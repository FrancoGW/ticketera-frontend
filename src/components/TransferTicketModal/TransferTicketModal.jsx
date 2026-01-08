import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Text,
  FormErrorMessage,
} from '@chakra-ui/react';
import ticketApi from '../../Api/ticket'
import api from '../../config/axios.config';
const TransferTicketModal = ({ isOpen, onClose, ticket, onTransferSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const toast = useToast();

  const validateEmail = async (email) => {
    try {
      const response = await api.post('/users/check-email', { email });
      return response.data.exists;
    } catch (error) {
      console.error('Error validando email:', error);
      return false;
    }
  };

  const handleTransfer = async () => {
    if (!email) {
      setEmailError('Por favor ingresa un email');
      return;
    }

    setIsLoading(true);
    try {
      // Primero validamos si el email existe
      const emailExists = await validateEmail(email);
      
      if (!emailExists) {
        setEmailError('Este email no está registrado en el sistema');
        setIsLoading(false);
        return;
      }

      // Si el email existe, procedemos con la transferencia
      await ticketApi.makeTransferable(ticket.id); // Asumiendo que el ID está en ticket.id
      await ticketApi.transferTicket(ticket.id, email);
      
      toast({
        title: "Éxito",
        description: "Ticket transferido correctamente",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onTransferSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo transferir el ticket",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(''); // Limpiar error cuando el usuario escribe
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontFamily="secondary">Transferir Ticket</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text mb={4} fontFamily="secondary">
            Ticket: {ticket?.title}
          </Text>
          <FormControl isInvalid={!!emailError}>
            <FormLabel fontFamily="secondary">Email del destinatario</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="correo@ejemplo.com"
            />
            {emailError && (
              <FormErrorMessage>{emailError}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          {/* <Button
            colorScheme="blue"
            mr={3}
            onClick={handleTransfer}
            isLoading={isLoading}
            isDisabled={!!emailError}
          >
            Transferir
          </Button> */}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferTicketModal;