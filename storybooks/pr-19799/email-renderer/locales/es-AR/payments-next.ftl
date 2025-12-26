loyalty-discount-terms-heading = Términos y restricciones
loyalty-discount-terms-support = Contactar soporte
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
loyalty-discount-terms-contact-support-product-aria = Contactá a soporte por { $productName }
not-found-page-title-terms = Página no encontrada
not-found-page-description-terms = La página que estás buscando no existe.
not-found-page-button-terms-manage-subscriptions = Administrar suscripciones

## Page

checkout-signin-or-create = 1. Iniciá sesión o creá una { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = o
continue-signin-with-google-button = Continuar con { -brand-google }
continue-signin-with-apple-button = Continuar con { -brand-apple }
next-payment-method-header = Elegí tu método de pago
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Primero tendrás que aprobar tu suscripción
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Seleccioná tu país e ingresá tu código postal <p>para continuar con el pago de { $productName }</p>
location-banner-info = No pudimos detectar tu ubicación automáticamente
location-required-disclaimer = Solo usamos esta información para calcular impuestos y moneda.
location-banner-currency-change = Cambio de moneda no soportado. Para continuar, seleccioná un país que coincida con tu moneda de facturación actual.

## Page - Upgrade page

upgrade-page-payment-information = Información de pago
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Tu plan cambiará de inmediato y se te cobrará un monto prorrateado por el resto de este ciclo de facturación. A partir de { $nextInvoiceDate } se te cobrará el importe total.

## Authentication Error page

auth-error-page-title = No pudimos iniciar la sesión
checkout-error-boundary-retry-button = Intentar nuevamente
checkout-error-boundary-basic-error-message = Algo salió mal. Volvé a intentarlo o <contactSupportLink>comunicate con soporte técnico .</contactSupportLink>
amex-logo-alt-text = logo de { -brand-amex }
diners-logo-alt-text = logo de { -brand-diner }
discover-logo-alt-text = logo de { -brand-discover }
jcb-logo-alt-text = logo de { -brand-jcb }
mastercard-logo-alt-text = logo de { -brand-mastercard }
paypal-logo-alt-text = logo de { -brand-paypal }
unionpay-logo-alt-text = logo de { -brand-unionpay }
visa-logo-alt-text = logo de { -brand-visa }
# Alt text for generic payment card logo
unbranded-logo-alt-text = Logo sin marca
link-logo-alt-text = logo de { -brand-link }
apple-pay-logo-alt-text = logo de { -brand-apple-pay }
google-pay-logo-alt-text = logo de { -brand-google-pay }

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Administrar mi suscripción
next-iap-blocked-contact-support = Tenés una suscripción a la aplicación móvil que entra en conflicto con este producto. Contactá a soporte para que podamos ayudarte.
next-payment-error-retry-button = Intentar de nuevo
next-basic-error-message = Algo salió mal. Probá de nuevo más tarde.
checkout-error-contact-support-button = Contactar soporte
checkout-error-not-eligible = No sos elegible para suscribirte a este producto; comunicate con el soporte técnico para que podamos ayudarte.
checkout-error-already-subscribed = Ya estás suscrito a este producto.
checkout-error-contact-support = Ponete en contacto con soporte para que podamos ayudarte.
cart-error-currency-not-determined = No pudimos determinar la moneda para esta compra, probá de nuevo.
checkout-processing-general-error = Ocurrió un error inesperado al procesar tu pago. Intentá nuevamente.
cart-total-mismatch-error = El monto de la factura cambió. Probá de nuevo.

## Error pages - Payment method failure messages

intent-card-error = La transacción no pudo ser procesada. Verificá la información de la tarjeta de crédito y probá nuevamente.
intent-expired-card-error = Parece que la tarjeta de crédito ha expirado. Probá con otra tarjeta.
intent-payment-error-try-again = Hmm. Hubo un problema al autorizar el pago. Probá nuevamente o ponete en contacto con el emisor de tu tarjeta.
intent-payment-error-get-in-touch = Hmm. Hubo un problema al autorizar el pago. Ponete en contacto con el emisor de tu tarjeta.
intent-payment-error-generic = Ocurrió un error inesperado al procesar tu pago. Intentá nuevamente.
intent-payment-error-insufficient-funds = Parece que la tarjeta no tiene fondos suficientes. Probá otra tarjeta.
general-paypal-error = Ocurrió un error inesperado al procesar tu pago. Intentá nuevamente.
paypal-active-subscription-no-billing-agreement-error = Parece que hubo un problema al facturar tu cuenta de { -brand-paypal }. Volvé a habilitar los pagos automáticos para tu suscripción.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Esperá mientras procesamos tu pago…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = ¡Gracias, ahora mirá tu correo electrónico!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Recibirás un correo electrónico en { $email } con instrucciones sobre tu suscripción y los detalles de pago.
next-payment-confirmation-order-heading = Detalles de la orden
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Factura número { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Información de pago

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Continuar descargando

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Tarjeta que termina en { $last4 }

## Not found page

not-found-title-subscriptions = Suscripción no encontrada
not-found-description-subscriptions = No pudimos encontrar tu suscripción. Probá de nuevo o contactá a soporte.
not-found-button-back-to-subscriptions = Volver a suscripciones

## Page - Subscription Management

subscription-management-page-banner-warning-title-no-payment-method = No se agregó ningún método de pago
subscription-management-page-banner-warning-link-no-payment-method = Agregar un método de pago
subscription-management-subscriptions-heading = Suscripciones
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Saltar a
subscription-management-nav-payment-details = Detalles del pago
subscription-management-nav-active-subscriptions = Suscripciones activas
subscription-management-payment-details-heading = Detalles del pago
subscription-management-email-label = Correo electrónico
subscription-management-credit-balance-label = Saldo acreedor
subscription-management-credit-balance-message = El crédito se aplicará automáticamente a las facturas futuras
subscription-management-payment-method-label = Método de pago
subscription-management-button-add-payment-method-aria = Agregar método de pago
subscription-management-button-add-payment-method = Agregar
subscription-management-page-warning-message-no-payment-method = Agregá un método de pago para evitar la interrupción de tus suscripciones.
subscription-management-button-manage-payment-method-aria = Administrar método de pago
subscription-management-button-manage-payment-method = Administrar
# $last4 (String) - Last four numbers of credit card
subscription-management-card-ending-in = Tarjeta que termina en { $last4 }
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Vencimiento { $expirationDate }
subscription-management-active-subscriptions-heading = Suscripciones activas
subscription-management-you-have-no-active-subscriptions = No tenés suscripciones activas
subscription-management-new-subs-will-appear-here = Las nuevas suscripciones aparecerán aquí.
subscription-management-your-active-subscriptions-aria = Tus suscripciones activas
subscription-management-button-support = Obtener ayuda
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-support-aria = Obtené ayuda para { $productName }
subscription-management-your-apple-iap-subscriptions-aria = Tus suscripciones In-App de { -brand-apple }
subscription-management-apple-in-app-purchase-2 = { -brand-apple } compras integradas
subscription-management-your-google-iap-subscriptions-aria = Tus suscripciones In-App de { -brand-google }
subscription-management-google-in-app-purchase-2 = { -brand-google } compras integradas
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Vence el { $date }
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscription-management-button-manage-subscription-aria = Administrar suscripción para { $productName }
subscription-management-button-manage-subscription-1 = Administrar suscripción
error-payment-method-banner-title-expired-card = Tarjeta vencida
error-payment-method-banner-message-add-new-card = Agregá una nueva tarjeta o método de pago para evitar la interrupción de tus suscripciones.
error-payment-method-banner-label-update-payment-method = Actualizar método de pago
error-payment-method-expired-card = Tu tarjeta ha expirado. Agregá una nueva tarjeta o método de pago para evitar la interrupción de tus suscripciones.
error-payment-method-banner-title-invalid-payment-information = La información de pago no es válida
error-payment-method-banner-message-account-issue = Hay un problema con tu cuenta.
subscription-management-button-manage-payment-method-1 = Administrar método de pago
subscription-management-error-apple-pay = Hay un problema con tu cuenta de { -brand-apple-pay }. Resolvé el problema para mantener tus suscripciones activas.
subscription-management-error-google-pay = Hay un problema con tu cuenta de { -brand-google-pay }. Resolvé el problema para mantener tus suscripciones activas.
subscription-management-error-link = Hay un problema con tu cuenta de { -brand-link }. Resolvé el problema para mantener tus suscripciones activas.
subscription-management-error-paypal-billing-agreement = Hay un problema con tu cuenta de { -brand-paypal }. Resolvé el problema para mantener tus suscripciones activas.
subscription-management-error-payment-method = Hay un problema con tu método de pago. Resolvé el problema para mantener tus suscripciones activas.
manage-payment-methods-heading = Administrar métodos de pago
paypal-payment-management-page-invalid-header = Información de facturación no válida
paypal-payment-management-page-invalid-description = Parece haber un error con la cuenta de { -brand-paypal }. Necesitamos que hagás los pasos necesarios para resolver este problema de pago.
# Page - Not Found
page-not-found-title = Página no encontrada
page-not-found-description = No se encontró la página solicitada. Hemos sido notificados y vamos a arreglar cualquier enlace que pueda estar roto.
page-not-found-back-button = Retroceder
alert-dialog-title = Diálogo de alerta

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Inicio de cuenta
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Suscripciones
# Link title - Payment method management
subscription-management-breadcrumb-payment-2 = Administrar métodos de pago
# $page refers to page titles used in the breadcrumb menu (e.g. Account Home, Subscriptions, Payment Methods)
subscription-management-breadcrumb-back-aria = Volver a { $page }

## CancelSubscription

subscription-cancellation-dialog-title = Lamentamos que te vayas
# $name (String) - The name of the subscribed product.
# $date (Date) - Last day of product access
subscription-cancellation-dialog-msg = Tu suscripción de { $name } ha sido cancelada. Seguirás teniendo acceso a { $name } hasta el { $date }.
subscription-cancellation-dialog-aside = ¿Tenés preguntas? Visitá <linkExternal>Soporte de { -brand-mozilla }</linkExternal>.
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
cancel-subscription-heading = Cancelar suscripción a { $productName }

## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

subscription-content-no-longer-use-message = No se podrá usar { $productName } después de { $currentPeriodEnd }, el último día del ciclo de facturación.
subscription-content-cancel-access-message = Cancelar mi acceso y mi información guardada en { $productName } el { $currentPeriodEnd }

## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN

cancel-subscription-button-cancel-subscription = Cancelar suscripción
    .aria-label = Cancelá tu suscripción a { $productName }
cancel-subscription-button-stay-subscribed = Mantener la suscripción
    .aria-label = Mantené la suscripción a { $productName }

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Autorizo a { -brand-mozilla } a cobrar de mi método de pago la suma mostrada según los <termsOfServiceLink>términos de servicio</termsOfServiceLink> y <privacyNoticeLink>notas de privacidad</privacyNoticeLink> hasta que cancele mi suscripción.
next-payment-confirm-checkbox-error = Tenés que completar esto antes de seguir adelante

## Checkout Form

next-new-user-submit = Suscribirse ahora
next-pay-with-heading-paypal = Pagar con { -brand-paypal }

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Ingresar código
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
payments-header-bento-firefox-mobile = Navegador para móviles { -brand-firefox }
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Hecho por { -brand-mozilla }
payments-header-avatar =
    .title = Menú de { -product-mozilla-account }
payments-header-avatar-icon =
    .alt = Foto de perfil de la cuenta
payments-header-avatar-expanded-signed-in-as = Ingresado como
payments-header-avatar-expanded-sign-out = Cerrar sesión
payments-client-loading-spinner =
    .aria-label = Cargando…
    .alt = Cargando…

## Payment method management page - Stripe

# Save button for changing which payment method will be used
payment-method-management-save-default = Establecer como método de pago predeterminado
# Save button for saving a new payment method
payment-method-management-save-method = Guardar método de pago
manage-stripe-payments-title = Administrar métodos de pago

## Component - PurchaseDetails

next-plan-details-header = Detalles del producto
next-plan-details-list-price = Precio de lista
# $productName (String) - The name of the product, e.g. Mozilla VPN
plan-details-product-prorated-price = Precio prorrateado para { $productName }
next-plan-details-tax = Impuestos y tarifas
next-plan-details-total-label = Total
# "Unused time" refers to the remaining value of the current subscription that hasn't been used yet
purchase-details-unused-time-label = Crédito por tiempo no utilizado
purchase-details-subtotal-label = Subtotal
# "Credit applied" refers to account credit used to reduce the amount due on the invoice
purchase-details-credit-applied-label = Crédito aplicado
# "Total due" is the total that the customer owes after all credits, discounts, and taxes have been applied
purchase-details-total-due-label = Total adeudado
next-plan-details-hide-button = Ocultar detalles
next-plan-details-show-button = Mostrar detalles
next-coupon-success = Tu plan se renovará automáticamente al precio de lista.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Tu plan se renovará automáticamente después de { $couponDurationDate } al precio de lista.

## Select Tax Location

select-tax-location-title = Ubicación
select-tax-location-edit-button = Editar
select-tax-location-save-button = Guardar
select-tax-location-continue-to-checkout-button = Continuar para finalizar la compra
select-tax-location-country-code-label = País
select-tax-location-country-code-placeholder = Seleccioná tu pais
select-tax-location-error-missing-country-code = Seleccioná tu pais
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = { $productName } no está disponible en esta ubicación.
select-tax-location-postal-code-label = Código postal
select-tax-location-postal-code =
    .placeholder = Ingresá tu código postal
select-tax-location-error-missing-postal-code = Ingresá tu código postal
select-tax-location-error-invalid-postal-code = Ingresá un código postal válido
select-tax-location-successfully-updated = Se actualizó tu ubicación.
select-tax-location-error-location-not-updated = No se pudo actualizar tu ubicación. Intentalo nuevamente.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Tu cuenta se factura en { $currencyDisplayName }. Seleccioná un país que use { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Seleccioná un país que coincida con la moneda de tus suscripciones activas.
select-tax-location-new-tax-rate-info = Actualizar tu ubicación aplicará la nueva tasa impositiva a todas las suscripciones activas en tu cuenta, comenzando con tu próximo ciclo de facturación.
signin-form-continue-button = Continuar
signin-form-email-input = Ingresá tu correo electrónico
signin-form-email-input-missing = Ingresá tu correo electrónico
signin-form-email-input-invalid = Ingresá un correo electrónico válido
next-new-user-subscribe-product-updates-mdnplus = Me gustaría recibir noticias y actualizaciones sobre los productos de { -product-mdn-plus } y { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Me gustaría recibir noticias y actualizaciones sobre los productos de { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Me gustaría recibir noticias y actualizaciones sobre seguridad y privacidad de { -brand-mozilla }
next-new-user-subscribe-product-assurance = Solo usamos tu correo electrónico para crear la cuenta. Nunca lo venderemos a terceros.

## $productName (String) - The name of the subscribed product.

resubscribe-dialog-title = ¿Querés seguir usando { $productName }?
stay-subscribed-access-will-continue = Tu acceso a { $productName } continuará y tu ciclo de facturación y pago seguirán siendo los mismos.
subscription-content-button-resubscribe = Resuscribirse
    .aria-label = Volver a suscribirse a { $productName }
resubscribe-success-dialog-title = ¡Gracias! Está todo listo.

## $nextInvoiceTotal (String) - The total amount of the next invoice, formatted according to the user's locale and currency.
## $taxDue (String) - The tax amount of the next invoice, formatted according to the user's locale and currency.
## $last4 (String) - The last four digits of the default payment method card.
## $currentPeriodEnd (Date) - The date of the next charge.

stay-subscribed-next-charge-with-tax = El próximo cargo será de { $nextInvoiceTotal } + { $taxDue } de impuestos el { $currentPeriodEnd }.
stay-subscribed-next-charge-no-tax = Tu próximo cargo será de { $nextInvoiceTotal } el { $currentPeriodEnd }.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-coupon-will-be-applied = Se aplicará el descuento de { $promotionName }
# • is acting as a separator between "Last bill" and the billing date.
subscription-content-last-bill = Última factura • { $billedOnDate }
subscription-content-last-bill-with-tax = { $invoiceTotal } + { $taxDue } impuestos
subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-view-invoice = Ver factura
subscription-management-link-view-invoice-aria = Ver factura de { $productName }
subscription-content-expires-on-expiry-date = Vence el { $date }
# • is acting as a separator between "Next bill" and the next billing date.
subscription-content-next-bill = Próxima factura • { $billedOnDate }
subscription-content-next-bill-with-tax-1 = { $nextInvoiceTotal } + { $taxDue } impuestos
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }
subscription-content-button-stay-subscribed = Mantener suscripción
    .aria-label = Mantener la suscripción a { $productName }
subscription-content-button-cancel-subscription = Cancelar suscripción
    .aria-label = Cancelar la suscripción a { $productName }

##

dialog-close = Cerrar el diálogo
button-back-to-subscriptions = Volver a suscripciones
subscription-content-cancel-action-error = Ocurrió un error inesperado. Probá de nuevo.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } por día
plan-price-interval-weekly = { $amount } por semana
plan-price-interval-monthly = { $amount } mensuales
plan-price-interval-halfyearly = { $amount } cada 6 meses
plan-price-interval-yearly = { $amount } al año

## Component - SubscriptionTitle

next-subscription-create-title = Configurá tu suscripción
next-subscription-success-title = Confirmación de la suscripción
next-subscription-processing-title = Confirmando suscripción…
next-subscription-error-title = Error al confirmar la suscripción…
subscription-title-sub-exists = Ya te suscribiste
subscription-title-plan-change-heading = Revisá tu cambio
subscription-title-not-supported = Este cambio de plan de suscripción no está soportado
next-sub-guarantee = 30 días de garantía de devolución de dinero

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Términos del servicio
next-privacy = Nota de privacidad
next-terms-download = Descargar términos
terms-and-privacy-stripe-label = { -brand-mozilla } usa { -brand-name-stripe } para el procesamiento seguro de los pagos.
terms-and-privacy-stripe-link = Política de privacidad de { -brand-name-stripe }
terms-and-privacy-paypal-label = { -brand-mozilla } usa { -brand-paypal } para el procesamiento seguro de los pagos.
terms-and-privacy-paypal-link = Política de privacidad de { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = { -brand-mozilla } usa { -brand-name-stripe } y { -brand-paypal } para el procesamiento seguro de los pagos.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Plan actual
upgrade-purchase-details-new-plan-label = Nuevo plan
upgrade-purchase-details-promo-code = Código promocional
upgrade-purchase-details-tax-label = Impuestos y tarifas
# "Credit issued to account" refers to credit that will be added to the account balance that will be used toward future invoices
upgrade-purchase-details-credit-to-account = Crédito emitido a la cuenta
upgrade-purchase-details-credit-will-be-applied = El crédito se aplicará a tu cuenta y se utilizará para facturas futuras.

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (Diario)
upgrade-purchase-details-new-plan-weekly = { $productName } (Semanal)
upgrade-purchase-details-new-plan-monthly = { $productName } (Mensual)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (6 meses)
upgrade-purchase-details-new-plan-yearly = { $productName } (Anual)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout start
metadata-title-checkout-start = Finalizar compra | { $productTitle }
metadata-description-checkout-start = Ingresá tus detalles de pago para completar la compra.
# Checkout processing
metadata-title-checkout-processing = Procesando | { $productTitle }
metadata-description-checkout-processing = Esperá mientras terminamos de procesar tu pago.
# Checkout error
metadata-title-checkout-error = Error | { $productTitle }
metadata-description-checkout-error = Hubo un error procesando tu suscripción. Si este problema persiste, contactá a soporte.
# Checkout success
metadata-title-checkout-success = Éxito | { $productTitle }
metadata-description-checkout-success = ¡Felicitaciones! Has completado exitosamente tu compra.
# Checkout needs_input
metadata-title-checkout-needs-input = Acción requerida | { $productTitle }
metadata-description-checkout-needs-input = Completá la acción requerida para proceder con tu pago.
# Upgrade start
metadata-title-upgrade-start = Actualizar | { $productTitle }
metadata-description-upgrade-start = Ingresá tus detalles de pago para completar la actualización.
# Upgrade processing
metadata-title-upgrade-processing = Procesando | { $productTitle }
metadata-description-upgrade-processing = Esperá mientras terminamos de procesar tu pago.
# Upgrade error
metadata-title-upgrade-error = Error | { $productTitle }
metadata-description-upgrade-error = Hubo un error procesando la actualización. Si este problema persiste, contactá a soporte.
# Upgrade success
metadata-title-upgrade-success = Éxito | { $productTitle }
metadata-description-upgrade-success = ¡Felicitaciones! Has completado exitosamente la actualización.
# Upgrade needs_input
metadata-title-upgrade-needs-input = Acción requerida | { $productTitle }
metadata-description-upgrade-needs-input = Completá la acción requerida para proceder con tu pago.
# Default
metadata-title-default = Página no encontrada | { $productTitle }
metadata-description-default = La página solicitada no fue encontrada.

## Coupon Error Messages

next-coupon-error-cannot-redeem = El código que ingresaste no puede canjearse — tu cuenta tiene una suscripción previa a uno de nuestros servicios.
next-coupon-error-expired = El código que ingresaste ya caducó.
next-coupon-error-generic = Ocurrió un error al procesar el código. Volvé a probar.
next-coupon-error-invalid = El código que ingresaste es inválido.
# "Limit" refers to the maximum number of times a coupon can be redeemed.
next-coupon-error-limit-reached = El código que ingresaste ya llegó a su límite.

## Stay Subscribed Error Messages

stay-subscribed-error-expired = Esta oferta ya caducó.
stay-subscribed-error-discount-used = Código de descuento ya aplicado.
# $productTitle (String) - The name of the product
stay-subscribed-error-not-current-subscriber = Este descuento solo está disponible para suscriptores actuales de { $productTitle }.
stay-subscribed-error-still-active = Tu suscripción de { $productTitle } todavía está activa.
stay-subscribed-error-general = Hubo un problema con la renovación de la suscripción.
