export type LghState = 'IDLE' | 'AWAITING_DATE' | 'AWAITING_ITEMS' | 'AWAITING_DURATION' | 'AWAITING_NOTES';

export interface LghData {
  date: string;
  itemsWorked: string;
  duration: string;
  notes: string | null;
}

export class LghFlow {
  private state: LghState = 'IDLE';
  private data: Partial<LghData> = {};

  startFlow(lastEntryDate?: string): { prompt: string, state: LghState } {
    this.state = 'AWAITING_DATE';
    this.data = {};
    const today = new Date().toISOString().split('T')[0];

    let prompt = 'Date?';
    if (lastEntryDate === today) {
      this.data.date = today;
      prompt = `Date? (Pre-filled to today: ${today}. Type 'ok' to confirm or provide a new date.)`;
    }

    return { prompt, state: this.state };
  }

  processInput(input: string): { prompt?: string, state: LghState, completedData?: LghData } {
    const trimmed = input.trim();

    switch (this.state) {
      case 'AWAITING_DATE':
        if (trimmed.toLowerCase() === 'ok' && this.data.date) {
          // Keep pre-filled
        } else if (trimmed) {
          this.data.date = trimmed;
        } else {
          return { prompt: 'Please provide a valid date.', state: this.state };
        }
        this.state = 'AWAITING_ITEMS';
        return { prompt: 'Items worked on?', state: this.state };

      case 'AWAITING_ITEMS':
        if (!trimmed) {
          return { prompt: 'Please provide items worked on.', state: this.state };
        }
        this.data.itemsWorked = trimmed;
        this.state = 'AWAITING_DURATION';
        return { prompt: 'Duration? (e.g. 2hrs, 90min)', state: this.state };

      case 'AWAITING_DURATION':
        if (!trimmed) {
          return { prompt: 'Please provide a duration.', state: this.state };
        }
        this.data.duration = trimmed;
        this.state = 'AWAITING_NOTES';
        return { prompt: 'Notes? (Type "none" to skip)', state: this.state };

      case 'AWAITING_NOTES':
        this.data.notes = trimmed.toLowerCase() === 'none' ? null : trimmed;
        this.state = 'IDLE';
        const completedData = this.data as LghData;
        this.data = {};
        return { state: this.state, completedData };

      default:
        return { state: this.state };
    }
  }

  cancelFlow(): void {
    this.state = 'IDLE';
    this.data = {};
  }

  getState(): LghState {
    return this.state;
  }
}
