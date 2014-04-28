/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global describe,it,require */

const
intel = require('intel'),
should = require('should'),
JsonFormatter = require('../lib/log/json');

describe('custom log formatter', function() {

  it('should successfully process log messages', function(done) {
    var output = [];
    var handler = new intel.handlers.Stream({
      stream: {
        write: function(data, cb) {
          output.push(JSON.parse(data));
          cb();
        }
      }
    });
    handler.setFormatter(new JsonFormatter({format: '%O'}));
    var log = intel.getLogger('bid.test');
    log.setLevel(log.DEBUG).addHandler(handler);
    log.propagate = false;
    log.debug('hello world').then(function() {
      log.debug({'field': 'value'}).then(function() {
        should(output[0].message).equal('hello world');
        should(output[1].field).equal('value');
        should.not.exist(output[1].message);
        done();
      });
    });
  });

});
