import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { BroadcastController } from './broadcast.controller';

@Module({
  controllers: [BroadcastController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketModule {}
