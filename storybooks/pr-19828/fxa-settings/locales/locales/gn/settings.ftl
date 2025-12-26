# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Oñemondo mba’eñemi ne ñanduti vevépe.
resend-link-success-banner-heading = Oñemondo juajuha ne ñanduti vevépe.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Embojuaju { $accountsEmail } ne ñomongetahápe og̃uahẽ hag̃ua apañuai’ỹre.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Emboty banner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } hérata { -product-mozilla-accounts }  1 jasypateĩ guive
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Emoñepyrũta gueteri tembiapo nde poruhára réra ha ñe’ẽñemi eiporumeméva ndive, ha naiñambuéi apopyre eiporuvavoi.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Romoambue { -product-firefox-accounts } mba’ete réra ko’ág̃a guive { -product-mozilla-accounts }. Emoñepyrũjeýta tembiapo nde poruhára réra ha ñe’ẽñemi eiporúva ndive, ha naiñambuéi apopyre eiporúva.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Kuaave
# Alt text for close banner image
brand-close-banner =
    .alt = Emboty Banner
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m ra’ãnga’i

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Tapykue
button-back-title = Tapykue

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Emboguejy ha eku’ejey
    .title = Emboguejy ha eku’ejey
recovery-key-pdf-heading = Mba’ete mba’eñemi jeguerujeyrã
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Heñoipyre: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Mba’ete mba’eñemi jeguerujeyrã
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Ko ñe’ẽñemi omoneĩ eguerujey hag̃ua kundahára mba’ekuaarã ipapapýva (oĩhápe ñe’ẽñemi, techaukaha ha tembiasakue) nanemandu’áiramo ñe’ẽñemíre. Eñongatu eikuaa hag̃uáme.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Eñongatukuaaha mba’eñemi
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Eikuaave ne mba’ete mba’eñemi guerujeyrã rehegua
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Ore ñyro, oĩ apañuái hekopyahúvo ne mba’ete mba’eñemi jeguerujeyrã.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Eguerekove { -brand-mozilla }-gui:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Og̃uahẽta marandu ha mbohekopyahu apopyre rehegua
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Eike pya’e eiporu hag̃ua apopyre pyahu
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Nehenói tembiaporã Ñanduti mopu’ãjeyrã

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Mboguejypyre
datablock-copy =
    .message = Monguatiapyre
datablock-print =
    .message = Monguatiapyre

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Ayvu monguatiapyre
       *[other] Ayvukuéra monguatiapyre
    }
datablock-download-success =
    { $count ->
        [one] Ayvu mboguejypyre
       *[other] Ayvukuéra mboguejypyre
    }
datablock-print-success =
    { $count ->
        [one] Ayvu Ikuatiapyréva
       *[other] Ayvukuéra Ikuatiapyréva
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Monguatiapyre

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (ojekuaaporã’ỹva)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (ojekuaaporã’ỹva)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (ojekuaaporã’ỹva)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (ojekuaaporã’ỹva)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Tendatee ojekuaa’ỹva
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } { $genericOSName }-pe
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP kundaharape: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Ñe’ẽñemi
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ehai jey ñe’ẽñemi
form-password-with-inline-criteria-signup-submit-button = Emoheñói mba’ete
form-password-with-inline-criteria-reset-new-password =
    .label = Ñe’ẽñemi pyahu
form-password-with-inline-criteria-confirm-password =
    .label = Emoneĩ ñe'ẽñemi
form-password-with-inline-criteria-reset-submit-button = Emoheñói ñe’ẽñemi pyahu
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Ñe’ẽñemi
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Emoingejey ñe’ẽñemi
form-password-with-inline-criteria-set-password-submit-button = Eñepyrũ embojuehe
form-password-with-inline-criteria-match-error = Ko’ã ñe’ẽñemi ndojojoguái
form-password-with-inline-criteria-sr-too-short-message = Pe ñe’ẽñemi oguerekova’erã michĩ’vérõ 8 tai.
form-password-with-inline-criteria-sr-not-email-message = Pe ñe’ẽñemi ani oreko ne ñanduti veve kundaharape.
form-password-with-inline-criteria-sr-not-common-message = Pe ñe’ẽñemi ani oreko ñe’ẽñemi ojeporumeméva.
form-password-with-inline-criteria-sr-requirements-met = Pe ñe’ẽñemi haipyre ohechapava’erã ñe’ẽñemi oikotevẽva.
form-password-with-inline-criteria-sr-passwords-match = Ko’ã ñe’ẽñemi haipyre ojuehegua.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Ko korápe ahaiva’erã

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Ehai ayvu orekóva { $codeLength } tai eku’e hag̃ua
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Ehai ayvu orekóva { $codeLength } tai eku’e hag̃ua

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } Mba’ete mba’eñemi jeguerujeyrã
get-data-trio-title-backup-verification-codes = Ayvu ñemoneĩrã jeykekoha
get-data-trio-download-2 =
    .title = Mboguejy
    .aria-label = Mboguejy
get-data-trio-copy-2 =
    .title = Monguatia
    .aria-label = Monguatia
get-data-trio-print-2 =
    .title = Ñemonguatia
    .aria-label = Ñemonguatia

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Kyhyjerã
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Ema’ẽmi
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Kyhyjerã
authenticator-app-aria-label =
    .aria-label = Ñemoñeĩha ñemboguata
backup-codes-icon-aria-label-v2 =
    .aria-label = Ayvu ñemoneĩrã jeykekoha jurujapyre
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Ayvu ñemoneĩrã jeykekoha pe’apyre
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS guerujeyrã jurujapyre
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS guerujeyrã pe’apyre
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Canadá Poyvi
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Mongurusu
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Oĩporãva
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Myandypyre
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Emboty ñe’ẽmondo
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Ayvu
error-icon-aria-label =
    .aria-label = Javy
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Ñemomarandu
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Estados Unidos poyvi

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Mohendaha ha pumbyry popegua korasõ jeka ra’ãnga reheve peteĩteĩvape
hearts-verified-image-aria-label =
    .aria-label = Mohendaha, pumbyry popegua ha tabléta korasõ otytýiva ra’ãnga reheve peteĩteĩvape
signin-recovery-code-image-description =
    .aria-label = Kuatiaite orekóva moñe’ẽrã kañymby.
signin-totp-code-image-label =
    .aria-label = Mba’e’oka ayvu kañymby 6 tai reheve.
confirm-signup-aria-label =
    .aria-label = Mba’yru oguerekóva juajuha
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ta’ãnga ehechauka hag̃ua mba’ete mba’eñemi guerujeyrã.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ta’ãnga ehechauka hag̃ua mba’ete mba’eñemi guerujeyrã.
password-image-aria-label =
    .aria-label = Ñemopyenda ehaikuaa hag̃ua ñe’ẽñemi jegueroike.
lightbulb-aria-label =
    .aria-label = Ta’ãnga ehechauka hag̃ua ñemoñe’ẽ moheñoimby ñembyatyha rendarã.
email-code-image-aria-label =
    .aria-label = Ta’ãnga ehechaukakuaa hag̃ua ñanduti veve ijayvúva.
recovery-phone-image-description =
    .aria-label = Pumbyrýpe og̃uahẽva ayvu ñe’ẽmondo jehaíva rehegua.
recovery-phone-code-image-description =
    .aria-label = Ayvu og̃uahẽva pumbyry popeguápe.
backup-recovery-phone-image-aria-label =
    .aria-label = Pumbyry popegua ikatuhápe eñe’ẽmondo
backup-authentication-codes-image-aria-label =
    .aria-label = Mba’e’oka rechaha ijayvúva
sync-clouds-image-aria-label =
    .aria-label = Arai ñembojuehe ra’ãnga’i ndive
confetti-falling-image-aria-label =
    .aria-label = Kuatia vore’i ho’áva vevépe

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Emoñepyrũma tembiapo { -brand-firefox }-pe.
inline-recovery-key-setup-create-header = Emo’ã ne mba’ete
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = ¿Ereko peteĩ aravo emo’ã hag̃ua ne mba’ekuaarã?
inline-recovery-key-setup-info = Emoheñói mba’ete guerujeyrã mba’eñemi emyatyrõ hag̃ua ne ñeikundaha mba’ekuaarã mbojuehepyre nderesaráirõ ne ñe’ẽñemi.
inline-recovery-key-setup-start-button = Emoheñói mba’ete mba’eñemi guerujeyrã
inline-recovery-key-setup-later-button = Ejapo uperire

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Emokañy ñe’ẽñemi
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Ehechauka ñe’ẽñemi
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Ne ñe’ẽñemi ojekuaa mba’erechahápe.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Ne ñe’ẽñemi ko’ag̃aite oĩ kañyhápe.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Ne ñe’ẽñemi ojekuaa mba’erechahápe.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Ne ñe’ẽñemi ko’ag̃aite oĩ kañyhápe.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Eiporavo tetã
input-phone-number-enter-number = Ehai pumbyry papapy
input-phone-number-country-united-states = Estados Unidos
input-phone-number-country-canada = Canadá
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Tapykue

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Juajuha eguerujey hag̃ua ñe’ẽñemi oñembyai
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Juajuha hechajeyha oñembyai
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Juajuha ndoikóiva
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Pe juajuha eiporavóva ndorekopái tai ha ikatu ne ñanduti veve poruhára ombyai. Emonguatia pe kundaharape mbeguemi ha eha’ã jey uperire.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Ereko juajuha pyahu

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = ¿Nemandu’áke ñe’ẽñemíre?
# link navigates to the sign in page
remember-password-signin-link = Eñepyrũ tembiapo

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Ñanduti veve tuichavéva moneĩmbyre
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Tembiapo ñepyrũ moneĩmbyre
confirmation-link-reused-message = Ojeporúma pe joajuha ñemoneĩrãva ha peteĩjeýnte ikatu eiporu.

## Locale Toggle Component

locale-toggle-select-label = Eiporavo ñe’ẽ
locale-toggle-browser-default = Kundahára ypyguáva
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Mba’ejerure ojavýva

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Eikotevẽ ñe’ẽñemi eike hag̃ua oimeraẽva mba’ekuaarã ipapapýva embyatýva orendive.
password-info-balloon-reset-risk-info = Ñemoñepyrũjey he’ise okañykuaaha mba’ekuaarã ikatúva ñe’ẽñemi ha techaukaha.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Eiporavo ñe’ẽñemi hekorosãva eiporu’ỹva ambue tendápe. Ehecha omoañetépa ojejeruréva tekorosãrã:
password-strength-short-instruction = Eiporavo ñe’ẽñemi hekorosãva:
password-strength-inline-min-length = Michĩvéramo 8 tai
password-strength-inline-not-email = Ani ne ñanduti veve kundaharape
password-strength-inline-not-common = Ndaha’éi ne ñe’ẽñemi eiporumeméva
password-strength-inline-confirmed-must-match = Pe ñemoneĩ ojokupyty ñe’ẽñemi pyahúre
password-strength-inline-passwords-match = Ñe’ẽñemi ojueheguáva

## Notification Promo Banner component

account-recovery-notification-cta = Moheñói
account-recovery-notification-header-value = Nokañyiva’erã ne mba’ekuaarã nderesaráirõ ne ñe’ẽñemi
account-recovery-notification-header-description = Emoheñói mba’ete guerujeyrã mba’eñemi emyatyrõ hag̃ua ne ñeikundaha mba’ekuaarã mbojuehepyre nderesaráirõ ne ñe’ẽñemi.
recovery-phone-promo-cta = Embojuaju pumbyry guerujeyrã
recovery-phone-promo-heading = Embojuaju ñemo’ãha ne mba’etépe pumbyry guerujeyrã ndive
recovery-phone-promo-description = Ko’ág̃a eikekuaa ñe’ẽñemi reheve peteĩ jeýnte SMS rupive ndaikatúirõ eiporu tembiporu’i jeykekorã mokõi jeku’épe.
recovery-phone-promo-info-link = Eikuaave guerujeyrã rehegua ha SIM ñemoambue imarãkuaaha
promo-banner-dismiss-button =
    .aria-label = Emboyke báner

## Ready component

ready-complete-set-up-instruction = Embohekopa emoingévo pe ñe’ẽñemi pyahu ne ambue mba’e’oka { -brand-firefox } ndive.
manage-your-account-button = Eñangareko ne mba’etére
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Ko’ág̃a eiporukuaáma { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Eiporukuaáma pe mba’ete ñemboheko
# Message shown when the account is ready but the user is not signed in
ready-account-ready = ¡Ne mba’ete oĩmbáma!
ready-continue = Ku’ejey
sign-in-complete-header = Tembiapo ñepyrũ moneĩmbyre
sign-up-complete-header = Mba’ete moneĩmbyre
primary-email-verified-header = Ñanduti veve tuichavéva moneĩmbyre

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Eñongatukuaaha mba’eñemi:
flow-recovery-key-download-storage-ideas-folder-v2 = Marandurenda mba’e’oka hekorosãvape
flow-recovery-key-download-storage-ideas-cloud = Ñeñongatuha araípe jeroviaha
flow-recovery-key-download-storage-ideas-print-v2 = Ñemonguatiapyre
flow-recovery-key-download-storage-ideas-pwd-manager = Ñe’ẽñemi ñangarekohára

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Embojuaju tape roipytyvõ hag̃ua ne mba’eñemi guerujeyrã
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Ko tape nepytyvõta nemandu’a hag̃ua moõpa eñongatu mba’ete mba’eñemi guerujeyrã. Rohechaukakuaa erujey aja ne ñe’ẽñemi erekojey hag̃ua ne mba’ekuaarã.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Emoinge tape (ejaposérõ)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Mbopaha
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Pe tape oguerekova’erã hetave 255 tairendágui.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Pe jehoha ndorekoiva’erã taichagua Unicode hekorosã’ỹva. Oñemoneĩ tai añónte, papapy, kyta aty ha ta’ãnga’i.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Jesarekorã
password-reset-chevron-expanded = Ñemongyhyje
password-reset-chevron-collapsed = Emyasãi mongyhyje
password-reset-data-may-not-be-recovered = Ne ñeikundaha mba’ekuaarã ikatu okañyete
password-reset-previously-signed-in-device-2 = ¿Ereko peteĩ mba’e’oka eñepyrũhaguékuri tembiapo?
password-reset-data-may-be-saved-locally-2 = Umi mba’ekuaarã ne kundaharagua oñeñongatukuaa mba’e’okápe. Erujey ne ñe’ẽñemi ha eñepyrũ tembiapo upépe erujey ha embojuehe hag̃ua ne mba’ekuaarã.
password-reset-no-old-device-2 = ¿Eguereko peteĩ mba’e’oka pyahu hákatu ndereikekuaái itujavévape?
password-reset-encrypted-data-cannot-be-recovered-2 = Rombyasy, mba’ekuaarã ne mohendahapegua ipapapýva { -brand-firefox } mohendahavusu ndaikatúi erujey.
password-reset-warning-have-key = ¿Eguereko mba’ete jeguerujeyrã?
password-reset-warning-use-key-link = Eiporu egueru jey hag̃ua ne ñe’ẽñemi ha ani ogue ne mba’ekuaarã

## Alert Bar

alert-bar-close-message = Emboty ñe’ẽmondo

## User's avatar

avatar-your-avatar =
    .alt = Nde avatar
avatar-default-avatar =
    .alt = Avatar ypyguáva

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } apopyrekuéra
bento-menu-tagline = { -brand-mozilla } apopyrekuéra omo’ãva nde rekoñemi
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } kundahára mesa arigua
bento-menu-firefox-mobile = { -brand-firefox } kundahára pumbyrýpe g̃uarã
bento-menu-made-by-mozilla = { -brand-mozilla } moheñoimby

## Connect another device promo

connect-another-fx-mobile = Ereko { -brand-firefox } mba’e’oka térã tablétape
connect-another-find-fx-mobile-2 = Eheka { -brand-firefox } { -google-play } ha { -app-store } ndive.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Emboguejy { -brand-firefox } { -google-play }pe
connect-another-app-store-image-3 =
    .alt = Emboguejy { -brand-firefox } { -app-store } rupi

## Connected services section

cs-heading = Mba’eporu mbojuajupyre
cs-description = Eiporúva guive ha emoñepyrũhápe tembiapo.
cs-cannot-refresh =
    Rombyasy, oĩ apañuái hekopyahúvo mba’epytyvõrã rysýi
    juajupyre.
cs-cannot-disconnect = Joguahára ndojejuhúi, ndaikatúi osẽ
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Osẽma { $service }-gui.
cs-refresh-button =
    .title = Embohekopyahu mba’epytyvõrã mbojuajupyre
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = ¿Mba’eporu oĩ’ỹva térã ikõiva?
cs-disconnect-sync-heading = Sync-gui ñesẽ

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Ne kundahára mba’ekuaarã opytáta <span>{ $device }</span>-pe,
    hákatu ndojuehemo’ãvéima nemba’ete ndive.
cs-disconnect-sync-reason-3 = ¿Mba’érepa remboykese añetehápe <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Pe mba’e’oka ha’e:
cs-disconnect-sync-opt-suspicious = Ivaikuaáva
cs-disconnect-sync-opt-lost = Okañy térã mondapyre
cs-disconnect-sync-opt-old = Ituya térã hekoviapyréva
cs-disconnect-sync-opt-duplicate = Mokõimbyre
cs-disconnect-sync-opt-not-say = Nda’eséinte

##

cs-disconnect-advice-confirm = Oĩma, aikumbýma
cs-disconnect-lost-advice-heading = Pe mba’e’oka kañymby térã mondapyre ojepe’áma
cs-disconnect-lost-advice-content-3 = Ojehechávo ne mba’e’oka okañy térã oñemonaha, ereko hag̃ua ne marandu tekorosãme, emoambue ñe’ẽñemi { -product-mozilla-account } pegua ne mba’ete ñembohekahápe. Avei eheka pe marandu mba’e’oka apoharégui mba’éicapa emboguéta ne mba’ekuaarã oka guive.
cs-disconnect-suspicious-advice-heading = Pe mba’e’oka imarãkuaáva ojepe’áma
cs-disconnect-suspicious-advice-content-2 = Pe mba’e’oka pe’apyre ehecháramo ivaikuaaha, ereko hag̃ua ne marandu tekorosãme, emoambue ne ñe’ẽñemi { -product-mozilla-account } pegua ne mba’ete ñembohekohápe. Avei emoambue oimeraẽva ambue ñe’ẽñemi eñongatuva’ekue { -brand-firefox }-pe ehaívo about:logins kundaharape rendápe.
cs-sign-out-button = Emboty tembiapo

## Data collection section

dc-heading = Ñembyaty ha mba’ekuaarã jeporu
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } kundahára
dc-subheader-content-2 = Emoneĩ { -product-mozilla-accounts } omondóvo mba’ekuaarã aporekogua ha ñomongeta { -brand-mozilla }-pe.
dc-subheader-ff-content = Ehechajey térã embohekopyahu mba’ekuaarã ñomongeta ha aporekogua { -brand-firefox } kundahárape, embojuruja { -brand-firefox } moĩporãha ha eikundaha tekoñemi ha tekorosãme.
dc-opt-out-success-2 = Esẽ porã. { -product-mozilla-accounts } nomondomo’ãi mba’ekuaarã aporeko térã ñomongetagua { -brand-mozilla }-pe.
dc-opt-in-success-2 = ¡Aguyje! Emoherakuãvo ko’ã mba’ekuaarã ore pytyvõta { -product-mozilla-accounts } oiko porãvévo.
dc-opt-in-out-error-2 = Ore ñyrõ, iñapañuái emoambuévo mba’ekuaarã ñembyaty eguerohoryvéva
dc-learn-more = Kuaave

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } poravorã
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Eike peteĩramo
drop-down-menu-sign-out = Ñesẽ
drop-down-menu-sign-out-error-2 = Ore ñyrõ, iñapañuái embotykuévo ne rembiapo

## Flow Container

flow-container-back = Tapykue

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Ehaijey ne ñe’ẽñemi tekorosãrãve
flow-recovery-key-confirm-pwd-input-label = Ehai ne ñe’ẽñemi
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Emoheñói mba’ete mba’eñemi guerujeyrã
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Emoheñói mba’ete mba’eñemi jeguerujeyrã pyahu

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Mba’ete mba’eñemi guerujeyrã moheñoimbyre — Emboguejy ha eñongatu
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Ko mba’eñemi omoneĩ erujey hag̃ua ne mba’ekuaarã nderesaráirõ ñe’ẽñemígui. Emboguejy ko’ág̃a ha eñongatu nemandu’a hag̃uáme — nderejevykuaamo’ãvéima ko kuatiaroguépe upe rire.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Eku’ejey emboguejy’ỹre

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Mba’ete mba’eñemi guerujeyrã moheñoimbyre

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Emoheñói mba’ete mba’eñemi guerujeyrã nderesaráirõ ne ñe’ẽñemígui
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Emoambue ne mba’ete mba’eñemi guerujeyrã
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Rombopapapy kundahára mba’ekuaarã: ñe’ẽñemi, techaukaha ha hetave. Iporã añete tekorosãrã, hákatu okañykuaa mba’ekuaarã nde rasaráirõ ñe’ẽñemígui.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Upévare natekotevéi emoheñói mba’eñemi guerujeyrã mba’ete –– eiporukuaa erujey hag̃ua ne mba’ekuaarã
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Eñepyrũ
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Heja

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Eike tembiporu’i ñemoneĩhávape
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Jeku’e 1:</strong> Emoha’ãnga QR ayvu eiporúvo peteĩva tembiporu’i ñemoneĩrã, ikatúva Duo térã Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR ayvu emboheko hag̃ua ñemoneĩ mokõi jeku’egua. Emoha’ãnga térã eiporavo "¿Ndaikatúi emoha’ãnga QR ayvu?" ehupyty hag̃ua ñe’ẽñemi ñemboheko ñemigua.
flow-setup-2fa-cant-scan-qr-button = ¿Ndaikatúi emoha’ãnga QR ayvu?
flow-setup-2fa-manual-key-heading = Emoinge ayvu nde poitépe
flow-setup-2fa-manual-key-instruction = <strong>Ku’e 1:</strong> Emoinge ko ayvu ne rembiporu’i ñemoneĩrã eipotávape.
flow-setup-2fa-scan-qr-instead-button = ¿Emoha’ãnga QR ayvu hendaguépe?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Eikuaave tembiporu’i ñemoneĩrã rehegua
flow-setup-2fa-button = Ku’ejey
flow-setup-2fa-step-2-instruction = <strong>Ku’e 1:</strong> Emoinge ko ayvu ne rembiporu’i ñemoneĩrã.
flow-setup-2fa-input-label = Emoinge ayvu 6 taíva
flow-setup-2fa-code-error = Ayvu oiko’ỹ térã opámava. Ehecha tembiporu’i ñemoneĩha ha eha’ã ag̃ave.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Eiporavo mba’éichapa erujeýta
flow-setup-2fa-backup-choice-description = Kóva omoneĩ eikévo ndaikatúiramo jepe eike ne mba’e’oka pumbyrygua térã ne rembiporu’i ñemoneĩhápe.
flow-setup-2fa-backup-choice-phone-title = Pumbyry guerujeyrã
flow-setup-2fa-backup-choice-phone-badge = Ndahasýi
flow-setup-2fa-backup-choice-phone-info = Ehupyty peteĩ ayvu guerujerã SMS rupive. Ko’ág̃a oĩva EE. UU. ha Canadá-pe.
flow-setup-2fa-backup-choice-code-title = Ayvu ñemoneĩrã jeykekoha
flow-setup-2fa-backup-choice-code-badge = Hekorosãve
flow-setup-2fa-backup-choice-code-info = Ejapo ha eñongatu umi ayvu ñemoneĩrã peteĩ jeygua.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Eikuaave guerujeyrã rehegua ha SIM ñemoambue imarãkuaaha

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Emoinge ayvu ñemoneĩrã jeykekoha
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Emoañete eñongatuhague ne ayvukuéra ehaívo peteĩ. Ko’ã ayvu’ỹre, ikatuhína ndereikekuaái ndereguerekóiramo ne rembiporu’i ñemoneĩrã.
flow-setup-2fa-backup-code-confirm-code-input = Ehai ayvu orekóva 10 tai
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Mbopaha

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Eñongatu ayvu ñemoneĩrã jeykekoha
flow-setup-2fa-backup-code-dl-save-these-codes = Eñongatu umíva peteĩ tenda nemanduʼatahápe. Ndaikatúiramo eike ne rembiporu’i ñemoneĩrãme, eikotevẽta peteĩ eikekuaa hag̃ua.
flow-setup-2fa-backup-code-dl-button-continue = Ku’ejey

##

flow-setup-2fa-inline-complete-success-banner = Ijurujáma mokõi jeku’épe ñemoneĩ
flow-setup-2fa-inline-complete-backup-code = Ayvu ñemoneĩrã jeykekoha
flow-setup-2fa-inline-complete-backup-phone = Pumbyry guerujeyrã
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } ayvu hembýva
       *[other] { $count } ayvuita hembýva
    }
flow-setup-2fa-inline-complete-backup-code-description = Kóicha añoite erujeýta tekorosãme ndereiporukuaáiramo ne pumbyry mba’e’oka térã tembiporu’i ñemoneĩrã.
flow-setup-2fa-inline-complete-backup-phone-description = Kóicha erujeýta tekorosãme ndereiporukuaáirõ pumbyry mba’e’oka térã tembiporu’i ñemoneĩrã.
flow-setup-2fa-inline-complete-learn-more-link = Mba’éichapa omo’ãta ne mba’ete
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Eku’ejey { $serviceName } ndive
flow-setup-2fa-prompt-heading = Emboheko ñemoneĩ mokõi jeku’épe
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } ojerure emohenda hag̃ua mokõi tape ñemoneĩrã ereko hag̃ua ne mba’ete tekorosãme.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Eiporukuaa oimeraẽva <authenticationAppsLink>ko’ã tembiporu’i ñemoneĩrã</authenticationAppsLink> eku’ejey hag̃ua.
flow-setup-2fa-prompt-continue-button = Ku’ejey

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Emoinge ayvu jehechajeyrã
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Ohóma peteĩ ayvu orekóva 6 tai <span>{ $phoneNumber }</span> SMS rupive. Ko ayvu opareíta 5 aravo’ípe.
flow-setup-phone-confirm-code-input-label = Emoinge ayvu 6 taíva
flow-setup-phone-confirm-code-button = Moneĩ
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = ¿Ndoikovéima ayvu?
flow-setup-phone-confirm-code-resend-code-button = Emondojey ayvu
flow-setup-phone-confirm-code-resend-code-success = Ayvu mondopyre
flow-setup-phone-confirm-code-success-message-v2 = Pumbyry guerujeyrã mbojuajupyre
flow-change-phone-confirm-code-success-message = Oñemoambue pumbyry guerujeyrã

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Ehechajey ne pumbyry papapy
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Og̃uahẽta ñe’ẽmondo jehaipy { -brand-mozilla } guive peteĩ ayvu ehechajey hag̃ua nde papapy. Aníke emoherakuã ko ayvu.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Pumbyry guerujeyrã ojeporukuaa Estados Unidos ha Canadá-pe añoite. Noñemoneĩri VoIP papapy avei pumbyry rovamo’ãha.
flow-setup-phone-submit-number-legal = Reme’ẽvo papapy, emoneĩ rombyaty romondokuaa hag̃ua ñe’ẽmondo haipýva roikuaa potávo mba’ete. Ikatu jehepyme’ẽrã ñe’ẽmondo ha mba’ekuaarã rupi.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Emondo ayvu

## HeaderLockup component, the header in account settings

header-menu-open = Emboty poravorã
header-menu-closed = Tenda kundahára poravorã
header-back-to-top-link =
    .title = Ejevy yvateguápe
header-back-to-settings-link =
    .title = Eho { -product-mozilla-account } ñembohekópe
header-title-2 = { -product-mozilla-account }
header-help = Pytyvõ

## Linked Accounts section

la-heading = Mba’ete juajupyre
la-description = Eikekuaa apañuai’ỹre ko’ã mba’etépe.
la-unlink-button = Pe’aite
la-unlink-account-button = Pe’aite
la-set-password-button = Emoĩ Ñe’ẽñemi
la-unlink-heading = Eipe’aite mbohapyháva mba’etégui
la-unlink-content-3 = ¿Eipe’asépa añetehápe ne mba’ete? Eipe’ávo ne mba’ete ndaha’éi esẽtakuaámava pya’ekuépe umi mba’eporúgui. Ejapo hag̃ua upéicha, embotyraẽva’erã tembiapo nde pópe pe Mba’eporu jeikepyréva ndive.
la-unlink-content-4 = Ejeiete mboyve ne mba’etégui, emoheñói ñe’ẽñemi. Ñe’ẽñemi’ỹre, neremoñepyrũkuaamo’ãi tembiapo ejei rire ne mba’etégui.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Mboty
modal-cancel-button = Heja
modal-default-confirm-button = Moneĩ

## ModalMfaProtected

modal-mfa-protected-title = Emoinge ayvu ñemoneĩrã
modal-mfa-protected-subtitle = Ore pytyvõ roikuaa hag̃ua ndeha emoambuéva ne mba’ete marandu.
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Ehai ayvu ohóva <email>{ $email }</email>-pe { $expirationTime } aravo’i pa’ũme.
       *[other] Ehai ayvu ohóva <email>{ $email }</email>-pe { $expirationTime } aravo’ieta pa’ũme.
    }
modal-mfa-protected-input-label = Emoinge ayvu 6 taíva
modal-mfa-protected-cancel-button = Heja
modal-mfa-protected-confirm-button = Moneĩ
modal-mfa-protected-code-expired = ¿Hembýva ayvu?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Emondo ayvu pyahu ñanduti veve rupi.

## Modal Verify Session

mvs-verify-your-email-2 = Emoneĩ ne ñandutiveve
mvs-enter-verification-code-2 = Emoinge nde ayvu jehechajeyrã
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Ikatúpiko ehai 5 aravo’i mboyve ayvu ñemoneĩrã oñemondopyre <email>{ $email }</email>-pe.
msv-cancel-button = Heja
msv-submit-button-2 = Moneĩ

## Settings Nav

nav-settings = Ñemboheko
nav-profile = Mba’ete
nav-security = Tekorosã
nav-connected-services = Mba’epytyvõrã mbojuajupyre
nav-data-collection = Ñembyaty ha mba’ekuaarã jeporu
nav-paid-subs = Ñemboheraguapy ñehepyme’ẽgua
nav-email-comm = Ñemongeta ñanduti veve rupive

## Page2faChange

page-2fa-change-title = Emombue ñemboaje mokõi jeku’egua
page-2fa-change-success = Oñembohekopyahúma ñemboaje mokõi jeku’egua
page-2fa-change-totpinfo-error = Oiko jejavy emyengoviávo tembiporu’i ñemoneĩha mokõi jeku’egua. Eha’ã jey ag̃ave.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Ayvu ñemoneĩrã jeykekoha
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Oiko apañuái emyengoviakuévo nde ayvu jeguerujeyrã jeykekoha
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Oiko apañuái emyengoviakuévo nde ayvu jeguerujeyrã jeykekoha
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Ayvu ñemoneĩrã jeykekoha hekopyahupyre
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Ayvu ñemoneĩrã jeykekoha moheñoimbyre
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Eñongatu nemandu’a hag̃uáme uperire. Nde ayvu itujavéva hekoviáta ejapopávo ko jeku’e.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Emoañete eñongatuhague nde ayvukuéra emoingévo peteĩ. Umi ayvu ñemoneĩrãva jeykokeha oguéta ejapopávo ko jeku’e.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Ayvu ñemoneĩrã ñongatujeyrã ndoikói

## Page2faSetup

page-2fa-setup-title = Ñemoneĩ mokõi jeku’épe
page-2fa-setup-totpinfo-error = Oiko jejavy embohekokuévo ñemoneĩ mokõi jeku’egua. Eha’ã jey ag̃amieve.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Pe ayvu naiporãi. Eha’ã jey ag̃amieve.
page-2fa-setup-success = Oñembojurujáma ñemoneĩ mokõi jeku’egua
page-2fa-setup-success-additional-message = Emo’ãmbaite hag̃ua ne mba’e’okakuéra jeikepyre, embotypaite’arã opaite tenda eiporuhápe ko mba’ete ha upéi eike jey ñemoneĩ mokõi jeku’egua rupive.

## Avatar change page

avatar-page-title =
    .title = Ta’ãnga mba’etegua
avatar-page-add-photo = Embojuaju Ta’ãnga
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Eguenohẽ ta’ãnga
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Emboguete Ta’ãnga
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Eguenohẽjey ta’ãnga
avatar-page-cancel-button = Heja
avatar-page-save-button = Ñongatu
avatar-page-saving-button = Oñongatuhína…
avatar-page-zoom-out-button =
    .title = Momichĩ
avatar-page-zoom-in-button =
    .title = Mbotuicha
avatar-page-rotate-button =
    .title = Mbojere
avatar-page-camera-error = Noñemyandykuaái ta’ãnganohẽha
avatar-page-new-avatar =
    .alt = ta’ãnga pyahu mba’etépe
avatar-page-file-upload-error-3 = Iñapysẽ apañuái ehupívo nera’ãnga mba’etépe
avatar-page-delete-error-3 = Iñapysẽ apañuái emboguévo nera’ãnga mba’etégui
avatar-page-image-too-large-error-2 = Pe ta’ãnga marandurenda tuicha emyanyhẽ hag̃ua

## Password change page

pw-change-header =
    .title = Emoambue ñe’ẽñemi
pw-8-chars = Michĩvéramo 8 tai
pw-not-email = Iñambue ne ñanduti veve kundaharapégui
pw-change-must-match = Pe ñe’ẽñemi pyahu ojokupyty ñemoneĩ ndive
pw-commonly-used = Ndaha’éi ñe’ẽñemi ojeporumeméva
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Epyta porã — ani reiporu jey ñe’ẽñemi. Eikuaave ñe’ẽñemi <linkExternal>emoheñói hag̃ua ñe’ẽñemi mbarete</linkExternal>.
pw-change-cancel-button = Heja
pw-change-save-button = Ñongatu
pw-change-forgot-password-link = ¿Nderesaráipa ñe’ẽñemígui?
pw-change-current-password =
    .label = Emoinge ñe’ẽñemi ag̃agua
pw-change-new-password =
    .label = Emoinge ñe’ẽñemi pyahu
pw-change-confirm-password =
    .label = Emoneĩ ñe’ẽñemi pyahu
pw-change-success-alert-2 = Ñe’ẽñemi hekopyahúva

## Password create page

pw-create-header =
    .title = Emoheñói ñe’ẽñemi
pw-create-success-alert-2 = Ñe’ẽñemi moĩmbyre
pw-create-error-2 = Rombyasy, oiko apañuái emoĩnguévo ne ñe’ẽñemi

## Delete account page

delete-account-header =
    .title = Embogue mba’ete
delete-account-step-1-2 = Ku’e 1 2-gui
delete-account-step-2-2 = Ku’e 2 2-gui
delete-account-confirm-title-4 = Ikatu kuri embojuaju ne { -product-mozilla-account } peteĩ térã hetaiteve apopyre térã mba’eporu { -brand-mozilla } mba’etéva rehe nemohekorosã ha nemboha’evétava ñandutípe:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Embojuehe mba’ekuaarã { -brand-firefox } rehegua
delete-account-product-firefox-addons = { -brand-firefox } Moĩmbaha
delete-account-acknowledge = Nemandu’áke emboguetéramo ne mba’ete:
delete-account-chk-box-1-v4 =
    .label = Opaite ñemboheraguapy jehepyme’ẽgua opytareíta
delete-account-chk-box-2 =
    .label = Ikatu okañy marandu ha tembiapoite ñongatupyre { -brand-mozilla } apopyrépe
delete-account-chk-box-3 =
    .label = Ikatu eiporujeýrõ ko ñanduti veve ndogueruvéima marandu ñongatupyre
delete-account-chk-box-4 =
    .label = Oimeraẽva jepysokue ha téma emoherakuãva’ekue addons.mozilla.org-pe oñemboguepáta
delete-account-continue-button = Ku’ejey
delete-account-password-input =
    .label = Emoinge ñe’ẽñemi
delete-account-cancel-button = Heja
delete-account-delete-button-2 = Mboguete

## Display name page

display-name-page-title =
    .title = Téra ehechauka hag̃ua
display-name-input =
    .label = Emoinge téra ehechauka hag̃ua
submit-display-name = Ñongatu
cancel-display-name = Heja
display-name-update-error-2 = Oĩ apañuái embohekopyahúvo nde réra ehechauka hag̃ua
display-name-success-alert-2 = Téra ojehecháva hekopyahúma

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Mba’ete rembiapo ramoguavéva
recent-activity-account-create-v2 = Mba’ete moheñoimbyre
recent-activity-account-disable-v2 = Mba’ete pe’apyre
recent-activity-account-enable-v2 = Mba’ete mbojurujapyre
recent-activity-account-login-v2 = Mba’ete moñepyrũmbyre
recent-activity-account-reset-v2 = Oñepyrũma ñe’ẽñemi ñemyatyrõ
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Ñandutiveve ojevýva mboguepyre
recent-activity-account-login-failure = Ndoikói mba’etépe jeike
recent-activity-account-two-factor-added = Ijurujáma mokõi jeku’épe ñemoneĩ
recent-activity-account-two-factor-requested = Ñemoneĩ mokõijeýpe jerurepyre
recent-activity-account-two-factor-failure = Ndoikói ñemoneĩ mokõijeyguáva
recent-activity-account-two-factor-success = Oikoite ñemoneĩ mokõijeyguáva
recent-activity-account-two-factor-removed = Oñembogue ñemoneĩ mokõijeyguáva
recent-activity-account-password-reset-requested = Ojejerure ñe’ẽñemi ñemyatyrõjey
recent-activity-account-password-reset-success = Oĩporãjeýma mba’ete ñe’ẽñemi
recent-activity-account-recovery-key-added = Oĩporãjeýma mba’ete ñe’ẽñemi
recent-activity-account-recovery-key-verification-failure = Ndoikói mba’ete mba’eñemi jeguerujeyrã
recent-activity-account-recovery-key-verification-success = Ojehechajey mba’ete mba’eñemi jeguerujeyrã
recent-activity-account-recovery-key-removed = Oguéma ayvu jeguerujeyrã mba’ete
recent-activity-account-password-added = Ñe’ẽñemi pyahu mbojuajupyre
recent-activity-account-password-changed = Ñe’ẽñemi moambuepyre
recent-activity-account-secondary-email-added = Ñanduti veve mokõiháva mbojuajupyre
recent-activity-account-secondary-email-removed = Ñanduti veve mokõiháva mboguepyre
recent-activity-account-emails-swapped = Ñanduti veve ha’etéva ha mokõiháva mbojuasapyre
recent-activity-session-destroy = Esẽma tembiapohágui
recent-activity-account-recovery-phone-send-code = Ojererahauka ayvu guerujeyrã
recent-activity-account-recovery-phone-setup-complete = Pumbyry ñemboheko guerujeyrã henyhẽma
recent-activity-account-recovery-phone-signin-complete = Tembiapo ñepyrũ pumbyry guerujeyrã henyhẽma
recent-activity-account-recovery-phone-signin-failed = Ojavy emba’apóvo ne pumbyry guerujeyrã ndive
recent-activity-account-recovery-phone-removed = Pumbyry guerujeyrã mboguepyre
recent-activity-account-recovery-codes-replaced = Ayvu guerujeyrã myengoviapyre
recent-activity-account-recovery-codes-created = Ayvu guerujeyrã moheñoimbyre
recent-activity-account-recovery-codes-signin-complete = Ojavy emba’apóvo nde ayvu guerujeyrã henyhẽva ndive
recent-activity-password-reset-otp-sent = Ohóma ayvu ñemoneĩ oiko jey hag̃ua ñe’ẽñemi
recent-activity-password-reset-otp-verified = Ojehechajey ayvu ñemoneĩ oikoporã hag̃ua ñe’ẽñemi
recent-activity-must-reset-password = Tekotevẽ emoĩporã ñe’ẽñemi
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Mba’ete rembiapo ambuéva

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Mba’ete mba’eñemi jeguerujeyrã
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Eguevi ñembohekópe

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Embogue pumbyry papapy guerujeyrã
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Kóva omboguetéta <strong>{ $formattedFullPhoneNumber }</strong> ne pumbyry guerujeyha.
settings-recovery-phone-remove-recommend = Roñemoñe’ẽ ndéve ereko tapia hag̃ua ko ayvu ndahasyive rupi iñeñongatu ayvu ñemoneĩrã jeykekoha.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Emboguérõ, eñangareko ereko gueteriha ñongatuhápe umi ayvu ñemoneĩrã jeykekoha. <linkExternal>Emoñondive umi jegueru jeyha</linkExternal>
settings-recovery-phone-remove-button = Embogue pumbyry papapy
settings-recovery-phone-remove-cancel = Heja
settings-recovery-phone-remove-success = Pumbyry guerujeyrã mboguepyre

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Embojuaju pumbyry guerujeyrã
page-change-recovery-phone = Emoambue pumbyry guerujeyrã
page-setup-recovery-phone-back-button-title = Eguevi ñembohekópe
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Emoambue pumbyry papapy

## Add secondary email page

add-secondary-email-step-1 = Ku’e 1 2-gui
add-secondary-email-error-2 = Oiko apañuái emoheñóivo ko ñanduti veve
add-secondary-email-page-title =
    .title = Ñanduti veve mokõiháva
add-secondary-email-enter-address =
    .label = Ehai ñanduti veve kundaharape
add-secondary-email-cancel-button = Heja
add-secondary-email-save-button = Ñongatu
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Ñanduti veve rovamo’ãha ndojeporukuaái ñanduti veve mbohapyhárõ

## Verify secondary email page

add-secondary-email-step-2 = Ku’e 2 2-gui
verify-secondary-email-page-title =
    .title = Ñanduti veve mokõiháva
verify-secondary-email-verification-code-2 =
    .label = Emoinge nde ayvu jehechajeyrã
verify-secondary-email-cancel-button = Heja
verify-secondary-email-verify-button-2 = Moneĩ
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Ikatúpa ehai 5 aravo’i mboyve pe ayvu ñemoneĩrã emondóva <strong>{ $email }</strong>-pe.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } ojuajúma hekoitépe
verify-secondary-email-resend-code-button = Emondojey ayvu ñemoneĩrã

##

# Link to delete account on main Settings page
delete-account-link = Emboguete mba’ete
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Emoñepyrũ porã tembiapo. Nde { -product-mozilla-account } ha ne mba’ekuaarã oĩta hendyhápe.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Eikuaa moõpa ivaikuaa ne marandu ñemiguáva ha ehechameme
# Links out to the Monitor site
product-promo-monitor-cta = Emoha’ãnga reiete

## Profile section

profile-heading = Mba’ete
profile-picture =
    .header = Ta’ãnga
profile-display-name =
    .header = Téra ehechauka hag̃ua
profile-primary-email =
    .header = Ñandutiveve mba’eguasuvéva

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Ambohasa { $currentStep } { $numberOfSteps } mba’e.

## Security section of Setting

security-heading = Tekorosã
security-password =
    .header = Ñe’ẽñemi
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Heñoipyre { $date }
security-not-set = Heko’ỹva
security-action-create = Moheñói
security-set-password = Emoĩ ñe’ẽñemi embojuehe hag̃ua ha eiporu peteĩva mba’ete rekorosã rembiapoite.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Ejecha mba’ete rembiapo ramoguavéva
signout-sync-header = Jeikerã opámava
signout-sync-session-expired = Oĩ ndoikoporãiva. Emboty tembiapo kundahára poravorãme ha ag̃amieve eha’ã jey.

## SubRow component

tfa-row-backup-codes-title = Ayvu ñemoneĩrã jeykekoha
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Ndaipóri mba’eñemi porupyrã
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } ayvu hembýva
       *[other] { $numCodesAvailable } ayvu hembýva
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Emoheñói ayvukuéra pyahu
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Mbojuaju
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Kóicha añoite erujeýta tekorosãme ndereiporukuaáiramo ne pumbyry mba’e’oka térã tembiporu’i ñemoneĩrã.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Pumbyry guerujeyrã
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Ndojehaíri pumbyry papapy
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Moambue
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Mbojuaju
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Mboguete
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Embogue pumbyry guerujeyrã
tfa-row-backup-phone-delete-restriction-v2 = Embogueséramo ne pumbyry guerujeyharã, emoĩraẽ umi ayvu ñemoneĩrã jeykekoha térã embogue ñemoneĩrã mokõi jeku’eguáva emboykekuaa hag̃ua ne mba’ete jejoko.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Kóicha añoite erujeýta tekorosãme ndereiporukuaáirõ pumbyry mba’e’oka térã tembiporu’i ñemoneĩrã.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Maranduve SIM ñemoambue rehegua

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Pe’aite
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Myandy
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Ohohína…
switch-is-on = Myandypyre
switch-is-off = Mboguepyre

## Sub-section row Defaults

row-defaults-action-add = Mbojuaju
row-defaults-action-change = Moambue
row-defaults-action-disable = Pe’a
row-defaults-status = Avave

## Account recovery key sub-section on main Settings page

rk-header-1 = Mba’ete jeguerujey
rk-enabled = Myandypyre
rk-not-set = Noñembohekóiva
rk-action-create = Moheñói
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Moambue
rk-action-remove = Mboguete
rk-key-removed-2 = Oguéma ayvu jeguerujeyrã mba’ete
rk-cannot-remove-key = Ndaikatúi oñembogue mba’eñemi jeguerujeyrã ne mba’etégui.
rk-refresh-key-1 = Embohekopyahu mba’eñemi jeguerujeyrã
rk-content-explain = Emboguevijey ne marandu nderesaráirõ ne ñe’ẽñemígui.
rk-cannot-verify-session-4 = Rombyasy, oiko apañuái guasu emoneĩjeývo tembiapo
rk-remove-modal-heading-1 = Embogue mba’ete mba’eñemi jeguerujeyrã
rk-remove-modal-content-1 =
    Emoĩporãsejeýramo ne ñe’ẽñemi, ndaikatumo’ãi
    eiporu mba’eñemi jeguerujeyrã eike hag̃ua mba’ekuaarãme. Ndaikatúi embojevyjey ko jeku’e.
rk-remove-error-2 = Noñemboguekuaái mba’eñemi jeguerujeyrã ne mba’etégui
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Embogue mba’ete mba’eñemi guerujeyrã

## Secondary email sub-section on main Settings page

se-heading = Ñanduti veve mokõiháva
    .header = Ñanduti veve mokõiháva
se-cannot-refresh-email = Ore ñyrõ oĩ apañuái hekopyahúvo pe ñanduti veve.
se-cannot-resend-code-3 = Ore ñyrõ, oiko apañuái emondojeykuévo ayvu jehechajeyrã
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } ha’e ñanduti veve eiporuvéva
se-set-primary-error-2 = Ore ñyrõ, oĩ apañuái emoambuévo ñanduti veve eiporuvéva
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } oñembogue hekopete
se-delete-email-error-2 = Ore ñyrõ, oĩ apañuái emboguévo ko ñanduti veve
se-verify-session-3 = Tekotevẽ emoneĩjey ne rembiapo ag̃agua ejapo mboyve ko jeku’e
se-verify-session-error-3 = Rombyasy, oiko apañuái guasu emoneĩjeývo tembiapo
# Button to remove the secondary email
se-remove-email =
    .title = Embogue ñanduti veve
# Button to refresh secondary email status
se-refresh-email =
    .title = Embohekopyahu ñanduti veve
se-unverified-2 = ñemoneĩ’ỹva
se-resend-code-2 =
    Tekotevẽ ñemoneĩ. <button>Emondojey ayvu ñemoneĩrã</button>
    ndaipórirõ ñe’ẽmondo g̃uahẽha térã spam ñongatuhápe.
# Button to make secondary email the primary
se-make-primary = Ejapo peteĩháramo
se-default-content = Eike ne mba’etépe ndaikatúirõ emoñepyrũ tembiapo ñanduti vevépe.
se-content-note-1 =
    Jehaipy: ñanduti veve mokõiháva nomoĩporãmo’ãi ne marandu —
    ejapo hag̃ua eikotevẽta <a>mba’eñemi guerujeyrã</a>.
# Default value for the secondary email
se-secondary-email-none = Avave

## Two Step Auth sub-section on Settings main page

tfa-row-header = Ñemoneĩ mokõi jeku’épe
tfa-row-enabled = Myandypyre
tfa-row-disabled-status = Pe’apyre
tfa-row-action-add = Mbojuaju
tfa-row-action-disable = Pe’a
tfa-row-action-change = Moambue
tfa-row-button-refresh =
    .title = Embopyahu ñemoneĩ mokõi jeku’egua
tfa-row-cannot-refresh =
    Rombyasy, oiko apañuái embopyahúvo ñemoneĩ
    mokõi jeku’egua.
tfa-row-enabled-description = Ne mba’ete oñemo’ã hechajeyha mokõi jeku’eguáva rupive. Tekotevẽta emoinge peteĩ ayvu eiporútava ha’eñomi eikévo { -product-mozilla-account } rembiporu’i ñemoneĩrãme.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Mba’éicha omo’ãta ne mba’ete
tfa-row-disabled-description-v2 = Eipytyvõ emo’ã hag̃ua ne mba’ete eiporúvo tembiporu’i ñemoneĩrã mbohapyháva mokõiha jeku’egua eike hag̃ua.
tfa-row-cannot-verify-session-4 = Rombyasy, oiko apañuái guasu emoneĩjeývo tembiapo
tfa-row-disable-modal-heading = ¿Eipe’a ñemoneĩ mokõi jeku’egua?
tfa-row-disable-modal-confirm = Pe’a
tfa-row-disable-modal-explain-1 =
    Nerembojevymo’ãi ko tembiapo. Nde avei
    eguereko poravopyrã <linkExternal>emyengovia nde ayvu guerujeyrã jeykekoguáva </linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Ojepe’áma ñemoneĩ mokõi jeku’egua
tfa-row-cannot-disable-2 = Ñemoneĩrigui mokõi jeku’egua ndaikatúi eipe’a
tfa-row-verify-session-info = Tekotevẽ emoneĩ ne rembiapo ag̃agua emboheko hag̃ua ñemoneĩ mokõi jeku’egua

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Eku’ejeývo, emoneĩ:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Mba’epytyvõrã ñemboguata</mozSubscriptionTosLink> ha <mozSubscriptionPrivacyLink>Marandu’i ñemigua</mozSubscriptionPrivacyLink> { -brand-mozilla } mba’eporurã mboheraguapyrã
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Mba’eporurã Ñemboguata</mozillaAccountsTos> ha <mozillaAccountsPrivacy>Marandu’i ñemigua</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Eku’ejeývo, emoneĩ umi <mozillaAccountsTos>Mba’eporurã Ñemboguata</mozillaAccountsTos> ha <mozillaAccountsPrivacy>Marandu ñemigua</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Térã
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Eike ñepyrũ kóvandi
continue-with-google-button = Eku’ejey { -brand-google } ndive
continue-with-apple-button = Eku’ejey { -brand-apple } ndive

## Auth-server based errors that originate from backend service

auth-error-102 = Mba’ete ojeikuaa’ỹva
auth-error-103 = Ñe’ẽñemi oiko’ỹva
auth-error-105-2 = Ayvu ñemoneĩrã oiko’ỹva
auth-error-110 = Token oiko’ỹva
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Eiporuse heta jeýma. Ikatúpiko eha’ã jey ag̃amieve.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Eiporuse heta jeýma. Eha’ã jey { $retryAfter }-pe.
auth-error-125 = Ojejokóma ko mba’ejerure tekorosãrãve
auth-error-129-2 = Ehaíma peteĩ pumbyry papapy ndovaléiva. Ehechajey ha eha’ã ag̃amie.
auth-error-138-2 = Tembiapo oñemoneĩ’ỹva
auth-error-139 = Pe ñanduti veve mokõiháva iñambueva’erã ñanduti veve ne mba’ete reheguávagui
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Ko ñanduti vevére oñembojárama ambue mba’ete. Eha’ã jey ag̃ave térã eiporu ambue ñandti veve.
auth-error-155 = Token TOTP ojejuhu’ỹva
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Ndojejuhúi ayvu ñemoneĩrã jeykekoha
auth-error-159 = Mba’eñemi jeguerujeyrã ndoikóiva
auth-error-183-2 = Ayvu jehechajeyrã ndoikói térã hekoru’ãmava
auth-error-202 = Tembiapoite ijuruja’ỹva
auth-error-203 = Apopyvusu ndoikói, eha’ã jey ag̃ave
auth-error-206 = Neremoheñoikuaái ñe’ẽñemi, pe ñe’ẽñemi ipyendáma
auth-error-214 = Pe pumbyry papapy guerujeyrã oĩmavoi
auth-error-215 = Pumbyry papapy guerujeyrã noĩri gueteri
auth-error-216 = Ehupytýma hu’ã ñe’ẽmondorã
auth-error-218 = Ndaikatúi embogue pumbyry guerujeyha, ndorekói ayvukuéra ñemoneĩha.
auth-error-219 = Ko pumbyry papapy ojeporu hetaiterei mba’etépe. Eha’ã ambue papapýpe.
auth-error-999 = Jejavy eha’ãrõ’ỹva
auth-error-1001 = Ojejokóma tembiapo ñepyrũ
auth-error-1002 = Hu’ãma tembiapo. Eñepyrũjey emba’apo hag̃ua.
auth-error-1003 = Ñeñongatu pypegua térã umi kookie noñembojurujái gueteri
auth-error-1008 = Ñe’ẽñemi pyahu iñambueva’erã
auth-error-1010 = Eikotevẽ ñe’ẽñemi oikóva
auth-error-1011 = Eikotevẽ ñanduti veve oikóva
auth-error-1018 = Ne ñanduti veve ñemoneĩrã oujey. ¿Ikatu ehaivai kundaharape?
auth-error-1020 = ¿Ñanduti veve ehaivai? firefox.com ndaha’éi ñanduti veve oikóva
auth-error-1031 = Emoinge nde arytee eñemboheraguapývo
auth-error-1032 = Emoinge nde arytee eñemboheraguapývo
auth-error-1054 = Pe ayvu ñemoneĩ mokõi jeku’épe ndoikói
auth-error-1056 = Pe ayvu ñemoneĩrã jeykekoha ndoikói
auth-error-1062 = Ñemondojey ndoikói
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = ¿Ñanduti veve ojehaivai? { $domain } nome’ẽi ñanduti veve oikóva
auth-error-1066 = Ndojeporukuaái ñanduti veve rovamo’ãha mba’ete moheñoirã.
auth-error-1067 = ¿Ñanduti veve ojehaivai?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Papapy opáva { $lastFourPhoneNumber }-pe
oauth-error-1000 = Oĩ ndoikóiva. Emboty ko tendayke ha eha’ã jey.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Emoñepyrũ tembiapo { -brand-firefox }-pe
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Ñanduti veve moneĩmbyre
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Tembiapo ñepyrũ moneĩmbyre
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Eñepyrũ tembiapo { -brand-firefox }-pe embohekopa hag̃ua
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Eñepyrũ tembiapo
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = ¿Embohetave mba’e’oka? Emoñepyrũ tembiapo { -brand-firefox }-pe ambue mba’e’okápe emohendapa hag̃ua
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Emoñepyrũ tembiapo { -brand-firefox }-pe ambue mba’e’okápe embohekopa hag̃ua
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = ¿Erekose tendayke, techaukaha ha ñe’ẽñemi ambue mba’e’okápe?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Embojuaju ambue mba’e’oka
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ani ko’ág̃a
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Emoñepyrũ tembiapo { -brand-firefox }-pe Android peg̃uarã embohekopa hag̃ua
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Emoñepyrũ tembiapo { -brand-firefox }-pe iOS peg̃uarã embohekopa hag̃ua

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Eikotevẽ ñembyaty pepeguáva ha kookie
cookies-disabled-enable-prompt-2 = Emyandy umi kookie ha ñembyatyha pypegua ne kundahárape eikekuaa hag̃ua { -product-mozilla-account }-pe. Ejapóramo péicha, hendýta tembiapoite nemomandu’átava ne rembiapo pa’ũme.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Eha’ã jey
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Kuaave

## Index / home page

index-header = Emoinge ne ñanduti veve
index-sync-header = Eku’e jey nde { -product-mozilla-account } ndive
index-sync-subheader = Embojuehe ñe’ẽñemi, tendayke ha techaukaha tenda eiporuhápe { -brand-firefox }.
index-relay-header = Emoheñói ñanduti veve rovamo’ãha
index-relay-subheader = Ikatúpa, eme’ẽ ne ñanditi veve réra emondojeyseha ne ñanditi veve hovañemo’ãva guive.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Eku’ejey { $serviceName } ndive
index-subheader-default = Eku’ejey mba’ete mbohekopyahúpe
index-cta = Emoinge térã eñemboheraguapy
index-account-info = Peteĩ { -product-mozilla-account } ombojurujakuaa heta apopyrépe jeike { -brand-mozilla } ñemigua omo’ãvape.
index-email-input =
    .label = Emoinge ne ñanduti veve
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Mba’ete oñembogue apañuai’ỹre
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Ne ñanduti veve ñemoneĩrã ojevyjeýma. ¿Ikatu ehaivai kundaharape?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = ¡Ajépa! Ndaikatúi romoheñói ne mba’ete jeguerujeyrã. Eha’ã jey ag̃amieve.
inline-recovery-key-setup-recovery-created = Oñemoheñói mba’eñemi jeguerujeyrã
inline-recovery-key-setup-download-header = Embojuaju ne mba’ete
inline-recovery-key-setup-download-subheader = Emboguejy ha eñongatu
inline-recovery-key-setup-download-info = Eñongatu ko mba’eñemi tenda nemandu’a hag̃uáme; ndaikatumo’ãi eike jey kóvape tenondeve.
inline-recovery-key-setup-hint-header = Ñemoñe’ẽ tekorosãrã

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Eheja ñemboheko
inline-totp-setup-continue-button = Ku’ejey
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Embojuaju tekorosãve ne mba’etépe ejerurevévo ayvu ñemoneĩrã peteĩva <authenticationAppsLink>ko’ã tembiporu’i ñemoneĩrãvape</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Embojuruja ñemoneĩrã mokõi jeku’épe <span>eku’e hag̃ua mba’ete ñembohekópe</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Embojuruja ñemoneĩrã mokõi jeku’épe <span>eku’e hag̃ua { $serviceName }</span>
inline-totp-setup-ready-button = Oĩma
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Emoha’ãnga ayvu ñemoneĩrã <span>eku’e hag̃ua { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Ehai ayvu nde pópe <span>eku’ejey hag̃ua { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Emoha’ãnga ayvu ñemoneĩrã jeykekoha <span>eku’e hag̃ua mba’ete ñemboheko</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Ehai ayvu nde pópe <span>eku’e hag̃ua mba’ete ñembohekópe</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Emoinge mba’e ñemi ñemoneĩrã rembiporu’ípe. <toggleToQRButton>¿ Emoha’ãnga QR ayvu hekovia?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Emoha’ãnga QR ayvu ñemoneĩrã rembiporu’ípe ha upéi emoinge pe ayvu me’ẽmbyre. <toggleToManualModeButton>¿Ndaikatúi oñemoha’ãnga pe ayvu?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Emoĩmba vove, oñepyrũta omoheñóifta ayvu rekorosãrã eikekuaa hag̃ua.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Ayvu ñemoneĩgua
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Ayvu ñemoneĩgua jerurepyre
tfa-qr-code-alt = Eiporu { $code } ayvu emboheko hag̃ua ñemoneĩ mokõi jeku’épe tembiporu’i moneĩmbyre.
inline-totp-setup-page-title = Ñemoneĩ mokõi jeku’épe

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Añetegua
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Mba’epytyvõrã ñemboguata
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Marandu’i ñemiguáva

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Marandu’i ñemiguáva

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Mba’epytyvõrã ñemboguata

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = ¿Eikeramoite { -product-firefox } ndive?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Héẽ, emboaje mba’e’oka
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Nandéiramo, <link>emoambue ne ñe’ẽñemi</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Mba’e’oka oikepyréva
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Embojuehehína: { $deviceFamily } ndive { $deviceOS } rupi
pair-auth-complete-sync-benefits-text = Eikekuaáma ne rendayke ijurujáva, ñe’ẽñemi ha techaukaha opavave ne mba’e’okápe.
pair-auth-complete-see-tabs-button = Ehecha mba’e’oka mbojuehepyréva rendayke
pair-auth-complete-manage-devices-link = Eñangareko mba’e’okáre

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Emoinge ayvu guerujeyrã <span>eku’e hag̃ua mba’ete ñembohekópe</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Ehai ayvu ñemoneĩgua jeykekoha <span>eku’e hag̃ua ndive { $serviceName }</span>
auth-totp-instruction = Embojuruja ne rembiporu’i ñemoneĩgua ha emoinge ayvu ñemoneĩgua eipotáva.
auth-totp-input-label = Emoinge ayvu 6 taíva
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Moneĩ
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Ayvu ñemoneĩgua jerurepyre

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Oñemoneĩva’erã <span>pe ambue mba’e’oka guive</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Ñemoñondive oiko’ỹva
pair-failure-message = Opáma pe ñemboheko rape.

## Pair index page

pair-sync-header = Embojuehe { -brand-firefox } pumbyry térã tablétape
pair-cad-header = Eiporu { -brand-firefox } ambue mba’e’okápe
pair-already-have-firefox-paragraph = Erekóma { -brand-firefox } ne pumbyry térã tablétape
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Embojuehe ne mba’e’oka
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Térã emboguejy
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Emoha’ãnga emboguejy hag̃ua { -brand-firefox } pumbyrýpe g̃uarã térã emondo <linkExternal>mboguejy juajuha</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ani ko’ág̃a
pair-take-your-data-message = Egueraha ne rendayke, techaukaha ha ñe’ẽñemi eiporuhápe { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Eñepyrũ
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR ayvu

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Mba’e’oka oikepyréva
pair-success-message-2 = Embojuehe hekoitépe.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Emoneĩ moñondive <span> { $email }</span> peg̃uarã
pair-supp-allow-confirm-button = Emoneĩ ñemoñondive
pair-supp-allow-cancel-link = Heja

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Oñemoneĩva’erã <span>pe ambue mba’e’oka guive</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Eike eiporúvo tembiporu’i
pair-unsupported-message = ¿Eiporu apopyvusu ra’ãnganohẽha? Eikeva’erã { -brand-firefox } rembiporu’i rupive.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Emoheñói ñe’ẽñemi embojuehe hag̃ua
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Kóva ombopapapy ne mba’ekuaarã. Iñambueva’erã ne ñe’ẽñemi { -brand-google } térã { -brand-apple } mba’etepeguágui.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Eha’ãrõmína, ejeguerahajeyhína tembiporu’i oñemoneĩmbyrévape.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Ehai mba’ete mba’eñemi jeguerujeyrã
account-recovery-confirm-key-instruction = Ko ñemigua orujey ne mba’ekuaarã kundahára ipapapýva, ha’éva ñe’ẽñemi ha techaukaha, { -brand-firefox } apopyvusu guive.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Ehai mba’ete mba’eñemi guerujeyrã orekóva 32 tai
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Ne ñe’ẽ ñembyatyrã ha’e:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Ku’ejey
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = ¿Nderejuhukuaái ne mba’ete jeguerujeyrã?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Emoheñói ñe’ẽñemi pyahu
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Ñe’ẽñemi moĩmbyre
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Rombyasy, oiko apañuái emoĩnguévo ne ñe’ẽñemi
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Eiporu mba’eñemi jeguerujeyrã
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Ojeguerujeýma ne ñe’ẽñemi.
reset-password-complete-banner-message = Ani nderesarái emoheñóivo mba’eñemi pyahu mba’ete guerujeyrã { -product-mozilla-account } ñemboheko guive ani hag̃ua iñapañuái nde jeike.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } orahaukajeýta ndéve eiporu hag̃ua ñanduti veve rovamo’ãha eike rire ñandutípe.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Ehai ayvu orekóva 10 tai
confirm-backup-code-reset-password-confirm-button = Moneĩ
confirm-backup-code-reset-password-subheader = Emoinge ayvu ñemoneĩrã jeykekoha
confirm-backup-code-reset-password-instruction = Ehai peteĩva ayvueta ojeporu ha’eñóva eñongatúva embohekóvo ñemoneĩ mokõi jeku’eguáva.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = ¿Rejehejáma okápe?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Ehechajey ne ñanduti veve
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Romondo ayvu ñemoneĩrã <span>{ $email }</span>-pe.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Ehai 8 tai ayvu 10 aravo’i oútavape
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Eku’ejey
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Emondojey ayvu
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Eiporu ambuéva mba’ete

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Embojevyjey ne ñe’ẽñemi
confirm-totp-reset-password-subheader-v2 = Ehai mba’eñemi ñemoneĩrã mokõi jeku’épe
confirm-totp-reset-password-instruction-v2 = Ehechajey ne <strong>rembiporu’i ñemoneĩrã</strong> erujey hag̃ua ne ñe’ẽñemi.
confirm-totp-reset-password-trouble-code = ¿Apañuái emoinge hag̃ua ayvu?
confirm-totp-reset-password-confirm-button = Moneĩ
confirm-totp-reset-password-input-label-v2 = Emoinge mba’eñemi 6 taíva
confirm-totp-reset-password-use-different-account = Eiporu ambuéva mba’ete

## ResetPassword start page

password-reset-flow-heading = Embojevyjey ne ñe’ẽñemi
password-reset-body-2 =
    Rojerure ndéve ndahetái ndénte reikuaáva ereko hag̃ua ne mba’ete
    tekorosãpe.
password-reset-email-input =
    .label = Ehai ne ñandutiveve
password-reset-submit-button-2 = Ku’ejey

## ResetPasswordConfirmed

reset-password-complete-header = Oikojeýma ne ñe’ẽñemi
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Eku’ejey { $serviceName } ndive

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Embojevyjey ne ñe’ẽñemi
password-reset-recovery-method-subheader = Eiporavo mba’éichapa erujeýta
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Eñeha’ãke ndete eiporu mba’éichapa erujeýta eipotáva.
password-reset-recovery-method-phone = Pumbyry guerujeyrã
password-reset-recovery-method-code = Ayvu ñemoneĩrã jeykekoha
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } ayvu hembýva
       *[other] { $numBackupCodes } ayvukuéra hembýva
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Oiko apañuái emondóvo pe ayvu ne pumbyry jeguerujeyrãme
password-reset-recovery-method-send-code-error-description = Eha’ã jey ag̃amieve térã eiporu nde ñemoneĩrã jeykekoha ayvu.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Embojevyjey ne ñe’ẽñemi
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Emoinge ayvu guerujeyrã
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Oñemondóma ayvu 6 taíva pumbyry papapy oñemohu’ãva <span>{ $lastFourPhoneDigits }</span>-pe ñe’ẽmondo jehaipyrépe. Ko ayvu hu’ãta 5 aravo’ípe. Ani emoherakuã ko ayvu avave ndive.
reset-password-recovery-phone-input-label = Emoinge ayvu 6 taíva
reset-password-recovery-phone-code-submit-button = Moneĩ
reset-password-recovery-phone-resend-code-button = Emondojey ayvu
reset-password-recovery-phone-resend-success = Ayvu mondopyre
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = ¿Rejehejáma okápe?
reset-password-recovery-phone-send-code-error-heading = Oiko apañuái emondokuévo pe ayvu
reset-password-recovery-phone-code-verification-error-heading = Oiko peteĩ apañuái ehechajeývo ayvu
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Eha’ã jey ag̃amieve.
reset-password-recovery-phone-invalid-code-error-description = Pe ayvu naiporãi térã ndoikovéima.
reset-password-recovery-phone-invalid-code-error-link = ¿Eiporu ayvu ñemoneĩrã jeykekoha hendaguépe?
reset-password-with-recovery-key-verified-page-title = Ñe’ẽñemi jeguerujeypyre
reset-password-complete-new-password-saved = ¡Ñe’ẽñemi pyahu ñongatupyre!
reset-password-complete-recovery-key-created = Mba’ete mba’eñemi guerujeyrã moheñoimbyre. Emboguejy ha eñongatu.
reset-password-complete-recovery-key-download-info =
    Ko mba’eñemi tuichamba’e ojeguerujey
    hag̃ua mba’ekuaarãita nde resaráirõ ñe’ẽñemígui. <b>Emboguejy ha eñongatu tekorosãme
    ko’ag̃a, ndaikatumo’ãigui ejevy ko kuatiaroguépe uperire.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Javy:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Amoneĩ tembiapo ñepyrũ…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Ñemoneĩha jejavy
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Juajuha ñemoneĩha ndoikovéima
signin-link-expired-message-2 = Pe juajuha eikutuva’ekue ndoikovéima térã ojeporúma.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Ehai ñe’ẽñemi <span>ne { -product-mozilla-account }</span> peg̃uarã
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Eku’ejey { $serviceName }
signin-subheader-without-logo-default = Eku’ejey mba’ete mbohekopyahúpe
signin-button = Eñemboheraguapy
signin-header = Eñemboheraguapy
signin-use-a-different-account-link = Eiporu ambuéva mba’ete
signin-forgot-password-link = ¿Nderesaráipa ñe’ẽñemígui?
signin-password-button-label = Ñe’ẽñemi
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } orahaukajeýta eimehápe eiporu hag̃ua ñanduti veve rovamo’ãha eñepyrũ rire tembiapo.
signin-code-expired-error = Ayvu hu’ãmava. Emoñepyrũjey tembiapo.
signin-account-locked-banner-heading = Eguerujey ne ñe’ẽñemi
signin-account-locked-banner-description = Rojoko ne mba’ete ani hag̃ua oiko hese mba’e ivaíva.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Erujey ne ñe’ẽñemi eike hag̃ua

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Pe juajuha eiporavóva ndorekopái tai ha ikatu ne ñanduti veve poruhára ombyai. Emonguatia pe kundaharape mbeguemi ha eha’ã jey uperire.
report-signin-header = ¿Emomarandu jeike ñemoneĩ’ỹva?
report-signin-body = Og̃uahẽ ndéve ñanduti veve peteĩ jeikese ne mba’etépe rehegua. ¿Emombe’usépa ko tembiapo ivaikuaávaramo?
report-signin-submit-button = Emomarandu tembiaporã
report-signin-support-link = ¿Mba’ére oiko ko’ãva?
report-signin-error = Rombyasy, oiko apañuái emondóvo ne rembiapo.
signin-bounced-header = Rombyasy. Rojokóma ne mba’ete.
# $email (string) - The user's email.
signin-bounced-message = Ko ñanduti veve ñemoneĩgua romondóva { $email }-pe nog̃uahẽi ha rojokóma mba’ete romo’ã hag̃ua mba’ekuaarã { -brand-firefox } pegua.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Kóva ha’erõ ñanduti veve oikóva, <linkExternal>emombe’u oréve</linkExternal> ha roipytyvõta erekojey hag̃ua ne mba’ete.
signin-bounced-create-new-account = ¿Ndereguerkovéima ñanduti veve? Emoheñói ipyahúva
back = Tapykue

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Ehechajey ko tembiapo ñepyrũ <span>eku’ejey hag̃ua mba’ete ñemboheko ndive</span>
signin-push-code-heading-w-custom-service = Ehechajey ko tembiapo ñepyrũ <span>eku’ejey { $serviceName } ndive</span>
signin-push-code-instruction = Ehechajey ambue mba’e’oka ha emoneĩ ko tembiapo ñepyrũ ne kundahára { -brand-firefox } guive.
signin-push-code-did-not-recieve = ¿Nog̃uahẽipiko ndéve marandu’i?
signin-push-code-send-email-link = Ñanduti veve ayvu

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Emoneĩ ne rembiapo ñepyrũ
signin-push-code-confirm-description = Rohechakuaa omoñepyrũséva tembiapo ko mba’e’oka guive. Ndetéramo, emoneĩntema upéichamo
signin-push-code-confirm-verifying = Jehechajey
signin-push-code-confirm-login = Emoneĩ tembiapo ñepyrũ
signin-push-code-confirm-wasnt-me = Kóva ndachéi, emoambue ñe’ẽñemi.
signin-push-code-confirm-login-approved = Oñemoneĩma ne rembiapo ñepyrũ. Embotykuaáma ko ovetã.
signin-push-code-confirm-link-error = Pe juajuha imarã. Eha’ã jey ag̃ave.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Eñemboheraguapy
signin-recovery-method-subheader = Eiporavo mba’éichapa erujeýta
signin-recovery-method-details = Eñeha’ãke ndete eiporu mba’éichapa erujeýta eipotáva.
signin-recovery-method-phone = Pumbyry guerujeyrã
signin-recovery-method-code-v2 = Ayvu ñemoneĩrã jeykekoha
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } ayvu hembýva
       *[other] { $numBackupCodes } ayvu hembýva
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Oiko apañuái emondóvo pe ayvu ne pumbyry jeguerujeyrãme
signin-recovery-method-send-code-error-description = Eha’ã jey ag̃amieva térã eiporu nde ñemoneĩrã jeykekoha ayvu.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Eñepyrũ tembiapo
signin-recovery-code-sub-heading = Emoinge ayvu ñemoneĩrã jeykekoha
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Ehai peteĩva ayvueta ojeporu ha’eñóva eñongatúva embohekóvo ñemoneĩ mokõi jeku’eguáva.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Ehai ayvu orekóva 10 tai
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Moneĩ
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Eiporu pumbyry guerujeyrã
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = ¿Rejejokóma?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Ayvu ñemoneĩrã jeykekoha jerurepyre
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Oiko apañuái emondóvo pe ayvu ne pumbyry jeguerujeyrãme
signin-recovery-code-use-phone-failure-description = Eha’ã jey ag̃amieve.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Eñemboheraguapy
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Emoinge ayvu jeguerujeyrã
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Oñemondóma ayvu 6 taíva pumbyry papapy oñemohu’ãva <span>{ $lastFourPhoneDigits }</span>-pe ñe’ẽmondo jehaipyrépe. Ko ayvu hu’ãta 5 aravo’ípe. Ani emoherakuã ko ayvu avave ndive.
signin-recovery-phone-input-label = Emoinge ayvu 6 taíva
signin-recovery-phone-code-submit-button = Moneĩ
signin-recovery-phone-resend-code-button = Emondojey ayvu
signin-recovery-phone-resend-success = Ayvu mondopyre
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = ¿Nderejáma okápe?
signin-recovery-phone-send-code-error-heading = Oiko peteĩ apañuái emondóvo pe ayvu
signin-recovery-phone-code-verification-error-heading = Oiko peteĩ apañuái ehechajeývo ayvu.
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Eha’ã jey ag̃amieve.
signin-recovery-phone-invalid-code-error-description = Pe ayvu naiporãi térã ndoikovéima
signin-recovery-phone-invalid-code-error-link = ¿Eiporu ayvu ñemoneĩrã jeykekoha hendaguépe?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Eike porãiterei. Ikatu ojeporu hu’ã meve eipuru jeýramo ne pumbyry guerujeyrã.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Aguyje ne ñangareko rehe
signin-reported-message = Ore aty oñemomarandu. Marandu’i kóva rehegua ore pytyvõ roñemo’ã hag̃ua iñañávagui.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Emoinge ayvu ñemoneĩrã<span> ne { -product-mozilla-account }</span> peg̃uarã
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Ehai ayvu jehechajeyrã 5 aravo’i oútavape oñemondóva <email>{ $email }</email>.
signin-token-code-input-label-v2 = Emoinge ayvu 6 taíva
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Moneĩ
signin-token-code-code-expired = ¿Ndoikovéima ayvu?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Emondo ayvu pyahu.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Ayvu ñemoneĩrã tekotevẽva
signin-token-code-resend-error = Oiko apañuái. Noñemondokuaái mba’eñemi ipyahúva.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } orahaukajeýta eimehápe eiporu hag̃ua ñanduti veve rovamo’ãha eñepyrũ rire tembiapo.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Eñemboheraguapy
signin-totp-code-subheader-v2 = Ehai mba’eñemi ñemoneĩrã mokõi jeku’épe
signin-totp-code-instruction-v4 = Ehechajey ne <strong>rembiporu’i ñemoneĩrã</strong> emoneĩ hag̃ua nde jeike.
signin-totp-code-input-label-v4 = Emoinge mba’eñemi 6 taíva
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = ¿Mba’érepa ojejerure ndéve ejekuaaukávo?
signin-totp-code-aal-banner-content = Embohekóma ñemoneĩ mokõi jeku’gua ne mba’etépe, hákatu na’írã gueteri eike pe ayvu ndive ko mba’e’okápe.
signin-totp-code-aal-sign-out = Emboty tembiapo ko mba’e’okápe
signin-totp-code-aal-sign-out-error = Ore ñyrõ, iñapañuái embotykuévo ne rembiapo
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Moneĩ
signin-totp-code-other-account-link = Eiporu ambuéva mba’ete
signin-totp-code-recovery-code-link = ¿Apañuái emoinge hag̃ua ayvu?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Ayvu ñemoneĩgua jerurepyre
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } orahaukajeýta eimehápe eiporu hag̃ua ñanduti veve rovamo’ãha eñepyrũ rire tembiapo.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Emoneĩ ko tembiapo ñepyrũ
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Ehechajey ne ñanduti veve ayvu ñemoneĩva emondopyre { $email }-pe.
signin-unblock-code-input = Emoinge ayvu ñemoneĩrã
signin-unblock-submit-button = Eku’ejey
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Ayvu ñemoneĩrã jerurepyre
signin-unblock-code-incorrect-length = Pe ayvu ñemoneĩrã orekova’erã michĩvérõ 8 tai
signin-unblock-code-incorrect-format-2 = Pe ayvu ñemoneĩrã orekova’erã tai ha/térã papapy
signin-unblock-resend-code-button = ¿Ndaipóri ñe’ẽmondo g̃uahẽhápe térã spam marandurendápe? Emondojey
signin-unblock-support-link = ¿Mba’ére oiko ko’ãva?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } orahaukajeýta eimehápe eiporu hag̃ua ñanduti veve rovamo’ãha eñepyrũ rire tembiapo.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Emoinge ayvu jehechajeyrã
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Emoinge ayvu ñemoneĩrã <span>ne { -product-mozilla-account }</span> peg̃uarã
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Ehai ayvu jehechajeyrã 5 aravo’i oútavape oñemondóva <email>{ $email }</email>.
confirm-signup-code-input-label = Emoinge ayvu 6 taíva
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Moneĩ
confirm-signup-code-sync-button = Eñepyrũ ñembojuehe
confirm-signup-code-code-expired = ¿Ayvu oiko’ỹva?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Emondo ayvu pyahu ñanduti vevépe.
confirm-signup-code-success-alert = Mba’ete oñemoneĩva apañuai’ỹre
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Ayvu ñemoneĩrã tekotevẽva
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } orahaukajeýta eimehápe eiporu hag̃ua ñanduti veve rovamo’ãha eñepyrũ rire tembiapo.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Emoheñói ñe’ẽñemi
signup-relay-info = Tekotevẽ ñe’ẽñemi eñangareko hag̃ua tekorosãme ñanduti veve hovamo’ãvare ha eike { -brand-mozilla } rembiporu hekorosãvape.
signup-sync-info = Embojuehe ñe’ẽñemi, techaukaha ha hetave oimeraẽ tenda eiporuhápe { -brand-firefox }.
signup-sync-info-with-payment = Embojuehe ñe’ẽñemi, jepagarã, techaukaha ha hetave oimeraẽ tenda eiporuhápe { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Emoambue  ñanduti veve

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Ñembojuehe hendyhína
signup-confirmed-sync-success-banner = { -product-mozilla-account } moneĩmbyre
signup-confirmed-sync-button = Eñepyrũ eikundaha
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Ñe ñe’ẽñemi, jepagarã, kundaharape, techaukaha, tembiasakue ha hetave embojuehekuaa oimeraẽ tenda eiporuhápe { -brand-firefox }.
signup-confirmed-sync-description-v2 = Ñe’ẽñemi, kundaharape, techaukaha, tembiasakue ha embojuehekuaa oimeraẽ tenda eiporuhápe { -brand-firefox }.
signup-confirmed-sync-add-device-link = Embojuaju ambue mba’e’oka
signup-confirmed-sync-manage-sync-button = Eñangareko ñembojuehére
signup-confirmed-sync-set-password-success-banner = Ñe’ẽñemi ñembojuehe moheñoipyre
