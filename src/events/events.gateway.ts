import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventsService } from './events.service';
import { MessageDto, JoinRoomDto, LeaveRoomDto } from './dto/message.dto';
import { RoomDto } from './dto/room.dto';
import { RegisterUserDto } from './dto/auth.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/events',
})
@UsePipes(new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
}))
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server; 

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private readonly eventsService: EventsService) {}

  afterInit(server: Server) {
    this.eventsService.setServer(server);
  }

  handleConnection(@ConnectedSocket() client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.eventsService.handleConnection(client);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.eventsService.handleDisconnect(client);
  }

  @SubscribeMessage('registerUser')
  async handleRegisterUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RegisterUserDto,
  ): Promise<void> {
    this.logger.debug(`Client ${client.id} attempting to register username: ${data.username}`);
    try {
      this.eventsService.registerUser(client, data.username);
    } catch (error) {
      this.logger.error(`Registration failed for ${client.id}: ${error.message}`);
      client.emit('error', { message: error.message || 'Registration failed.' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() messageDto: MessageDto,
  ): Promise<void> { 
    this.logger.debug(`Received 'sendMessage' from ${client.id}: ${JSON.stringify(messageDto)}`);
    try {
      await this.eventsService.handleMessage(client, messageDto);
    } catch (error) {
      this.logger.error(`Error handling message from ${client.id}: ${error.message}`);
      client.emit('error', { message: error.message || 'Failed to send message.' });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ): Promise<void> {
    this.logger.debug(`Received 'joinRoom' from ${client.id} for room: ${data.roomName}`);
    try {
      await this.eventsService.handleJoinRoom(client, data.roomName);
    } catch (error) {
      this.logger.error(`Error joining room '${data.roomName}' for ${client.id}: ${error.message}`);
      client.emit('error', { message: error.message || `Failed to join room '${data.roomName}'.` });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LeaveRoomDto,
  ): Promise<void> {
    this.logger.debug(`Received 'leaveRoom' from ${client.id} for room: ${data.roomName}`);
    try {
      await this.eventsService.handleLeaveRoom(client, data.roomName);
    } catch (error) {
      this.logger.error(`Error leaving room '${data.roomName}' for ${client.id}: ${error.message}`);
      client.emit('error', { message: error.message || `Failed to leave room '${data.roomName}'.` });
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong', { timestamp: new Date().toISOString() });
    this.logger.debug(`Sent 'pong' to ${client.id}`);
  }

  @SubscribeMessage('getUsers')
  async handleGetUsers(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const users = this.eventsService.getConnectedUsers();
      client.emit('usersList', users.map(u => ({ username: u.username, room: u.room })));
    } catch (error) {
      this.logger.error(`Error getting users list for ${client.id}: ${error.message}`);
      client.emit('error', { message: error.message || 'Failed to get users list.' });
    }
  }

  @SubscribeMessage('getRoomMembers')
  async handleGetRoomMembers(
      @ConnectedSocket() client: Socket,
      @MessageBody() data: RoomDto,
  ): Promise<void> {
      try {
          const members = this.eventsService.getRoomMembers(data.roomName);
          client.emit('roomMembersList', { roomName: data.roomName, members });
      } catch (error) {
          this.logger.error(`Error getting members for room ${data.roomName} for ${client.id}: ${error.message}`);
          client.emit('error', { message: error.message || 'Failed to get room members.' });
      }
  }
  

  // Bạn có thể thêm các sự kiện khác ở đây, ví dụ:
//   @SubscribeMessage('privateMessage')
//   async handlePrivateMessage(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: { to: string; content: string }
//   ): Promise<void> {
//     this.logger.debug(`Received private message from ${client.id} to ${data.to}`);
//     try {
//       await this.eventsService.handlePrivateMessage(client.id, data.to, data.content);
//     } catch (error) {
//       this.logger.error(`Error sending private message from ${client.id}: ${error.message}`);
//       client.emit('error', { message: error.message || 'Failed to send private message.' });
//     }
//   }
}