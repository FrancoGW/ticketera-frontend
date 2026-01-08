import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { useState, useRef, useEffect } from "react";
import { Container } from "@chakra-ui/react";
import {
  Editable,
  EditableInput,
  EditablePreview,
  Input,
  useEditableControls,
  Flex,
  IconButton,
  ButtonGroup,
  Link,
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
} from "@chakra-ui/react";
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
  const [isRequiringPasswordUpdate, setIsRequiringPasswordUpdate] =
    useState(false);
  const [user, setUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = useRef();

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
      <ButtonGroup justifyContent="center" size="sm">
        <IconButton icon={<CheckIcon />} {...getSubmitButtonProps()} />
        <IconButton icon={<CloseIcon />} {...getCancelButtonProps()} />
      </ButtonGroup>
    ) : (
      <Flex justifyContent="center">
        <IconButton size="sm" icon={<EditIcon />} {...getEditButtonProps()} />
      </Flex>
    );
  }

  return (
    <>
      <Header />
      <Container maxW="7xl" display="flex" flexDir="column" gap="6" minH="70vh">
        <Flex flexDir="column" gap="6" my="10">
          <Heading fontFamily="secondary" color="tertiary">
            Hola {user?.firstname || ""}! 👋
          </Heading>
          <Text color="" size="xl">
            Desde esta pestaña podras editar tus datos personales.
          </Text>

          <Editable
            defaultValue={user?.firstname || ""}
            key={`firstname-${user?.firstname}`}
            fontFamily="secondary"
            fontWeight={300}
            fontSize="xl"
            isPreviewFocusable={false}
            display="flex"
            gap="2"
            alignItems="center"
            w="30%"
            onSubmit={(value) => updateUser(value, userFields.firstname)}
          >
            <Text fontFamily="secondary" fontWeight="bold">
              Nombre:
            </Text>
            <EditablePreview />
            <Input type="text" as={EditableInput} />
            <EditableControls />
          </Editable>

          <Editable
            defaultValue={user?.lastname || ""}
            key={`lastname-${user?.lastname}`}
            fontFamily="secondary"
            fontWeight={300}
            fontSize="xl"
            isPreviewFocusable={false}
            display="flex"
            gap="2"
            alignItems="center"
            w="30%"
            onSubmit={(value) => updateUser(value, userFields.lastname)}
          >
            <Text fontFamily="secondary" fontWeight="bold">
              Apellido:
            </Text>
            <EditablePreview />
            <Input type="text" as={EditableInput} />
            <EditableControls />
          </Editable>

          <Editable
            defaultValue={user?.phoneNumber || ""}
            key={`phoneNumber-${user?.phoneNumber}`}
            fontFamily="secondary"
            fontWeight={300}
            fontSize="xl"
            isPreviewFocusable={false}
            display="flex"
            gap="2"
            alignItems="center"
            w="30%"
            onSubmit={(value) => updateUser(value, userFields.phoneNumber)}
          >
            <Text fontFamily="secondary" fontWeight="bold">
              Celular:
            </Text>
            <EditablePreview />
            <Input type="number" as={EditableInput} />
            <EditableControls />
          </Editable>

          <Editable
            defaultValue={user?.dni || ""}
            key={`dni-${user?.dni}`}
            fontFamily="secondary"
            fontWeight={300}
            fontSize="xl"
            isPreviewFocusable={false}
            display="flex"
            gap="2"
            alignItems="center"
            w="30%"
            onSubmit={(value) => updateUser(value, userFields.dni)}
          >
            <Text fontFamily="secondary" fontWeight="bold">
              DNI:
            </Text>
            <EditablePreview />
            <Input type="number" as={EditableInput} />
            <EditableControls />
          </Editable>

          <Flex gap="2" align="center">
            <Text fontFamily="secondary" fontWeight="bold" fontSize="xl">
              Email:{" "}
            </Text>
            <Text
              fontSize="xl"
              overflow="hidden"
              fontFamily="secondary"
              fontWeight={300}
            >
              {user?.email}
            </Text>
          </Flex>

          <Flex gap="4">
            <Button
              bg="primary"
              borderRadius="5px"
              color="#fff"
              _hover={{ bg: "buttonHover" }}
              _active={{ bg: "buttonHover" }}
              fontWeight="semibold"
              onClick={() => {
                setIsRequiringPasswordUpdate(false);
                onOpen();
              }}
            >
              CAMBIAR EMAIL
            </Button>
            <Button
              bg="primary"
              borderRadius="5px"
              color="#fff"
              _hover={{ bg: "buttonHover" }}
              _active={{ bg: "buttonHover" }}
              fontWeight="semibold"
              onClick={() => {
                setIsRequiringPasswordUpdate(true);
                onOpen();
              }}
            >
              CAMBIAR CONTRASEÑA
            </Button>

            <AlertDialog
              isOpen={isOpen}
              leastDestructiveRef={cancelRef}
              onClose={onClose}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Cambiar{" "}
                    {!isRequiringPasswordUpdate ? "email" : "contraseña"}
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Te enviaremos un correo electrónico para cambiar tu{" "}
                    {!isRequiringPasswordUpdate ? "email" : "contraseña"}
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      colorScheme="green"
                      onClick={() => {
                        !isRequiringPasswordUpdate
                          ? handleRequireEmailChange()
                          : handleRequirePasswordChange();
                        onClose();
                      }}
                      ml={3}
                    >
                      Aceptar
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
          </Flex>
        </Flex>
      </Container>
      <Footer />
    </>
  );
}

export default Profile;
