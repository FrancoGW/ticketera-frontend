import { 
  Box, 
  Button, 
  Flex, 
  FormLabel, 
  Input, 
  useToast,
  Select,
  HStack,
  VStack,
  Card,
  CardBody,
  Text,
  Icon,
  Divider,
  useStyleConfig
} from "@chakra-ui/react";
import { useState } from "react";
import { Calendar } from "react-calendar";
import { RiTimeLine, RiCalendarLine } from "react-icons/ri";
import "react-calendar/dist/Calendar.css";

const initialObjDate = {
  date: "",
  timeEnd: "",
  timeStart: "",
};

// Generar opciones de horas (00-23)
const generateHours = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return { value: hour, label: `${hour}:00` };
  });
};

// Generar opciones de minutos
const generateMinutes = () => {
  return ['00', '15', '30', '45'].map(min => ({
    value: min,
    label: min
  }));
};

export default function AddDates({ dates, setDates }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [objDate, setObjDate] = useState(initialObjDate);
  const toast = useToast();

  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");

  const hours = generateHours();
  const minutes = generateMinutes();

  const handleTimeChange = (type, value) => {
    if (type === 'startHour') {
      setStartHour(value);
      setObjDate({
        ...objDate,
        timeStart: value && startMinute ? `${value}:${startMinute}` : "",
      });
    } else if (type === 'startMinute') {
      setStartMinute(value);
      setObjDate({
        ...objDate,
        timeStart: startHour && value ? `${startHour}:${value}` : "",
      });
    } else if (type === 'endHour') {
      setEndHour(value);
      setObjDate({
        ...objDate,
        timeEnd: value && endMinute ? `${value}:${endMinute}` : "",
      });
    } else if (type === 'endMinute') {
      setEndMinute(value);
      setObjDate({
        ...objDate,
        timeEnd: endHour && value ? `${endHour}:${value}` : "",
      });
    }
  };

  const addDate = () => {
    if (!startHour || !startMinute || !endHour || !endMinute) {
      toast({
        title: "Debes completar todas las horas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const startDate = new Date(calendarDate);
    startDate.setHours(parseInt(startHour));
    startDate.setMinutes(parseInt(startMinute));
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = new Date(calendarDate);
    endDate.setHours(parseInt(endHour));
    endDate.setMinutes(parseInt(endMinute));
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);

    const newDate = {
      timestampStart: startDate.getTime(),
      timestampEnd: endDate.getTime(),
    };

    if (!canAddDate(newDate)) return;

    setDates([...dates, newDate]);
    
    // Reset form
    setStartHour("");
    setStartMinute("");
    setEndHour("");
    setEndMinute("");
    setObjDate(initialObjDate);
  };

  const canAddDate = (newDate) => {
    if (!newDate.timestampStart || !newDate.timestampEnd) {
      toast({
        title: "Debes seleccionar una fecha y hora",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (newDate.timestampStart >= newDate.timestampEnd) {
      toast({
        title: "La hora de inicio debe ser anterior a la hora de finalización",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (dates.some(
      (date) =>
        date.timestampStart === newDate.timestampStart &&
        date.timestampEnd === newDate.timestampEnd
    )) {
      toast({
        title: "La fecha seleccionada ya existe",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    
    if (new Date(newDate.timestampStart).getTime() <= new Date().getTime()) {
      toast({
        title: "La fecha seleccionada no puede ser en el pasado",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  return (
    <Box>
      <Flex flexDir={{base:'column',xl:'row'}} gap={4} align={{base: 'stretch', xl: 'flex-start'}}>
        {/* Calendario */}
        <Box maxW={{base: '100%', xl: '320px'}}>
          <Box 
            sx={{
              '.react-calendar': {
                width: '100%',
                maxWidth: '320px',
                border: '1px solid',
                borderColor: 'gray.200',
                borderRadius: '8px',
                fontFamily: 'secondary',
                fontSize: '0.75rem',
                padding: '8px',
              },
              '.react-calendar__navigation': {
                display: 'flex',
                height: '32px',
                marginBottom: '0.5em',
              },
              '.react-calendar__navigation button': {
                minWidth: '32px',
                background: 'none',
                fontSize: '12px',
                color: 'gray.700',
                fontWeight: '500',
                padding: '4px',
              },
              '.react-calendar__navigation button:enabled:hover': {
                backgroundColor: 'gray.100',
                borderRadius: '4px',
              },
              '.react-calendar__navigation button:enabled:focus': {
                backgroundColor: 'gray.100',
                borderRadius: '4px',
              },
              '.react-calendar__navigation__label': {
                fontSize: '13px',
                fontWeight: '600',
              },
              '.react-calendar__month-view__weekdays': {
                textAlign: 'center',
                textTransform: 'uppercase',
                fontWeight: '600',
                fontSize: '0.65em',
                color: 'gray.600',
                marginBottom: '0.5em',
              },
              '.react-calendar__month-view__weekdays__weekday': {
                padding: '0.3em',
              },
              '.react-calendar__month-view__days__day--weekend': {
                color: 'red.500',
              },
              '.react-calendar__tile': {
                maxWidth: '100%',
                textAlign: 'center',
                padding: '0.4em 0.2em',
                background: 'none',
                fontSize: '0.8em',
                borderRadius: '4px',
                color: 'gray.700',
                height: '32px',
                lineHeight: '1.2',
              },
              '.react-calendar__tile:enabled:hover': {
                backgroundColor: 'primary',
                color: 'white',
                fontWeight: '600',
              },
              '.react-calendar__tile:enabled:focus': {
                backgroundColor: 'primary',
                color: 'white',
                fontWeight: '600',
              },
              '.react-calendar__tile--active': {
                background: 'primary !important',
                color: 'white !important',
                fontWeight: 'bold',
                fontSize: '0.85em',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              },
              '.react-calendar__tile--now': {
                background: 'gray.100',
                fontWeight: '600',
              },
              '.react-calendar__tile--now:enabled:hover': {
                background: 'primary',
                color: 'white',
              },
            }}
          >
            <Calendar 
              onChange={setCalendarDate} 
              value={calendarDate}
              minDate={new Date()}
              locale="es"
            />
          </Box>
        </Box>

        {/* Selectores de Hora */}
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={4}
        >
          <Flex gap={4} flexDir={{base: 'column', md: 'row'}}>
            {/* Hora de Inicio */}
            <Box>
              <FormLabel fontFamily="secondary" fontWeight="500" mb={2} fontSize="sm">
                Hora de inicio
              </FormLabel>
              <HStack spacing={1}>
                <Select
                  placeholder="Hora"
                  value={startHour}
                  onChange={(e) => handleTimeChange('startHour', e.target.value)}
                  fontFamily="secondary"
                  borderRadius="md"
                  borderColor="gray.300"
                  _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                  _hover={{ borderColor: "gray.400" }}
                  size="md"
                  w="100px"
                >
                  {hours.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.value}
                    </option>
                  ))}
                </Select>
                <Text fontFamily="secondary" color="gray.500" fontSize="lg">:</Text>
                <Select
                  placeholder="Min"
                  value={startMinute}
                  onChange={(e) => handleTimeChange('startMinute', e.target.value)}
                  fontFamily="secondary"
                  borderRadius="md"
                  borderColor="gray.300"
                  _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                  _hover={{ borderColor: "gray.400" }}
                  size="md"
                  w="90px"
                >
                  {minutes.map((min) => (
                    <option key={min.value} value={min.value}>
                      {min.label}
                    </option>
                  ))}
                </Select>
              </HStack>
            </Box>

            {/* Hora de Finalización */}
            <Box>
              <FormLabel fontFamily="secondary" fontWeight="500" mb={2} fontSize="sm">
                Hora de finalización
              </FormLabel>
              <HStack spacing={1}>
                <Select
                  placeholder="Hora"
                  value={endHour}
                  onChange={(e) => handleTimeChange('endHour', e.target.value)}
                  fontFamily="secondary"
                  borderRadius="md"
                  borderColor="gray.300"
                  _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                  _hover={{ borderColor: "gray.400" }}
                  size="md"
                  w="100px"
                >
                  {hours.map((hour) => (
                    <option key={hour.value} value={hour.value}>
                      {hour.value}
                    </option>
                  ))}
                </Select>
                <Text fontFamily="secondary" color="gray.500" fontSize="lg">:</Text>
                <Select
                  placeholder="Min"
                  value={endMinute}
                  onChange={(e) => handleTimeChange('endMinute', e.target.value)}
                  fontFamily="secondary"
                  borderRadius="md"
                  borderColor="gray.300"
                  _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                  _hover={{ borderColor: "gray.400" }}
                  size="md"
                  w="90px"
                >
                  {minutes.map((min) => (
                    <option key={min.value} value={min.value}>
                      {min.label}
                    </option>
                  ))}
                </Select>
              </HStack>
            </Box>
          </Flex>

          {/* Botón Agregar */}
          <Button
            onClick={addDate}
            bg="primary"
            color="white"
            size="md"
            fontFamily="secondary"
            fontWeight="500"
            borderRadius="md"
            _hover={{ bg: "buttonHover" }}
            _active={{ bg: "buttonHover" }}
            disabled={
              !endHour || 
              !endMinute ||
              !startHour || 
              !startMinute ||
              !calendarDate
            }
          >
            Agregar fecha
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}