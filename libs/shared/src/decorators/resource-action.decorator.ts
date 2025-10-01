/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable indent */
import { ActionType, ResourceType } from '@lib/core';
import { SetMetadata } from '@nestjs/common';

export const RequiresResourceAction =
  (resource: ResourceType, action: ActionType) =>
  (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata('resource', resource)(target as any, propertyKey, descriptor);
    SetMetadata('action', action)(target as any, propertyKey, descriptor);
  };
