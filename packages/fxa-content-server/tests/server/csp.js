/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// Ensure the CSP headers are only added to the appropriate requests
const { registerSuite } = intern.getInterface('object');
const assert = intern.getPlugin('chai').assert;
const config = require('../../server/lib/configuration');
const path = require('path');
const blockingRules = require('../../server/lib/csp/blocking');
const proxyquire = require('proxyquire');
const url = require('url');

const csp = proxyquire(path.join(process.cwd(), 'server', 'lib', 'csp'), {
  // totally ignore the html-middleware
  './html-middleware': callback => callback,
});

function getOrigin(link) {
  const parsed = url.parse(link);
  return `${parsed.protocol}//${parsed.host}`;
}

const suite = {
  tests: {},
};

suite.tests['isCspRequired'] = function() {
  assert.isFalse(
    csp.isCspRequired({ method: 'GET', path: '/tests/index.html' })
  );

  assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/404.html' }));
  assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/notfound.css' }));
  assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/' }));
  assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/confirm' }));
};

suite.tests['blockingRules'] = function() {
  // force the CDN to be enabled for tests.
  const CDN_SERVER = 'https://static.accounts.firefox.com';
  config.set('static_resource_url', CDN_SERVER);

  const { Sources, directives, reportOnly } = blockingRules(config);

  // Ensure none of the Sources map to `undefined`
  assert.notProperty(Sources, 'undefined');

  assert.isFalse(reportOnly);

  const connectSrc = directives.connectSrc;
  assert.lengthOf(connectSrc, 8);
  assert.include(connectSrc, Sources.SELF);
  assert.include(connectSrc, Sources.AUTH_SERVER);
  assert.include(connectSrc, Sources.OAUTH_SERVER);
  assert.include(connectSrc, Sources.PROFILE_SERVER);
  assert.include(connectSrc, Sources.MARKETING_EMAIL_SERVER);
  assert.include(connectSrc, Sources.PAIRING_SERVER_HTTP);
  assert.include(connectSrc, Sources.PAIRING_SERVER_WEBSOCKET);

  const defaultSrc = directives.defaultSrc;
  assert.lengthOf(defaultSrc, 1);
  assert.include(defaultSrc, Sources.SELF);

  const fontSrc = directives.fontSrc;
  assert.lengthOf(fontSrc, 2);
  assert.include(fontSrc, Sources.SELF);
  assert.include(fontSrc, CDN_SERVER);

  let frameSrc = directives.frameSrc;

  config.set('surveys', []);
  assert.include(frameSrc, "'none'");
  config.set('surveys', [
      {
        id: 'portugese-speaking-mobile-users-in-southern-hemisphere',
        conditions: {},
        view: 'settings',
        rate: 0.1,
        url: 'https://www.surveygizmo.com/s3/5541940/pizza',
      }
  ]);
  frameSrc = blockingRules(config).directives.frameSrc;
  const SURVEYS = config.get('surveys');
  assert.lengthOf(frameSrc, SURVEYS.length + 1);
  assert.include(frameSrc, getOrigin(SURVEYS[0].url));

  const imgSrc = directives.imgSrc;
  assert.lengthOf(imgSrc, 5);
  assert.include(imgSrc, Sources.SELF);
  assert.include(imgSrc, Sources.DATA);
  assert.include(imgSrc, Sources.GRAVATAR);
  assert.include(imgSrc, Sources.PROFILE_IMAGES_SERVER);
  assert.include(imgSrc, CDN_SERVER);

  const mediaSrc = directives.mediaSrc;
  assert.lengthOf(mediaSrc, 1);
  assert.include(mediaSrc, Sources.BLOB);

  const objectSrc = directives.objectSrc;
  assert.lengthOf(objectSrc, 1);
  assert.include(objectSrc, Sources.NONE);

  const scriptSrc = directives.scriptSrc;
  assert.lengthOf(scriptSrc, 2);
  assert.include(scriptSrc, Sources.SELF);
  assert.include(scriptSrc, CDN_SERVER);

  const styleSrc = directives.styleSrc;
  assert.lengthOf(styleSrc, 2);
  assert.include(styleSrc, Sources.SELF);
  assert.include(styleSrc, CDN_SERVER);
};

registerSuite('csp', suite);
