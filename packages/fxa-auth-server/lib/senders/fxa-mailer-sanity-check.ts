/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { EmailSender } from '../../../../libs/accounts/email-sender/src';
import { FxaMailer } from './fxa-mailer';
import { FxaMailerFormat } from './fxa-mailer-format';
import {
  EmailLinkBuilder,
  NodeRendererBindings,
} from '@fxa/accounts/email-renderer';
import { ConfigType } from '../../config';

/**
 * This is jsut a strong typed driver that allows us to validate the params we pass into FxaMailer
 * functions are type safe. Since there's still a lot of code in auth-server that isn't type safe
 * this gives us some level of sanity that we are invoking the mailer methods correctly.
 */

// Create dummy mailer
const fxaMailer = new FxaMailer(
  {} as unknown as EmailSender,
  {} as unknown as EmailLinkBuilder,
  {} as unknown as ConfigType['smtp'],
  {} as unknown as NodeRendererBindings
);

// Setup fake / mocked objects
const account = {
  uid: '',
  metricsOptOutAt: null,
  email: 'foo',
  primaryEmail: { email: 'foo', isPrimary: true, isVerified: true },
  emails: [
    { email: 'foo', isPrimary: true, isVerified: true },
    { email: 'bar', isPrimary: false, isVerified: true },
  ],
};

const request = {
  payload: {
    metricsContext: {
      flowId: '',
      flowBeginTime: 0,
      deviceId: '',
    },
  },
  app: {
    acceptLanguage: 'en',
    geo: {
      timeZone: '',
      location: {
        city: '',
        state: '',
        stateCode: '',
        country: '',
        countryCode: '',
      },
    },
    clientAddress: '',
    metricsContext: Promise.resolve({
      flowId: '',
      flowBeginTime: 0,
      deviceId: '',
    }),
    ua: {
      browser: '',
      os: '',
      osVersion: '',
    },
  },
  auth: {
    credentials: {
      uaBrowser: '',
      uaBrowserVersion: '',
      uaOS: '',
      uaOSVersion: '',
      uaDeviceType: '',
    },
  },
};

const rpCmsConfig = {
  shared: {
    emailLogoUrl: '',
    emailLogoAltText: '',
    emailLogoWidth: '',
  },
};

const service = 'sync';

async function __sendRecoveryEmail() {
  await fxaMailer.sendRecoveryEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.sync(service),
    token: 'todo',
    code: 'todo',
    email: FxaMailerFormat.account(account).to,
    resume: 'todo',
    emailToHashWith: account.email,
  });
}

async function __sendPasswordForgotOtpEmail() {
  await fxaMailer.sendPasswordForgotOtpEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.sync(service),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.localTime(request),
    code: 'todo',
  });
}

async function _sendPostVerifySecondaryEmail() {
  await fxaMailer.sendPostVerifySecondaryEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.sync(service),
    secondaryEmail: 'foo@mozilla.com',
  });
}

async function _sendPostChangePrimaryEmail() {
  await fxaMailer.sendPostChangePrimaryEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.sync(false),
    ...FxaMailerFormat.localTime(request),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.cmsLogo(rpCmsConfig.shared),
    email: FxaMailerFormat.account(account).to,
  });
}

async function _sendPostRemoveSecondaryEmail() {
  await fxaMailer.sendPostRemoveSecondaryEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.localTime(request),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.sync(false),
    secondaryEmail: 'foo@mozilla.com',
  });
}

async function _sendPostAddLinkedAccountEmail() {
  await fxaMailer.sendPostAddLinkedAccountEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
    providerName: 'todo',
  });
}

async function _sendNewDeviceLoginEmail() {
  await fxaMailer.sendNewDeviceLoginEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.sync(service),
    ...(await FxaMailerFormat.metricsContext(request)),
    clientName: 'sync',
    showBannerWarning: false,
  });
}

async function _sendPostAddTwoStepAuthenticationEmail() {
  await fxaMailer.sendPostAddTwoStepAuthenticationEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.device(request),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.sync(service),
    ...FxaMailerFormat.location(request),
    recoveryMethod: 'phone',
    maskedPhoneNumber: '3242',
  });
}

async function _sendPostChangeTwoStepAuthenticationEmail() {
  await fxaMailer.sendPostChangeTwoStepAuthenticationEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.localTime(request),
  });
}

async function __sendPostRemoveTwoStepAuthenticationEmail() {
  await fxaMailer.sendPostRemoveTwoStepAuthenticationEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.device(request),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function _sendPostNewRecoveryCodesEmail() {
  await fxaMailer.sendPostNewRecoveryCodesEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.sync(service),
    ...FxaMailerFormat.localTime(request),
  });
}

async function __sendPostConsumeRecoveryCodeEmail() {
  await fxaMailer.sendPostConsumeRecoveryCodeEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.device(request),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendLowRecoveryCodesEmail() {
  await fxaMailer.sendLowRecoveryCodesEmail({
    ...FxaMailerFormat.account(account),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.device(request),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.sync(service),
    numberRemaining: 1,
  });
}

async function __sendPostSigninRecoveryCodeEmail() {
  await fxaMailer.sendPostSigninRecoveryCodeEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPostAddRecoveryPhoneEmail() {
  await fxaMailer.sendPostAddRecoveryPhoneEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
    maskedLastFourPhoneNumber: '4444',
  });
}

async function __sendPostChangeRecoveryPhoneEmail() {
  await fxaMailer.sendPostChangeRecoveryPhoneEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPostRemoveRecoveryPhoneEmail() {
  await fxaMailer.sendPostRemoveRecoveryPhoneEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPasswordResetRecoveryPhoneEmail() {
  await fxaMailer.sendPasswordResetRecoveryPhoneEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPostSigninRecoveryPhoneEmail() {
  await fxaMailer.sendPostSigninRecoveryPhoneEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPostAddAccountRecoveryEmail() {
  await fxaMailer.sendPostAddAccountRecoveryEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPostChangeAccountRecoveryEmail() {
  await fxaMailer.sendPostChangeAccountRecoveryEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPostRemoveAccountRecoveryEmail() {
  await fxaMailer.sendPostRemoveAccountRecoveryEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendPasswordResetAccountRecoveryEmail() {
  await fxaMailer.sendPasswordResetAccountRecoveryEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
    productName: 'Firefox',
  });
}

async function __sendPasswordResetWithRecoveryKeyPromptEmail() {
  await fxaMailer.sendPasswordResetWithRecoveryKeyPromptEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
  });
}

async function __sendVerifyLoginCodeEmail() {
  await fxaMailer.sendVerifyLoginCodeEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
    code: '1234',
    serviceName: 'foo',
  });
}

async function __sendVerifyShortCodeEmail() {
  await fxaMailer.sendVerifyShortCodeEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.location(request),
    ...FxaMailerFormat.device(request),
    ...FxaMailerFormat.sync(service),
    code: '1234',
  });
}

async function __sendPostVerifyEmail() {
  await fxaMailer.sendPostVerifyEmail({
    ...FxaMailerFormat.account(account),
    ...(await FxaMailerFormat.metricsContext(request)),
    ...FxaMailerFormat.localTime(request),
    ...FxaMailerFormat.sync(service),
    productName: 'Firefox',
    onDesktopOrTabletDevice: true,
  });
}
