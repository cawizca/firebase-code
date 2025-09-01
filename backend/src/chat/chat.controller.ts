import { Controller, Post, Get, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto, ReportDto } from '../types/chat.types';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message/:senderId')
  async sendMessage(
    @Param('senderId') senderId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatService.sendMessage(senderId, createMessageDto);
  }

  @Get('messages/:conversationId/:userId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const messageLimit = limit ? parseInt(limit, 10) : 50;
    return this.chatService.getMessages(conversationId, userId, messageLimit);
  }

  @Post('report/:reporterId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reportUser(
    @Param('reporterId') reporterId: string,
    @Body() reportDto: ReportDto,
  ) {
    return this.chatService.reportUser(reporterId, reportDto);
  }

  @Post('block/:blockerId/:blockedUserId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async blockUser(
    @Param('blockerId') blockerId: string,
    @Param('blockedUserId') blockedUserId: string,
  ) {
    return this.chatService.blockUser(blockerId, blockedUserId);
  }
}