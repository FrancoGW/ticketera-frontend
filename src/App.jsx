import { Box, ChakraProvider } from "@chakra-ui/react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/context/AuthContext";
import { ProtectedRoute } from "./auth/components/ProtectedRoute";
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
import AdminEventDetails from "./Pages/eventsAdmin/AdminEventDetails";

import theme from "../theme";
import "./main.css";

function App() {
  return (
    <Box h="100%">
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Wpp />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Main />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about-us" element={<Nosotros />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/recover-password" element={<RecoverPassword />} />
            <Route path="/politics" element={<Politics />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/producers" element={<Productores />} />
            <Route path="/faq" element={<Preguntas />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/payment-finished" element={<PaymentFinished />} />
            <Route path="/scanner" element={<Scanner />} />

            {/* Protected Routes for Users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute roles={["buyer", "seller", "admin", "validator", "pdv"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/validador"
              element={
                <ProtectedRoute roles={["validator"]}>
                  <Scanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/my-tickets"
              element={
                <ProtectedRoute roles={["buyer", "seller", "admin"]}>
                  <MyTickets />
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
                  <NewEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <GeneralEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <TicketsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events/:id"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminEventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/my-events"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <MyEvents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/new-event"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <NewEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/tickets"
              element={
                <ProtectedRoute roles={["seller", "admin"]}>
                  <SellerTicketsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/my-events/:id/edit"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <EditEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/metrics"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <MetricsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/commission"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <CommissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <UserCrud />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes for PDV */}
            <Route
              path="/pdv/dashboard"
              element={
                <ProtectedRoute roles={["pdv"]}>
                  <PdvDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdv/tickets"
              element={
                <ProtectedRoute roles={["pdv"]}>
                  <PdvTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdv/sales"
              element={
                <ProtectedRoute roles={["pdv"]}>
                  <PdvSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdv/special-tickets"
              element={
                <ProtectedRoute roles={["pdv"]}>
                  <PdvSpecialTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/validator/qr-scanner"
              element={
                <ProtectedRoute roles={["validator"]}>
                  <Scanner />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ChakraProvider>
    </Box>
  );
}

export default App;
