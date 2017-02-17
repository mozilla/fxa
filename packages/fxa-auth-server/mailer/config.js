/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')

var convict = require('convict')
var DEFAULT_SUPPORTED_LANGUAGES = require('fxa-shared').l10n.supportedLanguages

var conf = convict({
  env: {
    doc: 'The current node.js environment',
    default: 'prod',
    format: [ 'dev', 'test', 'stage', 'prod' ],
    env: 'NODE_ENV'
  },
  port: {
    env: 'MAILER_PORT',
    format: 'port',
    default: 10136
  },
  host: {
    env: 'MAILER_HOST',
    format: 'ipaddress',
    default: '127.0.0.1'
  },
  db: {
    backend: {
      default: 'httpdb',
      env: 'DB_BACKEND'
    },
    connectionRetry: {
      default: '10 seconds',
      env: 'DB_CONNECTION_RETRY',
      doc: 'Time in milliseconds to retry a database connection attempt',
      format: 'duration'
    },
    connectionTimeout: {
      default: '5 minutes',
      env: 'DB_CONNECTION_TIMEOUT',
      doc: 'Timeout in milliseconds after which the mailer will stop trying to connect to the database',
      format: 'duration'
    }
  },
  httpdb: {
    url: {
      doc: 'database api url',
      default: 'http://127.0.0.1:8000',
      env: 'HTTPDB_URL'
    }
  },
  contentServer: {
    url: {
      doc: 'The url of the corresponding fxa-content-server instance',
      default: 'http://127.0.0.1:3030',
      env: 'CONTENT_SERVER_URL'
    }
  },
  logging: {
    app: {
      default: 'fxa-auth-mailer'
    },
    fmt: {
      format: ['heka', 'pretty'],
      default: 'heka'
    },
    level: {
      env: 'LOG_LEVEL',
      default: 'info'
    },
    debug: {
      env: 'LOG_DEBUG',
      default: false
    }
  },
  locales: {
    default: DEFAULT_SUPPORTED_LANGUAGES,
    doc: 'Available locales',
    format: Array,
    env: 'SUPPORTED_LANGUAGES'
  },
  defaultLanguage: {
    doc: 'Default locale language',
    format: String,
    default: 'en'
  },
  verificationReminders: {
    reminderTimeFirst: {
      doc: 'Milliseconds since account creation after which the first reminder is sent',
      default: '48 hours',
      format: 'duration'
    },
    reminderTimeSecond: {
      doc: 'Milliseconds since account creation after which the second reminder is sent',
      default: '168 hours',
      format: 'duration'
    },
    reminderTimeFirstOutdated: {
      doc: 'Milliseconds since account creation after which the reminder should not be sent',
      default: '167 hours',
      format: 'duration'
    },
    reminderTimeSecondOutdated: {
      doc: 'Milliseconds since account creation after which the reminder should not be sent',
      default: '300 hours',
      format: 'duration'
    },
    pollFetch: {
      doc: 'Number of reminder record to fetch when polling.',
      format: Number,
      default: 20
    },
    pollTime: {
      doc: 'Poll duration in milliseconds. 0 is disabled.',
      format: 'duration',
      default: '30 minutes'
    }
  },
  mail: {
    host: {
      doc: 'The ip address the server should bind',
      default: '127.0.0.1',
      format: 'ipaddress',
      env: 'IP_ADDRESS'
    },
    port: {
      doc: 'The port the server should bind',
      default: 9999,
      format: 'port',
      env: 'PORT'
    },
    secure: {
      doc: 'set to true to use a secure connection',
      format: Boolean,
      env: 'MAIL_HTTPS_SECURE',
      default: false
    },
    sender: {
      doc: 'email address of the sender',
      default: 'accounts@firefox.com',
      env: 'SMTP_SENDER'
    },
    verificationUrl: {
      doc: 'Deprecated. uses contentServer.url',
      format: String,
      default: undefined
    },
    verifyLoginUrl: {
      doc: 'Deprecated. uses contentServer.url',
      format: String,
      default: undefined
    },
    passwordResetUrl: {
      doc: 'Deprecated. uses contentServer.url',
      format: String,
      default: undefined
    },
    initiatePasswordResetUrl: {
      doc: 'Deprecated. uses contentServer.url',
      format: String,
      default: undefined
    },
    initiatePasswordChangeUrl: {
      doc: 'Deprecated. uses contentServer.url',
      format: String,
      default: undefined
    },
    syncUrl: {
      doc: 'url to Sync product page',
      format: String,
      default: 'https://www.mozilla.org/firefox/sync/'
    },
    androidUrl: {
      doc: 'url to Android product page',
      format: String,
      default: 'https://app.adjust.com/2uo1qc?campaign=fxa-conf-email&adgroup=android&creative=button'
    },
    iosUrl: {
      doc: 'url to IOS product page',
      format: String,
      default: 'https://app.adjust.com/2uo1qc?campaign=fxa-conf-email&adgroup=ios&creative=button&fallback=https%3A%2F%2Fitunes.apple.com%2Fapp%2Fapple-store%2Fid989804926%3Fpt%3D373246%26ct%3Dadjust_tracker%26mt%3D8'
    },
    supportUrl: {
      doc: 'url to Mozilla Support product page',
      format: String,
      default: 'https://support.mozilla.org/kb/im-having-problems-with-my-firefox-account'
    },
    privacyUrl: {
      doc: 'url to Mozilla privacy page',
      format: String,
      default: 'https://www.mozilla.org/privacy'
    },
    passwordManagerInfoUrl: {
      doc: 'url to Firefox password manager information',
      format: String,
      default: 'https://support.mozilla.org/kb/password-manager-remember-delete-change-and-import#w_viewing-and-deleting-passwords'
    }
  },
  sesConfigurationSet: {
    doc: ('AWS SES Configuration Set for SES Event Publishing. If defined, ' +
          'X-SES-MESSAGE-TAGS headers will be added to emails. Only ' +
          'intended for Production/Stage use.'),
    format: String,
    default: undefined,
    env: 'SES_CONFIGURATION_SET'
  }
})

var envConfig = path.join(__dirname, 'config', conf.get('env') + '.json')
var files = (envConfig + ',' + process.env.CONFIG_FILES)
  .split(',').filter(fs.existsSync)
conf.loadFile(files)

process.env.NODE_ENV = conf.get('env')

var options = {
  strict: true
}

conf.validate(options)

var contentServerUrl = conf.get('contentServer.url')
conf.set('mail.verificationUrl', contentServerUrl + '/v1/verify_email')
conf.set('mail.passwordResetUrl', contentServerUrl + '/v1/complete_reset_password')
conf.set('mail.initiatePasswordResetUrl', contentServerUrl + '/reset_password')
conf.set('mail.initiatePasswordChangeUrl', contentServerUrl + '/settings/change_password')
conf.set('mail.verifyLoginUrl', contentServerUrl + '/complete_signin')
conf.set('mail.reportSignInUrl', contentServerUrl + '/reject_unblock_code')

// Extra Validations
if (conf.get('locales').indexOf(conf.get('defaultLanguage')) === -1) {
  throw new Error('defaultLanguage must be in supportedLanguages')
}

module.exports = conf
