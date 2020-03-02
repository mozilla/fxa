# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

## branding
project-brand = Firefox Accounts
-brand-name-mozilla = Mozilla
-brand-name-firefox = Firefox

document =
  .title = Firefox Accounts

## general-aria
close-aria =
  .aria-label = Close modal

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
settings-subscriptions = Subscriptions & Payments

## legal footer
terms = Terms of Service
privacy = Privacy Notice

## plan details
product-plan-details-heading = Let's set up your subscription

# Variables:
    #  $intervalCount (Number) - The interval between payments, in days.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
day-based-plan-details-amount = { $intervalCount ->
  [one] { $productName } billed { $amount } daily
  *[other] { $productName } billed { $amount } every { $intervalCount } days
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in weeks.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
week-based-plan-details-amount = { $intervalCount ->
  [one] { $productName } billed { $amount } weekly
  *[other] { $productName } billed { $amount } every { $intervalCount } weeks
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in months.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
month-based-plan-details-amount = { $intervalCount ->
  [one] { $productName } billed { $amount } monthly
  *[other] { $productName } billed { $amount } every { $intervalCount } months
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in years.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
year-based-plan-details-amount = { $intervalCount ->
  [one] { $productName } billed { $amount } yearly
  *[other] { $productName } billed { $amount } every { $intervalCount } years
}

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
payment-legal-copy = { -brand-name-mozilla } uses Stripe for secure payment processing.
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

# Variables:
    #  $intervalCount (Number) - The interval between payments, in days.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
payment-confirm-day = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } daily</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } days</strong>, according to payment terms, until I cancel my subscription.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in weeks.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
payment-confirm-week = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } weekly</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } weeks</strong>, according to payment terms, until I cancel my subscription.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in months.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
payment-confirm-month = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } monthly</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } months</strong>, according to payment terms, until I cancel my subscription.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in years.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
payment-confirm-year = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } yearly</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } years</strong>, according to payment terms, until I cancel my subscription.
}

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

# Variables:
    #  $intervalCount (Number) - The interval between payments, in days.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
sub-update-confirm-day = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } daily</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } days</strong>, according to payment terms, until I cancel my subscription.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in weeks.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
sub-update-confirm-week = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } weekly</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } weeks</strong>, according to payment terms, until I cancel my subscription.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in months.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
sub-update-confirm-month = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } monthly</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } months</strong>, according to payment terms, until I cancel my subscription.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in years.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
sub-update-confirm-year = { $intervalCount ->
  [one] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } yearly</strong>, according to payment terms, until I cancel my subscription.
  *[other] I authorize { -brand-name-mozilla }, maker of { -brand-name-firefox } products, to charge my payment method <strong>{ $amount } every { $intervalCount } years</strong>, according to payment terms, until I cancel my subscription.
}

sub-update-submit = Change Plans
sub-update-indicator =
  .aria-label = upgrade indicator

## subscription upgrade plan details
# Variables:
    #  $intervalCount (Number) - The interval between payments, in days.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
plan-price-day = { $intervalCount ->
  [one] { $amount } daily
  *[other] { $amount } every { $intervalCount } days
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in weeks.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
plan-price-week = { $intervalCount ->
  [one] { $amount } weekly
  *[other] { $amount } every { $intervalCount } weeks
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in months.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
plan-price-month = { $intervalCount ->
  [one] { $amount } monthly
  *[other] { $amount } every { $intervalCount } months
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in years.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
plan-price-year = { $intervalCount ->
  [one] { $amount } yearly
  *[other] { $amount } every { $intervalCount } years
}

## payment update
# Variables:
    #  $intervalCount (Number) - The interval between payments, in days.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
    #  $date (String) - The formatted date for the next time a charge will occur.
pay-update-billing-description-day = { $intervalCount ->
  [one] You are billed { $amount } daily for { $name }. Your next payment occurs on { $date }.
  *[other] You are billed { $amount } every { $intervalCount } days for { $name }. Your next payment occurs on { $date }.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in weeks.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
    #  $date (String) - The formatted date for the next time a charge will occur.
pay-update-billing-description-week = { $intervalCount ->
  [one] You are billed { $amount } weekly for { $name }. Your next payment occurs on { $date }.
  *[other] You are billed { $amount } every { $intervalCount } weeks for { $name }. Your next payment occurs on { $date }.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in months.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
    #  $date (String) - The formatted date for the next time a charge will occur.
pay-update-billing-description-month = { $intervalCount ->
  [one] You are billed { $amount } monthly for { $name }. Your next payment occurs on { $date }.
  *[other] You are billed { $amount } every { $intervalCount } months for { $name }. Your next payment occurs on { $date }.
}

# Variables:
    #  $intervalCount (Number) - The interval between payments, in years.
    #  $productName (String) - The name of the subscribed product.
    #  $amount (String) - The amount billed, in USD. It will be formatted as currency.
    #  $date (String) - The formatted date for the next time a charge will occur.
pay-update-billing-description-year = { $intervalCount ->
  [one] You are billed { $amount } yearly for { $name }. Your next payment occurs on { $date }.
  *[other] You are billed { $amount } every { $intervalCount } years for { $name }. Your next payment occurs on { $date }.
}

pay-update-card-exp = Expires { $expirationDate }
pay-update-change-btn = Change

## reactivate
reactivate-confirm-dialog-header = Want to keep using { $name }?
reactivate-confirm-copy =
    Your access to { $name } will continue, and your billing cycle
    and payment will stay the same. Your next charge will be
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

account-activated = Your account is activated, <userEl/>

## subscription route index
sub-route-idx-updating = Updating billing information...
sub-route-idx-reactivating = Reactivating subscription failed
sub-route-idx-cancel-failed = Cancelling subscription failed
sub-route-idx-contact = Contact Support
sub-route-idx-cancel-msg-title = We're sorry to see you go
sub-route-idx-cancel-msg =
    Your { $name } subscription has been cancelled.
          <br />
          You will still have access to { $name } until { $date }.
sub-route-idx-cancel-aside =
    Have questions? Visit <a>{ -brand-name-mozilla } Support</a>.
sub-subscription-error =
  .title = Problem loading subscriptions
sub-customer-error =
  .title = Problem loading customer
sub-billing-update-success = Your billing information has been updated successfully

## subscription create
sub-failed = Subscription failed

## plan-details
plan-details-header = Product details
plan-details-show-button = Show details
plan-details-hide-button = Hide details

fpn-details-1 = Device-level encryption
fpn-details-2 = Servers in 30+ countries
fpn-details-3 = Connect 5 devices with one subscription
fpn-details-4 = Available for Windows, iOS and Android

## payment confirmation
payment-confirmation-alert = Click here to download
payment-confirmation-mobile-alert = Didn't open app? <a>Click Here</a>
payment-confirmation-heading = Thank You { $displayName }!
payment-confirmation-subheading = A confirmation email has been sent to { $email }
payment-confirmation-order-heading = Order details
payment-confirmation-invoice-number = Invoice #{ $invoiceNumber }
payment-confirmation-billing-heading = Billed to
payment-confirmation-details-heading = Payment details
payment-confirmation-amount = ${ $amount } per { $interval }
payment-confirmation-cc-preview = ending in { $last4 }
payment-confirmation-download-button = Continue to download
