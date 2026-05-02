## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla }-Logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Geräte synchronisieren">
body-devices-image = <img data-l10n-name="devices-image" alt="Geräte">
fxa-privacy-url = { -brand-mozilla }-Datenschutzerklärung
moz-accounts-privacy-url-2 = Datenschutzhinweis von { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Nutzungsbedingungen von { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Wenn Ihr Konto gelöscht wird, erhalten Sie weiterhin E-Mails von der Mozilla Corporation und der Mozilla Foundation, es sei denn, Sie <a data-l10n-name="unsubscribeLink">bitten um Löschung des Abonnements</a>.
account-deletion-info-block-support = Wenn Sie Fragen haben oder Hilfe benötigen, können Sie sich gerne an unser <a data-l10n-name="supportLink">Hilfe-Team</a> wenden.
account-deletion-info-block-communications-plaintext = Wenn Ihr Konto gelöscht wird, erhalten Sie weiterhin E-Mails von der Mozilla Corporation und der Mozilla Foundation, es sei denn, Sie bitten um Löschung des Abonnements.
account-deletion-info-block-support-plaintext = Wenn Sie Fragen haben oder Hilfe benötigen, können Sie sich gerne an unser Hilfe-Team wenden:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="{ $productName } bei { -google-play } herunterladen">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="{ $productName } im { -app-store } herunterladen">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Installieren Sie { $productName } auf <a data-l10n-name="anotherDeviceLink">einem anderen Desktop-Gerät</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Installieren Sie { $productName } auf <a data-l10n-name="anotherDeviceLink">einem anderen Gerät</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Holen Sie sich { $productName } bei Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Laden Sie { $productName } im App Store herunter:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Installieren Sie { $productName } auf einem anderen Gerät:
automated-email-change-2 = Wenn Sie diese Maßnahme nicht ausgelöst haben, <a data-l10n-name="passwordChangeLink">ändern Sie sofort Ihr Passwort</a>.
automated-email-support = Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Wenn Sie diese Maßnahme nicht ausgelöst haben, ändern Sie sofort Ihr Passwort:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Weitere Informationen erhalten Sie bei der { -brand-mozilla }-Hilfe:
automated-email-inactive-account = Diese E-Mail wurde automatisch verschickt. Sie erhalten sie, weil Sie ein { -product-mozilla-account } haben und seit Ihrer letzten Anmeldung zwei Jahre vergangen sind.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
automated-email-no-action-plaintext = Dies ist eine automatisierte E-Mail. Wenn Sie sie versehentlich erhalten haben, brauchen Sie nichts zu tun.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Dies ist eine automatisierte E-Mail; wenn Sie diese Aktion nicht autorisiert haben, ändern Sie bitte Ihr Passwort:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Diese Anfrage kam von { $uaBrowser } auf { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Diese Anfrage kam von { $uaBrowser } auf { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Diese Anfrage kam von { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Diese Anfrage kam von { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Diese Anfrage kam von { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Wenn Sie das nicht waren, <a data-l10n-name="revokeAccountRecoveryLink">löschen Sie den neuen Schlüssel</a> und <a data-l10n-name="passwordChangeLink">ändern Sie Ihr Passwort</a>.
automatedEmailRecoveryKey-change-pwd-only = Wenn Sie das nicht waren, <a data-l10n-name="passwordChangeLink">ändern Sie Ihr Passwort</a>.
automatedEmailRecoveryKey-more-info = Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Diese Anfrage kam von:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Wenn Sie das nicht waren, löschen Sie den neuen Schlüssel:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Wenn Sie das nicht waren, ändern Sie Ihr Passwort:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = und ändern Sie Ihr Passwort:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Weitere Informationen erhalten Sie bei der { -brand-mozilla }-Hilfe:
automated-email-reset =
    Dies ist eine automatisierte E-Mail; wenn Sie diese Aktion nicht autorisiert haben, <a data-l10n-name="resetLink">setzen Sie bitte Ihr Passwort zurück</a>.
    Weitere Informationen finden Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Wenn Sie diese Aktion nicht autorisiert haben, setzen Sie Ihr Passwort jetzt unter { $resetLink } zurück
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor = Wenn Sie diese Maßnahme nicht ausgelöst haben, <a data-l10n-name="resetLink">setzen Sie Ihr Passwort zurück</a> und <a data-l10n-name="twoFactorSettingsLink">setzen Sie die Zwei-Schritt-Authentifizierung zurück</a> richtig entfernt. Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Wenn Sie diese Maßnahme nicht ausgelöst haben, setzen Sie Ihr Passwort unter folgender Adresse sofort zurück:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Setzen Sie außerdem die Zwei-Schritt-Authentifizierung unter folgender Adresse zurück:
automated-email-sign-in = Diese E-Mail wurde automatisch verschickt; wenn Sie diese Aktion nicht autorisiert haben, <a data-l10n-name="securitySettingsLink">überprüfen Sie bitte die Sicherheitseinstellungen Ihres Kontos</a>. Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
automated-email-sign-in-plaintext = Wenn Sie diese Aktion nicht autorisiert haben, überprüfen Sie bitte die Sicherheitseinstellungen Ihres Kontos unter:
brand-banner-message = Wussten Sie, dass wir unseren Namen von { -product-firefox-accounts } in { -product-mozilla-accounts } geändert haben? <a data-l10n-name="learnMore">Weitere Informationen</a>
change-password-plaintext = Wenn Sie den Verdacht haben, dass jemand auf Ihr Konto zugreifen möchte, ändern Sie bitte Ihr Passwort.
manage-account = Benutzerkonto verwalten
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Weitere Informationen erhalten Sie bei der <a data-l10n-name="supportLink">{ -brand-mozilla }-Hilfe</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Weitere Informationen erhalten Sie bei der { -brand-mozilla }-Hilfe: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } auf { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } auf { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (geschätzt)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (geschätzt)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (geschätzt)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (geschätzt)
cadReminderFirst-subject-1 = Erinnerung! Synchronisieren Sie Ihren { -brand-firefox }
cadReminderFirst-action = Weiteres Gerät synchronisieren
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Zur Synchronisation gehören immer zwei
cadReminderFirst-description-v2 = Nutzen Sie Ihre Tabs auf allen Ihren Geräten. Holen Sie sich Ihre Lesezeichen, Passwörter und andere Daten überall dorthin, wo Sie { -brand-firefox } verwenden.
cadReminderSecond-subject-2 = Nicht vergessen! Schließen Sie Ihre Sync-Einrichtung ab.
cadReminderSecond-action = Weiteres Gerät synchronisieren
cadReminderSecond-title-2 = Synchronisierung nicht vergessen!
cadReminderSecond-description-sync = Synchronisieren Sie Ihre Lesezeichen, Passwörter, geöffneten Tabs und mehr – überall dort, wo Sie { -brand-firefox } verwenden.
cadReminderSecond-description-plus = Außerdem sind Ihre Daten immer verschlüsselt. Nur Sie selbst und von Ihnen freigegebene Geräte können darauf zugreifen.
inactiveAccountFinalWarning-subject = Letzte Chance, um Ihr { -product-mozilla-account } zu behalten
inactiveAccountFinalWarning-title = Ihr { -brand-mozilla }-Konto und Ihre Daten werden gelöscht
inactiveAccountFinalWarning-preview = Melden Sie sich an, um Ihr Konto zu behalten
inactiveAccountFinalWarning-account-description = Ihr { -product-mozilla-account } wird für den Zugriff auf kostenlose Datenschutz- und Surf-Produkte wie { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } und { -product-mdn } verwendet.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = Am <strong>{ $deletionDate }</strong> werden Ihr Konto und Ihre persönlichen Daten dauerhaft gelöscht, es sei denn, Sie melden sich an.
inactiveAccountFinalWarning-action = Melden Sie sich an, um Ihr Konto zu behalten
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Melden Sie sich an, um Ihr Konto zu behalten:
inactiveAccountFirstWarning-subject = Verlieren Sie Ihr Konto nicht
inactiveAccountFirstWarning-title = Sollen Ihr { -brand-mozilla }-Konto und Ihre Daten erhalten bleiben?
inactiveAccountFirstWarning-account-description-v2 = Ihr { -product-mozilla-account } wird für den Zugriff auf kostenlose Datenschutz- und Surf-Produkte wie { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } und { -product-mdn } verwendet.
inactiveAccountFirstWarning-inactive-status = Wir haben festgestellt, dass Sie sich seit zwei Jahren nicht angemeldet haben.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Ihr Konto und Ihre persönlichen Daten werden am <strong>{ $deletionDate }</strong> dauerhaft gelöscht, da Sie nicht aktiv waren.
inactiveAccountFirstWarning-action = Melden Sie sich an, um Ihr Konto zu behalten
inactiveAccountFirstWarning-preview = Melden Sie sich an, um Ihr Konto zu behalten
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Melden Sie sich an, um Ihr Konto zu behalten:
inactiveAccountSecondWarning-subject = Handeln erforderlich: Kontolöschung in 7 Tagen
inactiveAccountSecondWarning-title = Ihr { -brand-mozilla }-Konto und Ihre Daten werden in 7 Tagen gelöscht
inactiveAccountSecondWarning-account-description-v2 = Ihr { -product-mozilla-account } wird für den Zugriff auf kostenlose Datenschutz- und Surf-Produkte wie { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } und { -product-mdn } verwendet.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Ihr Konto und Ihre persönlichen Daten werden am <strong>{ $deletionDate }</strong> dauerhaft gelöscht, da Sie nicht aktiv waren.
inactiveAccountSecondWarning-action = Melden Sie sich an, um Ihr Konto zu behalten
inactiveAccountSecondWarning-preview = Melden Sie sich an, um Ihr Konto zu behalten
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Melden Sie sich an, um Ihr Konto zu behalten:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Sie haben keine Sicherungs-Authentifizierungscodes mehr!
codes-reminder-title-one = Sie haben nur noch einen Sicherheits-Authentifizierungscode.
codes-reminder-title-two = Sie sollten weitere Sicherungs-Authentifizierungscodes erstellen.
codes-reminder-description-part-one = Sicherungs-Authentifizierungscodes helfen Ihnen, Ihre Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen.
codes-reminder-description-part-two = Erstellen Sie jetzt neue Codes, damit Sie Ihre Daten später nicht verlieren.
codes-reminder-description-two-left = Sie haben nur noch zwei Codes übrig.
codes-reminder-description-create-codes = Erstellen Sie neue Sicherungs-Authentifizierungscodes, damit Sie wieder auf Ihr Konto zugreifen können, wenn Sie ausgesperrt sind.
lowRecoveryCodes-action-2 = Codes erstellen
codes-create-plaintext = { lowRecoveryCodes-action-2 }
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Keine Sicherungs-Authentifizierungscode vorhanden
        [one] Nur noch ein Sicherungs-Authentifizierungscodes übrig
       *[other] Nur noch { $numberRemaining } Sicherungs-Authentifizierungcodes übrig!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Neue Anmeldung bei { $clientName }
newDeviceLogin-subjectForMozillaAccount = Neue Anmeldung bei Ihrem { -product-mozilla-account }
newDeviceLogin-title-3 = Ihr { -product-mozilla-account } wurde zur Anmeldung verwendet
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Das sind nicht Sie? <a data-l10n-name="passwordChangeLink">Ändern Sie Ihr Passwort</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Das sind nicht Sie? Ändern Sie Ihr Passwort:
newDeviceLogin-action = Benutzerkonto verwalten
passwordChangeRequired-subject = Verdächtige Aktivität festgestellt
passwordChangeRequired-preview = Ändern Sie sofort Ihr Passwort
passwordChangeRequired-title-2 = Setzen Sie Ihr Passwort zurück
passwordChangeRequired-suspicious-activity-3 = Wir haben Ihr Konto gesperrt, um es vor verdächtigen Aktivitäten zu schützen. Sie wurden von allen Ihren Geräten abgemeldet und alle synchronisierten Daten wurden vorsorglich gelöscht.
passwordChangeRequired-sign-in-3 = Um sich wieder bei Ihrem Konto anzumelden, müssen Sie nur Ihr Passwort zurücksetzen.
passwordChangeRequired-different-password-2 = <b>Wichtig:</b> Wählen Sie ein starkes Passwort, das sich von dem unterscheidet, das Sie in der Vergangenheit verwendet haben.
passwordChangeRequired-different-password-plaintext-2 = Wichtig: Wählen Sie ein starkes Passwort, das sich von dem unterscheidet, das Sie in der Vergangenheit verwendet haben.
passwordChangeRequired-action = Passwort zurücksetzen
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Passwort aktualisiert
passwordChanged-title = Passwort erfolgreich geändert
passwordChanged-description-2 = Das Passwort Ihres { -product-mozilla-account } wurde erfolgreich von folgendem Gerät geändert:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Verwenden Sie { $code }, um Ihr Passwort zu ändern
password-forgot-otp-preview = Dieser Code läuft in 10 Minuten ab
password-forgot-otp-title = Passwort vergessen?
password-forgot-otp-request = Wir haben eine Anfrage zur Passwortänderung für Ihr { -product-mozilla-account } erhalten von:
password-forgot-otp-code-2 = Wenn Sie das waren, ist hier Ihr Bestätigungscode, um fortzufahren:
password-forgot-otp-expiry-notice = Dieser Code läuft in 10 Minuten ab.
passwordReset-subject-2 = Ihr Passwort wurde zurückgesetzt.
passwordReset-title-2 = Ihr Passwort wurde zurückgesetzt.
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Sie haben Ihr { -product-mozilla-account }-Passwort zurückgesetzt am:
passwordResetAccountRecovery-subject-2 = Ihr Passwort wurde zurückgesetzt
passwordResetAccountRecovery-title-3 = Ihr Passwort wurde zurückgesetzt.
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Sie haben Ihren Kontowiederherstellungsschlüssel verwendet, um Ihr { -product-mozilla-account }-Passwort zurückzusetzen am:
passwordResetAccountRecovery-information = Wir haben Sie von allen synchronisierten Geräten abgemeldet. Wir haben einen neuen Kontowiederherstellungsschlüssel erstellt, um den von Ihnen verwendeten zu ersetzen. Sie können dies in Ihren Kontoeinstellungen ändern.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Wir haben Sie von allen synchronisierten Geräten abgemeldet. Wir haben einen neuen Kontowiederherstellungsschlüssel erstellt, um den von Ihnen verwendeten zu ersetzen. Dies können Sie in Ihren Kontoeinstellungen ändern:
passwordResetAccountRecovery-action-4 = Benutzerkonto verwalten
passwordResetRecoveryPhone-subject = Telefonnummer zur Wiederherstellung verwendet
passwordResetRecoveryPhone-preview = Überprüfen Sie, ob Sie das waren
passwordResetRecoveryPhone-title = Ihre Telefonnummer wurde verwendet, um das Zurücksetzen des Passworts zu bestätigen
passwordResetRecoveryPhone-device = Telefonnummer zur Wiederherstellung verwendet von:
passwordResetRecoveryPhone-action = Benutzerkonto verwalten
passwordResetWithRecoveryKeyPrompt-subject = Ihr Passwort wurde zurückgesetzt.
passwordResetWithRecoveryKeyPrompt-title = Ihr Passwort wurde zurückgesetzt.
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Sie haben Ihr { -product-mozilla-account }-Passwort zurückgesetzt am:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Kontowiederherstellungsschlüssel erstellen
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Kontowiederherstellungsschlüssel erstellen:
passwordResetWithRecoveryKeyPrompt-cta-description = Sie müssen sich auf allen Ihren synchronisierten Geräten erneut anmelden. Schützen Sie Ihre Daten beim nächsten Mal mit einem Kontowiederherstellungsschlüssel. Hiermit können Sie Ihre Daten wiederherstellen, wenn Sie Ihr Passwort vergessen.
postAddAccountRecovery-subject-3 = Neuer Kontowiederherstellungsschlüssel erstellt
postAddAccountRecovery-title2 = Sie haben einen neuen Kontowiederherstellungsschlüssel erstellt
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Speichern Sie diesen Schlüssel an einem sicheren Ort – Sie benötigen ihn, um Ihre verschlüsselten Browser-Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen haben.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Dieser Schlüssel kann nur einmal verwendet werden. Nachdem Sie ihn verwendet haben, erstellen wir automatisch einen neuen für Sie. Sie können auch jederzeit in Ihren Kontoeinstellungen einen neuen erstellen.
postAddAccountRecovery-action = Benutzerkonto verwalten
postAddLinkedAccount-subject-2 = Neues Konto mit Ihrem { -product-mozilla-account } verknüpft
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Ihr { $providerName }-Konto wurde mit Ihrem { -product-mozilla-account } verknüpft
postAddLinkedAccount-action = Benutzerkonto verwalten
postAddPasskey-subject = Zugangsschlüssel erstellt
postAddPasskey-preview = Sie können sich jetzt mit Ihrem Gerät anmelden
postAddPasskey-title = Sie haben einen Zugangsschlüssel erstellt
postAddPasskey-description = Sie können sich jetzt bei allen Ihren { -product-mozilla-account }-Diensten anmelden.
postAddPasskey-sync-note = Bitte beachten Sie, dass Ihr Passwort weiterhin für den Zugriff auf Ihre Sync-Daten { -brand-firefox } benötigt wird.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Weitere Informationen
postAddPasskey-requested-from = Sie haben dies angefordert von:
postAddPasskey-action = Benutzerkonto verwalten
postAddRecoveryPhone-subject = Telefonnummer zur Kontowiederherstellung hinzugefügt
postAddRecoveryPhone-preview = Konto durch Zwei-Schritt-Authentifizierung geschützt
postAddRecoveryPhone-title-v2 = Sie haben eine Telefonnummer zur Kontowiederherstellung hinzugefügt
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Sie haben { $maskedLastFourPhoneNumber } als Ihre Telefonnummer zur Kontowiederherstellung hinzugefügt
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Wie dies Ihr Konto schützt
postAddRecoveryPhone-how-protect-plaintext = Wie dies Ihr Konto schützt:
postAddRecoveryPhone-enabled-device = Sie haben sie aktiviert von:
postAddRecoveryPhone-action = Benutzerkonto verwalten
postAddTwoStepAuthentication-preview = Ihr Konto ist geschützt
postAddTwoStepAuthentication-subject-v3 = Zwei-Schritt-Authentifizierung ist aktiviert
postAddTwoStepAuthentication-title-2 = Sie haben die Zwei-Schritt-Authentifizierung aktiviert
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Sie haben dies angefordert von:
postAddTwoStepAuthentication-action = Benutzerkonto verwalten
postAddTwoStepAuthentication-code-required-v4 = Sicherheitscodes aus Ihrer Authentifizierungs-App sind jetzt bei jeder Anmeldung erforderlich.
postAddTwoStepAuthentication-recovery-method-codes = Sie haben auch Sicherungs-Authentifizierungscodes als Wiederherstellungsmethode hinzugefügt.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Sie haben auch { $maskedPhoneNumber } als Telefonnummer zur Kontowiederherstellung hinzugefügt.
postAddTwoStepAuthentication-how-protects-link = Wie dies Ihr Konto schützt
postAddTwoStepAuthentication-how-protects-plaintext = Wie dies Ihr Konto schützt:
postAddTwoStepAuthentication-device-sign-out-message = Um alle Ihre verbundenen Geräte zu schützen, sollten Sie sich überall abmelden, wo Sie dieses Konto verwenden, und sich mit der Zwei-Schritt-Authentifizierung wieder anmelden.
postChangeAccountRecovery-subject = Kontowiederherstellungsschlüssel geändert
postChangeAccountRecovery-title = Sie haben Ihren Kontowiederherstellungsschlüssel geändert
postChangeAccountRecovery-body-part1 = Sie haben jetzt einen neuen Kontowiederherstellungsschlüssel. Ihr vorheriger Schlüssel wurde gelöscht.
postChangeAccountRecovery-body-part2 = Speichern Sie diesen neuen Schlüssel an einem sicheren Ort – Sie benötigen ihn, um Ihre verschlüsselten Surf-Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen haben.
postChangeAccountRecovery-action = Benutzerkonto verwalten
postChangePrimary-subject = Primär-E-Mail-Adresse aktualisiert
postChangePrimary-title = Neue Primär-E-Mail-Adresse
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Sie haben Ihre Primär-E-Mail-Adresse zu { $email } geändert. Diese Adresse ist jetzt Ihr Benutzername für die Anmeldung bei Ihrem { -product-mozilla-account }, sowie zum Erhalt von Sicherheitsbenachrichtigungen und Anmeldebestätigungen.
postChangePrimary-action = Benutzerkonto verwalten
postChangeRecoveryPhone-subject = Telefonnummer für Kontowiederherstellung aktualisiert
postChangeRecoveryPhone-preview = Konto durch Zwei-Schritt-Authentifizierung geschützt
postChangeRecoveryPhone-title = Sie haben Ihre Telefonnummer zur Kontowiederherstellung geändert
postChangeRecoveryPhone-description = Sie haben jetzt eine neue Telefonnummer zur Kontowiederherstellung. Ihre vorherige Telefonnummer wurde gelöscht.
postChangeRecoveryPhone-requested-device = Sie haben sie angefordert von:
postChangeTwoStepAuthentication-preview = Ihr Konto ist geschützt
postChangeTwoStepAuthentication-subject = Zwei-Schritt-Authentifizierung aktualisiert
postChangeTwoStepAuthentication-title = Die Zwei-Schritt-Authentifizierung wurde aktualisiert.
postChangeTwoStepAuthentication-use-new-account = Sie müssen jetzt den neuen Eintrag { -product-mozilla-account } in Ihrer Authentifizierungs-App verwenden. Die ältere wird nicht mehr funktionieren und Sie können sie entfernen.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Sie haben dies angefordert von:
postChangeTwoStepAuthentication-action = Benutzerkonto verwalten
postChangeTwoStepAuthentication-how-protects-link = Wie dies Ihr Konto schützt
postChangeTwoStepAuthentication-how-protects-plaintext = Wie dies Ihr Konto schützt:
postChangeTwoStepAuthentication-device-sign-out-message = Um alle Ihre verbundenen Geräte zu schützen, sollten Sie sich überall abmelden, wo Sie dieses Konto verwenden, und sich mit Ihrer neuen Zwei-Schritt-Authentifizierung wieder anmelden.
postConsumeRecoveryCode-title-3 = Ihr Sicherungs-Authentifizierungscode wurde verwendet, um das Zurücksetzen des Passworts zu bestätigen
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Verwendeter Code von:
postConsumeRecoveryCode-action = Benutzerkonto verwalten
postConsumeRecoveryCode-subject-v3 = Sicherungs-Authentifizierungscode verwendet
postConsumeRecoveryCode-preview = Überprüfen Sie, ob Sie das waren
postNewRecoveryCodes-subject-2 = Neue Sicherungs-Authentifizierungscodes erzeugt
postNewRecoveryCodes-title-2 = Sie haben neue Sicherungs-Authentifizierungscode erzeugt
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Sie wurden erstellt auf:
postNewRecoveryCodes-action = Benutzerkonto verwalten
postRemoveAccountRecovery-subject-2 = Kontowiederherstellungsschlüssel gelöscht
postRemoveAccountRecovery-title-3 = Sie haben Ihren Kontowiederherstellungsschlüssel gelöscht
postRemoveAccountRecovery-body-part1 = Ihr Kontowiederherstellungsschlüssel wird benötigt, um Ihre verschlüsselten Browser-Daten wiederherzustellen, wenn Sie Ihr Passwort vergessen.
postRemoveAccountRecovery-body-part2 = Falls noch nicht geschehen, erstellen Sie in Ihren Kontoeinstellungen einen neuen Kontowiederherstellungsschlüssel, um zu verhindern, dass Ihre gespeicherten Passwörter, Lesezeichen, Chronik und mehr verloren gehen.
postRemoveAccountRecovery-action = Benutzerkonto verwalten
postRemovePasskey-subject = Zugangsschlüssel gelöscht
postRemovePasskey-preview = Ein Zugangsschlüssel wurde von Ihrem Konto entfernt
postRemovePasskey-title = Sie haben Ihren Zugangsschlüssel gelöscht
postRemovePasskey-description = Sie müssen eine andere Methode verwenden, um sich anzumelden.
postRemovePasskey-requested-from = Sie haben dies angefordert von:
postRemovePasskey-action = Benutzerkonto verwalten
postRemoveRecoveryPhone-subject = Telefonnummer für Kontowiederherstellung entfernt
postRemoveRecoveryPhone-preview = Konto durch Zwei-Schritt-Authentifizierung geschützt
postRemoveRecoveryPhone-title = Telefonnummer für Kontowiederherstellung entfernt
postRemoveRecoveryPhone-description-v2 = Ihre Telefonnummer zur Wiederherstellung wurde aus Ihren Einstellungen für die Zwei-Schritt-Authentifizierung entfernt.
postRemoveRecoveryPhone-description-extra = Sie können Ihre Sicherungs-Authentifizierungscodes weiterhin zur Anmeldung verwenden, wenn Sie nicht in der Lage sind, Ihre Authentifizierungs-App zu verwenden.
postRemoveRecoveryPhone-requested-device = Sie haben sie angefordert von:
postRemoveSecondary-subject = Zweit-E-Mail-Adresse entfernt
postRemoveSecondary-title = Zweit-E-Mail-Adresse entfernt
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Sie haben { $secondaryEmail } als Zweit-E-Mail-Adresse Ihres { -product-mozilla-account } entfernt. Sicherheitshinweise und Anmeldebestätigungen werden nicht mehr an diese Adresse zugestellt.
postRemoveSecondary-action = Benutzerkonto verwalten
postRemoveTwoStepAuthentication-subject-line-2 = Zwei-Schritt-Authentifizierung deaktiviert
postRemoveTwoStepAuthentication-title-2 = Sie haben die Zwei-Schritt-Authentifizierung deaktiviert
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Sie haben sie deaktiviert von:
postRemoveTwoStepAuthentication-action = Benutzerkonto verwalten
postRemoveTwoStepAuthentication-not-required-2 = Sie benötigen keine Sicherheitscodes mehr von Ihrer Authentifizierungs-App, wenn Sie sich anmelden.
postSigninRecoveryCode-subject = Sicherungs-Authentifizierungscode wurde zur Anmeldung verwendet
postSigninRecoveryCode-preview = Kontoaktivität bestätigen
postSigninRecoveryCode-title = Ihr Sicherungs-Authentifizierungscode wurde für die Anmeldung verwendet
postSigninRecoveryCode-description = Wenn Sie dies nicht getan haben, sollten Sie sofort Ihr Passwort ändern, um Ihr Konto zu schützen.
postSigninRecoveryCode-device = Sie haben sich angemeldet von:
postSigninRecoveryCode-action = Benutzerkonto verwalten
postSigninRecoveryPhone-subject = Telefonnummer zur Kontowiederherstellung wurde zur Anmeldung verwendet
postSigninRecoveryPhone-preview = Kontoaktivität bestätigen
postSigninRecoveryPhone-title = Ihre Telefonnummer zur Kontowiederherstellung wurde zur Anmeldung verwendet
postSigninRecoveryPhone-description = Wenn Sie dies nicht getan haben, sollten Sie sofort Ihr Passwort ändern, um Ihr Konto zu schützen.
postSigninRecoveryPhone-device = Sie haben sich angemeldet von:
postSigninRecoveryPhone-action = Benutzerkonto verwalten
postVerify-sub-title-3 = Wir freuen uns auf Sie!
postVerify-title-2 = Möchten Sie denselben Tab auf zwei Geräten sehen?
postVerify-description-2 = Das geht ganz einfach! Installieren Sie einfach { -brand-firefox } auf einem anderen Gerät und melden Sie sich an, um zu synchronisieren. Es ist wie Magie!
postVerify-sub-description = (Psst… Es bedeutet auch, dass Sie Ihre Lesezeichen, Passwörter und andere { -brand-firefox }-Daten überall abrufen können, wo Sie angemeldet sind.)
postVerify-subject-4 = Willkommen bei { -brand-mozilla }!
postVerify-setup-2 = Weiteres Gerät verbinden:
postVerify-action-2 = Weiteres Gerät verbinden
postVerifySecondary-subject = Zweit-E-Mail-Adresse hinzugefügt
postVerifySecondary-title = Zweit-E-Mail-Adresse hinzugefügt
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Sie haben { $secondaryEmail } als Zweit-E-Mail-Adresse für Ihr { -product-mozilla-account } bestätigt. Sicherheitshinweise und Anmeldebestätigungen werden ab sofort an beide E-Mail-Adressen verschickt.
postVerifySecondary-action = Benutzerkonto verwalten
recovery-subject = Setzen Sie Ihr Passwort zurück
recovery-title-2 = Haben Sie Ihr Passwort vergessen?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Wir haben eine Anfrage zur Passwortänderung für Ihr { -product-mozilla-account } erhalten von:
recovery-new-password-button = Erstellen Sie ein neues Passwort, indem Sie auf die folgende Schaltfläche klicken. Dieser Link läuft innerhalb der nächsten Stunde ab.
recovery-copy-paste = Erstellen Sie ein neues Passwort, indem Sie die folgende URL kopieren und in Ihren Browser einfügen. Dieser Link läuft innerhalb der nächsten Stunde ab.
recovery-action = Neues Passwort erstellen
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Verwenden Sie { $unblockCode } zur Anmeldung
unblockCode-preview = Dieser Code läuft in einer Stunde ab
unblockCode-title = Sind Sie das, der sich da anmeldet?
unblockCode-prompt = Wenn ja, ist hier der benötigte Autorisierungscode:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Wenn ja, ist hier der benötigte Autorisierungscode: { $unblockCode }
unblockCode-report = Wenn nicht, helfen Sie uns bei der Abwehr von Eindringlingen und <a data-l10n-name="reportSignInLink">schreiben Sie eine Meldung an uns</a>.
unblockCode-report-plaintext = Wenn nicht, helfen Sie uns bei der Abwehr von Eindringlingen und schreiben Sie eine Meldung an uns.
verificationReminderFinal-subject = Letzte Erinnerung: Bestätigen Sie Ihr Konto
verificationReminderFinal-description-2 = Vor ein paar Wochen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Zu Ihrer Sicherheit löschen wir das Konto, wenn es nicht innerhalb der nächsten 24 Stunden verifiziert wird.
confirm-account = Konto bestätigen
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Denken Sie daran, Ihr Konto zu bestätigen
verificationReminderFirst-title-3 = Willkommen bei { -brand-mozilla }!
verificationReminderFirst-description-3 = Vor ein paar Tagen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Bitte bestätigen Sie Ihr Konto in den nächsten 15 Tagen oder es wird automatisch gelöscht.
verificationReminderFirst-sub-description-3 = Verpassen Sie nicht den Browser, bei dem Sie und Ihre Privatsphäre an erster Stelle stehen.
confirm-email-2 = Konto bestätigen
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Konto bestätigen
verificationReminderSecond-subject-2 = Denken Sie daran, Ihr Konto zu bestätigen
verificationReminderSecond-title-3 = Verpassen Sie { -brand-mozilla } nicht!
verificationReminderSecond-description-4 = Vor ein paar Tagen haben Sie ein { -product-mozilla-account } erstellt, es aber nie bestätigt. Bitte bestätigen Sie Ihr Konto in den nächsten 10 Tagen oder es wird automatisch gelöscht.
verificationReminderSecond-second-description-3 = Mit Ihrem { -product-mozilla-account } können Sie Ihr { -brand-firefox }-Erlebnis geräteübergreifend synchronisieren und den Zugriff auf weitere Datenschutzprodukte von { -brand-mozilla } freischalten.
verificationReminderSecond-sub-description-2 = Werden Sie Teil unserer Mission, das Internet in einen Ort zu verwandeln, der für alle offen ist.
verificationReminderSecond-action-2 = Konto bestätigen
verify-title-3 = Öffnen Sie das Internet mit { -brand-mozilla }
verify-description-2 = Bestätigen Sie Ihr Konto und nutzen Sie { -brand-mozilla } überall dort, wo Sie sich anmelden. Erster Schritt:
verify-subject = Erstellung Ihres Kontos abschließen
verify-action-2 = Konto bestätigen
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Verwenden Sie { $code }, um Ihr Konto zu ändern
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Dieser Code läuft in { $expirationTime } Minute ab.
       *[other] Dieser Code läuft in { $expirationTime } Minuten ab.
    }
verifyAccountChange-title = Ändern Sie Ihre Kontodaten?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Helfen Sie uns, Ihr Konto zu schützen und bestätigen Sie diese Änderung auf:
verifyAccountChange-prompt = Wenn ja, ist hier Ihr Autorisierungscode:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Er läuft in { $expirationTime } Minute ab.
       *[other] Er läuft in { $expirationTime } Minuten ab.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Haben Sie sich bei { $clientName } angemeldet?
verifyLogin-description-2 = Helfen Sie uns, Ihr Konto zu schützen, indem Sie bestätigen, dass Sie sich angemeldet haben:
verifyLogin-subject-2 = Anmeldung bestätigen
verifyLogin-action = Anmeldung bestätigen
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Verwenden Sie { $code } zur Anmeldung
verifyLoginCode-preview = Dieser Code läuft in 5 Minuten ab.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Haben Sie sich bei { $serviceName } angemeldet?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Helfen Sie uns, Ihr Konto zu schützen, indem Sie Ihre Anmeldung genehmigen:
verifyLoginCode-prompt-3 = Wenn ja, ist hier Ihr Autorisierungscode:
verifyLoginCode-expiry-notice = Er läuft in 5 Minuten ab.
verifyPrimary-title-2 = Primäre E-Mail-Adresse bestätigen
verifyPrimary-description = Eine Anforderung zu einer Kontenänderung kam von folgendem Gerät:
verifyPrimary-subject = Primäre E-Mail-Adresse bestätigen
verifyPrimary-action-2 = E-Mail-Adresse bestätigen
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Nach der Bestätigung sind Kontoänderungen wie das Hinzufügen einer sekundären E-Mail-Adresse von diesem Gerät aus möglich.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Verwenden Sie { $code }, um Ihre sekundäre E-Mail-Adresse zu bestätigen
verifySecondaryCode-preview = Dieser Code läuft in 5 Minuten ab.
verifySecondaryCode-title-2 = Sekundäre E-Mail-Adresse bestätigen
verifySecondaryCode-action-2 = E-Mail-Adresse bestätigen
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Von folgendem { -product-mozilla-account } erfolgte eine Anfrage, { $email } als Zweit-E-Mail-Adresse zu nutzen:
verifySecondaryCode-prompt-2 = Verwenden Sie diesen Bestätigungscode:
verifySecondaryCode-expiry-notice-2 = Er läuft in fünf Minuten ab. Nach der Bestätigung erhält diese Adresse Sicherheitsbenachrichtigungen und Bestätigungen.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Verwenden Sie { $code }, um Ihr Konto zu bestätigen
verifyShortCode-preview-2 = Dieser Code läuft in 5 Minuten ab
verifyShortCode-title-3 = Öffnen Sie das Internet mit { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Bestätigen Sie Ihr Konto und nutzen Sie { -brand-mozilla } überall dort, wo Sie sich anmelden. Erster Schritt:
verifyShortCode-prompt-3 = Verwenden Sie diesen Bestätigungscode:
verifyShortCode-expiry-notice = Er läuft in 5 Minuten ab.
