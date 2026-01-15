# 🔧 Endpoint de Payments para Métricas

## 📋 Problema Identificado

El frontend necesita calcular las métricas usando los datos reales de los `payments` en lugar de calcular desde `ticket.price * ticket.selled`, porque:

1. **`amount`**: Lo que pagó el cliente por las entradas (ej: $246,000)
2. **`serviceFee`**: Gasto por servicio que se le cobró (ej: $49,200)
3. **`commission`**: Comisión/ganancia (ej: $49,200)
4. **`totalAmount`**: Total pagado (ej: $295,200)

El cálculo actual usa `ticket.price * ticket.selled`, lo cual no refleja los valores reales de los payments.

## ✅ Solución Requerida

### Endpoint: `GET /payment/admin/approved`

Crear un endpoint que devuelva todos los payments con `paymentStatus: 'approved'`.

**Estructura esperada de la respuesta:**

```javascript
{
  payments: [
    {
      _id: "...",
      operationId: "GEN-1768443188298-cd8h84lqz",
      user: "...",
      customerData: {
        email: "quimeygaray@gmail.com",
        identification: "87654321",
        name: "Quimey Garay"
      },
      paymentStatus: "approved",
      tickets: [
        {
          ticketId: {
            _id: "69605b76d7e80c970c3c6258"
          },
          quantity: 20
        }
      ],
      selectedDate: {
        timestampStart: 1769162400000,
        timestampEnd: 1769205600000
      },
      amount: 246000,        // ⚠️ Lo que pagó el cliente por las entradas
      serviceFee: 49200,    // ⚠️ Gasto por servicio
      commission: 49200,    // ⚠️ Comisión/ganancia
      totalAmount: 295200,  // Total pagado
      createdAt: "...",
      updatedAt: "..."
    }
  ]
}
```

### Campos Importantes

- **`amount`**: Lo que pagó el cliente por las entradas (NO incluye serviceFee ni commission)
- **`serviceFee`**: Gasto por servicio cobrado al cliente
- **`commission`**: Comisión/ganancia de GetPass
- **`tickets[].ticketId`**: ID del ticket (para relacionar con eventos)
- **`tickets[].quantity`**: Cantidad de tickets vendidos

### Autenticación

- Requiere autenticación de admin
- Header: `Authorization: Bearer <token>`

## 🔄 Cálculo de Métricas

El frontend ahora calculará:

1. **Tickets Vendidos**: Suma de `tickets[].quantity` de todos los payments aprobados
2. **Ingresos Totales**: Suma de `amount` de todos los payments aprobados (lo que pagó el cliente)
3. **Ganancias en Comisiones**: Suma de `commission` de todos los payments aprobados

### Ejemplo

Si hay un payment con:
- `amount: 246000`
- `commission: 49200`
- `tickets: [{ quantity: 20 }]`

Las métricas mostrarán:
- **Tickets Vendidos**: 20
- **Ingresos Totales**: $246,000
- **Ganancias en Comisiones**: $49,200

## 🗺️ Relación con Eventos

El frontend relacionará payments con eventos a través de:
1. Obtener todos los eventos y crear un mapa `ticketId -> eventId`
2. Para cada payment, buscar los `ticketId` en `payment.tickets[].ticketId`
3. Asignar el payment al evento correspondiente

## 📝 Checklist para el Backend

- [ ] Crear endpoint `GET /payment/admin/approved`
- [ ] Devolver solo payments con `paymentStatus: 'approved'`
- [ ] Incluir todos los campos necesarios: `amount`, `serviceFee`, `commission`, `tickets`
- [ ] Requerir autenticación de admin
- [ ] Probar que el endpoint devuelva los datos correctos

## 🎯 Prioridad

**ALTA** - Las métricas deben reflejar los valores reales de los payments, no cálculos estimados.
