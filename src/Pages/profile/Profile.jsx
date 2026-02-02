import { useAuth } from "../../auth/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import {
  Editable,
  EditableInput,
  EditablePreview,
  Input,
  useEditableControls,
  Flex,
  IconButton,
  ButtonGroup,
  Button,
  Text,
  useToast,
  Heading,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Box,
  Container,
  Card,
  CardBody,
  VStack,
  HStack,
  Divider,
  Icon,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  RadioGroup,
  Radio,
  Stack,
  Image,
} from "@chakra-ui/react";
import { FiUser, FiMail, FiPhone, FiCreditCard, FiLock, FiEdit2, FiSettings } from "react-icons/fi";
import { RiQrCodeLine } from "react-icons/ri";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import userApi from "../../Api/user";
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import jwt_decode from "jwt-decode";
import "./Style.css";

const userFields = {
  firstname: "Nombre",
  lastname: "Apellido",
  phoneNumber: "Celular",
  dni: "DNI",
};

const PLAN_OPTIONS = [
  { value: "SIMPLE", label: "Depósito Directo", description: "Directo a tu CBU. Suscripción GetPass para pequeños eventos.", emoji: "🏦" },
  { value: "FAST", label: "Mercado Pago", description: "Pagos al instante. Sin cargo, solo comisión estándar MP.", logoSrc: "/assets/img/mercadopago.png" },
  { value: "CUSTOM", label: "A tu medida", description: "GP-COINS. Comprá paquetes de entradas, varios métodos de pago.", emoji: "🎟️" },
];

function Profile() {
  const {
    update,
    requireResetEmail,
    verifyResetCode,
    getProfile,
    recoverPassword,
    sellerRequestChangePlan,
  } = userApi;
  const { user: authUser } = useAuth();
  const [isRequiringPasswordUpdate, setIsRequiringPasswordUpdate] =
    useState(false);
  const [user, setUser] = useState(null);
  const [isSendingChangePlan, setIsSendingChangePlan] = useState(false);
  const reduxUser = useSelector((state) => state.user?.data);
  const profileUser = user || reduxUser;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPlanModalOpen, onOpen: onPlanModalOpen, onClose: onPlanModalClose } = useDisclosure();
  const [selectedRequestedPlan, setSelectedRequestedPlan] = useState(null);
  const toast = useToast();
  const cancelRef = useRef();

  const isSellerOrAdmin =
    profileUser?.rol === "seller" ||
    profileUser?.rol === "admin" ||
    (profileUser?.roles && (profileUser.roles.includes("seller") || profileUser.roles.includes("admin")));
  const hasMercadoPago =
    profileUser?.mercadoPago?.hasAuthorized === true ||
    profileUser?.oauth?.mercadoPago?.hasAuthorized === true;
  const currentPlanName = hasMercadoPago ? "FAST (Mercado Pago)" : null;
  const pendingPlanChange = profileUser?.pendingPlanChange;

  const getCurrentPlanValue = () => {
    if (!currentPlanName) return null;
    if (currentPlanName.includes("Mercado Pago") || currentPlanName.includes("FAST")) return "FAST";
    if (currentPlanName.includes("Depósito") || currentPlanName.includes("SIMPLE")) return "SIMPLE";
    if (currentPlanName.includes("medida") || currentPlanName.includes("CUSTOM")) return "CUSTOM";
    return null;
  };

  const handleCambiarPlan = async () => {
    if (!selectedRequestedPlan) {
      toast({
        title: "Elegí un plan",
        description: "Seleccioná el plan al que querés cambiar.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }
    const requestedLabel = PLAN_OPTIONS.find((p) => p.value === selectedRequestedPlan)?.label || selectedRequestedPlan;
    setIsSendingChangePlan(true);
    try {
      await sellerRequestChangePlan(
        currentPlanName || "Sin plan configurado",
        `${selectedRequestedPlan} (${requestedLabel})`
      );
      toast({
        title: "Solicitud enviada",
        description: "Te contactaremos pronto para gestionar el cambio de plan.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      onPlanModalClose();
      setSelectedRequestedPlan(null);
      await loadUserData();
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud. Intentá de nuevo.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsSendingChangePlan(false);
    }
  };

  const openPlanModal = () => {
    setSelectedRequestedPlan(getCurrentPlanValue());
    onPlanModalOpen();
  };

  // Función para cargar los datos del usuario
  const loadUserData = async () => {
    try {
      console.log("Cargando datos del usuario desde el servidor");
      const response = await getProfile();
      console.log("Respuesta del servidor:", response.data);

      // La respuesta ya viene con todos los datos del usuario
      setUser(response.data);
    } catch (error) {
      console.error("Error cargando datos del usuario:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del usuario",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadUserData();
  }, []);

  const updateUser = async (value, field) => {
    try {
      console.log(`Actualizando ${field} con valor:`, value);

      const updatedData = {
        firstname:
          field === userFields.firstname ? value : user?.firstname || "",
        lastname: field === userFields.lastname ? value : user?.lastname || "",
        phoneNumber:
          field === userFields.phoneNumber ? value : user?.phoneNumber || "",
        dni: field === userFields.dni ? value : user?.dni || "",
      };

      const response = await update(
        updatedData.firstname,
        updatedData.lastname,
        updatedData.phoneNumber,
        updatedData.dni
      );

      if (response.data) {
        // Recargar los datos del usuario después de la actualización
        await loadUserData();

        toast({
          title: `${field} actualizado con éxito`,
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error en actualización:", error);
      toast({
        title: "Error al actualizar",
        description: "Hubo un error al actualizar tu perfil",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  const handleRequireEmailChange = async () => {
    try {
      const data = await requireResetEmail();
      if (data.data.ok) {
        toast({
          title: "Te hemos enviado un correo",
          description: "Revisa tu bandeja de correo para cambiar tu email",
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error al solicitar cambio de email:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud de cambio de email",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  const handleRequirePasswordChange = async () => {
    try {
      // const data = await requireUpdatePassword();
      const data = await recoverPassword(user.email);
      if (data.status === 201) {
        toast({
          title: "Te hemos enviado un correo",
          description: "Revisa tu bandeja de correo para cambiar tu contraseña",
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error al solicitar cambio de contraseña:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar la solicitud de cambio de contraseña",
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "bottom-right",
      });
    }
  };

  function EditableControls() {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls();

    return isEditing ? (
      <ButtonGroup size="sm" spacing={2}>
        <IconButton 
          icon={<CheckIcon />} 
          {...getSubmitButtonProps()} 
          colorScheme="green"
          aria-label="Guardar"
        />
        <IconButton 
          icon={<CloseIcon />} 
          {...getCancelButtonProps()} 
          colorScheme="red"
          aria-label="Cancelar"
        />
      </ButtonGroup>
    ) : (
      <IconButton 
        size="sm" 
        icon={<EditIcon />} 
        {...getEditButtonProps()} 
        variant="ghost"
        colorScheme="primary"
        aria-label="Editar"
      />
    );
  }

  return (
    <>
      <Container maxW="6xl" px={{ base: 4, md: 8 }} py={8}>
        <VStack align="stretch" spacing={6}>
              {/* Header Section */}
              <Box>
                <Heading 
                  fontFamily="secondary" 
                  color="tertiary" 
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="bold"
                  mb={2}
                >
                  Hola {user?.firstname || ""}! 👋
                </Heading>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }} fontFamily="secondary">
                  Gestiona tu información personal y configuración de cuenta
                </Text>
              </Box>

              {/* Información Personal Card */}
              <Card boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="gray.200" bg="white">
                <CardBody p={6}>
                  <HStack mb={6}>
                    <Icon as={FiUser} color="primary" boxSize={6} />
                    <Heading 
                      as="h3" 
                      fontSize="xl" 
                      fontFamily="secondary" 
                      color="tertiary"
                      fontWeight="600"
                    >
                      Información Personal
                    </Heading>
                  </HStack>
                  
                  <VStack align="stretch" spacing={5}>
                    {/* Nombre */}
                    <Box>
                      <Editable
                        defaultValue={user?.firstname || ""}
                        key={`firstname-${user?.firstname}`}
                        fontFamily="secondary"
                        isPreviewFocusable={false}
                        onSubmit={(value) => updateUser(value, userFields.firstname)}
                      >
                        <Flex justify="space-between" align="center" p={3} bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} transition="all 0.2s">
                          <HStack spacing={3} flex="1">
                            <Icon as={FiUser} color="gray.500" boxSize={5} />
                            <VStack align="start" spacing={0}>
                              <Text fontFamily="secondary" fontSize="xs" color="gray.500" fontWeight="500">
                                Nombre
                              </Text>
                              <EditablePreview 
                                fontFamily="secondary" 
                                fontSize="md" 
                                fontWeight="500"
                                color="gray.800"
                              />
                            </VStack>
                          </HStack>
                          <EditableControls />
                        </Flex>
                        <Input type="text" as={EditableInput} fontFamily="secondary" />
                      </Editable>
                    </Box>

                    {/* Apellido */}
                    <Box>
                      <Editable
                        defaultValue={user?.lastname || ""}
                        key={`lastname-${user?.lastname}`}
                        fontFamily="secondary"
                        isPreviewFocusable={false}
                        onSubmit={(value) => updateUser(value, userFields.lastname)}
                      >
                        <Flex justify="space-between" align="center" p={3} bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} transition="all 0.2s">
                          <HStack spacing={3} flex="1">
                            <Icon as={FiUser} color="gray.500" boxSize={5} />
                            <VStack align="start" spacing={0}>
                              <Text fontFamily="secondary" fontSize="xs" color="gray.500" fontWeight="500">
                                Apellido
                              </Text>
                              <EditablePreview 
                                fontFamily="secondary" 
                                fontSize="md" 
                                fontWeight="500"
                                color="gray.800"
                              />
                            </VStack>
                          </HStack>
                          <EditableControls />
                        </Flex>
                        <Input type="text" as={EditableInput} fontFamily="secondary" />
                      </Editable>
                    </Box>

                    {/* Celular */}
                    <Box>
                      <Editable
                        defaultValue={user?.phoneNumber || ""}
                        key={`phoneNumber-${user?.phoneNumber}`}
                        fontFamily="secondary"
                        isPreviewFocusable={false}
                        onSubmit={(value) => updateUser(value, userFields.phoneNumber)}
                      >
                        <Flex justify="space-between" align="center" p={3} bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} transition="all 0.2s">
                          <HStack spacing={3} flex="1">
                            <Icon as={FiPhone} color="gray.500" boxSize={5} />
                            <VStack align="start" spacing={0}>
                              <Text fontFamily="secondary" fontSize="xs" color="gray.500" fontWeight="500">
                                Celular
                              </Text>
                              <EditablePreview 
                                fontFamily="secondary" 
                                fontSize="md" 
                                fontWeight="500"
                                color="gray.800"
                              />
                            </VStack>
                          </HStack>
                          <EditableControls />
                        </Flex>
                        <Input type="tel" as={EditableInput} fontFamily="secondary" />
                      </Editable>
                    </Box>

                    {/* DNI */}
                    <Box>
                      <Editable
                        defaultValue={user?.dni || ""}
                        key={`dni-${user?.dni}`}
                        fontFamily="secondary"
                        isPreviewFocusable={false}
                        onSubmit={(value) => updateUser(value, userFields.dni)}
                      >
                        <Flex justify="space-between" align="center" p={3} bg="gray.50" borderRadius="lg" _hover={{ bg: "gray.100" }} transition="all 0.2s">
                          <HStack spacing={3} flex="1">
                            <Icon as={FiCreditCard} color="gray.500" boxSize={5} />
                            <VStack align="start" spacing={0}>
                              <Text fontFamily="secondary" fontSize="xs" color="gray.500" fontWeight="500">
                                DNI
                              </Text>
                              <EditablePreview 
                                fontFamily="secondary" 
                                fontSize="md" 
                                fontWeight="500"
                                color="gray.800"
                              />
                            </VStack>
                          </HStack>
                          <EditableControls />
                        </Flex>
                        <Input type="number" as={EditableInput} fontFamily="secondary" />
                      </Editable>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Email y Seguridad Card */}
              <Card boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="gray.200" bg="white">
                <CardBody p={6}>
                  <HStack mb={6}>
                    <Icon as={FiLock} color="primary" boxSize={6} />
                    <Heading 
                      as="h3" 
                      fontSize="xl" 
                      fontFamily="secondary" 
                      color="tertiary"
                      fontWeight="600"
                    >
                      Seguridad y Acceso
                    </Heading>
                  </HStack>
                  
                  <VStack align="stretch" spacing={5}>
                    {/* Email */}
                    <Flex justify="space-between" align="center" p={4} bg="gray.50" borderRadius="lg">
                      <HStack spacing={3} flex="1">
                        <Icon as={FiMail} color="gray.500" boxSize={5} />
                        <VStack align="start" spacing={0}>
                          <Text fontFamily="secondary" fontSize="xs" color="gray.500" fontWeight="500">
                            Email
                          </Text>
                          <Text
                            fontSize="md"
                            fontFamily="secondary"
                            fontWeight="500"
                            color="gray.800"
                          >
                            {user?.email}
                          </Text>
                        </VStack>
                      </HStack>
                      <Badge colorScheme="blue" fontSize="xs" px={3} py={1} borderRadius="full">
                        Verificado
                      </Badge>
                    </Flex>

                    <Divider />

                    {/* Botones de Acción */}
                    <Flex gap={4} flexDir={{ base: "column", md: "row" }}>
                      <Button
                        flex="1"
                        leftIcon={<FiMail />}
                        bg="primary"
                        color="white"
                        borderRadius="lg"
                        fontFamily="secondary"
                        fontWeight="500"
                        _hover={{ bg: "buttonHover", transform: "translateY(-2px)", boxShadow: "lg" }}
                        _active={{ bg: "buttonHover" }}
                        onClick={() => {
                          setIsRequiringPasswordUpdate(false);
                          onOpen();
                        }}
                        transition="all 0.2s"
                      >
                        Cambiar Email
                      </Button>
                      <Button
                        flex="1"
                        leftIcon={<FiLock />}
                        bg="gray.600"
                        color="white"
                        borderRadius="lg"
                        fontFamily="secondary"
                        fontWeight="500"
                        _hover={{ bg: "gray.700", transform: "translateY(-2px)", boxShadow: "lg" }}
                        _active={{ bg: "gray.700" }}
                        onClick={() => {
                          setIsRequiringPasswordUpdate(true);
                          onOpen();
                        }}
                        transition="all 0.2s"
                      >
                        Cambiar Contraseña
                      </Button>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>

              {/* Forma de venta (solo organizador/admin) */}
              {isSellerOrAdmin && (
                <Card boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="gray.200" bg="white">
                  <CardBody p={6}>
                    <HStack mb={6}>
                      <Icon as={FiSettings} color="primary" boxSize={6} />
                      <Heading
                        as="h3"
                        fontSize="xl"
                        fontFamily="secondary"
                        color="tertiary"
                        fontWeight="600"
                      >
                        Forma de venta
                      </Heading>
                    </HStack>
                    <VStack align="stretch" spacing={4}>
                      <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} p={4} bg="gray.50" borderRadius="lg">
                        <Box>
                          <Text fontFamily="secondary" fontWeight="600" color="gray.800">
                            {pendingPlanChange ? "Estado" : "Plan actual"}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {pendingPlanChange
                              ? `Cambio de plan pendiente → ${pendingPlanChange.requestedPlanName || "Nuevo plan"}`
                              : currentPlanName || "Aún no elegiste un plan. Configuralo en la sección de venta."}
                          </Text>
                        </Box>
                        {pendingPlanChange ? (
                          <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                            Pendiente
                          </Badge>
                        ) : currentPlanName ? (
                          <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                            Activo
                          </Badge>
                        ) : null}
                      </Flex>
                      <Flex gap={3} flexDir={{ base: "column", sm: "row" }}>
                        {!currentPlanName && (
                          <Button
                            as={RouterLink}
                            to="/vender"
                            colorScheme="primary"
                            borderRadius="lg"
                            fontFamily="secondary"
                            fontWeight="500"
                          >
                            Elegir plan
                          </Button>
                        )}
                        {!pendingPlanChange && (
                          <Button
                            variant="outline"
                            borderColor="primary"
                            color="primary"
                            borderRadius="lg"
                            fontFamily="secondary"
                            fontWeight="500"
                            leftIcon={<FiSettings />}
                            onClick={openPlanModal}
                          >
                            Cambiar plan
                          </Button>
                        )}
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>
              )}
        </VStack>
      </Container>

      {/* Modal elegir plan para cambio */}
      <Modal isOpen={isPlanModalOpen} onClose={onPlanModalClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent fontFamily="secondary" borderRadius="xl" maxH="90vh" display="flex" flexDirection="column">
          <ModalHeader color="tertiary" fontWeight="600" flexShrink={0}>
            Elegí el plan al que querés cambiar
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={2} overflowY="auto" flex="1 1 auto">
            <Text fontSize="sm" color="gray.500" mb={4}>
              Seleccioná un plan y enviaremos la solicitud al equipo. Te contactaremos para completar el cambio.
            </Text>
            <RadioGroup value={selectedRequestedPlan || ""} onChange={setSelectedRequestedPlan}>
              <Stack spacing={3}>
                {PLAN_OPTIONS.map((plan) => {
                  const isCurrentPlan = plan.value === getCurrentPlanValue();
                  return (
                    <Box
                      key={plan.value}
                      as="label"
                      cursor="pointer"
                      borderWidth="2px"
                      borderRadius="lg"
                      borderColor={selectedRequestedPlan === plan.value ? "green.400" : "gray.200"}
                      bg={selectedRequestedPlan === plan.value ? "green.50" : "gray.50"}
                      p={4}
                      transition="all 0.2s"
                      _hover={{ borderColor: "green.300", bg: "green.50" }}
                    >
                      <Flex align="center" gap={4}>
                        <Radio value={plan.value} colorScheme="green" size="lg" />
                        {plan.logoSrc ? (
                          <Image src={plan.logoSrc} alt={plan.label} h="28px" objectFit="contain" />
                        ) : (
                          <Text fontSize="2xl" lineHeight="1">{plan.emoji}</Text>
                        )}
                        <Box flex="1">
                          <Flex align="center" gap={2} flexWrap="wrap">
                            <Text fontWeight="600" color="gray.800">{plan.label}</Text>
                            {isCurrentPlan && (
                              <HStack spacing={1} color="green.500">
                                <Icon as={CheckIcon} boxSize={4} />
                                <Text fontSize="sm" fontWeight="500" color="green.600">Plan actual</Text>
                              </HStack>
                            )}
                          </Flex>
                          <Text fontSize="sm" color="gray.500">{plan.description}</Text>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </Stack>
            </RadioGroup>
          </ModalBody>
          <ModalFooter flexShrink={0} borderTopWidth="1px" borderColor="gray.200" bg="gray.50" borderRadius="0 0 1rem 1rem">
            <Button variant="ghost" mr={3} onClick={onPlanModalClose} fontFamily="secondary">
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={handleCambiarPlan}
              isLoading={isSendingChangePlan}
              loadingText="Enviando..."
              fontFamily="secondary"
            >
              Solicitar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" fontFamily="secondary">
              Cambiar{" "}
              {!isRequiringPasswordUpdate ? "email" : "contraseña"}
            </AlertDialogHeader>

            <AlertDialogBody fontFamily="secondary">
              Te enviaremos un correo electrónico para cambiar tu{" "}
              {!isRequiringPasswordUpdate ? "email" : "contraseña"}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} fontFamily="secondary">
                Cancelar
              </Button>
              <Button
                bg="primary"
                color="white"
                _hover={{ bg: "buttonHover" }}
                onClick={() => {
                  !isRequiringPasswordUpdate
                    ? handleRequireEmailChange()
                    : handleRequirePasswordChange();
                  onClose();
                }}
                ml={3}
                fontFamily="secondary"
              >
                Aceptar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default Profile;
