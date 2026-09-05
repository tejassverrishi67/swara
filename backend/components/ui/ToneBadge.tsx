'use client';

import { TONE_COLORS, TONE_DESCRIPTIONS, type Tone } from '@/data/tones';

interface ToneBadgeProps {
  tone: Tone;
  size?: 'sm' | 'md';
}

export function ToneBadge({ tone, size = 'md' }: ToneBadgeProps) {
  const colorClass = TONE_COLORS[tone];
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold tracking-wide uppercase ${colorClass} ${sizeClass}`}
      title={TONE_DESCRIPTIONS[tone]}
    >
      {tone}
    </span>
  );
}
