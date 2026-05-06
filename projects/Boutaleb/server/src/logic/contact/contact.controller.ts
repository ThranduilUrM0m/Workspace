import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('api/public/contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post('submit')
  async submitIntake(@Body() data: any) {
    const submission = await this.contactService.submitIntake(data);
    return {
      data: submission,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  async getStatus(@Param('id') id: string) {
    const submission = await this.contactService.findById(id);
    return {
      data: submission,
      success: !!submission,
      timestamp: new Date().toISOString(),
    };
  }
}
