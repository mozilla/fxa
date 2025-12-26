# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Na vaš e-poštni naslov je bila poslana nova koda.
resend-link-success-banner-heading = Na vaš e-poštni naslov je bila poslana nova povezava.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Dodajte { $accountsEmail } med stike, da zagotovite nemoteno dostavo.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Zapri pasico
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts(zacetnica: "velika") } se bodo s 1. novembrom preimenovali v { -product-mozilla-accounts(sklon: "tozilnik") }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Še vedno se boste prijavljali z istim uporabniškim imenom in geslom, izdelki, ki jih uporabljate, pa se ne bodo spremenili.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = { -product-firefox-accounts(sklon: "tozilnik") } smo preimenovali v { -product-mozilla-accounts(sklon: "tozilnik") }. Prijavite se lahko z istim uporabniškim imenom in geslom kot doslej, prav tako pa se niso spremenili izdelki, ki jih uporabljate.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Več o tem
# Alt text for close banner image
brand-close-banner =
    .alt = Zapri pasico
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logotip { -brand-mozilla(sklon: "rodilnik") } "m"

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Nazaj
button-back-title = Nazaj

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Prenesi in nadaljuj
    .title = Prenesi in nadaljuj
recovery-key-pdf-heading = Ključ za obnovitev računa
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Ustvarjen: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Ključ za obnovitev računa
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Ta ključ vam omogoča obnovitev šifriranih podatkov brskalnika (vključno z gesli, zaznamki in zgodovino), če pozabite geslo. Shranite ga na mesto, ki si ga boste zapomnili.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Mesta za shranjevanje ključev
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Preberite več o ključu za obnovitev računa
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Pri prenosu ključa za obnovitev računa je prišlo do težave.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Izkoristite { -brand-mozilla(sklon: "tozilnik") }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Bodite na tekočem z našimi novicami in posodobitvami izdelkov
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Zgodnji dostop za preizkušanje novih izdelkov
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Pozivi k ukrepanju za povrnitev interneta

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Preneseno
datablock-copy =
    .message = Kopirano
datablock-print =
    .message = Natisnjeno

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Koda kopirana
        [two] Kodi kopirani
        [few] Kode kopirane
       *[other] Kode kopirane
    }
datablock-download-success =
    { $count ->
        [one] Koda prenesena
        [two] Kodi preneseni
        [few] Kode prenesene
       *[other] Kode prenesene
    }
datablock-print-success =
    { $count ->
        [one] Koda natisnjena
        [two] Kodi natisnjeni
        [few] Kode natisnjene
       *[other] Kode natisnjene
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Kopirano

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (ocena)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (ocena)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (ocena)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (ocena)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Neznana lokacija
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } v { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Naslov IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Geslo
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ponovite geslo
form-password-with-inline-criteria-signup-submit-button = Ustvari račun
form-password-with-inline-criteria-reset-new-password =
    .label = Novo geslo
form-password-with-inline-criteria-confirm-password =
    .label = Potrdite geslo
form-password-with-inline-criteria-reset-submit-button = Ustvarite novo geslo
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Geslo
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ponovite geslo
form-password-with-inline-criteria-set-password-submit-button = Začni s sinhronizacijo
form-password-with-inline-criteria-match-error = Gesli se ne ujemata
form-password-with-inline-criteria-sr-too-short-message = Geslo mora vsebovati vsaj 8 znakov.
form-password-with-inline-criteria-sr-not-email-message = Geslo ne sme vsebovati vašega e-poštnega naslova.
form-password-with-inline-criteria-sr-not-common-message = Ne smete uporabiti pogosto uporabljenega gesla.
form-password-with-inline-criteria-sr-requirements-met = Vneseno geslo izpolnjuje vse zahteve.
form-password-with-inline-criteria-sr-passwords-match = Vneseni gesli se ujemata.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = To polje je obvezno

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Za nadaljevanje vnesite { $codeLength }-mestno kodo
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Za nadaljevanje vnesite { $codeLength }-znakovno kodo

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Ključ za obnovitev { -brand-firefox } Računa
get-data-trio-title-backup-verification-codes = Rezervne overitvene kode
get-data-trio-download-2 =
    .title = Prenesi
    .aria-label = Prenesi
get-data-trio-copy-2 =
    .title = Kopiraj
    .aria-label = Kopiraj
get-data-trio-print-2 =
    .title = Natisni
    .aria-label = Natisni

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Opozorilo
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Pozor
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Opozorilo
authenticator-app-aria-label =
    .aria-label = Aplikacija za overitev
backup-codes-icon-aria-label-v2 =
    .aria-label = Rezervne overitvene kode so omogočene
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Rezervne overitvene kode so onemogočene
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Obnovitev z SMS omogočena
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Obnovitev z SMS onemogočena
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadska zastava
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Kljukica
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Uspeh
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Omogočeno
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Zapri sporočilo
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Koda
error-icon-aria-label =
    .aria-label = Napaka
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informacija
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Zastava ZDA

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Računalnik in mobilni telefon ter na vsakem podoba zlomljenega srca
hearts-verified-image-aria-label =
    .aria-label = Računalnik, mobilni telefon in tablica ter na vsakem podoba utripajočega srca
signin-recovery-code-image-description =
    .aria-label = Dokument, ki vsebuje skrito besedilo.
signin-totp-code-image-label =
    .aria-label = Naprava s skrito 6-mestno kodo.
confirm-signup-aria-label =
    .aria-label = Ovojnica s povezavo
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Slika, ki predstavlja ključ za obnovitev računa.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Slika, ki predstavlja ključ za obnovitev računa.
password-image-aria-label =
    .aria-label = Ilustracija tipkanja gesla.
lightbulb-aria-label =
    .aria-label = Slika, ki predstavlja ustvarjanje namiga za shranjevanje.
email-code-image-aria-label =
    .aria-label = Ilustracija, ki upodablja e-poštno sporočilo s kodo.
recovery-phone-image-description =
    .aria-label = Mobilnik, ki prejme sporočilo s kodo.
recovery-phone-code-image-description =
    .aria-label = Koda, prejeta na mobilno napravo.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilnik z možnostjo prejemanja sporočil SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Zaslon naprave s kodami
sync-clouds-image-aria-label =
    .aria-label = Oblaki z ikono za sinhronizacijo
confetti-falling-image-aria-label =
    .aria-label = Animirani padajoči konfeti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Prijavljeni ste v { -brand-firefox }.
inline-recovery-key-setup-create-header = Zavarujte svoj račun
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Imate minuto za zaščito svojih podatkov?
inline-recovery-key-setup-info = Ustvarite ključ za obnovitev računa, ki vam bo omogočal obnoviti sinhronizirane podatke v primeru, da kadarkoli pozabite geslo.
inline-recovery-key-setup-start-button = Ustvari ključ za obnovitev računa
inline-recovery-key-setup-later-button = Pozneje

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Skrij geslo
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Pokaži geslo
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Vaše geslo je trenutno vidno na zaslonu.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Vaše geslo je trenutno skrito.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Vaše geslo je zdaj vidno na zaslonu.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Vaše geslo je zdaj skrito.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Izberite državo
input-phone-number-enter-number = Vnesite telefonsko številko
input-phone-number-country-united-states = Združene države Amerike
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Nazaj

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Povezava za ponastavitev gesla je poškodovana
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Potrditvena povezava je poškodovana
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Povezava poškodovana
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Povezavi, ki ste jo kliknili, so manjkali nekateri znaki. Morda jo je pokvaril vaš poštni odjemalec. Bodite previdni pri kopiranju in poskusite znova.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Prejmi novo povezavo

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Se spomnite gesla?
# link navigates to the sign in page
remember-password-signin-link = Prijava

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Glavni e-poštni naslov je že potrjen
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Prijava je že potrjena
confirmation-link-reused-message = Ta potrditvena povezava je bila že uporabljena, uporabiti pa jo je mogoče le enkrat.

## Locale Toggle Component

locale-toggle-select-label = Izberi jezik
locale-toggle-browser-default = Privzeti v brskalniku
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Zahteva z napako

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = To geslo potrebujete za dostop do šifriranih podatkov, ki jih shranjujete pri nas.
password-info-balloon-reset-risk-info = Ponastavitev lahko povzroči izgubo podatkov, kot so gesla in zaznamki.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Izberite močno geslo, ki ga ne uporabljate na drugih spletnih mestih. Zagotovite, da ustreza varnostnim zahtevam:
password-strength-short-instruction = Izberite močno geslo:
password-strength-inline-min-length = vsebuje vsaj 8 znakov
password-strength-inline-not-email = ni vaš e-poštni naslov
password-strength-inline-not-common = ni eno od pogostih gesel
password-strength-inline-confirmed-must-match = Potrditev se ujema z novim geslom
password-strength-inline-passwords-match = Gesli se ujemata

## Notification Promo Banner component

account-recovery-notification-cta = Ustvari
account-recovery-notification-header-value = Ne izgubite podatkov, če pozabite geslo
account-recovery-notification-header-description = Ustvarite ključ, ki omogoča obnovitev sinhroniziranih podatkov iz računa v primeru, da kadarkoli pozabite geslo.
recovery-phone-promo-cta = Dodaj telefonsko številko za obnovitev
recovery-phone-promo-heading = Dodatno zaščitite svoj račun s telefonsko številko za obnovitev
recovery-phone-promo-description = Zdaj se lahko prijavite z enkratnim geslom preko sporočila SMS, če ne morete uporabiti aplikacije za overjanje v dveh korakih.
recovery-phone-promo-info-link = Preberite več o tveganju pri obnovi in zamenjavi SIM-kartice
promo-banner-dismiss-button =
    .aria-label = Skrij pasico

## Ready component

ready-complete-set-up-instruction = Dokončajte namestitev z vnosom novega gesla v drugih napravah { -brand-firefox }.
manage-your-account-button = Upravljajte račun
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Zdaj ste pripravljeni na uporabo storitve { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Zdaj lahko uporabljate nastavitve računa
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Vaš račun je pripravljen!
ready-continue = Nadaljuj
sign-in-complete-header = Prijava potrjena
sign-up-complete-header = Račun potrjen
primary-email-verified-header = Glavni e-poštni naslov potrjen

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Mesta za shranjevanje ključa:
flow-recovery-key-download-storage-ideas-folder-v2 = Mapa v varni napravi
flow-recovery-key-download-storage-ideas-cloud = zaupanja vredna shramba v oblaku
flow-recovery-key-download-storage-ideas-print-v2 = Natisnjena fizična kopija
flow-recovery-key-download-storage-ideas-pwd-manager = upravitelj gesel

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Dodajte namig, da boste lažje našli svoj ključ
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Ta namig si vam bo pomagal zapomniti, kje ste shranili ključ za obnovitev računa. Lahko vam ga pokažemo med ponastavljanjem gesla, da boste lahko obnovili svoje podatke.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Vnesite namig (izbirno)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Dokončaj
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Namig lahko vsebuje največ 255 znakov.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Namig ne sme vsebovati nevarnih znakov unicode. Dovoljene so samo črke, številke, ločila in simboli.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Opozorilo
password-reset-chevron-expanded = Skrči opozorilo
password-reset-chevron-collapsed = Razširi opozorilo
password-reset-data-may-not-be-recovered = Podatkov brskalnika morda ne bo mogoče obnoviti
password-reset-previously-signed-in-device-2 = Imate kakšno napravo, na kateri ste se že kdaj prej prijavili?
password-reset-data-may-be-saved-locally-2 = Podatki brskalnika so morda shranjeni na tej napravi. Ponastavite geslo, nato pa se prijavite, s čimer boste obnovili in sinhronizirali podatke.
password-reset-no-old-device-2 = Imate novo napravo, nimate pa dostopa do nobene izmed prejšnjih?
password-reset-encrypted-data-cannot-be-recovered-2 = Žal nam je, toda šifriranih podatkov brskalnika iz { -brand-firefox }ovih strežnikov ni mogoče obnoviti.
password-reset-warning-have-key = Imate ključ za obnovitev računa?
password-reset-warning-use-key-link = Uporabite ga za ponastavitev gesla in ohranitev podatkov

## Alert Bar

alert-bar-close-message = Zapri sporočilo

## User's avatar

avatar-your-avatar =
    .alt = Vaš avatar
avatar-default-avatar =
    .alt = Privzeti avatar

##


# BentoMenu component

bento-menu-title-3 = Izdelki { -brand-mozilla }
bento-menu-tagline = Več izdelkov { -brand-mozilla(sklon: "rodilnik") }, ki varujejo vašo zasebnost
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Brskalnik { -brand-firefox } za namizja
bento-menu-firefox-mobile = Mobilni brskalnik { -brand-firefox }
bento-menu-made-by-mozilla = Izpod rok { -brand-mozilla(sklon: "rodilnik") }

## Connect another device promo

connect-another-fx-mobile = Prenesite si { -brand-firefox } na telefon ali tablični računalnik
connect-another-find-fx-mobile-2 = Poiščite { -brand-firefox } v trgovini { -google-play } in { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Prenesite { -brand-firefox(sklon: "tozilnik") } iz trgovine { -google-play }
connect-another-app-store-image-3 =
    .alt = Prenesite { -brand-firefox(sklon: "tozilnik") } iz trgovine { -app-store }

## Connected services section

cs-heading = Povezane storitve
cs-description = Vse, kar uporabljate in kamor ste prijavljeni.
cs-cannot-refresh =
    Oprostite, prišlo je do težave pri osveževanju seznama povezanih
    storitev.
cs-cannot-disconnect = Odjemalec ni najden, povezave ni bilo mogoče prekiniti
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Odjavljeno iz storitve { $service }
cs-refresh-button =
    .title = Osveži povezane storitve
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Manjkajoči ali podvojeni elementi?
cs-disconnect-sync-heading = Odklopi od Synca

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Vaši podatki o brskanju bodo ostali v napravi <span>{ $device }</span>,
    vendar se ne bodo več sinhronizirali z vašim računom.
cs-disconnect-sync-reason-3 = Kaj je glavni razlog za prekinitev povezave z napravo <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Naprava je:
cs-disconnect-sync-opt-suspicious = sumljiva
cs-disconnect-sync-opt-lost = izgubljena ali ukradena
cs-disconnect-sync-opt-old = stara ali zamenjana
cs-disconnect-sync-opt-duplicate = podvojena
cs-disconnect-sync-opt-not-say = raje ne bi povedal

##

cs-disconnect-advice-confirm = Razumem
cs-disconnect-lost-advice-heading = Povezava z izgubljeno/ukradeno napravo je prekinjena
cs-disconnect-lost-advice-content-3 = Ker je bila vaša naprava izgubljena oziroma ukradena, morate zaradi varnosti svojih podatkov spremeniti geslo { -product-mozilla-account(sklon: "rodilnik") } v nastavitvah. Prav tako pri proizvajalcu naprave preverite, ali obstaja možnost za izbris podatkov na daljavo.
cs-disconnect-suspicious-advice-heading = Povezava s sumljivo napravo je prekinjena
cs-disconnect-suspicious-advice-content-2 = Če je naprava, ki ste jo odklopili, res sumljiva, morate zaradi varnosti svojih podatkov spremeniti geslo { -product-mozilla-account(sklon: "rodilnik") } v nastavitvah. Spremeniti bi morali tudi vsa gesla, ki ste jih shranili v { -brand-firefox }, tako da v naslovno vrstico vtipkate about:logins.
cs-sign-out-button = Odjava

## Data collection section

dc-heading = Zbiranje in uporaba podatkov
dc-subheader-moz-accounts = { -product-mozilla-accounts(zacetnica: "velika") }
dc-subheader-ff-browser = Brskalnik { -brand-firefox }
dc-subheader-content-2 = Dovoli { -product-mozilla-accounts(sklon: "dajalnik") } pošiljanje tehničnih in interakcijskih podatkov { -brand-mozilla(sklon: "dajalnik") }.
dc-subheader-ff-content = Nastavitve tehničnih in interakcijskih podatkov brskalnika { -brand-firefox } lahko pregledate ali spremenite v nastavitvah na zavihku Zasebnost in varnost.
dc-opt-out-success-2 = Odjava je uspela. { -product-mozilla-accounts } { -brand-mozilla(sklon: "rodilnik") } ne bodo pošiljali tehničnih ali interakcijskih podatkov.
dc-opt-in-success-2 = Hvala! Z deljenjem teh podatkov nam pomagate izboljševati { -product-mozilla-accounts(sklon: "tozilnik") }.
dc-opt-in-out-error-2 = Oprostite, pri spreminjanju nastavitve o zbiranju podatkov je prišlo do težave
dc-learn-more = Več o tem

# DropDownAvatarMenu component

drop-down-menu-title-2 = Meni { -product-mozilla-account(sklon: "rodilnik") }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Prijavljeni kot
drop-down-menu-sign-out = Odjava
drop-down-menu-sign-out-error-2 = Oprostite, prišlo je do težave pri odjavljanju

## Flow Container

flow-container-back = Nazaj

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Iz varnostnih razlogov znova vnesite geslo
flow-recovery-key-confirm-pwd-input-label = Vnesite svoje geslo
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Ustvari ključ za obnovitev računa
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Ustvari nov ključ za obnovitev računa

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Ključ za obnovitev računa ustvarjen – prenesite in shranite ga zdaj
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Ta ključ vam omogoča obnovitev podatkov v primeru, da pozabite geslo. Prenesite ga zdaj in ga shranite na kraj, ki si ga boste zapomnili – na to stran se pozneje ne boste mogli vrniti.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Nadaljuj brez prenosa

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Ključ za obnovitev računa ustvarjen

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Ustvarite ključ za obnovitev računa, če pozabite geslo
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Spremenite ključ za obnovitev računa
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Podatke o brskanju – gesla, zaznamke in drugo – šifriramo. To je odlično z vidika varovanja zasebnosti, vendar hkrati pomeni, da so podatki izgubljeni, če pozabite geslo.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Zato je ustvarjanje ključa za obnovitev računa tako pomembno – z njim lahko obnovite svoje podatke.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Začnite
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Prekliči

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Povežite se z aplikacijo za overitev
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>1. korak:</strong> skenirajte to kodo QR s katerokoli aplikacijo za overjanje, kot sta na primer Duo in Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-koda za nastavitev overjanja v dveh korakih. Skenirajte ali izberite "Ne morete prebrati kode QR?", če želite namesto tega dobiti tajni ključ za nastavitev.
flow-setup-2fa-cant-scan-qr-button = Ne morete prebrati kode QR?
flow-setup-2fa-manual-key-heading = Ročno vnesite kodo
flow-setup-2fa-manual-key-instruction = <strong>1. korak:</strong> vnesite to kodo v želeno aplikacijo za overjanje.
flow-setup-2fa-scan-qr-instead-button = Želite namesto tega skenirati QR-kodo?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Preberite več o aplikacijah za overjanje
flow-setup-2fa-button = Nadaljuj
flow-setup-2fa-step-2-instruction = <strong>2. korak:</strong> Vnesite kodo iz aplikacije za overitev.
flow-setup-2fa-input-label = Vnesite 6-mestno kodo
flow-setup-2fa-code-error = Neveljavna ali pretečena koda. Preverite v aplikaciji za overjanje in poskusite znova.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Izberite način obnovitve
flow-setup-2fa-backup-choice-description = To vam omogoča prijavo, če nimate dostopa do mobilne naprave ali aplikacije za overjanje.
flow-setup-2fa-backup-choice-phone-title = Telefonska številka za obnovitev
flow-setup-2fa-backup-choice-phone-badge = Najenostavnejši
flow-setup-2fa-backup-choice-phone-info = Prejmite obnovitveno kodo v besedilnem sporočilu. Trenutno na voljo le v ZDA in Kanadi.
flow-setup-2fa-backup-choice-code-title = Rezervne overitvene kode
flow-setup-2fa-backup-choice-code-badge = Najvarnejši
flow-setup-2fa-backup-choice-code-info = Ustvarite in shranite enkratne overitvene kode.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Spoznajte tveganje pri obnovi in zamenjavi SIM-kartice

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Vnesite rezervno overitveno kodo
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Z vnosom potrdite, da ste shranili kode. Brez teh kod se morda ne boste mogli prijaviti, če ne boste imeli aplikacije za overjanje.
flow-setup-2fa-backup-code-confirm-code-input = Vnesite 10-mestno kodo
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Končaj

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Shrani rezervne overitvene kode
flow-setup-2fa-backup-code-dl-save-these-codes = Shranite jih na mestu, ki si jih boste zapomnili. Če nimate dostopa do aplikacije za overitev, jo boste morali za prijavo vnesti.
flow-setup-2fa-backup-code-dl-button-continue = Nadaljuj

##

flow-setup-2fa-inline-complete-success-banner = Overitev v dveh korakih je omogočena
flow-setup-2fa-inline-complete-success-banner-description = Za zaščito vseh povezanih naprav se odjavite na vseh mestih, kjer uporabljate ta račun, in se nato prijavite z novim overjanjem v dveh korakih.
flow-setup-2fa-inline-complete-backup-code = Rezervne overitvene kode
flow-setup-2fa-inline-complete-backup-phone = Telefonska številka za obnovitev
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Preostala je koda { $count }
        [two] Ostaja še { $count } kod
        [few] Ostaja še { $count } kod
       *[other] Ostaja še { $count } kod
    }
flow-setup-2fa-inline-complete-backup-code-description = To je najvarnejša metoda obnovitve, če nimate možnosti prijave z mobilno napravo ali z aplikacijo za overjanje.
flow-setup-2fa-inline-complete-backup-phone-description = To je najpreprostejša metoda obnovitve, če se nimate možnosti prijaviti v aplikacijo za overjanje.
flow-setup-2fa-inline-complete-learn-more-link = Kako to ščiti vaš račun
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Nadaljuj v { $serviceName }
flow-setup-2fa-prompt-heading = Nastavite overjanje v dveh korakih
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } zahteva, da za varnost računa nastavite overjanje v dveh korakih.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Za nadaljevanje lahko uporabite katerokoli od <authenticationAppsLink>naslednjih aplikacij za overjanje</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Nadaljuj

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Vnesite potrditveno kodo
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Na <span>{ $phoneNumber }</span> je bilo poslano sporočilo SMS s šestmestno kodo. Koda poteče po 5 minutah.
flow-setup-phone-confirm-code-input-label = Vnesite 6-mestno kodo
flow-setup-phone-confirm-code-button = Potrdi
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Je koda potekla?
flow-setup-phone-confirm-code-resend-code-button = Znova pošlji kodo
flow-setup-phone-confirm-code-resend-code-success = Koda poslana
flow-setup-phone-confirm-code-success-message-v2 = Telefonska številka za obnovitev je dodana
flow-change-phone-confirm-code-success-message = Telefonska številka za obnovitev je spremenjena

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Potrdite svojo telefonsko številko
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Od { -brand-mozilla(sklon: "rodilnik") } boste prejeli sporočilo SMS s kodo za potrditev številke. Kode ne pokažite nikomur drugemu.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Telefonska številka za obnovitev je na voljo samo v ZDA in Kanadi. Uporabe številk VoIP in telefonskih mask ne priporočamo.
flow-setup-phone-submit-number-legal = Z vnosom telefonske številke soglašate, da jo shranimo z izključnim namenom pošiljanja sporočil za potrditev računa. Nastanejo lahko stroški sporočil in prenosa podatkov.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Pošlji kodo

## HeaderLockup component, the header in account settings

header-menu-open = Zapri meni
header-menu-closed = Meni za krmarjenje po strani
header-back-to-top-link =
    .title = Nazaj na vrh
header-back-to-settings-link =
    .title = Nazaj na nastavitve { -product-mozilla-account(sklon: "rodilnik") }
header-title-2 = { -product-mozilla-account }
header-help = Pomoč

## Linked Accounts section

la-heading = Povezani računi
la-description = Pooblastili ste dostop do naslednjih računov.
la-unlink-button = Odklopi
la-unlink-account-button = Odklopi
la-set-password-button = Nastavi geslo
la-unlink-heading = Odklopi od zunanjega računa
la-unlink-content-3 = Ali ste prepričani, da želite prekiniti povezavo s svojim računom? Odklop računa ne pomeni samodejne odjave iz povezanih storitev. Iz njih se lahko odjavite ročno v odseku Povezane storitve.
la-unlink-content-4 = Preden prekinete povezavo z računom, morate nastaviti geslo. Brez gesla se po prekinitvi povezave ne boste več mogli prijaviti.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Zapri
modal-cancel-button = Prekliči
modal-default-confirm-button = Potrdi

## ModalMfaProtected

modal-mfa-protected-title = Vnesite potrditveno kodo
modal-mfa-protected-subtitle = Pomagajte nam preveriti, da ste vi spremenili podatke o računu
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] V { $expirationTime } minuti vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
        [two] V { $expirationTime } minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
        [few] V { $expirationTime } minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
       *[other] V { $expirationTime } minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
    }
modal-mfa-protected-input-label = Vnesite 6-mestno kodo
modal-mfa-protected-cancel-button = Prekliči
modal-mfa-protected-confirm-button = Potrdi
modal-mfa-protected-code-expired = Je koda potekla?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Pošlji novo kodo.

## Modal Verify Session

mvs-verify-your-email-2 = Potrdite e-poštni naslov
mvs-enter-verification-code-2 = Vnesite potrditveno kodo
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Vnesite potrditveno kodo, ki smo jo poslali na <email>{ $email }</email>, v 5 minutah.
msv-cancel-button = Prekliči
msv-submit-button-2 = Potrdi

## Settings Nav

nav-settings = Nastavitve
nav-profile = Profil
nav-security = Varnost
nav-connected-services = Povezane storitve
nav-data-collection = Zbiranje in uporaba podatkov
nav-paid-subs = Plačljive naročnine
nav-email-comm = E-poštno obveščanje

## Page2faChange

page-2fa-change-title = Spremeni overjanje v dveh korakih
page-2fa-change-success = Overjanje v dveh korakih je bilo ponovno nastavljeno
page-2fa-change-success-additional-message = Za zaščito vseh povezanih naprav se odjavite na vseh mestih, kjer uporabljate ta račun, in se nato prijavite z novim overjanjem v dveh korakih.
page-2fa-change-totpinfo-error = Pri menjavi aplikacije za overjanje v dveh korakih je prišlo do napake. Poskusite znova pozneje.
page-2fa-change-qr-instruction = <strong>1. korak:</strong> skenirajte to kodo QR s katerokoli aplikacijo za overitev, kot je Duo ali Google Authenticator. To ustvari novo povezavo, vse stare povezave ne bodo več delovale.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Rezervne overitvene kode
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Pri menjavi rezervnih overitvenih kod je prišlo do težave
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Pri ustvarjanju rezervnih overitvenih kod je prišlo do težave
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Rezervne overitvene kode so posodobljene
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Rezervne overitvene kode so ustvarjene
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Shranite jih na mesto, ki si ga boste zapomnili. Vaše stare kode bodo nadomeščene, ko dokončate naslednji korak.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Z vnosom ene izmed kod potrdite, da ste si jih shranili. Stare rezervne overitvene kode bodo po zaključku tega koraka prenehale veljati.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Nepravilna rezervna overitvena koda

## Page2faSetup

page-2fa-setup-title = Overitev v dveh korakih
page-2fa-setup-totpinfo-error = Pri nastavljanju overjanja v dveh korakih je prišlo do napake. Poskusite znova pozneje.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Ta koda ni pravilna. Poskusite znova.
page-2fa-setup-success = Overitev v dveh korakih je omogočena
page-2fa-setup-success-additional-message = Za zaščito vseh povezanih naprav se odjavite na vseh mestih, kjer uporabljate ta račun, in se nato prijavite z uporabo overjanja v dveh korakih.

## Avatar change page

avatar-page-title =
    .title = Slika profila
avatar-page-add-photo = Dodaj fotografijo
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Fotografiraj
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Odstrani fotografijo
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Fotografiraj znova
avatar-page-cancel-button = Prekliči
avatar-page-save-button = Shrani
avatar-page-saving-button = Shranjevanje …
avatar-page-zoom-out-button =
    .title = Pomanjšaj
avatar-page-zoom-in-button =
    .title = Povečaj
avatar-page-rotate-button =
    .title = Zavrti
avatar-page-camera-error = Kamere ni bilo mogoče zagnati
avatar-page-new-avatar =
    .alt = nova slika profila
avatar-page-file-upload-error-3 = Prišlo je do napake pri nalaganju slike profila
avatar-page-delete-error-3 = Prišlo je do napake pri brisanju slike profila
avatar-page-image-too-large-error-2 = Datoteka s sliko je prevelika za nalaganje

## Password change page

pw-change-header =
    .title = Spremeni geslo
pw-8-chars = vsaj 8 znakov
pw-not-email = ni vaš e-poštni naslov
pw-change-must-match = se mora ujemati s potrditvijo
pw-commonly-used = ni eno od pogostih gesel
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Ostanite varni – ne reciklirajte gesel. Oglejte si več nasvetov za <linkExternal>ustvarjanje močnih gesel</linkExternal>.
pw-change-cancel-button = Prekliči
pw-change-save-button = Shrani
pw-change-forgot-password-link = Ste pozabili geslo?
pw-change-current-password =
    .label = Vnesite trenutno geslo
pw-change-new-password =
    .label = Vnesite novo geslo
pw-change-confirm-password =
    .label = Potrdite novo geslo
pw-change-success-alert-2 = Geslo posodobljeno

## Password create page

pw-create-header =
    .title = Ustvari geslo
pw-create-success-alert-2 = Geslo nastavljeno
pw-create-error-2 = Oprostite, prišlo je do težave pri nastavljanju gesla

## Delete account page

delete-account-header =
    .title = Izbriši račun
delete-account-step-1-2 = Korak 1 od 2
delete-account-step-2-2 = Korak 2 od 2
delete-account-confirm-title-4 = Morda ste svoj { -product-mozilla-account(sklon: "tozilnik") } povezali z enim ali več izmed naslednjih izdelkov ali storitev { -brand-mozilla(sklon: "rodilnik") }, ki vam zagotavljajo varnost in produktivnost na spletu:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sinhronizacija podatkov { -brand-firefox(sklon: "tozilnik") }
delete-account-product-firefox-addons = Dodatki za { -brand-firefox }
delete-account-acknowledge = Zavedajte se, da boste z izbrisom računa:
delete-account-chk-box-1-v4 =
    .label = preklicali vse plačane naročnine
delete-account-chk-box-2 =
    .label = lahko izgubili shranjene podatke in možnosti v izdelkih { -brand-mozilla(sklon: "rodilnik") }
delete-account-chk-box-3 =
    .label = pri ponovni aktivaciji tega e-poštnega računa morda ne boste mogli obnoviti shranjenih podatkov
delete-account-chk-box-4 =
    .label = izbrisali vse razširitve in teme, ki ste jih objavili na addons.mozilla.org
delete-account-continue-button = Nadaljuj
delete-account-password-input =
    .label = Vnesite geslo
delete-account-cancel-button = Prekliči
delete-account-delete-button-2 = Izbriši

## Display name page

display-name-page-title =
    .title = Prikazno ime
display-name-input =
    .label = Vnesite prikazno ime
submit-display-name = Shrani
cancel-display-name = Prekliči
display-name-update-error-2 = Prišlo je do napake pri spremembi prikaznega imena
display-name-success-alert-2 = Prikazno ime posodobljeno

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nedavna dejavnost v računu
recent-activity-account-create-v2 = Račun ustvarjen
recent-activity-account-disable-v2 = Račun onemogočen
recent-activity-account-enable-v2 = Račun omogočen
recent-activity-account-login-v2 = Prijava v račun se je začela
recent-activity-account-reset-v2 = Ponastavitev gesla se je začela
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Zavrnjena e-pošta odstranjena
recent-activity-account-login-failure = Neuspel poskus prijave v račun
recent-activity-account-two-factor-added = Omogočena overitev v dveh korakih
recent-activity-account-two-factor-requested = Zahteva po overitvi v dveh korakih
recent-activity-account-two-factor-failure = Neuspela overitev v dveh korakih
recent-activity-account-two-factor-success = Uspešna overitev v dveh korakih
recent-activity-account-two-factor-removed = Overitev v dveh korakih odstranjena
recent-activity-account-password-reset-requested = Račun zahteva ponastavitev gesla
recent-activity-account-password-reset-success = Ponastavitev gesla za račun je bila uspešna
recent-activity-account-recovery-key-added = Omogočen ključ za obnovitev računa
recent-activity-account-recovery-key-verification-failure = Neuspelo preverjanje ključa za obnovitev računa
recent-activity-account-recovery-key-verification-success = Uspešno preverjanje ključa za obnovitev računa
recent-activity-account-recovery-key-removed = Odstranjen ključ za obnovitev računa
recent-activity-account-password-added = Dodano novo geslo
recent-activity-account-password-changed = Spremenjeno geslo
recent-activity-account-secondary-email-added = Dodan pomožni e-poštni naslov
recent-activity-account-secondary-email-removed = Odstranjen pomožni e-poštni naslov
recent-activity-account-emails-swapped = Zamenjana glavni in pomožni e-poštni naslov
recent-activity-session-destroy = Odjavljeno iz seje
recent-activity-account-recovery-phone-send-code = Telefonska koda za obnovitev poslana
recent-activity-account-recovery-phone-setup-complete = Nastavitev telefonske številke za obnovitev končana
recent-activity-account-recovery-phone-signin-complete = Prijava s telefonsko številko za obnovitev je končana
recent-activity-account-recovery-phone-signin-failed = Prijava z obnovitveno telefonsko številko ni uspela
recent-activity-account-recovery-phone-removed = Telefonska številka za obnovitev je odstranjena
recent-activity-account-recovery-codes-replaced = Obnovitvene kode so zamenjane
recent-activity-account-recovery-codes-created = Obnovitvene kode so ustvarjene
recent-activity-account-recovery-codes-signin-complete = Prijava z obnovitvenimi kodami dokončana
recent-activity-password-reset-otp-sent = Potrditvena koda za ponastavitev gesla poslana
recent-activity-password-reset-otp-verified = Potrditvena koda za ponastavitev gesla potrjena
recent-activity-must-reset-password = Zahtevana je ponastavitev gesla
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Drugačna dejavnost v računu

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Ključ za obnovitev računa
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Nazaj na nastavitve

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Odstrani telefonsko številko za obnovitev
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = S tem boste odstranili telefonsko številko za obnovitev <strong>{ $formattedFullPhoneNumber }</strong>.
settings-recovery-phone-remove-recommend = Priporočamo vam, da to metodo ohranite, ker je preprostejša kot shranjevanje rezervnih overitvenih kod.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Če ga izbrišete, se prepričajte, da imate še vedno shranjene rezervne overitvene kode. <linkExternal>Primerjajte metode obnovitve</linkExternal>
settings-recovery-phone-remove-button = Odstrani telefonsko številko
settings-recovery-phone-remove-cancel = Prekliči
settings-recovery-phone-remove-success = Telefonska številka za obnovitev je odstranjena

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Dodaj telefonsko številko za obnovitev
page-change-recovery-phone = Spremeni telefonsko številko za obnovitev
page-setup-recovery-phone-back-button-title = Nazaj na nastavitve
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Spremeni telefonsko številko

## Add secondary email page

add-secondary-email-step-1 = Korak 1 od 2
add-secondary-email-error-2 = Pri dodajanju tega e-poštnega naslova je prišlo do napake
add-secondary-email-page-title =
    .title = Pomožni e-poštni naslov
add-secondary-email-enter-address =
    .label = Vnesite e-poštni naslov
add-secondary-email-cancel-button = Prekliči
add-secondary-email-save-button = Shrani
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Za pomožni naslov ni mogoče uporabiti e-poštne maske

## Verify secondary email page

add-secondary-email-step-2 = Korak 2 od 2
verify-secondary-email-page-title =
    .title = Pomožni e-poštni naslov
verify-secondary-email-verification-code-2 =
    .label = Vnesite potrditveno kodo
verify-secondary-email-cancel-button = Prekliči
verify-secondary-email-verify-button-2 = Potrdi
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = V roku 5 minut vnesite potrditveno kodo, ki je bila poslana na <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } uspešno dodan
verify-secondary-email-resend-code-button = Ponovno pošlji potrditveno kodo

##

# Link to delete account on main Settings page
delete-account-link = Izbriši račun
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Prijava uspešna. Vaš { -product-mozilla-account } in podatki bodo ostali aktivni.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Ugotovite, kje so razkriti vaši zasebni podatki, in prevzemite nadzor
# Links out to the Monitor site
product-promo-monitor-cta = Zagotovite si brezplačen pregled

## Profile section

profile-heading = Profil
profile-picture =
    .header = Slika
profile-display-name =
    .header = Prikazno ime
profile-primary-email =
    .header = Glavna e-pošta

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Korak { $currentStep } od { $numberOfSteps }.

## Security section of Setting

security-heading = Varnost
security-password =
    .header = Geslo
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Ustvarjeno { $date }
security-not-set = Ni nastavljeno
security-action-create = Ustvari
security-set-password = Nastavite geslo za sinhronizacijo in uporabo nekaterih varnostnih možnosti računa.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Oglejte si nedavno dejavnost v računu
signout-sync-header = Seja je potekla
signout-sync-session-expired = Oprostite, prišlo je do napake. V meniju brskalnika se odjavite in poskusite znova.

## SubRow component

tfa-row-backup-codes-title = Rezervne overitvene kode
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Ni razpoložljivih kod
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } preostala koda
        [two] { $numCodesAvailable } preostali kodi
        [few] { $numCodesAvailable } preostale kode
       *[other] { $numCodesAvailable } preostalih kod
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Ustvari nove kode
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Dodaj
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = To je najvarnejša metoda obnovitve, če nimate možnosti uporabe mobilne naprave ali aplikacije za overitev.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Telefonska številka za obnovitev
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Telefonska številka ni dodana
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Spremeni
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Dodaj
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Odstrani
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Odstranite telefonsko številko za obnovitev
tfa-row-backup-phone-delete-restriction-v2 = Če želite odstraniti telefonsko številko za obnovitev, najprej dodajte rezervne overitvene kode ali onemogočite overjanje v dveh korakih, da preprečite izgubo dostopa do računa.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = To je najpreprostejša metoda obnovitve, če nimate možnosti uporabe aplikacije za overitev.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Spoznajte tveganje zamenjave SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Izključi
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Vključi
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Pošiljanje …
switch-is-on = vključeno
switch-is-off = izključeno

## Sub-section row Defaults

row-defaults-action-add = Dodaj
row-defaults-action-change = Spremeni
row-defaults-action-disable = Onemogoči
row-defaults-status = Brez

## Account recovery key sub-section on main Settings page

rk-header-1 = Ključ za obnovitev računa
rk-enabled = Omogočen
rk-not-set = Ni nastavljen
rk-action-create = Ustvari
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Spremeni
rk-action-remove = Odstrani
rk-key-removed-2 = Ključ za obnovitev računa odstranjen
rk-cannot-remove-key = Ključa za obnovitev računa ni bilo mogoče odstraniti.
rk-refresh-key-1 = Osveži ključ za obnovitev računa
rk-content-explain = Obnovite svoje podatke, če pozabite geslo.
rk-cannot-verify-session-4 = Oprostite, prišlo je do težave pri potrjevanju vaše seje
rk-remove-modal-heading-1 = Odstrani ključ za obnovitev računa?
rk-remove-modal-content-1 =
    V primeru, da ponastavite geslo, obnovitvenega ključa
    ne boste mogli uporabiti za dostop do podatkov. Tega dejanja ne morete razveljaviti.
rk-remove-error-2 = Ključa za obnovitev računa ni bilo mogoče odstraniti
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Izbriši ključ za obnovitev računa

## Secondary email sub-section on main Settings page

se-heading = Pomožni e-poštni naslov
    .header = Pomožni e-poštni naslov
se-cannot-refresh-email = Oprostite, prišlo je do težave pri osveževanju e-poštnega naslova.
se-cannot-resend-code-3 = Prišlo je do napake pri ponovnem pošiljanju potrditvene kode
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } je zdaj vaš glavni e-poštni naslov
se-set-primary-error-2 = Oprostite, pri spreminjanju glavnega e-poštnega naslova je prišlo do težave
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } uspešno izbrisan
se-delete-email-error-2 = Oprostite, pri brisanju tega sporočila je prišlo do težave
se-verify-session-3 = Za izvedbo tega dejanja boste morali potrditi svojo trenutno sejo
se-verify-session-error-3 = Oprostite, prišlo je do težave pri potrjevanju vaše seje
# Button to remove the secondary email
se-remove-email =
    .title = Odstrani e-poštni naslov
# Button to refresh secondary email status
se-refresh-email =
    .title = Osveži e-poštni naslov
se-unverified-2 = nepotrjeno
se-resend-code-2 =
    Potrebna je potrditev. <button>Ponovno pošlji potrditveno kodo</button>,
    če ni prispela med prejeto ali neželeno pošto.
# Button to make secondary email the primary
se-make-primary = Nastavi kot glavno
se-default-content = Obdržite dostop do svojega računa v primeru, da se ne morete prijaviti v glavni e-poštni naslov.
se-content-note-1 =
    Opomba: pomožni e-poštni naslov ne bo obnovil vaših podatkov – za to
    boste potrebovali <a>ključ za obnovitev računa</a>.
# Default value for the secondary email
se-secondary-email-none = Brez

## Two Step Auth sub-section on Settings main page

tfa-row-header = Overitev v dveh korakih
tfa-row-enabled = Omogočena
tfa-row-disabled-status = Onemogočena
tfa-row-action-add = Dodaj
tfa-row-action-disable = Onemogoči
tfa-row-action-change = Spremeni
tfa-row-button-refresh =
    .title = Osveži overitev v dveh korakih
tfa-row-cannot-refresh =
    Oprostite, prišlo je do težave pri osveževanju
    overitve v dveh korakih.
tfa-row-enabled-description = Vaš račun je zaščiten s overjanjem v dveh korakih. Ob prijavi v { -product-mozilla-account(sklon: "tozilnik") } boste morali vnesti enkratno geslo iz aplikacije za overjanje.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Kako to ščiti vaš račun
tfa-row-disabled-description-v2 = Dodatno zavarujte svoj račun z uporabo zunanje aplikacije za overjanje kot drugega koraka pri prijavi.
tfa-row-cannot-verify-session-4 = Oprostite, prišlo je do težave pri potrjevanju vaše seje
tfa-row-disable-modal-heading = Ali želite onemogočiti overitev v dveh korakih?
tfa-row-disable-modal-confirm = Onemogoči
tfa-row-disable-modal-explain-1 =
    Tega dejanja ne morete razveljaviti. Imate tudi
    možnost <linkExternal>zamenjave rezervnih overitvenih kod</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Overitev v dveh korakih je onemogočena
tfa-row-cannot-disable-2 = Overitve v dveh korakih ni bilo mogoče izključiti
tfa-row-verify-session-info = Za nastavitev overjanja v dveh korakih morate potrditi svojo trenutno sejo

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Z nadaljevanjem se strinjate z:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>pogoji uporabe</mozSubscriptionTosLink> in <mozSubscriptionPrivacyLink>obvestilom o zasebnosti</mozSubscriptionPrivacyLink> naročniških storitev { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Pogoji storitve</mozillaAccountsTos> in <mozillaAccountsPrivacy>obvestilo o zasebnosti</mozillaAccountsPrivacy> { -product-mozilla-accounts(zacetnica: "velika", sklon: "rodilnik") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Z nadaljevanjem se strinjate s <mozillaAccountsTos>pogoji storitve</mozillaAccountsTos> in <mozillaAccountsPrivacy>obvestilom o zasebnosti</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = ali
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Prijava s ponudnikom
continue-with-google-button = Nadaljuj z { -brand-google(sklon: "orodnik") }
continue-with-apple-button = Nadaljuj z { -brand-apple(sklon: "orodnik") }

## Auth-server based errors that originate from backend service

auth-error-102 = Neznan račun
auth-error-103 = Napačno geslo
auth-error-105-2 = Neveljavna potrditvena koda
auth-error-110 = Neveljaven žeton
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Preveč poskusov. Poskusite znova pozneje.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Preveč poskusov. Poskusite znova { $retryAfter }.
auth-error-125 = Zahteva je bila zavrnjena iz varnostnih razlogov
auth-error-129-2 = Vnesli ste neveljavno telefonsko številko. Preverite in poskusite znova.
auth-error-138-2 = Nepotrjena seja
auth-error-139 = Pomožni e-poštni naslov mora biti drugačen od naslova računa
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Ta e-poštni naslov je rezerviran za drug račun. Poskusite znova pozneje ali uporabite drug naslov.
auth-error-155 = Žetona TOTP ni mogoče najti
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Rezervne overitvene kode ni bilo mogoče najti
auth-error-159 = Neveljaven ključ za obnovitev računa
auth-error-183-2 = Neveljavna ali pretečena potrditvena koda
auth-error-202 = Funkcija ni omogočena
auth-error-203 = Sistem ni dosegljiv, poskusite znova pozneje
auth-error-206 = Gesla ni mogoče ustvariti – geslo je že nastavljeno
auth-error-214 = Telefonska številka za obnovitev že obstaja
auth-error-215 = Telefonska številka za obnovitev ne obstaja
auth-error-216 = Dosežena omejitev števila besedilnih sporočil
auth-error-218 = Telefonske številke za obnovitev ni mogoče odstraniti, ker manjkajo rezervne overitvene kode.
auth-error-219 = To telefonsko številko je registriralo preveč računov. Poskusite z drugo številko.
auth-error-999 = Nepričakovana napaka
auth-error-1001 = Poskus prijave preklican
auth-error-1002 = Seja je potekla. Za nadaljevanje se prijavite.
auth-error-1003 = Lokalna shramba ali piškotki so še vedno onemogočeni
auth-error-1008 = Novo geslo mora biti drugačno
auth-error-1010 = Zahtevano je veljavno geslo
auth-error-1011 = Zahtevan je veljaven e-poštni naslov
auth-error-1018 = Vaša potrditvena e-pošta se je pravkar vrnila. Ste se zatipkali v e-poštnem naslovu?
auth-error-1020 = Napačen naslov? firefox.com ni veljaven ponudnik e-pošte
auth-error-1031 = Za registracijo morate vnesti svojo starost
auth-error-1032 = Za registracijo morate vnesti veljavno starost
auth-error-1054 = Neveljavna koda za overitev v dveh korakih
auth-error-1056 = Neveljavna rezervna overitvena koda
auth-error-1062 = Neveljavna preusmeritev
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Napačen naslov? { $domain } ni veljavna e-poštna storitev
auth-error-1066 = Za ustvaritev računa ni mogoče uporabiti e-poštne maske.
auth-error-1067 = Napačen e-poštni naslov?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Številka, ki se končuje na { $lastFourPhoneNumber }
oauth-error-1000 = Nekaj je šlo narobe. Zaprite ta zavihek in poskusite znova.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Prijavljeni ste v { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-pošta potrjena
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Prijava potrjena
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Za dokončanje namestitve se prijavite v ta { -brand-firefox }
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Prijava
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Še vedno dodajate naprave? Za dokončanje namestitve se prijavite v { -brand-firefox } na drugi napravi
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Za dokončanje namestitve se prijavite v { -brand-firefox } na drugi napravi
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Želite prenesti svoje zavihke, zaznamke in gesla na drugo napravo?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Poveži drugo napravo
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ne zdaj
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Za dokončanje namestitve se prijavite v { -brand-firefox } za Android
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Za dokončanje namestitve se prijavite v { -brand-firefox } za iOS

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Lokalna shramba in piškotki so zahtevani
cookies-disabled-enable-prompt-2 = Za dostop do { -product-mozilla-account(sklon: "rodilnik") } v brskalniku omogočite piškotke in lokalno shrambo. Na ta način boste med drugim omogočili, da si vas bo brskalnik zapomnil med sejami.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Poskusi znova
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Več o tem

## Index / home page

index-header = Vnesite e-poštni naslov
index-sync-header = Nadaljujte v { -product-mozilla-account(sklon: "tozilnik") }
index-sync-subheader = Sinhronizirajte gesla, zavihke in zaznamke na vseh mestih, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
index-relay-header = Ustvarite e-poštno masko
index-relay-subheader = Navedite e-poštni naslov, na katerega želite posredovati sporočila s svoje e-poštne maske.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Nadaljuj na { $serviceName }
index-subheader-default = Nadaljuj na nastavitve računa
index-cta = Registracija ali prijava
index-account-info = { -product-mozilla-account } omogoča tudi dostop do izdelkov { -brand-mozilla(sklon: "rodilnik") }, ki bolj varujejo zasebnost.
index-email-input =
    .label = Vnesite e-poštni naslov
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Račun je bil uspešno izbrisan
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Vaša potrditvena e-pošta se je pravkar vrnila. Ste se zatipkali v e-poštnem naslovu?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Opla! Ključa za obnovitev računa ni bilo mogoče ustvariti. Poskusite znova pozneje.
inline-recovery-key-setup-recovery-created = Ključ za obnovitev računa ustvarjen
inline-recovery-key-setup-download-header = Zavarujte svoj račun
inline-recovery-key-setup-download-subheader = Prenesite in shranite ga zdaj
inline-recovery-key-setup-download-info = Shranite ta ključ na mesto, ki si ga boste zapomnili – pozneje se na to stran ne boste mogli vrniti.
inline-recovery-key-setup-hint-header = Varnostno priporočilo

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Ne nastavi
inline-totp-setup-continue-button = Nadaljuj
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Okrepite varnost svojega računa z zahtevanjem overitvenih kod iz ene od <authenticationAppsLink>naslednjih aplikacij za overitev</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Omogočite overjanje v dveh korakih <span>za nadaljevanje na nastavitve računa</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Omogočite overjanje v dveh korakih <span>za nadaljevanje na { $serviceName }</span>
inline-totp-setup-ready-button = V stanju pripravljenosti.
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Skenirajte overitveno kodo <span>za nadaljevanje na { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Ročno vnesite kodo <span>za nadaljevanje na { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Skenirajte overitveno kodo <span>za nadaljevanje v nastavitve računa</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Ročno vnesite kodo <span>za nadaljevanje v nastavitve računa</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Vnesite ta skrivni ključ v aplikacijo za overjanje. <toggleToQRButton>Ali želite raje skenirati kodo QR?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Skenirajte kodo QR v svoji aplikaciji za overjanje in nato vnesite overitveno kodo, ki jo ponuja. <toggleToManualModeButton>Ne morete skenirati kode?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Ko bo končano, bo začelo ustvarjati overitvene kode, ki jih lahko vnesete.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Overitvena koda
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Zahtevana je overitvena koda
tfa-qr-code-alt = S pomočjo kode { $code } nastavite dvostopenjsko overjanje v podprtih aplikacijah.
inline-totp-setup-page-title = Overitev v dveh korakih

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Pravno obvestilo
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Pogoji uporabe
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Obvestilo o zasebnosti

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Obvestilo o zasebnosti

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Pogoji uporabe

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Ste se pravkar prijavili v { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Da, odobri napravo
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Če to niste bili vi, <link>spremenite geslo</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Naprava povezana
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Zdaj sinhronizirate z: { $deviceFamily } v sistemu { $deviceOS }
pair-auth-complete-sync-benefits-text = Zdaj lahko dostopate do odprtih zavihkov, gesel in zaznamkov na vseh svojih napravah.
pair-auth-complete-see-tabs-button = Prikaži zavihke s sinhroniziranih naprav
pair-auth-complete-manage-devices-link = Upravljanje naprav …

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Vnesite overitveno kodo <span>za nadaljevanje v nastavitve računa</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Vnesite overitveno kodo <span>za nadaljevanje na { $serviceName }</span>
auth-totp-instruction = Odprite aplikacijo za overjanje in vnesite kodo, ki jo predlaga.
auth-totp-input-label = Vnesite 6-mestno kodo
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Potrdi
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Zahtevana je overitvena koda

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Zdaj je zahtevana odobritev <span>z vaše druge naprave</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Seznanjanje ni uspelo
pair-failure-message = Postopek nastavitve je bil prekinjen.

## Pair index page

pair-sync-header = Sinhronizirajte { -brand-firefox } na telefonu ali tablici
pair-cad-header = Povežite { -brand-firefox } na drugi napravi
pair-already-have-firefox-paragraph = Že imate { -brand-firefox } na telefonu ali tablici?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sinhronizirajte svojo napravo
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = ali prenesite Firefox
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Skenirajte in prenesite { -brand-firefox } za mobilne naprave ali si pošljite <linkExternal>povezavo za prenos</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ne zdaj
pair-take-your-data-message = Vzemite zavihke, zaznamke in gesla kamorkoli greste s { -brand-firefox(sklon: "orodnik") }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Začni
# This is the aria label on the QR code image
pair-qr-code-aria-label = Koda QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Naprava povezana
pair-success-message-2 = Seznanjanje uspešno.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Potrdi seznanitev <span>za { $email }</span>
pair-supp-allow-confirm-button = Potrdi seznanitev
pair-supp-allow-cancel-link = Prekliči

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Zdaj je zahtevana odobritev <span>z vaše druge naprave</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Seznani s pomočjo aplikacije
pair-unsupported-message = Ste uporabili sistemsko kamero? Seznanitev morate opraviti v aplikaciji { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Ustvarite geslo za sinhronizacijo
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = S tem se vaši podatki šifrirajo. Geslo mora biti drugačno od gesla vašega računa { -brand-google } ali { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Počakajte, poteka preusmeritev na pooblaščeno aplikacijo.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Vnesite ključ za obnovitev računa
account-recovery-confirm-key-instruction = Ta ključ obnovi podatke, kot so gesla in zaznamki, ki so šifrirani shranjeni v strežnikih { -brand-firefox(sklon: "rodilnik") }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Vnesite 32-mestni ključ za obnovitev računa
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Vaš namig za shranjevanje je:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Nadaljuj
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Ne najdete ključa za obnovitev računa?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Ustvarite novo geslo
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Geslo je nastavljeno
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Pri nastavljanju gesla je prišlo do težave
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Uporabi ključ za obnovitev računa
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Vaše geslo je bilo ponastavljeno.
reset-password-complete-banner-message = Ne pozabite v nastavitvah { -product-mozilla-account(sklon: "rodilnik") } ustvariti novega ključa za obnovitev računa, da se izognete nadaljnjim težavam pri prijavi.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Vnesite 10-mestno kodo
confirm-backup-code-reset-password-confirm-button = Potrdi
confirm-backup-code-reset-password-subheader = Vnesite rezervno overitveno kodo
confirm-backup-code-reset-password-instruction = Vnesite eno izmed enkratnih kod, ki ste jih shranili ob nastavitvi overjanja v dveh korakih.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Se ne morete prijaviti?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Preverite e-pošto
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Potrditveno kodo smo poslali na <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Vnesite 8-mestno kodo v 10 minutah
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Nadaljuj
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Znova pošlji kodo
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Uporabi drug račun

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Ponastavite geslo
confirm-totp-reset-password-subheader-v2 = Vnesite kodo za overjanje v dveh korakih
confirm-totp-reset-password-instruction-v2 = V <strong>aplikaciji za overjanje</strong> ponastavite geslo.
confirm-totp-reset-password-trouble-code = Imate težave pri vnosu kode?
confirm-totp-reset-password-confirm-button = Potrdi
confirm-totp-reset-password-input-label-v2 = Vnesite 6-mestno kodo
confirm-totp-reset-password-use-different-account = Uporabi drug račun

## ResetPassword start page

password-reset-flow-heading = Ponastavite geslo
password-reset-body-2 = Vprašali bomo za nekaj stvari, ki jih veste samo vi, da zavarujemo vaš račun.
password-reset-email-input =
    .label = Vnesite e-poštni naslov
password-reset-submit-button-2 = Nadaljuj

## ResetPasswordConfirmed

reset-password-complete-header = Vaše geslo je bilo ponastavljeno
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Nadaljuj na { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Ponastavite geslo
password-reset-recovery-method-subheader = Izberite način obnovitve
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Prepričajmo se, da ste to naredili vi. Uporabite svoje metode za obnovitev.
password-reset-recovery-method-phone = Telefonska številka za obnovitev
password-reset-recovery-method-code = Rezervne overitvene kode
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } preostala koda
        [two] { $numBackupCodes } preostali kodi
        [few] { $numBackupCodes } preostale kode
       *[other] { $numBackupCodes } preostalih kod
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Pri pošiljanju kode na telefonsko številko za obnovitev je prišlo do težave
password-reset-recovery-method-send-code-error-description = Poskusite znova pozneje ali uporabite rezervne overitvene kode.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Ponastavite geslo
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Vnesite kodo za obnovitev
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Na telefonsko številko, ki se končuje s <span>{ $lastFourPhoneDigits }</span>, je bila poslana 6-mestna koda v obliki sporočila SMS. Koda poteče po 5 minutah. Ne delite je z nikomer.
reset-password-recovery-phone-input-label = Vnesite 6-mestno kodo
reset-password-recovery-phone-code-submit-button = Potrdi
reset-password-recovery-phone-resend-code-button = Znova pošlji kodo
reset-password-recovery-phone-resend-success = Koda poslana
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Se ne morete prijaviti?
reset-password-recovery-phone-send-code-error-heading = Pri pošiljanju kode je prišlo do težave
reset-password-recovery-phone-code-verification-error-heading = Pri preverjanju kode je prišlo do težave
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Poskusite znova kasneje.
reset-password-recovery-phone-invalid-code-error-description = Koda je neveljavna ali ji je potekla veljavnost.
reset-password-recovery-phone-invalid-code-error-link = Želite namesto tega uporabiti rezervne overitvene kode?
reset-password-with-recovery-key-verified-page-title = Ponastavitev gesla je uspela
reset-password-complete-new-password-saved = Novo geslo shranjeno!
reset-password-complete-recovery-key-created = Nov obnovitveni ključ za račun je ustvarjen. Prenesite in shranite ga zdaj.
reset-password-complete-recovery-key-download-info =
    Ta ključ je potreben za
    obnovitev podatkov, če pozabite geslo. <b>Prenesite ga in ga varno shranite
     zdaj, saj se pozneje ne boste več mogli vrniti na to stran.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Napaka:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Potrjevanje prijave …
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Napaka pri potrjevanju
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Potrditvena povezava je potekla
signin-link-expired-message-2 = Povezavi, ki ste jo kliknili, je potekla veljavnost ali pa je bila že uporabljena.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Vnesite geslo <span>za { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Nadaljuj na { $serviceName }
signin-subheader-without-logo-default = Nadaljuj na nastavitve računa
signin-button = Prijava
signin-header = Prijava
signin-use-a-different-account-link = Uporabi drug račun
signin-forgot-password-link = Pozabljeno geslo?
signin-password-button-label = Geslo
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.
signin-code-expired-error = Koda je potekla. Prijavite se znova.
signin-account-locked-banner-heading = Ponastavite geslo
signin-account-locked-banner-description = Vaš račun smo zaklenili, da bi ga zaščitili pred sumljivo dejavnostjo.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Ponastavite geslo za prijavo

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Povezavi, ki ste jo kliknili, je manjkalo nekaj znakov. Morda jo je pokvaril vaš poštni odjemalec. Poskusite jo previdno kopirati še enkrat.
report-signin-header = Prijavi nepooblaščeno prijavo?
report-signin-body = Prejeli ste sporočilo o poskusu dostopa do vašega računa. Želite to dejavnost prijaviti kot sumljivo?
report-signin-submit-button = Prijavi sumljivo dejavnost
report-signin-support-link = Zakaj se to dogaja?
report-signin-error = Pri pošiljanju poročila je prišlo do napake.
signin-bounced-header = Oprostite. Zaklenili smo vaš račun.
# $email (string) - The user's email.
signin-bounced-message = Potrditveno sporočilo, ki smo ga poslali na { $email }, je bilo vrnjeno, vaš račun pa smo zaradi zaščite vaših podatkov v { -brand-firefox(sklon: "mestnik") } zaklenili.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Če je to veljaven e-poštni naslov, <linkExternal>nam to sporočite</linkExternal> in pomagali vam bomo odkleniti vaš račun.
signin-bounced-create-new-account = Ne uporabljate več tega naslova? Ustvarite nov račun
back = Nazaj

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Potrdite to prijavo <span>za nadaljevanje v nastavitve računa</span>
signin-push-code-heading-w-custom-service = Potrdite to prijavo <span>za nadaljevanje v { $serviceName }</span>
signin-push-code-instruction = Preverite druge svoje naprave in odobrite to prijavo iz svojega brskalnika { -brand-firefox }.
signin-push-code-did-not-recieve = Niste prejeli obvestila?
signin-push-code-send-email-link = Pošlji kodo

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Potrdite prijavo
signin-push-code-confirm-description = Z naslednje naprave smo zaznali poskus prijave. Če ste bili to vi, odobrite prijavo
signin-push-code-confirm-verifying = Potrjevanje
signin-push-code-confirm-login = Potrdi prijavo
signin-push-code-confirm-wasnt-me = To nisem bil/-a jaz, spremeni geslo.
signin-push-code-confirm-login-approved = Vaša prijava je bila odobrena. Zaprite to okno.
signin-push-code-confirm-link-error = Povezava je poškodovana. Poskusite znova.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Prijava
signin-recovery-method-subheader = Izberite način obnovitve
signin-recovery-method-details = Prepričajmo se, da ste to naredili vi. Uporabite svoje metode za obnovitev.
signin-recovery-method-phone = Telefonska številka za obnovitev
signin-recovery-method-code-v2 = Rezervne overitvene kode
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } preostala koda
        [two] { $numBackupCodes } preostali kodi
        [few] { $numBackupCodes } preostale kode
       *[other] { $numBackupCodes } preostalih kod
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Pri pošiljanju kode na telefonsko številko za obnovitev je prišlo do težave
signin-recovery-method-send-code-error-description = Poskusite znova pozneje ali uporabite rezervne overitvene kode.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Prijava
signin-recovery-code-sub-heading = Vnesite rezervno overitveno kodo
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Vnesite eno izmed enkratnih kod, ki ste jih shranili ob nastavitvi overjanja v dveh korakih.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Vnesite 10-mestno kodo
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Potrdi
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Uporabi telefonsko številko za obnovitev
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Se ne morete prijaviti?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Zahtevana je rezervna overitvena koda
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Pri pošiljanju kode na telefonsko številko za obnovitev je prišlo do težave
signin-recovery-code-use-phone-failure-description = Poskusite znova kasneje.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Prijava
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Vnesite kodo za obnovitev
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Na telefonsko številko, ki se končuje s <span>{ $lastFourPhoneDigits }</span>, je bila poslana 6-mestna koda v obliki sporočila SMS. Koda poteče po 5 minutah. Ne delite je z nikomer.
signin-recovery-phone-input-label = Vnesite 6-mestno kodo
signin-recovery-phone-code-submit-button = Potrdi
signin-recovery-phone-resend-code-button = Znova pošlji kodo
signin-recovery-phone-resend-success = Koda poslana
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Se ne morete prijaviti?
signin-recovery-phone-send-code-error-heading = Pri pošiljanju kode je prišlo do težave
signin-recovery-phone-code-verification-error-heading = Pri preverjanju kode je prišlo do težave
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Poskusite znova kasneje.
signin-recovery-phone-invalid-code-error-description = Koda je neveljavna ali ji je potekla veljavnost.
signin-recovery-phone-invalid-code-error-link = Želite namesto tega uporabiti rezervne overitvene kode?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Prijava uspešna. Če ponovno uporabite telefonsko številko za obnovitev, lahko veljajo omejitve.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Hvala za vašo pozornost
signin-reported-message = Naša ekipa je bila obveščena. Takšna poročila nam pomagajo odgnati vsiljivce.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Vnesite potrditveno kodo<span> za svoj { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = V 5 minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
signin-token-code-input-label-v2 = Vnesite 6-mestno kodo
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Potrdi
signin-token-code-code-expired = Je koda potekla?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Pošlji novo kodo.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Zahtevana je potrditvena koda
signin-token-code-resend-error = Prišlo je do napake. Nove kode ni bilo mogoče poslati.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Prijava
signin-totp-code-subheader-v2 = Vnesite kodo za overjanje v dveh korakih
signin-totp-code-instruction-v4 = V <strong>aplikaciji za overjanje</strong> potrdite prijavo.
signin-totp-code-input-label-v4 = Vnesite 6-mestno kodo
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Zakaj se zahteva overjanje?
signin-totp-code-aal-banner-content = Za svoj račun ste nastavili overjanje v dveh korakih, vendar se na tej napravi še niste prijavili s kodo.
signin-totp-code-aal-sign-out = Odjava v tej napravi
signin-totp-code-aal-sign-out-error = Oprostite, prišlo je do težave pri odjavljanju
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Potrdi
signin-totp-code-other-account-link = Uporabi drug račun
signin-totp-code-recovery-code-link = Imate težave pri vnosu kode?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Zahtevana je overitvena koda
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Pooblasti to prijavo
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Med svojo e-pošto poiščite overitveno kodo, poslano na { $email }.
signin-unblock-code-input = Vnesite overitveno kodo
signin-unblock-submit-button = Nadaljuj
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Zahtevana je overitvena koda
signin-unblock-code-incorrect-length = Overitvena koda mora vsebovati 8 znakov
signin-unblock-code-incorrect-format-2 = Koda lahko vsebuje samo črke in/ali številke
signin-unblock-resend-code-button = Ni med prejeto ali vsiljeno pošto? Pošlji znova
signin-unblock-support-link = Zakaj se to dogaja?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Vnesite potrditveno kodo
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Vnesite potrditveno kodo <span>za svoj { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = V 5 minutah vnesite kodo, ki je bila poslana na <email>{ $email }</email>.
confirm-signup-code-input-label = Vnesite 6-mestno kodo
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Potrdi
confirm-signup-code-sync-button = Začni s sinhronizacijo
confirm-signup-code-code-expired = Je koda potekla?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Pošlji novo kodo.
confirm-signup-code-success-alert = Račun uspešno potrjen
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Zahtevana je potrditvena koda
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = Po prijavi vas bo { -brand-firefox } poskusil poslati nazaj na uporabo e-poštne maske.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Ustvarite geslo
signup-relay-info = Geslo je potrebno za varno upravljanje zamaskirane e-pošte in dostop do { -brand-mozilla(sklon: "rodilnik") } varnostnih orodij.
signup-sync-info = Sinhronizirajte gesla, zaznamke in ostale podatke povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
signup-sync-info-with-payment = Sinhronizirajte gesla, plačilna sredstva, zaznamke in ostale podatke povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Spremeni e-pošto

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Sinhronizacija je vključena
signup-confirmed-sync-success-banner = { -product-mozilla-account } potrjen
signup-confirmed-sync-button = Začnite z brskanjem
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Vaša gesla, plačilna sredstva, naslovi, zaznamki, zgodovina in drugi podatki se lahko sinhronizirajo povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
signup-confirmed-sync-description-v2 = Vaša gesla, naslovi, zaznamki, zgodovina in drugi podatki se lahko sinhronizirajo povsod, kjer uporabljate { -brand-firefox(sklon: "tozilnik") }.
signup-confirmed-sync-add-device-link = Dodaj drugo napravo
signup-confirmed-sync-manage-sync-button = Upravljanje sinhronizacije
signup-confirmed-sync-set-password-success-banner = Geslo za sinhronizacijo ustvarjeno
