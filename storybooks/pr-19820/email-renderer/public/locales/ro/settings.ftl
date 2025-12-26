# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Ți-am trimis un cod nou pe adresa ta de e-mail.
resend-link-success-banner-heading = Ți-am trimis un link nou pe adresa ta de e-mail.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Adaugă { $accountsEmail } la contacte ca să te asiguri de o livrare fără probleme.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Închide bannerul
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } va fi redenumit { -product-mozilla-accounts } începând cu 1 nov
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Te vei autentifica în cont cu același nume de utilizator și aceeași parolă și nu mai sunt alte modificări aduse produselor pe care le utilizezi.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Am redenumit { -product-firefox-accounts } cu { -product-mozilla-accounts }. Te vei autentifica în continuare în cont cu același nume de utilizator și aceeași adresă și nu mai sunt alte modificări aduse produselor pe care le utilizezi.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Află mai multe
# Alt text for close banner image
brand-close-banner =
    .alt = Închide bannerul
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo { -brand-mozilla } m

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Înapoi
button-back-title = Înapoi

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Descarcă și continuă
    .title = Descarcă și continuă
recovery-key-pdf-heading = Cheie de recuperare a contului
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Generată la: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Cheie de recuperare a contului
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Această cheie îți permite să îți recuperezi datele criptate din browser (inclusiv parole, marcaje și istoric) în cazul în care îți uiți parola. Păstreaz-o într-un loc de care îți aduci aminte.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Unde să-ți păstrezi cheia
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Află mai multe despre cheia ta de recuperare a contului
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Ne pare rău, a apărut o problemă la descărcarea cheii tale de recuperare a contului

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Obține mai multe de la { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Obține cele mai recente știri și actualizări de produse
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Acces timpuriu pentru a testa produse noi
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Alerte de acțiune pentru revendicarea internetului

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Descărcat
datablock-copy =
    .message = Copiat
datablock-print =
    .message = Printat

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Cod copiat
       *[other] Coduri copiate
    }
datablock-download-success =
    { $count ->
        [one] Cod descărcat
       *[other] Coduri descărcate
    }
datablock-print-success =
    { $count ->
        [one] Cod printat
       *[other] Coduri printate
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copiat

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimate)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (estimate)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (estimate)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (estimată)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Locație necunoscută
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } pe { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Adresă IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Parolă
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Repetă parola
form-password-with-inline-criteria-signup-submit-button = Creează un cont
form-password-with-inline-criteria-reset-new-password =
    .label = Parolă nouă
form-password-with-inline-criteria-confirm-password =
    .label = Confirmă parola
form-password-with-inline-criteria-reset-submit-button = Creează o parolă nouă
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Parolă
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Repetă parola
form-password-with-inline-criteria-set-password-submit-button = Începe sincronizarea
form-password-with-inline-criteria-match-error = Parolele nu se potrivesc
form-password-with-inline-criteria-sr-too-short-message = Parola trebuie să aibă cel puțin 8 caractere.
form-password-with-inline-criteria-sr-not-email-message = Parola nu trebuie să conțină adresa ta de e-mail.
form-password-with-inline-criteria-sr-not-common-message = Parola nu trebuie să fie o parolă utilizată în mod obișnuit.
form-password-with-inline-criteria-sr-requirements-met = Parola introdusă respectă toate cerințele pentru parole.
form-password-with-inline-criteria-sr-passwords-match = Parolele introduse se potrivesc.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Câmp obligatoriu

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Introdu codul de { $codeLength } cifre pentru a continua
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Introdu codul de { $codeLength } caractere pentru a continua

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Cheie de recuperare a contului { -brand-firefox }
get-data-trio-title-backup-verification-codes = Coduri de autentificare de rezervă
get-data-trio-download-2 =
    .title = Descarcă
    .aria-label = Descarcă
get-data-trio-copy-2 =
    .title = Copiază
    .aria-label = Copiază
get-data-trio-print-2 =
    .title = Printează
    .aria-label = Printează

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Alertă
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Atenție
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Avertisment
authenticator-app-aria-label =
    .aria-label = Aplicație de autentificare
backup-codes-icon-aria-label-v2 =
    .aria-label = Coduri de rezervă de autentificare activate
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Coduri de rezervă de autentificare dezactivate
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS de recuperare activat
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS de recuperare dezactivat
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Drapelul canadian
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Bifează
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Succes
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Activat
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Închide mesajul
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Cod
error-icon-aria-label =
    .aria-label = Eroare
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informații
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Steagul Statelor Unite

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Un calculator și un telefon mobil și o imagine a unei inimi frânte pe fiecare
hearts-verified-image-aria-label =
    .aria-label = Un calculator, un telefon mobil și o tabletă cu câte o inimă pulsând pe fiecare
signin-recovery-code-image-description =
    .aria-label = Document care conține text ascuns.
signin-totp-code-image-label =
    .aria-label = Un dispozitiv cu un cod ascuns de 6 cifre.
confirm-signup-aria-label =
    .aria-label = Un plic care conține un link
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustrație care reprezintă o cheie de recuperare a contului.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustrație care reprezintă o cheie de recuperare a contului.
password-image-aria-label =
    .aria-label = O ilustrație care reprezintă tastarea unei parole.
lightbulb-aria-label =
    .aria-label = Ilustrație care reprezintă crearea unui indiciu de stocare.
email-code-image-aria-label =
    .aria-label = Ilustrație care reprezintă un e-mail care conține un cod.
recovery-phone-image-description =
    .aria-label = Dispozitiv mobil care primește un cod prin mesaj text.
recovery-phone-code-image-description =
    .aria-label = Cod primit pe un dispozitiv mobil.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispozitiv mobil cu funcții de trimitere mesaje text SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Ecranul dispozitivului cu coduri
sync-clouds-image-aria-label =
    .aria-label = Nori cu o pictogramă de sincronizare
confetti-falling-image-aria-label =
    .aria-label = Confeti animate care cad

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Ești autentificat(ă) în { -brand-firefox }.
inline-recovery-key-setup-create-header = Securizează-ți contul
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Ai un minut să-ți protejezi datele?
inline-recovery-key-setup-info = Creează o cheie de recuperare a contului pentru a-ți restaura datele de navigare sincronizate dacă uiți parola.
inline-recovery-key-setup-start-button = Creează o cheie de recuperare a contului
inline-recovery-key-setup-later-button = Fă-o mai târziu

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Ascunde parola
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Afișează parola
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Parola ta este vizibilă acum pe ecran.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Parola ta este ascunsă acum.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Parola ta este vizibilă acum pe ecran.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Parola ta este ascunsă acum.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Selectează țara
input-phone-number-enter-number = Introdu numărul de telefon
input-phone-number-country-united-states = Statele Unite
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Înapoi

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Link de resetare a parolei corupt
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Link de confirmare corupt
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Link corupt
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Linkul pe care ai dat clic avea caractere lipsă și este posibil să fi fost corupt de către clientul de e-mail. Copiază adresa cu grijă și încearcă din nou.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Primește un link nou

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Îți amintești parola?
# link navigates to the sign in page
remember-password-signin-link = Intră în cont

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Adresă de e-mail primară deja confirmată
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Autentificare deja confirmată
confirmation-link-reused-message = Linkul de confirmare a fost deja folosit și nu poate fi reutilizat.

## Locale Toggle Component

locale-toggle-select-label = Selectează limba
locale-toggle-browser-default = Implicit în browser
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Cerere nereușită

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Ai nevoie de această parolă pentru a accesa orice date criptate pe care le stochezi la noi.
password-info-balloon-reset-risk-info = O resetare înseamnă pierderea potențială a unor date precum parole și marcaje.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Alege o parolă puternică pe care nu ai mai folosit-o pe alte site-uri. Asigură-te că îndeplinește cerințele de securitate:
password-strength-short-instruction = Alege o parolă puternică:
password-strength-inline-min-length = Cel puțin 8 caractere
password-strength-inline-not-email = Nu adresa ta de e-mail
password-strength-inline-not-common = Nu o parolă utilizată frecvent
password-strength-inline-confirmed-must-match = Confirmarea corespunde cu noua parolă
password-strength-inline-passwords-match = Parolele se potrivesc

## Notification Promo Banner component

account-recovery-notification-cta = Creează
account-recovery-notification-header-value = Nu-ți pierde datele dacă uiți parola
account-recovery-notification-header-description = Creează o cheie de recuperare a contului pentru a-ți restaura datele de navigare sincronizate dacă uiți parola.
recovery-phone-promo-cta = Adaugă un număr de telefon de recuperare
recovery-phone-promo-heading = Adaugă protecție suplimentară contului tău cu un număr de telefon de recuperare
recovery-phone-promo-description = Acum te poți autentifica cu o parolă de unică folosință prin SMS dacă nu poți folosi aplicația de autentificare în doi pași.
recovery-phone-promo-info-link = Află mai multe despre recuperare și riscul de schimbare a cartelei SIM
promo-banner-dismiss-button =
    .aria-label = Închide bannerul

## Ready component

ready-complete-set-up-instruction = Finalizează configurarea prin introducerea noii parole pe celelalte dispozitive { -brand-firefox }.
manage-your-account-button = Gestionează-ți contul
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Acum ești gata să utilizezi { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Acum ești gata să utilizezi setările contului
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Contul tău este gata!
ready-continue = Continuă
sign-in-complete-header = Autentificare confirmată
sign-up-complete-header = Cont confirmat
primary-email-verified-header = Adresă de e-mail primară confirmată

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Locuri unde poți păstra cheia:
flow-recovery-key-download-storage-ideas-folder-v2 = Dosar pe dispozitiv securizat
flow-recovery-key-download-storage-ideas-cloud = Stocare de încredere în cloud
flow-recovery-key-download-storage-ideas-print-v2 = Copie fizică scoasă la imprimantă
flow-recovery-key-download-storage-ideas-pwd-manager = Manager de parole

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Adaugă un indiciu pentru a te ajuta să-ți găsești cheia
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Indiciul ar trebui să te ajute să-ți amintești unde ai stocat cheia de recuperare a contului. Ți-l putem arăta în timpul resetării parolei pentru a-ți recupera datele.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Introdu un indiciu (opțional)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Finalizează
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Indiciul trebuie să conțină mai puțin de 255 de caractere.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Indiciul nu poate conține caractere Unicode nesigure. Sunt permise doar litere, cifre, semne de punctuație și simboluri.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Avertisment
password-reset-chevron-expanded = Restrânge avertismentul
password-reset-chevron-collapsed = Extinde avertismentul
password-reset-data-may-not-be-recovered = Este posibil să nu se poată recupera datele din browser
password-reset-previously-signed-in-device-2 = Ai vreun dispozitiv pe care te-ai conectat anterior?
password-reset-data-may-be-saved-locally-2 = Este posibil să ai datele din browser salvate pe dispozitivul respectiv. Resetează-ți parola, apoi intră în cont pe dispozitiv ca să îți restaurezi și să îți sincronizezi datele.
password-reset-no-old-device-2 = Ai un dispozitiv nou, dar nu ai acces la niciunul dintre cele anterioare?
password-reset-encrypted-data-cannot-be-recovered-2 = Ne pare rău, dar datele criptate ale browserului tău nu pot fi recuperate de pe serverele { -brand-firefox }.
password-reset-warning-have-key = Ai o cheie de recuperare a contului?
password-reset-warning-use-key-link = Folosește-o acum ca să resetezi parola și să-ți păstrezi datele

## Alert Bar

alert-bar-close-message = Închide mesajul

## User's avatar

avatar-your-avatar =
    .alt = Avatarul tău
avatar-default-avatar =
    .alt = Avatar implicit

##


# BentoMenu component

bento-menu-title-3 = Produse { -brand-mozilla }
bento-menu-tagline = Mai multe produse de la { -brand-mozilla } care îți protejează confidențialitatea
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Browserul { -brand-firefox } pentru desktop
bento-menu-firefox-mobile = Browserul { -brand-firefox } pentru dispozitiv mobil
bento-menu-made-by-mozilla = Realizat de { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Obține { -brand-firefox } pe dispozitivul mobil sau tabletă
connect-another-find-fx-mobile-2 = Caută { -brand-firefox } în { -google-play } și { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Descarcă { -brand-firefox } din { -google-play }
connect-another-app-store-image-3 =
    .alt = Descarcă { -brand-firefox } din { -app-store }

## Connected services section

cs-heading = Servicii conectate
cs-description = Tot ce folosești și în care ești autentificat.
cs-cannot-refresh =
    Ne pare rău, a apărut o problemă la actualizarea listei de servicii
    conectate.
cs-cannot-disconnect = Clientul nu a fost găsit, imposibil de deconectat
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Deconectat de la { $service }
cs-refresh-button =
    .title = Reîmprospătează serviciile conectate
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Obiecte lipsă sau duplicate?
cs-disconnect-sync-heading = Deconectare de la Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Datele de navigare vor rămâne pe <span>{ $device }</span>, 
    însă nu se vor mai sincroniza cu contul tău.
cs-disconnect-sync-reason-3 = Care este principalul motiv pentru deconectarea <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Dispozitivul este:
cs-disconnect-sync-opt-suspicious = Suspect
cs-disconnect-sync-opt-lost = Pierdut sau furat
cs-disconnect-sync-opt-old = Vechi sau înlocuit
cs-disconnect-sync-opt-duplicate = Duplicat
cs-disconnect-sync-opt-not-say = Prefer să nu spun

##

cs-disconnect-advice-confirm = OK, am înțeles
cs-disconnect-lost-advice-heading = Dispozitiv pierdut sau furat deconectat
cs-disconnect-lost-advice-content-3 = Întrucât dispozitivul a fost pierdut sau furat, pentru a-ți păstra informațiile în siguranță, ar trebui să schimbi parola { -product-mozilla-account } în setările contului. De asemenea, ar trebui să cauți informații de la producătorul dispozitivului despre ștergerea datelor de la distanță.
cs-disconnect-suspicious-advice-heading = Dispozitiv suspect deconectat
cs-disconnect-suspicious-advice-content-2 = Dacă dispozitivul deconectat este într-adevăr suspect, pentru a-ți păstra în siguranță informațiile, ar trebui să îți schimbi parola { -product-mozilla-account } în setările contului. Ar trebui să schimbi și orice alte parole pe care le-ai salvat în { -brand-firefox } tastând about:logins în bara de adrese.
cs-sign-out-button = Ieși din cont

## Data collection section

dc-heading = Colectarea și utilizarea datelor
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Browser { -brand-firefox }
dc-subheader-content-2 = Permite ca { -product-mozilla-accounts } să trimită informații tehnice și de interacțiune către { -brand-mozilla }.
dc-subheader-ff-content = Pentru revizuirea sau actualizarea setărilor tehnice și de interacțiune ale browserului { -brand-firefox }, deschide setările { -brand-firefox } și mergi la Confidențialitate și securitate.
dc-opt-out-success-2 = Dezactivare realizată cu succes. { -product-mozilla-accounts } nu va trimite date tehnice sau de interacțiune către { -brand-mozilla }.
dc-opt-in-success-2 = Îți mulțumim! Partajarea acestor date ne ajută să îmbunătățim { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Ne pare rău, a apărut o problemă la modificarea preferințelor de colectare a datelor
dc-learn-more = Află mai multe

# DropDownAvatarMenu component

drop-down-menu-title-2 = Meniu { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Autentificat(ă) ca
drop-down-menu-sign-out = Ieși din cont
drop-down-menu-sign-out-error-2 = Ne pare rău, a apărut o problemă la deconectare

## Flow Container

flow-container-back = Înapoi

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Reintrodu parola pentru securitate
flow-recovery-key-confirm-pwd-input-label = Introdu parola
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Creează o cheie de recuperare a contului
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Creează o cheie nouă de recuperare a contului

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Cheia de recuperare a contului a fost creată — Descarc-o și salveaz-o acum
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Cheia îți permite să îți recuperezi datele dacă uiți parola. Descarc-o acum și stocheaz-o undeva unde să ții minte că ai pus-o — nu veți putea reveni la această pagină mai târziu.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Continuă fără descărcare

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Cheia de recuperare a contului a fost creată

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Creează o cheie de recuperare a contului pentru cazul în care uiți parola
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Schimbă-ți cheia de recuperare a contului
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Criptăm datele de navigare –– parole, marcaje și multe altele. Este excelent pentru confidențialitate, dar îți poți pierde datele dacă uiți parola.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = De aceea, crearea unei chei de recuperare a contului este atât de importantă –– o poți folosi pentru restaurarea datelor.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Începe
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Anulează

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Conectează-te la aplicația ta de autentificare
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Pasul 1:</strong> Scanează acest cod QR folosind orice aplicație de autentificare, cum ar fi Duo sau Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Cod QR pentru configurarea autentificării în doi pași. Scanează-l sau alege „Nu poți scana codul QR?” pentru a obține în schimb o cheie secretă de configurare.
flow-setup-2fa-cant-scan-qr-button = Nu poți scana codul QR?
flow-setup-2fa-manual-key-heading = Introdu codul manual
flow-setup-2fa-manual-key-instruction = <strong>Pasul 1:</strong> Introdu codul din aplicația de autentificare preferată.
flow-setup-2fa-scan-qr-instead-button = Scanezi codul QR în schimb?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Află mai multe despre aplicațiile de autentificare
flow-setup-2fa-button = Continuă
flow-setup-2fa-step-2-instruction = <strong>Pasul 2:</strong> Introdu codul din aplicația de autentificare.
flow-setup-2fa-input-label = Introdu codul de 6 cifre
flow-setup-2fa-code-error = Cod nevalid sau expirat. Verifică aplicația de autentificare și încearcă din nou.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Alege o metodă de recuperare
flow-setup-2fa-backup-choice-description = Îți permite să te conectezi dacă nu poți accesa dispozitivul mobil sau aplicația de autentificare.
flow-setup-2fa-backup-choice-phone-title = Număr de telefon de recuperare
flow-setup-2fa-backup-choice-phone-badge = Cel mai ușor
flow-setup-2fa-backup-choice-phone-info = Primește un cod de recuperare prin mesaj text. Disponibil în SUA și Canada.
flow-setup-2fa-backup-choice-code-title = Coduri de autentificare de rezervă
flow-setup-2fa-backup-choice-code-badge = Cel mai sigur
flow-setup-2fa-backup-choice-code-info = Creează și salvează coduri de autentificare de unică folosință.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Află despre recuperare și riscul de schimbare a cartelei SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Introdu codul de autentificare de rezervă
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Confirmă că ai salvat codurile introducând unul. Fără aceste coduri, este posibil să nu poți intra în cont dacă nu ai aplicația de autentificare.
flow-setup-2fa-backup-code-confirm-code-input = Introdu codul de 10 caractere
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Termină

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Salvează codurile de autentificare de rezervă
flow-setup-2fa-backup-code-dl-save-these-codes = Păstrează-le într-un loc pe care să îl ții minte. Dacă nu ai acces la aplicația de autentificare, va trebui să introduci unul ca să intri în cont.
flow-setup-2fa-backup-code-dl-button-continue = Continuă

##

flow-setup-2fa-inline-complete-success-banner = Autentificare în doi pași activată
flow-setup-2fa-inline-complete-success-banner-description = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
flow-setup-2fa-inline-complete-backup-code = Coduri de autentificare de rezervă
flow-setup-2fa-inline-complete-backup-phone = Număr de telefon de recuperare
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } cod rămas
        [few] { $count } coduri rămase
       *[other] { $count } de coduri rămase
    }
flow-setup-2fa-inline-complete-backup-code-description = Este cea mai sigură metodă de recuperare dacă nu poți intra în cont cu dispozitivul mobil sau aplicația de autentificare.
flow-setup-2fa-inline-complete-backup-phone-description = Este cea mai ușoară metodă de recuperare dacă nu poți intra în cont cu aplicația de autentificare.
flow-setup-2fa-inline-complete-learn-more-link = Cum îți protejează contul
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Continuă cu { $serviceName }
flow-setup-2fa-prompt-heading = Configurează autentificarea în doi pași
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } necesită configurarea autentificării în doi pași ca să îți menții contul în siguranță.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Poți folosi oricare dintre <authenticationAppsLink>aceste aplicații de autentificare</authenticationAppsLink> pentru a continua.
flow-setup-2fa-prompt-continue-button = Continuă

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Introdu codul de verificare
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = A fost trimis prin SMS un cod de 6 cifre la <span>{ $phoneNumber }</span>. Codul expiră după 5 minute.
flow-setup-phone-confirm-code-input-label = Introdu codul de 6 cifre
flow-setup-phone-confirm-code-button = Confirmă
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Codul a expirat?
flow-setup-phone-confirm-code-resend-code-button = Retrimite codul
flow-setup-phone-confirm-code-resend-code-success = Cod trimis
flow-setup-phone-confirm-code-success-message-v2 = Număr de telefon de recuperare adăugat
flow-change-phone-confirm-code-success-message = Număr de telefon de recuperare modificat

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Verifică numărul de telefon
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Vei primi un mesaj text de la { -brand-mozilla } cu un cod pentru verificarea numărului. Nu-l distribui nimănui.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Numărul de telefon pentru recuperare este disponibil numai în Statele Unite și Canada. Numerele VoIP și măștile telefonice nu sunt recomandate.
flow-setup-phone-submit-number-legal = Prin furnizarea numărului, ești de acord să îl stocăm pentru a-ți putea trimite mesaje text doar pentru verificarea contului. Se pot aplica tarife pentru mesaje și date.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Trimite codul

## HeaderLockup component, the header in account settings

header-menu-open = Închide meniul
header-menu-closed = Meniu de navigare pe site
header-back-to-top-link =
    .title = Înapoi în partea de sus
header-back-to-settings-link =
    .title = Înapoi la setările { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Ajutor

## Linked Accounts section

la-heading = Conturi asociate
la-description = Ai acces autorizat la următoarele conturi.
la-unlink-button = Anulează asocierea
la-unlink-account-button = Anulează asocierea
la-set-password-button = Setează parola
la-unlink-heading = Anulează asocierea cu contul terț
la-unlink-content-3 = Sigur vrei să anulezi asocierea contului? Anularea asocierii nu te deconectează automat de la Serviciile Conectate. Pentru asta va trebui să te deconectezi manual din secțiunea Servicii Conectate.
la-unlink-content-4 = Înainte de anularea asocierii contului, trebuie să setezi o parolă. Fără parolă nu ai cum să te autentifici după anularea asocierii contului.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Închide
modal-cancel-button = Anulează
modal-default-confirm-button = Confirmă

## ModalMfaProtected

modal-mfa-protected-title = Introdu codul de confirmare
modal-mfa-protected-subtitle = Ajută-ne să ne asigurăm că tu ești cel/cea care modifici informațiile contului
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Introdu codul trimis la <email>{ $email }</email> în { $expirationTime } minut
        [few] Introdu codul trimis la <email>{ $email }</email> în { $expirationTime } minute
       *[other] Introdu codul trimis la <email>{ $email }</email> în { $expirationTime } de minute
    }
modal-mfa-protected-input-label = Introdu codul de 6 cifre
modal-mfa-protected-cancel-button = Anulează
modal-mfa-protected-confirm-button = Confirmă
modal-mfa-protected-code-expired = Cod expirat?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Trimite un cod nou prin e-mail.

## Modal Verify Session

mvs-verify-your-email-2 = Confirmă adresa de e-mail
mvs-enter-verification-code-2 = Introdu codul de confirmare
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Te rugăm să introduci, în termen de 5 minute, codul de confirmare trimis către <email>{ $email }</email>.
msv-cancel-button = Anulează
msv-submit-button-2 = Confirmă

## Settings Nav

nav-settings = Setări
nav-profile = Profil
nav-security = Securitate
nav-connected-services = Servicii conectate
nav-data-collection = Colectarea și utilizarea datelor
nav-paid-subs = Abonamente cu plată
nav-email-comm = Comunicări prin e-mail

## Page2faChange

page-2fa-change-title = Modifică autentificarea în doi pași
page-2fa-change-success = Autentificarea în doi pași a fost actualizată
page-2fa-change-success-additional-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.
page-2fa-change-totpinfo-error = A apărut o eroare la înlocuirea aplicației de autentificare în doi pași. Încearcă din nou mai târziu.
page-2fa-change-qr-instruction = <strong>Pasul 1:</strong> Scanează acest cod QR folosind orice aplicație de autentificare, cum ar fi Duo sau Google Authenticator. Creează o conexiune nouă; orice conexiune veche nu va mai funcționa.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Coduri de autentificare de rezervă
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = A apărut o problemă la înlocuirea codurilor de autentificare de rezervă
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = A apărut o problemă la crearea codurilor de autentificare de rezervă
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Codurile de autentificare de rezervă au fost actualizate
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Coduri de autentificare de rezervă create
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Păstrează-le într-un loc pe care să îl ții minte. Vechile coduri vor fi înlocuite după ce termini pasul următor.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Confirmă că ți-ai salvat codurile introducând unul. Vechile coduri de autentificare de rezervă vor fi dezactivate după finalizarea acestui pas.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Cod de autentificare de rezervă incorect

## Page2faSetup

page-2fa-setup-title = Autentificare în doi pași
page-2fa-setup-totpinfo-error = A apărut o eroare la setarea autentificării în doi pași. Încearcă din nou mai târziu.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Codul nu este corect. Încearcă din nou.
page-2fa-setup-success = Autentificarea în doi pași a fost activată
page-2fa-setup-success-additional-message = Pentru a-ți proteja toate dispozitivele conectate, trebuie să ieși din cont de peste tot pe unde îl folosești și apoi să intri iar în cont utilizând noua autentificare în doi pași.

## Avatar change page

avatar-page-title =
    .title = Poză de profil
avatar-page-add-photo = Adaugă o fotografie
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fă o fotografie
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Elimină fotografia
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Refă fotografia
avatar-page-cancel-button = Anulează
avatar-page-save-button = Salvează
avatar-page-saving-button = Se salvează…
avatar-page-zoom-out-button =
    .title = Micșorează
avatar-page-zoom-in-button =
    .title = Mărește
avatar-page-rotate-button =
    .title = Rotește
avatar-page-camera-error = Nu s-a putut inițializa camera
avatar-page-new-avatar =
    .alt = poză de profil nouă
avatar-page-file-upload-error-3 = A apărut o problemă la încărcarea fotografiei de profil
avatar-page-delete-error-3 = A apărut o problemă la ștergerea fotografiei de profil
avatar-page-image-too-large-error-2 = Fișierul de imagine este prea mare și nu poate fi încărcat

## Password change page

pw-change-header =
    .title = Schimbă parola
pw-8-chars = Cel puțin 8 caractere
pw-not-email = Nu adresa ta de e-mail
pw-change-must-match = Noua parolă să se potrivească cu confirmarea
pw-commonly-used = Nu o parolă utilizată frecvent
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Rămâi în siguranță — nu reutiliza parolele. Vezi mai multe ponturi despre <linkExternal>cum să creezi parole puternice</linkExternal>.
pw-change-cancel-button = Anulează
pw-change-save-button = Salvează
pw-change-forgot-password-link = Ți-ai uitat parola?
pw-change-current-password =
    .label = Introdu parola actuală
pw-change-new-password =
    .label = Introdu parola nouă
pw-change-confirm-password =
    .label = Confirmă noua parolă
pw-change-success-alert-2 = Parolă actualizată

## Password create page

pw-create-header =
    .title = Creează parola
pw-create-success-alert-2 = Parolă setată
pw-create-error-2 = Ne pare rău, a apărut o problemă la setarea parolei

## Delete account page

delete-account-header =
    .title = Șterge contul
delete-account-step-1-2 = Pasul 1 din 2
delete-account-step-2-2 = Pasul 2 din 2
delete-account-confirm-title-4 = Este posibil să îți fi conectat { -product-mozilla-account } la unul sau mia multe dintre următoarele produse sau servicii { -brand-mozilla } care te mențin în siguranță și îți asigură productivitatea pe web:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Se sincronizează datele { -brand-firefox }
delete-account-product-firefox-addons = Suplimente { -brand-firefox }
delete-account-acknowledge = Te rugăm să iei la cunoștință că prin ștergerea contului:
delete-account-chk-box-1-v4 =
    .label = Orice abonamente cu plată pe care le ai vor fi anulate
delete-account-chk-box-2 =
    .label = Este posibil să pierzi informațiile și funcțiile salvate în cadrul produselor { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Reactivarea cu acest e-mail este posibil să nu îți restabilească informațiile salvate
delete-account-chk-box-4 =
    .label = Orice extensie și temă pe care le-ai publicat pe addons.mozilla.org vor fi șterse
delete-account-continue-button = Continuă
delete-account-password-input =
    .label = Introdu parola
delete-account-cancel-button = Anulează
delete-account-delete-button-2 = Șterge

## Display name page

display-name-page-title =
    .title = Nume afișat
display-name-input =
    .label = Introdu numele afișat
submit-display-name = Salvează
cancel-display-name = Anulează
display-name-update-error-2 = A apărut o problemă la actualizarea numelui tău afișat
display-name-success-alert-2 = Nume afișat actualizat

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Activitate recentă în cont
recent-activity-account-create-v2 = Cont creat
recent-activity-account-disable-v2 = Cont dezactivat
recent-activity-account-enable-v2 = Cont activat
recent-activity-account-login-v2 = Autentificarea în cont a fost inițiată
recent-activity-account-reset-v2 = Resetarea parolei a fost inițiată
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Respingerile de e-mail au fost eliminate
recent-activity-account-login-failure = Încercarea de autentificare în cont a eșuat
recent-activity-account-two-factor-added = Autentificare în doi pași activată
recent-activity-account-two-factor-requested = Autentificare în doi pași solicitată
recent-activity-account-two-factor-failure = Autentificare în doi pași a eșuat
recent-activity-account-two-factor-success = Autentificare în doi pași reușită
recent-activity-account-two-factor-removed = Autentificarea în doi pași a fost eliminată
recent-activity-account-password-reset-requested = Contul a solicitat resetarea parolei
recent-activity-account-password-reset-success = Parolă cont resetată cu succes
recent-activity-account-recovery-key-added = Cheie de recuperare a contului activată
recent-activity-account-recovery-key-verification-failure = Verificarea cheii de recuperare a contului a eșuat
recent-activity-account-recovery-key-verification-success = Cheie de recuperare a contului verificată cu succes
recent-activity-account-recovery-key-removed = Cheie de recuperare a contului eliminată
recent-activity-account-password-added = Parolă nouă adăugată
recent-activity-account-password-changed = Parolă modificată
recent-activity-account-secondary-email-added = Adresă de e-mail secundară adăugată
recent-activity-account-secondary-email-removed = Adresă de e-mail secundară eliminată
recent-activity-account-emails-swapped = Adresele de e-mail principală și secundară au fost schimbate între ele
recent-activity-session-destroy = Deconectat(ă) de la sesiune
recent-activity-account-recovery-phone-send-code = Cod de număr de telefon de recuperare trimis
recent-activity-account-recovery-phone-setup-complete = Configurare număr de telefon de recuperare finalizată
recent-activity-account-recovery-phone-signin-complete = Autentificare cu număr de telefon de recuperare finalizată
recent-activity-account-recovery-phone-signin-failed = Autentificarea nu numărul de telefon de recuperare a eșuat
recent-activity-account-recovery-phone-removed = Număr de telefon de recuperare eliminat
recent-activity-account-recovery-codes-replaced = Coduri de recuperare înlocuite
recent-activity-account-recovery-codes-created = Codurile de recuperare au fost create
recent-activity-account-recovery-codes-signin-complete = Autentificare cu coduri de recuperare finalizată
recent-activity-password-reset-otp-sent = Codul de confirmare a resetării parolei a fost trimis
recent-activity-password-reset-otp-verified = Codul de confirmare a resetării parolei a fost verificat
recent-activity-must-reset-password = Necesită resetarea parolei
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Alte activități din cont

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Cheie de recuperare a contului
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Înapoi la setări

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Elimină numărul de telefon de recuperare
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Va elimina <strong>{ $formattedFullPhoneNumber }</strong> ca număr de telefon de recuperare.
settings-recovery-phone-remove-recommend = Îți recomandăm să păstrezi această metodă pentru că e mai ușoară decât să salvezi coduri de autentificare de rezervă.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Dacă îl ștergi, asigură-te că mai ai codurile de autentificare de rezervă salvate. <linkExternal>Compară metodele de recuperare</linkExternal>
settings-recovery-phone-remove-button = Elimină numărul de telefon
settings-recovery-phone-remove-cancel = Anulează
settings-recovery-phone-remove-success = Număr de telefon de recuperare eliminat

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Adaugă un număr de telefon de recuperare
page-change-recovery-phone = Schimbă numărul de telefon de recuperare
page-setup-recovery-phone-back-button-title = Înapoi la setări
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Schimbă numărul de telefon

## Add secondary email page

add-secondary-email-step-1 = Pasul 1 din 2
add-secondary-email-error-2 = A apărut o problemă la crearea acestui e-mail
add-secondary-email-page-title =
    .title = E-mail secundar
add-secondary-email-enter-address =
    .label = Introdu adresa de e-mail
add-secondary-email-cancel-button = Anulează
add-secondary-email-save-button = Salvează
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Măștile de e-mail nu pot fi folosite ca adresă de e-mail secundară

## Verify secondary email page

add-secondary-email-step-2 = Pasul 2 din 2
verify-secondary-email-page-title =
    .title = E-mail secundar
verify-secondary-email-verification-code-2 =
    .label = Introdu codul de confirmare
verify-secondary-email-cancel-button = Anulează
verify-secondary-email-verify-button-2 = Confirmă
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Te rugăm să introduci în 5 minute codul de confirmare trimis la <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } adăugată cu succes
verify-secondary-email-resend-code-button = Retrimite codul de confirmare

##

# Link to delete account on main Settings page
delete-account-link = Șterge contul
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Autentificare reușită. { -product-mozilla-account } și datele vor rămâne active.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Află unde sunt expuse informațiile tale private și preia controlul
# Links out to the Monitor site
product-promo-monitor-cta = Obține o scanare gratuită

## Profile section

profile-heading = Profil
profile-picture =
    .header = Fotografie
profile-display-name =
    .header = Nume afișat
profile-primary-email =
    .header = E-mail principal

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Pasul { $currentStep } din { $numberOfSteps }.

## Security section of Setting

security-heading = Securitate
security-password =
    .header = Parolă
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Creată în { $date }
security-not-set = Nu este setat
security-action-create = Creează
security-set-password = Setează o parolă pentru sincronizare și folosirea anumitor funcții de securitate ale contului.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Vezi activitatea recentă din cont
signout-sync-header = Sesiune expirată
signout-sync-session-expired = Ne pare rău, ceva nu a mers. Te rugăm să ieși din cont, din meniul browserului, și să încerci din nou.

## SubRow component

tfa-row-backup-codes-title = Coduri de autentificare de rezervă
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nu sunt disponibile coduri
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } cod rămas
        [few] { $numCodesAvailable } coduri rămase
       *[other] { $numCodesAvailable } de coduri rămase
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Creează coduri noi
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Adaugă
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Este cea mai sigură metodă de recuperare dacă nu îți poți folosi dispozitivul mobil sau aplicația de autentificare.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Număr de telefon de recuperare
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nu a fost adăugat niciun număr de telefon
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Modifică
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Adaugă
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Elimină
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Elimină numărul de telefon de recuperare
tfa-row-backup-phone-delete-restriction-v2 = Dacă vrei să elimini numărul de telefon de recuperare, adaugă mai întâi coduri de autentificare de rezervă sau dezactivează autentificarea în doi pași ca să eviți blocarea accesului la cont.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Este cea mai simplă metodă de recuperare dacă nu poți folosi aplicația de autentificare.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Află despre riscul de schimbare a cartelei SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Oprește
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Pornește
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Se trimite…
switch-is-on = pornit
switch-is-off = oprit

## Sub-section row Defaults

row-defaults-action-add = Adaugă
row-defaults-action-change = Modifică
row-defaults-action-disable = Dezactivează
row-defaults-status = Niciunul

## Account recovery key sub-section on main Settings page

rk-header-1 = Cheie de recuperare a contului
rk-enabled = Activat
rk-not-set = Nu este setată
rk-action-create = Creează
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Modifică
rk-action-remove = Elimină
rk-key-removed-2 = Cheie de recuperare a contului eliminată
rk-cannot-remove-key = Cheia de recuperare a contului nu a putut fi eliminată.
rk-refresh-key-1 = Reîmprospătează cheia de recuperare a contului
rk-content-explain = Restaurează-ți informațiile când uiți parola.
rk-cannot-verify-session-4 = Ne pare rău, a apărut o problemă la confirmarea sesiunii
rk-remove-modal-heading-1 = Elimini cheia de recuperare a contului?
rk-remove-modal-content-1 =
    Dacă îți resetezi parola, nu vei mai putea
    utiliza cheia de recuperare a contului ca să îți accesezi datele. Acțiunea este ireversibilă.
rk-remove-error-2 = Cheia de recuperare a contului nu a putut fi eliminată
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Șterge cheia de recuperare a contului

## Secondary email sub-section on main Settings page

se-heading = E-mail secundar
    .header = E-mail secundar
se-cannot-refresh-email = Ne pare rău, a apărut o problemă la reîmprospătarea acestui e-mail.
se-cannot-resend-code-3 = Ne pare rău, a apărut o problemă la retrimiterea codului de confirmare
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } este acum adresa ta de e-mail primară
se-set-primary-error-2 = Ne pare rău, a apărut o problemă la modificarea adresei principale de e-mail
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } ștearsă cu succes
se-delete-email-error-2 = Ne pare rău, a apărut o problemă la ștergerea adresei de e-mail
se-verify-session-3 = Va trebui să îți confirmi sesiunea actuală pentru a efectua această acțiune.
se-verify-session-error-3 = Ne pare rău, a apărut o problemă la confirmarea sesiunii
# Button to remove the secondary email
se-remove-email =
    .title = Elimină adresa de e-mail
# Button to refresh secondary email status
se-refresh-email =
    .title = Reîmprospătează e-mailul
se-unverified-2 = neconfirmată
se-resend-code-2 =
    Necesită confirmare. <button>Retrimite codul de confirmare</button>
    dacă nu se află în dosarul de mesaje primite sau spam.
# Button to make secondary email the primary
se-make-primary = Setează ca e-mail principal
se-default-content = Accesează contul dacă nu te poți autentifica în e-mailul principal.
se-content-note-1 =
    Notă: o adresă secundară de e-mail nu îți va restabili informațiile — vei
    avea nevoie de o <a>cheie de recuperare a contului</a>.
# Default value for the secondary email
se-secondary-email-none = Niciunul

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autentificare în doi pași
tfa-row-enabled = Activat
tfa-row-disabled-status = Dezactivat
tfa-row-action-add = Adaugă
tfa-row-action-disable = Dezactivează
tfa-row-action-change = Modifică
tfa-row-button-refresh =
    .title = Reîmprospătează autentificarea în doi pași
tfa-row-cannot-refresh =
    Ne pare rău, a apărut o problemă la reîmprospătarea
    autentificării în doi pași.
tfa-row-enabled-description = Contul este protejat prin autentificare în doi pași. Va trebui să introduci o parolă de unică folosință din aplicația de autentificare când vrei să intri în { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Cum îți protejează contul
tfa-row-disabled-description-v2 = Securizează-ți contul utilizând o aplicație de autentificare terță ca al doilea pas pentru autentificare.
tfa-row-cannot-verify-session-4 = Ne pare rău, a apărut o problemă la confirmarea sesiunii
tfa-row-disable-modal-heading = Dezactivezi autentificarea în doi pași?
tfa-row-disable-modal-confirm = Dezactivează
tfa-row-disable-modal-explain-1 =
    Acțiunea este ireversibilă. Mai ai și
    opțiunea <linkExternal>să înlocuiești codurile de autentificare de rezervă</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Autentificare în doi pași dezactivată
tfa-row-cannot-disable-2 = Autentificarea în doi pași nu a putut fi dezactivată
tfa-row-verify-session-info = Trebuie să confirmi sesiunea curentă pentru a configura autentificarea în doi pași

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Prin continuare, ești de acord cu:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Condiții de utilizare a serviciilor</mozSubscriptionTosLink> și <mozSubscriptionPrivacyLink>Notificare privind confidențialitatea</mozSubscriptionPrivacyLink> pentru serviciile de abonamente { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Condiții de utilizare a serviciilor</mozillaAccountsTos> și <mozillaAccountsPrivacy>Notificare privind confidențialitatea</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Prin continuare, ești de acord cu <mozillaAccountsTos>Condițiile de utilizare a serviciilor</mozillaAccountsTos> și <mozillaAccountsPrivacy>Notificarea privind confidențialitatea</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = sau
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Intră în cont cu
continue-with-google-button = Continuă cu { -brand-google }
continue-with-apple-button = Continuă cu { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Cont necunoscut
auth-error-103 = Parolă incorectă
auth-error-105-2 = Cod de confirmare nevalid
auth-error-110 = Jeton nevalid
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Ai încercat de prea multe ori. Te rugăm să încerci din nou mai târziu.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Ai încercat de prea multe ori. Te rugăm să încerci din nou { $retryAfter }.
auth-error-125 = Cererea a fost blocată din motive de securitate
auth-error-129-2 = Ai introdus un număr de telefon nevalid. Te rugăm să îl verifici și să încerci din nou.
auth-error-138-2 = Sesiune neconfirmată
auth-error-139 = Adresa de e-mail secundară trebuie să fie diferită de adresa de e-mail a contului
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Această adresă de e-mail este rezervată de alt cont. Încearcă din nou mai târziu sau folosește altă adresă de e-mail.
auth-error-155 = Jetonul TOTP nu a fost găsit
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Cod de autentificare de rezervă negăsit
auth-error-159 = Cheie nevalidă de recuperare a contului
auth-error-183-2 = Cod de confirmare nevalid sau expirat
auth-error-202 = Funcționalitate neactivată
auth-error-203 = Sistem indisponibil; încearcă din nou mai târziu
auth-error-206 = Nu se poate crea o parolă, parola este deja setată.
auth-error-214 = Numărul de telefon de recuperare există deja
auth-error-215 = Numărul de telefon de recuperare nu există
auth-error-216 = Ai atins limita pentru mesaje text
auth-error-218 = Nu se poate elimina numărul de telefon de recuperare, lipsesc codurile de autentificare de rezervă.
auth-error-219 = Acest număr de telefon a fost înregistrat cu prea multe conturi. Te rugăm să încerci alt număr.
auth-error-999 = Eroare neașteptată
auth-error-1001 = Încercare de autentificare anulată
auth-error-1002 = Sesiune expirată. Intră în cont pentru a continua.
auth-error-1003 = Stocarea locală sau cookie-urile sunt încă dezactivate
auth-error-1008 = Noua ta parolă trebuie să fie diferită
auth-error-1010 = Este necesară o parolă validă
auth-error-1011 = Este necesară o adresă de e-mail validă
auth-error-1018 = Mesajul de confirmare pe e-mail tocmai a fost returnat. Ai scris corect adresa?
auth-error-1020 = Ai scris greșit adresa de e-mail? firefox.com nu e un serviciu valid de poștă electronică
auth-error-1031 = Trebuie să introduci vârsta ca să îți faci cont
auth-error-1032 = Trebuie să introduci o vârstă validă ca să îți faci cont
auth-error-1054 = Cod de autentificare în doi pași nevalid
auth-error-1056 = Cod de autentificare de rezervă nevalid
auth-error-1062 = Redirecționare nevalidă
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Ai scris greșit adresa de e-mail? { $domain } nu e un serviciu valid de poștă electronică
auth-error-1066 = Măștile de e-mail nu pot fi folosite la creat conturi.
auth-error-1067 = Ai scris greșit adresa de e-mail?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Număr care se termină în { $lastFourPhoneNumber }
oauth-error-1000 = Ceva nu a mers. Închide fila și încearcă din nou.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Ești autentificat(ă) în { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Adresă de e-mail confirmată
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Autentificare confirmată
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Autentifică-te în acest { -brand-firefox } pentru a finaliza configurarea
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Intră în cont
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Încă adaugi dispozitive? Autentifică-te în { -brand-firefox } de pe alt dispozitiv pentru a finaliza configurarea
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Autentifică-te în { -brand-firefox } de pe alt dispozitiv pentru a finaliza configurarea
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Vrei să îți salvezi filele, marcajele și parolele pe un alt dispozitiv?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Conectează alt dispozitiv
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Nu acum
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Autentifică-te în { -brand-firefox } pentru Android pentru a finaliza configurarea
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Autentifică-te în { -brand-firefox } pentru iOS pentru a finaliza configurarea

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Necesită stocare locală și cookie-uri
cookies-disabled-enable-prompt-2 = Te rugăm să activezi în browser cookie-urile și stocarea locală pentru a acces la { -product-mozilla-account }. Astfel, va fi activată funcționalitatea de a ține minte contul între sesiuni.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Încearcă din nou
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Află mai multe

## Index / home page

index-header = Introdu adresa ta de e-mail
index-sync-header = Continuă spre { -product-mozilla-account }
index-sync-subheader = Sincronizează-ți parolele, filele și marcajele oriunde folosești { -brand-firefox }.
index-relay-header = Creează o mască de e-mail
index-relay-subheader = Te rugăm să ne dai adresa de e-mail la care vrei să îți redirecționezi mesajele de la adresa de e-mail mascată.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Continuă cu { $serviceName }
index-subheader-default = Continuă spre setările contului
index-cta = Fă-ți un cont sau intră în cont
index-account-info = Un { -product-mozilla-account } îți deblochează și accesul la mai multe produse de la { -brand-mozilla } care îți protejează confidențialitatea.
index-email-input =
    .label = Introdu adresa ta de e-mail
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Cont șters cu succes
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Mesajul de confirmare pe e-mail tocmai a fost returnat. Ai scris corect adresa?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Ups! Nu am putut crea cheia de recuperare a contului. Te rugăm să încerci mai târziu.
inline-recovery-key-setup-recovery-created = Cheia de recuperare a contului a fost creată
inline-recovery-key-setup-download-header = Securizează-ți contul
inline-recovery-key-setup-download-subheader = Descarcă și salveaz-o acum
inline-recovery-key-setup-download-info = Păstrează această cheie într-un loc pe care să îl ții minte — nu vei putea reveni la această pagină mai târziu.
inline-recovery-key-setup-hint-header = Recomandare de securitate

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Anulează configurarea
inline-totp-setup-continue-button = Continuă
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Adaugă un plus de securitate contului prin solicitarea de coduri de autentificare de la una dintre aceste <authenticationAppsLink>aplicații de autentificare</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Activează autentificarea în doi pași <span>pentru a continua cu setările contului</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Activează autentificarea în doi pași <span>pentru a continua cu { $serviceName }</span>
inline-totp-setup-ready-button = Gata
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scanează codul de autentificare <span>pentru a continua cu { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Introdu manual codul <span>pentru a continua cu { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scanează codul de autentificare <span>pentru a continua cu setările contului</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Introdu manual codul <span>pentru a continua cu setările contului</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Tastează această cheie secretă în aplicația de autentificare. <toggleToQRButton>Scanei codul QR în schimb?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scanează codul QR în aplicația de autentificare și apoi introdu codul de autentificare furnizat. <toggleToManualModeButton>Nu poți scana codul?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Când ai terminat, va începe să genereze coduri de autentificare pe care să le introduci.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Cod de autentificare
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Necesită cod de autentificare
tfa-qr-code-alt = Folosește codul { $code } și configurează autentificarea în doi pași în aplicațiile acceptate.
inline-totp-setup-page-title = Autentificare în doi pași

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Mențiuni legale
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Condiții de utilizare a serviciilor
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Notificare privind confidențialitatea

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Notificare privind confidențialitatea

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Condiții de utilizare a serviciilor

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Tocmai te-ai autentificat în { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Da, aprobă dispozitivul
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Dacă nu ai fost tu, <link>schimbă-ți parola</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Dispozitiv conectat
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Acum te sincronizezi cu: { $deviceFamily } pe { $deviceOS }
pair-auth-complete-sync-benefits-text = Acum poți accesa filele deschise, parolele și marcajele pe toate dispozitivele tale.
pair-auth-complete-see-tabs-button = Vezi file de pe dispozitivele sincronizate
pair-auth-complete-manage-devices-link = Gestionează dispozitivele

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Introdu codul de autentificare <span>pentru a continua cu setările contului</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Introdu codul de autentificare <span>pentru a continua cu { $serviceName }</span>
auth-totp-instruction = Deschide aplicația de autentificare și introdu codul de autentificare furnizat.
auth-totp-input-label = Introdu codul de 6 cifre
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Confirmă
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Necesită cod de autentificare

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Acum este necesară aprobarea <span>de pe celălalt dispozitiv</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Asociere eșuată
pair-failure-message = Procesul de configurare a fost întrerupt.

## Pair index page

pair-sync-header = Sincronizează { -brand-firefox } pe telefon sau tabletă
pair-cad-header = Conectează { -brand-firefox } pe alt dispozitiv
pair-already-have-firefox-paragraph = Ai deja { -brand-firefox } pe telefon sau tabletă?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sincronizează-ți dispozitivul
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Sau descarcă
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scanează ca să descarci { -brand-firefox } pentru mobil sau trimite-ți un <linkExternal>link de descărcare</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Nu acum
pair-take-your-data-message = Ia cu tine filele, marcajele și parolele oriunde folosești { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Începe
# This is the aria label on the QR code image
pair-qr-code-aria-label = Cod QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Dispozitiv conectat
pair-success-message-2 = Asociere reușită.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Confirmă asocierea <span>pentru { $email }</span>
pair-supp-allow-confirm-button = Confirmă asocierea
pair-supp-allow-cancel-link = Anulează

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Acum este necesară aprobarea <span>de pe celălalt dispozitiv</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Asociere folosind o aplicație
pair-unsupported-message = Ai folosit camera sistemului? Trebuie să efectuezi o asociere dintr-o aplicație { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Creează o parolă pentru sincronizare
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Îți criptează datele. Trebuie să fie diferită de parola contului { -brand-google } sau { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Te rugăm să aștepți, ești redirecționat(ă) către aplicația autorizată.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Introdu cheia de recuperare a contului
account-recovery-confirm-key-instruction = Cheia recuperează datele de navigare criptate, cum ar fi parolele și marcajele, de pe serverele { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Introdu cheia de recuperare a contului din 32 de caractere
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Sugestia ta de stocare:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Continuă
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Nu găsești cheia de recuperare a contului?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Creează o parolă nouă
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Parolă setată
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Ne pare rău, a apărut o problemă la setarea parolei
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Folosește cheia de recuperare a contului
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Parola a fost resetată.
reset-password-complete-banner-message = Nu uita să generezi o cheie nouă de recuperare a contului din setările { -product-mozilla-account } pentru a preveni viitoare probleme la intrarea în cont.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Introdu codul de 10 caractere
confirm-backup-code-reset-password-confirm-button = Confirmă
confirm-backup-code-reset-password-subheader = Introdu codul de autentificare de rezervă
confirm-backup-code-reset-password-instruction = Introdu unul dintre codurile de unică folosință pe care le-ai salvat când ai configurat autentificarea în doi pași.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Ți-ai blocat accesul la cont?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Verifică-ți e-mailul
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Am trimis un cod de confirmare la adresa <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Introdu în 10 minute codul din 8 cifre
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Continuă
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Retrimite codul
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Folosește alt cont

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Resetează-ți parola
confirm-totp-reset-password-subheader-v2 = Introdu codul de autentificare în doi pași
confirm-totp-reset-password-instruction-v2 = Verifică-ți <strong>aplicația de autentificare</strong> pentru resetarea parolei.
confirm-totp-reset-password-trouble-code = Ai probleme cu introducerea codului?
confirm-totp-reset-password-confirm-button = Confirmă
confirm-totp-reset-password-input-label-v2 = Introdu codul de 6 cifre
confirm-totp-reset-password-use-different-account = Folosește alt cont

## ResetPassword start page

password-reset-flow-heading = Resetează-ți parola
password-reset-body-2 =
    Te vom întreba câteva chestii pe care numai tu le știi ca să îți menținem contul
    în siguranță.
password-reset-email-input =
    .label = Introdu adresa de e-mail
password-reset-submit-button-2 = Continuă

## ResetPasswordConfirmed

reset-password-complete-header = Parola a fost resetată
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Continuă cu { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Resetează-ți parola
password-reset-recovery-method-subheader = Alege o metodă de recuperare
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Hai să ne asigurăm că tu folosești metodele de recuperare.
password-reset-recovery-method-phone = Număr de telefon de recuperare
password-reset-recovery-method-code = Coduri de autentificare de rezervă
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $count } cod rămas
        [few] { $count } coduri rămase
       *[other] { $count } de coduri rămase
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = A apărut o problemă la trimiterea unui cod către numărul tău de telefon de recuperare
password-reset-recovery-method-send-code-error-description = Te rugăm să încerci din nou mai târziu sau să folosești codurile de autentificare de rezervă.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Resetează-ți parola
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Introdu codul de recuperare
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = A fost trimis prin SMS un cod de 6 cifre la numărul de telefon care se termină în <span>{ $lastFourPhoneDigits }</span>. Codul expiră după 5 minute. Nu distribui acest cod nimănui.
reset-password-recovery-phone-input-label = Introdu codul de 6 cifre
reset-password-recovery-phone-code-submit-button = Confirmă
reset-password-recovery-phone-resend-code-button = Retrimite codul
reset-password-recovery-phone-resend-success = Cod trimis
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Ți-ai blocat accesul la cont?
reset-password-recovery-phone-send-code-error-heading = A apărut o problemă la trimiterea unui cod
reset-password-recovery-phone-code-verification-error-heading = A apărut o problemă la verificarea codului
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Te rugăm să încerci mai târziu.
reset-password-recovery-phone-invalid-code-error-description = Codul este nevalid sau expirat.
reset-password-recovery-phone-invalid-code-error-link = Folosești în schimb coduri de autentificare de rezervă?
reset-password-with-recovery-key-verified-page-title = Parolă resetată cu succes
reset-password-complete-new-password-saved = Parolă nouă salvată!
reset-password-complete-recovery-key-created = Cheia nouă de recuperare a contului a fost creată. Descarc-o și salveaz-o acum.
reset-password-complete-recovery-key-download-info =
    Cheia este esențială pentru
    recuperarea datelor în caz că uiți parola. <b>Descarc-o acum și salveaz-o în siguranță
    pentru că nu vei mai avea acces mai târziu la această pagină.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Eroare:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Se validează autentificarea în cont…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Eroare de confirmare
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Link de confirmare expirat
signin-link-expired-message-2 = Linkul pe care ai dat clic a expirat sau a fost deja utilizat.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Introdu parola <span> pentru contul { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Continuă cu { $serviceName }
signin-subheader-without-logo-default = Continuă spre setările contului
signin-button = Intră în cont
signin-header = Intră în cont
signin-use-a-different-account-link = Folosește alt cont
signin-forgot-password-link = Ți-ai uitat parola?
signin-password-button-label = Parolă
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.
signin-code-expired-error = Codul a expirat. Te rugăm să intri din nou în cont.
signin-account-locked-banner-heading = Resetează-ți parola
signin-account-locked-banner-description = Ți-am blocat contul pentru a-l proteja de activități suspecte.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Resetează-ți parola ca să intri în cont

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Linkul pe care ai dat clic avea caractere lipsă și este posibil să fi fost corupt de către clientul de e-mail. Copiază adresa cu grijă și încearcă din nou.
report-signin-header = Raportezi autentificarea neautorizată?
report-signin-body = Ai primit un mesaj pe e-mail cu privire la o tentativă de acces la cont. Vrei să raportezi activitatea ca suspicioasă?
report-signin-submit-button = Raportează activitatea
report-signin-support-link = De ce s-a întâmplat asta?
report-signin-error = Ne pare rău, a apărut o problemă la trimiterea raportului.
signin-bounced-header = Ne pare rău. Ți-am blocat contul.
# $email (string) - The user's email.
signin-bounced-message = Mesajul de confirmare trimis pe e-mail la { $email } a fost returnat și ți-am blocat contul pentru a-ți proteja datele { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Dacă este o adresă de e-mail validă, <linkExternal>anunță-ne</linkExternal> și te putem ajuta să-ți deblochezi contul.
signin-bounced-create-new-account = Nu mai deții adresa de e-mail? Creează un cont nou
back = Înapoi

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Verifică această autentificare în cont <span>pentru a continua cu setările contului</span>
signin-push-code-heading-w-custom-service = Verifică această autentificare în cont <span>pentru a continua cu { $serviceName }</span>
signin-push-code-instruction = Te rugăm să verifici celelalte dispozitive și să aprobi această autentificare în cont din browserul { -brand-firefox }.
signin-push-code-did-not-recieve = Nu ai primit notificarea?
signin-push-code-send-email-link = Trimite codul pe e-mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Confirmă intrarea în cont
signin-push-code-confirm-description = Am depistat o tentativă de intrare în cont de pe următorul dispozitiv. Dacă ai fost tu, te rugăm să aprobi autentificarea în cont
signin-push-code-confirm-verifying = Se verifică
signin-push-code-confirm-login = Confirmă intrarea în cont
signin-push-code-confirm-wasnt-me = Nu am fost eu. Schimbă parola.
signin-push-code-confirm-login-approved = Intrarea în cont a fost aprobată. Te rugăm să închizi această fereastră.
signin-push-code-confirm-link-error = Linkul este corupt. Te rugăm să încerci din nou.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Intră în cont
signin-recovery-method-subheader = Alege o metodă de recuperare
signin-recovery-method-details = Hai să ne asigurăm că tu folosești metodele de recuperare.
signin-recovery-method-phone = Număr de telefon de recuperare
signin-recovery-method-code-v2 = Coduri de autentificare de rezervă
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } cod rămas
        [few] { $numBackupCodes } coduri rămase
       *[other] { $numBackupCodes } de coduri rămase
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = A apărut o problemă la trimiterea unui cod către numărul tău de telefon de recuperare
signin-recovery-method-send-code-error-description = Te rugăm să încerci din nou mai târziu sau să folosești codurile de autentificare de rezervă.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Intră în cont
signin-recovery-code-sub-heading = Introdu codul de autentificare de rezervă
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Introdu unul dintre codurile de unică folosință pe care le-ai salvat când ai configurat autentificarea în doi pași.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Introdu codul de 10 caractere
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Confirmă
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Folosește numărul de telefon de recuperare
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Ți-ai blocat accesul la cont?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Necesită cod de autentificare de rezervă
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = A apărut o problemă la trimiterea unui cod către numărul tău de telefon de recuperare
signin-recovery-code-use-phone-failure-description = Te rugăm să încerci mai târziu.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Intră în cont
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Introdu codul de recuperare
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = A fost trimis prin SMS un cod de 6 cifre la numărul de telefon care se termină în <span>{ $lastFourPhoneDigits }</span>. Codul expiră după 5 minute. Nu distribui acest cod nimănui.
signin-recovery-phone-input-label = Introdu codul de 6 cifre
signin-recovery-phone-code-submit-button = Confirmă
signin-recovery-phone-resend-code-button = Retrimite codul
signin-recovery-phone-resend-success = Cod trimis
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Ți-ai blocat accesul la cont?
signin-recovery-phone-send-code-error-heading = A apărut o problemă la trimiterea unui cod
signin-recovery-phone-code-verification-error-heading = A apărut o problemă la verificarea codului
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Te rugăm să încerci mai târziu.
signin-recovery-phone-invalid-code-error-description = Codul este nevalid sau expirat.
signin-recovery-phone-invalid-code-error-link = Folosești în schimb coduri de autentificare de rezervă?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Autentificare cu succes. Este posibil să se aplice limite dacă îți folosești iar numărul de telefon de recuperare.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Îți mulțumim pentru vigilență
signin-reported-message = Echipa noastră a fost notificată. Raporturi precum acestea ne ajută să ținem departe intrușii.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Introdu codul de confirmare<span> pentru contul { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Introdu în 5 minute codul trimis la <email>{ $email }</email>.
signin-token-code-input-label-v2 = Introdu codul de 6 cifre
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Confirmă
signin-token-code-code-expired = A expirat codul?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Trimite un cod nou pe e-mail.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Necesită cod de confirmare
signin-token-code-resend-error = Ceva nu a mers bine. Nu s-a putut trimite un cod nou.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Intră în cont
signin-totp-code-subheader-v2 = Introdu codul de autentificare în doi pași
signin-totp-code-instruction-v4 = Verifică-ți <strong>aplicația de autentificare</strong> pentru confirmarea intrării în cont.
signin-totp-code-input-label-v4 = Introdu codul de 6 cifre
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = De ce ți se cere să te autentifici?
signin-totp-code-aal-banner-content = Ai configurat autentificarea în doi pași în cont, dar nu te-ai conectat încă cu un cod pe acest dispozitiv.
signin-totp-code-aal-sign-out = Ieși din cont pe acest dispozitiv
signin-totp-code-aal-sign-out-error = Ne pare rău, a apărut o problemă la ieșirea din cont
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Confirmă
signin-totp-code-other-account-link = Folosește un alt cont
signin-totp-code-recovery-code-link = Ai probleme cu introducerea codului?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Necesită cod de autentificare
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autorizează această autentificare
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Verifică-ți căsuța de e-mail pentru codul de autorizare trimis către { $email }.
signin-unblock-code-input = Introdu codul de autorizare
signin-unblock-submit-button = Continuă
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Necesită cod de autorizare
signin-unblock-code-incorrect-length = Codul de autorizare trebuie să conțină 8 caractere
signin-unblock-code-incorrect-format-2 = Codul de autorizare poate conține doar litere și/sau cifre
signin-unblock-resend-code-button = Nu e în căsuța poștală sau în dosarul de spam? Retrimite
signin-unblock-support-link = De ce s-a întâmplat asta?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Introdu codul de confirmare
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Introdu codul de confirmare <span>pentru contul { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Introdu în 5 minute codul trimis la <email>{ $email }</email>.
confirm-signup-code-input-label = Introdu codul de 6 cifre
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Confirmă
confirm-signup-code-sync-button = Începe sincronizarea
confirm-signup-code-code-expired = A expirat codul?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Trimite codul nou prin e-mail.
confirm-signup-code-success-alert = Cont confirmat cu succes
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Necesită cod de confirmare
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } va încerca să te trimită înapoi ca să folosești o mască de e-mail după ce intri în cont.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Creează o parolă
signup-relay-info = Necesită parolă pentru gestionarea în siguranță a adreselor de e-mail mascate și pentru accesarea instrumentelor de securitate { -brand-mozilla }.
signup-sync-info = Sincronizează-ți parolele, marcajele și multe altele oriunde folosești { -brand-firefox }.
signup-sync-info-with-payment = Sincronizează-ți parolele, metodele de plată, marcajele și multe altele oriunde folosești { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Schimbă e-mailul

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Sincronizarea este activată
signup-confirmed-sync-success-banner = { -product-mozilla-account } confirmat
signup-confirmed-sync-button = Începe să navighezi
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Parolele, metodele de plată, adresele, marcajele, istoricul și multe altele se pot sincroniza oriunde folosești { -brand-firefox }.
signup-confirmed-sync-description-v2 = Parolele, adresele, marcajele, istoricul și multe altele se pot sincroniza oriunde folosești { -brand-firefox }.
signup-confirmed-sync-add-device-link = Adaugă alt dispozitiv
signup-confirmed-sync-manage-sync-button = Gestionează sincronizarea
signup-confirmed-sync-set-password-success-banner = Parola de sincronizare a fost creată
