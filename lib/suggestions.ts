import { normalizeName } from "./string.ts";
import type { Suggestion } from "./api.ts";

export function findCorrectSuggestion(
  suggestions: Suggestion[],
  targetName: string
): Suggestion | null {
  const normalizedTarget = normalizeName(targetName);

  for (const s of suggestions) {
    if (normalizeName(s.value) === normalizedTarget) {
      return s;
    }
  }

  for (const s of suggestions) {
    const normalizedSugg = normalizeName(s.value);
    if (
      normalizedTarget.includes(normalizedSugg) ||
      normalizedSugg.includes(normalizedTarget)
    ) {
      return s;
    }
  }

  return null;
}
