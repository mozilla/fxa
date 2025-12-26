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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Logotipo da { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronizar dispositivos">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositivos">
fxa-privacy-url = Política de privacidade da { -brand-mozilla }
moz-accounts-privacy-url-2 = Aviso de privacidade das { -product-mozilla-accounts }
moz-accounts-terms-url = Termos do serviço das { -product-mozilla-accounts(capitalization: "lowercase") }
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
account-deletion-info-block-communications = Se sua conta for excluída, você ainda receberá emails da Mozilla Corporation e da Fundação Mozilla, a menos que você <a data-l10n-name="unsubscribeLink">peça para cancelar a inscrição</a>.
account-deletion-info-block-support = Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com nossa <a data-l10n-name="supportLink">equipe de suporte</a>.
account-deletion-info-block-communications-plaintext = Se sua conta for excluída, você ainda receberá emails da Mozilla Corporation e da Fundação Mozilla, a menos que você peça para cancelar a inscrição:
account-deletion-info-block-support-plaintext = Se você tiver alguma dúvida ou precisar de ajuda, entre em contato com nossa equipe de suporte:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Baixe o { $productName } no { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Baixe o { $productName } na { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instale o { $productName } em <a data-l10n-name="anotherDeviceLink">outro computador</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instale o { $productName } em <a data-l10n-name="anotherDeviceLink">outro dispositivo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Instale o { $productName } pelo Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Instale o { $productName } pela App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instale o { $productName } em outro dispositivo:
automated-email-change-2 = Se não foi você quem fez esta ação, <a data-l10n-name="passwordChangeLink">mude sua senha</a> agora mesmo.
automated-email-support = Consulte mais informações no <a data-l10n-name="supportLink">Suporte { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Se não foi você quem fez esta ação, mude sua senha agora mesmo:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Consulte mais informações no Suporte { -brand-mozilla }:
automated-email-inactive-account = Este é um email automático. Você recebeu porque tem uma { -product-mozilla-account } e já se passaram 2 anos desde seu último acesso.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Para obter mais informações, visite o <a data-l10n-name="supportLink">Suporte { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Este é um email automático. Se recebeu por engano, não precisa fazer nada.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Este é um email automático. Se você não autorizou esta ação, mude sua senha:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Esta solicitação veio de { $uaBrowser } em { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Esta solicitação veio de { $uaBrowser } em { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Esta solicitação veio de { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Esta solicitação veio de { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Esta solicitação veio de { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Se não foi você, <a data-l10n-name="revokeAccountRecoveryLink">exclua a nova chave</a> e <a data-l10n-name="passwordChangeLink">mude sua senha</a>.
automatedEmailRecoveryKey-change-pwd-only = Se não foi você, <a data-l10n-name="passwordChangeLink">mude sua senha</a>.
automatedEmailRecoveryKey-more-info = Consulte mais informações no <a data-l10n-name="supportLink">Suporte { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Esta solicitação veio de:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Se não foi você, exclua a nova chave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Se não foi você, mude sua senha:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = e mude sua senha:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Consulte mais informações no Suporte { -brand-mozilla }:
automated-email-reset =
    Este é um email automático. Se você não autorizou esta ação, <a data-l10n-name="resetLink">redefina sua senha</a>.
    Consulte mais informações no <a data-l10n-name="supportLink">Suporte { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Se você não autorizou esta ação, redefina sua senha agora em { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Se você não fez esta ação, <a data-l10n-name="resetLink">redefina sua senha</a> e <a data-l10n-name="twoFactorSettingsLink">redefina a autenticação em duas etapas</a> agora mesmo.
    Consulte mais informações no <a data-l10n-name="supportLink">Suporte { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Se não foi você quem fez esta ação, mude sua senha agora mesmo em:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Além disso, redefina a autenticação em duas etapas em:
brand-banner-message = Você sabia que mudamos nosso nome de { -product-firefox-accounts } para { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Saiba mais</a>
cancellationSurvey = Ajude-nos a melhorar nossos serviços participando desta <a data-l10n-name="cancellationSurveyUrl">breve pesquisa de opinião</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Ajude-nos a melhorar nossos serviços participando desta breve pesquisa de opinião:
change-password-plaintext = Se suspeitar que alguém está tentando obter acesso à sua conta, altere sua senha.
manage-account = Gerenciar conta
manage-account-plaintext = { manage-account }:
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

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Subtotal: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-discount = Desconto
subscription-charges-total = <b>Total</b>
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
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } em { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } em { $uaOS }
view-invoice-link-action = Ver fatura
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Ver fatura: { $invoiceLink }
cadReminderFirst-subject-1 = Lembrete! Vamos sincronizar o { -brand-firefox }
cadReminderFirst-action = Sincronizar outro dispositivo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = São necessários dois para sincronizar
cadReminderFirst-description-v2 = Leve suas abas em todos os seus dispositivos. Tenha seus favoritos, senhas e outros dados em todo lugar onde você usa o { -brand-firefox }.
cadReminderSecond-subject-2 = Não perca! Vamos terminar sua configuração de sincronização
cadReminderSecond-action = Sincronizar outro dispositivo
cadReminderSecond-title-2 = Não esqueça de sincronizar!
cadReminderSecond-description-sync = Sincronize seus favoritos, senhas, abas abertas e muito mais, onde quer que você use o { -brand-firefox }.
cadReminderSecond-description-plus = Além disso, seus dados são sempre criptografados. Só você pode ver, nos dispositivos que você aprovou.
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
inactiveAccountFinalWarning-subject = Última chance de manter sua { -product-mozilla-account }
inactiveAccountFinalWarning-title = Sua conta { -brand-mozilla } e seus dados foram excluídos
inactiveAccountFinalWarning-preview = Entre para manter sua conta
inactiveAccountFinalWarning-account-description = Sua { -product-mozilla-account } é usada para acessar produtos gratuitos de navegação e privacidade, como a sincronização do { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Em <strong>{ $deletionDate }</strong>, sua conta e seus dados pessoais serão excluídos permanentemente, a menos que você entre na conta.
inactiveAccountFinalWarning-action = Entre para manter sua conta
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Entre para manter sua conta:
inactiveAccountFirstWarning-subject = Não perca sua conta
inactiveAccountFirstWarning-title = Quer manter sua conta { -brand-mozilla } e seus dados?
inactiveAccountFirstWarning-account-description-v2 = Sua { -product-mozilla-account } é usada para acessar produtos gratuitos de navegação e privacidade, como a sincronização do { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Notamos que você não entra na sua conta há mais de 2 anos.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Sua conta e seus dados pessoais serão excluídos permanentemente em <strong>{ $deletionDate }</strong> porque você não tem estado ativo nela.
inactiveAccountFirstWarning-action = Entre para manter sua conta
inactiveAccountFirstWarning-preview = Entre para manter sua conta
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Entre para manter sua conta:
inactiveAccountSecondWarning-subject = Ação necessária: Exclusão da conta daqui a 7 dias
inactiveAccountSecondWarning-title = Sua conta { -brand-mozilla } e seus dados serão excluídos daqui a 7 dias
inactiveAccountSecondWarning-account-description-v2 = Sua { -product-mozilla-account } é usada para acessar produtos gratuitos de navegação e privacidade, como a sincronização do { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Sua conta e seus dados pessoais serão excluídos permanentemente em <strong>{ $deletionDate }</strong> porque você não tem estado ativo nela.
inactiveAccountSecondWarning-action = Entre para manter sua conta
inactiveAccountSecondWarning-preview = Entre para manter sua conta
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Entre para manter sua conta:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Você está sem códigos de autenticação de backup!
codes-reminder-title-one = Você está com seu último código de autenticação de backup
codes-reminder-title-two = Está na hora de criar mais códigos de autenticação de backup
codes-reminder-description-part-one = Códigos de autenticação de backup ajudam a restaurar suas informações quando você esquece sua senha.
codes-reminder-description-part-two = Crie novos códigos agora para não arriscar perder seus dados mais tarde.
codes-reminder-description-two-left = Você só tem mais dois códigos.
codes-reminder-description-create-codes = Crie novos códigos de autenticação de backup para ajudar a voltar a acessar sua conta se você estiver sem acesso.
lowRecoveryCodes-action-2 = Criar códigos
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nenhum código de autenticação de backup restante
        [one] Resta apenas 1 código de autenticação de backup
       *[other] Resta apenas { $numberRemaining } códigos de autenticação de backup!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Novo acesso no { $clientName }
newDeviceLogin-subjectForMozillaAccount = Novo acesso à sua { -product-mozilla-account }
newDeviceLogin-title-3 = Sua { -product-mozilla-account } foi usada para se conectar
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Se não foi você, <a data-l10n-name="passwordChangeLink">mude sua senha</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Não foi você? Mude sua senha:
newDeviceLogin-action = Gerenciar conta
passwordChanged-subject = Senha atualizada
passwordChanged-title = Senha alterada com sucesso
passwordChanged-description-2 = A senha da sua { -product-mozilla-account } foi alterada com sucesso a partir do seguinte dispositivo:
passwordChangeRequired-subject = Detectada atividade suspeita
passwordChangeRequired-preview = Mude sua senha imediatamente
passwordChangeRequired-title-2 = Redefina sua senha
passwordChangeRequired-suspicious-activity-3 = Nós bloqueamos a sua conta para mantê-la segura contra atividades suspeitas. Você foi desconectado de todos os seus dispositivos e quaisquer dados sincronizados foram excluídos por precaução.
passwordChangeRequired-sign-in-3 = Para entrar novamente na sua conta, tudo o que você precisa fazer é redefinir a sua senha.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Escolha uma senha forte, que seja diferente das que você utilizou anteriormente.
passwordChangeRequired-different-password-plaintext-2 = Importante: Escolha uma senha forte, que seja diferente das que você utilizou anteriormente.
passwordChangeRequired-action = Redefinir senha
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Use { $code } para alterar a sua senha
password-forgot-otp-preview = Este código expira em 10 minutos
password-forgot-otp-title = Esqueceu sua senha?
password-forgot-otp-request = Recebemos uma solicitação de alteração de senha da sua { -product-mozilla-account } vinda de:
password-forgot-otp-code-2 = Se foi você, use este código de confirmação para prosseguir:
password-forgot-otp-expiry-notice = Este código expira em 10 minutos.
passwordReset-subject-2 = Sua senha foi redefinida
passwordReset-title-2 = Sua senha foi redefinida
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Você redefiniu a senha da sua { -product-mozilla-account } em:
passwordResetAccountRecovery-subject-2 = Sua senha foi redefinida
passwordResetAccountRecovery-title-3 = Sua senha foi redefinida
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Você usou sua chave de recuperação de conta para redefinir a senha da sua { -product-mozilla-account } em:
passwordResetAccountRecovery-information = Desconectamos você de todos os seus dispositivos sincronizados. Criamos uma nova chave de recuperação de conta para substituir a que você usou. Você pode alterar nas configurações da sua conta.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Desconectamos você de todos os seus dispositivos sincronizados. Criamos uma nova chave de recuperação de conta para substituir a que você usou. Você pode alterar nas configurações da sua conta:
passwordResetAccountRecovery-action-4 = Gerenciar conta
passwordResetRecoveryPhone-subject = Usado celular de recuperação
passwordResetRecoveryPhone-preview = Verifique se foi você
passwordResetRecoveryPhone-title = Seu celular de recuperação foi usado para confirmar uma redefinição de senha
passwordResetRecoveryPhone-device = Celular de recuperação usado de:
passwordResetRecoveryPhone-action = Gerenciar conta
passwordResetWithRecoveryKeyPrompt-subject = Sua senha foi redefinida
passwordResetWithRecoveryKeyPrompt-title = Sua senha foi redefinida
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Você redefiniu a senha da sua { -product-mozilla-account } em:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Criar chave de recuperação de conta
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Criar chave de recuperação de conta:
passwordResetWithRecoveryKeyPrompt-cta-description = Você precisa entrar na conta novamente em todos os seus dispositivos sincronizados. Mantenha seus dados protegidos na próxima vez, com uma chave de recuperação de conta. Ela permite recuperar seus dados no caso de esquecer sua senha.
postAddAccountRecovery-subject-3 = Criada nova chave de recuperação de conta
postAddAccountRecovery-title2 = Você criou uma nova chave de recuperação de conta
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Salve esta chave em um local seguro, você precisará dela para restaurar seus dados de navegação criptografados caso esqueça sua senha.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Esta chave só pode ser usada uma vez. Depois de usar, criamos uma nova automaticamente para você. Ou você pode criar uma nova quando quiser nas configurações da sua conta.
postAddAccountRecovery-action = Gerenciar conta
postAddLinkedAccount-subject-2 = Nova conta vinculada à sua { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Sua conta em { $providerName } foi vinculada à sua { -product-mozilla-account }
postAddLinkedAccount-action = Gerenciar conta
postAddRecoveryPhone-subject = Adicionado celular de recuperação de conta
postAddRecoveryPhone-preview = Conta protegida por autenticação em duas etapas
postAddRecoveryPhone-title-v2 = Você adicionou um número de celular de recuperação
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Você adicionou { $maskedLastFourPhoneNumber } como número de celular de recuperação de conta
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Como isso protege sua conta
postAddRecoveryPhone-how-protect-plaintext = Como isso protege sua conta:
postAddRecoveryPhone-enabled-device = Você ativou a partir de:
postAddRecoveryPhone-action = Gerenciar conta
postAddTwoStepAuthentication-preview = Sua conta está protegida
postAddTwoStepAuthentication-subject-v3 = A autenticação em duas etapas está ativada
postAddTwoStepAuthentication-title-2 = Você ativou a autenticação em duas etapas
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Você solicitou isso de:
postAddTwoStepAuthentication-action = Gerenciar conta
postAddTwoStepAuthentication-code-required-v4 = Códigos de segurança do seu aplicativo de autenticação agora serão necessários sempre que você entrar na conta.
postAddTwoStepAuthentication-recovery-method-codes = Você também adicionou códigos de autenticação de backup como método de recuperação.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Você também adicionou { $maskedPhoneNumber } como número de celular de recuperação.
postAddTwoStepAuthentication-how-protects-link = Como isso protege sua conta
postAddTwoStepAuthentication-how-protects-plaintext = Como isso protege sua conta:
postChangeAccountRecovery-subject = Alterada a chave de recuperação de conta
postChangeAccountRecovery-title = Você alterou a chave de recuperação da sua conta
postChangeAccountRecovery-body-part1 = Agora você tem uma nova chave de recuperação de conta. Sua chave anterior foi excluída.
postChangeAccountRecovery-body-part2 = Salve esta nova chave em um local seguro, você precisará dela para restaurar seus dados de navegação criptografados caso esqueça sua senha.
postChangeAccountRecovery-action = Gerenciar conta
postChangePrimary-subject = Email principal atualizado
postChangePrimary-title = Novo email principal
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Você alterou com sucesso seu email principal para { $email }. Este endereço é agora seu nome de usuário para entrar na sua { -product-mozilla-account }, assim como receber notificações de segurança e confirmações de acesso.
postChangePrimary-action = Gerenciar conta
postChangeRecoveryPhone-subject = Celular de recuperação de conta atualizado
postChangeRecoveryPhone-preview = Conta protegida por autenticação em duas etapas
postChangeRecoveryPhone-title = Você alterou seu celular de recuperação de conta
postChangeRecoveryPhone-description = Agora você tem um novo celular de recuperação de conta. Seu número de celular anterior foi excluído.
postChangeRecoveryPhone-requested-device = Você solicitou a partir de:
postChangeTwoStepAuthentication-preview = Sua conta está protegida
postChangeTwoStepAuthentication-subject = Atualização em duas etapas atualizada
postChangeTwoStepAuthentication-title = A atualização em duas etapas foi atualizada
postChangeTwoStepAuthentication-use-new-account = Agora você precisa usar o novo item { -product-mozilla-account } no seu aplicativo de autenticação. O antigo não funciona mais e você pode remover.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Você solicitou isso de:
postChangeTwoStepAuthentication-action = Gerenciar conta
postChangeTwoStepAuthentication-how-protects-link = Como isso protege sua conta
postChangeTwoStepAuthentication-how-protects-plaintext = Como isso protege sua conta:
postConsumeRecoveryCode-title-3 = Seu código de autenticação de backup foi usado para confirmar uma redefinição de senha
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Código usado de:
postConsumeRecoveryCode-action = Gerenciar conta
postConsumeRecoveryCode-subject-v3 = Código de autenticação de backup usado
postConsumeRecoveryCode-preview = Verifique se foi você
postNewRecoveryCodes-subject-2 = Criados novos códigos de autenticação de backup
postNewRecoveryCodes-title-2 = Você criou novos códigos de autenticação de backup
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Foram criados no:
postNewRecoveryCodes-action = Gerenciar conta
postRemoveAccountRecovery-subject-2 = Chave de recuperação de conta excluída
postRemoveAccountRecovery-title-3 = Você excluiu sua chave de recuperação de conta
postRemoveAccountRecovery-body-part1 = Sua chave de recuperação de conta é necessária para restaurar seus dados de navegação criptografados caso esqueça sua senha.
postRemoveAccountRecovery-body-part2 = Se ainda não o fez, crie uma nova chave de recuperação de conta nas configurações da sua conta para evitar a perda de senhas salvas, favoritos, histórico de navegação e muito mais.
postRemoveAccountRecovery-action = Gerenciar conta
postRemoveRecoveryPhone-subject = Celular de recuperação de conta removido
postRemoveRecoveryPhone-preview = Conta protegida por autenticação em duas etapas
postRemoveRecoveryPhone-title = Celular de recuperação de conta removido
postRemoveRecoveryPhone-description-v2 = Seu celular de recuperação foi removido da configuração de autenticação em duas etapas.
postRemoveRecoveryPhone-description-extra = Você ainda pode usar seus códigos de autenticação de backup para entrar na conta, se não conseguir usar seu aplicativo de autenticação.
postRemoveRecoveryPhone-requested-device = Você solicitou a partir de:
postRemoveSecondary-subject = Email secundário removido
postRemoveSecondary-title = Email secundário removido
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Você removeu com sucesso { $secondaryEmail } como email secundário da sua { -product-mozilla-account }. Notificações de segurança e confirmações de acesso não serão mais enviadas para este endereço.
postRemoveSecondary-action = Gerenciar conta
postRemoveTwoStepAuthentication-subject-line-2 = Autenticação em duas etapas desativada
postRemoveTwoStepAuthentication-title-2 = Você desativou a autenticação em duas etapas
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Você desativou de:
postRemoveTwoStepAuthentication-action = Gerenciar conta
postRemoveTwoStepAuthentication-not-required-2 = Você não precisa mais de código de segurança do aplicativo de autenticação ao entrar na conta.
postSigninRecoveryCode-subject = Código de autenticação de backup usado para entrar na conta
postSigninRecoveryCode-preview = Confirmar atividade da conta
postSigninRecoveryCode-title = Seu código de autenticação de backup foi usado para entrar na conta
postSigninRecoveryCode-description = Se não foi você, deve alterar sua senha imediatamente para proteger sua conta.
postSigninRecoveryCode-device = Você entrou a partir de:
postSigninRecoveryCode-action = Gerenciar conta
postSigninRecoveryPhone-subject = Celular de recuperação usado para entrar na conta
postSigninRecoveryPhone-preview = Confirmar atividade da conta
postSigninRecoveryPhone-title = Seu celular de recuperação foi usado para entrar na conta
postSigninRecoveryPhone-description = Se não foi você, deve alterar sua senha imediatamente para proteger sua conta.
postSigninRecoveryPhone-device = Você entrou a partir de:
postSigninRecoveryPhone-action = Gerenciar conta
postVerify-sub-title-3 = Estamos felizes em te ver!
postVerify-title-2 = Quer ver a mesma aba em dois dispositivos?
postVerify-description-2 = Fácil! Basta instalar o { -brand-firefox } em outro dispositivo e entrar na conta para sincronizar. É como mágica!
postVerify-sub-description = (isso também significa que você pode ter seus favoritos, senhas e outros dados do { -brand-firefox } em qualquer lugar em que estiver conectado)
postVerify-subject-4 = Boas-vindas à { -brand-mozilla }!
postVerify-setup-2 = Conectar outro dispositivo:
postVerify-action-2 = Conectar outro dispositivo
postVerifySecondary-subject = Email secundário adicionado
postVerifySecondary-title = Email secundário adicionado
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Você confirmou com sucesso { $secondaryEmail } como email secundário da sua { -product-mozilla-account }. Notificações de segurança e confirmações de acesso agora serão enviadas para ambos os endereços de email.
postVerifySecondary-action = Gerenciar conta
recovery-subject = Redefinição de senha
recovery-title-2 = Esqueceu sua senha?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Recebemos uma solicitação de alteração de senha de sua { -product-mozilla-account } de:
recovery-new-password-button = Crie uma nova senha clicando no botão abaixo. Este link expirará em até uma hora.
recovery-copy-paste = Crie uma nova senha copiando e colando a URL abaixo em seu navegador. Este link expirará em até uma hora.
recovery-action = Criar nova senha
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Sua assinatura do { $productName } foi cancelada
subscriptionAccountDeletion-title = Lamentamos ver você partir
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Você excluiu recentemente sua { -product-mozilla-account }. Como resultado, cancelamos sua assinatura do { $productName }. Seu pagamento final de { $invoiceTotal } foi feito em { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Boas-vindas ao { $productName }: Defina sua senha.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Boas-vindas ao { $productName }
subscriptionAccountFinishSetup-content-processing = O pagamento está sendo processado e pode levar até quatro dias úteis para ser concluído. Sua assinatura é renovada automaticamente a cada período de faturamento, a menos que você opte por cancelar.
subscriptionAccountFinishSetup-content-create-3 = Em seguida, você deve criar uma senha da { -product-mozilla-account } para começar a usar sua nova assinatura.
subscriptionAccountFinishSetup-action-2 = Introdução
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
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Falha no pagamento do { $productName }
subscriptionPaymentFailed-title = Desculpe, estamos com problemas com seu pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = Ocorreu um problema com seu pagamento mais recente pelo { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Necessário atualizar informações de pagamento do { $productName }
subscriptionPaymentProviderCancelled-title = Desculpe, estamos com problemas com seu método de pagamento
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Detectamos um problema com seu método de pagamento do { $productName }.
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
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Sua assinatura atual está configurada para ser renovada automaticamente daqui a { $reminderLength } dias. Nesta data, a { -brand-mozilla } renovará sua assinatura de { $planIntervalCount } { $planInterval }. Uma cobrança de { $invoiceTotal } será aplicada ao método de pagamento de sua conta.
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
subscriptionsPaymentProviderCancelled-subject = Necessário atualizar informações de pagamento de assinaturas da { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = Desculpe, estamos com problemas com seu método de pagamento
subscriptionsPaymentProviderCancelled-content-detected = Detectamos um problema com seu método de pagamento das seguintes assinaturas.
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
subscriptionUpgrade-existing = Se alguma de suas assinaturas existentes interferir com esta mudança, cuidaremos disso e enviaremos um email separado com os detalhes. Caso seu novo plano inclua produtos que necessitem de instalação, enviaremos um email separado com instruções de configuração.
subscriptionUpgrade-auto-renew = Sua assinatura é renovada automaticamente a cada período de cobrança, a menos que você escolha cancelar.
unblockCode-title = Foi você que tentou entrar na sua conta?
unblockCode-prompt = Se foi você, use este código de verificação:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Se foi você, use este código de verificação: { $unblockCode }
unblockCode-report = Senão, ajude-nos a evitar intrusos e <a data-l10n-name="reportSignInLink">nos informe</a>.
unblockCode-report-plaintext = Senão, ajude-nos a evitar intrusos e nos informe.
verificationReminderFinal-subject = Lembrete final para confirmar sua conta
verificationReminderFinal-description-2 = Há algumas semanas você criou uma { -product-mozilla-account }, mas nunca a confirmou. Para sua segurança, excluiremos a conta se não for verificada nas próximas 24 horas.
confirm-account = Confirmar conta
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Lembre de confirmar sua conta
verificationReminderFirst-title-3 = Boas-vindas à { -brand-mozilla }!
verificationReminderFirst-description-3 = Há alguns dias você criou uma { -product-mozilla-account }, mas nunca a confirmou. Confirme sua conta nos próximos 15 dias ou ela será excluída automaticamente.
verificationReminderFirst-sub-description-3 = Não fique sem o navegador que coloca você e sua privacidade em primeiro lugar.
confirm-email-2 = Confirmar conta
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmar conta
verificationReminderSecond-subject-2 = Lembre de confirmar sua conta
verificationReminderSecond-title-3 = Não perca nada da { -brand-mozilla }!
verificationReminderSecond-description-4 = Há alguns dias você criou uma { -product-mozilla-account }, mas nunca a confirmou. Confirme sua conta nos próximos 10 dias ou ela será excluída automaticamente.
verificationReminderSecond-second-description-3 = Sua { -product-mozilla-account } permite sincronizar sua experiência de uso do { -brand-firefox } entre dispositivos e libera o acesso a mais produtos de proteção de privacidade da { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Faça parte da nossa missão de transformar a internet em um lugar aberto a todos.
verificationReminderSecond-action-2 = Confirmar conta
verify-title-3 = Abra a internet com a { -brand-mozilla }
verify-description-2 = Confirme sua conta e aproveite ao máximo a { -brand-mozilla } onde quer que acesse, começando com:
verify-subject = Concluir a criação da sua conta
verify-action-2 = Confirmar conta
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Você se conectou no { $clientName }?
verifyLogin-description-2 = Ajude-nos a manter sua conta segura confirmando que você se conectou no:
verifyLogin-subject-2 = Confirmar acesso
verifyLogin-action = Confirmar acesso
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Você se conectou no { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ajude-nos a manter sua conta segura aprovando seu acesso em:
verifyLoginCode-prompt-3 = Se foi você, use este código de autorização:
verifyLoginCode-expiry-notice = Expira em 5 minutos.
verifyPrimary-title-2 = Confirmar email principal
verifyPrimary-description = Uma solicitação para efetuar uma alteração na conta foi feita a partir do seguinte dispositivo:
verifyPrimary-subject = Confirmar email principal
verifyPrimary-action-2 = Confirmar email
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Uma vez confirmado, será possível fazer alterações na conta neste dispositivo, como adicionar um email secundário.
verifySecondaryCode-title-2 = Confirmar email secundário
verifySecondaryCode-action-2 = Confirmar email
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Foi feita uma solicitação para usar { $email } como endereço de email secundário da seguinte { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Use este código de confirmação:
verifySecondaryCode-expiry-notice-2 = Ele expira em 5 minutos. Uma vez confirmado, este endereço começará a receber notificações e confirmações de segurança.
verifyShortCode-title-3 = Abra a internet com a { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirme sua conta e aproveite ao máximo a { -brand-mozilla } onde quer que acesse, começando com:
verifyShortCode-prompt-3 = Use este código de confirmação:
verifyShortCode-expiry-notice = Expira em 5 minutos.
