import React, { useState } from "react";
import {
  Button,
  Select,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  Box,
  Image,
  useToast,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Container,
  Flex,
  Badge,
  VStack,
  HStack,
  Divider,
  IconButton,
  Alert,
  AlertIcon,
  SimpleGrid,
} from "@chakra-ui/react";
import { DeleteIcon, AddIcon } from "@chakra-ui/icons";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import SellerSidebar from "../../components/sellerSideBar/sellerSideBar";
import img from "/assets/img/banner.png";
import eventApi from "../../Api/event";
import "./Style.css";
import { useNavigate, useLocation } from "react-router-dom";
import AsyncSelect from "react-select/async";
import axios from "axios";
import { getBase64FromFile, validateSelectedImg } from "../../common/utils";
import AddDates from "../../components/AddDates";
import jwt_decode from "jwt-decode";
import debounce from "lodash.debounce";

function NewEvent() {
  const location = useLocation();
  const [eventDates, setEventDates] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  
  // Estados para códigos de descuento
  const [discountCodes, setDiscountCodes] = useState([]);
  const [discountCode, setDiscountCode] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    validFrom: '',
    validUntil: '',
  });

  // Detectar si es admin o seller
  const isAdmin = location.pathname.includes('/admin/new-event');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (hasErrors(data)) return;

    data.pictures = await getBase64FromFile(data.pictures);
    data.dates = eventDates;
    data.discountCodes = discountCodes;

    try {
      setIsLoading(true);
      const { data: event } = await eventApi.createEvent(data);
      if (event) {
        toast({
          title: "Evento creado correctamente",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      // Navegar según el rol del usuario
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwt_decode(token);
          const userRole = decoded.rol || decoded.roles?.[0];
          if (userRole === 'admin') {
            navigate('/admin/events');
          } else {
            navigate('/profile/my-events');
          }
        } catch (error) {
          navigate('/profile/my-events');
        }
      } else {
        navigate('/profile/my-events');
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error al crear el evento",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsLoading(false);
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

  const loadOptions = (inputValue, callback) => {
    axios
      .get(
        `https://apis.datos.gob.ar/georef/api/localidades?nombre=${inputValue}&provincia=${selectedProvince}&aplanar=true&campos=estandar`
      )
      .then(({ data }) => callback(data.localidades))
      .catch((err) => console.log(err));
  };

  const debouncedLoadOptions = debounce(loadOptions, 500);

  const addDiscountCode = () => {
    if (!discountCode.code || !discountCode.discountValue || !discountCode.validFrom || !discountCode.validUntil) {
      toast({
        title: "Error",
        description: "Todos los campos del código de descuento son requeridos",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setDiscountCodes([...discountCodes, discountCode]);
    setDiscountCode({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      validFrom: '',
      validUntil: '',
    });
  };

  const deleteDiscountCode = (codeToDelete) => {
    const newDiscountCodes = discountCodes.filter(
      (code) => code.code !== codeToDelete
    );
    setDiscountCodes(newDiscountCodes);
  };

  // Contenido del formulario mejorado (compartido para admin y seller)
  const formContent = (
    <Container maxW="6xl" px={{ base: 4, md: 8 }} py={8}>
            <Heading 
              as="h1" 
              fontFamily="secondary" 
              color="tertiary" 
              fontSize="3xl"
              fontWeight="bold"
              mb={2}
            >
              Crear Nuevo Evento
            </Heading>
            <Text color="gray.600" mb={8} fontFamily="secondary">
              Completa la información de tu evento. Todos los campos marcados con * son obligatorios.
            </Text>

            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                {/* Información Básica */}
                <Card boxShadow="md" border="1px solid" borderColor="gray.100">
                  <CardHeader borderBottom="1px solid" borderColor="gray.100" bg="white">
                    <Heading size="md" fontFamily="secondary" color="tertiary" fontWeight="600">
                      Información Básica
                    </Heading>
                  </CardHeader>
                  <CardBody bg="white">
                    <VStack spacing={5}>
                      <FormControl id="title" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Nombre del Evento
                        </FormLabel>
                        <Input 
                          name="title" 
                          maxLength="100"
                          placeholder="Ej: Concierto de Rock Nacional"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                        />
                        <Text fontSize="sm" color="gray.500" mt={1}>
                          Máximo 100 caracteres
                        </Text>
                      </FormControl>

                      <FormControl id="adultsOnly" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Evento para mayores de 18 años
                        </FormLabel>
                        <Select 
                          name="adultsOnly"
                          placeholder="Selecciona una opción"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                        >
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </Select>
                      </FormControl>

                      <FormControl id="description" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Descripción del Evento
                        </FormLabel>
                        <Textarea 
                          name="description"
                          placeholder="Describe tu evento, incluye información relevante para los asistentes..."
                          rows={6}
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Fechas del Evento */}
                <Card boxShadow="md" border="1px solid" borderColor="gray.100">
                  <CardHeader borderBottom="1px solid" borderColor="gray.100" bg="white">
                    <Heading size="md" fontFamily="secondary" color="tertiary" fontWeight="600">
                      Fechas y Horarios
                    </Heading>
                  </CardHeader>
                  <CardBody bg="white">
                    <VStack spacing={4} align="stretch">
                      <AddDates dates={eventDates} setDates={setEventDates} />
                      
                      {eventDates.length > 0 && (
                        <Box mt={4}>
                          <Text fontFamily="secondary" fontWeight="600" mb={3} color="gray.700">
                            Fechas agregadas ({eventDates.length})
                          </Text>
                          <VStack spacing={2} align="stretch">
                            {eventDates.map(({ timestampStart, timestampEnd }) => {
                              const startDate = new Date(timestampStart);
                              const endDate = new Date(timestampEnd);

                              return (
                                <Flex
                                  key={`${timestampStart}-${timestampEnd}`}
                                  justify="space-between"
                                  align="center"
                                  p={4}
                                  bg="gray.50"
                                  borderRadius="lg"
                                  border="1px solid"
                                  borderColor="gray.200"
                                  _hover={{ bg: "gray.100" }}
                                  transition="all 0.2s"
                                >
                                  <HStack spacing={4}>
                                    <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full">
                                      {formatDate(startDate)}
                                    </Badge>
                                    <Text fontFamily="secondary" fontSize="sm">
                                      {startDate.getHours().toString().padStart(2, "0")}:
                                      {startDate.getMinutes().toString().padStart(2, "0")} - {" "}
                                      {endDate.getHours().toString().padStart(2, "0")}:
                                      {endDate.getMinutes().toString().padStart(2, "0")}
                                    </Text>
                                  </HStack>
                                  <IconButton
                                    icon={<DeleteIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => deleteDate({ timestampStart, timestampEnd })}
                                    aria-label="Eliminar fecha"
                                  />
                                </Flex>
                              );
                            })}
                          </VStack>
                        </Box>
                      )}

                      {eventDates.length === 0 && (
                        <Alert status="info" borderRadius="lg" mt={4}>
                          <AlertIcon />
                          <Text fontSize="sm" fontFamily="secondary">
                            Selecciona una fecha, hora de inicio y finalización del evento para agregar la fecha. Puedes agregar varias fechas.
                          </Text>
                        </Alert>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Ubicación */}
                <Card boxShadow="md" border="1px solid" borderColor="gray.100">
                  <CardHeader borderBottom="1px solid" borderColor="gray.100" bg="white">
                    <Heading size="md" fontFamily="secondary" color="tertiary" fontWeight="600">
                      Ubicación del Evento
                    </Heading>
                  </CardHeader>
                  <CardBody bg="white">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
                      <FormControl id="province" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Provincia
                        </FormLabel>
                        <Select
                          name="province"
                          placeholder="Selecciona una provincia"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                          onChange={(e) => setSelectedProvince(e.target.value)}
                        >
                          <option value="Buenos Aires">Buenos Aires</option>
                          <option value="Ciudad Autónoma de Buenos Aires">Ciudad Autónoma de Buenos Aires</option>
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
                          <option value="Santiago del Estero">Santiago del Estero</option>
                          <option value="Tierra del Fuego">Tierra del Fuego</option>
                          <option value="Tucumán">Tucumán</option>
                        </Select>
                      </FormControl>

                      <FormControl id="locality" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Localidad
                        </FormLabel>
                        <Box>
                          <AsyncSelect
                            name="locality"
                            placeholder="Busca una localidad"
                            loadOptions={debouncedLoadOptions}
                            getOptionLabel={(e) => e.localidad_censal_nombre}
                            getOptionValue={(e) => e.localidad_censal_nombre}
                            isDisabled={!selectedProvince}
                            styles={{
                              control: (base) => ({
                                ...base,
                                minHeight: '48px',
                                borderRadius: '8px',
                                borderColor: '#E2E8F0',
                              }),
                            }}
                          />
                        </Box>
                      </FormControl>

                      <FormControl id="direction" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Dirección
                        </FormLabel>
                        <Input 
                          name="direction"
                          placeholder="Calle y número"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                        />
                      </FormControl>

                      <FormControl id="place" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Nombre del Establecimiento
                        </FormLabel>
                        <Input 
                          name="place"
                          placeholder="Ej: Estadio Centenario"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                        />
                      </FormControl>

                      <FormControl id="postalCode" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Código Postal
                        </FormLabel>
                        <Input 
                          name="postalCode" 
                          type="number"
                          placeholder="Ej: 3400"
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Imagen */}
                <Card boxShadow="md" border="1px solid" borderColor="gray.100">
                  <CardHeader borderBottom="1px solid" borderColor="gray.100" bg="white">
                    <Heading size="md" fontFamily="secondary" color="tertiary" fontWeight="600">
                      Imagen de Portada
                    </Heading>
                  </CardHeader>
                  <CardBody bg="white">
                    <VStack spacing={3} align="stretch">
                      <FormControl id="pictures" isRequired>
                        <FormLabel fontFamily="secondary" fontWeight="500">
                          Selecciona una imagen
                        </FormLabel>
                        <Input
                          type="file"
                          name="pictures"
                          id="picturesInput"
                          accept="image/*"
                          onChange={(e) => {
                            if (!validateSelectedImg(e.target.files[0])) {
                              e.target.value = "";
                            }
                          }}
                          size="lg"
                          borderRadius="lg"
                          borderColor="gray.200"
                          _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                        />
                      </FormControl>
                      <Alert status="info" borderRadius="lg">
                        <AlertIcon />
                        <Box>
                          <Text fontSize="sm" fontFamily="secondary" fontWeight="500">
                            Requisitos de la imagen:
                          </Text>
                          <Text fontSize="sm" fontFamily="secondary">
                            • Dimensiones recomendadas: 800 x 800 píxeles (se redimensionará automáticamente)
                            <br />
                            • Tamaño máximo: 1MB (se comprimirá automáticamente)
                            <br />
                            • Formatos: JPG, PNG
                          </Text>
                        </Box>
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Códigos de Descuento */}
                <Card boxShadow="md" border="1px solid" borderColor="gray.100">
                  <CardHeader borderBottom="1px solid" borderColor="gray.100" bg="white">
                    <Heading size="md" fontFamily="secondary" color="tertiary" fontWeight="600">
                      Códigos de Descuento (Opcional)
                    </Heading>
                  </CardHeader>
                  <CardBody bg="white">
                    <VStack spacing={4} align="stretch">
                      <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                          <FormControl>
                            <FormLabel fontSize="sm" fontFamily="secondary" fontWeight="500">
                              Código
                            </FormLabel>
                            <Input
                              placeholder="Ej: VERANO2024"
                              value={discountCode.code}
                              onChange={(e) =>
                                setDiscountCode({ ...discountCode, code: e.target.value.toUpperCase() })
                              }
                              size="md"
                              borderRadius="lg"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm" fontFamily="secondary" fontWeight="500">
                              Tipo
                            </FormLabel>
                            <Select
                              value={discountCode.discountType}
                              onChange={(e) =>
                                setDiscountCode({ ...discountCode, discountType: e.target.value })
                              }
                              size="md"
                              borderRadius="lg"
                            >
                              <option value="percentage">Porcentaje (%)</option>
                              <option value="fixed">Monto Fijo ($)</option>
                            </Select>
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm" fontFamily="secondary" fontWeight="500">
                              {discountCode.discountType === 'percentage' ? 'Porcentaje' : 'Monto'}
                            </FormLabel>
                            <Input
                              type="number"
                              placeholder={discountCode.discountType === 'percentage' ? '10' : '1000'}
                              value={discountCode.discountValue}
                              onChange={(e) =>
                                setDiscountCode({ ...discountCode, discountValue: e.target.value })
                              }
                              size="md"
                              borderRadius="lg"
                            />
                          </FormControl>
                        </SimpleGrid>
                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                          <FormControl>
                            <FormLabel fontSize="sm" fontFamily="secondary" fontWeight="500">
                              Válido desde
                            </FormLabel>
                            <Input
                              type="datetime-local"
                              value={discountCode.validFrom}
                              onChange={(e) =>
                                setDiscountCode({ ...discountCode, validFrom: e.target.value })
                              }
                              size="md"
                              borderRadius="lg"
                            />
                          </FormControl>
                          <FormControl>
                            <FormLabel fontSize="sm" fontFamily="secondary" fontWeight="500">
                              Válido hasta
                            </FormLabel>
                            <Input
                              type="datetime-local"
                              value={discountCode.validUntil}
                              onChange={(e) =>
                                setDiscountCode({ ...discountCode, validUntil: e.target.value })
                              }
                              size="md"
                              borderRadius="lg"
                            />
                          </FormControl>
                          <Flex align="flex-end">
                            <Button
                              onClick={addDiscountCode}
                              leftIcon={<AddIcon />}
                              bg="primary"
                              color="white"
                              _hover={{ bg: "buttonHover" }}
                              size="md"
                              borderRadius="lg"
                              fontFamily="secondary"
                              w="full"
                            >
                              Agregar Código
                            </Button>
                          </Flex>
                        </SimpleGrid>
                      </Box>

                      {discountCodes.length > 0 && (
                        <Box>
                          <Text fontFamily="secondary" fontWeight="600" mb={3} color="gray.700">
                            Códigos agregados ({discountCodes.length})
                          </Text>
                          <VStack spacing={2} align="stretch">
                            {discountCodes.map((code, index) => (
                              <Flex
                                key={index}
                                justify="space-between"
                                align="center"
                                p={4}
                                bg="gray.50"
                                borderRadius="lg"
                                border="1px solid"
                                borderColor="gray.200"
                                _hover={{ bg: "gray.100" }}
                                transition="all 0.2s"
                              >
                                <HStack spacing={3}>
                                  <Badge colorScheme="purple" fontSize="sm" px={3} py={1} borderRadius="full">
                                    {code.code}
                                  </Badge>
                                  <Text fontFamily="secondary" fontSize="sm">
                                    {code.discountType === 'percentage'
                                      ? `${code.discountValue}%`
                                      : `$${code.discountValue}`}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500" fontFamily="secondary">
                                    {new Date(code.validFrom).toLocaleDateString()} - {new Date(code.validUntil).toLocaleDateString()}
                                  </Text>
                                </HStack>
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="sm"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => deleteDiscountCode(code.code)}
                                  aria-label="Eliminar código"
                                />
                              </Flex>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Botón de Submit */}
                <Flex justify="flex-end" gap={4} pt={4}>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/profile/my-events')}
                    fontFamily="secondary"
                    fontWeight="500"
                    borderRadius="lg"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    bg="primary"
                    color="white"
                    size="lg"
                    _hover={{ bg: "buttonHover", transform: "translateY(-2px)", boxShadow: "lg" }}
                    _active={{ bg: "buttonHover" }}
                    fontFamily="secondary"
                    fontWeight="500"
                    borderRadius="lg"
                    isLoading={isLoading}
                    loadingText="Creando evento..."
                    px={8}
                    transition="all 0.2s"
                  >
                    Crear Evento
                  </Button>
                </Flex>
              </VStack>
            </form>
    </Container>
  );

  // Si es admin, renderizar sin sidebar del seller
  if (isAdmin) {
    return (
      <>
        <Header />
        <Box minH="calc(100vh - 80px)" pb={20} bg="gray.50">
          {formContent}
        </Box>
        <Footer />
      </>
    );
  }

  // Si es seller, renderizar con sidebar
  return (
    <Flex minH="100vh" bg="gray.50">
      <SellerSidebar />
      <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
        <Header />
        <Box minH="calc(100vh - 80px)" pb={20} bg="gray.50">
          {formContent}
        </Box>
        <Footer />
      </Box>
    </Flex>
  );
}

export default NewEvent;
