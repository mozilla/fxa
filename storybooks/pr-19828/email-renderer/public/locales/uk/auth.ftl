## Non-email strings

session-verify-send-push-title-2 = Хочете увійти в { -product-mozilla-account }?
session-verify-send-push-body-2 = Натисніть тут, щоб підтвердити свою особу
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } – ваш код підтвердження { -brand-mozilla }. Термін дії закінчується через 5 хвилин.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Код підтвердження { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } – ваш код відновлення { -brand-mozilla }. Термін дії закінчується через 5 хвилин.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Код { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } – ваш код відновлення { -brand-mozilla }. Термін дії закінчується через 5 хвилин.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Код { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Логотип { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Синхронізовані пристрої">
body-devices-image = <img data-l10n-name="devices-image" alt="Пристрої">
fxa-privacy-url = Політика приватності { -brand-mozilla }
moz-accounts-privacy-url-2 = Положення про приватність { -product-mozilla-accounts(case: "gen", capitalization: "upper") }
moz-accounts-terms-url = Умови надання послуг { -product-mozilla-accounts(case: "gen", capitalization: "upper") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Логотип { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Логотип { -brand-mozilla }">
subplat-automated-email = Це автоматичне повідомлення; якщо ви отримали його помилково, не реагуйте на нього.
subplat-privacy-notice = Положення про приватність
subplat-privacy-plaintext = Положення про приватність:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Ви отримали цей лист, тому що { $email } пов'язано з { -product-mozilla-account(case: "abl") } і ви передплатили { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Ви отримали цей лист, тому що { $email } пов'язано з { -product-mozilla-account(case: "abl") }.
subplat-explainer-multiple-2 = Ви отримали цей лист, тому що { $email } пов'язано з { -product-mozilla-account(case: "abl") } і ви передплатили декілька продуктів.
subplat-explainer-was-deleted-2 = Ви отримали цей лист, тому що { $email } зареєстровано в { -product-mozilla-account(case: "loc") }.
subplat-manage-account-2 = Керуйте налаштуваннями { -product-mozilla-account(case: "gen") } на своїй <a data-l10n-name="subplat-account-page">сторінці облікового запису</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Керуйте налаштуваннями свого { -product-mozilla-account(case: "gen") } на сторінці: { $accountSettingsUrl }
subplat-terms-policy = Умови та політика відмови від послуг
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Скасувати передплату
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Поновити передплату
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Оновіть платіжну інформацію
subplat-privacy-policy = Політика приватності { -brand-mozilla }
subplat-privacy-policy-2 = Положення про приватність { -product-mozilla-accounts(case: "gen", capitalization: "upper") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Умови надання послуг { -product-mozilla-accounts(case: "gen", capitalization: "upper") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Правові положення
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Приватність
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = У разі видалення облікового запису ви й надалі отримуватимете електронні листи від Mozilla Corporation і Mozilla Foundation, якщо не <a data-l10n-name="unsubscribeLink">відпишетесь</a>.
account-deletion-info-block-support = Якщо у вас виникли запитання або вам потрібна допомога, зверніться до нашої <a data-l10n-name="supportLink">служби підтримки</a>.
account-deletion-info-block-communications-plaintext = У разі видалення облікового запису ви й надалі отримуватимете електронні листи від Mozilla Corporation і Mozilla Foundation, якщо не відпишетесь.
account-deletion-info-block-support-plaintext = Якщо у вас виникли запитання або вам потрібна допомога, зверніться до нашої служби підтримки.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Завантажити { $productName } з { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Завантажити { $productName } з { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Установити { $productName } на <a data-l10n-name="anotherDeviceLink">інший настільний пристрій</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Установити { $productName } на <a data-l10n-name="anotherDeviceLink">інший пристрій</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Отримати { $productName } у Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Завантажити { $productName } з App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Установити { $productName } на інший пристрій:
automated-email-change-2 = Якщо це були не ви, негайно <a data-l10n-name="passwordChangeLink">змініть свій пароль</a>.
automated-email-support = Щоб дізнатися більше, відвідайте <a data-l10n-name="supportLink">підтримку { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Якщо це були не ви, негайно змініть свій пароль:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Для отримання додаткової інформації відвідайте підтримку { -brand-mozilla }:
automated-email-inactive-account = Це автоматичний електронний лист. Ви отримуєте його, тому що маєте { -product-mozilla-account }, до якого не входили вже 2 роки.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Для отримання докладнішої інформації відвідайте <a data-l10n-name="supportLink">Підтримку { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Це автоматизований електронний лист. Якщо ви отримали його помилково, нічого робити не потрібно.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Це автоматичний лист; якщо ви не дозволяли цю дію, тоді, будь ласка, змініть свій пароль:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Цей запит надійшов з { $uaBrowser } на { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Цей запит надійшов з { $uaBrowser } на { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Цей запит надійшов з { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Цей запит надійшов з { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Цей запит надійшов з { $uaOS }.
automatedEmailRecoveryKey-delete-key-change-pwd = Якщо це були не ви, <a data-l10n-name="revokeAccountRecoveryLink">видаліть новий ключ</a> і <a data-l10n-name="passwordChangeLink">змініть пароль</a>.
automatedEmailRecoveryKey-change-pwd-only = Якщо це були не ви, <a data-l10n-name="passwordChangeLink">змініть пароль</a>.
automatedEmailRecoveryKey-more-info = Щоб дізнатися більше, відвідайте <a data-l10n-name="supportLink">підтримку { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Цей запит надійшов з:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Якщо це були не ви, видаліть новий ключ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Якщо це були не ви, змініть пароль:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = і змініть пароль:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Для отримання додаткової інформації відвідайте підтримку { -brand-mozilla }:
automated-email-reset =
    Це автоматично надісланий лист; якщо ви не авторизували цю дію, <a data-l10n-name="resetLink">скиньте свій пароль</a>.
    Для отримання додаткових відомостей зверніться до <a data-l10n-name="supportLink">підтримки { -brand-mozilla }</a>.
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = Якщо ви не дозволяли цю дію, скиньте свій пароль зараз за цим посиланням { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    Якщо це були не ви, негайно <a data-l10n-name="resetLink">скиньте свій пароль</a> і <a data-l10n-name="twoFactorSettingsLink">скиньте двоетапну перевірку</a>.
    Для отримання додаткової інформації відвідайте <a data-l10n-name="supportLink">Службу підтримки { -brand-mozilla }</a>.
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = Якщо це були не ви, негайно змініть пароль:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = Також скиньте двоетапну перевірку:
brand-banner-message = Чи знаєте ви, що ми змінили назву з { -product-firefox-accounts } на { -product-mozilla-accounts(capitalization: "upper") }? <a data-l10n-name="learnMore">Докладніше</a>
cancellationSurvey = Будь ласка, допоможіть вдосконалити наші послуги, долучившись до цього <a data-l10n-name="cancellationSurveyUrl">простого опитування</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Будь ласка, допоможіть нам вдосконалити наші послуги, взявши участь в цьому швидкому опитуванні:
change-password-plaintext = Якщо ви підозрюєте, що хтось намагається здобути доступ до вашого облікового запису, будь ласка, змініть свій пароль.
manage-account = Керування обліковим записом
manage-account-plaintext = { manage-account }:
payment-details = Подробиці платежу:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Номер рахунку: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Сплачено: { $invoiceTotal }, { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Наступний платіж: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Проміжний підсумок: { $invoiceSubtotal }

##

subscriptionSupport = Маєте питання щодо передплати? Наша <a data-l10n-name="subscriptionSupportUrl">команда підтримки</a> з радістю вам допоможе.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Маєте питання щодо передплати? Наша команда підтримки з радістю допоможе вам:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Дякуємо за передплату { $productName }. При виникненні будь-яких питань стосовно вашої передплати чи додаткової інформації про { $productName }, будь ласка, <a data-l10n-name="subscriptionSupportUrl">зв'яжіться з нами</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Дякуємо за передплату { $productName }. При виникненні будь-яких питань стосовно вашої передплати чи додаткової інформації про { $productName }, будь ласка, зв'яжіться з нами:
subscriptionUpdateBillingEnsure = Ви можете перевірити актуальність вашого способу оплати й даних облікового запису <a data-l10n-name="updateBillingUrl">тут</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Ви можете перевірити актуальність вашого способу оплати й даних облікового запису тут:
subscriptionUpdateBillingTry = Ми спробуємо виконати ваш платіж знову протягом наступних кількох днів, але, можливо, вам доведеться допомогти нам це виправити, <a data-l10n-name="updateBillingUrl">оновивши свої платіжні дані</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Ми спробуємо здійснити ваш платіж знову впродовж наступних кількох днів, але, можливо, вам доведеться допомогти нам це виправити, оновивши ваші платіжні дані:
subscriptionUpdatePayment = Щоб уникнути будь-яких переривань в роботі вашої служби, якнайшвидше оновіть <a data-l10n-name="updateBillingUrl">свої платіжні дані</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Щоб уникнути будь-яких переривань в роботі вашої служби, будь ласка, якнайшвидше оновіть платіжні дані:
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
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Переглянути рахунок: { $invoiceLink }
cadReminderFirst-subject-1 = Нагадування! Синхронізуймо { -brand-firefox }
cadReminderFirst-action = Синхронізувати інший пристрій
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Для синхронізації потрібно два пристрої
cadReminderFirst-description-v2 = Отримайте доступ до своїх вкладок, закладок, паролів та інших даних на всіх пристроях, де ви користуєтеся { -brand-firefox }.
cadReminderSecond-subject-2 = Не пропустіть! Завершімо налаштування синхронізації
cadReminderSecond-action = Синхронізувати інший пристрій
cadReminderSecond-title-2 = Не забудьте про синхронізацію!
cadReminderSecond-description-sync = Синхронізуйте свої закладки, паролі, відкриті вкладки та інші дані всюди, де ви користуєтеся { -brand-firefox }.
cadReminderSecond-description-plus = Крім того, ваші дані завжди зашифровані. Їх можете бачити лише ви та схвалені вами пристрої.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Вітаємо в { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Вітаємо в { $productName }
downloadSubscription-content-2 = Розпочніть користуватися всіма функціями, включеними у вашу передплату:
downloadSubscription-link-action-2 = Розпочнімо
fraudulentAccountDeletion-subject-2 = Ваш { -product-mozilla-account } видалено
fraudulentAccountDeletion-title = Ваш обліковий запис видалено
fraudulentAccountDeletion-content-part1-v2 = Нещодавно було створено { -product-mozilla-account } і стягнуто передплату з використанням цієї адреси електронної пошти. Оскільки це новий обліковий запис, необхідно підтвердити пов'язану з ним адресу електронної пошти.
fraudulentAccountDeletion-content-part2-v2 = Цей обліковий запис ще не підтверджено. Оскільки цей крок не завершено, ми не впевнені в тому, що це була авторизована передплата. Як наслідок, зареєстрований з цією адресою електронної пошти { -product-mozilla-account } було видалено, а передплату скасовано з поверненням коштів.
fraudulentAccountDeletion-contact = Якщо у вас виникли запитання, зв’яжіться з нашою <a data-l10n-name="mozillaSupportUrl">службою підтримки</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Якщо у вас виникли запитання, зверніться до нашої служби підтримки: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = Остання нагода зберегти свій { -product-mozilla-account }
inactiveAccountFinalWarning-title = Ваш обліковий запис { -brand-mozilla } і пов'язані дані буде видалено
inactiveAccountFinalWarning-preview = Увійдіть, щоб зберегти свій обліковий запис
inactiveAccountFinalWarning-account-description = Ваш { -product-mozilla-account } використовується для доступу до безплатних продуктів, як-от Синхронізація{ -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } та { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = <strong>{ $deletionDate }</strong> ваш обліковий запис разом із пов'язаними даними буде остаточно видалено, якщо ви не ввійдете в систему.
inactiveAccountFinalWarning-action = Увійдіть, щоб зберегти свій обліковий запис
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = Увійдіть, щоб зберегти обліковий запис:
inactiveAccountFirstWarning-subject = Не втрачайте свій обліковий запис
inactiveAccountFirstWarning-title = Ви хочете зберегти свій обліковий запис і дані { -brand-mozilla }?
inactiveAccountFirstWarning-account-description-v2 = Ваш { -product-mozilla-account } використовується для доступу до безплатних продуктів, як-от Синхронізація{ -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } та { -product-mdn }.
inactiveAccountFirstWarning-inactive-status = Ми помітили, що ви не входили в обліковий запис упродовж 2 років.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = <strong>{ $deletionDate }</strong> ваш обліковий запис разом із пов'язаними даними буде остаточно видалено через неактивність.
inactiveAccountFirstWarning-action = Увійдіть, щоб зберегти свій обліковий запис
inactiveAccountFirstWarning-preview = Увійдіть, щоб зберегти свій обліковий запис
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Увійдіть, щоб зберегти обліковий запис:
inactiveAccountSecondWarning-subject = Необхідна дія: видалення облікового запису через 7 днів
inactiveAccountSecondWarning-title = Ваш обліковий запис { -brand-mozilla } і пов'язані дані буде видалено через 7 днів
inactiveAccountSecondWarning-account-description-v2 = Ваш { -product-mozilla-account } використовується для доступу до безплатних продуктів, як-от Синхронізація{ -brand-firefox }, { -product-mozilla-monitor }, { -product-firefox-relay } та { -product-mdn }.
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = <strong>{ $deletionDate }</strong> ваш обліковий запис разом із пов'язаними даними буде остаточно видалено через неактивність.
inactiveAccountSecondWarning-action = Увійдіть, щоб зберегти свій обліковий запис
inactiveAccountSecondWarning-preview = Увійдіть, щоб зберегти свій обліковий запис
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = Увійдіть, щоб зберегти обліковий запис:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = У вас закінчилися резервні коди автентифікації!
codes-reminder-title-one = Ви використовуєте останній резервний код автентифікації
codes-reminder-title-two = Час створити додаткові резервні коди автентифікації
codes-reminder-description-part-one = Резервні коди автентифікації допомагають відновити дані, якщо ви забудете пароль.
codes-reminder-description-part-two = Створіть нові коди зараз, щоб потім не втратити свої дані.
codes-reminder-description-two-left = У вас залишилося лише два коди.
codes-reminder-description-create-codes = Створіть нові резервні коди автентифікації, щоб мати змогу ввійти до свого облікового запису, якщо ви заблоковані.
lowRecoveryCodes-action-2 = Створити коди
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Не лишилося резервних кодів автентифікації
        [one] Залишився лише 1 резервний код автентифікації!
        [few] Залишилося лише { $numberRemaining } резервних коди автентифікації!
       *[many] Залишилося лише { $numberRemaining } резервних кодів автентифікації!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Новий вхід у { $clientName }
newDeviceLogin-subjectForMozillaAccount = Новий вхід у ваш { -product-mozilla-account }
newDeviceLogin-title-3 = Ваш { -product-mozilla-account } було використано для входу
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Це були не ви? <a data-l10n-name="passwordChangeLink">Змініть свій пароль</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Це були не ви? Змініть свій пароль:
newDeviceLogin-action = Керування обліковим записом
passwordChanged-subject = Пароль оновлено
passwordChanged-title = Пароль успішно змінено
passwordChanged-description-2 = Пароль вашого { -product-mozilla-account(case: "gen") } успішно змінено з такого пристрою:
passwordChangeRequired-subject = Виявлено підозрілу активність
password-forgot-otp-title = Забули свій пароль?
password-forgot-otp-request = Ми отримали запит на зміну пароля до вашого { -product-mozilla-account(case: "gen") } від:
password-forgot-otp-code-2 = Якщо це були ви, ось ваш код підтвердження, щоб продовжити:
password-forgot-otp-expiry-notice = Термін дії коду – 10 хвилин.
passwordReset-subject-2 = Ваш пароль було скинуто
passwordReset-title-2 = Ваш пароль було скинуто
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = Ви скинули свій пароль { -product-mozilla-account }:
passwordResetAccountRecovery-subject-2 = Ваш пароль було скинуто
passwordResetAccountRecovery-title-3 = Ваш пароль було скинуто
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = Ви використали ключ відновлення облікового запису, щоб скинути пароль { -product-mozilla-account }:
passwordResetAccountRecovery-information = Ви вийшли з усіх ваших синхронізованих пристроїв. Ми створили новий ключ відновлення облікового запису замість використаного. Ви можете змінити його в налаштуваннях облікового запису.
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = Ви вийшли з усіх ваших синхронізованих пристроїв. Ми створили новий ключ відновлення облікового запису замість використаного. Ви можете змінити його в налаштуваннях облікового запису.
passwordResetAccountRecovery-action-4 = Керувати обліковим записом
passwordResetRecoveryPhone-subject = Використано телефон для відновлення
passwordResetRecoveryPhone-preview = Підтвердьте, що це були ви
passwordResetRecoveryPhone-title = Ваш телефон для відновлення використано для підтвердження скидання пароля
passwordResetRecoveryPhone-device = Використано телефон для відновлення:
passwordResetRecoveryPhone-action = Керування обліковим записом
passwordResetWithRecoveryKeyPrompt-subject = Ваш пароль було скинуто
passwordResetWithRecoveryKeyPrompt-title = Ваш пароль було скинуто
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = Ви скинули свій пароль { -product-mozilla-account }:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = Створити ключ відновлення облікового запису
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = Створити ключ відновлення облікового запису:
passwordResetWithRecoveryKeyPrompt-cta-description = Вам потрібно буде знову виконати вхід на всіх синхронізованих пристроях. Наступного разу захистіть свої дані за допомогою ключа відновлення облікового запису. Це дасть вам змогу відновити дані у разі втрати пароля.
postAddAccountRecovery-subject-3 = Створено новий ключ відновлення облікового запису
postAddAccountRecovery-title2 = Ви створили новий ключ відновлення облікового запису
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Збережіть цей ключ у надійному місці — він знадобиться вам, щоб відновити зашифровані дані перегляду, якщо ви втратите пароль.
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = Цей ключ можна використати лише один раз. Після його використання автоматично створиться новий. Або ж ви можете будь-коли створити новий ключ у налаштуваннях свого облікового запису.
postAddAccountRecovery-action = Керування обліковим записом
postAddLinkedAccount-subject-2 = До вашого { -product-mozilla-account(case: "gen") } прив'язано новий сторонній обліковий запис
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Обліковий запис { $providerName } було прив'язано до вашого { -product-mozilla-account(case: "gen") }
postAddLinkedAccount-action = Керувати обліковим записом
postAddRecoveryPhone-subject = Додано телефон для відновлення
postAddRecoveryPhone-preview = Обліковий запис захищено двоетапною перевіркою
postAddRecoveryPhone-title-v2 = Ви додали номер телефону для відновлення
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Ви додали номер телефону для відновлення: { $maskedLastFourPhoneNumber }
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = Як це захищає ваш обліковий запис
postAddRecoveryPhone-how-protect-plaintext = Як це захищає ваш обліковий запис:
postAddRecoveryPhone-enabled-device = Ви ввімкнули це з:
postAddRecoveryPhone-action = Керувати обліковим записом
postAddTwoStepAuthentication-title-2 = Ви увімкнули двоетапну перевірку
postAddTwoStepAuthentication-action = Керування обліковим записом
postChangeAccountRecovery-subject = Ключ відновлення облікового запису змінено
postChangeAccountRecovery-title = Ви змінили ключ відновлення облікового запису
postChangeAccountRecovery-body-part1 = Тепер у вас є новий ключ відновлення облікового запису. Ваш попередній ключ видалено.
postChangeAccountRecovery-body-part2 = Збережіть цей новий ключ у надійному місці — він знадобиться вам, щоб відновити зашифровані дані перегляду, якщо ви втратите пароль.
postChangeAccountRecovery-action = Керувати обліковим записом
postChangePrimary-subject = Основну адресу електронної пошти оновлено
postChangePrimary-title = Нова основна адреса електронної пошти
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Ви успішно змінили свою основну адресу електронної пошти на { $email }. Ця адреса відтепер є вашим іменем користувача для входу в { -product-mozilla-account }, а також для отримання сповіщень безпеки та підтверджень входу.
postChangePrimary-action = Керування обліковим записом
postChangeRecoveryPhone-subject = Номер телефону для відновлення оновлено
postChangeRecoveryPhone-preview = Обліковий запис захищено двоетапною перевіркою
postChangeRecoveryPhone-title = Ви змінили телефон для відновлення
postChangeRecoveryPhone-description = Тепер у вас є новий телефон для відновлення. Ваш попередній номер телефону видалено.
postChangeRecoveryPhone-requested-device = Ви зробили запит з:
postConsumeRecoveryCode-title-3 = Ваш резервний код автентифікації використано для підтвердження скидання пароля
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = Використано код:
postConsumeRecoveryCode-action = Керування обліковим записом
postConsumeRecoveryCode-subject-v3 = Використано резервний код автентифікації
postConsumeRecoveryCode-preview = Підтвердьте, що це були ви
postNewRecoveryCodes-subject-2 = Створено нові резервні коди автентифікації
postNewRecoveryCodes-title-2 = Ви створили нові резервні коди автентифікації
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Вони були створені на:
postNewRecoveryCodes-action = Керування обліковим записом
postRemoveAccountRecovery-subject-2 = Ключ відновлення облікового запису видалено
postRemoveAccountRecovery-title-3 = Ви видалили ключ відновлення облікового запису
postRemoveAccountRecovery-body-part1 = Ваш ключ відновлення облікового запису потрібен для відновлення зашифрованих даних у разі втрати пароля.
postRemoveAccountRecovery-body-part2 = Якщо ви ще цього не зробили, створіть новий ключ відновлення облікового запису в налаштуваннях, щоб запобігти втраті збережених паролів, закладок, історії перегляду та інших даних.
postRemoveAccountRecovery-action = Керування обліковим записом
postRemoveRecoveryPhone-subject = Телефон для відновлення вилучено
postRemoveRecoveryPhone-preview = Обліковий запис захищено двоетапною перевіркою
postRemoveRecoveryPhone-title = Телефон для відновлення вилучено
postRemoveRecoveryPhone-description-v2 = Ваш телефон для відновлення вилучено з налаштувань двоетапної перевірки.
postRemoveRecoveryPhone-description-extra = Ви все ще можете використати свої резервні коди автентифікації для входу, якщо не можете скористатися програмою автентифікації.
postRemoveRecoveryPhone-requested-device = Ви зробили запит з:
postRemoveSecondary-subject = Альтернативну електронну пошту видалено
postRemoveSecondary-title = Альтернативну електронну пошту видалено
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Ви успішно вилучили додаткову адресу { $secondaryEmail } зі свого { -product-mozilla-account(case: "gen") }. Сповіщення безпеки та підтвердження входу більше не надсилатимуться на цю адресу.
postRemoveSecondary-action = Керування обліковим записом
postRemoveTwoStepAuthentication-subject-line-2 = Двоетапну перевірку вимкнено
postRemoveTwoStepAuthentication-title-2 = Ви вимкнули двоетапну перевірку
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Ви вимкнули її на:
postRemoveTwoStepAuthentication-action = Керування обліковим записом
postRemoveTwoStepAuthentication-not-required-2 = Вам більше не потрібно буде вводити коди безпеки з програми авторизації під час входу.
postSigninRecoveryCode-subject = Резервний код автентифікації, який використовується для входу
postSigninRecoveryCode-preview = Підтвердження дій в обліковому записі
postSigninRecoveryCode-title = Ваш резервний код автентифікації використано для входу
postSigninRecoveryCode-description = Якщо це були не ви, негайно змініть пароль, щоб захистити свій обліковий запис.
postSigninRecoveryCode-device = Ви ввійшли з:
postSigninRecoveryCode-action = Керувати обліковим записом
postSigninRecoveryPhone-subject = Телефон для відновлення, використаний для входу
postSigninRecoveryPhone-preview = Підтвердження дій в обліковому записі
postSigninRecoveryPhone-title = Ваш телефон для відновлення використано для входу
postSigninRecoveryPhone-description = Якщо це були не ви, негайно змініть пароль, щоб захистити свій обліковий запис.
postSigninRecoveryPhone-device = Ви ввійшли з:
postSigninRecoveryPhone-action = Керувати обліковим записом
postVerify-sub-title-3 = Ми раді вас бачити!
postVerify-title-2 = Хочете бачити одну вкладку на двох пристроях?
postVerify-description-2 = Це легко! Просто встановіть { -brand-firefox } на інший пристрій і ввійдіть, щоб почати синхронізацію. Це як магія!
postVerify-sub-description = (Пссс… Це також означає, що ви можете отримати свої закладки, паролі та інші дані { -brand-firefox } скрізь, де ви ввійшли.)
postVerify-subject-4 = Вітаємо в { -brand-mozilla }!
postVerify-setup-2 = Під'єднати інший пристрій:
postVerify-action-2 = Під'єднати інший пристрій
postVerifySecondary-subject = Альтернативну електронну пошту додано
postVerifySecondary-title = Альтернативну електронну пошту додано
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Ви успішно підтвердили додаткову адресу { $secondaryEmail } для свого { -product-mozilla-account(case: "gen") }. Відтепер сповіщення безпеки та підтвердження входу надсилатимуться на обидві адреси.
postVerifySecondary-action = Керування обліковим записом
recovery-subject = Відновити свій пароль
recovery-title-2 = Забули свій пароль?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Ми отримали запит на зміну пароля до вашого { -product-mozilla-account(case: "gen") } від:
recovery-new-password-button = Створіть новий пароль, натиснувши кнопку нижче. Термін дії цього посилання закінчиться протягом години.
recovery-copy-paste = Створіть новий пароль, скопіювавши та вставивши наведену нижче URL-адресу у свій браузер. Термін дії цього посилання закінчиться протягом наступної години.
recovery-action = Створити новий пароль
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Вашу передплату { $productName } було скасовано
subscriptionAccountDeletion-title = Шкода, що ви йдете
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Ви нещодавно видалили свій { -product-mozilla-account }, тому ми скасували вашу передплату { $productName }. Ваш останній рахунок на суму { $invoiceTotal } був сплачений { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Вітаємо в { $productName }: Будь ласка, встановіть пароль.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Вітаємо в { $productName }
subscriptionAccountFinishSetup-content-processing = Ваш платіж обробляється. Це може тривати до чотирьох робочих днів. Ваша передплата автоматично поновлюватиметься після завершення розрахункового періоду, доки ви її не скасуєте.
subscriptionAccountFinishSetup-content-create-3 = Далі вам необхідно створити пароль { -product-mozilla-account(case: "gen") }, щоб почати використовувати нову передплату.
subscriptionAccountFinishSetup-action-2 = Розпочати
subscriptionAccountReminderFirst-subject = Нагадування: Завершіть налаштування свого облікового запису
subscriptionAccountReminderFirst-title = Ви поки що не можете отримати доступ до своєї передплати
subscriptionAccountReminderFirst-content-info-3 = Кілька днів тому ви створили { -product-mozilla-account }, але не підтвердили його. Ми сподіваємося, що ви завершите налаштування, щоб мати змогу користуватися своєю передплатою.
subscriptionAccountReminderFirst-content-select-2 = Виберіть “Створити пароль” для встановлення нового пароля та завершення налаштування свого облікового запису.
subscriptionAccountReminderFirst-action = Створити пароль
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Останнє нагадування: Налаштуйте свій обліковий запис
subscriptionAccountReminderSecond-title-2 = Вітаємо в { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Кілька днів тому ви створили { -product-mozilla-account }, але не підтвердили його. Ми сподіваємося, що ви завершите налаштування, щоб мати змогу користуватися своєю передплатою.
subscriptionAccountReminderSecond-content-select-2 = Виберіть “Створити пароль” для встановлення нового пароля та завершення налаштування свого облікового запису.
subscriptionAccountReminderSecond-action = Створити пароль
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Вашу передплату { $productName } було скасовано
subscriptionCancellation-title = Шкода, що ви йдете

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Ми скасували вашу передплату на { $productName }. Ваш останній платіж у розмірі { $invoiceTotal } було сплачено { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Ми скасували вашу передплату на { $productName }. Ваш останній платіж у розмірі { $invoiceTotal } буде сплачено { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Ваша послуга чинна до кінця поточного розрахункового періоду, який становить { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Ви перейшли на { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Ви успішно перейшли з { $productNameOld } на { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Починаючи з вашого наступного рахунку, сума платежу зміниться з { $paymentAmountOld } за { $productPaymentCycleOld } на { $paymentAmountNew } за { $productPaymentCycleNew }. У той самий час вам також буде надано одноразовий кредит розміром { $paymentProrated } для покриття нижчої вартості залишку цього { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = При наявності нового програмного забезпечення, яке необхідно встановити для користування { $productName }, ви отримаєте окремий лист з інструкціями щодо завантаження.
subscriptionDowngrade-content-auto-renew = Ваша передплата автоматично поновлюватиметься на кожен наступний період, доки ви не її не скасуєте.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Вашу передплату { $productName } було скасовано
subscriptionFailedPaymentsCancellation-title = Вашу передплату скасовано
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Ми скасували вашу передплату { $productName }, оскільки декілька спроб оплати були невдалими. Щоб отримати доступ знову, спробуйте виконати передплату з використанням оновленого способу оплати.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Платіж за { $productName } підтверджено
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Дякуємо вам за передплату { $productName }
subscriptionFirstInvoice-content-processing = Ваш платіж обробляється і його завершення може тривати до чотирьох робочих днів.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Ви отримаєте окремий електронний лист про те, як почати користуватися { $productName }.
subscriptionFirstInvoice-content-auto-renew = Ваша передплата автоматично поновлюватиметься на кожен наступний період, доки ви не її не скасуєте.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Не вдалося оплатити { $productName }
subscriptionPaymentFailed-title = Перепрошуємо, але в нас виникли проблеми з вашим платежем
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = У нас виникли проблеми з вашим останнім платежем для { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Необхідно оновити платіжні дані для { $productName }
subscriptionPaymentProviderCancelled-title = Перепрошуємо, але у нас виникли проблеми з вашим способом оплати
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Ми виявили проблему з вашим способом оплати для { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Передплату { $productName } поновлено
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Дякуємо, що поновили передплату на { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ваш цикл платежів та їхній розмір залишаться незмінними. Наступна оплата складе { $invoiceTotal } та буде здійснена { $nextInvoiceDateOnly }. Ваша передплата автоматично продовжуватиметься на встановлений розрахунковий період, доки ви не скасуєте її.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Повідомлення про автоматичне поновлення { $productName }
subscriptionRenewalReminder-title = Ваша передплата невдовзі буде поновлена
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Шановний передплатнику { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Ваша чинна передплата налаштована на автоматичне поновлення через { $reminderLength } днів. У вказаний час { -brand-mozilla } поновить вашу передплату { $planIntervalCount } { $planInterval } і з вашого облікового запису буде списано { $invoiceTotal } за визначеним способом оплати.
subscriptionRenewalReminder-content-closing = З повагою,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Команда { $productName }
subscriptionReplaced-subject = Вашу передплату оновлено у зв'язку з переходом на тарифний план вищого рівня
subscriptionReplaced-title = Вашу передплату оновлено
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = Вашу індивідуальну передплату { $productName } замінено, і тепер включено до вашого нового пакету.
subscriptionReplaced-content-credit = Ви отримаєте кредит за невикористаний час попередньої передплати. Цей кредит буде автоматично застосовано до вашого облікового запису та використано для майбутніх платежів.
subscriptionReplaced-content-no-action = Вам не потрібно виконувати жодних дій.
subscriptionsPaymentProviderCancelled-subject = Для передплат { -brand-mozilla } необхідно оновити платіжну інформацію
subscriptionsPaymentProviderCancelled-title = Перепрошуємо, але у нас виникли проблеми з вашим способом оплати
subscriptionsPaymentProviderCancelled-content-detected = Ми виявили проблему з вашим способом оплати для таких передплат.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Платіж за { $productName } отримано
subscriptionSubsequentInvoice-title = Ми вдячні вам за передплату!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Ми отримали ваш останній платіж для { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Ви перейшли на { $productName }
subscriptionUpgrade-title = Дякуємо вам за передплату!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = Ви успішно перейшли на { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-credit = Ви отримали кредит у розмірі { $paymentProrated }.
subscriptionUpgrade-existing = Якщо ваші наявні передплати перетинаються з цим оновленням, ми обробимо їх і надішлемо вам окремий електронний лист із детальною інформацією. Якщо ваш новий план включає продукти, які потребують встановлення, ми надішлемо вам окремий електронний лист з інструкціями щодо налаштування.
subscriptionUpgrade-auto-renew = Ваша передплата автоматично поновлюватиметься на кожен наступний період, доки ви не її не скасуєте.
unblockCode-title = Це ви виконуєте вхід?
unblockCode-prompt = Якщо так, ось код авторизації, який вам потрібен:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Якщо так, ось код авторизації, який вам потрібен: { $unblockCode }
unblockCode-report = Якщо ні, допоможіть нам не допустити зловмисників і <a data-l10n-name="reportSignInLink">повідомте про це нас.</a>
unblockCode-report-plaintext = Якщо ні, допоможіть нам не допустити зловмисників і повідомте про це нас.
verificationReminderFinal-subject = Останнє нагадування про підтвердження облікового запису
verificationReminderFinal-description-2 = Кілька тижнів тому ви створили { -product-mozilla-account }, але досі не підтвердили його. Для вашої безпеки ми видалимо обліковий запис, якщо його не буде підтверджено протягом наступних 24 годин.
confirm-account = Підтвердити обліковий запис
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Не забудьте підтвердити свій обліковий запис
verificationReminderFirst-title-3 = Вітаємо в { -brand-mozilla }!
verificationReminderFirst-description-3 = Кілька днів тому ви створили { -product-mozilla-account }, але досі його не підтвердили. Якщо ви не підтвердите свій обліковий запис протягом наступних 15 днів, його буде автоматично видалено.
verificationReminderFirst-sub-description-3 = Не проґавте браузер, який цінує вас і вашу приватність понад усе.
confirm-email-2 = Підтвердити обліковий запис
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Підтвердити обліковий запис
verificationReminderSecond-subject-2 = Не забудьте підтвердити свій обліковий запис
verificationReminderSecond-title-3 = Не пропустіть { -brand-mozilla }!
verificationReminderSecond-description-4 = Кілька днів тому ви створили { -product-mozilla-account }, але досі його не підтвердили. Якщо ви не підтвердите свій обліковий запис протягом наступних 10 днів, його буде автоматично видалено.
verificationReminderSecond-second-description-3 = { -product-mozilla-account(capitalization: "upper") } дає можливість синхронізувати ваші дані { -brand-firefox } на різних пристроях і відкриває доступ до інших продуктів від { -brand-mozilla }, які захищають вашу приватність.
verificationReminderSecond-sub-description-2 = Станьте частиною нашої місії з перетворення Інтернету на місце, відкрите для всіх.
verificationReminderSecond-action-2 = Підтвердити обліковий запис
verify-title-3 = Відкрийте інтернет разом з { -brand-mozilla }
verify-description-2 = Підтвердьте свій обліковий запис і отримайте максимум від { -brand-mozilla } всюди де ви зайдете, починаючи з:
verify-subject = Завершіть створення свого облікового запису
verify-action-2 = Підтвердити обліковий запис
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Ви входили до { $clientName }?
verifyLogin-description-2 = Допоможіть нам захистити ваш обліковий запис, підтвердивши, що ви ввійшли на:
verifyLogin-subject-2 = Підтвердити вхід
verifyLogin-action = Підтвердити вхід
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Ви виконували вхід до { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Допоможіть нам захистити ваш обліковий запис, підтвердивши свій вхід на:
verifyLoginCode-prompt-3 = Якщо так, ось код підтвердження:
verifyLoginCode-expiry-notice = Термін його дії спливає через 5 хвилин.
verifyPrimary-title-2 = Підтвердьте основну адресу електронної пошти
verifyPrimary-description = Було здійснено запит змін в обліковому записі з такого пристрою:
verifyPrimary-subject = Підтвердьте основну адресу електронної пошти
verifyPrimary-action-2 = Підтвердьте електронну пошту
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Після підтвердження з цього пристрою стануть доступними такі зміни облікового запису, як додавання альтернативної електронної пошти.
verifySecondaryCode-title-2 = Підтвердьте альтернативну адресу електронної пошти
verifySecondaryCode-action-2 = Підтвердьте електронну пошту
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Запит використання { $email }, як альтернативної електронної пошти, було зроблено з такого { -product-mozilla-account(case: "gen") }:
verifySecondaryCode-prompt-2 = Використати цей код підтвердження:
verifySecondaryCode-expiry-notice-2 = Термін його дії спливає через 5 хвилин. Одразу після підтвердження, на цю адресу надсилатимуться сповіщення про безпеку та підтвердження входів.
verifyShortCode-title-3 = Відкрийте інтернет разом з { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Підтвердьте свій обліковий запис і отримайте максимум від { -brand-mozilla } всюди де ви зайдете, починаючи з:
verifyShortCode-prompt-3 = Використати цей код підтвердження:
verifyShortCode-expiry-notice = Термін його дії спливає через 5 хвилин.
