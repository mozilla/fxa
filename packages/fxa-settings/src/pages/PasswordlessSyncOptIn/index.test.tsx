/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FluentBundle } from '@fluent/bundle';
import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

describe('PasswordlessSyncOptIn', () => {
  // Guards against drift between the fallback text in the component and the
  // actual Fluent bundle. No message on this page takes a variable, so no
  // arguments are passed.
  it('renders every message with text matching the Fluent bundle', async () => {
    const bundle: FluentBundle = await getFtlBundle('settings');
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getAllByTestId('ftlmsg-mock').length).toBeGreaterThan(0);
    testAllL10n(screen, bundle);
  });

  it('renders the success banner, heading, description, and both actions', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByRole('status')).toHaveTextContent('Signed into Sync');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Skip the password next time?'
    );
    screen.getByText('Use this passkey to sign in faster.');
    expect(
      screen.getByRole('button', { name: 'Enable passkey' })
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Not now' })).toBeEnabled();
  });

  it('calls onEnable when the enable button is clicked', async () => {
    const user = userEvent.setup();
    const onEnable = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onEnable }} />);

    await user.click(screen.getByRole('button', { name: 'Enable passkey' }));

    expect(onEnable).toHaveBeenCalledTimes(1);
  });

  it('calls onNotNow when the not now button is clicked', async () => {
    const user = userEvent.setup();
    const onNotNow = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ onNotNow }} />);

    await user.click(screen.getByRole('button', { name: 'Not now' }));

    expect(onNotNow).toHaveBeenCalledTimes(1);
  });

  it('swaps the enable button for a disabled loading label while enabling', () => {
    renderWithLocalizationProvider(<Subject isEnabling />);

    expect(screen.getByRole('button', { name: 'Enabling…' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Enable passkey' })
    ).not.toBeInTheDocument();
  });

  it('disables Not now while enabling, so a decline cannot race the write', () => {
    renderWithLocalizationProvider(<Subject isEnabling />);

    expect(screen.getByRole('button', { name: 'Not now' })).toBeDisabled();
  });

  it('renders no error banner by default', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the error banner when storing the passkey failed', () => {
    renderWithLocalizationProvider(
      <Subject localizedErrorBannerMessage="Something went wrong" />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
