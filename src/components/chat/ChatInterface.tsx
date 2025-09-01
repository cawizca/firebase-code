
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/page';
import type { Conversation } from '@/app/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Flag, LogOut, Send, UserX, Info, Loader2 } from 'lucide-react';
import { sendMessageAction, reportUserAction, endChatAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getDbInstance } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

type ChatMessage = {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: Timestamp;
};

type DisplayMessage = {
  id: string;
  sender: 'user' | 'stranger';
  username: string;
  text: string;
  timestamp: number;
}

type ChatInterfaceProps = {
  conversationId: string;
  userProfile: UserProfile;
  conversation: Conversation;
};

export default function ChatInterface({ conversationId, userProfile, conversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  
  const strangerId = conversation.participants.find(p => p !== userProfile.id);
  const strangerUsername = strangerId ? conversation.participantUsernames[strangerId] : 'Stranger';


  useEffect(() => {
    let unsubscribe: () => void;
    
    const setupSubscription = async () => {
        try {
            const db = await getDbInstance();
            const messagesRef = collection(db, 'conversations', conversationId, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'asc'));

            unsubscribe = onSnapshot(q, (querySnapshot) => {
              const msgs: DisplayMessage[] = querySnapshot.docs.map((doc) => {
                const data = doc.data() as ChatMessage;
                return {
                  id: doc.id,
                  sender: data.userId === userProfile.id ? 'user' : 'stranger',
                  username: data.username,
                  text: data.text,
                  timestamp: data.timestamp?.toMillis() || Date.now(),
                };
              });
              setMessages(msgs);
            }, (error) => {
                console.error("Chat subscription error:", error);
                toast({ variant: 'destructive', title: 'Connection Error', description: 'Lost connection to the chat. Please refresh.'});
            });

        } catch (error) {
            console.error("Error setting up chat subscription:", error);
            toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not connect to the chat.'});
        }
    }
    
    setupSubscription();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [conversationId, userProfile.id, toast]);

  // Auto-scroll to bottom
  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
        scrollViewport.scrollTo({
            top: scrollViewport.scrollHeight,
            behavior: 'smooth',
      });
    }
  }, [messages]);
  

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);

    const result = await sendMessageAction(conversationId, newMessage, userProfile.username, userProfile.id);

    if (result.success) {
      setNewMessage('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Message Moderated',
        description: result.error,
      });
    }

    setIsSending(false);
  };
  
  const handleEndChat = async () => {
    await endChatAction(conversationId);
    toast({
        title: "Chat Ended",
        description: "You have left the conversation.",
    })
    router.push('/');
  }

  const handleBlockUser = async () => {
    // In a real app, you'd add the other user's ID to a "blocked" list in the user's profile.
    await endChatAction(conversationId);
    toast({
        title: "User Blocked",
        description: `You will not be matched with ${strangerUsername} again.`,
    })
    router.push('/');
  }
  
  const handleReportSubmit = async () => {
    if (!reportReason) {
        toast({ variant: "destructive", title: "Please select a reason for reporting."});
        return;
    }
    
    const result = await reportUserAction(reportReason, messages, strangerUsername, conversationId);
    
    if (result.success) {
        toast({
            title: "Report Submitted",
            description: result.message,
        });
        setIsReportDialogOpen(false);
        setReportReason("");
        setReportDescription("");
        router.push('/');
    } else {
        toast({
            variant: "destructive",
            title: "Failed to submit report",
            description: "Please try again.",
        })
    }
  }


  return (
    <Card className="w-full h-full flex flex-col shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between border-b p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{strangerUsername.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{strangerUsername}</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
           <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm"><LogOut className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">End Chat</span></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to end this chat?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. You will be disconnected from the stranger.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndChat} className={cn(buttonVariants({variant: "destructive"}))}>End Chat</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive hover:text-destructive hover:bg-destructive/10"><Flag className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Report</span></Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Report {strangerUsername}</DialogTitle>
                        <DialogDescription>
                            Help us keep the community safe. What's wrong with this user?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <RadioGroup value={reportReason} onValueChange={setReportReason}>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="inappropriate_content" id="r1" /><Label htmlFor="r1">Inappropriate Content</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="harassment" id="r2" /><Label htmlFor="r2">Harassment or Bullying</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="spam" id="r3" /><Label htmlFor="r3">Spam or Scams</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="underage_user" id="r4" /><Label htmlFor="r4">Suspected Underage User</Label></div>
                        </RadioGroup>
                        <Textarea placeholder="Provide additional details (optional)" value={reportDescription} onChange={e => setReportDescription(e.target.value)} />
                    </div>
                     <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleReportSubmit}>Submit Report</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive hover:text-destructive hover:bg-destructive/10"><UserX className="mr-0 sm:mr-2 h-4 w-4" /><span className="hidden sm:inline">Block</span></Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Block {strangerUsername}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You won't be matched with this user again. This will also end the current chat.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBlockUser} className={cn(buttonVariants({variant: "destructive"}))}>Block User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-4 p-4">
            {messages.length === 0 ? (
                <div className="flex items-start gap-2.5 text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg border border-accent/20">
                    <Info className="h-5 w-5 mt-1 text-accent flex-shrink-0" />
                    <p>You are now connected with a stranger. Say hello! Your messages are checked for safety. Personal info is not allowed.</p>
                </div>
            ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'stranger' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 shadow-md ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        } ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{msg.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            autoComplete="off"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()} aria-label="Send Message">
            {isSending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
