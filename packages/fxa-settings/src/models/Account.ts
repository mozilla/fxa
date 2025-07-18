/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base32Decode from 'base32-decode';
import { gql, ApolloClient, ApolloError } from '@apollo/client';
import config from '../lib/config';
import AuthClient, {
  AUTH_PROVIDER,
  generateRecoveryKey,
  getRecoveryKeyIdByUid,
  getCredentials,
  getCredentialsV2,
  getKeysV2,
} from 'fxa-auth-client/browser';
import { MetricsContext } from '@fxa/shared/glean';
import {
  currentAccount,
  getStoredAccountData,
  sessionToken,
} from '../lib/cache';
import firefox from '../lib/channels/firefox';
import Storage from '../lib/storage';
import { AuthUiErrorNos, AuthUiErrors } from '../lib/auth-errors/auth-errors';
import { LinkedAccountProviderIds, MozServices } from '../lib/types';
import {
  GET_LOCAL_SIGNED_IN_STATUS,
  GET_TOTP_STATUS,
  GET_BACKUP_CODES_STATUS,
  GET_RECOVERY_PHONE,
} from '../components/App/gql';
import {
  AccountAvatar,
  AccountBackupCodes,
  AccountTotp,
} from '../lib/interfaces';
import { createSaltV2 } from 'fxa-auth-client/lib/salt';
import { getHandledError } from '../lib/error-utils';

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

// TODO: why doesn't this match fxa-graphql-api/src/lib/resolvers/types/attachedClient.ts?
// DOUBLE TODO: The fact it doeesn't can cuase type safety issues. See FXA-10326
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

export const GET_PROFILE_INFO = gql`
  query GetProfileInfo {
    account {
      uid
      displayName
      avatar {
        id
        url
      }
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
    }
  }
`;

export const GET_ACCOUNT = gql`
  query GetAccount {
    account {
      uid
      displayName
      avatar {
        id
        url
        isDefault @client
      }
      accountCreated
      passwordCreated
      recoveryKey {
        exists
        estimatedSyncDeviceCount
      }
      metricsEnabled
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
      attachedClients {
        clientId
        isCurrentSession
        userAgent
        deviceType
        deviceId
        name
        lastAccessTime
        lastAccessTimeFormatted
        approximateLastAccessTime
        approximateLastAccessTimeFormatted
        location {
          city
          country
          state
          stateCode
        }
        os
        sessionTokenId
        refreshTokenId
      }
      totp {
        exists
        verified
      }
      backupCodes {
        hasBackupCodes
        count
      }
      recoveryPhone {
        exists
        phoneNumber
        nationalFormat
        available
      }
      subscriptions {
        created
        productName
      }
      linkedAccounts {
        providerId
        authAt
        enabled
      }
    }
  }
`;

export const GET_CONNECTED_CLIENTS = gql`
  query GetConnectedClients {
    account {
      attachedClients {
        clientId
        isCurrentSession
        userAgent
        deviceType
        deviceId
        name
        lastAccessTime
        lastAccessTimeFormatted
        approximateLastAccessTime
        approximateLastAccessTimeFormatted
        location {
          city
          country
          state
          stateCode
        }
        os
        sessionTokenId
        refreshTokenId
      }
    }
  }
`;

export const GET_RECOVERY_KEY_EXISTS = gql`
  query GetRecoveryKeyExists {
    account {
      recoveryKey {
        exists
      }
    }
  }
`;

export const GET_SECURITY_EVENTS = gql`
  query GetSecurityEvents {
    account {
      securityEvents {
        name
        createdAt
        verified
      }
    }
  }
`;

const GET_RECOVERY_BUNDLE = gql`
  query GetRecoveryKeyBundle($input: RecoveryKeyBundleInput!) {
    getRecoveryKeyBundle(input: $input) {
      recoveryData
    }
  }
`;

export function getNextAvatar(
  existingId?: string,
  existingUrl?: string,
  email?: string,
  displayName?: string | null
): { id?: string | null; url?: string | null; isDefault: boolean } {
  const char =
    displayName && /[a-zA-Z0-9]/.test(displayName)
      ? displayName[0]
      : email
        ? email[0]
        : '?';
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
export const isDefault = (account: Record<string, any>) =>
  !Object.keys(DEFAULTS).some((x) => account[x] !== undefined);

export class Account implements AccountData {
  private readonly authClient: AuthClient;
  private readonly apolloClient: ApolloClient<object>;
  private _loading: boolean;

  constructor(client: AuthClient, apolloClient: ApolloClient<object>) {
    this.authClient = client;
    this.apolloClient = apolloClient;
    this._loading = false;
  }

  private async withLoadingStatus<T>(promise: Promise<T>) {
    this._loading = true;
    try {
      return await promise;
    } catch (e) {
      throw e;
    } finally {
      this._loading = false;
    }
  }

  private get data() {
    const { account } = this.apolloClient.cache.readQuery<{
      account: AccountData;
    }>({
      query: GET_ACCOUNT,
    })!;
    return account;
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
    // This might be requested before account data is ready,
    // so default to disabled until we can get a proper read
    try {
      return (
        this.data?.passwordCreated != null && this.data.passwordCreated > 0
      );
    } catch {
      return false;
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
  ) {
    let query = GET_ACCOUNT;
    switch (field) {
      case 'clients':
        query = GET_CONNECTED_CLIENTS;
        break;
      case 'recovery':
        query = GET_RECOVERY_KEY_EXISTS;
        break;
      case 'totp':
        query = GET_TOTP_STATUS;
        break;
      case 'backupCodes':
        query = GET_BACKUP_CODES_STATUS;
        break;
      case 'recoveryPhone':
        query = GET_RECOVERY_PHONE;
        break;
    }
    await this.withLoadingStatus(
      this.apolloClient.query({
        fetchPolicy: 'network-only',
        query,
      })
    );
  }

  async getAccountStatusByEmail(email: string): Promise<boolean> {
    return this.withLoadingStatus(
      (await this.authClient.accountStatusByEmail(email)).exists
    );
  }

  async getSecurityEvents() {
    const { data } = await this.apolloClient.query({
      fetchPolicy: 'network-only',
      query: GET_SECURITY_EVENTS,
    });
    const { account } = data;
    return account.securityEvents;
  }

  async getProfileInfo() {
    try {
      const { data } = await this.apolloClient.query({
        fetchPolicy: 'network-only',
        query: GET_PROFILE_INFO,
      });
      const { account } = data;
      return account as ProfileInfo;
    } catch (err) {
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno as
        | number
        | undefined;
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
    }
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
      const { data } = await this.apolloClient.query({
        fetchPolicy: 'network-only',
        query: GET_RECOVERY_BUNDLE,
        variables: {
          input: {
            accountResetToken,
            recoveryKeyId,
          },
        },
      });
      const { recoveryData } = data.getRecoveryKeyBundle;
      return { recoveryData, recoveryKeyId };
    } catch (err) {
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno as
        | number
        | undefined;
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
    }
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await this.withLoadingStatus(
      this.authClient.passwordChange(
        this.primaryEmail.email,
        oldPassword,
        newPassword,
        sessionToken()!,
        {
          keys: true,
        }
      )
    );

    firefox.passwordChanged(
      this.primaryEmail.email,
      response.uid,
      response.sessionToken,
      response.verified,
      response.keyFetchToken,
      response.unwrapBKey
    );
    sessionToken(response.sessionToken);
    this.apolloClient.cache.writeQuery({
      query: gql`
        query UpdatePassword {
          account {
            passwordCreated
          }
          session {
            verified
          }
        }
      `,
      data: {
        account: {
          passwordCreated: response.authAt * 1000,
          __typename: 'Account',
        },
        session: { verified: response.verified, __typename: 'Session' },
      },
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
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        passwordCreated() {
          return passwordCreatedResult.passwordCreated;
        },
      },
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

    const result = await this.authClient.passwordForgotSendCode(email, options);
    return result;
  }

  async resetPasswordStatus(passwordForgotToken: string): Promise<boolean> {
    try {
      await this.apolloClient.mutate({
        mutation: gql`
          mutation passwordForgotCodeStatus(
            $input: PasswordForgotCodeStatusInput!
          ) {
            passwordForgotCodeStatus(input: $input) {
              tries
            }
          }
        `,
        variables: { input: { token: passwordForgotToken } },
      });

      // If the request does not fail, that means that the token has not been
      // consumed yet
      return true;
    } catch (err) {
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno as
        | number
        | undefined;

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
   * TODO: Remove this once we update the GQL endpoint to accept the
   *  `accountResetWithRecoveryKey` option and fix graphql-api not reporting
   *  the correct IP address.
   *
   * @param token passwordForgotToken
   * @param code code
   * @param accountResetWithRecoveryKey is account being reset with recovery key?
   * @param includeRecoveryKeyPrompt should a prompt to create a recovery key be included in the success email?
   * */
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
        ...{
          accountResetWithRecoveryKey,
          includeRecoveryKeyPrompt,
        },
      });
    return accountResetToken;
  }

  /**
   * Verify a passwordForgotToken, which returns an accountResetToken that can
   * be used to perform the actual password reset.
   *
   * NOTE! and TODO: this is currently unused. We need to update the GQL
   * endpoint to accept the `accountResetWithRecoveryKey` option and
   * fix graphql-api not reporting the correct IP address.
   *
   * @param token passwordForgotToken
   * @param code code
   */
  async verifyPasswordForgotToken(token: string, code: string) {
    try {
      const verifyCodeResult = await this.apolloClient.mutate({
        mutation: gql`
          mutation passwordForgotVerifyCode(
            $input: PasswordForgotVerifyCodeInput!
          ) {
            passwordForgotVerifyCode(input: $input) {
              accountResetToken
            }
          }
        `,
        variables: { input: { token, code } },
      });
      return verifyCodeResult.data.passwordForgotVerifyCode;
    } catch (err) {
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno as
        | number
        | undefined;
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
  ): Promise<any> {
    try {
      // TODO: Temporary workaround (use auth-client directly) for GraphQL not
      //  getting correct ip address
      // const { accountResetToken } = await this.verifyPasswordForgotToken(
      //   token,
      //   code
      // );
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

      const {
        data: { accountReset },
      } = await this.apolloClient.mutate({
        mutation: gql`
          mutation accountResetAuthPW($input: AccountResetInput!) {
            accountReset(input: $input) {
              clientMutationId
              sessionToken
              uid
              authAt
              keyFetchToken
              verified
            }
          }
        `,
        variables: {
          input: {
            accountResetToken,
            newPasswordAuthPW: credentials.authPW,
            newPasswordV2,
            options: { sessionToken: true, keys: true },
          },
        },
      });
      accountReset.unwrapBKey = credentials.unwrapBKey;
      accountReset.unwrapBKeyVersion2 = credentialsV2?.unwrapBKey;
      currentAccount(getStoredAccountData(accountReset));
      sessionToken(accountReset.sessionToken);
      if (accountReset.verified) {
        this.apolloClient.cache.writeQuery({
          query: GET_LOCAL_SIGNED_IN_STATUS,
          data: { isSignedIn: true },
        });
      }
      return accountReset;
    } catch (err) {
      throw getHandledError(err);
    }
  }

  async setDisplayName(displayName: string) {
    await this.withLoadingStatus(
      this.apolloClient.mutate({
        mutation: gql`
          mutation updateDisplayName($input: UpdateDisplayNameInput!) {
            updateDisplayName(input: $input) {
              clientMutationId
            }
          }
        `,
        update: (cache) => {
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              displayName() {
                return displayName;
              },
              avatar: (existing, { readField }) => {
                const id = readField<string>('id', existing);
                const oldUrl = readField<string>('url', existing);
                return getNextAvatar(
                  id,
                  oldUrl,
                  this.primaryEmail.email,
                  displayName
                );
              },
            },
          });
        },
        variables: { input: { displayName } },
      })
    );
    const legacyLocalStorageAccount = currentAccount()!;
    legacyLocalStorageAccount.displayName = displayName;
    currentAccount(legacyLocalStorageAccount);
    firefox.profileChanged({ uid: this.uid });
  }

  setLastLogin(date: number) {
    // FOLLOW-UP: Not yet implemented.
  }

  async deleteAvatar() {
    await this.withLoadingStatus(
      this.apolloClient.mutate({
        mutation: gql`
          mutation deleteAvatar($input: DeleteAvatarInput!) {
            deleteAvatar(input: $input) {
              clientMutationId
            }
          }
        `,
        update: (cache) => {
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              avatar: () => {
                return getNextAvatar(
                  undefined,
                  undefined,
                  this.primaryEmail.email,
                  this.displayName
                );
              },
            },
          });
        },
        variables: { input: { id: this.avatar.id } },
      })
    );
    firefox.profileChanged({ uid: this.uid });
  }

  async disconnectClient(client: AttachedClient) {
    await this.withLoadingStatus(
      this.apolloClient.mutate({
        mutation: gql`
          mutation attachedClientDisconnect(
            $input: AttachedClientDisconnectInput!
          ) {
            attachedClientDisconnect(input: $input) {
              clientMutationId
            }
          }
        `,
        update: (cache) => {
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              attachedClients: (existingClients) => {
                const updatedList = [...existingClients];
                return updatedList.filter(
                  // TODO: should this also go into the AttachedClient model?
                  (c) =>
                    c.lastAccessTime !== client.lastAccessTime &&
                    c.name !== client.name
                );
              },
            },
          });
        },
        variables: {
          input: {
            clientId: client.clientId,
            deviceId: client.deviceId,
            sessionTokenId: client.sessionTokenId,
            refreshTokenId: client.refreshTokenId,
          },
        },
      })
    );
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
    const linkedAccount = await this.withLoadingStatus(
      this.authClient.verifyAccountThirdParty(
        code,
        provider,
        service,
        metricsContext
      )
    );

    currentAccount(getStoredAccountData(linkedAccount));
    sessionToken(linkedAccount.sessionToken);

    this.apolloClient.cache.writeQuery({
      query: GET_LOCAL_SIGNED_IN_STATUS,
      data: { isSignedIn: true },
    });

    return linkedAccount;
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

  /**
   * Update recovery codes - replace existing codes with new codes generated client-side.
   * Allows for local code confirmation before updating.
   */
  async updateRecoveryCodes(recoveryCodes: string[]) {
    const result = await this.withLoadingStatus(
      this.authClient.updateRecoveryCodes(sessionToken()!, recoveryCodes)
    );
    await this.refresh('backupCodes');
    return result;
  }

  async createSecondaryEmail(email: string) {
    await this.withLoadingStatus(
      this.authClient.recoveryEmailCreate(sessionToken()!, email, {
        verificationMethod: 'email-otp',
      })
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        emails(existingEmails) {
          return [
            ...existingEmails,
            {
              email,
              isPrimary: false,
              verified: false,
            },
          ];
        },
      },
    });
  }

  async verifySecondaryEmail(email: string, code: string) {
    await this.withLoadingStatus(
      this.authClient.recoveryEmailSecondaryVerifyCode(
        sessionToken()!,
        email,
        code
      )
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        emails(existingEmails) {
          return existingEmails.map((x: Email) =>
            x.email === email ? { ...x, verified: true } : { ...x }
          );
        },
      },
    });
  }

  async disableTwoStepAuth() {
    await this.withLoadingStatus(
      this.authClient.deleteTotpToken(sessionToken()!)
    );

    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        totp() {
          return { exists: false, verified: false };
        },
      },
    });
    await this.refresh('recoveryPhone');
    await this.refresh('backupCodes');
  }

  async deleteRecoveryKey() {
    await this.withLoadingStatus(
      this.authClient.deleteRecoveryKey(sessionToken()!)
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        recoveryKey(existingData) {
          return {
            exists: false,
            estimatedSyncDeviceCount: existingData.estimatedSyncDeviceCount,
          };
        },
      },
    });
  }

  async deleteSecondaryEmail(email: string) {
    await this.withLoadingStatus(
      this.authClient.recoveryEmailDestroy(sessionToken()!, email)
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        emails(existingEmails) {
          const emails = [...existingEmails];
          emails.splice(
            emails.findIndex((x) => x.email === email),
            1
          );
          return emails;
        },
      },
    });
  }

  async makeEmailPrimary(email: string) {
    await this.withLoadingStatus(
      this.authClient.recoveryEmailSetPrimaryEmail(sessionToken()!, email)
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        emails(existingEmails) {
          return existingEmails.map((x: Email) => {
            const e = { ...x };
            if (e.email === email) {
              e.isPrimary = true;
            } else if (e.isPrimary) {
              e.isPrimary = false;
            }
            return e;
          });
        },
        primaryEmail() {
          return { email, isPrimary: true, verified: true };
        },
        avatar: (existing, { readField }) => {
          const id = readField<string>('id', existing);
          const oldUrl = readField<string>('url', existing);
          return getNextAvatar(id, oldUrl, email, this.displayName);
        },
      },
    });

    const legacyLocalStorageAccount = currentAccount()!;
    legacyLocalStorageAccount.email = email;
    currentAccount(legacyLocalStorageAccount);

    firefox.profileChanged({ uid: this.uid });
  }

  async resendEmailCode(email: string) {
    return this.withLoadingStatus(
      this.authClient.recoveryEmailSecondaryResendCode(sessionToken()!, email)
    );
  }

  async createTotp(skipRecoveryCodes = false) {
    const opts = skipRecoveryCodes ? { skipRecoveryCodes } : {};
    const totp = await this.withLoadingStatus(
      this.authClient.createTotpToken(sessionToken()!, opts)
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        totp(currentTotp) {
          return { ...currentTotp, exists: true };
        },
      },
    });
    return totp;
  }

  async verifyTotp(code: string) {
    try {
      await this.withLoadingStatus(
        this.authClient.verifyTotpCode(sessionToken()!, code)
      );
      // We must requery for this because this endpoint checks
      // for if recovery codes exist
      await this.refresh('recoveryPhone');
      const cache = this.apolloClient.cache;
      cache.modify({
        id: cache.identify({ __typename: 'Account' }),
        fields: {
          totp(currentTotp) {
            return { ...currentTotp, verified: true };
          },
        },
      });
      await this.refresh('backupCodes');
    } catch (e) {
      // Re-throw and allow the presentation layer to display the error.
      // We don't want to set `totp.verified` to `true` if there's an error.
      throw e;
    }
  }

  async uploadAvatar(file: Blob) {
    const { access_token } = await this.withLoadingStatus(
      this.authClient.createOAuthToken(sessionToken()!, config.oauth.clientId, {
        scope: 'profile:write clients:write',
        ttl: 300,
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
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        avatar() {
          return { ...newAvatar, isDefault: false };
        },
      },
    });
    firefox.profileChanged({ uid: this.uid });
  }

  async createRecoveryKey(password: string, replaceKey: boolean = false) {
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
    await this.withLoadingStatus(
      this.authClient.createRecoveryKey(
        sessionToken()!,
        recoveryKeyId,
        recoveryData,
        true,
        replaceKey
      )
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        recoveryKey(existingData) {
          return {
            exists: true,
            estimatedSyncDeviceCount: existingData.estimatedSyncDeviceCount,
          };
        },
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
    await this.withLoadingStatus(
      this.apolloClient.mutate({
        mutation: gql`
          mutation metricsOpt($input: MetricsOptInput!) {
            metricsOpt(input: $input) {
              clientMutationId
            }
          }
        `,
        update: (cache) => {
          cache.modify({
            id: cache.identify({ __typename: 'Account' }),
            fields: {
              metricsEnabled: () => {
                return state === 'in';
              },
            },
          });
        },
        variables: { input: { state } },
      })
    );
    const legacyLocalStorageAccount = currentAccount()!;
    legacyLocalStorageAccount.metricsEnabled = state === 'in';
    currentAccount(legacyLocalStorageAccount);
    firefox.profileChanged({ metricsEnabled: this.metricsEnabled });
  }

  async unlinkThirdParty(providerId: number) {
    await this.withLoadingStatus(
      this.authClient.unlinkThirdParty(sessionToken()!, providerId)
    );

    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        linkedAccounts: (existingAccounts) => {
          return existingAccounts.filter((linkedAcc: LinkedAccount) => {
            return linkedAcc.providerId !== providerId;
          });
        },
      },
    });
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
    const data = await this.authClient.resetPasswordWithRecoveryKey(
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
    currentAccount(currentAccount(getStoredAccountData(data)));
    sessionToken(data.sessionToken);
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        recoveryKey(existingData) {
          return {
            exists: false,
            estimatedSyncDeviceCount: existingData.estimatedSyncDeviceCount,
          };
        },
      },
    });
    cache.writeQuery({
      query: GET_LOCAL_SIGNED_IN_STATUS,
      data: { isSignedIn: true },
    });
    return data;
  }

  async removeRecoveryPhone() {
    const result = await this.withLoadingStatus(
      this.authClient.recoveryPhoneDelete(sessionToken()!)
    );
    return result;
  }

  async addRecoveryPhone(phoneNumber: string) {
    const result = await this.withLoadingStatus(
      this.authClient.recoveryPhoneCreate(sessionToken()!, phoneNumber)
    );
    return result;
  }

  async changeRecoveryPhone(code: string) {
    const result = await this.withLoadingStatus(
      this.authClient.recoveryPhoneChange(sessionToken()!, code)
    );
    return result;
  }

  async confirmRecoveryPhone(
    code: string,
    phoneNumber: string,
    isInitial2faSetup: boolean
  ) {
    const { nationalFormat } = await this.withLoadingStatus(
      this.authClient.recoveryPhoneConfirmSetup(
        sessionToken()!,
        code,
        isInitial2faSetup
      )
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        recoveryPhone() {
          return {
            exists: true,
            phoneNumber,
            nationalFormat,
            available: true,
          };
        },
      },
    });
  }
}
