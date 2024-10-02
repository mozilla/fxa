/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mozlog, { Logger as MozLogger, LoggerFactory } from 'mozlog';

let logFactory: LoggerFactory;

@Injectable({ scope: Scope.TRANSIENT })
export class MozLoggerService {
  private mozlog: MozLogger;

  constructor(@Inject(ConfigService) configService: ConfigService) {
    if (!logFactory) {
      logFactory = mozlog(configService.get('log'));
    }
    this.mozlog = logFactory('default');
  }

  public setContext(name: string): void {
    this.mozlog = logFactory(name);
  }

  info(type: string, fields: Record<string, any>): void {
    this.mozlog.info(type, fields);
  }

  error(type: string, fields: Record<string, any>): void {
    this.mozlog.error(type, fields);
  }

  warn(type: string, fields: Record<string, any>): void {
    this.mozlog.warn(type, fields);
  }

  debug(type: string, fields: Record<string, any>): void {
    this.mozlog.debug(type, fields);
  }

  verbose(type: string, fields: Record<string, any>): void {
    this.mozlog.verbose(type, fields);
  }

  trace(type: string, fields: Record<string, any>): void {
    this.mozlog.trace(type, fields);
  }

  warning(type: string, fields: Record<string, any>): void {
    this.mozlog.warn(type, fields);
  }
}
