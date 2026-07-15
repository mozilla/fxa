/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubRow, {
  BackupCodesSubRow,
  BackupPhoneSubRow,
  PasskeySubRow,
  validatePasskeyName,
} from './index';
import { renderWithLocalizationProvider } from 'fxa-react/lib/test-utils/localizationProvider';
import {
  MOCK_MASKED_NATIONAL_FORMAT_PHONE_NUMBER,
  MOCK_MASKED_PHONE_NUMBER_WITH_COPY,
} from '../../../pages/mocks';
import { Passkey } from 'fxa-auth-client/browser';
import { AppContext } from '../../../models';
import { mockAppContext } from '../../../models/mocks';
import { AuthUiErrors } from '../../../lib/auth-errors/auth-errors';
import { mockAuthClient } from './mock';
import { MemoryRouter } from 'react-router';
import GleanMetrics from '../../../lib/glean';

let mockHasJwt = true;
let mockJwtSnapshot: { hasToken: boolean } = { hasToken: true };
const mockJwtListeners = new Set<() => void>();

const mockAlertBar = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

let mockAccount = {
  deletePasskey: jest.fn(),
  renamePasskey: jest.fn(),
  passkeys: [] as Passkey[],
};

jest.mock('../../../lib/glean', () => ({
  __esModule: true,
  default: {
    handleClickEvent: jest.fn(),
    accountPref: {
      passkeyDeleteView: jest.fn(),
      passkeyDeleteSuccessView: jest.fn(),
      passkeyDeleteSubmitFrontendError: jest.fn(),
      passkeyRenameView: jest.fn(),
      passkeyRenameSuccessView: jest.fn(),
      passkeyRenameSubmitFrontendError: jest.fn(),
      mfaGuardView: jest.fn(),
      mfaGuardSubmitSuccess: jest.fn(),
    },
  },
}));

jest.mock('../../../lib/cache', () => ({
  ...jest.requireActual('../../../lib/cache'),
  JwtTokenCache: {
    hasToken: jest.fn(() => mockHasJwt),
    subscribe: jest.fn((listener: () => void) => {
      mockJwtListeners.add(listener);
      return () => {
        mockJwtListeners.delete(listener);
      };
    }),
    getSnapshot: jest.fn(() => mockJwtSnapshot),
    removeToken: jest.fn(() => {
      mockHasJwt = false;
      mockJwtSnapshot = { hasToken: false };
      mockJwtListeners.forEach((l) => l());
    }),
  },
  sessionToken: jest.fn(() => 'session-123'),
}));

jest.mock('../../../models', () => ({
  ...jest.requireActual('../../../models'),
  useAuthClient: () => mockAuthClient,
  useAlertBar: () => mockAlertBar,
  useAccount: () => mockAccount,
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
  const mockPasskey: Passkey = {
    credentialId: 'passkey-1',
    name: 'MacBook Pro',
    createdAt: new Date('2026-01-01').getTime(),
    lastUsedAt: new Date('2026-02-01').getTime(),
    transports: ['internal'],
    aaguid: 'aaguid-1',
    backupEligible: true,
    backupState: true,
    prfEnabled: true,
  };

  beforeEach(() => {
    mockAccount.deletePasskey.mockClear();
    mockAccount.renamePasskey.mockClear();
    mockAccount.passkeys = [];
    mockAlertBar.success.mockClear();
    mockAlertBar.error.mockClear();
    (GleanMetrics.accountPref.passkeyDeleteView as jest.Mock).mockClear();
    (
      GleanMetrics.accountPref.passkeyDeleteSuccessView as jest.Mock
    ).mockClear();
    (
      GleanMetrics.accountPref.passkeyDeleteSubmitFrontendError as jest.Mock
    ).mockClear();
    (GleanMetrics.accountPref.passkeyRenameView as jest.Mock).mockClear();
    (
      GleanMetrics.accountPref.passkeyRenameSuccessView as jest.Mock
    ).mockClear();
    (
      GleanMetrics.accountPref.passkeyRenameSubmitFrontendError as jest.Mock
    ).mockClear();
    (GleanMetrics.handleClickEvent as jest.Mock).mockClear();
    mockHasJwt = true;
    mockJwtSnapshot = { hasToken: true };
    mockJwtListeners.clear();
  });

  const renderPasskeySubRow = (passkey: Passkey = mockPasskey) => {
    return render(
      <MemoryRouter>
        <AppContext.Provider value={mockAppContext()}>
          <PasskeySubRow passkey={passkey} />
        </AppContext.Provider>
      </MemoryRouter>
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
    const passkeyWithoutLastUsed = { ...mockPasskey, lastUsedAt: null };
    renderPasskeySubRow(passkeyWithoutLastUsed);
    expect(screen.queryByText(/Last used:/)).not.toBeInTheDocument();
  });

  it('opens modal when delete button is clicked', async () => {
    renderPasskeySubRow();
    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This passkey will be removed from your account. You’ll need to sign in using a different method (password, another passkey, or linked account).'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByTestId('confirm-delete-passkey-button')
    ).toBeInTheDocument();
    expect(GleanMetrics.accountPref.passkeyDeleteView).toHaveBeenCalledTimes(1);
  });

  // Regression (FXA-13881): the delete handler calls event.stopPropagation()
  // to keep the opening click from closing the modal, which also prevents the
  // click from reaching Glean's document-level auto-element-click listener.
  // The handler must record the click explicitly so
  // account_pref_passkey_delete_submit still reaches Looker.
  it('records the delete-button click via Glean when the delete button is clicked', async () => {
    renderPasskeySubRow();
    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(GleanMetrics.handleClickEvent).toHaveBeenCalledTimes(1);
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
    mockAccount.deletePasskey.mockResolvedValue(undefined);
    renderPasskeySubRow();

    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete-passkey-button');
    await userEvent.click(confirmButton);

    expect(mockAccount.deletePasskey).toHaveBeenCalledWith('passkey-1');
  });

  it('shows success banner when deletion succeeds', async () => {
    mockAccount.deletePasskey.mockResolvedValue(undefined);
    renderPasskeySubRow();

    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete-passkey-button');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAlertBar.success).toHaveBeenCalledWith('Passkey deleted');
    });
    expect(
      GleanMetrics.accountPref.passkeyDeleteSuccessView
    ).toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.queryByText('Delete your passkey?')
      ).not.toBeInTheDocument();
    });
  });

  it('shows generic error banner when deletion fails with an unexpected error', async () => {
    mockAccount.deletePasskey.mockRejectedValue(new Error('Some error'));
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
    expect(
      GleanMetrics.accountPref.passkeyDeleteSubmitFrontendError
    ).toHaveBeenCalledWith({ event: { reason: 'server_error' } });

    await waitFor(() => {
      expect(
        screen.queryByText('Delete your passkey?')
      ).not.toBeInTheDocument();
    });
  });

  it('shows "Passkey not found" error when passkey no longer exists', async () => {
    mockAccount.deletePasskey.mockRejectedValue(AuthUiErrors.PASSKEY_NOT_FOUND);
    renderPasskeySubRow();

    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete-passkey-button');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAlertBar.error).toHaveBeenCalledWith('Passkey not found');
    });
    expect(
      GleanMetrics.accountPref.passkeyDeleteSubmitFrontendError
    ).toHaveBeenCalledWith({ event: { reason: 'auth_error' } });

    await waitFor(() => {
      expect(
        screen.queryByText('Delete your passkey?')
      ).not.toBeInTheDocument();
    });
  });

  it('re-prompts for MFA without recording an error when the MFA JWT has expired', async () => {
    mockAccount.deletePasskey.mockRejectedValue(AuthUiErrors.INVALID_MFA_TOKEN);
    renderPasskeySubRow();

    const deleteButtons = screen.getAllByTitle(/Delete passkey/);
    await userEvent.click(deleteButtons[0]);

    expect(await screen.findByText('Delete your passkey?')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete-passkey-button');
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockAccount.deletePasskey).toHaveBeenCalledWith('passkey-1');
    });
    expect(mockAlertBar.error).not.toHaveBeenCalled();
    expect(
      GleanMetrics.accountPref.passkeyDeleteSubmitFrontendError
    ).not.toHaveBeenCalled();

    // MfaGuard renders the OTP prompt in place of its children, so the
    // delete confirmation modal is no longer in the DOM.
    expect(
      await screen.findByText('Enter confirmation code')
    ).toBeInTheDocument();
    expect(screen.queryByText('Delete your passkey?')).not.toBeInTheDocument();
  });

  describe('rename', () => {
    it('renders a rename button', () => {
      renderPasskeySubRow();
      expect(
        screen.getByRole('button', { name: /rename passkey/i })
      ).toBeInTheDocument();
    });

    it('opens the rename dialog and records a view event', async () => {
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      expect(
        await screen.findByRole('heading', { name: 'Rename passkey' })
      ).toBeInTheDocument();
      expect(GleanMetrics.accountPref.passkeyRenameView).toHaveBeenCalledTimes(
        1
      );
    });

    it('opens the dialog with the name pre-filled', async () => {
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      expect(await screen.findByRole('textbox')).toHaveValue('MacBook Pro');
    });

    it('opens the dialog when the passkey name is clicked', async () => {
      renderPasskeySubRow();
      // Clicking the visible name text (inside the trigger button) opens it.
      await userEvent.click(screen.getByText('MacBook Pro'));
      expect(await screen.findByRole('textbox')).toHaveValue('MacBook Pro');
    });

    it('calls renamePasskey with the trimmed new name on save', async () => {
      mockAccount.renamePasskey.mockResolvedValue(undefined);
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );

      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, '  Work laptop  ');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockAccount.renamePasskey).toHaveBeenCalledWith(
        'passkey-1',
        'Work laptop'
      );
    });

    it('shows a success banner and closes the dialog when rename succeeds', async () => {
      mockAccount.renamePasskey.mockResolvedValue(undefined);
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      await userEvent.type(screen.getByRole('textbox'), ' 2');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(mockAlertBar.success).toHaveBeenCalledWith('Passkey renamed');
      });
      expect(
        GleanMetrics.accountPref.passkeyRenameSuccessView
      ).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });

    it('shows a generic error banner when rename fails unexpectedly', async () => {
      mockAccount.renamePasskey.mockRejectedValue(new Error('boom'));
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      await userEvent.type(screen.getByRole('textbox'), ' 2');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      // The error shows inside the modal, not in the (occluded) alert bar.
      expect(
        await screen.findByText(
          'There was a problem renaming your passkey. Try again in a few minutes.'
        )
      ).toBeInTheDocument();
      expect(mockAlertBar.error).not.toHaveBeenCalled();
      expect(
        GleanMetrics.accountPref.passkeyRenameSubmitFrontendError
      ).toHaveBeenCalledWith({ event: { reason: 'server_error' } });
    });

    it('shows a localized auth error when rename fails with an auth error', async () => {
      mockAccount.renamePasskey.mockRejectedValue(
        AuthUiErrors.PASSKEY_NOT_FOUND
      );
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      await userEvent.type(screen.getByRole('textbox'), ' 2');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(await screen.findByText('Passkey not found')).toBeInTheDocument();
      expect(
        GleanMetrics.accountPref.passkeyRenameSubmitFrontendError
      ).toHaveBeenCalledWith({ event: { reason: 'auth_error' } });
    });

    it('closes the dialog without calling renamePasskey when cancelled', async () => {
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      });
      expect(mockAccount.renamePasskey).not.toHaveBeenCalled();
    });

    it('keeps the save button enabled on open', async () => {
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('disables save while an error is shown and re-enables it once the input is edited', async () => {
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText('Enter a name for this passkey')
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();

      await userEvent.type(input, 'New name');
      expect(
        screen.queryByText('Enter a name for this passkey')
      ).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
    });

    it('does not validate or show an error while typing before submit', async () => {
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      // Clearing makes the name invalid (empty), but nothing is submitted yet.
      await userEvent.clear(screen.getByRole('textbox'));
      expect(
        screen.queryByText('Enter a name for this passkey')
      ).not.toBeInTheDocument();
    });

    it('shows an error and does not submit when the name is cleared', async () => {
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      await userEvent.clear(screen.getByRole('textbox'));
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));
      expect(
        screen.getByText('Enter a name for this passkey')
      ).toBeInTheDocument();
      expect(mockAccount.renamePasskey).not.toHaveBeenCalled();
    });

    it('blocks renaming to a name already used by another passkey', async () => {
      mockAccount.passkeys = [
        mockPasskey,
        { ...mockPasskey, credentialId: 'passkey-2', name: 'Work laptop' },
      ];
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      // Case-insensitive match against the sibling passkey "Work laptop".
      await userEvent.type(input, 'work LAPTOP');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText('A passkey with this name already exists')
      ).toBeInTheDocument();
      expect(mockAccount.renamePasskey).not.toHaveBeenCalled();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('allows renaming to a name only used by the passkey being edited', async () => {
      mockAccount.passkeys = [
        mockPasskey,
        { ...mockPasskey, credentialId: 'passkey-2', name: 'Work laptop' },
      ];
      mockAccount.renamePasskey.mockResolvedValue(undefined);
      renderPasskeySubRow();
      await userEvent.click(
        screen.getByRole('button', { name: /rename passkey/i })
      );
      const input = screen.getByRole('textbox');
      await userEvent.clear(input);
      await userEvent.type(input, 'Home desktop');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(mockAccount.renamePasskey).toHaveBeenCalledWith(
        'passkey-1',
        'Home desktop'
      );
    });
  });
});

describe('validatePasskeyName', () => {
  it('returns undefined for a valid name', () => {
    expect(validatePasskeyName('My Passkey')).toBeUndefined();
  });

  it('returns undefined for a name at the 255-character limit', () => {
    expect(validatePasskeyName('a'.repeat(255))).toBeUndefined();
  });

  it('returns "empty" for an empty string', () => {
    expect(validatePasskeyName('')).toBe('empty');
  });

  it('returns "empty" for a whitespace-only string', () => {
    expect(validatePasskeyName('   ')).toBe('empty');
  });

  it('returns "too-long" for a name over 255 characters', () => {
    expect(validatePasskeyName('a'.repeat(256))).toBe('too-long');
  });

  it('returns "duplicate" when the name matches another passkey (case-insensitive)', () => {
    expect(validatePasskeyName('Work Laptop', ['work laptop'])).toBe(
      'duplicate'
    );
  });

  it('returns undefined when the name is unique among existing passkeys', () => {
    expect(validatePasskeyName('Phone', ['Work Laptop'])).toBeUndefined();
  });

  it('returns "invalid" for a name containing control characters', () => {
    expect(validatePasskeyName('bad\u0000name')).toBe('invalid');
  });

  // Most emoji are above the Basic Multilingual Plane (BMP), i.e. code points
  // beyond U+FFFF encoded as UTF-16 surrogate pairs. These are allowed, matching
  // the auth-server validator used for passkey and device names.
  it('allows a name containing emoji', () => {
    expect(validatePasskeyName('My Passkey \u{1F510}')).toBeUndefined();
  });
});
