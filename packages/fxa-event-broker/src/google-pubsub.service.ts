/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { PubSub } from '@google-cloud/pubsub';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AppConfig } from './config';

export const GooglePubsubFactory: Provider = {
  provide: 'GOOGLEPUBSUB',
  useFactory: async (config: ConfigService<AppConfig>) => {
    const pubsubConfig = config.get('pubsub') as AppConfig['pubsub'];
    if (pubsubConfig.audience === 'example.com') {
      return new PubSub({ projectId: 'fxa-event-broker' });
    }
    return new PubSub();
  },
  inject: [ConfigService],
};
