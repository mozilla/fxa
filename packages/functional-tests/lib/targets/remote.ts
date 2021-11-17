import { BaseTarget, Credentials } from './base';
import { EmailHeader, EmailType } from '../email';

export abstract class RemoteTarget extends BaseTarget {
  async createAccount(email: string, password: string): Promise<Credentials> {
    const creds = await this.auth.signUp(email, password);
    const code = await this.email.waitForEmail(
      email,
      EmailType.verify,
      EmailHeader.verifyCode
    );
    await this.auth.verifyCode(creds.uid, code);
    await this.email.clear(email);
    await this.auth.deviceRegister(creds.sessionToken, 'playwright', 'tester');
    return {
      email,
      password,
      ...creds,
    };
  }
}
