'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface KpugiBotChatProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'creator' | 'advertiser';
}

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function FormattedMarkdown({ content }: { content: string }) {
  return (
    <div className="text-slate-800 space-y-1 font-sans break-words min-w-0 max-w-full overflow-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-sm font-bold text-slate-900 mt-2 mb-1 break-words">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold text-slate-900 mt-2 mb-1 break-words">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mt-2 mb-1 break-words">{children}</h3>,
          p: ({ children }) => <p className="my-1 leading-relaxed break-words">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 my-1.5 text-slate-700 break-words">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 my-1.5 text-slate-700 break-words">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed break-words">{children}</li>,
          strong: ({ children }) => <strong className="font-bold text-slate-900 break-words">{children}</strong>,
          code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-slate-100 text-[11px] font-mono text-slate-800 border border-slate-200 break-all whitespace-pre-wrap">{children}</code>,
          pre: ({ children }) => <pre className="p-2.5 my-2 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono whitespace-pre-wrap break-all overflow-x-hidden max-w-full">{children}</pre>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-kpugi-blue font-semibold underline hover:text-blue-700 transition-colors break-all">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-kpugi-blue pl-3 py-1 my-2 bg-kpugi-blue/[0.04] rounded-r-lg text-slate-700 font-medium italic break-words">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto max-w-full my-2 rounded-xl border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-[11px] border-collapse bg-white">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">{children}</thead>,
          tr: ({ children }) => <tr className="border-b border-slate-100 last:border-0">{children}</tr>,
          th: ({ children }) => <th className="px-2 py-1 font-bold text-slate-900 break-words">{children}</th>,
          td: ({ children }) => <td className="px-2 py-1 text-slate-700 break-words">{children}</td>,
          hr: () => <hr className="my-2.5 border-slate-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default function KpugiBotChat({ isOpen, onClose, role }: KpugiBotChatProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from DB on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsFetchingHistory(true);
      fetch('/api/chat/history')
        .then((res) => res.json())
        .then((data) => {
          if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(
              data.messages.map((m: any) => ({
                id: m.id || String(Math.random()),
                role: m.role as 'user' | 'assistant',
                content: m.content,
              }))
            );
          }
        })
        .catch((err) => console.error('[KpugiBot] Failed to load history:', err))
        .finally(() => setIsFetchingHistory(false));
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await fetch('/api/chat/history', { method: 'DELETE' });
      setMessages([]);
      setErrorMessage(null);
    } catch (err) {
      console.error('Failed to clear history:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || input).trim();
    if (!content || isLoading) return;

    const userMessage: MessageItem = {
      id: String(Date.now()),
      role: 'user',
      content,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setErrorMessage(null);

    const botMessageId = String(Date.now() + 1);
    setMessages((prev) => [...prev, { id: botMessageId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userRole: role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No stream response received from server.');
      }

      let accumulatedText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) => (msg.id === botMessageId ? { ...msg, content: accumulatedText } : msg))
        );
      }
    } catch (err: any) {
      console.error('[KpugiBot Error]:', err);
      setErrorMessage(err.message || 'Failed to send message to KpugiBot.');
    } finally {
      setIsLoading(false);
    }
  };

  const creatorQuickQuestions = [
    'How do payouts & 1k view floors work?',
    'How do I clock in to a campaign?',
    'Why was my submission rejected or failed?',
    'How do I connect my social media accounts?',
  ];

  const advertiserQuickQuestions = [
    'How does 100% campaign escrow work?',
    'What is default CPM vs custom CPM?',
    'Can I manually approve creators before they post?',
    'What happens to unspent campaign budget?',
  ];

  const quickQuestions = role === 'creator' ? creatorQuickQuestions : advertiserQuickQuestions;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Chat Box */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 border-l border-kpugi-border animate-in slide-in-from-right duration-300 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/60 shadow-md text-white font-bold p-0.5 overflow-hidden">
              <Image src="/kpugi_bot_avatar.png" alt="KpugiBot" width={36} height={36} className="object-contain" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white tracking-tight">KpugiBot</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-kpugi-blue border border-kpugi-blue/30">
                  {role === 'creator' ? 'Creator Support' : 'Brand Support'}
                </span>
              </div>
              <p className="text-slate-400 text-xs">AI Platform Assistant • Always Online</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                disabled={isClearing}
                title="Clear chat history"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close support chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-slate-50/50 min-w-0">
          {/* Welcome Card if no messages */}
          {messages.length === 0 && !isFetchingHistory && (
            <div className="space-y-4 my-2">
              <div className="p-4 rounded-2xl bg-white border border-kpugi-border shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-kpugi-blue font-bold text-sm">
                  <span>👋 Hello! I am KpugiBot</span>
                </div>
                <p className="text-slate-600 text-xs leading-relaxed">
                  I know everything about Kpugi for both creators and brands — from campaign requirements, automated view floors, 100% escrow funding, to Paystack payouts. How can I help you today?
                </p>
              </div>

              {/* Suggested Questions */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  Suggested Questions
                </span>
                <div className="flex flex-col gap-2">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-left px-3.5 py-2.5 rounded-xl bg-white hover:bg-kpugi-blue/[0.04] border border-kpugi-border hover:border-kpugi-blue/30 text-xs text-kpugi-slate hover:text-kpugi-blue font-medium transition-all shadow-2xs flex items-center justify-between group"
                    >
                      <span>{q}</span>
                      <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-kpugi-blue group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading History State */}
          {isFetchingHistory && (
            <div className="flex items-center justify-center py-8 text-slate-400 text-xs gap-2">
              <svg className="w-4 h-4 animate-spin text-kpugi-blue" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading conversation history...</span>
            </div>
          )}

          {/* Message List */}
          {messages.map((m: MessageItem) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {isUser ? (
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold bg-slate-800 text-white">
                    You
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-slate-900 border border-slate-700/50 p-0.5 shadow-xs overflow-hidden">
                    <Image src="/kpugi_bot_avatar.png" alt="KpugiBot" width={28} height={28} className="object-contain" />
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-kpugi-blue text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-slate-800 border border-kpugi-border rounded-tl-none shadow-2xs space-y-1.5'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap font-sans font-medium">{m.content}</div>
                  ) : (
                    <FormattedMarkdown content={m.content} />
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator while streaming */}
          {isLoading && (
            <div className="flex gap-3 flex-row">
              <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-slate-900 border border-slate-700/50 p-0.5 shadow-xs overflow-hidden">
                <Image src="/kpugi_bot_avatar.png" alt="KpugiBot" width={28} height={28} className="object-contain" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-kpugi-border rounded-tl-none text-xs text-slate-400 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-kpugi-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-kpugi-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-kpugi-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-[11px] font-medium text-slate-500">KpugiBot is thinking...</span>
              </div>
            </div>
          )}

          {/* Error Message if API fails */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <span>⚠️ Connection Notice</span>
              </div>
              <p>{errorMessage}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white border-t border-kpugi-border shrink-0 space-y-2">
          {/* Quick chip bar if messages present */}
          {messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickQuestions.slice(0, 2).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-kpugi-blue/10 text-[11px] font-medium text-slate-600 hover:text-kpugi-blue transition-colors border border-slate-200"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask KpugiBot anything about Kpugi..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-kpugi-border text-xs focus:outline-none focus:ring-2 focus:ring-kpugi-blue/20 focus:border-kpugi-blue text-kpugi-ink placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-kpugi-blue hover:bg-blue-700 text-white font-medium text-xs shadow-md shadow-kpugi-blue/25 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center shrink-0"
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3 21l19-9L3 3l3 9zm0 0h7" />
                </svg>
              )}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 font-sans">
            🔒 KpugiBot is an official AI support assistant. Never share bank PINs or passwords.
          </p>
        </div>
      </div>
    </div>
  );
}
