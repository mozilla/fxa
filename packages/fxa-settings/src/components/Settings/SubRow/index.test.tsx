/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubRow, {
  BackupCodesSubRow,
  BackupPhoneSubRow,
  PasskeySubRow,
} from './index';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER,
  MOCK_MASKED_PHONE_NUMBER_WITH_COPY,
} from '../../../pages/mocks';
import { Passkey } from '../UnitRowPasskey';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { mockAuthClient } from './mock';
import { LocationProvider } from '@reach/router';

const mockJwtState = {};
const mockAlertBar = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  JwtTokenCache: {
    hasToken: jest.fn(() => true),
    subscribe: jest.fn((listener) => () => {}),
    getSnapshot: jest.fn(() => mockJwtState),
  },
  sessionToken: jest.fn(() => 'session-123'),
}));

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => mockAuthClient,
  useAlertBar: () => mockAlertBar,
}));

describe('SubRow', () => {
  const defaultProps = {
    ctaGleanId: 'glean-test',
    ctaMessage: 'Create new codes',
    ctaTestId: 'cta-button',
    icon: <div>Icon</div>,
    idPrefix: 'test',
    localizedDescription: 'More info message',
    message: <div>Message</div>,
    onCtaClick: jest.fn(),
    localizedRowTitle: 'Backup authentication codes',
  };

  it('renders correctly when available', () => {
    renderWithLocalizationProvider(
      <SubRow {...defaultProps} statusIcon="checkmark" />
    );
    expect(screen.getByText('Backup authentication codes')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    expect(screen.getByText('Create new codes')).toBeInTheDocument();
    expect(screen.getByText('More info message')).toBeInTheDocument();
  });

  it('renders correctly when unavailable', () => {
    render(<SubRow {...defaultProps} statusIcon="alert" border={false} />);
    expect(screen.getByText('Backup authentication codes')).toBeInTheDocument();
    expect(screen.getByText('Message')).toBeInTheDocument();
    const cta = screen.getByRole('button', { name: 'Create new codes' });
    expect(cta).toBeInTheDocument();
  });

  it('calls onCtaClick when CTA button is clicked', async () => {
    renderWithLocalizationProvider(
      <SubRow {...defaultProps} statusIcon="checkmark" />
    );
    await userEvent.click(screen.getByText('Create new codes'));
    expect(defaultProps.onCtaClick).toHaveBeenCalled();
  });
});

describe('BackupCodesSubRow', () => {
  describe('when codes available', () => {
    const defaultProps = {
      numCodesAvailable: 5,
      onCtaClick: jest.fn(),
    };

    it('renders correctly when codes available', () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('5 codes remaining')).toBeInTheDocument();
      expect(screen.getByText('Create new codes')).toBeInTheDocument();
    });

    it('renders correctly when 1 code is available', () => {
      renderWithLocalizationProvider(
        <BackupCodesSubRow {...defaultProps} numCodesAvailable={1} />
      );
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('1 code remaining')).toBeInTheDocument();
    });

    it('renders description when showDescription is true', () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('5 codes remaining')).toBeInTheDocument();
      expect(screen.getByText('Create new codes')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This is the safest recovery method if you canʼt use your mobile device or authenticator app.'
        )
      ).toBeInTheDocument();
    });

    it('calls onCtaClick when CTA button is clicked', async () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      await userEvent.click(screen.getByText('Create new codes'));
      expect(defaultProps.onCtaClick).toHaveBeenCalled();
    });
  });

  describe('when codes unavailable', () => {
    const defaultProps = {
      numCodesAvailable: 0,
      onCtaClick: jest.fn(),
    };
    it('renders correctly when codes unavailable', () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      expect(
        screen.getByText('Backup authentication codes')
      ).toBeInTheDocument();
      expect(screen.getByText('No codes available')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('calls onCtaClick when CTA button is clicked', async () => {
      renderWithLocalizationProvider(<BackupCodesSubRow {...defaultProps} />);
      await userEvent.click(screen.getByText('Add'));
      expect(defaultProps.onCtaClick).toHaveBeenCalled();
    });
  });
});

describe('BackupPhoneSubRow', () => {
  const defaultProps = {
    onCtaClick: jest.fn(),
    phoneNumber: MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER,
  };

  it('renders correctly when no phone number added', () => {
    renderWithLocalizationProvider(
      <BackupPhoneSubRow onCtaClick={jest.fn()} />
    );
    expect(screen.getByText('Recovery phone')).toBeInTheDocument();
    expect(screen.getByText('No phone number added')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'This is the easiest recovery method if you canʼt use your authenticator app.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/Learn about SIM swap risk/)).toBeInTheDocument();
  });

  it('renders correctly when phone number exists and delete is not an option', () => {
    renderWithLocalizationProvider(<BackupPhoneSubRow {...defaultProps} />);
    expect(screen.getByText('Recovery phone')).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Change' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'If you want to remove your recovery phone, add backup authentication codes or disable two-step authentication first to avoid getting locked out of your account.'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Learn about SIM swap risk/)
    ).not.toBeInTheDocument();
  });

  it('renders correctly when user does not have a verified session', () => {
    renderWithLocalizationProvider(
      <BackupPhoneSubRow
        {...defaultProps}
        phoneNumber={MOCK_MASKED_PHONE_NUMBER_WITH_COPY}
      />
    );
    expect(screen.getByText('Recovery phone')).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MASKED_PHONE_NUMBER_WITH_COPY)
    ).toBeInTheDocument();
  });

  it('renders correctly when phone number exists and delete is an option', () => {
    renderWithLocalizationProvider(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={jest.fn()} />
    );
    expect(screen.getByText('Recovery phone')).toBeInTheDocument();
    expect(
      screen.getByText(MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Change' })
    ).toBeInTheDocument();
    const deleteButtons = screen.getAllByTitle(/Remove/);
    expect(deleteButtons).toHaveLength(2);
    expect(
      screen.getByText(
        'This is the easiest recovery method if you canʼt use your authenticator app.'
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Learn about SIM swap risk/)
    ).not.toBeInTheDocument();
  });

  it('calls onCtaClick when no phone number added', async () => {
    const onCtaClick = jest.fn();
    renderWithLocalizationProvider(<BackupPhoneSubRow {...{ onCtaClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onCtaClick).toHaveBeenCalled();
  });

  it('calls onCtaClick when phone number exists and CTA button is clicked', async () => {
    renderWithLocalizationProvider(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={jest.fn()} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Change' }));
    expect(defaultProps.onCtaClick).toHaveBeenCalled();
  });

  // Jest is finding two buttons because they are conditionally rendered based on the container size.
  // While supported by major browsers, container queries are not natively supported or simulated by Jest
  // because it does not render components in a real browser-like environment with full CSS support.
  // Container queries, like other CSS layout features, depend on the actual rendering engine
  // to compute styles and apply layout rules based on parent container properties.
  it('renders delete button when onDeleteClick is provided', () => {
    renderWithLocalizationProvider(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={jest.fn()} />
    );
    expect(screen.getAllByTitle(/Remove/)).toHaveLength(2);
  });

  it('calls onDeleteClick when either delete button is clicked', async () => {
    const onDeleteClick = jest.fn();
    renderWithLocalizationProvider(
      <BackupPhoneSubRow {...defaultProps} onDeleteClick={onDeleteClick} />
    );
    await userEvent.click(screen.getAllByTitle(/Remove/)[0]);
    await userEvent.click(screen.getAllByTitle(/Remove/)[1]);
    expect(onDeleteClick).toHaveBeenCalledTimes(2);
  });
});

describe('PasskeySubRow', () => {
  const mockPasskey = {
    id: 'passkey-1',
    name: 'MacBook Pro',
    createdAt: new Date('2026-01-01').getTime(),
    lastUsed: new Date('2026-02-01').getTime(),
    canSync: true,
  };

  const mockDeletePasskey = jest.fn();

  beforeEach(() => {
    mockDeletePasskey.mockClear();
    mockAlertBar.success.mockClear();
    mockAlertBar.error.mockClear();
  });

  const renderPasskeySubRow = (
    passkey: Passkey = mockPasskey,
    deletePasskey = mockDeletePasskey
  ) => {
    return render(
      <LocationProvider>
        <AppContext.Provider value={mockAppContext()}>
          <PasskeySubRow passkey={passkey} deletePasskey={deletePasskey} />
        </AppContext.Provider>
      </LocationProvider>
    );
  };

  it('renders as expected with last used date', () => {
    renderPasskeySubRow();
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Last used:/)).toBeInTheDocument();
    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    expect(deleteButtons).toHaveLength(2);
  });

  it('does not render last used date when not available', () => {
    const passkeyWithoutLastUsed = { ...mockPasskey, lastUsed: undefined };
    renderPasskeySubRow(passkeyWithoutLastUsed);
    expect(screen.queryByText(/Last used:/)).not.toBeInTheDocument();
  });

  it('renders message when canSync is false', () => {
    const passkeyWithoutSync = { ...mockPasskey, canSync: false };
    renderPasskeySubRow(passkeyWithoutSync);
    expect(
      screen.queryByText('Sign in only. Can’t be used to sync.')
    ).toBeInTheDocument();
  });

  it('does not render message when canSync is true', () => {
    renderPasskeySubRow();
    expect(
      screen.queryByText('Sign in only. Can’t be used to sync.')
    ).not.toBeInTheDocument();
  });

  it('opens modal when delete button is clicked', async () => {
    renderPasskeySubRow();
    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This passkey will be removed from your account. You’ll need to sign in using a different way.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByTestId('confirm-delete-passkey-button')
    ).toBeInTheDocument();
  });

  it('closes modal when cancel button is clicked', async () => {
    renderPasskeySubRow();
    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(
        screen.queryByText('Delete your passkey?')
      ).not.toBeInTheDocument();
    });
  });

  it('calls deletePasskey when confirm button is clicked', async () => {
    mockDeletePasskey.mockResolvedValue(undefined);
    renderPasskeySubRow();

    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete-passkey-button');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeletePasskey).toHaveBeenCalledWith('passkey-1');
    });
  });

  it('shows success banner when deletion succeeds', async () => {
    mockDeletePasskey.mockResolvedValue(undefined);
    renderPasskeySubRow();

    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete-passkey-button');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAlertBar.success).toHaveBeenCalledWith('Passkey deleted');
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Delete your passkey?')
      ).not.toBeInTheDocument();
    });
  });

  it('shows error banner when deletion fails', async () => {
    mockDeletePasskey.mockRejectedValue(new Error('Some error'));
    renderPasskeySubRow();

    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete-passkey-button');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAlertBar.error).toHaveBeenCalledWith(
        'There was a problem deleting your passkey. Try again in a few minutes.'
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Delete your passkey?')
      ).not.toBeInTheDocument();
    });
  });
});
