/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import CompleteSignin from '.';
import { usePageViewEvent } from '../../lib/metrics';
import { renderWithRouter } from '../../models/mocks';

jest.mock('../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('@reach/router', () => ({
  ...jest.requireActual('@reach/router'),
  useNavigate: () => mockNavigate,
}));

describe('CompleteSignin', () => {
  it('redirects the user as expected after validation when the link is valid', async () => {
    renderWithRouter(
      <CompleteSignin linkStatus="valid" isForPrimaryEmail={true} />
    );
    // TO-DO: Add in user signin validation and test for it.
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin_verified');
    });
  });

  it('calls the custom broker method supplied if given a valid link', async () => {
    renderWithRouter(
      <CompleteSignin
        linkStatus="valid"
        isForPrimaryEmail={true}
        brokerNextAction={() => {
          mockNavigate('/my_example_route');
        }}
      />
    );
    // TO-DO: Add in user signin validation and test for it.
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/my_example_route');
    });
  });

  it('renders the component as expected when provided with an expired link', () => {
    renderWithRouter(
      <CompleteSignin linkStatus="expired" isForPrimaryEmail={true} />
    );

    screen.getByRole('heading', {
      name: 'Confirmation link expired',
    });
    screen.getByText('The link you clicked to confirm your email is expired.');
    screen.getByRole('button', {
      name: 'Receive new link',
    });
    // Components that should not be rendered when the link is expired
    const signinConfirmation = screen.queryByText('Sign-in confirmed');
    const serviceAvailabilityConfirmation = screen.queryByText(
      'You’re now ready to use account settings'
    );
    expect(signinConfirmation).not.toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).not.toBeInTheDocument();
  });

  it('renders the component as expected when provided with a damaged link', () => {
    renderWithRouter(
      <CompleteSignin linkStatus="damaged" isForPrimaryEmail={true} />
    );

    screen.getByRole('heading', {
      name: 'Confirmation link damaged',
    });
    screen.getByText(
      'The link you clicked was missing characters, and may have been broken by your email client. Copy the address carefully, and try again.'
    );

    // Components that should not be rendered when the link is damaged
    const receiveNewLink = screen.queryByRole('button', {
      name: 'Receive new link',
    });

    expect(receiveNewLink).not.toBeInTheDocument();
    const signinConfirmation = screen.queryByText('Sign-in confirmed');
    const serviceAvailabilityConfirmation = screen.queryByText(
      'You’re now ready to use account settings'
    );
    expect(signinConfirmation).not.toBeInTheDocument();
    expect(serviceAvailabilityConfirmation).not.toBeInTheDocument();
  });

  it('renders the component as expected when provided with a used link', () => {
    renderWithRouter(
      <CompleteSignin linkStatus="used" isForPrimaryEmail={true} />
    );

    screen.getByRole('heading', {
      name: 'Primary email already confirmed',
    });
    screen.getByText(
      'That confirmation link was already used, and can only be used once.'
    );
  });

  // TODO : check for metrics event when link is expired or damaged
  it('emits the expected metrics on render when the link is valid', () => {
    renderWithRouter(
      <CompleteSignin linkStatus="valid" isForPrimaryEmail={true} />
    );
    expect(usePageViewEvent).toHaveBeenCalledWith('complete-signin', {
      entrypoint_variation: 'react',
    });
  });
});
