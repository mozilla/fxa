# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Pàgina principal del compte

## Component - CouponForm


## Component - Fields

default-input-error = Camp obligatori
input-error-is-required = «{ $label }» és obligatori

## Component - Header


## Component - NewUserEmailForm

new-user-confirm-email =
    .label = Confirmeu l'adreça electrònica
new-user-email-validate = L'adreça electrònica no és vàlida
new-user-email-validate-confirm = Les adreces electròniques no coincideixen

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = Gràcies!
payment-confirmation-invoice-number = Factura núm. { $invoiceNumber }
payment-confirmation-details-heading-2 = Informació de pagament
payment-confirmation-download-button = Continua amb la baixada

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView

payment-error-retry-button = Torna-ho a provar
payment-error-manage-subscription-button = Gestiona la meva subscripció

## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-name =
    .placeholder = Nom complet
    .label = El nom tal com apareix en la vostra targeta
payment-cc =
    .label = La vostra targeta
payment-cancel-btn = Cancel·la
payment-update-btn = Actualitza
payment-pay-btn = Paga ara
payment-validate-name-error = Introduïu el vostre nom

## Component - PaymentLegalBlurb


## Component - PaymentMethodHeader


## Component - PaymentProcessing


## Component - PaymentProviderDetails


## Component - PayPalButton


## Component - PlanDetails

plan-details-header = Detalls del producte
plan-details-show-button = Mostra els detalls
plan-details-hide-button = Amaga els detalls
plan-details-total-label = Total

## Component - PlanErrorDialog


## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.


## Component - SubscriptionTitle

subscription-create-title = Configureu la vostra subscripció
subscription-iapsubscribed-title = Ja hi esteu subscrit

## Component - TermsAndPrivacy

terms = Condicions del servei
privacy = Avís de privadesa

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Comptes del Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Tanca la finestra modal
settings-subscriptions-title = Subscripcions

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Error general de l'aplicació
basic-error-message = Alguna cosa ha anat malament. Torneu-ho a provar més tard.
expired-card-error = Sembla que la vostra targeta de crèdit ha caducat. Proveu-ho amb una altra targeta.
insufficient-funds-error = Sembla que la vostra targeta de crèdit no té fons suficients. Proveu-ho amb una altra targeta.
withdrawal-count-limit-exceeded-error = Sembla que aquesta transacció sobrepassarà el vostre límit de crèdit. Proveu-ho amb una altra targeta.
charge-exceeds-source-limit = Sembla que aquesta transacció sobrepassarà el vostre límit de crèdit diari. Proveu-ho amb una altra targeta o d'aquí a 24 hores.
instant-payouts-unsupported = Sembla que la vostra targeta de dèbit no està configurada per a fer pagaments instantanis. Proveu-ho amb una altra targeta de dèbit o crèdit.
duplicate-transaction = Mmm. Sembla que s'acaba d'enviar una transacció idèntica. Consulteu el vostre historial de pagaments.
coupon-expired = Sembla que el codi de promoció ha caducat.
card-error = La vostra transacció no s'ha pogut processar. Verifiqueu la informació de la targeta de crèdit i torneu-ho a provar.

## Hooks - coupons


## Routes - Checkout - New user


## Routes - Product and Subscriptions

sub-update-payment-title = Informació de pagament

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate


## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade

sub-update-current-plan-label = Pla actual
sub-update-new-plan-label = Pla nou

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Cancel·la la subscripció

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access


## Routes - Subscription


## Routes - Subscriptions - Errors


## Routes - Subscription - ActionButton


## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.


## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.


## Routes - Subscription - SubscriptionItem


## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.


## $date (Date) - Last day of product access

reactivate-success-button = Tanca

## Routes - Subscriptions - Subscription iap item

