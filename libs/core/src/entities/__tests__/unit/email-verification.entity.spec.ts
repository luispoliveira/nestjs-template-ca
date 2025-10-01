import { Email } from '../../../value-objects/email.vo';
import { VerificationCode } from '../../../value-objects/verification-code.vo';
import { EmailVerification } from '../../email-verification.entity';

describe('EmailVerification Entity unit tests', () => {
  const validEmail = new Email('test@example.com');
  const validCode = new VerificationCode('123456');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-10-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should create email verification with default values', () => {
      const verification = new EmailVerification(validEmail, validCode);

      expect(verification.id).toBeDefined();
      expect(verification.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(verification.email).toBe(validEmail);
      expect(verification.code).toBe(validCode);
      expect(verification.verifiedAt).toBeNull();
      expect(verification.createdAt).toEqual(new Date('2025-10-01T12:00:00.000Z'));
    });

    it('should create email verification with custom expiration minutes', () => {
      const customExpirationMinutes = 10;
      const verification = new EmailVerification(validEmail, validCode, customExpirationMinutes);

      const expectedExpirationTime = new Date('2025-10-01T12:10:00.000Z');
      expect(verification.expiresAt).toEqual(expectedExpirationTime);
    });

    it('should create email verification with custom id', () => {
      const customId = 'custom-id-123';
      const verification = new EmailVerification(validEmail, validCode, 5, customId);

      expect(verification.id).toBe(customId);
    });
  });

  describe('isExpired', () => {
    it('should return false when verification is not expired', () => {
      const verification = new EmailVerification(validEmail, validCode, 5);

      jest.setSystemTime(new Date('2025-10-01T12:04:00.000Z'));

      expect(verification.isExpired()).toBe(false);
    });

    it('should return true when verification is expired', () => {
      const verification = new EmailVerification(validEmail, validCode, 5);

      jest.setSystemTime(new Date('2025-10-01T12:06:00.000Z'));

      expect(verification.isExpired()).toBe(true);
    });
  });

  describe('isVerified', () => {
    it('should return false when verification is not verified', () => {
      const verification = new EmailVerification(validEmail, validCode);

      expect(verification.isVerified()).toBe(false);
    });

    it('should return true when verification is verified', () => {
      const verification = new EmailVerification(validEmail, validCode);
      verification.markAsVerified();

      expect(verification.isVerified()).toBe(true);
    });
  });

  describe('markAsVerified', () => {
    it('should set verifiedAt to current date', () => {
      const verification = new EmailVerification(validEmail, validCode);

      jest.setSystemTime(new Date('2025-10-01T12:03:30.000Z'));
      verification.markAsVerified();

      expect(verification.verifiedAt).toEqual(new Date('2025-10-01T12:03:30.000Z'));
    });
  });

  describe('edge cases', () => {
    it('should generate unique ids for multiple instances', () => {
      const verification1 = new EmailVerification(validEmail, validCode);
      const verification2 = new EmailVerification(validEmail, validCode);
      const verification3 = new EmailVerification(validEmail, validCode);

      const ids = [verification1.id, verification2.id, verification3.id];
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      ids.forEach((id) => {
        expect(id).toMatch(uuidRegex);
      });
    });
  });
});
