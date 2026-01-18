import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  useToast,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';
import { useMaintenanceMode } from '../../hooks/useMaintenanceMode';
import { motion } from 'framer-motion';

export default function AdminSettings() {
  const { isMaintenanceMode, isLoading, error, setMaintenanceMode } = useMaintenanceMode();
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const handleToggleMaintenance = async () => {
    const newValue = !isMaintenanceMode;
    setIsUpdating(true);
    
    try {
      await setMaintenanceMode(newValue);
      
      toast({
        title: newValue ? 'Modo mantenimiento activado' : 'Modo mantenimiento desactivado',
        description: newValue 
          ? 'La aplicación ahora muestra la pantalla de pausa con "GetPass" para todos los usuarios excepto admins en esta página.' 
          : 'La aplicación ha vuelto a funcionar normalmente.',
        status: newValue ? 'warning' : 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el modo mantenimiento. Por favor, intenta nuevamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Container maxW="container.xl" py={4} mt={4}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="xl" mb={2}>
              Configuración del Sistema
            </Heading>
            <Text color="gray.600">
              Administra las configuraciones globales de la plataforma
            </Text>
          </Box>

          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Box>
                  <HStack spacing={3} mb={2}>
                    <FiSettings size={20} color="#7253c9" />
                    <Heading size="md">
                      Pantalla de Pausa / Modo Mantenimiento
                    </Heading>
                    <Badge
                      colorScheme={isMaintenanceMode ? 'red' : 'green'}
                      fontSize="sm"
                    >
                      {isMaintenanceMode ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                  </HStack>
                  <Text color="gray.600" fontSize="sm" mt={2}>
                    Cuando está activo, la aplicación muestra una pantalla de pausa con el nombre de la marca "GetPass" para todos los visitantes.
                    Los administradores pueden acceder a esta página para desactivarlo.
                  </Text>
                </Box>

                <Divider />

                <FormControl display="flex" alignItems="center" justifyContent="space-between">
                  <Box flex="1">
                    <FormLabel htmlFor="maintenance-mode" mb={0} fontWeight="semibold">
                      Activar Modo Mantenimiento
                    </FormLabel>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {isMaintenanceMode 
                        ? 'La pantalla de pausa está visible para todos los usuarios'
                        : 'La aplicación funciona normalmente'}
                    </Text>
                  </Box>
                  <Switch
                    id="maintenance-mode"
                    size="lg"
                    colorScheme="purple"
                    isChecked={isMaintenanceMode}
                    onChange={handleToggleMaintenance}
                    isDisabled={isLoading || isUpdating}
                  />
                </FormControl>

                {error && (
                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {isMaintenanceMode && (
                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Modo Mantenimiento Activo</AlertTitle>
                      <AlertDescription>
                        Todos los visitantes verán la pantalla de pausa con "GetPass". 
                        Solo los administradores pueden acceder a esta página para desactivarlo.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {isLoading && (
                  <Center py={4}>
                    <Spinner size="md" color="purple.500" />
                    <Text ml={3} color="gray.600">Cargando configuración...</Text>
                  </Center>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </motion.div>
    </Container>
  );
}
