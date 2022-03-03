/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface ILogger {
  info: (...args: any) => void;
  trace: (...args: any) => void;
  warn: (...args: any) => void;
  error: (...args: any) => void;
  debug: (...args: any) => void;
}
