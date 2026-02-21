import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hace scroll al inicio de la página cada vez que cambia la ruta.
 * Así, al hacer clic en "Ser organizador" u otro enlace, la nueva pantalla
 * se muestra desde arriba y no desde donde quedó el scroll anterior.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
