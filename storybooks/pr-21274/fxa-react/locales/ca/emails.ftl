## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sincronitza dispositius">
body-devices-image = <img data-l10n-name="devices-image" alt="Dispositius">
fxa-privacy-url = Política de privadesa de { -brand-mozilla }
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
cadReminderFirst-action = Sincronitza un altre dispositiu
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Inici de sessió nou al { $clientName }
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = No recordeu haver-ho fet? Canvieu la contrasenya:
newDeviceLogin-action = Gestiona el compte
passwordChanged-subject = S'ha actualitzat la contrasenya
passwordChanged-title = La contrasenya s’ha canviat correctament
postAddAccountRecovery-action = Gestiona el compte
postAddTwoStepAuthentication-action = Gestiona el compte
postChangePrimary-title = Adreça electrònica principal nova
postChangePrimary-action = Gestiona el compte
postConsumeRecoveryCode-action = Gestiona el compte
postNewRecoveryCodes-action = Gestiona el compte
postRemoveAccountRecovery-action = Gestiona el compte
postRemoveSecondary-subject = S’ha eliminat l‘adreça electrònica secundària
postRemoveSecondary-title = S’ha eliminat l‘adreça electrònica secundària
postRemoveSecondary-action = Gestiona el compte
postRemoveTwoStepAuthentication-action = Gestiona el compte
postVerifySecondary-subject = S’ha afegit l‘adreça electrònica secundària
postVerifySecondary-title = S’ha afegit l‘adreça electrònica secundària
postVerifySecondary-action = Gestiona el compte
recovery-subject = Reinicia la contrasenya
recovery-action = Crea una nova contrasenya
unblockCode-title = Esteu iniciant la sessió?
unblockCode-prompt = Si és així, aquest és el codi d’autorització que necessiteu:
unblockCode-report-plaintext = Si no és així, ajudeu-nos a rebutjar intrusos i envieu un informe.
verifyLogin-action = Confirmeu l’inici de la sessió
verifyLoginCode-expiry-notice = Caduca d’aquí a 5 minuts.
verifyPrimary-description = S’ha sol·licitat un canvi de compte des del següent dispositiu:
verifyShortCode-expiry-notice = Caduca d’aquí a 5 minuts.
