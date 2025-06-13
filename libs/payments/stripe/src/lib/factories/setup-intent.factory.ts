/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { faker } from '@faker-js/faker';
import { type StripeSetupIntent } from '../stripe.client.types';

export const StripeSetupIntentFactory = (
  override?: Partial<StripeSetupIntent>
): StripeSetupIntent => ({
  id: `seti_${faker.string.alphanumeric({ length: 14 })}`,
  object: 'setup_intent',
  application: null,
  automatic_payment_methods: {
    enabled: true,
  },
  cancellation_reason: null,
  client_secret: faker.string.uuid(),
  created: faker.date.past().getTime() / 1000,
  customer: null,
  description: null,
  flow_directions: null,
  latest_attempt: null,
  last_setup_error: null,
  livemode: true,
  mandate: null,
  metadata: {},
  next_action: null,
  on_behalf_of: null,
  payment_method: null,
  payment_method_configuration_details: null,
  payment_method_options: {
    card: {
      mandate_options: null,
      network: null,
      request_three_d_secure: 'automatic',
    },
    link: {
      persistent_token: null,
    },
  },
  payment_method_types: ['card', 'link'],
  single_use_mandate: null,
  status: 'requires_payment_method',
  usage: 'off_session',
  ...override,
});

