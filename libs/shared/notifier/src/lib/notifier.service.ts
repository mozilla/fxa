/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { LOGGER_PROVIDER } from '@fxa/shared/log';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { Inject, Injectable } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { ServiceException } from '@smithy/smithy-client';
import {
  MessageAttributeValue,
  PublishCommandOutput,
  SNS,
} from '@aws-sdk/client-sns';
import { StatsD } from 'hot-shots';

import { NotifierSnsConfig } from './notifier.sns.config';
import { NotifierSnsService } from './notifier.sns.provider';

@Injectable()
export class NotifierService {
  constructor(
    private readonly notifierSnsConfig: NotifierSnsConfig,
    @Inject(LOGGER_PROVIDER) readonly log: LoggerService,
    @Inject(NotifierSnsService) private readonly sns: SNS,
    @Inject(StatsDService) private readonly statsd: StatsD | undefined
  ) {
    if (notifierSnsConfig == null) {
      throw new Error('Could not locate sns.notifier config');
    }

    if (!notifierSnsConfig.snsTopicArn) {
      this.log.warn('snsTopicArn missing!');
    }
    if (!notifierSnsConfig.snsTopicEndpoint) {
      this.log.warn('snsTopicEndpoint missing!');
    }
  }

  send(
    event: any,
    callback?: (
      err: ServiceException | undefined,
      data: PublishCommandOutput | undefined
    ) => void
  ) {
    const msg = event.data || {};
    msg.event = event.event;

    const startTime = Date.now();

    this.sns.publish(
      {
        TopicArn: this.notifierSnsConfig.snsTopicArn,
        Message: JSON.stringify(msg),
        MessageAttributes: this.formatMessageAttributes(msg),
      },
      (err: unknown, data?: PublishCommandOutput) => {
        this.onPublish(err as any, data, startTime, callback);
      }
    );
  }

  public onPublish(
    err: ServiceException,
    data: PublishCommandOutput | undefined,
    startTime: number,
    callback?: (
      err: ServiceException,
      data: PublishCommandOutput | undefined
    ) => void
  ) {
    if (this.statsd) {
      this.statsd.timing('notifier.publish', Date.now() - startTime);
    }

    if (err) {
      this.log.error('Notifier.publish', err);
    } else {
      this.log.debug?.('Notifier.publish success', data);
    }

    if (callback) {
      callback(err, data);
    }
  }

  private formatMessageAttributes(msg: {
    event: string;
    email: string;
  }): Record<string, MessageAttributeValue> {
    const map: Record<string, MessageAttributeValue> = {};

    map['event_type'] = {
      DataType: 'String',
      StringValue: msg.event,
    };

    if (msg.email) {
      map['email_domain'] = {
        DataType: 'String',
        StringValue: msg.email.split('@')[1],
      };
    }

    return map;
  }
}
