'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';

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

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-40">
      <div className="fixed inset-0 bg-black bg-opacity-50" aria-hidden="true" />
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chat Sessions
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 px-4 py-2 m-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5" />
            New Chat
          </button>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  currentChatId === session.id
                    ? 'bg-gray-100 dark:bg-gray-700'
                    : ''
                }`}
              >
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => onSelectChat(session.id)}
                >
                  <FolderIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white truncate">
                    {session.title}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteChat(session.id)}
                  className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <TrashIcon className="h-4 w-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
} 