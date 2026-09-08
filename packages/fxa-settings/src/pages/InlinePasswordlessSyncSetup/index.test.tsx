/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

const MOCK_ERROR_MESSAGE = 'Something went wrong. Please try again.';

describe('InlinePasswordlessSyncSetup', () => {
  it('renders the success banner, heading, description, and both actions', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByRole('status')).toHaveTextContent('Signed in to Sync');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Skip the password next time?'
    );
    screen.getByText('Use this passkey to sign in faster.');
    expect(
      screen.getByRole('button', { name: 'Enable passkey' })
    ).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Not now' })).toBeEnabled();
  });

  it('renders the Sync illustration', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen.getByRole('img', { name: 'Clouds with a sync icon' })
    ).toBeInTheDocument();
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

  it('leaves Not now available while enabling', () => {
    renderWithLocalizationProvider(<Subject isEnabling />);

    expect(screen.getByRole('button', { name: 'Not now' })).toBeEnabled();
  });

  it('renders no error banner when there is no error', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the error banner when storing the passkey failed', () => {
    renderWithLocalizationProvider(
      <Subject localizedErrorBannerMessage={MOCK_ERROR_MESSAGE} />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(MOCK_ERROR_MESSAGE);
  });

  it('removes the success banner when the error banner is shown', () => {
    renderWithLocalizationProvider(
      <Subject localizedErrorBannerMessage={MOCK_ERROR_MESSAGE} />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('Signed in to Sync')).not.toBeInTheDocument();
  });
});
