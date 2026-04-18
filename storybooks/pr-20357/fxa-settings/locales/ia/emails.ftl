## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Synchronisar apparatos">
body-devices-image = <img data-l10n-name="devices-image" alt="Apparatos">
fxa-privacy-url = Politica de confidentialitate de { -brand-mozilla }
moz-accounts-privacy-url-2 = Aviso re le confidentialitate de { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Conditiones de uso del servicio de { -product-mozilla-accounts(capitalization: "lowercase") }
account-deletion-info-block-communications = Si tu conto es delite, ancora tu recipera emails de Mozilla Corporation e Mozilla Foundation, si tu non <a data-l10n-name="unsubscribeLink">demanda de remover le inscription</a>.
account-deletion-info-block-support = Si tu ha questiones o besonia de assistentia, contacta nostre <a data-l10n-name="supportLink">equipa de assistentia</a>.
account-deletion-info-block-communications-plaintext = Si tu conto es delite, ancora tu recipera emails de Mozilla Corporation e Mozilla Foundation, si tu non demanda de remover le inscription:
account-deletion-info-block-support-plaintext = Si tu ha alcun question o tu besonia assistentia, senti te libere de contactar nostre equipa de assistentia:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Discarga { $productName } de { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Discarga { $productName } de { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installa { $productName } sur <a data-l10n-name="anotherDeviceLink">un altere apparato scriptorio</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installa { $productName } sur <a data-l10n-name="anotherDeviceLink">un altere apparato</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Obtene { $productName } sur Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Discarga { $productName } sur le App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installa { $productName } sur un altere apparato:
automated-email-change-2 = Si non es tu qui prendeva iste action, <a data-l10n-name="passwordChangeLink">cambia tu contrasigno</a> immediatemente.
automated-email-support = Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Si non es tu qui prendeva iste action, cambia tu contrasigno immediatemente:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Pro plus informationes, visita le sito de supporto de { -brand-mozilla }:
automated-email-inactive-account = Isto es un email automatisate. Tu recipe illo perque tu ha un { -product-mozilla-account } e il ha passate 2 annos desde tu ultime authentication.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
automated-email-no-action-plaintext = Isto es un email automatisate. Si tu ha recipite illo per error, tu non besonia de facer alco.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Isto es un e-mail automatisate; si tu non autorisa iste action, alora cambia tu contrasigno:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Iste requesta veni ab  { $uaBrowser } sur { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Iste requesta veni ab  { $uaBrowser } sur { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Iste requesta veni ab { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Iste requesta veni ab { $uaOS }{ $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Iste requesta veni ab { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Si isto non era tu, <a data-l10n-name="revokeAccountRecoveryLink">dele le nove clave</a> e <a data-l10n-name="passwordChangeLink">cambia tu contrasigno</a>.
automatedEmailRecoveryKey-change-pwd-only = Si isto non era tu, <a data-l10n-name="passwordChangeLink">cambia tu contrasigno</a>.
automatedEmailRecoveryKey-more-info = Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Iste requeste veni ab:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Si isto non era tue, dele le nove clave:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Si isto non era tue, cambia tu contrasigno:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = e cambia tu contrasigno:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Pro altere informationes, visita le sito de supporto de { -brand-mozilla }:
automated-email-reset =
    Isto es un e-mail automatisate; si tu non autorisava iste action, alora <a data-l10n-name="resetLink">per favor reinitialisa tu contrasigno</a>.
    Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Assistentia</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Si tu non autorisa iste action, per favor reinitialisa tu contrasigno ora a { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Si tu non faceva iste action, alora <a data-l10n-name="resetLink">reinitialisa tu contrasigno</a> e <a data-l10n-name="twoFactorSettingsLink">reinitialisa tu authentication a duo passos</a> immediatemente.
    Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } supporto</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Si tu non faceva iste action, alora reinitialisa tu contrasigno immediatemente in:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Alsi, reinitialisa tu authentication a duo passos in:
brand-banner-message = Sape tu que nos cambiava nostre nomine ab { -product-firefox-accounts } a { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Saper plus</a>
change-password-plaintext = Si tu suspecta que alcuno tenta ganiar accesso a tu conto, cambia tu contrasigno.
manage-account = Gerer le conto
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Pro altere informationes, visita <a data-l10n-name="supportLink">{ -brand-mozilla } Supporto</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Pro altere informationes, visita { -brand-mozilla } Supporto: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } sur { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } sur { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimate)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimate)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimate)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimate)
cadReminderFirst-subject-1 = Memento! Synchronisar { -brand-firefox }
cadReminderFirst-action = Synchronisar un altere apparato
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Il es necessari duos pro synchronisar
cadReminderFirst-description-v2 = Apporta tu schedas sur tote tu apparatos. Obtene marcapaginas, contrasignos e altere datos ubique tu usa { -brand-firefox }.
cadReminderSecond-subject-2 = Non perde lo! Que nos fini le installation de tu synchronisation
cadReminderSecond-action = Synchronisar un altere apparato
cadReminderSecond-title-2 = Non oblidar de synchronisar!
cadReminderSecond-description-sync = Synchronisa tu marcapaginas, contrasignos, schedas aperte e altero ancora, ubique tu usa { -brand-firefox }.
cadReminderSecond-description-plus = In ultra, tu datos es sempre cryptate. Solo tu e le apparatos que tu approba pote vider
inactiveAccountFinalWarning-subject = Ultime chance pro mantener tu { -product-mozilla-account }
inactiveAccountFinalWarning-title = Tu conto e datos de { -brand-mozilla } sera delite.
inactiveAccountFinalWarning-preview = Accede pro mantener tu conto
inactiveAccountFinalWarning-account-description = Tu { -product-mozilla-account } es usate pro acceder productos gratuite pro confidentialitate e navigation como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Le <strong>{ $deletionDate }</strong>, tu conto e tu datos personal sera permanentemente delite si tu non accede.
inactiveAccountFinalWarning-action = Accede pro mantener tu conto
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Accede pro mantener tu conto:
inactiveAccountFirstWarning-subject = Non perde tu conto
inactiveAccountFirstWarning-title = Vole tu mantener tu conto { -brand-mozilla } e tu datos?
inactiveAccountFirstWarning-account-description-v2 = Tu { -product-mozilla-account } es usate pro acceder productos gratuite pro confidentialitate e navigation como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, e { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Nos constatava que tu non ha habeva accedite pro 2 annos.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Tu conto e tu datos personal sera permanentemente delite le <strong>{ $deletionDate }</strong> perque tu non ha essite active.
inactiveAccountFirstWarning-action = Accede pro mantener tu conto
inactiveAccountFirstWarning-preview = Accede pro mantener tu conto
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Accede pro mantener tu conto:
inactiveAccountSecondWarning-subject = Action necessari: deletion del conto in 7 dies
inactiveAccountSecondWarning-title = Tu conto e datos de { -brand-mozilla } sera delite in 7 dies.
inactiveAccountSecondWarning-account-description-v2 = Tu { -product-mozilla-account } es usate pro acceder productos gratuite pro confidentialitate e navigation como { -brand-firefox } sync, { -product-mozilla-monitor }, { -product-firefox-relay }, e { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Tu conto e tu datos personal sera permanentemente delite le <strong>{ $deletionDate }</strong> perque tu non ha essite active.
inactiveAccountSecondWarning-action = Accede pro mantener tu conto
inactiveAccountSecondWarning-preview = Accede pro mantener tu conto
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Accede pro mantener tu conto:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Tu ha terminate le codices de authentication de reserva!
codes-reminder-title-one = Tu es a tu ultime codice de authentication de reserva
codes-reminder-title-two = Tempore pro crear altere codices de authentication de reserva
codes-reminder-description-part-one = Le codices de authentication de reserva te adjuta a restaurar tu informationes quando tu oblida tu contrasigno.
codes-reminder-description-part-two = Crea nove codices ora, assi tu non perde tu datos plus tarde.
codes-reminder-description-two-left = Tu ha solo duo codices restate.
codes-reminder-description-create-codes = Crea nove codices de authentication de reserva pro adjutar te a re-acceder in tu conto si tu ha perdite le accesso.
lowRecoveryCodes-action-2 = Crear codices
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nulle codices de authentication de reserva restate
        [one] Solo 1 codice de authentication de reserva restate
       *[other] Solo { $numberRemaining } codices de authentication de reserva restate!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Nove accesso a { $clientName }
newDeviceLogin-subjectForMozillaAccount = Nove accesso a tu { -product-mozilla-account }
newDeviceLogin-title-3 = Tu { -product-mozilla-account } era usate pro acceder
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Non tu? <a data-l10n-name="passwordChangeLink">Cambia tu contrasigno</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Non tu? Cambia tu contrasigno:
newDeviceLogin-action = Gerer le conto
passwordChangeRequired-subject = Activitate suspecte detegite
passwordChangeRequired-preview = Cambia tu contrasigno immediatemente
passwordChangeRequired-title-2 = Reinitialisa tu contrasigno
passwordChangeRequired-suspicious-activity-3 = Nos blocava tu conto pro mantener lo secur de activitate suspecte. Tu ha essite disconnectite de tote tu apparatos e qualcunque dato synchronisate ha essite delite como precaution.
passwordChangeRequired-sign-in-3 = Pro re-acceder a tu conto, tote lo que tu debe facer es reinitialisar tu contrasigno.
passwordChangeRequired-different-password-2 = <b>Importante:</b> Elige un contrasigno complexe que es differente de un que tu ha usate in le passato.
passwordChangeRequired-different-password-plaintext-2 = Importante: Elige un contrasigno complexe que es differente de un que tu ha usate in le passato.
passwordChangeRequired-action = Reinitialisar le contrasigno
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Contrasigno actualisate
passwordChanged-title = Contrasigno cambiate correctemente
passwordChanged-description-2 = Tu contrasigno de { -product-mozilla-account } ha essite cambiate con successo cambiate ab le sequente apparato:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Usa { $code } pro modificar tu contrasigno
password-forgot-otp-preview = Iste codice expira in 10 minutas
password-forgot-otp-title = Contrasigno oblidate?
password-forgot-otp-request = Nos recipeva un requesta pro un cambio de contrasigno sur tu { -product-mozilla-account } ab:
password-forgot-otp-code-2 = Si isto era tu, ecce tu codice de confirmation pro continuar:
password-forgot-otp-expiry-notice = Iste codice expira in 10 minutas.
passwordReset-subject-2 = Tu contrasigno ha essite remontate
passwordReset-title-2 = Tu contrasigno ha essite remontate
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Tu remontava tu contrasigno pro { -product-mozilla-account } sur:
passwordResetAccountRecovery-subject-2 = Tu contrasigno ha essite remontate
passwordResetAccountRecovery-title-3 = Tu contrasigno ha essite remontate
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Tu usava tu clave recuperation del conto pro remontar tu contrasigno pro { -product-mozilla-account } sur:
passwordResetAccountRecovery-information = Nos te disconnecteva de tote le tu apparatos synchronisate. Nos creava un nove clave recuperation del conto pro reimplaciar le sol que tu usava. Tu pote cambiar lo in parametros de tu conto.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Nos te disconnecteva de tote le tu apparatos synchronisate. Nos creava un nove clave recuperation del conto pro reimplaciar le sol que tu usava. Tu pote cambiar lo in parametros de tu conto:
passwordResetAccountRecovery-action-4 = Gerer le conto
passwordResetRecoveryPhone-subject = Telephono de recuperation usate
passwordResetRecoveryPhone-preview = Verifica que iste era tu
passwordResetRecoveryPhone-title = Tu telephono de recuperation era usate pro confirmar un reinitialisation de contrasigno
passwordResetRecoveryPhone-device = Telephono de recuperation usate per:
passwordResetRecoveryPhone-action = Gerer le conto
passwordResetWithRecoveryKeyPrompt-subject = Tu contrasigno ha essite remontate
passwordResetWithRecoveryKeyPrompt-title = Tu contrasigno ha essite remontate
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Tu remontava tu contrasigno pro { -product-mozilla-account } sur:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Crear clave de recuperation del conto
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Crear clave de recuperation del conto:
passwordResetWithRecoveryKeyPrompt-cta-description = Tu debera acceder de novo sur tote tu apparatos synchronisate. Mantene tu datos secur le proxime vice con un clave recuperation del conto. Isto te permitte de recuperar tu datos si tu oblida tu contrasigno.
postAddAccountRecovery-subject-3 = Nove clave de recuperation del conto create
postAddAccountRecovery-title2 = Tu ha create un nove clave de recuperation del conto
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Reserva iste clave in un loco secur, illo te besoniara pro restaurar tu datos de navigation cryptate si tu oblida tu contrasigno.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Iste es un clave a uso singule. Post que tu lo usara, nos automaticamente creara pro te un nove clave. O tu pote crear quandocunque uno nove per le parametros de tu conto.
postAddAccountRecovery-action = Gerer le conto
postAddLinkedAccount-subject-2 = Nove conto ligate a tu { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Tu conto { $providerName } ha essite ligate a tu { -product-mozilla-account }
postAddLinkedAccount-action = Gerer le conto
postAddPasskey-subject = Clave-contrasigno create
postAddPasskey-title = Tu creava un clave-contrasigno
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Pro saper plus
postAddPasskey-requested-from = Tu lo ha requirite ab:
postAddPasskey-action = Gerer le conto
postAddRecoveryPhone-subject = Telephono de recuperation addite
postAddRecoveryPhone-preview = Conto protegite per authentication a duo passos
postAddRecoveryPhone-title-v2 = Tu addeva un numero de telephono de recuperation
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Tu ha addite { $maskedLastFourPhoneNumber } como tu numero de telephono de recuperation
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Como isto protege tu conto
postAddRecoveryPhone-how-protect-plaintext = Como isto protege tu conto:
postAddRecoveryPhone-enabled-device = Tu lo activava ab:
postAddRecoveryPhone-action = Gerer le conto
postAddTwoStepAuthentication-preview = Tu conto es protecte
postAddTwoStepAuthentication-subject-v3 = Le authentication a duo passos es active
postAddTwoStepAuthentication-title-2 = Tu activava le authentication a duo passos
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Tu lo ha requirite ab:
postAddTwoStepAuthentication-action = Gerer le conto
postAddTwoStepAuthentication-code-required-v4 = Le codices de securitate ab tu application de authentication es ora requirite a cata apertura de session.
postAddTwoStepAuthentication-recovery-method-codes = Tu alsi addeva codices de authentication de reserva como tu methodo de recuperation.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Tu alsi addeva { $maskedPhoneNumber } como tu numero de telephono de recuperation.
postAddTwoStepAuthentication-how-protects-link = Como isto protege tu conto
postAddTwoStepAuthentication-how-protects-plaintext = Como isto protege tu conto:
postAddTwoStepAuthentication-device-sign-out-message = Pro proteger tote tu apparatos connexe, tu deberea disconnecter te ubique tu usa iste conto, e pois reconnecter te per authentication a duo passos.
postChangeAccountRecovery-subject = Clave de recuperation del conto cambiate
postChangeAccountRecovery-title = Tu cambiava tu clave de recuperation del conto
postChangeAccountRecovery-body-part1 = Tu ora ha un nove clave de recuperation del conto.Tu clave precedente era delite.
postChangeAccountRecovery-body-part2 = Reserva iste nove clave in un loco secur, illo te besoniara pro restaurar tu datos de navigation cryptate si tu oblida tu contrasigno.
postChangeAccountRecovery-action = Gerer le conto
postChangePrimary-subject = E-mail primari actualisate
postChangePrimary-title = Nove e-mail primari
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Tu ha correctemente cambiate tu adresse de e-mail primari a { $email }. Iste adresse es ora tu nomine de usator pro aperir session a tu { -product-mozilla-account }, e pro reciper notificationes de securitate e confirmationes de accesso.
postChangePrimary-action = Gerer le conto
postChangeRecoveryPhone-subject = Telephono de recuperation actualisate
postChangeRecoveryPhone-preview = Conto protegite per authentication a duo passos
postChangeRecoveryPhone-title = Tu cambiava tu telephono de recuperation
postChangeRecoveryPhone-description =
    Tu ora ha un nove numero de telephono de recuperation.
    Tu previe numero de telephono ha essite delite.
postChangeRecoveryPhone-requested-device = Tu ha requirite illo ab:
postChangeTwoStepAuthentication-preview = Tu conto es protegite
postChangeTwoStepAuthentication-subject = Authentication a duo passos actualisate
postChangeTwoStepAuthentication-title = Le authentication a duo passos ha essite actualisate
postChangeTwoStepAuthentication-use-new-account = Tu ora debe usar le nove entrata de { -product-mozilla-account } in tu application de authentication. Lo plus vetere non plus functionara e tu pote remover lo.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Tu lo ha requirite ab:
postChangeTwoStepAuthentication-action = Gerer le conto
postChangeTwoStepAuthentication-how-protects-link = Como isto protege tu conto
postChangeTwoStepAuthentication-how-protects-plaintext = Como isto protege tu conto:
postChangeTwoStepAuthentication-device-sign-out-message = Pro proteger tote tu apparatos connexe, tu deberea disconnecter te ubique tu usa iste conto, e pois reconnecter te per tu nove authentication a duo passos.
postConsumeRecoveryCode-title-3 = Tu codice de authentication de reserva era usate pro confirmar un redefinition de contrasigno
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Codice usate ab:
postConsumeRecoveryCode-action = Gerer le conto
postConsumeRecoveryCode-subject-v3 = Codice de authentication de salvamento usate
postConsumeRecoveryCode-preview = Verificar que iste era tu
postNewRecoveryCodes-subject-2 = Nove codice authentication de reserva create
postNewRecoveryCodes-title-2 = Tu ha create nove codices authentication de reserva
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Illos era create sur:
postNewRecoveryCodes-action = Gerer le conto
postRemoveAccountRecovery-subject-2 = Clave recuperation del conto delite
postRemoveAccountRecovery-title-3 = Tu ha delite tu clave recuperation del conto
postRemoveAccountRecovery-body-part1 = Tu clave de recuperation del conto es necessari pro restaurar tu datos de navigation cryptate si tu oblida tu contrasigno.
postRemoveAccountRecovery-body-part2 = Si tu jam non lo habeva, crea un nove clave de recuperation del conto in le parametro de tu conto, pro impedir de perder tu contrasignos, marcapaginas, chronologia de navigation, e altero ancora reservate.
postRemoveAccountRecovery-action = Gerer le conto
postRemoveRecoveryPhone-subject = Numero de telephono de recuperation removite
postRemoveRecoveryPhone-preview = Conto protegite per authentication a duo passos
postRemoveRecoveryPhone-title = Telephono de recuperation removite
postRemoveRecoveryPhone-description-v2 = Tu numero de telephono de recuperation ha essite removite ab le parametros de tu authentication a duo passos.
postRemoveRecoveryPhone-description-extra = Tu ancora pote usar tu codices de authentication de reserva pro aperir session si tu non pote usar tu app de authentication.
postRemoveRecoveryPhone-requested-device = Tu ha requirite illo ab:
postRemoveSecondary-subject = E-mail secundari removite
postRemoveSecondary-title = E-mail secundari removite
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Tu ha removite con successo { $secondaryEmail }, como email secundari, de tu { -product-mozilla-account }. Le notificationes de securitate e le confirmationes de authentication non sera plus livrate a iste adresse.
postRemoveSecondary-action = Gerer le conto
postRemoveTwoStepAuthentication-subject-line-2 = Le authentication a duo passos es disactivate
postRemoveTwoStepAuthentication-title-2 = Tu disactivava le authentication a duo passos
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Tu lo disactivava de:
postRemoveTwoStepAuthentication-action = Gerer le conto
postRemoveTwoStepAuthentication-not-required-2 = Tu non plus besonia codices de securitate de tu app de authentication quando aperi session
postSigninRecoveryCode-subject = Codice de authentication de salvamento usate pro acceder
postSigninRecoveryCode-preview = Confirmar activitate del conto
postSigninRecoveryCode-title = Tu codice de authentication de salvamento era usate pro acceder
postSigninRecoveryCode-description = Si tu non lo face, tu debe cambiar tu contrasigno immediatemente pro mantener tu conto secur.
postSigninRecoveryCode-device = Tu accedeva ab:
postSigninRecoveryCode-action = Gerer conto
postSigninRecoveryPhone-subject = Numero de telephono de recuperation usate pro aperir session
postSigninRecoveryPhone-preview = Confirma le activitate del conto
postSigninRecoveryPhone-title = Tu numero de telephono de recuperation era usate pro aperir session
postSigninRecoveryPhone-description = Si tu non lo face, tu debe cambiar tu contrasigno immediatemente pro mantener tu conto secur.
postSigninRecoveryPhone-device = Tu accedeva ab:
postSigninRecoveryPhone-action = Gerer conto
postVerify-sub-title-3 = Nos es delectate de vider te!
postVerify-title-2 = Vole tu vider le mesme scheda sur duo apparatos?
postVerify-description-2 = Il es facile! Solo installa { -brand-firefox } sur un altere apparato e aperi session pro synchronisar. Illo es como magic!
postVerify-sub-description = (Psst… Illo alsi significa que tu pote installar tu marcapaginas, contrasignos, e altere datos de { -brand-firefox } ubique tu ha accedite.)
postVerify-subject-4 = Benvenite a { -brand-mozilla }!
postVerify-setup-2 = Connecter un altere apparato:
postVerify-action-2 = Connecter un altere apparato
postVerifySecondary-subject = Adresse de e-mail secundari addite
postVerifySecondary-title = Adresse de e-mail secundari addite
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Tu ha confirmate con successo { $secondaryEmail } como email secundari pro tu { -product-mozilla-account }. Notificationes de securitate e confirmationes de authentication ora essera livrate a ambe adresses email.
postVerifySecondary-action = Gerer le conto
recovery-subject = Reinitialisa tu contrasigno
recovery-title-2 = Contrasigno oblidate?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Nos recipeva un requesta pro un cambio de contrasigno sur tu { -product-mozilla-account } ab:
recovery-new-password-button = Crea un nove contrasigno cliccante le button infra. Iste ligamine expirara in le proxime hora.
recovery-copy-paste = Crea un nove contrasigno copiante e collante le URL infra in tu navigator. Iste ligamine expirara in le proxime hora.
recovery-action = Crear le nove contrasigno
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Usa { $unblockCode } pro aperir session
unblockCode-preview = Iste codice expira in un hora
unblockCode-title = Es tu qui aperi session?
unblockCode-prompt = In tal caso, ecce le codice de autorisation que tu require:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Si si, ecce le codice de autorisation que te besonia: { $unblockCode }
unblockCode-report = Si non, adjuta nos a parar le intrusos e <a data-l10n-name="reportSignInLink">reporta lo a nos</a>.
unblockCode-report-plaintext = Si non, adjuta nos a parar le intrusos e reporta lo a nos.
verificationReminderFinal-subject = Memento final pro confirmar tu conto
verificationReminderFinal-description-2 = Un par de septimanas retro tu ha create un { -product-mozilla-account }, ma jammais lo ha confirmate. Pro tu securitate, nos delera le conto si non verificate in le proxime 24 horas.
confirm-account = Confirmar conto
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Rememora pro confirmar tu conto
verificationReminderFirst-title-3 = Benvenite a { -brand-mozilla }!
verificationReminderFirst-description-3 = Alcun dies retro tu ha create un { -product-mozilla-account }, ma non lo ha jammais confirmate. Confirma tu conto in le proxime 15 dies o illo essera automaticamente delite.
verificationReminderFirst-sub-description-3 = Non perde te le navigator que primo antepone te e tu confidentialitate.
confirm-email-2 = Confirmar conto
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmar conto
verificationReminderSecond-subject-2 = Rememora de confirmar tu conto
verificationReminderSecond-title-3 = Non te lassa escappar { -brand-mozilla }!
verificationReminderSecond-description-4 = Alcun dies retro tu creava un { -product-mozilla-account }, ma non lo ha jammais confirmate. Confirma tu conto in le proxime 10 dies o illo essera automaticamente delite.
verificationReminderSecond-second-description-3 = Tu { -product-mozilla-account } te permitte de synchronisar tu experientia con { -brand-firefox } inter apparatos e disblocar le accesso a altere productos de protection del confidentialitate de { -brand-mozilla }.
verificationReminderSecond-sub-description-2 = Contribue a nostre mission pro transformar internet in un placia aperte pro totes.
verificationReminderSecond-action-2 = Confirmar conto
verify-title-3 = Aperi internet con { -brand-mozilla }
verify-description-2 = Confirma tu conto e tira le maximo de { -brand-mozilla } ubicunque tu aperi session, a comenciar per:
verify-subject = Termina le creation de tu conto
verify-action-2 = Confirmar conto
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Usa { $code } pro modificar tu conto
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Le codice expira in { $expirationTime } minuta.
       *[other] Le codice expira in { $expirationTime } minutas.
    }
verifyAccountChange-title = Es tu qui modifica le informationes de tu conto?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Adjuta nos a mantener tu conto secur approbante iste modification sur:
verifyAccountChange-prompt = Si affirmative, ecce tu codice de autorisation:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Illo expira in { $expirationTime } minuta.
       *[other] Illo expira in { $expirationTime } minutas.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Habeva tu accedite a { $clientName }?
verifyLogin-description-2 = Adjuta nos a mantener tu conto secur confirmante que tu accedeva a illo:
verifyLogin-subject-2 = Confirmar accesso
verifyLogin-action = Confirmar apertura de session
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Usa { $code } pro aperir session
verifyLoginCode-preview = Iste codice expira in 5 minutas.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Habeva tu accedite a { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Adjuta nos a mantener tu conto secur approbante tu accesso a illo:
verifyLoginCode-prompt-3 = Si si, ecce tu codice de autorisation:
verifyLoginCode-expiry-notice = Illo expira in 5 minutas.
verifyPrimary-title-2 = Confirmar email primari
verifyPrimary-description = Requesta de modificar le conto per le sequente apparato:
verifyPrimary-subject = Confirmar e-mail primari
verifyPrimary-action-2 = Confirmar email
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Post le confirmation sera possibile per le apparato le cambios del conto, como adder le email secundari.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Usa { $code } pro confirmar tu email secundari
verifySecondaryCode-preview = Iste codice expira in 5 minutas.
verifySecondaryCode-title-2 = Confirmar email secundari
verifySecondaryCode-action-2 = Confirmar email
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Un requesta de usar { $email } como adresse email secundari ha essite facite ab le sequente { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Usa iste codice de confirmation:
verifySecondaryCode-expiry-notice-2 = Illo expira in 5 minutas. Un vice confirmate, iste adresse comenciara a reciper notificationes e confirmationes de securitate.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Usa { $code } pro confirmar tu conto
verifyShortCode-preview-2 = Iste codice expira in 5 minutas
verifyShortCode-title-3 = Aperi internet con { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirma tu conto e tira le maximo de { -brand-mozilla } ubicunque tu aperi session, a comenciar per:
verifyShortCode-prompt-3 = Usa iste codice de confirmation:
verifyShortCode-expiry-notice = Illo expira in 5 minutas.
