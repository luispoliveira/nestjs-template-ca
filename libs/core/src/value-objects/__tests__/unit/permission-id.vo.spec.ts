import { PermissionId } from '../../permission-id.vo';

describe('PermissionId Value Object unit tests', () => {
  describe('create', () => {
    it('should create a new permission id when no value is provided', () => {
      const permissionId = PermissionId.create();

      expect(permissionId).toBeDefined();
      expect(permissionId.getValue()).toBeDefined();
      expect(typeof permissionId.getValue()).toBe('string');
      expect(permissionId.getValue().length).toBeGreaterThan(0);
    });

    it('should use provided value when creating with value', () => {
      const customValue = 'custom-permission-id-123';
      const permissionId = PermissionId.create(customValue);

      expect(permissionId.getValue()).toBe(customValue);
    });

    it('should generate unique ids when called multiple times', () => {
      const permissionId1 = PermissionId.create();
      const permissionId2 = PermissionId.create();

      expect(permissionId1.getValue()).not.toBe(permissionId2.getValue());
    });
  });

  describe('fromString', () => {
    it('should create permission id from string', () => {
      const value = 'permission-id-from-string';
      const permissionId = PermissionId.fromString(value);

      expect(permissionId.getValue()).toBe(value);
    });

    it('should throw error for empty string', () => {
      expect(() => PermissionId.fromString('')).toThrow('PermissionId cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => PermissionId.fromString('   ')).toThrow('PermissionId cannot be empty');
    });
  });

  describe('getValue', () => {
    it('should return the internal value', () => {
      const value = 'test-permission-id';
      const permissionId = PermissionId.fromString(value);

      expect(permissionId.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const value = 'same-permission-id';
      const permissionId1 = PermissionId.fromString(value);
      const permissionId2 = PermissionId.fromString(value);

      expect(permissionId1.equals(permissionId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const permissionId1 = PermissionId.fromString('permission-id-1');
      const permissionId2 = PermissionId.fromString('permission-id-2');

      expect(permissionId1.equals(permissionId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string representation of the value', () => {
      const value = 'test-permission-id-string';
      const permissionId = PermissionId.fromString(value);

      expect(permissionId.toString()).toBe(value);
    });
  });
});
