/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../../config');

const FXA_URL_TEMPLATE = config.get('img.url');

function fxaUrl(id) {
  return FXA_URL_TEMPLATE.replace('{id}', id);
}

module.exports = {
  fxaUrl: fxaUrl,
};
