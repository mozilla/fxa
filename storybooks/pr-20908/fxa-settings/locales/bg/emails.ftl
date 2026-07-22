## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Логотип на { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Синхронизирани устройства">
body-devices-image = <img data-l10n-name="devices-image" alt="Устройства">
fxa-privacy-url = Политика за личните данни на { -brand-mozilla }
moz-accounts-privacy-url-2 = Поверителност на { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Условия за ползване на { -product-mozilla-accounts(capitalization: "uppercase") }
account-deletion-info-block-communications = Ако вашият профил бъде изтрит, пак ще получавате имейли от Mozilla Corporation и Mozilla Foundation, освен ако не <a data-l10n-name="unsubscribeLink">поискате да се отпишете.</a>
account-deletion-info-block-support = Ако имате въпроси или се нуждаете от помощ, можете да се свържете с нашия <a data-l10n-name="supportLink">екип за поддръжка</a>.
account-deletion-info-block-communications-plaintext = Ако вашият профил е изтрит, пак ще получавате имейли от Mozilla Corporation и Mozilla Foundation, освен ако не поискате да се отпишете:
account-deletion-info-block-support-plaintext = Ако имате въпроси или се нуждаете от помощ, не се колебайте да се свържете с нашия екип за поддръжка:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Изтеглете { $productName } от { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Изтеглете { $productName } от { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Инсталирайте { $productName } на <a data-l10n-name="anotherDeviceLink">друго настолно устройство</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Инсталирайте { $productName } на <a data-l10n-name="anotherDeviceLink">друго устройство</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Изтеглете { $productName } от Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Изтеглете { $productName } от App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Инсталирайте { $productName } на друго устройство:
automated-email-change-2 = Ако не сте предприели това действие, <a data-l10n-name="passwordChangeLink">променете паролата си</a> веднага.
automated-email-support = За повече информация посетете <a data-l10n-name="supportLink">поддръжката на { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Ако не сте предприели това действие, веднага сменете паролата си:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = За повече информация посетете поддръжката на { -brand-mozilla }:
automated-email-inactive-account = Това е автоматично изпратено писмо. Получавате го, защото имате { -product-mozilla-account } и са изминали 2 години от последното ви вписване.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } За повече информация посетете <a data-l10n-name="supportLink">поддръжката на { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Това е автоматично електронно писмо. Ако сте го получили по погрешка, не е необходимо да правите нищо.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Това е автоматично изпратено писмо; ако вие не сте упълномощили това действие, моля, сменете паролата си:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Тази заявка дойде от { $uaBrowser } на { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Тази заявка дойде от { $uaBrowser } на { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Тази заявка идва от { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Тази заявка идва от { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Тази заявка идва от { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Ако това не сте били вие, <a data-l10n-name="revokeAccountRecoveryLink">изтрийте новия ключ</a> и <a data-l10n-name="passwordChangeLink">променете паролата си</a>.
automatedEmailRecoveryKey-change-pwd-only = Ако това не сте били вие, <a data-l10n-name="passwordChangeLink">променете паролата си</a>.
automatedEmailRecoveryKey-more-info = За повече информация посетете <a data-l10n-name="supportLink">поддръжката на { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Тази заявка дойде от:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Ако това не сте били вие, изтрийте новия ключ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Ако това не сте били вие, променете паролата си:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = и променете паролата си:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = За повече информация посетете поддръжката на { -brand-mozilla }:
change-password-plaintext = Ако подозирате, че някой се опитва да получи достъп до вашата сметка, моля, сменете паролата си.
manage-account = Управление на сметка
manage-account-plaintext = { manage-account }:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } на { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } на { $uaOS }
cadReminderFirst-action = Синхронизиране на друго устройство
cadReminderSecond-action = Синхронизиране на друго устройство
cadReminderSecond-title-2 = Не забравяйте да синхронизирате!
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Ново вписване от { $clientName }
newDeviceLogin-action = Управление на сметка
passwordChangeRequired-subject = Открита подозрителна дейност
passwordChanged-subject = Променена парола
passwordChanged-title = Паролата е успешно променена
passwordResetAccountRecovery-subject-2 = Паролата ви е нулирана
postAddAccountRecovery-action = Управление на профила
postAddLinkedAccount-action = Управление на профила
postAddTwoStepAuthentication-action = Управление на профила
postChangePrimary-subject = Основен електронен адрес е обновен
postChangePrimary-title = Нов основен ел. адрес
postChangePrimary-action = Управление на профила
postConsumeRecoveryCode-action = Управление на профила
postNewRecoveryCodes-action = Управление на профила
postRemoveAccountRecovery-action = Управление на профила
postRemoveSecondary-subject = Допълнителен електронен адрес е премахнат
postRemoveSecondary-title = Допълнителният ел. адрес е премахнат
postRemoveSecondary-action = Управление на профила
postRemoveTwoStepAuthentication-action = Управление на профила
postVerify-sub-title-3 = Радваме се да ви видим!
postVerifySecondary-subject = Добавен допълнителен електронен адрес
postVerifySecondary-title = Добавен допълнителен електронен адрес
postVerifySecondary-action = Управление на профила
recovery-subject = Нулиране на парола
recovery-action = Нова парола
unblockCode-title = Вие ли се вписахте?
unblockCode-prompt = Ако е така, ето кода за упълномощаване:
unblockCode-report-plaintext = Ако ли пък не – ни помогнете да отблъснем натрапниците като ни ги докладвате.
verify-subject = Завършете създаването на профила си
verifyLogin-action = Потвърждаване на вписването
verifyPrimary-description = Заявка за промяна на сметката е направена от следното устройство:
verifyPrimary-subject = Потвърждаване на основен електронен адрес
