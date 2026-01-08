import React from 'react'
import { 
    Alert,AlertIcon,AlertTitle,AlertDescription,Button, Link, Flex

} from '@chakra-ui/react'

function PaymentInProcess() {
  return (
    
        <Alert
  status='warning'
  variant='subtle'
  flexDirection='column'
  alignItems='center'
  justifyContent='center'
  textAlign='center'
  height='100vh'
>
  <AlertIcon boxSize='40px' mr={0} />
  <AlertTitle mt={4} mb={1} fontSize='lg'>
    Tu pago esta pendiente 
  </AlertTitle>
  <AlertDescription maxWidth='sm'>
    <Flex direction='column'>
    Te avisaremos por mail el resultado de la transacción una vez se haya finalizado.
    <Link href='/' ><Button m='5'>INICIO</Button></Link>
    </Flex>
    
  </AlertDescription>
</Alert>

   
  )
}

export default PaymentInProcess