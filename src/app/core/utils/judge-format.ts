/** A judged value: an int, a boolean, or a (possibly nested) list of them, e.g. [[1, 2, 6], 6]. */
export type JudgeValue = number | boolean | JudgeValue[] | null | undefined;

/** Text for a test-case input/expected/actual value: "[1, 2, 3]", "[[1, 2], 6]", "true", "55", or "" when absent. */
export function formatJudgeValue(value: JudgeValue): string {
  if (value === null || value === undefined) return '';
  return Array.isArray(value) ? `[${value.map(formatJudgeValue).join(', ')}]` : String(value);
}
