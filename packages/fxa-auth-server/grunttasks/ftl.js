/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

module.exports = function (grunt) {
  // make a copy of the local branding terms available for local development
  // before they are extracted to the l10n repo
  // this file will not be included in the string extraction process, so should not lead to duplication
  grunt.config('copy', {
    'branding-ftl': {
      nonull: true,
      src: '../../libs/shared/l10n/src/lib/branding.ftl',
      dest: 'public/locales/en/branding.ftl',
    },
  });

  grunt.config('concat', {
    ftl: {
      src: [
        'lib/l10n/server.ftl',

        // Until we have fully migrated all email sending off of auth-server, we will
        // maintain a list of ftl files to extract here. As we migrate over to using
        // the templates from this library, we should comment the template from this list,
        // and make sure that is commented out in auth server's list. Doing so will avoid
        // duplication of l10n strings, which causes our translators uncessary rework...

        // Once all email rendering has been migrated, just use this pattern!
        // 'lib/senders/emails/**/en.ftl',

        // 'lib/senders/emails/layouts/fxa/en.ftl',
        'lib/senders/emails/subscription/fxa/en.ftl',

        // 'lib/senders/emails/partials/accountDeletionInfoBlock/en.ftl',
        // 'lib/senders/emails/partials/appBadges/en.ftl',
        // 'lib/senders/emails/partials/automatedEmailChangePassword/en.ftl',
        // 'lib/senders/emails/partials/automatedEmailInactiveAccount/en.ftl',
        // 'lib/senders/emails/partials/automatedEmailNoAction/en.ftl',
        // 'lib/senders/emails/partials/automatedEmailNotAuthorized/en.ftl',
        // 'lib/senders/emails/partials/automatedEmailRecoveryKey/en.ftl',
        // 'lib/senders/emails/partials/automatedEmailResetPassword/en.ftl',
        // 'lib/senders/emails/partials/automatedEmailResetPasswordTwoFactor/en.ftl',
        // 'lib/senders/emails/partials/bannerWarning/en.ftl',
        // 'lib/senders/emails/partials/brandMessaging/en.ftl',
        // 'lib/senders/emails/partials/button/en.ftl',
        // 'lib/senders/emails/partials/changePassword/en.ftl',
        // 'lib/senders/emails/partials/changePassword/en.ftl',
        'lib/senders/emails/partials/icon/en.ftl',
        // 'lib/senders/emails/partials/manageAccount/en.ftl',
        'lib/senders/emails/partials/paymentPlanDetails/en.ftl',
        'lib/senders/emails/partials/paymentProvider/en.ftl',
        'lib/senders/emails/partials/subscriptionCharges/en.ftl',
        'lib/senders/emails/partials/subscriptionSupport/en.ftl',
        'lib/senders/emails/partials/subscriptionSupportContact/en.ftl',
        'lib/senders/emails/partials/subscriptionSupportGetHelp/en.ftl',
        'lib/senders/emails/partials/subscriptionUpdateBillingEnsure/en.ftl',
        'lib/senders/emails/partials/subscriptionUpdateBillingTry/en.ftl',
        'lib/senders/emails/partials/subscriptionUpdatePayment/en.ftl',
        // 'lib/senders/emails/partials/support/en.ftl',
        // 'lib/senders/emails/partials/userDevice/en.ftl',
        // 'lib/senders/emails/partials/userInfo/en.ftl',
        // 'lib/senders/emails/partials/userLocation/en.ftl',
        'lib/senders/emails/partials/viewInvoice/en.ftl',

        // 'lib/senders/emails/templates/adminResetAccounts/en.ftl',
        // 'lib/senders/emails/templates/cadReminderFirst/en.ftl',
        // 'lib/senders/emails/templates/cadReminderSecond/en.ftl',
        'lib/senders/emails/templates/downloadSubscription/en.ftl',
        'lib/senders/emails/templates/fraudulentAccountDeletion/en.ftl',
        // 'lib/senders/emails/templates/inactiveAccountFinalWarning/en.ftl',
        // 'lib/senders/emails/templates/inactiveAccountFirstWarning/en.ftl',
        // 'lib/senders/emails/templates/inactiveAccountSecondWarning/en.ftl',
        // 'lib/senders/emails/templates/lowRecoveryCodes/en.ftl',
        // 'lib/senders/emails/templates/newDeviceLogin/en.ftl',
        // 'lib/senders/emails/templates/passwordChangeRequired/en.ftl',
        // 'lib/senders/emails/templates/passwordChanged/en.ftl',
        // 'lib/senders/emails/templates/passwordForgotOtp/en.ftl',
        // 'lib/senders/emails/templates/passwordReset/en.ftl',
        // 'lib/senders/emails/templates/passwordResetAccountRecovery/en.ftl',
        // 'lib/senders/emails/templates/passwordResetRecoveryPhone/en.ftl',
        // 'lib/senders/emails/templates/passwordResetWithRecoveryKeyPrompt/en.ftl',
        // 'lib/senders/emails/templates/postAddAccountRecovery/en.ftl',
        // 'lib/senders/emails/templates/postAddLinkedAccount/en.ftl',
        // 'lib/senders/emails/templates/postAddRecoveryPhone/en.ftl',
        // 'lib/senders/emails/templates/postAddTwoStepAuthentication/en.ftl',
        // 'lib/senders/emails/templates/postChangeAccountRecovery/en.ftl',
        // 'lib/senders/emails/templates/postChangePrimary/en.ftl',
        // 'lib/senders/emails/templates/postChangeRecoveryPhone/en.ftl',
        // 'lib/senders/emails/templates/postChangeTwoStepAuthentication/en.ftl',
        // 'lib/senders/emails/templates/postConsumeRecoveryCode/en.ftl',
        // 'lib/senders/emails/templates/postNewRecoveryCodes/en.ftl',
        // 'lib/senders/emails/templates/postRemoveAccountRecovery/en.ftl',
        // 'lib/senders/emails/templates/postRemoveRecoveryPhone/en.ftl',
        // 'lib/senders/emails/templates/postRemoveSecondary/en.ftl',
        // 'lib/senders/emails/templates/postRemoveTwoStepAuthentication/en.ftl',
        // 'lib/senders/emails/templates/postSigninRecoveryCode/en.ftl',
        // 'lib/senders/emails/templates/postSigninRecoveryPhone/en.ftl',
        // 'lib/senders/emails/templates/postVerify/en.ftl',
        // 'lib/senders/emails/templates/postVerifySecondary/en.ftl',
        // 'lib/senders/emails/templates/recovery/en.ftl',
        'lib/senders/emails/templates/subscriptionAccountDeletion/en.ftl',
        'lib/senders/emails/templates/subscriptionAccountReminderFirst/en.ftl',
        'lib/senders/emails/templates/subscriptionAccountReminderSecond/en.ftl',
        'lib/senders/emails/templates/subscriptionCancellation/en.ftl',
        'lib/senders/emails/templates/subscriptionDowngrade/en.ftl',
        'lib/senders/emails/templates/subscriptionEndingReminder/en.ftl',
        'lib/senders/emails/templates/subscriptionFailedPaymentsCancellation/en.ftl',
        'lib/senders/emails/templates/subscriptionFirstInvoice/en.ftl',
        'lib/senders/emails/templates/subscriptionPaymentExpired/en.ftl',
        'lib/senders/emails/templates/subscriptionPaymentFailed/en.ftl',
        'lib/senders/emails/templates/subscriptionPaymentProviderCancelled/en.ftl',
        'lib/senders/emails/templates/subscriptionReactivation/en.ftl',
        'lib/senders/emails/templates/subscriptionRenewalReminder/en.ftl',
        'lib/senders/emails/templates/subscriptionReplaced/en.ftl',
        'lib/senders/emails/templates/subscriptionSubsequentInvoice/en.ftl',
        'lib/senders/emails/templates/subscriptionUpgrade/en.ftl',
        'lib/senders/emails/templates/subscriptionsPaymentExpired/en.ftl',
        'lib/senders/emails/templates/subscriptionsPaymentProviderCancelled/en.ftl',
        // 'lib/senders/emails/templates/unblockCode/en.ftl',
        // 'lib/senders/emails/templates/verificationReminderFinal/en.ftl',
        // 'lib/senders/emails/templates/verificationReminderFirst/en.ftl',
        // 'lib/senders/emails/templates/verificationReminderSecond/en.ftl',
        // 'lib/senders/emails/templates/verify/en.ftl',
        // 'lib/senders/emails/templates/verifyAccountChange/en.ftl',
        // 'lib/senders/emails/templates/verifyLogin/en.ftl',
        // 'lib/senders/emails/templates/verifyLoginCode/en.ftl',
        // 'lib/senders/emails/templates/verifyPrimary/en.ftl',
        // 'lib/senders/emails/templates/verifySecondaryCode/en.ftl',
        // 'lib/senders/emails/templates/verifyShortCode/en.ftl',
      ],
      dest: 'public/locales/en/auth.ftl',
    },
    'ftl-test': {
      src: [
        'test/local/senders/emails/auth.ftl',
        'test/local/senders/emails/**/en.ftl',
      ],
      dest: 'test/temp/public/locales/en/auth.ftl',
    },
  });

  grunt.config('watch', {
    ftl: {
      files: ['lib/l10n/server.ftl', 'lib/**/en.ftl'],
      tasks: ['merge-ftl'],
      options: {
        interrupt: true,
      },
    },
  });

  grunt.registerTask('merge-ftl', ['copy:branding-ftl', 'concat:ftl']);
  grunt.registerTask('merge-ftl:test', ['concat:ftl-test']);
  grunt.registerTask('watch-ftl', ['watch:ftl']);
};
