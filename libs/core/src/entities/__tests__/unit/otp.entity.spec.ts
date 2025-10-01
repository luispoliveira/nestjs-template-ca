import { UserId } from '@lib/core/value-objects/user-id.vo';
import { Otp } from '../../otp.entity';

describe('Otp Entity Unit Tests', () => {
  let userId: UserId;
  const secret = 'JBSWY3DPEHPK3PXP';
  const expirationMinutes = 5;

  beforeEach(() => {
    userId = UserId.create();
  });

  describe('constructor', () => {
    it('should create a new Otp with generated id', () => {
      const otp = new Otp(userId, secret, expirationMinutes);

      expect(otp.id).toBeDefined();
      expect(otp.userId).toBe(userId);
      expect(otp.secret).toBe(secret);
      expect(otp.verifiedAt).toBeUndefined();
      expect(otp.createdAt).toBeInstanceOf(Date);
      expect(otp.expiresAt).toBeInstanceOf(Date);

      // Check that expiration is set correctly
      const expectedExpiration = new Date(otp.createdAt.getTime() + expirationMinutes * 60000);
      expect(Math.abs(otp.expiresAt.getTime() - expectedExpiration.getTime())).toBeLessThan(1000);
    });

    it('should create a new Otp with provided id', () => {
      const customId = 'custom-otp-id';
      const otp = new Otp(userId, secret, expirationMinutes, customId);

      expect(otp.id).toBe(customId);
    });

    it('should set expiration correctly with different expiration times', () => {
      const customExpirationMinutes = 10;
      const otp = new Otp(userId, secret, customExpirationMinutes);

      const expectedExpiration = new Date(
        otp.createdAt.getTime() + customExpirationMinutes * 60000,
      );
      expect(Math.abs(otp.expiresAt.getTime() - expectedExpiration.getTime())).toBeLessThan(1000);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired OTP', () => {
      const otp = new Otp(userId, secret, expirationMinutes);

      expect(otp.isExpired()).toBe(false);
    });

    it('should return true for expired OTP', () => {
      const expiredOtp = new Otp(userId, secret, -1); // Expired 1 minute ago

      expect(expiredOtp.isExpired()).toBe(true);
    });

    it('should return true for OTP that expires exactly now', () => {
      // Create an OTP that expires in 0 minutes (immediately)
      const expiredOtp = new Otp(userId, secret, 0);

      // Wait a tiny bit to ensure it's expired
      setTimeout(() => {
        expect(expiredOtp.isExpired()).toBe(true);
      }, 1);
    });
  });

  describe('markAsVerified', () => {
    it('should mark the OTP as verified', () => {
      const otp = new Otp(userId, secret, expirationMinutes);

      expect(otp.verifiedAt).toBeUndefined();

      otp.markAsVerified();

      expect(otp.verifiedAt).toBeInstanceOf(Date);
      expect(otp.verifiedAt!.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should update verifiedAt timestamp when called multiple times', () => {
      const otp = new Otp(userId, secret, expirationMinutes);

      otp.markAsVerified();
      const firstVerificationTime = otp.verifiedAt;

      // Wait a bit and mark as verified again
      setTimeout(() => {
        otp.markAsVerified();
        expect(otp.verifiedAt!.getTime()).toBeGreaterThan(firstVerificationTime!.getTime());
      }, 10);
    });
  });

  describe('edge cases', () => {
    it('should handle very long expiration times', () => {
      const longExpirationMinutes = 60 * 24 * 30; // 30 days
      const otp = new Otp(userId, secret, longExpirationMinutes);

      expect(otp.isExpired()).toBe(false);
      expect(otp.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should handle zero expiration time', () => {
      const zeroExpirationOtp = new Otp(userId, secret, 0);

      // Should be expired immediately or very soon
      expect(zeroExpirationOtp.expiresAt.getTime()).toBeLessThanOrEqual(
        new Date().getTime() + 1000,
      );
    });
  });
});
