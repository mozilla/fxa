/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Constants } from '../../lib/constants';
import PairUnsupportedHint from '.';

describe('PairUnsupportedHint', () => {
  it('renders three steps, starting with closing the page, for a webview', () => {
    renderWithLocalizationProvider(
      <PairUnsupportedHint view="webview" os="ios" />
    );

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent('Close this page');
    expect(steps[1]).toHaveTextContent('Tap the app menu');
    expect(steps[2]).toHaveTextContent('Sign in, then scan the code');
  });

  it('renders two steps for a tab', () => {
    renderWithLocalizationProvider(
      <PairUnsupportedHint view="tab" os="android" />
    );

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(2);
    expect(steps[0]).toHaveTextContent('Tap the app menu');
    expect(steps[1]).toHaveTextContent('Sign in, then scan the code');
  });

  // The jest SVG stub renders the file name as the element's text.
  it.each([
    ['ios', 'graphic_pair_menu_ios.svg'],
    ['android', 'graphic_pair_menu_android.svg'],
  ] as const)('shows the %s menu illustration', (os, file) => {
    renderWithLocalizationProvider(<PairUnsupportedHint view="tab" os={os} />);

    expect(screen.getByTestId('aria-hidden-image')).toHaveTextContent(file);
  });

  it('renders the heading and the learn more link', () => {
    renderWithLocalizationProvider(
      <PairUnsupportedHint view="tab" os="android" />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Finish pairing in the app'
    );
    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      Constants.PAIR_WITHOUT_QR_SUMO_URL
    );
  });

  // Fallback text has no <b> tags, so compare against the source with them removed.
  it.each([
    ['webview', 'ios', 'pair-unsupported-hint-heading'],
    ['webview', 'ios', 'pair-unsupported-hint-step-close-page'],
    ['webview', 'ios', 'pair-unsupported-hint-step-app-menu'],
    ['tab', 'android', 'pair-unsupported-hint-step-app-menu'],
    ['tab', 'android', 'pair-unsupported-hint-step-sign-in'],
    ['tab', 'android', 'pair-unsupported-hint-learn-more-link'],
  ] as const)(
    'keeps the %s %s fallback text for %s in step with the Fluent bundle',
    async (view, os, ftlId) => {
      const bundle: FluentBundle = await getFtlBundle('settings');
      renderWithLocalizationProvider(
        <PairUnsupportedHint view={view} os={os} />
      );

      const source = bundle.formatPattern(bundle.getMessage(ftlId)!.value!);
      const message = screen
        .getAllByTestId('ftlmsg-mock')
        .find((el) => el.id === ftlId);
      expect(message?.textContent).toEqual(source.replace(/<\/?b>/g, ''));
    }
  );
});
