/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Injectable } from '@nestjs/common';
import { MozLoggerService } from 'fxa-shared/nestjs/logger/logger.service';

/** Known event names */
export enum EventNames {
  ClearBounces = 'clear-bounces',
  UnverifyEmail = 'unverify-email',
  DisableLogin = 'disable-login',
  AccountSearch = 'account-search',
}

/**
 * Handles logging of pertinent events.
 */
@Injectable()
export class EventLoggingService {
  private readonly logType = 'admin-panel-events';

  /**
   * Creates new event logger
   * @param log
   */
  constructor(private readonly log: MozLoggerService) {}

  /**
   * Logs an event occurrence
   * @param eventName - A known event name
   */
  public onEvent(eventName: Omit<EventNames, EventNames.AccountSearch>) {
    this.log.info(this.logType, {
      event: eventName,
    });
  }

  /**
   * Records an AccountSearch event and indicates if the query was the result of an autocompletion.
   * @param autocompleted
   */
  public onAccountSearch(searchType: 'email' | 'uid', autoCompleted: boolean) {
    this.log.info(this.logType, {
      event: EventNames.AccountSearch,
      'search-type': searchType,
      'auto-completed': autoCompleted,
    });
  }
}
