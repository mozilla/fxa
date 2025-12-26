# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Новый код был отправлен на вашу электронную почту.
resend-link-success-banner-heading = Новая ссылка была отправлена на вашу электронную почту.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Добавьте { $accountsEmail } в свои контакты, чтобы обеспечить корректную доставку писем.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Закрыть баннер
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = 1 ноября «{ -product-firefox-accounts }» будут переименованы в «{ -product-mozilla-accounts }».
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Вы по-прежнему будете входить в систему с тем же именем пользователя и паролем, и никаких других изменений в продуктах, которые вы используете, не произойдет.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Мы переименовали «{ -product-firefox-accounts }» в «{ -product-mozilla-accounts }». Вы по-прежнему будете входить в систему с тем же именем пользователя и паролем, и никаких других изменений в продуктах, которые вы используете, не произойдёт.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Подробнее
# Alt text for close banner image
brand-close-banner =
    .alt = Закрыть баннер
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Логотип { -brand-mozilla } m

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
recovery-key-download-button-v3 = Скачать и продолжить
    .title = Скачать и продолжить
recovery-key-pdf-heading = Ключ восстановления аккаунта
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Создан { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Ключ восстановления аккаунта
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Этот ключ позволит вам восстановить зашифрованные данные браузера (включая пароли, закладки и историю), если вы забудете свой пароль. Храните его в месте, о котором вы помните.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Места для хранения вашего ключа:
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Узнать больше о ключе восстановления аккаунта
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = К сожалению, при скачивании ключа восстановления аккаунта произошла ошибка.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Получите больше от { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Получайте наши последние новости и обновления продуктов
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Ранний доступ к тестированию новых продуктов
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Оповещения о действиях по восстановлению доступа к Интернету

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Скачаны
datablock-copy =
    .message = Скопированы
datablock-print =
    .message = Распечатаны

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] Код скопирован
        [few] Коды скопированы
       *[many] Коды скопированы
    }
datablock-download-success =
    { $count ->
        [one] Код скачан
        [few] Коды скачаны
       *[many] Коды скачаны
    }
datablock-print-success =
    { $count ->
        [one] Код распечатан
        [few] Коды распечатаны
       *[many] Коды распечатаны
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Скопировано

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (приблизительно)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (приблизительно)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (приблизительно)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (приблизительно)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Местоположение неизвестно
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } в { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = IP-адрес: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Пароль
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Повторите пароль
form-password-with-inline-criteria-signup-submit-button = Создать аккаунт
form-password-with-inline-criteria-reset-new-password =
    .label = Новый пароль
form-password-with-inline-criteria-confirm-password =
    .label = Подтвердите пароль
form-password-with-inline-criteria-reset-submit-button = Создать новый пароль
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Пароль
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Повторите пароль
form-password-with-inline-criteria-set-password-submit-button = Начать синхронизацию
form-password-with-inline-criteria-match-error = Пароли не совпадают
form-password-with-inline-criteria-sr-too-short-message = Пароль должен содержать не менее 8 символов.
form-password-with-inline-criteria-sr-not-email-message = Пароль не должен содержать ваш адрес электронной почты.
form-password-with-inline-criteria-sr-not-common-message = Пароль не должен быть часто используемым паролем.
form-password-with-inline-criteria-sr-requirements-met = Введённый пароль соответствует всем требованиям к паролям.
form-password-with-inline-criteria-sr-passwords-match = Введённые пароли совпадают.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Это обязательное поле

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Введите { $codeLength }-значный код для продолжения
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Введите для продолжения код из { $codeLength } символов

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Ключ восстановления аккаунта { -brand-firefox }
get-data-trio-title-backup-verification-codes = Резервные коды аутентификации
get-data-trio-download-2 =
    .title = Скачать
    .aria-label = Скачать
get-data-trio-copy-2 =
    .title = Скопировать
    .aria-label = Скопировать
get-data-trio-print-2 =
    .title = Печать
    .aria-label = Печать

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Предупреждение
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Внимание
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Предупреждение
authenticator-app-aria-label =
    .aria-label = Приложение-аутентификатор
backup-codes-icon-aria-label-v2 =
    .aria-label = Резервные коды аутентификации включены
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Резервные коды аутентификации отключены
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Восстановление по SMS включено
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Восстановление по SMS отключено
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Канадский флаг
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Флажок
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Успешно
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Включено
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Закрыть сообщение
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Код
error-icon-aria-label =
    .aria-label = Ошибка
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Информация
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Флаг США

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Компьютер, мобильный телефон и изображение разбитого сердца на каждом
hearts-verified-image-aria-label =
    .aria-label = Компьютер, мобильный телефон и планшет с пульсирующим сердцем на каждом
signin-recovery-code-image-description =
    .aria-label = Документ, содержащий скрытый текст.
signin-totp-code-image-label =
    .aria-label = Устройство со скрытым 6-значным кодом.
confirm-signup-aria-label =
    .aria-label = Конверт со ссылкой
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Иллюстрация для представления ключа восстановления аккаунта.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Иллюстрация для представления ключа восстановления аккаунта.
password-image-aria-label =
    .aria-label = Иллюстрация, показывающая ввод пароля.
lightbulb-aria-label =
    .aria-label = Иллюстрация, показывающая создание подсказки хранилища.
email-code-image-aria-label =
    .aria-label = Иллюстрация для представления электронного письма, содержащего код.
recovery-phone-image-description =
    .aria-label = Мобильное устройство, получающее код в виде текстового сообщения.
recovery-phone-code-image-description =
    .aria-label = Код, полученный на мобильное устройство.
backup-recovery-phone-image-aria-label =
    .aria-label = Мобильное устройство с возможностью отправки текстовых SMS-сообщений
backup-authentication-codes-image-aria-label =
    .aria-label = Экран устройства с кодами
sync-clouds-image-aria-label =
    .aria-label = Облака со значком синхронизации
confetti-falling-image-aria-label =
    .aria-label = Анимированное падающее конфетти

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Вы вошли в { -brand-firefox }.
inline-recovery-key-setup-create-header = Защитите свой аккаунт
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Уделите минуту на защиту своих данных?
inline-recovery-key-setup-info = Создайте ключ восстановления аккаунта, это позволит вам восстановить синхронизированные данные о просмотре, если забудете пароль.
inline-recovery-key-setup-start-button = Создать ключ восстановления аккаунта
inline-recovery-key-setup-later-button = Сделать это позже

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Скрыть пароль
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Показать пароль
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Ваш пароль в данный момент виден на экране.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Ваш пароль сейчас скрыт.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Ваш пароль теперь виден на экране.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Ваш пароль теперь скрыт.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Выберите страну
input-phone-number-enter-number = Введите номер телефона
input-phone-number-country-united-states = США
input-phone-number-country-canada = Канада
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Назад

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Ссылка для сброса пароля повреждена
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Ссылка для подтверждения повреждена
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Ссылка повреждена
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = В ссылке, по которой вы щёлкнули, отсутствуют символы, и возможно она была повреждена вашим почтовым клиентом. Внимательно скопируйте адрес и попробуйте ещё раз.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Получить новую ссылку

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Помните ваш пароль?
# link navigates to the sign in page
remember-password-signin-link = Войти

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Основная электронная почта уже подтверждена
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Вход уже подтверждён
confirmation-link-reused-message = Эта ссылка для подтверждения уже была использована, и может использоваться только один раз.

## Locale Toggle Component

locale-toggle-select-label = Выберите язык
locale-toggle-browser-default = Браузер по умолчанию
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Неверный запрос

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Вам нужен этот пароль для доступа к любым зашифрованным данным, которые вы храните у нас.
password-info-balloon-reset-risk-info = Сброс означает потенциальную потерю данных, таких как пароли и закладки.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Выберите надежный пароль, который вы не использовали на других сайтах. Убедитесь, что он соответствует требованиям безопасности:
password-strength-short-instruction = Выберите надежный пароль:
password-strength-inline-min-length = Не менее 8 символов
password-strength-inline-not-email = Не ваш адрес электронной почты
password-strength-inline-not-common = Не часто используемый пароль
password-strength-inline-confirmed-must-match = Подтверждение соответствует новому паролю
password-strength-inline-passwords-match = Пароли совпадают

## Notification Promo Banner component

account-recovery-notification-cta = Создать
account-recovery-notification-header-value = Не потеряйте свои данные, если забудете пароль
account-recovery-notification-header-description = Создайте ключ восстановления аккаунта, чтобы восстановить синхронизированные данные о просмотре, если забудете пароль.
recovery-phone-promo-cta = Добавить телефон для восстановления
recovery-phone-promo-heading = Добавьте своему аккаунту дополнительную защиту с помощью телефона для восстановления
recovery-phone-promo-description = Теперь вы можете войти с одноразовым паролем из SMS, если не можете использовать приложение двухэтапной аутентификации.
recovery-phone-promo-info-link = Узнайте больше о восстановлении и риске подмены SIM-карт
promo-banner-dismiss-button =
    .aria-label = Скрыть баннер

## Ready component

ready-complete-set-up-instruction = Завершите настройку, введя свой новый пароль на других ваших устройствах с { -brand-firefox }.
manage-your-account-button = Управление вашим аккаунтом
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Теперь вы готовы к использованию { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Теперь вы готовы использовать настройки аккаунта
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Ваш аккаунт готов!
ready-continue = Продолжить
sign-in-complete-header = Вход подтверждён
sign-up-complete-header = Аккаунт подтверждён
primary-email-verified-header = Основная электронная почта подтверждена

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Места для хранения вашего ключа:
flow-recovery-key-download-storage-ideas-folder-v2 = Папка на защищённом устройстве
flow-recovery-key-download-storage-ideas-cloud = Надежное облачное хранилище
flow-recovery-key-download-storage-ideas-print-v2 = Распечатанная физическая копия
flow-recovery-key-download-storage-ideas-pwd-manager = Менеджер паролей

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Добавьте подсказку, которая поможет найти ключ
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Эта подсказка должна помочь вам вспомнить, где вы сохранили ключ восстановления своего аккаунта. Мы можем показать её вам во время сброса пароля, чтобы восстановить ваши данные.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Введите подсказку (необязательно)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Завершить
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Подсказка должна содержать менее 255 символов.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Подсказка не может содержать небезопасные символы Юникода. Допускаются только буквы, цифры, знаки препинания и символы.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Предупреждение
password-reset-chevron-expanded = Свернуть предупреждение
password-reset-chevron-collapsed = Развернуть предупреждение
password-reset-data-may-not-be-recovered = Данные вашего браузера могут быть не восстановлены
password-reset-previously-signed-in-device-2 = У вас есть устройство, на котором вы ранее вошли в систему?
password-reset-data-may-be-saved-locally-2 = Данные вашего браузера могут быть сохранены на этом устройстве. Сбросьте свой пароль, а затем войдите в аккаунт, чтобы восстановить и синхронизировать свои данные.
password-reset-no-old-device-2 = У вас новое устройство, но у вас нет доступа к ни одному из предыдущих?
password-reset-encrypted-data-cannot-be-recovered-2 = Извините, но ваши зашифрованные данные браузера на серверах { -brand-firefox } не могут быть восстановлены.
password-reset-warning-have-key = У вас есть ключ восстановления аккаунта?
password-reset-warning-use-key-link = Используйте его сейчас, чтобы сбросить пароль и сохранить свои данные

## Alert Bar

alert-bar-close-message = Закрыть сообщение

## User's avatar

avatar-your-avatar =
    .alt = Ваш аватар
avatar-default-avatar =
    .alt = Стандартный аватар

##


# BentoMenu component

bento-menu-title-3 = Продукты { -brand-mozilla }
bento-menu-tagline = Больше продуктов от { -brand-mozilla }, которые защищают вашу конфиденциальность
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Браузер { -brand-firefox } для компьютеров
bento-menu-firefox-mobile = Браузер { -brand-firefox } для мобильных
bento-menu-made-by-mozilla = Создано { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Установите { -brand-firefox } на своё мобильное устройство
connect-another-find-fx-mobile-2 = Найдите { -brand-firefox } в { -google-play } и { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Скачайте { -brand-firefox } в { -google-play }
connect-another-app-store-image-3 =
    .alt = Скачайте { -brand-firefox } в { -app-store }

## Connected services section

cs-heading = Подключённые службы
cs-description = Всё, что вы используете и где выполнили вход.
cs-cannot-refresh =
    К сожалению, при обновлении списка
    подключённых служб произошла ошибка
cs-cannot-disconnect = Клиент не найден, отключить не удалось
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Вы вышли из { $service }.
cs-refresh-button =
    .title = Обновить подключённые службы
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Отсутствующие или повторяющиеся элементы?
cs-disconnect-sync-heading = Отсоединиться от Синхронизации

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = Ваши данные веб-сёрфинга останутся на <span>{ $device }</span>, но оно больше не будет синхронизироваться с вашим аккаунтом.
cs-disconnect-sync-reason-3 = Какова главная причина отсоединения <span>{ $device }</span>?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Это устройство:
cs-disconnect-sync-opt-suspicious = Подозрительно
cs-disconnect-sync-opt-lost = Потеряно или украдено
cs-disconnect-sync-opt-old = Старое или заменено
cs-disconnect-sync-opt-duplicate = Дублируется
cs-disconnect-sync-opt-not-say = Не хочу говорить

##

cs-disconnect-advice-confirm = Хорошо, понятно
cs-disconnect-lost-advice-heading = Утерянное или украденное устройство отсоединено
cs-disconnect-lost-advice-content-3 = Поскольку ваше устройство было утеряно или украдено, для сохранения вашей информации в безопасности, вам следует сменить пароль своих { -product-mozilla-account } в настройках. Вам также следует изучить информацию производителя своего устройства об удалённом стирании своих данных.
cs-disconnect-suspicious-advice-heading = Подозрительное устройство отсоединено
cs-disconnect-suspicious-advice-content-2 = Если отсоединённое устройство действительно подозрительно, для сохранения вашей информации в безопасности, вам следует сменить пароль своего { -product-mozilla-account } в настройках. Вам также следует сменить любые другие пароли, которые вы сохраняли в { -brand-firefox }, набрав about:logins в адресной строке.
cs-sign-out-button = Выйти

## Data collection section

dc-heading = Сбор и использование данных
dc-subheader-moz-accounts = { -product-mozilla-accounts(case: "nominative_uppercase") }
dc-subheader-ff-browser = Браузер { -brand-firefox }
dc-subheader-content-2 = Разрешить { -product-mozilla-accounts(case: "dative") } отправлять технические данные и данные взаимодействия в { -brand-mozilla }.
dc-subheader-ff-content = Чтобы просмотреть или обновить технические настройки и данные взаимодействия вашего { -brand-firefox }, откройте настройки { -brand-firefox } и перейдите в раздел «Приватность и Защита».
dc-opt-out-success-2 = Отказ подтверждён. { -product-mozilla-accounts } не будут отправлять технические данные или данные о взаимодействии в { -brand-mozilla }.
dc-opt-in-success-2 = Спасибо! Отправка этих данных поможет нам улучшить { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = К сожалению, при изменении вашей настройки сбора данных возникла проблема
dc-learn-more = Подробнее

# DropDownAvatarMenu component

drop-down-menu-title-2 = Меню { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Вы вошли как
drop-down-menu-sign-out = Выйти
drop-down-menu-sign-out-error-2 = К сожалению, при выходе возникла проблема

## Flow Container

flow-container-back = Назад

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Повторно введите пароль для безопасности
flow-recovery-key-confirm-pwd-input-label = Введите пароль
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Создать ключ восстановления аккаунта
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Создать новый ключ восстановления аккаунта

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Создан ключ восстановления аккаунта — скачайте и сохраните его сейчас
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Этот ключ позволяет восстановить данные, если вы забудете пароль. Скачайте его сейчас и сохраните в удобном для вас месте — вы не сможете вернуться на эту страницу позже.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Продолжить без скачивания

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Ключ восстановления аккаунта создан

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Создайте ключ восстановления аккаунта на случай, если вы забудете пароль
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Изменение вашего ключа восстановления аккаунта
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Мы шифруем данные просмотра — пароли, закладки и многое другое. Это отлично подходит для конфиденциальности, но вы можете потерять свои данные, если забудете пароль.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Вот почему создание ключа восстановления аккаунта так важно — вы можете использовать его для восстановления своих данных.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Начать
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Отмена

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Подключение к вашему приложению для аутентификации
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Шаг 1:</strong> Отсканируйте этот QR-код с помощью любого приложения для аутентификации, например, Duo или Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Штрих-код для настройки двухэтапной аутентификации. Отсканируйте его или выберите «Не можете отсканировать QR-код?» , чтобы получить секретный ключ настройки.
flow-setup-2fa-cant-scan-qr-button = Не можете отсканировать QR-код?
flow-setup-2fa-manual-key-heading = Введите код вручную
flow-setup-2fa-manual-key-instruction = <strong>Шаг 1:</strong> Введите этот код в нужное вам приложение для аутентификации.
flow-setup-2fa-scan-qr-instead-button = Вместо этого сканировать QR-код?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Узнайте больше о приложениях для аутентификации
flow-setup-2fa-button = Продолжить
flow-setup-2fa-step-2-instruction = <strong>Шаг 2:</strong> Введите код из вашего приложения для аутентификации.
flow-setup-2fa-input-label = Введите код из 6 цифр
flow-setup-2fa-code-error = Неверный или истёкший код. Проверьте своё приложение для аутентификации и попробуйте ещё раз.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Выберите метод восстановления
flow-setup-2fa-backup-choice-description = Это позволит вам войти, если у вас нет доступа к своему мобильному устройству или приложению для аутентификации.
flow-setup-2fa-backup-choice-phone-title = Телефон для восстановления
flow-setup-2fa-backup-choice-phone-badge = Проще всего
flow-setup-2fa-backup-choice-phone-info = Получите код восстановления в виде текстового сообщения. В настоящее время доступно в США и Канаде.
flow-setup-2fa-backup-choice-code-title = Резервные коды аутентификации
flow-setup-2fa-backup-choice-code-badge = Самый безопасный
flow-setup-2fa-backup-choice-code-info = Создавайте и сохраняйте одноразовые коды аутентификации.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Узнайте о риске восстановления и подмены SIM-карт

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Введите резервный код аутентификации
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Подтвердите, что вы сохранили коды, введя один из них. Без этих кодов вы не сможете войти, если у вас нет приложения для аутентификации.
flow-setup-2fa-backup-code-confirm-code-input = Введите 10-значный код
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Готово

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Сохраните резервные коды аутентификации
flow-setup-2fa-backup-code-dl-save-these-codes = Храните их в месте, о котором вы будете помнить. Если у вас нет доступа к приложению для аутентификации, вам нужно ввести один из них, чтобы войти.
flow-setup-2fa-backup-code-dl-button-continue = Продолжить

##

flow-setup-2fa-inline-complete-success-banner = Двухэтапная аутентификация включена
flow-setup-2fa-inline-complete-success-banner-description = Чтобы защитить все подключённые устройства, вам следует выйти из этого аккаунта везде, где вы используете его, а затем войти снова, используя новую двухэтапную аутентификацию.
flow-setup-2fa-inline-complete-backup-code = Резервные коды аутентификации
flow-setup-2fa-inline-complete-backup-phone = Телефон для восстановления
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Остался { $count } код
        [few] Осталось { $count } кода
       *[many] Осталось { $count } кодов
    }
flow-setup-2fa-inline-complete-backup-code-description = Это самый безопасный метод восстановления, если вы не можете войти с помощью своего мобильного устройства или приложения для аутентификации.
flow-setup-2fa-inline-complete-backup-phone-description = Это самый легкий способ восстановления, если вы не можете войти с помощью приложения для аутентификации.
flow-setup-2fa-inline-complete-learn-more-link = Как это защищает ваш аккаунт
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Перейти в { $serviceName }
flow-setup-2fa-prompt-heading = Настроить двухэтапную аутентификацию
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } требует настройки двухэтапной аутентификации, чтобы обеспечить безопасность вашего аккаунта.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Для продолжения вы можете использовать любое из <authenticationAppsLink>этих приложений для аутентификации</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Продолжить

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Введите код подтверждения
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Шестизначный код был отправлен на <span>{ $phoneNumber }</span> как текстовое сообщение. Срок действия данного кода истечёт через 5 минут.
flow-setup-phone-confirm-code-input-label = Введите код из 6 цифр
flow-setup-phone-confirm-code-button = Подтвердить
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Срок действия кода истёк?
flow-setup-phone-confirm-code-resend-code-button = Отправить код ещё раз
flow-setup-phone-confirm-code-resend-code-success = Код отправлен
flow-setup-phone-confirm-code-success-message-v2 = Телефон для восстановления добавлен
flow-change-phone-confirm-code-success-message = Телефон для восстановления изменён

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Подтвердите свой номер телефона
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Вы получите текстовое сообщение от { -brand-mozilla } с кодом для подтверждения вашего номера телефона. Не сообщайте этот код никому.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Телефон для восстановления доступен только в США и Канаде. Номера VoIP и псевдонимы телефона не рекомендуются.
flow-setup-phone-submit-number-legal = Предоставляя свой номер телефона, вы соглашаетесь с тем, что мы будем хранить его, чтобы мы могли отправлять вам текстовые сообщения только для проверки аккаунта. За сообщение и передачу данных может взиматься плата.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Отправить код

## HeaderLockup component, the header in account settings

header-menu-open = Закрыть меню
header-menu-closed = Меню навигации по сайту
header-back-to-top-link =
    .title = Наверх
header-back-to-settings-link =
    .title = Вернуться к настройкам { -product-mozilla-account }
header-title-2 = { -product-mozilla-account(case: "nominative_uppercase") }
header-help = Помощь

## Linked Accounts section

la-heading = Связанные аккаунты
la-description = Вы разрешили доступ к следующим аккаунтам.
la-unlink-button = Отвязать
la-unlink-account-button = Отвязать
la-set-password-button = Установить пароль
la-unlink-heading = Отвязать от стороннего аккаунта
la-unlink-content-3 = Вы уверены, что хотите отвязать свой аккаунт? Отвязывание аккаунта не приведёт к автоматическому выходу из подключенных служб. Выход из них вам нужно будет выполнять вручную в разделе «‎Подключённые службы»‎.
la-unlink-content-4 = Перед отвязкой аккаунта необходимо установить пароль. Без пароля вы не сможете войти в систему после отсоединения своего аккаунта.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Закрыть
modal-cancel-button = Отмена
modal-default-confirm-button = Подтвердить

## ModalMfaProtected

modal-mfa-protected-title = Введите код подтверждения
modal-mfa-protected-subtitle = Помогите нам убедиться, что это вы изменяете информацию своего аккаунта
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] Введите код, отправленный на <email>{ $email }</email>, в течение { $expirationTime } минуты.
        [few] Введите код, отправленный на <email>{ $email }</email>, в течение { $expirationTime } минут.
       *[many] Введите код, отправленный на <email>{ $email }</email>, в течение { $expirationTime } минут.
    }
modal-mfa-protected-input-label = Введите код из 6 цифр
modal-mfa-protected-cancel-button = Отмена
modal-mfa-protected-confirm-button = Подтвердить
modal-mfa-protected-code-expired = Срок действия кода истёк?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Отправить новый код по электронной почте.

## Modal Verify Session

mvs-verify-your-email-2 = Подтвердите свою электронную почту
mvs-enter-verification-code-2 = Введите код подтверждения
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Пожалуйста, введите код подтверждения, который был отправлен на <email>{ $email }</email>, в течение 5 минут.
msv-cancel-button = Отмена
msv-submit-button-2 = Подтвердить

## Settings Nav

nav-settings = Настройки
nav-profile = Профиль
nav-security = Безопасность
nav-connected-services = Подсоединённые устройства
nav-data-collection = Сбор и использование данных
nav-paid-subs = Платные подписки
nav-email-comm = Почтовые рассылки

## Page2faChange

page-2fa-change-title = Изменить двухэтапную аутентификацию
page-2fa-change-success = Двухэтапная аутентификация была обновлена
page-2fa-change-success-additional-message = Чтобы защитить все подключённые устройства, вам следует выйти из этого аккаунта везде, где вы используете его, а затем войти снова, используя новую двухэтапную аутентификацию.
page-2fa-change-totpinfo-error = При замене вашего приложения двухэтапной аутентификации произошла ошибка. Подождите некоторое время и попробуйте снова.
page-2fa-change-qr-instruction = <strong>Шаг 1:</strong> Отсканируйте этот QR-код с помощью любого приложения для аутентификации, например, Duo или Google Authenticator. Будет создано новое подключение, все старые подключения больше не будут работать.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Резервные коды аутентификации
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = При замене ваших резервных кодов аутентификации возникла проблема
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = При создании ваших резервных кодов аутентификации возникла проблема
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Резервные коды аутентификации обновлены
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Резервные коды аутентификации созданы
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Храните их в месте, о котором вы будете помнить. Ваши старые коды будут заменены после того, как вы совершите следующий шаг.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Подтвердите, что вы сохранили коды, введя один из них. Ваши старые резервные коды аутентификации будут отключены после завершения этого шага.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Некорректный резервный код аутентификации

## Page2faSetup

page-2fa-setup-title = Двухэтапная аутентификация
page-2fa-setup-totpinfo-error = При настройке двухэтапной аутентификации произошла ошибка. Подождите некоторое время и попробуйте снова.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Этот код неверен. Попробуйте снова.
page-2fa-setup-success = Двухэтапная аутентификация включена
page-2fa-setup-success-additional-message = Чтобы защитить все подключённые устройства, вам следует выйти везде, где вы используете этот аккаунт, а затем войти снова, используя двухэтапную аутентификацию.

## Avatar change page

avatar-page-title =
    .title = Фото профиля
avatar-page-add-photo = Добавить фото
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Сделать фото
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Удалить фото
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Переснять фото
avatar-page-cancel-button = Отмена
avatar-page-save-button = Сохранить
avatar-page-saving-button = Сохранение…
avatar-page-zoom-out-button =
    .title = Уменьшить
avatar-page-zoom-in-button =
    .title = Увеличить
avatar-page-rotate-button =
    .title = Повернуть
avatar-page-camera-error = Не удалось инициализировать камеру
avatar-page-new-avatar =
    .alt = новое фото профиля
avatar-page-file-upload-error-3 = При выгрузке фото вашего профиля возникла проблема
avatar-page-delete-error-3 = При удалении фото вашего профиля возникла проблема
avatar-page-image-too-large-error-2 = Размер файла изображения слишком велик для загрузки

## Password change page

pw-change-header =
    .title = Сменить пароль
pw-8-chars = Не менее 8 символов
pw-not-email = Не ваш адрес электронной почты
pw-change-must-match = Новый пароль совпадает с подтверждением
pw-commonly-used = Не часто используемый пароль
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Будьте в безопасности — не используйте пароли повторно. Ознакомьтесь с дополнительными советами по <linkExternal>созданию надёжных паролей</linkExternal>.
pw-change-cancel-button = Отмена
pw-change-save-button = Сохранить
pw-change-forgot-password-link = Забыли пароль?
pw-change-current-password =
    .label = Введите текущий пароль
pw-change-new-password =
    .label = Введите новый пароль
pw-change-confirm-password =
    .label = Подтвердите новый пароль
pw-change-success-alert-2 = Пароль изменён

## Password create page

pw-create-header =
    .title = Создать пароль
pw-create-success-alert-2 = Пароль установлен
pw-create-error-2 = К сожалению, при установке вашего пароля возникла проблема

## Delete account page

delete-account-header =
    .title = Удалить аккаунт
delete-account-step-1-2 = Шаг 1 из 2
delete-account-step-2-2 = Шаг 2 из 2
delete-account-confirm-title-4 = Возможно, вы подключили свои { -product-mozilla-account } к одному или нескольким из следующих продуктов { -brand-mozilla } или служб, которые обеспечивают вашу безопасность и продуктивность в Интернете:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Синхронизация данных { -brand-firefox }
delete-account-product-firefox-addons = Дополнения { -brand-firefox }
delete-account-acknowledge = Пожалуйста, подтвердите, что при удалении вашего аккаунта:
delete-account-chk-box-1-v4 =
    .label = Все оплаченные вами подписки будут отменены
delete-account-chk-box-2 =
    .label = Вы можете потерять сохранённую информацию и возможности продуктов { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Повторная активация с использованием этого адреса электронной почты может не восстановить вашу сохранённую информацию
delete-account-chk-box-4 =
    .label = Все расширения и темы, опубликованные вами на addons.mozilla.org, будут удалены
delete-account-continue-button = Продолжить
delete-account-password-input =
    .label = Введите пароль
delete-account-cancel-button = Отмена
delete-account-delete-button-2 = Удалить

## Display name page

display-name-page-title =
    .title = Отображаемое имя
display-name-input =
    .label = Введите отображаемое имя
submit-display-name = Сохранить
cancel-display-name = Отмена
display-name-update-error-2 = При обновлении вашего отображаемого имени возникла проблема
display-name-success-alert-2 = Отображаемое имя обновлено

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Недавняя активность аккаунта
recent-activity-account-create-v2 = Аккаунт создан
recent-activity-account-disable-v2 = Аккаунт отключён
recent-activity-account-enable-v2 = Аккаунт включён
recent-activity-account-login-v2 = Инициирован вход в аккаунт
recent-activity-account-reset-v2 = Инициирован сброс пароля
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Ошибки доставки электронной почты удалены
recent-activity-account-login-failure = Попытка входа в аккаунт не удалась
recent-activity-account-two-factor-added = Двухэтапная аутентификация включена
recent-activity-account-two-factor-requested = Запрошена двухэтапная аутентификация
recent-activity-account-two-factor-failure = Двухэтапная аутентификация не удалась
recent-activity-account-two-factor-success = Двухэтапная аутентификация прошла успешно
recent-activity-account-two-factor-removed = Двухэтапная аутентификация отключена
recent-activity-account-password-reset-requested = Аккаунт запросил сброс пароля
recent-activity-account-password-reset-success = Сброс пароля аккаунта выполнен успешно
recent-activity-account-recovery-key-added = Ключ восстановления аккаунта включён
recent-activity-account-recovery-key-verification-failure = Ошибка проверки ключа восстановления аккаунта
recent-activity-account-recovery-key-verification-success = Проверка ключа восстановления аккаунта прошла успешно
recent-activity-account-recovery-key-removed = Ключ восстановления аккаунта удалён
recent-activity-account-password-added = Добавлен новый пароль
recent-activity-account-password-changed = Пароль изменён
recent-activity-account-secondary-email-added = Добавлен дополнительный адрес электронной почты
recent-activity-account-secondary-email-removed = Дополнительный адрес электронной почты удалён
recent-activity-account-emails-swapped = Основной и дополнительный адреса электронной почты поменялись местами
recent-activity-session-destroy = Вы вышли из сессии
recent-activity-account-recovery-phone-send-code = Код телефона для восстановления отправлен
recent-activity-account-recovery-phone-setup-complete = Настройка телефона для восстановления завершена
recent-activity-account-recovery-phone-signin-complete = Вход с использованием телефона для восстановления завершён
recent-activity-account-recovery-phone-signin-failed = Войти с использованием телефона для восстановления не удалось
recent-activity-account-recovery-phone-removed = Телефон для восстановления удалён
recent-activity-account-recovery-codes-replaced = Коды восстановления заменены
recent-activity-account-recovery-codes-created = Коды восстановления созданы
recent-activity-account-recovery-codes-signin-complete = Вход с кодами восстановления завершён
recent-activity-password-reset-otp-sent = Код подтверждения для сброса пароля отправлен
recent-activity-password-reset-otp-verified = Код подтверждения для сброса пароля подтверждён
recent-activity-must-reset-password = Требуется сброс пароля
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Другая активность аккаунта

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Ключ восстановления аккаунта
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Вернуться в настройки

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Удалить номер телефона для восстановления
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Это удалит <strong>{ $formattedFullPhoneNumber }</strong> в качестве вашего телефона для восстановления.
settings-recovery-phone-remove-recommend = Мы рекомендуем вам сохранить этот метод, так как это проще, чем сохранять резервные коды аутентификации.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Если вы удалите его, убедитесь, что у вас все ещё есть сохранённые резервные коды аутентификации. <linkExternal>Сравните методы восстановления</linkExternal>
settings-recovery-phone-remove-button = Удалить номер телефона
settings-recovery-phone-remove-cancel = Отмена
settings-recovery-phone-remove-success = Телефон для восстановления удалён

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Добавить телефон для восстановления
page-change-recovery-phone = Изменить телефон для восстановления
page-setup-recovery-phone-back-button-title = Вернуться в настройки
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Изменить номер телефона

## Add secondary email page

add-secondary-email-step-1 = Шаг 1 из 2
add-secondary-email-error-2 = При добавлении этого адреса электронной почты возникла проблема
add-secondary-email-page-title =
    .title = Дополнительный адрес электронной почты
add-secondary-email-enter-address =
    .label = Введите адрес электронной почты
add-secondary-email-cancel-button = Отмена
add-secondary-email-save-button = Сохранить
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Псевдонимы электронной почты не могут использоваться в качестве альтернативной электронной почты

## Verify secondary email page

add-secondary-email-step-2 = Шаг 2 из 2
verify-secondary-email-page-title =
    .title = Дополнительный адрес электронной почты
verify-secondary-email-verification-code-2 =
    .label = Введите код подтверждения
verify-secondary-email-cancel-button = Отмена
verify-secondary-email-verify-button-2 = Подтвердить
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Пожалуйста, введите код подтверждения, который был отправлен на <strong>{ $email }</strong>, в течение 5 минут.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } успешно добавлен
verify-secondary-email-resend-code-button = Отправить код подтверждения ещё раз

##

# Link to delete account on main Settings page
delete-account-link = Удалить аккаунт
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Вы успешно вошли. Ваш { -product-mozilla-account } и данные останутся активными.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Найдите, где находится ваша личная информация, и возьмите под контроль
# Links out to the Monitor site
product-promo-monitor-cta = Получить бесплатное сканирование

## Profile section

profile-heading = Профиль
profile-picture =
    .header = Фото
profile-display-name =
    .header = Отображаемое имя
profile-primary-email =
    .header = Основной адрес электронной почты

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Шаг { $currentStep } из { $numberOfSteps }.

## Security section of Setting

security-heading = Безопасность
security-password =
    .header = Пароль
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Создан { $date }
security-not-set = Не настроена
security-action-create = Создать
security-set-password = Установите пароль для синхронизации и использования определенных функций безопасности учётной записи.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Просмотр последних действий в аккаунте
signout-sync-header = Время сессии истекло
signout-sync-session-expired = Извините, что-то пошло не так. Пожалуйста, выйдите из меню браузера и попробуйте ещё раз.

## SubRow component

tfa-row-backup-codes-title = Резервные коды аутентификации
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Нет доступных кодов
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Остался { $numCodesAvailable } код
        [few] Осталось { $numCodesAvailable } кода
       *[many] Осталось { $numCodesAvailable } кодов
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Создать новые коды
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Добавить
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Это самый безопасный метод восстановления, если вы не можете использовать свое мобильное устройство или приложение для аутентификации.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Телефон для восстановления
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Номер телефона не добавлен
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Изменить
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Добавить
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Удалить
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Удалить телефон для восстановления
tfa-row-backup-phone-delete-restriction-v2 = Если вы хотите удалить резервный телефон для восстановления, добавьте резервные коды аутентификации или сначала отключите двухэтапную аутентификацию, чтобы избежать блокировки вашего аккаунта.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Это более простой способ восстановления, если вы не можете использовать своё приложение для аутентификации.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Узнайте о риске подмены SIM-карт

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Отключить
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Включить
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Отправка…
switch-is-on = включено
switch-is-off = выключено

## Sub-section row Defaults

row-defaults-action-add = Добавить
row-defaults-action-change = Изменить
row-defaults-action-disable = Отключить
row-defaults-status = Нет

## Account recovery key sub-section on main Settings page

rk-header-1 = Ключ восстановления аккаунта
rk-enabled = Включён
rk-not-set = Не настроен
rk-action-create = Создать
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Изменить
rk-action-remove = Удалить
rk-key-removed-2 = Ключ восстановления аккаунта удалён
rk-cannot-remove-key = Ключ восстановления вашего аккаунта не может быть удалён.
rk-refresh-key-1 = Обновить ключ восстановления аккаунта
rk-content-explain = Восстановите свою информацию, если вы забудете свой пароль.
rk-cannot-verify-session-4 = К сожалению, при подтверждении вашей сессии возникла проблема
rk-remove-modal-heading-1 = Удалить ключ восстановления аккаунта?
rk-remove-modal-content-1 =
    При сбросе вашего пароля, вы не сможете
    воспользоваться ключами восстановления аккаунта для доступа к вашим данным. Это действие нельзя отменить.
rk-remove-error-2 = Ключ восстановления вашего аккаунта не может быть удалён
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Удалить ключ восстановления аккаунта

## Secondary email sub-section on main Settings page

se-heading = Дополнительный адрес электронной почты
    .header = Дополнительный адрес электронной почты
se-cannot-refresh-email = К сожалению, при обновлении этого адреса электронной почты произошла ошибка.
se-cannot-resend-code-3 = К сожалению, при повторной отправке кода подтверждения возникла проблема
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } теперь является вашим основным адресом электронной почты
se-set-primary-error-2 = К сожалению, при изменении вашего основного адреса электронной почты возникла проблема
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } успешно удалён
se-delete-email-error-2 = К сожалению, при удалении этого адреса электронной почты возникла проблема
se-verify-session-3 = Вам необходимо подтвердить свою текущую сессию для выполнения этого действия
se-verify-session-error-3 = К сожалению, при подтверждении вашей сессии возникла проблема
# Button to remove the secondary email
se-remove-email =
    .title = Удалить электронную почту
# Button to refresh secondary email status
se-refresh-email =
    .title = Обновить электронную почту
se-unverified-2 = не подтверждено
se-resend-code-2 =
    Требуется подтверждение. <button>Повторно отправьте код подтверждения</button>
    если его нет в вашей папке «Входящие» или «Спам».
# Button to make secondary email the primary
se-make-primary = Сделать основным
se-default-content = Получите доступ к своему аккаунту, если вы не можете войти в свой основной адрес электронной почты.
se-content-note-1 = Примечание: дополнительный адрес электронной почты не восстановит вашу информацию — для этого вам понадобится <a>ключ восстановления аккаунта</a>.
# Default value for the secondary email
se-secondary-email-none = Нет

## Two Step Auth sub-section on Settings main page

tfa-row-header = Двухэтапная аутентификация
tfa-row-enabled = Включена
tfa-row-disabled-status = Отключено
tfa-row-action-add = Добавить
tfa-row-action-disable = Отключить
tfa-row-action-change = Изменить
tfa-row-button-refresh =
    .title = Обновить двухэтапную аутентификацию
tfa-row-cannot-refresh =
    К сожалению, при обновлении двухэтапной
    аутентификации произошла ошибка.
tfa-row-enabled-description = Ваш аккаунт защищен двухэтапной аутентификацией. Вам нужно будет ввести одноразовый код-пароль из приложения для аутентификации при входе в { -product-mozilla-account }.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Как это защищает ваш аккаунт
tfa-row-disabled-description-v2 = Помогите защитить свой аккаунт, используя стороннее приложение для аутентификации в качестве второго шага для входа.
tfa-row-cannot-verify-session-4 = К сожалению, при подтверждении вашей сессии возникла проблема
tfa-row-disable-modal-heading = Отключить двухэтапную аутентификацию?
tfa-row-disable-modal-confirm = Отключить
tfa-row-disable-modal-explain-1 =
    Вы не сможете отменить это действие. У вас также
    есть возможность <linkExternal>заменить свои резервные коды аутентификации</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Двухэтапная аутентификация отключена
tfa-row-cannot-disable-2 = Двухэтапная аутентификация не может быть отключена
tfa-row-verify-session-info = Вам необходимо подтвердить свою текущую сессию для настройки двухэтапной аутентификации

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Продолжая, вы соглашаетесь с:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Условия использования</mozSubscriptionTosLink> и <mozSubscriptionPrivacyLink>Уведомление о конфиденциальности</mozSubscriptionPrivacyLink> служб подписки { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Условия обслуживания</mozillaAccountsTos> и <mozillaAccountsPrivacy>Уведомление о конфиденциальности</mozillaAccountsPrivacy> { -product-mozilla-accounts }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Продолжая, вы соглашаетесь с <mozillaAccountsTos>Условиями обслуживания</mozillaAccountsTos> и <mozillaAccountsPrivacy>Уведомлением о конфиденциальности</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = или
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Войти через
continue-with-google-button = Продолжить с { -brand-google }
continue-with-apple-button = Продолжить с { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Неизвестный аккаунт
auth-error-103 = Неверный пароль
auth-error-105-2 = Неверный код подтверждения
auth-error-110 = Некорректный токен
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Совершено слишком много попыток. Пожалуйста, повторите позже.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Вы сделали слишком много попыток. Попробуйте снова { $retryAfter }.
auth-error-125 = Запрос заблокирован по соображениям безопасности
auth-error-129-2 = Вы ввели некорректный номер телефона. Пожалуйста, проверьте его и попробуйте снова.
auth-error-138-2 = Неподтверждённая сессия
auth-error-139 = Дополнительный адрес электронной почты должен отличаться от основного
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Этот адрес электронной почты зарезервирован другим аккаунтом. Подождите некоторое время и попробуйте снова или используйте другой адрес электронной почты.
auth-error-155 = TOTP-токен не найден
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Резервный код аутентификации не найден
auth-error-159 = Некорректный ключ восстановления аккаунта
auth-error-183-2 = Неверный или истёкший код подтверждения
auth-error-202 = Функция отключена
auth-error-203 = Система недоступна, подождите и повторите попытку
auth-error-206 = Не удалось создать пароль, пароль уже установлен
auth-error-214 = Номер телефона для восстановления уже существует
auth-error-215 = Номер телефона для восстановления не существует
auth-error-216 = Достигнут лимит текстовых сообщений
auth-error-218 = Не удалось удалить телефон для восстановления, отсутствуют резервные коды аутентификации.
auth-error-219 = Этот телефонный номер был зарегистрирован в слишком большом количестве аккаунтов. Пожалуйста, попробуйте другой номер.
auth-error-999 = Непредвиденная ошибка
auth-error-1001 = Попытка входа отменена
auth-error-1002 = Время сессии истекло. Войдите, чтобы продолжить.
auth-error-1003 = Локальное хранилище или куки по-прежнему отключены
auth-error-1008 = Ваш новый пароль должен быть другим
auth-error-1010 = Введите правильный пароль
auth-error-1011 = Введите действующий адрес электронной почты
auth-error-1018 = Ваше письмо для подтверждения только что вернулось. Опечатка в электронной почте?
auth-error-1020 = Ошибка при наборе адреса электронной почты? firefox.com не является корректной службой электронной почты
auth-error-1031 = Вы должны ввести свой возраст, чтобы зарегистрироваться
auth-error-1032 = Для регистрации вы должны ввести корректный возраст
auth-error-1054 = Неверный код двухэтапной аутентификации
auth-error-1056 = Некорректный резервный код аутентификации
auth-error-1062 = Некорректное перенаправление
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Ошибка при наборе адреса электронной почты? { $domain } не является корректной службой электронной почты
auth-error-1066 = Псевдонимы электронной почты не могут быть использованы для создания аккаунта.
auth-error-1067 = Опечатка в электронной почте?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Номер, заканчивающийся на { $lastFourPhoneNumber }
oauth-error-1000 = Что-то пошло не так. Пожалуйста, закройте эту вкладку и попробуйте ещё раз.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Вы вошли в { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Электронная почта подтверждена
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Вход подтверждён
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Войти в { -brand-firefox } на этом устройстве, чтобы завершить настройку
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Войти
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Всё ещё добавляете устройства? Войдите в { -brand-firefox } на другом устройстве, чтобы завершить настройку
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Войдите в { -brand-firefox } на другом устройстве, чтобы завершить настройку
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Хотите получить свои вкладки, закладки и пароли на другом устройстве?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Подключить другое устройство
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Не сейчас
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Войдите в { -brand-firefox } для Android, чтобы завершить настройку
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Войдите в { -brand-firefox } для iOS, чтобы завершить настройку

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Требуется локальное хранилище и куки
cookies-disabled-enable-prompt-2 = Пожалуйста, включите куки и локальное хранилище в вашем браузере для доступа к { -product-mozilla-account }. Если вы включите их, браузер сможет запоминать ваши сессии.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Попробовать снова
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Подробнее

## Index / home page

index-header = Введите ваш адрес эл. почты
index-sync-header = Перейдите в свой { -product-mozilla-account }
index-sync-subheader = Синхронизируйте свои пароли, вкладки и закладки везде, где используете { -brand-firefox }.
index-relay-header = Создать псевдоним электронной почты
index-relay-subheader = Укажите адрес электронной почты, на который вы хотите пересылать письма с вашего замаскированного адреса электронной почты.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Перейти к { $serviceName }
index-subheader-default = Перейти к настройкам аккаунта
index-cta = Зарегистрироваться или войти
index-account-info = { -product-mozilla-account } также открывает доступ к другим продуктам { -brand-mozilla } для защиты приватности.
index-email-input =
    .label = Введите ваш адрес эл. почты
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Аккаунт успешно удалён
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Ваше письмо для подтверждения только что вернулось. Опечатка в электронной почте?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Ой! Мы не смогли создать ключ восстановления вашего аккаунта. Подождите некоторое время и попробуйте снова.
inline-recovery-key-setup-recovery-created = Ключ восстановления аккаунта создан
inline-recovery-key-setup-download-header = Защитите свой аккаунт
inline-recovery-key-setup-download-subheader = Скачать и сохранить его сейчас
inline-recovery-key-setup-download-info = Храните этот ключ в удобном для вас месте — вы не сможете вернуться на эту страницу позже.
inline-recovery-key-setup-hint-header = Рекомендация по безопасности

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Отменить настройку
inline-totp-setup-continue-button = Продолжить
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Добавьте в свой аккаунт ещё один уровень защиты, включив использование кодов аутентификации от одного из <authenticationAppsLink>этих приложений для авторизации</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Включите двухэтапную аутентификацию, <span>для перехода к настройкам аккаунта</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Включите двухэтапную аутентификацию, <span>для перехода к { $serviceName }</span>
inline-totp-setup-ready-button = Готово
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Отсканируйте код аутентификации <span>для перехода к { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Введите код вручную <span>для перехода к { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Отсканируйте код аутентификации, <span>для перехода к настройкам аккаунта</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Введите код вручную <span>для перехода к настройкам аккаунта</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Введите этот секретный ключ в приложение для аутентификации. <toggleToQRButton>Сканировать QR-код вместо этого?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Отсканируйте QR-код в приложении для аутентификации, а затем введите предоставленный им код аутентификации. <toggleToManualModeButton>Не можете отсканировать код?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = По завершении оно начнёт генерировать коды аутентификации, которые вы сможете ввести.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Код аутентификации
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Требуется код аутентификации
tfa-qr-code-alt = Используйте код { $code } для настройки двухэтапной аутентификации в поддерживаемых приложениях.
inline-totp-setup-page-title = Двухэтапная аутентификация

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Юридическая информация
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Условия использования
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Уведомление о конфиденциальности

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Уведомление о конфиденциальности

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Условия использования

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Вы только что вошли в { -product-firefox }?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Да, подтвердить устройство
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Если это были не вы, <link>смените пароль</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Устройство подключено
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Теперь вы синхронизируетесь с: { $deviceFamily } на { $deviceOS }
pair-auth-complete-sync-benefits-text = Теперь вы можете просматривать свои открытые вкладки, пароли и закладки на всех устройствах.
pair-auth-complete-see-tabs-button = Просмотреть вкладки на синхронизированных устройствах
pair-auth-complete-manage-devices-link = Управление устройствами

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Введите код аутентификации, <span>для перехода к настройкам аккаунта</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Введите код аутентификации <span>для перехода к { $serviceName }</span>
auth-totp-instruction = Откройте своё приложение для аутентификации и введите предоставленный им код аутентификации.
auth-totp-input-label = Введите код из 6 цифр
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Подтвердить
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Требуется код аутентификации

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Теперь требуется одобрение <span>на другом устройстве</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Сопряжение не удалось
pair-failure-message = Процесс настройки был прерван.

## Pair index page

pair-sync-header = Синхронизация { -brand-firefox } на вашем телефоне или планшете
pair-cad-header = Подключиться к { -brand-firefox } на другом устройстве
pair-already-have-firefox-paragraph = Уже установили { -brand-firefox } на свой телефон или планшет?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Синхронизируйте своё устройство
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = или скачайте
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Отсканируйте, чтобы скачать { -brand-firefox } для мобильных устройств, или отправьте себе <linkExternal>ссылку на скачивание</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Не сейчас
pair-take-your-data-message = Берите вкладки, закладки и пароли с собой везде, где используете { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Начать
# This is the aria label on the QR code image
pair-qr-code-aria-label = QR-код

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Устройство подключено
pair-success-message-2 = Сопряжение прошло успешно.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Подтвердите сопряжение <span>для { $email }</span>
pair-supp-allow-confirm-button = Подтвердить сопряжение
pair-supp-allow-cancel-link = Отмена

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Теперь требуется подтверждение <span>на другом устройстве</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Сопряжение с помощью приложения
pair-unsupported-message = Вы использовали системную камеру? Вы должны выполнить сопряжение в приложении { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Создайте пароль для синхронизации
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Это зашифрует ваши данные. Он должен отличаться от пароля вашего аккаунта { -brand-google } или { -brand-apple }.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Подождите, вас перенаправят в авторизованное приложение.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Введите ключ восстановления аккаунта
account-recovery-confirm-key-instruction = Этот ключ восстанавливает ваши зашифрованные данные просмотра, такие как пароли и закладки, с серверов { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Введите 32-значный ключ восстановления аккаунта
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Ваша подсказка хранилища:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Продолжить
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Не можете найти ключ восстановления своего аккаунта?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Создать новый пароль
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Пароль установлен
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = К сожалению, при установке вашего пароля возникла проблема
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Использовать ключ восстановления аккаунта
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Ваш пароль был сброшен.
reset-password-complete-banner-message = Не забудьте сгенерировать новый ключ восстановления аккаунта в настройках { -product-mozilla-account }, чтобы избежать проблем со входом в систему в будущем.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Введите 10-значный код
confirm-backup-code-reset-password-confirm-button = Подтвердить
confirm-backup-code-reset-password-subheader = Введите резервный код аутентификации
confirm-backup-code-reset-password-instruction = Введите один из одноразовых кодов, которые вы сохранили при настройке двухэтапной аутентификации.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Аккаунт заблокирован?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Проверьте свою электронную почту
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Мы отправили код подтверждения на <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Введите 8-значный код в течение 10 минут
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Продолжить
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Отправить код ещё раз
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Использовать другой аккаунт

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Сбросить ваш пароль
confirm-totp-reset-password-subheader-v2 = Введите код двухэтапной аутентификации
confirm-totp-reset-password-instruction-v2 = Зайдите в <strong>приложение-аутентификатор</strong>, чтобы сбросить пароль.
confirm-totp-reset-password-trouble-code = Проблемы с вводом кода?
confirm-totp-reset-password-confirm-button = Подтвердить
confirm-totp-reset-password-input-label-v2 = Введите код из 6 цифр
confirm-totp-reset-password-use-different-account = Использовать другой аккаунт

## ResetPassword start page

password-reset-flow-heading = Сбросить пароль
password-reset-body-2 = Мы спросим пару вещей, которые знаете только вы, чтобы ваш профиль был в безопасности.
password-reset-email-input =
    .label = Введите ваш адрес эл. почты
password-reset-submit-button-2 = Продолжить

## ResetPasswordConfirmed

reset-password-complete-header = Ваш пароль был сброшен
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Перейти к { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Сбросить пароль
password-reset-recovery-method-subheader = Выберите метод восстановления
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Давайте удостоверимся, что это вы используете ваши методы восстановления.
password-reset-recovery-method-phone = Телефон для восстановления
password-reset-recovery-method-code = Резервные коды аутентификации
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Остался { $numBackupCodes } код
        [few] Осталось { $numBackupCodes } кодов
       *[many] Осталось { $numBackupCodes } кодов
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = При отправке кода на ваш телефон восстановления возникла проблема
password-reset-recovery-method-send-code-error-description = Пожалуйста, попробуйте ещё раз позже или используйте ваши резервные коды аутентификации.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Сбросить пароль
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Введите код восстановления
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = 6-значный код был отправлен на номер телефона, заканчивающийся на <span>{ $lastFourPhoneDigits }</span>, в текстовом сообщении. Срок действия этого кода истекает через 5 минут. Не делитесь этим кодом ни с кем.
reset-password-recovery-phone-input-label = Введите код из 6 цифр
reset-password-recovery-phone-code-submit-button = Подтвердить
reset-password-recovery-phone-resend-code-button = Отправить код ещё раз
reset-password-recovery-phone-resend-success = Код отправлен
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Аккаунт заблокирован?
reset-password-recovery-phone-send-code-error-heading = При отправке кода возникла проблема
reset-password-recovery-phone-code-verification-error-heading = При проверке вашего кода возникла проблема
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Подождите некоторое время и попробуйте снова.
reset-password-recovery-phone-invalid-code-error-description = Код неверен или просрочен.
reset-password-recovery-phone-invalid-code-error-link = Использовать резервные коды аутентификации?
reset-password-with-recovery-key-verified-page-title = Пароль успешно восстановлен
reset-password-complete-new-password-saved = Новый пароль сохранён!
reset-password-complete-recovery-key-created = Новый ключ восстановления аккаунта создан. Скачайте и сохраните его сейчас.
reset-password-complete-recovery-key-download-info =
    Этот ключ необходим для
    восстановления данных, если вы забудете свой пароль. <b>Скачайте и храните в безопасности
    сейчас, так как вы не сможете получить доступ к этой странице позже.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Ошибка:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Проверка входа…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Ошибка подтверждения
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Срок действия ссылки для подтверждения истёк
signin-link-expired-message-2 = Срок действия ссылки, на которую вы нажали, истёк или она уже была использована.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Введите свой пароль <span>для вашего { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Перейти к { $serviceName }
signin-subheader-without-logo-default = Перейти к настройкам аккаунта
signin-button = Войти
signin-header = Войти
signin-use-a-different-account-link = Использовать другой аккаунт
signin-forgot-password-link = Забыли пароль?
signin-password-button-label = Пароль
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.
signin-code-expired-error = Срок действия кода истёк. Пожалуйста, войдите снова.
signin-account-locked-banner-heading = Сбросить пароль
signin-account-locked-banner-description = Мы заблокировали ваш аккаунт, чтобы защитить его от подозрительной активности.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Сбросьте ваш пароль для входа

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = В ссылке, по которой вы щёлкнули, отсутствуют символы, и возможно она была повреждена вашим почтовым клиентом. Внимательно скопируйте адрес и попробуйте ещё раз.
report-signin-header = Сообщить о несанкционированном входе?
report-signin-body = Вы получили письмо о попытке доступа к вашему аккаунту. Хотите ли вы сообщить об этой подозрительной активности?
report-signin-submit-button = Сообщить о подозрительной активности
report-signin-support-link = Почему это происходит?
report-signin-error = К сожалению, при отправке сообщения возникла проблема.
signin-bounced-header = Извините. Мы заблокировали ваш аккаунт.
# $email (string) - The user's email.
signin-bounced-message = Письмо для подтверждения, которое мы отправили на { $email }, было возвращено, и мы заблокировали ваш аккаунт, чтобы защитить ваши данные { -brand-firefox }.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Если это действительный адрес электронной почты, <linkExternal>сообщите нам об этом</linkExternal>, и мы поможем разблокировать ваш аккаунт.
signin-bounced-create-new-account = Больше не владеете этой электронной почтой? Создайте новый аккаунт
back = Назад

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Подтвердите этот логин <span>для перехода к настройкам аккаунта</span>
signin-push-code-heading-w-custom-service = Подтвердите этот логин <span>для перехода к { $serviceName }</span>
signin-push-code-instruction = Пожалуйста, проверьте другие свои устройства и подтвердите этот вход из браузера { -brand-firefox }.
signin-push-code-did-not-recieve = Не получили уведомление?
signin-push-code-send-email-link = Код из эл. почты

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Подтвердите ваш логин
signin-push-code-confirm-description = Мы обнаружили попытку входа со следующего устройства. Если это были вы, пожалуйста, подтвердите вход
signin-push-code-confirm-verifying = Проверка
signin-push-code-confirm-login = Подтвердить вход
signin-push-code-confirm-wasnt-me = Это был не я, сменить пароль.
signin-push-code-confirm-login-approved = Ваш логин был одобрен. Пожалуйста, закройте это окно.
signin-push-code-confirm-link-error = Ссылка повреждена. Повторите попытку.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Войти
signin-recovery-method-subheader = Выберите метод восстановления
signin-recovery-method-details = Давайте удостоверимся, что это вы используете ваши методы восстановления.
signin-recovery-method-phone = Телефон для восстановления
signin-recovery-method-code-v2 = Резервные коды аутентификации
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Остался { $numBackupCodes } код
        [few] Осталось { $numBackupCodes } кода
       *[many] Осталось { $numBackupCodes } кодов
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = При отправке кода на ваш телефон восстановления возникла проблема
signin-recovery-method-send-code-error-description = Пожалуйста, попробуйте ещё раз позже или используйте ваши резервные коды аутентификации.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Войти
signin-recovery-code-sub-heading = Введите резервный код аутентификации
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Введите один из одноразовых кодов, которые вы сохранили при настройке двухэтапной аутентификации.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Введите 10-значный код
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Подтвердить
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Использовать телефон для восстановления
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Аккаунт заблокирован?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Требуется резервный код аутентификации
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = При отправке кода на ваш телефон восстановления возникла проблема
signin-recovery-code-use-phone-failure-description = Пожалуйста, попробуйте позже.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Войти
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Введите код восстановления
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Шестизначный код был отправлен в текстовом сообщении на номер телефона, заканчивающийся на <span>{ $lastFourPhoneDigits }</span>. Срок действия этого кода истекает через 5 минут. Не делитесь этим кодом ни с кем.
signin-recovery-phone-input-label = Введите код из 6 цифр
signin-recovery-phone-code-submit-button = Подтвердить
signin-recovery-phone-resend-code-button = Отправить код ещё раз
signin-recovery-phone-resend-success = Код отправлен
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Аккаунт заблокирован?
signin-recovery-phone-send-code-error-heading = При отправке кода возникла проблема
signin-recovery-phone-code-verification-error-heading = При проверке вашего кода возникла проблема
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Пожалуйста, попробуйте позже.
signin-recovery-phone-invalid-code-error-description = Код неверен или просрочен.
signin-recovery-phone-invalid-code-error-link = Использовать резервные коды аутентификации?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Вход был успешно выполнен. Если вы используете ваш номер телефона снова, то могут быть наложены ограничения.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Спасибо за вашу бдительность
signin-reported-message = Наша команда оповещена. Ваши сообщения помогают нам бороться со злоумышленниками.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Введите код подтверждения<span> для вашего { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Введите код, отправленный на <email>{ $email }</email>, в течение 5 минут.
signin-token-code-input-label-v2 = Введите код из 6 цифр
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Подтвердить
signin-token-code-code-expired = Срок действия кода истёк?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Отправить новый код по электронной почте.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Требуется код подтверждения
signin-token-code-resend-error = Что-то пошло не так. Не удалось отправить новый код.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Войти
signin-totp-code-subheader-v2 = Введите код двухэтапной аутентификации
signin-totp-code-instruction-v4 = Проверьте своё <strong>приложение-аутентификатор</strong>, чтобы подтвердить свой вход.
signin-totp-code-input-label-v4 = Введите код из 6 цифр
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Почему вас просят пройти аутентификацию?
signin-totp-code-aal-banner-content = Вы настроили двухэтапную аутентификацию в своём аккаунте, но ещё не входили с кодом на этом устройстве.
signin-totp-code-aal-sign-out = Выйти на этом устройстве
signin-totp-code-aal-sign-out-error = К сожалению, при выходе возникла проблема
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Подтвердить
signin-totp-code-other-account-link = Использовать другой аккаунт
signin-totp-code-recovery-code-link = Проблемы с вводом кода?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Требуется код аутентификации
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Разрешить этот вход
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Проверьте свой почтовый ящик на наличие кода авторизации, отправленного на { $email }.
signin-unblock-code-input = Введите код авторизации
signin-unblock-submit-button = Продолжить
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Требуется ввести код авторизации
signin-unblock-code-incorrect-length = Код авторизации должен содержать 8 символов
signin-unblock-code-incorrect-format-2 = Код авторизации может содержать только буквы и/или цифры
signin-unblock-resend-code-button = Нет в папке «Входящие» или «Спам»? Отправить снова
signin-unblock-support-link = Почему это происходит?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Введите код подтверждения
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Введите код подтверждения <span>для вашего { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Введите код, отправленный на <email>{ $email }</email>, в течение 5 минут.
confirm-signup-code-input-label = Введите код из 6 цифр
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Подтвердить
confirm-signup-code-sync-button = Начать синхронизацию
confirm-signup-code-code-expired = Срок действия кода истёк?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Отправить новый код по электронной почте.
confirm-signup-code-success-alert = Аккаунт успешно подтверждён
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Требуется код подтверждения
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Создать пароль
signup-relay-info = Пароль необходим для безопасного управления замаскированными адресами электронной почты и доступа к инструментам безопасности { -brand-mozilla }.
signup-sync-info = Синхронизируйте ваши пароли, закладки и пр., где бы вы ни использовали { -brand-firefox }.
signup-sync-info-with-payment = Синхронизируйте ваши пароли, способы оплаты, закладки и пр., где бы вы ни использовали { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Сменить адрес электронной почты

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Синхронизация включена
signup-confirmed-sync-success-banner = { -product-mozilla-account } подтверждён
signup-confirmed-sync-button = Начать веб-сёрфинг
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Ваши пароли, способы оплаты, адреса, закладки, история и пр. могут синхронизироваться везде, где вы используете { -brand-firefox }.
signup-confirmed-sync-description-v2 = Ваши пароли, адреса, закладки, история и пр. могут синхронизироваться везде, где вы используете { -brand-firefox }.
signup-confirmed-sync-add-device-link = Добавить другое устройство
signup-confirmed-sync-manage-sync-button = Управление синхронизацией
signup-confirmed-sync-set-password-success-banner = Пароль синхронизации создан
