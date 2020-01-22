# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

## branding
project-brand = Firefox Accounts

document =
  .title = Firefox Accounts

## app error dialog

general-error-heading = General application error

basic-error-message = Something went wrong. Please try again later.
payment-error-1 = Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.
payment-error-2 = Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.

expired-card-error = It looks like your credit card has expired. Try another card.
insufficient-funds-error = It looks like your card has insufficient funds. Try another card.
withdrawal-count-limit-exceeded-error = It looks like this transaction will put you over your credit limit. Try another card.
charge-exceeds-source-limit = It looks like this transaction will put you over your daily credit limit. Try another card or in 24 hours.
instant-payouts-unsupported = It looks like your debit card isn't setup for instant payments. Try another debit or credit card.
duplicate-transaction = Hmm. Looks like an identical transaction was just sent. Check your payment history.
coupon-expired = It looks like that promo code has expired.
card-error = Your transaction could not be processed. Please verify your credit card information and try again.

## settings
settings-home = Account Home
settings-subscriptions = Subscriptions

## legal footer
terms = Terms of Service
privacy = Privacy Notice

## plan details
product-plan-details-heading = Let's set up your subscription
product-plan-details-amount = { $productName } for { $amount } per { $interval }

## Product route
product-plan-error =
  .title = Problem loading plans
product-profile-error =
  .title = Problem loading profile
product-customer-error =
  .title = Problem loading customer
product-plan-not-found = Plan not found
product-no-such-plan = No such plan for this product.

## payment legal blurb
payment-legal-copy = Mozilla uses Stripe for secure payment processing.
payment-legal-link = View the <a>Stripe privacy policy</a>.

## payment form
payment-name =
  .placeholder = Full Name
  .label = Name as it appears on your card
payment-ccn =
  .label = Card number
payment-exp =
  .label = Exp. date
payment-cvc =
  .label = CVC
payment-zip =
  .label = ZIP code
payment-confirm = I authorize Mozilla, maker of Firefox products, to charge my payment method <strong>{ $amount } per { $interval }</strong>, according to payment terms, until I cancel my subscription.
payment-cancel-btn = Cancel
payment-update-btn = Update

payment-validate-name-error = Please enter your name
payment-validate-zip-required = Zip code is required
payment-validate-zip-short = Zip code is too short

## subscription redirect
sub-redirect-ready = Your subscription is ready
sub-redirect-copy = Please take a moment to tell us about your experience.
sub-redirect-skip-survey = No thanks, just take me to my product.

## fields
default-input-error = This field is required

## subscription upgrade
sub-update-failed = Plan update failed
sub-update-title = Billing Information
sub-update-card-ending = Card Ending { $last }
sub-update-card-exp = Expires { $cardExpMonth }/{ $cardExpYear }
sub-update-copy =
    Your plan will change immediately, and you’ll be charged an adjusted
    amount for the rest of your billing cycle. Starting { $startingDate }
    you’ll be charged the full amount.
sub-update-confirm =
    I authorize Mozilla, maker of Firefox products, to charge my payment
    <strong>${ $amount }/{ $interval }</strong>
    , according to payment terms, until I cancel my subscription.
sub-update-submit = Change Plans

## payment update
pay-update-billing-description =
  You are billed ${ $amount } per { $interval }
  for { $name }. Your next payment occurs on { $date }.
pay-update-card-exp = Expires { $expirationDate }
pay-update-change-btn = Change

## reactivate
reactivate-confirm-dialog-header = Want to keep using { $productName }?
reactivate-confirm-copy =
    Your access to { $name } will continue, and your billing cycle
    and payment will stay the same. Your next charge will be $
    { $amount } to the card ending in { $last } on { $endDate }.
reactivate-confirm-button = Resubscribe
reactivate-panel-date = You cancelled your subscription on { $date }.
reactivate-panel-copy = You will lose access to { $name } on <strong>{ $date }</strong>.
reactivate-success-copy = Thanks! You're all set.
reactivate-success-button = Close

## subscription item
sub-item-missing = Problem loading subscriptions
sub-item-missing-msg = Please try again later.
sub-item-no-such-plan = No such plan for this subscription.
sub-item-cancel-sub = Cancel Subscription
sub-item-stay-sub = Stay Subscribed
sub-item-cancel-msg =
    You will no longer be able to use { $name } after
    { $period }, the last day of your billing cycle.
sub-item-cancel-confirm =
    Cancel my access and my saved information within
    { $name } on { $period }
