'use client';

import { useState, useEffect } from 'react';
import ProfileSetup from '@/components/main/ProfileSetup';
import MatchingScreen from '@/components/main/MatchingScreen';
import Header from '@/components/main/Header';
import { Loader2 } from 'lucide-react';

export type UserProfile = {
  id: string; // Unique ID for the user session
  username: string;
  interests: string[];
};

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProfile = sessionStorage.getItem('userProfile');
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error("Could not parse user profile from sessionStorage", error);
      sessionStorage.removeItem('userProfile');
    }
    setIsLoading(false);
  }, []);

  const handleProfileCreate = (profile: Omit<UserProfile, 'id'>) => {
    const fullProfile = { ...profile, id: `user_${Date.now()}` };
    sessionStorage.setItem('userProfile', JSON.stringify(fullProfile));
    setUserProfile(fullProfile);
  };
  
  const handleLogout = () => {
    sessionStorage.removeItem('userProfile');
    setUserProfile(null);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg font-semibold">Loading AnonyConnect...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header userProfile={userProfile} onLogout={handleLogout} />
      <main className="flex-grow flex items-center justify-center p-4">
        {!userProfile ? (
          <ProfileSetup onProfileCreate={handleProfileCreate} />
        ) : (
          <MatchingScreen userProfile={userProfile} />
        )}
      </main>
    </div>
  );
}
