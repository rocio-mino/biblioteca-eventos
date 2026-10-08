import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const puerto = Number(process.env.PUERTO ?? 3010);
  const app = await NestFactory.create(AppModule);
  await app.listen(puerto);
  console.log(`biblioteca-eventos escuchando en http://localhost:${puerto}`);
}
bootstrap();