import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, systemMessage, chatId } = await request.json();

    // Get or create chat session
    let chatSession;
    if (chatId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
        },
      });

      if (!chatSession) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        );
      }
    } else {
      chatSession = await prisma.chatSession.create({
        data: {
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          userId: session.user.id,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        chatSessionId: chatSession.id,
      },
    });

    // Prepare messages for OpenAI
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemMessage || 'You are a helpful AI assistant.',
      },
      ...(await prisma.message.findMany({
        where: {
          chatSessionId: chatSession.id,
        },
        orderBy: {
          createdAt: 'asc',
        },
      })).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
    ];

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
    });

    const assistantMessage = completion.choices[0]?.message?.content || '';

    // Save assistant message
    await prisma.message.create({
      data: {
        content: assistantMessage,
        role: 'assistant',
        chatSessionId: chatSession.id,
      },
    });

    return NextResponse.json({
      message: assistantMessage,
      chatId: chatSession.id,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 