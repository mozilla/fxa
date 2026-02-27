# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Рамзи нав ба почтаи электронии шумо фиристода шуд.
resend-link-success-banner-heading = Пайванди нав ба почтаи электронии шумо фиристода шуд.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Барои таъмин кардани интиқоли мунтазами паёмҳои электронӣ, «{ $accountsEmail }»-ро ба тамосҳои худ илова намоед.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Пӯшидани баннер
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = Дар санаи 1-уми ноябри соли ҷорӣ номи маҳсули «{ -product-firefox-accounts }» ба номи «{ -product-mozilla-accounts }» иваз карда мешавад
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Шумо ҳамоно бо ҳамон номи корбар ва ниҳонвожаи худ ворид мешавед, ва ягон тағйироти дигар дар маҳсулоте, ки шумо истифода мебаред, пешбинӣ нашудааст.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Мо номи маҳсули «{ -product-firefox-accounts }»-ро ба номи «{ -product-mozilla-accounts }» иваз кардем. Шумо ҳамоно бо ҳамон номи корбар ва ниҳонвожаи худ ворид мешавед, ва ягон тағйироти дигар дар маҳсулоте, ки шумо истифода мебаред, пешбинӣ нашудааст.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Маълумоти бештар
# Alt text for close banner image
brand-close-banner =
    .alt = Пӯшидани баннер
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Тамғаи «m - { -brand-mozilla }»

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Ба қафо
button-back-title = Ба қафо

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Боргирӣ кунед ва идома диҳед
    .title = Боргирӣ кунед ва идома диҳед
recovery-key-pdf-heading = Калиди барқарорсозии ҳисоб
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Эҷодшуда: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Калиди барқарорсозии ҳисоб
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Агар шумо ниҳонвожаи худро фаромӯш кунед, ин калид ба шумо имкон медиҳад, ки маълумоти рамзгузоришудаи браузерро (аз он ҷумла, ниҳонвожаҳо, хатбаракҳо ва таърихи тамошобинӣ) барқарор кунед. Онро дар ҷойе нигоҳ доред, ки ба ёд меоред.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Ҷойҳо барои нигоҳ доштани калиди шумо
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Маълумоти бештар дар бораи калиди барқарорсозии ҳисоби худ
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Мутаассифона, ҳангоми боргирӣ кардани калиди барқарорсозии ҳисоби шумо мушкилие ба миён омад.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Аз «{ -brand-mozilla }» ҳарчи бештар ба даст оред:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Хабарҳо ва навигариҳои охирини маҳсулоти моро қабул намоед
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Дастрасии пешакӣ барои озмоиши маҳсулоти нав
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Огоҳиҳои фаврӣ барои барқарорсозии дастрасӣ ба Интернет

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Боргиришуда
datablock-copy =
    .message = Нусхабардошташуда
datablock-print =
    .message = Чопшуда

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Рамз нусха бардошта шуд
       *[other] Рамзҳо нусха бардошта шуданд
    }
datablock-download-success =
    { $count ->
        [one] Рамз боргирӣ карда шуд
       *[other] Рамзҳо боргирӣ карда шуданд
    }
datablock-print-success =
    { $count ->
        [one] Рамз чоп карда шуд
       *[other] Рамзҳо чоп карда шуданд
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Нусха бардошта шуд

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (тақрибан)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (тақрибан)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (тақрибан)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (тақрибан)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Ҷойгиршавӣ номаълум аст
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } дар { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Нишонии «IP»: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Ниҳонвожа
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Ниҳонвожаро такрор кунед
form-password-with-inline-criteria-signup-submit-button = Эҷод кардани ҳисоб
form-password-with-inline-criteria-reset-new-password =
    .label = Ниҳонвожаи нав
form-password-with-inline-criteria-confirm-password =
    .label = Ниҳонвожаро тасдиқ намоед
form-password-with-inline-criteria-reset-submit-button = Ниҳонвожаи наверо эҷод намоед
form-password-with-inline-criteria-match-error = Ниҳонвожаҳо мувофиқат намекунанд
form-password-with-inline-criteria-sr-too-short-message = Ниҳонвожа бояд на камтар аз 8 аломат дошта бошад.
form-password-with-inline-criteria-sr-not-email-message = Ниҳонвожаи шумо набояд нишонии почтаи электронии шуморо дар бар гирад.
form-password-with-inline-criteria-sr-not-common-message = Ниҳонвожа набояд аз ниҳонвожаҳои маъмул истифода шавад.
form-password-with-inline-criteria-sr-requirements-met = Ниҳонвожаи воридшуда ба ҳамаи талаботи ниҳонвожаҳо мутобиқат мекунад.
form-password-with-inline-criteria-sr-passwords-match = Ниҳонвожаҳои воридшуда мувофиқат мекунанд.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Ин майдон ҳатмӣ аст.

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Барои идома додан, рамзи { $codeLength }-рақамаро ворид кунед
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Барои идома додан, рамзеро дорои { $codeLength } аломат ворид кунед

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Калиди барқарорсозии ҳисоби «{ -brand-firefox }»
get-data-trio-title-backup-verification-codes = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният
get-data-trio-download-2 =
    .title = Боргирӣ кардан
    .aria-label = Боргирӣ кардан
get-data-trio-copy-2 =
    .title = Нусха бардоштан
    .aria-label = Нусха бардоштан
get-data-trio-print-2 =
    .title = Чоп кардан
    .aria-label = Чоп кардан

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Огоҳӣ
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Диққат
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Огоҳӣ
authenticator-app-aria-label =
    .aria-label = Барномаи санҷиши ҳаққоният
backup-codes-icon-aria-label-v2 =
    .aria-label = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққониятнусхаи эҳтиётии рамзи санҷиши ҳаққоният фаъол шуд
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққониятнусхаи эҳтиётии рамзи санҷиши ҳаққоният ғайрифаъол шуд
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Барқарорсозӣ тавассути паёмҳои «SMS» фаъол аст
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Барқарорсозӣ тавассути паёмҳои «SMS» ғайрифаъол аст
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Парчами Канада
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Ба қайд гирифтан
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Тайёр!
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Фаъол аст
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Пӯшидани паём
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Рамз
error-icon-aria-label =
    .aria-label = Хато
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Маълумот
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Парчами Иёлоти Муттаҳидаи Амрико

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Компютер ва телефони мобилӣ бо тасвири дили шикаста дар ҳар яке онҳо.
hearts-verified-image-aria-label =
    .aria-label = Компютер, телефони мобилӣ ва планшете, ки дар ҳар яке онҳо дил набз мезанад
signin-recovery-code-image-description =
    .aria-label = Ҳуҷҷате, ки дорои матни ноаён мебошад.
signin-totp-code-image-label =
    .aria-label = Дастгоҳе, ки дорои рамзи 6-рақамаи ноаён мебошад.
confirm-signup-aria-label =
    .aria-label = Лифофае, ки дорои пайванд мебошад
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Тасвир барои муаррифӣ кардани калиди барқарорсозии ҳисоб.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Тасвир барои муаррифӣ кардани калиди барқарорсозии ҳисоб.
password-image-aria-label =
    .aria-label = Тасвир барои муаррифӣ кардани тарзи вориди ниҳонвожа.
lightbulb-aria-label =
    .aria-label = Тасвир барои муаррифӣ кардани эҷоди маслиҳати захирагоҳ.
email-code-image-aria-label =
    .aria-label = Тасвир барои муаррифӣ кардани паёми почтаи электроние, ки дорои рамз мебошад.
recovery-phone-image-description =
    .aria-label = Дастгоҳи мобилие, ки рамзро тавассути паёми матнӣ қабул мекунад.
recovery-phone-code-image-description =
    .aria-label = Рамзе, ки дар дастгоҳи мобилӣ қабул карда шуд.
backup-recovery-phone-image-aria-label =
    .aria-label = Дастгоҳи мобилӣ бо имкониятҳои интиқоли паёмҳои матнии «SMS»
backup-authentication-codes-image-aria-label =
    .aria-label = Экрани дастгоҳ бо рамзҳо
sync-clouds-image-aria-label =
    .aria-label = Абрҳо бо нишонаи ҳамоҳангсозӣ

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Шумо ба «{ -brand-firefox }» ворид шудаед.
inline-recovery-key-setup-create-header = Ҳисоби худро муҳофизат кунед
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Оё шумо як дақиқа вақт ҷудо мекунед, то маълумоти шахсии худро ҳифз кунед?
inline-recovery-key-setup-start-button = Эҷод кардани калиди барқарорсозии ҳисоб
inline-recovery-key-setup-later-button = Онро дертар иҷро намоед

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Пинҳон кардани ниҳонвожа
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Нишон додани ниҳонвожа
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Дар айни ҳол ниҳонвожаи шумо дар экран намоён аст.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Дар айни ҳол ниҳонвожаи шумо ноаён аст.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Акнун ниҳонвожаи шумо дар экран намоён аст.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Акнун ниҳонвожаи шумо ноаён аст.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Интихоби кишвар
input-phone-number-enter-number = Рақами телефонро ворид намоед
input-phone-number-country-united-states = Иёлоти Муттаҳидаи Амрико
input-phone-number-country-canada = Канада
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Ба қафо

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Пайванди барқарорсозии ниҳонвожа вайрон шуд
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Пайванди тасдиқ вайрон шуд
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Пайванд вайрон шуд

## LinkRememberPassword component

# link navigates to the sign in page
remember-password-signin-link = Ворид шудан

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Почтаи электронии асосӣ алакай тасдиқ карда шуд

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-passwords-match = Ниҳонвожаҳо мувофиқат мекунанд

## Notification Promo Banner component

account-recovery-notification-cta = Эҷод кардан
recovery-phone-promo-cta = Илова кардани телефони барқарорсозӣ

## Ready component

manage-your-account-button = Идоракунии ҳисоби худ
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Ҳисоби шумо омода аст!
ready-continue = Идома додан
sign-in-complete-header = Воридшавӣ тасдиқ карда шуд
sign-up-complete-header = Ҳисоб тасдиқ карда шуд
primary-email-verified-header = Почтаи электронии асосӣ тасдиқ карда шуд

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Ҷойҳо барои нигоҳ доштани калиди шумо:
flow-recovery-key-download-storage-ideas-pwd-manager = Мудири ниҳонвожаҳо

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Анҷом додан

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Огоҳӣ
password-reset-chevron-expanded = Печондани огоҳӣ
password-reset-chevron-collapsed = Баркушодани огоҳӣ
password-reset-warning-have-key = Калиди барқарорсозии ҳисоб надоред?

## Alert Bar

alert-bar-close-message = Пӯшидани паём

## User's avatar

avatar-your-avatar =
    .alt = Аватари шумо
avatar-default-avatar =
    .alt = Аватари пешфарз

##


# BentoMenu component

bento-menu-title-3 = Маҳсулоти «{ -brand-mozilla }»
bento-menu-tagline = Маҳсулоти бештар аз «{ -brand-mozilla }», ки махфияти шуморо муҳофизат мекунанд
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Браузери «{ -brand-firefox }» барои мизи корӣ
bento-menu-firefox-mobile = Браузери «{ -brand-firefox }» барои дастгоҳи мобилӣ
bento-menu-made-by-mozilla = Аз ҷониби «{ -brand-mozilla }» сохта шудааст

## Connected services section

cs-heading = Хизматрасониҳои пайвастшуда

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Ҳамин дастгоҳ:
cs-disconnect-sync-opt-suspicious = Шубҳанок
cs-disconnect-sync-opt-lost = Гумшуда ё дуздидашуда
cs-disconnect-sync-opt-old = Куҳна ё ивазшуда
cs-disconnect-sync-opt-duplicate = Такроран истифода мешавад

##

cs-disconnect-advice-confirm = Хуб, фаҳмидам
cs-disconnect-lost-advice-heading = Пайвасти дастгоҳи гумшуда ё дуздидашуда ҷудо карда шудааст
cs-disconnect-suspicious-advice-heading = Пайвасти дастгоҳи шубҳанок ҷудо карда шудааст
cs-sign-out-button = Баромад

## Data collection section

dc-heading = Ҷамъоварӣ ва истифодабарии маълумот
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Браузери «{ -brand-firefox }»
dc-learn-more = Маълумоти бештар

# DropDownAvatarMenu component

drop-down-menu-title-2 = Менюи «{ -product-mozilla-account }»
drop-down-menu-sign-out = Баромад

## Flow Container

flow-container-back = Ба қафо

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-input-label = Ниҳонвожаи худро ворид намоед
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Эҷод кардани калиди барқарорсозии ҳисоб
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Эҷод кардани калиди нави барқарорсозии ҳисоб

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Калиди барқарорсозии ҳисоб эҷод шудааст — Онро ҳозир боргирӣ карда, нигоҳ доред
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Бе боргирӣ идома диҳед

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Калиди барқарорсозии ҳисоб эҷод карда шуд

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Иваз кардани калиди барқарорсозии ҳисоби худ
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Оғози кор
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Бекор кардан

## FlowSetup2faApp

flow-setup-2fa-manual-key-heading = Рамзро ба таври дастӣ ворид намоед
flow-setup-2fa-button = Идома додан
flow-setup-2fa-input-label = Рамзи 6-рақамро ворид кунед

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Тарзи барқарорсозиро интихоб кунед
flow-setup-2fa-backup-choice-phone-title = Телефони барқарорсозӣ
flow-setup-2fa-backup-choice-phone-badge = Осонтарин
flow-setup-2fa-backup-choice-code-title = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният
flow-setup-2fa-backup-choice-code-badge = Бехатартарин

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Нусхаи эҳтиётии рамзи санҷиши ҳаққониятро ворид кунед
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Анҷом

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Нигоҳ доштани рамзҳои санҷиши ҳаққоният
flow-setup-2fa-backup-code-dl-button-continue = Идома додан

##

flow-setup-2fa-inline-complete-success-banner = Санҷиши ҳаққонияти дуқадама фаъол шуд
flow-setup-2fa-inline-complete-backup-code = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният
flow-setup-2fa-inline-complete-backup-phone = Телефони барқарорсозӣ
flow-setup-2fa-prompt-continue-button = Идома додан

## FlowSetupPhoneConfirmCode

flow-setup-phone-confirm-code-input-label = Рамзи 6-рақамро ворид кунед
flow-setup-phone-confirm-code-button = Тасдиқ кардан
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Муҳлати рамз ба анҷом расид?
flow-setup-phone-confirm-code-resend-code-button = Аз нав фиристодани рамз
flow-setup-phone-confirm-code-resend-code-success = Рамз фиристода шуд
flow-setup-phone-confirm-code-success-message-v2 = Телефони барқарорсозӣ илова карда шуд
flow-change-phone-confirm-code-success-message = Телефони барқарорсозӣ иваз карда шуд

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Рақами телефони худро тасдиқ кунед
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Фиристодани рамз

## HeaderLockup component, the header in account settings

header-menu-open = Пӯшидани меню
header-menu-closed = Менюи паймоиши сомона
header-back-to-top-link =
    .title = Бозгашт ба боло
header-title-2 = { -product-mozilla-account }
header-help = Кумак

## Linked Accounts section

la-heading = Ҳисобҳои пайвастшуда
la-unlink-button = Ҷудо кардани пайванд
la-unlink-account-button = Ҷудо кардани пайванд
la-set-password-button = Танзим кардани ниҳонвожа
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Пӯшидан
modal-cancel-button = Бекор кардан
modal-default-confirm-button = Тасдиқ кардан

## Modal Verify Session

mvs-verify-your-email-2 = Почтаи электронии худро тасдиқ кунед
mvs-enter-verification-code-2 = Рамзи тасдиқкунандаи худро ворид намоед
msv-cancel-button = Бекор кардан
msv-submit-button-2 = Тасдиқ кардан

## Settings Nav

nav-settings = Танзимот
nav-profile = Профил
nav-security = Амният
nav-connected-services = Хизматрасониҳои пайвастшуда
nav-data-collection = Ҷамъоварӣ ва истифодабарии маълумот
nav-paid-subs = Обунаҳо пардохтшуда

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Ҳангоми иваз кардани нусхаи эҳтиётии рамзи санҷиши ҳаққонияти шумо мушкилӣ ба миён омад
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Ҳангоми эҷод кардани нусхаи эҳтиётии рамзи санҷиши ҳаққонияти шумо мушкилӣ ба миён омад
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният навсозӣ шуд

## Page2faSetup

page-2fa-setup-title = Санҷиши ҳаққонияти дуқадама
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Ин рамз нодуруст аст. Аз нав кӯшиш кунед.
page-2fa-setup-success = Санҷиши ҳаққонияти дуқадама фаъол карда шуд

## Avatar change page

avatar-page-title =
    .title = Акси профил
avatar-page-add-photo = Илова кардани акс
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Гирифтани акс
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Тоза кардани акс
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Аз нав гирифтани акс
avatar-page-cancel-button = Бекор кардан
avatar-page-save-button = Нигоҳ доштан
avatar-page-saving-button = Сабт шуда истодааст…
avatar-page-zoom-out-button =
    .title = Хурд кардан
avatar-page-zoom-in-button =
    .title = Калон кардан
avatar-page-rotate-button =
    .title = Давр занондан
avatar-page-camera-error = Камераро оғоз карда натавонист
avatar-page-new-avatar =
    .alt = акси нави профил
avatar-page-file-upload-error-3 = Ҳангоми боркунии акси профили шумо мушкилӣ ба миён омад
avatar-page-delete-error-3 = Ҳангоми несткунии акси профили шумо мушкилӣ ба миён омад

## Password change page

pw-change-header =
    .title = Иваз кардани ниҳонвожа
pw-change-cancel-button = Бекор кардан
pw-change-save-button = Нигоҳ доштан
pw-change-forgot-password-link = Ниҳонвожаро фаромӯш кардед?
pw-change-current-password =
    .label = Ниҳонвожаи ҷориро ворид намоед
pw-change-new-password =
    .label = Ниҳонвожаи наверо ворид намоед
pw-change-confirm-password =
    .label = Ниҳонвожаи навро тасдиқ намоед
pw-change-success-alert-2 = Ниҳонвожа аз нав нигоҳ дошта шуд

## Password create page

pw-create-header =
    .title = Эҷод кардани ниҳонвожа
pw-create-success-alert-2 = Ниҳонвожа танзим карда шуд

## Delete account page

delete-account-header =
    .title = Нест кардани ҳисоб
delete-account-step-1-2 = Қадами 1 аз 2
delete-account-step-2-2 = Қадами 2 аз 2
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Ҳамоҳангсозии маълумоти «{ -brand-firefox }»
delete-account-product-firefox-addons = Ҷузъҳои иловагии «{ -brand-firefox }»
delete-account-continue-button = Идома додан
delete-account-password-input =
    .label = Ниҳонвожаеро ворид намоед
delete-account-cancel-button = Бекор кардан
delete-account-delete-button-2 = Нест кардан

## Display name page

display-name-page-title =
    .title = Номи намоишӣ
display-name-input =
    .label = Номи намоиширо ворид кунед
submit-display-name = Нигоҳ доштан
cancel-display-name = Бекор кардан
display-name-update-error-2 = Ҳангоми навсозии номи намоишии шумо мушкилӣ ба миён омад
display-name-success-alert-2 = Номи намоишӣ нав карда шуд

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-account-create-v2 = Ҳисоб эҷод карда шуд
recent-activity-account-disable-v2 = Ҳисоб ғайрифаъол шуд
recent-activity-account-enable-v2 = Ҳисоб фаъол шуд
recent-activity-account-two-factor-requested = Санҷиши ҳаққонияти дуқадама дархост шуд
recent-activity-account-two-factor-failure = Санҷиши ҳаққонияти дуқадама иҷро нашуд
recent-activity-account-two-factor-success = Санҷиши ҳаққонияти дуқадама бомуваффақият иҷро шуд
recent-activity-account-two-factor-removed = Санҷиши ҳаққонияти дуқадама тоза карда шуд
recent-activity-account-password-reset-requested = Ҳисоб барқарорсозии ниҳонвожаро дархост кард
recent-activity-account-password-reset-success = Ниҳонвожаи ҳисоб бо муваффақият аз нав танзим карда шуд
recent-activity-account-recovery-key-added = Калиди барқарорсозии ҳисоб фаъол карда шуд
recent-activity-account-recovery-key-verification-failure = Тасдиқи калиди барқарорсозии ҳисоб иҷро карда нашуд
recent-activity-account-recovery-key-verification-success = Тасдиқи калиди барқарорсозии ҳисоб бо муваффақият иҷро карда шуд
recent-activity-account-recovery-key-removed = Калиди барқарорсозии ҳисоб тоза карда шуд
recent-activity-account-password-added = Ниҳонвожаи нав илова шуд
recent-activity-account-password-changed = Ниҳонвожа иваз карда шуд
recent-activity-account-secondary-email-added = Нишонии почтаи электронии иловагӣ илова шуд
recent-activity-account-secondary-email-removed = Нишонии почтаи электронии иловагӣ тоза шуд
recent-activity-account-recovery-phone-send-code = Рамзи телефони барқарорсозӣ фиристода шуд
recent-activity-account-recovery-phone-setup-complete = Танзими телефони барқарорсозӣ ба анҷом расид
recent-activity-account-recovery-phone-removed = Телефони барқарорсозӣ тоза карда шуд
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Фаъолияти дигари ҳисоб

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Калиди барқарорсозии ҳисоб
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Бозгашт ба Танзимот

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Тоза кардани рақами телефони барқарорсозӣ
settings-recovery-phone-remove-button = Тоза кардани рақами телефон
settings-recovery-phone-remove-cancel = Бекор кардан
settings-recovery-phone-remove-success = Телефони барқарорсозӣ тоза карда шуд

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Илова кардани телефони барқарорсозӣ
page-change-recovery-phone = Иваз кардани телефони барқарорсозӣ
page-setup-recovery-phone-back-button-title = Бозгашт ба Танзимот
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Иваз кардани рақами телефон

## Add secondary email page

add-secondary-email-step-1 = Қадами 1 аз 2
add-secondary-email-page-title =
    .title = Почтаи электронии иловагӣ
add-secondary-email-enter-address =
    .label = Нишонии почтаи электрониро ворид намоед
add-secondary-email-cancel-button = Бекор кардан
add-secondary-email-save-button = Нигоҳ доштан

## Verify secondary email page

add-secondary-email-step-2 = Қадами 2 аз 2
verify-secondary-email-page-title =
    .title = Почтаи электронии иловагӣ
verify-secondary-email-verification-code-2 =
    .label = Рамзи тасдиқкунандаи худро ворид намоед
verify-secondary-email-cancel-button = Бекор кардан
verify-secondary-email-verify-button-2 = Тасдиқ кардан
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } бо муваффақият илова карда шуд

##

# Link to delete account on main Settings page
delete-account-link = Нест кардани ҳисоб

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }

## Profile section

profile-heading = Профил
profile-picture =
    .header = Акс
profile-display-name =
    .header = Номи намоишӣ
profile-primary-email =
    .header = Почтаи электронии асосӣ

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Қадами { $currentStep } аз { $numberOfSteps }.

## Security section of Setting

security-heading = Амният
security-password =
    .header = Ниҳонвожа
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Санаи { $date } эҷод карда шуд
security-not-set = Танзим нашудааст
security-action-create = Эҷод кардан

## SubRow component

tfa-row-backup-codes-title = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Эҷод кардани рамзҳои нав
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Илова кардан
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Телефони барқарорсозӣ
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Ягон рақами телефон илова карда нашуд
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Тағйир додан
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Илова кардан
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Тоза кардан
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Тоза кардани телефони барқарорсозӣ

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Хомӯш кардан
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Фаъол кардан
switch-is-on = фаъол
switch-is-off = ғайрифаъол

## Sub-section row Defaults

row-defaults-action-add = Илова кардан
row-defaults-action-change = Тағйир додан
row-defaults-action-disable = Ғайрифаъол кардан
row-defaults-status = Ҳеҷ

## Account recovery key sub-section on main Settings page

rk-header-1 = Калиди барқарорсозии ҳисоб
rk-enabled = Фаъол аст
rk-not-set = Танзим нашудааст
rk-action-create = Эҷод кардан
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Тағйир додан
rk-action-remove = Тоза кардан
rk-key-removed-2 = Калиди барқарорсозии ҳисоб тоза карда шуд
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Нест кардани калиди барқарорсозии ҳисоб

## Secondary email sub-section on main Settings page

se-heading = Почтаи электронии иловагӣ
    .header = Почтаи электронии иловагӣ
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } бо муваффақият нест карда шуд
# Button to remove the secondary email
se-remove-email =
    .title = Тоза кардани почтаи электронӣ
# Default value for the secondary email
se-secondary-email-none = Ҳеҷ

## Two Step Auth sub-section on Settings main page

tfa-row-header = Санҷиши ҳаққонияти дуқадама
tfa-row-enabled = Фаъол аст
tfa-row-disabled-status = Ғайрифаъол аст
tfa-row-action-add = Илова кардан
tfa-row-action-disable = Ғайрифаъол кардан
tfa-row-disable-modal-confirm = Ғайрифаъол кардан

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = ё
continue-with-google-button = Бо «{ -brand-google }» идома диҳед
continue-with-apple-button = Бо «{ -brand-apple }» идома диҳед

## Auth-server based errors that originate from backend service

auth-error-102 = Ҳисоби номаълум
auth-error-103 = Ниҳонвожаи нодуруст
auth-error-105-2 = Рамзи тасдиқкунанда нодуруст аст
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Нусхаи эҳтиётии рамзи санҷиши ҳаққоният ёфт нашуд
auth-error-214 = Рақами телефони барқарорсозӣ аллакай вуҷуд дорад
auth-error-215 = Рақами телефони барқарорсозӣ вуҷуд надорад
auth-error-1056 = Нусхаи эҳтиётии рамзи санҷиши ҳаққонияти нодуруст
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Рақаме, ки дар анҷомаш дорои { $lastFourPhoneNumber } мебошад
oauth-error-1000 = Чизе нодуруст иҷро шуд. Лутфан, ин варақаро пӯшед ва баъдтар аз нав кӯшиш кунед.

## Connect Another Device page

# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Почтаи электронӣ тасдиқ карда шуд
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Воридшавӣ тасдиқ карда шуд
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Ворид шудан
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Пайваст кардани дастгоҳи дигар
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Ҳоло не

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Аз нав кӯшиш кардан
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Маълумоти бештар

## Index / home page

index-header = Почтаи электронии худро ворид кунед
index-relay-header = Эҷод кардани ниқоби почтаи электронӣ
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Ба «{ $serviceName }» идома диҳед
index-cta = Сабти ном кунед ё ворид шавед
index-email-input =
    .label = Почтаи электронии худро ворид кунед

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-recovery-created = Калиди барқарорсозии ҳисоб эҷод карда шуд
inline-recovery-key-setup-download-header = Ҳисоби худро муҳофизат кунед
inline-recovery-key-setup-download-subheader = Ҳозир онро боргирӣ кунед ва нигоҳ доред

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Бекор кардани танзим
inline-totp-setup-continue-button = Идома додан
inline-totp-setup-ready-button = Омода аст
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Рамзи санҷиши ҳаққоният
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Рамзи санҷиши ҳаққоният лозим аст

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Маълумоти ҳуқуқӣ
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Шартҳои хизматрасонӣ
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Огоҳномаи махфият

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Огоҳномаи махфият

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Шартҳои хизматрасонӣ

## AuthAllow page - Part of the device pairing flow

# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Бале, дастгоҳро тасдиқ кунед

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Дастгоҳ пайваст шуд
pair-auth-complete-manage-devices-link = Идоракунии дастгоҳҳо

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

auth-totp-input-label = Рамзи 6-рақамро ворид кунед
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Тасдиқ кардан
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Рамзи санҷиши ҳаққоният лозим аст

## Pair index page

pair-sync-header = Ҳамоҳангсозии «{ -brand-firefox }» дар телефон ва планшет
pair-cad-header = «{ -brand-firefox }»-ро дар дастгоҳи дигар пайваст кунед
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Дастгоҳи худро ҳамоҳанг созед
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Ё боргирӣ кунед
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Ҳоло не
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Оғози кор
# This is the aria label on the QR code image
pair-qr-code-aria-label = Рамзи «QR»

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Дастгоҳ пайваст шуд
pair-success-message-2 = Ҷуфтсозӣ бо муваффақият иҷро шуд.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

pair-supp-allow-cancel-link = Бекор кардан

## AccountRecoveryConfirmKey page

# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Идома додан

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Ниҳонвожаи наверо эҷод намоед
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Ниҳонвожа танзим карда шуд
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Истифодаи калиди барқарорсозии ҳисоб
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Ниҳонвожаи шумо аз нав барқарор карда шуд.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-subheader = Нусхаи эҳтиётии рамзи санҷиши ҳаққониятро ворид кунед

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Почтаи электронии худро тафтиш кунед
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Идома додан
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Аз нав фиристодани рамз
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Ҳисоби дигареро истифода баред

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Барқарор кардани ниҳонвожаи худ
confirm-totp-reset-password-trouble-code = Ҳангоми ворид кардани рамз мушкилӣ мекашед?
confirm-totp-reset-password-confirm-button = Тасдиқ кардан
confirm-totp-reset-password-input-label-v2 = Рамзи 6-рақамро ворид кунед

## ResetPassword start page

password-reset-flow-heading = Барқарор кардани ниҳонвожаи худ
password-reset-email-input =
    .label = Почтаи электронии худро ворид кунед
password-reset-submit-button-2 = Идома додан

## ResetPasswordConfirmed

reset-password-complete-header = Ниҳонвожаи шумо аз нав барқарор карда шуд
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Ба «{ $serviceName }» идома диҳед

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Барқарор кардани ниҳонвожаи худ
password-reset-recovery-method-subheader = Тарзи барқарорсозиро интихоб кунед
password-reset-recovery-method-phone = Телефони барқарорсозӣ
password-reset-recovery-method-code = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният
password-reset-recovery-method-send-code-error-description = Лутфан, баъдтар аз нав кӯшиш кунед ё аз нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният истифода баред.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Барқарор кардани ниҳонвожаи худ
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Рамзи барқарорсозиро ворид кунед
reset-password-recovery-phone-input-label = Рамзи 6-рақамро ворид кунед
reset-password-recovery-phone-code-submit-button = Тасдиқ кардан
reset-password-recovery-phone-resend-code-button = Аз нав фиристодани рамз
reset-password-recovery-phone-resend-success = Рамз фиристода шуд
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Ҳисоби шумо қулф шудааст?
reset-password-recovery-phone-send-code-error-heading = Ҳангоми фиристодани рамз мушкилӣ ба миён омад
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Лутфан, баъдтар аз нав кӯшиш кунед.
reset-password-recovery-phone-invalid-code-error-link = Ба ивази он, аз нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният истифода мебаред?
reset-password-with-recovery-key-verified-page-title = Ниҳонвожа бо муваффақият аз нав танзим карда шуд
reset-password-complete-new-password-saved = Ниҳонвожаи нав нигоҳ дошта шуд!

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Хато:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Тасдиқи воридшавӣ…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Хатои тасдиқи воридшавӣ
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Муҳлати пайванди тасдиқи воридшавӣ ба анҷом расид

## Signin page

# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Ба «{ $serviceName }» идома диҳед
signin-subheader-without-logo-default = Ба танзимоти ҳисоб идома диҳед
signin-button = Ворид шудан
signin-header = Ворид шудан
signin-use-a-different-account-link = Ҳисоби дигареро истифода баред
signin-forgot-password-link = Ниҳонвожаро фаромӯш кардед?
signin-password-button-label = Ниҳонвожа

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-submit-button = Гузориш дар бораи фаъолияти шубҳанок
report-signin-support-link = Чаро ин ба вуҷуд меояд?
back = Ба қафо

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-send-email-link = Рамзи почтаи электронӣ

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Воридшавии худро тасдиқ кунед
signin-push-code-confirm-verifying = Тасдиқ шуда истодааст
signin-push-code-confirm-login = Тасдиқ кардани воридшавӣ
signin-push-code-confirm-wasnt-me = Ин ман набудам, ниҳонвожаро иваз кунед.
signin-push-code-confirm-login-approved = Воридшавии шумо тасдиқ карда шуд. Лутфан, ин равзанаро пӯшед.
signin-push-code-confirm-link-error = Пайванд вайрон шудааст. Лутфан, аз нав кӯшиш кунед.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Ворид шудан
signin-recovery-method-subheader = Тарзи барқарорсозиро интихоб кунед
signin-recovery-method-phone = Телефони барқарорсозӣ
signin-recovery-method-code-v2 = Нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният
signin-recovery-method-send-code-error-description = Лутфан, баъдтар аз нав кӯшиш кунед ё аз нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният истифода баред.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Ворид шудан
signin-recovery-code-sub-heading = Нусхаи эҳтиётии рамзи санҷиши ҳаққониятро ворид кунед
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Тасдиқ кардан
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Истифодаи телефони барқарорсозӣ
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Ҳисоби шумо қулф шудааст?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Рамзи санҷиши ҳаққоният лозим аст
signin-recovery-code-use-phone-failure-description = Лутфан, баъдтар аз нав кӯшиш кунед.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Ворид шудан
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Рамзи барқарорсозиро ворид кунед
signin-recovery-phone-input-label = Рамзи 6-рақамро ворид кунед
signin-recovery-phone-code-submit-button = Тасдиқ кардан
signin-recovery-phone-resend-code-button = Аз нав фиристодани рамз
signin-recovery-phone-resend-success = Рамз фиристода шуд
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Ҳисоби шумо қулф шудааст?
signin-recovery-phone-send-code-error-heading = Ҳангоми фиристодани рамз мушкилӣ ба миён омад
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Лутфан, баъдтар аз нав кӯшиш кунед.
signin-recovery-phone-invalid-code-error-link = Ба ивази он, аз нусхаи эҳтиётии рамзҳои санҷиши ҳаққоният истифода мебаред?

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Ташаккур барои ҳушёрии шумо!

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

signin-token-code-input-label-v2 = Рамзи 6-рақамро ворид кунед
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Тасдиқ кардан
signin-token-code-code-expired = Муҳлати рамз ба анҷом расид?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Рамзи наверо ба почтаи электронӣ ирсол намоед.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Рамзи тасдиқкунанда лозим аст

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Ворид шудан
signin-totp-code-input-label-v4 = Рамзи 6-рақамро ворид кунед
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Тасдиқ кардан
signin-totp-code-other-account-link = Ҳисоби дигареро истифода баред
signin-totp-code-recovery-code-link = Ҳангоми ворид кардани рамз мушкилӣ мекашед?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Рамзи санҷиши ҳаққоният лозим аст

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Ба ин воридшавӣ иҷозат диҳед
signin-unblock-code-input = Рамзи санҷиши дастрасиро ворид намоед
signin-unblock-submit-button = Идома додан
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Рамзи санҷиши дастрасӣ лозим аст
signin-unblock-support-link = Чаро ин ба вуҷуд меояд?

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Рамзи тасдиқкунандаро ворид намоед
confirm-signup-code-input-label = Рамзи 6-рақамро ворид кунед
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Тасдиқ кардан
confirm-signup-code-sync-button = Оғози ҳамоҳангсозӣ
confirm-signup-code-code-expired = Муҳлати рамз ба анҷом расид?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Рамзи наверо ба почтаи электронӣ ирсол намоед.
confirm-signup-code-success-alert = Ҳисоб бо муваффақият тасдиқ карда шуд
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Рамзи тасдиқкунанда лозим аст

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Эҷод кардани ниҳонвожа
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Иваз кардани почтаи электронӣ
