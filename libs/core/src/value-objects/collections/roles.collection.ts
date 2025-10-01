import { Role } from '@lib/core/entities/role.entity';
import { InvalidValueObjectException } from '@lib/core/exceptions/domain-exceptions';
import { RoleId } from '../role-id.vo';
import { PermissionsCollection } from './permissions.collection';

export class RolesCollection {
  private readonly _roles: readonly Role[];

  private constructor(roles: Role[]) {
    this.validateRoles(roles);
    this._roles = Object.freeze([...roles]);
  }

  static create(roles: Role[] = []) {
    return new RolesCollection(roles);
  }

  add(role: Role) {
    if (this.contains(role.id)) {
      throw new InvalidValueObjectException(
        `Role with ID ${role.id.getValue()} already exists in the collection`,
      );
    }

    return new RolesCollection([...this._roles, role]);
  }

  remove(roleId: RoleId) {
    const filteredRoles = this._roles.filter((r) => !r.id.equals(roleId));

    if (filteredRoles.length === this._roles.length) {
      return this;
    }
    return new RolesCollection(filteredRoles);
  }

  contains(roleId: RoleId) {
    return this._roles.some((r) => r.id.equals(roleId));
  }

  containsByName(roleName: string) {
    return this._roles.some((r) => r.name.toLowerCase() === roleName.toLowerCase());
  }

  getById(roleId: RoleId): Role | undefined {
    return this._roles.find((r) => r.id.equals(roleId));
  }

  getByName(roleName: string): Role | undefined {
    return this._roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
  }

  getDefaultRole(): Role | undefined {
    return this._roles.find((r) => r.isDefault);
  }

  getAdminRoles() {
    const adminRoles = this._roles.filter((r) => r.isAdminRole());
    return new RolesCollection(adminRoles);
  }

  getNonAdminRoles() {
    const nonAdminRoles = this._roles.filter((r) => !r.isAdminRole());
    return new RolesCollection(nonAdminRoles);
  }

  getDeletableRoles() {
    const deletableRoles = this._roles.filter((r) => r.canBeDeleted());
    return new RolesCollection(deletableRoles);
  }

  getRoleNames() {
    return this._roles.map((r) => r.name);
  }

  getAllPermissions() {
    const allPermissions = this._roles.flatMap((r) => r.permissions);
    return PermissionsCollection.create(allPermissions);
  }

  hasAdminPrivileges() {
    return this._roles.some((r) => r.isAdminRole());
  }

  allowsAccess(resource: string, action: string) {
    return this._roles.some((r) => r.permissionsCollection.allowsAccess(resource, action));
  }

  hasPermission(permissionName: string) {
    return this._roles.some((r) => r.hasPermissionByName(permissionName));
  }

  getHighestPrivilegeLevel() {
    if (this.hasPermission('system:admin')) {
      return 'superadmin';
    }

    if (this.hasAdminPrivileges()) {
      return 'admin';
    }

    if (this.size > 0) {
      return 'user';
    }

    return 'guest';
  }

  sortByPrivilege() {
    const sorted = [...this._roles].sort((a, b) => {
      if (a.isAdminRole() && !b.isAdminRole()) {
        return -1;
      }
      if (!a.isAdminRole() && b.isAdminRole()) {
        return 1;
      }
      if (a.isDefault && !b.isDefault) {
        return 1;
      }
      if (!a.isDefault && b.isDefault) {
        return -1;
      }
      return a.name.localeCompare(b.name);
    });

    return new RolesCollection(sorted);
  }

  get size() {
    return this._roles.length;
  }

  get isEmpty() {
    return this._roles.length === 0;
  }

  get roles() {
    return this._roles;
  }

  toArray() {
    return [...this._roles];
  }

  *[Symbol.iterator](): Iterator<Role> {
    for (const role of this._roles) {
      yield role;
    }
  }

  merge(other: RolesCollection) {
    const combinedRoles = [...this._roles];

    for (const role of other.roles) {
      if (!this.contains(role.id)) {
        combinedRoles.push(role);
      }
    }

    return new RolesCollection(combinedRoles);
  }

  intersect(other: RolesCollection) {
    const commonRoles = this._roles.filter((role) => other.contains(role.id));
    return new RolesCollection(commonRoles);
  }

  equals(other: RolesCollection) {
    if (this.size !== other.size) {
      return false;
    }

    return this._roles.every((r) => other.contains(r.id));
  }

  filter(predicate: (role: Role) => boolean) {
    const filteredRoles = this._roles.filter(predicate);
    return new RolesCollection(filteredRoles);
  }

  find(predicate: (role: Role) => boolean): Role | undefined {
    return this._roles.find(predicate);
  }

  some(predicate: (role: Role) => boolean): boolean {
    return this._roles.some(predicate);
  }

  every(predicate: (role: Role) => boolean): boolean {
    return this._roles.every(predicate);
  }

  private validateRoles(roles: Role[]) {
    const roleIds = new Set<string>();
    const roleNames = new Set<string>();
    let defaultRoleCount = 0;

    for (const role of roles) {
      const id = role.id.getValue();
      const name = role.name.toLowerCase();

      if (roleIds.has(id)) {
        throw new InvalidValueObjectException(`Duplicate role ID found: ${id}`);
      }

      if (roleNames.has(name)) {
        throw new InvalidValueObjectException(`Duplicate role name found: ${name}`);
      }

      if (role.isDefault) {
        defaultRoleCount++;
      }

      roleIds.add(id);
      roleNames.add(name);
    }

    if (defaultRoleCount > 1) {
      throw new InvalidValueObjectException('Only one default role is allowed in the collection');
    }
  }
}
