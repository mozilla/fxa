#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const db = require('../lib/db');

db.getEncodingInfo()
  .then(function(info) {
    console.log(JSON.stringify(info, null, 2)); // eslint-disable-line no-console
  })
  .then(process.exit);
