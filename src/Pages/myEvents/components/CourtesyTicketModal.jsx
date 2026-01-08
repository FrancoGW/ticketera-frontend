import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  VStack,
  Text,
} from '@chakra-ui/react';
import ticketApi from '../../../Api/ticket';

const CourtesyTicketModal = ({ isOpen, onClose, event }) => {
  const [formData, setFormData] = useState({
    email: '',
    selectedTicket: '',
    selectedDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleGenerateCourtesyTicket = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ticketApi.generateCourtesyTicket({
        eventId: event._id,
        ticketId: formData.selectedTicket,
        email: formData.email,
        date: formData.selectedDate
      });

      toast({
        title: "Ticket generado",
        description: "El ticket de cortesía se ha generado y enviado correctamente",
        status: "success",
        duration: 3000,
      });

      onClose();
    } catch (error) {
      console.error('Error generating courtesy ticket:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el ticket de cortesía",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontFamily="secondary">Generar Ticket de Cortesía</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleGenerateCourtesyTicket}>
          <ModalBody>
            <VStack spacing={4}>
              <Text fontWeight="bold">{event?.title}</Text>
              
              <FormControl isRequired>
                <FormLabel>Tipo de Ticket</FormLabel>
                <Select
                  placeholder="Selecciona un tipo de ticket"
                  value={formData.selectedTicket}
                  onChange={(e) => setFormData({ ...formData, selectedTicket: e.target.value })}
                >
                  {event?.tickets?.map((ticket) => (
                    <option key={ticket._id} value={ticket._id}>
                      {ticket.title}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fecha del Evento</FormLabel>
                <Select
                  placeholder="Selecciona una fecha"
                  value={formData.selectedDate}
                  onChange={(e) => setFormData({ ...formData, selectedDate: e.target.value })}
                >
                  {event?.dates?.map((date, index) => (
                    <option key={index} value={JSON.stringify(date)}>
                      {new Date(date.date).toLocaleDateString()} - {date.timeStart}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email del Destinatario</FormLabel>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              type="submit"
              isLoading={isLoading}
            >
              Generar y Enviar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CourtesyTicketModal;