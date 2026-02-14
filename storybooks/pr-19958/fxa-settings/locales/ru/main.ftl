



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts =
    { $case ->
        [nominative_uppercase] Аккаунты Firefox
        [genitive] аккаунтов Firefox
        [dative] аккаунтам Firefox
        [accusative] аккаунты Firefox
        [instrumental] аккаунтами Firefox
        [prepositional] аккаунтах Firefox
       *[nominative] аккаунты Firefox
    }
-product-mozilla-account =
    { $case ->
        [nominative_uppercase] Аккаунт Mozilla
        [genitive] аккаунта Mozilla
        [dative] аккаунту Mozilla
        [accusative] аккаунт Mozilla
        [instrumental] аккаунтом Mozilla
        [prepositional] аккаунте Mozilla
       *[nominative] аккаунт Mozilla
    }
-product-mozilla-accounts =
    { $case ->
        [nominative_uppercase] Аккаунты Mozilla
        [genitive] аккаунтов Mozilla
        [dative] аккаунтам Mozilla
        [accusative] аккаунты Mozilla
        [instrumental] аккаунтами Mozilla
        [prepositional] аккаунтах Mozilla
       *[nominative] аккаунты Mozilla
    }
-product-firefox-account =
    { $case ->
        [nominative_uppercase] Аккаунт Firefox
        [genitive] аккаунта Firefox
        [dative] аккаунту Firefox
        [accusative] аккаунт Firefox
        [instrumental] аккаунтом Firefox
        [prepositional] аккаунте Firefox
       *[nominative] аккаунт Firefox
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Клубы Mozilla
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = Общая ошибка приложения
app-general-err-message = Что-то пошло не так. Пожалуйста, попробуйте позже.
app-query-parameter-err-heading = Неверный запрос: недопустимые параметры


app-footer-mozilla-logo-label = Логотип { -brand-mozilla }
app-footer-privacy-notice = Уведомление о конфиденциальности веб-сайта
app-footer-terms-of-service = Условия использования


app-default-title-2 = { -product-mozilla-accounts(case: "nominative_uppercase") }
app-page-title-2 = { $title } | { -product-mozilla-accounts(case: "nominative_uppercase") }


link-sr-new-window = Открывается в новом окне


app-loading-spinner-aria-label-loading = Загрузка…


app-logo-alt-3 =
    .alt = Логотип { -brand-mozilla }



resend-code-success-banner-heading = Новый код был отправлен на вашу электронную почту.
resend-link-success-banner-heading = Новая ссылка была отправлена на вашу электронную почту.
resend-success-banner-description = Добавьте { $accountsEmail } в свои контакты, чтобы обеспечить корректную доставку писем.


brand-banner-dismiss-button-2 =
    .aria-label = Закрыть баннер
brand-prelaunch-title = 1 ноября «{ -product-firefox-accounts }» будут переименованы в «{ -product-mozilla-accounts }».
brand-prelaunch-subtitle = Вы по-прежнему будете входить в систему с тем же именем пользователя и паролем, и никаких других изменений в продуктах, которые вы используете, не произойдет.
brand-postlaunch-title = Мы переименовали «{ -product-firefox-accounts }» в «{ -product-mozilla-accounts }». Вы по-прежнему будете входить в систему с тем же именем пользователя и паролем, и никаких других изменений в продуктах, которые вы используете, не произойдёт.
brand-learn-more = Подробнее
brand-close-banner =
    .alt = Закрыть баннер
brand-m-logo =
    .alt = Логотип { -brand-mozilla } m


button-back-aria-label = Назад
button-back-title = Назад


recovery-key-download-button-v3 = Скачать и продолжить
    .title = Скачать и продолжить
recovery-key-pdf-heading = Ключ восстановления аккаунта
recovery-key-pdf-download-date = Создан { $date }
recovery-key-pdf-key-legend = Ключ восстановления аккаунта
recovery-key-pdf-instructions = Этот ключ позволит вам восстановить зашифрованные данные браузера (включая пароли, закладки и историю), если вы забудете свой пароль. Храните его в месте, о котором вы помните.
recovery-key-pdf-storage-ideas-heading = Места для хранения вашего ключа:
recovery-key-pdf-support = Узнать больше о ключе восстановления аккаунта
recovery-key-pdf-download-error = К сожалению, при скачивании ключа восстановления аккаунта произошла ошибка.


choose-newsletters-prompt-2 = Получите больше от { -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = Получайте наши последние новости и обновления продуктов
choose-newsletters-option-test-pilot =
    .label = Ранний доступ к тестированию новых продуктов
choose-newsletters-option-reclaim-the-internet =
    .label = Оповещения о действиях по восстановлению доступа к Интернету


datablock-download =
    .message = Скачаны
datablock-copy =
    .message = Скопированы
datablock-print =
    .message = Распечатаны


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


datablock-inline-copy =
    .message = Скопировано


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (приблизительно)
device-info-block-location-region-country = { $region }, { $country } (приблизительно)
device-info-block-location-city-country = { $city }, { $country } (приблизительно)
device-info-block-location-country = { $country } (приблизительно)
device-info-block-location-unknown = Местоположение неизвестно
device-info-browser-os = { $browserName } в { $genericOSName }
device-info-ip-address = IP-адрес: { $ipAddress }


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


form-verify-code-default-error = Это обязательное поле


form-verify-totp-disabled-button-title-numeric = Введите { $codeLength }-значный код для продолжения
form-verify-totp-disabled-button-title-alphanumeric = Введите для продолжения код из { $codeLength } символов


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


alert-icon-aria-label =
    .aria-label = Предупреждение
icon-attention-aria-label =
    .aria-label = Внимание
icon-warning-aria-label =
    .aria-label = Предупреждение
authenticator-app-aria-label =
    .aria-label = Приложение-аутентификатор
backup-codes-icon-aria-label-v2 =
    .aria-label = Резервные коды аутентификации включены
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Резервные коды аутентификации отключены
backup-recovery-sms-icon-aria-label =
    .aria-label = Восстановление по SMS включено
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Восстановление по SMS отключено
canadian-flag-icon-aria-label =
    .aria-label = Канадский флаг
checkmark-icon-aria-label =
    .aria-label = Флажок
checkmark-success-icon-aria-label =
    .aria-label = Успешно
checkmark-enabled-icon-aria-label =
    .aria-label = Включено
close-icon-aria-label =
    .aria-label = Закрыть сообщение
code-icon-aria-label =
    .aria-label = Код
error-icon-aria-label =
    .aria-label = Ошибка
info-icon-aria-label =
    .aria-label = Информация
usa-flag-icon-aria-label =
    .aria-label = Флаг США


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
security-shield-aria-label =
    .aria-label = Иллюстрация для представления ключа восстановления аккаунта.
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


inline-recovery-key-setup-signed-in-firefox-2 = Вы вошли в { -brand-firefox }.
inline-recovery-key-setup-create-header = Защитите свой аккаунт
inline-recovery-key-setup-create-subheader = Уделите минуту на защиту своих данных?
inline-recovery-key-setup-info = Создайте ключ восстановления аккаунта, это позволит вам восстановить синхронизированные данные о просмотре, если забудете пароль.
inline-recovery-key-setup-start-button = Создать ключ восстановления аккаунта
inline-recovery-key-setup-later-button = Сделать это позже


input-password-hide = Скрыть пароль
input-password-show = Показать пароль
input-password-hide-aria-2 = Ваш пароль в данный момент виден на экране.
input-password-show-aria-2 = Ваш пароль сейчас скрыт.
input-password-sr-only-now-visible = Ваш пароль теперь виден на экране.
input-password-sr-only-now-hidden = Ваш пароль теперь скрыт.


input-phone-number-country-list-aria-label = Выберите страну
input-phone-number-enter-number = Введите номер телефона
input-phone-number-country-united-states = США
input-phone-number-country-canada = Канада
legal-back-button = Назад


reset-pwd-link-damaged-header = Ссылка для сброса пароля повреждена
signin-link-damaged-header = Ссылка для подтверждения повреждена
report-signin-link-damaged-header = Ссылка повреждена
reset-pwd-link-damaged-message = В ссылке, по которой вы щёлкнули, отсутствуют символы, и возможно она была повреждена вашим почтовым клиентом. Внимательно скопируйте адрес и попробуйте ещё раз.


link-expired-new-link-button = Получить новую ссылку


remember-password-text = Помните ваш пароль?
remember-password-signin-link = Войти


primary-email-confirmation-link-reused = Основная электронная почта уже подтверждена
signin-confirmation-link-reused = Вход уже подтверждён
confirmation-link-reused-message = Эта ссылка для подтверждения уже была использована, и может использоваться только один раз.


locale-toggle-select-label = Выберите язык
locale-toggle-browser-default = Браузер по умолчанию
error-bad-request = Неверный запрос


password-info-balloon-why-password-info = Вам нужен этот пароль для доступа к любым зашифрованным данным, которые вы храните у нас.
password-info-balloon-reset-risk-info = Сброс означает потенциальную потерю данных, таких как пароли и закладки.


password-strength-long-instruction = Выберите надёжный пароль, который вы не использовали на других сайтах. Убедитесь, что он соответствует требованиям безопасности:
password-strength-short-instruction = Выберите надёжный пароль:
password-strength-inline-min-length = Не менее 8 символов
password-strength-inline-not-email = Не ваш адрес электронной почты
password-strength-inline-not-common = Не часто используемый пароль
password-strength-inline-confirmed-must-match = Подтверждение соответствует новому паролю
password-strength-inline-passwords-match = Пароли совпадают


account-recovery-notification-cta = Создать
account-recovery-notification-header-value = Не потеряйте свои данные, если забудете пароль
account-recovery-notification-header-description = Создайте ключ восстановления аккаунта, чтобы восстановить синхронизированные данные о просмотре, если забудете пароль.
recovery-phone-promo-cta = Добавить телефон для восстановления
recovery-phone-promo-heading = Добавьте своему аккаунту дополнительную защиту с помощью телефона для восстановления
recovery-phone-promo-description = Теперь вы можете войти с одноразовым паролем из SMS, если не можете использовать приложение двухэтапной аутентификации.
recovery-phone-promo-info-link = Узнайте больше о восстановлении и риске подмены SIM-карт
promo-banner-dismiss-button =
    .aria-label = Скрыть баннер


ready-complete-set-up-instruction = Завершите настройку, введя свой новый пароль на других ваших устройствах с { -brand-firefox }.
manage-your-account-button = Управление вашим аккаунтом
ready-use-service = Теперь вы готовы к использованию { $serviceName }
ready-use-service-default = Теперь вы готовы использовать настройки аккаунта
ready-account-ready = Ваш аккаунт готов!
ready-continue = Продолжить
sign-in-complete-header = Вход подтверждён
sign-up-complete-header = Аккаунт подтверждён
primary-email-verified-header = Основная электронная почта подтверждена


flow-recovery-key-download-storage-ideas-heading-v2 = Места для хранения вашего ключа:
flow-recovery-key-download-storage-ideas-folder-v2 = Папка на защищённом устройстве
flow-recovery-key-download-storage-ideas-cloud = Надёжное облачное хранилище
flow-recovery-key-download-storage-ideas-print-v2 = Распечатанная физическая копия
flow-recovery-key-download-storage-ideas-pwd-manager = Менеджер паролей


flow-recovery-key-hint-header-v2 = Добавьте подсказку, которая поможет найти ключ
flow-recovery-key-hint-message-v3 = Эта подсказка должна помочь вам вспомнить, где вы сохранили ключ восстановления своего аккаунта. Мы можем показать её вам во время сброса пароля, чтобы восстановить ваши данные.
flow-recovery-key-hint-input-v2 =
    .label = Введите подсказку (необязательно)
flow-recovery-key-hint-cta-text = Завершить
flow-recovery-key-hint-char-limit-error = Подсказка должна содержать менее 255 символов.
flow-recovery-key-hint-unsafe-char-error = Подсказка не может содержать небезопасные символы Юникода. Допускаются только буквы, цифры, знаки препинания и символы.


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


alert-bar-close-message = Закрыть сообщение


avatar-your-avatar =
    .alt = Ваш аватар
avatar-default-avatar =
    .alt = Стандартный аватар




bento-menu-title-3 = Продукты { -brand-mozilla }
bento-menu-tagline = Больше продуктов от { -brand-mozilla }, которые защищают вашу конфиденциальность
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Браузер { -brand-firefox } для компьютеров
bento-menu-firefox-mobile = Браузер { -brand-firefox } для мобильных
bento-menu-made-by-mozilla = Создано { -brand-mozilla }


connect-another-fx-mobile = Установите { -brand-firefox } на своё мобильное устройство
connect-another-find-fx-mobile-2 = Найдите { -brand-firefox } в { -google-play } и { -app-store }.
connect-another-play-store-image-2 =
    .alt = Скачайте { -brand-firefox } в { -google-play }
connect-another-app-store-image-3 =
    .alt = Скачайте { -brand-firefox } в { -app-store }


cs-heading = Подключённые службы
cs-description = Всё, что вы используете и где выполнили вход.
cs-cannot-refresh =
    К сожалению, при обновлении списка
    подключённых служб произошла ошибка
cs-cannot-disconnect = Клиент не найден, отключить не удалось
cs-logged-out-2 = Вы вышли из { $service }.
cs-refresh-button =
    .title = Обновить подключённые службы
cs-missing-device-help = Отсутствующие или повторяющиеся элементы?
cs-disconnect-sync-heading = Отсоединиться от Синхронизации


cs-disconnect-sync-content-3 = Ваши данные веб-сёрфинга останутся на <span>{ $device }</span>, но оно больше не будет синхронизироваться с вашим аккаунтом.
cs-disconnect-sync-reason-3 = Какова главная причина отсоединения <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = Это устройство:
cs-disconnect-sync-opt-suspicious = Подозрительно
cs-disconnect-sync-opt-lost = Потеряно или украдено
cs-disconnect-sync-opt-old = Старое или заменено
cs-disconnect-sync-opt-duplicate = Дублируется
cs-disconnect-sync-opt-not-say = Не хочу говорить


cs-disconnect-advice-confirm = Хорошо, понятно
cs-disconnect-lost-advice-heading = Утерянное или украденное устройство отсоединено
cs-disconnect-lost-advice-content-3 = Поскольку ваше устройство было утеряно или украдено, для сохранения вашей информации в безопасности, вам следует сменить пароль своего { -product-mozilla-account(case: "genitive") } в настройках. Вам также следует изучить информацию производителя своего устройства об удалённом стирании своих данных.
cs-disconnect-suspicious-advice-heading = Подозрительное устройство отсоединено
cs-disconnect-suspicious-advice-content-2 = Если отсоединённое устройство действительно подозрительно, для сохранения вашей информации в безопасности, вам следует сменить пароль своего { -product-mozilla-account(case: "genitive") } в настройках. Вам также следует сменить любые другие пароли, которые вы сохраняли в { -brand-firefox }, набрав about:logins в адресной строке.
cs-sign-out-button = Выйти


dc-heading = Сбор и использование данных
dc-subheader-moz-accounts = { -product-mozilla-accounts(case: "nominative_uppercase") }
dc-subheader-ff-browser = Браузер { -brand-firefox }
dc-subheader-content-2 = Разрешить { -product-mozilla-accounts(case: "dative") } отправлять технические данные и данные взаимодействия в { -brand-mozilla }.
dc-subheader-ff-content = Чтобы просмотреть или обновить технические настройки и данные взаимодействия вашего { -brand-firefox }, откройте настройки { -brand-firefox } и перейдите в раздел «Приватность и Защита».
dc-opt-out-success-2 = Отказ подтверждён. { -product-mozilla-accounts(case: "nominative_uppercase") } не будут отправлять технические данные или данные о взаимодействии в { -brand-mozilla }.
dc-opt-in-success-2 = Спасибо! Отправка этих данных поможет нам улучшить { -product-mozilla-accounts(case: "nominative") }.
dc-opt-in-out-error-2 = К сожалению, при изменении вашей настройки сбора данных возникла проблема
dc-learn-more = Подробнее


drop-down-menu-title-2 = Меню { -product-mozilla-account(case: "genitive") }
drop-down-menu-signed-in-as-v2 = Вы вошли как
drop-down-menu-sign-out = Выйти
drop-down-menu-sign-out-error-2 = К сожалению, при выходе возникла проблема


flow-container-back = Назад


flow-recovery-key-confirm-pwd-heading-v2 = Повторно введите пароль для безопасности
flow-recovery-key-confirm-pwd-input-label = Введите пароль
flow-recovery-key-confirm-pwd-submit-button = Создать ключ восстановления аккаунта
flow-recovery-key-confirm-pwd-submit-button-change-key = Создать новый ключ восстановления аккаунта


flow-recovery-key-download-heading-v2 = Создан ключ восстановления аккаунта — скачайте и сохраните его сейчас
flow-recovery-key-download-info-v2 = Этот ключ позволяет восстановить данные, если вы забудете пароль. Скачайте его сейчас и сохраните в удобном для вас месте — вы не сможете вернуться на эту страницу позже.
flow-recovery-key-download-next-link-v2 = Продолжить без скачивания


flow-recovery-key-success-alert = Ключ восстановления аккаунта создан


flow-recovery-key-info-header = Создайте ключ восстановления аккаунта на случай, если вы забудете пароль
flow-recovery-key-info-header-change-key = Изменение вашего ключа восстановления аккаунта
flow-recovery-key-info-shield-bullet-point-v2 = Мы шифруем данные просмотра — пароли, закладки и многое другое. Это отлично подходит для конфиденциальности, но вы можете потерять свои данные, если забудете пароль.
flow-recovery-key-info-key-bullet-point-v2 = Вот почему создание ключа восстановления аккаунта так важно — вы можете использовать его для восстановления своих данных.
flow-recovery-key-info-cta-text-v3 = Начать
flow-recovery-key-info-cancel-link = Отмена


flow-setup-2fa-qr-heading = Подключение к вашему приложению для аутентификации
flow-setup-2a-qr-instruction = <strong>Шаг 1:</strong> Отсканируйте этот QR-код с помощью любого приложения для аутентификации, например, Duo или Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = Штрих-код для настройки двухэтапной аутентификации. Отсканируйте его или выберите «Не можете отсканировать QR-код?» , чтобы получить секретный ключ настройки.
flow-setup-2fa-cant-scan-qr-button = Не можете отсканировать QR-код?
flow-setup-2fa-manual-key-heading = Введите код вручную
flow-setup-2fa-manual-key-instruction = <strong>Шаг 1:</strong> Введите этот код в нужное вам приложение для аутентификации.
flow-setup-2fa-scan-qr-instead-button = Вместо этого сканировать QR-код?
flow-setup-2fa-more-info-link = Узнайте больше о приложениях для аутентификации
flow-setup-2fa-button = Продолжить
flow-setup-2fa-step-2-instruction = <strong>Шаг 2:</strong> Введите код из вашего приложения для аутентификации.
flow-setup-2fa-input-label = Введите код из 6 цифр
flow-setup-2fa-code-error = Неверный или истёкший код. Проверьте своё приложение для аутентификации и попробуйте ещё раз.


flow-setup-2fa-backup-choice-heading = Выберите метод восстановления
flow-setup-2fa-backup-choice-description = Это позволит вам войти, если у вас нет доступа к своему мобильному устройству или приложению для аутентификации.
flow-setup-2fa-backup-choice-phone-title = Телефон для восстановления
flow-setup-2fa-backup-choice-phone-badge = Проще всего
flow-setup-2fa-backup-choice-phone-info = Получите код восстановления в виде текстового сообщения. В настоящее время доступно в США и Канаде.
flow-setup-2fa-backup-choice-code-title = Резервные коды аутентификации
flow-setup-2fa-backup-choice-code-badge = Самый безопасный
flow-setup-2fa-backup-choice-code-info = Создавайте и сохраняйте одноразовые коды аутентификации.
flow-setup-2fa-backup-choice-learn-more-link = Узнайте о риске восстановления и подмены SIM-карт


flow-setup-2fa-backup-code-confirm-heading = Введите резервный код аутентификации
flow-setup-2fa-backup-code-confirm-confirm-saved = Подтвердите, что вы сохранили коды, введя один из них. Без этих кодов вы не сможете войти, если у вас нет приложения для аутентификации.
flow-setup-2fa-backup-code-confirm-code-input = Введите 10-значный код
flow-setup-2fa-backup-code-confirm-button-finish = Готово


flow-setup-2fa-backup-code-dl-heading = Сохраните резервные коды аутентификации
flow-setup-2fa-backup-code-dl-save-these-codes = Храните их в месте, о котором вы будете помнить. Если у вас нет доступа к приложению для аутентификации, вам нужно ввести один из них, чтобы войти.
flow-setup-2fa-backup-code-dl-button-continue = Продолжить


flow-setup-2fa-inline-complete-success-banner = Двухэтапная аутентификация включена
flow-setup-2fa-inline-complete-success-banner-description = Чтобы защитить все подключённые устройства, вам следует выйти из этого аккаунта везде, где вы используете его, а затем войти снова, используя новую двухэтапную аутентификацию.
flow-setup-2fa-inline-complete-backup-code = Резервные коды аутентификации
flow-setup-2fa-inline-complete-backup-phone = Телефон для восстановления
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] Остался { $count } код
        [few] Осталось { $count } кода
       *[many] Осталось { $count } кодов
    }
flow-setup-2fa-inline-complete-backup-code-description = Это самый безопасный метод восстановления, если вы не можете войти с помощью своего мобильного устройства или приложения для аутентификации.
flow-setup-2fa-inline-complete-backup-phone-description = Это самый легкий способ восстановления, если вы не можете войти с помощью приложения для аутентификации.
flow-setup-2fa-inline-complete-learn-more-link = Как это защищает ваш аккаунт
flow-setup-2fa-inline-complete-continue-button = Перейти в { $serviceName }
flow-setup-2fa-prompt-heading = Настроить двухэтапную аутентификацию
flow-setup-2fa-prompt-description = { $serviceName } требует настройки двухэтапной аутентификации, чтобы обеспечить безопасность вашего аккаунта.
flow-setup-2fa-prompt-use-authenticator-apps = Для продолжения вы можете использовать любое из <authenticationAppsLink>этих приложений для аутентификации</authenticationAppsLink>.
flow-setup-2fa-prompt-continue-button = Продолжить


flow-setup-phone-confirm-code-heading = Введите код подтверждения
flow-setup-phone-confirm-code-instruction = Шестизначный код был отправлен на <span>{ $phoneNumber }</span> как текстовое сообщение. Срок действия данного кода истечёт через 5 минут.
flow-setup-phone-confirm-code-input-label = Введите код из 6 цифр
flow-setup-phone-confirm-code-button = Подтвердить
flow-setup-phone-confirm-code-expired = Срок действия кода истёк?
flow-setup-phone-confirm-code-resend-code-button = Отправить код ещё раз
flow-setup-phone-confirm-code-resend-code-success = Код отправлен
flow-setup-phone-confirm-code-success-message-v2 = Телефон для восстановления добавлен
flow-change-phone-confirm-code-success-message = Телефон для восстановления изменён


flow-setup-phone-submit-number-heading = Подтвердите свой номер телефона
flow-setup-phone-verify-number-instruction = Вы получите текстовое сообщение от { -brand-mozilla } с кодом для подтверждения вашего номера телефона. Не сообщайте этот код никому.
flow-setup-phone-submit-number-info-message-v2 = Телефон для восстановления доступен только в США и Канаде. Номера VoIP и псевдонимы телефона не рекомендуются.
flow-setup-phone-submit-number-legal = Предоставляя свой номер телефона, вы соглашаетесь с тем, что мы будем хранить его, чтобы мы могли отправлять вам текстовые сообщения только для проверки аккаунта. За сообщение и передачу данных может взиматься плата.
flow-setup-phone-submit-number-button = Отправить код


header-menu-open = Закрыть меню
header-menu-closed = Меню навигации по сайту
header-back-to-top-link =
    .title = Наверх
header-back-to-settings-link =
    .title = Вернуться к настройкам { -product-mozilla-account(case: "genitive") }
header-title-2 = { -product-mozilla-account(case: "nominative_uppercase") }
header-help = Помощь


la-heading = Связанные аккаунты
la-description = Вы разрешили доступ к следующим аккаунтам.
la-unlink-button = Отвязать
la-unlink-account-button = Отвязать
la-set-password-button = Установить пароль
la-unlink-heading = Отвязать от стороннего аккаунта
la-unlink-content-3 = Вы уверены, что хотите отвязать свой аккаунт? Отвязывание аккаунта не приведёт к автоматическому выходу из подключенных служб. Выход из них вам нужно будет выполнять вручную в разделе «‎Подключённые службы»‎.
la-unlink-content-4 = Перед отвязкой аккаунта необходимо установить пароль. Без пароля вы не сможете войти в систему после отсоединения своего аккаунта.
nav-linked-accounts = { la-heading }


modal-close-title = Закрыть
modal-cancel-button = Отмена
modal-default-confirm-button = Подтвердить


modal-mfa-protected-title = Введите код подтверждения
modal-mfa-protected-subtitle = Помогите нам убедиться, что это вы изменяете информацию своего аккаунта
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
modal-mfa-protected-resend-code-link = Отправить новый код по электронной почте.


mvs-verify-your-email-2 = Подтвердите свою электронную почту
mvs-enter-verification-code-2 = Введите код подтверждения
mvs-enter-verification-code-desc-2 = Пожалуйста, введите код подтверждения, который был отправлен на <email>{ $email }</email>, в течение 5 минут.
msv-cancel-button = Отмена
msv-submit-button-2 = Подтвердить


nav-settings = Настройки
nav-profile = Профиль
nav-security = Безопасность
nav-connected-services = Подсоединённые устройства
nav-data-collection = Сбор и использование данных
nav-paid-subs = Платные подписки
nav-email-comm = Почтовые рассылки


page-2fa-change-title = Изменить двухэтапную аутентификацию
page-2fa-change-success = Двухэтапная аутентификация была обновлена
page-2fa-change-success-additional-message = Чтобы защитить все подключённые устройства, вам следует выйти из этого аккаунта везде, где вы используете его, а затем войти снова, используя новую двухэтапную аутентификацию.
page-2fa-change-totpinfo-error = При замене вашего приложения двухэтапной аутентификации произошла ошибка. Подождите некоторое время и попробуйте снова.
page-2fa-change-qr-instruction = <strong>Шаг 1:</strong> Отсканируйте этот QR-код с помощью любого приложения для аутентификации, например, Duo или Google Authenticator. Будет создано новое подключение, все старые подключения больше не будут работать.


tfa-backup-codes-page-title = Резервные коды аутентификации
tfa-replace-code-error-3 = При замене ваших резервных кодов аутентификации возникла проблема
tfa-create-code-error = При создании ваших резервных кодов аутентификации возникла проблема
tfa-replace-code-success-alert-4 = Резервные коды аутентификации обновлены
tfa-create-code-success-alert = Резервные коды аутентификации созданы
tfa-replace-code-download-description = Храните их в месте, о котором вы будете помнить. Ваши старые коды будут заменены после того, как вы совершите следующий шаг.
tfa-replace-code-confirm-description = Подтвердите, что вы сохранили коды, введя один из них. Ваши старые резервные коды аутентификации будут отключены после завершения этого шага.
tfa-incorrect-recovery-code-1 = Некорректный резервный код аутентификации


page-2fa-setup-title = Двухэтапная аутентификация
page-2fa-setup-totpinfo-error = При настройке двухэтапной аутентификации произошла ошибка. Подождите некоторое время и попробуйте снова.
page-2fa-setup-incorrect-backup-code-error = Этот код неверен. Попробуйте снова.
page-2fa-setup-success = Двухэтапная аутентификация включена
page-2fa-setup-success-additional-message = Чтобы защитить все подключённые устройства, вам следует выйти везде, где вы используете этот аккаунт, а затем войти снова, используя двухэтапную аутентификацию.


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


pw-change-header =
    .title = Сменить пароль
pw-8-chars = Не менее 8 символов
pw-not-email = Не ваш адрес электронной почты
pw-change-must-match = Новый пароль совпадает с подтверждением
pw-commonly-used = Не часто используемый пароль
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


pw-create-header =
    .title = Создать пароль
pw-create-success-alert-2 = Пароль установлен
pw-create-error-2 = К сожалению, при установке вашего пароля возникла проблема


delete-account-header =
    .title = Удалить аккаунт
delete-account-step-1-2 = Шаг 1 из 2
delete-account-step-2-2 = Шаг 2 из 2
delete-account-confirm-title-4 = Возможно, вы подключили свой { -product-mozilla-account(case: "nominative") } к одному или нескольким из следующих продуктов { -brand-mozilla } или служб, которые обеспечивают вашу безопасность и продуктивность в Интернете:
delete-account-product-mozilla-account = { -product-mozilla-account(case: "nominative_uppercase") }
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


display-name-page-title =
    .title = Отображаемое имя
display-name-input =
    .label = Введите отображаемое имя
submit-display-name = Сохранить
cancel-display-name = Отмена
display-name-update-error-2 = При обновлении вашего отображаемого имени возникла проблема
display-name-success-alert-2 = Отображаемое имя обновлено


recent-activity-title = Недавняя активность аккаунта
recent-activity-account-create-v2 = Аккаунт создан
recent-activity-account-disable-v2 = Аккаунт отключён
recent-activity-account-enable-v2 = Аккаунт включён
recent-activity-account-login-v2 = Инициирован вход в аккаунт
recent-activity-account-reset-v2 = Инициирован сброс пароля
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
recent-activity-unknown = Другая активность аккаунта


recovery-key-create-page-title = Ключ восстановления аккаунта
recovery-key-create-back-button-title = Вернуться в настройки


recovery-phone-remove-header = Удалить номер телефона для восстановления
settings-recovery-phone-remove-info = Это удалит <strong>{ $formattedFullPhoneNumber }</strong> в качестве вашего телефона для восстановления.
settings-recovery-phone-remove-recommend = Мы рекомендуем вам сохранить этот метод, так как это проще, чем сохранять резервные коды аутентификации.
settings-recovery-phone-remove-recovery-methods = Если вы удалите его, убедитесь, что у вас все ещё есть сохранённые резервные коды аутентификации. <linkExternal>Сравните методы восстановления</linkExternal>
settings-recovery-phone-remove-button = Удалить номер телефона
settings-recovery-phone-remove-cancel = Отмена
settings-recovery-phone-remove-success = Телефон для восстановления удалён


page-setup-recovery-phone-heading = Добавить телефон для восстановления
page-change-recovery-phone = Изменить телефон для восстановления
page-setup-recovery-phone-back-button-title = Вернуться в настройки
page-setup-recovery-phone-step2-back-button-title = Изменить номер телефона


add-secondary-email-step-1 = Шаг 1 из 2
add-secondary-email-error-2 = При добавлении этого адреса электронной почты возникла проблема
add-secondary-email-page-title =
    .title = Дополнительный адрес электронной почты
add-secondary-email-enter-address =
    .label = Введите адрес электронной почты
add-secondary-email-cancel-button = Отмена
add-secondary-email-save-button = Сохранить
add-secondary-email-mask = Псевдонимы электронной почты не могут использоваться в качестве альтернативной электронной почты


add-secondary-email-step-2 = Шаг 2 из 2
verify-secondary-email-page-title =
    .title = Дополнительный адрес электронной почты
verify-secondary-email-verification-code-2 =
    .label = Введите код подтверждения
verify-secondary-email-cancel-button = Отмена
verify-secondary-email-verify-button-2 = Подтвердить
verify-secondary-email-please-enter-code-2 = Пожалуйста, введите код подтверждения, который был отправлен на <strong>{ $email }</strong>, в течение 5 минут.
verify-secondary-email-success-alert-2 = { $email } успешно добавлен
verify-secondary-email-resend-code-button = Отправить код подтверждения ещё раз


delete-account-link = Удалить аккаунт
inactive-update-status-success-alert = Вы успешно вошли. Ваш { -product-mozilla-account(case: "nominative") } и данные останутся активными.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Найдите, где находится ваша личная информация, и возьмите под контроль
product-promo-monitor-cta = Получить бесплатное сканирование


profile-heading = Профиль
profile-picture =
    .header = Фото
profile-display-name =
    .header = Отображаемое имя
profile-primary-email =
    .header = Основной адрес электронной почты


progress-bar-aria-label-v2 = Шаг { $currentStep } из { $numberOfSteps }.


security-heading = Безопасность
security-password =
    .header = Пароль
security-password-created-date = Создан { $date }
security-not-set = Не настроена
security-action-create = Создать
security-set-password = Установите пароль для синхронизации и использования определённых функций безопасности аккаунта.
security-recent-activity-link = Просмотр последних действий в аккаунте
signout-sync-header = Время сессии истекло
signout-sync-session-expired = Извините, что-то пошло не так. Пожалуйста, выйдите из меню браузера и попробуйте ещё раз.


tfa-row-backup-codes-title = Резервные коды аутентификации
tfa-row-backup-codes-not-available = Нет доступных кодов
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] Остался { $numCodesAvailable } код
        [few] Осталось { $numCodesAvailable } кода
       *[many] Осталось { $numCodesAvailable } кодов
    }
tfa-row-backup-codes-get-new-cta-v2 = Создать новые коды
tfa-row-backup-codes-add-cta = Добавить
tfa-row-backup-codes-description-2 = Это самый безопасный метод восстановления, если вы не можете использовать своё мобильное устройство или приложение для аутентификации.
tfa-row-backup-phone-title-v2 = Телефон для восстановления
tfa-row-backup-phone-not-available-v2 = Номер телефона не добавлен
tfa-row-backup-phone-change-cta = Изменить
tfa-row-backup-phone-add-cta = Добавить
tfa-row-backup-phone-delete-button = Удалить
tfa-row-backup-phone-delete-title-v2 = Удалить телефон для восстановления
tfa-row-backup-phone-delete-restriction-v2 = Если вы хотите удалить резервный телефон для восстановления, добавьте резервные коды аутентификации или сначала отключите двухэтапную аутентификацию, чтобы избежать блокировки вашего аккаунта.
tfa-row-backup-phone-description-v2 = Это более простой способ восстановления, если вы не можете использовать своё приложение для аутентификации.
tfa-row-backup-phone-sim-swap-risk-link = Узнайте о риске подмены SIM-карт


switch-turn-off = Отключить
switch-turn-on = Включить
switch-submitting = Отправка…
switch-is-on = включено
switch-is-off = отключено


row-defaults-action-add = Добавить
row-defaults-action-change = Изменить
row-defaults-action-disable = Отключить
row-defaults-status = Нет


rk-header-1 = Ключ восстановления аккаунта
rk-enabled = Включён
rk-not-set = Не настроен
rk-action-create = Создать
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
unit-row-recovery-key-delete-icon-button-title = Удалить ключ восстановления аккаунта


se-heading = Дополнительный адрес электронной почты
    .header = Дополнительный адрес электронной почты
se-cannot-refresh-email = К сожалению, при обновлении этого адреса электронной почты произошла ошибка.
se-cannot-resend-code-3 = К сожалению, при повторной отправке кода подтверждения возникла проблема
se-set-primary-successful-2 = { $email } теперь является вашим основным адресом электронной почты
se-set-primary-error-2 = К сожалению, при изменении вашего основного адреса электронной почты возникла проблема
se-delete-email-successful-2 = { $email } успешно удалён
se-delete-email-error-2 = К сожалению, при удалении этого адреса электронной почты возникла проблема
se-verify-session-3 = Вам необходимо подтвердить свою текущую сессию для выполнения этого действия
se-verify-session-error-3 = К сожалению, при подтверждении вашей сессии возникла проблема
se-remove-email =
    .title = Удалить электронную почту
se-refresh-email =
    .title = Обновить электронную почту
se-unverified-2 = не подтверждено
se-resend-code-2 =
    Требуется подтверждение. <button>Повторно отправьте код подтверждения</button>
    если его нет в вашей папке «Входящие» или «Спам».
se-make-primary = Сделать основным
se-default-content = Получите доступ к своему аккаунту, если вы не можете войти в свой основной адрес электронной почты.
se-content-note-1 = Примечание: дополнительный адрес электронной почты не восстановит вашу информацию — для этого вам понадобится <a>ключ восстановления аккаунта</a>.
se-secondary-email-none = Нет


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
tfa-row-enabled-description = Ваш аккаунт защищён двухэтапной аутентификацией. Вам нужно будет ввести одноразовый код-пароль из приложения для аутентификации при входе в { -product-mozilla-account(case: "nominative") }.
tfa-row-enabled-info-link = Как это защищает ваш аккаунт
tfa-row-disabled-description-v2 = Помогите защитить свой аккаунт, используя стороннее приложение для аутентификации в качестве второго шага для входа.
tfa-row-cannot-verify-session-4 = К сожалению, при подтверждении вашей сессии возникла проблема
tfa-row-disable-modal-heading = Отключить двухэтапную аутентификацию?
tfa-row-disable-modal-confirm = Отключить
tfa-row-disable-modal-explain-1 =
    Вы не сможете отменить это действие. У вас также
    есть возможность <linkExternal>заменить свои резервные коды аутентификации</linkExternal>.
tfa-row-disabled-2 = Двухэтапная аутентификация отключена
tfa-row-cannot-disable-2 = Двухэтапная аутентификация не может быть отключена
tfa-row-verify-session-info = Вам необходимо подтвердить свою текущую сессию для настройки двухэтапной аутентификации


terms-privacy-agreement-intro-3 = Продолжая, вы соглашаетесь со следующим:
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>Условия использования</termsLink> и <privacyLink>Уведомление о конфиденциальности</privacyLink>
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>Условия обслуживания</mozillaAccountsTos> и <mozillaAccountsPrivacy>Уведомление о конфиденциальности</mozillaAccountsPrivacy>
terms-privacy-agreement-default-2 = Продолжая, вы соглашаетесь с <mozillaAccountsTos>Условиями обслуживания</mozillaAccountsTos> и <mozillaAccountsPrivacy>Уведомлением о конфиденциальности</mozillaAccountsPrivacy>.


third-party-auth-options-or = или
third-party-auth-options-sign-in-with = Войти через
continue-with-google-button = Продолжить с { -brand-google }
continue-with-apple-button = Продолжить с { -brand-apple }


auth-error-102 = Неизвестный аккаунт
auth-error-103 = Неверный пароль
auth-error-105-2 = Неверный код подтверждения
auth-error-110 = Некорректный токен
auth-error-114-generic = Совершено слишком много попыток. Пожалуйста, повторите позже.
auth-error-114 = Вы сделали слишком много попыток. Попробуйте снова { $retryAfter }.
auth-error-125 = Запрос заблокирован по соображениям безопасности
auth-error-129-2 = Вы ввели некорректный номер телефона. Пожалуйста, проверьте его и попробуйте снова.
auth-error-138-2 = Неподтверждённая сессия
auth-error-139 = Дополнительный адрес электронной почты должен отличаться от основного
auth-error-144 = Этот адрес электронной почты зарезервирован другим аккаунтом. Подождите некоторое время и попробуйте снова или используйте другой адрес электронной почты.
auth-error-155 = TOTP-токен не найден
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
auth-error-1064 = Ошибка при наборе адреса электронной почты? { $domain } не является корректной службой электронной почты
auth-error-1066 = Псевдонимы электронной почты не могут быть использованы для создания аккаунта.
auth-error-1067 = Опечатка в электронной почте?
recovery-phone-number-ending-digits = Номер, заканчивающийся на { $lastFourPhoneNumber }
oauth-error-1000 = Что-то пошло не так. Пожалуйста, закройте эту вкладку и попробуйте ещё раз.


connect-another-device-signed-in-header = Вы вошли в { -brand-firefox }
connect-another-device-email-confirmed-banner = Электронная почта подтверждена
connect-another-device-signin-confirmed-banner = Вход подтверждён
connect-another-device-signin-to-complete-message = Войти в { -brand-firefox } на этом устройстве, чтобы завершить настройку
connect-another-device-signin-link = Войти
connect-another-device-still-adding-devices-message = Всё ещё добавляете устройства? Войдите в { -brand-firefox } на другом устройстве, чтобы завершить настройку
connect-another-device-signin-another-device-to-complete-message = Войдите в { -brand-firefox } на другом устройстве, чтобы завершить настройку
connect-another-device-get-data-on-another-device-message = Хотите получить свои вкладки, закладки и пароли на другом устройстве?
connect-another-device-cad-link = Подключить другое устройство
connect-another-device-not-now-link = Не сейчас
connect-another-device-android-complete-setup-message = Войдите в { -brand-firefox } для Android, чтобы завершить настройку
connect-another-device-ios-complete-setup-message = Войдите в { -brand-firefox } для iOS, чтобы завершить настройку


cookies-disabled-header = Требуется локальное хранилище и куки
cookies-disabled-enable-prompt-2 = Пожалуйста, включите куки и локальное хранилище в вашем браузере для доступа к { -product-mozilla-account(case: "dative") }. Если вы включите их, браузер сможет запоминать ваши сессии.
cookies-disabled-button-try-again = Попробовать снова
cookies-disabled-learn-more = Подробнее


index-header = Введите ваш адрес эл. почты
index-sync-header = Перейдите в свой { -product-mozilla-account(case: "nominative") }
index-sync-subheader = Синхронизируйте свои пароли, вкладки и закладки везде, где используете { -brand-firefox }.
index-relay-header = Создать псевдоним электронной почты
index-relay-subheader = Укажите адрес электронной почты, на который вы хотите пересылать письма с вашего замаскированного адреса электронной почты.
index-subheader-with-servicename = Перейти к { $serviceName }
index-subheader-default = Перейти к настройкам аккаунта
index-cta = Зарегистрироваться или войти
index-account-info = { -product-mozilla-account(case: "nominative_uppercase") } также открывает доступ к другим продуктам { -brand-mozilla } для защиты приватности.
index-email-input =
    .label = Введите ваш адрес эл. почты
index-account-delete-success = Аккаунт успешно удалён
index-email-bounced = Ваше письмо для подтверждения только что вернулось. Опечатка в электронной почте?


inline-recovery-key-setup-create-error = Ой! Мы не смогли создать ключ восстановления вашего аккаунта. Подождите некоторое время и попробуйте снова.
inline-recovery-key-setup-recovery-created = Ключ восстановления аккаунта создан
inline-recovery-key-setup-download-header = Защитите свой аккаунт
inline-recovery-key-setup-download-subheader = Скачать и сохранить его сейчас
inline-recovery-key-setup-download-info = Храните этот ключ в удобном для вас месте — вы не сможете вернуться на эту страницу позже.
inline-recovery-key-setup-hint-header = Рекомендация по безопасности


inline-totp-setup-cancel-setup-button = Отменить настройку
inline-totp-setup-continue-button = Продолжить
inline-totp-setup-add-security-link = Добавьте в свой аккаунт ещё один уровень защиты, включив использование кодов аутентификации от одного из <authenticationAppsLink>этих приложений для авторизации</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = Включите двухэтапную аутентификацию, <span>для перехода к настройкам аккаунта</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Включите двухэтапную аутентификацию, <span>для перехода к { $serviceName }</span>
inline-totp-setup-ready-button = Готово
inline-totp-setup-show-qr-custom-service-header-2 = Отсканируйте код аутентификации <span>для перехода к { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = Введите код вручную <span>для перехода к { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = Отсканируйте код аутентификации, <span>для перехода к настройкам аккаунта</span>
inline-totp-setup-no-qr-default-service-header-2 = Введите код вручную <span>для перехода к настройкам аккаунта</span>
inline-totp-setup-enter-key-or-use-qr-instructions = Введите этот секретный ключ в приложение для аутентификации. <toggleToQRButton>Сканировать QR-код вместо этого?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = Отсканируйте QR-код в приложении для аутентификации, а затем введите предоставленный им код аутентификации. <toggleToManualModeButton>Не можете отсканировать код?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = По завершении оно начнёт генерировать коды аутентификации, которые вы сможете ввести.
inline-totp-setup-security-code-placeholder = Код аутентификации
inline-totp-setup-code-required-error = Требуется код аутентификации
tfa-qr-code-alt = Используйте код { $code } для настройки двухэтапной аутентификации в поддерживаемых приложениях.
inline-totp-setup-page-title = Двухэтапная аутентификация


legal-header = Юридическая информация
legal-terms-of-service-link = Условия использования
legal-privacy-link = Уведомление о конфиденциальности


legal-privacy-heading = Уведомление о конфиденциальности


legal-terms-heading = Условия использования


pair-auth-allow-heading-text = Вы только что вошли в { -product-firefox }?
pair-auth-allow-confirm-button = Да, подтвердить устройство
pair-auth-allow-refuse-device-link = Если это были не вы, <link>смените пароль</link>


pair-auth-complete-heading = Устройство подключено
pair-auth-complete-now-syncing-device-text = Теперь вы синхронизируетесь с: { $deviceFamily } на { $deviceOS }
pair-auth-complete-sync-benefits-text = Теперь вы можете просматривать свои открытые вкладки, пароли и закладки на всех устройствах.
pair-auth-complete-see-tabs-button = Просмотреть вкладки на синхронизированных устройствах
pair-auth-complete-manage-devices-link = Управление устройствами


auth-totp-heading-w-default-service = Введите код аутентификации, <span>для перехода к настройкам аккаунта</span>
auth-totp-heading-w-custom-service = Введите код аутентификации <span>для перехода к { $serviceName }</span>
auth-totp-instruction = Откройте своё приложение для аутентификации и введите предоставленный им код аутентификации.
auth-totp-input-label = Введите код из 6 цифр
auth-totp-confirm-button = Подтвердить
auth-totp-code-required-error = Требуется код аутентификации


pair-wait-for-supp-heading-text = Теперь требуется одобрение <span>на другом устройстве</span>


pair-failure-header = Сопряжение не удалось
pair-failure-message = Процесс настройки был прерван.


pair-sync-header = Синхронизация { -brand-firefox } на вашем телефоне или планшете
pair-cad-header = Подключиться к { -brand-firefox } на другом устройстве
pair-already-have-firefox-paragraph = Уже установили { -brand-firefox } на свой телефон или планшет?
pair-sync-your-device-button = Синхронизируйте своё устройство
pair-or-download-subheader = или скачайте
pair-scan-to-download-message = Отсканируйте, чтобы скачать { -brand-firefox } для мобильных устройств, или отправьте себе <linkExternal>ссылку на скачивание</linkExternal>.
pair-not-now-button = Не сейчас
pair-take-your-data-message = Берите вкладки, закладки и пароли с собой везде, где используете { -brand-firefox }.
pair-get-started-button = Начать
pair-qr-code-aria-label = QR-код


pair-success-header-2 = Устройство подключено
pair-success-message-2 = Сопряжение прошло успешно.


pair-supp-allow-heading-text = Подтвердите сопряжение <span>для { $email }</span>
pair-supp-allow-confirm-button = Подтвердить сопряжение
pair-supp-allow-cancel-link = Отмена


pair-wait-for-auth-heading-text = Теперь требуется подтверждение <span>на другом устройстве</span>


pair-unsupported-header = Сопряжение с помощью приложения
pair-unsupported-message = Вы использовали системную камеру? Вы должны выполнить сопряжение в приложении { -brand-firefox }.




set-password-heading-v2 = Создайте пароль для синхронизации
set-password-info-v2 = Это зашифрует ваши данные. Он должен отличаться от пароля вашего аккаунта { -brand-google } или { -brand-apple }.


third-party-auth-callback-message = Подождите, вас перенаправят в авторизованное приложение.


account-recovery-confirm-key-heading = Введите ключ восстановления аккаунта
account-recovery-confirm-key-instruction = Этот ключ восстанавливает ваши зашифрованные данные просмотра, такие как пароли и закладки, с серверов { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = Введите 32-значный ключ восстановления аккаунта
account-recovery-confirm-key-hint = Ваша подсказка хранилища:
account-recovery-confirm-key-button-2 = Продолжить
account-recovery-lost-recovery-key-link-2 = Не можете найти ключ восстановления своего аккаунта?


complete-reset-pw-header-v2 = Создать новый пароль
complete-reset-password-success-alert = Пароль установлен
complete-reset-password-error-alert = К сожалению, при установке вашего пароля возникла проблема
complete-reset-pw-recovery-key-link = Использовать ключ восстановления аккаунта
reset-password-complete-banner-heading = Ваш пароль был сброшен.
reset-password-complete-banner-message = Не забудьте сгенерировать новый ключ восстановления аккаунта в настройках { -product-mozilla-account(case: "genitive") }, чтобы избежать проблем со входом в систему в будущем.
complete-reset-password-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.


confirm-backup-code-reset-password-input-label = Введите 10-значный код
confirm-backup-code-reset-password-confirm-button = Подтвердить
confirm-backup-code-reset-password-subheader = Введите резервный код аутентификации
confirm-backup-code-reset-password-instruction = Введите один из одноразовых кодов, которые вы сохранили при настройке двухэтапной аутентификации.
confirm-backup-code-reset-password-locked-out-link = Аккаунт заблокирован?


confirm-reset-password-with-code-heading = Проверьте свою электронную почту
confirm-reset-password-with-code-instruction = Мы отправили код подтверждения на <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = Введите 8-значный код в течение 10 минут
confirm-reset-password-otp-submit-button = Продолжить
confirm-reset-password-otp-resend-code-button = Отправить код ещё раз
confirm-reset-password-otp-different-account-link = Использовать другой аккаунт


confirm-totp-reset-password-header = Сбросить ваш пароль
confirm-totp-reset-password-subheader-v2 = Введите код двухэтапной аутентификации
confirm-totp-reset-password-instruction-v2 = Зайдите в <strong>приложение-аутентификатор</strong>, чтобы сбросить пароль.
confirm-totp-reset-password-trouble-code = Проблемы с вводом кода?
confirm-totp-reset-password-confirm-button = Подтвердить
confirm-totp-reset-password-input-label-v2 = Введите код из 6 цифр
confirm-totp-reset-password-use-different-account = Использовать другой аккаунт


password-reset-flow-heading = Сбросить пароль
password-reset-body-2 = Мы спросим пару вещей, которые знаете только вы, чтобы ваш профиль был в безопасности.
password-reset-email-input =
    .label = Введите ваш адрес эл. почты
password-reset-submit-button-2 = Продолжить


reset-password-complete-header = Ваш пароль был сброшен
reset-password-confirmed-cta = Перейти к { $serviceName }




password-reset-recovery-method-header = Сбросить пароль
password-reset-recovery-method-subheader = Выберите метод восстановления
password-reset-recovery-method-details = Давайте удостоверимся, что это вы используете ваши методы восстановления.
password-reset-recovery-method-phone = Телефон для восстановления
password-reset-recovery-method-code = Резервные коды аутентификации
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] Остался { $numBackupCodes } код
        [few] Осталось { $numBackupCodes } кодов
       *[many] Осталось { $numBackupCodes } кодов
    }
password-reset-recovery-method-send-code-error-heading = При отправке кода на ваш телефон восстановления возникла проблема
password-reset-recovery-method-send-code-error-description = Пожалуйста, попробуйте ещё раз позже или используйте ваши резервные коды аутентификации.


reset-password-recovery-phone-flow-heading = Сбросить пароль
reset-password-recovery-phone-heading = Введите код восстановления
reset-password-recovery-phone-instruction-v3 = 6-значный код был отправлен на номер телефона, заканчивающийся на <span>{ $lastFourPhoneDigits }</span>, в текстовом сообщении. Срок действия этого кода истекает через 5 минут. Не делитесь этим кодом ни с кем.
reset-password-recovery-phone-input-label = Введите код из 6 цифр
reset-password-recovery-phone-code-submit-button = Подтвердить
reset-password-recovery-phone-resend-code-button = Отправить код ещё раз
reset-password-recovery-phone-resend-success = Код отправлен
reset-password-recovery-phone-locked-out-link = Аккаунт заблокирован?
reset-password-recovery-phone-send-code-error-heading = При отправке кода возникла проблема
reset-password-recovery-phone-code-verification-error-heading = При проверке вашего кода возникла проблема
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


error-label = Ошибка:
validating-signin = Проверка входа…
complete-signin-error-header = Ошибка подтверждения
signin-link-expired-header = Срок действия ссылки для подтверждения истёк
signin-link-expired-message-2 = Срок действия ссылки, на которую вы нажали, истёк или она уже была использована.


signin-password-needed-header-2 = Введите свой пароль <span>для вашего { -product-mozilla-account(case: "genitive") }</span>
signin-subheader-without-logo-with-servicename = Перейти к { $serviceName }
signin-subheader-without-logo-default = Перейти к настройкам аккаунта
signin-button = Войти
signin-header = Войти
signin-use-a-different-account-link = Использовать другой аккаунт
signin-forgot-password-link = Забыли пароль?
signin-password-button-label = Пароль
signin-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.
signin-code-expired-error = Срок действия кода истёк. Пожалуйста, войдите снова.
signin-account-locked-banner-heading = Сбросить пароль
signin-account-locked-banner-description = Мы заблокировали ваш аккаунт, чтобы защитить его от подозрительной активности.
signin-account-locked-banner-link = Сбросьте ваш пароль для входа


report-signin-link-damaged-body = В ссылке, по которой вы щёлкнули, отсутствуют символы, и возможно она была повреждена вашим почтовым клиентом. Внимательно скопируйте адрес и попробуйте ещё раз.
report-signin-header = Сообщить о несанкционированном входе?
report-signin-body = Вы получили письмо о попытке доступа к вашему аккаунту. Хотите ли вы сообщить об этой подозрительной активности?
report-signin-submit-button = Сообщить о подозрительной активности
report-signin-support-link = Почему это происходит?
report-signin-error = К сожалению, при отправке сообщения возникла проблема.
signin-bounced-header = Извините. Мы заблокировали ваш аккаунт.
signin-bounced-message = Письмо для подтверждения, которое мы отправили на { $email }, было возвращено, и мы заблокировали ваш аккаунт, чтобы защитить ваши данные { -brand-firefox }.
signin-bounced-help = Если это действительный адрес электронной почты, <linkExternal>сообщите нам об этом</linkExternal>, и мы поможем разблокировать ваш аккаунт.
signin-bounced-create-new-account = Больше не владеете этой электронной почтой? Создайте новый аккаунт
back = Назад


signin-push-code-heading-w-default-service = Подтвердите этот логин <span>для перехода к настройкам аккаунта</span>
signin-push-code-heading-w-custom-service = Подтвердите этот логин <span>для перехода к { $serviceName }</span>
signin-push-code-instruction = Пожалуйста, проверьте другие свои устройства и подтвердите этот вход из браузера { -brand-firefox }.
signin-push-code-did-not-recieve = Не получили уведомление?
signin-push-code-send-email-link = Код из эл. почты


signin-push-code-confirm-instruction = Подтвердите ваш логин
signin-push-code-confirm-description = Мы обнаружили попытку входа со следующего устройства. Если это были вы, пожалуйста, подтвердите вход
signin-push-code-confirm-verifying = Проверка
signin-push-code-confirm-login = Подтвердить вход
signin-push-code-confirm-wasnt-me = Это был не я, сменить пароль.
signin-push-code-confirm-login-approved = Ваш логин был одобрен. Пожалуйста, закройте это окно.
signin-push-code-confirm-link-error = Ссылка повреждена. Повторите попытку.


signin-recovery-method-header = Войти
signin-recovery-method-subheader = Выберите метод восстановления
signin-recovery-method-details = Давайте удостоверимся, что это вы используете ваши методы восстановления.
signin-recovery-method-phone = Телефон для восстановления
signin-recovery-method-code-v2 = Резервные коды аутентификации
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] Остался { $numBackupCodes } код
        [few] Осталось { $numBackupCodes } кода
       *[many] Осталось { $numBackupCodes } кодов
    }
signin-recovery-method-send-code-error-heading = При отправке кода на ваш телефон восстановления возникла проблема
signin-recovery-method-send-code-error-description = Пожалуйста, попробуйте ещё раз позже или используйте ваши резервные коды аутентификации.


signin-recovery-code-heading = Войти
signin-recovery-code-sub-heading = Введите резервный код аутентификации
signin-recovery-code-instruction-v3 = Введите один из одноразовых кодов, которые вы сохранили при настройке двухэтапной аутентификации.
signin-recovery-code-input-label-v2 = Введите 10-значный код
signin-recovery-code-confirm-button = Подтвердить
signin-recovery-code-phone-link = Использовать телефон для восстановления
signin-recovery-code-support-link = Аккаунт заблокирован?
signin-recovery-code-required-error = Требуется резервный код аутентификации
signin-recovery-code-use-phone-failure = При отправке кода на ваш телефон восстановления возникла проблема
signin-recovery-code-use-phone-failure-description = Пожалуйста, попробуйте позже.


signin-recovery-phone-flow-heading = Войти
signin-recovery-phone-heading = Введите код восстановления
signin-recovery-phone-instruction-v3 = Шестизначный код был отправлен в текстовом сообщении на номер телефона, заканчивающийся на <span>{ $lastFourPhoneDigits }</span>. Срок действия этого кода истекает через 5 минут. Не делитесь этим кодом ни с кем.
signin-recovery-phone-input-label = Введите код из 6 цифр
signin-recovery-phone-code-submit-button = Подтвердить
signin-recovery-phone-resend-code-button = Отправить код ещё раз
signin-recovery-phone-resend-success = Код отправлен
signin-recovery-phone-locked-out-link = Аккаунт заблокирован?
signin-recovery-phone-send-code-error-heading = При отправке кода возникла проблема
signin-recovery-phone-code-verification-error-heading = При проверке вашего кода возникла проблема
signin-recovery-phone-general-error-description = Пожалуйста, попробуйте позже.
signin-recovery-phone-invalid-code-error-description = Код неверен или просрочен.
signin-recovery-phone-invalid-code-error-link = Использовать резервные коды аутентификации?
signin-recovery-phone-success-message = Вход был успешно выполнен. Если вы используете ваш номер телефона снова, то могут быть наложены ограничения.


signin-reported-header = Спасибо за вашу бдительность
signin-reported-message = Наша команда оповещена. Ваши сообщения помогают нам бороться со злоумышленниками.


signin-token-code-heading-2 = Введите код подтверждения<span> для вашего { -product-mozilla-account(case: "genitive") }</span>
signin-token-code-instruction-v2 = Введите код, отправленный на <email>{ $email }</email>, в течение 5 минут.
signin-token-code-input-label-v2 = Введите код из 6 цифр
signin-token-code-confirm-button = Подтвердить
signin-token-code-code-expired = Срок действия кода истёк?
signin-token-code-resend-code-link = Отправить новый код по электронной почте.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] Отправить почтой новый код через { $seconds } секунду
        [few] Отправить почтой новый код через { $seconds } секунды
       *[many] Отправить почтой новый код через { $seconds } секунд
    }
signin-token-code-required-error = Требуется код подтверждения
signin-token-code-resend-error = Что-то пошло не так. Не удалось отправить новый код.
signin-token-code-instruction-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.


signin-totp-code-header = Войти
signin-totp-code-subheader-v2 = Введите код двухэтапной аутентификации
signin-totp-code-instruction-v4 = Проверьте своё <strong>приложение-аутентификатор</strong>, чтобы подтвердить свой вход.
signin-totp-code-input-label-v4 = Введите код из 6 цифр
signin-totp-code-aal-banner-header = Почему вас просят пройти аутентификацию?
signin-totp-code-aal-banner-content = Вы настроили двухэтапную аутентификацию в своём аккаунте, но ещё не входили с кодом на этом устройстве.
signin-totp-code-aal-sign-out = Выйти на этом устройстве
signin-totp-code-aal-sign-out-error = К сожалению, при выходе возникла проблема
signin-totp-code-confirm-button = Подтвердить
signin-totp-code-other-account-link = Использовать другой аккаунт
signin-totp-code-recovery-code-link = Проблемы с вводом кода?
signin-totp-code-required-error = Требуется код аутентификации
signin-totp-code-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.


signin-unblock-header = Разрешить этот вход
signin-unblock-body = Проверьте свой почтовый ящик на наличие кода авторизации, отправленного на { $email }.
signin-unblock-code-input = Введите код авторизации
signin-unblock-submit-button = Продолжить
signin-unblock-code-required-error = Требуется ввести код авторизации
signin-unblock-code-incorrect-length = Код авторизации должен содержать 8 символов
signin-unblock-code-incorrect-format-2 = Код авторизации может содержать только буквы и/или цифры
signin-unblock-resend-code-button = Нет в папке «Входящие» или «Спам»? Отправить снова
signin-unblock-support-link = Почему это происходит?
signin-unblock-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.




confirm-signup-code-page-title = Введите код подтверждения
confirm-signup-code-heading-2 = Введите код подтверждения <span>для вашего { -product-mozilla-account(case: "genitive") }</span>
confirm-signup-code-instruction-v2 = Введите код, отправленный на <email>{ $email }</email>, в течение 5 минут.
confirm-signup-code-input-label = Введите код из 6 цифр
confirm-signup-code-confirm-button = Подтвердить
confirm-signup-code-sync-button = Начать синхронизацию
confirm-signup-code-code-expired = Срок действия кода истёк?
confirm-signup-code-resend-code-link = Отправить новый код по электронной почте.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] Отправить почтой новый код через { $seconds } секунду
        [few] Отправить почтой новый код через { $seconds } секунды
       *[many] Отправить почтой новый код через { $seconds } секунд
    }
confirm-signup-code-success-alert = Аккаунт успешно подтверждён
confirm-signup-code-is-required-error = Требуется код подтверждения
confirm-signup-code-desktop-relay = { -brand-firefox } попытается отправить вас обратно, чтобы вы использовали псевдоним электронной почты после входа.


signup-heading-v2 = Создать пароль
signup-relay-info = Пароль необходим для безопасного управления замаскированными адресами электронной почты и доступа к инструментам безопасности { -brand-mozilla }.
signup-sync-info = Синхронизируйте ваши пароли, закладки и пр., где бы вы ни использовали { -brand-firefox }.
signup-sync-info-with-payment = Синхронизируйте ваши пароли, способы оплаты, закладки и пр., где бы вы ни использовали { -brand-firefox }.
signup-change-email-link = Сменить адрес электронной почты


signup-confirmed-sync-header = Синхронизация включена
signup-confirmed-sync-success-banner = { -product-mozilla-account(case: "nominative_uppercase") } подтверждён
signup-confirmed-sync-button = Начать веб-сёрфинг
signup-confirmed-sync-description-with-payment-v2 = Ваши пароли, способы оплаты, адреса, закладки, история и пр. могут синхронизироваться везде, где вы используете { -brand-firefox }.
signup-confirmed-sync-description-v2 = Ваши пароли, адреса, закладки, история и пр. могут синхронизироваться везде, где вы используете { -brand-firefox }.
signup-confirmed-sync-add-device-link = Добавить другое устройство
signup-confirmed-sync-manage-sync-button = Управление синхронизацией
signup-confirmed-sync-set-password-success-banner = Пароль синхронизации создан
