import { Email } from '@lib/core/value-objects/email.vo';
import { FirstName, LastName } from '@lib/core/value-objects/name.vo';
import { ResourceAction } from '@lib/core/value-objects/resource-action.vo';
import { Permission } from '../../permission.entity';
import { Role } from '../../role.entity';
import { User } from '../../user.entity';

describe('User-Role-Permission Integration Tests', () => {
  let readPermission: Permission;
  let writePermission: Permission;
  let deletePermission: Permission;
  let userRole: Role;
  let adminRole: Role;

  beforeEach(() => {
    // Create permissions - using only read permissions to avoid admin detection
    readPermission = Permission.create(new ResourceAction('user', 'read'), 'Can read users');
    writePermission = Permission.create(new ResourceAction('role', 'read'), 'Can read roles');
    deletePermission = Permission.create(new ResourceAction('user', 'all'), 'All user permissions');

    // Create roles with permissions
    userRole = Role.create('User', 'Basic user role');
    userRole.addPermission(readPermission);

    adminRole = Role.create('Manager', 'Manager role with extended permissions');
    adminRole.addPermission(readPermission);
    adminRole.addPermission(writePermission);
    adminRole.addPermission(deletePermission);
  });

  describe('User with Role and Permission Integration', () => {
    it('should create user with roles and check permissions', () => {
      const email = new Email('admin@example.com');
      const passwordHash = 'hashed-password';
      const firstName = new FirstName('Admin');
      const lastName = new LastName('User');

      const user = User.create(email, passwordHash, firstName, lastName);
      user.addRole(adminRole);

      // User should have all admin permissions through the role
      expect(user.hasPermission('user:read')).toBe(true);
      expect(user.hasPermission('role:read')).toBe(true);
      expect(user.hasPermission('user:all')).toBe(true);

      // User should not have permissions not assigned to the role
      expect(user.hasPermission('user:create')).toBe(false);
    });

    it('should manage multiple roles for a user', () => {
      const email = new Email('user@example.com');
      const passwordHash = 'hashed-password';
      const firstName = new FirstName('Test');
      const lastName = new LastName('User');

      const user = User.create(email, passwordHash, firstName, lastName);

      // Add user role first
      user.addRole(userRole);
      expect(user.hasPermission('user:read')).toBe(true);
      expect(user.hasPermission('role:read')).toBe(false);
      expect(user.hasPermission('user:all')).toBe(false);

      // Add admin role to get more permissions
      user.addRole(adminRole);
      expect(user.hasPermission('user:read')).toBe(true);
      expect(user.hasPermission('role:read')).toBe(true);
      expect(user.hasPermission('user:all')).toBe(true);
      expect(user.roles.length).toBe(2);
    });

    it('should remove roles and lose associated permissions', () => {
      const email = new Email('user@example.com');
      const passwordHash = 'hashed-password';
      const firstName = new FirstName('Test');
      const lastName = new LastName('User');

      const user = User.create(email, passwordHash, firstName, lastName);
      user.addRole(userRole);
      user.addRole(adminRole);

      // Initially has all permissions
      expect(user.hasPermission('user:read')).toBe(true);
      expect(user.hasPermission('role:read')).toBe(true);
      expect(user.hasPermission('user:all')).toBe(true);

      // Remove admin role
      user.removeRole(adminRole.id);

      // Should only have user role permissions now
      expect(user.hasPermission('user:read')).toBe(true);
      expect(user.hasPermission('role:read')).toBe(false);
      expect(user.hasPermission('user:all')).toBe(false);
      expect(user.roles.length).toBe(1);
    });

    it('should handle role permission changes affecting user permissions', () => {
      const email = new Email('user@example.com');
      const passwordHash = 'hashed-password';
      const firstName = new FirstName('Test');
      const lastName = new LastName('User');

      const user = User.create(email, passwordHash, firstName, lastName);
      user.addRole(userRole);

      // Initially only has read permission
      expect(user.hasPermission('user:read')).toBe(true);
      expect(user.hasPermission('role:read')).toBe(false);

      // Add write permission to the user role
      userRole.addPermission(writePermission);

      // User should now have the new permission
      expect(user.hasPermission('user:read')).toBe(true);
      expect(user.hasPermission('role:read')).toBe(true);

      // Remove read permission from role
      userRole.removePermission(readPermission.id);

      // User should lose read permission but keep write permission
      expect(user.hasPermission('user:read')).toBe(false);
      expect(user.hasPermission('role:read')).toBe(true);
    });

    it('should handle inactive user constraints', () => {
      const email = new Email('user@example.com');
      const passwordHash = 'hashed-password';
      const firstName = new FirstName('Test');
      const lastName = new LastName('User');

      const user = User.create(email, passwordHash, firstName, lastName);
      user.addRole(userRole);

      // Deactivate user
      user.deactivate();

      // Inactive user should not be able to get new roles
      expect(() => user.addRole(adminRole)).toThrow();

      // Inactive user should not be able to remove roles
      expect(() => user.removeRole(userRole.id)).toThrow();

      // Inactive user should not be able to change email
      const newEmail = new Email('newemail@example.com');
      expect(() => user.changeEmail(newEmail)).toThrow();

      // Inactive user should not be able to change password
      expect(() => user.changePassword('new-password')).toThrow();

      // Inactive user should not be able to update profile
      const newFirstName = new FirstName('NewName');
      expect(() => user.updateProfile(newFirstName)).toThrow();

      // Activate user - should work again
      user.activate();
      const anotherNewEmail = new Email('anotheremail@example.com');
      expect(() => user.changeEmail(anotherNewEmail)).not.toThrow();
    });

    it('should handle default role constraints', () => {
      const defaultRole = Role.create('DefaultUser', 'Default user role', true);

      // Default role cannot be deleted
      expect(defaultRole.canBeDeleted()).toBe(false);
      expect(() => defaultRole.validateForDeletion()).toThrow();

      // Non-default role can be deleted
      expect(userRole.canBeDeleted()).toBe(true);
      expect(() => userRole.validateForDeletion()).not.toThrow();
    });
  });

  describe('Permission Management Integration', () => {
    it('should handle permission updates affecting role permissions', () => {
      const role = Role.create('Editor', 'Content editor role');
      role.addPermission(readPermission);

      expect(role.hasPermissionByName('user:read')).toBe(true);

      // Update permission description
      readPermission.updateDescription('Updated: Can read all user data');

      // Role should still have the permission with updated description
      expect(role.hasPermissionByName('user:read')).toBe(true);
      expect(role.permissions[0].description).toBe('Updated: Can read all user data');
    });

    it('should validate business rules across entities', () => {
      const email = new Email('test@example.com');
      const passwordHash = 'hashed-password';
      const firstName = new FirstName('Test');
      const lastName = new LastName('User');

      const user = User.create(email, passwordHash, firstName, lastName);
      user.addRole(userRole);

      // Cannot remove the last role from a user
      expect(() => user.removeRole(userRole.id)).toThrow();

      // Add another role first, then removal should work
      user.addRole(adminRole);
      expect(() => user.removeRole(userRole.id)).not.toThrow();
      expect(user.roles.length).toBe(1);
      expect(user.roles[0]).toBe(adminRole);
    });
  });

  describe('Entity State Consistency', () => {
    it('should maintain consistent timestamps across operations', () => {
      const email = new Email('test@example.com');
      const passwordHash = 'hashed-password';
      const firstName = new FirstName('Test');
      const lastName = new LastName('User');

      const user = User.create(email, passwordHash, firstName, lastName);
      const initialCreatedAt = user.createdAt;

      // CreatedAt should never change
      user.addRole(userRole);
      expect(user.createdAt).toBe(initialCreatedAt);

      user.updateProfile(new FirstName('Updated'));
      expect(user.createdAt).toBe(initialCreatedAt);

      user.changePassword('new-password');
      expect(user.createdAt).toBe(initialCreatedAt);
    });

    it('should handle complex entity relationships', () => {
      // Create multiple users with different role combinations
      const user1 = User.create(
        new Email('user1@example.com'),
        'password1',
        new FirstName('User'),
        new LastName('One'),
      );
      const user2 = User.create(
        new Email('user2@example.com'),
        'password2',
        new FirstName('User'),
        new LastName('Two'),
      );

      user1.addRole(userRole);
      user2.addRole(adminRole);

      // Users should have different permission sets
      expect(user1.hasPermission('user:read')).toBe(true);
      expect(user1.hasPermission('user:all')).toBe(false);

      expect(user2.hasPermission('user:read')).toBe(true);
      expect(user2.hasPermission('user:all')).toBe(true);

      // Roles should be shared between users
      expect(user1.roles[0]).toBe(userRole);
      expect(user2.roles[0]).toBe(adminRole);
    });
  });
});
