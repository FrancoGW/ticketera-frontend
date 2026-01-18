import { Box, Center, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionText = motion(Text);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: "easeIn",
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      delay: 0.3,
      ease: "easeOut",
    },
  },
};

const MaintenanceMode = () => {
  return (
    <MotionBox
      position="fixed"
      top={0}
      left={0}
      width="100%"
      height="100%"
      bg="black"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Center h="100vh" w="100vw">
        <MotionText
          fontSize={{ base: "4xl", md: "6xl", lg: "8xl" }}
          fontWeight="bold"
          color="white"
          fontFamily="secondary"
          letterSpacing="wider"
          textAlign="center"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          GetPass
        </MotionText>
      </Center>
    </MotionBox>
  );
};

export default MaintenanceMode;
