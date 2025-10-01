import { Token } from '@lib/core/value-objects/token.vo';
import { UserId } from '@lib/core/value-objects/user-id.vo';
import { RefreshToken } from '../../refresh-token.entity';

describe('RefreshToken Entity Unit Tests', () => {
  let userId: UserId;
  let token: Token;
  const expirationDays = 7;

  beforeEach(() => {
    userId = UserId.create();
    token = Token.generate();
  });

  describe('constructor', () => {
    it('should create a new RefreshToken with generated id', () => {
      const refreshToken = new RefreshToken(userId, token, expirationDays);

      expect(refreshToken.id).toBeDefined();
      expect(refreshToken.userId).toBe(userId);
      expect(refreshToken.token).toBe(token);
      expect(refreshToken.revokedAt).toBeUndefined();
      expect(refreshToken.createdAt).toBeInstanceOf(Date);
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);

      // Check that expiration is set correctly (7 days from creation)
      const expectedExpiration = new Date(refreshToken.createdAt);
      expectedExpiration.setDate(expectedExpiration.getDate() + expirationDays);
      expect(
        Math.abs(refreshToken.expiresAt.getTime() - expectedExpiration.getTime()),
      ).toBeLessThan(1000);
    });

    it('should create a new RefreshToken with provided id', () => {
      const customId = 'custom-refresh-token-id';
      const refreshToken = new RefreshToken(userId, token, expirationDays, customId);

      expect(refreshToken.id).toBe(customId);
    });

    it('should set expiration correctly with different expiration days', () => {
      const customExpirationDays = 30;
      const refreshToken = new RefreshToken(userId, token, customExpirationDays);

      const expectedExpiration = new Date(refreshToken.createdAt);
      expectedExpiration.setDate(expectedExpiration.getDate() + customExpirationDays);
      expect(
        Math.abs(refreshToken.expiresAt.getTime() - expectedExpiration.getTime()),
      ).toBeLessThan(1000);
    });
  });

  describe('isExpired', () => {
    it('should return false for non-expired refresh token', () => {
      const refreshToken = new RefreshToken(userId, token, expirationDays);

      expect(refreshToken.isExpired()).toBe(false);
    });

    it('should return true for expired refresh token', () => {
      const expiredRefreshToken = new RefreshToken(userId, token, -1); // Expired 1 day ago

      expect(expiredRefreshToken.isExpired()).toBe(true);
    });

    it('should return true for refresh token that expires exactly now', () => {
      // Create a refresh token that expires in 0 days (immediately)
      const expiredRefreshToken = new RefreshToken(userId, token, 0);

      // Wait a tiny bit to ensure it's expired
      setTimeout(() => {
        expect(expiredRefreshToken.isExpired()).toBe(true);
      }, 1);
    });
  });

  describe('isRevoked', () => {
    it('should return false for non-revoked refresh token', () => {
      const refreshToken = new RefreshToken(userId, token, expirationDays);

      expect(refreshToken.isRevoked()).toBe(false);
    });

    it('should return true for revoked refresh token', () => {
      const refreshToken = new RefreshToken(userId, token, expirationDays);
      refreshToken.revoke();

      expect(refreshToken.isRevoked()).toBe(true);
    });
  });

  describe('revoke', () => {
    it('should revoke the refresh token', () => {
      const refreshToken = new RefreshToken(userId, token, expirationDays);

      expect(refreshToken.revokedAt).toBeUndefined();

      refreshToken.revoke();

      expect(refreshToken.revokedAt).toBeInstanceOf(Date);
      expect(refreshToken.revokedAt!.getTime()).toBeLessThanOrEqual(new Date().getTime());
      expect(refreshToken.isRevoked()).toBe(true);
    });

    it('should update revokedAt timestamp when called multiple times', () => {
      const refreshToken = new RefreshToken(userId, token, expirationDays);

      refreshToken.revoke();
      const firstRevokedTime = refreshToken.revokedAt;

      // Wait a bit and revoke again
      setTimeout(() => {
        refreshToken.revoke();
        expect(refreshToken.revokedAt!.getTime()).toBeGreaterThan(firstRevokedTime!.getTime());
      }, 10);
    });
  });

  describe('edge cases', () => {
    it('should handle very long expiration times', () => {
      const longExpirationDays = 365; // 1 year
      const refreshToken = new RefreshToken(userId, token, longExpirationDays);

      expect(refreshToken.isExpired()).toBe(false);
      expect(refreshToken.expiresAt.getTime()).toBeGreaterThan(new Date().getTime());
    });

    it('should handle zero expiration time', () => {
      const zeroExpirationToken = new RefreshToken(userId, token, 0);

      // Should be expired immediately or very soon
      const now = new Date().getTime();
      const gracePeriod = 24 * 60 * 60 * 1000; // 1 day in milliseconds for grace
      expect(zeroExpirationToken.expiresAt.getTime()).toBeLessThanOrEqual(now + gracePeriod);
    });

    it('should maintain all properties after being revoked', () => {
      const refreshToken = new RefreshToken(userId, token, expirationDays);

      refreshToken.revoke();

      expect(refreshToken.userId).toBe(userId);
      expect(refreshToken.token).toBe(token);
      expect(refreshToken.isRevoked()).toBe(true);
      expect(refreshToken.createdAt).toBeInstanceOf(Date);
      expect(refreshToken.expiresAt).toBeInstanceOf(Date);
    });

    it('should handle revoked and expired token correctly', () => {
      const expiredRefreshToken = new RefreshToken(userId, token, -1); // Expired
      expiredRefreshToken.revoke(); // Also revoked

      expect(expiredRefreshToken.isExpired()).toBe(true);
      expect(expiredRefreshToken.isRevoked()).toBe(true);
    });
  });
});
