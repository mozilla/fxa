/* This is code to allow one instance of 123done.org to run against
 * all browserid environments - production, staging, development, and
 * ephemeral testing deployments.
 *
 * The details of this code aren't very important, but what it basically
 * does is populate res.persona_url with the appropriate url based on the
 * Host headers sent with the request.
 */
var url = require('url'),
 crypto = require('crypto');

var pp = require('postprocess')(function(req, buf) {
  var re = new RegExp('https://login.persona.org', 'g');
  return buf.replace(re, req.persona_url);
});

module.exports = function(req, res, next) {
  // determine the URL of the browserid deployment we'll use
  req.headers.host = req.headers.host || '123done.org';
  var host = req.headers.host.split(':')[0].toString();
  if (process.env['PERSONA_URL']) req.persona_url = process.env['PERSONA_URL'];
  else if (host === 'beta.123done.org') req.persona_url = 'https://login.anosrep.org';
  else if (host === 'dev.123done.org') req.persona_url = 'https://login.dev.anosrep.org';
  else if (/\.123done\.org$/.test(host)) {
    req.persona_url = 'https://' + host.substr(0, host.length - 12) + '.personatest.org';
  } else {
    req.persona_url = 'https://login.persona.org';
  }

  // concoct a unique identifier for the (virtual) instance
  // of 123done being hit
  var hash = crypto.createHash('md5');
  hash.update(req.headers.host);
  req.deployment_id = hash.digest('hex').slice(0, 6);

  // and determine the hostname of the verifier
  req.verifier_host = url.parse(req.persona_url).hostname;

  console.log(req.deployment_id, req.persona_url, req.verifier_host);

  pp(req, res, next);
};
