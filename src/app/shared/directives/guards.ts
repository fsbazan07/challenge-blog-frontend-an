import {
  sanitizeAlphaNumeric,
  sanitizeAlphaNumericSpaces,
  sanitizeEmail,
  sanitizeOnlyLetters,
  sanitizeOnlyNumbers,
  sanitizePassword,
  sanitizePostContent,
  sanitizePostExcerpt,
  sanitizePostTitle,
} from '../utils/validation/sanitize';

export const ngGuards = {
  onlyLetters: {
    allowedChar: /[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]/,
    sanitize: sanitizeOnlyLetters,
    allowSpaces: true,
  },
  onlyNumbers: {
    allowedChar: /[0-9]/,
    sanitize: sanitizeOnlyNumbers,
    allowSpaces: false,
  },
  alphaNumeric: {
    allowedChar: /[A-Za-z0-9]/,
    sanitize: sanitizeAlphaNumeric,
    allowSpaces: false,
  },
  alphaNumericSpaces: {
    allowedChar: /[A-Za-z0-9]/,
    sanitize: sanitizeAlphaNumericSpaces,
    allowSpaces: true,
  },
  email: {
    // email: no conviene bloquear mucho en keydown, pero sí sanitizar espacios
    sanitize: sanitizeEmail,
    allowSpaces: false,
  },
  password: {
    sanitize: sanitizePassword,
    allowSpaces: false,
  },
  postTitle: {
    sanitize: sanitizePostTitle,
    allowSpaces: true,
  },
  postExcerpt: {
    sanitize: sanitizePostExcerpt,
    allowSpaces: true,
  },
  postContent: {
    sanitize: sanitizePostContent,
    allowSpaces: true,
  },
} as const;
