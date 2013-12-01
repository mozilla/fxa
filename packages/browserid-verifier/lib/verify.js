/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const
log = require('./log'),
Verifier = require('browserid-local-verify'),
config = require('./config'),
_ = require('underscore');

var verifier = new Verifier({
  httpTimeout: config.get('httpTimeout'),
  insecureSSL: config.get('insecureSSL')
});

verifier.on('debug', function(x) {
  log.debug(x);
});

function verify(req, res) {
  req.query = req.query || {};
  req.body = req.body || {};

  var assertion = req.query.assertion ? req.query.assertion : req.body.assertion;
  var audience = req.query.audience ? req.query.audience : req.body.audience;
  var forceIssuer = req.query.experimental_forceIssuer ? req.query.experimental_forceIssuer : req.body.experimental_forceIssuer;
  var allowUnverified = req.query.experimental_allowUnverified ? req.query.experimental_allowUnverified : req.body.experimental_allowUnverified;

  if (!(assertion && audience)) {
    // why couldn't we extract these guys?  Is it because the request parameters weren't encoded as we expect? GH-643
    const want_ct = [ 'application/x-www-form-urlencoded', 'application/json' ];
    var reason;
    try {
      var ct = req.headers['content-type'];
      if (ct.indexOf(';') !== -1) {
        ct = ct.substr(0, ct.indexOf(';'));
      }
      if (want_ct.indexOf(ct) === -1) {
        throw new Error("wrong content type");
      }
    } catch (e) {
      reason = "Content-Type expected to be one of: " + want_ct.join(", ");
      log.info('verify', {
        result: 'failure',
        reason: reason,
        rp: audience
      });
      return res.json({ status: "failure", reason: reason}, 415);
    }
    reason = "need assertion and audience";
    log.info('verify', {
      result: 'failure',
      reason: reason,
      rp: audience
    });
    return res.json({ status: "failure", reason: reason}, 400);
  }

  var trustedIssuers = [ ];
  if (forceIssuer) {
    trustedIssuers.push(forceIssuer);
  }

  var startTime = new Date();
  verifier.verify({
    assertion: assertion,
    audience: audience,
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
        rp: audience
      });
    } else {
      if (allowUnverified) {
        if (r.idpClaims && r.idpClaims['unverified-email']) {
          r['unverified-email'] = r.idpClaims['unverified-email'];
        }
      }

      res.json(_.extend(r, {
        status : "okay",
        audience : audience, // NOTE: we return the audience formatted as the RP provided it, not normalized in any way.
        expires : new Date(r.expires).valueOf()
      }));

      log.info('verify', {
        result: 'success',
        rp: r.audience
      });
    }
  });
}

module.exports = verify;
