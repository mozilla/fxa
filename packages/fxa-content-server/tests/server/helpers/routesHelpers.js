/* eslint-disable no-prototype-builtins */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const assert = intern.getPlugin('chai').assert;
const config = require('../../../server/lib/configuration');
const crypto = require('crypto');
const css = require('css');
const { extend } = require('lodash');
const got = require('got');
const htmlparser2 = require('htmlparser2');
const path = require('path');
const url = require('url');

// keep a cache of checked URLs to avoid duplicate tests and
// speed up the tests.
var checkedUrlPromises = {};

var httpUrl,
  httpsUrl = intern._config.fxaContentRoot.replace(/\/$/, '');
if (intern._config.fxaProduction) {
  assert.equal(0, httpsUrl.indexOf('https://'), 'uses https scheme');
  httpUrl = httpsUrl.replace('https://', 'http://');
} else {
  httpUrl = httpsUrl.replace(config.get('port'), config.get('http_port'));
}

function computeSri(algorithm, data) {
  if (['sha256', 'sha384', 'sha512'].indexOf(algorithm) === -1) {
    throw new Error('Unsupported hash algorithm ' + algorithm);
  }

  const sri = crypto
    .createHash(algorithm)
    .update(data, 'utf8')
    .digest('base64');

  return algorithm + '-' + sri;
}

function isProductionLike() {
  return intern._config.fxaProduction && intern._config.fxaDevBox;
}

function makeRequest(url, requestOptions) {
  return got(url, requestOptions).catch(function (err) {
    return err.response;
  });
}

function checkHeaders(routes, route, res) {
  var headers = res.headers;

  if (headers['content-type'].indexOf('text/html') > -1) {
    // all HTML pages by default have x-frame-options: DENY
    assert.equal(headers['x-frame-options'], 'DENY');
    assert.equal(headers['x-robots-tag'], 'noindex,nofollow');

    if (routes[route].csp !== false) {
      assert.ok(headers.hasOwnProperty('content-security-policy'));
    }
  }

  assert.equal(headers['x-content-type-options'], 'nosniff');
  assert.include(headers['strict-transport-security'], 'max-age=');
}

/**
 * Go through each of the HTML files, look for URLs, check that
 * each URL exists, responds with a 200, and in the case of JS, CSS
 * and fonts, that the correct CORS headers are set.
 */
function extractAndCheckUrls(res, testName) {
  var href = url.parse(res.url);
  var origin = [href.protocol, '//', href.host].join('');
  return extractUrls(res.body).then((resources) =>
    checkUrls(origin, resources, testName)
  );
}

function extractUrls(body) {
  return new Promise(function (resolve, reject) {
    var dependencyResources = [];
    var comments = [];
    var parser;

    var handlers = {
      onopentag: function onopentag(tagname, attribs) {
        if (['script', 'link', 'a'].indexOf(tagname) === -1) {
          return;
        }

        const resource = {
          integrity: attribs.integrity || null,
        };

        if (tagname === 'script') {
          resource.url = attribs.src;
        } else if (tagname === 'link' || tagname === 'a') {
          resource.url = attribs.href;
        }

        if (!resource || !resource.url) {
          return;
        }

        if (!isAbsoluteUrl(resource.url)) {
          resource.url = httpsUrl + resource.url;
        }

        dependencyResources.push(resource);
      },

      oncomment: function oncomment(text) {
        comments.push(text);
      },

      onend: function onend() {
        // TODO: could scan the accumulated comments for IE-style resource links.
        resolve(dependencyResources);
      },
    };

    const parserOptions = {
      lowerCaseAttributeNames: true,
      lowerCaseTags: true,
    };

    parser = new htmlparser2.Parser(handlers, parserOptions);

    parser.write(body);
    parser.end();
  });
}

const IGNORE_URL_REGEXPS = [
  // Ignore Firefox iOS links until https://github.com/mozilla/legal-docs/pull/1247 lands
  /github.com\/mozilla-mobile\/firefox-ios\/blob/,
  // Do not check support.mozilla.org URLs. Issue #4712
  // In February 2017 SUMO links started returning 404s to non-browser redirect requests
  /support\.mozilla\.org/,
  // skip the livereload link in the mocha tests
  /localhost:35729/,
  // haveibeenpwned 403s.
  /haveibeenpwned\.com/,
];

function isUrlIgnored(url) {
  return IGNORE_URL_REGEXPS.find((domainRegExp) => domainRegExp.test(url));
}

function checkUrls(origin, resources, testName = '') {
  return findCssSubResources(origin, resources).then((cssSubResources) => {
    resources = resources.concat(cssSubResources);

    var requests = resources.map(function (resource) {
      if (checkedUrlPromises[resource.url]) {
        return checkedUrlPromises[resource.url];
      }

      var requestOptions = {};
      if (doesURLRequireCORS(resource.url)) {
        requestOptions = {
          headers: {
            Origin: origin,
          },
        };
      }

      var promise = makeRequest(resource.url, requestOptions).then(function (
        res
      ) {
        if (isUrlIgnored(resource.url)) {
          return;
        }

        assert.equal(res.statusCode, 200, `${testName}: ${resource.url}`);

        // If prod-like, Check all CSS and JS (except experiments.bundle.js)
        // for SRI `integrity=` attribute on the link, and that the checksum
        // of the returned content matches.
        if (
          isProductionLike() &&
          isJsOrCss(resource.url) &&
          !/experiments\.bundle\.js$/.test(resource.url)
        ) {
          assert.ok(
            resource.integrity,
            'JS/CSS link has SRI integrity attribute'
          );
          var algorithm = resource.integrity.split('-')[0];
          var computedSri = computeSri(algorithm, res.body);
          assert.equal(
            resource.integrity,
            computedSri,
            'SRI attribute integrity matches downloaded content'
          );
        }

        var hasCORSHeaders = res.headers.hasOwnProperty(
          'access-control-allow-origin'
        );
        if (doesURLRequireCORS(resource.url)) {
          assert.ok(hasCORSHeaders, resource.url + ' should have CORS headers');
        } else {
          assert.notOk(
            hasCORSHeaders,
            resource.url + ' should not have CORS headers'
          );
        }
      });

      checkedUrlPromises[resource.url] = promise;

      return promise;
    });

    return Promise.all(requests);
  });
}

function findCssUrlMatches(value, base) {
  const CSSURL_RE = /url\(\s*['"]?([^)'"]+)['"]?\s*\)/g;

  var urls = {};
  var match;

  while ((match = CSSURL_RE.exec(value))) {
    // eslint-disable-line no-cond-assign
    var resolved = url.resolve(base, match[1]);
    var protocol = url.parse(resolved).protocol;
    if (protocol.match(/^http/)) {
      urls[resolved] = 1;
    }
  }

  return urls;
}

function parseCssUrls(content, base) {
  var ast = css.parse(content);
  var urls = {};

  ast.stylesheet.rules.forEach(function (rule) {
    if (rule.type === 'font-face' || rule.type === 'rule') {
      rule.declarations.forEach(function (declaration) {
        extend(urls, findCssUrlMatches(declaration.value, base));
      });
    } else if (rule.type === 'media') {
      rule.rules.forEach(function (mediaRule) {
        mediaRule.declarations.forEach(function (declaration) {
          extend(urls, findCssUrlMatches(declaration.value, base));
        });
      });
    }
  });

  return Object.keys(urls).sort();
}

function filterCssUrls(resources) {
  return resources.filter(function (resource) {
    var parsedUri = url.parse(resource.url);
    var extension = path.extname(parsedUri.pathname);
    if (extension === '.css') {
      return resource.url;
    }
  });
}

function findCssSubResources(origin, resources) {
  // For urls with extension `.css`, find the font and image resources
  // entrained from CSS.
  var cssResources = filterCssUrls(resources);

  var requests = cssResources.map(function (resource) {
    if (checkedUrlPromises[resource.url]) {
      return checkedUrlPromises[resource.url];
    }

    var requestOptions = {
      headers: {
        Accept: 'text/css,*/*;q=0.1',
      },
    };

    if (doesURLRequireCORS(resource.url)) {
      requestOptions.headers.Origin = origin;
    }

    var promise = makeRequest(resource.url, requestOptions).then(function (
      res
    ) {
      // Only a minimal check here. The resolved Promise response will be
      // checked in detail again in `checkUrls()`.
      assert.equal(res.statusCode, 200, resource.url);

      return parseCssUrls(res.body, resource.url);
    });

    checkedUrlPromises[resource.url] = promise;

    return promise;
  });

  return Promise.all(requests).then(function (resources) {
    // convert the return value to a flattened list of resource objects
    var flattened = [].concat.apply([], resources);
    return flattened.map((url) => {
      return {
        url: url,
      };
    });
  });
}

function isAbsoluteUrl(url) {
  return /^http/.test(url);
}

function doesURLRequireCORS(url) {
  return isExternalUrl(url) && doesExtensionRequireCORS(url);
}

function isContentServerUrl(url) {
  return url.indexOf(httpsUrl) === 0 || url.indexOf(httpUrl) === 0;
}

function isExternalUrl(url) {
  return !isContentServerUrl(url);
}

function doesExtensionRequireCORS(uri) {
  var parsedUri = url.parse(uri);
  var extension = path.extname(parsedUri.pathname);
  return /^\.(js|css|woff|woff2|eot|ttf)$/.test(extension);
}

function isJs(uri) {
  var parsedUri = url.parse(uri);
  var extension = path.extname(parsedUri.pathname);
  return extension === '.js';
}

function isCss(uri) {
  var parsedUri = url.parse(uri);
  var extension = path.extname(parsedUri.pathname);
  return extension === '.css';
}

function isJsOrCss(url) {
  return isJs(url) || isCss(url);
}

module.exports = {
  checkHeaders: checkHeaders,
  extractAndCheckUrls: extractAndCheckUrls,
  makeRequest: makeRequest,
};
