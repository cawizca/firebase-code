'use server';

import { moderateChatMessage } from '@/ai/flows/moderate-chat-message';
import { detectSuspectedMinor } from '@/ai/flows/detect-suspected-minor';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { UserProfile } from './page';

export type Message = {
  id: string;
  sender: 'user' | 'stranger';
  username: string;
  text: string;
  timestamp: number;
};

// Firestore document types
type WaitingUser = {
  userId: string;
  username: string;
  interests: string[];
  timestamp: any;
};

export type Conversation = {
  id?: string;
  participants: string[]; // [userId1, userId2]
  participantUsernames: { [key: string]: string };
  createdAt: any;
};

export async function findMatchAction(userProfile: UserProfile, userId: string): Promise<{ conversationId: string | null }> {
  const waitingPoolRef = collection(db, 'waitingPool');
  const q = query(
    waitingPoolRef,
    where('userId', '!=', userId),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    // Match found
    const strangerDoc = querySnapshot.docs[0];
    const stranger = strangerDoc.data() as WaitingUser;

    // Create a new conversation
    const conversationData: Conversation = {
      participants: [userId, stranger.userId],
      participantUsernames: {
        [userId]: userProfile.username,
        [stranger.userId]: stranger.username,
      },
      createdAt: serverTimestamp(),
    };
    const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);

    // Remove stranger from waiting pool
    await setDoc(strangerDoc.ref, { matchedConversationId: conversationRef.id }, { merge: true });

    return { conversationId: conversationRef.id };
  } else {
    // No match found, add user to waiting pool
    const waitingUserRef = doc(db, 'waitingPool', userId);
    const waitingUserDoc = await getDoc(waitingUserRef);

    if (!waitingUserDoc.exists()) {
       await setDoc(waitingUserRef, {
        userId,
        username: userProfile.username,
        interests: userProfile.interests,
        timestamp: serverTimestamp(),
      });
    }
   
    return { conversationId: null };
  }
}

export async function getConversationStatus(userId: string): Promise<{ conversationId: string | null }> {
    const userWaitingRef = doc(db, 'waitingPool', userId);
    const userWaitingDoc = await getDoc(userWaitingRef);
    if (userWaitingDoc.exists() && userWaitingDoc.data().matchedConversationId) {
        const conversationId = userWaitingDoc.data().matchedConversationId;
        // Clean up user from waiting pool once matched
        await setDoc(userWaitingRef, { matched: true }, { merge: true }); // Or delete
        return { conversationId };
    }
    return { conversationId: null };
}

export async function cancelSearchAction(userId: string) {
    const userWaitingRef = doc(db, 'waitingPool', userId);
    await setDoc(userWaitingRef, { cancelled: true }, { merge: true }); // Or delete
    return { success: true };
}


export async function sendMessageAction(
  conversationId: string,
  messageText: string,
  username: string,
  userId: string
) {
  const moderationResult = await moderateChatMessage({ message: messageText });

  if (!moderationResult.isSafe) {
    return {
      success: false,
      error: `Message not sent. Reason: ${moderationResult.reason}`,
    };
  }
  
  const conversationRef = doc(db, 'conversations', conversationId);
  const messagesRef = collection(conversationRef, 'messages');

  const messageData = {
    userId,
    username,
    text: messageText,
    timestamp: serverTimestamp(),
  };
  
  await addDoc(messagesRef, messageData);
  
  // We don't return the message object anymore because we'll be listening for real-time updates.
  return { success: true };
}

export async function reportUserAction(
  reason: string,
  chatHistory: Message[],
  reportedUser: string,
  conversationId: string
) {
  console.log(`User ${reportedUser} in conversation ${conversationId} reported for: ${reason}`);

  if (reason === 'underage_user') {
    const userData = `Reported user: ${reportedUser}`;
    const messageContent = chatHistory.map((m) => `${m.username}: ${m.text}`).join('\n');

    try {
      const result = await detectSuspectedMinor({ userData, messageContent });

      if (result.isSuspectedMinor) {
        console.log('AI detected suspected minor. Reason:', result.reason);
        // Here you would trigger further moderation actions, like flagging the user account.
        return {
          success: true,
          message:
            'Report submitted. Our team will review this user shortly. AI has flagged this user for potential policy violation.',
        };
      }
    } catch (e) {
      console.error('Error detecting suspected minor:', e);
    }
  }

  // In a real app, this would save the report to a database.
  return { success: true, message: 'Report submitted. Thank you for helping keep our community safe.' };
}

export async function endChatAction(conversationId: string) {
    // In a real app you might want to archive the conversation or notify the other user.
    // For now, we just log it.
    console.log(`Chat ended for conversation ${conversationId}`);
    return { success: true };
}
