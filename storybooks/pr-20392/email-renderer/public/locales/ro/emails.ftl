## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = Politica de confidențialitate { -brand-mozilla }
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } Notificare privind confidențialitatea
moz-accounts-terms-url = Condiții de utilizare a serviciilor { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Dacă ți se șterge contul, vei primi în continuare mesaje pe e-mail de la Corporația Mozilla și Fundația Mozilla, cu excepția cazului în care <a data-l10n-name="unsubscribeLink">ceri dezabonarea</a>.
account-deletion-info-block-support = Dacă ai întrebări sau ai nevoie de asistență, nu ezita să contactezi <a data-l10n-name="supportLink">echipa noastră de asistență</a>.
account-deletion-info-block-communications-plaintext = Dacă ți se șterge contul, vei primi în continuare mesaje pe e-mail de la Corporația Mozilla și Fundația Mozilla, cu excepția cazului în care ceri dezabonarea:
account-deletion-info-block-support-plaintext = Dacă ai întrebări sau ai nevoie de asistență, nu ezita să contactezi echipa noastră de asistență:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Download { $productName } on { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Download { $productName } on the { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Instalează { $productName } pe <a data-l10n-name="anotherDeviceLink">un alt dispozitiv desktop</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Instalează { $productName } pe <a data-l10n-name="anotherDeviceLink">un alt dispozitiv</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Ia { $productName } de pe Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Descarcă { $productName } din App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Instalează { $productName } pe un alt dispozitiv:
automated-email-change-2 = Dacă nu ai făcut-o deja, <a data-l10n-name="passwordChangeLink">schimbă-ți parola</a> imediat.
automated-email-support = Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Dacă nu ai făcut-o deja, schimbă-ți parola imediat:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Pentru mai multe informații, intră pe Asistență { -brand-mozilla }:
automated-email-inactive-account = Acesta este un mesaj automat trimis pe e-mail. L-ai primit pentru că ai un cont { -product-mozilla-account } și au trecut 2 ani de la ultima conectare.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
automated-email-no-action-plaintext = Acesta este un mesaj automat trimis pe e-mail. Dacă l-ai primit din greșeală, nu trebuie să faci nimic.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Acesta este un mesaj automat trimis pe e-mail; dacă nu ai autorizat așa ceva, te rugăm să îți schimbi parola:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Solicitarea venit de la { $uaBrowser } pe { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Solicitarea venit de la { $uaBrowser } pe { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Solicitarea venit de la { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Solicitarea venit de la { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Solicitarea venit de la { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Dacă nu ai fost tu, <a data-l10n-name="revokeAccountRecoveryLink">șterge cheia nouă</a> și <a data-l10n-name="passwordChangeLink">schimbă-ți parola</a>.
automatedEmailRecoveryKey-change-pwd-only = Dacă nu ai fost tu, <a data-l10n-name="passwordChangeLink">schimbă-ți parola</a>.
automatedEmailRecoveryKey-more-info = Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Această solicitare a venit de la:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Dacă nu ai fost tu, șterge noua cheie:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Dacă nu ai fost tu, schimbă-ți parola:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = și schimbă-ți parola:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Pentru mai multe informații, intră pe { -brand-mozilla } Asistență:
automated-email-reset =
    Acesta este un mesaj automat trimis pe e-mail; dacă nu ai autorizat așa ceva, atunci <a data-l10n-name="resetLink">resetează-ți parola</a>.
    Pentru mai multe informații, te rugăm să intri pe <a data-l10n-name="supportLink">Asistență { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Dacă nu ai autorizat așa ceva, resetează-ți acum parola la { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Dacă nu tu ai făcut asta, atunci <a data-l10n-name="resetLink">resetează-ți parola</a> și <a data-l10n-name="twoFactorSettingsLink">resetează autentificarea în doi pași</a> imediat.
    Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Dacă nu tu ai făcut asta, atunci resetează-ți parola imediat pe:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Resetează-ți și autentificarea în doi pași pe:
brand-banner-message = Știai că ne-am schimbat numele din { -product-firefox-accounts } în { -product-mozilla-accounts }? <a data-l10n-name="learnMore">Află mai multe</a>
change-password-plaintext = Dacă suspectezi că cineva încearcă să îți intre în cont, te rugăm să îți modifici parola.
manage-account = Gestionează contul
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Pentru mai multe informații, intră pe <a data-l10n-name="supportLink">{ -brand-mozilla } Asistență</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Pentru mai multe informații, intră pe { -brand-mozilla } Asistență: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } pe { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } pe { $uaOS }
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
location-country = { $country } (estimată)
cadReminderFirst-subject-1 = Memento! Hai să sincronizăm { -brand-firefox }
cadReminderFirst-action = Sincronizează alt dispozitiv
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Îți trebuie două pentru sincronizare
cadReminderFirst-description-v2 = Ia-ți cu tine filele pe toate dispozitivele. Ia cu tine marcajele, parolele și alte date oriunde folosești { -brand-firefox }.
cadReminderSecond-subject-2 = Nu rata! Să finalizăm setarea sincronizării
cadReminderSecond-action = Sincronizează alt dispozitiv
cadReminderSecond-title-2 = Nu uita să sincronizezi!
cadReminderSecond-description-sync = Sincronizează-ți marcajele, parolele, filele deschise și multe altele — oriunde folosești { -brand-firefox }.
cadReminderSecond-description-plus = În plus, datele tale sunt întotdeauna criptate. Numai tu și dispozitivele pe care le aprobi le puteți vedea.
inactiveAccountFinalWarning-subject = Ultima șansă ca să îți păstrezi { -product-mozilla-account }
inactiveAccountFinalWarning-title = Contul { -brand-mozilla } și datele vor fi șterse
inactiveAccountFinalWarning-preview = Intră în cont ca să îl păstrezi
inactiveAccountFinalWarning-account-description = Contul { -product-mozilla-account } este folosit pentru acces la produse gratuite de confidențialitate și navigare, cum ar fi sincronizarea { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } și { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = La data de <strong>{ $deletionDate }</strong>, contul și datele personale vor fi șterse definitiv dacă nu te conectezi.
inactiveAccountFinalWarning-action = Intră în cont ca să îl păstrezi
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Intră în cont ca să îl păstrezi:
inactiveAccountFirstWarning-subject = Nu-ți pierde contul
inactiveAccountFirstWarning-title = Vrei să îți păstrezi contul și datele { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Contul { -product-mozilla-account } este folosit pentru acces la produse gratuite de confidențialitate și navigare, cum ar fi sincronizarea { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } și { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Am observat că nu te-ai conectat de 2 ani.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Contul și datele personale vor fi șterse definitiv pe data de <strong>{ $deletionDate }</strong> pentru că nu ai fost activ(ă).
inactiveAccountFirstWarning-action = Intră în cont ca să îl păstrezi
inactiveAccountFirstWarning-preview = Intră în cont ca să îl păstrezi
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Intră în cont ca să îl păstrezi:
inactiveAccountSecondWarning-subject = Acțiune necesară: Contul va fi șters în 7 zile
inactiveAccountSecondWarning-title = Contul { -brand-mozilla } și datele vor fi șterse în 7 zile
inactiveAccountSecondWarning-account-description-v2 = Contul { -product-mozilla-account } este folosit pentru acces la produse gratuite de confidențialitate și navigare, cum ar fi sincronizarea { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } și { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Contul și datele personale vor fi șterse definitiv pe data de <strong>{ $deletionDate }</strong> pentru că nu ai fost activ(ă).
inactiveAccountSecondWarning-action = Intră în cont ca să îl păstrezi
inactiveAccountSecondWarning-preview = Intră în cont ca să îl păstrezi
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Intră în cont ca să îl păstrezi:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = Ai epuizat codurile de autentificare de rezervă!
codes-reminder-title-one = Ai ajuns la ultimul cod de autentificare de rezevă
codes-reminder-title-two = E momentul să creezi mai multe coduri de autentificare de rezervă
codes-reminder-description-part-one = Codurile de autentificare de rezervă te ajută să îți restaurezi informațiile când uiți parola.
codes-reminder-description-part-two = Creează coduri noi acum ca să nu îți pierzi datele mai târziu.
codes-reminder-description-two-left = Mai ai numai două coduri rămase.
codes-reminder-description-create-codes = Creează coduri de autentificare de rezervă nou ca să te ajute să intri din nou în cont dacă este blocat.
lowRecoveryCodes-action-2 = Creează coduri
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Nu mai ai niciun cod de autentificare de rezervă
        [one] A mai rămas doar 1 cod de autentificare de rezervă
        [few] Au mai rămas doar { $numberRemaining } de coduri de autentificare de rezervă!
       *[other] Au mai rămas doar { $numberRemaining } (de) coduri de autentificare de rezervă!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = O autentificare nouă în { $clientName }
newDeviceLogin-subjectForMozillaAccount = O autentificare nouă în { -product-mozilla-account }
newDeviceLogin-title-3 = Contul tău { -product-mozilla-account } a fost folosit pentru autentificare
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Nu ai fost tu? <a data-l10n-name="passwordChangeLink">Schimbă-ți parola</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Nu ai fost tu? Schimbă-ți parola:
newDeviceLogin-action = Gestionează contul
passwordChangeRequired-subject = Activitate suspectă detectată
passwordChangeRequired-preview = Schimbă-ți parola imediat
passwordChangeRequired-title-2 = Resetează-ți parola
passwordChangeRequired-suspicious-activity-3 = Ți-am blocat contul pentru a-l proteja de activități suspecte. Ai fost deconectat de pe toate dispozitivele tale, iar toate datele sincronizate au fost șterse ca măsură de precauție.
passwordChangeRequired-sign-in-3 = Ca să intri iar în cont, trebuie doar să îți resetezi parola.
passwordChangeRequired-different-password-2 = <b>Important:</b> Alege o parolă puternică, diferită de cea folosită anterior.
passwordChangeRequired-different-password-plaintext-2 = Important: Alege o parolă puternică, diferită de cea folosită anterior.
passwordChangeRequired-action = Resetează parola
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Parolă actualizată
passwordChanged-title = Parolă modificată cu succes
passwordChanged-description-2 = Parola { -product-mozilla-account } a fost schimbată cu succes de pe acest dispozitiv:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Folosește { $code } pentru a-ți schimba parola
password-forgot-otp-preview = Codul expiră în 10 minute.
password-forgot-otp-title = Ți-ai uitat parola?
password-forgot-otp-request = Am primit o solicitare de schimbare a parolei pentru contul { -product-mozilla-account } de la:
password-forgot-otp-code-2 = Dacă ai fost tu, iată codul de confirmare ca să continui:
password-forgot-otp-expiry-notice = Codul expiră în 10 minute.
passwordReset-subject-2 = Parola ta a fost resetată
passwordReset-title-2 = Parola ta a fost resetată
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Ți-ai resetat parola { -product-mozilla-account } pe:
passwordResetAccountRecovery-subject-2 = Parola ta a fost resetată
passwordResetAccountRecovery-title-3 = Parola ta a fost resetată
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Ți-ai folosit cheia de recuperare a contului ca să îți resetezi parola { -product-mozilla-account } pe:
passwordResetAccountRecovery-information = Te-am deconectat de pe toate dispozitivele sincronizate. Am creat o nouă cheie de recuperare a contului în locul celei pe care ai folosit-o. O poți modifica în setările contului.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Te-am deconectat de pe toate dispozitivele sincronizate. Am creat o nouă cheie de recuperare a contului în locul celei pe care ai folosit-o. O poți modifica în setările contului:
passwordResetAccountRecovery-action-4 = Gestionează contul
passwordResetRecoveryPhone-subject = Număr de telefon de recuperare folosit
passwordResetRecoveryPhone-preview = Verifică dacă ai fost tu
passwordResetRecoveryPhone-title = Numărul de telefon de recuperare a fost folosit pentru confirmarea resetării parolei
passwordResetRecoveryPhone-device = Număr de telefon de recuperare folosit de pe:
passwordResetRecoveryPhone-action = Gestionează contul
passwordResetWithRecoveryKeyPrompt-subject = Parola ta a fost resetată
passwordResetWithRecoveryKeyPrompt-title = Parola ta a fost resetată
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Ți-ai resetat parola { -product-mozilla-account } pe:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Creează o cheie de recuperare a contului
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Creează o cheie de recuperare a contului:
passwordResetWithRecoveryKeyPrompt-cta-description = Va trebui să te autentifici iar pe toate dispozitivele sincronizate. Data viitoare, păstrează-ți datele în siguranță cu o cheie de recuperare a contului. Îți permite recuperarea datelor dacă uiți parola.
postAddAccountRecovery-subject-3 = A fost creată o cheie nouă de recuperare a contului
postAddAccountRecovery-title2 = Ai creat o cheie nouă de recuperare a contului
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Păstrează cheia într-un loc sigur — vei avea nevoie de ea ca să restaurezi datele de navigare criptate dacă uiți parola.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Cheia poate fi folosită o singură dată. După ce o folosești, vom crea automat una nouă pentru tine. Sau poți crea una nouă oricând din setările contului.
postAddAccountRecovery-action = Gestionează contul
postAddLinkedAccount-subject-2 = Cont nou asociat cu { -product-mozilla-account }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Contul tău { $providerName } a fost asociat cu { -product-mozilla-account }
postAddLinkedAccount-action = Gestionează contul
postAddRecoveryPhone-subject = Număr de telefon de recuperare adăugat
postAddRecoveryPhone-preview = Cont protejat cu autentificare în doi pași
postAddRecoveryPhone-title-v2 = Ai adăugat un număr de telefon pentru recuperare
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Ai adăugat { $maskedLastFourPhoneNumber } ca număr de telefon pentru recuperare
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Cum îți protejează contul
postAddRecoveryPhone-how-protect-plaintext = Cum îți protejează contul:
postAddRecoveryPhone-enabled-device = L-ai activat de pe:
postAddRecoveryPhone-action = Gestionează contul
postAddTwoStepAuthentication-preview = Contul tău este protejat
postAddTwoStepAuthentication-subject-v3 = Autentificarea în doi pași este activă
postAddTwoStepAuthentication-title-2 = Ai activat autentificarea în doi pași
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Ai făcut cererea de pe:
postAddTwoStepAuthentication-action = Gestionează contul
postAddTwoStepAuthentication-code-required-v4 = Vei avea nevoie de acum înainte de codurile de securitate generate de aplicația ta de autentificare pentru fiecare autentificare.
postAddTwoStepAuthentication-recovery-method-codes = Ai adăugat și coduri de autentificare de rezervă ca metodă de recuperare.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Ai adăugat și { $maskedPhoneNumber } ca număr de telefon pentru recuperare.
postAddTwoStepAuthentication-how-protects-link = Cum îți protejează contul
postAddTwoStepAuthentication-how-protects-plaintext = Cum îți protejează contul
postAddTwoStepAuthentication-device-sign-out-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
postChangeAccountRecovery-subject = Cheie modificată de recuperare a contului
postChangeAccountRecovery-title = Ți-ai modificat cheia de recuperare a contului
postChangeAccountRecovery-body-part1 = Acum ai o cheie nouă de recuperare a contului. Cea anterioară a fost ștearsă.
postChangeAccountRecovery-body-part2 = Salvează cheia nouă într-un loc sigur — vei avea nevoie de ea ca să restaurezi datele de navigare criptate dacă uiți parola.
postChangeAccountRecovery-action = Gestionează contul
postChangePrimary-subject = Adresă de e-mail primară actualizată
postChangePrimary-title = Adresă de e-mail primară nouă
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Ai schimbat cu succes adresa de e-mail primară în { $email }. Aceasta este acum numele de utilizator ca să intri în contul { -product-mozilla-account } și pentru primirea notificărilor de securitate și a confirmărilor de conectare.
postChangePrimary-action = Gestionează contul
postChangeRecoveryPhone-subject = Număr de telefon de recuperare actualizat
postChangeRecoveryPhone-preview = Cont protejat cu autentificare în doi pași
postChangeRecoveryPhone-title = Ți-ai schimbat numărul de telefon pentru recuperare
postChangeRecoveryPhone-description = Acum ai un nou număr de telefon pentru recuperare. Numărul anterior a fost șters.
postChangeRecoveryPhone-requested-device = Ai făcut cererea de pe:
postChangeTwoStepAuthentication-preview = Contul tău este protejat
postChangeTwoStepAuthentication-subject = Autentificare în doi pași actualizată
postChangeTwoStepAuthentication-title = Autentificarea în doi pași a fost actualizată
postChangeTwoStepAuthentication-use-new-account = Acum trebuie să utilizezi noua intrare { -product-mozilla-account } în aplicația de autentificare. Cea veche nu va mai funcționa și o poți elimina.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Ai făcut cererea de pe:
postChangeTwoStepAuthentication-action = Gestionează contul
postChangeTwoStepAuthentication-how-protects-link = Cum îți protejează contul
postChangeTwoStepAuthentication-how-protects-plaintext = Cum îți protejează contul:
postChangeTwoStepAuthentication-device-sign-out-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
postConsumeRecoveryCode-title-3 = Codul de autentificare de rezervă a fost folosit pentru a confirma resetarea parolei.
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Cod utilizat din:
postConsumeRecoveryCode-action = Gestionează contul
postConsumeRecoveryCode-subject-v3 = Cod de autentificare de rezervă utilizat
postConsumeRecoveryCode-preview = Verifică dacă ai fost tu
postNewRecoveryCodes-subject-2 = Coduri noi de autentificare de rezervă create
postNewRecoveryCodes-title-2 = Ai creat coduri noi de autentificare de rezervă
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Au fost create pe:
postNewRecoveryCodes-action = Gestionează contul
postRemoveAccountRecovery-subject-2 = Cheie de recuperare a contului ștearsă
postRemoveAccountRecovery-title-3 = Ți-ai șters cheia de recuperare a contului
postRemoveAccountRecovery-body-part1 = Ai nevoie de cheia de recuperare a contului ca să restaurezi datele de navigare criptate dacă uiți parola.
postRemoveAccountRecovery-body-part2 = Dacă nu ai făcut-o deja, creează o cheie nouă de recuperare a contului în setările contului pentru a preveni pierderea parolelor salvate, a marcajelor, a istoricului de navigare și a altor date.
postRemoveAccountRecovery-action = Gestionează contul
postRemoveRecoveryPhone-subject = Numărul de telefon de recuperare a fost eliminat
postRemoveRecoveryPhone-preview = Cont protejat cu autentificare în doi pași
postRemoveRecoveryPhone-title = Numărul de telefon de recuperare a fost eliminat
postRemoveRecoveryPhone-description-v2 = Numărul de telefon de recuperare a fost eliminat din setările pentru autentificare în doi pași.
postRemoveRecoveryPhone-description-extra = Poți folosi în continuare codurile de autentificare de rezervă pentru conectare dacă nu poți utiliza aplicația de autentificare.
postRemoveRecoveryPhone-requested-device = Ai făcut cererea de pe:
postRemoveSecondary-subject = Adresă de e-mail secundară eliminată
postRemoveSecondary-title = Adresă de e-mail secundară eliminată
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Ai eliminat cu succes { $secondaryEmail } ca adresă de e-mail secundară din contul tău { -product-mozilla-account }. Notificările de securitate și confirmările de autentificare nu vor mai fi trimise la această adresă.
postRemoveSecondary-action = Gestionează contul
postRemoveTwoStepAuthentication-subject-line-2 = Autentificare în doi pași dezactivată
postRemoveTwoStepAuthentication-title-2 = Ai dezactivat autentificarea în doi pași
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = L-ai dezactivat de pe:
postRemoveTwoStepAuthentication-action = Gestionează contul
postRemoveTwoStepAuthentication-not-required-2 = Nu mai ai nevoie de coduri de securitate din aplicația de autentificare când te autentifici.
postSigninRecoveryCode-subject = Cod de autentificare de rezervă utilizat pentru autentificare
postSigninRecoveryCode-preview = Confirmă activitatea contului
postSigninRecoveryCode-title = Codul de autentificare de rezervă a fost folosit pentru autentificare
postSigninRecoveryCode-description = Dacă nu ai făcut-o tu, trebuie să îți schimbi imediat parola ca să îți păstrezi contul în siguranță.
postSigninRecoveryCode-device = Te-ai conectat de pe:
postSigninRecoveryCode-action = Gestionează contul
postSigninRecoveryPhone-subject = Număr de telefon de recuperare folosit pentru autentificare
postSigninRecoveryPhone-preview = Confirmă activitatea contului
postSigninRecoveryPhone-title = Numărul de telefon de recuperare a fost folosit pentru autentificare
postSigninRecoveryPhone-description = Dacă nu ai făcut-o tu, trebuie să îți schimbi imediat parola ca să îți păstrezi contul în siguranță.
postSigninRecoveryPhone-device = Te-ai conectat de pe:
postSigninRecoveryPhone-action = Gestionează contul
postVerify-sub-title-3 = Suntem încântați să te vedem!
postVerify-title-2 = Vrei să vezi aceeași filă pe două dispozitive?
postVerify-description-2 = E simplu! Instalează { -brand-firefox } pe un alt dispozitiv și intră în cont pentru sincronizare. E ca prin magie!
postVerify-sub-description = (Psst… Înseamnă și că poți accesa marcajele, parolele și alte date { -brand-firefox } oriunde ești conectat(ă).)
postVerify-subject-4 = Bine ai venit la { -brand-mozilla }!
postVerify-setup-2 = Conectează un alt dispozitiv:
postVerify-action-2 = Conectează alt dispozitiv
postVerifySecondary-subject = E-mail secundar adăugat
postVerifySecondary-title = E-mail secundar adăugat
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Ai confirmat cu succes { $secondaryEmail } ca adresă de e-mail secundară pentru { -product-mozilla-account }. Notificările de securitate și confirmarea intrărilor în cont vor fi trimise acum la ambele adrese de e-mail.
postVerifySecondary-action = Gestionează contul
recovery-subject = Resetează-ți parola
recovery-title-2 = Ți-ai uitat parola?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Am primit o solicitare de schimbare a parolei pentru contul { -product-mozilla-account } de pe:
recovery-new-password-button = Creează o parolă nouă dând clic pe butonul de mai jos. Linkul va expira într-o oră.
recovery-copy-paste = Creează o parolă nouă prin copierea și inserarea URL-ului de mai jos în browser. Linkul va expira într-o oră.
recovery-action = Creează o parolă nouă
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Folosește { $unblockCode } pentru autentificare
unblockCode-preview = Codul expiră într-o oră
unblockCode-title = Tu ești încerci să te autentifici?
unblockCode-prompt = Dacă da, iată codul de autorizare de care ai nevoie:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Dacă da, iată codul de autorizare de care ai nevoie: { $unblockCode }
unblockCode-report = Dacă nu, ajută-ne să ținem departe intrușii și <a data-l10n-name="reportSignInLink">raportează-ne</a>.
unblockCode-report-plaintext = Dacă nu, ajută-ne să blocăm intrușii și raportează-ne.
verificationReminderFinal-subject = Ultima reamintire să îți confirmi contul
verificationReminderFinal-description-2 = Acum câteva săptămâni ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Pentru siguranța ta, vom șterge contul dacă nu este verificat în următoarele 24 de ore.
confirm-account = Confirmă contul
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Ține minte că trebuie să confirmi contul
verificationReminderFirst-title-3 = Bine ai venit la { -brand-mozilla }!
verificationReminderFirst-description-3 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Te rugăm să confirmi contul în următoarele 15 zile, altfel va fi șters automat.
verificationReminderFirst-sub-description-3 = Nu rata browserul care te pune pe tine și confidențialitatea ta pe primul loc.
confirm-email-2 = Confirmă contul
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Confirmă contul
verificationReminderSecond-subject-2 = Ține minte că trebuie să confirmi contul
verificationReminderSecond-title-3 = Nu rata { -brand-mozilla }!
verificationReminderSecond-description-4 = Acum câteva zile ai creat un cont { -product-mozilla-account }, dar nu l-ai confirmat niciodată. Te rugăm să confirmi contul în următoarele 10 zile, altfel va fi șters automat.
verificationReminderSecond-second-description-3 = Contul { -product-mozilla-account } îți permite să îți sincronizezi experiența { -brand-firefox } pe toate dispozitivele și deblochează accesul la mai multe produse { -brand-mozilla } care îți protejează confidențialitatea.
verificationReminderSecond-sub-description-2 = Alătură-te misiunii noastre de a transforma internetul într-un loc deschis tuturor.
verificationReminderSecond-action-2 = Confirmă contul
verify-title-3 = Intră pe internet cu { -brand-mozilla }
verify-description-2 = Confirmă-ți contul și folosește la maxim { -brand-mozilla } oriunde te autentifici, începând cu:
verify-subject = Finalizează crearea contului
verify-action-2 = Confirmă contul
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Folosește { $code } pentru a-ți schimba contul
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Codul expiră în { $expirationTime } minut
        [few] Codul expiră în { $expirationTime } minute
       *[other] Codul expiră în { $expirationTime } de minute
    }
verifyAccountChange-title = Îți modifici informațiile contului?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Ajută-ne să îți ținem contul în siguranță aprobând autentificarea în:
verifyAccountChange-prompt = Dacă da, iată codul tău de autorizare:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Expiră în { $expirationTime } minut
        [few] Expiră în { $expirationTime } minute
       *[other] Expiră în { $expirationTime } de minute
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Te-ai autentificat în { $clientName }?
verifyLogin-description-2 = Ajută-ne să îți protejăm contul confirmând autentificarea în:
verifyLogin-subject-2 = Confirmă autentificarea
verifyLogin-action = Confirmă autentificarea
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Folosește { $code } pentru autentificare
verifyLoginCode-preview = Codul expiră în 5 minute.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Te-ai autentificat în { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Ajută-ne să îți protejăm contul aprobând autentificarea în:
verifyLoginCode-prompt-3 = Dacă da, iată codul tău de autorizare:
verifyLoginCode-expiry-notice = Expiră în 5 minute.
verifyPrimary-title-2 = Confirmă adresa de e-mail primară
verifyPrimary-description = A fost trimisă o cerere de modificare a contului tău pe următorul dispozitiv:
verifyPrimary-subject = Confirmă adresa primară de e-mail
verifyPrimary-action-2 = Confirmă adresa de e-mail
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Odată confirmată, vor fi posibile modificări ale contului de pe acest dispozitiv, precum adăugarea unei adrese de e-mail secundare.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Folosește { $code } pentru confirmarea adresei secundare de e-mail
verifySecondaryCode-preview = Codul expiră în 5 minute.
verifySecondaryCode-title-2 = Confirmă adresa de e-mail secundară
verifySecondaryCode-action-2 = Confirmă adresa de e-mail
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = A fost trimisă o cerere pentru a folosi { $email } ca adresă de e-mail secundară de pe următorul cont { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Folosește acest cod de confirmare:
verifySecondaryCode-expiry-notice-2 = Expiră în 5 minute. Odată confirmată, această adresă va începe să primească notificări de securitate și confirmări.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Folosește { $code } pentru confirmarea contului
verifyShortCode-preview-2 = Codul expiră în 5 minute.
verifyShortCode-title-3 = Intră pe internet cu { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Confirmă-ți contul și folosește la maxim { -brand-mozilla } oriunde te autentifici, începând cu:
verifyShortCode-prompt-3 = Folosește acest cod de confirmare:
verifyShortCode-expiry-notice = Expiră în 5 minute.
