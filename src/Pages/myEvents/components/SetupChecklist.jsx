import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Heading,
  Icon,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { paymentApi } from "../../../Api/payment";

const SetupChecklist = ({ user, userEvents = [], hasMercadoPago = false, hasCbuConfigured = false, sellingPlan = null, isAdmin = false }) => {
  const navigate = useNavigate();
  const toast = useToast();

  // Calcular estados de forma optimizada, sin esperar a que carguen todos los eventos
  const hasEvents = React.useMemo(() => {
    return Array.isArray(userEvents) && userEvents.length > 0;
  }, [userEvents]);

  const hasTickets = React.useMemo(() => {
    if (!hasEvents) return false;
    return userEvents.some(
      (event) => event?.tickets && Array.isArray(event.tickets) && event.tickets.length > 0
    );
  }, [userEvents, hasEvents]);

  // Pasos base: siempre para todos
  const baseChecklistItems = [
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
  ];

  // Paso elegir método: SOLO si aún no seleccionó plan
  const selectMethodItem = !sellingPlan && !isAdmin && {
    id: "select-method",
    label: "Selecciona cómo cobrar tus entradas",
    completed: false,
    action: () => navigate("/profile"),
    actionLabel: "Elegir método",
  };

  // Paso Mercado Pago: SOLO si el plan elegido es FAST (Mercado Pago)
  const mercadopagoItem = sellingPlan === "FAST" && !isAdmin && {
    id: "configure-mercadopago",
    label: "Configura tu cuenta de Mercado Pago",
    completed: hasMercadoPago,
    action: async () => {
      try {
        const response = await paymentApi.initiateMercadoPagoAuthorization();
        if (response.data?.authorizationUrl) {
          window.location.href = response.data.authorizationUrl;
        } else {
          throw new Error("No se recibió la URL de autorización");
        }
      } catch (error) {
        console.error("Error iniciando autorización de Mercado Pago:", error);
        toast({
          title: "Configuración de Mercado Pago",
          description: "Por favor, contacta al soporte para configurar tu cuenta de Mercado Pago o visita el panel de desarrolladores.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        window.open("https://www.mercadopago.com.ar/developers/panel/app/", "_blank");
      }
    },
    actionLabel: "Configurar Mercado Pago",
  };

  // Paso CBU: SOLO si el plan elegido es SIMPLE (Depósito Directo)
  const cbuItem = sellingPlan === "SIMPLE" && !isAdmin && {
    id: "configure-cbu",
    label: "Debes configurar tu CBU o Alias para recibir transferencias",
    completed: hasCbuConfigured,
    action: () => navigate("/profile"),
    actionLabel: "Configurar CBU",
  };

  // Armar lista final: base + (elegir método si no hay plan) + Mercado Pago (si FAST) + CBU (si SIMPLE)
  const checklistItems = React.useMemo(() => {
    const items = [...baseChecklistItems];
    if (selectMethodItem) items.push(selectMethodItem);
    if (mercadopagoItem) items.push(mercadopagoItem);
    if (cbuItem) items.push(cbuItem);
    return items;
  }, [baseChecklistItems, selectMethodItem, mercadopagoItem, cbuItem]);

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
