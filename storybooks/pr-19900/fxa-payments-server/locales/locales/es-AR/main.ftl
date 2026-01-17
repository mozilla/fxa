



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Cuentas de Firefox
-product-mozilla-account = Cuenta de Mozilla
-product-mozilla-accounts = Cuentas de Mozilla
-product-firefox-account = cuenta de Firefox
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
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Error de aplicación general
app-general-err-message = Algo salió mal. Probá de nuevo más tarde.
app-query-parameter-err-heading = Solicitud incorrecta: parámetros de consulta no válidos


app-footer-mozilla-logo-label = Logo de { -brand-mozilla }
app-footer-privacy-notice = Nota de privacidad del sitio web
app-footer-terms-of-service = Términos del servicio


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Se abre en ventana nueva


app-loading-spinner-aria-label-loading = Cargando…


app-logo-alt-3 =
    .alt = Logotipo de { -brand-mozilla } m



settings-home = Inicio de Cuentas
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Código promocional aplicado
coupon-submit = Aplicar
coupon-remove = Eliminar
coupon-error = El código ingresado es inválido o ha expirado.
coupon-error-generic = Ocurrió un error al procesar el código. Volvé a probar.
coupon-error-expired = El código que ingresaste ya caducó.
coupon-error-limit-reached = El código que ingresaste ya llegó a su límite.
coupon-error-invalid = El código que ingresaste es inválido.
coupon-enter-code =
    .placeholder = Ingresar código


default-input-error = Este campo es requerido
input-error-is-required = Se necesita { $label }


brand-name-mozilla-logo = Logo de { -brand-mozilla }


new-user-sign-in-link-2 = ¿Ya tenés una { -product-mozilla-account }? <a>Iniciar sesión</a>
new-user-enter-email =
    .label = Ingresá tu correo electrónico
new-user-confirm-email =
    .label = Confirmá tu correo electrónico
new-user-subscribe-product-updates-mozilla = Me gustaría recibir noticias y actualizaciones sobre los productos de { -brand-mozilla }
new-user-subscribe-product-updates-snp = Me gustaría recibir noticias y actualizaciones sobre seguridad y privacidad de { -brand-mozilla }
new-user-subscribe-product-updates-hubs = Me gustaría recibir noticias y actualizaciones sobre los productos de { -product-mozilla-hubs } y { -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = Me gustaría recibir noticias y actualizaciones sobre los productos de { -product-mdn-plus } y { -brand-mozilla }
new-user-subscribe-product-assurance = Solo usamos tu correo electrónico para crear la cuenta. Nunca lo venderemos a terceros.
new-user-email-validate = El correo electrónico no es válido
new-user-email-validate-confirm = Los correos electrónicos no coinciden
new-user-already-has-account-sign-in = Ya tenés una cuenta. <a>Iniciar sesión</a>
new-user-invalid-email-domain = ¿Dirección de correo electrónico mal escrita? { $domain } no ofrece correo electrónico.


payment-confirmation-thanks-heading = ¡Gracias!
payment-confirmation-thanks-heading-account-exists = ¡Gracias, ahora mirá tu correo electrónico!
payment-confirmation-thanks-subheading = Se envió un correo electrónico de confirmación a { $email } con detalles sobre cómo comenzar con { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Vas a recibir un correo en { $email } con instrucciones para configurar tu cuenta, así como los detalles de tu pago.
payment-confirmation-order-heading = Detalles de la orden
payment-confirmation-invoice-number = Factura número { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = Información de pago
payment-confirmation-amount = { $amount } por { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } diario
       *[other] { $amount } cada { $intervalCount } días
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } semanal
       *[other] { $amount } cada { $intervalCount } semanas
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } mensual
       *[other] { $amount } cada { $intervalCount } meses
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } anual
       *[other] { $amount } cada { $intervalCount } años
    }
payment-confirmation-download-button = Continuar descargando


payment-confirm-with-legal-links-static-3 = Autorizo a { -brand-mozilla } a cobrar de mi método de pago la suma mostrada según los <termsOfServiceLink>términos de servicio</termsOfServiceLink> y <privacyNoticeLink>notas de privacidad</privacyNoticeLink> hasta que cancele mi suscripción.
payment-confirm-checkbox-error = Tenés que completar esto antes de seguir adelante


payment-error-retry-button = Intentar de nuevo
payment-error-manage-subscription-button = Administrar mi suscripción


iap-upgrade-already-subscribed-2 = Ya tenés una suscripción a { $productName } a través de las tiendas de aplicaciones de { -brand-google } o { -brand-apple }.
iap-upgrade-no-bundle-support = No admitimos actualizaciones para estas suscripciones, pero lo haremos pronto.
iap-upgrade-contact-support = Todavía podés obtener este producto; comunicate con la ayuda para que podamos ayudarte.
iap-upgrade-get-help-button = Obtener ayuda


payment-name =
    .placeholder = Nombre completo
    .label = Nombre tal cual aparece en la tarjeta
payment-cc =
    .label = Tu tarjeta
payment-cancel-btn = Cancelar
payment-update-btn = Actualizar
payment-pay-btn = Pagar ahora
payment-pay-with-paypal-btn-2 = Pagar con { -brand-paypal }
payment-validate-name-error = Ingresá tu nombre


payment-legal-copy-stripe-and-paypal-3 = { -brand-mozilla } usa { -brand-name-stripe } y { -brand-paypal } para el procesamiento seguro de los pagos.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>Política de privacidad de { -brand-name-stripe }</stripePrivacyLink> &nbsp; <paypalPrivacyLink>Política de privacidad de { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-paypal-2 = { -brand-mozilla } usa { -brand-paypal } para el procesamiento de pago seguro.
payment-legal-link-paypal-3 = <paypalPrivacyLink>Política de privacidad de { -brand-paypal }</paypalPrivacyLink>.
payment-legal-copy-stripe-3 = { -brand-mozilla } usa { -brand-name-stripe } para el procesamiento seguro de los pagos.
payment-legal-link-stripe-3 = <stripePrivacyLink>Política de privacidad de { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = Elegí tu método de pago
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primero tendrás que aprobar tu suscripción


payment-processing-message = Esperá mientras procesamos tu pago…


payment-confirmation-cc-card-ending-in = Tarjeta que termina en { $last4 }


pay-with-heading-paypal-2 = Pagar con { -brand-paypal }


plan-details-header = Detalles del producto
plan-details-list-price = Precio de lista
plan-details-show-button = Mostrar detalles
plan-details-hide-button = Ocultar detalles
plan-details-total-label = Total
plan-details-tax = Impuestos y tarifas


product-no-such-plan = No existe tal plan para este producto.


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + impuestos { $taxAmount }
price-details-no-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } diario
       *[other] { $priceAmount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } diario
           *[other] { $priceAmount } cada { $intervalCount } días
        }
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
price-details-tax-day =
    { $intervalCount ->
        [one] { $priceAmount } + impuestos { $taxAmount } diario
       *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + impuestos { $taxAmount } diario
           *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } días
        }
price-details-tax-week =
    { $intervalCount ->
        [one] { $priceAmount } + impuestos { $taxAmount } semanal
       *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + impuestos { $taxAmount } semanal
           *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } semanas
        }
price-details-tax-month =
    { $intervalCount ->
        [one] { $priceAmount } + impuestos { $taxAmount } mensual
       *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } meses
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + impuestos { $taxAmount } mensual
           *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } meses
        }
price-details-tax-year =
    { $intervalCount ->
        [one] { $priceAmount } + impuestos { $taxAmount } anual
       *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } años
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + impuestos { $taxAmount } anual
           *[other] { $priceAmount } + impuestos { $taxAmount } cada { $intervalCount } años
        }


subscription-create-title = Configurá tu suscripción
subscription-success-title = Confirmación de la suscripción
subscription-processing-title = Confirmando suscripción…
subscription-error-title = Error al confirmar la suscripción…
subscription-noplanchange-title = Este cambio de plan de suscripción no está soportado
subscription-iapsubscribed-title = Ya suscripto
sub-guarantee = 30 días de garantía de devolución de dinero


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
terms = Términos del servicio
privacy = Nota de privacidad
terms-download = Descargar términos


document =
    .title = Firefox Accounts
close-aria =
    .aria-label = Cerrar modal
settings-subscriptions-title = Suscripciones
coupon-promo-code = Código promocional


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
plan-price-interval-week =
    { $intervalCount ->
        [one] { $amount } semanal
       *[other] { $amount } cada { $intervalCount } semanas
    }
    .title =
        { $intervalCount ->
            [one] { $amount } semanal
           *[other] { $amount } cada { $intervalCount } semanas
        }
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


general-error-heading = Error de aplicación general
basic-error-message = Algo salió mal. Probá de nuevo más tarde.
payment-error-1 = Hmm. Hubo un problema al autorizar el pago. Probá nuevamente o ponete en contacto con el emisor de tu tarjeta.
payment-error-2 = Hmm. Hubo un problema al autorizar el pago. Ponete en contacto con el emisor de tu tarjeta.
payment-error-3b = Ocurrió un error inesperado al procesar tu pago. Intentá nuevamente.
expired-card-error = Parece que la tarjeta de crédito ha expirado. Probá con otra tarjeta.
insufficient-funds-error = Parece que la tarjeta no tiene fondos suficientes. Probá otra tarjeta.
withdrawal-count-limit-exceeded-error = Parece que esta transacción sobrepasará el límite de crédito. Probá otra tarjeta.
charge-exceeds-source-limit = Parece que esta transacción sobrepasará el límite diario de crédito. Probá otra tarjeta o de nuevo en 24 horas.
instant-payouts-unsupported = Parece que la tarjeta de débito no está configurada para pagos instantáneos. Probá con otra tarjeta de débito o crédito.
duplicate-transaction = Hmm. Parece que se acaba de enviar una transacción idéntica. Revisá tu historial de pagos.
coupon-expired = Parece que ese código promocional ha expirado.
card-error = La transacción no pudo ser procesada. Verificá la información de la tarjeta de crédito y probá nuevamente.
country-currency-mismatch = La moneda de esta suscripción no es válida para el país asociado con tu pago.
currency-currency-mismatch = Disculpá. No podés cambiar entre divisas.
location-unsupported = Según nuestros Términos de servicio, tu ubicación actual no está soportada.
no-subscription-change = Lo sentimos. No se puede cambiar el plan de suscripción.
iap-already-subscribed = Ya estás suscripto a través de { $mobileAppStore }.
fxa-account-signup-error-2 = Un error de sistema causó que fallara el registro a { $productName }. El método de pago no ha sido cargado. Intentá nuevamente.
fxa-post-passwordless-sub-error = Suscripción confirmada, pero la página de confirmación no se pudo cargar. Revisá tu correo para configurar tu cuenta.
newsletter-signup-error = No estás registrado para los correos de actualización de producto. Podés volver a intentarlo en la configuración de tu cuenta.
product-plan-error =
    .title = Problemas cargando los planes
product-profile-error =
    .title = Problemas cargando el perfil
product-customer-error =
    .title = Problemas cargando el cliente
product-plan-not-found = Plan no encontrado
product-location-unsupported-error = Ubicación no soportada


coupon-success = Tu plan se renovará automáticamente al precio de lista.
coupon-success-repeating = Tu plan se renovará automáticamente después de { $couponDurationDate } al precio de lista.


new-user-step-1-2 = 1. Creá una { -product-mozilla-account }
new-user-card-title = Ingresá la información de tu tarjeta
new-user-submit = Suscribirse ahora


sub-update-payment-title = Información del pago


pay-with-heading-card-only = Pagar con tarjeta
product-invoice-preview-error-title = Problema cargando las vistas previas de las facturas
product-invoice-preview-error-text = No se pudo cargar la vista previa de la factura


subscription-iaperrorupgrade-title = Todavía no podemos actualizarte


brand-name-google-play-2 = { -google-play } Store
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Revisá tu cambio
sub-change-failed = Falló el cambio del plan
sub-update-acknowledgment =
    Tu plan cambiará de inmediato y se te cobrará un monto
    prorrateado por el resto de este ciclo de facturación. A partir de { $startingDate }
    se te cobrará el importe total.
sub-change-submit = Confirmar cambio
sub-update-current-plan-label = Plan actual
sub-update-new-plan-label = Nuevo plan
sub-update-total-label = Nuevo total
sub-update-prorated-upgrade = Actualización prorrateada


sub-update-new-plan-daily = { $productName } (Diario)
sub-update-new-plan-weekly = { $productName } (Semanal)
sub-update-new-plan-monthly = { $productName } (Mensual)
sub-update-new-plan-yearly = { $productName } (Anual)
sub-update-prorated-upgrade-credit = El saldo negativo mostrado se aplicará como créditos a tu cuenta y se usará para facturas futuras.


sub-item-cancel-sub = Cancelar suscripción
sub-item-stay-sub = Mantener suscripción


sub-item-cancel-msg =
    No se podrá usar { $name } después de
    { $period }, el último día del ciclo de facturación.
sub-item-cancel-confirm =
    Cancelar mi acceso y mi información guardada en
    { $name } el { $period }
sub-promo-coupon-applied = Cupón de { $promotion_name } aplicado: <priceDetails></priceDetails>
subscription-management-account-credit-balance = El pago de esta suscripción resultó en un crédito al saldo de tu cuenta: <priceDetails></priceDetails>


sub-route-idx-reactivating = Falló la reactivación de la suscripción
sub-route-idx-cancel-failed = Falló la cancelación de la suscripción
sub-route-idx-contact = Contactar soporte
sub-route-idx-cancel-msg-title = Lamentamos que te vayas.
sub-route-idx-cancel-msg =
    La suscripción a { $name } ha sido cancelda.
          <br />
          Se podrá acceder a { $name } hasta el { $date }.
sub-route-idx-cancel-aside-2 = ¿Tenés preguntas? Visitá <a>Soporte de { -brand-mozilla }</a>.


sub-customer-error =
    .title = Problemas cargando cliente
sub-invoice-error =
    .title = Problema cargando las facturas
sub-billing-update-success = La información de facturación se ha actualizado correctamente.
sub-invoice-previews-error-title = Problema cargando vistas previas de facturas
sub-invoice-previews-error-text = No se pudieron cargar vistas previas de facturas


pay-update-change-btn = Cambiar
pay-update-manage-btn = Administrar


sub-next-bill = Próxima facturación el { $date }
sub-next-bill-due-date = La próxima factura vence el { $date }
sub-expires-on = Expira el { $date }




pay-update-card-exp = Vence { $expirationDate }
sub-route-idx-updating = Actulizando informción de facturación…
sub-route-payment-modal-heading = Información de facturación no válida
sub-route-payment-modal-message-2 = Parece haber un error con la cuenta de { -brand-paypal }, necesitamos que hagás los pasos necesarios para resolver este problema de pago.
sub-route-missing-billing-agreement-payment-alert = Información de pago no válida; hay un error con la cuenta. <div>Administrar</div>
sub-route-funding-source-payment-alert = Información de pago no válida; hay un error con la cuenta. Esta alerta tomará un tiempo en irse después de actualizar la información exitosamente. <div>Administrar</div>


sub-item-no-such-plan = No existe tal plan para esta suscripción.
invoice-not-found = Factura posterior no encontrada
sub-item-no-such-subsequent-invoice = Factura posterior no encontrada para esta suscripción.
sub-invoice-preview-error-title = Vista previa de factura no encontrada
sub-invoice-preview-error-text = Vista previa de factura no encontrada para esta suscripción


reactivate-confirm-dialog-header = ¿Querés seguir usando { $name }?
reactivate-confirm-copy =
    El acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } a la tarjega que termina en { $last } el { $endDate }.
reactivate-confirm-without-payment-method-copy =
    El acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } el { $endDate }.
reactivate-confirm-button = Resuscribir


reactivate-panel-copy = Se perderá acceso a { $name } el <strong>{ $date }</strong>.
reactivate-success-copy = ¡Gracias! Está todo listo.
reactivate-success-button = Cerrar


sub-iap-item-google-purchase-2 = { -brand-google }: Compras integradas
sub-iap-item-apple-purchase-2 = { -brand-apple }: Compras integradas
sub-iap-item-manage-button = Administrar
