import {
  CannotDeleteDefaultRoleException,
  InvalidValueObjectException,
  PermissionAlreadyAssignedException,
} from '@lib/core/exceptions/domain-exceptions';
import { PermissionsCollection } from '@lib/core/value-objects/collections/permissions.collection';
import { PermissionId } from '@lib/core/value-objects/permission-id.vo';
import { ResourceAction } from '@lib/core/value-objects/resource-action.vo';
import { RoleId } from '@lib/core/value-objects/role-id.vo';
import { Permission } from '../../permission.entity';
import { Role } from '../../role.entity';

describe('Role Entity Unit Tests', () => {
  let permission1: Permission;
  let permission2: Permission;
  let adminPermission: Permission;

  beforeEach(() => {
    permission1 = Permission.create(new ResourceAction('user', 'read'), 'Can read users');
    permission2 = Permission.create(new ResourceAction('role', 'read'), 'Can read roles');
    adminPermission = Permission.create(new ResourceAction('user', 'all'), 'Admin permission');
  });

  describe('create', () => {
    it('should create a new Role', () => {
      const role = Role.create('Editor', 'Can edit content');

      expect(role.id).toBeInstanceOf(RoleId);
      expect(role.name).toBe('Editor');
      expect(role.description).toBe('Can edit content');
      expect(role.permissions).toEqual([]);
      expect(role.isDefault).toBe(false);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a default role', () => {
      const role = Role.create('User', 'Default user role', true);

      expect(role.isDefault).toBe(true);
    });

    it('should throw error for empty name', () => {
      expect(() => Role.create('', 'Description')).toThrow(InvalidValueObjectException);
      expect(() => Role.create('   ', 'Description')).toThrow(InvalidValueObjectException);
    });

    it('should throw error for name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      expect(() => Role.create(longName, 'Description')).toThrow(InvalidValueObjectException);
    });

    it('should throw error for empty description', () => {
      expect(() => Role.create('Role', '')).toThrow(InvalidValueObjectException);
      expect(() => Role.create('Role', '   ')).toThrow(InvalidValueObjectException);
    });

    it('should throw error for description exceeding 255 characters', () => {
      const longDescription = 'a'.repeat(256);
      expect(() => Role.create('Role', longDescription)).toThrow(InvalidValueObjectException);
    });
  });

  describe('fromData', () => {
    it('should create Role from data object', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');
      const data = {
        id: 'test-role-id',
        name: 'Editor',
        description: 'Can edit content',
        permissions: [permission1, permission2],
        isDefault: true,
        createdAt,
        updatedAt,
      };

      const role = Role.fromData(data);

      expect(role.id.getValue()).toBe(data.id);
      expect(role.name).toBe(data.name);
      expect(role.description).toBe(data.description);
      expect(role.permissions).toEqual(data.permissions);
      expect(role.isDefault).toBe(data.isDefault);
      expect(role.createdAt).toBe(data.createdAt);
      expect(role.updatedAt).toBe(data.updatedAt);
    });
  });

  describe('addPermission', () => {
    it('should add a permission to the role', async () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 1));
      role.addPermission(permission1);

      expect(role.permissions).toContain(permission1);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error when adding duplicate permission', () => {
      const role = Role.create('Editor', 'Can edit content');
      role.addPermission(permission1);

      expect(() => role.addPermission(permission1)).toThrow(PermissionAlreadyAssignedException);
    });

    it('should add multiple different permissions', () => {
      const role = Role.create('Editor', 'Can edit content');

      role.addPermission(permission1);
      role.addPermission(permission2);

      expect(role.permissions).toContain(permission1);
      expect(role.permissions).toContain(permission2);
      expect(role.permissions.length).toBe(2);
    });
  });

  describe('addPermissionsOnCreation', () => {
    it('should add multiple permissions on creation', async () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      role.addPermissionsOnCreation([permission1, permission2]);

      expect(role.permissions).toContain(permission1);
      expect(role.permissions).toContain(permission2);
      expect(role.permissions.length).toBe(2);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should handle empty permissions array', async () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      role.addPermissionsOnCreation([]);

      expect(role.permissions.length).toBe(0);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('removePermission', () => {
    it('should remove an existing permission', async () => {
      const role = Role.create('Editor', 'Can edit content');
      role.addPermission(permission1);
      role.addPermission(permission2);
      const originalUpdatedAt = role.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));
      role.removePermission(permission1.id);

      expect(role.permissions).not.toContain(permission1);
      expect(role.permissions).toContain(permission2);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should do nothing when removing non-existent permission', () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;
      const nonExistentPermissionId = PermissionId.create();

      role.removePermission(nonExistentPermissionId);

      expect(role.permissions.length).toBe(0);
      expect(role.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('updateDetails', () => {
    it('should update name and description', async () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;
      const newName = 'Senior Editor';
      const newDescription = 'Senior editor with advanced permissions';

      await new Promise((resolve) => setTimeout(resolve, 10));
      role.updateDetails(newName, newDescription);

      expect(role.name).toBe(newName);
      expect(role.description).toBe(newDescription);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should update only name', async () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalDescription = role.description;
      const originalUpdatedAt = role.updatedAt;
      const newName = 'Senior Editor';

      await new Promise((resolve) => setTimeout(resolve, 1));
      role.updateDetails(newName);

      expect(role.name).toBe(newName);
      expect(role.description).toBe(originalDescription);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should update only description', async () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalName = role.name;
      const originalUpdatedAt = role.updatedAt;
      const newDescription = 'Updated description';

      await new Promise((resolve) => setTimeout(resolve, 1));
      role.updateDetails(undefined, newDescription);

      expect(role.name).toBe(originalName);
      expect(role.description).toBe(newDescription);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not update if values are the same', () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;

      role.updateDetails('Editor', 'Can edit content');

      expect(role.updatedAt).toBe(originalUpdatedAt);
    });

    it('should throw error for invalid name', () => {
      const role = Role.create('Editor', 'Can edit content');

      expect(() => role.updateDetails('   ')).toThrow(InvalidValueObjectException);
    });

    it('should throw error for invalid description', () => {
      const role = Role.create('Editor', 'Can edit content');

      expect(() => role.updateDetails(undefined, '   ')).toThrow(InvalidValueObjectException);
    });
  });

  describe('setAsDefault', () => {
    it('should set role as default', async () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 1));
      role.setAsDefault();

      expect(role.isDefault).toBe(true);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not update if already default', () => {
      const role = Role.create('Editor', 'Can edit content', true);
      const originalUpdatedAt = role.updatedAt;

      role.setAsDefault();

      expect(role.isDefault).toBe(true);
      expect(role.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('removeAsDefault', () => {
    it('should remove role as default', async () => {
      const role = Role.create('Editor', 'Can edit content', true);
      const originalUpdatedAt = role.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 1));
      role.removeAsDefault();

      expect(role.isDefault).toBe(false);
      expect(role.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not update if not default', () => {
      const role = Role.create('Editor', 'Can edit content');
      const originalUpdatedAt = role.updatedAt;

      role.removeAsDefault();

      expect(role.isDefault).toBe(false);
      expect(role.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('hasPermission', () => {
    it('should return true for existing permission', () => {
      const role = Role.create('Editor', 'Can edit content');
      role.addPermission(permission1);

      expect(role.hasPermission(permission1.id)).toBe(true);
    });

    it('should return false for non-existing permission', () => {
      const role = Role.create('Editor', 'Can edit content');
      const nonExistentPermissionId = PermissionId.create();

      expect(role.hasPermission(nonExistentPermissionId)).toBe(false);
    });
  });

  describe('hasPermissionByName', () => {
    it('should return true for existing permission by name', () => {
      const role = Role.create('Editor', 'Can edit content');
      role.addPermission(permission1);

      expect(role.hasPermissionByName('user:read')).toBe(true);
    });

    it('should return false for non-existing permission by name', () => {
      const role = Role.create('Editor', 'Can edit content');

      expect(role.hasPermissionByName('user:delete')).toBe(false);
    });
  });

  describe('isAdminRole', () => {
    it('should return true for role with admin permissions', () => {
      const role = Role.create('Admin', 'Administrator role');
      role.addPermission(adminPermission);

      expect(role.isAdminRole()).toBe(true);
    });

    it('should return true for role with admin in name', () => {
      const role = Role.create('Administrator', 'Admin role');

      expect(role.isAdminRole()).toBe(true);
    });

    it('should return true for role with admin lowercase in name', () => {
      const role = Role.create('system admin', 'System admin role');

      expect(role.isAdminRole()).toBe(true);
    });

    it('should return false for regular role', () => {
      const role = Role.create('Editor', 'Can edit content');
      role.addPermission(permission1);

      expect(role.isAdminRole()).toBe(false);
    });
  });

  describe('canBeDeleted', () => {
    it('should return true for non-default role', () => {
      const role = Role.create('Editor', 'Can edit content');

      expect(role.canBeDeleted()).toBe(true);
    });

    it('should return false for default role', () => {
      const role = Role.create('User', 'Default user role', true);

      expect(role.canBeDeleted()).toBe(false);
    });
  });

  describe('validateForDeletion', () => {
    it('should not throw for non-default role', () => {
      const role = Role.create('Editor', 'Can edit content');

      expect(() => role.validateForDeletion()).not.toThrow();
    });

    it('should throw for default role', () => {
      const role = Role.create('User', 'Default user role', true);

      expect(() => role.validateForDeletion()).toThrow(CannotDeleteDefaultRoleException);
    });
  });

  describe('getPermissionNames', () => {
    it('should return permission names', () => {
      const role = Role.create('Editor', 'Can edit content');
      role.addPermission(permission1);
      role.addPermission(permission2);

      const permissionNames = role.getPermissionNames();

      expect(permissionNames).toContain('user:read');
      expect(permissionNames).toContain('role:read');
      expect(permissionNames.length).toBe(2);
    });

    it('should return empty array for role without permissions', () => {
      const role = Role.create('Editor', 'Can edit content');

      const permissionNames = role.getPermissionNames();

      expect(permissionNames).toEqual([]);
    });
  });

  describe('permissionsCollection', () => {
    it('should return PermissionsCollection', () => {
      const role = Role.create('Editor', 'Can edit content');
      role.addPermission(permission1);

      expect(role.permissionsCollection).toBeInstanceOf(PermissionsCollection);
    });
  });
});
