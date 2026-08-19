# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - CouponForm

coupon-error-generic = Prodúxose un error al procesar el códigu. Volvi tentalo.

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

## Component - PaymentForm

payment-cancel-btn = Encaboxar

## Component - PaymentProcessing

payment-processing-message = Espera mentanto procesamos el pagu…

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
