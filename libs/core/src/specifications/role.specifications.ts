import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { PermissionId } from '../value-objects/permission-id.vo';
import { Specification } from './specification.base';

export class DefaultRoleSpecification extends Specification<Role> {
  isSatisfiedBy(role: Role): boolean {
    return role.isDefault;
  }
}

export class AdminRoleSpecification extends Specification<Role> {
  isSatisfiedBy(role: Role): boolean {
    return role.isAdminRole();
  }
}

export class RoleHasPermissionSpecification extends Specification<Role> {
  constructor(private readonly permissionId: PermissionId) {
    super();
  }

  isSatisfiedBy(role: Role): boolean {
    return role.hasPermission(this.permissionId);
  }
}

export class RoleHasPermissionByNameSpecification extends Specification<Role> {
  constructor(private readonly permissionName: string) {
    super();
  }

  isSatisfiedBy(role: Role): boolean {
    return role.hasPermissionByName(this.permissionName);
  }
}

export class CanDeleteRoleSpecification extends Specification<Role> {
  isSatisfiedBy(role: Role): boolean {
    return role.canBeDeleted();
  }
}

export class CanAssignPermissionToRoleSpecification extends Specification<Role> {
  constructor(private readonly permission: Permission) {
    super();
  }
  isSatisfiedBy(role: Role): boolean {
    if (role.hasPermission(this.permission.id)) {
      return false; // already has the permission
    }

    if (this.isSystemAdminPermission(this.permission) && !role.isAdminRole()) {
      return false;
    }

    return true;
  }

  private isSystemAdminPermission(permission: Permission) {
    const adminResources = ['user', 'role', 'permission', 'system'];
    const criticalActions = ['delete', 'create', 'update'];

    return (
      adminResources.includes(permission.getResource().toLowerCase()) &&
      criticalActions.includes(permission.getAction().toLowerCase())
    );
  }
}

export class HasMinimumPermissionsSpecification extends Specification<Role> {
  constructor(private readonly minPermissions: number = 1) {
    super();
  }

  isSatisfiedBy(role: Role): boolean {
    return role.permissions.length >= this.minPermissions;
  }
}

export class BasicUserRoleSpecification extends Specification<Role> {
  isSatisfiedBy(role: Role): boolean {
    return (
      !role.isAdminRole() &&
      !role.isDefault &&
      role.permissions.length > 0 &&
      role.permissions.length <= 10
    );
  }
}
