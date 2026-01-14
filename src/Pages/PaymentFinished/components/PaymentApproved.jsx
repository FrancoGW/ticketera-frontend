import React from 'react'
import { 
    Alert,AlertIcon,AlertTitle,AlertDescription,Button, Link, Flex

} from '@chakra-ui/react'

function PayApproved() {
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
    <Link href='/profile/my-tickets' ><Button m='0 20px' colorScheme="purple">Ver e-tickets</Button></Link>
    </Flex>
    
  </AlertDescription>
</Alert>

   
  )
}

export default PayApproved