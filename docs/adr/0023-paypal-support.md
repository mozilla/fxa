# Add PayPal as a supported payment option

- Deciders: Ben Bangert, Barry Chen, Tyler Duzan, Bianca Danforth, Se Yeon Kim, Wennie Leung
- Date: 2020-11-11

## Context and Problem Statement

The Subscription Platform was implemented with Stripe as the payment processor and driver of subscription logic. Stripe is used as the source of truth for whether an account has subscriptions associated with it. We would like to add PayPal as a payment option for subscriptions, and integrate it appropriately with the existing system in a least-effort manner that is ideally flexible enough to support future expansions of payment processors, such as IAP.

## Decision Drivers

- Engineering resources
- Future effort needed to integrate IAP
- Code complexity as it relates to existing Subscription Platform infrastructure

## Considered Options

- Stripe-driven out-of-band invoice processing
- PayPal subscriptions linked in FxA
- Recurly

## Decision Outcome

Stripe-driven out-of-band invoice processing. This was originally considered to be the slower of the approaches, but using PayPal subscriptions ended up being approximately the same engineering effort. Given additional user experience benefits of the Stripe-driven approach, it is now the recommend implementation path.

## Pros and Cons of the Options

### Stripe-driven out-of-band invoice processing

Stripe defaults subscriptions to billing automatically using a payment source on file with Stripe. Stripe also provides the option to have subscriptions that have a `collection_method` of `send_invoice`. In this model, Stripe can track subscriptions, and generate invoices that can be paid `out-of-band`. This allows Stripe to have an accurate record of charges, invoices, and subscriptions but how the invoice is considered 'paid' is up to FxA.

PayPal has a feature called reference transactions that allow FxA to get a customers authorization to charge their PayPal account. This authorization allows for later payments to be charged against the PayPal account. We will track this reference ID in Stripe metadata for the customer and mark the subscription as `send_invoice`.

FxA will implement additional logic to listen for invoice creation webhooks and switch their `auto_advance` off if the subscription has metadata indicating it should be paid via a PayPal reference ID. We will then check the invoice for the amount to charge and run the PayPal charge via PayPal API. The invoice will then be updated to reflect whether it was paid successfully or not.

Pros:

- Stripe continues to serve as an accurate source of truth regarding a customers subscription.
- All the logic that determines active subscriptions and entitlements using Stripe can be used as-is.
- Multiple product support works as-is.
- Support representatives can see accurate payment history in Stripe for customers paying via PayPal.
- Support can credit a PayPal customer, just as they can for a credit card customer.
- Can extend in a similar manner to track a correlating IAP for a user.
- Can handle switching payment method from credit card to PayPal reference ID, and vice versa.
- PayPal authorization is retained so that additional products can be purchased/credited without requiring the user to return to the PayPal flow.
- Cancel/resubscribe before the subscription expires works as-is.

Cons:

- Additional metadata in Stripe can start pushing us closer to metadata limits on objects.
- Recreate Stripe's [automatic advancement and collection logic](https://stripe.com/docs/billing/invoices/overview#auto_advance) that runs PayPal transactions which we need to ensure work correctly (checks to prevent double-charging, retries, and transaction success verification).
- We still could end up storing PayPal reference ID's in a separate db table to ensure we track
  prior PayPal billing.
- While we could more easily support multiple payment methods on the back end, this would add complexity to the subscription management flow on the front end.

### PayPal Subscriptions linked/tracked by FxA

In this approach, we would create products/plans in PayPal, and link them back to the Stripe equivalent by updating Stripe metadata on the products/plans. FxA would also gain an additional database table that maps PayPal subscription ids to the Fx account. All the logic in FxA that looks up a user's subscriptions would be updated to check the PayPal linking table to determine active subscriptions.

PayPal would handle running the charges on a recurring basis per the PayPal plan that is setup. FxA would periodically check the subscriptions via PayPal API to ensure they're still actively being paid (PayPal has fairly lenient handling on whether payments occurred) on the schedule we want.

Pros:

- PayPal is responsible for charging the customer and managing the subscription lifecycle.
- Can extend in a similar manner to track a correlating IAP for a user.

Cons:

- All the logic that determines active subscriptions and entitlements needs additional
  logic/abstractions to query the database table and map active PayPal subscriptions to the
  Stripe subscription.
- Ability to easily cancel/re-subscribe on management page is lost, as canceled PayPal billing agreements
  cannot be restored.
- To reduce complexity, anyone paying via PayPal would be locked into using PayPal for later
  subscriptions and users paying via Stripe would not be presented with any PayPal payment options.
  This could frustrate users that want to switch, as they'd have to cancel, wait till the
  subscription expires, and then subscribe again with PayPal.
- Stripe subscription features can't be used, such as:
  - Crediting a user for a month
  - Coupons
  - Consolidating multiple plans into a single subscription for aligned billing
- Every additional subscription requires a full PayPal authorization flow.
- PayPal occasionally misses delivery of webhooks, which requires us to build our own script
  to periodically verify that PayPal subscriptions are still active and have had their latest
  transaction processed successfully.
- PayPal subscriptions can be suspended and resumed. This doesn't map to any equivalent in Stripe
  subscriptions and would require custom handling in our code logic, entitlements, and UX.

### Recurly

Recurly is a hosted solution, similar to Stripe, that manges subscriptions. Unlike Stripe it does not process transactions, leaving those to payment processors. Recurly can use multiple payment processors, such as Stripe and PayPal, and would handle running transactions in a similar manner as our Stripe-driven approach, except they've already built it.

Pros:

- We do not need to implement PayPal logic at all, as Recurly handles it for us.
- Ongoing future maintenance should be lower as Stripe/PayPal/etc changes over time are
  maintained by Recurly, not us.

Cons:

- Recurly does not list the actual cost for the integration, but its estimated to be around an
  additional 1.5% of total revenue in addition to the payment processing costs.
- Substantial work involved to migrate users over and switch all Stripe integration logic to work
  with Recurly APIs.
- Would need a completely custom solution still for IAP.
