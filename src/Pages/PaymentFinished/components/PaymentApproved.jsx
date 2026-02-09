import React from 'react'
import { 
    Alert, AlertIcon, AlertTitle, AlertDescription, Button, Link, Flex

} from '@chakra-ui/react'

function PayApproved({ isMembership }) {
  if (isMembership) {
    return (
      <Alert
        status='success'
        variant='subtle'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        textAlign='center'
        height='100vh'
      >
        <AlertIcon boxSize='40px' mr={0} />
        <AlertTitle mt={4} mb={1} fontSize='lg'>
          Membresía activada
        </AlertTitle>
        <AlertDescription maxWidth='sm'>
          <Flex direction='column' gap={3}>
            Tu plan Depósito Directo (CBU) está activo. Ya podés configurar tu CBU en Mi Perfil y crear eventos.
            <Link href='/profile'><Button colorScheme="green">Ir a Mi Perfil</Button></Link>
          </Flex>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      status='success'
      variant='subtle'
      flexDirection='column'
      alignItems='center'
      justifyContent='center'
      textAlign='center'
      height='100vh'
    >
      <AlertIcon boxSize='40px' mr={0} />
      <AlertTitle mt={4} mb={1} fontSize='lg'>
        Tu Pago Fue Aprobado 
      </AlertTitle>
      <AlertDescription maxWidth='sm'>
        <Flex direction='column'>
          Gracias por elegir GetPass! 
          <Link href='/profile/my-tickets'><Button m='0 20px' colorScheme="purple">Ver e-tickets</Button></Link>
        </Flex>
      </AlertDescription>
    </Alert>
  );
}

export default PayApproved