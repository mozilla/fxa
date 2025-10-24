/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { NimbusProvider, useNimbusContext } from './NimbusContext';
import { AppContext } from './AppContext';
import { useDynamicLocalization } from '../../contexts/DynamicLocalizationContext';
import { initializeNimbus } from '../../lib/nimbus';
import * as Sentry from '@sentry/react';

jest.mock('../../contexts/DynamicLocalizationContext');
jest.mock('../../lib/nimbus');
jest.mock('@sentry/react');

const mockUseDynamicLocalization = useDynamicLocalization as jest.MockedFunction<typeof useDynamicLocalization>;
const mockInitializeNimbus = initializeNimbus as jest.MockedFunction<typeof initializeNimbus>;
const mockSentryCaptureException = Sentry.captureException as jest.MockedFunction<typeof Sentry.captureException>;

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
  },
  uniqueUserId: 'test-user-id'
};

const renderWithProviders = (appContext = mockAppContext) => {
  return render(
    <AppContext.Provider value={appContext as any}>
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
    } as any);
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
          <AppContext.Provider value={{ uniqueUserId: 'test' } as any}>
            <NimbusProvider>
              <TestComponent />
            </NimbusProvider>
          </AppContext.Provider>
        );
      }).toThrow('NimbusProvider requires AppContext with config');

      consoleSpy.mockRestore();
    });

    it('does not fetch when nimbus is disabled', async () => {
      const disabledConfig = {
        ...mockAppContext,
        config: { nimbus: { enabled: false, preview: false } }
      };

      renderWithProviders(disabledConfig);

      expect(mockInitializeNimbus).not.toHaveBeenCalled();
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('does not fetch when uniqueUserId is missing', async () => {
      const noUserIdConfig = {
        ...mockAppContext,
        uniqueUserId: null as any
      };

      renderWithProviders(noUserIdConfig);

      expect(mockInitializeNimbus).not.toHaveBeenCalled();
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    it('fetches experiments successfully', async () => {
      const mockExperiments = {
        Features: { 'test-feature': { enabled: true } },
        nimbusUserId: 'test-user-id'
      };
      mockInitializeNimbus.mockResolvedValue(mockExperiments as any);

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
      const mockExperiments = {
        features: { 'test-feature': { enabled: true } },
        nimbusUserId: 'test-user-id'
      };
      mockInitializeNimbus.mockResolvedValue(mockExperiments as any);

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

    it('handles fetch error', async () => {
      const error = new Error('Network error');
      mockInitializeNimbus.mockRejectedValue(error);

      renderWithProviders();

      await screen.findByTestId('error');
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
      expect(mockSentryCaptureException).toHaveBeenCalledWith(error, expect.objectContaining({
        tags: { area: 'NimbusProvider', component: 'NimbusContext' }
      }));
    });

    it('handles preview mode from config', async () => {
      const previewConfig = {
        ...mockAppContext,
        config: { nimbus: { enabled: true, preview: true } }
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

    it('cleans up on unmount', () => {
      const { unmount } = renderWithProviders();

      unmount();

      // Should not throw or cause memory leaks
      expect(mockInitializeNimbus).toHaveBeenCalled();
    });
  });
});
