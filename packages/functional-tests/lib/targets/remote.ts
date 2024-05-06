import { BaseTarget, Credentials } from './base';
import { EmailHeader, EmailType } from '../email';

export abstract class RemoteTarget extends BaseTarget {
  async createAccount(
    email: string,
    password: string,
    options = { lang: 'en', preVerified: 'true' }
  ): Promise<Credentials> {
    // FXA-9550 - The preVerified option doesn't work in production
    const { preVerified, ...filteredOptions } = options;
    const creds = await this.authClient.signUp(
      email,
      password,
      filteredOptions
    );
    if (preVerified === 'true') {
      const code = await this.emailClient.waitForEmail(
        email,
        EmailType.verify,
        EmailHeader.verifyCode
      );
      await this.authClient.verifyCode(creds.uid, code);
      await this.emailClient.clear(email);
    }
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
