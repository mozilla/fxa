# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Új kód lett küldve az e-mail-címére.
resend-link-success-banner-heading = Új hivatkozás lett küldve az e-mail-címére.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Adja hozzá az { $accountsEmail } címet a névjegyei közé, a sima kézbesítés érdekében.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Banner bezárása
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = A { -product-firefox-accounts } új neve { -product-mozilla-accounts } lesz november 1-jén
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Továbbra is ugyanazzal a felhasználónévvel és jelszóval fog bejelentkezni, és nincs más változás a használt termékekben.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Átneveztük a { -product-firefox-accounts }at { -product-mozilla-accounts }ra. Továbbra is ugyanazzal a felhasználónévvel és jelszóval fog bejelentkezni, és nincs más változás a használt termékekben.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = További tudnivalók
# Alt text for close banner image
brand-close-banner =
    .alt = Banner bezárása
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m logó

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Vissza
button-back-title = Vissza

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Letöltés és folytatás
    .title = Letöltés és folytatás
recovery-key-pdf-heading = Fiók-helyreállítási kulcs
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Előállítva: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Fiók-helyreállítási kulcs
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Ez a kulcs lehetővé teszi a titkosított böngészőadatok (beleértve a jelszavakat, könyvjelzőket és az előzményeket) helyreállítását, ha elfelejti a jelszavát. Tárolja olyan helyen, amelyre emlékezni fog.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Helyek a kulcsok tárolására
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Tudjon meg többet a fiók-helyreállítási kulcsról
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Sajnos probléma merült fel a fiók-helyreállítási kulcs letöltése során.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Kapjon többet a { -brand-mozilla(ending: "accented") }ból:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Iratkozzon fel a legfrissebb híreinkre és termékeinkre
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Korai hozzáférés az új termékek teszteléséhez
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Felhívások az internet visszaszerzésére

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Letöltve
datablock-copy =
    .message = Másolva
datablock-print =
    .message = Kinyomtatva

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Kód másolva
       *[other] Kódok másolva
    }
datablock-download-success =
    { $count ->
        [one] Kód letöltve
       *[other] Kódok letöltve
    }
datablock-print-success =
    { $count ->
        [one] Kód kinyomtatva
       *[other] Kódok kinyomtatva
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Másolva

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (becsült)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (becsült)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (becsült)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (becsült)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Hely ismeretlen
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } ezen: { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-cím: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Jelszó
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Jelszó megismétlése
form-password-with-inline-criteria-signup-submit-button = Fiók létrehozása
form-password-with-inline-criteria-reset-new-password =
    .label = Új jelszó
form-password-with-inline-criteria-confirm-password =
    .label = Jelszó megerősítése
form-password-with-inline-criteria-reset-submit-button = Új jelszó létrehozása
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Jelszó
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Jelszó megismétlése
form-password-with-inline-criteria-set-password-submit-button = Szinkronizálás indítása
form-password-with-inline-criteria-match-error = A jelszavak nem egyeznek
form-password-with-inline-criteria-sr-too-short-message = A jelszónak legalább 8 karakterből kell állnia.
form-password-with-inline-criteria-sr-not-email-message = A jelszó nem tartalmazhatja az e-mail-címét.
form-password-with-inline-criteria-sr-not-common-message = A jelszó nem lehet gyakran használt jelszó.
form-password-with-inline-criteria-sr-requirements-met = A megadott jelszó betartja az összes jelszókövetelményt.
form-password-with-inline-criteria-sr-passwords-match = A megadott jelszavak egyeznek.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Ez a mező kötelező

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = A folytatáshoz adja meg a { $codeLength } számjegyű kódot
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = A folytatáshoz adja meg a { $codeLength } karakteres kódot

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } fiók-helyreállítási kulcs
get-data-trio-title-backup-verification-codes = Tartalék hitelesítési kódok
get-data-trio-download-2 =
    .title = Letöltés
    .aria-label = Letöltés
get-data-trio-copy-2 =
    .title = Másolás
    .aria-label = Másolás
get-data-trio-print-2 =
    .title = Nyomtatás
    .aria-label = Nyomtatás

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Figyelmeztetés
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Figyelem
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Figyelmeztetés
authenticator-app-aria-label =
    .aria-label = Hitelesítő alkalmazás
backup-codes-icon-aria-label-v2 =
    .aria-label = Tartalék hitelesítési kódok engedélyezve
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Tartalék hitelesítési kódok letiltva
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Helyreállító SMS engedélyezve
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Helyreállító SMS letiltva
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadai zászló
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Pipa
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Sikeres
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Engedélyezve
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Üzenet bezárása
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kód
error-icon-aria-label =
    .aria-label = Hiba
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Információ
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Egyesült Államok zászlaja

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Egy számítógép és egy mobiltelefon, mindkettőn egy összetört szív képe
hearts-verified-image-aria-label =
    .aria-label = Egy számítógép, egy mobiltelefon és egy táblagép, mindegyiken egy dobogó szívvel
signin-recovery-code-image-description =
    .aria-label = Rejtett szöveget tartalmazó dokumentum.
signin-totp-code-image-label =
    .aria-label = Egy eszköz egy rejtett 6 számjegyű kóddal.
confirm-signup-aria-label =
    .aria-label = Egy hivatkozást tartalmazó boríték
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Az illusztráció egy fiók-helyreállítási kulcsot reprezentál.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Az illusztráció egy fiók-helyreállítási kulcsot reprezentál.
password-image-aria-label =
    .aria-label = Egy jelszó beírását ábrázoló illusztráció.
lightbulb-aria-label =
    .aria-label = A tárolási tipp létrehozását jelképező illusztráció.
email-code-image-aria-label =
    .aria-label = Egy kódot tartalmazó e-mail ábrája.
recovery-phone-image-description =
    .aria-label = Mobileszköz, amely kódot kap SMS-ben.
recovery-phone-code-image-description =
    .aria-label = Mobileszközön kapott kód.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobileszköz SMS lehetőséggel
backup-authentication-codes-image-aria-label =
    .aria-label = Eszközképernyő kódokkal
sync-clouds-image-aria-label =
    .aria-label = Felhők egy szinkronizálási ikonnal
confetti-falling-image-aria-label =
    .aria-label = Animált hulló konfetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Bejelentkezett a { -brand-firefox(case: "illative") } .
inline-recovery-key-setup-create-header = Biztosítsa fiókját
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Van egy perce az adatai megvédésére?
inline-recovery-key-setup-info = Hozzon létre egy fiók-helyreállítási kulcsot, hogy helyreállítsa a szinkronizált böngészési adatait, ha elfelejtené a jelszavát.
inline-recovery-key-setup-start-button = Fiók-helyreállítási kulcs létrehozása
inline-recovery-key-setup-later-button = Tegye meg később

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Jelszó elrejtése
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Jelszó megjelenítése
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = A jelszava jelenleg látható a képernyőn.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = A jelszava jelenleg rejtett.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = A jelszava most már látható a képernyőn.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = A jelszava most már rejtett.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Válasszon országot
input-phone-number-enter-number = Adja meg a telefonszámot
input-phone-number-country-united-states = Egyesült Államok
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Vissza

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = A jelszó-visszaállítási hivatkozás sérült
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = A megerősítő hivatkozás sérült
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Sérült hivatkozás
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = A hivatkozásból karakterek hiányoztak, ezt az e-mail kliense ronthatta el. Másolja be a címet körültekintően, és próbálja újra.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Új hivatkozás kérése

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Emlékszik a jelszavára?
# link navigates to the sign in page
remember-password-signin-link = Bejelentkezés

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Az elsődleges e-mail már meg lett erősítve
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = A bejelentkezés már meg lett erősítve
confirmation-link-reused-message = A megerősítési hivatkozás már volt használva, és csak egyszer használható.

## Locale Toggle Component

locale-toggle-select-label = Válasszon nyelvet
locale-toggle-browser-default = Böngésző alapértelmezése
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Hibás kérés

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Erre a jelszóra van szüksége a nálunk tárolt titkosított adatok eléréséhez.
password-info-balloon-reset-risk-info = Az alaphelyzetbe állítás azt jelenti, hogy elvesztheti az adatait, például a jelszavait és könyvjelzőit.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Válasszon erős jelszót, melyet más oldalakon nem használt. Győződjön meg róla, hogy megfelel a biztonsági követelményeknek:
password-strength-short-instruction = Válasszon erős jelszót:
password-strength-inline-min-length = Legalább 8 karakter
password-strength-inline-not-email = Nem az Ön e-mail-címe
password-strength-inline-not-common = Nem gyakran használt jelszó
password-strength-inline-confirmed-must-match = A megerősítés egyezik az új jelszóval
password-strength-inline-passwords-match = A jelszavak egyeznek

## Notification Promo Banner component

account-recovery-notification-cta = Létrehozás
account-recovery-notification-header-value = Ne veszítse el adatait, ha elfelejti a jelszavát
account-recovery-notification-header-description = Hozzon létre egy fiók-helyreállítási kulcsot, hogy helyreállítsa a szinkronizált böngészési adatait, ha elfelejtené a jelszavát.
recovery-phone-promo-cta = Helyreállítási telefonszám hozzáadása
recovery-phone-promo-heading = Adjon további védelmet a fiókjának egy helyreállítási telefonszámmal
recovery-phone-promo-description = Mostantól bejelentkezhet egy egyszer használatos jelszóval SMS-ben, ha nem tudja használni a kétlépcsős hitelesítő alkalmazását.
recovery-phone-promo-info-link = Tudjon meg többet a helyreállítás és a SIM-csere kockázatáról
promo-banner-dismiss-button =
    .aria-label = Banner eltüntetése

## Ready component

ready-complete-set-up-instruction = Fejezze be a beállítást az új jelszó megadásával a többi { -brand-firefox(case: "accusative") } használó eszközén.
manage-your-account-button = Saját fiók kezelése
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Most már készen áll a { $serviceName } használatára
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Most már készen áll a fiókbeállítások használatára
# Message shown when the account is ready but the user is not signed in
ready-account-ready = A fiókja elkészült!
ready-continue = Folytatás
sign-in-complete-header = Bejelentkezés megerősítve
sign-up-complete-header = Fiók megerősítve
primary-email-verified-header = Elsődleges e-mail-cím megerősítve

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Kulcstároló helyek:
flow-recovery-key-download-storage-ideas-folder-v2 = Mappa egy biztonságos eszközön
flow-recovery-key-download-storage-ideas-cloud = Megbízható felhős tároló
flow-recovery-key-download-storage-ideas-print-v2 = Kinyomtatott fizikai másolat
flow-recovery-key-download-storage-ideas-pwd-manager = Jelszókezelő

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Tipp hozzáadása, amely segít megtalálni a kulcsát
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Ez a tipp segít megjegyezni, hogy hol tárolta a fiók-helyreállítási kulcsot. Meg tudjuk jeleníteni a jelszó-visszaállításkor, hogy helyreállítsuk az adatait.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Adjon meg egy tippet (nem kötelező)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Befejezés
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = A tippnek 255 karakternél rövidebbnek kell lennie.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = A tipp nem tartalmazhat nem biztonságos Unicode karaktereket. Csak betűk, számok, írásjelek és szimbólumok engedélyezettek.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Figyelmeztetés
password-reset-chevron-expanded = Figyelmeztetés összecsukása
password-reset-chevron-collapsed = Figyelmeztetés kinyitása
password-reset-data-may-not-be-recovered = Előfordulhat, hogy a böngészési adatok nem állíthatók helyre
password-reset-previously-signed-in-device-2 = Van olyan eszköze, amelyre korábban bejelentkezett?
password-reset-data-may-be-saved-locally-2 = Előfordulhat, hogy a böngésző adatai vannak mentve azon az eszközön. Állítsa vissza a jelszavát, majd jelentkezzen be ott az adatai helyreállításához és szinkronizálásához.
password-reset-no-old-device-2 = Új eszköze van, de a korábbiakhoz már nem fér hozzá?
password-reset-encrypted-data-cannot-be-recovered-2 = Sajnáljuk, de a { -brand-firefox } kiszolgálókon lévő titkosított böngészőadatai nem állíthatók helyre.
password-reset-warning-have-key = Van fiók-helyreállítási kulcsa?
password-reset-warning-use-key-link = Használja most a jelszó helyreállításához és az adatok megtartásához

## Alert Bar

alert-bar-close-message = Üzenet bezárása

## User's avatar

avatar-your-avatar =
    .alt = Saját profilkép
avatar-default-avatar =
    .alt = Alapértelmezett profilkép

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } termékek
bento-menu-tagline = A { -brand-mozilla } további termékei, amelyek védik a magánszféráját
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } asztali böngésző
bento-menu-firefox-mobile = { -brand-firefox } mobilböngésző
bento-menu-made-by-mozilla = A { -brand-mozilla } készítette

## Connect another device promo

connect-another-fx-mobile = Töltse le a { -brand-firefox }ot mobilra vagy táblagépre
connect-another-find-fx-mobile-2 = Keresse meg a { -brand-firefox(case: "accusative") } a { -google-play(case: "inessive") } és az { -app-store(case: "inessive") }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = A { -brand-firefox } letöltése a { -google-play(case: "elative") }
connect-another-app-store-image-3 =
    .alt = A { -brand-firefox } letöltése az { -app-store(case: "elative") }

## Connected services section

cs-heading = Kapcsolódó szolgáltatások
cs-description = Minden, amit használ, és ahová bejelentkezett.
cs-cannot-refresh =
    Sajnos probléma merült fel a kapcsolódó szolgáltatások
    frissítésekor.
cs-cannot-disconnect = A kliens nem található, a leválasztás sikertelen
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Kijelentkezett innen: { $service }
cs-refresh-button =
    .title = Kapcsolódó szolgáltatások frissítése
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Hiányzó vagy ismétlődő elemek?
cs-disconnect-sync-heading = Leválás a Syncről

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Böngészési adatai megmaradnak a(z) <span>{ $device }</span> eszközön,
    de nem szinkronizálódnak a fiókjával.
cs-disconnect-sync-reason-3 = Mi a fő oka a(z) <span>{ $device }</span> eszköz leválasztásának?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Az eszköz:
cs-disconnect-sync-opt-suspicious = Gyanús
cs-disconnect-sync-opt-lost = Elvesztette vagy ellopták
cs-disconnect-sync-opt-old = Régi vagy lecserélte
cs-disconnect-sync-opt-duplicate = Másolat
cs-disconnect-sync-opt-not-say = Inkább nem mondja meg

##

cs-disconnect-advice-confirm = Rendben, értem
cs-disconnect-lost-advice-heading = Az elveszett vagy ellopott eszköz leválasztva
cs-disconnect-lost-advice-content-3 =
    Mivel az eszközét elvesztette vagy ellopták, ezért hogy biztonságban tartsa az információit, változtassa meg a { -product-mozilla-account }ja
    jelszavát a fiókbeállításokban. Érdemes megkeresni az eszköz gyártójának leírását az adatok távoli törléséről.
cs-disconnect-suspicious-advice-heading = Gyanús eszköz leválasztva
cs-disconnect-suspicious-advice-content-2 =
    Ha a leválasztott eszköz valóban gyanús, akkor hogy biztonságban tartsa az információt, változtassa meg a { -product-mozilla-account }ja
    jelszavát a fiókbeállításokban. Érdemes módosítania az összes, a { -brand-firefox(case: "inessive") } mentett jelszavát is, az about:logins beírásával a címsávba.
cs-sign-out-button = Kijelentkezés

## Data collection section

dc-heading = Adatgyűjtés és -felhasználás
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } böngésző
dc-subheader-content-2 = Engedélyezés, hogy a { -product-mozilla-accounts } műszaki és interakciós adatokat küldjön a { -brand-mozilla(ending: "accented") }nak.
dc-subheader-ff-content = A { -brand-firefox } böngészője műszaki és interakciós adatai beállításainak áttekintéséhez vagy frissítéséhez nyissa meg a { -brand-firefox } beállításait, és navigáljon az Adatvédelem és biztonság oldalra.
dc-opt-out-success-2 = Sikeres leiratkozás. A { -product-mozilla-accounts } nem fog műszaki vagy interakciós adatokat küldeni a { -brand-mozilla(ending: "accented") }nak.
dc-opt-in-success-2 = Köszönjük! Ezen adatok megosztása segít nekünk a { -product-mozilla-accounts } fejlesztésében.
dc-opt-in-out-error-2 = Sajnos probléma merült fel az adatgyűjtési beállítás megváltoztatásakor
dc-learn-more = További tudnivalók

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } menü
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Bejelentkezve mint
drop-down-menu-sign-out = Kijelentkezés
drop-down-menu-sign-out-error-2 = Sajnos probléma merült fel a kijelentkezésekor

## Flow Container

flow-container-back = Vissza

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Biztonsági okokból adja meg újra a jelszavát
flow-recovery-key-confirm-pwd-input-label = Írja be a jelszavát
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Fiók-helyreállítási kulcs létrehozása
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Új fiók-helyreállítási kulcs létrehozása

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Fiók-helyreállítási kulcs létrehozva – Töltse le és tárolja most
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Ez a kulcs lehetővé teszi az adatok helyreállítását, ha elfelejti a jelszavát. Töltse le most, és tárolja olyan helyen, amelyre emlékezni fog – később nem fog tudni visszatérni erre az oldalra.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Folytatás letöltés nélkül

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Fiók-helyreállítási kulcs létrehozva

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Hozzon létre egy fiók-helyreállítási kulcsot arra az esetre, ha elfelejtené a jelszavát
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = A fiók-helyreállítási kulcs módosítása
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Titkosítjuk a böngészési adatokat – a jelszavakat, könyvjelzőket és egyebeket. Nagyszerű az adatvédelem szempontjából, de elvesztheti az adatait, ha elfelejti a jelszavát.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Ezért olyan fontos a fiók-helyreállítási kulcs létrehozása – felhasználhatja az adatai visszaszerzésére.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Kezdő lépések
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Mégse

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Csatlakoztassa a hitelesítő alkalmazásához
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>1. lépés:</strong> Olvassa le ezt a QR-kódot bármely hitelesítő alkalmazással, például a Duo vagy a Google Hitelesítő segítségével.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-kód a kétlépcsős hitelesítés beállításához. Olvassa le, vagy válassza a „Nem tudja leolvasni a QR kódot?” lehetőséget. hogy helyette egy beállítási titkos kulcsot kapjon.
flow-setup-2fa-cant-scan-qr-button = Nem tudja leolvasni a QR-kódot?
flow-setup-2fa-manual-key-heading = Írja be a kódot kézzel
flow-setup-2fa-manual-key-instruction = <strong>1. lépés:</strong> Írja be ezt a kódot a kiválasztott hitelesítő alkalmazásban.
flow-setup-2fa-scan-qr-instead-button = Inkább leolvassa a QR-kódot?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Tudjon meg többet a hitelesítő alkalmazásokról
flow-setup-2fa-button = Folytatás
flow-setup-2fa-step-2-instruction = <strong>2. lépés:</strong> Adja meg a hitelesítő alkalmazásból származó kódot.
flow-setup-2fa-input-label = Adja meg a 6 számjegyű kódot
flow-setup-2fa-code-error = Érvénytelen vagy lejárt kód. Ellenőrizze a hitelesítő alkalmazást, és próbálja újra.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Válasszon helyreállítási módot
flow-setup-2fa-backup-choice-description = Ez lehetővé teszi, hogy bejelentkezzen, ha nem tudja elérni mobileszközét vagy hitelesítő alkalmazását.
flow-setup-2fa-backup-choice-phone-title = Helyreállítási telefonszám
flow-setup-2fa-backup-choice-phone-badge = Legkönnyebb
flow-setup-2fa-backup-choice-phone-info = Kapjon helyreállítási kódot szöveges üzenetben. Jelenleg az Amerikai Egyesült Államokban és Kanadában érhető el.
flow-setup-2fa-backup-choice-code-title = Tartalék hitelesítési kódok
flow-setup-2fa-backup-choice-code-badge = Legbiztonságosabb
flow-setup-2fa-backup-choice-code-info = Egyszeri hitelesítési kódok létrehozása és mentése.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Tudjon meg többet a helyreállításról és a SIM-csere kockázatáról

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Adjon meg egy tartalék hitelesítési kódot
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Egy kód beírásával erősítse meg, hogy elmentette a kódokat. Ezen kódok nélkül lehet, hogy nem fog tudni bejelentkezni, ha nem rendelkezik a hitelesítő alkalmazással.
flow-setup-2fa-backup-code-confirm-code-input = Adja meg a 10 karakteres kódot
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Befejezés

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Tartalék hitelesítési kódok mentése
flow-setup-2fa-backup-code-dl-save-these-codes = Tartsa ezeket egy olyan helyen, amelyre emlékezni fog. Ha nincs hozzáférése a hitelesítő alkalmazáshoz, akkor meg kell adnia egyet a bejelentkezéshez.
flow-setup-2fa-backup-code-dl-button-continue = Folytatás

##

flow-setup-2fa-inline-complete-success-banner = Kétlépcsős hitelesítés engedélyezve
flow-setup-2fa-inline-complete-success-banner-description = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra az új kétlépcsős hitelesítésével.
flow-setup-2fa-inline-complete-backup-code = Tartalék hitelesítési kódok
flow-setup-2fa-inline-complete-backup-phone = Helyreállítási telefonszám
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kód maradt
       *[other] { $count } kód maradt
    }
flow-setup-2fa-inline-complete-backup-code-description = Ez a legbiztonságosabb helyreállítási módszer, ha nem tud bejelentkezni mobileszközével vagy hitelesítő alkalmazással.
flow-setup-2fa-inline-complete-backup-phone-description = Ez a legegyszerűbb helyreállítási módszer, ha nem tud bejelentkezni a hitelesítő alkalmazással.
flow-setup-2fa-inline-complete-learn-more-link = Hogyan védi ez a fiókját
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Tovább erre: { $serviceName }
flow-setup-2fa-prompt-heading = Állítsa be a kétlépcsős hitelesítést
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = A(z) { $serviceName } szolgáltatáshoz be kell állítania a kétlépcsős hitelesítést, hogy biztonságban tartsa a fiókját.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = A folytatáshoz <authenticationAppsLink>ezen hitelesítő alkalmazások</authenticationAppsLink> bármelyikét használhatja.
flow-setup-2fa-prompt-continue-button = Folytatás

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Adja meg az ellenőrzőkódot
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = SMS-ben egy hatjegyű kód lett küldve a <span>{ $phoneNumber }</span> telefonszámra. Ez a kód 5 perc után lejár.
flow-setup-phone-confirm-code-input-label = Adja meg a 6 számjegyű kódot
flow-setup-phone-confirm-code-button = Megerősítés
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = A kód lejárt?
flow-setup-phone-confirm-code-resend-code-button = Kód újraküldése
flow-setup-phone-confirm-code-resend-code-success = Kód elküldve
flow-setup-phone-confirm-code-success-message-v2 = Helyreállítási telefonszám hozzáadva
flow-change-phone-confirm-code-success-message = A helyreállítási telefonszám megváltozott

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Ellenőrizze a telefonszámát
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Kapni fog egy SMS-t a { -brand-mozilla(ending: "accented") }tól, amely egy kódot tartalmaz a száma ellenőrzéséhez. Ne ossza meg ezt a kódot másokkal.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = A helyreállítási telefonszám csak az Egyesült Államokban és Kanadában érhető el. A VoIP számok és a telefonmaszkok nem ajánlottak.
flow-setup-phone-submit-number-legal = A telefonszám megadásával beleegyezik, hogy tároljuk, de csak fiók-ellenőrzési SMS-eket küldhetünk. Üzenet- és adatforgalmi költségek merülhetnek fel.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Kód küldése

## HeaderLockup component, the header in account settings

header-menu-open = Menü bezárása
header-menu-closed = Webhely navigációs menü
header-back-to-top-link =
    .title = Vissza a tetejére
header-back-to-settings-link =
    .title = Vissza a(z) { -product-mozilla-account } beállításaihoz
header-title-2 = { -product-mozilla-account }
header-help = Súgó

## Linked Accounts section

la-heading = Összekapcsolt fiókok
la-description = A következő fiókokhoz való hozzáférést engedélyezte.
la-unlink-button = Leválasztás
la-unlink-account-button = Leválasztás
la-set-password-button = Jelszó beállítása
la-unlink-heading = Leválasztás egy harmadik féltől származó fiókról
la-unlink-content-3 = Biztos, hogy leválasztja a fiókját? A fiók leválasztásával nem jelentkezik ki automatikusan a kapcsolódó szolgáltatásokból. Ehhez kézileg kell kijelentkeznie a Kapcsolódó szolgáltatások szakaszban.
la-unlink-content-4 = A fiók leválasztása előtt meg kell adnia egy jelszót. Jelszó nélkül a fiók leválasztása után nincs lehetősége bejelentkezni.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Bezárás
modal-cancel-button = Mégse
modal-default-confirm-button = Megerősítés

## ModalMfaProtected

modal-mfa-protected-title = Adja meg a megerősítő kódot
modal-mfa-protected-subtitle = Segítsen nekünk megbizonyosodni arról, hogy megváltoztattuk-e a fiókadatait
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Adja meg a(z) <email>{ $email }</email> címre küldött kódot { $expirationTime } percen belül.
       *[other] Adja meg a(z) <email>{ $email }</email> címre küldött kódot { $expirationTime } percen belül.
    }
modal-mfa-protected-input-label = Adja meg a 6 számjegyű kódot
modal-mfa-protected-cancel-button = Mégse
modal-mfa-protected-confirm-button = Megerősítés
modal-mfa-protected-code-expired = A kód lejárt?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Új kód elküldése e-mailben.

## Modal Verify Session

mvs-verify-your-email-2 = Erősítse meg az e-mail-címét
mvs-enter-verification-code-2 = Adja meg a megerősítő kódját
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Adja meg 5 percen belül a(z) <email>{ $email }</email> címre küldött megerősítő kódot.
msv-cancel-button = Mégse
msv-submit-button-2 = Megerősítés

## Settings Nav

nav-settings = Beállítások
nav-profile = Profil
nav-security = Biztonság
nav-connected-services = Kapcsolódó szolgáltatások
nav-data-collection = Adatgyűjtés és -felhasználás
nav-paid-subs = Előfizetések
nav-email-comm = E-mail kommunikáció

## Page2faChange

page-2fa-change-title = Kétlépcsős hitelesítés módosítása
page-2fa-change-success = A kétlépcsős hitelesítés frissítve lett
page-2fa-change-success-additional-message = A csatlakoztatott eszközeinek védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra az új kétlépcsős hitelesítésével.
page-2fa-change-totpinfo-error = Hiba történt a kétlépcsős hitelesítő alkalmazás cseréjekor. Próbálja újra később.
page-2fa-change-qr-instruction = <strong>1. lépés:</strong> Olvassa le ezt a QR-kódot bármely hitelesítő alkalmazással, például a Duo vagy a Google Hitelesítő segítségével. Ez egy új kapcsolatot hoz létre, a régi kapcsolatok nem fognak működni.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Tartalék hitelesítési kódok
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Hiba történt a tartalék hitelesítési kódok cseréje során
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Hiba történt a tartalék hitelesítési kódok létrehozásakor
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = A tartalék hitelesítési kódok frissítve
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Tartalék hitelesítési kódok létrehozva
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Tartsa ezeket egy olyan helyen, amelyre emlékezni fog. A régi kódok le lesznek cserélve a következő lépés befejezése után.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Erősítse meg a kódok elmentését az egyik beírásával. A lépés befejeztével a régi tartalék hitelesítési kódok le lesznek tiltva.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Érvénytelen tartalék hitelesítési kód

## Page2faSetup

page-2fa-setup-title = Kétlépcsős hitelesítés
page-2fa-setup-totpinfo-error = Hiba történt a kétlépcsős hitelesítés beállításakor. Próbálja újra később.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Ez a kód nem helyes. Próbálja újra.
page-2fa-setup-success = A kétlépcsős hitelesítés engedélyezve lett
page-2fa-setup-success-additional-message = Az összes csatlakoztatott eszközének védelme érdekében ki kell jelentkeznie mindenhol, ahol ezt a fiókot használja, majd jelentkezzen be újra a kétlépcsős hitelesítéssel.

## Avatar change page

avatar-page-title =
    .title = Profilkép
avatar-page-add-photo = Fénykép hozzáadása
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fénykép készítése
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Fénykép eltávolítása
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Fénykép újbóli elkészítése
avatar-page-cancel-button = Mégse
avatar-page-save-button = Mentés
avatar-page-saving-button = Mentés…
avatar-page-zoom-out-button =
    .title = Kicsinyítés
avatar-page-zoom-in-button =
    .title = Nagyítás
avatar-page-rotate-button =
    .title = Forgatás
avatar-page-camera-error = A kamera nem készíthető elő
avatar-page-new-avatar =
    .alt = új profilkép
avatar-page-file-upload-error-3 = Hiba történt a profilkép feltöltésekor
avatar-page-delete-error-3 = Hiba történt a profilkép törlésekor
avatar-page-image-too-large-error-2 = A képfájl mérete túl nagy a feltöltéshez

## Password change page

pw-change-header =
    .title = Jelszó módosítása
pw-8-chars = Legalább 8 karakter
pw-not-email = Nem az Ön e-mail-címe
pw-change-must-match = Az új jelszó megegyezik a megerősítő szöveggel
pw-commonly-used = Nem gyakran használt jelszó
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Maradjon biztonságban – ne használja újra a jelszavakat. Nézzen meg további tippeket az <linkExternal>erős jelszavak létrehozásához</linkExternal>.
pw-change-cancel-button = Mégse
pw-change-save-button = Mentés
pw-change-forgot-password-link = Elfelejtette a jelszót?
pw-change-current-password =
    .label = Írja be a jelenlegi jelszavát
pw-change-new-password =
    .label = Írja be az új jelszót
pw-change-confirm-password =
    .label = Erősítse meg az új jelszót
pw-change-success-alert-2 = Jelszó frissítve

## Password create page

pw-create-header =
    .title = Jelszó létrehozása
pw-create-success-alert-2 = Jelszó megadva
pw-create-error-2 = Sajnos probléma merült fel a jelszó megadásakor

## Delete account page

delete-account-header =
    .title = Fiók törlése
delete-account-step-1-2 = 1. / 2. lépés
delete-account-step-2-2 = 2. / 2. lépés
delete-account-confirm-title-4 = Előfordulhat, hogy a { -product-mozilla-account }ját a következő { -brand-mozilla } termékekhez vagy szolgáltatásokhoz kapcsolta, amelyek segítségével biztonságban lehet és hatékonyabb lehet az interneten:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = A { -brand-firefox } adatainak szinkronizálása
delete-account-product-firefox-addons = { -brand-firefox } Kiegészítők
delete-account-acknowledge = Erősítse meg ezt a fiókja a törlésével:
delete-account-chk-box-1-v4 =
    .label = Az összes előfizetése lemondásra kerül
delete-account-chk-box-2 =
    .label = Elveszítheti a { -brand-mozilla } termékekben elmentett információkat és szolgáltatásokat
delete-account-chk-box-3 =
    .label = Az ezzel az e-mail címmel történő újraaktiválás nem biztos, hogy visszaállítja a mentett információit
delete-account-chk-box-4 =
    .label = Az addons.mozilla.org-on közzétett kiegészítők és témák törölve lesznek
delete-account-continue-button = Folytatás
delete-account-password-input =
    .label = Adja meg a jelszót
delete-account-cancel-button = Mégse
delete-account-delete-button-2 = Törlés

## Display name page

display-name-page-title =
    .title = Megjelenő név
display-name-input =
    .label = Írja be a megjelenő nevet
submit-display-name = Mentés
cancel-display-name = Mégse
display-name-update-error-2 = Hiba történt a megjelenő név frissítésekor
display-name-success-alert-2 = A megjelenő név frissítve

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Legutóbbi fióktevékenység
recent-activity-account-create-v2 = Fiók létrehozva
recent-activity-account-disable-v2 = Fiók letiltva
recent-activity-account-enable-v2 = Fiók engedélyezve
recent-activity-account-login-v2 = Fiókbejelentkezés kezdeményezve
recent-activity-account-reset-v2 = Jelszó-visszaállítás kezdeményezve
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Az e-mail visszapattanások törölve
recent-activity-account-login-failure = A fiók bejelentkezési kísérlete sikertelen
recent-activity-account-two-factor-added = Kétlépcsős hitelesítés engedélyezve
recent-activity-account-two-factor-requested = Kétlépcsős hitelesítés kérve
recent-activity-account-two-factor-failure = Kétlépcsős hitelesítés sikertelen
recent-activity-account-two-factor-success = Kétlépcsős hitelesítés sikeres
recent-activity-account-two-factor-removed = Kétlépcsős hitelesítés eltávolítva
recent-activity-account-password-reset-requested = A fiók jelszó-visszaállítást kért
recent-activity-account-password-reset-success = A fiókjelszó visszaállítása sikeres
recent-activity-account-recovery-key-added = Fiók-helyreállítási kulcs engedélyezve
recent-activity-account-recovery-key-verification-failure = A fiók-helyreállítási kulcs ellenőrzése sikertelen
recent-activity-account-recovery-key-verification-success = A fiók-helyreállítási kulcs ellenőrzése sikeres
recent-activity-account-recovery-key-removed = Fiók-helyreállítási kulcs eltávolítva
recent-activity-account-password-added = Új jelszó hozzáadva
recent-activity-account-password-changed = A jelszó megváltozott
recent-activity-account-secondary-email-added = Másodlagos e-mail-cím hozzáadva
recent-activity-account-secondary-email-removed = Másodlagos e-mail-cím eltávolítva
recent-activity-account-emails-swapped = Elsődleges és másodlagos e-mail címek felcserélve
recent-activity-session-destroy = Kijelentkezett a munkamenetből
recent-activity-account-recovery-phone-send-code = Helyreállítási telefonszám elküldve
recent-activity-account-recovery-phone-setup-complete = Helyreállítási telefonszám beállítása befejezve
recent-activity-account-recovery-phone-signin-complete = Bejelentkezés a helyreállítási telefonszámmal befejezve
recent-activity-account-recovery-phone-signin-failed = Nem sikerült bejelentkezni a helyreállítási telefonszámmal
recent-activity-account-recovery-phone-removed = Helyreállítási telefonszám eltávolítva
recent-activity-account-recovery-codes-replaced = Helyreállítási kódok lecserélve
recent-activity-account-recovery-codes-created = Helyreállítási kódok létrehozva
recent-activity-account-recovery-codes-signin-complete = Bejelentkezés a helyreállítási kódokkal befejezve
recent-activity-password-reset-otp-sent = Jelszó-visszaállítási megerősítő kód elküldve
recent-activity-password-reset-otp-verified = Jelszó-visszaállítási megerősítő kód ellenőrizve
recent-activity-must-reset-password = Jelszó-visszaállítás szükséges
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Egyéb fióktevékenység

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Fiók-helyreállítási kulcs
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Vissza a beállításokhoz

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Helyreállítási telefonszám eltávolítása
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Ez eltávolítja a(z) <strong>{ $formattedFullPhoneNumber }</strong> telefonszámot helyreállítási telefonszámként.
settings-recovery-phone-remove-recommend = Javasoljuk, hogy tartsa meg ezt a módszert, mert könnyebb, mint a tartalék hitelesítési kódok elmentése.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Ha törli, győződjön meg róla, hogy megvannak-e még az elmentett tartalék hitelesítési kódjai. <linkExternal>Helyreállítási módszerek összehasonlítása</linkExternal>
settings-recovery-phone-remove-button = Telefonszám eltávolítása
settings-recovery-phone-remove-cancel = Mégse
settings-recovery-phone-remove-success = Helyreállítási telefonszám eltávolítva

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Helyreállítási telefonszám hozzáadása
page-change-recovery-phone = Helyreállítási telefonszám módosítása
page-setup-recovery-phone-back-button-title = Vissza a beállításokhoz
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Telefonszám módosítása

## Add secondary email page

add-secondary-email-step-1 = 1. / 2. lépés
add-secondary-email-error-2 = Hiba történt az e-mail létrehozásakor
add-secondary-email-page-title =
    .title = Másodlagos e-mail
add-secondary-email-enter-address =
    .label = Adja meg az e-mail-címet
add-secondary-email-cancel-button = Mégse
add-secondary-email-save-button = Mentés
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Az e-mail-maszkok nem használhatók másodlagos e-mail-címként

## Verify secondary email page

add-secondary-email-step-2 = 2. / 2. lépés
verify-secondary-email-page-title =
    .title = Másodlagos e-mail
verify-secondary-email-verification-code-2 =
    .label = Adja meg a megerősítő kódját
verify-secondary-email-cancel-button = Mégse
verify-secondary-email-verify-button-2 = Megerősítés
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Adja meg 5 percen belül a(z) <strong>{ $email }</strong> címre küldött megerősítő kódot.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = A(z) { $email } sikeresen hozzáadva
verify-secondary-email-resend-code-button = Megerősítő kód újraküldése

##

# Link to delete account on main Settings page
delete-account-link = Fiók törlése
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Sikeresen bejelentkezett. A { -product-mozilla-account }ja és adatai aktívak maradnak.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Találja meg, hol kerülnek ki a személyes adatai, és vegye kezébe az irányítást
# Links out to the Monitor site
product-promo-monitor-cta = Ingyenes vizsgálat kérése

## Profile section

profile-heading = Profil
profile-picture =
    .header = Kép
profile-display-name =
    .header = Megjelenő név
profile-primary-email =
    .header = Elsődleges e-mail

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = { $currentStep }. / { $numberOfSteps } lépés.

## Security section of Setting

security-heading = Biztonság
security-password =
    .header = Jelszó
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Létrehozva: { $date }
security-not-set = Nincs beállítva
security-action-create = Létrehozás
security-set-password = Állítson be jelszót a szinkronizáláshoz és bizonyos fiókbiztonsági funkciók használatához.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Legutóbbi fióktevékenységek megtekintése
signout-sync-header = A munkamenet lejárt
signout-sync-session-expired = Elnézést, hiba történt. Jelentkezzen ki a böngésző menüjéből, és próbálja újra.

## SubRow component

tfa-row-backup-codes-title = Tartalék hitelesítési kódok
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nem érhetők el kódok
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kód maradt
       *[other] { $numCodesAvailable } kód maradt
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Új kódok létrehozása
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Hozzáadás
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Ez a legbiztonságosabb helyreállítási módszer, ha nem tudja használni a mobileszközét vagy a hitelesítő alkalmazást.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Helyreállítási telefonszám
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nincs telefonszám hozzáadva
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Módosítás
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Hozzáadás
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Eltávolítás
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Helyreállítási telefonszám eltávolítása
tfa-row-backup-phone-delete-restriction-v2 = Ha el akarja távolítani a helyreállítási telefonszámát, adjon hozzá tartalék hitelesítési kódokat vagy először kapcsolja ki a kétlépcsős hitelesítést, hogy elkerülje azt, hogy kizárja magát a fiókjából.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Ez a legkönnyebb helyreállítási módszer, ha nem tudja használni a hitelesítő alkalmazást.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Tudjon meg többet a SIM-csere kockázatáról

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Kikapcsolás
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Bekapcsolás
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Beküldés…
switch-is-on = be
switch-is-off = ki

## Sub-section row Defaults

row-defaults-action-add = Hozzáadás
row-defaults-action-change = Módosítás
row-defaults-action-disable = Letiltás
row-defaults-status = Nincs

## Account recovery key sub-section on main Settings page

rk-header-1 = Fiók-helyreállítási kulcs
rk-enabled = Engedélyezve
rk-not-set = Nincs beállítva
rk-action-create = Létrehozás
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Módosítás
rk-action-remove = Eltávolítás
rk-key-removed-2 = Fiók-helyreállítási kulcs eltávolítva
rk-cannot-remove-key = A fiók-helyreállítási kulcsot nem sikerült eltávolítani.
rk-refresh-key-1 = Fiók-helyreállítási kulcs frissítése
rk-content-explain = Állítsa vissza adatait, ha elfelejtette jelszavát.
rk-cannot-verify-session-4 = Sajnos probléma merült fel a munkamenet megerősítésekor
rk-remove-modal-heading-1 = Eltávolítja a fiók-helyreállítási kulcsot?
rk-remove-modal-content-1 =
    Ha visszaállítja jelszavát, akkor nem fogja tudni használni
    a fiók-helyreállítási kulcsot az adatai eléréséhez. Ezt a műveletet nem lehet visszavonni.
rk-remove-error-2 = A fiók-helyreállítási kulcsot nem sikerült eltávolítani
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Fiók-helyreállítási kulcs törlése

## Secondary email sub-section on main Settings page

se-heading = Másodlagos e-mail
    .header = Másodlagos e-mail
se-cannot-refresh-email = Sajnos probléma merült fel az e-mail frissítésekor.
se-cannot-resend-code-3 = Sajnos probléma merült fel a megerősítő kód újraküldésekor
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = A(z) { $email } az elsődleges e-mail-címe
se-set-primary-error-2 = Sajnos probléma merült fel az elsődleges e-mail-cím megváltoztatásakor
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = A(z) { $email } sikeresen törölve
se-delete-email-error-2 = Sajnos probléma merült fel az e-mail-cím törlésekor
se-verify-session-3 = A művelet végrehajtásához meg kell erősítenie a jelenlegi munkamenetet
se-verify-session-error-3 = Sajnos probléma merült fel a munkamenet megerősítésekor
# Button to remove the secondary email
se-remove-email =
    .title = E-mail-cím eltávolítása
# Button to refresh secondary email status
se-refresh-email =
    .title = E-mail-cím frissítése
se-unverified-2 = nem megerősített
se-resend-code-2 =
    Megerősítés szükséges. <button>Küldje újra a megerősítő kódot</button>,
    ha nincs a beérkezett levelek vagy a levélszemét mappában.
# Button to make secondary email the primary
se-make-primary = Elsődlegessé tétel
se-default-content = Érje el a fiókját, ha nem tud bejelentkezni az elsődleges e-mail-fiókjába.
se-content-note-1 =
    Megjegyzés: a másodlagos e-mail-címe nem fogja visszaállítani az
    adatait – ahhoz <a>fiók-helyreállítási kulcs</a> szükséges.
# Default value for the secondary email
se-secondary-email-none = Nincs

## Two Step Auth sub-section on Settings main page

tfa-row-header = Kétlépcsős hitelesítés
tfa-row-enabled = Engedélyezve
tfa-row-disabled-status = Letiltva
tfa-row-action-add = Hozzáadás
tfa-row-action-disable = Letiltás
tfa-row-action-change = Módosítás
tfa-row-button-refresh =
    .title = Kétlépcsős hitelesítés frissítése
tfa-row-cannot-refresh =
    Sajnos probléma merült fel a kétlépéses hitelesítés
    frissítésekor.
tfa-row-enabled-description = Fiókját kétlépcsős hitelesítés védi. Meg kell adnia egy egyszer használatos jelkódot a hitelesítő alkalmazásból, amikor bejelentkezik a { -product-mozilla-account }jába.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Hogyan védi ez a fiókját
tfa-row-disabled-description-v2 = Segítsen biztonságban tartani fiókját azzal, hogy a bejelentkezés második lépéseként egy harmadik féltől származó hitelesítő alkalmazást használ.
tfa-row-cannot-verify-session-4 = Sajnos probléma merült fel a munkamenet megerősítésekor
tfa-row-disable-modal-heading = Letiltja a kétlépcsős hitelesítést?
tfa-row-disable-modal-confirm = Letiltás
tfa-row-disable-modal-explain-1 =
    Ezt a műveletet nem fogja tudni visszavonni. Arra is van
    lehetősége, hogy <linkExternal>lecserélje a tartalék hitelesítési kódjait</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Kétlépcsős hitelesítés letiltva
tfa-row-cannot-disable-2 = A kétlépcsős hitelesítést nem lehetett letiltani
tfa-row-verify-session-info = A kétlépcsős hitelesítés beállításához meg kell erősítenie a jelenlegi munkamenetet

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = A folytatással elfogadja a következőket:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = A { -brand-mozilla } előfizetéses szolgáltatásainak <mozSubscriptionTosLink>Szolgáltatási feltételei</mozSubscriptionTosLink> és <mozSubscriptionPrivacyLink>Adatvédelmi nyilatkozata</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>Szolgáltatási feltételek</mozillaAccountsTos> és az <mozillaAccountsPrivacy>Adatvédelmi nyilatkozat</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = A folytatással elfogadja a <mozillaAccountsTos>Szolgáltatási feltételeket</mozillaAccountsTos> és az <mozillaAccountsPrivacy>Adatvédelmi nyilatkozatot</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Vagy
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Bejelentkezés ezzel:
continue-with-google-button = Folytatás a { -brand-google }-lel
continue-with-apple-button = Folytatás az { -brand-apple }-lel

## Auth-server based errors that originate from backend service

auth-error-102 = Ismeretlen fiók
auth-error-103 = Helytelen jelszó
auth-error-105-2 = Érvénytelen megerősítő kód!
auth-error-110 = Érvénytelen token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Túl sokszor próbálkozott. Próbálja újra később.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Túl sokszor próbálkozott. Próbálja újra { $retryAfter }.
auth-error-125 = A kérés biztonsági okokból blokkolva lett
auth-error-129-2 = Érvénytelen telefonszámot adott meg. Ellenőrizze, és próbálja újra.
auth-error-138-2 = Meg nem erősített munkamenet
auth-error-139 = A másodlagos e-mail-címnek különböznie kell a fiók e-mail-címétől
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Ezt az e-mail-címet egy másik fiók foglalta le. Próbálja újra később, vagy adjon meg egy másik e-mail-címet.
auth-error-155 = A TOTP token nem található
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Nem található tartalék hitelesítési kód
auth-error-159 = Érvénytelen fiók-helyreállítási kulcs
auth-error-183-2 = Érvénytelen vagy lejárt megerősítő kód
auth-error-202 = A funkció nem engedélyezett
auth-error-203 = A rendszer nem érhető el, próbálja újra később
auth-error-206 = Nem hozható létre jelszó, mert már be van állítva egy
auth-error-214 = A helyreállítási telefonszám már létezik
auth-error-215 = A helyreállítási telefonszám nem létezik
auth-error-216 = Az SMS-ek korlátja elérve
auth-error-218 = Nem távolítható el a helyreállítási telefonszám, hiányoznak a tartalék hitelesítési kódok.
auth-error-219 = Ez a telefonszám túl sok fiókkal lett regisztrálva. Próbálkozzon egy másik számmal.
auth-error-999 = Nem várt hiba
auth-error-1001 = Bejelentkezési kísérlet megszakítva
auth-error-1002 = A munkamenet lejárt. Jelentkezzen be a folytatáshoz.
auth-error-1003 = A helyi tároló vagy a sütik továbbra is le vannak tiltva
auth-error-1008 = Az új jelszónak különbözőnek kell lennie
auth-error-1010 = Érvényes jelszó szükséges
auth-error-1011 = Érvényes e-mail-cím szükséges
auth-error-1018 = A megerősítő e-mail visszapattant. Talán elgépelte az e-mail-címét?
auth-error-1020 = Elírta az e-mail-címet? A firefox.com nem érvényes levelezőszolgáltatás.
auth-error-1031 = A regisztrációhoz meg kell adnia az életkorát
auth-error-1032 = A regisztrációhoz érvényes életkort kell megadnia
auth-error-1054 = Érvénytelen kétlépcsős hitelesítési kód
auth-error-1056 = Érvénytelen tartalék hitelesítési kód
auth-error-1062 = Érvénytelen átirányítás
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Elírta az e-mail-címet? A(z) { $domain } nem érvényes levelezőszolgáltatás.
auth-error-1066 = Az e-mail-maszkok nem használhatók fiók létrehozásához.
auth-error-1067 = Elírta az e-mail-címet?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = { $lastFourPhoneNumber } végű szám
oauth-error-1000 = Hiba történt. Zárja be ezt a lapot, és próbálja újra.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Bejelentkezett a { -brand-firefox(case: "illative") }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-mail-cím megerősítve
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Bejelentkezés megerősítve
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Jelentkezzen be ebbe a { -brand-firefox(case: "illative") } a beállítás befejezéséhez
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Bejelentkezés
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Még ad hozzá eszközöket? Jelentkezzen be a { -brand-firefox(case: "illative") } egy másik eszközről a beállítás befejezéséhez
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Jelentkezzen be a { -brand-firefox(case: "illative") } egy másik eszközről a beállítás befejezéséhez
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Szeretné átvinni lapjait, könyvjelzőit és jelszavait egy másik eszközre?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Másik eszköz csatlakoztatása
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Most nem
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Jelentkezzen be a { -brand-firefox } for Androidba a beállítás befejezéséhez
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Jelentkezzen be a { -brand-firefox } for iOS-be a beállítás befejezéséhez

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Helyi tároló és sütik szükségesek
cookies-disabled-enable-prompt-2 = Kérjük, engedélyezze a sütiket és a helyi tárolást a böngészőjében, hogy elérje a { -product-mozilla-account }ját. Ezzel lehetővé válik olyan funkciók, mint az adatok megjegyzése a munkamenetek között.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Próbálja újra
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = További tudnivalók

## Index / home page

index-header = Adja meg az e-mail-címét
index-sync-header = Tovább a { -product-mozilla-account }jához
index-sync-subheader = Szinkronizálja jelszavait, lapjait és könyvjelzőit mindenütt, ahol { -brand-firefox(case: "accusative") } használ.
index-relay-header = Hozzon létre egy e-mail-maszkot
index-relay-subheader = Adja meg azt az e-mail-címet, ahová a maszkolt e-mail-címből érkező leveleket továbbítani szeretné.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Tovább erre: { $serviceName }
index-subheader-default = Folytatás a fiókbeállításokhoz
index-cta = Regisztráljon vagy jelentkezzen be
index-account-info = Egy { -product-mozilla-account } a { -brand-mozilla } további adatvédelmi termékeihez is hozzáférést biztosít.
index-email-input =
    .label = Adja meg az e-mail-címét
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Fiók sikeresen törölve
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = A megerősítő e-mail visszapattant. Talán elgépelte az e-mail-címét?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Hoppá! Nem tudtuk létrehozni a fiók-helyreállítási kulcsát. Próbálja újra később.
inline-recovery-key-setup-recovery-created = Fiók-helyreállítási kulcs létrehozva
inline-recovery-key-setup-download-header = Biztosítsa fiókját
inline-recovery-key-setup-download-subheader = Töltse le és tegye el most
inline-recovery-key-setup-download-info = Tárolja Olyan helyen ezt a kulcsot, amelyre emlékezni fog – később nem fog tudni visszatérni erre az oldalra.
inline-recovery-key-setup-hint-header = Biztonsági javaslat

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Beállítás megszakítása
inline-totp-setup-continue-button = Folytatás
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Adjon egy biztonsági réteget a fiókjához az <authenticationAppsLink>ezen hitelesítő alkalmazások</authenticationAppsLink> egyikéből származó hitelesítési kódok megkövetelésével.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Engedélyezze a kétlépcsős hitelesítést, <span>a fiókbeállításokhoz való továbblépéshez</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Engedélyezze a kétlépcsős hitelesítést <span>a következőhöz való továbblépéshez: { $serviceName }</span>
inline-totp-setup-ready-button = Kész
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Olvassa le a hitelesítési kódot <span>a következőhöz való továbblépéshez: { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Adja meg kézileg a kódot <span>a következőhöz való továbblépéshez: { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Olvassa le a hitelesítési kódot <span>a fiókbeállításokhoz való továbblépéshez</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Adja meg kézileg a kódot <span>a fiókbeállításokhoz való továbblépéshez</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Írja be ezt a titkos kulcsot a hitelesítő alkalmazásba. <toggleToQRButton>Inkább beolvassa a QR-kódot?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Olvassa be a QR-kódot a hitelesítő alkalmazásában, és adja meg az általa biztosított hitelesítési kódot. <toggleToManualModeButton>Nem tudja leolvasni a kódot?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Ha kész, megkezdi az Ön hitelesítési kódjainak előállítását.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Hitelesítési kód
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Hitelesítési kód szükséges
tfa-qr-code-alt = Használja a(z) { $code } kódot a kétlépcsős hitelesítés beállításához a támogatott alkalmazásokban.
inline-totp-setup-page-title = Kétlépcsős hitelesítés

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Jogi információk
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Szolgáltatási feltételek
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Adatvédelmi nyilatkozat

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Adatvédelmi nyilatkozat

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Szolgáltatási feltételek

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Most jelentkezett be a { -product-firefox }ba?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Igen, jóváhagyom az eszközt
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Ha nem Ön volt az, <link>változtassa meg jelszavát</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Eszköz csatlakoztatva
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Most már szinkronizál a következővel: { $deviceFamily } a következőn: { $deviceOS }
pair-auth-complete-sync-benefits-text = Mostantól az összes eszközén elérheti nyitott lapjait, jelszavait és könyvjelzőit.
pair-auth-complete-see-tabs-button = Lapok megtekintése más szinkronizált eszközökről
pair-auth-complete-manage-devices-link = Eszközök kezelése

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Adja meg a hitelesítési kódot <span>a fiókbeállításokhoz való továbblépéshez</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Adja meg a hitelesítési kódot <span>a következőhöz való továbblépéshez: { $serviceName }</span>
auth-totp-instruction = Nyissa meg a hitelesítő alkalmazását, és adja meg az általa adott hitelesítési kódot.
auth-totp-input-label = Adja meg a 6 számjegyű kódot
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Megerősítés
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Hitelesítési kód szükséges

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Most jóváhagyás szükséges <span>a másik eszközéről</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = A párosítás sikertelen
pair-failure-message = A beállítási folyamat megszakításra került.

## Pair index page

pair-sync-header = Szinkronizálja a { -brand-firefox(case: "accusative") } a telefonján vagy táblagépén
pair-cad-header = Csatlakoztassa a { -brand-firefox(case: "accusative") } egy másik eszközön
pair-already-have-firefox-paragraph = Már van { -brand-firefox } a telefonján vagy a táblagépén?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Szinkronizálja az eszközét
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Vagy töltse le
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Olvassa be a { -brand-firefox } mobilra történő letöltéséhez, vagy küldjön magának egy <linkExternal>letöltési hivatkozást</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Most nem
pair-take-your-data-message = Vigye el lapjait, könyvjelzőit és jelszavait bárhová, ahol { -brand-firefox(case: "accusative") } használ.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Kezdő lépések
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-kód

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Eszköz csatlakoztatva
pair-success-message-2 = A párosítás sikeres volt.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Párosítás megerősítése<span> a következővel: { $email }</span>
pair-supp-allow-confirm-button = Párosítás megerősítése
pair-supp-allow-cancel-link = Mégse

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Most jóváhagyás szükséges <span>a másik eszközéről</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Párosítás egy alkalmazás segítségével
pair-unsupported-message = Használta a rendszerkamerát? Párosítania kell egy { -brand-firefox } alkalmazásból.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Jelszó létrehozása a szinkronizáláshoz
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Ez titkosítja az adatait. Különböznie kell a { -brand-google } vagy { -brand-apple }-fiókjához tartozó jelszavától.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Kis türelmet, át lesz irányítva az engedélyezett alkalmazáshoz.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Adja meg a fiók-helyreállítási kulcsát
account-recovery-confirm-key-instruction = Ez a kulcs helyreállítja a titkosított böngészési adatait, mint a jelszavak és a könyvjelzők, a { -brand-firefox } kiszolgálóiról.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Adja meg a 32 karakteres fiók-helyreállítási kulcsát
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = A tárolási emlékeztető:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Folytatás
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Nem találja a fiók-helyreállítási kulcsát?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Új jelszó létrehozása
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Jelszó megadva
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Sajnos probléma merült fel a jelszó megadásakor
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Fiók-helyreállítási kulcs használata
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = A mesterjelszó törölve
reset-password-complete-banner-message = Ne felejtsen el egy új fiók-helyreállítási kulcsot előállítani a { -product-mozilla-account } beállításaiban, hogy megakadályozza a jövőbeli bejelentkezési problémákat.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Adja meg a 10 karakteres kódot
confirm-backup-code-reset-password-confirm-button = Megerősítés
confirm-backup-code-reset-password-subheader = Adjon meg egy tartalék hitelesítési kódot
confirm-backup-code-reset-password-instruction = Adja meg a kétlépcsős hitelesítés beállításakor mentett egyszer használatos kódok egyikét.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Kizárta magát?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Ellenőrizze a leveleit
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Elküldtünk egy megerősítő kódot a következő címre: <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Adja meg a 8 számjegyű kódot 10 percen belül
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Folytatás
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Kód újraküldése
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Másik fiók használata

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Jelszó visszaállítása
confirm-totp-reset-password-subheader-v2 = Adja meg a kétlépcsős hitelesítési kódot
confirm-totp-reset-password-instruction-v2 = Ellenőrizze a <strong>hitelesítő alkalmazását</strong>, hogy visszaállítsa a jelszavát.
confirm-totp-reset-password-trouble-code = Nem tudja beírni a kódot?
confirm-totp-reset-password-confirm-button = Megerősítés
confirm-totp-reset-password-input-label-v2 = Adja meg a 6 számjegyű kódot
confirm-totp-reset-password-use-different-account = Másik fiók használata

## ResetPassword start page

password-reset-flow-heading = Jelszó visszaállítása
password-reset-body-2 = Kérdezünk néhány dolgot, melyet csak Ön tud, hogy biztonságban tartsa a fiókját.
password-reset-email-input =
    .label = Adja meg az e-mail-címét
password-reset-submit-button-2 = Folytatás

## ResetPasswordConfirmed

reset-password-complete-header = A jelszó vissza lett állítva
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Tovább erre: { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Jelszó visszaállítása
password-reset-recovery-method-subheader = Válasszon helyreállítási módot
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = A helyreállítási módok segítségével meggyőződünk arról, hogy Ön az.
password-reset-recovery-method-phone = Helyreállítási telefonszám
password-reset-recovery-method-code = Tartalék hitelesítési kódok
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kód maradt
       *[other] { $numBackupCodes } kód maradt
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Hiba történt a kód helyreállítási telefonra küldésekor
password-reset-recovery-method-send-code-error-description = Próbálja meg később, vagy használja a tartalék hitelesítési kódjait.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Jelszó visszaállítása
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Adja meg a helyreállítási kódot
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = SMS-ben egy 6 számjegyű kód lett küldve a(z) <span>{ $lastFourPhoneDigits }</span> végű telefonszámra. Ez a kód 5 perc után lejár. Ne ossza meg ezt a kódot másokkal.
reset-password-recovery-phone-input-label = Adja meg a 6 számjegyű kódot
reset-password-recovery-phone-code-submit-button = Megerősítés
reset-password-recovery-phone-resend-code-button = Kód újraküldése
reset-password-recovery-phone-resend-success = Kód elküldve
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Kizárta magát?
reset-password-recovery-phone-send-code-error-heading = Hiba történt a kód küldésekor
reset-password-recovery-phone-code-verification-error-heading = Hiba történt a kód ellenőrzésekor
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Próbálja meg újra később.
reset-password-recovery-phone-invalid-code-error-description = A kód érvénytelen vagy lejárt.
reset-password-recovery-phone-invalid-code-error-link = Inkább tartalék hitelesítési kódokat használ?
reset-password-with-recovery-key-verified-page-title = Jelszó sikeresen visszaállítva
reset-password-complete-new-password-saved = Új jelszó elmentve!
reset-password-complete-recovery-key-created = Új fiók-helyreállítási kulcs létrehozva. Töltse le és tárolja most.
reset-password-complete-recovery-key-download-info =
    Ez a kulcs elengedhetetlen az adat-helyreállításhoz,
    ha elfelejti a jelszavát. <b>Töltse le és tárolja biztonságosan most,
    mert később nem fogja tudni újra elérni ezt az oldalt.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Hiba:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Bejelentkezés ellenőrzése…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Megerősítési hiba
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = A megerősítő hivatkozás lejárt
signin-link-expired-message-2 = A hivatkozás, amelyre kattintott, lejárt, vagy már használták.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Adja meg a <span>{ -product-mozilla-account }</span> jelszavát
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Tovább erre: { $serviceName }
signin-subheader-without-logo-default = Folytatás a fiókbeállításokhoz
signin-button = Bejelentkezés
signin-header = Bejelentkezés
signin-use-a-different-account-link = Másik fiók használata
signin-forgot-password-link = Elfelejtette a jelszót?
signin-password-button-label = Jelszó
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.
signin-code-expired-error = A kód lejárt. Jelentkezzen be újra.
signin-account-locked-banner-heading = Jelszó visszaállítása
signin-account-locked-banner-description = Fiókját zároltuk, hogy biztonságban legyen a gyanús tevékenységektől.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = A bejelentkezéshez állítsa vissza a jelszavát

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = A hivatkozásból karakterek hiányoztak, ezt az e-mail-kliense ronthatta el. Másolja be a címet körültekintően, és próbálja újra.
report-signin-header = Jelenti a jogosulatlan bejelentkezést?
report-signin-body = Levelet kapott arról, hogy megpróbáltak hozzáférni a fiókjához. Szeretné gyanúsnak jelenteni ezt a tevékenységet?
report-signin-submit-button = Tevékenység jelentése
report-signin-support-link = Miért történik ez?
report-signin-error = Elnézést, hiba történt a jelentés beküldésekor.
signin-bounced-header = Sajnáljuk. A fiókját zároltuk.
# $email (string) - The user's email.
signin-bounced-message = A megerősítő e-mail elküldésre került ide: { $email }, de az visszatért, így zároltuk a fiókját, hogy megvédjük a { -brand-firefox(case: "inessive") } tárolt adatait.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Ha ez egy érvényes e-mail-cím, <linkExternal>tudassa velünk</linkExternal>, és segítünk feloldani a fiókját.
signin-bounced-create-new-account = Már nem az Öné az e-mail-cím? Hozzon létre új fiókot
back = Vissza

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Ellenőrizze ezt a bejelentkezést <span>a fiókbeállításokhoz való továbblépéshez</span>
signin-push-code-heading-w-custom-service = Erősítse meg ezt a bejelentkezést <span>a következőhöz való továbblépéshez: { $serviceName }</span>
signin-push-code-instruction = Ellenőrizze a többi eszközét, és hagyja jóvá ezt a bejelentkezést a { -brand-firefox } böngészőjéből.
signin-push-code-did-not-recieve = Nem kapta meg az értesítést?
signin-push-code-send-email-link = E-mail-kód

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Erősítse meg a bejelentkezését
signin-push-code-confirm-description = Bejelentkezési kísérletet észleltünk a következő eszközről. Ha ez Ön volt, hagyja jóvá a bejelentkezését
signin-push-code-confirm-verifying = Ellenőrzés
signin-push-code-confirm-login = Bejelentkezés megerősítése
signin-push-code-confirm-wasnt-me = Nem én voltam, a jelszó megváltoztatása.
signin-push-code-confirm-login-approved = A bejelentkezése jóvá lett hagyva. Zárja be ezt az ablakot.
signin-push-code-confirm-link-error = A hivatkozás sérült. Próbálja meg újra.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Bejelentkezés
signin-recovery-method-subheader = Válasszon helyreállítási módot
signin-recovery-method-details = A helyreállítási módok segítségével meggyőződünk arról, hogy Ön az.
signin-recovery-method-phone = Helyreállítási telefonszám
signin-recovery-method-code-v2 = Tartalék hitelesítési kódok
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kód maradt
       *[other] { $numBackupCodes } kód maradt
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Hiba történt a kód helyreállítási telefonra küldésekor
signin-recovery-method-send-code-error-description = Próbálja meg később, vagy használja a tartalék hitelesítési kódjait.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Bejelentkezés
signin-recovery-code-sub-heading = Adjon meg egy tartalék hitelesítési kódot
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Adja meg a kétlépcsős hitelesítés beállításakor mentett egyszer használatos kódok egyikét.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Adja meg a 10 karakteres kódot
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Megerősítés
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Helyreállítási telefonszám használata
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Kizárta magát?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Tartalék hitelesítési kód szükséges
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Hiba történt a kód helyreállítási telefonra küldésekor
signin-recovery-code-use-phone-failure-description = Próbálja meg újra később.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Bejelentkezés
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Adja meg a helyreállítási kódot
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = SMS-ben egy hatjegyű kód lett küldve a(z) <span>{ $lastFourPhoneDigits }</span> végű telefonszámra. Ez a kód 5 perc után lejár. Ne ossza meg ezt a kódot másokkal.
signin-recovery-phone-input-label = Adja meg a 6 számjegyű kódot
signin-recovery-phone-code-submit-button = Megerősítés
signin-recovery-phone-resend-code-button = Kód újraküldése
signin-recovery-phone-resend-success = Kód elküldve
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Kizárta magát?
signin-recovery-phone-send-code-error-heading = Hiba történt a kód küldésekor
signin-recovery-phone-code-verification-error-heading = Hiba történt a kód ellenőrzésekor
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Próbálja meg újra később.
signin-recovery-phone-invalid-code-error-description = A kód érvénytelen vagy lejárt.
signin-recovery-phone-invalid-code-error-link = Inkább tartalék hitelesítési kódokat használ?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Sikeresen bejelentkezett. Korlátozások merülhetnek fel, ha újra használja a helyreállítási telefonszámát.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Köszönjük az éberségét
signin-reported-message = Értesítette csapatunkat. Az ilyen jelentések segítenek kivédeni a behatolókat.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Adja meg a megerősítő kódot<span> a { -product-mozilla-account }</span> számára
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Adja meg 5 percen belül a(z) <email>{ $email }</email> címre küldött kódot.
signin-token-code-input-label-v2 = Adja meg a 6 számjegyű kódot
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Megerősítés
signin-token-code-code-expired = A kód lejárt?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Új kód elküldése e-mailben.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Megerősítési kód szükséges
signin-token-code-resend-error = Hiba történt. Nem sikerült új kódot küldeni.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Bejelentkezés
signin-totp-code-subheader-v2 = Adja meg a kétlépcsős hitelesítési kódot
signin-totp-code-instruction-v4 = Ellenőrizze a <strong>hitelesítő alkalmazását</strong>, hogy megerősítse bejelentkezését.
signin-totp-code-input-label-v4 = Adja meg a 6 számjegyű kódot
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Miért kérjük, hogy hitelesítsen?
signin-totp-code-aal-banner-content = Beállította a kétlépcsős hitelesítést a fiókjában, de még nem jelentkezett be kóddal ezen az eszközön.
signin-totp-code-aal-sign-out = Jelentkezzen ki ezen az eszközön
signin-totp-code-aal-sign-out-error = Sajnos probléma merült fel a kijelentkezésekor
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Megerősítés
signin-totp-code-other-account-link = Másik fiók használata
signin-totp-code-recovery-code-link = Nem tudja beírni a kódot?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Hitelesítési kód szükséges
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Engedélyezze ezt a bejelentkezést
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Ellenőrizze a leveleit, hogy megérkezett-e az ide küldött engedélyezési kód: { $email }.
signin-unblock-code-input = Adja meg az engedélyezési kódot
signin-unblock-submit-button = Folytatás
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Engedélyezési kód szükséges
signin-unblock-code-incorrect-length = Az engedélyezési kódnak 8 karakterből kell állnia
signin-unblock-code-incorrect-format-2 = Az engedélyezési kód csak betűket és/vagy számokat tartalmazhat
signin-unblock-resend-code-button = Nincs a beérkezett vagy a levélszemét mappában? Újraküldés
signin-unblock-support-link = Miért történik ez?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Adja meg a megerősítő kódot
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Adja meg a megerősítő kódot <span>a { -product-mozilla-account }</span> számára
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Adja meg 5 percen belül a(z) <email>{ $email }</email> címre küldött kódot.
confirm-signup-code-input-label = Adja meg a 6 számjegyű kódot
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Megerősítés
confirm-signup-code-sync-button = Szinkronizálás indítása
confirm-signup-code-code-expired = A kód lejárt?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Új kód elküldése e-mailben.
confirm-signup-code-success-alert = A fiók sikeresen megerősítve
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Megerősítési kód szükséges
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = Bejelentkezés után a { -brand-firefox } megpróbálja visszaküldeni Önt az e-mail-maszk használatához.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Jelszó létrehozása
signup-relay-info = Egy jelszóra van szükség a maszkolt e-mailek biztonságos kezeléséhez és a { -brand-mozilla } biztonsági eszközeinek eléréséhez.
signup-sync-info = Szinkronizálja jelszavait, könyvjelzőit és egyebeket mindenhol, ahol a { -brand-firefox }ot használja.
signup-sync-info-with-payment = Szinkronizálja jelszavait, fizetési módjait, könyvjelzőit és egyebeket mindenhol, ahol a { -brand-firefox }ot használja.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = E-mail-cím módosítása

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = A szinkronizálás be van kapcsolva
signup-confirmed-sync-success-banner = A { -product-mozilla-account } megerősítve
signup-confirmed-sync-button = Böngészés megkezdése
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Jelszavai, fizetési módjai, címei, könyvjelzői, előzményei és egyebei mindenhol szinkronizálhatóak, ahol a { -brand-firefox }ot használja.
signup-confirmed-sync-description-v2 = Jelszavai, címei, könyvjelzői, előzményei és egyebei mindenhol szinkronizálhatóak, ahol a { -brand-firefox }ot használja.
signup-confirmed-sync-add-device-link = További eszköz hozzáadása
signup-confirmed-sync-manage-sync-button = Szinkronizálás kezelése
signup-confirmed-sync-set-password-success-banner = Szinkronizálási jelszó létrehozva
