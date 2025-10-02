import { EnvironmentEnum } from '@lib/shared/core/enums/environment.enum';
import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(EnvironmentEnum.DEVELOPMENT, EnvironmentEnum.PRODUCTION, EnvironmentEnum.TEST)
    .default('development'),
  LOG_PRISMA_QUERIES: Joi.boolean().default(true),
  DATABASE_URL: Joi.string().uri().required(),
});
