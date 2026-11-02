/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html

import { EventEmitter } from 'events';

export interface SESMailHeader {
  name: string;
  value: string;
}

export interface SESMail {
  timestamp: string;
  messageId: string;
  source: string;
  headers?: SESMailHeader[];
}

export interface SQSReceiver extends EventEmitter {
  start: () => void;
}
