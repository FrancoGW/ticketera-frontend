import { Navigate, useLocation } from 'react-router-dom';
import { useMaintenanceMode } from '../../hooks/useMaintenanceMode';

interface PreviewRouteProps {
  children: React.ReactNode;
}

export const PreviewRoute: React.FC<PreviewRouteProps> = ({ children }) => {
  const location = useLocation();
  const { isMaintenanceMode } = useMaintenanceMode();

  // Si NO está en mantenimiento y la ruta empieza con /preview, redirigir a la ruta sin /preview
  if (!isMaintenanceMode && location.pathname.startsWith('/preview')) {
    const newPath = location.pathname.replace('/preview', '') || '/';
    return <Navigate to={newPath + (location.search || '')} replace />;
  }

  // Si está en mantenimiento, permitir acceso normal a /preview/*
  return <>{children}</>;
};
