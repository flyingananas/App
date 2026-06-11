// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Settings } from '../renderer/src/components/Settings';
import { Cover } from '../renderer/src/components/Cover';

const mockApi = {
  hasAIKey: vi.fn().mockResolvedValue(false),
};

describe('UI Components Null Guards', () => {
  beforeEach(() => {
    (window as any).api = mockApi;
  });

  afterEach(() => {
    delete (window as any).api;
  });
  it('renders Settings safely without crashing when project is null or undefined', () => {
    // Suppress React warnings if it throws, but expect not to
    const { container } = render(
      <Settings settings={{}} project={undefined as any} reloadSettings={async () => {}} />
    );
    expect(screen.getByText('Loading project settings...')).toBeDefined();

    render(
      <Settings settings={{}} project={null as any} reloadSettings={async () => {}} />
    );
    expect(screen.getAllByText('Loading project settings...').length).toBe(2);
  });

  it('renders Cover safely without crashing when project is null or undefined', () => {
    render(
      <Cover settings={{}} project={undefined as any} />
    );
    expect(screen.getByText('Loading cover...')).toBeDefined();

    render(
      <Cover settings={{}} project={null as any} />
    );
    expect(screen.getAllByText('Loading cover...').length).toBe(2);
  });
});
