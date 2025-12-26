# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Ein ny kode er sendt til e-posten din.
resend-link-success-banner-heading = Ei ny lenke er sendt til e-posten din.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Legg til { $accountsEmail } i kontaktane dine for å sikre problemfri levering.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Lat att banner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } endrar namn til { -product-mozilla-accounts } den 1. november
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Du vil framleis logge på med same brukarnamn og passord, og det er ingen andre endringar i produkta du brukar.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Vi har endra namn på { -product-firefox-accounts } til { -product-mozilla-accounts }. Du vil framleis logge på med same brukarnamn og passord, og det er ingen andre endringar i produkta du brukar.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Les meir
# Alt text for close banner image
brand-close-banner =
    .alt = Lat att banner
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m-logo

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Tilbake
button-back-title = Tilbake

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Last ned og hald fram
    .title = Last ned og hald fram
recovery-key-pdf-heading = Kontogjenopprettingsnøkkel
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Generert: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Kontogjenopprettingsnøkkel
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Denne nøkkelen lèt deg rette opp igjen dei krypterte nettlesardataa dine (inkludert passord, bokmerke og historikk) viss du gløymer passordet ditt. Oppbevar han på ein stad du vil hugse.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Plassar å lagre nøkkelen din
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Les meir om kontogjenopprettingsnøkkelen din
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Klarte ikkje å laste ned kontogjenopprettingsnøkkelen din.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Få meir frå { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Få våre siste nyheiter og produktoppdateringar
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Tidleg tilgang til å teste nye produkt
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Handlingsvarsel for å vinne tilbake internett

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Nedlasta
datablock-copy =
    .message = Kopiert
datablock-print =
    .message = Skrive ut

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Kode kopiert
       *[other] Kodar kopierte
    }
datablock-download-success =
    { $count ->
        [one] Kode lasta ned
       *[other] Kodar lasta ned
    }
datablock-print-success =
    { $count ->
        [one] Koden skriven ut
       *[other] Kodane skrivne ut
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Kopiert

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (estimert)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (estimert)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (estimert)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (estimert)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Ukjend plassering
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } på { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-adresse: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Passord
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Gjenta passord
form-password-with-inline-criteria-signup-submit-button = Lag konto
form-password-with-inline-criteria-reset-new-password =
    .label = Nytt passord
form-password-with-inline-criteria-confirm-password =
    .label = Stadfest passord
form-password-with-inline-criteria-reset-submit-button = Lag nytt passord
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Passord
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Gjenta passord
form-password-with-inline-criteria-set-password-submit-button = Start synkronisering
form-password-with-inline-criteria-match-error = Passorda samsvarar ikkje
form-password-with-inline-criteria-sr-too-short-message = Passord må innehalde minst 8 teikn.
form-password-with-inline-criteria-sr-not-email-message = Passord kan ikkje innehalde e-postadressa di.
form-password-with-inline-criteria-sr-not-common-message = Passord må ikkje vere eit vanleg brukt passord.
form-password-with-inline-criteria-sr-requirements-met = Innskrive passord respekterer alle passordkrav.
form-password-with-inline-criteria-sr-passwords-match = Innskrive passord samsvarar.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Dette feltet er påkravd

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Skriv inn { $codeLength }-sifra kode for å halde fram
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Skriv inn koden på { $codeLength } teikn for å halde fram

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Kontogjenopprettingsnøkkel for { -brand-firefox }
get-data-trio-title-backup-verification-codes = Reserve-autentiseringskodar
get-data-trio-download-2 =
    .title = Last ned
    .aria-label = Last ned
get-data-trio-copy-2 =
    .title = Kopier
    .aria-label = Kopier
get-data-trio-print-2 =
    .title = Skriv ut
    .aria-label = Skriv ut

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Varsel
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Merk
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Åtvaring
authenticator-app-aria-label =
    .aria-label = Autentiserings-app
backup-codes-icon-aria-label-v2 =
    .aria-label = Reserve-autentiseringskodar slått på
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Reserve-autentiseringskodar slått av
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Gjennopprettings-SMS slått på
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Gjennopprettings-SMS slått av
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Canadisk flagg
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Valt
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Vellykka
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Slått på
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Lat att melding
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kode
error-icon-aria-label =
    .aria-label = Feil
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informasjon
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Det USA-amerikanske flagget

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Ei datamaskin og ein mobiltelefon og eit bilde av eit knust hjarte på kvar
hearts-verified-image-aria-label =
    .aria-label = Ei datamaskin og ein mobiltelefon og eit nettbrett med eit pulserande hjarte på kvar
signin-recovery-code-image-description =
    .aria-label = Dokument som inneheld skjult tekst.
signin-totp-code-image-label =
    .aria-label = Ei eining med ein skjult 6-sifra kode.
confirm-signup-aria-label =
    .aria-label = Ei melding med ei lenke
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Illustrasjon som representerer ein kontogjenopprettingsnøkkel.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Illustrasjon som representerer ein kontogjenopprettingsnøkkel.
password-image-aria-label =
    .aria-label = Ein illustrasjon av ei inntasting av eit passord
lightbulb-aria-label =
    .aria-label = Illustrasjon som viser oppretting av eit lagringshint.
email-code-image-aria-label =
    .aria-label = Illustrasjon av ein e-post som inneheld ein kode.
recovery-phone-image-description =
    .aria-label = Mobileining som får ein tekstmeldingskode
recovery-phone-code-image-description =
    .aria-label = Kode motteken på ei mobil eining.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobileining med tekstmeldingsfunksjonar
backup-authentication-codes-image-aria-label =
    .aria-label = Einingsskjerm med kodar
sync-clouds-image-aria-label =
    .aria-label = Skyer med eit synkroniseringsikon
confetti-falling-image-aria-label =
    .aria-label = Animert fallande konfetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Du er logga inn på { -brand-firefox }.
inline-recovery-key-setup-create-header = Sikre kontoen din
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Har du eit minutt til å verne dataa dine?
inline-recovery-key-setup-info = Opprett ein kontogjenopprettingsnøkkel slik at du kan rette opp igjen synkroniserte nettlesardata viss du gløymer passordet ditt.
inline-recovery-key-setup-start-button = Opprett kontogjenopprettingsnøkkel
inline-recovery-key-setup-later-button = Gjer det seinare

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Gøym passord
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Vis passord
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Passordet ditt er akkurat no synleg på skjermen.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Passordet ditt er skjult akkurat no.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Passordet ditt er no synleg på skjermen.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Passordet ditt er no skjult.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Vel land
input-phone-number-enter-number = Skriv inn telefonnummer
input-phone-number-country-united-states = USA
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Tilbake

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Passordlenke for tilbakestilling er skada
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Stadfestingslenka er skada
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Øydelagd lenke
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Lenka du trykte på manglar nokre teikn, og kan ha blitt skada av e-postklienten. Kopier adressa nøye, og prøv på nytt.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Få ei ny lenke

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Hugse passordet ditt?
# link navigates to the sign in page
remember-password-signin-link = Logg inn

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primær e-postadresse allereie stadfesta
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Innlogging allereie stadfesta
confirmation-link-reused-message = Denne stadfestingslenka er allereie brukt, og kan berre brukast ein gong.

## Locale Toggle Component

locale-toggle-select-label = Vel språk
locale-toggle-browser-default = Nettlesar-standard
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Ugyldig førespurnad

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Du treng dette passordet for å få tilgang til alle krypterte data du lagrar hos oss.
password-info-balloon-reset-risk-info = Ei tilbakestilling betyr at data som passord og bokmerke kan gå tapt.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Vel eit sterkt passord du ikkje har brukt på andre nettstadar. Sørg for at det oppfyller tryggingskrava:
password-strength-short-instruction = Vel eit sterkt passord:
password-strength-inline-min-length = Minst 8 teikn
password-strength-inline-not-email = Ikkje di e-postadresse
password-strength-inline-not-common = Ikkje eit vanleg brukt passord
password-strength-inline-confirmed-must-match = Stadfesting samsvarar med det nye passordet
password-strength-inline-passwords-match = Passorda samsvarar

## Notification Promo Banner component

account-recovery-notification-cta = Opprett
account-recovery-notification-header-value = Ikkje mist dataa dine om du gløymer passordet ditt
account-recovery-notification-header-description = Opprett ein kontogjenopprettingsnøkkel for å gjenopprette synkroniserte nettlesardata viss du nokon gong gløymer passordet ditt.
recovery-phone-promo-cta = Legg til gjenopprettingstelefon
recovery-phone-promo-heading = Legg til ekstra vern for kontoen din med ein gjenopprettingstelefon
recovery-phone-promo-description = No kan du logge på med eit eingongspassord via SMS viss du ikkje kan bruke tostegs-autentiseringsappen din.
recovery-phone-promo-info-link = Les meir om gjenoppretting og SIM-swapping-risiko
promo-banner-dismiss-button =
    .aria-label = Avvis banner

## Ready component

ready-complete-set-up-instruction = Fullfør oppsettet ved å skrive inn det nye passordet på dei andre { -brand-firefox }-einingane dine.
manage-your-account-button = Handsam kontoen din
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Du er no klar til å bruke { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Du er no klar til å bruke kontoinnstillingane
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Kontoen din er klar!
ready-continue = Hald fram
sign-in-complete-header = Innlogging stadfesta
sign-up-complete-header = Konto stadfesta
primary-email-verified-header = Primær e-postadresse stadfesta

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Plassar å lagre nøkkelen din:
flow-recovery-key-download-storage-ideas-folder-v2 = Mappe på sikker eining
flow-recovery-key-download-storage-ideas-cloud = Påliteleg skylagring
flow-recovery-key-download-storage-ideas-print-v2 = Utskriven fysisk kopi
flow-recovery-key-download-storage-ideas-pwd-manager = Passordhandsamar

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Legg til eit hint for å finne nøkkelen din
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Dette tipset skal hjelpe deg å hugse kvar du lagra nøkkelen for kontogjenoppretting. Vi kan vise det til deg under tilbakestillinga av passordet for å gjenopprette dataa dine.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Legg til eit hint (valfritt)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Fullfør
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Hintet må innehalde færre enn 255 teikn.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Hintet kan ikkje innehalde usikre unicode-teikn. Berre bokstavar, tal, skiljeteikn og symbol er tillatne.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Åtvaring
password-reset-chevron-expanded = Skjul åtvaring
password-reset-chevron-collapsed = Vis åtvaring
password-reset-data-may-not-be-recovered = Nettlesardataa dine kan ikkje gjenopprettast
password-reset-previously-signed-in-device-2 = Har du ei eining du tidlegare har logga på?
password-reset-data-may-be-saved-locally-2 = Nettlesardataa dine kan vere lagra på den eininga. Tilbakestill passordet ditt, og logg deretter på der for å gjenopprette og synkronisere dataa dine.
password-reset-no-old-device-2 = Har du ei ny eining, men ikkje tilgang til nokon av dei tidlegare?
password-reset-encrypted-data-cannot-be-recovered-2 = Vi beklagar, men dei krypterte nettlesardataa dine på { -brand-firefox }-serverar kan ikkje gjenopprettast.
password-reset-warning-have-key = Har du ein kontogjenopprettingsnøkkel?
password-reset-warning-use-key-link = Bruk han no for å tilbakestille passordet ditt og behalde dataa dine

## Alert Bar

alert-bar-close-message = Lat att melding

## User's avatar

avatar-your-avatar =
    .alt = Avataren din
avatar-default-avatar =
    .alt = Standardavatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla }-produkt
bento-menu-tagline = Fleire produkt frå { -brand-mozilla } som tek vare på personvernet ditt
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox }-nettlesaren for datamaskiner
bento-menu-firefox-mobile = { -brand-firefox }-nettlesar for mobil
bento-menu-made-by-mozilla = Laga av { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Få { -brand-firefox } på mobil eller nettbrett
connect-another-find-fx-mobile-2 = Finn { -brand-firefox } på { -google-play } og { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Last ned { -brand-firefox } på { -google-play }
connect-another-app-store-image-3 =
    .alt = Last ned { -brand-firefox } på { -app-store }

## Connected services section

cs-heading = Tilkopla tenester
cs-description = Alt du brukar og er innlogga på.
cs-cannot-refresh =
    Beklagar, det oppstod eit problem med å oppdatere lista over tilkopla
    tenester.
cs-cannot-disconnect = Fann ikkje klienten, klarte ikkje å kople frå
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Logga ut frå { $service }
cs-refresh-button =
    .title = Oppdater tilkopla tenester
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Manglande- eller duplikatelement?
cs-disconnect-sync-heading = Kople frå Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Nettlesardataa dine blir verande på <span>{ $device }</span>,
    men det vil ikkje lenger synkroniserast med kontoen din.
cs-disconnect-sync-reason-3 = Kva er hovudgrunnen for å kople frå <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Eininga er:
cs-disconnect-sync-opt-suspicious = Mistenkjeleg
cs-disconnect-sync-opt-lost = Mista eller stolen
cs-disconnect-sync-opt-old = Gammal eller skifta ut
cs-disconnect-sync-opt-duplicate = Duplikat
cs-disconnect-sync-opt-not-say = Vil helst ikkje fortelje det

##

cs-disconnect-advice-confirm = Ok, eg forstår
cs-disconnect-lost-advice-heading = Mista eller stolen eining fråkopla
cs-disconnect-lost-advice-content-3 = Sidan eininga di vart mista eller stolen, bør du endre passordet for { -product-mozilla-account } i kontoinnstillingane dine for å halde informasjonen din trygg. Du bør også sjå etter informasjon frå einingsprodusenten om fjernsletting av dataa dine.
cs-disconnect-suspicious-advice-heading = Mistenkjeleg eining fråkopla
cs-disconnect-suspicious-advice-content-2 = Om den fråkopla eininga verkelig er mistenkjeleg, bør du endre passordet for { -product-mozilla-account } i kontoinnstillingane dine for å halde informasjonen din trygg. Du bør også endre eventuelle andre passord du har lagra i { -brand-firefox } ved å skrive about:logins i adresselinja.
cs-sign-out-button = Logg ut

## Data collection section

dc-heading = Datainnsamling og bruk
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-nettlesar
dc-subheader-content-2 = Tillat { -product-mozilla-accounts } å sende tekniske data og interaksjonsdata til { -brand-mozilla }?
dc-subheader-ff-content = For å sjå gjennom eller oppdatere tekniske data og interaksjonsdata-innstillingar i { -brand-firefox }-nettlesaren, opne { -brand-firefox }-innstillingane og naviger til Personvern og sikkerheit.
dc-opt-out-success-2 = Vellykka utmelding. { -product-mozilla-accounts } sender ikkje tekniske data eller interaksjonsdata til { -brand-mozilla }.
dc-opt-in-success-2 = Takk! Deling av desse dataa hjelper oss med å forbetre { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Dessverre oppstod det eit problem med å endre innstillinga for datainnsamling
dc-learn-more = Les meir

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }-meny
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Innlogga som
drop-down-menu-sign-out = Logg ut
drop-down-menu-sign-out-error-2 = Beklagar, det oppstod eit problem med å logge deg ut

## Flow Container

flow-container-back = Tilbake

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Skriv inn passordet ditt på nytt for å vere på den sikre sida
flow-recovery-key-confirm-pwd-input-label = Skriv inn passordet ditt
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Opprett kontogjenopprettingsnøkkel
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Opprett ny kontogjenopprettingsnøkkel

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Kontogjenopprettingsnøkkel oppretta — Last ned og lagre han no
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Denne nøkkelen lèt deg tilbakestille dataa dine om du gløymer passordet ditt. Last ned og lagre han på ein trygg plass — du vil ikkje kunne gå tilbake til denne sida seinare.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Hald fram utan å laste ned

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Kontogjenopprettingsnøkkel oppretta

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Opprett ein kontogjenopprettingsnøkkel i tilfelle du gløymer passordet ditt
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Endre kontogjenopprettingsnøkkelen din
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Vi krypterer nettlesingsdata – passord, bokmerke og meir. Det er flott for personvernet, men du kan miste dataa dine viss du gløymer passordet ditt.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Det er derfor det er så viktig å opprette ein kontogjenopprettingsnøkkel – du kan bruke han til å gjenopprette dataa dine.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Kom i gang
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Avbryt

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Kople til autentiseringsappen din
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Steg 1:</strong> Skann denne QR-koden med ein autentiseringsapp som Duo eller Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-kode for å setje opp tostegs-autentisering. Skann han, eller vel «Får du ikkje skanna QR-koden?» for å få ein hemmeleg nøkkel for oppsett i staden.
flow-setup-2fa-cant-scan-qr-button = Får du ikkje skanna QR-koden?
flow-setup-2fa-manual-key-heading = Skriv inn kode manuelt
flow-setup-2fa-manual-key-instruction = <strong>Steg 1:</strong> Skriv inn denne koden i autentiseringsappen du føretrekkjer.
flow-setup-2fa-scan-qr-instead-button = Skanne QR-kode i staden?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Les meir om autentiseringsappar
flow-setup-2fa-button = Hald fram
flow-setup-2fa-step-2-instruction = <strong>Steg 2:</strong> Skriv inn koden frå autentiseringsappen din.
flow-setup-2fa-input-label = Skriv inn 6-sifra kode
flow-setup-2fa-code-error = Ugyldig eller utgått kode. Sjekk autentiseringsappen din og prøv på nytt.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Vel ein gjenopprettingsmetode
flow-setup-2fa-backup-choice-description = Dette gjer at du kan logge inn dersom du ikkje får tilgang til mobilen eller autentiseringsappen din.
flow-setup-2fa-backup-choice-phone-title = Gjenopprettingstelefon
flow-setup-2fa-backup-choice-phone-badge = Enklast
flow-setup-2fa-backup-choice-phone-info = Få ein gjenopprettingskode via tekstmelding. For tida tilgjengeleg i USA og Canada.
flow-setup-2fa-backup-choice-code-title = Reserve-autentiseringskodar
flow-setup-2fa-backup-choice-code-badge = Tryggast
flow-setup-2fa-backup-choice-code-info = Opprett og lagre eingongs-autentiseringskodar.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Les meir om gjenoppretting og SIM-swapping-risiko

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Skriv inn reserve-autentiseringskode
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Stadfest at du har lagra kodane dine ved å skrive inn ein av dei. Utan desse kodane kan det hende du ikkje kan logge på viss du ikkje har autentiseringsappen din.
flow-setup-2fa-backup-code-confirm-code-input = Skriv inn kode på 10 teikn
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Fullfør

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Lagre reserve-autentiseringskodar
flow-setup-2fa-backup-code-dl-save-these-codes = Oppbevar desse på ein stad du hugsar. Om du ikkje har tilgang til autentiseringsappen din, må du oppgi ein for å logge på.
flow-setup-2fa-backup-code-dl-button-continue = Hald fram

##

flow-setup-2fa-inline-complete-success-banner = Tostegs-autentisering aktivert
flow-setup-2fa-inline-complete-success-banner-description = For å verne alle tilkopla einingar bør du logge ut overalt der du brukar denne kontoen, og deretter logge inn igjen med den nye tostegs-utentiseringa di.
flow-setup-2fa-inline-complete-backup-code = Reserve-autentiseringskodar
flow-setup-2fa-inline-complete-backup-phone = Gjenopprettingstelefon
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kode står att
       *[other] { $count } kodar står att
    }
flow-setup-2fa-inline-complete-backup-code-description = Dette er den sikraste gjenopprettingsmetoden om du ikkje kan logge på med mobileininga eller autentiseringsappen din.
flow-setup-2fa-inline-complete-backup-phone-description = Dette er den enklaste gjenopprettingsmetoden om du ikkje kan logge på med autentiseringsappen din.
flow-setup-2fa-inline-complete-learn-more-link = Korleis dette vernar kontoen din
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Hald fram til { $serviceName }
flow-setup-2fa-prompt-heading = Set opp tostegs-autentisering
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } krev at du konfigurerer tostegs-autentisering for å halde kontoen din trygg.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Du kan bruke kven som helst av <authenticationAppsLink>desse autentiseringsappane</authenticationAppsLink> for å halde fram.
flow-setup-2fa-prompt-continue-button = Hald fram

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Skriv inn stadfestingskode
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Ein 6-sifra kode vart send til <span>{ $phoneNumber }</span> via tekstmelding. Denne koden går ut om 5 minutt.
flow-setup-phone-confirm-code-input-label = Skriv inn 6-sifra kode
flow-setup-phone-confirm-code-button = Stadfest
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Har koden gått ut?
flow-setup-phone-confirm-code-resend-code-button = Send koden på nytt
flow-setup-phone-confirm-code-resend-code-success = Kode sendt
flow-setup-phone-confirm-code-success-message-v2 = Gjenopprettingstelefon lagt til
flow-change-phone-confirm-code-success-message = Gjenopprettingstelefon endra

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Stadfest telefonnummeret ditt
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Du får ei tekstmelding frå { -brand-mozilla } med ein kode for å stadfeste nummeret ditt. Ikkje del denne koden med nokon.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Gjenopprettingstelefon er berre tilgjengeleg i USA og Canada. VoIP-nummer og telefonalias er ikkje tilrådd.
flow-setup-phone-submit-number-legal = Ved å oppgi nummeret ditt godtek du at vi lagrar det slik at vi berre kan sende deg ei tekstmelding for kontostadfesting. Meldings- og datatakstar kan gjelde.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Send kode

## HeaderLockup component, the header in account settings

header-menu-open = Lat att meny
header-menu-closed = Meny for nettstadnavigering
header-back-to-top-link =
    .title = Tilbake til toppen
header-back-to-settings-link =
    .title = Tilbake til { -product-mozilla-account }-innstillingar
header-title-2 = { -product-mozilla-account }
header-help = Hjelp

## Linked Accounts section

la-heading = Kopla kontoar
la-description = Du har autorisert tilgang til følgjande kontoar.
la-unlink-button = Fjern tilknyting
la-unlink-account-button = Fjern tilknyting
la-set-password-button = Vel passord
la-unlink-heading = Fjern tilknyting til tredjepartskonto
la-unlink-content-3 = Er du sikker på, at du vil fjerne tilknytinga til kontoen din? Viss du fjernar tilknytinga til kontoen din, blir du ikkje automatisk logga ut av dei tilknytte tenestene dine. For å gjere det, må du logge ut manuelt i seksjonen Tilkopla tenester.
la-unlink-content-4 = Før du fjernar tilknytinga til kontoen din, må du velje eit passord. Utan passord finst det ingen måte å logge inn på, etter at du har fjerna tilknytinga til kontoen din.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Lat att
modal-cancel-button = Avbryt
modal-default-confirm-button = Stadfest

## ModalMfaProtected

modal-mfa-protected-title = Skriv inn stadfestingskode
modal-mfa-protected-subtitle = Hjelp oss å forsikre oss om at det er du som endrar kontoinformasjonen din
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Skriv inn koden som vart sendt til <email>{ $email }</email> innan { $expirationTime } minutt.
       *[other] Skriv inn koden som vart sendt til <email>{ $email }</email> innan { $expirationTime } minutt.
    }
modal-mfa-protected-input-label = Skriv inn 6-sifra kode
modal-mfa-protected-cancel-button = Avbryt
modal-mfa-protected-confirm-button = Stadfest
modal-mfa-protected-code-expired = Har koden gått ut?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Send ny kode på e-post.

## Modal Verify Session

mvs-verify-your-email-2 = Stadfest e-postadressa di
mvs-enter-verification-code-2 = Skriv inn stadfestingskoden din
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Skriv inn stadfestingskoden som vart send til <email>{ $email }</email> innan 5 minutt.
msv-cancel-button = Avbryt
msv-submit-button-2 = Stadfest

## Settings Nav

nav-settings = Innstillingar
nav-profile = Profil
nav-security = Sikkerheit
nav-connected-services = Tilkopla tenester
nav-data-collection = Datainnsamling og bruk
nav-paid-subs = Betalte abonnement
nav-email-comm = E-postkommunikasjon

## Page2faChange

page-2fa-change-title = Endre tostegs-autentisering
page-2fa-change-success = Tostegs-autentisering er oppdatert
page-2fa-change-success-additional-message = For å verne alle tilkopla einingar bør du logge ut overalt der du brukar denne kontoen, og deretter logge inn igjen med den nye tostegs-utentiseringa di.
page-2fa-change-totpinfo-error = Det oppstod ein feil ved byte av tostegs-autentiseringsappen. Prøv igjen seinare.
page-2fa-change-qr-instruction = <strong>Steg 1:</strong> Skann denne QR-koden med ein autentiseringsapp, til dømes Duo eller Google Authenticator. Dette opprettar ei ny tilkopling, og eventuelle gamle tilkoplingar vil ikkje lenger fungere.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Reserve-autentiseringskodar
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Det oppstod eit problem med å erstatte reserve-autentiseringskodane dine
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Det oppstod eit problem med å opprette reserve-autentiseringskodane dine
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Reserve-autentiseringskodar oppdaterte
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Reserve-autentiseringskodar oppretta
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Oppbevar desse på ein stad du hugsar. Dei gamle kodane dine vil bli erstatta etter at du har fullført neste steg.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Stadfest at du har lagra kodane dine ved å skrive inn ein. Dei gamle reserve-autentiseringskodane dine vil bli deaktiverte når dette steget er fullført.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Feil reserve-autentiseringskode

## Page2faSetup

page-2fa-setup-title = Tostegs-autentisering
page-2fa-setup-totpinfo-error = Det oppstod ein feil under oppsett av tostegs-autentisering. Prøv på nytt seinare.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Den koden er ikkje rett. Prøv på nytt.
page-2fa-setup-success = Tostegs-autentisering er aktivert
page-2fa-setup-success-additional-message = For å verne alle tilkopla einingar bør du logge ut overalt der du brukar denne kontoen, og deretter logge inn igjen med tostegs-autentisering.

## Avatar change page

avatar-page-title =
    .title = Profilbilde
avatar-page-add-photo = Legg til eit foto
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Ta bilde
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Fjern bilde
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Ta bildet på nytt
avatar-page-cancel-button = Avbryt
avatar-page-save-button = Lagre
avatar-page-saving-button = Lagrar…
avatar-page-zoom-out-button =
    .title = Zoom ut
avatar-page-zoom-in-button =
    .title = Zoom inn
avatar-page-rotate-button =
    .title = Roter
avatar-page-camera-error = Klarte ikkje å starte kameraet
avatar-page-new-avatar =
    .alt = nytt profilbilde
avatar-page-file-upload-error-3 = Det oppstod eit problem med å laste opp profilbiletet ditt
avatar-page-delete-error-3 = Det oppstod eit problem med å slette profilbildet ditt
avatar-page-image-too-large-error-2 = Bildefila er for stor, og kan ikkje lastast opp

## Password change page

pw-change-header =
    .title = Endra passord
pw-8-chars = Minst 8 teikn
pw-not-email = Ikkje di e-postadresse
pw-change-must-match = Nytt passord samsvarar med stadfestinga
pw-commonly-used = Ikkje eit vanleg brukt passord
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Hald deg trygg — ikkje bruk same passord fleire gongar. Sjå fleire tips for å <linkExternal>lage sterke passord</linkExternal>.
pw-change-cancel-button = Avbryt
pw-change-save-button = Lagre
pw-change-forgot-password-link = Gløymt passordet?
pw-change-current-password =
    .label = Skriv inn gjeldande passord
pw-change-new-password =
    .label = Skriv inn nytt passord
pw-change-confirm-password =
    .label = Stadfest nytt passord
pw-change-success-alert-2 = Passord oppdatert

## Password create page

pw-create-header =
    .title = Opprett passord
pw-create-success-alert-2 = Passord innstilt
pw-create-error-2 = Det oppstod ein feil under innstilling av passordet ditt.

## Delete account page

delete-account-header =
    .title = Slett kontoen
delete-account-step-1-2 = Steg 1 av 2
delete-account-step-2-2 = Steg 2 av 2
delete-account-confirm-title-4 = Du kan ha kopla { -product-mozilla-account } til eitt eller fleire av følgjande { -brand-mozilla }-produkt eller -tenester som held deg sikker og produktiv på nettet:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synkroniserer { -brand-firefox }-data
delete-account-product-firefox-addons = { -brand-firefox }-tillegg
delete-account-acknowledge = Stadfest at når du slettar kontoen din:
delete-account-chk-box-1-v4 =
    .label = Alle betalte abonnement du har vil bli sagt opp
delete-account-chk-box-2 =
    .label = Du kan miste lagra informasjon og funksjonar i { -brand-mozilla }-produkt
delete-account-chk-box-3 =
    .label = Aktivering på nytt med denne e-postadressa vil kanskje ikkje gjenopprette den lagra informasjonen
delete-account-chk-box-4 =
    .label = Eventuelle utvidingar og tema som du har publisert på addons.mozilla.org vert sletta
delete-account-continue-button = Hald fram
delete-account-password-input =
    .label = Skriv inn passord
delete-account-cancel-button = Avbryt
delete-account-delete-button-2 = Slett

## Display name page

display-name-page-title =
    .title = Visingsnamn
display-name-input =
    .label = Skriv inn visingsnamn
submit-display-name = Lagre
cancel-display-name = Avbryt
display-name-update-error-2 = Det oppstod eit problem med å oppdatere visingsnamnet ditt
display-name-success-alert-2 = Visingsnamn oppdatert

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nyleg kontoaktivitet
recent-activity-account-create-v2 = Konto opretta
recent-activity-account-disable-v2 = Konto deaktivert
recent-activity-account-enable-v2 = Konto aktivert
recent-activity-account-login-v2 = Kontoinnlogging starta
recent-activity-account-reset-v2 = Tilbakestilling av passord starta
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = E-postavvisingar fjerna
recent-activity-account-login-failure = Forsøk på kontopålogging mislykkast
recent-activity-account-two-factor-added = Tostegs-autentisering aktivert
recent-activity-account-two-factor-requested = Tostegs-autentisering påkravd
recent-activity-account-two-factor-failure = Tostegs-autentisering, mislykka
recent-activity-account-two-factor-success = Tostegs-autentisering, vellykka
recent-activity-account-two-factor-removed = Tostegs-autentisering fjerna
recent-activity-account-password-reset-requested = Kontoen ba om tilbakestilling av passord
recent-activity-account-password-reset-success = Kontopassordet er tilbakestilt
recent-activity-account-recovery-key-added = Kontogjenopprettingsnøkkel aktivert
recent-activity-account-recovery-key-verification-failure = Mislykka stadfesting av kontogjenopprettingsnøkkelen
recent-activity-account-recovery-key-verification-success = Kontogjenopprettingsnøkkelen er stadfesta
recent-activity-account-recovery-key-removed = Gjenopprettingsnøkkel for konto fjerna
recent-activity-account-password-added = Nytt passord lagt til
recent-activity-account-password-changed = Passordet er endra
recent-activity-account-secondary-email-added = Sekundær e-postadesse lagt til
recent-activity-account-secondary-email-removed = Sekundær e-postadesse fjerna
recent-activity-account-emails-swapped = Primær og sekundær e-post er bytt om
recent-activity-session-destroy = Logga ut av økta
recent-activity-account-recovery-phone-send-code = Telefonkode for gjenoppretting sendt
recent-activity-account-recovery-phone-setup-complete = Konfigurasjon av gjenopprettingstelefon er fullført
recent-activity-account-recovery-phone-signin-complete = Innlogging med gjennopprettingstelefonen fullført
recent-activity-account-recovery-phone-signin-failed = Mislykka innlogging med gjennopprettingstelefonen
recent-activity-account-recovery-phone-removed = Gjenopprettingstelefon fjerna
recent-activity-account-recovery-codes-replaced = Gjenopprettingskodar erstatta
recent-activity-account-recovery-codes-created = Gjenopprettingskodar oppretta
recent-activity-account-recovery-codes-signin-complete = Innlogging med gjennopprettingskodar er fullført
recent-activity-password-reset-otp-sent = Stadfestingskode for tilbakestilling av passord sendt
recent-activity-password-reset-otp-verified = Stadfestingskode for tilbakestilling av passord  stadfesta
recent-activity-must-reset-password = Tilbakestilling av passord påkravd
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Annan kontoaktivitet

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Kontogjenopprettingsnøkkel
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Tilbake til innstillingar

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Fjern telefonnummeret for gjenoppretting
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Dette vil fjerne <strong>{ $formattedFullPhoneNumber }</strong> som din gjenopprettingstelefon.
settings-recovery-phone-remove-recommend = Vi tilrår at du beheld denne metoden fordi det er enklare enn å lagre reserve-autentiseringskodar.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Viss du slettar han, sørg for at du framleis har dei lagra reserve-autentiseringskodane. <linkExternal>Samanlikn gjenopprettingsmetodar</linkExternal>
settings-recovery-phone-remove-button = Fjern telefonnummeret
settings-recovery-phone-remove-cancel = Avbryt
settings-recovery-phone-remove-success = Gjenopprettingstelefon fjerna

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Legg til gjenopprettingstelefon
page-change-recovery-phone = Endre gjenopprettingstelefon
page-setup-recovery-phone-back-button-title = Tilbake til innstillingar
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Endre telefonnummer

## Add secondary email page

add-secondary-email-step-1 = Steg 1 av 2
add-secondary-email-error-2 = Det oppstod eit problem med å opprette denne e-posten
add-secondary-email-page-title =
    .title = Sekundær e-postadresse
add-secondary-email-enter-address =
    .label = Skriv inn e-postadresse
add-secondary-email-cancel-button = Avbryt
add-secondary-email-save-button = Lagre
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = E-postalias kan ikkje brukast som sekundær e-postadresse

## Verify secondary email page

add-secondary-email-step-2 = Steg 2 av 2
verify-secondary-email-page-title =
    .title = Sekundær e-postadresse
verify-secondary-email-verification-code-2 =
    .label = Skriv inn stadfestingskoden din
verify-secondary-email-cancel-button = Avbryt
verify-secondary-email-verify-button-2 = Stadfest
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Skriv inn stadfestingskoden som vart sendt til <strong>{ $email }</strong> innan 5 minutt.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } lagt til
verify-secondary-email-resend-code-button = Send stadfestingskode på nytt.

##

# Link to delete account on main Settings page
delete-account-link = Slett kontoen
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Innlogga. { -product-mozilla-account }-en din og data held fram med å vere aktive.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Finn ut kvar den private informasjonen din er eksponert og ta kontroll
# Links out to the Monitor site
product-promo-monitor-cta = Få ei gratis skanning

## Profile section

profile-heading = Profil
profile-picture =
    .header = Bilde
profile-display-name =
    .header = Visingsnamn
profile-primary-email =
    .header = Primær e-postadresse

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Steg { $currentStep } av { $numberOfSteps }.

## Security section of Setting

security-heading = Sikkerheit
security-password =
    .header = Passord
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Oppretta: { $date }
security-not-set = Ikkje innstilt
security-action-create = Opprett
security-set-password = Vel eit passord for å synkronisere og bruke visse kontotryggingsfunksjonar.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Vis nyleg kontoaktivitet
signout-sync-header = Økta har gått ut
signout-sync-session-expired = Noko gjekk diverre gale. Logg ut frå nettlesaren og prøv på nytt.

## SubRow component

tfa-row-backup-codes-title = Reserve-autentiseringskodar
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Ingen kodar tilgjengeleg
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } attståande kode
       *[other] { $numCodesAvailable } attståande kodar
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Lag nye kodar
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Legg til
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Dette er den tryggaste gjenopprettingsmetoden dersom du ikkje kan bruke mobiltelefonen din eller autentiseringsapp.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Gjenopprettingstelefon
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Ingen telefonnummer lagt til
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Endre
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Legg til
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Fjern
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Fjern gjenopprettingstelefon
tfa-row-backup-phone-delete-restriction-v2 = Dersom du vil fjerne gjenopprettingstelefonen, legg til reserve-autentiseringskodar eller deaktivere tostegs-autentisering først for å unngå å bli utestengd frå kontoen din.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Dette er den enklaste gjenopprettingsmetoden dersom du ikkje kan bruke autentiseringsappen din.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Finn ut meir om SIM-byterisiko

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Slå av
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Slå på
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Sender inn…
switch-is-on = på
switch-is-off = av

## Sub-section row Defaults

row-defaults-action-add = Legg til
row-defaults-action-change = Endre
row-defaults-action-disable = Slå av
row-defaults-status = Ingen

## Account recovery key sub-section on main Settings page

rk-header-1 = Kontogjenopprettingsnøkkel
rk-enabled = Aktivert
rk-not-set = Ikkje innstilt
rk-action-create = Opprett
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Endre
rk-action-remove = Fjern
rk-key-removed-2 = Gjenopprettingsnøkkel for konto fjerna
rk-cannot-remove-key = Klarte ikkje å fjerne kontogjenopprettingsnøkkelen din.
rk-refresh-key-1 = Oppdater kontogjenopprettingsnøkkel
rk-content-explain = Gjenopprett informasjonen din når du gløymer passordet ditt.
rk-cannot-verify-session-4 = Beklagar, det oppstod eit problem med å stadfeste økta
rk-remove-modal-heading-1 = Fjerne kontogjenopprettingsnøkkel?
rk-remove-modal-content-1 =
    Dersom du tilbakestiller passordet ditt, vil du ikkje kunne bruke
    kontogjenopprettingsnøkkelen for kontoen, for å få tilgang til dataa dine. Du kan ikkje angre denne handlinga.
rk-remove-error-2 = Klarte ikkje å fjerne kontogjenopprettingsnøkkelen din
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Slett kontogjenopprettingsnøkkel

## Secondary email sub-section on main Settings page

se-heading = Sekundær e-postadresse
    .header = Sekundær e-postadresse
se-cannot-refresh-email = Beklagar, det oppstod eit problem med oppdatering av denne e-posten.
se-cannot-resend-code-3 = Beklagar, det oppstod eit problem med å sende stadfestingskoden på nytt
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } er no den primære e-postadressa di
se-set-primary-error-2 = Beklagar, det oppstod eit problem med å endre den primære e-postadressa di
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } er sletta
se-delete-email-error-2 = Beklagar, det oppstod eit problem med å slette denne e-posten
se-verify-session-3 = Du må stadfeste den geldande økta for å utføre denne handlinga
se-verify-session-error-3 = Beklagar, det oppstod eit problem med å stadfeste økta
# Button to remove the secondary email
se-remove-email =
    .title = Fjern e-postadresse
# Button to refresh secondary email status
se-refresh-email =
    .title = Oppdater e-postadresse
se-unverified-2 = ikkje stadfesta
se-resend-code-2 =
    Stadfesting nødvendig. <button>Send stadfestingskoden på nytt</button>
    viss han ikkje er i innboksen eller søppelpostmappa.
# Button to make secondary email the primary
se-make-primary = Bruk som primær e-postadresse
se-default-content = Få tilgang til kontoen din viss du ikkje kan logge inn med den primære e-postadressa di.
se-content-note-1 =
    Merk: ei sekundær e-postadresse vil ikkje rette opp igjen informasjonen din – du treng 
    ein <a>kontogjenopprettingsnøkkel</a> for det.
# Default value for the secondary email
se-secondary-email-none = Ingen

## Two Step Auth sub-section on Settings main page

tfa-row-header = Tostegs-autentisering
tfa-row-enabled = Aktivert
tfa-row-disabled-status = Avslått
tfa-row-action-add = Legg til
tfa-row-action-disable = Slå av
tfa-row-action-change = Endre
tfa-row-button-refresh =
    .title = Oppdater tostegs-autentisering
tfa-row-cannot-refresh =
    Diverre oppstod det eit problem med å oppdatere
    tostegs-autentisering.
tfa-row-enabled-description = Kontoen din er beskytta av tostegs-autentisering. Du må skrive inn eit eingongspassord frå autentiseringsappen når du loggar inn på { -product-mozilla-account }en din.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Korleis dette vernar kontoen din
tfa-row-disabled-description-v2 = Sikre kontoen din ved å bruke ein tredjeparts autentiseringsapp som eit andre steg for å logge på.
tfa-row-cannot-verify-session-4 = Beklagar, det oppstod eit problem med å stadfeste økta
tfa-row-disable-modal-heading = Deaktivere tostegs-autentisering?
tfa-row-disable-modal-confirm = Slå av
tfa-row-disable-modal-explain-1 =
    Du kan ikkje angre denne handlinga. Du har også
    høve til å <linkExternal>erstatte reserve-autentiseringskodane dine</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Tostegs-autentisering deaktivert
tfa-row-cannot-disable-2 = Klarte ikkje å deaktivere tostegs-autentisering
tfa-row-verify-session-info = Du må stadfeste den noverande økta di for å konfigurere tostegs-verifisering

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Ved å halde fram seier du deg samd i:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } abonnementstenester <mozSubscriptionTosLink>tenestevilkår</mozSubscriptionTosLink> og <mozSubscriptionPrivacyLink>personvernfråsegn</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>tenestevilkår</mozillaAccountsTos> og <mozillaAccountsPrivacy>personvernfråsegn</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Ved å halde fram, godtek du <mozillaAccountsTos>tenestevilkåra</mozillaAccountsTos> og <mozillaAccountsPrivacy>personvernfråsegna</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Eller
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Logg inn med
continue-with-google-button = Hald fram med { -brand-google }
continue-with-apple-button = Hald fram med { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Ukjend konto
auth-error-103 = Feil passord
auth-error-105-2 = Ugyldig stadfestingskode
auth-error-110 = Ugyldig token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Du har prøvd for mange gongar. Prøv igjen seinare.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Du har prøvd for mange gongar. Prøv igjen { $retryAfter }.
auth-error-125 = Førespurnaden vart blokkert pga. tryggingsårsaker
auth-error-129-2 = Du skreiv inn eit ugyldig telefonnummer. Kontroller det, og prøv på nytt.
auth-error-138-2 = Ikkje stadfesta økt
auth-error-139 = Sekundær e-postadresse må vere ulik e-postadressa til kontoen din
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Denne e-postadressa er reservert av ein annan konto. Prøv igjen seinare, eller bruk ei annen e-postadresse.
auth-error-155 = TOTP-token ikkje funne
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Fann ikkje reserve-autentiseringskoden
auth-error-159 = Ugyldig kontogjenopprettingsnøkkel
auth-error-183-2 = Ugyldig eller utgått stadfestingskode
auth-error-202 = Funksjonen er ikkje aktivert
auth-error-203 = Systemet utilgjengeleg, prøv igjen seinare
auth-error-206 = Kan ikkje opprette passord, passordet er allereie angitt
auth-error-214 = Gjenopprettings-telefonnummeret finst allereie
auth-error-215 = Gjenopprettings-telefonnummeret finst ikkje
auth-error-216 = Grensa for tekstmeldingar er nådd
auth-error-218 = Klarte ikkje å fjerne gjenopprettingstelefonen, manglar reserve-autentiseringskodar.
auth-error-219 = Dette telefonnummeret er registrert med for mange kontoar. Prøv eit anna nummer.
auth-error-999 = Uventa feil
auth-error-1001 = Innloggingsforsøket avbrote
auth-error-1002 = Økta er slutt. Logg inn for å halde fram.
auth-error-1003 = Lokal lagring eller infokapslar er framleis slått av
auth-error-1008 = Det må vere eit nytt passord
auth-error-1010 = Gyldig passord påkravd
auth-error-1011 = Gyldig e-postadresse påkravd
auth-error-1018 = Stadfestings e-posten din kom i retur. Feil i e-postadressa?
auth-error-1020 = Feil e-postadresse? firefox.com er ikkje ei gyldig e-postteneste
auth-error-1031 = Du må skrive inn alder for å registrere deg
auth-error-1032 = Du må skrive inn ein gyldig alder for å registrere deg
auth-error-1054 = Feil tostegs-autentiseringskode
auth-error-1056 = Ugyldig reserve-autentiseringskode
auth-error-1062 = Ugyldig omdirigering
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Feil e-postadresse? { $domain } er ikkje ei gyldig e-postteneste
auth-error-1066 = E-postmasker kan ikkje brukast til å opprette ein konto.
auth-error-1067 = Feilksriven e-postadresse?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Nummer som sluttar på { $lastFourPhoneNumber }
oauth-error-1000 = Noko gjekk gale. Lat att fana og prøv på nytt.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Du er logga inn på { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-postadresse stadfesta
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Innlogging stadfesta
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Logg inn på denne { -brand-firefox } for å gjere ferdig konfigurasjonen
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Logg inn
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Legg du framleis til einingar? Logg inn på { -brand-firefox } på ei anna eining for å fullføre oppsettet
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Logg inn på { -brand-firefox } på ei anna eining for å fullføre oppsettet
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Vil du ha fanene, bokmerka og passorda dine på ei anna eining?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Kople til ei anna eining
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ikkje no
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Logg inn på { -brand-firefox } for Android for å fullføre konfigurasjonen
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Logg inn på { -brand-firefox } for iOS for å fullføre konfigurasjonen

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Lokal lagring og infokapslar er påkravd
cookies-disabled-enable-prompt-2 = Slå på infokapslar og lokal lagring i nettlesaren din for å få tilgang til { -product-mozilla-account }en din. Dette vil aktivere funksjonalitet som for til dømes å hugse deg mellom økter.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Prøv igjen
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Les meir

## Index / home page

index-header = Skriv inn e-postadressa di
index-sync-header = Hald fram til { -product-mozilla-account }en din
index-sync-subheader = Synkroniser passorda, fanene og bokmerka dine overalt der du brukar { -brand-firefox }.
index-relay-header = Lag eit e-postalias
index-relay-subheader = Skriv inn e-postadressa dit du vill vidaresende e-postmeldingar frå den maskerte e-postadressa di.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Hald fram til { $serviceName }
index-subheader-default = Hald fram til kontoinnstillingar
index-cta = Registrer deg eller logg inn
index-account-info = Ein { -product-mozilla-account } låser også opp tilgang til meir personvern-beskyttande produkt frå { -brand-mozilla }.
index-email-input =
    .label = Skriv inn e-postadressa di
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Kontoen er no sletta
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Stadfestings e-posten din kom i retur. Feil i e-postadressa?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Ops! Vi klarte ikkje å opprette kontogjenopprettingsnøkkelen din. Prøv igjen seinare.
inline-recovery-key-setup-recovery-created = Kontogjenopprettingsnøkkel oppretta
inline-recovery-key-setup-download-header = Sikre kontoen din
inline-recovery-key-setup-download-subheader = Last ned og lagre han no
inline-recovery-key-setup-download-info = Oppbevar denne nøkkelen ein stad du vil hugse - du vil ikkje kunne kome tilbake til denne sida seinare.
inline-recovery-key-setup-hint-header = Tryggingstilråding

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Avbryt konfigurasjon
inline-totp-setup-continue-button = Hald fram
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Legg til eit lag med sikkerheit til kontoen din ved å krevje autentiseringskodar frå ein av <authenticationAppsLink>desse autentiseringsappane</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Aktiver tostegs-autentisering <span>for å halde fram til kontoinnstillingane</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Aktiver tostegs-autentisering <span>for å halde fram til { $serviceName }</span>
inline-totp-setup-ready-button = Klar
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Skann gautentiseringskoden <span>for å halde fram til { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Skriv inn koden manuelt <span>for å halde fram til { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Skann autentiseringskoden <span>for å halde fram til innstillingar</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Skriv inn koden manuelt <span>for å halde fram til kontoinnstillingar</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Skriv inn den hemmelege nøkkelen i autentiseringsappen din. <toggleToQRButton>Skanne QR-kode i staden?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Skann QR-koden i autentiseringsappen din, og skriv deretter inn autentiseringskoden han gir. <toggleToManualModeButton>Kan du ikkje skanne koden?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Ved fullføring, byrjar han å generere autentiseringskodar som du kan skrive inn.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Autentiseringskode
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Autentiseringskode påkravd
tfa-qr-code-alt = Bruk koden { $code } or å stille inn tostegs-autentisering i støtta appar.
inline-totp-setup-page-title = Tostegs-autentisering

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Juridisk
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Tenestevilkår
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Personvernpraksis

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Personvernpraksis

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Tenestevilkår

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Logga du nettopp på { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Ja, godkjenn eininga
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Viss dette ikkje var deg, <link>endre passordet ditt</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Eining tilkopla
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Du synkroniserer no med: { $deviceFamily } på { $deviceOS }
pair-auth-complete-sync-benefits-text = No får du tilgang til opne faner, passord og bokmerke på alle einingane dine.
pair-auth-complete-see-tabs-button = Vis faner frå andre einingar
pair-auth-complete-manage-devices-link = Handsam einingar

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Skriv inn autentiseringskoden <span>for å halde fram til kontoinnstillingar</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Skriv inn autentiseringskode <span>for å halde fram til { $serviceName }</span>
auth-totp-instruction = Opne autentiseringsappen din og skriv inn autentiseringskoden du får opp.
auth-totp-input-label = Skriv inn 6-sifra kode
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Stadfest
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Autentiseringskode påkravd

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Godkjenning er no påkravd <span>frå den andre eininga di</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Paring ikkje vellykka
pair-failure-message = Installasjonsprosessen vart avslutta.

## Pair index page

pair-sync-header = Synkroniser { -brand-firefox } på telefonen eller nettbrettet ditt
pair-cad-header = Kople { -brand-firefox } til ei anna eining
pair-already-have-firefox-paragraph = Har du allereie { -brand-firefox } på ein telefon eller eit nettbrett?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synkroniser eininga di
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Eller last ned
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Skann for å laste ned { -brand-firefox } for mobil, eller send deg sjølv ei <linkExternal>nedlastingslenke</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ikkje no
pair-take-your-data-message = Ta med fanene, bokmerka og passorda dine overalt der du brukar { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Kom i gang
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-kode

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Eining tilkopla
pair-success-message-2 = Paring vellykka.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Stadfest paring <span>for { $email }</span>
pair-supp-allow-confirm-button = Stadfest paring
pair-supp-allow-cancel-link = Avbryt

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Godkjenning er no påkravd <span>frå den andre eininga di</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Paring via ein app
pair-unsupported-message = Brukte du systemkameraet? Du må pare med ein { -brand-firefox }-app.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Opprett passord for å synkronisere
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Dette krypterer dataa dine. Det kan ikkje vere det same som passordet på { -brand-google }- eller { -brand-apple }-kontoen din.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Vent litt, du vert omdirigert til den autoriserte applikasjonen.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Skriv inn kontogjenopprettingsnøkkelen din
account-recovery-confirm-key-instruction = Denne nøkkelen gjenopprettar dei krypterte nettlesardataa dine, til dømes passord og bokmerke, frå { -brand-firefox }-serverar.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Skriv inn den 32-sifra kontogjenopprettingsnøkkelen din
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Lagringstipset ditt er:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Hald fram
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Finn du ikkje kontogjenopprettingsnøkkelen din?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Lag eit nytt passord
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Passord innstilt
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Det oppstod ein feil under innstilling av passordet ditt.
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Bruk kontogjenopprettingsnøkkelen
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Passordet er tilbakestilt.
reset-password-complete-banner-message = Ikkje gløym å generere ein ny kontogjenopprettingsnøkkel frå { -product-mozilla-account }-innstillingane for å hindre framtidige påloggingsproblem.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake for å bruke eit e-postalias etter at du har logga på.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Skriv inn 10-sifra kode
confirm-backup-code-reset-password-confirm-button = Stadfest
confirm-backup-code-reset-password-subheader = Skriv inn reserve-autentiseringskode
confirm-backup-code-reset-password-instruction = Skriv inn ein av eingongskodane du lagra då du konfigurerte tostegs-autentisering
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Er du sperra ute?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Sjekk e-posten din
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Vi har sendt ein stadfestingskode til <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Skriv inn 8-sifra kode innan 10 minutt
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Hald fram
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Send koden på nytt
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Bruk ein annan konto

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Tilbakestill passord
confirm-totp-reset-password-subheader-v2 = Skriv inn tostegs-autentiseringskode
confirm-totp-reset-password-instruction-v2 = Sjekk <strong>autentiseringsappen</strong> for å tilbakestille passordet ditt.
confirm-totp-reset-password-trouble-code = Har du poblem med å taste inn koden?
confirm-totp-reset-password-confirm-button = Stadfest
confirm-totp-reset-password-input-label-v2 = Skriv inn 6-sifra kode
confirm-totp-reset-password-use-different-account = Bruk ein annan konto

## ResetPassword start page

password-reset-flow-heading = Tilbakestill passordet ditt
password-reset-body-2 =
    Vi ber om eit par ting berre du veit for å behalde kontoen din
    sikker.
password-reset-email-input =
    .label = Skriv inn e-postadressa di
password-reset-submit-button-2 = Hald fram

## ResetPasswordConfirmed

reset-password-complete-header = Passordet ditt er tilbakestilt
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Hald fram til { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Tilbakestill passord
password-reset-recovery-method-subheader = Vel ein gjenopprettingsmetode
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = La oss forsikre oss om at det er du som brukar gjenopprettingsmetodane dine.
password-reset-recovery-method-phone = Gjenopprettingstelefon
password-reset-recovery-method-code = Reserve-autentiseringskodar
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kode er att
       *[other] { $numBackupCodes } kodar er att
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Det oppstod eit problem med å sende ein kode til gjenopprettingstelefonen din
password-reset-recovery-method-send-code-error-description = Prøv igjen seinare eller bruk reserve-autentiseringskodane dine.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Tilbakestill passord
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Skriv inn gjenopprettingskode
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Ein 6-sifra kode vart send til telefonnummeret som sluttar på <span>{ $lastFourPhoneDigits }</span> via tekstmelding. Denne koden går ut etter 5 minutt. Ikkje del denne koden med nokon.
reset-password-recovery-phone-input-label = Skriv inn 6-sifra kode
reset-password-recovery-phone-code-submit-button = Stadfest
reset-password-recovery-phone-resend-code-button = Send koden på nytt
reset-password-recovery-phone-resend-success = Kode sendt
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Er du sperra ute?
reset-password-recovery-phone-send-code-error-heading = Det oppstod eit problem med å sende ein kode
reset-password-recovery-phone-code-verification-error-heading = Det oppstod eit problem med å stadfeste koden din
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Prøv igjen seinare.
reset-password-recovery-phone-invalid-code-error-description = Koden er ugyldig eller utgått.
reset-password-recovery-phone-invalid-code-error-link = Vil du bruke reserve-autentiseringskodar i staden?
reset-password-with-recovery-key-verified-page-title = Passordet er tilbakestilt
reset-password-complete-new-password-saved = Nytt passord lagra!
reset-password-complete-recovery-key-created = Ny kontogjenopprettingsnøkkel oppretta. Last ned og lagre han no.
reset-password-complete-recovery-key-download-info =
    Denne nøkkelen er viktig for
    datagjenoppretting viss du gløymer passordet ditt. <b>Last ned og lagre han sikkert
    no, sidan du ikkje vil få tilgang til denne sida igjen seinare.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Feil:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Validerer innlogging…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Stadfestingsfeil
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Stadfestingslenka har gått ut
signin-link-expired-message-2 = Lenka du klikka på har gått ut, eller er allereie brukt.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Skriv inn passordet ditt <span>for { -product-mozilla-account }en din</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Hald fram til { $serviceName }
signin-subheader-without-logo-default = Hald fram til kontoinnstillingar
signin-button = Logg inn
signin-header = Logg inn
signin-use-a-different-account-link = Bruk ein annan konto
signin-forgot-password-link = Gløymt passordet?
signin-password-button-label = Passord
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake for å bruke eit e-postalias etter at du har logga på.
signin-code-expired-error = Koden har gått ut. Logg inn på nytt.
signin-account-locked-banner-heading = Tilbakestill passord
signin-account-locked-banner-description = Vi låste kontoen din for å verne han mot mistenkjeleg aktivitet.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Tilbakestill passord for å logge inn

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Lenka du trykte på manglar nokre teikn, og kan ha blitt skada av e-postklienten. Kopier adressa nøye, og prøv på nytt.
report-signin-header = Rapportere uautorisert inloggning?
report-signin-body = Du har fått e-post om forsøk på å få tillgang til kontoen din. Vil du rapportere denne aktiviteten som mistenkjeleg?
report-signin-submit-button = Rapporter aktivitet
report-signin-support-link = Kvifor skjer dette?
report-signin-error = Beklagar, det oppstod eit problem med å sende inn rapporten.
signin-bounced-header = Beklagar. Vi har låst kontoen din.
# $email (string) - The user's email.
signin-bounced-message = E-poststadfestinga vi sende til { $email } kom i retur, og vi låste kontoen din for å verne { -brand-firefox }-dataa dine.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Dersom dette er en gyldig e-postadresse, <linkExternal>gi oss beskjed</linkExternal>, så kan vi hjelpe deg med å låse opp kontoen din.
signin-bounced-create-new-account = Har du ikkje lenger denne e-postadressa? Lag ein ny konto
back = Tilbake

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Stadfest denne innlogginga <span>for å halde fram til kontoinnstillingane</span>
signin-push-code-heading-w-custom-service = Stadfest denne innlogginga <span>for å halde fram til { $serviceName }</span>
signin-push-code-instruction = Kontroller dei andre einingane dine og godkjenn denne innlogginga frå { -brand-firefox }-nettlesaren din.
signin-push-code-did-not-recieve = Har du ikkje motteke varselet?
signin-push-code-send-email-link = Send kode på e-post

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Stadfest innlogginga di
signin-push-code-confirm-description = Vi oppdaga eit innloggingsforsøk frå følgjande eining. Viss dette var deg, ver vennleg og godkjenn innlogginga
signin-push-code-confirm-verifying = Kontrollerer
signin-push-code-confirm-login = Stadfest pålogging
signin-push-code-confirm-wasnt-me = Dette var ikkje meg, byt passord.
signin-push-code-confirm-login-approved = Innlogginga di er godkjend. lat att dette vindauget.
signin-push-code-confirm-link-error = Lenka er skadd. Prøv igjen.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Logg inn
signin-recovery-method-subheader = Vel ein gjenopprettingsmetode
signin-recovery-method-details = La oss forsikre oss om at det er du som brukar gjenopprettingsmetodane dine.
signin-recovery-method-phone = Gjenopprettingstelefon
signin-recovery-method-code-v2 = Reserve-autentiseringskodar
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes }-kode er att
       *[other] { $numBackupCodes }-kodar er att
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Det oppstod eit problem med å sende ein kode til gjenopprettingstelefonen din
signin-recovery-method-send-code-error-description = Prøv igjen seinare eller bruk reserve-autentiseringskodane dine.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Logg inn
signin-recovery-code-sub-heading = Skriv inn reserve-autentiseringskode
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Skriv inn ein av eingongskodane du lagra då du sette opp tostegs-autentisering.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Skriv inn 10-sifra kode
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Stadfest
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Bruk gjenopprettingstelefon
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Er du sperra ute?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Reserve-autentiseringskode påkravd
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Det oppstod eit problem med å sende ein kode til gjenopprettingstelefonen din
signin-recovery-code-use-phone-failure-description = Prøv igjen seinare.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Logg inn
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Skriv inn gjenopprettingskode
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Ein 6-sifra kode vart send til telefonnummeret som sluttar på <span>{ $lastFourPhoneDigits }</span> via tekstmelding. Denne koden går ut etter 5 minutt. Ikkje del denne koden med nokon.
signin-recovery-phone-input-label = Skriv inn 6-sifra kode
signin-recovery-phone-code-submit-button = Stadfest
signin-recovery-phone-resend-code-button = Send koden på nytt
signin-recovery-phone-resend-success = Kode sendt
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Er du sperra ute?
signin-recovery-phone-send-code-error-heading = Det oppstod eit problem med å sende ein kode
signin-recovery-phone-code-verification-error-heading = Det oppstod eit problem med å stadfeste koden din
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Prøv igjen seinare.
signin-recovery-phone-invalid-code-error-description = Koden er ugyldig eller utgått.
signin-recovery-phone-invalid-code-error-link = Vil du bruke reserve-godkjenningskodar i staden?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Inlogga. Avgrensingar kan gjelde om du brukar gjenopprettingstelefonen din igjen.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Takk før vaktsemda di
signin-reported-message = Teamet vårt er varsla. Rapportar som denne hjelper oss med å avverja inntrengarar.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Skriv inn stadfestingskode<span> for { -product-mozilla-account }en din</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Skriv inn koden som vart sendt til <email>{ $email }</email>, innan 5 minutt.
signin-token-code-input-label-v2 = Skriv inn 6-sifra kode
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Stadfest
signin-token-code-code-expired = Har koden gått ut?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Send ny kode på e-post.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Stadfestingskode påkravd
signin-token-code-resend-error = Noko gjekk gale. Klarte ikkje å sende ein ny kode.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake for å bruke eit e-postalias etter at du har logga på.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Logg inn
signin-totp-code-subheader-v2 = Skriv inn tostegs-autentiseringskode
signin-totp-code-instruction-v4 = Sjekk <strong>autentiseringsappen</strong> for å stadfeste innlogginga.
signin-totp-code-input-label-v4 = Skriv inn 6-sifra kode
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Kvifor vert du beden om å autentisere deg?
signin-totp-code-aal-banner-content = Du har konfigurert tostegs-autentisering på kontoen din, men har ikkje logga på med ein kode på denne eininga enno.
signin-totp-code-aal-sign-out = Logg ut på denne eininga
signin-totp-code-aal-sign-out-error = Beklagar, det oppstod eit problem med å logge deg ut
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Stadfest
signin-totp-code-other-account-link = Bruk ein annan konto
signin-totp-code-recovery-code-link = Har du poblem med å taste inn koden?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Autentiseringskode påkravd
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake for å bruke eit e-postalias etter at du har logga på.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Godkjenn denne innlogginga
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Sjekk e-posten din for godkjenningskoden sendt til { $email }.
signin-unblock-code-input = Skriv inn godkjenningskode
signin-unblock-submit-button = Hald fram
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Godkjenningskode påkravd
signin-unblock-code-incorrect-length = Godkjenningskoden må innehalde 8 teikn
signin-unblock-code-incorrect-format-2 = Godkjenningskoden kan berre innehalde bokstavar og/eller tal
signin-unblock-resend-code-button = Ikkje i innboksen eller søppelpost-mappa? Send på nytt
signin-unblock-support-link = Kvifor skjer dette?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake for å bruke eit e-postalias etter at du har logga på.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Skriv inn stadfestingskode
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Skriv inn stadfestingskode <span>for { -product-mozilla-account }-en din</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Skriv inn koden som vart sendt til <email>{ $email }</email>, innan 5 minutt.
confirm-signup-code-input-label = Skriv inn 6-sifra kode
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Stadfest
confirm-signup-code-sync-button = Start synkronisering
confirm-signup-code-code-expired = Har koden gått ut?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Send ny kode på e-post.
confirm-signup-code-success-alert = Kontoen er stadfesta
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Stadfestingskode er påkravd
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake for å bruke eit e-postalias etter at du har logga på.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Opprett passord
signup-relay-info = Eit passord er nødvendig for å sikkert administrere dei maskerte e-postane dine og få tilgang til tryggingsverktøya til { -brand-mozilla }.
signup-sync-info = Synkroniser passorda, bokmerka, og meir, overalt der du brukar { -brand-firefox }.
signup-sync-info-with-payment = Synkroniser passorda, betalingsmetodar, bokmerka, og meir, overalt der du brukar { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Endre e-post

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synkronisering er slått på
signup-confirmed-sync-success-banner = { -product-mozilla-account } stadfesta
signup-confirmed-sync-button = Start nettlesinga
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Passorda dine, betalingsmetodane, adressene, bokmerka, historikken din, og meir, kan synkroniserast overalt der du brukar { -brand-firefox }.
signup-confirmed-sync-description-v2 = Passorda, adressene, bokmerka, historikken, og meir, kan synkroniserast overalt der du brukar { -brand-firefox }.
signup-confirmed-sync-add-device-link = Legg til ei anna eining
signup-confirmed-sync-manage-sync-button = Handsam synkronisering
signup-confirmed-sync-set-password-success-banner = Synkroniseringspassord oppretta
