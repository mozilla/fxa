## Non-email strings

session-verify-send-push-title-2 = Melden Sie sich bei Ihrem { -product-mozilla-account } an?
session-verify-send-push-body-2 = Klicken Sie hier, um Ihre Identität zu bestätigen
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } ist Ihr { -brand-mozilla }-Bestätigungscode. Läuft in 5 Minuten ab.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = { -brand-mozilla }-Verifizierungscode: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } ist Ihr { -brand-mozilla }-Wiederherstellungscode. Läuft in 5 Minuten ab.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = { -brand-mozilla }-Code: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } ist Ihr { -brand-mozilla }-Wiederherstellungscode. Läuft in 5 Minuten ab.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = { -brand-mozilla }-Code: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-Logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Geräte synchronisieren">
body-devices-image = <img data-l10n-name="devices-image" alt="Geräte">
fxa-privacy-url = { -brand-mozilla }-Datenschutzerklärung
moz-accounts-privacy-url-2 = Datenschutzhinweis von { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Nutzungsbedingungen von { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla }-Logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla }-Logo">
subplat-automated-email = Dies ist eine automatisierte E-Mail; wenn Sie diese fälschlicherweise erhalten haben, müssen Sie nichts tun.
subplat-privacy-notice = Datenschutzhinweis
subplat-privacy-plaintext = Datenschutzerklärung:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Sie erhalten diese E-Mail, weil { $email } über ein { -product-mozilla-account } verfügt und Sie sich für { $productName } angemeldet haben.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Sie erhalten diese E-Mail, weil { $email } über ein { -product-mozilla-account } verfügt.
subplat-explainer-multiple-2 = Sie erhalten diese E-Mail, weil { $email } über ein { -product-mozilla-account } verfügt und Sie sich für mehrere Produkte angemeldet haben.
subplat-explainer-was-deleted-2 = Sie erhalten diese E-Mail, weil { $email } für ein { -product-mozilla-account } registriert wurde
subplat-manage-account-2 = Verwalten Sie Ihre { -product-mozilla-account }-Einstellungen, indem Sie Ihre <a data-l10n-name="subplat-account-page">Kontoseite</a> aufrufen.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Verwalten Sie Ihre Einstellungen für { -product-mozilla-account }, indem Sie Ihre Kontoseite besuchen: { $accountSettingsUrl }
subplat-terms-policy = AGB und Widerrufsbelehrung
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Abonnement kündigen
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Abonnement erneuern
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Zahlungsinformationen aktualisieren
subplat-privacy-policy = { -brand-mozilla }-Datenschutzerklärung
subplat-privacy-policy-2 = Datenschutzhinweis von { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Nutzungsbedingungen von { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Rechtliches
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Datenschutz
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Wenn Ihr Konto gelöscht wird, erhalten Sie weiterhin E-Mails von der Mozilla Corporation und der Mozilla Foundation, es sei denn, Sie <a data-l10n-name="unsubscribeLink">bitten um Löschung des Abonnements</a>.
account-deletion-info-block-support = Wenn Sie Fragen haben oder Hilfe benötigen, können Sie sich gerne an unser <a data-l10n-name="supportLink">Hilfe-Team</a> wenden.
account-deletion-info-block-communications-plaintext = Wenn Ihr Konto gelöscht wird, erhalten Sie weiterhin E-Mails von der Mozilla Corporation und der Mozilla Foundation, es sei denn, Sie bitten um Löschung des Abonnements.
account-deletion-info-block-support-plaintext = Wenn Sie Fragen haben oder Hilfe benötigen, können Sie sich gerne an unser Hilfe-Team wenden:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } bei { -google-play } herunterladen">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } im { -app-store } herunterladen">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installieren Sie { $productName } auf <a data-l10n-name="anotherDeviceLink">einem anderen Desktop-Gerät</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installieren Sie { $productName } auf <a data-l10n-name="anotherDeviceLink">einem anderen Gerät</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Holen Sie sich { $productName } bei Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Laden Sie { $productName } im App Store herunter:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installieren Sie { $productName } auf einem anderen Gerät:
automated-email-change-2 = Wenn Sie diese Maßnahme nicht ausgelöst haben, <a data-l10n-name="passwordChangeLink">ändern Sie sofort Ihr Passwort</a>.
automated-email-support = Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Wenn Sie diese Maßnahme nicht ausgelöst haben, ändern Sie sofort Ihr Passwort:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Weitere Informationen erhalten Sie bei der { -brand-mozilla }-Hilfe:
automated-email-inactive-account = Diese E-Mail wurde automatisch verschickt. Sie erhalten sie, weil Sie ein { -product-mozilla-account } haben und seit Ihrer letzten Anmeldung zwei Jahre vergangen sind.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
automated-email-no-action-plaintext = Dies ist eine automatisierte E-Mail. Wenn Sie sie versehentlich erhalten haben, brauchen Sie nichts zu tun.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Dies ist eine automatisierte E-Mail; wenn Sie diese Aktion nicht autorisiert haben, ändern Sie bitte Ihr Passwort:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Diese Anfrage kam von { $uaBrowser } auf { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Diese Anfrage kam von { $uaBrowser } auf { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Diese Anfrage kam von { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Diese Anfrage kam von { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Diese Anfrage kam von { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Wenn Sie das nicht waren, <a data-l10n-name="revokeAccountRecoveryLink">löschen Sie den neuen Schlüssel</a> und <a data-l10n-name="passwordChangeLink">ändern Sie Ihr Passwort</a>.
automatedEmailRecoveryKey-change-pwd-only = Wenn Sie das nicht waren, <a data-l10n-name="passwordChangeLink">ändern Sie Ihr Passwort</a>.
automatedEmailRecoveryKey-more-info = Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Diese Anfrage kam von:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Wenn Sie das nicht waren, löschen Sie den neuen Schlüssel:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Wenn Sie das nicht waren, ändern Sie Ihr Passwort:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = und ändern Sie Ihr Passwort:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Weitere Informationen erhalten Sie bei der { -brand-mozilla }-Hilfe:
automated-email-reset =
    Dies ist eine automatisierte E-Mail; wenn Sie diese Aktion nicht autorisiert haben, <a data-l10n-name="resetLink">setzen Sie bitte Ihr Passwort zurück</a>.
    Weitere Informationen finden Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Wenn Sie diese Aktion nicht autorisiert haben, setzen Sie Ihr Passwort jetzt unter { $resetLink } zurück
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Wenn Sie diese Maßnahme nicht ausgelöst haben, <a data-l10n-name="resetLink">setzen Sie Ihr Passwort zurück</a> und <a data-l10n-name="twoFactorSettingsLink">setzen Sie die Zwei-Schritt-Authentifizierung zurück</a> richtig entfernt. Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Wenn Sie diese Maßnahme nicht ausgelöst haben, setzen Sie Ihr Passwort unter folgender Adresse sofort zurück:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Setzen Sie außerdem die Zwei-Schritt-Authentifizierung unter folgender Adresse zurück:
brand-banner-message = Wussten Sie, dass wir unseren Namen von { -product-firefox-accounts } in { -product-mozilla-accounts } geändert haben? <a data-l10n-name="learnMore">Weitere Informationen</a>
cancellationSurvey = Bitte helfen Sie uns, unsere Dienste zu verbessern, indem Sie an dieser <a data-l10n-name="cancellationSurveyUrl">kurzen Umfrage</a> teilnehmen.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Bitte helfen Sie uns, unsere Dienste zu verbessern, indem Sie diese kurze Umfrage ausfüllen:
change-password-plaintext = Wenn Sie den Verdacht haben, dass jemand auf Ihr Konto zugreifen möchte, ändern Sie bitte Ihr Passwort.
manage-account = Benutzerkonto verwalten
manage-account-plaintext = { manage-account }:
payment-details = Zahlungsdetails:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Rechnungsnummer: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Abgebucht: { $invoiceTotal } am { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Nächste Rechnung: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Zahlungsmethode:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Zahlungsmethode: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Zahlungsmethode: { $cardName } endet auf { $lastFour }
payment-provider-card-ending-in-plaintext = Zahlungsmethode: Karte endet auf { $lastFour }
payment-provider-card-ending-in = <b>Zahlungsmethode:</b> Karte endet auf { $lastFour }
payment-provider-card-ending-in-card-name = <b>Zahlungsmethode:</b> { $cardName } endet auf { $lastFour }
subscription-charges-invoice-summary = Zusammenfassung der Rechnung

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Rechnungsnummer:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Rechnungsnummer: { $invoiceNumber }
subscription-charges-invoice-date = <b>Datum:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Datum: { $invoiceDateOnly }
subscription-charges-prorated-price = Anteiliger Preis
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Anteiliger Preis: { $remainingAmountTotal }
subscription-charges-list-price = Listenpreis
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Listenpreis: { $offeringPrice }
subscription-charges-credit-from-unused-time = Gutschrift aus nicht genutzter Zeit
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Gutschrift aus nicht genutzter Zeit: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Zwischensumme</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Zwischensumme: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Einmaliger Rabatt
subscription-charges-one-time-discount-plaintext = Einmaliger Rabatt: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-Monats-Rabatt
       *[other] { $discountDuration }-Monats-Rabatt
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] { $discountDuration }-Monats-Rabatt: { $invoiceDiscountAmount }
       *[other] { $discountDuration }-Monats-Rabatt: { $invoiceDiscountAmount }
    }
subscription-charges-discount = Rabatt
subscription-charges-discount-plaintext = Rabatt: { $invoiceDiscountAmount }
subscription-charges-taxes = Steuern und Gebühren
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Steuern und Gebühren: { $invoiceTaxAmount }
subscription-charges-total = <b>Gesamt</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Gesamt: { $invoiceTotal }
subscription-charges-credit-applied = Guthaben genutzt
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = genutztes Guthaben: { $creditApplied }
subscription-charges-amount-paid = <b>Gezahlter Betrag</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Gezahlter Betrag: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Sie haben eine Kontogutschrift in Höhe von { $creditReceived } erhalten, die mit Ihren zukünftigen Rechnungen verrechnet wird.

##

subscriptionSupport = Fragen zu Ihrem Abonnement? Unser <a data-l10n-name="subscriptionSupportUrl">Hilfe-Team</a> unterstützt Sie gerne.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Fragen zu Ihrem Abonnement? Unser Hilfe-Team unterstützt Sie gerne:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Vielen Dank, dass Sie { $productName } abonniert haben. Wenn Sie Fragen zu Ihrem Abonnement haben oder weitere Informationen über { $productName } benötigen, <a data-l10n-name="subscriptionSupportUrl">kontaktieren Sie uns bitte</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Vielen Dank, dass Sie { $productName } abonniert haben. Wenn Sie Fragen zu Ihrem Abonnement haben oder weitere Informationen über { $productName } benötigen, kontaktieren Sie uns bitte:
subscription-support-get-help = Holen Sie sich Hilfe bei Ihrem Abonnement
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Verwalten Sie Ihr Abonnement</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Abonnement verwalten:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Support kontaktieren</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Support kontaktieren:
subscriptionUpdateBillingEnsure = Sie können <a data-l10n-name="updateBillingUrl">hier</a> sicherstellen, dass Ihre Zahlungsmethode und Kontoinformationen aktuell sind.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Sie können hier sicherstellen, dass Ihre Zahlungsmethode und Ihre Kontoinformationen aktuell sind:
subscriptionUpdateBillingTry = Wir werden versuchen, Ihre Zahlung in den nächsten Tagen erneut durchzuführen. Möglicherweise benötigen wir aber Ihre Hilfe bei der Lösung des Problems, indem Sie <a data-l10n-name="updateBillingUrl">Ihre Zahlungsinformationen aktualisieren</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Wir werden versuchen, Ihre Zahlung in den nächsten Tagen erneut durchzuführen. Möglicherweise benötigen wir aber Ihre Hilfe bei der Lösung des Problems, indem Sie Ihre Zahlungsinformationen aktualisieren:
subscriptionUpdatePayment = Um eine Unterbrechung Ihres Dienstes zu vermeiden, aktualisieren Sie bitte <a data-l10n-name="updateBillingUrl">Ihre Zahlungsinformationen</a> so bald wie möglich.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Um eine Unterbrechung Ihres Dienstes zu vermeiden, aktualisieren Sie bitte Ihre Zahlungsinformationen so bald wie möglich:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Weitere Informationen erhalten Sie bei der { -brand-mozilla }-Hilfe: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } auf { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } auf { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (geschätzt)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (geschätzt)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (geschätzt)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (geschätzt)
view-invoice-link-action = Rechnung ansehen
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Rechnung anzeigen: { $invoiceLink }
cadReminderFirst-subject-1 = Erinnerung! Synchronisieren Sie Ihren { -brand-firefox }
cadReminderFirst-action = Weiteres Gerät synchronisieren
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Zur Synchronisation gehören immer zwei
cadReminderFirst-description-v2 = Nutzen Sie Ihre Tabs auf allen Ihren Geräten. Holen Sie sich Ihre Lesezeichen, Passwörter und andere Daten überall dorthin, wo Sie { -brand-firefox } verwenden.
cadReminderSecond-subject-2 = Nicht vergessen! Schließen Sie Ihre Sync-Einrichtung ab.
cadReminderSecond-action = Weiteres Gerät synchronisieren
cadReminderSecond-title-2 = Synchronisierung nicht vergessen!
cadReminderSecond-description-sync = Synchronisieren Sie Ihre Lesezeichen, Passwörter, geöffneten Tabs und mehr – überall dort, wo Sie { -brand-firefox } verwenden.
cadReminderSecond-description-plus = Außerdem sind Ihre Daten immer verschlüsselt. Nur Sie selbst und von Ihnen freigegebene Geräte können darauf zugreifen.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Willkommen bei { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Willkommen bei { $productName }.
downloadSubscription-content-2 = Nutzen Sie jetzt alle Funktionen Ihres Abonnements:
downloadSubscription-link-action-2 = Erste Schritte
fraudulentAccountDeletion-subject-2 = Ihr { -product-mozilla-account } wurde gelöscht
fraudulentAccountDeletion-title = Ihr Konto wurde gelöscht
fraudulentAccountDeletion-content-part1-v2 = Kürzlich wurde ein { -product-mozilla-account } erstellt und ein Abonnement wurde für diese E-Mail-Adresse abgerechnet. Wie bei allen neuen Konten haben wir Sie gebeten, Ihr Konto zu bestätigen, indem Sie zuerst diese E-Mail-Adresse bestätigen.
fraudulentAccountDeletion-content-part2-v2 = Derzeit sehen wir, dass das Konto nie bestätigt wurde. Da dieser Schritt nicht abgeschlossen wurde, sind wir uns nicht sicher, ob dies ein autorisiertes Abonnement war. Infolgedessen wurde das unter dieser E-Mail-Adresse registrierte { -product-mozilla-account } gelöscht, Ihr Abonnement wurde mit Erstattung aller Gebühren gekündigt.
fraudulentAccountDeletion-contact = Wenden Sie sich bei Fragen bitte an unser <a data-l10n-name="mozillaSupportUrl">Hilfe-Team</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Wenden Sie sich bei Fragen bitte an unser Hilfe-Team: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Letzte Chance, um Ihr { -product-mozilla-account } zu behalten
inactiveAccountFinalWarning-title = Ihr { -brand-mozilla }-Konto und Ihre Daten werden gelöscht
inactiveAccountFinalWarning-preview = Melden Sie sich an, um Ihr Konto zu behalten
inactiveAccountFinalWarning-account-description = Ihr { -product-mozilla-account } wird für den Zugriff auf kostenlose Datenschutz- und Surf-Produkte wie { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } und { -product-mdn } verwendet.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Am <strong>{ $deletionDate }</strong> werden Ihr Konto und Ihre persönlichen Daten dauerhaft gelöscht, es sei denn, Sie melden sich an.
inactiveAccountFinalWarning-action = Melden Sie sich an, um Ihr Konto zu behalten
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Melden Sie sich an, um Ihr Konto zu behalten:
inactiveAccountFirstWarning-subject = Verlieren Sie Ihr Konto nicht
inactiveAccountFirstWarning-title = Sollen Ihr { -brand-mozilla }-Konto und Ihre Daten erhalten bleiben?
inactiveAccountFirstWarning-account-description-v2 = Ihr { -product-mozilla-account } wird für den Zugriff auf kostenlose Datenschutz- und Surf-Produkte wie { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } und { -product-mdn } verwendet.
inactiveAccountFirstWarning-inactive-status = Wir haben festgestellt, dass Sie sich seit zwei Jahren nicht angemeldet haben.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Ihr Konto und Ihre persönlichen Daten werden am <strong>{ $deletionDate }</strong> dauerhaft gelöscht, da Sie nicht aktiv waren.
inactiveAccountFirstWarning-action = Melden Sie sich an, um Ihr Konto zu behalten
inactiveAccountFirstWarning-preview = Melden Sie sich an, um Ihr Konto zu behalten
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Melden Sie sich an, um Ihr Konto zu behalten:
inactiveAccountSecondWarning-subject = Handeln erforderlich: Kontolöschung in 7 Tagen
inactiveAccountSecondWarning-title = Ihr { -brand-mozilla }-Konto und Ihre Daten werden in 7 Tagen gelöscht
inactiveAccountSecondWarning-account-description-v2 = Ihr { -product-mozilla-account } wird für den Zugriff auf kostenlose Datenschutz- und Surf-Produkte wie { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } und { -product-mdn } verwendet.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Ihr Konto und Ihre persönlichen Daten werden am <strong>{ $deletionDate }</strong> dauerhaft gelöscht, da Sie nicht aktiv waren.
inactiveAccountSecondWarning-action = Melden Sie sich an, um Ihr Konto zu behalten
inactiveAccountSecondWarning-preview = Melden Sie sich an, um Ihr Konto zu behalten
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Melden Sie sich an, um Ihr Konto zu behalten:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Sie haben keine Sicherungs-Authentifizierungscodes mehr!
codes-reminder-title-one = Sie haben nur noch einen Sicherheits-Authentifizierungscode.
codes-reminder-title-two = Sie sollten weitere Sicherungs-Authentifizierungscodes erstellen.
codes-reminder-description-part-one = Sicherungs-Authentifizierungscodes helfen Ihnen, Ihre Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen.
codes-reminder-description-part-two = Erstellen Sie jetzt neue Codes, damit Sie Ihre Daten später nicht verlieren.
codes-reminder-description-two-left = Sie haben nur noch zwei Codes übrig.
codes-reminder-description-create-codes = Erstellen Sie neue Sicherungs-Authentifizierungscodes, damit Sie wieder auf Ihr Konto zugreifen können, wenn Sie ausgesperrt sind.
lowRecoveryCodes-action-2 = Codes erstellen
codes-create-plaintext = { lowRecoveryCodes-action-2 }
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Keine Sicherungs-Authentifizierungscode vorhanden
        [one] Nur noch ein Sicherungs-Authentifizierungscodes übrig
       *[other] Nur noch { $numberRemaining } Sicherungs-Authentifizierungcodes übrig!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Neue Anmeldung bei { $clientName }
newDeviceLogin-subjectForMozillaAccount = Neue Anmeldung bei Ihrem { -product-mozilla-account }
newDeviceLogin-title-3 = Ihr { -product-mozilla-account } wurde zur Anmeldung verwendet
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Das sind nicht Sie? <a data-l10n-name="passwordChangeLink">Ändern Sie Ihr Passwort</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Das sind nicht Sie? Ändern Sie Ihr Passwort:
newDeviceLogin-action = Benutzerkonto verwalten
passwordChanged-subject = Passwort aktualisiert
passwordChanged-title = Passwort erfolgreich geändert
passwordChanged-description-2 = Das Passwort Ihres { -product-mozilla-account } wurde erfolgreich von folgendem Gerät geändert:
passwordChangeRequired-subject = Verdächtige Aktivität festgestellt
passwordChangeRequired-preview = Ändern Sie sofort Ihr Passwort
passwordChangeRequired-title-2 = Setzen Sie Ihr Passwort zurück
passwordChangeRequired-suspicious-activity-3 = Wir haben Ihr Konto gesperrt, um es vor verdächtigen Aktivitäten zu schützen. Sie wurden von allen Ihren Geräten abgemeldet und alle synchronisierten Daten wurden vorsorglich gelöscht.
passwordChangeRequired-sign-in-3 = Um sich wieder bei Ihrem Konto anzumelden, müssen Sie nur Ihr Passwort zurücksetzen.
passwordChangeRequired-different-password-2 = <b>Wichtig:</b> Wählen Sie ein starkes Passwort, das sich von dem unterscheidet, das Sie in der Vergangenheit verwendet haben.
passwordChangeRequired-different-password-plaintext-2 = Wichtig: Wählen Sie ein starkes Passwort, das sich von dem unterscheidet, das Sie in der Vergangenheit verwendet haben.
passwordChangeRequired-action = Passwort zurücksetzen
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Verwenden Sie { $code }, um Ihr Passwort zu ändern
password-forgot-otp-preview = Dieser Code läuft in 10 Minuten ab
password-forgot-otp-title = Passwort vergessen?
password-forgot-otp-request = Wir haben eine Anfrage zur Passwortänderung für Ihr { -product-mozilla-account } erhalten von:
password-forgot-otp-code-2 = Wenn Sie das waren, ist hier Ihr Bestätigungscode, um fortzufahren:
password-forgot-otp-expiry-notice = Dieser Code läuft in 10 Minuten ab.
passwordReset-subject-2 = Ihr Passwort wurde zurückgesetzt.
passwordReset-title-2 = Ihr Passwort wurde zurückgesetzt.
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Sie haben Ihr { -product-mozilla-account }-Passwort zurückgesetzt am:
passwordResetAccountRecovery-subject-2 = Ihr Passwort wurde zurückgesetzt
passwordResetAccountRecovery-title-3 = Ihr Passwort wurde zurückgesetzt.
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Sie haben Ihren Kontowiederherstellungsschlüssel verwendet, um Ihr { -product-mozilla-account }-Passwort zurückzusetzen am:
passwordResetAccountRecovery-information = Wir haben Sie von allen synchronisierten Geräten abgemeldet. Wir haben einen neuen Kontowiederherstellungsschlüssel erstellt, um den von Ihnen verwendeten zu ersetzen. Sie können dies in Ihren Kontoeinstellungen ändern.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Wir haben Sie von allen synchronisierten Geräten abgemeldet. Wir haben einen neuen Kontowiederherstellungsschlüssel erstellt, um den von Ihnen verwendeten zu ersetzen. Dies können Sie in Ihren Kontoeinstellungen ändern:
passwordResetAccountRecovery-action-4 = Benutzerkonto verwalten
passwordResetRecoveryPhone-subject = Telefonnummer zur Wiederherstellung verwendet
passwordResetRecoveryPhone-preview = Überprüfen Sie, ob Sie das waren
passwordResetRecoveryPhone-title = Ihre Telefonnummer wurde verwendet, um das Zurücksetzen des Passworts zu bestätigen
passwordResetRecoveryPhone-device = Telefonnummer zur Wiederherstellung verwendet von:
passwordResetRecoveryPhone-action = Benutzerkonto verwalten
passwordResetWithRecoveryKeyPrompt-subject = Ihr Passwort wurde zurückgesetzt.
passwordResetWithRecoveryKeyPrompt-title = Ihr Passwort wurde zurückgesetzt.
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Sie haben Ihr { -product-mozilla-account }-Passwort zurückgesetzt am:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Kontowiederherstellungsschlüssel erstellen
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Kontowiederherstellungsschlüssel erstellen:
passwordResetWithRecoveryKeyPrompt-cta-description = Sie müssen sich auf allen Ihren synchronisierten Geräten erneut anmelden. Schützen Sie Ihre Daten beim nächsten Mal mit einem Kontowiederherstellungsschlüssel. Hiermit können Sie Ihre Daten wiederherstellen, wenn Sie Ihr Passwort vergessen.
postAddAccountRecovery-subject-3 = Neuer Kontowiederherstellungsschlüssel erstellt
postAddAccountRecovery-title2 = Sie haben einen neuen Kontowiederherstellungsschlüssel erstellt
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Speichern Sie diesen Schlüssel an einem sicheren Ort – Sie benötigen ihn, um Ihre verschlüsselten Browser-Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen haben.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Dieser Schlüssel kann nur einmal verwendet werden. Nachdem Sie ihn verwendet haben, erstellen wir automatisch einen neuen für Sie. Sie können auch jederzeit in Ihren Kontoeinstellungen einen neuen erstellen.
postAddAccountRecovery-action = Benutzerkonto verwalten
postAddLinkedAccount-subject-2 = Neues Konto mit Ihrem { -product-mozilla-account } verknüpft
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Ihr { $providerName }-Konto wurde mit Ihrem { -product-mozilla-account } verknüpft
postAddLinkedAccount-action = Benutzerkonto verwalten
postAddRecoveryPhone-subject = Telefonnummer zur Kontowiederherstellung hinzugefügt
postAddRecoveryPhone-preview = Konto durch Zwei-Schritt-Authentifizierung geschützt
postAddRecoveryPhone-title-v2 = Sie haben eine Telefonnummer zur Kontowiederherstellung hinzugefügt
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Sie haben { $maskedLastFourPhoneNumber } als Ihre Telefonnummer zur Kontowiederherstellung hinzugefügt
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Wie dies Ihr Konto schützt
postAddRecoveryPhone-how-protect-plaintext = Wie dies Ihr Konto schützt:
postAddRecoveryPhone-enabled-device = Sie haben sie aktiviert von:
postAddRecoveryPhone-action = Benutzerkonto verwalten
postAddTwoStepAuthentication-preview = Ihr Konto ist geschützt
postAddTwoStepAuthentication-subject-v3 = Zwei-Schritt-Authentifizierung ist aktiviert
postAddTwoStepAuthentication-title-2 = Sie haben die Zwei-Schritt-Authentifizierung aktiviert
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Sie haben dies angefordert von:
postAddTwoStepAuthentication-action = Benutzerkonto verwalten
postAddTwoStepAuthentication-code-required-v4 = Sicherheitscodes aus Ihrer Authentifizierungs-App sind jetzt bei jeder Anmeldung erforderlich.
postAddTwoStepAuthentication-recovery-method-codes = Sie haben auch Sicherungs-Authentifizierungscodes als Wiederherstellungsmethode hinzugefügt.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Sie haben auch { $maskedPhoneNumber } als Telefonnummer zur Kontowiederherstellung hinzugefügt.
postAddTwoStepAuthentication-how-protects-link = Wie dies Ihr Konto schützt
postAddTwoStepAuthentication-how-protects-plaintext = Wie dies Ihr Konto schützt:
postAddTwoStepAuthentication-device-sign-out-message = Um alle Ihre verbundenen Geräte zu schützen, sollten Sie sich überall abmelden, wo Sie dieses Konto verwenden, und sich mit der Zwei-Schritt-Authentifizierung wieder anmelden.
postChangeAccountRecovery-subject = Kontowiederherstellungsschlüssel geändert
postChangeAccountRecovery-title = Sie haben Ihren Kontowiederherstellungsschlüssel geändert
postChangeAccountRecovery-body-part1 = Sie haben jetzt einen neuen Kontowiederherstellungsschlüssel. Ihr vorheriger Schlüssel wurde gelöscht.
postChangeAccountRecovery-body-part2 = Speichern Sie diesen neuen Schlüssel an einem sicheren Ort – Sie benötigen ihn, um Ihre verschlüsselten Surf-Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen haben.
postChangeAccountRecovery-action = Benutzerkonto verwalten
postChangePrimary-subject = Primär-E-Mail-Adresse aktualisiert
postChangePrimary-title = Neue Primär-E-Mail-Adresse
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Sie haben Ihre Primär-E-Mail-Adresse zu { $email } geändert. Diese Adresse ist jetzt Ihr Benutzername für die Anmeldung bei Ihrem { -product-mozilla-account }, sowie zum Erhalt von Sicherheitsbenachrichtigungen und Anmeldebestätigungen.
postChangePrimary-action = Benutzerkonto verwalten
postChangeRecoveryPhone-subject = Telefonnummer für Kontowiederherstellung aktualisiert
postChangeRecoveryPhone-preview = Konto durch Zwei-Schritt-Authentifizierung geschützt
postChangeRecoveryPhone-title = Sie haben Ihre Telefonnummer zur Kontowiederherstellung geändert
postChangeRecoveryPhone-description = Sie haben jetzt eine neue Telefonnummer zur Kontowiederherstellung. Ihre vorherige Telefonnummer wurde gelöscht.
postChangeRecoveryPhone-requested-device = Sie haben sie angefordert von:
postChangeTwoStepAuthentication-preview = Ihr Konto ist geschützt
postChangeTwoStepAuthentication-subject = Zwei-Schritt-Authentifizierung aktualisiert
postChangeTwoStepAuthentication-title = Die Zwei-Schritt-Authentifizierung wurde aktualisiert.
postChangeTwoStepAuthentication-use-new-account = Sie müssen jetzt den neuen Eintrag { -product-mozilla-account } in Ihrer Authentifizierungs-App verwenden. Die ältere wird nicht mehr funktionieren und Sie können sie entfernen.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Sie haben dies angefordert von:
postChangeTwoStepAuthentication-action = Benutzerkonto verwalten
postChangeTwoStepAuthentication-how-protects-link = Wie dies Ihr Konto schützt
postChangeTwoStepAuthentication-how-protects-plaintext = Wie dies Ihr Konto schützt:
postChangeTwoStepAuthentication-device-sign-out-message = Um alle Ihre verbundenen Geräte zu schützen, sollten Sie sich überall abmelden, wo Sie dieses Konto verwenden, und sich mit Ihrer neuen Zwei-Schritt-Authentifizierung wieder anmelden.
postConsumeRecoveryCode-title-3 = Ihr Sicherungs-Authentifizierungscode wurde verwendet, um das Zurücksetzen des Passworts zu bestätigen
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Verwendeter Code von:
postConsumeRecoveryCode-action = Benutzerkonto verwalten
postConsumeRecoveryCode-subject-v3 = Sicherungs-Authentifizierungscode verwendet
postConsumeRecoveryCode-preview = Überprüfen Sie, ob Sie das waren
postNewRecoveryCodes-subject-2 = Neue Sicherungs-Authentifizierungscodes erzeugt
postNewRecoveryCodes-title-2 = Sie haben neue Sicherungs-Authentifizierungscode erzeugt
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Sie wurden erstellt auf:
postNewRecoveryCodes-action = Benutzerkonto verwalten
postRemoveAccountRecovery-subject-2 = Kontowiederherstellungsschlüssel gelöscht
postRemoveAccountRecovery-title-3 = Sie haben Ihren Kontowiederherstellungsschlüssel gelöscht
postRemoveAccountRecovery-body-part1 = Ihr Kontowiederherstellungsschlüssel wird benötigt, um Ihre verschlüsselten Browser-Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen.
postRemoveAccountRecovery-body-part2 = Falls noch nicht geschehen, erstellen Sie in Ihren Kontoeinstellungen einen neuen Kontowiederherstellungsschlüssel, um zu verhindern, dass Ihre gespeicherten Passwörter, Lesezeichen, Chronik und mehr verloren gehen.
postRemoveAccountRecovery-action = Benutzerkonto verwalten
postRemoveRecoveryPhone-subject = Telefonnummer für Kontowiederherstellung entfernt
postRemoveRecoveryPhone-preview = Konto durch Zwei-Schritt-Authentifizierung geschützt
postRemoveRecoveryPhone-title = Telefonnummer für Kontowiederherstellung entfernt
postRemoveRecoveryPhone-description-v2 = Ihre Telefonnummer zur Wiederherstellung wurde aus Ihren Einstellungen für die Zwei-Schritt-Authentifizierung entfernt.
postRemoveRecoveryPhone-description-extra = Sie können Ihre Sicherungs-Authentifizierungscodes weiterhin zur Anmeldung verwenden, wenn Sie nicht in der Lage sind, Ihre Authentifizierungs-App zu verwenden.
postRemoveRecoveryPhone-requested-device = Sie haben sie angefordert von:
postRemoveSecondary-subject = Zweit-E-Mail-Adresse entfernt
postRemoveSecondary-title = Zweit-E-Mail-Adresse entfernt
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Sie haben { $secondaryEmail } als Zweit-E-Mail-Adresse Ihres { -product-mozilla-account } entfernt. Sicherheitshinweise und Anmeldebestätigungen werden nicht mehr an diese Adresse zugestellt.
postRemoveSecondary-action = Benutzerkonto verwalten
postRemoveTwoStepAuthentication-subject-line-2 = Zwei-Schritt-Authentifizierung deaktiviert
postRemoveTwoStepAuthentication-title-2 = Sie haben die Zwei-Schritt-Authentifizierung deaktiviert
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Sie haben sie deaktiviert von:
postRemoveTwoStepAuthentication-action = Benutzerkonto verwalten
postRemoveTwoStepAuthentication-not-required-2 = Sie benötigen keine Sicherheitscodes mehr von Ihrer Authentifizierungs-App, wenn Sie sich anmelden.
postSigninRecoveryCode-subject = Sicherungs-Authentifizierungscode wurde zur Anmeldung verwendet
postSigninRecoveryCode-preview = Kontoaktivität bestätigen
postSigninRecoveryCode-title = Ihr Sicherungs-Authentifizierungscode wurde für die Anmeldung verwendet
postSigninRecoveryCode-description = Wenn Sie dies nicht getan haben, sollten Sie sofort Ihr Passwort ändern, um Ihr Konto zu schützen.
postSigninRecoveryCode-device = Sie haben sich angemeldet von:
postSigninRecoveryCode-action = Benutzerkonto verwalten
postSigninRecoveryPhone-subject = Telefonnummer zur Kontowiederherstellung wurde zur Anmeldung verwendet
postSigninRecoveryPhone-preview = Kontoaktivität bestätigen
postSigninRecoveryPhone-title = Ihre Telefonnummer zur Kontowiederherstellung wurde zur Anmeldung verwendet
postSigninRecoveryPhone-description = Wenn Sie dies nicht getan haben, sollten Sie sofort Ihr Passwort ändern, um Ihr Konto zu schützen.
postSigninRecoveryPhone-device = Sie haben sich angemeldet von:
postSigninRecoveryPhone-action = Benutzerkonto verwalten
postVerify-sub-title-3 = Wir freuen uns auf Sie!
postVerify-title-2 = Möchten Sie denselben Tab auf zwei Geräten sehen?
postVerify-description-2 = Das geht ganz einfach! Installieren Sie einfach { -brand-firefox } auf einem anderen Gerät und melden Sie sich an, um zu synchronisieren. Es ist wie Magie!
postVerify-sub-description = (Psst… Es bedeutet auch, dass Sie Ihre Lesezeichen, Passwörter und andere { -brand-firefox }-Daten überall abrufen können, wo Sie angemeldet sind.)
postVerify-subject-4 = Willkommen bei { -brand-mozilla }!
postVerify-setup-2 = Weiteres Gerät verbinden:
postVerify-action-2 = Weiteres Gerät verbinden
postVerifySecondary-subject = Zweit-E-Mail-Adresse hinzugefügt
postVerifySecondary-title = Zweit-E-Mail-Adresse hinzugefügt
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Sie haben { $secondaryEmail } als Zweit-E-Mail-Adresse für Ihr { -product-mozilla-account } bestätigt. Sicherheitshinweise und Anmeldebestätigungen werden ab sofort an beide E-Mail-Adressen verschickt.
postVerifySecondary-action = Benutzerkonto verwalten
recovery-subject = Setzen Sie Ihr Passwort zurück
recovery-title-2 = Haben Sie Ihr Passwort vergessen?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Wir haben eine Anfrage zur Passwortänderung für Ihr { -product-mozilla-account } erhalten von:
recovery-new-password-button = Erstellen Sie ein neues Passwort, indem Sie auf die folgende Schaltfläche klicken. Dieser Link läuft innerhalb der nächsten Stunde ab.
recovery-copy-paste = Erstellen Sie ein neues Passwort, indem Sie die folgende URL kopieren und in Ihren Browser einfügen. Dieser Link läuft innerhalb der nächsten Stunde ab.
recovery-action = Neues Passwort erstellen
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ihr Abonnement für { $productName } wurde gekündigt
subscriptionAccountDeletion-title = Schade, dass Sie gehen
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Sie haben kürzlich Ihr { -product-mozilla-account } gelöscht. Aus diesem Grund haben wir Ihr Abonnement für { $productName } gekündigt. Ihre letzte Zahlung von { $invoiceTotal } wurde am { $invoiceDateOnly } bezahlt.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Willkommen bei { $productName }: Bitte legen Sie Ihr Passwort fest.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Willkommen bei { $productName }.
subscriptionAccountFinishSetup-content-processing = Ihre Zahlung wird verarbeitet und kann bis zu vier Werktage dauern. Ihr Abonnement verlängert sich automatisch in jedem Abrechnungszeitraum, es sei denn, Sie kündigen.
subscriptionAccountFinishSetup-content-create-3 = Als Nächstes erstellen Sie ein { -product-mozilla-account }-Passwort, um mit der Verwendung Ihres neuen Abonnements zu beginnen.
subscriptionAccountFinishSetup-action-2 = Einführung
subscriptionAccountReminderFirst-subject = Erinnerung: Erstellung Ihres Kontos abschließen
subscriptionAccountReminderFirst-title = Sie können noch nicht auf Ihr Abonnement zugreifen
subscriptionAccountReminderFirst-content-info-3 = Vor ein paar Tagen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Wir hoffen, dass Sie die Einrichtung Ihres Kontos abgeschlossen haben, damit Sie Ihr neues Abonnement verwenden können.
subscriptionAccountReminderFirst-content-select-2 = Wählen Sie „Passwort erstellen“, um ein neues Passwort einzurichten und die Bestätigung Ihres Kontos abzuschließen.
subscriptionAccountReminderFirst-action = Passwort erstellen
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Letzte Erinnerung: Richten Sie Ihr Konto ein
subscriptionAccountReminderSecond-title-2 = Willkommen bei { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Vor ein paar Tagen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Wir hoffen, dass Sie die Einrichtung Ihres Kontos abgeschlossen haben, damit Sie Ihr neues Abonnement verwenden können.
subscriptionAccountReminderSecond-content-select-2 = Wählen Sie „Passwort erstellen“, um ein neues Passwort einzurichten und die Bestätigung Ihres Kontos abzuschließen.
subscriptionAccountReminderSecond-action = Passwort erstellen
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Ihr Abonnement für { $productName } wurde gekündigt
subscriptionCancellation-title = Schade, dass Sie gehen

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Wir haben Ihr { $productName }-Abonnement gekündigt. Ihre letzte Zahlung von { $invoiceTotal } wurde am { $invoiceDateOnly } getätigt.
subscriptionCancellation-outstanding-content-2 = Wir haben Ihr { $productName }-Abonnement gekündigt. Ihre letzte Zahlung in Höhe von { $invoiceTotal } wird am { $invoiceDateOnly } getätigt.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Ihr Dienst wird bis zum Ende Ihres aktuellen Abrechnungszeitraums, also { $serviceLastActiveDateOnly }, fortgesetzt.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Sie haben zu { $productName } gewechselt
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Sie haben erfolgreich von { $productNameOld } zu { $productName } gewechselt.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Ab Ihrer nächsten Rechnung ändert sich Ihre Gebühr von { $paymentAmountOld } pro { $productPaymentCycleOld } auf { $paymentAmountNew } pro { $productPaymentCycleNew }. Zu diesem Zeitpunkt erhalten Sie außerdem eine einmalige Gutschrift in Höhe von { $paymentProrated }, um die niedrigere Gebühr für den Rest dieser { $productPaymentCycleOld } widerzuspiegeln.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Wenn Sie neue Software installieren müssen, um { $productName } verwenden zu können, erhalten Sie eine separate E-Mail mit Anweisungen zum Herunterladen.
subscriptionDowngrade-content-auto-renew = Ihr Abonnement verlängert sich automatisch jeden Abrechnungszeitraum, sofern Sie nicht kündigen.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Ihr Abonnement für { $productName } wurde gekündigt
subscriptionFailedPaymentsCancellation-title = Ihr Abonnement wurde storniert
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Wir haben Ihr { $productName }-Abonnement gekündigt, da mehrere Zahlungsversuche fehlgeschlagen sind. Um wieder Zugriff zu erhalten, beginnen Sie ein neues Abonnement mit einer aktualisierten Zahlungsmethode.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = { $productName }-Zahlung bestätigt
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Vielen Dank, dass Sie { $productName } abonniert haben
subscriptionFirstInvoice-content-processing = Ihre Zahlung wird derzeit bearbeitet und kann bis zu vier Werktage dauern.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Sie erhalten eine separate E-Mail darüber, wie Sie mit der Verwendung von { $productName } beginnen können.
subscriptionFirstInvoice-content-auto-renew = Ihr Abonnement verlängert sich automatisch jeden Abrechnungszeitraum, sofern Sie nicht kündigen.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = Ihre nächste Rechnung wird am { $nextInvoiceDateOnly } ausgestellt.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = Zahlungsmethode für { $productName } ist abgelaufen oder läuft bald ab
subscriptionPaymentExpired-title-2 = Ihre Zahlungsmethode ist abgelaufen oder läuft bald ab
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = Ihre Zahlungsmethode für { $productName } ist abgelaufen oder läuft bald ab.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = { $productName }-Zahlung fehlgeschlagen
subscriptionPaymentFailed-title = Entschuldigung, wir haben Probleme mit Ihrer Zahlung
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Wir haben ein Problem mit Ihrer letzten Zahlung für { $productName }
subscriptionPaymentFailed-content-outdated-1 = Möglicherweise ist Ihre Zahlungsmethode abgelaufen oder Ihre aktuelle Zahlungsmethode ist veraltet.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Aktualisierung der Zahlungsinformationen für { $productName } erforderlich
subscriptionPaymentProviderCancelled-title = Entschuldigung, wir haben Probleme mit Ihrer Zahlungsmethode
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Wir haben ein Problem mit Ihrer Zahlungsmethode für { $productName } festgestellt.
subscriptionPaymentProviderCancelled-content-reason-1 = Möglicherweise ist Ihre Zahlungsmethode abgelaufen oder Ihre aktuelle Zahlungsmethode ist veraltet.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Abonnement von { $productName } erneuert
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Vielen Dank, dass Sie Ihr Abonnement von { $productName } erneuert haben!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ihr Abrechnungsrhythmus und Ihre Zahlung bleiben gleich. Ihre nächste Rechnung beträgt { $invoiceTotal } am { $nextInvoiceDateOnly }. Ihr Abonnement wird automatisch jede Abrechnungsperiode erneuert, es sei denn, sie stornieren es vorher.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Benachrichtigung über automatische Verlängerung von { $productName }
subscriptionRenewalReminder-title = Ihr Abonnement wird in Kürze verlängert
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Lieber { $productName }-Kunde,
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Ihr aktuelles Abonnement verlängert sich automatisch in { $reminderLength } Tagen. Zu diesem Zeitpunkt verlängert { -brand-mozilla } Ihr { $planIntervalCount } { $planInterval }-Abonnement und Ihr Konto wird über die gewählte Zahlungsmethode mit dem Betrag { $invoiceTotal } belastet.
subscriptionRenewalReminder-content-closing = Mit freundlichen Grüßen
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Das { $productName }-Team
subscriptionReplaced-subject = Ihr Abonnement wurde als Teil Ihres Upgrades aktualisiert
subscriptionReplaced-title = Ihr Abonnement wurde aktualisiert
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Ihr individuelles { $productName }-Abonnement wurde ersetzt und ist jetzt in Ihrem neuen Paket enthalten.
subscriptionReplaced-content-credit = Für nicht genutzte Zeit aus Ihrem vorherigen Abonnement erhalten Sie eine Gutschrift. Dieses Guthaben wird automatisch Ihrem Konto gutgeschrieben und für zukünftige Abbuchungen verwendet.
subscriptionReplaced-content-no-action = Ihrerseits ist kein Handeln erforderlich.
subscriptionsPaymentExpired-subject-2 = Die Zahlungsmethode für Ihre Abonnements ist abgelaufen oder läuft bald ab
subscriptionsPaymentExpired-title-2 = Ihre Zahlungsmethode ist abgelaufen oder läuft bald ab
subscriptionsPaymentExpired-content-2 = Die Zahlungsmethode, die Sie zum Ausführen von Zahlungen für die folgenden Abonnements verwenden, ist abgelaufen oder läuft bald ab.
subscriptionsPaymentProviderCancelled-subject = Aktualisierung der Zahlungsinformationen für { -brand-mozilla }-Abonnements erforderlich
subscriptionsPaymentProviderCancelled-title = Entschuldigung, wir haben Probleme mit Ihrer Zahlungsmethode
subscriptionsPaymentProviderCancelled-content-detected = Wir haben ein Problem mit Ihrer Zahlungsmethode für die folgenden Abonnements festgestellt.
subscriptionsPaymentProviderCancelled-content-payment-1 = Möglicherweise ist Ihre Zahlungsmethode abgelaufen oder Ihre aktuelle Zahlungsmethode ist veraltet.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = { $productName }-Zahlung erhalten
subscriptionSubsequentInvoice-title = Vielen Dank, dass Sie Abonnent sind!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Wir haben Ihre letzte Zahlung für { $productName } erhalten.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = Ihre nächste Rechnung wird am { $nextInvoiceDateOnly } ausgestellt.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Sie haben ein Upgrade auf { $productName } durchgeführt
subscriptionUpgrade-title = Vielen Dank für das Upgrade!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Sie haben erfolgreich das Upgrade auf { $productName } durchgeführt.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Ihnen wurde eine einmalige Gebühr in Höhe von { $invoiceAmountDue } berechnet, um den höheren Preis Ihres Abonnements für den Rest dieses Abrechnungszeitraums widerzuspiegeln ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Sie haben eine Kontogutschrift in Höhe von { $paymentProrated } erhalten.
subscriptionUpgrade-content-subscription-next-bill-change = Ab Ihrer nächsten Rechnung ändert sich der Preis Ihres Abonnements.
subscriptionUpgrade-content-old-price-day = Die vorherige Gebühr betrug { $paymentAmountOld } pro Tag.
subscriptionUpgrade-content-old-price-week = Die vorherige Gebühr betrug { $paymentAmountOld } pro Woche.
subscriptionUpgrade-content-old-price-month = Die vorherige Gebühr betrug { $paymentAmountOld } pro Monat.
subscriptionUpgrade-content-old-price-halfyear = Die vorherige Gebühr betrug { $paymentAmountOld } für sechs Monate.
subscriptionUpgrade-content-old-price-year = Die vorherige Gebühr betrug { $paymentAmountOld } pro Jahr.
subscriptionUpgrade-content-old-price-default = Die vorherige Gebühr betrug { $paymentAmountOld } pro Abrechnungsintervall.
subscriptionUpgrade-content-old-price-day-tax = Die vorherige Gebühr betrug { $paymentAmountOld } + { $paymentTaxOld } Steuern pro Tag.
subscriptionUpgrade-content-old-price-week-tax = Der vorherige Gebühr betrug { $paymentAmountOld } + { $paymentTaxOld } Steuern pro Woche.
subscriptionUpgrade-content-old-price-month-tax = Der vorherige Gebühr betrug { $paymentAmountOld } + { $paymentTaxOld } Steuern pro Monat.
subscriptionUpgrade-content-old-price-halfyear-tax = Der vorherige Gebühr betrug { $paymentAmountOld } + { $paymentTaxOld } Steuern pro sechs Monate.
subscriptionUpgrade-content-old-price-year-tax = Der vorherige Gebühr betrug { $paymentAmountOld } + { $paymentTaxOld } Steuern pro Jahr.
subscriptionUpgrade-content-old-price-default-tax = Der vorherige Gebühr betrug { $paymentAmountOld } + { $paymentTaxOld } Steuern pro Abrechnungsintervall.
subscriptionUpgrade-content-new-price-day = Ab sofort werden Ihnen { $paymentAmountNew } pro Tag berechnet, Rabatte sind nicht inbegriffen.
subscriptionUpgrade-content-new-price-week = Ab sofort werden Ihnen { $paymentAmountNew } pro Woche berechnet, Rabatte sind nicht inbegriffen.
subscriptionUpgrade-content-new-price-month = Ab sofort werden Ihnen { $paymentAmountNew } pro Monat berechnet, Rabatte sind nicht inbegriffen.
subscriptionUpgrade-content-new-price-halfyear = Ab sofort werden Ihnen alle sechs Monate { $paymentAmountNew } in Rechnung gestellt, Rabatte nicht inbegriffen.
subscriptionUpgrade-content-new-price-year = Ab sofort werden Ihnen { $paymentAmountNew } pro Jahr in Rechnung gestellt, Rabatte sind nicht inbegriffen.
subscriptionUpgrade-content-new-price-default = Ab sofort werden Ihnen { $paymentAmountNew } pro Abrechnungsintervall berechnet, Rabatte sind nicht inbegriffen.
subscriptionUpgrade-content-new-price-day-dtax = Ab sofort werden Ihnen { $paymentAmountNew } + { $paymentTaxNew } Steuern pro Tag berechnet, Rabatte nicht inbegriffen.
subscriptionUpgrade-content-new-price-week-tax = Ab sofort werden Ihnen { $paymentAmountNew } + { $paymentTaxNew } Steuern pro Woche berechnet, Rabatte nicht inbegriffen.
subscriptionUpgrade-content-new-price-month-tax = Ab sofort werden Ihnen { $paymentAmountNew } + { $paymentTaxNew } Steuern pro Monat (ohne Rabatte) berechnet.
subscriptionUpgrade-content-new-price-halfyear-tax = Ab sofort werden Ihnen alle sechs Monate (ohne Rabatte) { $paymentAmountNew } + { $paymentTaxNew } Steuern berechnet.
subscriptionUpgrade-content-new-price-year-tax = Ab sofort werden Ihnen { $paymentAmountNew } + { $paymentTaxNew } Steuern pro Jahr in Rechnung gestellt, Rabatte nicht inbegriffen.
subscriptionUpgrade-content-new-price-default-tax = Ab sofort werden Ihnen { $paymentAmountNew } + { $paymentTaxNew } Steuern pro Abrechnungsintervall (ohne Rabatte) berechnet.
subscriptionUpgrade-existing = Wenn sich Ihre bestehenden Abonnements bei diesem Upgrade überschneiden, bearbeiten wir diese und schicken Ihnen eine separate E-Mail mit den Details. Wenn Ihr neuer Plan Produkte enthält, die installiert werden müssen, senden wir Ihnen eine separate E-Mail mit Anweisungen zur Einrichtung.
subscriptionUpgrade-auto-renew = Ihr Abonnement verlängert sich automatisch jeden Abrechnungszeitraum, sofern Sie nicht kündigen.
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Verwenden Sie { $unblockCode } zur Anmeldung
unblockCode-preview = Dieser Code läuft in einer Stunde ab
unblockCode-title = Sind Sie das, der sich da anmeldet?
unblockCode-prompt = Wenn ja, ist hier der benötigte Autorisierungscode:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Wenn ja, ist hier der benötigte Autorisierungscode: { $unblockCode }
unblockCode-report = Wenn nicht, helfen Sie uns bei der Abwehr von Eindringlingen und <a data-l10n-name="reportSignInLink">schreiben Sie eine Meldung an uns</a>.
unblockCode-report-plaintext = Wenn nicht, helfen Sie uns bei der Abwehr von Eindringlingen und schreiben Sie eine Meldung an uns.
verificationReminderFinal-subject = Letzte Erinnerung: Bestätigen Sie Ihr Konto
verificationReminderFinal-description-2 = Vor ein paar Wochen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Zu Ihrer Sicherheit löschen wir das Konto, wenn es nicht innerhalb der nächsten 24 Stunden verifiziert wird.
confirm-account = Konto bestätigen
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Denken Sie daran, Ihr Konto zu bestätigen
verificationReminderFirst-title-3 = Willkommen bei { -brand-mozilla }!
verificationReminderFirst-description-3 = Vor ein paar Tagen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Bitte bestätigen Sie Ihr Konto in den nächsten 15 Tagen oder es wird automatisch gelöscht.
verificationReminderFirst-sub-description-3 = Verpassen Sie nicht den Browser, bei dem Sie und Ihre Privatsphäre an erster Stelle stehen.
confirm-email-2 = Konto bestätigen
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Konto bestätigen
verificationReminderSecond-subject-2 = Denken Sie daran, Ihr Konto zu bestätigen
verificationReminderSecond-title-3 = Verpassen Sie { -brand-mozilla } nicht!
verificationReminderSecond-description-4 = Vor ein paar Tagen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Bitte bestätigen Sie Ihr Konto in den nächsten 10 Tagen oder es wird automatisch gelöscht.
verificationReminderSecond-second-description-3 = Mit Ihrem { -product-mozilla-account } können Sie Ihr { -brand-firefox }-Erlebnis geräteübergreifend synchronisieren und den Zugriff auf weitere Datenschutzprodukte von { -brand-mozilla } freischalten.
verificationReminderSecond-sub-description-2 = Werden Sie Teil unserer Mission, das Internet in einen Ort zu verwandeln, der für alle offen ist.
verificationReminderSecond-action-2 = Konto bestätigen
verify-title-3 = Öffnen Sie das Internet mit { -brand-mozilla }
verify-description-2 = Bestätigen Sie Ihr Konto und nutzen Sie { -brand-mozilla } überall dort, wo Sie sich anmelden. Erster Schritt:
verify-subject = Erstellung Ihres Kontos abschließen
verify-action-2 = Konto bestätigen
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Verwenden Sie { $code }, um Ihr Konto zu ändern
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Dieser Code läuft in { $expirationTime } Minute ab.
       *[other] Dieser Code läuft in { $expirationTime } Minuten ab.
    }
verifyAccountChange-title = Ändern Sie Ihre Kontodaten?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Helfen Sie uns, Ihr Konto zu schützen und bestätigen Sie diese Änderung auf:
verifyAccountChange-prompt = Wenn ja, ist hier Ihr Autorisierungscode:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Er läuft in { $expirationTime } Minute ab.
       *[other] Er läuft in { $expirationTime } Minuten ab.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Haben Sie sich bei { $clientName } angemeldet?
verifyLogin-description-2 = Helfen Sie uns, Ihr Konto zu schützen, indem Sie bestätigen, dass Sie sich angemeldet haben:
verifyLogin-subject-2 = Anmeldung bestätigen
verifyLogin-action = Anmeldung bestätigen
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Verwenden Sie { $code } zur Anmeldung
verifyLoginCode-preview = Dieser Code läuft in 5 Minuten ab.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Haben Sie sich bei { $serviceName } angemeldet?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Helfen Sie uns, Ihr Konto zu schützen, indem Sie Ihre Anmeldung genehmigen:
verifyLoginCode-prompt-3 = Wenn ja, ist hier Ihr Autorisierungscode:
verifyLoginCode-expiry-notice = Er läuft in 5 Minuten ab.
verifyPrimary-title-2 = Primäre E-Mail-Adresse bestätigen
verifyPrimary-description = Eine Anforderung zu einer Kontenänderung kam von folgendem Gerät:
verifyPrimary-subject = Primäre E-Mail-Adresse bestätigen
verifyPrimary-action-2 = E-Mail-Adresse bestätigen
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Nach der Bestätigung sind Kontoänderungen wie das Hinzufügen einer sekundären E-Mail-Adresse von diesem Gerät aus möglich.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Verwenden Sie { $code }, um Ihre sekundäre E-Mail-Adresse zu bestätigen
verifySecondaryCode-preview = Dieser Code läuft in 5 Minuten ab.
verifySecondaryCode-title-2 = Sekundäre E-Mail-Adresse bestätigen
verifySecondaryCode-action-2 = E-Mail-Adresse bestätigen
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Von folgendem { -product-mozilla-account } erfolgte eine Anfrage, { $email } als Zweit-E-Mail-Adresse zu nutzen:
verifySecondaryCode-prompt-2 = Verwenden Sie diesen Bestätigungscode:
verifySecondaryCode-expiry-notice-2 = Er läuft in fünf Minuten ab. Nach der Bestätigung erhält diese Adresse Sicherheitsbenachrichtigungen und Bestätigungen.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Verwenden Sie { $code }, um Ihr Konto zu bestätigen
verifyShortCode-preview-2 = Dieser Code läuft in 5 Minuten ab
verifyShortCode-title-3 = Öffnen Sie das Internet mit { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Bestätigen Sie Ihr Konto und nutzen Sie { -brand-mozilla } überall dort, wo Sie sich anmelden. Erster Schritt:
verifyShortCode-prompt-3 = Verwenden Sie diesen Bestätigungscode:
verifyShortCode-expiry-notice = Er läuft in 5 Minuten ab.
