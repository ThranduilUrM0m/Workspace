import { WebSocketGateway, WebSocketServer, OnGatewayInit, SubscribeMessage, MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() { console.log('[EventsGateway] Initialized'); }

  handleConnection(client: Socket) {
    console.log(`[EventsGateway] client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[EventsGateway] client disconnected: ${client.id}`);
  }

  @SubscribeMessage('echo')
  handleEcho(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
    return { from: client.id, payload };
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { ts: Date.now() });
  }

  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
