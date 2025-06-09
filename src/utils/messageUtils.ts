
export const isAudioUrl = (content: string): string | null => {
  const audioUrlRegex = /(https:\/\/files\.shapes\.inc\/[^\s]+\.mp3)/g;
  const match = content.match(audioUrlRegex);
  return match ? match[0] : null;
};

export const isImageUrl = (content: string): string | null => {
  const imageUrlRegex = /(https:\/\/files\.shapes\.inc\/[^\s]+\.(png|jpg|jpeg|gif))/gi;
  const match = content.match(imageUrlRegex);
  return match ? match[0] : null;
};

export const parseInnerThoughts = (text: string) => {
  const parts: Array<{ text: string; isInnerThought: boolean }> = [];
  const regex = /(\*[^*]+\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the inner thought
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      if (beforeText) {
        parts.push({ text: beforeText, isInnerThought: false });
      }
    }
    
    // Add the inner thought (remove asterisks)
    const innerThought = match[1].slice(1, -1); // Remove * from both ends
    parts.push({ text: innerThought, isInnerThought: true });
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text after last inner thought
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (remainingText) {
      parts.push({ text: remainingText, isInnerThought: false });
    }
  }
  
  // If no inner thoughts found, return the whole text as regular
  if (parts.length === 0) {
    parts.push({ text, isInnerThought: false });
  }
  
  return parts;
};
