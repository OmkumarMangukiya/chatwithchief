'use client';

import { useSession } from 'next-auth/react';
import LoginForm from './components/auth/LoginForm';
import ChatInterface from './components/chat/ChatInterface';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return <ChatInterface />;
}
