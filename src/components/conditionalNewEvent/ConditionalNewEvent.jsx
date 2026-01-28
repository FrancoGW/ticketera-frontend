import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import LayoutWithSidebar from '../layoutWithSidebar/LayoutWithSidebar';
import NewEvent from '../../Pages/new-event/NewEvent';

export const ConditionalNewEvent = () => {
  const { user } = useAuth();

  // Verificar si el usuario tiene rol seller o admin
  const userRoles = user?.roles || (user?.rol ? [user.rol] : []);
  const isSellerOrAdmin = userRoles.some(role => 
    String(role).toLowerCase() === 'seller' || String(role).toLowerCase() === 'admin'
  );

  // Si no es seller ni admin, redirigir a la landing de venta
  if (!isSellerOrAdmin) {
    return <Navigate to="/vender" replace />;
  }

  // Si es seller o admin, mostrar la página de crear evento
  return (
    <LayoutWithSidebar>
      <NewEvent />
    </LayoutWithSidebar>
  );
};
