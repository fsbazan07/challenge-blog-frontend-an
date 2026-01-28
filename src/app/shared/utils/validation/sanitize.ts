export function sanitizeOnlyLetters(value: string): string {
  return value.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]/g, '');
}

export function sanitizeOnlyNumbers(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

export function sanitizeAlphaNumeric(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '');
}

export function sanitizeAlphaNumericSpaces(value: string): string {
  return value.replace(/[^A-Za-z0-9\s]/g, '');
}

export function sanitizeEmail(value: string): string {
  // no “valida”, solo evita espacios
  return value.replace(/\s/g, '');
}

export function sanitizePassword(value: string): string {
  return value.replace(/[^A-Za-z0-9!@#$%^&*()_\-+=\\[\]{}|;:,.?/]/g, '');
}
