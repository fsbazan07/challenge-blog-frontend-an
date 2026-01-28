import {
  REGEX_ALPHANUMERIC,
  REGEX_ALPHANUMERIC_SPACES,
  REGEX_EMAIL,
  REGEX_ONLY_LETTERS,
  REGEX_ONLY_NUMBERS,
  REGEX_PASSWORD_SAFE,
} from './regex';

export function isOnlyLetters(value: string): boolean {
  const v = value.trim();
  return v.length === 0 ? false : REGEX_ONLY_LETTERS.test(v);
}

export function isOnlyNumbers(value: string): boolean {
  const v = value.trim();
  return v.length === 0 ? false : REGEX_ONLY_NUMBERS.test(v);
}

export function isAlphaNumeric(value: string): boolean {
  const v = value.trim();
  return v.length === 0 ? false : REGEX_ALPHANUMERIC.test(v);
}

export function isAlphaNumericSpaces(value: string): boolean {
  const v = value.trim();
  return v.length === 0 ? false : REGEX_ALPHANUMERIC_SPACES.test(v);
}

export function isEmail(value: string): boolean {
  const v = value.trim();
  return v.length === 0 ? false : REGEX_EMAIL.test(v);
}

export function isPasswordValid(value: string): boolean {
  const v = value.trim();

  if (v.length === 0) return false;
  if (v.length < 8) return false;
  if (v.length > 72) return false;

  return REGEX_PASSWORD_SAFE.test(v);
}
