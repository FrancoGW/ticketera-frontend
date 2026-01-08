import { DeleteIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Icon, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ticketApi from "../../../Api/ticket";

function SelectList({ eventTickets, index, ticketsList, deleteTicket, setCanSendTickets }) {
  const [quantity, setQuantity] = useState(1)
  const [ticketDates, setTicketDates] = useState([])

  useEffect(() => {
    loadTicketsDates()
  }, [])

  const handleInputChange = (value) => {
    if (value < 1 || !value) {
      setCanSendTickets(false)
    } else {
      setCanSendTickets(true)
    }
    setQuantity(value)
  }

  const loadTicketsDates = () => {
    // get selected option
    const select = document.querySelector(".ticketsToSend")
    const selectedOption = select.options[select.selectedIndex].value
    
    // get ticket dates
    const ticketDates = eventTickets.find((ticket) => ticket._id === selectedOption).dates
    setTicketDates(ticketDates)
  }

  return (
    <Flex style={{ flexDirection: "column", margin: "10px 0" }}>
      <Flex>
        <Box style={{ flexGrow: 1 }}>
          <Text>Ticket</Text>
          <Select onChange={loadTicketsDates} className="ticketsToSend">
            {eventTickets.map((ticket) => {
                return (
                  <option value={ticket._id} key={ticket._id}>{ticket.title}</option>
                )
            })}
          </Select>
        </Box>
        <Box style={{ maxWidth: 80, marginLeft: 20 }}>
          <Text>Cantidad</Text>
          <Input type="number" className="quantityToSend" value={quantity} onChange={(e) => handleInputChange(e.target.value)} />
        </Box>
        {
          ticketsList.length > 1 && (
            <Button
              colorScheme="red"
              fontFamily="secondary"
              fontWeight="400"
              px="2"
              alignSelf="flex-end"
              style={{
                marginLeft: 20,
              }}
              onClick={() => deleteTicket(index)}
            >
              <Icon fontSize="md" as={DeleteIcon} />
            </Button>
          )
        }
      </Flex>
      <Box style={{ marginTop: 5 }}>
        <Text>Fecha</Text>
        <Select className="ticketDate">
          {ticketDates.map((date) => (
              <option value={JSON.stringify(date)} key={JSON.stringify(date)}>{date.date}. Inicio: {date.timeStart}. Fin: {date.timeEnd}</option>
          ))}
        </Select>
      </Box>
      {quantity < 1 && <Text style={{ color: "red" }}>La cantidad debe ser mayor a 0</Text>}
    </Flex>
  )
}

export default function SendInvitationsModal({ eventId, isOpen, onClose }) {
  const [ticketsList, setTicketsList] = useState([0])
  const [emails, setEmails] = useState([])
  const [eventTickets, setEventTickets] = useState([])
  const [email, setEmail] = useState("")
  const toast = useToast()
  const [canSendTickets, setCanSendTickets] = useState(true)
  const [isSendInvitations, setIsSendInvitations] = useState(false)

  useEffect(() => {
    const getTickets = async () => {
      const { data } = await ticketApi.getTickets(eventId)
      setEventTickets(data.tickets)
    }
    getTickets()
  }, [])

  useEffect(() => {
    if (emails.length === 0) {
      setCanSendTickets(false)
    } else {
      setCanSendTickets(true)
    }
  }, [emails])
  
  const addEmail = (email) => {
    if (!email) return
    if (emails.includes(email)) {
      toast({
        title: "Error",
        description: "El email ya fue agregado",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }
    setEmails([...emails, email])
    setEmail("")
  }

  const deleteEmail = (email) => {
    setEmails(emails.filter((e) => e !== email))
  }

  const deleteTicket = (index) => {
    setTicketsList(ticketsList.filter((_, i) => i !== index))
  }

  const handleSendTickets = async () => {
    setIsSendInvitations(true)
    try {
      // get selected options of selects
      const selects = document.querySelectorAll(".ticketsToSend")
      const quantities = document.querySelectorAll(".quantityToSend")
      const date = document.querySelectorAll(".ticketDate")
  
      const ticketsToSend = []
      selects.forEach((select, index) => ticketsToSend.push({
        ticketId: select.value,
        quantity: quantities[index].value,
        date: JSON.parse(date[index].value),
      }))
  
      await ticketApi.sendInvitations(eventTickets[0]?.eventRef, ticketsToSend, emails)
      
      toast({
        title: "Éxito",
        description: "Invitaciones enviadas",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar las invitaciones",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
    setIsSendInvitations(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enviar invitaciones</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Ingresa los mails a los que quieres enviar los tickets.</Text>
          <Flex style={{ flexWrap: "wrap", margin: "10px 0", gap: 10 }}>
            {emails.map(email => (
              <Flex key={email} style={{ 
                border: "1px solid rgb(226, 232, 240)",
                borderRadius: "0.375rem",
                padding: "5px 10px",
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text>{email}</Text>
                <DeleteIcon ml="7px" color="red" onClick={() => deleteEmail(email)} />
              </Flex>
            ))}
          </Flex>
          <Flex>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button 
              color="white"
              bg="primary"
              _hover={{
                color: "white",
                bg: "buttonHover",
              }} 
              style={{ marginLeft: 22 }} 
              onClick={() => addEmail(email)}
            >
              Agregar
            </Button>
          </Flex>
          {/* TODO: Agregar select para seleccionar fecha del evento */}
          {ticketsList.map((_, index) => (
            <SelectList 
              deleteTicket={deleteTicket} 
              eventTickets={eventTickets} 
              index={index} 
              ticketsList={ticketsList} 
              key={index} 
              setCanSendTickets={setCanSendTickets}
            />
          ))}
          {
            ticketsList.length != eventTickets.length && (
              <Flex style={{ justifyContent: "center", marginTop: 20 }}>
                <Button 
                  color="white"
                  bg="primary"
                  _hover={{
                    color: "white",
                    bg: "buttonHover",
                  }} 
                  onClick={() => setTicketsList([...ticketsList, 0])}
                >
                  Añadir otro ticket
                </Button>
              </Flex>
            )
          }
        </ModalBody>

        <ModalFooter>
          <Button colorScheme='red' mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme='teal' onClick={handleSendTickets} disabled={!canSendTickets} isLoading={isSendInvitations}>Enviar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}