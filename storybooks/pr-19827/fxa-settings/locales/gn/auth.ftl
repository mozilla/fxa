## Non-email strings

session-verify-send-push-title-2 = ¿Eñepyrũ tembiapo { -product-mozilla-account } ndive?
session-verify-send-push-body-2 = Eikutu ápe roikuaa hag̃ua ndeha
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } ha’e ayvu rechajeyha { -brand-mozilla } mba’éva. Ijaravopáta 5 aravo’ípe.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Ayvu rechajeyha { -brand-mozilla } mba’e: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } ha’e ayvu guerujeyha { -brand-mozilla } mba’e. Ijaravopáta 5 aravo’ípe.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } ayvu: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } ha’e ayvu guerujeyha { -brand-mozilla } mba’e. Opáta 5 aravo’ípe.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } ayvu: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } ra’ãnga’i">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = { -brand-mozilla } Ñemigua Porureko
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Porureko Ñemigua
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } Mba’eporu reko
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } ra’ãnga’i">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } ra’ãnga’i">
subplat-automated-email = Kóva ñanduti veve ijeheguíva. Og̃uahẽrõ ko ñanduti veve jejavýpe, ehejareínte.
subplat-privacy-notice = Marandu’i ñemiguáva
subplat-privacy-plaintext = Ñemigua porureko:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Og̃uahẽ ko ñanduti veve { $email } ereko rupi { -product-mozilla-account } ha eñemboheraguapy { $productName } peg̃uarã.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Og̃uahẽ ndéve ko ñanduti veve { $email } oreko rupi { -product-mozilla-account }.
subplat-explainer-multiple-2 = Og̃uahẽ ko ñanduti veve { $email } eguereko rupi { -product-mozilla-account } mba’ete ha eñemboheraguapýre heta apopyrépe.
subplat-explainer-was-deleted-2 = Og̃uahẽ ndéve ko ñanduti veve { $email } oñemboheraguapy rupi { -product-mozilla-account }.
subplat-manage-account-2 = Eñangareko nde { -product-mozilla-account } mba’ete ñemoĩporãre eikévo nde <a data-l10n-name="subplat-account-page">mba’ete kuatiaroguépe</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Eñangareko { -product-mozilla-account } ñangarekóre eikévo ne mba’ete kuatiaroguépe: { $accountSettingsUrl }
subplat-terms-policy = Ñemboguata ha jeheja porureko
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Ñemboheraguapy jeheja
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Emyandyjey mboheraguapy
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Embohekopyahu marandu kuatiañemugua
subplat-privacy-policy = { -brand-mozilla } Ñemigua Porureko
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Porureko Ñemigua
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } Mba’eporu reko
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Añete
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Ñemigua
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Oñemboguérõ ne mba’ete, og̃uahẽta gueteri ñanduti veve Mozilla Corporation ha Mozilla Foundation-gui, ndete <a data-l10n-name="unsubscribeLink"> ndereipe’áirõ ñemboheraguapy</a>.
account-deletion-info-block-support = Eporanduséramo térã eikotevẽramo ñepytyvõ, eñe’ẽ ore <a data-l10n-name="supportLink">aty pytyvõha ndive</a>.
account-deletion-info-block-communications-plaintext = Oñemboguérõ ne mba’ete, og̃uahẽta gueteri ñanduti veve Mozilla Corporation ha Mozilla Foundation guive, ndete ndereipe’áirõ ne ñemboheraguapy:
account-deletion-info-block-support-plaintext = Eporanduse térã eikotevẽramo ñepytyvõ, eñe’ẽ ore aty ñepytyvõha ndive:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Emboguejy { $productName } { -google-play }"> rupive
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Emboguejy { $productName } { -app-store }"> rupive
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Emohenda { $productName } <a data-l10n-name="anotherDeviceLink">ambue mba’e’oka mesa ariguápe</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Emohenda { $productName } <a data-l10n-name="anotherDeviceLink">ambue mba’e’okápe</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Ereko { $productName } Google Play rupive:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Emboguejy { $productName } App Store guive:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Emohenda { $productName } ambue mba’e’okápe:
automated-email-change-2 = Nandéiramo ejapo, <a data-l10n-name="passwordChangeLink">emoambue ne ñe’ẽñemi</a> pya’eporã.
automated-email-support = Eñemomaranduve hag̃ua, eike <a data-l10n-name="supportLink">{ -brand-mozilla } Pytyvõha</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Nandéiramo ejapo, emoambue ne ñe’ẽñemi pya’e:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Eikuaave hag̃ua, eike { -brand-mozilla } pytyvõme:
automated-email-inactive-account = Kóva ha’e peteĩ ñanduti veve ijeheguíva. Rehupyty kóva reguerekógui { -product-mozilla-account } mba’ete ha ohasáma 2 ary reike pahahague guive.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Eñemomaranduve hag̃ua, eike <a data-l10n-name="supportLink">{ -brand-mozilla } Pytyvõme</a>.
automated-email-no-action-plaintext = Kóva ha’e peteĩ ñanduti veve hekojeheguíva. Og̃uahẽrei rire ndéve, anínte ejapo mba’eve.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Kóva ha’e peteĩ ñanduti veve hekojeheguíva; neremoneĩriramo ko mba’e, emoambue ne ñe’ẽñemi:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Ko mba’ejerure ou { $uaBrowser }-gui { $uaOS } { $uaOSVersion }-pe.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Ko mba’ejerure ou { $uaBrowser }-gui { $uaOS }-pe.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Ko mba’ejerure ou { $uaBrowser }-gui.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Ko mba’ejerure ou { $uaOS } { $uaOSVersion }-gui.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Ko mba’ejerure ou { $uaOS }-gui.
automatedEmailRecoveryKey-delete-key-change-pwd = Nandéiramo, <a data-l10n-name="revokeAccountRecoveryLink">embogue ne mba’eñemi pyahu</a> ha <a data-l10n-name="passwordChangeLink">emoambue ne ñe’ẽñemi</a>
automatedEmailRecoveryKey-change-pwd-only = ¿Nandéiramo? <a data-l10n-name="passwordChangeLink">Emoambue ne ñe’ẽñemi</a>.
automatedEmailRecoveryKey-more-info = Eñemomaranduve hag̃ua, eike <a data-l10n-name="supportLink">{ -brand-mozilla } Pytyvõhápe</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Ko mba’ejerure ou:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Nandéiramo, embogue mba’eñemi pyahu:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Nandéiramo, emoambue ne ñe’ẽñemi:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = ha emoambue ne ñe’ẽñemi:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Eikuaave hag̃ua, eike { -brand-mozilla } pytyvõme:
automated-email-reset =
    Kóva ha’e ñandutiveve ijeheguíva; neremomeĩriramo, upéicharamo <a data-l10n-name="resetLink">emoambue ne ñe’ẽñemi</a>.
    Eñemomaranduve hag̃ua, ikatúpa eikemi <a data-l10n-name="supportLink">{ -brand-mozilla } oipytyvõva</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Neremoneĩriramo ko jeku’e, embojevyjey ne ñe’ẽñemi ko’ag̃aite { $resetLink } ndive
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Nderejapóiramo ko tembiapo, <a data-l10n-name="resetLink">emoĩjey ne ñe’ẽñemi</a> ha <a data-l10n-name="twoFactorSettingsLink">ñemoneĩrã mokõi jeku’egua</a> pya’eterei.
    Ojeikuaave hag̃ua, ehesakutu <a data-l10n-name="supportLink">{ -brand-mozilla } pytyvõha</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Nandéiramo ejapo ko jeku’e, emoambue ne ñe’ẽñemi ko’ag̃aite amo guive:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Avei, erujey ñemoneĩha mokõi jeku’egua amo guive:
brand-banner-message = ¿Eikuaa romoambueha ore réra { -product-firefox-accounts } ko’ág̃a { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Eikuaave</a>
cancellationSurvey = Orepytyvõna romoĩporãvévo mba’eporu ejapóvo ko <a data-l10n-name="cancellationSurveyUrl">ñeporandu mbykymi</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Orepytyvõ romoĩporãvévo ore mba’eporurã rojapóvo ko ñeporandu:
change-password-plaintext = Eimo’ãramo oĩ oikeséva ne mba’etépe, emoambueva’erã ne ñe’ẽñemi.
manage-account = Mba’ete ñangareko
manage-account-plaintext = { manage-account }:
payment-details = Mba’éicha ehepyme’ẽta:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Ñemuhague papapy: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Hepyme’ẽmbyre: { $invoiceTotal } { $invoiceDateOnly } rehegua
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Ñemuhague oútava: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Jehepyme’ẽ rape:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Jehepyme’ẽ rape: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Jehepyme’ẽ rape: { $cardName } opáva { $lastFour }-pe
payment-provider-card-ending-in-plaintext = Jehepyme’ẽ rape: Kuatia’atã opáva { $lastFour }-pe
payment-provider-card-ending-in = <b>Jehepyme’ẽ rape:</b> Kuatia’atã opáva { $lastFour }-pe
payment-provider-card-ending-in-card-name = <b> Jehepyme’ẽ rape:</b> { $cardName } opáva { $lastFour }-pe
subscription-charges-invoice-summary = Ñemuhague mombykypy

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Ñemuhague papapy:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Ñemuhague papapy: { $invoiceNumber }
subscription-charges-invoice-date = <b>Arange:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Arange: { $invoiceDateOnly }
subscription-charges-prorated-price = Tepy mboja’opyre
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Tepy mboja’opyre: { $remainingAmountTotal }
subscription-charges-list-price = Tysýi repy
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Tysýi repy: { $offeringPrice }
subscription-charges-credit-from-unused-time = Virume’ẽ aravo eiporu’ỹvare
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Virume’ẽ aravo eiporu’ỹvare: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Oĩmba’ỹva</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Oĩmba’ỹva: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Tepykue mboguejy
subscription-charges-one-time-discount-plaintext = Tepykue mboguejy: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration } tepyguejy jasygua
       *[other] { $discountDuration } tepyguejy jasygua
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
       *[other] { $discountDuration } Tepykue mboguejy: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Tepyguejy
subscription-charges-discount-plaintext = Tepyguejy: { $invoiceDiscountAmount }
subscription-charges-taxes = Impuesto ha tarifa
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Impuesto ha tarifa: { $invoiceTaxAmount }
subscription-charges-total = <b>Oĩmba</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Oĩmba: { $invoiceTotal }
subscription-charges-credit-applied = Virume’ẽmbyre
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Virume’ẽmbyre: { $creditApplied }
subscription-charges-amount-paid = <b>Mboýpa ehepyme’ẽ</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Mboýpa ehepyme’ẽ: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Og̃uahẽ ndéve peteĩ crédito ne mba’ete { $creditReceived }-guápe, oñemboguapýtava kuatiañemure oútavape.

##

subscriptionSupport = ¿Porandu ne mboheraguapy rehegua? Ore <a data-l10n-name="subscriptionSupportUrl">aty pytyvõha</a> oĩ ápe nepytyvõ hag̃ua.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = ¿Porandu ne ñemboheraguapýre? Ore aty pytyvõha oĩ ápe nepytyvõ hag̃ua:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Aguyje eñemboheraguapýre { $productName } ndive. Eporanduséramo ne ñemboheraguapýre térã eikotevẽve marandu { $productName } rehegua, ikatúpa <a data-l10n-name="subscriptionSupportUrl">eñe’ẽmi orendive</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Aguyje eñemboheraguapýre { $productName } ndive. Eporanduséramo ne ñemboheraguapýre térã eikotevẽve marandu { $productName } rehegua, ikatúpa eñe’ẽmi orendive:
subscription-support-get-help = Eñepytyvõta ne mboheraguapy ndive
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Eñangareko ne ñemboheraguapy:</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Eñangareko ne ñemboheraguapy:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Eñe’ẽ pytyvõha ndive</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Eñe’ẽ pytyvõha aty ndive:
subscriptionUpdateBillingEnsure = Eikuaáta mba’éichapa ehepyme’ẽta ha pe marandu ne mba’ete rehegua hekopyahúma <a data-l10n-name="updateBillingUrl">ápe</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Eikuaáta mba’éichapa ehepyme’ẽta ha pe marandu ne mba’ete rehegua hekopyahúma ápe:
subscriptionUpdateBillingTry = Rohechajeýta nde jehepyme’ẽ tenondeve, hákatu oikotevẽkuaa ore pytyvõ oĩporã hag̃ua <a data-l10n-name="updateBillingUrl">embohekopyahúvo nde jehepyme’ẽ marandu</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Rohechajeýta nde jehepyme’ẽ tenondeve, hákatu oikotevẽkuaa ore pytyvõ oĩporã hag̃ua embohekopyahúvo nde jehepyme’ẽ marandu:
subscriptionUpdatePayment = Emboykekuaa hag̃ua pe mba’eporu ñekytĩ, ikatúpiko <a data-l10n-name="updateBillingUrl">embohekopyahumi ne marandu tepyme’ẽguáva</a> pya’e porã.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Emboykekuaa hag̃ua pe mba’eporu ñekytĩ, ikatúpiko embohekopyahumi ne marandu tepyme’ẽguáva pya’e porã:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Eñemomaranduve hag̃ua, eike <a data-l10n-name="supportLink">{ -brand-mozilla } Pytyvõhápe</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Eñemomaranduve hag̃ua eike { -brand-mozilla } Pytyvõhápe: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } { $uaOS } { $uaOSVersion }-pe
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } { $uaOS }-pe
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (kuaaporã’ỹva)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (kuaaporã’ỹva)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (kuaaporã’ỹva)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (kuaaporã’ỹva)
view-invoice-link-action = Ehecha kuatiañemure
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ehecha ñemuhague: { $invoiceLink }
cadReminderFirst-subject-1 = ¡Mandu’arã! Ñambojuehe { -brand-firefox }
cadReminderFirst-action = Embojuehe ambue mba’e’oka
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Tekotevẽ mokõi ojuehe hag̃ua
cadReminderFirst-description-v2 = Egueraha ne rendayke ne mba’e’okuéra rupive. Eraha techaukaha, ñe’ẽñemi ha ambue mba’ekuaarã eiporuhápe { -brand-firefox }.
cadReminderSecond-subject-2 = ¡Ani rejavy! Ñambohekopántema ne ñembojuehe
cadReminderSecond-action = Embojuehe ambue mba’e’oka
cadReminderSecond-title-2 = ¡Ani nderesarái ñembojuehégui!
cadReminderSecond-description-sync = Embojoaju ne kundaha, ñe’ẽñemi, vore ojepe’áva ha hetave mba’e — tembiporu’i rupi eiporuhápe { -brand-firefox }.
cadReminderSecond-description-plus = Avei, ne marandu akóinte oñemboheko. Nde ha umi tembiporu reguerohorýva añoite ikatu rehecha umíva.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = ¡Eg̃uahẽporãite { $productName }-pe!
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = ¡Eg̃uahẽporãite { $productName }-pe!
downloadSubscription-content-2 = Ñañepyrũkatu jaiporu opaite tembiapoite oikéva ne ñemboheraguapýpe:
downloadSubscription-link-action-2 = Jeguata Ñepyrũ
fraudulentAccountDeletion-subject-2 = Nde { -product-mozilla-account } oñemboguéma
fraudulentAccountDeletion-title = Ne mba’ete oñemboguéma
fraudulentAccountDeletion-content-part1-v2 = Oñemoheñoiramoite { -product-mozilla-account } ha orekóta ñemboheraguapy ñanduti veve kundaharape ndive. Rojapoháicha mba’ete pyahu ndive, rojerure ndéve emoneĩ hag̃ua mba’ete emboajévo ñepyrũrã ñanduti veve kundaharape.
fraudulentAccountDeletion-content-part2-v2 = Ko’ag̃aite, rohecha pe mba’e noñemboajeihague. Kóva ndojejapói haguére, ndoroikuaaporãi ha’épa ñemboheraguapy moneĩmbyrépa. Ha upéicha rupi, { -product-mozilla-account } oñemboheraguapýva ko ñanduti veve kundaharapépe oñemboguéma ha ne ñemboheraguapy ojejokóma opaite mba’e heseguáva reheve.
fraudulentAccountDeletion-contact = Eporanduséramo, eñe’ẽ ore <a data-l10n-name="mozillaSupportUrl">aty pytyvõha ndive</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Eporanduséramo, eñe’ẽ ore aty pytyvõha ndive: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Eguerekosevéramo nde { -product-mozilla-account }
inactiveAccountFinalWarning-title = Ne mba’ete { -brand-mozilla } ha imba’ekuaarãnguéra oguéma
inactiveAccountFinalWarning-preview = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete
inactiveAccountFinalWarning-account-description = Nde { -product-mozilla-account } ojeporu ojeike hag̃ua apopyre ñemi reigua ha ñeikundaha ikatúva { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } ha { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Pe <strong>{ $deletionDate }</strong>, ne mba’ete ha ne mba’ekuaarã teéva oñemboguéta tapiarãicha reikéi mba’éramo ndete.
inactiveAccountFinalWarning-action = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete:
inactiveAccountFirstWarning-subject = Aníke ehundi ne mba’ete
inactiveAccountFirstWarning-title = ¿Ereko aresépa ne mba’ete { -brand-mozilla } ha imba’ekuaarãnguéra?
inactiveAccountFirstWarning-account-description-v2 = Nde { -product-mozilla-account } ojeporu ojeike hag̃ua apopyre ñemi reigua ha ñeikundaha ikatúva { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } ha { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Rohecha ndereikeveihague 2 arýma.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Ne mba’ete ha ne mba’ekuaarã teéva oñemboguéta tapiarãicha <strong>{ $deletionDate }</strong> sa’i eiporu rehe.
inactiveAccountFirstWarning-action = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete
inactiveAccountFirstWarning-preview = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete:
inactiveAccountSecondWarning-subject = Jeku’e tekotevẽva: mba’ete ñembogue 7 árape
inactiveAccountSecondWarning-title = Ne mba’ete { -brand-mozilla } ha imba’ekuaarãnguéra oguétama 7 arahápe
inactiveAccountSecondWarning-account-description-v2 = Nde { -product-mozilla-account } ojeporu ojeike hag̃ua apopyre ñemi reigua ha ñeikundaha ikatúva { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } ha { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Ne mba’ete ha ne mba’ekuaarã teéva oñemboguéta tapiarãicha <strong>{ $deletionDate }</strong> sa’i eiporu rehe.
inactiveAccountSecondWarning-action = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete
inactiveAccountSecondWarning-preview = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Eñepyrũ tembiapo ereko are hag̃ua ne mba’ete:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Ndereguerekovéima auvu ñemoneĩ jeykekoha
codes-reminder-title-one = Reime pe auvu ñemoneĩ jeykeko pahávape
codes-reminder-title-two = Emoheñóimake hetave ayvu ñemoneĩrã jeykekoha
codes-reminder-description-part-one = Umi ayvu ñemoneĩ jeykekoha nepytyvõta erujey hag̃ua marandu nderesaráirõ ne ñe’ẽñemi.
codes-reminder-description-part-two = Emoheñói ayvu pyahu ko’ág̃a ani hag̃ua okañy ne mba’ekuaarã.
codes-reminder-description-two-left = Opytántema mokõi ayvu.
codes-reminder-description-create-codes = Emoheñói ayvu ñemoneĩrã jeykekoha pyahu ne pytyvõta eikekuaa hag̃ua ne mba’etépe ojejokóramo.
lowRecoveryCodes-action-2 = Emoheñói ayvu
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Ndopytái ayvu ñemoneĩ jeykekoha
        [one] Opyta 1 ayvu ñemoneĩ jeykekoha
       *[other] Opyta { $numberRemaining } ayvu ñemoneĩ jeykekoha
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Tembiapo ñepyrũ pyahu { $clientName }-pe
newDeviceLogin-subjectForMozillaAccount = ¿Eñepyrũjey tembiapo { -product-mozilla-account } ndive?
newDeviceLogin-title-3 = Nde { -product-mozilla-account } ojeporu tembiapo ñepyrũrã
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = ¿Nandéipa? <a data-l10n-name="passwordChangeLink">Emoambue ne ñe’ẽñemi</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = ¿Nandéipa? Emoambue ne ñe’ẽñemi:
newDeviceLogin-action = Mba’ete ñangareko
passwordChanged-subject = Ñe’ẽñemi hekopyahúva
passwordChanged-title = Emoambue hekoitépe ñe’ẽñemi
passwordChanged-description-2 = Oñemoambue hekoitépe nde { -product-mozilla-account } ñe’ẽñemi peteĩva mba’e’oka guive:
passwordChangeRequired-subject = Tembiapo ivaikuaáva jehechapyre
passwordChangeRequired-preview = Emoambue ne ñe’ẽñemi pya’eterei
passwordChangeRequired-title-2 = Eguerujey ne ñe’ẽñemi
passwordChangeRequired-suspicious-activity-3 = Rojoko ne mba’ete roñangareko hag̃ua hese mba’evaígui. Resẽma tembiapógui opaite mba’e’okapeguágui, ha umi mba’ekuaarã oñemboguétama ani oiko mba’evai tenondeve.
passwordChangeRequired-sign-in-3 = Eike jey hag̃ua ne mba’etépe, pe ejapova’erã ha’e ne ñe’ẽñemi jeguerujey.
passwordChangeRequired-different-password-2 = <b>Mba’eporã:</b> Eiporavo peteĩ ñe’ẽñemi hekorosãva iñambuéva pe eiporuva’ekuégui ymave.
passwordChangeRequired-different-password-plaintext-2 = Mba’eporã: Eiporavo peteĩ ñe’ẽñemi hekorosãva iñambuéva pe eiporuva’ekuégui ymave.
passwordChangeRequired-action = Erujey ñe’ẽñemi
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Eiporu { $code } emoambue hag̃ua ñe’ẽñemi
password-forgot-otp-preview = Ko ayvu ndoikovéitama 10 aravo’ípe
password-forgot-otp-title = Nderesaráipa ñe’ẽñemi
password-forgot-otp-request = Og̃uahẽ oréve jerure ñe’ẽñemi moambuerã nde { -product-mozilla-account } rehegua:
password-forgot-otp-code-2 = Ndetéramo voi, kóva nde ayvu ñemoneĩrã eku’ekuaa jey hag̃ua:
password-forgot-otp-expiry-notice = Ko ayvu ndoikovéitama 10 aravo’ípe.
passwordReset-subject-2 = Oikojeýma ne ñe’ẽñemi
passwordReset-title-2 = Oikojeýma ne ñe’ẽñemi
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Egueru jey ne ñe’ẽñemi { -product-mozilla-account } pegua amo:
passwordResetAccountRecovery-subject-2 = Oikojeýma ne ñe’ẽñemi
passwordResetAccountRecovery-title-3 = Oikojeýma ne ñe’ẽñemi
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Eiporu mba’ete ayvu jeguerujeyrã embojevy hag̃ua ne ñe’ẽñemi { -product-mozilla-account } amo:
passwordResetAccountRecovery-information = Romboty reikeha opaite ne mba’e’oka ojuehévape. Romoheñói mba’ete ñe’ẽñemi guerujeyrã emyengovia hag̃ua eiporuva’ekue. Emoambuekuaa ne mba’ete mbohekohápe.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Romboty reikeha opaite ne mba’e’oka ojuehévape. Romoheñói mba’ete ñe’ẽñemi guerujeyrã emyengovia hag̃ua eiporuva’ekue. Emoambuekuaa ne mba’ete mbohekohápe:
passwordResetAccountRecovery-action-4 = Mba’ete ñangareko
passwordResetRecoveryPhone-subject = Pumbyry guerujeyrã porupyry
passwordResetRecoveryPhone-preview = Ehechauka ndeteha eikéva
passwordResetRecoveryPhone-title = Ne pumbyry guerujeyrã ojeporu ñemoneĩrã ñe’ẽñemi moĩporãrã
passwordResetRecoveryPhone-device = Pumbyry guerujeyrã ojeporúva amo guive:
passwordResetRecoveryPhone-action = Mba’ete ñangarekoha
passwordResetWithRecoveryKeyPrompt-subject = Oikojeýma ne ñe’ẽñemi
passwordResetWithRecoveryKeyPrompt-title = Oikojeýma ne ñe’ẽñemi
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Egueru jey ne ñe’ẽñemi { -product-mozilla-account } pegua amo:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Emoheñói mba’ete mba’eñemi guerujeyrã
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Emoheñói mba’ete mba’eñemi gueru jeyrã
passwordResetWithRecoveryKeyPrompt-cta-description = Eikejeyva’erã opaite mba’e’oka ñembojoajupyrépe. Ereko ne ayvukuéra tekorosãme mba’ete ñe’ẽñemi guerujeyrã ndive. Kóva omoneĩta erujey hag̃ua ne mba’ekuaarã nde resaráirõ ne ñe’ẽñemígui.
postAddAccountRecovery-subject-3 = Mba’eñemi pyahu mba’ete guerujeyrã heñóima
postAddAccountRecovery-title2 = Emoheñói mba’eñemi jeguerujeyrã pyahu
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Eñongatu mba’eñemi tenda hekorosãvape; eikotevẽta eguerujey hag̃ua mba’ekuaarã ipapapýva nderesaráirõ ñe’ẽñemígui.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Ko mba’eñemi eiporukuaa peteĩjeýnte. Eiporupa rire, rojapóta ipyahuetévava. Térã emoheñoikuaa ipyahúva ejapose vovénte ne mba’ete ñemboheko guive.
postAddAccountRecovery-action = Mba’ete ñangareko
postAddLinkedAccount-subject-2 = ¿Eñepyrũ tembiapo { -product-mozilla-account } ndive?
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Ne mba’ete { $providerName } pegua ojuajúma nde { -product-mozilla-account } rehe
postAddLinkedAccount-action = Eñangareko mba’etére
postAddRecoveryPhone-subject = Pumbyry guerujeyrã mbojuajupyre
postAddRecoveryPhone-preview = Mba’ete oñemo’ãva ñemoneĩ mokõi jeku’egua rupive
postAddRecoveryPhone-title-v2 = Embojuaju pumbyry papapy guerujeyrã
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Embojuaju { $maskedLastFourPhoneNumber } ne pumbyry papapy guerujeyrã
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Mba’éicha omo’ãta ne mba’ete
postAddRecoveryPhone-how-protect-plaintext = Mba’éicha omo’ãta ne mba’ete:
postAddRecoveryPhone-enabled-device = Embojuruja upe guive:
postAddRecoveryPhone-action = Mba’ete ñangareko
postAddTwoStepAuthentication-preview = Ne mba’ete oñemo’ãma
postAddTwoStepAuthentication-subject-v3 = Ñemoneĩ mokõi jeku’egua hendýma
postAddTwoStepAuthentication-title-2 = Embojuruja ñemoneĩ mokõi jeku’egua
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Nde ejerure kóva chupe:
postAddTwoStepAuthentication-action = Mba’ete ñangareko
postAddTwoStepAuthentication-code-required-v4 = Ko’ág̃a ojejeruréta ne rembiporu’i ayvu rekorosã ñemoneĩrã eñepyrũ jeývo tembiapo.
postAddTwoStepAuthentication-recovery-method-codes = Embojuaju avei ayvukuéra ñemoneĩrã jeykekogua erukua jey hag̃ua.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Embojuaju avei { $maskedPhoneNumber } ne pumbyry papapy guerujeyrãrõ.
postAddTwoStepAuthentication-how-protects-link = Mba’éicha omo’ãta ne mba’ete
postAddTwoStepAuthentication-how-protects-plaintext = Mba’éicha omo’ãta ne mba’ete:
postChangeAccountRecovery-subject = Mba’eñemi guerujeyrã oñemoambuéma
postChangeAccountRecovery-title = Emoambue ne mba’ete mba’eñemi guerujeyrã
postChangeAccountRecovery-body-part1 = Eguerekóma mba’ete mba’eñemi guerujeyrã pyahu. Oguéma pe mba’eñemi tuja.
postChangeAccountRecovery-body-part2 = Eñongatu mba’eñemi pyahu tenda hekorosãvape; eikotevẽta eguerujey hag̃ua mba’ekuaarã ipapapýva nderesaráirõ ñe’ẽñemígui.
postChangeAccountRecovery-action = Mba’ete ñangareko
postChangePrimary-subject = Ñanduti veve tuichavéva hekopyahúva
postChangePrimary-title = Ñandutiveve pyahu mba’eguasuvéva
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Emoambue hekopete ne ñandutiveve eiporuvéva { $email }. Ko kundaharape ha’e nde poruhára réra eñepyrũ hag̃ua tembiapo nde { -product-mozilla-account }-pe og̃uahẽkuaa hag̃ua marandu’i tekorosã ha ñemoneĩ tembiapo ñepyrũ rehegua.
postChangePrimary-action = Mba’ete ñangareko
postChangeRecoveryPhone-subject = Pumbyry guerujeyrã ag̃agua
postChangeRecoveryPhone-preview = Mba’ete oñemo’ãva ñemoneĩ mokõi jeku’eguápe
postChangeRecoveryPhone-title = Emoambue pumbyry jeguerujeyrã
postChangeRecoveryPhone-description = Eguerekóma pumbyry guerujeyrã pyahu. Oguetéma pe pumbyry papapy.
postChangeRecoveryPhone-requested-device = Ejerure upe guive:
postChangeTwoStepAuthentication-preview = Ne mba’ete oñemo’ãma
postChangeTwoStepAuthentication-subject = Ndoikói ñemoneĩ mokõi jeku’egua
postChangeTwoStepAuthentication-title = Oñembohekopyahúma ñemoneĩ mokõi jeku’egua
postChangeTwoStepAuthentication-use-new-account = Ko’ág̃a eipuruva’erã { -product-mozilla-account } jeike pyahu ne rembiporu’i ñemoneĩmbyrépe. Pe itujavéva ndoikomo’ãvéitama ha ikatu embogue.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Nde ejerure kóva chupe:
postChangeTwoStepAuthentication-action = Mba’ete ñangareko
postChangeTwoStepAuthentication-how-protects-link = Mba’éicha omo’ãta ne mba’ete
postChangeTwoStepAuthentication-how-protects-plaintext = Mba’éicha omo’ãta ne mba’ete:
postConsumeRecoveryCode-title-3 = Nde ayvu ñemoneĩrã jeykekoha ojeporu oñemoneĩ hag̃ua ñe’ẽñemi moĩporãrã
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Ayvu ojeporúva amógui:
postConsumeRecoveryCode-action = Mba’ete ñangareko
postConsumeRecoveryCode-subject-v3 = Ayvu ñemoneĩrã jeykekoha porupyre
postConsumeRecoveryCode-preview = Ehechajey ndeteha pe eikeva’ekue
postNewRecoveryCodes-subject-2 = Ayvu ñemoneĩrã pyahu jeykekoha moheñoimbyre
postNewRecoveryCodes-title-2 = Emoheñói ayvu ñemoneĩrã pyahu jeykekoha
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Oñemoheñói amo:
postNewRecoveryCodes-action = Mba’ete ñangareko
postRemoveAccountRecovery-subject-2 = Oñemoheñói mba’eñemi jeguerujeyrã:
postRemoveAccountRecovery-title-3 = Emboguéma ne mba’ete mba’eñemi guerujeyrã
postRemoveAccountRecovery-body-part1 = Eikotevẽ mba’ete guerujeyrã mba’eñemi emyatyrõ hag̃ua ñeikundaha mba’ekuaarã ipapapýva nderesaráirõ ñe’ẽñemígui.
postRemoveAccountRecovery-body-part2 = Nderejapóirõ gueteri, emoheñói mba’ete mba’eñemi guerujeyrã pyahu ne mba’ete ñembohekópe ani hag̃ua okañy ñe’ẽñemi ñongatupyre, techaukaha, ñeikundaha rembiasakue ha hetave.
postRemoveAccountRecovery-action = Mba’ete ñangareko
postRemoveRecoveryPhone-subject = Pumbyry guerujeyrã mboguepyre
postRemoveRecoveryPhone-preview = Mba’ete oñemo’ãva ñemoneĩ mokõi jeku’eguápe
postRemoveRecoveryPhone-title = Pumbyry guerujeyrã mboguepyre
postRemoveRecoveryPhone-description-v2 = Ne pumbyry guerujeyha oñembogue nde ñemoneĩ ñembohekoha mokõi jeku’eguávagui.
postRemoveRecoveryPhone-description-extra = Eiporukuaa gueteri nde ayvukuéra ñemoneĩrã jeykekorã eike hag̃ua ndaikatúiramo eiporu ne rembiporu’i jeykekorãva.
postRemoveRecoveryPhone-requested-device = Ejerure chupe:
postRemoveSecondary-subject = Oguéma ñandutiveve mokõiguáva
postRemoveSecondary-title = Oguéma ñandutiveve mokõiguáva
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Emboguéma hekopete { $secondaryEmail } ñanduti veve mokõiguáva nde { -product-mozilla-account } pegua. Umi marandu’i tekorosãrãva ha ñemoneĩ tembiapo ñepyrũ rehegua nog̃uahẽmo’ãvéima ko kundaharapépe.
postRemoveSecondary-action = Mba’ete ñangareko
postRemoveTwoStepAuthentication-subject-line-2 = Ñemoneĩ mokõi jeygua myandypyre
postRemoveTwoStepAuthentication-title-2 = Oñembogue ñemoneĩ mokõi jeygua
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Oñembojuruja upe guive:
postRemoveTwoStepAuthentication-action = Mba’ete ñangareko
postRemoveTwoStepAuthentication-not-required-2 = Natekotevẽvéima ayvu rekorosãrã tembiporu’i emoñepyrũnguévo tembiapo.
postSigninRecoveryCode-subject = Ayvu ñemoneĩrã jeykekoha eiporúva emba’apo hag̃ua
postSigninRecoveryCode-preview = Emoneĩ pe mba’ete rembiapo
postSigninRecoveryCode-title = Ayvu ñemoneĩrã jeykekoha eiporúva emba’apo hag̃ua
postSigninRecoveryCode-description = Nderejapóiramo kóva, emoambue ne ñe’ẽñemi eguereko hag̃uáicha ne mba’ete tekorosãme.
postSigninRecoveryCode-device = Eñepyrũ tembiapo upe guive:
postSigninRecoveryCode-action = Mba’ete ñangareko
postSigninRecoveryPhone-subject = Pumbyry guerujeyrã eiporúva emba’apo hag̃ua
postSigninRecoveryPhone-preview = Emoneĩ pe mba’ete rembiapo
postSigninRecoveryPhone-title = Ojeporu ne pumbyry guerujeyrã oñemba’apo hag̃ua
postSigninRecoveryPhone-description = Nderejapóiramo kóva, emoambue ne ñe’ẽñemi eguereko hag̃uáicha ne mba’ete tekorosãme.
postSigninRecoveryPhone-device = Eñepyrũ tembiapo upe guive:
postSigninRecoveryPhone-action = Mba’ete ñangareko
postVerify-sub-title-3 = ¡Rovy’aiterei rohecha rehe!
postVerify-title-2 = ¿Ehechasépa tendayke mokõi mba’e’okápe?
postVerify-description-2 = ¡Ndahasýi! Emohenda { -brand-firefox } ambue mba’e’okápe ha eñepyrũ tembiapo embojuehe hag̃ua. ¡Ha’ete hasy’ỹva!
postVerify-sub-description = (Psst… he’ise avei erekokuaaha techaukaha, ñe’ẽñemi ha ambue mba’ekuaarã { -brand-firefox } guive emoñepyrũhápe tembiapo).
postVerify-subject-4 = ¡Eg̃uahẽporã { -brand-mozilla }-pe!
postVerify-setup-2 = Embojuaju ambue mba’e’oka:
postVerify-action-2 = Embojuaju ambue mba’e’oka
postVerifySecondary-subject = Ñanduti veve mokõiguáva mbojuajupyre
postVerifySecondary-title = Ñanduti veve mokõiguáva mbojuajupyre
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Emoneĩ hekopete { $secondaryEmail } ñanduti veve mokõihávarõ ne { -product-mozilla-account } pegua. Marandu’i tekorosã ha ñemoneĩrã tembiapo ñepyrũgua ko’ág̃a og̃uahẽta mokõivéva ñanduti veve kundaharapépe.
postVerifySecondary-action = Mba’ete ñangareko
recovery-subject = Embojevyjey ne ñe’ẽñemi
recovery-title-2 = ¿Nderesarái ñe’ẽñemígui?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Og̃uahẽ oréve jerure ñe’ẽñemi moambuerã nde { -product-mozilla-account }-pe:
recovery-new-password-button = Emoheñói ñe’ẽñemi pyahu eikutúvo amo votõ. Ko juajuha hekopáta peteĩ aravo rire.
recovery-copy-paste = Emoheñói ñe’ẽñemi pyahu embokuatia ha embojávo ko URL ne mohendahápe. Ko juajuha hekopaháta peteĩ aravo ohasa rire.
recovery-action = Emoheñói ñe’ẽñemi pyahu
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ojejokóma ne ñemboheraguapy { $productName } pegua
subscriptionAccountDeletion-title = Ambyasy eho haguére
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Embogueramoite nde { -product-mozilla-account }. Péva rupi, romboykéma ne ñemoheraguapy { $productName }. Ñe ñehepyme’ẽ ipaháva { $invoiceTotal } pegua oñehepyme’ẽvo { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Eg̃uahẽporã { $productName }-pe: Emboheko ne ñe’ẽñemi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = ¡Eg̃uahẽporã { $productName }-pe!
subscriptionAccountFinishSetup-content-processing = Pe jehepyme’ẽ oñemboajehína ha ohupytykuaa irundy ára oĩmba hag̃ua. Pe ñemboheraguapy hekopyahúta ijehegui ohasávo pe kuatiañemurã arapa’ũ ndete mba’e nderejokóiramo.
subscriptionAccountFinishSetup-content-create-3 = Eñepyrũjeývo emoheñói ñe’ẽñemi { -product-mozilla-account } eiporukuaa hag̃ua ne memboheraguapy.
subscriptionAccountFinishSetup-action-2 = Ñañepyrũ
subscriptionAccountReminderFirst-subject = Mandu’arã: Embohekopyahupa ne mba’ete
subscriptionAccountReminderFirst-title = Ndereikekuaái gueteri ne ñemboheraguapýpe
subscriptionAccountReminderFirst-content-info-3 = Nda’areiete emoheñoihague { -product-mozilla-account } hákatu araka’eve neremoneĩri. Roha’ãrõ embohekóvo ne mba’ete, péichamante eiporukuaa ne ñemboheraguapy pyahúpe.
subscriptionAccountReminderFirst-content-select-2 = Eiporavo “Ñe’ẽñemi moheñói” emboheko hag̃ua ñe’ẽñemi pyahu ha péicha emoneĩ ne mba’ete.
subscriptionAccountReminderFirst-action = Emoheñói ñe’ẽñemi
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Mandu’arã paha: Emboheko ne mba’ete
subscriptionAccountReminderSecond-title-2 = ¡Eg̃uahẽporã { -brand-mozilla }-pe!
subscriptionAccountReminderSecond-content-info-3 = Nda’areiete emoheñoihague { -product-mozilla-account } hákatu araka’eve neremoneĩri. Roha’ãrõ embohekóvo ne mba’ete, péichamante eiporukuaa ne ñemboheraguapy pyahúpe.
subscriptionAccountReminderSecond-content-select-2 = Eiporavo “Ñe’ẽñemi moheñói” emboheko hag̃ua ñe’ẽñemi pyahu ha péicha emoneĩ ne mba’ete.
subscriptionAccountReminderSecond-action = Emoheñói ñe’ẽñemi
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Ojejokóma ne ñemboheraguapy { $productName } pegua
subscriptionCancellation-title = Ambyasy eho haguére

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Roipe’a ndereraguapy { $productName }-gui. Ne ñehepyme’ẽ paha { $invoiceTotal } rehegua oñehepyme’ẽma { $invoiceDateOnly }
subscriptionCancellation-outstanding-content-2 = Roipe’a ndereraguapy { $productName }-gui. Ne ñehepyme’ẽ paha { $invoiceTotal } rehegua oñehepyme’ẽta ag̃a { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Ne mba’eporu ohóta opa peve kuatiañemure ko’ag̃aguáva, oikótava { $serviceLastActiveDateOnly } peve.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Eñemoambuéma { $productName }-pe
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Emoambuéma hekopete { $productNameOld } guive { $productName } peve.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Ne ñehepyme’ẽrã ipyahúvape, iñambuéta { $paymentAmountOld }-gui { $productPaymentCycleOld } rupive { $paymentAmountNew }-pe { $productPaymentCycleNew } rupi. Upe javete, avei oñeme’ẽta ndéve jeporurã ha’etéva { $paymentProrated } guive ohehechauka hag̃ua michĩveháicha pe hembýva ko { $productPaymentCycleOld } guive.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Emohendátarõ peteĩ tembiaporape ipyahúva eiporu hag̃ua { $productName }, og̃uahẽ ndéve ñanduti veve ha’eño’eño mba’eichaitépa emboguejýta.
subscriptionDowngrade-content-auto-renew = Ne ñemboheraguapy ipyahúta ijeheguiete ehepyme’ẽvo eiporuva’ekue neremoneĩriramo ndete voi.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Ojejokóma ne ñemboheraguapy { $productName } pegua
subscriptionFailedPaymentsCancellation-title = Ne ñemboheraguapy ojejokóma
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Romboykéma ne ñemboheraguapy { $productName } pegua ndoikói rupi heta jey jehepyme’ẽse rire. Eikekuaa jey hag̃ua, eñemboheraguapy pyahu jehepyme’ẽ hekopyahúva ndive.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName } tepyme’ẽ moneĩmbyre
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Aguyje eñemboheraguapýre { $productName }-pe
subscriptionFirstInvoice-content-processing = Rehepyme’ẽva oku’éma ko’ag̃aite ha ikatu imbeguemi ohupytykuaáva irundy ára oĩmbávo.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Og̃uahẽta ñanduti veve peteĩteĩ mba’éichapa eiporukuaáta { $productName }.
subscriptionFirstInvoice-content-auto-renew = Ne ñemboheraguapy ipyahúta ijeheguiete ehepyme’ẽvo eiporuva’ekue neremoneĩriramo ndete voi.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Nde kuatiañemure oútava osẽta { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Mba’éichapa ehepyme’ẽta { $productName }-pe g̃uarã ndoikói térã potaite
subscriptionPaymentExpired-title-2 = Nde jehepyme’ẽrã opáma térã ndoikovéi potaite
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Nde jehepyme’ẽrã eiporúva { $productName } rehegua opáma térã ndoikovéi potaite.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Jejavy ehepyme’ẽkuévo { $productName }
subscriptionPaymentFailed-title = Rombyasy, roguereko apañuái ne ñehepyme’ẽme
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Rorekókuri apañuái ne ñehepyme’ẽ paha { $productName } peguápe.
subscriptionPaymentFailed-content-outdated-1 = Ikatuhína pe nde jehepyme’ẽrã ndoikovéima térã pe ehepyme’ẽha ko’ag̃aguáva ndahekopyahúi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Marandu tepyme’ẽgua rekopyahu oikotevẽva { $productName }.
subscriptionPaymentProviderCancelled-title = Rombyasy, roguereko apañuái ne ñehepyme’ẽ rekópe
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Roguerekókuri apañuái ne ñehepyme’ẽ reko { $productName } peguápe.
subscriptionPaymentProviderCancelled-content-reason-1 = Ikatuhína pe nde jehepyme’ẽrã ndoikovéima térã pe ehepyme’ẽha ko’ag̃aguáva ndahekopyahúi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Mboheraguapy { $productName } hendyjeýma
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ¡Aguyje emyandyjeýre ne mboheraguapy { $productName }-pe!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Nde ñemuhague ha jehepyme’ẽ opytáta péichante. Pe oútaba ha’éta { $invoiceTotal } { $nextInvoiceDateOnly }-pe. Ne ñemboheraguapy hekopyahúta ijehegui ohasa pukumívo ára ñemuhague rehegua ndete nderejokóiramo.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } marandu’i ñembopyahu ijeheguíva
subscriptionRenewalReminder-title = Ne ñemboheraguapy ipyahúta sapy’aitépe
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Ñemuhára { $productName } pegua,
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Ne ñemboheraguapy ag̃aguáva oñembohekóma hekopyahu hag̃ua ijeheguite { $reminderLength } ára vove. Upe jave, { -brand-mozilla } ombopyahúta ne ñemboheraguapy { $planIntervalCount } { $planInterval } pegua ha ehepyme’ẽta { $invoiceTotal }-pe ejapótava ne mba’ete ndive.
subscriptionRenewalReminder-content-closing = Ma’ẽag̃uíme,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = { $productName } atyguáva
subscriptionReplaced-subject = Ne ñemboheraguapy hekopyahu nembohekopyahu reheguávaramo
subscriptionReplaced-title = Ne ñemboheraguapy oñembohekopyahu
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Ne ñembokuatia peteĩteĩva { $productName } rehegua oñemyengovia ha ko’ág̃a oike ne mba’e’oka pyahúpe.
subscriptionReplaced-content-credit = Rehupytýta peteĩ crédito oimeraẽ aravo ndojeporúiva rehe ne ñembokuatia ymavévape. Ko crédito ojejapóta ijeheguiete nde mba’etépe ha ojeporúta umi oútavape g̃uarã.
subscriptionReplaced-content-no-action = Noikotevẽi mba’evete ndehegui.
subscriptionsPaymentExpired-subject-2 = Nde jehepyme’ẽrã ne mboheraguapýpe g̃uarã ndokovéitama térã potaite
subscriptionsPaymentExpired-title-2 = Nde ehepyme’ẽha opáma térã ndoikovéi potaite
subscriptionsPaymentExpired-content-2 = Nde jehepyme’ẽrã eiporúva ehepyme’ẽkuaa hag̃ua ko’ã ñemboheraguapy rehegua opáma térã ndoikovéi potaite.
subscriptionsPaymentProviderCancelled-subject = Marandu tepyme’ẽgua rekopyahu oikotevẽva { -brand-mozilla } mboheraguapýpe g̃uarã.
subscriptionsPaymentProviderCancelled-title = Rombyasy, roguereko apañuái ne ñehepyme’ẽ rekópe
subscriptionsPaymentProviderCancelled-content-detected = Rohechakuaa peteĩ apañuái ne ñehepyme’ẽ reko rehegua mboheraguapy tenondeve g̃uarãva.
subscriptionsPaymentProviderCancelled-content-payment-1 = Ikatuhína pe nde jehepyme’ẽrã ndoikovéima térã pe ehepyme’ẽha ko’ag̃aguáva ndahekopyahúi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Jehepyme’ẽ oúva { $productName }-gui
subscriptionSubsequentInvoice-title = ¡Aguyje ne mboheraguapýre!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Og̃uahẽma ne ñehepyme’ẽ paha { $productName } rupi.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Nde kuatiañemure oútava osẽta { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Embohekopyahúma { $productName }-pe
subscriptionUpgrade-title = ¡Aguyje embohekopyahúre!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Oñembohekopyahúma { $productName } hekopete.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Ehepyme’ẽma peteĩ jeýnte { $invoiceAmountDue } eikuaa hag̃ua ne ñemboheraguapy repykue hepyvéva ko kuatiañemure pukukue ryepýpe ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Rehupyty peteĩ crédito mba’ete rehegua { $paymentProrated } repykuépe.
subscriptionUpgrade-content-subscription-next-bill-change = Nde kuatiañemure tenondeguáva, ne ñemboheraguapy repy iñambuétama.
subscriptionUpgrade-content-old-price-day = Pe tása mboyveguáva ha’e { $paymentAmountOld } aragua.
subscriptionUpgrade-content-old-price-week = Pe tása mboyveguáva ha’e { $paymentAmountOld } arapokõindygua.
subscriptionUpgrade-content-old-price-month = Pe tása mboyveguáva ha’e { $paymentAmountOld } jasygua.
subscriptionUpgrade-content-old-price-halfyear = Pe tása mboyveguáva ha’e { $paymentAmountOld } poteĩ jasygua.
subscriptionUpgrade-content-old-price-year = Pe tása mboyveguáva ha’e { $paymentAmountOld } arygua.
subscriptionUpgrade-content-old-price-default = Pe tása mboyveguáva ha’e { $paymentAmountOld } kuatiañemure memegua’ỹva.
subscriptionUpgrade-content-old-price-day-tax = Pe tása mboyveguáva ha’e { $paymentAmountOld } + { $paymentTaxOld } jehepyme’ẽ aragua.
subscriptionUpgrade-content-old-price-week-tax = Pe tása mboyveguáva ha’e { $paymentAmountOld } + { $paymentTaxOld } jehepyme’ẽ arapokõindygua.
subscriptionUpgrade-content-old-price-month-tax = Pe tása mboyveguáva ha’e { $paymentAmountOld } + { $paymentTaxOld } jehepyme’ẽ jasygua.
subscriptionUpgrade-content-old-price-halfyear-tax = Pe tása mboyveguáva ha’e { $paymentAmountOld } + { $paymentTaxOld } jehepyme’ẽ poteĩ jasygua.
subscriptionUpgrade-content-old-price-year-tax = Pe tása mboyveguáva ha’e { $paymentAmountOld } + { $paymentTaxOld } jehepyme’ẽ arygua.
subscriptionUpgrade-content-old-price-default-tax = Pe tása mboyveguáva ha’e { $paymentAmountOld } + { $paymentTaxOld } kuatiañemure memegua’ỹva.
subscriptionUpgrade-content-new-price-day = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } peteĩ árape, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-week = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } arapokõindygua, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-month = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } jasygua, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-halfyear = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } poteĩ jasygua, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-year = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } aryguáva, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-default = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } ñemure mbokuatia pa’ũme, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-day-dtax = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } + { $paymentTaxNew } peteĩteĩ árape, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-week-tax = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } + { $paymentTaxNew } arapokõindygua, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-month-tax = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } + { $paymentTaxNew } jasygua, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-halfyear-tax = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } + { $paymentTaxNew } poteĩ jasygua, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-year-tax = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } + { $paymentTaxNew } aryguáva, oguejy’ỹre hepy.
subscriptionUpgrade-content-new-price-default-tax = Ko’águi tenondévo, oñehepyme’ẽta { $paymentAmountNew } + { $paymentTaxNew } ñemure mbokuatia pa’ũme, oguejy’ỹre hepy.
subscriptionUpgrade-existing = Oĩramo ne ñemboheraguapy ag̃agua okañy ko ñembohekopyahu ndive, roñangarekóta hese ha romondóta ndéve ñanduti veve umi mba’emimi reheve. Ne mba’epyahu orekórõ apopyre oikotevẽrõ ñemohenda, romondóta ndéve ñanduti veve orekóva mba’éichapa embohekóta.
subscriptionUpgrade-auto-renew = Ne ñemboheraguapy ipyahúta ijeheguiete ehepyme’ẽvo eiporuva’ekue neremoneĩriramo ndete voi.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Eiporu { $unblockCode } eike hag̃ua
unblockCode-preview = Ko ayvu opáta peteĩ aravópe
unblockCode-title = ¿Ndépa emoñepyrũve tembiapo?
unblockCode-prompt = Upéicharõ, ayvu jeguerujeyrã eikotevẽva ha’e kóva:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Upéicharõ, ayvu jeguerujeyrã reikotevẽva ha’e kóva: { $unblockCode }
unblockCode-report = Ndaupéichairõ, orepytyvõ romboyke hag̃ua tapicha ñaña <a data-l10n-name="reportSignInLink">oremomarandu</a>.
unblockCode-report-plaintext = Ndoikóirõ péicha, orepytyvõ romboyke hag̃ua hekovaíva ha oremomarandúna.
verificationReminderFinal-subject = Nemandu’áke emoneĩ hag̃ua ne mba’ete
verificationReminderFinal-description-2 = Mokõi arapokõindy emoheñoihague ko { -product-mozilla-account }, hákatu araka’eve neremoneĩri. Nde rekorosãrã, romboguéta ko mba’ete neremoneĩriramo 24 aravo mboyve.
confirm-account = Emoneĩjey mba’ete
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Nemandu’áke emoneĩ hag̃ua mba’ete
verificationReminderFirst-title-3 = ¡Eg̃uahẽporã { -brand-mozilla }-pe!
verificationReminderFirst-description-3 = Emoheñoiramoite { -product-mozilla-account }, hákatu neremoneĩri gueteri. Emoneĩ ne mba’ete 15 ára oútabape térã oñemboguéta ijeheguiete.
verificationReminderFirst-sub-description-3 = Aníke ejavy kundahára nemoĩva ndéve ha nde rekoñemíme tenondete.
confirm-email-2 = Emoneĩjey mba’ete
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Emoneĩjey mba’ete
verificationReminderSecond-subject-2 = Nemandu’áke emoneĩ hag̃ua mba’ete
verificationReminderSecond-title-3 = ¡Aníke ejavy { -brand-mozilla }!
verificationReminderSecond-description-4 = Emoheñoiramoite { -product-mozilla-account }, hákatu neremoneĩri gueteri. Emoneĩ ne mba’ete 15 ára oútabape térã oñemboguéta ijeheguiete.
verificationReminderSecond-second-description-3 = Nde { -product-mozilla-account } ombojuehekuaa nde rejapopyréva { -brand-firefox } ndive opaite mba’e’okápe ha oipe’áta okẽ { -brand-mozilla } apopyrépe omo’ãkuaa hag̃ua tekoñemi.
verificationReminderSecond-sub-description-2 = Eike ore rembipotápe emoambuekuaa hag̃ua ñanduti peteĩ tenda ijurujáva opavavépe g̃uarã.
verificationReminderSecond-action-2 = Emoneĩjey mba’ete
verify-title-3 = Embojuruja ñanduti { -brand-mozilla } ndive
verify-description-2 = Emoneĩ ne mba’ete ha eiporuporã { -brand-mozilla } eike eikehápe eñepyrũvo amo:
verify-subject = Emoheñoimava’erã mba’ete
verify-action-2 = Emoneĩjey mba’ete
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Eiporu -{ $code } emoambue hag̃ua ne mba’ete
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ko ayvu hu’ãta { $expirationTime } aravo’ípe.
       *[other] Ko ayvu hu’ãta { $expirationTime } aravo’ípe.
    }
verifyAccountChange-title = ¿Emoambuehína marandu ne mba’ete rehegua?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Orepytyvõ rorekóvo ne mba’ete tekorosãme emoneĩvo ko ambuepyre amo:
verifyAccountChange-prompt = Upéicharõ, eiporu ko ayvu ñemoneĩha:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Hu’ãta { $expirationTime } aravo’ípe.
       *[other] Hu’ãta { $expirationTime } aravo’ípe.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = ¿Emoñepyrũ tembiapo { $clientName }-pe?
verifyLogin-description-2 = Orepytyvõ rorekóvo ne mba’ete tekorosãme emoneĩvo tembiapo ñepyrũ amo:
verifyLogin-subject-2 = Emoneĩ tembiapo ñepyrũ
verifyLogin-action = Tembiapo ñepyrũ ñemoneĩ
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Eiporu { $code } eike hag̃ua
verifyLoginCode-preview = Ko ayvu ndoikovéitama 5 aravo’ípe.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = ¿Emoñepyrũ tembiapo { $serviceName } ndive?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Orepytyvõ rorekóvo ne mba’ete tekorosãme emoneĩvo tembiapo ñepyrũ amo:
verifyLoginCode-prompt-3 = Upéicharõ, eiporu ko ayvu ñemoneĩrã:
verifyLoginCode-expiry-notice = Ndoikovéima 5 aravo’ípe.
verifyPrimary-title-2 = Emoneĩ ñanduti veve eiporuvéva
verifyPrimary-description = Ojejerure oñemoambue hag̃ua mba’ete amo mba’e’oka guive:
verifyPrimary-subject = Emoneĩ ñanduti veve tuichavéva
verifyPrimary-action-2 = Ñanduti veve ñemoneĩ:
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Oñemoneĩvo, umi mba’ete ñemoambue ojuajukuaáva ñanduti veve mokõihávare ejapokuaa ko mba’e’oka guive.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Eiporu { $code } emoneĩ hag̃ua ne ñanduti veve mokõiháva
verifySecondaryCode-preview = Ko ayvu opaitétama 5 aravo’ípe.
verifySecondaryCode-title-2 = Emoneĩ ñandutiveve mokõiguáva
verifySecondaryCode-action-2 = Ñandutiveve ñemoneĩ
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Ojejerure ojeporu hag̃ua { $email } ñanduti veve mokõháva ambue { -product-mozilla-account } peg̃uarã:
verifySecondaryCode-prompt-2 = Eiporu ko ayvu rechajeyrã:
verifySecondaryCode-expiry-notice-2 = Opáta 5 aravo’ípe. Ojehechajey vove, ko kundaharapépe og̃uahẽta marandu’i tekorosã ha ñemoneĩ rehegua.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Eiporu { $code } emoneĩ hag̃ua ne mba’ete
verifyShortCode-preview-2 = Ko ayvu opaitétama 5 aravo’ípe.
verifyShortCode-title-3 = Embojuruja ñanduti { -brand-mozilla } ndive
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Emoneĩ ne mba’ete ha eiporuporã { -brand-mozilla } eike eikehápe eñepyrũvo amo:
verifyShortCode-prompt-3 = Eiporu ko ayvu ñemoneĩrã:
verifyShortCode-expiry-notice = Ndoikovéima 5 aravo’ípe.
