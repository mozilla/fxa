## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="{ -brand-mozilla } logo">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Синхронизация устройств">
body-devices-image = <img data-l10n-name="devices-image" alt="Устройства">
fxa-privacy-url = Политика конфиденциальности { -brand-mozilla }
moz-accounts-privacy-url-2 = Уведомление о конфиденциальности { -product-mozilla-accounts(case: "genitive") }
moz-accounts-terms-url = Правила использования { -product-mozilla-accounts(case: "genitive") }
account-deletion-info-block-communications = Если ваш аккаунт удалён, вы по-прежнему будете получать электронные письма от Mozilla Corporation и Mozilla Foundation, если только вы <a data-l10n-name="unsubscribeLink">не попросите отписаться</a>.
account-deletion-info-block-support = Если у вас есть вопросы или нужна помощь, не стесняйтесь связаться с нашей <a data-l10n-name="supportLink">командой поддержки</a>.
account-deletion-info-block-communications-plaintext = Если ваш аккаунт удалён, вы по-прежнему будете получать электронные письма от Mozilla Corporation и Mozilla Foundation, если только вы не попросите отписаться:
account-deletion-info-block-support-plaintext = Если у вас есть вопросы или нужна помощь, не стесняйтесь обращаться к нашей команде поддержки:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Скачать { $productName } в { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Скачать { $productName } в { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Установите { $productName } на <a data-l10n-name="anotherDeviceLink">другом компьютере</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Установите { $productName } на <a data-l10n-name="anotherDeviceLink">другом устройстве</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Получите { $productName } в Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Скачайте { $productName } в App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Установите { $productName } на другое устройство:
automated-email-change-2 = Если вы не производили это действие, немедленно <a data-l10n-name="passwordChangeLink">смените свой пароль</a>.
automated-email-support = Для получения дополнительной информации посетите <a data-l10n-name="supportLink">поддержку { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Если вы не производили это действие, немедленно измените пароль:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Для получения дополнительных сведений посетите страницу поддержки { -brand-mozilla }:
automated-email-inactive-account = Это письмо создано автоматически. Вы получаете его, потому что у вас есть { -product-mozilla-account(case: "nominative") } и прошло 2 года с момента вашего последнего входа.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Для получения дополнительных сведений посетите <a data-l10n-name="supportLink">страницу поддержки { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Это автоматически созданное сообщение. Если вы получили его по ошибке, вам не нужно ничего делать.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Это автоматически созданное сообщение; если вы не совершали такого действия, пожалуйста, смените свой пароль:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Этот запрос поступил от { $uaBrowser } в { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Этот запрос поступил от { $uaBrowser } в { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Этот запрос поступил от { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Этот запрос поступил от { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Этот запрос поступил от { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Если это были не вы, <a data-l10n-name="revokeAccountRecoveryLink">удалите новый ключ </a> и <a data-l10n-name="passwordChangeLink">смените пароль</a>.
automatedEmailRecoveryKey-change-pwd-only = Если это были не вы, <a data-l10n-name="passwordChangeLink">смените свой пароль</a>.
automatedEmailRecoveryKey-more-info = Для получения дополнительной информации посетите <a data-l10n-name="supportLink">поддержку { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Этот запрос поступил от:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Если это были не вы, удалите новый ключ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Если это были не вы, смените пароль:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = и смените свой пароль:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Для получения дополнительных сведений посетите страницу поддержки { -brand-mozilla }:
automated-email-reset =
    Это письмо создано автоматически; если вы не выполняли это действие, то, пожалуйста, <a data-l10n-name="resetLink">сбросьте свой пароль</a>.
    Для получения дополнительных сведений посетите <a data-l10n-name="supportLink">страницу поддержки { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Если вы не авторизовали это действие, пожалуйста, немедленно сбросьте свой пароль по ссылке { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Если вы не производили это действие, <a data-l10n-name="resetLink">сбросьте ваш пароль</a> и <a data-l10n-name="twoFactorSettingsLink">сбросьте двухэтапную аутентификацию</a> немедленно.
    Для получения дополнительной информации посетите <a data-l10n-name="supportLink">поддержку { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Если вы не производили это действие, немедленно сбросьте свой пароль на:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Также сбросьте двухэтапную аутентификацию на:
automated-email-sign-in =
    Это письмо создано автоматически; если вы не авторизовали это действие, то, пожалуйста, <a data-l10n-name="securitySettingsLink">проверьте настройки безопасности вашего аккаунта</a>.
    Для получения дополнительной информации посетите <a data-l10n-name="supportLink">Службу поддержки { -brand-mozilla }</a>.
automated-email-sign-in-plaintext = Если вы не авторизовали это действие, пожалуйста, проверьте настройки безопасности вашего аккаунта по адресу:
brand-banner-message = Знаете ли вы, что мы изменили наше название с «{ -product-firefox-accounts }» на «{ -product-mozilla-accounts }»? <a data-l10n-name="learnMore">Подробнее</a>
change-password-plaintext = Если вы подозреваете, что кто-то пытается получить доступ к вашему аккаунту, пожалуйста, измените ваш пароль.
manage-account = Управление аккаунтом
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = Для получения дополнительной информации посетите <a data-l10n-name="supportLink">поддержку { -brand-mozilla }</a>.
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = Для получения дополнительных сведений посетите страницу поддержки { -brand-mozilla }: { $supportUrl }.
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } на { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } на { $uaOS }
# Variables:
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (приблизительно)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (приблизительно)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (приблизительно)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (приблизительно)
cadReminderFirst-subject-1 = Напоминание! Давайте синхронизируем { -brand-firefox }
cadReminderFirst-action = Синхронизировать другое устройство
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Для синхронизации нужно всего два устройства
cadReminderFirst-description-v2 = Используйте свои вкладки на всех устройствах. Сохраняйте закладки, пароли и другие данные везде, где вы используете { -brand-firefox }.
cadReminderSecond-subject-2 = Не пропустите! Давайте закончим настройку синхронизации.
cadReminderSecond-action = Синхронизировать другое устройство
cadReminderSecond-title-2 = Не забудьте синхронизировать!
cadReminderSecond-description-sync = Синхронизируйте свои закладки, пароли, открытые вкладки и многое другое — где бы вы ни были с { -brand-firefox }
cadReminderSecond-description-plus = Кроме того, ваши данные всегда зашифрованы. Только вы и ваши доверенные устройства смогут их увидеть.
inactiveAccountFinalWarning-subject = Последний шанс сохранить свой { -product-mozilla-account(case: "nominative") }
inactiveAccountFinalWarning-title = Ваш аккаунт { -brand-mozilla } и данные будут удалены
inactiveAccountFinalWarning-preview = Войдите, чтобы сохранить свой аккаунт
inactiveAccountFinalWarning-account-description = Ваш { -product-mozilla-account(case: "nominative") } используется для доступа к бесплатным продуктам для обеспечения приватности и просмотра, таким как синхронизация { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } и { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong>, ваш аккаунт и ваши личные данные будут навсегда удалены, если вы не войдёте в него.
inactiveAccountFinalWarning-action = Войдите, чтобы сохранить свой аккаунт
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Войдите, чтобы сохранить свой аккаунт:
inactiveAccountFirstWarning-subject = Не потеряйте свой аккаунт
inactiveAccountFirstWarning-title = Вы хотите сохранить свой аккаунт { -brand-mozilla } и данные?
inactiveAccountFirstWarning-account-description-v2 = Ваш { -product-mozilla-account(case: "nominative") } используется для доступа к бесплатным продуктам для обеспечения приватности и просмотра, таким как синхронизация { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } и { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Мы заметили, что вы не совершали вход в течение 2 лет.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = Ваш аккаунт и ваши личные данные будут навсегда удалены на <strong>{ $deletionDate }</strong>, так как вы не были активны.
inactiveAccountFirstWarning-action = Войдите, чтобы сохранить свой аккаунт
inactiveAccountFirstWarning-preview = Войдите, чтобы сохранить свой аккаунт
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Войдите, чтобы сохранить свой аккаунт:
inactiveAccountSecondWarning-subject = Требуется действие: Удаление аккаунта через 7 дней
inactiveAccountSecondWarning-title = Ваш аккаунт { -brand-mozilla } и данные будут удалены через 7 дней
inactiveAccountSecondWarning-account-description-v2 = Ваш { -product-mozilla-account(case: "nominative") } используется для доступа к бесплатным продуктам для обеспечения приватности и просмотра, таким как синхронизация { -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } и { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = Ваш аккаунт и ваши личные данные будут навсегда удалены <strong>{ $deletionDate }</strong>, так как вы не были активны.
inactiveAccountSecondWarning-action = Войдите, чтобы сохранить свой аккаунт
inactiveAccountSecondWarning-preview = Войдите, чтобы сохранить свой аккаунт
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Войдите, чтобы сохранить свой аккаунт:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = У вас закончились резервные коды аутентификации!
codes-reminder-title-one = Вы используете последний резервный код аутентификации
codes-reminder-title-two = Время создать больше резервных кодов аутентификации
codes-reminder-description-part-one = Запасные коды аутентификации помогут вам восстановить ваши данные, если вы забудете свой пароль.
codes-reminder-description-part-two = Создавайте новые коды сейчас, чтобы не потерять свои данные позже.
codes-reminder-description-two-left = У вас осталось только два кода.
codes-reminder-description-create-codes = Создайте новые запасные коды аутентификации, чтобы помочь вам вернуться в свой аккаунт, если вы заблокированы.
lowRecoveryCodes-action-2 = Создать коды
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Резервных кодов аутентификации не осталось
        [one] Остался всего { $numberRemaining } резервный код аутентификации!
        [few] Осталось всего { $numberRemaining } резервных кода аутентификации!
       *[many] Осталось всего { $numberRemaining } резервных кодов аутентификации!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Новый вход в { $clientName }
newDeviceLogin-subjectForMozillaAccount = Новый вход в ваш { -product-mozilla-account(case: "nominative") }
newDeviceLogin-title-3 = Ваш { -product-mozilla-account(case: "nominative") }  был использован для входа в систему
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Не вы? <a data-l10n-name="passwordChangeLink">Смените свой пароль</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Не вы? Смените свой пароль:
newDeviceLogin-action = Управление аккаунтом
passwordChangeRequired-subject = Обнаружена подозрительная активность
passwordChangeRequired-preview = Немедленно смените пароль
passwordChangeRequired-title-2 = Сбросить пароль
passwordChangeRequired-suspicious-activity-3 = Мы заблокировали ваш аккаунт, чтобы защитить его от подозрительной активности. Вы вышли из всех своих устройств, и в качестве меры предосторожности все синхронизированные данные были удалены.
passwordChangeRequired-sign-in-3 = Чтобы снова войти в свой аккаунт, всё, что вам нужно сделать, — это сбросить пароль.
passwordChangeRequired-different-password-2 = <b>Важно:</b> Выберите надёжный пароль, отличный от тех, которые вы использовали в прошлом.
passwordChangeRequired-different-password-plaintext-2 = Важно: Выберите надёжный пароль, отличный от паролей, которые вы использовали в прошлом.
passwordChangeRequired-action = Сбросить пароль
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = Пароль изменён
passwordChanged-title = Пароль успешно изменён
passwordChanged-description-2 = Ваш пароль для { -product-mozilla-account(case: "nominative") } был успешно изменён со следующего устройства:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Используйте { $code }, чтобы сменить свой пароль
password-forgot-otp-preview = Срок действия этого кода истекает через 10 минут
password-forgot-otp-title = Забыли ваш пароль?
password-forgot-otp-request = Мы получили запрос на смену пароля для вашего { -product-mozilla-account(case: "genitive") } от:
password-forgot-otp-code-2 = Если это были вы, вот ваш код подтверждения для продолжения:
password-forgot-otp-expiry-notice = Срок действия этого кода истечёт через 10 минут.
passwordReset-subject-2 = Ваш пароль был сброшен
passwordReset-title-2 = Ваш пароль был сброшен
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Вы сбросили свой пароль для { -product-mozilla-account(case: "genitive") } на:
passwordResetAccountRecovery-subject-2 = Ваш пароль был сброшен
passwordResetAccountRecovery-title-3 = Ваш пароль был сброшен
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Вы использовали ключ восстановления своего аккаунта для сброса пароля { -product-mozilla-account(case: "genitive") } на:
passwordResetAccountRecovery-information = Мы отключили вас на всех синхронизируемых устройствах. Мы создали новый ключ восстановления аккаунта, чтобы заменить тот, который вы использовали. Вы можете изменить его в настройках своего аккаунта.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Мы отключили вас на всех синхронизируемых устройствах. Мы создали новый ключ восстановления аккаунта, чтобы заменить тот, который вы использовали. Вы можете изменить его в настройках вашего аккаунта:
passwordResetAccountRecovery-action-4 = Управление аккаунтом
passwordResetRecoveryPhone-subject = Использован телефон для восстановления
passwordResetRecoveryPhone-preview = Проверьте, чтобы убедиться, что это были вы
passwordResetRecoveryPhone-title = Ваш телефон для восстановления был использован для подтверждения сброса пароля
passwordResetRecoveryPhone-device = Телефон для восстановления был использован из:
passwordResetRecoveryPhone-action = Управление аккаунтом
passwordResetWithRecoveryKeyPrompt-subject = Ваш пароль был сброшен
passwordResetWithRecoveryKeyPrompt-title = Ваш пароль был сброшен
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Вы сбросили свой пароль для { -product-mozilla-account(case: "genitive") } на:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Создать ключ восстановления аккаунта
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Создать ключ восстановления аккаунта:
passwordResetWithRecoveryKeyPrompt-cta-description = Вам нужно будет снова войти в систему на всех ваших синхронизированных устройствах. В следующий раз сохраните свои данные в безопасности с ключом восстановления аккаунта. Это позволит вам восстановить данные, если вы забудете пароль.
postAddAccountRecovery-subject-3 = Новый ключ восстановления аккаунта создан
postAddAccountRecovery-title2 = Вы создали новый ключ восстановления аккаунта
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Сохраните этот ключ в надёжном месте — он понадобится вам для восстановления зашифрованных данных просмотра, если вы забудете свой пароль.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Этот ключ можно использовать только один раз. После того, как вы его используете, мы автоматически создадим для вас новый. Или вы можете создать новый в любое время в настройках своего аккаунта.
postAddAccountRecovery-action = Управление аккаунтом
postAddLinkedAccount-subject-2 = Новый аккаунт, связанный с вашим { -product-mozilla-account(case: "instrumental") }
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Ваш аккаунт { $providerName } был привязан к { -product-mozilla-account(case: "dative") }
postAddLinkedAccount-action = Управлять аккаунтом
postAddPasskey-subject = Ключ доступа создан
postAddPasskey-preview = Теперь вы можете использовать своё устройство для входа
postAddPasskey-title = Вы создали ключ доступа
postAddPasskey-description = Теперь вы можете использовать его для входа во все свои сервисы { -product-mozilla-account }.
postAddPasskey-sync-note = Обратите внимание, что для доступа к данным синхронизации { -brand-firefox } по-прежнему будет требоваться ваш пароль.
# Links out to a support article about passkeys and { -brand-firefox } sync
postAddPasskey-learn-more = Подробнее
postAddPasskey-requested-from = Вы запросили это с:
postAddPasskey-action = Управление аккаунтом
postAddRecoveryPhone-subject = Телефон для восстановления добавлен
postAddRecoveryPhone-preview = Аккаунт защищён двухэтапной аутентификацией
postAddRecoveryPhone-title-v2 = Вы добавили номер телефона для восстановления
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Вы добавили { $maskedLastFourPhoneNumber } в качестве номера телефона для восстановления
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Как это защищает ваш аккаунт
postAddRecoveryPhone-how-protect-plaintext = Как это защищает ваш аккаунт:
postAddRecoveryPhone-enabled-device = Вы включили его из:
postAddRecoveryPhone-action = Управление аккаунтом
postAddTwoStepAuthentication-preview = Ваш аккаунт защищён
postAddTwoStepAuthentication-subject-v3 = Двухэтапная аутентификация включена
postAddTwoStepAuthentication-title-2 = Вы включили двухэтапную аутентификацию
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = Вы запросили это с:
postAddTwoStepAuthentication-action = Управление аккаунтом
postAddTwoStepAuthentication-code-required-v4 = Коды безопасности от вашего приложения-аутентификатора теперь требуются каждый раз, когда вы совершаете вход.
postAddTwoStepAuthentication-recovery-method-codes = Вы также добавили резервные коды аутентификации в качестве метода восстановления.
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = Вы также добавили { $maskedPhoneNumber } в качестве номера телефона для восстановления.
postAddTwoStepAuthentication-how-protects-link = Как это защищает ваш аккаунт
postAddTwoStepAuthentication-how-protects-plaintext = Как это защищает ваш аккаунт:
postAddTwoStepAuthentication-device-sign-out-message = Чтобы защитить все подключённые устройства, вам следует выйти везде, где вы используете этот аккаунт, а затем войти снова, используя двухэтапную аутентификацию.
postChangeAccountRecovery-subject = Ключ восстановления аккаунта изменён
postChangeAccountRecovery-title = Вы изменили ключ восстановления своего аккаунта
postChangeAccountRecovery-body-part1 = Теперь у вас есть новый ключ восстановления аккаунта. Ваш предыдущий ключ был удалён.
postChangeAccountRecovery-body-part2 = Сохраните этот новый ключ в надёжном месте — он понадобится вам для восстановления зашифрованных данных просмотра, если вы забудете свой пароль.
postChangeAccountRecovery-action = Управление аккаунтом
postChangePrimary-subject = Основная электронная почта изменена
postChangePrimary-title = Новая основная электронная почта
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Вы успешно изменили свой адрес электронной почты на { $email }. Этот адрес является вашим именем пользователя для входа в { -product-mozilla-account(case: "nominative") }, а также для получения уведомлений безопасности и подтверждений входа.
postChangePrimary-action = Управление аккаунтом
postChangeRecoveryPhone-subject = Телефон для восстановления обновлён
postChangeRecoveryPhone-preview = Аккаунт защищён двухэтапной аутентификацией
postChangeRecoveryPhone-title = Вы изменили свой телефон для восстановления
postChangeRecoveryPhone-description = Теперь у вас есть новый телефон для восстановления. Ваш предыдущий номер телефона был удалён.
postChangeRecoveryPhone-requested-device = Вы запросили его из:
postChangeTwoStepAuthentication-preview = Ваш аккаунт защищён
postChangeTwoStepAuthentication-subject = Двухэтапная аутентификация обновлена
postChangeTwoStepAuthentication-title = Двухэтапная аутентификация была обновлена
postChangeTwoStepAuthentication-use-new-account = Теперь вам нужно использовать новую запись { -product-mozilla-account(case: "genitive") } в своём приложении для аутентификации. Предыдущая больше не будет работать и вы можете удалить её.
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = Вы запросили это с:
postChangeTwoStepAuthentication-action = Управление аккаунтом
postChangeTwoStepAuthentication-how-protects-link = Как это защищает ваш аккаунт
postChangeTwoStepAuthentication-how-protects-plaintext = Как это защищает ваш аккаунт:
postChangeTwoStepAuthentication-device-sign-out-message = Чтобы защитить все подключённые устройства, вам следует выйти везде, где вы используете этот аккаунт, а затем войти снова, используя новую двухэтапную аутентификацию.
postConsumeRecoveryCode-title-3 = Ваш резервный код аутентификации был использован для подтверждения сброса пароля
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Использован код из:
postConsumeRecoveryCode-action = Управление аккаунтом
postConsumeRecoveryCode-subject-v3 = Использован резервный код аутентификации
postConsumeRecoveryCode-preview = Проверьте, чтобы убедиться, что это были вы
postNewRecoveryCodes-subject-2 = Созданы новые резервные коды аутентификации
postNewRecoveryCodes-title-2 = Вы создали новые резервные коды аутентификации
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Они были созданы на:
postNewRecoveryCodes-action = Управление аккаунтом
postRemoveAccountRecovery-subject-2 = Ключ восстановления аккаунта удалён
postRemoveAccountRecovery-title-3 = Вы удалили свой ключ восстановления аккаунта
postRemoveAccountRecovery-body-part1 = Ключ восстановления вашего аккаунта необходим для восстановления зашифрованных данных просмотра, если вы забудете свой пароль.
postRemoveAccountRecovery-body-part2 = Если вы ещё этого не сделали, создайте новый ключ восстановления аккаунта в настройках своего аккаунта, чтобы не потерять сохранённые пароли, закладки, историю просмотров и многое другое.
postRemoveAccountRecovery-action = Управление аккаунтом
postRemovePasskey-subject = Ключ доступа удалён
postRemovePasskey-preview = Ключ доступа был удалён из вашего аккаунта
postRemovePasskey-title = Вы удалили свой ключ доступа
postRemovePasskey-description = Вам нужно использовать другой метод для входа.
postRemovePasskey-requested-from = Вы запросили это с:
postRemovePasskey-action = Управление аккаунтом
postRemoveRecoveryPhone-subject = Телефон для восстановления удалён
postRemoveRecoveryPhone-preview = Аккаунт защищён двухэтапной аутентификацией
postRemoveRecoveryPhone-title = Телефон для восстановления удалён
postRemoveRecoveryPhone-description-v2 = Ваш телефон для восстановления был удален из настроек двухэтапной аутентификации.
postRemoveRecoveryPhone-description-extra = Вы по-прежнему можете использовать свои резервные коды аутентификации для входа, если не можете использовать своё приложение для аутентификации.
postRemoveRecoveryPhone-requested-device = Вы запросили его из:
postRemoveSecondary-subject = Удалена дополнительная электронная почта
postRemoveSecondary-title = Удалена дополнительная электронная почта
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Вы успешно удалили { $secondaryEmail } в качестве дополнительного адреса электронной почты вашего { -product-mozilla-account(case: "genitive") }. Уведомления безопасности и подтверждения входа в систему больше не будут приходить на этот адрес.
postRemoveSecondary-action = Управление аккаунтом
postRemoveTwoStepAuthentication-subject-line-2 = Двухэтапная аутентификация отключена
postRemoveTwoStepAuthentication-title-2 = Вы отключили двухэтапную аутентификацию
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Вы отключили её с:
postRemoveTwoStepAuthentication-action = Управление аккаунтом
postRemoveTwoStepAuthentication-not-required-2 = Вам больше не нужны коды безопасности из приложения для аутентификации при входе в систему.
postSigninRecoveryCode-subject = Резервный код аутентификации, используемый для входа
postSigninRecoveryCode-preview = Подтвердите активность аккаунта
postSigninRecoveryCode-title = Ваш резервный код аутентификации был использован для входа
postSigninRecoveryCode-description = Если вы этого не делали, вам следует немедленно сменить свой пароль, чтобы обеспечить безопасность вашего аккаунта.
postSigninRecoveryCode-device = Вы вошли с:
postSigninRecoveryCode-action = Управление аккаунтом
postSigninRecoveryPhone-subject = Восстановление телефона, использованного для входа
postSigninRecoveryPhone-preview = Подтвердите активность аккаунта
postSigninRecoveryPhone-title = Ваш телефон для восстановления был использован для входа в систему
postSigninRecoveryPhone-description = Если вы этого не делали, вам следует немедленно сменить свой пароль, чтобы обеспечить безопасность вашего аккаунта.
postSigninRecoveryPhone-device = Вы вошли с:
postSigninRecoveryPhone-action = Управление аккаунтом
postVerify-sub-title-3 = Мы рады видеть вас!
postVerify-title-2 = Хотите видеть одну и ту же вкладку на двух устройствах?
postVerify-description-2 = Это просто! Просто установите { -brand-firefox } на другое устройство и войдите в аккаунт для синхронизации. Это как волшебство!
postVerify-sub-description = (Это также означает, что вы можете получить свои закладки, пароли, и другие данные { -brand-firefox } везде, где вы вошли в аккаунт).
postVerify-subject-4 = Добро пожаловать в { -brand-mozilla }!
postVerify-setup-2 = Подключить другое устройство:
postVerify-action-2 = Подключить другое устройство
postVerifySecondary-subject = Добавлена дополнительная электронная почта
postVerifySecondary-title = Добавлена дополнительная электронная почта
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Вы успешно подтвердили { $secondaryEmail } в качестве дополнительного адреса электронной почты вашего { -product-mozilla-account(case: "genitive") }. Теперь уведомления безопасности и подтверждения входа в систему будут доставляться на оба адреса электронной почты.
postVerifySecondary-action = Управление аккаунтом
recovery-subject = Восстановить ваш пароль
recovery-title-2 = Забыли свой пароль?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Мы получили запрос на смену пароля для вашего { -product-mozilla-account(case: "genitive") } от:
recovery-new-password-button = Создайте новый пароль, щёлкнув по кнопке ниже. Срок действия этой ссылки истекает в течение следующего часа.
recovery-copy-paste = Создайте новый пароль, скопировав и вставив приведенный ниже URL-адрес в адресную строку браузера. Срок действия этой ссылки истекает в течение следующего часа.
recovery-action = Создать новый пароль
# Variables:
#  $unblockCode (String) - The authorization code for sign-in
unblockCode-subject-2 = Используйте { $unblockCode } для входа
unblockCode-preview = Срок действия кода истекает через час
unblockCode-title = Это входили вы?
unblockCode-prompt = Если да, вот - код авторизации, который вам понадобится:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Если да, вот - код авторизации, который вам понадобится: { $unblockCode }
unblockCode-report = Если нет, помогите нам в борьбе со злоумышленниками и <a data-l10n-name="reportSignInLink">сообщите нам об этом</a>.
unblockCode-report-plaintext = Если нет, помогите нам в борьбе со злоумышленниками и сообщите нам об этом.
verificationReminderFinal-subject = Последнее напоминание для подтверждения вашего аккаунта
verificationReminderFinal-description-2 = Пару недель назад вы создали { -product-mozilla-account(case: "nominative") }, но так и не подтвердили его. В целях вашей безопасности мы удаляем аккаунт, если он не будет подтверждён в течение следующих 24 часов.
confirm-account = Подтвердить аккаунт
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Не забудьте подтвердить свой аккаунт
verificationReminderFirst-title-3 = Добро пожаловать в { -brand-mozilla }!
verificationReminderFirst-description-3 = Несколько дней назад вы создали { -product-mozilla-account(case: "nominative") }, но так и не подтвердили его. Пожалуйста, подтвердите свой аккаунт в течение следующих 15 дней, или он будет автоматически удалён.
verificationReminderFirst-sub-description-3 = Не пропустите браузер, который ставит вас и вашу приватность на первое место.
confirm-email-2 = Подтвердить аккаунт
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Подтвердить аккаунт
verificationReminderSecond-subject-2 = Не забудьте подтвердить свой аккаунт
verificationReminderSecond-title-3 = Не упустите в { -brand-mozilla }!
verificationReminderSecond-description-4 = Несколько дней назад вы создали { -product-mozilla-account(case: "nominative") }, но так и не подтвердили его. Пожалуйста, подтвердите свой аккаунт в течение следующих 10 дней, или он будет автоматически удалён.
verificationReminderSecond-second-description-3 = Ваш { -product-mozilla-account(case: "nominative") } позволяет синхронизировать работу с { -brand-firefox } на разных устройствах и открывает доступ к большему количеству продуктов от { -brand-mozilla }, защищающих конфиденциальность.
verificationReminderSecond-sub-description-2 = Станьте частью нашей миссии по трансформации Интернета в место, открытое для всех.
verificationReminderSecond-action-2 = Подтвердить аккаунт
verify-title-3 = Откройте Интернет с помощью { -brand-mozilla }
verify-description-2 = Подтвердите свой аккаунт и получайте максимальную выгоду от { -brand-mozilla } везде, где вы входите в систему, начиная с:
verify-subject = Завершите создание вашего аккаунта
verify-action-2 = Подтвердить аккаунт
# Variables:
# $code (String) - The verification code
verifyAccountChange-subject = Используйте { $code } чтобы сменить свой аккаунт
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-preview =
    { $expirationTime ->
        [one] Срок действия этого кода истекает через { $expirationTime } минуту.
        [few] Срок действия этого кода истекает через { $expirationTime } минуты.
       *[many] Срок действия этого кода истекает через { $expirationTime } минут.
    }
verifyAccountChange-title = Вы редактируете информацию своего аккаунта?
# After the colon is a description of the device used to sign in to the service
verifyAccountChange-safe = Помогите нам обеспечить безопасность вашего аккаунта, одобрив это изменение:
verifyAccountChange-prompt = Если да, то вот ваш код авторизации:
# Variables:
# $expirationTime (Number) - Represents the expiration time in minutes
verifyAccountChange-expiry-notice =
    { $expirationTime ->
        [one] Срок его действия истекает через { $expirationTime } минуту.
        [few] Срок его действия истекает через { $expirationTime } минуты.
       *[many] Срок его действия истекает через { $expirationTime } минут.
    }
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Вы входили в { $clientName }?
verifyLogin-description-2 = Помогите нам обеспечить безопасность вашего аккаунта, подтвердив, что вы в него входили:
verifyLogin-subject-2 = Подтвердить вход
verifyLogin-action = Подтвердить вход
# Variables:
#  $code (String) - The confirmation code for sign-in
verifyLoginCode-subject-line-3 = Используйте { $code } для входа
verifyLoginCode-preview = Срок действия этого кода истекает через 5 минут.
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Вы вошли в { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Помогите нам обеспечить безопасность вашей учётной записи, подтвердив вход в:
verifyLoginCode-prompt-3 = Если да, то вот ваш код авторизации:
verifyLoginCode-expiry-notice = Срок его действия истечёт через 5 минут.
verifyPrimary-title-2 = Подтвердите основную электронную почту
verifyPrimary-description = Запрос на выполнение изменений в аккаунте был сделан со следующего устройства:
verifyPrimary-subject = Подтвердите основную электронную почту
verifyPrimary-action-2 = Подтвердите электронную почту
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = После подтверждения, с этого устройства станут возможны такие изменения аккаунта как добавление дополнительной электронной почты.
# Variables:
#  $code (String) - The confirmation code for secondary email
verifySecondaryCode-subject-2 = Используйте { $code } для подтверждения своей дополнительной электронной почты
verifySecondaryCode-preview = Срок действия этого кода истекает через 5 минут.
verifySecondaryCode-title-2 = Подтвердите дополнительную электронную почту
verifySecondaryCode-action-2 = Подтвердите электронную почту
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Запрос на использование { $email } в качестве дополнительного адреса электронной почты был сделан со следующего { -product-mozilla-account(case: "genitive") }:
verifySecondaryCode-prompt-2 = Используйте этот код подтверждения:
verifySecondaryCode-expiry-notice-2 = Срок его действия истекает через 5 минут. После подтверждения, на этот адрес станут приходить оповещения безопасности и подтверждения.
# Variables:
#  $code (String) - comfirmation code for the account
verifyShortCode-subject-4 = Используйте { $code } для подтверждения своего аккаунта
verifyShortCode-preview-2 = Срок действия этого кода истекает через 5 минут
verifyShortCode-title-3 = Откройте Интернет с помощью { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Подтвердите свой аккаунт и получайте максимальную пользу от { -brand-mozilla } везде, где вы входите в систему, начиная с:
verifyShortCode-prompt-3 = Используйте этот код подтверждения:
verifyShortCode-expiry-notice = Срок его действия истечёт через 5 минут.
