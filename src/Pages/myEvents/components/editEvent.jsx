import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Flex,
  Button,
  Text,
  useToast,
  Heading,
  Container,
  Image,
  Select,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Card,
  CardBody,
  Box,
  Highlight,
  Textarea,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { AiOutlineEdit } from "react-icons/ai";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import eventApi from "../../Api/event";
import AsyncSelect from "react-select/async";
import jwt_decode from "jwt-decode";
import { DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import {
  bufferToBase64,
  getBase64FromFile,
  validateSelectedImg,
} from "../../common/utils";
import AddDates from "../../components/AddDates";
import SendInvitationsModal from "./components/SendInvitationsModal";

function EditEvent() {
  const { id: eventId } = useParams();
  const [event, setEvent] = useState({
    title: "",
    description: "",
    adultsOnly: false,
    addressRef: {
      province: "",
      locality: "",
      direction: "",
      place: "",
      postalCode: "",
    },
    pictures: null,
    dates: [],
  });
  const [originalEvent, setOriginalEvent] = useState({});
  const [eventDates, setEventDates] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newPicture, setNewPicture] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSendInvitation, setShowSendInvitation] = useState(false);
  const [user, setUser] = useState(null);
  const cancelRef = useRef();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const getEvent = () => {
      try {
        eventApi.getEventById(eventId).then((res) => {
          setEvent(res.data.event);
          setOriginalEvent(res.data.event);
          setEventDates(res.data.event.dates);
          setSelectedProvince(res.data.event.addressRef.province);
          setSelectedLocality(res.data.event.addressRef.locality);
          setIsLoading(false);
        });
      } catch (error) {
        console.log(error);
        toast({
          title:
            "No se pudo cargar el evento. Intente de nuevo en unos minutos o contacte con el administrador.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }
    };
    getEvent();
  }, []);

  useState(() => {
    const tokenDecoded =
      localStorage.getItem("token") &&
      jwt_decode(localStorage.getItem("token"));
    setUser(tokenDecoded);
  }, []);

  const resetOriginalValues = () => {
    setEvent(originalEvent);
    setEventDates(originalEvent.dates);
    setSelectedProvince(originalEvent.addressRef.province);
    setSelectedLocality(originalEvent.addressRef.locality);
    setNewPicture("");
  };

  const hasErrors = (data) => {
    if (eventDates.length === 0)
      toast({
        title: "Debes agregar al menos una fecha",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    if (!data.locality)
      toast({
        title: "Debes seleccionar una localidad",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    if (!data.locality || eventDates.length === 0) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();



    const updatedEvent = {
      ...event,
      dates: eventDates,
      pictures: newPicture
        ? await getBase64FromFile(newPicture)
        : event.picture,
    };

    delete updatedEvent.addressRef;

    const updatedAddress = {
      ...event.addressRef,
      province: selectedProvince,
      locality: selectedLocality,
    };

    try {
      const { data } = await eventApi.updateEvent(eventId, {
        event: updatedEvent,
        address: updatedAddress,
      });
      if (event) {
        toast({
          title: "Evento actualizado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setEvent(data.updatedEvent);
        setOriginalEvent(data.updatedEvent);
        setEventDates(data.updatedEvent.dates);
        setSelectedProvince(data.updatedEvent.addressRef.province);
        setSelectedLocality(data.updatedEvent.addressRef.locality);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error al actualizar el evento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      resetOriginalValues();
    }
    setIsEditing(false);
  };

  const handleDeleteEvent = async () => {
    try {
      const { data } = await eventApi.deleteEventById(eventId);

      if (data.ok) {
        toast({
          title: "Evento eliminado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(-1);
      }
    } catch (error) {
      toast({
        title: "Error al eliminar el evento",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.log(error);
    }
  };

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const deleteDate = (date) => {
    const newDates = eventDates.filter(
      (d) =>
        d.timestampStart !== date.timestampStart ||
        d.timestampEnd !== date.timestampEnd
    );
    setEventDates(newDates);
  };

  const loadOptions = (inputValue) => {
    return axios
      .get(
        `https://apis.datos.gob.ar/georef/api/localidades?nombre=${inputValue}&provincia=${selectedProvince}&aplanar=true&campos=estandar`
      )
      .then(({ data }) => data.localidades);
  };

  const handleInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    if (e.target.name.includes("addressRef")) {
      name = e.target.name.split(".")[0];
    }

    if (e.target.name === "adultsOnly") {
      value = e.target.value === "true";
    }

    switch (name) {
      case "pictures":
        if (!validateSelectedImg(e.target.files[0])) {
          e.target.value = "";
          break;
        }
        setNewPicture(e.target.files[0]);
        break;
      case "province":
        setSelectedProvince(value);
        break;
      case "addressRef":
        const [, inputName] = e.target.name.split(".");
        setEvent({
          ...event,
          addressRef: {
            ...event.addressRef,
            [inputName]: value,
          },
        });
        break;
      default:
        setEvent({
          ...event,
          [e.target.name]: value,
        });
        break;
    }
  };

  const loadImage = () => {
    if (newPicture) return URL.createObjectURL(newPicture);
    if (!event?.pictures) return "/assets/img/loading.svg";
    
    // If it's already a URL (Cloudinary), return it directly
    if (typeof event.pictures === 'string' && (event.pictures.startsWith('http://') || event.pictures.startsWith('https://'))) {
      return event.pictures;
    }
    
    // Handle Buffer format (old format - backward compatibility)
    if (event.pictures.type === "Buffer" || event.pictures.type === "buffer") {
      const base64Picture = bufferToBase64(event.pictures.data || event.pictures);
      return "data:image/png;base64," + base64Picture;
    }
    
    // Handle base64 string (old format)
    if (typeof event.pictures === 'string') {
      return event.pictures.startsWith('data:image') ? event.pictures : "data:image/png;base64," + event.pictures;
    }
    
    return "/assets/img/loading.svg";
  };

  const closeSendInvitation = () => {
    setShowSendInvitation(false);
  };

  const openSendInvitation = () => {
    setShowSendInvitation(true);
  };

  return (
    <>
      <Header />
      <Container maxW="7xl" minH="70vh" my="10">
        <SendInvitationsModal
          eventId={eventId}
          isOpen={showSendInvitation}
          onClose={closeSendInvitation}
        />
        {isLoading ? (
          <Flex w="100%" align="center" justify="center">
            <Image src="/assets/img/loading.svg" />
          </Flex>
        ) : (
          <>
            <Flex justify="space-between">
              <Heading fontFamily="secondary" color="tertiary" fontSize="2xl">
                Detalles del evento
              </Heading>
              <Flex gap="4">
                {!isEditing && (
                  <>
                    {(user?.roles || (user?.rol ? [user.rol] : [])).includes("admin") && (
                      <Button
                        colorScheme="teal"
                        variant="solid"
                        fontFamily="secondary"
                        fontWeight="400"
                        px="2"
                        fontSize="sm"
                        onClick={openSendInvitation}
                      >
                        <Text display={{ base: "none", md: "block" }} ml="2">
                          Enviar invitaciones
                        </Text>
                      </Button>
                    )}
                    <Button
                      color="white"
                      bg="primary"
                      _hover={{
                        borderTop: "1px solid #000",
                        color: "white",
                        bg: "buttonHover",
                      }}
                      _active=""
                      fontFamily="secondary"
                      fontWeight="400"
                      px="2"
                      fontSize="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={true}
                    >
                      <Icon fontSize="md" mb="0.5" as={AiOutlineEdit} />
                      <Text display={{ base: "none", md: "block" }} ml="2">
                        Editar evento
                      </Text>
                    </Button>
                    <Button
                      colorScheme="red"
                      fontFamily="secondary"
                      fontWeight="400"
                      px="2"
                      onClick={() => setIsAlertOpen(true)}
                      disabled={isLoading}
                    >
                      <Icon fontSize="md" as={DeleteIcon} />
                    </Button>
                  </>
                )}
              </Flex>
            </Flex>
            <Flex
              justifyContent="space-between"
              mt="5"
              flexDir={{ base: "column", md: "row" }}
            >
              <form onSubmit={handleSubmit} className="contentForm">
                <FormControl id="title" isRequired>
                  <FormLabel>Nombre del Evento</FormLabel>
                  <Input
                    name="title"
                    value={event?.title}
                    onChange={handleInputChange}
                    style={{ pointerEvents: isEditing ? "auto" : "none" }}
                  />
                </FormControl>
                <FormControl id="adultsOnly" isRequired>
                  <FormLabel>Evento para mayores de 18 años</FormLabel>
                  <Select
                    placeholder="Elige una opcion"
                    name="adultsOnly"
                    value={event?.adultsOnly}
                    onChange={handleInputChange}
                    style={{ pointerEvents: isEditing ? "auto" : "none" }}
                  >
                    <option value="true">Si</option>
                    <option value="false">No</option>
                  </Select>
                </FormControl>

                <FormControl id="description" isRequired>
                  <FormLabel>Descripción del Evento</FormLabel>
                  <Textarea
                    name="description"
                    value={event?.description}
                    onChange={handleInputChange}
                    style={{ pointerEvents: isEditing ? "auto" : "none" }}
                  />
                </FormControl>
                <FormControl id="start-date">
                  <FormLabel>
                    Fechas del evento{" "}
                    <span style={{ color: "#E53E3E" }}>*</span>
                  </FormLabel>
                  <Flex flexDir="column" gap="2rem">
                    {isEditing && (
                      <AddDates dates={eventDates} setDates={setEventDates} />
                    )}
                    <Box>
                      <Card>
                        <CardBody>
                          {eventDates.length === 0 && (
                            <Text>
                              Selecciona una fecha, hora de inicio y
                              finalización del evento para agregar la fecha.
                              Puedes agregar varias fechas.
                            </Text>
                          )}
                          {eventDates.map(
                            ({ timestampStart, timestampEnd }) => {
                              const startDate = new Date(timestampStart);
                              const endDate = new Date(timestampEnd);

                              return (
                                <Flex
                                  key={`${timestampStart}-${timestampEnd}`}
                                  style={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text>
                                    {formatDate(startDate)} - Inicio:{" "}
                                    {startDate
                                      .getHours()
                                      .toString()
                                      .padStart(2, "0")}
                                    :
                                    {startDate
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, "0")}
                                    . Fin:{" "}
                                    {endDate
                                      .getHours()
                                      .toString()
                                      .padStart(2, "0")}
                                    :
                                    {endDate
                                      .getMinutes()
                                      .toString()
                                      .padStart(2, "0")}
                                  </Text>
                                  {isEditing && (
                                    <DeleteIcon
                                      color="red.400"
                                      onClick={() =>
                                        deleteDate({
                                          timestampStart,
                                          timestampEnd,
                                        })
                                      }
                                    />
                                  )}
                                </Flex>
                              );
                            }
                          )}
                        </CardBody>
                      </Card>
                    </Box>
                  </Flex>
                </FormControl>

                <FormControl id="province" isRequired>
                  <FormLabel>Provincia</FormLabel>
                  <Select
                    name="province"
                    onChange={handleInputChange}
                    value={selectedProvince || event?.addressRef?.province}
                    style={{ pointerEvents: isEditing ? "auto" : "none" }}
                  >
                    <option value="Buenos Aires">Buenos Aires</option>
                    <option value="Ciudad Autónoma de Buenos Aires">
                      Ciudad Autónoma de Buenos Aires
                    </option>
                    <option value="Catamarca">Catamarca</option>
                    <option value="Chaco">Chaco</option>
                    <option value="Chubut">Chubut</option>
                    <option value="Córdoba">Córdoba</option>
                    <option value="Corrientes">Corrientes</option>
                    <option value="Entre Ríos">Entre Ríos</option>
                    <option value="Formosa">Formosa</option>
                    <option value="Jujuy">Jujuy</option>
                    <option value="La Pampa">La Pampa</option>
                    <option value="La Rioja">La Rioja</option>
                    <option value="Mendoza">Mendoza</option>
                    <option value="Misiones">Misiones</option>
                    <option value="Neuquén">Neuquén</option>
                    <option value="Río Negro">Río Negro</option>
                    <option value="Salta">Salta</option>
                    <option value="San Juan">San Juan</option>
                    <option value="San Luis">San Luis</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="Santa Fe">Santa Fe</option>
                    <option value="Santiago del Estero">
                      Santiago del Estero
                    </option>
                    <option value="Tierra del Fuego">Tierra del Fuego</option>
                    <option value="Tucumán">Tucumán</option>
                  </Select>
                </FormControl>
                <FormControl id="locality" isRequired>
                  <FormLabel>Localidad</FormLabel>
                  <AsyncSelect
                    placeholder="Ingresa un nombre para buscar la localidad"
                    loadOptions={loadOptions}
                    isDisabled={!selectedProvince}
                    onChange={(value) =>
                      setSelectedLocality(value.localidad_censal_nombre)
                    }
                    value={{
                      localidad_censal_nombre:
                        selectedLocality || event?.addressRef?.locality,
                    }}
                    styles={{
                      container: (baseStyles, state) => ({
                        ...baseStyles,
                        pointerEvents: isEditing ? "auto" : "none",
                      }),
                    }}
                    getOptionLabel={(e) => e.localidad_censal_nombre}
                    getOptionValue={(e) => e.localidad_censal_nombre}
                  />
                </FormControl>
                <FormControl id="direction" isRequired>
                  <FormLabel>Dirección</FormLabel>
                  <Input
                    name="addressRef.direction"
                    value={event?.addressRef?.direction}
                    style={{ pointerEvents: isEditing ? "auto" : "none" }}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl id="place" isRequired>
                  <FormLabel>Nombre del establecimiento</FormLabel>
                  <Input
                    name="addressRef.place"
                    value={event?.addressRef?.place}
                    style={{ pointerEvents: isEditing ? "auto" : "none" }}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl id="postalCode" isRequired>
                  <FormLabel>Código postal</FormLabel>
                  <Input
                    name="addressRef.postalCode"
                    type="number"
                    value={event?.addressRef?.postalCode}
                    style={{ pointerEvents: isEditing ? "auto" : "none" }}
                    onChange={handleInputChange}
                  />
                </FormControl>
                {isEditing && (
                  <>
                    <Button
                      color="white"
                      bg="#2C7A7B"
                      _hover={{
                        borderTop: "1px solid #000",
                        color: "white",
                        bg: "buttonHover",
                      }}
                      _active=""
                      fontFamily="secondary"
                      fontWeight="400"
                      px="2"
                      type="submit"
                    >
                      Actualizar evento
                    </Button>
                    <Button
                      colorScheme="red"
                      fontFamily="secondary"
                      fontWeight="400"
                      px="2"
                      onClick={() => {
                        resetOriginalValues();
                        setIsEditing(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </form>
              <Flex
                w={{ base: "100%", md: "25%" }}
                flexDir="column"
                bg="#7253c9"
                alignSelf="flex-start"
                my={{ base: 8, md: 0 }}
                borderRadius="10px"
              >
                <Text
                  fontSize="lg"
                  my="4"
                  fontFamily="secondary"
                  textAlign="center"
                  color="#fff"
                >
                  Portada del evento
                </Text>
                <Image
                  src={
                    event?.pictures ? loadImage() : "/assets/img/loading.svg"
                  }
                />
                {isEditing && (
                  <Flex flexDir="column" px="4" bg="white">
                    <FormControl id="pictures" isRequired>
                      <Input
                        type="file"
                        name="pictures"
                        id="picturesInput"
                        accept="image/*"
                        onChange={handleInputChange}
                        mt="2"
                        p="0"
                        border="none"
                      />
                    </FormControl>
                    <Text color="black">
                      La imagen debe medir 800 x 800 píxeles y no pesar mas de
                      1MB.
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </>
        )}

        {/* DELETE ALERT  */}
        <AlertDialog
          isOpen={isAlertOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsAlertOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="500">
                Eliminar evento
              </AlertDialogHeader>

              <AlertDialogBody>
                ¿Estás seguro de que quieres eliminar este evento?
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => handleDeleteEvent(eventId)}
                  ml="4"
                >
                  Aceptar
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
      <Footer />
    </>
  );
}

export default EditEvent;
