/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Inject, Injectable } from '@nestjs/common';
import { StatsD } from 'hot-shots';
import { SNS, AWSError } from 'aws-sdk';
import { NotifierSnsService } from './notifier.sns.provider';
import { ConfigService } from '@nestjs/config';
import { NotifierSnsConfig } from './notifier.sns.config';
import { StatsDService } from '@fxa/shared/metrics/statsd';
import { MozLoggerService } from '@fxa/shared/mozlog';

@Injectable()
export class NotifierService {
  private readonly config: NotifierSnsConfig;

  constructor(
    configService: ConfigService,
    private readonly log: MozLoggerService,
    @Inject(NotifierSnsService) private readonly sns: SNS,
    @Inject(StatsDService) private readonly statsd: StatsD | undefined
  ) {
    const config = configService.get<NotifierSnsConfig>('notifier.sns');
    if (config == null) {
      throw new Error('Could not locate sns.notifier config');
    }

    if (!config.snsTopicArn) {
      this.log.warn('', { message: 'snsTopicArn missing!' });
    }
    if (!config.snsTopicEndpoint) {
      this.log.warn('', { message: 'snsTopicEndpoint missing!' });
    }

    this.config = config;
  }

  send(
    event: any,
    callback?: (err: AWSError | undefined, data: SNS.PublishResponse) => void
  ) {
    const msg = event.data || {};
    msg.event = event.event;

    const startTime = Date.now();

    this.sns.publish(
      {
        TopicArn: this.config.snsTopicArn,
        Message: JSON.stringify(msg),
        MessageAttributes: this.formatMessageAttributes(msg),
      },
      (err: AWSError, data: SNS.PublishResponse) => {
        this.onPublish(err, data, startTime, callback);
      }
    );
  }

  public onPublish(
    err: AWSError | undefined,
    data: SNS.PublishResponse,
    startTime: number,
    callback?: (err: AWSError | undefined, data: SNS.PublishResponse) => void
  ) {
    if (this.statsd) {
      this.statsd.timing('notifier.publish', Date.now() - startTime);
    }

    if (err) {
      this.log.error('Notifier.publish', { err });
    } else {
      this.log.debug('Notifier.publish', { success: true, data });
    }

    if (callback) {
      callback(err, data);
    }
  }

  private formatMessageAttributes(msg: {
    event: string;
    email: string;
  }): SNS.MessageAttributeMap {
    const map: SNS.MessageAttributeMap = {};

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
