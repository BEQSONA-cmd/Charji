import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className="relative p-4 border-t border-white/5">
      <div className="relative flex items-end gap-3 glass-input rounded-2xl p-1">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Transmit message..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none text-white/80 placeholder-white/20 resize-none px-4 py-3 text-sm max-h-32"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="m-1 p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-white/10 hover:from-purple-500/30 hover:to-blue-500/30 disabled:opacity-30 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
