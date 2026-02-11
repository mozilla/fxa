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

export enum MfaReason {
  createSecondaryEmail = 'create secondary email',
  verifySecondaryEmail = 'verify secondary email',
  removeSecondaryEmail = 'remove secondary email',
  changePrimaryEmail = 'change primary email',
  createPassword = 'create password',
  changePassword = 'change password',
  createRecoveryPhone = 'create recovery phone',
  changeRecoveryPhone = 'change recovery phone',
  removeRecoveryPhone = 'remove recovery phone',
  createTotp = 'create totp',
  changeTotp = 'change totp',
  removeTotp = 'remove totp',
  createBackupCodes = 'create backup codes',
  createRecoveryKey = 'create recovery key',
  removeRecoveryKey = 'remove recovery key',
  test = 'test',
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
  Relay = 'Mozilla Relay',
  TestService = '123Done',
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
};

export type MfaScope = 'test' | '2fa' | 'email' | 'recovery_key' | 'password';
