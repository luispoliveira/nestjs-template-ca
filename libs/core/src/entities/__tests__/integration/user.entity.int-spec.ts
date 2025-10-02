import { UserEntity } from '@lib/core/entities/user.entity';
import { UserDataBuilder } from '@lib/core/testing/helpers/user-data-builder';
import { EntityValidationError } from '@lib/shared/core/errors/validation-error';

describe('UserEntity Integration Tests', () => {
  describe('Entity Creation and Validation Integration', () => {
    it('should create user with all valid properties and ensure proper validation flow', () => {
      const validProps = UserDataBuilder({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        isActive: true,
        createdBy: 'admin',
        updatedBy: 'admin',
        roleId: '550e8400-e29b-41d4-a716-446655440000',
      });

      const user = new UserEntity(validProps);

      expect(user.email).toBe('test@example.com');
      expect(user.password).toBe('SecurePassword123!');
      expect(user.isActive).toBe(true);
      expect(user.createdBy).toBe('admin');
      expect(user.updatedBy).toBe('admin');
      expect(user.roleId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle complete user lifecycle with validation at each step', () => {
      // Create inactive user
      const userProps = UserDataBuilder({
        email: 'lifecycle@example.com',
        isActive: false,
        activatedAt: null,
        activatedBy: null,
        roleId: null,
      });

      const user = new UserEntity(userProps);
      expect(user.isActive).toBe(false);

      // Activate user
      const activatedBy = 'admin-user';
      user.activate(activatedBy);

      expect(user.isActive).toBe(true);
      expect(user.activatedAt).toBeInstanceOf(Date);
      expect(user.activatedBy).toBe(activatedBy);
      expect(user.updatedBy).toBe(activatedBy);

      // Assign role
      const roleId = '550e8400-e29b-41d4-a716-446655440001';
      user.assignRole(roleId, activatedBy);

      expect(user.roleId).toBe(roleId);
      expect(user.updatedBy).toBe(activatedBy);

      // Set activation token
      const token = '550e8400-e29b-41d4-a716-446655440002';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.setActivationToken(token, expiresAt, activatedBy);

      expect(user.activationToken).toBe(token);
      expect(user.activationTokenExpiresAt).toBe(expiresAt);

      // Clear activation token
      user.clearActivationToken(activatedBy);

      expect(user.activationToken).toBeNull();
      expect(user.activationTokenExpiresAt).toBeNull();

      // Set password reset token
      const resetToken = '550e8400-e29b-41d4-a716-446655440003';
      const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
      user.setPasswordResetToken(resetToken, resetExpiresAt, activatedBy);

      expect(user.passwordResetToken).toBe(resetToken);
      expect(user.passwordResetTokenExpiresAt).toBe(resetExpiresAt);

      // Update password
      const newPassword = 'NewSecurePassword456!';
      user.updatePassword(newPassword, activatedBy);

      expect(user.password).toBe(newPassword);

      // Clear password reset token
      user.clearPasswordResetToken(activatedBy);

      expect(user.passwordResetToken).toBeNull();
      expect(user.passwordResetTokenExpiresAt).toBeNull();

      // Update last login
      user.updateLastLogin();

      expect(user.lastLoginAt).toBeInstanceOf(Date);

      // Deactivate user
      const deactivatedBy = 'admin-user';
      user.deactivate(deactivatedBy);

      expect(user.isActive).toBe(false);
      expect(user.deactivatedAt).toBeInstanceOf(Date);
      expect(user.deactivatedBy).toBe(deactivatedBy);

      // Remove role
      user.removeRole(deactivatedBy);

      expect(user.roleId).toBeNull();
    });

    it('should validate complex scenarios with multiple field interactions', () => {
      const props = UserDataBuilder({
        email: 'complex@example.com',
        password: 'ComplexPassword789!',
        isActive: true,
        activationToken: '550e8400-e29b-41d4-a716-446655440004',
        activationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        passwordResetToken: '550e8400-e29b-41d4-a716-446655440005',
        passwordResetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        roleId: '550e8400-e29b-41d4-a716-446655440006',
        createdBy: 'system',
        updatedBy: 'admin',
        activatedBy: 'admin',
      });

      const user = new UserEntity(props);

      // Validate all properties are set correctly
      expect(user.email).toBe('complex@example.com');
      expect(user.password).toBe('ComplexPassword789!');
      expect(user.isActive).toBe(true);
      expect(user.activationToken).toBe('550e8400-e29b-41d4-a716-446655440004');
      expect(user.passwordResetToken).toBe('550e8400-e29b-41d4-a716-446655440005');
      expect(user.roleId).toBe('550e8400-e29b-41d4-a716-446655440006');
      expect(user.createdBy).toBe('system');
      expect(user.updatedBy).toBe('admin');
      expect(user.activatedBy).toBe('admin');

      // Test state transitions
      user.deactivate('admin');
      expect(user.isActive).toBe(false);
      expect(user.deactivatedBy).toBe('admin');

      user.activate('admin');
      expect(user.isActive).toBe(true);
      expect(user.activatedBy).toBe('admin');
    });
  });

  describe('Error Scenarios and Edge Cases Integration', () => {
    it('should handle cascading validation errors across multiple operations', () => {
      const user = new UserEntity(UserDataBuilder({}));

      // Test multiple validation failures
      expect(() => {
        user.updatePassword('', ''); // Both invalid
      }).toThrow(EntityValidationError);

      expect(() => {
        user.setActivationToken('invalid-token', new Date(), ''); // Invalid token and updatedBy
      }).toThrow(EntityValidationError);

      expect(() => {
        user.assignRole('invalid-role-id', ''); // Both invalid
      }).toThrow(EntityValidationError);
    });

    it('should maintain entity state consistency after failed operations', () => {
      const originalProps = UserDataBuilder({
        email: 'state@example.com',
        password: 'OriginalPassword123!',
        isActive: true,
        roleId: '550e8400-e29b-41d4-a716-446655440007',
      });

      const user = new UserEntity(originalProps);
      const originalPassword = user.password;
      const originalRoleId = user.roleId;
      const originalUpdatedAt = user.updatedAt;

      // Attempt invalid operations
      try {
        user.updatePassword('', 'admin');
      } catch {
        // State should remain unchanged
        expect(user.password).toBe(originalPassword);
        expect(user.updatedAt).toBe(originalUpdatedAt);
      }

      try {
        user.assignRole('invalid-uuid', 'admin');
      } catch {
        // State should remain unchanged
        expect(user.roleId).toBe(originalRoleId);
        expect(user.updatedAt).toBe(originalUpdatedAt);
      }
    });

    it('should handle edge cases in date and timestamp operations', () => {
      const user = new UserEntity(UserDataBuilder({}));

      // Test token expiration dates
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365); // 1 year ago

      user.setActivationToken('550e8400-e29b-41d4-a716-446655440008', futureDate, 'admin');
      expect(user.activationTokenExpiresAt).toBe(futureDate);

      user.setPasswordResetToken('550e8400-e29b-41d4-a716-446655440009', pastDate, 'admin');
      expect(user.passwordResetTokenExpiresAt).toBe(pastDate);

      // Test multiple login updates - just verify they're different objects
      const loginTime1 = user.lastLoginAt;
      user.updateLastLogin();
      const loginTime2 = user.lastLoginAt;
      user.updateLastLogin();
      const loginTime3 = user.lastLoginAt;

      expect(loginTime2).not.toBe(loginTime1);
      expect(loginTime3).not.toBe(loginTime2);
      expect(loginTime3).toBeInstanceOf(Date);
      expect(loginTime2).toBeInstanceOf(Date);
    });
  });

  describe('Business Logic Integration', () => {
    it('should enforce business rules across multiple entity operations', () => {
      // Test activation business logic
      const activeUser = new UserEntity(UserDataBuilder({ isActive: true }));
      const originalActivatedAt = activeUser.activatedAt;
      const originalUpdatedAt = activeUser.updatedAt;

      // Should not re-activate already active user
      activeUser.activate('admin');
      expect(activeUser.activatedAt).toBe(originalActivatedAt);
      expect(activeUser.updatedAt).toBe(originalUpdatedAt);

      // Test deactivation business logic
      const inactiveUser = new UserEntity(UserDataBuilder({ isActive: false }));
      const originalDeactivatedAt = inactiveUser.deactivatedAt;
      const originalInactiveUpdatedAt = inactiveUser.updatedAt;

      // Should not re-deactivate already inactive user
      inactiveUser.deactivate('admin');
      expect(inactiveUser.deactivatedAt).toBe(originalDeactivatedAt);
      expect(inactiveUser.updatedAt).toBe(originalInactiveUpdatedAt);
    });

    it('should handle role management with proper validation integration', () => {
      const user = new UserEntity(UserDataBuilder({ roleId: null }));

      // Assign valid role
      const roleId = '550e8400-e29b-41d4-a716-446655440010';
      user.assignRole(roleId, 'admin');
      expect(user.roleId).toBe(roleId);

      // Remove role
      user.removeRole('admin');
      expect(user.roleId).toBeNull();

      // Try to assign invalid role
      expect(() => {
        user.assignRole('invalid-role', 'admin');
      }).toThrow(EntityValidationError);

      // Ensure role remains null after failed assignment
      expect(user.roleId).toBeNull();
    });

    it('should handle token lifecycle management with validation', () => {
      const user = new UserEntity(
        UserDataBuilder({
          activationToken: null,
          activationTokenExpiresAt: null,
          passwordResetToken: null,
          passwordResetTokenExpiresAt: null,
        }),
      );

      // Set activation token
      const activationToken = '550e8400-e29b-41d4-a716-446655440011';
      const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.setActivationToken(activationToken, activationExpires, 'admin');

      expect(user.activationToken).toBe(activationToken);
      expect(user.activationTokenExpiresAt).toBe(activationExpires);

      // Set password reset token (should coexist with activation token)
      const resetToken = '550e8400-e29b-41d4-a716-446655440012';
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      user.setPasswordResetToken(resetToken, resetExpires, 'admin');

      expect(user.passwordResetToken).toBe(resetToken);
      expect(user.passwordResetTokenExpiresAt).toBe(resetExpires);
      expect(user.activationToken).toBe(activationToken); // Should still exist

      // Clear tokens
      user.clearActivationToken('admin');
      expect(user.activationToken).toBeNull();
      expect(user.activationTokenExpiresAt).toBeNull();
      expect(user.passwordResetToken).toBe(resetToken); // Should still exist

      user.clearPasswordResetToken('admin');
      expect(user.passwordResetToken).toBeNull();
      expect(user.passwordResetTokenExpiresAt).toBeNull();
    });
  });

  describe('Data Integrity Integration', () => {
    it('should maintain audit trail consistency throughout entity lifecycle', () => {
      const initialCreator = 'system';
      const user = new UserEntity(
        UserDataBuilder({
          createdBy: initialCreator,
          updatedBy: initialCreator,
          isActive: false,
          activatedBy: null,
          deactivatedBy: null,
        }),
      );

      expect(user.createdBy).toBe(initialCreator);
      expect(user.updatedBy).toBe(initialCreator);

      // Track updates through various operations
      const admin = 'admin-user';

      user.updatePassword('NewPassword123!', admin);
      expect(user.updatedBy).toBe(admin);
      expect(user.createdBy).toBe(initialCreator); // Should not change

      user.activate(admin);
      expect(user.updatedBy).toBe(admin);
      expect(user.activatedBy).toBe(admin);
      expect(user.createdBy).toBe(initialCreator); // Should not change

      user.assignRole('550e8400-e29b-41d4-a716-446655440013', admin);
      expect(user.updatedBy).toBe(admin);
      expect(user.createdBy).toBe(initialCreator); // Should not change

      const moderator = 'moderator-user';
      user.deactivate(moderator);
      expect(user.updatedBy).toBe(moderator);
      expect(user.deactivatedBy).toBe(moderator);
      expect(user.activatedBy).toBe(admin); // Should not change
      expect(user.createdBy).toBe(initialCreator); // Should not change
    });

    it('should handle timestamp consistency across operations', () => {
      const user = new UserEntity(UserDataBuilder({}));
      const originalCreatedAt = user.createdAt;
      const originalUpdatedAt = user.updatedAt;

      user.updatePassword('NewPassword123!', 'admin');

      expect(user.createdAt).toBe(originalCreatedAt); // Should never change
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());

      const afterPasswordUpdateTime = user.updatedAt.getTime();

      user.activate('admin');
      expect(user.createdAt).toBe(originalCreatedAt); // Should never change
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(afterPasswordUpdateTime);
    });
  });
});
