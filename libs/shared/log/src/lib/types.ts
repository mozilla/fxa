/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export type HekaJson = {
  Type: string;
  Logger: string;
  Timestamp: number;
  Severity: number;
  Fields: Record<string, any>;
  [key: string]: any;
};

export type ILogger = {
  error: (type: string, data: any) => void;
  debug: (type: string, data: any) => void;
  info: (type: string, data: any) => void;
  warn: (type: string, data: any) => void;
};
