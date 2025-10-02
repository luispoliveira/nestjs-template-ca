import { UserCollectionPresenter, UserPresenter } from '@lib/infrastructure';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ApiModule } from './api.module';
import { applyGlobalConfig } from './global-config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ApiModule);

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addBearerAuth({
      description: 'Enter JWT token',
      name: 'Authorization',
      scheme: 'Bearer',
      type: 'http',
      bearerFormat: 'JWT',
      in: 'Header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [UserPresenter, UserCollectionPresenter],
  });

  SwaggerModule.setup('api', app, document);

  applyGlobalConfig(app);

  await app.listen(process.env.port ?? 3000, '0.0.0.0');
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
