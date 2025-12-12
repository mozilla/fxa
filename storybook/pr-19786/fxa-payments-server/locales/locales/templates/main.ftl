


-brand-mozilla = Mozilla
-brand-firefox = Firefox

-product-firefox-accounts = Firefox accounts

-product-mozilla-account = Mozilla account

-product-mozilla-accounts =
    { $capitalization ->
       *[lowercase] Mozilla accounts
        [uppercase] Mozilla Accounts
    }

-product-firefox-account = Firefox account

-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay

-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa

-app-store = App Store
-google-play = Google Play

app-general-err-heading = General application error
app-general-err-message = Something went wrong. Please try again later.

app-query-parameter-err-heading = Bad Request: Invalid Query Parameters


app-footer-mozilla-logo-label = { -brand-mozilla } logo
app-footer-privacy-notice = Website Privacy Notice
app-footer-terms-of-service = Terms of Service


app-default-title-2 = { -product-mozilla-accounts }

app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Opens in new window


app-loading-spinner-aria-label-loading = Loading…


app-logo-alt-3 =
  .alt = { -brand-mozilla } m logo


settings-home = Account Home
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Promo Code Applied
coupon-submit = Apply
coupon-remove = Remove
coupon-error = The code you entered is invalid or expired.
coupon-error-generic = An error occurred processing the code. Please try again.
coupon-error-expired = The code you entered has expired.
coupon-error-limit-reached = The code you entered has reached its limit.
coupon-error-invalid = The code you entered is invalid.
coupon-enter-code =
  .placeholder = Enter Code


default-input-error = This field is required
input-error-is-required = { $label } is required


brand-name-mozilla-logo = { -brand-mozilla } logo


new-user-sign-in-link-2 = Already have a { -product-mozilla-account }? <a>Sign in</a>
new-user-enter-email =
  .label = Enter your email
new-user-confirm-email =
  .label = Confirm your email
new-user-subscribe-product-updates-mozilla = I’d like to receive product news and updates from { -brand-mozilla }
new-user-subscribe-product-updates-snp = I’d like to receive security and privacy news and updates from { -brand-mozilla }
new-user-subscribe-product-updates-hubs = I’d like to receive product news and updates from { -product-mozilla-hubs } and { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = I’d like to receive product news and updates from { -product-mdn-plus } and { -brand-mozilla }
new-user-subscribe-product-assurance = We only use your email to create your account. We will never sell it to a third party.
new-user-email-validate = Email is not valid
new-user-email-validate-confirm = Emails do not match
new-user-already-has-account-sign-in = You already have an account. <a>Sign in</a>
new-user-invalid-email-domain = Mistyped email? { $domain } does not offer email.


payment-confirmation-thanks-heading = Thank you!
payment-confirmation-thanks-heading-account-exists = Thanks, now check your email!

payment-confirmation-thanks-subheading = A confirmation email has been sent to { $email } with details on how to get started with { $product_name }.

payment-confirmation-thanks-subheading-account-exists = You’ll receive an email at { $email } with instructions for setting up your account, as well as your payment details.

payment-confirmation-order-heading = Order details
payment-confirmation-invoice-number = Invoice #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Payment information

payment-confirmation-amount = { $amount } per { $interval }

payment-confirmation-amount-day = { $intervalCount ->
  [one] { $amount } daily
  *[other] { $amount } every { $intervalCount } days
}
payment-confirmation-amount-week = { $intervalCount ->
  [one] { $amount } weekly
  *[other] { $amount } every { $intervalCount } weeks
}
payment-confirmation-amount-month = { $intervalCount ->
  [one] { $amount } monthly
  *[other] { $amount } every { $intervalCount } months
}
payment-confirmation-amount-year = { $intervalCount ->
  [one] { $amount } yearly
  *[other] { $amount } every { $intervalCount } years
}

payment-confirmation-download-button = Continue to download


payment-confirm-with-legal-links-static-3 = I authorize { -brand-mozilla } to charge my payment method for the amount shown, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.

payment-confirm-checkbox-error = You need to complete this before moving forward


payment-error-retry-button = Try again
payment-error-manage-subscription-button = Manage my subscription


iap-upgrade-already-subscribed-2 = You already have a { $productName } subscription via the { -brand-google } or { -brand-apple } app stores.
iap-upgrade-no-bundle-support = We don’t support upgrades for these subscriptions, but we will soon.
iap-upgrade-contact-support = You can still get this product — please contact support so we can help you.
iap-upgrade-get-help-button = Get help


payment-name =
  .placeholder = Full Name
  .label = Name as it appears on your card
payment-cc =
  .label = Your card

payment-cancel-btn = Cancel
payment-update-btn = Update
payment-pay-btn = Pay now
payment-pay-with-paypal-btn-2 = Pay with { -brand-paypal }

payment-validate-name-error = Please enter your name


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } uses { -brand-name-stripe } and { -brand-paypal } for secure payment processing.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } privacy policy</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } privacy policy</paypalPrivacyLink>

payment-legal-copy-paypal-2 = { -brand-mozilla } uses { -brand-paypal } for secure payment processing.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } privacy policy</paypalPrivacyLink>

payment-legal-copy-stripe-3 = { -brand-mozilla } uses { -brand-name-stripe } for secure payment processing.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } privacy policy</stripePrivacyLink>


payment-method-header = Choose your payment method
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = First you’ll need to approve your subscription


payment-processing-message = Please wait while we process your payment…


payment-confirmation-cc-card-ending-in = Card ending in { $last4 }


pay-with-heading-paypal-2 = Pay with { -brand-paypal }


plan-details-header = Product details
plan-details-list-price = List Price
plan-details-show-button = Show details
plan-details-hide-button = Hide details
plan-details-total-label = Total
plan-details-tax = Taxes and Fees


product-no-such-plan = No such plan for this product.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } tax

price-details-no-tax-day = { $intervalCount ->
  [one] { $priceAmount } daily
  *[other] { $priceAmount } every { $intervalCount } days
}
  .title = { $intervalCount ->
    [one] { $priceAmount } daily
    *[other] { $priceAmount } every { $intervalCount } days
  }
price-details-no-tax-week = { $intervalCount ->
  [one] { $priceAmount } weekly
  *[other] { $priceAmount } every { $intervalCount } weeks
}
  .title = { $intervalCount ->
    [one] { $priceAmount } weekly
    *[other] { $priceAmount } every { $intervalCount } weeks
  }
price-details-no-tax-month = { $intervalCount ->
  [one] { $priceAmount } monthly
  *[other] { $priceAmount } every { $intervalCount } months
}
  .title = { $intervalCount ->
    [one] { $priceAmount } monthly
    *[other] { $priceAmount } every { $intervalCount } months
  }
price-details-no-tax-year = { $intervalCount ->
  [one] { $priceAmount } yearly
  *[other] { $priceAmount } every { $intervalCount } years
}
  .title = { $intervalCount ->
    [one] { $priceAmount } yearly
    *[other] { $priceAmount } every { $intervalCount } years
  }

price-details-tax-day = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax daily
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } days
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax daily
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } days
  }
price-details-tax-week = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax weekly
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } weeks
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax weekly
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } weeks
  }
price-details-tax-month = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax monthly
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } months
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax monthly
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } months
  }
price-details-tax-year = { $intervalCount ->
  [one] { $priceAmount } + { $taxAmount } tax yearly
  *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } years
}
  .title = { $intervalCount ->
    [one] { $priceAmount } + { $taxAmount } tax yearly
    *[other] { $priceAmount } + { $taxAmount } tax every { $intervalCount } years
  }


subscription-create-title = Set up your subscription
subscription-success-title = Subscription confirmation
subscription-processing-title = Confirming subscription…
subscription-error-title = Error confirming subscription…
subscription-noplanchange-title = This subscription plan change is not supported
subscription-iapsubscribed-title = Already subscribed

sub-guarantee = 30-day money-back guarantee


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization:"uppercase") }
terms = Terms of Service
privacy = Privacy Notice
terms-download = Download Terms


document =
  .title = Firefox Accounts

close-aria =
  .aria-label = Close modal

settings-subscriptions-title = Subscriptions

coupon-promo-code = Promo Code


plan-price-interval-day = { $intervalCount ->
  [one] { $amount } daily
  *[other] { $amount } every { $intervalCount } days
}
  .title = { $intervalCount ->
    [one] { $amount } daily
    *[other] { $amount } every { $intervalCount } days
  }
plan-price-interval-week = { $intervalCount ->
  [one] { $amount } weekly
  *[other] { $amount } every { $intervalCount } weeks
}
  .title = { $intervalCount ->
    [one] { $amount } weekly
    *[other] { $amount } every { $intervalCount } weeks
  }
plan-price-interval-month = { $intervalCount ->
  [one] { $amount } monthly
  *[other] { $amount } every { $intervalCount } months
}
  .title = { $intervalCount ->
    [one] { $amount } monthly
    *[other] { $amount } every { $intervalCount } months
  }
plan-price-interval-year = { $intervalCount ->
  [one] { $amount } yearly
  *[other] { $amount } every { $intervalCount } years
}
  .title = { $intervalCount ->
    [one] { $amount } yearly
    *[other] { $amount } every { $intervalCount } years
  }


general-error-heading = General application error

basic-error-message = Something went wrong. Please try again later.
payment-error-1 = Hmm. There was a problem authorizing your payment. Try again or get in touch with your card issuer.
payment-error-2 = Hmm. There was a problem authorizing your payment. Get in touch with your card issuer.
payment-error-3b = An unexpected error has occurred while processing your payment, please try again.
expired-card-error = It looks like your credit card has expired. Try another card.
insufficient-funds-error = It looks like your card has insufficient funds. Try another card.
withdrawal-count-limit-exceeded-error = It looks like this transaction will put you over your credit limit. Try another card.
charge-exceeds-source-limit = It looks like this transaction will put you over your daily credit limit. Try another card or in 24 hours.
instant-payouts-unsupported = It looks like your debit card isn’t setup for instant payments. Try another debit or credit card.
duplicate-transaction = Hmm. Looks like an identical transaction was just sent. Check your payment history.
coupon-expired = It looks like that promo code has expired.
card-error = Your transaction could not be processed. Please verify your credit card information and try again.
country-currency-mismatch = The currency of this subscription is not valid for the country associated with your payment.
currency-currency-mismatch = Sorry. You can’t switch between currencies.
location-unsupported = Your current location is not supported according to our Terms of Service.
no-subscription-change = Sorry. You can’t change your subscription plan.
iap-already-subscribed = You’re already subscribed through the { $mobileAppStore }.
fxa-account-signup-error-2 = A system error caused your { $productName } sign-up to fail. Your payment method has not been charged. Please try again.
fxa-post-passwordless-sub-error = Subscription confirmed, but the confirmation page failed to load. Please check your email to set up your account.
newsletter-signup-error = You’re not signed up for product update emails. You can try again in your account settings.

product-plan-error =
  .title = Problem loading plans
product-profile-error =
  .title = Problem loading profile
product-customer-error =
  .title = Problem loading customer
product-plan-not-found = Plan not found
product-location-unsupported-error = Location not supported


coupon-success = Your plan will automatically renew at the list price.
coupon-success-repeating = Your plan will automatically renew after { $couponDurationDate } at the list price.


new-user-step-1-2 = 1. Create a { -product-mozilla-account }
new-user-card-title = Enter your card information
new-user-submit = Subscribe Now

sub-update-payment-title = Payment information


pay-with-heading-card-only = Pay with card

product-invoice-preview-error-title = Problem loading invoice preview
product-invoice-preview-error-text = Could not load invoice preview


subscription-iaperrorupgrade-title = We can’t upgrade you quite yet


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Review your change
sub-change-failed = Plan change failed
sub-update-acknowledgment =
    Your plan will change immediately, and you’ll be charged a prorated
    amount today for the rest of this billing cycle. Starting { $startingDate }
    you’ll be charged the full amount.
sub-change-submit = Confirm change
sub-update-current-plan-label = Current plan
sub-update-new-plan-label = New plan
sub-update-total-label = New total
sub-update-prorated-upgrade = Prorated Upgrade


sub-update-new-plan-daily = { $productName } (Daily)
sub-update-new-plan-weekly = { $productName } (Weekly)
sub-update-new-plan-monthly = { $productName } (Monthly)
sub-update-new-plan-yearly = { $productName } (Yearly)

sub-update-prorated-upgrade-credit = Negative balance shown will be applied as credits to your account and used towards future invoices.


sub-item-cancel-sub = Cancel Subscription
sub-item-stay-sub = Stay Subscribed

sub-item-cancel-msg =
    You will no longer be able to use { $name } after
    { $period }, the last day of your billing cycle.
sub-item-cancel-confirm =
    Cancel my access and my saved information within
    { $name } on { $period }

sub-promo-coupon-applied = { $promotion_name } coupon applied: <priceDetails></priceDetails>

subscription-management-account-credit-balance = This subscription payment resulted in a credit to your account balance: <priceDetails></priceDetails>


sub-route-idx-reactivating = Reactivating subscription failed
sub-route-idx-cancel-failed = Cancelling subscription failed
sub-route-idx-contact = Contact Support
sub-route-idx-cancel-msg-title = We’re sorry to see you go
sub-route-idx-cancel-msg =
    Your { $name } subscription has been cancelled.
          <br />
          You will still have access to { $name } until { $date }.
sub-route-idx-cancel-aside-2 =
    Have questions? Visit <a>{ -brand-mozilla } Support</a>.


sub-customer-error =
  .title = Problem loading customer
sub-invoice-error =
  .title = Problem loading invoices
sub-billing-update-success = Your billing information has been updated successfully
sub-invoice-previews-error-title = Problem loading invoice previews
sub-invoice-previews-error-text = Could not load invoice previews


pay-update-change-btn = Change
pay-update-manage-btn = Manage


sub-next-bill = Next billed on { $date }
sub-next-bill-due-date = Next bill is due { $date }
sub-expires-on = Expires on { $date }


pay-update-card-exp = Expires { $expirationDate }
sub-route-idx-updating = Updating billing information…
sub-route-payment-modal-heading = Invalid billing information
sub-route-payment-modal-message-2 = There seems to be an error with your { -brand-paypal } account, we need you to take the necessary steps to resolve this payment issue.
sub-route-missing-billing-agreement-payment-alert = Invalid payment information; there is an error with your account. <div>Manage</div>
sub-route-funding-source-payment-alert = Invalid payment information; there is an error with your account. This alert may take some time to clear after you successfully update your information. <div>Manage</div>


sub-item-no-such-plan = No such plan for this subscription.
invoice-not-found = Subsequent invoice not found
sub-item-no-such-subsequent-invoice = Subsequent invoice not found for this subscription.
sub-invoice-preview-error-title = Invoice preview not found
sub-invoice-preview-error-text = Invoice preview not found for this subscription


reactivate-confirm-dialog-header = Want to keep using { $name }?
reactivate-confirm-copy =
    Your access to { $name } will continue, and your billing cycle
    and payment will stay the same. Your next charge will be
    { $amount } to the card ending in { $last } on { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Your access to { $name } will continue, and your billing cycle
    and payment will stay the same. Your next charge will be
    { $amount } on { $endDate }.
reactivate-confirm-button = Resubscribe


reactivate-panel-copy = You will lose access to { $name } on <strong>{ $date }</strong>.
reactivate-success-copy = Thanks! You’re all set.
reactivate-success-button = Close


sub-iap-item-google-purchase-2 = { -brand-google }: In-App purchase
sub-iap-item-apple-purchase-2 = { -brand-apple }: In-App purchase
sub-iap-item-manage-button = Manage
