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
} from '@chakra-ui/react';
import { FiMail, FiSave, FiEye, FiRefreshCw } from 'react-icons/fi';
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
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

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
                <FormLabel fontWeight="semibold">Cuerpo del Email (HTML)</FormLabel>
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

              <HStack>
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
    </Container>
  );
}
