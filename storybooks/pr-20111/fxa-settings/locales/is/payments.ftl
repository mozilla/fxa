# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Forsíða reiknings
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Kynningarkóði notaður
coupon-submit = Virkja
coupon-remove = Fjarlægja
coupon-error = Kóðinn sem þú settir inn er ógildur eða útrunninn.
coupon-error-generic = Villa kom upp við vinnslu kóðans. Reyndu aftur.
coupon-error-expired = Kóðinn sem þú settir inn er útrunninn.
coupon-error-limit-reached = Kóðinn sem þú settir inn hefur náð takmörkum sínum.
coupon-error-invalid = Kóðinn sem þú settir inn er ógildur.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Settu inn kóða

## Component - Fields

default-input-error = Þessi reitur er nauðsynlegur
input-error-is-required = { $label } er nauðsynlegt

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } táknmerki

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Ertu nú þegar með { -product-mozilla-account }? <a>Skráðu þig inn</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Settu inn tölvupóstfangið þitt
new-user-confirm-email =
    .label = Staðfestu tölvupóstfangið þitt
new-user-subscribe-product-updates-mozilla = Ég myndi vilja fá upplýsingar um hugbúnað og uppfærslur frá { -brand-mozilla }
new-user-subscribe-product-updates-snp = Ég myndi vilja fá fréttir um öryggismál og friðhelgi frá { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Ég myndi vilja fá upplýsingar um hugbúnað og uppfærslur frá { -product-mozilla-hubs } og { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Ég myndi vilja fá upplýsingar um hugbúnað og uppfærslur frá { -product-mdn-plus } og { -brand-mozilla }
new-user-subscribe-product-assurance = Við notum aðeins tölvupóstfangið þitt til að búa til reikninginn þinn. Við munum aldrei selja það til utanaðkomandi aðila.
new-user-email-validate = Tölvupóstfangið er ekki gilt
new-user-email-validate-confirm = Tölvupóstföngin passa ekki saman
new-user-already-has-account-sign-in = Þú ert nú þegar með reikning. <a>Skráðu þig inn</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Rangt skrifað tölvupóstfang? { $domain } býður ekki upp á tölvupóstþjónustu.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Þakka þér fyrir!
payment-confirmation-thanks-heading-account-exists = Takk, athugaðu nú tölvupóstinn þinn!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Staðfestingartölvupóstur hefur verið sendur á { $email } með upplýsingum um hvernig eigi að komast í gang með { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Þú munt fá tölvupóst á { $email } með leiðbeiningum um uppsetningu á reikningnum þínum, sem og greiðsluupplýsingum þínum.
payment-confirmation-order-heading = Upplýsingar um pöntun
payment-confirmation-invoice-number = Reikningur #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Greiðsluupplýsingar
payment-confirmation-amount = { $amount } á { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } á dag
       *[other] { $amount } á { $intervalCount } daga fresti
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } á viku
       *[other] { $amount } á { $intervalCount } vikna fresti
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } á mánuði
       *[other] { $amount } á { $intervalCount } mánaða fresti
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } á ári
       *[other] { $amount } á { $intervalCount } ára fresti
    }
payment-confirmation-download-button = Halda áfram í niðurhal

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Ég heimila hér með { -brand-mozilla } að millifæra tilgreinda upphæð af greiðslumátanum mínum, samkvæmt <termsOfServiceLink >þjónustuskilmálum</termsOfServiceLink> og <privacyNoticeLink>stefnu um meðferð persónuupplýsinga</privacyNoticeLink>, þar til ég segi upp áskriftinni.
payment-confirm-checkbox-error = Þú þarft að ljúka þessu áður en þú heldur áfram

## Component - PaymentErrorView

payment-error-retry-button = Reyndu aftur
payment-error-manage-subscription-button = Sýsla með áskriftina mína

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Þú ert nú þegar með { $productName }-áskrift í gegnum { -brand-google } eða { -brand-apple } forritaverslanir.
iap-upgrade-no-bundle-support = Við styðjum ekki uppfærslur fyrir þessar áskriftir, en munum gera það fljótlega.
iap-upgrade-contact-support = Þú getur samt fengið þennan hugbúnað - hafðu samband við aðstoðargáttina svo við getum hjálpað þér.
iap-upgrade-get-help-button = Fá aðstoð

## Component - PaymentForm

payment-name =
    .placeholder = Fullt nafn
    .label = Nafn þitt eins og það birtist á greiðslukortinu
payment-cc =
    .label = Kortið þitt
payment-cancel-btn = Hætta við
payment-update-btn = Uppfæra
payment-pay-btn = Greiða núna
payment-pay-with-paypal-btn-2 = Greiða með { -brand-paypal }
payment-validate-name-error = Settu inn nafnið þitt

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } notar { -brand-name-stripe } og { -brand-paypal }fyrir örugga vinnslu greiðslna.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } persónuverndarstefna</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } persónuverndarstefna</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } notar { -brand-paypal } fyrir örugga vinnslu greiðslna.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } persónuverndarstefna</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } notar { -brand-name-stripe } fyrir örugga vinnslu greiðslna.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } persónuverndarstefna</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Veldu greiðslumáta þinn
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Fyrst þarftu að samþykkja áskriftina þína

## Component - PaymentProcessing

payment-processing-message = Hinkraðu við á meðan við meðhöndlum greiðsluna þína…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Kort sem endar á { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Greiða með { -brand-paypal }

## Component - PlanDetails

plan-details-header = Upplýsingar um vöru
plan-details-list-price = Listaverð
plan-details-show-button = Sjá nánari upplýsingar
plan-details-hide-button = Fela ítarupplýsingar
plan-details-total-label = Samtals
plan-details-tax = Skattar og gjöld

## Component - PlanErrorDialog

product-no-such-plan = Engin slík áskriftarleið fyrir þennan hugbúnað/þjónustu.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } skattur
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } á dag
       *[other] { $priceAmount } á { $intervalCount } daga fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } á dag
           *[other] { $priceAmount } á { $intervalCount } daga fresti
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } á viku
       *[other] { $priceAmount } á { $intervalCount } vikna fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } á viku
           *[other] { $priceAmount } á { $intervalCount } vikna fresti
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } á mánuði
       *[other] { $priceAmount } á { $intervalCount } mánaða fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } á mánuði
           *[other] { $priceAmount } á { $intervalCount } mánaða fresti
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } á { $intervalCount } ári
       *[other] { $priceAmount } á { $intervalCount } ára fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } á { $intervalCount } ári
           *[other] { $priceAmount } á { $intervalCount } ára fresti
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skattur á dag
       *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } daga fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skattur á dag
           *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } daga fresti
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skattur á viku
       *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } vikna fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skattur á viku
           *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } vikna fresti
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skattur á mánuði
       *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } mánaða fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skattur á mánuði
           *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } mánaða fresti
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } skattur á ári
       *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } ára fresti
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } skattur á ári
           *[other] { $priceAmount } + { $taxAmount } skattur á { $intervalCount } ára fresti
        }

## Component - SubscriptionTitle

subscription-create-title = Settu upp áskriftina þína
subscription-success-title = Staðfesting áskriftar
subscription-processing-title = Staðfesti áskrift…
subscription-error-title = Villa við að staðfesta áskrift…
subscription-noplanchange-title = Þessi breyting áskriftarleiða er ekki studd
subscription-iapsubscribed-title = Nú þegar áskrifandi
sub-guarantee = 30-daga skilafrestur

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Þjónustuskilmálar
privacy = Meðferð persónuupplýsinga
terms-download = Sækja skilmála

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox reikningar
# General aria-label for closing modals
close-aria =
    .aria-label = Loka glugga
settings-subscriptions-title = Áskriftir
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Kynningarkóði

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } á dag
       *[other] { $amount } á { $intervalCount } daga fresti
    }
    .title =
        { $intervalCount ->
            [one] { $amount } á dag
           *[other] { $amount } á { $intervalCount } daga fresti
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } á viku
       *[other] { $amount } á { $intervalCount } vikna fresti
    }
    .title =
        { $intervalCount ->
            [one] { $amount } á viku
           *[other] { $amount } á { $intervalCount } vikna fresti
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } á mánuði
       *[other] { $amount } á { $intervalCount } mánaða fresti
    }
    .title =
        { $intervalCount ->
            [one] { $amount } á mánuði
           *[other] { $amount } á { $intervalCount } mánaða fresti
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } á ári
       *[other] { $amount } á { $intervalCount } ára fresti
    }
    .title =
        { $intervalCount ->
            [one] { $amount } á ári
           *[other] { $amount } á { $intervalCount } ára fresti
        }

## Error messages

# App error dialog
general-error-heading = Almenn forritsvilla
basic-error-message = Eitthvað fór úrskeiðis. Reyndu aftur síðar.
payment-error-1 = Hmm. Vandamál kom upp við að heimila greiðsluna þína. Reyndu aftur eða hafðu samband við útgefanda kortsins.
payment-error-2 = Hmm. Vandamál kom upp við að heimila greiðsluna þína. Hafðu samband við útgefanda kortsins.
payment-error-3b = Óvænt villa kom upp við vinnslu greiðslunnar þinnar, reyndu aftur.
expired-card-error = Það lítur út fyrir að greiðslukortið þitt sé útrunnið. Prófaðu annað kort.
insufficient-funds-error = Það lítur út fyrir að kortið þitt sé ekki með nægilega inneign. Prófaðu annað kort.
withdrawal-count-limit-exceeded-error = Það lítur út fyrir að þessi færsla muni fara fram yfir úttektarheimildina þína. Prófaðu annað kort.
charge-exceeds-source-limit = Það lítur út fyrir að þessi færsla muni fara fram yfir daglegu úttektarheimildina þína. Prófaðu annað kort eða eftir 24 tíma.
instant-payouts-unsupported = Svo virðist sem debetkortið þitt sé ekki sett upp fyrir skyndigreiðslur. Prófaðu annað debet- eða kreditkort.
duplicate-transaction = Hmm. Það lítur út fyrir að sams konar færsla hafi þegar verið send. Athugaðu greiðsluferilinn þinn.
coupon-expired = Það lítur út fyrir að þessi tilboðskóði sé útrunninn.
card-error = Ekki tókst að vinna úr færslunni þinni. Staðfestu greiðslukortaupplýsingarnar þínar og reyndu aftur.
country-currency-mismatch = Gjaldmiðill þessarar áskriftar gildir ekki fyrir landið sem tengist greiðslunni þinni.
currency-currency-mismatch = Því miður. Þú getur ekki skipt á milli gjaldmiðla.
location-unsupported = Núverandi staðsetning þín er ekki studd samkvæmt þjónustuskilmálum okkar.
no-subscription-change = Því miður. Þú getur ekki breytt áskriftarleiðinni þinni.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Þú ert nú þegar áskrifandi í gegnum { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Kerfisvilla olli því að skráningin þín fyrir { $productName } mistókst. Greiðslumáti þinn hefur ekki verið gjaldfærður. Reyndu aftur.
fxa-post-passwordless-sub-error = Áskriftin er staðfest, en ekki tókst að hlaða inn staðfestingarsíðunni. Athugaðu tölvupóstinn þinn til að setja upp reikninginn þinn.
newsletter-signup-error = Þú ert ekki skráður fyrir póstum um uppfærslur á hugbúnaði/þjónustum. Þú getur reynt aftur í stillingum reikningsins þíns.
product-plan-error =
    .title = Vandamál við að hlaða inn áskriftarleiðum
product-profile-error =
    .title = Vandamál við að hlaða inn notandasniði
product-customer-error =
    .title = Vandamál við að hlaða inn viðskiptavini
product-plan-not-found = Áskriftarleið fannst ekki
product-location-unsupported-error = Staðsetning ekki studd

## Hooks - coupons

coupon-success = Áskriftarleiðin þín mun sjálfkrafa endurnýjast á listaverði.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Áskriftin þín endurnýjast sjálfkrafa eftir { $couponDurationDate } á listaverði.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Búðu til { -product-mozilla-account }
new-user-card-title = Settu inn kortaupplýsingarnar þínar
new-user-submit = Gerast áskrifandi núna

## Routes - Product and Subscriptions

sub-update-payment-title = Greiðsluupplýsingar

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Borga með greiðslukorti
product-invoice-preview-error-title = Vandamál við að hlaða inn forskoðun á greiðsluseðli
product-invoice-preview-error-text = Ekki tókst að hlaða inn forskoðun á greiðsluseðli

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Við getum ekki ennþá uppfært fyrir þig

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } forritaverslun
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Farðu yfir breytinguna þína
sub-change-failed = Breyting á áskriftarleið mistókst
sub-update-acknowledgment =
    Áskriftarleiðin þín mun breytast strax og þú færð kröfu um leiðrétta
    upphæð fyrir það sem eftir er af greiðslutímabilinu þínu. Frá og með 
    { $startingDate } færð þú kröfu um alla upphæðina.
sub-change-submit = Staðfesta breytingu
sub-update-current-plan-label = Núverandi áskriftarleið
sub-update-new-plan-label = Ný áskriftarleið
sub-update-total-label = Ný heildarupphæð
sub-update-prorated-upgrade = Leiðrétt uppfærsla

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (daglega)
sub-update-new-plan-weekly = { $productName } (vikulega)
sub-update-new-plan-monthly = { $productName } (mánaðarlega)
sub-update-new-plan-yearly = { $productName } (árlega)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Hætta áskrift
sub-item-stay-sub = Halda áskrift áfram

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Þú munt ekki lengur geta notað { $name } eftir
    { $period }, síðasta dag greiðslutímabilsins.
sub-item-cancel-confirm =
    Hætta við aðgang minn og vistaðar upplýsingar mínar innan
    { $name } þann { $period }
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
sub-promo-coupon-applied = { $promotion_name } afsláttarkóði notaður: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Mistókst að endurvirkja áskrift
sub-route-idx-cancel-failed = Mistókst að segja upp áskrift
sub-route-idx-contact = Hafa samband við aðstoðarteymi
sub-route-idx-cancel-msg-title = Okkur þykir miður að þú sért á förum
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    { $name } áskriftinni þinni hefur verið sagt upp.
          <br />
          Þú munt áfram hafa aðgang að { $name } til { $date }.
sub-route-idx-cancel-aside-2 = Ertu með spurningar? Farðu á <a>{ -brand-mozilla } aðstoðargáttina</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Vandamál við að hlaða inn viðskiptavini
sub-invoice-error =
    .title = Vandamál við að hlaða inn greiðsluseðlum
sub-billing-update-success = Innheimtuupplýsingarnar þínar hafa verið uppfærðar
sub-invoice-previews-error-title = Vandamál við að hlaða inn forskoðun á greiðsluseðlum
sub-invoice-previews-error-text = Ekki tókst að hlaða inn forskoðun á greiðsluseðlum

## Routes - Subscription - ActionButton

pay-update-change-btn = Breyta
pay-update-manage-btn = Stjórna

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Næst innheimt { $date }
sub-expires-on = Rennur út { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Rennur út { $expirationDate }
sub-route-idx-updating = Uppfæri greiðsluupplýsingar…
sub-route-payment-modal-heading = Ógildar greiðsluupplýsingar
sub-route-payment-modal-message-2 = Það virðist vera villa varðandi { -brand-paypal }-reikninginn þinn, við þurfum að gera nauðsynlegar ráðstafanir til að leysa þetta greiðsluvandamál.
sub-route-missing-billing-agreement-payment-alert = Ógildar greiðsluupplýsingar; það er villa varðandi reikninginn þinn. <div>Sýsla með upplýsingarnar</div>
sub-route-funding-source-payment-alert = Ógildar greiðsluupplýsingar; það er villa varðandi reikninginn þinn. Það getur tekið nokkurn tíma að hreinsa út þessa viðvörun eftir að þú hefur uppfært upplýsingarnar þínar. <div>Sýsla með upplýsingarnar</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Engin slík áskriftarleið fyrir þessa áskrift.
invoice-not-found = Næsti greiðsluseðill fannst ekki
sub-item-no-such-subsequent-invoice = Næsti greiðsluseðill fannst ekki fyrir þessa áskrift.
sub-invoice-preview-error-title = Forskoðun greiðsluseðils fannst ekki
sub-invoice-preview-error-text = Forskoðun greiðsluseðils fyrir þessa áskrift fannst ekki

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Viltu halda áfram að nota { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Aðgangur þinn að { $name } mun halda áfram og innheimtutímabilið þitt
    og greiðsla verður óbreytt. Næsta gjaldfærsla verður
    { $amount } á kortið sem endar á { $last } þann { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Aðgangur þinn að { $name } mun halda áfram og innheimtutímabilið þitt
    og greiðsla verður óbreytt. Næsta gjaldfærsla verður
    { $amount } þann { $endDate }.
reactivate-confirm-button = Gerast áskrifandi aftur

## $date (Date) - Last day of product access

reactivate-panel-copy = Þú munt missa aðgang að { $name } þann <strong>{ $date }</strong>.
reactivate-success-copy = Takk! Nú er allt tilbúið.
reactivate-success-button = Loka

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Innkaup í forriti
sub-iap-item-apple-purchase-2 = { -brand-apple }: Innkaup í forriti
sub-iap-item-manage-button = Stjórna
