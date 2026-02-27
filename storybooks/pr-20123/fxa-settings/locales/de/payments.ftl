# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Startseite des Kontos
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Aktionscode angewendet
coupon-submit = Anwenden
coupon-remove = Entfernen
coupon-error = Der eingegebene Code ist ungültig oder abgelaufen.
coupon-error-generic = Beim Verarbeiten des Codes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
coupon-error-expired = Der eingegebene Code ist abgelaufen.
coupon-error-limit-reached = Der eingegebene Code hat sein Limit erreicht.
coupon-error-invalid = Der eingegebene Code ist ungültig.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Code eingeben

## Component - Fields

default-input-error = Dieses Feld ist erforderlich
input-error-is-required = { $label } ist erforderlich

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }-Logo

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Haben Sie schon ein { -product-mozilla-account }? <a>Melden Sie sich an</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Geben Sie Ihre E-Mail-Adresse ein
new-user-confirm-email =
    .label = Ihre E-Mail-Adresse bestätigen
new-user-subscribe-product-updates-mozilla = Ich möchte Neuigkeiten zu Produkten von { -brand-mozilla } erhalten
new-user-subscribe-product-updates-snp = Ich möchte Neuigkeiten zu Sicherheit und Datenschutz von { -brand-mozilla } erhalten
new-user-subscribe-product-updates-hubs = Ich möchte Neuigkeiten zu Produkten und Updates von { -product-mozilla-hubs } und { -brand-mozilla } erhalten
new-user-subscribe-product-updates-mdnplus = Ich möchte Neuigkeiten zu Produkten und Updates von { -product-mdn-plus } und { -brand-mozilla } erhalten
new-user-subscribe-product-assurance = Wir verwenden Ihre E-Mail-Adresse nur, um Ihr Konto zu erstellen. Wir verkaufen Sie nie an Dritte.
new-user-email-validate = Ihre E-Mail-Adresse ist ungültig.
new-user-email-validate-confirm = E-Mail-Adressen stimmen nicht überein.
new-user-already-has-account-sign-in = Sie haben bereits ein Benutzerkonto. <a>Melden Sie sich an</a>.
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = E-Mail-Adresse falsch geschrieben? { $domain } bietet keine E-Mail-Dienste an.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Vielen Dank!
payment-confirmation-thanks-heading-account-exists = Vielen Dank, bitte sehen Sie jetzt nach Ihren E-Mails!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = An { $email } wurde eine Bestätigungs-E-Mail mit Details zu den ersten Schritten mit { $product_name } gesendet.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Sie erhalten eine E-Mail an { $email } mit Anweisungen zum Einrichten Ihres Kontos sowie Ihren Zahlungsdetails.
payment-confirmation-order-heading = Bestelldetails
payment-confirmation-invoice-number = Rechnung #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Zahlungsinformationen
payment-confirmation-amount = { $amount } pro { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } täglich
       *[other] { $amount } alle { $intervalCount } Tage
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } wöchentlich
       *[other] { $amount } alle { $intervalCount } Wochen
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } monatlich
       *[other] { $amount } alle { $intervalCount } Monate
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } jährlich
       *[other] { $amount } alle { $intervalCount } Jahre
    }
payment-confirmation-download-button = Weiter zum Download

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Ich ermächtige { -brand-mozilla }, meine Zahlungsmethode gemäß den <termsOfServiceLink>Nutzungsbedingungen</termsOfServiceLink> und dem <privacyNoticeLink>Datenschutzhinweis</privacyNoticeLink> mit dem angezeigten Betrag zu belasten, bis ich meinen Dauerauftrag kündige.
payment-confirm-checkbox-error = Sie müssen dieses Kästchen aktivieren, bevor Sie fortfahren

## Component - PaymentErrorView

payment-error-retry-button = Erneut versuchen
payment-error-manage-subscription-button = Mein Abonnement verwalten

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Sie haben bereits ein { $productName }-Abonnement über die App Stores von { -brand-google } oder { -brand-apple }.
iap-upgrade-no-bundle-support = Wir unterstützen keine Upgrades für diese Abonnements, dies folgt aber bald.
iap-upgrade-contact-support = Sie können dieses Produkt weiterhin erhalten – wenden Sie sich bitte an den Support, damit wir Ihnen helfen können.
iap-upgrade-get-help-button = Unterstützung erhalten

## Component - PaymentForm

payment-name =
    .placeholder = Vollständiger Name
    .label = Name, wie er auf Ihrer Karte erscheint
payment-cc =
    .label = Ihre Karte
payment-cancel-btn = Abonnement kündigen
payment-update-btn = Aktualisieren
payment-pay-btn = Jetzt bezahlen
payment-pay-with-paypal-btn-2 = Mit { -brand-paypal } bezahlen
payment-validate-name-error = Bitte geben Sie Ihren Namen ein

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } verwendet { -brand-name-stripe } und { -brand-paypal } für die sichere Zahlungsabwicklung.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Datenschutzerklärung von { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Datenschutzerklärung von { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } verwendet { -brand-paypal } für die sichere Zahlungsabwicklung.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Datenschutzerklärung von { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } verwendet { -brand-name-stripe } für die sichere Zahlungsabwicklung.
payment-legal-link-stripe-3 = <stripePrivacyLink>Datenschutzerklärung von { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Wählen Sie Ihre Zahlungsmethode
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Zuerst müssen Sie Ihren Dauerauftrag genehmigen

## Component - PaymentProcessing

payment-processing-message = Bitte warten Sie, während wir Ihre Zahlung bearbeiten …

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Karte endet auf { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Mit { -brand-paypal } bezahlen

## Component - PlanDetails

plan-details-header = Produktdetails
plan-details-list-price = Listenpreis
plan-details-show-button = Details anzeigen
plan-details-hide-button = Details ausblenden
plan-details-total-label = Gesamt
plan-details-tax = Steuern und Gebühren

## Component - PlanErrorDialog

product-no-such-plan = Für dieses Produkt existiert kein solcher Plan.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } Steuern
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } pro Tag
       *[other] { $priceAmount } alle { $intervalCount } Tage
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } pro Tag
           *[other] { $priceAmount } alle { $intervalCount } Tage
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } pro Woche
       *[other] { $priceAmount } alle { $intervalCount } Wochen
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } pro Woche
           *[other] { $priceAmount } alle { $intervalCount } Wochen
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } pro Monat
       *[other] { $priceAmount } alle { $intervalCount } Monate
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } pro Monat
           *[other] { $priceAmount } alle { $intervalCount } Monate
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } pro Jahr
       *[other] { $priceAmount } alle { $intervalCount } Jahre
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } pro Jahr
           *[other] { $priceAmount } alle { $intervalCount } Jahre
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } Steuern pro Tag
       *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Tage
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } Steuern pro Tag
           *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Tage
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } Steuern pro Woche
       *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Wochen
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } Steuern pro Woche
           *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Wochen
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } Steuern pro Monat
       *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Monate
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } Steuern pro Monat
           *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Monate
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } Steuern pro Jahr
       *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Jahre
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } Steuern pro Jahr
           *[other] { $priceAmount } + { $taxAmount } Steuern alle { $intervalCount } Jahre
        }

## Component - SubscriptionTitle

subscription-create-title = Ihr Abonnement einrichten
subscription-success-title = Abonnementbestätigung
subscription-processing-title = Abonnement wird bestätigt…
subscription-error-title = Fehler beim Bestätigen des Abonnements…
subscription-noplanchange-title = Diese Änderung des Abonnementplans wird nicht unterstützt
subscription-iapsubscribed-title = Bereits abonniert
sub-guarantee = 30 Tage Geld-zurück-Garantie

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Nutzungsbedingungen
privacy = Datenschutzhinweis
terms-download = Nutzungsbedingungen herunterladen

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox-Konten
# General aria-label for closing modals
close-aria =
    .aria-label = Modal schließen
settings-subscriptions-title = Abonnements
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Aktionscode

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } pro Tag
       *[other] { $amount } alle { $intervalCount } Tage
    }
    .title =
        { $intervalCount ->
            [one] { $amount } pro Tag
           *[other] { $amount } alle { $intervalCount } Tage
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } pro Woche
       *[other] { $amount } alle { $intervalCount } Wochen
    }
    .title =
        { $intervalCount ->
            [one] { $amount } pro Woche
           *[other] { $amount } alle { $intervalCount } Wochen
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } pro Monat
       *[other] { $amount } alle { $intervalCount } Monate
    }
    .title =
        { $intervalCount ->
            [one] { $amount } pro Monat
           *[other] { $amount } alle { $intervalCount } Monate
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } pro Jahr
       *[other] { $amount } alle{ $intervalCount } Jahre
    }
    .title =
        { $intervalCount ->
            [one] { $amount } pro Jahr
           *[other] { $amount } alle{ $intervalCount } Jahre
        }

## Error messages

# App error dialog
general-error-heading = Allgemeiner Anwendungsfehler
basic-error-message = Etwas ist schiefgegangen. Bitte versuchen Sie es später erneut.
payment-error-1 = Hmm. Beim Autorisieren Ihrer Zahlung ist ein Problem aufgetreten. Versuchen Sie es erneut oder setzen Sie sich mit Ihrem Kartenaussteller in Verbindung.
payment-error-2 = Hmm. Beim Autorisieren Ihrer Zahlung ist ein Problem aufgetreten. Setzen Sie sich mit Ihrem Kartenaussteller in Verbindung.
payment-error-3b = Beim Verarbeiten Ihrer Zahlung ist ein unerwarteter Fehler aufgetreten, versuchen Sie es bitte erneut.
expired-card-error = Es sieht so aus, als sei Ihre Kreditkarte abgelaufen. Versuchen Sie es mit einer anderen Karte.
insufficient-funds-error = Es sieht so aus, als ob Ihre Karte nicht genügend Guthaben hat. Versuchen Sie es mit einer anderen Karte.
withdrawal-count-limit-exceeded-error = Es sieht so aus, als würden Sie mit dieser Transaktion Ihr Kreditlimit überschreiten. Versuchen Sie es mit einer anderen Karte.
charge-exceeds-source-limit = Es sieht so aus, als würden Sie mit dieser Transaktion Ihr tägliches Kreditlimit überschreiten. Versuchen Sie es mit einer anderen Karte oder in 24 Stunden.
instant-payouts-unsupported = Ihre Debitkarte ist anscheinend nicht für sofortige Zahlungen eingerichtet. Versuchen Sie es mit einer anderen Debit- oder Kreditkarte.
duplicate-transaction = Hmm. Es sieht so aus, als ob gerade eine identische Transaktion gesendet wurde. Überprüfen Sie Ihre Zahlungshistorie.
coupon-expired = Es sieht so aus, als ob der Promo-Code abgelaufen ist.
card-error = Ihre Transaktion konnte nicht verarbeitet werden. Bitte überprüfen Sie Ihre Kreditkarteninformationen und versuchen Sie es erneut.
country-currency-mismatch = Die Währung dieses Abonnements gilt nicht für das Land, das mit Ihrer Zahlung verknüpft ist.
currency-currency-mismatch = Leider können Sie nicht zwischen Währungen wechseln.
location-unsupported = Ihr aktueller Standort wird nach unseren Nutzungsbedingungen nicht unterstützt.
no-subscription-change = Es tut uns leid. Sie können Ihren Abonnementplan nicht ändern.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Sie sind bereits über den { $mobileAppStore } abonniert.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Ein Systemfehler hat dazu geführt, dass Ihre Anmeldung bei { $productName } fehlgeschlagen ist. Ihre Zahlungsmethode wurde nicht belastet. Bitte versuchen Sie es erneut.
fxa-post-passwordless-sub-error = Abonnement bestätigt, aber die Bestätigungsseite konnte nicht geladen werden. Bitte sehen Sie nach Ihren E-Mails, um Ihr Konto einzurichten.
newsletter-signup-error = Sie haben keine Produktneuigkeiten per E-Mail abonniert. Sie können es in Ihren Kontoeinstellungen erneut versuchen.
product-plan-error =
    .title = Problem beim Laden der Pläne
product-profile-error =
    .title = Problem beim Laden des Profils
product-customer-error =
    .title = Problem beim Laden des Kunden
product-plan-not-found = Plan nicht gefunden
product-location-unsupported-error = Standort nicht unterstützt

## Hooks - coupons

coupon-success = Ihr Plan verlängert sich automatisch zum Listenpreis.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Ihr Plan verlängert sich automatisch nach { $couponDurationDate } zum Listenpreis.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Erstellen Sie ein { -product-mozilla-account }
new-user-card-title = Geben Sie Ihre Kartendaten ein
new-user-submit = Jetzt abonnieren

## Routes - Product and Subscriptions

sub-update-payment-title = Zahlungsinformationen

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Mit Karte bezahlen
product-invoice-preview-error-title = Fehler beim Laden der Rechnungsvorschau
product-invoice-preview-error-text = Rechnungsvorschau konnte nicht geladen werden

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Wir können Sie noch nicht upgraden

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Überprüfen Sie Ihr Änderungen
sub-change-failed = Änderung des Plans fehlgeschlagen
sub-update-acknowledgment = Ihr Plan wird sofort geändert und Ihnen wird heute ein anteiliger Betrag für den Rest dieses Abrechnungszeitraums berechnet. Ab dem { $startingDate } wird Ihnen der volle Betrag berechnet.
sub-change-submit = Änderung bestätigen
sub-update-current-plan-label = Derzeitiger Plan
sub-update-new-plan-label = Neuer Plan
sub-update-total-label = Neue Summe
sub-update-prorated-upgrade = Anteiliges Upgrade

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (täglich)
sub-update-new-plan-weekly = { $productName } (wöchentlich)
sub-update-new-plan-monthly = { $productName } (monatlich)
sub-update-new-plan-yearly = { $productName } (jährlich)
sub-update-prorated-upgrade-credit = Der angezeigte negative Kontostand wird Ihrem Konto als Guthaben hinzugefügt und für zukünftige Rechnungen verwendet.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Dauerauftrag stornieren
sub-item-stay-sub = Dauerauftrag beibehalten

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Nach { $period }, dem letzten Tag Ihres Abrechnungszeitraums,
    können Sie { $name } nicht mehr verwenden.
sub-item-cancel-confirm =
    Am { $period } meinen Zugriff beenden und meine in { $name }
    gespeicherten Daten entfernen
# $promotion_name (String) - The name of the promotion.
# The <priceDetails></priceDetails> component acts as a placeholder and could use one of the following IDs:
# price-details-tax-${interval},
# price-details-no-tax-${interval},
# price-details-tax,
# price-details-no-tax
# Examples:
# 20% OFF coupon applied: $11.20 + $0.35 tax monthly
# Holiday Offer 2023 coupon applied: $11.20 monthly
# Cybersecurity Awareness Month 2023 coupon applied: $11.20 + $0.35 tax
# Summer Promo VPN coupon applied: $11.20
sub-promo-coupon-applied = Gutschein { $promotion_name } angewendet: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Diese Abonnementzahlung hat zu einem Guthaben auf Ihrem Konto geführt: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Die Erneuerung des Dauerauftrages ist fehlgeschlagen
sub-route-idx-cancel-failed = Die Kündigung des Dauerauftrages ist fehlgeschlagen
sub-route-idx-contact = Hilfe kontaktieren
sub-route-idx-cancel-msg-title = Es tut uns leid, dass Sie uns verlassen
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Ihr Dauerauftrag für { $name } wurde gekündigt.
    <br />
          Sie haben weiterhin Zugang zu { $name } bis zum { $date }.
sub-route-idx-cancel-aside-2 = Haben Sie Fragen? Besuchen Sie die <a>{ -brand-mozilla }-Hilfe</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem beim Laden des Kunden
sub-invoice-error =
    .title = Problem beim Laden von Rechnungen
sub-billing-update-success = Ihre Zahlungsinformationen wurden erfolgreich aktualisiert
sub-invoice-previews-error-title = Fehler beim Laden der Rechnungsvorschau
sub-invoice-previews-error-text = Rechnungsvorschau konnte nicht geladen werden

## Routes - Subscription - ActionButton

pay-update-change-btn = Ändern
pay-update-manage-btn = Verwalten

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Nächste Abrechnung am { $date }
sub-next-bill-due-date = Die nächste Rechnung ist am { $date } fällig
sub-expires-on = Läuft am { $date } ab

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Läuft ab im { $expirationDate }
sub-route-idx-updating = Zahlungsinformationen werden aktualisiert…
sub-route-payment-modal-heading = Ungültige Zahlungsinformationen
sub-route-payment-modal-message-2 = Es scheint ein Problem mit Ihrem { -brand-paypal }-Konto zu bestehen. Sie müssen die erforderlichen Schritte ausführen, um dieses Zahlungsproblem zu beheben.
sub-route-missing-billing-agreement-payment-alert = Ungültige Zahlungsinformationen; es gibt ein Problem bei Ihrem Konto. <div>Verwalten</div>
sub-route-funding-source-payment-alert = Ungültige Zahlungsinformationen; es gibt ein Problem bei Ihrem Konto. Diese Meldung erscheint möglicherweise auch noch eine Weile, nachdem Sie Ihre Daten aktualisiert haben. <div>Verwalten</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Für diesen Dauerauftrag existiert kein solcher Plan.
invoice-not-found = Folgerechnung nicht gefunden
sub-item-no-such-subsequent-invoice = Folgerechnung für dieses Abonnement nicht gefunden.
sub-invoice-preview-error-title = Rechnungsvorschau nicht gefunden
sub-invoice-preview-error-text = Rechnungsvorschau für dieses Abonnement nicht gefunden

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Möchten Sie weiterhin { $name } verwenden?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Ihr Zugriff auf { $name } und Ihr Abrechnungszeitraum sowie die
    Zahlung bleiben bestehen. Ihre nächste Abbuchung beträgt
    { $amount } am { $endDate } für die Karte mit der Endung { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Ihr Zugriff auf { $name } und Ihr Abrechnungszeitraum sowie die
    Zahlung bleiben bestehen. Ihre nächste Abbuchung beträgt
    { $amount } am { $endDate }.
reactivate-confirm-button = Dauerauftrag erneuern

## $date (Date) - Last day of product access

reactivate-panel-copy = Sie verlieren am <strong>{ $date }</strong> den Zugriff auf { $name }.
reactivate-success-copy = Vielen Dank! Sie sind startklar.
reactivate-success-button = Schließen

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: In-App-Kauf
sub-iap-item-apple-purchase-2 = { -brand-apple }: In-App-Kauf
sub-iap-item-manage-button = Verwalten
