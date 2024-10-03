/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INQUIRER } from '@nestjs/core';
import mozlog, { LoggerFactory, Logger as MozLogger } from 'mozlog';

let logFactory: LoggerFactory;

@Injectable({ scope: Scope.TRANSIENT })
export class MozLoggerService implements LoggerService {
  private mozlog: MozLogger;

  constructor(
    configService: ConfigService,
    @Inject(INQUIRER) private parentClass: object
  ) {
    if (!logFactory) {
      logFactory = mozlog(configService.get('log'));
    }
    this.mozlog = logFactory('default');
    if (this.parentClass?.constructor?.name) {
      this.setContext(this.parentClass.constructor.name);
    }
  }

  public setContext(name: string): void {
    this.mozlog = logFactory(name);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.mozlog.info('', { message, ...optionalParams });
  }

  info(message: any, ...optionalParams: any[]): void {
    this.mozlog.info('', { message, ...optionalParams });
  }

  error(message: any, ...optionalParams: any[]): void {
    this.mozlog.error('', { message, ...optionalParams });
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.mozlog.warn('', { message, ...optionalParams });
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.mozlog.debug('', { message, ...optionalParams });
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.mozlog.verbose('', { message, ...optionalParams });
  }

  trace(message: any, ...optionalParams: any[]): void {
    this.mozlog.trace('', { message, ...optionalParams });
  }

  warning(message: any, ...optionalParams: any[]): void {
    this.mozlog.warn('', { message, ...optionalParams });
  }
}
