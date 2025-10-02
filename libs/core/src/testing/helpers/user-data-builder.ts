import { faker } from '@faker-js/faker';
import { UserProps } from '@lib/core/entities/user.entity';

export function UserDataBuilder(props: Partial<UserProps>): UserProps {
  const now = new Date();
  const past = new Date(now.getTime() - 1000 * 60 * 60 * 24); // 1 day ago
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24); // 1 day from now

  const defaults = {
    id: faker.number.int({ min: 1, max: 1000 }),
    email: faker.internet.email(),
    isActive: faker.datatype.boolean(),
    activationToken: faker.string.uuid(),
    activationTokenExpiresAt: future,
    passwordResetToken: faker.string.uuid(),
    passwordResetTokenExpiresAt: future,
    lastLoginAt: past,
    createdAt: now,
    updatedAt: now,
    activatedAt: past,
    deactivatedAt: null,
    createdBy: 'system',
    updatedBy: 'system',
    activatedBy: faker.internet.username(),
    deactivatedBy: null,
    password: 'Password123!',
    roleId: null,
  };

  return { ...defaults, ...props };
}
