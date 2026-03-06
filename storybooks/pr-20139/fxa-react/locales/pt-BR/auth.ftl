## Non-email strings

session-verify-send-push-title-2 = Está entrando na sua { -product-mozilla-account }?
session-verify-send-push-body-2 = Clique aqui para confirmar que é você
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } é seu código de verificação da { -brand-mozilla }. Expira em 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Código de verificação da { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } é seu código de recuperação da { -brand-mozilla }. Expira em 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Código { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } é seu código de recuperação da { -brand-mozilla }. Expira em 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Código { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = Este é um email automático. Se você recebeu por engano, nenhuma ação é necessária.
subplat-privacy-notice = Aviso de privacidade
subplat-privacy-plaintext = Aviso de privacidade:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Você recebeu este email porque { $email } tem uma { -product-mozilla-account } e você assinou o { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Você recebeu este email porque { $email } tem uma { -product-mozilla-account }.
subplat-explainer-multiple-2 = Você recebeu este email porque { $email } tem uma { -product-mozilla-account } e você assinou vários produtos.
subplat-explainer-was-deleted-2 = Você recebeu este email porque { $email } foi registrado em uma { -product-mozilla-account }.
subplat-manage-account-2 = Gerencie as configurações da sua { -product-mozilla-account } na <a data-l10n-name="subplat-account-page">página da conta</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Gerencie as configurações da sua { -product-mozilla-account } na página da conta: { $accountSettingsUrl }
subplat-terms-policy = Termos e política de cancelamento
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancelar assinatura
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reativar assinatura
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Atualizar informações de cobrança
subplat-privacy-policy = Política de privacidade da { -brand-mozilla }
subplat-privacy-policy-2 = Aviso de privacidade das { -product-mozilla-accounts }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Termos do serviço das { -product-mozilla-accounts(capitalization: "lowercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Jurídico
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacidade
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Ajude-nos a melhorar nossos serviços participando desta <a data-l10n-name="cancellationSurveyUrl">breve pesquisa de opinião</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ajude-nos a melhorar nossos serviços participando desta breve pesquisa de opinião:
payment-details = Detalhes do pagamento:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Número da fatura: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Cobrado: { $invoiceTotal } em { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Próxima fatura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Método de pagamento:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Método de pagamento: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Método de pagamento: { $cardName } com final { $lastFour }
payment-provider-card-ending-in-plaintext = Método de pagamento: Cartão com final { $lastFour }
payment-provider-card-ending-in = <b>Método de pagamento:</b> Cartão com final { $lastFour }
payment-provider-card-ending-in-card-name = <b>Método de pagamento:</b> { $cardName } com final { $lastFour }
subscription-charges-invoice-summary = Resumo da fatura

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Número da fatura:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Número da fatura: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Preço proporcional
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Preço proporcional: { $remainingAmountTotal }
subscription-charges-list-price = Preço de tabela
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Preço de tabela: { $offeringPrice }
subscription-charges-credit-from-unused-time = Crédito de tempo não usado
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Crédito de tempo não usado: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Desconto único
subscription-charges-one-time-discount-plaintext = Desconto único: { $invoiceDiscountAmount }
subscription-charges-discount = Desconto
subscription-charges-discount-plaintext = Desconto: { $invoiceDiscountAmount }
subscription-charges-taxes = Impostos e taxas
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Impostos e taxas: { $invoiceTaxAmount }
subscription-charges-total = <b>Total</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = Total: { $invoiceTotal }
subscription-charges-credit-applied = Crédito aplicado
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = Crédito aplicado: { $creditApplied }
subscription-charges-amount-paid = <b>Valor pago</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Valor pago: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Você recebeu um crédito em conta de { $creditReceived }, que será aplicado em suas futuras faturas.

##

subscriptionSupport = Dúvidas sobre sua assinatura? Nossa <a data-l10n-name="subscriptionSupportUrl">equipe de suporte</a> está aqui para ajudar.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Dúvidas sobre sua assinatura? Nossa equipe de suporte está aqui para ajudar.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Obrigado por assinar o { $productName }. Se tiver dúvidas sobre sua assinatura ou precisar de mais informações sobre o { $productName }, <a data-l10n-name="subscriptionSupportUrl">entre em contato conosco</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Obrigado por assinar o { $productName }. Se tiver dúvidas sobre sua assinatura ou precisar de mais informações sobre o { $productName }, entre em contato conosco:
subscription-support-get-help = Obtenha ajuda para sua assinatura
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gerencie sua assinatura</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gerencie sua assinatura:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Entre em contato com o suporte</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Entre em contato com o suporte:
subscriptionUpdateBillingEnsure = Você pode verificar <a data-l10n-name="updateBillingUrl">aqui</a> se a forma de pagamento e as informações da conta estão atualizadas.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Você pode verificar aqui se a forma de pagamento e as informações da conta estão atualizadas:
subscriptionUpdateBillingTry = Tentaremos efetuar seu pagamento novamente nos próximos dias, mas pode ser que você precise nos ajudar a corrigir isso <a data-l10n-name="updateBillingUrl">atualizando suas informações de pagamento</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Tentaremos efetuar seu pagamento novamente nos próximos dias, mas pode ser que você precise nos ajudar a corrigir isso atualizando suas informações de pagamento:
subscriptionUpdatePayment = Para evitar qualquer interrupção em seu serviço, <a data-l10n-name="updateBillingUrl">atualize suas informações de pagamento</a> assim que possível.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Para evitar qualquer interrupção no serviço, atualize suas informações de pagamento assim que possível:
view-invoice-link-action = Ver fatura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ver fatura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Boas-vindas ao { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Boas-vindas ao { $productName }
downloadSubscription-content-2 = Vamos dar uma olhada em todos os recursos incluídos em sua assinatura:
downloadSubscription-link-action-2 = Introdução
fraudulentAccountDeletion-subject-2 = Sua { -product-mozilla-account } foi excluída
fraudulentAccountDeletion-title = Sua conta foi excluída
fraudulentAccountDeletion-content-part1-v2 = Recentemente foi criada uma { -product-mozilla-account } e uma assinatura foi cobrada usando este endereço de email. Como fazemos com todas as contas novas, pedimos que você confirme sua conta primeiro validando este endereço de email.
fraudulentAccountDeletion-content-part2-v2 = No momento, vemos que a conta nunca foi confirmada. Como esta etapa não foi concluída, não temos certeza se esta foi uma assinatura autorizada. Como resultado, a { -product-mozilla-account } registrada com este endereço de email foi excluído, sua assinatura foi cancelada e todas as cobranças foram reembolsadas.
fraudulentAccountDeletion-contact = Se você tiver alguma dúvida, entre em contato com nossa <a data-l10n-name="mozillaSupportUrl">equipe de suporte</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Se você tiver alguma dúvida, entre em contato com nossa equipe de suporte: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Sua assinatura do { $productName } foi cancelada
subscriptionAccountDeletion-title = Lamentamos ver você partir
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Você excluiu recentemente sua { -product-mozilla-account }. Como resultado, cancelamos sua assinatura do { $productName }. Seu pagamento final de { $invoiceTotal } foi feito em { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Lembrete: Conclua a configuração da sua conta
subscriptionAccountReminderFirst-title = Você ainda não pode acessar sua assinatura
subscriptionAccountReminderFirst-content-info-3 = Há alguns dias você criou uma { -product-mozilla-account }, mas nunca confirmou. Esperamos que termine a configuração da sua conta para poder usar sua nova assinatura.
subscriptionAccountReminderFirst-content-select-2 = Selecione “Criar senha” para definir uma nova senha e concluir a confirmação de sua conta.
subscriptionAccountReminderFirst-action = Criar senha
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Lembrete final: Configure sua conta
subscriptionAccountReminderSecond-title-2 = Boas-vindas à { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Há alguns dias você criou uma { -product-mozilla-account }, mas nunca confirmou. Esperamos que termine a configuração da sua conta para poder usar sua nova assinatura.
subscriptionAccountReminderSecond-content-select-2 = Selecione “Criar senha” para definir uma nova senha e concluir a confirmação de sua conta.
subscriptionAccountReminderSecond-action = Criar senha
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Sua assinatura do { $productName } foi cancelada
subscriptionCancellation-title = Lamentamos ver você partir

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Cancelamos sua assinatura do { $productName }. Seu pagamento final de { $invoiceTotal } foi pago em { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Cancelamos sua assinatura do { $productName }. Seu pagamento final de { $invoiceTotal } será pago em { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Seu serviço continuará até o final do período de cobrança atual, { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Você mudou para o { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Você mudou com sucesso de { $productNameOld } para { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partir da próxima fatura, sua cobrança será alterada de { $paymentAmountOld } por { $productPaymentCycleOld } para { $paymentAmountNew } por { $productPaymentCycleNew }. Nesse momento, você também receberá um crédito único de { $paymentProrated } para refletir a cobrança menor pelo restante desse { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Se for necessário instalar outro software para usar o { $productName }, você receberá um email separado com instruções de como baixar.
subscriptionDowngrade-content-auto-renew = Sua assinatura é renovada automaticamente a cada período de cobrança, a menos que você escolha cancelar.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = Sua assinatura do { $productName } expirará em breve
subscriptionEndingReminder-title = Sua assinatura do { $productName } irá expirar em breve
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = Seu acesso ao { $productName } terminará em <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line1-plaintext = Seu acesso ao { $productName } terminará em { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-closing = Obrigado por ser assinante!
subscriptionEndingReminder-churn-title = Quer manter o acesso?
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Entre em contato com nossa equipe de suporte: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Sua assinatura do { $productName } foi cancelada
subscriptionFailedPaymentsCancellation-title = Sua assinatura foi cancelada
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Cancelamos sua assinatura do { $productName } porque várias tentativas de pagamento falharam. Para voltar a ter acesso, faça uma nova assinatura com um método de pagamento atualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pagamento do { $productName } confirmado
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Obrigado por assinar o { $productName }
subscriptionFirstInvoice-content-processing = Seu pagamento está em processamento e pode levar até quatro dias úteis para ser concluído.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Você receberá um email separado com instruções de como começar a usar o { $productName }.
subscriptionFirstInvoice-content-auto-renew = Sua assinatura é renovada automaticamente a cada período de cobrança, a menos que você escolha cancelar.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = A próxima fatura será emitida em { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = O método de pagamento do { $productName } venceu ou está prestes a vencer
subscriptionPaymentExpired-title-2 = Seu método de pagamento venceu ou está prestes a vencer
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = O método de pagamento que você está usando para { $productName } expirou ou está prestes a expirar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Falha no pagamento do { $productName }
subscriptionPaymentFailed-title = Desculpe, estamos com problemas com seu pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Ocorreu um problema com seu pagamento mais recente pelo { $productName }.
subscriptionPaymentFailed-content-outdated-1 = É possível que seu método de pagamento tenha expirado ou que o método de pagamento atual esteja desatualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Necessário atualizar informações de pagamento do { $productName }
subscriptionPaymentProviderCancelled-title = Desculpe, estamos com problemas com seu método de pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Detectamos um problema com seu método de pagamento do { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = Seu método de pagamento atual pode estar vencido ou desatualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Assinatura do { $productName } reativada
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Obrigado por reativar sua assinatura do { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Seu ciclo de faturamento e pagamento permanece o mesmo. Sua próxima cobrança será de { $invoiceTotal } em { $nextInvoiceDateOnly }. Sua assinatura será renovada automaticamente a cada período de cobrança, a menos que você decida cancelar.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Aviso de renovação automática do { $productName }
subscriptionRenewalReminder-title = Sua assinatura será renovada em breve
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Prezado cliente do { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = Sua assinatura atual está configurada para ser renovada automaticamente daqui a { $reminderLength } dias.
subscriptionRenewalReminder-content-closing = Atenciosamente,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = A equipe do { $productName }
subscriptionReplaced-subject = Sua assinatura foi atualizada como parte da sua mudança
subscriptionReplaced-title = Sua assinatura foi atualizada
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Sua assinatura individual do { $productName } foi substituída e agora está incluída em seu novo pacote.
subscriptionReplaced-content-credit = Você receberá um crédito por qualquer tempo não usado da sua assinatura anterior. Este crédito será aplicado automaticamente à sua conta e usado em futuras cobranças.
subscriptionReplaced-content-no-action = Nenhuma ação é necessária da sua parte.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Recebido pagamento do { $productName }
subscriptionSubsequentInvoice-title = Obrigado por ser um assinante!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Recebemos seu último pagamento pelo { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Você atualizou para { $productName }
subscriptionUpgrade-title = Obrigado por atualizar!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Sua mudança do { $productName } foi concluída com sucesso.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-credit = Você recebeu um crédito na conta no valor de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = O valor da sua assinatura mudará a partir da próxima fatura.
subscriptionUpgrade-content-old-price-day = A taxa anterior era de { $paymentAmountOld } por dia.
subscriptionUpgrade-content-old-price-week = A taxa anterior era de { $paymentAmountOld } por semana.
subscriptionUpgrade-content-old-price-month = A taxa anterior era de { $paymentAmountOld } por mês.
subscriptionUpgrade-content-old-price-halfyear = A taxa anterior era de { $paymentAmountOld } por seis meses.
subscriptionUpgrade-content-old-price-year = A taxa anterior era de { $paymentAmountOld } por ano.
subscriptionUpgrade-content-old-price-default = A taxa anterior era de { $paymentAmountOld } por intervalo de cobrança.
subscriptionUpgrade-content-old-price-day-tax = A taxa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de imposto por dia.
subscriptionUpgrade-content-new-price-halfyear-tax = De agora em diante, será cobrado { $paymentAmountNew } + { $paymentTaxNew } de imposto por seis meses, excluindo descontos.
subscriptionUpgrade-content-new-price-year-tax = De agora em diante, será cobrado { $paymentAmountNew } + { $paymentTaxNew } de imposto por ano, excluindo descontos.
subscriptionUpgrade-content-new-price-default-tax = De agora em diante, será cobrado { $paymentAmountNew } + { $paymentTaxNew } de imposto por intervalo de faturamento, excluindo descontos.
subscriptionUpgrade-existing = Se alguma de suas assinaturas existentes interferir com esta mudança, cuidaremos disso e enviaremos um email separado com os detalhes. Caso seu novo plano inclua produtos que necessitem de instalação, enviaremos um email separado com instruções de configuração.
subscriptionUpgrade-auto-renew = Sua assinatura é renovada automaticamente a cada período de cobrança, a menos que você escolha cancelar.
subscriptionsPaymentExpired-subject-2 = O método de pagamento de suas assinaturas expirou ou expira em breve
subscriptionsPaymentExpired-title-2 = Seu método de pagamento venceu ou está prestes a vencer
subscriptionsPaymentProviderCancelled-subject = Necessário atualizar informações de pagamento de assinaturas da { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Desculpe, estamos com problemas com seu método de pagamento
subscriptionsPaymentProviderCancelled-content-detected = Detectamos um problema com seu método de pagamento das seguintes assinaturas.
