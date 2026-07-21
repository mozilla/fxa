## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="logótipo do { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronizar dispositivos">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositivos">
fxa-privacy-url = Política de Privacidade da { -brand-mozilla }
moz-accounts-privacy-url-2 = Informação de Privacidade de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Termos do Serviço de { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Se a sua conta for apagada, irá continuar a receber e-mails da Mozilla Corporation e da Mozilla Foundation, a menos que <a data-l10n-name="unsubscribeLink">peça para cancelar a subscrição</a>.
account-deletion-info-block-support = Se tiver quaisquer questões ou precisar de ajuda, não hesite em contactar a nossa <a data-l10n-name="supportLink">equipa de apoio</a>.
account-deletion-info-block-communications-plaintext = Se a sua conta for eliminada, irá continuar a receber e-mails da Mozilla Corporation e da Mozilla Foundation, a menos que peça para cancelar a subscrição:
account-deletion-info-block-support-plaintext = Se tiver quaisquer dúvidas ou precisar de ajuda, não hesite em contactar a nossa equipa de apoio:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Descarregue{ $productName } em { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Descarregue { $productName } na { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instale o { $productName } <a data-l10n-name="anotherDeviceLink">noutro computador</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instale o { $productName } <a data-l10n-name="anotherDeviceLink">noutro dispositivo</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Obtenha o { $productName } no Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Transfira o { $productName } na App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instale o { $productName } noutro dispositivo:
automated-email-change-2 = Se não executou esta ação, <a data-l10n-name="passwordChangeLink">altere a sua palavra-passe</a> imediatamente.
automated-email-support = Para mais informação, visite o <a data-l10n-name="supportLink">Apoio da { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Se não executou esta ação, altere a sua palavra-passe imediatamente:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Para mais informação, visite o Apoio da { -brand-mozilla }:
automated-email-inactive-account = Este é um e-mail automático. Está a recebê-lo porque possui uma { -product-mozilla-account } e já passaram 2 anos desde a sua última autenticação.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Para mais informação, visite o <a data-l10n-name="supportLink">Apoio da { -brand-mozilla }</a>
automated-email-no-action-plaintext = Esta é uma mensagem automática. Se a recebeu por engano, não precisa de fazer nada.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Esta é uma mensagem automática; se não autorizou esta ação, então, por favor, altere a sua palavra-passe:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Este pedido teve origem em { $uaBrowser } em { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Este pedido teve origem em { $uaBrowser } em { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Este pedido teve origem em { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Este pedido teve origem em { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Este pedido teve origem em { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Se não foi você, <a data-l10n-name="revokeAccountRecoveryLink">elimine a nova chave</a> e <a data-l10n-name="passwordChangeLink">altere a sua palavra-passe</a>.
automatedEmailRecoveryKey-change-pwd-only = Se não foi você, <a data-l10n-name="passwordChangeLink">altere a sua palavra-passe</a>.
automatedEmailRecoveryKey-more-info = Para mais informação, visite o <a data-l10n-name="supportLink">Apoio da { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Este pedido veio de:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Se não foi você, elimine a nova chave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Se não foi você, altere a sua palavra-passe:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = e altere a sua palavra-passe:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Para mais informação, visite o Apoio da { -brand-mozilla }:
automated-email-reset =
    Este é um e-mail automático; se não autorizou esta ação, <a data-l10n-name="resetLink">por favor altere a sua palavra-passe</a>.
    Para mais informação, por favor visite o <a data-l10n-name="supportLink">Apoio da { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Caso não tenha autorizado esta ação, por favor, proceda imediatamente à reposição da sua palavra-passe em { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Se não executou esta ação, <a data-l10n-name="resetLink">reponha a sua palavra-passe</a> e <a data-l10n-name="twoFactorSettingsLink">reponha a autenticação de dois passos</a> certo ausente. Para mais informação, por favor visite o <a data-l10n-name="supportLink">Apoio da { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Se não executou esta ação, reponha a sua palavra-passe imediatamente em:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Além disso, reponha a autenticação de dois passos em:
automated-email-sign-in = Este é um email automático; se não autorizou esta ação, por favor <a data-l10n-name="securitySettingsLink">reveja as suas definições de segurança da conta</a>. Para mais informação, por favor visite o <a data-l10n-name="supportLink">{ -brand-mozilla } Apoio</a>.
automated-email-sign-in-plaintext = Se não autorizou esta ação, por favor reveja as definições de segurança da sua conta em:
brand-banner-message = Sabia que nós alterámos o nosso nome de { -product-firefox-accounts } para { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Saiba mais</a>
change-password-plaintext = Se suspeita que alguém está a tentar obter acesso à sua conta, por favor, altere a sua palavra-passe.
manage-account = Gerir conta
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Para mais informação, visite o <a data-l10n-name="supportLink">Apoio da { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Para mais informação, visite o Apoio da { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } no { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } no { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimado)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimado)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimado)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimado)
cadReminderFirst-subject-1 = Lembrete! Vamos sincronizar o { -brand-firefox }
cadReminderFirst-action = Sincronizar outro dispositivo
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = São necessários dois para sincronizar
cadReminderFirst-description-v2 = Utilize os seus separadores em todos os seus dispositivos. Obtenha os seus marcadores, palavras-passe e outros dados onde quer que utilize o { -brand-firefox }.
cadReminderSecond-subject-2 = Não perca nada! Vamos terminar a sua configuração da sincronização
cadReminderSecond-action = Sincronizar outro dispositivo
cadReminderSecond-title-2 = Não se esqueça de sincronizar!
cadReminderSecond-description-sync = Sincronize os seus marcadores, palavras-passe, separadores abertos e mais — onde quer que utilize o { -brand-firefox }.
cadReminderSecond-description-plus = Além disso, os seus dados são sempre encriptados. Somente você e os dispositivos aprovados podem vê-los.
inactiveAccountFinalWarning-subject = Última oportunidade para manter a sua { -product-mozilla-account }
inactiveAccountFinalWarning-title = A sua conta e os dados da { -brand-mozilla } serão eliminados
inactiveAccountFinalWarning-preview = Iniciar sessão para manter a sua conta
inactiveAccountFinalWarning-account-description = A sua { -product-mozilla-account } é utilizada para aceder gratuitamente a produtos de privacidade e de navegação como o { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = A <strong>{ $deletionDate }</strong>, a sua conta e os seus dados pessoais serão eliminados permanentemente a menos que inicie sessão.
inactiveAccountFinalWarning-action = Iniciar sessão para manter a sua conta
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Iniciar sessão para manter a sua conta:
inactiveAccountFirstWarning-subject = Não perca a sua conta
inactiveAccountFirstWarning-title = Pretende manter a sua conta e os dados da { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = A sua { -product-mozilla-account } é utilizada para aceder gratuitamente a produtos de privacidade e de navegação como o { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Verificámos que não iniciou sessão nos últimos dois anos.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = A sua conta e os seus dados pessoais serão eliminados permanentemente a <strong>{ $deletionDate }</strong> por inatividade.
inactiveAccountFirstWarning-action = Iniciar sessão para manter a sua conta
inactiveAccountFirstWarning-preview = Iniciar sessão para manter a sua conta
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Iniciar sessão para manter a sua conta:
inactiveAccountSecondWarning-subject = Ação necessária: eliminação de conta em 7 dias
inactiveAccountSecondWarning-title = A sua conta e dados da { -brand-mozilla } serão eliminados em 7 dias
inactiveAccountSecondWarning-account-description-v2 = A sua { -product-mozilla-account } é utilizada para aceder gratuitamente a produtos de privacidade e de navegação como o { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay } e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = A sua conta e os seus dados pessoais serão eliminados permanentemente a <strong>{ $deletionDate }</strong> por inatividade.
inactiveAccountSecondWarning-action = Iniciar sessão para manter a sua conta
inactiveAccountSecondWarning-preview = Iniciar sessão para manter a sua conta
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Iniciar sessão para manter a sua conta:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Está sem códigos de autenticação de recuperação!
codes-reminder-title-one = Está a utilizar o seu últimos código de autenticação de recuperação
codes-reminder-title-two = Chegou o momento de criar mais códigos de autenticação de recuperação
codes-reminder-description-part-one = Os códigos de autenticação de recuperação ajudam a restaurar a sua informação quando se esquece da sua palavra-passe.
codes-reminder-description-part-two = Crie novos códigos agora para não perder os seus dados mais tarde.
codes-reminder-description-two-left = Restam apenas dois códigos.
codes-reminder-description-create-codes = Crie novos códigos de autenticação de recuperação para ajudar a recuperar a sua conta se estiver bloqueado.
lowRecoveryCodes-action-2 = Criar códigos
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Não tem mais códigos de autenticação de recuperação
        [one] Resta apenas 1 código de autenticação de recuperação
       *[other] Restam apenas { $numberRemaining } códigos de recuperação
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Novo início de sessão para { $clientName }
newDeviceLogin-subjectForMozillaAccount = Novo início de sessão na sua { -product-mozilla-account }
newDeviceLogin-title-3 = A sua { -product-mozilla-account } foi utilizada para iniciar a sessão
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Não é você? <a data-l10n-name="passwordChangeLink">Altere a sua palavra-passe</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Não é você? Altere a sua palavra-passe:
newDeviceLogin-action = Gerir conta
passwordChangeRequired-subject = Detetada atividade suspeita
passwordChangeRequired-preview = Altere a sua palavra-passe imediatamente
passwordChangeRequired-title-2 = Repor a sua palavra-passe
passwordChangeRequired-suspicious-activity-3 = Bloqueámos a sua conta para a manter segura de atividades suspeitas. A sua sessão foi terminada em todos os seus dispositivos e quaisquer dados sincronizados foram eliminados como precaução.
passwordChangeRequired-sign-in-3 = Para iniciar sessão novamente na sua conta, tudo o que precisa de fazer é repor a sua palavra-passe.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Escolha uma palavra-passe forte que seja diferente das que utilizou no passado.
passwordChangeRequired-different-password-plaintext-2 = Importante: Escolha uma palavra-passe forte que seja diferente das que utilizou no passado.
passwordChangeRequired-action = Repor palavra-passe
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Palavra-passe atualizada
passwordChanged-title = Palavra-passe alterada com sucesso
passwordChanged-description-2 = A palavra-passe da { -product-mozilla-account } foi alterada com sucesso a partir do seguinte dispositivo:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Utilizar { $code } para alterar a sua palavra-passe
password-forgot-otp-preview = Este código expira em 10 minutos
password-forgot-otp-title = Esqueceu-se da sua palavra-passe?
password-forgot-otp-request = Nós recebemos um pedido de alteração da palavra-passe na sua { -product-mozilla-account } de:
password-forgot-otp-code-2 = Se foi você, aqui está o seu código de confirmação para continuar:
password-forgot-otp-expiry-notice = Este código expira em 10 minutos.
passwordReset-subject-2 = A sua palavra-passe foi redefinida
passwordReset-title-2 = A sua palavra-passe foi redefinida
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Redefiniu a palavra passe da sua { -product-mozilla-account } em:
passwordResetAccountRecovery-subject-2 = A sua palavra-passe foi redefinida
passwordResetAccountRecovery-title-3 = A sua palavra-passe foi redefinida
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Utilizou a sua chave de recuperação de conta para redefinir a palavra-passe da sua { -product-mozilla-account } em:
passwordResetAccountRecovery-information = Terminámos a sessão de todos os seus dispositivos sincronizados. Criámos uma nova chave de recuperação da conta para substituir a que utilizou. Pode alterar a mesma nas definições da sua conta.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Terminamos a sessão de todos os seus dispositivos sincronizados. Criámos uma nova chave de recuperação da conta para substituir a que utilizou. Pode alterar a mesma nas definições da sua conta:
passwordResetAccountRecovery-action-4 = Gerir conta
passwordResetRecoveryPhone-subject = Telefone de recuperação utilizado
passwordResetRecoveryPhone-preview = Confirmar para ter a certeza que foi você
passwordResetRecoveryPhone-title = O seu telefone de recuperação foi utilizado para confirmar uma reposição de palavra-passe
passwordResetRecoveryPhone-device = Telefone de recuperação utilizado de:
passwordResetRecoveryPhone-action = Gerir conta
passwordResetWithRecoveryKeyPrompt-subject = A sua palavra-passe foi redefinida
passwordResetWithRecoveryKeyPrompt-title = A sua palavra-passe foi redefinida
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Redefiniu a palavra passe da sua { -product-mozilla-account } em:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Criar chave de recuperação da conta
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Criar chave de recuperação da conta:
passwordResetWithRecoveryKeyPrompt-cta-description = Terá de iniciar a sessão novamente em todos os seus dispositivos sincronizados. Mantenha os seus dados seguros da próxima vez com uma chave de recuperação da conta. Isto permite-lhe recuperar os seus dados caso se esqueça da sua palavra-passe.
postAddAccountRecovery-subject-3 = Nova chave de recuperação da conta criada
postAddAccountRecovery-title2 = Criou uma nova chave de recuperação da conta
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Guarde esta chave num local seguro – irá precisar da mesma para restaurar os seus dados de navegação encriptados, caso se esqueça da sua palavra-passe.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Esta chave só pode ser utilizada uma vez. Depois de a utilizar, nós criaremos automaticamente uma nova para si. Ou pode criar uma nova a qualquer momento nas suas definições da conta.
postAddAccountRecovery-action = Gerir conta
postAddLinkedAccount-subject-2 = Nova conta associada à sua { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = A sua conta { $providerName } foi associada à sua { -product-mozilla-account }
postAddLinkedAccount-action = Gerir conta
postAddPasskey-subject = Chave criada
postAddPasskey-preview = Agora pode utilizar o seu dispositivo para iniciar sessão
postAddPasskey-title = Criou uma chave de acesso
postAddPasskey-description = Agora pode utilizá-lo para iniciar sessão em todos os seus { -product-mozilla-account } serviços.
postAddPasskey-sync-note = Por favor, note que a sua palavra-passe irá continuar a ser necessária para aceder aos seus { -brand-firefox } dados de sincronização.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Saber mais
postAddPasskey-requested-from = Pediu isto de:
postAddPasskey-action = Gerir conta
postAddRecoveryPhone-subject = Telefone de recuperação adicionado
postAddRecoveryPhone-preview = Conta protegida por autenticação de dois passos
postAddRecoveryPhone-title-v2 = Adicionou um número de telefone de recuperação
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Você adicionou { $maskedLastFourPhoneNumber } como o seu número de telefone de recuperação
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Como isto protege a sua conta
postAddRecoveryPhone-how-protect-plaintext = Como isto protege a sua conta:
postAddRecoveryPhone-enabled-device = Foi ativado de:
postAddRecoveryPhone-action = Gerir conta
postAddTwoStepAuthentication-preview = A sua conta está protegida
postAddTwoStepAuthentication-subject-v3 = A autenticação de dois passos está ativada
postAddTwoStepAuthentication-title-2 = Ativou a autenticação de dois fatores
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Pediu isto de:
postAddTwoStepAuthentication-action = Gerir conta
postAddTwoStepAuthentication-code-required-v4 = Os códigos de segurança da sua aplicação de autenticação são agora obrigatórios em cada início de sessão.
postAddTwoStepAuthentication-recovery-method-codes = Também adicionou códigos de autenticação de recuperação como o seu método de recuperação.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Você também adicionou { $maskedPhoneNumber } como o seu número de telefone de recuperação
postAddTwoStepAuthentication-how-protects-link = Como isto protege a sua conta
postAddTwoStepAuthentication-how-protects-plaintext = Como isto protege a sua conta:
postAddTwoStepAuthentication-device-sign-out-message = Para proteger todos os seus dispositivos associados, deve terminar sessão em todos os lugares em que estiver a utilizar esta conta e depois iniciar sessão novamente utilizando a autenticação de dois passos.
postChangeAccountRecovery-subject = Chave de recuperação da conta alterada
postChangeAccountRecovery-title = Alterou a sua chave de recuperação da conta
postChangeAccountRecovery-body-part1 = Agora tem uma nova chave de recuperação da conta. A sua chave anterior foi eliminada.
postChangeAccountRecovery-body-part2 = Guarde esta nova chave num local seguro – se esquecer a sua palavra-passe irá precisar da mesma para restaurar os seus dados de navegação encriptados.
postChangeAccountRecovery-action = Gerir conta
postChangePrimary-subject = E-mail principal atualizado
postChangePrimary-title = Novo email primário
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Alterou com sucesso o seu e-mail principal para { $email }. Este endereço é agora o seu nome de utilizador para iniciar a sessão na sua { -product-mozilla-account }, assim como para receber notificações de segurança e confirmações de autenticação.
postChangePrimary-action = Gerir conta
postChangeRecoveryPhone-subject = Telefone de recuperação atualizado
postChangeRecoveryPhone-preview = Conta protegida por autenticação de dois passos
postChangeRecoveryPhone-title = Você alterou o seu telefone de recuperação
postChangeRecoveryPhone-description = Tem agora um novo telefone de recuperação. O seu número de telefone anterior foi eliminado.
postChangeRecoveryPhone-requested-device = Solicitado de:
postChangeTwoStepAuthentication-preview = A sua conta está protegida
postChangeTwoStepAuthentication-subject = Autenticação de dois passos atualizada
postChangeTwoStepAuthentication-title = A autenticação de dois passos foi atualizada
postChangeTwoStepAuthentication-use-new-account = Agora precisa de utilizar a nova entrada { -product-mozilla-account } na sua aplicação de autenticação. O mais antigo deixará de funcionar e pode removê-lo.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Pediu isto de:
postChangeTwoStepAuthentication-action = Gerir conta
postChangeTwoStepAuthentication-how-protects-link = Como isto protege a sua conta
postChangeTwoStepAuthentication-how-protects-plaintext = Como isto protege a sua conta:
postChangeTwoStepAuthentication-device-sign-out-message = Para proteger todos os seus dispositivos associados, deve terminar sessão em todos os lugares em que está a utilizar esta conta e depois iniciar sessão novamente utilizando a sua nova autenticação de dois passos.
postConsumeRecoveryCode-title-3 = O seu código de autenticação de recuperação foi utilizado para confirmar uma redefinição da palavra-passe
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Código utilizado de:
postConsumeRecoveryCode-action = Gerir conta
postConsumeRecoveryCode-subject-v3 = Código de autenticação de recuperação utilizado
postConsumeRecoveryCode-preview = Confirmar para ter a certeza que foi você
postNewRecoveryCodes-subject-2 = Novos códigos de autenticação de recuperação criados
postNewRecoveryCodes-title-2 = Criou novos códigos de autenticação de recuperação
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Foram criados em:
postNewRecoveryCodes-action = Gerir conta
postRemoveAccountRecovery-subject-2 = Chave de recuperação da conta eliminada
postRemoveAccountRecovery-title-3 = Eliminou a sua chave de recuperação da conta
postRemoveAccountRecovery-body-part1 = Se esquecer a sua palavra-passe, é necessária a chave de recuperação da conta para restaurar os seus dados de navegação encriptados.
postRemoveAccountRecovery-body-part2 = Se ainda não o fez, crie uma nova chave de recuperação da conta nas suas definições da conta para evitar a perda das palavras-passe guardadas, marcadores, histórico de navegação e muito mais.
postRemoveAccountRecovery-action = Gerir conta
postRemovePasskey-subject = Chave eliminada
postRemovePasskey-preview = Foi removida uma chave da sua conta
postRemovePasskey-title = Você apagou a sua chave
postRemovePasskey-description = Terá de utilizar outro método para iniciar sessão.
postRemovePasskey-requested-from = Pediu isto de:
postRemovePasskey-action = Gerir conta
postRemoveRecoveryPhone-subject = Telefone de recuperação removido
postRemoveRecoveryPhone-preview = Conta protegida por autenticação de dois passos
postRemoveRecoveryPhone-title = Telefone de recuperação removido
postRemoveRecoveryPhone-description-v2 = O seu telefone de recuperação foi removido das suas definições de autenticação de dois passos.
postRemoveRecoveryPhone-description-extra = Pode ainda utilizar os seus códigos de autenticação de recuperação para iniciar sessão, se não conseguir utilizar a sua aplicação de autenticação.
postRemoveRecoveryPhone-requested-device = Solicitado de:
postRemoveSecondary-subject = Email secundário removido
postRemoveSecondary-title = Email secundário removido
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Removeu com sucesso { $secondaryEmail } como um e-mail secundário da sua { -product-mozilla-account }. As notificações de segurança e as confirmações de início de sessão já não serão enviadas para este endereço.
postRemoveSecondary-action = Gerir conta
postRemoveTwoStepAuthentication-subject-line-2 = Autenticação de dois fatores está desativada
postRemoveTwoStepAuthentication-title-2 = Desativou a autenticação de dois fatores
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Desativou-a de:
postRemoveTwoStepAuthentication-action = Gerir conta
postRemoveTwoStepAuthentication-not-required-2 = Já não precisa de códigos de segurança da sua aplicação de autenticação quando inicia a sessão.
postSigninRecoveryCode-subject = Código de autenticação de recuperação utilizado para iniciar sessão
postSigninRecoveryCode-preview = Confirmar atividade da conta
postSigninRecoveryCode-title = O seu código de autenticação de recuperação foi utilizado para iniciar sessão
postSigninRecoveryCode-description = Se não fez isto, deve alterar a sua palavra-passe imediatamente para manter a sua conta segura.
postSigninRecoveryCode-device = Iniciou a sessão de:
postSigninRecoveryCode-action = Gerir conta
postSigninRecoveryPhone-subject = Telefone de recuperação utilizado para iniciar sessão
postSigninRecoveryPhone-preview = Confirmar atividade da conta
postSigninRecoveryPhone-title = O seu telefone de recuperação foi utilizado para iniciar a sessão
postSigninRecoveryPhone-description = Se não fez isto, deve alterar a sua palavra-passe imediatamente para manter a sua conta segura.
postSigninRecoveryPhone-device = Iniciou a sessão de:
postSigninRecoveryPhone-action = Gerir conta
postVerify-sub-title-3 = Nós estamos felizes por vê-lo!
postVerify-title-2 = Quer ver o mesmo separador em dois dispositivos?
postVerify-description-2 = É fácil! Basta instalar o { -brand-firefox } noutro dispositivo e iniciar a sessão para sincronizar. É como se fosse magia!
postVerify-sub-description = (Psst… Isto também significa que pode obter os seus marcadores, palavras-passe e outros dados do { -brand-firefox } em todos os sítios em que estiver autenticado.)
postVerify-subject-4 = Bem-vindo(a) à { -brand-mozilla }!
postVerify-setup-2 = Ligue outro dispositivo:
postVerify-action-2 = Ligar outro dispositivo
postVerifySecondary-subject = Email secundário adicionado
postVerifySecondary-title = Email secundário adicionado
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Confirmou { $secondaryEmail } com sucesso, como um endereço de correio eletrónico secundário para a sua { -product-mozilla-account }. As notificações de segurança e as confirmações de início de sessão serão agora entregues em ambos os endereços de correio eletrónico.
postVerifySecondary-action = Gerir conta
recovery-subject = Repor a sua palavra-passe
recovery-title-2 = Esqueceu-se da sua palavra-passe?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Nós recebemos um pedido de alteração da palavra-passe na sua { -product-mozilla-account } de:
recovery-new-password-button = Crie uma nova palavra-passe clicando no botão abaixo. Esta ligação irá expirar daqui a uma hora.
recovery-copy-paste = Crie uma nova palavra-passe copiando e colando o endereço abaixo no seu navegador. Esta ligação irá expirar daqui a uma hora.
recovery-action = Criar nova palavra-passe
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Utilizar { $unblockCode } para iniciar sessão
unblockCode-preview = Este código expira numa hora
unblockCode-title = É mesmo você a iniciar sessão?
unblockCode-prompt = Se sim, aqui está o código de autorização de que necessita:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Se sim, aqui está o código de autorização que precisa: { $unblockCode }
unblockCode-report = Se não, ajude-nos a afastar os intrusos e <a data-l10n-name="reportSignInLink">reporte a situação à nossa equipa</a>.
unblockCode-report-plaintext = Se não, ajude-nos a afastar os intrusos e reporte a situação à nossa equipa.
verificationReminderFinal-subject = Lembrete final para configurar a sua conta
verificationReminderFinal-description-2 = Há algumas semanas, criou uma { -product-mozilla-account }, mas nunca a confirmou. Para sua segurança, nós iremos eliminar a conta se não for verificada nas próximas 24 horas.
confirm-account = Confirmar conta
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Lembre-se de confirmar a sua conta
verificationReminderFirst-title-3 = Bem-vindo(a) à { -brand-mozilla }!
verificationReminderFirst-description-3 = Há alguns dias, criou uma { -product-mozilla-account }, mas nunca a confirmou. Por favor, confirme a sua conta nos próximos 15 dias ou esta será eliminada automaticamente.
verificationReminderFirst-sub-description-3 = Não perca o navegador que o coloca a si e a sua privacidade, em primeiro lugar.
confirm-email-2 = Confirmar conta
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmar conta
verificationReminderSecond-subject-2 = Lembre-se de confirmar a sua conta
verificationReminderSecond-title-3 = Não perca nada da { -brand-mozilla }!
verificationReminderSecond-description-4 = Há alguns dias, criou uma { -product-mozilla-account }, mas nunca a confirmou. Por favor, confirme a sua conta nos próximos 10 dias ou esta será eliminada automaticamente.
verificationReminderSecond-second-description-3 = A sua { -product-mozilla-account } deixa-o sincronizar o seu { -brand-firefox } entre os dispositivos e desbloqueia o acesso a mais produtos de proteção de privacidade da { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Faça parte da nossa missão para transformar a Internet num lugar aberto para todos.
verificationReminderSecond-action-2 = Confirmar conta
verify-title-3 = Aceda à Internet com a { -brand-mozilla }
verify-description-2 = Confirme a sua conta e aproveite ao máximo o { -brand-mozilla } em todos os sítios em que iniciar a sessão, começando por:
verify-subject = Conclua a criação da sua conta
verify-action-2 = Confirmar conta
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Utilizar { $code } para alterar a sua conta
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Este código expira em { $expirationTime } minuto.
       *[other] Este código expira em { $expirationTime } minutos.
    }
verifyAccountChange-title = Vai alterar as informações da sua conta?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Ajude-nos a manter a sua conta segura aprovando esta alteração em:
verifyAccountChange-prompt = Se sim, aqui está o seu código de autorização:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Este expira em { $expirationTime } minuto.
       *[other] Este expira em { $expirationTime } minutos.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Iniciou a sessão com o(a) { $clientName }?
verifyLogin-description-2 = Ajude-nos a manter a sua conta segura confirmando que iniciou a sessão em:
verifyLogin-subject-2 = Confirmar início de sessão
verifyLogin-action = Confirmar novo início de sessão
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Utilizar { $code } para iniciar sessão
verifyLoginCode-preview = Este código expira em 5 minutos.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Iniciou a sessão com { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ajude-nos a manter a sua conta segura aprovando o seu início de sessão em:
verifyLoginCode-prompt-3 = Se sim, aqui está o seu código de autorização:
verifyLoginCode-expiry-notice = Este expira em 5 minutos.
verifyPrimary-title-2 = Confirmar e-mail principal
verifyPrimary-description = Foi realizado um pedido para executar uma alteração de conta a partir do seguinte dispositivo:
verifyPrimary-subject = Confirmar e-mail principal
verifyPrimary-action-2 = Confirmar email
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Depois de confirmado, alterações à conta, como adicionar um endereço de correio eletrónico secundário, irão ficar disponíveis a partir deste dispositivo.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Utilizar { $code } para confirmar o seu e-mail secundário
verifySecondaryCode-preview = Este código expira em 5 minutos.
verifySecondaryCode-title-2 = Confirmar e-mail secundário
verifySecondaryCode-action-2 = Confirmar e-mail
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Foi efetuado um pedido para utilizar { $email } como endereço de e-mail secundário a partir da seguinte { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Utilizar este código de confirmação:
verifySecondaryCode-expiry-notice-2 = Este expira em 5 minutos. Depois de confirmado, este endereço irá começar a receber notificações e confirmações de segurança.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Utilizar { $code } para confirmar a sua conta
verifyShortCode-preview-2 = Este código expira em 5 minutos
verifyShortCode-title-3 = Aceda à Internet com a { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirme a sua conta e aproveite ao máximo a { -brand-mozilla } em todos os sítios em que iniciar sessão, começando com:
verifyShortCode-prompt-3 = Utilizar este código de confirmação:
verifyShortCode-expiry-notice = Este expira em 5 minutos.
