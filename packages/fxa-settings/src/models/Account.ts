import { gql, ApolloClient, Reference, DocumentNode } from '@apollo/client';
import config from '../lib/config';
import AuthClient, { generateRecoveryKey } from 'fxa-auth-client/browser';
import { currentAccount, sessionToken } from '../lib/cache';
import firefox from '../lib/firefox';
import Storage from '../lib/storage';
import {
  GetAccount,
  GetAccount_account,
  GetAccount_account_attachedClients,
  GetAccount_account_emails,
} from '../types/GetAccount';
import { metricsOpt, metricsOptVariables } from '../types/metricsOpt';
import {
  attachedClientDisconnect,
  attachedClientDisconnectVariables,
} from '../types/attachedClientDisconnect';
import { deleteAvatar } from '../types/deleteAvatar';
import {
  updateDisplayName,
  updateDisplayNameVariables,
} from '../types/updateDisplayName';
import { UpdatePassword } from '../types/UpdatePassword';

export const ACCOUNT_FIELDS = gql`
  fragment accountFields on Account {
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
    primaryEmail @client {
      email
    }
    emails {
      email
      isPrimary
      verified
    }
    totp {
      exists
      verified
    }
    subscriptions {
      created
      productName
    }
  }

  fragment attachedClientsFields on Account {
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
      primaryEmail @client {
        email
      }
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
      ...accountFields
      ...attachedClientsFields
    }
  }
  ${ACCOUNT_FIELDS}
`;

export const GET_CONNECTED_CLIENTS = gql`
  query GetConnectedClients {
    account {
      ...attachedClientsFields
    }
  }
  ${ACCOUNT_FIELDS}
`;

export const GET_RECOVERY_KEY_EXISTS = gql`
  query GetRecoveryKeyExists {
    account {
      recoveryKey
    }
  }
`;

export const GET_TOTP_STATUS = gql`
  query GetTotpStatus {
    account {
      totp {
        exists
        verified
      }
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

export class Account implements GetAccount_account {
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

  private async queryWithLoadingStatus(query: DocumentNode) {
    await this.withLoadingStatus(
      this.apolloClient.query({
        fetchPolicy: 'network-only',
        query,
      })
    );
  }

  private get data() {
    const { account } = this.apolloClient.cache.readQuery<GetAccount>({
      query: GET_ACCOUNT,
    })!;
    console.log(account);
    return account!;
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

  get hasSecondaryVerifiedEmail() {
    return this.emails.length > 1 && this.emails[1].verified;
  }

  async refresh(field: 'account' | 'clients' | 'totp' | 'recovery') {
    switch (field) {
      case 'account':
        await this.queryWithLoadingStatus(GET_ACCOUNT);
        break;
      case 'clients':
        await this.queryWithLoadingStatus(GET_CONNECTED_CLIENTS);
        break;
      case 'recovery':
        await this.queryWithLoadingStatus(GET_RECOVERY_KEY_EXISTS);
        break;
      case 'totp':
        await this.queryWithLoadingStatus(GET_TOTP_STATUS);
        break;
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
    this.apolloClient.cache.writeQuery<UpdatePassword>({
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
        },
        session: { verified: response.verified },
      },
    });
  }

  async setDisplayName(displayName: string) {
    await this.withLoadingStatus(
      this.apolloClient.mutate<updateDisplayName, updateDisplayNameVariables>({
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
    firefox.profileChanged(this.uid);
  }

  async deleteAvatar() {
    await this.withLoadingStatus(
      this.apolloClient.mutate<deleteAvatar>({
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
    firefox.profileChanged(this.uid);
  }

  async disconnectClient(client: GetAccount_account_attachedClients) {
    await this.withLoadingStatus(
      this.apolloClient.mutate<
        attachedClientDisconnect,
        attachedClientDisconnectVariables
      >({
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
              attachedClients: (
                existingClients: GetAccount_account_attachedClients[]
              ) => {
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
          return existingEmails.map((x: GetAccount_account_emails) =>
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
          return existingEmails.map((x: GetAccount_account_emails) => {
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
    firefox.profileChanged(this.uid);
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
    firefox.profileChanged(this.uid);
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
      this.apolloClient.mutate<metricsOpt, metricsOptVariables>({
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
