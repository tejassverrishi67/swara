// Core concept data model for SWARA AAC system.
// All tiles are data-driven — no tile is hardcoded as a separate component.

export const CONCEPT_CATEGORIES = [
  'people',
  'body-needs',
  'time-degree',
  'function',
  'social',
  'emotion',
] as const;

export type ConceptCategory = (typeof CONCEPT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ConceptCategory, string> = {
  'people': 'People',
  'body-needs': 'Body / Needs',
  'time-degree': 'Time / Degree',
  'function': 'Function',
  'social': 'Social',
  'emotion': 'Emotion',
};

export const CATEGORY_COLORS: Record<ConceptCategory, string> = {
  'people': 'category-people',
  'body-needs': 'category-body',
  'time-degree': 'category-time',
  'function': 'category-function',
  'social': 'category-social',
  'emotion': 'category-emotion',
};

/**
 * The semantic role of a concept within a message.
 * Used by the intent builder to create structured context for the LLM.
 */
export type SemanticType =
  | 'person'       // who is involved
  | 'body-part'    // physical location
  | 'symptom'      // physical or emotional state
  | 'need'         // something required
  | 'time'         // when
  | 'degree'       // how much / how often
  | 'action'       // what to do
  | 'social'       // social expression
  | 'emotion';     // emotional state

export interface Concept {
  id: string;
  label: string;
  category: ConceptCategory;
  /** Unicode emoji used as icon. No external image dependency. */
  icon: string;
  semanticType: SemanticType;
  /** Optional translations for supported languages (en is the default label). */
  languageVariants?: {
    hi?: string; // Hindi
    ta?: string; // Tamil
  };
}
