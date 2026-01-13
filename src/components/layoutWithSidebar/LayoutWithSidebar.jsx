import { Box, Flex } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import ClientSidebar from "../clientSideBar/clientSideBar";
import SellerSidebar from "../sellerSideBar/sellerSideBar";
import Sidebar from "../sideBar/sideBar";
import LoadingBar from "../loadingBar/LoadingBar";
import { useAuth } from "../../auth/context/AuthContext";

const contentVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

const LayoutWithSidebar = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [prevLocation, setPrevLocation] = useState(location.pathname);

  // Determinar qué sidebar mostrar según el rol
  const getUserRoles = () => {
    if (!user) return [];
    return user.roles || (user.rol ? [user.rol] : []);
  };

  const userRoles = getUserRoles();
  const isSeller = userRoles.includes("seller");
  const isAdmin = userRoles.includes("admin");
  const isBuyer = userRoles.includes("buyer") || (!isSeller && !isAdmin);

  // Determinar qué sidebar renderizar
  const renderSidebar = () => {
    if (isAdmin) return <Sidebar />;
    if (isSeller) return <SellerSidebar />;
    return <ClientSidebar />;
  };

  // Detectar cambios de ruta y mostrar barra de carga
  useEffect(() => {
    if (location.pathname !== prevLocation) {
      setIsLoading(true);
      setPrevLocation(location.pathname);
      
      // Simular tiempo de carga (puedes ajustar esto según tus necesidades)
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, prevLocation]);

  return (
    <Flex minH="100vh" bg="gray.50">
      {renderSidebar()}
      <Box flex="1" ml={{ base: 0, md: "280px" }} minH="calc(100vh - 80px)" mt="80px">
        <Header key="header" />
        <LoadingBar isLoading={isLoading} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={contentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: "100%" }}
          >
            <Box
              as="main"
              minH="calc(100vh - 80px)"
              pb={20}
              bg="white"
              pt={8}
            >
              {children}
            </Box>
          </motion.div>
        </AnimatePresence>
        
        <Footer key="footer" />
      </Box>
    </Flex>
  );
};

export default memo(LayoutWithSidebar);
