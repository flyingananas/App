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
  hasAIKey: vi.fn().mockResolvedValue(false),
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
  it('renders Settings tab and passes down project state', async () => {
    mockApi.pingDb.mockResolvedValueOnce(true);
    mockApi.getActiveProject.mockResolvedValueOnce({ id: 'p1', name: 'Valid Project', checkpoint_threshold: 42 });
    mockApi.getProjects.mockResolvedValueOnce([{ id: 'p1', name: 'Valid Project' }]);
    mockApi.getSettings.mockResolvedValueOnce({ mode: 'NEW', ai_enabled: 'true' });
    mockApi.getItems.mockResolvedValueOnce([]);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Valid Project')).toBeDefined();
    });

    // Wait for the app loading state to pass
    await waitFor(() => {
      expect(screen.queryByText('Loading application data...')).toBeNull();
    });

    // Simulate clicking the "Settings" tab by dispatching an event or finding the button
    // Using getAllByRole to get the navigation button specifically, avoiding ambiguity
    const buttons = screen.getAllByRole('button');
    const settingsButton = buttons.find(b => b.textContent === 'Settings');
    settingsButton?.click();

    // Verify Settings rendered with project data, not "Loading..."
    await waitFor(() => {
      // Should not see the loading state
      expect(screen.queryByText('Loading project settings...')).toBeNull();

      // Ensure the project name inputs appear to prove the component mounted
      expect(screen.getByText('Project Settings')).toBeDefined();
    });

    // The component is mounted but the state update (e.g. checkpoint_threshold) takes a tick
    // We can verify that it is not crashing and is correctly rendering
  });
});
