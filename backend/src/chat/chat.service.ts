import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ModerationService } from '../moderation/moderation.service';
import { Message, CreateMessageDto, ReportDto } from '../types/chat.types';

@Injectable()
export class ChatService {
  constructor(
    private supabaseService: SupabaseService,
    private moderationService: ModerationService,
  ) {}

  async sendMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<{ success: boolean; message?: Message; error?: string }> {
    const supabase = this.supabaseService.getAdminClient();
    
    // Verify user is part of this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', createMessageDto.conversation_id)
      .eq('status', 'active')
      .or(`participant_1.eq.${senderId},participant_2.eq.${senderId}`)
      .single();

    if (!conversation) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Moderate the message
    const moderation = this.moderationService.moderateMessage(createMessageDto.content);
    
    if (!moderation.isAllowed) {
      return { 
        success: false, 
        error: moderation.reason || 'Message not allowed' 
      };
    }

    // Save message to database
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: createMessageDto.conversation_id,
        sender_id: senderId,
        content: createMessageDto.content,
        is_flagged: false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Failed to send message');
    }

    return { success: true, message };
  }

  async getMessages(conversationId: string, userId: string, limit: number = 50): Promise<Message[]> {
    const supabase = this.supabaseService.getAdminClient();
    
    // Verify user is part of this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .single();

    if (!conversation) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      throw new BadRequestException('Failed to fetch messages');
    }

    return messages || [];
  }

  async reportUser(reporterId: string, reportDto: ReportDto): Promise<void> {
    await this.moderationService.reportUser(reportDto, reporterId);
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    await this.moderationService.blockUser(blockerId, blockedUserId);
  }
}