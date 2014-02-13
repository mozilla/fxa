/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var fs = require('fs');
var path = require('path');
var config = require('./configuration').root();
var handlebars = require('handlebars');
var i18n = require('./i18n')(config.i18n);

function t(str) { return str; }

function loadTemplate (name) {
  return fs.readFileSync(path.join(config.template_path, name));
}

// Make the 'gettext' function available in the templates.
handlebars.registerHelper('t', function(string) {
  if (this.l10n) {
    return this.l10n.format(this.l10n.gettext(string), this);
  }
  return string;
});

// a map of all the different emails we send
var templates = {
  verify: {
    subject: t('Confirm Your Account'),
    text: loadTemplate('email/verify.txt'),
    html: loadTemplate('email/verify.html')
  },
  reset: {
    subject: t('Reset Password Request'),
    text: loadTemplate('email/reset.txt'),
    html: loadTemplate('email/reset.html')
  }
};

// now turn file contents into compiled templates
Object.keys(templates).forEach(function(type) {
  templates[type].text = handlebars.compile(templates[type].text.toString());
  templates[type].html = handlebars.compile(templates[type].html.toString());
});

module.exports = function (lang, type) {
  var template = templates[type];
  if (!template) {
    throw new Error('Unknown template type: ' + type);
  }
  var l10n = i18n.localizationContext(lang);
  var values = {
    l10n: l10n,
    link: '{{{link}}}',
    email: '{{{email}}}'
  };

  return {
    subject: l10n.gettext(template.subject),
    html: template.html(values),
    text: template.text(values)
  };
};
