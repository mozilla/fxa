/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';
import { Container } from 'typedi';
import { NotifierService } from '../../../libs/shared/notifier/src';

/**
 * This notifier is called by the logger via `notifyAttachedServices`
 * to send notifications to Amazon SNS/SQS.
 */
module.exports = function notifierLog(log, statsd) {
  return {
    send: (event, callback) => {
      if (!Container.has(NotifierService)) {
        throw new Error(
          'Missing Notifier Service! Was it registered at startup?'
        );
      }
      const notifier = Container.get(NotifierService);
      return notifier.send(event, callback);
    },
  };
};
