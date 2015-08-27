module.exports = require('rc')(
  'fxa_auth_mailer',
  {
    port: 1810,
    logLevel: 'info',
    locales: ['en', 'de'],
    defaultLanguage: 'en',
    mail: {
      host: '127.0.0.1',
      port: 9999,
      secure: false,
      sender: 'accounts@firefox.com',
      verificationUrl: 'https://accounts.firefox.com/verify_email',
      passwordResetUrl: 'https://accounts.firefox.com/complete_reset_password',
      accountUnlockUrl: 'https://accounts.firefox.com/complete_unlock_account',
      initiatePasswordResetUrl: 'https://accounts.firefox.com/reset_password',
      initiatePasswordChangeUrl: 'https://accounts.firefox.com/settings/change_password',
      syncUrl: 'https://www.mozilla.org/en-US/firefox/sync/',
      androidUrl: 'https://www.mozilla.org/en-US/firefox/android/',
      iosUrl: 'https://www.mozilla.org/en-US/firefox/ios/',
      supportUrl: 'https://support.mozilla.org'
    }
  }
)
