import React from 'react'
import { 
    Alert,AlertIcon,AlertTitle,AlertDescription,Button, Link, Flex

} from '@chakra-ui/react'

function verifyemail() {
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
    Tu correo fue confirmado
  </AlertTitle>
  <AlertDescription maxWidth='sm'>
    <Flex direction='column'>
    Gracias por registrarte en GetPass! 
    <Button m='5'><Link href='/' >INICIO</Link></Button>    
    </Flex>
    
  </AlertDescription>
</Alert>

   
  )
}

export default verifyemail