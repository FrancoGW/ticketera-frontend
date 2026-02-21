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
  SimpleGrid,
  GridItem,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
} from "@chakra-ui/react";
import { FiUser, FiMail, FiPhone, FiCreditCard, FiLock, FiEdit2, FiSettings } from "react-icons/fi";
import { RiQrCodeLine } from "react-icons/ri";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import userApi from "../../Api/user";
import cbuApi from "../../Api/cbu";
import { paymentApi } from "../../Api/payment";
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
    updateSellingPlan,
    updateCbuConfig,
    requireResetEmail,
    verifyResetCode,
    getProfile,
    recoverPassword,
    sellerRequestChangePlan,
    cancelPlanChangeRequest,
  } = userApi;
  const { user: authUser, checkAuth } = useAuth();
  const [isRequiringPasswordUpdate, setIsRequiringPasswordUpdate] =
    useState(false);
  const [newEmailForChange, setNewEmailForChange] = useState("");
  const [user, setUser] = useState(null);
  const [isSendingChangePlan, setIsSendingChangePlan] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(null);
  const reduxUser = useSelector((state) => state.user?.data);
  const profileUser = user || reduxUser;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPlanModalOpen, onOpen: onPlanModalOpen, onClose: onPlanModalClose } = useDisclosure();
  const { isOpen: isConfirmPlanOpen, onOpen: onConfirmPlanOpen, onClose: onConfirmPlanClose } = useDisclosure();
  const [selectedRequestedPlan, setSelectedRequestedPlan] = useState(null);
  const [planToConfirm, setPlanToConfirm] = useState(null);
  const [banks, setBanks] = useState([]);
  const [cbuForm, setCbuForm] = useState({ cbu: "", alias: "", bankId: "", bankName: "" });
  const [isSavingCbu, setIsSavingCbu] = useState(false);
  const [isPayingMembership, setIsPayingMembership] = useState(false);
  const [isCancellingPlanRequest, setIsCancellingPlanRequest] = useState(false);
  const toast = useToast();
  const cancelRef = useRef();

  const isSellerOrAdmin =
    profileUser?.rol === "seller" ||
    profileUser?.rol === "admin" ||
    (profileUser?.roles && (profileUser.roles.includes("seller") || profileUser.roles.includes("admin")));
  /** Solo organizadores eligen forma de venta; el admin no debe ver esta sección */
  const isSellerOnly =
    (profileUser?.rol === "seller" || (profileUser?.roles && profileUser.roles.includes("seller"))) &&
    profileUser?.rol !== "admin" &&
    !profileUser?.roles?.includes("admin");
  const hasMercadoPago =
    profileUser?.mercadoPago?.hasAuthorized === true ||
    profileUser?.oauth?.mercadoPago?.hasAuthorized === true;
  const sellingPlan = profileUser?.sellingPlan;
  const currentPlanName = sellingPlan === "SIMPLE"
    ? "SIMPLE (Depósito Directo)"
    : sellingPlan === "FAST" || hasMercadoPago
      ? "FAST (Mercado Pago)"
      : sellingPlan === "CUSTOM"
        ? "CUSTOM (A tu medida)"
        : null;
  const pendingPlanChange = profileUser?.pendingPlanChange;
  const isPendingMembershipPayment =
    pendingPlanChange &&
    (String(pendingPlanChange.requestedPlanName || "").includes("SIMPLE") ||
     String(pendingPlanChange.requestedPlanName || "").includes("Depósito"));

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

  const handleCancelPlanRequest = async () => {
    try {
      setIsCancellingPlanRequest(true);
      await cancelPlanChangeRequest();
      toast({
        title: "Solicitud cancelada",
        description: "Podés elegir otro plan cuando quieras.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-right",
      });
      await loadUserData();
      await checkAuth();
    } catch (e) {
      toast({
        title: "Error",
        description: e.response?.data?.message || "No se pudo cancelar",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "bottom-right",
      });
    } finally {
      setIsCancellingPlanRequest(false);
    }
  };

  const handleConfirmPlan = async () => {
    if (!planToConfirm) return;
    try {
      setIsSavingPlan(planToConfirm.value);

      if (planToConfirm.value === "SIMPLE" && !profileUser?.isDemo) {
        const { data } = await paymentApi.createMembershipCheckout();
        if (data?.checkoutUrl) {
          onConfirmPlanClose();
          setPlanToConfirm(null);
          window.location.href = data.checkoutUrl;
          return;
        }
        throw new Error("No se recibió la URL de pago");
      }

      await updateSellingPlan(planToConfirm.value);
      toast({ title: "Plan guardado", description: `Elegiste ${planToConfirm.label}.`, status: "success", duration: 3000, isClosable: true, position: "bottom-right" });
      await loadUserData();
      await checkAuth();
      onConfirmPlanClose();
      setPlanToConfirm(null);
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.message || e.message || "No se pudo guardar", status: "error", duration: 4000, isClosable: true, position: "bottom-right" });
    } finally {
      setIsSavingPlan(null);
    }
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

  // Mensaje al volver sin completar el pago de la membresía
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const membership = params.get("membership");
    const status = params.get("status");
    if (membership === "0" || status === "rejected") {
      toast({
        title: "Pago no completado",
        description: "El pago de la membresía no se realizó. Podés intentar de nuevo con el botón «Pagar ahora».",
        status: "warning",
        duration: 6000,
        isClosable: true,
        position: "bottom-right",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    if (isSellerOnly) {
      cbuApi.getBanks().then((r) => setBanks(r?.data?.banks || [])).catch(() => {});
    }
  }, [isSellerOnly]);

  useEffect(() => {
    if (profileUser?.cbuConfig) {
      setCbuForm({
        cbu: profileUser.cbuConfig.cbu || "",
        alias: profileUser.cbuConfig.alias || "",
        bankId: profileUser.cbuConfig.bankId || "",
        bankName: profileUser.cbuConfig.bankName || "",
      });
    }
  }, [profileUser?.cbuConfig]);

  const handleSaveCbu = async () => {
    if (!cbuForm.cbu && !cbuForm.alias) {
      toast({ title: "Ingresá CBU o Alias", status: "warning", duration: 3000, isClosable: true, position: "bottom-right" });
      return;
    }
    const bank = banks.find((b) => b.id === cbuForm.bankId);
    setIsSavingCbu(true);
    try {
      await updateCbuConfig({
        cbu: cbuForm.cbu || undefined,
        alias: cbuForm.alias || undefined,
        bankId: cbuForm.bankId === "otro" ? undefined : cbuForm.bankId,
        bankName: cbuForm.bankId === "otro" ? cbuForm.bankName : bank?.name,
      });
      toast({ title: "CBU configurado", status: "success", duration: 3000, isClosable: true, position: "bottom-right" });
      await loadUserData();
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.message || "No se pudo guardar", status: "error", duration: 4000, isClosable: true, position: "bottom-right" });
    } finally {
      setIsSavingCbu(false);
    }
  };

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

  const handleRequireEmailChange = async (newEmail) => {
    const emailToUse = (typeof newEmail === "string" ? newEmail : newEmailForChange)?.trim();
    if (!emailToUse) {
      toast({
        title: "Email requerido",
        description: "Ingresá el nuevo email al que querés cambiar",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom-right",
      });
      return;
    }
    try {
      const { data } = await requireResetEmail(emailToUse);
      if (data?.ok) {
        setNewEmailForChange("");
        onClose();
        toast({
          title: "Te hemos enviado un correo",
          description: "Revisá la bandeja de " + emailToUse + " para confirmar el cambio de email",
          status: "success",
          duration: 6000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    } catch (error) {
      console.error("Error al solicitar cambio de email:", error);
      const msg = error.response?.data?.message || "No se pudo procesar la solicitud de cambio de email";
      toast({
        title: "Error",
        description: msg,
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

              {profileUser?.isDemo && (
                <Box p={4} bg="purple.50" borderRadius="lg" borderWidth="1px" borderColor="purple.200">
                  <Text fontFamily="secondary" fontSize="sm" color="purple.800" fontWeight="500">
                    Cuenta demo: los datos personales, email y contraseña no se pueden modificar.
                  </Text>
                </Box>
              )}

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
                        isDisabled={profileUser?.isDemo}
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
                        isDisabled={profileUser?.isDemo}
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
                        isDisabled={profileUser?.isDemo}
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
                        isDisabled={profileUser?.isDemo}
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
                        isDisabled={profileUser?.isDemo}
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
                        isDisabled={profileUser?.isDemo}
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

              {/* Forma de venta (solo organizadores; el admin no elige método de pago) */}
              {isSellerOnly && (
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
                    <VStack align="stretch" spacing={5}>
                      {profileUser?.isDemo ? (
                        <>
                          <Box p={3} bg="purple.50" borderRadius="lg" borderWidth="1px" borderColor="purple.200">
                            <Text fontFamily="secondary" fontSize="sm" color="purple.800" fontWeight="500">
                              Cuenta demo: podés cambiar el método de cobro para mostrar a clientes. No requiere aprobación del equipo.
                            </Text>
                          </Box>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            {PLAN_OPTIONS.map((plan) => (
                              <GridItem key={plan.value}>
                                <Box
                                  p={5}
                                  borderRadius="xl"
                                  borderWidth="2px"
                                  borderColor={getCurrentPlanValue() === plan.value ? "green.400" : "gray.200"}
                                  bg={getCurrentPlanValue() === plan.value ? "green.50" : "gray.50"}
                                  _hover={{ borderColor: "green.300", bg: "green.50" }}
                                  transition="all 0.2s"
                                  height="100%"
                                  display="flex"
                                  flexDirection="column"
                                >
                                  <Flex align="center" gap={3} mb={3}>
                                    {plan.logoSrc ? (
                                      <Image src={plan.logoSrc} alt={plan.label} h="32px" objectFit="contain" />
                                    ) : (
                                      <Text fontSize="2xl" lineHeight="1">{plan.emoji}</Text>
                                    )}
                                    <Text fontFamily="secondary" fontWeight="700" color="gray.800" fontSize="lg">
                                      {plan.label}
                                    </Text>
                                  </Flex>
                                  <Text fontFamily="secondary" fontSize="sm" color="gray.500" mb={4} flex="1">
                                    {plan.description}
                                  </Text>
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    borderRadius="lg"
                                    fontFamily="secondary"
                                    fontWeight="500"
                                    w="100%"
                                    variant={getCurrentPlanValue() === plan.value ? "solid" : "outline"}
                                    isDisabled={getCurrentPlanValue() === plan.value}
                                    onClick={() => {
                                      setPlanToConfirm(plan);
                                      onConfirmPlanOpen();
                                    }}
                                  >
                                    {getCurrentPlanValue() === plan.value ? "Plan actual" : "Usar este plan"}
                                  </Button>
                                </Box>
                              </GridItem>
                            ))}
                          </SimpleGrid>
                        </>
                      ) : (currentPlanName || pendingPlanChange) ? (
                        <>
                          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4} p={4} bg="gray.50" borderRadius="lg">
                            <Box>
                              <Text fontFamily="secondary" fontWeight="600" color="gray.800">
                                {pendingPlanChange ? "Estado" : "Plan actual"}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                {pendingPlanChange
                                  ? (isPendingMembershipPayment
                                      ? "Pago de membresía pendiente → "
                                      : "Cambio de plan pendiente → ") +
                                    (pendingPlanChange.requestedPlanName || "Nuevo plan")
                                  : currentPlanName}
                              </Text>
                            </Box>
                            {pendingPlanChange ? (
                              <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                                Pendiente
                              </Badge>
                            ) : (
                              <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                                Activo
                              </Badge>
                            )}
                          </Flex>
                          {pendingPlanChange && isPendingMembershipPayment && (
                            <HStack spacing={3} flexWrap="wrap">
                              <Button
                                colorScheme="green"
                                borderRadius="lg"
                                fontFamily="secondary"
                                fontWeight="500"
                                leftIcon={<FiCreditCard />}
                                onClick={async () => {
                                  try {
                                    setIsPayingMembership(true);
                                    const { data } = await paymentApi.createMembershipCheckout();
                                    if (data?.checkoutUrl) {
                                      window.location.href = data.checkoutUrl;
                                      return;
                                    }
                                    throw new Error("No se recibió la URL de pago");
                                  } catch (e) {
                                    toast({
                                      title: "Error",
                                      description: e.response?.data?.message || e.message || "No se pudo crear el pago",
                                      status: "error",
                                      duration: 4000,
                                      isClosable: true,
                                      position: "bottom-right",
                                    });
                                  } finally {
                                    setIsPayingMembership(false);
                                  }
                                }}
                                isLoading={isPayingMembership}
                              >
                                Pagar ahora
                              </Button>
                              <Button
                                variant="outline"
                                borderColor="gray.400"
                                color="gray.600"
                                borderRadius="lg"
                                fontFamily="secondary"
                                fontWeight="500"
                                isDisabled={isPayingMembership}
                                onClick={handleCancelPlanRequest}
                                isLoading={isCancellingPlanRequest}
                              >
                                Cancelar
                              </Button>
                            </HStack>
                          )}
                          {pendingPlanChange && !isPendingMembershipPayment && (
                            <Button
                              variant="outline"
                              size="sm"
                              borderColor="gray.400"
                              color="gray.600"
                              fontFamily="secondary"
                              onClick={handleCancelPlanRequest}
                              isLoading={isCancellingPlanRequest}
                            >
                              Cancelar solicitud
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
                        </>
                      ) : (
                        <>
                          <Text fontFamily="secondary" color="gray.600" fontSize="sm">
                            Elegí una de las formas de venta para empezar a vender entradas. Podés solicitar el que prefieras y te contactamos para activarlo.
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                            {PLAN_OPTIONS.map((plan) => (
                              <GridItem key={plan.value}>
                                <Box
                                  p={5}
                                  borderRadius="xl"
                                  borderWidth="2px"
                                  borderColor="gray.200"
                                  bg="gray.50"
                                  _hover={{ borderColor: "green.300", bg: "green.50" }}
                                  transition="all 0.2s"
                                  height="100%"
                                  display="flex"
                                  flexDirection="column"
                                >
                                  <Flex align="center" gap={3} mb={3}>
                                    {plan.logoSrc ? (
                                      <Image src={plan.logoSrc} alt={plan.label} h="32px" objectFit="contain" />
                                    ) : (
                                      <Text fontSize="2xl" lineHeight="1">{plan.emoji}</Text>
                                    )}
                                    <Text fontFamily="secondary" fontWeight="700" color="gray.800" fontSize="lg">
                                      {plan.label}
                                    </Text>
                                  </Flex>
                                  <Text fontFamily="secondary" fontSize="sm" color="gray.500" mb={4} flex="1">
                                    {plan.description}
                                  </Text>
                                  <Button
                                    size="sm"
                                    colorScheme="green"
                                    borderRadius="lg"
                                    fontFamily="secondary"
                                    fontWeight="500"
                                    w="100%"
                                    onClick={() => {
                                      setPlanToConfirm(plan);
                                      onConfirmPlanOpen();
                                    }}
                                  >
                                    Elegir este plan
                                  </Button>
                                </Box>
                              </GridItem>
                            ))}
                          </SimpleGrid>
                          <Button
                            as={RouterLink}
                            to="/vender"
                            variant="outline"
                            size="sm"
                            borderColor="primary"
                            color="primary"
                            borderRadius="lg"
                            fontFamily="secondary"
                            alignSelf="flex-start"
                          >
                            Ver más en la sección de venta
                          </Button>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Configurar CBU (Depósito Directo) - solo si plan SIMPLE */}
              {isSellerOnly && sellingPlan === "SIMPLE" && (
                <Card boxShadow="lg" borderRadius="xl" border="1px solid" borderColor="gray.200" bg="white">
                  <CardBody p={6}>
                    <HStack mb={4}>
                      <Text fontSize="2xl">🏦</Text>
                      <Heading as="h3" fontSize="xl" fontFamily="secondary" color="tertiary" fontWeight="600">
                        Configurar CBU (Depósito Directo)
                      </Heading>
                    </HStack>
                    <Text fontFamily="secondary" fontSize="sm" color="gray.500" mb={4}>
                      Para eventos con pago por transferencia (hasta 400 tickets). Ingresá tu CBU o Alias y banco para que los clientes te transfieran.
                    </Text>
                    <VStack align="stretch" spacing={4}>
                      <FormControl>
                        <FormLabel fontFamily="secondary" fontSize="sm">CBU (22 dígitos)</FormLabel>
                        <Input
                          placeholder="Ej: 0000000000000000000000"
                          value={cbuForm.cbu}
                          onChange={(e) => setCbuForm((p) => ({ ...p, cbu: e.target.value }))}
                          maxLength={22}
                          fontFamily="secondary"
                          borderRadius="lg"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontFamily="secondary" fontSize="sm">Alias (alternativa al CBU)</FormLabel>
                        <Input
                          placeholder="Ej: mi.alias.cbu"
                          value={cbuForm.alias}
                          onChange={(e) => setCbuForm((p) => ({ ...p, alias: e.target.value }))}
                          fontFamily="secondary"
                          borderRadius="lg"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontFamily="secondary" fontSize="sm">Banco</FormLabel>
                        <Select
                          placeholder="Seleccionar banco"
                          value={cbuForm.bankId}
                          onChange={(e) => setCbuForm((p) => ({ ...p, bankId: e.target.value }))}
                          fontFamily="secondary"
                          borderRadius="lg"
                        >
                          {banks.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </Select>
                      </FormControl>
                      {cbuForm.bankId === "otro" && (
                        <FormControl>
                          <FormLabel fontFamily="secondary" fontSize="sm">Nombre del banco (otro)</FormLabel>
                          <Input
                            placeholder="Escribí el nombre"
                            value={cbuForm.bankName}
                            onChange={(e) => setCbuForm((p) => ({ ...p, bankName: e.target.value }))}
                            fontFamily="secondary"
                            borderRadius="lg"
                          />
                        </FormControl>
                      )}
                      <Button
                        colorScheme="green"
                        onClick={handleSaveCbu}
                        isLoading={isSavingCbu}
                        fontFamily="secondary"
                        borderRadius="lg"
                      >
                        Guardar CBU
                      </Button>
                      {profileUser?.cbuConfig?.cbu && (
                        <Text fontSize="xs" color="gray.500" fontFamily="secondary">
                          CBU configurado: {profileUser.cbuConfig.cbu}
                        </Text>
                      )}
                      {profileUser?.cbuConfig?.alias && !profileUser?.cbuConfig?.cbu && (
                        <Text fontSize="xs" color="gray.500" fontFamily="secondary">
                          Alias configurado: {profileUser.cbuConfig.alias}
                        </Text>
                      )}
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

      {/* Confirmar elección de plan */}
      <AlertDialog
        isOpen={isConfirmPlanOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          onConfirmPlanClose();
          setPlanToConfirm(null);
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" fontFamily="secondary">
              Confirmar plan
            </AlertDialogHeader>
            <AlertDialogBody fontFamily="secondary">
              <VStack align="stretch" spacing={4}>
                <Text>
                  ¿Estás seguro que {planToConfirm ? planToConfirm.label : "este plan"} es para tu evento?
                </Text>
                {planToConfirm?.value === "SIMPLE" && (
                  <Box
                    p={4}
                    borderRadius="lg"
                    bg="green.50"
                    borderWidth="1px"
                    borderColor="green.200"
                  >
                    <Text fontWeight="600" color="gray.800" mb={2}>
                      Esta opción de venta tiene una mensualidad
                    </Text>
                    <HStack spacing={2} flexWrap="wrap" mb={2}>
                      <Text as="span" fontSize="xl" fontWeight="700" color="green.700">
                        $159.999
                      </Text>
                      <Badge colorScheme="green" fontSize="sm">En oferta</Badge>
                      <Text as="span" fontSize="sm" color="gray.600" textDecoration="line-through">
                        Precio normal $210.000
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      Límite: 4 eventos mensuales con 350 tickets QR por evento.
                    </Text>
                  </Box>
                )}
              </VStack>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  onConfirmPlanClose();
                  setPlanToConfirm(null);
                }}
                fontFamily="secondary"
              >
                Cancelar
              </Button>
              <Button
                colorScheme="green"
                onClick={handleConfirmPlan}
                isLoading={!!isSavingPlan}
                loadingText="Guardando..."
                ml={3}
                fontFamily="secondary"
              >
                Sí, elegir este plan
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => {
          setNewEmailForChange("");
          onClose();
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" fontFamily="secondary">
              Cambiar{" "}
              {!isRequiringPasswordUpdate ? "email" : "contraseña"}
            </AlertDialogHeader>

            <AlertDialogBody fontFamily="secondary">
              {!isRequiringPasswordUpdate ? (
                <>
                  <Text mb={2}>Te enviaremos un correo al nuevo email para confirmar el cambio.</Text>
                  <FormControl isInvalid={!newEmailForChange.trim()}>
                    <FormLabel>Nuevo email</FormLabel>
                    <Input
                      type="email"
                      placeholder="nuevo@email.com"
                      value={newEmailForChange}
                      onChange={(e) => setNewEmailForChange(e.target.value)}
                    />
                  </FormControl>
                </>
              ) : (
                <Text>Te enviaremos un correo electrónico para cambiar tu contraseña.</Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setNewEmailForChange("");
                  onClose();
                }}
                fontFamily="secondary"
              >
                Cancelar
              </Button>
              <Button
                bg="primary"
                color="white"
                _hover={{ bg: "buttonHover" }}
                onClick={() => {
                  if (!isRequiringPasswordUpdate) {
                    handleRequireEmailChange(newEmailForChange);
                  } else {
                    handleRequirePasswordChange();
                    onClose();
                  }
                }}
                ml={3}
                fontFamily="secondary"
                isDisabled={!isRequiringPasswordUpdate && !newEmailForChange.trim()}
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
