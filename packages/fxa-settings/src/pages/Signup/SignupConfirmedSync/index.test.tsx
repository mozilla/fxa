/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import SignupConfirmedSync from '.';
import { createMockIntegration } from './mocks';
import * as ReactUtils from 'fxa-react/lib/utils';
import { firefox } from '../../../lib/channels/firefox';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

jest.mock('../../../lib/channels/firefox', () => ({
  ...jest.requireActual('../../../lib/channels/firefox'),
  firefox: {
    fxaOpenSyncPreferences: jest.fn(),
  },
}));

describe('SignupConfirmedSync', () => {
  let user: UserEvent;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReactUtilsModule();
    user = userEvent.setup();
  });

  it('renders the success banner heading and page title', () => {
    renderWithLocalizationProvider(
      <SignupConfirmedSync
        integration={createMockIntegration()}
        paymentMethodsSynced
      />
    );

    expect(screen.getByText('Mozilla account confirmed')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sync is turned on' })
    ).toBeInTheDocument();
  });

  it('shows the "with payment" description and both action links on desktop', () => {
    renderWithLocalizationProvider(
      <SignupConfirmedSync
        integration={createMockIntegration()}
        paymentMethodsSynced
      />
    );

    expect(
      screen.getByText(
        'Your passwords, payment methods, addresses, bookmarks, history, and more can sync everywhere you use Firefox.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Add another device')).toBeInTheDocument();
    expect(screen.getByText('Manage sync')).toBeInTheDocument();
  });

  it('shows the "without payment" description when paymentMethodsSynced=false', () => {
    renderWithLocalizationProvider(
      <SignupConfirmedSync
        integration={createMockIntegration()}
        paymentMethodsSynced={false}
      />
    );

    expect(
      screen.getByText(
        'Your passwords, addresses, bookmarks, history, and more can sync everywhere you use Firefox.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('payment methods')).not.toBeInTheDocument();
  });

  it('hard navigates to /pair when "Add another device" is clicked', async () => {
    renderWithLocalizationProvider(
      <SignupConfirmedSync
        integration={createMockIntegration()}
        paymentMethodsSynced
      />
    );

    await user.click(screen.getByText('Add another device'));
    expect(ReactUtils.hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
  });

  it('calls fxaOpenSyncPreferences when "Manage sync" is clicked', async () => {
    renderWithLocalizationProvider(
      <SignupConfirmedSync
        integration={createMockIntegration()}
        paymentMethodsSynced
      />
    );

    await user.click(screen.getByText('Manage sync'));
    expect(firefox.fxaOpenSyncPreferences).toHaveBeenCalledTimes(1);
  });

  it('on mobile, shows only "Manage sync"', () => {
    renderWithLocalizationProvider(
      <SignupConfirmedSync
        integration={createMockIntegration({ isDesktopSync: false })}
        paymentMethodsSynced
      />
    );

    expect(screen.queryByText('Add another device')).not.toBeInTheDocument();
    expect(screen.getByText('Manage sync')).toBeInTheDocument();
  });
});
