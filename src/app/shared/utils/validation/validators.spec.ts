import {
  isOnlyLetters,
  isOnlyNumbers,
  isAlphaNumeric,
  isAlphaNumericSpaces,
  isEmail,
  isPasswordValid,
} from './validators';

describe('validators', () => {
  it('isOnlyLetters', () => {
    expect(isOnlyLetters('')).toBe(false);
    expect(isOnlyLetters('   ')).toBe(false);
    expect(isOnlyLetters('Flor Ñandú')).toBe(true);
    expect(isOnlyLetters('Flor123')).toBe(false);
    expect(isOnlyLetters('Flor-')).toBe(false);
  });

  it('isOnlyNumbers', () => {
    expect(isOnlyNumbers('')).toBe(false);
    expect(isOnlyNumbers('   ')).toBe(false);
    expect(isOnlyNumbers('123')).toBe(true);
    expect(isOnlyNumbers('12 3')).toBe(false);
    expect(isOnlyNumbers('12a')).toBe(false);
  });

  it('isAlphaNumeric', () => {
    expect(isAlphaNumeric('')).toBe(false);
    expect(isAlphaNumeric('abc123')).toBe(true);
    expect(isAlphaNumeric('abc 123')).toBe(false);
    expect(isAlphaNumeric('abc-123')).toBe(false);
  });

  it('isAlphaNumericSpaces', () => {
    expect(isAlphaNumericSpaces('')).toBe(false);
    expect(isAlphaNumericSpaces('abc 123')).toBe(true);
    expect(isAlphaNumericSpaces('  abc 123  ')).toBe(true); // trim() no afecta el regex si hay espacios internos
    expect(isAlphaNumericSpaces('abc-123')).toBe(false);
  });

  it('isEmail', () => {
    expect(isEmail('')).toBe(false);
    expect(isEmail('   ')).toBe(false);
    expect(isEmail('a@a.com')).toBe(true);
    expect(isEmail('a@a')).toBe(false);
    expect(isEmail('a a@a.com')).toBe(false);
  });

  it('isPasswordValid', () => {
    expect(isPasswordValid('')).toBe(false);
    expect(isPasswordValid('   ')).toBe(false);
    expect(isPasswordValid('short7')).toBe(false); // < 8

    expect(isPasswordValid('Abcdef12')).toBe(true);
    expect(isPasswordValid('Abcdef12!')).toBe(true);

    expect(isPasswordValid('Abcd ef12!')).toBe(false);
    expect(isPasswordValid('Ábcdef12!')).toBe(false);

    expect(isPasswordValid('a'.repeat(73))).toBe(false);
    expect(isPasswordValid('a'.repeat(73))).toBe(false);
  });
});
