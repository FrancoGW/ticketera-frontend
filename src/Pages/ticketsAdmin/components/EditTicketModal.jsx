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
import { useEffect, useState } from "react";

const EditTicketModal = ({ isOpen, onClose, onEdit, ticket }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title || "",
        price: ticket.price || 0,
        ticketType: ticket.ticketType || "GENERAL",
        discountPercentage: ticket.discountPercentage || 0,
        maxEntries: ticket.maxEntries || 0,
        dates: [
          {
            date: ticket.dates?.[0]?.date || "",
            timeStart: ticket.dates?.[0]?.timeStart || "",
            timeEnd: ticket.dates?.[0]?.timeEnd || "",
          },
        ],
        saleStartDate: ticket.saleStartDate
          ? new Date(ticket.saleStartDate).toISOString().slice(0, 16)
          : "",
        saleEndDate: ticket.saleEndDate
          ? new Date(ticket.saleEndDate).toISOString().slice(0, 16)
          : "",
        visibleFrom: ticket.visibleFrom
          ? new Date(ticket.visibleFrom).toISOString().slice(0, 16)
          : "",
        soldCount: ticket.soldCount || 0,
      });
    }
  }, [ticket]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ticket?._id) {
      console.error("No ticket ID available");
      return;
    }

    if (
      !formData.title ||
      !formData.price ||
      !formData.maxEntries ||
      !formData.dates[0].date ||
      !formData.dates[0].timeStart ||
      !formData.dates[0].timeEnd ||
      !formData.saleStartDate ||
      !formData.saleEndDate ||
      !formData.visibleFrom
    ) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const updatedData = {
      title: formData.title,
      price: parseFloat(formData.price),
      ticketType: formData.ticketType,
      discountPercentage: parseFloat(formData.discountPercentage),
      maxEntries: parseInt(formData.maxEntries),
      dates: [
        {
          date: formData.dates[0].date,
          timeStart: formData.dates[0].timeStart,
          timeEnd: formData.dates[0].timeEnd,
        },
      ],
      saleStartDate: new Date(formData.saleStartDate).toISOString(),
      saleEndDate: new Date(formData.saleEndDate).toISOString(),
      visibleFrom: new Date(formData.visibleFrom).toISOString(),
      soldCount: parseInt(formData.soldCount),
    };

    onEdit(ticket._id, updatedData);
  };

  const handleClose = () => {
    setFormData({
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
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Editar Ticket</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nombre del Ticket</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Precio</FormLabel>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tipo de Ticket</FormLabel>
                <Select
                  value={formData.ticketType}
                  onChange={(e) =>
                    setFormData({ ...formData, ticketType: e.target.value })
                  }
                >
                  <option value="GENERAL">General</option>
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="JUBILADO">Jubilado</option>
                  <option value="BANCO_CORRIENTES">Banco Corrientes</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Cantidad de entradas</FormLabel>
                <Input
                  type="number"
                  value={formData.maxEntries}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxEntries: parseInt(e.target.value),
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Porcentaje de descuento</FormLabel>
                <Input
                  type="number"
                  value={formData.discountPercentage}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountPercentage: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fecha del evento</FormLabel>
                <Input
                  type="date"
                  value={formData.dates[0].date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dates: [{ ...formData.dates[0], date: e.target.value }],
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hora de inicio del evento</FormLabel>
                <Input
                  type="time"
                  value={formData.dates[0].timeStart}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dates: [
                        { ...formData.dates[0], timeStart: e.target.value },
                      ],
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Hora de fin del evento</FormLabel>
                <Input
                  type="time"
                  value={formData.dates[0].timeEnd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dates: [
                        { ...formData.dates[0], timeEnd: e.target.value },
                      ],
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Inicio de venta</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.saleStartDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      saleStartDate: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Fin de venta</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.saleEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, saleEndDate: e.target.value })
                  }
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Visible desde</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.visibleFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, visibleFrom: e.target.value })
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
              Guardar Cambios
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default EditTicketModal;
