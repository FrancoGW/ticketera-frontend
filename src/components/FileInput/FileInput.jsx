import { useRef } from "react";
import { Box, Button, Flex, Text, Icon } from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";

/**
 * FileInput — reemplaza el input nativo de archivo con un botón de marca.
 *
 * Props:
 *  - name, accept, onChange: igual que el input nativo
 *  - value: nombre del archivo seleccionado (string), para mostrar en el label
 *  - placeholder: texto cuando no hay archivo seleccionado
 *  - size: "sm" | "md" (default "md")
 *  - isDisabled
 */
const FileInput = ({
  name,
  accept,
  onChange,
  value,
  placeholder = "Ningún archivo seleccionado",
  size = "md",
  isDisabled = false,
  ...rest
}) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (!isDisabled) inputRef.current?.click();
  };

  const handleChange = (e) => {
    if (onChange) onChange(e);
  };

  const isSm = size === "sm";

  return (
    <Flex align="center" gap={2} flexWrap="wrap">
      {/* Input nativo oculto */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        onChange={handleChange}
        style={{ display: "none" }}
        disabled={isDisabled}
        {...rest}
      />

      {/* Botón de marca */}
      <Button
        onClick={handleClick}
        isDisabled={isDisabled}
        size={isSm ? "sm" : "md"}
        bg="black"
        color="white"
        borderRadius="lg"
        fontFamily="secondary"
        fontWeight="500"
        _hover={{ bg: "#1a1a1a", transform: "translateY(-1px)", boxShadow: "md" }}
        _active={{ bg: "#1a1a1a", transform: "translateY(0)" }}
        leftIcon={<AttachmentIcon />}
        transition="all 0.2s"
        flexShrink={0}
      >
        {isSm ? "Elegir archivo" : "Seleccionar archivo"}
      </Button>

      {/* Nombre del archivo */}
      <Text
        fontSize={isSm ? "xs" : "sm"}
        color={value ? "gray.700" : "gray.400"}
        fontFamily="secondary"
        noOfLines={1}
        maxW="200px"
        title={value || placeholder}
      >
        {value || placeholder}
      </Text>
    </Flex>
  );
};

export default FileInput;
