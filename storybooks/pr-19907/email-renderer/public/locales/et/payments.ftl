# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Konto avaleht

## Component - CouponForm

coupon-submit = Rakenda
coupon-remove = Eemalda
coupon-error = Sisestatud kood on vigane või aegunud.
coupon-error-generic = Koodi töötlemisel esines viga. Palun proovi uuesti.
coupon-error-expired = Sisestatud kood on aegunud.
coupon-error-limit-reached = Sisestatud koodi limiit on täis.
coupon-error-invalid = Sisestatud kood on vigane.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Sisestage kood

## Component - Fields

default-input-error = Selle välja täitmine on kohustuslik
input-error-is-required = Väli { $label } on nõutud

## Component - Header


## Component - NewUserEmailForm

new-user-confirm-email =
    .label = Kinnita oma e-posti aadress
new-user-subscribe-product-assurance = Me kasutame sinu e-posti aadressi ainult sinu konto loomiseks. Me ei müü seda kunagi kolmandatele osapooltele.
new-user-email-validate = E-posti aadress pole korrektne
new-user-email-validate-confirm = E-posti aadressid ei ühti
new-user-already-has-account-sign-in = Sul on juba konto olemas. <a>Logi sisse</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Kirjutasid e-posti aadressi valesti? { $domain } ei paku e-posti teenust.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Täname!
payment-confirmation-thanks-heading-account-exists = Täname, kontrolli nüüd oma e-posti!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Kinnituskiri saadeti aadressile { $email } ning see sisaldab infot, kuidas teenusega { $product_name } alustada.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Sa saad kirja aadressile { $email }, mis sisaldab juhiseid konto seadistamiseks ja samuti makseinfot.
payment-confirmation-order-heading = Tellimuse üksikasjad
payment-confirmation-invoice-number = Arve nr { $invoiceNumber }
payment-confirmation-details-heading-2 = Makseinfo
payment-confirmation-amount = { $amount } perioodis { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } igapäevaselt
       *[other] { $amount } iga { $intervalCount } päeva järel
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } iganädalaselt
       *[other] { $amount } iga { $intervalCount } nädala järel
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } igakuiselt
       *[other] { $amount } iga { $intervalCount } kuu järel
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } iga-aastaselt
       *[other] { $amount } iga { $intervalCount } aasta järel
    }
payment-confirmation-download-button = Jätka allalaadimisega

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Proovi uuesti
payment-error-manage-subscription-button = Halda tellimust

## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-name =
    .placeholder = Täisnimi
    .label = Nimi nii nagu see on kirjas kaardil
payment-cc =
    .label = Sinu kaart
payment-cancel-btn = Tühista
payment-update-btn = Uuenda
payment-pay-btn = Maksa nüüd
payment-validate-name-error = Palun sisesta oma nimi

## Component - PaymentLegalBlurb

payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe }'i privaatsusreeglid</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Vali maksemeetod
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }

## Component - PaymentProcessing

payment-processing-message = Palun oota, kuni töötleme sinu makset…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kaart, mis lõpeb numbritega { $last4 }

## Component - PayPalButton


## Component - PlanDetails

plan-details-header = Toote üksikasjad
plan-details-list-price = Hinnakirja hind
plan-details-show-button = Kuva üksikasju
plan-details-hide-button = Peida üksikasjad
plan-details-total-label = Kokku

## Component - PlanErrorDialog

product-no-such-plan = Selle toote puhul sellist plaani pole.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.


## Component - SubscriptionTitle

subscription-create-title = Seadista oma tellimus
subscription-success-title = Tellimuse kinnitus
subscription-processing-title = Tellimuse kinnitamine…
subscription-error-title = Viga tellimuse kinnitamisel…
subscription-noplanchange-title = Seda liitumisplaani muudatust ei toetata
subscription-iapsubscribed-title = Juba tellitud
sub-guarantee = 30-päevane raha tagasi garantii

## Component - TermsAndPrivacy

terms = Teenuse tingimused
privacy = Privaatsusreeglid
terms-download = Laadi tingimused alla

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
# General aria-label for closing modals
close-aria =
    .aria-label = Sulge
settings-subscriptions-title = Tellimused

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Üldine rakenduse viga
basic-error-message = Midagi läks valesti. Palun proovi hiljem uuesti.
payment-error-1 = Hmm. Sinu makse autoriseerimisel esines probleem. Proovi uuesti või võta ühendust oma kaardi väljaandjaga.
payment-error-2 = Hmm. Sinu makse autoriseerimisel esines probleem. Võta ühendust oma kaardi väljaandjaga.
payment-error-3b = Sinu makse töötlemisel esines ootamatu viga, palun proovi uuesti.
expired-card-error = Näib, et sinu krediitkaart on aegunud. Proovi teist kaarti.
insufficient-funds-error = Näib, et sinu kaardil pole piisavalt raha. Proovi teist kaarti.
withdrawal-count-limit-exceeded-error = Näib, et see makse ületab sinu krediidilimiiti. Proovi teist kaarti.
charge-exceeds-source-limit = Näib, et see makse ületab sinu päevast krediidilimiiti. Proovi teist kaarti.
instant-payouts-unsupported = Näib, et sinu deebetkaart pole kiirmaksete jaoks seadistatud. Proovi teist deebet- või krediitkaarti.
duplicate-transaction = Hmm. Näib, et just saadeti identne tehing. Kontrolli oma maksete ajalugu.
coupon-expired = Näib, et see sooduskood on aegunud.
card-error = Sinu tehingut polnud võimalik töödelda. Palun kontrolli oma krediitkaardi teavet ja proovi siis uuesti.
country-currency-mismatch = Sinu tellimuse valuuta ei kehti maksega seotud riigis.
currency-currency-mismatch = Vabandust. Valuutade vahel ei saa vahetada.
no-subscription-change = Vabandust. Sa ei saa oma tellimusplaani muuta.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Sa oled juba liitunud teenuse { $mobileAppStore } kaudu.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Süsteemivea tõttu ebaõnnestus registreerumine teenusega { $productName }. Sinu makseviisilt pole tasu võetud. Palun proovi uuesti.
fxa-post-passwordless-sub-error = Tellimus kinnitati, aga kinnituslehe laadimine ebaõnnestus. Konto seadistamiseks kontrolli oma e-posti.
newsletter-signup-error = Sa pole tellinud tooteuuenduste kirju. Sa võid uuesti proovida konto seadete alt.
product-plan-error =
    .title = Probleem plaanide laadimisel
product-profile-error =
    .title = Probleem profiili laadimisel
product-customer-error =
    .title = Probleem kliendi laadimisel
product-plan-not-found = Plaani ei leitud

## Hooks - coupons

coupon-success = Sinu plaani uuendatakse automaatselt hinnakirja hinnaga.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Sinu plaani uuendatakse automaatselt pärast { $couponDurationDate } hinnakirja hinnaga.

## Routes - Checkout - New user

new-user-card-title = Sisesta oma kaardi andmed
new-user-submit = Telli kohe

## Routes - Product and Subscriptions

sub-update-payment-title = Makseinfo

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Maksa kaardiga

## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

product-plan-change-heading = Vaata oma muudatus üle
sub-change-failed = Plaani muutmine ebaõnnestus
sub-change-submit = Kinnita muudatus
sub-update-current-plan-label = Praegune plaan
sub-update-new-plan-label = Uus plaan
sub-update-total-label = Uus summa

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Tühista tellimus
sub-item-stay-sub = Jää teenust tellima

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Pärast { $period } pole sul võimalus enam teenust { $name } kasutada,
    siis on sinu arveldusperioodi viimane päev.
sub-item-cancel-confirm = Tühista minu juurepääs ja salvestatud andmed teenusest { $name } kuupäeval { $period }

## Routes - Subscription

sub-route-idx-reactivating = Tellimuse taasaktiveerimine ebaõnnestus
sub-route-idx-cancel-failed = Tellimuse tühistamine ebaõnnestus
sub-route-idx-contact = Võta ühendust toega
sub-route-idx-cancel-msg-title = Meil on kahju sind lahkumas näha
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Sinu teenuse { $name } tellimus on tühistatud.
          <br />
          Ligipääs teenusele { $name } säilib kuni { $date }.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Probleem kliendi laadimisel
sub-invoice-error =
    .title = Probleem arvete laadimisel
sub-billing-update-success = Sinu arveldusinfo on edukalt uuendatud

## Routes - Subscription - ActionButton

pay-update-change-btn = Muuda
pay-update-manage-btn = Halda

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Järgmine arve luuakse { $date }
sub-expires-on = Aegub { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Aegub { $expirationDate }
sub-route-idx-updating = Arveldusinfo uuendamine…
sub-route-payment-modal-heading = Vigane arveldusinfo
sub-route-missing-billing-agreement-payment-alert = Vigane makseinfo; sinu kontol on viga. <div>Halda</div>
sub-route-funding-source-payment-alert = Vigane makseinfo; sinu kontol on viga. Sel häirel võib võtta aega, et ära kaduda pärast edukat info uuendamist. <div>Halda</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Selle tellimuse jaoks pole sellist plaani.
invoice-not-found = Hilisemat arvet ei leitud
sub-item-no-such-subsequent-invoice = Selle tellimuse kohta ei leitud hilisemat arvet.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Kas soovid jätkata teenuse { $name } kasutamist?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy = Sinu ligipääs teenusele { $name } jätkub ning sinu arveldusperiood ja makse suurus jäävad samaks. Järgmine makse on summas { $amount } kaardile, mis lõpeb numbriga { $last } kuupäeval { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy = Sinu ligipääs teenusele { $name } jätkub ning sinu arveldusperiood ja makse suurus jäävad samaks. Järgmine makse on summas { $amount } kuupäeval { $endDate }.
reactivate-confirm-button = Telli uuesti

## $date (Date) - Last day of product access

reactivate-panel-copy = Kaotad juurdepääsu teenusele { $name } kuupäeval <strong>{ $date }</strong>.
reactivate-success-copy = Aitäh! Kõik on valmis.
reactivate-success-button = Sulge

## Routes - Subscriptions - Subscription iap item

sub-iap-item-manage-button = Halda
