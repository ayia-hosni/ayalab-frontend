import { describe, expect, it } from 'vitest';

import { formatJudgeValue } from './judge-format';

describe('formatJudgeValue', () => {
  it('formats lists like the examples', () => {
    expect(formatJudgeValue([5, 4, 3])).toBe('[5, 4, 3]');
    expect(formatJudgeValue([])).toBe('[]');
  });

  it('formats nested inputs and plain ints', () => {
    expect(formatJudgeValue([[1, 2, 6], 6])).toBe('[[1, 2, 6], 6]');
    expect(formatJudgeValue([[], 1])).toBe('[[], 1]');
    expect(formatJudgeValue(55)).toBe('55');
    expect(formatJudgeValue(0)).toBe('0');
  });

  it('formats booleans, including false', () => {
    expect(formatJudgeValue(true)).toBe('true');
    expect(formatJudgeValue(false)).toBe('false');
  });

  it('formats a missing value as empty', () => {
    expect(formatJudgeValue(null)).toBe('');
    expect(formatJudgeValue(undefined)).toBe('');
  });
});
