import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Heading,
  HStack,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  VStack,
  FormControl,
  FormLabel,
  Badge,
  TableContainer,
} from "@chakra-ui/react";
import { paymentApi } from "../../Api/payment";
import { useAuth } from "../../auth/context/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const PRICE_REGULAR = 135;
const PRICE_NEW = 119.99;
const NEW_CUSTOMER_MAX = 1000;

function SellerGpCoins() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const [balance, setBalance] = useState({ balance: 0, totalPurchased: 0 });
  const [purchases, setPurchases] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const isPlanCustom = user?.sellingPlan === "CUSTOM";

  useEffect(() => {
    if (!isPlanCustom) return;
    Promise.all([
      paymentApi.getGpCoinsBalance().then((r) => r.data).catch(() => ({ balance: 0, totalPurchased: 0 })),
      paymentApi.getGpCoinsPurchases().then((r) => r.data || []).catch(() => []),
    ]).then(([bal, list]) => {
      setBalance(bal);
      setPurchases(Array.isArray(list) ? list : []);
    }).finally(() => setLoadingBalance(false));
  }, [isPlanCustom]);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast({ title: "Pago aprobado", description: "Tus GP-Coins se acreditaron correctamente.", status: "success", duration: 4000, isClosable: true, position: "bottom-right" });
      setSearchParams({});
      paymentApi.getGpCoinsBalance().then((r) => setBalance(r.data)).catch(() => {});
      paymentApi.getGpCoinsPurchases().then((r) => setPurchases(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    } else if (payment === "rejected") {
      toast({ title: "Pago no completado", description: "El pago fue rechazado o cancelado.", status: "warning", duration: 4000, isClosable: true, position: "bottom-right" });
      setSearchParams({});
    } else if (payment === "pending") {
      toast({ title: "Pago pendiente", description: "Tu pago está en proceso. Las GP-Coins se acreditarán al confirmarse.", status: "info", duration: 4000, isClosable: true, position: "bottom-right" });
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, toast]);

  const totalPurchased = balance.totalPurchased ?? 0;
  const numQty = parseInt(quantity, 10) || 0;
  const estimatedTotal =
    totalPurchased === 0
      ? numQty <= NEW_CUSTOMER_MAX
        ? numQty * PRICE_NEW
        : NEW_CUSTOMER_MAX * PRICE_NEW + (numQty - NEW_CUSTOMER_MAX) * PRICE_REGULAR
      : numQty * PRICE_REGULAR;

  const handleBuy = async () => {
    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      toast({ title: "Cantidad inválida", description: "Ingresá una cantidad mayor a 0.", status: "warning", duration: 3000, isClosable: true, position: "bottom-right" });
      return;
    }
    if (qty > 50000) {
      toast({ title: "Máximo 50.000", description: "La cantidad máxima por compra es 50.000 GP-Coins.", status: "warning", duration: 3000, isClosable: true, position: "bottom-right" });
      return;
    }
    setLoading(true);
    try {
      const { data } = await paymentApi.createGpCoinsCheckout(qty);
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      throw new Error("No se recibió la URL de pago");
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.message || e.message || "No se pudo crear el checkout", status: "error", duration: 4000, isClosable: true, position: "bottom-right" });
    } finally {
      setLoading(false);
    }
  };

  if (!isPlanCustom) {
    return (
      <Container maxW="container.lg" py={8}>
        <Card>
          <CardBody>
            <Text>Esta sección está disponible solo para organizadores con plan <strong>A tu medida (GP-Coins)</strong>. Elegí ese plan en Mi Perfil si querés comprar GP-Coins.</Text>
            <Button mt={4} colorScheme="primary" onClick={() => navigate("/profile")}>Ir a Mi Perfil</Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (loadingBalance) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text>Cargando...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack align="stretch" spacing={6}>
        <Heading fontFamily="secondary" color="tertiary" size="lg">GP-COINS</Heading>
        <Text fontFamily="secondary" color="gray.600">1 GP-Coin = 1 entrada. Sin costo mensual. Comprá la cantidad que necesites.</Text>

        <Card>
          <CardBody>
            <HStack spacing={8} flexWrap="wrap">
              <Box>
                <Text fontSize="sm" color="gray.500" fontFamily="secondary">Saldo actual</Text>
                <Heading size="lg" fontFamily="secondary" color="primary">{balance.balance ?? 0} GP-Coins</Heading>
              </Box>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" fontFamily="secondary" mb={4}>Comprar GP-Coins</Heading>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Precio: {totalPurchased === 0 ? (
                <>Clientes nuevos: primeros {NEW_CUSTOMER_MAX} a ${PRICE_NEW} c/u, resto ${PRICE_REGULAR} c/u</>
              ) : (
                <>${PRICE_REGULAR} por GP-Coin</>
              )}
            </Text>
            <HStack align="flex-end" spacing={4} flexWrap="wrap">
              <FormControl maxW="200px">
                <FormLabel fontFamily="secondary" fontSize="sm">Cantidad</FormLabel>
                <Input
                  type="number"
                  min={1}
                  max={50000}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Ej: 100"
                />
              </FormControl>
              {numQty > 0 && (
                <Text fontFamily="secondary" color="gray.600">Total aprox: ${estimatedTotal.toLocaleString("es-AR")}</Text>
              )}
              <Button colorScheme="green" onClick={handleBuy} isLoading={loading} isDisabled={!quantity || numQty < 1}>
                Comprar con Mercado Pago
              </Button>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Heading size="md" fontFamily="secondary" mb={4}>Historial de compras</Heading>
            {purchases.length === 0 ? (
              <Text color="gray.500" fontFamily="secondary">Aún no tenés compras de GP-Coins.</Text>
            ) : (
              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th fontFamily="secondary">Fecha</Th>
                      <Th fontFamily="secondary">Cantidad</Th>
                      <Th fontFamily="secondary">Precio unit.</Th>
                      <Th fontFamily="secondary">Total</Th>
                      <Th fontFamily="secondary">Estado</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {purchases.map((p) => (
                      <Tr key={p._id}>
                        <Td fontFamily="secondary">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("es-AR") : "-"}</Td>
                        <Td>{p.quantity}</Td>
                        <Td>${Number(p.unitPrice).toLocaleString("es-AR")}</Td>
                        <Td>${Number(p.totalAmount).toLocaleString("es-AR")}</Td>
                        <Td>
                          <Badge colorScheme={p.paymentStatus === "approved" ? "green" : p.paymentStatus === "pending" ? "yellow" : "red"}>
                            {p.paymentStatus === "approved" ? "Aprobado" : p.paymentStatus === "pending" ? "Pendiente" : "Rechazado"}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
}

export default SellerGpCoins;
