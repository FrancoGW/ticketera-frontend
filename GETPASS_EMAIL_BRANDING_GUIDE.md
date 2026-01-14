# Guía de Branding y Estilo para Emails - GetPass

Este documento detalla los colores, estilos y branding que deben usar todos los templates de email de GetPass.

## 🎨 Paleta de Colores

### Colores Principales

| Color | Código Hex | Uso |
|-------|------------|-----|
| **Primary (Morado Principal)** | `#7253c9` | Footer, botones principales, acentos |
| **Header Background** | `#70bbd9` | Fondo del header (azul claro) |
| **Text Primary** | `#153643` | Texto principal del cuerpo |
| **Text Footer** | `#ffffff` | Texto del footer (blanco) |
| **Background** | `#ffffff` | Fondo del email (blanco) |
| **Border** | `#cccccc` | Bordes del contenedor |

### Colores Alternativos (No usar en emails estándar)

- `#ee4c50` (Rojo) - **NO USAR** en emails estándar, solo en casos especiales si se requiere

## 📝 Branding

### Nombre de la Marca
- **Nombre correcto**: `GetPass`
- **Nombres incorrectos**: `Pase Ticket`, `PaseTicket`, `pase ticket`
- **Formato**: Siempre usar "GetPass" con G y P mayúsculas

### Textos Estándar

#### Header/Título Principal
```html
<h1>Bienvenido a GetPass!</h1>
<!-- O según el contexto -->
<h1>Hola, somos GetPass!</h1>
```

#### Footer
```html
<p>
  &reg; Todos los derechos reservados @GetPass {{currentYear}}<br />
</p>
```

## 🎨 Estructura Visual Estándar

### Layout Base

Todos los emails deben seguir esta estructura:

```
┌─────────────────────────────────┐
│  HEADER (Azul claro #70bbd9)    │
│  [Logo/Imagen GetPass]          │
│  Altura: 200px                   │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  CONTENIDO (Blanco #ffffff)     │
│  Padding: 36px 30px 42px 30px   │
│  Texto: #153643                  │
│  [Contenido del email]          │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  FOOTER (Morado #7253c9)        │
│  Padding: 30px                   │
│  Texto: #ffffff                  │
│  © GetPass {{currentYear}}       │
└─────────────────────────────────┘
```

### Dimensiones

- **Ancho máximo**: `600px`
- **Header altura**: `200px`
- **Padding contenido**: `36px 30px 42px 30px` (top right bottom left)
- **Padding footer**: `30px`

### Tipografía

- **Fuente**: `Arial, sans-serif`
- **Título (h1)**: `24px`, `margin: 0 0 20px 0`
- **Texto (p)**: `16px`, `line-height: 24px`
- **Footer**: `14px`, `line-height: 16px`

## 📐 Template Base HTML

```html
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>GetPass</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    table, td, div, h1, p {font-family: Arial, sans-serif;}
  </style>
</head>
<body style="margin:0;padding:0;">
  <table
    role="presentation"
    style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff; max-width:600px;"
  >
    <tr>
      <td align="center" style="padding:0;">
        <table
          role="presentation"
          style="width:100%;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;"
        >
          <!-- HEADER -->
          <tr>
            <td align="center" style="background:#70bbd9;padding:40px 0 30px 0;">
              <img
                src="https://res.cloudinary.com/ddbkkeubj/image/upload/v1677785087/headerMail_eyufxh.png"
                alt="GetPass"
                style="display:block;"
                width="100%"
                height="200px"
              />
            </td>
          </tr>
          
          <!-- CONTENIDO -->
          <tr>
            <td style="padding:36px 30px 42px 30px; text-align:center;">
              <table
                role="presentation"
                style="width:100%;border-collapse:collapse;border:0;border-spacing:0;"
              >
                <tr>
                  <td style="padding:0 0 36px 0;color:#153643;">
                    <!-- CONTENIDO ESPECÍFICO AQUÍ -->
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="padding:30px;background:#7253c9;">
              <table
                role="presentation"
                style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;"
              >
                <tr>
                  <td style="padding:0;width:50%;" align="left">
                    <p
                      style="margin:0;font-size:14px;line-height:16px;font-family:Arial,sans-serif;color:#ffffff;"
                    >
                      &reg; Todos los derechos reservados @GetPass {{currentYear}}<br />
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## 🔄 Cambios Requeridos en Templates Existentes

### 1. Reemplazar Nombres

**Buscar y reemplazar:**
- `Pase Ticket` → `GetPass`
- `PaseTicket` → `GetPass`
- `@PaseTicket` → `@GetPass`
- `pase ticket` → `GetPass`

### 2. Estandarizar Colores del Footer

**Cambiar:**
- Footer con `background:#ee4c50` (rojo) → `background:#7253c9` (morado)
- Todos los footers deben usar `#7253c9`

### 3. Estandarizar Textos

**Títulos comunes:**
- `"Bienvenido a Pase Ticket!"` → `"Bienvenido a GetPass!"`
- `"Hola somos Pase Ticket!"` → `"Hola, somos GetPass!"`

## 📋 Checklist de Actualización

Para cada template, verificar:

- [ ] Nombre "GetPass" correcto (no "Pase Ticket")
- [ ] Footer con color `#7253c9` (morado)
- [ ] Header con color `#70bbd9` (azul claro)
- [ ] Texto principal con color `#153643`
- [ ] Footer con texto blanco `#ffffff`
- [ ] Copyright: `@GetPass {{currentYear}}`
- [ ] Logo/header image correcta
- [ ] Estructura HTML consistente
- [ ] Variables Handlebars correctas

## 🎯 Templates que Necesitan Actualización

1. ✅ `welcome-email.hbs` - Cambiar "Pase Ticket" → "GetPass", footer a morado
2. ✅ `recover-password-email.hbs` - Cambiar "Pase Ticket" → "GetPass", footer a morado
3. ✅ `qr-email.hbs` - Cambiar footer a morado, verificar branding
4. ✅ `courtesy-ticket-email.hbs` - Cambiar footer a morado, verificar branding
5. ✅ `invitation-email.hbs` - Cambiar "@PaseTicket" → "@GetPass", footer a morado
6. ✅ `ticket-transfer-email.hbs` - Cambiar footer a morado, verificar branding
7. ✅ `update-email-email.hbs` - Cambiar "Pase Ticket" → "GetPass", footer a morado
8. ✅ `update-password-email.hbs` - Cambiar "Pase Ticket" → "GetPass", footer a morado
9. ✅ `verify-new-email-email.hbs` - Cambiar "Pase Ticket" → "GetPass", footer a morado

## 📝 Notas Importantes

1. **Consistencia**: Todos los emails deben verse consistentes con la marca GetPass
2. **Responsive**: Los emails deben verse bien en móviles (max-width: 600px)
3. **Accesibilidad**: Usar colores con buen contraste
4. **Imágenes**: El header image debe ser actualizado si hay una nueva versión del logo GetPass
5. **Variables**: Mantener todas las variables Handlebars funcionando correctamente

## 🔗 Recursos

- **Logo/Header Image**: `https://res.cloudinary.com/ddbkkeubj/image/upload/v1677785087/headerMail_eyufxh.png`
- **Frontend URL**: Usar variable de entorno para URLs dinámicas
- **Año actual**: Variable `{{currentYear}}` se genera automáticamente

---

**Última actualización**: Enero 2025  
**Versión**: 2.0 (Migración de Pase Ticket a GetPass)
