## Non-email strings

session-verify-send-push-title-2 = Logujesz się na { -product-mozilla-account(case: "acc", capitalization: "lower") }?
session-verify-send-push-body-2 = Kliknij tutaj, aby potwierdzić, że to Ty
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } to Twój kod weryfikacyjny { -brand-mozilla(case: "gen") }. Wygasa w ciągu 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Kod weryfikacyjny { -brand-mozilla(case: "gen") }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } to Twój kod odzyskiwania { -brand-mozilla(case: "gen") }. Wygasa w ciągu 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Kod { -brand-mozilla(case: "gen") }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } to Twój kod odzyskiwania { -brand-mozilla(case: "gen") }. Wygasa w ciągu 5 minut.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Kod { -brand-mozilla(case: "gen") }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logo { -brand-mozilla(case: "gen") }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synchronizuj urządzenia">
body-devices-image = <img data-l10n-name="devices-image" alt="Urządzenia">
fxa-privacy-url = Zasady ochrony prywatności { -brand-mozilla(case: "gen") }
moz-accounts-privacy-url-2 = Zasady ochrony prywatności { -product-mozilla-accounts(case: "gen", capitalization: "lower") }
moz-accounts-terms-url = Regulamin usługi { -product-mozilla-accounts(case: "gen", capitalization: "lower") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Logo { -brand-mozilla(case: "gen") }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Logo { -brand-mozilla(case: "gen") }">
subplat-automated-email = Wiadomość wygenerowana automatycznie. Jeżeli otrzymano ją przez pomyłkę, to nic nie trzeba robić.
subplat-privacy-notice = Zasady ochrony prywatności
subplat-privacy-plaintext = Zasady ochrony prywatności:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Otrzymujesz tę wiadomość, ponieważ na adres { $email } zarejestrowano { -product-mozilla-account(case: "acc", capitalization: "lower") } i zapisano się na usługę { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Otrzymujesz tę wiadomość, ponieważ { $email } ma { -product-mozilla-account(case: "acc", capitalization: "lower") }.
subplat-explainer-multiple-2 = Otrzymujesz tę wiadomość, ponieważ na adres { $email } zarejestrowano { -product-mozilla-account(case: "acc", capitalization: "lower") } i subskrybowano wiele produktów.
subplat-explainer-was-deleted-2 = Otrzymujesz tę wiadomość, ponieważ na adres { $email } zarejestrowano { -product-mozilla-account(case: "acc", capitalization: "lower") }.
subplat-manage-account-2 = Zarządzaj ustawieniami { -product-mozilla-account(case: "gen", capitalization: "lower") } na stronie swojego <a data-l10n-name="subplat-account-page">konta</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Zarządzaj ustawieniami { -product-mozilla-account(case: "gen", capitalization: "lower") } na stronie swojego konta: { $accountSettingsUrl }
subplat-terms-policy = Regulamin i zasady anulowania
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Anuluj subskrypcję
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Ponownie aktywuj subskrypcję
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Zaktualizuj dane płatnicze
subplat-privacy-policy = Zasady ochrony prywatności { -brand-mozilla(case: "gen") }
subplat-privacy-policy-2 = Zasady ochrony prywatności { -product-mozilla-accounts(case: "gen", capitalization: "lower") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Regulamin usługi { -product-mozilla-accounts(case: "gen", capitalization: "lower") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Podstawa prawna
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Prywatność
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Jeśli Twoje konto zostanie usunięte, nadal będziesz otrzymywać wiadomości e-mail od Mozilla Corporation i Mozilla Foundation, chyba że <a data-l10n-name="unsubscribeLink">zrezygnujesz z subskrypcji</a>.
account-deletion-info-block-support = Jeśli masz pytania lub potrzebujesz pomocy, skontaktuj się z naszym <a data-l10n-name="supportLink">zespołem wsparcia</a>.
account-deletion-info-block-communications-plaintext = Jeśli Twoje konto zostanie usunięte, nadal będziesz otrzymywać wiadomości e-mail od Mozilla Corporation i Mozilla Foundation, chyba że zrezygnujesz z subskrypcji:
account-deletion-info-block-support-plaintext = Jeśli masz pytania lub potrzebujesz pomocy, skontaktuj się z naszym zespołem wsparcia:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Pobierz program { $productName } z { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Pobierz program { $productName } na { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Zainstaluj program { $productName } na <a data-l10n-name="anotherDeviceLink">innym komputerze</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Zainstaluj program { $productName } na <a data-l10n-name="anotherDeviceLink">innym urządzeniu</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Pobierz program { $productName } z Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Pobierz program { $productName } z App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Zainstaluj program { $productName } na innym urządzeniu:
automated-email-change-2 = Jeśli to nie Twoje działanie, natychmiast <a data-l10n-name="passwordChangeLink">zmień hasło</a>.
automated-email-support = Więcej informacji można znaleźć w <a data-l10n-name="supportLink">pomocy { -brand-mozilla(case: "gen") }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Jeśli to nie Twoje działanie, natychmiast zmień hasło:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Więcej informacji można znaleźć w pomocy { -brand-mozilla(case: "gen") }:
automated-email-inactive-account = Wiadomość wygenerowana automatycznie. Otrzymujesz ją, ponieważ masz { -product-mozilla-account(case: "nom", capitalization: "lower") } i minęły 2 lata od Twojego ostatniego logowania.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Więcej informacji można znaleźć w <a data-l10n-name="supportLink">pomocy { -brand-mozilla(case: "gen") }</a>.
automated-email-no-action-plaintext = Wiadomość wygenerowana automatycznie. Jeżeli otrzymano ją przez pomyłkę, to nic nie trzeba robić.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Wiadomość wygenerowana automatycznie. Jeżeli nie upoważniono wykonania tej czynności, to należy zmienić hasło:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Zmiana z przeglądarki { $uaBrowser } w systemie { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Zmiana z przeglądarki { $uaBrowser } w systemie { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Zmiana z przeglądarki { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Zmiana z systemu { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Zmiana z systemu { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Jeśli to nie Ty, <a data-l10n-name="revokeAccountRecoveryLink">usuń nowy klucz</a> i <a data-l10n-name="passwordChangeLink">zmień hasło</a>.
automatedEmailRecoveryKey-change-pwd-only = Jeśli to nie Ty, <a data-l10n-name="passwordChangeLink">zmień hasło</a>.
automatedEmailRecoveryKey-more-info = Więcej informacji można znaleźć w <a data-l10n-name="supportLink">pomocy { -brand-mozilla(case: "gen") }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Zmiana z urządzenia:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Jeśli to nie Ty, usuń nowy klucz:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Jeśli to nie Ty, zmień hasło:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = i zmień hasło:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Więcej informacji można znaleźć w pomocy { -brand-mozilla(case: "gen") }:
automated-email-reset =
    Wiadomość wygenerowana automatycznie. Jeżeli nie upoważniono wykonania tej czynności, to należy <a data-l10n-name="resetLink">zmienić hasło</a>.
    Więcej informacji można znaleźć w <a data-l10n-name="supportLink">pomocy { -brand-mozilla(case: "gen") }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Jeżeli nie upoważniono wykonania tej czynności, to należy teraz zmienić hasło pod adresem { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Jeśli to nie Twoje działanie, to natychmiast <a data-l10n-name="resetLink">zmień swoje hasło</a> i <a data-l10n-name="twoFactorSettingsLink">przywróć uwierzytelnianie dwuetapowe</a>.
    Więcej informacji można znaleźć w <a data-l10n-name="supportLink">pomocy { -brand-mozilla(case: "gen") }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Jeśli to nie Twoje działanie, natychmiast zmień hasło na:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Zmień także uwierzytelnianie dwuetapowe na:
brand-banner-message = Czy wiesz, że zmieniliśmy naszą nazwę z { -product-firefox-accounts(case: "gen", capitalization: "lower") } na { -product-mozilla-accounts(case: "acc", capitalization: "lower") }? <a data-l10n-name="learnMore">Więcej informacji</a>
cancellationSurvey = Pomóż nam ulepszać nasze usługi wypełniając tę <a data-l10n-name="cancellationSurveyUrl">krótką ankietę</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Pomóż nam ulepszać nasze usługi wypełniając tę krótką ankietę:
change-password-plaintext = Jeśli istnieją podejrzenia, że ktoś próbuje uzyskać dostęp do konta, to prosimy zmienić hasło.
manage-account = Zarządzaj kontem
manage-account-plaintext = { manage-account }:
payment-details = Informacje o płatności:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Numer faktury: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Obciążono: { $invoiceTotal } w dniu { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Następna faktura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Metoda płatności:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Metoda płatności: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Metoda płatności: Karta { $cardName } kończąca się na { $lastFour }
payment-provider-card-ending-in-plaintext = Metoda płatności: Karta kończąca się na { $lastFour }
payment-provider-card-ending-in = <b>Metoda płatności:</b> Karta kończąca się na { $lastFour }
payment-provider-card-ending-in-card-name = <b>Metoda płatności:</b> Karta { $cardName } kończąca się na { $lastFour }

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Suma częściowa: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-discount = Zniżka
subscription-charges-discount-plaintext = Zniżka: { $invoiceDiscountAmount }

##

subscriptionSupport = Masz pytania dotyczące subskrypcji? Nasz <a data-l10n-name="subscriptionSupportUrl">zespół wsparcia</a> Ci pomoże.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Masz pytania dotyczące subskrypcji? Nasz zespół wsparcia Ci pomoże:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Dziękujemy za subskrypcję { $productName }. Prosimy <a data-l10n-name="subscriptionSupportUrl">skontaktować się z nami</a>, jeśli masz jakieś pytania na temat subskrypcji lub potrzebujesz uzyskać więcej informacji o { $productName }.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Dziękujemy za subskrypcję { $productName }. Prosimy skontaktować się z nami, jeśli masz jakieś pytania na temat subskrypcji lub potrzebujesz uzyskać więcej informacji o { $productName }:
subscriptionUpdateBillingEnsure = <a data-l10n-name="updateBillingUrl">Tutaj</a> można upewnić się, że metoda płatności i informacje o koncie są aktualne.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Tutaj można upewnić się, że metoda płatności i informacje o koncie są aktualne:
subscriptionUpdateBillingTry = Spróbujemy ponownie dokonać płatności w ciągu kilku kolejnych dni, ale być może musisz nam pomóc to naprawić, <a data-l10n-name="updateBillingUrl">aktualizując informacje o płatności</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Spróbujemy ponownie dokonać płatności w ciągu kilku kolejnych dni, ale być może musisz nam pomóc to naprawić, aktualizując informacje o płatności:
subscriptionUpdatePayment = Aby zapobiec przerwom w działaniu, prosimy <a data-l10n-name="updateBillingUrl">zaktualizować informacje o płatności</a> tak szybko, jak to możliwe.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Aby zapobiec przerwom w działaniu, prosimy zaktualizować informacje o płatności tak szybko, jak to możliwe:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Więcej informacji można znaleźć w <a data-l10n-name="supportLink">pomocy { -brand-mozilla(case: "gen") }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Więcej informacji można znaleźć w pomocy { -brand-mozilla(case: "gen") }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } w systemie { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } w systemie { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (przybliżone)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (przybliżone)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (przybliżone)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (przybliżone)
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Wyświetl fakturę: { $invoiceLink }
cadReminderFirst-subject-1 = Przypomnienie! Zsynchronizujmy { -brand-firefox(case: "acc") }
cadReminderFirst-action = Synchronizuj inne urządzenie
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Do synchronizacji trzeba dwojga
cadReminderFirst-description-v2 = Korzystaj ze swoich kart na wszystkich urządzeniach. Miej swoje zakładki, hasła i inne dane wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
cadReminderSecond-subject-2 = Nie przegap! Dokończmy konfigurację synchronizacji
cadReminderSecond-action = Synchronizuj inne urządzenie
cadReminderSecond-title-2 = Nie zapomnij zsynchronizować!
cadReminderSecond-description-sync = Synchronizuj zakładki, hasła, otwarte karty i nie tylko — wszędzie tam, gdzie używasz { -brand-firefox(case: "acc") }.
cadReminderSecond-description-plus = Dodatkowo Twoje dane są zawsze zaszyfrowane. Wyłącznie Ty i zatwierdzone przez Ciebie urządzenia mogą je widzieć.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Witamy w { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Witamy w { $productName }
downloadSubscription-content-2 = Zacznij korzystać ze wszystkich funkcji zawartych w subskrypcji:
downloadSubscription-link-action-2 = Zacznij teraz
fraudulentAccountDeletion-subject-2 = Twoje { -product-mozilla-account(case: "nom", capitalization: "lower") } zostało usunięte
fraudulentAccountDeletion-title = Twoje konto zostało usunięte
fraudulentAccountDeletion-content-part1-v2 = Niedawno za pomocą tego adresu e-mail utworzono { -product-mozilla-account(case: "acc", capitalization: "lower") } i naliczono subskrypcję. Tak jak w przypadku każdego nowego konta, poprosiliśmy o jego potwierdzenie, najpierw weryfikując ten adres e-mail.
fraudulentAccountDeletion-content-part2-v2 = Na tę chwilę widzimy, że konto nigdy nie zostało potwierdzone. Ponieważ ten krok nie został ukończony, nie jesteśmy pewni, czy subskrypcja została upoważniona. Z tego powodu { -product-mozilla-account(case: "nom", capitalization: "lower") } zarejestrowane na ten adres e-mail zostało usunięte, a subskrypcja anulowana ze zwrotem wszystkich opłat.
fraudulentAccountDeletion-contact = W razie pytań prosimy o kontakt z naszym <a data-l10n-name="mozillaSupportUrl">zespołem wsparcia</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = W razie pytań prosimy o kontakt z naszym zespołem wsparcia: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Ostatnia szansa na zachowanie { -product-mozilla-account(case: "gen", capitalization: "lower") }
inactiveAccountFinalWarning-title = Twoje konto i dane { -brand-mozilla(case: "gen") } zostaną usunięte
inactiveAccountFinalWarning-preview = Zaloguj się, aby zachować swoje konto
inactiveAccountFinalWarning-account-description = Twoje { -product-mozilla-account(case: "nom", capitalization: "lower") } daje dostęp do bezpłatnych produktów do przeglądania i chroniących prywatność, takich jak synchronizacja { -brand-firefox(case: "gen") }, { -product-mozilla-monitor }, { -product-firefox-relay } i { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> to dzień, w którym Twoje konto i dane zostaną trwale usunięte, chyba że się zalogujesz.
inactiveAccountFinalWarning-action = Zaloguj się, aby zachować swoje konto
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Zaloguj się, aby zachować swoje konto:
inactiveAccountFirstWarning-subject = Nie strać swojego konta
inactiveAccountFirstWarning-title = Czy chcesz zachować swoje konto i dane { -brand-mozilla(case: "gen") }?
inactiveAccountFirstWarning-account-description-v2 = Twoje { -product-mozilla-account(case: "nom", capitalization: "lower") } daje dostęp do bezpłatnych produktów do przeglądania i chroniących prywatność, takich jak synchronizacja { -brand-firefox(case: "gen") }, { -product-mozilla-monitor }, { -product-firefox-relay } i { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Zauważyliśmy, że ostatnie logowanie miało miejsce dwa lata temu.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = <strong>{ $deletionDate }</strong> to dzień, w którym Twoje konto i dane zostaną trwale usunięte z powodu nieaktywności.
inactiveAccountFirstWarning-action = Zaloguj się, aby zachować swoje konto
inactiveAccountFirstWarning-preview = Zaloguj się, aby zachować swoje konto
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Zaloguj się, aby zachować swoje konto:
inactiveAccountSecondWarning-subject = Wymagane jest działanie: usunięcie konta za 7 dni
inactiveAccountSecondWarning-title = Twoje konto i dane { -brand-mozilla(case: "gen") } zostaną usunięte za 7 dni
inactiveAccountSecondWarning-account-description-v2 = Twoje { -product-mozilla-account(case: "nom", capitalization: "lower") } daje dostęp do bezpłatnych produktów do przeglądania i chroniących prywatność, takich jak synchronizacja { -brand-firefox(case: "gen") }, { -product-mozilla-monitor }, { -product-firefox-relay } i { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = <strong>{ $deletionDate }</strong> to dzień, w którym Twoje konto i dane zostaną trwale usunięte z powodu nieaktywności.
inactiveAccountSecondWarning-action = Zaloguj się, aby zachować swoje konto
inactiveAccountSecondWarning-preview = Zaloguj się, aby zachować swoje konto
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Zaloguj się, aby zachować swoje konto:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Zapasowe kody uwierzytelniania się skończyły!
codes-reminder-title-one = Został ostatni zapasowy kod uwierzytelniania
codes-reminder-title-two = Czas utworzyć więcej zapasowych kodów uwierzytelniania
codes-reminder-description-part-one = Zapasowe kody uwierzytelniania pomogą przywrócić Twoje dane, kiedy zapomnisz hasła.
codes-reminder-description-part-two = Utwórz nowe kody teraz, aby później nie utracić swoich danych.
codes-reminder-description-two-left = Zostały tylko dwa kody.
codes-reminder-description-create-codes = Utwórz nowe zapasowe kody uwierzytelniania, które pomogą Ci wrócić do konta, jeśli zostanie ono zablokowane.
lowRecoveryCodes-action-2 = Utwórz kody
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nie ma więcej zapasowych kodów uwierzytelniania
        [one] Został tylko { $numberRemaining } zapasowy kod uwierzytelniania!
        [few] Zostały tylko { $numberRemaining } zapasowe kody uwierzytelniania!
       *[many] Zostało tylko { $numberRemaining } zapasowych kodów uwierzytelniania!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nowe logowanie do „{ $clientName }”
newDeviceLogin-subjectForMozillaAccount = Nowe logowanie na Twoim { -product-mozilla-account(case: "loc", capitalization: "lower") }
newDeviceLogin-title-3 = Twoje { -product-mozilla-account(case: "nom", capitalization: "lower") } zostało użyte do zalogowania
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = To nie Ty? <a data-l10n-name="passwordChangeLink">Zmień hasło</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = To nie Ty? Zmień hasło:
newDeviceLogin-action = Zarządzaj kontem
passwordChanged-subject = Zaktualizowano hasło
passwordChanged-title = Pomyślnie zmieniono hasło
passwordChanged-description-2 = Pomyślnie zmieniono hasło { -product-mozilla-account(case: "gen", capitalization: "lower") } z poniższego urządzenia:
passwordChangeRequired-subject = Wykryto podejrzane działania
passwordChangeRequired-preview = Natychmiast zmień hasło
passwordChangeRequired-title-2 = Zmień hasło
passwordChangeRequired-suspicious-activity-3 = Zablokowaliśmy Twoje konto, aby chronić je przed podejrzaną aktywnością. Wylogowano ze wszystkich urządzeń, a wszelkie zsynchronizowane dane zostały usunięte w ramach środków ostrożności.
passwordChangeRequired-sign-in-3 = Aby ponownie zalogować się na swoje konto, wystarczy zmienić hasło.
passwordChangeRequired-different-password-2 = <b>Ważne:</b> wybierz silne hasło inne niż używane wcześniej.
passwordChangeRequired-different-password-plaintext-2 = Ważne: wybierz silne hasło inne niż używane wcześniej.
passwordChangeRequired-action = Zmień hasło
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
password-forgot-otp-preview = Ten kod wygaśnie za 10 minut
password-forgot-otp-title = Nie pamiętasz hasła?
password-forgot-otp-request = Otrzymaliśmy prośbę o zmianę hasła Twojego { -product-mozilla-account(case: "gen", capitalization: "lower") } z urządzenia:
password-forgot-otp-code-2 = Jeśli to Ty, oto kod potwierdzenia:
password-forgot-otp-expiry-notice = Ten kod wygaśnie za 10 minut.
passwordReset-subject-2 = Zmieniono hasło
passwordReset-title-2 = Zmieniono hasło
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Zmieniono hasło { -product-mozilla-account(case: "gen", capitalization: "lower") } na urządzeniu:
passwordResetAccountRecovery-subject-2 = Zmieniono hasło
passwordResetAccountRecovery-title-3 = Zmieniono hasło
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Użyto klucza odzyskiwania konta, aby zmienić hasło { -product-mozilla-account(case: "gen", capitalization: "lower") } na urządzeniu:
passwordResetAccountRecovery-information = Wylogowaliśmy Cię ze wszystkich synchronizowanych urządzeń. Utworzyliśmy nowy klucz odzyskiwania konta, aby zastąpić ten zużyty. Można go zmienić w ustawieniach konta.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Wylogowaliśmy Cię ze wszystkich synchronizowanych urządzeń. Utworzyliśmy nowy klucz odzyskiwania konta, aby zastąpić ten zużyty. Można go zmienić w ustawieniach konta:
passwordResetAccountRecovery-action-4 = Zarządzaj kontem
passwordResetRecoveryPhone-subject = Użyto telefonu odzyskiwania
passwordResetRecoveryPhone-preview = Sprawdź, czy to na pewno Ty
passwordResetRecoveryPhone-title = Telefon odzyskiwania został użyty do potwierdzenia zmiany hasła
passwordResetRecoveryPhone-device = Użyto telefonu odzyskiwania z urządzenia:
passwordResetRecoveryPhone-action = Zarządzaj kontem
passwordResetWithRecoveryKeyPrompt-subject = Zmieniono hasło
passwordResetWithRecoveryKeyPrompt-title = Zmieniono hasło
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Zmieniono hasło { -product-mozilla-account(case: "gen", capitalization: "lower") } na urządzeniu:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Utwórz klucz odzyskiwania konta
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Utwórz klucz odzyskiwania konta:
passwordResetWithRecoveryKeyPrompt-cta-description = Będzie trzeba zalogować się ponownie na wszystkich synchronizowanych urządzeniach. Następnym razem chroń swoje dane za pomocą klucza odzyskiwania konta. Dzięki temu odzyskasz swoje dane, jeśli zapomnisz hasła.
postAddAccountRecovery-subject-3 = Utworzono nowy klucz odzyskiwania konta
postAddAccountRecovery-title2 = Utworzono nowy klucz odzyskiwania konta
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Zachowaj ten klucz w bezpiecznym miejscu — będzie Ci potrzebny do przywrócenia zaszyfrowanych danych przeglądania, jeśli zapomnisz hasła.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Tego klucza można użyć tylko raz. Po jego wykorzystaniu automatycznie utworzymy dla Ciebie nowy. Możesz też w każdej chwili utworzyć nowy w ustawieniach konta.
postAddAccountRecovery-action = Zarządzaj kontem
postAddLinkedAccount-subject-2 = Nowe konto powiązane z { -product-mozilla-account(case: "ins") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Konto { $providerName } zostało powiązane z { -product-mozilla-account(case: "ins", capitalization: "lower") }
postAddLinkedAccount-action = Zarządzaj kontem
postAddRecoveryPhone-subject = Dodano telefon odzyskiwania
postAddRecoveryPhone-preview = Konto chronione przez uwierzytelnianie dwuetapowe
postAddRecoveryPhone-title-v2 = Dodano numer telefonu odzyskiwania
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Dodano { $maskedLastFourPhoneNumber } jako numer telefonu odzyskiwania
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = W jaki sposób chroni to Twoje konto
postAddRecoveryPhone-how-protect-plaintext = W jaki sposób chroni to Twoje konto:
postAddRecoveryPhone-enabled-device = Włączono je z urządzenia:
postAddRecoveryPhone-action = Zarządzaj kontem
postAddTwoStepAuthentication-preview = Twoje konto jest chronione
postAddTwoStepAuthentication-subject-v3 = Uwierzytelnianie dwuetapowe jest włączone
postAddTwoStepAuthentication-title-2 = Włączono uwierzytelnianie dwuetapowe
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Zażądano z urządzenia:
postAddTwoStepAuthentication-action = Zarządzaj kontem
postAddTwoStepAuthentication-code-required-v4 = Od teraz podczas każdego logowania wymagane są kody zabezpieczeń z aplikacji uwierzytelniającej.
postAddTwoStepAuthentication-recovery-method-codes = Dodano również zapasowe kody uwierzytelniania jako metodę odzyskiwania.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Dodano również { $maskedPhoneNumber } jako numer telefonu odzyskiwania.
postAddTwoStepAuthentication-how-protects-link = W jaki sposób chroni to Twoje konto
postAddTwoStepAuthentication-how-protects-plaintext = W jaki sposób chroni to Twoje konto:
postChangeAccountRecovery-subject = Zmieniono klucz odzyskiwania konta
postChangeAccountRecovery-title = Zmieniono klucz odzyskiwania konta
postChangeAccountRecovery-body-part1 = Masz teraz nowy klucz odzyskiwania konta. Twój poprzedni klucz został usunięty.
postChangeAccountRecovery-body-part2 = Zachowaj ten nowy klucz w bezpiecznym miejscu — będzie Ci potrzebny do przywrócenia zaszyfrowanych danych przeglądania, jeśli zapomnisz hasła.
postChangeAccountRecovery-action = Zarządzaj kontem
postChangePrimary-subject = Zaktualizowano główny adres e-mail
postChangePrimary-title = Nowy główny adres e-mail
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Pomyślnie zmieniono główny adres e-mail na { $email }. Ten adres jest teraz nazwą użytkownika do logowania na { -product-mozilla-account(case: "loc", capitalization: "lower") }, a także adresem odbierającym powiadomienia bezpieczeństwa
postChangePrimary-action = Zarządzaj kontem
postChangeRecoveryPhone-subject = Zaktualizowano telefon odzyskiwania
postChangeRecoveryPhone-preview = Konto chronione przez uwierzytelnianie dwuetapowe
postChangeRecoveryPhone-title = Zmieniono telefon odzyskiwania
postChangeRecoveryPhone-description = Masz teraz nowy telefon odzyskiwania. Twój poprzedni numer telefonu został usunięty.
postChangeRecoveryPhone-requested-device = Zażądano z urządzenia:
postChangeTwoStepAuthentication-preview = Twoje konto jest chronione
postChangeTwoStepAuthentication-subject = Zaktualizowano uwierzytelnianie dwuetapowe
postChangeTwoStepAuthentication-title = Uwierzytelnianie dwuetapowe zostało zaktualizowane
postChangeTwoStepAuthentication-use-new-account = Teraz musisz używać nowego wpisu { -product-mozilla-account(case: "gen", capitalization: "lower") } w swojej aplikacji uwierzytelniającej. Poprzedni wpis nie będzie już działał i możesz go usunąć.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Zażądano z urządzenia:
postChangeTwoStepAuthentication-action = Zarządzaj kontem
postChangeTwoStepAuthentication-how-protects-link = W jaki sposób chroni to Twoje konto
postChangeTwoStepAuthentication-how-protects-plaintext = W jaki sposób chroni to Twoje konto:
postConsumeRecoveryCode-title-3 = Zapasowy kod uwierzytelniania został użyty do potwierdzenia zmiany hasła
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Użyto kodu z urządzenia:
postConsumeRecoveryCode-action = Zarządzaj kontem
postConsumeRecoveryCode-subject-v3 = Użyto zapasowego kodu uwierzytelniania
postConsumeRecoveryCode-preview = Sprawdź, czy to na pewno Ty
postNewRecoveryCodes-subject-2 = Nowe zapasowe kody uwierzytelniania zostały utworzone
postNewRecoveryCodes-title-2 = Utworzono nowe zapasowe kody uwierzytelniania
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Utworzono je na urządzeniu:
postNewRecoveryCodes-action = Zarządzaj kontem
postRemoveAccountRecovery-subject-2 = Klucz odzyskiwania konta został usunięty
postRemoveAccountRecovery-title-3 = Usunięto klucz odzyskiwania konta
postRemoveAccountRecovery-body-part1 = Twój klucz odzyskiwania konta jest wymagany do przywrócenia zaszyfrowanych danych logowania, jeśli zapomnisz hasła.
postRemoveAccountRecovery-body-part2 = Jeśli jeszcze go nie masz, utwórz nowy klucz odzyskiwania konta w ustawieniach konta, aby zapobiec utracie zachowanych haseł, zakładek, historii przeglądania i innych danych.
postRemoveAccountRecovery-action = Zarządzaj kontem
postRemoveRecoveryPhone-subject = Usunięto telefon odzyskiwania
postRemoveRecoveryPhone-preview = Konto chronione przez uwierzytelnianie dwuetapowe
postRemoveRecoveryPhone-title = Usunięto telefon odzyskiwania
postRemoveRecoveryPhone-description-v2 = Telefon odzyskiwania został usunięty z ustawień uwierzytelniania dwuetapowego.
postRemoveRecoveryPhone-description-extra = Jeśli nie możesz użyć aplikacji uwierzytelniającej, nadal możesz się zalogować za pomocą zapasowych kodów uwierzytelniania.
postRemoveRecoveryPhone-requested-device = Zażądano z urządzenia:
postRemoveSecondary-subject = Usunięto dodatkowy adres e-mail
postRemoveSecondary-title = Usunięto dodatkowy adres e-mail
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Pomyślnie usunięto dodatkowy adres e-mail { $secondaryEmail } z { -product-mozilla-account(case: "gen", capitalization: "lower") }. Powiadomienia bezpieczeństwa i potwierdzenia logowania nie będą już wysyłane na ten adres.
postRemoveSecondary-action = Zarządzaj kontem
postRemoveTwoStepAuthentication-subject-line-2 = Uwierzytelnianie dwuetapowe zostało wyłączone
postRemoveTwoStepAuthentication-title-2 = Wyłączono uwierzytelnianie dwuetapowe
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Wyłączono je z urządzenia:
postRemoveTwoStepAuthentication-action = Zarządzaj kontem
postRemoveTwoStepAuthentication-not-required-2 = Nie potrzebujesz już kodów zabezpieczeń z aplikacji uwierzytelniającej podczas logowania.
postSigninRecoveryCode-subject = Użyto zapasowego kodu uwierzytelniania do zalogowania
postSigninRecoveryCode-preview = Potwierdź działania na koncie
postSigninRecoveryCode-title = Zapasowy kod uwierzytelniania został użyty do zalogowania
postSigninRecoveryCode-description = Jeśli to nie jest Twoje działanie, to należy natychmiast zmienić hasło, aby zapewnić bezpieczeństwo konta.
postSigninRecoveryCode-device = Zalogowano z urządzenia:
postSigninRecoveryCode-action = Zarządzaj kontem
postSigninRecoveryPhone-subject = Użyto telefonu odzyskiwania do zalogowania
postSigninRecoveryPhone-preview = Potwierdź działania na koncie
postSigninRecoveryPhone-title = Telefon odzyskiwania został użyty do zalogowania
postSigninRecoveryPhone-description = Jeśli to nie jest Twoje działanie, to należy natychmiast zmienić hasło, aby zapewnić bezpieczeństwo konta.
postSigninRecoveryPhone-device = Zalogowano z urządzenia:
postSigninRecoveryPhone-action = Zarządzaj kontem
postVerify-sub-title-3 = Cieszymy się, że Cię widzimy!
postVerify-title-2 = Chcesz mieć tę samą kartę na dwóch urządzeniach?
postVerify-description-2 = To łatwe! Wystarczy zainstalować { -brand-firefox(case: "acc") } na innym urządzeniu i zalogować się do synchronizacji. To jak magia!
postVerify-sub-description = (A przy okazji… oznacza to, że możesz mieć swoje zakładki, hasła i wszystkie inne dane { -brand-firefox(case: "gen") } wszędzie tam, gdzie się zalogujesz.)
postVerify-subject-4 = Witamy w { -brand-mozilla(case: "loc") }!
postVerify-setup-2 = Połącz inne urządzenie:
postVerify-action-2 = Połącz inne urządzenie
postVerifySecondary-subject = Dodano dodatkowy adres e-mail
postVerifySecondary-title = Dodano dodatkowy adres e-mail
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Pomyślnie potwierdzono { $secondaryEmail } jako dodatkowy adres e-mail dla { -product-mozilla-account(case: "gen", capitalization: "lower") }. Powiadomienia bezpieczeństwa i potwierdzenia logowania będą teraz wysyłane na oba adresy.
postVerifySecondary-action = Zarządzaj kontem
recovery-subject = Zmień hasło
recovery-title-2 = Nie pamiętasz hasła?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Otrzymaliśmy prośbę o zmianę hasła Twojego { -product-mozilla-account(case: "gen", capitalization: "lower") } z urządzenia:
recovery-new-password-button = Utwórz nowe hasło, klikając poniższy przycisk. Ten odnośnik wygaśnie w ciągu godziny.
recovery-copy-paste = Utwórz nowe hasło, kopiując i wklejając poniższy adres do przeglądarki. Ten odnośnik wygaśnie w ciągu godziny.
recovery-action = Utwórz nowe hasło
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Subskrypcja { $productName } została anulowana
subscriptionAccountDeletion-title = Przykro nam, że chcesz się z nami pożegnać
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Niedawno usunięto { -product-mozilla-account(case: "acc", capitalization: "lower") }. Z tego powodu anulowaliśmy subskrypcję { $productName }. Ostatnia płatność w wysokości { $invoiceTotal } została opłacona w dniu { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Witamy w { $productName }: prosimy ustawić swoje hasło.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Witamy w { $productName }
subscriptionAccountFinishSetup-content-processing = Płatność jest przetwarzana, co może zająć do czterech dni roboczych. Subskrypcja będzie automatycznie odnawiana z każdym okresem rozliczeniowym, chyba że zdecydujesz się ją anulować.
subscriptionAccountFinishSetup-content-create-3 = Następnie utworzysz hasło { -product-mozilla-account(case: "gen", capitalization: "lower") }, aby zacząć korzystać z nowej subskrypcji.
subscriptionAccountFinishSetup-action-2 = Zacznij teraz
subscriptionAccountReminderFirst-subject = Przypomnienie: dokończ konfigurację konta
subscriptionAccountReminderFirst-title = Nie masz jeszcze dostępu do swojej subskrypcji
subscriptionAccountReminderFirst-content-info-3 = Kilka dni temu utworzono { -product-mozilla-account(case: "acc", capitalization: "lower") }, ale nigdy go nie potwierdzono. Mamy nadzieję, że dokończysz konfigurowanie konta, aby móc korzystać ze swojej nowej subskrypcji.
subscriptionAccountReminderFirst-content-select-2 = Kliknij „Utwórz hasło”, aby ustawić nowe hasło i dokończyć potwierdzanie konta.
subscriptionAccountReminderFirst-action = Utwórz hasło
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Ostatnie przypomnienie: skonfiguruj swoje konto
subscriptionAccountReminderSecond-title-2 = Witamy w { -brand-mozilla(case: "loc") }!
subscriptionAccountReminderSecond-content-info-3 = Kilka dni temu utworzono { -product-mozilla-account(case: "acc", capitalization: "lower") }, ale nigdy go nie potwierdzono. Mamy nadzieję, że dokończysz konfigurowanie konta, aby móc korzystać ze swojej nowej subskrypcji.
subscriptionAccountReminderSecond-content-select-2 = Kliknij „Utwórz hasło”, aby ustawić nowe hasło i dokończyć potwierdzanie konta.
subscriptionAccountReminderSecond-action = Utwórz hasło
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Subskrypcja { $productName } została anulowana
subscriptionCancellation-title = Przykro nam, że chcesz się z nami pożegnać

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Anulowaliśmy Twoją subskrypcję { $productName }. Ostatnia płatność w wysokości { $invoiceTotal } została opłacona w dniu { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Anulowaliśmy Twoją subskrypcję { $productName }. Ostatnia płatność w wysokości { $invoiceTotal } zostanie opłacona w dniu { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Usługa będzie działać do końca bieżącego okresu rozliczeniowego, czyli do { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Przełączono na { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Pomyślnie przełączono z { $productNameOld } na { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Zaczynając od następnego rachunku, opłata zostanie zmieniona z { $paymentAmountOld } na { $productPaymentCycleOld } na { $paymentAmountNew } na { $productPaymentCycleNew }. Wtedy też otrzymasz jednorazową sumę { $paymentProrated } na koncie, aby odzwierciedlić niższą opłatę przez pozostały czas tego okresu ({ $productPaymentCycleOld }).
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Jeśli do korzystania z { $productName } będzie potrzebna instalacja nowego oprogramowania, to otrzymasz oddzielną wiadomość z instrukcjami pobierania.
subscriptionDowngrade-content-auto-renew = Subskrypcja będzie automatycznie odnawiana z każdym okresem rozliczeniowym, chyba że zdecydujesz się ją anulować.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Subskrypcja { $productName } została anulowana
subscriptionFailedPaymentsCancellation-title = Twoja subskrypcja została anulowana
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Anulowaliśmy subskrypcję { $productName } z powodu niepowodzenia wielokrotnych prób płatności. Aby odzyskać dostęp, rozpocznij nową subskrypcję ze zaktualizowaną metodą płatności.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Potwierdzono płatność za { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Dziękujemy za subskrypcję { $productName }
subscriptionFirstInvoice-content-processing = Płatność jest obecnie przetwarzana, co może zająć do czterech dni roboczych.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Otrzymasz oddzielną wiadomość z informacjami o tym, jak zacząć korzystać z { $productName }.
subscriptionFirstInvoice-content-auto-renew = Subskrypcja będzie automatycznie odnawiana z każdym okresem rozliczeniowym, chyba że zdecydujesz się ją anulować.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Płatność za { $productName } się nie powiodła
subscriptionPaymentFailed-title = Przepraszamy, mamy problem z obsługą płatności
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Wystąpił problem z obsługą ostatniej płatności za { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Wymagana jest aktualizacja informacji o płatności za { $productName }
subscriptionPaymentProviderCancelled-title = Przepraszamy, mamy problem z wybraną metodą płatności
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Wykryliśmy problem z wybraną metodą płatności za { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Ponownie aktywowano subskrypcję { $productName }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Dziękujemy za ponowną aktywację subskrypcji { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Twój okres rozliczeniowy i płatność pozostaną takie same. Następna opłata będzie wynosiła { $invoiceTotal } w dniu { $nextInvoiceDateOnly }. Subskrypcja będzie automatycznie odnawiana z każdym okresem rozliczeniowym, chyba że zdecydujesz się ją anulować.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Powiadomienie o automatycznym odnowieniu { $productName }
subscriptionRenewalReminder-title = Subskrypcja zostanie niedługo odnowiona
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Drogi kliencie { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Obecna subskrypcja jest ustawiona na automatyczne odnowienie za { $reminderLength } dni. Tego dnia { -brand-mozilla } odnowi subskrypcję { $planIntervalCount } { $planInterval }, a opłata w wysokości { $invoiceTotal } zostanie pobrana za pomocą metody płatności konta.
subscriptionRenewalReminder-content-closing = Z pozdrowieniami,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Zespół { $productName }
subscriptionReplaced-subject = Subskrypcja została zaktualizowana w ramach przełączenia
subscriptionReplaced-title = Subskrypcja została zaktualizowana
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Indywidualna subskrypcja { $productName } została zastąpiona i jest teraz częścią pakietu.
subscriptionReplaced-content-credit = Otrzymasz środki za wszelki niewykorzystany czas z poprzedniej subskrypcji. Te środki zostaną automatycznie zastosowane do konta i będą wykorzystywane na rzecz przyszłych opłat.
subscriptionReplaced-content-no-action = Nic nie musisz robić.
subscriptionsPaymentProviderCancelled-subject = Wymagana jest aktualizacja informacji o płatności za subskrypcje { -brand-mozilla(case: "gen") }
subscriptionsPaymentProviderCancelled-title = Przepraszamy, mamy problem z wybraną metodą płatności
subscriptionsPaymentProviderCancelled-content-detected = Wykryliśmy problem z wybraną metodą płatności za poniższe subskrypcje.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Otrzymano płatność za { $productName }
subscriptionSubsequentInvoice-title = Dziękujemy za subskrypcję!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Otrzymaliśmy ostatnią płatność za { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Przełączono na { $productName }
subscriptionUpgrade-title = Dziękujemy!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Pomyślnie przełączono na { $productName }

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Została naliczona jednorazowa opłata w wysokości { $invoiceAmountDue }, która odzwierciedla wyższą cenę subskrypcji za pozostałą część tego okresu rozliczeniowego ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Otrzymano środki na koncie w wysokości { $paymentProrated }.
subscriptionUpgrade-existing = Jeśli któraś z istniejących subskrypcji pokrywa się z tym przełączeniem, zajmiemy się nimi i wyślemy Ci osobną wiadomość e-mail z informacjami. Jeśli nowy plan obejmuje produkty wymagające instalacji, wyślemy Ci osobną wiadomość e-mail z instrukcjami konfiguracji.
subscriptionUpgrade-auto-renew = Subskrypcja będzie automatycznie odnawiana z każdym okresem rozliczeniowym, chyba że zdecydujesz się ją anulować.
unblockCode-preview = Ten kod wygaśnie za godzinę
unblockCode-title = Czy to Ty się logujesz?
unblockCode-prompt = Jeśli tak, to potrzebny jest ten kod upoważnienia:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Jeśli tak, to potrzebny jest ten kod upoważnienia: { $unblockCode }
unblockCode-report = Jeśli nie, prosimy pomóc nam odpędzić intruzów <a data-l10n-name="reportSignInLink">zgłaszając to</a>.
unblockCode-report-plaintext = Jeśli nie, prosimy pomóc nam odpędzić intruzów zgłaszając to.
verificationReminderFinal-subject = Ostatnie przypomnienie o potwierdzeniu konta
verificationReminderFinal-description-2 = Kilka tygodni temu utworzono { -product-mozilla-account(case: "acc", capitalization: "lower") }, ale nigdy go nie potwierdzono. Ze względów bezpieczeństwa usuniemy je, jeśli nie zostanie zweryfikowane w ciągu najbliższych 24 godzin.
confirm-account = Potwierdź konto
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Pamiętaj o potwierdzeniu konta
verificationReminderFirst-title-3 = Witamy w { -brand-mozilla(case: "loc") }!
verificationReminderFirst-description-3 = Kilka dni temu utworzono { -product-mozilla-account(case: "acc", capitalization: "lower") }, ale nigdy go nie potwierdzono. Potwierdź je w ciągu najbliższych 15 dni, w przeciwnym razie zostanie ono automatycznie usunięte.
verificationReminderFirst-sub-description-3 = Nie przegap przeglądarki, która stawia Ciebie i Twoją prywatność na pierwszym miejscu.
confirm-email-2 = Potwierdź konto
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Potwierdź konto
verificationReminderSecond-subject-2 = Pamiętaj o potwierdzeniu konta
verificationReminderSecond-title-3 = Nie przegap { -brand-mozilla(case: "gen") }!
verificationReminderSecond-description-4 = Kilka dni temu utworzono { -product-mozilla-account(case: "acc", capitalization: "lower") }, ale nigdy go nie potwierdzono. Potwierdź je w ciągu najbliższych 10 dni, w przeciwnym razie zostanie ono automatycznie usunięte.
verificationReminderSecond-second-description-3 = { -product-mozilla-account } umożliwia synchronizowanie swoich danych { -brand-firefox(case: "gen") } między urządzeniami i odblokowuje dostęp do innych produktów chroniących prywatność od { -brand-mozilla(case: "gen") }.
verificationReminderSecond-sub-description-2 = Bądź częścią naszej misji przekształcania Internetu w miejsce otwarte dla wszystkich.
verificationReminderSecond-action-2 = Potwierdź konto
verify-title-3 = Uczyń Internet bardziej otwartym z { -brand-mozilla(case: "ins") }
verify-description-2 = Potwierdź konto i w pełni wykorzystaj { -brand-mozilla(case: "acc") } wszędzie, gdzie się zalogujesz, zaczynając od:
verify-subject = Dokończ tworzenie konta
verify-action-2 = Potwierdź konto
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Ten kod wygasa za { $expirationTime } minutę.
        [few] Ten kod wygasa za { $expirationTime } minuty.
       *[many] Ten kod wygasa za { $expirationTime } minut.
    }
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Wygasa za { $expirationTime } minutę.
        [few] Wygasa za { $expirationTime } minuty.
       *[many] Wygasa za { $expirationTime } minut.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Czy zalogowano do „{ $clientName }”?
verifyLogin-description-2 = Pomóż nam zapewnić bezpieczeństwo Twojego konta, potwierdzając logowanie na:
verifyLogin-subject-2 = Potwierdź logowanie
verifyLogin-action = Potwierdź logowanie
verifyLoginCode-preview = Ten kod wygaśnie za 5 minut.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Czy zalogowano do „{ $serviceName }”?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Pomóż nam zapewnić bezpieczeństwo Twojego konta, zatwierdzając logowanie na:
verifyLoginCode-prompt-3 = Jeśli tak, oto kod upoważnienia:
verifyLoginCode-expiry-notice = Wygasa za 5 minut.
verifyPrimary-title-2 = Potwierdź główny adres e-mail
verifyPrimary-description = Z tego urządzenia zażądano wykonania zmiany na koncie:
verifyPrimary-subject = Potwierdź główny adres e-mail
verifyPrimary-action-2 = Potwierdź adres e-mail
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Po potwierdzeniu na tym urządzeniu będzie można wykonywać zmiany na koncie, takie jak dodawanie dodatkowego adresu e-mail.
verifySecondaryCode-preview = Ten kod wygaśnie za 5 minut.
verifySecondaryCode-title-2 = Potwierdź dodatkowy adres e-mail
verifySecondaryCode-action-2 = Potwierdź adres e-mail
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Z tego { -product-mozilla-account(case: "gen", capitalization: "lower") } wysłano prośbę o dodanie { $email } jako dodatkowego adresu e-mail:
verifySecondaryCode-prompt-2 = Użyj tego kodu potwierdzenia:
verifySecondaryCode-expiry-notice-2 = Wygasa za 5 minut. Po potwierdzeniu ten adres będzie otrzymywał powiadomienia bezpieczeństwa i potwierdzenia.
verifyShortCode-preview-2 = Ten kod wygaśnie za 5 minut
verifyShortCode-title-3 = Uczyń Internet bardziej otwartym z { -brand-mozilla(case: "ins") }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Potwierdź konto i w pełni wykorzystaj { -brand-mozilla(case: "acc") } wszędzie, gdzie się zalogujesz, zaczynając od:
verifyShortCode-prompt-3 = Użyj tego kodu potwierdzenia:
verifyShortCode-expiry-notice = Wygasa za 5 minut.
