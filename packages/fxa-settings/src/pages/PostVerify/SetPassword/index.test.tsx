/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { act } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { createMockIntegration, Subject } from './mocks';
import { screen } from '@testing-library/react';
import { MOCK_EMAIL } from '../../mocks';
import { RelierCmsInfo } from '../../../models';

describe('SetPassword page', () => {
  it('renders as expected', async () => {
    await act(() => {
      renderWithLocalizationProvider(<Subject />);
    });

    expect(
      screen.getByRole('heading', { name: 'Create password to sync' })
    ).toBeInTheDocument();
    expect(screen.getByText(MOCK_EMAIL)).toBeInTheDocument();
    expect(
      screen.getByText(
        'This encrypts your data. It needs to be different from your Google or Apple account password.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Start syncing')).toBeInTheDocument();
  });

  it('renders CMS overrides when PostVerifySetPasswordPage is set', async () => {
    const cmsInfo = {
      shared: { buttonColor: '#333' },
      PostVerifySetPasswordPage: {
        headline: 'Set a sync password',
        description: 'Your password encrypts your synced data.',
        primaryButtonText: 'Sync now',
      },
    } as unknown as RelierCmsInfo;

    await act(() => {
      renderWithLocalizationProvider(
        <Subject integration={createMockIntegration(cmsInfo)} />
      );
    });

    expect(
      screen.getByRole('heading', { name: 'Set a sync password' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Your password encrypts your synced data.')
    ).toBeInTheDocument();
    expect(screen.getByText('Sync now')).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Create password to sync' })
    ).not.toBeInTheDocument();
  });
});
