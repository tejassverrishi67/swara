'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { CaregiverBoard } from '@/components/caregiver/CaregiverBoard';
import { useCaregiverSync } from '@/hooks/useCaregiverSync';

/**
 * Caregiver live view page.
 *
 * Receives real-time concept updates from the user page via BroadcastChannel.
 * Open this in a second tab/window alongside the main SWARA interface.
 *
 * The caregiver sees intent forming BEFORE the sentence is spoken.
 * This is a read-only observation interface — it cannot modify the user's message.
 */
export default function CaregiverPage() {
  const { state, isSupported } = useCaregiverSync();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-700 shadow-lg shadow-violet-950/60">
              <Eye className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Caregiver View</h1>
              <p className="text-xs text-slate-500">Live intent monitoring</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Go back to SWARA main screen"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Main
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        {/* Instruction */}
        <div className="mb-6 rounded-2xl border border-violet-700/30 bg-violet-950/20 px-4 py-3">
          <p className="text-sm text-violet-300">
            <span className="font-semibold">How to use:</span> Open the main SWARA screen in another
            tab or window. Concepts selected there will appear here in real time — before any
            sentence is generated or spoken.
          </p>
        </div>

        <CaregiverBoard state={state} isSupported={isSupported} />
      </main>
    </div>
  );
}
