/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { act, fireEvent, screen } from '@testing-library/react';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { Constants } from '../../lib/constants';
import * as ReactUtils from '../../../../fxa-react/lib/utils';

function mockReactUtilsModule() {
  jest.spyOn(ReactUtils, 'hardNavigate').mockImplementation(() => {});
}

describe('InlineRecoveryKeySetup', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReactUtilsModule();
  });

  it('renders as expected, step 1', () => {
    renderWithLocalizationProvider(<Subject currentStep={1} />);

    // Expect 'create' component to be rendered
    screen.getByRole('heading', {
      name: 'Got a minute to protect your data?',
    });
  });
  it('renders as expected, step 2', () => {
    renderWithLocalizationProvider(<Subject currentStep={2} />);

    screen.getByText('Account recovery key created', { exact: false });

    screen.getByRole('heading', {
      name: 'Secure your account',
    });
    screen.getByLabelText('account recovery key', {
      selector: 'svg',
      exact: false,
    });
    screen.getByRole('heading', {
      name: 'Download and store it now',
    });
    screen.getByText(
      'Store this key somewhere you’ll remember — you won’t be able to get back to this page later.'
    );

    // Renders RecoveryKeySetupDownload
    screen.getByRole('heading', {
      name: 'Places to store your key:',
    });
  });
  it('renders as expected, step 3', () => {
    renderWithLocalizationProvider(<Subject currentStep={3} />);
    screen.getByRole('heading', {
      name: 'Security recommendation',
    });
    // Renders RecoveryKeySetupHint
    screen.getByRole('heading', {
      name: 'Add a hint to help find your key',
    });
  });

  it('clicks `do it later` navigates to `connect_another_device`', async () => {
    renderWithLocalizationProvider(<Subject />);
    await act(async () => {
      fireEvent.click(await screen.findByText('Do it later'));
    });
    expect(ReactUtils.hardNavigate).toHaveBeenCalledWith(
      '/connect_another_device',
      {},
      true
    );
    expect(
      localStorage.getItem(
        Constants.DISABLE_PROMO_ACCOUNT_RECOVERY_KEY_DO_IT_LATER
      )
    ).toBe('true');
  });
});
