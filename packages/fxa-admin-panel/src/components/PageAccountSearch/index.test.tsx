/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import Chance from 'chance';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { AccountSearch, emailMatchLabel } from './index';
import { GuardEnv, AdminPanelGroup, AdminPanelGuard } from '@fxa/shared/guards';
import { adminApi } from '../../lib/api';

const chance = new Chance();

let testEmail: string;
let testPhone: string;

// Mock AdminPanelGuard
const mockGuard = new AdminPanelGuard(GuardEnv.Prod);
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

jest.mock('../../lib/api', () => ({
  adminApi: {
    getAccountByEmail: jest.fn(),
    getAccountByUid: jest.fn(),
    getAccountByPhone: jest.fn(),
    getEmailsLike: jest.fn(),
    getPhonesLike: jest.fn(),
    clearEmailBounce: jest.fn(),
    recordSecurityEvent: jest.fn(),
    editLocale: jest.fn(),
    unsubscribeFromMailingLists: jest.fn(),
    disableAccount: jest.fn(),
    enableAccount: jest.fn(),
    remove2FA: jest.fn(),
    deleteRecoveryPhone: jest.fn(),
    unlinkAccount: jest.fn(),
  },
}));

// Test data helpers
function makeMinimalAccount(email: string, locale = 'en-US') {
  return {
    uid: '123',
    clientSalt: '',
    createdAt: 1658534643990,
    verifierSetAt: 1589467100316,
    disabledAt: null,
    locale,
    lockedAt: null,
    email,
    emailVerified: true,
    emails: [
      { email, isVerified: true, isPrimary: true, createdAt: 1658534643990 },
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
  };
}

function makeRichAccount(email: string) {
  return {
    uid: 'a1b2c3',
    clientSalt: '',
    createdAt: chance.timestamp(),
    verifierSetAt: 1589467100316,
    disabledAt: null,
    locale: 'en-US',
    lockedAt: null,
    email,
    emailVerified: true,
    emails: [
      {
        email,
        isPrimary: true,
        isVerified: true,
        createdAt: chance.timestamp(),
      },
    ],
    emailBounces: [
      {
        email,
        createdAt: chance.timestamp(),
        bounceType: 'Permanent',
        bounceSubType: 'General',
        diagnosticCode: '',
        templateName: 'xyz',
      },
      {
        email,
        createdAt: chance.timestamp(),
        bounceType: 'Permanent',
        bounceSubType: 'General',
        diagnosticCode: '',
        templateName: 'xyz',
      },
    ],
    totp: [{ verified: true, enabled: true, createdAt: 1589467100316 }],
    backupCodes: [{ hasBackupCodes: true, count: 3 }],
    recoveryPhone: [{ exists: true, lastFourDigits: '7890' }],
    recoveryKeys: [
      { createdAt: 1589467100316, verifiedAt: 1589467100316, enabled: true },
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
  };
}

function makePhoneAccount(email: string, phone: string) {
  return {
    ...makeMinimalAccount(email),
    recoveryPhone: [{ exists: true, lastFourDigits: phone.slice(-4) }],
  };
}

beforeEach(() => {
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  testEmail = chance.email();
  testPhone = '+12345678900';
  // Default mocks for autocomplete (won't throw, return empty)
  (adminApi.getEmailsLike as jest.Mock).mockResolvedValue([]);
  (adminApi.getPhonesLike as jest.Mock).mockResolvedValue([]);
  (adminApi.clearEmailBounce as jest.Mock).mockResolvedValue(true);
  (adminApi.recordSecurityEvent as jest.Mock).mockResolvedValue(true);
  (adminApi.editLocale as jest.Mock).mockResolvedValue(true);
  (adminApi.unsubscribeFromMailingLists as jest.Mock).mockResolvedValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

it('renders without imploding', () => {
  render(<AccountSearch />);
  expect(screen.getByTestId('search-form')).toBeInTheDocument();
});

it('calls account search by email', async () => {
  (adminApi.getAccountByEmail as jest.Mock).mockResolvedValue([
    makeMinimalAccount(testEmail),
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  expect(adminApi.getAccountByEmail).toHaveBeenCalled();
});

it('lists every account matched by email with how each one holds the address', async () => {
  const current = { ...makeMinimalAccount(testEmail), uid: 'aaa' };
  const former = {
    ...makeMinimalAccount('new-primary@example.com'),
    uid: 'bbb',
    email: testEmail,
  };
  (adminApi.getAccountByEmail as jest.Mock).mockResolvedValue([
    current,
    former,
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  expect(await screen.findByText('2 accounts found:')).toBeInTheDocument();
  expect(
    screen.getAllByTestId('email-match-label').map((el) => el.textContent)
  ).toEqual(['Primary email', 'Sign-up email (no longer on account)']);
});

it('shows the match label on a single email result', async () => {
  (adminApi.getAccountByEmail as jest.Mock).mockResolvedValue([
    makeMinimalAccount(testEmail),
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  await screen.findByTestId('account-section');
  expect(screen.getByTestId('email-match-label')).toHaveTextContent(
    'Primary email'
  );
  expect(screen.queryByText(/accounts found/)).not.toBeInTheDocument();
});

it('keeps the match label on the submitted query while the input changes', async () => {
  (adminApi.getAccountByEmail as jest.Mock).mockResolvedValue([
    makeMinimalAccount(testEmail),
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));
  await screen.findByTestId('account-section');

  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: 'someone-else@example.com' },
  });

  expect(screen.getByTestId('email-match-label')).toHaveTextContent(
    'Primary email'
  );
});

it('shows "Account not found." when no account matches the email', async () => {
  (adminApi.getAccountByEmail as jest.Mock).mockResolvedValue([]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  expect(await screen.findByTestId('no-account-message')).toHaveTextContent(
    'Account not found.'
  );
});

it('lists multiple recovery phone matches without match labels', async () => {
  (adminApi.getAccountByPhone as jest.Mock).mockResolvedValue([
    { ...makePhoneAccount(testEmail, testPhone), uid: 'aaa' },
    { ...makePhoneAccount('other@example.com', testPhone), uid: 'bbb' },
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testPhone },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  expect(await screen.findByText('2 accounts found:')).toBeInTheDocument();
  expect(screen.queryAllByTestId('email-match-label')).toHaveLength(0);
});

it('calls account search by recovery phone', async () => {
  (adminApi.getAccountByPhone as jest.Mock).mockResolvedValue([
    makePhoneAccount(testEmail, testPhone),
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testPhone },
  });
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  expect(adminApi.getAccountByPhone).toHaveBeenCalled();
});

it('auto completes email suggestions', async () => {
  const searchTerm = testEmail.substring(0, 6);
  (adminApi.getEmailsLike as jest.Mock).mockResolvedValue([
    { email: testEmail },
  ]);
  (adminApi.getPhonesLike as jest.Mock).mockResolvedValue([]);
  (adminApi.getAccountByEmail as jest.Mock).mockResolvedValue([
    makeMinimalAccount(testEmail),
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: searchTerm },
  });

  await waitFor(() => screen.getByTestId('email-suggestions'));

  fireEvent.click(
    screen.getByTestId('email-suggestions').getElementsByTagName('a')[0]
  );
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  expect(adminApi.getEmailsLike).toHaveBeenCalled();
  expect(adminApi.getAccountByEmail).toHaveBeenCalled();
  expect(screen.getByTestId('email-input')).toHaveValue(testEmail);
});

it('auto completes recovery phone suggestions', async () => {
  const searchTerm = testPhone.substring(0, 6);
  (adminApi.getEmailsLike as jest.Mock).mockResolvedValue([]);
  (adminApi.getPhonesLike as jest.Mock).mockResolvedValue([
    { phoneNumber: testPhone },
  ]);
  (adminApi.getAccountByPhone as jest.Mock).mockResolvedValue([
    makePhoneAccount(testEmail, testPhone),
  ]);

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: searchTerm },
  });

  await waitFor(() => screen.getByTestId('email-suggestions'));
  const suggestionsElements = screen
    .getByTestId('email-suggestions')
    .getElementsByTagName('a');
  // phone suggestions come after email ones.
  fireEvent.click(suggestionsElements[suggestionsElements.length - 1]);
  fireEvent.click(screen.getByTestId('search-button'));

  await waitFor(() => screen.getByTestId('account-section'));
  expect(adminApi.getPhonesLike).toHaveBeenCalled();
  expect(adminApi.getAccountByPhone).toHaveBeenCalled();
  expect(screen.getByTestId('email-input')).toHaveValue(testPhone);
});

it('displays the account email bounces, and can clear them', async () => {
  (adminApi.getAccountByEmail as jest.Mock)
    .mockResolvedValueOnce([makeRichAccount(testEmail)])
    .mockResolvedValueOnce([makeMinimalAccount(testEmail)]);

  render(<AccountSearch />);
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
  expect(adminApi.clearEmailBounce).toHaveBeenCalled();
});

it('displays the error state if there is an error', async () => {
  (adminApi.getAccountByEmail as jest.Mock).mockRejectedValue(
    new Error('zoiks')
  );

  render(<AccountSearch />);
  fireEvent.change(screen.getByTestId('email-input'), {
    target: { value: testEmail },
  });
  fireEvent.click(screen.getByTestId('search-button'));
  await waitFor(() => screen.getByTestId('error-alert'));
  expect(adminApi.getAccountByEmail).toHaveBeenCalled();
});

describe('Editing user locale', () => {
  let localeEl: HTMLElement;
  let alertSpy: jest.SpyInstance;
  let promptSpy: jest.SpyInstance;

  async function setup(newLocale: string | null, success: boolean = true) {
    const secondLocale =
      newLocale && success && newLocale !== 'NA' ? newLocale : 'en-US';

    (adminApi.getAccountByEmail as jest.Mock)
      .mockResolvedValueOnce([makeMinimalAccount(testEmail, 'en-US')])
      .mockResolvedValueOnce([makeMinimalAccount(testEmail, secondLocale)]);

    if (newLocale === 'NA') {
      (adminApi.editLocale as jest.Mock).mockRejectedValue(
        new Error('Forced network error')
      );
    } else {
      (adminApi.editLocale as jest.Mock).mockResolvedValue(success);
    }

    render(<AccountSearch />);

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

describe('emailMatchLabel', () => {
  const account = {
    emails: [
      { email: 'primary@example.com', isPrimary: true },
      { email: 'second@example.com', isPrimary: false },
    ],
  } as Parameters<typeof emailMatchLabel>[0];

  it.each([
    ['Primary@Example.com', 'Primary email'],
    ['  primary@example.com ', 'Primary email'],
    ['second@example.com', 'Secondary email'],
    ['gone@example.com', 'Sign-up email (no longer on account)'],
  ])('labels "%s" as "%s"', (query, expected) => {
    expect(emailMatchLabel(account, query)).toBe(expected);
  });
});

describe('unsubscribe from mailing lists', () => {
  let alertSpy: jest.SpyInstance;

  async function renderAndClickUnSubscribe(success: boolean) {
    (adminApi.getAccountByEmail as jest.Mock).mockResolvedValue([
      makeMinimalAccount(testEmail),
    ]);
    (adminApi.unsubscribeFromMailingLists as jest.Mock).mockResolvedValue(
      success
    );

    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {
      return true;
    });

    render(<AccountSearch />);
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
    expect(alertSpy).toHaveBeenCalledWith(
      "The user's email has been unsubscribed from mozilla mailing lists."
    );
  });

  it('handles unsubscribe failure', async () => {
    await renderAndClickUnSubscribe(false);
    expect(alertSpy).toHaveBeenCalledWith('Unsubscribing was not successful.');
  });
});
