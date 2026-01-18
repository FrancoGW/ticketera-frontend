# Implementación del Modo Mantenimiento en el Backend

## Descripción
Necesitas implementar dos endpoints para manejar el modo mantenimiento (pantalla de pausa) de la aplicación. Este modo permite mostrar una pantalla con "GetPass" a todos los usuarios cuando el sistema está en mantenimiento.

## Endpoints Requeridos

### 1. GET `/admin/settings/maintenance-mode`
**Descripción**: Obtiene el estado actual del modo mantenimiento.

**Autenticación**: ⚠️ **NO requiere autenticación** - Este endpoint debe ser público porque el frontend necesita saber si debe mostrar la pantalla de mantenimiento incluso antes de que el usuario se autentique.

**Respuesta exitosa (200)**:
```json
{
  "isActive": false
}
```

**Respuesta cuando no existe configuración (404)**: 
El frontend maneja el 404 como "desactivado por defecto", pero es recomendable crear un registro por defecto.

**Errores**:
- `404 Not Found`: Configuración no encontrada (el frontend maneja esto como `false`)

---

### 2. PUT `/admin/settings/maintenance-mode`
**Descripción**: Actualiza el estado del modo mantenimiento.

**Autenticación**: Requiere token de autenticación y rol `admin`.

**Body de la petición**:
```json
{
  "isActive": true
}
```

**Respuesta exitosa (200)**:
```json
{
  "isActive": true,
  "message": "Modo mantenimiento actualizado correctamente"
}
```

**Errores**:
- `400 Bad Request`: Body inválido o falta el campo `isActive`
- `401 Unauthorized`: Usuario no autenticado
- `403 Forbidden`: Usuario sin permisos de admin
- `500 Internal Server Error`: Error del servidor

---

## Estructura de Datos Recomendada

### Opción 1: Colección dedicada (Recomendado para MongoDB)
```javascript
{
  _id: ObjectId,
  key: "maintenance_mode",
  isActive: Boolean,
  updatedAt: Date,
  updatedBy: ObjectId // ID del admin que lo actualizó
}
```

### Opción 2: Configuración global en una colección `settings`
```javascript
{
  _id: ObjectId,
  settings: {
    maintenanceMode: {
      isActive: Boolean,
      updatedAt: Date,
      updatedBy: ObjectId
    },
    // ... otras configuraciones
  }
}
```

### Opción 3: Variable de entorno o archivo de configuración
**Nota**: Esta opción requiere reiniciar el servidor, no es ideal para producción.

---

## Ejemplo de Implementación (Node.js/Express)

### Controlador
```javascript
// controllers/settingsController.js

const getMaintenanceMode = async (req, res) => {
  try {
    // Buscar configuración en la base de datos
    const settings = await Settings.findOne({ key: 'maintenance_mode' });
    
    if (!settings) {
      // Si no existe, crear por defecto como false
      const defaultSettings = await Settings.create({
        key: 'maintenance_mode',
        isActive: false,
        updatedAt: new Date()
      });
      return res.json({ isActive: defaultSettings.isActive });
    }
    
    return res.json({ isActive: settings.isActive });
  } catch (error) {
    console.error('Error obteniendo modo mantenimiento:', error);
    return res.status(500).json({ 
      message: 'Error al obtener configuración de mantenimiento' 
    });
  }
};

const updateMaintenanceMode = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    // Validar que isActive sea un boolean
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        message: 'El campo isActive debe ser un booleano' 
      });
    }
    
    // Buscar o crear configuración
    const settings = await Settings.findOneAndUpdate(
      { key: 'maintenance_mode' },
      {
        isActive,
        updatedAt: new Date(),
        updatedBy: req.user.id // Asumiendo que tienes el usuario en req.user
      },
      { 
        new: true, 
        upsert: true // Crear si no existe
      }
    );
    
    return res.json({ 
      isActive: settings.isActive,
      message: 'Modo mantenimiento actualizado correctamente'
    });
  } catch (error) {
    console.error('Error actualizando modo mantenimiento:', error);
    return res.status(500).json({ 
      message: 'Error al actualizar configuración de mantenimiento' 
    });
  }
};

module.exports = {
  getMaintenanceMode,
  updateMaintenanceMode
};
```

### Rutas
```javascript
// routes/settingsRoutes.js

const express = require('express');
const router = express.Router();
const { getMaintenanceMode, updateMaintenanceMode } = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');

// GET es público (no requiere autenticación)
// PUT requiere autenticación y rol admin
router.get('/maintenance-mode', getMaintenanceMode);
router.put('/maintenance-mode', authenticateToken, requireAdmin, updateMaintenanceMode);

module.exports = router;
```

### En tu app principal
```javascript
// app.js o server.js

const settingsRoutes = require('./routes/settingsRoutes');

app.use('/admin/settings', settingsRoutes);
```

---

## Modelo de Datos (Mongoose/MongoDB)

```javascript
// models/Settings.js

const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
```

---

## Consideraciones Importantes

1. **Permisos**: 
   - **GET**: NO debe requerir autenticación (debe ser público) para que todos los usuarios puedan saber si el sistema está en mantenimiento.
   - **PUT**: Debe requerir autenticación y rol `admin` para que solo administradores puedan activar/desactivar el modo.

2. **Valor por defecto**: Si no existe configuración, el backend debe devolver `isActive: false` o crear un registro por defecto.

3. **Logging**: Considera agregar logs cuando se active/desactive el modo mantenimiento para auditoría.

4. **Validación**: El campo `isActive` debe ser estrictamente un boolean.

5. **Sincronización**: El estado debe persistirse correctamente para que todos los usuarios vean el mismo estado.

6. **Performance**: Si se almacena en base de datos, considera cachear el valor para evitar consultas en cada petición del frontend.

---

## Testing

Verifica:
- ✅ GET sin autenticación → 401
- ✅ GET sin rol admin → 403
- ✅ GET con admin → 200 con `isActive`
- ✅ PUT sin autenticación → 401
- ✅ PUT sin rol admin → 403
- ✅ PUT con `isActive: true` → 200 y actualiza correctamente
- ✅ PUT con `isActive: false` → 200 y actualiza correctamente
- ✅ PUT con body inválido → 400

---

## Notas Adicionales

- El frontend maneja el caso donde el endpoint no existe (404) como "desactivado por defecto" para no romper la aplicación si el backend aún no implementa los endpoints.

- Una vez implementado el backend, el frontend automáticamente usará estos endpoints en lugar de localStorage.
