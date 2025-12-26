# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Kode berri bat bidali da zure posta elektronikora.
resend-link-success-banner-heading = Esteka berri bat bidali da zure posta elektronikora.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Gehitu { $accountsEmail } zure kontaktuetara arazorik gabeko bidalketarako.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Itxi pankarta
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } berrizendatuko da azaroaren batean { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Erabiltzaile-izen eta pasahitz berarekin hasiko duzu saioa oraindik, eta ez dago beste aldaketarik erabiltzen dituzun produktuetan.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = { -product-firefox-accounts } { -product-mozilla-accounts } izena jarri diegu. Erabiltzaile-izen eta pasahitz berarekin hasiko duzu saioa oraindik, eta ez dago beste aldaketarik erabiltzen dituzun produktuetan.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Argibide gehiago
# Alt text for close banner image
brand-close-banner =
    .alt = Itxi pankarta
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } logoa

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Atzera
button-back-title = Atzera

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Gorde eta jarraitu
    .title = Gorde eta jarraitu
recovery-key-pdf-heading = Kontua berreskuratzeko gakoa
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Sortze-data: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Kontua berreskuratzeko gakoa
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Gako honi esker, zifratutako nabigatzailearen datuak (pasahitzak, laster-markak eta historia barne) berreskura ditzakezu pasahitza ahazten baduzu. Gorde ezazu gogoratuko duzun leku batean.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Zure gakoa gordetzeko tokiak
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Lortu informazio gehiago kontua berreskuratzeko gakoari buruz
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Arazo bat izan da kontua berreskuratzeko gakoa deskargatzean.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Lortu gehiago { -brand-mozilla }-tik:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Lortu gure azken berriak eta produktuen eguneraketak
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Produktu berriak probatzeko sarbidea goiztiarra
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Ekintza alertak Internet berreskuratzeko

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Deskargatuta
datablock-copy =
    .message = Kopiatuta
datablock-print =
    .message = Inprimatuta

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (zenbatetsia)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (zenbatetsia)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (zenbatetsia)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (zenbatetsia)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Kokapen ezezaguna
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } { $genericOSName }-(e)n
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP helbidea: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Pasahitza
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Errepikatu pasahitza
form-password-with-inline-criteria-signup-submit-button = Sortu kontua
form-password-with-inline-criteria-reset-new-password =
    .label = Pasahitz berria
form-password-with-inline-criteria-confirm-password =
    .label = Berretsi pasahitza
form-password-with-inline-criteria-reset-submit-button = Sortu pasahitz berria
form-password-with-inline-criteria-match-error = Pasahitzak ez datoz bat
form-password-with-inline-criteria-sr-too-short-message = Psahitzak gutxienez 8 karaktere izan behar ditu.
form-password-with-inline-criteria-sr-not-email-message = Pasahitzak ezin du zure posta elektronikoa izan.
form-password-with-inline-criteria-sr-not-common-message = Pasahitza ezin da ohiko pasahitz bat izan.
form-password-with-inline-criteria-sr-requirements-met = Sartutako pasahitzak betetzen ditu eskatutako baldintza guztiak.
form-password-with-inline-criteria-sr-passwords-match = Sartutako pasahitza bat datoz.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Eremu hau beharrezkoa da

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Jarraitzeko, idatzi { $codeLength } zifrako kodea
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Jarraitzeko, idatzi { $codeLength } karaktere kodea

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox }  kontua berreskuratzeko gakoa
get-data-trio-title-backup-verification-codes = Autentifikazio-kodearen babes-kopia
get-data-trio-download-2 =
    .title = Deskargatu
    .aria-label = Deskargatu
get-data-trio-copy-2 =
    .title = Kopiatu
    .aria-label = Kopiatu
get-data-trio-print-2 =
    .title = Inprimatu
    .aria-label = Inprimatu

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Alerta
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Adi
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Abisua
authenticator-app-aria-label =
    .aria-label = Autentifikatzaileen aplikazioa
backup-codes-icon-aria-label-v2 =
    .aria-label = Autentifikazio-kodearen babes-kopia gaitua
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Autentifikazio-kodearen babes-kopia desgaitua
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Berreskuratze SMS gaitua
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Berreskuratze SMS desgaitua
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadako bandera
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Markatu
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Ondo burutu da
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Gaituta
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Itxi mezua
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kodea
error-icon-aria-label =
    .aria-label = Errorea
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informazioa
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Estatu Batuetako bandera

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Ordenagailu bat eta telefono mugikor bat eta bihotz hautsi baten irudia bakoitzean
hearts-verified-image-aria-label =
    .aria-label = Ordenagailu bat eta telefono mugikor bat eta tablet bat, bakoitzean bihotza dardarka
signin-recovery-code-image-description =
    .aria-label = Ezkutuko testua duen dokumentua.
signin-totp-code-image-label =
    .aria-label = Ezkutuko 6 digituko kodea duen gailua.
confirm-signup-aria-label =
    .aria-label = Esteka duen gutun-azal bat
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Kontua berreskuratzeko gako bat irudikatzeko irudia.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Kontua berreskuratzeko gako bat irudikatzeko irudia.
password-image-aria-label =
    .aria-label = Pasahitz bat idazten irudikatzeko ilustrazioa.
lightbulb-aria-label =
    .aria-label = Biltegiratze-iradokizun bat sortzea irudikatzeko irudia.
email-code-image-aria-label =
    .aria-label = Kode bat duen mezu elektroniko bat irudikatzeko ilustrazioa.
recovery-phone-image-description =
    .aria-label = Testu-mezu bidez kode bat jasotzen duen gailu mugikorra.
recovery-phone-code-image-description =
    .aria-label = Gailu mugikor batean jasotako kodea.
backup-recovery-phone-image-aria-label =
    .aria-label = Telefono mugikorra SMS testu-mezuen gaitasunak dituena
backup-authentication-codes-image-aria-label =
    .aria-label = Gailuaren pantaila kodeekin

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = { -brand-firefox } saioa hasi duzu.
inline-recovery-key-setup-create-header = Babestu zure kontua
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Hartuko minutu bat zure datuak babesteko?
inline-recovery-key-setup-info = Sortu kontua berreskuratzeko gako bat, zure sinkronizazioaren arakatze-datuak leheneratu ahal izateko pasahitza ahazten baduzu.
inline-recovery-key-setup-start-button = Sortu kontua berreskuratzeko gakoa
inline-recovery-key-setup-later-button = Beranduago egin

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Ezkutatu pasahitza
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Erakutsi pasahitza
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Zure pasahitza ikusgai dago pantailan.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Zure pasahitza ezkutatuta dago une honetan.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Zure pasahitza orain ikusgai dago pantailan.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Zure pasahitza orain ezkutatuta dago.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Hautatu herrialdea
input-phone-number-enter-number = Idatzi telefono zenbakia
input-phone-number-country-united-states = Estatu Batuak
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Atzera

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Pasahitza berrezartzeko lotura hondatuta
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Berrespen-esteka kaltetuta dago
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Lotura kaltetuta dago
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Klik egin duzun loturak karaktereak falta ditu; agian zure posta-bezeroak hondatu du. Kopiatu helbidea kontuz eta saiatu berriro.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Jaso lotura berria

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Gogoratu pasahitza?
# link navigates to the sign in page
remember-password-signin-link = Hasi saioa

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Helbide elektroniko nagusia dagoeneko berretsita
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Saio-hasiera dagoeneko berretsita
confirmation-link-reused-message = Berrespen-lotura hori erabilita dago eta behin bakarrik erabil daiteke.

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Eskaera okerra

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Pasahitz hau behar duzu gurekin gordetzen dituzun datu enkriptatuak atzitzeko.
password-info-balloon-reset-risk-info = Berrezartze batek pasahitzak eta laster-markak bezalako datuak galdu ahal izatea esan nahi du.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = Gutxienez 8 karaktere
password-strength-inline-not-email = Ezin da zure helbide elektronikoa izan
password-strength-inline-not-common = Ezin da askotan erabilitako pasahitza izan
password-strength-inline-confirmed-must-match = Berrespena pasahitz berriarekin bat dator

## Notification Promo Banner component

account-recovery-notification-cta = Sortu
account-recovery-notification-header-value = Ez galdu zure datuak pasahitza ahazten baduzu
account-recovery-notification-header-description = Sortu kontua berreskuratzeko gako bat, zure sinkronizazioaren arakatze-datuak leheneratu ahal izateko pasahitza ahazten baduzu.

## Ready component

ready-complete-set-up-instruction = Konfigurazioa osatzeko, idatzi pasahitz berria { -brand-firefox } darabilzun beste gailuetan.
manage-your-account-button = Kudeatu zure kontua
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Dena prest dago { $serviceName } erabiltzen hasteko
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Kontuaren ezarpenak erabiltzeko prest zaude orain
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Zure kontua prest dago!
ready-continue = Jarraitu
sign-in-complete-header = Saio-hasiera berretsita
sign-up-complete-header = Kontua berretsi da
primary-email-verified-header = Helbide elektroniko nagusia berretsi da

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Zure gakoa gordetzeko tokiak:
flow-recovery-key-download-storage-ideas-folder-v2 = Karpeta gailu seguruan
flow-recovery-key-download-storage-ideas-cloud = Hodeiko biltegiratze fidagarria
flow-recovery-key-download-storage-ideas-print-v2 = Kopia fisiko inprimatua
flow-recovery-key-download-storage-ideas-pwd-manager = Pasahitz-kudeatzailea

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Gehitu aholku bat zure giltza aurkitzen laguntzeko
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Aholku honek zure kontua berreskuratzeko gakoa non gorde zenuen gogoratzen lagunduko dizu. Pasahitza berrezartzean erakutsiko dizugu zure datuak berreskuratzeko.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Idatzi aholku bat (aukerakoa)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Amaitu
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Aholkuak 255 karaktere baino gutxiago izan behar ditu.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Aholkuak ezin ditu Unicode karaktere arriskutsuak izan. Letrak, zenbakiak, puntuazio-ikurrak eta ikurrak soilik onartzen dira.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Abisua
password-reset-chevron-expanded = Tolestu abisua
password-reset-chevron-collapsed = Zabaldu abisua
password-reset-data-may-not-be-recovered = Baliteke zure nabigatzailearen datuak ez berreskuratzea
password-reset-previously-signed-in-device-2 = Aurretik saioa hasi zenuen gailurik al duzu?
password-reset-data-may-be-saved-locally-2 = Baliteke zure arakatzailearen datuak gailu horretan gordetzea. Berrezarri pasahitza eta, ondoren, hasi saioa bertan datuak leheneratu eta sinkronizatzeko.
password-reset-no-old-device-2 = Gailu berri bat al duzu baina ez duzu aurrekoetarako sarbidea?
password-reset-encrypted-data-cannot-be-recovered-2 = Sentitzen dugu, baina ezin dira berreskuratu { -brand-firefox } zerbitzarietan enkriptatutako nabigatzailearen datuak.
password-reset-warning-have-key = Kontua berreskuratzeko gakoa baduzu?
password-reset-warning-use-key-link = Erabili orain pasahitza berrezartzeko eta datuak gordetzeko

## Alert Bar

alert-bar-close-message = Itxi mezua

## User's avatar

avatar-your-avatar =
    .alt = Zure abatarra
avatar-default-avatar =
    .alt = Abatar lehenetsia

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } produktuak
bento-menu-tagline = Zure pribatutasuna babesten duten { -brand-mozilla }ren produktu gehiago
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Mahaigainerako { -brand-firefox } nabigatzailea
bento-menu-firefox-mobile = Mugikorrerako { -brand-firefox } nabigatzailea
bento-menu-made-by-mozilla = { -brand-mozilla }(e)k egina

## Connect another device promo

connect-another-fx-mobile = Eskuratu mugikor edo tabletarako { -brand-firefox }
connect-another-find-fx-mobile-2 = Bilatu { -brand-firefox } { -google-play }(e)n eta { -app-store }(e)n.

## Connected services section

cs-heading = Konektatutako zerbitzuak
cs-description = Erabiltzen ari zaren eta saioa hasita duzun guztia.
cs-cannot-refresh = Barkatu, arazo bat gertatu da konektatutako zerbitzuen zerrenda berritzean.
cs-cannot-disconnect = Ez da bezeroa aurkitu, ezin da deskonektatu
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = { $service } zerbitzutik saioa amaituta.
cs-refresh-button =
    .title = Berritu konektatutako zerbitzuak
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Faltan edo bikoiztuta dauden elementuak?
cs-disconnect-sync-heading = Deskonektatu sinkronizaziotik

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Zure nabigazio-datuak <span>{ $device }</span>(e)n geratuko dira,
    baina jada ez da zure kontuarekin sinkronizatuko.
cs-disconnect-sync-reason-3 = Zein da <span>{ $device }</span>tik deskonektatzeko arrazoi nagusia?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Gailua ondorengoa da:
cs-disconnect-sync-opt-suspicious = Susmagarria
cs-disconnect-sync-opt-lost = Galduta edo lapurtuta
cs-disconnect-sync-opt-old = Zaharra edo ordezkatua
cs-disconnect-sync-opt-duplicate = Bikoiztua
cs-disconnect-sync-opt-not-say = Nahiago dut ez esan

##

cs-disconnect-advice-confirm = Ados, ulertuta
cs-disconnect-lost-advice-heading = Galdutako edo lapurtutako gailua deskonektatuta
cs-disconnect-lost-advice-content-3 =
    Zure gailua galdu edo lapurtu egin denez, 
    zure informazioa seguru mantentzeko zure { -product-mozilla-account } pasahitza aldatu behar zenuke
    kontuaren ezarpenetan. Era berean, gailuko datuak urrunetik ezabatzeko informazioa
    bilatu beharko zenuke.
cs-disconnect-suspicious-advice-heading = Gailu susmagarria deskonektatuta
cs-disconnect-suspicious-advice-content-2 =
    Deskonektatutako gailua susmagarria bada,
    zure informazioa seguru mantentzeko zure { -product-mozilla-account } pasahitza aldatu behar zenuke
    kontuaren ezarpenetan. Era berean, { -brand-firefox }(e)n gordetako beste edozein
    pasahitz ere aldatu beharko zenuke, helbide-barran about:logins idatziz.
cs-sign-out-button = Amaitu saioa

## Data collection section

dc-heading = Datuen bilketa eta erabilera
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } nabigatzailea
dc-subheader-content-2 = Baimendu { -product-mozilla-accounts }(r)i datu teknikoak eta interakzio-datuak bidaltzea { -brand-mozilla }ra.
dc-subheader-ff-content = Zure { -brand-firefox } nabigatzailearen datu teknikoen eta interakzio datuen ezarpenak berrikusteko edo eguneratzeko, ireki { -brand-firefox } ezarpenak eta joan Pribatutasuna eta segurtasuna atalera.
dc-opt-out-success-2 = Aukeratu arrakastaz. { -product-mozilla-accounts }k ez du bidaliko datu tekniko edo interakzio-daturik { -brand-mozilla }ra.
dc-opt-in-success-2 = Eskerrik asko! Datu hauek partekatzeak { -product-mozilla-accounts } hobetzen laguntzen digu.
dc-opt-in-out-error-2 = Barkatu, arazo bat izan da zure datuak biltzeko hobespenak aldatzean
dc-learn-more = Argibide gehiago

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } menua
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Saioa hasita:
drop-down-menu-sign-out = Amaitu saioa
drop-down-menu-sign-out-error-2 = Barkatu, arazo bat gertatu da zure saioa amaitzean

## Flow Container

flow-container-back = Atzera

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Sartu berriz zure pasahitza segurtasunagatik
flow-recovery-key-confirm-pwd-input-label = Sartu zure pasahitza
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Sortu kontua berreskuratzeko gakoa
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Sortu kontua berreskuratzeko gako berria

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Kontua berreskuratzeko gakoa sortu da — Deskargatu eta gorde ezazu orain
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Gako honekin zure datuak berreskura ditzakezu pasahitza ahazten baduzu. Deskargatu orain eta gorde gogoratuko duzun leku batean; ezin izango zara orri honetara itzuli geroago.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Jarraitu deskargatu gabe

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Kontuaren berreskuratze-gakoa sortuta

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Sortu kontua berreskuratzeko gako bat pasahitza ahazten duzunerako
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Aldatu zure kontua berreskuratzeko gakoa
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Nabigazio-datuak enkriptatzen ditugu: pasahitzak, laster-markak eta abar. Pribatutasunerako oso ona da, baina pasahitza ahazten baduzu zure datuak gal ditzakezu.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Horregatik, kontua berreskuratzeko gako bat sortzea oso garrantzitsua da -- zure datuak leheneratzeko erabil dezakezu.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Hasi erabiltzen
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Utzi

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Idatzi egiaztapen-kodea
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Sei digituko kodea bidali da <span>{ $phoneNumber }</span> zenbakira testu-mezu bidez. Kode hau 5 minuturen buruan iraungiko da.
flow-setup-phone-confirm-code-input-label = Sartu 6 digituko kodea
flow-setup-phone-confirm-code-button = Berretsi
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Kodea iraungita?
flow-setup-phone-confirm-code-resend-code-button = Birbidali kodea
flow-setup-phone-confirm-code-resend-code-success = Kodea bidalia
flow-setup-phone-confirm-code-success-message-v2 = Berreskuratze telefonoa gehitu da

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Egiaztatu zure telefono zenbakia
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = { -brand-mozilla } erabiltzailearen testu-mezu bat jasoko duzu zure zenbakia egiaztatzeko kode batekin. Ez partekatu kode hau inorekin.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Berreskuratzeko telefonoa Estatu Batuetan eta Kanadan bakarrik dago erabilgarri. Ez dira gomendatzen VoIP zenbakiak eta telefono-maskarak.
flow-setup-phone-submit-number-legal = Zure zenbakia emanez gero, onartzen diguzu gordetzera, kontua egiaztatzeko mezuak soilik bidali ahal izateko. Mezuen eta datuen tarifak aplika daitezke.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Bidali kodea

## HeaderLockup component, the header in account settings

header-menu-open = Itxi menua
header-menu-closed = Gunearen nabigazio-menua
header-back-to-top-link =
    .title = Itzuli gora
header-title-2 = { -product-mozilla-account }
header-help = Laguntza

## Linked Accounts section

la-heading = Lotutako kontuak
la-description = Hurrengo kontuetarako sarbidea baimendu duzu.
la-unlink-button = Lotura kendu
la-unlink-account-button = Lotura kendu
la-set-password-button = Ezarri pasahitza
la-unlink-heading = Lotura kendu hirugarrenen kontuei
la-unlink-content-3 = Ziur kontua deskonektatu nahi duzula? Kontuaren lotura kentzeak ez du automatikoki saioa amaituko zure Konektatutako Zerbitzuetatik. Horretarako, eskuz amaitu beharko duzu Konektatutako Zerbitzuak atalean.
la-unlink-content-4 = Zure kontua deskonektatu aurretik, pasahitz bat ezarri behar duzu. Pasahitzik gabe, ez duzu saioa hasteko modurik zure kontuari lotura kendu ondoren.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Itxi
modal-cancel-button = Utzi
modal-default-confirm-button = Berretsi

## Modal Verify Session

mvs-verify-your-email-2 = Berretsi helbide elektronikoa
mvs-enter-verification-code-2 = Sartu zure baieztapen-kodea
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = 5 minuturen buruan idatzi <email>{ $email }</email> helbidera bidalitako berrespen-kodea.
msv-cancel-button = Utzi
msv-submit-button-2 = Berretsi

## Settings Nav

nav-settings = Ezarpenak
nav-profile = Profila
nav-security = Segurtasuna
nav-connected-services = Konektatutako zerbitzuak
nav-data-collection = Datuen bilketa eta erabilera
nav-paid-subs = Ordainpeko harpidetzak
nav-email-comm = Posta bidezko komunikazioak

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Arazoa egon da zure autentikazio-kode segurtasun kopia ordezkatzean.
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Arazoa egon da zure autentikazio-kode segurtasun kopia sortzean.
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Eguneratu dira babeskopiko autentifikazio-kodeak

## Avatar change page

avatar-page-title =
    .title = Profileko irudia
avatar-page-add-photo = Gehitu argazkia
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Hartu argazkia
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Kendu argazkia
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Hartu berriro argazkia
avatar-page-cancel-button = Utzi
avatar-page-save-button = Gorde
avatar-page-saving-button = Gordetzen…
avatar-page-zoom-out-button =
    .title = Urrundu zooma
avatar-page-zoom-in-button =
    .title = Gerturatu zooma
avatar-page-rotate-button =
    .title = Biratu
avatar-page-camera-error = Ezin da kamera hasieratu
avatar-page-new-avatar =
    .alt = profileko irudi berria
avatar-page-file-upload-error-3 = Arazoa egon da zure profileko irudia igotzean
avatar-page-delete-error-3 = Arazoa egon da zure profileko irudia ezabatzean
avatar-page-image-too-large-error-2 = Irudi-fitxategiaren tamaina handiegia da igotzeko

## Password change page

pw-change-header =
    .title = Aldatu pasahitza
pw-8-chars = Gutxienez 8 karaktere
pw-not-email = Ezin da zure helbide elektronikoa izan
pw-change-must-match = Pasahitz berria berrespenarekin bat dator
pw-commonly-used = Ezin da askotan erabilitako pasahitza izan
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Egon seguru — Ez berrerabili pasahitzak. Ikusi aholku gehiago <LinkExternal>pasahitz sendoak sortzeko</LinkExternal>.
pw-change-cancel-button = Utzi
pw-change-save-button = Gorde
pw-change-forgot-password-link = Pasahitza ahaztu duzu?
pw-change-current-password =
    .label = Idatzi uneko pasahitza
pw-change-new-password =
    .label = Idatzi pasahitz berria
pw-change-confirm-password =
    .label = Berretsi pasahitz berria
pw-change-success-alert-2 = Pasahitza eguneratuta

## Password create page

pw-create-header =
    .title = Sortu pasahitza
pw-create-success-alert-2 = Ezarri pasahitza
pw-create-error-2 = Barkatu, arazo bat izan da pasahitza ezartzean

## Delete account page

delete-account-header =
    .title = Ezabatu kontua
delete-account-step-1-2 = 2tik 1. urratsa
delete-account-step-2-2 = 2tik 2. urratsa
delete-account-confirm-title-4 = Baliteke zure { -product-mozilla-account } sarean seguru eta produktiboa mantentzen zaituen { -brand-mozilla } produktu edo zerbitzu hauetako bati edo gehiagori konektatu izana:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox } datuak sinkronizatzen
delete-account-product-firefox-addons = { -brand-firefox } gehigarriak
delete-account-acknowledge = Mesedez aitor ezazu kontua ezabatzeak ondorengoa eragingo duela:
delete-account-chk-box-2 =
    .label = { -brand-mozilla } produktuetan gordeta duzun informazio eta eginbideak gal litzakezu
delete-account-chk-box-3 =
    .label = Helbide elektroniko honekin berriro aktibatzeak ezin lezake zure gordetako informazioa leheneratu
delete-account-chk-box-4 =
    .label = addons.mozilla.org gunean argitaratu duzun edozein hedapen eta itxura ezabatu egingo da
delete-account-continue-button = Jarraitu
delete-account-password-input =
    .label = Idatzi pasahitza
delete-account-cancel-button = Utzi
delete-account-delete-button-2 = Ezabatu

## Display name page

display-name-page-title =
    .title = Bistaratzeko izena
display-name-input =
    .label = Idatzi bistaratzeko izena
submit-display-name = Gorde
cancel-display-name = Utzi
display-name-update-error-2 = Arazoa egon da zure bistaratzeko izena eguneratzean
display-name-success-alert-2 = Bistaratze-izena eguneratua

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Kontuaren azken jarduerak
recent-activity-account-create-v2 = Kontua sortua
recent-activity-account-disable-v2 = Kontu desgaitua
recent-activity-account-enable-v2 = Kontu gaitua
recent-activity-account-login-v2 = Kontuaren saioa hasi da
recent-activity-account-reset-v2 = Pasahitza berrezartzea hasi da
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Ezabatu dira mezu elektronikoen erreboteak
recent-activity-account-login-failure = Kontuan saioa hasteko saiakerak huts egin du
recent-activity-account-two-factor-added = Bi urratseko autentifikazioa gaituta
recent-activity-account-two-factor-requested = Bi urratseko autentifikazioa eskatu da
recent-activity-account-two-factor-failure = Bi urratseko autentifikazioak huts egin du
recent-activity-account-two-factor-success = Bi urratseko autentifikazioa arrakastatsua
recent-activity-account-two-factor-removed = Bi urratseko autentifikazioa kendu da
recent-activity-account-password-reset-requested = Kontuak pasahitza berrezartzea eskatu du
recent-activity-account-password-reset-success = Kontuko pasahitza ondo berrezarri da
recent-activity-account-recovery-key-added = Kontu berreskuratzeko gakoa gaitua
recent-activity-account-recovery-key-verification-failure = Kontu berreskuratzeko gako egiaztatzeak huts egin du
recent-activity-account-recovery-key-verification-success = Kontu berreskuratzeko gako egiaztatze zuzena
recent-activity-account-recovery-key-removed = Kontuaren berreskuratze-gakoa kenduta
recent-activity-account-password-added = Pasahitz berria gehituta
recent-activity-account-password-changed = Pasahitza aldatuta
recent-activity-account-secondary-email-added = Helbide elektroniko alternatiboa gehitua
recent-activity-account-secondary-email-removed = Helbide elektroniko alternatiboa kenduta
recent-activity-account-emails-swapped = Mezu elektroniko nagusiak eta alternatiboa trukatu dira
recent-activity-session-destroy = Saioa amaitu da
recent-activity-account-recovery-phone-send-code = Berreskuratzeko telefono kodea bidali da
recent-activity-account-recovery-phone-setup-complete = Berreskuratzeko telefonoaren konfigurazioa bukatu da
recent-activity-account-recovery-phone-signin-complete = Saio hasiera berreskuratzeko telefonoaz amaituta
recent-activity-account-recovery-phone-signin-failed = Saio hasiera berreskuratzeko telefonoaz huts egin du
recent-activity-account-recovery-phone-removed = Berreskuratze telefonoa kendu da
recent-activity-account-recovery-codes-replaced = Berreskuratzeko kodeak ordezkatu dira
recent-activity-account-recovery-codes-created = Berreskuratzeko kodeak sortu dira
recent-activity-account-recovery-codes-signin-complete = Saio hasiera berreskuratze kodeaz amaituta
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Beste kontuaren jarduera

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Kontua berreskuratzeko gakoa
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Itzuli ezarpenetara

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Kendu berreskuratze telefono zenbakia
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Honek <strong>{ $formattedFullPhoneNumber }</strong> kenduko du berreskuratzeko telefono gisa.
settings-recovery-phone-remove-recommend = Metodo hau mantentzea gomendatzen dugu, babeskopiko autentifikazio-kodeak gordetzea baino errazagoa delako.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Ezabatzen baduzu, ziurtatu gordetako babeskopiko autentifikazio-kodeak dituzula. <linkExternal>Konparatu berreskuratzeko metodoak</linkExternal>
settings-recovery-phone-remove-button = Kendu telefono zenbakia
settings-recovery-phone-remove-cancel = Utzi
settings-recovery-phone-remove-success = Berreskuratu kendutako telefonoa

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Gehitu berreskuratze telefonoa
page-setup-recovery-phone-back-button-title = Itzuli ezarpenetara
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Aldatu telefono zenbakia

## Add secondary email page

add-secondary-email-step-1 = 2tik 1. urratsa
add-secondary-email-error-2 = Arazo bat egon da mezu elektroniko hau sortzean
add-secondary-email-page-title =
    .title = Ordezko helbide elektronikoa
add-secondary-email-enter-address =
    .label = Idatzi helbide elektronikoa
add-secondary-email-cancel-button = Utzi
add-secondary-email-save-button = Gorde
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Posta elektronikoko maskarak ezin dira bigarren posta elektroniko gisa erabili

## Verify secondary email page

add-secondary-email-step-2 = 2tik 2. urratsa
verify-secondary-email-page-title =
    .title = Ordezko helbide elektronikoa
verify-secondary-email-verification-code-2 =
    .label = Sartu zure baieztapen-kodea
verify-secondary-email-cancel-button = Utzi
verify-secondary-email-verify-button-2 = Berretsi
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = 5 minuturen buruan idatzi <strong>{ $email }</strong> helbidera bidalitako baieztapen-kodea.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } ondo gehituta

##

# Link to delete account on main Settings page
delete-account-link = Ezabatu kontua
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Behar bezala hasi da saioa. Zure { -product-mozilla-account } eta datuak aktibo egongo dira.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = Lortu eskaneatzea doan

## Profile section

profile-heading = Profila
profile-picture =
    .header = Irudia
profile-display-name =
    .header = Bistaratzeko izena
profile-primary-email =
    .header = Helbide elektroniko nagusia

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = { $numberOfSteps } pausotik { $currentStep }.

## Security section of Setting

security-heading = Segurtasuna
security-password =
    .header = Pasahitza
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Sortze-data: { $date }
security-not-set = Ezarri gabe
security-action-create = Sortu
security-set-password = Ezarri pasahitz bat kontuaren segurtasun-eginbide jakin batzuk sinkronizatzeko eta erabiltzeko.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Begiratu kontuaren azken jarduerak
signout-sync-header = Saioa iraungi da
signout-sync-session-expired = Arazoren bat izan da. Mesedez, amaitu saioa nabigatzailearen menuan eta saiatu berriro.

## SubRow component

tfa-row-backup-codes-title = Autentifikazio-kodearen babes-kopia
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Ez dago koderik erabilgarri
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Kode { $numCodesAvailable } geratzen da
       *[other] { $numCodesAvailable } kode geratzen dira
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Sortu kode berriak
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Gehitu
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Hau da berreskuratzeko metodorik seguruena zure gailu mugikorra edo autentifikatzaile aplikazioa erabili ezin baduzu.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Berreskuratze telefonoa
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Ez da telefono-zenbakirik gehitu
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Aldatu
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Gehitu
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Kendu
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Kendu berreskuratze telefonoa
tfa-row-backup-phone-delete-restriction-v2 = Berreskuratzeko telefonoa kendu nahi baduzu, gehitu babeskopiko autentifikazio-kodeak edo desgaitu bi urratseko autentifikazioa lehenik zure kontutik kanpo gelditzea saihesteko.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Hau da berreskuratzeko metodorik errazena zure autentifikatzaile aplikazioa erabili ezin baduzu.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Lortu informazio gehiago SIM trukatzeko arriskuari buruz

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Itzali
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Piztu
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Bidaltzen…
switch-is-on = piztuta
switch-is-off = itzalita

## Sub-section row Defaults

row-defaults-action-add = Gehitu
row-defaults-action-change = Aldatu
row-defaults-action-disable = Desgaitu
row-defaults-status = Bat ere ez

## Account recovery key sub-section on main Settings page

rk-header-1 = Kontua berreskuratzeko gakoa
rk-enabled = Gaituta
rk-not-set = Ezarri gabe
rk-action-create = Sortu
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Aldatu
rk-action-remove = Kendu
rk-key-removed-2 = Kontuaren berreskuratze-gakoa kenduta
rk-cannot-remove-key = Ezin izan da zure kontuaren berreskuratze-gakoa kendu.
rk-refresh-key-1 = Freskatu kontua berreskuratzeko gakoa
rk-content-explain = Berrezarri zure informazioa pasahitza ahazten duzunean.
rk-cannot-verify-session-4 = Arazo bat izan da zure saioa berresteko
rk-remove-modal-heading-1 = Kontua berreskuratzeko gakoa kendu?
rk-remove-modal-content-1 =
    Pasahitza berrezartzen baduzu, ezingo duzu
    kontua berreskuratze-gakoa erabili zure datuetarako sarbidea izateko. Ezin duzu ekintza hau desegin.
rk-remove-error-2 = Ezin izan da zure kontuaren berreskuratze-gakoa kendu
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Ezabatu kontua berreskuratzeko gakoa

## Secondary email sub-section on main Settings page

se-heading = Ordezko helbide elektronikoa
    .header = Ordezko helbide elektronikoa
se-cannot-refresh-email = Barkatu, arazoa egon da helbide elektroniko hori berritzean.
se-cannot-resend-code-3 = Arazo bat izan da berrespen-kodea berriro bidaltzean
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = Zure helbide elektroniko nagusia da orain { $email }
se-set-primary-error-2 = Barkatu, arazoa egon da zure helbide elektroniko nagusia aldatzean
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } ondo ezabatuta
se-delete-email-error-2 = Barkatu, arazoa egon da helbide elektroniko hori ezabatzean
se-verify-session-3 = Zure uneko saioa berretsi beharko duzu ekintza hau burutzeko.
se-verify-session-error-3 = Arazo bat izan da zure saioa berresteko
# Button to remove the secondary email
se-remove-email =
    .title = Kendu helbide elektronikoa
# Button to refresh secondary email status
se-refresh-email =
    .title = Berritu helbide elektronikoa
se-unverified-2 = Berretsigabea
se-resend-code-2 =
    Berrespena behar da. <button>Birbidali berrespen-kodea</button>
    ez baduzu zure sarrera-ontzian edo spam karpetan aurkitzen.
# Button to make secondary email the primary
se-make-primary = Bihurtu nagusi
se-default-content = Sartu zure kontura ezin baduzu zure helbide elektroniko nagusiarekin saioa hasi.
se-content-note-1 =
    Oharra: ordezko helbide elektronikoak ez du zure informazioa leheneratuko —
    <a>kontua berreskuratze-gakoa</a> beharko duzu horretarako.
# Default value for the secondary email
se-secondary-email-none = Bat ere ez

## Two Step Auth sub-section on Settings main page

tfa-row-header = Bi urratseko autentifikazioa
tfa-row-enabled = Gaituta
tfa-row-disabled-status = Desgaituta
tfa-row-action-add = Gehitu
tfa-row-action-disable = Desgaitu
tfa-row-button-refresh =
    .title = Berritu bi urratseko autentifikazioa
tfa-row-cannot-refresh = Barkatu, arazoa egon da bi urratseko autentifikazioa berritzean.
tfa-row-enabled-description = Zure kontua bi urratseko autentifikazioaren bidez babestuta dago. Zure { -product-mozilla-account }-n saioa hastean zure autentifikazio-aplikazioko pasahitz bakarra sartu beharko duzu.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Honek zure kontua nola babesten duen
tfa-row-disabled-description-v2 = Lagundu zure kontua babesten hirugarrenen autentifikazio-aplikazio bat erabiliz saioa hasteko bigarren urrats gisa.
tfa-row-cannot-verify-session-4 = Arazo bat izan da zure saioa berresteko
tfa-row-disable-modal-heading = Bi urratseko autentifikazioa desgaitu?
tfa-row-disable-modal-confirm = Desgaitu
tfa-row-disable-modal-explain-1 =
    Ezin izango duzu ekintza hau desegin.
    Zuk ere aukera daukazu <linkExternal>zure ordezko autentifikazio-kodeak ordezkatzeko</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Bi urratseko autentifikazioa desgaituta
tfa-row-cannot-disable-2 = Bi urratseko autentifikazioa ezin da desgaitu

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Aurrera eginez gero, hauek onartzen dituzu:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } Harpidetza zerbitzuak <mozSubscriptionTosLink>Zerbitzu-baldintzak</mozSubscriptionTosLink> eta <mozSubscriptionPrivacyLink>Pribatutasun-oharra</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Zerbitzu-baldintzak</mozillaAccountsTos> eta <mozillaAccountsPrivacy>Pribatutasun-oharra</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Aurrera eginez gero, <mozillaAccountsTos>Zerbitzu-baldintzak</mozillaAccountsTos> eta <mozillaAccountsPrivacy>Pribatutasun-oharra</mozillaAccountsPrivacy> onartzen dituzu.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = edo
continue-with-google-button = { -brand-google }ekin jarraitu
continue-with-apple-button = { -brand-apple }(e)kin jarraitu

## Auth-server based errors that originate from backend service

auth-error-102 = Kontu ezezaguna
auth-error-103 = Pasahitz okerra
auth-error-105-2 = Berrespen-kode baliogabea!
auth-error-110 = Token baliogabea
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Gehiegitan saiatu zara. Mesedez, saiatu berriro geroago.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Gehiegitan saiatu zara. Mesedez, saiatu berriro { $retryAfter }.
auth-error-125 = Eskaera blokeatu egin da segurtasun-arrazoiak tarteko
auth-error-138-2 = Berretsi gabeko saioa
auth-error-139 = Helbide elektroniko alternatiboak zure kontuaren helbide elektronikoaren desberdina izan behar du
auth-error-155 = Ez da TOTP tokena aurkitu
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Autentifikazio-kodearen babes-kopia ez da aurkitu
auth-error-159 = Kontua berreskuratzeko gako baliogabea
auth-error-183-2 = Berrespen-kode baliogabea edo iraungita
auth-error-202 = Ezaugarri ez gaitua
auth-error-203 = Sistema ez dago erabilgarri, saiatu berrio beranduago
auth-error-206 = Ezin da pasahitza sortu, pasahitza ezarrita dago jada
auth-error-214 = Dagoeneko badago berreskuratzeko telefono-zenbakia
auth-error-215 = Berreskuratzeko telefono-zenbakia ez dago
auth-error-216 = Testu-mezuen mugara iritsi da
auth-error-218 = Ezin izan da berreskuratzeko telefonoa kendu, babeskopiko autentifikazio-kodeak falta dira.
auth-error-219 = Telefono-zenbaki hau kontu gehiegirekin erregistratu da. Mesedez, saiatu beste zenbaki batekin.
auth-error-999 = Espero gabeko errorea
auth-error-1001 = Saio-hasiera saiakera utzita
auth-error-1002 = Saioa iraungita. Jarraitzeko, hasi saioa.
auth-error-1003 = Tokiko biltegiratzea edo cookieak desgaituta daude oraindik
auth-error-1008 = Pasahitz berriak desberdina izan behar du
auth-error-1010 = Baliozko pasahitza behar da
auth-error-1011 = Baliozko helbide elektronikoa behar da
auth-error-1018 = Zure berrespen-mezu elektronikoa itzuli berri da. Helbide elektronikoa gaizki idatzita zegoen?
auth-error-1020 = Gaizki idatzitako posta elektronikoa? firefox.com ez da baliozko posta elektroniko zerbitzu bat
auth-error-1031 = Zure izena sartu behar duzu erregistratzeko
auth-error-1032 = Adin egoki bat sartu behar duzu erregistratzeko
auth-error-1054 = Bi urratseko autentifikazio kode baliogabea
auth-error-1056 = Babeskopiako autentifikazio-kode baliogabea
auth-error-1062 = Birbideraketa baliogabea
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Gaizki idatzitako helbide elektronikoa? { $domain } ez da baliozko posta elektroniko zerbitzu bat
auth-error-1066 = Ezin dira erabili posta elektronikoko maskarak kontu bat sortzeko.
auth-error-1067 = Gaizki idatzitako helbidea?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = { $lastFourPhoneNumber }z amaitzen den zenbakia
oauth-error-1000 = Zerbait gaizki joan da. Itxi fitxa hau eta saiatu berriro.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = { -brand-firefox } saioa hasi duzu
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Helbide elektronikoa berretsi da
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Saio-hasiera berretsita
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Konfigurazioa osatzeko, hasi saioa { -brand-firefox } honetan
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Hasi saioa
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Oraindik gailuak gehitzen? Konfigurazioa osatzeko, hasi saioa { -brand-firefox }en beste gailu batean
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Konfigurazioa osatzeko, hasi saioa { -brand-firefox }en beste gailu batean
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Zure fitxak, laster-markak eta pasahitzak beste gailu batean eduki nahi dituzu?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Konektatu beste gailu bat
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Une honetan ez
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Konfigurazioa osatzeko, hasi saioa Androiderako { -brand-firefox }en
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Konfigurazioa osatzeko, hasi saioa iOSerako { -brand-firefox }en

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Tokiko biltegiratzea eta cookieak beharrezkoak dira
cookies-disabled-enable-prompt-2 = Mesedez, gaitu cookieak eta tokiko biltegiratzea zure nabigatzailean { -product-mozilla-account } atzitzeko. Hori eginez gero, saioen artean zu gogoratzea bezalako funtzionaltasunak gaituko dira.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Saiatu berriro
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Argibide gehiago

## Index / home page

index-header = Idatzi zure helbide elektronikoa
index-sync-header = Jarraitu zure { -product-mozilla-account }ra
index-sync-subheader = Sinkronizatu zure pasahitzak, fitxak eta laster-markak { -brand-firefox } erabiltzen duzun toki orotan.
index-relay-header = Sortu posta elektronikoko maskara bat
index-relay-subheader = Mesedez, eman maskaratutako mezu elektronikoak birbidali nahi dituzun helbide elektronikoa.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Jarraitu { $serviceName } zerbitzura
index-subheader-default = Jarraitu kontu-ezarpenekin
index-cta = Erregistratu edo hasi saioa
index-account-info = { -product-mozilla-account } batek pribatutasuna babesten duten produktu gehiagorako sarbidea desblokeatzen du { -brand-mozilla }-tik.
index-email-input =
    .label = Idatzi zure helbide elektronikoa
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Kontua ondo ezabatu da
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Zure berrespen-mezu elektronikoa itzuli berri da. Helbide elektronikoa gaizki idatzita zegoen?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Oops! Ezin izan dugu sortu zure kontua berreskuratzeko gakoa. Saiatu berriro geroago.
inline-recovery-key-setup-recovery-created = Kontuaren berreskuratze-gakoa sortuta
inline-recovery-key-setup-download-header = Babestu zure kontua
inline-recovery-key-setup-download-subheader = Deskargatu eta gorde orain
inline-recovery-key-setup-download-info = Gorde gako hau gogoratuko duzun leku batean — ezin izango zara orri honetara itzuli geroago.
inline-recovery-key-setup-hint-header = Segurtasun gomendioa

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Utzi konfigurazioa
inline-totp-setup-continue-button = Jarraitu
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Gehitu segurtasun-geruza bat zure kontuari <authenticationAppsLink>autentifikazio-aplikazio hauetariko</authenticationAppsLink>  autentifikazio-kodeak eskatuz.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Gaitu bi urratseko autentifikazioa <span>kontuaren ezarpenekin jarraitzeko</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Gaitu bi urratseko autentifikazioa <span>{ $serviceName }</span>-ra jarraitzeko
inline-totp-setup-ready-button = Prest
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Eskaneatu autentifikazio-kodea <span> { $serviceName }</span>-ra joateko
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Sartu kodea eskuz <span>{ $serviceName }</span>-ra joateko
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Eskaneatu babeskopia autentifikazio-kodea <span>kontuaren ezarpenetara jarraitzeko</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Sartu kodea eskuz <span>kontuaren ezarpenetara jarraitzeko</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Idatzi gako sekretu hau zure autentifikazio aplikazioan. <toggleToQRButton>QR kodea eskaneatu beharrean?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Eskaneatu QR kodea zure autentifikazio-aplikazioan eta, ondoren, idatzi ematen duen autentifikazio-kodea. <toggleToManualModeButton>Ezin duzu kodea eskaneatu?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Amaitutakoan, autentifikazio-kodeak sortzen hasiko da zuk sartu ahal izateko.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = autentifikazio-kode
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Autentifikazioa kodea beharrezkoa
tfa-qr-code-alt = Erabili { $code } kodea onartzen diren aplikazioetan bi urratseko autentifikazioa konfiguratzeko.

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Legala
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Zerbitzuaren baldintzak
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Pribatutasun-oharra

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Pribatutasun-oharra

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Zerbitzuaren baldintzak

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = { -product-firefox }en saioa hasi berri duzu?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Bai, onartu gailua
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Hau ez bazara, <link>aldatu pasahitza</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Gailua konektatua
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Honekin sinkronizatzen ari zara: { $deviceFamily } { $deviceOS }-n
pair-auth-complete-sync-benefits-text = Orain irekitako fitxak, pasahitzak eta laster-markak atzi ditzakezu gailu guztietan.
pair-auth-complete-see-tabs-button = Ikusi sinkronizatutako gailuetako fitxak
pair-auth-complete-manage-devices-link = Kudeatu gailuak

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Sartu babeskopia autentifikazio-kodea <span>kontuaren ezarpenetara jarraitzeko</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Sartu autentifikazio-kodea <span> { $serviceName }</span>-ra joateko
auth-totp-instruction = Ireki zure autentifikazio-aplikazioa eta idatzi ematen duen autentifikazio-kodea.
auth-totp-input-label = Sartu 6 digituko kodea
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Berretsi
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Autentifikazioa kodea beharrezkoa

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Onarpena behar da <span>beste gailutik</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Parekatzeak kale egin du
pair-failure-message = Ezarpen prozedura amaitu da.

## Pair index page

pair-sync-header = Sinkronizatu { -brand-firefox } zure telefonoan edo tabletan
pair-cad-header = Konektatu { -brand-firefox } beste gailu batean
pair-already-have-firefox-paragraph = Dagoeneko { -brand-firefox } duzu telefono edo tablet batean?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sinkronizatu zure gailua
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Edo deskargatu
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Eskaneatu { -brand-firefox } mugikorrerako deskargatzeko edo bidali <linkExternal>deskargarako esteka</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Une honetan ez
pair-take-your-data-message = Eraman zure fitxak, laster-markak eta pasahitzak { -brand-firefox } erabiltzen duzun edonora.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Hasi erabiltzen
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR kodea

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Gailua konektatua
pair-success-message-2 = Parekatzea ondo egin da.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Berretsi <span>for { $email }</span>-kin parekatzea
pair-supp-allow-confirm-button = Berretsi parekatzea
pair-supp-allow-cancel-link = Utzi

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Onarpena behar da <span>beste gailutik</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Parekatzea aplikazioa erabiliz
pair-unsupported-message = Sistemako kamera darabilzu? { -brand-firefox } aplikazio batetik parekatu behar duzu.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Mesedez, itxaron, baimendutako aplikaziora birbideratzen ari zara.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Sartu kontua berreskuratzeko gakoa
account-recovery-confirm-key-instruction = Gako honek { -brand-firefox } zerbitzarietatik enkriptatutako nabigatze-datuak berreskuratzen ditu, hala nola pasahitzak eta laster-markak.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Sartu 32 karaktereko kontua berreskuratzeko gakoa
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Zure biltegiratzeko aholkua hau da:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Jarraitu
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Ez da aurkitzen zure kontua berreskuratzeko gakoa

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Sortu pasahitz berria
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Ezarri pasahitza
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Barkatu, arazo bat izan da pasahitza ezartzean
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Erabili kontua berreskuratzeko gakoa
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Pasahitza berrezarri da.
reset-password-complete-banner-message = Ez ahaztu kontua berreskuratzeko gako berri bat sortzea { -product-mozilla-account } ezarpenetatik aurrera begira saioa hasteko arazoak saihesteko.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } saioa hasi ondoren posta elektronikoko maskara bat erabiltzera bidaltzen saiatuko da.

# ConfirmBackupCodeResetPassword page


## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Egiaztatu zure posta elektronikoa
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Berrespen-kode bat bidali dugu <span>{ $email }</span> helbidera.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Sartu 8 digituko kodea 10 minutuko epean
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Jarraitu
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Birbidali kodea
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Erabili beste kontu bat

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Berrezarri pasahitza
confirm-totp-reset-password-subheader-v2 = Sartu bi urratseko autentifikazio kodea
confirm-totp-reset-password-instruction-v2 = Begiratu <strong>autentifikazio-aplikazioa</strong> pasahitza berrezartzeko.
confirm-totp-reset-password-trouble-code = Arazoak kodea sartzean?
confirm-totp-reset-password-confirm-button = Berretsi
confirm-totp-reset-password-input-label-v2 = Sartu 6 digituko kodea
confirm-totp-reset-password-use-different-account = Erabili beste kontu bat

## ResetPassword start page

password-reset-flow-heading = Berrezarri pasahitza
password-reset-body-2 =
    Zuk bakarrik dakizun gauza pare bat eskatuko dizugu 
    zure kontua seguru mantentzeko.
password-reset-email-input =
    .label = Idatzi zure helbide elektronikoa
password-reset-submit-button-2 = Jarraitu

## ResetPasswordConfirmed

reset-password-complete-header = Zure pasahitza berrezarri egin da
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Jarraitu { $serviceName } zerbitzura

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = Pasahitza ondo berrezarri da
reset-password-complete-new-password-saved = Pasahitz berria gorde da!
reset-password-complete-recovery-key-created = Kontua berreskuratzeko gako berria sortu da. Deskargatu eta gorde ezazu orain.
reset-password-complete-recovery-key-download-info =
    Gako hau ezinbestekoa da 
    datuak berreskuratzeko pasahitza ahazten baduzu. <b>Deskargatu eta gorde ezazu
    modu seguruan orain, ezin izango baikara orri honetara berriro sartu geroago</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Errorea:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Saio hasiera balioztatzen…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Berrespen-errorea
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Berrespen-lotura iraungita
signin-link-expired-message-2 = Sakatu duzun esteka iraungi egin da edo dagoeneko erabili da.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Sartu <span>zure { -product-mozilla-account }</span> pasahitza
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Jarraitu { $serviceName } zerbitzura
signin-subheader-without-logo-default = Jarraitu kontu-ezarpenekin
signin-button = Hasi saioa
signin-header = Hasi saioa
signin-use-a-different-account-link = Erabili beste kontu bat
signin-forgot-password-link = Pasahitza ahaztu duzu?
signin-password-button-label = Pasahitza
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } saioa hasi ondoren posta elektronikoko maskara bat erabiltzera bidaltzen saiatuko da.

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Klik egin duzun loturak karaktereak falta ditu; agian zure posta-bezeroak hondatu du. Kopiatu helbidea kontuz eta saiatu berriro.
report-signin-header = Baimenik gabeko saio-hasiera baten berri eman?
report-signin-body = Mezu bat jaso duzu zure kontuan saio hasiera saiakera bati buruz. Aktibitate hau susmagarri gisa jakinarazi nahi duzu?
report-signin-submit-button = Eman jardueraren berri
report-signin-support-link = Zergatik ari da hau gertatzen?
report-signin-error = Arazo bat izan da txostena bidaltzean.
signin-bounced-header = Barkatu. Zure kontua blokeatu dugu.
# $email (string) - The user's email.
signin-bounced-message = { $email } helbidera bidali zen berrespen mezua itzuli egin zen eta zure kontua blokeatu dugu zure { -brand-firefox } datuak babesteko.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Helbide elektroniko hau baliozkoa bada, <linkExternal>esaguzu</linkExternal> eta zure kontua desblokeatzen lagunduko dizugu.
signin-bounced-create-new-account = Helbide elektronikoa ez da jada zurea? Sortu kontu berri bat
back = Atzera

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Egiaztatu saio-hasiera hau <span>kontuaren ezarpenetara jarraitzeko</span>
signin-push-code-heading-w-custom-service = Egiaztatu saio-hasiera hau <span>{ $serviceName }</span>-n jarraitzeko
signin-push-code-instruction = Egiaztatu zure beste gailuak eta onartu saio-hasiera hau zure { -brand-firefox } nabigatzailetik.
signin-push-code-did-not-recieve = Ez al duzu jakinarazpena jaso?
signin-push-code-send-email-link = Posta elektronikoaren kodea

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Berretsi zure saio hasiera
signin-push-code-confirm-description = Saioa hasteko saiakera bat detektatu dugu hurrengo gailutik. Zu izan bazara, onar ezazu saioa hasteko
signin-push-code-confirm-verifying = Egiaztatzen
signin-push-code-confirm-login = Berretsi saio hasiera
signin-push-code-confirm-wasnt-me = Hau ez nintzen ni, aldatu pasahitza.
signin-push-code-confirm-login-approved = Zure saio-hasiera onartu da. Mesedez, itxi leiho hau.
signin-push-code-confirm-link-error = Esteka hondatuta dago. Mesedez, saiatu berriro.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Hasi saioa
signin-recovery-method-subheader = Aukeratu berreskuratze metodoa
signin-recovery-method-details = Ziurtatu zure berreskuratzeko metodoak erabiltzen ari zarela.
signin-recovery-method-phone = Berreskuratze telefonoa
signin-recovery-method-code-v2 = Autentifikazio-kodearen babes-kopia
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Kode { $numBackupCodes } gelditzen da
       *[other] { $numBackupCodes } kode gelditzen dira
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Arazo bat izan da kodea berreskuratzeko telefonora bidaltzean
signin-recovery-method-send-code-error-description = Saiatu berriro geroago edo erabili ordezko autentifikazio-kodeak.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Hasi saioa
signin-recovery-code-sub-heading = Sartu babeskopirako autentifikazio-kodea
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Sartu bi urratseko autentifikazioa konfiguratzean gorde dituzun erabilera bakarreko kodeetako bat.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Sartu 10 karaktereko kodea
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Berretsi
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Erabili berreskuratze telefonoa
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Blokeatuta zaude?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Beharrezkoa da autentifikazio-kodearen babeskopia
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Arazo bat izan da kodea berreskuratzeko telefonora bidaltzean
signin-recovery-code-use-phone-failure-description = Saiatu berriro geroago.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Hasi saioa
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Sartu berreskuratze kodea
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Sei digituko kodea bidali da <span>{ $lastFourPhoneDigits }</span>z amaitzen den telefono-zenbakira testu-mezu bidez. Kode hau 5 minuturen buruan iraungiko da. Ez partekatu kode hau inorekin.
signin-recovery-phone-input-label = Sartu 6 digituko kodea
signin-recovery-phone-code-submit-button = Berretsi
signin-recovery-phone-resend-code-button = Birbidali kodea
signin-recovery-phone-resend-success = Kodea bidalia
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Blokeatuta zaude?
signin-recovery-phone-send-code-error-heading = Arazoa egon da zure kodea bidaltzen.
signin-recovery-phone-code-verification-error-heading = Arazoa egon da zure kodea egiaztatzen
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Saiatu berriro geroago.
signin-recovery-phone-invalid-code-error-description = Kodea baliogabea da edo iraungi da.
signin-recovery-phone-invalid-code-error-link = Erabili babeskopiako autentifikazio-kodeak horren ordez?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Saioa hasi da. Baliteke mugak aplikatzea berreskuratzeko telefonoa berriro erabiltzen baduzu.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Eskerrik asko zure zaintzagatik
signin-reported-message = Gure taldeari jakinarazi zaio. Horrelako txostenek arrotzak kanpo mantentzen laguntzen digu.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Sartu zure { -product-mozilla-account }</span> berrespen-kodea<span>
signin-token-code-input-label-v2 = Sartu 6 digituko kodea
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Berretsi
signin-token-code-code-expired = Kodea iraungita?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Posta elektroniko kode berria.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Berrespen kodea beharrezkoa da
signin-token-code-resend-error = Zerbait gaizki joan da. Ezin izan da kode berri bat bidali.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } saioa hasi ondoren posta elektronikoko maskara bat erabiltzera bidaltzen saiatuko da.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Hasi saioa
signin-totp-code-subheader-v2 = Sartu bi urratseko autentifikazio kodea
signin-totp-code-instruction-v4 = Egiaztatu zure <strong>autentifikazio-aplikazioa</strong> saioa hastea berresteko.
signin-totp-code-input-label-v4 = Sartu 6 digituko kodea
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Berretsi
signin-totp-code-other-account-link = Erabili beste kontu bat
signin-totp-code-recovery-code-link = Arazoak kodea sartzean?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Autentifikazioa kodea beharrezkoa
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } saioa hasi ondoren posta elektronikoko maskara bat erabiltzera bidaltzen saiatuko da.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Baimendu saio-hasiera hau
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Begiratu zure posta elektronikoa { $email } helbidera bidalitako baimen-kodea.
signin-unblock-code-input = Idatzi baimen-kodea
signin-unblock-submit-button = Jarraitu
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Baimen-kodea behar da
signin-unblock-code-incorrect-length = Baimen-kodeak 8 karaktere izan behar ditu
signin-unblock-code-incorrect-format-2 = Baimen-kodeak letrak edota zenbakiak soilik izan ditzake
signin-unblock-resend-code-button = Ez dago sarrera-ontzian edo spam karpetan? Bidali berriro
signin-unblock-support-link = Zergatik ari da hau gertatzen?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } saioa hasi ondoren posta elektronikoko maskara bat erabiltzera bidaltzen saiatuko da.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Sartu baieztapen-kodea
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Sartu <span>zure { -product-mozilla-account }</span>ko  berrespen-kodea
confirm-signup-code-input-label = Sartu 6 digituko kodea
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Berretsi
confirm-signup-code-code-expired = Kodea iraungita?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Posta elektroniko kode berria.
confirm-signup-code-success-alert = Kontua behar bezala berretsi da
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Berrespen kodea beharrezkoa da
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } saioa hasi ondoren posta elektronikoko maskara bat erabiltzera bidaltzen saiatuko da.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-relay-info = Pasahitz bat behar da maskaratutako mezu elektronikoak modu seguruan kudeatzeko eta { -brand-mozilla }-ren segurtasun-tresnetara atzitzeko.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Aldatu helbide elektronikoa
