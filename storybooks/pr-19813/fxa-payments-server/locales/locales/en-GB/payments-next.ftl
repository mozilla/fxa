loyalty-discount-terms-heading = Terms and restrictions
loyalty-discount-terms-support = Contact Support
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Contact Support for { $productName }
not-found-page-title-terms = Page not found
not-found-page-description-terms = The page you’re looking for does not exist.
not-found-page-button-terms-manage-subscriptions = Manage subscriptions

## Page

checkout-signin-or-create = 1. Sign in or create a { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = or
continue-signin-with-google-button = Continue with { -brand-google }
continue-signin-with-apple-button = Continue with { -brand-apple }
next-payment-method-header = Choose your payment method
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = First you’ll need to approve your subscription
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Select your country and enter your post code <p>to continue to checkout for { $productName }</p>
location-banner-info = We weren’t able to detect your location automatically
location-required-disclaimer = We only use this information to calculate taxes and currency.
location-banner-currency-change = Currency change not supported. To continue, select a country that matches your current billing currency.

## Page - Upgrade page

upgrade-page-payment-information = Payment Information
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Your plan will change immediately, and you’ll be charged a prorated amount today for the rest of this billing cycle. Starting { $nextInvoiceDate } you’ll be charged the full amount.

## Authentication Error page

auth-error-page-title = We Couldn’t Sign You In
checkout-error-boundary-retry-button = Try again
checkout-error-boundary-basic-error-message = Something went wrong. Please try again or <contactSupportLink>contact support.</contactSupportLink>
amex-logo-alt-text = { -brand-amex } logo
diners-logo-alt-text = { -brand-diner } logo
discover-logo-alt-text = { -brand-discover } logo
jcb-logo-alt-text = { -brand-jcb } logo
mastercard-logo-alt-text = { -brand-mastercard } logo
paypal-logo-alt-text = { -brand-paypal } logo
unionpay-logo-alt-text = { -brand-unionpay } logo
visa-logo-alt-text = { -brand-visa } logo
# Alt text for generic payment card logo
unbranded-logo-alt-text = Unbranded logo
link-logo-alt-text = { -brand-link } logo
apple-pay-logo-alt-text = { -brand-apple-pay } logo
google-pay-logo-alt-text = { -brand-google-pay } logo

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Manage my subscription
next-iap-blocked-contact-support = You have a mobile in-app subscription that conflicts with this product — please contact support so we can help you.
next-payment-error-retry-button = Try again
next-basic-error-message = Something went wrong. Please try again later.
checkout-error-contact-support-button = Contact Support
checkout-error-not-eligible = You are not eligible to subscribe to this product - please contact support so we can help you.
checkout-error-already-subscribed = You’re already subscribed to this product.
checkout-error-contact-support = Please contact support so we can help you.
cart-error-currency-not-determined = We were unable to determine the currency for this purchase, please try again.
checkout-processing-general-error = An unexpected error has occurred while processing your payment, please try again.
cart-total-mismatch-error = The invoice amount has changed. Please try again.

## Error pages - Payment method failure messages

intent-card-error = Your transaction could not be processed. Please verify your credit card information and try again.
intent-expired-card-error = It looks like your credit card has expired. Try another card.
intent-payment-error-try-again = Hmm. There was a problem authorising your payment. Try again or get in touch with your card issuer.
intent-payment-error-get-in-touch = Hmm. There was a problem authorising your payment. Get in touch with your card issuer.
intent-payment-error-generic = An unexpected error has occurred while processing your payment, please try again.
intent-payment-error-insufficient-funds = It looks like your card has insufficient funds. Try another card.
general-paypal-error = An unexpected error has occurred while processing your payment, please try again.
paypal-active-subscription-no-billing-agreement-error = It looks like there was a problem billing your { -brand-paypal } account. Please re-enable automatic payments for your subscription.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Please wait while we process your payment…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Thanks. Now check your email!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = You’ll receive an email at { $email } with instructions about your subscription, as well as your payment details.
next-payment-confirmation-order-heading = Order details
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Invoice #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Payment information

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Continue to download

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Card ending in { $last4 }

## Not found page

not-found-title-subscriptions = Subscription not found
not-found-description-subscriptions = We couldn’t find your subscription. Please try again or contact support.
not-found-button-back-to-subscriptions = Back to subscriptions

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = No payment method added
subscription-management-page-banner-warning-link-no-payment-method = Add a payment method
subscription-management-subscriptions-heading = Subscriptions
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Jump to
subscription-management-nav-payment-details = Payment details
subscription-management-nav-active-subscriptions = Active subscriptions
subscription-management-payment-details-heading = Payment details
subscription-management-email-label = Email
subscription-management-credit-balance-label = Credit balance
subscription-management-credit-balance-message = Credit will automatically be applied to future invoices
subscription-management-payment-method-label = Payment method
subscription-management-button-add-payment-method-aria = Add payment method
subscription-management-button-add-payment-method = Add
subscription-management-page-warning-message-no-payment-method = Please add a payment method to avoid interruption to your subscriptions.
subscription-management-button-manage-payment-method-aria = Manage payment method
subscription-management-button-manage-payment-method = Manage
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Card ending in { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Expires { $expirationDate }
subscription-management-active-subscriptions-heading = Active subscriptions
subscription-management-you-have-no-active-subscriptions = You have no active subscriptions
subscription-management-new-subs-will-appear-here = New subscriptions will appear here.
subscription-management-your-active-subscriptions-aria = Your active subscriptions
subscription-management-button-support = Get help
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Get help for { $productName }
subscription-management-your-apple-iap-subscriptions-aria = Your { -brand-apple } In-App Subscriptions
subscription-management-apple-in-app-purchase-2 = { -brand-apple } in-app purchase
subscription-management-your-google-iap-subscriptions-aria = Your { -brand-google } In-App Subscriptions
subscription-management-google-in-app-purchase-2 = { -brand-google } in-app purchase
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Expires on { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Manage subscription for { $productName }
subscription-management-button-manage-subscription-1 = Manage subscription
error-payment-method-banner-title-expired-card = Expired card
error-payment-method-banner-message-add-new-card = Add a new card or payment method to avoid interruption to your subscriptions.
error-payment-method-banner-label-update-payment-method = Update payment method
error-payment-method-expired-card = Your card has expired. Please add a new card or payment method to avoid interruption to your subscriptions.
error-payment-method-banner-title-invalid-payment-information = Invalid payment information
error-payment-method-banner-message-account-issue = There is an issue with your account.
subscription-management-button-manage-payment-method-1 = Manage payment method
subscription-management-error-apple-pay = There is an issue with your { -brand-apple-pay } account. Please resolve the issue to maintain your active subscriptions.
subscription-management-error-google-pay = There is an issue with your { -brand-google-pay } account. Please resolve the issue to maintain your active subscriptions.
subscription-management-error-link = There is an issue with your { -brand-link } account. Please resolve the issue to maintain your active subscriptions.
subscription-management-error-paypal-billing-agreement = There is an issue with your { -brand-paypal } account. Please resolve the issue to maintain your active subscriptions.
subscription-management-error-payment-method = There is an issue with your payment method. Please resolve the issue to maintain your active subscriptions.
manage-payment-methods-heading = Manage payment methods
paypal-payment-management-page-invalid-header = Invalid billing information
paypal-payment-management-page-invalid-description = There seems to be an error with your { -brand-paypal } account. We need you to take the necessary steps to resolve this payment issue.
# Page - Not Found
page-not-found-title = Page not found
page-not-found-description = The page you requested was not found. We’ve been notified and will fix any links that may be broken.
page-not-found-back-button = Go Back
alert-dialog-title = Alert dialogue

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Account Home
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Subscriptions
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Manage Payment Methods
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Go back to { $page }

## CancelSubscription

subscription-cancellation-dialog-title = We’re sorry to see you go
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Your { $name } subscription has been cancelled. You will still have access to { $name } until { $date }.
subscription-cancellation-dialog-aside = Have questions? Visit <LinkExternal>{ -brand-mozilla } Support</LinkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = Cancel { $productName } subscription

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = You will no longer be able to use { $productName } after { $currentPeriodEnd }, the last day of your billing cycle.
subscription-content-cancel-access-message = Cancel my access and my saved information within { $productName } on { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Cancel subscription
    .aria-label = Cancel your subscription to { $productName }
cancel-subscription-button-stay-subscribed = Stay subscribed
    .aria-label = Stay subscribed to { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = I authorise { -brand-mozilla } to charge my payment method for the amount shown, according to <termsOfServiceLink>Terms of Service</termsOfServiceLink> and <privacyNoticeLink>Privacy Notice</privacyNoticeLink>, until I cancel my subscription.
next-payment-confirm-checkbox-error = You need to complete this before moving forward

## Checkout Form

next-new-user-submit = Subscribe Now
next-pay-with-heading-paypal = Pay with { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Enter Code
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Promo Code
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Promo Code Applied
next-coupon-remove = Remove
next-coupon-submit = Apply

# Component - Header

payments-header-help =
    .title = Help
    .aria-label = Help
    .alt = Help
payments-header-bento =
    .title = { -brand-mozilla } products
    .aria-label = { -brand-mozilla } products
    .alt = { -brand-mozilla } Logo
payments-header-bento-close =
    .alt = Close
payments-header-bento-tagline = More products from { -brand-mozilla } that protect your privacy
payments-header-bento-firefox-desktop = { -brand-firefox } Browser for Desktop
payments-header-bento-firefox-mobile = { -brand-firefox } Browser for Mobile
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Made by { -brand-mozilla }
payments-header-avatar =
    .title = { -product-mozilla-account } menu
payments-header-avatar-icon =
    .alt = Account profile picture
payments-header-avatar-expanded-signed-in-as = Signed in as
payments-header-avatar-expanded-sign-out = Sign out
payments-client-loading-spinner =
    .aria-label = Loading…
    .alt = Loading…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Set as default payment method
# Save button for saving a new payment method
payment-method-management-save-method = Save payment method
manage-stripe-payments-title = Manage payment methods

## Component - PurchaseDetails

next-plan-details-header = Product details
next-plan-details-list-price = List Price
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Prorated price for { $productName }
next-plan-details-tax = Taxes and Fees
next-plan-details-total-label = Total
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Credit from unused time
purchase-details-subtotal-label = Subtotal
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Credit applied
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Total due
next-plan-details-hide-button = Hide details
next-plan-details-show-button = Show details
next-coupon-success = Your plan will automatically renew at the list price.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Your plan will automatically renew after { $couponDurationDate } at the list price.

## Select Tax Location

select-tax-location-title = Location
select-tax-location-edit-button = Edit
select-tax-location-save-button = Save
select-tax-location-continue-to-checkout-button = Continue to checkout
select-tax-location-country-code-label = Country
select-tax-location-country-code-placeholder = Select your country
select-tax-location-error-missing-country-code = Please select your country
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } is not available in this location.
select-tax-location-postal-code-label = Post Code
select-tax-location-postal-code =
    .placeholder = Enter your post code
select-tax-location-error-missing-postal-code = Please enter your post code
select-tax-location-error-invalid-postal-code = Please enter a valid post code
select-tax-location-successfully-updated = Your location has been updated.
select-tax-location-error-location-not-updated = Your location could not be updated. Please try again.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Your account is billed in { $currencyDisplayName }. Select a country that uses the { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Select a country that matches the currency of your active subscriptions.
select-tax-location-new-tax-rate-info = Updating your location will apply the new tax rate to all active subscriptions on your account, starting with your next billing cycle.
signin-form-continue-button = Continue
signin-form-email-input = Enter your email
signin-form-email-input-missing = Please enter your email
signin-form-email-input-invalid = Please provide a valid email
next-new-user-subscribe-product-updates-mdnplus = I’d like to receive product news and updates from { -product-mdn-plus } and { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = I’d like to receive product news and updates from { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = I’d like to receive security and privacy news and updates from { -brand-mozilla }
next-new-user-subscribe-product-assurance = We only use your email to create your account. We will never sell it to a third party.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = Want to keep using { $productName }?
stay-subscribed-access-will-continue = Your access to { $productName } will continue, and your billing cycle and payment will stay the same.
subscription-content-button-resubscribe = Resubscribe
    .aria-label = Resubscribe to { $productName }
resubscribe-success-dialog-title = Thanks! You’re all set.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = Your next charge will be { $nextInvoiceTotal } + { $taxDue } tax on { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = Your next charge will be { $nextInvoiceTotal } on { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = { $promotionName } discount will be applied
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Last bill • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } tax
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = View invoice
subscription-management-link-view-invoice-aria = View invoice for { $productName }
subscription-content-expires-on-expiry-date = Expires on { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Next bill • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } tax
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Stay Subscribed
    .aria-label = Stay subscribed to { $productName }
subscription-content-button-cancel-subscription = Cancel subscription
    .aria-label = Cancel your subscription to { $productName }

##

dialog-close = Close dialogue
button-back-to-subscriptions = Back to subscriptions
subscription-content-cancel-action-error = An unexpected error occurred. Please try again.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } daily
plan-price-interval-weekly = { $amount } weekly
plan-price-interval-monthly = { $amount } monthly
plan-price-interval-halfyearly = { $amount } every 6 months
plan-price-interval-yearly = { $amount } yearly

## Component - SubscriptionTitle

next-subscription-create-title = Set up your subscription
next-subscription-success-title = Subscription confirmation
next-subscription-processing-title = Confirming subscription…
next-subscription-error-title = Error confirming subscription…
subscription-title-sub-exists = You’ve already subscribed
subscription-title-plan-change-heading = Review your change
subscription-title-not-supported = This subscription plan change is not supported
next-sub-guarantee = 30-day money-back guarantee

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Terms of Service
next-privacy = Privacy Notice
next-terms-download = Download Terms
terms-and-privacy-stripe-label = { -brand-mozilla } uses { -brand-name-stripe } for secure payment processing.
terms-and-privacy-stripe-link = { -brand-name-stripe } privacy policy
terms-and-privacy-paypal-label = { -brand-mozilla } uses { -brand-paypal } for secure payment processing.
terms-and-privacy-paypal-link = { -brand-paypal } privacy policy
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } uses { -brand-name-stripe } and { -brand-paypal } for secure payment processing.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Current plan
upgrade-purchase-details-new-plan-label = New plan
upgrade-purchase-details-promo-code = Promo Code
upgrade-purchase-details-tax-label = Taxes and Fees
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Credit issued to account
upgrade-purchase-details-credit-will-be-applied = Credit will be applied to your account and used towards future invoices.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (Daily)
upgrade-purchase-details-new-plan-weekly = { $productName } (Weekly)
upgrade-purchase-details-new-plan-monthly = { $productName } (Monthly)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6-month)
upgrade-purchase-details-new-plan-yearly = { $productName } (Yearly)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Checkout | { $productTitle }
metadata-description-checkout-start = Enter your payment details to complete your purchase.
# Checkout processing
metadata-title-checkout-processing = Processing | { $productTitle }
metadata-description-checkout-processing = Please wait while we finish processing your payment.
# Checkout error
metadata-title-checkout-error = Error | { $productTitle }
metadata-description-checkout-error = There was an error processing your subscription. If this problem persists, please contact support.
# Checkout success
metadata-title-checkout-success = Success | { $productTitle }
metadata-description-checkout-success = Congratulations! You have successfully completed your purchase.
# Checkout needs_input
metadata-title-checkout-needs-input = Action required | { $productTitle }
metadata-description-checkout-needs-input = Please complete the required action to proceed with your payment.
# Upgrade start
metadata-title-upgrade-start = Upgrade | { $productTitle }
metadata-description-upgrade-start = Enter your payment details to complete your upgrade.
# Upgrade processing
metadata-title-upgrade-processing = Processing | { $productTitle }
metadata-description-upgrade-processing = Please wait while we finish processing your payment.
# Upgrade error
metadata-title-upgrade-error = Error | { $productTitle }
metadata-description-upgrade-error = There was an error processing your upgrade. If this problem persists, please contact support.
# Upgrade success
metadata-title-upgrade-success = Success | { $productTitle }
metadata-description-upgrade-success = Congratulations! You have successfully completed your upgrade.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Action required | { $productTitle }
metadata-description-upgrade-needs-input = Please complete the required action to proceed with your payment.
# Default
metadata-title-default = Page not found | { $productTitle }
metadata-description-default = The page you requested was not found.

## Coupon Error Messages

next-coupon-error-cannot-redeem = The code you entered cannot be redeemed — your account has a previous subscription to one of our services.
next-coupon-error-expired = The code you entered has expired.
next-coupon-error-generic = An error occurred processing the code. Please try again.
next-coupon-error-invalid = The code you entered is invalid.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = The code you entered has reached its limit.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = This offer has expired.
stay-subscribed-error-discount-used = Discount code already applied.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = This discount is only available to current { $productTitle } subscribers.
stay-subscribed-error-still-active = Your { $productTitle } subscription is still active.
stay-subscribed-error-general = There was an issue with renewing your subscription.
