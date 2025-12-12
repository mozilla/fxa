# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Nýr kóði var sendur á tölvupóstfangið þitt.
resend-link-success-banner-heading = Nýr tengill var sendur á tölvupóstfangið þitt.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Bættu { $accountsEmail } við tengiliðina þína til að tryggja hnökralausa afhendingu.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Loka borða
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } verða endurnefndir { -product-mozilla-accounts } þann 1. nóvember
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Þú munt samt skrá þig inn með sama notandanafni og lykilorði og það eru engar aðrar breytingar á hugbúnaðnum sem þú notar.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Við höfum endurnefnt { -product-firefox-accounts }-reikninga sem { -product-mozilla-accounts }-reikninga. Þú munt samt skrá þig inn með sama notandanafni og lykilorði og það eru engar aðrar breytingar á hugbúnaðnum sem þú notar.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Kanna nánar
# Alt text for close banner image
brand-close-banner =
    .alt = Loka borða
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m-táknmerki

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Til baka
button-back-title = Til baka

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Sækja og halda áfram
    .title = Sækja og halda áfram
recovery-key-pdf-heading = Endurheimtulykill reiknings
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Útbúinn: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Endurheimtulykill reiknings
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Þessi lykill gerir þér kleift að endurheimta dulrituð vafragögn (þar á meðal lykilorð, bókamerki og vafurferil) ef þú gleymir lykilorðinu þínu. Geymdu hann á stað sem þú manst eftir.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Staðir til að geyma lykilinn þinn
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Frekari upplýsingar um endurheimtulykilinn þinn
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Því miður kom upp vandamál við að sækja endurheimtulykilinn þinn.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Fáðu meira frá { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Fáðu nýjustu fréttir af okkur og upplýsingar um hugbúnað
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Snemmbúinn aðgangur til að prófa nýjan hugbúnað
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Aðvaranir um aðgerðir til að endurheimta internetið

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Sótt
datablock-copy =
    .message = Afritað
datablock-print =
    .message = Prentað

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Afritað

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region } { $country } (áætlað)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (áætlað)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (áætlað)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (áætlað)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Óþekkt staðsetning
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } á { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-vistfang: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Lykilorð
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Endurtaka lykilorð
form-password-with-inline-criteria-signup-submit-button = Búa til reikning
form-password-with-inline-criteria-reset-new-password =
    .label = Nýtt lykilorð
form-password-with-inline-criteria-confirm-password =
    .label = Staðfestu lykilorð
form-password-with-inline-criteria-reset-submit-button = Búðu til nýtt lykilorð
form-password-with-inline-criteria-match-error = Lykilorð passa ekki
form-password-with-inline-criteria-sr-too-short-message = Lykilorð verður að innihalda að minnsta kosti 8 stafi.
form-password-with-inline-criteria-sr-not-email-message = Lykilorð má ekki innihalda tölvupóstfangið þitt.
form-password-with-inline-criteria-sr-not-common-message = Lykilorð má ekki vera algengt lykilorð.
form-password-with-inline-criteria-sr-requirements-met = Uppgefna lykilorðið uppfyllir allar kröfur um lykilorð.
form-password-with-inline-criteria-sr-passwords-match = Uppgefin lykilorð passa saman.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Þessi reitur er nauðsynlegur

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Settu inn { $codeLength }-talna kóða til að halda áfram
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Settu inn { $codeLength }-stafa kóða til að halda áfram

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Endurheimtulykill fyrir { -brand-firefox }-reikning
get-data-trio-title-backup-verification-codes = Varaauðkenningarkóðar
get-data-trio-download-2 =
    .title = Sækja
    .aria-label = Sækja
get-data-trio-copy-2 =
    .title = Afrita
    .aria-label = Afrita
get-data-trio-print-2 =
    .title = Prenta
    .aria-label = Prenta

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Aðvörun
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Athugaðu
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Aðvörun
authenticator-app-aria-label =
    .aria-label = Auðkenningarforrit
backup-codes-icon-aria-label-v2 =
    .aria-label = Varaauðkenningarkóðar virkjaðir
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Varaauðkenningarkóðar óvirkir
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Endurheimtu-SMS virkt
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Endurheimtu-SMS óvirkt
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadískur fáni
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Merkja
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Tókst
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Virkt
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Loka skilaboðum
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kóði
error-icon-aria-label =
    .aria-label = Villa
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Upplýsingar
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Bandarískur fáni

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Tölva og farsími með brostin hjörtu
hearts-verified-image-aria-label =
    .aria-label = Tölva, farsími og spjaldtölva með hjörtu sem slá
signin-recovery-code-image-description =
    .aria-label = Skjal sem inniheldur falinn texta.
signin-totp-code-image-label =
    .aria-label = Tæki með falinn 6-stafa kóða.
confirm-signup-aria-label =
    .aria-label = Umslag sem inniheldur tengil
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Skýringarmynd til að tákna endurheimtulykil reiknings.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Skýringarmynd til að tákna endurheimtulykil reiknings.
password-image-aria-label =
    .aria-label = Myndskreyting sem táknar að setja inn lykilorð.
lightbulb-aria-label =
    .aria-label = Myndskreyting sem táknar að búa til vísbendingu fyrir geymslu.
email-code-image-aria-label =
    .aria-label = Myndskreyting sem táknar tölvupóst sem inniheldur kóða.
recovery-phone-image-description =
    .aria-label = Farsímatæki sem fær kóða með textaskilaboðum.
recovery-phone-code-image-description =
    .aria-label = Kóði móttekinn í farsíma.
backup-recovery-phone-image-aria-label =
    .aria-label = Farsímatæki með SMS textaskilaboðum
backup-authentication-codes-image-aria-label =
    .aria-label = Skjár tækis með kóða

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Þú hefur skráð inn á { -brand-firefox }.
inline-recovery-key-setup-create-header = Gerðu reikninginn þinn öruggan
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Hefurðu tíma aflögu til að vernda gögnin þín?
inline-recovery-key-setup-info = Búðu til endurheimtulykil fyrir reikninginn svo þú getir endurheimt samstilltu vafragögnin þín ef þú gleymir lykilorðinu þínu.
inline-recovery-key-setup-start-button = Útbúðu endurheimtulykil reiknings
inline-recovery-key-setup-later-button = Gera það seinna

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Fela lykilorð
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Birta lykilorð
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Lykilorðið þitt er nú sýnilegt á skjánum.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Lykilorðið þitt er núna falið.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Lykilorðið þitt er nú sýnilegt á skjánum.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Lykilorðið þitt er núna falið.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Veldu land
input-phone-number-enter-number = Settu inn símanúmer
input-phone-number-country-united-states = Bandaríkin
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Til baka

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Tengill til að endurstilla lykilorð er skemmdur
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Staðfestingartengill er skemmdur
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Skemmdur tengill
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Tengilinn sem þú smelltir á vantaði stafi og gæti hafa skemmst í meðförum póstforritsins þíns. Afritaðu varlega slóð tengilsins og prófaðu aftur.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Fá nýjan tengil

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Muna lykilorðið þitt?
# link navigates to the sign in page
remember-password-signin-link = Skrá inn

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Aðallykilorð hefur þegar verið staðfest
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Innskráning hefur þegar verið staðfest
confirmation-link-reused-message = Þessi staðfestingartengill hefur þegar verið notaður, og er aðeins hægt að nota einu sinni.

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Röng beiðni

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Þú þarft þetta lykilorð til að fá aðgang að dulrituðu gögnum sem þú geymir hjá okkur.
password-info-balloon-reset-risk-info = Endurstilling þýðir að mögulega tapast gögn eins og lykilorð og bókamerki.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = Að minnsta kosti 8 stafir
password-strength-inline-not-email = Ekki tölvupóstfangið þitt
password-strength-inline-not-common = Ekki algengt lykilorð
password-strength-inline-confirmed-must-match = Staðfesting passar við nýja lykilorðið

## Notification Promo Banner component

account-recovery-notification-cta = Búa til
account-recovery-notification-header-value = Ekki tapa gögnunum þínum ef þú gleymir lykilorðinu þínu
account-recovery-notification-header-description = Búðu til endurheimtulykil fyrir reikninginn svo þú getir endurheimt samstilltu vafragögnin þín ef þú gleymir lykilorðinu þínu.
recovery-phone-promo-cta = Bæta við endurheimtusímanúmeri
promo-banner-dismiss-button =
    .aria-label = Hunsa borða

## Ready component

ready-complete-set-up-instruction = Ljúktu uppsetningunni með því að setja inn nýja lykilorðið á hinum { -brand-firefox }-tækjunum þínum.
manage-your-account-button = Sýslaðu með reikninginn þinn
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Nú geturðu farið að nota { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Þú ert nú tilbúin/n til að nota stillingar reikningsins
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Aðgangurinn þinn er tilbúinn!
ready-continue = Halda áfram
sign-in-complete-header = Innskráning staðfest
sign-up-complete-header = Reikningur staðfestur
primary-email-verified-header = Aðalpóstfang staðfest

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Staðir til að geyma lykilinn þinn:
flow-recovery-key-download-storage-ideas-folder-v2 = Mappa á öruggu tæki
flow-recovery-key-download-storage-ideas-cloud = Traust skýjageymsla
flow-recovery-key-download-storage-ideas-print-v2 = Prentað eintak
flow-recovery-key-download-storage-ideas-pwd-manager = Lykilorðaumsýsla

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Bættu við vísbendingu til að hjálpa þér að finna lykilinn þinn
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Þessi vísbending ætti að hjálpa þér að muna hvar þú geymir endurheimtarlykilinn þinn. Við getum sýnt þér hana við endurstillingu lykilorðsins til að geta endurheimt gögnin þín.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Settu inn vísbendingu (valfrjálst)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Ljúka
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Vísbendingin verður að innihalda færri en 255 stafi.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Vísbendingin má ekki innihalda óörugga unicode-stafi. Aðeins bókstafir, tölustafir, greinarmerki og tákn eru leyfð.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Aðvörun
password-reset-chevron-expanded = Fella aðvörun saman
password-reset-chevron-collapsed = Fella út aðvörun
password-reset-data-may-not-be-recovered = Ekki er víst að vafragögnin þín verði endurheimt
password-reset-previously-signed-in-device-2 = Ertu með tæki þar sem þú skráðir þig áður inn?
password-reset-data-may-be-saved-locally-2 = Gögn vafrans þíns gætu verið vistuð á því tæki. Endurstilltu lykilorðið þitt og skráðu þig síðan þar inn til að endurheimta og samstilla gögnin þín.
password-reset-no-old-device-2 = Ertu með nýtt tæki en hefur ekki aðgang að neinu af þínum eldri tækjum?
password-reset-encrypted-data-cannot-be-recovered-2 = Því miður er ekki hægt að endurheimta dulkrituðu vafragögnin þín af { -brand-firefox } netþjónum.
password-reset-warning-have-key = Ertu með endurheimtulykil reiknings?
password-reset-warning-use-key-link = Notaðu það núna til að endurstilla lykilorðið þitt og halda gögnunum þínum

## Alert Bar

alert-bar-close-message = Loka skilaboðum

## User's avatar

avatar-your-avatar =
    .alt = Auðkennismyndin þín
avatar-default-avatar =
    .alt = Sjálfgefin auðkennismynd

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } hugbúnaður
bento-menu-tagline = Fleiri vörur frá { -brand-mozilla } sem vernda friðhelgi þína
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox }-vafri fyrir vinnutölvur
bento-menu-firefox-mobile = { -brand-firefox }-vafri fyrir farsíma
bento-menu-made-by-mozilla = Gert af { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Fáðu þér { -brand-firefox } í farsíma eða spjaldtölvu
connect-another-find-fx-mobile-2 = Finndu { -brand-firefox } á { -google-play } og { -app-store }.

## Connected services section

cs-heading = Tengdar þjónustur
cs-description = Allt það sem þú ert að nota og skráðir þig á.
cs-cannot-refresh =
    Því miður kom upp vandamál við að endurlesa listann yfir
    tengdar þjónustur.
cs-cannot-disconnect = Biðlaraforrit fannst ekki, get ekki aftengst
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Skráð út af { $service }
cs-refresh-button =
    .title = Endurnýja tengdar þjónustur
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Atriði sem vantar eða eru tvítekin?
cs-disconnect-sync-heading = Aftengjast frá Sync-samstillingu

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Vafragögn verða áfram á <span>{ $device }</span>,
    en munu ekki lengur verða samstillt við reikninginn þinn.
cs-disconnect-sync-reason-3 = Hver er aðalástæðan fyrir því að aftengja <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Tækið er:
cs-disconnect-sync-opt-suspicious = Grunsamlegt
cs-disconnect-sync-opt-lost = Týnt eða stolið
cs-disconnect-sync-opt-old = Gamalt eða skipt út
cs-disconnect-sync-opt-duplicate = Tvítekið
cs-disconnect-sync-opt-not-say = Vil helst ekki segja

##

cs-disconnect-advice-confirm = Allt í lagi, ég skil
cs-disconnect-lost-advice-heading = Týnt eða stolið tæki aftengt
cs-disconnect-lost-advice-content-3 = Þar sem tækið þitt týndist eða því var stolið, til að halda upplýsingum þínum öruggum, ættirðu að breyta lykilorðinu þínu fyrir { -product-mozilla-account } í stillingum reikningsins þíns. Þú ættir líka að leita að upplýsingum frá framleiðanda tækisins um hvernig hægt sé að eyða gögnunum þínum úr fjarlægð.
cs-disconnect-suspicious-advice-heading = Grunsamlegt tæki aftengt
cs-disconnect-suspicious-advice-content-2 = Ef ótengda tækið er örugglega grunsamlegt, þá ættirðu til að halda upplýsingum þínum öruggum að breyta { -product-mozilla-account } lykilorðinu þínu í stillingum reikningsins þíns. Þú ættir líka að breyta öllum öðrum lykilorðum sem þú hefur vistað í { -brand-firefox } með því að skrifa about:logins á veffangastikuna.
cs-sign-out-button = Útskráning

## Data collection section

dc-heading = Gagnasöfnun og upplýsingar um notkun
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-vafri
dc-subheader-content-2 = Leyfa { -product-mozilla-accounts } að senda tækni- og samskiptagögn til { -brand-mozilla }.
dc-subheader-ff-content = Til að endurskoða eða uppfæra tækni- og samskiptagagnastillingar { -brand-firefox }-vafrans skaltu opna { -brand-firefox } stillingar og fara í Friðhelgi og öryggi.
dc-opt-out-success-2 = Tókst að afþakka. { -product-mozilla-accounts } mun ekki senda tækni- eða samskiptagögn til { -brand-mozilla }.
dc-opt-in-success-2 = Takk! Að deila þessum gögnum hjálpar okkur að bæta { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Því miður kom upp vandamál við að breyta kjörstillingum þínum varðandi gagnasöfnun
dc-learn-more = Frekari upplýsingar

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }-valmynd
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Skráð/ur inn sem
drop-down-menu-sign-out = Skrá út
drop-down-menu-sign-out-error-2 = Því miður, upp kom vandamál við að skrá þig út

## Flow Container

flow-container-back = Til baka

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Settu aftur inn lykilorðið þitt til öryggis
flow-recovery-key-confirm-pwd-input-label = Settu inn lykilorðið þitt
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Útbúðu endurheimtulykil reiknings
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Útbúðu nýjan endurheimtulykil fyrir reikninginn

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Endurheimtulykill reiknings búinn til — Sæktu hann núna og geymdu
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Þessi lykill gerir þér kleift að endurheimta gögnin þín ef þú gleymir lykilorðinu þínu. Sæktu hann núna og geymdu einhvers staðar þar sem þú manst - þú munt ekki geta farið aftur á þessa síðu.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Halda áfram án þess að sækja

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Endurheimtulykill reiknings útbúinn

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Útbúðu endurheimtulykil til að nota ef þú gleymir lykilorðinu þínu
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = breyttu endurheimtulykli reikningsins þíns
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Við dulritum vafragögn – lykilorð, bókamerki og fleira. Það er frábært fyrir friðhelgi einkalífsins, en þú gætir tapað gögnunum þínum ef þú gleymir lykilorðinu þínu.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Þess vegna er svo mikilvægt að búa til endurheimtulykil fyrir reikning - þú getur notað lykilinn þinn til að fá gögnin þín til baka.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Hefjast handa
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Hætta við

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Tengstu við auðkenningarforritið þitt
flow-setup-2fa-cant-scan-qr-button = Geturðu ekki skannað QR-kóða?
flow-setup-2fa-manual-key-heading = Settu kóðann inn handvirkt
flow-setup-2fa-scan-qr-instead-button = Skanna frekar QR-kóða?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Frekari upplýsingar um auðkenningarforrit
flow-setup-2fa-button = Halda áfram
flow-setup-2fa-step-2-instruction = <strong>Skref 2:</strong> Sláðu inn kóðann úr auðkenningarforritinu þínu.
flow-setup-2fa-input-label = Settu inn 6-stafa kóða

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Veldu aðferð fyrir endurheimtingu
flow-setup-2fa-backup-choice-phone-title = Endurheimtusímanúmer
flow-setup-2fa-backup-choice-phone-badge = Auðveldast
flow-setup-2fa-backup-choice-code-title = Varaauðkenningarkóðar
flow-setup-2fa-backup-choice-code-badge = Öruggast

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-code-input = Settu inn 10-stafa kóða
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Ljúka

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Vista varaauðkenningarkóða
flow-setup-2fa-backup-code-dl-button-continue = Halda áfram

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Settu inn staðfestingarkóða
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Sex stafa kóði var sendur til <span>{ $phoneNumber }</span> með SMS. Þessi kóði rennur út eftir 5 mínútur.
flow-setup-phone-confirm-code-input-label = Settu inn 6-stafa kóða
flow-setup-phone-confirm-code-button = Staðfesta
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Útrunninn kóði?
flow-setup-phone-confirm-code-resend-code-button = Senda kóða aftur
flow-setup-phone-confirm-code-resend-code-success = Kóði sendur
flow-setup-phone-confirm-code-success-message-v2 = Endurheimtusímanúmeri bætt við
flow-change-phone-confirm-code-success-message = Endurheimtusímanúmeri breytt

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Staðfestu símanúmerið þitt
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Þú munt fá SMS frá { -brand-mozilla } með kóða til að staðfesta númerið þitt. Ekki deila þessum kóða með neinum.
flow-setup-phone-submit-number-legal = Með því að gefa upp símanúmerið þitt, samþykkir þú að við geymum það svo við getum sent þér skilaboð einungis til að staðfesta reikninginn. Gjöld vegna skilaboða og gagnamagns gætu átt við.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Senda kóða

## HeaderLockup component, the header in account settings

header-menu-open = Loka valmynd
header-menu-closed = Valmynd vefleiðsögu
header-back-to-top-link =
    .title = Til baka efst
header-title-2 = { -product-mozilla-account }
header-help = Hjálp

## Linked Accounts section

la-heading = Tengdir reikningar
la-description = Þú hefur heimilað aðgang að eftirfarandi reikningum.
la-unlink-button = Aftengja
la-unlink-account-button = Aftengja
la-set-password-button = Setja lykilorð
la-unlink-heading = Aftengja frá utanaðkomandi reikningi
la-unlink-content-3 = Ertu viss um að þú viljir aftengja reikninginn þinn? Að aftengja reikninginn þinn skráir þig ekki sjálfkrafa út úr tengdum þjónustum. Til að gera það þarftu að skrá þig handvirkt út úr hlutanum 'Tengd þjónusta'.
la-unlink-content-4 = Áður en þú aftengir reikninginn þinn verður þú að setja lykilorð. Án lykilorðs er engin leið fyrir þig að skrá þig inn eftir að hafa aftengt reikninginn þinn.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Loka
modal-cancel-button = Hætta við
modal-default-confirm-button = Staðfesta

## Modal Verify Session

mvs-verify-your-email-2 = Staðfestu tölvupóstfangið þitt
mvs-enter-verification-code-2 = Settu inn staðfestingarkóðann þinn
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Settu inn staðfestingarkóðann sem sendur var til <email>{ $email }</email> innan 5 mínútna.
msv-cancel-button = Hætta við
msv-submit-button-2 = Staðfesta

## Settings Nav

nav-settings = Stillingar
nav-profile = Notandasnið
nav-security = Öryggi
nav-connected-services = Tengdar þjónustur
nav-data-collection = Gagnasöfnun og upplýsingar um notkun
nav-paid-subs = Greiddar áskriftir
nav-email-comm = Tölvupóstsamskipti

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Vandamál kom upp við að skipta um varaauðkenningarkóðana þína
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Vandamál kom upp við að útbúa varaauðkenningarkóðana þína
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Varaauðkenningarkóðar uppfærðir

## Avatar change page

avatar-page-title =
    .title = Auðkennismynd
avatar-page-add-photo = Bæta við mynd
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Taka mynd
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Fjarlægja mynd
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Taka mynd aftur
avatar-page-cancel-button = Hætta við
avatar-page-save-button = Vista
avatar-page-saving-button = Vista…
avatar-page-zoom-out-button =
    .title = Minnka aðdrátt
avatar-page-zoom-in-button =
    .title = Auka aðdrátt
avatar-page-rotate-button =
    .title = Snúa
avatar-page-camera-error = Ekki tókst að frumstilla myndavélina
avatar-page-new-avatar =
    .alt = ný auðkennismynd
avatar-page-file-upload-error-3 = Vandamál kom upp við að senda inn auðkennismyndina þína
avatar-page-delete-error-3 = Vandamál kom upp við að eyða auðkennismyndinni þinni
avatar-page-image-too-large-error-2 = Stærð myndarinnar er of mikil til að hægt sé að senda hana inn

## Password change page

pw-change-header =
    .title = Breyta lykilorði
pw-8-chars = Að minnsta kosti 8 stafir
pw-not-email = Ekki tölvupóstfangið þitt
pw-change-must-match = Nýtt lykilorð passar við staðfestingu
pw-commonly-used = Ekki algengt lykilorð
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Vertu öruggur - ekki endurnýta lykilorð. Sjáðu fleiri ráð til að <linkExternal>búa til sterk lykilorð</linkExternal>.
pw-change-cancel-button = Hætta við
pw-change-save-button = Vista
pw-change-forgot-password-link = Gleymt lykilorð?
pw-change-current-password =
    .label = Settu inn núverandi lykilorð
pw-change-new-password =
    .label = Settu inn nýja lykilorðið
pw-change-confirm-password =
    .label = Staðfestu nýja lykilorðið
pw-change-success-alert-2 = Lykilorð uppfært

## Password create page

pw-create-header =
    .title = Búa til lykilorð
pw-create-success-alert-2 = Lykilorð stillt
pw-create-error-2 = Því miður kom upp vandamál við að stilla lykilorðið þitt

## Delete account page

delete-account-header =
    .title = Eyða reikningi
delete-account-step-1-2 = Skref 1 af 2
delete-account-step-2-2 = Skref 2 af 2
delete-account-confirm-title-4 = Þú gætir hafa tengt { -product-mozilla-account } við eina eða fleiri { -brand-mozilla }-þjónustur sem tryggja öryggi þitt og afköst á vefnum:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Samstilli { -brand-firefox }-gögn
delete-account-product-firefox-addons = { -brand-firefox }-viðbætur
delete-account-acknowledge = Staðfestu að þú sért upplýst/ur um að með því að eyða reikningnum þínum:
delete-account-chk-box-2 =
    .label = Þú gætir glatað vistuðum upplýsingum og eiginleikum í { -brand-mozilla } þjónustum
delete-account-chk-box-3 =
    .label = Endurvirkjun með þessum tölvupósti gæti ekki endurheimt upplýsingar sem þú hefur vistað
delete-account-chk-box-4 =
    .label = Öllum forritsaukum og þemum sem þú gefur út á addons.mozilla.org verður eytt
delete-account-continue-button = Halda áfram
delete-account-password-input =
    .label = Settu inn lykilorð
delete-account-cancel-button = Hætta við
delete-account-delete-button-2 = Eyða

## Display name page

display-name-page-title =
    .title = Birtingarnafn
display-name-input =
    .label = Settu inn birtingarnafn
submit-display-name = Vista
cancel-display-name = Hætta við
display-name-update-error-2 = Vandamál kom upp við að uppfæra birtingarnafnið þitt
display-name-success-alert-2 = Birtingarnafn uppfært

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nýleg virkni reiknings
recent-activity-account-create-v2 = Reikningur búinn til
recent-activity-account-disable-v2 = Reikningur gerður óvirkur
recent-activity-account-enable-v2 = Reikningur gerður virkur
recent-activity-account-login-v2 = Beðið um innskráningu á reikning
recent-activity-account-reset-v2 = Beðið um endurstillingu lykilorðs
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Endursendingar tölvupósts hreinsaðar
recent-activity-account-login-failure = Tilraun til innskráningar á reikning mistókst
recent-activity-account-two-factor-added = Tveggja-þrepa auðkenning virkjuð
recent-activity-account-two-factor-requested = Beðið um tveggja-þrepa auðkenningu
recent-activity-account-two-factor-failure = Tveggja-þrepa auðkenning mistókst
recent-activity-account-two-factor-success = Tveggja-þrepa auðkenning tókst
recent-activity-account-two-factor-removed = Tveggja-þrepa auðkenning fjarlægð
recent-activity-account-password-reset-requested = Endurstillt lykilorð samkvæmt beiðni frá reikningi
recent-activity-account-password-reset-success = Endurstilling lykilorðs reiknings tókst
recent-activity-account-recovery-key-added = Endurheimtulykill reiknings virkur
recent-activity-account-recovery-key-verification-failure = Sannvottun endurheimtulykils reiknings mistókst
recent-activity-account-recovery-key-verification-success = Sannvottun endurheimtulykils reiknings tókst
recent-activity-account-recovery-key-removed = Endurheimtulykill reiknings fjarlægður
recent-activity-account-password-added = Nýju lykilorði bætt við
recent-activity-account-password-changed = Lykilorði breytt
recent-activity-account-secondary-email-added = Aukapóstfangi bætt við
recent-activity-account-secondary-email-removed = Aukatölvupóstfang fjarlægt
recent-activity-account-emails-swapped = Skipt var um aðal- og aukatölvupóstföng
recent-activity-session-destroy = Skráð út úr lotu
recent-activity-account-recovery-phone-send-code = Kóði endurheimtarsíma sendur
recent-activity-account-recovery-phone-setup-complete = Uppsetningu endurheimtusíma lokið
recent-activity-account-recovery-phone-signin-complete = Innskráningu með endurheimtusíma lokið
recent-activity-account-recovery-phone-signin-failed = Innskráning með endurheimtusíma mistókst
recent-activity-account-recovery-phone-removed = Endurheimtusímanúmer fjarlægt
recent-activity-account-recovery-codes-replaced = Skipt um endurheimtukóða
recent-activity-account-recovery-codes-created = Endurheimtukóði útbúinn
recent-activity-account-recovery-codes-signin-complete = Innskráningu með endurheimtukóða lokið
recent-activity-password-reset-otp-sent = Staðfestingarkóði fyrir endurstillingu lykilorðs sendur
recent-activity-password-reset-otp-verified = Staðfestingarkóði fyrir endurstillingu lykilorðs staðfestur
recent-activity-must-reset-password = Beðið er um endurstillingu lykilorðs
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Önnur virkni á reikningi

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Endurheimtulykill reiknings
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Til baka í stillingar

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Fjarlægja endurheimtusímanúmer
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Þetta mun fjarlægja <strong>{ $formattedFullPhoneNumber }</strong> sem endurheimtusímanúmer.
settings-recovery-phone-remove-recommend = Við mælum með að þú haldir þig við þessa aðferð vegna þess að hún er auðveldari en að vista vara-auðkenningarkóða.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Ef þú eyðir þessu skaltu ganga úr skugga um að þú sért enn með vistaða vara-auðkenningarkóða. <linkExternal>Bera saman endurheimtuaðferðir</linkExternal>
settings-recovery-phone-remove-button = Fjarlægja símanúmer
settings-recovery-phone-remove-cancel = Hætta við
settings-recovery-phone-remove-success = Endurheimtusímanúmer fjarlægt

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Bæta við endurheimtusímanúmeri
page-change-recovery-phone = Skipta um endurheimtusímanúmer
page-setup-recovery-phone-back-button-title = Til baka í stillingar
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Skipta um símanúmer

## Add secondary email page

add-secondary-email-step-1 = Skref 1 af 2
add-secondary-email-error-2 = Vandamál kom upp við að búa til þennan tölvupóst
add-secondary-email-page-title =
    .title = Aukatölvupóstfang
add-secondary-email-enter-address =
    .label = Settu inn tölvupóstfang
add-secondary-email-cancel-button = Hætta við
add-secondary-email-save-button = Vista
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Ekki er hægt að nota tölvupósthulur sem aukapóstfang

## Verify secondary email page

add-secondary-email-step-2 = Skref 2 af 2
verify-secondary-email-page-title =
    .title = Aukatölvupóstfang
verify-secondary-email-verification-code-2 =
    .label = Settu inn staðfestingarkóðann þinn
verify-secondary-email-cancel-button = Hætta við
verify-secondary-email-verify-button-2 = Staðfesta
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Settu inn staðfestingarkóðann sem sendur var til <strong>{ $email }</strong> innan 5 mínútna.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Það tókst að bæta við { $email }

##

# Link to delete account on main Settings page
delete-account-link = Eyða reikningi
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Innskráning tókst. { -product-mozilla-account } og tengd gögn verða áfram virk.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = Fáðu fría yfirferð

## Profile section

profile-heading = Notandasnið
profile-picture =
    .header = Mynd
profile-display-name =
    .header = Birtingarnafn
profile-primary-email =
    .header = Aðaltölvupóstfang

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Skref { $currentStep } af { $numberOfSteps }.

## Security section of Setting

security-heading = Öryggi
security-password =
    .header = Lykilorð
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Búið til { $date }
security-not-set = Ekki stillt
security-action-create = Búa til
security-set-password = Settu lykilorð til að samstilla og nota ákveðna öryggiseiginleika reikningsins.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Skoða nýlega virkni á reikningi
signout-sync-header = Lotan er útrunnin
signout-sync-session-expired = Því miður, eitthvað fór úrskeiðis. Skráðu þig út í gegnum valmynd vafrans og reyndu aftur.

## SubRow component

tfa-row-backup-codes-title = Varaauðkenningarkóðar
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Engir kóðar til taks
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kóði eftir
       *[other] { $numCodesAvailable } kóðar eftir
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Búa til nýja kóða
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Bæta við
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Þetta er öruggasta endurheimtuaðferðin ef þú getur ekki notað farsímann þinn eða auðkenningarforritið.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Endurheimtusímanúmer
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Engu símanúmeri bætt við
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Breyta
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Bæta við
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Fjarlægja
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Fjarlægja endurheimtusímanúmer
tfa-row-backup-phone-delete-restriction-v2 = Ef þú vilt fjarlægja endurheimtusímanúmer skaltu bæta við auðkenningarkóðum öryggisafritunar eða slökkva fyrst á tveggja-þrepa auðkenningu til að forðast það að læsast úti á reikningnum þínum.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Þetta er auðveldasta endurheimtuaðferðin ef þú getur ekki notað auðkenningarforritið þitt.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Kynntu þér áhættu varðandi útskipti á SIM-kortum

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Slökkva á
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Kveikja á
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Sendi inn…
switch-is-on = virkt
switch-is-off = óvirkt

## Sub-section row Defaults

row-defaults-action-add = Bæta við
row-defaults-action-change = Breyta
row-defaults-action-disable = Gera óvirkt
row-defaults-status = Ekkert

## Account recovery key sub-section on main Settings page

rk-header-1 = Endurheimtulykill reiknings
rk-enabled = Virkjað
rk-not-set = Ekki stillt
rk-action-create = Búa til
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Breyta
rk-action-remove = Fjarlægja
rk-key-removed-2 = Endurheimtulykill reiknings fjarlægður
rk-cannot-remove-key = Ekki var hægt að fjarlægja endurheimtulykil reikningsins þíns.
rk-refresh-key-1 = Endurlesa endurheimtulykil reiknings
rk-content-explain = Endurheimtu gögnin þín ef þú gleymir lykilorðinu þínu.
rk-cannot-verify-session-4 = Því miður, upp kom vandamál við að sannreyna setuna þína
rk-remove-modal-heading-1 = Fjarlægja endurheimtulykil reiknings?
rk-remove-modal-content-1 =
    Ef þú endurstillir lykilorðið þitt, munt þú ekki geta
    notað endurheimtulykil reikningsins þíns til að fá aðgang að gögnunum þínum. Þú getur ekki afturkallað þessa aðgerð.
rk-remove-error-2 = Ekki var hægt að fjarlægja endurheimtulykil reikningsins þíns
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Eyða endurheimtulykli reiknings

## Secondary email sub-section on main Settings page

se-heading = Aukatölvupóstfang
    .header = Aukatölvupóstfang
se-cannot-refresh-email = Því miður kom upp vandamál við að endurlesa þetta tölvupóstfang.
se-cannot-resend-code-3 = Vandamál kom upp við að endursenda staðfestingarkóðann
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } er núna aðalpóstfangið þitt
se-set-primary-error-2 = Því miður kom upp vandamál við að breyta aðaltölvupóstfanginu þínu
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Það tókst að eyða { $email }
se-delete-email-error-2 = Því miður kom upp vandamál við að eyða þessu tölvupóstfangi
se-verify-session-3 = Þú þarft að staðfesta fyrirliggjandi setuna þína til að framkvæma þessa aðgerð
se-verify-session-error-3 = Því miður, upp kom vandamál við að sannreyna setuna þína
# Button to remove the secondary email
se-remove-email =
    .title = Fjarlægja tölvupóstfang
# Button to refresh secondary email status
se-refresh-email =
    .title = Endurlesa tölvupóstfang
se-unverified-2 = óstaðfest
se-resend-code-2 =
    Staðfesting nauðsynleg. <button>Senda staðfestingarkóða aftur</button>
    ef hann er ekki í pósthólfinu þínu eða ruslpóstmöppunni.
# Button to make secondary email the primary
se-make-primary = Gera að aðal
se-default-content = Fáðu aðgang að reikningnum þínum ef þú getur ekki skráð þig inn á aðaltölvupóstfangið þitt.
se-content-note-1 =
    Athugaðu: aukatölvupóstfang mun ekki endurheimta upplýsingarnar þínar - þú
    munt þurfa <a>endurheimtulykil reikningsins</a> til þess.
# Default value for the secondary email
se-secondary-email-none = Ekkert

## Two Step Auth sub-section on Settings main page

tfa-row-header = Tveggja-þrepa auðkenning
tfa-row-enabled = Virkjað
tfa-row-disabled-status = Óvirkt
tfa-row-action-add = Bæta við
tfa-row-action-disable = Gera óvirkt
tfa-row-button-refresh =
    .title = Endurnýja tveggja-þrepa auðkenningu
tfa-row-cannot-refresh =
    Því miður kom upp vandamál við að endurnýja tveggja-þrepa
    auðkenningu.
tfa-row-enabled-description = Reikningurinn þinn er varinn með tveggja-þrepa auðkenningu. Þú þarft að setja einu sinni inn aðgangskóða úr auðkenningarforritinu þínu þegar þú skráir þig inn á { -product-mozilla-account } þinn.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Hvernig þetta verndar reikninginn þinn
tfa-row-disabled-description-v2 = Hjálpaðu til við að tryggja öryggi reikningsins þíns með því að nota auðkenningararforrit frá utanaðkomandi aðila sem annað þrep til að skrá þig inn.
tfa-row-cannot-verify-session-4 = Því miður, upp kom vandamál við að sannreyna setuna þína
tfa-row-disable-modal-heading = Gera tveggja-þrepa auðkenningu óvirka?
tfa-row-disable-modal-confirm = Gera óvirkt
tfa-row-disable-modal-explain-1 =
    Þú munt ekki geta afturkallað þessa aðgerð. Þú hefur
    einnig möguleika á að <linkExternal>skipta um varaauðkenningarkóðana þína</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Tveggja-þrepa auðkenning óvirk
tfa-row-cannot-disable-2 = Ekki var hægt að gera tveggja-þrepa auðkenningu óvirka

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Með því að halda áfram, samþykkir þú:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Þjónustuskilmálar</mozSubscriptionTosLink> og <mozSubscriptionPrivacyLink>meðferð persónuupplýsinga</mozSubscriptionPrivacyLink> { -brand-mozilla } áskriftarþjónustunnar
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Þjónustuskilmálar</mozillaAccountsTos> og <mozillaAccountsPrivacy>persónuverndarstefna</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Með því að halda áfram samþykkir þú <mozillaAccountsTos>þjónustuskilmála</mozillaAccountsTos> og <mozillaAccountsPrivacy>persónuverndarstefnuna</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Eða
continue-with-google-button = Halda áfram með { -brand-google }
continue-with-apple-button = Halda áfram með { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Óþekktur reikningur
auth-error-103 = Rangt lykilorð
auth-error-105-2 = Ógildur staðfestingarkóði
auth-error-110 = Ógilt teikn
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Þú hefur prófað of oft. Reyndu aftur síðar.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Þú hefur prófað of oft. Reyndu aftur { $retryAfter }.
auth-error-125 = Lokað var á beiðnina af öryggisástæðum
auth-error-129-2 = Þú settir inn ógilt símanúmer. Yfirfarðu það og reyndu aftur.
auth-error-138-2 = Óstaðfest seta
auth-error-139 = Aukatölvupóstfang verður að vera frábrugðið tölvupóstfangi reikningsins þíns
auth-error-155 = TOTP-teikn fannst ekki
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Varaauðkenningarkóði fannst ekki
auth-error-159 = Ógildur endurheimtulykill reiknings
auth-error-183-2 = Ógildur eða útrunninn staðfestingarkóði
auth-error-202 = Eiginleiki ekki virkur
auth-error-203 = Kerfi er upptekið, reyndu aftur seinna
auth-error-206 = Get ekki búið til lykilorð, lykilorð er þegar stillt
auth-error-214 = Endurheimtusímanúmer er þegar til staðar
auth-error-215 = Endurheimtusímanúmer er ekki til staðar
auth-error-216 = Takmörkum textaskilaboða náð
auth-error-219 = Þetta símanúmer hefur verið skráð á of marga reikninga. Reyndu eitthvað annað númer.
auth-error-999 = Óvænt villa
auth-error-1001 = Hætt við tilraun til innskráningar
auth-error-1002 = Lota rann út. Skráðu þig inn til að halda áfram.
auth-error-1003 = Staðvært geymslurými eða vefkökur eru enn óvirkt
auth-error-1008 = Nýja lykilorðið þitt verður að vera frábrugðið
auth-error-1010 = Gerð er krafa um gilt lykilorð
auth-error-1011 = Krafist er gilds tölvupóstfangs
auth-error-1018 = Staðfestingarpósturinn þinn var endursendur. Rangt tölvupóstfang?
auth-error-1020 = Rangt skrifað tölvupóstfang? firefox.com er ekki gild tölvupóstþjónusta
auth-error-1031 = Þú verður að setja inn aldur þinn til að geta nýskráð þig
auth-error-1032 = Þú verður að setja inn gildan aldur til að geta nýskráð þig
auth-error-1054 = Ógildur tveggja-þrepa auðkenningarkóði
auth-error-1056 = Ógildur varaauðkenningarkóði
auth-error-1062 = Ógild endurbeining
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Rangt skrifað tölvupóstfang? { $domain } er ekki gild tölvupóstþjónusta
auth-error-1066 = Ekki er hægt að nota tölvupósthulur til að búa til reikning.
auth-error-1067 = Rangt skrifað tölvupóstfang?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Númer sem endar á { $lastFourPhoneNumber }
oauth-error-1000 = Eitthvað fór úrskeiðis. Lokaðu þessum flipa og prófaðu aftur.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Þú hefur skráð inn á { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Tölvupóstur staðfestur
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Innskráning staðfest
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Skráðu þig inn í þetta tilvik { -brand-firefox } til að ljúka uppsetningunni
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Skrá inn
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Enn að bæta við tækjum? Skráðu þig inn í { -brand-firefox } á öðru tæki til að ljúka uppsetningunni
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Skráðu þig inn í { -brand-firefox } á öðru tæki til að ljúka uppsetningunni
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Viltu fá flipana þína, bókamerki og lykilorð yfir í annað tæki?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Tengja annað tæki
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ekki núna
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Skráðu þig inn í { -brand-firefox } fyrir Android til að ljúka uppsetningunni
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Skráðu þig inn í { -brand-firefox } fyrir iOS til að ljúka uppsetningunni

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Heimild fyrir staðvært geymslurými og vefkökur eru nauðsynleg
cookies-disabled-enable-prompt-2 = Virkjaðu vefkökur og staðværar gagnageymslur í vafranum þínum til að fá aðgang að { -product-mozilla-account }-reikningum. Það mun virkja eiginleika á borð við að muna eftir þér á milli lota.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Reyna aftur
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Frekari upplýsingar

## Index / home page

index-header = Settu inn tölvupóstfangið þitt
index-sync-header = Haltu áfram á { -product-mozilla-account }
index-sync-subheader = Samstilltu lykilorðin þín, flipa og bókamerki alls staðar þar sem þú notar { -brand-firefox }.
index-relay-header = Útbúa tölvupósthulu
index-relay-subheader = Gefðu upp póstfangið sem þú vilt áframsenda á tölvupóst frá hulda póstinum þínum.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Halda áfram í { $serviceName }
index-subheader-default = Halda áfram í stillingar reiknings
index-cta = Nýskráðu þig eða skráðu þig inn
index-account-info = { -product-mozilla-account }-reikningur opnar einnig aðgang að öðrum persónuverndandi hugbúnaði frá { -brand-mozilla }.
index-email-input =
    .label = Settu inn tölvupóstfangið þitt
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Tókst að eyða reikningi
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Staðfestingarpósturinn þinn var endursendur. Rangt tölvupóstfang?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Úbbs! Við gátum ekki búið til endurheimtulykilinn þinn. Reyndu aftur síðar.
inline-recovery-key-setup-recovery-created = Endurheimtulykill reiknings útbúinn
inline-recovery-key-setup-download-header = Gerðu reikninginn þinn öruggan
inline-recovery-key-setup-download-subheader = Sæktu hann og og vistaðu núna
inline-recovery-key-setup-download-info = Geymdu þennan lykil einhvers staðar sem þú manst - þú munt ekki geta farið aftur á þessa síðu síðar.
inline-recovery-key-setup-hint-header = Til öryggis

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Hætta við uppsetningu
inline-totp-setup-continue-button = Halda áfram
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Bættu við öryggislagi fyrir reikninginn þinn með því að krefjast auðkenningarkóða frá einu af <authenticationAppsLink>þessum auðkenningarforritum</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Virkjaðu tveggja-þrepa auðkenningu <span>til að halda áfram í stillingar reikningsins</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Virkjaðu tveggja-þrepa auðkenningu <span>til að halda áfram í { $serviceName }</span>
inline-totp-setup-ready-button = Tilbúið
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Skannaðu auðkenningarkóðann <span>til að halda áfram í { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Settu kóðann inn handvirkt <span>til að halda áfram í { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Skannaðu auðkenningarkóðann <span>til að halda áfram í stillingar reikningsins</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Settu kóðann inn handvirkt <span>til að halda áfram í stillingar reikningsins</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Settu þennan leynilykil inn í auðkenningarforritið þitt. <toggleToQRButton>Skanna frekar QR-kóða?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Skannaðu QR-kóðann í auðkenningarforritinu þínu og settu síðan inn auðkenningarkóðann sem það gefur upp. <toggleToManualModeButton>Geturðu ekki skannað kóða?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Eftir að því er lokið, mun það byrja að útbúa auðkenningarkóða sem þú getur sett inn.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Auðkenningarkóði
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Auðkenningarkóði er nauðsynlegur
tfa-qr-code-alt = Notaðu kóðann { $code } til að setja upp tveggja-þrepa auðkenningu í þeim forritum sem styðja slíkt.

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Lagalegur fyrirvari
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Þjónustuskilmálar
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Meðferð persónuupplýsinga

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Meðferð persónuupplýsinga

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Þjónustuskilmálar

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Varstu að skrá þig inn á { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Já, samþykkja tæki
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Ef þetta varst ekki þú, <link>skaltu breyta lykilorðinu þínu</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Tæki tengt
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Þú ert núna að samstilla við: { $deviceFamily } á { $deviceOS }
pair-auth-complete-sync-benefits-text = Nú hefur þú aðgang að opnum flipum, lykilorðum og bókamerkjum á öllum tækjunum þínum.
pair-auth-complete-see-tabs-button = Sjá flipa frá samstilltum tækjum
pair-auth-complete-manage-devices-link = Sýsla með tæki

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Settu inn auðkenningarkóða <span>til að halda áfram í stillingar reikningsins</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Settu inn auðkenningarkóða <span>til að halda áfram í { $serviceName }</span>
auth-totp-instruction = Opnaðu auðkenningarforritið þitt og settu inn auðkenningarkóðann sem það gefur upp.
auth-totp-input-label = Settu inn 6-stafa kóða
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Staðfesta
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Auðkenningarkóða krafist

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Núna er krafist er samþykktar <span>frá hinu tækinu þínu</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Pörun tókst ekki
pair-failure-message = Uppsetningarferlinu var hætt.

## Pair index page

pair-sync-header = Samstilltu { -brand-firefox } við símann eða spjaldtölvuna
pair-cad-header = Tengdu { -brand-firefox } á öðru tæki
pair-already-have-firefox-paragraph = Ertu nú þegar með { -brand-firefox } á síma eða spjaldtölvu?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Samstilltu tækið þitt
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = eða sæktu
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Skannaðu til að sækja { -brand-firefox } fyrir farsíma, eða sendu þér <linkExternal>niðurhalstengil</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ekki núna
pair-take-your-data-message = Taktu flipana þína, bókamerki og lykilorð með þér hvert sem þú notar { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Hefjast handa
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-kóði

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Tæki tengt
pair-success-message-2 = Pörun tókst.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Staðfestu pörun <span>fyrir { $email }</span>
pair-supp-allow-confirm-button = Staðfestu pörun
pair-supp-allow-cancel-link = Hætta við

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Núna er krafist er samþykktar <span>frá hinu tækinu þínu</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Para með forriti
pair-unsupported-message = Notaðirðu myndavél stýrikerfisins? Þú verður að para innan úr { -brand-firefox }-forritinu.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Hinkraðu aðeins, þér verður endurbeint á viðurkennda forritið.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Settu inn endurheimtulykilinn þinn
account-recovery-confirm-key-instruction = Þessi lykill endurheimtir dulrituðu vafragögnin þín, eins og lykilorð og bókamerki, frá { -brand-firefox } netþjónum.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Settu inn 32-stafa endurheimtulykilinn þinn
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Vísbendingin þín er:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Halda áfram
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Finnurðu ekki endurheimtulykil reikningsins þíns?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Búðu til nýtt lykilorð
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Lykilorð stillt
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Því miður kom upp vandamál við að stilla lykilorðið þitt
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Nota endurheimtarlykil reiknings
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Lykilorðið þitt var endurstillt.
reset-password-complete-banner-message = Ekki gleyma að búa til nýjan endurheimtulykil í { -product-mozilla-account } stillingunum þínum til að koma í veg fyrir möguleg vandamál með innskráningu í framtíðinni.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } mun reyna að senda þig til baka til að nota tölvupósthulu eftir að þú skráir þig inn.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Settu inn 10-stafa kóða
confirm-backup-code-reset-password-confirm-button = Staðfesta
confirm-backup-code-reset-password-subheader = Settu inn varaauðkenningarkóða
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Ertu læst/ur úti?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Skoðaðu tölvupóstinn þinn
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Við sendum staðfestingarkóða á <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Settu inn 8-stafa kóða innan 10 mínútna
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Halda áfram
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Senda kóða aftur
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Nota annan reikning

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Endurstilla lykilorðið þitt
confirm-totp-reset-password-subheader-v2 = Settu inn tveggja-þrepa auðkenningarkóða
confirm-totp-reset-password-instruction-v2 = Athugaðu <strong>auðkenningarforritið þitt</strong> til að endurstilla lykilorðið.
confirm-totp-reset-password-trouble-code = Vandamál við að setja inn kóða?
confirm-totp-reset-password-confirm-button = Staðfesta
confirm-totp-reset-password-input-label-v2 = Settu inn 6-stafa kóða
confirm-totp-reset-password-use-different-account = Nota annan reikning

## ResetPassword start page

password-reset-flow-heading = Endurstilltu lykilorðið þitt
password-reset-body-2 =
    Við munum biðja um nokkra hluti sem aðeins þú veist til að halda reikningnum þínum
    öruggum.
password-reset-email-input =
    .label = Settu inn tölvupóstfangið þitt
password-reset-submit-button-2 = Halda áfram

## ResetPasswordConfirmed

reset-password-complete-header = Lykilorðið þitt var endurstillt
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Halda áfram í { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Endurstilltu lykilorðið þitt
password-reset-recovery-method-subheader = Veldu aðferð fyrir endurheimtingu
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Við skulum ganga úr skugga um að það sért þú sjálf/ur sem notar endurheimtuaðferðirnar þínar.
password-reset-recovery-method-phone = Endurheimtusímanúmer
password-reset-recovery-method-code = Varaauðkenningarkóðar
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kóði eftir
       *[other] { $numBackupCodes } kóðar eftir
    }

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = Endurstilling lykilorðs tókst
reset-password-complete-new-password-saved = Nýtt lykilorð vistað!
reset-password-complete-recovery-key-created = Nýr endurheimtulykill reiknings búinn til - Sæktu hann núna og geymdu vel.
reset-password-complete-recovery-key-download-info =
    Þessi lykill er nauðsynlegur fyrir
    endurheimt gagna ef þú gleymir lykilorðinu þínu. <b>Sæktu hann núna og geymdu á öruggum stað, 
    þar sem þú munt ekki geta opnað þessa síðu aftur síðar.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Villa:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Sannvotta innskráningu…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Villa í staðfestingu
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Staðfestingartengill er útrunninn
signin-link-expired-message-2 = Tengillinn sem þú smelltir á er útrunninn eða hefur þegar verið notaður.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Settu inn lykilorðið þitt <span>fyrir { -product-mozilla-account }-reikninginn þinn </span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Halda áfram í { $serviceName }
signin-subheader-without-logo-default = Halda áfram í stillingar reiknings
signin-button = Skrá inn
signin-header = Skrá inn
signin-use-a-different-account-link = Nota annan reikning
signin-forgot-password-link = Gleymt lykilorð?
signin-password-button-label = Lykilorð
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } mun reyna að senda þig til baka til að nota tölvupósthulu eftir að þú skráir þig inn.

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Tengilinn sem þú smelltir á vantaði stafi og gæti hafa skemmst í meðförum póstforritsins þíns. Afritaðu varlega slóð tengilsins og prófaðu aftur.
report-signin-header = Tilkynna óheimila innskráningu?
report-signin-body = Þú fékkst tölvupóst varðandi tilraun til að fá aðgang að reikningnum þínum. Viltu tilkynna það sem grunsamlega virkni?
report-signin-submit-button = Tilkynna virkni
report-signin-support-link = Hvers vegna er þetta að gerast?
report-signin-error = Því miður kom upp vandamál við að senda skýrsluna.
signin-bounced-header = Því miður. Við höfum læst aðgangnum þínum.
# $email (string) - The user's email.
signin-bounced-message = Staðfestingartölvupóstur sem við sendum á { $email } var sendur til baka og við höfum því lokað á reikninginn þinn til að verja gögn þín í { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Ef þetta er gilt tölvupóstfang, skaltu <linkExternal>láta okkur vita</linkExternal> og við munum hjálpa þér við að aflæsa reikningnum þinum.
signin-bounced-create-new-account = Ert þú ekki lengur með þetta tölvupóstfang? Búðu til nýjan aðgang
back = Til baka

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Staðfestu þessa innskráningu <span>til að halda áfram í reikningsstillingar</span>
signin-push-code-heading-w-custom-service = Staðfestu þessa innskráningu <span>til að halda áfram í { $serviceName }</span>
signin-push-code-instruction = Athugaðu hin tækin þín og samþykktu þessa innskráningu í { -brand-firefox } vafranum þínum.
signin-push-code-did-not-recieve = Fékkstu ekki tilkynninguna?
signin-push-code-send-email-link = Kóði í tölvupósti

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Staðfestu innskráninguna þína
signin-push-code-confirm-description = Við greindum tilraun til innskráningar úr eftirfarandi tæki. Ef þetta varst þú, skaltu samþykkja innskráninguna
signin-push-code-confirm-verifying = Sannreyni
signin-push-code-confirm-login = Staðfestu innskráningu
signin-push-code-confirm-wasnt-me = Þetta var ekki ég, skiptum um lykilorð.
signin-push-code-confirm-login-approved = Innskráning þín hefur verið samþykkt. Lokaðu þessum glugga.
signin-push-code-confirm-link-error = Tengillinn er skemmdur. Reyndu aftur.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Innskráning
signin-recovery-method-subheader = Veldu aðferð fyrir endurheimtingu
signin-recovery-method-details = Við skulum ganga úr skugga um að það sért þú sjálf/ur sem notar endurheimtuaðferðirnar þínar.
signin-recovery-method-phone = Endurheimtusímanúmer
signin-recovery-method-code-v2 = Varaauðkenningarkóðar
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kóði eftir
       *[other] { $numBackupCodes } kóðar eftir
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Vandamál kom upp við að senda kóða í endurheimtusímann þinn

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Skrá inn
signin-recovery-code-sub-heading = Settu inn varaauðkenningarkóða
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Settu inn 10-stafa kóða
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Staðfesta
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Nota endurheimtusímanúmer
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Ertu læst/ur úti?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Varaauðkenningarkóða krafist
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Vandamál kom upp við að senda kóða í endurheimtusímann þinn
signin-recovery-code-use-phone-failure-description = Reyndu aftur seinna.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Skrá inn
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Settu inn endurheimtukóða
signin-recovery-phone-input-label = Settu inn 6-stafa kóða
signin-recovery-phone-code-submit-button = Staðfesta
signin-recovery-phone-resend-code-button = Senda kóða aftur
signin-recovery-phone-resend-success = Kóði sendur
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Ertu læst/ur úti?
signin-recovery-phone-send-code-error-heading = Vandamál kom upp við að senda kóða
signin-recovery-phone-code-verification-error-heading = Vandamál kom upp við að staðfesta kóðann þinn
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Reyndu aftur seinna.
signin-recovery-phone-invalid-code-error-description = Kóðinn er ógildur eða útrunninn.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Þakka þér fyrir að vera á verði
signin-reported-message = Við höfum fengið tilkynningu varðandi þetta. Tikynningar eins og þessi hjálpa okkur við að bægja frá óprúttnum aðilum.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Settu inn staðfestingarkóða <span>fyrir { -product-mozilla-account }-reikninginn þinn </span>
signin-token-code-input-label-v2 = Settu inn 6-stafa kóða
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Staðfesta
signin-token-code-code-expired = Útrunninn kóði?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Senda nýjan kóða í tölvupósti.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Staðfestingarkóða krafist
signin-token-code-resend-error = Eitthvað fór úrskeiðis. Ekki var hægt að senda nýjan kóða.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } mun reyna að senda þig til baka til að nota tölvupósthulu eftir að þú skráir þig inn.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Skrá inn
signin-totp-code-subheader-v2 = Settu inn tveggja-þrepa auðkenningarkóða
signin-totp-code-instruction-v4 = Athugaðu <strong>auðkenningarforritið þitt</strong> til að staðfesta innskráninguna þína.
signin-totp-code-input-label-v4 = Settu inn 6-stafa kóða
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Staðfesta
signin-totp-code-other-account-link = Nota annan reikning
signin-totp-code-recovery-code-link = Vandamál við að setja inn kóða?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Auðkenningarkóða krafist
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } mun reyna að senda þig til baka til að nota tölvupósthulu eftir að þú skráir þig inn.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Heimila þessa innskráningu
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Skoðaðu tölvupóstinn þinn og finndu heimildarkóðann sem sendur var á { $email }.
signin-unblock-code-input = Settu inn heimildarkóða
signin-unblock-submit-button = Halda áfram
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Heimildarkóða er krafist
signin-unblock-code-incorrect-length = Heimildarkóði verður að innihalda 8 stafi
signin-unblock-code-incorrect-format-2 = Heimildarkóði getur aðeins innihaldið bókstafi og/eða tölustafi
signin-unblock-resend-code-button = Ekki í pósthólfinu eða ruslpóstmöppunni? Senda aftur
signin-unblock-support-link = Hvers vegna er þetta að gerast?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } mun reyna að senda þig til baka til að nota tölvupósthulu eftir að þú skráir þig inn.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Settu inn staðfestingarkóða
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Settu inn staðfestingarkóða <span>fyrir { -product-mozilla-account }-reikninginn þinn </span>
confirm-signup-code-input-label = Settu inn 6-stafa kóða
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Staðfesta
confirm-signup-code-code-expired = Útrunninn kóði?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Senda nýjan kóða í tölvupósti.
confirm-signup-code-success-alert = Tókst að staðfesta reikning
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Staðfestingarkóða er krafist
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } mun reyna að senda þig til baka til að nota tölvupósthulu eftir að þú skráir þig inn.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-relay-info = Lykilorð er nauðsynlegt til að stýra huldum póstföngum þínum á öruggan hátt og fá aðgang að öryggisverkfærum { -brand-mozilla }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Breyta tölvupóstfangi
