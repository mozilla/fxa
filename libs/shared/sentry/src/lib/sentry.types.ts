/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type Logger = {
  error: (type: string, data?: unknown) => void;
  debug: (type: string, data?: unknown) => void;
  info: (type: string, data?: unknown) => void;
  warn: (type: string, data?: unknown) => void;
};
