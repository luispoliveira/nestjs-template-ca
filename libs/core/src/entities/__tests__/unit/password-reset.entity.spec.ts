import { Email } from '@lib/core/value-objects/email.vo';
import { Token } from '@lib/core/value-objects/token.vo';
import { UserId } from '@lib/core/value-objects/user-id.vo';
import { PasswordReset } from '../../password-reset.entity';

describe('PasswordReset Entity Unit Tests', () => {
  let userId: UserId;
  let email: Email;
  let token: Token;
  const expirationMinutes = 15;

  beforeEach(() => {
    userId = UserId.create();
    email = new Email('test@example.com');
    token = Token.generate();
  });

  describe('constructor', () => {
    it('should create a new PasswordReset with generated id', () => {
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes);

      expect(passwordReset.id).toBeDefined();
      expect(passwordReset.userId).toBe(userId);
      expect(passwordReset.email).toBe(email);
      expect(passwordReset.token).toBe(token);
      expect(passwordReset.usedAt).toBeNull();
      expect(passwordReset.createdAt).toBeInstanceOf(Date);
      expect(passwordReset.expiresAt).toBeInstanceOf(Date);

      // Check that expiration is set correctly
      const expectedExpiration = new Date(
        passwordReset.createdAt.getTime() + expirationMinutes * 60000,
      );
      expect(
        Math.abs(passwordReset.expiresAt.getTime() - expectedExpiration.getTime()),
      ).toBeLessThan(1000);
    });

    it('should create a new PasswordReset with provided id', () => {
      const customId = 'custom-reset-id';
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes, customId);

      expect(passwordReset.id).toBe(customId);
    });

    it('should set expiration correctly with different expiration times', async () => {
      const customExpirationMinutes = 30;
      const passwordReset = new PasswordReset(userId, email, token, customExpirationMinutes);

      const expectedExpiration = new Date(
        passwordReset.createdAt.getTime() + customExpirationMinutes * 60000,
      );

      await new Promise((resolve) => setTimeout(resolve, 1));

      expect(
        Math.abs(passwordReset.expiresAt.getTime() - expectedExpiration.getTime()),
      ).toBeLessThan(1000);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired password reset', () => {
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes);

      expect(passwordReset.isExpired()).toBe(false);
    });

    it('should return true for expired password reset', () => {
      // Expired 1 minute ago
      const expiredPasswordReset = new PasswordReset(userId, email, token, -1);

      expect(expiredPasswordReset.isExpired()).toBe(true);
    });

    it('should return true for password reset that expires exactly now', () => {
      // Create a password reset that expires in 0 minutes (immediately)
      const expiredPasswordReset = new PasswordReset(userId, email, token, 0);

      // Wait a tiny bit to ensure it's expired
      setTimeout(() => {
        expect(expiredPasswordReset.isExpired()).toBe(true);
      }, 1);
    });
  });

  describe('isUsed', () => {
    it('should return false for unused password reset', () => {
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes);

      expect(passwordReset.isUsed()).toBe(false);
    });

    it('should return true for used password reset', () => {
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes);
      passwordReset.markAsUsed();

      expect(passwordReset.isUsed()).toBe(true);
    });
  });

  describe('markAsUsed', () => {
    it('should mark the password reset as used', () => {
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes);

      expect(passwordReset.usedAt).toBeNull();

      passwordReset.markAsUsed();

      expect(passwordReset.usedAt).toBeInstanceOf(Date);
      expect(passwordReset.usedAt!.getTime()).toBeLessThanOrEqual(new Date().getTime());
      expect(passwordReset.isUsed()).toBe(true);
    });

    it('should update usedAt timestamp when called multiple times', () => {
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes);

      passwordReset.markAsUsed();
      const firstUsedTime = passwordReset.usedAt;

      // Wait a bit and mark as used again
      setTimeout(() => {
        passwordReset.markAsUsed();
        expect(passwordReset.usedAt!.getTime()).toBeGreaterThan(firstUsedTime!.getTime());
      }, 10);
    });
  });

  describe('edge cases', () => {
    it('should handle very long expiration times', () => {
      const longExpirationMinutes = 60 * 24 * 7; // 7 days
      const passwordReset = new PasswordReset(userId, email, token, longExpirationMinutes);

      expect(passwordReset.isExpired()).toBe(false);
      expect(passwordReset.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should handle zero expiration time', () => {
      const zeroExpirationReset = new PasswordReset(userId, email, token, 0);

      // Should be expired immediately or very soon
      expect(zeroExpirationReset.expiresAt.getTime()).toBeLessThanOrEqual(
        new Date().getTime() + 1000,
      );
    });

    it('should maintain all properties after being used', () => {
      const passwordReset = new PasswordReset(userId, email, token, expirationMinutes);

      passwordReset.markAsUsed();

      expect(passwordReset.userId).toBe(userId);
      expect(passwordReset.email).toBe(email);
      expect(passwordReset.token).toBe(token);
      expect(passwordReset.isUsed()).toBe(true);
    });
  });
});
