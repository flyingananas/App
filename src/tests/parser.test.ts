import { describe, it, expect } from 'vitest';
import { parseInput } from '../renderer/src/lib/parser';

describe('Cue-Word Parser', () => {
  it('parses drop/drp command', () => {
    expect(parseInput('drop: some thought')).toEqual({
      type: 'log', itemType: 'thought', content: 'some thought', response: 'noted'
    });
    expect(parseInput('drp: some thought')).toEqual({
      type: 'log', itemType: 'thought', content: 'some thought', response: 'noted'
    });
  });

  it('parses idea/ida command', () => {
    expect(parseInput('idea: new concept')).toEqual({
      type: 'log', itemType: 'idea', content: 'new concept', response: 'noted'
    });
    expect(parseInput('ida: new concept')).toEqual({
      type: 'log', itemType: 'idea', content: 'new concept', response: 'noted'
    });
  });

  it('parses assist/hlp/ast command', () => {
    expect(parseInput('assist: help me')).toEqual({ type: 'help', content: 'help me' });
    expect(parseInput('hlp: help me')).toEqual({ type: 'help', content: 'help me' });
    expect(parseInput('ast: help me')).toEqual({ type: 'help', content: 'help me' });
  });

  it('parses action/act command', () => {
    expect(parseInput('action: do something')).toEqual({ type: 'action', content: 'do something' });
    expect(parseInput('act: do something')).toEqual({ type: 'action', content: 'do something' });
  });

  it('parses mark this / mth', () => {
    expect(parseInput('mark this')).toEqual({ type: 'mark_this', content: '' });
    expect(parseInput('mth additional text')).toEqual({ type: 'mark_this', content: 'additional text' });
  });

  it('parses mark this as [x] / mta', () => {
    expect(parseInput('mark this as [decision] decided this')).toEqual({
      type: 'mark_this', explicitType: 'decision', content: 'decided this'
    });
    expect(parseInput('mta [task] new task')).toEqual({
      type: 'mark_this', explicitType: 'task', content: 'new task'
    });
  });

  it('parses thread commands', () => {
    expect(parseInput('park this')).toEqual({ type: 'park_thread' });
    expect(parseInput('pth')).toEqual({ type: 'park_thread' });
    expect(parseInput('return to parked')).toEqual({ type: 'return_parked' });
    expect(parseInput('rtp')).toEqual({ type: 'return_parked' });
  });

  it('parses log hours / lgh', () => {
    expect(parseInput('log hours')).toEqual({ type: 'log_hours' });
    expect(parseInput('lgh')).toEqual({ type: 'log_hours' });
  });

  it('parses system check / syc', () => {
    expect(parseInput('system check')).toEqual({ type: 'system_check' });
    expect(parseInput('syc')).toEqual({ type: 'system_check' });
  });

  it('parses queries', () => {
    expect(parseInput('???')).toEqual({ type: 'query_all_codes' });
    expect(parseInput('?codes')).toEqual({ type: 'query_all_codes' });
    expect(parseInput('?drp')).toEqual({ type: 'query_code', code: 'drp' });
  });

  it('defaults to chat for unrecognized input', () => {
    expect(parseInput('hello world')).toEqual({ type: 'chat', content: 'hello world' });
  });
});
