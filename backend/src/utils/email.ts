import validator from 'validator';

export class EmailUtils {
  /**
   * Validar Email
   * **/
  static isValid(email: string) {
    return validator.isEmail(email);
  }
}
