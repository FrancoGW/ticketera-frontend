# 🔧 Corrección de Métricas - Tickets Vendidos

## 📋 Problema Identificado

Las métricas en el panel de administración muestran **0 tickets vendidos** y **$0 en ingresos**, a pesar de que el backend generó correctamente:
- ✅ 20 tickets
- ✅ 20 QR codes
- ✅ 1 Payment con status 'approved'
- ✅ Contador de tickets vendidos actualizado

## 🔍 Causa del Problema

El frontend calcula las métricas basándose en el campo `selled` de cada ticket individual:

```javascript
const totalSold = event.tickets?.reduce((sum, ticket) => sum + (ticket.selled || 0), 0) || 0;
const totalRevenue = event.tickets?.reduce((sum, ticket) => {
  return sum + ((ticket.price || 0) * (ticket.selled || 0));
}, 0) || 0;
```

**El problema:** Cuando se generan tickets directamente (script de generación masiva), el backend actualiza el contador general pero **NO actualiza el campo `selled` de cada ticket individual**.

## ✅ Solución Requerida en el Backend

### Opción 1: Actualizar campo `selled` al generar tickets (RECOMENDADO)

Cuando se generan tickets y se crean QR codes, el backend debe actualizar el campo `selled` del ticket correspondiente:

```javascript
// Ejemplo de lo que debe hacer el backend
// Al crear un QR code para un ticket:
await Ticket.findByIdAndUpdate(ticketId, {
  $inc: { selled: 1 }  // Incrementar el contador
});
```

### Opción 2: Endpoint dedicado para métricas

Crear un endpoint específico que calcule las métricas contando directamente desde la base de datos:

```javascript
// GET /admin/metrics
// Debe contar:
// - Total de QR codes creados (tickets vendidos reales)
// - Total de Payments con status 'approved' (ingresos reales)
// - Agrupar por evento
```

## 📊 Estructura de Datos Esperada

El frontend espera que cada ticket tenga el campo `selled` actualizado:

```javascript
{
  _id: "ticket_id",
  title: "General",
  price: 1000,
  selled: 20,  // ⚠️ ESTE CAMPO DEBE ESTAR ACTUALIZADO
  maxEntries: 100,
  // ... otros campos
}
```

## 🔄 Campos Alternativos que el Frontend Busca

He actualizado el frontend para que también busque en otros campos como fallback:
- `ticket.selled` (principal)
- `ticket.soldCount` (alternativo)
- `ticket.sold` (alternativo)

Pero **la solución correcta es que el backend actualice `selled`**.

## 🧪 Cómo Verificar

1. Generar tickets como lo hiciste (20 tickets, 20 QR codes)
2. Verificar en la base de datos que el campo `selled` del ticket esté actualizado a 20
3. Recargar la página de métricas en el frontend
4. Debería mostrar:
   - Total Entradas Vendidas: 20
   - Ingresos Totales: $20,000 (si cada ticket cuesta $1,000)

## 📝 Checklist para el Backend

- [ ] Al crear un QR code, incrementar `ticket.selled` en 1
- [ ] Al crear múltiples QR codes, incrementar `ticket.selled` por la cantidad creada
- [ ] Verificar que el campo `selled` se actualice correctamente en la base de datos
- [ ] Probar generando tickets y verificando que las métricas se actualicen

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
