/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent, UserEvent } from '@testing-library/user-event';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { DangerZone } from './index';
import { Email } from 'fxa-admin-server/src/graphql';
import { DELETE_RECOVERY_PHONE } from './index.gql';
import { RECORD_ADMIN_SECURITY_EVENT } from '../Account/index.gql';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { mockConfigBuilder } from '../../../lib/config';
import { IClientConfig } from '../../../../interfaces';

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

const mockAlert = jest.fn();
const mockConfirm = jest.fn();

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(mockAlert);
  jest.spyOn(window, 'confirm').mockImplementation(mockConfirm);
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

class DeleteRecoveryPhone {
  static request(uid: string) {
    return {
      query: DELETE_RECOVERY_PHONE,
      variables: { uid },
    };
  }

  static result(success: boolean = true) {
    return {
      data: { deleteRecoveryPhone: success },
    };
  }

  static mock(uid: string, success: boolean = true): MockedResponse {
    return {
      request: this.request(uid),
      result: this.result(success),
    };
  }

  static errorMock(uid: string, error: Error): MockedResponse {
    return {
      request: this.request(uid),
      error,
    };
  }
}

class RecordAdminSecurityEvent {
  static request(uid: string, name: string) {
    return {
      query: RECORD_ADMIN_SECURITY_EVENT,
      variables: { uid, name },
    };
  }

  static result() {
    return {
      data: { recordAdminSecurityEvent: {} },
    };
  }

  static mock(uid: string, name: string): MockedResponse {
    return {
      request: this.request(uid, name),
      result: this.result(),
    };
  }
}

function renderDangerZone(
  props: Partial<typeof defaultProps> = {},
  mocks: MockedResponse[] = []
) {
  const mergedProps = { ...defaultProps, ...props };
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <DangerZone {...mergedProps} />
    </MockedProvider>
  );
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

      const mocks = [
        DeleteRecoveryPhone.mock('test-uid-123'),
        RecordAdminSecurityEvent.mock(
          'test-uid-123',
          'account.recovery_phone_deleted'
        ),
      ];

      renderDangerZone({}, mocks);

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

      const error = new Error('Network error');
      const mocks = [DeleteRecoveryPhone.errorMock('test-uid-123', error)];

      renderDangerZone({}, mocks);

      await user.click(screen.getByTestId('delete-recovery-phone'));

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          'Error deleting recovery phone.'
        );
      });
    });

    it('handles GraphQL error in deleteRecoveryPhone mutation', async () => {
      mockConfirm.mockReturnValue(true);

      const graphQLError = {
        message: 'GraphQL error',
        locations: [{ line: 1, column: 1 }],
        path: ['deleteRecoveryPhone'],
      };

      const error = new Error('GraphQL error') as any;
      error.graphQLErrors = [graphQLError];

      const mocks = [DeleteRecoveryPhone.errorMock('test-uid-123', error)];

      renderDangerZone({}, mocks);

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
