/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import base32Decode from 'base32-decode';
import { gql, ApolloClient, Reference, ApolloError } from '@apollo/client';
import config from '../lib/config';
import AuthClient, {
  generateRecoveryKey,
  getRecoveryKeyIdByUid,
} from 'fxa-auth-client/browser';
import { currentAccount, sessionToken } from '../lib/cache';
import firefox from '../lib/firefox';
import Storage from '../lib/storage';
import random from '../lib/random';
import { AuthUiErrorNos, AuthUiErrors } from '../lib/auth-errors/auth-errors';
import { CompletePasswordResetAccount } from './reset-password/account';

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
  providerId: number;
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
export interface AttachedClient {
  clientId: string;
  isCurrentSession: boolean;
  userAgent: string;
  deviceType: string | null;
  deviceId: string | null;
  name: string;
  lastAccessTime: number;
  lastAccessTimeFormatted: string;
  approximateLastAccessTime: number | null;
  approximateLastAccessTimeFormatted: string | null;
  location: DeviceLocation;
  os: string | null;
  sessionTokenId: string | null;
  refreshTokenId: string | null;
}

export interface AccountData {
  uid: hexstring;
  displayName: string | null;
  avatar: {
    id: string | null;
    url: string | null;
    isDefault: boolean;
  };
  accountCreated: number;
  passwordCreated: number;
  hasPassword: boolean;
  recoveryKey: boolean;
  metricsEnabled: boolean;
  primaryEmail: Email;
  emails: Email[];
  attachedClients: AttachedClient[];
  linkedAccounts: LinkedAccount[];
  totp: {
    exists: boolean;
    verified: boolean;
  };
  subscriptions: {
    created: number;
    productName: string;
  }[];
  securityEvents: SecurityEvent[];
}

const ATTACHED_CLIENTS_FIELDS = `
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
`;

export const ACCOUNT_FIELDS = `
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
      recoveryKey
      metricsEnabled
      primaryEmail @client
      emails {
        email
        isPrimary
        verified
      }
      ${ATTACHED_CLIENTS_FIELDS}
      totp {
        exists
        verified
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
`;

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
    ${ACCOUNT_FIELDS}
  }
`;

export const GET_CONNECTED_CLIENTS = gql`
  query GetConnectedClients {
    account {
      ${ATTACHED_CLIENTS_FIELDS}
    }
  }
`;

export const GET_RECOVERY_KEY_EXISTS = gql`
  query GetRecoveryKeyExists {
    account {
      recoveryKey
    }
  }
`;

export const GET_TOTP_STATUS = gql`
  query GetRecoveryKeyExists {
    account {
      totp {
        exists
        verified
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

  get subscriptions() {
    return this.data.subscriptions;
  }

  get totp() {
    return this.data.totp;
  }

  get totpActive() {
    return this.totp.exists && this.totp.verified;
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
    field: 'account' | 'clients' | 'totp' | 'recovery' | 'securityEvents'
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
    }
    await this.withLoadingStatus(
      this.apolloClient.query({
        fetchPolicy: 'network-only',
        query,
      })
    );
  }

  async hasRecoveryKey(email: string): Promise<boolean> {
    // Users may not be logged in (no session token) so we currently can't use GQL here
    return this.withLoadingStatus(
      (await this.authClient.recoveryKeyExists(sessionToken()!, email)).exists
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
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno;
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
        {
          keys: true,
          sessionToken: sessionToken()!,
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
    const passwordCreated = await this.withLoadingStatus(
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
          return passwordCreated;
        },
      },
    });
  }

  async resetPassword(email: string): Promise<PasswordForgotSendCodePayload> {
    try {
      const result = await this.apolloClient.mutate({
        mutation: gql`
          mutation passwordForgotSendCode(
            $input: PasswordForgotSendCodeInput!
          ) {
            passwordForgotSendCode(input: $input) {
              passwordForgotToken
            }
          }
        `,
        variables: { input: { email } },
      });

      return result.data.passwordForgotSendCode;
    } catch (err) {
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno;
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
    }
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
      console.log('err', err);
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno;

      // Invalid token means the user has completed reset password
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

  async resendResetPassword(
    email: string
  ): Promise<PasswordForgotSendCodePayload> {
    try {
      const result = await this.apolloClient.mutate({
        mutation: gql`
          mutation passwordForgotSendCode(
            $input: PasswordForgotSendCodeInput!
          ) {
            passwordForgotSendCode(input: $input) {
              clientMutationId
              passwordForgotToken
            }
          }
        `,
        variables: { input: { email } },
      });

      return result.data.passwordForgotSendCode;
    } catch (err) {
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno;
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
    }
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
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno;
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
    token: string,
    code: string,
    email: string,
    newPassword: string
  ): Promise<any> {
    try {
      const { accountResetToken } = await this.verifyPasswordForgotToken(
        token,
        code
      );
      const accountResetResult = await this.apolloClient.mutate({
        mutation: gql`
          mutation accountReset($input: AccountResetInput!) {
            accountReset(input: $input) {
              clientMutationId
            }
          }
        `,
        variables: { input: { accountResetToken, email, newPassword } },
      });
    } catch (err) {
      const errno = (err as ApolloError).graphQLErrors[0].extensions?.errno;
      if (errno && AuthUiErrorNos[errno]) {
        throw AuthUiErrorNos[errno];
      }
      throw AuthUiErrors.UNEXPECTED_ERROR;
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
              avatar: (existing: Reference, { readField }) => {
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
              attachedClients: (existingClients: AttachedClient[]) => {
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

  async sendVerificationCode() {
    await this.withLoadingStatus(
      this.authClient.sessionResendVerifyCode(sessionToken()!)
    );
  }

  async verifySession(code: string) {
    await this.withLoadingStatus(
      this.authClient.sessionVerifyCode(sessionToken()!, code)
    );
    this.apolloClient.cache.modify({
      fields: {
        session: () => {
          return { verified: true };
        },
      },
    });
  }

  async replaceRecoveryCodes() {
    return this.withLoadingStatus(
      this.authClient.replaceRecoveryCodes(sessionToken()!)
    );
  }

  async generateRecoveryCodes(count: number, length: number) {
    const recoveryCodes: string[] = [];
    const gen = random.base32(length);
    while (recoveryCodes.length < count) {
      const rc = (await gen()).toLowerCase();
      if (recoveryCodes.indexOf(rc) === -1) {
        recoveryCodes.push(rc);
      }
    }
    return recoveryCodes;
  }

  async updateRecoveryCodes(recoveryCodes: string[]) {
    const result = await this.withLoadingStatus(
      this.authClient.updateRecoveryCodes(sessionToken()!, recoveryCodes)
    );
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
  }

  async deleteRecoveryKey() {
    await this.withLoadingStatus(
      this.authClient.deleteRecoveryKey(sessionToken()!)
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        recoveryKey() {
          return false;
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
        avatar: (existing: Reference, { readField }) => {
          const id = readField<string>('id', existing);
          const oldUrl = readField<string>('url', existing);
          return getNextAvatar(id, oldUrl, email, this.displayName);
        },
      },
    });
    firefox.profileChanged({ uid: this.uid });
  }

  async resendEmailCode(email: string) {
    return this.withLoadingStatus(
      this.authClient.recoveryEmailSecondaryResendCode(sessionToken()!, email)
    );
  }

  async createTotp() {
    const totp = await this.withLoadingStatus(
      this.authClient.createTotpToken(sessionToken()!)
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
    await this.withLoadingStatus(
      this.authClient.verifyTotpCode(sessionToken()!, code)
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        totp(currentTotp) {
          return { ...currentTotp, verified: true };
        },
      },
    });
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

  async createRecoveryKey(password: string) {
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
        true
      )
    );
    const cache = this.apolloClient.cache;
    cache.modify({
      id: cache.identify({ __typename: 'Account' }),
      fields: {
        recoveryKey() {
          return true;
        },
      },
    });
    return recoveryKey;
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
}
