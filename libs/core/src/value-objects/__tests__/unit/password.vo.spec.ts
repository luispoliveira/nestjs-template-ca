import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { Password } from '../../password.vo';

describe('Password Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid password with all required criteria', () => {
      const validPassword = 'MyPassword123!';
      const password = new Password(validPassword);

      expect(password).toBeDefined();
      expect(password.getValue()).toBe(validPassword);
    });

    it('should accept password with minimum valid requirements', () => {
      const validPassword = 'Aa1!bcde'; // 8 chars, upper, lower, number, special
      const password = new Password(validPassword);

      expect(password.getValue()).toBe(validPassword);
    });

    it('should accept password with various special characters', () => {
      const specialChars = [
        '!',
        '@',
        '#',
        '$',
        '%',
        '^',
        '&',
        '*',
        '(',
        ')',
        ',',
        '.',
        '?',
        '"',
        ':',
        '{',
        '}',
        '|',
        '<',
        '>',
        '_',
      ];

      specialChars.forEach((char) => {
        const validPassword = `MyPass1${char}`;
        const password = new Password(validPassword);
        expect(password.getValue()).toBe(validPassword);
      });
    });

    it('should throw InvalidValueObjectException for password without uppercase letter', () => {
      const invalidPassword = 'mypassword123!';
      expect(() => new Password(invalidPassword)).toThrow(InvalidValueObjectException);
      expect(() => new Password(invalidPassword)).toThrow(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    });

    it('should throw InvalidValueObjectException for password without lowercase letter', () => {
      const invalidPassword = 'MYPASSWORD123!';
      expect(() => new Password(invalidPassword)).toThrow(InvalidValueObjectException);
      expect(() => new Password(invalidPassword)).toThrow(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    });

    it('should throw InvalidValueObjectException for password without number', () => {
      const invalidPassword = 'MyPassword!';
      expect(() => new Password(invalidPassword)).toThrow(InvalidValueObjectException);
      expect(() => new Password(invalidPassword)).toThrow(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    });

    it('should throw InvalidValueObjectException for password without special character', () => {
      const invalidPassword = 'MyPassword123';
      expect(() => new Password(invalidPassword)).toThrow(InvalidValueObjectException);
      expect(() => new Password(invalidPassword)).toThrow(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    });

    it('should throw InvalidValueObjectException for password shorter than 8 characters', () => {
      const invalidPassword = 'MyP1!';
      expect(() => new Password(invalidPassword)).toThrow(InvalidValueObjectException);
      expect(() => new Password(invalidPassword)).toThrow(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    });

    it('should throw InvalidValueObjectException for empty password', () => {
      expect(() => new Password('')).toThrow(InvalidValueObjectException);
      expect(() => new Password('')).toThrow(
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
      );
    });

    it('should throw InvalidValueObjectException for password with only letters', () => {
      const invalidPassword = 'MyPasswordOnly';
      expect(() => new Password(invalidPassword)).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException for password with only numbers', () => {
      const invalidPassword = '12345678';
      expect(() => new Password(invalidPassword)).toThrow(InvalidValueObjectException);
    });

    it('should accept long valid passwords', () => {
      const longValidPassword = 'MyVeryLongPassword123!WithManyCharacters';
      const password = new Password(longValidPassword);

      expect(password.getValue()).toBe(longValidPassword);
    });
  });

  describe('getValue', () => {
    it('should return the password value', () => {
      const validPassword = 'MyPassword123!';
      const password = new Password(validPassword);

      expect(password.getValue()).toBe(validPassword);
    });

    it('should return the exact password without modification', () => {
      const validPassword = 'MyPassword123!';
      const password = new Password(validPassword);

      expect(password.getValue()).toBe(validPassword);
    });
  });
});
