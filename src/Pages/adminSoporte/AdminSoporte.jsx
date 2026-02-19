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
  Input,
  Text,
  Divider,
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { paymentApi } from '../../Api/payment';

export default function AdminSoporte() {
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSyncPayment = async () => {
    const id = paymentId?.trim();
    if (!id) {
      toast({
        title: 'ID requerido',
        description: 'Ingresá el número de operación de Mercado Pago (ej: 146886151026).',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const { data } = await paymentApi.syncPayment(id);
      toast({
        title: data?.ok ? 'Pago sincronizado' : 'Resultado',
        description: data?.message || (data?.ok ? 'El pago se actualizó correctamente.' : 'Revisá el ID o el estado en Mercado Pago.'),
        status: data?.ok ? 'success' : 'info',
        duration: 6000,
        isClosable: true,
      });
      if (data?.ok) setPaymentId('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al sincronizar.';
      toast({
        title: 'Error',
        description: msg,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box pt={{ base: 6, md: 8 }} pb={8} px={{ base: 4, md: 6 }}>
      <Container maxW="container.md">
        <Heading as="h1" size="lg" fontFamily="secondary" mb={6}>
          Soporte
        </Heading>

        <VStack align="stretch" spacing={6}>
          <Card>
            <CardBody>
              <Heading as="h2" size="md" fontFamily="secondary" mb={2}>
                Pagos
              </Heading>
              <Text color="gray.600" fontSize="sm" mb={4}>
                Sincronizar un pago ya aprobado en Mercado Pago que quedó en pendiente (por ejemplo, si el webhook no llegó). Siempre se usa el <strong>número de operación</strong> de Mercado Pago (ej. en el detalle del pago aparece como &quot;Operación #146886151026&quot;).
              </Text>
              <Divider my={4} />
              <FormControl>
                <FormLabel>Número de operación (Mercado Pago)</FormLabel>
                <HStack align="flex-end" spacing={3} flexWrap="wrap" mt={2}>
                  <Input
                    placeholder="Ej: 146886151026"
                    value={paymentId}
                    onChange={(e) => setPaymentId(e.target.value)}
                    type="text"
                    maxW="xs"
                    size="md"
                  />
                  <Button
                    leftIcon={<FiRefreshCw />}
                    colorScheme="primary"
                    size="md"
                    onClick={handleSyncPayment}
                    isLoading={loading}
                    loadingText="Sincronizando…"
                  >
                    Sincronizar pago
                  </Button>
                </HStack>
              </FormControl>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
