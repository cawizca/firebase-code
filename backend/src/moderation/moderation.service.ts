import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ReportDto } from '../types/chat.types';

@Injectable()
export class ModerationService {
  private readonly bannedWords = [
    'badword', 'inappropriate', 'spam', 'scam', 'abuse',
    // Add more banned words as needed
  ];

  constructor(private supabaseService: SupabaseService) {}

  moderateMessage(content: string): { isAllowed: boolean; reason?: string } {
    const lowerContent = content.toLowerCase();
    
    // Check for banned words
    for (const word of this.bannedWords) {
      if (lowerContent.includes(word)) {
        return { isAllowed: false, reason: 'Inappropriate language detected' };
      }
    }

    // Check for potential personal information (basic patterns)
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    const urlPattern = /https?:\/\/[^\s]+/;

    if (emailPattern.test(content)) {
      return { isAllowed: false, reason: 'Email addresses are not allowed' };
    }

    if (phonePattern.test(content)) {
      return { isAllowed: false, reason: 'Phone numbers are not allowed' };
    }

    if (urlPattern.test(content)) {
      return { isAllowed: false, reason: 'URLs are not allowed' };
    }

    return { isAllowed: true };
  }

  async reportUser(reportDto: ReportDto, reporterId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    
    await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportDto.reported_user_id,
        conversation_id: reportDto.conversation_id,
        reason: reportDto.reason,
        description: reportDto.description,
      });
  }

  async blockUser(blockerId: string, blockedUserId: string): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    
    await supabase
      .from('blocked_users')
      .insert({
        blocker_id: blockerId,
        blocked_user_id: blockedUserId,
      });
  }

  async isUserBlocked(userId1: string, userId2: string): Promise<boolean> {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data } = await supabase
      .from('blocked_users')
      .select('id')
      .or(`and(blocker_id.eq.${userId1},blocked_user_id.eq.${userId2}),and(blocker_id.eq.${userId2},blocked_user_id.eq.${userId1})`)
      .limit(1);

    return data && data.length > 0;
  }
}