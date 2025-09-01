import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDto } from '../types/chat.types';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:9002',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    // Find and update user status
    const userId = this.findUserBySocket(client.id);
    if (userId) {
      await this.usersService.setUserOnlineStatus(userId, false);
      this.userSockets.delete(userId);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @MessageBody() data: { userId: string; conversationId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.userSockets.set(data.userId, client.id);
    await this.usersService.setUserOnlineStatus(data.userId, true);
    
    if (data.conversationId) {
      client.join(data.conversationId);
    }
    
    client.emit('joined', { success: true });
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @MessageBody() data: { userId: string; conversationId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data.conversationId) {
      client.leave(data.conversationId);
    }
    
    await this.usersService.setUserOnlineStatus(data.userId, false);
    this.userSockets.delete(data.userId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { senderId: string; messageDto: CreateMessageDto },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const result = await this.chatService.sendMessage(data.senderId, data.messageDto);
      
      if (result.success && result.message) {
        // Emit to all clients in the conversation room
        this.server.to(data.messageDto.conversation_id).emit('newMessage', result.message);
      } else {
        // Send error back to sender only
        client.emit('messageError', { error: result.error });
      }
    } catch (error) {
      client.emit('messageError', { error: 'Failed to send message' });
    }
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.conversationId);
    client.emit('joinedConversation', { conversationId: data.conversationId });
  }

  @SubscribeMessage('leaveConversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.conversationId);
    client.emit('leftConversation', { conversationId: data.conversationId });
  }

  private findUserBySocket(socketId: string): string | undefined {
    for (const [userId, userSocketId] of this.userSockets.entries()) {
      if (userSocketId === socketId) {
        return userId;
      }
    }
    return undefined;
  }

  // Method to notify conversation participants
  async notifyConversationEnd(conversationId: string) {
    this.server.to(conversationId).emit('conversationEnded', { conversationId });
  }
}