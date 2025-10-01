import { Email } from '@lib/core/value-objects/email.vo';
import { VerificationCode } from '@lib/core/value-objects/verification-code.vo';
import { EmailVerification } from '../../email-verification.entity';

describe('EmailVerification Entity Unit Tests', () => {
  let email: Email;
  let code: VerificationCode;

  beforeEach(() => {
    email = new Email('test@example.com');
    code = new VerificationCode('123456');
  });

  describe('constructor', () => {
    it('should create a new EmailVerification with default expiration', () => {
      const emailVerification = new EmailVerification(email, code);

      expect(emailVerification.id).toBeDefined();
      expect(emailVerification.email).toBe(email);
      expect(emailVerification.code).toBe(code);
      expect(emailVerification.verifiedAt).toBeNull();
      expect(emailVerification.createdAt).toBeInstanceOf(Date);
      expect(emailVerification.expiresAt).toBeInstanceOf(Date);

      // Check that expiration is 5 minutes from now by default
      const expectedExpiration = new Date(emailVerification.createdAt.getTime() + 5 * 60000);
      expect(
        Math.abs(emailVerification.expiresAt.getTime() - expectedExpiration.getTime()),
      ).toBeLessThan(1000);
    });

    it('should create a new EmailVerification with custom expiration', () => {
      const customExpirationMinutes = 10;
      const emailVerification = new EmailVerification(email, code, customExpirationMinutes);

      const expectedExpiration = new Date(
        emailVerification.createdAt.getTime() + customExpirationMinutes * 60000,
      );
      expect(
        Math.abs(emailVerification.expiresAt.getTime() - expectedExpiration.getTime()),
      ).toBeLessThan(1000);
    });

    it('should create a new EmailVerification with provided id', () => {
      const customId = 'custom-id-123';
      const emailVerification = new EmailVerification(email, code, 5, customId);

      expect(emailVerification.id).toBe(customId);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired verification', () => {
      const emailVerification = new EmailVerification(email, code, 5);

      expect(emailVerification.isExpired()).toBe(false);
    });

    it('should return true for expired verification', () => {
      const emailVerification = new EmailVerification(email, code, -1); // Expired 1 minute ago

      expect(emailVerification.isExpired()).toBe(true);
    });
  });

  describe('isVerified', () => {
    it('should return false for unverified email', () => {
      const emailVerification = new EmailVerification(email, code);

      expect(emailVerification.isVerified()).toBe(false);
    });

    it('should return true for verified email', () => {
      const emailVerification = new EmailVerification(email, code);
      emailVerification.markAsVerified();

      expect(emailVerification.isVerified()).toBe(true);
    });
  });

  describe('markAsVerified', () => {
    it('should mark the verification as verified', () => {
      const emailVerification = new EmailVerification(email, code);

      expect(emailVerification.verifiedAt).toBeNull();

      emailVerification.markAsVerified();

      expect(emailVerification.verifiedAt).toBeInstanceOf(Date);
      expect(emailVerification.isVerified()).toBe(true);
    });

    it('should update verifiedAt timestamp when called multiple times', () => {
      const emailVerification = new EmailVerification(email, code);

      emailVerification.markAsVerified();
      const firstVerificationTime = emailVerification.verifiedAt;

      // Wait a bit and mark as verified again
      setTimeout(() => {
        emailVerification.markAsVerified();
        expect(emailVerification.verifiedAt!.getTime()).toBeGreaterThan(
          firstVerificationTime!.getTime(),
        );
      }, 10);
    });
  });
});
