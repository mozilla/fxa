/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../../models/mocks';
import { Subject } from './mocks';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  MOCK_FULL_PHONE_NUMBER,
  MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
} from '../../../pages/mocks';

jest.mock('../../../models/AlertBarInfo');

const phoneNumberWithoutCountryCode = MOCK_FULL_PHONE_NUMBER.slice(2);
const otpCode = '123456';
const mockSuccessResponse = {
  nationalFormat: MOCK_NATIONAL_FORMAT_PHONE_NUMBER,
};

const completeStepOne = async (user: UserEvent) => {
  await waitFor(() =>
    user.type(
      screen.getByRole('textbox', { name: /Enter phone number/i }),
      phoneNumberWithoutCountryCode
    )
  );
  user.click(screen.getByRole('button', { name: /Send code/i }));
};

// Note, most unit tests are in component tests rendered for each step of the flow
describe('PageRecoveryPhoneSetup', () => {
  it('renders step 1 by default', () => {
    renderWithRouter(<Subject />);
    // renders step 1 component
    expect(
      screen.getByText(/You’ll get a text message from Mozilla/i)
    ).toBeInTheDocument();
  });

  it('add recovery phone with successful submission renders step 2', async () => {
    const user = userEvent.setup();
    const addRecoveryPhone = jest
      .fn()
      .mockResolvedValueOnce(mockSuccessResponse);
    renderWithRouter(<Subject account={{ addRecoveryPhone }} />);

    await completeStepOne(user);
    await waitFor(() => expect(addRecoveryPhone).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(addRecoveryPhone).toHaveBeenCalledWith(MOCK_FULL_PHONE_NUMBER)
    );
    expect(
      screen.queryByText(/You’ll get a text message from Mozilla/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText(/A six-digit code was sent/i)).toBeInTheDocument();
  });

  it('at step 2, allows code resend', async () => {
    const user = userEvent.setup();
    const confirmRecoveryPhone = jest
      .fn()
      .mockResolvedValueOnce(mockSuccessResponse);
    const addRecoveryPhone = jest
      .fn()
      .mockResolvedValueOnce(mockSuccessResponse)
      .mockResolvedValueOnce(mockSuccessResponse);
    renderWithRouter(
      <Subject account={{ confirmRecoveryPhone, addRecoveryPhone }} />
    );

    await completeStepOne(user);
    await waitFor(() => {
      expect(
        screen.getByText(/A six-digit code was sent/i)
      ).toBeInTheDocument();
    });

    user.click(
      screen.getByRole('button', {
        name: /Resend code/i,
      })
    );

    await waitFor(() => expect(addRecoveryPhone).toHaveBeenCalledTimes(2));
    expect(addRecoveryPhone).toHaveBeenNthCalledWith(1, MOCK_FULL_PHONE_NUMBER);
    expect(addRecoveryPhone).toHaveBeenNthCalledWith(2, MOCK_FULL_PHONE_NUMBER);
  });

  it('at step 2, allows code confirm', async () => {
    const user = userEvent.setup();
    const confirmRecoveryPhone = jest
      .fn()
      .mockResolvedValueOnce(mockSuccessResponse);
    const addRecoveryPhone = jest
      .fn()
      .mockResolvedValueOnce(mockSuccessResponse);
    renderWithRouter(
      <Subject account={{ confirmRecoveryPhone, addRecoveryPhone }} />
    );

    await completeStepOne(user);
    await waitFor(() => {
      expect(
        screen.getByText(/A six-digit code was sent/i)
      ).toBeInTheDocument();
    });
    await waitFor(async () => {
      await user.type(screen.getByLabelText(/Enter 6-digit code/i), otpCode);
      user.click(screen.getByRole('button', { name: /Confirm/i }));
    });

    await waitFor(() => expect(confirmRecoveryPhone).toHaveBeenCalledTimes(1));
    expect(confirmRecoveryPhone).toHaveBeenCalledWith(
      otpCode,
      MOCK_FULL_PHONE_NUMBER
    );
  });
});
