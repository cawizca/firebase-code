'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquareHeart } from 'lucide-react';
import { type UserProfile } from '@/app/page';
import { Badge } from '../ui/badge';

type MatchingScreenProps = {
  userProfile: UserProfile;
};

export default function MatchingScreen({ userProfile }: MatchingScreenProps) {
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleFindStranger = () => {
    setIsSearching(true);
    // Mock finding a match and navigating to chat
    setTimeout(() => {
      // In a real app, this would come from the backend
      const conversationId = `conv_${Date.now()}`;
      router.push(`/chat/${conversationId}`);
    }, 3000); // Simulate a 3-second search
  };
  
  const handleCancelSearch = () => {
    setIsSearching(false);
  }

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
          <Button size="lg" className="h-16 w-64 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-lg transform hover:scale-105 transition-transform" onClick={handleFindStranger}>
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
