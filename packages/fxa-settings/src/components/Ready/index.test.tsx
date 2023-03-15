/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import Ready from '.';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { MozServices } from '../../lib/types';
import { REACT_ENTRYPOINT } from '../../constants';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

describe('Ready', () => {
  const customServiceName = MozServices.FirefoxSync;
  const viewName = 'reset-password-confirmed';
  const isSignedIn = true;
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });

  it('renders as expected with default values', () => {
    render(<Ready {...{ viewName, isSignedIn }} />);
    // testAllL10n(screen, bundle);

    const passwordResetConfirmation = screen.getByText(
      'Your password has been reset'
    );
    const serviceAvailabilityConfirmation = screen.getByText(
      'You’re now ready to use account settings'
    );
    const passwordResetContinueButton = screen.queryByText('Continue');
    // Calling `getByText` will fail if the first two elements aren't in the document,
    // but we test anyway to make the intention of the test explicit
    expect(passwordResetContinueButton).not.toBeInTheDocument();
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('renders as expected when given a service name', () => {
    render(
      <Ready {...{ viewName, isSignedIn }} serviceName={customServiceName} />
    );

    const passwordResetConfirmation = screen.getByText(
      'Your password has been reset'
    );
    const serviceAvailabilityConfirmation = screen.getByText(
      `You’re now ready to use ${customServiceName}`
    );
    const passwordResetContinueButton = screen.queryByText('Continue');
    // Calling `getByText` will fail if these elements aren't in the document,
    // but we test anyway to make the intention of the test explicit
    expect(passwordResetContinueButton).not.toBeInTheDocument();
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('renders as expected when page is viewed by a logged out user', () => {
    render(<Ready isSignedIn={false} {...{ viewName }} />);

    const passwordResetConfirmation = screen.getByText(
      'Your password has been reset'
    );
    const serviceAvailabilityConfirmation = screen.getByText(
      'Your account is ready!'
    );
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('renders as expected the service is sync', () => {
    render(<Ready isSignedIn={false} isSync {...{ viewName }} />);

    const passwordResetConfirmation = screen.getByText(
      'Your password has been reset'
    );
    const prompt = screen.getByText(
      'Complete setup by entering your new password on your other Firefox devices.'
    );
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(prompt).toBeInTheDocument();
  });

  it('renders as expected when given a service name and relier continue action', () => {
    render(
      <Ready
        {...{
          viewName,
          isSignedIn,
        }}
        serviceName={customServiceName}
        continueHandler={() => {
          console.log('beepboop');
        }}
      />
    );

    const passwordResetConfirmation = screen.getByText(
      'Your password has been reset'
    );
    const serviceAvailabilityConfirmation = screen.getByText(
      `You’re now ready to use ${customServiceName}`
    );
    const passwordResetContinueButton = screen.getByText('Continue');
    // Calling `getByText` would fail if these elements weren't in the document,
    // but we test anyway to make the intention of the test explicit
    expect(passwordResetContinueButton).toBeInTheDocument();
    expect(passwordResetConfirmation).toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).toBeInTheDocument();
  });

  it('emits a metrics event on render', () => {
    render(<Ready {...{ viewName, isSignedIn }} />);
    expect(usePageViewEvent).toHaveBeenCalledWith(viewName, REACT_ENTRYPOINT);
  });

  it('emits a metrics event when a user clicks `Continue`', () => {
    render(
      <Ready
        continueHandler={() => {
          console.log('beepboop');
        }}
        serviceName={customServiceName}
        {...{ viewName, isSignedIn }}
      />
    );
    const passwordResetContinueButton = screen.getByText('Continue');
    const fullActionName = `flow.${viewName}.continue`;
    fireEvent.click(passwordResetContinueButton);
    expect(logViewEvent).toHaveBeenCalledWith(
      viewName,
      fullActionName,
      REACT_ENTRYPOINT
    );
  });
});
