# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = È stato inviato un nuovo codice alla tua email.
resend-link-success-banner-heading = È stato inviato un nuovo link al tuo indirizzo email.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Aggiungi { $accountsEmail } ai tuoi contatti per garantire una consegna senza problemi.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Chiudi banner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = Gli { -product-firefox-accounts } cambieranno nome in { -product-mozilla-accounts } dal 1° novembre
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Continuerai ad accedere con lo stesso nome utente e password e non ci saranno altre modifiche ai prodotti che utilizzi.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Abbiamo cambiato il nome degli { -product-firefox-accounts } in { -product-mozilla-accounts }. Continuerai ad accedere con lo stesso nome utente e password e non ci saranno altre modifiche ai prodotti che utilizzi.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Ulteriori informazioni
# Alt text for close banner image
brand-close-banner =
    .alt = Chiudi banner
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo con la m di  { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Indietro
button-back-title = Indietro

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Scarica e continua
    .title = Scarica e continua
recovery-key-pdf-heading = Chiave di recupero dell’account
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Generata: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Chiave di recupero dell’account
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Questa chiave consente di recuperare i dati crittati del browser (inclusi password, segnalibri e cronologia) se si dimentica la password dell’account. Conservala in un posto facile da ricordare.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Luoghi in cui conservare la chiave
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Ulteriori informazioni sulla chiave di recupero dell’account
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Siamo spiacenti, si è verificato un problema durante il download della chiave di recupero dell’account.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Ottieni di più da { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Ricevi le ultime notizie e gli aggiornamenti sui prodotti
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Accesso in anteprima per testare nuovi prodotti
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Inviti all’azione per riprendere il controllo di Internet

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Scaricato
datablock-copy =
    .message = Copiato
datablock-print =
    .message = Stampato

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Codice copiato
       *[other] Codici copiati
    }
datablock-download-success =
    { $count ->
        [one] Codice scaricato
       *[other] Codici scaricati
    }
datablock-print-success =
    { $count ->
        [one] Codice stampato
       *[other] Codici stampati
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copiato

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (stimato)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (stimato)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (stimato)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (stimato)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Posizione sconosciuta
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } su { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Indirizzo IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Password
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ripeti password
form-password-with-inline-criteria-signup-submit-button = Crea un account
form-password-with-inline-criteria-reset-new-password =
    .label = Nuova password
form-password-with-inline-criteria-confirm-password =
    .label = Conferma password
form-password-with-inline-criteria-reset-submit-button = Crea nuova password
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Password
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ripeti password
form-password-with-inline-criteria-set-password-submit-button = Avvia la sincronizzazione
form-password-with-inline-criteria-match-error = Le password non corrispondono
form-password-with-inline-criteria-sr-too-short-message = La password deve contenere almeno 8 caratteri.
form-password-with-inline-criteria-sr-not-email-message = La password non deve contenere il tuo indirizzo email.
form-password-with-inline-criteria-sr-not-common-message = La password non deve essere una password di uso comune.
form-password-with-inline-criteria-sr-requirements-met = La password inserita rispetta tutti i requisiti per le password.
form-password-with-inline-criteria-sr-passwords-match = Le password inserite corrispondono.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Campo obbligatorio

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Inserisci un codice di { $codeLength } cifre per continuare
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Inserisci un codice di { $codeLength } caratteri per continuare

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Chiave di recupero dell’account { -brand-firefox }
get-data-trio-title-backup-verification-codes = Codici di autenticazione di backup
get-data-trio-download-2 =
    .title = Scarica
    .aria-label = Scarica
get-data-trio-copy-2 =
    .title = Copia
    .aria-label = Copia
get-data-trio-print-2 =
    .title = Stampa
    .aria-label = Stampa

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Avviso
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Attenzione
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Attenzione
authenticator-app-aria-label =
    .aria-label = Applicazione di autenticazione
backup-codes-icon-aria-label-v2 =
    .aria-label = Codici di autenticazione di backup attivati
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Codici di autenticazione di backup disattivati
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS di recupero attivato
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS di recupero disattivato
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Bandiera del Canada
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Spunta
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Completato
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Attivo
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Chiudi messaggio
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Codice
error-icon-aria-label =
    .aria-label = Errore
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informazioni
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Bandiera degli Stati Uniti

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Un computer, un telefono cellulare e l’immagine di un cuore spezzato su ciascuno
hearts-verified-image-aria-label =
    .aria-label = Un computer, un telefono cellulare e un tablet con un cuore pulsante su ciascuno
signin-recovery-code-image-description =
    .aria-label = Documento che contiene testo nascosto.
signin-totp-code-image-label =
    .aria-label = Un dispositivo con un codice nascosto a 6 cifre.
confirm-signup-aria-label =
    .aria-label = Una busta contenente un link
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Illustrazione per rappresentare una chiave di recupero dell’account.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Illustrazione per rappresentare una chiave di recupero dell’account.
password-image-aria-label =
    .aria-label = Un’illustrazione per rappresentare la digitazione di una password.
lightbulb-aria-label =
    .aria-label = Illustrazione per rappresentare la creazione di un suggerimento per l’archiviazione.
email-code-image-aria-label =
    .aria-label = Illustrazione per rappresentare un’email contenente un codice.
recovery-phone-image-description =
    .aria-label = Dispositivo mobile che riceve un codice tramite SMS.
recovery-phone-code-image-description =
    .aria-label = Codice ricevuto su un dispositivo mobile.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispositivo mobile con funzionalità SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Schermo del dispositivo con codici
sync-clouds-image-aria-label =
    .aria-label = Nuvole con un’icona che rappresenta la sincronizzazione
confetti-falling-image-aria-label =
    .aria-label = Animazione con coriandoli che cadono

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Hai effettuato l’accesso a { -brand-firefox }.
inline-recovery-key-setup-create-header = Proteggi il tuo account
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Hai un minuto per proteggere i tuoi dati?
inline-recovery-key-setup-info = Genera una chiave di recupero dell’account in modo da poter ripristinare i dati di navigazione sincronizzati nel caso in cui dimenticassi la password.
inline-recovery-key-setup-start-button = Genera una chiave di recupero dell’account
inline-recovery-key-setup-later-button = Più tardi

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Nascondi password
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Mostra password
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = La password è attualmente visibile sullo schermo.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = La password è attualmente nascosta.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = La password è ora visibile sullo schermo.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = La password è ora nascosta.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Scegli la nazione
input-phone-number-enter-number = Inserire il numero di telefono
input-phone-number-country-united-states = Stati Uniti
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Indietro

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Link per la reimpostazione della password danneggiato
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Il link di conferma è danneggiato
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Il link non è valido
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Nel link su cui hai fatto clic mancano alcuni caratteri, probabilmente è un problema causato dal client di posta elettronica. Riprova assicurandoti di selezionare e copiare con cura il link.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Ricevi un nuovo link

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Ricordi la password?
# link navigates to the sign in page
remember-password-signin-link = Accedi

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = L’indirizzo email primario è già stato confermato
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = L’accesso è già stato confermato
confirmation-link-reused-message = Questo link di conferma è già stato utilizzato (e può essere utilizzato una sola volta).

## Locale Toggle Component

locale-toggle-select-label = Scegli lingua
locale-toggle-browser-default = Predefinita del browser
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Richiesta non valida

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Questa password è necessaria per accedere ai dati crittati che salviamo per te.
password-info-balloon-reset-risk-info = Un ripristino potrebbe comportare la perdita di dati come password e segnalibri.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Scegli una password complessa che non hai utilizzato su altri siti. Assicurati che soddisfi i requisiti di sicurezza:
password-strength-short-instruction = Scegli una password complessa:
password-strength-inline-min-length = Almeno 8 caratteri
password-strength-inline-not-email = Non uguale al tuo indirizzo email
password-strength-inline-not-common = Non una password di uso comune
password-strength-inline-confirmed-must-match = La conferma corrisponde alla nuova password
password-strength-inline-passwords-match = Le password corrispondono

## Notification Promo Banner component

account-recovery-notification-cta = Genera
account-recovery-notification-header-value = Non perdere i tuoi dati se dimentichi la password
account-recovery-notification-header-description = Genera una chiave di recupero dell’account in modo da poter ripristinare i dati di navigazione sincronizzati nel caso in cui dimenticassi la password.
recovery-phone-promo-cta = Aggiungi telefono per il recupero dell’account
recovery-phone-promo-heading = Aggiungi ulteriore protezione al tuo account con un telefono per il recupero dell’account
recovery-phone-promo-description = Ora puoi accedere con una password monouso via SMS se non puoi utilizzare l’app di autenticazione in due passaggi.
recovery-phone-promo-info-link = Ulteriori informazioni sul recupero e sui rischi legati a “SIM swap”
promo-banner-dismiss-button =
    .aria-label = Chiudi banner

## Ready component

ready-complete-set-up-instruction = Per completare la configurazione inserisci la nuova password sugli altri dispositivi { -brand-firefox }.
manage-your-account-button = Gestisci il tuo account
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Ora puoi utilizzare { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Ora è possibile utilizzare le impostazioni dell’account
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Il tuo account è pronto!
ready-continue = Continua
sign-in-complete-header = Accesso confermato
sign-up-complete-header = Account confermato
primary-email-verified-header = Indirizzo email primario confermato

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Luoghi in cui conservare la chiave:
flow-recovery-key-download-storage-ideas-folder-v2 = Cartella su un dispositivo sicuro
flow-recovery-key-download-storage-ideas-cloud = Spazio di archiviazione su cloud affidabile
flow-recovery-key-download-storage-ideas-print-v2 = Copia cartacea
flow-recovery-key-download-storage-ideas-pwd-manager = Gestore di password

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Aggiungi un suggerimento per trovare la chiave
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Questo suggerimento dovrebbe aiutarti a ricordare dove hai memorizzato la chiave di recupero dell’account. Possiamo mostrartelo durante la reimpostazione della password per recuperare i tuoi dati.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Inserisci un suggerimento (facoltativo)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Fine
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Il suggerimento deve contenere meno di 255 caratteri.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Il suggerimento non può contenere caratteri Unicode non sicuri. Sono consentiti solo lettere, numeri, segni di punteggiatura e simboli.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Attenzione
password-reset-chevron-expanded = Comprimi avviso
password-reset-chevron-collapsed = Espandi avviso
password-reset-data-may-not-be-recovered = Potrebbe non essere possibile recuperare i dati del browser
password-reset-previously-signed-in-device-2 = Hai un dispositivo su cui hai effettuato l’accesso in precedenza?
password-reset-data-may-be-saved-locally-2 = I dati del browser potrebbero essere salvati su quel dispositivo. Reimposta la password, quindi accedi per ripristinare e sincronizzare i tuoi dati.
password-reset-no-old-device-2 = Hai un nuovo dispositivo ma non hai accesso a nessuno dei tuoi dispositivi precedenti?
password-reset-encrypted-data-cannot-be-recovered-2 = Siamo spiacenti, non è possibile recuperare i dati crittati del tuo browser sui server { -brand-firefox }.
password-reset-warning-have-key = Hai una chiave di recupero dell’account?
password-reset-warning-use-key-link = Usala ora per reimpostare la password e conservare i tuoi dati

## Alert Bar

alert-bar-close-message = Chiudi messaggio

## User's avatar

avatar-your-avatar =
    .alt = Il tuo avatar
avatar-default-avatar =
    .alt = Avatar predefinito

##


# BentoMenu component

bento-menu-title-3 = Prodotti { -brand-mozilla }
bento-menu-tagline = Altri prodotti { -brand-mozilla } che proteggono la tua privacy
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Browser { -brand-firefox } per desktop
bento-menu-firefox-mobile = Browser { -brand-firefox } per dispositivi mobili
bento-menu-made-by-mozilla = Realizzato da { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Ottieni { -brand-firefox } sul cellulare o tablet
connect-another-find-fx-mobile-2 = Trova { -brand-firefox } in { -google-play } e { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Scarica { -brand-firefox } su { -google-play }
connect-another-app-store-image-3 =
    .alt = Scarica { -brand-firefox } su { -app-store }

## Connected services section

cs-heading = Servizi connessi
cs-description = Tutti i servizi ai quali hai effettuato l’accesso e che stai utilizzando.
cs-cannot-refresh = Siamo spiacenti, si è verificato un problema durante l’aggiornamento della lista dei servizi connessi.
cs-cannot-disconnect = Client non trovato, impossibile effettuare la disconnessione
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Disconnesso da { $service }
cs-refresh-button =
    .title = Aggiorna i servizi connessi
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Elementi duplicati o mancanti?
cs-disconnect-sync-heading = Disconnetti da Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = I dati relativi alla navigazione rimarranno nel dispositivo <span>{ $device }</span>, ma non verranno più sincronizzati con il tuo account.
cs-disconnect-sync-reason-3 = Per quale motivo stai disconnettendo <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Il dispositivo è:
cs-disconnect-sync-opt-suspicious = Sospetto
cs-disconnect-sync-opt-lost = Perso o rubato
cs-disconnect-sync-opt-old = Vecchio o sostituito
cs-disconnect-sync-opt-duplicate = Duplicato
cs-disconnect-sync-opt-not-say = Preferisco non rispondere

##

cs-disconnect-advice-confirm = OK
cs-disconnect-lost-advice-heading = Dispositivo perso o rubato disconnesso
cs-disconnect-lost-advice-content-3 = Poiché il tuo dispositivo è stato smarrito o rubato, per mantenere le tue informazioni al sicuro è consigliato cambiare la password dell’{ -product-mozilla-account } nelle impostazioni. Dovresti anche verificare con il produttore del tuo dispositivo come cancellare i dati da remoto.
cs-disconnect-suspicious-advice-heading = Dispositivo sospetto disconnesso
cs-disconnect-suspicious-advice-content-2 = Se il dispositivo disconnesso è effettivamente sospetto, ti consigliamo di modificare la password dell’{ -product-mozilla-account } nelle impostazioni del tuo account per mantenere le tue informazioni al sicuro. Ti consigliamo anche modificare qualsiasi altra password salvata in { -brand-firefox } digitando about:logins nelle barra degli indirizzi.
cs-sign-out-button = Disconnetti

## Data collection section

dc-heading = Raccolta e utilizzo dati
dc-subheader-moz-accounts = { -product-mozilla-accounts(capitalization: "uppercase") }
dc-subheader-ff-browser = Browser { -brand-firefox }
dc-subheader-content-2 = Consenti al servizio di { -product-mozilla-accounts } di inviare a { -brand-mozilla } dati tecnici e di interazione.
dc-subheader-ff-content = Per controllare o aggiornare le impostazioni relative ai dati tecnici e di interazione del browser { -brand-firefox }, apri le impostazioni di { -brand-firefox } e accedi a Privacy e sicurezza.
dc-opt-out-success-2 = Disattivazione riuscita. Il servizio di { -product-mozilla-accounts } non invierà a { -brand-mozilla } dati tecnici o di interazione.
dc-opt-in-success-2 = Grazie! La condivisione di questi dati ci aiuta a migliorare gli { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Siamo spiacenti, si è verificato un problema durante la modifica delle preferenze relative alla raccolta dati
dc-learn-more = Ulteriori informazioni

# DropDownAvatarMenu component

drop-down-menu-title-2 = Menu { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Accesso effettuato come
drop-down-menu-sign-out = Disconnetti
drop-down-menu-sign-out-error-2 = Si è verificato un problema durante la disconnessione

## Flow Container

flow-container-back = Indietro

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Reinserire la password per motivi di sicurezza
flow-recovery-key-confirm-pwd-input-label = Inserire la password
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Genera una chiave di recupero dell’account
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Genera una nuova chiave di recupero dell’account

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Chiave di recupero dell’account generata: scaricala e salvala subito
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Questa chiave consente di recuperare i propri dati se si dimentica la password. Scaricala adesso e conservala in un luogo facile da ricordare (non sarà possibile ritornare a questa pagina).
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Continua senza scaricare

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = La chiave di recupero dell’account è stata generata

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Genera una chiave di recupero dell’account nel caso in cui dimentichi la password
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Modifica la chiave di recupero dell’account
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Crittiamo i dati di navigazione: password, segnalibri e altro ancora. È ottimo per la privacy, ma potresti perdere i tuoi dati se dimentichi la password.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Ecco perché è così importante generare una chiave di recupero dell’account: puoi usarla per ripristinare i tuoi dati.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Inizia
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Annulla

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Connettiti all’app di autenticazione
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Passaggio 1:</strong> scansiona questo codice QR utilizzando un’app di autenticazione, come Duo o Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Codice QR per impostare l’autenticazione in due passaggi. Scansionalo o scegli “Non riesci a scansionare il codice QR?” per ottenere una chiave segreta di configurazione.
flow-setup-2fa-cant-scan-qr-button = Non riesci a scansionare il codice QR?
flow-setup-2fa-manual-key-heading = Inserisci il codice manualmente
flow-setup-2fa-manual-key-instruction = <strong>Passaggio 1:</strong> inserisci questo codice nell’app di autenticazione che preferisci.
flow-setup-2fa-scan-qr-instead-button = Vuoi scansionare il codice QR?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Ulteriori informazioni sulle app di autenticazione
flow-setup-2fa-button = Continua
flow-setup-2fa-step-2-instruction = <strong>Passaggio 2:</strong> inserisci il codice dall’app di autenticazione.
flow-setup-2fa-input-label = Inserisci il codice a 6 cifre
flow-setup-2fa-code-error = Codice non valido o scaduto. Controlla l’app di autenticazione e riprova.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Scegli un metodo di recupero
flow-setup-2fa-backup-choice-description = Questo ti consente di completare l’accesso se non riesci ad accedere al tuo dispositivo mobile o all’app di autenticazione.
flow-setup-2fa-backup-choice-phone-title = Telefono per il recupero dell’account
flow-setup-2fa-backup-choice-phone-badge = Più semplice
flow-setup-2fa-backup-choice-phone-info = Ricevi un codice di recupero via SMS. Attualmente disponibile negli Stati Uniti e in Canada.
flow-setup-2fa-backup-choice-code-title = Codici di autenticazione di backup
flow-setup-2fa-backup-choice-code-badge = Più sicuro
flow-setup-2fa-backup-choice-code-info = Crea e salva codici di autenticazione monouso.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Ulteriori informazioni sul recupero e i rischi legati al SIM swap

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Digita il codice di autenticazione di backup
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Conferma di aver salvato i codici inserendone uno. Senza questi codici potresti non essere in grado di accedere se non hai accesso all’app di autenticazione.
flow-setup-2fa-backup-code-confirm-code-input = Inserire il codice di 10 caratteri
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Fine

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Salva i codici di autenticazione di backup
flow-setup-2fa-backup-code-dl-save-these-codes = Conservali in un posto facile da ricordare. Se non hai accesso alla tua app di autenticazione, dovrai inserirne uno per accedere.
flow-setup-2fa-backup-code-dl-button-continue = Continua

##

flow-setup-2fa-inline-complete-success-banner = Autenticazione in due passaggi attivata
flow-setup-2fa-inline-complete-success-banner-description = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui stai utilizzando questo account, quindi accedere nuovamente utilizzando la nuova autenticazione in due passaggi.
flow-setup-2fa-inline-complete-backup-code = Codici di autenticazione di backup
flow-setup-2fa-inline-complete-backup-phone = Telefono per il recupero dell’account
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } codice rimanente
       *[other] { $count } codici rimanenti
    }
flow-setup-2fa-inline-complete-backup-code-description = Questo è il metodo di recupero più sicuro se non riesci ad accedere con il tuo dispositivo mobile o l’app di autenticazione.
flow-setup-2fa-inline-complete-backup-phone-description = Questo è il metodo di recupero più semplice se non riesci ad accedere con l’app di autenticazione.
flow-setup-2fa-inline-complete-learn-more-link = Come aiuta a proteggere il tuo account
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Continua su { $serviceName }
flow-setup-2fa-prompt-heading = Configura l’autenticazione in due passaggi
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } richiede la configurazione dell’autenticazione in due passaggi per mantenere il tuo account al sicuro.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Per procedere puoi utilizzare una di <authenticationAppsLink>queste app di autenticazione</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Continua

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Inserisci il codice di verifica
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = È stato inviato un codice di sei cifre a <span>{ $phoneNumber }</span> tramite SMS. Questo codice scade dopo 5 minuti.
flow-setup-phone-confirm-code-input-label = Inserisci il codice a 6 cifre
flow-setup-phone-confirm-code-button = Conferma
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Codice scaduto?
flow-setup-phone-confirm-code-resend-code-button = Invia di nuovo il codice
flow-setup-phone-confirm-code-resend-code-success = Codice inviato
flow-setup-phone-confirm-code-success-message-v2 = Aggiunto telefono per il recupero dell’account
flow-change-phone-confirm-code-success-message = Modificato telefono per il recupero dell’account

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Verifica il tuo numero di telefono
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Riceverai un SMS da { -brand-mozilla } con un codice per verificare il tuo numero. Non condividere questo codice con nessuno.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Il telefono per il recupero dell’account è disponibile solo negli Stati Uniti e in Canada. I numeri VoIP e gli alias telefonici non sono consigliati.
flow-setup-phone-submit-number-legal = Fornendo il tuo numero, accetti che venga salvato in modo che possiamo inviarti un messaggio solo per la verifica dell’account. Potrebbero essere applicate tariffe per messaggi e traffico dati.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Invia codice

## HeaderLockup component, the header in account settings

header-menu-open = Chiudi menu
header-menu-closed = Menu di navigazione del sito
header-back-to-top-link =
    .title = Torna su
header-back-to-settings-link =
    .title = Torna alle impostazioni di { -product-mozilla-account }
header-title-2 = { -product-mozilla-account(capitalization: "uppercase") }
header-help = Aiuto

## Linked Accounts section

la-heading = Account collegati
la-description = Hai autorizzato l’accesso ai seguenti account.
la-unlink-button = Scollega
la-unlink-account-button = Scollega
la-set-password-button = Imposta password
la-unlink-heading = Scollega da account di terze parti
la-unlink-content-3 = Sei sicuro di voler scollegare il tuo account? Scollegando il tuo account non verrai disconnesso automaticamente dai servizi attualmente connessi. Per farlo dovrai disconnetterti manualmente dalla sezione Servizi connessi.
la-unlink-content-4 = Prima di scollegare il tuo account, devi impostare una password. Senza una password, non è più possibile accedere dopo aver scollegato il proprio account.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Chiudi
modal-cancel-button = Annulla
modal-default-confirm-button = Conferma

## ModalMfaProtected

modal-mfa-protected-title = Inserisci il codice di conferma
modal-mfa-protected-subtitle = Aiutaci a verificare che sia davvero tu a modificare le informazioni del tuo account
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Inserisci il codice che è stato inviato a <email>{ $email }</email> entro { $expirationTime } minuto.
       *[other] Inserisci il codice che è stato inviato a <email>{ $email }</email> entro { $expirationTime } minuti.
    }
modal-mfa-protected-input-label = Inserisci il codice a 6 cifre
modal-mfa-protected-cancel-button = Annulla
modal-mfa-protected-confirm-button = Conferma
modal-mfa-protected-code-expired = Codice scaduto?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Invia email con nuovo codice.

## Modal Verify Session

mvs-verify-your-email-2 = Conferma il tuo indirizzo email
mvs-enter-verification-code-2 = Inserisci il codice di conferma
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Inserisci entro 5 minuti il codice di conferma che è stato inviato a <email>{ $email }</email>.
msv-cancel-button = Annulla
msv-submit-button-2 = Conferma

## Settings Nav

nav-settings = Impostazioni
nav-profile = Profilo
nav-security = Sicurezza
nav-connected-services = Servizi connessi
nav-data-collection = Raccolta e utilizzo dati
nav-paid-subs = Abbonamenti a pagamento
nav-email-comm = Comunicazioni via email

## Page2faChange

page-2fa-change-title = Modifica l’autenticazione in due passaggi
page-2fa-change-success = L’autenticazione in due passaggi è stata aggiornata
page-2fa-change-success-additional-message = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui stai utilizzando questo account, quindi accedere nuovamente utilizzando la nuova autenticazione in due passaggi.
page-2fa-change-totpinfo-error = Si è verificato un errore durante la sostituzione dell’app per l’autenticazione in due passaggi. Riprova più tardi.
page-2fa-change-qr-instruction = <strong>Passaggio 1:</strong> scansiona questo codice QR utilizzando un’app di autenticazione, come Duo o Google Authenticator. Questa operazione crea una nuova connessione; tutte le connessioni esistenti smetteranno di funzionare.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Codici di autenticazione di backup
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Si è verificato un problema durante la sostituzione dei codici di autenticazione di backup
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Si è verificato un problema durante la generazione dei codici di autenticazione di backup
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Codici di autenticazione di backup aggiornati
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Codici di autenticazione di backup generati
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Conservali in un posto facile da ricordare. I codici precedenti verranno sostituiti al termine del passaggio successivo.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Conferma di aver salvato i codici inserendone uno. I precedenti codici di autenticazione di backup verranno disattivati al termine di questo passaggio.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Codice di autenticazione di backup errato

## Page2faSetup

page-2fa-setup-title = Autenticazione in due passaggi
page-2fa-setup-totpinfo-error = Si è verificato un errore durante la configurazione dell’autenticazione in due passaggi. Riprova più tardi.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Il codice non è corretto. Riprova.
page-2fa-setup-success = L’autenticazione in due passaggi è stata attivata
page-2fa-setup-success-additional-message = Per proteggere tutti i tuoi dispositivi connessi, devi disconnetterti da tutti i dispositivi in cui stai utilizzando questo account, quindi accedere nuovamente utilizzando l’autenticazione in due passaggi.

## Avatar change page

avatar-page-title =
    .title = Immagine del profilo
avatar-page-add-photo = Aggiungi un’immagine
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Scatta una foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Elimina immagine
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Scatta una nuova foto
avatar-page-cancel-button = Annulla
avatar-page-save-button = Salva
avatar-page-saving-button = Salvataggio in corso…
avatar-page-zoom-out-button =
    .title = Riduci zoom
avatar-page-zoom-in-button =
    .title = Aumenta zoom
avatar-page-rotate-button =
    .title = Ruota
avatar-page-camera-error = Impossibile inizializzare la fotocamera
avatar-page-new-avatar =
    .alt = nuova immagine del profilo
avatar-page-file-upload-error-3 = Si è verificato un problema durante il caricamento dell’immagine del profilo
avatar-page-delete-error-3 = Si è verificato un problema durante l’eliminazione dell’immagine del profilo
avatar-page-image-too-large-error-2 = Il file dell’immagine è troppo grande e non può essere caricato

## Password change page

pw-change-header =
    .title = Modifica password
pw-8-chars = Almeno 8 caratteri
pw-not-email = Non uguale al tuo indirizzo email
pw-change-must-match = La nuova password corrisponde alla conferma
pw-commonly-used = Non una password di uso comune
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Rimani al sicuro: non riutilizzare la stessa password in servizi diversi. Scopri altri suggerimenti per <linkExternal>generare password complesse</linkExternal>.
pw-change-cancel-button = Annulla
pw-change-save-button = Salva
pw-change-forgot-password-link = Password dimenticata?
pw-change-current-password =
    .label = Inserire la password attuale
pw-change-new-password =
    .label = Inserire una nuova password
pw-change-confirm-password =
    .label = Conferma la nuova password
pw-change-success-alert-2 = Password aggiornata

## Password create page

pw-create-header =
    .title = Creazione password
pw-create-success-alert-2 = Password impostata
pw-create-error-2 = Spiacenti, si è verificato un problema durante l’impostazione della password

## Delete account page

delete-account-header =
    .title = Elimina account
delete-account-step-1-2 = Passaggio 1 di 2
delete-account-step-2-2 = Passaggio 2 di 2
delete-account-confirm-title-4 = Potresti aver connesso il tuo { -product-mozilla-account } a uno o più dei seguenti prodotti o servizi { -brand-mozilla } che ti garantiscono un’esperienza sul Web sicura e produttiva:
delete-account-product-mozilla-account = { -product-mozilla-account(capitalization: "uppercase") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sincronizzazione dati in { -brand-firefox }
delete-account-product-firefox-addons = Componenti aggiuntivi in { -brand-firefox }
delete-account-acknowledge = Cancellando il tuo account riconosci che:
delete-account-chk-box-1-v4 =
    .label = Eventuali abbonamenti a pagamento saranno annullati
delete-account-chk-box-2 =
    .label = Potresti perdere alcuni dati e funzionalità che fanno parte dei prodotti { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Anche riattivando l’account con l’indirizzo email corrente, potrebbe non essere possibile ripristinare i dati salvati
delete-account-chk-box-4 =
    .label = Tutte le estensioni e i temi da te pubblicati su addons.mozilla.org verranno eliminati
delete-account-continue-button = Continua
delete-account-password-input =
    .label = Inserire la password
delete-account-cancel-button = Annulla
delete-account-delete-button-2 = Elimina

## Display name page

display-name-page-title =
    .title = Nome visualizzato
display-name-input =
    .label = Inserire il nome visualizzato
submit-display-name = Salva
cancel-display-name = Annulla
display-name-update-error-2 = Si è verificato un problema durante l’aggiornamento del nome visualizzato
display-name-success-alert-2 = Il nome visualizzato è stato aggiornato

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Attività recente dell”account
recent-activity-account-create-v2 = Account creato
recent-activity-account-disable-v2 = Account disattivato
recent-activity-account-enable-v2 = Account attivato
recent-activity-account-login-v2 = Accesso all’account iniziato
recent-activity-account-reset-v2 = Reimpostazione password iniziata
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Notifiche per mancato recapito delle email cancellate
recent-activity-account-login-failure = Tentativo di accesso all’account non riuscito
recent-activity-account-two-factor-added = Autenticazione in due passaggi attivata
recent-activity-account-two-factor-requested = Autenticazione in due passaggi richiesta
recent-activity-account-two-factor-failure = Autenticazione in due passaggi non riuscita
recent-activity-account-two-factor-success = Autenticazione in due passaggi completata correttamente
recent-activity-account-two-factor-removed = Autenticazione in due passaggi disattivata
recent-activity-account-password-reset-requested = Richiesta la reimpostazione della password per l’account
recent-activity-account-password-reset-success = Reimpostazione password dell’account completata correttamente
recent-activity-account-recovery-key-added = Chiave di recupero dell’account attivata
recent-activity-account-recovery-key-verification-failure = Verifica della chiave di recupero dell’account non riuscita
recent-activity-account-recovery-key-verification-success = Verifica della chiave di recupero dell’account completata correttamente
recent-activity-account-recovery-key-removed = Eliminata chiave di recupero dell’account
recent-activity-account-password-added = Nuova password aggiunta
recent-activity-account-password-changed = Password modificata
recent-activity-account-secondary-email-added = Indirizzo email secondario aggiunto
recent-activity-account-secondary-email-removed = Indirizzo email secondario rimosso
recent-activity-account-emails-swapped = Indirizzo email principale e secondario scambiati
recent-activity-session-destroy = Disconnesso dalla sessione
recent-activity-account-recovery-phone-send-code = Il codice è stato inviato al telefono per il recupero dell’account
recent-activity-account-recovery-phone-setup-complete = Configurazione del telefono per il recupero dell’account completata
recent-activity-account-recovery-phone-signin-complete = Completato accesso con telefono per il recupero dell’account
recent-activity-account-recovery-phone-signin-failed = Accesso con telefono per il recupero dell’account non riuscito
recent-activity-account-recovery-phone-removed = Il telefono per il recupero dell’account è stato rimosso
recent-activity-account-recovery-codes-replaced = Sostituiti codici di recupero
recent-activity-account-recovery-codes-created = Creati codici di recupero
recent-activity-account-recovery-codes-signin-complete = L’accesso è stato completato con i codici di recupero
recent-activity-password-reset-otp-sent = Inviato codice di conferma per reimpostare la password
recent-activity-password-reset-otp-verified = Verificato codice di conferma per reimpostare la password
recent-activity-must-reset-password = È richiesta la reimpostazione della password
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Altre attività dell’account

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Chiave di recupero dell’account
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Torna alle impostazioni

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Rimuovi telefono per il recupero dell’account
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Questo rimuoverà <strong>{ $formattedFullPhoneNumber }</strong> come telefono per il recupero dell’account.
settings-recovery-phone-remove-recommend = Ti consigliamo di mantenere questo metodo perché è più semplice rispetto al salvataggio dei codici di autenticazione di backup.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Se lo elimini, assicurati di avere ancora i codici di autenticazione di backup salvati. <linkExternal>Confronta i metodi di recupero</linkExternal>
settings-recovery-phone-remove-button = Rimuovi numero di telefono
settings-recovery-phone-remove-cancel = Annulla
settings-recovery-phone-remove-success = Il telefono per il recupero dell’account è stato rimosso

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Aggiungi telefono per il recupero dell’account
page-change-recovery-phone = Cambio il telefono per il recupero dell’account
page-setup-recovery-phone-back-button-title = Torna alle impostazioni
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Cambia numero di telefono

## Add secondary email page

add-secondary-email-step-1 = Passaggio 1 di 2
add-secondary-email-error-2 = Si è verificato un problema durante la creazione di questa email
add-secondary-email-page-title =
    .title = Email secondaria
add-secondary-email-enter-address =
    .label = Inserisci il tuo indirizzo email
add-secondary-email-cancel-button = Annulla
add-secondary-email-save-button = Salva
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Non è possibile utilizzare alias di posta elettronica come indirizzo email secondario.

## Verify secondary email page

add-secondary-email-step-2 = Passaggio 2 di 2
verify-secondary-email-page-title =
    .title = Email secondaria
verify-secondary-email-verification-code-2 =
    .label = Inserisci il codice di conferma
verify-secondary-email-cancel-button = Annulla
verify-secondary-email-verify-button-2 = Conferma
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Inserisci entro 5 minuti il codice di conferma che è stato inviato a <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Indirizzo { $email } aggiunto correttamente
verify-secondary-email-resend-code-button = Invia nuovamente il codice di conferma

##

# Link to delete account on main Settings page
delete-account-link = Elimina account
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Accesso effettuato correttamente. Il tuo { -product-mozilla-account } e i tuoi dati rimarranno attivi.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Scopri dove sono esposte le tue informazioni personali e riprendine il controllo
# Links out to the Monitor site
product-promo-monitor-cta = Ottieni una scansione gratuita

## Profile section

profile-heading = Profilo
profile-picture =
    .header = Immagine
profile-display-name =
    .header = Nome visualizzato
profile-primary-email =
    .header = Email principale

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Passaggio { $currentStep } di { $numberOfSteps }.

## Security section of Setting

security-heading = Sicurezza
security-password =
    .header = Password
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Data di creazione: { $date }
security-not-set = Non impostata
security-action-create = Crea
security-set-password = Imposta una password per sincronizzare e utilizzare specifiche funzioni di sicurezza dell’account.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Visualizza l’attività recente dell’account
signout-sync-header = Sessione scaduta
signout-sync-session-expired = Si è verificato un errore. Disconnettiti dal menu del browser e riprova.

## SubRow component

tfa-row-backup-codes-title = Codici di autenticazione di backup
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nessun codice disponibile
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } codice rimanente
       *[other] { $numCodesAvailable } codici rimanenti
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Crea nuovi codici
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Aggiungi
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Questo è il metodo di recupero più sicuro se non puoi utilizzare il tuo dispositivo mobile o l’app di autenticazione.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Telefono per il recupero dell’account
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nessun numero di telefono configurato
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Modifica
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Aggiungi
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Rimuovi
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Rimuovi telefono per il recupero dell’account
tfa-row-backup-phone-delete-restriction-v2 = Se desideri rimuovere il telefono per il recupero dell’account, aggiungi i codici di autenticazione di backup o disattiva l’autenticazione in due passaggi per evitare di rimanere bloccato fuori dal tuo account.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Questo è il metodo di recupero più semplice se non puoi utilizzare l’app di autenticazione.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Ulteriori informazioni sul rischio legato allo scambio di SIM (SIM swap)

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Disattiva
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Attiva
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Invio in corso…
switch-is-on = attivo
switch-is-off = disattivato

## Sub-section row Defaults

row-defaults-action-add = Aggiungi
row-defaults-action-change = Modifica
row-defaults-action-disable = Disattiva
row-defaults-status = Nessuno

## Account recovery key sub-section on main Settings page

rk-header-1 = Chiave di recupero dell’account
rk-enabled = Attiva
rk-not-set = Non impostato
rk-action-create = Crea
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Modifica
rk-action-remove = Rimuovi
rk-key-removed-2 = Eliminata chiave di recupero account
rk-cannot-remove-key = Non è possibile rimuovere la chiave di recupero dell’account.
rk-refresh-key-1 = Aggiorna la chiave di recupero dell’account
rk-content-explain = Ripristina i dati in caso di password dimenticata.
rk-cannot-verify-session-4 = Si è verificato un problema durante la conferma della sessione
rk-remove-modal-heading-1 = Rimuovere la chiave di recupero dell’account?
rk-remove-modal-content-1 = Se decidi di reimpostare la password, non potrai utilizzare la chiave di recupero dell’account per accedere ai tuoi dati. Questa azione è irreversibile.
rk-remove-error-2 = Non è possibile rimuovere la chiave di recupero dell’account.
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Elimina la chiave di recupero dell’account

## Secondary email sub-section on main Settings page

se-heading = Email secondaria
    .header = Email secondaria
se-cannot-refresh-email = Si è verificato un problema durante l’aggiornamento dell’email.
se-cannot-resend-code-3 = Si è verificato un problema durante il nuovo invio del codice di conferma
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } è ora la tua email principale
se-set-primary-error-2 = Si è verificato un problema durante la modifica dell’email principale
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } eliminata correttamente
se-delete-email-error-2 = Si è verificato un problema durante l’eliminazione dell’email
se-verify-session-3 = È necessario confermare la sessione in corso per effettuare questa operazione
se-verify-session-error-3 = Si è verificato un problema durante la conferma della sessione
# Button to remove the secondary email
se-remove-email =
    .title = Rimuovi l’email
# Button to refresh secondary email status
se-refresh-email =
    .title = Aggiorna l’email
se-unverified-2 = non confermato
se-resend-code-2 = Da confermare. <button>Invia di nuovo il codice di conferma</button> se non lo trovi nella casella di posta in arrivo o nello spam.
# Button to make secondary email the primary
se-make-primary = Rendi principale
se-default-content = Usala per accedere all’account se non riesci a effettuare l’accesso con l’email principale.
se-content-note-1 = Attenzione: non è possibile ripristinare i dati attraverso l’email secondaria. Per questa operazione è necessaria una <a>chiave di recupero dell’account</a>.
# Default value for the secondary email
se-secondary-email-none = Nessuna

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autenticazione in due passaggi
tfa-row-enabled = Attiva
tfa-row-disabled-status = Disattivata
tfa-row-action-add = Aggiungi
tfa-row-action-disable = Disattiva
tfa-row-action-change = Modifica
tfa-row-button-refresh =
    .title = Ripristina l’autenticazione in due passaggi
tfa-row-cannot-refresh = Si è verificato un problema durante l’aggiornamento dell’autenticazione in due passaggi.
tfa-row-enabled-description = Il tuo account è protetto dall’autenticazione in due passaggi. Quando accedi al tuo { -product-mozilla-account } dovrai inserire un codice monouso dall’app di autenticazione.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Come aiuta a proteggere il tuo account
tfa-row-disabled-description-v2 = Proteggi il tuo account utilizzando un’app di autenticazione di terze parti come secondo passaggio per accedere.
tfa-row-cannot-verify-session-4 = Si è verificato un problema durante la conferma della sessione
tfa-row-disable-modal-heading = Disattivare l’autenticazione in due passaggi?
tfa-row-disable-modal-confirm = Disattiva
tfa-row-disable-modal-explain-1 =
    Questa azione è irreversibile.
    In alternativa, puoi <linkExternal>sostituire i codici di autenticazione di backup</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Autenticazione in due passaggi disattivata
tfa-row-cannot-disable-2 = Impossibile disattivare l’autenticazione in due passaggi.
tfa-row-verify-session-info = È necessario confermare la sessione corrente per impostare l’autenticazione in due passaggi

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Proseguendo accetti:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Condizioni di utilizzo del servizio</mozSubscriptionTosLink> e <mozSubscriptionPrivacyLink>Informativa sulla privacy</mozSubscriptionPrivacyLink> dei servizi in abbonamento { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Termini di servizio</mozillaAccountsTos> e <mozillaAccountsPrivacy>informativa sulla privacy</mozillaAccountsPrivacy> degli { -product-mozilla-accounts }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Proseguendo accetti le <mozillaAccountsTos>condizioni di utilizzo del servizio</mozillaAccountsTos> e l’<mozillaAccountsPrivacy>informativa sulla privacy</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Oppure
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Accedi con
continue-with-google-button = Continua con { -brand-google }
continue-with-apple-button = Continua con { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Account sconosciuto
auth-error-103 = Password errata
auth-error-105-2 = Codice di conferma non valido
auth-error-110 = Token non valido
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Hai effettuato troppi tentativi. Riprova più tardi.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Hai effettuato troppi tentativi errati. Riprova { $retryAfter }.
auth-error-125 = La richiesta è stata bloccata per motivi di sicurezza
auth-error-129-2 = Hai inserito un numero di telefono non valido. Controlla e riprova.
auth-error-138-2 = Sessione non confermata
auth-error-139 = L’email secondaria deve essere diversa dall’email principale associata all’account
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Questo indirizzo email è già utilizzato da un altro account. Riprova più tardi o utilizza un altro indirizzo email.
auth-error-155 = Token TOTP non trovato
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Codice di autenticazione di backup non trovato
auth-error-159 = Chiave di recupero dell’account non valida
auth-error-183-2 = Codice di conferma non valido o scaduto
auth-error-202 = Caratteristica non attiva
auth-error-203 = Il sistema non è disponibile, riprova tra qualche secondo
auth-error-206 = Impossibile creare la password, la password è già stata impostata
auth-error-214 = Il telefono per il recupero dell’account è già presente
auth-error-215 = Il telefono per il recupero dell’account non esiste
auth-error-216 = È stato raggiunto il limite di messaggi di testo
auth-error-218 = Impossibile rimuovere il telefono per il recupero dell’account, codici di autenticazione di backup non presenti.
auth-error-219 = Questo numero di telefono è stato registrato con troppi account. Prova con un numero diverso.
auth-error-999 = Errore imprevisto
auth-error-1001 = Tentativo di accesso annullato
auth-error-1002 = La sessione è scaduta. Accedi per continuare.
auth-error-1003 = L’archiviazione locale o i cookie sono ancora disattivati
auth-error-1008 = La nuova password deve essere diversa
auth-error-1010 = È necessario inserire una password valida
auth-error-1011 = È necessario inserire un indirizzo email valido
auth-error-1018 = L’email di conferma è stata respinta. Verifica di aver digitato correttamente l’indirizzo email.
auth-error-1020 = Hai inserito l’email sbagliata? firefox.com non è un servizio di posta elettronica valido
auth-error-1031 = Per completare la registrazione devi inserire la tua età
auth-error-1032 = Per completare la registrazione inserire un’età valida
auth-error-1054 = Codice di autenticazione in due passaggi non valido
auth-error-1056 = Codice di autenticazione di backup non valido
auth-error-1062 = Reindirizzamento non valido
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Hai inserito l’email sbagliata? { $domain } non è un servizio di posta elettronica valido
auth-error-1066 = Non è possibile utilizzare alias di posta elettronica per creare un account.
auth-error-1067 = C’è un errore di battitura nell’indirizzo email?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Numero che termina con { $lastFourPhoneNumber }
oauth-error-1000 = Qualcosa è andato storto. Chiudi questa scheda e riprova.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Hai eseguito l’accesso a { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Indirizzo email confermato
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Accesso confermato
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Accedi a questo { -brand-firefox } per completare la configurazione
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Accedi
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Vuoi aggiungere altri dispositivi? Per completare la configurazione accedi a { -brand-firefox } su un altro dispositivo
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Accedi a { -brand-firefox } su un altro dispositivo per completare la configurazione
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Vuoi avere a disposizione schede, segnalibri e password su un altro dispositivo?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Connetti un altro dispositivo
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Non adesso
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Per completare la configurazione accedi a { -brand-firefox } per Android
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Per completare la configurazione accedi a { -brand-firefox } per iOS

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = È necessario attivare archiviazione locale e cookie
cookies-disabled-enable-prompt-2 = Attiva i cookie e l’archiviazione locale nel browser per accedere all’{ -product-mozilla-account }. In questo modo verranno attivate funzioni come la memorizzazione dell’utente tra una sessione e l’altra.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Riprova
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Ulteriori informazioni

## Index / home page

index-header = Inserisci la tua email
index-sync-header = Passa al tuo { -product-mozilla-account }
index-sync-subheader = Sincronizza password, schede e segnalibri ovunque utilizzi { -brand-firefox }.
index-relay-header = Crea un alias di posta elettronica
index-relay-subheader = Fornisci l’indirizzo email a cui desideri inoltrare le email dal tuo alias di posta elettronica.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Continua su { $serviceName }
index-subheader-default = Passa alle impostazioni dell’account
index-cta = Registrati o accedi
index-account-info = Un { -product-mozilla-account } consente inoltre di accedere ad altri prodotti { -brand-mozilla } per la protezione della privacy.
index-email-input =
    .label = Inserisci la tua email
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = L’account è stato correttamente eliminato
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = L’email di conferma è stata respinta. Verifica di aver digitato correttamente l’indirizzo email.

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Oops! Impossibile creare la chiave di recupero dell’account. Riprova più tardi.
inline-recovery-key-setup-recovery-created = La chiave di recupero dell’account è stata generata
inline-recovery-key-setup-download-header = Proteggi il tuo account
inline-recovery-key-setup-download-subheader = Scaricala e salvala adesso
inline-recovery-key-setup-download-info = Conserva questa chiave in un posto facile da ricordare: non potrai tornare a questa pagina più tardi.
inline-recovery-key-setup-hint-header = Raccomandazione di sicurezza

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Annulla configurazione
inline-totp-setup-continue-button = Continua
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Aggiungi un livello di sicurezza al tuo account richiedendo i codici di autenticazione da una di <authenticationAppsLink>queste app di autenticazione</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Attiva l’autenticazione in due passaggi <span>per continuare con le impostazioni dell’account</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Attiva l’autenticazione in due passaggi <span>per continuare su { $serviceName }</span>
inline-totp-setup-ready-button = Pronto
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scansiona il codice di autenticazione <span>per continuare su { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Inserisci il codice manualmente <span>per continuare su { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scansiona il codice di autenticazione <span>per continuare con le impostazioni dell’account</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Inserisci il codice manualmente <span>per continuare con le impostazioni dell’account</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Digita questa chiave segreta nell’app di autenticazione. <toggleToQRButton>Oppure preferisci fare la scansione del codice QR?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scansiona il codice QR nell’app di autenticazione e inserisci il codice fornito. <toggleToManualModeButton>Non è possibile eseguire la scansione del codice?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Una volta completato, inizierà a generare codici di autenticazione da inserire.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Codice di autenticazione
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Codice di autenticazione richiesto
tfa-qr-code-alt = Utilizza il codice { $code } per impostare l’autenticazione in due passaggi nelle applicazioni supportate.
inline-totp-setup-page-title = Autenticazione in due passaggi

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Note legali
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Condizioni di utilizzo del servizio
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Informativa sulla privacy

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Informativa sulla privacy

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Condizioni di utilizzo del servizio

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Hai appena effettuato l’accesso a { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Sì, approva il dispositivo
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Se questa operazione non è stata eseguita da te, <link>cambia la password</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Dispositivo connesso
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Ora stai sincronizzando con: { $deviceFamily } su { $deviceOS }
pair-auth-complete-sync-benefits-text = Ora puoi accedere alle schede aperte, alle password e ai segnalibri su tutti i tuoi dispositivi.
pair-auth-complete-see-tabs-button = Visualizza schede da altri dispositivi sincronizzati
pair-auth-complete-manage-devices-link = Gestisci dispositivi

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Inserisci il codice di autenticazione <span>per continuare con le impostazioni dell’account</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Inserisci il codice di autenticazione <span>per continuare su { $serviceName }</span>
auth-totp-instruction = Apri l’app di autenticazione e inserisci il codice di autenticazione ottenuto.
auth-totp-input-label = Inserisci il codice a 6 cifre
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Conferma
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Codice di autenticazione richiesto

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = È ora richiesta l’approvazione <span>dall’altro dispositivo</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Associazione non riuscita
pair-failure-message = Processo di installazione interrotto.

## Pair index page

pair-sync-header = Sincronizza { -brand-firefox } sul tuo telefono o tablet
pair-cad-header = Connetti { -brand-firefox } su un altro dispositivo
pair-already-have-firefox-paragraph = Utilizzi già { -brand-firefox } su un telefono o tablet?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sincronizza il tuo dispositivo
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Oppure scaricalo
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scansiona per scaricare { -brand-firefox } per dispositivi mobili oppure invia un <linkExternal>link per il download</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Non adesso
pair-take-your-data-message = Porta con te schede, segnalibri e password ovunque utilizzi { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Inizia
# This is the aria label on the QR code image
pair-qr-code-aria-label = Codice QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Dispositivo connesso
pair-success-message-2 = Associazione completata.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Conferma associazione <span>per { $email }</span>
pair-supp-allow-confirm-button = Conferma associazione
pair-supp-allow-cancel-link = Annulla

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = È ora richiesta l’approvazione <span>dall’altro dispositivo</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Associa utilizzando un’app
pair-unsupported-message = Hai utilizzato la fotocamera di sistema? Bisogna effettuare l’associazione da un’app { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Crea una password per sincronizzare
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Questa operazione critta i tuoi dati. Deve essere diversa dalla password del tuo account { -brand-google } o { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Attendere, si sta per essere reindirizzati all’applicazione autorizzata.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Inserisci la chiave di recupero dell’account
account-recovery-confirm-key-instruction = Questa chiave ti permette di recuperare i dati di navigazione crittati, come password e segnalibri, dai server di { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Inserisci la chiave di recupero dell’account di 32 caratteri
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Il tuo suggerimento per l’archiviazione è:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Continua
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Non riesci a trovare la chiave di recupero dell’account?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Crea una nuova password
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Password impostata
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Si è verificato un problema durante l’impostazione della password
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Utilizza la chiave di recupero dell’account
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = La password è stata reimpostata.
reset-password-complete-banner-message = Non dimenticare di generare una nuova chiave di recupero dell’account dalle impostazioni del tuo { -product-mozilla-account } per evitare problemi di accesso in futuro.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Inserire il codice di 10 caratteri
confirm-backup-code-reset-password-confirm-button = Conferma
confirm-backup-code-reset-password-subheader = Digita il codice di autenticazione di backup
confirm-backup-code-reset-password-instruction = Inserisci uno dei codici monouso salvati durante la configurazione dell’autenticazione in due passaggi.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Sei rimasto bloccato fuori dal tuo account?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Controlla la tua email
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Abbiamo inviato un codice di conferma a <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Inserire il codice di 8 cifre entro 10 minuti
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Continua
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Invia di nuovo il codice
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Utilizza un altro account

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Reimpostazione della password
confirm-totp-reset-password-subheader-v2 = Inserire il codice di autenticazione in due passaggi
confirm-totp-reset-password-instruction-v2 = Controlla l’<strong>app di autenticazione</strong> per reimpostare la password.
confirm-totp-reset-password-trouble-code = Problemi a inserire il codice?
confirm-totp-reset-password-confirm-button = Conferma
confirm-totp-reset-password-input-label-v2 = Inserire il codice a 6 cifre
confirm-totp-reset-password-use-different-account = Utilizza un altro account

## ResetPassword start page

password-reset-flow-heading = Reimpostazione della password
password-reset-body-2 = Per mantenere il tuo account al sicuro, ti chiederemo alcune informazioni che solo tu conosci.
password-reset-email-input =
    .label = Inserisci la tua email
password-reset-submit-button-2 = Continua

## ResetPasswordConfirmed

reset-password-complete-header = La password è stata reimpostata
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Continua su { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Reimpostazione della password
password-reset-recovery-method-subheader = Scegli un metodo di recupero
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Verifichiamo che sia davvero tu a utilizzare i metodi di recupero.
password-reset-recovery-method-phone = Telefono per il recupero dell’account
password-reset-recovery-method-code = Codici di autenticazione di backup
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } codice rimanente
       *[other] { $numBackupCodes } codici rimanenti
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Si è verificato un problema durante l’invio del codice al telefono per il recupero dell’account
password-reset-recovery-method-send-code-error-description = Riprova più tardi o utilizza i codici di autenticazione di backup.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Reimpostazione della password
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Inserisci il codice di recupero
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = È stato inviato un codice di 6 cifre al numero di telefono che termina con <span>{ $lastFourPhoneDigits }</span> tramite SMS. Questo codice scade dopo 5 minuti. Non condividere questo codice con nessuno.
reset-password-recovery-phone-input-label = Inserisci il codice a 6 cifre
reset-password-recovery-phone-code-submit-button = Conferma
reset-password-recovery-phone-resend-code-button = Invia di nuovo il codice
reset-password-recovery-phone-resend-success = Codice inviato
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Sei rimasto bloccato fuori dal tuo account?
reset-password-recovery-phone-send-code-error-heading = Si è verificato un problema durante l’invio del codice
reset-password-recovery-phone-code-verification-error-heading = Si è verificato un problema durante la verifica del codice
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Riprovare più tardi.
reset-password-recovery-phone-invalid-code-error-description = Il codice non è valido o è scaduto.
reset-password-recovery-phone-invalid-code-error-link = Utilizzare invece i codici di autenticazione di backup?
reset-password-with-recovery-key-verified-page-title = Password reimpostata correttamente
reset-password-complete-new-password-saved = Nuova password salvata.
reset-password-complete-recovery-key-created = È stata creata una nuova chiave di recupero dell’account. Scaricala e salvala subito.
reset-password-complete-recovery-key-download-info = Questa chiave è essenziale per il recupero dei dati se si dimentica la password. <b>Scaricala subito e salvala in modo sicuro, in quanto non potrai più accedere a questa pagina in seguito.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Errore:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Convalida accesso…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Errore nella conferma
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Il link di conferma è scaduto
signin-link-expired-message-2 = Il link su cui hai fatto clic è scaduto o è già stato utilizzato.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Inserisci la password <span>per il tuo { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Continua su { $serviceName }
signin-subheader-without-logo-default = Passa alle impostazioni dell’account
signin-button = Accedi
signin-header = Accedi
signin-use-a-different-account-link = Utilizza un altro account
signin-forgot-password-link = Password dimenticata?
signin-password-button-label = Password
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.
signin-code-expired-error = Codice scaduto. Effettua nuovamente l’accesso.
signin-account-locked-banner-heading = Reimpostazione della password
signin-account-locked-banner-description = Abbiamo bloccato il tuo account per proteggerlo da attività sospette.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Reimposta la password per accedere

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Nel link su cui hai fatto clic mancano alcuni caratteri, probabilmente è un problema causato dal client di posta elettronica. Riprova assicurandoti di selezionare e copiare con cura il link.
report-signin-header = Vuoi segnalare questo accesso non autorizzato?
report-signin-body = Hai ricevuto un’email relativa a un tentativo di accesso al tuo account. Vuoi segnalare questa attività come sospetta?
report-signin-submit-button = Segnala attività sospetta
report-signin-support-link = Che cosa sta succedendo?
report-signin-error = Siamo spiacenti, si è verificato un problema durante l’invio della segnalazione.
signin-bounced-header = Spiacenti, l’account è stato bloccato.
# $email (string) - The user's email.
signin-bounced-message = L’email di conferma che abbiamo inviato all’indirizzo { $email } è tornata indietro. L’account è stato bloccato per proteggere i dati in { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Se questo è un indirizzo email valido, <linkExternal>contattaci</linkExternal> e ti aiuteremo a sbloccare il tuo account.
signin-bounced-create-new-account = Non controlli più questo indirizzo email? Crea un nuovo account
back = Indietro

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Verifica queste credenziali <span>per passare alle impostazioni dell’account</span>
signin-push-code-heading-w-custom-service = Verifica questo accesso <span>per continuare su { $serviceName }</span>
signin-push-code-instruction = Controlla gli altri dispositivi e approva questo accesso dal browser { -brand-firefox }.
signin-push-code-did-not-recieve = Non hai ricevuto la notifica?
signin-push-code-send-email-link = Invia codice per email

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Conferma il tuo accesso
signin-push-code-confirm-description = È stato rilevato un tentativo di accesso dal seguente dispositivo. Se sei stato tu, conferma l’accesso
signin-push-code-confirm-verifying = Verifica in corso
signin-push-code-confirm-login = Conferma l’accesso
signin-push-code-confirm-wasnt-me = Non sono stato io, cambia la password.
signin-push-code-confirm-login-approved = Il tuo accesso è stato approvato. Chiudi questa finestra.
signin-push-code-confirm-link-error = Il link è danneggiato. Riprova.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Accedi
signin-recovery-method-subheader = Scegli un metodo di recupero
signin-recovery-method-details = Verifichiamo che sia davvero tu a utilizzare i metodi di recupero.
signin-recovery-method-phone = Telefono per il recupero dell’account
signin-recovery-method-code-v2 = Codici di autenticazione di backup
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } codice rimanente
       *[other] { $numBackupCodes } codici rimanenti
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Si è verificato un problema durante l’invio del codice al telefono per il recupero dell’account
signin-recovery-method-send-code-error-description = Riprova più tardi o utilizza i codici di autenticazione di backup.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Accedi
signin-recovery-code-sub-heading = Digita il codice di autenticazione di backup
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Inserisci uno dei codici monouso salvati durante la configurazione dell’autenticazione in due passaggi.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Inserire il codice di 10 caratteri
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Conferma
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Utilizza il telefono per il recupero dell’account
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Sei rimasto bloccato fuori dal tuo account?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = È necessario inserire il codice di autenticazione di backup
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Si è verificato un problema durante l’invio del codice al telefono per il recupero dell’account
signin-recovery-code-use-phone-failure-description = Riprova più tardi.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Accedi
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Inserisci il codice di recupero
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = È stato inviato un codice di sei cifre al numero di telefono che termina con <span>{ $lastFourPhoneDigits }</span> tramite SMS. Questo codice scade dopo 5 minuti. Non condividere questo codice con nessuno.
signin-recovery-phone-input-label = Inserisci il codice a 6 cifre
signin-recovery-phone-code-submit-button = Conferma
signin-recovery-phone-resend-code-button = Invia di nuovo il codice
signin-recovery-phone-resend-success = Codice inviato
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Sei rimasto bloccato fuori dal tuo account?
signin-recovery-phone-send-code-error-heading = Si è verificato un problema durante l’invio del codice
signin-recovery-phone-code-verification-error-heading = Si è verificato un problema durante la verifica del codice
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Riprova più tardi.
signin-recovery-phone-invalid-code-error-description = Il codice non è valido o è scaduto.
signin-recovery-phone-invalid-code-error-link = Utilizzare invece i codici di autenticazione di backup?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Accesso effettuato correttamente. Se utilizzi nuovamente il tuo telefono per il recupero dell’account, potrebbero essere applicati dei limiti.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Grazie per la tua attenzione
signin-reported-message = Il nostro team ha ricevuto la segnalazione. La tua collaborazione ci aiuta a tenere alla larga gli intrusi.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Inserisci il codice di conferma<span> per il tuo { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Inserisci entro 5 minuti il codice che è stato inviato a <email>{ $email }</email>.
signin-token-code-input-label-v2 = Inserisci il codice a 6 cifre
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Conferma
signin-token-code-code-expired = Codice scaduto?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Invia email con nuovo codice.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Codice di conferma obbligatorio
signin-token-code-resend-error = Si è verificato un problema. Impossibile inviare un nuovo codice.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Accedi
signin-totp-code-subheader-v2 = Inserire il codice di autenticazione in due passaggi
signin-totp-code-instruction-v4 = Controlla l’<strong>app di autenticazione</strong> per confermare l’accesso.
signin-totp-code-input-label-v4 = Inserire il codice a 6 cifre
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Perché ti viene chiesto di autenticarti?
signin-totp-code-aal-banner-content = Hai configurato l’autenticazione in due passaggi per il tuo account, ma non hai ancora effettuato l’accesso con un codice su questo dispositivo.
signin-totp-code-aal-sign-out = Disconnettersi su questo dispositivo
signin-totp-code-aal-sign-out-error = Si è verificato un problema durante la disconnessione
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Conferma
signin-totp-code-other-account-link = Utilizza un altro account
signin-totp-code-recovery-code-link = Problemi a inserire il codice?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Codice di autenticazione richiesto
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autorizza questo accesso
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Controlla la tua casella di posta: il codice di autorizzazione è stato inviato a { $email }.
signin-unblock-code-input = Digita il codice di autorizzazione
signin-unblock-submit-button = Continua
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = È necessario inserire il codice di autorizzazione
signin-unblock-code-incorrect-length = Il codice di autorizzazione deve contenere 8 caratteri
signin-unblock-code-incorrect-format-2 = Il codice di autorizzazione può contenere solo lettere e/o numeri
signin-unblock-resend-code-button = Il messaggio non si trova nella posta in arrivo e neppure nello spam? Invia nuovamente il link
signin-unblock-support-link = Che cosa sta succedendo?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Inserisci il codice di conferma
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Inserisci il codice di conferma <span>per il tuo { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Inserisci entro 5 minuti il codice che è stato inviato a <email>{ $email }</email>.
confirm-signup-code-input-label = Inserisci il codice a 6 cifre
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Conferma
confirm-signup-code-sync-button = Avvia la sincronizzazione
confirm-signup-code-code-expired = Codice scaduto?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Invia email con nuovo codice.
confirm-signup-code-success-alert = L’account è stato confermato correttamente
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Codice di conferma obbligatorio
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = Dopo aver effettuato l’accesso, { -brand-firefox } tenterà di rimandarti alla pagina per utilizzare l’alias di posta elettronica.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Crea una password
signup-relay-info = È necessaria una password per gestire in modo sicuro i tuoi alias di posta elettronica e accedere agli strumenti di sicurezza di { -brand-mozilla }.
signup-sync-info = Sincronizza password, segnalibri e altro ancora ovunque utilizzi { -brand-firefox }.
signup-sync-info-with-payment = Sincronizza password, metodi di pagamento, segnalibri e altro ancora ovunque utilizzi { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Cambia e-mail

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = La sincronizzazione è attiva
signup-confirmed-sync-success-banner = { -product-mozilla-account } confermato
signup-confirmed-sync-button = Inizia a navigare
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Password, metodi di pagamento, indirizzi, segnalibri, cronologia e altro ancora possono essere sincronizzati ovunque utilizzi { -brand-firefox }.
signup-confirmed-sync-description-v2 = Password, indirizzi, segnalibri, cronologia e altro ancora possono essere sincronizzati ovunque utilizzi { -brand-firefox }.
signup-confirmed-sync-add-device-link = Aggiungi un altro dispositivo
signup-confirmed-sync-manage-sync-button = Gestisci sincronizzazione
signup-confirmed-sync-set-password-success-banner = Password di sincronizzazione creata
