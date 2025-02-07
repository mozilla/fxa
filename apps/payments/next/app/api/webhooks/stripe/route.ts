/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getApp } from '@fxa/payments/ui/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature || typeof signature !== 'string') {
    return new Response('Bad Request', { status: 400 });
  }

  const payload = await request.text();

  const stripeWebhookService = getApp().getStripeWebhookService();

  await stripeWebhookService.handleWebhookEvent(payload, signature);

  return new Response('Received', { status: 200 });
}
