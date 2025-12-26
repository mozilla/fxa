



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox-kontoer
-product-mozilla-account = Mozilla-konto
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla-kontoer
       *[lowercase] Mozilla-kontoer
    }
-product-firefox-account = Firefox-konto
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

app-general-err-heading = Generell programfeil
app-general-err-message = Noe gikk galt. Prøv igjen senere.
app-query-parameter-err-heading = Ugyldig forespørsel: Ugyldige søkeparametere


app-footer-mozilla-logo-label = { -brand-mozilla }-logo
app-footer-privacy-notice = Nettstedets personvernerklæring
app-footer-terms-of-service = Bruksvilkår


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Blir åpnet i et nytt vindu


app-loading-spinner-aria-label-loading = Laster …


app-logo-alt-3 =
    .alt = { -brand-mozilla } m-logo



settings-home = Startside for kontoen
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Kampanjekode brukt
coupon-submit = Bruk
coupon-remove = Fjern
coupon-error = Koden du skrev inn er ugyldig eller utløpt.
coupon-error-generic = Det oppstod en feil under behandling av koden. Prøv på nytt.
coupon-error-expired = Koden du skrev inn er utløpt.
coupon-error-limit-reached = Koden du skrev inn har nådd grensen.
coupon-error-invalid = Koden du skrev inn er ugyldig.
coupon-enter-code =
    .placeholder = Skriv inn kode


default-input-error = Dette feltet er obligatorisk
input-error-is-required = { $label } er påkrevd


brand-name-mozilla-logo = { -brand-mozilla }-logo


new-user-sign-in-link-2 = Har du allerede en { -product-mozilla-account }? <a>Logg inn</a>
new-user-enter-email =
    .label = Skriv inn e-postadressen din
new-user-confirm-email =
    .label = Bekreft e-postadressen din
new-user-subscribe-product-updates-mozilla = Jeg vil gjerne motta produktnyheter og oppdateringer fra { -brand-mozilla }
new-user-subscribe-product-updates-snp = Jeg vil gjerne motta nyheter og oppdateringer om sikkerhet og personvern fra { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Jeg vil gjerne motta produktnyheter og oppdateringer fra { -product-mozilla-hubs } og { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Jeg vil gjerne motta produktnyheter og oppdateringer fra { -product-mdn-plus } og { -brand-mozilla }
new-user-subscribe-product-assurance = Vi bruker kun e-postadressen din til å opprette kontoen din. Vi vil aldri selge den til en tredjepart.
new-user-email-validate = E-postadressen er ikke gyldig
new-user-email-validate-confirm = E-postadressene stemmer ikke overens
new-user-already-has-account-sign-in = Du har allerede en konto. <a>Logg inn</a>
new-user-invalid-email-domain = Skrivefeil i e-postadresse? { $domain } tilbyr ikke e-post.


payment-confirmation-thanks-heading = Takk skal du ha!
payment-confirmation-thanks-heading-account-exists = Takk, sjekk e-posten din nå!
payment-confirmation-thanks-subheading = En bekreftelsesmelding er sendt til { $email } med detaljer om hvordan du kommer i gang med { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Du vil motta en e-post på { $email } med instruksjoner for hvordan du konfigurerer kontoen din, samt betalingsinformasjonen din.
payment-confirmation-order-heading = Ordredetaljer
payment-confirmation-invoice-number = Fakturanummer { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betalingsinformasjon
payment-confirmation-amount = { $amount } per { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } daglig
       *[other] { $amount } hver { $intervalCount } dag
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } ukentlig
       *[other] { $amount } hver { $intervalCount } uke
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } månedlig
       *[other] { $amount } hver { $intervalCount } måned
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } årlig
       *[other] { $amount } hvert { $intervalCount } år
    }
payment-confirmation-download-button = Fortsett til nedlasting


payment-confirm-with-legal-links-static-3 = Jeg autoriserer { -brand-mozilla }, til å belaste betalingsmåten min for beløpet som vises, i henhold til <termsOfServiceLink>bruksvilkår</termsOfServiceLink> og <privacyNoticeLink>personvernerklæring</privacyNoticeLink>, inntil jeg sier opp abonnementet mitt.
payment-confirm-checkbox-error = Du må fullføre dette før du går videre


payment-error-retry-button = Prøv igjen
payment-error-manage-subscription-button = Behandle mitt abonnement


iap-upgrade-already-subscribed-2 = Du har allerede et { $productName }-abonnement via { -brand-google }s eller { -brand-apple }s appbutikker.
iap-upgrade-no-bundle-support = Vi støtter ikke oppgraderinger for disse abonnementene, men vi vil snart.
iap-upgrade-contact-support = Du kan fortsatt få dette produktet — kontakt brukerstøtten, så kan vi hjelpe deg.
iap-upgrade-get-help-button = Få hjelp


payment-name =
    .placeholder = Fullt navn
    .label = Navn slik det vises på kortet ditt
payment-cc =
    .label = Kortet ditt
payment-cancel-btn = Avbryt
payment-update-btn = Oppdater
payment-pay-btn = Betal nå
payment-pay-with-paypal-btn-2 = Betal med { -brand-paypal }
payment-validate-name-error = Skriv inn navnet ditt


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } bruker { -brand-name-stripe } og { -brand-paypal } for sikker behandling av betaling.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } personvernpraksis</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } personvernpraksis</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } bruker { -brand-paypal } for sikker behandling av betaling.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } personvernpraksis</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } bruker { -brand-name-stripe } for sikker behandling av betaling.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } personvernpraksis</stripePrivacyLink>


payment-method-header = Velg betalingsmåte
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Først må du godkjenne abonnementet ditt


payment-processing-message = Vent mens vi behandler betalingen din…


payment-confirmation-cc-card-ending-in = Kort som slutter på { $last4 }


pay-with-heading-paypal-2 = Betal med { -brand-paypal }


plan-details-header = Produktdetaljer
plan-details-list-price = Listepris
plan-details-show-button = Vis detaljer
plan-details-hide-button = Skjul detaljer
plan-details-total-label = Totalt
plan-details-tax = Skatter og avgifter


product-no-such-plan = Ingen slik plan for dette produktet.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } skatt
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } daglig
       *[other] { $priceAmount } hver { $intervalCount }. dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } daglig
           *[other] { $priceAmount } hver { $intervalCount }. dag
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } ukentlig
       *[other] { $priceAmount } hver { $intervalCount }. uke
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ukentlig
           *[other] { $priceAmount } hver { $intervalCount }. uke
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } månedlig
       *[other] { $priceAmount } hver { $intervalCount }. måned
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } månedlig
           *[other] { $priceAmount } hver { $intervalCount }. måned
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } årlig
       *[other] { $priceAmount } hvert { $intervalCount }. år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } årlig
           *[other] { $priceAmount } hvert { $intervalCount }. år
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt daglig
       *[other] { $priceAmount } + { $taxAmount } skatt hver { $intervalCount }. dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt daglig
           *[other] { $priceAmount } + { $taxAmount } skatt hver { $intervalCount }. dag
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt ukentlig
       *[other] { $priceAmount } + { $taxAmount } skatt hver { $intervalCount }. uke
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt ukentlig
           *[other] { $priceAmount } + { $taxAmount } skatt hver { $intervalCount }. uke
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt månedlig
       *[other] { $priceAmount } + { $taxAmount } skatt hver { $intervalCount }. måned
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt månedlig
           *[other] { $priceAmount } + { $taxAmount } skatt hver { $intervalCount }. måned
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt årlig
       *[other] { $priceAmount } + { $taxAmount } skatt hvert { $intervalCount }. år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt årlig
           *[other] { $priceAmount } + { $taxAmount } skatt hvert { $intervalCount }. år
        }


subscription-create-title = Sett opp abonnementet ditt
subscription-success-title = Bekreftelse av abonnement
subscription-processing-title = Bekrefter abonnementet …
subscription-error-title = Feil under bekreftelse av abonnement …
subscription-noplanchange-title = Denne endringen av abonnementsplanen støttes ikke
subscription-iapsubscribed-title = Abonnerer allerede
sub-guarantee = 30-dagers pengene-tilbake-garanti


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Bruksvilkår
privacy = Personvernerklæring
terms-download = Vilkår for nedlasting


document =
    .title = Firefox-kontoer
close-aria =
    .aria-label = Lukk modal
settings-subscriptions-title = Abonnementer
coupon-promo-code = Rabattkode


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } daglig
       *[other] { $amount } hver { $intervalCount }. dag
    }
    .title =
        { $intervalCount ->
            [one] { $amount } daglig
           *[other] { $amount } hver { $intervalCount }. dag
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } ukentlig
       *[other] { $amount } hver { $intervalCount }. uke
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ukentlig
           *[other] { $amount } hver { $intervalCount }. uke
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } månedlig
       *[other] { $amount } hver { $intervalCount }. måned
    }
    .title =
        { $intervalCount ->
            [one] { $amount } månedlig
           *[other] { $amount } hver { $intervalCount }. måned
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } årlig
       *[other] { $amount } hvert { $intervalCount }. år
    }
    .title =
        { $intervalCount ->
            [one] { $amount } årlig
           *[other] { $amount } hvert { $intervalCount }. år
        }


general-error-heading = Generell applikasjonsfeil
basic-error-message = Noe gikk galt. Prøv igjen senere.
payment-error-1 = Hmm. Det oppstod et problem med å godkjenne betalingen din. Prøv igjen eller ta kontakt med kortutstederen din.
payment-error-2 = Hmm. Det oppstod et problem med å godkjenne betalingen din. Ta kontakt med kortutstederen din.
payment-error-3b = Det oppstod en uventet feil under behandlingen av betalingen. Prøv igjen.
expired-card-error = Det ser ut som om at bankkortet ditt har gått ut. Prøv et annet kort.
insufficient-funds-error = Det ser ut som om kortet ditt ikke har tilstrekkelig med penger. Prøv et annet kort.
withdrawal-count-limit-exceeded-error = Det ser ut til at denne transaksjonen vil overskride kredittgrensen din. Prøv et annet kort.
charge-exceeds-source-limit = Det ser ut til at denne transaksjonen vil overskride den daglige kredittgrensen din. Prøv et annet kort eller om 24 timer.
instant-payouts-unsupported = Det ser ut som at betalingskortet ditt ikke er konfigurert for øyeblikkelige betalinger. Prøv et annet betalingskort.
duplicate-transaction = Hmm. Det ser ut som en identisk transaksjon nettopp ble utført. Sjekk betalingshistorikken.
coupon-expired = Det ser ut som at kampanjekoden har gått ut.
card-error = Transaksjonen din kunne ikke behandles. Kontroller betalingskortinformasjonen din og prøv igjen.
country-currency-mismatch = Valutaen for dette abonnementet er ikke gyldig for landet som er knyttet til betalingen din.
currency-currency-mismatch = Bekalger. Du kan ikke bytte mellom valutaer.
location-unsupported = Din nåværende plassering støttes ikke i henhold til våre bruksvilkår.
no-subscription-change = Beklager. Du kan ikke endre abonnementsplanen din.
iap-already-subscribed = Du abonnerer allerede via { $mobileAppStore }.
fxa-account-signup-error-2 = En systemfeil førte til at { $productName }-registreringen mislyktes. Betalingsmåten din er ikke belastet. Prøv igjen.
fxa-post-passwordless-sub-error = Abonnementet ble bekreftet, men bekreftelsessiden kunne ikke lastes inn. Sjekk e-posten din for å sette opp kontoen din.
newsletter-signup-error = Du er ikke registrert for produktoppdateringer via e-post. Du kan prøve igjen i kontoinnstillingene.
product-plan-error =
    .title = Problem med å laste planene dine
product-profile-error =
    .title = Problem med å laste profil
product-customer-error =
    .title = Problem med å laste inn kunde
product-plan-not-found = Fant ikke planen
product-location-unsupported-error = Plassering støttes ikke


coupon-success = Planen din fornyes automatisk til listeprisen.
coupon-success-repeating = Planen din fornyes automatisk etter { $couponDurationDate } til listeprisen.


new-user-step-1-2 = 1. Opprett en { -product-mozilla-account }
new-user-card-title = Skriv inn betalingskortinformasjon
new-user-submit = Abonner nå


sub-update-payment-title = Betalingsinformasjon


pay-with-heading-card-only = Betal med kort
product-invoice-preview-error-title = Problem med å laste inn forhåndsvisning av faktura
product-invoice-preview-error-text = Kunne ikke laste inn forhåndsvisningen av faktura


subscription-iaperrorupgrade-title = Vi kan ikke oppgradere deg helt ennå


brand-name-google-play-2 = { -google-play } butikk
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Se gjennom endringen
sub-change-failed = Endring av plan mislyktes
sub-update-acknowledgment =
    Abonnementet ditt endres umiddelbart, og du blir belastet et justert
    beløp i dag for resten av denne faktureringsperioden. Fra og med { $startingDate }
    blir du belastet hele beløpet.
sub-change-submit = Bekreft endring
sub-update-current-plan-label = Gjeldende plan
sub-update-new-plan-label = Ny plan
sub-update-total-label = Ny sum
sub-update-prorated-upgrade = Oppgradering med pris justert etter bruk


sub-update-new-plan-daily = { $productName } (daglig)
sub-update-new-plan-weekly = { $productName } (ukentlig)
sub-update-new-plan-monthly = { $productName } (månedlig)
sub-update-new-plan-yearly = { $productName } (årlig)
sub-update-prorated-upgrade-credit = Negativ saldo som vises vil bli kreditert kontoen din og brukt til fremtidige fakturaer.


sub-item-cancel-sub = Avbryt abonnement
sub-item-stay-sub = Fortsett abonnementet


sub-item-cancel-msg =
    Du vil ikke lenger kunne bruke { $name } etter
    { $period }, den siste dagen i faktureringssyklusen.
sub-item-cancel-confirm =
    Avbryt tilgangen min og den lagrede informasjonen min for
    { $name } den { $period }
sub-promo-coupon-applied = { $promotion_name }-kupong brukt: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Denne abonnementsbetalingen resulterte i en kreditering av kontosaldoen din: <priceDetails></priceDetails>


sub-route-idx-reactivating = Reaktivering av abonnement mislyktes
sub-route-idx-cancel-failed = Avbryting av abonnement mislyktes
sub-route-idx-contact = Kontakt support
sub-route-idx-cancel-msg-title = Vi synes at det er synd at du sier opp abonnementet ditt
sub-route-idx-cancel-msg =
    { $name }-abonnementet ditt er avsluttet.
          <br />
          Du vil fortsatt ha tilgang til { $name } til den { $date }.
sub-route-idx-cancel-aside-2 = Har du spørsmål? Besøk <a>{ -brand-mozilla }-brukerstøtte</a>.


sub-customer-error =
    .title = Problem med å laste inn kunde
sub-invoice-error =
    .title = Problemer med å laste inn fakturaer
sub-billing-update-success = Faktureringsinformasjonen din er oppdatert
sub-invoice-previews-error-title = Problem med å laste inn forhåndsvisninger av fakturaer
sub-invoice-previews-error-text = Kunne ikke laste inn forhåndsvisninger av fakturaer


pay-update-change-btn = Endre
pay-update-manage-btn = Behandle


sub-next-bill = Neste fakturering den { $date }
sub-next-bill-due-date = Neste fakturering forfaller { $date }
sub-expires-on = Utløper { $date }




pay-update-card-exp = Utløper { $expirationDate }
sub-route-idx-updating = Oppdaterer faktureringsinformasjon…
sub-route-payment-modal-heading = Ugyldig faktureringsinformasjon
sub-route-payment-modal-message-2 = Det ser ut til å være en feil med { -brand-paypal }-kontoen din. Vi trenger at du tar de nødvendige skrittene for å løse dette betalingsproblemet.
sub-route-missing-billing-agreement-payment-alert = Ugyldig betalingsinformasjon. Det er en feil med kontoen din. <div>Behandle</div>
sub-route-funding-source-payment-alert = Ugyldig betalingsinformasjon. Det er en feil med kontoen din. Det kan ta litt tid før dette varselet forsvinner etter at du har oppdatert informasjonen din. <div>Behandle</div>


sub-item-no-such-plan = Ingen slik plan for dette abonnementet.
invoice-not-found = Påfølgende faktura ble ikke funnet
sub-item-no-such-subsequent-invoice = Finner ikke påfølgende faktura for dette abonnementet.
sub-invoice-preview-error-title = Fant ikke forhåndsvisning av faktura
sub-invoice-preview-error-text = Fant ikke forhåndsvisning av faktura for dette abonnementet


reactivate-confirm-dialog-header = Vil du fortsette å bruke { $name }?
reactivate-confirm-copy =
    Din tilgang til { $name } vil fortsette, og faktureringssyklusen din
    og betalingen vil forbli den samme. Din neste betaling blir
    på { $amount } den { $endDate } til kortet som slutter på { $last }.
reactivate-confirm-without-payment-method-copy =
    Din tilgang til { $name } vil fortsette, og faktureringssyklusen din
    og betalingen vil forbli den samme. Din neste betaling blir
    på { $amount } den { $endDate }.
reactivate-confirm-button = Abonner på nytt


reactivate-panel-copy = Du mister tilgangen til { $name } den <strong>{ $date }</strong>.
reactivate-success-copy = Takk! Alt er nå klart.
reactivate-success-button = Lukk


sub-iap-item-google-purchase-2 = { -brand-google }: Kjøp i app
sub-iap-item-apple-purchase-2 = { -brand-apple }: Kjøp i app
sub-iap-item-manage-button = Behandle
