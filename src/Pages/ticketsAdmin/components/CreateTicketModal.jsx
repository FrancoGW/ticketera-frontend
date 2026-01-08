import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";

const CreateTicketModal = ({ isOpen, onClose, onCreate }) => {
  const toast = useToast();
  const initialTicketState = {
    title: "",
    price: 0,
    ticketType: "GENERAL",
    discountPercentage: 0,
    maxEntries: 0,
    dates: [
      {
        date: "",
        timeStart: "",
        timeEnd: "",
      },
    ],
    saleStartDate: "",
    saleEndDate: "",
    visibleFrom: "",
    soldCount: 0,
  };

  const [newTicket, setNewTicket] = useState(initialTicketState);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !newTicket.title ||
      !newTicket.price ||
      !newTicket.maxEntries ||
      !newTicket.dates[0].date ||
      !newTicket.dates[0].timeStart ||
      !newTicket.dates[0].timeEnd ||
      !newTicket.saleStartDate ||
      !newTicket.saleEndDate ||
      !newTicket.visibleFrom
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const ticketData = {
      title: newTicket.title,
      price: parseFloat(newTicket.price),
      maxEntries: parseInt(newTicket.maxEntries),
      ticketType: newTicket.ticketType,
      discountPercentage: parseFloat(newTicket.discountPercentage) || 0,
      dates: [
        {
          date: newTicket.dates[0].date,
          timeStart: newTicket.dates[0].timeStart,
          timeEnd: newTicket.dates[0].timeEnd,
        },
      ],
      saleStartDate: new Date(newTicket.saleStartDate).toISOString(),
      saleEndDate: new Date(newTicket.saleEndDate).toISOString(),
      visibleFrom: new Date(newTicket.visibleFrom).toISOString(),
      soldCount: parseInt(newTicket.soldCount) || 0,
    };

    onCreate(ticketData);
    setNewTicket(initialTicketState);
  };

  const handleClose = () => {
    setNewTicket(initialTicketState);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Crear Nuevo Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Tipo de Ticket</FormLabel>
                <Select
                  value={newTicket.ticketType}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, ticketType: e.target.value })
                  }
                >
                  <option value="GENERAL">General</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="JUBILADO">Jubilado</option>
                  <option value="BANCO_CORRIENTES">Banco Corrientes</option>
                  <option value="CORTESIA">Cortesia</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Nombre del Ticket</FormLabel>
                <Input
                  value={newTicket.title}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, title: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <Input
                  type="number"
                  value={newTicket.price}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, price: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Canal de venta</FormLabel>
                <Select
                  value={newTicket.saleChannel}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, saleChannel: e.target.value })
                  }
                >
                  <option value="ONLINE">ONLINE</option>
                  <option value="PDV">PDV</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Cantidad de entradas</FormLabel>
                <Input
                  type="number"
                  value={newTicket.maxEntries}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      maxEntries: parseInt(e.target.value),
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Porcentaje de descuento</FormLabel>
                <Input
                  type="number"
                  value={newTicket.discountPercentage}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      discountPercentage: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fecha del evento</FormLabel>
                <Input
                  type="date"
                  value={newTicket.dates[0].date}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      dates: [{ ...newTicket.dates[0], date: e.target.value }],
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hora de inicio del evento</FormLabel>
                <Input
                  type="time"
                  value={newTicket.dates[0].timeStart}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      dates: [
                        { ...newTicket.dates[0], timeStart: e.target.value },
                      ],
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hora de fin del evento</FormLabel>
                <Input
                  type="time"
                  value={newTicket.dates[0].timeEnd}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      dates: [
                        { ...newTicket.dates[0], timeEnd: e.target.value },
                      ],
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Inicio de venta</FormLabel>
                <Input
                  type="datetime-local"
                  value={newTicket.saleStartDate}
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      saleStartDate: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fin de venta</FormLabel>
                <Input
                  type="datetime-local"
                  value={newTicket.saleEndDate}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, saleEndDate: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Visible desde</FormLabel>
                <Input
                  type="datetime-local"
                  value={newTicket.visibleFrom}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, visibleFrom: e.target.value })
                  }
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              bg="primary"
              color="white"
              _hover={{ bg: "buttonHover" }}
              type="submit"
            >
              Crear Ticket
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateTicketModal;