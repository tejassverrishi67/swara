'use client';

/**
 * Manages the user's selected concept strip.
 *
 * On every change, broadcasts the updated concepts via BroadcastChannel
 * so the caregiver view updates in real time — before any sentence is spoken.
 */
import { useReducer, useCallback, useEffect } from 'react';
import type { Concept } from '@/types/concept';
import type { SelectedConcept } from '@/types/intent';
import type { CaregiverMessage } from '@/types/caregiver';

const CHANNEL_NAME = 'swara-caregiver-sync';
const MAX_CONCEPTS = 8;

type Action =
  | { type: 'ADD'; concept: Concept }
  | { type: 'REMOVE'; id: string }
  | { type: 'CLEAR' };

function selectedConceptsReducer(state: SelectedConcept[], action: Action): SelectedConcept[] {
  switch (action.type) {
    case 'ADD': {
      if (state.length >= MAX_CONCEPTS) return state;
      if (state.some((c) => c.id === action.concept.id)) return state;
      return [
        ...state,
        {
          id: action.concept.id,
          label: action.concept.label,
          semanticType: action.concept.semanticType,
          category: action.concept.category,
        },
      ];
    }
    case 'REMOVE':
      return state.filter((c) => c.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function useConceptSelection() {
  const [selectedConcepts, dispatch] = useReducer(selectedConceptsReducer, []);

  // Broadcast concept updates to the caregiver view
  const broadcast = useCallback((concepts: SelectedConcept[]) => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const message: CaregiverMessage = { type: 'CONCEPTS_UPDATE', concepts };
      channel.postMessage(message);
      channel.close();
    } catch {
      // BroadcastChannel not available — caregiver sync disabled
    }
  }, []);

  const broadcastCleared = useCallback(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const message: CaregiverMessage = { type: 'CLEARED' };
      channel.postMessage(message);
      channel.close();
    } catch {}
  }, []);

  const broadcastSpeaking = useCallback((text: string, isLiteral: boolean) => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    try {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      const message: CaregiverMessage = { type: 'SPEAKING', text, isLiteral };
      channel.postMessage(message);
      channel.close();
    } catch {}
  }, []);

  const addConcept = useCallback(
    (concept: Concept) => {
      dispatch({ type: 'ADD', concept });
    },
    []
  );

  const removeConcept = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const clearConcepts = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    broadcastCleared();
  }, [broadcastCleared]);

  const isSelected = useCallback(
    (id: string) => selectedConcepts.some((c) => c.id === id),
    [selectedConcepts]
  );

  // Broadcast whenever concepts change (after state update)
  useEffect(() => {
    broadcast(selectedConcepts);
  }, [selectedConcepts, broadcast]);

  return {
    selectedConcepts,
    addConcept,
    removeConcept,
    clearConcepts,
    isSelected,
    broadcastSpeaking,
    canAddMore: selectedConcepts.length < MAX_CONCEPTS,
    isEmpty: selectedConcepts.length === 0,
  };
}
