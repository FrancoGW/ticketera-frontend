# 🔐 Permisos de Administrador para Tickets de Cortesía

## 📋 Resumen

Los administradores deben tener la capacidad de generar tickets de cortesía para **cualquier evento** en la plataforma, independientemente de quién sea el creador del evento.

## 🎯 Problema Actual

Actualmente, cuando un administrador intenta generar tickets de cortesía desde el panel de administración (`/admin/events`), el backend devuelve el siguiente error:

```
"You are not allowed to create courtesy tickets for this event"
```

Esto está ocurriendo incluso cuando:
- El usuario tiene rol de `admin`
- El evento está aprobado (`status: "approved"`)
- El administrador tiene acceso a gestionar el evento

## ✅ Solución Requerida

### 1. Validación de Permisos en el Backend

El endpoint `/tickets/courtesy` (POST) debe actualizar su lógica de validación para:

**Antes:**
- Solo permitir que el creador del evento genere tickets de cortesía

**Después:**
- Permitir que el creador del evento genere tickets de cortesía
- **Permitir que usuarios con rol `admin` generen tickets de cortesía para CUALQUIER evento**

### 2. Lógica de Validación Sugerida

```javascript
// Pseudocódigo de validación
const userRole = req.user.roles; // o req.user.rol dependiendo de tu estructura
const eventCreator = event.createdBy || event.userRef || event.ownerId;

// Permitir si:
// 1. El usuario es el creador del evento, O
// 2. El usuario tiene rol 'admin'
const canCreateCourtesyTicket = 
  user._id.toString() === eventCreator.toString() || 
  userRole.includes('admin') || 
  userRole === 'admin'; // Si es string en lugar de array

if (!canCreateCourtesyTicket) {
  return res.status(403).json({
    message: "You are not allowed to create courtesy tickets for this event"
  });
}
```

### 3. Endpoint Afectado

**Endpoint:** `POST /tickets/courtesy`

**Body:**
```json
{
  "eventId": "string",
  "ticketId": "string",
  "email": "string",
  "date": "object",
  "quantity": "number",
  "sendEmail": "boolean"
}
```

### 4. Validación Adicional

Asegurarse de que la validación también considere:
- Si el evento existe y está activo
- Si el ticket seleccionado pertenece al evento
- Si la fecha seleccionada es válida para el evento
- Si el usuario está autenticado y tiene rol válido

## 📝 Contexto del Frontend

El modal de tickets de cortesía se usa en:
1. **Panel de Administración** (`/admin/events`) - `AdminEventCard.jsx`
2. **Panel de Vendedores** (`/profile/my-events`) - `EventList.jsx`

Ambos usan el mismo componente: `CourtesyTicketModal.jsx`

## 🎯 Casos de Uso

### Caso 1: Vendedor creando tickets para su propio evento
- ✅ Debe funcionar (ya funciona)

### Caso 2: Administrador creando tickets para evento de otro vendedor
- ❌ Actualmente falla
- ✅ Debe funcionar después de la actualización

### Caso 3: Administrador creando tickets para su propio evento
- ✅ Debe funcionar (ya funciona si el admin también es vendedor)

## 🔍 Archivos del Backend que Necesitan Actualización

Buscar el controlador/handler que maneja `POST /tickets/courtesy` y actualizar la validación de permisos según lo especificado arriba.

## ⚠️ Nota de Seguridad

Asegurarse de que:
1. La validación de rol `admin` se haga de manera segura (no solo confiar en el cliente)
2. El usuario esté autenticado correctamente
3. Se valide que el evento y el ticket existan y estén asociados

## 📅 Prioridad

**ALTA** - Los administradores necesitan esta funcionalidad para gestionar eventos de forma completa desde el panel de administración.
