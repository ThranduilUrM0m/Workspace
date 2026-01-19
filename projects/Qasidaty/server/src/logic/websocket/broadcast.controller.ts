import { Body, Controller, Post } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Controller('broadcast')
export class BroadcastController {
  constructor(private readonly eventsGateway: EventsGateway) {}

  @Post()
  async broadcast(@Body() payload: { event?: string; data?: any }) {
    const event = payload.event || 'broadcast';
    const data = payload.data ?? { ts: Date.now(), text: 'broadcast' };
    this.eventsGateway.broadcast(event, data);
    return { ok: true, event, data };
  }
}
