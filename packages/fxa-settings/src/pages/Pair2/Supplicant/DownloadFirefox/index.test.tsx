/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { LINK } from '../../../../constants';
import { Constants } from '../../../../lib/constants';
import { STORE_FALLBACK_TIMEOUT_MS } from '../../../../lib/pairing/store-fallback';
import {
  HANDOFF_ATTEMPT_KEY_PREFIX,
  planPairingHandoff,
} from '../../../../lib/pairing/handoff';
import { Devices } from '../../../../lib/utilities';
import DownloadFirefox from '.';
import {
  MOCK_ANDROID_PLAN,
  MOCK_IOS_PLAN,
  MOCK_STORE_LINKS,
  MOCK_TARGET,
  Subject,
} from './mocks';

// The subcopy embeds the "Learn more" link with a Fluent DOM overlay, so the
// Fluent message carries `<linkExternal>` tags that never reach the DOM.
const SUBCOPY_FTL_ID = 'pair2-supplicant-download-firefox-description';

// The subcopy is not addressable by text — the inline link splits it across
// nodes — so it is reached through the mocked FtlMsg that wraps it.
const getSubcopy = () =>
  screen.getAllByTestId('ftlmsg-mock').find((el) => el.id === SUBCOPY_FTL_ID);

function createStorage(seed: Record<string, string> = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: jest.fn((key: string) => values.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

describe('Pair2/Supplicant/DownloadFirefox page', () => {
  let bundle: FluentBundle;
  beforeAll(async () => {
    bundle = await getFtlBundle('settings');
  });

  const expectMessagesMatchBundle = () => {
    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'))
      // `testL10n` compares rendered text against the raw Fluent message, which
      // an overlay message can never satisfy. Covered by its own test below.
      .filter((el) => el.id !== SUBCOPY_FTL_ID);

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  };

  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle.
  it('renders every message with text matching the Fluent bundle', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expectMessagesMatchBundle();
  });

  // The active label only exists while a hand-off is in flight, so the resting
  // render above never reaches it.
  it('renders the active CTA label with text matching the Fluent bundle', () => {
    renderWithLocalizationProvider(
      <Subject plan={MOCK_ANDROID_PLAN} storage={createStorage()} />
    );

    expect(screen.getByText('Opening Firefox…')).toBeInTheDocument();
    expectMessagesMatchBundle();
  });

  it('renders the subcopy fallback matching the Fluent overlay message', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    const message = bundle.getMessage(SUBCOPY_FTL_ID);
    const formatted = bundle.formatPattern(message!.value!);

    // The link has to be a placeable inside the sentence, not a hand-split
    // fragment, or translators cannot move it.
    const [sentence, placeable] = formatted.split('<linkExternal>');
    expect(placeable).toBe('Learn more</linkExternal>');

    // Both halves reach the DOM: the sentence as text, the placeable as the
    // anchor's label.
    expect(getSubcopy()).toHaveTextContent(sentence.trim());
    expect(
      screen.getByRole('link', { name: /Learn more/ })
    ).toBeInTheDocument();
  });

  it('renders the heading and subcopy', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Get Firefox on this device'
    );
    expect(getSubcopy()).toHaveTextContent(
      'Download Firefox to sync bookmarks, history, and more across devices. Learn more'
    );
  });

  it('exposes the brand lockup and illustration to assistive technology', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the two images this card renders.
      'Mozilla logo',
      'Firefox logo',
      'A desktop browser window and a mobile phone, both syncing, with the Firefox mascot alongside them',
    ]);
  });

  it('points the inline Learn more link at the sync explainer', () => {
    renderWithLocalizationProvider(<DownloadFirefox />);

    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      LINK.FX_SYNC
    );
  });

  // A load that arrives without a pairing channel — a pasted link, a new tab,
  // or a device with no Firefox app to open. There is nothing to hand off, so
  // the card degrades to a download link rather than erroring.
  describe('with no hand-off plan', () => {
    it('points the primary action at the mobile Firefox download page', () => {
      renderWithLocalizationProvider(<DownloadFirefox />);

      expect(
        screen.getByRole('link', { name: /Continue in Firefox/ })
      ).toHaveAttribute('href', Constants.FIREFOX_MOBILE_DOWNLOAD_URL);
    });

    it('does not navigate on mount', () => {
      const assign = jest.fn();
      renderWithLocalizationProvider(<DownloadFirefox assign={assign} />);

      expect(assign).not.toHaveBeenCalled();
    });

    it('leaves the CTA at rest when tapped', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<DownloadFirefox />);

      await user.click(
        screen.getByRole('link', { name: /Continue in Firefox/ })
      );

      expect(screen.queryByText('Opening Firefox…')).not.toBeInTheDocument();
    });
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

    // LinkExternal's target="_blank" would open the deep link in a new tab,
    // which WebKit does not honour.
    it('keeps the deep link in this tab', () => {
      renderWithLocalizationProvider(<Subject storage={createStorage()} />);

      expect(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      ).not.toHaveAttribute('target');
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

    // The active state belongs to the CTA itself, not a separate line of status
    // text beside it, so the label swaps in place.
    it('swaps the CTA label for the active state once the hand-off is under way', async () => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject storage={createStorage()} />);

      await user.click(
        screen.getByRole('link', { name: 'Continue in Firefox' })
      );

      const cta = screen.getByRole('link', { name: 'Opening Firefox…' });
      expect(cta).toHaveAttribute('href', MOCK_IOS_PLAN.deepLink);
      expect(
        screen.queryByRole('link', { name: 'Continue in Firefox' })
      ).not.toBeInTheDocument();
    });

    // The store is reached through the hand-off itself — the iOS watchdog on a
    // retap, Android's S.browser_fallback_url — so the card carries no separate
    // store link to compete with the CTA, in either state.
    it.each([
      ['at rest', false],
      ['while attempting', true],
    ])('renders no separate store link %s', async (_label, attempt) => {
      const user = userEvent.setup();
      renderWithLocalizationProvider(<Subject storage={createStorage()} />);

      if (attempt) {
        await user.click(
          screen.getByRole('link', { name: 'Continue in Firefox' })
        );
      }

      const hrefs = screen
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'));
      expect(hrefs).not.toContain(MOCK_IOS_PLAN.storeUrl);
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
    // this exercises both: the key this page spends must be the key
    // planPairingHandoff reads back. Keyed apart, Back from the Play Store
    // re-fires the intent and bounces the user straight out again.
    it('stops the next page load from auto-attempting the same target', () => {
      const storage = createStorage();
      const args = {
        device: Devices.OTHER_ANDROID,
        targetUrl: MOCK_TARGET,
        storeLinks: MOCK_STORE_LINKS,
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

    it('shows the CTA in its active state while the auto hand-off is in flight', () => {
      renderWithLocalizationProvider(
        <Subject plan={MOCK_ANDROID_PLAN} storage={createStorage()} />
      );

      expect(
        screen.getByRole('link', { name: 'Opening Firefox…' })
      ).toHaveAttribute('href', MOCK_ANDROID_PLAN.deepLink);
    });

    // In an in-app WebView the intent silently no-ops, which would otherwise
    // strand the user on a spinner forever.
    it('returns the CTA to rest when the intent silently no-ops', async () => {
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

    // The rest timer is UI-only. If it navigated it would race
    // S.browser_fallback_url, which is already sending the user to the store.
    it('does not navigate a second time when the CTA returns to rest', () => {
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

    it('renders the CTA at rest when the token is already spent', () => {
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

    // The channel arrives in the target's hash, so the intent URI carries a
    // second `#`. Android's parseUri splits on the last one; a mock that drops
    // the hash would never exercise the shape the real flow produces.
    it('carries the pairing channel into the intent URI', () => {
      renderWithLocalizationProvider(
        <Subject plan={MOCK_ANDROID_PLAN} storage={createStorage()} />
      );

      const href = screen
        .getByRole('link', { name: 'Opening Firefox…' })
        .getAttribute('href');
      expect(href).toContain('channel_key=key-1');
      expect(href).toMatch(/#Intent;.*;end$/);
    });
  });
});
