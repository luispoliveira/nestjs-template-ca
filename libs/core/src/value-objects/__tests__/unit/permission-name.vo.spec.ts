import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { PermissionName } from '../../permission-name.vo';

describe('PermissionName Value Object unit tests', () => {
  describe('constructor', () => {
    it('should create a valid permission name with resource:action format', () => {
      const permissionName = new PermissionName('user:read');

      expect(permissionName).toBeDefined();
      expect(permissionName.getValue()).toBe('user:read');
      expect(permissionName.getResource()).toBe('user');
      expect(permissionName.getAction()).toBe('read');
    });

    it('should accept permission names with hyphens', () => {
      const permissionName = new PermissionName('user-profile:update-settings');

      expect(permissionName.getValue()).toBe('user-profile:update-settings');
      expect(permissionName.getResource()).toBe('user-profile');
      expect(permissionName.getAction()).toBe('update-settings');
    });

    it('should accept permission names with numbers', () => {
      const permissionName = new PermissionName('resource1:action2');

      expect(permissionName.getValue()).toBe('resource1:action2');
      expect(permissionName.getResource()).toBe('resource1');
      expect(permissionName.getAction()).toBe('action2');
    });

    it('should throw InvalidValueObjectException for invalid format without colon', () => {
      expect(() => new PermissionName('userread')).toThrow(InvalidValueObjectException);
      expect(() => new PermissionName('userread')).toThrow(
        'Permission name must be in format "resource:action"',
      );
    });

    it('should throw InvalidValueObjectException for invalid format with multiple colons', () => {
      expect(() => new PermissionName('user:read:write')).toThrow(InvalidValueObjectException);
      expect(() => new PermissionName('user:read:write')).toThrow(
        'Permission name must be in format "resource:action"',
      );
    });

    it('should throw InvalidValueObjectException for empty resource', () => {
      expect(() => new PermissionName(':read')).toThrow(InvalidValueObjectException);
      expect(() => new PermissionName(':read')).toThrow(
        'Permission name must be in format "resource:action"',
      );
    });

    it('should throw InvalidValueObjectException for empty action', () => {
      expect(() => new PermissionName('user:')).toThrow(InvalidValueObjectException);
      expect(() => new PermissionName('user:')).toThrow(
        'Permission name must be in format "resource:action"',
      );
    });

    it('should throw InvalidValueObjectException for uppercase letters', () => {
      expect(() => new PermissionName('User:read')).toThrow(InvalidValueObjectException);
      expect(() => new PermissionName('user:Read')).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException for special characters other than hyphen', () => {
      expect(() => new PermissionName('user_profile:read')).toThrow(InvalidValueObjectException);
      expect(() => new PermissionName('user:read@action')).toThrow(InvalidValueObjectException);
    });

    it('should throw InvalidValueObjectException for empty string', () => {
      expect(() => new PermissionName('')).toThrow(InvalidValueObjectException);
    });
  });

  describe('static create', () => {
    it('should create permission name from resource and action', () => {
      const permissionName = PermissionName.create('user', 'read');

      expect(permissionName.getValue()).toBe('user:read');
      expect(permissionName.getResource()).toBe('user');
      expect(permissionName.getAction()).toBe('read');
    });

    it('should create permission name with hyphenated resource and action', () => {
      const permissionName = PermissionName.create('user-profile', 'update-settings');

      expect(permissionName.getValue()).toBe('user-profile:update-settings');
      expect(permissionName.getResource()).toBe('user-profile');
      expect(permissionName.getAction()).toBe('update-settings');
    });
  });

  describe('getValue', () => {
    it('should return the full permission name', () => {
      const permissionName = new PermissionName('role:delete');

      expect(permissionName.getValue()).toBe('role:delete');
    });
  });

  describe('getResource', () => {
    it('should return the resource part', () => {
      const permissionName = new PermissionName('role:delete');

      expect(permissionName.getResource()).toBe('role');
    });
  });

  describe('getAction', () => {
    it('should return the action part', () => {
      const permissionName = new PermissionName('role:delete');

      expect(permissionName.getAction()).toBe('delete');
    });
  });

  describe('equals', () => {
    it('should return true for same permission names', () => {
      const permissionName1 = new PermissionName('user:read');
      const permissionName2 = new PermissionName('user:read');

      expect(permissionName1.equals(permissionName2)).toBe(true);
    });

    it('should return false for different permission names', () => {
      const permissionName1 = new PermissionName('user:read');
      const permissionName2 = new PermissionName('user:write');

      expect(permissionName1.equals(permissionName2)).toBe(false);
    });

    it('should return false for different resources with same action', () => {
      const permissionName1 = new PermissionName('user:read');
      const permissionName2 = new PermissionName('role:read');

      expect(permissionName1.equals(permissionName2)).toBe(false);
    });
  });
});
