# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Na váš e-mail byl odeslán nový kód.
resend-link-success-banner-heading = Na váš e-mail byl odeslán nový odkaz.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Pro jistotu si přidejte adresu { $accountsEmail } do svých kontaktů.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Zavřít oznámení
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } bude 1. listopadu přejmenován na { -product-mozilla-accounts }
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Stále se budete přihlašovat stejným uživatelským jménem a heslem a nedojde k žádným dalším změnám v používaných produktech.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Přejmenovali jsme { -product-firefox-accounts } na { -product-mozilla-accounts }. Stále se budete přihlašovat pod stejným uživatelským jménem a heslem a nedojde k žádným dalším změnám v používaných produktech.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Zjistit více
# Alt text for close banner image
brand-close-banner =
    .alt = Zavřít oznámení
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo { -brand-mozilla } m

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Zpět
button-back-title = Zpět

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Stáhnout a pokračovat
    .title = Stáhnout a pokračovat
recovery-key-pdf-heading = Obnovovací klíč k účtu
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Vytvořen: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Obnovovací klíč k účtu
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Tento klíč umožňuje obnovit zašifrovaná data prohlížeče (včetně hesel, záložek a historie), pokud zapomenete heslo. Uložte jej na místo, které si budete pamatovat.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Místa pro uložení vašeho klíče
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Další informace o obnovovacím klíči k účtu
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Je nám líto, ale při stahování klíče pro obnovení účtu došlo k problému.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Získejte více od { -brand-mozilla(case: "gen") }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Získejte naše nejnovější zprávy a aktualizace produktů
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Brzký přístup k testování nových produktů
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Výzvy na opětovné získání internetu

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Staženo
datablock-copy =
    .message = Zkopírováno
datablock-print =
    .message = Vytištěno

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Kód zkopírován
        [few] Kódy zkopírovány
       *[other] Kódy zkopírovány
    }
datablock-download-success =
    { $count ->
        [one] Kód byl stažen
        [few] Kódy staženy
       *[other] Kódy staženy
    }
datablock-print-success =
    { $count ->
        [one] Kód vytištěn
        [few] Kódy vytištěny
       *[other] Kódy vytištěny
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Zkopírováno

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (odhad)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (odhad)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (odhad)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (odhad)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Neznámá poloha
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
form-password-with-inline-criteria-signup-submit-button = Vytvořit účet
form-password-with-inline-criteria-reset-new-password =
    .label = Nové heslo
form-password-with-inline-criteria-confirm-password =
    .label = Potvrdit heslo
form-password-with-inline-criteria-reset-submit-button = Vytvořit nové heslo
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Heslo
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Zopakujte heslo
form-password-with-inline-criteria-set-password-submit-button = Spustit synchronizaci
form-password-with-inline-criteria-match-error = Hesla se neshodují
form-password-with-inline-criteria-sr-too-short-message = Heslo musí obsahovat alespoň 8 znaků.
form-password-with-inline-criteria-sr-not-email-message = Heslo nesmí obsahovat vaši e-mailovou adresu.
form-password-with-inline-criteria-sr-not-common-message = Heslo nesmí být běžně používaným heslem.
form-password-with-inline-criteria-sr-requirements-met = Zadané heslo respektuje všechny požadavky na heslo.
form-password-with-inline-criteria-sr-passwords-match = Zadaná hesla se shodují.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Toto pole je povinné

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Pro pokračování vložte { $codeLength }-místný číselný kód
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Pro pokračování vložte { $codeLength } znakový kód

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Klíč k obnovení účtu { -brand-firefox }
get-data-trio-title-backup-verification-codes = Záložní ověřovací kódy
get-data-trio-download-2 =
    .title = Stáhnout
    .aria-label = Stáhnout
get-data-trio-copy-2 =
    .title = Kopírovat
    .aria-label = Kopírovat
get-data-trio-print-2 =
    .title = Vytisknout
    .aria-label = Vytisknout

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Upozornění
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Upozornění
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Varování
authenticator-app-aria-label =
    .aria-label = Ověřovací aplikace
backup-codes-icon-aria-label-v2 =
    .aria-label = Záložní ověřovací kódy povoleny
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Záložní ověřovací kódy jsou zakázány
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Obnovovací SMS povoleny
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Obnovovací SMS jsou zakázány
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Kanadská vlajka
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Zaškrtnout
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Úspěch
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Povoleno
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Zavřít zprávu
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Kód
error-icon-aria-label =
    .aria-label = Chyba
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Informace
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Vlajka Spojených států amerických

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Počítač a mobil a na každém obrázek zlomeného srdce
hearts-verified-image-aria-label =
    .aria-label = Počítač, mobilní telefon a tablet a na každém pulzující srdíčko
signin-recovery-code-image-description =
    .aria-label = Dokument, který obsahuje skrytý text.
signin-totp-code-image-label =
    .aria-label = Zařízení se skrytým 6místným kódem.
confirm-signup-aria-label =
    .aria-label = Obálka obsahující odkaz
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Ilustrace představující klíč pro obnovení účtu.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Ilustrace představující klíč pro obnovení účtu.
password-image-aria-label =
    .aria-label = Ilustrace při zadávání hesla.
lightbulb-aria-label =
    .aria-label = Ilustrace znázorňující vytvoření nápovědy k úložišti.
email-code-image-aria-label =
    .aria-label = Ilustrace znázorňující e-mail obsahující kód.
recovery-phone-image-description =
    .aria-label = Mobilní zařízení, které přijímá kód prostřednictvím textové zprávy.
recovery-phone-code-image-description =
    .aria-label = Kód byl přijat na mobilní zařízení.
backup-recovery-phone-image-aria-label =
    .aria-label = Mobilní zařízení s možností zasílání SMS zpráv
backup-authentication-codes-image-aria-label =
    .aria-label = Obrazovka zařízení s kódy
sync-clouds-image-aria-label =
    .aria-label = Mraky s ikonou synchronizace
confetti-falling-image-aria-label =
    .aria-label = Animované padající konfety

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Jste přihlášeni do { -brand-firefox(case: "gen") }.
inline-recovery-key-setup-create-header = Zabezpečte svůj účet
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Máte minutku na ochranu svých údajů?
inline-recovery-key-setup-info = Vytvořte si k účtu obnovovací klíč, abyste mohli obnovit synchronizovaná data o prohlížení v případě, že zapomenete své heslo.
inline-recovery-key-setup-start-button = Vytvořit obnovovací klíč k účtu
inline-recovery-key-setup-later-button = Udělám to později

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Skrýt heslo
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Zobrazit heslo
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Vaše heslo je aktuálně viditelné na obrazovce.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Vaše heslo je aktuálně skryté.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Vaše heslo je nyní viditelné na obrazovce.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Vaše heslo je nyní skryté.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Vyberte zemi
input-phone-number-enter-number = Zadejte telefonní číslo
input-phone-number-country-united-states = Spojené státy
input-phone-number-country-canada = Kanada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Zpět

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Odkaz pro obnovení je poškozen
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Odkaz pro potvrzení je poškozen
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Odkaz je poškozen
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Adresa odkazu, na který jste klikli, nebyla kompletní, a mohla být poškozena například vaším e-mailovým klientem. Zkopírujte pečlivě celou adresu a zkuste to znovu.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Získat nový odkaz

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Pamatujete si své heslo?
# link navigates to the sign in page
remember-password-signin-link = Přihlásit se

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Hlavní adresa už byla ověřena
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Přihlášení už bylo potvrzeno
confirmation-link-reused-message = Každý potvrzovací odkaz lze použít pouze jednou a tento už byl použit.

## Locale Toggle Component

locale-toggle-select-label = Vyberte jazyk
locale-toggle-browser-default = Předvolený jazyk prohlížeče
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Špatný požadavek

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Toto heslo potřebujete pro přístup ke všem zašifrovaným datům, která u nás ukládáte.
password-info-balloon-reset-risk-info = Reset znamená potenciální ztrátu dat, jako jsou hesla a záložky.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Zvolte si silné heslo, které jste na jiných stránkách ještě nepoužívali. Ujistěte se, že splňuje bezpečnostní požadavky:
password-strength-short-instruction = Zvolte silné heslo:
password-strength-inline-min-length = Alespoň 8 znaků
password-strength-inline-not-email = Není vaše e-mailová adresa
password-strength-inline-not-common = Není běžně používané heslo
password-strength-inline-confirmed-must-match = Potvrzení odpovídá novému heslu
password-strength-inline-passwords-match = Hesla se shodují

## Notification Promo Banner component

account-recovery-notification-cta = Vytvořit
account-recovery-notification-header-value = Neztraťte svá data, pokud zapomenete své heslo
account-recovery-notification-header-description = Vytvořte si k účtu obnovovací klíč pro obnovení synchronizovaných dat v případě, že zapomenete své heslo.
recovery-phone-promo-cta = Přidat telefon pro obnovení
recovery-phone-promo-heading = Přidejte do svého účtu další ochranu pomocí telefonu pro obnovení
recovery-phone-promo-description = Nyní se můžete přihlásit pomocí jednorázového hesla přes SMS, pokud nemůžete použít svou aplikaci pro dvoufázové ověření.
recovery-phone-promo-info-link = Přečtěte si více o riziku pro obnovu a výměnu SIM
promo-banner-dismiss-button =
    .aria-label = Zavřít banner

## Ready component

ready-complete-set-up-instruction = Dokončete nastavení zadáním nového hesla na ostatní zařízeních s { -brand-firefox(case: "ins") }.
manage-your-account-button = Správa účtu
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Nyní můžete používat službu { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Nyní jste připraveni použít nastavení účtu
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Váš účet je dokončen!
ready-continue = Pokračovat
sign-in-complete-header = Přihlášení potvrzeno
sign-up-complete-header = Účet ověřen
primary-email-verified-header = Hlavní e-mailová adresa byla potvrzena

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Místa pro uložení vašeho klíče:
flow-recovery-key-download-storage-ideas-folder-v2 = Složka na zabezpečeném zařízení
flow-recovery-key-download-storage-ideas-cloud = Důvěryhodné cloudové úložiště
flow-recovery-key-download-storage-ideas-print-v2 = Tištěná fyzická kopie
flow-recovery-key-download-storage-ideas-pwd-manager = Správce hesel

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Přidejte nápovědu, která vám pomůže najít klíč
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Tato nápověda by vám měla pomoci zapamatovat si, kam jste si uložili obnovovací klíč k účtu. Můžeme vám ji zobrazit v průběhu obnovy hesla a pomoci vám tak obnovit vaše data.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Zadejte nápovědu (volitelné)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Dokončit
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Nápověda musí mít méně než 255 znaků.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Nápověda nemůže obsahovat nebezpečné znaky Unicode. Povoleny jsou pouze písmena, číslice, interpunkční znaménka a symboly.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Varování
password-reset-chevron-expanded = Skrýt varování
password-reset-chevron-collapsed = Rozbalit varování
password-reset-data-may-not-be-recovered = Data prohlížeče nemusí být možné obnovit
password-reset-previously-signed-in-device-2 = Máte nějaké zařízení, na kterém jste se dříve přihlásili?
password-reset-data-may-be-saved-locally-2 = Data o prohlížeči mohou být uložena na tomto zařízení. Obnovte své heslo a poté se přihlaste pro obnovu a synchronizaci svých dat.
password-reset-no-old-device-2 = Vlastníte nové zařízení, ale nemáte přístup k žádnému z předchozích?
password-reset-encrypted-data-cannot-be-recovered-2 = Je nám líto, ale vaše šifrovaná data uložená na serverech { -brand-firefox(case: "gen") } nelze obnovit.
password-reset-warning-have-key = Máte k účtu obnovovací klíč?
password-reset-warning-use-key-link = Použijte ho k obnovení svého hesla a uchování dat

## Alert Bar

alert-bar-close-message = Zavřít zprávu

## User's avatar

avatar-your-avatar =
    .alt = Váš avatar
avatar-default-avatar =
    .alt = Výchozí avatar

##


# BentoMenu component

bento-menu-title-3 = produkty { -brand-mozilla(case: "gen") }
bento-menu-tagline = Další produkty od { -brand-mozilla(case: "gen") }, které chrání vaše soukromí
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Prohlížeč { -brand-firefox } pro počítač
bento-menu-firefox-mobile = Prohlížeč { -brand-firefox } pro mobily
bento-menu-made-by-mozilla = Od { -brand-mozilla(case: "gen") }

## Connect another device promo

connect-another-fx-mobile = Získejte { -brand-firefox(case: "acc") } na mobil nebo tablet
connect-another-find-fx-mobile-2 = { -brand-firefox } najdete na { -google-play } a { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Stáhnout { -brand-firefox } z { -google-play }
connect-another-app-store-image-3 =
    .alt = Stáhnout { -brand-firefox } z { -app-store }

## Connected services section

cs-heading = Propojené služby
cs-description = Co vše používáte a kde jste přihlášeni.
cs-cannot-refresh = Nepodařilo se obnovit seznam propojených služeb.
cs-cannot-disconnect = Klient nebyl nalezen, nelze se odpojit
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Byli jste odhlášeni ze služby { $service }
cs-refresh-button =
    .title = Aktualizovat propojené služby
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Chybějící nebo duplicitní položky?
cs-disconnect-sync-heading = Odpojit od Syncu

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = Vaše data o prohlížení zůstanou v zařízení <span>{ $device }</span>, ale už nebudou synchronizována s vaším účtem.
cs-disconnect-sync-reason-3 = Jaký byl váš hlavní důvod pro odpojení zařízení <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Zařízení je:
cs-disconnect-sync-opt-suspicious = podezřelé
cs-disconnect-sync-opt-lost = ztracené nebo ukradené
cs-disconnect-sync-opt-old = staré nebo nahrazené
cs-disconnect-sync-opt-duplicate = duplicitní
cs-disconnect-sync-opt-not-say = Raději neupřesňovat

##

cs-disconnect-advice-confirm = Ok, rozumím
cs-disconnect-lost-advice-heading = Ztracené nebo ukradené zařízení bylo odpojeno
cs-disconnect-lost-advice-content-3 =
    Pokud bylo vaše zařízení ztraceno nebo ukradeno,
    pro zabezpečení vašich dat byste si měli změnit heslo svého { -product-mozilla-account(case: "gen", capitalization: "lower") }.
    Doporučujeme také u výrobce svého zařízení zjistit možnosti pro jeho vzdálené vymazání.
cs-disconnect-suspicious-advice-heading = Podezřelé zařízení bylo odpojeno
cs-disconnect-suspicious-advice-content-2 =
    Pokud je odpojované zařízení skutečně podezřejmé,
    pro zabezpečení vašich dat byste si měli změnit heslo svého { -product-mozilla-account(case: "gen", capitalization: "lower") }.
    Doporučujeme také změnit všechna hesla uložená ve { -brand-firefox(case: "loc") }, která najdete po zadání about:logins do adresního řádku.
cs-sign-out-button = Odhlásit se

## Data collection section

dc-heading = Sběr dat a jejich použití
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Prohlížeč { -brand-firefox }
dc-subheader-content-2 = Povolte { -product-mozilla-accounts(case: "dat", capitalization: "lower") } zasílat { -brand-mozilla(case: "dat") } technická data a data o interakcích.
dc-subheader-ff-content = Pokud chcete zkontrolovat nebo aktualizovat technické nastavení prohlížeče { -brand-firefox } a data o interakcích, otevřete nastavení prohlížeče { -brand-firefox } a přejděte do sekce Soukromí a zabezpečení.
dc-opt-out-success-2 = Sdílení dat bylo úspěšně zrušeno. { -product-mozilla-accounts } nebude { -brand-mozilla(case: "dat") } odesílat technická data ani data o interakcích.
dc-opt-in-success-2 = Díky! Sdílení těchto dat nám pomáhá vylepšovat { -product-mozilla-accounts(case: "acc", capitalization: "lower") }.
dc-opt-in-out-error-2 = Při změně předvolby shromažďování dat došlo k problému
dc-learn-more = Zjistit více

# DropDownAvatarMenu component

drop-down-menu-title-2 = Nabídka { -product-mozilla-account(case: "gen", capitalization: "lower") }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Přihlášen(a) jako
drop-down-menu-sign-out = Odhlásit se
drop-down-menu-sign-out-error-2 = Omlouváme se, odhlášení se nezdařilo

## Flow Container

flow-container-back = Zpět

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Z důvodu zabezpečení zadejte znovu své heslo
flow-recovery-key-confirm-pwd-input-label = Zadání hesla
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Vytvořit obnovovací klíč k účtu
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Vytvořit nový obnovovací klíč k účtu

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Obnovovací klíč k účtu byl vytvořen — stáhněte si jej a uložte
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Tento klíč umožňuje obnovit data, pokud zapomenete heslo. Stáhněte si jej nyní a uložte na místo, které si budete pamatovat — později se na tuto stránku nebudete moci vrátit.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Pokračovat bez stahování

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Obnovovací klíč k účtu byl vytvořen

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Vytvořte si obnovovací klíč k účtu pro případ, když zapomenete své heslo
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Změna vašeho obnovovacího klíče k účtu
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Šifrujeme data procházení – hesla, záložky a další věci. Je to skvělé pro ochranu soukromí, ale znamená to, že pokud zapomenete heslo, můžete ztratit svá data.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Proto je vytvoření obnovovacího klíče k účtu tak důležité – svůj klíč můžete použít k obnovu svých dat.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Začít
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Zrušit

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Připojte se ke své ověřovací aplikaci
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocí libovolné ověřovací aplikace, např. Duo nebo Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = QR kód pro nastavení dvoufázového ověřování. Naskenujte ho, nebo zvolte „Nemůžete QR kód naskenovat?“
flow-setup-2fa-cant-scan-qr-button = Nemůžete QR kód naskenovat?
flow-setup-2fa-manual-key-heading = Zadejte kód ručně
flow-setup-2fa-manual-key-instruction = <strong>Krok 1:</strong> Zadejte tento kód do preferované ověřovací aplikace.
flow-setup-2fa-scan-qr-instead-button = Místo toho naskenovat QR kód?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Zjistit více o ověřovacích aplikacích
flow-setup-2fa-button = Pokračovat
flow-setup-2fa-step-2-instruction = <strong>Krok 2:</strong>Zadejte kód z vaší ověřovací aplikace.
flow-setup-2fa-input-label = Zadejte šestimístný kód
flow-setup-2fa-code-error = Neplatný nebo prošlý kód. Zkontrolujte údaj ve své ověřovací aplikaci a zkuste to znovu.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Vyberte způsob obnovení
flow-setup-2fa-backup-choice-description = Díky tomu se můžete přihlásit, pokud nemáte přístup ke svému mobilnímu zařízení nebo své ověřovací aplikaci.
flow-setup-2fa-backup-choice-phone-title = Telefon pro obnovení
flow-setup-2fa-backup-choice-phone-badge = Nejjednodušší
flow-setup-2fa-backup-choice-phone-info = Získejte obnovovací kód prostřednictvím textové zprávy. Momentálně dostupné v USA a Kanadě.
flow-setup-2fa-backup-choice-code-title = Záložní ověřovací kódy
flow-setup-2fa-backup-choice-code-badge = Nejbezpečnější
flow-setup-2fa-backup-choice-code-info = Vytvářejte a ukládejte jednorázové ověřovací kódy.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Další informace o riziku obnovení a výměně SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Zadejte záložní ověřovací kód
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Potvrďte uložení kódů zadáním jednoho z nich. Bez těchto kódů se možná nebudete moci přihlásit, pokud nemáte ověřovací aplikaci.
flow-setup-2fa-backup-code-confirm-code-input = Zadejte 10místný kód
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Dokončit

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Uložit záložní ověřovací kódy
flow-setup-2fa-backup-code-dl-save-these-codes = Uložte si je na místo, které si budete pamatovat. Pokud nemáte přístup ke své ověřovací aplikaci, budete muset při přihlašování jeden z nich zadat.
flow-setup-2fa-backup-code-dl-button-continue = Pokračovat

##

flow-setup-2fa-inline-complete-success-banner = Dvoufázové ověřování je zapnuto
flow-setup-2fa-inline-complete-success-banner-description = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlaste pomocí nového dvoufázového ověření.
flow-setup-2fa-inline-complete-backup-code = Záložní ověřovací kódy
flow-setup-2fa-inline-complete-backup-phone = Telefon pro obnovení
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Zbývá { $count } kód
        [few] Zbývají { $count } kódy
       *[other] Zbývá { $count } kódů
    }
flow-setup-2fa-inline-complete-backup-code-description = Toto je nejbezpečnější způsob obnovení, pokud se nemůžete přihlásit pomocí svého mobilního zařízení nebo své ověřovací aplikace.
flow-setup-2fa-inline-complete-backup-phone-description = Toto je nejjednodušší způsob obnovení, pokud se nemůžete přihlásit pomocí své ověřovací aplikace.
flow-setup-2fa-inline-complete-learn-more-link = Jak tato funkce chrání váš účet
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Pokračovat do služby { $serviceName }
flow-setup-2fa-prompt-heading = Nastavení dvoufázového ověřování
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } vyžaduje, abyste si nastavili dvoufázové ověřování, aby byl váš účet v bezpečí.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Pro pokračování můžete použít kteroukoliv z <authenticationAppsLink>těchto ověřovacích aplikací</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Pokračovat

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Zadejte ověřovací kód
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Na číslo <span>{ $phoneNumber }</span> byl odeslán šestimístný kód jako textová zpráva. Tento kód vyprší po 5 minutách.
flow-setup-phone-confirm-code-input-label = Zadejte šestimístný kód
flow-setup-phone-confirm-code-button = Potvrdit
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Platnost kódu vypršela?
flow-setup-phone-confirm-code-resend-code-button = Znovu odeslat kód
flow-setup-phone-confirm-code-resend-code-success = Kód byl odeslán
flow-setup-phone-confirm-code-success-message-v2 = Telefon pro obnovení byl přidán
flow-change-phone-confirm-code-success-message = Telefon pro obnovení se změnil

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Ověřte své telefonní číslo
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = { -brand-mozilla } vám zašle textovou zprávu s kódem pro ověření vašeho čísla. Tento kód s nikým nesdílejte.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Telefon pro obnovení je k dispozici pouze ve Spojených státech a Kanadě. VoIP čísla a telefonní masky se nedoporučují.
flow-setup-phone-submit-number-legal = Poskytnutím vašeho telefonního čísla souhlasíte s jeho uložením, abychom vám mohli posílat textové zprávy pouze pro ověření účtu. Mohou být účtovány poplatky za zprávy a data.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Zaslat kód

## HeaderLockup component, the header in account settings

header-menu-open = Zavřít nabídku
header-menu-closed = Nabídka navigace na webu
header-back-to-top-link =
    .title = Zpět nahoru
header-back-to-settings-link =
    .title = Zpět na nastavení { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Nápověda

## Linked Accounts section

la-heading = Propojené účty
la-description = Máte autorizovaný přístup k následujícím účtům.
la-unlink-button = Odpojit
la-unlink-account-button = Odpojit
la-set-password-button = Nastavení hesla
la-unlink-heading = Odpojit od účtu třetí strany
la-unlink-content-3 = Opravdu chcete odpojit svůj účet? Jeho odpojení vás automaticky neodhlásí z vašich propojených služeb. K tomu je třeba se odhlásit ručně v sekci Propojené služby.
la-unlink-content-4 = Před odpojením účtu je nutné nastavit heslo. Bez hesla byste se po odpojení účtu neměli moci jak přihlásit.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Zavřít
modal-cancel-button = Zrušit
modal-default-confirm-button = Potvrdit

## ModalMfaProtected

modal-mfa-protected-title = Zadejte potvrzovací kód
modal-mfa-protected-subtitle = Pomozte nám ujistit se, že jste to vy, kdo mění informace o vašem účtu.
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Vložte kód, který vám byl během { $expirationTime } minuty zaslán na adresu <email>{ $email }</email>.
        [few] Vložte kód, který vám byl během { $expirationTime } minut zaslán na adresu <email>{ $email }</email>.
       *[other] Vložte kód, který vám byl během { $expirationTime } minut zaslán na adresu <email>{ $email }</email>.
    }
modal-mfa-protected-input-label = Zadejte šestimístný kód
modal-mfa-protected-cancel-button = Zrušit
modal-mfa-protected-confirm-button = Potvrdit
modal-mfa-protected-code-expired = Platnost kódu vypršela?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Zaslat e-mailem nový kód.

## Modal Verify Session

mvs-verify-your-email-2 = Potvrďte svou e-mailovou adresu
mvs-enter-verification-code-2 = Zadejte potvrzovací kód
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Vložte prosím během 5 minut potvrzovací kód, který vám byl zaslán na <email>{ $email }</email>.
msv-cancel-button = Zrušit
msv-submit-button-2 = Potvrdit

## Settings Nav

nav-settings = Nastavení
nav-profile = Profil
nav-security = Zabezpečení
nav-connected-services = Propojené služby
nav-data-collection = Sběr dat a jejich použití
nav-paid-subs = Předplatné
nav-email-comm = E-mailová sdělení

## Page2faChange

page-2fa-change-title = Změnit dvoufázové ověřování
page-2fa-change-success = Dvoufázové ověřování bylo aktualizováno
page-2fa-change-success-additional-message = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlaste pomocí nového dvoufázového ověření.
page-2fa-change-totpinfo-error = Při výměně vaší aplikace pro dvoufázové ověřování nastala chyba. Zkuste to znovu později.
page-2fa-change-qr-instruction = <strong>Krok 1:</strong> Naskenujte tento QR kód pomocí libovolné aplikace, jako je Duo nebo Google Authenticator. Tím se vytvoří nové připojení a všechna stará připojení přestanou fungovat.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Záložní ověřovací kódy
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Při výměně záložních ověřovacích kódů se vyskytl problém
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Při vytváření záložních ověřovacích kódů se vyskytl problém
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Záložní ověřovací kódy byly aktualizovány
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Záložní ověřovací kódy byly vytvořeny
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Uložte si je na místo, které si budete pamatovat. Vaše staré kódy budou nahrazeny po dokončení dalšího kroku.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Potvrďte uložení kódů zadáním jednoho z nich. Vaše staré záložní ověřovací kódy budou po dokončení tohoto kroku deaktivovány.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Nesprávný záložní ověřovací kód

## Page2faSetup

page-2fa-setup-title = Dvoufázové ověřování
page-2fa-setup-totpinfo-error = Při nastavování dvoufázového ověřování došlo k chybě. Zkuste to znovu později.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Tento kód není správný. Zkuste to znovu.
page-2fa-setup-success = Bylo povoleno dvoufázové ověřování
page-2fa-setup-success-additional-message = Pro ochranu všech vašich připojených zařízení byste se měli odhlásit všude, kde používáte tento účet, a poté se znovu přihlaste pomocí dvoufázového ověření.

## Avatar change page

avatar-page-title =
    .title = Profilový obrázek
avatar-page-add-photo = Přidat fotografii
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Pořídit fotografii
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Odstranit fotografii
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Znovu pořídit fotografii
avatar-page-cancel-button = Zrušit
avatar-page-save-button = Uložit
avatar-page-saving-button = Ukládání…
avatar-page-zoom-out-button =
    .title = Zmenšit
avatar-page-zoom-in-button =
    .title = Zvětšit
avatar-page-rotate-button =
    .title = Otočit
avatar-page-camera-error = Nepodařilo se inicializovat fotoaparát
avatar-page-new-avatar =
    .alt = nový profilový obrázek
avatar-page-file-upload-error-3 = Váš profilový obrázek se nepodařilo nahrát
avatar-page-delete-error-3 = Váš profilový obrázek se nepodařilo smazat
avatar-page-image-too-large-error-2 = Obrázek je pro nahrání příliš velký

## Password change page

pw-change-header =
    .title = Změna hesla
pw-8-chars = Alespoň 8 znaků
pw-not-email = Není vaše e-mailová adresa
pw-change-must-match = odpovídá potvrzení
pw-commonly-used = Není běžně používané heslo
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Nepřepoužívejte stejné heslo a přečtěte si další tipy pro <linkExternal>vytváření silných hesel</linkExternal>.
pw-change-cancel-button = Zrušit
pw-change-save-button = Uložit
pw-change-forgot-password-link = Zapomněli jste heslo?
pw-change-current-password =
    .label = Zadejte stávající heslo
pw-change-new-password =
    .label = Zadejte nové heslo
pw-change-confirm-password =
    .label = Potvrďte nové heslo
pw-change-success-alert-2 = Heslo změněno

## Password create page

pw-create-header =
    .title = Vytvoření hesla
pw-create-success-alert-2 = Heslo nastaveno
pw-create-error-2 = Vaše heslo se nepodařilo nastavit

## Delete account page

delete-account-header =
    .title = Smazat účet
delete-account-step-1-2 = Krok 1 ze 2
delete-account-step-2-2 = Krok 2 ze 2
delete-account-confirm-title-4 = Možná jste svůj { -product-mozilla-account(case: "acc", capitalization: "lower") }  připojili k jednomu nebo více z následujících produktů nebo služeb od { -brand-mozilla(case: "gen") }, které vám zajišťují bezpečnost a produktivitu na webu:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Synchronizují se údaje { -brand-firefox(case: "gen") }
delete-account-product-firefox-addons = Doplňky { -brand-firefox(case: "gen") }
delete-account-acknowledge = Potvrďte prosím, že berete na vědomí, že smazáním svého účtu:
delete-account-chk-box-1-v4 =
    .label = Veškeré placené předplatné, které máte, bude zrušeno.
delete-account-chk-box-2 =
    .label = V produktech { -brand-mozilla(case: "gen") } můžete přijít o uložené informace a funkce
delete-account-chk-box-3 =
    .label = Opětovná aktivace pomocí tohoto e-mailu nemusí obnovit vaše uložené informace
delete-account-chk-box-4 =
    .label = Všechna rozšíření a vzhledy vámi zveřejněná na serveru addons.mozilla.org budou smazána
delete-account-continue-button = Pokračovat
delete-account-password-input =
    .label = Zadejte heslo
delete-account-cancel-button = Zrušit
delete-account-delete-button-2 = Smazat

## Display name page

display-name-page-title =
    .title = Zobrazované jméno
display-name-input =
    .label = Zadejte zobrazované jméno
submit-display-name = Uložit
cancel-display-name = Zrušit
display-name-update-error-2 = Vaši zobrazované jméno se nepodařilo změnit
display-name-success-alert-2 = Zobrazované jméno aktualizováno

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Nedávná aktivita účtu
recent-activity-account-create-v2 = Účet vytvořen
recent-activity-account-disable-v2 = Účet deaktivován
recent-activity-account-enable-v2 = Účet povolen
recent-activity-account-login-v2 = Přihlašování pomocí účtu
recent-activity-account-reset-v2 = Spuštěno obnovení hesla
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = E-maily o nedoručení vymazány
recent-activity-account-login-failure = Pokus o přihlášení selhal
recent-activity-account-two-factor-added = Povoleno dvoufázové ověřování.
recent-activity-account-two-factor-requested = Vyžaduje se dvoufázové ověření
recent-activity-account-two-factor-failure = Dvoufázové ověření selhalo
recent-activity-account-two-factor-success = Dvoufázové ověření bylo úspěšné
recent-activity-account-two-factor-removed = Dvoufázové ověřování zrušeno
recent-activity-account-password-reset-requested = Vyžádáno obnovení hesla u účtu
recent-activity-account-password-reset-success = Obnovení hesla u účtu bylo úspěšné
recent-activity-account-recovery-key-added = Povolen obnovovací klíč k účtu
recent-activity-account-recovery-key-verification-failure = Ověření pomocí obnovovacího klíče selhalo
recent-activity-account-recovery-key-verification-success = Ověření obnovovacího klíče k účtu bylo úspěšné
recent-activity-account-recovery-key-removed = Odstraněn obnovovací klíč k účtu
recent-activity-account-password-added = Nastaveno nové heslo
recent-activity-account-password-changed = Heslo změněno
recent-activity-account-secondary-email-added = Přidán záložní e-mail
recent-activity-account-secondary-email-removed = Odebrán záložní e-mail
recent-activity-account-emails-swapped = Prohozen hlavní a záložní e-mail
recent-activity-session-destroy = Odhlášení z relace
recent-activity-account-recovery-phone-send-code = Obnovovací kód na telefonu byl odeslán
recent-activity-account-recovery-phone-setup-complete = Nastavení telefonu pro obnovení bylo dokončeno
recent-activity-account-recovery-phone-signin-complete = Přihlášení pomocí telefonního čísla pro obnovení bylo dokončeno
recent-activity-account-recovery-phone-signin-failed = Přihlášení pomocí telefonního čísla pro obnovení selhalo
recent-activity-account-recovery-phone-removed = Telefon pro obnovení byl odebrán
recent-activity-account-recovery-codes-replaced = Obnovovací kódy byly nahrazeny
recent-activity-account-recovery-codes-created = Obnovovací kódy byly vytvořeny
recent-activity-account-recovery-codes-signin-complete = Přihlášení pomocí obnovovacích kódů bylo dokončeno
recent-activity-password-reset-otp-sent = Potvrzovací kód pro obnovu hesla byl odeslán
recent-activity-password-reset-otp-verified = Potvrzovací kód pro obnovení hesla byl ověřen
recent-activity-must-reset-password = Je vyžadována obnova hesla
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Jiná aktivita u účtu

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Obnovovací klíč k účtu
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Zpět do nastavení

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Odebrat telefonní číslo pro obnovení
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Tímto odstraníte <strong>{ $formattedFullPhoneNumber }</strong> jako své telefonní číslo pro obnovení.
settings-recovery-phone-remove-recommend = Tuto metodu doporučujeme ponechat, protože je jednodušší než ukládání záložních ověřovacích kódů.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Pokud ji smažete, ujistěte se, že máte uložené záložní ověřovací kódy. <linkExternal>Porovnání metod obnovení</linkExternal>
settings-recovery-phone-remove-button = Odebrat telefonní číslo
settings-recovery-phone-remove-cancel = Zrušit
settings-recovery-phone-remove-success = Telefon pro obnovení byl odebrán

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Přidat telefon pro obnovení
page-change-recovery-phone = Změna telefonu pro obnovení
page-setup-recovery-phone-back-button-title = Zpět na nastavení
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Změna telefonního čísla

## Add secondary email page

add-secondary-email-step-1 = Krok 1 ze 2
add-secondary-email-error-2 = Při vytvoření tohoto e-mailu došlo k chybě
add-secondary-email-page-title =
    .title = Záložní e-mailová adresa
add-secondary-email-enter-address =
    .label = Zadejte e-mailovou adresu
add-secondary-email-cancel-button = Zrušit
add-secondary-email-save-button = Uložit
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = E-mailové masky nelze použít jako záložní e-mailovou adresu

## Verify secondary email page

add-secondary-email-step-2 = Krok 2 ze 2
verify-secondary-email-page-title =
    .title = Záložní e-mailová adresa
verify-secondary-email-verification-code-2 =
    .label = Zadejte potvrzovací kód
verify-secondary-email-cancel-button = Zrušit
verify-secondary-email-verify-button-2 = Potvrdit
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Zadejte prosím potvrzovací kód, který bude během 5 minut doručen na adresu <strong>{ $email }</strong>.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Adresa { $email } úspěšně přidána
verify-secondary-email-resend-code-button = Znovu odeslat potvrzovací kód

##

# Link to delete account on main Settings page
delete-account-link = Smazat účet
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Přihlášení bylo úspěšné. Váš { -product-mozilla-account(capitalization: "lower") } a jeho údaje zůstanou aktivní.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Zjistěte, kde jsou vaše soukromé informace vystaveny, a převezměte kontrolu
# Links out to the Monitor site
product-promo-monitor-cta = Zkontrolovat

## Profile section

profile-heading = Profil
profile-picture =
    .header = Obrázek
profile-display-name =
    .header = Zobrazované jméno
profile-primary-email =
    .header = Hlavní e-mailová adresa

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Krok { $currentStep } z { $numberOfSteps }.

## Security section of Setting

security-heading = Zabezpečení
security-password =
    .header = Heslo
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Vytvořeno { $date }
security-not-set = Nenastaveno
security-action-create = Vytvořit
security-set-password = Pro synchronizaci a některé bezpečnostní funkce vašeho účtu si nastavte heslo.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Zobrazit nedávnou aktivitu u účtu
signout-sync-header = Relace vypršela
signout-sync-session-expired = Omlouváme se, něco se pokazilo. Odhlaste se prosím z nabídky prohlížeče a zkuste to znovu.

## SubRow component

tfa-row-backup-codes-title = Záložní ověřovací kódy
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Žádné kódy nejsou k dispozici
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Zbývá { $numCodesAvailable } kód
        [few] Zbývající kódy: { $numCodesAvailable }
       *[other] Zbývající kódy: { $numCodesAvailable }
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Vytvořit nové kódy
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Přidat
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Pokud nemůžete použít mobilní zařízení nebo ověřovací aplikaci, je to nejbezpečnější způsob obnovy.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Telefon pro obnovení
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Nebylo přidáno žádné telefonní číslo
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Změnit
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Přidat
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Odebrat
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Odebrat telefon pro obnovení
tfa-row-backup-phone-delete-restriction-v2 = Pokud chcete odebrat telefon pro obnovení, přidejte nejprve záložní ověřovací kódy nebo vypněte dvoufázové ověřování, abyste se vyhnuli zablokování účtu.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Jedná se o nejjednodušší způsob obnovení, pokud nemůžete použít ověřovací aplikaci.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Další informace o riziku při výměně karty SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Vypnout
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Zapnout
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Odesílá se…
switch-is-on = zapnuto
switch-is-off = vypnuto

## Sub-section row Defaults

row-defaults-action-add = Přidat
row-defaults-action-change = Změnit
row-defaults-action-disable = Zakázat
row-defaults-status = Žádné

## Account recovery key sub-section on main Settings page

rk-header-1 = Obnovovací klíč k účtu
rk-enabled = Povoleno
rk-not-set = Není nastaven
rk-action-create = Vytvořit
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Změnit
rk-action-remove = Odebrat
rk-key-removed-2 = Obnovovací klíč k účtu byl odstraněn
rk-cannot-remove-key = Obnovovací klíč k vašemu účtu se nepodařilo odebrat.
rk-refresh-key-1 = Aktualizovat obnovovací klíč k účtu
rk-content-explain = Získejte přístup ke svým datům, pokud zapomenete své heslo.
rk-cannot-verify-session-4 = Omlouváme se, nastal problém s potvrzením vaší relace
rk-remove-modal-heading-1 = Odebrat obnovovací klíč k účtu?
rk-remove-modal-content-1 = Pokud obnovíte své heslo, nebudete už moci pro přístup ke svým datům použít svůj obnovovací klíč k účtu. Tuto akci nelze vzít zpět.
rk-remove-error-2 = Obnovovací klíč k vašemu účtu se nepodařilo odebrat
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Smazat obnovovací klíč k účtu

## Secondary email sub-section on main Settings page

se-heading = Záložní e-mailová adresa
    .header = Záložní e-mailová adresa
se-cannot-refresh-email = Obnovení tohoto e-mailu se nezdařilo.
se-cannot-resend-code-3 = Potvrzovací kód se nepodařilo znovu odeslat
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = Adresa je { $email } nyní nastavena jako vaše hlavní
se-set-primary-error-2 = Nepodařilo se změnit vaši hlavní e-mailovou adresu
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Adresa { $email } byla odebrána
se-delete-email-error-2 = Tuto e-mailovou adresu se nepodařilo odebrat
se-verify-session-3 = Pro provedení této akce je potřeba potvrdit vaši stávající relaci
se-verify-session-error-3 = Omlouváme se, nastal problém s potvrzením vaší relace
# Button to remove the secondary email
se-remove-email =
    .title = Odebrat e-mail
# Button to refresh secondary email status
se-refresh-email =
    .title = Obnovit e-mail
se-unverified-2 = nepotvrzeno
se-resend-code-2 =
    Je nutné potvrzení. Pokud jste potvrzovací kód nenašli v doručené ani nevyžádané
    poště, můžete ho nechat <button>znovu odeslat</button>.
# Button to make secondary email the primary
se-make-primary = Nastavit jako hlavní
se-default-content = Získejte přístup ke svému účtu, pokud se vám nepodaří přihlásit svým hlavním e-mailem.
se-content-note-1 = Poznámka: záložní e-mailová adresa neumožní obnovit vaše informace — na to budete potřebovat <a>obnovovací klíč k účtu</a>.
# Default value for the secondary email
se-secondary-email-none = Žádná

## Two Step Auth sub-section on Settings main page

tfa-row-header = Dvoufázové ověřování
tfa-row-enabled = Povoleno
tfa-row-disabled-status = Zakázáno
tfa-row-action-add = Přidat
tfa-row-action-disable = Vypnout
tfa-row-action-change = Změnit
tfa-row-button-refresh =
    .title = Obnovit nastavení dvoufázového ověřování
tfa-row-cannot-refresh = Nepodařilo se obnovit nastavení dvoufázového ověřování.
tfa-row-enabled-description = Váš účet je chráněn dvoufázovým ověřováním. Při přihlašování k účtu { -product-mozilla-account } musíte zadat jednorázový přístupový kód z ověřovací aplikace.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Jak to chrání váš účet
tfa-row-disabled-description-v2 = Pomozte zabezpečit svůj účet pomocí ověřovací aplikace třetí strany jakožto druhého kroku přihlášení.
tfa-row-cannot-verify-session-4 = Omlouváme se, nastal problém s potvrzením vaší relace
tfa-row-disable-modal-heading = Vypnout dvoufázové ověřování?
tfa-row-disable-modal-confirm = Vypnout
tfa-row-disable-modal-explain-1 =
    Tuto akci nelze vzít zpět. Máte také možnost
    <linkExternal>své záložní ověřovací kódy vyměnit</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Dvoufázové ověřování je vypnuto
tfa-row-cannot-disable-2 = Dvoufázové ověřování se nepodařilo vypnout
tfa-row-verify-session-info = Pro nastavení dvoufázového ověřování je potřeba potvrdit svou aktuální relaci

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Pokračováním souhlasíte s:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Podmínky poskytování služby</mozSubscriptionTosLink> a <mozSubscriptionPrivacyLink>Oznámení o ochraně osobních údajů</mozSubscriptionPrivacyLink> pro služby předplatného { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Podmínky poskytování služby</mozillaAccountsTos>a <mozillaAccountsPrivacy>Oznámení o ochraně osobních údajů</mozillaAccountsPrivacy> { -product-mozilla-accounts(case: "gen") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Pokračováním vyjadřujete souhlas s <mozillaAccountsTos>Podmínkami poskytování služby</mozillaAccountsTos> a <mozillaAccountsPrivacy>Oznámením o ochraně osobních údajů</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Nebo
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Přihlásit pomocí
continue-with-google-button = Pokračovat pomocí { -brand-google }
continue-with-apple-button = Pokračovat pomocí { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Neznámý účet
auth-error-103 = Nesprávné heslo
auth-error-105-2 = Špatný potvrzovací kód
auth-error-110 = Neplatný token
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Vyčerpali jste příliš mnoho pokusů. Prosím zkuste to znovu později.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Vyčerpali jste příliš mnoho pokusů. Zkuste to znovu { $retryAfter }.
auth-error-125 = Z bezpečnostních důvodů byl požadavek zablokován
auth-error-129-2 = Vložili jste neplatné telefonní číslo. Zkontrolujte ho a zkuste to znovu.
auth-error-138-2 = Nepotvrzená relace
auth-error-139 = Záložní e-mailová adresa musí být jiná než adresa účtu
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Tento e-mail je rezervován jiným účtem. Zkuste to znovu později nebo použijte jinou e-mailovou adresu.
auth-error-155 = TOTP token nenalezen
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Záložní ověřovací kód nebyl nalezen
auth-error-159 = Neplatný obnovovací klíč k účtu
auth-error-183-2 = Neplatný nebo starý potvrzovací kód
auth-error-202 = Funkce není povolena
auth-error-203 = Systém je nedostupný, zkuste to znovu později
auth-error-206 = Nepodařilo se vytvořit heslo, heslo je již nastaveno
auth-error-214 = Telefonní číslo pro obnovení už existuje
auth-error-215 = Telefonní číslo pro obnovení neexistuje
auth-error-216 = Dosažen limit textových zpráv
auth-error-218 = Telefon pro obnovení nelze odebrat. Chybí záložní ověřovací kódy.
auth-error-219 = K tomuto telefonnímu číslu je již zaregistrováno příliš mnoho účtů. Zkuste prosím jiné číslo.
auth-error-999 = Neočekávaná chyba
auth-error-1001 = Pokus o přihlášení zrušen
auth-error-1002 = Relace vypršela. Pro pokračování se přihlaste.
auth-error-1003 = Místní úložiště nebo cookies jsou stále zakázány
auth-error-1008 = Vaše staré a nové heslo nesmí být stejné
auth-error-1010 = Je požadováno platné heslo
auth-error-1011 = Je požadován platný e-mail
auth-error-1018 = Váš potvrzovací e-mail byl právě vrácen. Nesprávně zadaný e-mail?
auth-error-1020 = Chybně zadaný e-mail? firefox.com není platná e-mailová služba
auth-error-1031 = Pro registraci musíte zadat svůj věk
auth-error-1032 = Pro registraci musíte zadat platný věk
auth-error-1054 = Neplatný kód pro dvoufázové ověření
auth-error-1056 = Neplatný záložní ověřovací kód
auth-error-1062 = Neplatné přesměrování
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Chybně zadaný e-mail? { $domain } není platná e-mailová služba
auth-error-1066 = E-mailové masky nelze použít k vytvoření účtu.
auth-error-1067 = Chybně zadaný e-mail?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Číslo končící na { $lastFourPhoneNumber }
oauth-error-1000 = Nastala nespecifikovaná chyba. Zavřete prosím tento panel a zkuste to znovu.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Jste přihlášen(a) do { -brand-firefox(case: "gen") }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = E-mail potvrzen
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Přihlášení potvrzeno
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Pro dokončení nastavení se přihlaste do { -brand-firefox(case: "gen") }
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Přihlásit se
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Potřebujete přidat zařízení? Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } na jiném zařízení
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } na jiném zařízení
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Chcete mít své panely, záložky a hesla na dalším zařízení?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Připojte další zařízení
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Teď ne
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } pro Android
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Pro dokončení nastavení se přihlaste k { -brand-firefox(case: "dat") } pro iOS

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Je vyžadováno místní úložiště a cookies
cookies-disabled-enable-prompt-2 = Abyste mohli používat { -product-mozilla-account(case: "acc", capitalization: "lower") }, povolte prosím cookies a local storage. Díky tomu si vás budeme moci zapamatovat mezi jednotlivými relacemi.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Zkusit znovu
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Zjistit více

## Index / home page

index-header = Zadejte svoji e-mailovou adresu
index-sync-header = Pokračovat do svého { -product-mozilla-account(case: "gen", capitalization: "lower") }
index-sync-subheader = Synchronizujte svá hesla, panely a záložky všude, kde používáte { -brand-firefox }.
index-relay-header = Vytvoření e-mailové masky
index-relay-subheader = Uveďte e-mailovou adresu, na kterou chcete přeposílat e-maily z maskovaného e-mailu.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Pokračovat do služby { $serviceName }
index-subheader-default = Pokračujte do nastavení účtu
index-cta = Přihlásit nebo registrovat
index-account-info = { -product-mozilla-account } odemyká přístup k dalším produktům { -brand-mozilla(case: "gen") }, které chrání soukromí.
index-email-input =
    .label = Zadejte svoji e-mailovou adresu
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Účet byl úspěšně smazán
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Odeslaná potvrzující e-mailová zpráva se právě vrátila zpět. Nemáte překlep v e-mailové adrese?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Jejda! Obnovovací klíč se pro váš účet nepodařilo vytvořit. Zkuste to prosím znovu později.
inline-recovery-key-setup-recovery-created = Obnovovací klíč k účtu byl vytvořen
inline-recovery-key-setup-download-header = Zabezpečte svůj účet
inline-recovery-key-setup-download-subheader = Stáhněte a uložte jej
inline-recovery-key-setup-download-info = Uložte si tento klíč na místo, které si budete pamatovat — později se na tuto stránku nebudete moci vrátit.
inline-recovery-key-setup-hint-header = Bezpečnostní doporučení

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Zrušit nastavení
inline-totp-setup-continue-button = Pokračovat
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Přidejte do svého účtu další úroveň zabezpečení tím, že budete vyžadovat ověřovací kódy z jedné z <authenticationAppsLink>těchto ověřovacích aplikací</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Povolte dvoufázové ověření <span>a pokračujte do nastavení účtu</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Povolte dvoufázové ověření <span>a pokračujte do služby { $serviceName }</span>
inline-totp-setup-ready-button = Připraveno
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Naskenujte ověřovací kód <span>a pokračujte do služby { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Ručně zadejte kód <span>a pokračujte do služby { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Naskenujte ověřovací kód a <span>pokračujte do nastavení účtu</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Ručně zadejte kód a <span>pokračujte do nastavení účtu</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Zadejte tento tajný klíč do aplikace pro ověřování. <toggleToQRButton>Naskenovat místo toho QR kód?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Naskenujte QR kód ve své ověřovací aplikaci, a poté zadejte ověřovací kód, který poskytuje. <toggleToManualModeButton>Nemůžete naskenovat kód?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Po dokončení začne generovat ověřovací kódy, které můžete zadat.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Ověřovací kód
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Je vyžadován ověřovací kód
tfa-qr-code-alt = Pro nastavení dvoufázového ověřování v podporovaných aplikacích použijte kód { $code }.
inline-totp-setup-page-title = Dvoufázové ověřování

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Právní informace
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Podmínky služby
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Zásady ochrany osobních údajů

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Zásady ochrany osobních údajů

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Podmínky služby

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Přihlásili jste se právě do { -product-firefox(case: "gen") }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Ano, schválit zařízení
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Pokud jste to nebyli vy, <link>změňte si heslo</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Zařízení připojeno
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Nyní synchronizujete: { $deviceFamily } ({ $deviceOS })
pair-auth-complete-sync-benefits-text = Nyní máte přístup k otevřeným panelům, heslům a záložkám na všech svých zařízeních.
pair-auth-complete-see-tabs-button = Zobrazit panely ze synchronizovaných zařízení
pair-auth-complete-manage-devices-link = Správa zařízení

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Zadejte ověřovací kód <span>pro pokračování do nastavení účtu</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Zadejte ověřovací kód <span>a pokračujte do služby { $serviceName }</span>
auth-totp-instruction = Otevřete svoji ověřovací aplikaci a zadejte ověřovací kód, který vám poskytne.
auth-totp-input-label = Zadejte šestimístný kód
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Potvrdit
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Je vyžadován ověřovací kód

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Je požadováno schválení <span>z vašeho dalšího zařízení</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Párování se nezdařilo
pair-failure-message = Nastavování bylo ukončeno.

## Pair index page

pair-sync-header = Synchronizujte { -brand-firefox(case: "acc") }  se svým telefonem či tabletem
pair-cad-header = Připojit { -brand-firefox } na jiném zařízení
pair-already-have-firefox-paragraph = Už máte { -brand-firefox } na telefonu nebo tabletu?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Synchronizovat zařízení
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Nebo stáhnout
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Naskenujte a stáhněte si { -brand-firefox } pro mobil, nebo si pošlete <linkExternal>odkaz ke stažení</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Teď ne
pair-take-your-data-message = Vezměte si své panely, záložky a hesla všude tam, kde používáte { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Začít
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR kód

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Zařízení připojeno
pair-success-message-2 = Párování dokončeno.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Potvrdit párování <span>pro { $email }</span>
pair-supp-allow-confirm-button = Potvrdit párování
pair-supp-allow-cancel-link = Zrušit

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Je požadováno schválení <span>z vašeho dalšího zařízení</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Spárovat pomocí aplikace
pair-unsupported-message = Použili jste systémový fotoaparát? Párování je potřeba zahájit z { -brand-firefox(case: "gen") }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Pro potřeby synchronizace si vytvořte heslo
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Tím se vaše data zašifrují. Musí se lišit od hesla k účtu { -brand-google } nebo { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Čekejte prosím, budete přesměrováni na autorizovanou aplikaci.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Zadejte váš obnovovací klíč k účtu
account-recovery-confirm-key-instruction = Tento klíč obnovuje vaše zašifrovaná data o prohlížení, jako jsou hesla a záložky, ze serverů { -brand-firefox(case: "gen") }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Zadejte 32místný obnovovací klíč
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Vaše nápověda k uložení je:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Pokračovat
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Nemůžete najít svůj obnovovací klíč k účtu?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Vytvořte si nové heslo
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Heslo nastaveno
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Vaše heslo se nepodařilo nastavit
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Použít obnovovací klíč
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Vaše heslo bylo obnoveno.
reset-password-complete-banner-message = Abyste předešli budoucím problémům s přihlášením, nezapomeňte si v nastavení { -product-mozilla-account(case: "gen", capitalization: "lower") } vygenerovat nový obnovovací klíč k účtu.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Zadejte 10místný kód
confirm-backup-code-reset-password-confirm-button = Potvrdit
confirm-backup-code-reset-password-subheader = Zadejte záložní ověřovací kód
confirm-backup-code-reset-password-instruction = Zadejte jeden z jednorázových kódů, které jste uložili při nastavení dvoufázového ověřování.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Ztratili jste přístup?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Zkontrolujte svou e-mailovou schránku
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Potvrzovací kód jsme odeslali na adresu <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Zadejte 8místný kód do 10 minut
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Pokračovat
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Znovu odeslat kód
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Použít jiný účet

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Obnovit heslo
confirm-totp-reset-password-subheader-v2 = Zadejte kód pro dvoufázové ověření
confirm-totp-reset-password-instruction-v2 = Pro obnovení hesla se podívejte do své <strong>ověřovací aplikace</strong>.
confirm-totp-reset-password-trouble-code = Problém se zadáváním kódu?
confirm-totp-reset-password-confirm-button = Potvrdit
confirm-totp-reset-password-input-label-v2 = Zadejte šestimístný kód
confirm-totp-reset-password-use-different-account = Použít jiný účet

## ResetPassword start page

password-reset-flow-heading = Obnovení hesla
password-reset-body-2 = Abychom mohli vést váš účet v bezpečí, požádáme vás o několik věcí, které znáte jen vy.
password-reset-email-input =
    .label = Zadejte svoji e-mailovou adresu
password-reset-submit-button-2 = Pokračovat

## ResetPasswordConfirmed

reset-password-complete-header = Vaše heslo bylo obnoveno
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Pokračovat do služby { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Obnovit heslo
password-reset-recovery-method-subheader = Vyberte způsob obnovení
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Ujistěte se, že jste to vy, kdo používá vaše metody obnovy.
password-reset-recovery-method-phone = Telefon pro obnovení
password-reset-recovery-method-code = Záložní ověřovací kódy
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Zbývá { $numBackupCodes } kód
        [few] Zbývají { $numBackupCodes } kódy
       *[other] Zbývá { $numBackupCodes } kódů
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Došlo k problému s odesláním kódu do telefonu pro obnovení
password-reset-recovery-method-send-code-error-description = Zkuste to prosím později nebo použijte záložní ověřovací kódy.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Obnovit heslo
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Zadejte obnovovací kód
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Na telefonní číslo končící číslicemi <span>{ $lastFourPhoneDigits }</span> byl odeslán šestimístný kód formou textové zprávy. Tento kód vyprší po 5 minutách. Tento kód s nikým nesdílejte.
reset-password-recovery-phone-input-label = Zadejte šestimístný kód
reset-password-recovery-phone-code-submit-button = Potvrdit
reset-password-recovery-phone-resend-code-button = Znovu odeslat kód
reset-password-recovery-phone-resend-success = Kód byl odeslán
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Ztratili jste přístup?
reset-password-recovery-phone-send-code-error-heading = Při odesílání kódu se vyskytl problém
reset-password-recovery-phone-code-verification-error-heading = Váš kód se nepodařilo ověřit
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Prosím zopakujte pokus později
reset-password-recovery-phone-invalid-code-error-description = Kód je neplatný nebo jeho platnost vypršela.
reset-password-recovery-phone-invalid-code-error-link = Chcete místo toho použít záložní ověřovací kódy?
reset-password-with-recovery-key-verified-page-title = Heslo bylo úspěšně obnoveno
reset-password-complete-new-password-saved = Nové heslo uloženo!
reset-password-complete-recovery-key-created = Nový obnovovací klíč k účtu byl vytvořen. Stáhněte si ho a uložte.
reset-password-complete-recovery-key-download-info = Tento klíč je nezbytný pro obnovu dat v případě, že zapomenete své heslo. <b>Hned si ho stáhněte a bezpečně uložte, později už k němu nebudete moci přistupovat.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Chyba:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Ověřuje se přihlášení…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Chyba při potvrzení
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Platnost odkazu pro potvrzení vypršela
signin-link-expired-message-2 = Odkaz, na který jste klepli, vypršel nebo byl již použit.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Zadejte své heslo <span>k účtu { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Pokračovat do služby { $serviceName }
signin-subheader-without-logo-default = Pokračujte do nastavení účtu
signin-button = Přihlásit se
signin-header = Přihlásit se
signin-use-a-different-account-link = Použít jiný účet
signin-forgot-password-link = Zapomněli jste heslo?
signin-password-button-label = Heslo
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.
signin-code-expired-error = Platnost kódu vypršela. Přihlaste se prosím znovu.
signin-account-locked-banner-heading = Obnovit heslo
signin-account-locked-banner-description = Váš účet jsme uzamkli, abychom ho ochránili před podezřelou aktivitou.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Před přihlášením si obnovte heslo

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = V odkazu, na který jste klepli, chyběly znaky a váš e-mailový klient jej mohl poškodit. Pečlivě si adresu zkopírujte a zkuste to znovu.
report-signin-header = Nahlásit neoprávněné přihlášení?
report-signin-body = Obdrželi jste e-mail o pokusu o přihlášení k vašemu účtu. Chcete tuto aktivitu nahlásit jako podezřelou?
report-signin-submit-button = Nahlásit aktivitu
report-signin-support-link = Proč se to stalo?
report-signin-error = Omlouváme se, ale při odesílání hlášení nastal problém.
signin-bounced-header = Omlouváme se, váš účet byl uzamčen.
# $email (string) - The user's email.
signin-bounced-message = Potvrzovací e-mail, který jsme poslali na adresu { $email }, se vrátil zpět. Uzamkli jsme proto váš účet, abychom ochránili vaše data { -brand-firefox(case: "gen") }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Pokud se jedná o platnou e-mailovou adresu, <linkExternal>dejte nám vědět</linkExternal> a my vám pomůžeme odemknout váš účet.
signin-bounced-create-new-account = Už tento e-mail nevlastníte? Vytvořte si nový účet
back = Zpět

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = <span>Pro pokračování do nastavení účtu</span> ověřte toto přihlášení
signin-push-code-heading-w-custom-service = Ověřit toto přihlášení <span>a pokračovat do služby { $serviceName }</span>
signin-push-code-instruction = Zkontrolujte prosím svá ostatní zařízení a schvalte toto přihlášení z prohlížeče { -brand-firefox }.
signin-push-code-did-not-recieve = Nedostali jste oznámení?
signin-push-code-send-email-link = Odeslat kód na e-mail

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Potvrďte své přihlášení
signin-push-code-confirm-description = Zjistili jsme pokus o přihlášení z následujícího zařízení. Pokud jste to byli vy, potvrďte přihlášení
signin-push-code-confirm-verifying = Ověřuje se
signin-push-code-confirm-login = Potvrdit přihlášení
signin-push-code-confirm-wasnt-me = Toto nebylo mé přihlášení, změnit heslo.
signin-push-code-confirm-login-approved = Vaše přihlášení bylo schváleno. Zavřete prosím toto okno.
signin-push-code-confirm-link-error = Odkaz je poškozen. Zkuste to prosím znovu.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Přihlásit se
signin-recovery-method-subheader = Vyberte způsob obnovení
signin-recovery-method-details = Ujistěte se, že jste to vy, kdo používá vaše metody obnovy.
signin-recovery-method-phone = Telefon pro obnovení
signin-recovery-method-code-v2 = Záložní ověřovací kódy
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Zbývá { $numBackupCodes } kód
        [few] Zbývá { $numBackupCodes } kódy
       *[other] Zbývá { $numBackupCodes } kódů
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Nepodařilo se odeslat kód na vaše telefonní číslo
signin-recovery-method-send-code-error-description = Zkuste to prosím později nebo použijte záložní ověřovací kódy.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Přihlásit se
signin-recovery-code-sub-heading = Zadejte záložní ověřovací kód
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Zadejte jeden z jednorázových kódů, které jste uložili při nastavení dvoufázového ověřování.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Zadejte 10místný kód
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Potvrdit
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Použít telefon pro obnovení
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Ztratili jste přístup?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Je vyžadován záložní ověřovací kód
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Došlo k problému s odesláním kódu do telefonu pro obnovení
signin-recovery-code-use-phone-failure-description = Zkuste to prosím později.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Přihlásit se
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Zadejte obnovovací kód
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Na telefonní číslo končící číslicemi <span>{ $lastFourPhoneDigits }</span> byl odeslán šestimístný kód formou textové zprávy. Tento kód vyprší po 5 minutách. Tento kód s nikým nesdílejte.
signin-recovery-phone-input-label = Zadejte šestimístný kód
signin-recovery-phone-code-submit-button = Potvrdit
signin-recovery-phone-resend-code-button = Znovu odeslat kód
signin-recovery-phone-resend-success = Kód byl odeslán
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Ztratili jste přístup?
signin-recovery-phone-send-code-error-heading = Při odesílání kódu se vyskytl problém
signin-recovery-phone-code-verification-error-heading = Váš kód se nepodařilo ověřit
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Prosím zopakujte pokus později
signin-recovery-phone-invalid-code-error-description = Kód je neplatný nebo jeho platnost vypršela.
signin-recovery-phone-invalid-code-error-link = Chcete místo toho použít záložní ověřovací kódy?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Přihlášení bylo úspěšné. Při opětovném použití svého telefonu pro obnovení mohou platit omezení.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Děkujeme za vaši ostražitost
signin-reported-message = Náš tým byl upozorněn. Zprávy jako tato nám pomáhají odrážet útočníky.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Zadejte potvrzovací kód<span> pro váš { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Vložte během 5 minut kód, který vám byl zaslán na <email>{ $email }</email>.
signin-token-code-input-label-v2 = Zadejte šestimístný kód
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Potvrdit
signin-token-code-code-expired = Platnost kódu vypršela?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Zaslat e-mailem nový kód.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Je vyžadován potvrzovací kód
signin-token-code-resend-error = Něco se pokazilo. Nový kód se nepodařilo odeslat.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Přihlásit se
signin-totp-code-subheader-v2 = Zadejte kód pro dvoufázové ověření
signin-totp-code-instruction-v4 = Podívejte se do své <strong>ověřovací aplikace</strong> a potvrďte přihlášení.
signin-totp-code-input-label-v4 = Zadejte šestimístný kód
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Proč jste požádáni o ověření?
signin-totp-code-aal-banner-content = Pro váš účet jste nastavili dvoufázové ověřování, ale zatím jste se na tomto zařízení nepřihlásili pomocí kódu.
signin-totp-code-aal-sign-out = Odhlásit se na tomto zařízení
signin-totp-code-aal-sign-out-error = Omlouváme se, došlo k problému s odhlášením.
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Potvrdit
signin-totp-code-other-account-link = Použít jiný účet
signin-totp-code-recovery-code-link = Problém se zadáváním kódu?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Je vyžadován ověřovací kód
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Autorizovat toto přihlášení
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Zkontrolujte autorizační kód, který jsme poslali na adresu { $email }.
signin-unblock-code-input = Zadejte autorizační kód
signin-unblock-submit-button = Pokračovat
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Je vyžadován autorizační kód
signin-unblock-code-incorrect-length = Autorizační kód musí obsahovat 8 znaků
signin-unblock-code-incorrect-format-2 = Autorizační kód může obsahovat pouze písmena a/nebo čísla
signin-unblock-resend-code-button = Žádný email jste neobdrželi? Znovu odeslat
signin-unblock-support-link = Proč se to stalo?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Zadejte potvrzovací kód
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Zadejte potvrzovací kód<span>pro svůj { -product-mozilla-account(case: "acc", capitalization: "lower") }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Vložte během 5 minut kód, který vám byl zaslán na <email>{ $email }</email>.
confirm-signup-code-input-label = Zadejte šestimístný kód
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Potvrdit
confirm-signup-code-sync-button = Spusťte synchronizaci
confirm-signup-code-code-expired = Platnost kódu vypršela?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Zaslat e-mailem nový kód.
confirm-signup-code-success-alert = Účet byl úspěšně potvrzen
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Je vyžadován potvrzovací kód
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } se vás pokusí po přihlášení přesměrovat na e-mailovou masku.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Vytvoření hesla
signup-relay-info = Heslo je potřeba pro bezpečnou správu e-mailových masek a pro přístup k bezpečnostním nástrojům { -brand-mozilla(case: "gen") }.
signup-sync-info = Synchronizujte svá hesla, záložky a další data všude, kde používáte { -brand-firefox }.
signup-sync-info-with-payment = Synchronizujte svá hesla, platební metody, záložky a další svá data všude, kde používáte { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Změna e-mailu

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Synchronizace je zapnuta
signup-confirmed-sync-success-banner = { -product-mozilla-account } potvrzen
signup-confirmed-sync-button = Začít prohlížet
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Vaše hesla, platební metody, adresy, záložky, historie a další data se mohou synchronizovat všude, kde používáte { -brand-firefox }.
signup-confirmed-sync-description-v2 = Vaše hesla, adresy, záložky, historie a další data se mohou synchronizovat všude, kde používáte { -brand-firefox }.
signup-confirmed-sync-add-device-link = Přidat další zařízení
signup-confirmed-sync-manage-sync-button = Správa synchronizace
signup-confirmed-sync-set-password-success-banner = Heslo pro synchronizaci vytvořeno
