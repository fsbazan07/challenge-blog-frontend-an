import { ngGuards } from './guards';

describe('ngGuards', () => {
  it('should expose expected keys', () => {
    expect(ngGuards.onlyLetters).toBeTruthy();
    expect(ngGuards.onlyNumbers).toBeTruthy();
    expect(ngGuards.alphaNumeric).toBeTruthy();
    expect(ngGuards.alphaNumericSpaces).toBeTruthy();
    expect(ngGuards.email).toBeTruthy();
    expect(ngGuards.password).toBeTruthy();
    expect(ngGuards.postTitle).toBeTruthy();
    expect(ngGuards.postExcerpt).toBeTruthy();
    expect(ngGuards.postContent).toBeTruthy();
  });

  it('onlyLetters: allowSpaces true and sanitize removes non letters', () => {
    expect(ngGuards.onlyLetters.allowSpaces).toBe(true);
    expect(ngGuards.onlyLetters.sanitize('Flor123! Ñandú')).toBe('Flor Ñandú');
    expect(ngGuards.onlyLetters.allowedChar.test('Ñ')).toBe(true);
    expect(ngGuards.onlyLetters.allowedChar.test('1')).toBe(false);
  });

  it('onlyNumbers: allowSpaces false and sanitize removes non digits', () => {
    expect(ngGuards.onlyNumbers.allowSpaces).toBe(false);
    expect(ngGuards.onlyNumbers.sanitize('12a-3')).toBe('123');
    expect(ngGuards.onlyNumbers.allowedChar.test('9')).toBe(true);
    expect(ngGuards.onlyNumbers.allowedChar.test('a')).toBe(false);
  });

  it('email: should sanitize spaces and not define allowedChar', () => {
    expect(ngGuards.email.allowSpaces).toBe(false);
    expect(ngGuards.email.sanitize(' a@a.com ')).toBe('a@a.com');
    expect('allowedChar' in ngGuards.email).toBe(false);
  });

  it('postContent: should sanitize < >', () => {
    expect(ngGuards.postContent.sanitize('Hola <b>mundo</b>').includes('<')).toBe(false);
    expect(ngGuards.postContent.sanitize('Hola <b>mundo</b>').includes('>')).toBe(false);
  });
});
