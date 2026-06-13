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
coupon-error = El código que has introducido no es válido o ha caducado.
coupon-error-generic = Ha ocurrido un error procesando el código. Por favor, inténtalo de nuevo.
coupon-error-expired = El código que has introducido había caducado.
coupon-error-limit-reached = El código que has introducido ha alcanzado su límite.
coupon-error-invalid = El código que has introducido no es válido.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-enter-code =
    .placeholder = Introducir código

## Component - Fields

default-input-error = Este campo es obligatorio
input-error-is-required = Se requiere { $label }

## Component - Header

brand-name-mozilla-logo = Logo de { -brand-mozilla }

## Component - NewUserEmailForm

new-user-sign-in-link-2 = ¿Ya tienes una { -product-mozilla-account }? <a>Inicia sesión</a>
# "Required" to indicate that the user must use the checkbox below this text to
# agree to a payment method's terms of service and privacy notice in order to
# continue.
new-user-enter-email =
    .label = Escribe tu correo electrónico
new-user-confirm-email =
    .label = Confirma tu correo electrónico
new-user-subscribe-product-updates-mozilla = Me gustaría recibir noticias y actualizaciones de productos de { -brand-mozilla }
new-user-subscribe-product-updates-snp = Me gustaría recibir noticias y actualizaciones sobre seguridad y privacidad de { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Me gustaría recibir noticias y actualizaciones de productos de { -product-mozilla-hubs } y { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Me gustaría recibir noticias y actualizaciones de productos de { -product-mdn-plus } y { -brand-mozilla }
new-user-subscribe-product-assurance = Utilizamos tu dirección únicamente para crear tu cuenta. Jamás la venderemos a terceros.
new-user-email-validate = El correo electrónico no es válido
new-user-email-validate-confirm = Las direcciones de correo electrónico no coinciden
new-user-already-has-account-sign-in = Ya tienes una cuenta. <a>Iniciar sesión</a>
# $domain (String) - the email domain provided by the user during sign up
new-user-invalid-email-domain = ¿Correo mal escrito? { $domain } no ofrece correo electrónico.

## Component - PaymentConfirmation

payment-confirmation-thanks-heading = ¡Gracias!
payment-confirmation-thanks-heading-account-exists = Gracias. ¡Ahora revisa tu correo electrónico!
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
        [one] { $amount } al día
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

payment-confirm-with-legal-links-static-3 = Autorizo a { -brand-mozilla } para que cargue a mi método de pago el importe mostrado, de acuerdo con los <termsOfServiceLink>términos del servicio</termsOfServiceLink> y  el <privacyNoticeLink>aviso de privacidad</privacyNoticeLink>, hasta que cancele mi suscripción.
payment-confirm-checkbox-error = Debes completar esto antes de seguir adelante

## Component - PaymentErrorView

payment-error-retry-button = Volver a intentarlo
payment-error-manage-subscription-button = Administrar mi suscripción

## Component - PaymentErrorView - IAP upgrade errors

# $productName (String) - The name of the subscribed product.
iap-upgrade-already-subscribed-2 = Ya tienes una suscripción a { $productName } a través de las tiendas de aplicaciones { -brand-google } o { -brand-apple }.
iap-upgrade-no-bundle-support = No admitimos actualizaciones para estas suscripciones, pero lo haremos pronto.
iap-upgrade-contact-support = Todavía puedes obtener este producto — por favor contacta con el equipo de soporte para que podamos ayudarte.
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
payment-validate-name-error = Introduzca su nombre

## Component - PaymentLegalBlurb

payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } usa { -brand-name-stripe } y { -brand-paypal } para el procesamiento seguro de pagos.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Política de privacidad de { -brand-name-stripe }</stripePrivacyLink> &nbsp;<paypalPrivacyLink>Política de privacidad de { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } usa { -brand-paypal } para el procesamiento seguro de pagos.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Política de privacidad de { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } usa { -brand-name-stripe } para el procesamiento seguro de pagos.
payment-legal-link-stripe-3 = <stripePrivacyLink>Política de privacidad de { -brand-name-stripe }</stripePrivacyLink>.

## Component - PaymentMethodHeader

payment-method-header = Elige tu método de pago
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primero tendrás que aprobar tu suscripción

## Component - PaymentProcessing

payment-processing-message = Por favor, espera mientras procesamos tu pago…

## Component - PaymentProviderDetails

payment-confirmation-cc-card-ending-in = Tarjeta que termina en { $last4 }

## Component - PayPalButton

pay-with-heading-paypal-2 = Pagar con { -brand-paypal }

## Component - PlanDetails

plan-details-header = Detalles del producto
plan-details-list-price = Lista de precios
plan-details-show-button = Mostrar detalles
plan-details-hide-button = Ocultar detalles
plan-details-total-label = Total
plan-details-tax = Impuestos y tasas

## Component - PlanErrorDialog

product-no-such-plan = No existe el plan para este producto.

## Price details including tax
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.

price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } de impuestos
# $intervalCount (Number) - The interval between payments, in days.
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } diariamente
       *[other] { $priceAmount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } diariamente
           *[other] { $priceAmount } cada { $intervalCount } días
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } semanalmente
       *[other] { $priceAmount } cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } semanalmente
           *[other] { $priceAmount } cada { $intervalCount } semanas
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } mensualmente
       *[other] { $priceAmount } cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } mensualmente
           *[other] { $priceAmount } cada { $intervalCount } meses
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } anualmente
       *[other] { $priceAmount } cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } anualmente
           *[other] { $priceAmount } cada { $intervalCount } años
        }
# $intervalCount (Number) - The interval between payments, in days.
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos diariamente
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos diariamente
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } días
        }
# $intervalCount (Number) - The interval between payments, in weeks.
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos semanalmente
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos semanalmente
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } semanas
        }
# $intervalCount (Number) - The interval between payments, in months.
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos mensualmente
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos mensualmente
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } meses
        }
# $intervalCount (Number) - The interval between payments, in years.
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos anualmente
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos anualmente
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } años
        }

## Component - SubscriptionTitle

subscription-create-title = Configura tu suscripción
subscription-success-title = Confirmación de la suscripción
subscription-processing-title = Confirmando la suscripción…
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
    .title = Firefox Accounts
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
        [one] { $amount } diariamente
       *[other] { $amount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $amount } diariamente
           *[other] { $amount } cada { $intervalCount } días
        }
# $intervalCount (Number) - The interval between payments, in weeks.
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } semanalmente
       *[other] { $amount } cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $amount } semanalmente
           *[other] { $amount } cada { $intervalCount } semanas
        }
# $intervalCount (Number) - The interval between payments, in months.
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } mensualmente
       *[other] { $amount } cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $amount } mensualmente
           *[other] { $amount } cada { $intervalCount } meses
        }
# $intervalCount (Number) - The interval between payments, in years.
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } anualmente
       *[other] { $amount } cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $amount } anualmente
           *[other] { $amount } cada { $intervalCount } años
        }

## Error messages

# App error dialog
general-error-heading = Error general de la aplicación
basic-error-message = Algo ha salido mal. Por favor, inténtalo de nuevo más tarde.
payment-error-1 = Hmm. Hubo un problema autorizando tu pago. Inténtalo otra vez o ponte en contacto con el emisor de su tarjeta
payment-error-2 = Hmm. Hubo un problema al autorizar tu pago. Ponte en contacto con el emisor de tu tarjeta.
payment-error-3b = Ha ocurrido un error inesperado al procesar el pago, por favor prueba de nuevo.
expired-card-error = Parece que tu tarjeta de crédito ha caducado. Prueba con otra tarjeta.
insufficient-funds-error = Parece que tu tarjeta no tiene fondos suficientes. Prueba con otra tarjeta.
withdrawal-count-limit-exceeded-error = Parece que esta transacción superará tu límite de crédito. Prueba con otra tarjeta.
charge-exceeds-source-limit = Parece que esta transacción superará tu límite de crédito diario. Prueba con otra tarjeta o en 24 horas.
instant-payouts-unsupported = Parece que tu tarjeta de débito no está configurada para pagos instantáneos. Prueba con otra tarjeta de débito o crédito.
duplicate-transaction = Hmm. Parece que se acaba de enviar una transacción idéntica. Verifica tu historial de pagos.
coupon-expired = Parece que ese código promocional ha expirado.
card-error = Tu transacción no pudo ser procesada. Verifica la información de tu tarjeta de crédito y vuelve a intentarlo.
country-currency-mismatch = La moneda de esta suscripción no es válida para el país asociado con tu pago.
currency-currency-mismatch = Lo sentimos. No puedes cambiar entre monedas.
location-unsupported = Tu ubicación actual no se admite según nuestros Términos de Servicio.
no-subscription-change = Lo sentimos. No puedes cambiar tu plan de suscripción.
# $mobileAppStore (String) - "Google Play Store" or "App Store", localized when the translation is available.
iap-already-subscribed = Ya tienes una suscripción a través de { $mobileAppStore }.
# $productName (String) - The name of the subscribed product.
fxa-account-signup-error-2 = Un error del sistema ha provocado que tu registro de { $productName } fallara. No se ha cobrado nada a tu método de pago. Inténtalo de nuevo.
fxa-post-passwordless-sub-error = Se ha confirmado la suscripción, pero no se ha podido cargar la página de confirmación. Revisa tu correo electrónico para configurar tu cuenta.
newsletter-signup-error = No estás registrado para recibir correos de actualización de productos. Puedes volver a intentarlo en la configuración de tu cuenta.
product-plan-error =
    .title = Problemas al cargar planes
product-profile-error =
    .title = Problema al cargar el perfil
product-customer-error =
    .title = Problema al cargar el cliente
product-plan-not-found = No se ha encontrado el plan
product-location-unsupported-error = Ubicación no admitida

## Hooks - coupons

coupon-success = Tu plan se renovará automáticamente al precio de la lista.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
coupon-success-repeating = Tu plan se renovará automáticamente después de { $couponDurationDate } al precio de lista.

## Routes - Checkout - New user

new-user-step-1-2 = 1. Crea una { -product-mozilla-account }
new-user-card-title = Escribe la información de tu tarjeta
new-user-submit = Suscribirse ahora

## Routes - Product and Subscriptions

sub-update-payment-title = Información del pago

## Routes - Product/AcceptedCards
## Used in both Routes - Checkout and Product/SubscriptionCreate

pay-with-heading-card-only = Pagar con tarjeta
product-invoice-preview-error-title = Problema al cargar la vista previa de la factura
product-invoice-preview-error-text = No se ha podido cargar la vista previa de la factura

## Routes - Product - IapRoadblock

subscription-iaperrorupgrade-title = Todavía no podemos actualizarte

# The following are not terms because they are not used directly in messages,
# but rather looked up in code and passed into the message as variables.

brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }

## Routes - Product - Subscription upgrade

product-plan-change-heading = Revisa tu cambio
sub-change-failed = El cambio de plan ha fallado
sub-update-acknowledgment =
    Tu plan cambiará inmediatamente y se te cobrará un importe prorrateado
    hoy para el resto de este ciclo de facturación. A partir del { $startingDate }
    se te cobrará el importe total.
sub-change-submit = Confirmar cambio
sub-update-current-plan-label = Plan actual
sub-update-new-plan-label = Nuevo plan
sub-update-total-label = Nuevo total
sub-update-prorated-upgrade = Actualización prorrateada

## Checkout line item for subscription plan change listing the product name and frequency of payment
## For example, a Mozilla VPN subscription charged monthly would appear as: Mozilla VPN (Monthly)
## Variables:
##   $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)

sub-update-new-plan-daily = { $productName } (diario)
sub-update-new-plan-weekly = { $productName } (semanal)
sub-update-new-plan-monthly = { $productName } (mensual)
sub-update-new-plan-yearly = { $productName } (Anual)
sub-update-prorated-upgrade-credit = El saldo negativo mostrado se aplicará como crédito a tu cuenta y se utilizará para futuras facturas.

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
sub-promo-coupon-applied = Cupón de { $promotion_name } aplicado: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Este pago de suscripción resultó en un crédito en el saldo de tu cuenta: <priceDetails></priceDetails>

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
sub-route-idx-cancel-aside-2 = ¿Alguna pregunta? Visita la <a>ayuda de { -brand-mozilla }</a>.

## Routes - Subscriptions - Errors

sub-customer-error =
    .title = Problema al cargar el cliente
sub-invoice-error =
    .title = Problema al cargar facturas
sub-billing-update-success = Tu información de facturación ha sido actualizada correctamente
sub-invoice-previews-error-title = Problema al cargar la vista previa de las facturas
sub-invoice-previews-error-text = No se ha podido cargar la vista previa de las facturas

## Routes - Subscription - ActionButton

pay-update-change-btn = Cambiar
pay-update-manage-btn = Administrar

## Routes - Subscriptions - Cancel and IapItem
## $priceAmount (Number) - The amount billed. It will be formatted as currency.
## $taxAmount (Number) - The tax added on, not included in amount. It will be formatted as currency.
## $date (Date) - The date for the next time a charge will occur.

sub-next-bill = Próxima facturación el { $date }
sub-next-bill-due-date = La próxima factura vence el { $date }
sub-expires-on = Caduca el { $date }

## Routes - Subscription - PaymentUpdate


# $expirationDate (Date) - The payment card's expiration date.

pay-update-card-exp = Caduca { $expirationDate }
sub-route-idx-updating = Actualizando información de facturación…
sub-route-payment-modal-heading = Información de facturación no válida
sub-route-payment-modal-message-2 = Parece haber un error con tu cuenta de { -brand-paypal }, necesitamos que tomes las medidas necesarias para resolver este problema de pago.
sub-route-missing-billing-agreement-payment-alert = Información de pago no válida, hay un error con tu cuenta. <div>Administrar</div>
sub-route-funding-source-payment-alert = Información de pago no válida; hay un error con tu cuenta. Puede pasar un tiempo antes de que esta alerta desaparezca, aunque hayas actualizado correctamente la información. <div>Administrar</div>

## Routes - Subscription - SubscriptionItem

sub-item-no-such-plan = No existe ese plan para esta suscripción.
invoice-not-found = Factura posterior no encontrada
sub-item-no-such-subsequent-invoice = No se ha encontradola factura posterior para esta suscripción.
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
reactivate-confirm-button = Volver a suscribir

## $date (Date) - Last day of product access

reactivate-panel-copy = Perderás acceso a { $name } el <strong>{ $date }</strong>.
reactivate-success-copy = ¡Gracias! Está todo listo.
reactivate-success-button = Cerrar

## Routes - Subscriptions - Subscription iap item

sub-iap-item-google-purchase-2 = { -brand-google }: compras en la app
sub-iap-item-apple-purchase-2 = { -brand-apple }: compras en la app
sub-iap-item-manage-button = Administrar
