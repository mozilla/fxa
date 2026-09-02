/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { PubSub, Subscription, Topic } from '@google-cloud/pubsub';

import { ensurePubSubEmulatorResources } from './ensurePubSubEmulatorResources';

describe('ensurePubSubEmulatorResources', () => {
  const pubsub = new PubSub({ projectId: 'test', apiEndpoint: '127.0.0.1:1' });
  const names = {
    topicName: 'metering-events',
    subscriptionName: 'metering-events-clickhouse',
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates the topic when it is missing', async () => {
    const topicGet = jest
      .spyOn(Topic.prototype, 'get')
      .mockImplementation(async function (this: Topic) {
        return [this, {}];
      });
    jest
      .spyOn(Subscription.prototype, 'get')
      .mockImplementation(async function (this: Subscription) {
        return [this, {}];
      });

    await ensurePubSubEmulatorResources(pubsub, names);

    expect(topicGet).toHaveBeenCalledWith({ autoCreate: true });
  });

  it('creates the subscription on that topic when it is missing', async () => {
    jest.spyOn(Topic.prototype, 'get').mockImplementation(async function (
      this: Topic
    ) {
      return [this, {}];
    });
    const subscriptionGet = jest
      .spyOn(Subscription.prototype, 'get')
      .mockImplementation(async function (this: Subscription) {
        return [this, {}];
      });
    const subscription = jest.spyOn(Topic.prototype, 'subscription');

    await ensurePubSubEmulatorResources(pubsub, names);

    expect(subscription).toHaveBeenCalledWith('metering-events-clickhouse');
    expect(subscriptionGet).toHaveBeenCalledWith({ autoCreate: true });
  });
});
