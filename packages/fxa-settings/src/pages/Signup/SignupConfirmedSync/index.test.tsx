/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';

import { createMockIntegration, Subject } from './mocks';
import * as ReactUtils from 'fxa-react/lib/utils';
import { firefox } from '../../../lib/channels/firefox';
import { RelierCmsInfo } from '../../../models';

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
    renderWithLocalizationProvider(<Subject />);

    expect(screen.getByText('Mozilla account confirmed')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sync is turned on' })
    ).toBeInTheDocument();
  });

  it('shows the "with payment" description and both action links on desktop', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen.getByText(
        'Your passwords, payment methods, addresses, bookmarks, history, and more can sync everywhere you use Firefox.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Add another device')).toBeInTheDocument();
    expect(screen.getByText('Manage sync')).toBeInTheDocument();
  });

  it('shows the "without payment" description when creditcards are not included in sync engines', () => {
    renderWithLocalizationProvider(
      <Subject offeredSyncEngines={['bookmarks']} />
    );

    expect(
      screen.getByText(
        'Your passwords, addresses, bookmarks, history, and more can sync everywhere you use Firefox.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('payment methods')).not.toBeInTheDocument();
  });

  it('hard navigates to /pair when "Add another device" is clicked', async () => {
    renderWithLocalizationProvider(<Subject />);

    await user.click(screen.getByText('Add another device'));
    expect(ReactUtils.hardNavigate).toHaveBeenCalledWith('/pair', {}, true);
  });

  it('calls fxaOpenSyncPreferences when "Manage sync" is clicked', async () => {
    renderWithLocalizationProvider(<Subject />);

    await user.click(screen.getByText('Manage sync'));
    expect(firefox.fxaOpenSyncPreferences).toHaveBeenCalledTimes(1);
  });

  it('on mobile, shows only "Manage sync"', () => {
    renderWithLocalizationProvider(
      <Subject integration={createMockIntegration(false)} />
    );

    expect(screen.queryByText('Add another device')).not.toBeInTheDocument();
    expect(screen.getByText('Manage sync')).toBeInTheDocument();
  });

  it('when coming from post-verify-set-password, displays expected banner', () => {
    renderWithLocalizationProvider(
      <Subject origin="post-verify-set-password" />
    );

    expect(screen.getByText('Sync password created')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sync is turned on' })
    ).toBeInTheDocument();
  });

  it('uses the CMS image if url and alt text exist', () => {
    const cmsInfo = {
      shared: { buttonColor: '#333' },
      SignupConfirmedSyncPage: {
        primaryImage: {
          url: 'https://example.com/sync.png',
          altText: 'sync is on',
        },
      },
    } as unknown as RelierCmsInfo;

    renderWithLocalizationProvider(
      <Subject integration={createMockIntegration(false, cmsInfo)} />
    );

    const cmsImg = screen.getByRole('img', { name: 'sync is on' });
    expect(cmsImg).toHaveAttribute('src', 'https://example.com/sync.png');
  });
});
