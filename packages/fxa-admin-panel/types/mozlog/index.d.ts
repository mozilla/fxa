/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

declare module 'mozlog' {
  export = LoggerConfigFactory;
}

declare function LoggerConfigFactory(
  config: any
): LoggerConfigFactory.LoggerFactory;

declare namespace LoggerConfigFactory {
  type LoggerFactory = (typePrefix: any) => Logger;

  export interface Logger {
    debug(type: string, fields: object): void;
    error(type: string, fields: object): void;
    info(type: string, fields: object): void;
    warning(type: string, fields: object): void;
  }
}
