import { TargetName } from '.';
import { BaseTarget, Credentials } from './base';

export class LocalTarget extends BaseTarget {
  static readonly target = 'local';
  readonly name: TargetName = LocalTarget.target;
  readonly contentServerUrl = 'http://localhost:3030';
  readonly relierUrl = 'http://localhost:8080';

  constructor() {
    super('http://localhost:9000', 'http://localhost:9001');
  }

  async createAccount(email: string, password: string, verify: boolean = true) {
    const result = await this.auth.signUp(email, password, {
      lang: 'en',
      preVerified: verify ? 'true' : undefined,
    });
    await this.auth.deviceRegister(result.sessionToken, 'playwright', 'tester');
    return {
      email,
      password,
      ...result,
    } as Credentials;
  }
}
