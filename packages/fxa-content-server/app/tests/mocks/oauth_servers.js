/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import sinon from 'sinon';

/**
 * Create a fake set of OAuth servers through instantiation.
 * Note, these servers completely take over the XHR object, so as long as
 * a server is created, no XHR requests will occur.
 *
 * To destroy the fakeServer, call fakeServer.destroy();
 */
function MockOAuthServers() {
  this.fakeServer = sinon.fakeServer.create();
  this.fakeServer.autoRespond = true;

  // not strictly an OAuth server, but needed to complete.
  this.fakeServer.respondWith('/config', function (xhr) {
    xhr.respond(
      200,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify({
        authServerUrl: 'http://localhost:9000',
        cookiesEnabled: true,
        language: 'en_US',
        metricsSampleRate: 1,
        oauthUrl: 'http://localhost:9000',
      })
    );
  });

  this.fakeServer.respondWith(
    /http:\/\/127\.0\.0\.1:9000\/v1\/client\/.*/,
    function (xhr) {
      xhr.respond(
        200,
        {
          'Content-Type': 'application/json',
        },
        JSON.stringify({
          // eslint-disable-next-line camelcase
          image_uri:
            'https://mozorg.cdn.mozilla.net/media/img/firefox/new/header-firefox.png', //eslint-disable-line camelcase
          name: '123Done',
          redirect_uri: 'http://localhost:8080/api/oauth', //eslint-disable-line camelcase
        })
      );
    }
  );
}

MockOAuthServers.prototype = {
  destroy() {
    this.fakeServer.restore();
  },
};

export default MockOAuthServers;
