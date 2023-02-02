/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
// import { getFtlBundle, testL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import InlineTotpSetup, { viewName } from '.';
import { usePageViewEvent } from '../../lib/metrics';
import { MozServices } from '../../lib/types';
import { MOCK_CODE, MOCK_EMAIL } from './mocks';
import { REACT_ENTRYPOINT } from '../../constants';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

describe('InlineTotpSetup', () => {
  // let bundle: FluentBundle;
  beforeAll(async () => {
    global.URL.createObjectURL = jest.fn();
    //   bundle = await getFtlBundle('settings');
  });
  it('renders default as expected', () => {
    render(<InlineTotpSetup code={MOCK_CODE} email={MOCK_EMAIL} />);
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    screen.getByRole('heading', {
      name: `Enable two-step authentication to continue to ${MozServices.Default}`,
    });
    expect(
      screen.getByLabelText('A device with a hidden 6-digit code.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel setup' })
    ).toBeInTheDocument();
  });

  it('renders intro view as expected with custom service name', () => {
    render(
      <InlineTotpSetup
        code={MOCK_CODE}
        email={MOCK_EMAIL}
        serviceName={MozServices.FirefoxMonitor}
      />
    );
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    screen.getByRole('heading', {
      name: `Enable two-step authentication to continue to ${MozServices.FirefoxMonitor}`,
    });
    expect(
      screen.getByLabelText('A device with a hidden 6-digit code.')
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Continue' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancel setup' })
    ).toBeInTheDocument();
  });

  it('renders QR code by default when a user clicks "Continue"', async () => {
    render(<InlineTotpSetup code={MOCK_CODE} email={MOCK_EMAIL} />);
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);
    await screen.findByAltText(
      `Use the code ${MOCK_CODE} to set up two-step authentication in supported applications.`
    );
  });

  it('toggles from QR code to manual secret code view when user clicks "Can\'t scan code"', async () => {
    render(<InlineTotpSetup code={MOCK_CODE} email={MOCK_EMAIL} />);
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);
    await screen.findByAltText(
      `Use the code ${MOCK_CODE} to set up two-step authentication in supported applications.`
    );

    const changeToManualModeButton = screen.getByRole('button', {
      name: 'Can’t scan code?',
    });
    fireEvent.click(changeToManualModeButton);
    await screen.findByRole('button', { name: 'Scan QR code instead?' });
  });

  it('toggles from secret code to QR code view when user clicks "Scan QR code instead?', async () => {
    render(<InlineTotpSetup code={MOCK_CODE} email={MOCK_EMAIL} />);
    // const ftlMsgMock = screen.getAllByTestId('ftlmsg-mock')[1];
    // testL10n(ftlMsgMock, bundle, {
    //   email: exampleEmail,
    // });
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    fireEvent.click(continueButton);
    await screen.findByAltText(
      `Use the code ${MOCK_CODE} to set up two-step authentication in supported applications.`
    );
    const changeToManualModeButton = screen.getByRole('button', {
      name: 'Can’t scan code?',
    });
    fireEvent.click(changeToManualModeButton);
    await screen.findByRole('button', { name: 'Scan QR code instead?' });
    fireEvent.click(
      screen.getByRole('button', { name: 'Scan QR code instead?' })
    );
    await screen.findByAltText(
      `Use the code ${MOCK_CODE} to set up two-step authentication in supported applications.`
    );
  });

  it('emits the expected metrics on render', () => {
    render(<InlineTotpSetup code={MOCK_CODE} email={MOCK_EMAIL} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });
});
