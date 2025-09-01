import { type UserProfile } from '@/app/page';
import { Button } from '@/components/ui/button';
import { MessageSquareDashed, LogOut } from 'lucide-react';

type HeaderProps = {
  userProfile: UserProfile | null;
  onLogout: () => void;
};

export default function Header({ userProfile, onLogout }: HeaderProps) {
  return (
    <header className="w-full p-4 border-b bg-card">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageSquareDashed className="h-8 w-8 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold font-headline">AnonyConnect</h1>
        </div>
        {userProfile && (
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-sm hidden sm:inline">Welcome, <span className="font-semibold">{userProfile.username}</span></span>
            <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
