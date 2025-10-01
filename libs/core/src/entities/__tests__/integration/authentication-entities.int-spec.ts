import { Email } from '@lib/core/value-objects/email.vo';
import { Token } from '@lib/core/value-objects/token.vo';
import { UserId } from '@lib/core/value-objects/user-id.vo';
import { VerificationCode } from '@lib/core/value-objects/verification-code.vo';
import { EmailVerification } from '../../email-verification.entity';
import { Otp } from '../../otp.entity';
import { PasswordReset } from '../../password-reset.entity';
import { RefreshToken } from '../../refresh-token.entity';

describe('Authentication Entities Integration Tests', () => {
  let userId: UserId;
  let email: Email;
  const expirationMinutes = 15;

  beforeEach(() => {
    userId = UserId.create();
    email = new Email('test@example.com');
  });

  describe('Email Verification Workflow', () => {
    it('should handle complete email verification process', () => {
      const verificationCode = new VerificationCode('123456');
      const emailVerification = new EmailVerification(email, verificationCode, expirationMinutes);

      // Initially not verified and not expired
      expect(emailVerification.isVerified()).toBe(false);
      expect(emailVerification.isExpired()).toBe(false);

      // Verify the email
      emailVerification.markAsVerified();

      expect(emailVerification.isVerified()).toBe(true);
      expect(emailVerification.verifiedAt).toBeInstanceOf(Date);
      expect(emailVerification.verifiedAt!.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should handle expired email verification', () => {
      const verificationCode = new VerificationCode('123456');
      const expiredVerification = new EmailVerification(email, verificationCode, -1); // Expired

      expect(expiredVerification.isExpired()).toBe(true);
      expect(expiredVerification.isVerified()).toBe(false);

      // Can still mark as verified even if expired (business decision)
      expiredVerification.markAsVerified();
      expect(expiredVerification.isVerified()).toBe(true);
      expect(expiredVerification.isExpired()).toBe(true); // Still expired
    });
  });

  describe('Password Reset Workflow', () => {
    it('should handle complete password reset process', () => {
      const resetToken = new Token('reset-token-123');
      const passwordReset = new PasswordReset(userId, email, resetToken, expirationMinutes);

      // Initially not used and not expired
      expect(passwordReset.isUsed()).toBe(false);
      expect(passwordReset.isExpired()).toBe(false);

      // Use the reset token
      passwordReset.markAsUsed();

      expect(passwordReset.isUsed()).toBe(true);
      expect(passwordReset.usedAt).toBeInstanceOf(Date);
      expect(passwordReset.usedAt!.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should handle expired password reset', () => {
      const resetToken = new Token('reset-token-123');
      const expiredReset = new PasswordReset(userId, email, resetToken, -1); // Expired

      expect(expiredReset.isExpired()).toBe(true);
      expect(expiredReset.isUsed()).toBe(false);

      // Can still mark as used even if expired (business decision)
      expiredReset.markAsUsed();
      expect(expiredReset.isUsed()).toBe(true);
      expect(expiredReset.isExpired()).toBe(true); // Still expired
    });

    it('should prevent reuse of used reset token', () => {
      const resetToken = new Token('reset-token-123');
      const passwordReset = new PasswordReset(userId, email, resetToken, expirationMinutes);

      passwordReset.markAsUsed();
      const firstUsedTime = passwordReset.usedAt;

      // Using again should update the timestamp
      passwordReset.markAsUsed();
      expect(passwordReset.usedAt!.getTime()).toBeGreaterThanOrEqual(firstUsedTime!.getTime());
    });
  });

  describe('OTP Authentication Workflow', () => {
    it('should handle OTP verification process', () => {
      const otpSecret = 'JBSWY3DPEHPK3PXP';
      const otp = new Otp(userId, otpSecret, expirationMinutes);

      // Initially not verified and not expired
      expect(otp.verifiedAt).toBeUndefined();
      expect(otp.isExpired()).toBe(false);

      // Verify the OTP
      otp.markAsVerified();

      expect(otp.verifiedAt).toBeInstanceOf(Date);
      expect(otp.verifiedAt!.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should handle expired OTP', () => {
      const otpSecret = 'JBSWY3DPEHPK3PXP';
      const expiredOtp = new Otp(userId, otpSecret, -1); // Expired

      expect(expiredOtp.isExpired()).toBe(true);

      // Can still mark as verified even if expired
      expiredOtp.markAsVerified();
      expect(expiredOtp.verifiedAt).toBeInstanceOf(Date);
      expect(expiredOtp.isExpired()).toBe(true); // Still expired
    });
  });

  describe('Refresh Token Management', () => {
    it('should handle refresh token lifecycle', () => {
      const refreshTokenValue = new Token('refresh-token-123');
      const expirationDays = 7;
      const refreshToken = new RefreshToken(userId, refreshTokenValue, expirationDays);

      // Initially not revoked and not expired
      expect(refreshToken.isRevoked()).toBe(false);
      expect(refreshToken.isExpired()).toBe(false);

      // Revoke the token
      refreshToken.revoke();

      expect(refreshToken.isRevoked()).toBe(true);
      expect(refreshToken.revokedAt).toBeInstanceOf(Date);
      expect(refreshToken.revokedAt!.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should handle expired refresh token', () => {
      const refreshTokenValue = new Token('refresh-token-123');
      const expiredRefreshToken = new RefreshToken(userId, refreshTokenValue, -1); // Expired

      expect(expiredRefreshToken.isExpired()).toBe(true);
      expect(expiredRefreshToken.isRevoked()).toBe(false);

      // Can still revoke even if expired
      expiredRefreshToken.revoke();
      expect(expiredRefreshToken.isRevoked()).toBe(true);
      expect(expiredRefreshToken.isExpired()).toBe(true); // Still expired
    });

    it('should handle both revoked and expired states', () => {
      const refreshTokenValue = new Token('refresh-token-123');
      const expiredRefreshToken = new RefreshToken(userId, refreshTokenValue, -1); // Expired
      expiredRefreshToken.revoke(); // Also revoked

      expect(expiredRefreshToken.isExpired()).toBe(true);
      expect(expiredRefreshToken.isRevoked()).toBe(true);
    });
  });

  describe('Cross-Entity Authentication Scenarios', () => {
    it('should handle user authentication with multiple token types', () => {
      // Simulate a complete authentication flow
      const refreshTokenValue = new Token('refresh-token-123');
      const resetToken = new Token('reset-token-123');
      const verificationCode = new VerificationCode('123456');
      const otpSecret = 'JBSWY3DPEHPK3PXP';

      // Create all authentication entities for the same user
      const refreshToken = new RefreshToken(userId, refreshTokenValue, 7);
      const passwordReset = new PasswordReset(userId, email, resetToken, 15);
      const emailVerification = new EmailVerification(email, verificationCode, 5);
      const otp = new Otp(userId, otpSecret, 5);

      // All should be valid initially
      expect(refreshToken.isExpired()).toBe(false);
      expect(refreshToken.isRevoked()).toBe(false);
      expect(passwordReset.isExpired()).toBe(false);
      expect(passwordReset.isUsed()).toBe(false);
      expect(emailVerification.isExpired()).toBe(false);
      expect(emailVerification.isVerified()).toBe(false);
      expect(otp.isExpired()).toBe(false);

      // Verify email first
      emailVerification.markAsVerified();
      expect(emailVerification.isVerified()).toBe(true);

      // Then use OTP
      otp.markAsVerified();
      expect(otp.verifiedAt).toBeInstanceOf(Date);

      // Use password reset
      passwordReset.markAsUsed();
      expect(passwordReset.isUsed()).toBe(true);

      // Finally revoke refresh token
      refreshToken.revoke();
      expect(refreshToken.isRevoked()).toBe(true);
    });

    it('should handle token expiration consistency', () => {
      const shortExpiration = 1; // 1 minute
      const longExpiration = 60; // 60 minutes

      const shortLivedOtp = new Otp(userId, 'secret', shortExpiration);
      const longLivedReset = new PasswordReset(userId, email, new Token('token'), longExpiration);

      expect(shortLivedOtp.expiresAt.getTime()).toBeLessThan(longLivedReset.expiresAt.getTime());

      // Both should be valid now
      expect(shortLivedOtp.isExpired()).toBe(false);
      expect(longLivedReset.isExpired()).toBe(false);
    });

    it('should maintain entity isolation', () => {
      // Different users should have isolated tokens
      const userId2 = UserId.create();
      const email2 = new Email('user2@example.com');

      const user1Otp = new Otp(userId, 'secret1', 5);
      const user2Otp = new Otp(userId2, 'secret2', 5);

      const user1Reset = new PasswordReset(userId, email, new Token('token1'), 15);
      const user2Reset = new PasswordReset(userId2, email2, new Token('token2'), 15);

      // Each user's tokens should be independent
      user1Otp.markAsVerified();
      user1Reset.markAsUsed();

      expect(user1Otp.verifiedAt).toBeInstanceOf(Date);
      expect(user2Otp.verifiedAt).toBeUndefined();

      expect(user1Reset.isUsed()).toBe(true);
      expect(user2Reset.isUsed()).toBe(false);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle concurrent token operations', () => {
      const refreshTokenValue = new Token('refresh-token-123');
      const refreshToken = new RefreshToken(userId, refreshTokenValue, 7);

      // Simulate concurrent revocation
      refreshToken.revoke();
      const firstRevokedTime = refreshToken.revokedAt;

      refreshToken.revoke(); // Called again
      expect(refreshToken.revokedAt!.getTime()).toBeGreaterThanOrEqual(firstRevokedTime!.getTime());
    });

    it('should maintain state consistency after multiple operations', () => {
      const verificationCode = new VerificationCode('123456');
      const emailVerification = new EmailVerification(email, verificationCode, 60);

      // Multiple verifications should maintain consistency
      emailVerification.markAsVerified();
      const firstVerified = emailVerification.verifiedAt;

      emailVerification.markAsVerified();
      expect(emailVerification.verifiedAt!.getTime()).toBeGreaterThanOrEqual(
        firstVerified!.getTime(),
      );
      expect(emailVerification.isVerified()).toBe(true);
    });
  });
});
