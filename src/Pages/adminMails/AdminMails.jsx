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
  QR: 'qr',
  PASSWORD_RESET: 'password-reset',
  WELCOME: 'welcome',
};

const EMAIL_TYPE_LABELS = {
  [EMAIL_TYPES.QR]: 'Email con QR',
  [EMAIL_TYPES.PASSWORD_RESET]: 'Restablecimiento de Contraseña',
  [EMAIL_TYPES.WELCOME]: 'Email de Bienvenida',
};

const EMAIL_TYPE_DESCRIPTIONS = {
  [EMAIL_TYPES.QR]: 'Se envía cuando se genera un código QR para un ticket',
  [EMAIL_TYPES.PASSWORD_RESET]: 'Se envía cuando un usuario solicita restablecer su contraseña',
  [EMAIL_TYPES.WELCOME]: 'Se envía cuando un nuevo usuario se registra en la plataforma',
};

const VARIABLES_INFO = {
  [EMAIL_TYPES.QR]: [
    { name: '{{userName}}', description: 'Nombre del usuario' },
    { name: '{{eventName}}', description: 'Nombre del evento' },
    { name: '{{ticketType}}', description: 'Tipo de ticket' },
    { name: '{{qrCode}}', description: 'Código QR (imagen)' },
    { name: '{{eventDate}}', description: 'Fecha del evento' },
  ],
  [EMAIL_TYPES.PASSWORD_RESET]: [
    { name: '{{userName}}', description: 'Nombre del usuario' },
    { name: '{{resetLink}}', description: 'Enlace para restablecer contraseña' },
    { name: '{{resetCode}}', description: 'Código de verificación' },
  ],
  [EMAIL_TYPES.WELCOME]: [
    { name: '{{userName}}', description: 'Nombre del usuario' },
    { name: '{{userEmail}}', description: 'Email del usuario' },
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
      
      // Si no existen templates en el backend, crear estructura vacía
      const emptyTemplates = {};
      Object.values(EMAIL_TYPES).forEach(type => {
        emptyTemplates[type] = {
          type,
          subject: '',
          body: '',
        };
      });
      setTemplates(emptyTemplates);
      
      toast({
        title: 'Templates no encontrados',
        description: 'Se crearon templates vacíos. Configúralos y guárdalos.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
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
                <FormLabel fontWeight="semibold">Cuerpo del Email</FormLabel>
                <Textarea
                  value={template.body || ''}
                  onChange={(e) => handleChange(type, 'body', e.target.value)}
                  placeholder="Escribe el contenido del email aquí..."
                  minH="300px"
                  fontFamily="mono"
                  fontSize="sm"
                />
                <Text fontSize="xs" color="gray.500" mt={2}>
                  Puedes usar variables como {variables.map(v => v.name).join(', ')}
                </Text>
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
      <Container maxW="container.xl" py={8} marginTop={40}>
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
    <Container maxW="container.xl" py={8} marginTop={40}>
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

          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Variables disponibles</AlertTitle>
              <AlertDescription>
                Puedes usar variables en los templates que se reemplazarán automáticamente con datos reales.
                Las variables disponibles se muestran en cada sección.
              </AlertDescription>
            </Box>
          </Alert>

          <Tabs index={activeTab} onChange={setActiveTab} colorScheme="purple">
            <TabList>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Email con QR
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Restablecimiento
              </Tab>
              <Tab>
                <Icon as={FiMail} mr={2} />
                Bienvenida
              </Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.QR)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.PASSWORD_RESET)}
              </TabPanel>
              <TabPanel px={0}>
                {renderTemplateEditor(EMAIL_TYPES.WELCOME)}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </motion.div>
    </Container>
  );
}
