/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import AuthClient, { MetricsContext } from 'fxa-auth-client';
import { Container } from 'typedi';

import { fxAccountClientToken } from '../constants';
import { Context } from '../server';

function snakeToCamel(str: string) {
  return str.replace(/(_\w)/g, (m: string) => m[1].toUpperCase());
}

/**
 * Converts an object with keys that are possibly snake_cased to an
 * object with keys that are camelCased.
 *
 * @param obj Object with string keys
 */
export function snakeToCamelObject(obj: { [key: string]: any }) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [snakeToCamel(k), v])
  );
}

export class AuthServerSource extends DataSource {
  private authClient: AuthClient;

  constructor(private token: string = '') {
    super();
    this.authClient = Container.get(fxAccountClientToken);
  }

  initialize(config: DataSourceConfig<Context>) {
    this.token = config.context.token;
  }

  public async subscriptions(): Promise<any> {
    const result = await this.authClient.account(this.token);
    return result.subscriptions.map(snakeToCamelObject);
  }

  public attachedClients(): Promise<any[]> {
    return this.authClient.attachedClients(this.token);
  }

  public attachedClientDestroy(clientInfo: any): Promise<any> {
    return this.authClient.attachedClientDestroy(this.token, clientInfo);
  }

  public createTotpToken(
    options: MetricsContext
  ): ReturnType<AuthClient['createTotpToken']> {
    return this.authClient.createTotpToken(this.token, {
      metricsContext: options,
    });
  }

  public destroyTotpToken(): Promise<any> {
    return this.authClient.deleteTotpToken(this.token);
  }

  public totp(): Promise<any> {
    return this.authClient.checkTotpTokenExists(this.token);
  }

  public async hasRecoveryKey(): Promise<boolean> {
    const result = await this.authClient.recoveryKeyExists(this.token);
    return result.exists;
  }

  public recoveryEmailCreate(email: string): Promise<any> {
    return this.authClient.recoveryEmailCreate(this.token, email, {
      verificationMethod: 'email-otp',
    });
  }

  public recoveryEmailDestroy(email: string): Promise<any> {
    return this.authClient.recoveryEmailDestroy(this.token, email);
  }

  public recoveryEmailSetPrimaryEmail(email: string): Promise<any> {
    return this.authClient.recoveryEmailSetPrimaryEmail(this.token, email);
  }

  public recoveryEmailSecondaryResendCode(email: string): Promise<any> {
    return this.authClient.recoveryEmailSecondaryResendCode(this.token, email);
  }

  public replaceRecoveryCodes() {
    return this.authClient.replaceRecoveryCodes(this.token);
  }

  public verifyTotp(code: string, options?: { service: string }) {
    return this.authClient.verifyTotpCode(this.token, code, options);
  }

  public recoveryEmailSecondaryVerifyCode(email: string, code: string) {
    return this.authClient.recoveryEmailSecondaryVerifyCode(
      this.token,
      email,
      code
    );
  }

  public sessionResendVerifyCode() {
    return this.authClient.sessionResendVerifyCode(this.token);
  }

  public sessionVerifyCode(code: string) {
    return this.authClient.sessionVerifyCode(this.token, code);
  }

  public deleteRecoveryKey() {
    return this.authClient.deleteRecoveryKey(this.token);
  }

  public sessionDestroy() {
    return this.authClient.sessionDestroy(this.token);
  }
}
