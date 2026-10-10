/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Account } from 'fxa-admin-server/src/types';

export const mockUnsubscribe = (success: boolean) => {
  return { success };
};

export const mockAccount: Account = {
  uid: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
  email: 'user@example.com',
  emailVerified: true,
  clientSalt:
    'identity.mozilla.com/picl/v1/quickStretchV2:0123456789abcdef0123456789abcdef',
  createdAt: 1700000000000,
  locale: 'en-US',
  verifierSetAt: 1700000000000,
  emails: [
    {
      email: 'user@example.com',
      isVerified: true,
      isPrimary: true,
      createdAt: 1700000000000,
    },
    {
      email: 'user2@example.com',
      isVerified: false,
      isPrimary: false,
      createdAt: 1700100000000,
    },
  ],
  emailBounces: [
    {
      email: 'user@example.com',
      templateName: 'verifyLoginCode',
      bounceType: 'Permanent',
      bounceSubType: 'General',
      createdAt: 1700200000000,
      diagnosticCode: 'smtp; 550 5.1.1 user unknown',
    },
  ],
  totp: [{ verified: true, enabled: true, createdAt: 1700300000000 }],
  recoveryKeys: [
    { createdAt: 1700300000000, verifiedAt: 1700300000000, enabled: true },
  ],
  securityEvents: [
    {
      name: 'account.login',
      nameId: 1,
      verified: true,
      createdAt: 1700400000000,
      ipAddr: '192.0.2.1',
    },
  ],
  attachedClients: [
    {
      clientId: '5882386c6d801776',
      deviceId: 'device-1',
      sessionTokenId: 'session-1',
      deviceType: 'desktop',
      name: 'Firefox on macOS',
      scope: ['profile', 'https://identity.mozilla.com/apps/oldsync'],
      location: { city: 'Toronto', country: 'Canada', countryCode: 'CA' },
      userAgent: 'Mozilla/5.0 Firefox/130.0',
      os: 'Mac OS X',
      createdTime: 1700000000000,
      lastAccessTime: 1700500000000,
    },
  ],
  subscriptions: [
    {
      created: 1700000000,
      currentPeriodEnd: 1702592000,
      currentPeriodStart: 1700000000,
      cancelAtPeriodEnd: false,
      latestInvoice: 'https://example.com/invoice/in_123',
      manageSubscriptionLink: 'https://example.com/subscriptions',
      planId: 'plan_123',
      productName: 'Example VPN',
      productId: 'prod_123',
      status: 'active',
      subscriptionId: 'sub_123',
    },
  ],
  linkedAccounts: [
    {
      uid: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
      authAt: 1700000000000,
      providerId: 1,
      enabled: true,
    },
  ],
  accountEvents: [
    {
      name: 'emailSent',
      createdAt: 1700000000000,
      eventType: 'emailEvent',
      template: 'verifyLoginCode',
      service: 'sync',
    },
  ],
  carts: [
    {
      id: 'cart_123',
      uid: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
      state: 'success',
      offeringConfigId: 'vpn',
      interval: 'monthly',
      taxAddress: { countryCode: 'US', postalCode: '10001' },
      currency: 'usd',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      amount: 999,
      version: 1,
      eligibilityStatus: 'create',
    },
  ],
  backupCodes: [{ hasBackupCodes: true, count: 8 }],
  recoveryPhone: [{ exists: true, lastFourDigits: '1234' }],
  passkeys: [
    {
      name: 'Example passkey',
      credentialId: 'credential-1',
      createdAt: 1700000000000,
      lastUsedAt: 1700500000000,
      aaguid: '00000000-0000-0000-0000-000000000000',
      backupState: true,
      prfEnabled: true,
      hasPasswordlessSync: true,
      passwordlessSyncStale: false,
    },
  ],
  accountAuthorizations: [
    {
      scope: 'profile',
      service: 'sync',
      clientId: '5882386c6d801776',
      firstAuthorizedTosAt: 1700000000000,
      lastAuthorizedTosAt: 1700500000000,
      deauthorizedAt: null,
    },
  ],
};
