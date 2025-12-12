## Page

checkout-signin-or-create = 1. Entre na sua conta ou crie uma { -product-mozilla-account }
# This string appears as a separation between the two sign-in options, "Enter your email"(signin-form-email-input) "or"(this string) "Continue with Google"(continue-signin-with-google-button) / "Continue with Apple"(continue-signin-with-apple-button)
checkout-signin-options-or = ou
continue-signin-with-google-button = Continuar com { -brand-google }
continue-signin-with-apple-button = Continuar com { -brand-apple }
next-payment-method-header = Escolha um método de pagamento
# This message is used to indicate the second step in a multi step process.
payment-method-header-second-step-next = 2. { next-payment-method-header }
next-payment-method-first-approve = Primeiro você precisa aprovar sua assinatura
# $productName (String) - The name of the product to create subscription, e.g. Mozilla VPN
location-header = Selecione seu país e digite o código postal <p>para continuar o pagamento do { $productName }</p>
location-banner-info = Não conseguimos detectar sua localização automaticamente
location-required-disclaimer = Usamos essas informações somente para calcular impostos e moeda.
location-banner-currency-change = Não é aceito mudar de moeda. Para continuar, selecione um país que corresponda à sua moeda de cobrança atual.

## Page - Upgrade page

upgrade-page-payment-information = Informações de pagamento
# $nextInvoiceDate (number) - The date of the next invoice
upgrade-page-acknowledgment = Seu plano mudará imediatamente. Será cobrado hoje um valor proporcional ao restante deste ciclo de faturamento. A partir de { $nextInvoiceDate } será cobrado o valor total.

## Authentication Error page

checkout-error-boundary-retry-button = Tentar novamente
checkout-error-boundary-basic-error-message = Algo deu errado. Tente novamente ou <contactSupportLink>entre em contato com o suporte</contactSupportLink>.

## Error pages - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-error-manage-subscription-button = Gerenciar minha assinatura
next-payment-error-retry-button = Tentar novamente
next-basic-error-message = Algo deu errado. Tente novamente mais tarde.
checkout-error-contact-support-button = Entre em contato com o suporte
checkout-error-not-eligible = Você não está qualificado para assinar este produto. Entre em contato com o suporte para receber ajuda.
checkout-error-already-subscribed = Você já tem assinatura deste produto.
checkout-error-contact-support = Entre em contato com o suporte para receber ajuda.
cart-error-currency-not-determined = Não foi possível determinar a moeda para esta compra, tente novamente.
checkout-processing-general-error = Ocorreu um erro inesperado ao processar seu pagamento, tente novamente.

## Processing page and Needs Input page - /checkout and /upgrade
## Common strings used in multiple pages

next-payment-processing-message = Aguarde enquanto processamos seu pagamento…

## Success page - /checkout and /upgrade
## Common strings used in multiple checkout pages

next-payment-confirmation-thanks-heading-account-exists = Obrigado, agora verifique seu email!
# $email (String) - The user's email.
payment-confirmation-thanks-subheading-account-exists-2 = Você receberá um email em { $email } com instruções sobre sua assinatura, bem como seus detalhes de pagamento.
next-payment-confirmation-order-heading = Detalhes do pedido
# $invoiceNumber (String) - Invoice number of the successful payment
next-payment-confirmation-invoice-number = Fatura #{ $invoiceNumber }
# $invoiceDate (Date) - Start date of the latest invoice
next-payment-confirmation-invoice-date = { $invoiceDate }
next-payment-confirmation-details-heading-2 = Informação de pagamento

## Success pages (/checkout and /upgrade)
## Common strings used in multiple checkout pages

next-payment-confirmation-download-button = Continuar para baixar

## Success pages (/checkout and /upgrade), Start page (/upgrade)
## Common strings used in multiple checkout pages

# $last4 (Number) - Last four numbers of credit card
next-payment-confirmation-cc-card-ending-in = Cartão com final { $last4 }

## Page - Subscription Management

subscription-management-subscriptions-heading = Assinaturas
subscription-management-payment-details-heading = Detalhes do pagamento
subscription-management-email-label = Email
subscription-management-payment-method-label = Método de pagamento
subscription-management-button-add-payment-method-aria = Adicionar método de pagamento
subscription-management-button-add-payment-method = Adicionar
subscription-management-button-manage-payment-method-aria = Gerenciar método de pagamento
subscription-management-button-manage-payment-method = Gerenciar
subscription-management-active-subscriptions-heading = Assinaturas ativas
subscription-management-button-support = Obter ajuda
subscription-management-button-manage-subscription-1 = Gerenciar assinatura
manage-payment-methods-heading = Gerenciar métodos de pagamento
# Page - Not Found
page-not-found-title = Página não encontrada
page-not-found-description = A página solicitada não foi encontrada. Fomos notificados e corrigiremos os links que podem estar quebrados.
page-not-found-back-button = Voltar

## Navigation breadcrumbs

# Link title - Subscriptions management
subscription-management-breadcrumb-subscriptions = Assinaturas

## CancelSubscription

subscription-cancellation-dialog-title = Ficamos tristes com sua decisão.

## Component - Payment Consent Checkbox

next-payment-confirm-with-legal-links-static-3 = Autorizo à { -brand-mozilla } cobrar com meu método de pagamento a quantia exibida, de acordo com os <termsOfServiceLink>Termos do serviço</termsOfServiceLink> e o <privacyNoticeLink>Aviso de privacidade</privacyNoticeLink>, até eu cancelar minha assinatura.
next-payment-confirm-checkbox-error = Você precisa concluir isto antes de prosseguir

## Checkout Form

next-new-user-submit = Assinar agora
next-payment-validate-name-error = Digite seu nome
next-pay-with-heading-paypal = Pagar com { -brand-paypal }
# Label for the Full Name input
payment-name-label = Nome como aparece no seu cartão
payment-name-placeholder = Nome completo

## Component - CouponForm

next-coupon-enter-code =
    .placeholder = Digitar código
# Title of container where a user can input a coupon code to get a discount on a subscription.
next-coupon-promo-code = Código promocional
# Title of container showing discount coupon code applied to a subscription.
next-coupon-promo-code-applied = Código promocional aplicado
next-coupon-remove = Remover
next-coupon-submit = Aplicar

# Component - Header

payments-header-help =
    .title = Ajuda
    .aria-label = Ajuda
    .alt = Ajuda
payments-header-bento =
    .title = Produtos da { -brand-mozilla }
    .aria-label = Produtos da { -brand-mozilla }
    .alt = Logotipo da { -brand-mozilla }
payments-header-bento-close =
    .alt = Fechar
payments-header-bento-tagline = Mais produtos da { -brand-mozilla } que protegem sua privacidade
payments-header-bento-firefox-desktop = Navegador { -brand-firefox } para computador
payments-header-bento-firefox-mobile = Navegador { -brand-firefox } para dispositivos móveis
payments-header-bento-monitor = { -product-mozilla-monitor }
payments-header-bento-firefox-relay = { -product-firefox-relay }
payments-header-bento-vpn = { -product-mozilla-vpn }
payments-header-bento-made-by-mozilla = Feito pela { -brand-mozilla }
payments-header-avatar =
    .title = Menu da { -product-mozilla-account }
payments-header-avatar-icon =
    .alt = Imagem do perfil da conta
payments-header-avatar-expanded-signed-in-as = Conectado como
payments-header-avatar-expanded-sign-out = Desconectar
payments-client-loading-spinner =
    .aria-label = Carregando…
    .alt = Carregando…

## Payment method management page - Stripe

# Save button for saving a new payment method
payment-method-management-save-method = Salvar método de pagamento
manage-stripe-payments-title = Gerenciar métodos de pagamento

## Payment Section

next-new-user-card-title = Digite as informações do seu cartão

## Component - PurchaseDetails

next-plan-details-header = Detalhes do produto
next-plan-details-list-price = Preço de tabela
next-plan-details-tax = Impostos e taxas
next-plan-details-total-label = Total
next-plan-details-hide-button = Ocultar detalhes
next-plan-details-show-button = Mostra detalhes
next-coupon-success = Seu plano será renovado automaticamente pelo preço de tabela.
# $couponDurationDate (Date) - The date at which the coupon is no longer valid, and the subscription is billed the list price.
next-coupon-success-repeating = Seu plano será renovado automaticamente após { $couponDurationDate } pelo preço de tabela.

## Select Tax Location

select-tax-location-title = Localização
select-tax-location-edit-button = Editar
select-tax-location-save-button = Salvar
select-tax-location-continue-to-checkout-button = Continuar para pagamento
select-tax-location-country-code-label = País
select-tax-location-country-code-placeholder = Selecione seu país
select-tax-location-error-missing-country-code = Selecione seu país
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN
select-tax-location-product-not-available = O { $productName } não está disponível neste local.
select-tax-location-postal-code-label = Código postal
select-tax-location-postal-code =
    .placeholder = Digite seu código postal
select-tax-location-error-missing-postal-code = Digite seu código postal
select-tax-location-error-invalid-postal-code = Insira um código postal válido
select-tax-location-successfully-updated = Sua localização foi atualizada.
select-tax-location-error-location-not-updated = Sua localização não pôde ser atualizada. Tente novamente.
#  $currencyDisplayName (String) - The display name of a currency code, e.g. US Dollar
select-tax-location-invalid-currency-change = Sua conta é cobrada em { $currencyDisplayName }. Selecione um país que use o { $currencyDisplayName }.
select-tax-location-invalid-currency-change-default = Selecione um país que corresponda à moeda das suas assinaturas ativas.
select-tax-location-new-tax-rate-info = Ao mudar de local, a nova alíquota será aplicada a todas as assinaturas ativas em sua conta, começando no próximo ciclo de cobrança.
signin-form-continue-button = Continuar
signin-form-email-input = Digite seu email
signin-form-email-input-missing = Digite seu email
signin-form-email-input-invalid = Forneça um email válido
next-new-user-subscribe-product-updates-mdnplus = Quero receber notícias e novidades de produtos de { -product-mdn-plus } e { -brand-mozilla }
next-new-user-subscribe-product-updates-mozilla = Quero receber notícias e novidades de produtos da { -brand-mozilla }
next-new-user-subscribe-product-updates-snp = Quero de receber notícias e novidades da { -brand-mozilla } sobre segurança e privacidade
next-new-user-subscribe-product-assurance = Só usamos seu email para criar sua conta. Nunca iremos vender a terceiros.

## $billOnDate (Date) - The billing date of the current invoice (e.g., September 8, 2025)
## $creditApplied (Number) - The amount from account credit balance used to reduce the amount due on the invoice
## $currentPeriodEnd (Date) - The end date of the subscription's current billing period (e.g., September, 8, 2025)
## $invoiceTotal (Number) - The amount billed (excluding tax if tax does not exist). It will be formatted as currency.
## $nextBillDate (Date) - The date for the next time a charge will occur (e.g., September 8, 2025)
## $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
## $promotionName (String) - The name of the promotion.
## $taxDue (Number) - The tax added on, not included in amount. It will be formatted as currency.

subscription-content-button-stay-subscribed = Manter assinatura
    .aria-label = Manter a assinatura do { $productName }
subscription-content-button-cancel-subscription = Cancelar assinatura
    .aria-label = Cancelar sua assinatura do { $productName }

##

subscription-content-cancel-action-error = Ocorreu um erro inesperado. Tente novamente.

## PriceInterval - shared by multiple components, including Details and PurchaseDetails
## $amount (Number) - The amount billed. It will be formatted as currency.

plan-price-interval-daily = { $amount } por dia
plan-price-interval-weekly = { $amount } por semana
plan-price-interval-monthly = { $amount } por mês
plan-price-interval-halfyearly = { $amount } a cada 6 meses
plan-price-interval-yearly = { $amount } por ano

## Component - SubscriptionTitle

next-subscription-create-title = Configurar assinatura
next-subscription-success-title = Confirmação de assinatura
next-subscription-processing-title = Confirmando assinatura…
next-subscription-error-title = Erro ao confirmar assinatura…
subscription-title-sub-exists = Você já tem assinatura
subscription-title-plan-change-heading = Confira sua alteração
next-sub-guarantee = Garantia de devolução do dinheiro em 30 dias

## Component - TermsAndPrivacy

# "Mozilla Accounts" is capitalized in this instance for title case in English
# This heading is followed by links to Terms of Service and Privacy Notice
next-subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts(capitalization: "uppercase") }
next-terms = Termos do serviço
next-privacy = Aviso de privacidade
next-terms-download = Baixar termos
terms-and-privacy-stripe-label = A { -brand-mozilla } usa o { -brand-name-stripe } para processamento seguro de pagamentos.
terms-and-privacy-stripe-link = Política de privacidade do { -brand-name-stripe }
terms-and-privacy-paypal-label = A { -brand-mozilla } usa o { -brand-paypal } para processamento seguro de pagamentos.
terms-and-privacy-paypal-link = Política de privacidade do { -brand-paypal }
terms-and-privacy-stripe-and-paypal-label = A { -brand-mozilla } usa o { -brand-name-stripe } e o { -brand-paypal } para processamento seguro de pagamentos.

## Component - UpdatedPurchaseDetails

upgrade-purchase-details-current-plan-label = Plano atual
upgrade-purchase-details-new-plan-label = Novo plano
upgrade-purchase-details-promo-code = Código promocional
upgrade-purchase-details-tax-label = Impostos e taxas

## $productName (String) - Name of the upgraded product (e.g. Mozilla VPN)
## Daily/Weekly/Monthly/Yearly refers to the subscription interval/amount of time between billing occurrences

upgrade-purchase-details-new-plan-daily = { $productName } (diariamente)
upgrade-purchase-details-new-plan-weekly = { $productName } (semanalmente)
upgrade-purchase-details-new-plan-monthly = { $productName } (mensalmente)
upgrade-purchase-details-new-plan-halfyearly = { $productName } (semestral)
upgrade-purchase-details-new-plan-yearly = { $productName } (anualmente)

## Page Metadata Information
## $productTitle (String) - The name of the product to create subscription, e.g. Mozilla VPN

# Checkout processing
metadata-title-checkout-processing = Processando | { $productTitle }
metadata-description-checkout-processing = Aguarde enquanto terminamos de processar seu pagamento.
# Checkout error
metadata-title-checkout-error = Erro | { $productTitle }
# Checkout success
metadata-title-checkout-success = Sucesso | { $productTitle }
metadata-description-checkout-success = Parabéns! Você concluiu sua compra com sucesso.
# Checkout needs_input
metadata-title-checkout-needs-input = Ação necessária | { $productTitle }
# Upgrade error
metadata-title-upgrade-error = Erro | { $productTitle }
# Upgrade success
metadata-title-upgrade-success = Sucesso | { $productTitle }
# Default
metadata-title-default = Página não encontrada | { $productTitle }
