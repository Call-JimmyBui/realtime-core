import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { MessageDto } from './dto/message.dto';

interface ConnectedUser {
  socketId: string;
  username: string;
  room?: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private ioServer: Server;

  private readonly connectedUsers: Map<string, ConnectedUser> = new Map();
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly rooms: Map<string, Set<string>> = new Map();

  setServer(server: Server) {
    this.ioServer = server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
    client.emit('connectionStatus', { status: 'success', message: `Welcome, ${client.id}! You are connected.` });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);

    this.rooms.forEach((members, roomName) => {
      if (members.has(client.id)) {
        members.delete(client.id);
        if (members.size === 0) {
          this.rooms.delete(roomName);
          this.logger.debug(`Room '${roomName}' is now empty and removed.`);
        }
        this.ioServer.to(roomName).emit('memberLeft', { clientId: client.id, roomName });
        this.logger.debug(`Client ${client.id} left room ${roomName}.`);
      }
    });
  }

  registerUser(client: Socket, username: string): ConnectedUser {
    const existingUser = Array.from(this.connectedUsers.values()).find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    if (existingUser) {
      throw new BadRequestException(`Username '${username}' is already taken.`);
    }

    const newUser: ConnectedUser = { socketId: client.id, username };
    this.connectedUsers.set(client.id, newUser);
    this.logger.log(`User registered: ${username} (ID: ${client.id})`);

    client.emit('userRegistered', {
      username: newUser.username,
      message: `Welcome, ${newUser.username}!`,
    });

    client.broadcast.emit('userConnected', {
      username: newUser.username,
      message: `${newUser.username} has joined the chat.`,
    });

    return newUser;
  }


  async handleMessage(client: Socket, messageDto: MessageDto): Promise<string> {
    const { content, roomName } = messageDto;
    this.logger.log(`Processing message from ${client.id}. Content: "${content}", Room: ${roomName || 'N/A'}`);

    const messagePayload = {
      senderId: client.id,
      content,
      timestamp: new Date().toISOString(),
      roomName: roomName || 'broadcast',
      username: this.getUsernameByClientId(client.id), 
    };

    if (roomName) {
      if (!client.rooms.has(roomName)) {
        throw new BadRequestException(`Client ${client.id} is not in room '${roomName}'.`);
      }
      if (!this.rooms.has(roomName) || this.rooms.get(roomName)!.size === 0) { 
        throw new BadRequestException(`Room '${roomName}' does not exist or is empty.`);
      }

      this.ioServer.to(roomName).emit('roomMessage', messagePayload);
      this.logger.debug(`Message sent to room '${roomName}' from ${client.id}.`);
      return `Message sent to room '${roomName}'.`;
    } else {
      client.broadcast.emit('globalMessage', messagePayload);
      this.logger.debug(`Message broadcasted globally from ${client.id}.`);
      return 'Message broadcasted globally.';
    }
  }

  async handleJoinRoom(client: Socket, roomName: string): Promise<string> {
    if (client.rooms.has(roomName)) {
      throw new BadRequestException(`Client ${client.id} is already in room '${roomName}'.`);
    }

    client.join(roomName);
    this.logger.log(`Client ${client.id} joined Socket.IO room: ${roomName}`);

    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set<string>()); 
      this.logger.debug(`Created new internal room tracking for: ${roomName}`);
    }

    this.rooms.get(roomName)!.add(client.id);

    client.emit('roomJoined', { status: 'success', roomName, clientId: client.id, message: `You have joined room '${roomName}'.` });

    client.to(roomName).emit('memberJoined', { clientId: client.id, roomName, message: `Client ${client.id} has joined.` });

    this.logger.log(`Client ${client.id} successfully joined room: ${roomName}`);
    return `Joined room ${roomName}.`;
  }

  async handleLeaveRoom(client: Socket, roomName: string): Promise<string> {
    if (!client.rooms.has(roomName)) {
      throw new BadRequestException(`Client ${client.id} is not currently in room '${roomName}'.`);
    }

    client.leave(roomName);
    this.logger.log(`Client ${client.id} left Socket.IO room: ${roomName}`);

    const clientsInRoom = this.rooms.get(roomName);
    if (clientsInRoom) {
      clientsInRoom.delete(client.id);
      if (clientsInRoom.size === 0) {
        this.rooms.delete(roomName);
        this.logger.debug(`Room '${roomName}' is now empty and removed.`);
      }
    }

    client.emit('roomLeft', { status: 'success', roomName, clientId: client.id, message: `You have left room '${roomName}'.` });
    this.ioServer.to(roomName).emit('memberLeft', { clientId: client.id, roomName, message: `Client ${client.id} has left.` });

    this.logger.log(`Client ${client.id} successfully left room: ${roomName}`);
    return `Left room ${roomName}.`;
  }

  sendMessageToClient(clientId: string, event: string, payload: any): boolean {
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.emit(event, payload);
      this.logger.debug(`Sent server-initiated event '${event}' to client ${clientId}.`);
      return true;
    }
    this.logger.warn(`Attempted to send message to non-existent client: ${clientId}`);
    return false;
  }

  sendMessageToRoom(roomName: string, event: string, payload: any): boolean {
    if (this.ioServer && this.rooms.has(roomName) && this.rooms.get(roomName)!.size > 0) {
      this.ioServer.to(roomName).emit(event, payload);
      this.logger.debug(`Sent server-initiated event '${event}' to room '${roomName}'.`);
      return true;
    }
    this.logger.warn(`Attempted to send message to non-existent or empty room: ${roomName}`);
    return false;
  }

  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getRoomMembers(roomName: string): string[] {
    const roomMembers = this.rooms.get(roomName);
    if (roomMembers) {
      return Array.from(roomMembers).map(socketId => this.connectedUsers.get(socketId)?.username || 'Unknown');
    }
    return [];
  }
  private getUsernameByClientId(clientId: string): string | undefined {
      return this.connectedUsers.get(clientId)?.username;
  }
}