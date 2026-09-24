/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import PairConnectHint from '.';

// `testL10n` compares rendered text against the raw Fluent source, so a message
// carrying a DOM overlay tag can never match it. These are checked on their own
// below instead.
const STEP_FTL_IDS = [
  'pair2-supplicant-connect-hint-step-app-menu',
  'pair2-supplicant-connect-hint-step-sign-in',
];

const getMessageEl = (ftlId: string) =>
  screen.getAllByTestId('ftlmsg-mock').find((el) => el.id === ftlId)!;

describe('Pair2/Supplicant/PairConnectHint page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle. No message on this page takes a variable, so no
  // arguments are passed.
  it('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<PairConnectHint />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'))
      .filter((el) => !STEP_FTL_IDS.includes(el.id));

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  });

  it.each(STEP_FTL_IDS)(
    'keeps the %s fallback text in step with the Fluent message',
    async (ftlId) => {
      const bundle: FluentBundle = await getFtlBundle('settings');
      renderWithLocalizationProvider(<PairConnectHint />);

      const message = bundle.getMessage(ftlId);
      const source = bundle.formatPattern(message!.value!);

      expect(getMessageEl(ftlId).textContent).toEqual(
        source.replace(/<\/?b>/g, '')
      );
    }
  );

  it('renders the heading and the subheading', () => {
    renderWithLocalizationProvider(<PairConnectHint />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Continue with these steps'
    );
    expect(
      screen.getByText('Use Firefox’s built-in camera to scan again')
    ).toBeInTheDocument();
  });

  it('renders the two steps as a list, emphasising the control to tap', () => {
    renderWithLocalizationProvider(<PairConnectHint />);

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(2);
    expect(steps[0]).toHaveTextContent('Tap the app menu in the toolbar');
    expect(steps[1]).toHaveTextContent('Tap sign in, then scan the code');
    // The control name sits inside the sentence, so the emphasis has to come
    // from an element the message can wrap.
    expect(screen.getByText('app menu').tagName).toEqual('B');
    expect(screen.getByText('sign in').tagName).toEqual('B');
  });

  it('links “Learn more” to the sync support article', () => {
    renderWithLocalizationProvider(<PairConnectHint />);

    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/how-do-i-set-sync-my-computer'
    );
  });

  it('renders no buttons — the next step happens in the Firefox app', () => {
    renderWithLocalizationProvider(<PairConnectHint />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('exposes the brand lockups, keeping the illustration decorative', () => {
    renderWithLocalizationProvider(<PairConnectHint />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then this page's Firefox lockup. The phone
      // illustration is decorative — the steps beside it say the same.
      'Mozilla logo',
      'Firefox logo',
    ]);
  });

  it('renders the page on a white background', () => {
    renderWithLocalizationProvider(<PairConnectHint />);

    // Below `mobileLandscape` the card is transparent, so the page colour is
    // the colour the phone shows. The designs call for white, not the default
    // grey the desktop cards sit on.
    expect(screen.getByTestId('app')).toHaveClass('bg-white');
  });
});
