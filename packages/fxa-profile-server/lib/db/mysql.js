/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mysql = require('mysql');
const Promise = require('../promise');

function MysqlStore(options) {
  this._connect = mysql.createConnection(options);
}

MysqlStore.connect = function mysqlConnect(options) {
  return Promise.resolve(new MysqlStore(options));
};

const GET_PROFILE_QUERY = 'SELECT * FROM profiles WHERE id=?';

MysqlStore.prototype = {
  getProfile: function getProfile(id) {
    var defer = Promise.defer();
    this._connection.query(GET_PROFILE_QUERY, [id], defer.callback);
    return defer.promise;
  }
};

module.exports = MysqlStore;
