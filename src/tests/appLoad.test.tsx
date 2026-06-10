// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../renderer/src/App';

const mockApi = {
  pingDb: vi.fn(),
  getSettings: vi.fn(),
  getActiveProject: vi.fn(),
  getProjects: vi.fn(),
  getItems: vi.fn(),
};

describe('App Load Scenarios', () => {
  beforeEach(() => {
    (window as any).api = mockApi;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete (window as any).api;
  });

  it('renders loading state initially and resolves to error state if DB fails', async () => {
    mockApi.pingDb.mockResolvedValueOnce(false);

    render(<App />);

    // Initially loading
    expect(screen.getByText('Loading application data...')).toBeDefined();

    // Resolves to error
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeDefined();
      expect(screen.getByText('Database connection failed.')).toBeDefined();
    });
  });

  it('renders correctly with a normal project', async () => {
    mockApi.pingDb.mockResolvedValueOnce(true);
    mockApi.getActiveProject.mockResolvedValueOnce({ id: 'p1', name: 'Valid Project' });
    mockApi.getProjects.mockResolvedValueOnce([{ id: 'p1', name: 'Valid Project' }]);
    mockApi.getSettings.mockResolvedValueOnce({ mode: 'NEW' });
    mockApi.getItems.mockResolvedValueOnce([]);

    render(<App />);

    await waitFor(() => {
      // Prompt D header indicates successful load
      expect(screen.getByText('Prompt D')).toBeDefined();
      expect(screen.getByText('Valid Project')).toBeDefined();
    });
  });

  it('goes to onboarding flow if it is a fresh install (default project created but no mode setting)', async () => {
    mockApi.pingDb.mockResolvedValueOnce(true);
    mockApi.getActiveProject.mockResolvedValueOnce({ id: 'p_def', name: 'Default Project' });
    mockApi.getProjects.mockResolvedValueOnce([{ id: 'p_def', name: 'Default Project' }]);
    mockApi.getSettings.mockResolvedValueOnce({}); // No mode setting
    mockApi.getItems.mockResolvedValueOnce([]);

    render(<App />);

    await waitFor(() => {
      // Onboarding screen
      expect(screen.getByText('Welcome to Prompt D')).toBeDefined();
      expect(screen.getByText('What is the project name for this session?')).toBeDefined();
    });
  });
});
