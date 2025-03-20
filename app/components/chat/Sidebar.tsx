'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  currentChatId?: string;
}

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  currentChatId,
}: SidebarProps) {
  const { data: session } = useSession();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  // Fetch chat sessions when component mounts
  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const response = await fetch('/api/chat/sessions');
      if (!response.ok) throw new Error('Failed to fetch chat sessions');
      const data = await response.json();
      setChatSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat History</h2>
      </div>
      
      <div className="p-4">
        <Button 
          onClick={onNewChat} 
          className="w-full"
          variant="default"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2">
          {chatSessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer",
                currentChatId === session.id && "bg-accent"
              )}
            >
              <div
                className="flex items-center gap-2 flex-1 min-w-0"
                onClick={() => onSelectChat(session.id)}
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate">
                  {session.title || 'Untitled Chat'}
                </span>
              </div>
              <Button
                onClick={() => onDeleteChat(session.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  // Desktop view
  if (window.innerWidth >= 768) {
    return (
      <div className={cn(
        "w-[300px] border-r bg-background transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarContent}
      </div>
    );
  }

  // Mobile view with Sheet
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Chat History</SheetTitle>
        </SheetHeader>
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );
} 