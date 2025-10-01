import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { PermissionId } from '@lib/core/value-objects/permission-id.vo';
import { PermissionName } from '@lib/core/value-objects/permission-name.vo';
import { ResourceAction } from '@lib/core/value-objects/resource-action.vo';
import { Permission } from '../../permission.entity';

describe('Permission Entity Unit Tests', () => {
  let resourceAction: ResourceAction;
  const description = 'Can read user data';

  beforeEach(() => {
    resourceAction = new ResourceAction('user', 'read');
  });

  describe('create', () => {
    it('should create a new Permission', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.id).toBeInstanceOf(PermissionId);
      expect(permission.name).toBeInstanceOf(PermissionName);
      expect(permission.description).toBe(description);
      expect(permission.resourceAction).toBe(resourceAction);
      expect(permission.createdAt).toBeInstanceOf(Date);
      expect(permission.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error for empty description', () => {
      expect(() => Permission.create(resourceAction, '')).toThrow(InvalidValueObjectException);
      expect(() => Permission.create(resourceAction, '   ')).toThrow(InvalidValueObjectException);
    });

    it('should throw error for description exceeding 255 characters', () => {
      const longDescription = 'a'.repeat(256);
      expect(() => Permission.create(resourceAction, longDescription)).toThrow(
        InvalidValueObjectException,
      );
    });
  });

  describe('fromData', () => {
    it('should create Permission from data object', () => {
      const createdAt = new Date('2023-01-01');
      const updatedAt = new Date('2023-01-02');
      const data = {
        id: 'test-permission-id',
        resourceAction,
        description,
        createdAt,
        updatedAt,
      };

      const permission = Permission.fromData(data);

      expect(permission.id.getValue()).toBe(data.id);
      expect(permission.resourceAction).toBe(data.resourceAction);
      expect(permission.description).toBe(data.description);
      expect(permission.createdAt).toBe(data.createdAt);
      expect(permission.updatedAt).toBe(data.updatedAt);
    });
  });

  describe('updateDescription', () => {
    it('should update description successfully', async () => {
      const permission = Permission.create(resourceAction, description);
      const originalUpdatedAt = permission.updatedAt;
      const newDescription = 'Can write user data';

      // Add a small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 1));
      permission.updateDescription(newDescription);

      expect(permission.description).toBe(newDescription);
      expect(permission.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should not update if description is the same', () => {
      const permission = Permission.create(resourceAction, description);
      const originalUpdatedAt = permission.updatedAt;

      permission.updateDescription(description);

      expect(permission.description).toBe(description);
      expect(permission.updatedAt).toBe(originalUpdatedAt);
    });

    it('should throw error for empty description', () => {
      const permission = Permission.create(resourceAction, description);

      expect(() => permission.updateDescription('')).toThrow(InvalidValueObjectException);
      expect(() => permission.updateDescription('   ')).toThrow(InvalidValueObjectException);
    });

    it('should throw error for description exceeding 255 characters', () => {
      const permission = Permission.create(resourceAction, description);
      const longDescription = 'a'.repeat(256);

      expect(() => permission.updateDescription(longDescription)).toThrow(
        InvalidValueObjectException,
      );
    });
  });

  describe('getResource', () => {
    it('should return the resource from resourceAction', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.getResource()).toBe('user');
    });
  });

  describe('getAction', () => {
    it('should return the action from resourceAction', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.getAction()).toBe('read');
    });
  });

  describe('getPermissionName', () => {
    it('should return the permission name as string', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.getPermissionName()).toBe('user:read');
    });
  });

  describe('getStringName', () => {
    it('should return the permission name as string', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.getStringName()).toBe('user:read');
    });
  });

  describe('allowsAction', () => {
    it('should return true for matching resource and action', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.allowsAction('user', 'read')).toBe(true);
    });

    it('should return false for non-matching resource', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.allowsAction('admin', 'read')).toBe(false);
    });

    it('should return false for non-matching action', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.allowsAction('user', 'write')).toBe(false);
    });

    it('should return false for both non-matching resource and action', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.allowsAction('admin', 'write')).toBe(false);
    });
  });

  describe('getter properties', () => {
    it('should return correct id', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.id).toBeInstanceOf(PermissionId);
    });

    it('should return correct name', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.name).toBeInstanceOf(PermissionName);
      expect(permission.name.getValue()).toBe('user:read');
    });

    it('should return correct description', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.description).toBe(description);
    });

    it('should return correct resourceAction', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.resourceAction).toBe(resourceAction);
    });

    it('should return correct createdAt', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.createdAt).toBeInstanceOf(Date);
    });

    it('should return correct updatedAt', () => {
      const permission = Permission.create(resourceAction, description);

      expect(permission.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('edge cases', () => {
    it('should handle permission with different resource actions', () => {
      const createAction = new ResourceAction('user', 'create');
      const deleteAction = new ResourceAction('user', 'delete');

      const createPermission = Permission.create(createAction, 'Can create user data');
      const deletePermission = Permission.create(deleteAction, 'Can delete user data');

      expect(createPermission.getResource()).toBe('user');
      expect(createPermission.getAction()).toBe('create');
      expect(deletePermission.getResource()).toBe('user');
      expect(deletePermission.getAction()).toBe('delete');
    });

    it('should handle maximum length description', () => {
      const maxDescription = 'a'.repeat(255);
      const permission = Permission.create(resourceAction, maxDescription);

      expect(permission.description).toBe(maxDescription);
    });
  });
});
