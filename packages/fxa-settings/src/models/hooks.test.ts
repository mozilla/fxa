/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode, createElement } from 'react';
import * as Sentry from '@sentry/browser';

import { useCmsInfoState } from './hooks';
import { AppContext } from './contexts/AppContext';

// Mock all external dependencies before importing the hook
jest.mock('@sentry/browser', () => ({
  captureMessage: jest.fn(),
}));

jest.mock('class-validator', () => ({
  IsOptional: () => () => {},
  IsString: () => () => {},
  isHexadecimal: jest.fn().mockReturnValue(true),
  length: jest.fn().mockReturnValue(true),
}));

jest.mock('../lib/window', () => ({
  ReachRouterWindow: jest.fn().mockImplementation(() => ({
    location: {
      search: '',
    },
  })),
}));

jest.mock('../lib/model-data', () => ({
  UrlQueryData: jest.fn(),
  bind: jest.fn(() => () => {}),
  ModelDataProvider: class MockModelDataProvider {},
  StorageData: jest.fn(),
  UrlHashData: jest.fn(),
}));

jest.mock('../lib/integrations', () => ({
  DefaultIntegrationFlags: jest.fn(),
  IntegrationFactory: jest.fn(),
}));

jest.mock('../lib/nimbus', () => ({}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock navigator.language and navigator.languages
Object.defineProperty(navigator, 'language', {
  writable: true,
  value: 'en-US',
});

Object.defineProperty(navigator, 'languages', {
  writable: true,
  value: ['en-US', 'en'],
});

const mockConfig = {
  cms: {
    enabled: true,
  },
  servers: {
    auth: {
      url: 'http://localhost:9000',
    },
  },
};

const MockAppProvider = ({ children }: { children: ReactNode }) =>
  createElement(AppContext.Provider, {
    value: { config: mockConfig as any, account: undefined, apolloClient: undefined }
  }, children);

describe('useCmsInfoState', () => {
  let mockUrlQueryData: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset the UrlQueryData mock
    const { UrlQueryData } = require('../lib/model-data');
    mockUrlQueryData = {
      get: jest.fn(),
    };
    UrlQueryData.mockImplementation(() => mockUrlQueryData);

    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ customization: 'test' }),
    });
  });

  it('should use default entrypoint when entrypoint is not provided in URL', async () => {
    // Setup: no entrypoint in URL, valid clientId
    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef'; // valid 16-char hex
      if (key === 'entrypoint') return null; // no entrypoint in URL
      return null;
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify that fetch was called with default entrypoint
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:9000/v1/cms/config?clientId=1234567890abcdef&entrypoint=default',
      }),
      expect.any(Object)
    );

    expect(result.current.data?.cmsInfo).toEqual({ customization: 'test' });
    expect(result.current.error).toBeUndefined();
  });

  it('should use provided entrypoint when present in URL', async () => {
    // Setup: custom entrypoint in URL, valid clientId
    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef'; // valid 16-char hex
      if (key === 'entrypoint') return 'preferences'; // custom entrypoint
      return null;
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify that fetch was called with provided entrypoint
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:9000/v1/cms/config?clientId=1234567890abcdef&entrypoint=preferences',
      }),
      expect.any(Object)
    );

    expect(result.current.data?.cmsInfo).toEqual({ customization: 'test' });
    expect(result.current.error).toBeUndefined();
  });

  it('should not fetch when CMS is disabled in config', async () => {
    const disabledConfig = {
      ...mockConfig,
      cms: { enabled: false },
    };

    const DisabledCmsProvider = ({ children }: { children: ReactNode }) =>
      createElement(AppContext.Provider, {
        value: { config: disabledConfig as any, account: undefined, apolloClient: undefined }
      }, children);

    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: DisabledCmsProvider,
    });

    // Should not fetch and should return empty state
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('should not fetch when clientId is invalid', async () => {
    // Mock the class-validator functions to return false for invalid clientId
    const { isHexadecimal, length } = require('class-validator');
    isHexadecimal.mockReturnValue(false);
    length.mockReturnValue(false);

    // Setup: invalid clientId (not 16-char hex)
    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return 'invalid'; // invalid clientId
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Should not fetch due to invalid clientId
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    // Reset the mocks for other tests
    isHexadecimal.mockReturnValue(true);
    length.mockReturnValue(true);
  });

  it('should not fetch when clientId is missing', async () => {
    // Setup: no clientId
    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return null; // no clientId
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Should not fetch due to missing clientId
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  it('should not fetch when user locale is not English', async () => {
    // Mock non-English locale
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR',
    });
    Object.defineProperty(navigator, 'languages', {
      writable: true,
      value: ['fr-FR', 'fr'],
    });

    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Should not fetch due to non-English locale
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    // Reset to English for other tests
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });
    Object.defineProperty(navigator, 'languages', {
      writable: true,
      value: ['en-US', 'en'],
    });
  });

  it('should handle fetch errors gracefully', async () => {
    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    // Mock fetch to reject
    const fetchError = new Error('Network error');
    mockFetch.mockRejectedValue(fetchError);

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(fetchError);
    expect(result.current.data).toBeUndefined();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Failure to fetch CMS config for clientId 1234567890abcdef and entrypoint preferences'
    );
  });

  it('should handle non-OK HTTP responses', async () => {
    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    // Mock fetch to return non-OK response
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.cmsInfo).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Failure to parse CMS config for clientId 1234567890abcdef and entrypoint preferences'
    );
  });

  it('should handle successful fetch with empty response', async () => {
    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return null; // will use default
      return null;
    });

    // Mock fetch to return OK but empty config
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Wait for the fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.cmsInfo).toEqual({});
    expect(result.current.error).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        href: 'http://localhost:9000/v1/cms/config?clientId=1234567890abcdef&entrypoint=default',
      }),
      expect.any(Object)
    );
  });

  it('should handle various custom entrypoint values', async () => {
    const testCases = [
      'firefox-toolbar',
      'fxa_app_menu',
      'ios_settings_manage',
      'synced-tabs',
      'custom.entrypoint-123'
    ];

    for (const entrypoint of testCases) {
      jest.clearAllMocks();

      mockUrlQueryData.get.mockImplementation((key: string) => {
        if (key === 'client_id') return '1234567890abcdef';
        if (key === 'entrypoint') return entrypoint;
        return null;
      });

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ customization: `test-${entrypoint}` }),
      });

      const { result } = renderHook(() => useCmsInfoState(), {
        wrapper: MockAppProvider,
      });

      // Wait for the fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verify that fetch was called with the correct entrypoint
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: `http://localhost:9000/v1/cms/config?clientId=1234567890abcdef&entrypoint=${entrypoint}`,
        }),
        expect.any(Object)
      );

      expect(result.current.data?.cmsInfo).toEqual({ customization: `test-${entrypoint}` });
    }
  });
});
