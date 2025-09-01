import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { Conversation } from '../types/chat.types';

@Injectable()
export class MatchingService {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService,
  ) {}

  async findMatch(userId: string): Promise<{ conversationId: string | null }> {
    const supabase = this.supabaseService.getAdminClient();
    
    // Set user as searching
    await this.usersService.setUserSearchingStatus(userId, true);
    
    // Find another user who is searching and online
    const { data: availableUsers, error } = await supabase
      .from('users')
      .select('id, interests')
      .eq('is_searching', true)
      .eq('is_online', true)
      .neq('id', userId)
      .limit(10);

    if (error || !availableUsers || availableUsers.length === 0) {
      return { conversationId: null };
    }

    // Get current user's interests for matching
    const currentUser = await this.usersService.getUserById(userId);
    
    // Simple matching algorithm - find user with most common interests
    let bestMatch = availableUsers[0];
    let maxCommonInterests = 0;

    for (const user of availableUsers) {
      const commonInterests = currentUser.interests.filter(interest => 
        user.interests.includes(interest)
      ).length;
      
      if (commonInterests > maxCommonInterests) {
        maxCommonInterests = commonInterests;
        bestMatch = user;
      }
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        participant_1: userId,
        participant_2: bestMatch.id,
        status: 'active',
      })
      .select()
      .single();

    if (convError) {
      throw new BadRequestException('Failed to create conversation');
    }

    // Set both users as no longer searching
    await Promise.all([
      this.usersService.setUserSearchingStatus(userId, false),
      this.usersService.setUserSearchingStatus(bestMatch.id, false),
    ]);

    return { conversationId: conversation.id };
  }

  async getConversation(conversationId: string, userId: string): Promise<Conversation | null> {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  }

  async endConversation(conversationId: string, userId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    
    // Verify user is part of this conversation
    const conversation = await this.getConversation(conversationId, userId);
    if (!conversation) {
      throw new BadRequestException('Conversation not found or access denied');
    }

    await supabase
      .from('conversations')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', conversationId);
  }
}