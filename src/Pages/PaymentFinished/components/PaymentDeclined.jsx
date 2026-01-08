import React from 'react'
import { 
    Alert,AlertIcon,AlertTitle,AlertDescription,Button, Link, Flex

} from '@chakra-ui/react'

function PaymentDeclined({ cancelledByUser, message }) {
  console.log(message)
  return (
    
        <Alert
  status='error'
  variant='subtle'
  flexDirection='column'
  alignItems='center'
  justifyContent='center'
  textAlign='center'
  height='100vh'
>
  <AlertIcon boxSize='40px' mr={0} />
  <AlertTitle mt={4} mb={1} fontSize='lg'>
    {cancelledByUser ? "Haz cancelado el pago." : "Tu pago fue rechazado!" }
  </AlertTitle>
  <AlertDescription maxWidth='sm'>
    <Flex direction='column'>
    {!cancelledByUser && message }
    <Link href='/' ><Button m='5'>INICIO</Button></Link>
    </Flex>
    
  </AlertDescription>
</Alert>

   
  )
}

export default PaymentDeclined