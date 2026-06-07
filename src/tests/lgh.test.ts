import { describe, it, expect, beforeEach } from 'vitest';
import { LghFlow } from '../renderer/src/lib/lghFlow';

describe('Log Hours (lgh) Flow', () => {
  let flow: LghFlow;

  beforeEach(() => {
    flow = new LghFlow();
  });

  it('completes the four-question flow correctly', () => {
    const start = flow.startFlow();
    expect(start.state).toBe('AWAITING_DATE');
    expect(start.prompt).toBe('Date?');

    const d1 = flow.processInput('2023-10-10');
    expect(d1.state).toBe('AWAITING_ITEMS');
    expect(d1.prompt).toBe('Items worked on?');

    const d2 = flow.processInput('Fixed parser bug');
    expect(d2.state).toBe('AWAITING_DURATION');
    expect(d2.prompt).toBe('Duration? (e.g. 2hrs, 90min)');

    const d3 = flow.processInput('2h');
    expect(d3.state).toBe('AWAITING_NOTES');
    expect(d3.prompt).toBe('Notes? (Type "none" to skip)');

    const d4 = flow.processInput('Was easy');
    expect(d4.state).toBe('IDLE');
    expect(d4.completedData).toEqual({
      date: '2023-10-10',
      itemsWorked: 'Fixed parser bug',
      duration: '2h',
      notes: 'Was easy',
    });
  });

  it('handles "none" for notes', () => {
    flow.startFlow();
    flow.processInput('2023-10-10');
    flow.processInput('items');
    flow.processInput('1h');
    const result = flow.processInput('none');
    expect(result.completedData?.notes).toBeNull();
  });

  it('pre-fills today\'s date if last entry was today', () => {
    const today = new Date().toISOString().split('T')[0];
    const start = flow.startFlow(today);
    expect(start.prompt).toContain('Pre-filled to today');

    const d1 = flow.processInput('ok');
    expect(d1.state).toBe('AWAITING_ITEMS');

    flow.processInput('items');
    flow.processInput('1h');
    const result = flow.processInput('none');
    expect(result.completedData?.date).toBe(today);
  });
});
