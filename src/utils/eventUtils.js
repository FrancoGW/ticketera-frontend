/**
 * Convierte el campo `pictures` de un evento (string URL o base64 raw)
 * en una URL utilizable por <img src>.
 */
export const getEventImage = (pictures) => {
  if (!pictures) return null;
  if (typeof pictures === "string") {
    if (pictures.startsWith("http://") || pictures.startsWith("https://")) return pictures;
    if (pictures.startsWith("data:")) return pictures;
    return `data:image/png;base64,${pictures}`;
  }
  return null;
};
