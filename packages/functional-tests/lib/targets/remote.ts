import { BaseTarget, Credentials } from './base';
import { EmailHeader, EmailType } from '../email';

export abstract class RemoteTarget extends BaseTarget {
  async createAccount(
    email: string,
    password: string,
    options?: any
  ): Promise<Credentials> {
    const creds = await this.authClient.signUp(email, password, options || {});
    const code = await this.emailClient.waitForEmail(
      email,
      EmailType.verify,
      EmailHeader.verifyCode
    );
    await this.authClient.verifyCode(creds.uid, code);
    await this.emailClient.clear(email);
    await this.authClient.deviceRegister(
      creds.sessionToken,
      'playwright',
      'tester'
    );
    return {
      email,
      password,
      ...creds,
    };
  }
}
