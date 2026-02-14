



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] облікових записів Firefox
               *[upper] Облікових записів Firefox
            }
        [dat]
            { $capitalization ->
                [lower] обліковим записам Firefox
               *[upper] Обліковим записам Firefox
            }
        [acc]
            { $capitalization ->
                [lower] облікові записи Firefox
               *[upper] Облікові записи Firefox
            }
        [abl]
            { $capitalization ->
                [lower] обліковими записами Firefox
               *[upper] Обліковими записами Firefox
            }
        [loc]
            { $capitalization ->
                [lower] облікових записах Firefox
               *[upper] Облікових записах Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] облікові записи Firefox
               *[upper] Облікові записи Firefox
            }
    }
-product-mozilla-account =
    { $case ->
        [gen]
            { $capitalization ->
                [upper] Облікового запису Mozilla
               *[lower] облікового запису Mozilla
            }
        [dat]
            { $capitalization ->
                [upper] Обліковому запису Mozilla
               *[lower] обліковому запису Mozilla
            }
        [acc]
            { $capitalization ->
                [upper] Обліковий запис Mozilla
               *[lower] обліковий запис Mozilla
            }
        [abl]
            { $capitalization ->
                [upper] Обліковим записом Mozilla
               *[lower] обліковим записом Mozilla
            }
        [loc]
            { $capitalization ->
                [upper] Обліковому записі Mozilla
               *[lower] обліковому записі Mozilla
            }
       *[nom]
            { $capitalization ->
                [upper] Обліковий запис Mozilla
               *[lower] обліковий запис Mozilla
            }
    }
-product-mozilla-accounts =
    { $case ->
        [gen]
            { $capitalization ->
                [upper] Облікових записів Mozilla
               *[lower] облікових записів Mozilla
            }
        [dat]
            { $capitalization ->
                [upper] Обліковим записам Mozilla
               *[lower] обліковим записам Mozilla
            }
        [acc]
            { $capitalization ->
                [upper] Облікові записи Mozilla
               *[lower] облікові записи Mozilla
            }
        [abl]
            { $capitalization ->
                [upper] Обліковими записами Mozilla
               *[lower] обліковими записами Mozilla
            }
        [loc]
            { $capitalization ->
                [upper] Облікових записах Mozilla
               *[lower] облікових записах Mozilla
            }
       *[nom]
            { $capitalization ->
                [upper] Облікові записи Mozilla
               *[lower] облікові записи Mozilla
            }
    }
-product-firefox-account =
    { $case ->
        [gen]
            { $capitalization ->
                [lower] облікового запису Firefox
               *[upper] Облікового запису Firefox
            }
        [dat]
            { $capitalization ->
                [lower] обліковому запису Firefox
               *[upper] Обліковому запису Firefox
            }
        [acc]
            { $capitalization ->
                [lower] обліковий запис Firefox
               *[upper] Обліковий запис Firefox
            }
        [abl]
            { $capitalization ->
                [lower] обліковим записом Firefox
               *[upper] Обліковим записом Firefox
            }
        [loc]
            { $capitalization ->
                [lower] обліковому записі Firefox
               *[upper] Обліковому записі Firefox
            }
       *[nom]
            { $capitalization ->
                [lower] обліковий запис Firefox
               *[upper] Обліковий запис Firefox
            }
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-firefox-relay = Firefox Relay
-brand-apple = Apple
-brand-google = Google
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Загальна помилка програми
app-general-err-message = Щось пішло не так. Будь ласка, спробуйте знову пізніше.
app-query-parameter-err-heading = Неправильний запит: недійсні параметри


app-footer-mozilla-logo-label = Логотип { -brand-mozilla }
app-footer-privacy-notice = Положення про приватність вебсайту
app-footer-terms-of-service = Умови надання послуг


app-default-title-2 = { -product-mozilla-accounts(capitalization: "upper") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(capitalization: "upper") }


link-sr-new-window = Відкриється в новому вікні


app-loading-spinner-aria-label-loading = Завантаження…


app-logo-alt-3 =
    .alt = Логотип m { -brand-mozilla }



resend-code-success-banner-heading = Новий код надіслано на вашу електронну пошту.
resend-link-success-banner-heading = Нове посилання надіслано на вашу електронну пошту.
resend-success-banner-description = Додайте { $accountsEmail } до своїх контактів, щоб гарантовано отримувати повідомлення.


brand-banner-dismiss-button-2 =
    .aria-label = Закрити банер
brand-prelaunch-title = 1 листопада { -product-firefox-accounts } буде перейменовано на { -product-mozilla-accounts(capitalization: "upper") }
brand-prelaunch-subtitle = Ви й надалі можете використовувати те саме ім'я користувача та пароль, а продукти, якими ви користуєтеся, не змінюватимуться.
brand-postlaunch-title = Ми змінили назву { -product-firefox-accounts } на { -product-mozilla-accounts(capitalization: "upper") }. Ви й надалі можете використовувати те саме ім'я користувача та пароль, а продукти, якими ви користуєтеся, не змінюватимуться.
brand-learn-more = Докладніше
brand-close-banner =
    .alt = Закрити банер
brand-m-logo =
    .alt = Логотип m { -brand-mozilla }


button-back-aria-label = Назад
button-back-title = Назад


recovery-key-download-button-v3 = Завантажити та продовжити
    .title = Завантажити та продовжити
recovery-key-pdf-heading = Ключ відновлення облікового запису
recovery-key-pdf-download-date = Згенеровано: { $date }
recovery-key-pdf-key-legend = Ключ відновлення облікового запису
recovery-key-pdf-instructions = Цей ключ дає змогу відновити зашифровані дані браузера (паролі, закладки, історію тощо) у разі втрати пароля. Збережіть його в надійному місці.
recovery-key-pdf-storage-ideas-heading = Місця для зберігання ключа
recovery-key-pdf-support = Дізнайтеся більше про ключ відновлення облікового запису
recovery-key-pdf-download-error = На жаль, виникла проблема із завантаженням ключа відновлення облікового запису.


choose-newsletters-prompt-2 = Отримайте більше від { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Отримуйте наші останні новини та оновлення продуктів
choose-newsletters-option-test-pilot =
    .label = Ранній доступ до тестування нових продуктів
choose-newsletters-option-reclaim-the-internet =
    .label = Сповіщення про дії для відновлення доступу до інтернету


datablock-download =
    .message = Завантажено
datablock-copy =
    .message = Скопійовано
datablock-print =
    .message = Надруковано


datablock-inline-copy =
    .message = Скопійовано


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (приблизно)
device-info-block-location-region-country = { $region }, { $country } (приблизно)
device-info-block-location-city-country = { $city }, { $country } (приблизно)
device-info-block-location-country = { $country } (приблизно)
device-info-block-location-unknown = Невідоме розташування
device-info-browser-os = { $browserName } на { $genericOSName }
device-info-ip-address = IP-адреса: { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = Пароль
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Повторити пароль
form-password-with-inline-criteria-signup-submit-button = Створити обліковий запис
form-password-with-inline-criteria-reset-new-password =
    .label = Новий пароль
form-password-with-inline-criteria-confirm-password =
    .label = Підтвердити пароль
form-password-with-inline-criteria-reset-submit-button = Створити новий пароль
form-password-with-inline-criteria-match-error = Паролі відрізняються
form-password-with-inline-criteria-sr-too-short-message = Пароль має містити принаймні 8 символів.
form-password-with-inline-criteria-sr-not-email-message = Пароль не повинен містити вашу адресу електронної пошти.
form-password-with-inline-criteria-sr-not-common-message = Пароль не повинен бути загальновживаним.
form-password-with-inline-criteria-sr-requirements-met = Введений пароль відповідає всім вимогам.
form-password-with-inline-criteria-sr-passwords-match = Введені паролі збігаються.


form-verify-code-default-error = Це поле обов'язкове


form-verify-totp-disabled-button-title-numeric = Щоб продовжити, введіть код із { $codeLength } цифр
form-verify-totp-disabled-button-title-alphanumeric = Щоб продовжити, введіть код із { $codeLength } символів


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Ключ відновлення облікового запису { -brand-firefox }
get-data-trio-title-backup-verification-codes = Резервні коди автентифікації
get-data-trio-download-2 =
    .title = Завантажити
    .aria-label = Завантажити
get-data-trio-copy-2 =
    .title = Копіювати
    .aria-label = Копіювати
get-data-trio-print-2 =
    .title = Друк
    .aria-label = Друк


alert-icon-aria-label =
    .aria-label = Попередження
icon-attention-aria-label =
    .aria-label = Увага
icon-warning-aria-label =
    .aria-label = Попередження
authenticator-app-aria-label =
    .aria-label = Програма автентифікації
backup-codes-icon-aria-label-v2 =
    .aria-label = Резервні коди автентифікації увімкнено
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Резервні коди автентифікації вимкнено
backup-recovery-sms-icon-aria-label =
    .aria-label = Відновлення через SMS увімкнено
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Відновлення через SMS вимкнено
canadian-flag-icon-aria-label =
    .aria-label = Канадський прапор
checkmark-icon-aria-label =
    .aria-label = Позначити
checkmark-success-icon-aria-label =
    .aria-label = Успішно
checkmark-enabled-icon-aria-label =
    .aria-label = Увімкнено
close-icon-aria-label =
    .aria-label = Закрити повідомлення
code-icon-aria-label =
    .aria-label = Код
error-icon-aria-label =
    .aria-label = Помилка
info-icon-aria-label =
    .aria-label = Інформація
usa-flag-icon-aria-label =
    .aria-label = Прапор США


hearts-broken-image-aria-label =
    .aria-label = Комп'ютер і мобільний телефон, а також зображення розбитого серця на пляжі
hearts-verified-image-aria-label =
    .aria-label = Комп'ютер, мобільний телефон і планшет із зображенням серця, що пульсує
signin-recovery-code-image-description =
    .aria-label = Документ, який містить прихований текст.
signin-totp-code-image-label =
    .aria-label = Пристрій з прихованим 6-значним кодом.
confirm-signup-aria-label =
    .aria-label = Конверт із посиланням
security-shield-aria-label =
    .aria-label = Ілюстрація ключа відновлення облікового запису.
recovery-key-image-aria-label =
    .aria-label = Ілюстрація ключа відновлення облікового запису.
password-image-aria-label =
    .aria-label = Ілюстрація, що демонструє введення пароля.
lightbulb-aria-label =
    .aria-label = Ілюстрація для створення підказки про сховище.
email-code-image-aria-label =
    .aria-label = Ілюстрація із зображенням електронного листа з кодом.
recovery-phone-image-description =
    .aria-label = Мобільний пристрій, який отримує код у текстовому повідомленні.
recovery-phone-code-image-description =
    .aria-label = Код, отриманий на мобільному пристрої.
backup-recovery-phone-image-aria-label =
    .aria-label = Мобільний пристрій з можливістю надсилання SMS-повідомлень
backup-authentication-codes-image-aria-label =
    .aria-label = Екран пристрою з кодами


inline-recovery-key-setup-signed-in-firefox-2 = Ви ввійшли в { -brand-firefox }.
inline-recovery-key-setup-create-header = Захистіть свій обліковий запис
inline-recovery-key-setup-create-subheader = Маєте хвилинку, щоб захистити свої дані?
inline-recovery-key-setup-info = Створіть ключ відновлення облікового запису для можливості відновлення синхронізованих даних перегляду в разі втрати пароля.
inline-recovery-key-setup-start-button = Створити ключ відновлення облікового запису
inline-recovery-key-setup-later-button = Зробити це пізніше


input-password-hide = Сховати пароль
input-password-show = Показати пароль
input-password-hide-aria-2 = Ваш пароль зараз видно на екрані.
input-password-show-aria-2 = Ваш пароль зараз приховано.
input-password-sr-only-now-visible = Ваш пароль тепер видно на екрані.
input-password-sr-only-now-hidden = Ваш пароль тепер приховано.


input-phone-number-country-list-aria-label = Виберіть країну
input-phone-number-enter-number = Введіть номер телефону
input-phone-number-country-united-states = США
input-phone-number-country-canada = Канада
legal-back-button = Назад


reset-pwd-link-damaged-header = Посилання для відновлення пароля пошкоджене
signin-link-damaged-header = Посилання для підтвердження пошкоджено
report-signin-link-damaged-header = Посилання пошкоджене
reset-pwd-link-damaged-message = Посилання, за яким ви перейшли, має пропущені символи та, можливо, було пошкоджене вашим поштовим клієнтом. Уважно скопіюйте адресу та спробуйте знову.


link-expired-new-link-button = Отримати нове посилання


remember-password-text = Пам'ятаєте свій пароль?
remember-password-signin-link = Увійти


primary-email-confirmation-link-reused = Основна адреса електронної пошти вже підтверджена
signin-confirmation-link-reused = Вхід вже підтверджений
confirmation-link-reused-message = Це посилання для підтвердження вже було використане, і може використовуватись лише один раз.


error-bad-request = Неправильний запит


password-info-balloon-why-password-info = Пароль потрібен для доступу до збережених зашифрованих даних.
password-info-balloon-reset-risk-info = Скидання пароля може призвести до втрати даних, як-от паролів і закладок.


password-strength-inline-min-length = Принаймні 8 символів
password-strength-inline-not-email = Не ваша адреса електронної пошти
password-strength-inline-not-common = Не загальновживаний пароль
password-strength-inline-confirmed-must-match = Підтвердження відповідає новому паролю


account-recovery-notification-cta = Створити
account-recovery-notification-header-value = Не втратьте свої дані, якщо забудете пароль
account-recovery-notification-header-description = Створіть ключ відновлення облікового запису для можливості відновлення синхронізованих даних перегляду в разі втрати пароля.
recovery-phone-promo-cta = Додати телефон для відновлення
recovery-phone-promo-heading = Посильте захист свого облікового запису за допомогою телефона для відновлення
recovery-phone-promo-description = Тепер ви можете увійти за допомогою одноразового пароля з SMS, якщо не зможете скористатися програмою автентифікації.
recovery-phone-promo-info-link = Дізнайтеся більше про відновлення і ризик заміни SIM-карти
promo-banner-dismiss-button =
    .aria-label = Відхилити банер


ready-complete-set-up-instruction = Завершіть налаштування, ввівши новий пароль на інших пристроях { -brand-firefox }.
manage-your-account-button = Керувати обліковим записом
ready-use-service = { $serviceName } налаштовано для роботи
ready-use-service-default = Тепер ви готові налаштувати обліковий запис
ready-account-ready = Ваш обліковий запис готовий!
ready-continue = Продовжити
sign-in-complete-header = Вхід підтверджено
sign-up-complete-header = Обліковий запис підтверджено
primary-email-verified-header = Основну адресу електронної пошти підтверджено


flow-recovery-key-download-storage-ideas-heading-v2 = Місця для зберігання ключа:
flow-recovery-key-download-storage-ideas-folder-v2 = Тека на безпечному пристрої
flow-recovery-key-download-storage-ideas-cloud = Надійне хмарне сховище
flow-recovery-key-download-storage-ideas-print-v2 = Друкована фізична копія
flow-recovery-key-download-storage-ideas-pwd-manager = Менеджер паролів


flow-recovery-key-hint-header-v2 = Додайте підказку, яка допоможе знайти ваш ключ
flow-recovery-key-hint-message-v3 = Ця підказка має допомогти вам згадати місце збереження ключа відновлення облікового запису. Ми можемо показати її під час скидання пароля для відновлення даних.
flow-recovery-key-hint-input-v2 =
    .label = Введіть підказку (необов'язково)
flow-recovery-key-hint-cta-text = Завершити
flow-recovery-key-hint-char-limit-error = Підказка має містити менше ніж 255 символів.
flow-recovery-key-hint-unsafe-char-error = Підказка не може містити небезпечні символи unicode. Допускаються лише букви, цифри, знаки пунктуації та символи.


password-reset-warning-icon = Попередження
password-reset-chevron-expanded = Згорнути попередження
password-reset-chevron-collapsed = Розгорнути попередження
password-reset-data-may-not-be-recovered = Дані вашого браузера можуть не відновитися
password-reset-previously-signed-in-device-2 = У вас є пристрій, з якого ви входили раніше?
password-reset-data-may-be-saved-locally-2 = Дані вашого браузера можуть бути збережені на цьому пристрої. Відновіть свій пароль, а потім увійдіть там, щоб відновити та синхронізувати дані.
password-reset-no-old-device-2 = Маєте новий пристрій, але не маєте доступу до жодного з попередніх?
password-reset-encrypted-data-cannot-be-recovered-2 = Нам прикро, але ваші зашифровані дані браузера на серверах { -brand-firefox } неможливо відновити.
password-reset-warning-have-key = Маєте ключ відновлення облікового запису?
password-reset-warning-use-key-link = Використайте його зараз, щоб відновити пароль і зберегти свої дані


alert-bar-close-message = Закрити повідомлення


avatar-your-avatar =
    .alt = Ваш аватар
avatar-default-avatar =
    .alt = Типовий аватар




bento-menu-title-3 = Продукти { -brand-mozilla }
bento-menu-tagline = Інші продукти від { -brand-mozilla }, які захищають вашу приватність
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Браузер { -brand-firefox } для комп'ютера
bento-menu-firefox-mobile = Браузер { -brand-firefox } для мобільного
bento-menu-made-by-mozilla = Створено в { -brand-mozilla }


connect-another-fx-mobile = Отримайте { -brand-firefox } для мобільного чи планшета
connect-another-find-fx-mobile-2 = Знайдіть { -brand-firefox } у { -google-play } і { -app-store }.


cs-heading = Під'єднані служби
cs-description = Все, чим ви користуєтесь і де ви увійшли.
cs-cannot-refresh =
    Перепрошуємо, але виникла проблема при оновленні списку
    під'єднаних служб.
cs-cannot-disconnect = Клієнта не знайдено. Неможливо від'єднати
cs-logged-out-2 = Виконано вихід із { $service }
cs-refresh-button =
    .title = Оновити під'єднані служби
cs-missing-device-help = Втрачені елементи чи дублікати?
cs-disconnect-sync-heading = Від'єднатись від синхронізації


cs-disconnect-sync-content-3 =
    Дані перегляду залишаться на <span>{ $device }</span>, але
    надалі не синхронізуватимуться з вашим обліковим записом.
cs-disconnect-sync-reason-3 = Яка основна причина від'єднання <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Пристрій:
cs-disconnect-sync-opt-suspicious = Підозрілий
cs-disconnect-sync-opt-lost = Загублений або вкрадений
cs-disconnect-sync-opt-old = Старий або замінений
cs-disconnect-sync-opt-duplicate = Дублікат
cs-disconnect-sync-opt-not-say = Не вказувати


cs-disconnect-advice-confirm = Гаразд, зрозуміло
cs-disconnect-lost-advice-heading = Втрачений або викрадений пристрій від'єднано
cs-disconnect-lost-advice-content-3 = Оскільки ваш пристрій було втрачено або викрадено, щоб захистити свої дані, вам варто змінити пароль { -product-mozilla-account(case: "gen") } у його налаштуваннях. Вам також варто переглянути поради виробника пристрою щодо віддаленого стирання даних.
cs-disconnect-suspicious-advice-heading = Підозрілий пристрій від'єднано
cs-disconnect-suspicious-advice-content-2 = Якщо від'єднаний пристрій справді підозрілий, вам варто змінити пароль { -product-mozilla-account(case: "gen") } у його налаштуваннях, щоб зберегти свою інформацію в безпеці. Вам також варто змінити будь-які інші паролі, збережені вами у { -brand-firefox }, ввівши в адресному рядку фразу about:logins.
cs-sign-out-button = Вийти


dc-heading = Збір та використання даних
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Браузер { -brand-firefox }
dc-subheader-content-2 = Дозволити { -product-mozilla-accounts(case: "dat") } надсилати технічні дані та інформацію про взаємодію до { -brand-mozilla }.
dc-subheader-ff-content = Щоб переглянути або оновити технічні налаштування та дані про взаємодію браузера { -brand-firefox }, відкрийте налаштування { -brand-firefox } і перейдіть на панель Приватність і безпека.
dc-opt-out-success-2 = Відмова пройшла успішно. { -product-mozilla-accounts(capitalization: "upper") } не надсилатимуть технічні дані та інформацію про взаємодію до { -brand-mozilla }.
dc-opt-in-success-2 = Дякуємо! Надсилання цих даних допомагає нам вдосконалювати { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Перепрошуємо, виникла проблема зі зміною параметрів збору даних
dc-learn-more = Докладніше


drop-down-menu-title-2 = Меню { -product-mozilla-account(case: "gen") }
drop-down-menu-signed-in-as-v2 = Вхід виконано
drop-down-menu-sign-out = Вийти
drop-down-menu-sign-out-error-2 = Перепрошуємо, але під час виходу виникла проблема


flow-container-back = Назад


flow-recovery-key-confirm-pwd-heading-v2 = Повторно введіть пароль для безпеки
flow-recovery-key-confirm-pwd-input-label = Введіть свій пароль
flow-recovery-key-confirm-pwd-submit-button = Створити ключ відновлення облікового запису
flow-recovery-key-confirm-pwd-submit-button-change-key = Створити новий ключ відновлення облікового запису


flow-recovery-key-download-heading-v2 = Ключ відновлення облікового запису створено — завантажте та збережіть його зараз
flow-recovery-key-download-info-v2 = Цей ключ дає вам змогу відновити свої дані у разі втрати пароля. Завантажте його і збережіть в надійному місці. Ви не зможете повернутися до цієї сторінки знову.
flow-recovery-key-download-next-link-v2 = Продовжити без завантаження


flow-recovery-key-success-alert = Ключ відновлення облікового запису створено


flow-recovery-key-info-header = Створіть ключ відновлення облікового запису на випадок, якщо ви забудете свій пароль
flow-recovery-key-info-header-change-key = Змініть ключ відновлення облікового запису
flow-recovery-key-info-shield-bullet-point-v2 = Усі ваші дані перегляду, як-от паролі та закладки, шифруються. Це чудовий захист приватності, але ви втратите до них доступ, якщо забудете свій пароль.
flow-recovery-key-info-key-bullet-point-v2 = Саме тому дуже важливо створити ключ відновлення облікового запису, який можна використати для відновлення даних.
flow-recovery-key-info-cta-text-v3 = Розпочати
flow-recovery-key-info-cancel-link = Скасувати


flow-setup-2fa-qr-heading = Під'єднайтеся до програми автентифікації
flow-setup-2a-qr-instruction = <strong>Крок 1:</strong> Скануйте цей QR-код за допомогою будь-якої програми для автентифікації, як-от Duo або Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = QR-код для налаштування двоетапної перевірки. Скануйте його або виберіть "Не вдається сканувати QR-код?", щоб отримати секретний ключ.
flow-setup-2fa-cant-scan-qr-button = Не вдається сканувати QR-код?
flow-setup-2fa-manual-key-heading = Ввести код вручну
flow-setup-2fa-manual-key-instruction = <strong>Крок 1:</strong> Введіть цей код у програмі автентифікації.
flow-setup-2fa-scan-qr-instead-button = Сканувати QR-код натомість?
flow-setup-2fa-more-info-link = Докладніше про програми автентифікації
flow-setup-2fa-button = Продовжити
flow-setup-2fa-step-2-instruction = <strong>Крок 2:</strong> Введіть код з програми автентифікації.
flow-setup-2fa-input-label = Введіть код із 6 цифр


flow-setup-2fa-backup-choice-heading = Виберіть спосіб відновлення
flow-setup-2fa-backup-choice-description = Це дозволить виконати вхід у разі втрати доступу до мобільного пристрою чи програми автентифікації.
flow-setup-2fa-backup-choice-phone-title = Телефон для відновлення
flow-setup-2fa-backup-choice-phone-badge = Найпростіше
flow-setup-2fa-backup-choice-phone-info = Отримайте код відновлення у текстовому повідомленні. Наразі доступно в США та Канаді.
flow-setup-2fa-backup-choice-code-title = Резервні коди автентифікації
flow-setup-2fa-backup-choice-code-badge = Найнадійніше
flow-setup-2fa-backup-choice-code-info = Створіть і збережіть одноразові коди автентифікації.
flow-setup-2fa-backup-choice-learn-more-link = Дізнайтеся про відновлення і ризик заміни SIM-карти


flow-setup-2fa-backup-code-confirm-heading = Введіть резервний код автентифікації
flow-setup-2fa-backup-code-confirm-confirm-saved = Підтвердьте, що ви зберегли свої коди, ввівши один з них. Без цих кодів ви не зможете ввійти в систему, не маючи програми автентифікації.
flow-setup-2fa-backup-code-confirm-code-input = Введіть 10-значний код
flow-setup-2fa-backup-code-confirm-button-finish = Завершити


flow-setup-2fa-backup-code-dl-heading = Збережіть резервні коди автентифікації
flow-setup-2fa-backup-code-dl-save-these-codes = Зберігайте їх у надійному місці, яке ви пам'ятаєте. Якщо у вас немає доступу до програми автентифікації, вам потрібно буде ввести код, щоб увійти.
flow-setup-2fa-backup-code-dl-button-continue = Продовжити


flow-setup-phone-confirm-code-heading = Введіть код підтвердження
flow-setup-phone-confirm-code-instruction = Шестизначний код надіслано в текстовому повідомленні на номер <span>{ $phoneNumber }</span>. Термін дії цього коду – 5 хвилин.
flow-setup-phone-confirm-code-input-label = Введіть код із 6 цифр
flow-setup-phone-confirm-code-button = Підтвердити
flow-setup-phone-confirm-code-expired = Код застарів?
flow-setup-phone-confirm-code-resend-code-button = Надіслати код повторно
flow-setup-phone-confirm-code-resend-code-success = Код надіслано
flow-setup-phone-confirm-code-success-message-v2 = Додано телефон для відновлення
flow-change-phone-confirm-code-success-message = Телефон для відновлення змінився


flow-setup-phone-submit-number-heading = Підтвердьте свій номер телефону
flow-setup-phone-verify-number-instruction = Ви отримаєте текстове повідомлення від { -brand-mozilla } з кодом для підтвердження свого номера. Нікому не повідомляйте цей код.
flow-setup-phone-submit-number-info-message-v2 = Телефон для відновлення доступний лише в США та Канаді. Не рекомендується використовувати номери VoIP і маски номерів телефонів.
flow-setup-phone-submit-number-legal = Надаючи свій номер, ви погоджуєтеся на те, щоб ми зберігали його, щоб ми могли надсилати вам повідомлення лише для підтвердження облікового запису. Може стягуватися плата за повідомлення та дані.
flow-setup-phone-submit-number-button = Надіслати код


header-menu-open = Закрити меню
header-menu-closed = Меню навігації по сайту
header-back-to-top-link =
    .title = Вгору
header-title-2 = { -product-mozilla-account(capitalization: "upper") }
header-help = Допомога


la-heading = Пов’язані облікові записи
la-description = Ви авторизували доступ до таких облікових записів.
la-unlink-button = Відв'язати
la-unlink-account-button = Відв'язати
la-set-password-button = Створити пароль
la-unlink-heading = Відв’язати від стороннього облікового запису
la-unlink-content-3 = Ви впевнені, що хочете відв’язати свій обліковий запис? Відв’язування облікового запису не призведе до автоматичного виходу з Під'єднаних служб. Для цього вам потрібно вручну вийти з розділу Під'єднані служби.
la-unlink-content-4 = Перш ніж відв'язати свій обліковий запис, ви повинні створити пароль. Без пароля ви не зможете виконати вхід після відв'язування облікового запису.
nav-linked-accounts = { la-heading }


modal-close-title = Закрити
modal-cancel-button = Скасувати
modal-default-confirm-button = Підтвердити


mvs-verify-your-email-2 = Підтвердьте електронну адресу
mvs-enter-verification-code-2 = Введіть код підтвердження
mvs-enter-verification-code-desc-2 = Введіть код підтвердження, надісланий на <email>{ $email }</email> упродовж 5 хвилин.
msv-cancel-button = Скасувати
msv-submit-button-2 = Підтвердити


nav-settings = Налаштування
nav-profile = Профіль
nav-security = Безпека
nav-connected-services = Під'єднані служби
nav-data-collection = Збір та використання даних
nav-paid-subs = Передплати
nav-email-comm = Зв’язок електронною поштою


tfa-replace-code-error-3 = Виникла проблема під час заміни ваших резервних кодів
tfa-create-code-error = Виникла проблема під час створення ваших резервних кодів автентифікації
tfa-replace-code-success-alert-4 = Резервні коди автентифікації оновлено


avatar-page-title =
    .title = Зображення профілю
avatar-page-add-photo = Додати фото
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Зробити знімок
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Вилучити фото
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Зробити новий знімок
avatar-page-cancel-button = Скасувати
avatar-page-save-button = Зберегти
avatar-page-saving-button = Збереження…
avatar-page-zoom-out-button =
    .title = Зменшити
avatar-page-zoom-in-button =
    .title = Збільшити
avatar-page-rotate-button =
    .title = Обернути
avatar-page-camera-error = Не вдалося ініціалізувати камеру
avatar-page-new-avatar =
    .alt = нове зображення профілю
avatar-page-file-upload-error-3 = Виникла проблема з вивантаженням зображення профілю
avatar-page-delete-error-3 = Виникла проблема з видаленням зображення профілю
avatar-page-image-too-large-error-2 = Розмір файлу зображення завеликий для вивантаження


pw-change-header =
    .title = Змінити пароль
pw-8-chars = Принаймні 8 символів
pw-not-email = Не ваша електронна адреса
pw-change-must-match = Новий пароль збігається з підтвердженням
pw-commonly-used = Не часто використовуваний пароль
pw-tips = Убезпечте себе — не використовуйте паролі повторно. Перегляньте інші поради щодо <linkExternal>створення надійних паролів</linkExternal>.
pw-change-cancel-button = Скасувати
pw-change-save-button = Зберегти
pw-change-forgot-password-link = Забули пароль?
pw-change-current-password =
    .label = Введіть чинний пароль
pw-change-new-password =
    .label = Введіть новий пароль
pw-change-confirm-password =
    .label = Підтвердьте новий пароль
pw-change-success-alert-2 = Пароль оновлений


pw-create-header =
    .title = Створити пароль
pw-create-success-alert-2 = Пароль встановлений
pw-create-error-2 = Перепрошуємо, але під час встановлення пароля виникла проблема


delete-account-header =
    .title = Видалити обліковий запис
delete-account-step-1-2 = Крок 1 з 2
delete-account-step-2-2 = Крок 2 з 2
delete-account-confirm-title-4 = Можливо, ви під'єднали свій { -product-mozilla-account } до одного або більше зазначених продуктів або сервісів { -brand-mozilla }, які забезпечують ваш захист і продуктивність в інтернеті.
delete-account-product-mozilla-account = { -product-mozilla-account(capitalization: "upper") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Синхронізація даних { -brand-firefox }
delete-account-product-firefox-addons = Додатки { -brand-firefox }
delete-account-acknowledge = Будь ласка, підтвердьте, що при видаленні свого облікового запису:
delete-account-chk-box-2 =
    .label = Ви можете втратити збережену інформацію та функції продуктів { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Повторна активація з використанням цієї електронної пошти може не відновити вашу збережену інформацію
delete-account-chk-box-4 =
    .label = Будь-які розширення і теми, оприлюднені вами на addons.mozilla.org, будуть видалені
delete-account-continue-button = Продовжити
delete-account-password-input =
    .label = Введіть пароль
delete-account-cancel-button = Скасувати
delete-account-delete-button-2 = Видалити


display-name-page-title =
    .title = Ім’я для показу
display-name-input =
    .label = Введіть ім’я для показу
submit-display-name = Зберегти
cancel-display-name = Скасувати
display-name-update-error-2 = Виникла проблема під час оновлення вашого імені.
display-name-success-alert-2 = Показуване ім’я оновлено


recent-activity-title = Останні дії в обліковому записі
recent-activity-account-create-v2 = Обліковий запис створено
recent-activity-account-disable-v2 = Обліковий запис вимкнено
recent-activity-account-enable-v2 = Обліковий запис увімкнено
recent-activity-account-login-v2 = Ініційовано вхід в обліковий запис
recent-activity-account-reset-v2 = Ініційовано скидання пароля
recent-activity-emails-clearBounces-v2 = Відмови електронної пошти видалено
recent-activity-account-login-failure = Невдала спроба входу в обліковий запис
recent-activity-account-two-factor-added = Двоетапну перевірку ввімкнено
recent-activity-account-two-factor-requested = Запитано двоетапну перевірку
recent-activity-account-two-factor-failure = Невдала двоетапна перевірка
recent-activity-account-two-factor-success = Успішна двоетапна перевірка
recent-activity-account-two-factor-removed = Двоетапну перевірку вилучено
recent-activity-account-password-reset-requested = Запит скидання пароля облікового запису
recent-activity-account-password-reset-success = Успішне скидання пароля облікового запису
recent-activity-account-recovery-key-added = Ключ відновлення облікового запису увімкнено
recent-activity-account-recovery-key-verification-failure = Не вдалося перевірити ключ відновлення облікового запису
recent-activity-account-recovery-key-verification-success = Успішна перевірка ключа відновлення облікового запису
recent-activity-account-recovery-key-removed = Ключ відновлення облікового запису вилучено
recent-activity-account-password-added = Додано новий пароль
recent-activity-account-password-changed = Пароль змінено
recent-activity-account-secondary-email-added = Додаткову адресу електронної пошти додано
recent-activity-account-secondary-email-removed = Додаткову адресу електронної пошти вилучено
recent-activity-account-emails-swapped = Основну та додаткову адреси електронної пошти поміняно місцями
recent-activity-session-destroy = Ви вийшли з сеансу
recent-activity-account-recovery-phone-send-code = Код телефону для відновлення надіслано
recent-activity-account-recovery-phone-setup-complete = Налаштування телефону для відновлення завершено
recent-activity-account-recovery-phone-signin-complete = Вхід за допомогою номера телефону для відновлення завершено
recent-activity-account-recovery-phone-signin-failed = Не вдалося ввійти за допомогою номера телефону для відновлення
recent-activity-account-recovery-phone-removed = Телефон для відновлення вилучено
recent-activity-account-recovery-codes-replaced = Коди відновлення замінено
recent-activity-account-recovery-codes-created = Коди відновлення створено
recent-activity-account-recovery-codes-signin-complete = Вхід із кодами відновлення завершено
recent-activity-password-reset-otp-sent = Код підтвердження для відновлення пароля надіслано
recent-activity-password-reset-otp-verified = Код підтвердження для відновлення пароля перевірено
recent-activity-must-reset-password = Потрібне скидання пароля
recent-activity-unknown = Інші дії в обліковому записі


recovery-key-create-page-title = Ключ відновлення облікового запису
recovery-key-create-back-button-title = Назад до налаштувань


recovery-phone-remove-header = Вилучити номер телефону для відновлення
settings-recovery-phone-remove-info = Ця дія призведе до вилучення вашого телефону для відновлення <strong>{ $formattedFullPhoneNumber }</strong>.
settings-recovery-phone-remove-recommend = Ми радимо використовувати цей спосіб, оскільки це простіше, ніж зберігати резервні коди автентифікації.
settings-recovery-phone-remove-recovery-methods = Якщо ви видалите його, переконайтеся, що у вас все ще є збережені резервні коди автентифікації. <linkExternal>Порівняння способів відновлення</linkExternal>
settings-recovery-phone-remove-button = Вилучити номер телефону
settings-recovery-phone-remove-cancel = Скасувати
settings-recovery-phone-remove-success = Телефон для відновлення вилучено


page-setup-recovery-phone-heading = Додати телефон для відновлення
page-change-recovery-phone = Змінити телефон для відновлення
page-setup-recovery-phone-back-button-title = Повернутись до налаштувань
page-setup-recovery-phone-step2-back-button-title = Змінити номер телефону


add-secondary-email-step-1 = Крок 1 з 2
add-secondary-email-error-2 = Виникла проблема під час додавання цієї адреси.
add-secondary-email-page-title =
    .title = Додаткова адреса електронної пошти
add-secondary-email-enter-address =
    .label = Введіть адресу е-пошти
add-secondary-email-cancel-button = Скасувати
add-secondary-email-save-button = Зберегти
add-secondary-email-mask = Маски електронної пошти не можна використовувати як додаткову електронну адресу


add-secondary-email-step-2 = Крок 2 з 2
verify-secondary-email-page-title =
    .title = Додаткова адреса електронної пошти
verify-secondary-email-verification-code-2 =
    .label = Введіть код підтвердження
verify-secondary-email-cancel-button = Скасувати
verify-secondary-email-verify-button-2 = Підтвердити
verify-secondary-email-please-enter-code-2 = Введіть код підтвердження, надісланий на <strong>{ $email }</strong> упродовж 5 хвилин.
verify-secondary-email-success-alert-2 = { $email } успішно додано


delete-account-link = Видалити обліковий запис
inactive-update-status-success-alert = Ви успішно ввійшли в систему. Ваш { -product-mozilla-account } і дані залишаться активними.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-cta = Скористайтеся безплатним скануванням


profile-heading = Профіль
profile-picture =
    .header = Зображення
profile-display-name =
    .header = Ім’я для показу
profile-primary-email =
    .header = Основна адреса е-пошти


progress-bar-aria-label-v2 = Крок { $currentStep } з { $numberOfSteps }.


security-heading = Безпека
security-password =
    .header = Пароль
security-password-created-date = Створено { $date }
security-not-set = Не налаштовано
security-action-create = Створити
security-set-password = Встановіть пароль для синхронізації та використання певних функцій безпеки облікового запису.
security-recent-activity-link = Переглянути останні дії в обліковому записі
signout-sync-header = Сеанс завершився
signout-sync-session-expired = Перепрошуємо, щось пішло не так. Вийдіть через меню браузера та повторіть спробу.


tfa-row-backup-codes-title = Резервні коди автентифікації
tfa-row-backup-codes-not-available = Немає доступних кодів
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Залишився { $numCodesAvailable } код
        [few] Залишилося { $numCodesAvailable } коди
       *[many] Залишилося { $numCodesAvailable } кодів
    }
tfa-row-backup-codes-get-new-cta-v2 = Створити нові коди
tfa-row-backup-codes-add-cta = Додати
tfa-row-backup-codes-description-2 = Це найбезпечніший спосіб відновлення, якщо ви не можете використати свій мобільний пристрій або програму автентифікації.
tfa-row-backup-phone-title-v2 = Телефон для відновлення
tfa-row-backup-phone-not-available-v2 = Номер телефону не додано
tfa-row-backup-phone-change-cta = Змінити
tfa-row-backup-phone-add-cta = Додати
tfa-row-backup-phone-delete-button = Вилучити
tfa-row-backup-phone-delete-title-v2 = Вилучити телефон для відновлення
tfa-row-backup-phone-delete-restriction-v2 = Якщо ви хочете вилучити телефон для відновлення, спочатку додайте резервні коди автентифікації або вимкніть двоетапну перевірку, щоб не втратити доступ до облікового запису.
tfa-row-backup-phone-description-v2 = Це найпростіший спосіб відновлення, якщо ви не можете використовувати програму автентифікації.
tfa-row-backup-phone-sim-swap-risk-link = Дізнайтеся про ризик підміни SIM-карти


switch-turn-off = Вимкнути
switch-turn-on = Увімкнути
switch-submitting = Надсилання…
switch-is-on = увімкнено
switch-is-off = вимкнено


row-defaults-action-add = Додати
row-defaults-action-change = Змінити
row-defaults-action-disable = Вимкнути
row-defaults-status = Немає


rk-header-1 = Ключ відновлення облікового запису
rk-enabled = Увімкнено
rk-not-set = Не налаштовано
rk-action-create = Створити
rk-action-change-button = Змінити
rk-action-remove = Вилучити
rk-key-removed-2 = Ключ відновлення облікового запису вилучено
rk-cannot-remove-key = Не вдається видалити ключ відновлення вашого облікового запису.
rk-refresh-key-1 = Оновити ключ відновлення облікового запису
rk-content-explain = Відновіть інформацію, коли забудете пароль.
rk-cannot-verify-session-4 = Перепрошуємо, але під час підтвердження сеансу виникла проблема
rk-remove-modal-heading-1 = Вилучити ключ відновлення облікового запису?
rk-remove-modal-content-1 =
    У випадку скидання пароля, ви не зможете використати свій ключ відновлення
    облікового запису для доступу до збережених даних. Цю дію неможливо скасувати.
rk-remove-error-2 = Не вдалося видалити ключ відновлення облікового запису
unit-row-recovery-key-delete-icon-button-title = Видалити ключ відновлення облікового запису


se-heading = Додаткова адреса е-пошти
    .header = Додаткова адреса е-пошти
se-cannot-refresh-email = Перепрошуємо, але при оновленні цієї адреси виникла проблема.
se-cannot-resend-code-3 = Перепрошуємо, але під час повторного надсилання коду підтвердження сталася проблема
se-set-primary-successful-2 = { $email } тепер ваша основна електронна адреса
se-set-primary-error-2 = Перепрошуємо, але під час зміни основної адреси е-пошти виникла проблема
se-delete-email-successful-2 = { $email } успішно видалено
se-delete-email-error-2 = Перепрошуємо, але під час видалення цієї адреси виникла проблема
se-verify-session-3 = Щоб виконати цю дію, вам потрібно підтвердити поточний сеанс
se-verify-session-error-3 = Перепрошуємо, але під час підтвердження сеансу виникла проблема
se-remove-email =
    .title = Вилучити е-пошту
se-refresh-email =
    .title = Оновити е-пошту
se-unverified-2 = не підтверджено
se-resend-code-2 =
    Необхідне підтвердження. Повторно <button>надіслати код підтвердження</button>
    якщо його немає у вашій поштовій скриньці чи спамі.
se-make-primary = Зробити основною
se-default-content = Доступ до облікового запису, якщо ви не можете увійти за допомогою основної е-пошти.
se-content-note-1 =
    Примітка: додаткова адреса е-пошти не дає змогу відновити вашу інформацію.
    Для цього вам знадобиться <a>ключ відновлення облікового запису</a>.
se-secondary-email-none = Немає


tfa-row-header = Двоетапна перевірка
tfa-row-enabled = Увімкнено
tfa-row-disabled-status = Вимкнено
tfa-row-action-add = Додати
tfa-row-action-disable = Вимкнути
tfa-row-button-refresh =
    .title = Оновити двоетапну перевірку
tfa-row-cannot-refresh =
    Перепрошуємо, але при оновленні двоетапної перевірки
    виникла проблема.
tfa-row-enabled-description = Ваш обліковий запис захищено двоетапною перевіркою. Під час входу в { -product-mozilla-account } вам потрібно буде ввести одноразовий код із програми автентифікації.
tfa-row-enabled-info-link = Як це захищає ваш обліковий запис
tfa-row-disabled-description-v2 = Посильте захист свого облікового запису, використовуючи сторонню програму автентифікації як другий крок для входу.
tfa-row-cannot-verify-session-4 = Перепрошуємо, але під час підтвердження сеансу виникла проблема
tfa-row-disable-modal-heading = Вимкнути двоетапну перевірку?
tfa-row-disable-modal-confirm = Вимкнути
tfa-row-disable-modal-explain-1 =
    Ви не зможете скасувати цю дію. Ви також маєте
    можливість <linkExternal>замінити резервні коди автентифікації</linkExternal>.
tfa-row-disabled-2 = Двоетапну перевірку вимкнено
tfa-row-cannot-disable-2 = Неможливо вимкнути двоетапну перевірку


terms-privacy-agreement-default-2 = Продовжуючи, ви погоджуєтеся з <mozillaAccountsTos>Умовами надання послуг</mozillaAccountsTos> і <mozillaAccountsPrivacy>Положенням про приватність</mozillaAccountsPrivacy>.


third-party-auth-options-or = Або
continue-with-google-button = Продовжити з { -brand-google }
continue-with-apple-button = Продовжити з { -brand-apple }


auth-error-102 = Невідомий обліковий запис
auth-error-103 = Неправильний пароль
auth-error-105-2 = Недійсний код підтвердження!
auth-error-110 = Недійсний код
auth-error-114-generic = Ви зробили забагато спроб. Повторіть знову пізніше.
auth-error-114 = Ви зробили надто багато спроб. Повторіть спробу через { $retryAfter }.
auth-error-125 = Запит заблоковано з міркувань безпеки
auth-error-129-2 = Ви ввели недійсний номер телефону. Перевірте його та спробуйте ще раз.
auth-error-138-2 = Непідтверджений сеанс
auth-error-139 = Додаткова адреса електронної пошти повинна відрізнятися від адреси вашого облікового запису
auth-error-155 = TOTP-код не знайдено
auth-error-156 = Резервний код автентифікації не знайдено
auth-error-159 = Недійсний ключ відновлення облікового запису
auth-error-183-2 = Недійсний або протермінований код підтвердження
auth-error-202 = Функцію не ввімкнено
auth-error-203 = Система недоступна, спробуйте знову пізніше
auth-error-206 = Неможливо створити пароль, пароль уже встановлено
auth-error-214 = Номер телефону для відновлення вже додано
auth-error-215 = Немає номера телефону для відновлення
auth-error-216 = Досягнуто ліміту текстових повідомлень
auth-error-218 = Неможливо вилучити телефон для відновлення, оскільки відсутні резервні коди автентифікації.
auth-error-219 = Цей номер телефону зареєстровано в багатьох інших облікових записах. Використайте інший номер.
auth-error-999 = Несподівана помилка
auth-error-1001 = Спробу входу скасовано
auth-error-1002 = Сеанс завершено. Увійдіть для продовження.
auth-error-1003 = Локальне сховище або файли cookie все ще вимкнено
auth-error-1008 = Ваш новий пароль повинен бути іншим
auth-error-1010 = Введіть правильний пароль
auth-error-1011 = Потрібна дійсна адреса електронної пошти
auth-error-1018 = Ваш електронний лист із підтвердженням не доставлено. Неправильно введено адресу електронної пошти?
auth-error-1020 = Неправильно введено адресу електронної пошти? firefox.com не є службою електронної пошти.
auth-error-1031 = Ви повинні вказати свій вік, щоб виконати вхід
auth-error-1032 = Для реєстрації ви повинні вказати правильний вік
auth-error-1054 = Недійсний код двоетапної перевірки
auth-error-1056 = Недійсний резервний код автентифікації
auth-error-1062 = Недійсне переспрямування
auth-error-1064 = Неправильно введено адресу електронної пошти? { $domain } не є службою електронної пошти.
auth-error-1066 = Маски електронної пошти не можна використовувати для створення облікового запису.
auth-error-1067 = Неправильно введено адресу електронної пошти?
recovery-phone-number-ending-digits = Номер, що закінчується на { $lastFourPhoneNumber }
oauth-error-1000 = Щось пішло не так. Закрийте цю вкладку і спробуйте знову.


connect-another-device-signed-in-header = Ви ввійшли до { -brand-firefox }
connect-another-device-email-confirmed-banner = Електронну адресу підтверджено
connect-another-device-signin-confirmed-banner = Вхід підтверджено
connect-another-device-signin-to-complete-message = Увійдіть у { -brand-firefox }, щоб завершити налаштування
connect-another-device-signin-link = Увійти
connect-another-device-still-adding-devices-message = Додаєте інші пристрої? Увійдіть у { -brand-firefox } на іншому пристрої, щоб завершити налаштування
connect-another-device-signin-another-device-to-complete-message = Увійдіть у { -brand-firefox } на іншому пристрої, щоб завершити налаштування
connect-another-device-get-data-on-another-device-message = Хочете отримати свої вкладки, закладки та паролі на іншому пристрої?
connect-another-device-cad-link = Під'єднати інший пристрій
connect-another-device-not-now-link = Не зараз
connect-another-device-android-complete-setup-message = Увійдіть у { -brand-firefox } для Android, щоб завершити налаштування
connect-another-device-ios-complete-setup-message = Увійдіть у { -brand-firefox } для iOS, щоб завершити налаштування


cookies-disabled-header = Доступ до локального сховища та збереження файлів cookie обов'язковий
cookies-disabled-enable-prompt-2 = Щоб отримати доступ до { -product-mozilla-account(case: "gen") }, увімкніть файли cookie та локальне сховище у своєму браузері. Це дозволить пам'ятати вас між сеансами.
cookies-disabled-button-try-again = Спробувати знову
cookies-disabled-learn-more = Докладніше


index-header = Введіть свою адресу електронної пошти
index-sync-header = Продовжити в обліковому записі { -product-mozilla-account }
index-sync-subheader = Синхронізуйте свої паролі, вкладки та закладки всюди, де ви використовуєте { -brand-firefox }.
index-relay-header = Створити маску електронної пошти
index-relay-subheader = Вкажіть адресу електронної пошти, на яку ви хочете пересилати електронні листи з вашої замаскованої адреси е-пошти.
index-subheader-with-servicename = Продовжити в { $serviceName }
index-subheader-default = Перейти до налаштувань облікового запису
index-cta = Зареєструватися або увійти
index-account-info = { -product-mozilla-account } також відкриває доступ до інших продуктів { -brand-mozilla }, які захищають вашу приватність.
index-email-input =
    .label = Введіть свою адресу електронної пошти
index-account-delete-success = Обліковий запис успішно видалено
index-email-bounced = Ваш електронний лист із підтвердженням не доставлено. Неправильно введено адресу електронної пошти?


inline-recovery-key-setup-create-error = На жаль, не вдалося створити ваш ключ відновлення облікового запису. Будь ласка, спробуйте знову пізніше.
inline-recovery-key-setup-recovery-created = Ключ відновлення облікового запису створено
inline-recovery-key-setup-download-header = Захистіть свій обліковий запис
inline-recovery-key-setup-download-subheader = Завантажити і зберегти
inline-recovery-key-setup-download-info = Збережіть цей ключ у надійному місці. Ви не зможете повернутися до цієї сторінки пізніше.
inline-recovery-key-setup-hint-header = Рекомендація щодо безпеки


inline-totp-setup-cancel-setup-button = Скасувати налаштування
inline-totp-setup-continue-button = Продовжити
inline-totp-setup-add-security-link = Додайте до свого облікового запису ще один рівень захисту, вимагаючи коди автентифікації з використанням <authenticationAppsLink>цих застосунків</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Увімкніть двоетапну перевірку, <span>щоб перейти до налаштувань облікового запису</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Увімкніть двоетапну перевірку, <span>щоб продовжити на { $serviceName }</span>
inline-totp-setup-ready-button = Готово
inline-totp-setup-show-qr-custom-service-header-2 = Скануйте код автентифікації, <span>щоб продовжити в { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Введіть код вручну, <span>щоб продовжити в { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Скануйте код автентифікації, <span>щоб перейти до налаштувань облікового запису</span>
inline-totp-setup-no-qr-default-service-header-2 = Введіть код вручну, <span>щоб перейти до налаштувань облікового запису</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Введіть цей секретний ключ у своєму застосунку для автентифікації. <toggleToQRButton>Сканувати натомість QR-код?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Скануйте QR-код у своєму застосунку для автентифікації, а потім введіть запропонований код. <toggleToManualModeButton>Не можете сканувати код?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = Після завершення налаштування він почне генерувати коди автентифікації для введення.
inline-totp-setup-security-code-placeholder = Код автентифікації
inline-totp-setup-code-required-error = Потрібно ввести код автентифікації
tfa-qr-code-alt = Скористайтеся кодом { $code } для налаштування двоетапної перевірки в підтримуваних програмах.


legal-header = Правові положення
legal-terms-of-service-link = Умови надання послуг
legal-privacy-link = Положення про приватність


legal-privacy-heading = Положення про приватність


legal-terms-heading = Умови надання послуг


pair-auth-allow-heading-text = Ви щойно ввійшли до { -product-firefox }?
pair-auth-allow-confirm-button = Так, схвалити пристрій
pair-auth-allow-refuse-device-link = Якщо це були не ви, <link>змініть пароль</link>


pair-auth-complete-heading = Пристрій під'єднано
pair-auth-complete-now-syncing-device-text = Зараз синхронізація виконується з: { $deviceFamily } на { $deviceOS }
pair-auth-complete-sync-benefits-text = Тепер ви можете отримати доступ до відкритих вкладок, паролів і закладок на всіх своїх пристроях.
pair-auth-complete-see-tabs-button = Переглянути вкладки з синхронізованих пристроїв
pair-auth-complete-manage-devices-link = Керувати пристроями


auth-totp-heading-w-default-service = Введіть код автентифікації, <span>щоб перейти до налаштувань облікового запису</span>
auth-totp-heading-w-custom-service = Введіть код автентифікації, <span>щоб продовжити в { $serviceName }</span>
auth-totp-instruction = Відкрийте вашу програму автентифікації та введіть код, який вона пропонує.
auth-totp-input-label = Введіть код із 6 цифр
auth-totp-confirm-button = Підтвердити
auth-totp-code-required-error = Потрібно ввести код автентифікації


pair-wait-for-supp-heading-text = Відтепер підтвердження з <span>вашого іншого пристрою</span> обов'язкове


pair-failure-header = Не вдалося створити пару
pair-failure-message = Процес налаштування було перервано.


pair-sync-header = Синхронізуйте { -brand-firefox } на телефоні чи планшеті
pair-cad-header = Під'єднати { -brand-firefox } на іншому пристрої
pair-already-have-firefox-paragraph = Уже маєте { -brand-firefox } на телефоні чи планшеті?
pair-sync-your-device-button = Синхронізуйте свій пристрій
pair-or-download-subheader = Або завантажте
pair-scan-to-download-message = Скануйте, щоб завантажити { -brand-firefox } для мобільних пристроїв, або надішліть собі <linkExternal>посилання для завантаження</linkExternal>.
pair-not-now-button = Не зараз
pair-take-your-data-message = Беріть із собою вкладки, закладки та паролі, де б ви не користувалися { -brand-firefox }.
pair-get-started-button = Розпочати
pair-qr-code-aria-label = QR-код


pair-success-header-2 = Пристрій під'єднано
pair-success-message-2 = Пару успішно створено.


pair-supp-allow-heading-text = Підтвердьте створення пари <span>для { $email }</span>
pair-supp-allow-confirm-button = Підтвердити пару
pair-supp-allow-cancel-link = Скасувати


pair-wait-for-auth-heading-text = Відтепер підтвердження з <span>вашого іншого пристрою</span> обов'язкове


pair-unsupported-header = Створення пари за допомогою програми
pair-unsupported-message = Ви використали системну камеру? Ви повинні створити пару через програму { -brand-firefox }.


third-party-auth-callback-message = Зачекайте, вас буде перенаправлено до авторизованої програми.


account-recovery-confirm-key-heading = Введіть ключ відновлення облікового запису
account-recovery-confirm-key-instruction = Цей ключ відновлює ваші зашифровані дані браузера, як-от паролі та закладки, що зберігаються на серверах { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Введіть свій 32-значний ключ відновлення облікового запису
account-recovery-confirm-key-hint = Ваша підказка для сховища:
account-recovery-confirm-key-button-2 = Продовжити
account-recovery-lost-recovery-key-link-2 = Не можете знайти ключ відновлення облікового запису?


complete-reset-pw-header-v2 = Створити новий пароль
complete-reset-password-success-alert = Пароль встановлено
complete-reset-password-error-alert = Перепрошуємо, але під час встановлення пароля виникла проблема
complete-reset-pw-recovery-key-link = Використати ключ відновлення облікового запису
reset-password-complete-banner-heading = Ваш пароль було скинуто.
reset-password-complete-banner-message = Не забудьте згенерувати новий ключ відновлення облікового запису в налаштуваннях { -product-mozilla-account }, щоб уникнути проблем з входом у майбутньому.
complete-reset-password-desktop-relay = { -brand-firefox } спробує повернути вас назад, щоб ви використали маску е-пошти після входу.


confirm-backup-code-reset-password-input-label = Введіть 10-значний код
confirm-backup-code-reset-password-confirm-button = Підтвердити
confirm-backup-code-reset-password-subheader = Введіть резервний код автентифікації
confirm-backup-code-reset-password-instruction = Введіть один із одноразових кодів, які ви зберегли під час налаштування двоетапної перевірки.
confirm-backup-code-reset-password-locked-out-link = Не можете отримати доступ?


confirm-reset-password-with-code-heading = Перевірте свою електронну пошту
confirm-reset-password-with-code-instruction = Ми надіслали код підтвердження на <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Введіть 8-значний код протягом 10 хвилин
confirm-reset-password-otp-submit-button = Продовжити
confirm-reset-password-otp-resend-code-button = Надіслати код повторно
confirm-reset-password-otp-different-account-link = Використати інший обліковий запис


confirm-totp-reset-password-header = Відновити свій пароль
confirm-totp-reset-password-subheader-v2 = Введіть код двоетапної перевірки
confirm-totp-reset-password-instruction-v2 = Перевірте <strong>програму автентифікації</strong>, щоб скинути пароль.
confirm-totp-reset-password-trouble-code = Проблеми з введенням коду?
confirm-totp-reset-password-confirm-button = Підтвердити
confirm-totp-reset-password-input-label-v2 = Введіть код із 6 цифр
confirm-totp-reset-password-use-different-account = Використати інший обліковий запис


password-reset-flow-heading = Відновити свій пароль
password-reset-body-2 = Ми запитаємо у вас про інформацію, відому лише вам, щоб захистити ваш обліковий запис.
password-reset-email-input =
    .label = Адреса електронної пошти
password-reset-submit-button-2 = Продовжити


reset-password-complete-header = Ваш пароль було відновлено
reset-password-confirmed-cta = Продовжити в { $serviceName }




password-reset-recovery-method-header = Скинути пароль
password-reset-recovery-method-subheader = Виберіть спосіб відновлення
password-reset-recovery-method-details = Переконаймося, що це ви використовуєте свої способи відновлення.
password-reset-recovery-method-phone = Телефон для відновлення
password-reset-recovery-method-code = Резервні коди автентифікації
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Залишився { $numBackupCodes } код
        [few] Залишилося { $numBackupCodes } коди
       *[many] Залишилося { $numBackupCodes } кодів
    }
password-reset-recovery-method-send-code-error-heading = Під час надсилання коду на ваш телефон для відновлення виникла проблема
password-reset-recovery-method-send-code-error-description = Повторіть спробу пізніше або скористайтеся резервними кодами автентифікації.


reset-password-recovery-phone-flow-heading = Скинути пароль
reset-password-recovery-phone-heading = Введіть код відновлення
reset-password-recovery-phone-instruction-v3 = На номер телефону, що закінчується на <span>{ $lastFourPhoneDigits }</span>, надіслано текстове повідомлення з кодом із 6 цифр. Термін дії цього коду завершиться через 5 хвилин. Не повідомляйте цей код нікому.
reset-password-recovery-phone-input-label = Введіть код із 6 цифр
reset-password-recovery-phone-code-submit-button = Підтвердити
reset-password-recovery-phone-resend-code-button = Надіслати код повторно
reset-password-recovery-phone-resend-success = Код надіслано
reset-password-recovery-phone-locked-out-link = Не можете отримати доступ?
reset-password-recovery-phone-send-code-error-heading = Виникла проблема з надсиланням коду
reset-password-recovery-phone-code-verification-error-heading = Під час перевірки коду виникла проблема
reset-password-recovery-phone-general-error-description = Повторіть спробу пізніше.
reset-password-recovery-phone-invalid-code-error-description = Код недійсний або протермінований.
reset-password-recovery-phone-invalid-code-error-link = Використати резервні коди автентифікації?
reset-password-with-recovery-key-verified-page-title = Пароль успішно відновлено
reset-password-complete-new-password-saved = Новий пароль збережено!
reset-password-complete-recovery-key-created = Створено новий ключ відновлення облікового запису. Завантажте та збережіть його зараз.
reset-password-complete-recovery-key-download-info =
    Цей ключ необхідний для
    відновлення даних, якщо ви забули пароль. <b>Завантажте його зараз та надійно зберігайте,
    оскільки ви не зможете отримати доступ до цієї сторінки з ключем пізніше.</b>


error-label = Помилка:
validating-signin = Перевірка входу…
complete-signin-error-header = Помилка підтвердження
signin-link-expired-header = Термін дії посилання для підтвердження завершився
signin-link-expired-message-2 = Термін дії посилання, яке ви натиснули, закінчився або воно вже було використано.


signin-password-needed-header-2 = Введіть пароль <span>для свого { -product-mozilla-account(case: "gen") }</span>
signin-subheader-without-logo-with-servicename = Продовжити в { $serviceName }
signin-subheader-without-logo-default = Перейти до налаштувань облікового запису
signin-button = Увійти
signin-header = Увійти
signin-use-a-different-account-link = Використати інший обліковий запис
signin-forgot-password-link = Забули пароль?
signin-password-button-label = Пароль
signin-desktop-relay = { -brand-firefox } спробує повернути вас назад, щоб ви використали маску е-пошти після входу.


report-signin-link-damaged-body = Посилання за яким ви перейшли має втрачені символи та, можливо, було пошкоджене вашим поштовим клієнтом. Обережно скопіюйте адресу та спробуйте знову.
report-signin-header = Повідомити про недозволений вхід?
report-signin-body = Ви отримали електронний лист про спробу отримання доступу до вашого облікового запису. Хочете повідомити про підозрілу активність?
report-signin-submit-button = Повідомити
report-signin-support-link = Чому це трапляється?
report-signin-error = Під час надсилання звіту виникла проблема.
signin-bounced-header = Вибачте. Ми заблокували ваш обліковий запис.
signin-bounced-message = Електронний лист із підтвердженням, який ми надіслали на адресу { $email }, повернувся, і ми заблокували ваш обліковий запис, щоб захистити ваші дані { -brand-firefox }.
signin-bounced-help = Якщо це дійсна адреса електронної пошти, <linkExternal>повідомте нас</linkExternal> і ми допоможемо розблокувати ваш обліковий запис.
signin-bounced-create-new-account = Ця адреса електронної пошти вам більше не належить? Створіть новий обліковий запис
back = Назад


signin-push-code-heading-w-default-service = Підтвердьте цей вхід, <span>щоб продовжити налаштування облікового запису</span>
signin-push-code-heading-w-custom-service = Підтвердьте цей вхід, <span>щоб перейти до { $serviceName }</span>
signin-push-code-instruction = Перевірте свої інші пристрої та підтвердьте цей вхід у браузері { -brand-firefox }.
signin-push-code-did-not-recieve = Не отримали сповіщення?
signin-push-code-send-email-link = Код з електронного листа


signin-push-code-confirm-instruction = Підтвердьте свій вхід
signin-push-code-confirm-description = Ми виявили спробу входу із зазначеного пристрою. Будь ласка, підтвердьте, якщо це були ви
signin-push-code-confirm-verifying = Перевірка
signin-push-code-confirm-login = Підтвердити вхід
signin-push-code-confirm-wasnt-me = Це не я, змінити пароль.
signin-push-code-confirm-login-approved = Ваш вхід підтверджено. Можете закрити це вікно.
signin-push-code-confirm-link-error = Посилання пошкоджено. Повторіть спробу.


signin-recovery-method-header = Увійти
signin-recovery-method-subheader = Виберіть спосіб відновлення
signin-recovery-method-details = Переконаймося, що це ви використовуєте свої способи відновлення.
signin-recovery-method-phone = Телефон для відновлення
signin-recovery-method-code-v2 = Резервні коди автентифікації
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Залишився { $numBackupCodes } код
        [few] Залишилося { $numBackupCodes } коди
       *[many] Залишилося { $numBackupCodes } кодів
    }
signin-recovery-method-send-code-error-heading = Під час надсилання коду на ваш телефон для відновлення виникла проблема
signin-recovery-method-send-code-error-description = Повторіть спробу пізніше або скористайтеся резервними кодами автентифікації.


signin-recovery-code-heading = Увійти
signin-recovery-code-sub-heading = Введіть резервний код автентифікації
signin-recovery-code-instruction-v3 = Введіть один із одноразових кодів, які ви зберегли під час налаштування двоетапної перевірки.
signin-recovery-code-input-label-v2 = Введіть 10-значний код
signin-recovery-code-confirm-button = Підтвердити
signin-recovery-code-phone-link = Скористатися телефоном для відновлення
signin-recovery-code-support-link = Не можете отримати доступ?
signin-recovery-code-required-error = Потрібен резервний код автентифікації
signin-recovery-code-use-phone-failure = Під час надсилання коду на ваш телефон для відновлення виникла проблема
signin-recovery-code-use-phone-failure-description = Повторіть спробу пізніше.


signin-recovery-phone-flow-heading = Увійти
signin-recovery-phone-heading = Введіть код відновлення
signin-recovery-phone-instruction-v3 = На номер телефону, що закінчується на <span>{ $lastFourPhoneDigits }</span>, надіслано текстове повідомлення з кодом із 6 цифр. Термін дії цього коду завершиться через 5 хвилин. Не повідомляйте цей код нікому.
signin-recovery-phone-input-label = Введіть код із 6 цифр
signin-recovery-phone-code-submit-button = Підтвердити
signin-recovery-phone-resend-code-button = Надіслати код повторно
signin-recovery-phone-resend-success = Код надіслано
signin-recovery-phone-locked-out-link = Не можете отримати доступ?
signin-recovery-phone-send-code-error-heading = Виникла проблема з надсиланням коду
signin-recovery-phone-code-verification-error-heading = Під час перевірки коду виникла проблема
signin-recovery-phone-general-error-description = Повторіть спробу пізніше.
signin-recovery-phone-invalid-code-error-description = Код недійсний або протермінований.
signin-recovery-phone-invalid-code-error-link = Використати резервні коди автентифікації?
signin-recovery-phone-success-message = Ви успішно ввійшли в обліковий запис. Якщо ви знову скористаєтеся телефоном для відновлення, можуть застосовуватися обмеження.


signin-reported-header = Дякуємо за вашу уважність
signin-reported-message = Наша команда була сповіщена. Такі звіти допомагають нам захиститися від зловмисників.


signin-token-code-heading-2 = Введіть код підтвердження<span> для свого { -product-mozilla-account(case: "gen") }</span>
signin-token-code-instruction-v2 = Протягом 5 хвилин уведіть код, надісланий на <email>{ $email }</email>.
signin-token-code-input-label-v2 = Введіть код із 6 цифр
signin-token-code-confirm-button = Підтвердити
signin-token-code-code-expired = Код застарів?
signin-token-code-resend-code-link = Надіслати новий код електронною поштою.
signin-token-code-required-error = Потрібно ввести код підтвердження
signin-token-code-resend-error = Щось пішло не так. Не вдалося надіслати новий код.
signin-token-code-instruction-desktop-relay = { -brand-firefox } спробує повернути вас назад, щоб ви використали маску е-пошти після входу.


signin-totp-code-header = Увійти
signin-totp-code-subheader-v2 = Введіть код двоетапної перевірки
signin-totp-code-instruction-v4 = Підтвердьте вхід у <strong>програмі автентифікації</strong>.
signin-totp-code-input-label-v4 = Введіть код із 6 цифр
signin-totp-code-confirm-button = Підтвердити
signin-totp-code-other-account-link = Використати інший обліковий запис
signin-totp-code-recovery-code-link = Проблеми з введенням коду?
signin-totp-code-required-error = Потрібно ввести код автентифікації
signin-totp-code-desktop-relay = { -brand-firefox } спробує повернути вас назад, щоб ви використали маску е-пошти після входу.


signin-unblock-header = Дозволити цей вхід
signin-unblock-body = Знайдіть лист з кодом авторизації, надісланий на { $email }.
signin-unblock-code-input = Введіть код авторизації
signin-unblock-submit-button = Продовжити
signin-unblock-code-required-error = Потрібно ввести код авторизації
signin-unblock-code-incorrect-length = Код авторизації повинен містити 8 символів
signin-unblock-code-incorrect-format-2 = Код авторизації може містити лише літери та/або цифри
signin-unblock-resend-code-button = Немає у вхідних чи у спамі? Надіслати ще раз
signin-unblock-support-link = Чому це відбувається?
signin-unblock-desktop-relay = { -brand-firefox } спробує повернути вас назад, щоб ви використали маску е-пошти після входу.




confirm-signup-code-page-title = Введіть код підтвердження
confirm-signup-code-heading-2 = Введіть код підтвердження <span>для свого { -product-mozilla-account(case: "gen") }</span>
confirm-signup-code-instruction-v2 = Протягом 5 хвилин уведіть код, надісланий на <email>{ $email }</email>.
confirm-signup-code-input-label = Введіть код із 6 цифр
confirm-signup-code-confirm-button = Підтвердити
confirm-signup-code-code-expired = Код застарів?
confirm-signup-code-resend-code-link = Надіслати новий код електронною поштою.
confirm-signup-code-success-alert = Обліковий запис успішно підтверджено
confirm-signup-code-is-required-error = Потрібно ввести код підтвердження
confirm-signup-code-desktop-relay = { -brand-firefox } спробує повернути вас назад, щоб ви використали маску е-пошти після входу.


signup-relay-info = Пароль потрібен для безпечного керування замаскованими адресами е-пошти та доступу до інструментів безпеки { -brand-mozilla }.
signup-change-email-link = Змінити адресу електронної пошти
