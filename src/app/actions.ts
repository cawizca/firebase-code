'use server';

import { moderateChatMessage } from '@/ai/flows/moderate-chat-message';
import { detectSuspectedMinor } from '@/ai/flows/detect-suspected-minor';

export type Message = {
  id: string;
  sender: 'user' | 'stranger';
  username: string;
  text: string;
  timestamp: number;
};

export async function sendMessageAction(messageText: string, username: string) {
  const moderationResult = await moderateChatMessage({ message: messageText });

  if (!moderationResult.isSafe) {
    return {
      success: false,
      error: `Message not sent. Reason: ${moderationResult.reason}`,
    };
  }

  // In a real app, you would broadcast this message via WebSockets to the other user.
  // For this demo, we'll just return the validated message.
  const message: Message = {
    id: `msg_${Date.now()}`,
    sender: 'user',
    username,
    text: messageText,
    timestamp: Date.now(),
  };

  return { success: true, message };
}

export async function reportUserAction(reason: string, chatHistory: Message[], reportedUser: string) {
  console.log(`User ${reportedUser} reported for: ${reason}`);
  
  if (reason === 'underage_user') {
    const userData = `Reported user: ${reportedUser}`;
    const messageContent = chatHistory.map(m => `${m.username}: ${m.text}`).join('\n');
    
    try {
      const result = await detectSuspectedMinor({ userData, messageContent });
      
      if (result.isSuspectedMinor) {
          console.log('AI detected suspected minor. Reason:', result.reason);
          // Here you would trigger further moderation actions, like flagging the user account.
          return { success: true, message: 'Report submitted. Our team will review this user shortly. AI has flagged this user for potential policy violation.' };
      }
    } catch (e) {
      console.error('Error detecting suspected minor:', e);
    }
  }
  
  // In a real app, this would save the report to a database.
  return { success: true, message: 'Report submitted. Thank you for helping keep our community safe.' };
}
