import { PasswordForgotSendCodePayload } from '../Account';

export interface PasswordResetAccount {
  get recoveryKey(): boolean;
  setLastLogin(date: number): Promise<void>;
  resetPasswordWithRecoveryKey(opts: {
    accountResetToken: string;
    emailToHashWith: string;
    password: string;
    recoveryKeyId: string;
    kB: string;
  }): Promise<void>;
  resetPassword(email: string): Promise<PasswordForgotSendCodePayload>;
}
