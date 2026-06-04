import React from 'react';

type Props = { className?: string };

// Blue happy smiley — echoes the hand-drawn double outline of the DUERME COOL logo
export const BlueSmiley: React.FC<Props> = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Smiley azul">
    <path
      d="M32 5C18 5 6 16 6 31s11 28 26 28 26-12 26-28S46 5 32 5z"
      fill="#aac1e0"
      stroke="#0f0f0f"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <path
      d="M11 30C10 18 20 9 32 9s22 9 21 22"
      fill="none"
      stroke="#0f0f0f"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M19 27c1.6-3 5.4-3 7 0" fill="none" stroke="#0f0f0f" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M38 27c1.6-3 5.4-3 7 0" fill="none" stroke="#0f0f0f" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M20 38c4 7 20 7 24 0" fill="none" stroke="#0f0f0f" strokeWidth="3.6" strokeLinecap="round" />
  </svg>
);

// Orange winking smiley
export const OrangeWink: React.FC<Props> = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Smiley naranja guiñando">
    <path
      d="M32 5C18 5 6 16 6 31s11 28 26 28 26-12 26-28S46 5 32 5z"
      fill="#f09e75"
      stroke="#0f0f0f"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    <circle cx="23" cy="27" r="3.2" fill="#0f0f0f" />
    <path d="M39 24l6 3-6 3" fill="none" stroke="#0f0f0f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 38c4 7 20 7 24 0" fill="none" stroke="#0f0f0f" strokeWidth="3.6" strokeLinecap="round" />
  </svg>
);
