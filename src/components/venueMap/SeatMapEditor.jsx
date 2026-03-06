import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Select,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

// Colores de marca (Passline) + paleta complementaria para sectores
const PASSLINE_PURPLE = "#B78DEA";
const SECTOR_COLORS = [
  PASSLINE_PURPLE,
  "#2FBF71",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
  "#06B6D4",
  "#A855F7",
  "#F97316",
];

const genId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function snapTo(valuePx, grid = 8) {
  const g = Math.max(1, Number(grid) || 8);
  return Math.round(valuePx / g) * g;
}

function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const rect = entries?.[0]?.contentRect;
      if (!rect) return;
      setSize({ width: rect.width, height: rect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

function computeSeatGridPixelSize({ rows, cols, seatSize, seatGap }) {
  const r = Math.max(1, Number(rows) || 1);
  const c = Math.max(1, Number(cols) || 1);
  const s = clamp(Number(seatSize) || 12, 6, 40);
  const g = clamp(Number(seatGap) || 0, 0, 30);
  const w = c * s + Math.max(0, c - 1) * g;
  const h = r * s + Math.max(0, r - 1) * g;
  return { w, h, r, c, s, g };
}

function computeZonePixelSize({ rows, cols, seatSize, seatGap, padding = 12 }) {
  const headerH = 34; // título + contador
  const outerPad = padding * 2;
  const innerPad = 10 * 2;
  const { w: gridW, h: gridH } = computeSeatGridPixelSize({ rows, cols, seatSize, seatGap });

  // El contenido de butacas se centra y puede escalarse; el contenedor define el “sector”.
  // Mantener un mínimo usable y limitar máximos por UX.
  const w = clamp(gridW + outerPad, 180, 520);
  const h = clamp(headerH + innerPad + gridH, 160, 520);
  return { w, h, gridW, gridH, headerH };
}

function SeatPattern({ rows, cols, color, seatSize, seatGap, containerW, containerH }) {
  const { w: gridW, h: gridH, r: safeRows, c: safeCols, s, g } = computeSeatGridPixelSize({
    rows,
    cols,
    seatSize,
    seatGap,
  });
  const total = safeRows * safeCols;

  const fill = `${String(color || "#000000")}66`;
  const stroke = `${String(color || "#000000")}CC`;

  const usableW = Math.max(1, Number(containerW) || 1);
  const usableH = Math.max(1, Number(containerH) || 1);
  const scale = Math.min(1, usableW / Math.max(1, gridW), usableH / Math.max(1, gridH));
  const scaledSeat = Math.max(1.5, s * scale);
  const scaledGap = Math.max(0, g * scale);

  if (total > 1200) {
    // Evitar miles de nodos: patrón por CSS.
    const dot = Math.max(2, Math.floor(scaledSeat * 0.55));
    const step = Math.max(3, Math.floor(scaledSeat + scaledGap));
    return (
      <Box
        w="100%"
        h="100%"
        bg={`radial-gradient(circle, ${fill} 0 ${dot}px, transparent ${dot + 1}px)`}
        backgroundSize={`${step}px ${step}px`}
      />
    );
  }

  // SVG en pixeles: seatSize/seatGap se ven de verdad.
  const viewW = gridW;
  const viewH = gridH;
  const rPx = Math.max(1.5, (s * 0.42));
  return (
    <Box as="svg" width="100%" height="100%" viewBox={`0 0 ${viewW} ${viewH}`} preserveAspectRatio="xMidYMid meet">
      {Array.from({ length: safeRows }).flatMap((_, rr) =>
        Array.from({ length: safeCols }).map((__, cc) => {
          const cx = cc * (s + g) + s / 2;
          const cy = rr * (s + g) + s / 2;
          return (
            <circle
              // eslint-disable-next-line react/no-array-index-key
              key={`${rr}-${cc}`}
              cx={cx}
              cy={cy}
              r={rPx}
              fill={fill}
              stroke={stroke}
              strokeWidth={Math.max(0.6, s * 0.06)}
            />
          );
        })
      )}
    </Box>
  );
}

export default function SeatMapEditor({
  eventId,
  tickets = [],
  initialVenueMap,
  onSaveVenueMap,
  hideTitle = false,
}) {
  const toast = useToast();
  const stageRef = useRef(null);
  const { width: stageW, height: stageH } = useElementSize(stageRef);

  const initialSeatMap = initialVenueMap?.seatMap;

  const [seatSize, setSeatSize] = useState(initialSeatMap?.stage?.seatSize ?? 14);
  const [seatGap, setSeatGap] = useState(initialSeatMap?.stage?.seatGap ?? 2);
  const [zones, setZones] = useState(() => {
    const z = Array.isArray(initialSeatMap?.zones) ? initialSeatMap.zones : [];
    return z.map((zone) => ({
      id: zone.id || genId(),
      name: zone.name || "Zona",
      color: zone.color || "#000000",
      rows: zone.rows ?? 10,
      cols: zone.cols ?? 10,
      ticketRefs: Array.isArray(zone.ticketRefs) ? zone.ticketRefs : [],
      size: zone.size
        ? { w: Number(zone.size.w ?? zone.size.width ?? 0.28), h: Number(zone.size.h ?? zone.size.height ?? 0.28) }
        : null,
      pos: {
        x: Number(zone.position?.x ?? 0.06),
        y: Number(zone.position?.y ?? 0.28),
      },
    }));
  });
  const [selectedZoneId, setSelectedZoneId] = useState(zones?.[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizar al cambiar de evento / venueMap
  useEffect(() => {
    const nextSeatMap = initialVenueMap?.seatMap;
    setSeatSize(nextSeatMap?.stage?.seatSize ?? 14);
    setSeatGap(nextSeatMap?.stage?.seatGap ?? 2);
    const z = Array.isArray(nextSeatMap?.zones) ? nextSeatMap.zones : [];
    const nextZones = z.map((zone) => ({
      id: zone.id || genId(),
      name: zone.name || "Zona",
      color: zone.color || "#000000",
      rows: zone.rows ?? 10,
      cols: zone.cols ?? 10,
      ticketRefs: Array.isArray(zone.ticketRefs) ? zone.ticketRefs : [],
      size: zone.size
        ? { w: Number(zone.size.w ?? zone.size.width ?? 0.28), h: Number(zone.size.h ?? zone.size.height ?? 0.28) }
        : null,
      pos: {
        x: Number(zone.position?.x ?? 0.06),
        y: Number(zone.position?.y ?? 0.28),
      },
    }));
    setZones(nextZones);
    setSelectedZoneId(nextZones?.[0]?.id || "");
  }, [eventId, initialVenueMap]);

  const ticketsById = useMemo(() => {
    const m = new Map();
    tickets.forEach((t) => m.set(t._id, t));
    return m;
  }, [tickets]);

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) || null,
    [zones, selectedZoneId]
  );

  const totalSeats = useMemo(() => {
    return zones.reduce((acc, z) => acc + (Number(z.rows) || 0) * (Number(z.cols) || 0), 0);
  }, [zones]);

  const addZone = () => {
    const id = genId();
    const newZone = {
      id,
      name: `Zona ${zones.length + 1}`,
      color: SECTOR_COLORS[zones.length % SECTOR_COLORS.length],
      rows: 10,
      cols: 10,
      ticketRefs: [],
      pos: { x: 0.06, y: 0.28 },
    };
    setZones((prev) => [...prev, newZone]);
    setSelectedZoneId(id);
  };

  const deleteZone = (zoneId) => {
    setZones((prev) => {
      const remaining = prev.filter((z) => z.id !== zoneId);
      if (selectedZoneId === zoneId) {
        setSelectedZoneId(remaining?.[0]?.id || "");
      }
      return remaining;
    });
  };

  const updateZone = (zoneId, patch) => {
    setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, ...patch } : z)));
  };

  const autoLayout = () => {
    if (!stageW || !stageH) return;
    const padding = 16;
    const gap = 16;
    let x = padding;
    let y = padding + 120; // dejar espacio visual para la banda de escenario
    let rowH = 0;

    const next = zones.map((z) => {
      const { w, h } = computeZonePixelSize({
        rows: z.rows,
        cols: z.cols,
        seatSize,
        seatGap,
      });

      if (x + w > stageW - padding) {
        x = padding;
        y += rowH + gap;
        rowH = 0;
      }

      rowH = Math.max(rowH, h);

      const normX = clamp(x / Math.max(1, stageW), 0, 1);
      const normY = clamp(y / Math.max(1, stageH), 0, 1);

      x += w + gap;

      return { ...z, pos: { x: normX, y: normY } };
    });

    setZones(next);
  };

  const validate = () => {
    if (zones.length === 0) {
      toast({
        title: "Sin zonas",
        description: "Creá al menos una zona de butacas para poder guardar.",
        status: "warning",
        duration: 3000,
      });
      return false;
    }
    const invalid = zones.find(
      (z) =>
        !z.name ||
        (Number(z.rows) || 0) <= 0 ||
        (Number(z.cols) || 0) <= 0 ||
        !Array.isArray(z.ticketRefs) ||
        z.ticketRefs.length > 1
    );
    if (invalid) {
      toast({
        title: "Zonas incompletas",
        description: "Cada zona debe tener nombre y filas/columnas válidas. El ticket asociado es opcional (máx. 1).",
        status: "error",
        duration: 4000,
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!eventId) return;
    if (!validate()) return;
    setIsSaving(true);
    try {
      const base =
        initialVenueMap && typeof initialVenueMap === "object"
          ? initialVenueMap
          : {};

      const seatMap = {
        version: 1,
        stage: {
          seatSize: Number(seatSize) || 14,
          seatGap: Number(seatGap) || 2,
        },
        zones: zones.map((z) => ({
          id: z.id,
          name: z.name,
          color: z.color || "#000000",
          rows: Number(z.rows) || 1,
          cols: Number(z.cols) || 1,
          ticketRefs: z.ticketRefs,
          size: z.size ? { w: clamp(Number(z.size.w) || 0, 0.08, 0.98), h: clamp(Number(z.size.h) || 0, 0.08, 0.98) } : undefined,
          position: {
            x: clamp(Number(z.pos?.x) || 0, 0, 1),
            y: clamp(Number(z.pos?.y) || 0, 0, 1),
          },
        })),
      };

      await onSaveVenueMap({
        ...base,
        seatMap,
      });

      toast({
        title: "Mapa guardado",
        description: "El mapa de butacas quedó configurado.",
        status: "success",
        duration: 3000,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo guardar el mapa de butacas.",
        status: "error",
        duration: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card boxShadow="xl" borderRadius="xl" bg="white" border="1px solid" borderColor="gray.200">
      <CardBody p={6}>
        {hideTitle ? (
          <Flex justify="flex-end" align="center" mb={4} gap={3} flexWrap="wrap">
            <Button
              variant="outline"
              borderColor="gray.300"
              color="black"
              _hover={{ bg: "gray.50" }}
              borderRadius="lg"
              fontFamily="secondary"
              onClick={autoLayout}
              isDisabled={zones.length === 0}
            >
              Auto-ordenar
            </Button>
            <Button
              bg="black"
              color="white"
              _hover={{ bg: "#1a1a1a" }}
              borderRadius="lg"
              fontFamily="secondary"
              fontWeight="600"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Guardar mapa
            </Button>
          </Flex>
        ) : (
          <Flex justify="space-between" align="center" mb={4} gap={4} flexWrap="wrap">
            <Box>
              <Heading as="h2" fontSize="xl" fontFamily="secondary" color="tertiary" fontWeight="600">
                Mapa de Butacas (opcional)
              </Heading>
              <Text fontSize="sm" color="gray.600" fontFamily="secondary" mt={1}>
                Creá zonas de butacas por filas/columnas, asociá 1 ticket por zona y ordenalas en el escenario.
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                variant="outline"
                borderColor="gray.300"
                color="black"
                _hover={{ bg: "gray.50" }}
                borderRadius="lg"
                fontFamily="secondary"
                onClick={autoLayout}
                isDisabled={zones.length === 0}
              >
                Auto-ordenar
              </Button>
              <Button
                bg="black"
                color="white"
                _hover={{ bg: "#1a1a1a" }}
                borderRadius="lg"
                fontFamily="secondary"
                fontWeight="600"
                onClick={handleSave}
                isLoading={isSaving}
              >
                Guardar mapa
              </Button>
            </HStack>
          </Flex>
        )}

        <Divider my={4} />

        <VStack align="stretch" spacing={4}>
          <HStack spacing={4} align="start" flexWrap="wrap">
            <FormControl maxW={{ base: "100%", md: "220px" }}>
              <FormLabel fontFamily="secondary" fontWeight="600" mb={2}>
                Tamaño de butaca: <b>{seatSize}</b>
              </FormLabel>
              <Slider
                value={seatSize}
                min={8}
                max={28}
                step={1}
                onChange={(v) => setSeatSize(v)}
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg={PASSLINE_PURPLE} />
                </SliderTrack>
                <SliderThumb bg={PASSLINE_PURPLE} />
              </Slider>
            </FormControl>
            <FormControl maxW={{ base: "100%", md: "220px" }}>
              <FormLabel fontFamily="secondary" fontWeight="600" mb={2}>
                Separación: <b>{seatGap}</b>
              </FormLabel>
              <Slider
                value={seatGap}
                min={0}
                max={12}
                step={1}
                onChange={(v) => setSeatGap(v)}
              >
                <SliderTrack bg="gray.200">
                  <SliderFilledTrack bg={PASSLINE_PURPLE} />
                </SliderTrack>
                <SliderThumb bg={PASSLINE_PURPLE} />
              </Slider>
            </FormControl>
            <Box flex="1" />
            <Button
              bg={`linear-gradient(135deg, ${PASSLINE_PURPLE} 0%, #9D6DD8 100%)`}
              color="white"
              _hover={{ filter: "brightness(0.96)" }}
              borderRadius="lg"
              fontFamily="secondary"
              onClick={addZone}
            >
              + Agregar zona
            </Button>
          </HStack>

          <Box
            ref={stageRef}
            position="relative"
            border="2px solid"
            borderColor="gray.200"
            borderRadius="xl"
            bg="white"
            overflow="hidden"
            h={{ base: "360px", md: "520px" }}
          >
            {/* Banda de escenario estilo seatmap */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="92px"
              bg="gray.100"
              borderBottom="1px solid"
              borderColor="gray.200"
            >
              <Flex h="100%" align="center" justify="center" position="relative">
                <Text
                  fontFamily="secondary"
                  fontWeight="800"
                  letterSpacing="0.22em"
                  color="gray.600"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  ESCENARIO
                </Text>
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  h="3px"
                  bg={`linear-gradient(90deg, ${PASSLINE_PURPLE} 0%, #9D6DD8 100%)`}
                />
              </Flex>
            </Box>

            <Box position="absolute" top="96px" left={3} right={3}>
              <Flex justify="space-between" align="center" gap={4} flexWrap="wrap">
                <Text fontFamily="secondary" fontSize="sm" color="gray.600">
                  Tip: arrastrá los sectores para acomodarlos.
                </Text>
                <Text fontFamily="secondary" fontSize="sm" color="gray.600">
                  Zonas: <b>{zones.length}</b> — Butacas totales: <b>{totalSeats}</b>
                </Text>
              </Flex>
            </Box>

            {zones.map((z) => {
              const computed = computeZonePixelSize({
                rows: z.rows,
                cols: z.cols,
                seatSize,
                seatGap,
              });
              const w = z.size?.w ? clamp(Number(z.size.w) || 0, 0.08, 0.98) * stageW : computed.w;
              const h = z.size?.h ? clamp(Number(z.size.h) || 0, 0.08, 0.98) * stageH : computed.h;
              const left = (Number(z.pos?.x) || 0) * stageW;
              const top = (Number(z.pos?.y) || 0) * stageH;
              const isSelected = z.id === selectedZoneId;

              return (
                <MotionBox
                  key={z.id}
                  position="absolute"
                  left={left}
                  top={top}
                  w={`${w}px`}
                  h={`${h}px`}
                  borderRadius="lg"
                  border="2px solid"
                  borderColor={isSelected ? PASSLINE_PURPLE : "blackAlpha.200"}
                  bg="rgba(243, 230, 215, 0.9)"
                  boxShadow={isSelected ? "0 10px 28px rgba(183,141,234,0.25)" : "md"}
                  cursor="grab"
                  style={{ willChange: "transform" }}
                  drag
                  dragMomentum={false}
                  dragElastic={0.05}
                  dragConstraints={stageRef}
                  onDragStart={() => setSelectedZoneId(z.id)}
                  onDragEnd={(_, info) => {
                    const startLeft = (Number(z.pos?.x) || 0) * stageW;
                    const startTop = (Number(z.pos?.y) || 0) * stageH;
                    const rawLeft = startLeft + (info?.offset?.x || 0);
                    const rawTop = startTop + (info?.offset?.y || 0);
                    const snappedLeft = snapTo(rawLeft, 8);
                    const snappedTop = snapTo(rawTop, 8);
                    const nextLeft = clamp(snappedLeft, 0, Math.max(0, stageW - w));
                    const nextTop = clamp(snappedTop, 0, Math.max(0, stageH - h));
                    const nx = clamp(nextLeft / Math.max(1, stageW), 0, 1);
                    const ny = clamp(nextTop / Math.max(1, stageH), 0, 1);
                    updateZone(z.id, { pos: { x: nx, y: ny } });
                  }}
                  onClick={() => setSelectedZoneId(z.id)}
                  p={3}
                  transition="box-shadow 120ms ease, border-color 120ms ease"
                >
                  <Flex justify="space-between" align="center" gap={2}>
                    <HStack spacing={2} minW={0}>
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg={z.color || "black"}
                        boxShadow="inset 0 0 0 2px rgba(255,255,255,0.8)"
                      />
                      <Text fontFamily="secondary" fontWeight="700" fontSize="sm" noOfLines={1}>
                        {z.name}
                      </Text>
                    </HStack>
                    <Text fontFamily="secondary" fontSize="xs" color="gray.600">
                      {(Number(z.rows) || 0) * (Number(z.cols) || 0)}
                    </Text>
                  </Flex>

                  <Box
                    mt={2}
                    borderRadius="md"
                    bg="rgba(255,255,255,0.55)"
                    border="1px solid"
                    borderColor="blackAlpha.200"
                    p={2}
                    h={`calc(100% - ${computed.headerH}px - 16px)`}
                  >
                    <Box
                      borderRadius="sm"
                      w="100%"
                      h="100%"
                      bg="rgba(255,255,255,0.35)"
                      border="1px solid"
                      borderColor="blackAlpha.200"
                      overflow="hidden"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <SeatPattern
                        rows={z.rows}
                        cols={z.cols}
                        color={z.color}
                        seatSize={seatSize}
                        seatGap={seatGap}
                        containerW={Math.max(1, w - 24)}
                        containerH={Math.max(1, h - computed.headerH - 32)}
                      />
                    </Box>
                  </Box>

                  {/* Resize handle: agrandar/achicar zonas fácil */}
                  <Box
                    position="absolute"
                    right="6px"
                    bottom="6px"
                    w="14px"
                    h="14px"
                    borderRadius="4px"
                    bg={isSelected ? PASSLINE_PURPLE : "blackAlpha.300"}
                    cursor="nwse-resize"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedZoneId(z.id);
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startW = w;
                      const startH = h;

                      const onMove = (ev) => {
                        const dx = (ev.clientX || 0) - startX;
                        const dy = (ev.clientY || 0) - startY;
                        const rawW = startW + dx;
                        const rawH = startH + dy;
                        const snappedW = snapTo(rawW, 8);
                        const snappedH = snapTo(rawH, 8);
                        const minW = 160;
                        const minH = 140;
                        const maxW = Math.max(minW, stageW - left);
                        const maxH = Math.max(minH, stageH - top);
                        const nextW = clamp(snappedW, minW, maxW);
                        const nextH = clamp(snappedH, minH, maxH);
                        updateZone(z.id, {
                          size: {
                            w: clamp(nextW / Math.max(1, stageW), 0.08, 0.98),
                            h: clamp(nextH / Math.max(1, stageH), 0.08, 0.98),
                          },
                        });
                      };

                      const onUp = () => {
                        window.removeEventListener("pointermove", onMove);
                        window.removeEventListener("pointerup", onUp);
                      };

                      window.addEventListener("pointermove", onMove);
                      window.addEventListener("pointerup", onUp);
                    }}
                  />
                </MotionBox>
              );
            })}
          </Box>

          {zones.length > 0 && (
            <Box p={4} bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl">
              <Heading as="h4" fontSize="sm" fontFamily="secondary" color="tertiary" fontWeight="700" mb={2}>
                Leyenda
              </Heading>
              <Flex gap={3} flexWrap="wrap">
                {zones.map((z) => (
                  <HStack
                    key={z.id}
                    spacing={2}
                    px={3}
                    py={2}
                    borderRadius="full"
                    border="1px solid"
                    borderColor={z.id === selectedZoneId ? PASSLINE_PURPLE : "gray.200"}
                    bg="gray.50"
                    cursor="pointer"
                    onClick={() => setSelectedZoneId(z.id)}
                  >
                    <Box w="10px" h="10px" borderRadius="full" bg={z.color || "black"} />
                    <Text fontFamily="secondary" fontSize="sm" color="gray.700" noOfLines={1} maxW="220px">
                      {z.name}
                    </Text>
                  </HStack>
                ))}
              </Flex>
            </Box>
          )}

          <Divider />

          <Box>
            <Heading as="h3" fontSize="md" fontFamily="secondary" color="tertiary" fontWeight="600" mb={3}>
              Configuración de zonas
            </Heading>

            {zones.length === 0 ? (
              <Text fontFamily="secondary" color="gray.600">
                Aún no hay zonas. Creá una zona para empezar.
              </Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {zones.map((z) => {
                  const selectedTicketId = z.ticketRefs?.[0] || "";
                  const ticket = ticketsById.get(selectedTicketId);
                  const isSelected = z.id === selectedZoneId;
                  const seats = (Number(z.rows) || 0) * (Number(z.cols) || 0);

                  return (
                    <Box
                      key={z.id}
                      p={4}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={isSelected ? "black" : "gray.200"}
                      bg="white"
                      cursor="pointer"
                      onClick={() => setSelectedZoneId(z.id)}
                    >
                      <HStack justify="space-between" align="start" spacing={4} flexWrap="wrap">
                        <VStack align="stretch" spacing={3} flex="1" minW={{ base: "100%", md: "520px" }}>
                          <HStack spacing={3} align="center">
                            <Input
                              value={z.name}
                              onChange={(e) => updateZone(z.id, { name: e.target.value })}
                              placeholder="Nombre de la zona"
                              fontFamily="secondary"
                              borderRadius="lg"
                            />
                            <Input
                              type="color"
                              value={z.color || "#000000"}
                              onChange={(e) => updateZone(z.id, { color: e.target.value })}
                              w="56px"
                              h="40px"
                              p={1}
                              borderRadius="md"
                            />
                          </HStack>

                          <HStack spacing={3} flexWrap="wrap">
                            <FormControl maxW={{ base: "100%", md: "200px" }}>
                              <FormLabel fontFamily="secondary" fontSize="sm" mb={1}>
                                Filas
                              </FormLabel>
                              <Input
                                type="number"
                                value={z.rows}
                                onChange={(e) => updateZone(z.id, { rows: clamp(Number(e.target.value || 0), 1, 200) })}
                                borderRadius="lg"
                              />
                            </FormControl>
                            <FormControl maxW={{ base: "100%", md: "200px" }}>
                              <FormLabel fontFamily="secondary" fontSize="sm" mb={1}>
                                Columnas
                              </FormLabel>
                              <Input
                                type="number"
                                value={z.cols}
                                onChange={(e) => updateZone(z.id, { cols: clamp(Number(e.target.value || 0), 1, 200) })}
                                borderRadius="lg"
                              />
                            </FormControl>
                            <Box flex="1" />
                            <Box>
                              <Text fontFamily="secondary" fontSize="sm" color="gray.600" mt={{ base: 0, md: 7 }}>
                                Butacas: <b>{seats}</b>
                              </Text>
                            </Box>
                          </HStack>

                          <FormControl>
                            <FormLabel fontFamily="secondary" fontSize="sm" mb={1}>
                              Ticket asociado (1 por zona)
                            </FormLabel>
                            <Select
                              value={selectedTicketId}
                              onChange={(e) =>
                                updateZone(z.id, { ticketRefs: e.target.value ? [e.target.value] : [] })
                              }
                              placeholder="Seleccionar ticket"
                              fontFamily="secondary"
                              borderRadius="lg"
                            >
                              {tickets.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.title} — ${Number(t.price || 0).toLocaleString()}
                                </option>
                              ))}
                            </Select>
                            {ticket && (
                              <Text fontFamily="secondary" fontSize="sm" color="gray.600" mt={2}>
                                Precio: <b>${Number(ticket.price || 0).toLocaleString()}</b>
                              </Text>
                            )}
                          </FormControl>
                        </VStack>

                        <Button
                          variant="outline"
                          borderColor="gray.300"
                          color="black"
                          _hover={{ bg: "gray.50" }}
                          borderRadius="lg"
                          fontFamily="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteZone(z.id);
                          }}
                        >
                          Eliminar
                        </Button>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            )}
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
}

