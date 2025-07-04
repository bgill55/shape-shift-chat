import { renderHook, act } from '@testing-library/react';
import { useSuggestedResponses } from './useSuggestedResponses';
import { vi } from 'vitest';

// Mock the AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    displayName: 'Test User',
  }),
}));

describe('useSuggestedResponses', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.setItem('shapes_auth_token', 'test-auth-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useSuggestedResponses());

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch suggestions successfully', async () => {
    const mockSuccessResponse = {
      choices: [{ message: { content: 'Suggestion 1\nSuggestion 2' } }],
    };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    const { result } = renderHook(() => useSuggestedResponses());

    await act(async () => {
      await result.current.fetchSuggestions([], 'test-channel', 'test-model');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestions).toHaveLength(2);
    expect(result.current.suggestions[0].text).toBe('Suggestion 1');
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      statusText: 'API Error',
      json: async () => ({ message: 'Failed to fetch' }),
    });

    const { result } = renderHook(() => useSuggestedResponses());

    await act(async () => {
      await result.current.fetchSuggestions([], 'test-channel', 'test-model');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toContain('Failed to fetch');
  });
});