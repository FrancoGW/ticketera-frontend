# Requisitos del Backend para Gestión de Templates de Email

Este documento describe los endpoints que el backend debe implementar para que el panel de administración de emails funcione correctamente.

## Endpoints Requeridos

### 1. GET `/admin/email-templates`
**Descripción:** Obtiene todos los templates de email disponibles

**Autenticación:** Requerida (solo admin)

**Respuesta Exitosa (200):**
```json
{
  "welcome": {
    "type": "welcome",
    "subject": "Bienvenido a GetPass",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "password-reset": {
    "type": "password-reset",
    "subject": "Recuperar contraseña",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "qr": {
    "type": "qr",
    "subject": "Tu código QR",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "courtesy-ticket": {
    "type": "courtesy-ticket",
    "subject": "Tu ticket de cortesía",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "invitation": {
    "type": "invitation",
    "subject": "Tus tickets",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "ticket-transfer": {
    "type": "ticket-transfer",
    "subject": "Transferencia de ticket",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "update-email": {
    "type": "update-email",
    "subject": "Actualizar email",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "update-password": {
    "type": "update-password",
    "subject": "Actualizar contraseña",
    "body": "<html>...template HTML con Handlebars...</html>"
  },
  "verify-new-email": {
    "type": "verify-new-email",
    "subject": "Verificar nuevo email",
    "body": "<html>...template HTML con Handlebars...</html>"
  }
}
```

**Alternativa (Array):**
```json
[
  {
    "type": "welcome",
    "subject": "Bienvenido a GetPass",
    "body": "<html>...</html>"
  },
  {
    "type": "password-reset",
    "subject": "Recuperar contraseña",
    "body": "<html>...</html>"
  },
  ...
]
```

**Respuesta si no existen templates (404):**
```json
{
  "message": "Templates no encontrados"
}
```

---

### 2. GET `/admin/email-templates/:type`
**Descripción:** Obtiene un template específico por tipo

**Autenticación:** Requerida (solo admin)

**Parámetros:**
- `type` (path): Tipo de template. Valores posibles:
  - `welcome`
  - `password-reset`
  - `qr`
  - `courtesy-ticket`
  - `invitation`
  - `ticket-transfer`
  - `update-email`
  - `update-password`
  - `verify-new-email`

**Respuesta Exitosa (200):**
```json
{
  "type": "welcome",
  "subject": "Bienvenido a GetPass",
  "body": "<html lang=\"en\">...template HTML completo con Handlebars...</html>"
}
```

**Respuesta si no existe (404):**
```json
{
  "message": "Template no encontrado"
}
```

---

### 3. PUT `/admin/email-templates/:type`
**Descripción:** Actualiza un template de email

**Autenticación:** Requerida (solo admin)

**Parámetros:**
- `type` (path): Tipo de template (mismos valores que GET)

**Body:**
```json
{
  "subject": "Nuevo asunto del email",
  "body": "<html>...nuevo template HTML con Handlebars...</html>"
}
```

**Respuesta Exitosa (200):**
```json
{
  "type": "welcome",
  "subject": "Nuevo asunto del email",
  "body": "<html>...template actualizado...</html>",
  "updatedAt": "2024-01-14T19:00:00.000Z"
}
```

**Errores:**
- **400 Bad Request:** Si el body o subject están vacíos o son inválidos
- **404 Not Found:** Si el tipo de template no existe
- **500 Internal Server Error:** Si hay un error al guardar

---

## Estructura de Templates

Los templates son archivos **Handlebars (.hbs)** que contienen HTML. El backend debe:

1. **Almacenar los templates** en formato HTML con sintaxis Handlebars
2. **Validar** que el HTML sea válido antes de guardar
3. **Reemplazar variables** al enviar emails usando Handlebars
4. **Mantener compatibilidad** con los templates existentes en `src/mailer/templates-hbs/`

### Variables Comunes en Templates

Todos los templates pueden usar:
- `{{currentYear}}` - Año actual (se genera automáticamente)

Variables específicas por tipo:

#### Welcome (`welcome`)
- `{{verifyUrl}}` - URL para verificar el email

#### Password Reset (`password-reset`)
- `{{recoverUrl}}` - URL para recuperar contraseña

#### QR (`qr`)
- `{{qrImage}}` - Imagen QR (se envía como attachment con CID: `cid:qr`)

#### Courtesy Ticket (`courtesy-ticket`)
- `{{eventTitle}}` - Título del evento
- `{{ticketTitle}}` - Título del ticket
- `{{qrImage}}` - Imagen QR (CID: `cid:qr`)

#### Invitation (`invitation`)
- `{{eventTitle}}` - Título del evento
- `{{ticketTitle}}` - Título del ticket
- `{{qrImages}}` - Array de imágenes QR (CID: `cid:0-qr`, `cid:1-qr`, etc.)

#### Ticket Transfer (`ticket-transfer`)
- `{{eventTitle}}` - Título del evento
- `{{ticketTitle}}` - Título del ticket
- `{{transferType}}` - Tipo: `"sender"` o `"receiver"`

#### Update Email (`update-email`)
- `{{updateUrl}}` - URL para actualizar email

#### Update Password (`update-password`)
- `{{updateUrl}}` - URL para actualizar contraseña

#### Verify New Email (`verify-new-email`)
- `{{verifyUrl}}` - URL para verificar el nuevo email

---

## Validaciones Recomendadas

1. **Validar HTML:** Asegurarse de que el HTML sea válido
2. **Validar Handlebars:** Verificar que las variables usadas sean válidas
3. **Sanitizar:** Limpiar el HTML para prevenir XSS (aunque Handlebars ya escapa por defecto)
4. **Tamaño máximo:** Limitar el tamaño del body (ej: 50KB)

---

## Notas Importantes

1. **Formato:** Los templates deben ser HTML completo, no solo fragmentos
2. **Handlebars:** El backend debe usar Handlebars para renderizar los templates al enviar emails
3. **Attachments:** Los QR codes se envían como attachments con Content-ID (CID)
4. **Backward Compatibility:** Los templates existentes en `src/mailer/templates-hbs/` deben seguir funcionando
5. **Default Templates:** Si no existen templates en la BD, usar los archivos .hbs por defecto

---

## Ejemplo de Implementación

```javascript
// GET /admin/email-templates
router.get('/admin/email-templates', authenticateAdmin, async (req, res) => {
  try {
    // Obtener templates de la BD o archivos por defecto
    const templates = await EmailTemplate.findAll();
    
    // Si no hay templates, leer de archivos .hbs
    if (templates.length === 0) {
      const defaultTemplates = await loadDefaultTemplates();
      return res.json(defaultTemplates);
    }
    
    // Convertir a formato esperado por frontend
    const templatesObj = {};
    templates.forEach(t => {
      templatesObj[t.type] = {
        type: t.type,
        subject: t.subject,
        body: t.body
      };
    });
    
    res.json(templatesObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /admin/email-templates/:type
router.put('/admin/email-templates/:type', authenticateAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { subject, body } = req.body;
    
    // Validar
    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject y body son requeridos' });
    }
    
    // Validar HTML básico
    if (!isValidHTML(body)) {
      return res.status(400).json({ message: 'HTML inválido' });
    }
    
    // Guardar o actualizar
    const template = await EmailTemplate.findOneAndUpdate(
      { type },
      { subject, body, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

---

## Testing

Para probar los endpoints:

```bash
# Obtener todos los templates
curl -X GET http://localhost:3000/admin/email-templates \
  -H "Authorization: Bearer <admin-token>"

# Obtener un template específico
curl -X GET http://localhost:3000/admin/email-templates/welcome \
  -H "Authorization: Bearer <admin-token>"

# Actualizar un template
curl -X PUT http://localhost:3000/admin/email-templates/welcome \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Bienvenido a GetPass!",
    "body": "<html>...</html>"
  }'
```

---

## Prioridad de Implementación

1. **Alta:** `welcome`, `password-reset`, `qr` (los 3 principales que mencionó el usuario)
2. **Media:** `courtesy-ticket`, `invitation`, `ticket-transfer`
3. **Baja:** `update-email`, `update-password`, `verify-new-email`
