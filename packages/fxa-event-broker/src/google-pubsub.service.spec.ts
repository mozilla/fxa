/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import { PubSub } from '@google-cloud/pubsub';
import { FactoryProvider } from '@nestjs/common';

import { GooglePubsubFactory } from './google-pubsub.service';

jest.mock('@google-cloud/pubsub', () => ({ PubSub: jest.fn() }));

describe('GooglePubsubFactory', () => {
  const create = (audience: string) =>
    (GooglePubsubFactory as FactoryProvider).useFactory({
      get: () => ({ audience }),
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the demo project for the local example.com audience', async () => {
    await create('example.com');
    expect(PubSub).toHaveBeenCalledWith({ projectId: 'demo-fxa' });
  });

  it('uses the default project for other audiences', async () => {
    await create('https://event-broker.example.org');
    expect(PubSub).toHaveBeenCalledWith();
  });
});
