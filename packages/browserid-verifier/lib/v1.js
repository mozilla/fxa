/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const log = require('./log')('v1'),
  config = require('./config'),
  _ = require('underscore'),
  util = require('util');

function verify(verifier, req, res) {
  req.query = req.query || {};
  req.body = req.body || {};

  res._summary.api = 1;

  var assertion = req.query.assertion
    ? req.query.assertion
    : req.body.assertion;
  var audience = req.query.audience ? req.query.audience : req.body.audience;
  var forceIssuer = req.query.experimental_forceIssuer
    ? req.query.experimental_forceIssuer
    : req.body.experimental_forceIssuer;
  var allowUnverified = req.query.experimental_allowUnverified
    ? req.query.experimental_allowUnverified
    : req.body.experimental_allowUnverified;

  res._summary.rp = audience;

  if (! (assertion && audience)) {
    // why couldn't we extract these guys?  Is it because the request parameters weren't encoded as we expect? GH-643
    const want_ct = ['application/x-www-form-urlencoded', 'application/json'];
    var reason;
    var ct = 'none';
    try {
      ct = req.headers['content-type'] || ct;
      if (ct.indexOf(';') !== -1) {
        ct = ct.substr(0, ct.indexOf(';'));
      }
      if (want_ct.indexOf(ct) === -1) {
        throw new Error('wrong content type');
      }
    } catch (e) {
      reason = util.format(
        'Unsupported Content-Type: %s (expected ' + want_ct.join(' or ') + ')',
        ct
      );
      log.info('verify', {
        result: 'failure',
        reason: reason,
        rp: audience,
      });
      res._summary.err = e;
      return res.json(415, { status: 'failure', reason: reason });
    }
    reason = util.format(
      'missing %s parameter',
      assertion ? 'audience' : 'assertion'
    );
    log.info('verify', {
      result: 'failure',
      reason: reason,
      rp: audience,
    });
    res._summary.err = reason;
    return res.json(400, { status: 'failure', reason: reason });
  }

  var trustedIssuers = [];
  if (forceIssuer) {
    trustedIssuers.push(forceIssuer);
  }

  var startTime = new Date();
  verifier.verify(
    {
      assertion: assertion,
      audience: audience,
      trustedIssuers: trustedIssuers,
      fallback: config.get('fallback'),
    },
    function(err, r) {
      var reqTime = new Date() - startTime;
      log.info('assertion_verification_time', { reqTime });
      res._summary.assertion_verification_time = reqTime;

      if (err) {
        if (typeof err !== 'string') {
          err = 'unexpected error';
        }
        if (err.indexOf('compute cluster') === 0) {
          log.info('service_failure');
          res.json(503, { status: 'failure', reason: 'service unavailable' });
        } else {
          log.info('assertion_failure');
          res.json(200, { status: 'failure', reason: err }); //Could be 500 or 200 OK if invalid cert
        }
        res._summary.err = err;
        log.info('verify', {
          result: 'failure',
          reason: err,
          assertion: assertion,
          trustedIssuers: trustedIssuers,
          rp: audience,
        });
      } else {
        if (allowUnverified) {
          if (r.idpClaims && r.idpClaims['unverified-email']) {
            r['unverified-email'] = r.idpClaims['unverified-email'];
          }
        }

        res.json(
          _.extend(r, {
            status: 'okay',
            audience: audience, // NOTE: we return the audience formatted as the RP provided it, not normalized in any way.
            expires: new Date(r.expires).valueOf(),
          })
        );

        log.info('verify', {
          result: 'success',
          rp: r.audience,
        });
      }
    }
  );
}

module.exports = verify;
