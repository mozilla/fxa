# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Početna stranica računa
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promotivni kod primijenjen
coupon-submit = Primijeni
coupon-remove = Ukloni
coupon-error = Upisani kôd je neispravan i je istekao.
coupon-error-generic = Došlo je do greške prilikom obrade koda. Pokušaj ponovo.
coupon-error-expired = Upisani kôd je istekao.
coupon-error-limit-reached = Upisani kôd je dosegao ograničenje.
coupon-error-invalid = Upisani kôd je neispravan.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Upiši kod

## Component - Fields

default-input-error = Ovo je obavezno polje
input-error-is-required = Polje { $label } je obavezno

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } logotip

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Već imaš { -product-mozilla-account }? <a>Prijavi se</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
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
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Je li e-mail adresa ispravna? { $domain } ne nudi e-mail adrese.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Hvala ti!
payment-confirmation-thanks-heading-account-exists = Hvala, sada provjeri svoju e-poštu!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Potvrdni e-mail poslan je na adresu { $email } s detaljima o tome kako početi koristiti { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Primit ćeš e-mail na { $email } s uputama za postavljanje računa, kao i podatke o plaćanju.
payment-confirmation-order-heading = Podaci narudžbe
payment-confirmation-invoice-number = Račun br. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informacije o plaćanju
payment-confirmation-amount = { $amount } / { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dnevno
        [few] { $amount } svaka { $intervalCount } dana
       *[other] { $amount } svakih { $intervalCount } dana
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } tjedno
        [few] { $amount } svaka { $intervalCount } tjenda
       *[other] { $amount } svakih { $intervalCount } tjedna
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mjesečno
        [few] { $amount } svaka { $intervalCount } mjeseca
       *[other] { $amount } svakih { $intervalCount } mjeseci
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } godišnje
        [few] { $amount } svake { $intervalCount } godine
       *[other] { $amount } svakih { $intervalCount } godina
    }
payment-confirmation-download-button = Nastavi s preuzimanjem

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Ovlašćujem { -brand-mozilla } da tereti moj način plaćanja za prikazani iznos, u skladu s <termsOfServiceLink>uvjetima usluge</termsOfServiceLink> i <privacyNoticeLink>napomenama o privatnosti</privacyNoticeLink>, sve dok ne otkažem pretplatu.
payment-confirm-checkbox-error = Ovo moraš dovršiti prije nego što nastaviš

## Component - PaymentErrorView

payment-error-retry-button = Pokušaj ponovno
payment-error-manage-subscription-button = Upravljaj mojom pretplatom

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Već imaš pretplatu na { $productName } putem trgovina { -brand-google } ili { -brand-apple }.
iap-upgrade-no-bundle-support = Ne podržavamo nadogradnje za ove pretplate, ali uskoro hoćemo.
iap-upgrade-contact-support = Još uvijek možeš dobiti ovaj proizvod – kontaktiraj podršku kako bismo ti pomogli.
iap-upgrade-get-help-button = Dobij pomoć

## Component - PaymentForm

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

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } koristi { -brand-name-stripe } i { -brand-paypal } za sigurnu obradu plaćanja.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } politika privatnosti</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } politika privatnosti</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } koristi { -brand-paypal } za sigurnu obradu plaćanja.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } politika privatnosti</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } koristi { -brand-name-stripe } za sigurnu obradu plaćanja.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } politika privatnosti</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Odaberi način plaćanja
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najprije moraš odobriti tvoju pretplatu

## Component - PaymentProcessing

payment-processing-message = Pričekaj dok obradimo tvoju uplatu…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kartica koja završava na { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Plati s { -brand-paypal }

## Component - PlanDetails

plan-details-header = Podaci proizvoda
plan-details-list-price = Cijena
plan-details-show-button = Pokaži podatke
plan-details-hide-button = Sakrij podatke
plan-details-total-label = Ukupno
plan-details-tax = Porezi i naknade

## Component - PlanErrorDialog

product-no-such-plan = Za ovaj proizvod ne postoji takav plan.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } porez
# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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
# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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

## Component - SubscriptionTitle

subscription-create-title = Postavi svoju pretplatu
subscription-success-title = Potvrda pretplate
subscription-processing-title = Potvrđivanje pretplate…
subscription-error-title = Pogreška pri potvrđivanju pretplate…
subscription-noplanchange-title = Ova promjena plana pretplate nije podržana
subscription-iapsubscribed-title = Već pretplaćeno
sub-guarantee = 30-dnevno jamstvo povrata novca

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Uvjeti usluge
privacy = Napomena o privatnosti
terms-download = Uvjeti preuzimanja

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox računi
# General aria-label for closing modals
close-aria =
    .aria-label = Zatvori modal
settings-subscriptions-title = Pretplate
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Kod kupona

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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

## Error messages

# App error dialog
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
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Već si pretplaćen/a putem { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
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

## Hooks - coupons

coupon-success = Tvoj plan će se automatski obnoviti po cijeni.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Tvoj plan će se automatski obnoviti nakon { $couponDurationDate } po cijeni.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Stvori { -product-mozilla-account }
new-user-card-title = Upiši podatke tvoje kartice
new-user-submit = Pretplati se sada

## Routes - Product and Subscriptions

sub-update-payment-title = Informacije o plaćanju

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Plati karticom
product-invoice-preview-error-title = Problem s učitavanjem pregleda računa
product-invoice-preview-error-text = Neuspjelo učitavanje pregleda računa

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Još te ne možemo nadograditi

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } trgovina
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

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

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (dnevno)
sub-update-new-plan-weekly = { $productName } (tjedno)
sub-update-new-plan-monthly = { $productName } (mjesečno)
sub-update-new-plan-yearly = { $productName } (godišnje)
sub-update-prorated-upgrade-credit = Prikazani negativni saldo će se primijeniti kao krediti na tvoj račun i koristit će se za buduće račune.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Otkaži pretplatu
sub-item-stay-sub = Zadrži pretplatu

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Nakon zadnjeg dana obračunskog razdoblja { $period }
    više nećeš moći koristiti { $name }.
sub-item-cancel-confirm =
    Otkaži moj pristup i moje spremljene podatke na usluzi
    { $name } { $period }
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
sub-promo-coupon-applied = Kupon { $promotion_name } primijenjen: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Kao rezultat plaćanja pretplate, stanje na vašem računu je nadopunjeno: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Ponovno aktiviranje pretplate nije uspjelo
sub-route-idx-cancel-failed = Otkazivanje pretplate nije uspjelo
sub-route-idx-contact = Kontaktiraj podršku
sub-route-idx-cancel-msg-title = Žao nam je što nas napuštaš
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Tvoja pretplata na { $name } je otkazana.
          <br />
          I dalje imaš pristup usluzi { $name } do { $date }.
sub-route-idx-cancel-aside-2 = Imaš pitanja? Posjeti <a>{ -brand-mozilla } podršku</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem s učitavanjem kupca
sub-invoice-error =
    .title = Problem pri učitavanju računa
sub-billing-update-success = Podaci naplate uspješno su aktualizirani
sub-invoice-previews-error-title = Problem pri učitavanju pregleda računa
sub-invoice-previews-error-text = Nije bilo moguće učitati preglede računa

## Routes - Subscription - ActionButton

pay-update-change-btn = Promijeni
pay-update-manage-btn = Upravljaj

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Sljedeće naplaćivanje { $date }
sub-next-bill-due-date = Sljedeći račun dospijeva { $date }
sub-expires-on = Isteče { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Ističe { $expirationDate }
sub-route-idx-updating = Aktualiziranje podataka naplate …
sub-route-payment-modal-heading = Nevaljane informacije o plaćanju
sub-route-payment-modal-message-2 = Čini se da postoji greška s tvojim { -brand-paypal } računom. Moraš poduzeti potrebne korake za rješavanje ovog problema plaćanja.
sub-route-missing-billing-agreement-payment-alert = Neispravni podaci o plaćanju; postoji greška s tvojim računom. <div>Upravljaj</div>
sub-route-funding-source-payment-alert = Neispravni podaci o plaćanju; postoji greška s tvojim računom. Uklanjanje ovog upozorenja može potrajati nakon što uspješno aktualiziraš tvoje podatke. <div>Upravljaj</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Ne postoji takav plan za ovu pretplatu.
invoice-not-found = Naknadni račun nije pronađen
sub-item-no-such-subsequent-invoice = Naknadni račun nije pronađen za ovu pretplatu.
sub-invoice-preview-error-title = Pregled računa nije pronađen
sub-invoice-preview-error-text = Pregled računa nije pronađen za ovu pretplatu

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Želiš li i dalje upotrebljavati { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Pristup na { $name } će se nastaviti i ciklus naplate i plaćanje
    ostat će isti. Sljedeće opterećenje iznosi { $amount } na 
    karticu koja završava s { $last } na { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Pristup na { $name } će se nastaviti i ciklus naplate i plaćanje
    ostat će isti. Sljedeće opterećenje iznosi { $amount }
    na { $endDate }.
reactivate-confirm-button = Obnovi pretplatu

## $date (Date) - Last day of product access

reactivate-panel-copy = Izgubit ćeš pristup usluzi { $name } <strong>{ $date }</strong>
reactivate-success-copy = Hvala! Spremno je.
reactivate-success-button = Zatvori

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: kupnja unutar aplikacije
sub-iap-item-apple-purchase-2 = { -brand-apple }: kupnja unutar aplikacije
sub-iap-item-manage-button = Upravljaj
