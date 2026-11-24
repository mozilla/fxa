## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronitza dispositius">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositius">
fxa-privacy-url = Política de privadesa de { -brand-mozilla }
moz-accounts-privacy-url-2 = Avís de privadesa dels { -product-mozilla-accounts(capitalization: "lowercase") }
moz-accounts-terms-url = Condicions del servei dels { -product-mozilla-accounts(capitalization: "lowercase") }
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Baixeu el { $productName } del { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Baixeu el { $productName } de l\'{ -app-store }">
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Per a més informació, visiteu l’<a data-l10n-name="supportLink">Assistència de { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Aquest és un correu automàtic. Si l’heu rebut per error, no cal que feu fer res.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Aquest és un correu automàtic; si no heu autoritzat aquesta acció, canvieu la contrasenya:
automated-email-reset =
    Aquest és un missatge automàtic. Si no heu autoritzat aquesta acció, <a data-l10n-name="resetLink">reinicieu la contrasenya</a>.
    Per a més informació, vegeu l'<a data-l10n-name="supportLink">assistència de { -brand-mozilla }</a>.
change-password-plaintext = Si sospiteu que algú està provant d’accedir al vostre compte, canvieu la contrasenya.
manage-account = Gestiona el compte
manage-account-plaintext = { manage-account }:
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (estimated)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (estimated)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (estimated)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (estimated)
cadReminderFirst-action = Sincronitza un altre dispositiu
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
cadReminderSecond-action = Sincronitza un altre dispositiu
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Inici de sessió nou al { $clientName }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = No recordeu haver-ho fet? Canvieu la contrasenya:
newDeviceLogin-action = Gestiona el compte
passwordChangeRequired-title-2 = Reinicia la contrasenya
passwordChangeRequired-action = Reinicia la contrasenya
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = S'ha actualitzat la contrasenya
passwordChanged-title = La contrasenya s’ha canviat correctament
password-forgot-otp-title = Heu oblidat la contrasenya?
passwordReset-subject-2 = S'ha reiniciat la vostra contrasenya
passwordReset-title-2 = S'ha reiniciat la vostra contrasenya
passwordResetAccountRecovery-subject-2 = S'ha reiniciat la vostra contrasenya
passwordResetAccountRecovery-title-3 = S'ha reiniciat la vostra contrasenya
passwordResetAccountRecovery-action-4 = Gestiona el compte
passwordResetRecoveryPhone-action = Gestiona el compte
passwordResetWithRecoveryKeyPrompt-subject = S'ha reiniciat la vostra contrasenya
passwordResetWithRecoveryKeyPrompt-title = S'ha reiniciat la vostra contrasenya
postAddAccountRecovery-action = Gestiona el compte
postAddLinkedAccount-action = Gestiona el compte
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Més informació
postAddPasskey-action = Gestiona el compte
postAddRecoveryPhone-action = Gestiona el compte
postAddTwoStepAuthentication-action = Gestiona el compte
postChangeAccountRecovery-action = Gestiona el compte
postChangePrimary-title = Adreça electrònica principal nova
postChangePrimary-action = Gestiona el compte
postChangeTwoStepAuthentication-action = Gestiona el compte
postConsumeRecoveryCode-action = Gestiona el compte
postNewRecoveryCodes-action = Gestiona el compte
postRemoveAccountRecovery-action = Gestiona el compte
postRemovePasskey-action = Gestiona el compte
postRemoveSecondary-subject = S’ha eliminat l‘adreça electrònica secundària
postRemoveSecondary-title = S’ha eliminat l‘adreça electrònica secundària
postRemoveSecondary-action = Gestiona el compte
postRemoveTwoStepAuthentication-action = Gestiona el compte
postSigninRecoveryCode-action = Gestiona el compte
postSigninRecoveryPhone-action = Gestiona el compte
postVerify-action-2 = Connecteu un altre dispositiu
postVerifySecondary-subject = S’ha afegit l‘adreça electrònica secundària
postVerifySecondary-title = S’ha afegit l‘adreça electrònica secundària
postVerifySecondary-action = Gestiona el compte
recovery-subject = Reinicia la contrasenya
recovery-title-2 = Heu oblidat la contrasenya?
recovery-action = Crea una nova contrasenya
unblockCode-title = Esteu iniciant la sessió?
unblockCode-prompt = Si és així, aquest és el codi d’autorització que necessiteu:
unblockCode-report-plaintext = Si no és així, ajudeu-nos a rebutjar intrusos i envieu un informe.
confirm-account-plaintext = { confirm-account }:
confirm-email-plaintext-2 = { confirm-email-2 }:
verifyLogin-action = Confirmeu l’inici de la sessió
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ajudeu-nos a protegir el vostre compte aprovant l'inici de sessió a:
verifyLoginCode-expiry-notice = Caduca d’aquí a 5 minuts.
verifyPrimary-description = S’ha sol·licitat un canvi de compte des del següent dispositiu:
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyShortCode-expiry-notice = Caduca d’aquí a 5 minuts.
