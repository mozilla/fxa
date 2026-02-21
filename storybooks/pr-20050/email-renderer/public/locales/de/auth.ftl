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
cancellationSurvey = Bitte helfen Sie uns, unsere Dienste zu verbessern, indem Sie an dieser <a data-l10n-name="cancellationSurveyUrl">kurzen Umfrage</a> teilnehmen.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Bitte helfen Sie uns, unsere Dienste zu verbessern, indem Sie diese kurze Umfrage ausfüllen:
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
view-invoice-link-action = Rechnung ansehen
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Rechnung anzeigen: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ihr Abonnement für { $productName } wurde gekündigt
subscriptionAccountDeletion-title = Schade, dass Sie gehen
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Sie haben kürzlich Ihr { -product-mozilla-account } gelöscht. Aus diesem Grund haben wir Ihr Abonnement für { $productName } gekündigt. Ihre letzte Zahlung von { $invoiceTotal } wurde am { $invoiceDateOnly } bezahlt.
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
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Ihr Abonnement für { $productName } läuft bald ab
subscriptionEndingReminder-title = Ihr Abonnement für { $productName } läuft bald ab
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Ihr Zugriff auf { $productName } endet am <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Wenn Sie { $productName } weiter verwenden möchten, können Sie Ihr Abonnement in den <a data-l10n-name="subscriptionEndingReminder-account-settings">Kontoeinstellungen</a> vor dem <strong>{ $serviceLastActiveDateOnly }</strong> wieder aktivieren. Wenn Sie Hilfe benötigen, <a data-l10n-name="subscriptionEndingReminder-contact-support">kontaktieren Sie unser Hilfe-Team</a>.
subscriptionEndingReminder-content-line1-plaintext = Ihr Zugriff auf { $productName } endet am { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Wenn Sie { $productName } weiter verwenden möchten, können Sie Ihr Abonnement in den Kontoeinstellungen bis zum { $serviceLastActiveDateOnly } wieder aktivieren. Wenn Sie Hilfe benötigen, kontaktieren Sie unser Hilfe-Team.
subscriptionEndingReminder-content-closing = Danke, dass Sie ein geschätzter Abonnent sind!
subscriptionEndingReminder-churn-title = Möchten Sie den Zugriff behalten?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Es gelten begrenzte Bedingungen und Einschränkungen</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Es gelten begrenzte Bedingungen und Einschränkungen: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Kontaktieren Sie unser Hilfe-Team: { $subscriptionSupportUrlWithUtm }
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
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Ihr aktuelles Abonnement verlängert sich automatisch in { $reminderLength } Tagen.
subscriptionRenewalReminder-content-discount-change = Ihre nächste Rechnung zeigt eine Preisänderung an, da ein vorheriger Rabatt abgelaufen ist und ein neuer Rabatt angewendet wurde.
subscriptionRenewalReminder-content-discount-ending = Da ein vorheriger Rabatt abgelaufen ist, wird Ihr Abonnement zum Standardpreis erneuert.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
# Tells the customer that their subscription price will change at the end of the current billing cycle
subscriptionRenewalReminder-content-charge = Zu diesem Zeitpunkt erneuert { -brand-mozilla } Ihr Abonnement für { $planIntervalCount } { $planInterval } und die Zahlungsmethode Ihres Kontos wird mit einer Gebühr in Höhe von { $invoiceTotal } belastet.
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
subscriptionsPaymentExpired-subject-2 = Die Zahlungsmethode für Ihre Abonnements ist abgelaufen oder läuft bald ab
subscriptionsPaymentExpired-title-2 = Ihre Zahlungsmethode ist abgelaufen oder läuft bald ab
subscriptionsPaymentExpired-content-2 = Die Zahlungsmethode, die Sie zum Ausführen von Zahlungen für die folgenden Abonnements verwenden, ist abgelaufen oder läuft bald ab.
subscriptionsPaymentProviderCancelled-subject = Aktualisierung der Zahlungsinformationen für { -brand-mozilla }-Abonnements erforderlich
subscriptionsPaymentProviderCancelled-title = Entschuldigung, wir haben Probleme mit Ihrer Zahlungsmethode
subscriptionsPaymentProviderCancelled-content-detected = Wir haben ein Problem mit Ihrer Zahlungsmethode für die folgenden Abonnements festgestellt.
subscriptionsPaymentProviderCancelled-content-payment-1 = Möglicherweise ist Ihre Zahlungsmethode abgelaufen oder Ihre aktuelle Zahlungsmethode ist veraltet.
