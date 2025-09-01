'use client';

import Header from '@/components/main/Header';
import ChatInterface from '@/components/chat/ChatInterface';
import { type UserProfile } from '@/app/page';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const conversationId = params.id as string;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedProfile = sessionStorage.getItem('userProfile');
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      } else {
        // If no profile, can't be in chat. Redirect home.
        router.push('/');
      }
    } catch (error) {
      console.error("Could not parse user profile from sessionStorage", error);
      sessionStorage.removeItem('userProfile');
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('userProfile');
    router.push('/');
  }

  if (isLoading || !userProfile) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Loading Chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header userProfile={userProfile} onLogout={handleLogout} />
      <main className="flex-grow flex flex-col p-2 sm:p-4">
        <ChatInterface conversationId={conversationId} userProfile={userProfile} />
      </main>
    </div>
  );
}
