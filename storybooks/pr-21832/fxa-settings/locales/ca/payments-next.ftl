not-found-page-title-terms = No s'ha trobat la pàgina
not-found-page-button-terms-manage-subscriptions = Gestiona les subscripcions

## Page

# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }

## Error page

error-page-account-not-found-continue-button = Continua

## Authentication Error page

checkout-error-boundary-retry-button = Torna-ho a provar

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Gestiona la meva subscripció
next-payment-error-retry-button = Torna-ho a provar
next-basic-error-message = Alguna cosa ha anat malament. Torneu-ho a provar més tard.

## Error pages - Payment method failure messages

intent-card-error = La vostra transacció no s'ha pogut processar. Verifiqueu la informació de la targeta de crèdit i torneu-ho a provar.
intent-expired-card-error = Sembla que la vostra targeta de crèdit ha caducat. Proveu-ho amb una altra targeta.
intent-payment-error-insufficient-funds = Sembla que la vostra targeta de crèdit no té fons suficients. Proveu-ho amb una altra targeta.

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Factura núm. { $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Informació de pagament

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Continua amb la baixada

## Loyalty discount - Not found page

not-found-loyalty-discount-title = No s'ha trobat la pàgina

## Error page

interstitial-offer-error-button-sign-in = Inicia la sessió

## Page - Subscription Management

subscription-management-subscriptions-heading = Subscripcions
# Heading for mobile only quick links menu
subscription-management-jump-to-heading = Ves a
subscription-management-nav-payment-details = Detalls del pagament
subscription-management-payment-details-heading = Detalls del pagament
subscription-management-email-label = Adreça electrònica
subscription-management-payment-method-label = Forma de pagament
subscription-management-button-add-payment-method = Afegeix
subscription-management-button-manage-payment-method = Gestiona
# $expirationDate (Date) - Payment card's expiration date
subscription-management-card-expires-date = Venciment: { $expirationDate }
subscription-management-button-support = Obteniu ajuda
# $date (String) - Date of next bill
subscription-management-iap-sub-expires-on-expiry-date = Venciment: { $date }
subscription-management-button-manage-subscription-1 = Gestiona la subscripció
manage-payment-methods-heading = Gestiona les formes de pagament
# Page - Not Found
page-not-found-title = No s'ha trobat la pàgina
page-not-found-back-button = Vés enrere

## Navigation breadcrumbs

# Link title - Account settings
subscription-management-breadcrumb-account-home = Pàgina principal del compte
# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Subscripcions

## Checkout Form

next-new-user-submit = Subscriu-m'hi ara

## Churn flow - cancel

churn-cancel-flow-button-cancel-subscription = Cancel·la la subscripció
churn-cancel-flow-button-manage-subscriptions = Gestiona les subscripcions

## $productName (String) - The name of the product associated with the subscription.

churn-stay-subscribed-title-subscription-renewed = Subscripció renovada

## Component - CouponForm

next-coupon-submit = Aplica

## $amount (Number) - The charge amount excluding tax. It will be formatted as currency.
## $date (Date) - The date the free trial ends or expires (e.g., September 8, 2026)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $tax (Number) - The tax amount. It will be formatted as currency.

free-trial-content-button-cancel-subscription = Cancel·la la subscripció

## $billedOnDate (Date) - The date of the last bill (e.g., July 20, 2025)
## $invoiceTotal (Number) - The invoice total amount excluding tax. It will be formatted as currency.
## $taxDue (Number) - The tax amount. It will be formatted as currency.

free-trial-content-last-bill-no-tax = { $invoiceTotal }

##

payments-header-help =
    .alt = Ajuda
    .aria-label = Ajuda
    .title = Ajuda
payments-header-bento-close =
    .alt = Tanca
payments-header-bento-firefox-desktop = Navegador { -brand-firefox } per a l'escriptori
payments-header-bento-firefox-mobile = Navegador { -brand-firefox } per al mòbil
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Creat per { -brand-mozilla }
payments-header-avatar-icon =
    .alt = Imatge de perfil del compte
payments-header-avatar-expanded-sign-out = Tanca la sessió

## Interstitial Offer

interstitial-offer-cancel-subscription-button = Cancel·la la subscripció

##

payments-client-loading-spinner =
    .alt = S'està carregant…
    .aria-label = S'està carregant…

## Payment method management page - Stripe

manage-stripe-payments-title = Gestiona les formes de pagament

## Component - PurchaseDetails

next-plan-details-header = Detalls del producte
next-plan-details-total-label = Total
purchase-details-subtotal-label = Subtotal
next-plan-details-hide-button = Amaga els detalls
next-plan-details-show-button = Mostra els detalls

## Select Tax Location

select-tax-location-title = Ubicació
select-tax-location-edit-button = Edita
select-tax-location-save-button = Desa
select-tax-location-country-code-label = País
select-tax-location-postal-code-label = Codi postal
signin-form-continue-button = Continua
signin-form-email-input = Introduïu la vostra adreça electrònica

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-last-bill-no-tax = { $invoiceTotal }
subscription-content-expires-on-expiry-date = Venciment: { $date }
subscription-content-next-bill-no-tax-1 = { $nextInvoiceTotal }

##

dialog-close = Tanca el diàleg

## Churn flow - Error page

churn-error-page-button-manage-subscriptions = Gestiona les subscripcions
churn-error-page-button-try-again = Torna-ho a provar
churn-error-page-button-sign-in = Inicia la sessió

## Component - SubscriptionTitle

next-subscription-create-title = Configureu la vostra subscripció

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Condicions del servei
next-privacy = Avís de privadesa

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Pla actual
upgrade-purchase-details-new-plan-label = Pla nou

## Manage Payment Method Error Messages

manage-payment-method-intent-error-card-declined = La vostra transacció no s'ha pogut processar. Verifiqueu la informació de la targeta de crèdit i torneu-ho a provar.
manage-payment-method-intent-error-expired-card-error = Sembla que la vostra targeta de crèdit ha caducat. Proveu-ho amb una altra targeta.
manage-payment-method-intent-error-insufficient-funds = Sembla que la vostra targeta de crèdit no té fons suficients. Proveu-ho amb una altra targeta.
