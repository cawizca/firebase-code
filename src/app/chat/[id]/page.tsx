
'use client';

import Header from '@/components/main/Header';
import ChatInterface from '@/components/chat/ChatInterface';
import { type UserProfile } from '@/app/page';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { type Conversation, getConversationAction } from '@/app/actions';

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const router = useRouter();

  useEffect(() => {
    let storedProfile: UserProfile | null = null;
    try {
      const storedProfileString = sessionStorage.getItem('userProfile');
      if (storedProfileString) {
        storedProfile = JSON.parse(storedProfileString);
        setUserProfile(storedProfile);
      } else {
        router.push('/');
        return;
      }
    } catch (e) {
      console.error("Could not parse user profile from sessionStorage", e);
      sessionStorage.removeItem('userProfile');
      router.push('/');
      return;
    }

    const fetchConversation = async () => {
      if (!conversationId || !storedProfile?.id) {
          setError('Required chat information is missing.');
          setIsLoading(false);
          return;
      };
      
      try {
        const convData = await getConversationAction(conversationId, storedProfile.id);

        if (convData) {
          setConversation(convData);
        } else {
          setError('Chat not found.');
        }
      } catch (err: any) {
          console.error("Error:", err);
          setError("An error occurred while loading the chat.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();

  }, [router, conversationId]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('userProfile');
    router.push('/');
  }

  if (isLoading) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Loading Chat...</p>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <p className="text-lg font-semibold text-destructive">{error}</p>
      </div>
    );
  }

  if (!userProfile || !conversation) {
    return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background">
         <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
         <p className="text-lg font-semibold">Preparing your chat...</p>
       </div>
     );
  }
  
  const strangerUsername = conversation.participantUsernames[conversation.participants.find(p => p !== userProfile.id)!] ?? 'Stranger';

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header userProfile={userProfile} onLogout={handleLogout} />
      <main className="flex-grow flex flex-col p-2 sm:p-4">
        <ChatInterface conversationId={conversationId} userProfile={userProfile} strangerUsername={strangerUsername} />
      </main>
    </div>
  );
}
