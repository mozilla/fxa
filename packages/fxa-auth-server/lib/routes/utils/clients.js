/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const { ClientFormatter } = require('fxa-shared/connected-services');

module.exports = (log, config) => {
  return new ClientFormatter(config, () => log);
};
