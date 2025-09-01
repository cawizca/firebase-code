import { Controller, Post, Get, Put, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('find/:userId')
  async findMatch(@Param('userId') userId: string) {
    return this.matchingService.findMatch(userId);
  }

  @Get('conversation/:conversationId/:userId')
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
  ) {
    return this.matchingService.getConversation(conversationId, userId);
  }

  @Put('end/:conversationId/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async endConversation(
    @Param('conversationId') conversationId: string,
    @Param('userId') userId: string,
  ) {
    return this.matchingService.endConversation(conversationId, userId);
  }
}