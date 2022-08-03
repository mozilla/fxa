/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Chance from 'chance';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import {
  CLEAR_BOUNCES_BY_EMAIL,
  RECORD_ADMIN_SECURITY_EVENT,
} from './Account/index';
import { GET_ACCOUNT_BY_EMAIL, AccountSearch, GET_EMAILS_LIKE } from './index';
import {
  AdminPanelEnv,
  AdminPanelGroup,
  AdminPanelGuard,
} from 'fxa-shared/guards';

const chance = new Chance();

let testEmail: string;
let deleteBouncesMutationCalled = false;
let calledAccountSearch = false;
let calledGetEmailsLike = false;

// Mock AdminPanelGuard
const mockGuard = new AdminPanelGuard(AdminPanelEnv.Prod);
const mockGroup = mockGuard.getGroup(AdminPanelGroup.AdminProd);
jest.mock('../../hooks/UserContext.ts', () => {
  return {
    useUserContext: () => {
      const ctx = {
        guard: mockGuard,
        user: {
          email: 'test@mozilla.com',
          group: mockGroup,
        },
        setUser: () => {},
      };
      return ctx;
    },
  };
});

// Apollo mocks
class ClearBouncesByEmail {
  static request(email: string) {
    return {
      query: CLEAR_BOUNCES_BY_EMAIL,
      variables: {
        email,
      },
    };
  }
  static result() {
    deleteBouncesMutationCalled = true;
    return {
      data: {
        clearEmailBounce: true,
      },
    };
  }
  static mock(email: string): MockedResponse {
    return {
      request: this.request(email),
      result: this.result(),
    };
  }
}
class GetAccountsByEmail {
  static request(email: string, autoCompleted: boolean) {
    return {
      query: GET_ACCOUNT_BY_EMAIL,
      variables: {
        email,
        autoCompleted,
      },
    };
  }
  static result(email: string, minimal: boolean) {
    calledAccountSearch = true;

    // Minimal flag indicates a sparse response is okay
    if (minimal) {
      return {
        data: {
          accountByEmail: {
            uid: '123',
            createdAt: 1658534643990,
            disabledAt: null,
            lockedAt: null,
            emails: [
              {
                email,
                isVerified: true,
                isPrimary: true,
                createdAt: 1658534643990,
              },
            ],
            emailBounces: [],
            securityEvents: [],
            totp: [],
            recoveryKeys: [],
            linkedAccounts: [],
            attachedClients: [],
            subscriptions: [],
          },
        },
      };
    }

    // Otherwise provide richer result
    const bounce = {
      email,
      createdAt: chance.timestamp(),
      bounceType: 'Permanent',
      bounceSubType: 'General',
      diagnosticCode: 100,
      templateName: 'xyz',
    };

    return {
      data: {
        accountByEmail: {
          uid: 'a1b2c3',
          emails: [
            {
              email,
              isPrimary: true,
              isVerified: true,
              createdAt: chance.timestamp(),
            },
          ],
          createdAt: chance.timestamp(),
          disabledAt: null,
          lockedAt: null,
          emailBounces: [bounce, { ...bounce, createdAt: chance.timestamp() }],
          totp: [
            {
              verified: true,
              enabled: true,
              createdAt: 1589467100316,
            },
          ],
          recoveryKeys: [
            {
              createdAt: 1589467100316,
              verifiedAt: 1589467100316,
              enabled: true,
            },
          ],
          attachedClients: [
            {
              deviceId: 'xxxxxxxx-did-1',
              deviceType: 'desktop',
              clientId: null,
              createdTime: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
              createdTimeFormatted: '1 hour ago',
              lastAccessTime: new Date(Date.now() - 5 * 1e3).getTime(),
              lastAccessTimeFormatted: '5 seconds ago',
              location: {
                city: null,
                country: null,
                countryCode: null,
                state: null,
                stateCode: null,
              },
              name: "UserX's Nightly on machine-xyz",
              os: 'Mac OS X',
              userAgent: 'Chrome 89',
              sessionTokenId: 'xxxxxxxx-stid-1',
              refreshTokenId: null,
            },
          ],
          linkedAccounts: [],
          securityEvents: [],
          subscriptions: [],
        },
      },
    };
  }
  static mock(
    email: string,
    autoCompleted: boolean,
    minimal: boolean,
    error?: Error
  ) {
    return {
      request: this.request(email, autoCompleted),
      result: this.result(email, minimal),
      error,
    };
  }
}
class RecordAdminSecurityEvent {
  static request() {
    return {
      query: RECORD_ADMIN_SECURITY_EVENT,
      variables: {
        uid: 'a1b2c3',
        name: 'emails.clearBounces',
      },
    };
  }
  static result() {
    return {
      data: {
        recordAdminSecurityEvent: {},
      },
    };
  }
  static mock() {
    return {
      request: this.request(),
      result: this.result(),
    };
  }
}
class GetEmailsLike {
  static request(email: string) {
    console.log('GetEmailsLikeMock request', email);
    return {
      query: GET_EMAILS_LIKE,
      variables: {
        search: email.substring(0, 6),
      },
    };
  }
  static result(email: string) {
    console.log('GetEmailsLikeMock result', email);
    calledGetEmailsLike = true;
    return {
      data: {
        getEmailsLike: [{ email }],
      },
    };
  }
  static mock(email: string) {
    console.log('GetEmailsLikeMock');
    return {
      request: this.request(email),
      result: this.result(email),
    };
  }
}

// Helper function to render Account Search with mocks
function renderView(mocks: any) {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AccountSearch />
    </MockedProvider>
  );
}

const MinimalAccountResponse = (testEmail: string) => ({
  data: {
    accountByEmail: {
      uid: '123',
      createdAt: 1658534643990,
      disabledAt: null,
      lockedAt: null,
      emails: [
        {
          email: testEmail,
          isVerified: true,
          isPrimary: true,
          createdAt: 1658534643990,
        },
      ],
      emailBounces: [],
      securityEvents: [],
      totp: [],
      recoveryKeys: [],
      linkedAccounts: [],
      attachedClients: [],
      subscriptions: [],
    },
  },
});

const nextTick = (t?: number) => new Promise((r) => setTimeout(r, t || 0));

beforeEach(() => {
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  testEmail = chance.email();
  deleteBouncesMutationCalled = false;
  calledAccountSearch = false;
  calledGetEmailsLike = false;
});

afterEach(() => {
  jest.clearAllMocks();
});

it('renders without imploding', () => {
  render(<AccountSearch />);
  expect(screen.getByTestId('search-form')).toBeInTheDocument();
});

it('calls account search', async () => {
  renderView([GetAccountsByEmail.mock(testEmail, false, true)]);

  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  expect(calledAccountSearch).toBeTruthy();
});

fit('auto completes', async () => {
  renderView([
    GetEmailsLike.mock(testEmail),
    GetAccountsByEmail.mock(testEmail, true, true),
  ]);

  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail.substring(0, 6) },
  });
  await waitFor(() => screen.getByTestId('email-suggestions'));

  fireEvent.click(
    screen.getByTestId('email-suggestions').getElementsByTagName('a')[0]
  );
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  expect(calledGetEmailsLike).toBeTruthy();
  expect(calledAccountSearch).toBeTruthy();
  expect(screen.getByTestId('email-input')).toHaveValue(testEmail);
});

it('displays the account email bounces, and can clear them', async () => {
  renderView([
    GetAccountsByEmail.mock(testEmail, false, false),
    GetEmailsLike.mock(testEmail),
    RecordAdminSecurityEvent.mock(),
    ClearBouncesByEmail.mock(testEmail),
    GetAccountsByEmail.mock(testEmail, false, true),
  ]);

  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  expect(screen.queryAllByTestId('bounce-group').length).toEqual(2);

  fireEvent.click(screen.getByTestId('clear-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  await waitFor(() => screen.findAllByText(testEmail));
  expect(screen.queryAllByTestId('bounce-group').length).toEqual(0);
  expect(screen.getByTestId('no-bounces-message')).toBeInTheDocument();
  expect(deleteBouncesMutationCalled).toBeTruthy();
});

it('displays the error state if there is an error', async () => {
  renderView([
    GetAccountsByEmail.mock(testEmail, false, true, new Error('zoiks')),
  ]);

  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('error-message'));
  expect(calledAccountSearch).toBeTruthy();
});
