/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = (req, res, body) => {
  let data = body ? JSON.stringify(body) : 'null';
  data = data
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  res.setHeader('Content-Length', Buffer.byteLength(data));
  return data;
};
