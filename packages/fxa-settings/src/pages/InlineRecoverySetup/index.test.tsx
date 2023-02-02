/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../models/mocks';
// import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import InlineRecoverySetup, { viewName } from '.';
import { usePageViewEvent } from '../../lib/metrics';
import { MOCK_RECOVERY_CODES, MOCK_SERVICE_NAME } from './mocks';
import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
}));

describe('InlineRecoverySetup', () => {
  // let bundle: FluentBundle;
  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn();
    //   bundle = await getFtlBundle('settings');
  });
  it('renders default content as expected', () => {
    renderWithRouter(
      <InlineRecoverySetup
        recoveryCodes={MOCK_RECOVERY_CODES}
        showConfirmation={false}
      />
    );
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    screen.getByRole('heading', {
      name: `Save backup authentication codes to continue to ${MozServices.Default}`,
    });
    screen.getByText(
      'Store these one-time use codes in a safe place for when you don’t have your mobile device.'
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Print' })).toBeInTheDocument();
    expect(screen.getByTestId('databutton-download')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
  });
  it('renders as expected with a custom service name', () => {
    renderWithRouter(
      <InlineRecoverySetup
        recoveryCodes={MOCK_RECOVERY_CODES}
        showConfirmation={false}
        serviceName={MOCK_SERVICE_NAME}
      />
    );
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    screen.getByRole('heading', {
      name: `Save backup authentication codes to continue to ${MOCK_SERVICE_NAME}`,
    });
  });

  it('renders "showConfirmation" content as expected', () => {
    renderWithRouter(
      <InlineRecoverySetup
        recoveryCodes={MOCK_RECOVERY_CODES}
        showConfirmation
      />
    );
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    screen.getByRole('heading', {
      name: `Confirm backup authentication code to continue to ${MozServices.Default}`,
    });
    screen.queryByLabelText('Document that contains hidden text.');
    screen.getByLabelText('Backup authentication code');
    screen.getByRole('button', { name: 'Confirm' });
    screen.getByRole('button', { name: 'Back' });
    screen.getByRole('button', { name: 'Cancel setup' });
  });
  it('renders "showConfirmation" content as expected with a custom service name', () => {
    renderWithRouter(
      <InlineRecoverySetup
        recoveryCodes={MOCK_RECOVERY_CODES}
        showConfirmation
        serviceName={MOCK_SERVICE_NAME}
      />
    );
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    screen.getByRole('heading', {
      name: `Confirm backup authentication code to continue to ${MOCK_SERVICE_NAME}`,
    });
  });
  it('renders as expected when context is iOS', () => {
    renderWithRouter(
      <InlineRecoverySetup
        recoveryCodes={MOCK_RECOVERY_CODES}
        showConfirmation={false}
        isIOS
      />
    );
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });

    expect(screen.queryByTestId('databutton-download')).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Print' })
    ).not.toBeInTheDocument();
  });

  it('emits the expected metrics on render', () => {
    renderWithRouter(
      <InlineRecoverySetup
        recoveryCodes={MOCK_RECOVERY_CODES}
        showConfirmation={false}
      />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
