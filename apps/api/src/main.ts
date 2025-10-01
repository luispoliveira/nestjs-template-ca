import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error during app bootstrap:', err);
    process.exit(1);
  })
  .finally(() => {
    // Cleanup resources if needed
  });
