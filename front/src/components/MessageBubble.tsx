import { Message } from '@/types/chat';
import MarkdownRenderer from './MarkdownRenderer';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`relative max-w-[80%] ${
        isUser 
          ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 rounded-2xl rounded-br-md' 
          : 'bg-white/[0.02] border border-white/[0.05] rounded-2xl rounded-bl-md'
      } backdrop-blur-xl px-5 py-4`}>
        {isUser ? (
          <p className="text-sm text-white/80">{message.content}</p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
        
        <div className={`flex items-center gap-2 mt-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-white/20">
            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
