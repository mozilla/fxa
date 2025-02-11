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
  public name: string;

  constructor(
    configService: ConfigService,
    @Inject(INQUIRER) parentClass: object
  ) {
    if (!logFactory) {
      logFactory = mozlog(configService.get('log'));
    }

    if (parentClass?.constructor?.name) {
      this.name = parentClass?.constructor?.name;
    } else {
      this.name = 'default';
    }

    this.mozlog = logFactory(this.name);
  }

  public setContext(name: string): void {
    this.name = name;
    this.mozlog = logFactory(name);
  }

  log(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.info(type, data);
  }

  info(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.info(type, data);
  }

  error(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.error(type, data);
  }

  warn(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.warn(type, data);
  }

  debug(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.debug(type, data);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.verbose(type, data);
  }

  trace(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.trace(type, data);
  }

  warning(message: any, ...optionalParams: any[]): void {
    const { type, data } = supportLegacyFormat(message, optionalParams);
    this.mozlog.warn(type, data);
  }
}

/**
 * Handles legacy logging format which was intended for mozlog. Moz log calls were typically
 * in the form:
 *
 *  > log(type, data);
 *  > log(type)
 *
 * Where type was a discrete log type used for look up, and data was an optional dictionary
 * of values, a string containing a message, or an Error.
 *
 * As long as the logger is invoked in this way, this function ensures the resulting output
 * is compliant with what mozlog would have produced.
 *
 * @param message The message passed to the logger
 * @param optionalParams The remaining parameters passed to the logger
 * @returns { type:string, data:any } A mozlog compliant message
 */
export function supportLegacyFormat(message: any, optionalParams: any[]) {
  // This is the way most mozlog calls work, e.g log('some-type', {msg:'okay', foo:'bar'});
  // We don't want to disrupt the output of these types of calls, since they are can be used
  // for analytics...
  if (typeof message === 'string' && optionalParams.length <= 1) {
    return {
      type: message,
      data: optionalParams[0] || {},
    };
  }

  // TODO: FXA-9951 - Will prevent this kind of call from occurring by restricting logging types.
  // Note, this can result in messy or invalid states in bq on jsonPayload.fields. It's
  // best not rely on this.
  return {
    type: '',
    data: {
      message,
      ...optionalParams,
    },
  };
}
