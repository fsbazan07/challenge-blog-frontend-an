import {
  sanitizeOnlyLetters,
  sanitizeOnlyNumbers,
  sanitizeAlphaNumeric,
  sanitizeAlphaNumericSpaces,
  sanitizeEmail,
  sanitizePassword,
  sanitizePostTitle,
  sanitizePostExcerpt,
  sanitizePostContent,
} from './sanitize';

describe('sanitize', () => {
  it('sanitizeOnlyLetters', () => {
    expect(sanitizeOnlyLetters('Flor123! Ñandú')).toBe('Flor Ñandú');
  });

  it('sanitizeOnlyNumbers', () => {
    expect(sanitizeOnlyNumbers('12a-3')).toBe('123');
  });

  it('sanitizeAlphaNumeric', () => {
    expect(sanitizeAlphaNumeric('ab 12-3_')).toBe('ab123');
  });

  it('sanitizeAlphaNumericSpaces', () => {
    expect(sanitizeAlphaNumericSpaces('ab 12-3_')).toBe('ab 123');
  });

  it('sanitizeEmail should remove spaces', () => {
    expect(sanitizeEmail(' a@a.com ')).toBe('a@a.com');
    expect(sanitizeEmail('a @ a.com')).toBe('a@a.com');
  });

  it('sanitizePassword should keep safe chars and remove others', () => {
    expect(sanitizePassword('Abcd ef12!á')).toBe('Abcdef12!');
  });

  it('sanitizePostTitle / sanitizePostExcerpt should remove disallowed chars (like < > /) and keep allowed punctuation', () => {
    const t = sanitizePostTitle('Hola <b>mundo</b>!!!');
    const e = sanitizePostExcerpt('Hola <b>mundo</b>!!!');

    expect(t.includes('<') || t.includes('>') || t.includes('/')).toBe(false);
    expect(e.includes('<') || e.includes('>') || e.includes('/')).toBe(false);

    expect(t.endsWith('!!!')).toBe(true);
    expect(e.endsWith('!!!')).toBe(true);
  });

  it('sanitizePostContent should remove < and >', () => {
    expect(sanitizePostContent('Hola <b>mundo</b>')).toBe('Hola bmundo/b');
  });
});
