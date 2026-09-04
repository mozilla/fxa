/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

describe('Pair2/Supplicant/SyncSuccess page', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle.
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
      'Your device is connected'
    );
    screen.getByText(
      'Your bookmarks, tabs, and more will stay synced in Firefox.'
    );
  });

  it('exposes the brand lockup and illustration to assistive technology', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      // AppLayout's page header, then the two images this card renders.
      'Mozilla logo',
      'Firefox logo',
     ]);
  });

  it('calls onViewSyncedTabs when the primary button is clicked', async () => {
    const user = userEvent.setup();
    const onViewSyncedTabs = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onViewSyncedTabs }} />);

    await user.click(screen.getByRole('button', { name: 'View synced tabs' }));

    expect(onViewSyncedTabs).toHaveBeenCalledTimes(1);
  });

  it('calls onSyncSettings when the sync settings button is clicked', async () => {
    const user = userEvent.setup();
    const onSyncSettings = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onSyncSettings }} />);

    await user.click(screen.getByRole('button', { name: 'Sync settings' }));

    expect(onSyncSettings).toHaveBeenCalledTimes(1);
  });

  it('renders the card on a white page background', () => {
    renderWithLocalizationProvider(<Subject />);

    // Below `mobileLandscape` the card is transparent, so the page colour is
    // the colour the phone shows. The designs call for white, not the default
    // grey the desktop cards sit on.
    expect(screen.getByTestId('app')).toHaveClass('bg-white');
  });
});
