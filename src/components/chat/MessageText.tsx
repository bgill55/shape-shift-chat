
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
          className={part.isInnerThought ? "text-amber-600 italic font-dark" : ""}
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}
