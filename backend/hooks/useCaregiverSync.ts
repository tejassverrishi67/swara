'use client';

/**
 * Caregiver synchronization via BroadcastChannel.
 *
 * Used on the CAREGIVER PAGE to receive concept updates from the user page.
 *
 * Architecture (no server required):
 *   USER PAGE → BroadcastChannel.postMessage() → CAREGIVER PAGE → setState → render
 *
 * The caregiver sees intent forming in real time — before any sentence is spoken.
 *
 * Handles:
 * - channel creation and cleanup
 * - unsupported BroadcastChannel environments (isSupported = false)
 * - all message types from CaregiverMessage union
 */
import { useState, useEffect, useCallback } from 'react';
import type { CaregiverState, CaregiverMessage } from '@/types/caregiver';
import type { Expression } from '@/types/expression';

const CHANNEL_NAME = 'swara-caregiver-sync';

const initialState: CaregiverState = {
  concepts: [],
  selectedExpression: null,
  lastSpoken: null,
  isConnected: false,
};

export function useCaregiverSync() {
  const [state, setState] = useState<CaregiverState>(initialState);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      setIsSupported(false);
      return;
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);
    setState((prev) => ({ ...prev, isConnected: true }));

    channel.onmessage = (event: MessageEvent<CaregiverMessage>) => {
      const message = event.data;

      switch (message.type) {
        case 'CONCEPTS_UPDATE':
          setState((prev) => ({ ...prev, concepts: message.concepts }));
          break;

        case 'EXPRESSION_SELECTED':
          setState((prev) => ({ ...prev, selectedExpression: message.expression }));
          break;

        case 'SPEAKING':
          setState((prev) => ({
            ...prev,
            lastSpoken: { text: message.text, isLiteral: message.isLiteral },
          }));
          break;

        case 'CLEARED':
          setState((prev) => ({
            ...prev,
            concepts: [],
            selectedExpression: null,
          }));
          break;
      }
    };

    channel.onmessageerror = () => {
      console.warn('[useCaregiverSync] Message deserialization error');
    };

    return () => {
      channel.close();
      setState((prev) => ({ ...prev, isConnected: false }));
    };
  }, []);

  return { state, isSupported };
}
