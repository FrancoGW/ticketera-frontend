# Instrucciones para Actualizar Header de Emails - GetPass

## 🎯 Objetivo
Eliminar el header actual con imagen/logo y crear un nuevo header que use los colores principales de la marca GetPass del frontend.

---

## ❌ ELIMINAR Header Actual

**Buscar y ELIMINAR completamente esta sección en TODOS los templates:**

```html
<!-- ELIMINAR ESTO COMPLETAMENTE -->
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
```

**O cualquier variación que tenga:**
- Imagen del header
- Logo/imagen de Cloudinary
- Cualquier `<img>` en el header

---

## ✅ Colores de la Marca GetPass (Frontend)

**Estos son los colores que usa GetPass en el frontend:**

| Elemento | Color | Código Hex | Uso |
|----------|-------|------------|-----|
| **Header Background** | Negro | `#000000` | Header principal del sitio |
| **Footer Background** | Negro | `#000000` | Footer principal del sitio |
| **Texto sobre Negro** | Blanco | `#ffffff` | Texto en header/footer |
| **Acentos Morados** | Morado claro | `#b78dea` | Botones, acentos, hover |
| | Morado oscuro | `#9d6dd8` | Gradientes, efectos |
| **Fondo Email** | Blanco | `#ffffff` | Fondo del contenido |
| **Texto Principal** | Negro/Gris oscuro | `#000000` o `#1a1a1a` | Texto del cuerpo |
| **Borde** | Gris claro | `#cccccc` | Bordes del contenedor |

**⚠️ IMPORTANTE:**
- El color principal de GetPass es **NEGRO** (`#000000`), NO morado
- El morado (`#b78dea`, `#9d6dd8`) es solo para acentos y efectos
- El header debe ser **NEGRO** como en el frontend

---

## ✅ NUEVO Header para Emails

**REEMPLAZAR con este header nuevo:**

```html
<!-- NUEVO HEADER - COLOR PRINCIPAL NEGRO -->
<tr>
  <td align="center" style="background:#000000;padding:40px 0 30px 0;">
    <h1 style="font-size:32px;margin:0;font-family:Arial,sans-serif;color:#ffffff;font-weight:300;letter-spacing:2px;">
      GetPass
    </h1>
  </td>
</tr>
```

**O si quieren un header más elegante con gradiente morado sutil:**

```html
<!-- OPCIÓN 2: Header con gradiente morado sutil -->
<tr>
  <td align="center" style="background:linear-gradient(135deg, #b78dea 0%, #9d6dd8 100%);padding:40px 0 30px 0;">
    <h1 style="font-size:32px;margin:0;font-family:Arial,sans-serif;color:#ffffff;font-weight:300;letter-spacing:2px;">
      GetPass
    </h1>
  </td>
</tr>
```

**Recomendación:** Usar la **OPCIÓN 1 (negro)** para mantener consistencia con el frontend.

---

## 🎨 Footer - Actualizar Color

**El footer también debe usar el color principal (negro):**

```html
<!-- FOOTER CORRECTO -->
<tr>
  <td style="padding:30px;background:#000000;">
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

**Cambiar de:**
- `background:#7253c9` (morado) 
- `background:#ee4c50` (rojo)

**A:**
- `background:#000000` (negro - color principal)

---

## 📋 Resumen de Cambios

### Header
- ❌ **ELIMINAR**: Toda la sección `<tr><td>` con la imagen
- ✅ **AGREGAR**: Header simple con fondo negro `#000000` y texto "GetPass" en blanco

### Footer
- ❌ **CAMBIAR**: De `#7253c9` (morado) o `#ee4c50` (rojo)
- ✅ **A**: `#000000` (negro)

### Colores Principales
- **Header**: `#000000` (negro)
- **Footer**: `#000000` (negro)
- **Texto Header/Footer**: `#ffffff` (blanco)
- **Fondo Contenido**: `#ffffff` (blanco)
- **Texto Contenido**: `#000000` o `#1a1a1a` (negro/gris oscuro)

---

## 🔍 Búsqueda para Encontrar Headers

**Buscar en todos los archivos .hbs:**

```bash
# Buscar headers con imagen
grep -r "headerMail_eyufxh" src/mailer/templates-hbs/
grep -r "background:#70bbd9" src/mailer/templates-hbs/

# Buscar footers con colores incorrectos
grep -r "background:#7253c9" src/mailer/templates-hbs/
grep -r "background:#ee4c50" src/mailer/templates-hbs/
```

---

## 📝 Ejemplo Completo Actualizado

```html
<!-- HEADER NUEVO -->
<tr>
  <td align="center" style="background:#000000;padding:40px 0 30px 0;">
    <h1 style="font-size:32px;margin:0;font-family:Arial,sans-serif;color:#ffffff;font-weight:300;letter-spacing:2px;">
      GetPass
    </h1>
  </td>
</tr>

<!-- CONTENIDO -->
<tr>
  <td style="padding:36px 30px 42px 30px; text-align:center;">
    <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
      <tr>
        <td style="padding:0 0 36px 0;color:#000000;">
          <h1 style="font-size:24px;margin:0 0 20px 0;font-family:Arial,sans-serif;">
            Bienvenido a GetPass!
          </h1>
          <!-- Contenido del email -->
        </td>
      </tr>
    </table>
  </td>
</tr>

<!-- FOOTER NUEVO -->
<tr>
  <td style="padding:30px;background:#000000;">
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

1. **NO usar morado** (`#7253c9`, `#70bbd9`) como color principal
2. **NO usar rojo** (`#ee4c50`) en ningún lugar
3. **ELIMINAR todas las imágenes** del header
4. **Usar NEGRO** (`#000000`) como color principal (header y footer)
5. **Texto blanco** (`#ffffff`) sobre fondo negro

---

## 🎨 Paleta de Colores GetPass (Completa)

| Color | Código | Uso |
|-------|--------|-----|
| Negro Principal | `#000000` | Header, Footer |
| Blanco | `#ffffff` | Texto sobre negro, fondo contenido |
| Negro/Gris Oscuro | `#000000` / `#1a1a1a` | Texto principal del contenido |
| Morado Claro (Acento) | `#b78dea` | Solo para acentos, NO como color principal |
| Morado Oscuro (Acento) | `#9d6dd8` | Solo para gradientes, NO como color principal |
| Gris Claro | `#cccccc` | Bordes |

---

**Fecha**: Enero 2025  
**Prioridad**: Alta - El header actual no coincide con la marca GetPass
