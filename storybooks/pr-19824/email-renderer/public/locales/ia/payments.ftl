# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Pagina principal del conto
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Codice promo applicate
coupon-submit = Applicar
coupon-remove = Remover
coupon-error = Le codice que tu ha inserite era non valide o expirate.
coupon-error-generic = Un error occurreva processante le codice. Retenta.
coupon-error-expired = Le codice que tu ha inserite ha expirate.
coupon-error-limit-reached = Le codice que tu ha inserite ha attingite su limite.
coupon-error-invalid = Le codice que tu ha inserite non es valide.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Insere le codice

## Component - Fields

default-input-error = Campo obligatori
input-error-is-required = { $label } es necessari

## Component - Header

brand-name-mozilla-logo = Logo { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = Ha tu jam un { -product-mozilla-account }? <a>Accede</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Insere tu email
new-user-confirm-email =
    .label = Confirma tu email
new-user-subscribe-product-updates-mozilla = Il me placerea reciper novas e actualisationes de productos per { -brand-mozilla }
new-user-subscribe-product-updates-snp = Il me placerea reciper novas e actualisationes de securitate e confidentialitate per { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Il me placerea reciper novas e actualisationes de productos per { -product-mozilla-hubs } e { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Il me placerea reciper novas e actualisationes de productos per { -product-mdn-plus } e { -brand-mozilla }
new-user-subscribe-product-assurance = Nos usa tu adresse email solo pro crear tu conto. Nos mais lo vendera a tertie parte.
new-user-email-validate = Email non valide
new-user-email-validate-confirm = Emails discorde
new-user-already-has-account-sign-in = Tu jam ha un conto. <a>Accede</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = Adresse mal scribite? { $domain } non offere servicio e-mail.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Gratias!
payment-confirmation-thanks-heading-account-exists = Gratias, ora verifica tu e-mail!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Un e-mail de confirmation ha essite inviate a { $email } con detalios sur como comenciar con { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Tu recipera un e-mail a { $email } con instructiones pro le preparation de tu conto, e tu datos de pagamento.
payment-confirmation-order-heading = Detalios del ordine
payment-confirmation-invoice-number = Factura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Information de pagamento
payment-confirmation-amount = { $amount } per { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } quotidian
       *[other] { $amount } cata { $intervalCount } dies
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } septimanalmente
       *[other] { $amount } cata { $intervalCount } septimanas
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } cata mense
       *[other] { $amount } cata { $intervalCount }menses
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } cata anno
       *[other] { $amount } cata { $intervalCount } annos
    }
payment-confirmation-download-button = Continuar a discargar

## Component - PaymentConsentCheckbox

payment-confirm-with-legal-links-static-3 = Io autorisa { -brand-mozilla } a cargar mi methodo de pagamento pro le amonta monstrate, secundo <termsOfServiceLink>Terminos de servicio</termsOfServiceLink> e <privacyNoticeLink>Aviso de confidentialitate</privacyNoticeLink>, usque io cancellara mi abonamento.
payment-confirm-checkbox-error = Il besonia completar isto, ante proceder

## Component - PaymentErrorView

payment-error-retry-button = Retentar
payment-error-manage-subscription-button = Gerer mi subscription

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Tu jam ha un subscription a { $productName }  via le magazines de apps de { -brand-google } o de { -brand-apple }.
iap-upgrade-no-bundle-support = Nos non supporta promotiones pro iste subscriptiones, ma nos los supportara tosto.
iap-upgrade-contact-support = Tu pote ancora obtener iste producto. Contacta nostre equipa de assistentia a fin que nos pote adjutar te.
iap-upgrade-get-help-button = Obtener auxilio

## Component - PaymentForm

payment-name =
    .placeholder = Nomine complete
    .label = Nomine como illo appare sur tu carta
payment-cc =
    .label = Tu carta
payment-cancel-btn = Cancellar
payment-update-btn = Actualisar
payment-pay-btn = Paga ora
payment-pay-with-paypal-btn-2 = Paga con { -brand-paypal }
payment-validate-name-error = Insere tu nomine

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } usa { -brand-name-stripe } e { -brand-paypal } pro le elaboration secur del pagamentos.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>{ -brand-name-stripe } politica de confidentialitate</stripePrivacyLink> &nbsp; <paypalPrivacyLink>{ -brand-paypal } Politica de confidentialitate</paypalPrivacyLink>
payment-legal-copy-paypal-2 = { -brand-mozilla } usa { -brand-paypal } pro processar pagamentos secur.
payment-legal-link-paypal-3 = <paypalPrivacyLink>{ -brand-paypal } Politica de confidentialitate</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } usa { -brand-name-stripe } pro le processo secur de pagamento.
payment-legal-link-stripe-3 = <stripePrivacyLink>Politica de confidentialitate de { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Elige tu methodo de pagamento
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primo tu debera approbar tu subscription

## Component - PaymentProcessing

payment-processing-message = Attende durante que nos elabora tu pagamento…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Carta que fini in { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Paga con { -brand-paypal }

## Component - PlanDetails

plan-details-header = Detalios del producto
plan-details-list-price = Lista precio
plan-details-show-button = Monstrar le detalios
plan-details-hide-button = Celar le detalios
plan-details-total-label = Total
plan-details-tax = Taxas e oneres

## Component - PlanErrorDialog

product-no-such-plan = Nulle tal plano pro iste producto.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + taxa de { $taxAmount }
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } quotidian
       *[other] { $priceAmount } cata{ $intervalCount } dies
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } quotidian
           *[other] { $priceAmount } cata{ $intervalCount } dies
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } septimanal
       *[other] { $priceAmount } cata { $intervalCount } septimanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } septimanal
           *[other] { $priceAmount } cata { $intervalCount } septimanas
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } mensual
       *[other] { $priceAmount } cata { $intervalCount } menses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mensual
           *[other] { $priceAmount } cata { $intervalCount } menses
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } annual
       *[other] { $priceAmount } cata { $intervalCount } annos
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } annual
           *[other] { $priceAmount } cata { $intervalCount } annos
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + taxa de { $taxAmount } quotidian
       *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } dies
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + taxa de { $taxAmount } quotidian
           *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } dies
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + taxa de { $taxAmount } septimanal
       *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } septimanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + taxa de { $taxAmount } septimanal
           *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } septimanas
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + taxa de { $taxAmount } mensual
       *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } menses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + taxa de { $taxAmount } mensual
           *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } menses
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + taxa de { $taxAmount } annual
       *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } annos
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + taxa de { $taxAmount } annual
           *[other] { $priceAmount } + taxa de { $taxAmount } cata { $intervalCount } annos
        }

## Component - SubscriptionTitle

subscription-create-title = Preparation de tu subscription
subscription-success-title = Confirmation del subscription
subscription-processing-title = Confirmation del subscription…
subscription-error-title = Error in confirmation de subscription…
subscription-noplanchange-title = Iste cambiamento de plano de subscription non es supportate
subscription-iapsubscribed-title = Jam abonate
sub-guarantee = Garantia de reimbursamento de 30 dies

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Terminos de servicio
privacy = Aviso de confidentialitate
terms-download = Discargar terminos

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Contos de Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Clauder dialogo
settings-subscriptions-title = Subscriptiones
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Codice promo

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } cata die
       *[other] { $amount } cata { $intervalCount } dies
    }
    .title =
        { $intervalCount ->
            [one] { $amount } cata die
           *[other] { $amount } cata { $intervalCount } dies
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } cata septimana
       *[other] { $amount } cata { $intervalCount } septimanas
    }
    .title =
        { $intervalCount ->
            [one] { $amount } cata septimana
           *[other] { $amount } cata { $intervalCount } septimanas
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } mensual
       *[other] { $amount } cata { $intervalCount } menses
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mensual
           *[other] { $amount } cata { $intervalCount } menses
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } annual
       *[other] { $amount } cata { $intervalCount } annos
    }
    .title =
        { $intervalCount ->
            [one] { $amount } annualmente
           *[other] { $amount } cata { $intervalCount } annos
        }

## Error messages

# App error dialog
general-error-heading = Error general del application
basic-error-message = Alco errate eveniva. Reproba plus tarde.
payment-error-1 = Hmm. Il habeva un problema durante le autorisation de tu pagamento. Reproba o contacta tu emissor de carta.
payment-error-2 = Hmm. Il habeva un problema durante le autorisation de tu pagamento. Contacta tu emissor de carta.
payment-error-3b = Un error impreviste ha occurrite durante le elaboration de tu pagamento, reproba.
expired-card-error = Il pare que tu carta de credito ha expirate. Prova un altere carta.
insufficient-funds-error = Il pare que tu carta ha credito insufficiente. Prova un altere carta.
withdrawal-count-limit-exceeded-error = Il pare que iste transaction te ponera ultra tu limite de credito. Prova un altere carta.
charge-exceeds-source-limit = Il pare que iste transaction te ponera ultra tu limite de credito quotidian. Prova un altere carta o post 24 horas.
instant-payouts-unsupported = Il pare que tu carta de debito non es configurate pro pagamentos instantanee. Prova un altere carta de debito o credito.
duplicate-transaction = Hmm. Il pare que un transaction identic ha justo ora essite inviate. Verifica tu historia de pagamentos.
coupon-expired = Il pare que ille codice de promotion ha expirate.
card-error = Tu transaction non pote esser processate. Verifica le informationes de tu carta de credito e reproba.
country-currency-mismatch = Le moneta de iste subscription non es valide pro le pais associate con tu pagamento.
currency-currency-mismatch = Desolate. Tu non pote cambiar inter monetas.
location-unsupported = Tu actual position non es supportate secundo nostre Terminos de servicio.
no-subscription-change = Desolate. Tu non pote cambiar tu plano de subscription.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Tu es jam subscribite per { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Un error de systema ha impedite tu inscription a { $productName }. Tu methodo de pagamento non ha essite cargate. Retenta.
fxa-post-passwordless-sub-error = Subscription confirmate, ma es impossibile cargar le pagina de confirmation. Verifica tu e-mail pro configurar tu conto.
newsletter-signup-error = Tu non es inscribite al e-mails de actualisation del producto. Tu pote retentar in tu parametros de conto.
product-plan-error =
    .title = Problema cargante le planos
product-profile-error =
    .title = Problema a cargar le profilo
product-customer-error =
    .title = Problema al cargamento del cliente
product-plan-not-found = Plano non trovate
product-location-unsupported-error = Position non supportate

## Hooks - coupons

coupon-success = Tu plan automaticamente se renovara al lista precio.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Tu plano se renovara automaticamente depost le { $couponDurationDate } al precio de lista.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Crear un { -product-mozilla-account }
new-user-card-title = Insere informationes de tu carta
new-user-submit = Abona te ora

## Routes - Product and Subscriptions

sub-update-payment-title = Information de pagamento

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Pagar con le carta
product-invoice-preview-error-title = Problemas a cargar vistas previe de factura
product-invoice-preview-error-text = Impossibile cargar vistas previe de factura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Nos non pote promover te ancora

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = Boteca de { -google-play }
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Revide tu cambio
sub-change-failed = Cambio de plano fallite
sub-update-acknowledgment = Tu plano cambiara immediatemente, e hodie te sera cargate un amonta proportional al resto de iste cyclo de facturation. Desde le { $startingDate } te sera cargate le amonta complete.
sub-change-submit = Confirmar le cambio
sub-update-current-plan-label = Plano actual
sub-update-new-plan-label = Nove plano
sub-update-total-label = Nove total
sub-update-prorated-upgrade = Promotion proportionate

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (quotidian)
sub-update-new-plan-weekly = { $productName } (septimanal)
sub-update-new-plan-monthly = { $productName } (mensual)
sub-update-new-plan-yearly = { $productName } (annual)
sub-update-prorated-upgrade-credit = Le saldo negative monstrate sera applicate como creditos a tu conto e usate verso facturas futur.

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Cancellar subscription
sub-item-stay-sub = Resta abonate

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg = Tu non plus potera usar { $name } post { $period }, le ultime die de tu termino de facturation.
sub-item-cancel-confirm = Cancellar mi credentiales e mi informationes salvate intra { $name } le { $period }
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
sub-promo-coupon-applied = Coupon { $promotion_name } applicate: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Le pagamento de iste abonamento comportava un credito a saldo de tu conto: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Reactivation del subscription fallite
sub-route-idx-cancel-failed = Cancellation del subscription fallite
sub-route-idx-contact = Contactar assistentia
sub-route-idx-cancel-msg-title = Nos regretta de vider te ir
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Tu subscription a { $name } ha essite cancellate.
          <br />
          Tu habera ancora accesso a { $name } usque { $date }.
sub-route-idx-cancel-aside-2 = Ha tu questiones? Visita le <a>Supporto de { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problema al cargamento del cliente
sub-invoice-error =
    .title = Problema a cargar le facturas
sub-billing-update-success = Tu informationes de facturation ha essite  actualisate con successo!
sub-invoice-previews-error-title = Problemas a cargar vistas previe de factura
sub-invoice-previews-error-text = Impossibile cargar vistas previe de factura

## Routes - Subscription - ActionButton

pay-update-change-btn = Cambiar
pay-update-manage-btn = Gerer

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Proxime factura le { $date }
sub-next-bill-due-date = Le factura successive es debite le { $date }
sub-expires-on = Expira le { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Expira le { $expirationDate }
sub-route-idx-updating = Actualisation del informationes de factura…
sub-route-payment-modal-heading = Informationes de facturation non valide
sub-route-payment-modal-message-2 = Il pare haber un error con tu conto de { -brand-paypal }, nos besonia que tu face le passos necessari pro resolver iste problema de pagamento.
sub-route-missing-billing-agreement-payment-alert = Informationes de pagamento non valide; il ha un error con tu conto. <div>Gerer</div>
sub-route-funding-source-payment-alert = Informationes de pagamento non valide; il ha un error con tu conto. Iste aviso pote remaner un certe tempore post que tu corrige tu informationes. <div>Gerer</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Nulle tal plano pro iste subscription.
invoice-not-found = Factura posterior no trovate
sub-item-no-such-subsequent-invoice = Factura posterior non trovate pro iste abonamento.
sub-invoice-preview-error-title = Vista previe de factura non trovate
sub-invoice-preview-error-text = Vista previe de factura non trovate pro iste abonamento

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Vole tu continuar usar { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy = Tu accesso a { $name } continuara e tu termino de facturation e pagamento remanera identic. Tu amonta successive sera { $amount } al carta finiente in { $last } le { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Tu accesso a { $name } continuara e tu termino de facturation
     e pagamento remanera identic. Tu amonta successive sera 
    { $amount } le { $endDate }.
reactivate-confirm-button = Renovar le subscription

## $date (Date) - Last day of product access

reactivate-panel-copy = Tu perdera accesso a { $name } le <strong>{ $date }</strong>.
reactivate-success-copy = Gratias! Toto preste.
reactivate-success-button = Clauder

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: compras In-App
sub-iap-item-apple-purchase-2 = { -brand-apple }: compras de In-App
sub-iap-item-manage-button = Gerer
