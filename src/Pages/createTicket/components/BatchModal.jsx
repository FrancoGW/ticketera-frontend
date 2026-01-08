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
  Button,
  useToast,
} from '@chakra-ui/react';
import ticketApi from "../../../Api/ticket";

const BatchModal = ({ isOpen, onClose, ticketId, onBatchCreated }) => {
  const [batchData, setBatchData] = useState({
    name: "",
    price: "",
    maxEntries: "",
    startDate: "",
    endDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await ticketApi.createBatch({
        ...batchData,
        ticketRef: ticketId
      });

      toast({
        title: "Lote creado",
        description: "El lote se ha creado exitosamente",
        status: "success",
        duration: 3000,
      });

      onBatchCreated();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el lote",
        status: "error",
        duration: 3000,
      });
    }

    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontFamily="secondary">Crear Nuevo Lote</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>Nombre del Lote</FormLabel>
              <Input
                placeholder="ej: Early Bird"
                value={batchData.name}
                onChange={(e) => setBatchData({ ...batchData, name: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired mb={4}>
              <FormLabel>Precio</FormLabel>
              <Input
                type="number"
                placeholder="Precio del lote"
                value={batchData.price}
                onChange={(e) => setBatchData({ ...batchData, price: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired mb={4}>
              <FormLabel>Cantidad de Tickets</FormLabel>
              <Input
                type="number"
                placeholder="Cantidad máxima de tickets"
                value={batchData.maxEntries}
                onChange={(e) => setBatchData({ ...batchData, maxEntries: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired mb={4}>
              <FormLabel>Fecha de Inicio</FormLabel>
              <Input
                type="datetime-local"
                value={batchData.startDate}
                onChange={(e) => setBatchData({ ...batchData, startDate: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired mb={4}>
              <FormLabel>Fecha de Fin</FormLabel>
              <Input
                type="datetime-local"
                value={batchData.endDate}
                onChange={(e) => setBatchData({ ...batchData, endDate: e.target.value })}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              type="submit"
              isLoading={isLoading}
            >
              Crear Lote
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

export default BatchModal;