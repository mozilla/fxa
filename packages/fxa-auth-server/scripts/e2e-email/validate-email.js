/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util')
const url = require('url')

const localeQuirks = require('./localeQuirks')

var errors = {}
function reportError(lang, msg) {
  if (!errors[lang]) {
    errors[lang] = []
  }
  errors[lang].push(msg)
}

function langFromEmail(email) {
  // is like 'deadbeef-es@...' or 'deadbeef-es-AR@...'
  return email.split('@')[0].match(/^[^-]*-([^-]*(?:-[^-]*)?)/)[1]
}

function ensureHeader(headers, key, lang) {
  if (!headers[key]) {
    reportError(lang, 'Missing header ' + key)
  }
}

var messageContentChecks = [
  {
    subject: 'Verify your Firefox Account',
    pathname: '/v1/verify_email',
    args: [ 'code', 'service', 'uid' ],
    xheaders: [ 'x-service-id', 'x-uid', 'x-verify-code' ],
  },
  {
    subject: 'A new device is now syncing to your Firefox Account',
    pathname: '/v1/reset_password',
    args: [ 'email' ],
    xheaders: [],
  },
  {
    subject: 'Your Firefox Account password has been changed',
    pathname: '/v1/reset_password',
    args: [ 'email' ],
    xheaders: [],
  },
  {
    subject: 'Reset your Firefox Account password',
    pathname: '/v1/complete_reset_password',
    args: [ 'code', 'email', 'token' ],
    xheaders: [ 'x-recovery-code' ],
  },
  {
    subject: 'Your Firefox Account password has been reset',
    pathname: '/v1/reset_password',
    args: [ 'email' ],
    xheaders: [],
  },
  {
    subject: 'Re-verify your Firefox Account',
    pathname: '/v1/complete_unlock_account',
    args: [ 'code', 'uid' ],
    xheaders: [ 'x-unlock-code', 'x-uid' ],
  }
]

function ensureSubjectLang(lang, subject, expectedSubject) {
  // If it's listed in quirks, expect 'en' content equivalent
  var quirks = localeQuirks[expectedSubject]
  if (quirks && quirks[lang]) {
    if (subject !== expectedSubject) {
      // en-GB is almost identical to en, except for... fugly
      var en_sync = 'A new device is now syncing to your Firefox Account'
      var en_gb_sync = 'A new device is now synchronising to your Firefox Account'
      if (!(lang === 'en-GB' && expectedSubject === en_sync && subject === en_gb_sync)) {
        reportError(lang, util.format('strings should be equal: "%s" vs. "%s"',
                                      subject, expectedSubject))
      }
    }
  } else {
    if (subject === expectedSubject) {
      reportError(lang, util.format('strings should not be equal:  "%s" vs. "%s"',
                                    subject, expectedSubject))
    }
  }
}

function checkContent(mail, idx) {
  var contentChecks = messageContentChecks[idx]
  var lang = langFromEmail(mail.headers.to)
  ensureSubjectLang(lang, mail.subject, contentChecks.subject)

  var missing = []
  contentChecks.xheaders.forEach(function(xheader) {
    if (!mail.headers[xheader]) {
      missing.push(xheader)
    }
  })

  if (missing.length !== 0) {
    reportError(lang, 'missing x-headers ' + JSON.stringify(missing))
  }

  var xlink = url.parse(mail.headers['x-link'], true)
  if (xlink.pathname !== contentChecks.pathname) {
    reportError(lang, util.format('wrong xlink pathname: %s vs %s',
                                  xlink.pathname, contentChecks.pathname))
  }

  var args = JSON.stringify(contentChecks.args.sort())
  var queryArgs = JSON.stringify(Object.keys(xlink.query).sort())
  if (args !== queryArgs) {
    reportError(lang, 'args mismatch ' + args + ' - ' + queryArgs)
  }
}

function ensureNonZeroContent(body, errmsg, lang) {
  if (body.length === 0) {
    reportError(lang, errmsg + ' has zero length')
  }
}

function verifyMailbox(mbox) {
  var lang = langFromEmail(mbox[0].headers.to)
  if (mbox.length !== 6) {
    return reportError(lang, 'Missing email response, count: ' + mbox.length)
  }

  mbox.forEach(function(mail, idx) {
    var requiredHeaders = [
      'to',
      'from',
      'date',
      'subject',
      'x-link',
      'content-language',
      'content-type',
      'dkim-signature'
    ]

    var lang = langFromEmail(mail.headers.to)
    requiredHeaders.forEach(function(key) {
      ensureHeader(mail.headers, key, lang)
    })

    var quirks = localeQuirks['content-language']
    if (quirks[lang]) {
      if ('en-US' !== mail.headers['content-language']) {
        reportError(lang, 'content-language header is not en-US')
      }
    } else {
      // See https://github.com/mozilla/fxa-content-server-l10n/issues/44 about sr-LATN
      if (lang !== mail.headers['content-language'] && lang !== 'sr-LATN') {
        var fmt = 'content-language header is not locale specific for %s (%s)'
        reportError(lang, util.format(fmt, lang, mail.headers.subject))
      }
    }

    ensureNonZeroContent(mail.html.length, 'mail message html', lang)
    ensureNonZeroContent(mail.text.length, 'mail message text', lang)

    checkContent(mail, idx)
  })
}

module.exports = function validateEmail(messages) {
  Object.keys(messages)
    .forEach(function(key) {
      verifyMailbox(messages[key])
    })
  return errors
}
