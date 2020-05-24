/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Logger } = require('mozlog');

type MozLog = { logger: typeof Logger };
let mozlog: null | MozLog;

module.exports = function (nameOrLog: string | MozLog): typeof Logger | void {
  if (typeof nameOrLog === 'string') {
    // ignore logger labels for now. auth and oauth used
    // different logging strategies eventually these should
    // be consolidated under lib/log.js
    if (mozlog) {
      return mozlog.logger;
    }

    // main key_server must set the log
    if (process.mainModule!.filename.includes('key_server')) {
      throw new Error('uninitialized mozlog');
    }

    // probably a test
    mozlog = {
      logger: require('mozlog')({ app: 'unknown', level: 'critical' })(
        nameOrLog
      ),
    };

    return mozlog.logger;
  }

  mozlog = nameOrLog;
};
