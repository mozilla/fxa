/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import ReadyToScan from '.';

// `testL10n` compares rendered text against the raw Fluent source, so a message
// carrying a DOM overlay tag can never match it. This one is checked on its own
// below instead.
const INSTRUCTION_FTL_ID = 'pair2-supplicant-ready-to-scan-instruction';

const getInstruction = () =>
  screen
    .getAllByTestId('ftlmsg-mock')
    .find((el) => el.id === INSTRUCTION_FTL_ID)!;

describe('Pair2/Supplicant/ReadyToScan page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle. No message on this card takes a variable, so no
  // arguments are passed.
  it('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<ReadyToScan />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'))
      .filter((el) => el.id !== INSTRUCTION_FTL_ID);

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  });

  it('keeps the instruction fallback text in step with the Fluent message', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<ReadyToScan />);

    const message = bundle.getMessage(INSTRUCTION_FTL_ID);
    const source = bundle.formatPattern(message!.value!);

    expect(getInstruction().textContent).toEqual(source.replace(/<\/?b>/g, ''));
  });

  it('renders the heading and the instruction, emphasising the pairing URL', () => {
    renderWithLocalizationProvider(<ReadyToScan />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'To connect a device'
    );
    expect(getInstruction()).toHaveTextContent(
      'On your computer, open Firefox and go to firefox.com/pair, and follow on screen instructions to connect this mobile device.'
    );
    // The URL is a placeable inside the sentence, not a fragment glued on, so
    // the emphasis has to come from an element the message can wrap.
    expect(screen.getByText('firefox.com/pair').tagName).toEqual('B');
  });

  it('links “Learn more” to the sync support article', () => {
    renderWithLocalizationProvider(<ReadyToScan />);

    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      'https://support.mozilla.org/kb/how-do-i-set-sync-my-computer'
    );
  });

  it('renders no buttons — the next step happens on the computer', () => {
    renderWithLocalizationProvider(<ReadyToScan />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('exposes the brand lockup and illustration to assistive technology', () => {
    renderWithLocalizationProvider(<ReadyToScan />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the two images this card renders.
      'Mozilla logo',
      'Firefox logo'
    ]);
  });

  it('renders the card on a white page background', () => {
    renderWithLocalizationProvider(<ReadyToScan />);

    // Below `mobileLandscape` the card is transparent, so the page colour is
    // the colour the phone shows. The designs call for white, not the default
    // grey the desktop cards sit on.
    expect(screen.getByTestId('app')).toHaveClass('bg-white');
  });
});
