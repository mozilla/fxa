# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Kontuaren hasiera-orria
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Promozio kodea aplikatuta
coupon-submit = Aplikatu
coupon-remove = Kendu
coupon-error = Sartu duzun kodea iraungita dago edo baliogabea da.
coupon-error-generic = Errore bat gertatu da kodea prozesatzen. Mesedez, saiatu berriro.
coupon-error-expired = Sartu duzun kodea iraungi egin da.
coupon-error-limit-reached = Sartu duzun kodea bere mugara iritsi da.
coupon-error-invalid = Sartu duzun kodea baliogabea da.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Sartu kodea

## Component - Fields

default-input-error = Eremu hau beharrezkoa da
input-error-is-required = { $label } beharrezkoa da

## Component - Header

brand-name-mozilla-logo = { -brand-mozilla } logoa

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Jada badaukazu { -product-mozilla-account }? <a>Hasi saioa</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Idatzi zure helbide elektronikoa
new-user-confirm-email =
    .label = Berretsi helbide elektronikoa
new-user-subscribe-product-updates-mozilla = { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut.
new-user-subscribe-product-updates-snp = { -brand-mozilla } segurtasun eta pribatutasun albisteak eta eguneraketak jaso nahi ditut.
new-user-subscribe-product-updates-hubs = { -product-mozilla-hubs } eta { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut.
new-user-subscribe-product-updates-mdnplus = { -product-mdn-plus } eta { -brand-mozilla } produktuen berri eta eguneraketak jaso nahi ditut
new-user-subscribe-product-assurance = Zure posta elektronikoa zure kontua sortzeko soilik erabiltzen dugu. Ez diogu inoiz hirugarren bati salduko.
new-user-email-validate = Posta elektronikoa ez da baliozkoa
new-user-email-validate-confirm = Postak ez datoz bat.
new-user-already-has-account-sign-in = Dagoeneko kontu bat duzu. <a>Hasi saioa</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Helbidea gaizki idatzi duzu? { $domain } domeinuak ez du posta elektroniko zerbitzurik.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Eskerrik asko!
payment-confirmation-thanks-heading-account-exists = Eskerri asko, begiratu zure posta elektronikoa
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Berrespen-mezu bat bidali da { $email } helbidera, { $product_name } erabiltzen hasteko xehetasunekin.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = { $email } helbidean mezu elektroniko bat jasoko duzu zure kontua konfiguratzeko argibideekin, baita zure ordainketa xehetasunekin ere.
payment-confirmation-order-heading = Eskaeraren xehetasunak
payment-confirmation-invoice-number = Faktura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Ordainketa informazioa
payment-confirmation-amount = { $amount } { $interval }-(e)ro
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } egunero
       *[other] { $amount } { $intervalCount } egunetik behin
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } astero
       *[other] { $amount } { $intervalCount } astetik behin
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } hilero
       *[other] { $amount } { $intervalCount } hiletik behin
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } urtero
       *[other] { $amount } { $intervalCount } urtetik behin
    }
payment-confirmation-download-button = Jarraitu deskargara

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Baimena ematen diot { -brand-mozilla }-ri nire ordainketa-metodoari kobratzeko erakutsitako zenbatekoa, <termsOfServiceLink>Zerbitzu-baldintzen arabera</termsOfServiceLink> eta <privacyNoticeLink>Pribatutasun-oharra</privacyNoticeLink>, nire harpidetza bertan behera utzi arte.
payment-confirm-checkbox-error = Hau osatu behar duzu aurrera egin aurretik

## Component - PaymentErrorView

payment-error-retry-button = Saiatu berriro
payment-error-manage-subscription-button = Kudeatu nire harpidetza

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Dagoeneko { $productName } harpidetza duzu { -brand-google } edo { -brand-apple } aplikazio denden bidez.
iap-upgrade-no-bundle-support = Ez dugu harpidetza hauetarako bertsio berritzea onartzen, baina laster egingo dugu.
iap-upgrade-contact-support = Produktu hau eskura dezakezu oraindik. Jarri laguntza-zerbitzuarekin laguntza lortzeko.
iap-upgrade-get-help-button = Lortu laguntza

## Component - PaymentForm

payment-name =
    .placeholder = Izen osoa
    .label = Zure txartelean agertzen den izena
payment-cc =
    .label = Zure txartela
payment-cancel-btn = Utzi
payment-update-btn = Eguneratu
payment-pay-btn = Ordaindu orain
payment-pay-with-paypal-btn-2 = Ordaindu { -brand-paypal } erabiliz
payment-validate-name-error = Idatzi zure izena

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla }-k { -brand-name-stripe } eta { -brand-paypal } erabiltzen ditu ordainketa seguruak izateko.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe }  pribatutasun politika </stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } pribatutasun politika</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla }-k { -brand-paypal } darabil ordainketa seguruak izateko.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } pribatutasun politika</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla }-k { -brand-name-stripe } darabil ordainketa seguruak izateko.
payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } pribatutasun politika</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Hautatu zure ordaiketa metodoa
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Lehenik eta behin zure harpidetza onartu beharko duzu

## Component - PaymentProcessing

payment-processing-message = Mesedez, itxaron ordainketa prozesatzen dugun bitartean…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = { $last4 }-z amaitzen den txartela

## Component - PayPalButton

pay-with-heading-paypal-2 = Ordaindu { -brand-paypal } erabiliz

## Component - PlanDetails

plan-details-header = Produktuaren xehetasuna
plan-details-list-price = Prezio zerrenda
plan-details-show-button = Erakutsi xehetasunak
plan-details-hide-button = Ezkutatu xehetasunak
plan-details-total-label = Guztira
plan-details-tax = Zergak eta Tasak

## Component - PlanErrorDialog

product-no-such-plan = Ez dago horrelako planik produktu honetarako.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } zerga
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } egunero
       *[other] { $priceAmount } { $intervalCount } egunetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } egunero
           *[other] { $priceAmount } { $intervalCount } egunetik behin
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } astero
       *[other] { $priceAmount } { $intervalCount } astetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } astero
           *[other] { $priceAmount } { $intervalCount } astetik behin
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } hilero
       *[other] { $priceAmount } { $intervalCount } hiletik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } hilero
           *[other] { $priceAmount } { $intervalCount } hiletik behin
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } urtero
       *[other] { $priceAmount } { $intervalCount } urtetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } urtero
           *[other] { $priceAmount } { $intervalCount } urtetik behin
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga egunero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } egunetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga egunero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } egunetik behin
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga astero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } astetik bahin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga astero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } astetik bahin
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga hilero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } hiletik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga hilero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } hiletik behin
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } zerga urtero
       *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } urtetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } zerga urtero
           *[other] { $priceAmount } + { $taxAmount } zerga { $intervalCount } urtetik behin
        }

## Component - SubscriptionTitle

subscription-create-title = Zure harpidetzaren ezarpenak
subscription-success-title = Harpidetza baieztapena
subscription-processing-title = Harpidetza baieztatzen…
subscription-error-title = Errorea harpidetza baieztatzen…
subscription-noplanchange-title = Harpidetza-planaren aldaketa ez da onartzen
subscription-iapsubscribed-title = Bazadude harpidetua
sub-guarantee = 30 eguneko dirua itzultzeko bermea

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Zerbitzuaren baldintzak
privacy = Pribatutasun-oharra
terms-download = Deskargatu baldintzak

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefoxeko kontuak
# General aria-label for closing modals
close-aria =
    .aria-label = Itxi leiho modala
settings-subscriptions-title = Harpidetzak
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Sustapen kodea

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } egunero
       *[other] { $amount } { $intervalCount } egunetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } egunero
           *[other] { $amount } { $intervalCount } egunetik behin
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } astero
       *[other] { $amount } { $intervalCount } astetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } astero
           *[other] { $amount } { $intervalCount } astetik behin
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } hilero
       *[other] { $amount } { $intervalCount } hiletik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } hilero
           *[other] { $amount } { $intervalCount } hiletik behin
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } urtero
       *[other] { $amount } { $intervalCount } urtetik behin
    }
    .title =
        { $intervalCount ->
            [one] { $amount } urtero
           *[other] { $amount } { $intervalCount } urtetik behin
        }

## Error messages

# App error dialog
general-error-heading = Aplikazioaren errore orokorra
basic-error-message = Zerbait oker joan da. Mesedez, berriro saiatu beranduago.
payment-error-1 = Hmm. Arazo bat izan da zure ordainketa baimentzean. Saiatu berriro edo jarri harremanetan txartelaren jaulkitzailearekin.
payment-error-2 = Hmm. Arazo bat izan da zure ordainketa baimentzean. Jarri harremanetan zure txartelaren jaulkitzailearekin.
payment-error-3b = Ustekabeko errore bat gertatu da ordainketa prozesatzen ari zaren bitartean. Saiatu berriro.
expired-card-error = Zure kreditu-txartela iraungi dela dirudi. Probatu beste txartel bat.
insufficient-funds-error = Zure txartelak funts nahikorik ez duela dirudi. Probatu beste txartel bat.
withdrawal-count-limit-exceeded-error = Badirudi transakzio honek zure kreditu-muga gaindituko duela. Probatu beste txartel bat.
charge-exceeds-source-limit = Badirudi transakzio honek zure eguneroko kreditu-muga gaindituko duela. Probatu beste txartel bat edo 24 ordu barru.
instant-payouts-unsupported = Badirudi zordunketa-txartela ez dagoela berehalako ordainketak egiteko konfiguratuta. Probatu beste zordunketa edo kreditu txartel bat.
duplicate-transaction = Hmm. Transakzio berdina bidali berri dela dirudi. Egiaztatu zure ordainketa-historia.
coupon-expired = Sustapen-kode hori iraungi dela dirudi.
card-error = Ezin izan da prozesatu zure transakzioa. Egiaztatu kreditu txartelaren informazioa eta saiatu berriro.
country-currency-mismatch = Harpidetza honen dibisak ez du balio ordainketarekin lotutako herrialderako.
currency-currency-mismatch = Barkatu. Ezin duzu txanpon/dibisa batetik bestera aldatu.
location-unsupported = Zure uneko kokapena ez da onartzen gure Zerbitzu-baldintzen arabera.
no-subscription-change = Barkatu. Ezin duzu zure harpidetza-plana aldatu.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Dagoeneko { $mobileAppStore } bidez harpidetuta zaude.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Sistemaren errore batek zure { $productName } erregistratzea huts egin du. Zure ordainketa-metodoa ez da kobratu. Mesedez, saiatu berriro.
fxa-post-passwordless-sub-error = Harpidetza berretsi da, baina berrespen orria ezin izan da kargatu. Mesedez, egiaztatu zure posta elektronikoa zure kontua konfiguratzeko.
newsletter-signup-error = Ez zaude erregistratuta produktuen eguneratze-mezu elektronikoetarako. Berriro saia zaitezke zure kontuaren ezarpenetan.
product-plan-error =
    .title = Arazoa planak kargatzerakoan
product-profile-error =
    .title = Arazoa profila kargatzerakoan
product-customer-error =
    .title = Arazoa bezeroa kargatzerakoan
product-plan-not-found = Ez da plana aurkitu
product-location-unsupported-error = Kokapen ez onartua

## Hooks - coupons

coupon-success = Zure plana automatikoki berrituko da zerrendako prezioan.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Zure plana automatikoki berrituko da { $couponDurationDate } ondoren zerrendako prezioan.

## Routes - Checkout - New user

new-user-step-1-2 = 1. sortu { -product-mozilla-account }
new-user-card-title = Sartu zure txartelaren informazioa
new-user-submit = Harpidetu orain

## Routes - Product and Subscriptions

sub-update-payment-title = Ordainketa informazioa

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Ordaindu txartelaz
product-invoice-preview-error-title = Arazoa faktura aurrebista kargatzerakoan
product-invoice-preview-error-text = Ezin da faktura aurrebista kargatu

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Ezin zaitugu oraindik berritu

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Berrikusi zure aldaketa
sub-change-failed = Plan aldaketak huts egin du
sub-update-acknowledgment =
    Zure plana berehala aldatuko da, eta proportzioan kobratuko dizugu
    zenbatekoa. gaurtik fakturazio-ziklo honen gainerako.  { $startingDate }
    hasita kopuru osoa kobratuko dizute.
sub-change-submit = Berretsi aldaketa
sub-update-current-plan-label = Uneko plana
sub-update-new-plan-label = Plan berria
sub-update-total-label = Guztira berria
sub-update-prorated-upgrade = Bertsio proportzionala

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (egunero)
sub-update-new-plan-weekly = { $productName } (astero)
sub-update-new-plan-monthly = { $productName } (hilero)
sub-update-new-plan-yearly = { $productName } (urtero)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Utzi harpidetza
sub-item-stay-sub = Jarraitu harpidetua

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Aurrerantzean ezin izango duzu { $name } erabili
    { $period }, fakturazio-zikloaren azken eguna.
sub-item-cancel-confirm =
    Bertan behera utzi dudan sarbidea eta gordetako informazioa
    { $name } { $period } egunean
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
sub-promo-coupon-applied = { $promotion_name } kupoia erabilita: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Harpidetza beraktibatzeak huts egin du
sub-route-idx-cancel-failed = Harpidetza bertan behera uzteak huts egin du
sub-route-idx-contact = Laguntza kontaktua
sub-route-idx-cancel-msg-title = Sentitzen dugu zu joaten ikusteak
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Zure { $name } harpidetza bertan behera utzi da.
          <br />
          { $name } sarbidea izango duzu oraindik { $date } arte.
sub-route-idx-cancel-aside-2 = Galderarik baduzu? Joan <a>{ -brand-mozilla } Laguntzara</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Arazoa bezeroa kargatzerakoan
sub-invoice-error =
    .title = Arazoa faktura kargatzerakoan
sub-billing-update-success = Zure fakturazio-informazioa behar bezala eguneratu da
sub-invoice-previews-error-title = Arazoa faktura aurrebistak kargatzerakoan
sub-invoice-previews-error-text = Ezin da faktura aurrebistak kargatu

## Routes - Subscription - ActionButton

pay-update-change-btn = Aldatu
pay-update-manage-btn = Kudeatu

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Hurrengo fakturazioa { $date }
sub-expires-on = Iraungitze data: { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Iraungitzea { $expirationDate }
sub-route-idx-updating = Fakturazio-informazioa eguneratzen…
sub-route-payment-modal-heading = Fakturazio-informazio baliogabea
sub-route-payment-modal-message-2 = Errore bat dagoela dirudi zure { -brand-paypal } kontuarekin, ordainketa-arazo hau konpontzeko beharrezko urratsak eman behar dituzu.
sub-route-missing-billing-agreement-payment-alert = Ordainketa-informazio baliogabea; errore bat dago zure kontuarekin. <div>Kudeatu</div>
sub-route-funding-source-payment-alert = Ordainketa-informazio baliogabea; errore bat dago zure kontuarekin. Baliteke alerta hau denbora pixka bat behar izatea garbitzeko zure informazioa behar bezala eguneratu ondoren. <div>Kudeatu</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Ez dago horrelako planik harpidetza honetarako.
invoice-not-found = Ez da ondorengo faktura aurkitu
sub-item-no-such-subsequent-invoice = Ez da aurkitu harpidetza honen ondorengo faktura.
sub-invoice-preview-error-title = Ez da fakturen aurrebista aurkitu
sub-invoice-preview-error-text = Ez da aurkitu harpidetza honetarako fakturen aurrebista

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = { $name } erabiltzen jarraitu nahi duzu?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    { $name }-rako sarbidea jarraituko du eta fakturazio-zikloa 
    eta ordainketa berdin jarraituko du. Zure hurrengo kargua  { $amount } izango da
    { $last }-z amaitzen den txartelean { $endDate } datan.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    { $name }-rako sarbidea jarraituko du eta fakturazio-zikloa 
    eta ordainketa berdin jarraituko du. Zure hurrengo kargua 
    { $amount } izango da { $endDate } datan.
reactivate-confirm-button = Harpidetza berritu

## $date (Date) - Last day of product access

reactivate-panel-copy = { $name }rako sarbidea galduko duzu <strong>{ $date }</strong> egunean.
reactivate-success-copy = Eskerrik asko! Dena prest daukazu.
reactivate-success-button = Itxi

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: aplikazioko erosketa
sub-iap-item-apple-purchase-2 = { -brand-apple }: aplikazioko erosketa
sub-iap-item-manage-button = Kudeatu
