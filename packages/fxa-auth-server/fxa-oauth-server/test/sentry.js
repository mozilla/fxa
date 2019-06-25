/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');

const Hapi = require('hapi');

const configureSentry = require('../lib/server/configureSentry');
const server = new Hapi.Server({});

/*global describe,it*/

describe('Sentry', function() {
  it('can be set up when sentry is enabled', () => {
    const config = {
      sentryDsn: 'https://deadbeef:deadbeef@127.0.0.1/123',
    };
    assert.doesNotThrow(() => configureSentry(server, config));
  });

  it('can be set up when sentry is not enabled', () => {
    const config = {};
    assert.doesNotThrow(() => configureSentry(server, config));
  });
});
