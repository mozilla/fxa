# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Нови код је послат на вашу адресу е-поште.
resend-link-success-banner-heading = Нова веза је послата на вашу адресу е-поште.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Додајте { $accountsEmail } у своје контакте како бисте осигурали несметану доставу.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Затвори врпцу
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } ће бити преименован у { -product-mozilla-accounts } 1. новембра
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = И даље ћете се пријављивати истим корисничким именом и лозинком, а нема других измена у производима које користите.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Преименовали смо { -product-firefox-accounts } у { -product-mozilla-accounts }. И даље ћете се пријављивати истим корисничким именом и лозинком, а нема других измена у производима које користите.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Сазнајте више
# Alt text for close banner image
brand-close-banner =
    .alt = Затвори врпцу
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = { -brand-mozilla } m логотип

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Назад
button-back-title = Назад

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Преузми и настави
    .title = Преузми и настави
recovery-key-pdf-heading = Кључ за опоравак налога
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Направљено: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Кључ за опоравак налога
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Овај кључ вам омогућава да опоравите своје шифроване податке прегледача (укључујући лозинке, обележиваче и историјат) ако заборавите лозинку. Чувајте га на месту које ћете запамтити.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Места за чување кључа
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Сазнајте више о свом кључу за опоравак налога
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Нажалост, дошло је до проблема при преузимању вашег кључа за опоравак налога.

## ButtonPasskeySignin

button-passkey-signin = Пријави се приступним кључем
# This is a loading state indicating that we are waiting for the user to
# interact with their authenticator to approve the sign-in. They should see a
# device prompt/pop-up with authentication options (or message indicating that
# no passkeys are available).
button-passkey-signin-loading = Безбедно пријављивање…

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Добијајте више од { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Примајте наше најновије вести и ажурирања производа
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Рани приступ за тестирање нових производа
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Обавештења о акцијама за повратак интернета

## Dark mode toggle

dark-mode-toggle-light = Светла
dark-mode-toggle-dark = Тамна
dark-mode-toggle-system = Системска
dark-mode-toggle-label = Окини тему

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Преузето
datablock-copy =
    .message = Копирано
datablock-print =
    .message = Одштампано

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Код је копиран
        [few] Кода су копирана
       *[other] Кодова је копирано
    }
datablock-download-success =
    { $count ->
        [one] Код је преузет
        [few] Кода су преузета
       *[other] Кодова је преузето
    }
datablock-print-success =
    { $count ->
        [one] Код је одштампан
        [few] Кода су одштампана
       *[other] Кодова је одштампано
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Копирано

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (приближно)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (приближно)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (приближно)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (приближно)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Непозната локација
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } на { $genericOSName }-у
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP адреса: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Лозинка
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Поновите лозинку
form-password-with-inline-criteria-signup-submit-button = Направи налог
form-password-with-inline-criteria-reset-new-password =
    .label = Нова лозинка
form-password-with-inline-criteria-confirm-password =
    .label = Потврдите лозинку
form-password-with-inline-criteria-reset-submit-button = Направи нову лозинку
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Лозинка
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Поновите лозинку
form-password-with-inline-criteria-set-password-submit-button = Започни усклађивање
form-password-with-inline-criteria-match-error = Лозинке се не подударају
form-password-with-inline-criteria-sr-too-short-message = Лозинка мора да садржи најмање 8 знакова.
form-password-with-inline-criteria-sr-not-email-message = Лозинка не сме да садржи вашу адресу е-поште.
form-password-with-inline-criteria-sr-not-common-message = Лозинка не сме бити често коришћена лозинка.
form-password-with-inline-criteria-sr-requirements-met = Унета лозинка испуњава све захтеве за лозинку.
form-password-with-inline-criteria-sr-passwords-match = Унете лозинке се подударају.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Ово поље је обавезно

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Унесите { $codeLength }-цифрени код за наставак
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Унесите код од { $codeLength } знакова за наставак

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } кључ за опоравак налога
get-data-trio-title-backup-verification-codes = Резервни кодови за потврду идентитета
get-data-trio-download-2 =
    .title = Преузми
    .aria-label = Преузми
get-data-trio-copy-2 =
    .title = Копирај
    .aria-label = Копирај
get-data-trio-print-2 =
    .title = Штампај
    .aria-label = Штампај

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Упозорење
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Пажња
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Упозорење
authenticator-app-aria-label =
    .aria-label = Апликација за потврду идентитета
backup-codes-icon-aria-label-v2 =
    .aria-label = Резервни кодови за потврду идентитета су омогућени
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Резервни кодови за потврду идентитета су онемогућени
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = СМС за опоравак је омогућен
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = СМС за опоравак је онемогућен
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Застава Канаде
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Означи
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Успех
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Омогућено
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Затвори поруку
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Код
error-icon-aria-label =
    .aria-label = Грешка
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Информације
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Застава Сједињених Америчких Држава
# Used for loading arrow icon
icon-loading-arrow-aria-label =
    .aria-label = Учитавање
# Used for passkey icon
icon-passkey-aria-label =
    .aria-label = Приступни кључ

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Рачунар и мобилни телефон, сваки са сликом сломљеног срца
hearts-verified-image-aria-label =
    .aria-label = Рачунар и мобилни телефон, сваки са сликом срца које куца
signin-recovery-code-image-description =
    .aria-label = Документ који садржи скривени текст.
signin-totp-code-image-label =
    .aria-label = Уређај са скривеним шестоцифреним кодом.
confirm-signup-aria-label =
    .aria-label = Коверта која садржи везу
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Илустрација која представља кључ за опоравак налога.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Илустрација која представља кључ за опоравак налога.
password-image-aria-label =
    .aria-label = Илустрација која представља куцање лозинке.
lightbulb-aria-label =
    .aria-label = Илустрација која представља осмишљавање наговештаја за складиште.
email-code-image-aria-label =
    .aria-label = Илустрација која представља е-пошту која садржи код.
recovery-phone-image-description =
    .aria-label = Мобилни уређај који прима код путем текстуалне поруке.
recovery-phone-code-image-description =
    .aria-label = Код примљен на мобилном уређају.
backup-recovery-phone-image-aria-label =
    .aria-label = Мобилни уређај са могућношћу слања SMS текстуалних порука
backup-authentication-codes-image-aria-label =
    .aria-label = Екран уређаја са кодовима
sync-clouds-image-aria-label =
    .aria-label = Облаци са иконицом за усаглашавање
confetti-falling-image-aria-label =
    .aria-label = Анимиране падајуће конфете
# In this context, “VPN” is a VPN service built into the Firefox browser, and generally isn't localized differently than “VPN”
vpn-welcome-image-aria-label =
    .aria-label = { -brand-firefox } прозор са кружним беџом који приказује зелену ознаку и „VPN“, показујући да је VPN активан.

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Пријављени сте на { -brand-firefox }.
inline-recovery-key-setup-create-header = Осигурајте свој налог
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Имате ли минут да заштитите своје податке?
inline-recovery-key-setup-info = Направите кључ за опоравак налога како бисте могли да повратите своје усклађене податке прегледања ако икада заборавите лозинку.
inline-recovery-key-setup-start-button = Направи кључ за опоравак налога
inline-recovery-key-setup-later-button = Уради то касније

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Сакриј лозинку
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Прикажи лозинку
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Ваша лозинка је тренутно видљива на екрану.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Ваша лозинка је тренутно скривена.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Ваша лозинка је сада видљива на екрану.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Ваша лозинка је сада скривена.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Изаберите државу
input-phone-number-enter-number = Унесите број телефона
input-phone-number-country-united-states = Сједињене Америчке Државе
input-phone-number-country-canada = Канада
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Назад

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Веза за ресетовање лозинке је оштећена
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Веза за потврду је оштећена
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Веза је оштећена
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Вези на који сте кликнули недостају знакови и могуће је да ју је оштетио ваш клијент е-поште. Пажљиво копирајте адресу и покушајте поново.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Прими нову везу

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Запамтити вашу лозинку?
# link navigates to the sign in page
remember-password-signin-link = Пријави ме

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Примарна адреса е-поште је већ потврђена
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Пријава је већ потврђена
confirmation-link-reused-message = Ова веза за потврду је већ искоришћена, може се искористити само једном.

## Locale Toggle Component

locale-toggle-select-label = Изаберите језик
locale-toggle-browser-default = Подразумевано у прегледнику
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Лош захтев

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Потребна вам је ова лозинка да приступите вашим шифрованим подацима који се чувају код нас.
password-info-balloon-reset-risk-info = Ресетовањем можете да изгубите податке као што су лозинке и обележивачи.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Изаберите јаку лозинку коју нисте користили на другим сајтовима. Уверите се да испуњава безбедносне захтеве:
password-strength-short-instruction = Изаберите јаку лозинку:
password-strength-inline-min-length = Најмање 8 знакова
password-strength-inline-not-email = Није ваша адреса е-поште
password-strength-inline-not-common = Није уобичајено коришћена лозинка
password-strength-inline-confirmed-must-match = Потврда се подудара са новом лозинком
password-strength-inline-passwords-match = Лозинке се подударају

## PromoQrMobile component
## Promotional aside encouraging users to download the Firefox mobile app via QR code.

# "Your phone. Your rules." refers to the user being able to control what browser they use on their own phone.
promo-qr-mobile-heading = Ваш телефон. Ваша правила.
# Appears next to a QR code that a user can scan to download the Firefox mobile app
promo-qr-mobile-description = Скенирајте да бисте преузели апликацију
# Note that for RTL languages, this should be translated as "the lower-left corner of your screen," instead of "the lower-right corner."
promo-qr-mobile-qr-alt =
    .alt = КР код за преузимање мобилне апликације { -brand-firefox }. Поставите камеру свог телефона на доњи десни угао екрана да бисте га скенирали.

## Notification Promo Banner component

account-recovery-notification-cta = Направи
account-recovery-notification-header-value = Не губите своје податке ако заборавите лозинку
account-recovery-notification-header-description = Направите кључ за опоравак налога да бисте повратили своје усклађене податке прегледања ако икада заборавите лозинку.
recovery-phone-promo-cta = Додајте телефон за опоравак
recovery-phone-promo-heading = Додајте додатну заштиту свом налогу помоћу телефона за опоравак
recovery-phone-promo-description = Сада се можете пријавити помоћу једнократне лозинке путем СМС-а ако не можете да користите апликацију за потврду идентитета у два корака.
recovery-phone-promo-info-link = Сазнајте више о опоравку и ризику од замене СИМ картице
promo-banner-dismiss-button =
    .aria-label = Одбаци врпцу

## Ready component

ready-complete-set-up-instruction = Завршите подешавање тако што ћете унети нову лозинку на вашим осталим { -brand-firefox } уређајима.
manage-your-account-button = Управљајте својим налогом
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Сада сте спремни да користите { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Спремни сте да користите подешавања налога
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Ваш налог је спреман!
ready-continue = Настави
sign-in-complete-header = Пријава је потврђена
sign-up-complete-header = Налог је потврђен
primary-email-verified-header = Примарна е-пошта је потврђена

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Места за чување кључа:
flow-recovery-key-download-storage-ideas-folder-v2 = Фасцикла на безбедном уређају
flow-recovery-key-download-storage-ideas-cloud = Поуздано складиште у облаку
flow-recovery-key-download-storage-ideas-print-v2 = Одштампана физичка копија
flow-recovery-key-download-storage-ideas-pwd-manager = Уређивач лозинки

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Додајте наговештај који ће вам помоћи да пронађете кључ
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Овај наговештај служи да се сетите где сте сачували кључ за опоравак налога. Можемо вам га показати при ресетовању лозинке како бисте могли да повратите податке.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Унесите наговештај (није обавезно)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Заврши
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Наговештај мора да садржи мање од 255 знакова.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Наговештај не може да садржи небезбедне Уникод знакове. Дозвољена су само слова, бројеви, знакови интерпункције и симболи.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Упозорење
password-reset-chevron-expanded = Скупи упозорење
password-reset-chevron-collapsed = Прошири упозорење
password-reset-data-may-not-be-recovered = Подаци вашег прегледача можда неће бити враћени
password-reset-previously-signed-in-device-2 = Имате ли неки уређај на којем сте се претходно пријавили?
password-reset-data-may-be-saved-locally-2 = Подаци вашег прегледача су можда сачувани на том уређају. Ресетујте лозинку, а затим се пријавите тамо да бисте повратили и усагласили своје податке.
password-reset-no-old-device-2 = Имате нови уређај, али немате приступ ниједном од претходних?
password-reset-encrypted-data-cannot-be-recovered-2 = Жао нам је, али ваши шифровани подаци прегледача на { -brand-firefox } серверима не могу бити враћени.
password-reset-warning-have-key = Имате кључ за опоравак налога?
password-reset-warning-use-key-link = Употребите га сада да бисте ресетовали лозинку и сачували своје податке

## Alert Bar

alert-bar-close-message = Затвори поруку

## User's avatar

avatar-your-avatar =
    .alt = Ваш аватар
avatar-default-avatar =
    .alt = Подразумевани аватар

##


# BentoMenu component

bento-menu-title-3 = { -brand-mozilla } производи
bento-menu-tagline = Више производа из { -brand-mozilla } који штите вашу приватност
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } прегледач за десктоп
bento-menu-firefox-mobile = { -brand-firefox } прегледач за мобилни
bento-menu-made-by-mozilla = Створила { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Преузмите { -brand-firefox } на телефон или таблет
connect-another-find-fx-mobile-2 = Пронађите { -brand-firefox } у { -google-play } и { -app-store } продавницама.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Преузмите { -brand-firefox } на { -google-play }
connect-another-app-store-image-3 =
    .alt = Преузмите { -brand-firefox } на { -app-store }

## Connected services section

cs-heading = Повезане услуге
cs-description = Све што користите и на шта сте пријављени.
cs-cannot-refresh =
    Жао нам је, дошло је до проблема при освежавању листе повезаних
    услуга.
cs-cannot-disconnect = Клијент није пронађен, није могуће прекинути везу
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Одјављени сте из { $service }-а
cs-refresh-button =
    .title = Освежите повезане услуге
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Ставке недостају или се понављају?
cs-disconnect-sync-heading = Прекини везу са Sync-ом

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Ваши подаци прегледања ће остати на <span>{ $device }</span>,
    али више неће бити усклађени на ваш налог.
cs-disconnect-sync-reason-3 = Који је главни разлог прекида везе са <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Уређај је:
cs-disconnect-sync-opt-suspicious = Сумњив
cs-disconnect-sync-opt-lost = Изгубљен или украден
cs-disconnect-sync-opt-old = Стар или замењен
cs-disconnect-sync-opt-duplicate = Дупликат
cs-disconnect-sync-opt-not-say = Не желим да кажем

##

cs-disconnect-advice-confirm = У реду, разумем
cs-disconnect-lost-advice-heading = Изгубљени или украдени уређај је искључен
cs-disconnect-lost-advice-content-3 = Пошто је ваш уређај изгубљен или украден, да бисте сачували своје податке, требало би да промените лозинку за свој { -product-mozilla-account } у подешавањима налога. Такође би требало да потражите информације од произвођача вашег уређаја о даљинском брисању података.
cs-disconnect-suspicious-advice-heading = Сумњив уређај је искључен
cs-disconnect-suspicious-advice-content-2 = Ако је прекинута веза са уређајем заиста сумњива, да бисте сачували своје податке, требало би да промените лозинку за свој { -product-mozilla-account } у подешавањима налога. Такође би требало да промените све друге лозинке које сте сачували у { -brand-firefox } прегледачу тако што ћете укуцати about:logins у адресној траци.
cs-sign-out-button = Одјави се

## Data collection section

dc-heading = Сакупљање и коришћење података
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = { -brand-firefox } прегледач
dc-subheader-content-2 = Дозволите { -product-mozilla-accounts } налогу да шаље техничке податке и податке о интеракцији { -brand-mozilla } заједници.
dc-subheader-ff-content = Да бисте прегледали или ажурирали подешавања техничких података и података о интеракцији за { -brand-firefox } прегледач, отворите { -brand-firefox } подешавања и идите на Приватност и безбедност.
dc-opt-out-success-2 = Одјављивање је успешно. { -product-mozilla-accounts } неће слати техничке податке или податке о интеракцији { -brand-mozilla } заједници.
dc-opt-in-success-2 = Хвала! Дељење ових података нам помаже да побољшамо { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Жао нам је, дошло је до грешке при мењању ваших подешавања за прикупљање података
dc-learn-more = Сазнајте више

# DropDownAvatarMenu component

drop-down-menu-title-2 = { -product-mozilla-account } мени
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Пријављени сте као
drop-down-menu-sign-out = Одјави се
drop-down-menu-sign-out-error-2 = Жао нам је, дошло је до грешке при одјављивању

## Flow Container

flow-container-back = Назад

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Поново унесите лозинку ради безбедности
flow-recovery-key-confirm-pwd-input-label = Унесите вашу лозинку
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Направи кључ за опоравак налога
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Направите нови кључ за опоравак налога

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Кључ за опоравак налога је направљен - преузмите и сачувајте га одмах
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Овај кључ вам омогућава да опоравите ваше податке ако заборавите лозинку. Преузмите га сада и сачувајте на погодном месту - нећете моћи да се вратите на ову страницу касније.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Наставите без преузимања

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Кључ за опоравак налога је направљен

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Направите кључ за опоравак налога у случају да заборавите лозинку
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Промените кључ за опоравак налога
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Шифрујемо ваше податке прегледања - лозинке, обележиваче и остало. Ово је одлично за приватност, али ако заборавите лозинку, можете да изгубите ове податке.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Због тога је толико важно да направите кључ за опоравак налога - биће вам потребан да опоравите ваше податке.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Започните
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Откажи

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Повежите се са својом апликацијом за потврду идентитета
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>1. корак:</strong> Скенирајте овај КР код користећи било коју апликацију за потврду идентитета, као што су Duo или Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = КР код за подешавање потврде идентитета у два корака. Скенирајте га или изаберите „Не можете да скенирате КР код?” да бисте уместо тога добили тајни кључ за подешавање.
flow-setup-2fa-cant-scan-qr-button = Не можете да скенирате КР код?
flow-setup-2fa-manual-key-heading = Ручно унесите код
flow-setup-2fa-manual-key-instruction = <strong>Корак 1:</strong> Унесите овај код у своју омиљену апликацију за потврду идентитета.
flow-setup-2fa-scan-qr-instead-button = Скенирати КР код уместо тога?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Сазнајте више о апликацијама за потврду идентитета
flow-setup-2fa-button = Настави
flow-setup-2fa-step-2-instruction = <strong>Корак 2:</strong> Унесите код из своје апликације за потврду идентитета.
flow-setup-2fa-input-label = Унесите шестоцифрени код
flow-setup-2fa-code-error = Неисправан или истекао код. Проверите своју апликацију за потврду идентитета и покушајте поново.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Изаберите начин опоравка
flow-setup-2fa-backup-choice-description = Ово вам омогућава да се пријавите ако не можете да приступите свом мобилном уређају или апликацији за потврду идентитета.
flow-setup-2fa-backup-choice-phone-title = Телефон за опоравак
flow-setup-2fa-backup-choice-phone-badge = Најлакше
flow-setup-2fa-backup-choice-phone-info = Преузмите код за опоравак путем текстуалне поруке. Тренутно доступно у САД и Канади.
flow-setup-2fa-backup-choice-code-title = Резервни кодови за потврду идентитета
flow-setup-2fa-backup-choice-code-badge = Најбезбедније
flow-setup-2fa-backup-choice-code-info = Направите и сачувајте једнократне кодове за потврду идентитета.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Сазнајте више о опоравку и ризику од замене СИМ картице

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Унесите резервни код за потврду идентитета
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Потврдите да сте сачували кодове уносом једног од њих. Без ових кодова, можда нећете моћи да се пријавите ако немате апликацију за потврду идентитета.
flow-setup-2fa-backup-code-confirm-code-input = Унесите код од 10 знакова
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Заврши

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Сачувајте резервне кодове за потврду идентитета
flow-setup-2fa-backup-code-dl-save-these-codes = Чувајте их на месту које ћете запамтити. Ако немате приступ апликацији за потврду идентитета, мораћете да унесете један да бисте се пријавили.
flow-setup-2fa-backup-code-dl-button-continue = Настави

##

flow-setup-2fa-inline-complete-success-banner = Потврда идентитета у два корака је омогућена
flow-setup-2fa-inline-complete-success-banner-description = Да бисте заштитили све своје повезане уређаје, требало би да се одјавите свуда где користите овај налог, а затим се поново пријавите користећи своју нову потврду идентитета у два корака.
flow-setup-2fa-inline-complete-backup-code = Резервни кодови за потврду идентитета
flow-setup-2fa-inline-complete-backup-phone = Телефон за опоравак
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Преостао је { $count } код
        [few] Преостала су { $count } кода
       *[other] Преостало је { $count } кодова
    }
flow-setup-2fa-inline-complete-backup-code-description = Ово је најбезбеднији начин опоравка ако не можете да се пријавите помоћу мобилног уређаја или апликације за потврду идентитета.
flow-setup-2fa-inline-complete-backup-phone-description = Ово је најлакши начин опоравка ако не можете да се пријавите помоћу апликације за потврду идентитета.
flow-setup-2fa-inline-complete-learn-more-link = Како ово штити ваш налог
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Настави на { $serviceName }
flow-setup-2fa-prompt-heading = Подесите потврду идентитета у два корака
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } захтева да подесите потврду идентитета у два корака како би ваш налог био безбедан.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Можете користити било коју од <authenticationAppsLink>ових апликација за потврду идентитета</authenticationAppsLink> да бисте наставили.
flow-setup-2fa-prompt-continue-button = Настави

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Унесите потврдни код
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Шестоцифрени код је послат на <span>{ $phoneNumber }</span> путем текстуалне поруке. Овај код истиче након 5 минута.
flow-setup-phone-confirm-code-input-label = Унесите шестоцифрени код
flow-setup-phone-confirm-code-button = Потврди
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Код је истекао?
flow-setup-phone-confirm-code-resend-code-button = Пошаљи код поново
flow-setup-phone-confirm-code-resend-code-success = Код је послат
flow-setup-phone-confirm-code-success-message-v2 = Телефон за опоравак је додат
flow-change-phone-confirm-code-success-message = Телефон за опоравак је промењен

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Потврдите свој број телефона
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Добићете текстуалну поруку од { -brand-mozilla } са кодом за потврду вашег броја. Не делите овај код ни са ким.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Телефон за опоравак је доступан само у Сједињеним Државама и Канади. VoIP бројеви и маскирани бројеви телефона се не препоручују.
flow-setup-phone-submit-number-legal = Давањем свог броја, слажете се да га сачувамо како бисмо вам могли слати текстуалне поруке само ради потврде налога. Могу се применити трошкови за поруке и пренос података.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Пошаљи код

## HeaderLockup component, the header in account settings

header-menu-open = Затвори мени
header-menu-closed = Мени навигације странице
header-back-to-top-link =
    .title = Назад на врх
header-back-to-settings-link =
    .title = Назад на подешавања за { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Помоћ

## Linked Accounts section

la-heading = Повезани налози
la-description = Овластили сте приступ следећим повезаним налозима.
la-unlink-button = Уклони
la-unlink-account-button = Уклони
la-set-password-button = Постави лозинку
la-unlink-heading = Уклоните везу са налогом треће стране
la-unlink-content-3 = Јесте ли сигурни да желите да уклоните везу на свом налогу? Ова радња вас неће аутоматски одјавити са ових услуга. Да бисте то урадили, морате се ручно одјавити у одељку „Повезане услуге“.
la-unlink-content-4 = Пре него што прекинете везу са својим налогом, морате поставити лозинку. Без лозинке нећете моћи да се пријавите након прекида везе са налогом.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Затвори
modal-cancel-button = Откажи
modal-default-confirm-button = Потврди

## ModalMfaProtected

modal-mfa-protected-title = Унесите код за потврду
modal-mfa-protected-subtitle = Помозите нам да се уверимо да сте то ви који мењате информације о свом налогу
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Унесите код који је послат на <email>{ $email }</email> у року од { $expirationTime } минута.
        [few] Унесите код који је послат на <email>{ $email }</email> у року од { $expirationTime } минута.
       *[other] Унесите код који је послат на <email>{ $email }</email> у року од { $expirationTime } минута.
    }
modal-mfa-protected-input-label = Унесите шестоцифрени код
modal-mfa-protected-cancel-button = Откажи
modal-mfa-protected-confirm-button = Потврди
modal-mfa-protected-code-expired = Код је истекао?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Пошаљи нови код е-поштом.

## Modal Verify Session

mvs-verify-your-email-2 = Потврди адресу е-поште
mvs-enter-verification-code-2 = Унесите код за потврду
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Унесите код за потврду који је послан на <email>{ $email }</email> у року од 5 минута.
msv-cancel-button = Откажи
msv-submit-button-2 = Потврди

## Settings Nav

nav-settings = Подешавања
nav-profile = Профил
nav-security = Безбедност
nav-connected-services = Повезане услуге
nav-data-collection = Сакупљање и коришћење података
nav-paid-subs = Плаћене претплате
nav-email-comm = Комуникација путем е-поште

## Page2faChange

page-2fa-change-title = Промените потврду идентитета у два корака
page-2fa-change-success = Потврда идентитета у два корака је ажурирана
page-2fa-change-success-additional-message = Да бисте заштитили све своје повезане уређаје, требало би да се одјавите свуда где користите овај налог, а затим се поново пријавите користећи своју нову потврду идентитета у два корака.
page-2fa-change-totpinfo-error = Дошло је до грешке приликом замене ваше апликације за потврду идентитета у два корака. Покушајте поново касније.
page-2fa-change-qr-instruction = <strong>Корак 1:</strong> Скенирајте овај КР код користећи било коју апликацију за потврду идентитета, као што су Duo или Google Authenticator. Ово ствара нову везу, све старе везе више неће радити.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Резервни кодови за потврду идентитета
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Дошло је до грешке при мењању ваших резервних приступних кодова
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Дошло је до проблема при прављењу резервног приступног кода
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Резервни кодови за потврду идентитета су ажурирани
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Резервни кодови за потврду идентитета су направљени
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Чувајте их на месту које ћете запамтити. Ваши стари кодови ће бити замењени након што завршите следећи корак.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Потврдите да сте сачували своје кодове уносом једног од њих. Ваши стари резервни кодови за потврду идентитета ће бити онемогућени када се овај корак заврши.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Неисправан резервни код за потврду идентитета

## Page2faSetup

page-2fa-setup-title = Потврда идентитета у два корака
page-2fa-setup-totpinfo-error = Дошло је до грешке приликом подешавања потврде идентитета у два корака. Покушајте поново касније.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Тај код није исправан. Покушајте поново.
page-2fa-setup-success = Потврда идентитета у два корака је омогућена
page-2fa-setup-success-additional-message = Да бисте заштитили све своје повезане уређаје, требало би да се одјавите свуда где користите овај налог, а затим се поново пријавите користећи потврду идентитета у два корака.

## Avatar change page

avatar-page-title =
    .title = Слика профила
avatar-page-add-photo = Додај фотографију
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Сними фотографију
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Уклони фотографију
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Сними фотографију поново
avatar-page-cancel-button = Откажи
avatar-page-save-button = Сачувај
avatar-page-saving-button = Чувам…
avatar-page-zoom-out-button =
    .title = Умањи
avatar-page-zoom-in-button =
    .title = Увећај
avatar-page-rotate-button =
    .title = Ротирај
avatar-page-camera-error = Није могуће покренути камеру
avatar-page-new-avatar =
    .alt = нова слика профила
avatar-page-file-upload-error-3 = Дошло је до грешке при отпремању ваше слике профила.
avatar-page-delete-error-3 = Дошло је до грешке при брисању ваше слике профила
avatar-page-image-too-large-error-2 = Величина датотеке слике је превелика за отпремање

## Password change page

pw-change-header =
    .title = Промени лозинку
pw-8-chars = Најмање 8 знакова
pw-not-email = Није ваша адреса е-поште
pw-change-must-match = Нова лозинка одговара потврди
pw-commonly-used = Није често употребљавана лозинка
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Будите безбедни - немојте да дуплирате лозинке. Погледајте савете за <linkExternal>прављење јаких лозинки</linkExternal>.
pw-change-cancel-button = Откажи
pw-change-save-button = Сачувај
pw-change-forgot-password-link = Заборавили сте лозинку?
pw-change-current-password =
    .label = Унесите тренутну лозинку
pw-change-new-password =
    .label = Унесите нову лозинку
pw-change-confirm-password =
    .label = Потврдите нову лозинку
pw-change-success-alert-2 = Лозинка је ажурирана

## Password create page

pw-create-header =
    .title = Направи лозинку
pw-create-success-alert-2 = Лозинка је постављена
pw-create-error-2 = Жао нам је, дошло је до грешке при постављању лозинке

## Delete account page

delete-account-header =
    .title = Обриши налог
delete-account-step-1-2 = Корак 1 од 2
delete-account-step-2-2 = Корак 2 од 2
delete-account-confirm-title-4 = Можда сте повезали свој { -product-mozilla-account } са једним или више следећих { -brand-mozilla } производа или услуга који вас чине безбедним и продуктивним на вебу:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Усклађивање { -brand-firefox } података
delete-account-product-firefox-addons = { -brand-firefox } додаци
delete-account-acknowledge = Брисањем налога признајете да:
delete-account-chk-box-1-v4 =
    .label = Све плаћене претплате које имате ће бити отказане
delete-account-chk-box-2 =
    .label = Можете изгубити податке и функције сачуване на { -brand-mozilla } производима
delete-account-chk-box-3 =
    .label = Поновна активација ове адресе е-поште неће повратити сачуване податке
delete-account-chk-box-4 =
    .label = Сва проширења и теме које сте објавили на addons.mozilla.org биће обрисане
delete-account-continue-button = Настави
delete-account-password-input =
    .label = Унесите лозинку
delete-account-cancel-button = Откажи
delete-account-delete-button-2 = Обриши

## Display name page

display-name-page-title =
    .title = Име за приказ
display-name-input =
    .label = Унесите име за приказ
submit-display-name = Сачувај
cancel-display-name = Откажи
display-name-update-error-2 = Дошло је до грешке при ажурирању вашег имена за приказ
display-name-success-alert-2 = Име за приказ је ажурирано

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Недавне активности налога
recent-activity-account-create-v2 = Налог је направљен
recent-activity-account-disable-v2 = Налог је онемогућен
recent-activity-account-enable-v2 = Налог је омогућен
recent-activity-account-login-v2 = Покренута је пријава на налог
recent-activity-account-reset-v2 = Покренуто је ресетовање лозинке
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Враћене е-поруке су очишћене
recent-activity-account-login-failure = Неуспешан покушај пријаве на налог
recent-activity-account-two-factor-added = Потврда идентитета у два корака је омогућена
recent-activity-account-two-factor-requested = Затражена је потврда идентитета у два корака
recent-activity-account-two-factor-failure = Потврда идентитета у два корака није успела
recent-activity-account-two-factor-success = Потврда идентитета у два корака је успешна
recent-activity-account-two-factor-removed = Уклоњена је двофакторска потврда идентитета
recent-activity-account-password-reset-requested = Затражено је ресетовање лозинке налога
recent-activity-account-password-reset-success = Успешно је ресетована лозинка налога
recent-activity-account-recovery-key-added = Омогућен је кључ за опоравак налога
recent-activity-account-recovery-key-verification-failure = Није успела потврда кључа за опоравак налога
recent-activity-account-recovery-key-verification-success = Успела је потврда кључа за опоравак налога
recent-activity-account-recovery-key-removed = Уклоњен је кључ за опоравак налога
recent-activity-account-password-added = Додата је нова лозинка
recent-activity-account-password-changed = Лозинка је промењена
recent-activity-account-secondary-email-added = Додата је секундарна адреса е-поште
recent-activity-account-secondary-email-removed = Уклоњена је секундарна адреса е-поште
recent-activity-account-emails-swapped = Замењене су примарна и секундарна е-пошта
recent-activity-session-destroy = Одјављени сте из сесије
recent-activity-account-recovery-phone-send-code = Послат је код на телефон за опоравак
recent-activity-account-recovery-phone-setup-complete = Подешавање телефона за опоравак је завршено
recent-activity-account-recovery-phone-signin-complete = Пријава телефоном за опоравак је завршена
recent-activity-account-recovery-phone-signin-failed = Пријава телефоном за опоравак није успела
recent-activity-account-recovery-phone-removed = Телефон за опоравак је уклоњен
recent-activity-account-recovery-codes-replaced = Кодови за опоравак су замењени
recent-activity-account-recovery-codes-created = Кодови за опоравак су направљени
recent-activity-account-recovery-codes-signin-complete = Пријава кодовима за опоравак је завршена
recent-activity-password-reset-otp-sent = Код за потврду ресетовања лозинке је послат
recent-activity-password-reset-otp-verified = Код за потврду ресетовања лозинке је потврђен
recent-activity-must-reset-password = Обавезно ресетовање лозинке
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Друга активност на налогу

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Кључ за опоравак налога
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Назад на подешавања

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Уклоните број телефона за опоравак
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Ово ће уклонити <strong>{ $formattedFullPhoneNumber }</strong> као ваш телефон за опоравак.
settings-recovery-phone-remove-recommend = Препоручујемо вам да задржите овај метод јер је лакши од чувања резервних кодова за потврду идентитета.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Ако га избришете, уверите се да и даље имате сачуване резервне кодове за потврду идентитета. <linkExternal>Упоредите методе опоравка</linkExternal>
settings-recovery-phone-remove-button = Уклони број телефона
settings-recovery-phone-remove-cancel = Откажи
settings-recovery-phone-remove-success = Телефон за опоравак је успешно уклоњен

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Додајте телефон за опоравак
page-change-recovery-phone = Промени телефон за опоравак
page-setup-recovery-phone-back-button-title = Назад на подешавања
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Промени број телефона

## Add secondary email page

add-secondary-email-step-1 = Корак 1 од 2
add-secondary-email-error-2 = Дошло је до грешке при стварању ове е-поште
add-secondary-email-page-title =
    .title = Секундарна е-пошта
add-secondary-email-enter-address =
    .label = Унесите адресу е-поште
add-secondary-email-cancel-button = Откажи
add-secondary-email-save-button = Сачувај
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Маске е-поште се не могу користити као секундарна е-пошта

## Verify secondary email page

add-secondary-email-step-2 = Корак 2 од 2
verify-secondary-email-page-title =
    .title = Секундарна е-пошта
verify-secondary-email-verification-code-2 =
    .label = Унесите код за потврду
verify-secondary-email-cancel-button = Откажи
verify-secondary-email-verify-button-2 = Потврди
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Унесите код за потврду који вам је послан на <strong>{ $email }</strong> у року од 5 минута.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } је успешно додан.
verify-secondary-email-resend-code-button = Поново пошаљи код за потврду

##

# Link to delete account on main Settings page
delete-account-link = Обриши налог
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Успешно сте се пријавили. Ваш { -product-mozilla-account } и подаци ће остати активни.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Сазнајте где су ваши приватни подаци изложени и преузмите контролу
# Links out to the Monitor site
product-promo-monitor-cta = Преузмите бесплатно скенирање

## Profile section

profile-heading = Профил
profile-picture =
    .header = Слика
profile-display-name =
    .header = Име за приказ
profile-primary-email =
    .header = Примарна е-пошта

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Корак { $currentStep } од { $numberOfSteps }.

## Security section of Setting

security-heading = Безбедност
security-password =
    .header = Лозинка
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Створено { $date }
security-not-set = Није постављено
security-action-create = Направи
security-set-password = Поставите лозинку да омогућите усклађивање и безбедносне функција налога.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Погледајте недавне активности на налогу
signout-sync-header = Сесија је истекла
signout-sync-session-expired = Нажалост, нешто је пошло наопако. Одјавите се из менија прегледача и покушајте поново.

## SubRow component

tfa-row-backup-codes-title = Резервни кодови за потврду идентитета
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Нема доступних кодова
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Преостао је { $numCodesAvailable } код
        [few] Преостала су { $numCodesAvailable } кода
       *[other] Преостало је { $numCodesAvailable } кодова
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Направи нове кодове
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Додај
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Ово је најсигурнији начин опоравка ако не можете да користите свој мобилни уређај или апликацију за потврду идентитета.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Телефон за опоравак
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Није додат број телефона
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Промени
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Додај
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Уклони
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Уклони телефон за опоравак
tfa-row-backup-phone-delete-restriction-v2 = Ако желите да уклоните свој телефон за опоравак, прво додајте резервне кодове за потврду идентитета или онемогућите потврду идентитета у два корака како бисте избегли закључавање налога.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Ово је најлакши начин опоравка ако не можете да користите апликацију за потврду идентитета.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Сазнајте више о ризику од замене СИМ картице
# This is a string that shows when the user's passkey was created.
# Variables:
#   $createdDate (String) - a localized date string
passkey-sub-row-created-date = Направљено: { $createdDate }
# This is a string that shows when the user's passkey was last used.
# Variables:
#   $lastUsedDate (String) - a localized date string
passkey-sub-row-last-used-date = Последњи пут коришћено: { $lastUsedDate }
passkey-sub-row-delete-title = Обриши приступни кључ
passkey-delete-modal-heading = Желите ли да обришете приступни кључ?
passkey-delete-modal-content = Овај приступни кључ ће бити уклоњен са вашег налога. Мораћете да се пријавите на други начин.
passkey-delete-modal-cancel-button = Откажи
passkey-delete-modal-confirm-button = Обриши приступни кључ
passkey-delete-success = Приступни кључ је обрисан
passkey-delete-error = Дошло је до проблема приликом брисања вашег приступног кључа. Покушајте поново за неколико минута.

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Искључи
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Укључи
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Шаљем…
switch-is-on = укључено
switch-is-off = искључено

## Sub-section row Defaults

row-defaults-action-add = Додај
row-defaults-action-change = Промени
row-defaults-action-disable = Онемогући
row-defaults-status = Ништа

## UnitRowPasskey

passkey-row-header = Приступни кључеви
passkey-row-enabled = Омогућено
passkey-row-not-set = Није постављено
passkey-row-action-create = Направи
passkey-row-description = Олакшајте пријаву и учините је безбеднијом коришћењем телефона или другог подржаног уређаја за приступ вашем налогу.
# External link to a support article about passkeys.
passkey-row-info-link-2 = Сазнајте више

## Account recovery key sub-section on main Settings page

rk-header-1 = Кључ за опоравак налога
rk-enabled = Омогућено
rk-not-set = Није постављено
rk-action-create = Направи
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Промени
rk-action-remove = Уклони
rk-key-removed-2 = Кључ за опоравак налога је уклоњен
rk-cannot-remove-key = Није могуће уклонити ваш кључ за опоравак налога.
rk-refresh-key-1 = Освежи кључ за опоравак налога
rk-content-explain = Вратите ваше податке када заборавите лозинку.
rk-cannot-verify-session-4 = Жао нам је, дошло је до грешке при потврђивању ваше сесије
rk-remove-modal-heading-1 = Уклонити кључ за опоравак налога?
rk-remove-modal-content-1 =
    Када ресетујете лозинку, више нећете моћи да
    користите кључ за опоравак налога за приступ подацима. Ова радња се не може опозвати.
rk-remove-error-2 = Није могуће уклонити ваш кључ за опоравак налога
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Избриши кључ за опоравак налога

## Secondary email sub-section on main Settings page

se-heading = Секундарна е-пошта
    .header = Секундарна е-пошта
se-cannot-refresh-email = Жао нам је, дошло је до проблема приликом освежавања е-поште.
se-cannot-resend-code-3 = Жао нам је, дошло је до грешке при поновном слању кода за потврду
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } је сада ваша примарна адреса е-поште
se-set-primary-error-2 = Жао нам је, дошло је до грешке при мењању ваше примарне е-поште
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } је успешно обрисана
se-delete-email-error-2 = Жао нам је, дошло је до грешке при брисању ове е-поште
se-verify-session-3 = Мораћете да потврдите тренутну сесију да бисте извршили ову радњу.
se-verify-session-error-3 = Жао нам је, дошло је до грешке при потврђивању ваше сесије
# Button to remove the secondary email
se-remove-email =
    .title = Уклони е-пошту
# Button to refresh secondary email status
se-refresh-email =
    .title = Освежи е-пошту
se-unverified-2 = непотврђено
se-resend-code-2 =
    Потребна је потврда. <button>Поново пошаљите код за потврду</button>
    ако није у вашем пријемном сандучету или нежељеној пошти.
# Button to make secondary email the primary
se-make-primary = Подеси као примарно
se-default-content = Приступите вашем налогу ако не можете да се пријавите на примарну е-пошту.
se-content-note-1 =
    Напомена: секундарна адреса е-поште неће вратити ваше податке,
    већ вам за то треба <a>кључ за опоравак налога</a>.
# Default value for the secondary email
se-secondary-email-none = Ништа

## Two Step Auth sub-section on Settings main page

tfa-row-header = Аутентификација у два корака
tfa-row-enabled = Омогућено
tfa-row-disabled-status = Онемогућено
tfa-row-action-add = Додај
tfa-row-action-disable = Онемогући
tfa-row-action-change = Промени
tfa-row-button-refresh =
    .title = Освежите аутентификацију у два корака
tfa-row-cannot-refresh =
    Жао нам је, дошло је до проблема при освежавању
    аутентификације у два корака.
tfa-row-enabled-description = Ваш налог је заштићен потврдом идентитета у два корака. Мораћете да унесете једнократну лозинку из ваше апликације за потврду идентитета приликом пријављивања на ваш { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Како ово штити ваш налог
tfa-row-disabled-description-v2 = Помозите у обезбеђивању вашег налога коришћењем спољне апликације за потврду идентитета као другог корака за пријаву.
tfa-row-cannot-verify-session-4 = Жао нам је, дошло је до грешке при потврђивању ваше сесије
tfa-row-disable-modal-heading = Онемогућити аутентификацију у два корака?
tfa-row-disable-modal-confirm = Онемогући
tfa-row-disable-modal-explain-1 =
    Нећете моћи да опозовете ову радњу. Такође,
    имате опцију за <linkExternal>замену ваших резервних приступних кодова</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Аутентификација у два корака онемогућена
tfa-row-cannot-disable-2 = Није могуће онемогућити аутентификацију у два корака
tfa-row-verify-session-info = Треба да потврдите своју тренутну сесију да бисте подесили потврду идентитета у два корака

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list of <serviceName>: Terms of Service, Privacy Notice
terms-privacy-agreement-intro-3 = Настављањем се слажете са следећим:
# This item is part of a bulleted list and follows terms-privacy-agreement-intro
# $serviceName (String) - The name of the service (e.g., "Mozilla Subscription Services")
# $serviceName is customizable via Strapi and will be localized separately
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Услови коришћења</termsLink> и <privacyLink>Обавештење о приватности</privacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>Услови коришћења</mozillaAccountsTos> and <mozillaAccountsPrivacy>Обавештење о приватности</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Настављањем се слажете са <mozillaAccountsTos>условима коришћења</mozillaAccountsTos> и <mozillaAccountsPrivacy>обавештењем о приватности</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = или
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Пријавите се помоћу
continue-with-google-button = Наставите са { -brand-google }-ом
continue-with-apple-button = Наставите са { -brand-apple }-ом

## Auth-server based errors that originate from backend service

auth-error-102 = Непознат налог
auth-error-103 = Погрешна лозинка
auth-error-105-2 = Неисправан код за потврду
auth-error-110 = Неважећи токен
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Покушали сте превише пута. Покушајте поново касније.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Покушали сте превише пута. Покушајте поново за { $retryAfter }.
auth-error-125 = Захтев је блокиран из безбедносних разлога
auth-error-129-2 = Унели сте неисправан број телефона. Проверите га и покушајте поново.
auth-error-138-2 = Непотврђена сесија
auth-error-139 = Секундарна адреса мора бити другачија од адресе вашег налога
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Ова е-пошта је резервисана за други налог. Покушајте поново касније или користите другу адресу е-поште.
auth-error-155 = TOTP токен није пронађен
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Резервна шифра за потврду идентитета није пронађена
auth-error-159 = Неисправан кључ за опоравак налога
auth-error-183-2 = Неисправан или истекао код за потврду
auth-error-202 = Функција није омогућена
auth-error-203 = Систем је недоступан, покушајте поново ускоро
auth-error-206 = Није могуће направити лозинку, лозинка је већ постављена
auth-error-214 = Број телефона за опоравак већ постоји
auth-error-215 = Број телефона за опоравак не постоји
auth-error-216 = Достигнуто је ограничење текстуалних порука
auth-error-218 = Не могу да уклоним телефон за опоравак, недостају резервни кодови за потврду идентитета.
auth-error-219 = Овај број телефона је регистрован на превише налога. Покушајте са другим бројем.
auth-error-224 = Приступни кључ није пронађен
auth-error-225 = Приступни кључ је већ регистрован
auth-error-226 = Достигнуто је ограничење за приступни кључ
auth-error-227 = Потврђивање идентитета приступним кључем није успело
auth-error-228 = Регистрација приступног кључа није успела
auth-error-238 = Провера приступног кључа није успела
auth-error-999 = Неочекивана грешка
auth-error-1001 = Покушај пријаве отказан
auth-error-1002 = Сесија је истекла. Пријавите се да бисте наставили.
auth-error-1003 = Локално складиште или колачићи су и даље онемогућени
auth-error-1008 = Нова лозинка мора да буде другачија
auth-error-1010 = Потребна је важећа лозинка
auth-error-1011 = Потребна је важећа адреса е-поште
auth-error-1018 = Ваша е-пошта за потврду је управо враћена. Да ли сте погрешно укуцали адресу?
auth-error-1020 = Погрешно укуцана е-пошта? firefox.com није важећа услуга е-поште
auth-error-1031 = Морате унети своје године да бисте се регистровали
auth-error-1032 = Морате унети важеће године да бисте се регистровали
auth-error-1054 = Неисправна шифра за потврду идентитета у два корака
auth-error-1056 = Неисправан резервни код за потврду идентитета
auth-error-1062 = Неисправно преусмеравање
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Погрешно укуцана е-пошта? { $domain } није важећа услуга е-поште
auth-error-1066 = Маске е-поште се не могу користити за прављење налога.
auth-error-1067 = Погрешно укуцана е-пошта?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Број који се завршава на { $lastFourPhoneNumber }
oauth-error-1000 = Нешто није у реду. Затворите овај језичак и покушајте поново.

## Passkey error messages
## Surfaced when a WebAuthn ceremony (registration or sign-in) fails.


# Registration errors

# User cancelled or dismissed the browser prompt, or the authenticator could not satisfy the options
passkey-registration-error-not-allowed = Подешавање приступног кључа није успело или је недоступно. Покушајте поново или изаберите други начин.
# The ceremony timed out before the user responded
passkey-registration-error-timeout = Подешавање приступног кључа је отказано. Покушајте поново.
# Browser or platform does not support passkeys or the requested options (e.g., UV, discoverable credential)
passkey-registration-error-not-supported = Приступни кључеви нису подржани овде. Покушајте други начин или уређај.
# RP ID / origin mismatch, or insecure context (e.g., embedded iframe, wrong domain)
passkey-registration-error-security = Приступни кључеви се не могу подесити на овој страници. Користите безбедну веб страницу и покушајте поново.
# A credential for this RP already exists on the authenticator (excludeCredentials match)
passkey-registration-error-invalid-state = Овај приступни кључ је већ регистрован. Користите га за пријаву или додајте други приступни кључ.
# Authenticator I/O failure (e.g., security key disconnected mid-ceremony)
passkey-registration-error-not-readable = Нисмо могли да приступимо потврђивачу. Покушајте поново или изаберите други начин.
# Attestation constraints or device-specific restrictions can't be met
passkey-registration-error-constraint = Подешавање приступног кључа није доступно на овом уређају. Покушајте други начин или уређај.
# Catch-all for unexpected errors during registration (TypeError, DataError, EncodingError, OperationError, UnknownError)
passkey-registration-error-unexpected = Подешавање приступног кључа није успело. Покушајте поново или изаберите други начин.

# Authentication errors

# User cancelled or dismissed the browser prompt, or no passkey is available / verification failed
passkey-authentication-error-not-allowed = Пријава приступним кључем није успела или је недоступна. Покушајте поново или изаберите други начин.
# The ceremony timed out before the user responded
passkey-authentication-error-timeout = Захтев за приступни кључ је истекао. Покушајте поново.
# Browser or platform does not support passkeys
passkey-authentication-error-not-supported = Приступни кључеви нису подржани. Покушајте други начин или уређај.
# RP ID / origin mismatch, or insecure context (e.g., embedded iframe)
passkey-authentication-error-security = Приступни кључеви се не могу користити на овој страници. Проверите да ли сте на исправном безбедном сајту и покушајте поново.
# Unexpected credential state during authentication
passkey-authentication-error-invalid-state = Нешто није у реду са вашим приступним кључем. Покушајте поново или користите други начин пријаве.
# Authenticator I/O failure (e.g., security key disconnected mid-ceremony)
passkey-authentication-error-not-readable = Нисмо могли да приступимо потврђивачу. Покушајте поново или користите други начин пријаве.
# Catch-all for unexpected errors during authentication (TypeError, DataError, EncodingError, ConstraintError, OperationError, UnknownError)
passkey-authentication-error-unexpected = Нешто је пошло наопако. Покушајте поново или изаберите други начин пријаве.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Пријављени сте на { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Е-пошта је потврђена
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Пријава потврђена
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Пријавите се на овај { -brand-firefox } да завршите подешавање
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Пријави се
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Још додајете уређаје? Пријавите се у { -brand-firefox } на другом уређају да довршите подешавање
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Пријавите се на { -brand-firefox } на другом уређају да завршите подешавање
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Желите да имате језичке, обележиваче и лозинке на другом уређају?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Повежи други уређај
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Не сада
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Пријавите се на { -brand-firefox } за Android да завршите подешавање
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Пријавите се на { -brand-firefox } за iOS да завршите подешавање

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Потребни су локално складиште и колачићи
cookies-disabled-enable-prompt-2 = Омогућите колачиће и локално складиште у свом прегледнику да бисте приступили свом { -product-mozilla-account }. То ће омогућити функционалности као што је памћење између сесија.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Покушај поново
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Сазнај више

## Index / home page

index-header = Унесите своју адресу е-поште
index-sync-header = Наставите на свој { -product-mozilla-account }
index-sync-subheader = Усагласите своје лозинке, језичке и обележиваче свуда где користите { -brand-firefox }.
index-relay-header = Направите маску е-поште
index-relay-subheader = Наведите адресу е-поште на коју желите да прослеђујете поруке са ваше маскиране е-поште.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Наставите на { $serviceName }
index-subheader-default = Наставите на подешавања налога
index-cta = Пријавите се или направите налог
index-account-info = { -product-mozilla-account } такође омогућава приступ већем броју производа за заштиту приватности од { -brand-mozilla }.
index-email-input =
    .label = Унесите своју адресу е-поште
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Налог је успешно обрисан
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Ваша е-пошта за потврду је управо враћена. Да ли сте погрешно укуцали адресу?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Упс! Нисмо могли да направимо ваш кључ за опоравак налога. Покушајте поново касније.
inline-recovery-key-setup-recovery-created = Кључ за опоравак налога је направљен
inline-recovery-key-setup-download-header = Осигурајте свој налог
inline-recovery-key-setup-download-subheader = Преузмите га и сачувајте сада
inline-recovery-key-setup-download-info = Сачувајте овај кључ негде где ћете га запамтити - касније нећете моћи да се вратите на ову страницу.
inline-recovery-key-setup-hint-header = Препорука за безбедност

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Откажи постављање
inline-totp-setup-continue-button = Настави
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Побољшајте безбедност вашег налога захтевањем приступних кодова од једне од <authenticationAppsLink>ових апликација за аутентификацију</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Омогућите аутентификацију у два корака <span>да наставите на подешавања налога</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Омогућите аутентификацију у два корака <span>да наставите на { $serviceName }</span>
inline-totp-setup-ready-button = Готово
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Скенирајте приступни код <span>да наставите на { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Ручно унесите код <span>да наставите на { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Скенирајте приступни код <span>да наставите на подешавања налога</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Ручно унесите код <span>да наставите на подешавања налога</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Унесите овај тајни кључ у вашу апликацију за аутентификацију. <toggleToQRButton>Скенирајте QR код?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Скенирајте QR код у вашој апликацији за аутентификацију и унесите приступни код из исте. <toggleToManualModeButton>Не можете да скенирате QR код?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = По завршетку, аутоматски ће почети да прави приступне кодове за ваше пријаве.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Приступни код
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Потребна је шифра за потврду идентитета
tfa-qr-code-alt = Користите шифру { $code } да бисте подесили потврду идентитета у два корака у подржаним програмима.
inline-totp-setup-page-title = Потврда идентитета у два корака

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Правно
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Услови коришћења
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Обавештење о приватности

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Обавештење о приватности

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Услови коришћења

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Јесте ли се управо пријавили у { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Да, одобри уређај
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Ако то нисте били ви, <link>промените лозинку</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Уређај је повезан
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Сада се усклађујете са: { $deviceFamily } ({ $deviceOS })
pair-auth-complete-sync-benefits-text = Сада можете да приступите отвореним језичцима, лозинкама и обележивачима на свим уређајима.
pair-auth-complete-see-tabs-button = Прикажи језичке са усклађених уређаја
pair-auth-complete-manage-devices-link = Управљајте уређајима

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Унесите приступни код <span>да наставите на подешавања налога</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Унесите приступни код <span>да наставите на { $serviceName }</span>
auth-totp-instruction = Отворите вашу апликацију за аутентификацију и унесите приступни код који нуди.
auth-totp-input-label = Унесите шестоцифрени код
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Потврди
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Потребан је приступни код

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Сада је потребно одобрење <span>са вашег другог уређаја</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Упаривање није успело
pair-failure-message = Процес подешавања је окончан.

## Pair index page

pair-sync-header = Усклађујте { -brand-firefox } на вашем телефону или таблету
pair-cad-header = Повежите { -brand-firefox } на другом уређају
pair-already-have-firefox-paragraph = Већ имате { -brand-firefox } на телефону или таблету?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Усклади уређај
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Или преузми
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Скенирајте да преузмете { -brand-firefox } за мобилне или пошаљите себи <linkExternal>везу за преузимање</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Не сада
pair-take-your-data-message = Понесите ваше језичке, обележиваче и лозинке свуда где користите { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Започните
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR код

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Уређај је повезан
pair-success-message-2 = Упаривање је успело.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Потврдите упаривање <span>за { $email }</span>
pair-supp-allow-confirm-button = Потврдите упаривање
pair-supp-allow-cancel-link = Откажи

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Сада је потребно одобрење <span>са вашег другог уређаја</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Упаривање помоћу апликације
pair-unsupported-message = Да ли сте користили системску камеру? Морате да се упарите у оквиру { -brand-firefox } апликације.

## ServiceWelcome page
## Shown to users after signup/signin for services like VPN

service-welcome-signup-success-banner = { -product-mozilla-account } је потврђен
service-welcome-signin-success-banner = Успешно сте пријављени!
# In this context, "VPN" is a VPN service built into the Firefox browser, and generally isn't localized differently than "VPN"
service-welcome-vpn-heading = Следеће: Укључите VPN
service-welcome-vpn-description = Још један корак за повећање приватности вашег прегледача. Идите на отворени панел и укључите га.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Направите лозинку за усклађивање
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Ово шифрује ваше податке. Мора се разликовати од лозинке за ваш { -brand-google } или { -brand-apple } налог.

## SetPassword page for passwordless flow
## Users who signed in via passwordless OTP and need to create a password for Sync

set-password-passwordless-info = Ова лозинка шифрује ваше усклађене податке и чини их безбедним.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Сачекајте тренутак, бићете преусмерени на овлашћени програм.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Унесите свој кључ за опоравак налога
account-recovery-confirm-key-instruction = Овај кључ опоравља ваше шифроване податке прегледања, као што су лозинке и обележивачи, са { -brand-firefox } сервера.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Унесите свој кључ за опоравак налога од 32 знака
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Ваш савет за складиште је:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Настави
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Не можете да пронађете свој кључ за опоравак налога?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Направите нову лозинку
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Лозинка је постављена
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Жао нам је, дошло је до грешке при постављању лозинке
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Користи кључ за опоравак налога
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Ваша лозинка је ресетована.
reset-password-complete-banner-message = Не заборавите да генеришете нови кључ за опоравак налога у подешавањима за { -product-mozilla-account } како бисте спречили будуће проблеме са пријавом.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } ће покушати да вас врати на коришћење маске е-поште након што се пријавите.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Унесите код од 10 знакова
confirm-backup-code-reset-password-confirm-button = Потврди
confirm-backup-code-reset-password-subheader = Унесите резервни код за потврду идентитета
confirm-backup-code-reset-password-instruction = Унесите један од кодова за једнократну употребу које сте сачували приликом подешавања потврде идентитета у два корака.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Не можете да приступите налогу?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Проверите своју е-пошту
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Послали смо код за потврду на <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Унесите 8-цифрени код у року од 10 минута
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Настави
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Поново пошаљи код
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Користите други налог

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Ресетујте своју лозинку
confirm-totp-reset-password-subheader-v2 = Унесите код за потврду идентитета у два корака
confirm-totp-reset-password-instruction-v2 = Проверите своју <strong>апликацију за потврду идентитета</strong> да бисте ресетовали лозинку.
confirm-totp-reset-password-trouble-code = Проблеми са уносом кода?
confirm-totp-reset-password-confirm-button = Потврди
confirm-totp-reset-password-input-label-v2 = Унесите шестоцифрени код
confirm-totp-reset-password-use-different-account = Користите други налог

## ResetPassword start page

password-reset-flow-heading = Поништавање лозинке
password-reset-body-2 = Тражићемо неколико ствари које само ви знате како бисмо сачували безбедност вашег налога.
password-reset-email-input =
    .label = Унесите своју адресу е-поште
password-reset-submit-button-2 = Настави

## ResetPasswordConfirmed

reset-password-complete-header = Ваша лозинка је ресетована
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Настави на { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Ресетујте лозинку
password-reset-recovery-method-subheader = Изаберите начин опоравка
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Уверимо се да сте то ви користећи ваше начине опоравка.
password-reset-recovery-method-phone = Телефон за опоравак
password-reset-recovery-method-code = Резервни кодови за потврду идентитета
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Преостао је { $numBackupCodes } код
        [few] Преостала су { $numBackupCodes } кода
       *[other] Преостало је { $numBackupCodes } кодова
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Дошло је до проблема приликом слања кода на ваш телефон за опоравак
password-reset-recovery-method-send-code-error-description = Покушајте поново касније или употребите своје резервне кодове за потврду идентитета.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Ресетујте своју лозинку
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Унесите код за опоравак
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Шестоцифрени код је послат текстуалном поруком на број телефона који се завршава на <span>{ $lastFourPhoneDigits }</span>. Овај код истиче након 5 минута. Не делите овај код ни са ким.
reset-password-recovery-phone-input-label = Унесите шестоцифрени код
reset-password-recovery-phone-code-submit-button = Потврди
reset-password-recovery-phone-resend-code-button = Пошаљи код поново
reset-password-recovery-phone-resend-success = Код је послат
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Да ли сте закључани?
reset-password-recovery-phone-send-code-error-heading = Дошло је до проблема при слању кода
reset-password-recovery-phone-code-verification-error-heading = Дошло је до проблема при верификацији вашег кода
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Покушајте поново касније.
reset-password-recovery-phone-invalid-code-error-description = Код је неисправан или је истекао.
reset-password-recovery-phone-invalid-code-error-link = Користити резервне кодове за потврду идентитета уместо тога?
reset-password-with-recovery-key-verified-page-title = Успешно ресетовање лозинке
reset-password-complete-new-password-saved = Нова лозинка је сачувана!
reset-password-complete-recovery-key-created = Направљен је нови кључ за опоравак налога. Преузмите га и сачувајте сада.
reset-password-complete-recovery-key-download-info = Овај кључ је неопходан за опоравак података ако заборавите лозинку. <b>Преузмите га и безбедно сачувајте сада, јер касније нећете моћи поново да приступите овој страници.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Грешка:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Пријава се потрвђује…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Грешка при потврди
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Веза за потврду је истекла
signin-link-expired-message-2 = Веза на коју сте кликнули је истекла или је већ искоришћена.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Унесите лозинку <span>за свој { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Настави на { $serviceName }
signin-subheader-without-logo-default = Настави на подешавања налога
signin-button = Пријави се
signin-header = Пријави се
signin-use-a-different-account-link = Користи други налог
signin-forgot-password-link = Заборавили сте лозинку?
signin-password-button-label = Лозинка
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } ће покушати да вас врати на коришћење маске е-поште након што се пријавите.
signin-code-expired-error = Кôд је истекао. Пријавите се поново.
# Error message displayed when OAuth native flow recovery fails
signin-recovery-error = Нешто је пошло наопако. Пријавите се поново.
signin-account-locked-banner-heading = Ресетујте лозинку
signin-account-locked-banner-description = Закључали смо ваш налог како бисмо га заштитили од сумњивих активности.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Ресетујте лозинку да бисте се пријавили

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Веза на коју сте кликнули нема све знакове и можда ју је покварио ваш клијент е-поште. Пажљиво копирајте адресу и покушајте поново.
report-signin-header = Пријави неовлашћену пријаву?
report-signin-body = Примили сте е-поруку о покушају приступа вашем налогу. Желите ли да пријавите ову активност као сумњиву?
report-signin-submit-button = Пријави активност
report-signin-support-link = Зашто се ово дешава?
report-signin-error = Нажалост, дошло је до проблема приликом слања извештаја.
signin-bounced-header = Жао нам је. Закључали смо ваш налог.
# $email (string) - The user's email.
signin-bounced-message = Потврдна порука е-поште коју смо послали на { $email } је враћена, те смо закључали ваш налог да заштитимо ваше { -brand-firefox } податке.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Ако је ово исправна адреса е-поште, <linkExternal>јавите нам се</linkExternal> и помоћи ћемо вам око откључавања налога.
signin-bounced-create-new-account = То више није ваша адреса е-поште? Направите нови налог
back = Назад

## SigninPasskeyFallback page
## Users who authenticate with a passkey to access Sync must also enter their password.

signin-passkey-fallback-header = Завршите пријављивање
signin-passkey-fallback-heading = Унесите лозинку за усклађивање
signin-passkey-fallback-body = Да бисте сачували безбедност својих података, потребно је да унесете лозинку када користите овај приступни кључ.
signin-passkey-fallback-password-label = Лозинка
signin-passkey-fallback-go-to-settings = Идите у подешавања
signin-passkey-fallback-continue = Настави

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## SigninPasswordlessCode page
## Users are prompted to enter a code sent to their email for passwordless authentication.

signin-passwordless-code-heading = Унесите код за потврду
signin-passwordless-code-subheading = Пријављивање захтева само један корак када користите овај код.
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationMinutes (Number) - the expiration time in minutes
signin-passwordless-code-instruction =
    { $expirationMinutes ->
        [one] Унесите код који је послат на <email>{ $email }</email> у року од { $expirationMinutes } минут.
        [few] Унесите код који је послат на <email>{ $email }</email> у року од { $expirationMinutes } минута.
       *[other] Унесите код који је послат на <email>{ $email }</email> у року од { $expirationMinutes } минута.
    }
signin-passwordless-code-input-label = Унесите осмоцифрени код
signin-passwordless-code-confirm-button = Потврди
signin-passwordless-code-required-error = Потребан је код за потврду
signin-passwordless-code-expired = Код је истекао?
# { $seconds } - countdown timer showing seconds until user can request a new code
signin-passwordless-code-resend-countdown =
    { $count ->
        [one] Пошаљи нови код е-поштом за { $seconds } секунду
        [few] Пошаљи нови код е-поштом за { $seconds } секунде
       *[other] Пошаљи нови код е-поштом за { $seconds } секунди
    }
signin-passwordless-code-resend-link = Пошаљи нови код е-поштом.
signin-passwordless-code-resend-error = Нешто је пошло наопако. Нови код није могао бити послат.
signin-passwordless-code-other-account-link = Користите други налог

## SignupPasswordlessCode page
## Users are prompted to enter a code sent to their email to create a new account without a password.

signup-passwordless-code-subheading = Регистрација захтева само један корак када користите овај код.

## Error messages

# Shown when a user with 2FA enabled tries to use passwordless flow
# They are redirected to password signin instead
signin-passwordless-totp-required = Потврда идентитета у два корака је омогућена на вашем налогу. Пријавите се помоћу своје лозинке.

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Потврдите ову пријаву <span>да бисте наставили на подешавања налога</span>
signin-push-code-heading-w-custom-service = Потврдите ову пријаву <span>да бисте наставили на { $serviceName }</span>
signin-push-code-instruction = Проверите своје друге уређаје и одобрите ову пријаву из свог { -brand-firefox } прегледача.
signin-push-code-did-not-recieve = Нисте примили обавештење?
signin-push-code-send-email-link = Код путем е-поште

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Потврдите своју пријаву
signin-push-code-confirm-description = Окрили смо покушај пријаве са следећег уређаја. Ако сте то ви, одобрите пријаву
signin-push-code-confirm-verifying = Проверавање
signin-push-code-confirm-login = Потврди пријаву
signin-push-code-confirm-wasnt-me = Ово нисам ја, промени лозинку.
signin-push-code-confirm-login-approved = Ваша пријава је одобрена. Затворите овај прозор.
signin-push-code-confirm-link-error = Веза је оштећена. Покушајте поново.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Пријава
signin-recovery-method-subheader = Изаберите начин опоравка
signin-recovery-method-details = Уверимо се да сте то ви користећи ваше начине опоравка.
signin-recovery-method-phone = Телефон за опоравак
signin-recovery-method-code-v2 = Резервни кодови за потврду идентитета
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Преостао је { $numBackupCodes } код
        [few] Преостала су { $numBackupCodes } кода
       *[other] Преостало је { $numBackupCodes } кодова
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Дошло је до проблема приликом слања кода на ваш телефон за опоравак
signin-recovery-method-send-code-error-description = Покушајте поново касније или употребите своје резервне кодове за потврду идентитета.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Пријава
signin-recovery-code-sub-heading = Унесите резервни код за потврду идентитета
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Унесите један од кодова за једнократну употребу које сте сачували приликом подешавања потврде идентитета у два корака.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Унесите код од 10 знакова
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Потврди
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Користите телефон за опоравак
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Не можете да се пријавите?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Потребан је резервни приступни код
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Дошло је до проблема приликом слања кода на ваш телефон за опоравак
signin-recovery-code-use-phone-failure-description = Покушајте поново касније.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Пријављивање
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Унесите код за опоравак
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Шестоцифрени код је послат текстуалном поруком на број телефона који се завршава на <span>{ $lastFourPhoneDigits }</span>. Овај код истиче након 5 минута. Не делите овај код ни са ким.
signin-recovery-phone-input-label = Унесите шестоцифрени код
signin-recovery-phone-code-submit-button = Потврди
signin-recovery-phone-resend-code-button = Поново пошаљи код
signin-recovery-phone-resend-success = Код је послат
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Да ли сте закључани?
signin-recovery-phone-send-code-error-heading = Дошло је до проблема приликом слања кода
signin-recovery-phone-code-verification-error-heading = Дошло је до проблема приликом верификације вашег кода
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Покушајте поново касније.
signin-recovery-phone-invalid-code-error-description = Код је неисправан или је истекао.
signin-recovery-phone-invalid-code-error-link = Користити резервне кодове за потврду идентитета уместо тога?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Пријављивање је успешно обављено. Ограничења се могу применити ако поново употребите свој телефон за опоравак.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Хвала вам на вашој опрезности
signin-reported-message = Наш тим је обавештен. Овакви извешаји нам помажу да се одбранимо од нападача.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Унесите код за потврду<span> за ваш { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Унесите код који је послат на <email>{ $email }</email> у року од 5 минута.
signin-token-code-input-label-v2 = Унесите шестоцифрени код
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Потврди
signin-token-code-code-expired = Код је истекао?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Пошаљи нови е-поштом.
# Countdown message shown when user must wait before resending code
# { $seconds } represents the number of seconds remaining
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Слање новог кода е-поштом за { $seconds } секунду
        [few] Слање новог кода е-поштом за { $seconds } секунде
       *[other] Слање новог кода е-поштом за { $seconds } секунди
    }
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Потребан је потврдни код
signin-token-code-resend-error = Нешто је пошло наопако. Нови код није могао бити послат.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } ће покушати да вас врати на коришћење маске е-поште након што се пријавите.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Пријава
signin-totp-code-subheader-v2 = Унесите код за потврду идентитета у два корака
signin-totp-code-instruction-v4 = Проверите своју <strong>апликацију за потврду идентитета</strong> да бисте потврдили пријаву.
signin-totp-code-input-label-v4 = Унесите шестоцифрени код
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Зашто се од вас тражи да потврдите идентитет?
signin-totp-code-aal-banner-content = Поставили сте потврду идентитета у два корака на свом налогу, али се још нисте пријавили помоћу кода на овом уређају.
signin-totp-code-aal-sign-out = Одјави ме са овог уређаја
signin-totp-code-aal-sign-out-error = Жао нам је, дошло је до проблема приликом ваше одјаве
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Потврди
signin-totp-code-other-account-link = Користи други налог
signin-totp-code-recovery-code-link = Проблеми с уносом кода?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Потребан је приступни код
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } ће покушати да вас врати на коришћење маске е-поште након што се пријавите.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Овластите ову пријаву
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Проверите своју е-пошту за ауторизациони код послат на { $email }.
signin-unblock-code-input = Унесите ауторизациони код
signin-unblock-submit-button = Настави
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Ауторизациони код је обавезан
signin-unblock-code-incorrect-length = Ауторизациони код мора да садржи 8 знакова
signin-unblock-code-incorrect-format-2 = Ауторизациони код може да садржи само слова и/или бројеве
signin-unblock-resend-code-button = Није у пријемном сандучету или фасцикли са непожељним порукама? Пошаљи поново
signin-unblock-support-link = Зашто се ово дешава?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } ће покушати да вас врати на коришћење маске е-поште након што се пријавите.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Унесите код за потврду
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Унесите код за потврду <span>за ваш { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Унесите код који је послат на <email>{ $email }</email> у року од 5 минута.
confirm-signup-code-input-label = Унесите шестоцифрени код
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Потврди
confirm-signup-code-sync-button = Покрени усклађивање
confirm-signup-code-code-expired = Код је истекао?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Пошаљи нови е-поштом.
# Countdown message shown when user must wait before resending code
# { $seconds } represents the number of seconds remaining
confirm-signup-code-resend-code-countdown =
    { $count ->
        [one] Пошаљи нови код е-поштом за { $seconds } секунду
        [few] Пошаљи нови код е-поштом за { $seconds } секунде
       *[other] Пошаљи нови код е-поштом за { $seconds } секунди
    }
confirm-signup-code-success-alert = Налог је успешно потврђен
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Потребан је код за потврду
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } ће покушати да вас врати на коришћење маске е-поште након што се пријавите.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Направите лозинку
signup-relay-info = Лозинка је потребна за безбедно управљање вашим маскираним е-поштама и приступ безбедносним алатима { -brand-mozilla }-е.
signup-sync-info = Усклађујте своје лозинке, обележиваче и још много тога свуда где користите { -brand-firefox }.
signup-sync-info-with-payment = Усклађујте ваше лозинке, начине плаћања, обележиваче и још много тога свуда где користите { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Промени е-пошту

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Усклађивање је укључено
signup-confirmed-sync-success-banner = { -product-mozilla-account } је потврђен
signup-confirmed-sync-button = Започните прегледање
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Ваше лозинке, начини плаћања, адресе, обележивачи, историја и још много тога могу се усклађивати свуда где користите { -brand-firefox }.
signup-confirmed-sync-description-v2 = Ваше лозинке, адресе, обележивачи, историја и још много тога могу се усклађивати свуда где користите { -brand-firefox }.
signup-confirmed-sync-add-device-link = Додајте други уређај
signup-confirmed-sync-manage-sync-button = Управљајте усклађивањем
signup-confirmed-sync-set-password-success-banner = Лозинка за усклађивање је направљена
