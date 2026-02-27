# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Startside for kontoen
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Kampanjekode brukt
coupon-submit = Bruk
coupon-remove = Fjern
coupon-error = Koden du skreiv inn er ugyldig eller utgått.
coupon-error-generic = Det oppstod ein feil under handsaming av koden. Prøv på nytt.
coupon-error-expired = Koden du skreiv inn har gått ut.
coupon-error-limit-reached = Koden du skreiv inn har nådd grensa si.
coupon-error-invalid = Koden du skreiv inn er ugyldig.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Skriv inn kode

## Component - Fields

default-input-error = Dette feltet er obligatorisk
input-error-is-required = { $label } er påkravd

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }-logo

## Component - NewUserEmailForm

new-user-sign-in-link-2 =
    Har du allereie ein
     { -product-mozilla-account }? <a>Logg inn</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
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
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Skrivefeil i e-postadresse? { $domain } tilbyr ikkje e-post.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Takk skal du ha!
payment-confirmation-thanks-heading-account-exists = Takk, sjekk e-posten din no!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Ein stadfestings e-post er sendt til { $email } med detaljar om korleis du kjem i gang med { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Du vil få ei e-postmelding på { $email } med instruksjonar om korleis du konfigurerer kontoen din, saman med betalingsopplysningar.
payment-confirmation-order-heading = Ordredetaljar
payment-confirmation-invoice-number = Fakturanummer { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betalingsinformasjon
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dagleg
       *[other] { $amount } kvar { $intervalCount } dag
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } kvar veke
       *[other] { $amount } kvar { $intervalCount } veke
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } kvar månad
       *[other] { $amount } kvar { $intervalCount } månad
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } kvart år
       *[other] { $amount } kvart { $intervalCount } år
    }
payment-confirmation-download-button = Hald fram til nedlasting

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Eg autoriserer { -brand-mozilla }, til å belaste betalingsmåten min for beløpet som visest, i samsvar med <termsOfServiceLink>tenestevilkåra</termsOfServiceLink> og <privacyNoticeLink>personvernfråsegna</privacyNoticeLink>, inntil eg seier opp abonnementet mitt.
payment-confirm-checkbox-error = Du må fullføre dette før du går vidare

## Component - PaymentErrorView

payment-error-retry-button = Prøv igjen
payment-error-manage-subscription-button = Handsame abonnementet mitt

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Du har allereie eit { $productName }-abonnement via { -brand-google }s eller { -brand-apple }s appbutikkar.
iap-upgrade-no-bundle-support = Vi stør ikkje oppgraderingar for desse abonnementa, men det vil vi snart gjere.
iap-upgrade-contact-support = Du kan framleis få dette produktet — kontakt brukarstøtte, så kan vi hjelpe deg.
iap-upgrade-get-help-button = Få hjelp

## Component - PaymentForm

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

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } brukar { -brand-name-stripe } og { -brand-paypal } for trygg betalingsbehandling.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } personvernfråsegn</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } personvernfråsegn</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } brukar { -brand-paypal } for trygg betalingsbehandling.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } personvernfråsegn</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } brukar { -brand-name-stripe } for sikker behandling av betaling.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } personvernpraksis</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Vel betalingsmåte
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Først må du godkjenne abonnementet ditt

## Component - PaymentProcessing

payment-processing-message = Vent mens vi behandlar betalinga di…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kortet sluttar på { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Betal med { -brand-paypal }

## Component - PlanDetails

plan-details-header = Produktdetaljar
plan-details-list-price = Listepris
plan-details-show-button = Vis detaljar
plan-details-hide-button = Gøym detaljar
plan-details-total-label = Totalt
plan-details-tax = Skattar og avgifter

## Component - PlanErrorDialog

product-no-such-plan = Ingen slik plan for dette produktet.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } i skatt
# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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
# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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

## Component - SubscriptionTitle

subscription-create-title = Set opp abonnementet ditt
subscription-success-title = Stadfesting av abonnement
subscription-processing-title = Stadfestar abonnementet…
subscription-error-title = Feil ved stadfesting av abonnementet…
subscription-noplanchange-title = Denne endringa av abonnementsplanen er ikkje stødd
subscription-iapsubscribed-title = Abonnerer allereie
sub-guarantee = 30-dagar pengane-tilbake-garanti

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tenestevilkår
privacy = Personvernfråsegn
terms-download = Vilkår for nedlasting

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox-kontoar
# General aria-label for closing modals
close-aria =
    .aria-label = Lat att modal
settings-subscriptions-title = Abonnement
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Kampanjekode

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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

## Error messages

# App error dialog
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
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Du abonnerer allereie via { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
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

## Hooks - coupons

coupon-success = Planen din vert fornya automatisk til listeprisen.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Planen din vert fornya automatisk etter { $couponDurationDate } til listeprisen.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Opprett ein { -product-mozilla-account }
new-user-card-title = Skriv inn betalingskortinformasjon
new-user-submit = Abonner no

## Routes - Product and Subscriptions

sub-update-payment-title = Betalingsinformasjon

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Betal med kort
product-invoice-preview-error-title = Problem med å laste førehandsvising av faktura
product-invoice-preview-error-text = Klarte ikkje å laste inn førehandsvising av faktura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Vi kan ikkje oppgradere deg heilt enno

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } butikk
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

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

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (kvar dag)
sub-update-new-plan-weekly = { $productName } (kvar veke)
sub-update-new-plan-monthly = { $productName } (kvar månad)
sub-update-new-plan-yearly = { $productName } (kvart år)
sub-update-prorated-upgrade-credit = Negativ saldo som vest vist vil bli kreditert kontoen din og brukt til framtidige fakturaer.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Avbryt abonnementet
sub-item-stay-sub = Hald fram abonnementet

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Du vil ikkje lenger kunne bruke { $name } etter
    { $period }, den siste dagen i faktureringssyklusen.
sub-item-cancel-confirm =
    Avbryt tilgangen min og den lagra informasjonen min for
    { $name } den { $period }
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
sub-promo-coupon-applied = { $promotion_name }-kupong brukt: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Denne abonnementsbetalinga resulterte i ei kreditering av kontosaldoen din: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Reaktivering av abonnement var mislykka
sub-route-idx-cancel-failed = Avbryting av abonnement var mislykka
sub-route-idx-contact = Kontakt support
sub-route-idx-cancel-msg-title = Vi synest at det er synd at du seier opp abonnementet ditt
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    { $name }-abonnementet ditt er sagt opp.
          <br />
          Du vil framleis ha tilgang til { $name } til den { $date }.
sub-route-idx-cancel-aside-2 = Har du spørsmål? Besøk <a>{ -brand-mozilla } brukarstøtte</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem med å laste inn kunde
sub-invoice-error =
    .title = Problemer med å laste inn fakturaer
sub-billing-update-success = Faktureringsinformasjonen din er oppdatert
sub-invoice-previews-error-title = Problem med å laste inn førehandsvising av faktura
sub-invoice-previews-error-text = Klarte ikkje å laste inn førehandsvisingar av faktura

## Routes - Subscription - ActionButton

pay-update-change-btn = Endre
pay-update-manage-btn = Handsam

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Neste fakturering den { $date }
sub-next-bill-due-date = Neste rekning forfell { $date }
sub-expires-on = Går ut { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Går ut { $expirationDate }
sub-route-idx-updating = Oppdaterer faktureringsinformasjon…
sub-route-payment-modal-heading = Ugyldig faktureringsinformasjon
sub-route-payment-modal-message-2 = Det ser ut til å vere ein feil med { -brand-paypal }-kontoen din. Vi treng at du tek dei nødvendige stega for å løyse dette betalingsproblemet.
sub-route-missing-billing-agreement-payment-alert = Ugyldig betalingsinformasjon, det er eit problem med kontoen din. <div>Handsam</div>
sub-route-funding-source-payment-alert = Ugyldig betalingsinformasjon; det er ein feil med kontoen din. Dette varselet kan ta litt tid å fjerne etter at du har oppdatert informasjonen. <div>Administrer</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Ingen slik plan for dette abonnementet.
invoice-not-found = Fann ikkje etterfølgjande faktura
sub-item-no-such-subsequent-invoice = Finn ikkje påfølgjande faktura for dette abonnementet.
sub-invoice-preview-error-title = Fann ikkje førehandsvising av faktura
sub-invoice-preview-error-text = Fann ikkje førehandsvising av faktura for dette abonnementet

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Vil du halde fram med å bruke { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Tilgangen din til { $name } vil halde fram, og faktureringssyklusen din
    og betalinga vil vere den same. Den neste betalinga di kjem på { $amount } den { $endDate } til kortet som sluttar på { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Tilgangen din til { $name } vil halde fram, og faktureringssyklusen din
    og betalinga vil vere som før. Den neste betalinga di blir
    på { $amount } den { $endDate }.
reactivate-confirm-button = Abonner ein gong til

## $date (Date) - Last day of product access

reactivate-panel-copy = Du mistar tilgangen din til { $name } den <strong>{ $date }</strong>.
reactivate-success-copy = Takk! Alt er no klappa og klart.
reactivate-success-button = Lat att

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Kjøp i appen
sub-iap-item-apple-purchase-2 = { -brand-apple }: Kjøp i appen
sub-iap-item-manage-button = Handsam
