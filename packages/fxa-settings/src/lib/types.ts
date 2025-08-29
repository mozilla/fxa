/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type GleanClickEventDataAttrs = {
  id: string;
  label?: string;
  type?: string;
};

export enum GleanClickEventType2FA {
  inline = 'inline setup',
  setup = 'setup',
  replace = 'replace',
}

export enum RecoveryPhoneSetupReason {
  inline = 'inline setup',
  setup = 'setup',
  change = 'change',
}

export enum LinkType {
  'reset-password',
  'signin',
}

export enum LinkStatus {
  damaged = 'damaged',
  expired = 'expired',
  valid = 'valid',
  used = 'used',
}

export enum MozServices {
  Default = 'account settings',
  Monitor = 'Mozilla Monitor',
  FirefoxSync = 'Firefox Sync',
  MozillaVPN = 'Mozilla VPN',
  Pocket = 'Pocket',
  Relay = 'Mozilla Relay',
  TestService = '123Done',
  MonitorPlus = 'Mozilla Monitor Plus',
  MonitorStage = 'Mozilla Monitor Stage',
  Addons = 'Add-ons',
}

// Information about a device
export type RemoteMetadata = {
  deviceName?: string;
  deviceFamily: string;
  deviceOS: string;
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
};

export enum ResendStatus {
  'none',
  'sent',
  'error',
}

export enum LinkedAccountProviderIds {
  Google = 1,
  Apple = 2,
}

export type UnlinkAccountLocationState = {
  wantsUnlinkProviderId?: LinkedAccountProviderIds;
};

export type TotpInfo = {
  qrCodeUrl: string;
  secret: string;
  recoveryCodes?: string[];
};

export type AccountAvatar = {
  id: string | null;
  url: string | null;
};

export type AccountTotp = {
  exists: boolean;
  verified: boolean;
};

export type AccountBackupCodes = {
  hasBackupCodes?: boolean;
  count?: number;
};

export type DeviceLocation = {
  city: string | null;
  country: string | null;
  state: string | null;
  stateCode: string | null;
};

export type Email = {
  email: string;
  isPrimary: boolean;
  verified: boolean;
};

export type LinkedAccount = {
  providerId: LinkedAccountProviderIds;
  authAt: number;
  enabled: boolean;
};

export type SecurityEvent = {
  name: string;
  createdAt: number;
  verified?: boolean;
};

export type RecoveryKeyBundlePayload = {
  recoveryData: string;
};

// TODO: why doesn't this match fxa-graphql-api/src/lib/resolvers/types/attachedClient.ts?
// DOUBLE TODO: The fact it doesn't can cause type safety issues. See FXA-10326
export type AttachedClient = {
  clientId: string;
  isCurrentSession: boolean;
  userAgent: string;
  deviceType: string | null;
  deviceId: string | null;
  name: string | null;
  lastAccessTime: number;
  lastAccessTimeFormatted: string;
  approximateLastAccessTime: number | null;
  approximateLastAccessTimeFormatted: string | null;
  location: DeviceLocation;
  os: string | null;
  sessionTokenId: string | null;
  refreshTokenId: string | null;
};

export type Subscription = {
  created: number;
  productName: string;
};

export type AccountData = {
  uid: hexstring;
  displayName: string | null;
  avatar: AccountAvatar & {
    isDefault: boolean;
  };
  accountCreated: number;
  passwordCreated: number;
  hasPassword: boolean;
  recoveryKey: {
    exists: boolean;
    estimatedSyncDeviceCount?: number;
  };
  metricsEnabled: boolean;
  primaryEmail: Email;
  emails: Email[];
  attachedClients: AttachedClient[];
  linkedAccounts: LinkedAccount[];
  totp: AccountTotp;
  backupCodes: AccountBackupCodes;
  recoveryPhone: {
    exists: boolean;
    phoneNumber: string | null;
    nationalFormat: string | null;
    available: boolean;
  };
  subscriptions: Subscription[];
  securityEvents: SecurityEvent[];
};

export type ProfileInfo = {
  uid: hexstring;
  displayName: string | null;
  avatar: AccountAvatar;
  primaryEmail: Email;
  emails: Email[];
};

export type MetricsData = Pick<
  AccountData,
  'uid' | 'recoveryKey' | 'metricsEnabled' | 'primaryEmail' | 'emails' | 'totp'
>;

export type MetricsDataResult = { account: MetricsData };

export type SignedInAccountStatus = {
  isSignedIn: boolean;
};

export type StoredAccountData = {
  /**
   * The account's uid
   */
  uid: string;

  /**
   * Primary email for the account
   */
  email: string;

  /**
   * The account's current session token. If undefined signals the account no longer has an active session.
   * ie The session probably expired.
   */
  sessionToken?: string;

  /**
   * Date.now of user's last login
   */
  lastLogin?: number;

  /**
   * Whether or not they have metrics enabled
   */
  metricsEnabled?: boolean;

  /**
   * Wether or not account / session is in verified state
   */
  verified?: boolean;

  /**
   * Huh?
   */
  alertText?: string;

  /**
   * The accounts display name
   */
  displayName?: string;

  /**
   * If the account is a linked account, signals the auth provider's id. e.g. the id for apple.
   */
  providerUid?: string;
};
