/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
// import { getFtlBundle, testAllL10n } from 'fxa-react/lib/test-utils';
// import { FluentBundle } from '@fluent/bundle';
import { usePageViewEvent } from '../../lib/metrics';
import ConfirmSignin from '.';
import { EXAMPLE_EMAIL } from './mocks';
import { act } from 'react-dom/test-utils';

jest.mock('../../lib/metrics', () => ({
  usePageViewEvent: jest.fn(),
  logViewEvent: jest.fn(),
}));

const mockGoBackCallback = jest.fn();

describe('ConfirmSignin', () => {
  // TODO: enable l10n tests when they've been updated to handle embedded tags in ftl strings
  // TODO: in FXA-6461
  // let bundle: FluentBundle;
  // beforeAll(async () => {
  //   bundle = await getFtlBundle('settings');
  // });
  // TODO: add tests for all metrics as they are added

  it("renders default view as expected with user's email", () => {
    render(
      <ConfirmSignin email={EXAMPLE_EMAIL} isOpenWebmailButtonVisible={false} />
    );
    // testAllL10n(screen, bundle);

    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm this sign-in');
    screen.getByText(
      `Check your email for the sign-in confirmation link sent to ${EXAMPLE_EMAIL}`
    );
    screen.getByRole('button', { name: 'Not in inbox or spam folder? Resend' });
  });

  it('resends the email when the user clicks the resend button', () => {
    render(
      <ConfirmSignin email={EXAMPLE_EMAIL} isOpenWebmailButtonVisible={false} />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm this sign-in');
    // check that the back button is present
    const resendEmailButton = screen.getByRole('button', {
      name: 'Not in inbox or spam folder? Resend',
    });
    fireEvent.click(resendEmailButton);
    // TO-DO: Once we know where this functionality is coming from, we'll be able to test it.
    // Add in a test to verify that it's called.
  });

  it('shows the Open Webmail button if in the appropriate context', () => {
    render(
      <ConfirmSignin email={EXAMPLE_EMAIL} isOpenWebmailButtonVisible={true} />
    );
    const openWebmailButton = screen.getByRole('link', {
      name: 'Open Gmail Opens in new window',
    });
  });

  it('renders the expected view with the Back button when user can go back', async () => {
    render(
      <ConfirmSignin
        email={EXAMPLE_EMAIL}
        canGoBack={true}
        goBackCallback={mockGoBackCallback}
        isOpenWebmailButtonVisible={false}
      />
    );
    const headingEl = screen.getByRole('heading', { level: 1 });
    expect(headingEl).toHaveTextContent('Confirm this sign-in');
    const backButton = screen.getByRole('button', {
      name: 'Back',
    });
    backButton.click();
    await waitFor(() => expect(mockGoBackCallback).toBeCalled());
  });

  it('emits a metrics event on render', () => {
    render(
      <ConfirmSignin email={EXAMPLE_EMAIL} isOpenWebmailButtonVisible={false} />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith(`confirm-signin`, {
      entrypoint_variation: 'react',
    });
  });
});
