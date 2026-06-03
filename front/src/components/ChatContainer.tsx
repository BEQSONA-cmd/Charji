import { useEffect, useRef } from 'react';
import { useChat } from '@/hooks/useChat';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

export default function ChatContainer() {
  const { messages, currentBotMessage, sendUserMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentBotMessage]);

  return (
    <div className="h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl h-[90vh] glass-input rounded-3xl flex flex-col relative overflow-hidden">
        {/* Ambient light effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-400 rounded-full border-2 border-[#0a0a1a]">
                  <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-75" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-light tracking-wider text-white/90">CHARGI</h1>
                <p className="text-xs text-purple-400/60 tracking-widest uppercase">Neural Interface</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-purple-400/60">v2.0</span>
              <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {messages.length === 0 && !currentBotMessage && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="floating mb-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center relative pulse-ring">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 border border-white/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-purple-400/30 animate-pulse" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-center mb-12">
                <p className="text-2xl font-light text-white/80 tracking-wide">Initialize Conversation</p>
                <p className="text-sm text-purple-400/40">Neural link established. Ready for queries.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  { text: "Quantum Analysis", icon: "⚛️" },
                  { text: "Code Synthesis", icon: "⚡" },
                  { text: "Data Stream", icon: "🌊" },
                  { text: "Neural Query", icon: "🧠" }
                ].map(({ text, icon }) => (
                  <button
                    key={text}
                    onClick={() => sendUserMessage(text)}
                    className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-purple-500/20 transition-all duration-500 text-left"
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />
                    <div className="relative flex items-center gap-3">
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors">{text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {currentBotMessage && (
            <MessageBubble
              message={{
                id: 'current',
                type: 'bot',
                content: currentBotMessage,
                timestamp: new Date(),
              }}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={sendUserMessage} />
      </div>
    </div>
  );
}
