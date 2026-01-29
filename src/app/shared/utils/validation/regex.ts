export const REGEX_ONLY_LETTERS = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;

export const REGEX_ONLY_NUMBERS = /^[0-9]+$/;

export const REGEX_ALPHANUMERIC = /^[A-Za-z0-9]+$/;

export const REGEX_ALPHANUMERIC_SPACES = /^[A-Za-z0-9\s]+$/;

export const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REGEX_PASSWORD_SAFE = /^[A-Za-z0-9!@#$%^&*()_+=[\]{}|;:,.?/-]+$/;

export const RE_DISALLOWED_TITLE = /[^A-Za-z0-9ÁÉÍÓÚÜáéíóúüÑñ\s.,:;!¡¿?"()-]/g;
export const RE_DISALLOWED_EXCERPT = /[^A-Za-z0-9ÁÉÍÓÚÜáéíóúüÑñ\s.,:;!¡¿?"()-]/g;
export const RE_DISALLOWED_CONTENT = /[<>]/g;
