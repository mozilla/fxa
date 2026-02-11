/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  });

  grunt.config('copy', {
    'branding-ftl': {
      nonull: true,
      src: '../../../libs/shared/l10n/src/lib/branding.ftl',
      dest: 'public/locales/en/branding.ftl',
    },
  });

  grunt.config('concat', {
    'emails-ftl': {
      src: [
        // Until we have fully migrated all email sending off of auth-server, we will
        // maintain a list of ftl files to extract here. As we migrate over to using
        // the templates from this library, we should comment the template from this list,
        // and make sure that is commented out in auth server's list. Doing so will avoid
        // duplication of l10n strings, which causes our translators uncessary rework...

        // Once all email rendering has been migrated, just use this pattern!
        // 'src/**/en.ftl',

        'src/layouts/fxa/en.ftl',
        // 'src/layouts/subscription/en.ftl',

        'src/partials/accountDeletionInfoBlock/en.ftl',
        'src/partials/appBadges/en.ftl',
        'src/partials/automatedEmailChangePassword/en.ftl',
        'src/partials/automatedEmailInactiveAccount/en.ftl',
        'src/partials/automatedEmailNoAction/en.ftl',
        'src/partials/automatedEmailNotAuthorized/en.ftl',
        'src/partials/automatedEmailRecoveryKey/en.ftl',
        'src/partials/automatedEmailResetPassword/en.ftl',
        'src/partials/automatedEmailResetPasswordTwoFactor/en.ftl',
        'src/partials/bannerWarning/en.ftl',
        'src/partials/brandMessaging/en.ftl',
        'src/partials/button/en.ftl',
        // 'src/partials/cancellationSurvey/en.ftl',
        'src/partials/changePassword/en.ftl',
        // 'src/partials/icon/en.ftl',
        'src/partials/manageAccount/en.ftl',
        // 'src/partials/paymentPlanDetails/en.ftl',
        // 'src/partials/paymentProvider/en.ftl',
        // 'src/partials/subscriptionCharges/en.ftl',
        // 'src/partials/subscriptionSupport/en.ftl',
        // 'src/partials/subscriptionSupportContact/en.ftl',
        // 'src/partials/subscriptionSupportGetHelp/en.ftl',
        // 'src/partials/subscriptionUpdateBillingEnsure/en.ftl',
        // 'src/partials/subscriptionUpdateBillingTry/en.ftl',
        // 'src/partials/subscriptionUpdatePayment/en.ftl',
        'src/partials/support/en.ftl',
        'src/partials/userDevice/en.ftl',
        'src/partials/userInfo/en.ftl',
        'src/partials/userLocation/en.ftl',
        // 'src/partials/viewInvoice/en.ftl',

        // Skip translation. Internal FxA email. Not user facing.
        // 'src/templates/adminResetAccounts/en.ftl',
        'src/templates/cadReminderFirst/en.ftl',
        'src/templates/cadReminderSecond/en.ftl',
        // 'src/templates/downloadSubscription/en.ftl',
        // 'src/templates/fraudulentAccountDeletion/en.ftl',
        'src/templates/inactiveAccountFinalWarning/en.ftl',
        'src/templates/inactiveAccountFirstWarning/en.ftl',
        'src/templates/inactiveAccountSecondWarning/en.ftl',
        'src/templates/lowRecoveryCodes/en.ftl',
        'src/templates/newDeviceLogin/en.ftl',
        'src/templates/passwordChangeRequired/en.ftl',
        'src/templates/passwordChanged/en.ftl',
        'src/templates/passwordForgotOtp/en.ftl',
        'src/templates/passwordReset/en.ftl',
        'src/templates/passwordResetAccountRecovery/en.ftl',
        'src/templates/passwordResetRecoveryPhone/en.ftl',
        'src/templates/passwordResetWithRecoveryKeyPrompt/en.ftl',
        'src/templates/postAddAccountRecovery/en.ftl',
        'src/templates/postAddLinkedAccount/en.ftl',
        'src/templates/postAddRecoveryPhone/en.ftl',
        'src/templates/postAddTwoStepAuthentication/en.ftl',
        'src/templates/postChangeAccountRecovery/en.ftl',
        'src/templates/postChangePrimary/en.ftl',
        'src/templates/postChangeRecoveryPhone/en.ftl',
        'src/templates/postChangeTwoStepAuthentication/en.ftl',
        'src/templates/postConsumeRecoveryCode/en.ftl',
        'src/templates/postNewRecoveryCodes/en.ftl',
        'src/templates/postRemoveAccountRecovery/en.ftl',
        'src/templates/postRemoveRecoveryPhone/en.ftl',
        'src/templates/postRemoveSecondary/en.ftl',
        'src/templates/postRemoveTwoStepAuthentication/en.ftl',
        'src/templates/postSigninRecoveryCode/en.ftl',
        'src/templates/postSigninRecoveryPhone/en.ftl',
        'src/templates/postVerify/en.ftl',
        'src/templates/postVerifySecondary/en.ftl',
        'src/templates/recovery/en.ftl',
        // 'src/templates/subscriptionAccountDeletion/en.ftl',
        // 'src/templates/subscriptionAccountReminderFirst/en.ftl',
        // 'src/templates/subscriptionAccountReminderSecond/en.ftl',
        // 'src/templates/subscriptionCancellation/en.ftl',
        // 'src/templates/subscriptionDowngrade/en.ftl',
        // 'src/templates/subscriptionEndingReminder/en.ftl',
        // 'src/templates/subscriptionFailedPaymentsCancellation/en.ftl',
        // 'src/templates/subscriptionFirstInvoice/en.ftl',
        // 'src/templates/subscriptionPaymentExpired/en.ftl',
        // 'src/templates/subscriptionPaymentFailed/en.ftl',
        // 'src/templates/subscriptionPaymentProviderCancelled/en.ftl',
        // 'src/templates/subscriptionReactivation/en.ftl',
        'src/templates/subscriptionRenewalReminder/en.ftl',
        // 'src/templates/subscriptionReplaced/en.ftl',
        // 'src/templates/subscriptionSubsequentInvoice/en.ftl',
        // 'src/templates/subscriptionUpgrade/en.ftl',
        // 'src/templates/subscriptionsPaymentExpired/en.ftl',
        // 'src/templates/subscriptionsPaymentProviderCancelled/en.ftl',
        'src/templates/unblockCode/en.ftl',
        'src/templates/verificationReminderFinal/en.ftl',
        'src/templates/verificationReminderFirst/en.ftl',
        'src/templates/verificationReminderSecond/en.ftl',
        'src/templates/verify/en.ftl',
        'src/templates/verifyAccountChange/en.ftl',
        'src/templates/verifyLogin/en.ftl',
        'src/templates/verifyLoginCode/en.ftl',
        'src/templates/verifyPrimary/en.ftl',
        'src/templates/verifySecondaryCode/en.ftl',
        'src/templates/verifyShortCode/en.ftl',
      ],
      dest: 'public/locales/en/emails.ftl',
    },
  });

  grunt.config('watch', {
    ftl: {
      files: ['src/**/en.ftl'],
      tasks: ['l10n-merge'],
      options: {
        interrupt: true,
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('l10n-watch', ['watch:ftl']);
  grunt.registerTask('l10n-merge', ['copy:branding-ftl', 'concat:emails-ftl']);
};
