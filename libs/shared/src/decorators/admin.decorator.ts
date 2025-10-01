import { SetMetadata } from '@nestjs/common';

export const RequiresAdmin = () => SetMetadata('admin', true);
