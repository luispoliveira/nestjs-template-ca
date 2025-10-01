import { Email } from '../../../value-objects/email.vo';
import { VerificationCode } from '../../../value-objects/verification-code.vo';
import { EmailVerification } from '../../email-verification.entity';

describe('EmailVerification Entity integration tests', () => {
  beforeEach(() => {
    // Use real timers for integration tests to test actual behavior
    jest.useRealTimers();
  });

  describe('email and verification code integration', () => {
    it('should work with different email and code combinations', () => {
      const email1 = new Email('user1@example.com');
      const email2 = new Email('user2@example.com');
      const code1 = new VerificationCode('111111');
      const code2 = new VerificationCode('222222');

      const verification1 = new EmailVerification(email1, code1);
      const verification2 = new EmailVerification(email2, code2);

      expect(verification1.email).toBe(email1);
      expect(verification1.code).toBe(code1);
      expect(verification2.email).toBe(email2);
      expect(verification2.code).toBe(code2);
      expect(verification1.id).not.toBe(verification2.id);
    });

    it('should validate email format through Email value object', () => {
      const validCode = new VerificationCode('123456');

      expect(() => new Email('invalid-email')).toThrow();
      expect(() => new EmailVerification(new Email('valid@email.com'), validCode)).not.toThrow();
    });

    it('should validate verification code format through VerificationCode value object', () => {
      const validEmail = new Email('test@example.com');

      expect(() => new VerificationCode('invalid')).toThrow();
      expect(() => new EmailVerification(validEmail, new VerificationCode('123456'))).not.toThrow();
    });

    it('should handle email normalization from Email value object', () => {
      const upperCaseEmail = new Email('TEST@EXAMPLE.COM');
      const lowerCaseEmail = new Email('test@example.com');
      const code = new VerificationCode('123456');

      const verification1 = new EmailVerification(upperCaseEmail, code);
      const verification2 = new EmailVerification(lowerCaseEmail, code);

      expect(verification1.email.getValue()).toBe('test@example.com');
      expect(verification2.email.getValue()).toBe('test@example.com');
      expect(verification1.email.equals(verification2.email)).toBe(true);
    });
  });

  describe('time-based integration scenarios', () => {
    it('should handle expired but verified verification', async () => {
      const email = new Email('test@example.com');
      const code = new VerificationCode('123456');
      // Very short expiration for testing
      const verification = new EmailVerification(email, code, 0.001); // ~60ms

      // Mark as verified immediately
      verification.markAsVerified();
      expect(verification.isVerified()).toBe(true);
      expect(verification.isExpired()).toBe(false);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(verification.isVerified()).toBe(true);
      expect(verification.isExpired()).toBe(true);
    });

    it('should handle non-expired verification workflow', () => {
      const email = new Email('test@example.com');
      const code = new VerificationCode('123456');
      const verification = new EmailVerification(email, code, 5); // 5 minutes

      // Initial state
      expect(verification.isVerified()).toBe(false);
      expect(verification.isExpired()).toBe(false);

      // Mark as verified
      verification.markAsVerified();

      expect(verification.isVerified()).toBe(true);
      expect(verification.isExpired()).toBe(false);
    });

    it('should maintain state consistency throughout lifecycle', async () => {
      const email = new Email('user@example.com');
      const code = new VerificationCode('654321');
      // Very short expiration for testing
      const verification = new EmailVerification(email, code, 0.001); // ~60ms

      // Initial state
      expect(verification.isVerified()).toBe(false);
      expect(verification.isExpired()).toBe(false);

      // Mark as verified before expiration
      verification.markAsVerified();
      expect(verification.isVerified()).toBe(true);
      expect(verification.isExpired()).toBe(false);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should remain verified even after expiration
      expect(verification.isVerified()).toBe(true);
      expect(verification.isExpired()).toBe(true);
    });
  });

  describe('real UUID generation', () => {
    it('should generate unique UUIDs for multiple instances', () => {
      const email = new Email('test@example.com');
      const code = new VerificationCode('123456');

      const verification1 = new EmailVerification(email, code);
      const verification2 = new EmailVerification(email, code);
      const verification3 = new EmailVerification(email, code);

      const ids = [verification1.id, verification2.id, verification3.id];
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      ids.forEach((id) => {
        expect(id).toMatch(uuidRegex);
      });
    });

    it('should prefer custom ID over generated UUID', () => {
      const email = new Email('test@example.com');
      const code = new VerificationCode('123456');
      const customId = 'custom-verification-id';

      const verification = new EmailVerification(email, code, 5, customId);

      expect(verification.id).toBe(customId);
      expect(verification.id).not.toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe('complex verification scenarios', () => {
    it('should handle multiple verification attempts with same email', () => {
      const email = new Email('user@domain.com');
      const code1 = new VerificationCode('111111');
      const code2 = new VerificationCode('222222');

      const verification1 = new EmailVerification(email, code1);
      const verification2 = new EmailVerification(email, code2);

      // Both should be separate entities with same email
      expect(verification1.email.equals(verification2.email)).toBe(true);
      expect(verification1.code.equals(verification2.code)).toBe(false);
      expect(verification1.id).not.toBe(verification2.id);

      // Independent verification states
      verification1.markAsVerified();
      expect(verification1.isVerified()).toBe(true);
      expect(verification2.isVerified()).toBe(false);
    });

    it('should handle verification code comparison', () => {
      const email = new Email('test@example.com');
      const code = new VerificationCode('123456');
      const sameCode = new VerificationCode('123456');
      const differentCode = new VerificationCode('654321');

      const verification = new EmailVerification(email, code);

      // Code comparison should work through VerificationCode value object
      expect(verification.code.equals(sameCode)).toBe(true);
      expect(verification.code.equals(differentCode)).toBe(false);
    });

    it('should maintain immutability of value objects', () => {
      const email = new Email('test@example.com');
      const code = new VerificationCode('123456');
      const verification = new EmailVerification(email, code);

      const originalEmailValue = verification.email.getValue();
      const originalCodeValue = verification.code.getValue();

      // Value objects should be immutable
      expect(verification.email.getValue()).toBe(originalEmailValue);
      expect(verification.code.getValue()).toBe(originalCodeValue);

      // Creating new verification shouldn't affect original values
      const newVerification = new EmailVerification(
        new Email('other@example.com'),
        new VerificationCode('654321'),
      );

      expect(verification.email.getValue()).toBe(originalEmailValue);
      expect(verification.code.getValue()).toBe(originalCodeValue);
      expect(newVerification.email.getValue()).toBe('other@example.com');
      expect(newVerification.code.getValue()).toBe('654321');
    });
  });

  describe('error propagation', () => {
    it('should propagate Email validation errors', () => {
      const validCode = new VerificationCode('123456');

      expect(() => {
        new EmailVerification(new Email('invalid-email'), validCode);
      }).toThrow('Invalid email format');
    });

    it('should propagate VerificationCode validation errors', () => {
      const validEmail = new Email('test@example.com');

      expect(() => {
        new EmailVerification(validEmail, new VerificationCode('invalid'));
      }).toThrow('Invalid verification code format');
    });

    it('should handle constructor parameter validation', () => {
      const validEmail = new Email('test@example.com');
      const validCode = new VerificationCode('123456');

      // Should work with valid parameters
      expect(() => new EmailVerification(validEmail, validCode)).not.toThrow();
      expect(() => new EmailVerification(validEmail, validCode, 5)).not.toThrow();
      expect(() => new EmailVerification(validEmail, validCode, 5, 'custom-id')).not.toThrow();
    });
  });
});
