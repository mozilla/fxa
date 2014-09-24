/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

/**
 * A comment from @zaach (edited by @shane-tomlinson) that explains
 * how email templates work:
 *
 * The content-server is, in essence, *partially applying* values
 * to the template, but the values it applies contain variables
 * that the auth-server must apply values to. The content-server
 * takes generic, unlocalized strings in the template
 * (`{{t "%(email)s, you're one click away from verifying your
 * Firefox Account."}}`) and turns them into generic, localized strings
 * (`{{{email}}}, estás a nada de verificar tu cuenta de Firefox.`)
 * in a new template.
 *
 * To avoid the smart quote problem, we simply have to use the non-escaping
 * `{{{t` when we apply our localized strings rather than `{{t`, which is
 * safe because we're not interpolating the user's actual email address,
 * but the string `{{email}}` (which is the trick for fixing the overlap
 * between values that the content-server and auth-server need to apply).
 *
 * Since the email address is supplied by the user we should escape
 * it using `{{email}}` rather than `{{{email}}}`.
 *
 * For more context, see:
 * https://github.com/mozilla/fxa-content-server/pull/1111#discussion_r12653331
 * https://github.com/mozilla/fxa-content-server/issues/1054
*/


module.exports = function (templatePath, i18n) {

  function t(str) { return str; }

  function loadTemplate (name) {
    return fs.readFileSync(path.join(templatePath, name));
  }

  // Make the 'gettext' function available in the templates.
  handlebars.registerHelper('t', function (string) {
    if (this.gettext && string.fn) {
      // translate a view template from res.render. There is
      // some funky stuff going on here, string has an fn
      // from where the actual string is accesed.
      return this.format(this.gettext(string.fn()), this);
    } else if (this.l10n) {
      return this.l10n.format(this.l10n.gettext(string), this);
    }
    return string;
  });

  // a map of all the different emails we send
  var templates = {
    verify: {
      subject: t('Verify your account'),
      text: loadTemplate('email/verify.txt'),
      html: loadTemplate('email/verify.html')
    },
    reset: {
      subject: t('Reset your password'),
      text: loadTemplate('email/reset.txt'),
      html: loadTemplate('email/reset.html')
    }
  };

  // now turn file contents into compiled templates
  Object.keys(templates).forEach(function (type) {
    templates[type].text = handlebars.compile(templates[type].text.toString());
    templates[type].html = handlebars.compile(templates[type].html.toString());
  });

  return function (lang, type) {
    var template = templates[type];
    if (!template) {
      throw new Error('Unknown template type: ' + type);
    }
    var l10n = i18n.localizationContext(lang);

    // replace %(link)s and %(email)s with variables that are then
    // replaced by the auth server.
    var htmlValues = {
      l10n: l10n,
      link: '{{link}}',
      email: '{{email}}'
    };
    // don't escape values in text emails
    var textValues = {
      l10n: l10n,
      link: '{{{link}}}',
      email: '{{{email}}}'
    };

    return {
      subject: l10n.gettext(template.subject),
      html: template.html(htmlValues),
      text: template.text(textValues)
    };
  };

};
