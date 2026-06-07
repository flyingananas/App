import { describe, it, expect } from 'vitest';

export function calculateCheckpointTrigger(currentCount: number, threshold: number): { shouldTrigger: boolean, nextCount: number } {
  const next = currentCount + 1;
  return {
    shouldTrigger: next >= threshold,
    nextCount: next
  };
}

describe('Checkpoint Counter Logic', () => {
  it('increments but does not trigger below threshold', () => {
    const result = calculateCheckpointTrigger(13, 15);
    expect(result.nextCount).toBe(14);
    expect(result.shouldTrigger).toBe(false);
  });

  it('triggers when exactly hitting the threshold', () => {
    const result = calculateCheckpointTrigger(14, 15);
    expect(result.nextCount).toBe(15);
    expect(result.shouldTrigger).toBe(true);
  });

  it('triggers when exceeding the threshold', () => {
    const result = calculateCheckpointTrigger(16, 15);
    expect(result.nextCount).toBe(17);
    expect(result.shouldTrigger).toBe(true);
  });
});
