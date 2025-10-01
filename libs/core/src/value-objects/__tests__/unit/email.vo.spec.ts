import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { Email } from '../../email.vo';

describe('Email Value Object unit tests', () => {
  it('should create a valid email', () => {
    const email = new Email('test@example.com');

    expect(email).toBeDefined();
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should normalize email to lowercase', () => {
    const email = new Email('TEST@EXAMPLE.COM');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should set the value properly', () => {
    const email = new Email('test@example.com');
    expect(email.getValue()).toBe('test@example.com');
  });

  it('should correctly check equality between two email value objects', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');
    const email3 = new Email('TEST@EXAMPLE.COM');
    const email4 = new Email('test2@example.com');

    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(true);
    expect(email1.equals(email4)).toBe(false);
  });

  it('should throw an error for invalid email format', () => {
    expect(() => new Email('invalid-email')).toThrow(InvalidValueObjectException);
    expect(() => new Email('another-invalid-email@')).toThrow(InvalidValueObjectException);
    expect(() => new Email('@no-local-part.com')).toThrow(InvalidValueObjectException);
  });
});
