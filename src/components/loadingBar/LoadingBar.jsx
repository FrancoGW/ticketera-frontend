import { Box } from "@chakra-ui/react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

const LoadingBar = ({ isLoading }) => {
  const progress = useMotionValue(0);
  const width = useTransform(progress, [0, 100], ["0%", "100%"]);

  useEffect(() => {
    if (isLoading) {
      // Simular progreso suave
      const interval = setInterval(() => {
        progress.set((prev) => {
          if (prev >= 90) return prev; // No llegar al 100% hasta que termine
          return prev + Math.random() * 10;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      // Completar la barra cuando termine la carga
      progress.set(100);
      setTimeout(() => {
        progress.set(0);
      }, 300);
    }
  }, [isLoading, progress]);

  return (
    <Box
      position="fixed"
      top="80px"
      left={0}
      right={0}
      h="2px"
      bg="transparent"
      zIndex={101}
      pointerEvents="none"
    >
      <motion.div
        style={{
          width,
          height: "100%",
          background: "linear-gradient(90deg, #b78dea 0%, #9d6dd8 50%, #b78dea 100%)",
          backgroundSize: "200% 100%",
        }}
        initial={{ opacity: 0 }}
        animate={{
          opacity: isLoading ? 1 : 0,
          backgroundPosition: isLoading ? ["0%", "200%"] : "0%",
        }}
        transition={{
          opacity: { duration: 0.2 },
          backgroundPosition: {
            duration: 1.5,
            repeat: isLoading ? Infinity : 0,
            ease: "linear",
          },
        }}
      />
    </Box>
  );
};

export default LoadingBar;
