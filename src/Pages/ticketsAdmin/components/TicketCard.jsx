import {
  Box,
  Stack,
  Heading,
  Text,
  Button,
  Badge,
  Flex,
  Divider,
  Grid,
  Icon,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import {
  CalendarIcon,
  TimeIcon,
  DownloadIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { useState } from "react";
import { generateCourtesyQR, downloadQRAsPDF } from "./qrPdfGenerator";

const TicketCard = ({ ticket, onEdit, onDelete }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      console.error("Error formatting datetime:", error);
      return "Fecha/hora inválida";
    }
  };

  const formatTime = (timeString) => {
    try {
      return timeString || "No especificado";
    } catch (error) {
      return "Hora inválida";
    }
  };

  const getTicketTypeColor = (type) => {
    const colors = {
      GENERAL: "green",
      ESTUDIANTE: "blue",
      JUBILADO: "purple",
      BANCO_CORRIENTES: "orange",
      CORTESIA: "pink",
    };
    return colors[type] || "gray";
  };

  const calculateAvailableTickets = () => {
    const sold = ticket.soldCount || 0;
    const max = ticket.maxEntries || 0;
    return max - sold;
  };

  const calculateDiscountedPrice = () => {
    const price = ticket.price || 0;
    const discount = ticket.discountPercentage || 0;
    return price - (price * discount) / 100;
  };

  const handleGenerateQR = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      await generateCourtesyQR({
        ticketId: ticket._id,
        quantity,
        token,
      });

      toast({
        title: "QR Codes Generated",
        description: `Successfully generated ${quantity} QR codes`,
        status: "success",
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR codes",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      await downloadQRAsPDF({
        ticketId: ticket._id,
        token,
      });

      toast({
        title: "Success",
        description: "QR codes downloaded successfully as PDF",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR codes",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={6}
      bg="white"
      shadow="md"
    >
      <Stack spacing={4}>
        {/* Encabezado */}
        <Flex justify="space-between" align="center">
          <Heading size="md" fontFamily="secondary">
            {ticket.title}
          </Heading>
          <Badge
            colorScheme={getTicketTypeColor(ticket.ticketType)}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            {ticket.ticketType}
          </Badge>
        </Flex>

        <Divider />

        {/* Información de Precios */}
        <Box bg="gray.50" p={3} borderRadius="md">
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <Box>
              <Text fontSize="sm" color="gray.600">
                Precio Original:
              </Text>
              <Text fontWeight="bold">
                ${ticket.price?.toLocaleString() || 0}
              </Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">
                Descuento:
              </Text>
              <Text fontWeight="bold">{ticket.discountPercentage || 0}%</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">
                Precio Final:
              </Text>
              <Text fontWeight="bold" color="green.600">
                ${calculateDiscountedPrice().toLocaleString()}
              </Text>
            </Box>
          </Grid>
        </Box>

        {/* Información del Evento */}
        <Box>
          <Flex align="center" mb={2}>
            <Icon as={CalendarIcon} mr={2} color="blue.500" />
            <Text fontWeight="medium">Fecha del Evento:</Text>
          </Flex>
          <Text ml={6} mb={2}>
            {formatDate(ticket.dates?.[0]?.date)}
          </Text>

          <Flex align="center" mb={2}>
            <Icon as={TimeIcon} mr={2} color="blue.500" />
            <Text fontWeight="medium">Horario:</Text>
          </Flex>
          <Text ml={6}>
            {formatTime(ticket.dates?.[0]?.timeStart)} -{" "}
            {formatTime(ticket.dates?.[0]?.timeEnd)}
          </Text>
        </Box>

        {/* Información de Disponibilidad */}
        <Box bg="gray.50" p={3} borderRadius="md">
          <Grid templateColumns="repeat(3, 1fr)" gap={3}>
            <Box>
              <Text fontSize="sm" color="gray.600">
                Vendidos:
              </Text>
              <Text fontWeight="bold">{ticket.soldCount || 0}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">
                Disponibles:
              </Text>
              <Text fontWeight="bold">{calculateAvailableTickets()}</Text>
            </Box>
            <Box>
              <Text fontSize="sm" color="gray.600">
                Total:
              </Text>
              <Text fontWeight="bold">{ticket.maxEntries || 0}</Text>
            </Box>
          </Grid>
        </Box>

        {/* Información de Ventas */}
        <Box>
          <Flex align="center" mb={2}>
            <Icon mr={2} color="blue.500" />
            <Text fontWeight="medium">Período de Venta:</Text>
          </Flex>
          <Grid templateColumns="1fr" gap={2} ml={6}>
            <Text fontSize="sm">
              <Text as="span" color="gray.600">
                Inicio:{" "}
              </Text>
              {formatDateTime(ticket.saleStartDate)}
            </Text>
            <Text fontSize="sm">
              <Text as="span" color="gray.600">
                Fin:{" "}
              </Text>
              {formatDateTime(ticket.saleEndDate)}
            </Text>
            <Text fontSize="sm">
              <Text as="span" color="gray.600">
                Visible desde:{" "}
              </Text>
              {formatDateTime(ticket.visibleFrom)}
            </Text>
          </Grid>
        </Box>

        <Divider />

        {/* Botones de Acción */}
        <Flex justify="space-between" mt={2} flexWrap="wrap" gap={2}>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={onEdit}
            leftIcon={<Icon as={CalendarIcon} />}
          >
            Editar
          </Button>

          {ticket.ticketType === "CORTESIA" && (
            <>
              <Button
                size="sm"
                colorScheme="teal"
                onClick={onOpen}
                leftIcon={<AddIcon />}
                isLoading={isLoading}
              >
                Generar QR
              </Button>
              <Button
                size="sm"
                colorScheme="cyan"
                onClick={handleDownloadQR}
                leftIcon={<DownloadIcon />}
                isLoading={isLoading}
              >
                Descargar QR
              </Button>
            </>
          )}

          <Button
            size="sm"
            colorScheme="red"
            onClick={onDelete}
            variant="outline"
          >
            Eliminar
          </Button>
        </Flex>

        {/* Modal for QR Generation */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Generar Códigos QR de Cortesía</ModalHeader>
            <ModalBody>
              <Text mb={4}>Ingrese la cantidad de códigos QR a generar:</Text>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
                max={1000}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleGenerateQR}
                isLoading={isLoading}
              >
                Generar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </Box>
  );
};

export default TicketCard;
