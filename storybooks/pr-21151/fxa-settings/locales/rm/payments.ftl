# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Pagina principala dal conto
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Applitgà il code da promoziun
coupon-submit = Applitgar
coupon-remove = Allontanar
coupon-error = Il code che ti has endatà è nunvalid u scadì.
coupon-error-generic = Ina errur è succedida cun elavurar il code. Reempruvar per plaschair.
coupon-error-expired = Il code endatà è scrudà.
coupon-error-limit-reached = Il code endatà ha cuntanschì sia limita.
coupon-error-invalid = Il code endatà è nunvalid.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Endatescha il code

## Component - Fields

default-input-error = Quest champ è obligatoric
input-error-is-required = { $label } è obligatoric

## Component - Header

brand-name-mozilla-logo = Logo da { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Has ti gia in { -product-mozilla-account }? <a>T'annunzia</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Endatescha tia adressa dad e-mail
new-user-confirm-email =
    .label = Confermar tes e-mail
new-user-subscribe-product-updates-mozilla = Jau vi retschaiver novitads davart products ed autras novas da { -brand-mozilla }
new-user-subscribe-product-updates-snp = Jau vi retschaiver novitads davart segirezza e protecziun da datas ed autras novas da { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Jau vi retschaiver novitads davart products ed autras novas da { -product-mozilla-hubs } e { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Jau vi retschaiver novitads davart products ed autras novas da { -product-mdn-plus } e { -brand-mozilla }
new-user-subscribe-product-assurance = Nus duvrain tia adressa dad e-mail mo per crear tes conto. Nus na la vendain mai a terzas partidas.
new-user-email-validate = L'e-mail n'è betg valid
new-user-email-validate-confirm = Las adressas na correspundan betg
new-user-already-has-account-sign-in = Ti has gia in conto. <a>T'annunzia</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Sbagl da tippar en l'adressa? { $domain } na porscha nagin servetsch dad e-mail.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Grazia fitg!
payment-confirmation-thanks-heading-account-exists = Grazia, controllescha ussa tes e-mails!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = In e-mail da conferma è vegnì tramess a { $email } cun infurmaziuns per ils emprims pass cun { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Ti retschaivas in e-mail sin { $email } cun instrucziuns per endrizzar tes conto, sco era tias datas da pajament.
payment-confirmation-order-heading = Detagls da l'empustaziun
payment-confirmation-invoice-number = Quint nr. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Infurmaziuns da pajament
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } per di
       *[other] { $amount } mintga { $intervalCount } dis
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } per emna
       *[other] { $amount } mintga { $intervalCount } emnas
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } per mais
       *[other] { $amount } mintga { $intervalCount } mais
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } per onn
       *[other] { $amount } mintga { $intervalCount } onns
    }
payment-confirmation-download-button = Vinavant a la telechargiada

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Jau permet a { -brand-mozilla } da debitar cun mia metoda da pajament l'import mussà, confurm a las <termsOfServiceLink>cundiziuns d'utilisaziun</termsOfServiceLink> e las <privacyNoticeLink>directivas per la protecziun da datas</privacyNoticeLink>, enfin che jau annullesch mes abunament.
payment-confirm-checkbox-error = Ti stos acceptar quai per pudair cuntinuar

## Component - PaymentErrorView

payment-error-retry-button = Reempruvar
payment-error-manage-subscription-button = Administrar mes abunament

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Ti has gia in abunament da { $productName } via l'app store da { -brand-google } u { -brand-apple }
iap-upgrade-no-bundle-support = Nus n'offrin anc nagins upgrades per quests abunaments, ma vegnin prest a far quai.
iap-upgrade-contact-support = Ti pos tuttina survegnir quest product – contactescha per plaschair il support per che nus pudain ta gidar.
iap-upgrade-get-help-button = Ir per agid

## Component - PaymentForm

payment-name =
    .placeholder = Num cumplet
    .label = Num sco quai ch'el è scrit sin la carta
payment-cc =
    .label = Tia carta
payment-cancel-btn = Interrumper
payment-update-btn = Actualisar
payment-pay-btn = Pajar ussa
payment-pay-with-paypal-btn-2 = Pajar cun { -brand-paypal }
payment-validate-name-error = Endatescha per plaschair tes num

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } utilisescha { -brand-name-stripe } e { -brand-paypal } per l'elavuraziun segira da pajaments.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Directivas da la protecziun da datas da { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>directivas da la protecziun da datas da { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } utilisescha { -brand-paypal } per l'elavuraziun segira da pajaments.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Directivas per la protecziun da datas da { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } utilisescha { -brand-name-stripe } per l'elavuraziun segira da pajaments.
payment-legal-link-stripe-3 = <stripePrivacyLink>Directivas da la protecziun da datas da { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Tscherna tia metoda da pajament
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = L'emprim stos ti approvar tes abunament

## Component - PaymentProcessing

payment-processing-message = Spetgar per plaschair fertant che nus elavurain il pajament…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Carta che chala cun { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Pajar cun { -brand-paypal }

## Component - PlanDetails

plan-details-header = Detagls dal product
plan-details-list-price = Pretsch da catalog
plan-details-show-button = Mussar ils detagls
plan-details-hide-button = Zuppentar ils detagls
plan-details-total-label = Total
plan-details-tax = Taglias e taxas

## Component - PlanErrorDialog

product-no-such-plan = Nagin abunament correspundent per quest product.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } taglia
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } mintga di
       *[other] { $priceAmount } mintga { $intervalCount } dis
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mintga di
           *[other] { $priceAmount } mintga { $intervalCount } dis
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } mintg'emna
       *[other] { $priceAmount } mintga { $intervalCount } emnas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mintg'emna
           *[other] { $priceAmount } mintga { $intervalCount } emnas
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } mintga mais
       *[other] { $priceAmount } mintga { $intervalCount } mais
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mintga mais
           *[other] { $priceAmount } mintga { $intervalCount } mais
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } mintg'onn
       *[other] { $priceAmount } mintga { $intervalCount } onns
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mintg'onn
           *[other] { $priceAmount } mintga { $intervalCount } onns
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taxas mintga di
       *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } dis
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxas mintga di
           *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } dis
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taxas mintg'emna
       *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } emnas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxas mintg'emna
           *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } emnas
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taxas mintga mais
       *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } mais
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxas mintga mais
           *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } mais
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } taxas mintg'onn
       *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } onns
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } taxas mintg'onn
           *[other] { $priceAmount } + { $taxAmount } taxas mintga { $intervalCount } onns
        }

## Component - SubscriptionTitle

subscription-create-title = Configurescha tes abunament
subscription-success-title = Conferma da l'abunament.
subscription-processing-title = Confermar l'abunament…
subscription-error-title = Errur cun confermar l'abunament…
subscription-noplanchange-title = La midada da quest plan d'abunaments na vegn betg sustegnida
subscription-iapsubscribed-title = Gia abunà
sub-guarantee = Garanzia da restituziun da 30 dis

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Cundiziuns d'utilisaziun
privacy = Infurmaziuns davart la protecziun da datas
terms-download = Telechargiar las cundiziuns

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Contos da Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Serrar il dialog
settings-subscriptions-title = Abunaments
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Code da promoziun

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } mintga di
       *[other] { $amount } mintga { $intervalCount } dis
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mintga di
           *[other] { $amount } mintga { $intervalCount } dis
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } mintg'emna
       *[other] { $amount } mintga { $intervalCount } emnas
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mintg'emna
           *[other] { $amount } mintga { $intervalCount } emnas
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } mintga mais
       *[other] { $amount } mintga { $intervalCount } mais
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mintga mais
           *[other] { $amount } mintga { $intervalCount } mais
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } mintg'onn
       *[other] { $amount } mintga { $intervalCount } onns
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mintg'onn
           *[other] { $amount } mintga { $intervalCount } onns
        }

## Error messages

# App error dialog
general-error-heading = Errur generala da l'applicaziun
basic-error-message = Insatge è ì mal. Emprova per plaschair pli tard anc ina giada.
payment-error-1 = Hm. Igl ha dà in problem cun autorisar tes pajament. Emprova anc ina giada u contactescha l'emittent da tia carta.
payment-error-2 = Hm. Igl ha dà in problem cun autorisar tes pajament. Contactescha l'emittent da tia carta.
payment-error-3b = Ina errur nunspetgada è succedida durant l'elavuraziun da tes pajament, emprova per plaschair anc ina giada.
expired-card-error = I para che tia carta da credit saja scadida. Emprova cun in'autra carta.
insufficient-funds-error = I para ch'il credit da tia carta na saja betg suffizient. Emprova cun in'autra carta.
withdrawal-count-limit-exceeded-error = I para che questa transacziun surpassia la limita da credit da tia carta. Emprova cun in'autra carta.
charge-exceeds-source-limit = I para che questa transacziun surpassia la limita da credit quotidiana da tia carta. Emprova cun in'autra carta u en 24 uras.
instant-payouts-unsupported = I para che tia carta da debit na saja betg configurada per pajaments immediats. Emprova cun in'autra carta da debit u da credit.
duplicate-transaction = Hm. I para ch'ina transacziun identica saja gist vegnida tramessa. Controllescha tes extract dal conto.
coupon-expired = I para che quest code da promoziun saja scadì.
card-error = Impussibel dad elavurar tia transacziun. Verifitgescha per plaschair las datas da tia carta da credit ed emprova anc ina giada.
country-currency-mismatch = La valuta da quest abunament n'è betg valida per il pajais associà cun tes pajament.
currency-currency-mismatch = Perstgisa, ti na pos betg midar tranter valutas.
location-unsupported = Tia posiziun actuala na vegn betg sustegnida segund nossas cundiziuns d’utilisaziun.
no-subscription-change = Perstgisa. Ti na pos betg midar tes plan d'abunaments.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Ti has gia in abunament via l'{ $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Ina errur dal sistem ha gì per consequenza ch'i n'è betg reussì dad abunar { $productName }. Tia metoda da pajament n'è betg vegnida debitada. Emprova per plaschair anc ina giada.
fxa-post-passwordless-sub-error = Tes abunament è confermà, ma i n'è betg reussì da chargiar la pagina da conferma. Controllescha per plaschair tes e-mails per endrizzar tes conto.
newsletter-signup-error = Ti n'has betg abunà e-mails davart actualisaziuns dal product. Ti pos anc empruvar ina giada en ils parameters da tes conto.
product-plan-error =
    .title = Problem cun chargiar ils plans
product-profile-error =
    .title = Problem cun chargiar il profil
product-customer-error =
    .title = Problem cun chargiar il client
product-plan-not-found = Betg chattà il plan
product-location-unsupported-error = Posiziun betg sustegnida

## Hooks - coupons

coupon-success = Tes plan vegn renovà automaticamain cun il pretsch da catalog.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Tes plan vegn renovà automaticamain suenter ils { $couponDurationDate } tenor il pretsch da catalog.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Creescha in { -product-mozilla-account }
new-user-card-title = Endatescha las infurmaziuns da tia carta
new-user-submit = Abunar ussa

## Routes - Product and Subscriptions

sub-update-payment-title = Infurmaziuns da pajament

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Pajar cun la carta
product-invoice-preview-error-title = Problem cun chargiar la prevista dal quint
product-invoice-preview-error-text = Impussibel da chargiar la prevista dal quint

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Anc n'è l'upgrade betg pussaivel

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Controllescha tia midada
sub-change-failed = Midada dal plan betg reussida
sub-update-acknowledgment =
    Tes plan vegn immediat midà ed i vegn debità oz ina summa proporziunala
    per il rest da tes ciclus da facturaziun. A partir dals { $startingDate }
    vegn debità l'entir import.
sub-change-submit = Confermar la midada
sub-update-current-plan-label = Plan actual
sub-update-new-plan-label = Nov plan
sub-update-total-label = Nov total
sub-update-prorated-upgrade = Midada cun custs calculads proporziunalmain

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (mintga di)
sub-update-new-plan-weekly = { $productName } (emnil)
sub-update-new-plan-monthly = { $productName } (mensil)
sub-update-new-plan-yearly = { $productName } (annual)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Annullar l'abunament
sub-item-stay-sub = Tegnair l'abunament

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Ti na vegns betg pli a pudair utilisar { $name } suenter
    ils { $period }, l'ultim di da tes ciclus da facturaziun.
sub-item-cancel-confirm =
    Annullar mes access e stizzar mias infurmaziuns memorisadas en
    { $name } ils { $period }
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
sub-promo-coupon-applied = Applitgà il bon { $promotion_name }: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Reactivaziun da l'abunament betg reussida
sub-route-idx-cancel-failed = Annullaziun da l'abunament betg reussida
sub-route-idx-contact = Contactar l'agid
sub-route-idx-cancel-msg-title = Igl ans displascha che ti vas
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Tes abunament da { $name } è vegnì annullà.
          <br />
          Ti has anc access a { $name } enfin ils { $date }.
sub-route-idx-cancel-aside-2 = Has ti dumondas? Visita <a>l'agid da { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problem cun chargiar il client
sub-invoice-error =
    .title = Problem cun chargiar quints
sub-billing-update-success = Actualisà cun success tias infurmaziuns da facturaziun
sub-invoice-previews-error-title = Problem cun chargiar las previstas dals quints
sub-invoice-previews-error-text = Impussibel da chargiar las previstas dals quints

## Routes - Subscription - ActionButton

pay-update-change-btn = Midar
pay-update-manage-btn = Administrar

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Proxima facturaziun ils { $date }
sub-expires-on = Scada ils { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Scadenza: { $expirationDate }
sub-route-idx-updating = Actualisar las infurmaziuns per la facturaziun…
sub-route-payment-modal-heading = Infurmaziuns da facturaziun nunvalidas
sub-route-payment-modal-message-2 = I para ch'i dettia ina errur cun tes conto da { -brand-paypal }. Ti stos instradar ils pass necessaris per schliar quest problem cun il pajament.
sub-route-missing-billing-agreement-payment-alert = Infurmaziun da pajament nunvalida. Igl è succedida ina errur cun tes conto. <div>Administrar</div>
sub-route-funding-source-payment-alert = Infurmaziuns da pajament nunvalidas. Igl è succedida ina errur cun tes conto. I po cuzzar in mument enfin che quest avis svanescha suenter l'actualisaziun da tias infurmaziuns. <div>Administrar</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Nagin plan correspundent per quest product.
invoice-not-found = Betg chattà il proxim quint
sub-item-no-such-subsequent-invoice = Betg chattà il proxim quint per quest abunament.
sub-invoice-preview-error-title = Betg chattà la prevista dal quint
sub-invoice-preview-error-text = Betg chattà la prevista dal quint per quest abunament

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Vuls ti vinavant utilisar { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Tes access a { $name } cuntinuescha e tes ciclus da facturaziun e
    pajament vegn a restar il medem. Tia proxima debitaziun da la carta
    che chala cun { $last } munta a { $amount } e succeda ils { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Tes access a { $name } cuntinuescha e tes ciclus da facturaziun
    e pajament vegn a restar il medem. Tia proxima debitaziun da 
    { $amount } succeda ils { $endDate }.
reactivate-confirm-button = Reabunar

## $date (Date) - Last day of product access

reactivate-panel-copy = Ti vegns a perder l'access a { $name } ils <strong>{ $date }</strong>.
reactivate-success-copy = Grazia! Tut è pront.
reactivate-success-button = Serrar

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: Cumpra in-app
sub-iap-item-apple-purchase-2 = { -brand-apple }: Cumpra in-app
sub-iap-item-manage-button = Administrar
