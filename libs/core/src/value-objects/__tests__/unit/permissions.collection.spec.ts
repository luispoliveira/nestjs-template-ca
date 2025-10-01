import { Permission } from '@lib/core/entities/permission.entity';
import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { PermissionsCollection } from '../../collections/permissions.collection';
import { PermissionId } from '../../permission-id.vo';
import { ActionType, ResourceAction, ResourceType } from '../../resource-action.vo';

// Helper factory
function makePermission(
  resource: ResourceType | string,
  action: ActionType | string,
  desc = 'desc',
) {
  return Permission.create(new ResourceAction(resource, action), desc);
}

describe('PermissionsCollection unit tests', () => {
  describe('create & basics', () => {
    it('should create empty collection by default', () => {
      const collection = PermissionsCollection.create();
      expect(collection.size).toBe(0);
      expect(collection.isEmpty).toBe(true);
      expect(collection.toArray()).toEqual([]);
    });

    it('should create collection with initial permissions and prevent duplicates', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.ROLE, ActionType.CREATE);

      const collection = PermissionsCollection.create([p1, p2]);
      expect(collection.size).toBe(2);

      // duplicate by id
      expect(() => PermissionsCollection.create([p1, p1])).toThrow(InvalidValueObjectException);
      // duplicate by name (resource+action) but different id -> craft manual duplicate
      const duplicateName = Permission.fromData({
        id: PermissionId.create().getValue(),
        resourceAction: p1.resourceAction,
        description: 'other',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(() => PermissionsCollection.create([p1, duplicateName])).toThrow(
        InvalidValueObjectException,
      );
    });
  });

  describe('add', () => {
    it('should add permission returning new collection', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.USER, ActionType.CREATE);
      const collection = PermissionsCollection.create([p1]);
      const updated = collection.add(p2);

      expect(updated).not.toBe(collection);
      expect(updated.size).toBe(2);
      expect(collection.size).toBe(1); // immutability
    });

    it('should throw when adding duplicate (same id or name)', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const collection = PermissionsCollection.create([p1]);

      expect(() => collection.add(p1)).toThrow(InvalidValueObjectException);

      const duplicateByNameDifferentId = Permission.fromData({
        id: PermissionId.create().getValue(),
        resourceAction: p1.resourceAction,
        description: 'dup',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(() => collection.add(duplicateByNameDifferentId)).toThrow(InvalidValueObjectException);
    });
  });

  describe('remove', () => {
    it('should remove by id returning new collection', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.USER, ActionType.CREATE);
      const c1 = PermissionsCollection.create([p1, p2]);
      const c2 = c1.remove(p1.id);
      expect(c2.size).toBe(1);
      expect(c2.contains(p2.id)).toBe(true);
      expect(c2.contains(p1.id)).toBe(false);
      // removing non-existing returns same instance
      const c3 = c2.remove(p1.id);
      expect(c3).toBe(c2);
    });
  });

  describe('contains / retrieval', () => {
    it('should support lookups by id and name', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.USER, ActionType.CREATE);
      const c = PermissionsCollection.create([p1, p2]);

      expect(c.contains(p1.id)).toBe(true);
      expect(c.containsByName(p2.getPermissionName())).toBe(true);
      expect(c.getById(p1.id)).toBe(p1);
      expect(c.getByName(p2.getPermissionName())).toBe(p2);
    });
  });

  describe('filtering', () => {
    it('should filter by resource and action', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.USER, ActionType.CREATE);
      const p3 = makePermission(ResourceType.ROLE, ActionType.DELETE);
      const c = PermissionsCollection.create([p1, p2, p3]);

      const userPerms = c.filterByResource('user');
      expect(userPerms.size).toBe(2);
      const createPerms = c.filterByAction('create');
      expect(createPerms.size).toBe(1);
      expect(createPerms.getPermissionNames()).toContain(p2.getPermissionName());
    });
  });

  describe('metadata getters', () => {
    it('should return unique resources, actions and names', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.USER, ActionType.CREATE);
      const p3 = makePermission(ResourceType.ROLE, ActionType.CREATE);
      const c = PermissionsCollection.create([p1, p2, p3]);

      expect(c.getResources().sort()).toEqual(['role', 'user']);
      // getActions should return unique action names
      expect(c.getActions().sort()).toEqual(['create', 'read']);
      expect(c.getPermissionNames()).toEqual([
        p1.getPermissionName(),
        p2.getPermissionName(),
        p3.getPermissionName(),
      ]);
    });
  });

  describe('admin permissions & access', () => {
    it('should detect admin permissions for critical action on admin resource (user)', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.DELETE);
      const p2 = makePermission(ResourceType.ROLE, ActionType.READ);
      const c = PermissionsCollection.create([p1, p2]);
      expect(c.hasAdminPermissions()).toBe(true);
    });

    it('should allow access if any permission matches resource/action', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.UPDATE);
      const c = PermissionsCollection.create([p1]);
      expect(c.allowsAccess('user', 'update')).toBe(true);
      expect(c.allowsAccess('user', 'delete')).toBe(false);
    });
  });

  describe('iteration', () => {
    it('should be iterable', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.ROLE, ActionType.CREATE);
      const c = PermissionsCollection.create([p1, p2]);
      const items = [...c];
      expect(items).toEqual([p1, p2]);
    });
  });

  describe('merge & intersect & equals', () => {
    it('should merge distinct permissions', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.ROLE, ActionType.CREATE);
      const p3 = makePermission(ResourceType.USER, ActionType.CREATE);
      const c1 = PermissionsCollection.create([p1, p2]);
      const c2 = PermissionsCollection.create([p2, p3]);

      const merged = c1.merge(c2);
      expect(merged.size).toBe(3);
      expect(merged.contains(p3.id)).toBe(true);
    });

    it('should intersect', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.USER, ActionType.CREATE);
      const p3 = makePermission(ResourceType.ROLE, ActionType.DELETE);
      const c1 = PermissionsCollection.create([p1, p2]);
      const c2 = PermissionsCollection.create([p2, p3]);
      const intersection = c1.intersect(c2);
      expect(intersection.size).toBe(1);
      expect(intersection.contains(p2.id)).toBe(true);
    });

    it('should check equality irrespective of order', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.USER, ActionType.CREATE);
      const c1 = PermissionsCollection.create([p1, p2]);
      const c2 = PermissionsCollection.create([p2, p1]);
      expect(c1.equals(c2)).toBe(true);
    });

    it('should return false for differing sizes', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const c1 = PermissionsCollection.create([p1]);
      const c2 = PermissionsCollection.create([]);
      expect(c1.equals(c2)).toBe(false);
    });
  });
});
