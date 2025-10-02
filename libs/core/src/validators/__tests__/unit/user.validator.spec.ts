import { UserDataBuilder } from '@lib/core/testing/helpers/user-data-builder';
import {
  UserRules,
  UserValidator,
  UserValidatorFactory,
} from '@lib/core/validators/user.validator';

describe('UserValidator unit tests', () => {
  let validator: UserValidator;
  let props: UserRules;

  beforeEach(() => {
    validator = UserValidatorFactory.create();
    props = new UserRules(UserDataBuilder({}));
  });

  it('should create a validator', () => {
    expect(validator).toBeInstanceOf(UserValidator);
    expect(validator.errors).toEqual({});
    expect(validator.validatedData).toEqual({});
  });

  it('should validate valid props', () => {
    const isValid = validator.validate(props);

    expect(isValid).toBe(true);
    expect(validator.errors).toEqual({});
    expect(validator.validatedData).toEqual(props);
  });

  it('should validate invalid email', () => {
    const invalidProps = new UserRules(UserDataBuilder({ email: '' }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toEqual({
      email: ['email must be an email', 'email should not be empty'],
    });
  });

  it('should validate invalid password', () => {
    const invalidProps = new UserRules(UserDataBuilder({ password: 'weak' }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('password');
  });

  it('should validate invalid isActive', () => {
    const invalidProps = new UserRules(UserDataBuilder({ isActive: null as any }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('isActive');
  });

  it('should validate invalid activationToken', () => {
    const invalidProps = new UserRules(UserDataBuilder({ activationToken: 'invalid-uuid' }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('activationToken');
  });

  it('should validate invalid passwordResetToken', () => {
    const invalidProps = new UserRules(UserDataBuilder({ passwordResetToken: 'invalid-uuid' }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('passwordResetToken');
  });

  it('should validate invalid roleId', () => {
    const invalidProps = new UserRules(UserDataBuilder({ roleId: 0 }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('roleId');
  });

  it('should validate invalid createdAt', () => {
    const invalidProps = new UserRules(UserDataBuilder({ createdAt: null as any }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('createdAt');
  });

  it('should validate invalid updatedAt', () => {
    const invalidProps = new UserRules(UserDataBuilder({ updatedAt: null as any }));

    const isValid = validator.validate(invalidProps);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('updatedAt');
  });

  it('should validate with null values for optional fields', () => {
    const propsWithNulls = new UserRules(
      UserDataBuilder({
        activationToken: null,
        activationTokenExpiresAt: null,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        lastLoginAt: null,
        activatedAt: null,
        deactivatedAt: null,
        createdBy: null,
        updatedBy: null,
        activatedBy: null,
        deactivatedBy: null,
        roleId: null,
      }),
    );

    const isValid = validator.validate(propsWithNulls);

    expect(isValid).toBe(true);
    expect(validator.errors).toEqual({});
  });

  it('should validate with empty strings for optional fields should fail', () => {
    const propsWithEmpty = new UserRules(
      UserDataBuilder({
        createdBy: '',
        updatedBy: '',
        activatedBy: '',
        deactivatedBy: '',
      }),
    );

    const isValid = validator.validate(propsWithEmpty);

    expect(isValid).toBe(false);
    expect(validator.errors).toHaveProperty('createdBy');
    expect(validator.errors).toHaveProperty('updatedBy');
    expect(validator.errors).toHaveProperty('activatedBy');
    expect(validator.errors).toHaveProperty('deactivatedBy');
  });

  it('should create validator using factory', () => {
    const factoryValidator = UserValidatorFactory.create();

    expect(factoryValidator).toBeInstanceOf(UserValidator);
  });
});
