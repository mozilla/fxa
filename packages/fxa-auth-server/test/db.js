/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');

/*global describe,it*/

describe('db', function() {

  describe.only('#_initialClients', function() {
    it('should not insert already existing clients', function() {
      return db.ping().then(function() {
        return db._initialClients();
      });
    });
  });
});
