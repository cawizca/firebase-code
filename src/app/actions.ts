'use server';

import { UserProfile } from './page';

export type Message = {
  id: string;
  sender: 'user' | 'stranger';
  username: string;
  text: string;
  timestamp: number;
};

export type Conversation = {
  id: string;
  participants: string[];
  participantUsernames: { [key: string]: string };
  createdAt: number;
};


export async function findMatchAction(userProfile: UserProfile, userId: string): Promise<{ conversationId: string | null }> {
  // Mock finding a match immediately.
  const strangerId = `stranger_${Date.now()}`;
  const conversationId = `conv_${Date.now()}`;

  // In a real app, you would store this conversation object in a database.
  // For now, we just create it on the fly.
  const mockConversation: Conversation = {
      id: conversationId,
      participants: [userId, strangerId],
      participantUsernames: {
          [userId]: userProfile.username,
          [strangerId]: "WanderingSoul"
      },
      createdAt: Date.now()
  }
  
  console.log("Created mock conversation:", mockConversation);

  return { conversationId };
}


export async function sendMessageAction(
  conversationId: string,
  messageText: string,
  username: string,
  userId: string
) {
  // Mock sending a message. In a real app, this would save to a database.
  console.log(`Message sent in ${conversationId}: [${username}] ${messageText}`);
  
  // Mock moderation
  if (messageText.toLowerCase().includes("badword")) {
     return {
      success: false,
      error: `Message not sent. Reason: Inappropriate language.`,
    };
  }

  return { success: true };
}

export async function reportUserAction(
  reason: string,
  chatHistory: Message[],
  reportedUser: string,
  conversationId: string
) {
  console.log(`User ${reportedUser} in conversation ${conversationId} reported for: ${reason}`);
  // In a real app, this would save the report to a database.
  return { success: true, message: 'Report submitted. Thank you for helping keep our community safe.' };
}

export async function endChatAction(conversationId: string) {
    // In a real app you might want to archive the conversation or notify the other user.
    // For now, we just log it.
    console.log(`Chat ended for conversation ${conversationId}`);
    return { success: true };
}

export async function getConversationAction(conversationId: string, userId: string): Promise<Conversation | null> {
    // Mock fetching a conversation
    const strangerId = `stranger_${conversationId.split('_')[1]}`;
    const mockConversation: Conversation = {
      id: conversationId,
      participants: [userId, strangerId],
      participantUsernames: {
        [userId]: "You", // This would be fetched from session/DB
        [strangerId]: "WanderingSoul"
      },
      createdAt: Date.now()
    };
    return mockConversation;
}
