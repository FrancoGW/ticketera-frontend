import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Flex,
} from "@chakra-ui/react";
import L from "leaflet";

const ZOOM_MIN = -4;
const ZOOM_MAX = 2;

function toPxLatLngs(polygonNorm, w, h) {
  return (polygonNorm || []).map((p) => L.latLng(p.y * h, p.x * w));
}

export default function VenueMapSelector({
  venueMap,
  tickets = [],
  selectedZoneId,
  onSelectZone,
}) {
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const [zoom, setZoom] = useState(0);

  const ticketsById = useMemo(() => {
    const m = new Map();
    tickets.forEach((t) => m.set(t._id, t));
    return m;
  }, [tickets]);

  const imageUrl = venueMap?.imageUrl;
  const w = venueMap?.imageWidth;
  const h = venueMap?.imageHeight;
  const zones = Array.isArray(venueMap?.zones) ? venueMap.zones : [];

  const displayImageUrl = useMemo(() => {
    if (!imageUrl) return "";
    if (String(imageUrl).startsWith("http://") || String(imageUrl).startsWith("https://") || String(imageUrl).startsWith("data:")) {
      return imageUrl;
    }
    // Fallback: si alguna vez llega base64 pelado, mostrarlo como PNG
    return `data:image/png;base64,${imageUrl}`;
  }, [imageUrl]);

  useEffect(() => {
    if (!mapElRef.current || !displayImageUrl || !w || !h) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapElRef.current, {
      crs: L.CRS.Simple,
      minZoom: ZOOM_MIN,
      maxZoom: ZOOM_MAX,
      zoom: 0,
      attributionControl: false,
      zoomControl: true,
      preferCanvas: true,
    });

    map.scrollWheelZoom.disable();

    const bounds = L.latLngBounds([0, 0], [h, w]);
    L.imageOverlay(displayImageUrl, bounds).addTo(map);
    map.fitBounds(bounds, { padding: [10, 10] });
    setZoom(map.getZoom());
    map.on("zoomend", () => setZoom(map.getZoom()));

    zones.forEach((z) => {
      const latLngs = toPxLatLngs(z.polygon || [], w, h);
      if (latLngs.length < 3) return;
      const ticketId = z.ticketRefs?.[0];
      const ticket = ticketId ? ticketsById.get(ticketId) : null;
      const isAvailable = !!ticket;

      const color = z.color || "#000000";
      const layer = L.polygon(latLngs, {
        color: isAvailable ? color : "#999999",
        fillColor: isAvailable ? color : "#999999",
        fillOpacity: isAvailable ? 0.18 : 0.06,
        weight: z.id === selectedZoneId ? 3 : 2,
      }).addTo(map);

      layer.on("click", () => {
        if (!isAvailable) return;
        onSelectZone?.(z);
      });
    });

    mapRef.current = map;
  }, [displayImageUrl, w, h, zones, ticketsById, selectedZoneId, onSelectZone]);

  if (!displayImageUrl || !w || !h || zones.length === 0) return null;

  return (
    <Card boxShadow="xl" borderRadius="xl" bg="white">
      <CardBody p={6}>
        <VStack align="stretch" spacing={3}>
          <Box>
            <Heading as="h2" fontSize="xl" fontFamily="secondary" color="tertiary" fontWeight="600">
              Elegí tu zona
            </Heading>
            <Text fontSize="sm" color="gray.600" fontFamily="secondary">
              Tocá una zona del plano para ver su ticket y precio.
            </Text>
          </Box>
          <Box border="2px solid" borderColor="gray.200" borderRadius="xl" overflow="hidden" bg="gray.50">
            <Box ref={mapElRef} h={{ base: "320px", md: "420px" }} w="100%" />
            <Box px={4} py={3} bg="white" borderTop="1px solid" borderColor="gray.200">
              <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
                <Text fontFamily="secondary" fontSize="sm" color="gray.600">
                  Zoom
                </Text>
                <Box flex="1" minW={{ base: "220px", md: "320px" }}>
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
        </VStack>
      </CardBody>
    </Card>
  );
}

