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


## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = { -brand-mozilla } Privacy Policy
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization:"uppercase") } Privacy Notice
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization:"uppercase") } Terms of Service

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
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization:"uppercase") } Privacy Notice
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization:"uppercase") } Terms of Service
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Legal
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacy
subplat-privacy-website-plaintext = { subplat-privacy }:

account-deletion-info-block-communications = If your account is deleted, you’ll still receive emails from Mozilla Corporation and Mozilla Foundation, unless you <a data-l10n-name="unsubscribeLink">ask to unsubscribe</a>.
account-deletion-info-block-support = If you have any questions or need assistance, feel free to contact our <a data-l10n-name="supportLink">support team</a>.
account-deletion-info-block-communications-plaintext = If your account is deleted, you’ll still receive emails from Mozilla Corporation and Mozilla Foundation, unless you ask to unsubscribe:
account-deletion-info-block-support-plaintext = If you have any questions or need assistance, feel free to contact our support team:

# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Download { $productName } on { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Download { $productName } on the { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Install { $productName } on <a data-l10n-name="anotherDeviceLink">another desktop device</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Install { $productName } on <a data-l10n-name="anotherDeviceLink">another device</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Get { $productName } on Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Download { $productName } on the App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Install { $productName } on another device:

automated-email-change-2 = If you didn’t take this action, <a data-l10n-name="passwordChangeLink">change your password</a> right away.
automated-email-support =  For more info, visit <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = If you didn’t take this action, change your password right away:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = For more info, visit { -brand-mozilla } Support:

automated-email-inactive-account = This is an automated email. You are receiving it because you have a { -product-mozilla-account } and it has been 2 years since your last sign-in.

# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } For more info, visit <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
automated-email-no-action-plaintext = This is an automated email. If you received it by mistake, you don’t need to do anything.

#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = This is an automated email; if you did not authorize this action, then please change your password:

# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = This request came from { $uaBrowser } on { $uaOS } { $uaOSVersion }.

# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = This request came from { $uaBrowser } on { $uaOS }.

# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = This request came from { $uaBrowser }.

# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = This request came from { $uaOS } { $uaOSVersion }.

# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = This request came from { $uaOS }.

automatedEmailRecoveryKey-delete-key-change-pwd = If this wasn’t you, <a data-l10n-name="revokeAccountRecoveryLink">delete the new key</a> and <a data-l10n-name="passwordChangeLink">change your password</a>.
automatedEmailRecoveryKey-change-pwd-only = If this wasn’t you, <a data-l10n-name="passwordChangeLink">change your password</a>.
automatedEmailRecoveryKey-more-info = For more info, visit <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.

# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = This request came from:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = If this wasn’t you, delete the new key:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = If this wasn’t you, change your password:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = and change your password:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = For more info, visit { -brand-mozilla } Support:

automated-email-reset = This is an automated email; if you did not authorize this action, then <a data-l10n-name="resetLink">please reset your password</a>.
  For more information, please visit <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = If you did not authorize this action, please reset your password now at { $resetLink }

# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = If you didnʼt take this action, then <a data-l10n-name="resetLink">reset your password</a> and <a data-l10n-name="twoFactorSettingsLink">reset two-step authentication</a> right away.
  For more information, please visit <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = If you didnʼt take this action, then reset your password right away at:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Also, reset two-step authentication at:

brand-banner-message = Did you know we changed our name from { -product-firefox-accounts } to { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Learn more</a>

cancellationSurvey = Please help us improve our services by taking this <a data-l10n-name="cancellationSurveyUrl">short survey</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Please help us improve our services by taking this short survey:

change-password-plaintext = If you suspect that someone is trying to gain access to your account, please change your password.

manage-account = Manage account
manage-account-plaintext = { manage-account }:

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

# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = For more info, visit <a data-l10n-name="supportLink">{ -brand-mozilla } Support</a>.

# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = For more info, visit { -brand-mozilla } Support: { $supportUrl }.

# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } on { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } on { $uaOS }

# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimated)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimated)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimated)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimated)

view-invoice-link-action = View invoice
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = View Invoice: { $invoiceLink }

cadReminderFirst-subject-1 = Reminder! Let’s sync { -brand-firefox }
cadReminderFirst-action = Sync another device
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = It takes two to sync
cadReminderFirst-description-v2 = Take your tabs across all your devices. Get your bookmarks, passwords, and other data everywhere you use { -brand-firefox }.

cadReminderSecond-subject-2 = Don’t miss out! Let’s finish your sync setup
cadReminderSecond-action = Sync another device
cadReminderSecond-title-2 = Don’t forget to sync!
cadReminderSecond-description-sync = Sync your bookmarks, passwords, open tabs and more — everywhere you use { -brand-firefox }.
cadReminderSecond-description-plus = Plus, your data is always encrypted. Only you and devices you approve can see it.

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
fraudulentAccountDeletion-content-part2-v2 = At present, we see that the account was never confirmed. Since this step was not completed, we are not sure if this was an authorized subscription. As a result, the { -product-mozilla-account } registered to this email address was deleted and your subscription was canceled with all charges reimbursed.
fraudulentAccountDeletion-contact = If you have any questions, please contact our <a data-l10n-name="mozillaSupportUrl">support team</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext =  If you have any questions, please contact our support team: { $mozillaSupportUrl }

inactiveAccountFinalWarning-subject = Last chance to keep your { -product-mozilla-account }
inactiveAccountFinalWarning-title = Your { -brand-mozilla } account and data will be deleted
inactiveAccountFinalWarning-preview = Sign in to keep your account
inactiveAccountFinalWarning-account-description = Your { -product-mozilla-account } is used to access free privacy and browsing products like { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, and { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = On <strong>{ $deletionDate }</strong>, your account and your personal data will be permanently deleted unless you sign in.
inactiveAccountFinalWarning-action = Sign in to keep your account
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Sign in to keep your account:

inactiveAccountFirstWarning-subject = Donʼt lose your account
inactiveAccountFirstWarning-title = Do you want to keep your { -brand-mozilla } account and data?
inactiveAccountFirstWarning-account-description-v2 = Your { -product-mozilla-account } is used to access free privacy and browsing products like { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, and { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = We noticed you haven’t signed in for 2 years.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Your account and your personal data will be permanently deleted on <strong>{ $deletionDate }</strong> because you haven’t been active.
inactiveAccountFirstWarning-action = Sign in to keep your account
inactiveAccountFirstWarning-preview = Sign in to keep your account
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Sign in to keep your account:

inactiveAccountSecondWarning-subject = Action required: Account deletion in 7 days
inactiveAccountSecondWarning-title = Your { -brand-mozilla } account and data will be deleted in 7 days
inactiveAccountSecondWarning-account-description-v2 = Your { -product-mozilla-account } is used to access free privacy and browsing products like { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, and { -product-mdn }.

# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Your account and your personal data will be permanently deleted on <strong>{ $deletionDate }</strong> because you haven’t been active.
inactiveAccountSecondWarning-action = Sign in to keep your account
inactiveAccountSecondWarning-preview = Sign in to keep your account
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Sign in to keep your account:

# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = You’re out of backup authentication codes!
codes-reminder-title-one = You’re on your last backup authentication code
codes-reminder-title-two = Time to create more backup authentication codes

codes-reminder-description-part-one = Backup authentication codes help you restore your info when you forget your password.
codes-reminder-description-part-two = Create new codes now so you don’t lose your data later.
codes-reminder-description-two-left = You only have two codes left.
codes-reminder-description-create-codes = Create new backup authentication codes to help you get back into your account if you’re locked out.

lowRecoveryCodes-action-2 = Create codes
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] No backup authentication codes left
        [one] Only 1 backup authentication code left
       *[other] Only { $numberRemaining } backup authentication codes left!
   }

# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = New sign-in to { $clientName }
newDeviceLogin-subjectForMozillaAccount = New sign-in to your { -product-mozilla-account }
newDeviceLogin-title-3 = Your { -product-mozilla-account } was used to sign in
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Not you? <a data-l10n-name="passwordChangeLink">Change your password</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Not you? Change your password:
newDeviceLogin-action = Manage account

passwordChanged-subject = Password updated
passwordChanged-title = Password changed successfully
passwordChanged-description-2 = Your { -product-mozilla-account } password was successfully changed from the following device:

passwordChangeRequired-subject = Suspicious activity detected
passwordChangeRequired-preview = Change your password immediately
passwordChangeRequired-title-2 = Reset your password

passwordChangeRequired-suspicious-activity-3 = We locked your account to keep it safe from suspicious activity. You’ve been signed out of all your devices and any synced data has been deleted as a precaution.
passwordChangeRequired-sign-in-3 = To sign back in to your account, all you need to do is reset your password.
passwordChangeRequired-different-password-2 = <b>Important:</b> Pick a strong password that’s different from one you’ve used in the past.
passwordChangeRequired-different-password-plaintext-2 = Important: Pick a strong password that’s different from one you’ve used in the past.

passwordChangeRequired-action = Reset password
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:

# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Use { $code } to change your password
password-forgot-otp-preview = This code expires in 10 minutes
password-forgot-otp-title = Forgot your password?
password-forgot-otp-request = We received a request for a password change on your { -product-mozilla-account } from:
password-forgot-otp-code-2 = If this was you, here is your confirmation code to proceed:
password-forgot-otp-expiry-notice = This code expires in 10 minutes.

passwordReset-subject-2 = Your password has been reset
passwordReset-title-2 = Your password has been reset
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = You reset your { -product-mozilla-account } password on:

passwordResetAccountRecovery-subject-2 = Your password has been reset
passwordResetAccountRecovery-title-3 = Your password has been reset
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = You used your account recovery key to reset your { -product-mozilla-account } password on:
passwordResetAccountRecovery-information = We logged you out of all your synced devices. We created a new account recovery key to replace the one you used. You can change it in your account settings.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = We logged you out of all your synced devices. We created a new account recovery key to replace the one you used. You can change it in your account settings:
passwordResetAccountRecovery-action-4 = Manage account

passwordResetRecoveryPhone-subject = Recovery phone used
passwordResetRecoveryPhone-preview = Check to make sure this was you
passwordResetRecoveryPhone-title = Your recovery phone was used to confirm a password reset
passwordResetRecoveryPhone-device = Recovery phone used from:
passwordResetRecoveryPhone-action = Manage account

passwordResetWithRecoveryKeyPrompt-subject = Your password has been reset
passwordResetWithRecoveryKeyPrompt-title = Your password has been reset
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = You reset your { -product-mozilla-account } password on:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Create account recovery key
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Create account recovery key:
passwordResetWithRecoveryKeyPrompt-cta-description = You’ll need to sign in again on all of your synced devices. Keep your data safe next time with an account recovery key. This allows you to recover your data if you forget your password.

postAddAccountRecovery-subject-3 = New account recovery key created
postAddAccountRecovery-title2 = You created a new account recovery key
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Save this key in a safe place — you’ll need it to restore your encrypted browsing data if you forget your password.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = This key can only be used once. After you use it, we’ll automatically create a new one for you. Or you can create a new one any time from your account settings.
postAddAccountRecovery-action = Manage account

postAddLinkedAccount-subject-2 = New account linked to your { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Your { $providerName } account has been linked to your { -product-mozilla-account }
postAddLinkedAccount-action = Manage account

postAddRecoveryPhone-subject = Recovery phone added
postAddRecoveryPhone-preview = Account protected by two-step authentication
postAddRecoveryPhone-title-v2 = You added a recovery phone number
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = You added { $maskedLastFourPhoneNumber } as your recovery phone number
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = How this protects your account
postAddRecoveryPhone-how-protect-plaintext = How this protects your account:
postAddRecoveryPhone-enabled-device = You enabled it from:
postAddRecoveryPhone-action = Manage account

postAddTwoStepAuthentication-preview = Your account is protected
postAddTwoStepAuthentication-subject-v3 = Two-step authentication is on
postAddTwoStepAuthentication-title-2 = You turned on two-step authentication
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = You requested this from:
postAddTwoStepAuthentication-action = Manage account
postAddTwoStepAuthentication-code-required-v4 = Security codes from your authenticator app are now required every time you sign in.
postAddTwoStepAuthentication-recovery-method-codes = You also added backup authentication codes as your recovery method.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = You also added { $maskedPhoneNumber } as your recovery phone number.
postAddTwoStepAuthentication-how-protects-link = How this protects your account
postAddTwoStepAuthentication-how-protects-plaintext = How this protects your account:
postAddTwoStepAuthentication-device-sign-out-message = To protect all your connected devices, you should sign out everywhere youʼre using this account, and then sign back in using two-step authentication.

postChangeAccountRecovery-subject = Account recovery key changed
postChangeAccountRecovery-title = You changed your account recovery key
postChangeAccountRecovery-body-part1 = You now have a new account recovery key. Your previous key was deleted.
postChangeAccountRecovery-body-part2 = Save this new key in a safe place — you’ll need it to restore your encrypted browsing data if you forget your password.
postChangeAccountRecovery-action = Manage account

postChangePrimary-subject = Primary email updated
postChangePrimary-title = New primary email
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = You have successfully changed your primary email to { $email }. This address is now your username for signing in to your { -product-mozilla-account }, as well as receiving security notifications and sign-in confirmations.
postChangePrimary-action = Manage account

postChangeRecoveryPhone-subject = Recovery phone updated
postChangeRecoveryPhone-preview = Account protected by two-step authentication
postChangeRecoveryPhone-title = You changed your recovery phone
postChangeRecoveryPhone-description = You now have a new recovery phone. Your previous phone number was deleted.
postChangeRecoveryPhone-requested-device = You requested it from:

postChangeTwoStepAuthentication-preview = Your account is protected
postChangeTwoStepAuthentication-subject = Two-step authentication updated
postChangeTwoStepAuthentication-title = Two-step authentication has been updated
postChangeTwoStepAuthentication-use-new-account = You now need to use the new { -product-mozilla-account } entry in your authenticator app. The older one will no longer work and you can remove it.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = You requested this from:
postChangeTwoStepAuthentication-action = Manage account
postChangeTwoStepAuthentication-how-protects-link = How this protects your account
postChangeTwoStepAuthentication-how-protects-plaintext = How this protects your account:
postChangeTwoStepAuthentication-device-sign-out-message = To protect all your connected devices, you should sign out everywhere youʼre using this account, and then sign back in using your new two-step authentication.

postConsumeRecoveryCode-title-3 = Your backup authentication code was used to confirm a password reset
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Code used from:
postConsumeRecoveryCode-action = Manage account
postConsumeRecoveryCode-subject-v3 = Backup authentication code used
postConsumeRecoveryCode-preview = Check to make sure this was you

postNewRecoveryCodes-subject-2 = New backup authentication codes created
postNewRecoveryCodes-title-2 = You created new backup authentication codes
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = They were created on:
postNewRecoveryCodes-action = Manage account

postRemoveAccountRecovery-subject-2 = Account recovery key deleted
postRemoveAccountRecovery-title-3 = You deleted your account recovery key
postRemoveAccountRecovery-body-part1 = Your account recovery key is required to restore your encrypted browsing data if you forget your password.
postRemoveAccountRecovery-body-part2 = If you haven’t already, create a new account recovery key in your account settings to prevent losing your saved passwords, bookmarks, browsing history, and more.
postRemoveAccountRecovery-action = Manage account

postRemoveRecoveryPhone-subject = Recovery phone removed
postRemoveRecoveryPhone-preview = Account protected by two-step authentication
postRemoveRecoveryPhone-title = Recovery phone removed
postRemoveRecoveryPhone-description-v2 = Your recovery phone has been removed from your two-step authentication settings.
postRemoveRecoveryPhone-description-extra = You can still use your backup authentication codes to sign in if you arenʼt able to use your authenticator app.
postRemoveRecoveryPhone-requested-device = You requested it from:

postRemoveSecondary-subject = Secondary email removed
postRemoveSecondary-title = Secondary email removed
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = You have successfully removed { $secondaryEmail } as a secondary email from your { -product-mozilla-account }. Security notifications and sign-in confirmations will no longer be delivered to this address.
postRemoveSecondary-action = Manage account

postRemoveTwoStepAuthentication-subject-line-2 = Two-step authentication turned off
postRemoveTwoStepAuthentication-title-2 = You turned off two-step authentication
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = You disabled it from:
postRemoveTwoStepAuthentication-action = Manage account
postRemoveTwoStepAuthentication-not-required-2 = You no longer need security codes from your authentication app when you sign in.

postSigninRecoveryCode-subject = Backup authentication code used to sign in
postSigninRecoveryCode-preview = Confirm account activity
postSigninRecoveryCode-title = Your backup authentication code was used to sign in
postSigninRecoveryCode-description = If you didn’t do this, you should change your password immediately to keep your account safe.
postSigninRecoveryCode-device = You signed in from:
postSigninRecoveryCode-action = Manage account

postSigninRecoveryPhone-subject = Recovery phone used to sign in
postSigninRecoveryPhone-preview = Confirm account activity
postSigninRecoveryPhone-title = Your recovery phone was used to sign in
postSigninRecoveryPhone-description = If you didn’t do this, you should change your password immediately to keep your account safe.
postSigninRecoveryPhone-device = You signed in from:
postSigninRecoveryPhone-action = Manage account

postVerify-sub-title-3 = We’re delighted to see you!
postVerify-title-2 = Want to see the same tab on two devices?
postVerify-description-2 = It’s easy! Just install { -brand-firefox } on another device and log in to sync. It’s like magic!
postVerify-sub-description = (Psst… It also means you can get your bookmarks, passwords, and other { -brand-firefox } data everywhere you’re signed in.)
postVerify-subject-4 = Welcome to { -brand-mozilla }!
postVerify-setup-2 = Connect another device:
postVerify-action-2 = Connect another device

postVerifySecondary-subject = Secondary email added
postVerifySecondary-title = Secondary email added
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = You have successfully confirmed { $secondaryEmail } as a secondary email for your { -product-mozilla-account }. Security notifications and sign-in confirmations will now be delivered to both email addresses.
postVerifySecondary-action = Manage account

recovery-subject = Reset your password
recovery-title-2 = Forgot your password?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = We received a request for a password change on your { -product-mozilla-account } from:
recovery-new-password-button = Create a new password by clicking the button below. This link will expire within the next hour.
recovery-copy-paste = Create a new password by copying and pasting the URL below into your browser. This link will expire within the next hour.
recovery-action = Create new password

#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Your { $productName } subscription has been cancelled
subscriptionAccountDeletion-title = Sorry to see you go
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = You recently deleted your { -product-mozilla-account }. As a result, we’ve cancelled your { $productName } subscription. Your final payment of { $invoiceTotal } was paid on { $invoiceDateOnly }.

# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Welcome to { $productName }: Please set your password.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Welcome to { $productName }
subscriptionAccountFinishSetup-content-processing = Your payment is processing and may take up to four business days to complete. Your subscription will renew automatically each billing period unless you choose to cancel.
subscriptionAccountFinishSetup-content-create-3 = Next, you’ll create a { -product-mozilla-account } password to start using your new subscription.
subscriptionAccountFinishSetup-action-2 = Get started

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
subscriptionCancellation-subject = Your { $productName } subscription has been canceled
subscriptionCancellation-title = Sorry to see you go

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = We’ve canceled your { $productName } subscription. Your final payment of { $invoiceTotal } was paid on { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = We’ve canceled your { $productName } subscription. Your final payment of { $invoiceTotal } will be paid on { $invoiceDateOnly }.

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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Your current subscription is set to automatically renew in { $reminderLength } days. At that time, { -brand-mozilla } will renew your { $planIntervalCount } { $planInterval } subscription and a charge of { $invoiceTotal } will be applied to the payment method on your account.
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

subscriptionsPaymentExpired-subject-2 = The payment method for your subscriptions is expired or expiring soon
subscriptionsPaymentExpired-title-2 = Your payment method is expired or about to expire
subscriptionsPaymentExpired-content-2 = The payment method you’re using to make payments for the following subscriptions is expired or about to expire.

subscriptionsPaymentProviderCancelled-subject = Payment information update required for { -brand-mozilla } subscriptions
subscriptionsPaymentProviderCancelled-title = Sorry, we’re having trouble with your payment method
subscriptionsPaymentProviderCancelled-content-detected = We have detected a problem with your payment method for the following subscriptions.
subscriptionsPaymentProviderCancelled-content-payment-1 = It may be that your payment method has expired, or your current payment method is out-of-date.

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

# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Use { $unblockCode } to sign in
unblockCode-preview = This code expires in one hour
unblockCode-title = Is this you signing in?
unblockCode-prompt = If yes, here is the authorization code you need:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = If yes, here is the authorization code you need: { $unblockCode }
unblockCode-report = If no, help us fend off intruders and <a data-l10n-name="reportSignInLink">report it to us</a>.
unblockCode-report-plaintext = If no, help us fend off intruders and report it to us.

verificationReminderFinal-subject = Final reminder to confirm your account
verificationReminderFinal-description-2 = A couple of weeks ago you created a { -product-mozilla-account }, but never confirmed it. For your security, we will delete the account if not verified in the next 24 hours.
confirm-account = Confirm account
confirm-account-plaintext = { confirm-account }:

verificationReminderFirst-subject-2 = Remember to confirm your account
verificationReminderFirst-title-3 = Welcome to { -brand-mozilla }!
verificationReminderFirst-description-3 = A few days ago you created a { -product-mozilla-account }, but never confirmed it. Please confirm your account in the next 15 days or it will be automatically deleted.
verificationReminderFirst-sub-description-3 = Don’t miss out on the browser that puts you and your privacy first.
confirm-email-2 = Confirm account
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirm account

verificationReminderSecond-subject-2 = Remember to confirm your account
verificationReminderSecond-title-3 = Don’t miss out on { -brand-mozilla }!
verificationReminderSecond-description-4 = A few days ago you created a { -product-mozilla-account }, but never confirmed it. Please confirm your account in the next 10 days or it will be automatically deleted.
verificationReminderSecond-second-description-3 = Your { -product-mozilla-account } lets you sync your { -brand-firefox } experience across devices and unlocks access to more privacy-protecting products from { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Be part of our mission to transform the internet into a place that’s open for everyone.
verificationReminderSecond-action-2 = Confirm account

verify-title-3 = Open the internet with { -brand-mozilla }
verify-description-2 = Confirm your account and get the most out of { -brand-mozilla } everywhere you sign in starting with:
verify-subject = Finish creating your account
verify-action-2 = Confirm account

# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Use { $code } to change your account
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview = { $expirationTime ->
  [one] This code expires in { $expirationTime } minute.
  *[other] This code expires in { $expirationTime } minutes.
}
verifyAccountChange-title = Are you changing your account info?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Help us keep your account safe by approving this change on:
verifyAccountChange-prompt = If yes, here is your authorization code:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice = { $expirationTime ->
  [one] It expires in { $expirationTime } minute.
  *[other] It expires in { $expirationTime } minutes.
}

# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Did you sign in to { $clientName }?
verifyLogin-description-2 = Help us keep your account safe by confirming you signed in on:
verifyLogin-subject-2 = Confirm sign-in
verifyLogin-action = Confirm sign-in

# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Use { $code } to sign in
verifyLoginCode-preview = This code expires in 5 minutes.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Did you sign in to { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Help us keep your account safe by approving your sign-in on:
verifyLoginCode-prompt-3 = If yes, here is your authorization code:
verifyLoginCode-expiry-notice = It expires in 5 minutes.

verifyPrimary-title-2 = Confirm primary email
verifyPrimary-description = A request to perform an account change has been made from the following device:
verifyPrimary-subject = Confirm primary email
verifyPrimary-action-2 = Confirm email
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Once confirmed, account changes like adding a secondary email will become possible from this device.

# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Use { $code } to confirm your secondary email
verifySecondaryCode-preview = This code expires in 5 minutes.
verifySecondaryCode-title-2 = Confirm secondary email
verifySecondaryCode-action-2 = Confirm email
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = A request to use { $email } as a secondary email address has been made from the following { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Use this confirmation code:
verifySecondaryCode-expiry-notice-2 = It expires in 5 minutes. Once confirmed, this address will begin receiving security notifications and confirmations.

# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Use { $code } to confirm your account
verifyShortCode-preview-2 = This code expires in 5 minutes
verifyShortCode-title-3 = Open the internet with { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirm your account and get the most out of { -brand-mozilla } everywhere you sign in starting with:
verifyShortCode-prompt-3 = Use this confirmation code:
verifyShortCode-expiry-notice = It expires in 5 minutes.
