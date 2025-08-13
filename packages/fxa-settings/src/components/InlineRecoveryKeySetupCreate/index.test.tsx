/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { RelierCmsInfo } from '../../models';

describe('InlineRecoveryKeySetupCreate', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);

    screen.getByText('You’re signed in to Firefox', { exact: false });
    screen.getByRole('heading', {
      name: 'Secure your account',
    });
    screen.getByLabelText(
      'Illustration to represent an account recovery key.',
      {
        selector: 'svg',
        exact: false,
      }
    );
    screen.getByRole('heading', {
      name: 'Got a minute to protect your data?',
    });
    screen.getByText(
      'Create an account recovery key so you can restore your sync browsing data if you ever forget your password.'
    );
    screen.getByRole('button', {
      name: 'Do it later',
    });
    const button = screen.getByRole('button', {
      name: 'Create account recovery key',
    });

    expect(button).toMatchSnapshot();
  });

  it('renders button with CMS passthrough', () => {
    const cmsInfo: RelierCmsInfo = {
      name: '',
      clientId: '',
      entrypoint: '',
      shared: {
        buttonColor: '#000000',
        logoUrl: '',
        logoAltText: ''
      }
    };
    // in this test, we don't want the full container, only the button that
    // cms info is passed onto to ensure we're still passing through
    renderWithLocalizationProvider(
      <Subject cmsInfo={cmsInfo} />
    );

    const cmsButton = screen.queryByRole('button', {
      name: 'Create account recovery key',
    });

    // shared.buttonColor gets applied and is in snapshot
    expect(cmsButton).toMatchSnapshot();
  });
});
