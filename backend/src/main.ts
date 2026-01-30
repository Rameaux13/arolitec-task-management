import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Active la validation globale pour tous les DTOs
  // whitelist: true => Enlève les propriétés non définies dans le DTO
  // forbidNonWhitelisted: true => Rejette les requêtes avec des propriétés inconnues
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // Transforme automatiquement les types
  }));
  
  // Active CORS pour permettre au frontend de communiquer avec le backend
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3333);
  console.log(`Application is running on: http://localhost:3333`);
}
bootstrap();