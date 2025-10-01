import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error during app bootstrap:', err);
    process.exit(1);
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  });
