/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Provider } from '@nestjs/common';
import { IsString, IsUrl } from 'class-validator';

export class NotifierSnsConfig {
  @IsString()
  public readonly snsTopicArn!: string;

  @IsUrl({ require_tld: false })
  public readonly snsTopicEndpoint!: string;
}

export const MockNotifierSnsConfig = {
  snsTopicArn: 'arn:aws:sns:us-west-2:123456789012:MyTopic',
  snsTopicEndpoint: 'http://localhost:4566',
} satisfies NotifierSnsConfig;

export const MockNotifierSnsConfigProvider = {
  provide: NotifierSnsConfig,
  useValue: MockNotifierSnsConfig,
} satisfies Provider<NotifierSnsConfig>;
