import { UserOutputDTO } from '@lib/application';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UserPresenter {
  @ApiProperty({ example: 1, description: 'User ID' })
  id: number;
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;
  @ApiProperty({ example: true, description: 'Is user active?' })
  isActive: boolean;
  @ApiProperty({ example: '2022-01-01T00:00:00Z', description: 'User creation date' })
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;
  @ApiProperty({ example: '2022-01-02T00:00:00Z', description: 'User last update date' })
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;
  @ApiProperty({
    example: '2022-01-03T00:00:00Z',
    description: 'User last login date',
    nullable: true,
  })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  lastLoginAt: Date | null;
  @ApiProperty({
    example: '2022-01-04T00:00:00Z',
    description: 'User activation date',
    nullable: true,
  })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  activatedAt: Date | null;
  @ApiProperty({
    example: '2022-01-05T00:00:00Z',
    description: 'User deactivation date',
    nullable: true,
  })
  @Transform(({ value }) => (value ? value.toISOString() : null))
  deactivatedAt: Date | null;
  @ApiProperty({
    example: 1,
    description: 'User role ID',
    nullable: true,
  })
  roleId?: number | null;

  constructor(output: UserOutputDTO) {
    this.id = output.id;
    this.email = output.email;
    this.isActive = output.isActive;
    this.createdAt = output.createdAt;
    this.updatedAt = output.updatedAt;
    this.lastLoginAt = output.lastLoginAt;
    this.activatedAt = output.activatedAt;
    this.deactivatedAt = output.deactivatedAt;
    this.roleId = output.roleId;
  }
}
