// src/components/HighlightedText.tsx
import React from 'react';

interface HighlightedTextProps {
  text: string;
  spokenCharIndex: number;
  highlightClassName?: string; // e.g., 'text-yellow-400 font-bold'
  defaultClassName?: string;   // e.g., 'text-inherit'
}

const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  spokenCharIndex,
  highlightClassName = 'text-cyan-300', // Default highlight style
  defaultClassName = '',       // Default style for non-highlighted part
}) => {
  if (spokenCharIndex === undefined || spokenCharIndex < 0 || text === undefined || text === null) {
    // Nothing to highlight or invalid input, render plain text
    return <span className={defaultClassName}>{text}</span>;
  }

  // Ensure spokenCharIndex does not exceed text length
  const effectiveCharIndex = Math.min(spokenCharIndex, text.length);

  const spokenPart = text.substring(0, effectiveCharIndex);
  const remainingPart = text.substring(effectiveCharIndex);

  return (
    <>
      <span className={highlightClassName}>{spokenPart}</span>
      <span className={defaultClassName}>{remainingPart}</span>
    </>
  );
};

export default HighlightedText;
