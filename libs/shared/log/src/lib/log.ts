/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface Logger {
  info: (...args: any) => void;
  trace: (...args: any) => void;
  warn: (...args: any) => void;
  error: (...args: any) => void;
  debug: (...args: any) => void;
}

/**
 * A logger that logs to the console.
 */
export class ConsoleLogger {
  public info(...args: any) {
    console.log(...args);
  }
  public trace(...args: any) {
    console.log(...args);
  }
  public warn(...args: any) {
    console.log(...args);
  }
  public error(...args: any) {
    console.log(...args);
  }
  public debug(...args: any) {
    console.log(...args);
  }
}
