# Instrucciones para Actualizar Templates de Email - GetPass

## 🎯 Objetivo
Actualizar todos los templates de email para usar el nuevo branding de GetPass, colores correctos y eliminar referencias a "Pase Ticket".

---

## ❌ Cambios Requeridos

### 1. **Eliminar Header con "PASE TICKET" y Logo Viejo**

**Buscar y ELIMINAR completamente esta sección del header:**

```html
<!-- ELIMINAR ESTO -->
<tr>
  <td align="center" style="background:#70bbd9;">
    <img
      src="https://res.cloudinary.com/ddbkkeubj/image/upload/v1677785087/headerMail_eyufxh.png"
      alt=""
      style="display:block;"
      width="100%"
      height="200px"
    />
  </td>
</tr>
```

**O cualquier header que contenga:**
- Texto "PASE TICKET"
- Logo/imagen con "Pase Ticket"
- Cualquier referencia visual a la marca antigua

### 2. **Reemplazar con Header Simple de GetPass**

**REEMPLAZAR con este header:**

```html
<!-- NUEVO HEADER -->
<tr>
  <td align="center" style="background:#70bbd9;padding:40px 0 30px 0;">
    <h1 style="font-size:32px;margin:0;font-family:Arial,sans-serif;color:#ffffff;font-weight:bold;letter-spacing:2px;">
      GetPass
    </h1>
  </td>
</tr>
```

**O si prefieren mantener una imagen, usar un logo nuevo de GetPass (si existe):**

```html
<tr>
  <td align="center" style="background:#70bbd9;padding:40px 0 30px 0;">
    <img
      src="[URL_DEL_LOGO_GETPASS_NUEVO]"
      alt="GetPass"
      style="display:block;height:auto;max-height:80px;"
      width="auto"
    />
  </td>
</tr>
```

### 3. **Actualizar Colores del Footer**

**Buscar y REEMPLAZAR:**

```html
<!-- ANTES (INCORRECTO) -->
<td style="padding:30px;background:#ee4c50;">
```

**Por:**

```html
<!-- DESPUÉS (CORRECTO) -->
<td style="padding:30px;background:#7253c9;">
```

**⚠️ IMPORTANTE:** Todos los footers deben usar `#7253c9` (morado), NO `#ee4c50` (rojo).

### 4. **Reemplazar Textos "Pase Ticket" por "GetPass"**

**Buscar y reemplazar en TODOS los templates:**

| Buscar | Reemplazar por |
|--------|----------------|
| `Pase Ticket` | `GetPass` |
| `PaseTicket` | `GetPass` |
| `@PaseTicket` | `@GetPass` |
| `pase ticket` | `GetPass` |
| `PASE TICKET` | `GetPass` |

**Ejemplos específicos:**

```html
<!-- ANTES -->
<h1>Bienvenido a Pase Ticket!</h1>
<h1>Hola somos Pase Ticket!</h1>
<p>&reg; Todos los derechos reservados @PaseTicket {{currentYear}}</p>
<p>&reg; Pase Ticket, {{currentYear}}</p>

<!-- DESPUÉS -->
<h1>Bienvenido a GetPass!</h1>
<h1>Hola, somos GetPass!</h1>
<p>&reg; Todos los derechos reservados @GetPass {{currentYear}}</p>
<p>&reg; GetPass, {{currentYear}}</p>
```

---

## ✅ Colores Correctos (Verificar en Todos los Templates)

| Elemento | Color Correcto | Código Hex |
|----------|----------------|------------|
| **Header Background** | Azul claro | `#70bbd9` |
| **Footer Background** | Morado | `#7253c9` ✅ |
| **Texto Principal** | Azul oscuro | `#153643` |
| **Texto Footer** | Blanco | `#ffffff` |
| **Fondo Email** | Blanco | `#ffffff` |
| **Borde** | Gris claro | `#cccccc` |

**❌ NO usar:**
- `#ee4c50` (rojo) - Este color NO debe aparecer en ningún template

---

## 📋 Checklist por Template

Actualizar estos 9 templates:

- [ ] `welcome-email.hbs`
  - [ ] Eliminar header con "PASE TICKET"
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Reemplazar "Pase Ticket" → "GetPass"

- [ ] `recover-password-email.hbs`
  - [ ] Eliminar header con "PASE TICKET"
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Reemplazar "Pase Ticket" → "GetPass"

- [ ] `qr-email.hbs`
  - [ ] Eliminar header con logo viejo
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Verificar branding

- [ ] `courtesy-ticket-email.hbs`
  - [ ] Eliminar header con logo viejo
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Verificar branding

- [ ] `invitation-email.hbs`
  - [ ] Eliminar header con logo viejo
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Reemplazar "@PaseTicket" → "@GetPass"

- [ ] `ticket-transfer-email.hbs`
  - [ ] Eliminar header con logo viejo
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Verificar branding

- [ ] `update-email-email.hbs`
  - [ ] Eliminar header con "PASE TICKET"
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Reemplazar "Pase Ticket" → "GetPass"

- [ ] `update-password-email.hbs`
  - [ ] Eliminar header con "PASE TICKET"
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Reemplazar "Pase Ticket" → "GetPass"

- [ ] `verify-new-email-email.hbs`
  - [ ] Eliminar header con "PASE TICKET"
  - [ ] Agregar header simple con "GetPass"
  - [ ] Cambiar footer a `#7253c9`
  - [ ] Reemplazar "Pase Ticket" → "GetPass"

---

## 🔍 Búsqueda Global

**Para encontrar todos los lugares a cambiar, buscar en todos los archivos .hbs:**

```bash
# Buscar referencias a Pase Ticket
grep -r "Pase Ticket" src/mailer/templates-hbs/
grep -r "PaseTicket" src/mailer/templates-hbs/
grep -r "PASE TICKET" src/mailer/templates-hbs/

# Buscar color rojo incorrecto
grep -r "#ee4c50" src/mailer/templates-hbs/

# Buscar header image viejo
grep -r "headerMail_eyufxh" src/mailer/templates-hbs/
```

---

## 📝 Ejemplo Completo de Template Actualizado

**Estructura correcta del header y footer:**

```html
<!-- HEADER CORRECTO -->
<tr>
  <td align="center" style="background:#70bbd9;padding:40px 0 30px 0;">
    <h1 style="font-size:32px;margin:0;font-family:Arial,sans-serif;color:#ffffff;font-weight:bold;letter-spacing:2px;">
      GetPass
    </h1>
  </td>
</tr>

<!-- CONTENIDO -->
<tr>
  <td style="padding:36px 30px 42px 30px; text-align:center;">
    <!-- Contenido del email aquí -->
    <h1>Bienvenido a GetPass!</h1>
    <!-- ... -->
  </td>
</tr>

<!-- FOOTER CORRECTO -->
<tr>
  <td style="padding:30px;background:#7253c9;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
      <tr>
        <td style="padding:0;width:50%;" align="left">
          <p style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;">
            &reg; Todos los derechos reservados @GetPass {{currentYear}}<br />
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
```

---

## ⚠️ Puntos Críticos

1. **NO dejar ningún footer con color rojo** (`#ee4c50`)
2. **NO dejar ningún header con "PASE TICKET" o logo viejo**
3. **NO dejar ninguna referencia a "Pase Ticket" en textos**
4. **TODOS los footers deben ser morado** (`#7253c9`)
5. **TODOS los headers deben mostrar "GetPass"**

---

## 🎨 Resumen Visual

**ANTES (Incorrecto):**
```
┌─────────────────────────┐
│ [Logo PASE TICKET]      │ ← ELIMINAR
│                         │
└─────────────────────────┘
│ Contenido...            │
│ "Hola somos Pase Ticket"│ ← CAMBIAR
└─────────────────────────┘
┌─────────────────────────┐
│ Footer ROJO #ee4c50     │ ← CAMBIAR
│ @PaseTicket            │ ← CAMBIAR
└─────────────────────────┘
```

**DESPUÉS (Correcto):**
```
┌─────────────────────────┐
│      GetPass            │ ← NUEVO
│                         │
└─────────────────────────┘
│ Contenido...            │
│ "Hola, somos GetPass"   │ ← CORRECTO
└─────────────────────────┘
┌─────────────────────────┐
│ Footer MORADO #7253c9   │ ← CORRECTO
│ @GetPass                │ ← CORRECTO
└─────────────────────────┘
```

---

## 📞 Si Tienen Dudas

- **Colores**: Ver `GETPASS_EMAIL_BRANDING_GUIDE.md`
- **Estructura**: Ver `BACKEND_EMAIL_API_REQUIREMENTS.md`
- **Templates actuales**: Ver `EMAIL_TEMPLATES.md`

---

**Fecha de actualización**: Enero 2025  
**Prioridad**: Alta - Todos los emails deben actualizarse antes de producción
