import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Icon,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Image,
} from "@chakra-ui/react";
import { EditIcon, ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";
import { RiCalendar2Line, RiUserLine, RiPercentLine } from "react-icons/ri";
import eventApi from "../../Api/event";
import { getObjDate, bufferToBase64, getBase64FromFile, validateSelectedImg } from "../../common/utils";
import AddDates from "../../components/AddDates";
import AsyncSelect from "react-select/async";
import axios from "axios";

const AdminEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [originalEvent, setOriginalEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [eventDates, setEventDates] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [newPicture, setNewPicture] = useState("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await eventApi.getEventById(id);
        setEvent(data.event);
        setOriginalEvent(data.event);
        setEventDates(data.event.dates || []);
        setSelectedProvince(data.event.addressRef?.province || "");
        setSelectedLocality(data.event.addressRef?.locality || "");
      } catch (error) {
        console.error("Error fetching event details:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del evento",
          status: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id, toast]);

  const resetOriginalValues = () => {
    setEvent(originalEvent);
    setEventDates(originalEvent?.dates || []);
    setSelectedProvince(originalEvent?.addressRef?.province || "");
    setSelectedLocality(originalEvent?.addressRef?.locality || "");
    setNewPicture("");
  };

  const hasErrors = (data) => {
    if (eventDates.length === 0) {
      toast({
        title: "Debes agregar al menos una fecha",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    if (!data.locality) {
      toast({
        title: "Debes seleccionar una localidad",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    if (!data.locality || eventDates.length === 0) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasErrors({ locality: selectedLocality })) return;

    const updatedEvent = {
      ...event,
      dates: eventDates,
      pictures: newPicture
        ? await getBase64FromFile(newPicture)
        : event.pictures,
    };

    delete updatedEvent.addressRef;

    const updatedAddress = {
      ...event.addressRef,
      province: selectedProvince,
      locality: selectedLocality,
    };

    try {
      const { data } = await eventApi.updateEvent(id, {
        event: updatedEvent,
        address: updatedAddress,
      });
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
      setIsEditing(false);
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
    
    if (typeof event.pictures === 'string' && (event.pictures.startsWith('http://') || event.pictures.startsWith('https://'))) {
      return event.pictures;
    }
    
    if (event.pictures.type === "Buffer" || event.pictures.type === "buffer") {
      const base64Picture = bufferToBase64(event.pictures.data || event.pictures);
      return "data:image/png;base64," + base64Picture;
    }
    
    if (typeof event.pictures === 'string') {
      return event.pictures.startsWith('data:image') ? event.pictures : "data:image/png;base64," + event.pictures;
    }
    
    return "/assets/img/loading.svg";
  };

  if (isLoading) {
    return (
      <Center minH="calc(100vh - 80px)" bg="white">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="primary"
          size="xl"
        />
      </Center>
    );
  }

  if (!event) {
    return (
      <Center minH="calc(100vh - 80px)" bg="white">
        <Text fontSize="lg" color="gray.500" fontFamily="secondary">
          Evento no encontrado
        </Text>
      </Center>
    );
  }

  const commissionPercentage = event.commissionPercentage ?? 10;

  return (
    <>
      <Container 
        maxW="full" 
        px={{ base: 4, md: 8 }} 
        py={8}
      >
            <Flex 
              justify="space-between" 
              align={{ base: "flex-start", sm: "center" }} 
              mb={8}
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <HStack spacing={4}>
                <Button
                  onClick={() => navigate(-1)}
                  variant="ghost"
                  size="sm"
                  minW="auto"
                  p={2}
                  borderRadius="full"
                  _hover={{ bg: "gray.100" }}
                  aria-label="Volver"
                >
                  <ArrowBackIcon boxSize={5} />
                </Button>
                <Heading 
                  as="h1" 
                  fontFamily="secondary" 
                  color="tertiary" 
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight="bold"
                >
                  Detalles del Evento
                </Heading>
              </HStack>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  bg="primary"
                  color="white"
                  _hover={{
                    bg: "buttonHover",
                    transform: "translateY(-2px)",
                    boxShadow: "lg"
                  }}
                  transition="all 0.2s"
                  fontFamily="secondary"
                  fontWeight="500"
                  px={6}
                  py={6}
                  borderRadius="lg"
                  leftIcon={<EditIcon />}
                  w={{ base: "100%", sm: "auto" }}
                >
                  Editar evento
                </Button>
              ) : (
                <HStack spacing={3} w={{ base: "100%", sm: "auto" }}>
                  <Button
                    onClick={() => {
                      resetOriginalValues();
                      setIsEditing(false);
                    }}
                    variant="outline"
                    fontFamily="secondary"
                    fontWeight="500"
                    px={6}
                    py={6}
                    borderRadius="lg"
                    w={{ base: "100%", sm: "auto" }}
                  >
                    Cancelar
                  </Button>
                </HStack>
              )}
            </Flex>

            <VStack align="stretch" spacing={6}>
              {/* Información Principal */}
              <Card boxShadow="lg" borderRadius="xl" bg="white">
                <CardBody p={6}>
                  <VStack align="stretch" spacing={4}>
                    {/* Nombre del Evento */}
                    <Box>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        fontFamily="secondary"
                        fontWeight="600"
                        mb={2}
                        textTransform="uppercase"
                        letterSpacing="wide"
                      >
                        Nombre del Evento
                      </Text>
                      <Heading
                        as="h2"
                        fontSize="2xl"
                        fontFamily="secondary"
                        color="tertiary"
                        fontWeight="700"
                      >
                        {event.title}
                      </Heading>
                    </Box>

                    <Box h="1px" bg="gray.200" />

                    {/* Fechas del Evento */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={RiCalendar2Line} color="primary" boxSize={5} />
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontFamily="secondary"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Fechas del Evento
                        </Text>
                      </HStack>
                      {event.dates && event.dates.length > 0 ? (
                        <VStack align="stretch" spacing={2}>
                          {event.dates.map((date, index) => {
                            const objDate = getObjDate(date);
                            return (
                              <Box
                                key={index}
                                p={3}
                                bg="gray.50"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Text fontFamily="secondary" fontWeight="500">
                                  {objDate.date}
                                </Text>
                                <Text fontSize="sm" color="gray.600" fontFamily="secondary">
                                  {objDate.timeStart} - {objDate.timeEnd}
                                </Text>
                              </Box>
                            );
                          })}
                        </VStack>
                      ) : (
                        <Text color="gray.500" fontFamily="secondary">
                          No hay fechas configuradas
                        </Text>
                      )}
                    </Box>

                    <Box h="1px" bg="gray.200" />

                    {/* Organizador */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={RiUserLine} color="primary" boxSize={5} />
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontFamily="secondary"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Organizador
                        </Text>
                      </HStack>
                      <Text fontFamily="secondary" fontSize="lg" fontWeight="500">
                        {event.userEmail || "No especificado"}
                      </Text>
                    </Box>

                    <Box h="1px" bg="gray.200" />

                    {/* Comisión */}
                    <Box>
                      <HStack mb={3}>
                        <Icon as={RiPercentLine} color="primary" boxSize={5} />
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          fontFamily="secondary"
                          fontWeight="600"
                          textTransform="uppercase"
                          letterSpacing="wide"
                        >
                          Comisión Configurada
                        </Text>
                      </HStack>
                      <HStack>
                        <Text fontFamily="secondary" fontSize="2xl" fontWeight="700" color="primary">
                          {commissionPercentage}%
                        </Text>
                        <Badge
                          colorScheme={commissionPercentage === 10 ? "blue" : "orange"}
                          fontSize="sm"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {commissionPercentage === 10 ? "Por defecto" : "Personalizada"}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" fontFamily="secondary" mt={2}>
                        Comisión por entrada vendida
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>

              {/* Tickets del Evento */}
              <Card boxShadow="lg" borderRadius="xl" bg="white">
                <CardBody p={6}>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontFamily="secondary"
                    color="tertiary"
                    mb={6}
                    fontWeight="600"
                  >
                    Tickets del Evento
                  </Heading>
                  
                  {event.tickets && event.tickets.length > 0 ? (
                    <TableContainer overflowX="auto">
                      <Table variant="simple" size={{ base: "sm", md: "md" }}>
                        <Thead>
                          <Tr>
                            <Th fontFamily="secondary">Tipo de Ticket</Th>
                            <Th fontFamily="secondary">Precio</Th>
                            <Th fontFamily="secondary">Vendidos</Th>
                            <Th fontFamily="secondary">Disponibles</Th>
                            <Th fontFamily="secondary">Total</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {event.tickets.map((ticket) => {
                            const sold = ticket.selled || 0;
                            const total = ticket.maxEntries || 0;
                            const available = total - sold;
                            
                            return (
                              <Tr key={ticket._id}>
                                <Td fontFamily="secondary" fontWeight="500">
                                  {ticket.title}
                                  {ticket.ticketType && ticket.ticketType !== "GENERAL" && (
                                    <Badge ml={2} colorScheme="blue" fontSize="xs">
                                      {ticket.ticketType}
                                    </Badge>
                                  )}
                                </Td>
                                <Td fontFamily="secondary">${ticket.price?.toLocaleString() || 0}</Td>
                                <Td fontFamily="secondary" color="green.600" fontWeight="600">
                                  {sold}
                                </Td>
                                <Td fontFamily="secondary" color={available > 0 ? "gray.600" : "red.600"}>
                                  {available}
                                </Td>
                                <Td fontFamily="secondary" fontWeight="500">
                                  {total}
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      p={8}
                      bg="gray.50"
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text color="gray.500" fontFamily="secondary">
                        No hay tickets creados para este evento
                      </Text>
                    </Box>
                  )}
                </CardBody>
              </Card>

              {/* Formulario de Edición */}
              {isEditing && (
                <Card boxShadow="lg" borderRadius="xl" bg="white">
                  <CardBody p={6}>
                    <Heading
                      as="h3"
                      fontSize="xl"
                      fontFamily="secondary"
                      color="tertiary"
                      mb={6}
                      fontWeight="600"
                    >
                      Editar Evento
                    </Heading>
                    <Flex
                      justifyContent="space-between"
                      flexDir={{ base: "column", lg: "row" }}
                      gap={6}
                    >
                      <Box flex="1" order={{ base: 2, lg: 1 }}>
                        <form onSubmit={handleSubmit}>
                          <VStack align="stretch" spacing={4}>
                            <FormControl id="title" isRequired>
                              <FormLabel fontFamily="secondary">Nombre del Evento</FormLabel>
                              <Input
                                name="title"
                                value={event?.title || ""}
                                onChange={handleInputChange}
                                fontFamily="secondary"
                              />
                            </FormControl>

                            <FormControl id="adultsOnly" isRequired>
                              <FormLabel fontFamily="secondary">Evento para mayores de 18 años</FormLabel>
                              <Select
                                placeholder="Elige una opción"
                                name="adultsOnly"
                                value={event?.adultsOnly?.toString() || "false"}
                                onChange={handleInputChange}
                                fontFamily="secondary"
                              >
                                <option value="true">Si</option>
                                <option value="false">No</option>
                              </Select>
                            </FormControl>

                            <FormControl id="description" isRequired>
                              <FormLabel fontFamily="secondary">Descripción del Evento</FormLabel>
                              <Textarea
                                name="description"
                                value={event?.description || ""}
                                onChange={handleInputChange}
                                fontFamily="secondary"
                                rows={4}
                              />
                            </FormControl>

                            <FormControl id="start-date">
                              <FormLabel fontFamily="secondary">
                                Fechas del evento{" "}
                                <Text as="span" color="red.500">*</Text>
                              </FormLabel>
                              <VStack align="stretch" spacing={4}>
                                <AddDates dates={eventDates} setDates={setEventDates} />
                                {eventDates.length > 0 && (
                                  <Box>
                                    <Card>
                                      <CardBody>
                                        {eventDates.map(
                                          ({ timestampStart, timestampEnd }) => {
                                            const startDate = new Date(timestampStart);
                                            const endDate = new Date(timestampEnd);

                                            return (
                                              <Flex
                                                key={`${timestampStart}-${timestampEnd}`}
                                                justify="space-between"
                                                align="center"
                                                mb={2}
                                              >
                                                <Text fontFamily="secondary">
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
                                                <DeleteIcon
                                                  color="red.400"
                                                  cursor="pointer"
                                                  onClick={() =>
                                                    deleteDate({
                                                      timestampStart,
                                                      timestampEnd,
                                                    })
                                                  }
                                                />
                                              </Flex>
                                            );
                                          }
                                        )}
                                      </CardBody>
                                    </Card>
                                  </Box>
                                )}
                              </VStack>
                            </FormControl>

                            <FormControl id="province" isRequired>
                              <FormLabel fontFamily="secondary">Provincia</FormLabel>
                              <Select
                                name="province"
                                onChange={handleInputChange}
                                value={selectedProvince || event?.addressRef?.province || ""}
                                fontFamily="secondary"
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
                              <FormLabel fontFamily="secondary">Localidad</FormLabel>
                              <AsyncSelect
                                placeholder="Ingresa un nombre para buscar la localidad"
                                loadOptions={loadOptions}
                                isDisabled={!selectedProvince}
                                onChange={(value) =>
                                  setSelectedLocality(value.localidad_censal_nombre)
                                }
                                value={{
                                  localidad_censal_nombre:
                                    selectedLocality || event?.addressRef?.locality || "",
                                }}
                                getOptionLabel={(e) => e.localidad_censal_nombre}
                                getOptionValue={(e) => e.localidad_censal_nombre}
                              />
                            </FormControl>

                            <FormControl id="direction" isRequired>
                              <FormLabel fontFamily="secondary">Dirección</FormLabel>
                              <Input
                                name="addressRef.direction"
                                value={event?.addressRef?.direction || ""}
                                onChange={handleInputChange}
                                fontFamily="secondary"
                              />
                            </FormControl>

                            <FormControl id="place" isRequired>
                              <FormLabel fontFamily="secondary">Nombre del establecimiento</FormLabel>
                              <Input
                                name="addressRef.place"
                                value={event?.addressRef?.place || ""}
                                onChange={handleInputChange}
                                fontFamily="secondary"
                              />
                            </FormControl>

                            <FormControl id="postalCode" isRequired>
                              <FormLabel fontFamily="secondary">Código postal</FormLabel>
                              <Input
                                name="addressRef.postalCode"
                                type="number"
                                value={event?.addressRef?.postalCode || ""}
                                onChange={handleInputChange}
                                fontFamily="secondary"
                              />
                            </FormControl>

                            <HStack spacing={4} pt={4}>
                              <Button
                                color="white"
                                bg="primary"
                                _hover={{ bg: "buttonHover" }}
                                fontFamily="secondary"
                                fontWeight="500"
                                px={6}
                                py={6}
                                borderRadius="lg"
                                type="submit"
                              >
                                Actualizar evento
                              </Button>
                              <Button
                                variant="outline"
                                fontFamily="secondary"
                                fontWeight="500"
                                px={6}
                                py={6}
                                borderRadius="lg"
                                onClick={() => {
                                  resetOriginalValues();
                                  setIsEditing(false);
                                }}
                              >
                                Cancelar
                              </Button>
                            </HStack>
                          </VStack>
                        </form>
                      </Box>

                      <Box w={{ base: "100%", lg: "300px" }} flexShrink={0} order={{ base: 1, lg: 2 }}>
                        <Card bg="gray.50" borderRadius="lg">
                          <CardBody p={4}>
                            <Text
                              fontSize="lg"
                              fontFamily="secondary"
                              textAlign="center"
                              mb={4}
                              fontWeight="600"
                            >
                              Portada del evento
                            </Text>
                            <Image
                              src={loadImage()}
                              alt="Event cover"
                              borderRadius="md"
                              mb={4}
                              maxH="400px"
                              objectFit="contain"
                            />
                            <FormControl>
                              <Input
                                type="file"
                                name="pictures"
                                accept="image/*"
                                onChange={handleInputChange}
                                fontFamily="secondary"
                              />
                              <Text fontSize="sm" color="gray.500" mt={2} fontFamily="secondary">
                                La imagen debe medir 800 x 800 píxeles y no pesar más de 1MB.
                              </Text>
                            </FormControl>
                          </CardBody>
                        </Card>
                      </Box>
                    </Flex>
                  </CardBody>
                </Card>
              )}
            </VStack>
      </Container>
    </>
  );
};

export default AdminEventDetails;
