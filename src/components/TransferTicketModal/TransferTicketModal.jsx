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
import ticketApi from '../../Api/ticket';

const TransferTicketModal = ({ isOpen, onClose, ticket, onTransferSuccess }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const toast = useToast();

  const handleTransfer = async () => {
    if (!email?.trim()) {
      setEmailError('Por favor ingresá el email del destinatario');
      return;
    }

    const qrId = ticket?.qrId;
    if (!qrId) {
      setEmailError('No se puede transferir este ticket');
      return;
    }

    setIsLoading(true);
    setEmailError('');
    try {
      await ticketApi.transferTicketByQr(qrId, email.trim());
      toast({
        title: "Ticket transferido",
        description: "El destinatario recibirá un email con el nuevo QR (no necesita cuenta).",
        status: "success",
        duration: 4000,
        isClosable: true,
      });
      onTransferSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudo transferir el ticket",
        status: "error",
        duration: 4000,
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
            <Text fontSize="xs" color="gray.500" mt={2}>
              Recibirá el ticket por email con el QR; no necesita tener cuenta.
            </Text>
            {emailError && (
              <FormErrorMessage>{emailError}</FormErrorMessage>
            )}
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleTransfer}
            isLoading={isLoading}
            isDisabled={!email?.trim()}
          >
            Transferir
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TransferTicketModal;