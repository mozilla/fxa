# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Pagjine principâl dal account
settings-project-header-title = { -product-mozilla-account(capitalization: "uppercase") }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Codiç promozionâl aplicât
coupon-submit = Apliche
coupon-remove = Gjave
coupon-error = Il codiç inserît nol è valit o al è scjadût.
coupon-error-generic = Al è capitât un erôr te elaborazion dal codiç. Torne prove.
coupon-error-expired = Il codiç inserît al è scjadût.
coupon-error-limit-reached = Il codiç inserît al è rivât al so limit.
coupon-error-invalid = Il codiç inserît nol è valit.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Inserìs il codiç

## Component - Fields

default-input-error = Chest cjamp al è obligatori
input-error-is-required = { $label } al è un cjamp obligatori

## Component - Header

brand-name-mozilla-logo = Logo { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Âstu za un { -product-mozilla-account }? <a>Jentre</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Inserìs la tô e-mail
new-user-confirm-email =
    .label = Conferme la tô e-mail
new-user-subscribe-product-updates-mozilla = O desideri ricevi di { -brand-mozilla } inzornaments e novitâts sui prodots
new-user-subscribe-product-updates-snp = O desideri ricevi di { -brand-mozilla } inzornaments su sigurece e riservatece
new-user-subscribe-product-updates-hubs = O desideri ricevi di { -product-mozilla-hubs } e { -brand-mozilla } inzornaments e novitâts sui prodots
new-user-subscribe-product-updates-mdnplus = O desideri ricevi di { -product-mdn-plus } e { -brand-mozilla } inzornaments e novitâts sui prodots
new-user-subscribe-product-assurance = O doprìn la tô e-mail dome par creâ il to account. No le vendarìn mai a tierçs.
new-user-email-validate = La e-mail no je valide
new-user-email-validate-confirm = Lis direzions e-mail no corispuindin
new-user-already-has-account-sign-in = Tu âs za un account. <a>Jentre</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Âstu sbaliât a scrivi la e-mail? { $domain } nol ufrìs un servizi di pueste eletroniche.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Graciis!
payment-confirmation-thanks-heading-account-exists = Graciis. Cumò controle la tô e-mail.
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = E je stade inviade une e-mail di conferme a { $email } cui detais su cemût scomençâ a doprâ { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Tu ricevarâs une e-mail ae direzion { $email } cu lis istruzions par configurâ il to account e i detais pal paiament.
payment-confirmation-order-heading = Detais dal ordin
payment-confirmation-invoice-number = Fature #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Informazions sul paiament
payment-confirmation-amount = { $amount } par { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } ogni dì
       *[other] { $amount } ogni { $intervalCount } dîs
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } ogni setemane
       *[other] { $amount } ogni { $intervalCount } setemanis
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } ogni mês
       *[other] { $amount } ogni { $intervalCount } mês
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ogni an
       *[other] { $amount } ogni { $intervalCount } agns
    }
payment-confirmation-download-button = Continue par discjariâ

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = O autorizi { -brand-mozilla } a contizâ l’impuart visualizât doprant il metodi di paiament che o ai sielt, in base aes <termsOfServiceLink>cundizions di utilizazion dal servizi</termsOfServiceLink> e ae <privacyNoticeLink>informative su la riservatece</privacyNoticeLink>, fintant che no anularai il gno abonament.
payment-confirm-checkbox-error = Tu scugnis completâ cheste operazion prime di procedi

## Component - PaymentErrorView

payment-error-retry-button = Torne prove
payment-error-manage-subscription-button = Gjestion abonament

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Tu âs za un abonament a { $productName } midiant l’app store di { -brand-google } o di { -brand-apple }.
iap-upgrade-no-bundle-support = I inzornaments no son disponibii par chescj abonaments, ma lu saran chi di pôc.
iap-upgrade-contact-support = Tu puedis ancjemò otignî chest prodot — contate il supuart pe assistence par ricevi jutori.
iap-upgrade-get-help-button = Oten jutori

## Component - PaymentForm

payment-name =
    .placeholder = Non complet
    .label = Il non cussì cemût che al è te cjarte
payment-cc =
    .label = La tô cjarte
payment-cancel-btn = Anule
payment-update-btn = Inzorne
payment-pay-btn = Paie cumò
payment-pay-with-paypal-btn-2 = Paie cun { -brand-paypal }
payment-validate-name-error = Inserìs il to non

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } al dopre { -brand-name-stripe } e { -brand-paypal } pe elaborazion sigure dal paiament.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Informative su la riservatece di { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Informative su la riservatece di { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } al dopre { -brand-paypal } pe elaborazion sigure dai paiaments.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Informative su la riservatece di { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } al dopre { -brand-name-stripe } pe elaborazion sigure dai paiaments.
payment-legal-link-stripe-3 = <stripePrivacyLink>Informative su la riservatece di { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Sielç il to metodi di paiament
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Par prime robe tu scugnis aprovâ il to abonament

## Component - PaymentProcessing

payment-processing-message = Par plasê spiete intant che o elaborìn il to paiament…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = La cjarte e che e finìs cun { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Paie cun { -brand-paypal }

## Component - PlanDetails

plan-details-header = Detais dal prodot
plan-details-list-price = Presit di catalic
plan-details-show-button = Mostre detais
plan-details-hide-button = Plate detais
plan-details-total-label = Totâl
plan-details-tax = Tassis e comissions

## Component - PlanErrorDialog

product-no-such-plan = Nissun plan di chel gjenar par chest prodot.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } tassis
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } ogni dì
       *[other] { $priceAmount } ogni { $intervalCount } dîs
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ogni dì
           *[other] { $priceAmount } ogni { $intervalCount } dîs
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } ogni setemane
       *[other] { $priceAmount } ogni { $intervalCount } setemanis
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ogni setemane
           *[other] { $priceAmount } ogni { $intervalCount } setemanis
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } ogni mês
       *[other] { $priceAmount } ogni { $intervalCount } mês
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ogni mês
           *[other] { $priceAmount } ogni { $intervalCount } mês
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ogni an
       *[other] { $priceAmount } ogni { $intervalCount } agns
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ogni an
           *[other] { $priceAmount } ogni { $intervalCount } agns
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassis ogni dì
       *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } dîs
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassis ogni dì
           *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } dîs
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassis ogni setemane
       *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } setemanis
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassis ogni setemane
           *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } setemanis
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassis ogni mês
       *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } mês
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassis ogni mês
           *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } mês
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassis ogni an
       *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } agns
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassis ogni an
           *[other] { $priceAmount } + { $taxAmount } di tassis ogni { $intervalCount } agns
        }

## Component - SubscriptionTitle

subscription-create-title = Configure l’abonament
subscription-success-title = Conferme dal abonament
subscription-processing-title = Daûr a confermâ l’abonament…
subscription-error-title = Erôr te conferme dal abonament…
subscription-noplanchange-title = Cheste modifiche al plan di abonament no je supuartade
subscription-iapsubscribed-title = Za abonât/abonade
sub-guarantee = Garanzie di rimbors di 30 dîs

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tiermins dal servizi
privacy = Informative su la riservatece
terms-download = Discjame i tiermins

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Accounts di Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Siere barcon di dialic
settings-subscriptions-title = Abonaments
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Codiç promozionâl

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } ogni dì
       *[other] { $amount } ogni { $intervalCount } dîs
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ogni dì
           *[other] { $amount } ogni { $intervalCount } dîs
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } ogni setemane
       *[other] { $amount } ogni { $intervalCount } setemanis
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ogni setemane
           *[other] { $amount } ogni { $intervalCount } setemanis
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } ogni mês
       *[other] { $amount } ogni { $intervalCount } mês
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ogni mês
           *[other] { $amount } ogni { $intervalCount } mês
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ogni an
       *[other] { $amount } ogni { $intervalCount } agns
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ogni an
           *[other] { $amount } ogni { $intervalCount } agns
        }

## Error messages

# App error dialog
general-error-heading = Erôr gjenerâl de aplicazion
basic-error-message = Alc al è lât strucj. Torne prove plui indenant.
payment-error-1 = Uhm… al è vignût fûr un probleme tal autorizâ il paiament. Torne prove o contate l’emitent de cjarte.
payment-error-2 = Uhm… al è vignût fûr un probleme tal autorizâ il paiament. Contate l’emitent de cjarte.
payment-error-3b = Al è capitât un erôr inspietât dilunc la elaborazion dal paiament, torne prove.
expired-card-error = Al somee che la tô cjarte di credit e sedi scjadude. Prove cuntune altre cjarte.
insufficient-funds-error = Al somee che la tô cjarte no vedi credit suficient. Prove cuntune altre cjarte.
withdrawal-count-limit-exceeded-error = Al somee che cheste transazion e superi il limit di credit disponibil. Prove cuntune altre cjarte.
charge-exceeds-source-limit = Al somee che cheste transazion e superi il limit di credit disponibil. Prove cuntune altre cjarte o spiete 24 oris.
instant-payouts-unsupported = Al somee che la tô cjarte di debit no sedi configurade pai paiaments istantanis. Prove cuntune altre cjarte di debit o di credit.
duplicate-transaction = Uhm… al somee che e sedi stade a pene inviade une transazion identiche. Controle la cronologjie dai paiaments.
coupon-expired = Al somee che il codiç promozionâl al sedi scjadût.
card-error = Nol è stât pussibil elaborâ la transazion. Verifiche i dâts de tô cjarte di credit e torne prove.
country-currency-mismatch = La valude di chest abonament no je valide pal paîs associât ae tô modalitât di paiament.
currency-currency-mismatch = Nus displâs, nol è pussibil cambiâ la valude.
location-unsupported = La tô posizion corinte no je supuartade des nestris cundizions di utilizazion dal servizi.
no-subscription-change = Nus displâs, no tu puedis modificâ il to plan di abonament.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Tu sês za abonât/abonade midiant { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Un erôr di sisteme al à impedît l’abonament a { $productName }. Nol è stât aplicât nissun adebit sul to metodi di paiament. Torne prove.
fxa-post-passwordless-sub-error = La sotscrizion dal abonament e je confermade, ma nol è stât pussibil cjariâ la pagjine de conferme. Controle la tô e-mail par configurâ il to account.
newsletter-signup-error = No tu sês iscrit(e) aes notifichis vie e-mail sui inzornaments dai prodots. Tu puedis tornâ a provâ tes impostazions dal to account.
product-plan-error =
    .title = Probleme tal cjariâ i plans
product-profile-error =
    .title = Probleme tal cjariâ il profîl
product-customer-error =
    .title = Probleme tal cjariâ il client
product-plan-not-found = Plan no cjatât
product-location-unsupported-error = Posizion no supuartade

## Hooks - coupons

coupon-success = Il to plan si rinovarà in automatic al presit di catalic.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Il to plan si rinovarà in automatic dopo { $couponDurationDate } al presit di catalic.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Cree un { -product-mozilla-account }
new-user-card-title = Inserìs lis informazions relativis ae tô cjarte di credit
new-user-submit = Aboniti cumò

## Routes - Product and Subscriptions

sub-update-payment-title = Informazions sul paiament

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Paie cu la cjarte
product-invoice-preview-error-title = Probleme tal cjariâ la anteprime de fature
product-invoice-preview-error-text = Impussibil cjariâ la anteprime de fature

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Nol è ancjemò pussibil inzornâti

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Riviôt la tô modifiche
sub-change-failed = Modifiche dal plan falide
sub-update-acknowledgment = Il to plan al vignarà cambiât daurman e vuê ti vignarà contizât un impuart ripartît in mût proporzionâl pe part che e reste dal cicli di faturazion. A partî di { $startingDate } ti vignarà contizât l’impuart intîr.
sub-change-submit = Conferme modifiche
sub-update-current-plan-label = Plan atuâl
sub-update-new-plan-label = Gnûf plan
sub-update-total-label = Gnûf totâl
sub-update-prorated-upgrade = Inzornament ripartît in mût proporzionâl

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (al dì)
sub-update-new-plan-weekly = { $productName } (ae setemane)
sub-update-new-plan-monthly = { $productName } (al mês)
sub-update-new-plan-yearly = { $productName } (al an)
sub-update-prorated-upgrade-credit = Il salt negatîf mostrât al vignarà aplicât tant che credit sul to account e al vignarà doprât pes prossimis faturis.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Scancele abonament
sub-item-stay-sub = Reste abonât/abonade

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = No tu rivarâs plui a doprâ { $name } dopo dal/dai { $period }, ultin dì dal to cicli di faturazion.
sub-item-cancel-confirm =
    Scancele il gno acès e lis mês informazions salvadis in
    { $name } al/ai { $period }
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
sub-promo-coupon-applied = Coupon { $promotion_name } aplicât: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Il paiament di chest abonament al à gjenerât un credit sul salt dal to account: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Riativazion dal abonament falide
sub-route-idx-cancel-failed = Cancelazion dal abonament falît
sub-route-idx-contact = Contate la assistence
sub-route-idx-cancel-msg-title = Nus displâs di vioditi lâ vie
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Il to abonament a { $name } al è stât cancelât.
          <br />
          Tu podarâs ancjemò acedi a { $name } fin al/ai { $date }.
sub-route-idx-cancel-aside-2 = Âstu domandis? Visite il <a>supuart par { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Probleme tal cjariâ il client
sub-invoice-error =
    .title = Probleme tal cjariâ lis faturis
sub-billing-update-success = I tiei dâts di faturazion a son stâts inzornâts cun sucès
sub-invoice-previews-error-title = Probleme tal cjariâ lis anteprimis des faturis
sub-invoice-previews-error-text = Impussibil cjariâ lis anteprimis des faturis

## Routes - Subscription - ActionButton

pay-update-change-btn = Modifiche
pay-update-manage-btn = Gjestìs

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Prossim adebit al/ai { $date }
sub-next-bill-due-date = La prossime fature e scjât ai { $date }
sub-expires-on = Al scjât al/ai { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Al scjât al/ai { $expirationDate }
sub-route-idx-updating = Inzornament dâts di faturazion…
sub-route-payment-modal-heading = Informazions di faturazion no validis
sub-route-payment-modal-message-2 = Al somee che al sedi presint un erôr cul to account { -brand-paypal }, al covente che tu fasedis i passaçs necessaris par risolvi chest probleme cul paiament.
sub-route-missing-billing-agreement-payment-alert = Informazions di paiament no validis; al è vignût fûr un erôr cul to account. <div>Gjestìs</div>
sub-route-funding-source-payment-alert = Informazions di paiament no validis; al è vignût fûr un erôr cul to account. Al podarès passâ un pôc di timp prime che chest avîs al vegni gjavât, ancje dopo che tu âs inzornât cun sucès lis tôs informazions. <div>Gjestìs</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Nissun plan di chest gjenar par chest abonament.
invoice-not-found = Fature sucessive no cjatade
sub-item-no-such-subsequent-invoice = Fature sucessive no cjatade par chest abonament.
sub-invoice-preview-error-title = Anteprime fature no cjatade
sub-invoice-preview-error-text = Anteprime fature no cjatade par chest abonament

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Desideristu continuâ a doprâ { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Tu podarâs continuâ a acedi a { $name }, il to cicli di faturazion
    e il paiament a restaran invariâts. Il to prossim adebit su la cjarte che e finìs par { $last }
    al sarà di { $amount } e al capitarà al/i { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Tu podarâs continuâ a acedi a { $name }. Cicli di faturazion 
    e impuart a restaran invariâts. Il prossim adebit al
    sarà di { $amount } e al capitarà al/i { $endDate }.
reactivate-confirm-button = Torne aboniti

## $date (Date) - Last day of product access

reactivate-panel-copy = Tu pierdarâs l’acès a { $name } al/i <strong>{ $date }</strong>.
reactivate-success-copy = Graciis! Dut pront.
reactivate-success-button = Siere

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: compris te aplicazion
sub-iap-item-apple-purchase-2 = { -brand-apple }: compris te aplicazion
sub-iap-item-manage-button = Gjestìs
