## Component - PlanDetails

next-plan-details-header = Detalles del producto
next-plan-details-list-price = Lista de precios
next-plan-details-show-button = Mostrar detalles
next-plan-details-hide-button = Ocultar detalles
next-plan-details-total-label = Total
next-plan-details-tax = Impuestos y tasas

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

next-terms = Términos del servicio
next-privacy = Aviso de privacidad
next-terms-download = Descargar términos

payment-confirmation-thanks-heading = ¡Gracias!

# $email (string) - The user's email.
# $productName (String) - The name of the subscribed product.
payment-confirmation-thanks-subheading = Se ha enviado un correo electrónico de confirmación a { $email } con detalles sobre cómo comenzar a usar { $product_name }.

payment-confirmation-order-heading = Detalles del pedido
payment-confirmation-invoice-number = Factura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
payment-confirmation-invoice-date = { $invoiceDate }

payment-confirmation-details-heading-2 = Información de pago
payment-confirmation-amount = { $amount } por { $interval }
payment-confirmation-cc-card-ending-in = Tarjeta que termina en { $last4 }

payment-confirmation-download-button = Continuar para descargar

subscription-success-title = Confirmación de la suscripción
subscription-error-title = Error al confirmar la suscripción…
iap-upgrade-contact-support = Todavía puedes obtener este producto — por favor contacta con el equipo de soporte para que podamos ayudarte.
payment-error-manage-subscription-button = Administrar mi suscripción
basic-error-message = Algo ha salido mal. Por favor, inténtalo de nuevo más tarde.
payment-error-retry-button = Volver a intentarlo

sub-guarantee = 30 días de garantía de devolución de dinero
