/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
log = require('./log'),
Verifier = require('browserid-local-verify'),
config = require('./config'),
_ = require('underscore'),
util = require('util');

var verifier = new Verifier({
  httpTimeout: config.get('httpTimeout'),
  insecureSSL: config.get('insecureSSL')
});

verifier.on('debug', function(x) {
  log.debug(x);
});

function validateTrustedIssuers(obj) {
  var ti = obj.trustedIssuers;
  if (!ti) {
    return [];
  }
  if (!_.isArray(ti)) {
    throw {
      reason: "trusted issuers must be an array",
      code: 400
    };
  }

  ti.forEach(function(hostname) {
    if (typeof hostname !== 'string') {
      throw {
        reason: "trusted issuers must be an array of strings",
        code: 400
      };
    }
  });
  return ti;
}

function verify(req, res) {
  try {
    // content-type must be application/json
    var ct = req.headers['content-type'] || 'none';
    if (ct.indexOf('application/json') !== 0) {
      throw {
        reason: util.format("Unsupported Content-Type: %s (expected application/json)", ct),
        code: 415
      };
    }

    req.body = req.body || {};

    // assertion and audience are required
    [ 'assertion', 'audience' ].forEach(function(field) {
      if (!req.body[field]) {
        throw {
          reason: util.format("missing %s parameter", field),
          code: 400
        };
      }
    });

    // validate and extract trusted issuers
    var trustedIssuers = validateTrustedIssuers(req.body);

    var startTime = new Date();
    verifier.verify({
      assertion: req.body.assertion,
      audience: req.body.audience,
      trustedIssuers: trustedIssuers,
      fallback: config.get('fallback')
    }, function (err, r) {
      var reqTime = new Date() - startTime;
      log.info('assertion_verification_time', reqTime);

      if (err) {
        log.info("assertion_failure");
        res.json({"status":"failure", reason: err}, 200);  //Could be 500 or 200 OK if invalid cert
        log.info('verify', {
          result: 'failure',
          reason: err,
          rp: req.body.audience
        });
      } else {
        res.json(_.extend(r, {
          status : "okay",
          audience : req.body.audience, // NOTE: we return the audience formatted as the RP provided it, not normalized in any way.
          expires : new Date(r.expires).valueOf()
        }));

        log.info('verify', {
          result: 'success',
          rp: r.audience
        });
      }
    });
  } catch(err) {
    var reason = err.reason ? err.reason : err.toString();

    log.info('verify', {
      result: 'failure',
      reason: reason,
      rp: req.body.audience
    });

    res.json({
      status: 'failure',
      reason: reason
    }, err.code ? err.code : 500);
  }
}

module.exports = verify;
