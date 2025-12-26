## Non-email strings

session-verify-send-push-title-2 = Të hyhet te { -product-mozilla-account } juaj?
session-verify-send-push-body-2 = Klikoni këtu që të ripohoni se jeni ju
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } është kodi juaj i verifikimit { -brand-mozilla }. Skadon pas 5 minutash.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Kodi verifikimi { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } është kodi juaj i rikthimit { -brand-mozilla }. Skadon pas 5 minutash.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kod { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } është kodi juaj i rikthimit { -brand-mozilla }. Skadon pas 5 minutash.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kod { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Stemë e { -brand-mozilla }-s">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Njëkohësoni pajisje">
body-devices-image = <img data-l10n-name="devices-image" alt="Pajisje">
fxa-privacy-url = Rregulla Privatësie të { -brand-mozilla }-s
moz-accounts-privacy-url-2 = Shënim privatësie { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Kushte Shërbimi të { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Stemë e { -brand-mozilla }-s">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Stemë e { -brand-mozilla }-s">
subplat-automated-email = Ky është një email i automatizuar; nëse e morët gabimisht, s’ka nevojë të bëni gjë.
subplat-privacy-notice = Shënim privatësie
subplat-privacy-plaintext = Shënim privatësie:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Këtë email e merrni ngaqë për { $email } ka një { -product-mozilla-account } dhe jeni regjistruar për { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Këtë email po e merrni, ngaqë për { $email } ka një { -product-mozilla-account }.
subplat-explainer-multiple-2 = Këtë email po e merrni ngaqë { $email } ka një { -product-mozilla-account } dhe jeni pajtuar te disa produkte.
subplat-explainer-was-deleted-2 = Këtë email po e merrni, ngaqë { $email } qe regjistruar për një { -product-mozilla-account }.
subplat-manage-account-2 = Administroni rregullimet tuaja { -product-mozilla-account }, duke vizituar <a data-l10n-name="subplat-account-page">faqen e llogarisë tuaj</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Administroni rregullimet për { -product-mozilla-account } tuajën, duke vizituar faqen e llogarisë tuaj: { $accountSettingsUrl }
subplat-terms-policy = Kushte dhe rregulla anulimi
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Anulojeni pajtimin
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Riaktivizoni pajtimin
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Përditësoni të dhëna faturimi
subplat-privacy-policy = Rregulla Privatësie të { -brand-mozilla }-s
subplat-privacy-policy-2 = Shënim privatësie { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Kushte Shërbimi të { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Ligjore
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privatësi
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Nëse fshihet llogaria juaj, do të merrni email-e nga Mozilla Corporation dhe Mozilla Foundation, veç në <a data-l10n-name="unsubscribeLink">kërkofshi të shpajtoheni</a>.
account-deletion-info-block-support = Nëse keni pyetje, apo nevojë për asistencë, mos ngurroni të lidheni me <a data-l10n-name="supportLink">ekipin tonë të asistencës</a>.
account-deletion-info-block-communications-plaintext = Nëse fshihet llogaria juaj, do të merrni email-e nga Mozilla Corporation dhe Mozilla Foundation, veç në kërkofshi të shpahtoheni:
account-deletion-info-block-support-plaintext = Nëse keni pyetje, apo nevojë për asistencë, mos ngurroni të lidheni me ekipin tonë të asistencës:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Shkarkojeni { $productName } nga { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Shkarkojeni { $productName } nga { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalojeni { $productName } në <a data-l10n-name="anotherDeviceLink">tjetër pajisje desktop</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalojeni { $productName } në <a data-l10n-name="anotherDeviceLink">tjetër pajisje</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Merrni { $productName } në Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Shkarkojeni { $productName } nga App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instaloni { $productName } në tjetër pajisje:
automated-email-change-2 = Nëse s’e kryet ju këtë veprim, <a data-l10n-name="passwordChangeLink">ndryshoni fjalëkalimin tuaj</a> pa humbur një çast.
automated-email-support = Për më tepër hollësi, vizitoni <a data-l10n-name="supportLink">Asistencën { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Nëse s’e kryet ju këtë veprim, ndryshoni fjalëkalimin tuaj pa humbur një çast:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Për më tepër hollësi, vizitoniAsistencën { -brand-mozilla }:
automated-email-inactive-account = Ky është një email i automatizuar. Po e merrni nga keni një { -product-mozilla-account } dhe u bënë 2 vjet që nga hyrja juaj e fundit në llogari.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Për më tepër hollësi, vizitoni <a data-l10n-name="supportLink">Asistencën { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Ky është një email i automatizuar. Nëse e morët gabimisht, s’ju duhet të bëni gjë.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ky është një email i automatizuar; nëse s’e autorizoni këtë veprim, atëherë, ju lutemi, ndryshoni fjalëkalimin tuaj:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Kjo kërkesë erdhi nga { $uaBrowser } në { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Kjo kërkesë erdhi nga { $uaBrowser } në { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Kjo kërkesë erdhi nga { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Kjo kërkesë erdhi nga { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Kjo kërkesë erdhi nga { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Nëse s’qetë ju, <a data-l10n-name="revokeAccountRecoveryLink">fshijeni kyçin e ri</a> dhe <a data-l10n-name="passwordChangeLink">ndryshoni fjalëkalimin tuaj</a>.
automatedEmailRecoveryKey-change-pwd-only = Nëse s’qetë ju, <a data-l10n-name="passwordChangeLink">ndryshoni fjalëkalimin tuaj</a>.
automatedEmailRecoveryKey-more-info = Për më tepër hollësi, vizitoni <a data-l10n-name="supportLink">Asistencën { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Kjo kërkesë erdhi nga:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Nëse s’qetë ju, fshijeni kyçin e ri:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Nëse s’qetë ju, ndryshoni fjalëkalimin tuaj:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = dhe ndryshoni fjalëkalimin tuaj:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Për më tepër hollësi, vizitoni Asistencën { -brand-mozilla }:
automated-email-reset =
    Ky është një email i automatizuar; nëse këtë veprim s’e autorizuat ju, atëherë <a data-l10n-name="resetLink">ju lutemi, ndryshoni fjalëkalimin tuaj</a>.
    Për më tepër hollësi, ju lutemi, vizitoni <a data-l10n-name="supportLink">{ -brand-mozilla } Asistencën</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Nëse s’e autorizuat këtë veprim, ju lutemi, ricaktoni fjalëkalimin tuaj tani, te { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Nëse s’e ndërmorët ju këtë veprim, atëherë <a data-l10n-name="resetLink">ricaktoni fjalëkalimin tuaj</a> dhe <a data-l10n-name="twoFactorSettingsLink">riujdisni mirëfilltësim dyhapësh</a> menjëherë.
    Për më tepër informacion, ju lutemi, vizioni <a data-l10n-name="supportLink">Asistencën e { -brand-mozilla }-s</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Nëse këtë veprim s’e ndërmorët ju, atëherë ricaktoni fjalëkalimin tuaj mu tani, te:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Riujdisni gjithashtu mirëfilltësimin dyhapësh, te:
brand-banner-message = E dini se ndryshuam emrin tonë nga { -product-firefox-accounts } në { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Mësoni më tepër</a>
cancellationSurvey = Ju lutemi, ndihmonani të përmirësojmë shërbimet tona duke plotësuar këtë <a data-l10n-name="cancellationSurveyUrl">pyetësor të shkurtër</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ju lutemi, ndihmonani të përmirësojmë shërbimet tona duke plotësuar këtë pyetësor të shkurtër:
change-password-plaintext = Nëse dyshoni se dikush po rreket të arrijë të hyjë në llogarinë tuaj, ju lutemi, ndërroni fjalëkalimin tuaj.
manage-account = Administroni llogarinë
manage-account-plaintext = { manage-account }:
payment-details = Hollësi pagese:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numër Fature: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = U faturuan: { $invoiceTotal } më { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Fatura Pasuese: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metodë pagese:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metodë pagese: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metodë pagese: { $cardName } që përfundon me { $lastFour }
payment-provider-card-ending-in-plaintext = Metodë pagese: Kartë që përfundon me { $lastFour }
payment-provider-card-ending-in = <b>Metodë pagese:</b> Kartë që përfundon me { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metodë pagese:</b>> { $cardName } që përfundon me { $lastFour }
subscription-charges-invoice-summary = Përmbledhje Fature

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Numër fature</b>b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Numër fature: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datë:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datë: { $invoiceDateOnly }
subscription-charges-list-price = Çmim normal
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Çmim normal: { $offeringPrice }
subscription-charges-credit-from-unused-time = Kredit nga kohë e papërdorur
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Kredit nga kohë e papërdorur: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Nënshumë</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Nënshumë: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Zbritje për një herë vetëm
subscription-charges-one-time-discount-plaintext = Zbritje për një herë vetëm: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
       *[other] Zbritje { $discountDuration }-mujore
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Zbritje { $discountDuration }-mujore: { $invoiceDiscountAmount }
       *[other] Zbritje { $discountDuration }-mujore: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Zbritje
subscription-charges-discount-plaintext = Zbritje: { $invoiceDiscountAmount }
subscription-charges-taxes = Taksa & tarifa
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Taksa & tarifa: { $invoiceTaxAmount }
subscription-charges-total = <b>Gjithsej</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Gjithsej: { $invoiceTotal }
subscription-charges-credit-applied = Krediti u aplikua
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Kredit i aplikuar: { $creditApplied }
subscription-charges-amount-paid = <b>Sasi e paguar</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Sasi e paguar: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Keni marrë një sasi krediti prej { $creditReceived }, e cila do të aplikohet te faturat tuaja të ardhshme.

##

subscriptionSupport = Pyetje rreth pajtimit tuaj? <a data-l10n-name="subscriptionSupportUrl">Ekipi ynë i asistencës</a> është këtu për t’ju ndihmuar.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Pyetje rreth pajtimit tuaj? Ekipi ynë i asistencës është këtu për t’ju ndihmuar:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Faleminderit për pajtimin te { $productName }. Nëse keni ndonjë pyetje mbi pajtimin tuaj, ose ju duhet më tepër informacion rreth { $productName }, ju lutemi, <a data-l10n-name="subscriptionSupportUrl">lidhuni me ne</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Faleminderit për pajtimin te { $productName }. Nëse keni ndonjë pyetje mbi pajtimin tuaj, ose ju duhet më tepër informacion rreth { $productName }, ju lutemi, lidhuni me ne:
subscription-support-get-help = Merrni ndihmë për pajtimin tuaj
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Administroni pajtimin tuaj</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Administroni pajtimin tuaj:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Lidhuni me asistencën</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Lidhuni me asistencën:
subscriptionUpdateBillingEnsure = Nga <a data-l10n-name="updateBillingUrl">këtu</a>, mund të siguroheni se metoda juaj e pagesës dhe hollësitë e llogarisë janë të sakta.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Nga këtu, mund të siguroheni se metoda juaj e pagesës dhe hollësitë e llogarisë janë të sakta:
subscriptionUpdateBillingTry = Do të riprovojmë kryerjen e pagesës tuaj gjatë pak ditëve të ardhshme, por mund të duhet të na ndihmoni për ta ndrequr, duke <a data-l10n-name="updateBillingUrl">përditësuar hollësitë e pagesës tuaj</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Do të riprovojmë kryerjen e pagesës tuaj gjatë pak ditëve të ardhshme, por mund të duhet të na ndihmoni për ta ndrequr, duke përditësuar hollësitë e pagesës tuaj:
subscriptionUpdatePayment = Që të parandalohet çfarëdo ndërprerje në shërbimin tuaj, ju lutemi, <a data-l10n-name="updateBillingUrl">përditësoni të dhënat tuaja të pagesës</a> sa më shpejt të jetë e mundur.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Që të parandalohet çfarëdo ndërprerje në shërbimin tuaj, ju lutemi, përditësoni të dhënat tuaja të pagesës sa më shpejt të jetë e mundur:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Për më tepër hollësi, vizitoni <a data-l10n-name="supportLink">Asistencën { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Për më tepër hollësi, vizitoni Asistencën { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } në { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } në { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (hamendësuar)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (hamendësim)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (hamendësuar)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (hamendësim)
view-invoice-link-action = Shihni faturën
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Shihni Faturën: { $invoiceLink }
cadReminderFirst-subject-1 = Për kujtesë! Le të njëkohësojmë { -brand-firefox }-in
cadReminderFirst-action = Njëkohësoni pajisje tjetër
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Njëkohësimi lyp dy anë
cadReminderFirst-description-v2 = Merrini skedat tuaja në krejt pajisjet tuaja. Merrni faqerojtësit tuaj, fjalëkalimet dhe të tjera të dhëna kudo që përdorni { -brand-firefox }-in.
cadReminderSecond-subject-2 = Mos humbni rastin! Le të përfundojmë ujdisjen e njëkohësimit tuaj
cadReminderSecond-action = Njëkohësoni pajisje tjetër
cadReminderSecond-title-2 = Mos harroni të bëni njëkohësim!
cadReminderSecond-description-sync = Njëkohësoni faqerojtësit tuaj, fjalëkalimet, skeda të hapura, etj — kudo ku përdorni { -brand-firefox }-in.
cadReminderSecond-description-plus = Plus, të dhënat tuaja janë përherë të fshehtëzuara. Vetëm ju dhe pajisjet që miratoni ju mund t’i shihni.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Mirë se vini te { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Mirë se vini te { $productName }.
downloadSubscription-content-2 = Le t’ia fillojmë duke përdorur krejt veçoritë që përfshin pajtimi juaj:
downloadSubscription-link-action-2 = Fillojani
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } e juaja u fshi
fraudulentAccountDeletion-title = Llogaria juaj u fshi
fraudulentAccountDeletion-content-part1-v2 = Tani së fundi u krijua një { -product-mozilla-account } dhe u bë një faturim pajtimi duke përdorur këtë adresë email. Siç bëjmë me krejt llogaritë e reja, ju kërkuam të ripohoni llogarinë tuaj, duke dëshmuar së pari se kjo adresë email është e vlefshme.
fraudulentAccountDeletion-content-part2-v2 = Hëpërhë shohim se llogaria s’qe ripohuar kurrë. Ngaqë s’qe plotësuar ky hap, s’jemi të sigurt nëse ky qe një pajtim i autorizuar. Si pasojë, { -product-mozilla-account } e regjistruar me këtë adresë email qe fshirë dhe pajtimi juaj u anulua me rimbursim të gjithë ç’qe faturuar.
fraudulentAccountDeletion-contact = Nëse keni ndonjë pyetje, ju lutemi, lidhuni me  <a data-l10n-name="mozillaSupportUrl">ekipin tonë të asistencës</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Nëse keni ndonjë pyetje, ju lutemi, lidhuni me ekipin tonë të asistencës: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Shansi juaj i fundit për të mbajtur { -product-mozilla-account }
inactiveAccountFinalWarning-title = Llogaria juaj { -brand-mozilla } dhe të dhënat tuaja do të fshihen
inactiveAccountFinalWarning-preview = Që të mbani llogarinë tuaj, bëni hyrjen në të
inactiveAccountFinalWarning-account-description = { -product-mozilla-account } juaj përdoret për të hyrë në produkte të lirë privatësie dhe shfletimi, të tillë si njëkohësimi { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } dhe { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Më <strong>{ $deletionDate }</strong>, llogaria juaj dhe të dhënat tuaja do të fshihen përgjithmonë, veç në bëfshi hyrjen në llogari.
inactiveAccountFinalWarning-action = Që të mbani llogarinë tuaj, bëni hyrjen në të
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Që të mbani llogarinë tuaj, bëni hyrjen në të:
inactiveAccountFirstWarning-subject = Mos e humbni llogarinë tuaj
inactiveAccountFirstWarning-title = Doni të mbani llogarinë dhe të dhënat tuaja { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account } juaj përdoret për të hyrë në produkte të lirë privatësie dhe shfletimi, të tillë si njëkohësimi { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } dhe { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Kemi vënë re se u bënë 2 vjet që s’keni bërë hyrjen në llogari.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Llogaria juaj dhe të dhënat personale do të fshihen përgjithmonë më <strong>{ $deletionDate }</strong>, ngaqë s’keni qenë aktiv.
inactiveAccountFirstWarning-action = Që të mbani llogarinë tuaj, bëni hyrjen në të
inactiveAccountFirstWarning-preview = Që të mbani llogarinë tuaj, bëni hyrjen në të
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Që të mbani llogarinë tuaj, bëni hyrjen në të:
inactiveAccountSecondWarning-subject = Lypset veprim: Fshirje llogarie për 7 ditë
inactiveAccountSecondWarning-title = Llogaria juaj { -brand-mozilla } dhe të dhënat tuaja do të fshihen për 7 ditë
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account } juaj përdoret për të hyrë në produkte të lirë privatësie dhe shfletimi, të tillë si njëkohësimi { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } dhe { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Llogaria juaj dhe të dhënat personale do të fshihen përgjithmonë më <strong>{ $deletionDate }</strong>, ngaqë s’keni qenë aktiv.
inactiveAccountSecondWarning-action = Që të mbani llogarinë tuaj, bëni hyrjen në të
inactiveAccountSecondWarning-preview = Që të mbani llogarinë tuaj, bëni hyrjen në të
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Që të mbani llogarinë tuaj, bëni hyrjen në të:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Keni mbetur pa kode mirëfilltësimi kopjeruajtjeje!
codes-reminder-title-one = Keni mbetur me kodin e fundit mirëfilltësimi kopjeruajtjeje!
codes-reminder-title-two = Ka ardhur koha për të krijuar më tepër kode mirëfilltësimi kopjeruajtjesh
codes-reminder-description-part-one = Kodet e mirëfilltësimit të kopjeruajtjes ju ndihmojnë të riktheni informacionin tuaj, kur harroni fjalëkalimin.
codes-reminder-description-part-two = Krijoni kode të rinj tani, që të mos humbni të dhëna më vonë.
codes-reminder-description-two-left = Ju kanë mbetur vetëm dy kode.
codes-reminder-description-create-codes = Krijoni kode të rinj mirëfilltësimi kopjeruajtjeje, për të ndihmuar veten të riktheheni te llogaria juaj, nëse mbeteni jashtë saj.
lowRecoveryCodes-action-2 = Krijoni kode
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Pa kode të tjerë mirëfilltësimi kopjeruajtjeje
        [one] Ka mbetur vetëm 1 kod mirëfilltësimi kopjeruajtjeje
       *[other] Kanë mbetur vetëm { $numberRemaining } kode mirëfilltësimi kopjeruajtjeje!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Hyrje e re te { $clientName }
newDeviceLogin-subjectForMozillaAccount = Hyrje e re te { -product-mozilla-account } juaj
newDeviceLogin-title-3 = Për të bërë hyrjen qe përdorur { -product-mozilla-account } e juaja
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = S’jeni ju? <a data-l10n-name="passwordChangeLink">Ndryshoni fjalëkalimin tuaj</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Jo ju? Ndryshoni fjalëkalimin tuaj:
newDeviceLogin-action = Administroni llogarinë
passwordChanged-subject = Fjalëkalimi u përditësua
passwordChanged-title = Fjalëkalimi u ndryshua me sukses
passwordChanged-description-2 = Fjalëkalimi juaj për { -product-mozilla-account } u ndryshua me sukses që nga pajisja vijuese:
passwordChangeRequired-subject = U pikas veprimtari e dyshimtë
passwordChangeRequired-preview = Ndryshoni menjëherë fjalëkalimin tuaj
passwordChangeRequired-title-2 = Ricaktoni fjalëkalimin tuaj
passwordChangeRequired-suspicious-activity-3 = E kyçëm llogarinë tuaj për ta mbajtur të parrezik nga veprimtari e dyshimtë. Jeni nxjerrë jashtë llogarisë tuaj në krejt pajisjet tuaja dhe, si masë paraprake, çfarëdo të dhënash të njëkohësuara janë fshirë.
passwordChangeRequired-sign-in-3 = Që të rihyni te llogaria juaj, krejt ç’ju duhet është të ricaktoni fjalëkalimin tuaj.
passwordChangeRequired-different-password-2 = <b>E rëndësishme:</b> Zgjidhni një fjalëkalim të fuqishëm, që është i ndryshëm nga ai që përdornit në të kaluarën.
passwordChangeRequired-different-password-plaintext-2 = E rëndësishme: Zgjidhni një fjalëkalim të fuqishëm, që është i ndryshëm nga ai që përdornit në të kaluarën.
passwordChangeRequired-action = Ricaktoni fjalëkalimin
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Që të ndryshoni fjalëkalimin tuaj përdorni { $code }
password-forgot-otp-preview = Ky kod skadon për 10 minuta
password-forgot-otp-title = Harruat fjalëkalimin tuaj?
password-forgot-otp-request = Morëm një kërkesë për ndryshim fjalëkalimi në { -product-mozilla-account } tuaj nga:
password-forgot-otp-code-2 = Nëse qetë ju, ja kodi juaj i ripohimit, për të vazhduar:
password-forgot-otp-expiry-notice = Ky kod skadon për 10 minuta.
passwordReset-subject-2 = Fjalëkalimi juaj u ricaktua
passwordReset-title-2 = Fjalëkalimi juaj u ricaktua
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = E ricaktuat fjalëkalimin tuaj për { -product-mozilla-account } më:
passwordResetAccountRecovery-subject-2 = Fjalëkalimi juaj u ricaktua
passwordResetAccountRecovery-title-3 = Fjalëkalimi juaj u ricaktua
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Përdorët kyçin tuaj për rimarrje llogarie për të ricaktuar fjalëkalimin tuaj për { -product-mozilla-account } më:
passwordResetAccountRecovery-information = Kemi bërë nxjerrjen tuaj nga krejt llogaritë në krejt pajisjet tuaja të njëkohësuara. Krijuam një kyç të ri rimarrjeje llogarie, për të zëvendësuar atë që përdorët. Mund ta ndryshoni që nga rregullimet e llogarisë tuaj.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Kemi bërë nxjerrjen tuaj nga krejt llogaritë në krejt pajisjet tuaja të njëkohësuara. Krijuam një kyç të ri rimarrjeje llogarie, për të zëvendësuar atë që përdorët. Mund ta ndryshoni që nga rregullimet e llogarisë tuaj:
passwordResetAccountRecovery-action-4 = Administroni llogarinë
passwordResetRecoveryPhone-subject = U përdor telefon rimarrjeje
passwordResetRecoveryPhone-preview = Kontrolloni, për t’u siguruar se qetë ju
passwordResetRecoveryPhone-title = Telefoni juaj i rimarrjeve u përdor për ripohim ricaktimi fjalëkalimi
passwordResetRecoveryPhone-device = U përdor telefon rimarrjeje nga:
passwordResetRecoveryPhone-action = Administroni llogarinë
passwordResetWithRecoveryKeyPrompt-subject = Fjalëkalimi juaj u ricaktua
passwordResetWithRecoveryKeyPrompt-title = Fjalëkalimi juaj u ricaktua
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = E ricaktuat fjalëkalimin tuaj për { -product-mozilla-account } më:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Krijoni kyç rimarrjeje llogarie
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Krijoni kyç rimarrjeje llogarie:
passwordResetWithRecoveryKeyPrompt-cta-description = Do t’ju duhet të ribëni hyrjen në krejt llogaritë në krejt pajisjet tuaja të njëkohësuara. Herës tjetër mbajini të parrezik të dhënat tuaja, me një kyç rimarrjeje llogarie. Kjo ju lejon të rimerrni të dhënat tuaja, nëse harroni fjalëkalimin tuaj.
postAddAccountRecovery-subject-3 = U krijua kyç i ri rimarrjeje llogarie
postAddAccountRecovery-title2 = Krijuat një kyç të ri rimarrjeje llogarie
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Ruajeni këtë kyç në një vend të sigurt — do t’ju duhet për rikthim të të dhënave të fshehtëzuara të shfletimit tuaj, nëse harroni fjalëkalimin tuaj.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Ky kyç mund të përdoret vetëm një herë. Pasi ta përdorni, do të krijojmë automatikisht për ju një të ri. Ose mund të krijoni një të ri, në çfarëdo kohe, që nga rregullimet e llogarisë tuaj.
postAddAccountRecovery-action = Administroni llogarinë
postAddLinkedAccount-subject-2 = Me { -product-mozilla-account } tuajën u lidh llogari e re
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Llogaria juaj { $providerName } është lidhur me { -product-mozilla-account } tuajën
postAddLinkedAccount-action = Administroni llogarinë
postAddRecoveryPhone-subject = U shtua telefon rimarrje
postAddRecoveryPhone-preview = Llogari e mbrojtur nga mirëfilltësim dyfaktorësh
postAddRecoveryPhone-title-v2 = Shtuat një numër telefoni rimarrjeje
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Shtuat { $maskedLastFourPhoneNumber } si numrin tuaj të telefonit për rimarrje
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Si e mbron kjo llogarinë tuaj
postAddRecoveryPhone-how-protect-plaintext = Si e mbron kjo llogarinë tuaj:
postAddRecoveryPhone-enabled-device = E aktivizuat që nga:
postAddRecoveryPhone-action = Administroni llogarinë
postAddTwoStepAuthentication-preview = Llogaria juaj është e mbrojtur
postAddTwoStepAuthentication-subject-v3 = Mirëfilltësimi dyhapësh është aktiv
postAddTwoStepAuthentication-title-2 = Aktivizuat mirëfilltësim dyhapësh
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = E kërkuat prej:
postAddTwoStepAuthentication-action = Administroni llogarinë
postAddTwoStepAuthentication-code-required-v4 = Tani e tutje, sa herë që bëni hyrjen, kërkohet kod sigurie nga aplikacioni juaj i mirëfilltësimeve.
postAddTwoStepAuthentication-recovery-method-codes = Shtuat edhe kode mirëfilltësim kopjeruajtjesh si metodë tuajën.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Shtuat edhe { $maskedPhoneNumber } si numrin tuaj të telefonit për rimarrje.
postAddTwoStepAuthentication-how-protects-link = Si e mbron kjo llogarinë tuaj
postAddTwoStepAuthentication-how-protects-plaintext = Si e mbron kjo llogarinë tuaj:
postAddTwoStepAuthentication-device-sign-out-message = Që të mbroni krejt pajisjet tuaja të lidhura, duhet të bëni daljen nga llogaria kudo ku e keni në përdorim atë dhe mandej të ribëni hyrjen duke përdorur mirëfilltësimin dyhapësh.
postChangeAccountRecovery-subject = U ndryshua kyç rimarrjeje llogarie
postChangeAccountRecovery-title = Ndryshuat kyçin e rimarrjes së llogarisë tuaj
postChangeAccountRecovery-body-part1 = Tani keni një kyç të ri rimarrjeje llogarie. Kyçi juaj i mëparshëm u fshi.
postChangeAccountRecovery-body-part2 = Ruajeni këtë kyç të ri në një vend të sigurt — do t’ju duhet për rikthim të të dhënave të fshehtëzuara të shfletimit tuaj, nëse harroni fjalëkalimin tuaj.
postChangeAccountRecovery-action = Administroni llogarinë
postChangePrimary-subject = Email-i parësor u përditësua
postChangePrimary-title = Email parësor i ri
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = E ndryshuat me sukses email-in në { $email }. Kjo adresë përbën tani emrin tuaj të përdoruesit për hyrje te { -product-mozilla-account } e juaja, si edhe për të marrë njoftime sigurie dhe ripohime hyrjesh.
postChangePrimary-action = Administroni llogarinë
postChangeRecoveryPhone-subject = U përditësua telefon rimarrje
postChangeRecoveryPhone-preview = Llogari e mbrojtur nga mirëfilltësim dyfaktorësh
postChangeRecoveryPhone-title = Ndryshuat telefonin tuaj të rimarrjes
postChangeRecoveryPhone-description = Tani keni një telefon të ri rimarrjeje. Numri juaj i mëparshëm telefonik u fshi.
postChangeRecoveryPhone-requested-device = E kërkuar prej:
postChangeTwoStepAuthentication-preview = Llogaria juaj është e mbrojtur
postChangeTwoStepAuthentication-subject = U përditësua mirëfilltësimi dyhapësh
postChangeTwoStepAuthentication-title = Mirëfilltësimi dyhapësh është përditësuar
postChangeTwoStepAuthentication-use-new-account = Tani ju duhet të përdorni zërin e ri { -product-mozilla-account } te aplikacioni juaj i mirëfilltësimeve. I vjetri s’do të punojë më dhe mund ta hiqni.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = E kërkuat prej:
postChangeTwoStepAuthentication-action = Administroni llogarinë
postChangeTwoStepAuthentication-how-protects-link = Si e mbron kjo llogarinë tuaj
postChangeTwoStepAuthentication-how-protects-plaintext = Si e mbron kjo llogarinë tuaj:
postChangeTwoStepAuthentication-device-sign-out-message = Që të mbroni krejt pajisjet tuaja të lidhura, duhet të bëni daljen nga llogaria kudo ku e keni në përdorim atë dhe mandej të ribëni hyrjen duke përdorur mirëfilltësimin tuaj të ri dyhapësh.
postConsumeRecoveryCode-title-3 = Kodi juaj i mirëfilltësimit të kopjeruajtjes qe përdorur për të ripohuar një ricaktim fjalëkalimi
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kod i përdorur për:
postConsumeRecoveryCode-action = Administroni llogarinë
postConsumeRecoveryCode-subject-v3 = U përdorën kode mirëfilltësimi kopjeruajtjeje
postConsumeRecoveryCode-preview = Kontrolloni, për t’u siguruar se qetë ju
postNewRecoveryCodes-subject-2 = U krijuan kode të rinj mirëfilltësimi kopjeruajtjeje
postNewRecoveryCodes-title-2 = Krijuat kode të rinj mirëfilltësimi kopjeruajtje
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = U krijuan te:
postNewRecoveryCodes-action = Administroni llogarinë
postRemoveAccountRecovery-subject-2 = U fshi kyç rimarrjeje llogarie
postRemoveAccountRecovery-title-3 = Fshitë kyçin tuaj të rimarrjes së llogarisë
postRemoveAccountRecovery-body-part1 = Kyçi i rimarrjes së llogarisë tuaj është i domosdoshëm për rikthim të dhënash të fshehtëzuara shfletimi, nëse harroni fjalëkalimin tuaj.
postRemoveAccountRecovery-body-part2 = Nëse s’e keni bërë tashmë, krijoni një kyç të ri rimarrjeje llogarie, që nga rregullimet e llogarisë tuaj, për të parandaluar humbjen e fjalëkalimeve të ruajtur, faqerojtësve, historikut të shfletimeve, etj.
postRemoveAccountRecovery-action = Administroni llogarinë
postRemoveRecoveryPhone-subject = U hoq telefon rimarrjeje
postRemoveRecoveryPhone-preview = Llogari e mbrojtur nga mirëfilltësim dyfaktorësh
postRemoveRecoveryPhone-title = U hoq telefon rimarrjeje
postRemoveRecoveryPhone-description-v2 = Telefoni juaj i rimarrjeve është hequr nga rregullimet tuaja për mirëfilltësimin me dy hapa.
postRemoveRecoveryPhone-description-extra = Mundeni prapë të përdorni kodet tuaj kopjeruajtje të mirëfilltësimeve, që të bëni hyrjen, nëse s’jeni në gjendje të përdorni aplikacionin tuaj të mirëfilltësimeve.
postRemoveRecoveryPhone-requested-device = E kërkuar prej:
postRemoveSecondary-subject = Email-i dytësor u hoq
postRemoveSecondary-title = Email-i dytësor u hoq
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Hoqët me sukses { $secondaryEmail } si email dytësor prej { -product-mozilla-account } tuaj. Te kjo adresë s’do të dërgohen më njoftime sigurie dhe ripohime hyrjesh.
postRemoveSecondary-action = Administroni llogarinë
postRemoveTwoStepAuthentication-subject-line-2 = Mirëfilltësimi dyhapësh u çaktivizua
postRemoveTwoStepAuthentication-title-2 = Çaktivizuat mirëfilltësim dyhapësh
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = E çaktivizuat që nga:
postRemoveTwoStepAuthentication-action = Administroni llogarinë
postRemoveTwoStepAuthentication-not-required-2 = Nuk ju duhen më kode sigurie prej aplikacionit tuaj të mirëfilltësimeve, kur bëni hyrjen.
postSigninRecoveryCode-subject = Kod mirëfilltësimi kopjeruajtjeje i përdorur për të bërë hyrjen
postSigninRecoveryCode-preview = Ripohoni veprimtari llogarie
postSigninRecoveryCode-title = Kodi juaj i mirëfilltësimit të kopjeruajtjes qe përdorur për të bërë hyrjen
postSigninRecoveryCode-description = Nëse s’e bëtë ju, duhet të ndryshoni fjalëkalimin tuaj menjëherë, për të mbajtur llogarinë tuaj të parrezik.
postSigninRecoveryCode-device = Bëtë hyrjen që nga:
postSigninRecoveryCode-action = Administroni llogarinë
postSigninRecoveryPhone-subject = Telefon rimarrjeje i përdorur për të bërë hyrjen
postSigninRecoveryPhone-preview = Ripohoni veprimtari llogarie
postSigninRecoveryPhone-title = Telefon juaj i rimarrjes u përdorur për të bërë hyrjen
postSigninRecoveryPhone-description = Nëse s’e bëtë ju, duhet të ndryshoni fjalëkalimin tuaj menjëherë, për të mbajtur llogarinë tuaj të parrezik.
postSigninRecoveryPhone-device = Bëtë hyrjen që nga:
postSigninRecoveryPhone-action = Administroni llogarinë
postVerify-sub-title-3 = Jemi të ngazëllyer t’ju shohim!
postVerify-title-2 = Doni të shihni të njëjtën skedë në dy pajisje?
postVerify-description-2 = Është kollaj! Thjesht instaloni { -brand-firefox }-in në pajisjen tjetër dhe bëni hyrjen që t’i njëkohësoni. Si me magji!
postVerify-sub-description = (Eeej… Kjo do të thotë gjithashtu se mund të merrni faqerojtësit tuaj, fjalëkalime dhe të tjera të dhëna { -brand-firefox } kudo ku keni bërë hyrjen.)
postVerify-subject-4 = Mirë se vini në { -brand-mozilla }
postVerify-setup-2 = Lidhni një tjetër pajisje:
postVerify-action-2 = Lidhni pajisje tjetër
postVerifySecondary-subject = Email-i dytësor u shtua
postVerifySecondary-title = Email-i dytësor u shtua
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Keni ripohuar me sukses { $secondaryEmail } si një email dytësor për { -product-mozilla-account } tuajën. Njoftimet e sigurisë dhe ripohime hyrjesh tanimë do të dërgohen te të dy adresat.
postVerifySecondary-action = Administroni llogarinë
recovery-subject = Ricaktoni fjalëkalimin tuaj
recovery-title-2 = Harruat fjalëkalimin tuaj?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Morëm një kërkesë për ndryshim fjalëkalimi në { -product-mozilla-account } tuaj nga:
recovery-new-password-button = Krijoni një fjalëkalim të ri duke klikuar butonin më poshtë. Kjo lidhje do të skadojë brenda orës së ardhshme.
recovery-copy-paste = Krijoni një fjalëkalim të ri duke kopjuar dhe ngjitur në shfletuesin tuaj URL-në më poshtë. Kjo lidhje do të skadojë brenda orës së ardhshme.
recovery-action = Krijoni fjalëkalim të ri
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Pajtimi juaj për { $productName } është anuluar
subscriptionAccountDeletion-title = Ju shohim me keqardhje teksa ikni
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Tani afër fshitë { -product-mozilla-account } tuajën. Si pasojë, anuluam pajtimin tuaj për { $productName }. Pagesa juaj përfundimtare prej { $invoiceTotal } qe bërë më { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Mirë se vini në{ $productName }: Ju lutemi, caktoni fjalëkalimin tuaj.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Mirë se vini te { $productName }.
subscriptionAccountFinishSetup-content-processing = Pagesa juaj po përpunohet dhe mund të duhen deri në katër ditë pune që të plotësohet. Pajtimi juaj do të rinovohet automatikisht për çdo periudhë faturimi, veç në zgjedhshi ta anuloni.
subscriptionAccountFinishSetup-content-create-3 = Më pas do të krijoni një fjalëkalim { -product-mozilla-account }, që të nisni të përdorni pajtimin tuaj.
subscriptionAccountFinishSetup-action-2 = Fillojani
subscriptionAccountReminderFirst-subject = Kujtues: Përfundoni ujdisjen e llogarisë tuaj
subscriptionAccountReminderFirst-title = S’mund të përdorni ende pajtimin tuaj
subscriptionAccountReminderFirst-content-info-3 = Ca ditë më parë krijuat një { -product-mozilla-account }, por s’bëtë ripohimin për këtë. Shpresojmë se do të përfundoni ujdisjen e llogarisë tuaj, që të mund të përdorni pajtimin tuaj të ri.
subscriptionAccountReminderFirst-content-select-2 = Që të ujdisni një fjalëkalim të ri dhe të përfundoni ripohimin e llogarisë tuaj, përzgjidhni “Krijoni Fjalëkalim”.
subscriptionAccountReminderFirst-action = Krijoni Fjalëkalim
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Kujtues përfundimtar: Ujdisni llogarinë tuaj
subscriptionAccountReminderSecond-title-2 = Mirë se vini në { -brand-mozilla }
subscriptionAccountReminderSecond-content-info-3 = Ca ditë më parë krijuat një { -product-mozilla-account }, por s’bëtë ripohimin për këtë. Shpresojmë se do të përfundoni ujdisjen e llogarisë tuaj, që të mund të përdorni pajtimin tuaj të ri.
subscriptionAccountReminderSecond-content-select-2 = Që të ujdisni një fjalëkalim të ri dhe të përfundoni ripohimin e llogarisë tuaj, përzgjidhni “Krijoni Fjalëkalim”.
subscriptionAccountReminderSecond-action = Krijoni Fjalëkalim
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Pajtimi juaj për { $productName } është anuluar
subscriptionCancellation-title = Ju shohim me keqardhje teksa ikni

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Anuluam pajtimin tuaj për { $productName }. Pagesa juaj përfundimtare prej { $invoiceTotal } u bë më { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Anuluam pajtimin tuaj për { $productName }. Pagesa juaj përfundimtare prej { $invoiceTotal } do të bëhet më { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Shërbimi juaj do të vazhdojë deri në fund të periudhës suaj të tanishme të faturimit, që bie më { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = U hodhët në { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = U hodhët me sukses nga { $productNameOld } në { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Duke filluar me faturën tuaj të ardhshme, vlera që ju faturohet do të ndryshohet nga { $paymentAmountOld } për { $productPaymentCycleOld } në { $paymentAmountNew } për { $productPaymentCycleNew }. Në atë kohë do t’ju jepet një kredit vetëm për një herë prej { $paymentProrated } për të pasqyruar tarifën më të ulët për pjesën e mbetur të këtij { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Në pastë <em>software</em> të ri që ta instaloni, për të mundur të përdorni { $productName }, do të merrni një email veçmas me udhëzime shkarkimi.
subscriptionDowngrade-content-auto-renew = Pajtimi juaj do të rinovohet automatikisht çdo periudhë faturimi, deri sa të zgjidhni anulimin.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Pajtimi juaj për { $productName } është anuluar
subscriptionFailedPaymentsCancellation-title = Pajtimi juaj është anuluar
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Anuluam pajtimin tuaj për { $productName }, për shkak përpjekjesh të shumta të dështuara pagimi. Që të keni hyrje sërish, nisni një pajtim të ri, me një metodë të përditësuar pagesash.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pagesa për { $productName } u ripohua
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Faleminderit për pajtimin te { $productName }
subscriptionFirstInvoice-content-processing = Pagesa juaj po kryhet dhe që të plotësohet, mund të duhen deri në katër ditë biznesi.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Do të merrni një email më vete se si të nisni të përdorni { $productName }.
subscriptionFirstInvoice-content-auto-renew = Pajtimi juaj do të rinovohet automatikisht çdo periudhë faturimi, deri sa të zgjidhni anulimin.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Fatura juaj pasuese do të bëhet gati më { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Metoda e pagesës për { $productName } që ka skaduar, ose skadon së shpejti
subscriptionPaymentExpired-title-2 = Metoda juaj e pagesës ka skaduar, ose është afër skadimit
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Metoda e pagesës që po përdorni për { $productName } ka skaduar ose është afër skadimit.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Pagesa për { $productName } dështoi
subscriptionPaymentFailed-title = Na ndjeni, po kemi probleme me pagesën tuaj
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Patëm një problem me pagesën tuaj të fundit për { $productName }.
subscriptionPaymentFailed-content-outdated-1 = Mundet të ketë skaduar metoda juaj e pagesës, ose metoda juaj e tanishme e pagesave të jetë e vjetruar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Lypset përditësim të dhënash pagese për { $productName }
subscriptionPaymentProviderCancelled-title = Na ndjeni, po kemi probleme me metodën tuaj të pagesave
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Pikasëm një problem me metodën tuaj të pagesës për { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Mundet të ketë skaduar metoda juaj e pagesës, ose metoda juaj e tanishme e pagesave të jetë e vjetruar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Pajtimi në { $productName } u riaktivizua
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Faleminderit për riaktivizimin e pajtimit tuaj në { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Cikli juaj i faturimeve dhe pagesave do të mbesë njësoj. Faturimi pasues do të jetë { $invoiceTotal }, më { $nextInvoiceDateOnly }. Pajtimi juaj do të rinovohet automatikisht në çdo periudhë faturimi, veç në zgjedhshi ta anuloni.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Njoftim rinovimi të automatizuar të { $productName }
subscriptionRenewalReminder-title = Pajtimi juaj do të rinovohet së shpejti
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = I dashur klient i { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Pajtimi juaj aktual është ujdisur të rinovohet automatikisht pas { $reminderLength } ditësh. Në atë kohë, { -brand-mozilla } do të rinovojë pajtimin tuaj për { $planIntervalCount } { $planInterval } dhe llogarisë tuaj do t’i faturohet vlera { $invoiceTotal } përmes metodës së pagesës.
subscriptionRenewalReminder-content-closing = Sinqerisht,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Ekipi i { $productName }-s
subscriptionReplaced-subject = Pajtimi juaj është përditësuar si pjesë e përmirësimit tuaj
subscriptionReplaced-title = Pajtimi juaj është përditësuar
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Pajtimi juaj individual { $productName } është zëvendësuar dhe tani përfshihet te paketa juaj e re.
subscriptionReplaced-content-credit = Do të përfitoni një kredit për çfarëdo kohe të papërdorur nga pajtimi juaj i mëparshëm, Ky kredit do të aplikohet automatikisht te llogaria juaj dhe përdoret për faturime të ardhshme.
subscriptionReplaced-content-no-action = Nga ana juaj s’lypset ndonjë veprim.
subscriptionsPaymentExpired-subject-2 = Metoda e pagesës për pajtimet tuaja ka skaduar, ose skadon së shpejti
subscriptionsPaymentExpired-title-2 = Metoda juaj e pagesës ka skaduar, ose është afër skadimit
subscriptionsPaymentExpired-content-2 = Metoda e pagesave që po përdorni për të bërë pagesa për pajtimet vijuese ka skaduar, ose është afër skadimit.
subscriptionsPaymentProviderCancelled-subject = Lypset përditësim hollësish pagese për pajtime { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Na ndjeni, po kemi probleme me metodën tuaj të pagesave
subscriptionsPaymentProviderCancelled-content-detected = Pikasëm një problem me metodën tuaj të pagesës për pajtimet vijuese.
subscriptionsPaymentProviderCancelled-content-payment-1 = Mundet të ketë skaduar metoda juaj e pagesës, ose metoda juaj e tanishme e pagesave të jetë e vjetruar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Pagesa për { $productName } u mor
subscriptionSubsequentInvoice-title = Faleminderit që jeni një pajtimtar!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Morëm pagesën tuaj më të re për { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Fatura juaj pasuese do të bëhet gati më { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = E përmirësuat me { $productName }
subscriptionUpgrade-title = Faleminderit për përmirësimin!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = E keni përmirësuar me sukses me { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Ju është faturuar një tarifë prej { $invoiceAmountDue } për vetëm një herë, për të pasqyruar çmim më të lartë të pajtimit tuaj për pjesën e mbetur të kësaj periudhe faturimi { $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Keni marrë një sasi krediti llogarie prej { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Duke filluar nga faturimi juaj i ardhshëm, çmimi i pajtimit tuaj do të ndryshojë.
subscriptionUpgrade-content-old-price-day = Tarifa e mëparshme qe { $paymentAmountOld } në ditë.
subscriptionUpgrade-content-old-price-week = Tarifa e mëparshme qe { $paymentAmountOld } në javë.
subscriptionUpgrade-content-old-price-month = Tarifa e mëparshme qe { $paymentAmountOld } në muaj.
subscriptionUpgrade-content-old-price-halfyear = Tarifa e mëparshme qe { $paymentAmountOld } në gjashtë muaj.
subscriptionUpgrade-content-old-price-year = Tarifa e mëparshme qe { $paymentAmountOld } në vit.
subscriptionUpgrade-content-old-price-default = Tarifa e mëparshme qe { $paymentAmountOld } për periudhë faturimi.
subscriptionUpgrade-content-old-price-day-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në ditë.
subscriptionUpgrade-content-old-price-week-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në javë.
subscriptionUpgrade-content-old-price-month-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në muaj.
subscriptionUpgrade-content-old-price-halfyear-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë për gjashtë muaj.
subscriptionUpgrade-content-old-price-year-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë në vit.
subscriptionUpgrade-content-old-price-default-tax = Tarifa e mëparshme qe { $paymentAmountOld } + { $paymentTaxOld } taksë për periudhë faturimi.
subscriptionUpgrade-content-new-price-day = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në ditë, hiq zbritje.
subscriptionUpgrade-content-new-price-week = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në javë, hiq zbritje.
subscriptionUpgrade-content-new-price-month = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-halfyear = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } për gjashtë muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-year = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } në vit, hiq zbritje.
subscriptionUpgrade-content-new-price-default = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } për periudhë faturimi, hiq zbritje.
subscriptionUpgrade-content-new-price-day-dtax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në ditë, hiq zbritje.
subscriptionUpgrade-content-new-price-week-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në javë, hiq zbritje.
subscriptionUpgrade-content-new-price-month-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-halfyear-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në gjashtë muaj, hiq zbritje.
subscriptionUpgrade-content-new-price-year-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë në vit, hiq zbritje.
subscriptionUpgrade-content-new-price-default-tax = Këtej e tutje, do të t’ju faturohet { $paymentAmountNew } + { $paymentTaxNew } taksë për periudhë faturimi, hiq zbritje.
subscriptionUpgrade-existing = Nëse ndonjë nga pajtimet tuaja ekzistues mbivendoset me këtë përmirësim, do ta zgjidhim dhe do t’ju dërgojmë një email më vete me hollësitë. Nëse plani juaj i ri përfshin produkte që lypin instalim, do t’ju dërgojmë një email më vete me udhëzime ujdisjeje.
subscriptionUpgrade-auto-renew = Pajtimi juaj do të rinovohet automatikisht çdo periudhë faturimi, deri sa të zgjidhni anulimin.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Që të bëni hyrjen, përdorni { $unblockCode }
unblockCode-preview = Ky kod skadon pas një orë
unblockCode-title = A jeni ju që po hyni?
unblockCode-prompt = Nëse po, ja ku keni kodin e autorizimit që ju duhet:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Nëse po, ja ku keni kodin e autorizimit që ju duhet: { $unblockCode }
unblockCode-report = Nëse jo, ndihmonani të mbajmë jashtë të padëshiruarit dhe <a data-l10n-name="reportSignInLink">na e raportoni këtë.</a>
unblockCode-report-plaintext = Nëse jo, na ndihmoni të mbajmë jashtë të padëshiruarit dhe raportojeni këtë te ne.
verificationReminderFinal-subject = Kujtuesi i fundit për të ripohuar llogarinë tuaj
verificationReminderFinal-description-2 = Nja dy javë më parë krijuat një { -product-mozilla-account }, por s’e ripohuat kurrë këtë. Për sigurinë tuaj, do ta fshijmë llogarinë, po s’u verifikua brenda 24 orëve të ardhshme.
confirm-account = Ripohoni llogarinë
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Mos harroni të ripohoni llogarinë tuaj
verificationReminderFirst-title-3 = Mirë se vini në { -brand-mozilla }!
verificationReminderFirst-description-3 = Ca ditë më parë krijuat një { -product-mozilla-account }, por s’e ripohuat kurrë këtë. Ju lutemi, ripohoni llogarinë tuaj brenda 15 ditëve të ardhshme, ose do të fshihet automatikisht.
verificationReminderFirst-sub-description-3 = Mos humbi lajme nga shfletuesi që vë ju dhe privatësinë tuaj mbi të gjitha.
confirm-email-2 = Ripohoni llogarinë
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Ripohoni llogarinë
verificationReminderSecond-subject-2 = Mos harroni të ripohoni llogarinë tuaj
verificationReminderSecond-title-3 = Mos humbni lajmet mbi { -brand-mozilla }-n!
verificationReminderSecond-description-4 = Ca ditë më parë krijuat një { -product-mozilla-account }, por s’e ripohuat kurrë këtë. Ju lutemi, ripohoni llogarinë tuaj brenda 10 ditëve të ardhshme, ose do të fshihet automatikisht.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } juaj ju lejon të njëkohësoni punimin tuaj me { -brand-firefox }nëpër pajisje dhe shkyç portën për më tepër produkte { -brand-mozilla } që mbrojnë privatësinë.
verificationReminderSecond-sub-description-2 = Bëhuni pjesë e misionit tonë për të shndërruar internetin në një vend që është i hapët për këdo.
verificationReminderSecond-action-2 = Ripohoni llogarinë
verify-title-3 = Hapeni internetin me { -brand-mozilla }
verify-description-2 = Ripohoni llogarinë tuaj dhe përfitoni maksimumin nga { -brand-mozilla }-i, nga kudo që bëni hyrjen në llogarinë tuaj duke filluar me:
verify-subject = Përfundoni krijimin e llogarisë tuaj
verify-action-2 = Ripohoni llogarinë
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Përdorni { $code } që të ndryshoni llogarinë tuaj
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ky kod skadon për { $expirationTime } minutë.
       *[other] Ky kod skadon për { $expirationTime } minuta.
    }
verifyAccountChange-title = Po ndryshoni hollësi të llogarisë tuaj?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Ndihmonani ta mbajmë të parrezik llogarinë tuaj, duke miratuar këtë ndryshim te:
verifyAccountChange-prompt = Nëse po, ja kodi juaj i autorizimit:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Skadon për { $expirationTime } minutë.
       *[other] Skadon për { $expirationTime } minuta.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = A bëtë hyrjen te { $clientName }?
verifyLogin-description-2 = Ndihmonani ta mbajmë llogarinë tuaj të parrezik, duke ripohuar se keni hyrë në:
verifyLogin-subject-2 = Ripohoni hyrjen
verifyLogin-action = Ripohoni hyrjen
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Që të bëni hyrjen, përdorni { $code }
verifyLoginCode-preview = Ky kod skadon për 5 minuta.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = A bëtë hyrjen te { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ndihmonani ta mbajmë llogarinë tuaj të parrezik, duke miratuar hyrjen në:
verifyLoginCode-prompt-3 = Nëse po, ja kodi juaj i autorizimit:
verifyLoginCode-expiry-notice = Skadon për 5 minuta.
verifyPrimary-title-2 = Ripohoni email parësor
verifyPrimary-description = Nga pajisja vijuese u bë një kërkesë për kryerjen e një ndryshimi llogarie:
verifyPrimary-subject = Ripohoni email parësor
verifyPrimary-action-2 = Ripohoni email-in
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Pasi të jetë ripohuar, prej kësaj pajisje do të jenë të mundshme ndryshime llogarie, të tillë si shtimi i një email-i dytësor.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Përdorni { $code } që të ripohoni email-in tuaj dytësor
verifySecondaryCode-preview = Ky kod skadon për 5 minuta.
verifySecondaryCode-title-2 = Ripohoni email dytësor
verifySecondaryCode-action-2 = Ripohoni email-in
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Prej llogarisë vijuese { -product-mozilla-account } është bërë një kërkesë për të përdorur { $email } si një adresë dytësore email:
verifySecondaryCode-prompt-2 = Përdor këtë kod ripohimi:
verifySecondaryCode-expiry-notice-2 = Skadon për 5 minuta. Pas ripohimit, kjo adresë do të fillojë të marrë njoftime sigurie dhe ripohime.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Përdorni { $code } që të ripohoni llogarinë tuaj
verifyShortCode-preview-2 = Ky kod skadon për 5 minuta
verifyShortCode-title-3 = Hapeni internetin me { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Ripohoni llogarinë tuaj dhe përfitoni maksimumin nga { -brand-mozilla }-i, nga kudo që bëni hyrjen në llogarinë tuaj duke filluar me:
verifyShortCode-prompt-3 = Përdor këtë kod ripohimi:
verifyShortCode-expiry-notice = Skadon për 5 minuta.
