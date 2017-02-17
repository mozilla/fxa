/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This module converts old logging messages to mozlog
 *
 * @param log {Object} mozlog logger
 * @returns {log}
 */
module.exports = function (log) {
  return {
    trace: function (data) {
      log.debug(data.op, data)
    },
    error: function (data) {
      log.error(data.op, data)
    },
    fatal: function (data) {
      log.critical(data.op, data)
    },
    warn: function (data) {
      log.warn(data.op, data)
    },
    info: function (data) {
      log.info(data.op, data)
    }
  }
}
