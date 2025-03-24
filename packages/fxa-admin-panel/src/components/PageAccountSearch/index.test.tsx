/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Chance from 'chance';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { AccountSearch } from './index';
import { EDIT_LOCALE, RECORD_ADMIN_SECURITY_EVENT } from './Account/index.gql';
import { GET_ACCOUNT_BY_EMAIL, GET_EMAILS_LIKE } from './index.gql';
import {
  AdminPanelEnv,
  AdminPanelGroup,
  AdminPanelGuard,
} from 'fxa-shared/guards';
import { UNSUBSCRIBE_FROM_MAILING_LISTS } from './DangerZone/index.gql';
import { CLEAR_BOUNCES_BY_EMAIL } from './EmailBounces/index.gql';

const chance = new Chance();

let testEmail: string;
let testLocale: string = 'en-US';
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
            clientSalt: '',
            createdAt: 1658534643990,
            verifierSetAt: 1589467100316,
            disabledAt: null,
            locale: testLocale,
            lockedAt: null,
            email: email,
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
            backupCodes: [],
            recoveryPhone: [],
            recoveryKeys: [],
            linkedAccounts: [],
            attachedClients: [],
            subscriptions: [],
            accountEvents: [],
            carts: [],
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
          clientSalt: '',
          verifierSetAt: 1589467100316,
          email: email,
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
          locale: testLocale,
          lockedAt: null,
          emailBounces: [bounce, { ...bounce, createdAt: chance.timestamp() }],
          totp: [
            {
              verified: true,
              enabled: true,
              createdAt: 1589467100316,
            },
          ],
          backupCodes: [
            {
              hasBackupCodes: true,
              count: 3,
            },
          ],
          recoveryPhone: [
            {
              exists: true,
              lastFourDigits: '7890',
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
          carts: [],
          accountEvents: [
            {
              name: 'emailSent',
              createdAt: new Date(Date.now() - 60 * 60 * 1e3).getTime(),
              template: 'recovery',
              eventType: 'emailEvent',
              service: 'sync',
            },
          ],
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

class EditLocaleMock {
  static request(uid: string, locale: string) {
    // Update the test locale fake state. This will effect the result from
    // the GetAccountsByEmail.mock
    testLocale = locale;
    return {
      query: EDIT_LOCALE,
      variables: {
        uid,
        locale,
      },
    };
  }

  static result(success: boolean) {
    return {
      data: {
        editLocale: success,
      },
    };
  }

  static mock(uid: string, locale: string, success: boolean) {
    return {
      request: this.request(uid, locale),
      result: this.result(success),
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
    return {
      query: GET_EMAILS_LIKE,
      variables: {
        search: email.substring(0, 6),
      },
    };
  }
  static result(email: string) {
    calledGetEmailsLike = true;
    return {
      data: {
        getEmailsLike: [{ email }],
      },
    };
  }
  static mock(email: string) {
    return {
      request: this.request(email),
      result: this.result(email),
    };
  }
}

// Helper function to render Account Search with mocks
function renderView(mocks?: any) {
  render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <AccountSearch />
    </MockedProvider>
  );
}

beforeEach(() => {
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  testEmail = chance.email();
  deleteBouncesMutationCalled = false;
  calledAccountSearch = false;
  calledGetEmailsLike = false;
  testLocale = 'en-US';
});

afterEach(() => {
  jest.clearAllMocks();
});

it('renders without imploding', () => {
  renderView();
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

it('auto completes', async () => {
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
  expect(deleteBouncesMutationCalled).toBe(true);
});

it('displays the error state if there is an error', async () => {
  renderView([
    GetAccountsByEmail.mock(testEmail, false, true, new Error('zoiks')),
  ]);

  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));
  await waitFor(() => screen.getByTestId('error-alert'));
  expect(calledAccountSearch).toBeTruthy();
});

describe('Editing user locale', () => {
  let localeEl: HTMLElement;
  let alertSpy: jest.SpyInstance;
  let promptSpy: jest.SpyInstance;

  // A setup method instead of beforeEach so params can be used.
  async function setup(newLocale: string | null, success: boolean = true) {
    const mocks = [
      GetAccountsByEmail.mock(testEmail, false, true),
      EditLocaleMock.mock('123', 'en-CA', success),
      GetAccountsByEmail.mock(testEmail, false, true),
    ];

    renderView(mocks);

    // Look up account
    fireEvent.change(await screen.findByTestId('email-input'), {
      target: { value: testEmail },
    });
    fireEvent.click(screen.getByTestId('search-button'));

    localeEl = await screen.findByTestId('account-locale');
    expect(localeEl).toHaveTextContent('en-US');

    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {
      return true;
    });
    promptSpy = jest.spyOn(window, 'prompt').mockImplementation(() => {
      return newLocale;
    });
  }

  it('edits locale', async () => {
    await setup('en-CA');
    fireEvent.click(await screen.findByTestId('edit-account-locale'));
    await waitFor(() => {
      expect(localeEl).toHaveTextContent('en-CA');
    });
  });

  it('cancels edit of locale', async () => {
    await setup(null);
    fireEvent.click(await screen.findByTestId('edit-account-locale'));

    await waitFor(() => {
      expect(localeEl).toHaveTextContent('en-US');
    });
    expect(promptSpy).toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('reports failure during edit', async () => {
    await setup('en-CA', false);
    fireEvent.click(await screen.findByTestId('edit-account-locale'));

    await waitFor(() => {
      // Content should not change
      expect(localeEl).toHaveTextContent('en-US');
    });
    expect(promptSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(`Edit unsuccessful.`);
  });

  it('reports error during edit', async () => {
    // This will throw an error, because there is no matching mock, which
    // allows testing the error case.
    await setup('NA', false);
    fireEvent.click(await screen.findByTestId('edit-account-locale'));

    await waitFor(() => {
      // Content should not change
      expect(localeEl).toHaveTextContent('en-US');
    });
    expect(promptSpy).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      `An unexpected error was encountered. Edit unsuccessful.`
    );
  });
});

describe('unsubscribe from mailing lists', () => {
  class Unsubscribe {
    static readonly ErrorMessage = 'Error unsubscribing';

    static request(uid: string) {
      return {
        query: UNSUBSCRIBE_FROM_MAILING_LISTS,
        variables: {
          uid: uid,
        },
      };
    }
    static result(success: boolean) {
      return {
        data: { unsubscribeFromMailingLists: success },
      };
    }

    static mock(uid: string, success: boolean) {
      return {
        request: this.request(uid),
        result: this.result(success),
      };
    }
  }

  let alertSpy: jest.SpyInstance;

  async function renderAndClickUnSubscribe(success: boolean) {
    renderView([
      GetAccountsByEmail.mock(testEmail, false, true),
      Unsubscribe.mock('123', success),
    ]);

    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {
      return true;
    });

    fireEvent.change(screen.getByTestId('email-input'), {
      target: { value: testEmail },
    });
    fireEvent.click(screen.getByTestId('search-button'));
    await waitFor(() => screen.getByTestId('account-section'));
    fireEvent.click(screen.getByTestId('unsubscribe-from-mailing-lists'));
    await waitFor(() => new Promise((r) => setTimeout(r, 100)));
  }

  it('handles unsubscribe', async () => {
    await renderAndClickUnSubscribe(true);
    expect(alertSpy).toBeCalledWith(
      "The user's email has been unsubscribed from mozilla mailing lists."
    );
  });

  it('handles unsubscribe failure', async () => {
    await renderAndClickUnSubscribe(false);
    expect(alertSpy).toHaveBeenCalledWith('Unsubscribing was not successful.');
  });
});
