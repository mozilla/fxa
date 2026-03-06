## Non-email strings

session-verify-send-push-title-2 = Iniciar a sessão em { -product-mozilla-account }?
session-verify-send-push-body-2 = Clique aqui para confirmar que é você
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } é o seu código de confirmação da { -brand-mozilla }. Expira em 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Código de confirmação da { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } é o seu código de recuperação da { -brand-mozilla }. Expira em 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Código da { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } é o seu código de recuperação da { -brand-mozilla }. Expira em 5 minutos.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Código da { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="logótipo da { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="logótipo da { -brand-mozilla }">
subplat-automated-email = Esta é uma mensagem automática; se a recebeu por erro, não é necessária nenhuma ação.
subplat-privacy-notice = Informação de privacidade
subplat-privacy-plaintext = Informação de privacidade:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Está a receber esta mensagem porque { $email } tem uma { -product-mozilla-account } e subscreveu { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Está a receber esta mensagem porque { $email } tem uma { -product-mozilla-account }.
subplat-explainer-multiple-2 = Está a receber esta mensagem porque { $email } tem uma { -product-mozilla-account } e subscreveu múltiplos produtos.
subplat-explainer-was-deleted-2 = Está a receber esta mensagem porque { $email } foi registado para uma { -product-mozilla-account }.
subplat-manage-account-2 = Controle as suas definições da { -product-mozilla-account } visitando a sua <a data-l10n-name="subplat-account-page">página da conta</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Controle as suas definições da { -product-mozilla-account } visitando a página da sua conta: { $accountSettingsUrl }
subplat-terms-policy = Termos e política de cancelamento
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Cancelar subscrição
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Reativar subscrição
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Atualizar a informação de faturação
subplat-privacy-policy = Política de privacidade da { -brand-mozilla }
subplat-privacy-policy-2 = Informação de Privacidade de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Termos do Serviço de { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Informações legais
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Privacidade
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = Ajude-nos a melhorar os nossos serviços preenchendo este <a data-l10n-name="cancellationSurveyUrl">pequeno questionário</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ajude-nos a melhorar os nossos serviços respondendo a este pequeno questionário:
payment-details = Detalhes de pagamento:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Número da fatura: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Debitado: { $invoiceTotal } em { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Próxima Fatura: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>Método de pagamento:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = Método de pagamento: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = Método de pagamento: { $cardName } que termina em { $lastFour }
payment-provider-card-ending-in-plaintext = Método de pagamento: Cartão que termina em { $lastFour }
payment-provider-card-ending-in = <b>Método de pagamento:</b> Cartão que termina em { $lastFour }
payment-provider-card-ending-in-card-name = <b>Método de pagamento:</b> { $cardName } que termina em { $lastFour }
subscription-charges-invoice-summary = Resumo da fatura

# Variables:


## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>Nº da fatura:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = Número da fatura: { $invoiceNumber }
subscription-charges-invoice-date = <b>Data:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = Data: { $invoiceDateOnly }
subscription-charges-prorated-price = Preço proporcional
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = Preço proporcional: { $remainingAmountTotal }
subscription-charges-list-price = Preço de tabela
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = Preço de tabela: { $offeringPrice }
subscription-charges-credit-from-unused-time = Crédito de tempo não utilizado
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = Crédito de tempo não utilizado: { $unusedAmountTotal }
subscription-charges-subtotal = <b>Subtotal</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = Desconto único
subscription-charges-one-time-discount-plaintext = Desconto único: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
        [one] { $discountDuration }-mês de desconto
       *[other] { $discountDuration }-mês de desconto
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
        [one] Desconto no mês de { $discountDuration }: { $invoiceDiscountAmount }
       *[other] Desconto no mês de { $discountDuration }: { $invoiceDiscountAmount }
    }
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
subscription-charges-amount-paid = <b>Montante pago</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = Montante pago: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = Recebeu um crédito em conta de { $creditReceived }, que será aplicado às suas futuras faturas.

##

subscriptionSupport = Dúvidas sobre a sua subscrição? A nossa <a data-l10n-name="subscriptionSupportUrl">equipa de apoio</a> está aqui para ajudar.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Dúvidas sobre a sua subscrição? A nossa equipa de apoio está aqui para ajudar.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Obrigado pela subscrição no(a) { $productName }. Se tiver dúvidas sobre a sua subscrição ou precisar de mais informações sobre o(a) { $productName }, por favor, <a data-l10n-name="subscriptionSupportUrl">contacte-nos</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Obrigado por subscrever para o { $productName }. Se tiver dúvidas sobre a sua subscrição ou precisar de mais informação sobre o { $productName }, por favor, contacte-nos:
subscription-support-get-help = Obtenha ajuda com a sua subscrição
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">Gerir a sua subscrição</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = Gerir a sua subscrição:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">Contactar o suporte</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = Contactar o suporte:
subscriptionUpdateBillingEnsure = Pode verificar se o seu método de pagamento e a informação da conta estão atualizados <a data-l10n-name="updateBillingUrl">aqui</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Pode verificar se o seu método de pagamento e a informação da conta estão atualizados, aqui:
subscriptionUpdateBillingTry = Nós tentaremos o seu pagamento novamente nos próximos dias, mas talvez precise de nos ajudar a corrigi-lo <a data-l10n-name="updateBillingUrl"> atualizando a sua informação de pagamento</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Nós vamos tentar fazer o seu pagamento novamente nos próximos dias, mas pode precisar de nos ajudar a corrigir o mesmo atualizando a sua informação de pagamento:
subscriptionUpdatePayment = Para evitar qualquer interrupção no seu serviço, por favor, <a data-l10n-name="updateBillingUrl">atualize a sua informação de pagamento</a> assim que possível.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Para evitar qualquer interrupção no seu serviço, por favor, atualize a sua informação de pagamento assim que possível:
view-invoice-link-action = Ver fatura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ver Fatura: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Bem-vindo(a) ao { $productName }.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Bem-vindo(a) ao { $productName }.
downloadSubscription-content-2 = Vamos começar a utilizar todas as funcionalidades incluídas na sua subscrição:
downloadSubscription-link-action-2 = Começar
fraudulentAccountDeletion-subject-2 = A sua { -product-mozilla-account } foi eliminada
fraudulentAccountDeletion-title = A sua conta foi eliminada
fraudulentAccountDeletion-content-part1-v2 = Recentemente, uma { -product-mozilla-account } foi criada e foi debitada uma subscrição com este endereço de e-mail. Como fazemos com todas as novas contas, pedimos que confirme a sua conta começando por validar este endereço de e-mail.
fraudulentAccountDeletion-content-part2-v2 = Neste momento, verificamos que a conta nunca foi confirmada. Como este passo não foi concluído, não temos a certeza se esta foi uma subscrição autorizada. Como resultado, a { -product-mozilla-account } registada neste endereço de e-mail foi eliminada e a sua subscrição foi cancelada com todos os débitos reembolsados.
fraudulentAccountDeletion-contact = Se tiver quaisquer questões, por favor, contacte a nossa <a data-l10n-name="mozillaSupportUrl">equipa de apoio</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Se tiver quaisquer questões, por favor, contacte a nossa equipa de apoio: { $mozillaSupportUrl }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = A sua subscrição { $productName } foi cancelada
subscriptionAccountDeletion-title = Temos pena que se vá embora
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Recentemente eliminou a sua { -product-mozilla-account }. Como resultado, nós cancelámos a sua subscrição do { $productName }. O seu pagamento final de { $invoiceTotal } foi pago em { $invoiceDateOnly }.
subscriptionAccountReminderFirst-subject = Lembrete: termine a configuração da sua conta
subscriptionAccountReminderFirst-title = Ainda não pode aceder à sua subscrição
subscriptionAccountReminderFirst-content-info-3 = Há alguns dias, criou uma { -product-mozilla-account } mas nunca a confirmou. Nós gostaríamos que concluísse a configuração da sua conta, para que possa utilizar a sua nova subscrição.
subscriptionAccountReminderFirst-content-select-2 = Selecione “Criar Palavra-passe” para definir uma nova palavra-passe e concluir a confirmação da sua conta.
subscriptionAccountReminderFirst-action = Criar palavra-passe
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Lembrete final: configure a sua conta
subscriptionAccountReminderSecond-title-2 = Bem-vindo(a) à { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Há alguns dias, criou uma { -product-mozilla-account } mas nunca a confirmou. Nós gostaríamos que concluísse a configuração da sua conta, para que possa utilizar a sua nova subscrição.
subscriptionAccountReminderSecond-content-select-2 = Selecione “Criar Palavra-passe” para definir uma nova palavra-passe e concluir a confirmação da sua conta.
subscriptionAccountReminderSecond-action = Criar palavra-passe
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = A sua subscrição { $productName } foi cancelada
subscriptionCancellation-title = Temos pena que se vá embora

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Cancelámos a sua subscrição do(a) { $productName }. O seu pagamento final de { $invoiceTotal } foi pago a { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Nós cancelámos a sua subscrição do { $productName }. O seu pagamento final de { $invoiceTotal } será pago em { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = O seu serviço continuará até o final do período de faturação atual, que é em { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Mudou para { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Mudou com sucesso de { $productNameOld } para { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = A partir da sua próxima fatura, a cobrança será alterada de { $paymentAmountOld } por { $productPaymentCycleOld } para { $paymentAmountNew } por { $productPaymentCycleNew }. Nessa altura também irá receber um crédito único de { $paymentProrated } para refletir a cobrança mais baixa para o restante deste { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Se existir um novo software para instalar de forma a utilizar o { $productName }, irá receber um e-mail separado com as instruções para a transferência.
subscriptionDowngrade-content-auto-renew = As sua subscrição irá ser renovada automaticamente em cada período de faturação, a menos que opte por cancelar.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = A sua subscrição { $productName } vai expirar em breve
subscriptionEndingReminder-title = A sua subscrição { $productName } vai expirar em breve
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = O seu acesso a { $productName } vai terminar em <strong>{ $serviceLastActiveDateOnly }</strong>.
subscriptionEndingReminder-content-line2 = Se quiser continuar a utilizar o { $productName }, pode reativar a sua subscrição nas <a data-l10n-name="subscriptionEndingReminder-account-settings">Definições da conta</a> antes de <strong>{ $serviceLastActiveDateOnly }</strong >. Se precisar de ajuda, <a data-l10n-name="subscriptionEndingReminder-contact-support">contacte a nossa equipa de apoio</a>.
subscriptionEndingReminder-content-line1-plaintext = O seu acesso a { $productName } terminará em { $serviceLastActiveDateOnly }.
subscriptionEndingReminder-content-line2-plaintext = Se quiser continuar a usar o { $productName }, pode reativar a sua subscrição nas definições da conta antes de { $serviceLastActiveDateOnly }. Se precisar de ajuda, entre em contacto com a nossa equipa de apoio.
subscriptionEndingReminder-content-closing = Obrigado por ser um subscritor valorizado!
subscriptionEndingReminder-churn-title = Pretende manter o acesso?
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">Aplicam-se termos e restrições limitados</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = Aplicam-se termos limitados e restrições: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = Contactar a nossa equipa de apoio: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = A sua subscrição { $productName } foi cancelada
subscriptionFailedPaymentsCancellation-title = A sua subscrição foi cancelada
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Nós cancelamos a sua subscrição do(a) { $productName } porque falharam várias tentativas de pagamento. Para obter novamente acesso, inicie uma nova subscrição com um método de pagamento atualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Pagamento de { $productName } confirmado
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Obrigado por subscrever ao { $productName }
subscriptionFirstInvoice-content-processing = O seu pagamento está a ser processado e pode demorar até quatro dias úteis a ser concluído.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Irá receber uma mensagem separada sobre como começar a utilizar o(a) { $productName }.
subscriptionFirstInvoice-content-auto-renew = As sua subscrição irá ser renovada automaticamente em cada período de faturação, a menos que opte por cancelar.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = A sua próxima fatura será emitido em { $nextInvoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = O método de pagamento para { $productName } expirou ou expira em breve
subscriptionPaymentExpired-title-2 = O seu método de pagamento expirou ou está prestes a expirar
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = O método de pagamento que está a utilizar para { $productName } expirou ou está prestes a expirar.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = O pagamento de { $productName } falhou
subscriptionPaymentFailed-title = Desculpe, estamos a ter problemas com o seu pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Tivemos um problema com o seu último pagamento para { $productName }.
subscriptionPaymentFailed-content-outdated-1 = O seu método de pagamento pode ter expirado ou o seu método de pagamento atual está desatualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = É necessária uma atualização das informações de pagamento para { $productName }
subscriptionPaymentProviderCancelled-title = Desculpe, estamos a ter problemas com o seu método de pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Detetámos um problema com o seu método de pagamento para { $productName }.
subscriptionPaymentProviderCancelled-content-reason-1 = O seu método de pagamento pode ter expirado ou o seu método de pagamento atual está desatualizado.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Subscrição de { $productName } reativada
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Obrigado por reativar a sua subscrição de { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = O seu ciclo de faturação e de pagamento irão permanecer como estão. O seu próximo débito será de { $invoiceTotal } a { $nextInvoiceDateOnly }. A sua subscrição será renovada automaticamente em cada período de débito exceto se optar por cancelar.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Aviso de renovação automática do(a) { $productName }
subscriptionRenewalReminder-title = A sua subscrição será renovada em breve
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Caro(a) cliente de { $productName },
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = A sua subscrição atual está configurada para ser renovada automaticamente em { $reminderLength } dias.
subscriptionRenewalReminder-content-discount-change = A sua próxima fatura refletir uma alteração no preço, pois um desconto anterior terminou e um novo desconto foi aplicado.
subscriptionRenewalReminder-content-discount-ending = Porque um desconto anterior terminou, a sua subscrição será renovada pelo preço padrão.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição diária e uma cobrança de { $invoiceTotalExcludingTax } + { $invoiceTax } de impostos será aplicada ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-with-tax-week = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição semanal e será aplicado um débito de { $invoiceTotalExcludingTax } + { $invoiceTax } de impostos ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-with-tax-month = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição mensal e será aplicado um débito de { $invoiceTotalExcludingTax } + { $invoiceTax } de impostos ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição de seis meses e será aplicado um débito de { $invoiceTotalExcludingTax } + { $invoiceTax } de impostos ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-with-tax-year = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição anual e será aplicado um débito de { $invoiceTotalExcludingTax } + { $invoiceTax } de impostos ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-with-tax-default = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição e será aplicado um débito de { $invoiceTotalExcludingTax } + { $invoiceTax } de impostos ao método de pagamento da sua conta.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição diária e será efetuada uma cobrança de { $invoiceTotal } ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-invoice-total-week = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição semanal e será efetuada uma cobrança de { $invoiceTotal } ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-invoice-total-month = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição mensal e será efetuada uma cobrança de { $invoiceTotal } ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição de seis meses e será efetuada uma cobrança de { $invoiceTotal } ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-invoice-total-year = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição anual e será efetuada uma cobrança de { $invoiceTotal } ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-charge-invoice-total-default = Nessa altura, { -brand-mozilla } irá renovar a sua subscrição e será efetuada uma cobrança de { $invoiceTotal } ao método de pagamento da sua conta.
subscriptionRenewalReminder-content-closing = Com os melhores cumprimentos,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = A equipa do(a) { $productName }
subscriptionReplaced-subject = A sua subscrição foi atualizada como parte da sua atualização
subscriptionReplaced-title = A sua subscrição foi atualizada
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = A sua subscrição individual de { $productName } foi substituída e agora está incluída no seu novo pacote.
subscriptionReplaced-content-credit = Irá receber um crédito por qualquer tempo não utilizado da sua subscrição anterior. Este crédito será aplicado automaticamente à sua conta e utilizado para cobranças futuras.
subscriptionReplaced-content-no-action = Não é necessária nenhuma ação da sua parte.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = O pagamento de { $productName } foi recebido
subscriptionSubsequentInvoice-title = Obrigado por ser um subscritor!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Recebemos o seu último pagamento de { $productName }.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = A sua próxima fatura será emitido em { $nextInvoiceDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Atualizou para { $productName }
subscriptionUpgrade-title = Obrigado por atualizar!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Atualizou com sucesso para { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = Foi cobrado uma taxa única de { $invoiceAmountDue } para refletir o preço mais alto da sua subscrição para o remanescente deste período de faturação ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = Recebeu um crédito em conta no valor de { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = A partir da sua próxima fatura, o preço da sua subscrição irá mudar.
subscriptionUpgrade-content-old-price-day = A taxa anterior era de { $paymentAmountOld } por dia.
subscriptionUpgrade-content-old-price-week = A taxa anterior era de { $paymentAmountOld } por semana.
subscriptionUpgrade-content-old-price-month = A taxa anterior era de { $paymentAmountOld } por mês.
subscriptionUpgrade-content-old-price-halfyear = A taxa anterior era de { $paymentAmountOld } por semestre.
subscriptionUpgrade-content-old-price-year = A taxa anterior era de { $paymentAmountOld } por ano.
subscriptionUpgrade-content-old-price-default = A taxa anterior era de { $paymentAmountOld } por intervalo de faturação.
subscriptionUpgrade-content-old-price-day-tax = A taxa anterior era de { $paymentAmountOld } + { $paymentTaxOld } de impostos por dia.
subscriptionUpgrade-content-old-price-week-tax = A taxa anterior era de { $paymentAmountOld } + { $paymentTaxOld } impostos por semana.
subscriptionUpgrade-content-old-price-month-tax = A taxa anterior era de { $paymentAmountOld } + { $paymentTaxOld } impostos por mês.
subscriptionUpgrade-content-old-price-halfyear-tax = A taxa anterior era de { $paymentAmountOld } + { $paymentTaxOld } impostos por semestre.
subscriptionUpgrade-content-old-price-year-tax = A taxa anterior era de { $paymentAmountOld } + { $paymentTaxOld } impostos por ano.
subscriptionUpgrade-content-old-price-default-tax = A taxa anterior era de { $paymentAmountOld } + { $paymentTaxOld } impostos por intervalo de faturação.
subscriptionUpgrade-content-new-price-day = A partir de agora, será cobrado um débito de { $paymentAmountNew } por dia, excluindo cupões.
subscriptionUpgrade-content-new-price-week = A partir de agora, irá ser cobrado { $paymentAmountNew } por semana, excluindo cupões.
subscriptionUpgrade-content-new-price-month = A partir de agora, irá ser cobrado { $paymentAmountNew } por mês, excluindo cupões.
subscriptionUpgrade-content-new-price-halfyear = A partir de agora, será cobrado { $paymentAmountNew } a cada seis meses, excluindo cupões.
subscriptionUpgrade-content-new-price-year = A partir de agora, será cobrado { $paymentAmountNew } por ano, excluindo cupões.
subscriptionUpgrade-content-new-price-default = A partir de agora, serão cobrados { $paymentAmountNew } por intervalo de faturação, excluindo extras.
subscriptionUpgrade-content-new-price-day-dtax = A partir de agora, ser-lhe-a debitado { $paymentAmountNew } + { $paymentTaxNew } de impostos por dia, excluindo cupões.
subscriptionUpgrade-content-new-price-week-tax = A partir de agora, ser-lhe-a debitado { $paymentAmountNew } + { $paymentTaxNew } de impostos por semana, excluindo extras.
subscriptionUpgrade-content-new-price-month-tax = A partir de agora, ser-lhe-a debitado { $paymentAmountNew } + { $paymentTaxNew } impostos por mês, excluindo cupões.
subscriptionUpgrade-content-new-price-halfyear-tax = A partir de agora, ser-lhe-a debitado { $paymentAmountNew } + { $paymentTaxNew } de impostos por seis meses, excluindo extras.
subscriptionUpgrade-content-new-price-year-tax = A partir de agora, ser-lhe-a debitado { $paymentAmountNew } + { $paymentTaxNew } de impostos por ano, excluindo extras.
subscriptionUpgrade-content-new-price-default-tax = A partir de agora, serão cobrados { $paymentAmountNew } + { $paymentTaxNew } de impostos por intervalo de faturação, excluindo extras.
subscriptionUpgrade-existing = Se alguma das suas subscrições existentes se sobrepor a esta atualização, iremos gerir a mesma e enviar-lhe um e-mail separado com os detalhes. Se o seu novo plano incluir produtos que requeiram instalação, iremos enviar-lhe um e-mail separado com as instruções de configuração.
subscriptionUpgrade-auto-renew = As sua subscrição irá ser renovada automaticamente em cada período de faturação, a menos que opte por cancelar.
subscriptionsPaymentExpired-subject-2 = O método de pagamento para as suas subscrições expirou ou expira em breve
subscriptionsPaymentExpired-title-2 = O seu método de pagamento expirou ou está prestes a expirar
subscriptionsPaymentExpired-content-2 = O método de pagamento que está a utilizar para efetuar os pagamentos das seguintes subscrições expirou ou está quase a expirar.
subscriptionsPaymentProviderCancelled-subject = É necessária uma atualização das informações de pagamento para as subscrições de { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Desculpe, estamos a ter problemas com o seu método de pagamento
subscriptionsPaymentProviderCancelled-content-detected = Detetámos um problema com o seu método de pagamento para as seguintes subscrições.
subscriptionsPaymentProviderCancelled-content-payment-1 = O seu método de pagamento pode ter expirado ou o seu método de pagamento atual está desatualizado.
