# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout


## Component - CouponForm

coupon-error-generic = Prodúxose un error al procesar el códigu. Volvi tentalo.

## Component - Fields


## Component - Header


## Component - NewUserEmailForm


## Component - PaymentConfirmation

payment-confirmation-thanks-heading = ¡Gracies!
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } caldía
       *[other] { $amount } cada { $intervalCount } díes
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } selmanalmente
       *[other] { $amount } cada { $intervalCount } selmanes
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mensualmente
       *[other] { $amount } cada { $intervalCount } meses
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } añalmente
       *[other] { $amount } cada { $intervalCount } años
    }

## Component - PaymentConsentCheckbox


## Component - PaymentErrorView


## Component - PaymentErrorView - IAP upgrade errors


## Component - PaymentForm

payment-cancel-btn = Encaboxar

## Component - PaymentLegalBlurb


## Component - PaymentMethodHeader


## Component - PaymentProcessing

payment-processing-message = Espera mentanto procesamos el pagu…

## Component - PaymentProviderDetails


## Component - PayPalButton


## Component - PlanDetails


## Component - PlanErrorDialog


## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.


## Component - SubscriptionTitle

subscription-processing-title = Confirmando la soscripción…
subscription-error-title = Hebo un error al confirmar la soscripción…

## Component - TermsAndPrivacy

terms = Términos del serviciu
privacy = Avisu de privacidá

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Firefox Accounts
settings-subscriptions-title = Soscripciones

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.


## Error messages

# App error dialog
general-error-heading = Error xeneral de l'aplicación
basic-error-message = Asocedió daqué malo. Volvi tentalo dempués, por favor.
payment-error-3b = Prodúxose un error inesperáu mentanto se procesaba'l pagu. Volvi tentalo.
expired-card-error = Paez que la tarxeta de creitu caducó. Prueba con otra.
coupon-expired = Paez que'l códigu de promoción caducó.
no-subscription-change = Nun pues camudar el plan de la soscripción.
product-profile-error =
    .title = Hebo un problema al cargar el perfil

## Hooks - coupons


## Routes - Checkout - New user


## Routes - Product and Subscriptions


## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate


## Routes - Product - IapRoadblock


# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.


## Routes - Product - Subscription upgrade


## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)


## Routes - Subscriptions - Cancel


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


## Routes - Subscriptions - Subscription iap item

