/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Ensure the CSP headers are only added to the appropriate requests

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!../../server/lib/csp',
  'intern/dojo/node!../../server/lib/csp/blocking',
], function (registerSuite, assert, csp, blockingRules) {

  var suite = {
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

  suite['agentRequiresConnectSrcCopiedToDefaultSrc'] = function () {
    var agentRequiresConnectSrcCopiedToDefaultSrc =
      blockingRules.agentRequiresConnectSrcCopiedToDefaultSrc;

    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc());

    // FxOS 1.3
    assert.isTrue(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Mobile; rv:28.0) Gecko/28.0 Firefox/28.0'));
    // FxOS 1.4
    assert.isTrue(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Mobile; rv:30.0) Gecko/30.0 Firefox/30.0'));
    // FxOS 2.0
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Mobile; rv:32.0) Gecko/32.0 Firefox/32.0'));

    // Fennec 24
    assert.isTrue(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Android; Mobile; rv:24.0) Gecko/24.0 Firefox/24.0'));
    // Fennec 25 (first version w/ CSP 1.0 - see
    // https://bugzilla.mozilla.org/show_bug.cgi?id=858780)
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Android; Mobile; rv:25.0) Gecko/25.0 Firefox/25.0'));

    // FxDesktop on a Mac - Helmet takes care of all
    // Fx Desktop versions for us.
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:10.0) Gecko/20100101 Firefox/10.0'));
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:47.0) Gecko/20100101 Firefox/47.0'));

    // FxDesktop on Linux
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0'));
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (X11; Linux x86_64; rv:47.0) Gecko/20100101 Firefox/47.0'));

    // FxDesktop on Windows
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Windows NT 7.0; Win64; x64; rv:10.0) Gecko/20100101 Firefox/10.0'));
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Windows NT 7.0; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'));

    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Windows NT 7.0; rv:10.0) Gecko/20100101 Firefox/10.0'));
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Windows NT 7.0; rv:47.0) Gecko/20100101 Firefox/47.0'));

    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Windows NT 7.0; WOW64; rv:10.0) Gecko/20100101 Firefox/10.0'));
    assert.isFalse(agentRequiresConnectSrcCopiedToDefaultSrc('Mozilla/5.0 (Windows NT 7.0; WOW64; rv:47.0) Gecko/20100101 Firefox/47.0'));
  };

  registerSuite(suite);
});

