/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { STORE_FALLBACK_TIMEOUT_MS } from '../../lib/pairing/store-fallback';
import {
  HANDOFF_ATTEMPT_KEY_PREFIX,
  planPairingHandoff,
} from '../../lib/pairing/handoff';
import { Devices } from '../../lib/utilities';
import { MOCK_ANDROID_PLAN, MOCK_IOS_PLAN, Subject } from './mocks';

function createStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

describe('ContinueInFirefox', () => {
  it('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<Subject storage={createStorage()} />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'));

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  });

  describe('on iOS', () => {
    // Finding 1: WebKit only honours a top-level, user-initiated navigation, so
    // the deep link must be the anchor's href. A regression to a
    // <button onClick={navigate}> breaks iOS silently.
    it('puts the deep link in the CTA href rather than a click handler', () => {
      renderWithLocalizationProvider(<Subject storage={createStorage()} />);

      expect(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      ).toHaveAttribute('href', MOCK_IOS_PLAN.deepLink);
    });

    it('does not navigate from script when the CTA is tapped', async () => {
      const assign = jest.fn();
      const user = userEvent.setup();
      renderWithLocalizationProvider(
        <Subject assign={assign} storage={createStorage()} />
      );

      await user.click(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      );

      expect(assign).not.toHaveBeenCalled();
    });

    it('shows a spinner once the hand-off is under way', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject storage={createStorage()} />);

      await user.click(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      );

      expect(screen.getByText('Opening Firefox…')).toBeInTheDocument();
    });

    it('offers the App Store as an escape hatch', () => {
      renderWithLocalizationProvider(<Subject storage={createStorage()} />);

      expect(
        screen.getByRole('link', { name: 'Don’t have Firefox? Get it now' })
      ).toHaveAttribute('href', MOCK_IOS_PLAN.storeUrl);
    });

    it('does not auto-navigate on mount', () => {
      const assign = jest.fn();
      renderWithLocalizationProvider(
        <Subject assign={assign} storage={createStorage()} />
      );

      expect(assign).not.toHaveBeenCalled();
    });
  });

  describe('on Android', () => {
    it('hands off on mount without waiting for a tap', () => {
      const assign = jest.fn();
      renderWithLocalizationProvider(
        <Subject
          plan={MOCK_ANDROID_PLAN}
          assign={assign}
          storage={createStorage()}
        />
      );

      expect(assign).toHaveBeenCalledWith(MOCK_ANDROID_PLAN.deepLink);
      expect(assign).toHaveBeenCalledTimes(1);
    });

    it('spends the one-shot token so a Play Store round trip cannot loop', () => {
      const storage = createStorage();
      renderWithLocalizationProvider(
        <Subject plan={MOCK_ANDROID_PLAN} storage={storage} />
      );

      expect(storage.setItem).toHaveBeenCalledWith(
        `${HANDOFF_ATTEMPT_KEY_PREFIX}${MOCK_ANDROID_PLAN.target}`,
        '1'
      );
    });

    // The two halves of the loop guard are written in different modules, so
    // this exercises both: the key this component spends must be the key
    // planPairingHandoff reads back. Keyed apart, Back from the Play Store
    // re-fires the intent and bounces the user straight out again.
    it('stops the next page load from auto-attempting the same target', () => {
      const storage = createStorage();
      const args = {
        device: Devices.OTHER_ANDROID,
        targetUrl: MOCK_ANDROID_PLAN.target,
        storeLinks: {
          ios: MOCK_IOS_PLAN.storeUrl,
          android: MOCK_ANDROID_PLAN.storeUrl,
        },
        storage,
        build: 'firefox' as const,
      };
      expect(planPairingHandoff(args)).toEqual(
        expect.objectContaining({ autoAttempt: true })
      );

      renderWithLocalizationProvider(
        <Subject plan={MOCK_ANDROID_PLAN} storage={storage} />
      );

      expect(planPairingHandoff(args)).toEqual(
        expect.objectContaining({ autoAttempt: false })
      );
    });

    it('hides the CTA while the auto hand-off is in flight', () => {
      renderWithLocalizationProvider(
        <Subject plan={MOCK_ANDROID_PLAN} storage={createStorage()} />
      );

      expect(
        screen.queryByRole('link', { name: 'Continue in Firefox' })
      ).not.toBeInTheDocument();
      expect(screen.getByText('Opening Firefox…')).toBeInTheDocument();
    });

    // In an in-app WebView the intent silently no-ops, which would otherwise
    // strand the user on the spinner forever.
    it('reveals the CTA when the intent silently no-ops', async () => {
      jest.useFakeTimers();
      try {
        renderWithLocalizationProvider(
          <Subject plan={MOCK_ANDROID_PLAN} storage={createStorage()} />
        );

        jest.advanceTimersByTime(STORE_FALLBACK_TIMEOUT_MS);

        await waitFor(() =>
          expect(
            screen.getByRole('link', { name: 'Continue in Firefox' })
          ).toBeInTheDocument()
        );
      } finally {
        jest.useRealTimers();
      }
    });

    // The reveal timer is UI-only. If it navigated it would race
    // S.browser_fallback_url, which is already sending the user to the store.
    it('does not navigate a second time when the CTA is revealed', () => {
      jest.useFakeTimers();
      try {
        const assign = jest.fn();
        renderWithLocalizationProvider(
          <Subject
            plan={MOCK_ANDROID_PLAN}
            assign={assign}
            storage={createStorage()}
          />
        );

        jest.advanceTimersByTime(STORE_FALLBACK_TIMEOUT_MS * 3);

        expect(assign).toHaveBeenCalledTimes(1);
      } finally {
        jest.useRealTimers();
      }
    });

    it('renders the CTA immediately when the token is already spent', () => {
      const assign = jest.fn();
      renderWithLocalizationProvider(
        <Subject
          plan={{ ...MOCK_ANDROID_PLAN, autoAttempt: false }}
          assign={assign}
          storage={createStorage()}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      ).toBeInTheDocument();
      expect(assign).not.toHaveBeenCalled();
    });

    // A getItem that works alongside a setItem that throws would otherwise
    // re-attempt on every load.
    it('does not navigate when the token cannot be written', () => {
      const assign = jest.fn();
      const storage = createStorage();
      storage.setItem.mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

      renderWithLocalizationProvider(
        <Subject plan={MOCK_ANDROID_PLAN} assign={assign} storage={storage} />
      );

      expect(assign).not.toHaveBeenCalled();
      expect(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      ).toBeInTheDocument();
    });
  });
});
