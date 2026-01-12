import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Checkbox,
  Button,
  Card,
  CardBody,
  Heading,
  Icon,
  Link,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { paymentApi } from "../../../Api/payment";

const SetupChecklist = ({ user, userEvents = [], hasMercadoPago = false }) => {
  const navigate = useNavigate();
  const toast = useToast();

  // Calcular estados de forma optimizada, sin esperar a que carguen todos los eventos
  // Usar memoización para evitar recálculos innecesarios
  const hasEvents = React.useMemo(() => {
    return Array.isArray(userEvents) && userEvents.length > 0;
  }, [userEvents]);

  const hasTickets = React.useMemo(() => {
    if (!hasEvents) return false;
    return userEvents.some(
      (event) => event?.tickets && Array.isArray(event.tickets) && event.tickets.length > 0
    );
  }, [userEvents, hasEvents]);

  const checklistItems = [
    {
      id: "create-event",
      label: "Crea tu primer evento",
      completed: hasEvents,
      action: () => navigate("/seller/new-event"),
      actionLabel: "Crear evento",
    },
    {
      id: "create-ticket",
      label: "Crea tu primer ticket",
      completed: hasTickets,
      action: () => navigate("/seller/tickets"),
      actionLabel: "Gestionar tickets",
      disabled: !hasEvents,
    },
    {
      id: "configure-mercadopago",
      label: "Configura tu cuenta de Mercado Pago",
      completed: hasMercadoPago,
      action: async () => {
        try {
          // Intentar iniciar el flujo OAuth de Mercado Pago
          const response = await paymentApi.initiateMercadoPagoAuthorization();
          
          if (response.data?.authorizationUrl) {
            // Redirigir al usuario a la URL de autorización de Mercado Pago
            window.location.href = response.data.authorizationUrl;
          } else {
            throw new Error("No se recibió la URL de autorización");
          }
        } catch (error) {
          console.error("Error iniciando autorización de Mercado Pago:", error);
          
          // Si el endpoint no existe aún, mostrar mensaje y redirigir a página de desarrolladores
          toast({
            title: "Configuración de Mercado Pago",
            description: "Por favor, contacta al soporte para configurar tu cuenta de Mercado Pago o visita el panel de desarrolladores.",
            status: "info",
            duration: 5000,
            isClosable: true,
          });
          
          // Fallback: redirigir a la página de desarrolladores de Mercado Pago
          window.open("https://www.mercadopago.com.ar/developers/panel/app/", "_blank");
        }
      },
      actionLabel: "Configurar Mercado Pago",
    },
  ];

  const allCompleted = checklistItems.every((item) => item.completed);
  const completedCount = checklistItems.filter((item) => item.completed).length;

  if (allCompleted) {
    return null; // No mostrar el checklist si todo está completo
  }

  return (
    <Card
      boxShadow="lg"
      borderRadius="xl"
      bg="white"
      border="2px solid"
      borderColor="primary"
      mb={6}
    >
      <CardBody p={6}>
        <VStack align="stretch" spacing={4}>
          <Box>
            <Heading
              as="h3"
              fontSize="lg"
              fontFamily="secondary"
              color="tertiary"
              mb={2}
              fontWeight="600"
            >
              Pasos para comenzar
            </Heading>
            <Text fontSize="sm" color="gray.600" fontFamily="secondary">
              Completa estos pasos para que tus eventos sean visibles públicamente
            </Text>
          </Box>

          <VStack align="stretch" spacing={3}>
            {checklistItems.map((item) => (
              <HStack
                key={item.id}
                p={3}
                borderRadius="md"
                bg={item.completed ? "green.50" : "gray.50"}
                border="1px solid"
                borderColor={item.completed ? "green.200" : "gray.200"}
                justify="space-between"
                align="center"
              >
                <HStack spacing={3} flex="1">
                  {item.completed ? (
                    <Icon
                      as={FiCheckCircle}
                      color="green.500"
                      boxSize={5}
                      flexShrink={0}
                    />
                  ) : (
                    <Icon
                      as={FiCircle}
                      color="gray.400"
                      boxSize={5}
                      flexShrink={0}
                    />
                  )}
                  <Text
                    fontFamily="secondary"
                    fontWeight={item.completed ? "500" : "400"}
                    color={item.completed ? "green.700" : "gray.700"}
                    textDecoration={item.completed ? "line-through" : "none"}
                    flex="1"
                  >
                    {item.label}
                  </Text>
                </HStack>

                {!item.completed && (
                  <Button
                    size="sm"
                    bg="primary"
                    color="white"
                    _hover={{ bg: "buttonHover" }}
                    onClick={item.action}
                    isDisabled={item.disabled}
                    fontFamily="secondary"
                    fontSize="xs"
                    px={4}
                  >
                    {item.actionLabel}
                  </Button>
                )}
              </HStack>
            ))}
          </VStack>

          <Box
            pt={3}
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" color="gray.600" fontFamily="secondary">
                Progreso: {completedCount} de {checklistItems.length} completados
              </Text>
              <Badge
                colorScheme={allCompleted ? "green" : "orange"}
                fontSize="sm"
                px={3}
                py={1}
                borderRadius="full"
              >
                {Math.round((completedCount / checklistItems.length) * 100)}%
              </Badge>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default SetupChecklist;
