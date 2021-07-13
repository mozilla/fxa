/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
import program from 'commander';
import { ACTIVE_SUBSCRIPTION_STATUSES } from 'fxa-shared/subscriptions/stripe';
import Stripe from 'stripe';

import { setupProcesingTaskObjects } from '../lib/payments/processing-tasks-setup';

const pckg = require('../package.json');

export async function init() {
  // Load program options
  program.version(pckg.version).parse(process.argv);

  const { log, stripeHelper } = await setupProcesingTaskObjects();

  const stripe = (stripeHelper as any).stripe as Stripe;

  // Locate all plans using a VAT currency
  const plans = (await stripe.plans.list({ limit: 100 })).data.filter((plan) =>
    ['eur', 'chf'].includes(plan.currency)
  );

  for (const activeStatus of ACTIVE_SUBSCRIPTION_STATUSES) {
    for (const plan of plans) {
      for await (const sub of stripe.subscriptions.list({
        limit: 100,
        status: activeStatus,
        price: plan.id,
      })) {
        const customer = await stripeHelper.expandResource(
          sub.customer,
          'customers'
        );
        if (customer.deleted) {
          continue;
        }

        // Attach a Tax ID to the customer if they're missing one.
        if (!stripeHelper.customerTaxId(customer)) {
          await stripeHelper.addTaxIdToCustomer(customer);
        }

        // Continue if there's a default tax rate for the sub already.
        if (sub.default_tax_rates && sub.default_tax_rates.length > 0) {
          continue;
        }

        // Figure out the country code for the customer
        let countryCode;
        if (sub.collection_method === 'send_invoice') {
          // It's paypal, locate the country on the customer
          countryCode = customer.address?.country?.toUpperCase();
        } else {
          // It's a card, locate the country on the payment method
          const paymentMethodId =
            customer.invoice_settings.default_payment_method;
          if (!paymentMethodId) {
            continue;
          }
          if (typeof paymentMethodId === 'string') {
            countryCode = (await stripeHelper.getPaymentMethod(paymentMethodId))
              .card?.country;
          } else {
            countryCode = paymentMethodId.card?.country;
          }
        }
        if (!countryCode) {
          log.info('no-country-code-found', {
            customerId: customer.id,
            subId: sub.id,
          });
          continue;
        }

        // Fetch the applicable tax rates
        const taxRateId = (await stripeHelper.taxRateByCountryCode(countryCode))
          ?.id;
        if (!taxRateId) {
          log.info('no-tax-rate', { countryCode, subId: sub.id });
          continue;
        }

        // Update the subscription for the default tax rate
        await stripe.subscriptions.update(sub.id, {
          default_tax_rates: [taxRateId],
        });
        log.info('subscription.updated', { subId: sub.id });
      }
    }
  }
  return 0;
}

if (require.main === module) {
  init()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .then((result) => process.exit(result));
}
