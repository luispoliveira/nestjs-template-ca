import { SetMetadata } from '@nestjs/common';

export const RequiresSensitive = () => SetMetadata('sensitive', true);
