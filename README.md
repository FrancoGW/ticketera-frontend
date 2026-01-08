# Ticketera Frontend

Frontend del sistema de gestión de tickets y eventos construido con React y Vite.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
```

### Preview del Build

```bash
npm run preview
```

## 📦 Tecnologías

- React 18
- Vite
- Chakra UI
- Redux Toolkit
- React Router
- Axios

## 🌐 Variables de Entorno

Crea un archivo `.env` con:

```
VITE_API_URL=http://localhost:3000
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza el build de producción
- `npm run lint` - Ejecuta el linter

## 🚢 Despliegue en Vercel

Este proyecto está configurado para desplegarse en Vercel.

### Configuración Automática

El proyecto incluye un archivo `vercel.json` que configura las reglas de reescritura para una SPA (Single Page Application).

### Pasos para Desplegar

1. **Conectar el repositorio a Vercel:**
   - Ve a [Vercel](https://vercel.com)
   - Importa el repositorio `FrancoGW/ticketera-frontend`
   - Vercel detectará automáticamente que es un proyecto Vite

2. **Configurar Variables de Entorno:**
   - En la configuración del proyecto en Vercel, agrega las variables de entorno necesarias:
     - `VITE_API_URL` - URL de tu API backend

3. **Despliegue:**
   - Vercel desplegará automáticamente en cada push a la rama `main`
   - Cada pull request generará un preview deployment

### Configuración de Build

Vercel detectará automáticamente:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

No es necesario configurar estos valores manualmente, pero puedes hacerlo en la configuración del proyecto si lo deseas.

