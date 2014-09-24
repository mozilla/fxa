/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'sinon'
], function (sinon) {
  'use strict';

  /**
   * Create a fake set of OAuth servers through instantiation.
   * Note, these servers completely take over the XHR object, so as long as
   * a server is created, no XHR requests will occur.
   *
   * To destroy the fakeServer, call fakeServer.destroy();
   */
  function MockOAuthServers() {
    /*jshint camelcase: false*/
    this.fakeServer = sinon.fakeServer.create();
    this.fakeServer.autoRespond = true;

    // not strictly an OAuth server, but needed to complete.
    this.fakeServer.respondWith('/config', function (xhr) {
      xhr.respond(200, {
        'Content-Type': 'application/json'
      }, JSON.stringify({
        cookiesEnabled: true,
        fxaccountUrl: 'http://127.0.0.1:9000',
        oauthUrl: 'http://127.0.0.1:9010',
        language: 'en_US',
        metricsSampleRate: 1
      }));
    });

    this.fakeServer.respondWith(/http:\/\/127\.0\.0\.1:9010\/v1\/client\/.*/, function (xhr) {
      xhr.respond(200, {
        'Content-Type': 'application/json'
      }, JSON.stringify({
        name: '123Done',
        image_uri: 'https://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.png',
        redirect_uri: 'http://127.0.0.1:8080/api/oauth'
      }));
    });
  }

  MockOAuthServers.prototype = {
    destroy: function () {
      this.fakeServer.restore();
    }
  };

  return MockOAuthServers;

});

