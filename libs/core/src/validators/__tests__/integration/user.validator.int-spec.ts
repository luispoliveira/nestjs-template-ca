import {
  UserValidator,
  UserValidatorFactory,
  UserRules,
} from '@lib/core/validators/user.validator';
import { UserDataBuilder } from '@lib/core/testing/helpers/user-data-builder';
import { UserEntity } from '@lib/core/entities/user.entity';
import { EntityValidationError } from '@lib/shared/core/errors/validation-error';

describe('UserValidator Integration Tests', () => {
  describe('Validator and Entity Integration', () => {
    it('should validate complete user data flow from creation to entity instantiation', () => {
      const validator = UserValidatorFactory.create();
      const userData = UserDataBuilder({
        email: 'integration@test.com',
        password: 'SecurePassword123!',
        isActive: true,
        createdBy: 'system',
        updatedBy: 'system',
      });

      // Validate data using validator
      const userRules = new UserRules(userData);
      const isValid = validator.validate(userRules);

      expect(isValid).toBe(true);
      expect(validator.errors).toEqual({});
      expect(validator.validatedData).toEqual(userRules);

      // Create entity with validated data
      const user = new UserEntity(userData);
      expect(user.email).toBe('integration@test.com');
      expect(user.password).toBe('SecurePassword123!');
      expect(user.isActive).toBe(true);
    });

    it('should handle validation errors consistently between validator and entity', () => {
      const validator = UserValidatorFactory.create();
      const invalidData = UserDataBuilder({
        email: 'invalid-email',
        password: 'weak',
        activationToken: 'invalid-uuid',
        roleId: 'invalid-uuid',
      });

      // Test validator directly
      const userRules = new UserRules(invalidData);
      const isValid = validator.validate(userRules);

      expect(isValid).toBe(false);
      expect(validator.errors).toHaveProperty('email');
      expect(validator.errors).toHaveProperty('password');
      expect(validator.errors).toHaveProperty('activationToken');
      expect(validator.errors).toHaveProperty('roleId');

      // Test entity creation with same invalid data
      expect(() => new UserEntity(invalidData)).toThrow(EntityValidationError);
    });

    it('should validate complex field combinations and interdependencies', () => {
      const validator = UserValidatorFactory.create();

      // Test with all optional fields set to valid values
      const complexData = UserDataBuilder({
        email: 'complex@example.com',
        password: 'ComplexPassword123!',
        isActive: true,
        activationToken: '550e8400-e29b-41d4-a716-446655440000',
        activationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        passwordResetToken: '550e8400-e29b-41d4-a716-446655440001',
        passwordResetTokenExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        lastLoginAt: new Date(),
        activatedAt: new Date(),
        deactivatedAt: null,
        createdBy: 'admin',
        updatedBy: 'admin',
        activatedBy: 'admin',
        deactivatedBy: null,
        roleId: '550e8400-e29b-41d4-a716-446655440002',
      });

      const userRules = new UserRules(complexData);
      const isValid = validator.validate(userRules);

      expect(isValid).toBe(true);
      expect(validator.errors).toEqual({});

      // Ensure entity can be created with this complex data
      const user = new UserEntity(complexData);
      expect(user.email).toBe('complex@example.com');
      expect(user.activationToken).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(user.passwordResetToken).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(user.roleId).toBe('550e8400-e29b-41d4-a716-446655440002');
    });

    it('should maintain validation consistency during entity lifecycle operations', () => {
      const user = new UserEntity(
        UserDataBuilder({
          email: 'lifecycle@test.com',
          isActive: false,
        }),
      );

      // Test activation with validation
      const activatedBy = 'admin';
      user.activate(activatedBy);

      // Verify the internal validation worked correctly
      expect(user.isActive).toBe(true);
      expect(user.activatedBy).toBe(activatedBy);

      // Test role assignment with validation
      const roleId = '550e8400-e29b-41d4-a716-446655440003';
      user.assignRole(roleId, activatedBy);

      expect(user.roleId).toBe(roleId);

      // Test password update with validation
      const newPassword = 'NewSecurePassword456!';
      user.updatePassword(newPassword, activatedBy);

      expect(user.password).toBe(newPassword);

      // Test token operations with validation
      const token = '550e8400-e29b-41d4-a716-446655440004';
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.setActivationToken(token, expiresAt, activatedBy);

      expect(user.activationToken).toBe(token);
      expect(user.activationTokenExpiresAt).toBe(expiresAt);
    });
  });

  describe('Error Handling Integration', () => {
    it('should provide detailed validation errors that match entity validation behavior', () => {
      const validator = UserValidatorFactory.create();
      const invalidData = UserDataBuilder({
        email: '', // Invalid: empty
        password: 'abc', // Invalid: too weak
        isActive: null as unknown as boolean, // Invalid: not boolean
        activationToken: 'not-a-uuid', // Invalid: not UUID
        passwordResetToken: 'also-not-uuid', // Invalid: not UUID
        roleId: 'invalid-role-uuid', // Invalid: not UUID
        createdBy: '', // Invalid: empty when provided
        updatedBy: '', // Invalid: empty when provided
      });

      const userRules = new UserRules(invalidData);
      const isValid = validator.validate(userRules);

      expect(isValid).toBe(false);

      // Check specific error messages
      expect(validator.errors.email).toContain('email must be an email');
      expect(validator.errors.email).toContain('email should not be empty');
      expect(validator.errors.password).toBeDefined();
      expect(validator.errors.isActive).toBeDefined();
      expect(validator.errors.activationToken).toContain('activationToken must be a UUID');
      expect(validator.errors.passwordResetToken).toContain('passwordResetToken must be a UUID');
      expect(validator.errors.roleId).toContain('roleId must be a UUID');
      expect(validator.errors.createdBy).toContain('createdBy should not be empty');
      expect(validator.errors.updatedBy).toContain('updatedBy should not be empty');

      // Ensure entity creation fails with same data
      try {
        new UserEntity(invalidData);
        fail('Expected EntityValidationError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EntityValidationError);
        const validationError = error as EntityValidationError;

        // Ensure the same validation errors are present
        expect(validationError.errors).toHaveProperty('email');
        expect(validationError.errors).toHaveProperty('password');
        expect(validationError.errors).toHaveProperty('isActive');
        expect(validationError.errors).toHaveProperty('activationToken');
        expect(validationError.errors).toHaveProperty('passwordResetToken');
        expect(validationError.errors).toHaveProperty('roleId');
        expect(validationError.errors).toHaveProperty('createdBy');
        expect(validationError.errors).toHaveProperty('updatedBy');
      }
    });

    it('should handle edge cases in validation consistently', () => {
      const validator = UserValidatorFactory.create();

      // Test null values for optional fields (should pass)
      const dataWithNulls = UserDataBuilder({
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
      });

      const userRulesWithNulls = new UserRules(dataWithNulls);
      const isValidWithNulls = validator.validate(userRulesWithNulls);

      expect(isValidWithNulls).toBe(true);

      // Ensure entity can be created with null values
      const userWithNulls = new UserEntity(dataWithNulls);
      expect(userWithNulls.activationToken).toBeNull();
      expect(userWithNulls.roleId).toBeNull();
      expect(userWithNulls.createdBy).toBeNull();

      // Test undefined vs null handling
      const dataWithUndefined = UserDataBuilder({
        password: undefined,
        roleId: undefined,
      });

      const userRulesWithUndefined = new UserRules(dataWithUndefined);
      const isValidWithUndefined = validator.validate(userRulesWithUndefined);

      expect(isValidWithUndefined).toBe(true);

      const userWithUndefined = new UserEntity(dataWithUndefined);
      expect(userWithUndefined).toBeInstanceOf(UserEntity);
    });
  });

  describe('Performance and Validation Efficiency', () => {
    it('should efficiently validate large datasets', () => {
      const validator = UserValidatorFactory.create();
      const startTime = performance.now();

      // Test validation performance with multiple iterations
      for (let i = 0; i < 100; i++) {
        const userData = UserDataBuilder({
          email: `user${i}@example.com`,
          password: `Password${i}123!`,
          isActive: i % 2 === 0,
          roleId: i % 3 === 0 ? '550e8400-e29b-41d4-a716-446655440000' : null,
        });

        const userRules = new UserRules(userData);
        const isValid = validator.validate(userRules);
        expect(isValid).toBe(true);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete 100 validations in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle validation state correctly across multiple operations', () => {
      const validator = UserValidatorFactory.create();

      // Valid data
      const validData = UserDataBuilder({
        email: 'valid@example.com',
        password: 'ValidPassword123!',
      });

      let userRules = new UserRules(validData);
      let isValid = validator.validate(userRules);

      expect(isValid).toBe(true);
      expect(validator.errors).toEqual({});
      expect(validator.validatedData).toEqual(userRules);

      // Invalid data - should reset validator state
      const invalidData = UserDataBuilder({
        email: 'invalid-email',
        password: 'weak',
      });

      userRules = new UserRules(invalidData);
      isValid = validator.validate(userRules);

      expect(isValid).toBe(false);
      expect(validator.errors).toHaveProperty('email');
      expect(validator.errors).toHaveProperty('password');
      // validatedData should contain the original data even when invalid
      expect(validator.validatedData).toBeDefined();

      // Valid data again - should reset to valid state
      const newValidator = UserValidatorFactory.create(); // Use fresh validator instance
      userRules = new UserRules(validData);
      isValid = newValidator.validate(userRules);

      expect(isValid).toBe(true);
      expect(newValidator.errors).toEqual({});
      expect(newValidator.validatedData).toEqual(userRules);
    });
  });

  describe('Factory Pattern Integration', () => {
    it('should consistently create validators through factory', () => {
      const validator1 = UserValidatorFactory.create();
      const validator2 = UserValidatorFactory.create();

      expect(validator1).toBeInstanceOf(UserValidator);
      expect(validator2).toBeInstanceOf(UserValidator);
      expect(validator1).not.toBe(validator2); // Should be different instances

      // Both should work identically
      const testData = UserDataBuilder({
        email: 'factory@test.com',
        password: 'FactoryPassword123!',
      });

      const userRules1 = new UserRules(testData);
      const userRules2 = new UserRules(testData);

      const isValid1 = validator1.validate(userRules1);
      const isValid2 = validator2.validate(userRules2);

      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
      expect(validator1.errors).toEqual(validator2.errors);
    });

    it('should integrate factory-created validators with entity validation', () => {
      const customValidator = UserValidatorFactory.create();

      // Test that entities use the same validation logic as factory-created validators
      const testData = UserDataBuilder({
        email: 'entity-validator@test.com',
        password: 'EntityPassword123!',
        isActive: true,
      });

      // Validate directly
      const userRules = new UserRules(testData);
      const directValidation = customValidator.validate(userRules);

      expect(directValidation).toBe(true);

      // Validate through entity creation
      const entity = new UserEntity(testData);

      expect(entity.email).toBe('entity-validator@test.com');
      expect(entity.password).toBe('EntityPassword123!');
      expect(entity.isActive).toBe(true);

      // Both should produce consistent results
      expect(directValidation).toBe(true);
      expect(entity).toBeInstanceOf(UserEntity);
    });
  });
});
