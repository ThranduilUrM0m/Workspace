import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { ClerkStrategy } from './clerk.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'clerk-jwt' })],
  controllers: [AuthController],
  providers: [ClerkStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
