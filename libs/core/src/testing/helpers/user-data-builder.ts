import { faker } from '@faker-js/faker';
import { UserProps } from '@lib/core/entities/user.entity';

export function UserDataBuilder(props: Partial<UserProps>): UserProps {
  return {
    email: props.email ?? faker.internet.email(),
    isActive: props.isActive ?? faker.datatype.boolean(),
    activationToken: props.activationToken ?? faker.string.uuid(),
    activationTokenExpiresAt: props.activationTokenExpiresAt ?? faker.date.future(),
    passwordResetToken: props.passwordResetToken ?? faker.string.uuid(),
    passwordResetTokenExpiresAt: props.passwordResetTokenExpiresAt ?? faker.date.future(),
    lastLoginAt: props.lastLoginAt ?? faker.date.past(),
    createdAt: props.createdAt ?? faker.date.past(),
    updatedAt: props.updatedAt ?? faker.date.recent(),
    activatedAt: props.activatedAt ?? faker.date.past(),
    deactivatedAt: props.deactivatedAt ?? faker.date.recent(),
    createdBy: props.createdBy ?? faker.internet.username(),
    updatedBy: props.updatedBy ?? faker.internet.username(),
    activatedBy: props.activatedBy ?? faker.internet.username(),
    deactivatedBy: props.deactivatedBy ?? faker.internet.username(),
    password: props.password ?? faker.internet.password({ length: 12 }),
    roleId: props.roleId ?? faker.string.uuid(),
  };
}
