# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Startside for konto
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Rabatkode anvendt
coupon-submit = Anvend
coupon-remove = Fjern
coupon-error = Den indtastede kode er ugyldig eller udløbet.
coupon-error-generic = Der opstod en fejl under behandlingen af koden. Prøv igen.
coupon-error-expired = Den indtastede kode er udløbet.
coupon-error-limit-reached = Den indtastede kode kan ikke bruges mere.
coupon-error-invalid = Den indtastede kode er ugyldig.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Indtast kode

## Component - Fields

default-input-error = Dette felt er påkrævet
input-error-is-required = { $label } er påkrævet

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla }-logo

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Har du allerede en { -product-mozilla-account }? <a>Log ind</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Indtast din mailadresse
new-user-confirm-email =
    .label = Bekræft din mailadresse
new-user-subscribe-product-updates-mozilla = Jeg vil gerne modtage nyheder om produkter og opdateringer fra { -brand-mozilla }
new-user-subscribe-product-updates-snp = Jeg vil gerne modtage nyheder om privatlivsbeskyttelse og opdateringer fra { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Jeg vil gerne modtage nyheder om produkter og opdateringer fra { -product-mozilla-hubs } og { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Jeg vil gerne modtage nyheder om produkter og opdateringer fra { -product-mdn-plus } og { -brand-mozilla }
new-user-subscribe-product-assurance = Vi bruger kun din mailadresse til at oprette din konto. Vi vil aldrig sælge den til en tredjepart.
new-user-email-validate = Mailadressen er ikke gyldig
new-user-email-validate-confirm = Mailadresserne matcher ikke
new-user-already-has-account-sign-in = Du har allerede en konto. <a>Log ind</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Forkert indtastet mailadresse? { $domain } tilbyder ikke mail.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Tak!
payment-confirmation-thanks-heading-account-exists = Tak. Tjek nu din mail!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = En bekræftelsesmail er blevet sendt til { $email } med detaljer om, hvordan du kommer i gang med { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Du vil modtage en mail på { $email } med dine betalingsoplysninger og en vejledning til at oprette din konto.
payment-confirmation-order-heading = Ordredetaljer
payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Betalingsinformation
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } dagligt
       *[other] { $amount } hver { $intervalCount } dag
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } ugentligt
       *[other] { $amount } hver { $intervalCount } uge
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } månedligt
       *[other] { $amount } hver { $intervalCount } måned
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } årligt
       *[other] { $amount } hvert { $intervalCount } år
    }
payment-confirmation-download-button = Fortsæt til hentning

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Jeg giver hermed tilladelse til, at { -brand-mozilla } kan trække det viste beløb med min angivne betalingsmetode i overensstemmelse med <termsOfServiceLink>tjenestevilkårene</termsOfServiceLink> og <privacyNoticeLink>privatlivserklæringen</privacyNoticeLink>, indtil jeg annullerer mit abonnement.
payment-confirm-checkbox-error = Du skal fuldføre dette, før du går videre

## Component - PaymentErrorView

payment-error-retry-button = Prøv igen
payment-error-manage-subscription-button = Håndter mine abonnementer

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Du har allerede et { $productName }-abonnement via { -brand-google }s  eller { -brand-apple }s appbutikker.
iap-upgrade-no-bundle-support = Vi understøtter ikke opgraderinger til disse abonnementer, men det kommer vi til at gøre snart.
iap-upgrade-contact-support = Du kan stadig få dette produkt. Kontakt supporten, så vi kan hjælpe dig.
iap-upgrade-get-help-button = Få hjælp

## Component - PaymentForm

payment-name =
    .placeholder = Fulde navn
    .label = Navn, som det vises på dit kort
payment-cc =
    .label = Dit kort
payment-cancel-btn = Annuller
payment-update-btn = Opdater
payment-pay-btn = Betal nu
payment-pay-with-paypal-btn-2 = Betal med { -brand-paypal }
payment-validate-name-error = Indtast dit navn

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } bruger { -brand-name-stripe } og { -brand-paypal } til sikker behandling af betaling.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe }s privatlivspolitik</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal }s privatlivspolitik</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } bruger { -brand-paypal } til sikker behandling af betaling.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal }s privatlivspolitik</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } bruger { -brand-name-stripe } til sikker behandling af betaling.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe }s privatlivspolitik</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Vælg din betalingsmetode
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Først skal du godkende dit abonnement

## Component - PaymentProcessing

payment-processing-message = Vent mens vi behandler din betaling…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kort, der ender på { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Betal med { -brand-paypal }

## Component - PlanDetails

plan-details-header = Produktdetaljer
plan-details-list-price = Listepris
plan-details-show-button = Vis detaljer
plan-details-hide-button = Skjul detaljer
plan-details-total-label = I alt
plan-details-tax = Afgifter og gebyrer

## Component - PlanErrorDialog

product-no-such-plan = Der findes ingen sådan plan for dette produkt.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } afgift
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } dagligt
       *[other] { $priceAmount } hver { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } dagligt
           *[other] { $priceAmount } hver { $intervalCount } dag
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } ugentligt
       *[other] { $priceAmount } hver { $intervalCount } uge
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ugentligt
           *[other] { $priceAmount } hver { $intervalCount } uge
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } månedligt
       *[other] { $priceAmount } hver { $intervalCount } måned
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } månedligt
           *[other] { $priceAmount } hver  { $intervalCount } måned
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } årligt
       *[other] { $priceAmount } hvert { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } årligt
           *[other] { $priceAmount } hvert { $intervalCount } år
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } afgift dagligt
       *[other] { $priceAmount } + { $taxAmount } afgift hver { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } afgift dagligt
           *[other] { $priceAmount } + { $taxAmount } afgift hver { $intervalCount } dag
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } afgift ugentligt
       *[other] { $priceAmount } + { $taxAmount } afgift hver { $intervalCount } uge
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } afgift ugentligt
           *[other] { $priceAmount } + { $taxAmount } afgift hver { $intervalCount } uge
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } afgift månedligt
       *[other] { $priceAmount } +{ $taxAmount } afgift hver { $intervalCount } måned
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } afgift månedligt
           *[other] { $priceAmount } + { $taxAmount } afgift hver { $intervalCount } måned
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } afgift årligt
       *[other] { $priceAmount } + { $taxAmount } afgift hvert { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } afgift årligt
           *[other] { $priceAmount } + { $taxAmount } afgift hvert { $intervalCount } år
        }

## Component - SubscriptionTitle

subscription-create-title = Opsætning af dit abonnement
subscription-success-title = Bekræftelse af abonnement
subscription-processing-title = Bekræfter abonnement…
subscription-error-title = Der opstod en fejl under bekræftelse af abonnement…
subscription-noplanchange-title = Denne ændring af abonnementsplan understøttes ikke
subscription-iapsubscribed-title = Abonnerer allerede
sub-guarantee = 30-dages pengene-tilbage-garanti

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tjenestevilkår
privacy = Privatlivserklæring
terms-download = Betingelser for hentning

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox-konti
# General aria-label for closing modals
close-aria =
    .aria-label = Luk modal-vindue
settings-subscriptions-title = Abonnementer
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Rabatkode

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } dagligt
       *[other] { $amount } hver { $intervalCount } dag
    }
    .title =
        { $intervalCount ->
            [one] { $amount } dagligt
           *[other] { $amount } hver { $intervalCount } dag
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } ugentligt
       *[other] { $amount } hver { $intervalCount } uge
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ugentligt
           *[other] { $amount } hver { $intervalCount } uge
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } månedligt
       *[other] { $amount } hver { $intervalCount } måned
    }
    .title =
        { $intervalCount ->
            [one] { $amount } månedligt
           *[other] { $amount } hver { $intervalCount } måned
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } årligt
       *[other] { $amount } hvert { $intervalCount } år
    }
    .title =
        { $intervalCount ->
            [one] { $amount } årligt
           *[other] { $amount } hvert { $intervalCount } år
        }

## Error messages

# App error dialog
general-error-heading = Generel applikationsfejl
basic-error-message = Noget gik galt. Prøv igen senere.
payment-error-1 = Hmm. Der opstod et problem med at godkende din betaling. Prøv igen eller kontakt din kortudsteder.
payment-error-2 = Hmm. Der opstod et problem med at godkende din betaling. Kontakt din kortudsteder.
payment-error-3b = Der opstod en uventet fejl under behandlingen af din betaling. Prøv igen.
expired-card-error = Det ser ud til, at dit betalingskort er udløbet. Prøv med et andet kort.
insufficient-funds-error = Det ser ud til, at der ikke er penge nok på dit kort. Prøv et andet kort.
withdrawal-count-limit-exceeded-error = Det ser ud til, at denne transaktion vil overskride din kreditgrænse. Prøv med et andet kort.
charge-exceeds-source-limit = Det ser ud til, at denne transaktion vil overskride din kreditgrænse. Prøv med et andet kort eller prøv igen om 24 timer.
instant-payouts-unsupported = Det ser ud til, at dit betalingskort ikke kan bruges til øjeblikkelige betalinger. Prøv med et andet kort.
duplicate-transaction = Hmm. Det ser ud til, at en identisk transaktion lige blev sendt. Kontrollér din betalingshistorik.
coupon-expired = Det ser ud til, at promo-koden er udløbet.
card-error = Din transaktion kunne ikke behandles. Kontroller oplysningerne om dit betalingskort og prøv igen.
country-currency-mismatch = Dette abonnements valuta er ikke gyldig for det land, der er knyttet til din betaling.
currency-currency-mismatch = Du kan ikke skifte mellem valutaer.
location-unsupported = Din nuværende position understøttes ikke i henhold til vores tjenestevilkår.
no-subscription-change = Du kan ikke ændre din abonnementsplan.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Du abonnerer allerede via { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = På grund af en systemfejl mislykkedes din tilmelding til { $productName }. Du er ikke blevet opkrævet. Prøv igen.
fxa-post-passwordless-sub-error = Abonnementet er bekræftet, men bekræftelsessiden kunne ikke indlæses. Tjek din mail for at oprette din konto.
newsletter-signup-error = Du har ikke tilmeldt dig nyhedsmails om produktopdateringer. Du kan prøve igen i dine kontoindstillinger.
product-plan-error =
    .title = Problem med indlæsning af planer
product-profile-error =
    .title = Problem med indlæsning af profil
product-customer-error =
    .title = Problem med indlæsning af kunde
product-plan-not-found = Plan ikke fundet
product-location-unsupported-error = Position ikke understøttet

## Hooks - coupons

coupon-success = Din plan fornys automatisk til listeprisen.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Din plan fornys automatisk til listeprisen efter { $couponDurationDate }.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Opret en { -product-mozilla-account }
new-user-card-title = Indtast oplysninger om dit betalingskort
new-user-submit = Abonner nu

## Routes - Product and Subscriptions

sub-update-payment-title = Betalingsinformation

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Betal med kort
product-invoice-preview-error-title = Problem med indlæsning af eksempel på faktura
product-invoice-preview-error-text = Kunne ikke indlæse eksempel på faktura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Vi kan ikke opgradere dig helt endnu

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Butik
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Gennemgå dine ændringer
sub-change-failed = Ændring af plan mislykkedes
sub-update-acknowledgment =
    Din plan bliver ændret med det samme, og du vil blive opkrævet et forholdsmæssigt
    beløb i dag for resten af denne faktureringsperiode. Fra og med { $startingDate }
    vil du blive opkrævet det fulde beløb.
sub-change-submit = Bekræft ændring
sub-update-current-plan-label = Nuværende plan
sub-update-new-plan-label = Ny plan
sub-update-total-label = Ny total
sub-update-prorated-upgrade = Forholdsmæssig opgradering

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (Dagligt)
sub-update-new-plan-weekly = { $productName } (Ugentligt)
sub-update-new-plan-monthly = { $productName } (Månedligt)
sub-update-new-plan-yearly = { $productName } (Årligt)
sub-update-prorated-upgrade-credit = Den viste negative saldo vil blive anvendt som tilgodehavende på din konto og brugt til fremtidige fakturaer.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Annuller abonnement
sub-item-stay-sub = Fortsæt abonnement

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Du vil ikke længere kunne bruge  { $name } efter
    { $period }, der er den sidste dag i din faktureringsperiode.
sub-item-cancel-confirm =
    Annuller min adgang og kassér mine informationer gemt i
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
sub-promo-coupon-applied = { $promotion_name }-kupon anvendt: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Denne abonnementsbetaling resulterede i et tilgodehavende på saldoen for din konto: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Genaktivering af abonnement mislykkedes
sub-route-idx-cancel-failed = Annullering af abonnement mislykkedes
sub-route-idx-contact = Kontakt support
sub-route-idx-cancel-msg-title = Vi er kede af, at du forlader os.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Dit abonnement på { $name } er blevet annulleret.
          <br />
          Du har adgang til { $name } frem til { $date }.
sub-route-idx-cancel-aside-2 = Har du spørgsmål? Besøg <a>{ -brand-mozilla } Support</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem med indlæsning af kunde
sub-invoice-error =
    .title = Problem med indlæsning af fakturaer
sub-billing-update-success = Dine faktureringsoplysninger er blevet opdateret
sub-invoice-previews-error-title = Problem med indlæsning af eksempler på fakturaer
sub-invoice-previews-error-text = Kunne ikke indlæse eksempler på fakturaer

## Routes - Subscription - ActionButton

pay-update-change-btn = Skift
pay-update-manage-btn = Håndtér

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Næste fakturering den { $date }
sub-next-bill-due-date = Næste regning forfalder til betaling den { $date }
sub-expires-on = Udløber den { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Udløber { $expirationDate }
sub-route-idx-updating = Opdaterer faktureringsoplysninger…
sub-route-payment-modal-heading = Ugyldige faktureringsoplysninger
sub-route-payment-modal-message-2 = Der ser ud til at være en fejl med din { -brand-paypal }-konto. Du skal udføre de nødvendige ændringer for at løse problemet.
sub-route-missing-billing-agreement-payment-alert = Ugyldig betalingsinformation; der er en fejl med din konto.<div>Håndtér</div>
sub-route-funding-source-payment-alert = Ugyldig betalingsinformation; der er en fejl med din konto. Det kan tage nogen tid, før denne advarsel forsvinder efter du har opdateret dine oplysninger. <div>Håndtér</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Der findes ingen sådan plan for dette abonnement.
invoice-not-found = Efterfølgende faktura ikke fundet
sub-item-no-such-subsequent-invoice = Efterfølgende faktura ikke fundet for dette abonnement.
sub-invoice-preview-error-title = Eksempel på faktura ikke fundet
sub-invoice-preview-error-text = Eksempel på faktura ikke fundet for dette abonnement

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Vil du fortsætte med at bruge { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Din adgang til { $name } vil fortsætte, og din faktureringsperiode
    og betaling vil forblive den samme. Din næste opkrævning er på
    { $amount } og vil blive trukket den { $endDate } på dit kort, der ender på { $last }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Din adgang til { $name } vil fortsætte, og din faktureringsperiode
    og betaling vil forblive den samme. Din næste opkrævning er på
    { $amount } og vil blive trukket den { $endDate }.
reactivate-confirm-button = Abonner igen

## $date (Date) - Last day of product access

reactivate-panel-copy = Du vil miste adgangen til { $name } den <strong>{ $date }</strong>.
reactivate-success-copy = Tak! Du er klar.
reactivate-success-button = Luk

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Køb i appen
sub-iap-item-apple-purchase-2 = { -brand-apple }: Køb i appen
sub-iap-item-manage-button = Håndter
