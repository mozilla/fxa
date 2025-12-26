## Non-email strings

session-verify-send-push-title-2 = Bejelentkezik a { -product-mozilla-account }jába?
session-verify-send-push-body-2 = Kattintson ide, hogy megerősítse személyazonosságát
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = A { -brand-mozilla } ellenőrzőkódja: { $code }. 5 perc múlva lejár.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla } ellenőrzőkód: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = A { -brand-mozilla } helyreállítási kódja: { $code }. 5 perc múlva lejár.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla } kód: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = A { -brand-mozilla } helyreállítási kódja: { $code }. 5 perc múlva lejár.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla } kód: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logó">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Eszközök szinkronizálása">
body-devices-image = <img data-l10n-name="devices-image" alt="Eszközök">
fxa-privacy-url = { -brand-mozilla } adatvédelmi irányelvek
moz-accounts-privacy-url-2 = { -product-mozilla-accounts } adatvédelmi nyilatkozata
moz-accounts-terms-url = { -product-mozilla-accounts } szolgáltatási feltételei
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logó">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logó">
subplat-automated-email = Ez egy automatikus üzenet, ha úgy véli tévedésből kapta, akkor nincs teendője.
subplat-privacy-notice = Adatvédelmi nyilatkozat
subplat-privacy-plaintext = Adatvédelmi nyilatkozat:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Azért kapta ezt az levelet, mert a(z) { $email } rendelkezik { -product-mozilla-account }kal, és feliratkozott erre: { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Azért kapta ezt a levelet, mert { $email } { -product-mozilla-account }kal rendelkezik.
subplat-explainer-multiple-2 = Azért kapta ezt a levelet, mert a(z) { $email } rendelkezik { -product-mozilla-account }kal, és több termékre is előfizetett.
subplat-explainer-was-deleted-2 = Azért kapta ezt az levelet, mert a(z) { $email } címhez { -product-mozilla-account }ot regisztráltak.
subplat-manage-account-2 = Kezelje a { -product-mozilla-account }ja beállításait a <a data-l10n-name="subplat-account-page">fiókoldala</a> felkeresésével.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Kezelje a { -product-mozilla-account }ja beállításait a fiókoldalának felkeresésével: { $accountSettingsUrl }
subplat-terms-policy = Feltételek és lemondási feltételek
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Előfizetés lemondása
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Előfizetés újraaktiválása
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Számlázási információk frissítése
subplat-privacy-policy = A { -brand-mozilla } adatvédelmi irányelvei
subplat-privacy-policy-2 = { -product-mozilla-accounts } adatvédelmi nyilatkozata
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts } szolgáltatási feltételei
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Jogi információk
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Adatvédelem
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Ha a fiókját törli, akkor továbbra is kapni fogja a Mozilla Corporation és a Mozilla Foundation e-mailjeit, hacsak nem <a data-l10n-name="unsubscribeLink">kéri a leiratkozását</a>.
account-deletion-info-block-support = Ha bármilyen kérdése van, vagy segítségre van szüksége, nyugodtan forduljon <a data-l10n-name="supportLink">támogatási csapatunkhoz</a>.
account-deletion-info-block-communications-plaintext = Ha a fiókját törli, akkor továbbra is kapni fogja a Mozilla Corporation és a Mozilla Foundation e-mailjeit, hacsak nem kéri a leiratkozását:
account-deletion-info-block-support-plaintext = Ha bármilyen kérdése van, vagy segítségre van szüksége, nyugodtan forduljon támogatási csapatunkhoz:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } letöltése a { -google-play }ről">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } letöltése az { -app-store }ból">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = A { $productName } telepítése egy <a data-l10n-name="anotherDeviceLink">másik asztali eszközre</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = A { $productName } telepítése egy <a data-l10n-name="anotherDeviceLink">másik eszközre</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = A { $productName } beszerzése a Google Playen
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = A { $productName } letöltése az App Store-ból:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = A { $productName } telepítése egy másik eszközre:
automated-email-change-2 = Ha nem Ön tette meg ezt a műveletet, azonnal <a data-l10n-name="passwordChangeLink">változtassa meg jelszavát</a>.
automated-email-support = További információért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ha nem Ön tette ezt a műveletet, azonnal változtassa meg a jelszavát:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = További információért keresse fel a { -brand-mozilla } Támogatást:
automated-email-inactive-account = Ez egy automatikus e-mail. Azért kapja, mert van { -product-mozilla-account }ja, és a legutóbbi bejelentkezése óta 2 év telt el.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } További információkért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
automated-email-no-action-plaintext = Ez egy automatizált e-mail. Ha tévedésből kapta, akkor nincs teendője.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Ez egy automatikus e-mail, ha nem Ön adott engedélyt erre a műveletre, akkor változtassa meg jelszavát:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Ez a kérés { $uaBrowser } böngészőtől érkezett, erről: { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Ez a kérés { $uaBrowser } böngészőtől érkezett, erről: { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Ez a kérés { $uaBrowser } böngészőtől érkezett.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = A kérés a következőtől érkezett: { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = A kérés a következőtől érkezett: { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ha ez nem Ön volt, <a data-l10n-name="revokeAccountRecoveryLink">törölje az új kulcsot</a> és <a data-l10n-name="passwordChangeLink">változtassa meg a jelszavát</a>
automatedEmailRecoveryKey-change-pwd-only = Ha ez nem Ön volt, <a data-l10n-name="passwordChangeLink">változtassa meg a jelszavát</a>.
automatedEmailRecoveryKey-more-info = További információért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = A kérés a következőtől érkezett:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ha ez nem Ön volt, törölje az új kulcsot:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ha ez nem Ön volt, változtassa meg a jelszavát:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = és változtassa meg a jelszavát:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = További információért keresse fel a { -brand-mozilla } Támogatást:
automated-email-reset =
    Ez egy automatikus üzenet; ha nem engedélyezte ezt a műveletet, akkor <a data-l10n-name="resetLink">állítsa vissza a jelszavát</a>.
    További információkért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } támogatást</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Ha nem adott engedélyt erre a műveletre, akkor állítsa vissza a jelszavát itt: { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Ha nem Ön végezte ezt a műveletet, akkor azonnal <a data-l10n-name="resetLink">állítsa vissza a jelszavát</a> és a <a data-l10n-name="twoFactorSettingsLink">állítsa vissza a kétlépcsős hitelesítést</a>. További információkért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Ha nem Ön végezte ezt a műveletet, akkor azonnal állítsa vissza a jelszavát itt:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Állítsa vissza a kétlépcsős hitelesítést is itt:
brand-banner-message = Tudta, hogy megváltoztattuk a nevünket { -product-firefox-accounts }ról { -product-mozilla-accounts }ra? <a data-l10n-name="learnMore">További tudnivalók</a>
cancellationSurvey = Segítsen bennünket szolgáltatásunk fejlesztésében azzal, hogy kitölti ezt a <a data-l10n-name="cancellationSurveyUrl">rövid kérdőívet</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Segítsen bennünket szolgáltatásunk fejlesztésében azzal, hogy kitölti az alábbi rövid kérdőívet:
change-password-plaintext = Ha azt gyanítja, hogy valaki más próbál hozzáférni fiókjához, kérjük változtassa meg jelszavát.
manage-account = Fiók kezelése
manage-account-plaintext = { manage-account }:
payment-details = Fizetési részletek:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Díjbekérő száma: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Levonás: { $invoiceTotal }, ekkor: { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Következő díjbekérő: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Fizetési mód:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Fizetési mód: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Fizetési mód: { $lastFour } végződésű { $cardName } kártya
payment-provider-card-ending-in-plaintext = Fizetési mód: { $lastFour } végződésű kártya
payment-provider-card-ending-in = <b>Fizetési mód:</b> { $lastFour } végződésű kártya
payment-provider-card-ending-in-card-name = <b>Fizetési mód:</b> { $lastFour } végződésű { $cardName } kártya
subscription-charges-invoice-summary = Számlaösszesítő

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Számla száma:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Számla száma: { $invoiceNumber }
subscription-charges-invoice-date = <b>Dátum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Dátum: { $invoiceDateOnly }
subscription-charges-prorated-price = Időarányos ár
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Időarányos ár: { $remainingAmountTotal }
subscription-charges-list-price = Listaár
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Listaár: { $offeringPrice }
subscription-charges-credit-from-unused-time = Jóváírás a fel nem használt időből
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Jóváírás a fel nem használt időből: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Részösszeg</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Részösszeg: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Egyszeri kedvezmény
subscription-charges-one-time-discount-plaintext = Egyszeri kedvezmény: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration } havi kedvezmény
       *[other] { $discountDuration } havi kedvezmény
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration } havi kedvezmény: { $invoiceDiscountAmount }
       *[other] { $discountDuration } havi kedvezmény: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Kedvezmény
subscription-charges-discount-plaintext = Kedvezmény: { $invoiceDiscountAmount }
subscription-charges-taxes = Adók és díjak
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Adók és díjak: { $invoiceTaxAmount }
subscription-charges-total = <b>Összesen</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Összesen: { $invoiceTotal }
subscription-charges-credit-applied = Jóváírás alkalmazva
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Jóváírás: { $creditApplied }
subscription-charges-amount-paid = <b>Kifizetett összeg</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Kifizetett összeg: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = { $creditReceived } összegű fiókjóváírást kapott, amely a jövőbeni számláin lesz felhasználva.

##

subscriptionSupport = Kérdése van az előfizetéséről? A <a data-l10n-name="subscriptionSupportUrl">támogatási csapatunk</a> itt van, hogy segítsen.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Kérdése van az előfizetéséről? A támogatási csapatunk itt van, hogy segítsen:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Köszönjük, hogy előfizetett a { $productName } szolgáltatásra. Ha kérdése van az előfizetésével kapcsolatban, vagy további információra van szükséges a { $productName } szolgáltatással kapcsolatban, akkor <a data-l10n-name="subscriptionSupportUrl">lépjen velünk kapcsolatba</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Köszönjük, hogy előfizetett a { $productName } szolgáltatásra. Ha kérdése van az előfizetésével kapcsolatban, vagy további információra van szükséges a { $productName } szolgáltatással kapcsolatban, akkor lépjen velünk kapcsolatba:
subscription-support-get-help = Segítség az előfizetéshez
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Előfizetés kezelése</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Előfizetés kezelése:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Kapcsolatfelvétel az ügyfélszolgálattal</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Kapcsolatfelvétel az ügyfélszolgálattal:
subscriptionUpdateBillingEnsure = Itt meggyőződhet arról, hogy fizetési módja és fiókja adatai naprakészek <a data-l10n-name="updateBillingUrl">itt</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Itt meggyőződhet arról, hogy fizetési módja és fiókja adatai naprakészek:
subscriptionUpdateBillingTry = A következő napokban újra megpróbáljuk a befizetését, de előfordulhat, hogy segítenie kell nekünk a <a data-l10n-name="updateBillingUrl">fizetési információinak frissítésével</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = A következő napokban újra megpróbáljuk a befizetését, de előfordulhat, hogy segítenie kell nekünk a fizetési információinak frissítésével:
subscriptionUpdatePayment = A szolgáltatás folytonossága érdekében <a data-l10n-name="updateBillingUrl">frissítse a fizetési információit</a> a lehető leghamarabb.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = A szolgáltatás folytonossága érdekében frissítse a fizetési információit a lehető leghamarabb:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = További információért keresse fel a <a data-l10n-name="supportLink">{ -brand-mozilla } Támogatást</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = További információkért keresse fel a { -brand-mozilla } Támogatást: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } ezen: { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } ezen: { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (becsült)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (becsült)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (becsült)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (becsült)
view-invoice-link-action = Számla megtekintése
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Díjbekérő megtekintése: { $invoiceLink }
cadReminderFirst-subject-1 = Emlékeztető! Szinkronizálja a { -brand-firefox(case: "accusative") }
cadReminderFirst-action = Másik eszköz szinkronizálása
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = A szinkronizáláshoz két fél szükséges
cadReminderFirst-description-v2 = Vigye át lapjait az összes eszköze között. Vigye magával a könyvjelzőit, jelszavait és egyéb adatait mindenhová, ahol a { -brand-firefox(case: "accusative") } használja.
cadReminderSecond-subject-2 = Ne maradjon ki! Fejezze be a szinkronizálás beállítását.
cadReminderSecond-action = Másik eszköz szinkronizálása
cadReminderSecond-title-2 = Ne felejtsen el szinkronizálni!
cadReminderSecond-description-sync = Szinkronizálja a könyvjelzőket, a jelszavakat és még többet – bárhol is használja a { -brand-firefox(case: "accusative") }.
cadReminderSecond-description-plus = Ráadásul az adatok mindig titkosítva vannak. Csak Ön és az Ön által jóváhagyott eszközök láthatják.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Üdvözli a { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Üdvözli a { $productName }
downloadSubscription-content-2 = Kezdjük el használni az előfizetésében szereplő összes szolgáltatást:
downloadSubscription-link-action-2 = Kezdő lépések
fraudulentAccountDeletion-subject-2 = A { -product-mozilla-account }ja törölve lett
fraudulentAccountDeletion-title = Fiókját törölték
fraudulentAccountDeletion-content-part1-v2 = A közelmúltban egy { -product-mozilla-account } jött létre, és az előfizetést ezzel az e-mail-címmel fizették ki. Mint minden új fióknál, megkértük, hogy erősítse meg fiókját az e-mail-cím ellenőrzésével.
fraudulentAccountDeletion-content-part2-v2 = Jelenleg azt látjuk, hogy a fiókot sosem erősítették meg. Mivel ez a lépés nem fejeződött be, így nem vagyunk biztosak abban, hogy ez egy engedélyezett előfizetés volt-e. Ennek eredményeként az e-mail-címre regisztrált { -product-mozilla-account } törölve lett, az előfizetését pedig az összes költség visszatérítése mellett töröltük.
fraudulentAccountDeletion-contact = Ha kérdése van, forduljon <a data-l10n-name="mozillaSupportUrl">támogatási csapatunkhoz</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Ha bármilyen kérdése van, forduljon támogatási csapatunkhoz: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Utolsó lehetőség, hogy megtartsa a { -product-mozilla-account }ját
inactiveAccountFinalWarning-title = A { -brand-mozilla }-fiókja és az adatai törlésre kerülnek
inactiveAccountFinalWarning-preview = Jelentkezzen be a fiókja megtartásához
inactiveAccountFinalWarning-account-description = A { -product-mozilla-account } ja az ingyenes adatvédelmi és böngészési termékek elérésére használható, mint a { -brand-firefox } Sync, a { -product-mozilla-monitor }, a { -product-firefox-relay } és az { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Ha nem jelentkezik be, akkor fiókja és személyes adatai ekkor véglegesen törlésre kerülnek: <strong>{ $deletionDate }</strong>.
inactiveAccountFinalWarning-action = Jelentkezzen be a fiókja megtartásához
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Jelentkezzen be, hogy megtartsa a fiókját:
inactiveAccountFirstWarning-subject = Ne veszítse el fiókját
inactiveAccountFirstWarning-title = Megtartja a { -brand-mozilla }-fiókját és adatait?
inactiveAccountFirstWarning-account-description-v2 = A { -product-mozilla-account } ja az ingyenes adatvédelmi és böngészési termékek elérésére használható, mint a { -brand-firefox } Sync, a { -product-mozilla-monitor }, a { -product-firefox-relay } és az { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Észrevettük, hogy 2 éve nem jelentkezett be.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Mivel nem volt aktív, a fiókja és személyes adatai ekkor véglegesen törlésre kerülnek: <strong>{ $deletionDate }</strong>.
inactiveAccountFirstWarning-action = Jelentkezzen be a fiókja megtartásához
inactiveAccountFirstWarning-preview = Jelentkezzen be a fiókja megtartásához
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Jelentkezzen be, hogy megtartsa a fiókját:
inactiveAccountSecondWarning-subject = Művelet szükséges: Fióktörlés 7 napon belül
inactiveAccountSecondWarning-title = A { -brand-mozilla }-fiókja és az adatai 7 nap múlva törlésre kerülnek
inactiveAccountSecondWarning-account-description-v2 = A { -product-mozilla-account } ja az ingyenes adatvédelmi és böngészési termékek elérésére használható, mint a { -brand-firefox } Sync, a { -product-mozilla-monitor }, a { -product-firefox-relay } és az { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Mivel nem volt aktív, a fiókja és személyes adatai ekkor véglegesen törlésre kerülnek: <strong>{ $deletionDate }</strong>.
inactiveAccountSecondWarning-action = Jelentkezzen be a fiókja megtartásához
inactiveAccountSecondWarning-preview = Jelentkezzen be a fiókja megtartásához
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Jelentkezzen be, hogy megtartsa a fiókját:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Kifogyott a tartalék hitelesítési kódokból.
codes-reminder-title-one = Az utolsó tartalék hitelesítési kódjánál jár
codes-reminder-title-two = Itt az ideje, hogy új tartalék hitelesítési kódokat állítson elő
codes-reminder-description-part-one = A tartalék hitelesítési kódok segítenek helyreállítani adatait, ha elfelejti a jelszavát.
codes-reminder-description-part-two = Hozzon létre új kódokat most, hogy később ne veszítse el adatait.
codes-reminder-description-two-left = Már csak két kódja maradt.
codes-reminder-description-create-codes = Hozzon létre új tartalék hitelesítési kódokat, amelyek segítenek visszajutni fiókjába, ha kizárta magát.
lowRecoveryCodes-action-2 = Kódok létrehozása
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nem maradt tartalék hitelesítési kódja
        [one] Csak 1 tartalék hitelesítési kódja maradt
       *[other] Csak { $numberRemaining } tartalék hitelesítési kódja maradt
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Új bejelentkezés itt: { $clientName }
newDeviceLogin-subjectForMozillaAccount = Új bejelentkezés a { -product-mozilla-account }jába
newDeviceLogin-title-3 = Bejelentkeztek a { -product-mozilla-account }jával
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Nem Ön volt? <a data-l10n-name="passwordChangeLink">Változtassa meg a jelszavát</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Nem Ön volt? Változtassa meg a jelszavát:
newDeviceLogin-action = Fiók kezelése
passwordChanged-subject = A jelszó frissítve
passwordChanged-title = Jelszó sikeresen módosítva
passwordChanged-description-2 = A { -product-mozilla-account }jának jelszava sikeresen megváltoztatva erről az eszközről:
passwordChangeRequired-subject = Gyanús tevékenység észlelve
passwordChangeRequired-preview = Azonnal változtassa meg a jelszavát
passwordChangeRequired-title-2 = Jelszó visszaállítása
passwordChangeRequired-suspicious-activity-3 = Fiókját zároltuk, hogy biztonságban legyen a gyanús tevékenységektől. Elővigyázatosságból ki lett jelentkeztetve az összes eszközéről, és a szinkronizált adatok törölve lettek.
passwordChangeRequired-sign-in-3 = Hogy újra bejelentkezzen a fiókjába, csak annyit kell tennie, hogy visszaállítja a jelszavát.
passwordChangeRequired-different-password-2 = <b>Fontos:</b> Válasszon egy erős jelszót, amely különbözik a korábban használttól.
passwordChangeRequired-different-password-plaintext-2 = Fontos: Válasszon egy erős jelszót, amely különbözik a múltban használttól.
passwordChangeRequired-action = Jelszó visszaállítása
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Használja a(z) { $code } kódot a jelszava módosításához
password-forgot-otp-preview = Ez a kód 10 perc múlva lejár
password-forgot-otp-title = Elfelejtette a jelszavát?
password-forgot-otp-request = A { -product-mozilla-account }ja jelszavának megváltoztatására vonatkozó kérést kaptunk a következőtől:
password-forgot-otp-code-2 = Ha ez Ön volt, akkor itt a megerősítő kódja a folytatáshoz:
password-forgot-otp-expiry-notice = Ez a kód 10 perc múlva lejár.
passwordReset-subject-2 = A jelszó vissza lett állítva
passwordReset-title-2 = A jelszó vissza lett állítva
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Visszaállította a { -product-mozilla-account }ja jelszavát ekkor:
passwordResetAccountRecovery-subject-2 = A jelszó vissza lett állítva
passwordResetAccountRecovery-title-3 = A jelszó vissza lett állítva
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = A fiók-helyreállítási kulcsát használta a { -product-mozilla-account }jához tartozó jelszavának visszaállításához a következőn:
passwordResetAccountRecovery-information = Kijelentkeztettük az összes szinkronizált eszközéről. Készítettünk egy új fiók-helyreállítási kulcsot a most használt kulcs helyett. Ezt a fiókbeállításokban módosíthatja.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Kijelentkeztettük az összes szinkronizált eszközéről. Készítettünk egy új fiók-helyreállítási kulcsot a most használt kulcs helyett. Ezt a fiókbeállításokban módosíthatja:
passwordResetAccountRecovery-action-4 = Fiók kezelése
passwordResetRecoveryPhone-subject = Helyreállítási telefonszám használva
passwordResetRecoveryPhone-preview = Ellenőrizze, hogy ez Ön volt-e
passwordResetRecoveryPhone-title = A helyreállítási telefonszáma egy jelszó-visszaállítás megerősítéséhez lett használva
passwordResetRecoveryPhone-device = Helyreállítási telefonszám innen használva:
passwordResetRecoveryPhone-action = Fiók kezelése
passwordResetWithRecoveryKeyPrompt-subject = A jelszó vissza lett állítva
passwordResetWithRecoveryKeyPrompt-title = A jelszó vissza lett állítva
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Visszaállította a { -product-mozilla-account }ja jelszavát ekkor:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Fiók-helyreállítási kulcs létrehozása
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Fiók-helyreállítási kulcs létrehozása:
passwordResetWithRecoveryKeyPrompt-cta-description = Újra be kell jelentkeznie az összes szinkronizált eszközén. Tartsa adatait biztonságban legközelebb egy fiók-helyreállítási kulccsal. Ez lehetővé teszi, hogy visszaállítsa az adatait, ha elfelejti a jelszavát.
postAddAccountRecovery-subject-3 = Új fiók-helyreállítási kulcs létrehozva
postAddAccountRecovery-title2 = Létrehozott egy új fiók-helyreállítási kulcsot
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Mentse el ezt a kulcsot – szüksége lesz rá a titkosított böngészési adatainak helyreállításához, ha elfelejtené a jelszavát.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Ez a kulcs csak egyszer használható. Miután felhasználta, automatikusan létrehozunk egy újat. Vagy bármikor létrehozhat egy újat a fiókbeállításokban.
postAddAccountRecovery-action = Fiók kezelése
postAddLinkedAccount-subject-2 = Új fiók kapcsolva a { -product-mozilla-account }jához
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = { $providerName }-fiókja össze lett kapcsolva a { -product-mozilla-account }jával
postAddLinkedAccount-action = Fiók kezelése
postAddRecoveryPhone-subject = Helyreállítási telefonszám hozzáadva
postAddRecoveryPhone-preview = Kétlépcsős hitelesítéssel védett fiók
postAddRecoveryPhone-title-v2 = Hozzáadott egy helyreállítási telefonszámot
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Hozzáadta a(z) { $maskedLastFourPhoneNumber } helyreállítási telefonszámot
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Hogyan védi ez a fiókját
postAddRecoveryPhone-how-protect-plaintext = Hogyan védi ez a fiókját:
postAddRecoveryPhone-enabled-device = Innen engedélyezte:
postAddRecoveryPhone-action = Fiók kezelése
postAddTwoStepAuthentication-preview = A fiókja védve van
postAddTwoStepAuthentication-subject-v3 = A kétlépcsős hitelesítés be van kapcsolva
postAddTwoStepAuthentication-title-2 = Bekapcsolta a kétlépcsős hitelesítést
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Ezt kérte a következőtől:
postAddTwoStepAuthentication-action = Fiók kezelése
postAddTwoStepAuthentication-code-required-v4 = A hitelesítő alkalmazásból származó biztonsági kódok minden bejelentkezéskor szükségesek.
postAddTwoStepAuthentication-recovery-method-codes = Emellett tartalék hitelesítési kódokat adott meg helyreállítási módszerként.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Ezenkívül hozzáadta a(z) { $maskedPhoneNumber } helyreállítási telefonszámot.
postAddTwoStepAuthentication-how-protects-link = Hogyan védi ez a fiókját
postAddTwoStepAuthentication-how-protects-plaintext = Hogyan védi ez a fiókját:
postAddTwoStepAuthentication-device-sign-out-message = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra a kétlépcsős hitelesítéssel.
postChangeAccountRecovery-subject = A fiók-helyreállítási kulcs megváltozott
postChangeAccountRecovery-title = Módosította a fiók-helyreállítási kulcsát
postChangeAccountRecovery-body-part1 = Új fiók-helyreállítási kulcsa van. Az előző kulcsát törölték.
postChangeAccountRecovery-body-part2 = Mentse biztonságos helyre ezt az új kulcsot – szüksége lesz rá a titkosított böngészési adatainak helyreállításához, ha elfelejtené a jelszavát.
postChangeAccountRecovery-action = Fiók kezelése
postChangePrimary-subject = Elsődleges e-mail frissítve
postChangePrimary-title = Új elsődleges e-mail cím
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Sikeresen megváltoztatta az elsődleges e-mail címét erre: { $email }. Ez az cím mostantól a felhasználóneve a { -product-mozilla-account }ba való bejelentkezéshez, illetve ide fognak érkezni a biztonsági értesítések, és a bejelentkezési visszaigazolások.
postChangePrimary-action = Fiók kezelése
postChangeRecoveryPhone-subject = Helyreállítási telefonszám frissítve
postChangeRecoveryPhone-preview = Kétlépcsős hitelesítéssel védett fiók
postChangeRecoveryPhone-title = Módosította a helyreállítási telefonszámát
postChangeRecoveryPhone-description = Új helyreállítási telefonszáma van. Az előző telefonszám törölve lett.
postChangeRecoveryPhone-requested-device = Innen kérte:
postChangeTwoStepAuthentication-preview = A fiókja védve van
postChangeTwoStepAuthentication-subject = Kétlépcsős hitelesítés frissítve
postChangeTwoStepAuthentication-title = A kétlépcsős hitelesítés frissítve lett
postChangeTwoStepAuthentication-use-new-account = Most már az új { -product-mozilla-account } bejegyzést kell használnia a hitelesítő alkalmazásban. A régi már nem fog működni, és eltávolíthatja.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Ezt kérte a következőtől:
postChangeTwoStepAuthentication-action = Fiók kezelése
postChangeTwoStepAuthentication-how-protects-link = Hogyan védi ez a fiókját
postChangeTwoStepAuthentication-how-protects-plaintext = Hogyan védi ez a fiókját:
postChangeTwoStepAuthentication-device-sign-out-message = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra az új kétlépcsős hitelesítésével.
postConsumeRecoveryCode-title-3 = A tartalék hitelesítési kódját egy jelszó-visszaállítás megerősítéséhez használták
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Kód innen használva:
postConsumeRecoveryCode-action = Fiók kezelése
postConsumeRecoveryCode-subject-v3 = Tartalék hitelesítési kód felhasználva
postConsumeRecoveryCode-preview = Ellenőrizze, hogy ez Ön volt-e
postNewRecoveryCodes-subject-2 = Új tartalék hitelesítési kódok létrehozva
postNewRecoveryCodes-title-2 = Új tartalék hitelesítési kódokat hozott létre
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = A következőn lettek létrehozva:
postNewRecoveryCodes-action = Fiók kezelése
postRemoveAccountRecovery-subject-2 = Fiók-helyreállítási kulcs törölve
postRemoveAccountRecovery-title-3 = Törölte a fiók-helyreállítási kulcsát
postRemoveAccountRecovery-body-part1 = A fiók-helyreállítási kulcsra szükség van a titkosított böngészési adatainak helyreállításához, ha elfelejti a jelszavát.
postRemoveAccountRecovery-body-part2 = Ha még nem tette, hozzon létre egy új fiók-helyreállítási kulcsot a fiókbeállításokban, hogy megakadályozza a mentett jelszavak, könyvjelzők, böngészési előzmények és egyebek elveszítését.
postRemoveAccountRecovery-action = Fiók kezelése
postRemoveRecoveryPhone-subject = Helyreállítási telefonszám eltávolítva
postRemoveRecoveryPhone-preview = Kétlépcsős hitelesítéssel védett fiók
postRemoveRecoveryPhone-title = Helyreállítási telefonszám eltávolítva
postRemoveRecoveryPhone-description-v2 = A helyreállítási telefonszámát eltávolították a kétlépcsős hitelesítési beállítások közül.
postRemoveRecoveryPhone-description-extra = Továbbra is használhatja a tartalék hitelesítési kódjait a bejelentkezéshez, ha nem tudja használni a hitelesítő alkalmazást.
postRemoveRecoveryPhone-requested-device = Innen kérte:
postRemoveSecondary-subject = Másodlagos e-mail cím eltávolítva
postRemoveSecondary-title = Másodlagos e-mail cím eltávolítva
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Sikeresen eltávolította a következő másodlagos e-mail címet a { -product-mozilla-account }jából: { $secondaryEmail }. A biztonsági értesítések és a bejelentkezési megerősítések többé nem lesznek elküldve erre a címre.
postRemoveSecondary-action = Fiók kezelése
postRemoveTwoStepAuthentication-subject-line-2 = Kétlépcsős hitelesítés kikapcsolva
postRemoveTwoStepAuthentication-title-2 = Kikapcsolta a kétlépcsős hitelesítést
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Innen tiltotta le:
postRemoveTwoStepAuthentication-action = Fiók kezelése
postRemoveTwoStepAuthentication-not-required-2 = Már nincs szüksége biztonsági kódokra a hitelesítő alkalmazásból, amikor bejelentkezik.
postSigninRecoveryCode-subject = Bejelentkezéshez használt tartalék hitelesítési kód
postSigninRecoveryCode-preview = Fióktevékenység megerősítése
postSigninRecoveryCode-title = A tartalék hitelesítési kódját használták a bejelentkezéshez
postSigninRecoveryCode-description = Ha ezt nem Ön tette, akkor azonnal változtassa meg jelszavát, hogy biztonságban tudja a fiókját.
postSigninRecoveryCode-device = Bejelentkezett innen:
postSigninRecoveryCode-action = Fiók kezelése
postSigninRecoveryPhone-subject = A bejelentkezéshez használt helyreállítási telefonszám
postSigninRecoveryPhone-preview = Fióktevékenység megerősítése
postSigninRecoveryPhone-title = A helyreállítási telefonszámát bejelentkezéshez használták
postSigninRecoveryPhone-description = Ha ezt nem Ön tette, akkor azonnal változtassa meg jelszavát, hogy biztonságban tudja a fiókját.
postSigninRecoveryPhone-device = Bejelentkezett innen:
postSigninRecoveryPhone-action = Fiók kezelése
postVerify-sub-title-3 = Örülünk, hogy látjuk!
postVerify-title-2 = Két eszközön szeretné látni ugyanazt a lapot?
postVerify-description-2 = Könnyedén! Csak telepítse a { -brand-firefox(case: "accusative") } egy másik eszközre, és jelentkezzen be a szinkronizáláshoz. Olyan, mint a varázslat!
postVerify-sub-description = (Pszt… Ez azt is jelenti, hogy a könyvjelzőit, jelszavait és az egyéb a { -brand-firefox(case: "inessive") } tárolt adatait bárhol elérheti, ahol be van jelentkezve.)
postVerify-subject-4 = Üdvözli a { -brand-mozilla }!
postVerify-setup-2 = Másik eszköz csatlakoztatása:
postVerify-action-2 = Másik eszköz csatlakoztatása
postVerifySecondary-subject = Másodlagos e-mail hozzáadva
postVerifySecondary-title = Másodlagos e-mail hozzáadva
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Sikeresen megerősítette a(z) { $secondaryEmail } másodlagos e-mail-címet a { -product-mozilla-account }jához. A biztonsági értesítések és a bejelentkezési megerősítések most már mindkét címére el lesznek küldve.
postVerifySecondary-action = Fiók kezelése
recovery-subject = Jelszó visszaállítása
recovery-title-2 = Elfelejtette a jelszavát?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = A(z) { -product-mozilla-account }ja jelszavának megváltoztatására vonatkozó kérést kaptunk a következőtől:
recovery-new-password-button = Hozzon létre egy új jelszót az alábbi gombra kattintva. Ez a hivatkozás egy órán belül lejár.
recovery-copy-paste = Hozzon létre egy új jelszót az alábbi webcím másolásával és a böngészőbe történő beillesztésével. Ez a hivatkozás egy órán belül lejár.
recovery-action = Új jelszó létrehozása
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Lemondta a(z) { $productName } előfizetését
subscriptionAccountDeletion-title = Sajnáljuk, hogy távozik
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Nemrég törölte a { -product-mozilla-account }ját. Ezért megszakítottuk a(z) { $productName } előfizetését. Az utolsó { $invoiceTotal } $ értékű befizetése ekkor történt: { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Üdvözli a { $productName }: Állítsa be a jelszavát.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Üdvözli a { $productName }
subscriptionAccountFinishSetup-content-processing = Fizetése feldolgozás alatt áll, és a befejezése akár négy munkanapot is igénybe vehet. Az előfizetés automatikusan megújul minden számlázási időszakban, hacsak nem dönt úgy, hogy lemondja.
subscriptionAccountFinishSetup-content-create-3 = Ezután létre kell hoznia egy jelszót a { -product-mozilla-account }jához, hogy megkezdje az új előfizetés használatát.
subscriptionAccountFinishSetup-action-2 = Kezdő lépések
subscriptionAccountReminderFirst-subject = Emlékeztető: Fejezze be a fiókja beállítását
subscriptionAccountReminderFirst-title = Még nem férhet hozzá az előfizetéséhez
subscriptionAccountReminderFirst-content-info-3 = Néhány nappal ezelőtt létrehozott egy { -product-mozilla-account }ot, de nem erősítette meg. Reméljük, hogy befejezi fiókja beállítását, hogy használhassa az új előfizetését.
subscriptionAccountReminderFirst-content-select-2 = Válassza a „Jelszó létrehozása” lehetőséget, hogy új jelszót állítson be, és befejezze a fiókja megerősítését.
subscriptionAccountReminderFirst-action = Jelszó létrehozása
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Végső emlékeztető: Állítsa be a fiókját
subscriptionAccountReminderSecond-title-2 = Üdvözli a { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Néhány nappal ezelőtt létrehozott egy { -product-mozilla-account }ot, de nem erősítette meg. Reméljük, hogy befejezi fiókja beállítását, hogy használhassa az új előfizetését.
subscriptionAccountReminderSecond-content-select-2 = Válassza a „Jelszó létrehozása” lehetőséget, hogy új jelszót állítson be, és befejezze a fiókja megerősítését.
subscriptionAccountReminderSecond-action = Jelszó létrehozása
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Lemondta a(z) { $productName } előfizetését
subscriptionCancellation-title = Sajnáljuk, hogy távozik

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Lemondtuk a { $productName } előfizetését. Az utolsó, { $invoiceTotal } összegű befizetését a következő napon volt kifizetve: { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Lemondtuk a { $productName } előfizetését. Az utolsó, { $invoiceTotal } összegű befizetését a következő napon lesz kifizetve: { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Szolgáltatása a jelenlegi számlázási időszak végéig, azaz { $serviceLastActiveDateOnly } végéig folytatódik.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Váltott erre: { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Sikeresen váltott erről: { $productNameOld }, erre: { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A következő számlától fogva a levonása megváltozik { $paymentAmountOld }/{ $productPaymentCycleOld } összegről a következőre: { $paymentAmountNew }/{ $productPaymentCycleNew }. Akkor kapni fog egy egyszeri { $paymentProrated } értékű jóváírást, amely a(z) { $productPaymentCycleOld } hátralévő időszakára eső különbözet.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Ha új szoftver telepítése szükséges a { $productName } használatához, akkor külön e-mailt fog kapni a letöltési utasításokkal.
subscriptionDowngrade-content-auto-renew = Előfizetése számlázási időszakonként automatikusan megújul, hacsak nem dönt úgy, hogy lemondja.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Lemondta a(z) { $productName } előfizetését
subscriptionFailedPaymentsCancellation-title = Az előfizetése lemondásra került
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Lemondtuk a(z) { $productName } előfizetését, mert több fizetési kísérlet sem sikerült. Hogy újra hozzáférést kapjon, indítson egy új előfizetést egy frissített fizetési móddal.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = A(z) { $productName } befizetése megerősítve
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Köszönjük, hogy feliratkozott a(z) { $productName } szolgáltatásra
subscriptionFirstInvoice-content-processing = Az ön befizetése feldolgozás alatt áll, ami akár négy munkanapig is tarthat.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Külön e-mailt fog kapni a { $productName } használatának megkezdéséről.
subscriptionFirstInvoice-content-auto-renew = Előfizetése számlázási időszakonként automatikusan megújul, hacsak nem dönt úgy, hogy lemondja.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = A következő számla ekkor lesz kiállítva: { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = A(z) { $productName } fizetési módja lejárt vagy hamarosan lejár
subscriptionPaymentExpired-title-2 = A fizetési módja lejárt vagy hamarosan lejár
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = A(z) { $productName } előfizetésének befizetéséhez használt fizetési módja lejárt vagy hamarosan lejár.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = A(z) { $productName } befizetése sikertelen
subscriptionPaymentFailed-title = Sajnáljuk, gondok vannak a befizetésével
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Probléma merült fel a legutóbbi { $productName } befizetésével kapcsolatban.
subscriptionPaymentFailed-content-outdated-1 = Előfordulhat, hogy a fizetési módja lejárt, vagy a jelenlegi fizetési módja elavult.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = A fizetési információk frissítése szükséges a következőnél: { $productName }
subscriptionPaymentProviderCancelled-title = Sajnáljuk, gondok vannak a fizetési módjával
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Problémát észleltünk a { $productName } termékhez tartozó fizetési módjával kapcsolatban.
subscriptionPaymentProviderCancelled-content-reason-1 = Előfordulhat, hogy a fizetési módja lejárt, vagy a jelenlegi fizetési módja elavult.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = { $productName } előfizetés újraaktiválva
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Köszönjük, hogy újraaktiválta a { $productName } előfizetését.
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = A számlázási ciklusa és fizetése változatlan marad. A következő terhelés { $invoiceTotal } lesz, ekkor: { $nextInvoiceDateOnly }. Előfizetése automatikusan megújítja az összes számlázási időszakot, hacsak nem dönt úgy, hogy lemondja.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = { $productName } automatikus megújítási értesítés
subscriptionRenewalReminder-title = Az előfizetése hamarosan meg lesz újítva
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Tisztelt { $productName } vásárló!
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = A jelenlegi előfizetése { $reminderLength } nap múlva automatikusan megújul. Ekkor a { -brand-mozilla } megújítja a(z) { $planIntervalCount } { $planInterval } időszakú előfizetését, és { $invoiceTotal } összegű díjat számol fel a fiókjában szereplő fizetési módra.
subscriptionRenewalReminder-content-closing = Üdvözlettel,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = A { $productName } csapat
subscriptionReplaced-subject = Az előfizetése a frissítés részeként frissítve lett
subscriptionReplaced-title = Az előfizetése frissítve lett
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Az egyéni { $productName } előfizetése le lett cserélve, és most már az új csomagja része.
subscriptionReplaced-content-credit = Az előző előfizetése során fel nem használt idő után jóváírást kap. Ez a jóváírás automatikusan jóváírásra kerül a fiókjában, és a jövőbeni terhelésekhez lesz felhasználva.
subscriptionReplaced-content-no-action = Nincs teendője az Ön részéről.
subscriptionsPaymentExpired-subject-2 = Az előfizetéseihez tartozó fizetési mód lejárt vagy hamarosan lejár
subscriptionsPaymentExpired-title-2 = A fizetési módja lejárt vagy hamarosan lejár
subscriptionsPaymentExpired-content-2 = A következő előfizetésekhez használt fizetési mód lejárt vagy hamarosan lejár.
subscriptionsPaymentProviderCancelled-subject = A fizetési információk frissítése szükséges a { -brand-mozilla(ending: "accented") }s előfizetéseknél
subscriptionsPaymentProviderCancelled-title = Sajnáljuk, gondok vannak a fizetési módjával
subscriptionsPaymentProviderCancelled-content-detected = Problémát észleltünk a következő előfizetésekhez tartozó fizetési módjával kapcsolatban.
subscriptionsPaymentProviderCancelled-content-payment-1 = Előfordulhat, hogy a fizetési módja lejárt, vagy a jelenlegi fizetési módja elavult.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = A(z) { $productName } befizetése megérkezett
subscriptionSubsequentInvoice-title = Köszönjük, hogy előfizető lett!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Megkaptuk legutóbbi { $productName } befizetését.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = A következő számla ekkor lesz kiállítva: { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Frissített erre: { $productName }
subscriptionUpgrade-title = Köszönjük, hogy magasabb csomagra frissített!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Sikeresen frissített erre: { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Egy egyszeri { $invoiceAmountDue } összegű díjat számoltunk fel, amely a számlázási időszak ({ $productPaymentCycleOld }) hátralévő részében az előfizetés magasabb árat tükrözi.
subscriptionUpgrade-content-charge-credit = { $paymentProrated } összegű jóváírást kapott.
subscriptionUpgrade-content-subscription-next-bill-change = A következő számlától kezdve az előfizetés ára megváltozik.
subscriptionUpgrade-content-old-price-day = A korábbi ár { $paymentAmountOld } volt naponta.
subscriptionUpgrade-content-old-price-week = A korábbi ár { $paymentAmountOld } volt hetente.
subscriptionUpgrade-content-old-price-month = A korábbi díj { $paymentAmountOld } volt havonta.
subscriptionUpgrade-content-old-price-halfyear = A korábbi díj { $paymentAmountOld } volt hat havonta.
subscriptionUpgrade-content-old-price-year = A korábbi díj { $paymentAmountOld } volt évente.
subscriptionUpgrade-content-old-price-default = A korábbi díj { $paymentAmountOld } volt számlázási időszakonként.
subscriptionUpgrade-content-old-price-day-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt naponta.
subscriptionUpgrade-content-old-price-week-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt hetente.
subscriptionUpgrade-content-old-price-month-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt havonta.
subscriptionUpgrade-content-old-price-halfyear-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt hat havonta.
subscriptionUpgrade-content-old-price-year-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt évente.
subscriptionUpgrade-content-old-price-default-tax = A korábbi díj { $paymentAmountOld } + { $paymentTaxOld } adó volt számlázási időszakonként.
subscriptionUpgrade-content-new-price-day = A továbbiakban naponta { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-week = A továbbiakban hetente { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-month = A továbbiakban havonta { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-halfyear = A továbbiakban hat havonta { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-year = A továbbiakban évente { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-default = A továbbiakban számlázási időszakonként { $paymentAmountNew } összeget fog fizetni, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-day-dtax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva naponta, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-week-tax = A továbbiakban { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva hetente, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-month-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva havonta, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-halfyear-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva hat havonta, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-year-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva évente, a kedvezményeket nem számítva.
subscriptionUpgrade-content-new-price-default-tax = A jövőben { $paymentAmountNew } + { $paymentTaxNew } adó lesz levonva számlázási időszakonként, a kedvezményeket nem számítva.
subscriptionUpgrade-existing = Ha bármelyik meglévő előfizetése fedi ezt a frissítést, akkor azt kezeljük, és külön e-mailt küldünk a részletekről. Ha az új előfizetése telepítést igénylő termékeket tartalmaz, akkor külön e-mailt küldünk a beállítási utasításokkal.
subscriptionUpgrade-auto-renew = Előfizetése számlázási időszakonként automatikusan megújul, hacsak nem dönt úgy, hogy lemondja.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Használja a(z) { $unblockCode } kódot a bejelentkezéshez
unblockCode-preview = Ez a kód egy órán belül lejár
unblockCode-title = Ez az ön bejelentkezése?
unblockCode-prompt = Ha igen, akkor erre az engedélyezési kódra van szüksége:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Ha igen, akkor erre az engedélyezési kódra van szüksége: { $unblockCode }
unblockCode-report = Ha nem, akkor segítsen kivédeni a behatolókat, és <a data-l10n-name="reportSignInLink">jelentse nekünk.</a>
unblockCode-report-plaintext = Ha nem, akkor segítsen kivédeni a behatolókat, és jelentse nekünk.
verificationReminderFinal-subject = Végső emlékeztető, hogy erősítse meg a fiókját
verificationReminderFinal-description-2 = Néhány hete létrehozott egy { -product-mozilla-account }ot, de sosem erősítette meg. Az Ön biztonsága érdekében törölni fogjuk a fiókot, ha a következő 24 órán belül nem igazolja vissza.
confirm-account = Fiók megerősítése
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Emlékeztető, hogy erősítse meg a fiókját
verificationReminderFirst-title-3 = Üdvözli a { -brand-mozilla }!
verificationReminderFirst-description-3 = Néhány napja létrehozott egy { -product-mozilla-account }ot, de sosem erősítette meg. Az Ön biztonsága érdekében törölni fogjuk a fiókot, ha a következő 15 napon belül nem igazolja vissza.
verificationReminderFirst-sub-description-3 = Ne hagyja ki azt a böngészőt, amely Önt és a magánszféráját teszi az első helyre.
confirm-email-2 = Fiók megerősítése
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Fiók megerősítése
verificationReminderSecond-subject-2 = Emlékeztető, hogy erősítse meg a fiókját
verificationReminderSecond-title-3 = Ne hagyja ki a { -brand-mozilla(ending: "accented") }t!
verificationReminderSecond-description-4 = Néhány napja létrehozott egy { -product-mozilla-account }ot, de nem erősítette meg. A következő 10 napon belül erősítse meg fiókját, különben automatikusan törlésre kerül.
verificationReminderSecond-second-description-3 = A { -product-mozilla-account }ja segítségével szinkronizálhatja a { -brand-firefox(case: "accusative") } az eszközök között, és hozzáférést biztosít a { -brand-mozilla } további adatvédelmi termékeihez.
verificationReminderSecond-sub-description-2 = Legyen része küldetésünknek, hogy az internetet mindenki számára nyitott hellyé alakítsuk.
verificationReminderSecond-action-2 = Fiók megerősítése
verify-title-3 = Nyissa meg az internetet a { -brand-mozilla(ending: "accented") }val
verify-description-2 = Erősítse meg fiókját, és hozza ki a lehető legtöbbet a { -brand-mozilla(ending: "accented") }ból mindenhol, ahol bejelentkezik:
verify-subject = A fiókja létrehozásának befejezése
verify-action-2 = Fiók megerősítése
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Ezzel módosíthatja a fiókját: { $code }
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ez a kód { $expirationTime } perc múlva lejár.
       *[other] Ez a kód { $expirationTime } perc múlva lejár.
    }
verifyAccountChange-title = Módosítja a fiókadatait?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Segítsen nekünk megőrizni fiókja biztonságát azzal, hogy jóváhagyja ezt a változást a következő napon:
verifyAccountChange-prompt = Ha igen, akkor itt az engedélyezési kódja:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] { $expirationTime } perc múlva lejár.
       *[other] { $expirationTime } perc múlva lejár.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Bejelentkezett a következőbe: { $clientName }?
verifyLogin-description-2 = Segítsen nekünk megőrizni fiókja biztonságát azzal, hogy megerősíti, hogy Ön jelentkezett be:
verifyLogin-subject-2 = Bejelentkezés megerősítése
verifyLogin-action = Bejelentkezés megerősítése
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Használja a(z) { $code } kódot a bejelentkezéshez
verifyLoginCode-preview = Ez a kód 5 perc múlva lejár.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Bejelentkezett a következőbe: { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Segítsen nekünk megőrizni fiókja biztonságát azzal, hogy jóváhagyja a bejelentkezését:
verifyLoginCode-prompt-3 = Ha igen, akkor itt az engedélyezési kódja:
verifyLoginCode-expiry-notice = 5 perc múlva lejár.
verifyPrimary-title-2 = Elsődleges e-mail-cím megerősítése
verifyPrimary-description = A kérés, hogy módosítsa a fiókját a következő eszközről lett elküldve:
verifyPrimary-subject = Elsődleges e-mail cím megerősítése
verifyPrimary-action-2 = E-mail-cím megerősítése
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Amint megerősíti, a fiókváltoztatások, mint a másodlagos e-mail-cím hozzáadása, lehetségesek lesznek erről az eszközről.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Használja a(z) { $code } kódot a másodlagos e-mail-cím megerősítéséhez
verifySecondaryCode-preview = Ez a kód 5 perc múlva lejár.
verifySecondaryCode-title-2 = Másodlagos e-mail-cím megerősítése
verifySecondaryCode-action-2 = E-mail-cím megerősítése
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = A kérés, hogy a(z) { $email } címet használja másodlagos e-mail-címként a következő { -product-mozilla-account }ból érkezett:
verifySecondaryCode-prompt-2 = Használja ezt a megerősítő kódot:
verifySecondaryCode-expiry-notice-2 = 5 perc múlva lejár. Ha megerősíti, akkor ez a cím meg fogja kapni a biztonsági értesítéseket és megerősítéseket.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Használja a(z) { $code } kódot a fiókja megerősítéséhez
verifyShortCode-preview-2 = Ez a kód 5 perc múlva lejár
verifyShortCode-title-3 = Nyissa meg az internetet a { -brand-mozilla(ending: "accented") }val
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Erősítse meg fiókját, és hozza ki a lehető legtöbbet a { -brand-mozilla(ending: "accented") }ból mindenhol, ahol bejelentkezik:
verifyShortCode-prompt-3 = Használja ezt a megerősítő kódot:
verifyShortCode-expiry-notice = 5 perc múlva lejár.
