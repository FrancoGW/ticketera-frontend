import { Box, Center, Text, Heading } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionHeading = motion(Heading);

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
        <MotionHeading
          fontSize={{ base: "4xl", md: "6xl", lg: "8xl" }}
          fontWeight="300"
          fontFamily="'Monument Extended', sans-serif"
          letterSpacing="-0.01em"
          textAlign="center"
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          <Box as="span" color="#fff">Get</Box>
          <Box as="span" color="#B78DEA">Pass</Box>
        </MotionHeading>
      </Center>
    </MotionBox>
  );
};

export default MaintenanceMode;
