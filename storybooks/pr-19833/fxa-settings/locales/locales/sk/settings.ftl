# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Na váš e‑mail bol odoslaný nový kód.
resend-link-success-banner-heading = Na váš e‑mail bol odoslaný nový odkaz.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Pridajte si do svojich kontaktov adresu { $accountsEmail }. Zabezpečíte tým bezproblémové doručenie.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Zavrieť oznámenie
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } sa 1. novembra premenujú na { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Naďalej sa budete prihlasovať pomocou rovnakého používateľského mena a hesla a v produktoch, ktoré používate, nenastanú žiadne ďalšie zmeny.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = { -product-firefox-accounts } sme premenovali na { -product-mozilla-accounts }. Naďalej sa budete prihlasovať pomocou rovnakého používateľského mena a hesla a v produktoch, ktoré používate, nenastanú žiadne ďalšie zmeny.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Ďalšie informácie
# Alt text for close banner image
brand-close-banner =
    .alt = Zavrieť oznámenie
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo { -brand-mozilla } m

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Naspäť
button-back-title = Naspäť

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Stiahnuť a pokračovať
    .title = Stiahnuť a pokračovať
recovery-key-pdf-heading = Kľúč na obnovenie účtu
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Vygenerovaný: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Kľúč na obnovenie účtu
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Tento kľúč vám umožňuje obnoviť zašifrované údaje prehliadača (vrátane hesiel, záložiek a histórie), ak zabudnete heslo. Uložte ho na mieste, ktoré si zapamätáte.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Miesta na uloženie kľúča
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Ďalšie informácie o kľúči na obnovenie účtu
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Ľutujeme, pri sťahovaní kľúča na obnovenie účtu sa vyskytol problém.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Získajte viac od { -brand-mozilla(case: "gen") }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Získajte naše najnovšie správy a aktualizácie produktov
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Prístup k ranému testovaniu nových produktov
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Výzvy na opätovné získanie internetu

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Stiahnuté
datablock-copy =
    .message = Skopírovaný
datablock-print =
    .message = Vytlačený

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Kód skopírovaný
        [few] Kódy skopírované
        [many] Kódy skopírované
       *[other] Kódy skopírované
    }
datablock-download-success =
    { $count ->
        [one] Kód stiahnutý
        [few] Kódy stiahnuté
        [many] Kódy stiahnuté
       *[other] Kódy stiahnuté
    }
datablock-print-success =
    { $count ->
        [one] Kód vytlačený
        [few] Kódy vytlačené
        [many] Kódy vytlačené
       *[other] Kódy vytlačené
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Skopírovaný

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (odhadnuté)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (odhadnuté)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (odhadnuté)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (odhadnuté)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Neznáma poloha
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } na { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP adresa: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Heslo
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Zopakujte heslo
form-password-with-inline-criteria-signup-submit-button = Vytvoriť účet
form-password-with-inline-criteria-reset-new-password =
    .label = Nové heslo
form-password-with-inline-criteria-confirm-password =
    .label = Potvrďte heslo
form-password-with-inline-criteria-reset-submit-button = Vytvoriť nové heslo
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Heslo
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Zopakujte heslo
form-password-with-inline-criteria-set-password-submit-button = Spustiť synchronizáciu
form-password-with-inline-criteria-match-error = Heslá sa nezhodujú
form-password-with-inline-criteria-sr-too-short-message = Heslo musí obsahovať aspoň 8 znakov.
form-password-with-inline-criteria-sr-not-email-message = Heslo nesmie obsahovať vašu e‑mailovú adresu.
form-password-with-inline-criteria-sr-not-common-message = Heslo nesmie byť bežne používané heslo.
form-password-with-inline-criteria-sr-requirements-met = Zadané heslo rešpektuje všetky požiadavky na heslo.
form-password-with-inline-criteria-sr-passwords-match = Zadané heslá sa zhodujú.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Toto pole je povinné

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Ak chcete pokračovať, zadajte { $codeLength }-miestny číselný kód
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Ak chcete pokračovať, zadajte { $codeLength }-miestny kód

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Kľúč na obnovenie účtu { -brand-firefox }
get-data-trio-title-backup-verification-codes = Záložné overovacie kódy
get-data-trio-download-2 =
    .title = Stiahnuť
    .aria-label = Stiahnuť
get-data-trio-copy-2 =
    .title = Kopírovať
    .aria-label = Kopírovať
get-data-trio-print-2 =
    .title = Tlačiť
    .aria-label = Tlačiť

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Upozornenie
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Pozor
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Upozornenie
authenticator-app-aria-label =
    .aria-label = Overovacia aplikácia
backup-codes-icon-aria-label-v2 =
    .aria-label = Záložné overovacie kódy sú povolené
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Záložné overovacie kódy sú vypnuté
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = SMS na obnovenie sú povolené
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = SMS na obnovenie sú vypnuté
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadská vlajka
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Znak označenia
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Úspech
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Povolené
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Zavrieť správu
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kód
error-icon-aria-label =
    .aria-label = Chyba
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informácia
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Vlajka Spojených štátov amerických

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Počítač a mobilný telefón a na každom obrázok zlomeného srdca
hearts-verified-image-aria-label =
    .aria-label = Počítač, mobilný telefón a tablet a na každom pulzujúce srdiečko
signin-recovery-code-image-description =
    .aria-label = Dokument, ktorý obsahuje skrytý text.
signin-totp-code-image-label =
    .aria-label = Zariadenie so skrytým šesťmiestnym kódom.
confirm-signup-aria-label =
    .aria-label = Obálka s odkazom
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Obrázok predstavujúci kľúč na obnovenie účtu.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Obrázok predstavujúci kľúč na obnovenie účtu.
password-image-aria-label =
    .aria-label = Ilustrácia znázorňujúca zadávanie hesla.
lightbulb-aria-label =
    .aria-label = Ilustrácia znázorňujúca vytváranie tipu na uloženie.
email-code-image-aria-label =
    .aria-label = Ilustrácia znázorňujúca e‑mail obsahujúci kód.
recovery-phone-image-description =
    .aria-label = Mobilné zariadenie, ktoré prijíma kód prostredníctvom textovej správy.
recovery-phone-code-image-description =
    .aria-label = Kód prijatý na mobilné zariadenie.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilné zariadenie s možnosťou textových správ SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Obrazovka zariadenia s kódmi
sync-clouds-image-aria-label =
    .aria-label = Oblaky s ikonou synchronizácie
confetti-falling-image-aria-label =
    .aria-label = Animované padajúce konfety

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Ste prihlásený/-á do { -brand-firefox(case: "gen") }.
inline-recovery-key-setup-create-header = Zabezpečte svoj účet
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Máte minútu na ochránenie svojich údajov?
inline-recovery-key-setup-info = Vytvorte si kľúč na obnovenie účtu, aby ste si mohli obnoviť synchronizované údaje prehliadania, ak niekedy zabudnete svoje heslo.
inline-recovery-key-setup-start-button = Vytvoriť kľúč na obnovenie účtu
inline-recovery-key-setup-later-button = Urobím to neskôr

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Skryť heslo
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Zobraziť heslo
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Vaše heslo je momentálne viditeľné na obrazovke.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Vaše heslo je momentálne skryté.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Vaše heslo je teraz viditeľné na obrazovke.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Vaše heslo je teraz skryté.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Zvoľte krajinu
input-phone-number-enter-number = Zadajte telefónne číslo
input-phone-number-country-united-states = Spojené štáty americké
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Naspäť

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Odkaz na zmenu hesla je poškodený
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Potvrdzovací odkaz je poškodený
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Odkaz je poškodený
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Odkaz, na ktorý ste klikli, neobsahuje všetky potrebné znaky. Je možné, že nebol korektne spracovaný vašim e‑mailovým klientom. Skopírujte adresu do prehliadača a skúste to znova.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Získať nový odkaz

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Pamätáte si svoje heslo?
# link navigates to the sign in page
remember-password-signin-link = Prihlásiť sa

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Hlavná e‑mailová adresa už bola overená
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Prihlásenie je už potvrdené
confirmation-link-reused-message = Tento potvrdzovací odkaz bol už použitý (dá sa použiť len raz).

## Locale Toggle Component

locale-toggle-select-label = Zvoľte jazyk
locale-toggle-browser-default = Predvolený jazyk prehliadača
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Nesprávna požiadavka

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Toto heslo potrebujete na prístup ku všetkým zašifrovaným údajom, ktoré u nás ukladáte.
password-info-balloon-reset-risk-info = Zmena hesla môže znamenať stratu údajov, ako sú heslá a záložky.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Zvoľte si silné heslo, ktoré ste ešte nepoužívali na iných stránkach. Uistite sa, že spĺňa bezpečnostné požiadavky:
password-strength-short-instruction = Zvoľte si silné heslo:
password-strength-inline-min-length = Minimálne 8 znakov
password-strength-inline-not-email = Nie je to vaša e‑mailová adresa
password-strength-inline-not-common = Nie je to bežne používané heslo
password-strength-inline-confirmed-must-match = Potvrdenie sa zhoduje s novým heslom
password-strength-inline-passwords-match = Heslá sa zhodujú

## Notification Promo Banner component

account-recovery-notification-cta = Vytvoriť
account-recovery-notification-header-value = Ak zabudnete heslo, neprídete o svoje údaje
account-recovery-notification-header-description = Vytvorte si kľúč na obnovenie účtu na obnovenie synchronizovaných údajov prehliadania, ak niekedy zabudnete svoje heslo.
recovery-phone-promo-cta = Pridajte obnovenie pomocou telefónu
recovery-phone-promo-heading = Pridajte svojmu účtu dodatočnú ochranu vďaka obnoveniu pomocou telefónu
recovery-phone-promo-description = Ak nemôžete použiť aplikáciu na dvojstupňové overenie, teraz sa môžete prihlásiť jednorazovým heslom zaslaným prostredníctvom SMS.
recovery-phone-promo-info-link = Ďalšie informácie o obnovení a rizikách pri výmene SIM karty
promo-banner-dismiss-button =
    .aria-label = Zavrieť banner

## Ready component

ready-complete-set-up-instruction = Dokončite nastavenie zadaním nového hesla na ostatných zariadeniach s { -brand-firefox(case: "ins") }.
manage-your-account-button = Spravovať účet
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Odteraz môžete využívať službu { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Teraz ste pripravení použiť nastavenia účtu
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Váš účet je pripravený.
ready-continue = Pokračovať
sign-in-complete-header = Prihlásenie potvrdené
sign-up-complete-header = Účet bol potvrdený
primary-email-verified-header = Hlavná e‑mailová adresa bola potvrdená

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Miesta na uloženie kľúča:
flow-recovery-key-download-storage-ideas-folder-v2 = Priečinok na zabezpečenom zariadení
flow-recovery-key-download-storage-ideas-cloud = Dôveryhodné cloudové úložisko
flow-recovery-key-download-storage-ideas-print-v2 = Vytlačená fyzická kópia
flow-recovery-key-download-storage-ideas-pwd-manager = Správca hesiel

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Pridajte si pomôcku, ktorá vám pomôže nájsť kľúč
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Táto pomôcka by vám mala pomôcť zapamätať si, kde ste uložili kľúč na obnovenie účtu. Zobrazíme vám ju počas procesu zmeny hesla a vašich údajov.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Zadajte pomôcku (voliteľné)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Dokončiť
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Pomôcka musí obsahovať menej ako 255 znakov.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Pomôcka nemôže obsahovať nebezpečné znaky Unicode. Povolené sú iba písmená, čísla, interpunkčné znamienka a symboly.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Upozornenie
password-reset-chevron-expanded = Zbaliť upozornenie
password-reset-chevron-collapsed = Rozbaliť upozornenie
password-reset-data-may-not-be-recovered = Údaje vášho prehliadača nemusia byť obnovené
password-reset-previously-signed-in-device-2 = Máte nejaké zariadenie, na ktorom ste sa predtým prihlásili?
password-reset-data-may-be-saved-locally-2 = Údaje vášho prehliadača môžu byť uložené v danom zariadení. Zmeňte svoje heslo a potom sa prihláste, aby ste obnovili a synchronizovali svoje údaje.
password-reset-no-old-device-2 = Máte nové zariadenie, ale nemáte prístup k žiadnemu zo svojich predchádzajúcich?
password-reset-encrypted-data-cannot-be-recovered-2 = Je nám ľúto, ale vaše šifrované údaje prehliadača na serveroch { -brand-firefox(case: "gen") } nie je možné obnoviť.
password-reset-warning-have-key = Máte kľúč na obnovenie účtu?
password-reset-warning-use-key-link = Použite ho teraz na zmenu hesla a uchovanie údajov

## Alert Bar

alert-bar-close-message = Zavrieť správu

## User's avatar

avatar-your-avatar =
    .alt = Váš avatar
avatar-default-avatar =
    .alt = Predvolený avatar

##


# BentoMenu component

bento-menu-title-3 = Produkty { -brand-mozilla }
bento-menu-tagline = Ďalšie produkty od { -brand-mozilla(case: "gen") }, ktoré chránia vaše súkromie
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Prehliadač { -brand-firefox } pre počítač
bento-menu-firefox-mobile = Prehliadač { -brand-firefox } pre mobilné zariadenia
bento-menu-made-by-mozilla = Od spoločnosti { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Získajte { -brand-firefox } pre mobilné zariadenia
connect-another-find-fx-mobile-2 = Nájdite { -brand-firefox } v { -google-play } a { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Stiahnite si { -brand-firefox } na { -google-play }
connect-another-app-store-image-3 =
    .alt = Stiahnite si { -brand-firefox } z { -app-store }

## Connected services section

cs-heading = Pripojené služby
cs-description = Všetko, čo používate a k čomu ste sa prihlásili.
cs-cannot-refresh =
    Ľutujeme, pri obnovení zoznamu pripojených služieb sa vyskytol
    problém.
cs-cannot-disconnect = Klient sa nenašiel, nedá sa odpojiť
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Odhlásené zo služby { $service }
cs-refresh-button =
    .title = Obnoviť pripojené služby
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Chýbajúce alebo duplicitné položky?
cs-disconnect-sync-heading = Odpojiť zo služby Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = Údaje vášho prehliadania zostanú aj naďalej na zariadení <span>{ $device }</span>, ale nebudú sa synchronizovať s vaším účtom.
cs-disconnect-sync-reason-3 = Aký je hlavný dôvod odpojenia zariadenia <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Zariadenie je:
cs-disconnect-sync-opt-suspicious = podozrivé
cs-disconnect-sync-opt-lost = stratené alebo ukradnuté
cs-disconnect-sync-opt-old = staré alebo nahradené
cs-disconnect-sync-opt-duplicate = duplicitné
cs-disconnect-sync-opt-not-say = neželám si odpovedať

##

cs-disconnect-advice-confirm = Ok, rozumiem
cs-disconnect-lost-advice-heading = Stratené alebo odcudzené zariadenie bolo odpojené
cs-disconnect-lost-advice-content-3 = Keďže vaše zariadenie bolo stratené alebo odcudzené, mali by ste si v nastaveniach účtu zmeniť heslo pre { -product-mozilla-account(case: "acc", capitalization: "lower") }, aby ste udržali svoje informácie v bezpečí. Mali by ste tiež vyhľadať informácie od výrobcu zariadenia o vzdialenom vymazaní údajov.
cs-disconnect-suspicious-advice-heading = Podozrivé zariadenie je odpojené
cs-disconnect-suspicious-advice-content-2 = Ak je odpojené zariadenie skutočne podozrivé, mali by ste si v nastaveniach účtu zmeniť heslo pre { -product-mozilla-account(case: "acc", capitalization: "lower") }, aby boli vaše informácie v bezpečí. Mali by ste tiež zmeniť všetky ostatné heslá, ktoré ste uložili v prehliadači { -brand-firefox }, zadaním about:logins do panela s adresou.
cs-sign-out-button = Odhlásiť sa

## Data collection section

dc-heading = Zhromažďovanie a používanie údajov
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Prehliadač { -brand-firefox }
dc-subheader-content-2 = Povoliť { -product-mozilla-accounts(capitalization: "lower", case: "dat") } odosielať technické údaje a údaje o interakciách spoločnosti { -brand-mozilla }.
dc-subheader-ff-content = Ak chcete skontrolovať alebo aktualizovať nastavenia prehliadača { -brand-firefox } týkajúce sa údajov, otvorte nastavenia prehliadača { -brand-firefox } a prejdite na Súkromie a bezpečnosť.
dc-opt-out-success-2 = Odhlásenie bolo úspešné. { -product-mozilla-accounts } nebudú posielať technické údaje ani údaje o interakciách spoločnosti { -brand-mozilla }.
dc-opt-in-success-2 = Vďaka! Zdieľanie týchto údajov nám pomáha zlepšovať { -product-mozilla-accounts(capitalization: "lower", case: "acc") }.
dc-opt-in-out-error-2 = Ľutujeme, pri zmene predvoľby zhromažďovania údajov sa vyskytol problém
dc-learn-more = Ďalšie informácie

# DropDownAvatarMenu component

drop-down-menu-title-2 = Ponuka { -product-mozilla-account(case: "gen", capitalization: "lower") }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Prihlásený ako
drop-down-menu-sign-out = Odhlásiť sa
drop-down-menu-sign-out-error-2 = Ľutujeme, vyskytol sa problém s odhlásením

## Flow Container

flow-container-back = Naspäť

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Kvôli bezpečnosti znova zadajte svoje heslo
flow-recovery-key-confirm-pwd-input-label = Zadajte svoje heslo
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Vytvoriť kľúč na obnovenie účtu
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Vytvoriť nový kľúč na obnovenie účtu

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Kľúč na obnovenie účtu bol vytvorený – stiahnite si ho a uložte
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Tento kľúč vám umožňuje obnoviť údaje, ak zabudnete heslo. Stiahnite si ho a uložte na miesto, ktoré si zapamätáte – neskôr sa na túto stránku už nebudete môcť vrátiť.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Pokračovať bez stiahnutia

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Kľúč na obnovenie účtu bol vytvorený

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Vytvorte si kľúč na obnovenie účtu pre prípad, že zabudnete heslo
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Zmeňte si kľúč na obnovenie účtu
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Šifrujeme údaje prehliadania – heslá, záložky a ďalšie. Je to skvelé pre súkromie, ale ak zabudnete heslo, môžete prísť o svoje údaje.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Preto je vytvorenie kľúča na obnovenie účtu také dôležité – môžete ho použiť na obnovenie údajov.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Začíname
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Zrušiť

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Pripojte sa k svojej overovacej aplikácii
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocou ľubovoľnej overovacej aplikácie, ako je Duo alebo Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR kód na nastavenie dvojstupňového overenia. Naskenujte ho alebo vyberte možnosť „Nedá sa naskenovať QR kód?“ a namiesto toho získajte tajný kľúč nastavenia.
flow-setup-2fa-cant-scan-qr-button = Nedá sa naskenovať QR kód?
flow-setup-2fa-manual-key-heading = Zadajte kód ručne
flow-setup-2fa-manual-key-instruction = <strong>Krok 1:</strong> Zadajte tento kód do svojej preferovanej overovacej aplikácie.
flow-setup-2fa-scan-qr-instead-button = Chcete radšej naskenovať QR kód?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Ďalšie informácie o overovacích aplikáciách
flow-setup-2fa-button = Pokračovať
flow-setup-2fa-step-2-instruction = <strong>Krok 2:</strong> Zadajte kód z overovacej aplikácie.
flow-setup-2fa-input-label = Zadajte šesťmiestny kód
flow-setup-2fa-code-error = Neplatný alebo vypršaný kód. Skontrolujte si overovaciu aplikáciu a skúste to znova.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Vyberte spôsob obnovy
flow-setup-2fa-backup-choice-description = To vám umožní prihlásiť sa, ak nemáte prístup k mobilnému zariadeniu alebo overovacej aplikácii.
flow-setup-2fa-backup-choice-phone-title = Obnovenie pomocou telefónu
flow-setup-2fa-backup-choice-phone-badge = Najjednoduchšie
flow-setup-2fa-backup-choice-phone-info = Získajte kód na obnovenie prostredníctvom textovej správy. Momentálne k dispozícii v USA a Kanade.
flow-setup-2fa-backup-choice-code-title = Záložné overovacie kódy
flow-setup-2fa-backup-choice-code-badge = Najbezpečnejšie
flow-setup-2fa-backup-choice-code-info = Vytvorte a uložte si jednorazové overovacie kódy.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Informácie o obnovení a rizikách pri výmene SIM karty

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Zadajte záložný overovací kód
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Zadaním kódu potvrďte, že ste kódy uložili. Bez týchto kódov sa možno nebudete môcť prihlásiť, ak nemáte aplikáciu na overenie totožnosti.
flow-setup-2fa-backup-code-confirm-code-input = Zadajte 10‑miestny kód
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Dokončiť

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Uložte si záložné overovacie kódy
flow-setup-2fa-backup-code-dl-save-these-codes = Uschovajte si ich na mieste, na ktoré si nezabudnete. Ak nemáte prístup k aplikácii na overenie totožnosti, budete jeden z nich musieť zadať pri prihlásení.
flow-setup-2fa-backup-code-dl-button-continue = Pokračovať

##

flow-setup-2fa-inline-complete-success-banner = Dvojstupňové overenie bolo povolené
flow-setup-2fa-inline-complete-success-banner-description = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou nového dvojstupňového overenia.
flow-setup-2fa-inline-complete-backup-code = Záložné overovacie kódy
flow-setup-2fa-inline-complete-backup-phone = Obnovenie pomocou telefónu
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } zostávajúci kód
        [few] { $count } zostávajúce kódy
        [many] { $count } zostávajúcich kódov
       *[other] { $count } zostávajúcich kódov
    }
flow-setup-2fa-inline-complete-backup-code-description = Toto je najbezpečnejšia metóda obnovenia, ak sa nemôžete prihlásiť pomocou mobilného zariadenia alebo overovacej aplikácie.
flow-setup-2fa-inline-complete-backup-phone-description = Toto je najjednoduchšia metóda obnovenia, ak sa nemôžete prihlásiť pomocou aplikácie na overenie totožnosti.
flow-setup-2fa-inline-complete-learn-more-link = Ako to chráni váš účet
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = A pokračovať do služby { $serviceName }
flow-setup-2fa-prompt-heading = Nastavenie dvojstupňového overenia
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } vyžaduje nastavenie dvojstupňového overenia, aby bol váš účet v bezpečí.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Na pokračovanie môžete použiť ktorúkoľvek z <authenticationAppsLink>týchto overovacích aplikácií</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Pokračovať

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Zadajte overovací kód
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Na číslo <span>{ $phoneNumber }</span> bol prostredníctvom textovej správy odoslaný šesťmiestny kód. Platnosť tohto kódu vyprší po 5 minútach.
flow-setup-phone-confirm-code-input-label = Zadajte šesťmiestny kód
flow-setup-phone-confirm-code-button = Potvrdiť
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Platnosť kódu vypršala?
flow-setup-phone-confirm-code-resend-code-button = Znova odoslať kód
flow-setup-phone-confirm-code-resend-code-success = Kód bol odoslaný
flow-setup-phone-confirm-code-success-message-v2 = Obnovenie pomocou telefónu bolo pridané
flow-change-phone-confirm-code-success-message = Obnovenie pomocou telefónu bolo zmenené

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Overte svoje telefónne číslo
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Dostanete textovú správy od { -brand-mozilla(case: "gen") } s kódom na overenie vášho čísla. S nikým tento kód nezdieľajte.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Obnovenie pomocou telefónu je k dispozícii iba v Spojených štátoch a Kanade. VoIP čísla a telefónne masky sa neodporúčajú.
flow-setup-phone-submit-number-legal = Poskytnutím svojho čísla súhlasíte s jeho uložením, aby sme vám mohli posielať textové správy na overenie účtu. Môžu sa účtovať poplatky za správy a dáta.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Odoslať kód

## HeaderLockup component, the header in account settings

header-menu-open = Zavrieť ponuku
header-menu-closed = Navigačná ponuka stránok
header-back-to-top-link =
    .title = Návrat hore
header-back-to-settings-link =
    .title = Späť na nastavenia { -product-mozilla-account(case: "gen", capitalization: "lower") }
header-title-2 = { -product-mozilla-account }
header-help = Pomocník

## Linked Accounts section

la-heading = Prepojené účty
la-description = Máte autorizovaný prístup k nasledujúcim účtom.
la-unlink-button = Zrušiť prepojenie
la-unlink-account-button = Zrušiť prepojenie
la-set-password-button = Nastaviť heslo
la-unlink-heading = Zrušenie prepojenia s účtom tretej strany
la-unlink-content-3 = Naozaj chcete odpojiť svoj účet? Odpojením vášho účtu sa automaticky neodhlásite z pripojených služieb. Ak to chcete urobiť, budete sa musieť manuálne odhlásiť v sekcii Pripojené služby.
la-unlink-content-4 = Pred odpojením účtu musíte nastaviť heslo. Bez hesla sa po odpojení účtu nemôžete prihlásiť.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Zavrieť
modal-cancel-button = Zrušiť
modal-default-confirm-button = Potvrdiť

## ModalMfaProtected

modal-mfa-protected-title = Zadajte potvrdzovací kód
modal-mfa-protected-subtitle = Pomôžte nám uistiť sa, že ste to vy, kto mení informácie o vašom účte
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] V priebehu { $expirationTime } minúty zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
        [few] V priebehu { $expirationTime } minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
        [many] V priebehu { $expirationTime } minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
       *[other] V priebehu { $expirationTime } minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
    }
modal-mfa-protected-input-label = Zadajte šesťmiestny kód
modal-mfa-protected-cancel-button = Zrušiť
modal-mfa-protected-confirm-button = Potvrdiť
modal-mfa-protected-code-expired = Platnosť kódu vypršala?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Odoslať e‑mailom nový kód.

## Modal Verify Session

mvs-verify-your-email-2 = Potvrďte vašu e‑mailovú adresu
mvs-enter-verification-code-2 = Zadajte svoj potvrdzovací kód
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = V priebehu 5 minút zadajte potvrdzovací kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
msv-cancel-button = Zrušiť
msv-submit-button-2 = Potvrdiť

## Settings Nav

nav-settings = Nastavenia
nav-profile = Profil
nav-security = Bezpečnosť
nav-connected-services = Pripojené služby
nav-data-collection = Zhromažďovanie a používanie údajov
nav-paid-subs = Predplatné
nav-email-comm = E‑mailová komunikácia

## Page2faChange

page-2fa-change-title = Zmena dvojstupňového overenia
page-2fa-change-success = Dvojstupňové overenie bolo aktualizované
page-2fa-change-success-additional-message = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou nového dvojstupňového overenia.
page-2fa-change-totpinfo-error = Pri zmene aplikácie na dvojstupňové overenie sa vyskytla chyba. Skúste to znova neskôr.
page-2fa-change-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocou ľubovoľnej overovacej aplikácie, ako je Duo alebo Google Authenticator. Týmto sa vytvorí nové pripojenie, všetky staré pripojenia už nebudú fungovať.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Záložné overovacie kódy
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Pri výmene záložných overovacích kódov sa vyskytol problém
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Pri vytváraní záložných overovacích kódov sa vyskytol problém
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Záložné overovacie kódy boli aktualizované
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Záložné overovacie kódy boli vytvorené
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Uschovajte si ich na mieste, ktoré si zapamätáte. Vaše staré kódy budú nahradené po dokončení ďalšieho kroku.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Potvrďte uloženie kódov zadaním jedného z nich. Vaše staré záložné overovacie kódy budú po dokončení tohto kroku deaktivované.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Nesprávny záložný overovací kód

## Page2faSetup

page-2fa-setup-title = Dvojstupňové overenie
page-2fa-setup-totpinfo-error = Pri nastavovaní dvojstupňového overenia sa vyskytla chyba. Skúste to znova neskôr.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Tento kód nie je správny. Skúste to znova.
page-2fa-setup-success = Dvojstupňové overenie bolo povolené
page-2fa-setup-success-additional-message = Ak chcete chrániť všetky pripojené zariadenia, mali by ste sa odhlásiť všade, kde používate tento účet, a potom sa znova prihlásiť pomocou dvojstupňového overenia.

## Avatar change page

avatar-page-title =
    .title = Profilová fotografia
avatar-page-add-photo = Nahrať fotografiu
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Urobiť fotografiu
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Odstrániť fotografiu
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Znovu urobiť fotografiu
avatar-page-cancel-button = Zrušiť
avatar-page-save-button = Uložiť
avatar-page-saving-button = Ukladá sa…
avatar-page-zoom-out-button =
    .title = Oddialiť
avatar-page-zoom-in-button =
    .title = Priblížiť
avatar-page-rotate-button =
    .title = Otočiť
avatar-page-camera-error = Nepodarilo sa aktivovať fotoaparát
avatar-page-new-avatar =
    .alt = nová profilová fotografia
avatar-page-file-upload-error-3 = Pri nahrávaní profilovej fotografie sa vyskytol problém
avatar-page-delete-error-3 = Pri odstraňovaní vašej profilovej fotky sa vyskytol problém
avatar-page-image-too-large-error-2 = Nie je možné nahrať obrázok, pretože je príliš veľký

## Password change page

pw-change-header =
    .title = Zmena hesla
pw-8-chars = Minimálne 8 znakov
pw-not-email = Nepoužívajte vašu e‑mailovú adresu
pw-change-must-match = nové heslo sa musí zhodovať s potvrdzujúcim
pw-commonly-used = Nezadávajte bežne používané heslo
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Zostaňte v bezpečí – nepoužívajte heslá znova. Pozrite si ďalšie tipy na <linkExternal>vytvorenie silných hesiel</linkExternal>.
pw-change-cancel-button = Zrušiť
pw-change-save-button = Uložiť
pw-change-forgot-password-link = Zabudli ste heslo?
pw-change-current-password =
    .label = Zadajte súčasné heslo
pw-change-new-password =
    .label = Zadajte nové heslo
pw-change-confirm-password =
    .label = Potvrďte nové heslo
pw-change-success-alert-2 = Heslo bolo aktualizované

## Password create page

pw-create-header =
    .title = Vytvorenie hesla
pw-create-success-alert-2 = Heslo bolo nastavené
pw-create-error-2 = Ľutujeme, pri nastavovaní hesla sa vyskytol problém

## Delete account page

delete-account-header =
    .title = Odstrániť účet
delete-account-step-1-2 = Krok 1 z 2
delete-account-step-2-2 = Krok 2 z 2
delete-account-confirm-title-4 = Možno ste svoj { -product-mozilla-account(case: "acc", capitalization: "lower") } pripojili k jednému alebo viacerým z nasledujúcich produktov alebo služieb od { -brand-mozilla(case: "gen") }, ktoré vám zabezpečujú bezpečnosť a produktivitu na webe:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronizujú sa údaje { -brand-firefox(case: "gen") }
delete-account-product-firefox-addons = Doplnky pre { -brand-firefox }
delete-account-acknowledge = Potvrďte, že odstránením svojho účtu:
delete-account-chk-box-1-v4 =
    .label = Všetky platené predplatné, ktoré máte, budú zrušené
delete-account-chk-box-2 =
    .label = môžete prísť o uložené informácie a niektoré funkcie produktov { -brand-mozilla(case: "gen") }
delete-account-chk-box-3 =
    .label = opätovná aktivácia pomocou tejto e‑mailovej adresy nemusí obnoviť vaše uložené informácie
delete-account-chk-box-4 =
    .label = všetky rozšírenia a témy vzhľadu, ktoré ste zverejnili na addons.mozilla.org, budú odstránené
delete-account-continue-button = Pokračovať
delete-account-password-input =
    .label = Zadajte heslo
delete-account-cancel-button = Zrušiť
delete-account-delete-button-2 = Odstrániť

## Display name page

display-name-page-title =
    .title = Zobrazované meno
display-name-input =
    .label = Zadajte zobrazované meno
submit-display-name = Uložiť
cancel-display-name = Zrušiť
display-name-update-error-2 = Pri aktualizácii vášho zobrazovaného mena sa vyskytol problém
display-name-success-alert-2 = Zobrazované meno aktualizované

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nedávna aktivita účtu
recent-activity-account-create-v2 = Účet bol vytvorený
recent-activity-account-disable-v2 = Účet bol deaktivovaný
recent-activity-account-enable-v2 = Účet je povolený
recent-activity-account-login-v2 = Bolo spustené prihlásenie pomocou účtu
recent-activity-account-reset-v2 = Bol spustený proces zmeny hesla
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = E‑maily o nedoručení vymazané
recent-activity-account-login-failure = Pokus o prihlásenie do účtu zlyhal
recent-activity-account-two-factor-added = Dvojstupňové overenie bolo povolené
recent-activity-account-two-factor-requested = Vyžaduje sa dvojstupňové overenie
recent-activity-account-two-factor-failure = Dvojstupňové overenie zlyhalo
recent-activity-account-two-factor-success = Dvojstupňové overenie bolo úspešné
recent-activity-account-two-factor-removed = Dvojstupňové overenie bolo odstránené
recent-activity-account-password-reset-requested = Účet si vyžiadal zmenu hesla
recent-activity-account-password-reset-success = Zmena hesla účtu bola úspešná
recent-activity-account-recovery-key-added = Kľúč na obnovenie účtu je povolený
recent-activity-account-recovery-key-verification-failure = Overenie kľúča na obnovenie účtu zlyhalo
recent-activity-account-recovery-key-verification-success = Overenie kľúča na obnovenie účtu bolo úspešné
recent-activity-account-recovery-key-removed = Kľúč na obnovenie účtu bol odstránený
recent-activity-account-password-added = Bolo pridané nové heslo
recent-activity-account-password-changed = Heslo bolo zmenené
recent-activity-account-secondary-email-added = Bola pridaná alternatívna e‑mailová adresa
recent-activity-account-secondary-email-removed = Alternatívna e‑mailová adresa bola odstránená
recent-activity-account-emails-swapped = Hlavná a alternatívna e‑mailová adresa boli vzájomne vymenené
recent-activity-session-destroy = Odhlásený z relácie
recent-activity-account-recovery-phone-send-code = Kód na obnovenie bol odoslaný na telefónne číslo
recent-activity-account-recovery-phone-setup-complete = Obnovenie pomocou telefónu bolo nastavené
recent-activity-account-recovery-phone-signin-complete = Prihlásenie pomocou telefónu na obnovenie bolo dokončené
recent-activity-account-recovery-phone-signin-failed = Prihlásenie pomocou telefónu na obnovenie zlyhalo
recent-activity-account-recovery-phone-removed = Obnovenie pomocou telefónu bolo zrušené
recent-activity-account-recovery-codes-replaced = Obnovovacie kódy boli vymenené
recent-activity-account-recovery-codes-created = Boli vytvorené obnovovacie kódy
recent-activity-account-recovery-codes-signin-complete = Prihláste sa pomocou obnovovacích kódov
recent-activity-password-reset-otp-sent = Potvrdzovací kód pre zmenu hesla bol odoslaný
recent-activity-password-reset-otp-verified = Potvrdzovací kód pre zmenu hesla bol overený
recent-activity-must-reset-password = Vyžaduje sa zmena hesla
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Iná aktivita účtu

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Kľúč na obnovenie účtu
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Späť na nastavenia

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Odstránenie možnosti obnovy pomocou telefónu
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Týmto odstránite číslo <strong>{ $formattedFullPhoneNumber }</strong> ako telefónne číslo na obnovenie účtu.
settings-recovery-phone-remove-recommend = Odporúčame vám ponechať si túto metódu, pretože je jednoduchšia ako ukladanie záložných overovacích kódov.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Ak ho vymažete, uistite sa, že máte stále uložené záložné overovacie kódy. <linkExternal>Porovnať metódy obnovenia</linkExternal>
settings-recovery-phone-remove-button = Odstrániť telefónne číslo
settings-recovery-phone-remove-cancel = Zrušiť
settings-recovery-phone-remove-success = Obnovenie pomocou telefónu bolo zrušené

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Pridajte obnovenie pomocou telefónu
page-change-recovery-phone = Zmeniť telefón na obnovenie účtu
page-setup-recovery-phone-back-button-title = Späť na nastavenia
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Zmeniť telefónne číslo

## Add secondary email page

add-secondary-email-step-1 = Krok 1 z 2
add-secondary-email-error-2 = Pri vytváraní tohto e‑mailu sa vyskytol problém
add-secondary-email-page-title =
    .title = Alternatívna e‑mailová adresa
add-secondary-email-enter-address =
    .label = Zadajte e‑mailovú adresu
add-secondary-email-cancel-button = Zrušiť
add-secondary-email-save-button = Uložiť
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = E‑mailové masky nie je možné použiť ako alternatívny e‑mail.

## Verify secondary email page

add-secondary-email-step-2 = Krok 2 z 2
verify-secondary-email-page-title =
    .title = Alternatívna e‑mailová adresa
verify-secondary-email-verification-code-2 =
    .label = Zadajte svoj potvrdzovací kód
verify-secondary-email-cancel-button = Zrušiť
verify-secondary-email-verify-button-2 = Potvrdiť
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Do 5 minút zadajte potvrdzovací kód, ktorý bol odoslaný na e‑mailovú adresu <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Adresa { $email } bola úspešne pridaná
verify-secondary-email-resend-code-button = Znovu odoslať potvrdzovací kód

##

# Link to delete account on main Settings page
delete-account-link = Odstrániť účet
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Úspešne ste sa prihlásili. Váš { -product-mozilla-account(capitalization: "lower") } a údaje zostanú aktívne.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Zistite, kde sú vaše súkromné informácie zverejnené, a prevezmite nad nimi kontrolu
# Links out to the Monitor site
product-promo-monitor-cta = Skontrolovať

## Profile section

profile-heading = Profil
profile-picture =
    .header = Obrázok
profile-display-name =
    .header = Zobrazované meno
profile-primary-email =
    .header = Hlavná e‑mailová adresa

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Krok { $currentStep } z { $numberOfSteps }.

## Security section of Setting

security-heading = Bezpečnosť
security-password =
    .header = Heslo
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Vytvorené { $date }
security-not-set = Nie je nastavené
security-action-create = Vytvoriť
security-set-password = Nastavte si heslo na synchronizáciu a používanie určitých funkcií zabezpečenia účtu.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Zobraziť nedávnu aktivitu účtu
signout-sync-header = Relácia vypršala
signout-sync-session-expired = Prepáčte, niečo sa pokazilo. Odhláste sa v ponuke prehliadača a skúste to znova.

## SubRow component

tfa-row-backup-codes-title = Záložné overovacie kódy
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Nie sú k dispozícii žiadne kódy
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Zostáva { $numCodesAvailable } kód
        [few] Zostávajú { $numCodesAvailable } kódy
        [many] Zostáva { $numCodesAvailable } kódov
       *[other] Zostáva { $numCodesAvailable } kódov
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Vytvoriť nové kódy
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Pridať
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Toto je najbezpečnejšia metóda obnovy, ak nemôžete použiť svoje mobilné zariadenie alebo aplikáciu na overovanie.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Obnovenie pomocou telefónu
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nebolo pridané žiadne telefónne číslo
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Zmeniť
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Pridať
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Odstrániť
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Odstráni možnosť obnovy pomocou telefónu
tfa-row-backup-phone-delete-restriction-v2 = Ak chcete odstrániť možnosť obnovy pomocou telefónu, pridajte záložné overovacie kódy alebo najskôr zakážte dvojstupňové overenie, aby ste sa vyhli zablokovaniu vášho účtu.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Toto je najjednoduchší spôsob obnovenia, ak nemôžete použiť aplikáciu na overenie totožnosti.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Prečítajte si o riziku pri výmene SIM karty

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Vypnúť
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Zapnúť
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Odosiela sa…
switch-is-on = zapnuté
switch-is-off = vypnuté

## Sub-section row Defaults

row-defaults-action-add = Pridať
row-defaults-action-change = Zmeniť
row-defaults-action-disable = Vypnúť
row-defaults-status = Žiadne

## Account recovery key sub-section on main Settings page

rk-header-1 = Kľúč na obnovenie účtu
rk-enabled = Povolený
rk-not-set = Nie je nastavený
rk-action-create = Vytvoriť
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Zmeniť
rk-action-remove = Odstrániť
rk-key-removed-2 = Obnovovací kľúč k účtu bol odstránený
rk-cannot-remove-key = Kľúč na obnovenie účtu nebolo možné odstrániť.
rk-refresh-key-1 = Obnoviť kľúč na obnovenie účtu
rk-content-explain = Získajte prístup k svojim údajom v prípade, že zabudnete heslo.
rk-cannot-verify-session-4 = Ľutujeme, pri potvrdení vašej relácie sa vyskytol problém
rk-remove-modal-heading-1 = Chcete odstrániť kľúč na obnovenie účtu?
rk-remove-modal-content-1 =
    V prípade, že si zmeníte heslo, nebudete už môcť
    použiť kľúč na obnovenie účtu na prístup k vašim údajom.
    Túto akciu nie je možné vrátiť späť.
rk-remove-error-2 = Kľúč na obnovenie účtu nebolo možné odstrániť
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Odstrániť kľúč na obnovenie účtu

## Secondary email sub-section on main Settings page

se-heading = Alternatívna e‑mailová adresa
    .header = Alternatívna e‑mailová adresa
se-cannot-refresh-email = Ľutujeme, ale pri obnovení tohto e‑mailu sa vyskytol problém.
se-cannot-resend-code-3 = Ľutujeme, pri opätovnom odosielaní potvrdzovacieho kódu sa vyskytol problém
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = Adresa { $email } je teraz vašou hlavnou e‑mailovou adresou
se-set-primary-error-2 = Ľutujeme, ale pri zmene vašej hlavnej e‑mailovej adresy sa vyskytol problém
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Adresa { $email } bola úspešne odstránená
se-delete-email-error-2 = Ľutujeme, ale pri odstraňovaní tejto e‑mailovej adresy sa vyskytol problém
se-verify-session-3 = Ak chcete vykonať túto akciu, budete musieť potvrdiť svoju aktuálnu reláciu
se-verify-session-error-3 = Ľutujeme, pri potvrdení vašej relácie sa vyskytol problém
# Button to remove the secondary email
se-remove-email =
    .title = Odstrániť e‑mailovú adresu
# Button to refresh secondary email status
se-refresh-email =
    .title = Obnoviť e‑mailovú adresu
se-unverified-2 = nepotvrdený
se-resend-code-2 =
    Vyžaduje sa potvrdenie. <button>Opäť si pošlite potvrdzovací kód</button>,
    ak sa tento nenachádza vo vašej doručenej pošte alebo priečinku so spamom.
# Button to make secondary email the primary
se-make-primary = Nastaviť ako hlavnú adresu
se-default-content = Získajte prístup k svojmu účtu, ak sa vám nepodarí prihlásiť pomocou svojej hlavnej e‑mailovej adresy.
se-content-note-1 = Poznámka: alternatívna e‑mailová adresa neumožní obnoviť vaše informácie – na to budete potrebovať <a>kľúč na obnovenie účtu</a>.
# Default value for the secondary email
se-secondary-email-none = žiadna

## Two Step Auth sub-section on Settings main page

tfa-row-header = Dvojstupňové overenie
tfa-row-enabled = Povolené
tfa-row-disabled-status = Zakázané
tfa-row-action-add = Pridať
tfa-row-action-disable = Zakázať
tfa-row-action-change = Zmeniť
tfa-row-button-refresh =
    .title = Obnoviť dvojstupňové overenie
tfa-row-cannot-refresh = Je nám ľúto, ale pri obnovovaní dvojstupňového overenia sa vyskytol problém.
tfa-row-enabled-description = Váš účet je chránený dvojstupňovou autentifikáciou. Pri prihlasovaní do svojho { -product-mozilla-account(case: "gen", capitalization: "lower") } budete musieť zadať jednorazový prístupový kód z overovacej aplikácie.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Ako toto chráni váš účet
tfa-row-disabled-description-v2 = Pomôžte zabezpečiť svoj účet pomocou aplikácie na overenie totožnosti tretej strany ako druhého kroku prihlásenia.
tfa-row-cannot-verify-session-4 = Ľutujeme, pri potvrdení vašej relácie sa vyskytol problém
tfa-row-disable-modal-heading = Zakázať dvojstupňové overenie?
tfa-row-disable-modal-confirm = Zakázať
tfa-row-disable-modal-explain-1 =
    Túto akciu nebudete môcť vrátiť späť. Máte tiež
    možnosť <linkExternal>nahradiť svoje záložné overovacie kódy</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Dvojstupňové overenie bolo zakázané
tfa-row-cannot-disable-2 = Dvojstupňové overenie sa nepodarilo zakázať
tfa-row-verify-session-info = Na nastavenie dvojstupňového overenia musíte potvrdiť svoju aktuálnu reláciu.

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Pokračovaním súhlasíte s:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Podmienky používania služby</mozSubscriptionTosLink> a <mozSubscriptionPrivacyLink>Vyhlásenie o ochrane osobných údajov</mozSubscriptionPrivacyLink> pre Služby predplatného { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Podmienky používania služby</mozillaAccountsTos> a <mozillaAccountsPrivacy>Vyhlásenie o ochrane osobných údajov</mozillaAccountsPrivacy> pre { -product-mozilla-accounts(capitalization: "lower", case: "acc") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Pokračovaním vyjadrujete súhlas s <mozillaAccountsTos>Podmienkami používania služby</mozillaAccountsTos> a <mozillaAccountsPrivacy>Vyhlásením o ochrane osobných údajov</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = alebo
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Prihlásiť sa pomocou
continue-with-google-button = Pokračovať pomocou { -brand-google }
continue-with-apple-button = Pokračovať pomocou { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Neznámy účet
auth-error-103 = Nesprávne heslo
auth-error-105-2 = Neplatný potvrdzovací kód
auth-error-110 = Neplatný token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Vykonali ste príliš veľa pokusov. Skúste to znova neskôr.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Vykonali ste príliš veľa pokusov. Skúste to znova { $retryAfter }.
auth-error-125 = Z bezpečnostných dôvodov bola požiadavka zablokovaná
auth-error-129-2 = Zadali ste neplatné telefónne číslo. Skontrolujte ho a skúste to znova.
auth-error-138-2 = Nepotvrdená relácia
auth-error-139 = Alternatívna e‑mailová adresa musí byť iná ako adresa účtu
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Tento e‑mail je rezervovaný pre iný účet. Skúste to znova neskôr alebo použite inú e‑mailovú adresu.
auth-error-155 = Token TOTP sa nenašiel
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Záložný overovací kód sa nenašiel
auth-error-159 = Neplatný kľúč na obnovenie účtu
auth-error-183-2 = Neplatný potvrdzovací kód alebo kód s vypršanou platnosťou
auth-error-202 = Funkcia nie je povolená
auth-error-203 = Systém nie je dostupný, skúste to znova neskôr.
auth-error-206 = Nie je možné vytvoriť heslo, heslo je už nastavené
auth-error-214 = Telefónne číslo na obnovenie už existuje
auth-error-215 = Telefónne číslo na obnovenie neexistuje
auth-error-216 = Bol dosiahnutý limit textových správ
auth-error-218 = Obnovenie pomocou telefónu nie je možné odstrániť, chýbajú záložné overovacie kódy.
auth-error-219 = Toto telefónne číslo bolo zaregistrované s príliš veľkým počtom účtov. Skúste iné číslo.
auth-error-999 = Neočakávaná chyba
auth-error-1001 = Pokus o prihlásenie bol zrušený
auth-error-1002 = Platnosť relácie vypršala. Ak chcete pokračovať, prihláste sa.
auth-error-1003 = Miestne úložisko alebo súbory cookie sú stále zakázané
auth-error-1008 = Staré a nové heslo sa musia líšiť
auth-error-1010 = Vyžaduje sa zadanie platného hesla
auth-error-1011 = Vyžaduje sa platná e‑mailová adresa
auth-error-1018 = Váš potvrdzujúci e‑mail sa práve vrátil. Nesprávne zadaný e‑mail?
auth-error-1020 = Nesprávne zadaný e‑mail? firefox.com nie je platná e‑mailová služba
auth-error-1031 = Ak sa chcete prihlásiť, musíte zadať svoj vek
auth-error-1032 = Ak sa chcete prihlásiť, musíte zadať platný vek
auth-error-1054 = Neplatný dvojstupňový overovací kód
auth-error-1056 = Neplatný záložný overovací kód
auth-error-1062 = Neplatné presmerovanie
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Nesprávne zadaný e‑mail? { $domain } nie je platná e‑mailová služba
auth-error-1066 = Na vytvorenie účtu nie je možné použiť e‑mailovú masku.
auth-error-1067 = Nesprávna e-mailová adresa?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Číslo končiace na { $lastFourPhoneNumber }
oauth-error-1000 = Niečo sa pokazilo. Prosím, zatvorte túto kartu a skúste to znova.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Ste prihlásený/-á do { -brand-firefox(case: "gen") }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E‑mail potvrdený
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Prihlásenie potvrdené
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Pre dokončenie nastavení sa prihláste do { -brand-firefox(case: "gen") }
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Prihlásiť sa
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Stále pridávate ďalšie zariadenia? Prihláste sa do { -brand-firefox(case: "gen") } na inom zariadení a dokončite nastavenie
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Prihláste sa do { -brand-firefox(case: "gen") } na inom zariadení a dokončite nastavenie
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Chcete získať svoje karty, záložky a heslá na inom zariadení?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Pripojiť ďalšie zariadenie
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Teraz nie
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Prihláste sa do { -brand-firefox(case: "gen") } pre Android a dokončite nastavenie
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Prihláste sa do { -brand-firefox(case: "gen") } pre iOS a dokončite nastavenie

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Vyžaduje sa miestne úložisko a súbory cookie
cookies-disabled-enable-prompt-2 = Aby ste mohli používať váš { -product-mozilla-account(case: "acc", capitalization: "lower") }, povoľte prosím cookies a lokálne úložisko. Vďaka tomu si vás budeme môcť zapamätať medzi jednotlivými reláciami.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Skúsiť znova
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Ďalšie informácie

## Index / home page

index-header = Zadajte e‑mailovú adresu
index-sync-header = Pokračovať do vášho { -product-mozilla-account(case: "gen", capitalization: "lower") }
index-sync-subheader = Synchronizujte svoje heslá, karty a záložky všade, kde používate { -brand-firefox }.
index-relay-header = Vytvorenie e‑mailovej masky
index-relay-subheader = Zadajte e‑mailovú adresu, na ktorú chcete posielať e‑maily zo svojho maskovaného e‑mailu.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = A pokračovať do služby { $serviceName }
index-subheader-default = A pokračovať do nastavení účtu
index-cta = Zaregistrujte sa alebo sa prihláste
index-account-info = { -product-mozilla-account } tiež odomkne prístup k ďalším produktom chrániacim súkromie od { -brand-mozilla(case: "gen") }.
index-email-input =
    .label = Zadajte e‑mailovú adresu
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Účet bol úspešne odstránený
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Váš potvrdzujúci e‑mail sa práve vrátil. Nesprávne zadaný e‑mail?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Ojoj! Nepodarilo sa nám vytvoriť kľúč na obnovenie účtu. Skúste to znova neskôr.
inline-recovery-key-setup-recovery-created = Bol vytvorený kľúč na obnovenie účtu
inline-recovery-key-setup-download-header = Zabezpečte svoj účet
inline-recovery-key-setup-download-subheader = Stiahnuť a uložiť
inline-recovery-key-setup-download-info = Uložte si tento kľúč niekde, kde si ho zapamätáte – neskôr sa na túto stránku už nebudete môcť vrátiť.
inline-recovery-key-setup-hint-header = Bezpečnostné odporúčanie

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Zrušiť nastavenie
inline-totp-setup-continue-button = Pokračovať
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Zvýšte zabezpečenie svojho účtu pridaním povinného zadávania overovacích kódov vygenerovaných jednou z <authenticationAppsLink>týchto overovacích aplikácií</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Povoľte dvojstupňové overenie <span>a pokračujte na nastavenia účtu</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Povoľte dvojstupňové overenie <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-ready-button = Hotovo
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Naskenujte overovací kód <span>a pokračujte do služby { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Zadajte kód manuálne <span>a pokračujte do služby { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Naskenujte overovací kód <span>a pokračujte do nastavení účtu</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Zadajte kód manuálne <span>a pokračujte do nastavení účtu</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Zadajte tento tajný kľúč do overovacej aplikácie. <toggleToQRButton>Naskenovať radšej QR kód?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Naskenujte QR kód vo svojej overovacej aplikácii a potom zadajte overovací kód, ktorý vám poskytne. <toggleToManualModeButton>Nemôžete naskenovať kód?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Po dokončení začne generovať overovacie kódy, ktoré môžete zadať.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Overovací kód
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Vyžaduje sa overovací kód
tfa-qr-code-alt = Pomocou kódu { $code } nastavte dvojstupňové overenie v podporovaných aplikáciách.
inline-totp-setup-page-title = Dvojstupňové overenie

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Právne informácie
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Podmienky používania služby
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Vyhlásenie o ochrane osobných údajov

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Vyhlásenie o ochrane osobných údajov

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Podmienky používania služby

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Prihlásili ste sa do { -product-firefox(case: "gen") }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Áno, schváliť zariadenie
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Ak ste to neboli vy, <link>zmeňte si heslo</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Zariadenie bolo pripojené
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Teraz synchronizujete: { $deviceFamily } ({ $deviceOS })
pair-auth-complete-sync-benefits-text = Teraz máte prístup k otvoreným kartám, heslám a záložkám na všetkých svojich zariadeniach.
pair-auth-complete-see-tabs-button = Pozrite si karty zo synchronizovaných zariadení
pair-auth-complete-manage-devices-link = Spravovať zariadenia

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Zadajte overovací kód <span>a pokračujte do nastavení účtu</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Zadajte overovací kód <span>a pokračujte do služby { $serviceName }</span>
auth-totp-instruction = Otvorte svoju overovaciu aplikáciu a opíšte z nej overovací kód.
auth-totp-input-label = Zadajte šesťmiestny kód
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Potvrdiť
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Vyžaduje sa overovací kód

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Vyžaduje sa schválenie <span>z vášho ďalšieho zariadenia</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Párovanie nebolo úspešné
pair-failure-message = Proces nastavenia bol ukončený.

## Pair index page

pair-sync-header = Synchronizujte { -brand-firefox } na svojom telefóne alebo tablete
pair-cad-header = Pripojte { -brand-firefox } na inom zariadení
pair-already-have-firefox-paragraph = Máte už { -brand-firefox } na telefóne alebo tablete?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synchronizujte svoje zariadenie
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Alebo si stiahnite
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Naskenujte QA kód a stiahnite si { -brand-firefox } pre mobilné zariadenia alebo si pošlite <linkExternal>odkaz na stiahnutie</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Teraz nie
pair-take-your-data-message = Vezmite si svoje karty, záložky a heslá všade, kde používate { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Začíname
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR kód

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Zariadenie bolo pripojené
pair-success-message-2 = Párovanie bolo úspešné.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Potvrďte párovanie <span>pre { $email }</span>
pair-supp-allow-confirm-button = Potvrdiť párovanie
pair-supp-allow-cancel-link = Zrušiť

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Vyžaduje sa schválenie <span>z vášho ďalšieho zariadenia</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Spárovať pomocou aplikácie
pair-unsupported-message = Použili ste fotoaparát systému? Párovanie je potrebné zahájiť z prehliadača { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Pre potreby synchronizácie si vytvorte heslo
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Toto šifruje vaše údaje. Musí sa líšiť od hesla vášho účtu { -brand-google } alebo { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Počkajte, prosím, budete presmerovaní na autorizovanú aplikáciu.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Zadajte kľúč na obnovenie účtu
account-recovery-confirm-key-instruction = Tento kľúč obnoví vaše zašifrované údaje prehliadania, ako sú heslá a záložky, zo serverov { -brand-firefox(case: "gen") }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Zadajte 32‑miestny kľúč na obnovenie účtu
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Tip, kam ste ho uložili:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Pokračovať
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Nemôžete nájsť kľúč na obnovenie účtu?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Vytvorte si nové heslo
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Heslo bolo nastavené
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Ľutujeme, pri nastavovaní hesla sa vyskytol problém
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Použiť kľúč na obnovenie účtu
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Vaše heslo bolo zmenené.
reset-password-complete-banner-message = Nezabudnite si vygenerovať nový kľúč na obnovenie účtu v nastaveniach { -product-mozilla-account(case: "gen", capitalization: "lower") }, aby ste predišli budúcim problémom s prihlásením.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Zadajte 10‑miestny kód
confirm-backup-code-reset-password-confirm-button = Potvrdiť
confirm-backup-code-reset-password-subheader = Zadajte záložný overovací kód
confirm-backup-code-reset-password-instruction = Zadajte jeden z kódov na jednorazové použitie, ktoré ste si uložili pri nastavovaní dvojstupňového overenia.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Stratili ste prístup?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Skontrolujte svoju e‑mailovú schránku
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Potvrdzovací kód sme odoslali na adresu <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Do 10 minút zadajte 8-miestny kód
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Pokračovať
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Znova odoslať kód
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Použiť iný účet

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Zmena hesla
confirm-totp-reset-password-subheader-v2 = Zadajte kód pre dvojstupňové overenie
confirm-totp-reset-password-instruction-v2 = Ak chcete zmeniť heslo, skontrolujte <strong>overovaciu aplikáciu</strong>.
confirm-totp-reset-password-trouble-code = Máte problémy so zadaním kódu?
confirm-totp-reset-password-confirm-button = Potvrdiť
confirm-totp-reset-password-input-label-v2 = Zadajte šesťmiestny kód
confirm-totp-reset-password-use-different-account = Použiť iný účet

## ResetPassword start page

password-reset-flow-heading = Zmena hesla
password-reset-body-2 = Požiadame vás o niekoľko vecí, ktoré viete iba vy, aby ste si ponechali svoj účet v bezpečí.
password-reset-email-input =
    .label = Zadajte svoju e‑mailovú adresu
password-reset-submit-button-2 = Pokračovať

## ResetPasswordConfirmed

reset-password-complete-header = Vaše heslo bolo zmenené
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = A pokračovať do služby { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Zmena hesla
password-reset-recovery-method-subheader = Vyberte spôsob obnovy
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Poďme sa, že ste to vy, čo používate svoje metódy obnovy.
password-reset-recovery-method-phone = Obnovenie pomocou telefónu
password-reset-recovery-method-code = Záložné overovacie kódy
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Zostáva { $numBackupCodes } kód
        [few] Zostávajú { $numBackupCodes } kódy
        [many] Zostáva { $numBackupCodes } kódov
       *[other] Zostáva { $numBackupCodes } kódov
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Pri odosielaní kódu na váš telefón na obnovenie sa vyskytol problém
password-reset-recovery-method-send-code-error-description = Skúste to znova neskôr alebo použite záložné overovacie kódy.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Zmeniť heslo
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Zadajte obnovovací kód
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Na telefónne číslo končiace číslicami <span>{ $lastFourPhoneDigits }</span> bol prostredníctvom textovej správy odoslaný šesťmiestny kód. Platnosť tohto kódu vyprší po 5 minútach. Nezdieľajte tento kód s nikým.
reset-password-recovery-phone-input-label = Zadajte šesťmiestny kód
reset-password-recovery-phone-code-submit-button = Potvrdiť
reset-password-recovery-phone-resend-code-button = Znova odoslať kód
reset-password-recovery-phone-resend-success = Kód bol odoslaný
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Stratili ste prístup?
reset-password-recovery-phone-send-code-error-heading = Pri odosielaní kódu sa vyskytol problém
reset-password-recovery-phone-code-verification-error-heading = Pri overovaní vášho kódu sa vyskytol problém
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Skúste to znova neskôr.
reset-password-recovery-phone-invalid-code-error-description = Kód je neplatný alebo jeho platnosť vypršala.
reset-password-recovery-phone-invalid-code-error-link = Chcete namiesto toho použiť záložné overovacie kódy?
reset-password-with-recovery-key-verified-page-title = Zmena hesla bolo úspešná
reset-password-complete-new-password-saved = Nové heslo bolo uložené!
reset-password-complete-recovery-key-created = Bol vytvorený nový kľúč na obnovenie účtu. Stiahnite si ho a uložte teraz.
reset-password-complete-recovery-key-download-info =
    Tento kľúč je nevyhnutný pre
    obnovu dát v prípade zabudnutia hesla. <b>Stiahnite ho a bezpečne uložte, pretože neskôr už nebudete mať prístup k tejto stránke.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Chyba:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Overuje sa prihlásenie…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Chyba potvrdenia
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Platnosť potvrdzovacieho odkazu vypršala
signin-link-expired-message-2 = Platnosť odkazu, na ktorý ste klikli, vypršala alebo už bol použitý.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Zadajte heslo<span> pre svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = A pokračovať do služby { $serviceName }
signin-subheader-without-logo-default = A pokračovať do nastavení účtu
signin-button = Prihlásiť sa
signin-header = Prihlásiť sa
signin-use-a-different-account-link = Použiť iný účet
signin-forgot-password-link = Zabudli ste heslo?
signin-password-button-label = Heslo
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.
signin-code-expired-error = Platnosť kódu vypršala. Prihláste sa znova.
signin-account-locked-banner-heading = Zmena hesla
signin-account-locked-banner-description = Váš účet sme zablokovali, aby sme ho ochránili pred podozrivou aktivitou.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Zmeňte si heslo a prihláste sa

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Odkaz, na ktorý ste klikli, neobsahuje všetky potrebné znaky. Je možné, že nebol korektne spracovaný vašim e‑mailovým klientom. Skopírujte adresu do prehliadača a skúste to znova.
report-signin-header = Nahlásiť neoprávnené prihlásenie?
report-signin-body = Dostali ste e‑mail o pokuse o prihlásenie sa k vášmu účtu. Chcete túto aktivitu nahlásiť ako podozrivú?
report-signin-submit-button = Nahlásiť aktivitu
report-signin-support-link = Prečo sa to stalo?
report-signin-error = Ľutujeme, pri odosielaní hlásenia sa vyskytol problém.
signin-bounced-header = Mrzí nás to, no váš účet bol uzamknutý.
# $email (string) - The user's email.
signin-bounced-message = Potvrdzovací e‑mail, ktorý sme poslali na adresu { $email }, nebol doručený. Aby sme ochránili vaše údaje { -brand-firefox(case: "gen") }, váš účet sme uzamkli.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Ak ide o platnú e‑mailovú adresu, <linkExternal>dajte nám vedieť</linkExternal> a my vám pomôžeme odomknúť váš účet.
signin-bounced-create-new-account = Už tento účet nevlastníte? Vytvorte si nový účet
back = Naspäť

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Overte toto prihlásenie <span>a pokračujte do nastavení účtu</span>
signin-push-code-heading-w-custom-service = Overte toto prihlásenie <span>a pokračujte do služby { $serviceName }</span>
signin-push-code-instruction = Skontrolujte svoje ostatné zariadenia a schváľte toto prihlásenie zo svojho prehliadača { -brand-firefox }.
signin-push-code-did-not-recieve = Nedostali ste notifikáciu?
signin-push-code-send-email-link = Odoslať kód na e‑mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Potvrďte svoje prihlásenie
signin-push-code-confirm-description = Zistili sme pokus o prihlásenie z nasledujúceho zariadenia. Ak ste to boli vy, potvrďte prihlásenie
signin-push-code-confirm-verifying = Overuje sa
signin-push-code-confirm-login = Potvrdiť prihlásenie
signin-push-code-confirm-wasnt-me = Toto som nebol ja, zmeniť heslo.
signin-push-code-confirm-login-approved = Vaše prihlásenie bolo schválené. Zatvorte toto okno.
signin-push-code-confirm-link-error = Odkaz je poškodený. Skúste to znova.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Prihlásenie
signin-recovery-method-subheader = Vyberte spôsob obnovy
signin-recovery-method-details = Poďme sa, že ste to vy, čo používate svoje metódy obnovy.
signin-recovery-method-phone = Obnovenie pomocou telefónu
signin-recovery-method-code-v2 = Záložné overovacie kódy
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Zostáva { $numBackupCodes } kód
        [few] Zostávajú { $numBackupCodes } kódy
        [many] Zostáva { $numBackupCodes } kódov
       *[other] Zostáva { $numBackupCodes } kódov
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Pri odosielaní kódu na váš telefón na obnovenie sa vyskytol problém
signin-recovery-method-send-code-error-description = Skúste to znova neskôr alebo použite záložné overovacie kódy.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Prihlásenie
signin-recovery-code-sub-heading = Zadajte záložný overovací kód
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Zadajte jeden z kódov na jednorazové použitie, ktoré ste si uložili pri nastavovaní dvojstupňového overenia.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Zadajte 10‑miestny kód
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Potvrdiť
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Použiť obnovenie pomocou telefónu
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Stratili ste prístup?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Vyžaduje sa záložný overovací kód
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Pri odosielaní kódu na váš telefón na obnovenie sa vyskytol problém
signin-recovery-code-use-phone-failure-description = Skúste to znova neskôr.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Prihlásenie
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Zadajte obnovovací kód
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Na telefónne číslo končiace číslicami <span>{ $lastFourPhoneDigits }</span> bol prostredníctvom textovej správy odoslaný šesťmiestny kód. Platnosť tohto kódu vyprší po 5 minútach. Nezdieľajte tento kód s nikým.
signin-recovery-phone-input-label = Zadajte šesťmiestny kód
signin-recovery-phone-code-submit-button = Potvrdiť
signin-recovery-phone-resend-code-button = Znova odoslať kód
signin-recovery-phone-resend-success = Kód bol odoslaný
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Stratili ste prístup?
signin-recovery-phone-send-code-error-heading = Pri odosielaní kódu sa vyskytol problém
signin-recovery-phone-code-verification-error-heading = Pri overovaní vášho kódu sa vyskytol problém
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Skúste to znova neskôr.
signin-recovery-phone-invalid-code-error-description = Kód je neplatný alebo jeho platnosť vypršala.
signin-recovery-phone-invalid-code-error-link = Chcete namiesto toho použiť záložné overovacie kódy?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Úspešne ste sa prihlásili. Ak znova použijete telefón na obnovenie, môžu platiť limity.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Ďakujeme za vašu ostražitosť
signin-reported-message = Náš tím bol informovaný. Podobné hlásenia nám pomáhajú odrážať narušiteľov.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Zadajte potvrdzovací kód<span> pre svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = V priebehu 5 minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
signin-token-code-input-label-v2 = Zadajte šesťmiestny kód
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Potvrdiť
signin-token-code-code-expired = Platnosť kódu vypršala?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Odoslať e‑mailom nový kód.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Vyžaduje sa potvrdzovací kód
signin-token-code-resend-error = Niečo sa pokazilo. Nový kód sa nepodarilo odoslať.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Prihlásenie
signin-totp-code-subheader-v2 = Zadajte kód pre dvojstupňové overenie
signin-totp-code-instruction-v4 = Skontrolujte svoju <strong>overovaciu aplikáciu</strong> a potvrďte svoje prihlásenie.
signin-totp-code-input-label-v4 = Zadajte šesťmiestny kód
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Prečo sa od vás žiada o overenie totožnosti?
signin-totp-code-aal-banner-content = Nastavili ste si dvojstupňové overenie vo svojom účte, ale ešte ste sa na tomto zariadení neprihlásili pomocou kódu.
signin-totp-code-aal-sign-out = Odhlásiť sa na tomto zariadení
signin-totp-code-aal-sign-out-error = Ľutujeme, vyskytol sa problém s odhlásením
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Potvrdiť
signin-totp-code-other-account-link = Použiť iný účet
signin-totp-code-recovery-code-link = Máte problémy so zadaním kódu?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Vyžaduje sa overovací kód
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autorizovať toto prihlásenie
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Na e‑mailovú adresu { $email } sme poslali autorizačný kód.
signin-unblock-code-input = Zadajte autorizačný kód
signin-unblock-submit-button = Pokračovať
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Vyžaduje sa autorizačný kód
signin-unblock-code-incorrect-length = Autorizačný kód musí obsahovať 8 znakov
signin-unblock-code-incorrect-format-2 = Autorizačný kód môže obsahovať iba písmená a/alebo čísla
signin-unblock-resend-code-button = Nemáte nič v schránke ani v priečinku so spamom? Chcete, aby sme vám e‑mail odoslali znova?
signin-unblock-support-link = Prečo sa to stalo?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Zadajte potvrdzovací kód
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Zadajte potvrdzovací kód <span>pre svoj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = V priebehu 5 minút zadajte kód, ktorý bol odoslaný na e‑mailovú adresu <email>{ $email }</email>.
confirm-signup-code-input-label = Zadajte šesťmiestny kód
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Potvrdiť
confirm-signup-code-sync-button = Spustiť synchronizáciu
confirm-signup-code-code-expired = Platnosť kódu vypršala?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Odoslať e‑mailom nový kód.
confirm-signup-code-success-alert = Účet bol úspešne potvrdený
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Vyžaduje sa potvrdzovací kód
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } sa vás po prihlásení pokúsi poslať späť, aby ste mohli použiť e‑mailovú masku.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Vytvoriť heslo
signup-relay-info = Heslo je potrebné na bezpečnú správu vašich maskovaných e‑mailov a prístup k bezpečnostným nástrojom od { -brand-mozilla(case: "gen") }.
signup-sync-info = Synchronizujte svoje heslá, záložky a ďalšie údaje všade, kde používate { -brand-firefox }.
signup-sync-info-with-payment = Synchronizujte svoje heslá, spôsoby platby, záložky a ďalšie údaje všade, kde používate { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Zmeniť e‑mailovú adresu

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synchronizácia je zapnutá
signup-confirmed-sync-success-banner = { -product-mozilla-account } potvrdený
signup-confirmed-sync-button = Začať prehliadanie
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Vaše heslá, spôsoby platby, adresy, záložky, história a ďalšie sa môžu synchronizovať všade, kde používate { -brand-firefox }.
signup-confirmed-sync-description-v2 = Vaše heslá, adresy, záložky, história a ďalšie sa môžu synchronizovať všade, kde používate { -brand-firefox }.
signup-confirmed-sync-add-device-link = Pridať ďalšie zariadenie
signup-confirmed-sync-manage-sync-button = Spravovať synchronizáciu
signup-confirmed-sync-set-password-success-banner = Synchronizačné heslo vytvorené
