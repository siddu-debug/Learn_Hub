'use client';
import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Send, ChevronLeft, Brain, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input, Skeleton, Card, CardContent } from '@/components/ui/index';
import { aiApi, coursesApi } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Message { role: 'user' | 'assistant'; content: string; citations?: any[]; }

export default function TutorPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: course } = useQuery({ queryKey: ['course', id], queryFn: () => coursesApi.get(id) });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await aiApi.chat(id, { message: userMsg, sessionId });
      setSessionId(res.sessionId);
      setMessages(prev => [...prev, { role: 'assistant', content: res.message, citations: res.citations }]);
    } catch (err: any) {
      toast.error('Failed to get response');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/courses/${id}`}><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm">AI Tutor</h1>
            <p className="text-xs text-muted-foreground truncate max-w-xs">{course?.title}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-semibold mb-2">Ask me anything about this course</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">I'm grounded in the course content and will cite relevant lessons in my answers.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm max-w-lg">
              {['What are the main concepts covered?', 'Explain the key topics in simple terms', 'What should I study first?', 'Give me a summary of this course'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-left p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Brain className="h-4 w-4 text-white" />
              </div>
            )}
            <div className={cn('max-w-[80%] space-y-2', msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn('rounded-2xl px-4 py-3 text-sm', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.citations && msg.citations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-1">Sources:</p>
                  {msg.citations.slice(0, 2).map((c: any, ci: number) => (
                    <div key={ci} className="text-xs bg-muted/50 rounded-lg px-3 py-1.5 border">
                      <span className="font-medium">{c.lessonTitle || 'Lesson'}</span>
                      {c.chapterTitle && <span className="text-muted-foreground"> · {c.chapterTitle}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this course..."
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-2">Answers are grounded in course content only</p>
      </div>
    </div>
  );
}
