'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type UserProfile } from '@/app/page';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ProfileSetupProps = {
  onProfileCreate: (profile: UserProfile) => void;
};

const suggestedInterests = ['Music', 'Movies', 'Gaming', 'Sports', 'Travel', 'Art', 'Reading', 'Cooking'];

export default function ProfileSetup({ onProfileCreate }: ProfileSetupProps) {
  const [username, setUsername] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const { toast } = useToast();

  const handleAddInterest = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if (e && e.key !== 'Enter') return;
    if (currentInterest.trim() && !interests.includes(currentInterest.trim()) && interests.length < 5) {
      setInterests([...interests, currentInterest.trim()]);
      setCurrentInterest('');
    }
    if (interests.length >= 5) {
        toast({ title: "Maximum interests reached."});
    }
    e?.preventDefault();
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };
  
  const handleSelectSuggestedInterest = (interest: string) => {
    if (!interests.includes(interest) && interests.length < 5) {
        setInterests([...interests, interest]);
    } else if (interests.length >= 5) {
        toast({ title: "Maximum interests reached."});
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onProfileCreate({ username: username.trim(), interests });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl animate-in fade-in-50 zoom-in-95">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Create Your Anonymous Profile</CardTitle>
        <CardDescription>This is just for this session and won't be stored permanently.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., CuriousExplorer"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]{3,20}$"
              title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interests">Interests (up to 5)</Label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[24px]">
              {interests.map(interest => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <button type="button" onClick={() => handleRemoveInterest(interest)} className="rounded-full hover:bg-muted-foreground/20">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              id="interests"
              value={currentInterest}
              onChange={(e) => setCurrentInterest(e.target.value)}
              onKeyDown={handleAddInterest}
              placeholder="Type an interest and press Enter"
              disabled={interests.length >= 5}
            />
            <div className="flex flex-wrap gap-1 mt-2">
                {suggestedInterests.map(interest => (
                    <Badge key={interest} variant="outline" className="cursor-pointer hover:bg-accent/10" onClick={() => handleSelectSuggestedInterest(interest)}>
                        {interest}
                    </Badge>
                ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            Start Chatting
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
