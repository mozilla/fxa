/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as crypto from './crypto';
import * as hawk from './hawk';

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
};

export type SignedInAccountData = {
  uid: hexstring;
  sessionToken: hexstring;
  verified: boolean;
  authAt: number;
  metricsEnabled: boolean;
  keyFetchToken?: hexstring;
  verificationMethod?: string;
  verificationReason?: string;
  unwrapBKey?: hexstring;
};

export type SessionReauthOptions = SignInOptions;
export type SessionReauthedAccountData = Omit<
  SignedInAccountData,
  'sessionToken'
>;

export type AuthServerError = Error & {
  error?: string;
  errno?: number;
  message?: string;
  code?: number;
  retryAfter?: number;
  retryAfterLocalized?: string;
};

export interface MetricsContext {
  deviceId?: string;
  flowId?: string;
  flowBeginTime?: number;
  utmCampaign?: string;
  utmContext?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
}

export type VerificationMethod =
  | 'email'
  | 'email-otp'
  | 'email-2fa'
  | 'email-captcha'
  | 'totp-2fa';

function langHeader(lang?: string) {
  return new Headers(
    lang
      ? {
          'Accept-Language': lang,
        }
      : {}
  );
}

function createHeaders(
  headers: Headers = new Headers(),
  options: Record<string, any> & { lang?: string }
) {
  if (options.lang) {
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

export default class AuthClient {
  static VERSION = 'v1';
  private uri: string;
  private localtimeOffsetMsec: number;
  private timeout: number;

  constructor(authServerUri: string, options: { timeout?: number } = {}) {
    if (new RegExp(`/${AuthClient.VERSION}$`).test(authServerUri)) {
      this.uri = authServerUri;
    } else {
      this.uri = `${authServerUri}/${AuthClient.VERSION}`;
    }
    this.localtimeOffsetMsec = 0;
    this.timeout = options.timeout || 30000;
  }

  static async create(authServerUri: string) {
    if (typeof TextEncoder === 'undefined') {
      await import(
        // @ts-ignore
        /* webpackChunkName: "fast-text-encoding" */ 'fast-text-encoding'
      );
    }
    await crypto.checkWebCrypto();
    return new AuthClient(authServerUri);
  }

  private url(path: string) {
    return `${this.uri}${path}`;
  }

  private async request(
    method: string,
    path: string,
    payload?: object | null,
    headers: Headers = new Headers()
  ) {
    headers.set('Content-Type', 'application/json');
    const response = await fetchOrTimeout(
      this.url(path),
      {
        method,
        headers,
        body: cleanStringify(payload),
      },
      this.timeout
    );
    let result: any = await response.text();
    try {
      result = JSON.parse(result);
    } catch (e) {}
    if (result.errno) {
      throw result;
    }
    if (!response.ok) {
      throw new AuthClientError('Unknown error', result, 999, response.status);
    }
    return result;
  }

  private async hawkRequest(
    method: string,
    path: string,
    token: hexstring,
    kind: tokenType,
    payload?: object,
    extraHeaders: Headers = new Headers()
  ) {
    const makeHeaders = async () => {
      const headers = await hawk.header(method, this.url(path), token, kind, {
        payload: cleanStringify(payload),
        contentType: 'application/json',
        localtimeOffsetMsec: this.localtimeOffsetMsec,
      });
      for (const [name, value] of extraHeaders) {
        headers.set(name, value);
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

  private async sessionGet(path: string, sessionToken: hexstring) {
    return this.hawkRequest('GET', path, sessionToken, tokenType.sessionToken);
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

  /**
   * Used for sign up on clients with direct access to the plaintext password.
   */
  async signUp(
    email: string,
    password: string,
    options: SignUpOptions = {}
  ): Promise<SignedUpAccountData> {
    const credentials = await crypto.getCredentials(email, password);
    const accountData = (await this.signUpWithAuthPW(
      email,
      credentials.authPW,
      options,
      langHeader(options.lang)
    )) as SignedUpAccountData;
    if (options.keys) {
      accountData.unwrapBKey = credentials.unwrapBKey;
    }
    return accountData;
  }

  /**
   * This function is intended for a service that will proxy the sign-up
   * request.  When signing up from a client with access to the plaintext
   * password, use `signUp` above.
   */
  async signUpWithAuthPW(
    email: string,
    authPW: string,
    options: SignUpOptions,
    headers: Headers = new Headers()
  ): Promise<Omit<SignedUpAccountData, 'unwrapBKey'>> {
    const payloadOptions = ({ keys, lang, ...rest }: any) => rest;
    const payload = {
      email,
      authPW,
      ...payloadOptions(options),
    };
    const accountData = await this.request(
      'POST',
      pathWithKeys('/account/create', options.keys),
      payload,
      headers
    );
    return accountData;
  }

  /**
   * Used for authentication on clients with direct access to the plaintext
   * password.
   */
  async signIn(
    email: string,
    password: string,
    options: SignInOptions = {}
  ): Promise<SignedInAccountData> {
    const credentials = await crypto.getCredentials(email, password);
    try {
      const accountData = (await this.signInWithAuthPW(
        email,
        credentials.authPW,
        options
      )) as SignedInAccountData;
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

        return this.signIn(error.email, password, options);
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
    options: Omit<SignInOptions, 'skipCaseError' | 'originalLoginEmail'> = {},
    headers: Headers = new Headers()
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
      headers
    );
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
    headers: Headers = new Headers()
  ) {
    return this.request(
      'POST',
      '/recovery_email/verify_code',
      {
        uid,
        code,
        ...options,
      },
      headers
    );
  }

  async recoveryEmailStatus(sessionToken: hexstring) {
    return this.sessionGet('/recovery_email/status', sessionToken);
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
    } = {}
  ) {
    const payloadOptions = ({ lang, ...rest }: any) => rest;
    return this.sessionPost(
      '/recovery_email/resend_code',
      sessionToken,
      payloadOptions(options),
      langHeader(options.lang)
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
    headers: Headers = new Headers()
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
    headers: Headers = new Headers()
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
    } = {},
    headers: Headers = new Headers()
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

  async passwordForgotStatus(passwordForgotToken: string) {
    return this.hawkRequest(
      'GET',
      '/password/forgot/status',
      passwordForgotToken,
      tokenType.passwordForgotToken
    );
  }

  async accountReset(
    email: string,
    newPassword: string,
    accountResetToken: hexstring,
    options: {
      keys?: boolean;
      sessionToken?: boolean;
    } = {},
    headers: Headers = new Headers()
  ) {
    const credentials = await crypto.getCredentials(email, newPassword);
    const payloadOptions = ({ keys, ...rest }: any) => rest;
    const payload = {
      authPW: credentials.authPW,
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
      accountData.unwrapBKey = credentials.unwrapBKey;
    }
    return accountData;
  }

  async finishSetup(
    token: string,
    email: string,
    newPassword: string
  ): Promise<{
    uid: hexstring;
    sessionToken: hexstring;
    verified: boolean;
  }> {
    const credentials = await crypto.getCredentials(email, newPassword);
    return this.finishSetupWithAuthPW(token, credentials.authPW);
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
    headers: Headers = new Headers()
  ) {
    const payload = {
      token,
      authPW,
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
    service?: string,
    metricsContext: MetricsContext = {}
  ): Promise<{
    uid: hexstring;
    sessionToken: hexstring;
    verified: boolean;
  }> {
    const payload = {
      code,
      provider,
      service,
      metricsContext,
    };
    return await this.request('POST', '/linked_account/login', payload);
  }

  async unlinkThirdParty(
    sessionToken: hexstring,
    providerId: number
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
    return await this.sessionPost('/linked_account/unlink', sessionToken, {
      provider,
    });
  }

  async accountKeys(
    keyFetchToken: hexstring,
    unwrapBKey: hexstring
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
      tokenType.keyFetchToken
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

  async accountDestroy(
    email: string,
    password: string,
    options: {
      skipCaseError?: boolean;
    } = {},
    sessionToken?: hexstring
  ): Promise<any> {
    const credentials = await crypto.getCredentials(email, password);
    const payload = {
      email,
      authPW: credentials.authPW,
    };
    try {
      if (sessionToken) {
        return await this.sessionPost(
          '/account/destroy',
          sessionToken,
          payload
        );
      } else {
        return await this.request('POST', '/account/destroy', payload);
      }
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
          sessionToken
        );
      } else {
        throw error;
      }
    }
  }

  async accountStatus(uid: hexstring) {
    return this.request('GET', `/account/status?uid=${uid}`);
  }

  async accountStatusByEmail(
    email: string,
    options: { thirdPartyAuthStatus?: boolean } = {}
  ) {
    return this.request('POST', '/account/status', { email, ...options });
  }

  async accountProfile(sessionToken: hexstring) {
    return this.sessionGet('/account/profile', sessionToken);
  }

  async account(sessionToken: hexstring) {
    return this.sessionGet('/account', sessionToken);
  }

  async sessionDestroy(
    sessionToken: hexstring,
    options: {
      customSessionToken?: string;
    } = {}
  ) {
    return this.sessionPost('/session/destroy', sessionToken, options);
  }

  async sessionStatus(
    sessionToken: hexstring
  ): Promise<{ state: 'verified' | 'unverified'; uid: string }> {
    return this.sessionGet('/session/status', sessionToken);
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
    headers: Headers = new Headers()
  ): Promise<{}> {
    return this.sessionPost('/session/verify_code', sessionToken, {
      code,
      ...options,
    });
  }

  async sessionResendVerifyCode(
    sessionToken: hexstring,
    headers: Headers = new Headers()
  ): Promise<{}> {
    return this.sessionPost('/session/resend_code', sessionToken, {}, headers);
  }

  async sessionReauth(
    sessionToken: hexstring,
    email: string,
    password: string,
    options: SessionReauthOptions = {}
  ): Promise<SessionReauthedAccountData> {
    const credentials = await crypto.getCredentials(email, password);
    try {
      const accountData = await this.sessionReauthWithAuthPW(
        sessionToken,
        email,
        credentials.authPW,
        options
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

        return this.sessionReauth(sessionToken, error.email, password, options);
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
    headers: Headers = new Headers()
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

  async certificateSign(
    sessionToken: hexstring,
    publicKey: any,
    duration: number,
    options: {
      service?: string;
    } = {}
  ) {
    const payload = {
      publicKey,
      duration,
    };
    return this.sessionPost(
      `/certificate/sign${
        options.service
          ? `?service=${encodeURIComponent(options.service as string)}`
          : ''
      }`,
      sessionToken,
      payload
    );
  }

  async passwordChangeWithAuthPW(
    email: string,
    oldPasswordAuthPW: string,
    newPasswordAuthPW: string,
    oldUnwrapBKey: string,
    newUnwrapBKey: string,
    options: {
      keys?: boolean;
      sessionToken?: hexstring;
    } = {}
  ): Promise<{
    uid: hexstring;
    sessionToken: hexstring;
    verified: boolean;
    authAt: number;
    unwrapBKey?: hexstring;
    keyFetchToken?: hexstring;
  }> {
    const passwordData = await this.request('POST', '/password/change/start', {
      email,
      oldAuthPW: oldPasswordAuthPW,
    });

    const keys = await this.accountKeys(
      passwordData.keyFetchToken,
      oldUnwrapBKey
    );

    const wrapKb = crypto.unwrapKB(keys.kB, newUnwrapBKey);
    const sessionToken = options.sessionToken
      ? (await hawk.deriveHawkCredentials(options.sessionToken, 'sessionToken'))
          .id
      : undefined;
    const payload = {
      wrapKb,
      authPW: newPasswordAuthPW,
      sessionToken,
    };
    const accountData = await this.hawkRequest(
      'POST',
      pathWithKeys('/password/change/finish', options.keys),
      passwordData.passwordChangeToken,
      tokenType.passwordChangeToken,
      payload
    );
    if (options.keys && accountData.keyFetchToken) {
      accountData.unwrapBKey = newUnwrapBKey;
    }
    return accountData;
  }

  async passwordChange(
    email: string,
    oldPassword: string,
    newPassword: string,
    options: {
      keys?: boolean;
      sessionToken?: hexstring;
    } = {}
  ): Promise<{
    uid: hexstring;
    sessionToken: hexstring;
    verified: boolean;
    authAt: number;
    unwrapBKey?: hexstring;
    keyFetchToken?: hexstring;
  }> {
    const oldCredentials = await this.passwordChangeStart(email, oldPassword);
    const keys = await this.accountKeys(
      oldCredentials.keyFetchToken,
      oldCredentials.unwrapBKey
    );
    const newCredentials = await crypto.getCredentials(
      oldCredentials.email,
      newPassword
    );
    const wrapKb = crypto.unwrapKB(keys.kB, newCredentials.unwrapBKey);
    const sessionToken = options.sessionToken
      ? (await hawk.deriveHawkCredentials(options.sessionToken, 'sessionToken'))
          .id
      : undefined;
    const payload = {
      wrapKb,
      authPW: newCredentials.authPW,
      sessionToken,
    };
    const accountData = await this.hawkRequest(
      'POST',
      pathWithKeys('/password/change/finish', options.keys),
      oldCredentials.passwordChangeToken,
      tokenType.passwordChangeToken,
      payload
    );
    if (options.keys && accountData.keyFetchToken) {
      accountData.unwrapBKey = newCredentials.unwrapBKey;
    }
    return accountData;
  }

  private async passwordChangeStart(
    email: string,
    oldPassword: string,
    options: {
      skipCaseError?: boolean;
    } = {}
  ): Promise<{
    authPW: hexstring;
    unwrapBKey: hexstring;
    email: string;
    keyFetchToken: hexstring;
    passwordChangeToken: hexstring;
  }> {
    const oldCredentials = await crypto.getCredentials(email, oldPassword);
    try {
      const passwordData = await this.request(
        'POST',
        '/password/change/start',
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

        return this.passwordChangeStart(error.email, oldPassword, options);
      } else {
        throw error;
      }
    }
  }

  async createPassword(
    sessionToken: string,
    email: string,
    newPassword: string
  ): Promise<number> {
    const newCredentials = await crypto.getCredentials(email, newPassword);

    const payload = {
      authPW: newCredentials.authPW,
    };

    return this.sessionPost('/password/create', sessionToken, payload);
  }

  async getRandomBytes() {
    return this.request('POST', '/get_random_bytes');
  }

  async deviceRegister(
    sessionToken: hexstring,
    name: string,
    type: string,
    options: {
      deviceCallback?: string;
      devicePublicKey?: string;
      deviceAuthKey?: string;
    } = {}
  ) {
    const payload = {
      name,
      type,
      ...options,
    };
    return this.sessionPost('/account/device', sessionToken, payload);
  }

  async deviceUpdate(
    sessionToken: hexstring,
    id: string,
    name: string,
    options: {
      deviceCallback?: string;
      devicePublicKey?: string;
      deviceAuthKey?: string;
    } = {}
  ) {
    const payload = {
      id,
      name,
      ...options,
    };
    return this.sessionPost('/account/device', sessionToken, payload);
  }

  async deviceDestroy(sessionToken: hexstring, id: string) {
    return this.sessionPost('/account/device/destroy', sessionToken, { id });
  }

  async deviceList(sessionToken: hexstring) {
    return this.sessionGet('/account/devices', sessionToken);
  }

  async sessions(sessionToken: hexstring) {
    return this.sessionGet('/account/sessions', sessionToken);
  }

  async securityEvents(sessionToken: hexstring) {
    return this.sessionGet('/securityEvents', sessionToken);
  }

  async deleteSecurityEvents(sessionToken: hexstring) {
    return this.hawkRequest(
      'DELETE',
      '/securityEvents',
      sessionToken,
      tokenType.sessionToken,
      {}
    );
  }

  async attachedClients(sessionToken: hexstring) {
    return this.sessionGet('/account/attached_clients', sessionToken);
  }

  async attachedClientDestroy(sessionToken: hexstring, clientInfo: any) {
    return this.sessionPost('/account/attached_client/destroy', sessionToken, {
      clientId: clientInfo.clientId,
      deviceId: clientInfo.deviceId,
      refreshTokenId: clientInfo.refreshTokenId,
      sessionTokenId: clientInfo.sessionTokenId,
    });
  }

  async sendUnblockCode(
    email: string,
    options: {
      metricsContext?: MetricsContext;
    } = {}
  ) {
    return this.request('POST', '/account/login/send_unblock_code', {
      email,
      ...options,
    });
  }

  async rejectUnblockCode(uid: hexstring, unblockCode: string) {
    return this.request('POST', '/account/login/reject_unblock_code', {
      uid,
      unblockCode,
    });
  }

  async consumeSigninCode(
    code: string,
    flowId: string,
    flowBeginTime: number,
    deviceId?: string
  ) {
    return this.request('POST', '/signinCodes/consume', {
      code,
      metricsContext: {
        deviceId,
        flowId,
        flowBeginTime,
      },
    });
  }

  async createSigninCode(sessionToken: hexstring) {
    return this.sessionPost('/signinCodes', sessionToken, {});
  }

  async createCadReminder(sessionToken: hexstring) {
    return this.sessionPost('/emails/reminders/cad', sessionToken, {});
  }

  async recoveryEmails(sessionToken: hexstring) {
    return this.sessionGet('/recovery_emails', sessionToken);
  }

  async recoveryEmailCreate(
    sessionToken: hexstring,
    email: string,
    options: {
      verificationMethod?: string;
    } = {}
  ) {
    return this.sessionPost('/recovery_email', sessionToken, {
      email,
      ...options,
    });
  }

  async recoveryEmailDestroy(sessionToken: hexstring, email: string) {
    return this.sessionPost('/recovery_email/destroy', sessionToken, { email });
  }

  async recoveryEmailSetPrimaryEmail(sessionToken: hexstring, email: string) {
    return this.sessionPost('/recovery_email/set_primary', sessionToken, {
      email,
    });
  }

  async recoveryEmailSecondaryVerifyCode(
    sessionToken: hexstring,
    email: string,
    code: string
  ): Promise<{}> {
    return this.sessionPost(
      '/recovery_email/secondary/verify_code',
      sessionToken,
      { email, code }
    );
  }

  async recoveryEmailSecondaryResendCode(
    sessionToken: hexstring,
    email: string
  ) {
    return this.sessionPost(
      '/recovery_email/secondary/resend_code',
      sessionToken,
      { email }
    );
  }

  async createTotpToken(
    sessionToken: hexstring,
    options: {
      metricsContext?: MetricsContext;
    } = {}
  ): Promise<{
    qrCodeUrl: string;
    secret: string;
    recoveryCodes: string[];
  }> {
    return this.sessionPost('/totp/create', sessionToken, options);
  }

  async deleteTotpToken(sessionToken: hexstring) {
    return this.sessionPost('/totp/destroy', sessionToken, {});
  }

  async checkTotpTokenExists(
    sessionToken: hexstring
  ): Promise<{ exists: boolean; verified: boolean }> {
    return this.sessionGet('/totp/exists', sessionToken);
  }

  async verifyTotpCode(
    sessionToken: hexstring,
    code: string,
    options: {
      service?: string;
    } = {}
  ) {
    return this.sessionPost('/session/verify/totp', sessionToken, {
      code,
      ...options,
    });
  }

  async replaceRecoveryCodes(
    sessionToken: hexstring
  ): Promise<{ recoveryCodes: string[] }> {
    return this.sessionGet('/recoveryCodes', sessionToken);
  }

  async updateRecoveryCodes(
    sessionToken: hexstring,
    recoveryCodes: string[]
  ): Promise<{ success: boolean }> {
    return this.sessionPut('/recoveryCodes', sessionToken, { recoveryCodes });
  }

  async consumeRecoveryCode(sessionToken: hexstring, code: string) {
    return this.sessionPost('/session/verify/recoveryCode', sessionToken, {
      code,
    });
  }

  async createRecoveryKey(
    sessionToken: hexstring,
    recoveryKeyId: string,
    recoveryData: any,
    enabled: boolean = true,
    replaceKey: boolean = false
  ): Promise<{}> {
    return this.sessionPost('/recoveryKey', sessionToken, {
      recoveryKeyId,
      recoveryData,
      enabled,
      replaceKey,
    });
  }

  async getRecoveryKey(accountResetToken: hexstring, recoveryKeyId: string) {
    return this.hawkRequest(
      'GET',
      `/recoveryKey/${recoveryKeyId}`,
      accountResetToken,
      tokenType.accountResetToken
    );
  }

  // TODO: Update to POST in FXA-7400
  async getRecoveryKeyHint(
    sessionToken: hexstring | undefined,
    email?: string
  ): Promise<{ hint: string | null }> {
    if (sessionToken) {
      return this.sessionGet('/recoveryKey/hint', sessionToken);
    }
    return this.request('GET', `/recoveryKey/hint?email=${email}`);
  }

  async updateRecoveryKeyHint(
    sessionToken: hexstring,
    hint: string
  ): Promise<{}> {
    return this.sessionPost('/recoveryKey/hint', sessionToken, {
      hint,
    });
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
    } = {}
  ) {
    const credentials = await crypto.getCredentials(email, newPassword);
    const newWrapKb = crypto.unwrapKB(keys.kB, credentials.unwrapBKey);
    const payload = {
      wrapKb: newWrapKb,
      authPW: credentials.authPW,
      sessionToken: options.sessionToken,
      recoveryKeyId,
    };
    const accountData = await this.hawkRequest(
      'POST',
      pathWithKeys('/account/reset', options.keys),
      accountResetToken,
      tokenType.accountResetToken,
      payload
    );
    if (options.keys && accountData.keyFetchToken) {
      accountData.unwrapBKey = credentials.unwrapBKey;
    }
    return accountData;
  }

  async deleteRecoveryKey(sessionToken: hexstring) {
    return this.hawkRequest(
      'DELETE',
      '/recoveryKey',
      sessionToken,
      tokenType.sessionToken,
      {}
    );
  }

  async recoveryKeyExists(sessionToken: hexstring | undefined, email?: string) {
    if (sessionToken) {
      return this.sessionPost('/recoveryKey/exists', sessionToken, { email });
    }
    return this.request('POST', '/recoveryKey/exists', { email });
  }

  async verifyRecoveryKey(sessionToken: hexstring, recoveryKeyId: string) {
    return this.sessionPost('/recoveryKey/verify', sessionToken, {
      recoveryKeyId,
    });
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
    } = {}
  ) {
    return this.sessionPost('/oauth/authorization', sessionToken, {
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
    });
  }

  async createOAuthToken(
    sessionToken: hexstring,
    clientId: string,
    options: {
      access_type?: string;
      scope?: string;
      ttl?: number;
    } = {}
  ) {
    return this.sessionPost('/oauth/token', sessionToken, {
      grant_type: 'fxa-credentials',
      access_type: options.access_type,
      client_id: clientId,
      scope: options.scope,
      ttl: options.ttl,
    });
  }

  async getOAuthScopedKeyData(
    sessionToken: hexstring,
    clientId: string,
    scope: string
  ) {
    return this.sessionPost('/account/scoped-key-data', sessionToken, {
      client_id: clientId,
      scope,
    });
  }

  async getSubscriptionPlans() {
    return this.request('GET', '/oauth/subscriptions/plans');
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

  async updateNewsletters(sessionToken: hexstring, newsletters: string[]) {
    return this.sessionPost('/newsletters', sessionToken, {
      newsletters,
    });
  }

  async verifyIdToken(
    idToken: string,
    clientId: string,
    expiryGracePeriod?: number
  ) {
    const payload: any = {
      id_token: idToken,
      client_id: clientId,
    };
    if (expiryGracePeriod) {
      payload.expiry_grace_period = expiryGracePeriod;
    }
    return this.request('POST', '/oauth/id-token-verify', payload);
  }

  async getProductInfo(productId: string) {
    return this.request(
      'GET',
      `/oauth/subscriptions/productname?productId=${productId}`
    );
  }

  async sendPushLoginRequest(sessionToken: string) {
    return this.sessionPost('/session/verify/send_push', sessionToken, {});
  }
}
