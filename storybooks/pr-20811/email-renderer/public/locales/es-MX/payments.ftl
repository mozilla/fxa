# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Component - AppLayout

settings-home = Página principal de la cuenta
settings-project-header-title = { -product-mozilla-account }

## Component - CouponForm

# Title of container showing discount coupon code applied to a subscription.
coupon-promo-code-applied = Código promocional aplicado
coupon-submit = Aplicar
coupon-remove = Eliminar
coupon-error = El código ingresado no es válido o está vencido.
coupon-error-generic = Ha ocurrido un error al procesar el código. Por favor, intenta de nuevo.
coupon-error-expired = El código que ingresaste ha expirado.
coupon-error-limit-reached = El código que ingresaste ha alcanzado su límite.
coupon-error-invalid = El código que ingresaste es inválido.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Ingresar código

## Component - Fields

default-input-error = Este campo es requerido
input-error-is-required = Se requiere { $label }

## Component - Header

brand-name-mozilla-logo = Logo de { -brand-mozilla }

## Component - NewUserEmailForm

# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Ingresa tu correo electrónico
new-user-confirm-email =
    .label = Confirma tu correo electrónico
new-user-subscribe-product-assurance = Utilizamos tu dirección únicamente para crear tu cuenta. Jamás la venderemos a terceros.
new-user-email-validate = El correo electrónico no es válido
new-user-email-validate-confirm = Las direcciones de correo electrónico no coinciden
new-user-already-has-account-sign-in = Ya tienes una cuenta. <a>Iniciar sesión</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = ¿Correo mal escrito? { $domain } no ofrece correo.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = ¡Gracias!
payment-confirmation-thanks-heading-account-exists = ¡Gracias, ahora revisa tu correo electrónico!
# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Se ha enviado un correo electrónico de confirmación a { $email } con detalles sobre cómo comenzar a usar { $product_name }.
# $email (string) - The user's email.
payment-confirmation-thanks-subheading-account-exists = Recibirás un mensaje en { $email } con instrucciones para configurar tu cuenta, así como los detalles de tu pago.
payment-confirmation-order-heading = Detalles del pedido
payment-confirmation-invoice-number = Factura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Información de pago
payment-confirmation-amount = { $amount } por { $interval }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in days.
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } diarios
       *[other] { $amount } cada { $intervalCount } días
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in weeks.
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } a la semana
       *[other] { $amount } cada { $intervalCount } semanas
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in months.
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } al mes
       *[other] { $amount } cada { $intervalCount } meses
    }
# $amount (Number) - The amount billed. It will be formatted as currency.
# $intervalCount (Number) - The interval between payments, in years.
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } al año
       *[other] { $amount } cada { $intervalCount } años
    }
payment-confirmation-download-button = Continuar para descargar

## Component - PaymentConsentCheckbox

payment-confirm-checkbox-error = Debes completar esto antes de avanzar

## Component - PaymentErrorView

payment-error-retry-button = Intentar de nuevo
payment-error-manage-subscription-button = Administrar mi suscripción

## Component - PaymentErrorView - IAP upgrade errors

iap-upgrade-no-bundle-support = No admitimos actualizaciones para estas suscripciones, pero pronto lo haremos.
iap-upgrade-contact-support = Todavía puedes obtener este producto —  por favor, pónte en contacto con el soporte para poder ayudarte.
iap-upgrade-get-help-button = Obtener ayuda

## Component - PaymentForm

payment-name =
    .placeholder = Nombre completo
    .label = El nombre tal y como aparece en tu tarjeta
payment-cc =
    .label = Tu tarjeta
payment-cancel-btn = Cancelar
payment-update-btn = Actualizar
payment-pay-btn = Pagar ahora
payment-pay-with-paypal-btn-2 = Pagar con { -brand-paypal }
payment-validate-name-error = Por favor, ingresa tu nombre

## Component - PaymentLegalBlurb

payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } política de privacidad</stripePrivacyLink>

## Component - PaymentMethodHeader

payment-method-header = Elige tu método de pago
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primero deberás aprobar tu suscripción

## Component - PaymentProcessing

payment-processing-message = Por favor, espera mientras procesamos tu pago…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Tarjeta que termina en { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Pagar con { -brand-paypal }

## Component - PlanDetails

plan-details-header = Detalles del producto
plan-details-list-price = Precio de lista
plan-details-show-button = Mostrar detalles
plan-details-hide-button = Ocultar detalles
plan-details-total-label = Total
plan-details-tax = Impuestos y comisiones

## Component - PlanErrorDialog

product-no-such-plan = No existe ese plan para este producto

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } impuestos
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } diary
       *[other] { $priceAmount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } diario
           *[other] { $priceAmount } cada { $intervalCount } días
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } semanal
       *[other] { $priceAmount } cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } semanal
           *[other] { $priceAmount } cada { $intervalCount } semanas
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } mensual
       *[other] { $priceAmount } cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mensual
           *[other] { $priceAmount } cada { $intervalCount } meses
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } anual
       *[other] { $priceAmount } cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } anual
           *[other] { $priceAmount } cada { $intervalCount } años
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } impuestos diariamente
       *[other] { $priceAmount } + { $taxAmount } impuestos cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } impuestos diariamente
           *[other] { $priceAmount } + { $taxAmount } impuestos cada { $intervalCount } días
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } impuestos semanales
       *[other] { $priceAmount } + { $taxAmount } impuestos cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } impuestos semanales
           *[other] { $priceAmount } + { $taxAmount } impuestos cada { $intervalCount } semanas
        }

## Component - SubscriptionTitle

subscription-create-title = Configurar tu suscripción
subscription-success-title = Confirmación de la suscripción
subscription-processing-title = Confirmando suscripción…
subscription-error-title = Error al confirmar la suscripción…
subscription-noplanchange-title = Este cambio del plan de suscripción no está soportado
subscription-iapsubscribed-title = Ya tienes una suscripción
sub-guarantee = 30 días de garantía de devolución de dinero

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Términos del servicio
privacy = Aviso de privacidad
terms-download = Descargar términos

## App-level string(s) and messages shared by multiple components or routes

document =
    .title = Cuentas de Firefox
# General aria-label for closing modals
close-aria =
    .aria-label = Cerrar modal
settings-subscriptions-title = Suscripciones
# Title of container where a user can input a coupon code to get a discount on a subscription.
coupon-promo-code = Código promocional

## Subscription upgrade plan details - shared by multiple components, including plan details and payment form
## $amount (Number) - The amount billed. It will be formatted as currency.

# $intervalCount (Number) - The interval between payments, in days.
plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } diario
       *[other] { $amount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $amount } diario
           *[other] { $amount } cada { $intervalCount } días
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } mensual
       *[other] { $amount } cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mensual
           *[other] { $amount } cada { $intervalCount } meses
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } anual
       *[other] { $amount } cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $amount } anual
           *[other] { $amount } cada { $intervalCount } años
        }

## Error messages

# App error dialog
general-error-heading = Error general de aplicación
basic-error-message = Algo salió mal. Por favor, inténtalo de nuevo más tarde.
payment-error-1 = Hmm. Hubo un problema al autorizar tu pago. Intenta nuevamente o ponte en contacto con el emisor de tu tarjeta.
payment-error-2 = Hmm. Hubo un problema al autorizar tu pago. Ponte en contacto con el emisor de tu tarjeta.
payment-error-3b = Ha ocurrido un error inesperado al procesar el pago, por favor prueba de nuevo.
expired-card-error = Parece que tu tarjeta de crédito ha expirado. Prueba con otra tarjeta.
insufficient-funds-error = Parece que tu tarjeta no tiene fondos suficientes. Prueba con otra tarjeta.
withdrawal-count-limit-exceeded-error = Parece que esta transacción te pondrá por encima de tu límite de crédito. Prueba con otra tarjeta.
charge-exceeds-source-limit = Parece que esta transacción te pondrá por encima de tu límite de crédito. Prueba con otra tarjeta o intenta nuevamente en 24 horas.
instant-payouts-unsupported = Parece que tu tarjeta de débito no está configurada para pagos instantáneos. Prueba con otra tarjeta de débito o crédito.
duplicate-transaction = Hmm. Parece que se acaba de enviar una transacción idéntica. Revisa tu historial de pagos.
coupon-expired = Parece que ese código promocional ha expirado.
card-error = Tu transacción no pudo ser procesada. Verifica la información de tu tarjeta de crédito e intenta nuevamente.
country-currency-mismatch = La moneda de esta suscripción no es válida para el país asociado con tu pago.
currency-currency-mismatch = Lo sentimos. No puedes cambiar entre monedas.
no-subscription-change = Lo sentimos. No puedes cambiar tu plan de suscripción.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Ya tienes una suscripción a través de { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Un error del sistema ha provocado que tu registro de { $productName } fallara. No se ha cobrado nada a tu método de pago. Inténtalo de nuevo.
fxa-post-passwordless-sub-error = Se ha confirmado la suscripción, pero no se ha podido cargar la página de confirmación. Revisa tu correo electrónico para configurar tu cuenta.
newsletter-signup-error = No estás registrado para recibir correos de actualización de productos. Puedes volver a intentarlo en la configuración de tu cuenta.
product-plan-error =
    .title = Problema al cargar los planes
product-profile-error =
    .title = Problema al cargar el perfil
product-customer-error =
    .title = Problema al cargar el cliente
product-plan-not-found = No se encontró el plan

## Hooks - coupons

coupon-success = Tu plan se renovará automáticamente al precio de la lista.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Tu plan se renovará automáticamente después del { $couponDurationDate } al precio de lista.

## Routes - Checkout - New user

new-user-card-title = Escribe la información de tu tarjeta
new-user-submit = Suscribirse ahora

## Routes - Product and Subscriptions

sub-update-payment-title = Información del pago

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Pagar con tarjeta
product-invoice-preview-error-title = Problema al cargar vista previa de la factura
product-invoice-preview-error-text = No se pudo cargar la vista previa de la factura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Todavía no podemos actualizarte

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Revisa tu cambio
sub-change-failed = El cambio de plan ha fallado
sub-change-submit = Confirmar cambio
sub-update-current-plan-label = Plan actual
sub-update-new-plan-label = Nuevo plan
sub-update-total-label = Nuevo total

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (Diario)
sub-update-new-plan-weekly = { $productName } (Semanal)
sub-update-new-plan-monthly = { $productName } (Mensual)
sub-update-new-plan-yearly = { $productName } (Anual)

## Routes - Subscriptions - Cancel

sub-item-cancel-sub = Cancelar suscripción
sub-item-stay-sub = Mantener suscripción

## $name (String) - The name of the subscribed product.
## $period (Date) - The last day of product access

sub-item-cancel-msg =
    Ya no podrás usar { $name } después de
    { $period }, el último día de tu ciclo de facturación.
sub-item-cancel-confirm =
    Cancelar mi acceso y mi información guardada en
    { $name } el { $period }
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
sub-promo-coupon-applied = Cupón aplicado por { $promotion_name }: <priceDetails></priceDetails>

## Routes - Subscription

sub-route-idx-reactivating = Ha fallado la reactivación de la suscripción
sub-route-idx-cancel-failed = Ha fallado la cancelación de la suscripción
sub-route-idx-contact = Contactar con soporte
sub-route-idx-cancel-msg-title = Lamentamos que te vayas
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
sub-route-idx-cancel-msg =
    Tu suscripción a { $name } ha sido cancelada.
          <br />
          Todavía tendrás acceso a { $name } hasta el { $date }.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problema al cargar cliente
sub-invoice-error =
    .title = Problema al cargar facturas
sub-billing-update-success = Tus datos de facturación han sido actualizados correctamente
sub-invoice-previews-error-title = Problema al cargar vistas previas de facturas
sub-invoice-previews-error-text = No se pudieron cargar vistas previas de facturas

## Routes - Subscription - ActionButton

pay-update-change-btn = Cambiar
pay-update-manage-btn = Administrar

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Próxima facturación el { $date }
sub-expires-on = Expira el { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Vence { $expirationDate }
sub-route-idx-updating = Actualizando datos de facturación…
sub-route-payment-modal-heading = Datos de facturación inválidos
sub-route-missing-billing-agreement-payment-alert = Datos de pago no válidos, hay un error con tu cuenta. <div>Administrar</div>
sub-route-funding-source-payment-alert = Información de pago no válida; hay un error con tu cuenta. Puede pasar un tiempo antes de que esta alerta desaparezca, aunque hayas actualizado correctamente la información. <div>Administrar</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = No existe ese plan para esta suscripción.
invoice-not-found = Factura posterior no encontrada
sub-item-no-such-subsequent-invoice = No se encontró la factura posterior para esta suscripción.
sub-invoice-preview-error-title = Vista previa de la factura no encontrada
sub-invoice-preview-error-text = Vista previa de la factura no encontrada para esta suscripción

## Routes - Subscriptions - Reactivate
## $name (String) - The name of the subscribed product.

reactivate-confirm-dialog-header = ¿Quieres seguir usando { $name }?
# $amount (Number) - The amount billed. It will be formatted as currency.
# $last (String) - The last 4 digits of the card that will be charged
# $endDate (Date) - Last day of product access
reactivate-confirm-copy =
    Tu acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } a la tarjeta terminada en { $last } el { $endDate }.
# Alternate copy used when a payment method is not available, e.g. for free trials
# $amount (Number) - The amount billed. It will be formatted as currency.
# $endDate (Date) - Last day of product access
reactivate-confirm-without-payment-method-copy =
    Tu acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } el { $endDate }.
reactivate-confirm-button = Volver a suscribirse

## $date (Date) - Last day of product access

reactivate-panel-copy = Perderás el acceso a { $name } el <strong>{ $date }</strong>.
reactivate-success-copy = ¡Gracias! Está todo listo.
reactivate-success-button = Cerrar

## Routes - Subscriptions - Subscription iap item

sub-iap-item-manage-button = Administrar
