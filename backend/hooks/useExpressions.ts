'use client';

/**
 * Manages the AI expression generation flow.
 *
 * Calls POST /api/expand with the selected concepts.
 * Tracks loading state, error state, and the 3 candidate expressions.
 * The selected expression is tracked here — used by useTTS for confirmation.
 */
import { useState, useCallback } from 'react';
import type { SelectedConcept } from '@/types/intent';
import type { Expression, ExpandResponse } from '@/types/expression';

type ExpressionsState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; expressions: Expression[]; usedFallback: boolean }
  | { status: 'error'; message: string };

export function useExpressions() {
  const [state, setState] = useState<ExpressionsState>({ status: 'idle' });
  const [selectedExpression, setSelectedExpression] = useState<Expression | null>(null);

  const generateExpressions = useCallback(
    async (concepts: SelectedConcept[], language: string = 'en') => {
      if (concepts.length === 0) return;

      setState({ status: 'loading' });
      setSelectedExpression(null);

      try {
        const res = await fetch('/api/expand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ concepts, language }),
        });

        const data: ExpandResponse = await res.json();

        if (!res.ok) {
          setState({ status: 'error', message: 'Failed to generate expressions.' });
          return;
        }

        setState({
          status: 'success',
          expressions: data.expressions,
          usedFallback: data.usedFallback,
        });
      } catch {
        setState({
          status: 'error',
          message: 'Network error. Using literal speech may help.',
        });
      }
    },
    []
  );

  const selectExpression = useCallback((expression: Expression) => {
    setSelectedExpression(expression);
  }, []);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
    setSelectedExpression(null);
  }, []);

  return {
    state,
    selectedExpression,
    generateExpressions,
    selectExpression,
    reset,
    isLoading: state.status === 'loading',
    hasExpressions: state.status === 'success',
    expressions: state.status === 'success' ? state.expressions : [],
    usedFallback: state.status === 'success' ? state.usedFallback : false,
  };
}
