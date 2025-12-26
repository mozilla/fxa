



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox računi
-product-mozilla-account = Mozilla račun
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Mozilla računi
       *[lowercase] Mozilla računi
    }
-product-firefox-account = Firefox račun
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla centri
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

app-general-err-heading = Opća greška programa
app-general-err-message = Nešto nije u redu. Pokušaj kasnije ponovo.


app-footer-mozilla-logo-label = { -brand-mozilla } logotip
app-footer-privacy-notice = Napomena o privatnosti web stranice
app-footer-terms-of-service = Uvjeti usluge


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Otvara se u novom prozoru


app-loading-spinner-aria-label-loading = Učitavanje …


app-logo-alt-3 =
    .alt = { -brand-mozilla } m logotip



settings-home = Početna stranica računa
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Promotivni kod primijenjen
coupon-submit = Primijeni
coupon-remove = Ukloni
coupon-error = Upisani kôd je neispravan i je istekao.
coupon-error-generic = Došlo je do greške prilikom obrade koda. Pokušaj ponovo.
coupon-error-expired = Upisani kôd je istekao.
coupon-error-limit-reached = Upisani kôd je dosegao ograničenje.
coupon-error-invalid = Upisani kôd je neispravan.
coupon-enter-code =
    .placeholder = Upiši kod


default-input-error = Ovo je obavezno polje
input-error-is-required = Polje { $label } je obavezno


brand-name-mozilla-logo = { -brand-mozilla } logotip


new-user-sign-in-link-2 = Već imaš { -product-mozilla-account }? <a>Prijavi se</a>
new-user-enter-email =
    .label = Upiši svoju e-mail adresu
new-user-confirm-email =
    .label = Potvrdi svoju e-mail adresu
new-user-subscribe-product-updates-mozilla = Želim primati novosti { -brand-mozilla } proizvoda i aktualiziranja
new-user-subscribe-product-updates-snp = Želim primati novosti { -brand-mozilla } sigurnosti, obavijesti o privatnosti i aktualiziranja
new-user-subscribe-product-updates-hubs = Želim primati { -product-mozilla-hubs } i { -brand-mozilla } novosti i aktualiziranja
new-user-subscribe-product-updates-mdnplus = Želim primati novosti i aktualiziranja za { -product-mdn-plus } i { -brand-mozilla }
new-user-subscribe-product-assurance = Tvoju e-mail adresu koristimo samo za stvaranje tvog računa. Nikada je nećemo prodati trećoj strani.
new-user-email-validate = E-mail adresa nije ispravna
new-user-email-validate-confirm = E-mail adrese se ne poklapaju
new-user-already-has-account-sign-in = Već imaš račun. <a>Prijavi se</a>
new-user-invalid-email-domain = Je li e-mail adresa ispravna? { $domain } ne nudi e-mail adrese.


payment-confirmation-thanks-heading = Hvala ti!
payment-confirmation-thanks-heading-account-exists = Hvala, sada provjeri svoju e-poštu!
payment-confirmation-thanks-subheading = Potvrdni e-mail poslan je na adresu { $email } s detaljima o tome kako početi koristiti { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Primit ćeš e-mail na { $email } s uputama za postavljanje računa, kao i podatke o plaćanju.
payment-confirmation-order-heading = Podaci narudžbe
payment-confirmation-invoice-number = Račun br. { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informacije o plaćanju
payment-confirmation-amount = { $amount } / { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dnevno
        [few] { $amount } svaka { $intervalCount } dana
       *[other] { $amount } svakih { $intervalCount } dana
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } tjedno
        [few] { $amount } svaka { $intervalCount } tjenda
       *[other] { $amount } svakih { $intervalCount } tjedna
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mjesečno
        [few] { $amount } svaka { $intervalCount } mjeseca
       *[other] { $amount } svakih { $intervalCount } mjeseci
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } godišnje
        [few] { $amount } svake { $intervalCount } godine
       *[other] { $amount } svakih { $intervalCount } godina
    }
payment-confirmation-download-button = Nastavi s preuzimanjem


payment-confirm-with-legal-links-static-3 = Ovlašćujem { -brand-mozilla } da tereti moj način plaćanja za prikazani iznos, u skladu s <termsOfServiceLink>uvjetima usluge</termsOfServiceLink> i <privacyNoticeLink>napomenama o privatnosti</privacyNoticeLink>, sve dok ne otkažem pretplatu.
payment-confirm-checkbox-error = Ovo moraš dovršiti prije nego što nastaviš


payment-error-retry-button = Pokušaj ponovno
payment-error-manage-subscription-button = Upravljaj mojom pretplatom


iap-upgrade-already-subscribed-2 = Već imaš pretplatu na { $productName } putem trgovina { -brand-google } ili { -brand-apple }.
iap-upgrade-no-bundle-support = Ne podržavamo nadogradnje za ove pretplate, ali uskoro hoćemo.
iap-upgrade-contact-support = Još uvijek možeš dobiti ovaj proizvod – kontaktiraj podršku kako bismo ti pomogli.
iap-upgrade-get-help-button = Dobij pomoć


payment-name =
    .placeholder = Potpuno ime
    .label = Prikazano ime na kartici
payment-cc =
    .label = Tvoja kartica
payment-cancel-btn = Odustani
payment-update-btn = Aktualiziraj
payment-pay-btn = Plati sada
payment-pay-with-paypal-btn-2 = Plati s uslugom { -brand-paypal }
payment-validate-name-error = Upiši tvoje ime


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } koristi { -brand-name-stripe } i { -brand-paypal } za sigurnu obradu plaćanja.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } politika privatnosti</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } politika privatnosti</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } koristi { -brand-paypal } za sigurnu obradu plaćanja.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } politika privatnosti</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } koristi { -brand-name-stripe } za sigurnu obradu plaćanja.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } politika privatnosti</stripePrivacyLink>


payment-method-header = Odaberi način plaćanja
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najprije moraš odobriti tvoju pretplatu


payment-processing-message = Pričekaj dok obradimo tvoju uplatu…


payment-confirmation-cc-card-ending-in = Kartica koja završava na { $last4 }


pay-with-heading-paypal-2 = Plati s { -brand-paypal }


plan-details-header = Podaci proizvoda
plan-details-list-price = Cijena
plan-details-show-button = Pokaži podatke
plan-details-hide-button = Sakrij podatke
plan-details-total-label = Ukupno
plan-details-tax = Porezi i naknade


product-no-such-plan = Za ovaj proizvod ne postoji takav plan.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } porez
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } dnevno
        [few] { $priceAmount } svaka { $intervalCount } dana
       *[other] { $priceAmount } svakih { $intervalCount } dana
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } dnevno
            [few] { $priceAmount } svaka { $intervalCount } dana
           *[other] { $priceAmount } svakih { $intervalCount } dana
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } tjedno
        [few] { $priceAmount } svaka { $intervalCount } tjedna
       *[other] { $priceAmount } svakih { $intervalCount } tjedna
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } tjedno
            [few] { $priceAmount } svaka { $intervalCount } tjedna
           *[other] { $priceAmount } svakih { $intervalCount } tjedna
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } mjesečno
        [few] { $priceAmount } svaka { $intervalCount } mjeseca
       *[other] { $priceAmount } svakih { $intervalCount } mjeseci
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mjesečno
            [few] { $priceAmount } svaka { $intervalCount } mjeseca
           *[other] { $priceAmount } svakih { $intervalCount } mjeseci
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } godišnje
        [few] { $priceAmount } svake { $intervalCount } godine
       *[other] { $priceAmount } svakih { $intervalCount } godina
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } godišnje
            [few] { $priceAmount } svake { $intervalCount } godine
           *[other] { $priceAmount } svakih { $intervalCount } godina
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } poreza dnevno
        [few] { $priceAmount } + { $taxAmount } poreza svaka { $intervalCount } dana
       *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } dana
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } poreza dnevno
            [few] { $priceAmount } + { $taxAmount } poreza svaka { $intervalCount } dana
           *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } dana
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } poreza tjedno
        [few] { $priceAmount } + { $taxAmount } poreza svaka { $intervalCount } tjedna
       *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } tjedna
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } poreza tjedno
            [few] { $priceAmount } + { $taxAmount } poreza svaka { $intervalCount } tjedna
           *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } tjedna
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } poreza mjesečno
        [few] { $priceAmount } + { $taxAmount } poreza svaka { $intervalCount } mjeseca
       *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } mjeseci
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } poreza mjesečno
            [few] { $priceAmount } + { $taxAmount } poreza svaka { $intervalCount } mjeseca
           *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } mjeseci
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } poreza godišnje
        [few] { $priceAmount } + { $taxAmount } poreza svake { $intervalCount } godine
       *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } godina
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } poreza godišnje
            [few] { $priceAmount } + { $taxAmount } poreza svake { $intervalCount } godine
           *[other] { $priceAmount } + { $taxAmount } poreza svakih { $intervalCount } godina
        }


subscription-create-title = Postavi svoju pretplatu
subscription-success-title = Potvrda pretplate
subscription-processing-title = Potvrđivanje pretplate…
subscription-error-title = Pogreška pri potvrđivanju pretplate…
subscription-noplanchange-title = Ova promjena plana pretplate nije podržana
subscription-iapsubscribed-title = Već pretplaćeno
sub-guarantee = 30-dnevno jamstvo povrata novca


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Uvjeti usluge
privacy = Napomena o privatnosti
terms-download = Uvjeti preuzimanja


document =
    .title = Firefox računi
close-aria =
    .aria-label = Zatvori modal
settings-subscriptions-title = Pretplate
coupon-promo-code = Kod kupona


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } dnevno
        [few] { $amount } svaka { $intervalCount } dana
       *[other] { $amount } svakih { $intervalCount } dana
    }
    .title =
        { $intervalCount ->
            [one] { $amount } dnevno
            [few] { $amount } svaka { $intervalCount } dana
           *[other] { $amount } svakih { $intervalCount } dana
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } tjedno
        [few] { $amount } svaka { $intervalCount } tjedna
       *[other] { $amount } svakih { $intervalCount } tjedna
    }
    .title =
        { $intervalCount ->
            [one] { $amount } tjedno
            [few] { $amount } svaka { $intervalCount } tjedna
           *[other] { $amount } svakih { $intervalCount } tjedna
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } mjesečno
        [few] { $amount } svaka { $intervalCount } mjeseca
       *[other] { $amount } svakih { $intervalCount } mjeseci
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mjesečno
            [few] { $amount } svaka { $intervalCount } mjeseca
           *[other] { $amount } svakih { $intervalCount } mjeseci
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } godišnje
        [few] { $amount } svake { $intervalCount } godine
       *[other] { $amount } svakih { $intervalCount } godina
    }
    .title =
        { $intervalCount ->
            [one] { $amount } godišnje
            [few] { $amount } svake { $intervalCount } godine
           *[other] { $amount } svakih { $intervalCount } godina
        }


general-error-heading = Opća greška programa
basic-error-message = Nešto je pošlo po zlu. Pokušaj ponovo kasnije.
payment-error-1 = Hmm. Došlo je do problema s autorizacijom tvoje uplate. Pokušaj ponovo ili kontaktiraj izdavatelja kartice.
payment-error-2 = Hmm. Došlo je do problema s autorizacijom tvoje uplate. Kontaktiraj svog izdavatelja kartice.
payment-error-3b = Dogodila se neočekivana greška tijekom obrade tvoje uplate, pokušaj ponovo.
expired-card-error = Čini se da je tvoja kreditna kartica istekla. Pokušaj s jednom drugom karticom.
insufficient-funds-error = Čini se da tvoja kartica nema dovoljno sredstava. Pokušaj s jednom drugom karticom.
withdrawal-count-limit-exceeded-error = Čini se da ćeš ovom transakcijom prijeći kreditni limit. Pokušaj s jednom drugom karticom.
charge-exceeds-source-limit = Čini se da ćeš ovom transakcijom prijeći svoj dnevni kreditni limit. Pokušaj s jednom drugom karticom ili za 24 sata.
instant-payouts-unsupported = Čini se da tvoja debitna kartica nije postavljena za trenutna plaćanja. Pokušaj s jednom drugom debitnom ili kreditnom karticom.
duplicate-transaction = Hmm. Izgleda da je identična transakcija upravo poslana. Provjeri povijest plaćanja.
coupon-expired = Čini se da je taj kod kupona istekao.
card-error = Neuspjela obrada tvoje transakcije. Provjeri podatke za kreditnu karticu i pokušaj ponovo.
country-currency-mismatch = Valuta ove pretplate ne vrijedi za zemlju povezanu s tvojom plaćanjem.
currency-currency-mismatch = Žao nam je. Ne možeš se prebacivati između valuta.
location-unsupported = Tvoje trenutačno mjesto nije podržano prema našim uvjetima usluge.
no-subscription-change = Žao nam je. Ne možeš promijeniti tvoj plan pretplate.
iap-already-subscribed = Već si pretplaćen/a putem { $mobileAppStore }.
fxa-account-signup-error-2 = Greška sustava je uzrok neuspjele registracije za { $productName }. Tvoj način plaćanja nije terećen. Pokušaj ponovo.
fxa-post-passwordless-sub-error = Pretplata je potvrđena, ali se stranica za potvrdu nije uspjela učitati. Provjeri svoju e-poštu za postavljanje tvog računa.
newsletter-signup-error = Nisi registriran/a za primanje e-mailova o aktualiziranjima proizvoda. Možeš pokušati ponovo u postavkama računa.
product-plan-error =
    .title = Problem pri učitavanju planova
product-profile-error =
    .title = Problem s učitavanjem profila
product-customer-error =
    .title = Problem s učitavanjem kupca
product-plan-not-found = Plan nije pronađen
product-location-unsupported-error = Mjesto nije podržano


coupon-success = Tvoj plan će se automatski obnoviti po cijeni.
coupon-success-repeating = Tvoj plan će se automatski obnoviti nakon { $couponDurationDate } po cijeni.


new-user-step-1-2 = 1. Stvori { -product-mozilla-account }
new-user-card-title = Upiši podatke tvoje kartice
new-user-submit = Pretplati se sada


sub-update-payment-title = Informacije o plaćanju


pay-with-heading-card-only = Plati karticom
product-invoice-preview-error-title = Problem s učitavanjem pregleda računa
product-invoice-preview-error-text = Neuspjelo učitavanje pregleda računa


subscription-iaperrorupgrade-title = Još te ne možemo nadograditi


brand-name-google-play-2 = { -google-play } trgovina
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Pregledaj svoju promjenu
sub-change-failed = Promjena plana nije uspjela
sub-update-acknowledgment =
    Tvoj plan će se odmah promijeniti i danas ćemo naplatit proporcionalni
    iznos za ostatak ovog obračunskog razdoblja. Počevši od { $startingDate }
    naplatit ćemo puni iznos.
sub-change-submit = Potvrdi promjenu
sub-update-current-plan-label = Aktualni plan
sub-update-new-plan-label = Novi plan
sub-update-total-label = Nov ukupni iznos
sub-update-prorated-upgrade = Proporcionalna nadogradnja


sub-update-new-plan-daily = { $productName } (dnevno)
sub-update-new-plan-weekly = { $productName } (tjedno)
sub-update-new-plan-monthly = { $productName } (mjesečno)
sub-update-new-plan-yearly = { $productName } (godišnje)
sub-update-prorated-upgrade-credit = Prikazani negativni saldo će se primijeniti kao krediti na tvoj račun i koristit će se za buduće račune.


sub-item-cancel-sub = Otkaži pretplatu
sub-item-stay-sub = Zadrži pretplatu


sub-item-cancel-msg =
    Nakon zadnjeg dana obračunskog razdoblja { $period }
    više nećeš moći koristiti { $name }.
sub-item-cancel-confirm =
    Otkaži moj pristup i moje spremljene podatke na usluzi
    { $name } { $period }
sub-promo-coupon-applied = Kupon { $promotion_name } primijenjen: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Kao rezultat plaćanja pretplate, stanje na vašem računu je nadopunjeno: <priceDetails></priceDetails>


sub-route-idx-reactivating = Ponovno aktiviranje pretplate nije uspjelo
sub-route-idx-cancel-failed = Otkazivanje pretplate nije uspjelo
sub-route-idx-contact = Kontaktiraj podršku
sub-route-idx-cancel-msg-title = Žao nam je što nas napuštaš
sub-route-idx-cancel-msg =
    Tvoja pretplata na { $name } je otkazana.
          <br />
          I dalje imaš pristup usluzi { $name } do { $date }.
sub-route-idx-cancel-aside-2 = Imaš pitanja? Posjeti <a>{ -brand-mozilla } podršku</a>.


sub-customer-error =
    .title = Problem s učitavanjem kupca
sub-invoice-error =
    .title = Problem pri učitavanju računa
sub-billing-update-success = Podaci naplate uspješno su aktualizirani
sub-invoice-previews-error-title = Problem pri učitavanju pregleda računa
sub-invoice-previews-error-text = Nije bilo moguće učitati preglede računa


pay-update-change-btn = Promijeni
pay-update-manage-btn = Upravljaj


sub-next-bill = Sljedeće naplaćivanje { $date }
sub-next-bill-due-date = Sljedeći račun dospijeva { $date }
sub-expires-on = Isteče { $date }




pay-update-card-exp = Ističe { $expirationDate }
sub-route-idx-updating = Aktualiziranje podataka naplate …
sub-route-payment-modal-heading = Nevaljane informacije o plaćanju
sub-route-payment-modal-message-2 = Čini se da postoji greška s tvojim { -brand-paypal } računom. Moraš poduzeti potrebne korake za rješavanje ovog problema plaćanja.
sub-route-missing-billing-agreement-payment-alert = Neispravni podaci o plaćanju; postoji greška s tvojim računom. <div>Upravljaj</div>
sub-route-funding-source-payment-alert = Neispravni podaci o plaćanju; postoji greška s tvojim računom. Uklanjanje ovog upozorenja može potrajati nakon što uspješno aktualiziraš tvoje podatke. <div>Upravljaj</div>


sub-item-no-such-plan = Ne postoji takav plan za ovu pretplatu.
invoice-not-found = Naknadni račun nije pronađen
sub-item-no-such-subsequent-invoice = Naknadni račun nije pronađen za ovu pretplatu.
sub-invoice-preview-error-title = Pregled računa nije pronađen
sub-invoice-preview-error-text = Pregled računa nije pronađen za ovu pretplatu


reactivate-confirm-dialog-header = Želiš li i dalje upotrebljavati { $name }?
reactivate-confirm-copy =
    Pristup na { $name } će se nastaviti i ciklus naplate i plaćanje
    ostat će isti. Sljedeće opterećenje iznosi { $amount } na 
    karticu koja završava s { $last } na { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Pristup na { $name } će se nastaviti i ciklus naplate i plaćanje
    ostat će isti. Sljedeće opterećenje iznosi { $amount }
    na { $endDate }.
reactivate-confirm-button = Obnovi pretplatu


reactivate-panel-copy = Izgubit ćeš pristup usluzi { $name } <strong>{ $date }</strong>
reactivate-success-copy = Hvala! Spremno je.
reactivate-success-button = Zatvori


sub-iap-item-google-purchase-2 = { -brand-google }: kupnja unutar aplikacije
sub-iap-item-apple-purchase-2 = { -brand-apple }: kupnja unutar aplikacije
sub-iap-item-manage-button = Upravljaj
