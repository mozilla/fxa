# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Inicio da conta

## Component - CouponForm


## Component - Fields

default-input-error = Este campo é obrigatorio
input-error-is-required = { $label } é obrigatorio

## Component - Header


## Component - NewUserEmailForm


## Component - PaymentConfirmation

payment-confirmation-order-heading = Detalles do pedido
payment-confirmation-invoice-number = Factura n.° { $invoiceNumber }
payment-confirmation-amount = { $amount } cada { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } ao día
       *[other] { $amount } cada { $intervalCount } días
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } á semana
       *[other] { $amount } cada { $intervalCount } semanas
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } ao mes
       *[other] { $amount } cada { $intervalCount } meses
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } ao ano
       *[other] { $amount } cada { $intervalCount } anos
    }
payment-confirmation-download-button = Continuar á descarga

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView


## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-name =
    .placeholder = Nome completo
    .label = Nome que aparecerá na súa tarxeta
payment-cc =
    .label = A súa tarxeta
payment-cancel-btn = Cancelar
payment-update-btn = Actualizar
payment-pay-btn = Pagar agora
payment-validate-name-error = Escriba o seu nome.

## Component - PaymentLegalBlurb


## Component - PaymentMethodHeader


## Component - PaymentProcessing


## Component - PaymentProviderDetails


## Component - PayPalButton


## Component - PlanDetails

plan-details-header = Detalles do produto
plan-details-show-button = Mostrar os detalles
plan-details-hide-button = Agochar os detalles
plan-details-total-label = Total

## Component - PlanErrorDialog

product-no-such-plan = Ese plan non existe para este produto.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.


## Component - SubscriptionTitle

sub-guarantee = Garantía de devolución do diñeiro de 30 días

## Component - TermsAndPrivacy

terms = Condicións do servizo
privacy = Aviso de privacidade

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Contas de Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Pechar

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Erro xeral da aplicación
basic-error-message = Algo fallou. Inténteo de novo máis tarde.
payment-error-1 = Algo impediu autorizar o pago. Inténteo de novo ou contacte co emisor da súa tarxeta.
payment-error-2 = Algo impediu autorizar o pago. Contacte co emisor da súa tarxeta.
expired-card-error = Parece que a súa tarxeta de crédito caducou. Probe con outra.
insufficient-funds-error = Parece que a súa tarxeta non ten fondos dabondo. Probe con outra.
withdrawal-count-limit-exceeded-error = Parece que esta transacción superaría o seu límite de crédito. Probe con outra tarxeta.
charge-exceeds-source-limit = Parece que esta transacción superaría o seu límite de crédito diario. Probe con outra tarxeta ou en 24 horas.
instant-payouts-unsupported = Parece que a súa tarxeta de débito non está configurada para pagos instantáneos. Probe con outra tarxeta de débito ou crédito.
duplicate-transaction = Parece que se acaba de enviar unha transacción idéntica. Comprobe o seu historial de pagos.
coupon-expired = Parece que ese código promocional caducou.
card-error = Non se puido procesar a súa transacción. Verifique a información da súa tarxeta de crédito e inténteo de novo.
product-plan-error =
    .title = Produciuse un problema ao cargar os plans
product-profile-error =
    .title = Produciuse un problema ao cargar o perfil
product-customer-error =
    .title = Produciuse un problema ao cargar o cliente
product-plan-not-found = Non se atopou o plan

## Hooks - coupons


## Routes - Checkout - New user


## Routes - Product and Subscriptions


## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate


## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

sub-update-current-plan-label = Plan actual
sub-update-new-plan-label = Novo plan
sub-update-total-label = Novo total

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Cancelar a subscrición
sub-item-stay-sub = Manter a subscrición

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Xa non poderá usar { $name } despois de
    { $period }, o último día do seu período de facturación actual.
sub-item-cancel-confirm =
    Cancelar o meu acceso e a miña información gardada en
    { $name } o { $period }

## Routes - Subscription

sub-route-idx-reactivating = Non se puido reactivar a subscrición
sub-route-idx-cancel-failed = Non se puido cancelar a subscrición
sub-route-idx-contact = Contactar co equipo de asistencia
sub-route-idx-cancel-msg-title = Sentimos que se vaia.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Cancelouse a súa subscrición de { $name }
                <br />
                O seu acceso a { $name } rematará o { $date }.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Produciuse un problema ao cargar o cliente
sub-billing-update-success = Actualizouse a súa información de facturación

## Routes - Subscription - ActionButton

pay-update-change-btn = Cambiar

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.


## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Caduca o { $expirationDate }
sub-route-idx-updating = Actualizando a información de facturación…

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = Non hai ningún plan para esta subscrición.

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = Quere seguir usando { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Conservará o acceso a { $name }, o ciclo de facturación
    e o pago. O seguinte cargo será de
    { $amount } o { $endDate }, á tarxeta que remata en { $last }.
reactivate-confirm-button = Subscribirse de novo

## $date (Date) - Last day of product access

reactivate-panel-copy = Perderá acceso a { $name } o <strong>{ $date }</strong>.
reactivate-success-copy = Grazas! Está todo listo.
reactivate-success-button = Pechar

## Routes - Subscriptions - Subscription iap item

