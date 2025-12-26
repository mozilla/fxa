## Non-email strings

session-verify-send-push-title-2 = Ба ҳисоби худ дар { -product-mozilla-account } ворид мешавед?
session-verify-send-push-body-2 = Барои тасдиқ кардани он, ки ин шумо ҳастед, дар ин ҷой зер кунед
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } санҷиши ҳаққоният аз «{ -brand-mozilla }». Муҳлаташ 5 дақиқа
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Рамзи «{ -brand-mozilla }» барои санҷиши ҳаққоният: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = Рамзи { $code } барои барқарорсозии ҳисоби шумо дар «{ -brand-mozilla }». Муҳлаташ пас аз 5 дақиқа ба анҷом мерасад.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Рамзи «{ -brand-mozilla }»: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = Рамзи { $code } барои барқарорсозии ҳисоби шумо дар «{ -brand-mozilla }». Муҳлаташ пас аз 5 дақиқа ба анҷом мерасад.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Рамзи «{ -brand-mozilla }»: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Дастгоҳҳо">
fxa-privacy-url = Сиёсати махфияти «{ -brand-mozilla }»
moz-accounts-privacy-url-2 = Огоҳномаи махфияти «{ -product-mozilla-accounts(capitalization: "uppercase") }»
moz-accounts-terms-url = Шартҳои хизматрасонии «{ -product-mozilla-accounts(capitalization: "uppercase") }»
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Ин паёми худкори почтаи элекронӣ мебошад; агар шумо онро аз рӯйи иштибоҳ гирифтед, ягон амал зарур нест.
subplat-privacy-notice = Огоҳномаи махфият
subplat-privacy-plaintext = Огоҳномаи махфият:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Шумо ин паёми почтаи электрониро қабул кардед, зеро ки «{ $email }» дар ҳисоби «{ -product-mozilla-account }» вуҷуд дорад ва шумо барои «{ $productName }» номнавис шудед.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Шумо ин паёми почтаи электрониро қабул кардед, зеро ки «{ $email }» дар ҳисоби «{ -product-mozilla-account }» вуҷуд дорад.
subplat-explainer-multiple-2 = Шумо ин паёми почтаи электрониро қабул кардед, зеро ки «{ $email }» дар ҳисоби «{ -product-mozilla-account }» вуҷуд дорад ва шумо ба якчанд маҳсули он обуна шудед.
subplat-explainer-was-deleted-2 = Шумо ин паёми почтаи электрониро қабул кардед, зеро ки «{ $email }» дар ҳисоби «{ -product-mozilla-account }» ба қайд гирифта шудааст.
subplat-manage-account-2 = Танзимоти худро дар «{ -product-mozilla-account }» тавассути <a data-l10n-name="subplat-account-page">саҳифаи ҳисоби худ</a> идора кунед.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Танзимоти худро дар «{ -product-mozilla-account }» тавассути саҳифаи ҳисоби худ идора кунед: { $accountSettingsUrl }
subplat-terms-policy = Шартҳо ва сиёсати барҳамдиҳӣ
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Бекор кардани обуна
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Аз нав барқарор кардани обуна
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Навсозии маълумоти санади ҳисоббарорӣ
subplat-privacy-policy = Сиёсати махфияти «{ -brand-mozilla }»
subplat-privacy-policy-2 = Огоҳномаи махфияти «{ -product-mozilla-accounts(capitalization: "uppercase") }»
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Шартҳои хизматрасонии «{ -product-mozilla-accounts(capitalization: "uppercase") }»
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Маълумоти ҳуқуқӣ
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Махфият
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Агар ҳисоби шумо нест карда шавад, шумо ба ҳар ҳол аз «Mozilla Corporation» ва «Foundation Mozilla» паёмҳои электрониро мегиред, агар шумо <a data-l10n-name="unsubscribeLink">хоҳиши қатъ кардани обунаро</a> талаб накунед.
account-deletion-info-block-support = Агар шумо ягон савол дошта бошед ё ба кумак ниёз дошта бошед, лутфан, ба <a data-l10n-name="supportLink">дастаи дастгирии мо</a> озодона муроҷиат кунед.
account-deletion-info-block-communications-plaintext = Агар ҳисоби шумо нест карда шавад, шумо ба ҳар ҳол аз «Mozilla Corporation» ва «Foundation Mozilla» паёмҳои электрониро мегиред, агар шумо хоҳиши қатъ кардани обунаро талаб накунед:
account-deletion-info-block-support-plaintext = Агар шумо ягон савол дошта бошед ё ба кумак ниёз дошта бошед, лутфан, ба дастаи дастгирии мо озодона муроҷиат кунед:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Боргирӣ кардани «{ $productName }» аз «{ -google-play }»">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Боргирӣ кардани «{ $productName }» аз «{ -app-store }»">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Насб кардани «{ $productName }» дар <a data-l10n-name="anotherDeviceLink">дастгоҳи мизи кории дигар</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Насб кардани «{ $productName }» дар <a data-l10n-name="anotherDeviceLink">дастгоҳи дигар</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Ба даст овардани «{ $productName }» тавассути «Google Play»:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Боргирӣ кардани «{ $productName }» тавассути «App Store»:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Насб кардани «{ $productName }» дар дастгоҳи дигар:
automated-email-change-2 = Агар шумо ин амалро дархост накардед, <a data-l10n-name="passwordChangeLink">ниҳонвожаи худро дарҳол иваз намоед</a>.
automated-email-support = Барои гирифтани маълумоти бештар, лутфан, ба бахши <a data-l10n-name="supportLink"> Дастгирии «{ -brand-mozilla }»</a> ворид шавед.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Агар шумо барои иҷро кардани ин амал иҷозат надодед, пас, лутфан, ниҳонвожаи худро ҳоли ҳозир иваз намоед:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Барои маълумоти иловагӣ, ба Дастгирии «{ -brand-mozilla }» муроҷиат кунед:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Барои гирифтани маълумоти бештар, лутфан, ба бахши <a data-l10n-name="supportLink">Дастгирии «{ -brand-mozilla }»</a> ворид шавед.
automated-email-no-action-plaintext = Ин паёми худкори почтаи элекронӣ мебошад. Агар шумо онро аз рӯйи иштибоҳ қабул кардед, ягон амал зарур нест.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ин паёми худкори почтаи элекронӣ мебошад; агар шумо барои иҷро кардани ин амал иҷозат надодед, пас, лутфан, ниҳонвожаи худро иваз намоед.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Ин дархост аз { $uaBrowser } дар { $uaOS } { $uaOSVersion } ворид шуд.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Ин дархост аз { $uaBrowser } дар { $uaOS } ворид шуд.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Ин дархост аз { $uaBrowser } ворид шуд.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Ин дархост аз { $uaOS } { $uaOSVersion } ворид шуд.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Ин дархост аз { $uaOS } ворид шуд.
automatedEmailRecoveryKey-delete-key-change-pwd = Агар ин шумо набудед, <a data-l10n-name="revokeAccountRecoveryLink">калиди навро нест кунед</a> ва <a data-l10n-name="passwordChangeLink">ниҳонвожаи худро иваз намоед</a>.
automatedEmailRecoveryKey-change-pwd-only = Агар ин шумо набудед, <a data-l10n-name="passwordChangeLink">ниҳонвожаи худро иваз намоед</a>.
automatedEmailRecoveryKey-more-info = Барои гирифтани маълумоти бештар, лутфан, ба бахши <a data-l10n-name="supportLink"> Дастгирии «{ -brand-mozilla }»</a> ворид шавед.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Ин дархост аз дастгоҳи зерин қабул шуд:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Агар ин шумо набудед, калиди навро нест кунед:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Агар ин шумо набудед, ниҳонвожаи худро иваз кунед:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = ва ниҳонвожаи худро иваз намоед:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Барои маълумоти иловагӣ, ба Дастгирии «{ -brand-mozilla }» муроҷиат кунед:
automated-email-reset =
    Ин паёми худкори почтаи элекронӣ мебошад; агар шумо барои иҷро кардани ин амал иҷозат надодед, пас, лутфан, <a data-l10n-name="resetLink">ниҳонвожаи худро иваз намоед</a>.
    Барои гирифтани маълумоти бештар, лутфан, ба бахши <a data-l10n-name="supportLink">Дастгирии «{ -brand-mozilla }»</a> ворид шавед.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Агар шумо барои иҷрои ин амал иҷозат надода бошед, лутфан, ниҳонвожаи худро дарҳол дар { $resetLink } аз нав танзим кунед.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Агар шумо барои иҷро кардани ин амал иҷозат надодед, пас, лутфан, ниҳонвожаи худро ҳоли ҳозир аз нав танзим кунед:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Инчунин, санҷиши ҳаққонияти дуқадамаро аз нав танзим кунед:
brand-banner-message = Шумо медонед, ки мо номи худро аз «{ -product-firefox-accounts }» ба «{ -product-mozilla-accounts }» иваз кардем? <a data-l10n-name="learnMore">Маълумоти бештар</a>
cancellationSurvey = Лутфан, ба воситаи гузаронидани ин <a data-l10n-name="cancellationSurveyUrl">саволномаи кутоҳ</a> ба мо барои беҳтар кардани хизматрасониҳои мо кумак расонед.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Лутфан, ба воситаи гузаронидани ин саволномаи кутоҳ ба мо барои беҳтар кардани хизматрасониҳои мо кумак расонед:
change-password-plaintext = Агар шумо гумон кунед, ки касе мехоҳад ба ҳисоби шумо дастрасӣ пайдо намояд, лутфан, ниҳонвожаи худро иваз кунед.
manage-account = Идоракунии ҳисоб
manage-account-plaintext = { manage-account }:
payment-details = Тафсилоти пардохт:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Рақами санади дархости пардохт: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Пардохт шуд: { $invoiceTotal } дар { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Санади дархости пардохти навбатӣ: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Тарзи пардохт</b>: { $paymentProviderName }
payment-method-payment-provider-plaintext = Тарзи пардохт: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Тарзи пардохт: Корти «{ $cardName }», ки рақамаш бо { $lastFour } анҷом меёбад
payment-provider-card-ending-in-plaintext = Тарзи пардохт: Корте, ки рақамаш бо { $lastFour } анҷом меёбад
payment-provider-card-ending-in = <b>Тарзи пардохт</b>: Корте, ки рақамаш бо { $lastFour } анҷом меёбад
payment-provider-card-ending-in-card-name = <b>Тарзи пардохт</b>: Корти «{ $cardName }», ки рақамаш бо { $lastFour } анҷом меёбад
subscription-charges-invoice-summary = Ҷамъбасти санадҳои дархости пардохт

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Рақами санади дархости пардохт:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Рақами санади дархости пардохт: { $invoiceNumber }
subscription-charges-invoice-date = <b>Сана:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Сана: { $invoiceDateOnly }
subscription-charges-prorated-price = Нархи мутаносиб
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Нархи мутаносиб: { $remainingAmountTotal }
subscription-charges-list-price = Нархнома
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Нархи рӯйхат: { $offeringPrice }
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Ҷамъи миёна: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Тахфифи якдафъаина
subscription-charges-one-time-discount-plaintext = Тахфифи яккарата: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] Тахфифи { $discountDuration }-моҳа
       *[other] Тахфифи { $discountDuration }-моҳа
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
       *[other] Тахфифи { $discountDuration }-моҳа: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Тахфиф
subscription-charges-discount-plaintext = Тахфиф: { $invoiceDiscountAmount }
subscription-charges-taxes = Андозҳо ва ҳаққи ҳизматрасонӣ
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Андозҳо ва ҳаққи ҳизматрасонӣ: { $invoiceTaxAmount }
subscription-charges-total = <b>Ҳамагӣ</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Ҳамагӣ: { $invoiceTotal }
subscription-charges-credit-applied = Қарзи истифодашуда
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Қарзи истифодашуда: { $creditApplied }
subscription-charges-amount-paid = <b>Маблағи пардохтшуда</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Маблағи пардохтшуда: { $invoiceAmountDue }

##

# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Саволҳо дар бораи обунаи худ доред? Дар ин ҷой дастаи дастгирии мо ба шумо кумак мерасонад:
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Идоракунии обунаи худ</a>
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Бо дастаи дастгирии корбарон дар тамос шавед:</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Бо дастаи дастгирии корбарон дар тамос шавед:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Барои гирифтани маълумоти бештар, лутфан, ба бахши <a data-l10n-name="supportLink"> Дастгирии «{ -brand-mozilla }»</a> ворид шавед.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Барои маълумоти иловагӣ, ба Дастгирии «{ -brand-mozilla }» муроҷиат кунед: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = «{ $uaBrowser }» дар «{ $uaOS } { $uaOSVersion }»
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = «{ $uaBrowser }» дар «{ $uaOS }»
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city },  { $stateCode }, { $country } (тақрибан)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (тақрибан)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (тақрибан)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (тақрибан)
view-invoice-link-action = Дидани санади дархости пардохт
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Дидани санади дархости пардохт: { $invoiceLink }
cadReminderFirst-subject-1 = Ёдоварӣ! Биёед «{ -brand-firefox }»-ро ҳамоҳанг созем
cadReminderFirst-action = Ҳамоҳанг кардани дастгоҳи дигар
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Барои ҳамоҳангсозӣ дуто лозим аст
cadReminderSecond-subject-2 = Аз даст надиҳед! Биёед танзимоти ҳамоҳангсозии шуморо ба анҷом расонем
cadReminderSecond-action = Ҳамоҳанг кардани дастгоҳи дигар
cadReminderSecond-title-2 = Ҳамоҳангсозиро фаромӯш накунед!
cadReminderSecond-description-sync = Хатбаракҳо, ниҳонвожаҳо, варақаҳои кушодашуда ва чизҳои бештарро дар ҳама ҷойе, ки шумо аз «{ -brand-firefox }» истифода мебаред, ҳамоҳанг созед.
cadReminderSecond-description-plus = Илова бар ин, маълумоти шумо ҳамеша рамзгузорӣ карда мешавад. Танҳо шумо ва танҳо дар дастгоҳҳое, ки шумо тасдиқ мекунед, онро дида метавонед.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Хуш омадед ба «{ $productName }»
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Хуш омадед ба «{ $productName }»
downloadSubscription-content-2 = Биёед бо истифода аз ҳамаи хусусиятҳои дохилшуда барои обунаи шумо оғоз намоем:
downloadSubscription-link-action-2 = Оғози кор
fraudulentAccountDeletion-subject-2 = Ҳисоби шумо дар «{ -product-mozilla-account }» нест карда шуд
fraudulentAccountDeletion-title = Ҳисоби шумо нест карда шуд
fraudulentAccountDeletion-contact = Агар шумо ягон савол дошта бошед, лутфан, бо <a data-l10n-name="mozillaSupportUrl">дастаи дастгирии мо</a> дар тамос шавед.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Агар шумо ягон савол дошта бошед, лутфан, бо дастаи дастгирии мо дар тамос шавед: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Охирин имконият барои нигоҳ доштани «{ -product-mozilla-account }»-и худ
inactiveAccountFinalWarning-title = Ҳисоб ва маълумоти шахсии шумо дар «{ -brand-mozilla }» нест карда мешавад
inactiveAccountFinalWarning-preview = Барои нигоҳ доштани ҳисоби худ ворид шавед
inactiveAccountFinalWarning-action = Барои нигоҳ доштани ҳисоби худ ворид шавед
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Барои нигоҳ доштани ҳисоби худ ворид шавед:
inactiveAccountFirstWarning-subject = Ҳисоби худро гум накунед
inactiveAccountFirstWarning-title = Оё шумо мехоҳед ҳисоб ва маълумоти «{ -brand-mozilla }»-и худро нигоҳ доред?
inactiveAccountFirstWarning-action = Барои нигоҳ доштани ҳисоби худ ворид шавед
inactiveAccountFirstWarning-preview = Барои нигоҳ доштани ҳисоби худ ворид шавед
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Барои нигоҳ доштани ҳисоби худ ворид шавед:
inactiveAccountSecondWarning-subject = Амал диққати шуморо талаб мекунад: Ҳисоб пас аз 7 рӯз нест карда мешавад
inactiveAccountSecondWarning-title = Ҳисоб ва маълумоти шахсии шумо дар «{ -brand-mozilla }» пас аз 7 рӯз нест карда мешавад
inactiveAccountSecondWarning-action = Барои нигоҳ доштани ҳисоби худ ворид шавед
inactiveAccountSecondWarning-preview = Барои нигоҳ доштани ҳисоби худ ворид шавед
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Барои нигоҳ доштани ҳисоби худ ворид шавед:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Нусхаҳои эҳтиётии рамзи санҷиши ҳаққоният тамом шуданд!
codes-reminder-title-one = Шумо аз нусхаи эҳтиётии рамзи санҷиши ҳаққонияти охирини худ истифода мебаред
codes-reminder-title-two = Акнун вақт барои эҷод кардани нусхаҳои эҳтиётии иловагии рамзи санҷиши ҳаққоният расидааст
codes-reminder-description-part-one = Нусхаҳои эҳтиётии рамзи санҷиши ҳаққоният ба шумо барои барқарорсозии маълумоти шахсӣ ҳангоми фаромӯш кардани ниҳонвожа кумак мерасонанд.
codes-reminder-description-part-two = Ҳозир рамзҳои навро эҷод кунед, то баъдан маълумоти шахсии худро аз даст надиҳед.
codes-reminder-description-two-left = Шумо танҳо ду рамз доред.
lowRecoveryCodes-action-2 = Эҷод кардани рамзҳо
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Воридшавии нав ба «{ $clientName }»
newDeviceLogin-subjectForMozillaAccount = Воридшавии нав ба ҳисоби шумо дар «{ -product-mozilla-account }»
newDeviceLogin-title-3 = Ҳисоби шумо дар «{ -product-mozilla-account }» барои воридшавӣ истифода шуд
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Ин шумо набудед? <a data-l10n-name="passwordChangeLink">Ниҳонвожаи худро иваз намоед</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Ин шумо набудед? Ниҳонвожаи худро иваз намоед:
newDeviceLogin-action = Идоракунии ҳисоб
passwordChanged-subject = Ниҳонвожа аз нав нигоҳ дошта шуд
passwordChanged-title = Ниҳонвожа бо муваффақият иваз карда шуд
passwordChanged-description-2 = Ниҳонвжаи шумо барои «{ -product-mozilla-account }» аз дастгоҳи зерин бо муваффақият иваз карда шуд:
passwordChangeRequired-subject = Фаъолияти шубҳанок ошкор карда шуд
passwordChangeRequired-preview = Ниҳонвожаи худро фавран иваз кунед
passwordChangeRequired-title-2 = Барқарор кардани ниҳонвожаи худ
passwordChangeRequired-action = Барқарор кардани ниҳонвожа
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Барои иваз кардани ниҳонвожаи худ аз { $code } истифода баред
password-forgot-otp-preview = Муҳлати ин рамз пас аз 10 дақиқа ба анҷом мерасад
password-forgot-otp-title = Ниҳонвожаи худро фаромӯш кардед?
password-forgot-otp-code-2 = Агар ин шумо будед, он гоҳ ин рамзи тасдиқкунандаи шумо барои идома мебошад:
password-forgot-otp-expiry-notice = Муҳлати ин рамз пас аз 10 дақиқа ба анҷом мерасад.
passwordReset-subject-2 = Ниҳонвожаи шумо аз нав барқарор карда шуд
passwordReset-title-2 = Ниҳонвожаи шумо аз нав барқарор карда шуд
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Маълумоти барқарорсозии ниҳонвожаи «{ -product-mozilla-account }»-и шумо дар:
passwordResetAccountRecovery-subject-2 = Ниҳонвожаи шумо аз нав барқарор карда шуд
passwordResetAccountRecovery-title-3 = Ниҳонвожаи шумо аз нав барқарор карда шуд
passwordResetAccountRecovery-action-4 = Идоракунии ҳисоб
passwordResetRecoveryPhone-subject = Телефони барқарорсозӣ истифода карда шуд
passwordResetRecoveryPhone-preview = Тасдиқ кунед, то мутмаин шавед, ки ин шумо будед
passwordResetRecoveryPhone-title = Телефони барқарорсозии шумо барои тасдиқи барқарорсозии ниҳонвожа истифода шуд
passwordResetRecoveryPhone-device = Телефони барқарорсозӣ истифода карда шуд аз:
passwordResetRecoveryPhone-action = Идоракунии ҳисоб
passwordResetWithRecoveryKeyPrompt-subject = Ниҳонвожаи шумо аз нав барқарор карда шуд
passwordResetWithRecoveryKeyPrompt-title = Ниҳонвожаи шумо аз нав барқарор карда шуд
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Маълумоти барқарорсозии ниҳонвожаи «{ -product-mozilla-account }»-и шумо дар:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Эҷод кардани калиди барқарорсозии ҳисоб
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Эҷод кардани калиди барқарорсозии ҳисоб:
postAddAccountRecovery-subject-3 = Калиди нави барқарорсозии ҳисоб эҷод карда шуд
postAddAccountRecovery-title2 = Шумо калиди наверо барои барқарорсозии ҳисоб эҷод кардед
postAddAccountRecovery-action = Идоракунии ҳисоб
postAddLinkedAccount-subject-2 = Ҳисоби нав, ки ба «{ -product-mozilla-account }»-и шумо пайваст шудааст
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Ҳисоби «{ $providerName }»-и шумо ба «{ -product-mozilla-account }»-и шумо пайваст карда шуд
postAddLinkedAccount-action = Идоракунии ҳисоб
postAddRecoveryPhone-subject = Телефони барқарорсозӣ илова карда шуд
postAddRecoveryPhone-preview = Ҳисоб бо санҷиши ҳаққонияти дуқадама ҳифз карда шуд
postAddRecoveryPhone-title-v2 = Шумо рақами телефони барқарорсозиро илова кардед
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Шумо «{ $maskedLastFourPhoneNumber }»-ро ҳамчун рақами телефони барқарорсозӣ илова кардед
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Ин чӣ тавр ҳисоби шуморо муҳофизат мекунад
postAddRecoveryPhone-how-protect-plaintext = Ин чӣ тавр ҳисоби шуморо муҳофизат мекунад:
postAddRecoveryPhone-enabled-device = Шумо онро дар дастгоҳи зерин фаъол кардед:
postAddRecoveryPhone-action = Идоракунии ҳисоб
postAddTwoStepAuthentication-preview = Ҳисоби шумо ҳифз карда шудааст
postAddTwoStepAuthentication-subject-v3 = Санҷиши ҳаққонияти дуқадама фаъол аст
postAddTwoStepAuthentication-title-2 = Шумо санҷиши ҳаққонияти дуқадамаро фаъол кардед
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Шумо инро дар дастгоҳи зерин дархост кардед:
postAddTwoStepAuthentication-action = Идоракунии ҳисоб
postAddTwoStepAuthentication-recovery-method-codes = Шумо, инчунин, нусхаи эҳтиётии рамзҳои санҷиши ҳаққониятро ҳамчун тарзи барқарорсозии ҳисоби худ илова кардед.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Шумо, инчунин, «{ $maskedPhoneNumber }»-ро ҳамчун рақами телефони барқарорсозии худ илова кардед.
postAddTwoStepAuthentication-how-protects-link = Ин чӣ тавр ҳисоби шуморо муҳофизат мекунад
postAddTwoStepAuthentication-how-protects-plaintext = Ин чӣ тавр ҳисоби шуморо муҳофизат мекунад:
postChangeAccountRecovery-subject = Калиди барқарорсозии ҳисоб иваз шуд
postChangeAccountRecovery-title = Шумо калиди барқарорсозии ҳисоби худро иваз кардед
postChangeAccountRecovery-action = Идоракунии ҳисоб
postChangePrimary-subject = Почтаи электронии асосӣ иваз шуд
postChangePrimary-title = Почтаи электронии асосии нав
postChangePrimary-action = Идоракунии ҳисоб
postChangeRecoveryPhone-subject = Телефони барқарорсозӣ нав карда шуд
postChangeRecoveryPhone-preview = Ҳисоб бо санҷиши ҳаққонияти дуқадама ҳифз карда шуд
postChangeRecoveryPhone-title = Шумо телефони барқарорсозии худро иваз кардед
postChangeRecoveryPhone-requested-device = Шумо онро дар дастгоҳи зерин дархост кардед:
postChangeTwoStepAuthentication-preview = Ҳисоби шумо ҳифз карда шудааст
postChangeTwoStepAuthentication-subject = Санҷиши ҳаққонияти дуқадама навсозӣ карда шуд
postChangeTwoStepAuthentication-title = Санҷиши ҳаққонияти дуқадама навсозӣ карда шудааст
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Шумо инро дар дастгоҳи зерин дархост кардед:
postChangeTwoStepAuthentication-action = Идоракунии ҳисоб
postChangeTwoStepAuthentication-how-protects-link = Ин чӣ тавр ҳисоби шуморо муҳофизат мекунад
postChangeTwoStepAuthentication-how-protects-plaintext = Ин чӣ тавр ҳисоби шуморо муҳофизат мекунад:
postConsumeRecoveryCode-title-3 = Нусхаи эҳтиётии рамзи санҷиши ҳаққонияти шумо барои тасдиқи барқарорсозии ниҳонвожа истифода шуд
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Рамз истифода карда шуд аз:
postConsumeRecoveryCode-action = Идоракунии ҳисоб
postConsumeRecoveryCode-subject-v3 = Рамзи санҷиши ҳаққоният истифода карда шуд
postConsumeRecoveryCode-preview = Тасдиқ кунед, то мутмаин шавед, ки ин шумо будед
postNewRecoveryCodes-subject-2 = Нусхаҳои эҳтиётии нави рамзи санҷиши ҳаққоният эҷод карда шуданд
postNewRecoveryCodes-title-2 = Шумо нусхаҳои эҳтиётии нави рамзи санҷиши ҳаққониятро эҷод кардед
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Онҳо эҷод карда шудаанд дар:
postNewRecoveryCodes-action = Идоракунии ҳисоб
postRemoveAccountRecovery-subject-2 = Калиди барқарорсозии ҳисоб нест карда шуд
postRemoveAccountRecovery-title-3 = Шумо калиди барқарорсозии ҳисобро нест кардед
postRemoveAccountRecovery-action = Идоракунии ҳисоб
postRemoveRecoveryPhone-subject = Телефони барқарорсозӣ тоза карда шуд
postRemoveRecoveryPhone-preview = Ҳисоб бо санҷиши ҳаққонияти дуқадама ҳифз карда шуд
postRemoveRecoveryPhone-title = Телефони барқарорсозӣ тоза карда шуд
postRemoveRecoveryPhone-requested-device = Шумо онро дар дастгоҳи зерин дархост кардед:
postRemoveSecondary-subject = Почтаи электронии иловагӣ тоза шуд
postRemoveSecondary-title = Почтаи электронии иловагӣ тоза шуд
postRemoveSecondary-action = Идоракунии ҳисоб
postRemoveTwoStepAuthentication-subject-line-2 = Санҷиши ҳаққонияти дуқадама ғайрифаъол аст
postRemoveTwoStepAuthentication-title-2 = Шумо санҷиши ҳаққонияти дуқадамаро ғайрифаъол кардед
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Шумо онро дар дастгоҳи зерин ғайрифаъол кардед:
postRemoveTwoStepAuthentication-action = Идоракунии ҳисоб
postSigninRecoveryCode-subject = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният, ки барои воридшавӣ истифода мешавад
postSigninRecoveryCode-preview = Тасдиқ кардани фаъолияти ҳисоб
postSigninRecoveryCode-title = Нусхаи эҳтиётии рамзи санҷиши ҳаққонияти шумо барои воридшавӣ истифода шуд
postSigninRecoveryCode-device = Шумо аз дастгоҳи зерин ворид шудед:
postSigninRecoveryCode-action = Идоракунии ҳисоб
postSigninRecoveryPhone-subject = Рақами телефони барқарорсозӣ барои воридшавӣ истифода шуд
postSigninRecoveryPhone-preview = Тасдиқ кардани фаъолияти ҳисоб
postSigninRecoveryPhone-title = Рақами телефони барқарорсозии шумо барои воридшавӣ истифода шуд
postSigninRecoveryPhone-device = Шумо аз дастгоҳи зерин ворид шудед:
postSigninRecoveryPhone-action = Идоракунии ҳисоб
postVerify-sub-title-3 = Мо аз дидани шумо хурсандем!
postVerify-title-2 = Мехоҳед, ки ҳамон варақаро дар ду дастгоҳ бинед?
postVerify-subject-4 = Хуш омадед ба «{ -brand-mozilla }»!
postVerify-setup-2 = Пайваст кардани дастгоҳи дигар:
postVerify-action-2 = Пайваст кардани дастгоҳи дигар
postVerifySecondary-subject = Почтаи электронии иловагӣ илова шуд
postVerifySecondary-title = Почтаи электронии иловагӣ илова шуд
postVerifySecondary-action = Идоракунии ҳисоб
recovery-subject = Барқарор кардани ниҳонвожаи худ
recovery-title-2 = Ниҳонвожаи худро фаромӯш кардед?
recovery-action = Ниҳонвожаи наверо эҷод намоед
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Обунаи шумо ба «{ $productName }» бекор карда шуд
subscriptionAccountDeletion-title = Афсӯс, ки шумо меравед
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Хуш омадед ба «{ $productName }»! Лутфан, ниҳонвожаи худро танзим намоед.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Хуш омадед ба «{ $productName }»
subscriptionAccountFinishSetup-action-2 = Оғози кор
subscriptionAccountReminderFirst-subject = Ёдоварӣ: Танзими ҳисоби худро ба анҷом расонед
subscriptionAccountReminderFirst-title = Шумо ҳоло наметавонед, ки ба обунаи худ дастрасӣ пайдо намоед
subscriptionAccountReminderFirst-action = Эҷод кардани ниҳонвожа
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Ёдоварии ниҳоӣ: Ҳисоби худро танзим кунед
subscriptionAccountReminderSecond-title-2 = Хуш омадед ба «{ -brand-mozilla }»!
subscriptionAccountReminderSecond-action = Эҷод кардани ниҳонвожа
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Обунаи шумо ба «{ $productName }» бекор карда шуд
subscriptionCancellation-title = Афсӯс, ки шумо меравед

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Шумо ба «{ $productName }» гузаштед
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Шумо бо муваффақият аз «{ $productNameOld }» ба «{ $productName }» гузаштед.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Обунаи шумо ба «{ $productName }» бекор карда шуд
subscriptionFailedPaymentsCancellation-title = Обунаи шумо бекор карда шуд
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Пардохт барои «{ $productName }» тасдиқ карда шуд
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Ташаккур барои обунашавии шумо ба «{ $productName }»
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Пардохт барои «{ $productName }» иҷро шуд
subscriptionPaymentFailed-title = Мутаассифона, ҳангоми коркарди пардохти шумо мушкилӣ ба миён омад
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Навсозии маълумоти пардохт барои «{ $productName }» лозим аст
subscriptionPaymentProviderCancelled-title = Мутаассифона, ҳангоми татбиқи тарзи пардохти шумо мушкилӣ ба миён омад
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Обунаи «{ $productName }» аз нав фаъол карда шуд
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Ташаккур барои аз нав фаъол кардани обунашавии худ дар «{ $productName }»!
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Огоҳнома дар бораи навсозии худкори «{ $productName }»
subscriptionRenewalReminder-title = Обунаи шумо ба зудӣ нав карда мешавад
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Муҳтарам корбари «{ $productName }»,
subscriptionRenewalReminder-content-closing = Бо эҳтиром,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Дастаи «{ $productName }»
subscriptionReplaced-subject = Обунаи шумо ҳамчун як қисми навсозии шумо нав карда шуд
subscriptionReplaced-title = Обунаи шумо навсозӣ карда шуд
subscriptionReplaced-content-no-action = Аз ҷониби шумо ягон амал талаб карда намешавад.
subscriptionsPaymentProviderCancelled-title = Мутаассифона, ҳангоми татбиқи тарзи пардохти шумо мушкилӣ ба миён омад
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Пардохт барои «{ $productName }» қабул шуд
subscriptionSubsequentInvoice-title = Ташаккур ба шумо барои обунашавӣ!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Мо пардохти охирини шуморо барои «{ $productName }» қабул кардем.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Шумо ба «{ $productName }» навсозӣ кардед
subscriptionUpgrade-title = Ташаккур ба шумо барои такмилдиҳӣ!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Шумо бо муваффақият ба «{ $productName }» такмил додед.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-old-price-day = Нархи қаблӣ { $paymentAmountOld } дар як рӯз буд.
subscriptionUpgrade-content-old-price-week = Нархи қаблӣ { $paymentAmountOld } дар як ҳафта буд.
subscriptionUpgrade-content-old-price-month = Нархи қаблӣ { $paymentAmountOld } дар як моҳ буд.
subscriptionUpgrade-content-old-price-halfyear = Нархи қаблӣ { $paymentAmountOld } барои шаш моҳ буд.
subscriptionUpgrade-content-old-price-year = Нархи қаблӣ { $paymentAmountOld } дар як сол буд.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Барои ворид шудан ба низом, аз { $unblockCode } истифода баред
unblockCode-preview = Муҳлати ин рамз пас аз як соат ба анҷом мерасад
unblockCode-title = Оё ин шумо ворид мешавед?
verificationReminderFinal-subject = Ёдоварии ниҳоӣ барои тасдиқ кардани ҳисоби худ
confirm-account = Тасдиқ кардани ҳисоб
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Дар хотир доред, ки ҳисоби худро тасдиқ намоед
verificationReminderFirst-title-3 = Хуш омадед ба «{ -brand-mozilla }»!
confirm-email-2 = Тасдиқ кардани ҳисоб
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Тасдиқ кардани ҳисоб
verificationReminderSecond-subject-2 = Дар хотир доред, ки ҳисоби худро тасдиқ намоед
verificationReminderSecond-title-3 = Дар «{ -brand-mozilla }» аз даст надиҳед!
verificationReminderSecond-action-2 = Тасдиқ кардани ҳисоб
verify-title-3 = Интернетро боз бо «{ -brand-mozilla }» кашф кунед
verify-subject = Эҷоди ҳисоби худро ба анҷом расонед
verify-action-2 = Тасдиқ кардани ҳисоб
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Барои иваз кардани ҳисоби худ аз { $code } истифода баред
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Муҳлати ин рамз пас аз { $expirationTime } дақиқа ба анҷом мерасад.
       *[other] Муҳлати ин рамз пас аз { $expirationTime } дақиқа ба анҷом мерасад.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Оё ин шумо ба «{ $clientName }» ворид шудед?
verifyLogin-subject-2 = Тасдиқ кардани воридшавӣ
verifyLogin-action = Тасдиқ кардани воридшавӣ
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Барои ворид шудан ба низом, аз { $code } истифода баред
verifyLoginCode-preview = Муҳлати ин рамз пас аз 5 дақиқа ба анҷом мерасад.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Оё ин шумо ба «{ $serviceName }» ворид шудаед?
verifyLoginCode-prompt-3 = Агар ҳа, рамзи санҷиши дастрасии шумо ҳамин аст:
verifyLoginCode-expiry-notice = Муҳлаташ пас аз 5 дақиқа ба анҷом мерасад.
verifyPrimary-title-2 = Почтаи электронии асосиро тасдиқ кунед
verifyPrimary-subject = Почтаи электронии асосиро тасдиқ кунед
verifyPrimary-action-2 = Тасдиқ кардани почтаи электронӣ
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Барои тасдиқ кардани почтаи электронии иловагии худ аз { $code } истифода баред
verifySecondaryCode-preview = Муҳлати ин рамз пас аз 5 дақиқа ба анҷом мерасад.
verifySecondaryCode-title-2 = Почтаи электронии иловагиро тасдиқ кунед
verifySecondaryCode-action-2 = Тасдиқ кардани почтаи электронӣ
verifySecondaryCode-prompt-2 = Аз ин рамзи тасдиқкунанда истифода баред:
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Барои тасдиқ кардани ҳисоби худ аз { $code } истифода баред
verifyShortCode-preview-2 = Муҳлати ин рамз пас аз 5 дақиқа ба анҷом мерасад
verifyShortCode-title-3 = Интернетро боз бо «{ -brand-mozilla }» кашф кунед
verifyShortCode-prompt-3 = Аз ин рамзи тасдиқкунанда истифода баред:
verifyShortCode-expiry-notice = Муҳлаташ пас аз 5 дақиқа ба анҷом мерасад.
