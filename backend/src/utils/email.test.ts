import { EmailUtils } from './email';

describe('EmailUtils', () => {
  test('Should return false if an email is not valid', () => {
    expect(EmailUtils.isValid('')).toBeFalsy();
    expect(EmailUtils.isValid('wrong email')).toBeFalsy();
    expect(EmailUtils.isValid('email@')).toBeFalsy();
    expect(EmailUtils.isValid('email@lllll')).toBeFalsy();
  });

  test('Should return true if an email is valid', () => {
    expect(EmailUtils.isValid('email@correct.com')).toBeTruthy();
  });
});
