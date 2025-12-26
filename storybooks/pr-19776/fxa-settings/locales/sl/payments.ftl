# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Domača stran računa
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promocijska koda uveljavljena
coupon-submit = Uveljavi
coupon-remove = Odstrani
coupon-error = Koda, ki ste jo vnesli, je neveljavna ali pretečena.
coupon-error-generic = Pri obdelavi kode je prišlo do napake. Poskusite znova.
coupon-error-expired = Kodi, ki ste jo vnesli, je potekla veljavnost.
coupon-error-limit-reached = Koda, ki ste jo vnesli, je dosegla svojo omejitev.
coupon-error-invalid = Koda, ki ste jo vnesli, je neveljavna.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Vnesite kodo

## Component - Fields

default-input-error = To polje je obvezno
input-error-is-required = { $label } je zahtevan podatek

## Component - Header

brand-name-mozilla-logo = Logotip { -brand-mozilla(sklon: "rodilnik") }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Že imate { -product-mozilla-account }? <a>Prijava</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Vnesite svoj e-poštni naslov
new-user-confirm-email =
    .label = Potrdite e-poštni naslov
new-user-subscribe-product-updates-mozilla = Želim prejemati novice in obvestila o izdelkih { -brand-mozilla(sklon: "rodilnik") }
new-user-subscribe-product-updates-snp = Želim prejemati novice in obvestila { -brand-mozilla(sklon: "rodilnik") } o varnosti in zasebnosti
new-user-subscribe-product-updates-hubs = Želim prejemati novice in obvestila { -product-mozilla-hubs } in { -brand-mozilla(sklon: "rodilnik") } o izdelkih
new-user-subscribe-product-updates-mdnplus = Želim prejemati novice in obvestila o izdelkih { -product-mdn-plus } in { -brand-mozilla }
new-user-subscribe-product-assurance = Vaš e-poštni naslov uporabimo samo za ustvarjanje vašega računa. Nikoli ga ne bomo prodali nikomur drugemu.
new-user-email-validate = E-poštni naslov ni veljaven
new-user-email-validate-confirm = E-poštna naslova se ne ujemata
new-user-already-has-account-sign-in = Račun že imate. <a>Prijava</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Ste se zatipkali? { $domain } ne ponuja e-pošte.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Hvala!
payment-confirmation-thanks-heading-account-exists = Hvala, sedaj preverite svojo e-pošto!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Na { $email } je bilo poslano potrditveno e-poštno sporočilo s podrobnimi navodili, kako začeti uporabljati { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Na { $email } boste prejeli e-pošto z navodili za nastavitev računa in s podatki o plačilu.
payment-confirmation-order-heading = Podrobnosti naročila
payment-confirmation-invoice-number = Račun št. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Podatki o plačilu
payment-confirmation-amount = { $amount } na { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } na dan
        [two] { $amount } vsaka { $intervalCount } dneva
        [few] { $amount } vsake { $intervalCount } dni
       *[other] { $amount } vsakih { $intervalCount } dni
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } na teden
        [two] { $amount } vsaka { $intervalCount } tedna
        [few] { $amount } vsake { $intervalCount } tedne
       *[other] { $amount } vsakih { $intervalCount } tednov
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } na mesec
        [two] { $amount } vsaka { $intervalCount } meseca
        [few] { $amount } vsake { $intervalCount } mesece
       *[other] { $amount } vsakih { $intervalCount } mesecev
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } na leto
        [two] { $amount } vsaki { $intervalCount } leti
        [few] { $amount } vsaka { $intervalCount } leta
       *[other] { $amount } vsakih { $intervalCount } let
    }
payment-confirmation-download-button = Nadaljuj prenos

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Dovoljujem, da { -brand-mozilla } v skladu s <termsOfServiceLink>pogoji uporabe</termsOfServiceLink> in <privacyNoticeLink>obvestilom o zasebnosti</privacyNoticeLink> bremeni moje plačilno sredstvo za prikazani znesek, dokler ne prekličem naročnine.
payment-confirm-checkbox-error = To morate dokončati, preden nadaljujete

## Component - PaymentErrorView

payment-error-retry-button = Poskusi znova
payment-error-manage-subscription-button = Upravljaj z naročnino

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Že ste naročeni na { $productName } v trgovinah z aplikacijami { -brand-google } ali { -brand-apple }.
iap-upgrade-no-bundle-support = Za te naročnine ne podpiramo nadgradenj, vendar jih bomo kmalu.
iap-upgrade-contact-support = Ta izdelek je še vedno na voljo – obrnite se na podporo, da vam lahko pomagamo.
iap-upgrade-get-help-button = Poišči pomoč

## Component - PaymentForm

payment-name =
    .placeholder = Polno ime
    .label = Ime, kot je napisano na osebni izkaznici
payment-cc =
    .label = Vaša kartica
payment-cancel-btn = Prekliči
payment-update-btn = Posodobi
payment-pay-btn = Plačaj zdaj
payment-pay-with-paypal-btn-2 = Plačaj s { -brand-paypal }om
payment-validate-name-error = Vnesite svoje ime

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } za varno obdelavo plačil uporablja storitvi { -brand-name-stripe } in { -brand-paypal }.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Politika zasebnosti za { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Politika zasebnosti za { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } za varno obdelavo plačil uporablja storitev { -brand-paypal }.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Pravilnik o zasebnosti za { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } za varno obdelavo plačil uporablja storitev { -brand-name-stripe }.
payment-legal-link-stripe-3 = <stripePrivacyLink>Politika zasebnosti za { -brand-name-stripe }</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Izberite način plačila
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Najprej morate odobriti svojo naročnino

## Component - PaymentProcessing

payment-processing-message = Počakajte, da obdelamo vaše plačilo …

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kartica, ki se končuje s { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Plačaj s { -brand-paypal }om

## Component - PlanDetails

plan-details-header = Podrobnosti izdelka
plan-details-list-price = Cenik
plan-details-show-button = Pokaži podrobnosti
plan-details-hide-button = Skrij podrobnosti
plan-details-total-label = Skupaj
plan-details-tax = Davki in pristojbine

## Component - PlanErrorDialog

product-no-such-plan = Za ta izdelek ni takšnega načrta.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } davka
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } na dan
        [two] { $priceAmount } vsaka { $intervalCount } dneva
        [few] { $priceAmount } vsake { $intervalCount } dni
       *[other] { $priceAmount } vsakih { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na dan
            [two] { $priceAmount } vsaka { $intervalCount } dneva
            [few] { $priceAmount } vsake { $intervalCount } dni
           *[other] { $priceAmount } vsakih { $intervalCount } dni
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } na teden
        [two] { $priceAmount } vsaka { $intervalCount } tedna
        [few] { $priceAmount } vsake { $intervalCount } tedne
       *[other] { $priceAmount } vsakih { $intervalCount } tednov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na teden
            [two] { $priceAmount } vsaka { $intervalCount } tedna
            [few] { $priceAmount } vsake { $intervalCount } tedne
           *[other] { $priceAmount } vsakih { $intervalCount } tednov
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } na mesec
        [two] { $priceAmount } vsaka { $intervalCount } meseca
        [few] { $priceAmount } vsake { $intervalCount } mesece
       *[other] { $priceAmount } vsakih { $intervalCount } mesecev
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na mesec
            [two] { $priceAmount } vsaka { $intervalCount } meseca
            [few] { $priceAmount } vsake { $intervalCount } mesece
           *[other] { $priceAmount } vsakih { $intervalCount } mesecev
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } na leto
        [two] { $priceAmount } na { $intervalCount } leti
        [few] { $priceAmount } na { $intervalCount } leta
       *[other] { $priceAmount } na { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } na leto
            [two] { $priceAmount } na { $intervalCount } leti
            [few] { $priceAmount } na { $intervalCount } leta
           *[other] { $priceAmount } na { $intervalCount } let
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na dan
        [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } dneva
        [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } dni
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na dan
            [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } dneva
            [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } dni
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } dni
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na teden
        [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } tedna
        [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } tedne
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } tednov
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na teden
            [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } tedna
            [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } tedne
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } tednov
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na mesec
        [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } meseca
        [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } mesece
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } mesecev
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na mesec
            [two] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } meseca
            [few] { $priceAmount } + { $taxAmount } davka vsake { $intervalCount } mesece
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } mesecev
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } davka na leto
        [two] { $priceAmount } + { $taxAmount } davka vsaki { $intervalCount } leti
        [few] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } leta
       *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } davka na leto
            [two] { $priceAmount } + { $taxAmount } davka vsaki { $intervalCount } leti
            [few] { $priceAmount } + { $taxAmount } davka vsaka { $intervalCount } leta
           *[other] { $priceAmount } + { $taxAmount } davka vsakih { $intervalCount } let
        }

## Component - SubscriptionTitle

subscription-create-title = Nastavite svojo naročnino
subscription-success-title = Potrditev naročnine
subscription-processing-title = Potrjevanje naročnine …
subscription-error-title = Napaka pri potrjevanju naročnine …
subscription-noplanchange-title = Ta sprememba naročniškega načrta ni podprta
subscription-iapsubscribed-title = Že naročeno
sub-guarantee = 30-dnevno vračilo denarja

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(zacetnica: "velika") }
terms = Pogoji storitve
privacy = Obvestilo o zasebnosti
terms-download = Pogoji prenosa

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox računi
# General aria-label for closing modals
close-aria =
    .aria-label = Zapri modalno okno
settings-subscriptions-title = Naročnine
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Promocijska koda

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } na dan
        [two] { $amount } vsaka { $intervalCount } dneva
        [few] { $amount } vsake { $intervalCount } dni
       *[other] { $amount } vsakih { $intervalCount } dni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na dan
            [two] { $amount } vsaka { $intervalCount } dneva
            [few] { $amount } vsake { $intervalCount } dni
           *[other] { $amount } vsakih { $intervalCount } dni
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } na teden
        [two] { $amount } vsaka { $intervalCount } tedna
        [few] { $amount } vsake { $intervalCount } tedne
       *[other] { $amount } vsakih { $intervalCount } tednov
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na teden
            [two] { $amount } vsaka { $intervalCount } tedna
            [few] { $amount } vsake { $intervalCount } tedne
           *[other] { $amount } vsakih { $intervalCount } tednov
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } na mesec
        [two] { $amount } vsaka { $intervalCount } meseca
        [few] { $amount } vsake { $intervalCount } mesece
       *[other] { $amount } vsakih { $intervalCount } mesecev
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na mesec
            [two] { $amount } vsaka { $intervalCount } meseca
            [few] { $amount } vsake { $intervalCount } mesece
           *[other] { $amount } vsakih { $intervalCount } mesecev
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } na leto
        [two] { $amount } na { $intervalCount } leti
        [few] { $amount } na { $intervalCount } leta
       *[other] { $amount } na { $intervalCount } let
    }
    .title =
        { $intervalCount ->
            [one] { $amount } na leto
            [two] { $amount } na { $intervalCount } leti
            [few] { $amount } na { $intervalCount } leta
           *[other] { $amount } na { $intervalCount } let
        }

## Error messages

# App error dialog
general-error-heading = Splošna napaka aplikacije
basic-error-message = Prišlo je do napake. Poskusite znova pozneje.
payment-error-1 = Hmm. Pri avtorizaciji vašega plačila je prišlo do težave. Poskusite znova ali se obrnite na izdajatelja kartice.
payment-error-2 = Hmm. Pri avtorizaciji vašega plačila je prišlo do težave. Obrnite se na izdajatelja kartice.
payment-error-3b = Med obdelavo vašega plačila je prišlo do nepričakovane napake, poskusite znova.
expired-card-error = Videti je, da se je vaši kreditni kartici iztekla veljavnost. Poskusite z drugo kartico.
insufficient-funds-error = Videti je, da na vaši kartici ni dovolj sredstev. Poskusite z drugo kartico.
withdrawal-count-limit-exceeded-error = Videti je, da bo ta transakcija presegla vaš kreditni limit. Poskusite z drugo kartico.
charge-exceeds-source-limit = Videti je, da bo ta transakcija presegla vaš dnevni kreditni limit. Poskusite z drugo kartico ali čez 24 ur.
instant-payouts-unsupported = Videti je, da vaša debetna kartica ni nastavljena za takojšnja plačila. Poskusite z drugo debetno ali kreditno kartico.
duplicate-transaction = Hmm. Videti je, da je bila identična transakcija pravkar opravljena. Preverite zgodovino plačil.
coupon-expired = Videti je, da je promocijska koda potekla.
card-error = Vaše transakcije ni bilo mogoče obdelati. Preverite podatke o svoji kreditni kartici in poskusite znova.
country-currency-mismatch = Valuta te naročnine ni veljavna za državo, povezano z vašim plačilom.
currency-currency-mismatch = Oprostite. Med valutami ne morete preklapljati.
location-unsupported = V skladu z našimi pogoji uporabe vaša trenutna lokacija ni podprta.
no-subscription-change = Oprostite. Naročniškega paketa ni mogoče spremeniti.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Že ste naročeni preko { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Vaša prijava v { $productName } je bila neuspešna zaradi sistemske napake. Vašega plačilnega sredstva nismo bremenili. Poskusite znova.
fxa-post-passwordless-sub-error = Naročnina je potrjena, vendar se stran za potrditev ni naložila. Preverite svojo e-pošto in nastavite račun.
newsletter-signup-error = Niste naročeni na e-poštna obvestila o posodobitvah izdelkov. Poskusite lahko znova v nastavitvah računa.
product-plan-error =
    .title = Napaka pri nalaganju načrtov
product-profile-error =
    .title = Napaka pri nalaganju profila
product-customer-error =
    .title = Napaka pri nalaganju stranke
product-plan-not-found = Načrta ni mogoče najti
product-location-unsupported-error = Lokacija ni podprta

## Hooks - coupons

coupon-success = Vaš paket se bo samodejno podaljšal po maloprodajni ceni.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Vaš paket se bo po { $couponDurationDate } samodejno obnovil po maloprodajni ceni.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Ustvarite { -product-mozilla-account }
new-user-card-title = Vnesite podatke o kartici
new-user-submit = Naroči se zdaj

## Routes - Product and Subscriptions

sub-update-payment-title = Podatki o plačilu

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Plačajte s kartico
product-invoice-preview-error-title = Težava pri nalaganju predogleda računa
product-invoice-preview-error-text = Ni bilo mogoče naložiti predogleda računa

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Nadgradnje še ni mogoče izvesti

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Trgovina { -google-play }
brand-name-apple-app-store-2 = Trgovina { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Preglejte spremembo
sub-change-failed = Sprememba načrta ni uspela
sub-update-acknowledgment = Vaš paket se bo spremenil takoj in danes vam bomo zaračunali sorazmeren znesek za preostanek tega obračunskega obdobja. Od { $startingDate } naprej vam bomo zaračunavali celoten znesek.
sub-change-submit = Potrdite spremembo
sub-update-current-plan-label = Trenutni načrt
sub-update-new-plan-label = Nov načrt
sub-update-total-label = Nov znesek
sub-update-prorated-upgrade = Sorazmerna nadgradnja

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (dnevno)
sub-update-new-plan-weekly = { $productName } (tedensko)
sub-update-new-plan-monthly = { $productName } (mesečno)
sub-update-new-plan-yearly = { $productName } (letno)
sub-update-prorated-upgrade-credit = Prikazano negativno stanje bo knjiženo v dobroimetje na vašem računu in uporabljeno za prihodnje račune.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Prekliči naročnino
sub-item-stay-sub = Ostanite naročnik

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = Od zadnjega dne vašega obračunskega obdobja naprej ({ $period }) ne boste mogli več uporabljati izdelka { $name }.
sub-item-cancel-confirm =
    Prekliči moj dostop in shranjene podatke v storitvi
    { $name } z dnem { $period }
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
sub-promo-coupon-applied = Unovčen kupon { $promotion_name }: <priceDetails></priceDetails>
subscription-management-account-credit-balance = To plačilo naročnine je povzročilo dobroimetje na vašem računu: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Obnovitev naročnine ni uspela
sub-route-idx-cancel-failed = Preklic naročnine ni uspel
sub-route-idx-contact = Obrnite se na podporo
sub-route-idx-cancel-msg-title = Žal nam je, da odhajate
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Vaša naročnina na { $name } je preklicana.
          <br />
          Do { $date } boste lahko še vedno uporabljali { $name }.
sub-route-idx-cancel-aside-2 = Imate vprašanja? Obiščite <a>podporo { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Napaka pri nalaganju stranke
sub-invoice-error =
    .title = Napaka pri nalaganju računov
sub-billing-update-success = Vaši podatki za obračun so bili uspešno posodobljeni
sub-invoice-previews-error-title = Težava pri nalaganju predogledov računov
sub-invoice-previews-error-text = Predogledov računov ni bilo mogoče naložiti

## Routes - Subscription - ActionButton

pay-update-change-btn = Spremeni
pay-update-manage-btn = Upravljaj

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Naslednji obračun { $date }
sub-next-bill-due-date = Naslednji račun prihaja { $date }
sub-expires-on = Preteče { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Poteče { $expirationDate }
sub-route-idx-updating = Posodabljanje podatkov za obračun …
sub-route-payment-modal-heading = Neveljavni podatki za obračun
sub-route-payment-modal-message-2 = Videti je, da je prišlo do napake v vašem računu { -brand-paypal }. Za razrešitev težave s plačilom po potrebi ukrepajte.
sub-route-missing-billing-agreement-payment-alert = Neveljavni podatki o plačilu; pri uporabi vašega računa je prišlo do napake. <div>Upravljaj</div>
sub-route-funding-source-payment-alert = Neveljavni podatki o plačilu; pri uporabi vašega računa je prišlo do napake. Po uspešni posodobitvi podatkov lahko traja nekaj časa, da se to opozorilo izbriše. <div>Upravljaj</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Za to naročnino ni takega načrta.
invoice-not-found = Naknadnega računa ni mogoče najti
sub-item-no-such-subsequent-invoice = Naknadnega računa za to naročnino ni mogoče najti.
sub-invoice-preview-error-title = Predogleda računa ni bilo mogoče najti
sub-invoice-preview-error-text = Predogleda računa za to naročnino ni bilo mogoče najti

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Želite še naprej uporabljati { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy = Vaš dostop do { $name } se bo nadaljeval, vaše obračunsko obdobje in plačilo pa bosta ostali nespremenjeni. Vaša naslednja bremenitev v vrednosti { $amount } bo opravljena dne { $endDate } na kartico, ki se konča s številkami { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy = Vaš dostop do { $name } se bo nadaljeval, vaše obračunsko obdobje in plačilo pa bosta ostali nespremenjeni. Vaša naslednja bremenitev v vrednosti { $amount } bo opravljena dne { $endDate }.
reactivate-confirm-button = Obnovi naročnino

## $date (Date) - Last day of product access

reactivate-panel-copy = Dne <strong>{ $date }</strong> boste izgubili dostop do { $name }.
reactivate-success-copy = Hvala! Pripravljeni ste.
reactivate-success-button = Zapri

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Nakup v aplikaciji
sub-iap-item-apple-purchase-2 = { -brand-apple }: Nakup v aplikaciji
sub-iap-item-manage-button = Upravljaj
