/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Middleware to take care of CSP. CSP headers are not sent unless config
// option 'csp.enabled' is set (default true in development), with a special
// exception for the /tests/index.html path, which are the frontend unit
// tests.

var uaParser = require('node-uap');
var url = require('url');

function getOrigin(link) {
  var parsed = url.parse(link);
  return parsed.protocol + '//' + parsed.host;
}


function isFxOS1x(agent) {
  // If no os.major, assume FxOS1, it could be the simulator, but we don't
  // really know at this point.
  return agent.os.family === 'Firefox OS' &&
         (! agent.os.major || parseInt(agent.os.major, 10) === 1);
}

function isFennecLessThan24(agent) {
  return agent.os.family === 'Android' &&
         agent.ua.family === 'Firefox Mobile' &&
         // Fennec 25 is the first version w/ the CSP 1.0 parser, see
         // https://bugzilla.mozilla.org/show_bug.cgi?id=858780
         (parseInt(agent.ua.major, 10) < 25);
}

function agentRequiresConnectSrcCopiedToDefaultSrc (uaHeader) {
  if (! uaHeader) {
    return false;
  }

  var agent = uaParser.parse(uaHeader);

  // FxOS < 2.0 and Fennec < 24 do not recognize connectSrc, only xhrSrc.
  // Helmet will convert connectSrc to xhrSrc for Firefox
  // desktop, but not FxOS and Fennec. Add the auth,
  // OAuth, and profile server URLs to defaultSrc so that users
  // can still signin/signup for Marketplace on FxOS and in general on Fennec.
  return isFxOS1x(agent) ||
         isFennecLessThan24(agent);
}

/**
 * blockingCspMiddleware is where to declare rules that will cause a resource
 * to be blocked if it runs afowl of a rule.
 */
module.exports = function (config) {
  var BLOB = 'blob:';
  var CDN_URL = config.get('static_resource_url');
  var DATA = 'data:';
  var GRAVATAR = 'https://secure.gravatar.com';
  var PUBLIC_URL = config.get('public_url');
  var SELF = "'self'";


  function addCdnRuleIfRequired(target) {
    if (CDN_URL !== PUBLIC_URL) {
      target.push(CDN_URL);
    }

    return target;
  }

  var rules = {
    directives: {
      connectSrc: [
        SELF,
        getOrigin(config.get('fxaccount_url')),
        config.get('oauth_url'),
        config.get('profile_url'),
        config.get('marketing_email.api_url')
      ],
      defaultSrc: function (req, res) {
        var userAgent = req.headers['user-agent'];
        if (agentRequiresConnectSrcCopiedToDefaultSrc(userAgent)) {
          return [].concat(rules.directives.connectSrc);
        }

        return [SELF];
      },
      fontSrc: addCdnRuleIfRequired([
        SELF
      ]),
      imgSrc: addCdnRuleIfRequired([
        SELF,
        DATA,
        GRAVATAR,
        config.get('profile_images_url')
      ]),
      mediaSrc: [BLOB],
      reportUri: config.get('csp.reportUri'),
      scriptSrc: addCdnRuleIfRequired([
        // allow unsafe-eval for functional tests. A report-only middleware
        // is also added that does not allow 'unsafe-eval' so that we can see
        // if other scripts are being added.
        SELF, "'unsafe-eval'"
      ]),
      styleSrc: addCdnRuleIfRequired([
        SELF,
        // The sha of the embedded <style> tag in default-profile.svg.
        "'sha256-9n6ek6ecEYlqel7uDyKLy6fdGNo3vw/uScXSq9ooQlk='"
      ])
    },
    reportOnly: false
  };

  return rules;
};

module.exports.agentRequiresConnectSrcCopiedToDefaultSrc =
  agentRequiresConnectSrcCopiedToDefaultSrc;
