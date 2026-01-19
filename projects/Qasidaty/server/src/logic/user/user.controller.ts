import { Controller, Get, Param, Post, Body, Put, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../../schemas/user.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':clerkId')
  async getUser(@Param('clerkId') clerkId: string): Promise<User | null> {
    return this.userService.findByClerkId(clerkId);
  }

  @Post()
  async createUser(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.findOrCreate(userData);
  }

  @Put(':clerkId')
  async updateUser(@Param('clerkId') clerkId: string, @Body() updateData: Partial<User>): Promise<User | null> {
    return this.userService.updateUser(clerkId, updateData);
  }

  @Delete(':clerkId')
  async deleteUser(@Param('clerkId') clerkId: string): Promise<void> {
    return this.userService.deleteUser(clerkId);
  }
}
