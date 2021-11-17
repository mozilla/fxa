import got from 'got';

function wait() {
  return new Promise((r) => setTimeout(r, 50));
}

function toUsername(emailAddress: string) {
  return emailAddress.split('@')[0];
}

export enum EmailType {
  subscriptionReactivation,
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
  lowRecoveryCodes,
  newDeviceLogin,
  passwordChanged,
  passwordChangeRequired,
  passwordReset,
  passwordResetAccountRecovery,
  passwordResetRequired,
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
  verifySecondaryCode,
  verifyShortCode,
  verifyLogin,
  verifyLoginCode,
  verifyPrimary,
  verifySecondary,
  verificationReminderFirst,
  verificationReminderSecond,
  cadReminderFirst,
  cadReminderSecond,
}

export enum EmailHeader {
  verifyCode = 'x-verify-code',
  shortCode = 'x-verify-short-code',
  unblockCode = 'x-unblock-code',
  signinCode = 'x-signin-verify-code',
  recoveryCode = 'x-recovery-code',
  uid = 'x-uid',
  serviceId = 'x-service-id',
  link = 'x-link',
  templateName = 'x-template-name',
  templateVersion = 'x-template-version',
}

export class EmailClient {
  static emailFromTestTitle(title: string) {
    return `${title
      .match(/(\w+)/g)
      .join('_')
      .substr(0, 20)
      .toLowerCase()}_${Math.floor(Math.random() * 10000)}@restmail.net`;
  }
  constructor(private readonly host: string = 'http://restmail.net') {}

  async waitForEmail(
    emailAddress: string,
    type: EmailType,
    header?: EmailHeader,
    timeout: number = 15000
  ) {
    const expires = Date.now() + timeout;
    while (Date.now() < expires) {
      const mail = (await got(
        `${this.host}/mail/${toUsername(emailAddress)}`
      ).json()) as any[];
      const msg = mail.find(
        (m) => m.headers[EmailHeader.templateName] === EmailType[type]
      );
      if (msg) {
        return header ? msg.headers[header] : msg;
      }
      await wait();
    }
    throw new Error('EmailTimeout');
  }

  async clear(emailAddress: string) {
    await got.delete(`${this.host}/mail/${toUsername(emailAddress)}`);
  }
}
