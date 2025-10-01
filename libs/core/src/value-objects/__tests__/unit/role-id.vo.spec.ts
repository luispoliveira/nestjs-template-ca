import { RoleId } from '../../role-id.vo';

describe('RoleId Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid role id', () => {
      const value = 'test-role-id';
      const roleId = new RoleId(value);

      expect(roleId).toBeDefined();
      expect(roleId.getValue()).toBe(value);
    });

    it('should throw error for empty string', () => {
      expect(() => new RoleId('')).toThrow('RoleId cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => new RoleId('   ')).toThrow('RoleId cannot be empty');
    });
  });

  describe('create', () => {
    it('should create a new role id when no value is provided', () => {
      const roleId = RoleId.create();

      expect(roleId).toBeDefined();
      expect(roleId.getValue()).toBeDefined();
      expect(typeof roleId.getValue()).toBe('string');
      expect(roleId.getValue().length).toBeGreaterThan(0);
    });

    it('should use provided value when creating with value', () => {
      const customValue = 'custom-role-id-123';
      const roleId = RoleId.create(customValue);

      expect(roleId.getValue()).toBe(customValue);
    });

    it('should generate unique ids when called multiple times', () => {
      const roleId1 = RoleId.create();
      const roleId2 = RoleId.create();

      expect(roleId1.getValue()).not.toBe(roleId2.getValue());
    });
  });

  describe('fromString', () => {
    it('should create role id from string', () => {
      const value = 'role-id-from-string';
      const roleId = RoleId.fromString(value);

      expect(roleId.getValue()).toBe(value);
    });

    it('should throw error for empty string', () => {
      expect(() => RoleId.fromString('')).toThrow('RoleId cannot be empty');
    });

    it('should throw error for whitespace only string', () => {
      expect(() => RoleId.fromString('   ')).toThrow('RoleId cannot be empty');
    });
  });

  describe('getValue', () => {
    it('should return the internal value', () => {
      const value = 'test-role-id';
      const roleId = new RoleId(value);

      expect(roleId.getValue()).toBe(value);
    });
  });

  describe('equals', () => {
    it('should return true for same values', () => {
      const value = 'same-role-id';
      const roleId1 = new RoleId(value);
      const roleId2 = new RoleId(value);

      expect(roleId1.equals(roleId2)).toBe(true);
    });

    it('should return false for different values', () => {
      const roleId1 = new RoleId('role-id-1');
      const roleId2 = new RoleId('role-id-2');

      expect(roleId1.equals(roleId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the string representation of the value', () => {
      const value = 'test-role-id-string';
      const roleId = new RoleId(value);

      expect(roleId.toString()).toBe(value);
    });
  });
});
