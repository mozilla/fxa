## Page

checkout-signin-or-create = 1. Inicia sesión o crea una { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = o
continue-signin-with-google-button = Seguir con { -brand-google }
continue-signin-with-apple-button = Seguir con { -brand-apple }
next-payment-method-header = Elige tu método de pago
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Primero tendrás que aprobar tu suscripción
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Selecciona tu país e introduce tu código postal <p>para continuar con el pago de { $productName }</p>
location-banner-info = No hemos podido detectar tu ubicación automáticamente
location-required-disclaimer = Sólo utilizamos esta información para calcular impuestos y divisas.
location-banner-currency-change = Cambio de moneda no admitido. Para continuar, selecciona un país que coincida con tu moneda de facturación actual.

## Page - Upgrade page

upgrade-page-payment-information = Información de pago
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Tu plan cambiará de inmediato y se te cobrará hoy un importe prorrateado para el resto de este ciclo de facturación. A partir del { $nextInvoiceDate } se te cobrará el importe completo.

## Authentication Error page

auth-error-page-title = No hemos podido iniciar la sesión
checkout-error-boundary-retry-button = Volver a intentarlo
checkout-error-boundary-basic-error-message = Algo salió mal. Inténtalo de nuevo o <contactSupportLink>contacta con el servicio de asistencia</contactSupportLink>.
amex-logo-alt-text = Logo de { -brand-amex }
diners-logo-alt-text = Logo de { -brand-diner }
discover-logo-alt-text = Logo de { -brand-discover }
jcb-logo-alt-text = Logo de { -brand-jcb }
mastercard-logo-alt-text = Logo de { -brand-mastercard }
paypal-logo-alt-text = Logo de { -brand-paypal }
unionpay-logo-alt-text = Logo de { -brand-unionpay }
visa-logo-alt-text = Logo de { -brand-visa }
link-logo-alt-text = Logo de { -brand-link }
apple-pay-logo-alt-text = Logo de { -brand-apple-pay }
google-pay-logo-alt-text = Logo de { -brand-google-pay }

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Administrar mi suscripción
next-iap-blocked-contact-support = Tienes una suscripción en la aplicación móvil que entra en conflicto con este producto — por favor comunícate con el servicio de soporte para que podamos ayudarte.
next-payment-error-retry-button = Volver a intentarlo
next-basic-error-message = Algo ha salido mal. Por favor, inténtalo de nuevo más tarde.
checkout-error-contact-support-button = Contactar con la asistencia
checkout-error-not-eligible = No eres elegible para suscribirte a este producto - por favor contacta con el servicio de asistencia para que podamos ayudarte.
checkout-error-already-subscribed = Ya estás suscrito a este producto.
checkout-error-contact-support = Por favor contacta con el servicio de asistencia para que podamos ayudarte.
cart-error-currency-not-determined = No hemos podido determinar la moneda para esta compra, por favor vuelve a intentarlo.
checkout-processing-general-error = Ha ocurrido un error inesperado al procesar el pago, por favor prueba de nuevo.

## Error pages - Payment method failure messages

intent-card-error = Tu transacción no pudo ser procesada. Verifica la información de tu tarjeta de crédito y vuelve a intentarlo.
intent-expired-card-error = Parece que tu tarjeta de crédito ha caducado. Prueba con otra tarjeta.
intent-payment-error-try-again = Hmm. Hubo un problema autorizando tu pago. Inténtalo otra vez o ponte en contacto con el emisor de su tarjeta
intent-payment-error-get-in-touch = Hmm. Hubo un problema al autorizar tu pago. Ponte en contacto con el emisor de tu tarjeta.
intent-payment-error-generic = Ha ocurrido un error inesperado al procesar el pago, por favor prueba de nuevo.
intent-payment-error-insufficient-funds = Parece que tu tarjeta no tiene fondos suficientes. Prueba con otra tarjeta.
general-paypal-error = Ha ocurrido un error inesperado al procesar el pago, por favor prueba de nuevo.
paypal-active-subscription-no-billing-agreement-error = Parece que hubo un problema al facturar tu cuenta { -brand-paypal }. Vuelve a activar los pagos automáticos de tu suscripción.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Por favor, espera mientras procesamos tu pago…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Gracias. ¡Ahora revisa tu correo electrónico!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Recibirás un correo electrónico en { $email } con instrucciones sobre tu suscripción, así como los detalles de pago.
next-payment-confirmation-order-heading = Detalles del pedido
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Factura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Información de pago

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Continuar para descargar

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Tarjeta que termina en { $last4 }

## Page - Subscription Management

subscription-management-subscriptions-heading = Suscripciones
subscription-management-button-add-payment-method-aria = Añadir un método de pago
subscription-management-button-add-payment-method = Añadir
subscription-management-button-manage-payment-method-aria = Administrar métodos de pago
subscription-management-button-manage-payment-method = Administrar
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Tarjeta que termina en { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Caduca { $expirationDate }
subscription-management-button-support = Obtener ayuda
subscription-management-your-apple-iap-subscriptions-aria = Tus suscripciones dentro de la aplicación { -brand-apple }
# Page - Not Found
page-not-found-title = Página no encontrada
page-not-found-description = No se ha encontrado la página solicitada. Hemos sido notificados y arreglaremos cualquier enlace que pueda estar roto.
page-not-found-back-button = Retroceder
alert-dialog-title = Diálogo de alerta

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Página principal de la cuenta
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Suscripciones

## CancelSubscription

subscription-cancellation-dialog-title = Lamentamos que te vayas.
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Tu suscripción a { $name } ha sido cancelada. Todavía tendrás acceso a { $name } hasta el { $date }.
subscription-cancellation-dialog-aside = ¿Alguna pregunta? Visita la <LinkExternal>ayuda de { -brand-mozilla }</LinkExternal>.

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Autorizo a { -brand-mozilla } para que cargue a mi método de pago el importe mostrado, de acuerdo con los <termsOfServiceLink>términos del servicio</termsOfServiceLink> y  el <privacyNoticeLink>aviso de privacidad</privacyNoticeLink>, hasta que cancele mi suscripción.
next-payment-confirm-checkbox-error = Debes completar esto antes de seguir adelante

## Checkout Form

next-new-user-submit = Suscribirse ahora
next-pay-with-heading-paypal = Pagar con { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Introducir código
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Código promocional
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Código promocional aplicado
next-coupon-remove = Eliminar
next-coupon-submit = Aplicar

# Component - Header

payments-header-help =
    .title = Ayuda
    .aria-label = Ayuda
    .alt = Ayuda
payments-header-bento =
    .title = Productos de { -brand-mozilla }
    .aria-label = Productos de { -brand-mozilla }
    .alt = Logotipo de { -brand-mozilla }
payments-header-bento-close =
    .alt = Cerrar
payments-header-bento-tagline = Más productos de { -brand-mozilla } que protegen tu privacidad
payments-header-bento-firefox-desktop = Navegador { -brand-firefox } para escritorio
payments-header-bento-firefox-mobile = Navegador { -brand-firefox } para dispositivos móviles
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Creado por { -brand-mozilla }
payments-header-avatar =
    .title = Menú de { -product-mozilla-account }
payments-header-avatar-icon =
    .alt = Foto de perfil de la cuenta
payments-header-avatar-expanded-signed-in-as = Sesión iniciada como
payments-header-avatar-expanded-sign-out = Cerrar sesión
payments-client-loading-spinner =
    .aria-label = Cargando…
    .alt = Cargando…

## Payment method management page - Stripe

manage-stripe-payments-title = Administrar métodos de pago

## Component - PurchaseDetails

next-plan-details-header = Detalles del producto
next-plan-details-list-price = Lista de precios
next-plan-details-tax = Impuestos y tasas
next-plan-details-total-label = Total
next-plan-details-hide-button = Ocultar detalles
next-plan-details-show-button = Mostrar detalles
next-coupon-success = Tu plan se renovará automáticamente al precio de la lista.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Tu plan se renovará automáticamente después de { $couponDurationDate } al precio de lista.

## Select Tax Location

select-tax-location-title = Ubicación
select-tax-location-edit-button = Editar
select-tax-location-save-button = Guardar
select-tax-location-continue-to-checkout-button = Continuar con el pago
select-tax-location-country-code-label = País
select-tax-location-country-code-placeholder = Selecciona tu país
select-tax-location-error-missing-country-code = Por favor, selecciona tu país
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } no está disponible en esta ubicación.
select-tax-location-postal-code-label = Código postal
select-tax-location-postal-code =
    .placeholder = Introduce tu código postal
select-tax-location-error-missing-postal-code = Por favor, introduce tu código postal
select-tax-location-error-invalid-postal-code = Por favor, introduce un código postal válido
select-tax-location-successfully-updated = Tu ubicación ha sido actualizada.
select-tax-location-error-location-not-updated = No se pudo actualizar tu ubicación. Vuelve a intentarlo.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Tu cuenta se factura en { $currencyDisplayName }. Selecciona un país que use { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Selecciona un país que coincida con la moneda de tus suscripciones activas.
select-tax-location-new-tax-rate-info = Actualizar tu ubicación aplicará la nueva tasa impositiva a todas las suscripciones activas en tu cuenta, a partir de tu próximo ciclo de facturación.
signin-form-continue-button = Continuar
signin-form-email-input = Introduce tu correo electrónico
signin-form-email-input-missing = Por favor introduce tu correo electrónico
signin-form-email-input-invalid = Por favor, proporciona un correo electrónico válido
next-new-user-subscribe-product-updates-mdnplus = Me gustaría recibir noticias y actualizaciones de productos de { -product-mdn-plus } y { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Me gustaría recibir noticias y actualizaciones de productos de { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Me gustaría recibir noticias y actualizaciones sobre seguridad y privacidad de { -brand-mozilla }
next-new-user-subscribe-product-assurance = Utilizamos tu dirección únicamente para crear tu cuenta. Jamás la venderemos a terceros.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = ¿Quieres seguir usando { $productName }?
subscription-content-button-resubscribe = Volver a suscribir
    .aria-label = Volver a suscribirse a { $productName }
resubscribe-success-dialog-title = ¡Gracias! Está todo listo.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = Se aplicará el descuento de { $promotionName }
subscription-content-button-cancel-subscription = Cancelar suscripción
    .aria-label = Cancelar suscripción a { $productName }

##

dialog-close = Cerrar el diálogo
subscription-content-cancel-action-error = Se ha producido un error inesperado. Inténtalo de nuevo.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } diarios
plan-price-interval-weekly = { $amount } semanales
plan-price-interval-monthly = { $amount } mensuales
plan-price-interval-halfyearly = { $amount } cada 6 meses
plan-price-interval-yearly = { $amount } anuales

## Component - SubscriptionTitle

next-subscription-create-title = Configura tu suscripción
next-subscription-success-title = Confirmación de la suscripción
next-subscription-processing-title = Confirmando la suscripción…
next-subscription-error-title = Error al confirmar la suscripción…
subscription-title-sub-exists = Ya te has suscrito
subscription-title-plan-change-heading = Revisa tu cambio
subscription-title-not-supported = Este cambio del plan de suscripción no está soportado
next-sub-guarantee = 30 días de garantía de devolución de dinero

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Términos del servicio
next-privacy = Aviso de privacidad
next-terms-download = Descargar términos
terms-and-privacy-stripe-label = { -brand-mozilla } usa { -brand-name-stripe } para el procesamiento seguro de pagos.
terms-and-privacy-stripe-link = Política de privacidad de { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } usa { -brand-paypal } para el procesamiento seguro de pagos.
terms-and-privacy-paypal-link = Política de privacidad de { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } usa { -brand-name-stripe } y { -brand-paypal } para el procesamiento seguro de pagos.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Plan actual
upgrade-purchase-details-new-plan-label = Nuevo plan
upgrade-purchase-details-promo-code = Código promocional
upgrade-purchase-details-tax-label = Impuestos y comisiones

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (diario)
upgrade-purchase-details-new-plan-weekly = { $productName } (semanal)
upgrade-purchase-details-new-plan-monthly = { $productName } (mensual)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 meses)
upgrade-purchase-details-new-plan-yearly = { $productName } (anual)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Pagar | { $productTitle }
metadata-description-checkout-start = Introduce tus detalles de pago para completar la compra.
# Checkout processing
metadata-title-checkout-processing = Procesando | { $productTitle }
metadata-description-checkout-processing = Por favor, espera mientras terminamos de procesar tu pago.
# Checkout error
metadata-title-checkout-error = Error | { $productTitle }
metadata-description-checkout-error = Se ha producido un error procesando tu suscripción. Si este problema persiste, contacta con la asistencia.
# Checkout success
metadata-title-checkout-success = Éxito | { $productTitle }
metadata-description-checkout-success = ¡Enhorabuena! Has completado con éxito tu compra.
# Checkout needs_input
metadata-title-checkout-needs-input = Acción requerida | { $productTitle }
metadata-description-checkout-needs-input = Por favor, completa la acción requerida para proceder con tu pago.
# Upgrade start
metadata-title-upgrade-start = Actualizar | { $productTitle }
metadata-description-upgrade-start = Introduce tus detalles de pago para completar la actualización.
# Upgrade processing
metadata-title-upgrade-processing = Procesando | { $productTitle }
metadata-description-upgrade-processing = Por favor, espera mientras terminamos de procesar tu pago.
# Upgrade error
metadata-title-upgrade-error = Error | { $productTitle }
metadata-description-upgrade-error = Se ha producido un error procesando tu actualización. Si el problema persiste, contacta a con la asistencia.
# Upgrade success
metadata-title-upgrade-success = Éxito | { $productTitle }
metadata-description-upgrade-success = ¡Enhorabuena! Has completado con éxito tu actualización.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Acción requerida | { $productTitle }
metadata-description-upgrade-needs-input = Por favor, completa la acción requerida para proceder con tu pago.
# Default
metadata-title-default = Página no encontrada | { $productTitle }
metadata-description-default = No se ha encontrado la página solicitada.

## Coupon Error Messages

next-coupon-error-expired = El código que has introducido había caducado.
next-coupon-error-generic = Ha ocurrido un error procesando el código. Por favor, inténtalo de nuevo.
next-coupon-error-invalid = El código que has introducido no es válido.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = El código que has introducido ha alcanzado su límite.
