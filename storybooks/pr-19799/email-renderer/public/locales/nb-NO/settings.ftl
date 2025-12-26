# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = En ny kode ble sendt til e-posten din.
resend-link-success-banner-heading = En ny lenke ble sendt til e-posten din.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Legg til { $accountsEmail } i kontaktene dine for å sikre en problemfri levering.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Lukk banner
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } vil bli omdøpt til { -product-mozilla-accounts } 1. november
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Du vil fortsatt logge inn med samme brukernavn og passord, og det er ingen andre endringer i produktene du bruker.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Vi har endret navn på { -product-firefox-accounts } til { -product-mozilla-accounts }. Du vil fortsatt logge på med samme brukernavn og passord, og det er ingen andre endringer i produktene du bruker.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Les mer
# Alt text for close banner image
brand-close-banner =
    .alt = Lukk banner
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
recovery-key-download-button-v3 = Last ned og fortsett
    .title = Last ned og fortsett
recovery-key-pdf-heading = Kontogjenopprettingsnøkkel
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Opprettet den { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Kontogjenopprettingsnøkkel
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Denne nøkkelen lar deg gjenopprette krypterte nettleserdata (inkludert passord, bokmerker og historikk) hvis du glemmer passordet. Oppbevar det på et sted du husker.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Steder å oppbevare nøkkelen din
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Les mer om kontogjenopprettingsnøkkel
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Beklager, det oppstod et problem da kontogjenopprettingsnøkkelen skulle lastes ned.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Få mer fra { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Få våre siste nyheter og produktoppdateringer
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Tidlig tilgang til å teste nye produkter
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Handlingsvarsler for å vinne tilbake internett

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Lastet ned
datablock-copy =
    .message = Kopiert
datablock-print =
    .message = Skrevet ut

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Kode kopiert
       *[other] Koder kopiert
    }
datablock-download-success =
    { $count ->
        [one] Kode lastet ned
       *[other] Koder lastet ned
    }
datablock-print-success =
    { $count ->
        [one] Kode skrevet ut
       *[other] Koder skrevet ut
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
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (anslått)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (anslått)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (anslått)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (anslått)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Ukjent plassering
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
form-password-with-inline-criteria-signup-submit-button = Opprett konto
form-password-with-inline-criteria-reset-new-password =
    .label = Nytt passord
form-password-with-inline-criteria-confirm-password =
    .label = Bekreft passord
form-password-with-inline-criteria-reset-submit-button = Lag nytt passord
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Passord
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Gjenta passord
form-password-with-inline-criteria-set-password-submit-button = Start synkronisering
form-password-with-inline-criteria-match-error = Passordene er ikke like
form-password-with-inline-criteria-sr-too-short-message = Passordet må inneholde minst 8 tegn.
form-password-with-inline-criteria-sr-not-email-message = Passordet kan ikke inneholde e-postadressen din.
form-password-with-inline-criteria-sr-not-common-message = Passordet kan ikke være et typisk brukt passord.
form-password-with-inline-criteria-sr-requirements-met = Det angitte passordet følger alle passordkrav.
form-password-with-inline-criteria-sr-passwords-match = De angitte passordene samsvarer.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Dette feltet er obligatorisk

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Skriv inn { $codeLength }-sifret kode for å fortsette
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Skriv inn koden på { $codeLength } tegn for å fortsette

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox }-kontogjenopprettingsnøkkel
get-data-trio-title-backup-verification-codes = Reserve-autentiseringskoder
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
    .aria-label = Advarsel
authenticator-app-aria-label =
    .aria-label = Autentiseringsapplikasjon
backup-codes-icon-aria-label-v2 =
    .aria-label = Reserve-autentiseringskoder aktivert
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Reserve-autentiseringskoder deaktivert
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Gjenopprettings-SMS slått på
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Gjenopprettings-SMS slått av
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Canadisk flagg
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Valgt
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Suksess
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Slått på
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Lukk melding
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
    .aria-label = Amerikansk flagg

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = En datamaskin og en mobiltelefon og et bilde av et knust hjerte på hver av dem
hearts-verified-image-aria-label =
    .aria-label = En datamaskin, en mobiltelefon og et nettbrett med et pulserende hjerte på hver av dem.
signin-recovery-code-image-description =
    .aria-label = Dokument som inneholder skjult tekst.
signin-totp-code-image-label =
    .aria-label = En enhet med en skjult 6-sifret kode.
confirm-signup-aria-label =
    .aria-label = En konvolutt som inneholder en lenke
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Illustrasjon som representerer en kontogjenopprettingsnøkkel.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Illustrasjon som representerer en kontogjenopprettingsnøkkel.
password-image-aria-label =
    .aria-label = En illustrasjon av en inntasting av et passord.
lightbulb-aria-label =
    .aria-label = Illustrasjon av hvordan du lager et oppbevaringshint.
email-code-image-aria-label =
    .aria-label = Illustrasjon av en e-post som inneholder en kode.
recovery-phone-image-description =
    .aria-label = Mobilenhet som mottar en kode via tekstmelding.
recovery-phone-code-image-description =
    .aria-label = Kode mottatt på en mobilenhet.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilenhet med SMS-funksjonalitet
backup-authentication-codes-image-aria-label =
    .aria-label = Enhetsskjerm med koder
sync-clouds-image-aria-label =
    .aria-label = Skyer med et synkroniseringsikon
confetti-falling-image-aria-label =
    .aria-label = Animert fallende konfetti

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Du er logget inn på { -brand-firefox }.
inline-recovery-key-setup-create-header = Sikre kontoen din
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Har du et minutt til å beskytte dataene dine?
inline-recovery-key-setup-info = Opprett en kontogjenopprettingsnøkkel slik at du kan gjenopprette synkroniserte nettleserdata hvis du glemmer passordet ditt.
inline-recovery-key-setup-start-button = Opprett kontogjenopprettingsnøkkel
inline-recovery-key-setup-later-button = Gjør det senere

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Skjul passord
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Vis passord
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Passordet ditt er for øyeblikket synlig på skjermen.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Passordet ditt er for øyeblikket skjult.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Passordet ditt er nå synlig på skjermen.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Passordet ditt er nå skjult.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Velg land
input-phone-number-enter-number = Skriv inn telefonnummer
input-phone-number-country-united-states = USA
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Tilbake

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Lenke for tilbakestilling av passordet er skadet
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Bekreftelseslenken er skadet
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Ødelagt lenke
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Lenken du klikket på mangler noen tegn, og kan ha blitt forandret av e-postklienten. Sjekk at du kopierte riktig, og prøv igjen.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Motta en ny lenke

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Husker du passordet ditt?
# link navigates to the sign in page
remember-password-signin-link = Logg inn

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Primær e-post allerede bekreftet
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Innlogging allerede bekreftet
confirmation-link-reused-message = Den bekreftelseslenken ble allerede brukt, og kan bare brukes én gang.

## Locale Toggle Component

locale-toggle-select-label = Velg språk
locale-toggle-browser-default = Nettleser-standard
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Ugyldig forespørsel

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Du trenger dette passordet for å få tilgang til krypterte data du lagrer hos oss.
password-info-balloon-reset-risk-info = En tilbakestilling betyr potensielt tap av data som passord og bokmerker.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Velg et sterkt passord du ikke har brukt på andre nettsteder. Sørg for at det oppfyller sikkerhetskravene:
password-strength-short-instruction = Velg et sterkt passord:
password-strength-inline-min-length = Minst 8 tegn
password-strength-inline-not-email = Ikke e-postadressen din
password-strength-inline-not-common = Ikke et typisk brukt passord
password-strength-inline-confirmed-must-match = Bekreftelsen samsvarer med det nye passordet
password-strength-inline-passwords-match = Passordene samsvarer

## Notification Promo Banner component

account-recovery-notification-cta = Opprett
account-recovery-notification-header-value = Ikke mist dataene dine hvis du glemmer passordet ditt
account-recovery-notification-header-description = Opprett en kontogjenopprettingsnøkkel for å gjenopprette synkroniserte nettleserdata hvis du glemmer passordet ditt.
recovery-phone-promo-cta = Legg til gjenopprettingstelefon
recovery-phone-promo-heading = Legg til ekstra beskyttelse for kontoen din med en gjenopprettingstelefon
recovery-phone-promo-description = Nå kan du logge på med et engangspassord via SMS hvis du ikke kan bruke totrinnsautentiseringsappen din.
recovery-phone-promo-info-link = Les mer om gjenoppretting og SIM-swapping-risiko
promo-banner-dismiss-button =
    .aria-label = Avvis banner

## Ready component

ready-complete-set-up-instruction = Fullfør oppsettet ved å skrive inn det nye passordet ditt på de andre { -brand-firefox }-enhetene dine.
manage-your-account-button = Behandle kontoen din
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Du er nå klar til å bruke { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Du er nå klar til å bruke kontoinnstillingene
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Kontoen din er klar!
ready-continue = Fortsett
sign-in-complete-header = Innlogging bekreftet
sign-up-complete-header = Konto bekreftet
primary-email-verified-header = Primær e-postadresse bekreftet

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Steder å oppbevare nøkkelen din:
flow-recovery-key-download-storage-ideas-folder-v2 = Mappe på sikker enhet
flow-recovery-key-download-storage-ideas-cloud = Pålitelig skylagring
flow-recovery-key-download-storage-ideas-print-v2 = Utskreven fysisk kopi
flow-recovery-key-download-storage-ideas-pwd-manager = Passordbehandler

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Legg til et hint for å finne nøkkelen din
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Dette hintet skal hjelpe deg med å huske hvor du lagret kontogjenopprettingsnøkkelen din. Vi kan vise den til deg under tilbakestillingen av passordet for å gjenopprette dataene dine.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Skriv inn et hint (valgfritt)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Fullfør
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Hintet må inneholde færre enn 255 tegn.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Hintet kan ikke inneholde usikre unicode-tegn. Bare bokstaver, tall, tegnsettingstegn og symboler er tillatt.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Advarsel
password-reset-chevron-expanded = Skjul advarsel
password-reset-chevron-collapsed = Vis advarsel
password-reset-data-may-not-be-recovered = Nettleserdataene dine kan kanskje ikke gjenopprettes
password-reset-previously-signed-in-device-2 = Har du en enhet du tidligere har logget på?
password-reset-data-may-be-saved-locally-2 = Nettleserdataene dine kan være lagret på den enheten. Tilbakestill passordet ditt, og logg deretter inn der for å gjenopprette og synkronisere dataene dine.
password-reset-no-old-device-2 = Har du en ny enhet, men har ikke tilgang til noen av de gamle?
password-reset-encrypted-data-cannot-be-recovered-2 = Beklager, men de krypterte nettleserdataene dine på { -brand-firefox }-serverne kan ikke gjenopprettes.
password-reset-warning-have-key = Har du en kontogjenopprettingsnøkkel?
password-reset-warning-use-key-link = Bruk den nå for å tilbakestille passordet ditt og beholde dataene dine

## Alert Bar

alert-bar-close-message = Lukk melding

## User's avatar

avatar-your-avatar =
    .alt = Avataren din
avatar-default-avatar =
    .alt = Standardavatar

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla }-produkter
bento-menu-tagline = Flere produkter fra { -brand-mozilla } som beskytter personvernet ditt
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox }-nettleser for datamaskiner
bento-menu-firefox-mobile = { -brand-firefox }-nettleser for mobil
bento-menu-made-by-mozilla = Utviklet av { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Få { -brand-firefox } på mobil eller nettbrett
connect-another-find-fx-mobile-2 = Finn { -brand-firefox } i { -google-play } og { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Last ned { -brand-firefox } på { -google-play }
connect-another-app-store-image-3 =
    .alt = Last ned { -brand-firefox } på { -app-store }

## Connected services section

cs-heading = Tilknyttede tjenester
cs-description = Alt du bruker og er innlogget på.
cs-cannot-refresh = Beklager, det oppstod ett problem under oppdatering av listen over tilkoblede tjenester.
cs-cannot-disconnect = Klienten ble ikke funnet, kan ikke koble fra
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Logget ut av { $service }
cs-refresh-button =
    .title = Oppdater tilkoblede tjenester
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Manglende eller duplikatelement?
cs-disconnect-sync-heading = Koble fra Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Nettleserdataene dine vil forbli på <span>{ $device }</span>,
    men de vil ikke lenger synkroniseres med kontoen din.
cs-disconnect-sync-reason-3 = Hva er hovedårsaken for å koble fra <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Enheten er:
cs-disconnect-sync-opt-suspicious = Mistenkelig
cs-disconnect-sync-opt-lost = Mistet eller stjålet
cs-disconnect-sync-opt-old = Gammel eller erstattet
cs-disconnect-sync-opt-duplicate = Duplikat
cs-disconnect-sync-opt-not-say = Vil helst ikke fortelle

##

cs-disconnect-advice-confirm = Ok, jeg forstår
cs-disconnect-lost-advice-heading = Tapt eller stjålet enhet frakoblet
cs-disconnect-lost-advice-content-3 = Siden enheten din ble tapt eller stjålet, bør du endre passordet for { -product-mozilla-account } i kontoinnstillingene dine for å holde informasjonen din trygg. Du bør også se etter informasjon fra enhetsprodusenten om fjernsletting av dine data.
cs-disconnect-suspicious-advice-heading = Mistenkelig enhet frakoblet
cs-disconnect-suspicious-advice-content-2 = Hvis den frakoblede enheten virkelig er mistenkelig, bør du endre passordet for { -product-mozilla-account } i kontoinnstillingene dine for å holde informasjonen din trygg. Du bør også endre eventuelle andre passord du har lagret i { -brand-firefox } ved å skrive about:logins i adresselinjen.
cs-sign-out-button = Logg ut

## Data collection section

dc-heading = Datainnsamling og -bruk
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox }-nettleser
dc-subheader-content-2 = Tillate { -product-mozilla-accounts } å sende tekniske- og interaksjonsdata til { -brand-mozilla }?
dc-subheader-ff-content = For å se gjennom eller oppdatere tekniske data og interaksjonsdata-innstillinger i { -brand-firefox }-nettleseren, åpne innstillingene for { -brand-firefox } og naviger til Personvern og sikkerhet.
dc-opt-out-success-2 = Fravalget vellykket. { -product-mozilla-accounts } sender ikke tekniske data eller interaksjonsdata til { -brand-mozilla }.
dc-opt-in-success-2 = Takk! Deling av disse data hjelper oss med å forbedre { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Dessverre oppstod det et problem under endring av innstillingene for datainnsamling
dc-learn-more = Les mer

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account }-meny
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Logget inn som
drop-down-menu-sign-out = Logg ut
drop-down-menu-sign-out-error-2 = Beklager, det oppstod et problem med å logge deg av

## Flow Container

flow-container-back = Tilbake

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Skriv inn passordet ditt på nytt for å øke sikkerheten
flow-recovery-key-confirm-pwd-input-label = Skriv inn passordet ditt
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Opprett kontogjenopprettingsnøkkel
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Opprett en ny kontogjenopprettingsnøkkel

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Kontogjenopprettingsnøkkelen ble opprettet — Last ned og lagre den nå
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Denne nøkkelen lar deg gjenopprette dataene dine hvis du glemmer passordet ditt. Last den ned nå og oppbevar den et sted du husker — du vil ikke kunne gå tilbake til denne siden senere.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Fortsett uten å laste ned

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Kontogjenopprettingsnøkkel opprettet

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Opprett en kontogjenopprettingsnøkkel i tilfelle du glemmer passordet ditt
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Endre din kontogjenopprettingsnøkkel
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Vi krypterer nettleserdata –– passord, bokmerker og mer. Det er flott for personvernet, men du kan miste dataene dine hvis du glemmer passordet ditt.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Derfor er det så viktig å opprette en kontogjenopprettingsnøkkel –– du kan bruke den til å gjenopprette dataene dine.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Kom i gang
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Avbryt

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Koble til autentiseringsappen din
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Trinn 1:</strong> Skann denne QR-koden med en hvilken som helst autentiseringsapp, som Duo eller Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR-kode for å sette opp totrinns-autentisering. Skann den, eller velg «Kan ikke skanne QR-koden?» for å få en hemmelig nøkkel for oppsett i stedet.
flow-setup-2fa-cant-scan-qr-button = Kan du ikke skanne QR-koden?
flow-setup-2fa-manual-key-heading = Skriv inn kode manuelt
flow-setup-2fa-manual-key-instruction = <strong>Trinn 1:</strong> Skriv inn denne koden i din foretrukne autentiseringsapp.
flow-setup-2fa-scan-qr-instead-button = Skanne QR-kode i stedet?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Les mer om autentiseringsapper
flow-setup-2fa-button = Fortsett
flow-setup-2fa-step-2-instruction = <strong>Trinn 2:</strong> Skriv inn koden fra autentiseringsappen din.
flow-setup-2fa-input-label = Skriv inn 6-sifret kode
flow-setup-2fa-code-error = Ugyldig eller utløpt kode. Sjekk autentiseringsappen din og prøv på nytt.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Velg en gjenopprettingsmetode
flow-setup-2fa-backup-choice-description = Dette lar deg logge inn hvis du ikke har tilgang til mobilenheten eller autentiseringsappen din.
flow-setup-2fa-backup-choice-phone-title = Gjenopprettingstelefon
flow-setup-2fa-backup-choice-phone-badge = Enklest
flow-setup-2fa-backup-choice-phone-info = Få en gjenopprettingskode via tekstmelding. For øyeblikket tilgjengelig i USA og Canada.
flow-setup-2fa-backup-choice-code-title = Reserve-autentiseringskoder
flow-setup-2fa-backup-choice-code-badge = Tryggest
flow-setup-2fa-backup-choice-code-info = Opprett og lagre engangsautentiseringskoder.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Les mer om gjenoppretting og SIM-swapping-risiko

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Skriv inn reserve-autentiseringskode
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Bekreft at du har lagret kodene dine ved å skrive inn en. Uten disse kodene kan du kanskje ikke logge på hvis du ikke har autentiseringsappen din.
flow-setup-2fa-backup-code-confirm-code-input = Skriv inn kode på 10 tegn
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Fullfør

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Lagre reserve-autentiseringskoder
flow-setup-2fa-backup-code-dl-save-these-codes = Oppbevar disse på et sted du husker. Hvis du ikke har tilgang til autentiseringsappen din, må du oppgi en for å logge på.
flow-setup-2fa-backup-code-dl-button-continue = Fortsett

##

flow-setup-2fa-inline-complete-success-banner = Totrinns-autentisering aktivert
flow-setup-2fa-inline-complete-success-banner-description = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med den nye totrinnsautentiseringen din.
flow-setup-2fa-inline-complete-backup-code = Reserve-autentiseringskoder
flow-setup-2fa-inline-complete-backup-phone = Gjenopprettingstelefon
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } kode igjen
       *[other] { $count } koder igjen
    }
flow-setup-2fa-inline-complete-backup-code-description = Dette er den sikreste gjenopprettingsmetoden hvis du ikke kan logge på med mobilenheten eller autentiseringsappen din.
flow-setup-2fa-inline-complete-backup-phone-description = Dette er den enkleste gjenopprettingsmetoden hvis du ikke kan logge på med autentiseringsappen din.
flow-setup-2fa-inline-complete-learn-more-link = Slik beskytter dette kontoen din
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Fortsett til { $serviceName }
flow-setup-2fa-prompt-heading = Konfigurer totrinns-autentisering
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } krever at du konfigurerer totrinns-autentisering for å holde kontoen din trygg.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Du kan bruke hvilken som helst av <authenticationAppsLink>disse autentiseringsappene</authenticationAppsLink> for å fortsette.
flow-setup-2fa-prompt-continue-button = Fortsett

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Skriv inn bekreftelseskode
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = En 6-sifret kode ble sendt til <span>{ $phoneNumber }</span> via tekstmelding. Denne koden utløper etter 5 minutter.
flow-setup-phone-confirm-code-input-label = Skriv inn 6-sifret kode
flow-setup-phone-confirm-code-button = Bekreft
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Har koden utløpt?
flow-setup-phone-confirm-code-resend-code-button = Send koden på nytt
flow-setup-phone-confirm-code-resend-code-success = Kode sendt
flow-setup-phone-confirm-code-success-message-v2 = Gjenopprettingstelefon lagt til
flow-change-phone-confirm-code-success-message = Gjenopprettingstelefon endret

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Bekreft telefonnummeret ditt
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Du vil motta en tekstmelding fra { -brand-mozilla } med en kode for å bekrefte nummeret ditt. Ikke del denne koden med noen.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Gjenopprettingstelefon er bare tilgjengelig i USA og Canada. VoIP-numre og telefonalias anbefales ikke.
flow-setup-phone-submit-number-legal = Ved å oppgi nummeret ditt, samtykker du i at vi lagrer det slik at vi kun kan sende deg tekstmeldinger for kontoverifisering. Meldings- og datatakster kan gjelde.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Send kode

## HeaderLockup component, the header in account settings

header-menu-open = Lukk meny
header-menu-closed = Meny for nettstednavigering
header-back-to-top-link =
    .title = Tilbake til toppen
header-back-to-settings-link =
    .title = Tilbake til { -product-mozilla-account }-innstillinger
header-title-2 = { -product-mozilla-account }
header-help = Hjelp

## Linked Accounts section

la-heading = Tilknyttede kontoer
la-description = Du har autorisert tilgang til følgende kontoer.
la-unlink-button = Fjern tilknytning
la-unlink-account-button = Fjern tilknytning
la-set-password-button = Velg passord
la-unlink-heading = Fjern tilknyting til tredjepartskonto
la-unlink-content-3 = Er du sikker på at du vil fjerne tilknytningen til kontoen din? Det at du fjerner tilknytningen til kontoen din, logger deg ikke automatisk ut av de tilkoblede tjenestene dine. For å gjøre det må du logge deg ut manuelt fra seksjonen Tilkoblede tjenester.
la-unlink-content-4 = Før du fjerner tilknytningen til kontoen din, må du angi et passord. Uten et passord kan du ikke logge inn etter at du har fjernet tilknytningen til kontoen.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Lukk
modal-cancel-button = Avbryt
modal-default-confirm-button = Bekreft

## ModalMfaProtected

modal-mfa-protected-title = Skriv inn bekreftelseskode
modal-mfa-protected-subtitle = Hjelp oss å forsikre oss om at det er du som endrer kontoinformasjonen din
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Skriv inn koden som ble sendt til <email>{ $email }</email> innen { $expirationTime } minutt.
       *[other] Skriv inn koden som ble sendt til <email>{ $email }</email> innen { $expirationTime } minutter.
    }
modal-mfa-protected-input-label = Skriv inn 6-sifret kode
modal-mfa-protected-cancel-button = Avbryt
modal-mfa-protected-confirm-button = Bekreft
modal-mfa-protected-code-expired = Har koden utløpt?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Send ny kode på e-post.

## Modal Verify Session

mvs-verify-your-email-2 = Bekreft e-postadressen din
mvs-enter-verification-code-2 = Skriv inn bekreftelseskode
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Skriv inn bekreftelseskoden som ble sendt til <email>{ $email }</email> innen 5 minutter.
msv-cancel-button = Avbryt
msv-submit-button-2 = Bekreft

## Settings Nav

nav-settings = Innstillinger
nav-profile = Profil
nav-security = Sikkerhet
nav-connected-services = Tilknyttede tjenester
nav-data-collection = Datainnsamling og -bruk
nav-paid-subs = Betalte abonnement
nav-email-comm = E-postkommunikasjon

## Page2faChange

page-2fa-change-title = Endre totrinns-autentisering
page-2fa-change-success = Totrinns-autentisering er oppdatert
page-2fa-change-success-additional-message = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med den nye totrinnsautentiseringen din.
page-2fa-change-totpinfo-error = Det oppstod en feil ved bytte av totrinns-autentiseringsappen. Prøv igjen senere.
page-2fa-change-qr-instruction = <strong>Trinn 1:</strong> Skann denne QR-koden med en autentiseringsapp, for eksempel Duo eller Google Authenticator. Dette oppretter en ny tilkobling, og eventuelle gamle tilkoblinger vil ikke lenger fungere.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Reserve-autentiseringskoder
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Det oppstod et problem med å erstatte dine reserve-autentiseringskoder
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Det oppstod et problem med å opprette dine reserve-autentiseringskoder
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Reserve-autentiseringskoder oppdatert
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Reserve-autentiseringskoder opprettet
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Oppbevar disse på et sted du husker. De gamle kodene dine vil bli erstattet etter at du har fullført neste trinn.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Bekreft at du har lagret kodene dine ved å skrive inn en. De gamle reserve-autentiseringskodene dine vil bli deaktivert når dette trinnet er fullført.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Feil reserve-autentiseringskode

## Page2faSetup

page-2fa-setup-title = Totrinns-autentisering
page-2fa-setup-totpinfo-error = Det oppstod en feil under oppsett av totrinns-autentisering. Prøv på nytt senere.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Den koden er ikke riktig. Prøv på nytt.
page-2fa-setup-success = Totrinns-autentisering er aktivert
page-2fa-setup-success-additional-message = For å beskytte alle tilkoblede enheter bør du logge ut overalt hvor du bruker denne kontoen, og deretter logge på igjen med totrinnsautentisering.

## Avatar change page

avatar-page-title =
    .title = Profilbilde
avatar-page-add-photo = Legg til bilde
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
avatar-page-saving-button = Lagrer …
avatar-page-zoom-out-button =
    .title = Zoom ut
avatar-page-zoom-in-button =
    .title = Zoom inn
avatar-page-rotate-button =
    .title = Rotere
avatar-page-camera-error = Kunne ikke starte kameraet
avatar-page-new-avatar =
    .alt = nytt profilbilde
avatar-page-file-upload-error-3 = Det oppstod et problem med å laste opp profilbildet ditt.
avatar-page-delete-error-3 = Det oppstod et problem med å slette profilbildet ditt
avatar-page-image-too-large-error-2 = Bildefilen er for stor til å lastes opp

## Password change page

pw-change-header =
    .title = Endre passord
pw-8-chars = Minst 8 tegn
pw-not-email = Ikke e-postadressen din
pw-change-must-match = Nytt passord samsvarer med bekreftelsen
pw-commonly-used = Ikke et typisk brukt passord
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Vær trygg — Ikke bruk passord på nytt. Se flere tips for å <linkExternal>lage sterke passord</linkExternal>.
pw-change-cancel-button = Avbryt
pw-change-save-button = Lagre
pw-change-forgot-password-link = Glemt passord?
pw-change-current-password =
    .label = Skriv inn nåværende passord
pw-change-new-password =
    .label = Skriv inn nytt passord
pw-change-confirm-password =
    .label = Bekreft nytt passord
pw-change-success-alert-2 = Passordet er oppdatert

## Password create page

pw-create-header =
    .title = Opprett passord
pw-create-success-alert-2 = Passord satt
pw-create-error-2 = Beklager, det oppstod et problem med å angi passordet ditt

## Delete account page

delete-account-header =
    .title = Slett konto
delete-account-step-1-2 = Trinn 1 av 2
delete-account-step-2-2 = Trinn 2 av 2
delete-account-confirm-title-4 = Du kan ha koblet { -product-mozilla-account } til ett eller flere av følgende { -brand-mozilla }-produkter eller -tjenester som holder deg sikker og produktiv på nettet:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synkroniserer { -brand-firefox }-data
delete-account-product-firefox-addons = { -brand-firefox }-tillegg
delete-account-acknowledge = Bekreft at når du sletter kontoen din:
delete-account-chk-box-1-v4 =
    .label = Alle betalte abonnement du har vil bli sagt opp
delete-account-chk-box-2 =
    .label = Du kan miste lagret informasjon og funksjoner i { -brand-mozilla }-produkter
delete-account-chk-box-3 =
    .label = Gjenaktivering med denne e-postadressen vil kanskje ikke gjenopprette den lagrede informasjonen
delete-account-chk-box-4 =
    .label = Eventuelle utvidelser og temaer som du har publisert til addons.mozilla.org blir slettet
delete-account-continue-button = Fortsett
delete-account-password-input =
    .label = Skriv inn passord
delete-account-cancel-button = Avbryt
delete-account-delete-button-2 = Slett

## Display name page

display-name-page-title =
    .title = Visningsnavn
display-name-input =
    .label = Skriv inn visningsnavn
submit-display-name = Lagre
cancel-display-name = Avbryt
display-name-update-error-2 = Det oppstod et problem med å oppdatere visningsnavnet ditt.
display-name-success-alert-2 = Visningsnavn oppdatert

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nylig kontoaktivitet
recent-activity-account-create-v2 = Konto opprettet
recent-activity-account-disable-v2 = Konto deaktivert
recent-activity-account-enable-v2 = Konto aktivert
recent-activity-account-login-v2 = Kontoinnlogging startet
recent-activity-account-reset-v2 = Tilbakestilling av passord startet
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = E-postavvisinger fjernet
recent-activity-account-login-failure = Forsøk på kontoinnlogging mislyktes
recent-activity-account-two-factor-added = Totrinns-autentisering aktivert
recent-activity-account-two-factor-requested = Totrinns-autentisering forespurt
recent-activity-account-two-factor-failure = Totrinns-autentisering mislyktes
recent-activity-account-two-factor-success = Totrinns-autentisering vellykket
recent-activity-account-two-factor-removed = Totrinns-autentisering fjernet
recent-activity-account-password-reset-requested = Kontoen forespurte tilbakestilling av passord
recent-activity-account-password-reset-success = Tilbakestilling av kontopassordet var vellykket
recent-activity-account-recovery-key-added = Kontogjenopprettingsnøkkel aktivert
recent-activity-account-recovery-key-verification-failure = Bekreftelse av kontogjenopprettingsnøkkel mislyktes
recent-activity-account-recovery-key-verification-success = Bekreftelse av kontogjenopprettingsnøkkel var vellykket
recent-activity-account-recovery-key-removed = Gjenopprettingsnøkkel for konto fjernet
recent-activity-account-password-added = Nytt passord lagt til
recent-activity-account-password-changed = Passordet er endret
recent-activity-account-secondary-email-added = Sekundær e-postadresse lagt til
recent-activity-account-secondary-email-removed = Sekundær e-postadesse fjernet
recent-activity-account-emails-swapped = Primær og sekundær e-postadresse byttet om
recent-activity-session-destroy = Logget ut av økten
recent-activity-account-recovery-phone-send-code = Gjenopprettingstelefon-kode sendt
recent-activity-account-recovery-phone-setup-complete = Konfigurasjonen av gjenopprettingstelefon er fullført
recent-activity-account-recovery-phone-signin-complete = Innlogging med gjenopprettingstelefon fullført
recent-activity-account-recovery-phone-signin-failed = Innlogging med gjenopprettingstelefon mislyktes
recent-activity-account-recovery-phone-removed = Gjenopprettingstelefonen er fjernet
recent-activity-account-recovery-codes-replaced = Gjenopprettingskoder erstattet
recent-activity-account-recovery-codes-created = Gjenopprettingskoder opprettet
recent-activity-account-recovery-codes-signin-complete = Innlogging med gjenopprettingskoder fullført
recent-activity-password-reset-otp-sent = Bekreftelseskode for tilbakestilling av passord sendt
recent-activity-password-reset-otp-verified = Bekreftelseskode for tilbakestilling av passord bekreftet
recent-activity-must-reset-password = Tilbakestilling av passord kreves
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Annen kontoaktivitet

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Kontogjenopprettingsnøkkel
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Tilbake til innstillingene

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Fjern gjenopprettingstelefonnummeret
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Dette vil fjerne <strong>{ $formattedFullPhoneNumber }</strong> som gjenopprettingstelefonnummeret ditt.
settings-recovery-phone-remove-recommend = Vi anbefaler at du beholder denne metoden fordi den er enklere enn å lagre reserve-autentiseringskoder.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Hvis du sletter den, må du sørge for at du fortsatt har dine lagrede reserve-autentiseringskoder. <linkExternal>Sammenlign gjenopprettingsmetoder</linkExternal>
settings-recovery-phone-remove-button = Fjern telefonnummeret
settings-recovery-phone-remove-cancel = Avbryt
settings-recovery-phone-remove-success = Gjenopprettingstelefonen er fjernet

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Legg til gjenopprettingstelefon
page-change-recovery-phone = Endre gjenopprettingstelefon
page-setup-recovery-phone-back-button-title = Tilbake til innstillinger
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Endre telefonnummer

## Add secondary email page

add-secondary-email-step-1 = Trinn 1 av 2
add-secondary-email-error-2 = Det oppstod et problem med å opprette denne e-posten.
add-secondary-email-page-title =
    .title = Sekundær e-postadresse
add-secondary-email-enter-address =
    .label = Skriv inn e-postadresse
add-secondary-email-cancel-button = Avbryt
add-secondary-email-save-button = Lagre
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = E-postalias kan ikke brukes som en sekundær e-postadresse

## Verify secondary email page

add-secondary-email-step-2 = Trinn 2 av 2
verify-secondary-email-page-title =
    .title = Sekundær e-postadresse
verify-secondary-email-verification-code-2 =
    .label = Skriv inn bekreftelseskoden din
verify-secondary-email-cancel-button = Avbryt
verify-secondary-email-verify-button-2 = Bekreft
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Skriv inn bekreftelseskoden som ble sendt til <strong>{ $email }</strong> innen 5 minutter.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } lagt til
verify-secondary-email-resend-code-button = Send bekreftelseskoden på nytt

##

# Link to delete account on main Settings page
delete-account-link = Slett kontoen
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Innlogget. { -product-mozilla-account }-en og dataene dine vil forbli aktive.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Finn ut hvor din private informasjon er eksponert og ta kontroll
# Links out to the Monitor site
product-promo-monitor-cta = Få gratis skanning

## Profile section

profile-heading = Profil
profile-picture =
    .header = Bilde
profile-display-name =
    .header = Visningsnavn
profile-primary-email =
    .header = Primær e-post

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Trinn { $currentStep } av { $numberOfSteps }.

## Security section of Setting

security-heading = Sikkerhet
security-password =
    .header = Passord
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Opprettet den { $date }
security-not-set = Ikke angitt
security-action-create = Opprett
security-set-password = Angi et passord for å synkronisere og bruke visse sikkerhetsfunksjoner for kontoen.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Vis nylig kontoaktivitet
signout-sync-header = Økten har utløpt
signout-sync-session-expired = Beklager, noe gikk galt. Logg ut fra nettlesermenyen og prøv på nytt.

## SubRow component

tfa-row-backup-codes-title = Reserve-autentiseringskoder
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Ingen koder er tilgjengelige
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } kode igjen
       *[other] { $numCodesAvailable } koder igjen
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Opprett nye koder
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Legg til
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Dette er den sikreste gjenopprettingsmetoden hvis du ikke kan bruke mobilenheten eller autentiseringsappen din.
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
tfa-row-backup-phone-delete-title-v2 = Fjern gjenopprettingstelefonnummeret
tfa-row-backup-phone-delete-restriction-v2 = Hvis du vil fjerne gjenopprettingstelefonen din, må du legge til reserve-autentiseringskoder eller deaktivere totrinns-autentisering først for å unngå å bli låst ute av kontoen din.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Dette er den enkleste gjenopprettingsmetoden hvis du ikke kan bruke autentiseringsappen din.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Les mer om SIM-swapping-risiko

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
rk-enabled = Slått på
rk-not-set = Ikke angitt
rk-action-create = Opprett
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Endre
rk-action-remove = Fjern
rk-key-removed-2 = Kontogjenopprettingsnøkkelen er fjernet
rk-cannot-remove-key = Kunne ikke fjerne kontogjenopprettingsnøkkelen.
rk-refresh-key-1 = Oppdater kontogjenopprettingsnøkkelen
rk-content-explain = Gjenopprett informasjonen din når du glemmer passordet ditt.
rk-cannot-verify-session-4 = Beklager, det oppstod et problem med å bekrefte økten din
rk-remove-modal-heading-1 = Fjerne kontogjenopprettingsnøkkel?
rk-remove-modal-content-1 = Hvis du tilbakestiller passordet ditt, vil du ikke kunne bruke kontogjenopprettingsnøkkelen din til å få tilgang til dataene dine. Du kan ikke angre denne handlingen.
rk-remove-error-2 = Kunne ikke fjerne kontogjenopprettingsnøkkelen
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Slett kontogjenopprettingsnøkkelen

## Secondary email sub-section on main Settings page

se-heading = Sekundær e-postadresse
    .header = Sekundær e-postadresse
se-cannot-refresh-email = Dessverre oppstod det et problem med å oppdatere e-postadressen.
se-cannot-resend-code-3 = Beklager, det oppstod et problem med å sende bekreftelseskoden
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } er nå din primære e-postadresse
se-set-primary-error-2 = Beklager, det oppstod et problem med å endre den primære e-postadressen din.
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } er slettet
se-delete-email-error-2 = Beklager, det oppstod et problem med å slette denne e-postadressen.
se-verify-session-3 = Du må bekrefte din nåværende økt for å utføre denne handlingen.
se-verify-session-error-3 = Beklager, det oppstod et problem med å bekrefte økten din
# Button to remove the secondary email
se-remove-email =
    .title = Fjern e-postadresse
# Button to refresh secondary email status
se-refresh-email =
    .title = Oppdater e-postadresse
se-unverified-2 = ubekreftet
se-resend-code-2 = Bekreftelse kreves. <button>Send bekreftelseskoden på nytt</button> hvis den ikke er i innboksen eller spam-mappen din.
# Button to make secondary email the primary
se-make-primary = Gjør til primær
se-default-content = Få tilgang til kontoen din hvis du ikke kan logge inn med den primære e-postadressen din.
se-content-note-1 = Merk: En sekundær e-postadresse gjenoppretter ikke informasjonen din — du trenger en <a>kontogjenopprettingsnøkkel</a> for det.
# Default value for the secondary email
se-secondary-email-none = Ingen

## Two Step Auth sub-section on Settings main page

tfa-row-header = Totrinns-autentisering
tfa-row-enabled = Slått på
tfa-row-disabled-status = Slått av
tfa-row-action-add = Legg til
tfa-row-action-disable = Slå av
tfa-row-action-change = Endre
tfa-row-button-refresh =
    .title = Oppdater totrinns-autentisering
tfa-row-cannot-refresh = Dessverre oppstod det et problem med å oppdatere totrinns-autentisering.
tfa-row-enabled-description = Kontoen din er beskyttet av totrinns-autentisering. Du må oppgi en engangskode fra autentiseringsappen din når du logger deg på { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Slik beskytter dette kontoen din
tfa-row-disabled-description-v2 = Bidra til å sikre kontoen din ved å bruke en tredjeparts autentiseringsapp som et andre trinn for å logge inn.
tfa-row-cannot-verify-session-4 = Beklager, det oppstod et problem med å bekrefte økten din
tfa-row-disable-modal-heading = Slå av totrinns-autentisering
tfa-row-disable-modal-confirm = Slå av
tfa-row-disable-modal-explain-1 = Du kan ikke angre denne handlingen. Du har også muligheten til å <linkExternal>erstatte reserve-autentiseringskodene dine</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Totrinns-autentisering deaktivert
tfa-row-cannot-disable-2 = Totrinns-autentisering kunne ikke deaktiveres
tfa-row-verify-session-info = Du må bekrefte din nåværende økt for å konfigurere totrinns-autentisering

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Ved å fortsette godtar du:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = { -brand-mozilla } Abonnementstjenester <mozSubscriptionTosLink>bruksvilkår</mozSubscriptionTosLink> og <mozSubscriptionPrivacyLink>personvernerklæring</mozSubscriptionPrivacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = { -product-mozilla-accounts(capitalization: "uppercase") } <mozillaAccountsTos>bruksvilkår</mozillaAccountsTos> og <mozillaAccountsPrivacy>personvernerklæring</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Ved å fortsette godtar du <mozillaAccountsTos>bruksvilkårene</mozillaAccountsTos> og <mozillaAccountsPrivacy>personvernerklæringen</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = eller
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Logg inn med
continue-with-google-button = Fortsett med { -brand-google }
continue-with-apple-button = Fortsett med { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Ukjent konto
auth-error-103 = Feil passord
auth-error-105-2 = Ugyldig bekreftelseskode
auth-error-110 = Ugyldig token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Du har prøvd for mange ganger. Prøv igjen senere.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Du har prøvd for mange ganger. Prøv igjen { $retryAfter }.
auth-error-125 = Forespørselen ble blokkert av sikkerhetsmessige årsaker
auth-error-129-2 = Du skrev inn et ugyldig telefonnummer. Sjekk det og prøv på nytt.
auth-error-138-2 = Ubekreftet økt
auth-error-139 = Sekundær e-postadresse må være forskjellig fra e-postadressen til din konto
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Denne e-postadressen er reservert av en annen konto. Prøv igjen senere, eller bruk en annen e-postadresse.
auth-error-155 = TOTP-token ikke funnet
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Fant ikke reserve-autentiseringskode
auth-error-159 = Ugyldig kontogjenopprettingsnøkkel
auth-error-183-2 = Ugyldig eller utløpt bekreftelseskode
auth-error-202 = Funksjonen er ikke slått på
auth-error-203 = Systemet er utilgjengelig, prøv igjen senere
auth-error-206 = Kan ikke opprette passord, passordet er allerede angitt
auth-error-214 = Telefonnummeret for gjenoppretting finnes allerede
auth-error-215 = Telefonnummeret for gjenoppretting finnes ikke
auth-error-216 = Grensen for tekstmeldinger er nådd
auth-error-218 = Kan ikke fjerne gjenopprettingstelefonen, mangler reserve-autentiseringskoder.
auth-error-219 = Dette telefonnummeret er registrert med for mange kontoer. Prøv et annet nummer.
auth-error-999 = Uventet feil
auth-error-1001 = Innloggingsforsøk avbrutt
auth-error-1002 = Økt utløpt. Logg inn for å fortsette.
auth-error-1003 = Lokal lagring eller infokapsler er fortsatt slått av
auth-error-1008 = Ditt nye passord må være forskjellig
auth-error-1010 = Gyldig passord kreves
auth-error-1011 = Gyldig e-postadresse er nødvendig
auth-error-1018 = Bekreftelsesmeldingen kom i retur. Feilstavet e-postadresse?
auth-error-1020 = Feilstavet e-postadresse? firefox.com er ikke en gyldig e-posttjeneste
auth-error-1031 = Du må oppgi alder for å registrere deg
auth-error-1032 = Du må skrive inn en gyldig alder for å registrere deg
auth-error-1054 = Feil totrinns-autentiseringskode
auth-error-1056 = Ugyldig reserve-autentiseringskode
auth-error-1062 = Ugyldig omdirigering
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Feilstavet e-postadresse? { $domain } er ikke en gyldig e-posttjeneste
auth-error-1066 = E-postaliaser kan ikke brukes til å opprette en konto.
auth-error-1067 = Feilskreven e-postadresse?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Nummer som slutter på { $lastFourPhoneNumber }
oauth-error-1000 = Noe gikk galt. Lukk denne fanen og prøv på nytt.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Du er logget inn på { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-post bekreftet
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Innlogging bekreftet
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Logg inn på denne { -brand-firefox } for å fullføre oppsettet
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Logg inn
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Vil du fortsatt legge til enheter? Logg inn på { -brand-firefox } på en annen enhet for å fullføre oppsettet
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Logg inn på { -brand-firefox } på en annen enhet for å fullføre oppsettet.
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Vil du ha fanene, bokmerkene og passordene dine på en annen enhet?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Koble til en annen enhet
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ikke nå
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Logg inn på { -brand-firefox } for Android for å fullføre oppsettet.
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Logg inn på { -brand-firefox } for iOS for å fullføre oppsettet.

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Lokal lagring og infokapsler er påkrevd
cookies-disabled-enable-prompt-2 = Slå på infokapsler og lokal lagring i nettleseren din for å få tilgang til din { -product-mozilla-account }. Dette vil aktivere funksjonalitet som for eksempel å huske deg mellom økter.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Prøv igjen
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Les mer

## Index / home page

index-header = Skriv inn e-postadressen din
index-sync-header = Fortsett til din { -product-mozilla-account }
index-sync-subheader = Synkroniser passordene, fanene og bokmerkene dine overalt hvor du bruker { -brand-firefox }.
index-relay-header = Opprett et e-postalias
index-relay-subheader = Oppgi e-postadressen du vil videresende e-poster til fra den maskerte e-postadressen din.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Fortsett til { $serviceName }
index-subheader-default = Fortsett til kontoinnstillingene
index-cta = Registrer deg eller logg inn
index-account-info = En { -product-mozilla-account } gir også tilgang til flere personvernbeskyttende produkter fra { -brand-mozilla }.
index-email-input =
    .label = Skriv inn e-postadressen din
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Kontoen er nå slettet
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Bekreftelsesmeldingen kom i retur. Feilstavet e-postadresse?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Beklager! Vi kunne ikke opprette kontogjenopprettingsnøkkelen din. Prøv på nytt senere.
inline-recovery-key-setup-recovery-created = Kontogjenopprettingsnøkkel opprettet
inline-recovery-key-setup-download-header = Sikre kontoen din
inline-recovery-key-setup-download-subheader = Last ned og oppbevar den nå
inline-recovery-key-setup-download-info = Oppbevar denne nøkkelen et sted du husker — du vil ikke kunne komme tilbake til denne siden senere.
inline-recovery-key-setup-hint-header = Sikkerhetsanbefaling

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Avbryt oppsett
inline-totp-setup-continue-button = Fortsett
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Legg til et ekstra sikkerhetslag til kontoen din ved å kreve sikkerhetskoder fra en av <authenticationAppsLink>disse godkjenningsappene</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Aktiver totrinns-autentisering <span>for å fortsette til kontoinnstillingene</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Aktiver totrinns-autentisering <span>for å fortsette til { $serviceName }</span>
inline-totp-setup-ready-button = Klar
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Skann autentiseringskoden <span>for å fortsette til { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Skriv inn koden manuelt <span>for å fortsette til { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Skann autentiseringskoden <span>for å fortsette til kontoinnstillingene</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Skriv inn koden manuelt <span>for å fortsette til kontoinnstillingene</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Skriv inn denne hemmelige nøkkelen i autentiseringsappen din. <toggleToQRButton>Skanne QR-koden i stedet?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Skann QR-koden i autentiseringsappen din, og skriv deretter inn autentiseringskoden den oppgir. <toggleToManualModeButton>Kan ikke skanne koden?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Når det er ferdig, vil det begynne å generere autentiseringskoder som du må taste inn.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Autentiseringskode
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Autentiseringskode kreves
tfa-qr-code-alt = Bruk koden { $code } for å sette opp totrinns-autentisering i støttede apper.
inline-totp-setup-page-title = Totrinns-autentisering

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Juridisk
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Bruksvilkår
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Personvernerklæring

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Personvernerklæring

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Bruksvilkår

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Logget du akkurat inn på { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Ja, godkjenn enheten
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Hvis det ikke var deg, <link>endre passordet ditt</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Enhet tilkoblet
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Du synkroniserer nå med: { $deviceFamily } på { $deviceOS }
pair-auth-complete-sync-benefits-text = Nå kan du få tilgang til åpne faner, passord og bokmerker på alle enhetene dine.
pair-auth-complete-see-tabs-button = Se faner fra synkroniserte enheter
pair-auth-complete-manage-devices-link = Behandle enheter

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Skriv inn autentiseringskoden <span>for å fortsette til kontoinnstillingene</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Skriv inn autentiseringskoden <span>for å fortsette til { $serviceName }</span>
auth-totp-instruction = Åpne autentiseringsappen din og skriv inn autentiseringskoden den oppgir.
auth-totp-input-label = Skriv inn 6-sifret kode
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Bekreft
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Autentiseringskode kreves

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Godkjenning kreves nå <span>fra den andre enheten din</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Paring mislyktes
pair-failure-message = Installasjonsprosessen ble avsluttet.

## Pair index page

pair-sync-header = Synkroniser { -brand-firefox } på telefonen eller nettbrettet ditt
pair-cad-header = Koble til { -brand-firefox } på en annen enhet
pair-already-have-firefox-paragraph = Har du allerede { -brand-firefox } på en telefon eller et nettbrett?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synkroniser enheten din
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Eller last ned
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Skann for å laste ned { -brand-firefox } for mobil, eller send deg selv en <linkExternal>nedlastingslenke</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ikke nå
pair-take-your-data-message = Ta med deg faner, bokmerker og passord hvor enn du bruker { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Kom i gang
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-kode

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Enhet tilkoblet
pair-success-message-2 = Paring vellykket.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Bekreft paring <span>for { $email }</span>
pair-supp-allow-confirm-button = Bekreft paring
pair-supp-allow-cancel-link = Avbryt

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Godkjenning kreves nå <span>fra den andre enheten din</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Paring via en app
pair-unsupported-message = Brukte du systemkameraet? Du må koble til fra en { -brand-firefox }-app.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Opprett passord for å synkronisere
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Dette krypterer dataene dine. Det må være forskjellig fra passordet til { -brand-google }- eller { -brand-apple }-kontoen din.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Vent litt, du blir omdirigert til det autoriserte programmet.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Skriv inn kontogjenopprettingsnøkkelen din
account-recovery-confirm-key-instruction = Denne nøkkelen gjenoppretter krypterte nettleserdata, for eksempel passord og bokmerker, fra { -brand-firefox }-servere.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Skriv inn kontogjenopprettingsnøkkelen din på 32 tegn
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Oppbevaringshintet ditt er:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Fortsett
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Finner du ikke kontogjenopprettingsnøkkelen din?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Opprett et nytt passord
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Passord angitt
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Beklager, det oppstod et problem med å angi passordet ditt
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Bruk kontogjenopprettingsnøkkel
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Passordet ditt har blitt tilbakestilt.
reset-password-complete-banner-message = Ikke glem å generere en ny kontogjenopprettingsnøkkel fra innstillingene dine for { -product-mozilla-account } for å forhindre fremtidige innloggingsproblemer.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Skriv inn kode på 10 tegn
confirm-backup-code-reset-password-confirm-button = Bekreft
confirm-backup-code-reset-password-subheader = Skriv inn reserve-autentiseringskode
confirm-backup-code-reset-password-instruction = Skriv inn en av engangskodene du lagret da du konfigurerte totrinns-autentisering.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Er du utestengt?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Sjekk e-posten din
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Vi sendte en bekreftelseskode til <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Skriv inn 8-sifret kode innen 10 minutter
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Fortsett
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Send koden på nytt
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Bruk en annen konto

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Tilbakestill passordet ditt
confirm-totp-reset-password-subheader-v2 = Skriv inn totrinns-autentiseringskode
confirm-totp-reset-password-instruction-v2 = Sjekk <strong>autentiseringsappen</strong> din for å tilbakestille passordet ditt.
confirm-totp-reset-password-trouble-code = Har du problemer med å oppgi kode?
confirm-totp-reset-password-confirm-button = Bekreft
confirm-totp-reset-password-input-label-v2 = Skriv inn 6-sifret kode
confirm-totp-reset-password-use-different-account = Bruk en annen konto

## ResetPassword start page

password-reset-flow-heading = Tilbakestill passordet ditt
password-reset-body-2 =
    Vi ber om et par ting som bare du vet for å holde kontoen din
    trygg.
password-reset-email-input =
    .label = Skriv inn e-postadressen din
password-reset-submit-button-2 = Fortsett

## ResetPasswordConfirmed

reset-password-complete-header = Passordet ditt er tilbakestilt
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Fortsett til { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Tilbakestill passord
password-reset-recovery-method-subheader = Velg en gjenopprettingsmetode
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = La oss forsikre oss om at det er du som bruker gjenopprettingsmetodene dine.
password-reset-recovery-method-phone = Gjenopprettingstelefon
password-reset-recovery-method-code = Reserve-autentiseringskoder
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kode igjen
       *[other] { $numBackupCodes } koder igjen
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Det oppstod et problem da en kode skulle sendes til gjenopprettingstelefonen din
password-reset-recovery-method-send-code-error-description = Prøv igjen senere, eller bruk reserve-autentiseringskodene dine.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Tilbakestill passord
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Oppgi gjenopprettingskode
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = En 6-sifret kode ble sendt til telefonnummeret som slutter på <span>{ $lastFourPhoneDigits }</span> via tekstmelding. Denne koden utløper etter 5 minutter. Ikke del denne koden med noen.
reset-password-recovery-phone-input-label = Skriv inn 6-sifret kode
reset-password-recovery-phone-code-submit-button = Bekreft
reset-password-recovery-phone-resend-code-button = Send koden på nytt
reset-password-recovery-phone-resend-success = Kode sendt
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Er du utestengt?
reset-password-recovery-phone-send-code-error-heading = Det oppstod et problem med å sende en kode
reset-password-recovery-phone-code-verification-error-heading = Det oppstod et problem med å bekrefte koden din.
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Prøv igjen senere.
reset-password-recovery-phone-invalid-code-error-description = Koden er ugyldig eller utløpt.
reset-password-recovery-phone-invalid-code-error-link = Bruk reserve-autentiseringskoder i stedet?
reset-password-with-recovery-key-verified-page-title = Passordet er tilbakestilt
reset-password-complete-new-password-saved = Nytt passord lagret!
reset-password-complete-recovery-key-created = Ny kontogjenopprettingsnøkkel er opprettet. Last ned og oppbevar den nå.
reset-password-complete-recovery-key-download-info =
    Denne nøkkelen er viktig for
    datagjenoppretting hvis du glemmer passordet ditt. <b>Last ned og lagre den sikkert
    nå, da du ikke vil kunne få tilgang til denne siden igjen senere.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Feil:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Validerer innlogging …
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Bekreftelsesfeil
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Bekreftelseslenken er utløpt
signin-link-expired-message-2 = Lenken du klikket på er utløpt eller har allerede blitt brukt.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Skriv inn passordet ditt <span>for { -product-mozilla-account } din</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Fortsett til { $serviceName }
signin-subheader-without-logo-default = Fortsett til kontoinnstillingene
signin-button = Logg inn
signin-header = Logg inn
signin-use-a-different-account-link = Bruk en annen konto
signin-forgot-password-link = Glemt passord?
signin-password-button-label = Passord
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.
signin-code-expired-error = Koden er utløpt. Logg inn på nytt.
signin-account-locked-banner-heading = Tilbakestill passord
signin-account-locked-banner-description = Vi låste kontoen din for å beskytte den mot mistenkelig aktivitet.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Tilbakestill passordet ditt for å logge inn

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Lenken du klikket på mangler noen tegn, og kan ha blitt forandret av e-postklienten. Sjekk at du kopierte riktig, og prøv igjen.
report-signin-header = Rapporter uautorisert innlogging?
report-signin-body = Du har fått e-post om forsøk på å få tilgang til kontoen din. Vil du rapportere denne aktiviteten som mistenkelig?
report-signin-submit-button = Rapporter aktivitet
report-signin-support-link = Hvorfor skjer dette?
report-signin-error = Beklager, det oppstod et problem under innsending av rapporten.
signin-bounced-header = Beklager. Vi har låst kontoen din.
# $email (string) - The user's email.
signin-bounced-message = Bekreftelsesmeldingen vi sendte til { $email } ble returnert, og vi har låst kontoen din for å beskytte dataene dine i { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Om dette er en gyldig e-postadresse, <linkExternal>la oss få vite det</linkExternal> slik at vi kan hjelpe deg med å låse opp kontoen din.
signin-bounced-create-new-account = Har du ikke lenger denne e-postadressen? Lag en ny konto
back = Tilbake

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Bekreft denne innloggingen <span>for å fortsette til kontoinnstillingene</span>
signin-push-code-heading-w-custom-service = Bekreft denne innloggingen <span>for å fortsette til { $serviceName }</span>
signin-push-code-instruction = Sjekk de andre enhetene dine og godkjenn denne påloggingen fra { -brand-firefox }-nettleseren din.
signin-push-code-did-not-recieve = Har du ikke mottatt varselet?
signin-push-code-send-email-link = E-postkode

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Bekreft innloggingen din
signin-push-code-confirm-description = Vi oppdaget et påloggingsforsøk fra følgende enhet. Hvis dette var deg, godkjenn påloggingen.
signin-push-code-confirm-verifying = Kontrollerer
signin-push-code-confirm-login = Bekreft innlogging
signin-push-code-confirm-wasnt-me = Det var ikke meg, endre passordet.
signin-push-code-confirm-login-approved = Påloggingen din er godkjent. Lukk dette vinduet.
signin-push-code-confirm-link-error = Lenken er skadet. Prøv på nytt.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Logg inn
signin-recovery-method-subheader = Velg en gjenopprettingsmetode
signin-recovery-method-details = La oss forsikre oss om at det er du som bruker gjenopprettingsmetodene dine.
signin-recovery-method-phone = Gjenopprettingstelefon
signin-recovery-method-code-v2 = Reserve-autentiseringskoder
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } kode igjen
       *[other] { $numBackupCodes } koder igjen
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Det oppstod et problem da en kode skulle sendes til gjenopprettingstelefonen din
signin-recovery-method-send-code-error-description = Prøv igjen senere, eller bruk reserve-autentiseringskodene dine.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Logg inn
signin-recovery-code-sub-heading = Skriv inn reserve-autentiseringskode
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Skriv inn en av engangskodene du lagret da du konfigurerte totrinns-autentisering.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Skriv inn kode på 10 tegn
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Bekreft
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Bruk gjenopprettingstelefonnummer
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Er du utestengt?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Reserve-autentiseringskode påkrevd
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Det oppstod et problem da en kode skulle sendes til gjenopprettingstelefonen din
signin-recovery-code-use-phone-failure-description = Prøv igjen senere.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Logg inn
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Oppgi gjenopprettingskode
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = En 6-sifret kode ble sendt til telefonnummeret som slutter på <span>{ $lastFourPhoneDigits }</span> via tekstmelding. Denne koden utløper etter 5 minutter. Ikke del denne koden med noen.
signin-recovery-phone-input-label = Skriv inn 6-sifret kode
signin-recovery-phone-code-submit-button = Bekreft
signin-recovery-phone-resend-code-button = Send koden på nytt
signin-recovery-phone-resend-success = Kode sendt
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Er du utestengt?
signin-recovery-phone-send-code-error-heading = Det oppstod et problem med å sende en kode
signin-recovery-phone-code-verification-error-heading = Det oppstod et problem med å bekrefte koden din.
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Prøv igjen senere.
signin-recovery-phone-invalid-code-error-description = Koden er ugyldig eller utløpt.
signin-recovery-phone-invalid-code-error-link = Bruk reserve-autentiseringskoder i stedet?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Logget inn. Begrensninger kan gjelde hvis du bruker gjenopprettingstelefonen din igjen.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Takk for din årvåkenhet
signin-reported-message = Teamet vårt er varslet. Rapporter som denne hjelper oss med å avverge inntrengere.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Skriv inn bekreftelseskoden<span> for { -product-mozilla-account }en din</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Skriv inn koden som ble sendt til <email>{ $email }</email> innen 5 minutter.
signin-token-code-input-label-v2 = Skriv inn 6-sifret kode
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Bekreft
signin-token-code-code-expired = Har koden utløpt?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Send ny kode på e-post.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Bekreftelseskode kreves
signin-token-code-resend-error = Noe gikk galt. En ny kode kunne ikke sendes.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Logg inn
signin-totp-code-subheader-v2 = Skriv inn totrinns-autentiseringskode
signin-totp-code-instruction-v4 = Sjekk <strong>autentiseringsappen</strong> din for å bekrefte innloggingen din.
signin-totp-code-input-label-v4 = Skriv inn 6-sifret kode
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Hvorfor blir du bedt om å autentisere deg?
signin-totp-code-aal-banner-content = Du har konfigurert totrinnsautentisering på kontoen din, men har ikke logget på med en kode på denne enheten ennå.
signin-totp-code-aal-sign-out = Logg ut på denne enheten
signin-totp-code-aal-sign-out-error = Beklager, det oppstod et problem med å logge deg av
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Bekreft
signin-totp-code-other-account-link = Bruk en annen konto
signin-totp-code-recovery-code-link = Har du problemer med å oppgi kode?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Autentiseringskode kreves
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Godkjenn denne innloggingen
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Sjekk e-posten din for å se om du har fått autorisasjonskoden sendt til { $email }.
signin-unblock-code-input = Skriv inn godkjenningskode
signin-unblock-submit-button = Fortsett
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Godkjenningskode kreves
signin-unblock-code-incorrect-length = Autorisasjonskoden må inneholde 8 tegn
signin-unblock-code-incorrect-format-2 = Autorisasjonskoden kan bare inneholde bokstaver og/eller tall
signin-unblock-resend-code-button = Ikke i innboks eller mappen for uønsket e-post (spam)? Send på nytt
signin-unblock-support-link = Hvorfor skjer dette?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Skriv inn bekreftelseskode
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Skriv inn bekreftelseskoden <span>for { -product-mozilla-account }en din</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Skriv inn koden som ble sendt til <email>{ $email }</email> innen 5 minutter.
confirm-signup-code-input-label = Skriv inn 6-sifret kode
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Bekreft
confirm-signup-code-sync-button = Start synkronisering
confirm-signup-code-code-expired = Har koden utløpt?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Send ny kode på e-post.
confirm-signup-code-success-alert = Konto bekreftet
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Bekreftelseskode kreves
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } vil prøve å sende deg tilbake til å bruke et e-postalias etter at du har logget inn.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Opprett et passord
signup-relay-info = Et passord er nødvendig for å administrere e-postalias på en sikker måte og få tilgang til sikkerhetsverktøyene til { -brand-mozilla }.
signup-sync-info = Synkroniser passordene, bokmerkene og mer overalt hvor du bruker { -brand-firefox }.
signup-sync-info-with-payment = Synkroniser passordene, betalingsmåter, bokmerkene og mer overalt hvor du bruker { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Endre e-postadresse

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synkronisering er slått på
signup-confirmed-sync-success-banner = { -product-mozilla-account } bekreftet
signup-confirmed-sync-button = Begynn å surfe
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Passordene dine, betalingsmåtene, adressene, bokmerkene, historikken din og mer kan synkroniseres overalt hvor du bruker { -brand-firefox }.
signup-confirmed-sync-description-v2 = Passordene, adressene, bokmerkene, historikken og mer kan synkroniseres overalt hvor du bruker { -brand-firefox }.
signup-confirmed-sync-add-device-link = Legg til en annen enhet
signup-confirmed-sync-manage-sync-button = Behandle synkronisering
signup-confirmed-sync-set-password-success-banner = Synkroniseringspassord opprettet
