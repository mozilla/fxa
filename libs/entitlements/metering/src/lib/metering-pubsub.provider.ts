/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub } from '@google-cloud/pubsub';
import { Provider } from '@nestjs/common';

import { MeteringPubSubConfig } from './metering-pubsub.config';

export const MeteringPubSubClient = Symbol('METERING_PUBSUB_CLIENT');

export const MeteringPubSubClientProvider: Provider<PubSub> = {
  provide: MeteringPubSubClient,
  useFactory: (config: MeteringPubSubConfig) => {
    const { projectId, emulatorHost } = config;
    if (emulatorHost) {
      return new PubSub({ projectId, apiEndpoint: emulatorHost });
    }
    return new PubSub({ projectId });
  },
  inject: [MeteringPubSubConfig],
};
