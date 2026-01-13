import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  Text,
  Box,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

const MotionOverlay = motion(AlertDialogOverlay);
const MotionContent = motion(AlertDialogContent);

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "red",
  isLoading = false,
}) => {
  const cancelRef = useRef();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
      isCentered
      motionPreset="none"
    >
      <AnimatePresence>
        {isOpen && (
          <>
            <MotionOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              bg="blackAlpha.600"
              backdropFilter="blur(4px)"
            />
            <MotionContent
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ 
                duration: 0.2,
                ease: [0.16, 1, 0.3, 1]
              }}
              maxW="400px"
              borderRadius="12px"
              boxShadow="0 8px 32px rgba(0, 0, 0, 0.12)"
              border="1px solid"
              borderColor="gray.200"
              bg="white"
              p={0}
              overflow="hidden"
            >
              <Box px={6} pt={6} pb={4}>
                <AlertDialogHeader
                  fontSize="18px"
                  fontWeight="600"
                  fontFamily="secondary"
                  color="gray.900"
                  pb={2}
                  px={0}
                >
                  {title}
                </AlertDialogHeader>
                <AlertDialogBody px={0} py={2}>
                  <Text
                    fontSize="14px"
                    color="gray.600"
                    fontFamily="secondary"
                    lineHeight="1.5"
                  >
                    {message}
                  </Text>
                </AlertDialogBody>
              </Box>

              <AlertDialogFooter
                px={6}
                py={4}
                gap={2}
                borderTop="1px solid"
                borderColor="gray.100"
                bg="gray.50"
              >
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  fontFamily="secondary"
                  fontSize="14px"
                  fontWeight="500"
                  variant="ghost"
                  color="gray.700"
                  _hover={{
                    bg: "gray.100",
                  }}
                  _active={{
                    bg: "gray.200",
                  }}
                  borderRadius="6px"
                  px={4}
                  py={2}
                  h="auto"
                  isDisabled={isLoading}
                  as={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={onConfirm}
                  fontFamily="secondary"
                  fontSize="14px"
                  fontWeight="500"
                  bg={confirmColor === "red" ? "#E53E3E" : confirmColor === "blue" ? "#3182CE" : "#000"}
                  color="white"
                  _hover={{
                    bg: confirmColor === "red" ? "#C53030" : confirmColor === "blue" ? "#2C5282" : "#1a1a1a",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  _active={{
                    bg: confirmColor === "red" ? "#9B2C2C" : confirmColor === "blue" ? "#2A4365" : "#000",
                    transform: "translateY(0)",
                  }}
                  borderRadius="6px"
                  px={4}
                  py={2}
                  h="auto"
                  isLoading={isLoading}
                  loadingText="Procesando..."
                  transition="all 0.2s"
                  as={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {confirmText}
                </Button>
              </AlertDialogFooter>
            </MotionContent>
          </>
        )}
      </AnimatePresence>
    </AlertDialog>
  );
};

export default ConfirmDialog;
