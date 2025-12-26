# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Der is in nije koade nei jo e-mailadres ferstjoerd.
resend-link-success-banner-heading = Der is in nije keppeling nei jo e-mailadres ferstjoerd.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Foegje { $accountsEmail } ta oan jo kontakten om in levering sûnder problemen te garandearjen.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Banner slute
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } wurdt op 1 novimber omneamd nei { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Jo melde noch hieltyd oan mei deselde brûkersnamme en itselde wachtwurd, en der binne gjin oare wizigingen yn de produkten dy’t jo brûke.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Wy hawwe { -product-firefox-accounts } omneamd nei { -product-mozilla-accounts }. Jo melde noch hieltyd oan mei deselde brûkersnamme en itselde wachtwurd, en der binne gjin oare wizigingen yn de produkten dy’t jo brûke.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Mear ynfo
# Alt text for close banner image
brand-close-banner =
    .alt = Banner slute
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m-logo

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Tebek
button-back-title = Tebek

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Downloade en trochgean
    .title = Downloade en trochgean
recovery-key-pdf-heading = Accountwerstelkaai
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Oanmakke: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Accountwerstelkaai
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Mei dizze kaai kinne jo jo fersifere browsergegevens (ynklusyf wachtwurden, blêdwizers en skiednis) weromhelje as jo jo wachtwurd ferjitte. Bewarje it op in plak dat jo ûnthâlde kinne.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Plakken om jo kaai te bewarjen
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Mear ynfo oer jo accountwerstelkaai
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Sorry, der is in probleem bard by it downloaden fan de accountwerstelkaai.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Mear fan { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Untfang ús lêste nijs en produktupdates
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Iere tagong om nije produkten te testen
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Aksjewarskôgingen om it ynternet werom te easken

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Download
datablock-copy =
    .message = Kopiearre
datablock-print =
    .message = Ofdrukt

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Koade kopiearre
       *[other] Koaden kopiearre
    }
datablock-download-success =
    { $count ->
        [one] Koade download
       *[other] Koaden download
    }
datablock-print-success =
    { $count ->
        [one] Koade ôfdrukt
       *[other] Koaden ôfdrukt
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Kopiearre

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (roeze)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (roeze)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (roeze)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (roeze)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Lokaasje ûnbekend
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } op { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-adres: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Wachtwurd
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Nochris it wachtwurd
form-password-with-inline-criteria-signup-submit-button = Account oanmeitsje
form-password-with-inline-criteria-reset-new-password =
    .label = Nij wachtwurd
form-password-with-inline-criteria-confirm-password =
    .label = Befêstigje wachtwurd
form-password-with-inline-criteria-reset-submit-button = Nij wachtwurd oanmeitsje
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Wachtwurd
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Nochris it wachtwurd
form-password-with-inline-criteria-set-password-submit-button = Begjin mei syngronisearjen
form-password-with-inline-criteria-match-error = Wachtwurden komme net oerien
form-password-with-inline-criteria-sr-too-short-message = Wachtwurd moat op syn minst 8 karakters befetsje.
form-password-with-inline-criteria-sr-not-email-message = Wachtwurd mei net jo e-mailadres befetsje.
form-password-with-inline-criteria-sr-not-common-message = Wachtwurd mei gjin faaks brûkt wachtwurd wêze.
form-password-with-inline-criteria-sr-requirements-met = It ynfierde wachtwurd foldocht oan alle wachtwurdfereasken.
form-password-with-inline-criteria-sr-passwords-match = Ynfierde wachtwurden komme oerien.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Dit fjild is ferplichte

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Fier in { $codeLength }-siferige koade yn om troch te gean
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Fier in koade fan { $codeLength } tekens yn om troch te gean

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox }-accountwerstelkaai
get-data-trio-title-backup-verification-codes = Reserve-autentikaasjekoaden
get-data-trio-download-2 =
    .title = Downloade
    .aria-label = Downloade
get-data-trio-copy-2 =
    .title = Kopiearje
    .aria-label = Kopiearje
get-data-trio-print-2 =
    .title = Ofdrukke
    .aria-label = Ofdrukke

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Warskôging
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Attinsje
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Warskôging
authenticator-app-aria-label =
    .aria-label = Authenticator-tapassing
backup-codes-icon-aria-label-v2 =
    .aria-label = Reserve-autentikaasjekoaden ynskeakele
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Reserve-autentikaasjekoaden útskeakele
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Werstel-sms ynskeakele
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Werstel-sms útskeakele
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadeeske flagge
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Finkje
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Slagge
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Ynskeakele
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Berjocht slute
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Koade
error-icon-aria-label =
    .aria-label = Flater
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Ynformaasje
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Amerikaanske flagge

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = In kompjûter en in mobile telefoan en op beide in ôfbylding fan in brutsen hert
hearts-verified-image-aria-label =
    .aria-label = In kompjûter en in mobile telefoan en in tablet mei op elk in ôfbylding fan in klopjend hert
signin-recovery-code-image-description =
    .aria-label = Dokumint dat ferburgen tekst befettet.
signin-totp-code-image-label =
    .aria-label = In apparaat mei in ferburgen 6-siferige koade.
confirm-signup-aria-label =
    .aria-label = In slúf mei in keppeling
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Yllustraasje om in accountwerstelkaai wer te jaan.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Yllustraasje om in accountwerstelkaai wer te jaan.
password-image-aria-label =
    .aria-label = In yllustraasje om it ynfieren fan in wachtwurd wer te jaan.
lightbulb-aria-label =
    .aria-label = Yllustraasje om it meitsjen fan in ûnthâldhint wer te jaan.
email-code-image-aria-label =
    .aria-label = Yllustraasje om in e-mailberjocht mei in koade wer te jaan.
recovery-phone-image-description =
    .aria-label = Mobyl apparaat dat in koade fia sms ûntfangt.
recovery-phone-code-image-description =
    .aria-label = Koade ûntfongen op in mobyl apparaat.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobyl apparaat mei sms-mooglikheden
backup-authentication-codes-image-aria-label =
    .aria-label = Apparaatskerm mei koaden
sync-clouds-image-aria-label =
    .aria-label = Wolken mei in syngronisaasjepiktogram
confetti-falling-image-aria-label =
    .aria-label = Animearre fallende konfetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Jo binne oanmeld by { -brand-firefox }.
inline-recovery-key-setup-create-header = Befeiligje jo account
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Hawwe jo in minút om jo gegevens te beskermjen?
inline-recovery-key-setup-info = Meitsje in accountwerstelkaai oan, sadat jo jo syngronisearre navigaasjegegevens weromsette kinne as jo jo wachtwurd ea ferjitte.
inline-recovery-key-setup-start-button = Accountwerstelkaai oanmeitsje
inline-recovery-key-setup-later-button = Letter

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Wachtwurd ferstopje
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Wachtwurd toane
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Jo wachtwurd is op dit stuit sichtber op it skerm.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Jo wachtwurd is op dit stuit ferburgen.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Jo wachtwurd is no sichtber op it skerm.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Jo wachtwurd is no ferburgen.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Lân selektearje
input-phone-number-enter-number = Fier telefoannûmer yn
input-phone-number-country-united-states = Ferienige Steaten
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Tebek

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Keppeling foar opnij ynstellen skansearre
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Befêstigingskeppeling skansearre
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Keppeling skansearre
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = De keppeling wêrop jo klikt hawwe miste tekens en is mooglik skansearre rekke troch jo e-mailclient. Kopiearje foarsichtich it adres en probearje it opnij.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Nije keppeling ûntfange

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Wachtwurd ûnthâlde?
# link navigates to the sign in page
remember-password-signin-link = Oanmelde

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primêr e-mailadres al befêstige
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Oanmelding is al befêstige
confirmation-link-reused-message = Dy befêstigingskeppeling is al brûkt en kin mar ien kear brûkt wurde.

## Locale Toggle Component

locale-toggle-select-label = Taal selektearje
locale-toggle-browser-default = Browserstandert
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Unjildige oanfraach

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Jo hawwe dit wachtwurd nedich om tagong te krijen ta alle fersifere gegevens dy’t jo by ús bewarje.
password-info-balloon-reset-risk-info = In nije inisjalisaasje betsjut mooglik ferlies fan gegevens, lykas wachtwurden en blêdwizers.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Kies in sterk wachtwurd dat jo net op oare websites brûkt hawwe. Soargje derfoar dat it foldocht oan de befeiligingseasken:
password-strength-short-instruction = Kies in sterk wachtwurd:
password-strength-inline-min-length = Op syn minst 8 karakters
password-strength-inline-not-email = Net jo e-mailadres
password-strength-inline-not-common = Net in faaks brûkt wachtwurd
password-strength-inline-confirmed-must-match = Befêstiging komt oerien mei it nije wachtwurd
password-strength-inline-passwords-match = Wachtwurden komme oerien

## Notification Promo Banner component

account-recovery-notification-cta = Oanmeitsje
account-recovery-notification-header-value = Ferlies jo gegevens net as jo jo wachtwurd ferjitte
account-recovery-notification-header-description = Meitsje in accountwerstelkaai oan, sadat jo jo syngronisearre navigaasjegegevens weromsette kinne as jo jo wachtwurd ea ferjitte.
recovery-phone-promo-cta = Wersteltelefoannûmer tafoegje
recovery-phone-promo-heading = Foegje ekstra beskerming ta oan jo account mei in wersteltelefoannûmer
recovery-phone-promo-description = Jo kinne jo no oanmelde mei in ienmalich wachtwurd fia sms as jo jo twa-staps-autentikaasje-app net brûke kinne.
recovery-phone-promo-info-link = Mear ynfo oer werstel en simswaprisiko
promo-banner-dismiss-button =
    .aria-label = Banner slute

## Ready component

ready-complete-set-up-instruction = Foltôgje de ynstallaasje troch it nije wachtwurd op jo oare { -brand-firefox }-apparaten yn te foljen.
manage-your-account-button = Jo account beheare
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Jo kinne { $serviceName } no brûke
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Jo binne no ree om accountynstellingen te brûken
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Jo account is ree!
ready-continue = Trochgean
sign-in-complete-header = Oanmelding befêstige
sign-up-complete-header = Account befêstige
primary-email-verified-header = Primêr e-mailadres befêstige

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Plakken om jo kaai te bewarjen:
flow-recovery-key-download-storage-ideas-folder-v2 = Map op befeilige apparaat
flow-recovery-key-download-storage-ideas-cloud = Fertroude cloudûnthâld
flow-recovery-key-download-storage-ideas-print-v2 = Ofdrukt fysyk eksimplaar
flow-recovery-key-download-storage-ideas-pwd-manager = Wachtwurdbehearder

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Foegje in hint ta om jo kaai te finen
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Dizze hint helpt jo te mei in omtinken wêr’t jo jo accountwerstelkaai bewarre hawwe. Wy kinne it jo toane as jo jo wachtwurd opnij ynstelle om jo gegevens te werstellen.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Fier in hint yn (opsjoneel)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Foltôgje
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = De hint moat minder as 255 tekens befetsje.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = De hint mei gjin ûnfeilige Unicode-tekens befetsje. Allinnich letters, sifers, leestekens en symboalen binne tastien.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Warskôging
password-reset-chevron-expanded = Warskôging ynklappe
password-reset-chevron-collapsed = Warskôging útklappe
password-reset-data-may-not-be-recovered = Jo browsergegevens wurde mooglik net wersteld
password-reset-previously-signed-in-device-2 = Hawwe jo in apparaat dêr’t jo earder oanmeld binne?
password-reset-data-may-be-saved-locally-2 = Jo browsergegevens binne mooglik op dat apparaat bewarre. Stel jo wachtwurd opnij yn en meld jo dêr oan om jo gegevens te werstellen en te syngronisearjen.
password-reset-no-old-device-2 = Hawwe jo in nij apparaat, mar hawwe jo gjin tagong ta ien fan jo foarige?
password-reset-encrypted-data-cannot-be-recovered-2 = It spyt ús, mar jo fersifere browsergegevens op { -brand-firefox }-servers kinne net weromhelle wurde.
password-reset-warning-have-key = Hawwe jo in accountwerstelkaai?
password-reset-warning-use-key-link = Brûk dizze no om jo wachtwurd te opnij yn te stellen en jo gegevens te behâlden

## Alert Bar

alert-bar-close-message = Berjocht slute

## User's avatar

avatar-your-avatar =
    .alt = Jo avatar
avatar-default-avatar =
    .alt = Standertavatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla }-produkten
bento-menu-tagline = Mear produkten fan { -brand-mozilla } dy’t jo privacy beskermje
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } Browser foar desktop
bento-menu-firefox-mobile = { -brand-firefox } Browser foar mobyl
bento-menu-made-by-mozilla = Makke troch { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Download { -brand-firefox } op mobyl of tablet
connect-another-find-fx-mobile-2 = Sykje { -brand-firefox } yn de { -google-play } en de { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Download { -brand-firefox } op { -google-play }
connect-another-app-store-image-3 =
    .alt = Download { -brand-firefox } op { -app-store }

## Connected services section

cs-heading = Ferbûne tsjinsten
cs-description = Alles wat jo brûke en wêrby't jo oanmeld binne.
cs-cannot-refresh =
    Sorry, der is in probleem bard by it fernijen fan de list
    mei ferbûne tsjinsten.
cs-cannot-disconnect = Client net fûn, ferbining kin net ferbrutsen wurde
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Ofmeld by { $service }
cs-refresh-button =
    .title = Ferbûne tsjinsten fernije
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Untbrekkende of dûbele items?
cs-disconnect-sync-heading = Ferbining mei Sync ferbrekke

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Jo navigaasjegegevens bliuwe op <span>{ $device }</span> bestean,
    mar der wurdt net mear mei jo account syngronisearre.
cs-disconnect-sync-reason-3 = Wat is de wichtichste reden om <span>{ $device }</span> te ûntkeppeljen?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = It apparaat is:
cs-disconnect-sync-opt-suspicious = Fertocht
cs-disconnect-sync-opt-lost = Ferlern of stellen
cs-disconnect-sync-opt-old = Ald of ferfongen
cs-disconnect-sync-opt-duplicate = In duplikaat
cs-disconnect-sync-opt-not-say = Sis ik leaver net

##

cs-disconnect-advice-confirm = Oké, begrepen
cs-disconnect-lost-advice-heading = Ferlern of stellen apparaat ûntkeppele
cs-disconnect-lost-advice-content-3 =
    Omdat jo apparaat ferlern of stellen is moatte jo, om jo gegevens feilich te hâlden, jo wachtwurd fan { -product-mozilla-account } wizigje
    yn jo accountynstellingen. Jo kinne it beste ek ynformaasje by de produsint fan jo apparaat opsykje oer it op ôfstân wiskjen fan jo gegevens.
cs-disconnect-suspicious-advice-heading = Fertocht apparaat ûntkeppele
cs-disconnect-suspicious-advice-content-2 =
    As it ûntkeppele apparaat yndied fertocht is, moatte jo, om jo gegevens feilich te hâlden, it wachtwurd fan jo { -product-mozilla-account }
    wizigje yn jo accountynstellingen. Jo kinne it beste ek alle oare wachtwurden dy’t jo yn { -brand-firefox } bewarre hawwe wizigje troch yn de adresbalke about:logins yn te typen.
cs-sign-out-button = Ofmelde

## Data collection section

dc-heading = Gegevenssamling en gebrûk
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-browser
dc-subheader-content-2 = { -product-mozilla-accounts } tastean om technyske en ynteraksjegegevens nei { -brand-mozilla } te ferstjoeren.
dc-subheader-ff-content = As jo de technyske- en ynteraksjegegevensynstellingen fan jo { -brand-firefox }-browser besjen of bywurkje wolle, iepenje jo de ynstellingen fan { -brand-firefox } en navigearje jo nei Privacy en Befeiliging.
dc-opt-out-success-2 = Ofmelden suksesfol. { -product-mozilla-accounts } stjoert gjin technyske of ynteraksjegegevens nei { -brand-mozilla }.
dc-opt-in-success-2 = Tank! Troch dizze gegevens te dielen helpe jo ús { -product-mozilla-accounts } te ferbetterjen.
dc-opt-in-out-error-2 = Sorry, der is in probleem bard by it wizigjen fan jo foarkar foar gegevenssamling
dc-learn-more = Mear ynfo

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }-menu
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Oanmeld as
drop-down-menu-sign-out = Ofmelde
drop-down-menu-sign-out-error-2 = Sorry, der is in probleem bard by it ôfmelden

## Flow Container

flow-container-back = Tebek

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Fier jo wachtwurd opnij yn foar de feilichheid
flow-recovery-key-confirm-pwd-input-label = Fier jo wachtwurd yn
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Accountwerstelkaai oanmeitsje
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Nije accountwerstelkaai oanmeitsje

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Accountwerstelkaai oanmakke – Download en bewarje dizze no
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Mei dizze kaai kinne jo jo gegevens weromhelje as jo jo wachtwurd ferjitten binne. Download it no en bewarje it op in plak dat jo ûnthâlde kinne – jo kinne letter net werom nei dizze side.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Trochgean sûnder te downloaden

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Kaai foar accountwerstel oanmakke

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Meitsje in accountwerstelkaai oan foar it gefal jo jo wachtwurd ferjitte
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Jo accountwerstelkaai wizigje
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Wy fersiferje navigaasjegegevens – wachtwurden, blêdwizers, en mear. It is geweldich foar de privacy, mar jo kinne jo gegevens ferlieze as jo jo wachtwurd ferjitte.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Dêrom is it meitsjen fan in accountwerstelkaai sa wichtich – jo kinne jo kaai brûke om jo gegevens te werstellen.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Begjinne
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Annulearje

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Meitsje ferbining mei jo autentikaasje-app
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Stap 1:</strong> scan dizze QR-koade mei in autentikaasje-app, lykas Duo of Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-koade foar it ynstellen fan autentikaasje yn twa stappen. Scan dizze of kies ‘Kinne jo de QR-koade net scanne?’ om yn stee dêrfan in geheime kaai foar ynstallaasje op te heljen.
flow-setup-2fa-cant-scan-qr-button = Kinne jo de QR-koade net scanne?
flow-setup-2fa-manual-key-heading = Koade hânmjittich ynfiere
flow-setup-2fa-manual-key-instruction = <strong>Stap 1:</strong> fier dizze koade yn de autentikaasje-app fan jo foarkar yn.
flow-setup-2fa-scan-qr-instead-button = QR-koade scanne?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Mear ynfo oer autentikaasje-apps
flow-setup-2fa-button = Trochgean
flow-setup-2fa-step-2-instruction = <strong>Stap 2:</strong> fier de koade fan jo autentikaasje-app yn.
flow-setup-2fa-input-label = Fier 6-siferige koade yn
flow-setup-2fa-code-error = Unjildige of ferrûne koade. Kontrolearje jo autentikaasje-app en probearje it opnij.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Kies in werstelmetoade
flow-setup-2fa-backup-choice-description = Dit makket oanmelden mooglik as jo gjin tagong hawwe ta jo mobile apparaat of autentikaasje-app.
flow-setup-2fa-backup-choice-phone-title = Wersteltelefoannûmer
flow-setup-2fa-backup-choice-phone-badge = Meast ienfâldich
flow-setup-2fa-backup-choice-phone-info = Untfang in werstelkoade fia sms. Op dit stuit beskikber yn de FS en Kanada.
flow-setup-2fa-backup-choice-code-title = Reserve-autentikaasjekoaden
flow-setup-2fa-backup-choice-code-badge = Meast feilich
flow-setup-2fa-backup-choice-code-info = Meitsje en bewarje autentikaasjekoaden foar ienmalich gebrûk.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Mear oer werstel en simswaprisiko

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Fier reserve-autentikaasjekoade yn
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Befêstigje dat jo jo koaden bewarre hawwe troch der ien yn te fieren. Sûnder dizze koaden kinne jo miskien net oanmelde as jo jo autentikaasje-app net hawwe.
flow-setup-2fa-backup-code-confirm-code-input = Fier koade fan 10 tekens yn
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Foltôgje

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Reserve-autentikaasjekoaden bewarje
flow-setup-2fa-backup-code-dl-save-these-codes = Bewarje dizze op in plak dat jo ûnthâlde kinne. As jo gjin tagong hawwe ta jo autentikaasje-app, moatte jo in koade ynfiere om oan te melden.
flow-setup-2fa-backup-code-dl-button-continue = Trochgean

##

flow-setup-2fa-inline-complete-success-banner = Autentikaasje yn twa stappen ynskeakele
flow-setup-2fa-inline-complete-success-banner-description = Om al jo ferbûne apparaten te beskermjen, moatte jo oeral wêr’t jo dizze account brûke ôfmelde, en dêrnei wer oanmelde mei jo nije autentikaasje yn twa stappen.
flow-setup-2fa-inline-complete-backup-code = Reserve-autentikaasjekoaden
flow-setup-2fa-inline-complete-backup-phone = Wersteltelefoannûmer
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } koade oer
       *[other] { $count } koaden oer
    }
flow-setup-2fa-inline-complete-backup-code-description = Dit is de feilichste werstelmetoade as jo jo net oanmelde kinne mei jo mobile apparaat of autentikaasje-app.
flow-setup-2fa-inline-complete-backup-phone-description = Dit is de ienfâldichste werstelmetoade as jo jo net oanmelde kinne mei jo autentikaasje-app.
flow-setup-2fa-inline-complete-learn-more-link = Hoe dit jo account beskermet
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Trochgean nei { $serviceName }
flow-setup-2fa-prompt-heading = Autentikaasje yn twa stappen ynstelle
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } fereasket dat jo twa-stapsautentikaasje ynstelle om jo account feilich te hâlden.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Jo kinne elk fan <authenticationAppsLink>dizze autentikaasje-apps</authenticationAppsLink> brûke om troch te gean.
flow-setup-2fa-prompt-continue-button = Trochgean

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Fier ferifikaasjekoade yn
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Der is per sms in 6-siferige koade ferstjoerd nei <span>{ $phoneNumber }</span>. Dizze koade ferrint nei 5 minuten.
flow-setup-phone-confirm-code-input-label = Fier 6-siferige koade yn
flow-setup-phone-confirm-code-button = Befêstigje
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Koade ferrûn?
flow-setup-phone-confirm-code-resend-code-button = Koade nochris ferstjoere
flow-setup-phone-confirm-code-resend-code-success = Koade ferstjoerd
flow-setup-phone-confirm-code-success-message-v2 = Wersteltelefoannûmer tafoege
flow-change-phone-confirm-code-success-message = Wersteltelefoannûmer wizige

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Ferifiearje jo telefoannûmer
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Jo ûntfange in sms fan { -brand-mozilla } mei in koade om jo nûmer te ferifiearjen. Diel dizze koade mei net ien.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Wersteltelefoannûmers binne allinnich beskikber yn de Ferienige Steaten en Kanada. VoIP-nûmers en telefoanmaskers wurde net oanrekommandearre.
flow-setup-phone-submit-number-legal = Troch jo nûmer op te jaan, geane jo akkoard dat wy dit bewarje, sadat wy jo allinnich kinne sms’e foar accountferifikaasje. Berjocht- en gegevenstariven kinne fan tapassing wêze.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Koade ferstjoere

## HeaderLockup component, the header in account settings

header-menu-open = Menu slute
header-menu-closed = Websitenavigaasjemenu
header-back-to-top-link =
    .title = Nei boppe
header-back-to-settings-link =
    .title = Tebek nei ynstellingen foar { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Help

## Linked Accounts section

la-heading = Keppele accounts
la-description = Jo hawwe tagong ta de folgjende accounts autorisearrre.
la-unlink-button = Untkeppelje
la-unlink-account-button = Untkeppelje
la-set-password-button = Wachtwurd ynstelle
la-unlink-heading = Untkeppelje fan eksterne account
la-unlink-content-3 = Binne jo wis dat jo jo account ûntkeppelje wolle? As jo jo account ûntkeppelje, wurde jo net automatysk ôfmeld by jo ferbûne tsjinsten. Om dat te dwaan, moatte jo jo hânmjittich ôfmelde fan de seksje Ferbûnen tsjinsten út.
la-unlink-content-4 = Eardat jo jo account ûntkeppelje, moatte jo in wachtwurd ynstelle. Sûnder in wachtwurd kinne jo net oanmelde neidat jo jo account ûntkeppele hawwe.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Slute
modal-cancel-button = Annulearje
modal-default-confirm-button = Befêstigje

## ModalMfaProtected

modal-mfa-protected-title = Fier befêstigingskoade yn
modal-mfa-protected-subtitle = Help ús te kontrolearjen dat jo it binne dy’t jo accountgegevens wiziget
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Fier binnen { $expirationTime } minút de koade yn dy’t nei <email>{ $email }</email> is ferstjoerd.
       *[other] Fier binnen { $expirationTime } minuten de koade yn dy’t nei <email>{ $email }</email> is ferstjoerd.
    }
modal-mfa-protected-input-label = Fier 6-siferige koade yn
modal-mfa-protected-cancel-button = Annulearje
modal-mfa-protected-confirm-button = Befêstigje
modal-mfa-protected-code-expired = Koade ferrûn?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Nije koade ferstjoere.

## Modal Verify Session

mvs-verify-your-email-2 = Befêstigje jo e-mailadres
mvs-enter-verification-code-2 = Fier jo befêstigingskoade yn
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Fier binnen 5 minuten de befêstigingskoade yn dy’t nei <email>{ $email }</email> ferstjoerd is.
msv-cancel-button = Annulearje
msv-submit-button-2 = Befêstigje

## Settings Nav

nav-settings = Ynstellingen
nav-profile = Profyl
nav-security = Befeiliging
nav-connected-services = Ferbûne tsjinsten
nav-data-collection = Gegevenssamling en gebrûk
nav-paid-subs = Betelle abonneminten
nav-email-comm = E-mailkommunikaasje

## Page2faChange

page-2fa-change-title = Autentikaasje yn twa stappen wizigje
page-2fa-change-success = Twa-stapautentikaasje is bywurke
page-2fa-change-success-additional-message = Om al jo ferbûne apparaten te beskermjen, moatte jo oeral wêr’t jo dizze account brûke ôfmelde, en dêrnei wer oanmelde mei jo nije autentikaasje yn twa stappen.
page-2fa-change-totpinfo-error = Der is in flater bard by it ferfangen fan jo twa-stapsautentikaasje-app. Probearje it letter opnij.
page-2fa-change-qr-instruction = <strong>Stap 1:</strong> scan dizze QR-koade mei in autentikaasje-app, lykas Duo of Google Authenticator. Dit makket in nije ferbining, âlde ferbiningen sille net mear wurkje.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Reserve-autentikaasjekoaden
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Der is in probleem bard by it ferfangen fan jo reserve-autentikaasjekoaden
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Der is in probleem bard by it oanmeitsjen fan jo reserve-autentikaasjekoaden
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Reserve-autentikaasjekoaden bywurke
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Reserve-autentikaasjekoaden oanmakke
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Bewarje dizze op in plak dat jo ûnthâlde sille. Jo âlde koaden wurde ferfongen neidat jo de folgjende stap foltôge hawwe.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Befêstigje dat jo jo koaden bewarre hawwe troch der ien yn te fieren. Jo âlde reserve-autentikaasjekoaden wurde útskeakele as dizze stap foltôge is.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Ferkearde reserve-autentikaasjekoade

## Page2faSetup

page-2fa-setup-title = Autentikaasje yn twa stappen
page-2fa-setup-totpinfo-error = Der is in flater bard by it ynstellen fan twastapsautentikaasje. Probearje it letter opnij.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Dy koade is net korrekt. Probearje it opnij.
page-2fa-setup-success = Autentikaasje yn twa stappen is ynskeakele
page-2fa-setup-success-additional-message = Om al jo ferbûne apparaten te beskermjen, moatte jo oeral wêr’t jo dizze account brûke ôfmelde, en dêrnei wer oanmelde mei autentikaasje yn twa stappen.

## Avatar change page

avatar-page-title =
    .title = Profylfoto
avatar-page-add-photo = Foto tafoegje
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Foto meitsje
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Foto fuortsmite
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Foto opnij meitsje
avatar-page-cancel-button = Annulearje
avatar-page-save-button = Bewarje
avatar-page-saving-button = Bewarje…
avatar-page-zoom-out-button =
    .title = Utzoome
avatar-page-zoom-in-button =
    .title = Ynzoome
avatar-page-rotate-button =
    .title = Draaie
avatar-page-camera-error = Koe kamera net inisjalisearje
avatar-page-new-avatar =
    .alt = nije profylôfbylding
avatar-page-file-upload-error-3 = Der is in probleem bard wylst it opladen fan jo profylôfbylding
avatar-page-delete-error-3 = Der is in probleem bard by it fuortsmiten fan jo profylôfbylding
avatar-page-image-too-large-error-2 = De ôfbyldingbestângrutte is te grut om op te laden

## Password change page

pw-change-header =
    .title = Wachtwurd wizigje
pw-8-chars = Op syn minst 8 karakters
pw-not-email = Net jo e-mailadres
pw-change-must-match = Nij wachtwurd komt oerien mei befêstiging
pw-commonly-used = Net in faaks brûkt wachtwurd
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Bliuw feilich — brûk wachtwurden net opnij. Besjoch mear tips om <linkExternal>sterke wachtwurden te meitsjen</linkExternal>.
pw-change-cancel-button = Annulearje
pw-change-save-button = Bewarje
pw-change-forgot-password-link = Wachtwurd ferjitten?
pw-change-current-password =
    .label = Fier aktuele wachtwurd yn
pw-change-new-password =
    .label = Fier nij wachtwurd yn
pw-change-confirm-password =
    .label = Befêstigje nij wachtwurd
pw-change-success-alert-2 = Wachtwurd bywurke

## Password create page

pw-create-header =
    .title = Wachtwurd oanmeitsje
pw-create-success-alert-2 = Wachtwurd ynsteld
pw-create-error-2 = Sorry, der is in probleem bard by it ynstellen fan jo wachtwurd

## Delete account page

delete-account-header =
    .title = Account fuortsmite
delete-account-step-1-2 = Stap 1 fan 2
delete-account-step-2-2 = Stap 2 fan 2
delete-account-confirm-title-4 = Jo hawwe miskien jo { -product-mozilla-account } ferbûn mei ien of mear fan de folgjende { -brand-mozilla }-produkten of -tsjinsten dy’t jo feilich en produktyf hâlde op it ynternet:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = { -brand-firefox }-gegevens syngronisearje
delete-account-product-firefox-addons = { -brand-firefox }-add-ons
delete-account-acknowledge = Befêstigje dat troch jo account fuort te smiten:
delete-account-chk-box-1-v4 =
    .label = Alle betelle abonneminten wurde opsein
delete-account-chk-box-2 =
    .label = Jo bewarre ynformaasje en funksjes yn { -brand-mozilla }-produkten ferlieze kinne
delete-account-chk-box-3 =
    .label = Jo bewarre ynformaasje mooglik net wersteld wurde kinne, as jo dit e-mailadres opnij aktivearje
delete-account-chk-box-4 =
    .label = Alle útwreidingen en tema’s dy’t jo op addons.mozilla.org publisearre hawwe sille fuortsmiten wurde
delete-account-continue-button = Trochgean
delete-account-password-input =
    .label = Fier wachtwurd yn
delete-account-cancel-button = Annulearje
delete-account-delete-button-2 = Fuortsmite

## Display name page

display-name-page-title =
    .title = Werjeftenamme
display-name-input =
    .label = Fier skermnamme yn
submit-display-name = Bewarje
cancel-display-name = Annulearje
display-name-update-error-2 = Der is in probleem bard by it bywurkjen fan jo skermnamme
display-name-success-alert-2 = Skermnamme bywurke

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Resinte accountaktiveit
recent-activity-account-create-v2 = Account oanmakke
recent-activity-account-disable-v2 = Account útskeakele
recent-activity-account-enable-v2 = Account ynskeakele
recent-activity-account-login-v2 = Accountoanmelding start
recent-activity-account-reset-v2 = Wachtwurdwerinitsjalisaasje start
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = E-mailbounces wiske
recent-activity-account-login-failure = Accountoanmeldingsbesykjen mislearre
recent-activity-account-two-factor-added = Twa-stapsautentikaasje ynskeakele
recent-activity-account-two-factor-requested = Twa-stapsautentikaasje oanfrege
recent-activity-account-two-factor-failure = Twa-stapsautentikaasje mislearre
recent-activity-account-two-factor-success = Twa-stapsautentikaasje slagge
recent-activity-account-two-factor-removed = Twa-stapsautentikaasje fuortsmiten
recent-activity-account-password-reset-requested = Account hat wachtwurdwerinisjalisaasje oanfrege
recent-activity-account-password-reset-success = Accountwachtwurd mei sukses opnij ynsteld
recent-activity-account-recovery-key-added = Accountwerstelkaai ynskeakele
recent-activity-account-recovery-key-verification-failure = Ferifikaasje fan accountwerstelkaai mislearre
recent-activity-account-recovery-key-verification-success = Ferifikaasje fan accountwerstelkaai slagge
recent-activity-account-recovery-key-removed = Kaai foar accountwerstel fuortsmiten
recent-activity-account-password-added = Nij wachtwurd tafoege
recent-activity-account-password-changed = Wachtwurd wizige
recent-activity-account-secondary-email-added = Sekundêr e-mailadres tafoege
recent-activity-account-secondary-email-removed = Sekundêr e-mailadres fuortsmiten
recent-activity-account-emails-swapped = Primêre en sekundêre e-mailadressen wiksele
recent-activity-session-destroy = Ofmeld by sesje
recent-activity-account-recovery-phone-send-code = Wersteltelefoankoade ferstjoerd
recent-activity-account-recovery-phone-setup-complete = Ynstellen wersteltelefoannûmer foltôge
recent-activity-account-recovery-phone-signin-complete = Oanmelden mei wersteltelefoannûmer foltôge
recent-activity-account-recovery-phone-signin-failed = Oanmelding mei wersteltelefoannûmer mislearre
recent-activity-account-recovery-phone-removed = Wersteltelefoannûmer fuortsmiten
recent-activity-account-recovery-codes-replaced = Werstelkoaden ferfongen
recent-activity-account-recovery-codes-created = Werstelkoaden oanmakke
recent-activity-account-recovery-codes-signin-complete = Oanmelden mei werstelkoaden foltôge
recent-activity-password-reset-otp-sent = Befêstigingskoade foar wachtwurdwerinisjalisaasje ferstjoerd
recent-activity-password-reset-otp-verified = Befêstigingskoade fan wachtwurdwerinisjalisaasje ferifiearre
recent-activity-must-reset-password = Wachtwurd opnij ynstelle fereaske
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Oare accountaktiviteit

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Accountwerstelkaai
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Tebek nei ynstellingen

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Wersteltelefoannûmer fuortsmite
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Dit sil <strong>{ $formattedFullPhoneNumber }</strong> fuortsmite as jo wersteltelefoannûmer.
settings-recovery-phone-remove-recommend = Wy riede jo oan dat jo dizze metoade behâlde, omdat it makliker is as it bewarjen fan reservekopy-autentikaasjekoaden.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = As jo de add-on fuortsmite, soargje der dan foar dat o jo bewarre reserve-autentikaasjekoaden noch hawwe. <linkExternal>Werstelmetoaden fergelykje</linkExternal>
settings-recovery-phone-remove-button = Telefoannûmer fuortsmite
settings-recovery-phone-remove-cancel = Annulearje
settings-recovery-phone-remove-success = Wersteltelefoannûmer fuortsmiten

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Wersteltelefoannûmer tafoegje
page-change-recovery-phone = Wersteltelefoannûmer wizigje
page-setup-recovery-phone-back-button-title = Tebek nei ynstellingen
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Telefoannûmer wizigje

## Add secondary email page

add-secondary-email-step-1 = Stap 1 fan 2
add-secondary-email-error-2 = Der is in probleem bard by it oanmeitsjen fan dit e-mailadres
add-secondary-email-page-title =
    .title = Sekundêr e-mailadres
add-secondary-email-enter-address =
    .label = Fier e-mailadres yn
add-secondary-email-cancel-button = Annulearje
add-secondary-email-save-button = Bewarje
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = E-mailmaskers kinne net as sekundêr e-mailadres brûkt wurde

## Verify secondary email page

add-secondary-email-step-2 = Stap 2 fan 2
verify-secondary-email-page-title =
    .title = Sekundêr e-mailadres
verify-secondary-email-verification-code-2 =
    .label = Fier jo befêstigingskoade yn
verify-secondary-email-cancel-button = Annulearje
verify-secondary-email-verify-button-2 = Befêstigje
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Fier binnen 5 minuten de befêstigingskoade yn dy’t nei <strong>{ $email }</strong> ferstjoerd is.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } mei sukses tafoege
verify-secondary-email-resend-code-button = Befêstigingskoade opnij ferstjoere

##

# Link to delete account on main Settings page
delete-account-link = Account fuortsmite
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Mei sukses oanmeld. Jo { -product-mozilla-account } en gegevens bliuwe aktyf.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Untdek wêr’t jo priveegegevens lekt binne en nim de kontrôle
# Links out to the Monitor site
product-promo-monitor-cta = Untfang in fergeze scan

## Profile section

profile-heading = Profyl
profile-picture =
    .header = Ofbylding
profile-display-name =
    .header = Werjeftenamme
profile-primary-email =
    .header = Primêr e-mailadres

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Stap { $currentStep } fan { $numberOfSteps }.

## Security section of Setting

security-heading = Befeiliging
security-password =
    .header = Wachtwurd
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Makke op { $date }
security-not-set = Net ynsteld
security-action-create = Oanmeitsje
security-set-password = Stel in wachtwurd yn om te syngronisearjen en bepaalde accountbefeiligingsfunksjes te brûken.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Resinte accountaktiviteit besjen
signout-sync-header = Sesje ferrûn
signout-sync-session-expired = Sorry, der is wat misgien. Meld jo ôf fan it browsermenu út en probearje it opnij.

## SubRow component

tfa-row-backup-codes-title = Reserve-autentikaasjekoaden
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Gjin koaden beskikber
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } koade restearjend
       *[other] { $numCodesAvailable } koaden restearjend
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Nije koaden oanmeitsje
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Tafoegje
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Dit is de feilichste werstelmetoade as jo jo mobile apparaat of autentikaasje-app net brûke kinne.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Wersteltelefoannûmer
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Gjin telefoannûmer tafoege
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Wizigje
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Tafoegje
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Fuortsmite
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Wersteltelefoannûmer fuortsmite
tfa-row-backup-phone-delete-restriction-v2 = As jo jo wersteltelefoan fuortsmite wolle, foegje dan earst reserve-autentikaasjekoaden ta of skeakelje earst twastapsautentikaasje út om foar te kommen dat jo gjin tagong mear hawwe ta jo account.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Dit is de ienfâldichste werstelmetoade as jo jo autentikaasje-app net brûke kinne.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Mear ynfo oer it risiko fan simkaartwikseling

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Utskeakelje
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Ynskeakelje
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Yntsjinje…
switch-is-on = oan
switch-is-off = út

## Sub-section row Defaults

row-defaults-action-add = Tafoegje
row-defaults-action-change = Wizigje
row-defaults-action-disable = Utskeakelje
row-defaults-status = Gjin

## Account recovery key sub-section on main Settings page

rk-header-1 = Accountwerstelkaai
rk-enabled = Ynskeakele
rk-not-set = Net ynsteld
rk-action-create = Oanmeitsje
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Wizigje
rk-action-remove = Fuortsmite
rk-key-removed-2 = Kaai foar accountwerstel fuortsmiten
rk-cannot-remove-key = Jo kaai foar accountwerstel koe net fuortsmiten wurde.
rk-refresh-key-1 = Accountwerstelkaai fernije
rk-content-explain = Jo gegevens werstelle wannear’t jo jo wachtwurd ferjitte.
rk-cannot-verify-session-4 = Sorry, der is in probleem bard by it befêstigjen fan jo sesje
rk-remove-modal-heading-1 = Accountwerstelkaai fuortsmite?
rk-remove-modal-content-1 =
    As jo jo wachtwurd opnij inisjalisearje, kinne jo jo accountwerstelkaai net brûke
    om tagong te krijen ta jo gegevens. Jo kinne dizze aksje net ûngedien meitsje.
rk-remove-error-2 = Jo kaai foar accountwerstel koe net fuortsmiten wurde
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Accountwerstelkaai fuortsmite

## Secondary email sub-section on main Settings page

se-heading = Sekundêr e-mailadres
    .header = Sekundêr e-mailadres
se-cannot-refresh-email = Sorry, der is in probleem bard by it fernijen fan dat e-mailadres.
se-cannot-resend-code-3 = Sorry, der is in probleem bard by it opnij ferstjoeren fan de befêstigingskoade
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } is no jo primêre e-mailadres
se-set-primary-error-2 = Sorry, der is in probleem bard by it wizigjen fan jo primêre e-mailadres
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } mei sukses fuortsmiten
se-delete-email-error-2 = Sorry, der is in probleem bard by it fuortsmiten fan dit e-mailadres
se-verify-session-3 = Jo moatte jo aktuele sesje befêstigje om dizze aksje út te fieren
se-verify-session-error-3 = Sorry, der is in probleem bard by it befêstigjen fan jo sesje
# Button to remove the secondary email
se-remove-email =
    .title = E-mailadres fuortsmite
# Button to refresh secondary email status
se-refresh-email =
    .title = E-mailadres fernije
se-unverified-2 = net befêstige
se-resend-code-2 =
    Befêstiging fereaske. <button>Ferstjoer de befêstigingskoade opnij</button>
    as dizze net yn jo Postfek YN of jo map Net-winske stiet.
# Button to make secondary email the primary
se-make-primary = Primêr meitsje
se-default-content = Tagong ta jo account as jo net oanmelde kinne op jo primêre e-mailadres.
se-content-note-1 =
    Noat: in sekundêr e-mailadres werstelt jo gegevens net – dêrfoar
    hawwe jo in <a>accountwerstelkaai</a> nedich.
# Default value for the secondary email
se-secondary-email-none = Gjin

## Two Step Auth sub-section on Settings main page

tfa-row-header = Autentikaasje yn twa stappen
tfa-row-enabled = Ynskeakele
tfa-row-disabled-status = Utskeakele
tfa-row-action-add = Tafoegje
tfa-row-action-disable = Utskeakelje
tfa-row-action-change = Wizigje
tfa-row-button-refresh =
    .title = Autentikaasje yn twa stappen fernije
tfa-row-cannot-refresh =
    Sorry, der is in probleem bard by it fernijen fan autentikaasje
    yn twa stappen.
tfa-row-enabled-description = Jo account wurdt beskerme troch twa-stapsautentikaasje. Jo moatte ien kear in tagongskoade ynfiere fan jo autentikaasje-app ôf by it oanmelden by jo { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Hoe dit jo account beskermet
tfa-row-disabled-description-v2 = Help jo account te befeiligjen troch in autentikaasje-app fan tredden te brûken as twadde stap om jo oan te melden.
tfa-row-cannot-verify-session-4 = Sorry, der is in probleem bard by it befêstigjen fan jo sesje
tfa-row-disable-modal-heading = Autentikaasje yn twa stappen útskeakelje?
tfa-row-disable-modal-confirm = Utskeakelje
tfa-row-disable-modal-explain-1 =
    Jo kinne dizze aksje net ûngedien meitsje. Jo hawwe ek
    de opsje <linkExternal>jo reserve-accountwerstelkoaden te ferfangen</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Twa-staps autentikaasje útskeakele
tfa-row-cannot-disable-2 = Autentikaasje yn twa stappen koe net útskeakele wurde
tfa-row-verify-session-info = Jo moatte jo aktuele sesje befêstigje om autentikaasje yn twa stappen yn te stellen

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Troch troch te gean geane jo akkoard mei de:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla }-abonnemintstsjinsten, <mozSubscriptionTosLink>Tsjinstbetingsten</mozSubscriptionTosLink> en <mozSubscriptionPrivacyLink>Privacyferklearring</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Tsjinstbetingsten</mozillaAccountsTos> en <mozillaAccountsPrivacy>Privacyferklearring</mozillaAccountsPrivacy> fan { -product-mozilla-accounts(capitalization: "uppercase") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Troch fierder te gean, geane jo akkoard mei de <mozillaAccountsTos>Tsjinbetingsten</mozillaAccountsTos> en de <mozillaAccountsPrivacy>Privacyferklearring</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Of
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Oanmelde mei
continue-with-google-button = Trochgean mei { -brand-google }
continue-with-apple-button = Trochgean mei { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Unbekend account
auth-error-103 = Ferkeard wachtwurd
auth-error-105-2 = Ferkearde befêstigingskoade
auth-error-110 = Unjildich token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Jo hawwe te faaks besocht. Probearje letter opnij.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Jo hawwe it te faak probearre. Probearje it { $retryAfter } opnij.
auth-error-125 = De oanfraach is om reden fan feilichheid blokkearre
auth-error-129-2 = Jo hawwe in ûnjildich telefoannûmer ynfierd. Kontrolearje dit en probearje it opnij.
auth-error-138-2 = Net-befêstige sesje
auth-error-139 = Sekundêr e-mailadres moat oars wêze as jo account-e-mailadres
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Dit e-mailadres is troch in oare account reservearre. Probearje it letter nochris of brûk in oar e-mailadres.
auth-error-155 = TOTP-token net fûn
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Reserve-autentikaasjekoade net fûn
auth-error-159 = Unjildige accountwerstelkaai
auth-error-183-2 = Unjildige of ferrûne befêstigingskoade
auth-error-202 = Funksje net ynskeakele
auth-error-203 = Systeem net beskikber, probearje it letter opnij
auth-error-206 = Kin gjin wachtwurd oanmeitsje, wachtwurd is al ynsteld
auth-error-214 = Wersteltelefoannûmer bestiet al
auth-error-215 = Wersteltelefoannûmer bestiet net
auth-error-216 = SMS-limyt berikt
auth-error-218 = Kin wersteltelefoannûmer net fuortsmite, reservekopy-autentikaasjekoaden ûntbrekke.
auth-error-219 = Dit telefoannûmer is by tefolle accounts registrearre. Probearje in oar nûmer.
auth-error-999 = Unferwachte flater
auth-error-1001 = Oanmeldbesykjen annulearre
auth-error-1002 = Sesje ferrûn. Meld jo oan om troch te gean.
auth-error-1003 = Lokale ûnthâld of cookies binne noch hieltyd útskeakele
auth-error-1008 = Jo âlde en nije wachtwurd meie net lyk wêze
auth-error-1010 = Jildich wachtwurd fereaske
auth-error-1011 = Jildich e-mailadres fereaske
auth-error-1018 = Jo befêstigings-e-mailberjocht is sakrekt weromkaam. Hawwe jo it e-mailadres ferkeard ynfierd?
auth-error-1020 = Hawwe jo it e-mailadres ferkeard ynfierd? firefox.com is gjin jildige e-mailtsjinst
auth-error-1031 = Jo moatte jo leeftiid ynfiere om te registrearjen
auth-error-1032 = Jo moatte in jildige leeftiid ynfiere om te registrearjen
auth-error-1054 = Unjildige koade foar autentikaasje yn twa stappen
auth-error-1056 = Unjildige reserve-autentikaasjekoade
auth-error-1062 = Unjildige trochferwizing
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Hawwe jo it e-mailadres ferkeard ynfierd? { $domain } is gjin jildige e-mailtsjinst
auth-error-1066 = E-mailmaskers kinne net brûkt wurde om in account oan te meitsjen.
auth-error-1067 = Hawwe jo it e-mailadres ferkeard ynfierd?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Nûmer dat einiget op { $lastFourPhoneNumber }
oauth-error-1000 = Der is wat misgien. Slút dit ljepblêd en probearje it opnij.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Jo binne oanmeld by { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-mailadres befêstige
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Oanmelding befêstige
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Meld jo oan by dizze { -brand-firefox } om de ynstallaasje te foltôgjen
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Oanmelde
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Noch mear apparaten tafoegje? Meld jo oan by { -brand-firefox } op in oar apparaat om de ynstallaasje te foltôgjen
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Meld jo oan by { -brand-firefox } op in oar apparaat om de ynstallaasje te foltôgjen
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Wolle jo tagong ta jo ljepblêden, blêdwizers en wachtwurden op in oar apparaat?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Noch in apparaat keppelje
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = No net
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Meld jo oan by { -brand-firefox } foar Android om de ynstallaasje te foltôgjen
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Meld jo oan by { -brand-firefox } foar iOS om de ynstallaasje te foltôgjen

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Lokale opslach en cookies binne ferplicht
cookies-disabled-enable-prompt-2 = Skeakel cookies en lokale opslach yn jo browser yn foar tagong ta { -product-mozilla-account }. Hjirtroch wurde funksjonaliteiten lykas it ûnthâlden fan jo, tusken sesjes ynskeakele.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Opnij probearje
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Mear ynfo

## Index / home page

index-header = Fier jo e-mailadres yn
index-sync-header = Trochgean nei jo { -product-mozilla-account }
index-sync-subheader = Syngronisearje jo wachtwurden, ljepblêden en blêdwizers oeral wêr't jo { -brand-firefox } brûke.
index-relay-header = In e-mailmasker oanmeitsje
index-relay-subheader = Jou it e-mailadres op wêrnei’t jo e-mailberjochten fan jo maskearre e-mailadres út trochstjoere wolle.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Trochgean nei { $serviceName }
index-subheader-default = Trochgean nei accountynstellingen
index-cta = Registrearje of meld jo oan
index-account-info = In { -product-mozilla-account } ûntskoattelet ek de tagong ta mear privacybeskermende produkten fan { -brand-mozilla }.
index-email-input =
    .label = Fier jo e-mailadres yn
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Account mei sukses fuortsmiten
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Jo befêstigings-e-mailberjocht is sakrekt weromkaam. Hawwe jo it e-mailadres ferkeard ynfierd?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Oeps! Wy koenen jo accountwerstelkaai net oanmeitsje. Probearje it letter nochris.
inline-recovery-key-setup-recovery-created = Kaai foar accountwerstel oanmakke
inline-recovery-key-setup-download-header = Befeiligje jo account
inline-recovery-key-setup-download-subheader = No downloade en bewarje
inline-recovery-key-setup-download-info = Bewarje dizze kaai op in plak dy’t jo ûnthâlde kinne – jo kinne dizze side letter net mear iepenje.
inline-recovery-key-setup-hint-header = Befeiligingsoanrekommandaasje

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Konfiguraasje annulearje
inline-totp-setup-continue-button = Trochgean
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Foegje in befeiligingslaach ta oan jo account troch befeiligingskoaden fan ien fan<authenticationAppsLink>dizze apps foar autentikaasje</authenticationAppsLink> te easkjen.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Skeakelje twastapsautentikaasje yn <span>om troch te gean nei jo accountynstellingen</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Skeakelje twastapsautentikaasje yn <span>om troch te gean nei { $serviceName }</span>
inline-totp-setup-ready-button = Klear
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Scan jo autentikaasjekoade <span>om troch te gean nei { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Fier hânmjittich jo koade yn <span>om troch te gean nei { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Scan jo autentikaasjekoade <span>om troch te gean nei jo accountynstellingen</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Fier hânmjittich jo koade yn <span>om troch te gean nei accountynstellingen</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Typ dizze geheime kaai yn jo autentikaasje-app. <toggleToQRButton>QR-koade scanne?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Scan de QR-koade yn jo autentikaasje-app en fier dênnei de autentikaasjekoade yn dy’t opjûn wurdt. <toggleToManualModeButton>Kinne jo de koade net scanne?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Nei foltôgjen wurde autentikaasjekoaden foar jo generearre dy’t jo ynfiere kinne.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Autentikaasjekoade
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Autentikaasjekoade fereaske
tfa-qr-code-alt = Brûk de koade { $code } om autentikaasje yn twa stappen yn stipe tapassingen yn te skeakeljen.
inline-totp-setup-page-title = Autentikaasje yn twa stappen

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Juridysk
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Tsjinstbetingsten
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Privacyferklearring

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Privacyferklearring

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Tsjinstbetingsten

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Hawwe jo jo krekt oanmeld by { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Ja, apparaat goedkarre
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = As dit jo net wiene, <link>wizigje dan jo wachtwurd</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Apparaat ferbûn
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Jo syngronisearje no mei: { $deviceFamily } op { $deviceOS }
pair-auth-complete-sync-benefits-text = Jo kinne no op al jo apparaten tagong krije ta jo iepen ljepblêden, wachtwurden en blêdwizers.
pair-auth-complete-see-tabs-button = Besjoch ljepblêden fan syngronisearre apparaten
pair-auth-complete-manage-devices-link = Apparaten beheare

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Fier jo autentikaasjekoade yn <span>om troch te gean nei jo accountynstellingen</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Fier jo autentikaasjekoade yn <span>om troch te gean nei { $serviceName }</span>
auth-totp-instruction = Iepenje jo app foar autentikaasje en fier de oanbeane autentikaasjekoade yn.
auth-totp-input-label = Fier 6-siferige koade yn
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Befêstigje
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Autentikaasjekoade fereaske

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Goedkarring <span>fan jo oare apparaat ôf</span> no fereaske

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Keppeling mislearre
pair-failure-message = It ynstallaasjeproses is beëinige.

## Pair index page

pair-sync-header = { -brand-firefox } syngronisearje op jo telefoan of tablet
pair-cad-header = { -brand-firefox } ferbine op in oar apparaat
pair-already-have-firefox-paragraph = Hawwe jo al { -brand-firefox } op in telefoan of tablet?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Jo apparaat syngronisearje
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Of downloade
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Scan om { -brand-firefox } foar mobyl te downloaden, of stjoer josels in <linkExternal>downloadkeppeling</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = No net
pair-take-your-data-message = Nim jo ljepblêden, blêdwizers en wachtwurden oeral mei hinne wêr’t jo { -brand-firefox } brûke.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Begjinne
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-koade

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Apparaat ferbûn
pair-success-message-2 = Keppeling slagge.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Keppeling <span>foar { $email }</span> befêstigje
pair-supp-allow-confirm-button = Keppeling befêstigje
pair-supp-allow-cancel-link = Annulearje

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Goedkarring <span>fan jo oare apparaat ôf</span> no fereaske

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Keppelje mei in app
pair-unsupported-message = Hawwe jo de systeemkamera brûkt? Jo moatte fan in { -brand-firefox }-app út keppelje.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Meitsje in wachtwurd oan om te syngronisearjen
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Hjirtroch wurde jo gegevens fersifere. It moat wat oars wêze as jo { -brand-google }- of { -brand-apple }-accountwachtwurd.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = In amerijke, jo wurde omlaat nei de autorisearre applikaasje.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Fier jo accountwerstelkaai yn
account-recovery-confirm-key-instruction = Dizze kaai werstelt jo fersifere navigaasjegegevens, lykas wachtwurden en blêdwizers, fan { -brand-firefox }-servers.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Fier jo accountwerstelkaai fan 32 tekens yn
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Jo opslachhint is:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Trochgean
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Kinne jo jo accountwerstelkaai net fine?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Nij wachtwurd oanmeitsje
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Wachtwurd ynsteld
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Sorry, der is in probleem bard by it ynstellen fan jo wachtwurd
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Accountwerstelkaai brûke
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Jo wachtwurd is opnij inisjalisearre.
reset-password-complete-banner-message = Ferjit net in nije accountwerstelkaai te meitsjen fan jo { -product-mozilla-account }-ynstellingen út om takomstige oanmeldingsproblemen foar te kommen.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } probearret jo werom te stjoeren om in e-mailmasker te brûken neidat jo jo oanmeld hawwe.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Fier koade fan 10 tekens yn
confirm-backup-code-reset-password-confirm-button = Befêstigje
confirm-backup-code-reset-password-subheader = Fier reserve-autentikaasjekoade yn
confirm-backup-code-reset-password-instruction = Fier ien fan de koaden om ien kear te brûken yn dy’t jo bewarre hawwe by it ynstellen fan autentikaasje yn twa stappen.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Binne jo bûten sluten?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Kontrolearje jo e-mail
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Wy hawwe in befêstigingskoade nei <span>{ $email }</span> stjoerd.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Fier binnen 10 minuten in 8-siferige koade yn
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Trochgean
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Koade nochris ferstjoere
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = In oar account brûke

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Stel jo wachtwurd opnij yn
confirm-totp-reset-password-subheader-v2 = Fier twastaps-autentikaasjekoade yn
confirm-totp-reset-password-instruction-v2 = Kontrolearje jo <strong>autentikaasje-app</strong> om jo wachtwurd opnij yn te stellen.
confirm-totp-reset-password-trouble-code = Problemen by it ynfieren fan de koade?
confirm-totp-reset-password-confirm-button = Befêstigje
confirm-totp-reset-password-input-label-v2 = Fier 6-siferige koade yn
confirm-totp-reset-password-use-different-account = In oar account brûke

## ResetPassword start page

password-reset-flow-heading = Jo wachtwurd opnij ynstelle
password-reset-body-2 =
    Wy freegje jo in pear dingen dy’t allinnich jo witte om jo account
    feilich te hâlden.
password-reset-email-input =
    .label = Fier jo e-mailadres yn
password-reset-submit-button-2 = Trochgean

## ResetPasswordConfirmed

reset-password-complete-header = Jo wachtwurd is opnij ynsteld
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Trochgean nei { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Jo wachtwurd werinisjalisearje
password-reset-recovery-method-subheader = In werstelmetoade kieze
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Litte wy der wis fan wêze dat jo it binne dy’t jo werstelmetoaden brûke.
password-reset-recovery-method-phone = Wersteltelefoannûmer
password-reset-recovery-method-code = Reserve-autentikaasjekoaden
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } koade restearjend
       *[other] { $numBackupCodes } koaden restearjend
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Der is in probleem bard by it ferstjoeren fan in koade nei jo wersteltelefoannûmer
password-reset-recovery-method-send-code-error-description = Probearje it letter opnij of brûk jo reservekopy-autentikaasjekoaden.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Inisjalisearje jo wachtwurd opnij
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Fier werstelkoade yn
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Der is in 6-siferige koade ferstjoerd nei it telefoannûmer einigjend op <span>{ $lastFourPhoneDigits }</span>. Dizze koade ferrint nei 5 minuten. Diel dizze koade mei net ien.
reset-password-recovery-phone-input-label = Fier 6-siferige koade yn
reset-password-recovery-phone-code-submit-button = Befêstigje
reset-password-recovery-phone-resend-code-button = Koade nochris ferstjoere
reset-password-recovery-phone-resend-success = Koade ferstjoerd
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Binne jo bûten sluten?
reset-password-recovery-phone-send-code-error-heading = Der is in probleem bard by it ferstjoeren fan in koade
reset-password-recovery-phone-code-verification-error-heading = Der is in probleem bard by it ferifiearjen fan jo koade.
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Probearje it letter noch ris.
reset-password-recovery-phone-invalid-code-error-description = De koade is ûnjildich of ferrûn.
reset-password-recovery-phone-invalid-code-error-link = Reserve-autentikaasjekoaden yn stee hjirfan brûke?
reset-password-with-recovery-key-verified-page-title = Wachtwurd mei sukses opnij ynsteld
reset-password-complete-new-password-saved = Nij wachtwurd bewarre!
reset-password-complete-recovery-key-created = Nije accountwerstelkaai oanmakke. Download en bewarje dizze no.
reset-password-complete-recovery-key-download-info = Dizze kaai is essinsjeel foar gegevenswerstel as jo jo wachtwurd ferjitte. <b>Download en bewarje it no feilich, omdat jo dizze side letter net mear iepenje kinne.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Flater:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Oanmelding falidearje…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Befêstigingsflater
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Befêstigingskeppeling ferrûn
signin-link-expired-message-2 = De keppeling wêrop jo klikt hawwe is ferrûn of is al brûkt.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Fier jo wachtwurd <span>foar jo { -product-mozilla-account }</span> yn
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Trochgean nei { $serviceName }
signin-subheader-without-logo-default = Trochgean nei accountynstellingen
signin-button = Oanmelde
signin-header = Oanmelde
signin-use-a-different-account-link = In oar account brûke
signin-forgot-password-link = Wachtwurd ferjitten?
signin-password-button-label = Wachtwurd
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } probearret jo werom te stjoeren om in e-mailmasker te brûken neidat jo jo oanmeld hawwe.
signin-code-expired-error = Koade ferrûn. Meld jo opnij oan.
signin-account-locked-banner-heading = Wachtwurd opnij ynstelle
signin-account-locked-banner-description = Wy hawwe jo account beskoattele om dizze te beskermjen tsjin fertochte aktiviteit.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Stel jo wachtwurd opnij yn om jo oan te melden

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = De keppeling wêrop jo klikt hawwe miste tekens en is mooglik defekt rekke troch jo e-mailclient. Kopiearje foarsichtich it adres en probearje it opnij.
report-signin-header = Net-autorisearre oanmelding rapportearje?
report-signin-body = Jo hawwe in e-mail ûntfongen oer in besykjen tagong te krijen ta jo account. Wolle jo dizze aktiviteit as fertocht rapportearje?
report-signin-submit-button = Aktiviteit rapportearje
report-signin-support-link = Werom bart dit?
report-signin-error = Sorry, der wie in probleem mei it yntsjinjen fan jo rapport.
signin-bounced-header = Sorry. Wy hawwe jo account beskoattele.
# $email (string) - The user's email.
signin-bounced-message = De befêstigingsmail dy’t wy nei { $email } ferstjoerd hawwe, is retoernearre en om jo { -brand-firefox }-gegevens te beskermjen, is jo account beskoattele.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = As dit in jildich e-mailadres is, <linkExternal>lit dit dan witte</linkExternal> en wy helpe jo account te ûntskoatteljen.
signin-bounced-create-new-account = Hawwe jo dat e-mailadres net mear? Meitsje in nije account
back = Tebek

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Ferifiearje dizze oanmelding <span>om troch te gean nei jo accountynstellingen</span>
signin-push-code-heading-w-custom-service = Ferifiearje dizze oanmelding <span>om troch te gean nei { $serviceName }</span>
signin-push-code-instruction = Kontrolearje jo oare apparaten en kar dizze oanmelding goed fan jo { -brand-firefox }-browser út.
signin-push-code-did-not-recieve = Hawwe jo de melding net ûntfongen?
signin-push-code-send-email-link = Ferstjoer de koade fia e-mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Befêstigje jo oanmelding
signin-push-code-confirm-description = Wy hawwe in oanmeldbesykjen fan it folgjende apparaat ôf detektearre. As jo dit wiene, kar dan de oanmelding goed
signin-push-code-confirm-verifying = Ferifiearje
signin-push-code-confirm-login = Oanmelding befêstigje
signin-push-code-confirm-wasnt-me = Dit wie ik net, wizigje wachtwurd.
signin-push-code-confirm-login-approved = Jo oanmelding is goedkard. Slút dit finster.
signin-push-code-confirm-link-error = Keppeling is skansearre. Probearje it nochris.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Oanmelde
signin-recovery-method-subheader = Kies in werstelmetoade
signin-recovery-method-details = Litte wy der wis fan wêze dat jo it binne dy’t jo werstelmetoaden brûke.
signin-recovery-method-phone = Wersteltelefoannûmer
signin-recovery-method-code-v2 = Reserve-autentikaasjekoaden
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } koade restearjend
       *[other] { $numBackupCodes } koaden restearjend
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Der is in probleem bard by it ferstjoeren fan in koade nei jo wersteltelefoannûmer
signin-recovery-method-send-code-error-description = Probearje it letter opnij of brûk jo reservekopy-autentikaasjekoaden.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Oanmelde
signin-recovery-code-sub-heading = Fier reserve-autentikaasjekoade yn
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Fier ien fan de koaden foar ienmalich gebrûk yn dy’t jo bewarre hawwe by it ynstellen fan autentikaasje yn twa stappen.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Fier koade fan 10 tekens yn
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Befêstigje
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Wersteltelefoannûmer brûke
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Binne jo bûten sluten?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Reserve-autentikaasjekoade fereaske
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Der is in probleem bard by it ferstjoeren fan in koade nei jo wersteltelefoannûmer
signin-recovery-code-use-phone-failure-description = Probearje it letter noch ris.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Oanmelde
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Fier werstelkoade yn
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Der is per sms in 6-siferige koade ferstjoerd nei it telefoannûmer einigjend op <span>{ $lastFourPhoneDigits }</span>. Dizze koade ferrint nei 5 minuten. Diel dizze koade mei net ien.
signin-recovery-phone-input-label = Fier 6-siferige koade yn
signin-recovery-phone-code-submit-button = Befêstigje
signin-recovery-phone-resend-code-button = Koade nochris ferstjoere
signin-recovery-phone-resend-success = Koade ferstjoerd
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Binne jo bûten sluten?
signin-recovery-phone-send-code-error-heading = Der is in probleem bard by it ferstjoeren fan in koade
signin-recovery-phone-code-verification-error-heading = Der is in probleem bard by it ferifiearjen fan jo koade.
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Probearje it letter noch ris.
signin-recovery-phone-invalid-code-error-description = De koade is ûnjildich of ferrûn.
signin-recovery-phone-invalid-code-error-link = Reserve-autentikaasjekoaden yn stee hjirfan brûke?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Mei súkses oanmeld. Der kinne beheiningen fan tapassing wêze as jo jo wersteltelefoannûmer opnij brûke.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Tank foar jo wachens
signin-reported-message = Us team is op ’e hichte brocht. Rapporten as dizze helpe ús ynkringers tsjin te hâlden.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Fier befêstigingskoade <span>foar jo { -product-mozilla-account }</span> yn
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Fier binnen 5 minuten de koade yn dy’t nei <email>{ $email }</email> is ferstjoerd.
signin-token-code-input-label-v2 = Fier 6-siferige koade yn
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Befêstigje
signin-token-code-code-expired = Koade ferrûn?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Nije koade ferstjoere.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Befêstigingskoade nedich
signin-token-code-resend-error = Der is wat misgien. Der koe gjin nije koade ferstjoerd wurde.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } probearret jo werom te stjoeren om in e-mailmasker te brûken neidat jo jo oanmeld hawwe.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Oanmelde
signin-totp-code-subheader-v2 = Fier twastaps-autentikaasjekoade yn
signin-totp-code-instruction-v4 = Kontrolearje jo <strong>autentikaasje-app</strong> om jo oanmelding te befêstigjen.
signin-totp-code-input-label-v4 = Fier 6-siferige koade yn
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Wêrom wurdt jo frege om te autentisearjen?
signin-totp-code-aal-banner-content = Jo hawwe twastapsautentikaasje ynsteld op jo account, mar jo hawwe noch net oanmeld mei in koade op dit apparaat.
signin-totp-code-aal-sign-out = Ofmelde op dit apparaat
signin-totp-code-aal-sign-out-error = Sorry, der is in probleem bard by it ôfmelden
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Befêstigje
signin-totp-code-other-account-link = In oar account brûke
signin-totp-code-recovery-code-link = Problemen by it ynfieren fan de koade?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Autentikaasjekoade fereaske
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } probearret jo werom te stjoeren om in e-mailmasker te brûken neidat jo jo oanmeld hawwe.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Dizze oanmelding autorisearje
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Kontrolearje jo e-mail op de autorisaasjekoade dy’t nei { $email } ferstjoerd is.
signin-unblock-code-input = Fier autorisaasjekoade yn
signin-unblock-submit-button = Trochgean
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Autorisaasjekoade fereaske
signin-unblock-code-incorrect-length = Autorisaasjekoade moat 8 tekens befetsje
signin-unblock-code-incorrect-format-2 = Autorisaasjekoade mei allinnich letters en/of sifers befetsje
signin-unblock-resend-code-button = Net yn Postfek YN of map mei net-winske? Opnij ferstjoere
signin-unblock-support-link = Werom bart dit?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } probearret jo werom te stjoeren om in e-mailmasker te brûken neidat jo jo oanmeld hawwe.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Fier befêstigingskoade yn
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Fier befêstigingskoade <span>foar jo { -product-mozilla-account }</span> yn
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Fier binnen 5 minuten de koade yn dy’t nei <email>{ $email }</email> is ferstjoerd.
confirm-signup-code-input-label = Fier 6-siferige koade yn
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Befêstigje
confirm-signup-code-sync-button = Begjin mei syngronisearjen
confirm-signup-code-code-expired = Koade ferrûn?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Nije koade ferstjoere pr e-mail.
confirm-signup-code-success-alert = Account mei sukses befêstige
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Befêstigingskoade is fereaske
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } probearret jo werom te stjoeren om in e-mailmasker te brûken neidat jo jo oanmeld hawwe.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Meitsje in wachtwurd oan
signup-relay-info = Der is in wachtwurd nedich om jo maskearre e-mailadressen feilich te behearen en tagong te krijen ta de befeiligingshelpmiddelen fan { -brand-mozilla }.
signup-sync-info = Syngronisearje jo wachtwurden, blêdwizers en mear, oeral wêr't jo { -brand-firefox } brûke.
signup-sync-info-with-payment = Syngronisearje jo wachtwurden, betellingsmetoaden, blêdwizers en mear, oeral wêr't jo { -brand-firefox } brûke.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = E-mailadres wizigje

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Syngronisaasje is ynskeakele
signup-confirmed-sync-success-banner = { -product-mozilla-account } befêstige
signup-confirmed-sync-button = Start mei browsen
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Jo wachtwurden, betellingsmetoaden, adressen, blêdwizers, skiednis en mear, kinne oeral syngronisearre wurde wêr’t jo { -brand-firefox } brûke.
signup-confirmed-sync-description-v2 = Jo wachtwurden, adressen, blêdwizers, skiednis en mear, kinne oeral syngronisearre wurde wêr’t jo { -brand-firefox } brûke.
signup-confirmed-sync-add-device-link = Noch in apparaat tafoegje
signup-confirmed-sync-manage-sync-button = Syngronisaasje beheare
signup-confirmed-sync-set-password-success-banner = Syngronisaasjewachtwurd oanmakke
