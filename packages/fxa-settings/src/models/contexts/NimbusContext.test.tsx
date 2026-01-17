/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NimbusProvider, useNimbusContext } from './NimbusContext';
import { AppContext, AppContextValue } from './AppContext';
import { useDynamicLocalization } from '../../contexts/DynamicLocalizationContext';
import { initializeNimbus, NimbusResult } from '../../lib/nimbus';
import * as Sentry from '@sentry/react';
import { useLocalStorageSync } from '../../lib/hooks/useLocalStorageSync';

jest.mock('../../contexts/DynamicLocalizationContext');
jest.mock('../../lib/nimbus');
jest.mock('@sentry/react');
jest.mock('../../lib/hooks/useLocalStorageSync');

const mockUseDynamicLocalization = useDynamicLocalization as jest.MockedFunction<typeof useDynamicLocalization>;
const mockInitializeNimbus = initializeNimbus as jest.MockedFunction<typeof initializeNimbus>;
const mockSentryCaptureException = Sentry.captureException as jest.MockedFunction<typeof Sentry.captureException>;
const mockUseLocalStorageSync = useLocalStorageSync as jest.MockedFunction<typeof useLocalStorageSync>;

const TestComponent = () => {
  const { experiments, loading, error } = useNimbusContext();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="experiments">{experiments ? 'has-experiments' : 'no-experiments'}</div>
      <div data-testid="error">{error ? error.message : 'no-error'}</div>
    </div>
  );
};

const mockAppContext = {
  config: {
    nimbus: { enabled: true, preview: false }
  } as AppContextValue['config'],
  uniqueUserId: 'test-user-id'
} as Partial<AppContextValue>;

const renderWithProviders = (appContext: Partial<AppContextValue> = mockAppContext) => {
  return render(
    <AppContext.Provider value={appContext as AppContextValue}>
      <NimbusProvider>
        <TestComponent />
      </NimbusProvider>
    </AppContext.Provider>
  );
};

describe('NimbusContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDynamicLocalization.mockReturnValue({
      currentLocale: 'en-US',
      switchLanguage: jest.fn(),
      clearLanguagePreference: jest.fn(),
      isLoading: false
    });
    // Mock useLocalStorageSync to return undefined by default (no account)
    mockUseLocalStorageSync.mockImplementation((key: string) => {
      if (key === 'currentAccountUid') {
        return undefined;
      }
      if (key === 'accounts') {
        return undefined;
      }
      return undefined;
    });
    Object.defineProperty(window, 'location', {
      value: { search: '' },
      writable: true
    });
  });

  describe('useNimbusContext without provider', () => {
    it('returns default values', () => {
      render(<TestComponent />);

      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('experiments')).toHaveTextContent('no-experiments');
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });

  describe('NimbusProvider', () => {
    it('throws error when config is missing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(
          <AppContext.Provider value={{ uniqueUserId: 'test' } as AppContextValue}>
            <NimbusProvider>
              <TestComponent />
            </NimbusProvider>
          </AppContext.Provider>
        );
      }).toThrow('NimbusProvider requires AppContext with config');

      consoleSpy.mockRestore();
    });

    it('does not fetch when nimbus is disabled', async () => {
      const disabledConfig: Partial<AppContextValue> = {
        ...mockAppContext,
        config: { nimbus: { enabled: false, preview: false } } as AppContextValue['config']
      };

      renderWithProviders(disabledConfig);

      expect(mockInitializeNimbus).not.toHaveBeenCalled();
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('does not fetch when uniqueUserId is missing', async () => {
      const noUserIdConfig: Partial<AppContextValue> = {
        ...mockAppContext,
        uniqueUserId: undefined
      };

      renderWithProviders(noUserIdConfig);

      expect(mockInitializeNimbus).not.toHaveBeenCalled();
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('does not fetch when metrics are disabled via localStorage', async () => {
      const accountUid = 'test-account-uid';
      mockUseLocalStorageSync.mockImplementation((key: string) => {
        if (key === 'currentAccountUid') return accountUid;
        if (key === 'accounts') return { [accountUid]: { metricsEnabled: false } };
        return undefined;
      });

      renderWithProviders();

      await waitFor(() => {
        expect(mockInitializeNimbus).not.toHaveBeenCalled();
      });
      expect(screen.getByTestId('experiments')).toHaveTextContent('no-experiments');
    });

    it('fetches when metrics are enabled via localStorage', async () => {
      const accountUid = 'test-account-uid';
      mockUseLocalStorageSync.mockImplementation((key: string) => {
        if (key === 'currentAccountUid') return accountUid;
        if (key === 'accounts') return { [accountUid]: { metricsEnabled: true } };
        return undefined;
      });
      mockInitializeNimbus.mockResolvedValue({
        features: { 'test-feature': { enabled: true } },
        nimbusUserId: 'test-user-id'
      });

      renderWithProviders();

      await waitFor(() => {
        expect(mockInitializeNimbus).toHaveBeenCalled();
      });
      expect(screen.getByTestId('experiments')).toHaveTextContent('has-experiments');
    });

    it('fetches experiments successfully', async () => {
      const mockExperiments: NimbusResult = {
        features: { 'test-feature': { enabled: true } },
        nimbusUserId: 'test-user-id'
      };
      mockInitializeNimbus.mockResolvedValue(mockExperiments);

      renderWithProviders();

      expect(mockInitializeNimbus).toHaveBeenCalledWith(
        'test-user-id',
        false,
        { language: 'en', region: 'us' }
      );

      await screen.findByTestId('experiments');
      expect(screen.getByTestId('experiments')).toHaveTextContent('has-experiments');
    });

    it('handles API response with lowercase features', async () => {
      const mockExperiments: NimbusResult = {
        features: { 'test-feature': { enabled: true } },
        nimbusUserId: 'test-user-id'
      };
      mockInitializeNimbus.mockResolvedValue(mockExperiments);

      renderWithProviders();

      await screen.findByTestId('experiments');
      expect(screen.getByTestId('experiments')).toHaveTextContent('has-experiments');
    });

    it('handles null response', async () => {
      mockInitializeNimbus.mockResolvedValue(null);

      renderWithProviders();

      await screen.findByTestId('experiments');
      expect(screen.getByTestId('experiments')).toHaveTextContent('no-experiments');
    });

    it('handles fetch error without duplicate error handling', async () => {
      const error = new Error('Network error');
      mockInitializeNimbus.mockRejectedValue(error);

      renderWithProviders();

      await screen.findByTestId('error');
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(mockSentryCaptureException).toHaveBeenCalledTimes(1);
    });

    it('handles preview mode from config', async () => {
      const previewConfig: Partial<AppContextValue> = {
        ...mockAppContext,
        config: { nimbus: { enabled: true, preview: true } } as AppContextValue['config']
      };

      renderWithProviders(previewConfig);

      expect(mockInitializeNimbus).toHaveBeenCalledWith(
        'test-user-id',
        true,
        { language: 'en', region: 'us' }
      );
    });

    it('handles preview mode from URL params', async () => {
      Object.defineProperty(window, 'location', {
        value: { search: '?nimbusPreview=true' },
        writable: true
      });

      renderWithProviders();

      expect(mockInitializeNimbus).toHaveBeenCalledWith(
        'test-user-id',
        true,
        { language: 'en', region: 'us' }
      );
    });

    it('cleans up on unmount', async () => {
      mockInitializeNimbus.mockResolvedValue({
        features: { 'test-feature': { enabled: true } },
        nimbusUserId: 'test-user-id'
      });

      const { unmount } = renderWithProviders();

      await waitFor(() => {
        expect(mockInitializeNimbus).toHaveBeenCalled();
      });

      expect(() => unmount()).not.toThrow();
    });
  });
});
