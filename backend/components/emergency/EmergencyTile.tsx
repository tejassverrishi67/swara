'use client';

import { Siren } from 'lucide-react';
import { useState } from 'react';
import { EMERGENCY_CONFIG } from '@/data/emergency';

interface EmergencyTileProps {
  onActivate: () => void;
  isActivating: boolean;
}

/**
 * Emergency tile — always visible, oversized, visually distinct.
 *
 * One tap → predefined phrase → TTS → immediate audio.
 *
 * Bypasses:
 *   ✗ concept selection
 *   ✗ LLM
 *   ✗ AI expansion
 *   ✗ candidate selection
 *   ✗ confirmation
 *
 * This is the deliberate exception to the confirmation rule.
 * The code path is entirely separate from the normal AI pipeline.
 */
export function EmergencyTile({ onActivate, isActivating }: EmergencyTileProps) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    if (isActivating) return;
    setIsPressed(true);
    onActivate();
    setTimeout(() => setIsPressed(false), 600);
  };

  return (
    <button
      id="emergency-tile"
      onClick={handleClick}
      disabled={isActivating}
      aria-label="Emergency: I need help right now"
      aria-live="assertive"
      className={[
        'flex flex-col items-center justify-center gap-2',
        'rounded-2xl border-2 px-5 py-4 font-bold',
        'transition-all duration-100',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-400 focus-visible:ring-offset-2',
        isActivating || isPressed
          ? 'border-red-400 bg-red-500 shadow-2xl shadow-red-900/80 scale-95'
          : 'border-red-600 bg-red-950/80 hover:bg-red-900/80 hover:border-red-500 shadow-lg shadow-red-950/60',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <Siren
          className={[
            'h-6 w-6 text-red-400',
            isActivating ? 'animate-pulse text-white' : '',
          ].join(' ')}
          aria-hidden="true"
        />
        <span className="text-base text-red-200 tracking-wide">
          {isActivating ? 'Calling for help…' : 'EMERGENCY'}
        </span>
      </div>
      <span className="text-xs font-normal text-red-300/80 text-center leading-tight max-w-[160px]">
        {EMERGENCY_CONFIG.displayText}
      </span>
    </button>
  );
}
