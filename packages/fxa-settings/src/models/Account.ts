/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base32Decode from 'base32-decode';
import config from '../lib/config';
import AuthClient, {
  AUTH_PROVIDER,
  generateRecoveryKey,
  getRecoveryKeyIdByUid,
  getCredentials,
  getCredentialsV2,
  getKeysV2,
  AttachedClient as RawAttachedClient,
} from 'fxa-auth-client/browser';
import { MetricsContext } from '@fxa/shared/glean';
import {
  currentAccount,
  sessionToken,
  JwtTokenCache,
  JwtNotFoundError,
  isSigningOut,
} from '../lib/cache';
import firefox from '../lib/channels/firefox';
import Storage from '../lib/storage';
import { AuthUiErrorNos, AuthUiErrors } from '../lib/auth-errors/auth-errors';
import { LinkedAccountProviderIds, MfaScope, MozServices } from '../lib/types';
import {
  AccountAvatar,
  AccountBackupCodes,
  AccountTotp,
} from '../lib/interfaces';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import { getHandledError } from '../lib/error-utils';
import {
  getFullAccountData,
  updateExtendedAccountState,
  updateBasicAccountData,
  ExtendedAccountState,
} from '../lib/account-storage';

/** OAuth token TTL in seconds for profile server requests */
const PROFILE_OAUTH_TOKEN_TTL_SECONDS = 300;

export interface DeviceLocation {
  city: string | null;
  country: string | null;
  state: string | null;
  stateCode: string | null;
}

export interface Email {
  email: string;
  isPrimary: boolean;
  verified: boolean;
}

export interface LinkedAccount {
  providerId: LinkedAccountProviderIds;
  authAt: number;
  enabled: boolean;
}

export interface SecurityEvent {
  name: string;
  createdAt: number;
  verified?: boolean;
}

export interface PasswordForgotSendCodePayload {
  passwordForgotToken: string;
}

export interface RecoveryKeyBundlePayload {
  recoveryData: string;
}

/** Response shape from auth-client recoveryPhoneGet */
interface RecoveryPhoneGetResponse {
  exists: boolean;
  phoneNumber?: string;
  nationalFormat?: string;
}

/** Response shape from auth-client recoveryPhoneAvailable */
interface RecoveryPhoneAvailableResponse {
  available: boolean;
}


/** Response shape for auth-client email entries */
interface RawEmail {
  email: string;
  isPrimary: boolean;
  verified: boolean;
}

/** Re-export RawAttachedClient for consumers that import from Account */
export type { RawAttachedClient };

/** Helper to extract errno from auth-client errors */
function getErrno(err: unknown): number | undefined {
  if (typeof err === 'object' && err !== null && 'errno' in err) {
    return (err as { errno: number }).errno;
  }
  return undefined;
}

/** Maps a raw attached client from auth-client to the AttachedClient shape */
export function mapAttachedClient(c: RawAttachedClient): AttachedClient {
  return {
    clientId: c.clientId,
    isCurrentSession: c.isCurrentSession,
    userAgent: c.userAgent,
    deviceType: c.deviceType,
    deviceId: c.deviceId,
    name: c.name,
    lastAccessTime: c.lastAccessTime,
    lastAccessTimeFormatted: c.lastAccessTimeFormatted,
    approximateLastAccessTime: c.approximateLastAccessTime,
    approximateLastAccessTimeFormatted: c.approximateLastAccessTimeFormatted,
    location: {
      city: c.location?.city ?? null,
      country: c.location?.country ?? null,
      state: c.location?.state ?? null,
      stateCode: c.location?.stateCode ?? null,
    },
    os: c.os,
    sessionTokenId: c.sessionTokenId,
    refreshTokenId: c.refreshTokenId,
  };
}

export interface AttachedClient {
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
}

interface Subscription {
  created: number;
  productName: string;
}

export interface AccountData {
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
}

export interface ProfileInfo {
  uid: hexstring;
  displayName: string | null;
  avatar: AccountAvatar;
  primaryEmail: Email;
  emails: Email[];
}

// Account attributes that can be persisted
const PERSISTENT = {
  accountResetToken: undefined,
  alertText: undefined,
  displayName: undefined,
  email: undefined,
  grantedPermissions: undefined,
  hadProfileImageSetBefore: undefined,
  lastLogin: undefined,
  // password field intentionally omitted to avoid unintentional leaks
  permissions: undefined,
  profileImageId: undefined,
  profileImageUrl: undefined,
  profileImageUrlDefault: undefined,
  providerUid: undefined,
  recoveryKeyId: undefined,
  sessionToken: undefined,
  uid: undefined,
  metricsEnabled: undefined,
  verified: undefined,
};
const DEFAULTS = {
  ...PERSISTENT,
  accessToken: undefined,
  declinedSyncEngines: undefined,
  hasBounced: undefined,
  hasLinkedAccount: undefined,
  hasPassword: undefined,
  keyFetchToken: undefined,
  newsletters: undefined,
  offeredSyncEngines: undefined,
  // password field intentionally omitted to avoid unintentional leaks
  providerUid: undefined,
  unwrapBKey: undefined,
  verificationMethod: undefined,
  verificationReason: undefined,
  totpVerified: undefined,
};

export function getNextAvatar(
  existingId?: string,
  existingUrl?: string,
  email?: string,
  displayName?: string | null
): { id?: string | null; url?: string | null; isDefault: boolean } {
  let char = '?';
  if (displayName && /[a-zA-Z0-9]/.test(displayName)) {
    char = displayName[0];
  } else if (email) {
    char = email[0];
  }
  const url = `${config.servers.profile.url}/v1/avatar/${char}`;
  if (
    !existingUrl ||
    existingUrl.startsWith(config.servers.profile.url) ||
    existingId?.startsWith('default')
  ) {
    if (/[a-zA-Z0-9]/.test(char)) {
      return { id: `default-${char}`, url, isDefault: true };
    }
    return { id: null, url: null, isDefault: true };
  }

  return { id: existingId, url: existingUrl, isDefault: false };
}

// I'm fairly certain that we do not need this as Settings does not create a
// "default" account model with a set of undefined properties.  But there is an
// interface that calls for an isDefault impl so here it is.
export const isDefault = (account: object) =>
  !Object.keys(DEFAULTS).some((x) => (account as Record<string, unknown>)[x] !== undefined);

export class Account implements AccountData {
  private readonly authClient: AuthClient;
  private _loading: boolean;

  constructor(client: AuthClient) {
    this.authClient = client;
    this._loading = false;
  }

  private async withLoadingStatus<T>(promise: Promise<T>) {
    this._loading = true;
    try {
      return await promise;
    } finally {
      this._loading = false;
    }
  }

  private get data(): AccountData {
    const accountData = getFullAccountData();
    if (!accountData || !accountData.uid) {
      // Return safe defaults during sign-out to prevent re-render errors
      if (isSigningOut()) {
        return {
          uid: '',
          displayName: null,
          avatar: { id: null, url: null, isDefault: true },
          accountCreated: 0,
          passwordCreated: 0,
          hasPassword: true,
          recoveryKey: { exists: false },
          metricsEnabled: false,
          primaryEmail: { email: '', isPrimary: true, verified: false },
          emails: [],
          attachedClients: [],
          linkedAccounts: [],
          totp: { exists: false, verified: false },
          backupCodes: { hasBackupCodes: false, count: 0 },
          recoveryPhone: { exists: false, phoneNumber: null, nationalFormat: null, available: false },
          subscriptions: [],
          securityEvents: [],
        } as AccountData;
      }
      throw new Error('Account data not loaded from localStorage');
    }

    return {
      ...accountData,
      avatar: accountData.avatar || { id: null, url: null, isDefault: true },
      accountCreated: accountData.accountCreated || 0,
      passwordCreated: accountData.passwordCreated || 0,
      recoveryKey: accountData.recoveryKey || { exists: false },
      primaryEmail: accountData.primaryEmail || { email: accountData.email || '', isPrimary: true, verified: accountData.verified },
      totp: accountData.totp || { exists: false, verified: false },
      backupCodes: accountData.backupCodes || { hasBackupCodes: false, count: 0 },
      recoveryPhone: accountData.recoveryPhone || { exists: false, phoneNumber: null, nationalFormat: null, available: false },
    } as AccountData;
  }

  get loading() {
    return this._loading;
  }

  get uid() {
    return this.data.uid;
  }

  get displayName() {
    return this.data.displayName;
  }

  get avatar() {
    return this.data.avatar;
  }

  get accountCreated() {
    return this.data.accountCreated;
  }

  get metricsEnabled() {
    // This might be requested before account data is ready,
    // so default to disabled until we can get a proper read
    try {
      return this.data.metricsEnabled;
    } catch {
      return false;
    }
  }

  get passwordCreated() {
    return this.data.passwordCreated;
  }

  get hasPassword() {
    // Default to true if data is not ready (safer default)
    try {
      return this.data?.hasPassword ?? true;
    } catch {
      return true;
    }
  }

  get recoveryKey() {
    return this.data.recoveryKey;
  }

  get emails() {
    return this.data.emails;
  }

  get primaryEmail() {
    return this.data.primaryEmail;
  }

  get email() {
    return this.data.primaryEmail.email;
  }

  get subscriptions() {
    return this.data.subscriptions;
  }

  get totp() {
    return this.data.totp;
  }

  get totpActive() {
    return this.totp.exists && this.totp.verified;
  }

  get backupCodes() {
    return this.data.backupCodes;
  }

  get recoveryPhone() {
    return this.data.recoveryPhone;
  }

  get attachedClients() {
    return this.data.attachedClients;
  }

  get linkedAccounts() {
    return this.data.linkedAccounts;
  }

  get securityEvents() {
    return this.data.securityEvents;
  }

  get hasSecondaryVerifiedEmail() {
    return this.emails.length > 1 && this.emails[1].verified;
  }

  async refresh(
    field:
      | 'account'
      | 'clients'
      | 'totp'
      | 'recovery'
      | 'securityEvents'
      | 'backupCodes'
      | 'recoveryPhone'
      | 'emails'
  ) {
    const token = sessionToken();
    if (!token) return;

    await this.withLoadingStatus(
      (async () => {
        switch (field) {
          case 'clients':
            const clients = await this.authClient.attachedClients(token);
            updateExtendedAccountState({
              attachedClients: clients.map(mapAttachedClient),
            });
            break;
          case 'recovery':
            const recoveryKey = await this.authClient.recoveryKeyExists(token, undefined);
            updateExtendedAccountState({
              recoveryKey: {
                exists: recoveryKey.exists ?? false,
                estimatedSyncDeviceCount: recoveryKey.estimatedSyncDeviceCount,
              },
            });
            break;
          case 'totp':
            const totp = await this.authClient.checkTotpTokenExists(token);
            updateExtendedAccountState({
              totp: { exists: totp.exists ?? false, verified: totp.verified ?? false },
            });
            break;
          case 'backupCodes':
            const codes = await this.authClient.getRecoveryCodesExist(token);
            updateExtendedAccountState({
              backupCodes: { hasBackupCodes: codes.hasBackupCodes ?? false, count: codes.count ?? 0 },
            });
            break;
          case 'recoveryPhone':
            try {
              const [phoneResult, availableResult] = await Promise.all([
                this.authClient.recoveryPhoneGet(token).catch((): RecoveryPhoneGetResponse => ({ exists: false })),
                this.authClient.recoveryPhoneAvailable(token).catch((): RecoveryPhoneAvailableResponse => ({ available: false })),
              ]);
              updateExtendedAccountState({
                recoveryPhone: {
                  exists: phoneResult.exists ?? false,
                  phoneNumber: phoneResult.phoneNumber || null,
                  nationalFormat: phoneResult.nationalFormat || null,
                  available: availableResult.available ?? false,
                },
              });
            } catch {
              updateExtendedAccountState({
                recoveryPhone: { exists: false, phoneNumber: null, nationalFormat: null, available: false },
              });
            }
            break;
          case 'emails':
            const account = await this.authClient.account(token);
            updateExtendedAccountState({
              emails: ((account.emails || []) as RawEmail[]).map((e) => ({
                email: e.email,
                isPrimary: e.isPrimary,
                verified: e.verified,
              })),
            });
            break;
          case 'securityEvents':
            const events = await this.authClient.securityEvents(token);
            updateExtendedAccountState({
              securityEvents: (events || []).map((e) => ({
                name: e.name,
                createdAt: e.createdAt,
                verified: e.verified,
              })),
            });
            break;
          case 'account':
          default:

            const [accountData, clientsData, totpData, codesData, keyData, phoneData, phoneAvailable] =
              await Promise.allSettled([
                this.authClient.account(token),
                this.authClient.attachedClients(token),
                this.authClient.checkTotpTokenExists(token),
                this.authClient.getRecoveryCodesExist(token),
                this.authClient.recoveryKeyExists(token, undefined),
                this.authClient.recoveryPhoneGet(token),
                this.authClient.recoveryPhoneAvailable(token),
              ]);

            const updates: Partial<ExtendedAccountState> = {};

            if (accountData.status === 'fulfilled') {
              updates.emails = ((accountData.value.emails || []) as RawEmail[]).map((e) => ({
                email: e.email,
                isPrimary: e.isPrimary,
                verified: e.verified,
              }));
              updates.accountCreated = accountData.value.createdAt || null;
              updates.passwordCreated = accountData.value.passwordCreatedAt || null;
            }

            if (clientsData.status === 'fulfilled') {
              updates.attachedClients = clientsData.value.map(mapAttachedClient);
            }

            if (totpData.status === 'fulfilled') {
              updates.totp = { exists: totpData.value.exists ?? false, verified: totpData.value.verified ?? false };
            }

            if (codesData.status === 'fulfilled') {
              updates.backupCodes = { hasBackupCodes: codesData.value.hasBackupCodes ?? false, count: codesData.value.count ?? 0 };
            }

            if (keyData.status === 'fulfilled') {
              updates.recoveryKey = {
                exists: keyData.value.exists ?? false,
                estimatedSyncDeviceCount: keyData.value.estimatedSyncDeviceCount,
              };
            }

            const isPhoneAvailable = phoneAvailable.status === 'fulfilled' ? (phoneAvailable.value as RecoveryPhoneAvailableResponse).available ?? false : false;
            if (phoneData.status === 'fulfilled') {
              const phoneResult = phoneData.value as RecoveryPhoneGetResponse;
              updates.recoveryPhone = {
                exists: phoneResult.exists ?? false,
                phoneNumber: phoneResult.phoneNumber || null,
                nationalFormat: phoneResult.nationalFormat || null,
                available: isPhoneAvailable,
              };
            } else {
              updates.recoveryPhone = { exists: false, phoneNumber: null, nationalFormat: null, available: isPhoneAvailable };
            }

            updateExtendedAccountState(updates);
            break;
        }
      })()
    );
  }

  async getAccountStatusByEmail(email: string): Promise<boolean> {
    return this.withLoadingStatus(
      (await this.authClient.accountStatusByEmail(email)).exists
    );
  }

  async getSecurityEvents(): Promise<SecurityEvent[]> {
    const token = sessionToken();
    if (!token) return [];

    const events = await this.authClient.securityEvents(token);
    const securityEvents = (events || []).map((e) => ({
      name: e.name,
      createdAt: e.createdAt,
      verified: e.verified,
    }));
    updateExtendedAccountState({ securityEvents });
    return securityEvents;
  }

  async getRecoveryKeyBundle(
    accountResetToken: string,
    recoveryKey: string,
    uid: hexstring
  ) {
    const decodedRecoveryKey = base32Decode(recoveryKey, 'Crockford');
    const uint8RecoveryKey = new Uint8Array(decodedRecoveryKey);
    const recoveryKeyId = await getRecoveryKeyIdByUid(uint8RecoveryKey, uid);

    try {
      const recoveryData = await this.authClient.getRecoveryKey(
        accountResetToken,
        recoveryKeyId
      );
      return { recoveryData: recoveryData.recoveryData, recoveryKeyId };
    } catch (err: unknown) {
      const errno = getErrno(err);
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
    }
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const currentSessionToken = sessionToken();

    if (!currentSessionToken) {
      throw AuthUiErrors.INVALID_TOKEN;
    }

    // Use the new MFA-protected endpoint
    const jwt = this.getCachedJwtByScope('password');

    const response = await this.withLoadingStatus(
      this.authClient.passwordChangeWithJWT(
        jwt,
        this.email,
        oldPassword,
        newPassword,
        currentSessionToken,
        { keys: true }
      )
    );

    firefox.passwordChanged(
      this.primaryEmail.email,
      response.uid,
      response.sessionToken,
      response.sessionVerified,
      response.keyFetchToken,
      response.unwrapBKey
    );
    sessionToken(response.sessionToken);

    updateBasicAccountData({
      sessionVerified: response.sessionVerified,
    });
    updateExtendedAccountState({
      passwordCreated: response.authAt * 1000,
    });
  }

  async createPassword(newPassword: string) {
    const passwordCreatedResult = await this.withLoadingStatus(
      this.authClient.createPassword(
        sessionToken()!,
        this.primaryEmail.email,
        newPassword
      )
    );

    updateExtendedAccountState({
      passwordCreated: passwordCreatedResult.passwordCreated,
    });
  }

  async createPasswordWithJwt(newPassword: string) {
    const jwt = this.getCachedJwtByScope('password');
    const passwordCreatedResult = await this.withLoadingStatus(
      this.authClient.createPasswordWithJwt(
        jwt,
        this.primaryEmail.email,
        newPassword
      )
    );

    updateExtendedAccountState({
      passwordCreated: passwordCreatedResult.passwordCreated,
    });
  }

  async resetPassword(
    email: string,
    service?: string,
    redirectTo?: string,
    metricsContext?: MetricsContext
  ): Promise<PasswordForgotSendCodePayload> {
    let options: {
      service?: string;
      resume?: string;
      redirectTo?: string;
      metricsContext?: MetricsContext;
    } = {
      resume: 'e30=', // base64 json for {}
    };

    // Important! Only set service when it's Firefox Sync
    if (service && service === MozServices.FirefoxSync) {
      options.service = 'sync';
    } else {
      options.service = service;
    }

    if (redirectTo) {
      options.redirectTo = redirectTo;
    }

    if (metricsContext) {
      options.metricsContext = metricsContext;
    }

    return this.authClient.passwordForgotSendCode(email, options);
  }

  async resetPasswordStatus(passwordForgotToken: string): Promise<boolean> {
    try {
      await this.authClient.passwordForgotStatus(passwordForgotToken);
      // If the request does not fail, that means that the token has not been
      // consumed yet
      return true;
    } catch (err: unknown) {
      const errno = getErrno(err);

      // Invalid token means the user has completed reset password
      // or that the provided token is stale (expired or replaced with new token)
      if (errno === AuthUiErrors.INVALID_TOKEN.errno) {
        return false;
      }

      // Throw all other errors
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
    }
  }

  /**
   * @param token passwordForgotToken
   * @param code code
   * @param accountResetWithRecoveryKey is account being reset with recovery key?
   * @param includeRecoveryKeyPrompt should a prompt to create a recovery key be included in the success email?
   */
  async passwordForgotVerifyCode(
    token: string,
    code: string,
    accountResetWithRecoveryKey = false,
    includeRecoveryKeyPrompt = false
  ): Promise<string> {
    // TODO: There is a bug in Backbone and React reset PW around `accountResetWithRecoveryKey`.
    // We attempt to validate the `code` and `token` provided here, but because the
    // `accountResetToken` can only be fetched once but uses the `accountResetWithRecoveryKey`
    // option, auth-server fails to send an email if the user has a recovery key, attempts
    // to use it unsuccessfully, and then goes through a normal reset via the link back
    // to a normal reset if a user can't use their key.
    const { accountResetToken } =
      await this.authClient.passwordForgotVerifyCode(code, token, {
        accountResetWithRecoveryKey,
        includeRecoveryKeyPrompt,
      });
    return accountResetToken;
  }

  /**
   * Verify a passwordForgotToken, which returns an accountResetToken that can
   * be used to perform the actual password reset.
   *
   * @param token passwordForgotToken
   * @param code code
   */
  async verifyPasswordForgotToken(token: string, code: string) {
    try {
      const result = await this.authClient.passwordForgotVerifyCode(code, token);
      return { accountResetToken: result.accountResetToken };
    } catch (err: unknown) {
      const errno = getErrno(err);
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
    }
  }

  /**
   * Complete the password reset process. When a user reset's their password,
   * all current sessions are revoked and they will have to re-login connected
   * devices. Depending on if they used a recovery key, their encryption key might
   * change.
   *
   * @param token passwordForgotToken
   * @param code
   * @param email current user email
   * @param newPassword new password
   */
  async completeResetPassword(
    v2: boolean,
    token: string,
    code: string,
    email: string,
    newPassword: string,
    resetToken?: string,
    kB?: string,
    includeRecoveryKeyPrompt = false
  ): Promise<{
    authAt: number;
    keyFetchToken: string;
    sessionToken: string;
    uid: string;
    unwrapBKey: string;
    unwrapBKeyVersion2?: string;
    emailVerified: boolean;
    sessionVerified: boolean;
  }> {
    try {
      // if we already have a reset token, that means the user successfully used a recovery key
      const accountResetToken =
        resetToken ||
        (await this.passwordForgotVerifyCode(
          token,
          code,
          false,
          includeRecoveryKeyPrompt
        ));
      const credentials = await getCredentials(email, newPassword);

      let credentialsV2 = undefined;
      let newPasswordV2 = undefined;
      if (v2) {
        credentialsV2 = await getCredentialsV2({
          password: newPassword,
          clientSalt: createSaltV2(),
        });

        const { wrapKb, wrapKbVersion2 } = await getKeysV2({
          kB,
          v1: credentials,
          v2: credentialsV2,
        });

        newPasswordV2 = {
          wrapKb,
          authPWVersion2: credentialsV2.authPW,
          wrapKbVersion2,
          clientSalt: credentialsV2.clientSalt,
        };
      }

      const accountReset = await this.authClient.accountResetAuthPW(
        credentials.authPW,
        accountResetToken,
        newPasswordV2 ?? {},
        {
          sessionToken: true,
          keys: true,
        }
      );

      // localStorage is handled by the caller via storeAccountData
      return {
        ...accountReset,
        unwrapBKey: credentials.unwrapBKey,
        unwrapBKeyVersion2: credentialsV2?.unwrapBKey,
      };
    } catch (err) {
      throw getHandledError(err);
    }
  }

  async setDisplayName(displayName: string) {
    const token = sessionToken();
    if (!token) throw AuthUiErrors.INVALID_TOKEN;


    const { access_token } = await this.withLoadingStatus(
      this.authClient.createOAuthToken(token, config.oauth.clientId, {
        scope: 'profile:write',
        ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS,
      })
    );


    const response = await this.withLoadingStatus(
      fetch(`${config.servers.profile.url}/v1/display_name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({ displayName }),
      })
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to update display name');
    }

    const currentAvatar = this.avatar;
    const newAvatar = getNextAvatar(
      currentAvatar?.id ?? undefined,
      currentAvatar?.url ?? undefined,
      this.primaryEmail.email,
      displayName
    );
    updateExtendedAccountState({
      displayName,
      avatar: { ...currentAvatar, ...newAvatar } as AccountAvatar & { isDefault?: boolean },
    });

    const legacyLocalStorageAccount = currentAccount()!;
    legacyLocalStorageAccount.displayName = displayName;
    currentAccount(legacyLocalStorageAccount);
    firefox.profileChanged({ uid: this.uid });
  }

  setLastLogin(date: number) {
    // FOLLOW-UP: Not yet implemented.
  }

  async deleteAvatar() {
    const token = sessionToken();
    if (!token) throw AuthUiErrors.INVALID_TOKEN;

    const avatarId = this.avatar.id;

    const { access_token } = await this.withLoadingStatus(
      this.authClient.createOAuthToken(token, config.oauth.clientId, {
        scope: 'profile:write',
        ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS,
      })
    );

    await this.withLoadingStatus(
      fetch(`${config.servers.profile.url}/v1/avatar/${avatarId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
    );

    const newAvatar = getNextAvatar(
      undefined,
      undefined,
      this.primaryEmail.email,
      this.displayName
    );
    updateExtendedAccountState({
      avatar: newAvatar as AccountAvatar & { isDefault?: boolean },
    });

    firefox.profileChanged({ uid: this.uid });
  }

  async disconnectClient(client: AttachedClient) {
    const token = sessionToken();
    if (!token) throw AuthUiErrors.INVALID_TOKEN;

    await this.withLoadingStatus(
      this.authClient.attachedClientDestroy(token, {
        clientId: client.clientId,
        deviceId: client.deviceId,
        sessionTokenId: client.sessionTokenId,
        refreshTokenId: client.refreshTokenId,
      })
    );

    const currentClients = this.attachedClients;
    const updatedClients = currentClients.filter(
      (c) =>
        c.lastAccessTime !== client.lastAccessTime && c.name !== client.name
    );
    updateExtendedAccountState({ attachedClients: updatedClients });
  }

  async verifyAccountThirdParty(
    code: string,
    provider: AUTH_PROVIDER = AUTH_PROVIDER.GOOGLE,
    service?: string,
    metricsContext: MetricsContext = {}
  ): Promise<{
    uid: hexstring;
    sessionToken: hexstring;
    providerUid: hexstring;
    email: string;
    verificationMethod?: string;
  }> {
    return this.withLoadingStatus(
      this.authClient.verifyAccountThirdParty(
        code,
        provider,
        service,
        metricsContext
      )
    );
  }

  // This handler replaces the recovery codes in one step without requiring confirming
  // Contrasts with updateRecoveryCodes which is called with locally created recovery codes
  // and only updated in database after the codes are confirmed
  // Not currently in use but could be handy if we move towards removing the confirmation requirement
  async replaceRecoveryCodes() {
    return this.withLoadingStatus(
      this.authClient.replaceRecoveryCodes(sessionToken()!)
    );
  }

  /**
   * Check if the user has TOTP set up. This should be converted to a GQL query.
   */
  async hasTotpAuthClient() {
    try {
      const { verified } = await this.withLoadingStatus(
        this.authClient.checkTotpTokenExists(sessionToken()!)
      );
      return verified;
    } catch (e) {
      // Proceed as if the user does not have TOTP set up, they will be
      // prompted for it before they can access settings
      return false;
    }
  }

  /**
   * Set recovery codes - intended for initial 2FA setup.
   */
  async setRecoveryCodes(recoveryCodes: string[]) {
    const result = await this.withLoadingStatus(
      this.authClient.setRecoveryCodes(sessionToken()!, recoveryCodes)
    );
    await this.refresh('backupCodes');
    return result;
  }

  async setRecoveryCodesWithJwt(recoveryCodes: string[]) {
    const jwt = this.getCachedJwtByScope('2fa');
    const result = await this.withLoadingStatus(
      this.authClient.setRecoveryCodesWithJwt(jwt, recoveryCodes)
    );
    await this.refresh('backupCodes');
    return result;
  }

  /**
   * Update recovery codes - replace existing codes with new codes generated client-side.
   * Allows for local code confirmation before updating.
   */
  async updateRecoveryCodes(recoveryCodes: string[]) {
    const jwt = this.getCachedJwtByScope('2fa');
    const result = await this.withLoadingStatus(
      this.authClient.updateRecoveryCodesWithJwt(jwt, recoveryCodes)
    );
    await this.refresh('backupCodes');
    return result;
  }

  async createSecondaryEmail(email: string) {
    const jwt = this.getCachedJwtByScope('email');
    await this.withLoadingStatus(
      this.authClient.recoveryEmailCreate(jwt, email)
    );
    await this.refresh('emails');
  }

  async verifySecondaryEmail(email: string, code: string) {
    const jwt = this.getCachedJwtByScope('email');
    await this.withLoadingStatus(
      this.authClient.recoveryEmailSecondaryVerifyCode(jwt, email, code)
    );
    await this.refresh('emails');
  }

  async disableTwoStepAuth() {
    await this.withLoadingStatus(
      this.authClient.deleteTotpTokenWithJwt(this.getCachedJwtByScope('2fa'))
    );

    updateExtendedAccountState({
      totp: { exists: false, verified: false },
    });

    await this.refresh('recoveryPhone');
    await this.refresh('backupCodes');
  }

  async deleteRecoveryKeyWithJwt() {
    const jwt = this.getCachedJwtByScope('recovery_key');
    await this.withLoadingStatus(this.authClient.deleteRecoveryKeyWithJwt(jwt));

    const currentRecoveryKey = this.recoveryKey;
    updateExtendedAccountState({
      recoveryKey: {
        exists: false,
        estimatedSyncDeviceCount: currentRecoveryKey?.estimatedSyncDeviceCount,
      },
    });
  }

  async deleteSecondaryEmailWithJwt(email: string) {
    const jwt = this.getCachedJwtByScope('email');
    await this.withLoadingStatus(
      this.authClient.recoveryEmailDestroyWithJwt(jwt, email)
    );
    await this.refresh('emails');
  }

  async makeEmailPrimary(email: string) {
    await this.withLoadingStatus(
      this.authClient.recoveryEmailSetPrimaryEmail(sessionToken()!, email)
    );
    await this.refresh('emails');

    const currentAvatar = this.avatar;
    const newAvatar = getNextAvatar(
      currentAvatar?.id ?? undefined,
      currentAvatar?.url ?? undefined,
      email,
      this.displayName
    );
    updateExtendedAccountState({
      avatar: { ...currentAvatar, ...newAvatar } as AccountAvatar & { isDefault?: boolean },
    });
    updateBasicAccountData({ email });

    const legacyLocalStorageAccount = currentAccount()!;
    legacyLocalStorageAccount.email = email;
    currentAccount(legacyLocalStorageAccount);

    firefox.profileChanged({ uid: this.uid });
  }

  async makeEmailPrimaryWithJwt(email: string) {
    const jwt = this.getCachedJwtByScope('email');
    await this.withLoadingStatus(
      this.authClient.recoveryEmailSetPrimaryEmailWithJwt(jwt, email)
    );
    await this.refresh('emails');

    const currentAvatar = this.avatar;
    const newAvatar = getNextAvatar(
      currentAvatar?.id ?? undefined,
      currentAvatar?.url ?? undefined,
      email,
      this.displayName
    );
    updateExtendedAccountState({
      avatar: { ...currentAvatar, ...newAvatar } as AccountAvatar & { isDefault?: boolean },
    });
    updateBasicAccountData({ email });

    const legacyLocalStorageAccount = currentAccount()!;
    legacyLocalStorageAccount.email = email;
    currentAccount(legacyLocalStorageAccount);

    firefox.profileChanged({ uid: this.uid });
  }

  async resendSecondaryEmailCode(email: string) {
    return this.withLoadingStatus(
      this.authClient.recoveryEmailSecondaryResendCode(sessionToken()!, email)
    );
  }

  async resendSecondaryEmailCodeWithJwt(email: string) {
    const jwt = this.getCachedJwtByScope('email');
    return this.withLoadingStatus(
      this.authClient.recoveryEmailSecondaryResendCodeWithJwt(jwt, email)
    );
  }

  async createTotpWithJwt() {
    return this.withLoadingStatus(
      this.authClient.createTotpTokenWithJwt(
        this.getCachedJwtByScope('2fa'),
        {}
      )
    );
  }

  async verifyTotpSetupCodeWithJwt(code: string) {
    await this.withLoadingStatus(
      this.authClient.verifyTotpSetupCodeWithJwt(
        this.getCachedJwtByScope('2fa'),
        code,
        {}
      )
    );
  }

  async completeTotpSetupWithJwt() {
    await this.withLoadingStatus(
      this.authClient.completeTotpSetupWithJwt(this.getCachedJwtByScope('2fa'))
    );
    await this.refresh('totp');
    await this.refresh('backupCodes');
    await this.refresh('recoveryPhone');
  }

  async startReplaceTotpWithJwt() {
    const jwt = this.getCachedJwtByScope('2fa');
    return this.withLoadingStatus(
      this.authClient.startReplaceTotpTokenWithJwt(jwt, {})
    );
  }

  async confirmReplaceTotpWithJwt(code: string) {
    const jwt = this.getCachedJwtByScope('2fa');
    await this.withLoadingStatus(
      this.authClient.confirmReplaceTotpTokenWithJwt(jwt, code)
    );
  }

  async uploadAvatar(file: Blob) {
    const { access_token } = await this.withLoadingStatus(
      this.authClient.createOAuthToken(sessionToken()!, config.oauth.clientId, {
        scope: 'profile:write clients:write',
        ttl: PROFILE_OAUTH_TOKEN_TTL_SECONDS,
      })
    );
    const response = await this.withLoadingStatus(
      fetch(`${config.servers.profile.url}/v1/avatar/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': file.type,
        },
        body: file,
      })
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const newAvatar = (await response.json()) as Account['avatar'];

    updateExtendedAccountState({
      avatar: { ...newAvatar, isDefault: false },
    });

    firefox.profileChanged({ uid: this.uid });
  }

  async createRecoveryKey(
    password: string,
    replaceKey: boolean,
    useMfaJwt: boolean
  ) {
    const reauth = await this.withLoadingStatus(
      this.authClient.sessionReauth(
        sessionToken()!,
        this.primaryEmail.email,
        password,
        {
          keys: true,
          reason: 'recovery_key',
        }
      )
    );
    const keys = await this.withLoadingStatus(
      this.authClient.accountKeys(reauth.keyFetchToken!, reauth.unwrapBKey!)
    );
    const { recoveryKey, recoveryKeyId, recoveryData } =
      await generateRecoveryKey(this.uid, keys);

    if (useMfaJwt) {
      const jwt = this.getCachedJwtByScope('recovery_key');
      await this.withLoadingStatus(
        this.authClient.createRecoveryKeyWithJwt(
          jwt,
          recoveryKeyId,
          recoveryData,
          true,
          replaceKey
        )
      );
    } else {
      await this.withLoadingStatus(
        this.authClient.createRecoveryKey(
          sessionToken()!,
          recoveryKeyId,
          recoveryData,
          true,
          replaceKey
        )
      );
    }

    const currentRecoveryKey = this.recoveryKey;
    updateExtendedAccountState({
      recoveryKey: {
        exists: true,
        estimatedSyncDeviceCount: currentRecoveryKey?.estimatedSyncDeviceCount,
      },
    });
    return recoveryKey;
  }

  async updateRecoveryKeyHint(hint: string) {
    await this.withLoadingStatus(
      this.authClient.updateRecoveryKeyHint(sessionToken()!, hint)
    );
  }

  async metricsOpt(state: 'in' | 'out') {
    const token = sessionToken();
    if (!token) throw AuthUiErrors.INVALID_TOKEN;

    await this.withLoadingStatus(
      this.authClient.metricsOpt(token, state)
    );

    updateBasicAccountData({ metricsEnabled: state === 'in' });

    const legacyLocalStorageAccount = currentAccount()!;
    legacyLocalStorageAccount.metricsEnabled = state === 'in';
    currentAccount(legacyLocalStorageAccount);
    firefox.profileChanged({ metricsEnabled: this.metricsEnabled });
  }

  async unlinkThirdParty(providerId: number) {
    await this.withLoadingStatus(
      this.authClient.unlinkThirdParty(sessionToken()!, providerId)
    );

    const currentLinkedAccounts = this.linkedAccounts;
    const updatedLinkedAccounts = currentLinkedAccounts.filter(
      (linkedAcc) => linkedAcc.providerId !== providerId
    );
    updateExtendedAccountState({ linkedAccounts: updatedLinkedAccounts });
  }

  async destroy(password: string) {
    await this.withLoadingStatus(
      this.authClient.accountDestroy(
        this.primaryEmail.email,
        password,
        {},
        sessionToken()!
      )
    );
    firefox.accountDeleted(this.uid);
    Storage.factory('localStorage').clear();
  }

  async resetPasswordWithRecoveryKey(opts: {
    accountResetToken: string;
    emailToHashWith: string;
    password: string;
    recoveryKeyId: string;
    kB: string;
    isFirefoxMobileClient: boolean;
  }) {
    const response = await this.authClient.resetPasswordWithRecoveryKey(
      opts.accountResetToken,
      opts.emailToHashWith,
      opts.password,
      opts.recoveryKeyId,
      { kB: opts.kB },
      {
        sessionToken: true,
        keys: true,
        isFirefoxMobileClient: opts.isFirefoxMobileClient,
      }
    );

    if (response.sessionToken) {
      sessionToken(response.sessionToken);
      updateBasicAccountData({
        sessionVerified: response.verified,
      });
    }

    return response;
  }

  async removeRecoveryPhone() {
    const jwt = this.getCachedJwtByScope('2fa');
    return this.withLoadingStatus(
      this.authClient.recoveryPhoneDeleteWithJwt(jwt)
    );
  }

  async addRecoveryPhoneWithJwt(phoneNumber: string) {
    const jwt = this.getCachedJwtByScope('2fa');
    return this.withLoadingStatus(
      this.authClient.recoveryPhoneCreateWithJwt(jwt, phoneNumber)
    );
  }

  async addRecoveryPhone(phoneNumber: string) {
    return this.withLoadingStatus(
      this.authClient.recoveryPhoneCreate(sessionToken()!, phoneNumber)
    );
  }

  async changeRecoveryPhoneWithJwt(code: string) {
    const jwt = this.getCachedJwtByScope('2fa');
    return this.withLoadingStatus(
      this.authClient.recoveryPhoneChangeWithJwt(jwt, code)
    );
  }

  async changeRecoveryPhone(code: string) {
    return this.withLoadingStatus(
      this.authClient.recoveryPhoneChange(sessionToken()!, code)
    );
  }

  async confirmRecoveryPhoneWithJwt(code: string) {
    const jwt = this.getCachedJwtByScope('2fa');
    const result = await this.withLoadingStatus(
      this.authClient.recoveryPhoneConfirmSetupWithJwt(jwt, code)
    );
    await this.refresh('recoveryPhone');
    return result;
  }

  async confirmRecoveryPhone(code: string, phoneNumber: string) {
    const { nationalFormat } = await this.withLoadingStatus(
      this.authClient.recoveryPhoneConfirmSetup(sessionToken()!, code)
    );

    updateExtendedAccountState({
      recoveryPhone: {
        exists: true,
        phoneNumber,
        nationalFormat,
        available: true,
      },
    });
  }

  /**
   * Checks for a JWT token in cache for the given scope.
   * @param scope MfaScope
   * @returns JWT token string
   */
  getCachedJwtByScope(scope: MfaScope) {
    const token = sessionToken();
    if (!token) {
      throw new JwtNotFoundError('Missing parent session token.');
    }
    const hasJwt = JwtTokenCache.hasToken(token, scope);
    if (!hasJwt) {
      throw new JwtNotFoundError('Missing or expired jwt.');
    }

    return JwtTokenCache.getToken(token, scope);
  }
}
