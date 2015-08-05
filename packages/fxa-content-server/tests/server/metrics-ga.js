/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!./helpers/init-logging',
  'intern/dojo/node!fs',
  'intern/dojo/node!path',
  'intern/dojo/node!../../server/lib/configuration',
  'intern/dojo/node!proxyquire'
], function (intern, registerSuite, assert, initLogging, fs, path, config, proxyquire) {
  var suite = {
    name: 'ga metrics'
  };
  var SIGNUP_FLOW = 'Firefox Accounts Sign-up Flow';

  suite['it works with GA'] = function () {
    var data = JSON.parse(fs.readFileSync('tests/server/fixtures/ga_body_1.json'));

    function analyticsMock() {
      return {
        event: function (data) {
          assert.equal(data.anonymizeIp, 1);
          assert.equal(data.campaignMedium, 'none');
          assert.equal(data.campaignName, 'none');
          assert.equal(data.campaignSource, 'none');
          assert.equal(data.cid, 'c614d7fb-43e4-485c-bf11-40afbb202656');
          assert.equal(data.dataSource, 'web');
          assert.equal(data.ea, 'registered');
          assert.equal(data.ec, SIGNUP_FLOW);
          assert.equal(data.el, 'regular');
          assert.equal(data.ev, 1);
          assert.equal(data.hitType, 'event');
          assert.equal(data.uid, 'c614d7fb-43e4-485c-bf11-40afbb202656');
          assert.equal(data.sr, '1680x1050');
          assert.equal(data.vp, '819x955');
          assert.isDefined(data.documentHostName);
          assert.isDefined(data.ua);

          return this;
        },
        send: function () {}
      };
    }

    var mocks = {
      'universal-analytics': analyticsMock
    };
    var GACollector = proxyquire(path.join(process.cwd(), 'server', 'lib', 'ga-collector'), mocks);
    var collect = new GACollector({
      analyticsId: 'mockId'
    });
    collect.write(data);
  };

  registerSuite(suite);
});
