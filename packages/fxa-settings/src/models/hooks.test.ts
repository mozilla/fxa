/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as Sentry from '@sentry/browser';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode, createElement } from 'react';
import 'reflect-metadata';

import { AppContext } from './contexts/AppContext';
import { useCmsInfoState } from './hooks';

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

jest.mock('../contexts/DynamicLocalizationContext', () => ({
  useDynamicLocalization: jest.fn().mockReturnValue({ currentLocale: 'en-US' }),
}));

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
  createElement(
    AppContext.Provider,
    {
      value: {
        config: mockConfig as any,
        account: undefined,
        apolloClient: undefined,
      },
    },
    children
  );

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

    // Reset navigator.language and useDynamicLocalization to English defaults
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-US',
    });
    Object.defineProperty(navigator, 'languages', {
      writable: true,
      value: ['en-US', 'en'],
    });
    require('../contexts/DynamicLocalizationContext').useDynamicLocalization.mockReturnValue(
      { currentLocale: 'en-US' }
    );
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
      createElement(
        AppContext.Provider,
        {
          value: {
            config: disabledConfig as any,
            account: undefined,
            apolloClient: undefined,
          },
        },
        children
      );

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

    // Mock useDynamicLocalization to return non-English locale
    require('../contexts/DynamicLocalizationContext').useDynamicLocalization.mockReturnValue(
      { currentLocale: 'fr-FR' }
    );

    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should not fetch due to non-English locale
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
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

  it('should fetch when l10nEnabled is true for any locale', async () => {
    const l10nEnabledConfig = {
      ...mockConfig,
      cms: { enabled: true, l10nEnabled: true },
    };

    const L10nEnabledProvider = ({ children }: { children: ReactNode }) =>
      createElement(
        AppContext.Provider,
        {
          value: {
            config: l10nEnabledConfig as any,
            account: undefined,
            apolloClient: undefined,
          },
        },
        children
      );

    // Mock non-English locale
    require('../contexts/DynamicLocalizationContext').useDynamicLocalization.mockReturnValue(
      { currentLocale: 'fr-FR' }
    );
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR',
    });

    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ customization: 'french-test' }),
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: L10nEnabledProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(result.current.data?.cmsInfo).toEqual({
      customization: 'french-test',
    });
  });

  it('should fetch when l10nEnabled is false but browser language is English', async () => {
    // Mock English browser language and English selected locale
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'en-GB',
    });
    require('../contexts/DynamicLocalizationContext').useDynamicLocalization.mockReturnValue(
      { currentLocale: 'en-US' }
    );

    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: jest
        .fn()
        .mockResolvedValue({ customization: 'english-browser-test' }),
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(result.current.data?.cmsInfo).toEqual({
      customization: 'english-browser-test',
    });
  });

  it('should fetch when l10nEnabled is false but selected locale is English', async () => {
    // Mock non-English browser language but English selected locale
    Object.defineProperty(navigator, 'language', {
      writable: true,
      value: 'fr-FR',
    });
    require('../contexts/DynamicLocalizationContext').useDynamicLocalization.mockReturnValue(
      { currentLocale: 'en-US' }
    );

    mockUrlQueryData.get.mockImplementation((key: string) => {
      if (key === 'client_id') return '1234567890abcdef';
      if (key === 'entrypoint') return 'preferences';
      return null;
    });

    mockFetch.mockResolvedValue({
      ok: true,
      json: jest
        .fn()
        .mockResolvedValue({ customization: 'english-selected-test' }),
    });

    const { result } = renderHook(() => useCmsInfoState(), {
      wrapper: MockAppProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalled();
    expect(result.current.data?.cmsInfo).toEqual({
      customization: 'english-selected-test',
    });
  });
});
