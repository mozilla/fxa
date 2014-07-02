/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = require('rc')(
  'fxa_db',
  {
  logLevel: 'trace',
    host: "127.0.0.1",
    port: 8000,
    patchKey: 'schema-patch-level',
    patchLevel: 2,
    master: {
      user: 'root',
      password: '',
      database: 'fxa',
      host: '127.0.0.1',
      port: 3306,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 100
    },
    slave: {
      user: 'root',
      password: '',
      database: 'fxa',
      host: '127.0.0.1',
      port: 3306,
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 100
    }
  }
)
