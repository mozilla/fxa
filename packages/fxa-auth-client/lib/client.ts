/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from './crypto';
import { Credentials } from './crypto';
import * as hawk from './hawk';
import { SaltVersion, createSaltV2 } from './salt';
import * as Sentry from '@sentry/browser';
import { MetricsContext } from '@fxa/shared/metrics/glean';

enum ERRORS {
  INVALID_TIMESTAMP = 111,
  INCORRECT_EMAIL_CASE = 120,
}

enum tokenType {
  sessionToken = 'sessionToken',
  passwordForgotToken = 'passwordForgotToken',
  keyFetchToken = 'keyFetchToken',
  accountResetToken = 'accountResetToken',
  passwordChangeToken = 'passwordChangeToken',
}

export enum AUTH_PROVIDER {
  GOOGLE = 'google',
  APPLE = 'apple',
}

export type BoolString = 'true' | 'false' | 'yes' | 'no';

export type CredentialsV1 = Credentials;

export type CredentialsV2 = Credentials & {
  clientSalt: string;
};

export type CredentialSet = {
  upgradeNeeded: boolean;
  v1: CredentialsV1;
  v2?: CredentialsV2;
};

export type CredentialStatus = {
  upgradeNeeded: boolean;
  currentVersion?: 'v1' | 'v2';
  clientSalt?: string;
};

export type SignUpOptions = {
  keys?: boolean;
  service?: string;
  redirectTo?: string;
  preVerified?: BoolString;
  resume?: string;
  lang?: string;
  style?: string;
  verificationMethod?: string;
  metricsContext?: MetricsContext;
};

export type SignedUpAccountData = {
  uid: hexstring;
  sessionToken: hexstring;
  keyFetchToken?: hexstring;
  authAt: number;
  verificationMethod?: string;
  unwrapBKey?: hexstring;
};

export type SignInOptions = {
  keys?: boolean;
  skipCaseError?: boolean;
  service?: string;
  reason?: string;
  redirectTo?: string;
  resume?: string;
  originalLoginEmail?: string;
  verificationMethod?: string;
  unblockCode?: string;
  metricsContext?: MetricsContext;
  postPasswordUpgrade?: boolean;
  skipPasswordUpgrade?: boolean;
};

export type SignedInAccountData = {
  uid: hexstring;
  sessionToken: hexstring;
  emailVerified: boolean;
  sessionVerified: boolean;
  authAt: number;
  metricsEnabled: boolean;
  keyFetchToken?: hexstring;
  verificationMethod?: string;
  verificationReason?: string;
  unwrapBKey?: hexstring;
};

export type PasswordChangePayload = {
  authPW: string;
  wrapKb: string;
  sessionToken: string;
  wrapKbVersion2?: string;
  authPWVersion2?: string;
  clientSalt?: string;
};

export type SessionReauthOptions = SignInOptions;
export type SessionReauthedAccountData = Omit<
  SignedInAccountData,
  'sessionToken'
>;

export type SessionStatus = {
  state: 'verified' | 'unverified';
  uid: string;
  details: {
    accountEmailVerified: boolean;
    sessionVerificationMethod: string | null;
    sessionVerified: boolean;
    sessionVerificationMeetsMinimumAAL: boolean;
  };
};

export type AuthServerError = Error & {
  error?: string;
  errno?: number;
  message?: string;
  code?: number;
  retryAfter?: number;
  retryAfterLocalized?: string;
};

export type VerificationMethod =
  | 'email'
  | 'email-otp'
  | 'email-2fa'
  | 'email-captcha'
  | 'totp-2fa';

function createHeaders(
  headers?: Headers | undefined,
  options?: Record<string, any> & { lang?: string }
) {
  if (headers === undefined) {
    headers = new Headers();
  }
  if (options?.lang) {
    headers.set('Accept-Language', options.lang);
  }
  return headers;
}

function pathWithKeys(path: string, keys?: boolean) {
  return `${path}${keys ? '?keys=true' : ''}`;
}

async function fetchOrTimeout(
  input: RequestInfo,
  init: RequestInit = {},
  timeout: number
) {
  let id = 0;
  if (typeof AbortController !== 'undefined') {
    const aborter = new AbortController();
    init.signal = aborter.signal;
    id = setTimeout((() => aborter.abort()) as TimerHandler, timeout);
  }
  try {
    return await fetch(input, init);
  } finally {
    if (id) {
      clearTimeout(id);
    }
  }
}

function cleanStringify(value: any) {
  // remove keys with null values
  return JSON.stringify(value, (_, v) => (v == null ? undefined : v));
}

export class AuthClientError extends Error {
  code: number;
  errno: number;
  error: string;

  constructor(error: string, message: string, errno: number, code: number) {
    super(message);

    this.code = code;
    this.errno = errno;
    this.error = error;
  }
}

export type AuthClientOptions = {
  timeout?: number;
  keyStretchVersion?: SaltVersion;
};

export default class AuthClient {
  static VERSION = 'v1';
  private uri: string;
  private localtimeOffsetMsec: number;
  private timeout: number;
  private keyStretchVersion: SaltVersion;
  private requireHeaders: boolean;
  private errorHandler: (error: unknown) => Promise<void>;

  constructor(
    authServerUri: string,
    options: {
      timeout?: number;
      keyStretchVersion?: SaltVersion;
      requireHeaders?: boolean;
      errorHandler?: (error: unknown) => Promise<void>;
    } = {}
  ) {
    if (new RegExp(`/${AuthClient.VERSION}$`).test(authServerUri)) {
      this.uri = authServerUri;
    } else {
      this.uri = `${authServerUri}/${AuthClient.VERSION}`;
    }
    this.keyStretchVersion = options.keyStretchVersion || 1;
    this.localtimeOffsetMsec = 0;
    this.timeout = options.timeout || 30000;
    this.requireHeaders = options.requireHeaders === true;
    this.errorHandler =
      options.errorHandler ||
      (async (e) => {
        throw e;
      });
  }

  static async create(authServerUri: string, options?: AuthClientOptions) {
    if (typeof TextEncoder === 'undefined') {
      await import(
        // @ts-ignore
        /* webpackChunkName: "fast-text-encoding" */ 'fast-text-encoding'
      );
    }
    await crypto.checkWebCrypto();
    return new AuthClient(authServerUri, options);
  }

  private url(path: string) {
    return `${this.uri}${path}`;
  }

  private async request(
    method: string,
    path: string,
    payload: object | null,
    extraHeaders: Headers | undefined
  ) {
    if (extraHeaders === undefined) {
      if (this.requireHeaders) {
        await this.errorHandler(new Error('extraHeaders missing!'));
        return;
      } else {
        extraHeaders = new Headers();
      }
    }

    extraHeaders.set('Content-Type', 'application/json');
    try {
      const response = await fetchOrTimeout(
        this.url(path),
        {
          method,
          headers: extraHeaders,
          body: cleanStringify(payload),
        },
        this.timeout
      );
      const result = JSON.parse(await response.text());
      if (result.errno) {
        throw result;
      }
      if (!response.ok) {
        throw new AuthClientError(
          'Unknown error',
          result,
          999,
          response.status
        );
      }
      return result;
    } catch (e) {
      await this.errorHandler(e);
    }
  }

  private async hawkRequest(
    method: string,
    path: string,
    token: hexstring,
    kind: tokenType,
    payload: object | null,
    extraHeaders: Headers | undefined
  ) {
    if (extraHeaders === undefined) {
      if (this.requireHeaders) {
        await this.errorHandler(new Error('extraHeaders missing!'));
        return;
      } else {
        extraHeaders = new Headers();
      }
    }

    const makeHeaders = async () => {
      const headers = await hawk.header(method, this.url(path), token, kind, {
        payload: cleanStringify(payload),
        contentType: 'application/json',
        localtimeOffsetMsec: this.localtimeOffsetMsec,
      });
      if (extraHeaders) {
        for (const [name, value] of extraHeaders) {
          headers.set(name, value);
        }
      }
      return headers;
    };
    try {
      return await this.request(method, path, payload, await makeHeaders());
    } catch (e: any) {
      if (e.errno === ERRORS.INVALID_TIMESTAMP) {
        const serverTime = e.serverTime * 1000 || Date.now();
        this.localtimeOffsetMsec = serverTime - Date.now();
        return this.request(method, path, payload, await makeHeaders());
      }
      throw e;
    }
  }

  private async sessionGet(
    path: string,
    sessionToken: hexstring,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'GET',
      path,
      sessionToken,
      tokenType.sessionToken,
      null,
      headers
    );
  }

  private async jwtGet(path: string, jwt: string, headers?: Headers) {
    const authorization = 'Bearer ' + jwt;
    if (!headers) {
      headers = new Headers({ authorization });
    } else {
      headers.set('authorization', authorization);
    }
    return this.request('GET', path, null, headers);
  }

  private async jwtPost(
    path: string,
    jwt: string,
    payload: any,
    headers?: Headers
  ) {
    const authorization = 'Bearer ' + jwt;
    if (!headers) {
      headers = new Headers({ authorization });
    } else {
      headers.set('authorization', authorization);
    }
    return this.request('POST', path, payload, headers);
  }

  private async jwtDelete(
    path: string,
    jwt: string,
    payload: any,
    headers?: Headers
  ) {
    const authorization = 'Bearer ' + jwt;
    if (!headers) {
      headers = new Headers({ authorization });
    } else {
      headers.set('authorization', authorization);
    }
    return this.request('DELETE', path, payload, headers);
  }

  private async jwtPut(
    path: string,
    jwt: string,
    payload: any,
    headers?: Headers
  ) {
    const authorization = 'Bearer ' + jwt;
    if (!headers) {
      headers = new Headers({ authorization });
    } else {
      headers.set('authorization', authorization);
    }
    return this.request('PUT', path, payload, headers);
  }

  private async sessionPost(
    path: string,
    sessionToken: hexstring,
    payload: object,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'POST',
      path,
      sessionToken,
      tokenType.sessionToken,
      payload,
      headers
    );
  }

  private async sessionPut(
    path: string,
    sessionToken: hexstring,
    payload: object,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'PUT',
      path,
      sessionToken,
      tokenType.sessionToken,
      payload,
      headers
    );
  }

  private async sessionDelete(
    path: string,
    sessionToken: hexstring,
    payload: object,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'DELETE',
      path,
      sessionToken,
      tokenType.sessionToken,
      payload,
      headers
    );
  }

  /**
   * Allows us to toggle the key stretch version.
   * @param version
   */
  setKeyStretchVersion(version: 1 | 2) {
    this.keyStretchVersion = version;
  }

  /**
   * Used for sign up on clients with direct access to the plaintext password.
   */
  async signUp(
    email: string,
    password: string,
    options: SignUpOptions = {},
    headers?: Headers
  ): Promise<SignedUpAccountData> {
    const credentialsV1 = await crypto.getCredentials(email, password);

    let credentialsV2 = undefined;
    if (this.keyStretchVersion === 2) {
      const clientSalt = await createSaltV2();
      credentialsV2 = await crypto.getCredentialsV2({ password, clientSalt });
    }

    const v2Payload = await this.getPayloadV2({
      v1: credentialsV1,
      v2: credentialsV2,
    });

    const accountData = (await this.signUpWithAuthPW(
      email,
      credentialsV1.authPW,
      v2Payload,
      options,
      createHeaders(headers, options)
    )) as SignedUpAccountData;
    if (options?.keys) {
      if (credentialsV2) {
        accountData.unwrapBKey = credentialsV2.unwrapBKey;
      } else {
        accountData.unwrapBKey = credentialsV1.unwrapBKey;
      }
    }
    return accountData;
  }

  /**
   * This function is intended for a service that will proxy the sign-up
   * request. When signing up from a client with access to the plaintext
   * password, use `signUp` above.
   */
  async signUpWithAuthPW(
    email: string,
    authPW: string,
    v2:
      | {
          wrapKb: string;
          authPWVersion2: string;
          wrapKbVersion2: string;
          clientSalt: string;
        }
      | {},
    options: SignUpOptions,
    headers?: Headers
  ): Promise<Omit<SignedUpAccountData, 'unwrapBKey'>> {
    const payloadOptions = ({ keys, lang, ...rest }: SignUpOptions) => rest;
    const payload = {
      email,
      authPW,
      ...v2,
      ...payloadOptions(options),
    };
    const accountData = await this.request(
      'POST',
      pathWithKeys('/account/create', options.keys),
      payload,
      createHeaders(headers, options)
    );

    if (v2) {
      if (accountData.keyFetchTokenVersion2) {
        accountData.keyFetchToken = accountData.keyFetchTokenVersion2;
        delete accountData.keyFetchTokenVersion2;
      }
    }

    return accountData;
  }

  /**
   * Used for authentication on clients with direct access to the plaintext
   * password.
   */
  async signIn(
    email: string,
    password: string,
    options: SignInOptions = {},
    headers?: Headers
  ): Promise<SignedInAccountData> {
    let credentials = await this.getCredentialSet({ email, password }, headers);
    try {
      let accountData: SignedInAccountData;
      if (this.keyStretchVersion === 2) {
        if (credentials.upgradeNeeded) {
          // To do the password upgrade we first sign the user in with V1 creds,
          // then do a password change to upgrade to V2.
          this.keyStretchVersion = 1;
          accountData = await this.signInWithAuthPW(
            email,
            credentials.v1.authPW,
            options,
            createHeaders(headers, options)
          );

          try {
            if (
              accountData.sessionToken &&
              options.skipPasswordUpgrade !== true
            ) {
              this.keyStretchVersion = 2;
              await this.passwordChange(
                email,
                password,
                password,
                accountData.sessionToken,
                options,
                headers
              );
            }
          } catch (err) {
            Sentry.captureMessage(
              'Failure to complete v2 key stretch upgrade.'
            );
          }
        } else if (credentials.v2) {
          // Already using V2! Just sign in.
          accountData = await this.signInWithAuthPW(
            email,
            credentials.v2.authPW,
            options,
            createHeaders(headers, options)
          );
        } else {
          await this.errorHandler(
            new Error(
              'Invalid state. V2 credentials not provided and no upgraded needed.'
            )
          );
          return {} as SignedInAccountData;
        }
      } else {
        accountData = await this.signInWithAuthPW(
          email,
          credentials.v1.authPW,
          options,
          createHeaders(headers, options)
        );
      }

      // Relay unwrapBKeys
      if (options.keys) {
        if (credentials.v2) {
          accountData.unwrapBKey = credentials.v2.unwrapBKey;
        } else {
          accountData.unwrapBKey = credentials.v1.unwrapBKey;
        }
      }

      return accountData;
    } catch (error: any) {
      if (
        error &&
        error.email &&
        error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
        !options.skipCaseError
      ) {
        options.skipCaseError = true;
        options.originalLoginEmail = email;
        return this.signIn(
          error.email,
          password,
          options,
          createHeaders(headers, options)
        );
      } else {
        throw error;
      }
    }
  }

  /**
   * This function is intended for a service that will proxy the authentication
   * request.  When authenticating from a client with access to the plaintext
   * password, use `signIn` above, which has additional error handling.
   */
  async signInWithAuthPW(
    email: string,
    authPW: string,
    options: SignInOptions = {},
    headers?: Headers
  ): Promise<Omit<SignedInAccountData, 'unwrapBKey'>> {
    const payloadOptions = ({ keys, ...rest }: any) => rest;
    const payload = {
      email,
      authPW,
      ...payloadOptions(options),
    };
    const accountData = await this.request(
      'POST',
      pathWithKeys('/account/login', options.keys),
      payload,
      createHeaders(headers, options)
    );

    if (accountData.keyFetchTokenVersion2) {
      accountData.keyFetchToken = accountData.keyFetchTokenVersion2;
      delete accountData.keyFetchTokenVersion2;
    }

    return accountData;
  }

  async verifyCode(
    uid: hexstring,
    code: string,
    options: {
      service?: string;
      reminder?: string;
      type?: string;
      marketingOptIn?: boolean;
      newsletters?: string[];
      style?: string;
    } = {},
    headers?: Headers
  ) {
    return this.request(
      'POST',
      '/recovery_email/verify_code',
      {
        uid,
        code,
        ...options,
      },
      createHeaders(headers, options)
    );
  }

  async recoveryEmailStatus(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/recovery_email/status', sessionToken, headers);
  }

  async recoveryEmailResendCode(
    sessionToken: hexstring,
    options: {
      email?: string;
      service?: string;
      redirectTo?: string;
      resume?: string;
      type?: string;
      lang?: string;
    } = {},
    headers?: Headers
  ) {
    const payloadOptions = ({ lang, ...rest }: any) => rest;
    return this.sessionPost(
      '/recovery_email/resend_code',
      sessionToken,
      payloadOptions(options),
      createHeaders(headers, options)
    );
  }

  async passwordForgotSendOtp(
    email: string,
    options: {
      service?: string;
      metricsContext?: MetricsContext;
    } = {},
    headers?: Headers
  ) {
    const payload = {
      email,
      ...options,
    };
    return this.request(
      'POST',
      '/password/forgot/send_otp',
      payload,
      createHeaders(headers, options)
    );
  }

  async passwordForgotVerifyOtp(
    email: string,
    code: string,
    options: {
      metricsContext?: MetricsContext;
    } = {},
    headers?: Headers
  ) {
    const payload = {
      email,
      code,
      ...options,
    };
    return this.request(
      'POST',
      '/password/forgot/verify_otp',
      payload,
      createHeaders(headers, options)
    );
  }

  async passwordForgotSendCode(
    email: string,
    options: {
      service?: string;
      redirectTo?: string;
      resume?: string;
      lang?: string;
      metricsContext?: MetricsContext;
    } = {},
    headers?: Headers
  ) {
    const payloadOptions = ({ lang, ...rest }: any) => rest;
    const payload = {
      email,
      ...payloadOptions(options),
    };
    return this.request(
      'POST',
      '/password/forgot/send_code',
      payload,
      createHeaders(headers, options)
    );
  }

  async passwordForgotResendCode(
    email: string,
    passwordForgotToken: hexstring,
    options: {
      service?: string;
      redirectTo?: string;
      resume?: string;
      lang?: string;
    } = {},
    headers?: Headers
  ) {
    const payloadOptions = ({ lang, ...rest }: any) => rest;
    const payload = {
      email,
      ...payloadOptions(options),
    };
    return this.hawkRequest(
      'POST',
      '/password/forgot/resend_code',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      payload,
      createHeaders(headers, options)
    );
  }

  async passwordForgotVerifyCode(
    code: string,
    passwordForgotToken: hexstring,
    options: {
      accountResetWithRecoveryKey?: boolean;
      includeRecoveryKeyPrompt?: boolean;
    } = {},
    headers?: Headers
  ) {
    const payload = {
      code,
      ...options,
    };
    return this.hawkRequest(
      'POST',
      '/password/forgot/verify_code',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      payload,
      headers
    );
  }

  async passwordForgotStatus(passwordForgotToken: string, headers?: Headers) {
    return this.hawkRequest(
      'GET',
      '/password/forgot/status',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      null,
      headers
    );
  }

  async passwordForgotRecoveryKeyStatus(
    passwordForgotToken: hexstring,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'POST',
      '/recoveryKey/exists',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      null,
      headers
    );
  }

  // TODO: Once password reset react is 100% and stable in production
  // we can remove this.
  async accountReset(
    email: string,
    newPassword: string,
    accountResetToken: hexstring,
    options: {
      keys?: boolean;
      sessionToken?: boolean;
    } = {},
    headers?: Headers
  ) {
    const credentials = await this.getCredentialSet(
      {
        email,
        password: newPassword,
      },
      headers
    );

    // Important! This does not take kB, so the encrypted data will become
    // inaccessible after this operation. A new kB will be created!
    let v2Payload = await this.getPayloadV2(credentials);

    const payloadOptions = ({ keys, ...rest }: any) => rest;
    const payload = {
      authPW: credentials.v1.authPW,
      ...v2Payload,
      ...payloadOptions(options),
    };
    const accountData = await this.hawkRequest(
      'POST',
      pathWithKeys('/account/reset', options.keys),
      accountResetToken,
      tokenType.accountResetToken,
      payload,
      headers
    );
    if (options.keys && accountData.keyFetchToken) {
      accountData.unwrapBKey = credentials.v1.unwrapBKey;
      accountData.unwrapBKeyVersion2 = credentials.v2?.unwrapBKey;
    }
    return accountData;
  }

  async accountResetAuthPW(
    authPW: string,
    accountResetToken: hexstring,
    v2Payload:
      | {
          wrapKb: string;
          authPWVersion2: string;
          wrapKbVersion2: string;
          clientSalt: string;
        }
      | {},
    options: {
      // This option won't work in gql
      keys?: boolean;
      sessionToken?: boolean;
    } = {},
    headers?: Headers
  ) {
    const payloadOptions = ({ keys, ...rest }: any) => rest;
    const payload = {
      authPW,
      ...v2Payload,
      ...payloadOptions(options),
    };
    return await this.hawkRequest(
      'POST',
      pathWithKeys('/account/reset', options.keys),
      accountResetToken,
      tokenType.accountResetToken,
      payload,
      headers
    );
  }

  async finishSetup(
    token: string,
    email: string,
    newPassword: string,
    headers?: Headers
  ): Promise<{
    uid: hexstring;
    sessionToken: hexstring;
    verified: boolean;
  }> {
    const credentials = await this.getCredentialSet(
      {
        email,
        password: newPassword,
      },
      headers
    );
    const v2Payload = await this.getPayloadV2(credentials);
    return this.finishSetupWithAuthPW(
      token,
      credentials.v1.authPW,
      v2Payload,
      headers
    );
  }

  /**
   * This function is intended for a service that will proxy the finish setup
   * (setting a password of a stub account) request.  When setting a password
   * from a client with access to the plaintext password, use `finishSetup`
   * above.
   */
  async finishSetupWithAuthPW(
    token: string,
    authPW: string,
    v2Payload:
      | {
          wrapKb: string;
          authPWVersion2: string;
          wrapKbVersion2: string;
          clientSalt: string;
        }
      | {},
    headers?: Headers
  ) {
    const payload = {
      token,
      authPW,
      ...v2Payload,
    };
    return await this.request(
      'POST',
      '/account/finish_setup',
      payload,
      headers
    );
  }

  async verifyAccountThirdParty(
    code: string,
    provider: AUTH_PROVIDER = AUTH_PROVIDER.GOOGLE,
    service: string | undefined,
    metricsContext: MetricsContext | undefined,
    headers?: Headers
  ): Promise<{
    uid: hexstring;
    sessionToken: hexstring;
    providerUid: hexstring;
    email: string;
    verificationMethod?: string;
  }> {
    metricsContext = metricsContext || {};
    const payload = {
      code,
      provider,
      service,
      metricsContext,
    };
    return await this.request(
      'POST',
      '/linked_account/login',
      payload,
      headers
    );
  }

  async unlinkThirdParty(
    sessionToken: hexstring,
    providerId: number,
    headers?: Headers
  ): Promise<{ success: boolean }> {
    let provider: AUTH_PROVIDER;

    switch (providerId) {
      case 2: {
        provider = AUTH_PROVIDER.APPLE;
        break;
      }
      default: {
        provider = AUTH_PROVIDER.GOOGLE;
      }
    }
    return await this.sessionPost(
      '/linked_account/unlink',
      sessionToken,
      {
        provider,
      },
      headers
    );
  }

  async accountKeys(
    keyFetchToken: hexstring,
    unwrapBKey: hexstring,
    headers?: Headers
  ): Promise<{
    kA: hexstring;
    kB: hexstring;
  }> {
    const credentials = await hawk.deriveHawkCredentials(
      keyFetchToken,
      'keyFetchToken'
    );
    const keyData = await this.hawkRequest(
      'GET',
      '/account/keys',
      keyFetchToken,
      tokenType.keyFetchToken,
      null,
      headers
    );
    const keys = await crypto.unbundleKeyFetchResponse(
      credentials.bundleKey,
      keyData.bundle
    );
    return {
      kA: keys.kA,
      kB: crypto.unwrapKB(keys.wrapKB, unwrapBKey),
    };
  }

  async wrappedAccountKeys(keyFetchToken: hexstring, headers?: Headers) {
    const credentials = await hawk.deriveHawkCredentials(
      keyFetchToken,
      'keyFetchToken'
    );
    const keyData = await this.hawkRequest(
      'GET',
      '/account/keys',
      keyFetchToken,
      tokenType.keyFetchToken,
      null,
      headers
    );

    const keys = await crypto.unbundleKeyFetchResponse(
      credentials.bundleKey,
      keyData.bundle
    );
    return {
      kA: keys.kA,
      wrapKB: keys.wrapKB,
    };
  }

  async accountDestroy(
    email: string,
    password: string,
    options: {
      skipCaseError?: boolean;
    } = {},
    sessionToken: hexstring,
    headers?: Headers
  ): Promise<any> {
    const credentials = await crypto.getCredentials(email, password);
    const payload = {
      email,
      authPW: credentials.authPW,
    };
    try {
      return await this.sessionPost(
        '/account/destroy',
        sessionToken,
        payload,
        headers
      );
    } catch (error: any) {
      if (
        error &&
        error.email &&
        error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
        !options.skipCaseError
      ) {
        options.skipCaseError = true;

        return this.accountDestroy(
          error.email,
          password,
          options,
          sessionToken,
          headers
        );
      } else {
        throw error;
      }
    }
  }

  async accountStatus(
    uid?: hexstring,
    sessionToken?: hexstring,
    headers?: Headers
  ): Promise<{ exists: boolean; locale?: string; hasPassword?: boolean }> {
    if (sessionToken) {
      return this.sessionGet('/account/status', sessionToken, headers);
    }
    return this.request('GET', `/account/status?uid=${uid}`, null, headers);
  }

  async accountStatusByEmail(
    email: string,
    options: { thirdPartyAuthStatus?: boolean } = {},
    headers?: Headers
  ) {
    return this.request(
      'POST',
      '/account/status',
      { email, ...options },
      headers
    );
  }

  async accountProfile(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/account/profile', sessionToken, headers);
  }

  async account(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/account', sessionToken, headers);
  }

  async sessionDestroy(
    sessionToken: hexstring,
    options: {
      customSessionToken?: string;
    } = {},
    headers?: Headers
  ) {
    return this.sessionPost('/session/destroy', sessionToken, options, headers);
  }

  async sessionStatus(
    sessionToken: hexstring,
    headers?: Headers
  ): Promise<SessionStatus> {
    return this.sessionGet('/session/status', sessionToken, headers);
  }

  async sessionVerifyCode(
    sessionToken: hexstring,
    code: string,
    options: {
      service?: string;
      scopes?: string[];
      marketingOptIn?: boolean;
      newsletters?: string[];
    } = {},
    headers?: Headers
  ): Promise<{}> {
    return this.sessionPost(
      '/session/verify_code',
      sessionToken,
      {
        code,
        ...options,
      },
      headers
    );
  }

  async sessionResendVerifyCode(
    sessionToken: hexstring,
    headers?: Headers
  ): Promise<{}> {
    return this.sessionPost('/session/resend_code', sessionToken, {}, headers);
  }

  async sessionReauth(
    sessionToken: hexstring,
    email: string,
    password: string,
    options: SessionReauthOptions = {},
    headers?: Headers
  ): Promise<SessionReauthedAccountData> {
    const credentials = await crypto.getCredentials(email, password);
    try {
      const accountData = await this.sessionReauthWithAuthPW(
        sessionToken,
        email,
        credentials.authPW,
        options,
        headers
      );
      if (options.keys) {
        accountData.unwrapBKey = credentials.unwrapBKey;
      }
      return accountData;
    } catch (error: any) {
      if (
        error &&
        error.email &&
        error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
        !options.skipCaseError
      ) {
        options.skipCaseError = true;
        options.originalLoginEmail = email;

        return this.sessionReauth(
          sessionToken,
          error.email,
          password,
          options,
          headers
        );
      } else {
        throw error;
      }
    }
  }

  async sessionReauthWithAuthPW(
    sessionToken: hexstring,
    email: string,
    authPW: string,
    options: Omit<SessionReauthOptions, 'skipCaseError'> = {},
    headers?: Headers
  ): Promise<SessionReauthedAccountData> {
    const payloadOptions = ({ keys, ...rest }: any) => rest;
    const payload = {
      email,
      authPW,
      ...payloadOptions(options),
    };
    const accountData = await this.sessionPost(
      pathWithKeys('/session/reauth', options.keys),
      sessionToken,
      payload,
      headers
    );
    return accountData;
  }

  async passwordChange(
    email: string,
    oldPassword: string,
    newPassword: string,
    sessionToken: string,
    options: {
      keys?: boolean;
    } = {},
    headers?: Headers
  ): Promise<SignedInAccountData> {
    const oldCredentials = await this.passwordChangeStart(
      email,
      oldPassword,
      sessionToken,
      undefined,
      headers
    );

    const keys = await this.accountKeys(
      oldCredentials.keyFetchToken,
      oldCredentials.unwrapBKey,
      headers
    );

    const newCredentials = await crypto.getCredentials(
      oldCredentials.email,
      newPassword
    );

    const wrapKb = crypto.unwrapKB(keys.kB, newCredentials.unwrapBKey);
    const { id: sessionTokenId } = await hawk.deriveHawkCredentials(
      sessionToken,
      'sessionToken'
    );

    let payload: PasswordChangePayload = {
      authPW: newCredentials.authPW,
      wrapKb,
      sessionToken: sessionTokenId,
    };

    let unwrapBKeyVersion2: string | undefined;
    if (this.keyStretchVersion === 2) {
      const v2Payload = await this.createPasswordChangeV2Payload(
        email,
        newPassword,
        keys,
        newCredentials,
        wrapKb,
        headers
      );

      unwrapBKeyVersion2 = v2Payload.unwrapBKeyVersion2;
      payload = {
        ...payload,
        authPWVersion2: v2Payload.authPWVersion2,
        wrapKbVersion2: v2Payload.wrapKbVersion2,
        clientSalt: v2Payload.clientSalt,
      };
    }
    const accountData = await this.passwordChangeFinish(
      oldCredentials.passwordChangeToken,
      payload,
      options,
      headers
    );
    if (options.keys && accountData.keyFetchToken) {
      accountData.unwrapBKey = newCredentials.unwrapBKey;
      accountData.unwrapBKeyVersion2 = unwrapBKeyVersion2;
    }
    return accountData;
  }

  public async passwordChangeStartWithAuthPW(
    email: string,
    oldAuthPW: string,
    sessionToken: string,
    options: {
      skipCaseError?: boolean;
    } = {},
    headers?: Headers
  ): Promise<{
    email: string;
    keyFetchToken: hexstring;
    passwordChangeToken: hexstring;
  }> {
    try {
      const passwordData = await this.sessionPost(
        '/password/change/start',
        sessionToken,
        {
          email,
          oldAuthPW: oldAuthPW,
        },
        headers
      );

      return {
        email: email,
        keyFetchToken: passwordData.keyFetchToken,
        passwordChangeToken: passwordData.passwordChangeToken,
      };
    } catch (error: any) {
      if (
        error &&
        error.email &&
        error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
        !options.skipCaseError
      ) {
        options.skipCaseError = true;

        return await this.passwordChangeStartWithAuthPW(
          error.email,
          oldAuthPW,
          sessionToken,
          options,
          headers
        );
      } else {
        throw error;
      }
    }
  }

  private async passwordChangeStart(
    email: string,
    oldPassword: string,
    sessionToken: string,
    options: {
      skipCaseError?: boolean;
    } = {},
    headers?: Headers
  ): Promise<{
    authPW: hexstring;
    unwrapBKey: hexstring;
    email: string;
    keyFetchToken: hexstring;
    passwordChangeToken: hexstring;
  }> {
    const oldCredentials = await crypto.getCredentials(email, oldPassword);
    try {
      const passwordData = await this.sessionPost(
        '/password/change/start',
        sessionToken,
        {
          email,
          oldAuthPW: oldCredentials.authPW,
        }
      );
      return {
        authPW: oldCredentials.authPW,
        unwrapBKey: oldCredentials.unwrapBKey,
        email: email,
        keyFetchToken: passwordData.keyFetchToken,
        passwordChangeToken: passwordData.passwordChangeToken,
      };
    } catch (error: any) {
      if (
        error &&
        error.email &&
        error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
        !options.skipCaseError
      ) {
        options.skipCaseError = true;

        return await this.passwordChangeStart(
          error.email,
          oldPassword,
          sessionToken,
          options,
          headers
        );
      } else {
        throw error;
      }
    }
  }

  public async passwordChangeFinish(
    passwordChangeToken: string,
    payload: PasswordChangePayload,
    options: { keys?: boolean },
    headers?: Headers
  ) {
    const response = await this.hawkRequest(
      'POST',
      pathWithKeys('/password/change/finish', options.keys),
      passwordChangeToken,
      tokenType.passwordChangeToken,
      payload,
      headers
    );
    return response;
  }

  /**
   * Creates the v2 extension payload for password change operations.
   * Handles the common logic for v2 credential creation and validation.
   *
   * @private
   * @param email - The email of the user
   * @param newPassword - The new password for v2 credential generation
   * @param keys - The account keys containing kB
   * @param newCredentials - The new v1 credentials
   * @param wrapKb - The wrapped key bundle to validate against
   * @param headers - Optional headers
   * @returns Object containing v2 payload fields and unwrapBKeyVersion2
   */
  private async createPasswordChangeV2Payload(
    email: string,
    newPassword: string,
    keys: { kB: string },
    newCredentials: { authPW: string; unwrapBKey: string },
    wrapKb: string,
    headers?: Headers
  ): Promise<{
    authPWVersion2: string;
    wrapKbVersion2: string;
    clientSalt: string;
    unwrapBKeyVersion2: string;
  }> {
    const status = await this.getCredentialStatusV2(email, headers);
    const clientSalt = status.clientSalt || createSaltV2();
    const newCredentialsV2 = await crypto.getCredentialsV2({
      password: newPassword,
      clientSalt: clientSalt,
    });

    // Important! Passing kB, ensures kB remains constant even after password upgrade.
    const newKeys = await crypto.getKeysV2({
      kB: keys.kB,
      v1: newCredentials,
      v2: newCredentialsV2,
    });

    if (newKeys.wrapKb !== wrapKb) {
      await this.errorHandler(
        new Error('Sanity check failed. wrapKb should not drift!')
      );
      return {} as any;
    }

    return {
      authPWVersion2: newCredentialsV2.authPW,
      wrapKbVersion2: newKeys.wrapKbVersion2,
      clientSalt: clientSalt,
      unwrapBKeyVersion2: newCredentialsV2.unwrapBKey,
    };
  }

  /**
   * Change password using JWT authentication (for MFA-protected operations).
   * This uses the new /mfa/password/change endpoint that requires JWT authentication.
   *
   * @param jwt - The JWT token for authentication.
   * @param email - The email of the user.
   * @param oldPassword - The old password of the user.
   * @param newPassword - The new password of the user.
   * @param sessionToken - The session token of the user.
   * @param options - The options for the password change.
   * @param headers - The headers for the request.
   */
  async passwordChangeWithJWT(
    jwt: string,
    email: string,
    oldPassword: string,
    newPassword: string,
    sessionToken: string,
    options: {
      keys?: boolean;
      skipCaseError?: boolean;
      reauthEmail?: string;
    } = {},
    headers?: Headers
  ): Promise<SignedInAccountData> {
    const oldCredentials = await this.sessionReauth(
      sessionToken,
      options.reauthEmail || email,
      oldPassword,
      {
        keys: true,
      },
      headers
    );
    const oldCredentialsAuth = await crypto.getCredentials(email, oldPassword);
    const oldAuthPW = oldCredentialsAuth.authPW;

    const keys = await this.accountKeys(
      oldCredentials.keyFetchToken!,
      oldCredentials.unwrapBKey!,
      headers
    );

    const newCredentials = await crypto.getCredentials(email, newPassword);

    const wrapKb = crypto.unwrapKB(keys.kB, newCredentials.unwrapBKey);
    const authPW = newCredentials.authPW;

    let payload: {
      email: string;
      oldAuthPW: string;
      authPW: string;
      wrapKb: string;
      authPWVersion2?: string;
      wrapKbVersion2?: string;
      clientSalt?: string;
    } = {
      email,
      oldAuthPW,
      authPW,
      wrapKb,
    };

    if (this.keyStretchVersion === 2) {
      const v2Payload = await this.createPasswordChangeV2Payload(
        email,
        newPassword,
        keys,
        newCredentials,
        wrapKb,
        headers
      );
      payload = {
        ...payload,
        authPWVersion2: v2Payload.authPWVersion2,
        wrapKbVersion2: v2Payload.wrapKbVersion2,
        clientSalt: v2Payload.clientSalt,
      };
    }

    try {
      const accountData = await this.jwtPost(
        '/mfa/password/change',
        jwt,
        payload,
        headers
      );

      return accountData;
    } catch (error: any) {
      if (
        error &&
        error.email &&
        error.errno === ERRORS.INCORRECT_EMAIL_CASE &&
        !options.skipCaseError
      ) {
        options.skipCaseError = true;
        options.reauthEmail = email;
        return await this.passwordChangeWithJWT(
          jwt,
          error.email,
          oldPassword,
          newPassword,
          sessionToken,
          options,
          headers
        );
      } else {
        throw error;
      }
    }
  }

  async createPassword(
    sessionToken: string,
    email: string,
    newPassword: string,
    headers?: Headers
  ): Promise<{ passwordCreated: number; authPW: string; unwrapBKey: string }> {
    const { authPW, unwrapBKey } = await crypto.getCredentials(
      email,
      newPassword
    );

    const payload = {
      authPW,
    };

    const passwordCreated = await this.sessionPost(
      '/password/create',
      sessionToken,
      payload,
      headers
    );

    return {
      passwordCreated,
      authPW,
      unwrapBKey,
    };
  }

  async getRandomBytes(headers?: Headers) {
    return this.request('POST', '/get_random_bytes', null, headers);
  }

  async deviceRegister(
    sessionToken: hexstring,
    name: string,
    type: string,
    options: {
      deviceCallback?: string;
      devicePublicKey?: string;
      deviceAuthKey?: string;
    } = {},
    headers?: Headers
  ) {
    const payload = {
      name,
      type,
      ...options,
    };
    return this.sessionPost('/account/device', sessionToken, payload, headers);
  }

  async deviceUpdate(
    sessionToken: hexstring,
    id: string,
    name: string,
    options: {
      deviceCallback?: string;
      devicePublicKey?: string;
      deviceAuthKey?: string;
    } = {},
    headers?: Headers
  ) {
    const payload = {
      id,
      name,
      ...options,
    };
    return this.sessionPost('/account/device', sessionToken, payload, headers);
  }

  async deviceDestroy(sessionToken: hexstring, id: string, headers?: Headers) {
    return this.sessionPost(
      '/account/device/destroy',
      sessionToken,
      { id },
      headers
    );
  }

  async mfaRequestOtp(
    sessionToken: hexstring,
    action: string,
    headers?: Headers
  ): Promise<{ status: string }> {
    return this.sessionPost(
      '/mfa/otp/request',
      sessionToken,
      {
        action,
      },
      headers
    );
  }

  async mfaOtpVerify(
    sessionToken: hexstring,
    code: string,
    action: string,
    headers?: Headers
  ): Promise<{ accessToken: string }> {
    return this.sessionPost(
      '/mfa/otp/verify',
      sessionToken,
      {
        code,
        action,
      },
      headers
    );
  }

  async mfaTestGet(
    jwt: string,
    headers?: Headers
  ): Promise<{ status: string }> {
    return this.jwtGet('/mfa/test', jwt, headers);
  }

  async mfaTestPost(
    jwt: string,
    payload: { message: string },
    headers?: Headers
  ) {
    return this.jwtPost('/mfa/test', jwt, payload, headers);
  }

  async mfaTestPost2(jwt: string, headers?: Headers) {
    return this.jwtPost('/mfa/test2', jwt, {}, headers);
  }

  async deviceList(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/account/devices', sessionToken, headers);
  }

  async sessions(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/account/sessions', sessionToken, headers);
  }

  async securityEvents(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/securityEvents', sessionToken, headers);
  }

  async attachedClients(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/account/attached_clients', sessionToken, headers);
  }

  async attachedClientDestroy(
    sessionToken: hexstring,
    clientInfo: any,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/account/attached_client/destroy',
      sessionToken,
      {
        clientId: clientInfo.clientId,
        deviceId: clientInfo.deviceId,
        refreshTokenId: clientInfo.refreshTokenId,
        sessionTokenId: clientInfo.sessionTokenId,
      },
      headers
    );
  }

  async sendUnblockCode(
    email: string,
    options: {
      metricsContext?: MetricsContext;
    } = {},
    headers?: Headers
  ) {
    return this.request(
      'POST',
      '/account/login/send_unblock_code',
      {
        email,
        ...options,
      },
      headers
    );
  }

  async rejectUnblockCode(
    uid: hexstring,
    unblockCode: string,
    headers?: Headers
  ) {
    return this.request(
      'POST',
      '/account/login/reject_unblock_code',
      {
        uid,
        unblockCode,
      },
      headers
    );
  }

  async consumeSigninCode(
    code: string,
    flowId: string,
    flowBeginTime: number,
    deviceId: string | undefined,
    headers?: Headers
  ) {
    return this.request(
      'POST',
      '/signinCodes/consume',
      {
        code,
        metricsContext: {
          deviceId,
          flowId,
          flowBeginTime,
        },
      },
      headers
    );
  }

  async createSigninCode(sessionToken: hexstring, headers?: Headers) {
    return this.sessionPost('/signinCodes', sessionToken, {}, headers);
  }

  async createCadReminder(sessionToken: hexstring, headers?: Headers) {
    return this.sessionPost('/emails/reminders/cad', sessionToken, {}, headers);
  }

  async recoveryEmails(sessionToken: hexstring, headers?: Headers) {
    return this.sessionGet('/recovery_emails', sessionToken, headers);
  }

  /**
   * Creates a new recovery email for the account.
   * @param jwt Required scope 'mfa:email'
   * @param email Recovery email to add to account
   * @param headers
   * @returns Response
   */
  async recoveryEmailCreate(jwt: string, email: string, headers?: Headers) {
    return this.jwtPost('/mfa/recovery_email', jwt, { email }, headers);
  }

  async recoveryEmailDestroy(
    sessionToken: hexstring,
    email: string,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/recovery_email/destroy',
      sessionToken,
      { email },
      headers
    );
  }

  async recoveryEmailDestroyWithJwt(
    jwt: string,
    email: string,
    headers?: Headers
  ) {
    return this.jwtPost('/mfa/recovery_email/destroy', jwt, { email }, headers);
  }

  /**
   * @deprecated Use recoveryEmailSetPrimaryEmailWithJwt instead
   */
  async recoveryEmailSetPrimaryEmail(
    sessionToken: hexstring,
    email: string,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/recovery_email/set_primary',
      sessionToken,
      { email },
      headers
    );
  }

  /**
   * Sets a secondary email as the primary email for the account.
   * @param jwt Required scope 'mfa:email'
   * @param email a secondary email to set as primary
   * @param headers
   * @returns Response
   */
  async recoveryEmailSetPrimaryEmailWithJwt(
    jwt: string,
    email: string,
    headers?: Headers
  ) {
    return this.jwtPost(
      '/mfa/recovery_email/set_primary',
      jwt,
      { email },
      headers
    );
  }

  /**
   * Verifies a recovery email by confirming the code sent to that email address.
   * @param jwt Required scope 'mfa:email'
   * @param email Recovery email verify
   * @param code Verification code sent to recovery email
   * @param headers
   * @returns Response
   */
  async recoveryEmailSecondaryVerifyCode(
    jwt: string,
    email: string,
    code: string,
    headers?: Headers
  ): Promise<{}> {
    return this.jwtPost(
      '/mfa/recovery_email/secondary/verify_code',
      jwt,
      { email, code },
      headers
    );
  }

  async recoveryEmailSecondaryResendCode(
    sessionToken: hexstring,
    email: string,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/recovery_email/secondary/resend_code',
      sessionToken,
      { email },
      headers
    );
  }

  /**
   * Resend secondary email verification code using MFA JWT (email scope).
   * This route supports resending when the email is reserved in Redis but
   * not yet persisted in the DB.
   *
   * @param jwt MFA JWT with scope 'mfa:email'
   * @param email Secondary email address to resend code to
   * @param headers Optional extra headers
   */
  async recoveryEmailSecondaryResendCodeWithJwt(
    jwt: string,
    email: string,
    headers?: Headers
  ) {
    return this.jwtPost(
      '/mfa/recovery_email/secondary/resend_code',
      jwt,
      { email },
      headers
    );
  }

  /**
   * @deprecated Use createTotpTokenWithJwt instead
   *
   * Create a TOTP secret for the account (session-token variant).
   *
   * Requires a verified session token. Returns the QR code URL and shared
   * secret used to enroll an authenticator app, and optionally a set of
   * recovery codes.
   *
   * Note: Maintained for legacy/inline setup flows. For new integrations,
   * prefer the MFA JWT variant.
   *
   * @param sessionToken - Verified session token for the signed-in user
   * @param options - Optional request options
   * @param options.metricsContext - Optional metrics context for telemetry
   * @param headers - Optional additional request headers
   * @returns Promise resolving to `{ qrCodeUrl, secret }`
   */
  async createTotpToken(
    sessionToken: hexstring,
    options: {
      metricsContext?: MetricsContext;
    },
    headers?: Headers
  ): Promise<{
    qrCodeUrl: string;
    secret: string;
  }> {
    return this.sessionPost('/totp/create', sessionToken, options, headers);
  }

  /**
   * Create a new TOTP secret (JWT variant).
   *
   * Requires an MFA JWT with scope `mfa:2fa`. Returns the QR code URL,
   * the shared secret, and optionally recovery codes when requested.
   *
   * @param jwt MFA access token including `mfa:2fa` scope
   * @param options Optional request options
   * @param options.metricsContext Optional metrics context for telemetry
   * @param headers Optional extra headers
   * @returns Promise resolving to `{ qrCodeUrl, secret }`
   */
  async createTotpTokenWithJwt(
    jwt: string,
    options: {
      metricsContext?: MetricsContext;
    } = {},
    headers?: Headers
  ): Promise<{
    qrCodeUrl: string;
    secret: string;
  }> {
    return this.jwtPost('/mfa/totp/create', jwt, options, headers);
  }

  /**
   * @deprecated Use verifyTotpSetupCodeWithJwt instead
   * Verify the authenticator code for the in-progress TOTP setup.
   *
   * Validates a 6-digit code generated by the app using the secret returned by
   * `createTotpToken`. This does not finalize setup; call `completeTotpSetup`
   * to activate TOTP.
   *
   * Note: Maintained for legacy/inline setup flows. For new integrations,
   * prefer the MFA JWT variant.
   *
   * @param sessionToken - Verified session token for the signed-in user
   * @param code - 6-digit code from the authenticator app
   * @param options - Optional request options
   * @param options.metricsContext - Optional metrics context for telemetry
   * @param headers - Optional additional request headers
   * @returns Promise resolving to `{ success: boolean }`
   */
  async verifyTotpSetupCode(
    sessionToken: hexstring,
    code: string,
    options: { metricsContext?: MetricsContext } = {},
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.sessionPost(
      '/totp/setup/verify',
      sessionToken,
      { code, ...options },
      headers
    );
  }

  /**
   * Verify a TOTP setup code against the in-progress secret (JWT variant).
   *
   * Requires an MFA JWT with scope `mfa:2fa`. On success, marks the setup
   * as verified in Redis and refreshes TTLs.
   *
   * @param jwt MFA access token including `mfa:2fa` scope
   * @param code The 6-digit authenticator app code
   * @param options Optional request options
   * @param options.metricsContext Optional metrics context for telemetry
   * @param headers Optional extra headers
   * @returns Promise resolving to `{ success: boolean }`
   */
  async verifyTotpSetupCodeWithJwt(
    jwt: string,
    code: string,
    options: { metricsContext?: MetricsContext } = {},
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.jwtPost(
      '/mfa/totp/setup/verify',
      jwt,
      { code, ...options },
      headers
    );
  }

  /**
   * @deprecated Use completeTotpSetupWithJwt instead
   * Finalize TOTP setup for the account.
   *
   * Marks the verified in-progress secret as the active second factor.
   *
   * Note: Maintained for legacy/inline setup flows. For new integrations,
   * prefer the MFA JWT variant.
   *
   * @param sessionToken - Verified session token for the signed-in user
   * @param options - Optional request options
   * @param options.service - Optional service name
   * @param options.metricsContext - Optional metrics context for telemetry
   * @param headers - Optional additional request headers
   * @returns Promise resolving to `{ success: boolean }`
   */
  async completeTotpSetup(
    sessionToken: hexstring,
    options: { service?: string; metricsContext?: MetricsContext } = {},
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.sessionPost(
      '/totp/setup/complete',
      sessionToken,
      { ...options },
      headers
    );
  }

  /**
   * Complete TOTP setup after successful code verification (JWT variant).
   *
   * Requires an MFA JWT with scope `mfa:2fa`. Validates the verification
   * flag for the current secret and persists the enabled, verified token.
   *
   * @param jwt MFA access token including `mfa:2fa` scope
   * @param options Optional request options
   * @param options.metricsContext Optional metrics context for telemetry
   * @param headers Optional extra headers
   * @returns Promise resolving to `{ success: boolean }`
   */
  async completeTotpSetupWithJwt(
    jwt: string,
    options: { metricsContext?: MetricsContext } = {},
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.jwtPost(
      '/mfa/totp/setup/complete',
      jwt,
      { ...options },
      headers
    );
  }

  /**
   * @deprecated Use startReplaceTotpTokenWithJwt instead
   * Initiates the TOTP replacement flow using a session token
   * and returns data to complete the replace flow (QR code URL and shared secret).
   *
   * @param sessionToken - required, must be a verified session token
   * @param options - Optional request options such as metrics context
   * @param headers - Optional additional headers for the request
   * @returns A promise resolving to the QR code URL and secret
   */
  async startReplaceTotpToken(
    sessionToken: hexstring,
    options: {
      metricsContext?: MetricsContext;
    },
    headers?: Headers
  ): Promise<{
    qrCodeUrl: string;
    secret: string;
  }> {
    return this.sessionPost(
      '/totp/replace/start',
      sessionToken,
      options,
      headers
    );
  }

  /**
   * Initiates the TOTP replacement flow using an MFA JWT.
   * Requires a JWT with scope `mfa:2fa` and returns data to
   * complete the replace flow (QR code URL and shared secret).
   *
   * @param jwt - MFA access token (must include the `mfa:2fa` scope)
   * @param options - Optional request options such as metrics context
   * @param headers - Optional additional headers for the request
   * @returns A promise resolving to the QR code URL and secret
   */
  async startReplaceTotpTokenWithJwt(
    jwt: string,
    options: {
      metricsContext?: MetricsContext;
    } = {},
    headers?: Headers
  ): Promise<{
    qrCodeUrl: string;
    secret: string;
  }> {
    return this.jwtPost('/mfa/totp/replace/start', jwt, options, headers);
  }

  /**
   * @deprecated Use confirmReplaceTotpTokenWithJwt instead
   * Confirms TOTP replacement by verifying the code for the in-progress secret.
   * Requires a verified session token.
   *
   * @param sessionToken - required, must be a verified session token
   * @param code - 6-digit authenticator app code to validate the new secret
   * @param headers - Optional additional headers for the request
   * @returns A promise that resolves when the replacement has been accepted
   */
  async confirmReplaceTotpToken(
    sessionToken: hexstring,
    code: string,
    headers?: Headers
  ): Promise<void> {
    return this.sessionPost(
      '/totp/replace/confirm',
      sessionToken,
      { code },
      headers
    );
  }

  /**
   * Confirms TOTP replacement by verifying the code for the in-progress secret.
   * Requires a valid MFA JWT scoped to the action (e.g. `mfa:2fa`).
   *
   * @param jwt - MFA access token (must include the `mfa:2fa` scope)
   * @param code - 6-digit authenticator app code to validate the new secret
   * @param headers - Optional additional headers for the request
   * @returns A promise that resolves when the replacement has been accepted
   */
  async confirmReplaceTotpTokenWithJwt(
    jwt: string,
    code: string,
    headers?: Headers
  ): Promise<void> {
    return this.jwtPost('/mfa/totp/replace/confirm', jwt, { code }, headers);
  }

  /**
   * @deprecated Use deleteTotpTokenWithJwt instead
   *
   * Disables 2FA Protection on the account.
   *
   * @param sessionToken - required, must be a verified session token
   * @param headers - Optional additional headers for the request
   * @returns A promise that resolves when the 2FA has been removed
   */
  async deleteTotpToken(sessionToken: hexstring, headers?: Headers) {
    return this.sessionPost('/totp/destroy', sessionToken, {}, headers);
  }

  /**
   * Disables 2FA Protection on the account.
   *
   * @param jwt - required, must be a verified session token
   * @param headers - Optional additional headers for the request
   * @returns A promise that resolves when the 2FA has been removed
   */
  async deleteTotpTokenWithJwt(jwt: string, headers?: Headers) {
    return this.jwtPost('/mfa/totp/destroy', jwt, {}, headers);
  }

  async checkTotpTokenExists(
    sessionToken: hexstring,
    headers?: Headers
  ): Promise<{ exists: boolean; verified: boolean }> {
    return this.sessionGet('/totp/exists', sessionToken, headers);
  }

  async checkTotpTokenExistsWithPasswordForgotToken(
    token: hexstring,
    headers?: Headers
  ): Promise<{ exists: boolean; verified: boolean }> {
    return this.hawkRequest(
      'GET',
      '/totp/exists',
      token,
      tokenType.passwordForgotToken,
      null,
      headers
    );
  }

  async checkTotpTokenCodeWithPasswordForgotToken(
    token: hexstring,
    code: string,
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.hawkRequest(
      'POST',
      '/totp/verify',
      token,
      tokenType.passwordForgotToken,
      { code },
      headers
    );
  }

  async consumeRecoveryCodeWithPasswordForgotToken(
    token: hexstring,
    code: string,
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.hawkRequest(
      'POST',
      '/totp/verify/recoveryCode',
      token,
      tokenType.passwordForgotToken,
      { code },
      headers
    );
  }

  async sendLoginPushRequest(
    sessionToken: hexstring,
    headers?: Headers
  ): Promise<void> {
    return this.sessionPost(
      '/session/verify/send_push',
      sessionToken,
      {},
      headers
    );
  }

  async verifyLoginPushRequest(
    sessionToken: hexstring,
    tokenVerificationId: string,
    code: string,
    headers?: Headers
  ): Promise<void> {
    return this.sessionPost(
      '/session/verify/verify_push',
      sessionToken,
      {
        tokenVerificationId,
        code,
      },
      headers
    );
  }

  async verifyTotpCode(
    sessionToken: hexstring,
    code: string,
    options: {
      service?: string;
      metricsContext?: MetricsContext;
    } = {},
    headers?: Headers
  ) {
    return this.sessionPost(
      '/session/verify/totp',
      sessionToken,
      {
        code,
        ...options,
      },
      headers
    );
  }

  /**
   * @deprecated Prefer setRecoveryCodesWithJwt where possible
   * Set recovery codes for initial 2FA setup
   * @param sessionToken session token
   * @param recoveryCodes new codes
   * @param headers optional headers
   * @returns
   */
  async setRecoveryCodes(
    sessionToken: hexstring,
    recoveryCodes: string[],
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.sessionPost(
      '/recoveryCodes',
      sessionToken,
      { recoveryCodes },
      headers
    );
  }

  /**
   * Set recovery codes for initial 2FA setup
   * @param jwt auth token
   * @param recoveryCodes new codes
   * @param headers optional headers
   * @returns
   */
  async setRecoveryCodesWithJwt(
    jwt: string,
    recoveryCodes: string[],
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.jwtPost('/mfa/recoveryCodes', jwt, { recoveryCodes }, headers);
  }

  // create and update recovery codes without code confirmation
  async replaceRecoveryCodes(
    sessionToken: hexstring,
    headers?: Headers
  ): Promise<{ recoveryCodes: string[] }> {
    return this.sessionGet('/recoveryCodes', sessionToken, headers);
  }

  /**
   * @deprecated Use updateRecoveryCodesWithJwt instead!
   */
  async updateRecoveryCodes(
    sessionToken: hexstring,
    recoveryCodes: string[],
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.sessionPut(
      '/recoveryCodes',
      sessionToken,
      { recoveryCodes },
      headers
    );
  }

  /**
   * Update recovery codes with codes created and confirmed client-side
   * @param jwt auth token
   * @param recoveryCodes new codes
   * @param headers optional headers
   * @returns
   */
  async updateRecoveryCodesWithJwt(
    jwt: hexstring,
    recoveryCodes: string[],
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.jwtPut('/mfa/recoveryCodes', jwt, { recoveryCodes }, headers);
  }

  async getRecoveryCodesExist(
    sessionToken: hexstring,
    headers?: Headers
  ): Promise<{ hasBackupCodes?: boolean; count?: number }> {
    return this.sessionGet('/recoveryCodes/exists', sessionToken, headers);
  }

  async getRecoveryCodesExistWithPasswordForgotToken(
    passwordForgotToken: hexstring,
    headers?: Headers
  ): Promise<{ hasBackupCodes?: boolean; count?: number }> {
    return this.hawkRequest(
      'GET',
      '/recoveryCodes/exists',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      null,
      headers
    );
  }

  async consumeRecoveryCode(
    sessionToken: hexstring,
    code: string,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/session/verify/recoveryCode',
      sessionToken,
      {
        code,
      },
      headers
    );
  }

  /**
   * Creates an account recovery key that can be used to restore account data in the password is lost.
   * @param sessionToken
   * @param recoveryKeyId
   * @param recoveryData
   * @param enabled
   * @param replaceKey
   * @param headers
   * @returns
   */
  async createRecoveryKey(
    sessionToken: hexstring,
    recoveryKeyId: string,
    recoveryData: any,
    enabled: boolean = true,
    replaceKey: boolean = false,
    headers?: Headers
  ): Promise<{}> {
    return this.sessionPost(
      '/recoveryKey',
      sessionToken,
      {
        recoveryKeyId,
        recoveryData,
        enabled,
        replaceKey,
      },
      headers
    );
  }

  /**
   * Creates an account recovery key that can be used to restore account data in the password is lost.
   * @param sessionToken
   * @param recoveryKeyId
   * @param recoveryData
   * @param enabled
   * @param replaceKey
   * @param headers
   * @returns
   */
  async createRecoveryKeyWithJwt(
    jwt: string,
    recoveryKeyId: string,
    recoveryData: any,
    enabled: boolean = true,
    replaceKey: boolean = false,
    headers?: Headers
  ): Promise<{}> {
    return this.jwtPost(
      '/mfa/recoveryKey',
      jwt,
      {
        recoveryKeyId,
        recoveryData,
        enabled,
        replaceKey,
      },
      headers
    );
  }

  async getRecoveryKey(
    accountResetToken: hexstring,
    recoveryKeyId: string,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'GET',
      `/recoveryKey/${recoveryKeyId}`,
      accountResetToken,
      tokenType.accountResetToken,
      null,
      headers
    );
  }

  async updateRecoveryKeyHint(
    sessionToken: hexstring,
    hint: string,
    headers?: Headers
  ): Promise<{}> {
    return this.sessionPost(
      '/recoveryKey/hint',
      sessionToken,
      {
        hint,
      },
      headers
    );
  }

  async resetPasswordWithRecoveryKey(
    accountResetToken: hexstring,
    email: string,
    newPassword: string,
    recoveryKeyId: string,
    keys: {
      kB: string;
    },
    options: {
      keys?: boolean;
      sessionToken?: boolean;
      isFirefoxMobileClient?: boolean;
    } = {},
    headers?: Headers
  ) {
    const credentials = await this.getCredentialSet(
      {
        email,
        password: newPassword,
      },
      headers
    );
    const newWrapKb = crypto.unwrapKB(keys.kB, credentials.v1.unwrapBKey);

    // We have scenario where a user with v1 credentials is trying to do a reset. Go ahead
    // and give them v2 credentials.
    if (!credentials.v2) {
      const clientSalt = createSaltV2();
      credentials.v2 = await crypto.getCredentialsV2({
        password: newPassword,
        clientSalt,
      });
    }

    let v2Payload = await this.getPayloadV2({
      ...keys,
      ...credentials,
    });
    const payload = {
      ...v2Payload,
      wrapKb: newWrapKb,
      authPW: credentials.v1.authPW,
      sessionToken: options.sessionToken,
      recoveryKeyId,
      isFirefoxMobileClient: options.isFirefoxMobileClient,
    };
    const accountData = await this.hawkRequest(
      'POST',
      pathWithKeys('/account/reset', options.keys),
      accountResetToken,
      tokenType.accountResetToken,
      payload,
      headers
    );
    if (options.keys && accountData.keyFetchToken) {
      accountData.unwrapBKey = credentials.v1.unwrapBKey;
      accountData.unwrapBKeyVersion2 = credentials.v2?.unwrapBKey;
    }
    return accountData;
  }

  /**
   * @deprecated Use deleteRecoveryKeyWithJwt instead
   */
  async deleteRecoveryKey(sessionToken: hexstring, headers?: Headers) {
    return this.hawkRequest(
      'DELETE',
      '/recoveryKey',
      sessionToken,
      tokenType.sessionToken,
      {},
      headers
    );
  }

  /**
   * Removes the recovery key from the account
   * @param jwt The MFA jwt for auth
   * @param headers
   * @returns
   */
  async deleteRecoveryKeyWithJwt(jwt: string, headers?: Headers) {
    return this.jwtDelete('/mfa/recoveryKey', jwt, {}, headers);
  }

  async recoveryKeyExists(
    sessionToken: hexstring | undefined,
    email: string | undefined,
    headers?: Headers
  ) {
    if (sessionToken) {
      return this.sessionPost(
        '/recoveryKey/exists',
        sessionToken,
        { email },
        headers
      );
    }
    return this.request('POST', '/recoveryKey/exists', { email }, headers);
  }

  async verifyRecoveryKey(
    sessionToken: hexstring,
    recoveryKeyId: string,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/recoveryKey/verify',
      sessionToken,
      {
        recoveryKeyId,
      },
      headers
    );
  }

  async createOAuthCode(
    sessionToken: hexstring,
    clientId: string,
    state: string,
    options: {
      access_type?: string;
      acr_values?: string;
      keys_jwe?: string;
      redirect_uri?: string;
      response_type?: string;
      scope?: string;
      code_challenge_method?: string;
      code_challenge?: string;
    } = {},
    headers?: Headers
  ) {
    return this.sessionPost(
      '/oauth/authorization',
      sessionToken,
      {
        access_type: options.access_type,
        acr_values: options.acr_values,
        client_id: clientId,
        code_challenge: options.code_challenge,
        code_challenge_method: options.code_challenge_method,
        keys_jwe: options.keys_jwe,
        redirect_uri: options.redirect_uri,
        response_type: options.response_type,
        scope: options.scope,
        state,
      },
      headers
    );
  }

  async createOAuthToken(
    sessionToken: hexstring,
    clientId: string,
    options: {
      access_type?: string;
      scope?: string;
      ttl?: number;
    } = {},
    headers?: Headers
  ) {
    return this.sessionPost(
      '/oauth/token',
      sessionToken,
      {
        grant_type: 'fxa-credentials',
        access_type: options.access_type,
        client_id: clientId,
        scope: options.scope,
        ttl: options.ttl,
      },
      headers
    );
  }

  async getOAuthScopedKeyData(
    sessionToken: hexstring,
    clientId: string,
    scope: string,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/account/scoped-key-data',
      sessionToken,
      {
        client_id: clientId,
        scope,
      },
      headers
    );
  }

  async getSubscriptionPlans(headers?: Headers) {
    return this.request('GET', '/oauth/subscriptions/plans', null, headers);
  }

  async getActiveSubscriptions(accessToken: string) {
    return this.request(
      'GET',
      '/oauth/subscriptions/active',
      null,
      new Headers({
        authorization: `Bearer ${accessToken}`,
      })
    );
  }

  async createSupportTicket(
    accessToken: string,
    supportTicket: {
      topic: string;
      subject?: string;
      message: string;
    }
  ) {
    return this.request(
      'POST',
      '/support/ticket',
      supportTicket,
      new Headers({
        authorization: `Bearer ${accessToken}`,
      })
    );
  }

  async updateNewsletters(
    sessionToken: hexstring,
    newsletters: string[],
    headers?: Headers
  ) {
    return this.sessionPost(
      '/newsletters',
      sessionToken,
      {
        newsletters,
      },
      headers
    );
  }

  async verifyIdToken(
    idToken: string,
    clientId: string,
    expiryGracePeriod: number | undefined,
    headers?: Headers
  ) {
    const payload: any = {
      id_token: idToken,
      client_id: clientId,
    };
    if (expiryGracePeriod) {
      payload.expiry_grace_period = expiryGracePeriod;
    }
    return this.request('POST', '/oauth/id-token-verify', payload, headers);
  }

  async getProductInfo(productId: string, headers?: Headers) {
    return this.request(
      'GET',
      `/oauth/subscriptions/productname?productId=${productId}`,
      null,
      headers
    );
  }

  async sendPushLoginRequest(sessionToken: string, headers?: Headers) {
    return this.sessionPost(
      '/session/verify/send_push',
      sessionToken,
      {},
      headers
    );
  }

  /**
   * Tries to register a recovery phone number. Important, this must be used for inline_recovery flow!
   *
   * @param sessionToken The user's current session token
   * @param phoneNumber The phone number to register. Should be E.164 format
   * @param headers
   */
  async recoveryPhoneCreate(
    sessionToken: string,
    phoneNumber: string,
    headers?: Headers
  ): Promise<{ nationalFormat?: string; success: boolean }> {
    return this.sessionPost(
      '/recovery_phone/create',
      sessionToken,
      { phoneNumber },
      headers
    );
  }

  /**
   * Tries to register a recovery phone number
   *
   * @param jwt The users MFA jwt
   * @param phoneNumber The phone number to register. Should be E.164 format
   * @param headers
   */
  async recoveryPhoneCreateWithJwt(
    jwt: string,
    phoneNumber: string,
    headers?: Headers
  ): Promise<{ nationalFormat?: string; success: boolean }> {
    return this.jwtPost(
      '/mfa/recovery_phone/create',
      jwt,
      { phoneNumber },
      headers
    );
  }

  /**
   * Checks to see if a recovery phone is available in the user's region.
   * @param sessionToken The user's current session token
   * @param headers
   */
  async recoveryPhoneAvailable(sessionToken: string, headers?: Headers) {
    return this.sessionPost(
      '/recovery_phone/available',
      sessionToken,
      {},
      headers
    );
  }

  /**
   * @deprecated Prefer recoveryPhoneConfirmSetupWithJwt where possible
   * Confirms the code sent to the recovery phone when recoveryPhoneCreate was called.
   *
   * @param sessionToken The user's current session token
   * @param code The otp code sent to the user's phone
   * @param headers
   */
  async recoveryPhoneConfirmSetup(
    sessionToken: string,
    code: string,
    headers?: Headers
  ): Promise<{ nationalFormat?: string }> {
    return this.sessionPost(
      '/recovery_phone/confirm',
      sessionToken,
      {
        code,
      },
      headers
    );
  }

  /**
   * Confirms the code sent to the recovery phone when recoveryPhoneCreate was called.
   * @param jwt auth token
   * @param code the otp code sent to the user's phone
   * @param headers optional headers
   * @returns
   */
  async recoveryPhoneConfirmSetupWithJwt(
    jwt: string,
    code: string,
    headers?: Headers
  ): Promise<{ success: boolean }> {
    return this.jwtPost('/mfa/recovery_phone/confirm', jwt, { code }, headers);
  }

  /**
   * @deprecated Prefer recoveryPhoneChangeWithJwt where possible
   * Confirms the code sent to the new recovery phone and replaces the phone.
   *
   * @param sessionToken The user's current session token
   * @param code The otp code sent to the user's phone
   * @param headers
   */
  async recoveryPhoneChange(
    sessionToken: string,
    code: string,
    headers?: Headers
  ): Promise<{ nationalFormat?: string }> {
    return this.sessionPost(
      '/recovery_phone/change',
      sessionToken,
      {
        code,
      },
      headers
    );
  }

  /**
   * Confirms the code sent to the new recovery phone and replaces the phone.
   *
   * @param jwt auth token
   * @param code The otp code sent to the user's phone
   * @param headers optional headers
   * @returns
   */
  async recoveryPhoneChangeWithJwt(
    jwt: string,
    code: string,
    headers?: Headers
  ): Promise<{ nationalFormat?: string }> {
    return this.jwtPost('/mfa/recovery_phone/change', jwt, { code }, headers);
  }

  /**
   * Sends a code to the users phone during a signin flow.
   *
   * @param sessionToken The user's current session token
   * @param headers
   */
  async recoveryPhoneSigninSendCode(sessionToken: string, headers?: Headers) {
    return this.sessionPost(
      '/recovery_phone/signin/send_code',
      sessionToken,
      {},
      headers
    );
  }

  /**
   * Confirms the code sent to the recovery phone during a sign in flow.
   *
   * @param sessionToken The user's current session token
   * @param code The otp code sent to the user's phone
   * @param headers
   */
  async recoveryPhoneSigninConfirm(
    sessionToken: string,
    code: string,
    headers?: Headers
  ) {
    return this.sessionPost(
      '/recovery_phone/signin/confirm',
      sessionToken,
      {
        code,
      },
      headers
    );
  }

  /**
   * Sends a code to the users phone during password reset.
   *
   * @param passwordForgotToken
   * @param headers
   */
  async recoveryPhonePasswordResetSendCode(
    passwordForgotToken: string,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'POST',
      '/recovery_phone/reset_password/send_code',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      {},
      headers
    );
  }

  /**
   * Confirms the code sent to the recovery phone during a password reset.
   *
   *
   * @param passwordForgotToken
   * @param code The otp code sent to the user's phone
   * @param headers
   */
  async recoveryPhoneResetPasswordConfirm(
    passwordForgotToken: string,
    code: string,
    headers?: Headers
  ) {
    return this.hawkRequest(
      'POST',
      '/recovery_phone/reset_password/confirm',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      {
        code,
      },
      headers
    );
  }

  /**
   * @deprecated Use recoveryPhoneDeleteWithJwt instead
   *
   * @param sessionToken The user's current session token
   * @param headers
   */
  async recoveryPhoneDelete(sessionToken: string, headers?: Headers) {
    return this.sessionDelete('/recovery_phone', sessionToken, {}, headers);
  }

  /**
   * Disables 2FA Protection on the account.
   *
   * @param jwt - required, must be a verified session token
   * @param headers - Optional additional headers for the request
   * @returns A promise that resolves when the 2FA has been removed
   */
  async recoveryPhoneDeleteWithJwt(jwt: string, headers?: Headers) {
    return this.jwtDelete('/mfa/recovery_phone', jwt, {}, headers);
  }

  /**
   * Gets status of the recovery phone on the users account.
   * @param sessionToken The user's current session token
   * @param headers
   * @returns { exists:boolean, phoneNumber: string }
   */
  async recoveryPhoneGet(sessionToken: string, headers?: Headers) {
    return this.sessionGet('/recovery_phone', sessionToken, headers);
  }

  async recoveryPhoneGetWithPasswordForgotToken(
    passwordForgotToken: string,
    headers?: Headers
  ): Promise<{
    exists: boolean;
    phoneNumber?: string;
    nationalFormat?: string;
  }> {
    return this.hawkRequest(
      'GET',
      '/recovery_phone',
      passwordForgotToken,
      tokenType.passwordForgotToken,
      null,
      headers
    );
  }

  /**
   * Checks if a feature is available based on user location.
   * @param sessionToken The user's current session token
   * @param feature The feature that we are checking
   * @param headers
   * @returns { eligible:boolean }
   */
  async geoEligibilityCheck(
    sessionToken: string,
    feature: string,
    headers?: Headers
  ): Promise<{ eligible: boolean }> {
    return this.sessionGet(
      `/geo/eligibility/${feature}`,
      sessionToken,
      headers
    );
  }

  /**
   * Fetches the CMS configuration for a specific client and entrypoint.
   *
   * @param clientId
   * @param entrypoint
   */
  async getCmsConfig(clientId: string, entrypoint: string) {
    return this.request(
      'GET',
      `/cms/config?clientId=${clientId}&entrypoint=${entrypoint}`,
      null,
      undefined
    );
  }

  protected async getPayloadV2({
    kB,
    v1,
    v2,
  }: {
    kB?: string;
    v1: {
      authPW: string;
      unwrapBKey: string;
    };
    v2?: {
      clientSalt: string;
      authPW: string;
      unwrapBKey: string;
    };
  }) {
    if (this.keyStretchVersion === 2) {
      if (!v2) {
        await this.errorHandler(
          new Error('Using key stretch version 2 requires v2 credentials.')
        );
        return {};
      }

      // By passing in kB, we ensure wrapKbVersion2 will produce the same value
      const { wrapKb, wrapKbVersion2 } = await crypto.getKeysV2({ kB, v1, v2 });

      // Normalize response for rest call
      return {
        wrapKb,
        wrapKbVersion2,
        authPWVersion2: v2.authPW,
        clientSalt: v2.clientSalt,
      };
    }
    return {};
  }

  protected async getCredentialSet(
    {
      email,
      password,
    }: {
      email: string;
      password: string;
    },
    headers?: Headers
  ): Promise<CredentialSet> {
    const credentialsV1 = await crypto.getCredentials(email, password);

    if (this.keyStretchVersion === 2) {
      // Try to determine V2 credentials
      const status = await this.getCredentialStatusV2(email, headers);

      // Signal an upgrade is required. Status doesn't exist, or an internal state
      // indicates an upgrade is needed.
      if (
        status != null &&
        status.clientSalt != null &&
        status.upgradeNeeded === false
      ) {
        const clientSalt = status.clientSalt;
        const credentialsV2 = await crypto.getCredentialsV2({
          password,
          clientSalt,
        });

        // V2 credentials exist and don't need upgrading.
        return {
          upgradeNeeded: false,
          v1: credentialsV1,
          v2: credentialsV2,
        };
      } else {
        // V2 credentials either don't exist, or require an upgrade.
        return {
          upgradeNeeded: true,
          v1: credentialsV1,
        };
      }
    }

    // In V1 mode, no upgraded needed...
    return {
      upgradeNeeded: false,
      v1: credentialsV1,
    };
  }

  public async getCredentialStatusV2(
    email: string,
    headers?: Headers
  ): Promise<CredentialStatus> {
    try {
      const result = await this.request(
        'POST',
        '/account/credentials/status',
        {
          email,
        },
        headers
      );
      return result;
    } catch (error) {
      if (error.errno === 102) {
        return {
          upgradeNeeded: false,
        };
      }
      throw error;
    }
  }
}
