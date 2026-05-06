import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ClientService } from './clients.service';

@Controller('api/clients')
export class ClientsController {
  constructor(private clientService: ClientService) {}

  @Get()
  async getAll() {
    const clients = await this.clientService.findAll();
    return {
      data: clients,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const client = await this.clientService.findById(id);
    return {
      data: client,
      success: !!client,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async create(@Body() data: any) {
    const client = await this.clientService.create(data);
    return {
      data: client,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}
