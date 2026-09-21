/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';

describe('InlinePasswordlessSyncSetup', () => {
  it('renders the success banner, heading, description, and both actions', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Signed in to Firefox'
    );
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

  it('replaces the success banner with the error when one is given', () => {
    renderWithLocalizationProvider(
      <Subject
        error={{
          type: 'warning',
          content: {
            localizedHeading: 'Passkey confirmation didn’t finish',
            localizedDescription: 'Confirm with your passkey.',
          },
          link: {
            url: 'https://example.test',
            localizedText: 'How to use passkeys',
          },
        }}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Passkey confirmation didn’t finish'
    );
    expect(
      screen.getByRole('link', { name: /How to use passkeys/ })
    ).toHaveAttribute('href', 'https://example.test');
    screen.getByText('Confirm with your passkey.');
    expect(screen.queryByText('Signed in to Firefox')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enable passkey' })
    ).toBeEnabled();
  });

  it('disables both actions while enabling', () => {
    renderWithLocalizationProvider(<Subject isEnabling />);

    expect(screen.getByRole('button', { name: 'Enabling…' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Enable passkey' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Not now' })).toBeDisabled();
  });
});
