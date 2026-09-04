/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

describe('Pair2/Authority/ContinueOnMobile page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle. No message on this card takes a variable, so no
  // arguments are passed.
  it('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<Subject />);

    const messages = screen
      .getAllByTestId('ftlmsg-mock')
      // The jest SVG stub renders the file name as the element's text, so image
      // messages can never match. Covered by components/images/index.test.tsx.
      .filter((el) => !el.textContent?.endsWith('.svg'));

    expect(messages.length).toBeGreaterThan(0);
    messages.forEach((el) => testL10n(el, bundle));
  });

  it('renders the heading and description', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Continue on your mobile device'
    );
    screen.getByText('Follow the steps on your phone or tablet.');
  });

  it('exposes the illustration to assistive technology', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the single image this card renders.
      'Mozilla logo'
    ]);
  });

  it('offers Cancel as its only action, with no primary button', () => {
    renderWithLocalizationProvider(<Subject />);

    // This is a passive waiting state that advances on its own, so a primary
    // CTA here would necessarily be unwired. Asserting on the full button list
    // rather than a single query keeps a future addition from slipping in.
    expect(screen.getAllByRole('button').map((el) => el.textContent)).toEqual([
      'Cancel',
    ]);
    expect(document.querySelector('.cta-primary')).not.toBeInTheDocument();
  });

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onCancel }} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
