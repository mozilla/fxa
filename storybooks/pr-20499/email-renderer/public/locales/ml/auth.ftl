## Non-email strings

session-verify-send-push-title-2 = { -product-mozilla-account }-ലോട്ടു് പ്രവേശിക്കുകയാണോ?
session-verify-send-push-body-2 = ഇതു് താങ്ങളാണെന്നു് ഉറപ്പിക്കാൻ വേണ്ടി ഇവിടെ അമൎത്തുക
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } ഉറപ്പിക്കൽസങ്കേതം: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code }-ആണു് താങ്ങളുടെ { -brand-mozilla } വീണ്ടെടുപ്പുസങ്കേതം. 5 മിനിറ്റിൽ ഇതിന്റെ കാലാവധി തീരും.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } സങ്കേതം: { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } സങ്കേതം: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } അടയാളം">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } അടയാളം">
subplat-automated-email = ഇതൊരു യാന്ത്രിക ഇമെയില് ആണ്; അബദ്ധവശാലാണ് നിങ്ങൾക്ക് ഈ ഇമെയില്‍ വന്നതെങ്കില്‍ ഒന്നും ചെയ്യണ്ട.
subplat-privacy-notice = സ്വകാര്യത അറിയിപ്പു്
subplat-privacy-plaintext = സ്വകാര്യത അറിയിപ്പു്:
subplat-update-billing-plaintext = { subplat-update-billing }:
subplat-terms-policy = നിബന്ധനകളും റദ്ദാക്കൽ നയവും
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = വീണ്ടും വരിക്കാരാവുക
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-privacy-policy = { -brand-mozilla } സ്വകാര്യത നയം
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } സ്വകാര്യത അറിയിപ്പു്
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } സേവന നിബന്ധനകള്‍
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = നിയമപരം
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = സ്വകാര്യത
subplat-privacy-website-plaintext = { subplat-privacy }:
payment-details = പണമടക്കൽമുറ വിശദാംശങ്ങൾ:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = വിലവിവരപ്പട്ടിക അക്കം: { $invoiceNumber }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = അടുത്ത വിലവിവരപ്പട്ടിക: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = ആകെത്തുക: { $invoiceSubtotal }

##

# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = വിലവിവരപ്പട്ടിക കാണുക: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = { $productName }-ലേക്കു് സ്വാഗതം
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = { $productName }-ലേക്കു് സ്വാഗതം
downloadSubscription-link-action-2 = തുടങ്ങാം
fraudulentAccountDeletion-subject-2 = താങ്ങളുടെ { -product-mozilla-account } മായ്ക്കപ്പെട്ടു
fraudulentAccountDeletion-title = താങ്ങളുടെ അക്കൗണ്ടു് മായ്ക്കപ്പെട്ടിരിക്കുന്നു
subscriptionAccountReminderFirst-action = ഒളിവാക്കു് ഉണ്ടാക്കുക
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla } ലേക്ക് സ്വാഗതം
subscriptionAccountReminderSecond-action = ഒളിവാക്കു് ഉണ്ടാക്കുക

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } പണമടക്കൽ തീൎച്ചപ്പെടുത്തി
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = { $productName }-ൽ വരിക്കാരാവുന്നതിനു് നന്ദി
