// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../renderer/src/App';

const mockApi = {
  pingDb: vi.fn().mockResolvedValue(true),
  getSettings: vi.fn().mockResolvedValue({ mode: 'ONGOING', ai_enabled: 'true', feat_inferred: 'true' }),
  getActiveProject: vi.fn().mockResolvedValue({ id: 'p1', name: 'Project' }),
  getProjects: vi.fn().mockResolvedValue([{ id: 'p1', name: 'Project' }]),
  getItems: vi.fn().mockResolvedValue([]),
  getActiveThreads: vi.fn().mockResolvedValue([]),
  hasAIKey: vi.fn().mockResolvedValue(true),
  insertItem: vi.fn().mockResolvedValue({ id: 'mock-item-id', content: 'hello', type: 'thought' }),
  generateAI: vi.fn().mockResolvedValue('Mocked AI response'),
};

describe('IPC Serialization and AI Conversation Flow', () => {
  beforeEach(() => {
    (window as any).api = mockApi;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (window as any).api;
  });

  it('passes a serializable array to generateAI (not a function) when inferred logging is ON', async () => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();

    render(<App />);

    // Wait for the app to load
    await waitFor(() => {
      expect(screen.queryByText('Loading application data...')).toBeNull();
    });

    // Navigate to Chat
    const buttons = screen.getAllByRole('button');
    const chatButton = buttons.find(b => b.textContent === 'Chat');
    chatButton?.click();

    // Wait for the Chat UI to render
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type a message or command/i)).toBeDefined();
    });

    // Send a plain chat message
    const input = screen.getByPlaceholderText(/Type a message or command/i);
    fireEvent.change(input, { target: { value: 'Hello AI' } });

    const submitBtn = screen.getByText('Send');
    fireEvent.click(submitBtn);

    // Wait for AI call
    await waitFor(() => {
      expect(mockApi.generateAI).toHaveBeenCalled();
    });

    const generateArgs = mockApi.generateAI.mock.calls[0];
    const payload = generateArgs[0];

    // Payload should be an array of messages
    expect(Array.isArray(payload)).toBe(true);
    expect(payload.length).toBe(1);
    expect(payload[0]).toEqual({ role: 'user', content: 'Hello AI' });
    expect(typeof payload).not.toBe('function'); // Prove it won't trigger "object could not be cloned"

    // Confirm UI renders the assistant response
    await waitFor(() => {
      expect(screen.getByText('Mocked AI response')).toBeDefined();
    });
  });
});
