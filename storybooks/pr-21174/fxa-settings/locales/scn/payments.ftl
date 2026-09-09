# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Pàggina mastra dû cuntu
settings-project-header-title = { -product-mozilla-account(capitalization: "uppercase") }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Còdici prumuzziunali usatu
coupon-submit = Riggistra
coupon-remove = Leva
coupon-error = U còdici chi mittisti nun è vàlitu o scadìu.
coupon-error-generic = Cci fu un prubblema riggistrannu u còdici. Pi favuri torna a prova.
coupon-error-expired = U còdici chi mittisti scadìu.
coupon-error-limit-reached = U còdici chi mittisti passau u so lìmiti d’usu.
coupon-error-invalid = U còdici chi mittisti nun è vàlitu.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Metti u còdici

## Component - Fields

default-input-error = Campu ubbligatoriu
input-error-is-required = { $label } è un campu ubbligatoriu

## Component - Header

brand-name-mozilla-logo = Mercu di { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Già ài un { -product-mozilla-account }? <a>Trasi</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Metti u to nnirizzu di posta elittrònica
new-user-confirm-email =
    .label = Cunferma u to nnirizzu di posta elittrònica
new-user-subscribe-product-updates-mozilla = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -brand-mozilla }
new-user-subscribe-product-updates-snp = Vogghiu aviri nutizzi e attualizzi di sicurizza e privatizza di { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -product-mozilla-hubs } e { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Vogghiu aviri nutizzi e attualizzi ncapu ê prudutti di { -product-mdn-plus } e { -brand-mozilla }
new-user-subscribe-product-assurance = Usamu u to nnirizzu di posta elittrònica sulu pi crìari u to cuntu. Nun u vinnemu mai a nuḍḍu.
new-user-email-validate = U nnirizzu di posta elittrònica nun è vàlitu
new-user-email-validate-confirm = I nnirizzi di posta elittrònica nun appàttanu
new-user-already-has-account-sign-in = Già ài un cuntu. <a>Trasi</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Sbagghiasti a scrìviri? { $domain } nun àvi un sirbizzu di posta elittrònica.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Grazzi!
payment-confirmation-thanks-heading-account-exists = Grazzi! Ora cuntrolla a to posta elittrònica.
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Na littra di cunferma fu mannata ô nnirizzu { $email } chî minutagghi pi principijari cu { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Hâ ricìviri na littra ô nnirizzu { $email } cu l’istruzzioni pi cunfijurari u to cuntu, e chî to minutagghi di pagamentu.
payment-confirmation-order-heading = Minutagghi di l’ùrdini
payment-confirmation-invoice-number = Fattura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Nfurmazzioni di pagamentu
payment-confirmation-amount = { $amount } pi { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } ô jornu
       *[other] { $amount } ogni { $intervalCount } jorna
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } â simana
       *[other] { $amount } ogni { $intervalCount } simani
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } ô misi
       *[other] { $amount } ogni { $intervalCount } misi
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ogni annu
       *[other] { $amount } ogni { $intervalCount } anni
    }
payment-confirmation-download-button = Cuntinua cû scarricamentu

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Auturizzu { -brand-mozilla } a pigghiàrisi u mportu mustratu dû me mètudu di pagamentu, sicunnu i <termsOfServiceLink>tèrmini di sirbizzu</termsOfServiceLink> e l’<privacyNoticeLink>abbisu di privatizza</privacyNoticeLink>, nzinu a quannu nun mi disiscrivu.
payment-confirm-checkbox-error = Hâ cumplitari stu passaggiu prima di jiri innanzi

## Component - PaymentErrorView

payment-error-retry-button = Prova arrè
payment-error-manage-subscription-button = Manija u me abbunamentu

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Già ài n’abbunamentu a { $productName } fattu nta l’app store di { -brand-google } o { -brand-apple }.
iap-upgrade-no-bundle-support = Pi st’abbunamenti nun suppurtamu l’attualizzi accamora, ma prestu i suppurtaremu.
iap-upgrade-contact-support = Po’ ancora aviri stu pruduttu — pi favuri cuntatta u supportu p’aviri ajutu.
iap-upgrade-get-help-button = Fatti ajutari

## Component - PaymentForm

payment-name =
    .placeholder = Nomu cumpletu
    .label = U nomu pi comu affaccia nnâ to carta
payment-cc =
    .label = A to carta
payment-cancel-btn = Sfai
payment-update-btn = Attualizza
payment-pay-btn = Paga ora
payment-pay-with-paypal-btn-2 = Paga cu { -brand-paypal }
payment-validate-name-error = Pi favuri metti u to nomu

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } usa { -brand-name-stripe } e { -brand-paypal } pi prucissari i pagamenti di manera sicura.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Pulìtica di privatizza di { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Pulìtica di privatizza di { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } usa { -brand-paypal } pi prucissari i pagamenti di manera sicura.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Pulìtica di privatizza di { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = { -brand-mozilla } usa { -brand-name-stripe } pi prucissari i pagamenti di manera sicura.
payment-legal-link-stripe-3 = <stripePrivacyLink>Pulìtica di privatizza di { -brand-name-stripe }</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Scarta u to mètudu di pagamentu
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Pi prima cosa, hâ appruvari u to abbunamentu

## Component - PaymentProcessing

payment-processing-message = Pi favuri aspetta mentri chi prucissamu u pagamentu…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Carta chi finisci pi { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Paga cu { -brand-paypal }

## Component - PlanDetails

plan-details-header = Minutagghi dû pruduttu
plan-details-list-price = Prezzu currenti
plan-details-show-button = Mustra i minutagghi
plan-details-hide-button = Ammuccia i minutagghi
plan-details-total-label = Tutali
plan-details-tax = Tassi e cummissioni

## Component - PlanErrorDialog

product-no-such-plan = Nun cc’è nuḍḍu chianu di stu tipu pi stu pruduttu.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } di tassi
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } ô jornu
       *[other] { $priceAmount } ogni { $intervalCount } jorna
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ô jornu
           *[other] { $priceAmount } ogni { $intervalCount } jorna
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } â simana
       *[other] { $priceAmount } ogni { $intervalCount } simani
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } â simana
           *[other] { $priceAmount } ogni { $intervalCount } simani
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } ô misi
       *[other] { $priceAmount } ogni { $intervalCount } misi
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ô misi
           *[other] { $priceAmount } ogni { $intervalCount } misi
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } ogni annu
       *[other] { $priceAmount } ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } ogni annu
           *[other] { $priceAmount } ogni { $intervalCount } anni
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi ô jornu
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } jorna
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi ô jornu
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } jorna
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi â simana
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } simani
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi â simana
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } simani
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi ô misi
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } misi
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi ô misi
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } misi
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } di tassi ogni annu
       *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } di tassi ogni annu
           *[other] { $priceAmount } + { $taxAmount } di tassi ogni { $intervalCount } anni
        }

## Component - SubscriptionTitle

subscription-create-title = Cunfijura u to abbunamentu
subscription-success-title = Cunferma di l’abbunamentu
subscription-processing-title = Staju cunfirmannu l’abbunamentu…
subscription-error-title = Cci fu un prubblema mentri chi cunfirmava l’abbunamentu…
subscription-noplanchange-title = Stu canciu ô chianu d’abbunamentu nun è suppurtatu
subscription-iapsubscribed-title = Già abbunatu
sub-guarantee = Priggiarìa di rifazzioni pi 30 jorna

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Tèrmini di sirbizzu
privacy = Abbisu di privatizza
terms-download = Scàrrica i tèrmini

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Cunti di Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Chiuji a finestra
settings-subscriptions-title = Abbunamenti
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Còdici prumuzziunali

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } ô jornu
       *[other] { $amount } ogni { $intervalCount } jorna
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ô jornu
           *[other] { $amount } ogni { $intervalCount } jorna
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } â simana
       *[other] { $amount } ogni { $intervalCount } simani
    }
    .title =
        { $intervalCount ->
            [one] { $amount } â simana
           *[other] { $amount } ogni { $intervalCount } simani
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } ô misi
       *[other] { $amount } ogni { $intervalCount } misi
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ô misi
           *[other] { $amount } ogni { $intervalCount } misi
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } ogni annu
       *[other] { $amount } ogni { $intervalCount } anni
    }
    .title =
        { $intervalCount ->
            [one] { $amount } ogni annu
           *[other] { $amount } ogni { $intervalCount } anni
        }

## Error messages

# App error dialog
general-error-heading = Erruri ginirali di l’applicazzioni
basic-error-message = Cci fu un prubblema. Pi favuri torna a prova cchiù tardu.
payment-error-1 = Mmh. Cci fu un prubblema cu l’auturizzazzioni dû to pagamentu. Pi favuri torna a prova o cuntatta cu’ ti rilassau a carta.
payment-error-2 = Mmh. Cci fu un prubblema cu l’auturizzazzioni dû to pagamentu. Pi favuri cuntatta cu’ ti rilassau a carta.
payment-error-3b = Cci fu n’erruri mentri chi prucissàvamu u to pagamentu, pi favuri torna a prova.
expired-card-error = Parissi chi a to carta scadìu. Prova a usari n’autra carta.
insufficient-funds-error = Parissi chi a to carta nun àvi sordi bastanti. Prova a usari n’autra carta.
withdrawal-count-limit-exceeded-error = Parissi chi stu pagamentu ti facissi passari a finaita di spisa dâ to carta. Prova a usari n’autra carta.
charge-exceeds-source-limit = Parissi chi stu pagamentu ti facissi passari a finaita di spisa jurnalera dâ to carta. Prova a usari n’autra carta, o aspetta 24 uri.
instant-payouts-unsupported = Parissi chi a to carta di dèbbitu nun è cunfijurata pî pagamenti subbitànii. Pi favuri prova a usari n’autra carta di dèbbitu o di crèditu.
duplicate-transaction = Uhm… parissi chi fu fattu un pagamentu avali di picca. Cuntrolla a crunuluggìa dî pagamenti.
coupon-expired = U còdici prumuzzionali scadìu.
card-error = Nun pòttimu prucissari u to pagamentu. Pi favuri cuntrolla i nfurmazzioni dâ to carta di crèditu e torna a prova.
country-currency-mismatch = A valuta di st’abbunamentu nun è vàlita pû pajisi assuciatu cû to pagamentu.
currency-currency-mismatch = Ni dispiaci, ma nun po’ scanciari a valuta.
location-unsupported = A to pusizzioni attuali nun è suppurtata dî nostri Tèrmini di sirbizzu.
no-subscription-change = Ni dispiaci, nun po’ canciari u to chianu d’abbunamentu.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Già facisti l’abbunamentu pi tràmiti di { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Nu sbagghiu di sistema fici sfalliri u to abbunamentu a { $productName }. Nun fu addibbitatu nenti ô to mètudu di pagamentu. Pi favuri torna a prova.
fxa-post-passwordless-sub-error = Abbunamentu cunfirmatu, ma a pàggina di cunferma sfallìu di carricari. Pi favuri cuntrolla a to posta elittrònica pi cunfijurari u to cuntu.
newsletter-signup-error = Nun ti scrivisti pî nutìfichi nnâ posta elittrònica ncapu a l’attualizzi dî prudutti. Po’ pruvari arrè nnê mpustazzioni dû to cuntu.
product-plan-error =
    .title = Cci fu un prubblema mentri chi carricava i chiani
product-profile-error =
    .title = Cci fu un prubblema mentri chi carricava u prufilu
product-customer-error =
    .title = Cci fu un prubblema mentri chi carricava u clienti
product-plan-not-found = Chianu nun truvatu
product-location-unsupported-error = Pusizzioni nun suppurtata

## Hooks - coupons

coupon-success = U to chianu veni rinnuvatu di manera autumàtica ô prezzu currenti.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = U to chianu veni rinnuvatu di manera autumàtica doppu { $couponDurationDate } ô prezzu currenti.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Crìa un { -product-mozilla-account }
new-user-card-title = Metti i nfurmazzioni dâ to carta
new-user-submit = Abbònati ora

## Routes - Product and Subscriptions

sub-update-payment-title = Nfurmazzioni di pagamentu

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Paga câ carta
product-invoice-preview-error-title = Cci fu un prubblema mentri chi carricava l’antiprima dâ fattura
product-invoice-preview-error-text = Nun potti carricari l’antiprima dâ fattura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Nun è pussìbbili fari l’attualizzu ancora

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Rividi u to canciu
sub-change-failed = U canciu di chianu sfallìu
sub-update-acknowledgment = U to chianu veni attualizzatu sùbbitu, e ti veni addibbitatu chiḍḍu chi ammanca, di manera prupurziunali, pû restu dû piriudu di fatturazzioni. Accuminciannu dû { $startingDate } ti veni addibbitata a còtima sana.
sub-change-submit = Cunferma canciu
sub-update-current-plan-label = Chianu attuali
sub-update-new-plan-label = Chianu novu
sub-update-total-label = Tutali novu
sub-update-prorated-upgrade = Attualizzu carculatu prupurziunali

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (ô jornu)
sub-update-new-plan-weekly = { $productName } (â simana)
sub-update-new-plan-monthly = { $productName } (ô misi)
sub-update-new-plan-yearly = { $productName } (a l’annu)
sub-update-prorated-upgrade-credit = U balanzu nigativu chi vidi veni scanciatu cu crèditi pû to cuntu, chi po' usari pi fatturi futuri.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Scancella l’abbunamentu
sub-item-stay-sub = Arresta abbunatu

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = Nun po’ cchiù usari { $name } doppu dû { $period }, chi è l’ùrtimu jornu dû to ciclu di fatturazzioni.
sub-item-cancel-confirm = Sdisattiva u me cuntu e scancella i me nfurmazzioni pirsunali sarbati nne { $name } jornu { $period }
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
sub-promo-coupon-applied = Prumuzzioni { $promotion_name } appricata: <priceDetails></priceDetails>
subscription-management-account-credit-balance = U pagamentu di st'abbunamentu ginirau un crèditu nnô balanzu dû to cuntu: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Sfallìu a riattivazzioni di l’abbunamentu
sub-route-idx-cancel-failed = Sfallìu u sfacimentu di l’abbunamentu
sub-route-idx-contact = Cuntatta l’assistenza
sub-route-idx-cancel-msg-title = Ni dispiaci chi dicidisti di jiritinni
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    U to abbunamentu a { $name } fu scancillatu.
          <br />
          Po’ ancora tràsiri a { $name } nzinu a jornu { $date }.
sub-route-idx-cancel-aside-2 = Ài dumanni? Vìsita l’<a>assistenza di { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Cci fu un prubblema mentri chi carricava u clienti
sub-invoice-error =
    .title = Cci fu un prubblema mentri chi carricava i fatturi
sub-billing-update-success = Attualizzasti i to nfurmazzioni di fatturazzioni
sub-invoice-previews-error-title = Cci fu un prubblema mentri chi carricava l’antiprimi dî fatturi
sub-invoice-previews-error-text = Nun potti carricari l’antiprimi dî fatturi

## Routes - Subscription - ActionButton

pay-update-change-btn = Cancia
pay-update-manage-btn = Manija

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Pròssima fattura jornu { $date }
sub-expires-on = Scadi u { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Scadi u { $expirationDate }
sub-route-idx-updating = Staju attualizzannu i nfurmazzioni di fatturazzioni…
sub-route-payment-modal-heading = Nfurmazzioni di fatturazzioni nun vàliti
sub-route-payment-modal-message-2 = Parissi chi cci fu n’erruri cû to cuntu { -brand-paypal }, serbi chi fai chiḍḍu chi serbi p’arrisòrbiri stu prubblema di pagamentu.
sub-route-missing-billing-agreement-payment-alert = Nfurmazzioni di pagamentu nun vàliti; cc’è n’erruri cû to cuntu. <div>Manija</div>
sub-route-funding-source-payment-alert = Nfurmazzioni di pagamentu nun vàliti, cc’è n’erruri cû to cuntu. Capaci ca serbi n’anticchia di tempu picchì st’abbisu sparisci doppu chi attualizzi i to nfurmazzioni. <div>Manija</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Nun cc’è nuḍḍu chianu di stu tipu pi st’abbunamentu.
invoice-not-found = Nun attruvai a fattura doppu
sub-item-no-such-subsequent-invoice = Nun attruvai a fattura doppu pi st’abbunamentu.
sub-invoice-preview-error-title = Nun attruvai l’antiprima dâ fattura
sub-invoice-preview-error-text = Nun attruvai l’antiprima dâ fattura pi st’abbunamentu

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Vo’ cuntinuari a usari { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy = Po’ cuntinuari a tràsiri nne { $name }, e u to ciclu di fatturazzioni arresta u stissu. L’addèbbitu pròssimu sarà di { $amount } ncapu â carta chi finisci pi { $last } jornu { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy = Po’ cuntinuari a tràsiri nne { $name }, e u to ciclu di fatturazzioni arresta u stissu. L’addèbbitu pròssimu sarà di { $amount } jornu { $endDate }.
reactivate-confirm-button = Abbònati arrè

## $date (Date) - Last day of product access

reactivate-panel-copy = Nun po’ tràsiri cchiù nne { $name } di jornu <strong>{ $date }</strong>.
reactivate-success-copy = Grazzi! Allistemu.
reactivate-success-button = Chiuji

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: accàttiti di l’app
sub-iap-item-apple-purchase-2 = { -brand-apple }: accàttiti di l’app
sub-iap-item-manage-button = Manija
