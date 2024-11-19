## Error messages

# App error dialog
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
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = You’re already subscribed through the { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
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

## Hooks - coupons

coupon-success = Your plan will automatically renew at the list price.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Your plan will automatically renew after { $couponDurationDate } at the list price.
