



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox-Konten
-product-mozilla-account = Mozilla-Konto
-product-mozilla-accounts = Mozilla-Konten
-product-firefox-account = Firefox-Konto
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Allgemeiner Anwendungsfehler
app-general-err-message = Etwas ist schiefgegangen. Bitte versuchen Sie es später erneut.
app-query-parameter-err-heading = Fehlerhafte Anfrage: Ungültige Anfrageparameter


app-footer-mozilla-logo-label = { -brand-mozilla }-Logo
app-footer-privacy-notice = Datenschutzhinweis zu dieser Website
app-footer-terms-of-service = Nutzungsbedingungen


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Öffnet in neuem Fenster


app-loading-spinner-aria-label-loading = Wird geladen…


app-logo-alt-3 =
    .alt = { -brand-mozilla }-m-Logo



settings-home = Startseite des Kontos
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Aktionscode angewendet
coupon-submit = Anwenden
coupon-remove = Entfernen
coupon-error = Der eingegebene Code ist ungültig oder abgelaufen.
coupon-error-generic = Beim Verarbeiten des Codes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.
coupon-error-expired = Der eingegebene Code ist abgelaufen.
coupon-error-limit-reached = Der eingegebene Code hat sein Limit erreicht.
coupon-error-invalid = Der eingegebene Code ist ungültig.
coupon-enter-code =
    .placeholder = Code eingeben


default-input-error = Dieses Feld ist erforderlich
input-error-is-required = { $label } ist erforderlich


brand-name-mozilla-logo = { -brand-mozilla }-Logo


new-user-sign-in-link-2 = Haben Sie schon ein { -product-mozilla-account }? <a>Melden Sie sich an</a>
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
new-user-invalid-email-domain = E-Mail-Adresse falsch geschrieben? { $domain } bietet keine E-Mail-Dienste an.


payment-confirmation-thanks-heading = Vielen Dank!
payment-confirmation-thanks-heading-account-exists = Vielen Dank, bitte sehen Sie jetzt nach Ihren E-Mails!
payment-confirmation-thanks-subheading = An { $email } wurde eine Bestätigungs-E-Mail mit Details zu den ersten Schritten mit { $product_name } gesendet.
payment-confirmation-thanks-subheading-account-exists = Sie erhalten eine E-Mail an { $email } mit Anweisungen zum Einrichten Ihres Kontos sowie Ihren Zahlungsdetails.
payment-confirmation-order-heading = Bestelldetails
payment-confirmation-invoice-number = Rechnung #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Zahlungsinformationen
payment-confirmation-amount = { $amount } pro { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } täglich
       *[other] { $amount } alle { $intervalCount } Tage
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } wöchentlich
       *[other] { $amount } alle { $intervalCount } Wochen
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } monatlich
       *[other] { $amount } alle { $intervalCount } Monate
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } jährlich
       *[other] { $amount } alle { $intervalCount } Jahre
    }
payment-confirmation-download-button = Weiter zum Download


payment-confirm-with-legal-links-static-3 = Ich ermächtige { -brand-mozilla }, meine Zahlungsmethode gemäß den <termsOfServiceLink>Nutzungsbedingungen</termsOfServiceLink> und dem <privacyNoticeLink>Datenschutzhinweis</privacyNoticeLink> mit dem angezeigten Betrag zu belasten, bis ich meinen Dauerauftrag kündige.
payment-confirm-checkbox-error = Sie müssen dieses Kästchen aktivieren, bevor Sie fortfahren


payment-error-retry-button = Erneut versuchen
payment-error-manage-subscription-button = Mein Abonnement verwalten


iap-upgrade-already-subscribed-2 = Sie haben bereits ein { $productName }-Abonnement über die App Stores von { -brand-google } oder { -brand-apple }.
iap-upgrade-no-bundle-support = Wir unterstützen keine Upgrades für diese Abonnements, dies folgt aber bald.
iap-upgrade-contact-support = Sie können dieses Produkt weiterhin erhalten – wenden Sie sich bitte an den Support, damit wir Ihnen helfen können.
iap-upgrade-get-help-button = Unterstützung erhalten


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


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } verwendet { -brand-name-stripe } und { -brand-paypal } für die sichere Zahlungsabwicklung.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Datenschutzerklärung von { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Datenschutzerklärung von { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } verwendet { -brand-paypal } für die sichere Zahlungsabwicklung.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Datenschutzerklärung von { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } verwendet { -brand-name-stripe } für die sichere Zahlungsabwicklung.
payment-legal-link-stripe-3 = <stripePrivacyLink>Datenschutzerklärung von { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Wählen Sie Ihre Zahlungsmethode
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Zuerst müssen Sie Ihren Dauerauftrag genehmigen


payment-processing-message = Bitte warten Sie, während wir Ihre Zahlung bearbeiten …


payment-confirmation-cc-card-ending-in = Karte endet auf { $last4 }


pay-with-heading-paypal-2 = Mit { -brand-paypal } bezahlen


plan-details-header = Produktdetails
plan-details-list-price = Listenpreis
plan-details-show-button = Details anzeigen
plan-details-hide-button = Details ausblenden
plan-details-total-label = Gesamt
plan-details-tax = Steuern und Gebühren


product-no-such-plan = Für dieses Produkt existiert kein solcher Plan.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } Steuern
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


subscription-create-title = Ihr Abonnement einrichten
subscription-success-title = Abonnementbestätigung
subscription-processing-title = Abonnement wird bestätigt…
subscription-error-title = Fehler beim Bestätigen des Abonnements…
subscription-noplanchange-title = Diese Änderung des Abonnementplans wird nicht unterstützt
subscription-iapsubscribed-title = Bereits abonniert
sub-guarantee = 30 Tage Geld-zurück-Garantie


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Nutzungsbedingungen
privacy = Datenschutzhinweis
terms-download = Nutzungsbedingungen herunterladen


document =
    .title = Firefox-Konten
close-aria =
    .aria-label = Modal schließen
settings-subscriptions-title = Abonnements
coupon-promo-code = Aktionscode


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
iap-already-subscribed = Sie sind bereits über den { $mobileAppStore } abonniert.
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


coupon-success = Ihr Plan verlängert sich automatisch zum Listenpreis.
coupon-success-repeating = Ihr Plan verlängert sich automatisch nach { $couponDurationDate } zum Listenpreis.


new-user-step-1-2 = 1. Erstellen Sie ein { -product-mozilla-account }
new-user-card-title = Geben Sie Ihre Kartendaten ein
new-user-submit = Jetzt abonnieren


sub-update-payment-title = Zahlungsinformationen


pay-with-heading-card-only = Mit Karte bezahlen
product-invoice-preview-error-title = Fehler beim Laden der Rechnungsvorschau
product-invoice-preview-error-text = Rechnungsvorschau konnte nicht geladen werden


subscription-iaperrorupgrade-title = Wir können Sie noch nicht upgraden


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Überprüfen Sie Ihr Änderungen
sub-change-failed = Änderung des Plans fehlgeschlagen
sub-update-acknowledgment = Ihr Plan wird sofort geändert und Ihnen wird heute ein anteiliger Betrag für den Rest dieses Abrechnungszeitraums berechnet. Ab dem { $startingDate } wird Ihnen der volle Betrag berechnet.
sub-change-submit = Änderung bestätigen
sub-update-current-plan-label = Derzeitiger Plan
sub-update-new-plan-label = Neuer Plan
sub-update-total-label = Neue Summe
sub-update-prorated-upgrade = Anteiliges Upgrade


sub-update-new-plan-daily = { $productName } (täglich)
sub-update-new-plan-weekly = { $productName } (wöchentlich)
sub-update-new-plan-monthly = { $productName } (monatlich)
sub-update-new-plan-yearly = { $productName } (jährlich)
sub-update-prorated-upgrade-credit = Der angezeigte negative Kontostand wird Ihrem Konto als Guthaben hinzugefügt und für zukünftige Rechnungen verwendet.


sub-item-cancel-sub = Dauerauftrag stornieren
sub-item-stay-sub = Dauerauftrag beibehalten


sub-item-cancel-msg =
    Nach { $period }, dem letzten Tag Ihres Abrechnungszeitraums,
    können Sie { $name } nicht mehr verwenden.
sub-item-cancel-confirm =
    Am { $period } meinen Zugriff beenden und meine in { $name }
    gespeicherten Daten entfernen
sub-promo-coupon-applied = Gutschein { $promotion_name } angewendet: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Diese Abonnementzahlung hat zu einem Guthaben auf Ihrem Konto geführt: <priceDetails></priceDetails>


sub-route-idx-reactivating = Die Erneuerung des Dauerauftrages ist fehlgeschlagen
sub-route-idx-cancel-failed = Die Kündigung des Dauerauftrages ist fehlgeschlagen
sub-route-idx-contact = Hilfe kontaktieren
sub-route-idx-cancel-msg-title = Es tut uns leid, dass Sie uns verlassen
sub-route-idx-cancel-msg =
    Ihr Dauerauftrag für { $name } wurde gekündigt.
    <br />
          Sie haben weiterhin Zugang zu { $name } bis zum { $date }.
sub-route-idx-cancel-aside-2 = Haben Sie Fragen? Besuchen Sie die <a>{ -brand-mozilla }-Hilfe</a>.


sub-customer-error =
    .title = Problem beim Laden des Kunden
sub-invoice-error =
    .title = Problem beim Laden von Rechnungen
sub-billing-update-success = Ihre Zahlungsinformationen wurden erfolgreich aktualisiert
sub-invoice-previews-error-title = Fehler beim Laden der Rechnungsvorschau
sub-invoice-previews-error-text = Rechnungsvorschau konnte nicht geladen werden


pay-update-change-btn = Ändern
pay-update-manage-btn = Verwalten


sub-next-bill = Nächste Abrechnung am { $date }
sub-next-bill-due-date = Die nächste Rechnung ist am { $date } fällig
sub-expires-on = Läuft am { $date } ab




pay-update-card-exp = Läuft ab im { $expirationDate }
sub-route-idx-updating = Zahlungsinformationen werden aktualisiert…
sub-route-payment-modal-heading = Ungültige Zahlungsinformationen
sub-route-payment-modal-message-2 = Es scheint ein Problem mit Ihrem { -brand-paypal }-Konto zu bestehen. Sie müssen die erforderlichen Schritte ausführen, um dieses Zahlungsproblem zu beheben.
sub-route-missing-billing-agreement-payment-alert = Ungültige Zahlungsinformationen; es gibt ein Problem bei Ihrem Konto. <div>Verwalten</div>
sub-route-funding-source-payment-alert = Ungültige Zahlungsinformationen; es gibt ein Problem bei Ihrem Konto. Diese Meldung erscheint möglicherweise auch noch eine Weile, nachdem Sie Ihre Daten aktualisiert haben. <div>Verwalten</div>


sub-item-no-such-plan = Für diesen Dauerauftrag existiert kein solcher Plan.
invoice-not-found = Folgerechnung nicht gefunden
sub-item-no-such-subsequent-invoice = Folgerechnung für dieses Abonnement nicht gefunden.
sub-invoice-preview-error-title = Rechnungsvorschau nicht gefunden
sub-invoice-preview-error-text = Rechnungsvorschau für dieses Abonnement nicht gefunden


reactivate-confirm-dialog-header = Möchten Sie weiterhin { $name } verwenden?
reactivate-confirm-copy =
    Ihr Zugriff auf { $name } und Ihr Abrechnungszeitraum sowie die
    Zahlung bleiben bestehen. Ihre nächste Abbuchung beträgt
    { $amount } am { $endDate } für die Karte mit der Endung { $last }.
reactivate-confirm-without-payment-method-copy =
    Ihr Zugriff auf { $name } und Ihr Abrechnungszeitraum sowie die
    Zahlung bleiben bestehen. Ihre nächste Abbuchung beträgt
    { $amount } am { $endDate }.
reactivate-confirm-button = Dauerauftrag erneuern


reactivate-panel-copy = Sie verlieren am <strong>{ $date }</strong> den Zugriff auf { $name }.
reactivate-success-copy = Vielen Dank! Sie sind startklar.
reactivate-success-button = Schließen


sub-iap-item-google-purchase-2 = { -brand-google }: In-App-Kauf
sub-iap-item-apple-purchase-2 = { -brand-apple }: In-App-Kauf
sub-iap-item-manage-button = Verwalten
