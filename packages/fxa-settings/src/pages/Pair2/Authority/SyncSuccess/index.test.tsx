/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

describe('Pair2/Authority/SyncSuccess page', () => {
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
      'You’re syncing'
    );
    screen.getByText(
      'Your tabs, bookmarks, passwords, and more are ready across your devices.'
    );
  });

  it('exposes the illustration to assistive technology', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen
        .getAllByRole('img')
        .map((img) => img.getAttribute('alt') ?? img.getAttribute('aria-label'))
    ).toEqual([
      'Mozilla logo'
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
});
