/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import * as ReachRouter from '@reach/router';

describe('ServiceWelcome', () => {
  describe('success banner', () => {
    it('renders the confirmed success banner', () => {
      renderWithLocalizationProvider(<Subject />);
      expect(screen.getByText('Mozilla account confirmed')).toBeInTheDocument();
    });

    it('renders the signed-in success banner when origin is signin', () => {
      jest.spyOn(ReachRouter, 'useLocation').mockImplementation(
        () =>
          ({
            state: { origin: 'signin' },
          }) as ReturnType<typeof ReachRouter.useLocation>
      );
      renderWithLocalizationProvider(<Subject />);
      expect(screen.getByText('Signed in successfully!')).toBeInTheDocument();
    });
  });

  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);
    expect(
      screen.getByRole('heading', { name: 'Next: Turn on VPN' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'One more step to boost your browser’s privacy. Go to the open panel and turn it on.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Firefox window with a circular badge showing a green checkmark and “VPN,” showing the VPN is active.',
      })
    ).toBeInTheDocument();
  });
});
