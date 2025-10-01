import { Permission } from '@lib/core/entities/permission.entity';
import { Role } from '@lib/core/entities/role.entity';
import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { RolesCollection } from '../../collections/roles.collection';
import { ActionType, ResourceAction, ResourceType } from '../../resource-action.vo';
import { RoleId } from '../../role-id.vo';

// Helpers
function makePermission(resource: ResourceType | string, action: ActionType | string) {
  return Permission.create(
    new ResourceAction(resource, action),
    `${resource}:${action} permission`,
  );
}

function makeRole(name: string, isDefault = false, perms: Permission[] = []) {
  const role = Role.create(name, `${name} description`, isDefault);
  role.addPermissionsOnCreation(perms);
  return role;
}

describe('RolesCollection unit tests', () => {
  describe('create & validation', () => {
    it('should create empty collection by default', () => {
      const c = RolesCollection.create();
      expect(c.size).toBe(0);
      expect(c.isEmpty).toBe(true);
    });

    it('should create with roles and validate duplicates & single default', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c = RolesCollection.create([r1, r2]);
      expect(c.size).toBe(2);

      // duplicate ID
      const duplicateId = Role.fromData({
        id: r1.id.getValue(),
        name: 'another',
        description: 'dup',
        permissions: [],
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(() => RolesCollection.create([r1, duplicateId])).toThrow(InvalidValueObjectException);

      // duplicate name case-insensitive
      const duplicateName = Role.fromData({
        id: RoleId.create().getValue(),
        name: 'USER',
        description: 'dup',
        permissions: [],
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(() => RolesCollection.create([r1, duplicateName])).toThrow(
        InvalidValueObjectException,
      );

      // more than one default
      const default1 = makeRole('defaultA', true);
      const default2 = makeRole('defaultB', true);
      expect(() => RolesCollection.create([default1, default2])).toThrow(
        InvalidValueObjectException,
      );
    });
  });

  describe('add', () => {
    it('should add role immutably', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c1 = RolesCollection.create([r1]);
      const c2 = c1.add(r2);
      expect(c2).not.toBe(c1);
      expect(c1.size).toBe(1);
      expect(c2.size).toBe(2);
    });

    it('should throw when adding duplicate id', () => {
      const r1 = makeRole('user');
      const c = RolesCollection.create([r1]);
      expect(() => c.add(r1)).toThrow(InvalidValueObjectException);
    });
  });

  describe('remove', () => {
    it('should remove role by id immutably', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c1 = RolesCollection.create([r1, r2]);
      const c2 = c1.remove(r1.id);
      expect(c2.size).toBe(1);
      expect(c2.contains(r2.id)).toBe(true);
      expect(c2.contains(r1.id)).toBe(false);
      const c3 = c2.remove(r1.id); // removing non-existing returns same
      expect(c3).toBe(c2);
    });
  });

  describe('lookups', () => {
    it('should lookup by id and name', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c = RolesCollection.create([r1, r2]);
      expect(c.getById(r1.id)).toBe(r1);
      expect(c.getByName('USER')).toBe(r1); // case insensitive
      expect(c.containsByName('manager')).toBe(true);
    });
  });

  describe('default & admin subsets', () => {
    it('should get default role', () => {
      const r1 = makeRole('user', true);
      const r2 = makeRole('staff');
      const c = RolesCollection.create([r1, r2]);
      expect(c.getDefaultRole()).toBe(r1);
    });

    it('should separate admin and non-admin roles', () => {
      const perm = makePermission(ResourceType.USER, ActionType.DELETE); // critical -> admin
      const adminRole = makeRole('User Admin', false, [perm]);
      const userRole = makeRole('user');
      const c = RolesCollection.create([adminRole, userRole]);
      expect(c.getAdminRoles().size).toBe(1);
      expect(c.getNonAdminRoles().size).toBe(1);
    });

    it('should get deletable roles excluding default', () => {
      const r1 = makeRole('user', true);
      const r2 = makeRole('manager');
      const c = RolesCollection.create([r1, r2]);
      expect(c.getDeletableRoles().size).toBe(1);
    });
  });

  describe('permissions aggregation & checks', () => {
    it('should aggregate permissions across roles', () => {
      const p1 = makePermission(ResourceType.USER, ActionType.READ);
      const p2 = makePermission(ResourceType.ROLE, ActionType.CREATE);
      const r1 = makeRole('role1', false, [p1]);
      const r2 = makeRole('role2', false, [p2]);
      const c = RolesCollection.create([r1, r2]);
      const all = c.getAllPermissions();
      expect(all.size).toBe(2);
      expect(all.containsByName(p1.getPermissionName())).toBe(true);
    });

    it('should check admin privileges', () => {
      const perm = makePermission(ResourceType.USER, ActionType.CREATE);
      const adminRole = makeRole('custom', false, [perm]);
      const c = RolesCollection.create([adminRole]);
      expect(c.hasAdminPrivileges()).toBe(true);
    });

    it('should allow access if any role has permission', () => {
      const perm = makePermission(ResourceType.USER, ActionType.UPDATE);
      const r = makeRole('user-manager', false, [perm]);
      const c = RolesCollection.create([r]);
      expect(c.allowsAccess('user', 'update')).toBe(true);
      expect(c.allowsAccess('user', 'delete')).toBe(false);
    });

    it('should check role has permission by name', () => {
      const perm = makePermission(ResourceType.USER, ActionType.READ);
      const r = makeRole('user-role', false, [perm]);
      const c = RolesCollection.create([r]);
      expect(c.hasPermission(perm.getPermissionName())).toBe(true);
      expect(c.hasPermission('user:delete')).toBe(false);
    });

    it('should compute highest privilege level', () => {
      const pAdmin = makePermission(ResourceType.USER, ActionType.DELETE);
      const adminRole = makeRole('Admin', false, [pAdmin]);
      const userRole = makeRole('User');
      const c1 = RolesCollection.create([]);
      const c2 = RolesCollection.create([userRole]);
      const c3 = RolesCollection.create([adminRole]);

      expect(c1.getHighestPrivilegeLevel()).toBe('guest');
      expect(c2.getHighestPrivilegeLevel()).toBe('user');
      expect(c3.getHighestPrivilegeLevel()).toBe('admin');
    });
  });

  describe('sorting & iteration', () => {
    it('should sort by privilege (admin first, default last among equals, then name)', () => {
      const adminPerm = makePermission(ResourceType.USER, ActionType.CREATE);
      const adminRole = makeRole('Admin', false, [adminPerm]);
      const defaultRole = makeRole('Member', true);
      const normalRole = makeRole('Analyst');
      const c = RolesCollection.create([normalRole, defaultRole, adminRole]);
      const sorted = c.sortByPrivilege();
      expect(sorted.toArray()[0]).toBe(adminRole);
      expect(sorted.toArray()[2]).toBe(defaultRole);
    });

    it('should be iterable', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c = RolesCollection.create([r1, r2]);
      expect([...c]).toEqual([r1, r2]);
    });
  });

  describe('merge, intersect, equals', () => {
    it('should merge distinct roles', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const r3 = makeRole('auditor');
      const c1 = RolesCollection.create([r1, r2]);
      const c2 = RolesCollection.create([r2, r3]);
      const merged = c1.merge(c2);
      expect(merged.size).toBe(3);
      expect(merged.contains(r3.id)).toBe(true);
    });

    it('should intersect roles', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const r3 = makeRole('auditor');
      const c1 = RolesCollection.create([r1, r2]);
      const c2 = RolesCollection.create([r2, r3]);
      const inter = c1.intersect(c2);
      expect(inter.size).toBe(1);
      expect(inter.contains(r2.id)).toBe(true);
    });

    it('should test equality irrespective of order', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c1 = RolesCollection.create([r1, r2]);
      const c2 = RolesCollection.create([r2, r1]);
      expect(c1.equals(c2)).toBe(true);
    });

    it('should return false for different sizes', () => {
      const r1 = makeRole('user');
      const c1 = RolesCollection.create([r1]);
      const c2 = RolesCollection.create([]);
      expect(c1.equals(c2)).toBe(false);
    });
  });

  describe('functional helpers', () => {
    it('should filter roles', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c = RolesCollection.create([r1, r2]);
      const filtered = c.filter((r) => r.name.startsWith('m'));
      expect(filtered.size).toBe(1);
      expect(filtered.contains(r2.id)).toBe(true);
    });

    it('should find a role', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c = RolesCollection.create([r1, r2]);
      expect(c.find((r) => r.name === 'manager')).toBe(r2);
    });

    it('should some/every helpers work', () => {
      const r1 = makeRole('user');
      const r2 = makeRole('manager');
      const c = RolesCollection.create([r1, r2]);
      expect(c.some((r) => r.name === 'manager')).toBe(true);
      expect(c.every((r) => r.name.length > 0)).toBe(true);
    });
  });
});
