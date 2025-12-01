import React from 'react';
import { Message } from '../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  // WhatsApp Colors:
  // Incoming (User/Me): #005c4b (Dark Green)
  // Incoming (Others): #202c33 (Dark Gray)
  
  return (
    <div className={`w-full flex ${message.isMe ? 'justify-end' : 'justify-start'} mb-3 px-3`}>
      <div 
        className={`
          max-w-[80%] rounded-lg p-2 text-sm text-white shadow-sm relative
          ${message.isMe 
            ? 'bg-[#005c4b] rounded-tr-none' 
            : 'bg-[#202c33] rounded-tl-none'}
        `}
      >
        {!message.isMe && (
           <div className="text-[10px] font-bold text-[#f7ad19] mb-1 leading-tight">
             {message.sender}
           </div>
        )}
        <p className="leading-snug break-words">
          {message.content}
        </p>
        <div className="text-[10px] text-gray-400 text-right mt-1 flex justify-end gap-1 items-center">
            <span>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.isMe && (
                <span className={`text-blue-400 font-bold`}>✓✓</span>
            )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;