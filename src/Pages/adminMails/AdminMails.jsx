import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Text,
  Divider,
  Icon,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { FiMail, FiSave, FiEye, FiRefreshCw, FiSend } from 'react-icons/fi';
import { emailApi } from '../../Api/email';
import { motion } from 'framer-motion';

const EMAIL_TYPES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password-reset',
  QR: 'qr',
  COURTESY_TICKET: 'courtesy-ticket',
  INVITATION: 'invitation',
  TICKET_TRANSFER: 'ticket-transfer',
  UPDATE_EMAIL: 'update-email',
  UPDATE_PASSWORD: 'update-password',
  VERIFY_NEW_EMAIL: 'verify-new-email',
};

const EMAIL_TYPE_LABELS = {
  [EMAIL_TYPES.WELCOME]: 'Email de Bienvenida',
  [EMAIL_TYPES.PASSWORD_RESET]: 'Restablecimiento de Contraseña',
  [EMAIL_TYPES.QR]: 'Email con QR',
  [EMAIL_TYPES.COURTESY_TICKET]: 'Ticket de Cortesía',
  [EMAIL_TYPES.INVITATION]: 'Invitación con Múltiples QR',
  [EMAIL_TYPES.TICKET_TRANSFER]: 'Transferencia de Ticket',
  [EMAIL_TYPES.UPDATE_EMAIL]: 'Actualizar Email',
  [EMAIL_TYPES.UPDATE_PASSWORD]: 'Actualizar Contraseña',
  [EMAIL_TYPES.VERIFY_NEW_EMAIL]: 'Verificar Nuevo Email',
};

const EMAIL_TYPE_DESCRIPTIONS = {
  [EMAIL_TYPES.WELCOME]: 'Se envía cuando un nuevo usuario se registra en la plataforma',
  [EMAIL_TYPES.PASSWORD_RESET]: 'Se envía cuando un usuario solicita restablecer su contraseña',
  [EMAIL_TYPES.QR]: 'Se envía cuando se genera un código QR para un ticket',
  [EMAIL_TYPES.COURTESY_TICKET]: 'Se envía con ticket de cortesía y QR',
  [EMAIL_TYPES.INVITATION]: 'Se envía con múltiples códigos QR para un evento',
  [EMAIL_TYPES.TICKET_TRANSFER]: 'Se envía cuando se transfiere un ticket (remitente y receptor)',
  [EMAIL_TYPES.UPDATE_EMAIL]: 'Se envía para actualizar el email del usuario',
  [EMAIL_TYPES.UPDATE_PASSWORD]: 'Se envía para actualizar la contraseña',
  [EMAIL_TYPES.VERIFY_NEW_EMAIL]: 'Se envía para verificar el nuevo email después de actualizarlo',
};

const VARIABLES_INFO = {
  [EMAIL_TYPES.WELCOME]: [
    { name: '{{verifyUrl}}', description: 'URL para verificar el email' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.PASSWORD_RESET]: [
    { name: '{{recoverUrl}}', description: 'URL para recuperar contraseña' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.QR]: [
    { name: '{{qrImage}}', description: 'Imagen QR (se envía como attachment con CID: cid:qr)' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.COURTESY_TICKET]: [
    { name: '{{eventTitle}}', description: 'Título del evento' },
    { name: '{{ticketTitle}}', description: 'Título del ticket' },
    { name: '{{qrImage}}', description: 'Imagen QR (se envía como attachment con CID: cid:qr)' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.INVITATION]: [
    { name: '{{eventTitle}}', description: 'Título del evento' },
    { name: '{{ticketTitle}}', description: 'Título del ticket' },
    { name: '{{qrImages}}', description: 'Array de imágenes QR (cid:0-qr, cid:1-qr, etc.)' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.TICKET_TRANSFER]: [
    { name: '{{eventTitle}}', description: 'Título del evento' },
    { name: '{{ticketTitle}}', description: 'Título del ticket' },
    { name: '{{transferType}}', description: 'Tipo: "sender" o "receiver"' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.UPDATE_EMAIL]: [
    { name: '{{updateUrl}}', description: 'URL para actualizar email' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.UPDATE_PASSWORD]: [
    { name: '{{updateUrl}}', description: 'URL para actualizar contraseña' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
  [EMAIL_TYPES.VERIFY_NEW_EMAIL]: [
    { name: '{{verifyUrl}}', description: 'URL para verificar el nuevo email' },
    { name: '{{currentYear}}', description: 'Año actual (automático)' },
  ],
};

export default function AdminMails() {
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [testing, setTesting] = useState({});
  const [testEmail, setTestEmail] = useState('');
  const [testEmailType, setTestEmailType] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [previewTabs, setPreviewTabs] = useState({}); // Estado para cada template
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await emailApi.getEmailTemplates();
      
      // Si el backend devuelve un array, convertirlo a objeto
      if (Array.isArray(response.data)) {
        const templatesObj = {};
        response.data.forEach(template => {
          templatesObj[template.type] = template;
        });
        setTemplates(templatesObj);
      } else {
        setTemplates(response.data || {});
      }
    } catch (error) {
      console.error('Error cargando templates:', error);
      
      // Si el error es 404, significa que el endpoint no existe aún
      // No mostrar error, solo crear estructura vacía silenciosamente
      if (error?.response?.status === 404) {
        const emptyTemplates = {};
        Object.values(EMAIL_TYPES).forEach(type => {
          emptyTemplates[type] = {
            type,
            subject: '',
            body: '',
          };
        });
        setTemplates(emptyTemplates);
        // No mostrar toast para 404, es esperado si el backend aún no implementó el endpoint
        return;
      }
      
      // Para otros errores, mostrar mensaje pero no bloquear
      const emptyTemplates = {};
      Object.values(EMAIL_TYPES).forEach(type => {
        emptyTemplates[type] = {
          type,
          subject: '',
          body: '',
        };
      });
      setTemplates(emptyTemplates);
      
      // Solo mostrar toast si no es un 404
      if (error?.response?.status !== 404) {
        toast({
          title: 'Error cargando templates',
          description: 'No se pudieron cargar los templates. El backend puede no tener implementado el endpoint aún.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (type) => {
    try {
      setSaving(prev => ({ ...prev, [type]: true }));
      
      const template = templates[type];
      if (!template) {
        throw new Error('Template no encontrado');
      }

      await emailApi.updateEmailTemplate(type, {
        subject: template.subject,
        body: template.body,
      });

      toast({
        title: 'Template guardado',
        description: `${EMAIL_TYPE_LABELS[type]} guardado correctamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error guardando template:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'No se pudo guardar el template',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleChange = (type, field, value) => {
    setTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const handleOpenTestModal = (type) => {
    setTestEmailType(type);
    setTestEmail('');
    onOpen();
  };

  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmailType) return;

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingresa un email válido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setTesting(prev => ({ ...prev, [testEmailType]: true }));
      const response = await emailApi.testEmailTemplate(testEmailType, testEmail);
      
      toast({
        title: 'Email de prueba enviado',
        description: response?.data?.message || `Email de prueba enviado exitosamente a ${testEmail}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      onClose();
      setTestEmail('');
      setTestEmailType(null);
    } catch (error) {
      console.error('Error enviando email de prueba:', error);
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'No se pudo enviar el email de prueba',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setTesting(prev => ({ ...prev, [testEmailType]: false }));
    }
  };

  // Generar preview del HTML con variables reemplazadas
  const generatePreview = (type, html) => {
    if (!html) return '';
    
    // Datos de ejemplo para reemplazar variables
    const previewData = {
      verifyUrl: 'https://ticketera-frontend-swart.vercel.app/verify-email?token=preview-token-123',
      recoverUrl: 'https://ticketera-frontend-swart.vercel.app/require-update-password?token=preview-token-123',
      updateUrl: 'https://ticketera-frontend-swart.vercel.app/change-password?token=preview-token-123',
      currentYear: new Date().getFullYear(),
      eventTitle: 'Evento de Prueba',
      ticketTitle: 'Ticket VIP',
      transferType: 'sender',
      userName: 'Usuario de Prueba',
      userEmail: 'usuario@ejemplo.com',
      qrImage: 'cid:qr', // Para preview, mostrar placeholder
    };

    let previewHtml = html;
    
    // Reemplazar variables Handlebars simples
    Object.keys(previewData).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewHtml = previewHtml.replace(regex, previewData[key]);
    });

    // Reemplazar imágenes QR con placeholder
    previewHtml = previewHtml.replace(/src="cid:qr"/g, 'src="https://via.placeholder.com/200x200/7253c9/ffffff?text=QR+Code"');
    previewHtml = previewHtml.replace(/src="cid:\d+-qr"/g, 'src="https://via.placeholder.com/200x200/7253c9/ffffff?text=QR+Code"');

    return previewHtml;
  };

  const renderTemplateEditor = (type) => {
    const template = templates[type] || { subject: '', body: '' };
    const variables = VARIABLES_INFO[type] || [];

    return (
      <VStack spacing={6} align="stretch">
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Heading size="md" mb={2}>
                  {EMAIL_TYPE_LABELS[type]}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  {EMAIL_TYPE_DESCRIPTIONS[type]}
                </Text>
              </Box>

              <Divider />

              <FormControl>
                <FormLabel fontWeight="semibold">Asunto del Email</FormLabel>
                <Input
                  value={template.subject || ''}
                  onChange={(e) => handleChange(type, 'subject', e.target.value)}
                  placeholder="Ej: Tu ticket para {{eventName}}"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="semibold">Cuerpo del Email</FormLabel>
                <Tabs 
                  index={previewTabs[type] || 0} 
                  onChange={(index) => setPreviewTabs(prev => ({ ...prev, [type]: index }))} 
                  colorScheme="purple" 
                  variant="enclosed"
                >
                  <TabList>
                    <Tab>
                      <Icon as={FiEye} mr={2} />
                      Preview
                    </Tab>
                    <Tab>
                      <Icon as={FiMail} mr={2} />
                      HTML
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0} pt={4}>
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        overflow="hidden"
                        bg="white"
                      >
                        <Box
                          bg="gray.50"
                          px={4}
                          py={2}
                          borderBottom="1px solid"
                          borderColor="gray.200"
                        >
                          <Text fontSize="xs" color="gray.600" fontWeight="medium">
                            Preview del Email
                          </Text>
                        </Box>
                        <Box
                          p={0}
                          maxH="600px"
                          overflowY="auto"
                          bg="gray.100"
                          display="flex"
                          justifyContent="center"
                          py={4}
                        >
                          <Box
                            maxW="600px"
                            w="100%"
                            bg="white"
                            boxShadow="lg"
                            dangerouslySetInnerHTML={{
                              __html: generatePreview(type, template.body || '')
                            }}
                          />
                        </Box>
                      </Box>
                      <Alert status="info" mt={2} borderRadius="md" size="sm">
                        <AlertIcon />
                        <AlertDescription fontSize="xs">
                          Este es un preview con datos de ejemplo. Las variables se reemplazan automáticamente al enviar el email real.
                        </AlertDescription>
                      </Alert>
                    </TabPanel>
                    <TabPanel px={0} pt={4}>
                      <Textarea
                        value={template.body || ''}
                        onChange={(e) => handleChange(type, 'body', e.target.value)}
                        placeholder="Escribe el contenido del email en HTML aquí..."
                        minH="400px"
                        fontFamily="mono"
                        fontSize="xs"
                      />
                      <Text fontSize="xs" color="gray.500" mt={2}>
                        <strong>Nota:</strong> Los templates usan formato HTML con Handlebars. Puedes usar variables como {variables.map(v => v.name).join(', ')}
                      </Text>
                      <Alert status="info" mt={2} borderRadius="md" size="sm">
                        <AlertIcon />
                        <AlertDescription fontSize="xs">
                          Los templates son archivos .hbs (Handlebars). El HTML se renderiza con las variables reemplazadas automáticamente.
                        </AlertDescription>
                      </Alert>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </FormControl>

              {variables.length > 0 && (
                <Box>
                  <Text fontWeight="semibold" mb={2} fontSize="sm">
                    Variables disponibles:
                  </Text>
                  <VStack align="stretch" spacing={2}>
                    {variables.map((variable) => (
                      <Flex key={variable.name} justify="space-between" align="center" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontFamily="mono" fontWeight="bold">
                          {variable.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {variable.description}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}

              <HStack spacing={3} flexWrap="wrap">
                <Button
                  colorScheme="purple"
                  leftIcon={<Icon as={FiSave} />}
                  onClick={() => handleSave(type)}
                  isLoading={saving[type]}
                  loadingText="Guardando..."
                >
                  Guardar Template
                </Button>
                <Button
                  colorScheme="teal"
                  variant="outline"
                  leftIcon={<Icon as={FiSend} />}
                  onClick={() => handleOpenTestModal(type)}
                >
                  Enviar Prueba
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Icon as={FiRefreshCw} />}
                  onClick={loadTemplates}
                  isDisabled={loading}
                >
                  Recargar
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    );
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={4} mt={4}>
        <Center h="50vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="purple.500" />
            <Text>Cargando templates de email...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

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
              Gestión de Emails
            </Heading>
            <Text color="gray.600">
              Configura los templates de email que se envían automáticamente desde la plataforma
            </Text>
          </Box>

          <Alert status="info" borderRadius="lg" display={{ base: 'none', md: 'flex' }}>
            <AlertIcon />
            <Box>
              <AlertTitle>Variables disponibles</AlertTitle>
              <AlertDescription>
                Los templates usan Handlebars (.hbs). Puedes usar variables que se reemplazarán automáticamente con datos reales.
                Las variables disponibles se muestran en cada sección.
              </AlertDescription>
            </Box>
          </Alert>

          <Tabs index={activeTab} onChange={setActiveTab} colorScheme="purple" variant="enclosed">
            <TabList flexWrap="wrap">
              <Tab>
                <Icon as={FiMail} mr={2} />
                Bienvenida
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Restablecimiento
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                QR
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Cortesía
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Invitación
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Transferencia
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Actualizar Email
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Actualizar Password
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Verificar Email
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.WELCOME)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.PASSWORD_RESET)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.QR)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.COURTESY_TICKET)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.INVITATION)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.TICKET_TRANSFER)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.UPDATE_EMAIL)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.UPDATE_PASSWORD)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.VERIFY_NEW_EMAIL)}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </motion.div>

      {/* Modal para enviar email de prueba */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Enviar Email de Prueba
            {testEmailType && (
              <Text fontSize="sm" fontWeight="normal" color="gray.600" mt={1}>
                {EMAIL_TYPE_LABELS[testEmailType]}
              </Text>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md" size="sm">
                <AlertIcon />
                <AlertDescription fontSize="xs">
                  El email se enviará con el prefijo [PRUEBA] en el asunto y datos de ejemplo.
                </AlertDescription>
              </Alert>
              <FormControl>
                <FormLabel>Email de destino</FormLabel>
                <Input
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendTestEmail();
                    }
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Ingresa el email donde quieres recibir el email de prueba
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              leftIcon={<Icon as={FiSend} />}
              onClick={handleSendTestEmail}
              isLoading={testEmailType && testing[testEmailType]}
              loadingText="Enviando..."
              isDisabled={!testEmail}
            >
              Enviar Prueba
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
