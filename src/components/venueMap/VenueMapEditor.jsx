import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Divider,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast,
} from "@chakra-ui/react";
import L from "leaflet";
import "@geoman-io/leaflet-geoman-free";
import { getBase64FromFile } from "../../common/utils";

const ZOOM_MIN = -4;
const ZOOM_MAX = 2;

const genId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
};

function toPxLatLngs(polygonNorm, w, h) {
  return polygonNorm.map((p) => L.latLng(p.y * h, p.x * w));
}

function toNormPolygon(layer, w, h) {
  const latLngs = layer.getLatLngs?.()?.[0] || [];
  return latLngs.map((ll) => ({
    x: Math.min(1, Math.max(0, ll.lng / w)),
    y: Math.min(1, Math.max(0, ll.lat / h)),
  }));
}

export default function VenueMapEditor({
  eventId,
  tickets = [],
  initialVenueMap,
  onSaveVenueMap,
}) {
  const toast = useToast();
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const layersByZoneIdRef = useRef(new Map());

  const [imageUrl, setImageUrl] = useState(initialVenueMap?.imageUrl || "");
  const [imageMime, setImageMime] = useState("");
  const [imageWidth, setImageWidth] = useState(initialVenueMap?.imageWidth || 0);
  const [imageHeight, setImageHeight] = useState(initialVenueMap?.imageHeight || 0);
  const [zones, setZones] = useState(initialVenueMap?.zones || []);
  const [selectedZoneId, setSelectedZoneId] = useState(zones?.[0]?.id || "");
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(0);

  // Mantener state sincronizado si cambia el evento
  useEffect(() => {
    setImageUrl(initialVenueMap?.imageUrl || "");
    setImageMime("");
    setImageWidth(initialVenueMap?.imageWidth || 0);
    setImageHeight(initialVenueMap?.imageHeight || 0);
    setZones(initialVenueMap?.zones || []);
    setSelectedZoneId((initialVenueMap?.zones || [])?.[0]?.id || "");
  }, [eventId, initialVenueMap]);

  const ticketsById = useMemo(() => {
    const m = new Map();
    tickets.forEach((t) => {
      const id = t?._id || t?.id;
      if (id) m.set(id, t);
    });
    return m;
  }, [tickets]);

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId),
    [zones, selectedZoneId]
  );

  const displayImageUrl = useMemo(() => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://") || imageUrl.startsWith("data:")) {
      return imageUrl;
    }
    // imageUrl viene como base64 sin prefijo; Leaflet necesita un src válido.
    const mime = imageMime || "image/png";
    return `data:${mime};base64,${imageUrl}`;
  }, [imageUrl, imageMime]);

  const rebuildMap = () => {
    if (!mapElRef.current || !displayImageUrl || !imageWidth || !imageHeight) return;

    // Cleanup
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      overlayRef.current = null;
      layersByZoneIdRef.current = new Map();
    }

    const map = L.map(mapElRef.current, {
      crs: L.CRS.Simple,
      minZoom: ZOOM_MIN,
      maxZoom: ZOOM_MAX,
      zoom: 0,
      attributionControl: false,
      preferCanvas: true,
    });

    // Evitar zoom con scroll (trackpad/wheel) porque es incómodo en este caso.
    map.scrollWheelZoom.disable();

    const bounds = L.latLngBounds([0, 0], [imageHeight, imageWidth]);
    const overlay = L.imageOverlay(displayImageUrl, bounds).addTo(map);
    overlayRef.current = overlay;
    map.fitBounds(bounds, { padding: [10, 10] });
    setZoom(map.getZoom());

    map.on("zoomend", () => {
      setZoom(map.getZoom());
    });

    // Controles de dibujo (solo polígonos)
    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: false,
      cutPolygon: false,
      removalMode: true,
    });

    // Cargar zonas existentes
    zones.forEach((z) => {
      const latLngs = toPxLatLngs(z.polygon || [], imageWidth, imageHeight);
      if (latLngs.length < 3) return;
      const layer = L.polygon(latLngs, {
        color: z.color || "#000000",
        weight: 2,
        fillColor: z.color || "#000000",
        fillOpacity: 0.18,
      }).addTo(map);
      layersByZoneIdRef.current.set(z.id, layer);
      layer.on("click", () => setSelectedZoneId(z.id));
      layer.on("pm:edit", () => {
        setZones((prev) =>
          prev.map((pz) =>
            pz.id === z.id
              ? { ...pz, polygon: toNormPolygon(layer, imageWidth, imageHeight) }
              : pz
          )
        );
      });
    });

    map.on("pm:create", (e) => {
      const layer = e.layer;
      const id = genId();
      const color = "#000000";
      const polygon = toNormPolygon(layer, imageWidth, imageHeight);

      // Guardrail: zona-only => obligar a elegir ticket luego, pero no bloquear creación
      const newZone = {
        id,
        name: `Zona ${zones.length + 1}`,
        color,
        polygon,
        ticketRefs: [],
      };

      layer.setStyle({
        color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 2,
      });
      layersByZoneIdRef.current.set(id, layer);
      layer.on("click", () => setSelectedZoneId(id));
      layer.on("pm:edit", () => {
        setZones((prev) =>
          prev.map((pz) =>
            pz.id === id
              ? { ...pz, polygon: toNormPolygon(layer, imageWidth, imageHeight) }
              : pz
          )
        );
      });

      setZones((prev) => [...prev, newZone]);
      setSelectedZoneId(id);
    });

    mapRef.current = map;
  };

  // Rebuild cuando hay imagen lista o cambian zonas por cambio de evento
  useEffect(() => {
    rebuildMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, displayImageUrl, imageWidth, imageHeight]);

  // Highlight zona seleccionada
  useEffect(() => {
    layersByZoneIdRef.current.forEach((layer, zoneId) => {
      const z = zones.find((x) => x.id === zoneId);
      const baseColor = z?.color || "#000000";
      layer.setStyle({
        color: zoneId === selectedZoneId ? "#000000" : baseColor,
        weight: zoneId === selectedZoneId ? 3 : 2,
        fillColor: baseColor,
        fillOpacity: 0.18,
      });
    });
  }, [selectedZoneId, zones]);

  const handleUploadImage = async (file) => {
    if (!file) return;
    // Para planos (venue maps) permitimos imágenes más pesadas que 1MB.
    // Igual se comprime antes de enviarse.
    if (!String(file.type || "").includes("image")) {
      toast({
        title: "El archivo debe ser una imagen",
        status: "error",
        duration: 3000,
      });
      return;
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "La imagen es demasiado grande",
        description: "Máximo 10MB. Elegí una versión más liviana del plano.",
        status: "error",
        duration: 4000,
      });
      return;
    }
    const base64 = await getBase64FromFile(file);
    setImageMime(file.type || "image/png");

    // Obtener dimensiones reales para CRS.Simple
    const img = new Image();
    img.onload = () => {
      setImageWidth(img.naturalWidth);
      setImageHeight(img.naturalHeight);
      setImageUrl(base64); // base64 sin prefix, backend lo sube a Cloudinary
      setZones([]);
      setSelectedZoneId("");
    };
    img.src = `data:${file.type || "image/png"};base64,${base64}`;
  };

  const updateZone = (zoneId, patch) => {
    setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, ...patch } : z)));
  };

  const deleteZone = (zoneId) => {
    const layer = layersByZoneIdRef.current.get(zoneId);
    if (layer && mapRef.current) {
      mapRef.current.removeLayer(layer);
    }
    layersByZoneIdRef.current.delete(zoneId);
    setZones((prev) => prev.filter((z) => z.id !== zoneId));
    if (selectedZoneId === zoneId) setSelectedZoneId("");
  };

  const handleSave = async () => {
    // Validaciones mínimas para no romper el flujo
    if (!eventId) return;
    if (!imageUrl || !imageWidth || !imageHeight) {
      toast({
        title: "Falta el plano",
        description: "Subí una imagen de plano/venue para poder dibujar zonas.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (zones.length === 0) {
      toast({
        title: "Sin zonas",
        description: "Dibujá al menos una zona para poder guardarla.",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    const invalid = zones.find((z) => {
      if (!z.name) return true;
      if (!Array.isArray(z.polygon) || z.polygon.length < 3) return true;
      // El ticket por zona es opcional (0 o 1). Solo invalidamos si hay más de 1.
      if (!Array.isArray(z.ticketRefs)) return false;
      return z.ticketRefs.length > 1;
    });
    if (invalid) {
      toast({
        title: "Zonas incompletas",
        description: "Cada zona debe tener nombre y un polígono válido. El ticket asociado es opcional (máx. 1).",
        status: "error",
        duration: 4000,
      });
      return;
    }

    // Normalizar: ticketRefs puede ser [] (opcional) o [ticketId] (máx 1)
    const zonesToSave = zones.map((z) => ({
      ...z,
      ticketRefs: Array.isArray(z.ticketRefs) ? z.ticketRefs : [],
    }));

    setIsSaving(true);
    try {
      await onSaveVenueMap({
        version: 1,
        imageUrl,
        imageWidth,
        imageHeight,
        zones: zonesToSave.map((z) => ({
          id: z.id,
          name: z.name,
          color: z.color || "#000000",
          polygon: z.polygon,
          ticketRefs: z.ticketRefs,
        })),
      });
      toast({
        title: "Mapa guardado",
        description: "Las zonas quedaron asociadas a sus tickets.",
        status: "success",
        duration: 3000,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo guardar el mapa.",
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
        <Flex justify="space-between" align="center" mb={4} gap={4} flexWrap="wrap">
          <Box>
            <Heading as="h2" fontSize="xl" fontFamily="secondary" color="tertiary" fontWeight="600">
              Mapa de Zonas (opcional)
            </Heading>
            <Text fontSize="sm" color="gray.600" fontFamily="secondary" mt={1}>
              Subí un plano, dibujá zonas y asociá 1 ticket por zona (precio incluido).
            </Text>
          </Box>
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

        <Divider my={4} />

        <VStack align="stretch" spacing={4}>
          <FormControl>
            <FormLabel fontFamily="secondary" fontWeight="600">
              Imagen de plano (JPG/PNG)
            </FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadImage(e.target.files?.[0])}
              borderRadius="lg"
              borderColor="gray.300"
              borderWidth="2px"
              _focus={{ borderColor: "primary", boxShadow: "0 0 0 1px primary" }}
            />
          </FormControl>

          {imageUrl && imageWidth && imageHeight ? (
            <Box
              border="2px solid"
              borderColor="gray.200"
              borderRadius="xl"
              overflow="hidden"
              bg="gray.50"
            >
              <Box ref={mapElRef} h={{ base: "360px", md: "520px" }} w="100%" />
              <Box px={4} py={3} bg="white" borderTop="1px solid" borderColor="gray.200">
                <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
                  <Text fontFamily="secondary" fontSize="sm" color="gray.600">
                    Zoom
                  </Text>
                  <Box flex="1" minW={{ base: "220px", md: "360px" }}>
                    <Slider
                      value={zoom}
                      min={ZOOM_MIN}
                      max={ZOOM_MAX}
                      step={0.25}
                      onChange={(v) => {
                        setZoom(v);
                        mapRef.current?.setZoom(v, { animate: false });
                      }}
                    >
                      <SliderTrack bg="gray.200">
                        <SliderFilledTrack bg="black" />
                      </SliderTrack>
                      <SliderThumb bg="black" />
                    </Slider>
                  </Box>
                  <Text fontFamily="secondary" fontSize="sm" color="gray.600" minW="44px" textAlign="right">
                    {zoom.toFixed(2)}
                  </Text>
                </Flex>
              </Box>
            </Box>
          ) : (
            <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
              <Text fontFamily="secondary" color="gray.600">
                Subí una imagen para habilitar el editor de zonas.
              </Text>
            </Box>
          )}

          <Divider />

          <Box>
            <Heading as="h3" fontSize="md" fontFamily="secondary" color="tertiary" fontWeight="600" mb={3}>
              Zonas
            </Heading>

            {zones.length === 0 ? (
              <Text fontFamily="secondary" color="gray.600">
                Aún no hay zonas. Usá las herramientas del mapa para dibujar una (polígono o rectángulo).
              </Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {zones.map((z) => {
                  const selectedTicketId = z.ticketRefs?.[0] || "";
                  const ticket = ticketsById.get(selectedTicketId);
                  return (
                    <Box
                      key={z.id}
                      p={4}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor={z.id === selectedZoneId ? "black" : "gray.200"}
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

                          <FormControl>
                            <FormLabel fontFamily="secondary" fontSize="sm" mb={1}>
                              Ticket asociado (1 por zona)
                            </FormLabel>
                            <Select
                              value={selectedTicketId}
                              onChange={(e) => updateZone(z.id, { ticketRefs: e.target.value ? [e.target.value] : [] })}
                              placeholder="Seleccionar ticket"
                              fontFamily="secondary"
                              borderRadius="lg"
                            >
                              {tickets
                                .map((t) => ({
                                  ...t,
                                  __id: t?._id || t?.id,
                                  __title: t?.title || t?.name || "Ticket",
                                }))
                                .filter((t) => t.__id)
                                .map((t) => (
                                  <option key={t.__id} value={t.__id}>
                                    {t.__title} — ${Number(t.price || 0).toLocaleString()}
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

