



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox-kontoar
-product-mozilla-account = Mozilla-konto
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla-kontoar
       *[lowercase] Mozilla-kontoar
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

app-general-err-heading = Generell applikasjonsfeil
app-general-err-message = Noko gjekk gale. Prøv igjen seinare.
app-query-parameter-err-heading = Dårleg førespurnad: Ugyldige søkjeparametrar


app-footer-mozilla-logo-label = { -brand-mozilla }-logo
app-footer-privacy-notice = Personvernmerknadar for nettstaden
app-footer-terms-of-service = Tenestevilkår


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Opnar i nytt vindauge


app-loading-spinner-aria-label-loading = Lastar…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m-logo



settings-home = Startside for kontoen
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Kampanjekode brukt
coupon-submit = Bruk
coupon-remove = Fjern
coupon-error = Koden du skreiv inn er ugyldig eller utgått.
coupon-error-generic = Det oppstod ein feil under handsaming av koden. Prøv på nytt.
coupon-error-expired = Koden du skreiv inn har gått ut.
coupon-error-limit-reached = Koden du skreiv inn har nådd grensa si.
coupon-error-invalid = Koden du skreiv inn er ugyldig.
coupon-enter-code =
    .placeholder = Skriv inn kode


default-input-error = Dette feltet er obligatorisk
input-error-is-required = { $label } er påkravd


brand-name-mozilla-logo = { -brand-mozilla }-logo


new-user-sign-in-link-2 =
    Har du allereie ein
     { -product-mozilla-account }? <a>Logg inn</a>
new-user-enter-email =
    .label = Skriv inn e-postadressa di
new-user-confirm-email =
    .label = Stadfest e-postadressa di
new-user-subscribe-product-updates-mozilla = Eg vil gjerne få produktnyheiter og oppdateringar frå { -brand-mozilla }
new-user-subscribe-product-updates-snp = Eg vil gjerne få nyheteir og oppdateringar om sikkerheit og personvern frå { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Eg vil gjerne få produktnyheiter og oppdateringar frå { -product-mozilla-hubs } og { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Eg vil gjerne få produktnyheiter og oppdateringar frå { -product-mdn-plus } og { -brand-mozilla }
new-user-subscribe-product-assurance = Vi brukar berre e-postadressa di for å opprette kontoen din. Vi vil aldri selje henne til ein tredje part.
new-user-email-validate = E-postadressa er ikkje gyldig
new-user-email-validate-confirm = E-postadressene matchar ikkje
new-user-already-has-account-sign-in = Du har allereie ein konto. <a>Logg inn</a>
new-user-invalid-email-domain = Skrivefeil i e-postadresse? { $domain } tilbyr ikkje e-post.


payment-confirmation-thanks-heading = Takk skal du ha!
payment-confirmation-thanks-heading-account-exists = Takk, sjekk e-posten din no!
payment-confirmation-thanks-subheading = Ein stadfestings e-post er sendt til { $email } med detaljar om korleis du kjem i gang med { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Du vil få ei e-postmelding på { $email } med instruksjonar om korleis du konfigurerer kontoen din, saman med betalingsopplysningar.
payment-confirmation-order-heading = Ordredetaljar
payment-confirmation-invoice-number = Fakturanummer { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betalingsinformasjon
payment-confirmation-amount = { $amount } per { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dagleg
       *[other] { $amount } kvar { $intervalCount } dag
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } kvar veke
       *[other] { $amount } kvar { $intervalCount } veke
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } kvar månad
       *[other] { $amount } kvar { $intervalCount } månad
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } kvart år
       *[other] { $amount } kvart { $intervalCount } år
    }
payment-confirmation-download-button = Hald fram til nedlasting


payment-confirm-with-legal-links-static-3 = Eg autoriserer { -brand-mozilla }, til å belaste betalingsmåten min for beløpet som visest, i samsvar med <termsOfServiceLink>tenestevilkåra</termsOfServiceLink> og <privacyNoticeLink>personvernfråsegna</privacyNoticeLink>, inntil eg seier opp abonnementet mitt.
payment-confirm-checkbox-error = Du må fullføre dette før du går vidare


payment-error-retry-button = Prøv igjen
payment-error-manage-subscription-button = Handsame abonnementet mitt


iap-upgrade-already-subscribed-2 = Du har allereie eit { $productName }-abonnement via { -brand-google }s eller { -brand-apple }s appbutikkar.
iap-upgrade-no-bundle-support = Vi stør ikkje oppgraderingar for desse abonnementa, men det vil vi snart gjere.
iap-upgrade-contact-support = Du kan framleis få dette produktet — kontakt brukarstøtte, så kan vi hjelpe deg.
iap-upgrade-get-help-button = Få hjelp


payment-name =
    .placeholder = Fullt namn
    .label = Namnet som det står på kortet ditt
payment-cc =
    .label = Kortet ditt
payment-cancel-btn = Avbryt
payment-update-btn = Oppdater
payment-pay-btn = Betal no
payment-pay-with-paypal-btn-2 = Betal med { -brand-paypal }
payment-validate-name-error = Skriv inn namnet ditt


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } brukar { -brand-name-stripe } og { -brand-paypal } for trygg betalingsbehandling.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } personvernfråsegn</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } personvernfråsegn</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } brukar { -brand-paypal } for trygg betalingsbehandling.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } personvernfråsegn</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } brukar { -brand-name-stripe } for sikker behandling av betaling.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } personvernpraksis</stripePrivacyLink>


payment-method-header = Vel betalingsmåte
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Først må du godkjenne abonnementet ditt


payment-processing-message = Vent mens vi behandlar betalinga di…


payment-confirmation-cc-card-ending-in = Kortet sluttar på { $last4 }


pay-with-heading-paypal-2 = Betal med { -brand-paypal }


plan-details-header = Produktdetaljar
plan-details-list-price = Listepris
plan-details-show-button = Vis detaljar
plan-details-hide-button = Gøym detaljar
plan-details-total-label = Totalt
plan-details-tax = Skattar og avgifter


product-no-such-plan = Ingen slik plan for dette produktet.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } i skatt
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } dagleg
       *[other] { $priceAmount } kvar { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } dagleg
           *[other] { $priceAmount } kvar { $intervalCount } dag
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } kvar veke
       *[other] { $priceAmount } kvar { $intervalCount } veke
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kvar veke
           *[other] { $priceAmount } kvar { $intervalCount } veke
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } kvar månad
       *[other] { $priceAmount } kvar { $intervalCount } månad
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } kvar månad
           *[other] { $priceAmount } kvar { $intervalCount } månad
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } kvart år
       *[other] { $priceAmount } kvart { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } år
           *[other] { $priceAmount } kvart { $intervalCount } år
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt dagleg
       *[other] { $priceAmount } + { $taxAmount } skatt kvar { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt dagleg
           *[other] { $priceAmount } + { $taxAmount } skatt kvar { $intervalCount } dag
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt kvar veke
       *[other] { $priceAmount } + { $taxAmount } skatt kvar { $intervalCount } veke
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt kvar veke
           *[other] { $priceAmount } + { $taxAmount } skatt kvar { $intervalCount } veke
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt kvar månad
       *[other] { $priceAmount } + { $taxAmount } skatt kvar { $intervalCount } månad
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } tskatt kvar månad
           *[other] { $priceAmount } + { $taxAmount } skatt kvar { $intervalCount } månad
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skatt kvart år
       *[other] { $priceAmount } + { $taxAmount } skatt kvart { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skatt kvart år
           *[other] { $priceAmount } + { $taxAmount } skatt kvart { $intervalCount } år
        }


subscription-create-title = Set opp abonnementet ditt
subscription-success-title = Stadfesting av abonnement
subscription-processing-title = Stadfestar abonnementet…
subscription-error-title = Feil ved stadfesting av abonnementet…
subscription-noplanchange-title = Denne endringa av abonnementsplanen er ikkje stødd
subscription-iapsubscribed-title = Abonnerer allereie
sub-guarantee = 30-dagar pengane-tilbake-garanti


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tenestevilkår
privacy = Personvernfråsegn
terms-download = Vilkår for nedlasting


document =
    .title = Firefox-kontoar
close-aria =
    .aria-label = Lat att modal
settings-subscriptions-title = Abonnement
coupon-promo-code = Kampanjekode


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } kvar dag
       *[other] { $amount } kvar { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kvar dag
           *[other] { $amount } kvar { $intervalCount } dag
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } kvar veke
       *[other] { $amount } kvar { $intervalCount } veke
    }
    .title =
        { $intervalCount ->
            [one] { $amount } veke
           *[other] { $amount } kvar { $intervalCount } veke
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } kvar månad
       *[other] { $amount } kvar { $intervalCount } månad
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kvar månad
           *[other] { $amount } kvar { $intervalCount } månadar
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } kvart år
       *[other] { $amount } kvart { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $amount } kvart år
           *[other] { $amount } kvart { $intervalCount } år
        }


general-error-heading = Generell applikasjonsfeil
basic-error-message = Noko gjekk gale. Prøv igjen seinare.
payment-error-1 = Hmm. Det oppstod eit problem med å godkjenne betalinga di. Prøv igjen eller kontakt kortutskrivaren din.
payment-error-2 = Hmm. Det oppstod eit problem med å godkjenne betalinga di. Ta kontakt med kortutskrivaren din.
payment-error-3b = Det oppstod ein uventa feil under behandling av betalinga. Prøv igjen.
expired-card-error = Det ser ut som om at bankkortet ditt har gått ut. Prøv eit anna kort.
insufficient-funds-error = Det ser ut som om kortet ditt ikkje har nok pengar. Prøv eit anna kort.
withdrawal-count-limit-exceeded-error = Det ser ut til at denne transaksjonen vil overskride kredittgrensa di. Prøv eit anna kort.
charge-exceeds-source-limit = Det ser ut som denne transaksjonen vil overskride den daglege kredittgrensa di. Prøv eit anna kort eller om 24 timar.
instant-payouts-unsupported = Det ser ut som at betalingskortet ditt ikkje er konfigurert for omgåande betalingar. Prøv eit anna betalingskort.
duplicate-transaction = Hmm. Det ser ut som ein identisk transaksjon nettopp vart utført. Sjekk betalingshistorikken.
coupon-expired = Det ser ut som at kampanjekoden har gått ut.
card-error = Transaksjonen din kunne ikkje behandlast. Kontroller betalingskortinformasjonen din og prøv igjen.
country-currency-mismatch = Valutaen for dette abonnementet er ikkje gyldig for landet som er knytt til betalinga di.
currency-currency-mismatch = Bekalgar. Du kan ikkje byte mellom valutaer.
location-unsupported = Etter tenestevilkåra våre er den gjeldande plasseringa di ikkje støtta.
no-subscription-change = Beklagar. Du kan ikkje endre abonnementsplanen din.
iap-already-subscribed = Du abonnerer allereie via { $mobileAppStore }.
fxa-account-signup-error-2 = Ein systemfeil førte til at { $productName }-registreringa var mislykka. Betalingsmåten din er ikkje belasta. Prøv igjen.
fxa-post-passwordless-sub-error = Abonnementet vart stadfesta, men stadfestingssida kunne ikkje lastast inn. Sjekk e-posten din for å sette opp kontoen din.
newsletter-signup-error = Du er ikkje registrert for produktoppdateringar via e-post. Du kan prøve igjen i kontoinnstillingane.
product-plan-error =
    .title = Problem med å laste planane dine
product-profile-error =
    .title = Problem med å laste profil
product-customer-error =
    .title = Problem med å laste kunde
product-plan-not-found = Fann ikkje planen
product-location-unsupported-error = Plasseringa er ikkje støtta


coupon-success = Planen din vert fornya automatisk til listeprisen.
coupon-success-repeating = Planen din vert fornya automatisk etter { $couponDurationDate } til listeprisen.


new-user-step-1-2 = 1. Opprett ein { -product-mozilla-account }
new-user-card-title = Skriv inn betalingskortinformasjon
new-user-submit = Abonner no


sub-update-payment-title = Betalingsinformasjon


pay-with-heading-card-only = Betal med kort
product-invoice-preview-error-title = Problem med å laste førehandsvising av faktura
product-invoice-preview-error-text = Klarte ikkje å laste inn førehandsvising av faktura


subscription-iaperrorupgrade-title = Vi kan ikkje oppgradere deg heilt enno


brand-name-google-play-2 = { -google-play } butikk
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Sjå gjennom endringa
sub-change-failed = Mislykka endring av plan
sub-update-acknowledgment =
    Planen din blir omgåande endra, og du vil bli belasta proporsjonalt
    beløp i dag for resten av denne faktureringssyklusen. Startar { $startingDate }
    du vil bli belasta heile beløpet.
sub-change-submit = Stadfest endring
sub-update-current-plan-label = Gjeldande plan
sub-update-new-plan-label = Ny plan
sub-update-total-label = Ny sum
sub-update-prorated-upgrade = Forholdsmessig oppgradering


sub-update-new-plan-daily = { $productName } (kvar dag)
sub-update-new-plan-weekly = { $productName } (kvar veke)
sub-update-new-plan-monthly = { $productName } (kvar månad)
sub-update-new-plan-yearly = { $productName } (kvart år)
sub-update-prorated-upgrade-credit = Negativ saldo som vest vist vil bli kreditert kontoen din og brukt til framtidige fakturaer.


sub-item-cancel-sub = Avbryt abonnementet
sub-item-stay-sub = Hald fram abonnementet


sub-item-cancel-msg =
    Du vil ikkje lenger kunne bruke { $name } etter
    { $period }, den siste dagen i faktureringssyklusen.
sub-item-cancel-confirm =
    Avbryt tilgangen min og den lagra informasjonen min for
    { $name } den { $period }
sub-promo-coupon-applied = { $promotion_name }-kupong brukt: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Denne abonnementsbetalinga resulterte i ei kreditering av kontosaldoen din: <priceDetails></priceDetails>


sub-route-idx-reactivating = Reaktivering av abonnement var mislykka
sub-route-idx-cancel-failed = Avbryting av abonnement var mislykka
sub-route-idx-contact = Kontakt support
sub-route-idx-cancel-msg-title = Vi synest at det er synd at du seier opp abonnementet ditt
sub-route-idx-cancel-msg =
    { $name }-abonnementet ditt er sagt opp.
          <br />
          Du vil framleis ha tilgang til { $name } til den { $date }.
sub-route-idx-cancel-aside-2 = Har du spørsmål? Besøk <a>{ -brand-mozilla } brukarstøtte</a>.


sub-customer-error =
    .title = Problem med å laste inn kunde
sub-invoice-error =
    .title = Problemer med å laste inn fakturaer
sub-billing-update-success = Faktureringsinformasjonen din er oppdatert
sub-invoice-previews-error-title = Problem med å laste inn førehandsvising av faktura
sub-invoice-previews-error-text = Klarte ikkje å laste inn førehandsvisingar av faktura


pay-update-change-btn = Endre
pay-update-manage-btn = Handsam


sub-next-bill = Neste fakturering den { $date }
sub-next-bill-due-date = Neste rekning forfell { $date }
sub-expires-on = Går ut { $date }




pay-update-card-exp = Går ut { $expirationDate }
sub-route-idx-updating = Oppdaterer faktureringsinformasjon…
sub-route-payment-modal-heading = Ugyldig faktureringsinformasjon
sub-route-payment-modal-message-2 = Det ser ut til å vere ein feil med { -brand-paypal }-kontoen din. Vi treng at du tek dei nødvendige stega for å løyse dette betalingsproblemet.
sub-route-missing-billing-agreement-payment-alert = Ugyldig betalingsinformasjon, det er eit problem med kontoen din. <div>Handsam</div>
sub-route-funding-source-payment-alert = Ugyldig betalingsinformasjon; det er ein feil med kontoen din. Dette varselet kan ta litt tid å fjerne etter at du har oppdatert informasjonen. <div>Administrer</div>


sub-item-no-such-plan = Ingen slik plan for dette abonnementet.
invoice-not-found = Fann ikkje etterfølgjande faktura
sub-item-no-such-subsequent-invoice = Finn ikkje påfølgjande faktura for dette abonnementet.
sub-invoice-preview-error-title = Fann ikkje førehandsvising av faktura
sub-invoice-preview-error-text = Fann ikkje førehandsvising av faktura for dette abonnementet


reactivate-confirm-dialog-header = Vil du halde fram med å bruke { $name }?
reactivate-confirm-copy =
    Tilgangen din til { $name } vil halde fram, og faktureringssyklusen din
    og betalinga vil vere den same. Den neste betalinga di kjem på { $amount } den { $endDate } til kortet som sluttar på { $last }.
reactivate-confirm-without-payment-method-copy =
    Tilgangen din til { $name } vil halde fram, og faktureringssyklusen din
    og betalinga vil vere som før. Den neste betalinga di blir
    på { $amount } den { $endDate }.
reactivate-confirm-button = Abonner ein gong til


reactivate-panel-copy = Du mistar tilgangen din til { $name } den <strong>{ $date }</strong>.
reactivate-success-copy = Takk! Alt er no klappa og klart.
reactivate-success-button = Lat att


sub-iap-item-google-purchase-2 = { -brand-google }: Kjøp i appen
sub-iap-item-apple-purchase-2 = { -brand-apple }: Kjøp i appen
sub-iap-item-manage-button = Handsam
