'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquareHeart } from 'lucide-react';
import { type UserProfile } from '@/app/page';
import { Badge } from '../ui/badge';
import { findMatchAction, getConversationStatus, cancelSearchAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type MatchingScreenProps = {
  userProfile: UserProfile;
};

export default function MatchingScreen({ userProfile }: MatchingScreenProps) {
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  const startPollingForMatch = (userId: string) => {
    pollIntervalRef.current = setInterval(async () => {
      const { conversationId } = await getConversationStatus(userId);
      if (conversationId) {
        clearInterval(pollIntervalRef.current);
        setIsSearching(false);
        toast({ title: "Match found!", description: "Connecting you to your new chat." });
        router.push(`/chat/${conversationId}`);
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleFindStranger = async () => {
    if (!userProfile?.id) {
        toast({ variant: "destructive", title: "An error occurred", description: "User ID is missing. Please refresh and try again."})
        return;
    }
    setIsSearching(true);
    const { conversationId } = await findMatchAction(userProfile, userProfile.id);
    if (conversationId) {
      setIsSearching(false);
      toast({ title: "Match found!", description: "Connecting you to your new chat." });
      router.push(`/chat/${conversationId}`);
    } else {
      // User was added to the waiting pool, start polling
      startPollingForMatch(userProfile.id);
    }
  };
  
  const handleCancelSearch = async () => {
    if (!userProfile?.id) return;
    setIsSearching(false);
    if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
    }
    await cancelSearchAction(userProfile.id);
    toast({ title: "Search cancelled." });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      // If the user navigates away while searching, cancel the search
      if (isSearching && userProfile?.id) {
        cancelSearchAction(userProfile.id);
      }
    };
  }, [isSearching, userProfile?.id]);

  return (
    <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in-50 zoom-in-95">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Ready to Connect?</CardTitle>
        <CardDescription>
          {isSearching ? 'Connecting you with a stranger...' : 'Find someone to talk to from anywhere in the world.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-48">
        {isSearching ? (
          <div className="flex flex-col items-center gap-4 animate-in fade-in-50">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching for a perfect match...</p>
            <Button variant="outline" onClick={handleCancelSearch}>Cancel</Button>
          </div>
        ) : (
          <Button size="lg" className="h-16 w-64 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-lg transform hover:scale-105 transition-transform" onClick={handleFindStranger} disabled={!userProfile.id}>
            <MessageSquareHeart className="mr-2 h-6 w-6" />
            Find a Stranger
          </Button>
        )}
      </CardContent>
      {userProfile.interests.length > 0 && (
        <CardFooter className="flex-col gap-2">
            <p className="text-sm text-muted-foreground">Matching based on your interests:</p>
            <div className="flex flex-wrap gap-2 justify-center">
                {userProfile.interests.map(interest => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                ))}
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
