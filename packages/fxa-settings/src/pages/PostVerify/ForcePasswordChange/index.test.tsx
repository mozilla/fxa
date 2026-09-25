/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import { Subject } from './mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { HandledError } from '../../../lib/error-utils';
import {
  logViewEvent,
  logViewEventOnce,
  usePageViewEvent,
} from '../../../lib/metrics';
import { REACT_ENTRYPOINT } from '../../../constants';

jest.mock('../../../lib/metrics', () => ({
  logViewEvent: jest.fn(),
  logViewEventOnce: jest.fn(),
  usePageViewEvent: jest.fn(),
}));

const OLD_PASSWORD = 'oldPassword123!';
const NEW_PASSWORD = 'brandNewPassw0rd!';

async function fillForm(oldPassword: string, newPassword: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Old password'), oldPassword);
  await user.type(screen.getByLabelText('New password'), newPassword);
  await user.type(screen.getByLabelText('Confirm password'), newPassword);
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Change password' })
    ).toBeEnabled()
  );
  await user.click(screen.getByRole('button', { name: 'Change password' }));
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ForcePasswordChange page', () => {
  it('renders as expected', () => {
    renderWithLocalizationProvider(<Subject />);

    expect(
      screen.getByRole('heading', { name: 'Please change your password' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We detected suspicious behavior/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Synced history, bookmarks, logins, and other personal data will not be lost.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Change password' })
    ).toBeDisabled();
    expect(usePageViewEvent).toHaveBeenCalledWith(
      'force-password-change',
      REACT_ENTRYPOINT
    );
  });

  it.each([
    'fxa-force-password-change-header',
    'opassword',
    'password',
    'vpassword',
    'submit-btn',
  ])('keeps the #%s id used by the functional test page object', (id) => {
    const { container } = renderWithLocalizationProvider(<Subject />);
    expect(container.querySelector(`#${id}`)).toBeInTheDocument();
  });

  it('submits the old and new passwords', async () => {
    const changePasswordHandler = jest.fn().mockResolvedValue({ error: null });
    renderWithLocalizationProvider(<Subject {...{ changePasswordHandler }} />);

    await fillForm(OLD_PASSWORD, NEW_PASSWORD);

    expect(changePasswordHandler).toHaveBeenCalledWith(
      OLD_PASSWORD,
      NEW_PASSWORD
    );
    expect(logViewEventOnce).toHaveBeenCalledWith(
      'flow',
      'force-password-change.engage',
      REACT_ENTRYPOINT
    );
    expect(logViewEvent).toHaveBeenCalledWith(
      'flow',
      'force-password-change.submit',
      REACT_ENTRYPOINT
    );
  });

  it('shows an error without submitting when the new password is the old one', async () => {
    const changePasswordHandler = jest.fn();
    renderWithLocalizationProvider(<Subject {...{ changePasswordHandler }} />);

    await fillForm(NEW_PASSWORD, NEW_PASSWORD);

    expect(
      await screen.findByText(AuthUiErrors.PASSWORDS_MUST_BE_DIFFERENT.message)
    ).toBeInTheDocument();
    expect(changePasswordHandler).not.toHaveBeenCalled();
  });

  it('shows the handler error in a banner', async () => {
    renderWithLocalizationProvider(
      <Subject
        changePasswordHandler={() =>
          Promise.resolve({
            error: AuthUiErrors.INCORRECT_PASSWORD as HandledError,
          })
        }
      />
    );

    await fillForm(OLD_PASSWORD, NEW_PASSWORD);

    expect(
      await screen.findByText(AuthUiErrors.INCORRECT_PASSWORD.message)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Change password' })
    ).toBeEnabled();
  });
});
