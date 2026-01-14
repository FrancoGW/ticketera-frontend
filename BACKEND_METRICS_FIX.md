# 🔧 Corrección de Métricas - Tickets Vendidos

## 📋 Problema Identificado

Las métricas en el panel de administración muestran **0 tickets vendidos** y **$0 en ingresos**, a pesar de que el backend generó correctamente:
- ✅ 20 tickets
- ✅ 20 QR codes (colección `qrs`)
- ✅ 1 Payment con status 'approved' (colección `payments`)
- ✅ Contador de tickets vendidos actualizado

## 🗄️ Estructura de Colecciones

Según la estructura de la base de datos `ticket_saas`, tenemos:

- **`events`**: Eventos que contienen tickets
- **`tickets`**: Tipos de tickets (con campo `selled` que debe reflejar cuántos se vendieron)
- **`qrs`**: QR codes individuales creados (cada uno representa un ticket vendido)
- **`payments`**: Pagos realizados (con status 'approved' cuando están aprobados)

**Relación:** 
- Un `event` tiene múltiples `tickets` (tipos de tickets)
- Un `payment` está asociado a un `event` y un `ticket` (tipo)
- Múltiples `qrs` están asociados a un `payment` (uno por cada ticket vendido)

## 🔍 Causa del Problema

El frontend calcula las métricas basándose en el campo `selled` de cada ticket en la colección `tickets`:

```javascript
// El frontend obtiene eventos con GET /events/admin/all
// Y espera que cada ticket tenga el campo selled actualizado:
const totalSold = event.tickets?.reduce((sum, ticket) => sum + (ticket.selled || 0), 0) || 0;
const totalRevenue = event.tickets?.reduce((sum, ticket) => {
  return sum + ((ticket.price || 0) * (ticket.selled || 0));
}, 0) || 0;
```

**El problema:** Cuando se generan QR codes directamente (script de generación masiva):
- ✅ Se crean registros en la colección `qrs`
- ✅ Se crea un `payment` con status 'approved'
- ❌ **NO se actualiza el campo `selled` en la colección `tickets`**

Por eso las métricas muestran 0: el frontend busca `ticket.selled` y está en 0.

## ✅ Solución Requerida en el Backend

### Opción 1: Actualizar campo `selled` al generar QR codes (RECOMENDADO)

Cuando se crean QR codes en la colección `qrs`, el backend debe actualizar el campo `selled` del ticket correspondiente en la colección `tickets`:

```javascript
// Ejemplo de lo que debe hacer el backend
// Al crear un QR code en la colección 'qrs':

// 1. Crear el QR code
const qrCode = await QR.create({
  eventId: eventId,
  ticketId: ticketId,  // ID del tipo de ticket
  paymentId: paymentId,
  qrId: generateQRId(),
  // ... otros campos
});

// 2. IMPORTANTE: Actualizar el contador selled en la colección tickets
await Ticket.findByIdAndUpdate(ticketId, {
  $inc: { selled: 1 }  // Incrementar el contador
});

// Si se crean múltiples QR codes de una vez:
await Ticket.findByIdAndUpdate(ticketId, {
  $inc: { selled: quantity }  // Incrementar por la cantidad creada
});
```

**Relación entre colecciones:**
- `qrs.ticketId` → `tickets._id` (debe actualizar `tickets.selled`)
- `qrs.paymentId` → `payments._id` (ya existe)
- `qrs.eventId` → `events._id` (ya existe)

### Opción 2: Endpoint dedicado para métricas (ALTERNATIVA)

Si no se puede modificar el proceso de creación de QR codes, crear un endpoint específico que calcule las métricas contando directamente desde las colecciones:

```javascript
// GET /admin/metrics
// Debe contar desde las colecciones reales:
// - Contar QR codes en colección 'qrs' agrupados por eventId y ticketId
// - Sumar payments con status 'approved' agrupados por eventId
// - Calcular ingresos desde payments.amount donde status = 'approved'
```

**Ejemplo de query:**
```javascript
// Contar tickets vendidos por evento
const ticketsSold = await QR.aggregate([
  { $match: { eventId: eventId } },
  { $group: { 
    _id: '$ticketId', 
    count: { $sum: 1 } 
  }}
]);

// Calcular ingresos desde payments
const revenue = await Payment.aggregate([
  { 
    $match: { 
      eventId: eventId,
      status: 'approved' 
    } 
  },
  { 
    $group: { 
      _id: '$ticketId',
      total: { $sum: '$amount' }
    }
  }
]);
```

## 📊 Estructura de Datos Esperada

El frontend obtiene los datos mediante `GET /events/admin/all` y espera que cada ticket en la respuesta tenga el campo `selled` actualizado:

```javascript
// Respuesta esperada de GET /events/admin/all
{
  events: [
    {
      _id: "event_id",
      title: "Festival del chamame",
      tickets: [
        {
          _id: "ticket_id",
          title: "General",
          price: 1000,
          selled: 20,  // ⚠️ ESTE CAMPO DEBE ESTAR ACTUALIZADO
          maxEntries: 100,
          // ... otros campos
        }
      ]
    }
  ]
}
```

**Relación con las colecciones:**
- `events.tickets[].selled` debe reflejar la cantidad de QR codes creados en la colección `qrs` para ese `ticketId`
- `events.tickets[].selled * events.tickets[].price` = ingresos totales de ese tipo de ticket

## 🔄 Campos Alternativos que el Frontend Busca

He actualizado el frontend para que también busque en otros campos como fallback:
- `ticket.selled` (principal)
- `ticket.soldCount` (alternativo)
- `ticket.sold` (alternativo)

Pero **la solución correcta es que el backend actualice `selled`**.

## 🧪 Cómo Verificar

1. Generar tickets como lo hiciste (20 QR codes en colección `qrs`, 1 payment en colección `payments`)
2. Verificar en la base de datos MongoDB:
   ```javascript
   // Verificar QR codes creados
   db.qrs.find({ ticketId: "ticket_id" }).count()  // Debe ser 20
   
   // Verificar que el campo selled esté actualizado
   db.tickets.findOne({ _id: "ticket_id" })  // Debe tener selled: 20
   ```
3. Verificar que el endpoint `GET /events/admin/all` devuelva el campo `selled` actualizado:
   ```javascript
   // La respuesta debe incluir:
   events[0].tickets[0].selled === 20
   ```
4. Recargar la página de métricas en el frontend
5. Debería mostrar:
   - Total Entradas Vendidas: 20
   - Ingresos Totales: $20,000 (si cada ticket cuesta $1,000)

## 📝 Checklist para el Backend

- [ ] Al crear un QR code en la colección `qrs`, incrementar `tickets.selled` en 1
- [ ] Al crear múltiples QR codes, incrementar `tickets.selled` por la cantidad creada
- [ ] Verificar que el campo `selled` en la colección `tickets` se actualice correctamente
- [ ] Verificar que el endpoint `GET /events/admin/all` incluya el campo `selled` actualizado en cada ticket
- [ ] Probar generando QR codes y verificando que:
  - La colección `qrs` tenga los registros correctos
  - La colección `tickets` tenga el campo `selled` actualizado
  - Las métricas en el frontend se actualicen correctamente

## 🐛 Debug en el Frontend

He agregado logs de depuración en el frontend. Al abrir la consola del navegador en la página de métricas, verás:

```
📊 Eventos recibidos para métricas: X
📋 Ejemplo de evento: { title, tickets: [...] }
🎫 Evento "Nombre": { totalSold, totalRevenue, tickets: [...] }
📈 Métricas calculadas: { totalTicketsSold, totalRevenue, ... }
```

Estos logs ayudarán a identificar si el problema es:
- El backend no envía los datos correctos
- El frontend no los procesa correctamente

## 🎯 Prioridad

**ALTA** - Las métricas son fundamentales para el panel de administración y deben reflejar los datos reales de ventas.
