
import { parseInnerThoughts } from '@/utils/messageUtils';

interface MessageTextProps {
  content: string;
  className?: string;
}

export function MessageText({ content, className = "text-sm" }: MessageTextProps) {
  const parts = parseInnerThoughts(content);
  
  return (
    <p className={className}>
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.isInnerThought ? "text-purple-300 italic font-light" : ""}
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}
