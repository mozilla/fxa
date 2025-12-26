# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Na tvoju e-mail adresu je poslan novi kod.
resend-link-success-banner-heading = Na tvoju e-mail adresu je poslana nova poveznica.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Dodaj { $accountsEmail } svojim kontaktima kako bi se osigurala ispravna isporuka.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Zatvori natpis
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } će se preimenovati u { -product-mozilla-accounts } 1. studenoga
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = I dalje ćeš se prijavljivati s istim korisničkim imenom i lozinkom i ništa se neće promijeniti u proizvodima koje koristiš.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Preimenovali smo { -product-firefox-accounts } u { -product-mozilla-accounts }. I dalje ćeš se prijavljivati s istim korisničkim imenom i lozinkom te nema drugih promjena u proizvodima koje koristiš.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Saznaj više
# Alt text for close banner image
brand-close-banner =
    .alt = Zatvori natpis
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m logotip

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Natrag
button-back-title = Natrag

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Preuzmi i nastavi
    .title = Preuzmi i nastavi
recovery-key-pdf-heading = Ključ za obnavljanje računa
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Stvoreno: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Ključ za obnavljanje računa
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Ovaj ključ omogućuje obnavljanje šifriranih podataka preglednika (uključujući lozinke, zabilješke i povijest) ako zaboraviš lozinku. Spremi ga na mjesto kojeg ćeš se sjećati.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Mjesta za spremanje tvog ključa
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Saznaj više o ključu za obnavljanje računa
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Žao nam je. Došlo je do greške prilikom preuzimanja ključa za obnavljanje računa.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Dobij više uz { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Dobij naše najnovije vijesti i aktualiziranja proizvoda
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Rani pristup za testiranje novih proizvoda
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Upozorenja radnji za vraćanje interneta

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Preuzeto
datablock-copy =
    .message = Kopirano
datablock-print =
    .message = Ispisano

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] kod kopiran
        [few] koda kopirana
       *[other] kodova kopirano
    }
datablock-download-success =
    { $count ->
        [one] kod preuzet
        [few] koda preuzeta
       *[other] kodova preuzeto
    }
datablock-print-success =
    { $count ->
        [one] kod ispisan
        [few] koda ispisana
       *[other] kodova ispisao
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
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (procijenjeno)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (procijenjeno)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (procijenjeno)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (procijenjeno)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Lokacija nije poznata
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } na { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP adresa: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Lozinka
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ponovi lozinku
form-password-with-inline-criteria-signup-submit-button = Otvori račun
form-password-with-inline-criteria-reset-new-password =
    .label = Nova lozinka
form-password-with-inline-criteria-confirm-password =
    .label = Potvrdi lozinku
form-password-with-inline-criteria-reset-submit-button = Stvori novu lozinku
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Lozinka
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Ponovi lozinku
form-password-with-inline-criteria-set-password-submit-button = Započni sinkronizaciju
form-password-with-inline-criteria-match-error = Lozinke se ne podudaraju
form-password-with-inline-criteria-sr-too-short-message = Lozinka mora sadržati barem 8 znakova.
form-password-with-inline-criteria-sr-not-email-message = Lozinka ne smije sadržati tvoju e-mail adresu.
form-password-with-inline-criteria-sr-not-common-message = Lozinka ne smije biti često korištena lozinka.
form-password-with-inline-criteria-sr-requirements-met = Upisana lozinka poštuje sve zahtjeve za lozinku.
form-password-with-inline-criteria-sr-passwords-match = Upisane lozinke se podudaraju.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Ovo je obavezno polje

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Upiši { $codeLength }-znamenkasti kod
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Upiši { $codeLength }-znakovni kod

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Ključ za obnavljanje { -brand-firefox } računa
get-data-trio-title-backup-verification-codes = Rezervni kodovi za autentifikaciju
get-data-trio-download-2 =
    .title = Preuzmi
    .aria-label = Preuzmi
get-data-trio-copy-2 =
    .title = Kopiraj
    .aria-label = Kopiraj
get-data-trio-print-2 =
    .title = Ispiši
    .aria-label = Ispiši

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Upozorenje
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Pažnja
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Upozorenje
authenticator-app-aria-label =
    .aria-label = Aplikacija za autentifikaciju
backup-codes-icon-aria-label-v2 =
    .aria-label = Rezervni kodovi za autentifikaciju aktivirani
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Rezervni kodovi za autentifikaciju deaktivirani
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Obnavljanje SMS-om aktivirano
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Obnavljanje SMS-om deaktivirano
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadska zastava
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Kvačica
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Uspjeh
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Aktivirano
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Zatvori poruku
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kod
error-icon-aria-label =
    .aria-label = Greška
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informacije
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Zastava Sjedinjenih Američkih Država

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Računalo i mobitel sa slikom slomljenog srca
hearts-verified-image-aria-label =
    .aria-label = Računalo i mobitel sa slikom pulsirajućeg srca
signin-recovery-code-image-description =
    .aria-label = Dokument koji sadrži skriveni tekst.
signin-totp-code-image-label =
    .aria-label = Uređaj sa skrivenim 6-znamenkastim kodom.
confirm-signup-aria-label =
    .aria-label = Kuverta koja sadrži poveznicu
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustracija za ključ za obnavljanje računa.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustracija za ključ za obnavljanje računa.
password-image-aria-label =
    .aria-label = Ilustracija za tipkanje lozinke.
lightbulb-aria-label =
    .aria-label = Ilustracija za stvaranje savjeta za spremanje ključa.
email-code-image-aria-label =
    .aria-label = Ilustracija za e-mail koji sadrži kod.
recovery-phone-image-description =
    .aria-label = Mobilni uređaj koji prima kod putem SMS poruke.
recovery-phone-code-image-description =
    .aria-label = Kod je primljen na mobilnom uređaju.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilni uređaj s mogućnostima slanja SMS poruka
backup-authentication-codes-image-aria-label =
    .aria-label = Ekran uređaja s kodovima
sync-clouds-image-aria-label =
    .aria-label = Oblaci s ikonom sinkronizacije
confetti-falling-image-aria-label =
    .aria-label = Animirani padajući konfeti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Prijavljen/na si na { -brand-firefox }.
inline-recovery-key-setup-create-header = Zaštiti svoj račun
inline-recovery-key-setup-start-button = Stvori ključ za obnavljanje računa
inline-recovery-key-setup-later-button = Učini to kasnije

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Sakrij lozinku
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Prikaži lozinku
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Tvoja je lozinka trenutačno vidljiva na ekranu.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Tvoja je lozinka trenutačno skrivena.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Tvoja je lozinka sada vidljiva na ekranu.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Tvoja je lozinka sada skrivena.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Odaberi zemlju
input-phone-number-enter-number = Upiši broj telefona
input-phone-number-country-united-states = Sjedinjene Američke Države
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Natrag

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Poveznica za resetiranje lozinke je oštećena
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Poveznica potvrde je oštećena
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Poveznica je oštećena
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Poveznici na koju si kliknuo/la nedostaju neki znakovi ili ju je tvoj klijent e-pošte pokvario. Kopiraj poveznicu i pokušaj ponovo.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Primi novu poveznicu

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Zapamtiti tvoju lozinku?
# link navigates to the sign in page
remember-password-signin-link = Prijavi se

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primarna e-mail adresa je već potvrđena
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Prijava je već potvrđena
confirmation-link-reused-message = Ta poveznica za potvrdu već je korištena i može se koristiti samo jednom.

## Locale Toggle Component

locale-toggle-select-label = Odaberi jezik
locale-toggle-browser-default = Zadana postavka preglednika
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Neispravan zahtjev

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Ovu lozinku trebaš za pristup svim šifriranim podacima koje kod nas spremaš.
password-info-balloon-reset-risk-info = Resetiranje znači potencijalno gubljenje podataka poput lozinki i zabilješki.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-short-instruction = Odaberi snažnu lozinku:
password-strength-inline-min-length = Barem 8 znakova
password-strength-inline-not-email = Nije tvoja e-mail adresa
password-strength-inline-not-common = Nije često korištena lozinka
password-strength-inline-confirmed-must-match = Potvrda odgovara novoj lozinci
password-strength-inline-passwords-match = Lozinke se podudaraju

## Notification Promo Banner component

account-recovery-notification-cta = Stvori
recovery-phone-promo-cta = Dodaj telefonski broj za obnavljanje
recovery-phone-promo-heading = Dodaj dodatnu zaštitu svom računu pomoću telefona za oporavak
promo-banner-dismiss-button =
    .aria-label = Ukloni natpis

## Ready component

ready-complete-set-up-instruction = Završi postavljanje upisom tvoje nove lozinke na tvojim drugim { -brand-firefox } uređajima.
manage-your-account-button = Upravljaj svojim računom
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Sada možeš koristiti { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Sada možeš koristiti postavke računa
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Tvoj je račun spreman!
ready-continue = Nastavi
sign-in-complete-header = Prijava je potvrđena
sign-up-complete-header = Račun potvrđen
primary-email-verified-header = Primarna e-mail adresa potvrđena

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Mjesta za spremanje tvog ključa:
flow-recovery-key-download-storage-ideas-folder-v2 = Mapa na sigurnom uređaju
flow-recovery-key-download-storage-ideas-cloud = Pouzdano spremište u oblaku
flow-recovery-key-download-storage-ideas-print-v2 = Ispisan fizički primjerak
flow-recovery-key-download-storage-ideas-pwd-manager = Upravljač lozinki

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Dodaj savjet za pronalaženje ključa
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Upiši savjet (opcionalno)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Završi
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Savjet mora sadržati manje od 255 znakova.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Upozorenje
password-reset-chevron-expanded = Sklopi upozorenje
password-reset-chevron-collapsed = Rasklopi upozorenje
password-reset-data-may-not-be-recovered = Podaci tvog preglednika se možda neće oporaviti
password-reset-previously-signed-in-device-2 = Imaš neki uređaj na kojem si se prethodno prijavio/la?
password-reset-warning-have-key = Imaš ključ za obnavljanje računa?
password-reset-warning-use-key-link = Upotrijebi ga sada za ponovno postavljanje lozinke i zadržavanje podataka

## Alert Bar

alert-bar-close-message = Zatvori poruku

## User's avatar

avatar-your-avatar =
    .alt = Tvoj avatar
avatar-default-avatar =
    .alt = Zadani avatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } proizvodi
bento-menu-tagline = Daljnji { -brand-mozilla } proizvodi koji štite tvoju privatnost
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Preglednik { -brand-firefox } za računala
bento-menu-firefox-mobile = Preglednik { -brand-firefox } za mobilne uređaje
bento-menu-made-by-mozilla = Stvorila { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Nabavi { -brand-firefox } na mobitelu ili tabletu
connect-another-find-fx-mobile-2 = Pronađi { -brand-firefox } u { -google-play } i { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Preuzmi { -brand-firefox } na { -google-play }
connect-another-app-store-image-3 =
    .alt = Preuzmi { -brand-firefox } na { -app-store }

## Connected services section

cs-heading = Povezane usluge
cs-description = Sve što koristiš i gdje je tvoj račun prijavljen.
cs-cannot-refresh =
    Žao nam je. Došlo je do greške prilikom osvježavanja popisa
    povezanih usluga.
cs-cannot-disconnect = Klijent nije pronađen; nije moguće prekinuti vezu
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Odjavljen/a si s usluge { $service }
cs-refresh-button =
    .title = Osvježi povezane usluge
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Nedostajuće ili duplicirane stavke?
cs-disconnect-sync-heading = Prekini vezu sa Syncom

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Tvoji podaci pregledavanja će ostati na tvom <span>{ $device }</span> uređaju,
     ali se više neće sinkronizirati s tvojim računom.
cs-disconnect-sync-reason-3 = Koji je glavni razlog za odspajanje <span>{ $device }</span> uređaja?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Uređaj je:
cs-disconnect-sync-opt-suspicious = Sumnjivo
cs-disconnect-sync-opt-lost = Izgubljeno ili ukradeno
cs-disconnect-sync-opt-old = Staro ili zamijenjeno
cs-disconnect-sync-opt-duplicate = Duplikat
cs-disconnect-sync-opt-not-say = Ne želim reći

##

cs-disconnect-advice-confirm = U redu, razumijem
cs-disconnect-lost-advice-heading = Prekinuta veza s izgubljenim ili ukradenim uređajem
cs-disconnect-suspicious-advice-heading = Prekinuta veza sa sumnjivim uređajem
cs-sign-out-button = Odjava

## Data collection section

dc-heading = Prikupljanje i upotreba podataka
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } preglednik
dc-subheader-content-2 = Dozvoli da { -product-mozilla-accounts } šalju tehničke podatke i podatke o interakciji na { -brand-mozilla }.
dc-opt-out-success-2 = Isključivanje uspjelo. { -product-mozilla-accounts } neće slati tehničke podatke ili podatke o interakciji na { -brand-mozilla }.
dc-opt-in-success-2 = Hvala! Dijeljenje ovih podataka nam pomaže poboljšati { -product-mozilla-accounts }.
dc-learn-more = Saznaj više

# DropDownAvatarMenu component

drop-down-menu-title-2 = Izbornik za { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Prijavljen/a si kao
drop-down-menu-sign-out = Odjava
drop-down-menu-sign-out-error-2 = Žao nam je. Došlo je do greške prilikom odjave

## Flow Container

flow-container-back = Natrag

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Iz sigurnosnih razloga ponovo upiši lozinku
flow-recovery-key-confirm-pwd-input-label = Upiši lozinku
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Stvori ključ za obnavljanje računa
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Stvori novi ključ za obnavljanje računa

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Ključ za obnavljanje računa je stvoren – preuzmi i spremi ga sada
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Nastavi bez preuzimanja

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Ključ za obnavljanje računa je stvoren

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Promijeni ključ za obnavljanje računa
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Započni
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Odustani

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Poveži se s aplikacijom za autentifikaciju
flow-setup-2fa-cant-scan-qr-button = Ne možeš snimiti QR kod?
flow-setup-2fa-manual-key-heading = Upiši kod ručno
flow-setup-2fa-scan-qr-instead-button = Umjesto toga snimiti QR kod?
flow-setup-2fa-button = Nastavi

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-phone-title = Telefon za oporavak
flow-setup-2fa-backup-choice-phone-badge = Najjednostavnije
flow-setup-2fa-backup-choice-code-badge = Najsigurnije

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-code-input = Upiši deseteroznamenkasti kod
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Završi

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-button-continue = Nastavi

##

flow-setup-2fa-inline-complete-success-banner = Dvofaktorska autentifikacija je omogućena
flow-setup-2fa-inline-complete-backup-code = Autentifikacijski kodovi za sigurnosno kopiranje
flow-setup-2fa-inline-complete-backup-phone = Telefon za oporavak
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Preostao je { $count } kod
        [few] Preostala su { $count } koda
       *[other] Preostalo je { $count } kodova
    }

## FlowSetupPhoneConfirmCode

flow-setup-phone-confirm-code-input-label = Upiši šesteroznamenkasti kod
flow-setup-phone-confirm-code-button = Potvrdi
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Kod je istekao?
flow-setup-phone-confirm-code-resend-code-button = Ponovo pošalji kod
flow-setup-phone-confirm-code-resend-code-success = Kod je poslan
flow-setup-phone-confirm-code-success-message-v2 = Telefonski broj za oporavak je dodan
flow-change-phone-confirm-code-success-message = Telefonski broj za oporavak je promijenjen

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Potvrdi svoj broj telefona
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Pošalji kod

## HeaderLockup component, the header in account settings

header-menu-open = Zatvori izbornik
header-menu-closed = Izbornik navigacije stranicom
header-back-to-top-link =
    .title = Natrag na vrh
header-title-2 = { -product-mozilla-account }
header-help = Pomoć

## Linked Accounts section

la-heading = Povezani računi
la-description = Autorizirao/la si pristup sljedećim računima.
la-unlink-button = Odspoji
la-unlink-account-button = Odspoji
la-set-password-button = Postavi lozinku
la-unlink-content-4 = Prije odspajanja tvog računa moraš postaviti lozinku. Bez lozinke se ne možeš prijaviti nakon odspajanja tvog računa.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Zatvori
modal-cancel-button = Odustani
modal-default-confirm-button = Potvrdi

## Modal Verify Session

mvs-verify-your-email-2 = Potvrdi svoju e-mail adresu
mvs-enter-verification-code-2 = Upiši svoj kod za potvrdu
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Upiši svoj kod za potvrdu koji je poslan na <email>{ $email }</email> u roku od 5 minuta.
msv-cancel-button = Odustani
msv-submit-button-2 = Potvrdi

## Settings Nav

nav-settings = Postavke
nav-profile = Profil
nav-security = Sigurnost
nav-connected-services = Povezane usluge
nav-data-collection = Prikupljanje i uportreba podataka
nav-paid-subs = Plaćene pretplate
nav-email-comm = Komunikacija e-poštom

## Avatar change page

avatar-page-title =
    .title = Profilna slika
avatar-page-add-photo = Dodaj sliku
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Snimi sliku
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Ukloni sliku
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Ponovno snimi sliku
avatar-page-cancel-button = Odustani
avatar-page-save-button = Spremi
avatar-page-saving-button = Spremanje…
avatar-page-zoom-out-button =
    .title = Smanji
avatar-page-zoom-in-button =
    .title = Povećaj
avatar-page-rotate-button =
    .title = Rotiraj
avatar-page-camera-error = Nije moguće inicijalizirati kameru
avatar-page-new-avatar =
    .alt = nova profilna slika
avatar-page-file-upload-error-3 = Dogodila se greška tijekom prijenosa tvoje slike profila
avatar-page-delete-error-3 = Dogodila se greška tijekom brisanja tvoje slike profila
avatar-page-image-too-large-error-2 = Slika je prevelika za prijenos

## Password change page

pw-change-header =
    .title = Promijeni lozinku
pw-8-chars = Barem 8 znakova
pw-not-email = Nije tvoja e-mail adresa
pw-change-must-match = Nova lozinka podudara se s potvrdom
pw-commonly-used = Nije često korištena lozinka
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Zaštiti se – nemoj koristiti već korištene lozinke. Pogledaj savjete za <linkExternal>stvaranje jakih lozinki</linkExternal>.
pw-change-cancel-button = Odustani
pw-change-save-button = Spremi
pw-change-forgot-password-link = Zaboravio/la si lozinku?
pw-change-current-password =
    .label = Unesi trenutnu lozinku
pw-change-new-password =
    .label = Unesi novu lozinku
pw-change-confirm-password =
    .label = Potvrdi novu lozinku
pw-change-success-alert-2 = Lozinka je aktualizirana

## Password create page

pw-create-header =
    .title = Stvori lozinku
pw-create-success-alert-2 = Lozinka je postavljena
pw-create-error-2 = Žao nam je. Došlo je do greške prilikom postavljanja tvoje lozinke

## Delete account page

delete-account-header =
    .title = Izbriši račun
delete-account-step-1-2 = Korak 1 od 2
delete-account-step-2-2 = Korak 2 od 2
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Sinkroniziranje { -brand-firefox } podataka
delete-account-product-firefox-addons = { -brand-firefox } dodaci
delete-account-acknowledge = Brisanjem računa potvrđuješ da će:
delete-account-chk-box-2 =
    .label = Možda ćeš izgubiti spremljene informacije i funkcije u { -brand-mozilla } proizvodima
delete-account-chk-box-3 =
    .label = Ponovna aktivacija ovom e-poštom možda neće vratiti tvoje spremljene informacije
delete-account-chk-box-4 =
    .label = Sva proširenja i teme koja objaviš na addons.mozilla.org će se izbrisati
delete-account-continue-button = Nastavi
delete-account-password-input =
    .label = Upiši lozinku
delete-account-cancel-button = Odustani
delete-account-delete-button-2 = Izbriši

## Display name page

display-name-page-title =
    .title = Prikazano ime
display-name-input =
    .label = Unesi prikazano ime
submit-display-name = Spremi
cancel-display-name = Odustani
display-name-success-alert-2 = Prikazano ime je aktualizirano

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nedavna aktivnost računa
recent-activity-account-create-v2 = Račun je stvoren
recent-activity-account-disable-v2 = Račun je deaktiviran
recent-activity-account-enable-v2 = Račun je aktiviran
recent-activity-account-login-v2 = Pokrenuta je prijava na račun
recent-activity-account-reset-v2 = Pokrenuto je resetiranje lozinke
recent-activity-account-login-failure = Pokušaj prijave na račun nije uspio
recent-activity-account-two-factor-added = Dvofaktorska autentifikacija aktivirana
recent-activity-account-two-factor-requested = Dvofaktorska autentifikacija potrebna
recent-activity-account-two-factor-failure = Dvofaktorska autentifikacija neuspjela
recent-activity-account-two-factor-success = Dvofaktorska autentifikacija uspjela
recent-activity-account-two-factor-removed = Dvofaktorska autentifikacija uklonjena
recent-activity-account-password-reset-requested = Račun je zatražio resetiranje lozinke
recent-activity-account-password-reset-success = Lozinka računa uspješno resetirana
recent-activity-account-recovery-key-added = Ključ za obnavljanje računa aktiviran
recent-activity-account-recovery-key-verification-failure = Potvrda ključa za obnavljanje računa neuspjela
recent-activity-account-recovery-key-verification-success = Potvrda ključa za obnavljanje računa uspjela
recent-activity-account-recovery-key-removed = Ključ za obnavljanje računa uklonjen
recent-activity-account-password-added = Nova lozinka dodana
recent-activity-account-password-changed = Lozinka spremljena
recent-activity-account-secondary-email-added = Sekundarna e-mail adresa dodana
recent-activity-account-secondary-email-removed = Sekundarna e-mail adresa uklonjena
recent-activity-account-emails-swapped = Primarna i sekundarna e-mail adresa zamijenjene
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Druga aktivnost na računu

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Ključ za obnavljanje računa
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Natrag na postavke

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

settings-recovery-phone-remove-button = Ukloni telefonski broj
settings-recovery-phone-remove-cancel = Odustani

## PageSetupRecoveryPhone

page-setup-recovery-phone-back-button-title = Natrag na postavke

## Add secondary email page

add-secondary-email-step-1 = Korak 1 od 2
add-secondary-email-error-2 = Dogodila se greška prilikom stvaranja ove e-mail adrese
add-secondary-email-page-title =
    .title = Sekundarna e-mail adresa
add-secondary-email-enter-address =
    .label = Upiši e-mail adresu
add-secondary-email-cancel-button = Odustani
add-secondary-email-save-button = Spremi
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Maske za e-mail adrese se ne mogu koristiti kao sekundarne e-mail adrese

## Verify secondary email page

add-secondary-email-step-2 = Korak 2 od 2
verify-secondary-email-page-title =
    .title = Sekundarna adresa e-pošte
verify-secondary-email-verification-code-2 =
    .label = Upiši svoj kod za potvrdu
verify-secondary-email-cancel-button = Odustani
verify-secondary-email-verify-button-2 = Potvrdi
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Upiši potvrdni kod koji je poslan na <strong>{ $email }</strong> u roku od 5 minuta.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = E-mail adresa { $email } je uspješno dodana

##

# Link to delete account on main Settings page
delete-account-link = Izbriši račun

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = Nabavi besplatno snimanje

## Profile section

profile-heading = Profil
profile-picture =
    .header = Slika
profile-display-name =
    .header = Prikazano ime
profile-primary-email =
    .header = Primarna adresa e-pošte

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Korak { $currentStep } od { $numberOfSteps }.

## Security section of Setting

security-heading = Sigurnost
security-password =
    .header = Lozinka
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Stvoreno { $date }
security-not-set = Nije postavljeno
security-action-create = Stvori
security-set-password = Postavi lozinku za sinkronizaciju i korištenje određenih sigurnosnih funkcija računa.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Pogledaj nedavnu aktivnost računa
signout-sync-header = Sesija je istekla
signout-sync-session-expired = Oprosti, nešto nije u redu. Odjavi se u izborniku preglednika i pokušaj ponovo.

## SubRow component

# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nema dostupnih kodova
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Dodaj
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Promijeni
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Dodaj
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Ukloni

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Isključi
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Uključi
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Slanje …
switch-is-on = uključeno
switch-is-off = isključeno

## Sub-section row Defaults

row-defaults-action-add = Dodaj
row-defaults-action-change = Promijeni
row-defaults-action-disable = Onemogući
row-defaults-status = Ništa

## Account recovery key sub-section on main Settings page

rk-header-1 = Ključ za obnavljanje računa
rk-enabled = Omogućeno
rk-not-set = Nije postavljeno
rk-action-create = Stvori
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Promijeni
rk-action-remove = Ukloni
rk-key-removed-2 = Ključ za obnavljanje računa je uklonjen
rk-cannot-remove-key = Nije moguće ukloniti tvoj ključ za obnavljanje računa.
rk-refresh-key-1 = Aktualiziraj ključ za obnavljanje računa
rk-content-explain = Obnovi tvoje informacije kada zaboraviš svoju lozinku.
rk-cannot-verify-session-4 = Žao nam je. Došlo je do greške prilikom potvrđivanja tvoje sesije
rk-remove-modal-heading-1 = Ukloniti ključ za obnavljanje računa?
rk-remove-modal-content-1 = U slučaju da resetiraš lozinku, nećeš moći koristiti ključ za oporavak računa za pristup tvojim podacima. Ovo je nepovratna radnja.
rk-remove-error-2 = Nije moguće ukloniti tvoj ključ za obnavljanje računa
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Izbriši ključ za obnavljanje računa

## Secondary email sub-section on main Settings page

se-heading = Sekundarna adresa e-pošte
    .header = Sekundarna adresa e-pošte
se-cannot-refresh-email = Oprosti, dogodila se greška prilikom aktualiziranja te e-mail adrese.
se-cannot-resend-code-3 = Žao nam je, došlo je do problema prilikom ponovnog slanja potvrdnog koda
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } je sada tvoja primarna e-mail adresa
se-set-primary-error-2 = Oprosti, dogodila se greška prilikom mijenjanja tvoje primarne e-mail adrese
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = E-mail adresa { $email } je uspješno izrisana
se-delete-email-error-2 = Oprosti, dogodila se greška prilikom brisanja ove e-mail adrese
se-verify-session-3 = Morat ćeš potvrditi svoju trenutačnu sesiju za izvršenje ove radnje
se-verify-session-error-3 = Žao nam je. Došlo je do greške prilikom potvrđivanja tvoje sesije
# Button to remove the secondary email
se-remove-email =
    .title = Ukloni e-poštu
# Button to refresh secondary email status
se-refresh-email =
    .title = Osvježi e-poštu
se-unverified-2 = nepotvrđeno
se-resend-code-2 =
    Potrebna je potvrda. <button>Ponovo pošalji kod za potvrdu</button>
    ako nije u tvom ulaznom sandučiću niti u sandučiću neželjenih e-mailova.
# Button to make secondary email the primary
se-make-primary = Postavi primarnom
se-default-content = Pristupi svom računu kada se ne možeš prijaviti na svoju primarnu e-poštu.
se-content-note-1 = Napomena: sekundarna e-mail adresa neće obnoviti tvoje podatke – za to ćeš trebati <a>ključ za obnavljanje računa</a>.
# Default value for the secondary email
se-secondary-email-none = Nema

## Two Step Auth sub-section on Settings main page

tfa-row-header = Dvofaktorska autentifikacija
tfa-row-enabled = Omogućeno
tfa-row-disabled-status = Deaktivirano
tfa-row-action-add = Dodaj
tfa-row-action-disable = Onemogući
tfa-row-button-refresh =
    .title = Osvježi dvofaktorsku autentifikaciju
tfa-row-disable-modal-heading = Onemogućiti dvofaktorsku autentifikaciju?
tfa-row-disable-modal-confirm = Onemogući
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Autentifikacija u dva koraka je deaktivirana
tfa-row-cannot-disable-2 = Nije bilo moguće deaktivirati autentifikaciju u dva koraka

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Ako nastaviš, prihvaćaš:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } usluge pretplate <mozSubscriptionTosLink>uvjeti usluge</mozSubscriptionTosLink> i <mozSubscriptionPrivacyLink>napomena o privatnosti</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } – <mozillaAccountsTos>Uvjeti usluge</mozillaAccountsTos> i <mozillaAccountsPrivacy>Obavijest o privatnosti</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Ako nastaviš, prihvaćaš <mozillaAccountsTos>uvjete usluge</mozillaAccountsTos> i <mozillaAccountsPrivacy>napomene o privatnosti</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = ili
continue-with-google-button = Nastavi s { -brand-google }
continue-with-apple-button = Nastavi s { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Nepoznati račun
auth-error-103 = Netočna lozinka
auth-error-105-2 = Neispravan potvrdni kod
auth-error-110 = Nevažeći token
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Previše pokušaja. Pokušaj ponovo { $retryAfter }.
auth-error-138-2 = Nepotvrđena sesija
auth-error-139 = Sekundarna e-mail adresa mora biti drugačija od e-mail adrese računa
auth-error-155 = TOTP token nije pronađen
auth-error-159 = Neispravan ključ za obnavljanje računa
auth-error-183-2 = Neispravan ili istekao potvrdni kod
auth-error-202 = Funkcija nije aktivirana
auth-error-203 = Sustav nije dostupan, pokušaj ponovo malo kasnije
auth-error-999 = Neočekivana greška
auth-error-1001 = Pokušaj prijave je prekinut
auth-error-1002 = Vrijeme sesije je isteklo. Prijavi se za nastavljanje.
auth-error-1003 = Lokalno spremište ili kolačići su i dalje deaktivirani
auth-error-1008 = Tvoja nova lozinka mora biti drugačija
auth-error-1010 = Potrebna je ispravna lozinka
auth-error-1011 = Potrebna je ispravna e-mail adresa
auth-error-1031 = Za prijavu moraš upisati svoju dob
auth-error-1032 = Za registraciju moraš upisati ispravnu dob
auth-error-1054 = Neispravan kod dvofaktorske autentikacije
auth-error-1062 = Neispravno preusmjeravanje
oauth-error-1000 = Dogodila se greška. Zatvori ovu karticu i pokušaj ponovo.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Prijavljen/na si na { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-mail adresa je potvrđena
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Prijava je potvrđena
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Prijavi se na ovaj { -brand-firefox } za dovršavanje postavljanja
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Prijavi se
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Još uvijek dodaješ uređaj? Prijavi se u { -brand-firefox } na jednom drugom uređaju za završavanje postavljanja
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Prijavi se u { -brand-firefox } na jednom drugom uređaju za završavanje postavljanja
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Želiš li dobiti tvoje kartice, zabilješke i lozinke na jednom drugom uređaju?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Poveži jedan drugi uređaj
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ne sada
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Prijavi se na { -brand-firefox } za Android za dovršavanje postavljanja
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Prijavi se na { -brand-firefox } za iOS za dovršavanje postavljanja

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Pokušaj ponovo
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Saznaj više

## Index / home page

index-header = Upiši svoju e-mail adresu
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Nastavi na { $serviceName }
index-subheader-default = Nastavi na postavke računa
index-cta = Registriraj se ili se prijavi
index-email-input =
    .label = Upiši svoju e-mail adresu

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-download-header = Zaštiti svoj račun
inline-recovery-key-setup-download-subheader = Preuzmi i spremi sada

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Prekini postavljanje
inline-totp-setup-continue-button = Nastavi
inline-totp-setup-ready-button = Spremno
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Kod za autentifikaciju
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Potreban je kod autentifikacije

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Pravno
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Uvjeti usluge
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Napomena o privatnosti

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Napomena o privatnosti

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Uvjeti usluge

## AuthAllow page - Part of the device pairing flow

# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Da, odobri uređaj
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Ako to nisi bio/la ti, <link>promijeni lozinku</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Uređaj je povezan
pair-auth-complete-sync-benefits-text = Sada možeš pristupiti tvojim otvorenim karticama, lozinkama i zabilješkama na svim tvojim uređajima.
pair-auth-complete-see-tabs-button = Pogledaj kartice od sinkroniziranih uređaja
pair-auth-complete-manage-devices-link = Upravljaj uređajima

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

auth-totp-input-label = Upiši šesteroznamenkasti kod
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Potvrdi

## Pair index page

pair-sync-header = Sinkroniziraj { -brand-firefox } na svom telefonu ili tabletu
pair-cad-header = Poveži { -brand-firefox } na jednom drugom uređaju
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Sinkroniziraj svoj uređaj
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Ili preuzmi
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ne sada
pair-take-your-data-message = Ponesi svoje kartice, zabilješke i lozinke gdje god koristiš { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Započni
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR kod

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Uređaj je povezan

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

pair-supp-allow-cancel-link = Odustani

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Pričekaj, preusmjeravamo te na ovlaštenu aplikaciju.

## AccountRecoveryConfirmKey page

# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Nastavi

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Stvori novu lozinku
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Lozinka je postavljena
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Žao nam je. Došlo je do greške prilikom postavljanja tvoje lozinke
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Tvoja je lozinka resetirana.

# ConfirmBackupCodeResetPassword page


## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Provjeri tvoju e-mail adresu
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Poslali smo kod za potvrđivanje na <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Upiši 8-znamenkasti kod u roku od 10 minuta
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Nastavi
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Ponovo pošalji kod
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Koristi jedan drugi račun

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Resetiraj tvoju lozinku
confirm-totp-reset-password-confirm-button = Potvrdi
confirm-totp-reset-password-input-label-v2 = Upiši šesteroznamenkasti kod
confirm-totp-reset-password-use-different-account = Koristi jedan drugi račun

## ResetPassword start page

password-reset-flow-heading = Resetiraj tvoju lozinku
password-reset-email-input =
    .label = Upiši tvoju e-mail adresu
password-reset-submit-button-2 = Nastavi

## ResetPasswordConfirmed

reset-password-complete-header = Tvoja je lozinka resetirana

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = Resetiranje lozinke je uspjelo
reset-password-complete-new-password-saved = Nova lozinka je spremljena!

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Greška:
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Greška potvrde
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Poveznica potvrde je oštećena

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Upiši svoju lozinku <span>za tvoj { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Nastavi na { $serviceName }
signin-subheader-without-logo-default = Nastavi na postavke računa
signin-button = Prijavi se
signin-header = Prijavi se
signin-use-a-different-account-link = Koristi jedan drugi račun
signin-forgot-password-link = Zaboravio/la si lozinku?
signin-password-button-label = Lozinka

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-header = Prijaviti neautoriziranu prijavu?
report-signin-submit-button = Prijavi aktivnost
report-signin-support-link = Zašto se ovo događa?
# $email (string) - The user's email.
signin-bounced-message = Potvrdni e-mail koji smo poslali na { $email } je vraćen i zaključali smo tvoj račun, kako bismo zaštitili tvoje { -brand-firefox } podatke.
back = Natrag

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Potvrdi tvoju prijavu
signin-push-code-confirm-login = Potvrdi prijavu

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Prijavi se

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Prijavi se
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Potvrdi
signin-recovery-code-use-phone-failure-description = Pokušaj ponovo kasnije.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Prijavi se
signin-recovery-phone-input-label = Upiši šesteroznamenkasti kod
signin-recovery-phone-code-submit-button = Potvrdi
signin-recovery-phone-resend-code-button = Ponovo pošalji kod
signin-recovery-phone-resend-success = Kod je poslan
signin-recovery-phone-send-code-error-heading = Došlo je do greške prilikom slanja koda
signin-recovery-phone-code-verification-error-heading = Došlo je do greške prilikom provjere tvog koda
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Pokušaj ponovo kasnije.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Upiši potvrdni kod<span> za tvoj { -product-mozilla-account }</span>
signin-token-code-input-label-v2 = Upiši šesteroznamenkasti kod
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Potvrdi
signin-token-code-code-expired = Kod je istekao?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Pošalji e-mailom novi kod.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Potreban je potvrdni kod

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Prijavi se
signin-totp-code-input-label-v4 = Upiši šesteroznamenkasti kod
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Potvrdi
signin-totp-code-other-account-link = Koristi jedan drugi račun
signin-totp-code-recovery-code-link = Problem s unosom koda?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Potreban je kod autentifikacije
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } će te pokušati vratiti na karticu kako bi koristio/la masku e-mail adrese nakon što se prijaviš.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autoriziraj ovu prijavu
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Pregledaj e-poštu za autorizacijskim kodom koji je poslan na { $email }.
signin-unblock-code-input = Upiši kod za autorizaciju
signin-unblock-submit-button = Nastavi
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Potreban je kod autorizacije
signin-unblock-code-incorrect-length = Kod za autorizaciju mora sadržati 8 znakova
signin-unblock-code-incorrect-format-2 = Kod za autorizaciju smije sadržati samo slova i/ili brojke
signin-unblock-resend-code-button = Nije u sandučiću dolazne pošte niti u sandučiću neželjenih e-mailova? Pošalji ponovo
signin-unblock-support-link = Zašto se ovo događa?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } će te pokušati vratiti na karticu kako bi koristio/la masku e-mail adrese nakon što se prijaviš.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Upiši potvrdni kod
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Upiši potvrdni kod<span> za tvoj { -product-mozilla-account }</span>
confirm-signup-code-input-label = Upiši šesteroznamenkasti kod
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Potvrdi
confirm-signup-code-code-expired = Kod je istekao?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Pošalji e-mailom novi kod.
confirm-signup-code-success-alert = Račun je uspješno potvrđen
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Potreban je potvrdni kod
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } će te pokušati vratiti na karticu kako bi koristio/la masku e-mail adrese nakon što se prijaviš.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-relay-info = Za sigurno upravljanje tvojim maskiranim e-mail adresama i pristup sigurnosnim { -brand-mozilla } alatima je potrebna lozinka.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Promijeni e-mail adresu
