## Non-email strings

session-verify-send-push-title-2 = Logging in to your { -product-mozilla-account }?
session-verify-send-push-body-2 = Click here to confirm it’s you
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } is your { -brand-mozilla } verification code. Expires in 5 minutes.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } verification code: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } is your { -brand-mozilla } recovery code. Expires in 5 minutes.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } code: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } is your { -brand-mozilla } recovery code. Expires in 5 minutes.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } code: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = This is an automated email; if you received it in error, no action is required.
subplat-privacy-notice = Privacy notice
subplat-privacy-plaintext = Privacy notice:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = You’re receiving this email because { $email } has a { -product-mozilla-account } and you signed up for { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = You’re receiving this email because { $email } has a { -product-mozilla-account }.
subplat-explainer-multiple-2 = You’re receiving this email because { $email } has a { -product-mozilla-account } and you have subscribed to multiple products.
subplat-explainer-was-deleted-2 = You’re receiving this email because { $email } was registered for a { -product-mozilla-account }.
subplat-manage-account-2 = Manage your { -product-mozilla-account } settings by visiting your <a data-l10n-name="subplat-account-page">account page</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Manage your { -product-mozilla-account } settings by visiting your account page: { $accountSettingsUrl }
subplat-terms-policy = Terms and cancellation policy
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancel subscription
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reactivate subscription
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Update billing information
subplat-privacy-policy = { -brand-mozilla } Privacy Policy
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Privacy Notice
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Terms of Service
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacy
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Please help us improve our services by taking this <a data-l10n-name="cancellationSurveyUrl">short survey</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Please help us improve our services by taking this short survey:
payment-details = Payment details:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Invoice Number: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Charged: { $invoiceTotal } on { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Next Invoice: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Payment method:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Payment method: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Payment method: { $cardName } ending in { $lastFour }
payment-provider-card-ending-in-plaintext = Payment method: Card ending in { $lastFour }
payment-provider-card-ending-in = <b>Payment method:</b> Card ending in { $lastFour }
payment-provider-card-ending-in-card-name = <b>Payment method:</b> { $cardName } ending in { $lastFour }
subscription-charges-invoice-summary = Invoice Summary

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Invoice number:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Invoice number: { $invoiceNumber }
subscription-charges-invoice-date = <b>Date:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Date: { $invoiceDateOnly }
subscription-charges-prorated-price = Prorated price
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Prorated price: { $remainingAmountTotal }
subscription-charges-list-price = List price
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = List price: { $offeringPrice }
subscription-charges-credit-from-unused-time = Credit from unused time
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Credit from unused time: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = One-time discount
subscription-charges-one-time-discount-plaintext = One-time discount: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
       *[other] { $discountDuration }-month discount
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
       *[other] { $discountDuration }-month discount: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Discount
subscription-charges-discount-plaintext = Discount: { $invoiceDiscountAmount }
subscription-charges-taxes = Taxes & fees
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taxes & fees: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Credit applied
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Credit applied: { $creditApplied }
subscription-charges-amount-paid = <b>Amount paid</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Amount paid: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = You have received an account credit of { $creditReceived }, which will be applied to your future invoices.

##

subscriptionSupport = Questions about your subscription? Our <a data-l10n-name="subscriptionSupportUrl">support team</a> is here to help you.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Questions about your subscription? Our support team is here to help you:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Thank you for subscribing to { $productName }. If you have any questions about your subscription or need more information about { $productName }, please <a data-l10n-name="subscriptionSupportUrl">contact us</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Thank you for subscribing to { $productName }. If you have any questions about your subscription or need more information about { $productName }, please contact us:
subscription-support-get-help = Get help with your subscription
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Manage your subscription</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Manage your subscription:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contact support</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contact support:
subscriptionUpdateBillingEnsure = You can ensure that your payment method and account information are up to date <a data-l10n-name="updateBillingUrl">here</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = You can ensure that your payment method and account information are up to date here:
subscriptionUpdateBillingTry = We’ll try your payment again over the next few days, but you may need to help us fix it by <a data-l10n-name="updateBillingUrl">updating your payment information</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = We’ll try your payment again over the next few days, but you may need to help us fix it by updating your payment information:
subscriptionUpdatePayment = To prevent any interruption to your service, please <a data-l10n-name="updateBillingUrl">update your payment information</a> as soon as possible.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = To prevent any interruption to your service, please update your payment information as soon as possible:
view-invoice-link-action = View invoice
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = View Invoice: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Welcome to { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Welcome to { $productName }
downloadSubscription-content-2 = Let’s get started using all the features included in your subscription:
downloadSubscription-link-action-2 = Get Started
fraudulentAccountDeletion-subject-2 = Your { -product-mozilla-account } was deleted
fraudulentAccountDeletion-title = Your account was deleted
fraudulentAccountDeletion-content-part1-v2 = Recently, a { -product-mozilla-account } was created and a subscription was charged using this email address. As we do with all new accounts, we asked that you confirm your account by first validating this email address.
fraudulentAccountDeletion-content-part2-v2 = At present, we see that the account was never confirmed. Since this step was not completed, we are not sure if this was an authorised subscription. As a result, the { -product-mozilla-account } registered to this email address was deleted and your subscription was cancelled with all charges reimbursed.
fraudulentAccountDeletion-contact = If you have any questions, please contact our <a data-l10n-name="mozillaSupportUrl">support team</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = If you have any questions, please contact our support team: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Your { $productName } subscription has been cancelled
subscriptionAccountDeletion-title = Sorry to see you go
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = You recently deleted your { -product-mozilla-account }. As a result, we’ve cancelled your { $productName } subscription. Your final payment of { $invoiceTotal } was paid on { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Reminder: Finish setting up your account
subscriptionAccountReminderFirst-title = You can’t access your subscription yet
subscriptionAccountReminderFirst-content-info-3 = A few days ago you created a { -product-mozilla-account } but never confirmed it. We hope you’ll finish setting up your account, so you can use your new subscription.
subscriptionAccountReminderFirst-content-select-2 = Select “Create Password” to set up a new password and finish confirming your account.
subscriptionAccountReminderFirst-action = Create Password
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Final reminder: Setup your account
subscriptionAccountReminderSecond-title-2 = Welcome to { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = A few days ago you created a { -product-mozilla-account } but never confirmed it. We hope you’ll finish setting up your account, so you can use your new subscription.
subscriptionAccountReminderSecond-content-select-2 = Select “Create Password” to set up a new password and finish confirming your account.
subscriptionAccountReminderSecond-action = Create Password
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Your { $productName } subscription has been cancelled
subscriptionCancellation-title = Sorry to see you go

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = We’ve cancelled your { $productName } subscription. Your final payment of { $invoiceTotal } was paid on { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = We’ve cancelled your { $productName } subscription. Your final payment of { $invoiceTotal } will be paid on { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Your service will continue until the end of your current billing period, which is { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = You have switched to { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = You have successfully switched from { $productNameOld } to { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Starting with your next bill, your charge will change from { $paymentAmountOld } per { $productPaymentCycleOld } to { $paymentAmountNew } per { $productPaymentCycleNew }. At that time you will also be given a one-time credit of { $paymentProrated } to reflect the lower charge for the remainder of this { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = If there is new software for you to install in order to use { $productName }, you will receive a separate email with download instructions.
subscriptionDowngrade-content-auto-renew = Your subscription will automatically renew each billing period unless you choose to cancel.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Your { $productName } subscription will expire soon
subscriptionEndingReminder-title = Your { $productName } subscription will expire soon
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Your access to { $productName } will end on <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = If you’d like to continue using { $productName }, you can reactivate your subscription in <a data-l10n-name="subscriptionEndingReminder-account-settings">Account Settings</a> before <strong>{ $serviceLastActiveDateOnly }</strong>. If you need assistance, <a data-l10n-name="subscriptionEndingReminder-contact-support">contact our Support Team</a>.
subscriptionEndingReminder-content-line1-plaintext = Your access to { $productName } will end on { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = If you’d like to continue using { $productName }, you can reactivate your subscription in Account Settings before { $serviceLastActiveDateOnly }. If you need assistance, contact our Support Team.
subscriptionEndingReminder-content-closing = Thanks for being a valued subscriber!
subscriptionEndingReminder-churn-title = Want to keep access?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Limited terms and restrictions apply</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Limited terms and restrictions apply: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contact our Support Team: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Your { $productName } subscription has been cancelled
subscriptionFailedPaymentsCancellation-title = Your subscription has been cancelled
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = We’ve cancelled your { $productName } subscription because multiple payment attempts failed. To get access again, start a new subscription with an updated payment method.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } payment confirmed
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Thank you for subscribing to { $productName }
subscriptionFirstInvoice-content-processing = Your payment is currently processing and may take up to four business days to complete.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = You will receive a separate email on how to start using { $productName }.
subscriptionFirstInvoice-content-auto-renew = Your subscription will automatically renew each billing period unless you choose to cancel.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Your next invoice will be issued on { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Payment method for { $productName } expired or expiring soon
subscriptionPaymentExpired-title-2 = Your payment method is expired or about to expire
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = The payment method you’re using for { $productName } is expired or about to expire.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName } payment failed
subscriptionPaymentFailed-title = Sorry, we’re having trouble with your payment
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = We had a problem with your latest payment for { $productName }.
subscriptionPaymentFailed-content-outdated-1 = It may be that your payment method has expired, or your current payment method is out-of-date.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Payment information update required for { $productName }
subscriptionPaymentProviderCancelled-title = Sorry, we’re having trouble with your payment method
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = We have detected a problem with your payment method for { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = It may be that your payment method has expired, or your current payment method is out-of-date.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } subscription reactivated
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Thank you for reactivating your { $productName } subscription!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Your billing cycle and payment will remain the same. Your next charge will be { $invoiceTotal } on { $nextInvoiceDateOnly }. Your subscription will automatically renew each billing period unless you choose to cancel.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } automatic renewal notice
subscriptionRenewalReminder-title = Your subscription will be renewed soon
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Dear { $productName } customer,
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Your current subscription is set to automatically renew in { $reminderLength } days.
subscriptionRenewalReminder-content-discount-change = Your next invoice reflects a change in pricing, as a previous discount has ended and a new discount has been applied.
subscriptionRenewalReminder-content-discount-ending = Because a previous discount has ended, your subscription will renew at the standard price.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = At that time, { -brand-mozilla } will renew your { $planIntervalCount } { $planInterval } subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
subscriptionRenewalReminder-content-closing = Sincerely,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = The { $productName } team
subscriptionReplaced-subject = Your subscription has been updated as part of your upgrade
subscriptionReplaced-title = Your subscription has been updated
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Your individual { $productName } subscription has been replaced and is now included in your new bundle.
subscriptionReplaced-content-credit = You’ll receive a credit for any unused time from your previous subscription. This credit will be automatically applied to your account and used toward future charges.
subscriptionReplaced-content-no-action = No action is required on your part.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName } payment received
subscriptionSubsequentInvoice-title = Thank you for being a subscriber!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = We received your latest payment for { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Your next invoice will be issued on { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = You have upgraded to { $productName }
subscriptionUpgrade-title = Thank you for upgrading!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = You have successfully upgraded to { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = You have been charged a one-time fee of { $invoiceAmountDue } to reflect your subscription’s higher price for the remainder of this billing period ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = You have received an account credit in the amount of { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Starting with your next bill, the price of your subscription will change.
subscriptionUpgrade-content-old-price-day = The previous rate was { $paymentAmountOld } per day.
subscriptionUpgrade-content-old-price-week = The previous rate was { $paymentAmountOld } per week.
subscriptionUpgrade-content-old-price-month = The previous rate was { $paymentAmountOld } per month.
subscriptionUpgrade-content-old-price-halfyear = The previous rate was { $paymentAmountOld } per six months.
subscriptionUpgrade-content-old-price-year = The previous rate was { $paymentAmountOld } per year.
subscriptionUpgrade-content-old-price-default = The previous rate was { $paymentAmountOld } per billing interval.
subscriptionUpgrade-content-old-price-day-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per day.
subscriptionUpgrade-content-old-price-week-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per week.
subscriptionUpgrade-content-old-price-month-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per month.
subscriptionUpgrade-content-old-price-halfyear-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per six months.
subscriptionUpgrade-content-old-price-year-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per year.
subscriptionUpgrade-content-old-price-default-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per billing interval.
subscriptionUpgrade-content-new-price-day = Going forward, you will be charged { $paymentAmountNew } per day, excluding discounts.
subscriptionUpgrade-content-new-price-week = Going forward, you will be charged { $paymentAmountNew } per week, excluding discounts.
subscriptionUpgrade-content-new-price-month = Going forward, you will be charged { $paymentAmountNew } per month, excluding discounts.
subscriptionUpgrade-content-new-price-halfyear = Going forward, you will be charged { $paymentAmountNew } per six months, excluding discounts.
subscriptionUpgrade-content-new-price-year = Going forward, you will be charged { $paymentAmountNew } per year, excluding discounts.
subscriptionUpgrade-content-new-price-default = Going forward, you will be charged { $paymentAmountNew } per billing interval, excluding discounts.
subscriptionUpgrade-content-new-price-day-dtax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per day, excluding discounts.
subscriptionUpgrade-content-new-price-week-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per week, excluding discounts.
subscriptionUpgrade-content-new-price-month-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per month, excluding discounts.
subscriptionUpgrade-content-new-price-halfyear-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per six months, excluding discounts.
subscriptionUpgrade-content-new-price-year-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per year, excluding discounts.
subscriptionUpgrade-content-new-price-default-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per billing interval, excluding discounts.
subscriptionUpgrade-existing = If any of your existing subscriptions overlap with this upgrade, we’ll handle them and send you a separate email with the details. If your new plan includes products that require installation, we’ll send you a separate email with setup instructions.
subscriptionUpgrade-auto-renew = Your subscription will automatically renew each billing period unless you choose to cancel.
subscriptionsPaymentExpired-subject-2 = The payment method for your subscriptions is expired or expiring soon
subscriptionsPaymentExpired-title-2 = Your payment method is expired or about to expire
subscriptionsPaymentExpired-content-2 = The payment method you’re using to make payments for the following subscriptions is expired or about to expire.
subscriptionsPaymentProviderCancelled-subject = Payment information update required for { -brand-mozilla } subscriptions
subscriptionsPaymentProviderCancelled-title = Sorry, we’re having trouble with your payment method
subscriptionsPaymentProviderCancelled-content-detected = We have detected a problem with your payment method for the following subscriptions.
subscriptionsPaymentProviderCancelled-content-payment-1 = It may be that your payment method has expired, or your current payment method is out-of-date.
