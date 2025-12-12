# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Al è stât mandât un gnûf codiç ae tô e-mail.
resend-link-success-banner-heading = Al è stât inviât un gnûf colegament ae tô e-mail.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Zonte { $accountsEmail } ai tiei contats par garantî une consegne cence fastidis.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Siere strisson
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = I { -product-firefox-accounts } a cambiaran non in { -product-mozilla-accounts } dal 1ⁿ di Novembar
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Dut câs tu jentrarâs cul stes non utent e password e no saran fatis altris modifichis ai prodots che tu dopris.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = O vin cambiât non ai { -product-firefox-accounts } in { -product-mozilla-accounts }. Dut câs tu jentrarâs cul stes non e password e no saran fatis altris modifichis ai prodots che tu dopris.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Plui informazions
# Alt text for close banner image
brand-close-banner =
    .alt = Siere strisson
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo cu la m di  { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Indaûr
button-back-title = Indaûr

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Discjame e continue
    .title = Discjame e continue
recovery-key-pdf-heading = Clâf di recupar dal account
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Gjenerade: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Clâf di recupar dal account
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Cheste clâf ti permet di recuperâ i tiei dâts cifrâts dal browser (includudis passwords, segnelibris e cronologjie), tal câs che tu dismenteis la password. Archivile intun puest là che tu ti impensis.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Puescj dulà archiviâ la clâf
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Altris informazions su la clâf di recupar dal account
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Nus displâs, al è vignût fûr un probleme tal discjariâ la tô clâf di recupar dal account.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Oten di plui di { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Ricêf lis ultimis notiziis e i inzornaments sui prodots
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Acès in anteprime par provâ gnûfs prodots
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Avîs ae azion par tornâ a cjapâ in man il control di internet

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Discjariât
datablock-copy =
    .message = Copiât
datablock-print =
    .message = Stampât

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Codiç copiâ
       *[other] Codiçs copiâts
    }
datablock-download-success =
    { $count ->
        [one] Codiç discjariât
       *[other] Codiçs discjariâts
    }
datablock-print-success =
    { $count ->
        [one] Codiç stampât
       *[other] Codiçs stampâts
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Copiât

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (stimât)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (stimât)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (stimât)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (stimât)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Posizion no cognossude
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } su { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Direzion IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Password
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ripet password
form-password-with-inline-criteria-signup-submit-button = Cree un account
form-password-with-inline-criteria-reset-new-password =
    .label = Gnove password
form-password-with-inline-criteria-confirm-password =
    .label = Conferme password
form-password-with-inline-criteria-reset-submit-button = Cree gnove password
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Password
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ripet password
form-password-with-inline-criteria-set-password-submit-button = Scomence la sincronizazion
form-password-with-inline-criteria-match-error = Lis passwords no corispuindin
form-password-with-inline-criteria-sr-too-short-message = La password e à di vê almancul 8 caratars.
form-password-with-inline-criteria-sr-not-email-message = La password no à di contignî la tô direzion e-mail.
form-password-with-inline-criteria-sr-not-common-message = La password no à di jessi une password di ûs comun.
form-password-with-inline-criteria-sr-requirements-met = La password inseride e rispiete ducj i recuisîts pes passwords.
form-password-with-inline-criteria-sr-passwords-match = Lis passwords inseridis a corispuindin.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Chest cjamp al è obligatori

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Inserìs un codiç di { $codeLength } cifris par continuâ
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Inserìs un codiç di { $codeLength } caratars par continuâ

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Clâf di recupar dal account { -brand-firefox }
get-data-trio-title-backup-verification-codes = Codiçs di autenticazion di backup
get-data-trio-download-2 =
    .title = Discjame
    .aria-label = Discjame
get-data-trio-copy-2 =
    .title = Copie
    .aria-label = Copie
get-data-trio-print-2 =
    .title = Stampe
    .aria-label = Stampe

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Avîs
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Atenzion
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Avertiment
authenticator-app-aria-label =
    .aria-label = Aplicazion di autenticazion
backup-codes-icon-aria-label-v2 =
    .aria-label = Codiç di autenticazion di backup ativâts
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Codiçs di autenticazion di backup disativâts
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS di recupar ativât
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS di recupar disativât
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Bandiere dal Canadà
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Segne
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Completât
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Atîf
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Siere il messaç
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Codiç
error-icon-aria-label =
    .aria-label = Erôr
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informazion
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Bandiere dai Stâts Unîts

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Un computer e un celulâr e la imagjin di un cûr slambrât su ogniun
hearts-verified-image-aria-label =
    .aria-label = Un computer, un celulâr e un tablet cuntun cûr che al bat su ognun
signin-recovery-code-image-description =
    .aria-label = Document che al conten test platât.
signin-totp-code-image-label =
    .aria-label = Un dispositîf cuntun codiç platât a 6 cifris.
confirm-signup-aria-label =
    .aria-label = Une buste che e conten un colegament
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustrazion par rapresentâ une clâf di recupar dal account.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustrazion par rapresentâ une clâf di recupar dal account.
password-image-aria-label =
    .aria-label = Une ilustrazion par rapresentâ la digjitazion di une password.
lightbulb-aria-label =
    .aria-label = Ilustrazion par rapresentâ la creazion di un sugjeriment pe archiviazion.
email-code-image-aria-label =
    .aria-label = Ilustrazion par rapresentâ une e-mail che e conten un codiç.
recovery-phone-image-description =
    .aria-label = Dispositîf mobil che al ricêf un codiç midiant SMS.
recovery-phone-code-image-description =
    .aria-label = Codiç ricevût suntun dispositîf mobil.
backup-recovery-phone-image-aria-label =
    .aria-label = Dispositîf mobil cun funzionalitâts SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Schermi dal dispositîf cun codiçs
sync-clouds-image-aria-label =
    .aria-label = Nui cuntune icone di sincronizazion
confetti-falling-image-aria-label =
    .aria-label = Animazion cun coriandui che a colin

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Acès eseguît su { -brand-firefox }.
inline-recovery-key-setup-create-header = Protêç il to account
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Âstu un minût par protezi i tiei dâts?
inline-recovery-key-setup-info = Cree une clâf di recupar dal account cussì che tu puedis ripristinâ i dâts di navigazion sincronizâts tal câs che tu ti dismenteis la password.
inline-recovery-key-setup-start-button = Cree une clâf di recupar dal account
inline-recovery-key-setup-later-button = Plui tart

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Plate password
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Mostre password
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = In chest moment la password e je visibile sul schermi.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = In chest moment la password e je platade.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Cumò la password e je visibile sul schermi.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Cumò la password e je platade.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Selezione la nazion
input-phone-number-enter-number = Inserî il numar di telefon
input-phone-number-country-united-states = Stâts Unîts
input-phone-number-country-canada = Canadà
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Indaûr

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Chest colegament par ristabilî la password al è danezât
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Il colegament di conferme al è danezât
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Il colegament al è danezât
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Al colegament che tu âs doprât i mancjave cualchi caratar, al è probabil che il probleme al sedi stât causât dal to client di pueste eletroniche. Torne prove copiant cun atenzion la direzion.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Mandimi un gnûf colegament

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Visâsi la password?
# link navigates to the sign in page
remember-password-signin-link = Jentre

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = E-mail primarie za confermade
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Acès za confermât
confirmation-link-reused-message = Chel colegament di conferme al è za stât doprât e al è pussibil doprâlu dome une volte.

## Locale Toggle Component

locale-toggle-select-label = Selezione lenghe
locale-toggle-browser-default = Predefinide dal navigadôr
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Richieste sbaliade

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Ti covente cheste password par acedi ai dâts cifrâts che o salvìn par te.
password-info-balloon-reset-risk-info = Un ripristinament al podarès compuartâ la pierdite di dâts come passwords e segnelibris.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Sielç une password complicade che no tu âs doprât in altris sîts. Verifiche che a sedin sodisfats i recuisîts di sigurece:
password-strength-short-instruction = Sielç une password complicade:
password-strength-inline-min-length = Almancul 8 caratars
password-strength-inline-not-email = No compagne de direzion e-mail
password-strength-inline-not-common = No une password di ûs comun
password-strength-inline-confirmed-must-match = La conferme e corispuint ae gnove password
password-strength-inline-passwords-match = Lis passwords a corispuindin

## Notification Promo Banner component

account-recovery-notification-cta = Cree
account-recovery-notification-header-value = No sta pierdi i tiei dâts se tu dismenteis la password
account-recovery-notification-header-description = Cree une clâf di recupar dal account par ripristinâ i tiei dâts di navigazion sincronizâts tal câs che tu ti dismenteis la password.
recovery-phone-promo-cta = Zonte telefon pal recupar dal account
recovery-phone-promo-heading = Zonte une protezion in plui al to account cul telefon pal recupar dal account
recovery-phone-promo-description = Cumò tu puedis jentrâ cuntune password a utilizazion ugnule vie SMS se no tu rivis a doprâ la tô aplicazion di autenticazion in doi passaçs.
recovery-phone-promo-info-link = Altris informazions sul recupar e sui risis leâts al "scambi SIM"
promo-banner-dismiss-button =
    .aria-label = Siere strisson

## Ready component

ready-complete-set-up-instruction = Finìs la configurazion inserint la gnove password sui altris dispositîfs { -brand-firefox }.
manage-your-account-button = Gjestìs il to account
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Cumò tu sês pront par doprâ { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Cumò tu sês pront par doprâ lis impostazions dal account
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Il to account al è pront!
ready-continue = Continue
sign-in-complete-header = Acès confermât
sign-up-complete-header = Account confermât
primary-email-verified-header = E-mail primarie confermade

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Puescj dulà archiviâ la tô clâf:
flow-recovery-key-download-storage-ideas-folder-v2 = Cartele suntun dispositîf sigûr
flow-recovery-key-download-storage-ideas-cloud = Spazi di archiviazion su cloud afidabil
flow-recovery-key-download-storage-ideas-print-v2 = Copie stampade te cjarte
flow-recovery-key-download-storage-ideas-pwd-manager = Gjestôr di passwords

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Zonte un sugjeriment par judâti a cjatâ la clâf
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Chest sugjeriment al varès di judâti a visâti dulà che tu âs memorizât la tô clâf di recupar dal account. O podìn mostrâtal intant che tu ristabilissis la password par recuperâ i tiei dâts.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Inserìs un sugjeriment (facoltatîf)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Fin
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Il sugjeriment al à di vê mancul di 255 caratars.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Il sugjeriment nol pues contignî caratars Unicode no sigûrs. A son consintûts dome letaris, numars, segns di puntuazion e simbui.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Atenzion
password-reset-chevron-expanded = Strenç l'avertiment
password-reset-chevron-collapsed = Slargje l'avertiment
password-reset-data-may-not-be-recovered = Al è pussibil che no si rivedi a recuperâ i dâts dal to navigadôr
password-reset-previously-signed-in-device-2 = Âstu un dispositîf dulà che tu sês za jentrât/jentrade in precedence?
password-reset-data-may-be-saved-locally-2 = Al podarès jessi pussibil che i dâts dal navigadôr a sedin salvâts su chel dispositîf. Ristabilìs la password, dopo su chel dispositîf jentre cu lis credenziâls par ripristinâ e sincronizâ i tiei dâts.
password-reset-no-old-device-2 = Âstu un gnûf dispositîf ma no tu âs acès a nissun dai tiei dispositîfs vecjos?
password-reset-encrypted-data-cannot-be-recovered-2 = Nus displâs, ma nol è pussibil recuperâ i dâts cifrâts dal to navigadôr sui servidôrs di { -brand-firefox }.
password-reset-warning-have-key = Âstu une clâf di recupar dal account?
password-reset-warning-use-key-link = Doprile cumò par ristabilî la tô password e mantignî i tiei dâts

## Alert Bar

alert-bar-close-message = Siere il messaç

## User's avatar

avatar-your-avatar =
    .alt = Il to avatar
avatar-default-avatar =
    .alt = Avatar predefinît

##


# BentoMenu component

bento-menu-title-3 = Prodots { -brand-mozilla }
bento-menu-tagline = Altris prodots di { -brand-mozilla } che a protezin la tô riservatece
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Navigadôr { -brand-firefox } par scritori
bento-menu-firefox-mobile = Navigadôr { -brand-firefox } par dispositîfs mobii
bento-menu-made-by-mozilla = Fat di { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Oten { -brand-firefox } sul celulâr o sul tablet
connect-another-find-fx-mobile-2 = Cjate { -brand-firefox } in { -google-play } e { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Discjame { -brand-firefox } su { -google-play }
connect-another-app-store-image-3 =
    .alt = Discjame { -brand-firefox } su { -app-store }

## Connected services section

cs-heading = Servizis conetûts
cs-description = Ducj i servizis che tu âs fat l'acès e che tu stâs doprant.
cs-cannot-refresh =
    Nus displâs, al è vignût fûr un probleme tal inzornâ la liste dai
    servizis conetûts.
cs-cannot-disconnect = Client no cjatât, impussibil disconeti
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Disconetût di { $service }
cs-refresh-button =
    .title = Inzorne i servizis conetûts
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Elements doplis o che a mancjin?
cs-disconnect-sync-heading = Disconet di Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = I dâts relatîfs ae navigazion a restaran tal dispositîf <span>{ $device }</span>, ma no vignaran plui sincronizâts cul to account.
cs-disconnect-sync-reason-3 = Cuâl isal il motîf principâl pe disconession di <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Il dispositîf al è:
cs-disconnect-sync-opt-suspicious = Suspiet
cs-disconnect-sync-opt-lost = Pierdût o robât
cs-disconnect-sync-opt-old = Vecjo o sostituît
cs-disconnect-sync-opt-duplicate = Dopli
cs-disconnect-sync-opt-not-say = O preferìs no rispuindi

##

cs-disconnect-advice-confirm = Va ben, capît
cs-disconnect-lost-advice-heading = Dispositîf pierdût o robât disconetût
cs-disconnect-lost-advice-content-3 = Viodût che il to dispositîf al è stât pierdût o robât, par tignî al sigûr lis tôs informazions, tu varessis di cambiâ la tô password di { -product-mozilla-account } tes impostazions dal account. Tu varessis ancje di butâ un voli aes informazions dal produtôr dal dispositîf in merit ae cancelazion di lontan dai tiei dâts.
cs-disconnect-suspicious-advice-heading = Dispositîf suspiet disconetût
cs-disconnect-suspicious-advice-content-2 = Se pardabon il dispositîf disconetût al è suspiet, par tignî al sigûr lis tôs informazions, tu varessis di cambiâ la tô password di { -product-mozilla-account } tes impostazions dal account. Tu varessis di cambiâ ancje dutis lis altris passwords che tu âs salvât su { -brand-firefox } scrivint about:logins te sbare de direzion.
cs-sign-out-button = Disconet

## Data collection section

dc-heading = Racuelte e utilizazion dâts
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Navigadôr { -brand-firefox }
dc-subheader-content-2 = Permet al servizi di { -product-mozilla-accounts } di inviâ a { -brand-mozilla } dâts tecnics e di interazion.
dc-subheader-ff-content = Par controlâ o inzornâ lis impostazions dai dâts tecnics e di interazion dal navigadôr { -brand-firefox }, vierç lis impostazions di { -brand-firefox } e va su Riservatece e sigurece.
dc-opt-out-success-2 = Disativazion lade a bon fin. { -product-mozilla-accounts } nol mandarà a { -brand-mozilla } dâts tecnics o di interazion.
dc-opt-in-success-2 = Graciis! La condivision di chescj dâts nus jude a miorâ i { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Nus displâs, al è vignût fûr un probleme tal cambiâ lis preferencis relativis ae racuelte dai dâts
dc-learn-more = Plui informazions

# DropDownAvatarMenu component

drop-down-menu-title-2 = Menù { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Jentrât come
drop-down-menu-sign-out = Disconet
drop-down-menu-sign-out-error-2 = Nus displâs, al è vignût fûr un probleme tal disconetiti

## Flow Container

flow-container-back = Indaûr

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Torne inserìs la password par motîfs di sigurece
flow-recovery-key-confirm-pwd-input-label = Inserìs la password
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Cree une clâf di recupar dal account
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Cree une gnove clâf di recupar dal account

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Clâf di recupar dal account creade — Discjamile e salvile daurman
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Cheste clâf ti permet di recuperâ i tiei dâts se tu dismenteis la password. Discjamile cumò e conservile là che tu ti impensis di vêle — un doman no tu podarâs tornâ a cheste pagjine.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Continue cence discjariâ

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = La clâf di recupar dal account e je stade creade

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Cree une clâf di recupar dal account tal câs che tu dismenteis la password
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Cambie la tô clâf di recupar dal account
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = O cifrìn i dâts di navigazion –– passwords, segnelibris e ancjemò altri. Al è fantastic pe riservatece, ma tu podaressis pierdi i tiei dâts se tu dismenteis la password.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Ve ca parcè che al è cussì impuartant creâ une clâf di recupar dal account –– tu puedis doprâle par ripristinâ i tiei dâts.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Scomence
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Anule

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Conetiti ae aplicazion di autenticazion
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Passaç 1:</strong> scansione chest codiç QR doprant une aplicazion di autenticazion, come Duo o Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Codiç QR par configurâ la autenticazion in doi passaçs. Scansionilu o sielç “No rivistu a scansionâ il codiç QR?” par vê une clâf segrete di configurazion.
flow-setup-2fa-cant-scan-qr-button = No rivistu a scansionâ il codiç QR?
flow-setup-2fa-manual-key-heading = Inserìs il codiç a man
flow-setup-2fa-manual-key-instruction = <strong>Passaç 1:</strong> inserìs chest codiç te aplicazion di autenticazion che tu preferissis.
flow-setup-2fa-scan-qr-instead-button = Scansionâ invezit il codiç QR?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Altris informazions su lis aplicazions di autenticazion
flow-setup-2fa-button = Continue
flow-setup-2fa-step-2-instruction = <strong>Passaç 2:</strong> inserìs il codiç de aplicazion di autenticazion.
flow-setup-2fa-input-label = Inserìs il codiç a 6 cifris
flow-setup-2fa-code-error = Codiç no valit o scjadût. Controle la aplicazion di autenticazion e torne prove.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Sielç un metodi di recupar
flow-setup-2fa-backup-choice-description = Chest ti permet di completâ l’acès tal câs che no tu rivis a doprâ il to dispositîf mobil o la aplicazion di autenticazion.
flow-setup-2fa-backup-choice-phone-title = Telefon pal recupar dal account
flow-setup-2fa-backup-choice-phone-badge = Plui facil
flow-setup-2fa-backup-choice-phone-info = Ricêf un codiç di recupar vie messaç testuâl (SMS). In chest moment al è disponibil tai Stâts Unîts e in Canadà.
flow-setup-2fa-backup-choice-code-title = Codiçs di autenticazion di backup
flow-setup-2fa-backup-choice-code-badge = Plui sigûr
flow-setup-2fa-backup-choice-code-info = Cree e salve codiçs di autenticazion a ûs ugnul.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Altris informazions sul recupar e sui risis leâts al scambi di SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Inserìs il codiç di autenticazion di backup
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Inserìs un dai codiçs par confermâ che tu ju âs salvâts. Tal câs che no tu vedis la tô aplicazion di autenticazion, cence chescj codiçs al è pussibil che no tu rivedis a jentrâ.
flow-setup-2fa-backup-code-confirm-code-input = Inserìs il codiç di 10 caratars
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Fin

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Salve i codiçs di autenticazion di backup
flow-setup-2fa-backup-code-dl-save-these-codes = Tegniju di cont intun puest là che tu ti impensis. Se no tu rivis a doprâ la tô aplicazion di autenticazion, tu scugnarâs inserînt un jentrâ.
flow-setup-2fa-backup-code-dl-button-continue = Continue

##

flow-setup-2fa-inline-complete-success-banner = Autenticazion in doi passaçs ativade
flow-setup-2fa-inline-complete-backup-code = Codiçs di autenticazion di backup
flow-setup-2fa-inline-complete-backup-phone = Telefon pal recupar dal account
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Al reste { $count } codiç
       *[other] A restin { $count } codiçs
    }
flow-setup-2fa-inline-complete-backup-code-description = Cheste e je la modalitât di recupar plui sigûr se no tu rivis a jentrâ cul to dispositîf mobil o cu ls aplicazion di autenticazion.
flow-setup-2fa-inline-complete-backup-phone-description = Chest al è il metodi di recupar plui sempliç tal câs che no tu rivis a jentrâ cu la aplicazion di autenticazion.
flow-setup-2fa-inline-complete-learn-more-link = Cemût che al jude a protezi il to account
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Continue su { $serviceName }
flow-setup-2fa-prompt-heading = Configure la autenticazion in doi passaçs
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } al domande la configurazion de autenticazion in doi passaçs par mantignî il to account sul sigûr.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Pal lâ indevant tu puedis doprâ une di <authenticationAppsLink>chestis aplicazions di autenticazion</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Continue

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Inserìs il codiç di verifiche
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Al è stât inviât un codiç di 6 cifris a <span>{ $phoneNumber }</span> midiant SMS. Chest codiç al scjadarà dopo 5 minûts.
flow-setup-phone-confirm-code-input-label = Inserìs il codiç a 6 cifris
flow-setup-phone-confirm-code-button = Conferme
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Codiç scjadût?
flow-setup-phone-confirm-code-resend-code-button = Torne mande il codiç
flow-setup-phone-confirm-code-resend-code-success = Codiç mandât
flow-setup-phone-confirm-code-success-message-v2 = Zontât telefon pal recupar dal account
flow-change-phone-confirm-code-success-message = Telefon pal recupar dal account cambiât

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Verifiche il to numar di telefon
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Tu ricevarâs un SMS di { -brand-mozilla } cuntun codiç par verificâ il to numar. No sta condividi cun nissun chest codiç.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Il numar di telefon pal recupar dal account al è disponibil dome tai Stâts Unîts e in Canadà. I numars VoIP e i alias telefonics no son conseâts.
flow-setup-phone-submit-number-legal = Indicant il to numar, tu acetis che nô lu salvedin in mût di podê inviâti un messaç dome pe verifiche dal account. Al è pussibil che a vegnin aplicadis tarifis pai messaçs e pal trafic di dâts.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Mande codiç

## HeaderLockup component, the header in account settings

header-menu-open = Siere menù
header-menu-closed = Menù di navigazion dal sît
header-back-to-top-link =
    .title = Torne sù
header-back-to-settings-link =
    .title = Torne aes impostazions di { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Jutori

## Linked Accounts section

la-heading = Accounts colegâts
la-description = Tu âs autorizât l’acès a chescj accounts.
la-unlink-button = Discoleghe
la-unlink-account-button = Discoleghe
la-set-password-button = Stabilìs password
la-unlink-heading = Discoleghe dal account di tiercis parts
la-unlink-content-3 = Discolegâ pardabon il to account?
la-unlink-content-4 = Prime di scolegâ il to account tu scugnis stabilî une password. Cence une password no tu varâs nissune maniere par jentrâ dopo vê discolegât il to account.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Siere
modal-cancel-button = Anule
modal-default-confirm-button = Conferme

## ModalMfaProtected

modal-mfa-protected-title = Inserìs il codiç di conferme
modal-mfa-protected-subtitle = Judinus a verificâ che tu sedis pardabon tu a modificâ lis informazions dal to account
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Inserìs il codiç che al è stât mandât a <email>{ $email }</email> dentri di { $expirationTime } minût.
       *[other] Inserìs il codiç che al è stât mandât a <email>{ $email }</email> dentri di { $expirationTime } minûts.
    }
modal-mfa-protected-input-label = Inserìs il codiç a 6 cifris
modal-mfa-protected-cancel-button = Anule
modal-mfa-protected-confirm-button = Conferme
modal-mfa-protected-code-expired = Codiç scjadût?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Mande e-mail cul gnûf codiç.

## Modal Verify Session

mvs-verify-your-email-2 = Conferme la tô e-mail
mvs-enter-verification-code-2 = Inserìs il codiç di conferme
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Inserìs dentri di 5 minûts il codiç di conferme che al è stât inviât a <email>{ $email }</email>.
msv-cancel-button = Anule
msv-submit-button-2 = Conferme

## Settings Nav

nav-settings = Impostazions
nav-profile = Profîl
nav-security = Sigurece
nav-connected-services = Servizis conetûts
nav-data-collection = Racuelte e utilizazion dâts
nav-paid-subs = Abonaments a paiament
nav-email-comm = Comunicazions vie e-mail

## Page2faChange

page-2fa-change-title = Cambie la autenticazion in doi passaçs
page-2fa-change-success = La autenticazion in doi passaçs e je stade inzornade
page-2fa-change-totpinfo-error = Al è vignût fûr un erôr tal sostituî la tô aplicazion di autenticazion in doi passaçs. Torne prove plui indevant.
page-2fa-change-qr-instruction = <strong>Passaç 1:</strong> scansione chst codiç QR doprant une aplicazion di autenticazion, come Duo o Google Authenticator. Cheste operazion e cree une gnove conession, dutis lis conessions esistentis a smetaran di funzionâ.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Codiçs di autenticazion di backup
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Al è vignût fûr un probleme tal sostituî i tiei codiçs di autenticazion di backup
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Al è vignût fûr un probleme tal creâ i tiei codiçs di autenticazion di backup
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Codiçs di autenticazion di backup inzornâts
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Codiçs di autenticazion di backup creâts
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Tegniju intun puest facil di impensâsi. I codiçs vecjos a vignaran sostituîts ae fin dal prossim passaçs.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Inserint un di chei codiçs tu confermis che tu ju âs salvâts. I tiei vecjos codiçs di autenticazion di backup a vignaran disativâts une volte completât chest passaç.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Codiç di autenticazion di backup sbaliât

## Page2faSetup

page-2fa-setup-title = Autenticazion in doi passaçs
page-2fa-setup-totpinfo-error = Al è vignût fûr un erôr tal configurâ la autenticazion in doi passaçs. Torne prove plui tart.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Chel codiç nol è just. Torne prove.
page-2fa-setup-success = La autenticazion in doi passaçs e je stade ativade

## Avatar change page

avatar-page-title =
    .title = Imagjin dal profîl
avatar-page-add-photo = Zonte une foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fâs une foto
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Gjave foto
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Torne fâs une foto
avatar-page-cancel-button = Anule
avatar-page-save-button = Salve
avatar-page-saving-button = Daûr a salvâ…
avatar-page-zoom-out-button =
    .title = Impiçulìs
avatar-page-zoom-in-button =
    .title = Ingrandìs
avatar-page-rotate-button =
    .title = Volte
avatar-page-camera-error = Impussibil inizializâ la fotocjamare
avatar-page-new-avatar =
    .alt = gnove imagjin di profîl
avatar-page-file-upload-error-3 = Al è vignût fûr un probleme tal cjariâ in rêt la imagjin dal profîl
avatar-page-delete-error-3 = Al è vignût fûr un probleme tal eliminâ la foto dal profîl
avatar-page-image-too-large-error-2 = Il file de imagjin al è masse grant par podêlu cjariâ in rêt

## Password change page

pw-change-header =
    .title = Cambie password
pw-8-chars = Almancul 8 caratars
pw-not-email = No compagne de to direzion e-mail
pw-change-must-match = La gnove password e corispuint ae conferme
pw-commonly-used = No une password di ûs comun
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Reste al sigûr — no sta tornâ a doprâ passwords. Viôt altris sugjeriments par <linkExternal>creâ passwords complessis</linkExternal>.
pw-change-cancel-button = Anule
pw-change-save-button = Salve
pw-change-forgot-password-link = Password dismenteade?
pw-change-current-password =
    .label = Inserìs la password atuâl
pw-change-new-password =
    .label = Inserìs une gnove password
pw-change-confirm-password =
    .label = Conferme la gnove password
pw-change-success-alert-2 = Password inzornade

## Password create page

pw-create-header =
    .title = Creazion password
pw-create-success-alert-2 = Password stabilide
pw-create-error-2 = Nus diplâs, al è vignût fûr un probleme tal configurâ la password

## Delete account page

delete-account-header =
    .title = Elimine account
delete-account-step-1-2 = Passaç 1 di 2
delete-account-step-2-2 = Passaç 2 di 2
delete-account-confirm-title-4 = Tu podaressis vê colegât il to { -product-mozilla-account } a un o plui di chescj prodots o servizis { -brand-mozilla } che ti garantissin une esperience sul web sigure e produtive:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sincronizazion dâts in { -brand-firefox }
delete-account-product-firefox-addons = Components adizionâi in { -brand-firefox }
delete-account-acknowledge = Eliminant il to account tu ricognossis che:
delete-account-chk-box-2 =
    .label = Tu podaressis pierdi cualchi dât e funzionalitât che a fasin part dai prodots { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Ancje tornant a ativâ l’account cu la direzion e-mail atuâl, al è pussibil che no tu ripristinis lis informazions salvadis
delete-account-chk-box-4 =
    .label = Ducj i temis e lis estensions che tu âs publicât su addons.mozilla.org a vignaran eliminâts
delete-account-continue-button = Continue
delete-account-password-input =
    .label = Inserìs la password
delete-account-cancel-button = Anule
delete-account-delete-button-2 = Elimine

## Display name page

display-name-page-title =
    .title = Non visualizât
display-name-input =
    .label = Inserìs il non visualizât
submit-display-name = Salve
cancel-display-name = Anule
display-name-update-error-2 = Al è vignût fûr un probleme tal inzornâ il non visualizât
display-name-success-alert-2 = In non visualizât al è stât inzornât

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Ativitât resinte dal account
recent-activity-account-create-v2 = Account creât
recent-activity-account-disable-v2 = Account disativât
recent-activity-account-enable-v2 = Account ativât
recent-activity-account-login-v2 = Acès al account scomençât
recent-activity-account-reset-v2 = Ripristinament password scomençât
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Notifichis di mancjât recapit de pueste netadis
recent-activity-account-login-failure = Tentatîf di acès al account falît
recent-activity-account-two-factor-added = Autenticazion in doi passaçs ativade
recent-activity-account-two-factor-requested = Autenticazion in doi passaçs domandade
recent-activity-account-two-factor-failure = Autenticazion in doi passaçs falide
recent-activity-account-two-factor-success = Autenticazion in doi passaçs lade a bon fin
recent-activity-account-two-factor-removed = Autenticazion in doi passaçs disativade
recent-activity-account-password-reset-requested = Ripristinament de password domandade pal account
recent-activity-account-password-reset-success = Ripristinament de password dal account lât a bon fin
recent-activity-account-recovery-key-added = Clâf di recupar dal account ativade
recent-activity-account-recovery-key-verification-failure = Verifiche de clâf di recupar dal account falide
recent-activity-account-recovery-key-verification-success = Verifiche de clâf di recupar dal account lade a bon fin
recent-activity-account-recovery-key-removed = Eliminade clâf di recupar dal account
recent-activity-account-password-added = Gnove password zontade
recent-activity-account-password-changed = Password modificade
recent-activity-account-secondary-email-added = Direzion e-mail secondarie zontade
recent-activity-account-secondary-email-removed = Direzion e-mail secondarie gjavade
recent-activity-account-emails-swapped = Direzions e-mails primarie e secondarie scambiadis
recent-activity-session-destroy = Disconetût de session
recent-activity-account-recovery-phone-send-code = Il codiç al è stât inviât al telefon pal recupar dal account
recent-activity-account-recovery-phone-setup-complete = Configurazion dal telefon pal recupar dal account completade
recent-activity-account-recovery-phone-signin-complete = Acès cul telefon di recupar dal account completât
recent-activity-account-recovery-phone-signin-failed = Acès cul telefon pal recupar dal account falît
recent-activity-account-recovery-phone-removed = Il numar di telefon pal recupar dal account al è stât gjavât
recent-activity-account-recovery-codes-replaced = Codiçs di recupar sostituîts
recent-activity-account-recovery-codes-created = Codiçs di recupar creâts
recent-activity-account-recovery-codes-signin-complete = L’acès cui codiçs di recupar al è stât completât
recent-activity-password-reset-otp-sent = Inviât codiç di conferme par ristabilî la password
recent-activity-password-reset-otp-verified = Verificât codiç di conferme par ristabilî la password
recent-activity-must-reset-password = Necessari ristabilî la password
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Altris ativitâts dal account

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Clâf di recupar dal account
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Torne aes impostazions

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Gjave il numar di telefon pal recupar dal account
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Chest al gjavarà <strong>{ $formattedFullPhoneNumber }</strong> tant che numar di telefon pal recupar dal account.
settings-recovery-phone-remove-recommend = Ti conseìn di mantignî chest metodi parcè che al è plui sempliç che salvâ i codiçs di autenticazion di backup.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Se tu lu eliminis, verifiche di vê ancjemò i codiçs di autenticazion di backup che tu vevis salvât. <linkExternal>Paragone i metodis di recupar</linkExternal>
settings-recovery-phone-remove-button = Gjave numar di telefon
settings-recovery-phone-remove-cancel = Anule
settings-recovery-phone-remove-success = Il numar di telefon pal recupar dal account al è stât gjavât

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Zonte numar di telefon di recupar
page-change-recovery-phone = Cambie telefon pal recupar dal account
page-setup-recovery-phone-back-button-title = Torne aes impostazions
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Cambie numar di telefon

## Add secondary email page

add-secondary-email-step-1 = Passaç 1 di 2
add-secondary-email-error-2 = Al è vignût fûr un probleme tal creâ cheste e-mail
add-secondary-email-page-title =
    .title = E-mail secondarie
add-secondary-email-enter-address =
    .label = Inserìs la tô direzion e-mail
add-secondary-email-cancel-button = Anule
add-secondary-email-save-button = Salve
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Nol è pussibil doprâ lis mascaris di e-mail come e-mail secondarie

## Verify secondary email page

add-secondary-email-step-2 = Passaç 2 di 2
verify-secondary-email-page-title =
    .title = E-mail secondarie
verify-secondary-email-verification-code-2 =
    .label = Inserìs il codiç di conferme
verify-secondary-email-cancel-button = Anule
verify-secondary-email-verify-button-2 = Conferme
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Inserìs dentri di 5 minûts il codiç di conferme che al è stât mandât a <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Direzion { $email } zontade cun sucès

##

# Link to delete account on main Settings page
delete-account-link = Elimine account
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Acès eseguît cun sucès. Il to { -product-mozilla-account } e i tiei dâts a restaran atîfs.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Scuvierç dulà che a vegnin metudis fûr lis tôs informazions personâls e torne cjape il control
# Links out to the Monitor site
product-promo-monitor-cta = Oten une scansion gratuite

## Profile section

profile-heading = Profîl
profile-picture =
    .header = Imagjin
profile-display-name =
    .header = Non visualizât
profile-primary-email =
    .header = E-mail primarie

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Passaç { $currentStep } di { $numberOfSteps }.

## Security section of Setting

security-heading = Sigurece
security-password =
    .header = Password
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Date di creazion: { $date }
security-not-set = No configurade
security-action-create = Cree
security-set-password = Stabilìs une password par sincronizâ e doprâ ciertis funzions di sigurece dal account.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Visualize lis ativitâts resintis dal account
signout-sync-header = Session scjadude
signout-sync-session-expired = Nus displâs, alc al è lât strucj. Disconetiti dal menù dal navigadôr e torne prove.

## SubRow component

tfa-row-backup-codes-title = Codiçs di autenticazion di backup
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nissun codiç disponibil
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Al reste { $numCodesAvailable } codiç
       *[other] A restin { $numCodesAvailable } codiçs
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Cree gnûfs codiçs
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Zonte
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Chest al è il metodi di recupar plui sigûr se no tu puedis doprâ il to dispositîf mobil o la aplicazion di autenticazion.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Telefon pal recupar dal account
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nissun numar di telefon zontât
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Modifiche
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Zonte
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Gjave
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Gjave il numar di telefon pal recupar dal account
tfa-row-backup-phone-delete-restriction-v2 = Se tu desideris gjavâ il numar di telefon pal recupar dal account, zonte i codiçs di autenticazion di backup o disative la autenticazion in doi passaçs par evitâ di restâ taiât fûr dal to account.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Chest al è il metodi di recupar plui sempliç se no tu puedis doprâ la aplicazion di autenticazion.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Informazions sui risis leâts al scambi di SIM (SIM swap)

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Disative
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Ative
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Daûr a inviâ…
switch-is-on = atîf
switch-is-off = disativât

## Sub-section row Defaults

row-defaults-action-add = Zonte
row-defaults-action-change = Modifiche
row-defaults-action-disable = Disative
row-defaults-status = Nissun

## Account recovery key sub-section on main Settings page

rk-header-1 = Clâf di recupar dal account
rk-enabled = Ativade
rk-not-set = No configurade
rk-action-create = Cree
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Modifiche
rk-action-remove = Gjave
rk-key-removed-2 = Eliminade clâf di recupar dal account
rk-cannot-remove-key = Nol è pussibil gjavâ la clâf di recupar dal account.
rk-refresh-key-1 = Inzorne la clâf di recupar dal account
rk-content-explain = Ripristine i dâts tal câs di password dismenteade.
rk-cannot-verify-session-4 = Nus displâs, al è vignût fûr un probleme tal confermâ la tô session
rk-remove-modal-heading-1 = Gjavâ la clâf di recupar dal account?
rk-remove-modal-content-1 =
    Tal câs che tu decidis di ristabilî la tô password, no tu
    rivarâs a doprâ la tô clâf di recupar dal account par acedi ai tiei dâts. Nol è pussibil tornâ indaûr di cheste azion.
rk-remove-error-2 = Nol è pussibil gjavâ la clâf di recupar dal account
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Elimine la clâf di recupar dal account

## Secondary email sub-section on main Settings page

se-heading = E-mail secondarie
    .header = E-mail secondarie
se-cannot-refresh-email = Nus displâs, al è vignût fûr un probleme tal inzornâ chê e-mail.
se-cannot-resend-code-3 = Nus displâs, al è vignût fûr un probleme tal tornâ a inviâ il codiç di conferme
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } e je cumò la tô e-mail primarie
se-set-primary-error-2 = Nus displâs, al è vignût fûr un probleme tal cambiâ la tô e-mail primarie
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } eliminade cun sucès
se-delete-email-error-2 = Nus displâs, al è vignût fûr un probleme tal eliminâ cheste e-mail
se-verify-session-3 = Tu varâs di confermâ la session in cors par fâ cheste azion
se-verify-session-error-3 = Nus displâs, al è vignût fûr un probleme tal confermâ la tô session
# Button to remove the secondary email
se-remove-email =
    .title = Gjave la e-mail
# Button to refresh secondary email status
se-refresh-email =
    .title = Inzorne la e-mail
se-unverified-2 = no confermade
se-resend-code-2 =
    Conferme necessarie. <button>Torne mande il codiç di conferme</button>
    se no tu lu cjatis te casele di pueste in jentrade o tal spam.
# Button to make secondary email the primary
se-make-primary = Rint primarie
se-default-content = Doprile par acedi al to account se no tu rivis a jentrâ cu la e-mail primarie.
se-content-note-1 =
    Note: nol è pussibil ripristinâ i dâts midiant la e-mail secondarie — par
    chê operazion ti coventarà une <a>clâf di recupar dal account</a>.
# Default value for the secondary email
se-secondary-email-none = Nissune

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autenticazion in doi passaçs
tfa-row-enabled = Ativade
tfa-row-disabled-status = Disativade
tfa-row-action-add = Zonte
tfa-row-action-disable = Disative
tfa-row-action-change = Modifiche
tfa-row-button-refresh =
    .title = Ripristine la autenticazion in doi passaçs
tfa-row-cannot-refresh =
    Nus displâs, al è vignût fûr un probleme tal inzornament
    de autenticazion in doi passaçs.
tfa-row-enabled-description = Il to account al è protet de autenticazion in doi passaçs. Tu varâs di inserî un codiç a ûs singul de tô aplicazion di autenticazion cuant che tu jentrarâs tal to { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Cemût che al jude a protezi il to account
tfa-row-disabled-description-v2 = Protêç il to account doprant une aplicazion di autenticazion di tiercis parts tant che secont passaç par jentrâ.
tfa-row-cannot-verify-session-4 = Nus displâs, al è vignût fûr un probleme tal confermâ la tô session
tfa-row-disable-modal-heading = Disativâ la autenticazion in doi passaçs?
tfa-row-disable-modal-confirm = Disative
tfa-row-disable-modal-explain-1 =
    No tu rivarâs a tornâ indaûr di cheste azion. In
    alternative tu puedis <linkExternal>sostituî i tiei codiçs di autenticazion di backup</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Autenticazion in doi passaçs disativade
tfa-row-cannot-disable-2 = Impussibil disativâ la autenticazion in doi passaçs
tfa-row-verify-session-info = Tu scugnis confermâ la session corinte par configurâ la autenticaczion in doi passaçs

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Se tu continuis tu acetis:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Cundizions di utilizazion dal servizi</mozSubscriptionTosLink> e <mozSubscriptionPrivacyLink>Informative su la riservatece</mozSubscriptionPrivacyLink> dai servizis in abonament { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Tiermins dal servizi</mozillaAccountsTos> e <mozillaAccountsPrivacy>informative su la riservatece</mozillaAccountsPrivacy> dai { -product-mozilla-accounts }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Se tu continuis tu acetis lis <mozillaAccountsTos>cundizions di utilizazion dal servizi</mozillaAccountsTos> e la <mozillaAccountsPrivacy>informative su la riservatece</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Opûr
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Jentre cun
continue-with-google-button = Continue cun { -brand-google }
continue-with-apple-button = Continue cun { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Account no cognossût
auth-error-103 = Password sbaliade
auth-error-105-2 = Codiç di conferme no valit
auth-error-110 = Gjeton no valit
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Tu âs provât masse voltis. Torne prove plui tart.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Tu âs provât masse voltis. Torne prove { $retryAfter }.
auth-error-125 = La richieste e je stade blocade par motîfs di sigurece
auth-error-129-2 = Tu âs inserît un numar di telefon che nol è valit. Controlilu e torne prove.
auth-error-138-2 = Session no confermade
auth-error-139 = La e-mail secondarie e à di sei diferente di chê principâl dal to account
auth-error-155 = Gjeton TOTP no cjatât
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Codiç di autenticazion di backup no cjatât
auth-error-159 = Clâf di recupar dal account no valide
auth-error-183-2 = Codiç di conferme scjadût o no valit
auth-error-202 = Funzionalitât no abilitade
auth-error-203 = Il sisteme nol è disponibil, torne prove chi di pôc
auth-error-206 = Impussibil creâ la password, la password e je za stade stabilide
auth-error-214 = Il numar di telefon pal recupar dal account al esist za
auth-error-215 = Il numar di telefon pal recupar dal account nol esist
auth-error-216 = Si è rivâts al limit dai messaçs di test
auth-error-218 = Impussibil gjavâ il numar di telefon pal recupar dal account, a mancjin i codiçs di autenticazion di backup.
auth-error-219 = Chest numar di telefon al è stât regjistrât cun masse accounts. Prove cuntun altri numar.
auth-error-999 = Erôr inspietât
auth-error-1001 = Tentatîf di acès anulât
auth-error-1002 = Session scjadude. Jentre par continuâ.
auth-error-1003 = La archiviazion locâl o i cookies a son ancjemò disativâts
auth-error-1008 = La gnove password e scugne jessi diferente
auth-error-1010 = E covente une gnove password valide
auth-error-1011 = Al è necessari inserî une direzion e-mail valide
auth-error-1018 = La e-mail di conferme e je a pene stade ricusade al mitent. Direzion e-mail scrite mâl?
auth-error-1020 = E-mail scrite mâl? firefox.com nol è un servizi di pueste eletroniche valit
auth-error-1031 = Par completâ la regjistrazion tu scugnis inserî la tô etât
auth-error-1032 = Par completâ la regjistrazion tu cugnis inserî une etât valide
auth-error-1054 = Il codiç di autenticazion in doi passaçs nol è valit
auth-error-1056 = Il codiç di autenticazion di backup nol è valit
auth-error-1062 = Dirotament no valit
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = E-mail scrite mâl? { $domain } nol è un servizi di pueste eletroniche valit
auth-error-1066 = Nol è pussibil doprâ lis mascaris di e-mail par creâ un account.
auth-error-1067 = Erôrs di batidure pe e-mail?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Numar che al finìs cun { $lastFourPhoneNumber }
oauth-error-1000 = Alc al è lât strucj. Siere cheste schede e torne prove.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Tu âs fat l’acès a { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-mail confermade
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Acès confermât
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Jentre su chest { -brand-firefox } par completâ la configurazion
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Jentre
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Stâstu zontant ancjemò dispositîfs? Jentre in { -brand-firefox } suntun altri dispositîf par completâ la configurazion
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = jentre in { -brand-firefox } suntun altri dispositîf par completâ la configurazion
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Desideristu vê lis tôs schedis, i tiei segnelibris e lis tôs passwords suntun altri dispositîf?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Conet un altri dispositîf
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = No cumò
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Jentre in { -brand-firefox } par Android par completâ la configurazion
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Jentre in { -brand-firefox } par iOS par completâ la configurazion

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Al è necessari ativâ la archiviazion locâl e i cookies
cookies-disabled-enable-prompt-2 = Ative i cookies e la archiviazion locâl tal to navigadôr par acedi al { -product-mozilla-account }. Se tu lu fasis tu ativarâs lis funzionalitâts come la memorizazion dal utent tra lis sessions.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Torne prove
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Plui informazions

## Index / home page

index-header = Inserìs la tô e-mail
index-sync-header = Continue al to { -product-mozilla-account }
index-sync-subheader = Sincronize passwords, schedis e segnelibris dapardut là che tu dopris { -brand-firefox }.
index-relay-header = Cree une mascare di e-mail
index-relay-subheader = Indiche la direzion de e-mail dulà che tu vuelis mandâ indenant la pueste de tô mascare di pueste eletroniche.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Continue su { $serviceName }
index-subheader-default = Passe aes impostazions dal account
index-cta = Regjistriti o jentre
index-account-info = Un { -product-mozilla-account } al permet ancje di acedi a altris prodots { -brand-mozilla } pe protezion de riservatece.
index-email-input =
    .label = Inserìs la tô e-mail
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Account eliminât cun sucès
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = La e-mail di conferme e je a pene stade ricusade al mitent. Direzion e-mail scrite mâl?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Orpo! No sin rivâts a creâ la tô clâf di recupar dal account. Torne prove plui tart.
inline-recovery-key-setup-recovery-created = La clâf di recupar dal account e je stade creade
inline-recovery-key-setup-download-header = Protêç il to account
inline-recovery-key-setup-download-subheader = Discjamile e salvile daurman
inline-recovery-key-setup-download-info = Salve cheste clâf di cualchi bande dulà che tu ti visis — no tu podarâs tornâ su cheste pagjine plui indevant.
inline-recovery-key-setup-hint-header = Racomandazion di sigurece

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Anule configurazion
inline-totp-setup-continue-button = Continue
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Zonte un strât di sigurece al to account domandant i codiçs di autenticazion di une di <authenticationAppsLink>chestis aplicazions di autenticazion</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Ative la autenticazion in doi passaçs <span>par continuâ cu lis impostazions dal account</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Ative la autenticazion in doi passaçs <span>par continuâ su { $serviceName }</span>
inline-totp-setup-ready-button = Pront
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scansione il codiç di autenticazion <span>par continuâ su { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Inserìs il codiç a man <span>par continuâ su { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scansione il codiç di autenticazion <span>par continuâ cu lis impostazions dal account</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Inserìs il codiç a man <span>par continuâ cu lis impostazions dal account</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Scrîf cheste clâf segrete te tô aplicazion di autenticazion. <toggleToQRButton>O preferissistu scansionâ il codiç QR?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scansione il codiç QR te tô aplicazion di autenticazion e inserìs il codiç che ti da. <toggleToManualModeButton>Nol è pussibil fâ la scansion dal codiç?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Une volte completât, al scomençarà a gjenerâ codiçs di autenticazion di inserî.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Codiç di autenticazion
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Codiç di autenticazion necessari
tfa-qr-code-alt = Dopre il codiç { $code } par configurâ la autenticazion in doi passaçs tes aplicazions supuartadis.
inline-totp-setup-page-title = Autenticazion in doi passaçs

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Notis legâls
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Cundizions di utilizazion dal servizi
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Informative su la riservatece

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Informative su la riservatece

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Tiermins dal servizi

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Âstu a pene fat l’acès a { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Sì, aprove il dispositîf
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Se no tu jeris tu, <link>cambie la tô password</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Dispositîf conetût
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Cumò tu ti stâs sincronizant cun: { $deviceFamily } su { $deviceOS }
pair-auth-complete-sync-benefits-text = Cumò tu puedis acedi aes schedis viertis, aes passwords e ai segnelibris su ducj i tiei dispositîfs.
pair-auth-complete-see-tabs-button = Visualize lis schedis di altris dispositîfs sincronizâts
pair-auth-complete-manage-devices-link = Gjestìs dispositîfs

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Inserìs il codiç di autenticazion <span>par continuâ cu lis impostazions dal account</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Inserìs il codiç di autenticazion <span>par continuâ su { $serviceName }</span>
auth-totp-instruction = Vierç la aplicazion di autenticazion e inserìs il codiç di autenticazion che ti da.
auth-totp-input-label = Inserìs il codiç a 6 cifris
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Conferme
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Codiç di autenticazion necessari

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = E je necessarie cumò la aprovazion <span>di chel altri dispositîf</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Associazion lade strucje
pair-failure-message = Il procès di instalazion al è stât terminât.

## Pair index page

pair-sync-header = Sincronize { -brand-firefox } sul to telefon o tablet
pair-cad-header = Conet { -brand-firefox } suntun altri dispositîf
pair-already-have-firefox-paragraph = Dopristu za { -brand-firefox } suntun telefon o tablet?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sincronize il to dispositîf
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Opûr discjamilu
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scansione par discjariâ { -brand-firefox } par dispositîfs mobii opûr manditi un <linkExternal>colegament par discjariâ</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = No cumò
pair-take-your-data-message = Puarte cun te schedis, segnelibris e passwords dapardut là che tu dopris { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Scomence
# This is the aria label on the QR code image
pair-qr-code-aria-label = Codiç QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Dispositîf conetût
pair-success-message-2 = Associazion lade ben.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Conferme associazion <span>par { $email }</span>
pair-supp-allow-confirm-button = Conferme associazion
pair-supp-allow-cancel-link = Anule

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = E je necessarie cumò la aprovazion <span>di chel altri dispositîf</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Associe doprant une aplicazion
pair-unsupported-message = Âstu doprât la fotocjamare di sisteme? Tu scugnis associâ dal didentri di une aplicazion { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Cree une password par sincronizâ
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Cheste operazion e cifre i tiei dâts. E à di jessi divierse di chê dal to account { -brand-google } o { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Par plasê spiete, al è in cors il dirotament su la aplicazion autorizade.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Inserìs la clâf di recupar dal account
account-recovery-confirm-key-instruction = Cheste clâf ti permet di recuperâ i dâts di navigazion cifrâts, come passwords e segnelibris, dai servidôrs di { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Inserìs la clâf di recupar dal account a 32 caratars
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Il to sugjeriment pe archiviazion al è:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Continue
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = No rivistu a cjatâ la tô clâf di recupar dal account?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Cree une gnove password
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Password stabilide
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Nus displâs, al è vignût fûr un probleme tal configurâ la tô password
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Dopre la clâf di recupar dal account
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = La tô password e je stade ripristinade.
reset-password-complete-banner-message = No sta dismenteâti di gjenerâ une gnove clâf di recupar dal account da lis impostazions dal to { -product-mozilla-account } par evitâ problemis di acès in futûr.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Dopo fat l'acès, { -brand-firefox } al cirarà di tornâ a mandâti ae pagjine par doprâ la mascare di pueste eletroniche.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Inserìs il codiç di 10 caratars
confirm-backup-code-reset-password-confirm-button = Conferme
confirm-backup-code-reset-password-subheader = Inserìs il codiç di autenticazion di backup
confirm-backup-code-reset-password-instruction = Inserìs un dai codiçs ad ûs singul che tu âs salvât cuant che tu âs configurade la autenticazion in doi passaçs.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Sêstu taiât/taiade fûr dal to account?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Controle la tô e-mail
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Ti vin mandât un codiç di conferme su <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Inserî il codiç di 8 cifris dentri di 10 minûts
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Continue
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Torne mande il codiç
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Dopre un altri account

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Ristabilìs la tô password
confirm-totp-reset-password-subheader-v2 = Inserìs il codiç di autenticazion in doi passaçs
confirm-totp-reset-password-instruction-v2 = Controle la <strong>aplicazion di autenticazion</strong> par riconfigurâ la password.
confirm-totp-reset-password-trouble-code = Problemis a inserî il codiç?
confirm-totp-reset-password-confirm-button = Conferme
confirm-totp-reset-password-input-label-v2 = Inserìs il codiç a 6 cifris
confirm-totp-reset-password-use-different-account = Dopre un altri account

## ResetPassword start page

password-reset-flow-heading = Ristabilìs la tô password
password-reset-body-2 =
    Par mantignî al sigûr il to account, ti domandarìn cualchi informazion
    che nome tu tu cognossis.
password-reset-email-input =
    .label = Inserìs la tô e-mail
password-reset-submit-button-2 = Continue

## ResetPasswordConfirmed

reset-password-complete-header = La password e je stade ristabilide
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Continue su { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Ristabilìs la tô password
password-reset-recovery-method-subheader = Sielç un metodi di recupar
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Controlìn la tô identitât prime di doprâ i metodis di recupar sielts.
password-reset-recovery-method-phone = Telefon pal recupar dal account
password-reset-recovery-method-code = Codiçs di autenticazion di backup
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] al reste { $numBackupCodes } codiç
       *[other] a restin { $numBackupCodes } codiçs
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Al è vignût fûr un probleme tal mandâ il codiç al telefon pal recupar dal account
password-reset-recovery-method-send-code-error-description = Torne prove plui indevant o dopre i tiei codiçs di autenticazion di backup.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Ristabilìs la tô password
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Inserìs il codiç di recupar
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Al è stât inviât un SMS cuntun codiç di 6 cifris al numar che al finìs par <span>{ $lastFourPhoneDigits }</span>. Chest codiç al scjât dopo 5 minûts. No sta condividi chest codiç cun nissun.
reset-password-recovery-phone-input-label = Inserìs il codiç a 6 cifris
reset-password-recovery-phone-code-submit-button = Conferme
reset-password-recovery-phone-resend-code-button = Torne mande il codiç
reset-password-recovery-phone-resend-success = Codiç mandât
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Sêstu taiât/taiade fûr dal to account?
reset-password-recovery-phone-send-code-error-heading = Al è vignût fûr un probleme tal inviâ il codiç
reset-password-recovery-phone-code-verification-error-heading = Al è vignût fûr un probleme tal verificâ il codiç
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Torne prove plui tart.
reset-password-recovery-phone-invalid-code-error-description = Il codiç nol è valit o al è scjadût.
reset-password-recovery-phone-invalid-code-error-link = Doprâ invezit i codiç di autenticazion di backup?
reset-password-with-recovery-key-verified-page-title = Ripristinament password lât ben
reset-password-complete-new-password-saved = Gnove password salvade!
reset-password-complete-recovery-key-created = E je stade creade une gnove clâf di recupar dal account. Discjamile e salvile daurman.
reset-password-complete-recovery-key-download-info =
    Cheste clâf e je essenziâl par
    recuperâ i dâts se tu ti dismenteis la password. <b>Discjamile e salvile in mût sigûr
    daurman, viodût che no tu rivarâs a acedi a cheste pagjine plui indevant.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Erôr:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Convalide dal acès…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Erôr te conferme
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Colegament di conferme scjadût
signin-link-expired-message-2 = Tu âs fat clic suntun colegament che al è scjadût o che al è za stât doprât.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Inserìs la password <span>pal to { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Continue su { $serviceName }
signin-subheader-without-logo-default = Passe aes impostazions dal account
signin-button = Jentre
signin-header = Jentre
signin-use-a-different-account-link = Dopre un altri account
signin-forgot-password-link = Password dismenteade?
signin-password-button-label = Password
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Dopo fat l'acès, { -brand-firefox } al cirarà di tornâ a mandâti ae pagjine par doprâ la mascare di pueste eletroniche.
signin-code-expired-error = Codiç scjadût. Torne jentre par plasê.
signin-account-locked-banner-heading = Ristabilìs la tô password
signin-account-locked-banner-description = O vin blocât il to account par prodtezilu di ativitâts suspietis.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Ristabilìs la tô password par jentrâ

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Al colegament che tu âs doprât i mancjave cualchi caratar, al è probabil che il probleme al sedi stât causât dal to client di pueste eletroniche. Torne prove copiant cun atenzion la direzion.
report-signin-header = Segnalâ acès cence autorizazion?
report-signin-body = Tu âs ricevût une e-mail in merit a un tentatîf di acès al to account. Desideristu segnalâ cheste ativitât tant che suspiete?
report-signin-submit-button = Segnale ativitât suspiete
report-signin-support-link = Ce staial sucedint?
report-signin-error = Nus displâs, al è vignût fûr un probleme tal inviâ la segnalazion.
signin-bounced-header = Nus displâs, l’account al è stât blocât.
# $email (string) - The user's email.
signin-bounced-message = La e-mail di conferme che o vin mandât a { $email } e je tornade indaûr. Duncje o vin blocât il to account par protezi i tiei dâts di { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Se tu sâs di vê inseride une direzion e-mail valide, <linkExternal>contatinus</linkExternal> e ti judarìn a sblocâ l’account.
signin-bounced-create-new-account = No tu controlis plui chê e-mail? Cree un gnûf account
back = Indaûr

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Verifiche chestis credenziâls <span>par passâ aes impostazions dal account</span>
signin-push-code-heading-w-custom-service = Verifiche chestis credenziâls <span>par continuâ su { $serviceName }</span>
signin-push-code-instruction = Controle chei altris dispositîfs e aprove chest acès dal navigadôr { -brand-firefox }.
signin-push-code-did-not-recieve = No âstu ricevude la notifiche?
signin-push-code-send-email-link = Mande codiç vie e-mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Conferme il to acès
signin-push-code-confirm-description = O vin rilevât un tentatîf di acès che al rive di chest dispositîf. Se tu jeris tu, conferme l’acès
signin-push-code-confirm-verifying = Daûr a verificâ
signin-push-code-confirm-login = Conferme l’acès
signin-push-code-confirm-wasnt-me = No jeri jo, cambie la password.
signin-push-code-confirm-login-approved = Il to acès al è stât aprovât. Siere chest barcon.
signin-push-code-confirm-link-error = Il colegament al è rot. Torne prove.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Jentre
signin-recovery-method-subheader = Sielç un metodi di recupar
signin-recovery-method-details = Controlìn la tô identitât prime di doprâ i metodis di recupar sielts.
signin-recovery-method-phone = Telefon pal recupar dal account
signin-recovery-method-code-v2 = Codiçs di autenticazion di backup
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Al reste { $numBackupCodes } codiç
       *[other] A restin { $numBackupCodes } codiçs
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Al è vignût fûr un probleme tal mandâ il codiç al telefon pal recupar dal account
signin-recovery-method-send-code-error-description = Torne prove plui indevant o dopre i tiei codiçs di autenticazion di backup.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Jentre
signin-recovery-code-sub-heading = Inserìs il codiç di autenticazion di backup
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Inserìs un dai codiçs ad ûs singul che tu âs salvât cuant che tu âs configurade la autenticazion in doi passaçs.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Inserìs il codiç di 10 caratars
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Conferme
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Dopre il telefon pal recupar dal account
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Sêstu taiât/taiade fûr dal to account?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Al covente il codiç di autenticazion di backup
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Al è vignût fûr un probleme tal mandâ il codiç al telefon pal recupar dal account
signin-recovery-code-use-phone-failure-description = Torne prove plui tart.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Jentre
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Inserìs il codiç di recupar
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Al è stât inviât un SMS cuntun codiç di sîs cifris al numar che al finìs par <span>{ $lastFourPhoneDigits }</span>. Chest codiç al scjât dopo 5 minûts. No sta condividi chest codiç cun nissun.
signin-recovery-phone-input-label = Inserìs il codiç a 6 cifris
signin-recovery-phone-code-submit-button = Conferme
signin-recovery-phone-resend-code-button = Torne mande il codiç
signin-recovery-phone-resend-success = Codiç mandât
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Sêstu taiât/taiade fûr dal to account?
signin-recovery-phone-send-code-error-heading = Al è vignût fûr un probleme tal inviâ il codiç
signin-recovery-phone-code-verification-error-heading = Al è vignût fûr un probleme tal verificâ il codiç
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Torne prove plui tart.
signin-recovery-phone-invalid-code-error-description = Il codiç nol è valit o al è scjadût.
signin-recovery-phone-invalid-code-error-link = Doprâ invezit i codiç di autenticazion di backup?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Jentrât cun sucès. Se tu tornis a doprâ il to telefon pal recupar dal account, al è pussibil che a vegnin aplicadis limitazions.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Graciis pe tô atenzion
signin-reported-message = Il nestri grup al è stât visât. Lis segnalazions come chestis nus judin a tignî lontans i intrûs.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Inserìs il codiç di conferme <span>pal to { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Inserìs dentri di 5 minûts il codiç che al è stât mandât a <email>{ $email }</email>.
signin-token-code-input-label-v2 = Inserìs il codiç a 6 cifris
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Conferme
signin-token-code-code-expired = Codiç scjadût?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Mande e-mail cul gnûf codiç.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Codiç di conferme necessari
signin-token-code-resend-error = Alc al è lât strucj. Impussibil inviâ un gnûf codiç.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = Dopo fat l'acès, { -brand-firefox } al cirarà di tornâ a mandâti ae pagjine par doprâ la mascare di pueste eletroniche.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Jentre
signin-totp-code-subheader-v2 = Inserìs il codiç di autenticazion in doi passaçs
signin-totp-code-instruction-v4 = Controle la <strong>aplicazion di autenticazion</strong> par confermâ l’acès.
signin-totp-code-input-label-v4 = Inserìs il codiç a 6 cifris
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Conferme
signin-totp-code-other-account-link = Dopre un altri account
signin-totp-code-recovery-code-link = Problemis a inserî il codiç?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Codiç di autenticazion necessari
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = Dopo fat l'acès, { -brand-firefox } al cirarà di tornâ a mandâti ae pagjine par doprâ la mascare di pueste eletroniche.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autorize chest acès
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Controle la tô casele di pueste: il codiç di autorizazion al è stât mandât a { $email }.
signin-unblock-code-input = Inserìs il codiç di autorizazion
signin-unblock-submit-button = Continue
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Al covente inserî il codiç di autorizazion
signin-unblock-code-incorrect-length = Il codiç di autorizazion al à di vê 8 caratars
signin-unblock-code-incorrect-format-2 = Il codiç di autorizazion al pues contignî dome letaris e/o numars
signin-unblock-resend-code-button = No ise te pueste in jentrade o te cartele spam/malvolude? Torne mande
signin-unblock-support-link = Ce staial sucedint?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = Dopo fat l'acès, { -brand-firefox } al cirarà di tornâ a mandâti ae pagjine par doprâ la mascare di pueste eletroniche.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Inserìs il codiç di conferme
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Inserìs il codiç di conferme <span>pal to { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Inserìs dentri di 5 minûts il codiç che al è stât mandât a <email>{ $email }</email>.
confirm-signup-code-input-label = Inserìs il codiç a 6 cifris
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Conferme
confirm-signup-code-sync-button = Scomence la sincronizazion
confirm-signup-code-code-expired = Codiç scjadût?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Mande e-mail cul gnûf codiç.
confirm-signup-code-success-alert = Account confermât cun sucès
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Al è necessari il codiç di conferme
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = Dopo fat l'acès, { -brand-firefox } al cirarà di tornâ a mandâti ae pagjine par doprâ la mascare di pueste eletroniche.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Cree une password
signup-relay-info = E covente une password par gjestî in sigurece lis tôs mascaris di pueste e acedi ai struments di sigurece di { -brand-mozilla }.
signup-sync-info = Sincronize passwords, segnelibris e altri dapardut là che tu dopris { -brand-firefox }.
signup-sync-info-with-payment = Sincronize passwords, metodis di paiament, segnelibris e altri dapardut là che tu dopris { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Cambie e-mail

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = La sincronizazion e je ative
signup-confirmed-sync-success-banner = { -product-mozilla-account } confermât
signup-confirmed-sync-button = Scomence a navigâ
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Al è pussibil sincronizâ passwords, metodis di paiament, direzions, segnelibris, cronologjie e altri dapardut là che tu dopris { -brand-firefox }.
signup-confirmed-sync-description-v2 = Al è pussibil sincronizâ passwords, direzions, segnelibris, cronologjie e altri dapardut là che tu dopris { -brand-firefox }.
signup-confirmed-sync-add-device-link = Zonte un altri dispositîf
signup-confirmed-sync-manage-sync-button = Gjestìs sincronizazion
signup-confirmed-sync-set-password-success-banner = Password di sincronizazion creade
