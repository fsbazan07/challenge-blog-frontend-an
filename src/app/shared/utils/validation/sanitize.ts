import { RE_DISALLOWED_CONTENT, RE_DISALLOWED_EXCERPT, RE_DISALLOWED_TITLE } from './regex';

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
  return value.replace(/\s/g, '');
}

export function sanitizePassword(value: string): string {
  return value.replace(/[^A-Za-z0-9!@#$%^&*()_\-+=\\[\]{}|;:,.?/]/g, '');
}

function normalizeText(v: string) {
  return v.normalize('NFKC');
}

export function sanitizePostTitle(value: string): string {
  const v = normalizeText(value);
  return v.replace(RE_DISALLOWED_TITLE, '');
}

export function sanitizePostExcerpt(value: string): string {
  const v = normalizeText(value);
  return v.replace(RE_DISALLOWED_EXCERPT, '');
}

export function sanitizePostContent(value: string): string {
  const v = normalizeText(value);
  return v.replace(RE_DISALLOWED_CONTENT, '');
}
