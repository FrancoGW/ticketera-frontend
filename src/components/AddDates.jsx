import { Box, Button, Flex, FormLabel, Input, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { Calendar } from "react-calendar";

const initialObjDate = {
  date: "",
  timeEnd: "",
  timeStart: "",
};

export default function AddDates({ dates, setDates }) {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [objDate, setObjDate] = useState(initialObjDate);
  const toast = useToast()

  const handleTimeChange = (e) => {
    setObjDate({
      ...objDate,
      [e.target.name]: e.target.value,
    });
  };

  const addDate = () => {
    const [startHour, startMinutes] = objDate.timeStart.split(":");
    const startDate = new Date(calendarDate);
    startDate.setHours(startHour);
    startDate.setMinutes(startMinutes);

    const [endHour, endMinutes] = objDate.timeEnd.split(":");
    const endDate = new Date(calendarDate);
    endDate.setHours(endHour);
    endDate.setMinutes(endMinutes);

    const newDate = {
      timestampStart: startDate?.getTime(),
      timestampEnd: endDate?.getTime(),
    }

    if (!canAddDate(newDate)) return;

    setDates([...dates, newDate]);
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
    return true
  };

  return (
  <Box>
    <Flex flexDir={{base:'column',xl:'row'}}>
      <Calendar onChange={setCalendarDate} value={calendarDate} />
      <Flex
        style={{
          marginLeft: 15,
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Flex>
          <Box>
            <FormLabel>Hora de inicio</FormLabel>
            <Input
              size="md"
              style={{ maxWidth: 110 }}
              type="time"
              value={objDate.timeStart}
              name="timeStart"
              onChange={handleTimeChange}
              formNoValidate
            />
          </Box>
          <Box style={{ marginLeft: 20 }}>
            <FormLabel>Hora de finalización</FormLabel>
            <Input
              size="md"
              style={{ maxWidth: 110 }}
              type="time"
              value={objDate.timeEnd}
              name="timeEnd"
              onChange={handleTimeChange}
              formNoValidate
            />
          </Box>
        </Flex>
        <Box style={{ marginTop: 30 }}>
          <Button
            onClick={addDate}
            bg="primary"
            style={{
              borderRadius: 5,
              color: "#fff",
              fontWeight: 500,
            }}
            _hover={{ bg: "buttonHover" }}
            _active={{ bg: "buttonHover" }}
            disabled={
              !objDate.timeEnd || 
              !objDate.timeStart ||
              !calendarDate
            }
          >
            Agregar fecha
          </Button>
        </Box>
      </Flex>
    </Flex>
  </Box>
  )
}