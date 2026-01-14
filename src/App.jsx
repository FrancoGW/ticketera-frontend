import { Box, ChakraProvider } from "@chakra-ui/react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "./auth/context/AuthContext";
import { ProtectedRoute } from "./auth/components/ProtectedRoute";
import LayoutWithSidebar from "./components/layoutWithSidebar/LayoutWithSidebar";
import Contact from "./Pages/contact/Contact";
import Nosotros from "./Pages/nosotros/Nosotros";
import Login from "./Pages/login/Login";
import Register from "./Pages/register/register";
import RecoverPassword from "./Pages/recoverPassword/RecoverPassword";
import Politics from "./Pages/politics/Politics";
import EventDetails from "./components/eventDetails/EventDetails";
import NewEvent from "./Pages/new-event/NewEvent";
import Profile from "./Pages/profile/Profile";
import Productores from "./Pages/productores/Productores";
import Preguntas from "./Pages/preguntas/Preguntas";
import EditEvent from "./Pages/editEvent/editEvent";
import GeneralEvents from "./Pages/eventsAdmin/generalEvents";
import TicketsPage from "./Pages/ticketsAdmin/ticketsPage";
import MyTickets from "./Pages/myTickets/myTickets";
import ChangePassword from "./Pages/changePassword/changePassword";
import VerifyEmail from "./Pages/verifyEmail/verifyEmail";
import PaymentFinished from "./Pages/PaymentFinished/PaymentFinished";
import Main from "./Pages/main/Main";
import Scanner from "./Pages/Scanner/Scanner";
import Wpp from "./components/whatsapp/wpp";
import MetricsPage from "./Pages/eventsAdmin/MetricsPage";
import CommissionPage from "./Pages/eventsAdmin/Comission";
import UserCrud from "./components/userCrud/userCrud";
import PdvDashboard from "./Pages/pdv/PdvDashboard";
import PdvTickets from "./Pages/pdv/PdvTickets";
import PdvSales from "./Pages/pdv/PdvSales";
import PdvSpecialTickets from "./Pages/pdv/PdvSpecialTickets";
import MyEvents from "./Pages/myEvents/myEvents";
import SellerTicketsPage from "./Pages/sellerTickets/SellerTicketsPage";
import SellerScanner from "./Pages/sellerScanner/SellerScanner";
import AdminEventDetails from "./Pages/eventsAdmin/AdminEventDetails";

import theme from "../theme";
import "./main.css";

const pageVariants = {
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Main />
                </motion.div>
              }
            />
            <Route
              path="/contact"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Contact />
                </motion.div>
              }
            />
            <Route
              path="/about-us"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Nosotros />
                </motion.div>
              }
            />
            <Route
              path="/login"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Login />
                </motion.div>
              }
            />
            <Route
              path="/change-password"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ChangePassword />
                </motion.div>
              }
            />
            <Route
              path="/register"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Register />
                </motion.div>
              }
            />
            <Route
              path="/recover-password"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <RecoverPassword />
                </motion.div>
              }
            />
            <Route
              path="/politics"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Politics />
                </motion.div>
              }
            />
            <Route
              path="/event/:id"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <EventDetails />
                </motion.div>
              }
            />
            <Route
              path="/producers"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Productores />
                </motion.div>
              }
            />
            <Route
              path="/faq"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Preguntas />
                </motion.div>
              }
            />
            <Route
              path="/verify-email"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <VerifyEmail />
                </motion.div>
              }
            />
            <Route
              path="/payment-finished"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <PaymentFinished />
                </motion.div>
              }
            />
            <Route
              path="/scanner"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Scanner />
                </motion.div>
              }
            />

            {/* Protected Routes for Users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["buyer", "seller", "admin", "validator", "pdv"]}>
                  <LayoutWithSidebar>
                    <Profile />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/validador"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ProtectedRoute roles={["validator"]}>
                    <Scanner />
                  </ProtectedRoute>
                </motion.div>
              }
            />
            <Route
              path="/profile/my-tickets"
              element={
                <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                  <LayoutWithSidebar>
                    <MyTickets />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/change-password"
              element={
                <ProtectedRoute roles={["buyer", "seller", "admin", "pdv", "validator"]}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            /> */}

            {/* Protected Routes for Admins */}
            <Route
              path="/admin/new-event"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <LayoutWithSidebar>
                    <NewEvent />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <LayoutWithSidebar>
                    <GeneralEvents />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <LayoutWithSidebar>
                    <TicketsPage />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <LayoutWithSidebar>
                    <AdminEventDetails />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/my-events"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <LayoutWithSidebar>
                    <MyEvents />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/new-event"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <LayoutWithSidebar>
                    <NewEvent />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/tickets"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <LayoutWithSidebar>
                    <SellerTicketsPage />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/scanner"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <LayoutWithSidebar>
                    <SellerScanner />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/my-events/:id/edit"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ProtectedRoute roles={["admin"]}>
                    <EditEvent />
                  </ProtectedRoute>
                </motion.div>
              }
            />
            <Route
              path="/admin/metrics"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <LayoutWithSidebar>
                    <MetricsPage />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/commission"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <LayoutWithSidebar>
                    <CommissionPage />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <LayoutWithSidebar>
                    <UserCrud />
                  </LayoutWithSidebar>
                </ProtectedRoute>
              }
            />

            {/* Protected Routes for PDV */}
            <Route
              path="/pdv/dashboard"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ProtectedRoute roles={["pdv"]}>
                    <PdvDashboard />
                  </ProtectedRoute>
                </motion.div>
              }
            />
            <Route
              path="/pdv/tickets"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ProtectedRoute roles={["pdv"]}>
                    <PdvTickets />
                  </ProtectedRoute>
                </motion.div>
              }
            />
            <Route
              path="/pdv/sales"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ProtectedRoute roles={["pdv"]}>
                    <PdvSales />
                  </ProtectedRoute>
                </motion.div>
              }
            />
            <Route
              path="/pdv/special-tickets"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ProtectedRoute roles={["pdv"]}>
                    <PdvSpecialTickets />
                  </ProtectedRoute>
                </motion.div>
              }
            />
            <Route
              path="/validator/qr-scanner"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <ProtectedRoute roles={["validator"]}>
                    <Scanner />
                  </ProtectedRoute>
                </motion.div>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Box h="100%">
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Wpp />
          <AnimatedRoutes />
        </AuthProvider>
      </ChakraProvider>
    </Box>
  );
}

export default App;
