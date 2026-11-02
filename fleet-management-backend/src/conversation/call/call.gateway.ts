import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/calls',
})
export class CallGateway {
  private readonly logger = new Logger(CallGateway.name);
  @WebSocketServer() server: Server;

  emitCallStatus(data: any) {
    this.logger.debug(`Emitting call status: ${JSON.stringify(data)}`);
    this.server.emit('callStatus', data);
  }

  emitRecordingStatus(data: any) {
    this.logger.debug(`Emitting recording status: ${JSON.stringify(data)}`);
    this.server.emit('recordingStatus', data);
  }
}
