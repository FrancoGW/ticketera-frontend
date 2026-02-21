/**
 * Validación de contraseñas seguras.
 * Requisitos: mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial.
 */

const MIN_LENGTH = 8;
const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /\d/;
const HAS_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

/** Lista de requisitos para mostrar en la UI */
export const PASSWORD_REQUIREMENTS = [
  `Mínimo ${MIN_LENGTH} caracteres`,
  "Al menos una letra mayúscula",
  "Al menos una letra minúscula",
  "Al menos un número",
  "Al menos un carácter especial (!@#$%^&* etc.)",
];

/**
 * Valida que la contraseña cumpla todos los requisitos de seguridad.
 * @param {string} password - Contraseña a validar
 * @returns {{ valid: boolean, message?: string }} valid true si cumple; si no, message con el error
 */
export function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "La contraseña es requerida" };
  }
  if (password.length < MIN_LENGTH) {
    return {
      valid: false,
      message: `La contraseña debe tener al menos ${MIN_LENGTH} caracteres`,
    };
  }
  if (!HAS_UPPERCASE.test(password)) {
    return {
      valid: false,
      message: "La contraseña debe incluir al menos una letra mayúscula",
    };
  }
  if (!HAS_LOWERCASE.test(password)) {
    return {
      valid: false,
      message: "La contraseña debe incluir al menos una letra minúscula",
    };
  }
  if (!HAS_NUMBER.test(password)) {
    return {
      valid: false,
      message: "La contraseña debe incluir al menos un número",
    };
  }
  if (!HAS_SPECIAL.test(password)) {
    return {
      valid: false,
      message:
        "La contraseña debe incluir al menos un carácter especial (!@#$%^&* etc.)",
    };
  }
  return { valid: true };
}

/**
 * Para uso en formularios: devuelve mensaje de error o null si es válida.
 * @param {string} password
 * @returns {string|null}
 */
export function getPasswordError(password) {
  const result = validatePassword(password);
  return result.valid ? null : result.message;
}

const TOTAL_REQUIREMENTS = 5;

/**
 * Devuelve qué requisitos cumple la contraseña (para barra de fortaleza y listado).
 * @param {string} password
 * @returns {{ fulfilled: boolean[], count: number, percent: number }}
 */
export function getPasswordStrength(password) {
  const p = password || "";
  const fulfilled = [
    p.length >= MIN_LENGTH,
    HAS_UPPERCASE.test(p),
    HAS_LOWERCASE.test(p),
    HAS_NUMBER.test(p),
    HAS_SPECIAL.test(p),
  ];
  const count = fulfilled.filter(Boolean).length;
  const percent = Math.round((count / TOTAL_REQUIREMENTS) * 100);
  return { fulfilled, count, percent };
}
