/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Route to report CSP Violations to metrics
 */

'use strict';
const _ = require('lodash');
const joi = require('joi');
const logger = require('../logging/log')();
const url = require('url');
const validation = require('../validation');

const INTEGER_TYPE = validation.TYPES.INTEGER;
const STRING_TYPE = validation.TYPES.STRING;
const URL_TYPE = validation.TYPES.URL;

const BODY_SCHEMA = {
  'csp-report': joi
    .object()
    .keys({
      // CSP 2, 3 required
      // `eval` and `inline` are specified in CSP 3 and sent by Chrome
      'blocked-uri': URL_TYPE.allow('')
        .allow('asset')
        .allow('blob')
        .allow('data')
        .allow('eval')
        .allow('inline')
        .allow('self')
        .optional(),
      // CSP 2, 3 optional
      'column-number': INTEGER_TYPE.min(0).optional(),
      // CSP 3 required, but not always sent
      disposition: STRING_TYPE.optional(),
      // CSP 2, 3 required
      // Allow 'about:srcdoc', see https://bugzilla.mozilla.org/show_bug.cgi?id=1073952#c22
      'document-uri': URL_TYPE.required().allow('about:srcdoc'),
      // CSP 2 required, but not always sent
      'effective-directive': STRING_TYPE.optional(),
      // CSP 2 optional
      'line-number': INTEGER_TYPE.min(0).optional(),
      // CSP 2, 3 required. However some reports do not contain it.
      'original-policy': STRING_TYPE.optional(),
      // CSP 2, 3 required, can be empty
      referrer: STRING_TYPE.allow('').required(),
      // Not in spec but sent by Firefox, can be empty
      'script-sample': STRING_TYPE.allow('').optional(),
      // CSP 2, 3 optional, can be empty
      'source-file': STRING_TYPE.allow('').optional(),
      // CSP 2, 3 required, but not always sent
      'status-code': INTEGER_TYPE.min(0).optional(),
      // CSP 2, 3 required
      'violated-directive': STRING_TYPE.required(),
    })
    .required(),
};

module.exports = function(options = {}) {
  return {
    method: 'post',
    path: options.path,
    validate: {
      body: BODY_SCHEMA,
    },
    process: function(req, res) {
      res.json({ success: true });

      const today = new Date();
      today.setMinutes(0, 0, 0);
      const report = req.body['csp-report'];

      const entry = {
        agent: req.get('User-Agent'),
        blocked: report['blocked-uri'],
        column: report['column-number'],
        line: report['line-number'],
        referrer: stripPIIFromUrl(report['referrer']),
        sample: report['script-sample'],
        source: stripPIIFromUrl(report['source-file']),
        violated: report['violated-directive'],
      };

      logger.info(options.op, entry);
    },
  };
};

function stripPIIFromUrl(urlToScrub) {
  if (! urlToScrub || ! _.isString(urlToScrub)) {
    return '';
  }

  let parsedUrl;

  try {
    parsedUrl = url.parse(urlToScrub, true);
  } catch (e) {
    // failed to parse the given url
    return '';
  }

  if (! parsedUrl.query.email && ! parsedUrl.query.uid) {
    return urlToScrub;
  }

  delete parsedUrl.query.email;
  delete parsedUrl.query.uid;

  // delete parsedUrl.search or else format returns the old querystring.
  delete parsedUrl.search;

  return url.format(parsedUrl);
}
