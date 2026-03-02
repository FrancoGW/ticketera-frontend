import React from "react";
import { Box, Text } from "@chakra-ui/react";
import { getPasswordStrength, PASSWORD_REQUIREMENTS } from "../../utils/passwordValidation";

/**
 * Barra de fortaleza de contraseña (rojo → verde) y listado de requisitos con check.
 * @param {string} password - Valor actual del campo contraseña
 */
export default function PasswordStrengthBar({ password }) {
  const { fulfilled, percent } = getPasswordStrength(password);

  // Color de la barra: rojo (0%) → verde (100%)
  const barColor =
    percent <= 20
      ? "#e53e3e"
      : percent <= 40
        ? "#dd6b20"
        : percent <= 60
          ? "#d69e2e"
          : percent <= 80
            ? "#38a169"
            : "#25855a";

  return (
    <Box mt={2} mb={2}>
      <Text fontSize="xs" color="gray.500" mb={1}>
        La contraseña debe tener:
      </Text>
      {/* Barra de progreso */}
      <Box
        w="100%"
        h="8px"
        bg="gray.200"
        borderRadius="full"
        overflow="hidden"
        mb={3}
      >
        <Box
          h="100%"
          w={`${percent}%`}
          bg={barColor}
          borderRadius="full"
          transition="width 0.2s ease, background 0.2s ease"
        />
      </Box>
      {/* Lista de requisitos con estado cumplido / no cumplido */}
      <Box as="ul" fontSize="xs" color="gray.600" pl={4} listStyleType="none">
        {PASSWORD_REQUIREMENTS.map((req, i) => (
          <Box
            as="li"
            key={i}
            display="flex"
            alignItems="center"
            gap={2}
            mb={0.5}
            color={fulfilled[i] ? "green.600" : "gray.500"}
            transition="color 0.2s ease"
          >
            <Box
              as="span"
              fontSize="sm"
              aria-hidden
            >
              {fulfilled[i] ? "✓" : "○"}
            </Box>
            {req}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
