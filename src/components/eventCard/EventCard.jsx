import { React } from "react";
import {
  Flex,
  Image,
  Box,
  Text,
  Heading,
  Button,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { 
  FiCalendar, 
  FiMapPin, 
  FiDollarSign,
  FiArrowRight 
} from "react-icons/fi";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { getObjDate } from "../../common/utils";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      delay: index * 0.1,
    },
  }),
};

export default function EventCard({
  id,
  pictures,
  title,
  dates,
  addressRef,
  cheapestTicket,
  index = 0,
}) {
  const navigate = useNavigate();

  return (
    <Box
      as={motion.div}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={index}
      w={{ base: "100%", md: "100%" }}
      maxW={{ base: "100%", md: "350px" }}
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.07)"
      cursor="pointer"
      onClick={() => navigate(`/event/${id}`)}
      position="relative"
      _hover={{
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
        transform: "translateY(-8px)",
      }}
      transition="all 0.3s ease"
    >
      {/* Image Container */}
      <Box
        position="relative"
        w="100%"
        h={{ base: "200px", md: "240px" }}
        overflow="hidden"
        bg="gray.100"
      >
        <Image
          src={
            pictures
              ? pictures.startsWith('http') 
                ? pictures 
                : "data:image/png;base64," + pictures
              : "./imagenes/img1.jpeg"
          }
          alt={title}
          w="100%"
          h="100%"
          objectFit="cover"
          transition="transform 0.5s ease"
          _groupHover={{
            transform: "scale(1.1)",
          }}
        />
        {/* Gradient Overlay */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          h="60px"
          bgGradient="linear(to-t, rgba(0,0,0,0.7), transparent)"
        />
      </Box>

      {/* Content */}
      <Flex
        flexDir="column"
        p={{ base: 4, md: 5 }}
        gap={4}
      >
        {/* Title */}
        <Heading
          as="h3"
          fontSize={{ base: "lg", md: "xl" }}
          fontFamily="secondary"
          fontWeight="700"
          color="black"
          lineHeight="1.3"
          noOfLines={2}
          letterSpacing="-0.01em"
        >
          {title}
        </Heading>

        {/* Info Section */}
        <Flex flexDir="column" gap={3}>
          {/* Date */}
          <Flex align="center" gap={3}>
            <Icon
              as={FiCalendar}
              boxSize={5}
              color="gray.500"
              flexShrink={0}
            />
            <Text
              fontFamily="secondary"
              fontSize="sm"
              color="gray.700"
              fontWeight="500"
            >
              {dates?.length > 1 && "Próximo: "}
              {getObjDate(dates[0])?.date} a las {getObjDate(dates[0])?.timeStart}
            </Text>
          </Flex>

          {/* Location */}
          {addressRef?.place && (
            <Flex align="center" gap={3}>
              <Icon
                as={FiMapPin}
                boxSize={5}
                color="gray.500"
                flexShrink={0}
              />
              <Text
                fontFamily="secondary"
                fontSize="sm"
                color="gray.600"
                fontWeight="400"
                noOfLines={1}
              >
                {addressRef.place}
              </Text>
            </Flex>
          )}

          {/* Price */}
          {cheapestTicket?.price && (
            <Flex align="center" justify="space-between" pt={1}>
              <Flex align="center" gap={3}>
                <Icon
                  as={FiDollarSign}
                  boxSize={5}
                  color="gray.500"
                  flexShrink={0}
                />
                <Text
                  fontFamily="secondary"
                  fontSize="sm"
                  color="gray.600"
                  fontWeight="400"
                >
                  Desde
                </Text>
              </Flex>
              <Badge
                bg="black"
                color="white"
                px={3}
                py={1}
                borderRadius="md"
                fontSize="sm"
                fontWeight="600"
                fontFamily="secondary"
              >
                ${cheapestTicket.price}
              </Badge>
            </Flex>
          )}
        </Flex>

        {/* Button */}
        <Button
          w="100%"
          bg="black"
          color="white"
          size="md"
          borderRadius="lg"
          fontFamily="secondary"
          fontWeight="600"
          fontSize="sm"
          mt={2}
          rightIcon={<FiArrowRight />}
          _hover={{
            bg: "#1a1a1a",
            transform: "translateX(4px)",
          }}
          _active={{
            transform: "translateX(0)",
          }}
          transition="all 0.2s"
        >
          Ver detalles
        </Button>
      </Flex>
    </Box>
  );
}
