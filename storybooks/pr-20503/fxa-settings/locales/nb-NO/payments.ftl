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
coupon-error = Koden du skrev inn er ugyldig eller utløpt.
coupon-error-generic = Det oppstod en feil under behandling av koden. Prøv på nytt.
coupon-error-expired = Koden du skrev inn er utløpt.
coupon-error-limit-reached = Koden du skrev inn har nådd grensen.
coupon-error-invalid = Koden du skrev inn er ugyldig.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Skriv inn kode

## Component - Fields

default-input-error = Dette feltet er obligatorisk
input-error-is-required = { $label } er påkrevd

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }-logo

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Har du allerede en { -product-mozilla-account }? <a>Logg inn</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
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
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Skrivefeil i e-postadresse? { $domain } tilbyr ikke e-post.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Takk skal du ha!
payment-confirmation-thanks-heading-account-exists = Takk, sjekk e-posten din nå!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = En bekreftelsesmelding er sendt til { $email } med detaljer om hvordan du kommer i gang med { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Du vil motta en e-post på { $email } med instruksjoner for hvordan du konfigurerer kontoen din, samt betalingsinformasjonen din.
payment-confirmation-order-heading = Ordredetaljer
payment-confirmation-invoice-number = Fakturanummer { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betalingsinformasjon
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } daglig
       *[other] { $amount } hver { $intervalCount } dag
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } ukentlig
       *[other] { $amount } hver { $intervalCount } uke
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } månedlig
       *[other] { $amount } hver { $intervalCount } måned
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } årlig
       *[other] { $amount } hvert { $intervalCount } år
    }
payment-confirmation-download-button = Fortsett til nedlasting

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Jeg autoriserer { -brand-mozilla }, til å belaste betalingsmåten min for beløpet som vises, i henhold til <termsOfServiceLink>bruksvilkår</termsOfServiceLink> og <privacyNoticeLink>personvernerklæring</privacyNoticeLink>, inntil jeg sier opp abonnementet mitt.
payment-confirm-checkbox-error = Du må fullføre dette før du går videre

## Component - PaymentErrorView

payment-error-retry-button = Prøv igjen
payment-error-manage-subscription-button = Behandle mitt abonnement

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Du har allerede et { $productName }-abonnement via { -brand-google }s eller { -brand-apple }s appbutikker.
iap-upgrade-no-bundle-support = Vi støtter ikke oppgraderinger for disse abonnementene, men vi vil snart.
iap-upgrade-contact-support = Du kan fortsatt få dette produktet — kontakt brukerstøtten, så kan vi hjelpe deg.
iap-upgrade-get-help-button = Få hjelp

## Component - PaymentForm

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

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } bruker { -brand-name-stripe } og { -brand-paypal } for sikker behandling av betaling.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } personvernpraksis</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } personvernpraksis</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } bruker { -brand-paypal } for sikker behandling av betaling.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } personvernpraksis</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } bruker { -brand-name-stripe } for sikker behandling av betaling.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } personvernpraksis</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Velg betalingsmåte
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Først må du godkjenne abonnementet ditt

## Component - PaymentProcessing

payment-processing-message = Vent mens vi behandler betalingen din…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kort som slutter på { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Betal med { -brand-paypal }

## Component - PlanDetails

plan-details-header = Produktdetaljer
plan-details-list-price = Listepris
plan-details-show-button = Vis detaljer
plan-details-hide-button = Skjul detaljer
plan-details-total-label = Totalt
plan-details-tax = Skatter og avgifter

## Component - PlanErrorDialog

product-no-such-plan = Ingen slik plan for dette produktet.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } skatt
# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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
# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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

## Component - SubscriptionTitle

subscription-create-title = Sett opp abonnementet ditt
subscription-success-title = Bekreftelse av abonnement
subscription-processing-title = Bekrefter abonnementet …
subscription-error-title = Feil under bekreftelse av abonnement …
subscription-noplanchange-title = Denne endringen av abonnementsplanen støttes ikke
subscription-iapsubscribed-title = Abonnerer allerede
sub-guarantee = 30-dagers pengene-tilbake-garanti

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Bruksvilkår
privacy = Personvernerklæring
terms-download = Vilkår for nedlasting

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox-kontoer
# General aria-label for closing modals
close-aria =
    .aria-label = Lukk modal
settings-subscriptions-title = Abonnementer
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Rabattkode

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
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
# $intervalCount (Number) - The interval between payments, in weeks.
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
# $intervalCount (Number) - The interval between payments, in months.
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
# $intervalCount (Number) - The interval between payments, in years.
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

## Error messages

# App error dialog
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
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Du abonnerer allerede via { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
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

## Hooks - coupons

coupon-success = Planen din fornyes automatisk til listeprisen.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Planen din fornyes automatisk etter { $couponDurationDate } til listeprisen.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Opprett en { -product-mozilla-account }
new-user-card-title = Skriv inn betalingskortinformasjon
new-user-submit = Abonner nå

## Routes - Product and Subscriptions

sub-update-payment-title = Betalingsinformasjon

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Betal med kort
product-invoice-preview-error-title = Problem med å laste inn forhåndsvisning av faktura
product-invoice-preview-error-text = Kunne ikke laste inn forhåndsvisningen av faktura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Vi kan ikke oppgradere deg helt ennå

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } butikk
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

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

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (daglig)
sub-update-new-plan-weekly = { $productName } (ukentlig)
sub-update-new-plan-monthly = { $productName } (månedlig)
sub-update-new-plan-yearly = { $productName } (årlig)
sub-update-prorated-upgrade-credit = Negativ saldo som vises vil bli kreditert kontoen din og brukt til fremtidige fakturaer.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Avbryt abonnement
sub-item-stay-sub = Fortsett abonnementet

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Du vil ikke lenger kunne bruke { $name } etter
    { $period }, den siste dagen i faktureringssyklusen.
sub-item-cancel-confirm =
    Avbryt tilgangen min og den lagrede informasjonen min for
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
subscription-management-account-credit-balance = Denne abonnementsbetalingen resulterte i en kreditering av kontosaldoen din: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Reaktivering av abonnement mislyktes
sub-route-idx-cancel-failed = Avbryting av abonnement mislyktes
sub-route-idx-contact = Kontakt support
sub-route-idx-cancel-msg-title = Vi synes at det er synd at du sier opp abonnementet ditt
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    { $name }-abonnementet ditt er avsluttet.
          <br />
          Du vil fortsatt ha tilgang til { $name } til den { $date }.
sub-route-idx-cancel-aside-2 = Har du spørsmål? Besøk <a>{ -brand-mozilla }-brukerstøtte</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem med å laste inn kunde
sub-invoice-error =
    .title = Problemer med å laste inn fakturaer
sub-billing-update-success = Faktureringsinformasjonen din er oppdatert
sub-invoice-previews-error-title = Problem med å laste inn forhåndsvisninger av fakturaer
sub-invoice-previews-error-text = Kunne ikke laste inn forhåndsvisninger av fakturaer

## Routes - Subscription - ActionButton

pay-update-change-btn = Endre
pay-update-manage-btn = Behandle

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Neste fakturering den { $date }
sub-next-bill-due-date = Neste fakturering forfaller { $date }
sub-expires-on = Utløper { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Utløper { $expirationDate }
sub-route-idx-updating = Oppdaterer faktureringsinformasjon…
sub-route-payment-modal-heading = Ugyldig faktureringsinformasjon
sub-route-payment-modal-message-2 = Det ser ut til å være en feil med { -brand-paypal }-kontoen din. Vi trenger at du tar de nødvendige skrittene for å løse dette betalingsproblemet.
sub-route-missing-billing-agreement-payment-alert = Ugyldig betalingsinformasjon. Det er en feil med kontoen din. <div>Behandle</div>
sub-route-funding-source-payment-alert = Ugyldig betalingsinformasjon. Det er en feil med kontoen din. Det kan ta litt tid før dette varselet forsvinner etter at du har oppdatert informasjonen din. <div>Behandle</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Ingen slik plan for dette abonnementet.
invoice-not-found = Påfølgende faktura ble ikke funnet
sub-item-no-such-subsequent-invoice = Finner ikke påfølgende faktura for dette abonnementet.
sub-invoice-preview-error-title = Fant ikke forhåndsvisning av faktura
sub-invoice-preview-error-text = Fant ikke forhåndsvisning av faktura for dette abonnementet

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Vil du fortsette å bruke { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Din tilgang til { $name } vil fortsette, og faktureringssyklusen din
    og betalingen vil forbli den samme. Din neste betaling blir
    på { $amount } den { $endDate } til kortet som slutter på { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Din tilgang til { $name } vil fortsette, og faktureringssyklusen din
    og betalingen vil forbli den samme. Din neste betaling blir
    på { $amount } den { $endDate }.
reactivate-confirm-button = Abonner på nytt

## $date (Date) - Last day of product access

reactivate-panel-copy = Du mister tilgangen til { $name } den <strong>{ $date }</strong>.
reactivate-success-copy = Takk! Alt er nå klart.
reactivate-success-button = Lukk

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Kjøp i app
sub-iap-item-apple-purchase-2 = { -brand-apple }: Kjøp i app
sub-iap-item-manage-button = Behandle
