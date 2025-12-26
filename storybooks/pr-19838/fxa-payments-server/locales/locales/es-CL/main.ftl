



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Cuentas de Firefox
-product-mozilla-account = Cuenta de Mozilla
-product-mozilla-accounts = Cuentas de Mozilla
-product-firefox-account = Cuenta de Firefox
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = MasterCard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Error de aplicación general
app-general-err-message = Algo se fue a las pailas. Por favor, vuelve a intentarlo más tarde.
app-query-parameter-err-heading = Solicitud incorrecta: parámetros de consulta no válidos


app-footer-mozilla-logo-label = Logo de { -brand-mozilla }
app-footer-privacy-notice = Aviso de privacidad del sitio web
app-footer-terms-of-service = Términos del servicio


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Abre en una nueva ventana


app-loading-spinner-aria-label-loading = Cargando…


app-logo-alt-3 =
    .alt = Logotipo de { -brand-mozilla } m



settings-home = Inicio de la cuenta
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Código promocional aplicado
coupon-submit = Aplicar
coupon-remove = Eliminar
coupon-error = El código que ingresaste no es válido o está vencido.
coupon-error-generic = Ocurrió un error al procesar el código. Por favor, vuelve a intentarlo.
coupon-error-expired = El código que ingresaste ha expirado.
coupon-error-limit-reached = El código que ingresaste ha alcanzado su límite.
coupon-error-invalid = El código que ingresaste es inválido.
coupon-enter-code =
    .placeholder = Ingresar código


default-input-error = Este campo es requerido
input-error-is-required = { $label } es requerido


brand-name-mozilla-logo = Logo de { -brand-mozilla }


new-user-sign-in-link-2 = ¿Ya tienes una { -product-mozilla-account }? <a>Conéctate</a>
new-user-enter-email =
    .label = Ingresa tu correo
new-user-confirm-email =
    .label = Confirma tu correo
new-user-subscribe-product-updates-mozilla = Me gustaría recibir noticias y actualizaciones de productos de { -brand-mozilla }
new-user-subscribe-product-updates-snp = Me gustaría recibir noticias y actualizaciones sobre seguridad y privacidad de { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Me gustaría recibir noticias y actualizaciones de productos de { -product-mozilla-hubs } y { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Me gustaría recibir noticias y actualizaciones de productos de { -product-mdn-plus } y { -brand-mozilla }
new-user-subscribe-product-assurance = Solo usamos tu correo electrónico para crear tu cuenta. Nunca lo venderemos a terceros.
new-user-email-validate = El correo no es válido
new-user-email-validate-confirm = Los correos no coinciden
new-user-already-has-account-sign-in = Ya tienes una cuenta. <a>Conéctate</a>
new-user-invalid-email-domain = ¿Correo mal escrito? { $domain } no ofrece servicio de correo.


payment-confirmation-thanks-heading = ¡Gracias!
payment-confirmation-thanks-heading-account-exists = ¡Gracias, ahora revisa tu correo!
payment-confirmation-thanks-subheading = Un correo de confirmación ha sido enviado a { $email } con detalles sobre como empezar con { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Recibirás un correo en { $email } con instrucciones para configurar tu cuenta, así como los detalles de tu pago.
payment-confirmation-order-heading = Detalles de la orden
payment-confirmation-invoice-number = Factura #{ $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Información de pago
payment-confirmation-amount = { $amount } por { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } diarios
       *[other] { $amount } cada { $intervalCount } días
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } semanales
       *[other] { $amount } cada { $intervalCount } semanas
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mensuales
       *[other] { $amount } cada { $intervalCount } meses
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } anuales
       *[other] { $amount } cada { $intervalCount } años
    }
payment-confirmation-download-button = Continuar para descargar


payment-confirm-with-legal-links-static-3 = Autorizo a { -brand-mozilla } para que cargue a mi método de pago por el monto mostrado, de acuerdo con los <termsOfServiceLink >Términos del servicio</termsOfServiceLink> y  el <privacyNoticeLink>aviso de privacidad</privacyNoticeLink>, hasta que cancele mi suscripción.
payment-confirm-checkbox-error = Debe completar esto antes de seguir adelante


payment-error-retry-button = Volver a intentarlo
payment-error-manage-subscription-button = Gestionar mi suscripción


iap-upgrade-already-subscribed-2 = Ya tienes una suscripción a { $productName } a través de la tienda de aplicaciones { -brand-google } o { -brand-apple }.
iap-upgrade-no-bundle-support = No admitimos actualizaciones para estas suscripciones, pero lo haremos pronto.
iap-upgrade-contact-support = Todavía puede obtener este producto — por favor contacta con el soporte para que podamos ayudarte.
iap-upgrade-get-help-button = Obtener ayuda


payment-name =
    .placeholder = Nombre completo
    .label = El nombre tal como aparece en tu tarjeta
payment-cc =
    .label = Tu tarjeta
payment-cancel-btn = Cancelar
payment-update-btn = Actualizar
payment-pay-btn = Pagar ahora
payment-pay-with-paypal-btn-2 = Pagar con { -brand-paypal }
payment-validate-name-error = Por favor, ingresa tu nombre


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } usa { -brand-name-stripe } y { -brand-paypal } para el procesamiento seguro de pagos.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Política de privacidad de { -brand-name-stripe }</stripePrivacyLink> y <paypalPrivacyLink>política de privacidad de { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } usa { -brand-paypal } para el procesamiento seguro de pagos.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Política de privacidad de { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } usa { -brand-name-stripe } para el procesamiento seguro de pagos.
payment-legal-link-stripe-3 = <stripePrivacyLink>Política de privacidad de { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Elige tu método de pago
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primero, deberás aprobar tu suscripción


payment-processing-message = Por favor, espera mientras procesamos tu pago…


payment-confirmation-cc-card-ending-in = Tarjeta terminada en { $last4 }


pay-with-heading-paypal-2 = Pagar con { -brand-paypal }


plan-details-header = Detalles del producto
plan-details-list-price = Precio de lista
plan-details-show-button = Mostrar detalles
plan-details-hide-button = Ocultar detalles
plan-details-total-label = Total
plan-details-tax = Impuestos y comisiones


product-no-such-plan = No existe ese plan para este producto.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } por impuestos
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } al día
       *[other] { $priceAmount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } al día
           *[other] { $priceAmount } cada { $intervalCount } días
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } a la semana
       *[other] { $priceAmount } cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } a la semana
           *[other] { $priceAmount } cada { $intervalCount } semanas
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } al mes
       *[other] { $priceAmount } cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } al mes
           *[other] { $priceAmount } cada { $intervalCount } meses
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } al año
       *[other] { $priceAmount } cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } al año
           *[other] { $priceAmount } cada { $intervalCount } años
        }
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos al día
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos al día
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } días
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos a la semana
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos a la semana
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } semanas
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos al mes
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos al mes
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount } meses
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + { $taxAmount } por impuestos al año
       *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount }años
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } por impuestos al año
           *[other] { $priceAmount } + { $taxAmount } por impuestos cada { $intervalCount }años
        }


subscription-create-title = Configurar tu suscripción
subscription-success-title = Confirmación de suscripción
subscription-processing-title = Confirmando suscripción…
subscription-error-title = Error al confirmar la suscripción…
subscription-noplanchange-title = Este cambio del plan de suscripción no está soportado
subscription-iapsubscribed-title = Ya cuentas con una suscripción
sub-guarantee = 30 días de garantía de devolución de dinero


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Términos del servicio
privacy = Aviso de privacidad
terms-download = Descargar términos


document =
    .title = Cuentas de Firefox
close-aria =
    .aria-label = Cerrar modal
settings-subscriptions-title = Suscripciones
coupon-promo-code = Código promocional


plan-price-interval-day =
    { $intervalCount ->
        [one] { $amount } al día
       *[other] { $amount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $amount } al día
           *[other] { $amount } cada { $intervalCount } días
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } a la semana
       *[other] { $amount } cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $amount } a la semana
           *[other] { $amount } cada { $intervalCount } semanas
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] { $amount } al mes
       *[other] { $amount } cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $amount } al mes
           *[other] { $amount } cada { $intervalCount } meses
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] { $amount } al año
       *[other] { $amount } cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $amount } al año
           *[other] { $amount } cada { $intervalCount } años
        }


general-error-heading = Error general de la aplicación
basic-error-message = Algo se fue a las pailas. Por favor, vuelve a intentarlo más tarde.
payment-error-1 = Hmm. Hubo un problema al autorizar tu pago. Vuelve a intentarlo o ponte en contacto con el emisor de tu tarjeta.
payment-error-2 = Hmm. Hubo un problema al autorizar tu pago. Ponte en contacto con el emisor de tu tarjeta.
payment-error-3b = Ha ocurrido un error inesperado mientras se procesaba tu pago, por favor vuelve a intentarlo.
expired-card-error = Parece que tu tarjeta de crédito está vencida. Prueba con otra tarjeta.
insufficient-funds-error = Parece que tu tarjeta de crédito no tiene suficientes fondos. Prueba con otra tarjeta.
withdrawal-count-limit-exceeded-error = Parece que esta transacción será mayor a tu cupo de crédito. Prueba con otra tarjeta.
charge-exceeds-source-limit = Parece que esta transacción será mayor a tu cupo diario de crédito. Prueba con otra tarjeta o en 24 horas más.
instant-payouts-unsupported = Parece que tu tarjeta de débito no está configurada para pagos instantáneos. Prueba con otra tarjeta de débito o crédito.
duplicate-transaction = Hmm Parece que se acaba de enviar una transacción idéntica. Revisa tu historial de pagos.
coupon-expired = Parece que ese código promocional ha expirado.
card-error = Tu transacción no pudo ser procesada. Verifica la información de tu tarjeta de crédito y vuelve a intentarlo.
country-currency-mismatch = La divisa de esta suscripción no es válida para el país asociado con tu pago.
currency-currency-mismatch = Lo sentimos. No puedes cambiar entre divisas.
location-unsupported = Tu ubicación actual no es compatible según nuestros Términos de Servicio.
no-subscription-change = Lo sentimos. No puedes cambiar tu plan de suscripción.
iap-already-subscribed = Ya tienes una suscripción a través de { $mobileAppStore }.
fxa-account-signup-error-2 = Un error del sistema provocó que tu registro en { $productName } fallara. No se han realizado cobros a tu método de pago. Por favor, vuelve a intentarlo.
fxa-post-passwordless-sub-error = Suscripción confirmada, pero no se pudo cargar la página de confirmación. Por favor, revisa tu correo para configurar tu cuenta.
newsletter-signup-error = No estás registrado para recibir correos de actualización de productos. Puedes volver a intentarlo en la configuración de tu cuenta.
product-plan-error =
    .title = Problemas al cargar los planes
product-profile-error =
    .title = Problemas al cargar el perfil
product-customer-error =
    .title = Problemas al cargar el consumidor
product-plan-not-found = Plan no encontrado
product-location-unsupported-error = Ubicación no compatible


coupon-success = Su plan se renovará automáticamente al precio de lista.
coupon-success-repeating = Tu plan se renovará automáticamente después de { $couponDurationDate } al precio de lista.


new-user-step-1-2 = 1. Crea una { -product-mozilla-account }
new-user-card-title = Ingresa la información de tu tarjeta
new-user-submit = Suscríbete ahora


sub-update-payment-title = Información de pago


pay-with-heading-card-only = Pagar con tarjeta
product-invoice-preview-error-title = Problema al cargar previsualización de factura
product-invoice-preview-error-text = No se pudo cargar la previsualización de factura.


subscription-iaperrorupgrade-title = Todavía no podemos actualizarte


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Revisa tu cambio
sub-change-failed = Falló el cambio del plan
sub-update-acknowledgment =
    Tu plan cambiará de inmediato y se te cobrará hoy una tarifa prorrateada
    para el resto de este ciclo de facturación. A partir del { $startingDate }
    se te cobrará el importe total.
sub-change-submit = Confirmar cambio
sub-update-current-plan-label = Plan actual
sub-update-new-plan-label = Nuevo plan
sub-update-total-label = Nuevo total
sub-update-prorated-upgrade = Actualización prorrateada


sub-update-new-plan-daily = { $productName } (diario)
sub-update-new-plan-weekly = { $productName } (semanal)
sub-update-new-plan-monthly = { $productName } (mensual)
sub-update-new-plan-yearly = { $productName } (anual)
sub-update-prorated-upgrade-credit = El saldo negativo mostrado se aplicará como crédito a tu cuenta y se utilizará para futuras facturas.


sub-item-cancel-sub = Cancelar suscripción
sub-item-stay-sub = Mantener suscripción


sub-item-cancel-msg =
    Ya no podrás usar { $name } después del
    { $period }, el último día de tu ciclo de facturación.
sub-item-cancel-confirm =
    Cancelar mi acceso y mi información guardada dentro de
    { $name } el{ $period }
sub-promo-coupon-applied = Cupón de { $promotion_name } aplicado: <priceDetails></priceDetails>
subscription-management-account-credit-balance = Este pago de suscripción resultó en un crédito en el saldo de tu cuenta: <priceDetails></priceDetails>


sub-route-idx-reactivating = Fallo la reactivación de la suscripción
sub-route-idx-cancel-failed = Fallo la cancelación de la suscripción
sub-route-idx-contact = Contactar al soporte
sub-route-idx-cancel-msg-title = Lamentamos ver que te vayas
sub-route-idx-cancel-msg =
    Tu suscripción a { $name } ha sido cancelada.
          <br />
          Todavía tendrás acceso a { $name } hasta el { $date }.
sub-route-idx-cancel-aside-2 = ¿Tienes preguntas? Visita el <a>soporte de { -brand-mozilla }</a>.


sub-customer-error =
    .title = Problemas al cargar el consumidor
sub-invoice-error =
    .title = Problema al cargar facturas
sub-billing-update-success = Tu información de facturación se ha actualizado exitosamente
sub-invoice-previews-error-title = Problema al cargar previsualizaciones de facturas
sub-invoice-previews-error-text = No se pudo cargar las previsualizaciones de facturas.


pay-update-change-btn = Cambiar
pay-update-manage-btn = Gestionar


sub-next-bill = Próxima facturación el { $date }
sub-next-bill-due-date = Próxima facturación vence el { $date }
sub-expires-on = Expira el { $date }




pay-update-card-exp = Vence el { $expirationDate }
sub-route-idx-updating = Actualizando información de pagos…
sub-route-payment-modal-heading = Información de pago inválida
sub-route-payment-modal-message-2 = Parece que hay un error con tu cuenta de { -brand-paypal }, necesitamos que tomes las medidas necesarias para resolver este problema de pago.
sub-route-missing-billing-agreement-payment-alert = Información de pago inválida; Hay un error con tu cuenta. <div>Gestionar</div>
sub-route-funding-source-payment-alert = Información de pago inválida; Hay un error con tu cuenta. Esta alerta puede demorar un poco en desaparecer después de que actualices exitosamente tu información. <div>Gestionar</div>


sub-item-no-such-plan = No existe ese plan para esta suscripción.
invoice-not-found = Factura posterior no encontrada
sub-item-no-such-subsequent-invoice = Factura posterior no encontrada para esta suscripción.
sub-invoice-preview-error-title = Previsualización de la factura no encontrada
sub-invoice-preview-error-text = Previsualización de la factura no encontrada para esta suscripción


reactivate-confirm-dialog-header = ¿Quieres seguir usando { $name }?
reactivate-confirm-copy =
    Tu acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } a la tarjega termianda en { $last } el { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Tu acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } el { $endDate }.
reactivate-confirm-button = Resuscribir


reactivate-panel-copy = Perderás acceso a { $name } el <strong>{ $date }</strong>.
reactivate-success-copy = ¡Gracias! Está todo listo.
reactivate-success-button = Cerrar


sub-iap-item-google-purchase-2 = { -brand-google }: Compra desde la aplicación
sub-iap-item-apple-purchase-2 = { -brand-apple }: Compra desde la aplicación
sub-iap-item-manage-button = Gestionar
