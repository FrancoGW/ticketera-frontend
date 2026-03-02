import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  useToast,
  IconButton,
  HStack,
  Container,
  Flex,
  Heading,
  Text,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import userService from '../../Api/user';
import ConfirmDialog from '../confirmDialog/ConfirmDialog';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import { getPasswordError } from '../../utils/passwordValidation';
import PasswordStrengthBar from '../PasswordStrengthBar/PasswordStrengthBar';

const validRoles = ['admin', 'seller', 'pdv', 'validator', 'user'];

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    rol: 'user', // Cambiado de roles a rol
    password: '',
    dni: '',
    phoneNumber: '',
    isActive: true
  });
  const [passwordError, setPasswordError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const confirmDialog = useConfirmDialog();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'rol') { // Cambiado de roles a rol
      setFormData(prev => ({
        ...prev,
        rol: value // Guardamos directamente el valor
      }));
    } else {
      const newValue = e.target.type === 'checkbox' ? e.target.checked : value;
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };

  const handleOpenModal = (user = null) => {
    setPasswordError('');
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        rol: user.roles?.[0] || user.rol || 'user', // Manejo de ambos casos
        password: '',
        dni: user.dni || '',
        phoneNumber: user.phoneNumber || '',
        isActive: user.isActive
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        firstname: '',
        lastname: '',
        rol: 'user',
        password: '',
        dni: '',
        phoneNumber: '',
        isActive: true
      });
    }
    onOpen();
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      const pwdError = getPasswordError(formData.password);
      setPasswordError(pwdError || '');
      if (pwdError) {
        toast({
          title: 'Contraseña inválida',
          description: pwdError,
          status: 'error',
          duration: 4000,
        });
        return;
      }
    }
    try {
      // Preparamos los datos según si es creación o actualización
      const userData = {
        ...formData,
        roles: [formData.rol] // Convertimos el rol a array para el API
      };

      if (selectedUser) {
        await userService.updateTotal(selectedUser._id, userData);
        toast({
          title: 'Éxito',
          description: 'Usuario actualizado correctamente',
          status: 'success',
          duration: 3000,
        });
      } else {
        await userService.createUser(userData);
        toast({
          title: 'Éxito',
          description: 'Usuario creado correctamente',
          status: 'success',
          duration: 3000,
        });
      }
      onClose();
      loadUsers();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Hubo un error al procesar la solicitud',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id) => {
    confirmDialog.openDialog({
      title: "Eliminar usuario",
      message: "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          await userService.deleteUser(id);
          toast({
            title: 'Éxito',
            description: 'Usuario eliminado correctamente',
            status: 'success',
            duration: 3000,
          });
          loadUsers();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'No se pudo eliminar el usuario',
            status: 'error',
            duration: 3000,
          });
        }
      },
    });
  };

  return (
    <>
      <Box
        w="100%"
        maxW="100vw"
        px={{ base: 2, sm: 4, md: 6, lg: 8 }}
        py={{ base: 4, md: 8 }}
        overflowX="hidden"
      >
            <Flex 
              justify="space-between" 
              align={{ base: "flex-start", sm: "center" }} 
              mb={8}
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <Heading 
                as="h1" 
                fontFamily="secondary" 
                color="tertiary" 
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
              >
                Gestión de Usuarios
              </Heading>
              <Button
                leftIcon={<FiPlus />}
                bg="primary"
                color="white"
                _hover={{ 
                  bg: "buttonHover",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                onClick={() => handleOpenModal()}
                fontFamily="secondary"
                fontWeight="500"
                px={6}
                py={6}
                borderRadius="lg"
                transition="all 0.2s"
                w={{ base: "100%", sm: "auto" }}
              >
                Nuevo Usuario
              </Button>
            </Flex>

            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="md"
              border="1px solid"
              borderColor="gray.100"
              overflow="hidden"
              w="100%"
              maxW="100%"
            >
              <TableContainer 
                overflowX="auto"
                w="100%"
                maxW="100%"
                sx={{
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#555',
                  },
                }}
              >
                <Table 
                  variant="simple" 
                  size={{ base: "sm", md: "md" }}
                  w="100%"
                  minW={{ base: "600px", md: "auto" }}
                >
                <Thead bg="gray.50">
                  <Tr>
                    <Th fontFamily="secondary" fontWeight="600" whiteSpace={{ base: "nowrap", md: "normal" }}>Nombre</Th>
                    <Th fontFamily="secondary" fontWeight="600" whiteSpace={{ base: "nowrap", md: "normal" }} display={{ base: "none", md: "table-cell" }}>Email</Th>
                    <Th fontFamily="secondary" fontWeight="600" whiteSpace={{ base: "nowrap", md: "normal" }} display={{ base: "none", lg: "table-cell" }}>DNI</Th>
                    <Th fontFamily="secondary" fontWeight="600" whiteSpace={{ base: "nowrap", md: "normal" }} display={{ base: "none", lg: "table-cell" }}>Teléfono</Th>
                    <Th fontFamily="secondary" fontWeight="600" whiteSpace={{ base: "nowrap", md: "normal" }}>Rol</Th>
                    <Th fontFamily="secondary" fontWeight="600" whiteSpace={{ base: "nowrap", md: "normal" }}>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user._id} _hover={{ bg: "gray.50" }}>
                      <Td fontFamily="secondary" whiteSpace={{ base: "nowrap", md: "normal" }}>
                        <Box>
                          <Box fontWeight="600">{`${user.firstname} ${user.lastname}`}</Box>
                          <Box fontSize="xs" color="gray.500" display={{ base: "block", md: "none" }} mt={1}>
                            {user.email}
                          </Box>
                        </Box>
                      </Td>
                      <Td fontFamily="secondary" display={{ base: "none", md: "table-cell" }}>{user.email}</Td>
                      <Td fontFamily="secondary" display={{ base: "none", lg: "table-cell" }}>{user.dni}</Td>
                      <Td fontFamily="secondary" display={{ base: "none", lg: "table-cell" }}>{user.phoneNumber}</Td>
                      <Td fontFamily="secondary" whiteSpace={{ base: "nowrap", md: "normal" }}>{user.rol || user.roles?.[0]}</Td>
                      <Td whiteSpace="nowrap">
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiEdit2 />}
                            aria-label="Editar"
                            onClick={() => handleOpenModal(user)}
                            colorScheme="blue"
                            size="sm"
                            variant="ghost"
                            _hover={{ bg: "blue.50" }}
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            aria-label="Eliminar"
                            onClick={() => handleDelete(user._id)}
                            colorScheme="red"
                            size="sm"
                            variant="ghost"
                            _hover={{ bg: "red.50" }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              </TableContainer>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay />
              <ModalContent borderRadius="lg">
                <ModalHeader fontFamily="secondary" fontWeight="600">
                  {selectedUser ? 'Editar Usuario' : 'Crear Usuario'}
                </ModalHeader>
                <ModalBody>
                  <FormControl mb={4}>
                    <FormLabel fontFamily="secondary" fontWeight="500">Email</FormLabel>
                    <Input
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel fontFamily="secondary" fontWeight="500">Nombre</FormLabel>
                    <Input
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel fontFamily="secondary" fontWeight="500">Apellido</FormLabel>
                    <Input
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel fontFamily="secondary" fontWeight="500">DNI</FormLabel>
                    <Input
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                    />
                  </FormControl>
                  <FormControl mb={4}>
                    <FormLabel fontFamily="secondary" fontWeight="500">Teléfono</FormLabel>
                    <Input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                    />
                  </FormControl>
                  {!selectedUser && (
                    <FormControl mb={4} isInvalid={!!passwordError}>
                      <FormLabel fontFamily="secondary" fontWeight="500">Contraseña</FormLabel>
                      <Input
                        name="password"
                        value={formData.password}
                        onChange={(e) => {
                          handleInputChange(e);
                          setPasswordError('');
                        }}
                        type="password"
                        borderRadius="lg"
                        borderColor="gray.200"
                        _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                      />
                      <PasswordStrengthBar password={formData.password} />
                      <FormErrorMessage>{passwordError}</FormErrorMessage>
                    </FormControl>
                  )}
                  <FormControl mb={4}>
                    <FormLabel fontFamily="secondary" fontWeight="500">Rol</FormLabel>
                    <Select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      borderRadius="lg"
                      borderColor="gray.200"
                      _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                    >
                      {validRoles.map(role => (
                        <option key={role} value={role}>
                          {role.toUpperCase()}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    bg="primary"
                    color="white"
                    _hover={{ bg: "buttonHover" }}
                    mr={3} 
                    onClick={handleSubmit}
                    fontFamily="secondary"
                    fontWeight="500"
                    borderRadius="lg"
                  >
                    {selectedUser ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button 
                    onClick={onClose}
                    variant="ghost"
                    fontFamily="secondary"
                    borderRadius="lg"
                  >
                    Cancelar
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
      </Box>
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.closeDialog}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        confirmColor={confirmDialog.confirmColor}
      />
    </>
  );
};

export default UsersManagement;