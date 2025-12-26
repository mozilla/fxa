## Non-email strings

# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } कोड: { $code }
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } कोड: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = { -brand-mozilla } गोपनीयता नीति
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } गोपनीयता सूचना
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } सेवा की शर्तें
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = यह एक स्वाचालित ईमेल है; यदि आपने इसको किसी त्रुटि के तहत प्राप्त किया है, कोई क्रिया आवश्यक नहीं.
subplat-privacy-notice = गोपनीयता सूचना
subplat-privacy-plaintext = गोपनीयता सूचना:
subplat-update-billing-plaintext = { subplat-update-billing }:
subplat-terms-policy = शर्तें और रद्द करने की नीति
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = सदस्यता रद्द करें
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = बिलिंग जानकारी को सामयिक करें
subplat-privacy-policy = { -brand-mozilla } गोपनीयता नीति
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } गोपनीयता सूचना
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } सेवा की शर्तें
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = कानूनी
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = गोपनीयता
subplat-privacy-website-plaintext = { subplat-privacy }:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Download { $productName } on { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Download { $productName } on the { -app-store }">
change-password-plaintext = यदि आपको संदेह है कि कोई आपके खाते तक पहुंच हासिल करने के लिए कोशिश कर रहा है, तो कृपया अपना पासवर्ड बदल लें.
manage-account = खाता प्रबंधित करें
manage-account-plaintext = { manage-account }:

##

cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
newDeviceLogin-action = खाता प्रबंधित करें
passwordChanged-subject = पासवर्ड अपडेट किया गया
passwordChanged-title = कूटशब्द सफलतापूर्वक परिवर्तित
passwordChangeRequired-subject = संदिग्ध गतिविधि का पता चला
postAddAccountRecovery-action = खाता प्रबंधित करें
postAddTwoStepAuthentication-action = खाता प्रबंधित करें
postChangePrimary-subject = प्राथमिक ईमेल अपडेट किया गया
postChangePrimary-title = नया प्राथमिक ईमेल
postChangePrimary-action = खाता प्रबंधित करें
postConsumeRecoveryCode-action = खाता प्रबंधित करें
postNewRecoveryCodes-action = खाता प्रबंधित करें
postRemoveAccountRecovery-action = खाता प्रबंधित करें
postRemoveSecondary-subject = द्वितीयक ईमेल हटा दिया गया
postRemoveSecondary-title = द्वितीयक ईमेल हटा दिया गया
postRemoveSecondary-action = खाता प्रबंधित करें
postRemoveTwoStepAuthentication-action = खाता प्रबंधित करें
postVerify-subject-4 = { -brand-mozilla } में आपका स्वागत है!
postVerifySecondary-subject = द्वितीयक ई-मेल जोड़ा गया
postVerifySecondary-title = द्वितीयक ई-मेल जोड़ा गया
postVerifySecondary-action = खाता प्रबंधित करें
recovery-subject = अपना कूटशब्द बदली करें
recovery-title-2 = क्या आप अपना पासवर्ड भूल गए?
recovery-action = नया कूटशब्द बनाएँ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = { $productName } में आपका स्वागत है
subscriptionAccountReminderFirst-action = पासवर्ड बनाएं
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-title-2 = { -brand-mozilla } में आपका स्वागत है!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

unblockCode-title = क्या आप ही साइन-इन कर रहे हैं?
unblockCode-prompt = यदि हाँ, तो ये है आपका प्राधिकरण कोड जिसकी आपको ज़रूरत है:
unblockCode-report-plaintext = यदि नहीं, तो हमें घुसपैठियों को रोकने मे मदद करें और हमें इसकी रिपोर्ट करें।
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-title-3 = { -brand-mozilla } में आपका स्वागत है!
confirm-email-plaintext-2 = { confirm-email-2 }:
verify-subject = अपना खाता बनाना पूर्ण करें
verifyLogin-action = साइन-इन की पुष्टि करें
verifyLoginCode-expiry-notice = यह 5 मिनट में समाप्त हो जाता है।
verifyPrimary-description = खाता परिवर्तन करने के लिए एक अनुरोध निम्न डिवाइस से किया गया है:
verifyPrimary-subject = प्राथमिक ईमेल की पुष्टि करें
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyShortCode-expiry-notice = यह 5 मिनट में समाप्त हो जाता है।
