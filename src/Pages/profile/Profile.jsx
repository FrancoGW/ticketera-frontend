import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ClientSidebar from "../../components/clientSideBar/clientSideBar";
import SellerSidebar from "../../components/sellerSideBar/sellerSideBar";
import Sidebar from "../../components/sideBar/sideBar";
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
} from "@chakra-ui/react";
import { FiUser, FiMail, FiPhone, FiCreditCard, FiLock, FiEdit2 } from "react-icons/fi";
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

function Profile() {
  const {
    update,
    requireResetEmail,
    // requireUpdatePassword,
    verifyResetCode,
    getProfile,
    recoverPassword,
  } = userApi;
  const { user: authUser } = useAuth();
  const [isRequiringPasswordUpdate, setIsRequiringPasswordUpdate] =
    useState(false);
  const [user, setUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef();

  // Determinar qué sidebar mostrar según el rol
  const getUserRoles = () => {
    if (!authUser) return [];
    return authUser.roles || (authUser.rol ? [authUser.rol] : []);
  };

  const userRoles = getUserRoles();
  const isSeller = userRoles.includes("seller");
  const isAdmin = userRoles.includes("admin");
  const isBuyer = userRoles.includes("buyer") || (!isSeller && !isAdmin);

  // Determinar qué sidebar renderizar
  const renderSidebar = () => {
    if (isAdmin) return <Sidebar />;
    if (isSeller) return <SellerSidebar />;
    return <ClientSidebar />;
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
    <Flex minH="100vh" bg="gray.50">
      {renderSidebar()}
      <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
        <Header />
        
        <Box
          as="main"
          minH="calc(100vh - 80px)"
          pb={20}
          bg="white"
          pt={8}
        >
          <Container maxW="6xl" px={{ base: 4, md: 8 }} py={8}>
            <VStack align="stretch" spacing={6}>
              {/* Header Section */}
              <Box>
                <Heading 
                  fontFamily="secondary" 
                  color="tertiary" 
                  fontSize="3xl"
                  fontWeight="bold"
                  mb={2}
                >
                  Hola {user?.firstname || ""}! 👋
                </Heading>
                <Text color="gray.600" fontSize="md" fontFamily="secondary">
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
            </VStack>
          </Container>
        </Box>
        
        <Footer />
      </Box>

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
    </Flex>
  );
}

export default Profile;
