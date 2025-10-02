import { UserEntity, UserProps } from '@lib/core/entities/user.entity';
import { UserDataBuilder } from '@lib/core/testing/helpers/user-data-builder';
import { EntityValidationError } from '@lib/shared/core/errors/validation-error';

describe('UserEntity unit tests', () => {
  let props: UserProps;
  let sut: UserEntity;

  beforeEach(() => {
    props = UserDataBuilder({});
    sut = new UserEntity(props, 1);
  });

  it('should create a user entity', () => {
    expect(sut).toBeInstanceOf(UserEntity);
    expect(sut.id).toBeDefined();
    expect(sut.email).toBe(props.email);
    expect(sut.password).toBe(props.password);
    expect(sut.isActive).toBe(props.isActive);
    expect(sut.createdAt).toBeInstanceOf(Date);
    expect(sut.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a user entity with provided id', () => {
    const customId = 123;
    const user = new UserEntity(props, customId);
    expect(user.id).toBe(customId);
  });

  it('should throw EntityValidationError when creating with invalid props', () => {
    const invalidProps = UserDataBuilder({ email: '' });
    expect(() => new UserEntity(invalidProps)).toThrow(EntityValidationError);
  });

  describe('updatePassword method', () => {
    it('should update password successfully', () => {
      const newPassword = 'newPassword123';
      const updatedBy = 'user-id';

      sut.updatePassword(newPassword, updatedBy);

      expect(sut.password).toBe(newPassword);
      expect(sut.updatedBy).toBe(updatedBy);
      expect(sut.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityValidationError when updating with invalid password', () => {
      const invalidPassword = '';
      const updatedBy = 'user-id';

      expect(() => sut.updatePassword(invalidPassword, updatedBy)).toThrow(EntityValidationError);
    });
  });

  describe('activate method', () => {
    it('should activate inactive user', () => {
      const inactiveProps = UserDataBuilder({
        isActive: false,
        activatedAt: null,
        activatedBy: null,
      });
      const inactiveUser = new UserEntity(inactiveProps);
      const activatedBy = 'admin-id';

      inactiveUser.activate(activatedBy);

      expect(inactiveUser.isActive).toBe(true);
      expect(inactiveUser.activatedAt).toBeInstanceOf(Date);
      expect(inactiveUser.activatedBy).toBe(activatedBy);
      expect(inactiveUser.updatedBy).toBe(activatedBy);
      expect(inactiveUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should not activate already active user', () => {
      const activeProps = UserDataBuilder({ isActive: true });
      const activeUser = new UserEntity(activeProps);
      const activatedBy = 'admin-id';
      const originalActivatedAt = activeUser.activatedAt;
      const originalUpdatedAt = activeUser.updatedAt;

      activeUser.activate(activatedBy);

      expect(activeUser.isActive).toBe(true);
      expect(activeUser.activatedAt).toBe(originalActivatedAt);
      expect(activeUser.updatedAt).toBe(originalUpdatedAt);
    });

    it('should throw EntityValidationError when activating with invalid data', () => {
      const inactiveProps = UserDataBuilder({ isActive: false });
      const inactiveUser = new UserEntity(inactiveProps);
      const invalidActivatedBy = '';

      expect(() => inactiveUser.activate(invalidActivatedBy)).toThrow(EntityValidationError);
    });
  });

  describe('deactivate method', () => {
    it('should deactivate active user', () => {
      const activeProps = UserDataBuilder({
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
      });
      const activeUser = new UserEntity(activeProps);
      const deactivatedBy = 'admin-id';

      activeUser.deactivate(deactivatedBy);

      expect(activeUser.isActive).toBe(false);
      expect(activeUser.deactivatedAt).toBeInstanceOf(Date);
      expect(activeUser.deactivatedBy).toBe(deactivatedBy);
      expect(activeUser.updatedBy).toBe(deactivatedBy);
      expect(activeUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should not deactivate already inactive user', () => {
      const inactiveProps = UserDataBuilder({ isActive: false });
      const inactiveUser = new UserEntity(inactiveProps);
      const deactivatedBy = 'admin-id';
      const originalDeactivatedAt = inactiveUser.deactivatedAt;
      const originalUpdatedAt = inactiveUser.updatedAt;

      inactiveUser.deactivate(deactivatedBy);

      expect(inactiveUser.isActive).toBe(false);
      expect(inactiveUser.deactivatedAt).toBe(originalDeactivatedAt);
      expect(inactiveUser.updatedAt).toBe(originalUpdatedAt);
    });

    it('should throw EntityValidationError when deactivating with invalid data', () => {
      const activeProps = UserDataBuilder({ isActive: true });
      const activeUser = new UserEntity(activeProps);
      const invalidDeactivatedBy = '';

      expect(() => activeUser.deactivate(invalidDeactivatedBy)).toThrow(EntityValidationError);
    });
  });

  describe('setActivationToken method', () => {
    it('should set activation token successfully', () => {
      const token = '550e8400-e29b-41d4-a716-446655440000';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const updatedBy = 'user-id';

      sut.setActivationToken(token, expiresAt, updatedBy);

      expect(sut.activationToken).toBe(token);
      expect(sut.activationTokenExpiresAt).toBe(expiresAt);
      expect(sut.updatedBy).toBe(updatedBy);
      expect(sut.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityValidationError when setting invalid activation token', () => {
      const invalidToken = '';
      const expiresAt = new Date();
      const updatedBy = 'user-id';

      expect(() => sut.setActivationToken(invalidToken, expiresAt, updatedBy)).toThrow(
        EntityValidationError,
      );
    });
  });

  describe('clearActivationToken method', () => {
    it('should clear activation token successfully', () => {
      const propsWithToken = UserDataBuilder({
        activationToken: '550e8400-e29b-41d4-a716-446655440002',
        activationTokenExpiresAt: new Date(),
      });
      const userWithToken = new UserEntity(propsWithToken);
      const updatedBy = 'user-id';

      userWithToken.clearActivationToken(updatedBy);

      expect(userWithToken.activationToken).toBeNull();
      expect(userWithToken.activationTokenExpiresAt).toBeNull();
      expect(userWithToken.updatedBy).toBe(updatedBy);
      expect(userWithToken.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityValidationError when clearing with invalid data', () => {
      const updatedBy = '';

      expect(() => sut.clearActivationToken(updatedBy)).toThrow(EntityValidationError);
    });
  });

  describe('setPasswordResetToken method', () => {
    it('should set password reset token successfully', () => {
      const token = '550e8400-e29b-41d4-a716-446655440001';
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const updatedBy = 'user-id';

      sut.setPasswordResetToken(token, expiresAt, updatedBy);

      expect(sut.passwordResetToken).toBe(token);
      expect(sut.passwordResetTokenExpiresAt).toBe(expiresAt);
      expect(sut.updatedBy).toBe(updatedBy);
      expect(sut.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityValidationError when setting invalid password reset token', () => {
      const invalidToken = '';
      const expiresAt = new Date();
      const updatedBy = 'user-id';

      expect(() => sut.setPasswordResetToken(invalidToken, expiresAt, updatedBy)).toThrow(
        EntityValidationError,
      );
    });
  });

  describe('clearPasswordResetToken method', () => {
    it('should clear password reset token successfully', () => {
      const propsWithToken = UserDataBuilder({
        passwordResetToken: '550e8400-e29b-41d4-a716-446655440003',
        passwordResetTokenExpiresAt: new Date(),
      });
      const userWithToken = new UserEntity(propsWithToken);
      const updatedBy = 'user-id';

      userWithToken.clearPasswordResetToken(updatedBy);

      expect(userWithToken.passwordResetToken).toBeNull();
      expect(userWithToken.passwordResetTokenExpiresAt).toBeNull();
      expect(userWithToken.updatedBy).toBe(updatedBy);
      expect(userWithToken.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityValidationError when clearing with invalid data', () => {
      const updatedBy = '';

      expect(() => sut.clearPasswordResetToken(updatedBy)).toThrow(EntityValidationError);
    });
  });

  describe('updateLastLogin method', () => {
    it('should update last login timestamp', () => {
      const originalLastLogin = sut.lastLoginAt;

      sut.updateLastLogin();

      expect(sut.lastLoginAt).toBeInstanceOf(Date);
      expect(sut.lastLoginAt).not.toBe(originalLastLogin);
    });
  });

  describe('assignRole method', () => {
    it('should assign role successfully', () => {
      const roleId = 1;
      const updatedBy = 'user-id';

      sut.assignRole(roleId, updatedBy);

      expect(sut.roleId).toBe(roleId);
      expect(sut.updatedBy).toBe(updatedBy);
      expect(sut.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityValidationError when assigning invalid role', () => {
      const invalidRoleId = 0;
      const updatedBy = 'user-id';

      expect(() => sut.assignRole(invalidRoleId, updatedBy)).toThrow(EntityValidationError);
    });
  });

  describe('removeRole method', () => {
    it('should remove role successfully', () => {
      const propsWithRole = UserDataBuilder({ roleId: 1 });
      const userWithRole = new UserEntity(propsWithRole);
      const updatedBy = 'user-id';

      userWithRole.removeRole(updatedBy);

      expect(userWithRole.roleId).toBeNull();
      expect(userWithRole.updatedBy).toBe(updatedBy);
      expect(userWithRole.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw EntityValidationError when removing role with invalid data', () => {
      const updatedBy = '';

      expect(() => sut.removeRole(updatedBy)).toThrow(EntityValidationError);
    });
  });

  describe('getters', () => {
    it('should return correct values for all getters', () => {
      expect(sut.email).toBe(props.email);
      expect(sut.password).toBe(props.password);
      expect(sut.isActive).toBe(props.isActive);
      expect(sut.roleId).toBe(props.roleId);
      expect(sut.createdAt).toBeInstanceOf(Date);
      expect(sut.updatedAt).toBeInstanceOf(Date);
      expect(sut.activatedAt).toBe(props.activatedAt);
      expect(sut.deactivatedAt).toBe(props.deactivatedAt);
      expect(sut.lastLoginAt).toBe(props.lastLoginAt);
      expect(sut.activationToken).toBe(props.activationToken);
      expect(sut.activationTokenExpiresAt).toBe(props.activationTokenExpiresAt);
      expect(sut.passwordResetToken).toBe(props.passwordResetToken);
      expect(sut.passwordResetTokenExpiresAt).toBe(props.passwordResetTokenExpiresAt);
      expect(sut.createdBy).toBe(props.createdBy);
      expect(sut.updatedBy).toBe(props.updatedBy);
      expect(sut.activatedBy).toBe(props.activatedBy);
      expect(sut.deactivatedBy).toBe(props.deactivatedBy);
    });
  });
});
