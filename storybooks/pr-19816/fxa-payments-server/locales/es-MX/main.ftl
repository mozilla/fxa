



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox accounts
-product-mozilla-account = Cuenta de Mozilla
-product-mozilla-accounts =
    { $capitalization ->
        [uppercase] Cuentas de Mozilla
       *[lowercase] cuentas de Mozilla
    }
-product-firefox-account = Cuenta de Firefox
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Monitor de Mozilla
-product-firefox-relay = Firefox Relay
-brand-apple = Apple
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Error general de la aplicación
app-general-err-message = Algo salió mal. Por favor, inténtalo de nuevo más tarde.


app-footer-mozilla-logo-label = Logo de { -brand-mozilla }
app-footer-privacy-notice = Aviso de privacidad del sitio web
app-footer-terms-of-service = Términos del servicio


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = { $title } | { -product-mozilla-accounts }


link-sr-new-window = Abrir en una nueva ventana


app-loading-spinner-aria-label-loading = Cargando…


app-logo-alt-3 =
    .alt = { -brand-mozilla } m logotipo



settings-home = Página principal de la cuenta
settings-project-header-title = { -product-mozilla-account }


coupon-promo-code-applied = Código promocional aplicado
coupon-submit = Aplicar
coupon-remove = Eliminar
coupon-error = El código ingresado no es válido o está vencido.
coupon-error-generic = Ha ocurrido un error al procesar el código. Por favor, intenta de nuevo.
coupon-error-expired = El código que ingresaste ha expirado.
coupon-error-limit-reached = El código que ingresaste ha alcanzado su límite.
coupon-error-invalid = El código que ingresaste es inválido.
coupon-enter-code =
    .placeholder = Ingresar código


default-input-error = Este campo es requerido
input-error-is-required = Se requiere { $label }


brand-name-mozilla-logo = Logo de { -brand-mozilla }


new-user-enter-email =
    .label = Ingresa tu correo electrónico
new-user-confirm-email =
    .label = Confirma tu correo electrónico
new-user-subscribe-product-assurance = Utilizamos tu dirección únicamente para crear tu cuenta. Jamás la venderemos a terceros.
new-user-email-validate = El correo electrónico no es válido
new-user-email-validate-confirm = Las direcciones de correo electrónico no coinciden
new-user-already-has-account-sign-in = Ya tienes una cuenta. <a>Iniciar sesión</a>
new-user-invalid-email-domain = ¿Correo mal escrito? { $domain } no ofrece correo.


payment-confirmation-thanks-heading = ¡Gracias!
payment-confirmation-thanks-heading-account-exists = ¡Gracias, ahora revisa tu correo electrónico!
payment-confirmation-thanks-subheading = Se ha enviado un correo electrónico de confirmación a { $email } con detalles sobre cómo comenzar a usar { $product_name }.
payment-confirmation-thanks-subheading-account-exists = Recibirás un mensaje en { $email } con instrucciones para configurar tu cuenta, así como los detalles de tu pago.
payment-confirmation-order-heading = Detalles del pedido
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
        [one] { $amount } a la semana
       *[other] { $amount } cada { $intervalCount } semanas
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } al mes
       *[other] { $amount } cada { $intervalCount } meses
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } al año
       *[other] { $amount } cada { $intervalCount } años
    }
payment-confirmation-download-button = Continuar para descargar


payment-confirm-checkbox-error = Debes completar esto antes de avanzar


payment-error-retry-button = Intentar de nuevo
payment-error-manage-subscription-button = Administrar mi suscripción


iap-upgrade-no-bundle-support = No admitimos actualizaciones para estas suscripciones, pero pronto lo haremos.
iap-upgrade-contact-support = Todavía puedes obtener este producto —  por favor, pónte en contacto con el soporte para poder ayudarte.
iap-upgrade-get-help-button = Obtener ayuda


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


payment-legal-link-stripe-3 = <stripePrivacyLink>{ -brand-name-stripe } política de privacidad</stripePrivacyLink>


payment-method-header = Elige tu método de pago
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = Primero deberás aprobar tu suscripción


payment-processing-message = Por favor, espera mientras procesamos tu pago…


payment-confirmation-cc-card-ending-in = Tarjeta que termina en { $last4 }


pay-with-heading-paypal-2 = Pagar con { -brand-paypal }


plan-details-header = Detalles del producto
plan-details-list-price = Precio de lista
plan-details-show-button = Mostrar detalles
plan-details-hide-button = Ocultar detalles
plan-details-total-label = Total
plan-details-tax = Impuestos y comisiones


product-no-such-plan = No existe ese plan para este producto


price-details-no-tax = { $priceAmount }
price-details-tax = { $priceAmount } + { $taxAmount } impuestos
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
        [one] { $priceAmount } + { $taxAmount } impuestos diariamente
       *[other] { $priceAmount } + { $taxAmount } impuestos cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $priceAmount } + { $taxAmount } impuestos diariamente
           *[other] { $priceAmount } + { $taxAmount } impuestos cada { $intervalCount } días
        }
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


subscription-create-title = Configurar tu suscripción
subscription-success-title = Confirmación de la suscripción
subscription-processing-title = Confirmando suscripción…
subscription-error-title = Error al confirmar la suscripción…
subscription-noplanchange-title = Este cambio del plan de suscripción no está soportado
subscription-iapsubscribed-title = Ya tienes una suscripción
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
        [one] { $amount } diario
       *[other] { $amount } cada { $intervalCount } días
    }
    .title =
        { $intervalCount ->
            [one] { $amount } diario
           *[other] { $amount } cada { $intervalCount } días
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
iap-already-subscribed = Ya tienes una suscripción a través de { $mobileAppStore }.
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


coupon-success = Tu plan se renovará automáticamente al precio de la lista.
coupon-success-repeating = Tu plan se renovará automáticamente después del { $couponDurationDate } al precio de lista.


new-user-card-title = Escribe la información de tu tarjeta
new-user-submit = Suscribirse ahora


sub-update-payment-title = Información del pago


pay-with-heading-card-only = Pagar con tarjeta
product-invoice-preview-error-title = Problema al cargar vista previa de la factura
product-invoice-preview-error-text = No se pudo cargar la vista previa de la factura


subscription-iaperrorupgrade-title = Todavía no podemos actualizarte


brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = Revisa tu cambio
sub-change-failed = El cambio de plan ha fallado
sub-change-submit = Confirmar cambio
sub-update-current-plan-label = Plan actual
sub-update-new-plan-label = Nuevo plan
sub-update-total-label = Nuevo total


sub-update-new-plan-daily = { $productName } (Diario)
sub-update-new-plan-weekly = { $productName } (Semanal)
sub-update-new-plan-monthly = { $productName } (Mensual)
sub-update-new-plan-yearly = { $productName } (Anual)


sub-item-cancel-sub = Cancelar suscripción
sub-item-stay-sub = Mantener suscripción


sub-item-cancel-msg =
    Ya no podrás usar { $name } después de
    { $period }, el último día de tu ciclo de facturación.
sub-item-cancel-confirm =
    Cancelar mi acceso y mi información guardada en
    { $name } el { $period }
sub-promo-coupon-applied = Cupón aplicado por { $promotion_name }: <priceDetails></priceDetails>


sub-route-idx-reactivating = Ha fallado la reactivación de la suscripción
sub-route-idx-cancel-failed = Ha fallado la cancelación de la suscripción
sub-route-idx-contact = Contactar con soporte
sub-route-idx-cancel-msg-title = Lamentamos que te vayas
sub-route-idx-cancel-msg =
    Tu suscripción a { $name } ha sido cancelada.
          <br />
          Todavía tendrás acceso a { $name } hasta el { $date }.


sub-customer-error =
    .title = Problema al cargar cliente
sub-invoice-error =
    .title = Problema al cargar facturas
sub-billing-update-success = Tus datos de facturación han sido actualizados correctamente
sub-invoice-previews-error-title = Problema al cargar vistas previas de facturas
sub-invoice-previews-error-text = No se pudieron cargar vistas previas de facturas


pay-update-change-btn = Cambiar
pay-update-manage-btn = Administrar


sub-next-bill = Próxima facturación el { $date }
sub-expires-on = Expira el { $date }




pay-update-card-exp = Vence { $expirationDate }
sub-route-idx-updating = Actualizando datos de facturación…
sub-route-payment-modal-heading = Datos de facturación inválidos
sub-route-missing-billing-agreement-payment-alert = Datos de pago no válidos, hay un error con tu cuenta. <div>Administrar</div>
sub-route-funding-source-payment-alert = Información de pago no válida; hay un error con tu cuenta. Puede pasar un tiempo antes de que esta alerta desaparezca, aunque hayas actualizado correctamente la información. <div>Administrar</div>


sub-item-no-such-plan = No existe ese plan para esta suscripción.
invoice-not-found = Factura posterior no encontrada
sub-item-no-such-subsequent-invoice = No se encontró la factura posterior para esta suscripción.
sub-invoice-preview-error-title = Vista previa de la factura no encontrada
sub-invoice-preview-error-text = Vista previa de la factura no encontrada para esta suscripción


reactivate-confirm-dialog-header = ¿Quieres seguir usando { $name }?
reactivate-confirm-copy =
    Tu acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } a la tarjeta terminada en { $last } el { $endDate }.
reactivate-confirm-without-payment-method-copy =
    Tu acceso a { $name } continuará y el ciclo de facturación
    y pago se mantendrá igual. El próximo cargo será de
    { $amount } el { $endDate }.
reactivate-confirm-button = Volver a suscribirse


reactivate-panel-copy = Perderás el acceso a { $name } el <strong>{ $date }</strong>.
reactivate-success-copy = ¡Gracias! Está todo listo.
reactivate-success-button = Cerrar


sub-iap-item-manage-button = Administrar
