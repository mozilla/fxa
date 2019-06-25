/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const util = require('util');
const url = require('url');

const localeQuirks = require('./localeQuirks');

const errors = {};
function reportError(lang, msg) {
  if (!errors[lang]) {
    errors[lang] = [];
  }
  errors[lang].push(msg);
}

function langFromEmail(email) {
  // is like 'deadbeef-es@...' or 'deadbeef-es-AR@...'
  return email.split('@')[0].match(/^[^-]*-([^-]*(?:-[^-]*)?)/)[1];
}

function ensureHeader(headers, key, lang) {
  if (!headers[key]) {
    reportError(lang, `Missing header ${key}`);
  }
}

const messageContentChecks = [
  {
    subject: 'Verify your Firefox Account',
    pathname: '/v1/verify_email',
    args: ['code', 'service', 'uid'],
    xheaders: ['x-service-id', 'x-uid', 'x-verify-code'],
  },
  {
    subject: 'Firefox Account Verified',
    pathname: '/firefox/sync/',
    args: ['utm_source', 'utm_medium', 'utm_campaign'],
    xheaders: [],
  },
  {
    subject: 'New sign-in to Sync',
    pathname: '/settings/change_password',
    args: ['email'],
    xheaders: [],
  },
  {
    subject: 'Your Firefox Account password has been changed',
    pathname: '/reset_password',
    args: ['email', 'reset_password_confirm'],
    xheaders: [],
  },
  {
    subject: 'Reset your Firefox Account password',
    pathname: '/v1/complete_reset_password',
    args: ['code', 'email', 'token'],
    xheaders: ['x-recovery-code'],
  },
  {
    subject: 'Your Firefox Account password has been reset',
    pathname: '/reset_password',
    args: ['email', 'reset_password_confirm'],
    xheaders: [],
  },
];

function ensureSubjectLang(lang, subject, expectedSubject) {
  // If it's listed in quirks, expect 'en' content equivalent
  const quirks = localeQuirks[expectedSubject];
  if (quirks && quirks[lang]) {
    if (subject !== expectedSubject) {
      // en-GB is almost identical to en, except for... fugly
      const en_sync = 'A new device is now syncing to your Firefox Account';
      const en_gb_sync =
        'A new device is now synchronising to your Firefox Account';
      if (
        !(
          lang === 'en-GB' &&
          expectedSubject === en_sync &&
          subject === en_gb_sync
        )
      ) {
        reportError(
          lang,
          util.format(
            'strings should be equal: "%s" vs. "%s"',
            subject,
            expectedSubject
          )
        );
      }
    }
  } else {
    if (subject === expectedSubject) {
      reportError(
        lang,
        util.format(
          'strings should not be equal:  "%s" vs. "%s"',
          subject,
          expectedSubject
        )
      );
    }
  }
}

function checkContent(mail, idx) {
  const contentChecks = messageContentChecks[idx];
  const lang = langFromEmail(mail.headers.to);
  ensureSubjectLang(lang, mail.subject, contentChecks.subject);

  const missing = [];
  contentChecks.xheaders.forEach(xheader => {
    if (!mail.headers[xheader]) {
      missing.push(xheader);
    }
  });

  if (missing.length !== 0) {
    reportError(lang, `missing x-headers ${JSON.stringify(missing)}`);
  }

  const xlink = url.parse(mail.headers['x-link'], true);
  if (xlink.pathname !== contentChecks.pathname) {
    reportError(
      lang,
      util.format(
        'wrong xlink pathname: %s vs %s',
        xlink.pathname,
        contentChecks.pathname
      )
    );
  }

  const args = JSON.stringify(contentChecks.args.sort());
  const queryArgs = JSON.stringify(Object.keys(xlink.query).sort());
  if (args !== queryArgs) {
    reportError(
      lang,
      `${mail.headers['x-link']} - args mismatch ${args} - ${queryArgs}`
    );
  }
}

function ensureNonZeroContent(body, errmsg, lang) {
  if (body.length === 0) {
    reportError(lang, `${errmsg} has zero length`);
  }
}

function verifyMailbox(mbox) {
  const lang = langFromEmail(mbox[0].headers.to);
  const expectedMessageCount = 6;
  if (mbox.length !== expectedMessageCount) {
    return reportError(lang, `Missing email response, count: ${mbox.length}`);
  }

  mbox.forEach((mail, idx) => {
    const requiredHeaders = [
      'to',
      'from',
      'date',
      'subject',
      'x-link',
      'content-language',
      'content-type',
      'dkim-signature',
    ];

    const lang = langFromEmail(mail.headers.to);
    requiredHeaders.forEach(key => {
      ensureHeader(mail.headers, key, lang);
    });

    const quirks = localeQuirks['content-language'];
    if (quirks[lang]) {
      if ('en-US' !== mail.headers['content-language']) {
        reportError(lang, 'content-language header is not en-US');
      }
    } else {
      // See https://github.com/mozilla/fxa-content-server-l10n/issues/44 about sr-LATN
      if (lang !== mail.headers['content-language'] && lang !== 'sr-LATN') {
        const fmt =
          'content-language header is not locale specific for %s (%s)';
        reportError(lang, util.format(fmt, lang, mail.headers.subject));
      }
    }

    ensureNonZeroContent(mail.html.length, 'mail message html', lang);
    ensureNonZeroContent(mail.text.length, 'mail message text', lang);

    checkContent(mail, idx);
  });
}

module.exports = function validateEmail(messages) {
  Object.keys(messages).forEach(key => {
    verifyMailbox(messages[key]);
  });
  return errors;
};
