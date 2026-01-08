import { useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionIcon,
  AccordionPanel,
  Box,
  Button,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Input,
  useToast,
  Tooltip,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import eventApi from "../../../Api/event";

const TicketsDetails = ({ eventDetails, setEventDetails }) => {
  const [expandedAccordions, setExpandedAccordions] = useState([]);
  const toast = useToast();


  if (!eventDetails)
    return (
      <Box
        bg="gray.50"
        borderRadius="lg"
        p={8}
        textAlign="center"
        border="2px dashed"
        borderColor="gray.200"
      >
        <Text 
          fontFamily="secondary" 
          color="gray.500"
          fontSize="md"
        >
          Presiona en "Detalles de entradas" de alguno de tus eventos para ver los
          detalles de las entradas.
        </Text>
      </Box>
    );

  return (
    <>
      <Text 
        fontSize="xl" 
        fontFamily="secondary" 
        mb={6}
        fontWeight="600"
        color="tertiary"
      >
        {eventDetails.title}
      </Text>
      <TableContainer>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th fontFamily="secondary" fontWeight="600">Nombre</Th>
              <Th isNumeric fontFamily="secondary" fontWeight="600">Total vendidas</Th>
            </Tr>
          </Thead>
          <Tbody>
            {eventDetails?.tickets?.map((ticket) => (
              <Tr key={ticket._id} _hover={{ bg: "gray.50" }}>
                <Td fontFamily="secondary">{ticket.title}</Td>
                <Td isNumeric fontFamily="secondary" fontWeight="500">{ticket.selled}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};


export default TicketsDetails;
