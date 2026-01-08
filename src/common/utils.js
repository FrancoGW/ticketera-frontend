import { createStandaloneToast } from "@chakra-ui/react";

const { toast } = createStandaloneToast()

function addZero(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export const getTimeInfo = (dateStart, dateEnd) => {
  // First we convert to Datetime data
  const dateStartConverted = new Date(dateStart);
  const dateEndConverted = new Date(dateEnd);

  // Start hour

  let start_h = addZero(dateStartConverted.getHours());
  let start_m = addZero(dateStartConverted.getMinutes());
  let start_s = addZero(dateStartConverted.getSeconds());
  let startHour = start_h + ":" + start_m;

  // End hour
  let end_h = addZero(dateEndConverted.getHours());
  let end_m = addZero(dateEndConverted.getMinutes());
  let end_s = addZero(dateEndConverted.getSeconds());
  let endHour = end_h + ":" + end_m;

  // We get the date
  const dateShort = dateStartConverted.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    month: "long",
    day: "numeric",
  });

  const dateLong = dateStartConverted.toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return { startHour, endHour, dateShort, dateLong };
};

export const isDateIncluded = (date, dates) => {
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return false;
  }
  
  const dateIncluded = dates.find(d => {
    if (!d || !date) return false;
    // Comparar fecha y horas
    return d.date === date.date && d.timeStart === date.timeStart && d.timeEnd === date.timeEnd;
  });
  
  return !!dateIncluded;
}

export const getObjDate = (date) => {
  const startDate = new Date(date.timestampStart);
  const endDate = new Date(date.timestampEnd);

  return {
    date: `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`,
    timeStart: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
    timeEnd: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
  };
};

export const validateSelectedImg = (file) => {
  if (!file) return false
  
  // Validar tipo de imagen
  if (!file.type.includes("image")) {
    toast({
      title: "El archivo debe ser una imagen",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return false;
  }

  // Límite de 1MB - La compresión automática reducirá el tamaño antes del envío
  const maxSize = 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    toast({
      title: "La imagen no puede superar los 1MB",
      description: "Por favor, comprime o reduce el tamaño de la imagen antes de subirla",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
    return false;
  }

  return true;
};

// Función para comprimir y redimensionar imágenes
export const compressImage = (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo la proporción
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          } else {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob y luego a file
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };
      img.onerror = () => {
        // Si falla la compresión, devolver el archivo original
        resolve(file);
      };
    };
    reader.onerror = () => {
      resolve(file);
    };
  });
};

export const getBase64FromFile = async (file) => {
  // Comprimir la imagen antes de convertir a base64
  const compressedFile = await compressImage(file);
  
  return new Promise((resolve) => {
    // Make new FileReader
    const reader = new FileReader();

    // Convert the file to base64 text
    reader.readAsDataURL(compressedFile);

    // on reader load somthing...
    reader.onload = () => {
      // Make a fileInfo Object
      const baseURL = reader.result.replace(
        /^data:image\/?[A-z]*;base64,/,
        ""
      );
      resolve(baseURL);
    };
  });
};

export const bufferToBase64 = (buffer) => {
  return btoa(
    new Uint8Array(buffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
};