import { shuffle } from '../kit/random';
import { VOCABULARY } from './vocabulary';

export const MIN_WORDS = 3;
export const MAX_WORDS = 10;
export const DEFAULT_WORDS = 5;
export const MIN_LENGTH = 2;
export const MAX_LENGTH = 12;

/* One page: the words in the order they are printed on the left, and the order of their pictures on the right
   (`right[k]` = index into `words`). Words are vocabulary keys, so a page survives a language switch. */
export interface WordsPage {
  words: string[];
  right: number[];
}

/* letters only: "м’яч" is 3, "ice cream" is 8 */
export const letterCount = (word: string): number => word.replace(/[^\p{L}]/gu, '').length;

/* vocabulary keys from the chosen picture sets whose word (in the current language) has min…max letters */
export function candidates(wordOf: (key: string) => string, min: number, max: number, sets: readonly string[]): string[] {
  return VOCABULARY.filter((v) => sets.includes(v.set))
    .map((v) => v.key)
    .filter((k) => {
      const n = letterCount(wordOf(k));
      return n >= min && n <= max;
    });
}

/* a shuffle that moves every picture off its word's row when it can, so no line goes straight across */
function derangement(n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  if (n < 2) return order;
  for (let attempt = 0; attempt < 50; attempt++) {
    const s = shuffle(order);
    if (s.every((v, i) => v !== i)) return s;
  }
  return order.slice(1).concat(0);
}

export function makePage(pool: string[], count: number): WordsPage {
  const words = shuffle(pool).slice(0, count);
  return { words, right: derangement(words.length) };
}
