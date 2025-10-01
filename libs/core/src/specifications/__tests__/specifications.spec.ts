import { Permission } from '../../entities/permission.entity';
import { Role } from '../../entities/role.entity';
import { User } from '../../entities/user.entity';
import { Email } from '../../value-objects/email.vo';
import { FirstName, LastName } from '../../value-objects/name.vo';
import { ActionType, ResourceAction, ResourceType } from '../../value-objects/resource-action.vo';
import {
  AdminRoleSpecification,
  BasicUserRoleSpecification,
  CanAssignPermissionToRoleSpecification,
  CanDeleteRoleSpecification,
  DefaultRoleSpecification,
  HasMinimumPermissionsSpecification,
  RoleHasPermissionByNameSpecification,
  RoleHasPermissionSpecification,
} from '../role.specifications';
import { Specification } from '../specification.base';
import {
  ActiveUserSpecification,
  AdminUserSpecification,
  CanAssignRoleSpecification,
  CompleteUserAccountSpecification,
  EligibleForAdminRoleSpecification,
  TwoFactorEnabledSpecification,
  UserHasPermissionSpecification,
} from '../user.specification';

// Helpers
function makePermission(resource: ResourceType | string, action: ActionType | string) {
  return Permission.create(new ResourceAction(resource, action), `${resource}:${action}`);
}
function makeRole(name: string, perms: Permission[] = [], isDefault = false) {
  const r = Role.create(name, `${name} role`, isDefault);
  r.addPermissionsOnCreation(perms);
  return r;
}
function makeUser(active = true) {
  const user = User.create(
    new Email('user@example.com'),
    'hash',
    new FirstName('John'),
    new LastName('Doe'),
  );
  if (!active) {
    user.deactivate();
  }
  return user;
}

// Helper to bypass assignment rules (for specification evaluation scenarios)
function makeUserWithRoles(roles: Role[], active = true) {
  const base = makeUser(active);
  return User.fromData({
    id: base.id.getValue(),
    email: base.email.getValue(),
    passwordHash: base.passwordHash,
    firstName: base.firstName.getValue(),
    lastName: base.lastName.getValue(),
    isActive: active,
    otpEnabled: false,
    roles,
    createdAt: base.createdAt,
    updatedAt: new Date(),
  });
}

describe('Specification base', () => {
  class AlwaysTrue<T> extends Specification<T> {
    isSatisfiedBy(): boolean {
      return true;
    }
  }
  class AlwaysFalse<T> extends Specification<T> {
    isSatisfiedBy(): boolean {
      return false;
    }
  }

  it('and combines', () => {
    expect(new AlwaysTrue().and(new AlwaysTrue()).isSatisfiedBy({})).toBe(true);
    expect(new AlwaysTrue().and(new AlwaysFalse()).isSatisfiedBy({})).toBe(false);
  });
  it('or combines', () => {
    expect(new AlwaysTrue().or(new AlwaysFalse()).isSatisfiedBy({})).toBe(true);
    expect(new AlwaysFalse().or(new AlwaysFalse()).isSatisfiedBy({})).toBe(false);
  });
  it('not inverts', () => {
    expect(new AlwaysTrue().not().isSatisfiedBy({})).toBe(false);
  });
});

describe('Role specs', () => {
  it('default role spec', () => {
    const r = makeRole('member', [], true);
    expect(new DefaultRoleSpecification().isSatisfiedBy(r)).toBe(true);
  });

  it('admin role spec via permission', () => {
    const p = makePermission(ResourceType.USER, ActionType.CREATE);
    const r = makeRole('custom', [p]);
    expect(new AdminRoleSpecification().isSatisfiedBy(r)).toBe(true);
  });

  it('role has permission by id & name', () => {
    const p = makePermission(ResourceType.USER, ActionType.READ);
    const r = makeRole('reader', [p]);
    expect(new RoleHasPermissionSpecification(p.id).isSatisfiedBy(r)).toBe(true);
    expect(new RoleHasPermissionByNameSpecification(p.getPermissionName()).isSatisfiedBy(r)).toBe(
      true,
    );
  });

  it('can delete role respects default flag', () => {
    const r1 = makeRole('member', [], true);
    const r2 = makeRole('member2');
    expect(new CanDeleteRoleSpecification().isSatisfiedBy(r1)).toBe(false);
    expect(new CanDeleteRoleSpecification().isSatisfiedBy(r2)).toBe(true);
  });

  it('assign permission spec (admin critical permission rules)', () => {
    const adminPerm = makePermission(ResourceType.USER, ActionType.DELETE);
    const userRole = makeRole('user');
    const spec = new CanAssignPermissionToRoleSpecification(adminPerm);
    // critical permission on non-admin role should fail
    expect(spec.isSatisfiedBy(userRole)).toBe(false);

    // make a role appear admin by name containing 'Admin'
    const basePerm = makePermission(ResourceType.USER, ActionType.READ);
    const adminRole = makeRole('SuperAdmin', [basePerm]);
    expect(spec.isSatisfiedBy(adminRole)).toBe(true);

    // after adding the admin permission, second assignment should fail
    adminRole.addPermission(adminPerm);
    expect(new CanAssignPermissionToRoleSpecification(adminPerm).isSatisfiedBy(adminRole)).toBe(
      false,
    );
  });

  it('minimum & basic user role specs', () => {
    const p = makePermission(ResourceType.USER, ActionType.READ);
    const r = makeRole('reader', [p]);
    expect(new HasMinimumPermissionsSpecification(1).isSatisfiedBy(r)).toBe(true);
    expect(new BasicUserRoleSpecification().isSatisfiedBy(r)).toBe(true);
  });
});

describe('User specs', () => {
  it('active & two-factor', () => {
    const user = makeUser(true);
    expect(new ActiveUserSpecification().isSatisfiedBy(user)).toBe(true);
    expect(new TwoFactorEnabledSpecification().isSatisfiedBy(user)).toBe(false);
  });

  it('admin & eligible for admin role (pre-existing admin role)', () => {
    const adminPerm = makePermission(ResourceType.USER, ActionType.CREATE);
    const adminRole = makeRole('Admin', [adminPerm]);
    const user = makeUserWithRoles([adminRole], true);
    expect(new AdminUserSpecification().isSatisfiedBy(user)).toBe(true);
    expect(new EligibleForAdminRoleSpecification().isSatisfiedBy(user)).toBe(true);
  });

  it('user has permission', () => {
    const p = makePermission(ResourceType.ROLE, ActionType.READ);
    const r = makeRole('reader', [p]);
    const user = makeUserWithRoles([r], true);
    expect(new UserHasPermissionSpecification(p.getPermissionName()).isSatisfiedBy(user)).toBe(
      true,
    );
  });

  it('can assign role (eligible existing admin privileges, not duplicate)', () => {
    const p = makePermission(ResourceType.USER, ActionType.UPDATE);
    const adminRole = makeRole('Admin', [p]);
    const user = makeUserWithRoles([adminRole], true);
    const newAdminRole = makeRole('AnotherAdmin', [p]);
    expect(new CanAssignRoleSpecification(newAdminRole).isSatisfiedBy(user)).toBe(true);

    const duplicateRole = Role.fromData({
      id: adminRole.id.getValue(),
      name: 'AdminCopy',
      description: 'dup',
      permissions: adminRole.permissions,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(new CanAssignRoleSpecification(duplicateRole).isSatisfiedBy(user)).toBe(false);
  });

  it('complete user account', () => {
    const user = makeUserWithRoles([makeRole('user')], true);
    expect(new CompleteUserAccountSpecification().isSatisfiedBy(user)).toBe(true);
  });
});
