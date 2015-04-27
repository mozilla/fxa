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
      verificationUrl: 'https://accounts.firefox.com/v1/verify_email',
      passwordResetUrl: 'https://accounts.firefox.com/v1/complete_reset_password',
      accountUnlockUrl: 'https://accounts.firefox.com/v1/complete_unlock_account'
    }
  }
)
