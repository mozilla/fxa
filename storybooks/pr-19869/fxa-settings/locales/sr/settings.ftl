# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Преузми и настави
    .title = Преузми и настави

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Преузето
datablock-copy =
    .message = Копирано
datablock-print =
    .message = Одштампано

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

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Ово поље је обавезно

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)


# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = { -brand-firefox } кључ за опоравак налога
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
lightbulb-aria-label =
    .aria-label = Илустрација која представља осмишљавање наговештаја за складиште.

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Сакриј лозинку
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Прикажи лозинку

## Phone number component

# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Назад

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Веза за ресетовање лозинке је оштећена
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Веза за потврду је оштећена
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Вези на који сте кликнули недостају знакови и могуће је да ју је оштетио ваш клијент е-поште. Пажљиво копирајте адресу и покушајте поново.

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Примарна адреса е-поште је већ потврђена
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Пријава је већ потврђена
confirmation-link-reused-message = Ова веза за потврду је већ искоришћена, може се искористити само једном.

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Потребна вам је ова лозинка да приступите вашим шифрованим подацима који се чувају код нас.
password-info-balloon-reset-risk-info = Ресетовањем можете да изгубите податке као што су лозинке и обележивачи.

## Ready component

ready-complete-set-up-instruction = Завршите подешавање тако што ћете унети нову лозинку на вашим осталим { -brand-firefox } уређајима.
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

## Alert Bar

alert-bar-close-message = Затвори поруку

## User's avatar

avatar-your-avatar =
    .alt = Ваш аватар
avatar-default-avatar =
    .alt = Подразумевани аватар

##


# BentoMenu component

bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } прегледач за десктоп
bento-menu-firefox-mobile = { -brand-firefox } прегледач за мобилни
bento-menu-made-by-mozilla = Створила { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Преузмите { -brand-firefox } на телефон или таблет

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
    али више неће бити синхронизовани на ваш налог.
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
cs-disconnect-suspicious-advice-heading = Сумњив уређај је искључен
cs-sign-out-button = Одјави се

## Data collection section

dc-heading = Сакупљање и коришћење података
dc-opt-in-out-error-2 = Жао нам је, дошло је до грешке при мењању ваших подешавања за прикупљање података
dc-learn-more = Сазнајте више

# DropDownAvatarMenu component

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

flow-recovery-key-download-heading-v2 = Кључ за опоравак налога је направљен — преузмите и сачувајте га одмах
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Овај кључ вам омогућава да опоравите ваше податке ако заборавите лозинку. Преузмите га сада и сачувајте на погодном месту — нећете моћи да се вратите на ову страницу касније.
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
flow-recovery-key-info-shield-bullet-point-v2 = Шифрујемо ваше податке прегледања — лозинке, обележиваче и остало. Ово је одлично за приватност, али ако заборавите лозинку, можете да изгубите ове податке.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Због тога је толико важно да направите кључ за опоравак налога — биће вам потребан да опоравите ваше податке.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Започните
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Откажи

## HeaderLockup component, the header in account settings

header-menu-open = Затвори мени
header-menu-closed = Мени навигације странице
header-back-to-top-link =
    .title = Назад на врх
header-help = Помоћ

## Linked Accounts section

la-heading = Повезани налози
la-description = Овластили сте приступ следећим повезаним налозима.
la-unlink-button = Уклони
la-unlink-account-button = Уклони
la-unlink-heading = Уклоните везу са налогом треће стране
la-unlink-content-3 = Јесте ли сигурни да желите да уклоните везу на свом налогу? Ова радња вас неће аутоматски одјавити са ових услуга. Да бисте то урадили, морате се ручно одјавити у одељку „Повезане услуге“.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Затвори
modal-cancel-button = Откажи
modal-default-confirm-button = Потврди

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

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Дошло је до грешке при мењању ваших резервних приступних кодова
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Дошло је до проблема при прављењу резервног приступног кода

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
pw-tips = Будите безбедни — немојте да дуплирате лозинке. Погледајте савете за <linkExternal>прављење јаких лозинки</linkExternal>.
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
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Синхронизовање { -brand-firefox } података
delete-account-product-firefox-addons = { -brand-firefox } додаци
delete-account-acknowledge = Брисањем налога признајете да:
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

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Кључ за опоравак налога
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Назад на подешавања

## Add secondary email page

add-secondary-email-step-1 = Корак 1 од 2
add-secondary-email-error-2 = Дошло је до грешке при стварању ове е-поште
add-secondary-email-page-title =
    .title = Секундарна е-пошта
add-secondary-email-enter-address =
    .label = Унесите адресу е-поште
add-secondary-email-cancel-button = Откажи
add-secondary-email-save-button = Сачувај

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

##

# Link to delete account on main Settings page
delete-account-link = Обриши налог

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
security-set-password = Поставите лозинку да омогућите синхронизацију и безбедносне функција налога.

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
tfa-row-action-add = Додај
tfa-row-action-disable = Онемогући
tfa-row-button-refresh =
    .title = Освежите аутентификацију у два корака
tfa-row-cannot-refresh =
    Жао нам је, дошло је до проблема при освежавању
    аутентификације у два корака.
tfa-row-cannot-verify-session-4 = Жао нам је, дошло је до грешке при потврђивању ваше сесије
tfa-row-disable-modal-heading = Онемогућити аутентификацију у два корака?
tfa-row-disable-modal-confirm = Онемогући
tfa-row-disable-modal-explain-1 =
    Нећете моћи да опозовете ову радњу. Такође,
    имате опцију за <linkExternal>замену ваших резервних приступних кодова</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Аутентификација у два корака онемогућена
tfa-row-cannot-disable-2 = Није могуће онемогућити аутентификацију у два корака

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = или
continue-with-google-button = Наставите са { -brand-google }-ом
continue-with-apple-button = Наставите са { -brand-apple }-ом

## Auth-server based errors that originate from backend service

auth-error-102 = Непознат налог
auth-error-103 = Погрешна лозинка
auth-error-105-2 = Неисправан код за потврду
auth-error-110 = Неважећи токен
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Покушали сте превише пута. Покушајте поново за { $retryAfter }.
auth-error-138-2 = Непотврђена сесија
auth-error-139 = Секундарна адреса мора бити другачија од адресе вашег налога
auth-error-155 = TOTP токен није пронађен
auth-error-183-2 = Неисправан или истекао код за потврду
auth-error-999 = Неочекивана грешка
auth-error-1003 = Локално складиште или колачићи су и даље онемогућени
auth-error-1008 = Нова лозинка мора да буде другачија
auth-error-1011 = Потребна је важећа адреса е-поште

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
connect-another-device-get-data-on-another-device-message = Желите да имате картице, обележиваче и лозинке на другом уређају?
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
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Покушај поново
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Сазнај више

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
pair-auth-complete-now-syncing-device-text = Сада се синхронизујете са: { $deviceFamily } ({ $deviceOS })
pair-auth-complete-sync-benefits-text = Сада можете да приступите отвореним картицама, лозинкама и обележивачима на свим уређајима.
pair-auth-complete-see-tabs-button = Прикажи картице са синхронизованих уређаја
pair-auth-complete-manage-devices-link = Управљајте уређајима

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Унесите приступни кôд <span>да наставите на подешавања налога</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Унесите приступни кôд <span>да наставите на { $serviceName }</span>
auth-totp-instruction = Отворите вашу апликацију за аутентификацију и унесите приступни кôд који нуди.
auth-totp-input-label = Унесите шестоцифрени код
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Потврди
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Потребан је приступни кôд

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

pair-sync-header = Синхронизујте { -brand-firefox } на вашем телефону или таблету
pair-cad-header = Повежите { -brand-firefox } на другом уређају
pair-already-have-firefox-paragraph = Већ имате { -brand-firefox } на телефону или таблету?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Синхронизуј уређај
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Или преузми
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Скенирајте да преузмете { -brand-firefox } за мобилне или пошаљите себи <linkExternal>везу за преузимање</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Не сада
pair-take-your-data-message = Понесите ваше картице, обележиваче и лозинке свуда где користите { -brand-firefox }.
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

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Сачекајте тренутак, бићете преусмерени на овлашћени програм.

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Лозинка је постављена
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Жао нам је, дошло је до грешке при постављању лозинке

# ConfirmBackupCodeResetPassword page


## ResetPasswordConfirmed

reset-password-complete-header = Ваша лозинка је ресетована

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = Успешно ресетовање лозинке

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Грешка:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Пријава се потрвђује…
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Веза за потврду је истекла

## Signin page

# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Настави на { $serviceName }
signin-subheader-without-logo-default = Настави на подешавања налога
signin-button = Пријави се
signin-header = Пријави се
signin-use-a-different-account-link = Користи други налог
signin-forgot-password-link = Заборавили сте лозинку?

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

signin-bounced-header = Жао нам је. Закључали смо ваш налог.
# $email (string) - The user's email.
signin-bounced-message = Потврдна порука е-поште коју смо послали на { $email } је враћена, те смо закључали ваш налог да заштитимо ваше { -brand-firefox } податке.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Ако је ово исправна адреса е-поште, <linkExternal>јавите нам се</linkExternal> и помоћи ћемо вам око откључавања налога.
signin-bounced-create-new-account = То више није ваша адреса е-поште? Направите нови налог
back = Назад

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Потврди
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Не можете да се пријавите?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Потребан је резервни приступни код

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Хвала вам на вашој опрезности
signin-reported-message = Наш тим је обавештен. Овакви извешаји нам помажу да се одбранимо од нападача.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

signin-token-code-input-label-v2 = Унесите шестоцифрени код
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Потврди
signin-token-code-code-expired = Код је истекао?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Пошаљи нови е-поштом.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Потребан је потврдни код

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Потврди
signin-totp-code-other-account-link = Користи други налог
signin-totp-code-recovery-code-link = Проблеми с уносом кода?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Потребан је приступни кôд

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Унесите код за потврду
confirm-signup-code-input-label = Унесите шестоцифрени код
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Потврди
confirm-signup-code-code-expired = Код је истекао?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Пошаљи нови е-поштом.
confirm-signup-code-success-alert = Налог је успешно потврђен
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Потребан је код за потврду

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Промени е-пошту
