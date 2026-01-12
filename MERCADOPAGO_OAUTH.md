# Integración OAuth de Mercado Pago para Split de Pagos

## Contexto
La plataforma usa **split de pagos** de Mercado Pago donde:
- La cuenta principal (plataforma) recibe las comisiones
- Los organizadores reciben el resto del pago
- Los organizadores necesitan autorizar su cuenta de Mercado Pago

## Endpoints necesarios en el Backend

### 1. Iniciar autorización OAuth
**GET/POST** `/payment/mercadopago/authorize` o `/payment/mercadopago/connect`

**Respuesta esperada:**
```json
{
  "authorizationUrl": "https://auth.mercadopago.com/authorization?...",
  "state": "unique-state-token"
}
```

### 2. Callback OAuth (manejado por el backend)
**GET** `/payment/mercadopago/callback?code=xxx&state=xxx`

El backend debe:
- Intercambiar el código por tokens
- Guardar los tokens del organizador
- Actualizar el estado de `mercadoPagoConfigured` del usuario

### 3. Verificar estado de autorización
**GET** `/users/mercadopago/status` o incluir en `/auth/check-status`

**Respuesta esperada:**
```json
{
  "mercadoPagoConfigured": true,
  "mercadoPagoAuthorized": true,
  "mercadoPagoUserId": "123456"
}
```

### 4. Desconectar cuenta (opcional)
**POST** `/payment/mercadopago/disconnect`

## Flujo en el Frontend

1. Usuario hace clic en "Configurar Mercado Pago"
2. Frontend llama a `/payment/mercadopago/authorize`
3. Backend genera URL de autorización OAuth
4. Frontend redirige al usuario a esa URL
5. Usuario autoriza en Mercado Pago
6. Mercado Pago redirige al callback del backend
7. Backend procesa el callback y guarda tokens
8. Backend redirige al frontend a una página de éxito
9. Frontend verifica el estado actualizado
