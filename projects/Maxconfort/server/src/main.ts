import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  // Enable compression
  app.use(compression());
  
  // Enable helmet for security headers
  app.use(helmet());
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log('Server running on port', port);
}
bootstrap();
