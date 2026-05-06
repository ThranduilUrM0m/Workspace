import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client, ClientSchema } from '../../schemas/index';

@Module({
  imports: [MongooseModule.forFeature([{ name: Client.name, schema: ClientSchema }])],
  controllers: [ClientsController],
  providers: [ClientService],
  exports: [ClientService],
})
export class ClientsModule {}
