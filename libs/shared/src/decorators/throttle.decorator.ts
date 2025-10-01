import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';
export const SKIP_THROTTLE_KEY = 'skipThrottle';

export const Throttle = (ttl: number, limit: number) => SetMetadata(THROTTLE_KEY, { ttl, limit });
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);
