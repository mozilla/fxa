## Non-email strings

session-verify-send-push-title-2 = Se prijavljate v { -product-mozilla-account(sklon: "tozilnik") }?
session-verify-send-push-body-2 = Kliknite tukaj za potrditev, da ste to vi
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } je vaša potrditvena koda za račun { -brand-mozilla }. Poteče čez 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Potrditvena koda za račun { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } je vaša obnovitvena koda za račun { -brand-mozilla }. Poteče čez 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Koda za račun { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } je vaša obnovitvena koda za račun { -brand-mozilla }. Poteče čez 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Koda za račun { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logotip { -brand-mozilla(sklon: "rodilnik") }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sinhronizirajte naprave">
body-devices-image = <img data-l10n-name="devices-image" alt="Naprave">
fxa-privacy-url = Politika zasebnosti { -brand-mozilla(sklon: "rodilnik") }
moz-accounts-privacy-url-2 = Obvestilo o zasebnosti { -product-mozilla-accounts(sklon: "rodilnik") }
moz-accounts-terms-url = Pogoji uporabe { -product-mozilla-accounts(sklon: "rodilnik") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logotip { -brand-mozilla(sklon: "rodilnik") }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logotip { -brand-mozilla(sklon: "rodilnik") }">
subplat-automated-email = Sporočilo je bilo poslano samodejno. Če ste ga prejeli po pomoti, vam ni potrebno storiti ničesar.
subplat-privacy-notice = Obvestilo o zasebnosti
subplat-privacy-plaintext = Obvestilo o zasebnosti:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = To sporočilo ste prejeli, ker je na { $email } registriran { -product-mozilla-account } in ste se naročili na { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = To sporočilo ste prejeli, ker je na { $email } registriran { -product-mozilla-account }.
subplat-explainer-multiple-2 = To sporočilo ste prejeli, ker je na { $email } registriran { -product-mozilla-account } in ste naročeni na več izdelkov.
subplat-explainer-was-deleted-2 = To sporočilo ste prejeli, ker je bil na { $email } registriran { -product-mozilla-account }.
subplat-manage-account-2 = Upravljajte nastavitve { -product-mozilla-account(sklon: "rodilnik") } na <a data-l10n-name="subplat-account-page">strani svojega računa</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Upravljajte nastavitve { -product-mozilla-account(sklon: "rodilnik") } na strani svojega računa: { $accountSettingsUrl }
subplat-terms-policy = Pogoji in pravila odpovedi
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Prekliči naročnino
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Obnovi naročnino
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Posodobi podatke za obračun
subplat-privacy-policy = Politika zasebnosti { -brand-mozilla(sklon: "rodilnik") }
subplat-privacy-policy-2 = Obvestilo o zasebnosti { -product-mozilla-accounts(sklon: "rodilnik") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Pogoji uporabe { -product-mozilla-accounts(sklon: "rodilnik") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Pravne informacije
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Zasebnost
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Če bo vaš račun izbrisan, boste še vedno prejemali e-pošto od Mozilla Corporation in Mozilla Foundation, razen če <a data-l10n-name="unsubscribeLink">se odjavite</a>.
account-deletion-info-block-support = Če imate kakršnakoli vprašanja ali potrebujete pomoč, se obrnite na našo <a data-l10n-name="supportLink">ekipo za podporo</a>.
account-deletion-info-block-communications-plaintext = Če bo vaš račun izbrisan, boste še vedno prejemali e-pošto od Mozilla Corporation in Mozilla Foundation, razen če se odjavite:
account-deletion-info-block-support-plaintext = Če imate kakršnakoli vprašanja ali potrebujete pomoč, se obrnite na našo ekipo za podporo:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Prenesite { $productName } iz trgovine { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Prenesite { $productName } iz trgovine { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Namestite { $productName } na <a data-l10n-name="anotherDeviceLink">drugo namizno napravo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Namestite { $productName } na <a data-l10n-name="anotherDeviceLink">drugo napravo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Prenesite { $productName } z Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Prenesite { $productName } iz App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Namestite { $productName } na drugo napravo:
automated-email-change-2 = Če tega niste storili vi, takoj <a data-l10n-name="passwordChangeLink">spremenite geslo</a>.
automated-email-support = Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Če tega niste storili vi, takoj spremenite geslo:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Za več informacij obiščite Podporo { -brand-mozilla }:
automated-email-inactive-account = To je samodejno sporočilo. Prejeli ste ga, ker imate { -product-mozilla-account } in sta minili 2 leti, odkar ste bili nazadnje prijavljeni vanj.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
automated-email-no-action-plaintext = To sporočilo je bilo poslano samodejno. Če ste ga prejeli pomotoma, vam ni treba storiti ničesar.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = To je samodejno sporočilo. Če niste sprožili tega dejanja, spremenite geslo:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Ta zahteva je prišla iz brskalnika { $uaBrowser } v sistemu { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Ta zahteva je prišla iz brskalnika { $uaBrowser } v sistemu { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Ta zahteva je prišla iz brskalnika { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Ta zahteva je prišla iz sistema { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Ta zahteva je prišla iz sistema { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Če to niste bili vi, <a data-l10n-name="revokeAccountRecoveryLink">izbrišite nov ključ</a> in <a data-l10n-name="passwordChangeLink">spremenite svoje geslo</a>.
automatedEmailRecoveryKey-change-pwd-only = Če to niste bili vi, <a data-l10n-name="passwordChangeLink">spremenite svoje geslo</a>.
automatedEmailRecoveryKey-more-info = Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Ta zahteva prihaja iz:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Če to niste bili vi, izbrišite nov ključ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Če to niste bili vi, spremenite svoje geslo:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = in spremenite geslo:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Za več informacij obiščite Podporo { -brand-mozilla }:
automated-email-reset =
    To je samodejno sporočilo. Če niste sprožili tega dejanja, <a data-l10n-name="resetLink">ponastavite svoje geslo</a>.
    Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Če tega dejanja niste sprožili vi, takoj ponastavite geslo na { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Če tega niste storili vi, takoj <a data-l10n-name="resetLink">ponastavite geslo</a> in <a data-l10n-name="twoFactorSettingsLink">ponastavite overjanje v dveh korakih</a>. Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Če tega dejanja niste storili vi, takoj ponastavite geslo:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Ponastavite tudi overitev v dveh korakih:
brand-banner-message = Ali ste vedeli, da smo se preimenovali iz { -product-firefox-accounts } v { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Več o tem</a>
cancellationSurvey = Pomagajte nam izboljšati naše storitve, tako da izpolnite to <a data-l10n-name="cancellationSurveyUrl">kratko anketo</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Pomagajte nam izboljšati naše storitve, tako da izpolnite to kratko anketo.
change-password-plaintext = Če slutite, da nekdo poskuša pridobiti dostop do vašega računa, spremenite geslo.
manage-account = Upravljanje računa
manage-account-plaintext = { manage-account }:
payment-details = Podatki o plačilu:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Številka računa: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Zaračunano: { $invoiceTotal } dne { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Naslednji račun: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Način plačila:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Način plačila: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Plačilno sredstvo: { $cardName }, ki se končuje s { $lastFour }
payment-provider-card-ending-in-plaintext = Plačilno sredstvo: kartica, ki se končuje s { $lastFour }
payment-provider-card-ending-in = <b>Plačilno sredstvo:</b> kartica, ki se končuje s { $lastFour }
payment-provider-card-ending-in-card-name = <b>Plačilno sredstvo:</b> { $cardName }, ki se končuje s { $lastFour }
subscription-charges-invoice-summary = Povzetek računa

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Številka računa:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Številka računa: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Sorazmerna cena
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Sorazmerna cena: { $remainingAmountTotal }
subscription-charges-list-price = Redna cena
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Redna cena: { $offeringPrice }
subscription-charges-credit-from-unused-time = Dobropis neizkoriščenega časa
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Dobropis od neuporabljenega časa: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Vmesna vsota</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Vmesni seštevek: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Enkratni popust
subscription-charges-one-time-discount-plaintext = Enkratni popust: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-mesečni popust
        [two] { $discountDuration }-mesečni popust
        [few] { $discountDuration }-mesečni popust
       *[other] { $discountDuration }-mesečni popust
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
        [two] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
        [few] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-mesečni popust: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Popust
subscription-charges-discount-plaintext = Popust: { $invoiceDiscountAmount }
subscription-charges-taxes = Davki in pristojbine
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Davki in pristojbine: { $invoiceTaxAmount }
subscription-charges-total = <b>Skupaj</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Skupaj: { $invoiceTotal }
subscription-charges-credit-applied = Dobropis uveljavljen
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Uporabljeno dobro: { $creditApplied }
subscription-charges-amount-paid = <b>Plačan znesek</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Plačan znesek: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Prejeli ste dobroimetje { $creditReceived }, ki se bo uporabljalo pri vaših prihodnjih računih.

##

subscriptionSupport = Imate vprašanja o svoji naročnini? Naša <a data-l10n-name="subscriptionSupportUrl">ekipa za podporo</a> je tu, da vam pomaga.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Imate vprašanja o vaši naročnini? Naša ekipa za podporo je tu, da vam pomaga:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Hvala, ker ste se naročili na { $productName }. Če imate kakršnakoli vprašanja o naročnini ali če potrebujete več informacij o { $productName }, <a data-l10n-name="subscriptionSupportUrl">nam pišite</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Hvala, ker ste se naročili na { $productName }. Če imate kakršnakoli vprašanja o naročnini ali če potrebujete več informacij o { $productName }, nam pišite:
subscription-support-get-help = Poiščite pomoč za svojo naročnino
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Upravljanje naročnine</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Upravljajte naročnino:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Obrnite se na podporo</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Stopite v stik s podporo:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Tukaj</a> lahko poskrbite, da so vaš način plačila in podatki o računu posodobljeni.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tukaj lahko poskrbite, da so vaš način plačila in podatki o računu posodobljeni:
subscriptionUpdateBillingTry = Plačilo bomo znova poskusili izvesti v naslednjih dneh, vendar nam boste morda morali pomagati odpraviti težavo tako, da <a data-l10n-name="updateBillingUrl">posodobite podatke za plačilo</a>:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Plačilo bomo znova poskusili izvesti v naslednjih dneh, vendar nam boste morda morali pomagati odpraviti težavo tako, da posodobite podatke za plačilo:
subscriptionUpdatePayment = Da preprečite kakršnokoli prekinitev storitve, čim prej <a data-l10n-name="updateBillingUrl">posodobite svoje podatke za plačilo</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Da preprečite kakršnokoli prekinitev storitve, čim prej posodobite svoje podatke za plačilo:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Za več informacij obiščite <a data-l10n-name="supportLink">Podporo { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Za več informacij obiščite Podporo { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } v sistemu { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } v sistemu { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (ocena)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (ocena)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (ocena)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (ocena)
view-invoice-link-action = Ogled računa
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Prikaži račun: { $invoiceLink }
cadReminderFirst-subject-1 = Opomnik! Sinhronizirajmo { -brand-firefox }
cadReminderFirst-action = Sinhroniziraj drugo napravo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Za sinhronizacijo sta potrebna dva
cadReminderFirst-description-v2 = Uporabljajte svoje zavihke v vseh svojih napravah. Imejte svoje zaznamke, gesla in druge podatke povsod, kjer uporabljate { -brand-firefox }.
cadReminderSecond-subject-2 = Ne zamudite dogajanja! Končajmo nastavitev sinhronizacije
cadReminderSecond-action = Sinhroniziraj drugo napravo
cadReminderSecond-title-2 = Ne pozabite na sinhronizacijo!
cadReminderSecond-description-sync = Sinhronizirajte svoje zaznamke, gesla in ostale podatke – povsod, kjer uporabljate { -brand-firefox }.
cadReminderSecond-description-plus = Poleg tega so vaši podatki vedno šifrirani. Vidite jih lahko samo vi in naprave, ki jih odobrite.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Dobrodošli v { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Dobrodošli v { $productName }
downloadSubscription-content-2 = Začnimo uporabljati vse funkcije, vključene v vašo naročnino:
downloadSubscription-link-action-2 = Začnite
fraudulentAccountDeletion-subject-2 = Vaš { -product-mozilla-account } je bil izbrisan
fraudulentAccountDeletion-title = Vaš račun je bil izbrisan
fraudulentAccountDeletion-content-part1-v2 = Pred kratkim je bil na ta e-poštni naslov ustvarjen { -product-mozilla-account } in zaračunana naročnina. Kot to storimo z vsemi novimi računi, smo vas prosili, da svoj račun potrdite s potrditvijo tega e-poštnega naslova.
fraudulentAccountDeletion-content-part2-v2 = Trenutno vidimo, da račun ni bil nikoli potrjen. Ker ta korak ni bil opravljen, nismo prepričani, ali ste to naročnino resnično nakazali vi. Zato je bil { -product-mozilla-account }, registriran na ta e-poštni naslov, izbrisan, naročnina pa preklicana, pri čemer so bili vsi stroški povrnjeni.
fraudulentAccountDeletion-contact = Če imate kakršnakoli vprašanja, se obrnite na našo <a data-l10n-name="mozillaSupportUrl">skupino za podporo</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Če imate kakršnakoli vprašanja, se obrnite na našo skupino za podporo: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Zadnja priložnost, da obdržite svoj { -product-mozilla-account(sklon: "tozilnik") }
inactiveAccountFinalWarning-title = Vaš račun { -brand-mozilla } in podatki bodo izbrisani
inactiveAccountFinalWarning-preview = Prijavite se, če želite obdržati račun
inactiveAccountFinalWarning-account-description = { -product-mozilla-account(zacetnica: "velika") } vam daje dostop do brezplačnih izdelkov za zasebnost in brskanje, kot so sinhronizacija { -brand-firefox(sklon: "rodilnik") }, { -product-mozilla-monitor }, { -product-firefox-relay } in { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> bodo vaš račun in osebni podatki trajno izbrisani, razen če se prijavite vanj.
inactiveAccountFinalWarning-action = Prijavite se, če želite obdržati račun
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Prijavite se, če želite obdržati račun:
inactiveAccountFirstWarning-subject = Ne izgubite računa
inactiveAccountFirstWarning-title = Želite obdržati račun { -brand-mozilla } in podatke?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account(zacetnica: "velika") } vam daje dostop do brezplačnih izdelkov za zasebnost in brskanje, kot so sinhronizacija { -brand-firefox(sklon: "rodilnik") }, { -product-mozilla-monitor }, { -product-firefox-relay } in { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Opazili smo, da se niste prijavili že dve leti.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Zaradi nedejavnosti bo vaš račun in osebni podatki <strong>{ $deletionDate }</strong> trajno izbrisani.
inactiveAccountFirstWarning-action = Prijavite se, če želite obdržati račun
inactiveAccountFirstWarning-preview = Prijavite se, če želite obdržati račun
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Prijavite se, če želite obdržati račun:
inactiveAccountSecondWarning-subject = Potrebno je ukrepanje: račun bo čez 7 dni izbrisan
inactiveAccountSecondWarning-title = Vaš račun { -brand-mozilla } in podatki v njem bodo po 7 dneh izbrisani
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account(zacetnica: "velika") } vam daje dostop do brezplačnih izdelkov za zasebnost in brskanje, kot so sinhronizacija { -brand-firefox(sklon: "rodilnik") }, { -product-mozilla-monitor }, { -product-firefox-relay } in { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Zaradi nedejavnosti bodo vaš račun in osebni podatki <strong>{ $deletionDate }</strong> trajno izbrisani.
inactiveAccountSecondWarning-action = Prijavite se, če želite obdržati račun
inactiveAccountSecondWarning-preview = Prijavite se, če želite obdržati račun
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Prijavite se, če želite obdržati račun:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Zmanjkalo vam je rezervnih overitvenih kod!
codes-reminder-title-one = Ostala vam je le še ena rezervna overitvena koda
codes-reminder-title-two = Čas, da ustvarite več rezervnih overitvenih kod
codes-reminder-description-part-one = Rezervne overitvene kode vam omogočajo obnovitev podatkov v primeru, da pozabite geslo.
codes-reminder-description-part-two = Ustvarite nove kode zdaj, da ne bi pozneje izgubili podatkov.
codes-reminder-description-two-left = Ostali sta vam le še dve kodi.
codes-reminder-description-create-codes = Ustvarite nove rezervne overitvene kode, s katerimi se boste lahko vrnili v račun, če boste zaklenjeni iz njega.
lowRecoveryCodes-action-2 = Ustvari kode
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nimate več rezervnih overitvenih kod
        [one] Imate samo še 1 rezervno overitveno kodo
        [two] Imate samo še { $numberRemaining } rezervni overitveni kodi
        [few] Imate samo še { $numberRemaining } rezervne overitvene kode
       *[other] Imate samo še { $numberRemaining } rezervnih overitvenih kod
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nova prijava v { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nova prijava v { -product-mozilla-account }
newDeviceLogin-title-3 = Vaš { -product-mozilla-account } je bil uporabljen za prijavo
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Niste bili vi? <a data-l10n-name="passwordChangeLink">Spremenite geslo</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Niste bili vi? Spremenite geslo:
newDeviceLogin-action = Upravljanje računa
passwordChanged-subject = Geslo posodobljeno
passwordChanged-title = Geslo uspešno spremenjeno
passwordChanged-description-2 = Geslo vašega { -product-mozilla-account(sklon: "rodilnik") } je bilo uspešno spremenjeno iz naslednje naprave:
passwordChangeRequired-subject = Odkrita sumljiva aktivnost
passwordChangeRequired-preview = Takoj spremenite geslo
passwordChangeRequired-title-2 = Ponastavite geslo
passwordChangeRequired-suspicious-activity-3 = Vaš račun smo zaklenili, da bi ga zaščitili pred sumljivo dejavnostjo. Odjavljeni ste bili iz vseh naprav in vsi sinhronizirani podatki so bili preventivno izbrisani.
passwordChangeRequired-sign-in-3 = Če se želite znova prijaviti v svoj račun, morate samo ponastaviti geslo.
passwordChangeRequired-different-password-2 = <b>Pomembno:</b> Izberite močno geslo, različno od dosedanjih.
passwordChangeRequired-different-password-plaintext-2 = Pomembno: Izberite močno geslo, različno od dosedanjih.
passwordChangeRequired-action = Ponastavi geslo
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Za spremembo gesla uporabite kodo { $code }
password-forgot-otp-preview = Koda poteče čez 10 minut
password-forgot-otp-title = Ste pozabili geslo?
password-forgot-otp-request = Prejeli smo zahtevo za spremembo gesla vašega { -product-mozilla-account(sklon: "rodilnik") } z:
password-forgot-otp-code-2 = Če ste to bili vi, je tu potrditvena koda za nadaljevanje:
password-forgot-otp-expiry-notice = Ta koda poteče čez 10 minut.
passwordReset-subject-2 = Vaše geslo je bilo ponastavljeno
passwordReset-title-2 = Vaše geslo je bilo ponastavljeno
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Ponastavili ste geslo { -product-mozilla-account(sklon: "rodilnik") } z naslednje naprave:
passwordResetAccountRecovery-subject-2 = Vaše geslo je bilo ponastavljeno
passwordResetAccountRecovery-title-3 = Vaše geslo je bilo ponastavljeno
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Z uporabo ključa za obnovitev računa ste ponastavili geslo { -product-mozilla-account(sklon: "rodilnik") } z naslednje naprave:
passwordResetAccountRecovery-information = Odjavili smo vas iz vseh sinhroniziranih naprav. Ustvarili smo nov ključ za obnovitev računa, ki je nadomestil uporabljenega dosedanjega. Lahko ga spremenite v nastavitvah računa.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Odjavili smo vas iz vseh sinhroniziranih naprav. Ustvarili smo nov ključ za obnovitev računa, ki je nadomestil uporabljenega dosedanjega. Lahko ga spremenite v nastavitvah računa:
passwordResetAccountRecovery-action-4 = Upravljanje računa
passwordResetRecoveryPhone-subject = Uporabljena je telefonska številka za obnovitev
passwordResetRecoveryPhone-preview = Preverite, ali ste to bili vi
passwordResetRecoveryPhone-title = Za potrditev ponastavitve gesla je bila uporabljena vaša obnovitvena telefonska številka
passwordResetRecoveryPhone-device = Uporabljena obnovitvena telefonska številka od:
passwordResetRecoveryPhone-action = Upravljanje računa
passwordResetWithRecoveryKeyPrompt-subject = Vaše geslo je bilo ponastavljeno
passwordResetWithRecoveryKeyPrompt-title = Vaše geslo je bilo ponastavljeno
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Ponastavili ste geslo { -product-mozilla-account(sklon: "rodilnik") } z naslednje naprave:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Ustvari ključ za obnovitev računa
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Ustvari ključ za obnovitev računa:
passwordResetWithRecoveryKeyPrompt-cta-description = V vseh sinhroniziranih napravah se boste morali znova prijaviti. Naslednjič svoje podatke ohranite varne s ključem za obnovitev računa, ki v primeru, da pozabite geslo, omogoča obnovitev podatkov.
postAddAccountRecovery-subject-3 = Nov ključ za obnovitev računa ustvarjen
postAddAccountRecovery-title2 = Ustvarili ste nov ključ za obnovitev računa
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Ta ključ shranite na varno mesto – potrebovali ga boste za obnovitev šifriranih podatkov brskanja, če pozabite geslo.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Ta ključ je mogoče uporabiti samo enkrat. Ko ga porabite, vam bomo samodejno ustvarili novega. Lahko pa kadar koli ustvarite novega v nastavitvah računa.
postAddAccountRecovery-action = Upravljanje računa
postAddLinkedAccount-subject-2 = Nov račun povezan z vašim { -product-mozilla-account(sklon: "orodnik") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Vaš račun { $providerName } se je povezal z vašim { -product-mozilla-account(sklon: "orodnik") }
postAddLinkedAccount-action = Upravljanje računa
postAddRecoveryPhone-subject = Telefonska številka za obnovitev je dodana
postAddRecoveryPhone-preview = Račun je zaščiten s overjanjem v dveh korakih
postAddRecoveryPhone-title-v2 = Dodali ste telefonsko številko za obnovitev
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = { $maskedLastFourPhoneNumber } ste dodali kot telefonsko številko za obnovitev
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Kako to ščiti vaš račun
postAddRecoveryPhone-how-protect-plaintext = Kako to ščiti vaš račun:
postAddRecoveryPhone-enabled-device = Omogočili ste jo z naslednje naprave:
postAddRecoveryPhone-action = Upravljanje računa
postAddTwoStepAuthentication-preview = Vaš račun je zaščiten
postAddTwoStepAuthentication-subject-v3 = Overitev v dveh korakih je vklopljena
postAddTwoStepAuthentication-title-2 = Vklopili ste overitev v dveh korakih
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = To ste zahtevali z naslednje naprave:
postAddTwoStepAuthentication-action = Upravljanje računa
postAddTwoStepAuthentication-code-required-v4 = Varnostne kode iz vaše aplikacije za overjanje se bodo odslej zahtevale ob vsaki prijavi.
postAddTwoStepAuthentication-recovery-method-codes = Kot metodo za obnovitev ste dodali tudi rezervne overitvene kode.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Kot telefonsko številko za obnovitev ste dodali tudi { $maskedPhoneNumber }.
postAddTwoStepAuthentication-how-protects-link = Kako to ščiti vaš račun
postAddTwoStepAuthentication-how-protects-plaintext = Kako to ščiti vaš račun:
postAddTwoStepAuthentication-device-sign-out-message = Za zaščito vseh povezanih naprav se odjavite povsod, kjer uporabljate ta račun, in se nato prijavite nazaj s pomočjo overjanja v dveh korakih.
postChangeAccountRecovery-subject = Ključ za obnovitev računa spremenjen
postChangeAccountRecovery-title = Spremenili ste ključ za obnovitev računa
postChangeAccountRecovery-body-part1 = Zdaj imate nov ključ za obnovitev računa. Vaš prejšnji ključ je bil izbrisan.
postChangeAccountRecovery-body-part2 = Shranite ta novi ključ na varno mesto – potrebovali ga boste za obnovitev šifriranih podatkov brskanja, če pozabite geslo.
postChangeAccountRecovery-action = Upravljanje računa
postChangePrimary-subject = Glavni e-poštni naslov posodobljen
postChangePrimary-title = Nov glavni e-poštni naslov
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Uspešno ste spremenili glavni e-poštni naslov na { $email }. Ta e-poštni naslov je zdaj vaše uporabniško ime za prijavo v { -product-mozilla-account(sklon: "tozilnik") }, kot tudi naslov za prejemanje varnostnih obvestil ter
postChangePrimary-action = Upravljanje računa
postChangeRecoveryPhone-subject = Telefonska številka za obnovitev je posodobljena
postChangeRecoveryPhone-preview = Račun je zaščiten s overjanjem v dveh korakih
postChangeRecoveryPhone-title = Spremenili ste telefonsko številko za obnovitev
postChangeRecoveryPhone-description = Zdaj imate novo telefonsko številko za obnovitev. Prejšnja številka je bila izbrisana.
postChangeRecoveryPhone-requested-device = To ste zahtevali z naslednje naprave:
postChangeTwoStepAuthentication-preview = Vaš račun je zaščiten
postChangeTwoStepAuthentication-subject = Overjanje v dveh korakih ponovno nastavljeno
postChangeTwoStepAuthentication-title = Overjanje v dveh korakih je bilo ponovno nastavljeno
postChangeTwoStepAuthentication-use-new-account = Odslej morate v aplikaciji za overitev uporabljati nov vnos { -product-mozilla-account }. Dosedanji ne bo več deloval in ga lahko odstranite.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = To ste zahtevali z naslednje naprave:
postChangeTwoStepAuthentication-action = Upravljanje računa
postChangeTwoStepAuthentication-how-protects-link = Kako to ščiti vaš račun
postChangeTwoStepAuthentication-how-protects-plaintext = Kako to ščiti vaš račun:
postChangeTwoStepAuthentication-device-sign-out-message = Za zaščito vseh povezanih naprav se odjavite povsod, kjer uporabljate ta račun, in se nato prijavite z novim overjanjem v dveh korakih.
postConsumeRecoveryCode-title-3 = Za potrditev ponastavitve gesla je bila uporabljena vaša rezervna overitvena koda
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Uporabljena koda iz:
postConsumeRecoveryCode-action = Upravljanje računa
postConsumeRecoveryCode-subject-v3 = Rezervna overitvena koda je bila uporabljena
postConsumeRecoveryCode-preview = Preverite, ali ste to bili vi
postNewRecoveryCodes-subject-2 = Ustvarjene nove rezervne overitvene kode
postNewRecoveryCodes-title-2 = Ustvarili ste nove rezervne overitvene kode
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Ustvarjene so bile na naslednji napravi:
postNewRecoveryCodes-action = Upravljanje računa
postRemoveAccountRecovery-subject-2 = Ključ za obnovitev računa izbrisan
postRemoveAccountRecovery-title-3 = Izbrisali ste ključ za obnovitev računa
postRemoveAccountRecovery-body-part1 = Ključ za obnovitev računa je potreben za obnovitev šifriranih podatkov brskanja, če pozabite geslo.
postRemoveAccountRecovery-body-part2 = Če tega še niste storili, v nastavitvah računa ustvarite nov obnovitveni ključ in preprečite izgubo shranjenih gesel, zaznamkov, zgodovine brskanja in drugega.
postRemoveAccountRecovery-action = Upravljanje računa
postRemoveRecoveryPhone-subject = Telefonska številka za obnovitev je odstranjena
postRemoveRecoveryPhone-preview = Račun je zaščiten s overjanjem v dveh korakih
postRemoveRecoveryPhone-title = Telefonska številka za obnovitev je odstranjena
postRemoveRecoveryPhone-description-v2 = Vaša telefonska številka za obnovitev je bila odstranjena iz nastavitev overjanja v dveh korakih.
postRemoveRecoveryPhone-description-extra = Za prijavo lahko še vedno uporabite rezervne overitvene kode, če ne morete uporabiti aplikacije za overitev.
postRemoveRecoveryPhone-requested-device = To ste zahtevali z naslednje naprave:
postRemoveSecondary-subject = Pomožni e-poštni naslov odstranjen
postRemoveSecondary-title = Pomožni e-poštni naslov odstranjen
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Uspešno ste odstranili { $secondaryEmail } kot pomožni e-poštni naslov svojega { -product-mozilla-account(sklon: "rodilnik") }. Varnostnih obvestil in potrditev prijav ne bomo več pošiljali na ta naslov.
postRemoveSecondary-action = Upravljanje računa
postRemoveTwoStepAuthentication-subject-line-2 = Overitev v dveh korakih izklopljena
postRemoveTwoStepAuthentication-title-2 = Izklopili ste overitev v dveh korakih
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Onemogočili ste jo z naslednje naprave:
postRemoveTwoStepAuthentication-action = Upravljanje računa
postRemoveTwoStepAuthentication-not-required-2 = Ob prijavi ne potrebujete več varnostnih kod iz aplikacije za preverjanje pristnosti.
postSigninRecoveryCode-subject = Rezervna overitvena koda je bila uporabljena za prijavo
postSigninRecoveryCode-preview = Potrdite dejavnost v računu
postSigninRecoveryCode-title = Za prijavo je bila uporabljena vaša rezervna overitvena koda
postSigninRecoveryCode-description = Če tega niste storili vi, takoj spremenite geslo, da zavarujete račun.
postSigninRecoveryCode-device = Prijavili ste se iz:
postSigninRecoveryCode-action = Upravljanje računa
postSigninRecoveryPhone-subject = Obnovitvena telefonska številka je bila uporabljena za prijavo
postSigninRecoveryPhone-preview = Potrdite dejavnost v računu
postSigninRecoveryPhone-title = Vaša obnovitvena telefonska številka je bila uporabljena za prijavo
postSigninRecoveryPhone-description = Če tega niste storili vi, takoj spremenite geslo, da zavarujete račun.
postSigninRecoveryPhone-device = Prijavili ste se iz:
postSigninRecoveryPhone-action = Upravljanje računa
postVerify-sub-title-3 = Veseli nas, da vas vidimo!
postVerify-title-2 = Želite imeti isti zavihek na dveh napravah?
postVerify-description-2 = Preprosto je! Samo namestite { -brand-firefox } na drugo napravo in se prijavite v sinhronizacijo. Kot čarovnija!
postVerify-sub-description = (Ššš … to pomeni tudi, da vam bodo vaši zaznamki, gesla in ostali podatki { -brand-firefox(sklon: "rodilnik") } dostopni povsod, kjer se boste prijavili.)
postVerify-subject-4 = Dobrodošli pri { -brand-mozilla(sklon: "mestnik") }!
postVerify-setup-2 = Povežite drugo napravo:
postVerify-action-2 = Poveži drugo napravo
postVerifySecondary-subject = Pomožni e-poštni naslov dodan
postVerifySecondary-title = Pomožni e-poštni naslov dodan
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Uspešno ste potrdili { $secondaryEmail } kot pomožni e-poštni naslov svojega { -product-mozilla-account(sklon: "rodilnik") }. Varnostna obvestila in potrditve prijav se bodo zdaj pošiljale na oba naslova.
postVerifySecondary-action = Upravljanje računa
recovery-subject = Ponastavite vaše geslo
recovery-title-2 = Ali ste pozabili geslo?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Prejeli smo zahtevo za spremembo gesla vašega { -product-mozilla-account(sklon: "rodilnik") } z:
recovery-new-password-button = Ustvarite novo geslo s klikom na spodnji gumb. Ta povezava bo potekla v naslednji uri.
recovery-copy-paste = Ustvarite novo geslo na spodnjem naslovu, ki ga kopirajte in prilepite v brskalnik. Ta povezava bo potekla v naslednji uri.
recovery-action = Ustvarite novo geslo
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Vaša naročnina za { $productName } je preklicana
subscriptionAccountDeletion-title = Žal nam je, ker odhajate
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Pred kratkim ste izbrisali svoj { -product-mozilla-account }. Zaradi tega smo preklicali vašo naročnino na { $productName }. Vaše zadnje plačilo { $invoiceTotal } je bilo nakazano { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Dobrodošli v { $productName }: Nastavite si geslo.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Dobrodošli v { $productName }
subscriptionAccountFinishSetup-content-processing = Vaše plačilo je v obdelavi, ki lahko traja do štiri delovne dni. Vaša naročnina se bo samodejno obnovila vsako obračunsko obdobje, razen če se odločite za preklic.
subscriptionAccountFinishSetup-content-create-3 = Nato ustvarite geslo za { -product-mozilla-account(sklon: "tozilnik") }, da začnete uporabljati novo naročnino.
subscriptionAccountFinishSetup-action-2 = Začnite
subscriptionAccountReminderFirst-subject = Opomnik: Dokončajte nastavljanje računa
subscriptionAccountReminderFirst-title = Dostop do vaše naročnine še ni možen
subscriptionAccountReminderFirst-content-info-3 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Upamo, da boste dokončali nastavitev računa in si omogočili uporabo naročnine.
subscriptionAccountReminderFirst-content-select-2 = Izberite "Ustvari geslo", da nastavite novo geslo in dokončate potrjevanje računa.
subscriptionAccountReminderFirst-action = Ustvari geslo
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Zadnji opomnik: Nastavite svoj račun
subscriptionAccountReminderSecond-title-2 = Dobrodošli pri { -brand-mozilla(sklon: "mestnik") }!
subscriptionAccountReminderSecond-content-info-3 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Upamo, da boste dokončali nastavitev računa in si omogočili uporabo naročnine.
subscriptionAccountReminderSecond-content-select-2 = Izberite "Ustvari geslo", da nastavite novo geslo in dokončate potrjevanje računa.
subscriptionAccountReminderSecond-action = Ustvari geslo
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Vaša naročnina za { $productName } je preklicana
subscriptionCancellation-title = Žal nam je, ker odhajate

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Preklicali smo vašo naročnino na { $productName }. Vaše zadnje plačilo { $invoiceTotal } je bilo nakazano { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Preklicali smo vašo naročnino na { $productName }. Vaše zadnje plačilo { $invoiceTotal } bo nakazano { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Vaša storitev bo na voljo do konca trenutnega obračunskega obdobja, ki je { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Preklopili ste na { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Uspešno ste preklopili z { $productNameOld } na { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Od naslednjega računa naprej se bo vaša cena spremenila iz { $paymentAmountOld } na { $productPaymentCycleOld } na { $paymentAmountNew } na { $productPaymentCycleNew }. Takrat vam bomo dodelili tudi enkraten dobropis v višini { $paymentProrated }, ki bo odražal nižjo bremenitev za preostanek tega obdobja.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = V kolikor morate za uporabo { $productName } namestiti novo programsko opremo, boste po e-pošti prejeli ločeno sporočilo z navodili za prenos.
subscriptionDowngrade-content-auto-renew = Naročnina se bo vsako obračunsko obdobje samodejno podaljšala, razen če se odločite za preklic.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Vaša naročnina za { $productName } je preklicana
subscriptionFailedPaymentsCancellation-title = Vaša naročnina je bila preklicana
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Preklicali smo vam naročnino na { $productName } zaradi več neuspelih poskusov plačila. Če si želite povrniti dostop, začnite novo naročnino s posodobljenim načinom plačila.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Plačilo za { $productName } potrjeno
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Hvala, ker ste se naročili na { $productName }
subscriptionFirstInvoice-content-processing = Vaše plačilo je trenutno v obdelavi, ki lahko traja do štiri delovne dni.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Prejeli boste ločeno e-poštno sporočilo, ki vam bo pomagalo začeti uporabljati { $productName }.
subscriptionFirstInvoice-content-auto-renew = Naročnina se bo samodejno obnovila vsako obračunsko obdobje, razen če se odločite za preklic.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Naslednji račun bo izdan { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Plačilnemu sredstvu za { $productName } je ali bo kmalu potekla veljavnost
subscriptionPaymentExpired-title-2 = Vašemu plačilnemu sredstvu je ali bo kmalu potekla veljavnost
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Plačilnemu sredstvu, ki ga uporabljate za { $productName }, je potekla veljavnost ali mu bo potekla v kratkem.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Plačilo za { $productName } neuspešno
subscriptionPaymentFailed-title = Žal imamo težave z vašim plačilom
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Pri zadnjem plačilu za { $productName } je prišlo do težave.
subscriptionPaymentFailed-content-outdated-1 = Morda je vašemu plačilnemu sredstvu potekla veljavnost ali pa je trenutni način plačila zastarel.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Potrebna je posodobitev podatkov o plačilu za { $productName }
subscriptionPaymentProviderCancelled-title = Žal imamo težave z vašim načinom plačila
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Zaznali smo težavo z vašim načinom plačila za { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Morda je vašemu plačilnemu sredstvu potekla veljavnost ali pa je trenutni način plačila zastarel.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Naročnina na { $productName } je ponovno aktivirana
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Hvala, ker ste ponovno aktivirali svojo naročnino na { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Vaše obračunsko obdobje in plačilo bosta ostala enaka. Vaša naslednja bremenitev bo { $invoiceTotal } dne { $nextInvoiceDateOnly }. Vaša naročnina se bo samodejno obnovila vsako obračunsko obdobje, razen če se odločite za preklic.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Obvestilo o samodejnem podaljšanju { $productName }
subscriptionRenewalReminder-title = Vaša naročnina bo kmalu obnovljena
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Spoštovani uporabnik { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Vaša trenutna naročnina je nastavljena na samodejno obnovitev čez { $reminderLength } dni. Takrat vam bo { -brand-mozilla } podaljšala naročnino v { $planIntervalCount } { $planInterval } in z vašim izbranim načinom plačila bremenila vaš račun v vrednosti { $invoiceTotal }.
subscriptionRenewalReminder-content-closing = Lep pozdrav,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Ekipa { $productName }
subscriptionReplaced-subject = Vaša naročnina je bila posodobljena v okviru nadgradnje
subscriptionReplaced-title = Vaša naročnina je bila posodobljena
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Vaša posamezna naročnina na { $productName } je bila zamenjana in je zdaj vključena v vašo novo svežnjo.
subscriptionReplaced-content-credit = Prejeli boste dobro za ves neporabljen čas iz prejšnje naročnine. Dobroimetje bo samodejno pripisano vašemu računu in porabljeno za prihodnje stroške.
subscriptionReplaced-content-no-action = Ni vam treba storiti ničesar.
subscriptionsPaymentExpired-subject-2 = Plačilnemu sredstvu za vaše naročnine je ali bo kmalu potekla veljavnost
subscriptionsPaymentExpired-title-2 = Vašemu plačilnemu sredstvu je ali bo kmalu potekla veljavnost
subscriptionsPaymentExpired-content-2 = Plačilnemu sredstvu, s katerim plačujete naslednje naročnine, je ali bo kmalu potekla veljavnost.
subscriptionsPaymentProviderCancelled-subject = Potrebna je posodobitev podatkov o plačilu za naročnine { -brand-mozilla(sklon: "rodilnik") }
subscriptionsPaymentProviderCancelled-title = Žal imamo težave z vašim načinom plačila
subscriptionsPaymentProviderCancelled-content-detected = Zaznali smo težavo z vašim načinom plačila za naslednje naročnine.
subscriptionsPaymentProviderCancelled-content-payment-1 = Morda je vašemu plačilnemu sredstvu potekla veljavnost ali pa je trenutni način plačila zastarel.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Plačilo za { $productName } prejeto
subscriptionSubsequentInvoice-title = Hvala, ker ste naš naročnik!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Prejeli smo vaše zadnje plačilo za { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Naslednji račun bo izdan { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Nadgradili ste na { $productName }
subscriptionUpgrade-title = Hvala za nadgradnjo!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Uspešno ste nadgradili na { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Zaračunali smo vam enkraten prispevek v višini { $invoiceAmountDue }, ki odraža višjo ceno naročnine za preostanek tega obračunskega obdobja ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Na račun ste prejeli dobroimetje v višini { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Od naslednjega računa se bo cena naročnine spreminjala.
subscriptionUpgrade-content-old-price-day = Prejšnja cena je bila { $paymentAmountOld } na dan.
subscriptionUpgrade-content-old-price-week = Prejšnja cena je bila { $paymentAmountOld } na teden.
subscriptionUpgrade-content-old-price-month = Prejšnja cena je bila { $paymentAmountOld } na mesec.
subscriptionUpgrade-content-old-price-halfyear = Prejšnja cena je bila { $paymentAmountOld } za 6 mesecev.
subscriptionUpgrade-content-old-price-year = Prejšnja cena je bila { $paymentAmountOld } na leto.
subscriptionUpgrade-content-old-price-default = Prejšnja cena je bila { $paymentAmountOld } na obračunski interval.
subscriptionUpgrade-content-old-price-day-tax = Prejšnja postavka je bila { $paymentAmountOld } + { $paymentTaxOld } davek na dan.
subscriptionUpgrade-content-old-price-week-tax = Prejšnja postavka je bila { $paymentAmountOld } + { $paymentTaxOld } davek na teden.
subscriptionUpgrade-content-old-price-month-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na mesec.
subscriptionUpgrade-content-old-price-halfyear-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na šest mesecev.
subscriptionUpgrade-content-old-price-year-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na leto.
subscriptionUpgrade-content-old-price-default-tax = Prejšnja stopnja je bila { $paymentAmountOld } + { $paymentTaxOld } davek na obračunski interval.
subscriptionUpgrade-content-new-price-day = V prihodnje vam bomo zaračunali { $paymentAmountNew } na dan brez popustov.
subscriptionUpgrade-content-new-price-week = V prihodnje vam bomo zaračunavali { $paymentAmountNew } na teden brez popustov.
subscriptionUpgrade-content-new-price-month = V prihodnje vam bomo zaračunavali { $paymentAmountNew } na mesec brez popustov.
subscriptionUpgrade-content-new-price-halfyear = V prihodnje vam bomo zaračunavali { $paymentAmountNew } na šest mesecev brez popustov.
subscriptionUpgrade-content-new-price-year = V prihodnje vam bomo zaračunali { $paymentAmountNew } na leto brez popustov.
subscriptionUpgrade-content-new-price-default = V prihodnje vam bomo zaračunavali { $paymentAmountNew } za obračunski interval brez popustov.
subscriptionUpgrade-content-new-price-day-dtax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na dan, brez popustov.
subscriptionUpgrade-content-new-price-week-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na teden brez popustov.
subscriptionUpgrade-content-new-price-month-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na mesec, brez popustov.
subscriptionUpgrade-content-new-price-halfyear-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na šest mesecev, brez popustov.
subscriptionUpgrade-content-new-price-year-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na leto, brez popustov.
subscriptionUpgrade-content-new-price-default-tax = V prihodnje vam bomo zaračunavali { $paymentAmountNew } + { $paymentTaxNew } davek na obračunski interval brez popustov.
subscriptionUpgrade-existing = Če se katera od vaših obstoječih naročnin prekriva s to nadgradnjo, bomo to posodobili in vam poslali ločeno e-poštno sporočilo s podrobnostmi. Če vaša nova naročnina vključuje izdelke, ki zahtevajo namestitev, vam bomo poslali ločeno e-pošto z navodili za namestitev.
subscriptionUpgrade-auto-renew = Naročnina se bo vsako obračunsko obdobje samodejno podaljšala, razen če se odločite za preklic.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Za prijavo uporabite kodo { $unblockCode }
unblockCode-preview = Koda poteče čez eno uro
unblockCode-title = Se prijavljate vi?
unblockCode-prompt = Če je tako, je to overitvena koda, ki jo potrebujete:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Če je tako, je to overitvena koda, ki jo potrebujete: { $unblockCode }
unblockCode-report = Če to niste vi, nam pomagajte odgnati vsiljivce in <a data-l10n-name="reportSignInLink">nam prijavite poskus zlorabe</a>.
unblockCode-report-plaintext = Če to niste vi, nam pomagajte odgnati vsiljivce in nam prijavite poskus zlorabe.
verificationReminderFinal-subject = Zadnji opomnik za potrditev računa
verificationReminderFinal-description-2 = Pred nekaj tedni ste ustvarili { -product-mozilla-account }, vendar ga niste nikoli potrdili. Zaradi vaše varnosti bomo račun izbrisali, če ne bo potrjen v naslednjih 24 urah.
confirm-account = Potrdi račun
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ne pozabite potrditi svojega računa
verificationReminderFirst-title-3 = Dobrodošli pri { -brand-mozilla(sklon: "mestnik") }!
verificationReminderFirst-description-3 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Potrdite svoj račun v naslednjih 15 dneh, sicer bo samodejno izbrisan.
verificationReminderFirst-sub-description-3 = Ne zamudite brskalnika, ki postavlja vas in vašo zasebnost na prvo mesto.
confirm-email-2 = Potrdi račun
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Potrdi račun
verificationReminderSecond-subject-2 = Ne pozabite potrditi svojega računa
verificationReminderSecond-title-3 = Ne zamudite { -brand-mozilla(sklon: "rodilnik") }!
verificationReminderSecond-description-4 = Pred nekaj dnevi ste ustvarili { -product-mozilla-account }, vendar ga niste potrdili. Potrdite svoj račun v naslednjih 10 dneh, sicer bo samodejno izbrisan.
verificationReminderSecond-second-description-3 = Vaš { -product-mozilla-account } vam omogoča sinhronizacijo izkušnje s { -brand-firefox(sklon: "orodnik") } med napravami in dostop do več izdelkov { -brand-mozilla(sklon: "rodilnik") }, ki varujejo zasebnost.
verificationReminderSecond-sub-description-2 = Bodite del našega poslanstva spreminjanja interneta v prostor, odprt za vsakogar.
verificationReminderSecond-action-2 = Potrdi račun
verify-title-3 = Odprite internet z { -brand-mozilla(sklon: "orodnik") }
verify-description-2 = Potrdite svoj račun in kar najbolje izkoristite { -brand-mozilla(sklon: "tozilnik") } na vseh napravah, začenši z:
verify-subject = Dokončajte ustvarjanje računa
verify-action-2 = Potrdi račun
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Za spremembo računa uporabite kodo { $code }
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ta koda poteče čez { $expirationTime } minuto.
        [two] Ta koda poteče čez { $expirationTime } minuti.
        [few] Ta koda poteče čez { $expirationTime } minute.
       *[other] Ta koda poteče čez { $expirationTime } minut.
    }
verifyAccountChange-title = Ali spreminjate podatke o računu?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Pomagajte nam zaščititi vaš račun, tako da odobrite to spremembo, storjeno na naslednji napravi:
verifyAccountChange-prompt = Če da, uporabite to overitveno kodo:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Poteče čez { $expirationTime } minuto.
        [two] Poteče čez { $expirationTime } minuti.
        [few] Poteče čez { $expirationTime } minute.
       *[other] Poteče čez { $expirationTime } minut.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Ali ste se vi prijavili v { $clientName }?
verifyLogin-description-2 = Pomagajte nam zaščititi vaš račun, tako da potrdite, da ste se vi prijavili v:
verifyLogin-subject-2 = Potrdi prijavo
verifyLogin-action = Potrdite prijavo
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Za prijavo uporabite kodo { $code }
verifyLoginCode-preview = Koda poteče čez 5 minut.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Ali ste se vi prijavili v { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Pomagajte nam zaščititi vaš račun, tako da odobrite prijavo na naslednji napravi:
verifyLoginCode-prompt-3 = Če da, uporabite to overitveno kodo:
verifyLoginCode-expiry-notice = Poteče čez 5 minut.
verifyPrimary-title-2 = Potrdi glavni e-poštni naslov
verifyPrimary-description = Poslan je bil zahtevek za spremembo računa z naslednje naprave:
verifyPrimary-subject = Potrdi glavni e-poštni naslov
verifyPrimary-action-2 = Potrdi e-poštni naslov
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Potem ko ga potrdite, bodo na tej napravi omogočene tudi spremembe računa, kot je dodajanje pomožnega e-poštnega naslova.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Za potrditev pomožnega e-poštnega naslova uporabite kodo { $code }
verifySecondaryCode-preview = Ta koda poteče čez 5 minut.
verifySecondaryCode-title-2 = Potrdi pomožni e-poštni naslov
verifySecondaryCode-action-2 = Potrdi e-poštni naslov
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Poslana je bila zahteva za uporabo { $email } kot pomožni e-poštni naslov naslednjega { -product-mozilla-account(sklon: "rodilnik") }:
verifySecondaryCode-prompt-2 = Uporabite to potrditveno kodo:
verifySecondaryCode-expiry-notice-2 = Poteče čez 5 minut. Ko naslov potrdite, bo začel prejemati varnostna obvestila in potrditve.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Za potrditev računa uporabite kodo { $code }
verifyShortCode-preview-2 = Koda poteče čez 5 minut
verifyShortCode-title-3 = Odprite internet z { -brand-mozilla(sklon: "orodnik") }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Potrdite svoj račun in kar najbolje izkoristite { -brand-mozilla(sklon: "tozilnik") } na vseh napravah, začenši z:
verifyShortCode-prompt-3 = Uporabite to potrditveno kodo:
verifyShortCode-expiry-notice = Poteče čez 5 minut.
