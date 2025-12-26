# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Um novo código foi enviado para seu email.
resend-link-success-banner-heading = Um novo link foi enviado para seu email.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Adicione { $accountsEmail } nos seus contatos para assegurar uma entrega tranquila.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Fechar aviso
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } será renomeado para { -product-mozilla-accounts(capitalization: "lowercase") } em 1º de novembro
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Você continua entrando na sua conta com o mesmo nome de usuário e senha. Não há nenhuma outra mudança nos produtos que você usa.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Renomeamos { -product-firefox-accounts } para { -product-mozilla-accounts }. Você continua entrando na sua conta com o mesmo nome de usuário e senha. Não há nenhuma outra mudança nos produtos que você usa.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Saiba mais
# Alt text for close banner image
brand-close-banner =
    .alt = Fechar aviso
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logotipo com m de { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Voltar
button-back-title = Voltar

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Baixar e continuar
    .title = Baixar e continuar
recovery-key-pdf-heading = Chave de recuperação de conta
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Gerada em: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Chave de recuperação de conta
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Essa chave permite recuperar seus dados criptografados no navegador (incluindo senhas, favoritos e histórico) caso você esqueça sua senha. Guarde em um lugar que você vai lembrar.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Lugares onde guardar a chave
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Saiba mais sobre chave de recuperação de conta
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Desculpe, houve um problema ao baixar a chave de recuperação de conta.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Obtenha mais da { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Receba nossas últimas notícias e novidades de produtos
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Acesso antecipado para testar novos produtos
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Avisos de ações para recuperar o controle da internet

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Baixado
datablock-copy =
    .message = Copiado
datablock-print =
    .message = Impresso

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copiado

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimado)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (estimado)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (estimado)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (estimado)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Local desconhecido
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } em { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Endereço IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Senha
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repetir senha
form-password-with-inline-criteria-signup-submit-button = Criar conta
form-password-with-inline-criteria-reset-new-password =
    .label = Nova senha
form-password-with-inline-criteria-confirm-password =
    .label = Confirmar senha
form-password-with-inline-criteria-reset-submit-button = Criar nova senha
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Senha
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repetir senha
form-password-with-inline-criteria-match-error = As senhas não coincidem
form-password-with-inline-criteria-sr-too-short-message = A senha deve ter pelo menos 8 caracteres.
form-password-with-inline-criteria-sr-not-email-message = A senha não pode ter seu endereço de email
form-password-with-inline-criteria-sr-not-common-message = A senha não deve ser uma comumente usada.
form-password-with-inline-criteria-sr-requirements-met = A senha inserida atende todos os requisitos.
form-password-with-inline-criteria-sr-passwords-match = As senhas inseridas coincidem.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Este campo é obrigatório

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Insira o código de { $codeLength } dígitos para continuar
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Digite o código de { $codeLength } caracteres para continuar

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Chave de recuperação de conta { -brand-firefox }
get-data-trio-title-backup-verification-codes = Códigos de autenticação de backup
get-data-trio-download-2 =
    .title = Baixar
    .aria-label = Baixar
get-data-trio-copy-2 =
    .title = Copiar
    .aria-label = Copiar
get-data-trio-print-2 =
    .title = Imprimir
    .aria-label = Imprimir

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Alerta
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Atenção
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Aviso
authenticator-app-aria-label =
    .aria-label = Aplicativo de autenticação
backup-codes-icon-aria-label-v2 =
    .aria-label = Códigos de autenticação de backup ativados
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Códigos de autenticação de backup desativados
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperação ativado
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperação desativado
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Bandeira do Canadá
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Marcar
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Feito
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Ativado
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Fechar mensagem
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Código
error-icon-aria-label =
    .aria-label = Erro
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informação
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Bandeira dos Estados Unidos

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Um computador, um celular e a imagem de um coração partido em cada um
hearts-verified-image-aria-label =
    .aria-label = Um computador, um celular e um tablet com um coração pulsante em cada um
signin-recovery-code-image-description =
    .aria-label = Documento que contém texto oculto.
signin-totp-code-image-label =
    .aria-label = Um dispositivo com um código oculto de 6 dígitos.
confirm-signup-aria-label =
    .aria-label = Um envelope contendo um link
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustração para representar uma chave de recuperação de conta.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustração para representar uma chave de recuperação de conta.
password-image-aria-label =
    .aria-label = Uma ilustração para representar a digitação de uma senha.
lightbulb-aria-label =
    .aria-label = Ilustração para representar a criação de uma dica de onde guardou.
email-code-image-aria-label =
    .aria-label = Ilustração para representar um email contendo um código.
recovery-phone-image-description =
    .aria-label = Dispositivo móvel que recebe um código por mensagem de texto.
recovery-phone-code-image-description =
    .aria-label = Código recebido em um dispositivo móvel.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispositivo móvel com recursos de mensagens de texto SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Tela de dispositivo com códigos

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Você está conectado neste { -brand-firefox }.
inline-recovery-key-setup-create-header = Proteja sua conta
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Tem um minuto para proteger seus dados?
inline-recovery-key-setup-info = Crie uma chave de recuperação de conta, assim você pode restaurar os dados de navegação sincronizados, caso esqueça sua senha.
inline-recovery-key-setup-start-button = Criar chave de recuperação de conta
inline-recovery-key-setup-later-button = Mais tarde

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Ocultar senha
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Exibir senha
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Sua senha está visível na tela.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Sua senha está oculta.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Agora sua senha está visível na tela.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Agora sua senha está oculta.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Selecione um país
input-phone-number-enter-number = Insira o número do celular
input-phone-number-country-united-states = Estados Unidos
input-phone-number-country-canada = Canadá
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Voltar

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Link para redefinir senha danificado
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Link de confirmação danificado
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Link danificado
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = O link que você clicou tem caracteres faltando. Pode ter sido corrompido pelo seu cliente de email. Copie o endereço com cuidado e tente novamente.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Receber novo link

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Lembra sua senha?
# link navigates to the sign in page
remember-password-signin-link = Entrar

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Email principal já foi confirmado
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Acesso já confirmado
confirmation-link-reused-message = Esse link de confirmação já foi usado e só pode ser usado uma vez.

## Locale Toggle Component

locale-toggle-select-label = Selecionar idioma
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Requisição inválida

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Você precisa dessa senha para acessar dados criptografados armazenados conosco.
password-info-balloon-reset-risk-info = Redefinir significa potencialmente perder dados como senhas e favoritos.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = Pelo menos 8 caracteres
password-strength-inline-not-email = Não ter seu endereço de email
password-strength-inline-not-common = Não ser uma senha comumente usada
password-strength-inline-confirmed-must-match = A confirmação corresponde à nova senha

## Notification Promo Banner component

account-recovery-notification-cta = Criar
account-recovery-notification-header-value = Não perca seus dados se esquecer sua senha
account-recovery-notification-header-description = Crie uma chave de recuperação de conta para restaurar os dados de navegação sincronizados, caso esqueça sua senha.
recovery-phone-promo-cta = Adicionar celular de recuperação
recovery-phone-promo-heading = Adicione proteção extra à sua conta com um celular de recuperação
recovery-phone-promo-description = Agora você pode entrar com uma senha de uso único via SMS, se não puder usar seu aplicativo de autenticação em duas etapas.
recovery-phone-promo-info-link = Saiba mais sobre recuperação e risco de troca de SIM
promo-banner-dismiss-button =
    .aria-label = Descartar aviso

## Ready component

ready-complete-set-up-instruction = Conclua a configuração inserindo a nova senha em seus outros dispositivos com { -brand-firefox }.
manage-your-account-button = Gerenciar sua conta
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Está tudo pronto para usar o { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Já está tudo pronto para usar as configurações da conta
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Sua conta está pronta!
ready-continue = Continuar
sign-in-complete-header = Acesso confirmado
sign-up-complete-header = Conta confirmada
primary-email-verified-header = Email principal confirmado

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Lugares para guardar a chave:
flow-recovery-key-download-storage-ideas-folder-v2 = Pasta em um dispositivo seguro
flow-recovery-key-download-storage-ideas-cloud = Armazenamento confiável em nuvem
flow-recovery-key-download-storage-ideas-print-v2 = Cópia física impressa
flow-recovery-key-download-storage-ideas-pwd-manager = Gerenciador de senhas

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Adicione uma dica para ajudar a encontrar sua chave
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Esta dica deve te ajudar a lembrar onde guardou a chave de recuperação de conta. A dica pode ser exibida durante a redefinição de senha para recuperar seus dados.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Digite uma dica (opcional)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Pronto
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = A dica deve conter menos de 255 caracteres.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = A dica não pode conter caracteres unicode não seguros. São permitidos somente letras, números, sinais de pontuação e símbolos.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Aviso
password-reset-chevron-expanded = Recolher aviso
password-reset-chevron-collapsed = Expandir aviso
password-reset-data-may-not-be-recovered = Os dados do seu navegador podem não ser recuperados
password-reset-previously-signed-in-device-2 = Tem um dispositivo em que você conectou na conta?
password-reset-data-may-be-saved-locally-2 = Seus dados de navegação podem estar salvos neste dispositivo. Redefina a senha, depois entre na sua conta para restaurar e sincronizar seus dados.
password-reset-no-old-device-2 = Tem um novo dispositivo, mas não tem acesso a nenhum dispositivo anterior?
password-reset-encrypted-data-cannot-be-recovered-2 = Desculpe, seus dados de navegação estão criptografados nos servidores do { -brand-firefox }, não podem ser recuperados.
password-reset-warning-have-key = Tem uma chave de recuperação de conta?
password-reset-warning-use-key-link = Use agora para redefinir a senha e manter seus dados

## Alert Bar

alert-bar-close-message = Fechar mensagem

## User's avatar

avatar-your-avatar =
    .alt = Seu avatar
avatar-default-avatar =
    .alt = Avatar padrão

##


# BentoMenu component

bento-menu-title-3 = Produtos { -brand-mozilla }
bento-menu-tagline = Mais produtos da { -brand-mozilla } que protegem sua privacidade
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navegador { -brand-firefox } para computador
bento-menu-firefox-mobile = Navegador { -brand-firefox } para dispositivos móveis
bento-menu-made-by-mozilla = Feito pela { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Instale o { -brand-firefox } no celular ou tablet
connect-another-find-fx-mobile-2 = Encontre o { -brand-firefox } no { -google-play } ou na { -app-store }.

## Connected services section

cs-heading = Serviços conectados
cs-description = Tudo que você usa ou está conectado.
cs-cannot-refresh = Desculpe, houve um problema ao atualizar a lista de serviços conectados.
cs-cannot-disconnect = Cliente não encontrado, não é possível desconectar
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Desconectado da conta em { $service }
cs-refresh-button =
    .title = Atualizar serviços conectados
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Itens faltando ou duplicados?
cs-disconnect-sync-heading = Desconectar da sincronização

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = Seus dados de navegação permanecerão em <span>{ $device }</span>, mas não serão mais sincronizados com sua conta.
cs-disconnect-sync-reason-3 = Qual o principal motivo para desconectar <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Este dispositivo:
cs-disconnect-sync-opt-suspicious = É suspeito
cs-disconnect-sync-opt-lost = Foi perdido ou roubado
cs-disconnect-sync-opt-old = É antigo ou foi substituído
cs-disconnect-sync-opt-duplicate = Está duplicado
cs-disconnect-sync-opt-not-say = Prefiro não dizer

##

cs-disconnect-advice-confirm = Ok, entendi
cs-disconnect-lost-advice-heading = Desconectado dispositivo perdido ou roubado
cs-disconnect-lost-advice-content-3 = Como seu dispositivo foi perdido ou roubado, para manter suas informações seguras, você deve alterar a senha da sua { -product-mozilla-account } nas configurações da conta. Também deve buscar informações do fabricante do dispositivo sobre como apagar seus dados remotamente.
cs-disconnect-suspicious-advice-heading = Desconectado dispositivo suspeito
cs-disconnect-suspicious-advice-content-2 = Se o dispositivo desconectado for de fato suspeito, para manter suas informações seguras, você deve alterar a senha da sua { -product-mozilla-account } nas configurações da conta. Também deve alterar todas as outras senhas salvas no { -brand-firefox } digitando about:login na barra de endereços.
cs-sign-out-button = Desconectar

## Data collection section

dc-heading = Coleta e uso de dados
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Navegador { -brand-firefox }
dc-subheader-content-2 = Permitir que o serviço de { -product-mozilla-accounts } envie dados técnicos e de interação para a { -brand-mozilla }.
dc-subheader-ff-content = Para revisar ou atualizar as configurações de dados técnicos e de interação do navegador { -brand-firefox }, abra as configurações do { -brand-firefox } e percorra o painel de privacidade e segurança.
dc-opt-out-success-2 = Opção por não permitir feita com sucesso. { -product-mozilla-accounts(capitalization: "uppercase") } não irá enviar dados técnicos ou de interação para a { -brand-mozilla }.
dc-opt-in-success-2 = Obrigado! Compartilhar esses dados nos ajuda a melhorar as { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Desculpe, houve um problema ao alterar sua preferência de coleta de dados
dc-learn-more = Saiba mais

# DropDownAvatarMenu component

drop-down-menu-title-2 = Menu da { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Conectado como
drop-down-menu-sign-out = Desconectar
drop-down-menu-sign-out-error-2 = Desculpe, houve um problema ao desconectar da sua conta

## Flow Container

flow-container-back = Voltar

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Digite a senha novamente por motivo de segurança
flow-recovery-key-confirm-pwd-input-label = Digite sua senha
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Criar chave de recuperação de conta
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Criar nova chave de recuperação de conta

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Chave de recuperação de conta criada — Baixe e guarde agora
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Esta chave permite que você recupere seus dados caso esqueça sua senha. Baixe agora e guarde em algum lugar que você se lembre. Depois não poderá voltar a esta página.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Continuar sem baixar

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Criada chave de recuperação de conta

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Crie uma chave de recuperação de conta, para o caso de você esquecer sua senha
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Alteração da chave de recuperação de conta
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Criptografamos dados de navegação, senhas, favoritos e muito mais. É ótimo para privacidade, mas você pode perder seus dados se esquecer sua senha.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = É por isso que criar uma chave de recuperação de conta é tão importante. Você pode usar para restaurar seus dados.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Começar
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Cancelar

## FlowSetup2faApp

flow-setup-2fa-manual-key-heading = Insira o código manualmente

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Concluir

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-button-continue = Continuar

##

flow-setup-2fa-prompt-continue-button = Continuar

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Digite o código de verificação
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Um código de 6 dígitos foi enviado por SMS para <span>{ $phoneNumber }</span>. Expira em 5 minutos.
flow-setup-phone-confirm-code-input-label = Digite o código de 6 dígitos
flow-setup-phone-confirm-code-button = Confirmar
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = O código expirou?
flow-setup-phone-confirm-code-resend-code-button = Reenviar código
flow-setup-phone-confirm-code-resend-code-success = Código enviado
flow-setup-phone-confirm-code-success-message-v2 = Adicionado celular de recuperação de conta

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Verifique seu número de celular
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Você receberá uma mensagem de texto da { -brand-mozilla } com um código para verificar seu número. Não compartilhe esse código com ninguém.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Celular de recuperação de conta só está disponível nos Estados Unidos e no Canadá. Números VoIP e máscaras de celular não são recomendados.
flow-setup-phone-submit-number-legal = Ao fornecer seu número, você declara que concorda que ele seja salvo para podermos te enviar mensagens de texto, apenas para verificação de conta. Podem ser cobrados valores por mensagens e dados.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Enviar código

## HeaderLockup component, the header in account settings

header-menu-open = Fechar menu
header-menu-closed = Menu de navegação do site
header-back-to-top-link =
    .title = Voltar ao início
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Ajuda

## Linked Accounts section

la-heading = Contas vinculadas
la-description = Você autorizou o acesso às seguintes contas.
la-unlink-button = Desvincular
la-unlink-account-button = Desvincular
la-set-password-button = Definir senha
la-unlink-heading = Desvincular da conta de terceiros
la-unlink-content-3 = Tem certeza que quer desvincular sua conta? Fazer isso não te desconecta automaticamente dos seus serviços. Para fazer isso, você precisa desconectar manualmente na seção de serviços conectados.
la-unlink-content-4 = Antes de desvincular sua conta, você deve definir uma senha. Sem uma senha, não há como você entrar após desvincular sua conta.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Fechar
modal-cancel-button = Cancelar
modal-default-confirm-button = Confirmar

## ModalMfaProtected

modal-mfa-protected-cancel-button = Cancelar
modal-mfa-protected-confirm-button = Confirmar
modal-mfa-protected-code-expired = O código expirou?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Enviar novo código por email.

## Modal Verify Session

mvs-verify-your-email-2 = Confirme seu email
mvs-enter-verification-code-2 = Digite o código de confirmação
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Digite o código de confirmação enviado para <email>{ $email }</email> há cerca de 5 minutos.
msv-cancel-button = Cancelar
msv-submit-button-2 = Confirmar

## Settings Nav

nav-settings = Configurações
nav-profile = Perfil
nav-security = Segurança
nav-connected-services = Serviços conectados
nav-data-collection = Coleta e uso de dados
nav-paid-subs = Assinaturas pagas
nav-email-comm = Comunicações por email

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Houve um problema ao substituir seus códigos de autenticação de backup
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Houve um problema ao criar seus códigos de autenticação de backup
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Códigos de autenticação de backup atualizados

## Page2faSetup

page-2fa-setup-title = Autenticação em duas etapas

## Avatar change page

avatar-page-title =
    .title = Foto do perfil
avatar-page-add-photo = Adicionar foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Tirar foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Remover foto
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Tirar outra foto
avatar-page-cancel-button = Cancelar
avatar-page-save-button = Salvar
avatar-page-saving-button = Salvando…
avatar-page-zoom-out-button =
    .title = Reduzir
avatar-page-zoom-in-button =
    .title = Ampliar
avatar-page-rotate-button =
    .title = Girar
avatar-page-camera-error = Não foi possível iniciar a câmera
avatar-page-new-avatar =
    .alt = nova foto de perfil
avatar-page-file-upload-error-3 = Houve um problema ao enviar sua foto de perfil
avatar-page-delete-error-3 = Houve um problema ao excluir sua foto de perfil
avatar-page-image-too-large-error-2 = O arquivo de imagem é grande demais para ser enviado

## Password change page

pw-change-header =
    .title = Alterar senha
pw-8-chars = Pelo menos 8 caracteres
pw-not-email = Não ser seu endereço de email
pw-change-must-match = A nova senha deve ser igual à digitada na confirmação
pw-commonly-used = Não ser uma senha comumente usada
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Fique seguro, não reuse senhas. Veja mais dicas para <linkExternal>criar senhas fortes</linkExternal>.
pw-change-cancel-button = Cancelar
pw-change-save-button = Salvar
pw-change-forgot-password-link = Esqueceu a senha?
pw-change-current-password =
    .label = Digite a senha atual
pw-change-new-password =
    .label = Digite a nova senha
pw-change-confirm-password =
    .label = Confirme a nova senha
pw-change-success-alert-2 = Senha atualizada

## Password create page

pw-create-header =
    .title = Criar senha
pw-create-success-alert-2 = Senha definida
pw-create-error-2 = Desculpe, houve um problema ao definir sua senha

## Delete account page

delete-account-header =
    .title = Excluir conta
delete-account-step-1-2 = Etapa 1 de 2
delete-account-step-2-2 = Etapa 2 de 2
delete-account-confirm-title-4 = Você pode ter conectado sua { -product-mozilla-account } a um ou mais dos seguintes produtos ou serviços { -brand-mozilla } que mantêm você protegido e produtivo na web:
delete-account-product-mozilla-account = { -product-mozilla-account(capitalization: "uppercase") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sincronizando dados do { -brand-firefox }
delete-account-product-firefox-addons = Extensões do { -brand-firefox }
delete-account-acknowledge = Esteja ciente que ao excluir sua conta:
delete-account-chk-box-2 =
    .label = Você pode perder informações e recursos salvos dentro de produtos { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Reativar com este email pode não restaurar suas informações salvas
delete-account-chk-box-4 =
    .label = Quaisquer extensões e temas que você publicou em addons.mozilla.org serão excluídos
delete-account-continue-button = Continuar
delete-account-password-input =
    .label = Digite a senha
delete-account-cancel-button = Cancelar
delete-account-delete-button-2 = Excluir

## Display name page

display-name-page-title =
    .title = Nome de exibição
display-name-input =
    .label = Digite o nome de exibição
submit-display-name = Salvar
cancel-display-name = Cancelar
display-name-update-error-2 = Houve um problema ao atualizar seu nome de exibição
display-name-success-alert-2 = Nome de exibição atualizado

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Atividade recente da conta
recent-activity-account-create-v2 = Conta criada
recent-activity-account-disable-v2 = Conta desativada
recent-activity-account-enable-v2 = Conta ativada
recent-activity-account-login-v2 = Iniciada entrada na conta
recent-activity-account-reset-v2 = Iniciada redefinição de senha
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Devoluções de email excluídas
recent-activity-account-login-failure = Falha na tentativa de entrar na conta
recent-activity-account-two-factor-added = Autenticação em duas etapas ativada
recent-activity-account-two-factor-requested = Autenticação em duas etapas solicitada
recent-activity-account-two-factor-failure = Falha na autenticação em duas etapas
recent-activity-account-two-factor-success = Autenticação em duas etapas bem-sucedida
recent-activity-account-two-factor-removed = Autenticação em duas etapas removida
recent-activity-account-password-reset-requested = Redefinição de senha requisitada pela conta
recent-activity-account-password-reset-success = Redefinição de senha da conta bem-sucedida
recent-activity-account-recovery-key-added = Chave de recuperação de conta ativada
recent-activity-account-recovery-key-verification-failure = Falha na verificação da chave de recuperação de conta
recent-activity-account-recovery-key-verification-success = Verificação da chave de recuperação de conta bem-sucedida
recent-activity-account-recovery-key-removed = Removida a chave de recuperação de conta
recent-activity-account-password-added = Nova senha adicionada
recent-activity-account-password-changed = Senha alterada
recent-activity-account-secondary-email-added = Endereço de email secundário adicionado
recent-activity-account-secondary-email-removed = Endereço de email secundário removido
recent-activity-account-emails-swapped = Emails primário e secundário invertidos
recent-activity-session-destroy = Saiu da sessão
recent-activity-account-recovery-phone-send-code = Código de celular de recuperação de conta enviado
recent-activity-account-recovery-phone-setup-complete = Configuração de celular de recuperação de conta concluída
recent-activity-account-recovery-phone-signin-complete = Acesso com celular de recuperação de conta concluído
recent-activity-account-recovery-phone-signin-failed = Falha ao acessar com celular de recuperação de conta
recent-activity-account-recovery-phone-removed = Celular de recuperação de conta removido
recent-activity-account-recovery-codes-replaced = Códigos de recuperação substituídos
recent-activity-account-recovery-codes-created = Códigos de recuperação criados
recent-activity-account-recovery-codes-signin-complete = Acesso com códigos de recuperação de conta concluído
recent-activity-password-reset-otp-sent = Enviado um código de confirmação de redefinição de senha
recent-activity-password-reset-otp-verified = Validado o código de confirmação de redefinição de senha
recent-activity-must-reset-password = É necessário redefinir a senha
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Outra atividade da conta

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Chave de recuperação de conta
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Voltar à configuração

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Remover número de celular de recuperação de conta
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Isto remove <strong>{ $formattedFullPhoneNumber }</strong> como celular de recuperação de conta.
settings-recovery-phone-remove-recommend = Recomendamos manter este método porque é mais fácil do que salvar códigos de autenticação de backup.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Se você excluir, certifique-se de ainda ter seus códigos de autenticação de backup salvos. <linkExternal>Comparar métodos de recuperação</linkExternal>
settings-recovery-phone-remove-button = Remover número de celular
settings-recovery-phone-remove-cancel = Cancelar
settings-recovery-phone-remove-success = Celular de recuperação de conta removido

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Adicionar celular de recuperação de conta
page-setup-recovery-phone-back-button-title = Voltar às configurações
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Alterar número de celular

## Add secondary email page

add-secondary-email-step-1 = Etapa 1 de 2
add-secondary-email-error-2 = Houve um problema ao criar este email
add-secondary-email-page-title =
    .title = Email secundário
add-secondary-email-enter-address =
    .label = Digite um endereço de email
add-secondary-email-cancel-button = Cancelar
add-secondary-email-save-button = Salvar
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Máscaras de email não podem ser usadas como email secundário

## Verify secondary email page

add-secondary-email-step-2 = Etapa 2 de 2
verify-secondary-email-page-title =
    .title = Email secundário
verify-secondary-email-verification-code-2 =
    .label = Digite o código de confirmação
verify-secondary-email-cancel-button = Cancelar
verify-secondary-email-verify-button-2 = Confirmar
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Digite o código de confirmação enviado para <strong>{ $email }</strong> há cerca de 5 minutos.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } adicionado com sucesso

##

# Link to delete account on main Settings page
delete-account-link = Excluir conta
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Entrou com sucesso. Sua { -product-mozilla-account } e seus dados permanecerão ativos.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = Obtenha uma verificação gratuita

## Profile section

profile-heading = Perfil
profile-picture =
    .header = Foto
profile-display-name =
    .header = Nome de exibição
profile-primary-email =
    .header = Email principal

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Etapa { $currentStep } de { $numberOfSteps }.

## Security section of Setting

security-heading = Segurança
security-password =
    .header = Senha
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Criada em { $date }
security-not-set = Não definida
security-action-create = Criar
security-set-password = Defina uma senha para sincronizar e usar determinados recursos de segurança da conta.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Ver atividade recente da conta
signout-sync-header = Sessão expirada
signout-sync-session-expired = Desculpe, algo deu errado. Saia da sua conta no menu do navegador e tente novamente.

## SubRow component

tfa-row-backup-codes-title = Códigos de autenticação de backup
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nenhum código disponível
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } códigos restante
       *[other] { $numCodesAvailable } códigos restantes
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Criar novos códigos
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Adicionar
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Este é o método de recuperação mais seguro se você não puder usar seu dispositivo móvel ou aplicativo de autenticação.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Celular de recuperação de conta
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nenhum número de celular adicionado
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Alterar
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Adicionar
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Remover
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Remover celular de recuperação de conta
tfa-row-backup-phone-delete-restriction-v2 = Se quiser remover o celular de recuperação de conta, adicione códigos de autenticação de backup ou desative primeiro a autenticação em duas etapas para evitar ficar sem acesso à sua conta.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Este é o método de recuperação mais fácil, caso você não possa usar o aplicativo de autenticação.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Saiba mais sobre o risco de troca de SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Desativar
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Ativar
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Enviando…
switch-is-on = ativado
switch-is-off = desativado

## Sub-section row Defaults

row-defaults-action-add = Adicionar
row-defaults-action-change = Alterar
row-defaults-action-disable = Desativar
row-defaults-status = Nenhum

## Account recovery key sub-section on main Settings page

rk-header-1 = Chave de recuperação de conta
rk-enabled = Ativado
rk-not-set = Não definido
rk-action-create = Criar
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Alterar
rk-action-remove = Remover
rk-key-removed-2 = Chave de recuperação da conta removida
rk-cannot-remove-key = Não foi possível remover a chave de recuperação da sua conta.
rk-refresh-key-1 = Atualizar chave de recuperação de conta
rk-content-explain = Restaure suas informações caso esqueça sua senha.
rk-cannot-verify-session-4 = Desculpe, houve um problema ao confirmar a sessão.
rk-remove-modal-heading-1 = Remover chave de recuperação de conta?
rk-remove-modal-content-1 = Caso você redefina sua senha, não poderá usar sua chave de recuperação de conta para acessar seus dados. Esta ação não pode ser desfeita.
rk-remove-error-2 = Não foi possível remover a chave de recuperação da sua conta
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Excluir chave de recuperação de conta

## Secondary email sub-section on main Settings page

se-heading = Email secundário
    .header = Email secundário
se-cannot-refresh-email = Desculpe, houve um problema ao atualizar esse email.
se-cannot-resend-code-3 = Desculpe, houve um problema ao reenviar o código de confirmação
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } agora é seu email principal
se-set-primary-error-2 = Desculpe, houve um problema ao alterar seu email principal
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } excluído com sucesso
se-delete-email-error-2 = Desculpe, houve um problema ao excluir este email
se-verify-session-3 = Você precisa confirmar a sessão atual para realizar esta ação
se-verify-session-error-3 = Desculpe, houve um problema ao confirmar a sessão
# Button to remove the secondary email
se-remove-email =
    .title = Remover email
# Button to refresh secondary email status
se-refresh-email =
    .title = Atualizar email
se-unverified-2 = não confirmado
se-resend-code-2 = Confirmação necessária. <button>Reenvie o código de verificação</button>, se ele não estiver na sua caixa de entrada ou pasta de spam.
# Button to make secondary email the primary
se-make-primary = Tornar principal
se-default-content = Acesse sua conta se você não conseguir entrar no seu email principal.
se-content-note-1 = Nota: Usar um email secundário não restaura suas informações, você precisa de uma <a>chave de recuperação de conta</a> para isso.
# Default value for the secondary email
se-secondary-email-none = Nenhum

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autenticação em duas etapas
tfa-row-enabled = Ativada
tfa-row-disabled-status = Desativado
tfa-row-action-add = Adicionar
tfa-row-action-disable = Desativar
tfa-row-button-refresh =
    .title = Atualizar autenticação em duas etapas
tfa-row-cannot-refresh = Desculpe, houve um problema ao atualizar a autenticação em duas etapas.
tfa-row-enabled-description = Sua conta está protegida pela autenticação em duas etapas. Ao entrar na sua { -product-mozilla-account }, você precisa inserir um código de uso único gerado por um aplicativo de autenticação.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Como isso protege sua conta
tfa-row-disabled-description-v2 = Ajude a proteger sua conta usando um aplicativo de autenticação de terceiros como segunda etapa para entrar na conta.
tfa-row-cannot-verify-session-4 = Desculpe, houve um problema ao confirmar a sessão
tfa-row-disable-modal-heading = Desativar autenticação em duas etapas?
tfa-row-disable-modal-confirm = Desativar
tfa-row-disable-modal-explain-1 = Esta ação não pode ser desfeita. Você também tem a opção de <linkExternal>substituir seus códigos de autenticação de backup</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Autenticação em duas etapas desativada
tfa-row-cannot-disable-2 = Não foi possível desativar a autenticação em duas etapas

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Ao prosseguir, você declara que concorda com os:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = Serviços de assinatura <mozSubscriptionTosLink>Termos do serviço</mozSubscriptionTosLink> e <mozSubscriptionPrivacyLink>Aviso de privacidade</mozSubscriptionPrivacyLink> da { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Termos do serviço</mozillaAccountsTos> e <mozillaAccountsPrivacy>Aviso de privacidade</mozillaAccountsPrivacy> das { -product-mozilla-accounts }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Ao prosseguir, você declara que concorda com os <mozillaAccountsTos>Termos do serviço</mozillaAccountsTos> e <mozillaAccountsPrivacy>Aviso de privacidade</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = ou
continue-with-google-button = Continuar com { -brand-google }
continue-with-apple-button = Continuar com { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Conta desconhecida
auth-error-103 = Senha incorreta
auth-error-105-2 = Código de confirmação inválido
auth-error-110 = Token inválido
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Você já tentou vezes demais. Tente novamente mais tarde.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Você já tentou vezes demais. Tente novamente { $retryAfter }.
auth-error-125 = A solicitação foi bloqueada por motivos de segurança
auth-error-129-2 = Você digitou um número de celular inválido. Verifique e tente novamente.
auth-error-138-2 = Sessão não confirmada
auth-error-139 = O email secundário deve ser diferente do email da sua conta
auth-error-155 = Token TOTP não encontrado
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Código de autenticação de backup não encontrado
auth-error-159 = Chave de recuperação de conta inválida
auth-error-183-2 = Código de confirmação inválido ou vencido
auth-error-202 = Funcionalidade não ativada
auth-error-203 = Sistema indisponível, tente novamente mais tarde
auth-error-206 = Não foi possível criar senha, a senha já foi definida
auth-error-214 = Já existe o número de celular de recuperação de conta
auth-error-215 = Não existe o número de telefone de recuperação
auth-error-216 = Atingiu o limite de mensagens de texto
auth-error-218 = Não foi possível remover o celular de recuperação de conta, faltam códigos de autenticação de backup.
auth-error-219 = Este número de celular foi registrado em contas demais. Tente outro número.
auth-error-999 = Erro não esperado
auth-error-1001 = Tentativa de acesso cancelada
auth-error-1002 = A sessão expirou. Entre novamente para continuar.
auth-error-1003 = Armazenamento local ou cookies ainda estão desativados
auth-error-1008 = Sua nova senha deve ser diferente
auth-error-1010 = É necessário uma senha válida
auth-error-1011 = É necessário um email válido
auth-error-1018 = Seu email de confirmação foi devolvido. Digitou errado o email?
auth-error-1020 = Digitou errado o email? firefox.com não é um serviço de email válido
auth-error-1031 = É necessário informar sua idade para se cadastrar
auth-error-1032 = É necessário informar uma idade válida para se cadastrar
auth-error-1054 = Código de autenticação em duas etapas inválido
auth-error-1056 = Código de autenticação de backup inválido
auth-error-1062 = Redirecionamento inválido
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Digitou errado o email? { $domain } não é um serviço de email válido
auth-error-1066 = Máscaras de email não podem ser usadas para criar uma conta.
auth-error-1067 = Digitou errado o email?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Número terminado em { $lastFourPhoneNumber }
oauth-error-1000 = Algo deu errado. Feche esta aba e tente novamente.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Você está conectado neste { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Email confirmado
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Acesso confirmado
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Entre na sua conta neste { -brand-firefox } para concluir a configuração
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Entrar
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Ainda adicionando dispositivos? Entre na sua conta no { -brand-firefox } em outro dispositivo para concluir a configuração
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Entre na sua conta no { -brand-firefox } em outro dispositivo para concluir a configuração
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Quer ter suas abas, favoritos e senhas em outro dispositivo?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Conectar outro dispositivo
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Agora não
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Entre na sua conta no { -brand-firefox } para Android para concluir a configuração
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Entre na sua conta no { -brand-firefox } para iOS para concluir a configuração

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = É necessário armazenamento local e cookies
cookies-disabled-enable-prompt-2 = Ative cookies e armazenamento local em seu navegador para acessar sua { -product-mozilla-account }. Fazer isso ativa funcionalidades como lembrar de você entre sessões.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Tentar novamente
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Saiba mais

## Index / home page

index-header = Insira seu email
index-sync-header = Continuar para sua { -product-mozilla-account }
index-sync-subheader = Sincronize senhas, abas e favoritos onde quer que use o { -brand-firefox }.
index-relay-header = Criar uma máscara de email
index-relay-subheader = Indique o endereço de email para onde quer que sejam encaminhadas mensagens enviadas para sua máscara de email.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Continuar para { $serviceName }
index-subheader-default = Continuar para as configurações da conta
index-cta = Entrar na sua conta ou criar uma
index-account-info = Uma { -product-mozilla-account } também libera acesso a mais produtos de proteção de privacidade da { -brand-mozilla }.
index-email-input =
    .label = Insira seu email
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Conta excluída com sucesso
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Seu email de confirmação foi devolvido. Digitou errado o email?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Não foi possível criar sua chave de recuperação de conta. Tente novamente mais tarde.
inline-recovery-key-setup-recovery-created = Criada chave de recuperação de conta
inline-recovery-key-setup-download-header = Proteja sua conta
inline-recovery-key-setup-download-subheader = Baixe e guarde agora
inline-recovery-key-setup-download-info = Guarde esta chave em algum lugar que você lembre. Você não poderá voltar a esta página mais tarde para ver a chave.
inline-recovery-key-setup-hint-header = Recomendação de segurança

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Cancelar configuração
inline-totp-setup-continue-button = Continuar
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Adicione uma camada de segurança à sua conta, exigindo códigos de autenticação de um <authenticationAppsLink>desses aplicativos de autenticação</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Ative a autenticação em duas etapas <span>para continuar para as configurações da conta</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Ative a autenticação em duas etapas <span>para continuar para o { $serviceName }</span>
inline-totp-setup-ready-button = Pronto
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Aponte a câmera para o código de autenticação <span>para continuar para o { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Digite o código manualmente <span>para continuar para o { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Aponte a câmera para o código de autenticação <span>para continuar para as configurações da conta</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Digite o código manualmente <span>para continuar para as configurações da conta</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Digite esta chave secreta em seu aplicativo de autenticação. <toggleToQRButton>Prefere capturar o código QR?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Capture o código QR em seu aplicativo de autenticação, depois digite o código de autenticação que ele fornecer. <toggleToManualModeButton>Não consegue capturar o código?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Após concluir, ele começa a gerar códigos de autenticação para você digitar.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Código de autenticação
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Necessário código de autenticação
tfa-qr-code-alt = Use o código { $code } para configurar a autenticação em duas etapas em aplicativos suportados.

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Jurídico
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Termos do serviço
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Política de privacidade

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Aviso de privacidade

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Termos do serviço

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Você acabou de entrar na sua conta no { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Sim, aprovar dispositivo
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Se não foi você, <link>mude sua senha</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Dispositivo conectado
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Agora você está sincronizando com: { $deviceFamily } em { $deviceOS }
pair-auth-complete-sync-benefits-text = Agora você pode acessar suas abas abertas, senhas e favoritos em todos os seus dispositivos.
pair-auth-complete-see-tabs-button = Veja abas de dispositivos sincronizados
pair-auth-complete-manage-devices-link = Gerenciar dispositivos

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Digite o código de autenticação <span>para continuar para as configurações da conta</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Digite o código de autenticação <span>para continuar para o { $serviceName }</span>
auth-totp-instruction = Abra seu aplicativo de autenticação e digite o código de autenticação que ele fornecer.
auth-totp-input-label = Digite o código de 6 dígitos
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Confirmar
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Necessário código de autenticação

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Agora é exigida aprovação <span>em seu outro dispositivo</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Conexão não concluída
pair-failure-message = O processo de configuração foi interrompido.

## Pair index page

pair-sync-header = Sincronize o { -brand-firefox } em seu celular ou tablet
pair-cad-header = Conecte o { -brand-firefox } em outro dispositivo
pair-already-have-firefox-paragraph = Já tem o { -brand-firefox } em um celular ou tablet?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sincronize seu dispositivo
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Ou baixe
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Aponte a câmera para o código para baixar o { -brand-firefox } para dispositivos móveis ou envie para si mesmo um <linkExternal>link de download</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Agora não
pair-take-your-data-message = Tenha suas abas, favoritos e senhas onde quer que use o { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Introdução
# This is the aria label on the QR code image
pair-qr-code-aria-label = Código QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Dispositivo conectado
pair-success-message-2 = Conexão bem-sucedida.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Confirmar conexão <span>de { $email }</span>
pair-supp-allow-confirm-button = Confirmar conexão
pair-supp-allow-cancel-link = Cancelar

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Agora precisa aprovar <span>em seu outro dispositivo</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Conectar usando um aplicativo
pair-unsupported-message = Você usou a câmera do sistema? Você deve conectar usando um aplicativo { -brand-firefox }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Aguarde, você está sendo redirecionado para o aplicativo autorizado.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Digite sua chave de recuperação de conta
account-recovery-confirm-key-instruction = Esta chave recupera seus dados de navegação criptografados, como senhas e favoritos, dos servidores do { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Digite sua chave de recuperação de conta de 32 caracteres
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Sua dica de onde guardou é:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Avançar
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Não encontrou sua chave de recuperação de conta?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Crie uma nova senha
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Senha definida
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Desculpe, houve um problema ao definir sua senha
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Usar chave de recuperação de conta
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Sua senha foi redefinida.
reset-password-complete-banner-message = Não esqueça de gerar uma nova chave de recuperação de conta a partir das configurações da sua { -product-mozilla-account } para evitar futuros problemas de acesso.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Insira o código de 10 caracteres
confirm-backup-code-reset-password-confirm-button = Confirmar
confirm-backup-code-reset-password-subheader = Digite um código de autenticação de backup
confirm-backup-code-reset-password-instruction = Digite um dos códigos de uso único que você salvou ao configurar a autenticação em duas etapas.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Não consegue acessar sua conta?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Verifique seu email
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Enviamos um código de confirmação para <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Digite o código de 8 dígitos em até 10 minutos
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Avançar
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Reenviar código
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Usar outra conta

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Redefinição de senha
confirm-totp-reset-password-subheader-v2 = Insira o código de autenticação em duas etapas
confirm-totp-reset-password-instruction-v2 = Use um <strong>aplicativo de autenticação</strong> para redefinir a senha.
confirm-totp-reset-password-trouble-code = Problemas ao inserir o código?
confirm-totp-reset-password-confirm-button = Confirmar
confirm-totp-reset-password-input-label-v2 = Insira o código de 6 dígitos
confirm-totp-reset-password-use-different-account = Usar outra conta

## ResetPassword start page

password-reset-flow-heading = Redefinição de senha
password-reset-body-2 = Para manter sua conta segura, solicitaremos algumas informações que só você sabe.
password-reset-email-input =
    .label = Insira seu email
password-reset-submit-button-2 = Avançar

## ResetPasswordConfirmed

reset-password-complete-header = Sua senha foi redefinida
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Continuar para { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Redefina sua senha
password-reset-recovery-method-subheader = Escolha um método de recuperação
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Vamos garantir que é mesmo você usando seus métodos de recuperação.
password-reset-recovery-method-phone = Celular de recuperação
password-reset-recovery-method-code = Códigos de autenticação de backup
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Houve um problema ao enviar um código para seu celular de recuperação
password-reset-recovery-method-send-code-error-description = Tente novamente mais tarde ou use seus códigos de autenticação de backup.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-code-submit-button = Confirmar
reset-password-recovery-phone-resend-code-button = Reenviar código
reset-password-recovery-phone-resend-success = Código enviado
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Tente novamente mais tarde.
reset-password-with-recovery-key-verified-page-title = Senha redefinida com sucesso
reset-password-complete-new-password-saved = Nova senha salva!
reset-password-complete-recovery-key-created = Criada nova chave de recuperação de conta. Baixe e guarde agora mesmo.
reset-password-complete-recovery-key-download-info = Esta chave é essencial para recuperação de dados, caso esqueça sua senha. <b>Baixe e guarde com segurança agora mesmo, pois você não poderá acessar esta página novamente mais tarde.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Erro:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Validando acesso…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Erro de confirmação
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = O link de confirmação expirou
signin-link-expired-message-2 = O link que você clicou expirou ou já foi usado.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Digite a senha <span>da sua { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Continuar para { $serviceName }
signin-subheader-without-logo-default = Continuar para as configurações da conta
signin-button = Entrar
signin-header = Entrar
signin-use-a-different-account-link = Usar outra conta
signin-forgot-password-link = Esqueceu a senha?
signin-password-button-label = Senha
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.
signin-account-locked-banner-heading = Redefina a sua senha

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = O link que você clicou tem caracteres faltando. Pode ter sido corrompido pelo seu cliente de email. Copie o endereço com cuidado e tente novamente.
report-signin-header = Denunciar acesso não autorizado?
report-signin-body = Você recebeu um email de tentativa de acesso à sua conta. Quer denunciar esta atividade como suspeita?
report-signin-submit-button = Denunciar atividade
report-signin-support-link = Por que isso está acontecendo?
report-signin-error = Desculpe, houve um problema ao enviar a denúncia.
signin-bounced-header = Desculpe. Bloqueamos a sua conta.
# $email (string) - The user's email.
signin-bounced-message = O email de confirmação que enviamos para { $email } retornou e bloqueamos sua conta para proteger seus dados do { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Se este for um endereço de email válido, <linkExternal>avise-nos</linkExternal> e poderemos ajudar a desbloquear sua conta.
signin-bounced-create-new-account = Não tem mais este email? Crie outra conta
back = Voltar

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Confirme este acesso para <span>continuar para as configurações da conta</span>
signin-push-code-heading-w-custom-service = Confirme este acesso para <span>continuar para o { $serviceName }</span>
signin-push-code-instruction = Verifique seus outros dispositivos e aprove este acesso no navegador { -brand-firefox }.
signin-push-code-did-not-recieve = Não recebeu a notificação?
signin-push-code-send-email-link = Enviar código por email

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Confirme seu acesso
signin-push-code-confirm-description = Detectamos uma tentativa de acesso feita pelo dispositivo a seguir. Se foi você, aprove o acesso
signin-push-code-confirm-verifying = Verificando
signin-push-code-confirm-login = Confirmar acesso
signin-push-code-confirm-wasnt-me = Não foi eu, mudar a senha.
signin-push-code-confirm-login-approved = Seu acesso foi aprovado. Feche esta janela.
signin-push-code-confirm-link-error = Link danificado. Tente novamente.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Entrar
signin-recovery-method-subheader = Escolha um método de recuperação
signin-recovery-method-details = Vamos garantir que é mesmo você usando seus métodos de recuperação.
signin-recovery-method-phone = Celular de recuperação de conta
signin-recovery-method-code-v2 = Códigos de autenticação de backup
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } código restante
       *[other] { $numBackupCodes } códigos restantes
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Houve um problema ao enviar um código para seu celular de recuperação de conta
signin-recovery-method-send-code-error-description = Tente novamente mais tarde ou use seus códigos de autenticação de backup.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Entrar
signin-recovery-code-sub-heading = Digite um código de autenticação de backup
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Digite um dos códigos de uso único que você salvou ao configurar a autenticação em duas etapas.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Insira o código de 10 caracteres
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Confirmar
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Usar celular de recuperação de conta
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Sua conta está bloqueada?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Necessário código de autenticação de backup
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Houve um problema ao enviar um código para seu celular de recuperação de conta
signin-recovery-code-use-phone-failure-description = Tente novamente mais tarde.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Entrar
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Insira o código de recuperação
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Um código de 6 dígitos foi enviado para o número de celular com final <span>{ $lastFourPhoneDigits }</span> por mensagem de texto. Expira em 5 minutos. Não compartilhe com ninguém.
signin-recovery-phone-input-label = Digite o código de 6 dígitos
signin-recovery-phone-code-submit-button = Confirmar
signin-recovery-phone-resend-code-button = Reenviar código
signin-recovery-phone-resend-success = Código enviado
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Você está sem acesso à sua conta?
signin-recovery-phone-send-code-error-heading = Houve um problema ao enviar um código
signin-recovery-phone-code-verification-error-heading = Houve um problema ao verificar seu código
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Tente novamente mais tarde.
signin-recovery-phone-invalid-code-error-description = O código é inválido ou expirou.
signin-recovery-phone-invalid-code-error-link = Usar códigos de autenticação de backup em vez disso?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Conectado com sucesso. Limites podem ser aplicados se você usar novamente seu celular de recuperação.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Obrigado por sua vigilância
signin-reported-message = Nossa equipe foi notificada. Relatos como este nos ajudam a evitar intrusos.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Digite o código de confirmação<span> da sua { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Insira o código enviado para <email>{ $email }</email> em até 5 minutos.
signin-token-code-input-label-v2 = Digite o código de 6 dígitos
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirmar
signin-token-code-code-expired = O código expirou?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Enviar novo código por email.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Necessário código de confirmação
signin-token-code-resend-error = Algo deu errado. Não foi possível enviar um novo código.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Entrar
signin-totp-code-subheader-v2 = Insira o código de autenticação em duas etapas
signin-totp-code-instruction-v4 = Use um <strong>aplicativo de autenticação</strong> para confirmar seu acesso.
signin-totp-code-input-label-v4 = Insira o código de 6 dígitos
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Confirmar
signin-totp-code-other-account-link = Usar outra conta
signin-totp-code-recovery-code-link = Problemas ao inserir o código?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Necessário código de autenticação
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autorizar este acesso
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Verifique se recebeu email com código de autorização, enviado para { $email }.
signin-unblock-code-input = Digite o código de autorização
signin-unblock-submit-button = Avançar
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Necessário código de autorização
signin-unblock-code-incorrect-length = O código de autorização deve ter 8 caracteres
signin-unblock-code-incorrect-format-2 = O código de autorização só pode conter letras e/ou números
signin-unblock-resend-code-button = Não chegou em sua caixa de entrada ou pasta de spam? Reenviar
signin-unblock-support-link = Por que isso está acontecendo?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Digite o código de confirmação
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Digite o código de confirmação <span>da sua { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Insira o código enviado para <email>{ $email }</email> em até 5 minutos.
confirm-signup-code-input-label = Digite o código de 6 dígitos
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Confirmar
confirm-signup-code-code-expired = O código expirou?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Enviar novo código por email.
confirm-signup-code-success-alert = Conta confirmada com sucesso
# Error displayed in tooltip.
confirm-signup-code-is-required-error = O código de confirmação é obrigatório
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = O { -brand-firefox } irá tentar redirecionar de volta para você usar uma máscara de email após entrar na sua conta.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-relay-info = É necessária uma senha para gerenciar de forma segura suas máscaras de email e acessar as ferramentas de segurança da { -brand-mozilla }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Alterar email
