/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { PubSub } from '@google-cloud/pubsub';

export async function ensurePubSubEmulatorResources(
  pubsub: PubSub,
  names: { topicName: string; subscriptionName: string }
): Promise<void> {
  const [topic] = await pubsub.topic(names.topicName).get({ autoCreate: true });
  await topic.subscription(names.subscriptionName).get({ autoCreate: true });
}
