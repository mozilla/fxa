/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Ensure the CSP headers are only added to the appropriate requests

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!../../server/lib/csp',
  'intern/dojo/node!../../server/lib/csp/blocking'
], function (registerSuite, assert, config, csp, BlockingRules) {

  const suite = {
    name: 'csp'
  };

  suite['isCspRequired'] = function () {
    assert.isFalse(csp.isCspRequired({ method: 'POST', path: '/csp_report' }));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/tests/index.html'}));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/lib/router.js' }));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/images/firefox.png' }));
    assert.isFalse(csp.isCspRequired({ method: 'GET', path: '/fonts/clearsans.woff' }));

    assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/404.html' }));
    assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/' }));
    assert.isTrue(csp.isCspRequired({ method: 'GET', path: '/confirm' }));
  };

  suite['blockingRules'] = function () {
    // force the CDN to be enabled for tests.
    const CDN_SERVER = 'https://static.accounts.firefox.com';
    config.set('static_resource_url', CDN_SERVER);

    const blockingRules = BlockingRules(config);
    const Sources = blockingRules.Sources;

    // Ensure none of the Sources map to `undefined`G
    assert.notProperty(Sources, 'undefined');

    assert.isFalse(blockingRules.reportOnly);

    const directives = blockingRules.directives;

    const connectSrc = directives.connectSrc;
    assert.lengthOf(connectSrc, 5);
    assert.include(connectSrc, Sources.SELF);
    assert.include(connectSrc, Sources.AUTH_SERVER);
    assert.include(connectSrc, Sources.OAUTH_SERVER);
    assert.include(connectSrc, Sources.PROFILE_SERVER);
    assert.include(connectSrc, Sources.MARKETING_EMAIL_SERVER);

    const defaultSrc = directives.defaultSrc;
    assert.lengthOf(defaultSrc, 1);
    assert.include(defaultSrc, Sources.SELF);

    const fontSrc = directives.fontSrc;
    assert.lengthOf(fontSrc, 2);
    assert.include(fontSrc, Sources.SELF);
    assert.include(fontSrc, CDN_SERVER);

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
    assert.lengthOf(scriptSrc, 3);
    assert.include(scriptSrc, Sources.SELF);
    assert.include(scriptSrc, Sources.UNSAFE_EVAL);
    assert.include(scriptSrc, CDN_SERVER);

    const styleSrc = directives.styleSrc;
    assert.lengthOf(styleSrc, 3);
    assert.include(styleSrc, Sources.SELF);
    assert.include(styleSrc, Sources.EMBEDDED_STYLE_SHA);
    assert.include(styleSrc, CDN_SERVER);
  };

  registerSuite(suite);
});

