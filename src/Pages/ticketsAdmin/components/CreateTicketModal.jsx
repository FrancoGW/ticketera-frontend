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
import { useState, useEffect } from "react";

// Convierte timestamp (ms) a string YYYY-MM-DD en hora local
const timestampToDateStr = (ts) => {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
// Convierte timestamp (ms) a string HH:mm en hora local
const timestampToTimeStr = (ts) => {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
// "Ahora" en formato datetime-local para prellenar inicio de venta y visible desde
const nowDatetimeLocal = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CreateTicketModal = ({ isOpen, onClose, onCreate, event: selectedEvent }) => {
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

  // Prellenar dinámicamente según el evento seleccionado al abrir el modal
  useEffect(() => {
    if (!isOpen) return;
    if (selectedEvent?.dates?.length > 0) {
      const first = selectedEvent.dates[0];
      const tsStart = first.timestampStart;
      const tsEnd = first.timestampEnd;
      const eventDate = timestampToDateStr(tsStart);
      const eventTimeStart = timestampToTimeStr(tsStart);
      const eventTimeEnd = timestampToTimeStr(tsEnd);
      // Fin de venta = hasta el día y hora que arranca el evento. Visible desde = ahora.
      const saleEnd = `${eventDate}T${eventTimeStart}`;
      const now = nowDatetimeLocal();
      setNewTicket((prev) => ({
        ...prev,
        dates: [{ date: eventDate, timeStart: eventTimeStart, timeEnd: eventTimeEnd }],
        saleEndDate: saleEnd,
        saleStartDate: now,
        visibleFrom: now,
      }));
    } else {
      setNewTicket(initialTicketState);
    }
  }, [isOpen, selectedEvent?._id]);

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
                  onChange={(e) => {
                    const newDate = e.target.value;
                    const { timeStart } = newTicket.dates[0];
                    setNewTicket({
                      ...newTicket,
                      dates: [{ ...newTicket.dates[0], date: newDate }],
                      // Fin de venta = hasta el día y hora que arranca el evento (dinámico)
                      saleEndDate: timeStart ? `${newDate}T${timeStart}` : newTicket.saleEndDate,
                    });
                  }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hora de inicio del evento</FormLabel>
                <Input
                  type="time"
                  value={newTicket.dates[0].timeStart}
                  onChange={(e) => {
                    const newTimeStart = e.target.value;
                    const { date } = newTicket.dates[0];
                    setNewTicket({
                      ...newTicket,
                      dates: [
                        { ...newTicket.dates[0], timeStart: newTimeStart },
                      ],
                      // Fin de venta = hasta el día y hora que arranca el evento (dinámico)
                      saleEndDate: date ? `${date}T${newTimeStart}` : newTicket.saleEndDate,
                    });
                  }}
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
                  max={
                    newTicket.dates[0].date && newTicket.dates[0].timeStart
                      ? `${newTicket.dates[0].date}T${newTicket.dates[0].timeStart}`
                      : undefined
                  }
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