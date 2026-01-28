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
  Box,
  HStack,
  Flex,
  Icon,
  Divider,
  Badge,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Heading,
} from '@chakra-ui/react';
import { FiGift, FiMail, FiCalendar, FiUser } from 'react-icons/fi';
import { RiTicket2Line } from 'react-icons/ri';
import { motion } from 'framer-motion';
import ticketApi from '../../../Api/ticket';
import { getObjDate } from '../../../common/utils';

const CourtesyTicketModal = ({ isOpen, onClose, event }) => {
  const [formData, setFormData] = useState({
    email: '',
    selectedTicket: '',
    selectedDate: '',
    quantity: 1,
    sendEmail: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleGenerateCourtesyTicket = async (e) => {
    e.preventDefault();
    
    if (!formData.selectedTicket || !formData.selectedDate || !formData.email) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    if (formData.quantity < 1) {
      toast({
        title: "Cantidad inválida",
        description: "La cantidad debe ser al menos 1",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Parsear la fecha seleccionada
      let dateObj;
      try {
        dateObj = JSON.parse(formData.selectedDate);
      } catch (e) {
        // Si no es JSON válido, usar el valor directamente
        dateObj = formData.selectedDate;
      }

      // Si se generan múltiples tickets, hacer múltiples llamadas
      const promises = [];
      for (let i = 0; i < formData.quantity; i++) {
        promises.push(
          ticketApi.generateCourtesyTicket({
            eventId: event._id,
            ticketId: formData.selectedTicket,
            email: formData.email,
            date: dateObj, // Enviar el objeto de fecha parseado
            quantity: 1, // Cada llamada genera 1 ticket
            sendEmail: formData.sendEmail
          })
        );
      }

      await Promise.all(promises);

      toast({
        title: "Tickets generados exitosamente",
        description: `Se generaron ${formData.quantity} ticket(s) de cortesía${formData.sendEmail ? ' y se enviaron por email' : ''}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Resetear formulario
      setFormData({
        email: '',
        selectedTicket: '',
        selectedDate: '',
        quantity: 1,
        sendEmail: true
      });
      onClose();
    } catch (error) {
      console.error('Error generating courtesy ticket:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "No se pudieron generar los tickets de cortesía",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTicketInfo = event?.tickets?.find(t => t._id === formData.selectedTicket);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent borderRadius="xl" overflow="hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            bgGradient="linear(to-r, purple.500, purple.600)"
            color="white"
            p={6}
            position="relative"
          >
            <Button
              position="absolute"
              top={4}
              right={4}
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              _active={{ bg: "blue.700" }}
              onClick={onClose}
              borderRadius="full"
              size="sm"
              minW="32px"
              h="32px"
              p={0}
              zIndex={1}
              fontSize="lg"
              fontWeight="bold"
            >
              ✕
            </Button>
            <Flex direction="column" pr={12}>
              <HStack spacing={3} mb={2} align="center" flexWrap="nowrap">
                <Icon as={FiGift} boxSize={6} flexShrink={0} />
                <Heading 
                  fontFamily="secondary" 
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color="white"
                  p={0}
                  m={0}
                  lineHeight="1.2"
                  as="h2"
                  size="md"
                >
                  Generar Tickets de Cortesía
                </Heading>
              </HStack>
              <Text fontSize="sm" opacity={0.9} ml={9} mt={1}>
                {event?.title}
              </Text>
            </Flex>
          </Box>
        </motion.div>

        <form onSubmit={handleGenerateCourtesyTicket}>
          <ModalBody p={6}>
            <VStack spacing={5} align="stretch">
              {/* Información del ticket seleccionado */}
              {selectedTicketInfo && (
                <Box
                  p={4}
                  bg="purple.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="purple.200"
                >
                  <HStack spacing={2} mb={2}>
                    <Icon as={RiTicket2Line} color="purple.600" />
                    <Text fontWeight="600" color="purple.900">
                      {selectedTicketInfo.title}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="purple.700">
                    Precio: ${selectedTicketInfo.price?.toLocaleString('es-AR') || '0'}
                  </Text>
                </Box>
              )}

              <FormControl isRequired>
                <FormLabel fontWeight="600" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={RiTicket2Line} />
                    <Text>Tipo de Ticket</Text>
                  </HStack>
                </FormLabel>
                <Select
                  placeholder="Selecciona un tipo de ticket"
                  value={formData.selectedTicket}
                  onChange={(e) => setFormData({ ...formData, selectedTicket: e.target.value })}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "purple.400" }}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                >
                  {event?.tickets?.map((ticket) => (
                    <option key={ticket._id} value={ticket._id}>
                      {ticket.title} - ${ticket.price?.toLocaleString('es-AR') || '0'}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} />
                    <Text>Fecha del Evento</Text>
                  </HStack>
                </FormLabel>
                <Select
                  placeholder="Selecciona una fecha"
                  value={formData.selectedDate}
                  onChange={(e) => setFormData({ ...formData, selectedDate: e.target.value })}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "purple.400" }}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                >
                  {event?.dates?.map((date, index) => {
                    // Usar getObjDate si tiene timestampStart, sino usar date directamente
                    let formattedDate;
                    let timeStart, timeEnd;
                    
                    if (date.timestampStart) {
                      const objDate = getObjDate(date);
                      formattedDate = objDate.date;
                      timeStart = objDate.timeStart;
                      timeEnd = objDate.timeEnd;
                    } else if (date.date) {
                      // Si tiene date como string, formatearlo
                      try {
                        const dateObj = new Date(date.date);
                        if (!isNaN(dateObj.getTime())) {
                          formattedDate = dateObj.toLocaleDateString('es-AR', {
                            weekday: 'short',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          });
                          timeStart = date.timeStart || '';
                          timeEnd = date.timeEnd || '';
                        } else {
                          formattedDate = date.date;
                          timeStart = date.timeStart || '';
                          timeEnd = date.timeEnd || '';
                        }
                      } catch (e) {
                        formattedDate = date.date;
                        timeStart = date.timeStart || '';
                        timeEnd = date.timeEnd || '';
                      }
                    } else {
                      formattedDate = 'Fecha no disponible';
                      timeStart = '';
                      timeEnd = '';
                    }
                    
                    return (
                      <option key={index} value={JSON.stringify(date)}>
                        {formattedDate} {timeStart && timeEnd ? `• ${timeStart} - ${timeEnd}` : ''}
                      </option>
                    );
                  })}
                </Select>
                {formData.selectedDate && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Fecha seleccionada correctamente
                  </Text>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiUser} />
                    <Text>Email del Destinatario</Text>
                  </HStack>
                </FormLabel>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  size="lg"
                  borderRadius="lg"
                  borderColor="gray.300"
                  _hover={{ borderColor: "purple.400" }}
                  _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600" mb={2}>
                  <HStack spacing={2}>
                    <Icon as={FiGift} />
                    <Text>Cantidad de Tickets</Text>
                  </HStack>
                </FormLabel>
                <NumberInput
                  value={formData.quantity}
                  onChange={(valueString) => setFormData({ ...formData, quantity: parseInt(valueString) || 1 })}
                  min={1}
                  max={100}
                  size="lg"
                >
                  <NumberInputField
                    borderRadius="lg"
                    borderColor="gray.300"
                    _hover={{ borderColor: "purple.400" }}
                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Puedes generar entre 1 y 100 tickets
                </Text>
              </FormControl>

              <Divider />

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <Box flex="1">
                  <HStack spacing={2} mb={1}>
                    <Icon as={FiMail} color="purple.600" />
                    <FormLabel htmlFor="send-email" mb={0} fontWeight="600">
                      Enviar por Email
                    </FormLabel>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {formData.sendEmail 
                      ? "Los tickets se enviarán automáticamente al email del destinatario"
                      : "Los tickets se generarán pero no se enviarán por email"}
                  </Text>
                </Box>
                <Switch
                  id="send-email"
                  colorScheme="purple"
                  isChecked={formData.sendEmail}
                  onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                  size="lg"
                />
              </FormControl>

              {formData.quantity > 1 && (
                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <Text fontSize="sm" color="blue.800" fontWeight="500">
                    Se generarán {formData.quantity} tickets de cortesía
                    {formData.sendEmail && ` y se enviarán a ${formData.email}`}
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter bg="gray.50" p={6}>
            <HStack spacing={3} w="100%">
              <Button
                variant="outline"
                onClick={onClose}
                flex="1"
                size="lg"
                borderRadius="lg"
                fontFamily="secondary"
                fontWeight="500"
              >
                Cancelar
              </Button>
              <Button
                bgGradient="linear(to-r, purple.500, purple.600)"
                color="white"
                type="submit"
                isLoading={isLoading}
                loadingText="Generando..."
                flex="1"
                size="lg"
                borderRadius="lg"
                fontFamily="secondary"
                fontWeight="600"
                _hover={{
                  bgGradient: "linear(to-r, purple.600, purple.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                leftIcon={<FiGift />}
              >
                Generar {formData.quantity > 1 ? `${formData.quantity} Tickets` : 'Ticket'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CourtesyTicketModal;