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

export type AuthServerError = Error & {
  error?: string;
  errno?: number;
  message?: string;
  code?: number;
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

function langHeader(lang?: string) {
  return new Headers(
    lang
      ? {
          'Accept-Language': lang,
        }
      : {}
  );
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
      throw {
        error: 'Unknown error',
        message: result,
        errno: 999,
        code: response.status,
      };
    }
    return result;
  }

  private async hawkRequest(
    method: string,
    path: string,
    token: string,
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
    } catch (e) {
      if (e.errno === ERRORS.INVALID_TIMESTAMP) {
        const serverTime = e.serverTime * 1000 || Date.now();
        this.localtimeOffsetMsec = serverTime - Date.now();
        return this.request(method, path, payload, await makeHeaders());
      }
      throw e;
    }
  }

  private async sessionGet(path: string, sessionToken: string) {
    return this.hawkRequest('GET', path, sessionToken, tokenType.sessionToken);
  }

  private async sessionPost(
    path: string,
    sessionToken: string,
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
    sessionToken: string,
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

  async signUp(
    email: string,
    password: string,
    options: {
      keys?: boolean;
      service?: string;
      redirectTo?: string;
      preVerified?: string;
      resume?: string;
      lang?: string;
      style?: string;
      verificationMethod?: string;
      metricsContext?: MetricsContext;
    } = {}
  ) {
    const credentials = await crypto.getCredentials(email, password);
    const payloadOptions = ({ keys, lang, ...rest }: any) => rest;
    const payload = {
      email,
      authPW: credentials.authPW,
      ...payloadOptions(options),
    };
    const accountData = await this.request(
      'POST',
      pathWithKeys('/account/create', options.keys),
      payload,
      langHeader(options.lang)
    );
    if (options.keys) {
      accountData.unwrapBKey = credentials.unwrapBKey;
    }
    return accountData;
  }

  async signIn(
    email: string,
    password: string,
    options: {
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
    } = {}
  ): Promise<{
    uid: string;
    sessionToken: string;
    verified: boolean;
    authAt: number;
    keyFetchToken?: string;
    verificationMethod?: string;
    verificationReason?: string;
    unwrapBKey?: string;
  }> {
    const credentials = await crypto.getCredentials(email, password);
    const payloadOptions = ({ keys, ...rest }: any) => rest;
    const payload = {
      email,
      authPW: credentials.authPW,
      ...payloadOptions(options),
    };
    try {
      const accountData = await this.request(
        'POST',
        pathWithKeys('/account/login', options.keys),
        payload
      );
      if (options.keys) {
        accountData.unwrapBKey = credentials.unwrapBKey;
      }
      return accountData;
    } catch (error) {
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

  async verifyCode(
    uid: string,
    code: string,
    options: {
      service?: string;
      reminder?: string;
      type?: string;
      marketingOptIn?: boolean;
      newsletters?: string[];
      style?: string;
    } = {}
  ) {
    return this.request('POST', '/recovery_email/verify_code', {
      uid,
      code,
      ...options,
    });
  }

  async recoveryEmailStatus(sessionToken: string) {
    return this.sessionGet('/recovery_email/status', sessionToken);
  }

  async recoveryEmailResendCode(
    sessionToken: string,
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
    } = {}
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
      langHeader(options.lang)
    );
  }

  async passwordForgotResendCode(
    email: string,
    passwordForgotToken: string,
    options: {
      service?: string;
      redirectTo?: string;
      resume?: string;
      lang?: string;
    } = {}
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
      langHeader(options.lang)
    );
  }

  async passwordForgotVerifyCode(
    code: string,
    passwordForgotToken: string,
    options: {
      accountResetWithoutRecoveryKey?: boolean;
    } = {}
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
      payload
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
    accountResetToken: string,
    options: {
      keys?: boolean;
      sessionToken?: boolean;
    } = {}
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
      payload
    );
    if (options.keys && accountData.keyFetchToken) {
      accountData.unwrapBKey = credentials.unwrapBKey;
    }
    return accountData;
  }

  async accountKeys(keyFetchToken: string, unwrapBKey: string) {
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
    sessionToken?: string
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
    } catch (error) {
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

  async accountStatus(uid: string) {
    return this.request('GET', `/account/status?uid=${uid}`);
  }

  async accountStatusByEmail(email: string) {
    return this.request('POST', '/account/status', { email });
  }

  async accountProfile(sessionToken: string) {
    return this.sessionGet('/account/profile', sessionToken);
  }

  async account(sessionToken: string) {
    return this.sessionGet('/account', sessionToken);
  }

  async sessionDestroy(
    sessionToken: string,
    options: {
      customSessionToken?: string;
    } = {}
  ) {
    return this.sessionPost('/session/destroy', sessionToken, options);
  }

  async sessionStatus(
    sessionToken: string
  ): Promise<{ state: 'verified' | 'unverified'; uid: string }> {
    return this.sessionGet('/session/status', sessionToken);
  }

  async sessionVerifyCode(
    sessionToken: string,
    code: string,
    options: {
      service?: string;
      scopes?: string[];
      marketingOptIn?: boolean;
      newsletters?: string[];
      style?: string;
    } = {}
  ): Promise<{}> {
    return this.sessionPost('/session/verify_code', sessionToken, {
      code,
      ...options,
    });
  }

  async sessionResendVerifyCode(sessionToken: string): Promise<{}> {
    return this.sessionPost('/session/resend_code', sessionToken, {});
  }

  async sessionReauth(
    sessionToken: string,
    email: string,
    password: string,
    options: {
      keys?: boolean;
      skipCaseError?: boolean;
      service?: string;
      reason?: string;
      redirectTo?: string;
      resume?: string;
      originalLoginEmail?: string;
      verificationMethod?: string;
      metricsContext?: MetricsContext;
    } = {}
  ): Promise<any> {
    const credentials = await crypto.getCredentials(email, password);
    const payloadOptions = ({ keys, ...rest }: any) => rest;
    const payload = {
      email,
      authPW: credentials.authPW,
      ...payloadOptions(options),
    };
    try {
      const accountData = await this.sessionPost(
        pathWithKeys('/session/reauth', options.keys),
        sessionToken,
        payload
      );
      if (options.keys) {
        accountData.unwrapBKey = credentials.unwrapBKey;
      }
      return accountData;
    } catch (error) {
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

  async certificateSign(
    sessionToken: string,
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

  async passwordChange(
    email: string,
    oldPassword: string,
    newPassword: string,
    options: {
      keys?: boolean;
      sessionToken?: string;
    } = {}
  ): Promise<{
    uid: string;
    sessionToken: string;
    verified: boolean;
    authAt: number;
    unwrapBKey?: string;
    keyFetchToken?: string;
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
    authPW: string;
    unwrapBKey: string;
    email: string;
    keyFetchToken: string;
    passwordChangeToken: string;
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
    } catch (error) {
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

  async getRandomBytes() {
    return this.request('POST', '/get_random_bytes');
  }

  async deviceRegister(
    sessionToken: string,
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
    sessionToken: string,
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

  async deviceDestroy(sessionToken: string, id: string) {
    return this.sessionPost('/account/device/destroy', sessionToken, { id });
  }

  async deviceList(sessionToken: string) {
    return this.sessionGet('/account/devices', sessionToken);
  }

  async sessions(sessionToken: string) {
    return this.sessionGet('/account/sessions', sessionToken);
  }

  async securityEvents(sessionToken: string) {
    return this.sessionGet('/securityEvents', sessionToken);
  }

  async deleteSecurityEvents(sessionToken: string) {
    return this.hawkRequest(
      'DELETE',
      '/securityEvents',
      sessionToken,
      tokenType.sessionToken,
      {}
    );
  }

  async attachedClients(sessionToken: string) {
    return this.sessionGet('/account/attached_clients', sessionToken);
  }

  async attachedClientDestroy(sessionToken: string, clientInfo: any) {
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

  async rejectUnblockCode(uid: string, unblockCode: string) {
    return this.request('POST', '/account/login/reject_unblock_code', {
      uid,
      unblockCode,
    });
  }

  async sendSms(
    sessionToken: string,
    phoneNumber: string,
    messageId: string,
    options: {
      lang?: string;
      features?: string[];
      metricsContext?: MetricsContext;
    } = {}
  ) {
    const payloadOptions = ({ lang, ...rest }: any) => rest;
    return this.sessionPost(
      '/sms',
      sessionToken,
      { phoneNumber, messageId, ...payloadOptions(options) },
      langHeader(options.lang)
    );
  }

  async smsStatus(
    sessionToken: string,
    options: {
      country?: string;
    } = {}
  ) {
    return this.sessionGet(
      `/sms/status${
        options.country
          ? `?country=${encodeURIComponent(options.country as string)}`
          : ''
      }`,
      sessionToken
    );
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

  async createSigninCode(sessionToken: string) {
    return this.sessionPost('/signinCodes', sessionToken, {});
  }

  async createCadReminder(sessionToken: string) {
    return this.sessionPost('/emails/reminders/cad', sessionToken, {});
  }

  async recoveryEmails(sessionToken: string) {
    return this.sessionGet('/recovery_emails', sessionToken);
  }

  async recoveryEmailCreate(
    sessionToken: string,
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

  async recoveryEmailDestroy(sessionToken: string, email: string) {
    return this.sessionPost('/recovery_email/destroy', sessionToken, { email });
  }

  async recoveryEmailSetPrimaryEmail(sessionToken: string, email: string) {
    return this.sessionPost('/recovery_email/set_primary', sessionToken, {
      email,
    });
  }

  async recoveryEmailSecondaryVerifyCode(
    sessionToken: string,
    email: string,
    code: string
  ): Promise<{}> {
    return this.sessionPost(
      '/recovery_email/secondary/verify_code',
      sessionToken,
      { email, code }
    );
  }

  async recoveryEmailSecondaryResendCode(sessionToken: string, email: string) {
    return this.sessionPost(
      '/recovery_email/secondary/resend_code',
      sessionToken,
      { email }
    );
  }

  async createTotpToken(
    sessionToken: string,
    options: {
      metricsContext?: MetricsContext;
    } = {}
  ) {
    return this.sessionPost('/totp/create', sessionToken, options);
  }

  async deleteTotpToken(sessionToken: string) {
    return this.sessionPost('/totp/destroy', sessionToken, {});
  }

  async checkTotpTokenExists(
    sessionToken: string
  ): Promise<{ exists: boolean; verified: boolean }> {
    return this.sessionGet('/totp/exists', sessionToken);
  }

  async verifyTotpCode(
    sessionToken: string,
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

  async replaceRecoveryCodes(sessionToken: string) {
    return this.sessionGet('/recoveryCodes', sessionToken);
  }

  async consumeRecoveryCode(sessionToken: string, code: string) {
    return this.sessionPost('/session/verify/recoveryCode', sessionToken, {
      code,
    });
  }

  async createRecoveryKey(
    sessionToken: string,
    recoveryKeyId: string,
    recoveryData: any,
    enabled: boolean
  ) {
    return this.sessionPost('/recoveryKey', sessionToken, {
      recoveryKeyId,
      recoveryData,
      enabled,
    });
  }

  async getRecoveryKey(accountResetToken: string, recoveryKeyId: string) {
    return this.hawkRequest(
      'GET',
      `/recoveryKey/${recoveryKeyId}`,
      accountResetToken,
      tokenType.accountResetToken
    );
  }

  async resetPasswordWithRecoveryKey(
    accountResetToken: string,
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

  async deleteRecoveryKey(sessionToken: string) {
    return this.hawkRequest(
      'DELETE',
      '/recoveryKey',
      sessionToken,
      tokenType.sessionToken,
      {}
    );
  }

  async recoveryKeyExists(sessionToken: string | undefined, email?: string) {
    if (sessionToken) {
      return this.sessionPost('/recoveryKey/exists', sessionToken, { email });
    }
    return this.request('POST', '/recoveryKey/exists', { email });
  }

  async verifyRecoveryKey(sessionToken: string, recoveryKeyId: string) {
    return this.sessionPost('/recoveryKey/verify', sessionToken, {
      recoveryKeyId,
    });
  }

  async createOAuthCode(
    sessionToken: string,
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
    sessionToken: string,
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
    sessionToken: string,
    clientId: string,
    scope: string
  ) {
    return this.sessionPost('/account/scoped-key-data', sessionToken, {
      client_id: clientId,
      scope,
    });
  }

  async getSubscriptionPlans(accessToken: string) {
    return this.request(
      'GET',
      '/oauth/subscriptions/plans',
      null,
      new Headers({
        authorization: `Bearer ${accessToken}`,
      })
    );
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

  async updateNewsletters(sessionToken: string, newsletters: string[]) {
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

  /** Update a user's ecosystem anon ID */
  async updateEcosystemAnonId(
    /** Session token obtained from signIn */
    sessionToken: string,
    /** The new Ecosystem Anonymous ID */
    ecosystemAnonId: string,
    /** Additional options to be passed to the method */
    options: {
      /**
       * Sets the If-None-Match header to the specified value.
       * Use '*' to only update ID if one is not already set.
       */
      ifNoneMatch?: string;
      /**
       * Sets the If-Match header to the specified value.
       * Use the first part of an existing ID to only update
       * the ID if the values do not fuzzy match.
       */
      ifMatch?: string;
    } = {}
  ) {
    const headers: { [header: string]: string } = {};

    if (options.ifNoneMatch) {
      headers['If-None-Match'] = options.ifNoneMatch;
    }

    if (options.ifMatch) {
      headers['If-Match'] = options.ifMatch;
    }

    return this.sessionPut(
      '/account/ecosystemAnonId',
      sessionToken,
      {
        ecosystemAnonId,
      },
      new Headers(headers)
    );
  }
}
