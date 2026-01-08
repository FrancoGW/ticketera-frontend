import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
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
  Input,
  Select,
  useToast,
  IconButton,
  HStack,
  Container,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import userService from '../../Api/user';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Sidebar from "../../components/sideBar/sideBar";

const validRoles = ['admin', 'pdv', 'validator', 'user'];

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
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
    }
  };

  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
      <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
        <Header />
        
        <Box
          as="main"
          minH="calc(100vh - 80px)"
          pb={20}
          bg="white"
        >
          <Container 
            maxW="full" 
            px={{ base: 4, md: 8 }} 
            py={8}
          >
            <Flex justify="space-between" align="center" mb={8}>
              <Heading 
                as="h1" 
                fontFamily="secondary" 
                color="tertiary" 
                fontSize="2xl"
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
            >
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th fontFamily="secondary" fontWeight="600">Nombre</Th>
                    <Th fontFamily="secondary" fontWeight="600">Email</Th>
                    <Th fontFamily="secondary" fontWeight="600">DNI</Th>
                    <Th fontFamily="secondary" fontWeight="600">Teléfono</Th>
                    <Th fontFamily="secondary" fontWeight="600">Rol</Th>
                    <Th fontFamily="secondary" fontWeight="600">Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user._id} _hover={{ bg: "gray.50" }}>
                      <Td fontFamily="secondary">{`${user.firstname} ${user.lastname}`}</Td>
                      <Td fontFamily="secondary">{user.email}</Td>
                      <Td fontFamily="secondary">{user.dni}</Td>
                      <Td fontFamily="secondary">{user.phoneNumber}</Td>
                      <Td fontFamily="secondary">{user.rol || user.roles?.[0]}</Td>
                      <Td>
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
                    <FormControl mb={4}>
                      <FormLabel fontFamily="secondary" fontWeight="500">Contraseña</FormLabel>
                      <Input
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        type="password"
                        borderRadius="lg"
                        borderColor="gray.200"
                        _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
                      />
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
          </Container>
        </Box>
        
        <Footer />
      </Box>
    </Flex>
  );
};

export default UsersManagement;