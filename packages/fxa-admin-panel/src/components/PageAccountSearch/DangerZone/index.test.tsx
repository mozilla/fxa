/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { DangerZone } from './index';
import { Email } from 'fxa-admin-server/src/types';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { mockConfigBuilder } from '../../../lib/config';
import { IClientConfig } from '../../../../interfaces';
import { adminApi } from '../../../lib/api';

const mockGuard = new AdminPanelGuard(GuardEnv.Prod);
const mockGroup = mockGuard.getGroup(AdminPanelGroup.AdminProd);

const mockConfig: IClientConfig = mockConfigBuilder({
  user: {
    email: 'test@mozilla.com',
    group: mockGroup,
  },
});

jest.mock('../../../hooks/UserContext.ts', () => ({
  useUserContext: () => {
    const ctx = {
      guard: mockGuard,
      user: mockConfig.user,
      setUser: () => {},
    };
    return ctx;
  },
}));

jest.mock('../../../hooks/GuardContext.ts', () => ({
  useGuardContext: () => ({
    guard: mockGuard,
  }),
}));

jest.mock('../../../lib/api', () => ({
  adminApi: {
    unverifyEmail: jest.fn(),
    unsubscribeFromMailingLists: jest.fn(),
    disableAccount: jest.fn(),
    enableAccount: jest.fn(),
    remove2FA: jest.fn(),
    deleteRecoveryPhone: jest.fn(),
    recordSecurityEvent: jest.fn(),
  },
}));

const mockAlert = jest.fn();
const mockConfirm = jest.fn();

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(mockAlert);
  jest.spyOn(window, 'confirm').mockImplementation(mockConfirm);
  (adminApi.recordSecurityEvent as jest.Mock).mockResolvedValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

const mockEmail: Email = {
  email: 'test@example.com',
  isVerified: true,
  isPrimary: true,
  createdAt: 1589467100316,
};

const defaultProps = {
  uid: 'test-uid-123',
  email: mockEmail,
  disabledAt: null,
  onCleared: jest.fn(),
  has2FA: true,
  hasRecoveryPhone: true,
};

function renderDangerZone(props: Partial<typeof defaultProps> = {}) {
  const mergedProps = { ...defaultProps, ...props };
  return render(<DangerZone {...mergedProps} />);
}

describe('DangerZone Component', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('Delete Recovery Phone', () => {
    it('renders delete recovery phone button when user has 2FA and recovery phone', () => {
      renderDangerZone();

      expect(screen.getByText('Delete Recovery Phone')).toBeInTheDocument();
      expect(
        screen.getByText("Delete the account's recovery phone number.")
      ).toBeInTheDocument();
      expect(screen.getByTestId('delete-recovery-phone')).toBeInTheDocument();
    });

    it('does not render delete recovery phone button when user has no 2FA', () => {
      renderDangerZone({ has2FA: false });

      expect(
        screen.queryByText('Delete Recovery Phone')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('delete-recovery-phone')
      ).not.toBeInTheDocument();
    });

    it('does not render delete recovery phone button when user has no recovery phone', () => {
      renderDangerZone({ hasRecoveryPhone: false });

      expect(
        screen.queryByText('Delete Recovery Phone')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('delete-recovery-phone')
      ).not.toBeInTheDocument();
    });

    it('does not render delete recovery phone button when user has neither 2FA nor recovery phone', () => {
      renderDangerZone({ has2FA: false, hasRecoveryPhone: false });

      expect(
        screen.queryByText('Delete Recovery Phone')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('delete-recovery-phone')
      ).not.toBeInTheDocument();
    });

    it('shows confirmation dialog when delete recovery phone button is clicked', async () => {
      mockConfirm.mockReturnValue(false);

      renderDangerZone();

      await user.click(screen.getByTestId('delete-recovery-phone'));

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure? This cannot be undone.'
      );
    });

    it('calls deleteRecoveryPhone mutation when user confirms deletion', async () => {
      mockConfirm.mockReturnValue(true);
      (adminApi.deleteRecoveryPhone as jest.Mock).mockResolvedValue(true);

      renderDangerZone();

      await user.click(screen.getByTestId('delete-recovery-phone'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Recovery phone has been deleted.'
        );
        expect(defaultProps.onCleared).toHaveBeenCalled();
      });
    });

    it('handles failed deleteRecoveryPhone mutation', async () => {
      mockConfirm.mockReturnValue(true);
      (adminApi.deleteRecoveryPhone as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      renderDangerZone();

      await user.click(screen.getByTestId('delete-recovery-phone'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error deleting recovery phone.'
        );
      });
    });

    it('handles error in deleteRecoveryPhone mutation', async () => {
      mockConfirm.mockReturnValue(true);
      (adminApi.deleteRecoveryPhone as jest.Mock).mockRejectedValue(
        new Error('Error')
      );

      renderDangerZone();

      await user.click(screen.getByTestId('delete-recovery-phone'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error deleting recovery phone.'
        );
      });
    });
  });

  describe('Component Rendering', () => {
    it('renders danger zone section', () => {
      renderDangerZone();

      expect(screen.getByTestId('danger-zone-section')).toBeInTheDocument();
    });

    it('renders all danger zone action buttons when user has appropriate permissions', () => {
      renderDangerZone();

      expect(screen.getByTestId('unverify-email')).toBeInTheDocument();
      expect(screen.getByTestId('disable-account')).toBeInTheDocument();
      expect(screen.getByTestId('remove-2fa')).toBeInTheDocument();
      expect(screen.getByTestId('delete-recovery-phone')).toBeInTheDocument();
      expect(
        screen.getByTestId('unsubscribe-from-mailing-lists')
      ).toBeInTheDocument();
    });

    it('hides danger zone actions when user does not have appropriate permissions', () => {
      jest.spyOn(mockGuard, 'allow').mockReturnValue(false);

      renderDangerZone();

      // the section should still be rendered, but buttons should not be visible
      expect(screen.getByTestId('danger-zone-section')).toBeInTheDocument();

      expect(screen.queryByTestId('unverify-email')).not.toBeInTheDocument();
      expect(screen.queryByTestId('disable-account')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remove-2fa')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('delete-recovery-phone')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('unsubscribe-from-mailing-lists')
      ).not.toBeInTheDocument();
    });
  });
});
