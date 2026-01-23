/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import got from 'got';
import mysql from 'mysql2/promise';

function wait() {
  return new Promise((r) => setTimeout(r, 50));
}

function toUsername(emailAddress: string) {
  return emailAddress.split('@')[0];
}

export enum EmailType {
  subscriptionReactivation,
  subscriptionReplaced,
  subscriptionUpgrade,
  subscriptionDowngrade,
  subscriptionPaymentExpired,
  subscriptionsPaymentExpired,
  subscriptionPaymentProviderCancelled,
  subscriptionsPaymentProviderCancelled,
  subscriptionPaymentFailed,
  subscriptionAccountDeletion,
  subscriptionCancellation,
  subscriptionSubsequentInvoice,
  subscriptionFirstInvoice,
  downloadSubscription,
  fraudulentAccountDeletion,
  lowRecoveryCodes,
  newDeviceLogin,
  passwordChanged,
  passwordChangeRequired,
  passwordForgotOtp,
  passwordReset,
  passwordResetAccountRecovery,
  passwordResetRequired,
  postAddLinkedAccount,
  postChangePrimary,
  postRemoveSecondary,
  postVerify,
  postVerifySecondary,
  postAddTwoStepAuthentication,
  postRemoveTwoStepAuthentication,
  postAddAccountRecovery,
  postRemoveAccountRecovery,
  postConsumeRecoveryCode,
  postNewRecoveryCodes,
  recovery,
  unblockCode,
  verify,
  verifyAccountChange,
  verifySecondaryCode,
  verifyShortCode,
  verifyLogin,
  verifyLoginCode,
  verifyPrimary,
  verificationReminderFirst,
  verificationReminderSecond,
  verificationReminderFinal,
  cadReminderFirst,
  cadReminderSecond,
  postAddRecoveryPhone,
  postChangeRecoveryPhone,
  postRemoveRecoveryPhone,
  postSigninRecoveryPhone,
}

export enum EmailHeader {
  verifyCode = 'x-verify-code',
  verifyAccountChangeCode = 'x-account-change-verify-code',
  shortCode = 'x-verify-short-code',
  unblockCode = 'x-unblock-code',
  signinCode = 'x-signin-verify-code',
  recoveryCode = 'x-recovery-code',
  uid = 'x-uid',
  serviceId = 'x-service-id',
  link = 'x-link',
  templateName = 'x-template-name',
  templateVersion = 'x-template-version',
  resetPasswordCode = 'x-password-forgot-otp',
}

export class EmailClient {
  constructor(private readonly host: string = 'http://restmail.net') {}

  /**
   * Waits for an email to arrive in the specified email address and returns the email message or header.
   * @param emailAddress - The email address to wait for the email.
   * @param type - The type of email to wait for.
   * @param header - The optional email header to retrieve.
   * @param timeout - The timeout in milliseconds. Default is 45000 (45 seconds).
   * @returns The email message or header.
   * @throws Error if the email does not arrive within the specified timeout.
   */
  async waitForEmail(
    emailAddress: string,
    type: EmailType,
    header?: EmailHeader,
    timeout = 45000
  ) {
    const expires = Date.now() + timeout;
    while (Date.now() < expires) {
      const mail = (await got(
        `${this.host}/mail/${toUsername(emailAddress)}`
      ).json()) as any[];
      const msg = mail
        .reverse()
        .find((m) => m.headers[EmailHeader.templateName] === EmailType[type]);
      if (msg) {
        return header ? msg.headers[header] : msg;
      }
      await wait();
    }
    throw new Error('EmailTimeout');
  }

  /**
   * Clears all emails in the specified email address.
   * @param emailAddress - The email address to clear.
   */
  async clear(emailAddress: string) {
    await got.delete(`${this.host}/mail/${toUsername(emailAddress)}`);
  }

  /**
   * Gets the link to create new backup authentication codes from the lowRecoveryCodes email.
   * @param email - The email that is expected to receive the link.
   * @returns the backup authentication codes link
   */
  async getLowRecoveryLink(email: string): Promise<string> {
    const link = await this.waitForEmail(
      email,
      EmailType.lowRecoveryCodes,
      EmailHeader.link
    );
    await this.clear(email);
    return link;
  }

  /**
   * Gets the password reset link from the recovery email.
   * @param email - The email address that is expected to receive the link.
   * @returns the password reset link
   */
  async getRecoveryLink(email: string): Promise<string> {
    const link = await this.waitForEmail(
      email,
      EmailType.recovery,
      EmailHeader.link
    );
    await this.clear(email);
    return link;
  }

  /**
   * Gets the reset password code from the email.
   * @param email - The email address that is expected to receive the code.
   * @returns the password reset code.
   */
  async getResetPasswordCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.passwordForgotOtp,
      EmailHeader.resetPasswordCode
    );
    await this.clear(email);
    return code;
  }

  /**
   * Gets the verification code from the email (used to confirm an unregistered email on sign in).
   * @param email - The email address that is expected to receive the verification code.
   * @returns The email verification code.
   */
  async getVerifyCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.verify,
      EmailHeader.verifyCode
    );
    await this.clear(email);
    return code;
  }

  /**
   * Gets the verification code from the email (mainly used for signin_token_code).
   * @param email - The email address that is expected to receive the verification code.
   * @returns The verification login code.
   */
  async getVerifyLoginCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.verifyLoginCode,
      EmailHeader.signinCode
    );
    await this.clear(email);
    return code;
  }

  async getVerifyAccountChangeCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.verifyAccountChange,
      EmailHeader.verifyAccountChangeCode
    );
    await this.clear(email);
    return code;
  }

  /**
   * Gets the code to verify a secondary email address from the email.
   * @param email - The email address that is expected to receive the verification code.
   * @returns The secondary email verification code.
   */
  async getVerifySecondaryCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.verifySecondaryCode,
      EmailHeader.verifyCode
    );
    await this.clear(email);
    return code;
  }

  /**
   * Gets the verification short code from the email (mainly used for confirm_signup_code on first signup).
   * @param email - The email address that is expected to receive the verification code.
   * @returns The verification short code.
   */
  async getVerifyShortCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.verifyShortCode,
      EmailHeader.shortCode
    );
    await this.clear(email);
    return code;
  }

  /**
   * Gets the unblock code from the email.
   * @param email - The email address that is expected to receive the unblock code.
   * @returns The unblock code.
   */
  async getUnblockCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.unblockCode,
      EmailHeader.unblockCode
    );
    await this.clear(email);
    return code;
  }

  /**
   * Gets the passwordless OTP code from the email.
   * Note: Passwordless uses the same email template as password forgot OTP.
   * @param email - The email address that is expected to receive the code.
   * @returns The passwordless OTP code.
   */
  async getPasswordlessCode(email: string): Promise<string> {
    const code = await this.waitForEmail(
      email,
      EmailType.passwordForgotOtp,
      EmailHeader.resetPasswordCode
    );
    await this.clear(email);
    return code;
  }

  /** Creates a bounce record. Note, this only works on localhost. For stage / prod, we expect we can generate a real bounce. */
  async createBounce(
    email: string,
    bounceType = 1,
    bounceSubType = 1,
    emailTypeId = 39,
    diagnosticCode = ''
  ): Promise<void> {
    try {
      // create the connection to database
      const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'fxa',
        // Since this is local, wait up to a second and fail other wise.
        connectTimeout: 1000,
      });

      // execute will internally call prepare and query
      connection.execute(
        `INSERT INTO emailBounces (email, bounceType, bounceSubType, createdAt, emailTypeId, diagnosticCode)
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          email,
          bounceType,
          bounceSubType,
          Date.now(),
          emailTypeId,
          diagnosticCode,
        ]
      );
    } catch (err) {
      console.log('Could not create bounce record in local db!');
    }
  }
}
