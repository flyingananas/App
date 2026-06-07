export type ParsedCommand =
  | { type: 'log', itemType: string, content: string, response: string }
  | { type: 'help', content: string }
  | { type: 'action', content: string }
  | { type: 'mark_this', content: string, explicitType?: string }
  | { type: 'park_thread' }
  | { type: 'return_parked' }
  | { type: 'log_hours' }
  | { type: 'watch_threads' }
  | { type: 'relax_watch' }
  | { type: 'system_check' }
  | { type: 'query_code', code: string }
  | { type: 'query_all_codes' }
  | { type: 'chat', content: string };

const CUE_WORDS = [
  { regex: /^(?:drop|drp):\s*(.*)/i, command: 'log', itemType: 'thought', response: 'noted' },
  { regex: /^(?:idea|ida):\s*(.*)/i, command: 'log', itemType: 'idea', response: 'noted' },
  { regex: /^(?:assist|hlp|ast):\s*(.*)/i, command: 'help' },
  { regex: /^(?:action|act):\s*(.*)/i, command: 'action' },
  { regex: /^(?:mark this as|mta)\s+\[([^\]]+)\]\s*(.*)/i, command: 'mark_this_explicit' }, // e.g. mark this as [decision]
  { regex: /^(?:mark this|mth)\s*(.*)/i, command: 'mark_this' },
  { regex: /^(?:park this|pth)/i, command: 'park_thread' },
  { regex: /^(?:return to parked|rtp)/i, command: 'return_parked' },
  { regex: /^(?:log hours|lgh)/i, command: 'log_hours' },
  { regex: /^(?:watch my threads closely today|wmc)/i, command: 'watch_threads' },
  { regex: /^(?:relax thread watch|rtw)/i, command: 'relax_watch' },
  { regex: /^(?:system check|syc)/i, command: 'system_check' },
  { regex: /^\?{3}$/i, command: 'query_all_codes' },
  { regex: /^\?codes$/i, command: 'query_all_codes' },
  { regex: /^\?([a-z]+)/i, command: 'query_code' },
];

export function parseInput(input: string): ParsedCommand {
  const trimmed = input.trim();

  for (const cue of CUE_WORDS) {
    const match = trimmed.match(cue.regex);
    if (match) {
      switch (cue.command) {
        case 'log':
          return { type: 'log', itemType: cue.itemType!, content: match[1], response: cue.response! };
        case 'help':
          return { type: 'help', content: match[1] };
        case 'action':
          return { type: 'action', content: match[1] };
        case 'mark_this_explicit':
          return { type: 'mark_this', explicitType: match[1], content: match[2] };
        case 'mark_this':
          return { type: 'mark_this', content: match[1] };
        case 'park_thread':
          return { type: 'park_thread' };
        case 'return_parked':
          return { type: 'return_parked' };
        case 'log_hours':
          return { type: 'log_hours' };
        case 'watch_threads':
          return { type: 'watch_threads' };
        case 'relax_watch':
          return { type: 'relax_watch' };
        case 'system_check':
          return { type: 'system_check' };
        case 'query_all_codes':
          return { type: 'query_all_codes' };
        case 'query_code':
          return { type: 'query_code', code: match[1] };
      }
    }
  }

  return { type: 'chat', content: trimmed };
}
