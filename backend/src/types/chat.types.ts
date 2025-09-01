export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  status: 'active' | 'ended';
  created_at: string;
  ended_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_flagged: boolean;
  created_at: string;
}

export interface CreateMessageDto {
  conversation_id: string;
  content: string;
}

export interface ReportDto {
  reported_user_id: string;
  conversation_id: string;
  reason: string;
  description?: string;
}