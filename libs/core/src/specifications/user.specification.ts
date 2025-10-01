import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Specification } from './specification.base';

export class ActiveUserSpecification extends Specification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return candidate.isActive;
  }
}

export class TwoFactorEnabledSpecification extends Specification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return candidate.otpEnabled;
  }
}

export class AdminUserSpecification extends Specification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return candidate.roles.some((role) => role.isAdminRole());
  }
}

export class EligibleForAdminRoleSpecification extends Specification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return candidate.isEligibleForAdminRole();
  }
}

export class UserHasPermissionSpecification extends Specification<User> {
  constructor(private readonly permissionName: string) {
    super();
  }

  isSatisfiedBy(candidate: User): boolean {
    return candidate.hasPermission(this.permissionName);
  }
}

export class CanAssignRoleSpecification extends Specification<User> {
  constructor(private readonly role: Role) {
    super();
  }

  isSatisfiedBy(candidate: User): boolean {
    if (!candidate.isActive) {
      return false;
    }

    if (candidate.hasRole(this.role.id)) {
      return false;
    }

    if (this.role.isAdminRole() && !candidate.isEligibleForAdminRole()) {
      return false;
    }

    return true;
  }
}

export class CompleteUserAccountSpecification extends Specification<User> {
  isSatisfiedBy(candidate: User): boolean {
    return (
      candidate.isActive &&
      candidate.email.getValue().length > 0 &&
      candidate.firstName.getValue().length > 0 &&
      candidate.lastName.getValue().length > 0 &&
      candidate.roles.length > 0
    );
  }
}

// Composite specifications
