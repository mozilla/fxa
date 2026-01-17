## Non-email strings

session-verify-send-push-title-2 = Уваходзіце ў { -product-mozilla-account }?
session-verify-send-push-body-2 = Націсніце тут, каб пацвердзіць, што гэта вы
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } — гэта ваш код пацверджання { -brand-mozilla }. Тэрмін дзеяння мінае праз 5 хвілін.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = Код пацверджання { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } — гэта ваш код аднаўлення { -brand-mozilla }. Тэрмін дзеяння 5 хвілін.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = Код { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } — гэта ваш код аднаўлення { -brand-mozilla }. Тэрмін дзеяння 5 хвілін.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = Код { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="Лагатып { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Сінхранізацыя прылад">
body-devices-image = <img data-l10n-name="devices-image" alt="Прылады">
fxa-privacy-url = Палітыка прыватнасці { -brand-mozilla }
moz-accounts-privacy-url-2 = Паведамленне аб прыватнасці { -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = Умовы выкарыстання { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="Лагатып { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="Лагатып { -brand-mozilla }">
subplat-automated-email = Гэты электронны ліст створаны аўтаматычна; калі вы атрымалі яго памылкова, нічога не трэба рабіць.
subplat-privacy-notice = Паведамленне аб прыватнасці
subplat-privacy-plaintext = Паведамленне аб прыватнасці:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = Вы атрымалі гэты ліст, таму што { $email } звязаны з { -product-mozilla-account } і вы зарэгістраваліся ў { $productName }.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = Вы атрымалі гэты ліст, таму што { $email } звязаны з { -product-mozilla-account }.
subplat-explainer-multiple-2 = Вы атрымалі гэты ліст, таму што { $email } звязаны з { -product-mozilla-account } і вы падпісаліся на некалькі прадуктаў.
subplat-explainer-was-deleted-2 = Вы атрымалі гэты ліст, таму што на { $email } быў зарэгістраваны { -product-mozilla-account }.
subplat-manage-account-2 = Кіруйце наладамі { -product-mozilla-account } са сваёй <a data-l10n-name="subplat-account-page">старонкі ўліковага запісу</a>.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = Кіруйце наладамі { -product-mozilla-account }, наведаўшы старонку свайго ўліковага запісу: { $accountSettingsUrl }
subplat-terms-policy = Умовы і палітыка адмовы ад паслуг
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = Ануляваць падпіску
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = Паўторна актываваць падпіску
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = Абнавіць плацежную інфармацыю
subplat-privacy-policy = Палітыка прыватнасці { -brand-mozilla }
subplat-privacy-policy-2 = Паведамленне аб прыватнасці { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = Умовы выкарыстання { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = Прававыя звесткі
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = Прыватнасць
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = Калі ваш уліковы запіс будзе выдалены, вы ўсё роўна будзеце атрымліваць электронныя лісты ад Mozilla Corporation і Mozilla Foundation, калі вы не <a data-l10n-name="unsubscribeLink">папросіце адпісацца</a>.
account-deletion-info-block-support = Калі ў вас ёсць якія-небудзь пытанні ці вам патрэбна дапамога, звяжыцеся з нашай <a data-l10n-name="supportLink">службай падтрымкі</a>.
account-deletion-info-block-communications-plaintext = Калі ваш уліковы запіс будзе выдалены, вы ўсё роўна будзеце атрымліваць электронныя лісты ад Mozilla Corporation і Mozilla Foundation, калі вы не папросіце адпісацца:
account-deletion-info-block-support-plaintext = Калі ў вас ёсць якія-небудзь пытанні ці вам патрэбна дапамога, не саромейцеся звяртацца ў нашу службу падтрымкі:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="Сцягнуць { $productName } з { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="Сцягнуць { $productName } з { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = Усталюйце { $productName } на <a data-l10n-name="anotherDeviceLink">іншы камп'ютар</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = Усталюйце { $productName } на <a data-l10n-name="anotherDeviceLink">іншую прыладу</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = Атрымайце { $productName } у Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = Спампуйце { $productName } з App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = Усталюйце { $productName } на іншую прыладу:
automated-email-change-2 = Калі вы гэтага не рабілі, неадкладна <a data-l10n-name="passwordChangeLink">змяніце свой пароль</a>.
automated-email-support = Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">падтрымку { -brand-mozilla }</a>.
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = Калі вы не рабілі гэтага дзеяння, неадкладна змяніце пароль:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = Для атрымання дадатковай інфармацыі наведайце старонку падтрымкі { -brand-mozilla }:
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">падтрымку { -brand-mozilla }</a>.
automated-email-no-action-plaintext = Гэта аўтаматычна створанае паведамленне. Калі вы атрымалі яго памылкова, вам не трэба нічога рабіць.
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = Гэта аўтаматычна створаны ліст; калі вы не здзяйснялі гэтага дзеяння, калі ласка, змяніце свой пароль:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = Гэты запыт прыйшоў з { $uaBrowser } на { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = Гэты запыт прыйшоў з { $uaBrowser } на { $uaOS }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = Гэты запыт прыйшоў ад { $uaBrowser }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = Гэты запыт прыйшоў ад { $uaOS } { $uaOSVersion }.
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = Гэты запыт прыйшоў ад { $uaOS }.
automatedEmailRecoveryKey-more-info = Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">падтрымку { -brand-mozilla }</a>.
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = Гэты запыт паступіў ад:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = Калі гэта былі не вы, выдаліце новы ключ:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = Калі гэта былі не вы, змяніце пароль:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = і змяніць свой пароль:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = Для атрымання дадатковай інфармацыі наведайце старонку падтрымкі { -brand-mozilla }:
automated-email-reset =
    Гэта аўтаматычна створаны ліст; калі вы не здзяйснялі гэтага дзеяння, калі ласка, <a data-l10n-name="resetLink">скіньце свой пароль</a>.
    Для атрымання дадатковай інфармацыі наведайце <a data-l10n-name="supportLink">Сайт падтрымкі { -brand-mozilla }</a>.
cancellationSurvey = Калі ласка, дапамажыце нам палепшыць нашы паслугі, прыняўшы ўдзел у гэтым <a data-l10n-name="cancellationSurveyUrl">кароткім апытанні</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Калі ласка, дапамажыце нам палепшыць нашы паслугі, узяўшы ўдзел у гэтым кароткім апытанні:
change-password-plaintext = Калі вы падазраяце, што хтосьці спрабуе атрымаць доступ да вашага ўліковага запісу, калі ласка, змяніце пароль.
manage-account = Кіраванне ўліковым запісам
manage-account-plaintext = { manage-account }:
payment-details = Рэквізіты аплаты:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = Нумар рахунка-фактуры: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = Спагнана: { $invoiceTotal } { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = Наступны рахунак-фактура: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = Прамежкавы вынік: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-discount = Зніжка
subscription-charges-discount-plaintext = Зніжка: { $invoiceDiscountAmount }
subscription-charges-taxes = Падаткі і зборы
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = Падаткі і зборы: { $invoiceTaxAmount }

##

subscriptionSupport = Пытанні наконт вашай падпіскі? Наша <a data-l10n-name="subscriptionSupportUrl">служба падтрымкі</a> тут, каб дапамагчы вам.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = Пытанні наконт вашай падпіскі? Наша служба падтрымкі тут, каб дапамагчы вам:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = Дзякуй за падпіску на { $productName }. Калі ў вас ёсць якія-небудзь пытанні адносна вашай падпісцы або патрэбна дадатковая інфармацыя пра { $productName }, калі ласка, <a data-l10n-name="subscriptionSupportUrl">звяжыцеся з намі</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = Дзякуй за падпіску на { $productName }. Калі ў вас ёсць якія-небудзь пытанні адносна вашай падпісцы або патрэбна дадатковая інфармацыя пра { $productName }, калі ласка, звяжыцеся з намі:
subscriptionUpdateBillingEnsure = Вы можаце праверыць актуальнасць вашага спосабу аплаты і інфармацыі ўліковага запісу <a data-l10n-name="updateBillingUrl">тут</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = Вы можаце праверыць актуальнасць вашага спосабу аплаты і даных уліковага запісу тут:
subscriptionUpdateBillingTry = Мы паспрабуем здзейсніць ваш плацеж зноў на працягу наступных некалькіх дзён, але вам, магчыма, давядзецца дапамагчы нам выправіць гэта, <a data-l10n-name="updateBillingUrl">абнавіўшы вашу плацежную інфармацыю</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = Мы паспрабуем здзейсніць ваш плацеж зноў на працягу наступных некалькіх дзён, але вам, магчыма, давядзецца дапамагчы нам выправіць гэта, абнавіўшы вашу плацежную інфармацыю:
subscriptionUpdatePayment = Каб прадухіліць перарыванні ў рабоце вашай службы, <a data-l10n-name="updateBillingUrl">абнавіце сваю плацежную інфармацыю</a> як мага хутчэй:
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = Каб прадухіліць перарыванні ў рабоце вашай службы, абнавіце сваю плацежную інфармацыю як мага хутчэй:
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
view-invoice-plaintext = Праглядзець рахунак-фактуру: { $invoiceLink }
cadReminderFirst-subject-1 = Напамін! Давайце сінхранізуем { -brand-firefox }
cadReminderFirst-action = Сінхранізаваць іншую прыладу
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = Для сінхранізацыі патрэбна дзве прылады
cadReminderSecond-subject-2 = Не прапусціце! Давайце скончым наладку сінхранізацыі
cadReminderSecond-action = Сінхранізаваць іншую прыладу
cadReminderSecond-title-2 = Не забудзьцеся сінхранізаваць!
cadReminderSecond-description-sync = Сінхранізуйце свае закладкі, паролі, адкрытыя карткі і многае іншае — усюды, дзе вы карыстаецеся { -brand-firefox }.
cadReminderSecond-description-plus = Акрамя таго, вашы даныя заўсёды зашыфраваны. Толькі вы і вашы давераныя прылады змогуць іх убачыць.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = Вітаем у { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = Вітаем у { $productName }
downloadSubscription-content-2 = Давайце пачнём выкарыстоўваць усе функцыі, уключаныя ў вашу падпіску:
downloadSubscription-link-action-2 = Пачаць
fraudulentAccountDeletion-subject-2 = Ваш { -product-mozilla-account } быў выдалены
fraudulentAccountDeletion-title = Ваш уліковы запіс быў выдалены
fraudulentAccountDeletion-content-part1-v2 = Нядаўна з дапамогай гэтага адраса электроннай пошты быў створаны { -product-mozilla-account } і знята аплата за падпіску. Як і для ўсіх новых уліковых запісаў, мы папрасілі вас пацвердзіць адрас электроннай пошты.
fraudulentAccountDeletion-content-part2-v2 = Зараз мы бачым, што ўліковы запіс яшчэ не быў пацверджаны. Паколькі гэты крок не быў завершаны, мы не можам быць упэўненымі, што гэта была аўтарызаваная падпіска. У выніку гэтага { -product-mozilla-account }, зарэгістраваны на гэты адрас электроннай пошты, быў выдалены, а ваша падпіска — скасавана са зваротам усіх сродкаў.
fraudulentAccountDeletion-contact = Калі ў вас ёсць пытанні, звярніцеся да нашай <a data-l10n-name="mozillaSupportUrl">каманды падтрымкі</a>.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = Калі ў вас ёсць пытанні, звярніцеся да нашай каманды падтрымкі: { $mozillaSupportUrl }
inactiveAccountFinalWarning-preview = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountFirstWarning-action = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountFirstWarning-preview = Увайдзіце ў свой уліковы запіс, каб захаваць яго
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountSecondWarning-action = Увайдзіце ў свой уліковы запіс, каб захаваць яго
inactiveAccountSecondWarning-preview = Увайдзіце ў свой уліковы запіс, каб захаваць яго
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = У вас скончыліся рэзервовыя коды аўтэнтыфікацыі!
codes-reminder-title-one = Вы выкарыстоўваеце апошні рэзервовы код аўтэнтыфікацыі
codes-reminder-title-two = Час стварыць больш рэзервовых кодаў аўтэнтыфікацыі
codes-reminder-description-part-one = Рэзервовыя коды аўтэнтыфікацыі дапамогуць вам аднавіць вашу інфармацыю, калі вы забудзеце пароль.
codes-reminder-description-part-two = Стварыце новыя коды зараз, каб потым не страціць свае даныя.
codes-reminder-description-two-left = У вас засталося толькі два коды.
codes-reminder-description-create-codes = Стварыце новыя рэзервовыя коды аўтэнтыфікацыі, каб мець магчымасць увайсці ў свой уліковы запіс, калі вы заблакаваны.
lowRecoveryCodes-action-2 = Стварыць коды
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] Не засталося рэзервовых кодаў аўтэнтыфікацыі
        [one] Застаўся толькі 1 рэзервовы код аўтэнтыфікацыі!
        [few] Засталося толькі { $numberRemaining } рэзервовых кодаў аўтэнтыфікацыі!
       *[many] Засталося толькі { $numberRemaining } рэзервовых кодаў аўтэнтыфікацыі!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = Новы ўваход у { $clientName }
newDeviceLogin-subjectForMozillaAccount = Новы ўваход у ваш { -product-mozilla-account }
newDeviceLogin-title-3 = Ваш { -product-mozilla-account } быў выкарыстаны для ўваходу
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = Гэта былі не вы? <a data-l10n-name="passwordChangeLink">Змяніце свой пароль</a>.
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = Гэта былі не вы? Змяніце свой пароль:
newDeviceLogin-action = Кіраванне ўліковым запісам
passwordChanged-subject = Пароль абноўлены
passwordChanged-title = Пароль паспяхова зменены
passwordChangeRequired-subject = Выяўлена падазроная актыўнасць
passwordChangeRequired-preview = Неадкладна змяніце пароль
passwordChangeRequired-title-2 = Скінуць пароль
passwordChangeRequired-action = Скінуць пароль
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = Выкарыстайце { $code }, каб змяніць пароль
password-forgot-otp-title = Забылі свой пароль?
password-forgot-otp-request = Мы атрымалі запыт на змену пароля для вашага { -product-mozilla-account } ад:
password-forgot-otp-expiry-notice = Гэты код дзейнічае 10 хвілін
passwordReset-subject-2 = Ваш пароль быў скінуты
passwordReset-title-2 = Ваш пароль быў скінуты
passwordResetAccountRecovery-subject-2 = Ваш пароль быў скінуты
passwordResetAccountRecovery-title-3 = Ваш пароль быў скінуты
passwordResetAccountRecovery-action-4 = Кіраваць уліковым запісам
passwordResetRecoveryPhone-action = Кіраванне ўліковым запісам
passwordResetWithRecoveryKeyPrompt-subject = Ваш пароль быў скінуты
passwordResetWithRecoveryKeyPrompt-title = Ваш пароль быў скінуты
postAddAccountRecovery-subject-3 = Створаны новы ключ аднаўлення ўліковага запісу
postAddAccountRecovery-title2 = Вы стварылі новы ключ аднаўлення ўліковага запісу
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = Захавайце гэты ключ у надзейным месцы — ён спатрэбіцца вам для аднаўлення зашыфраваных звестак аглядання, калі вы забудзеце пароль.
postAddAccountRecovery-action = Кіраванне ўліковым запісам
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = Уліковы запіс { $providerName } быў звязаны з вашым { -product-mozilla-account }
postAddLinkedAccount-action = Кіраваць уліковым запісам
postAddRecoveryPhone-preview = Уліковы запіс абаронены двухэтапнай аўтэнтыфікацыяй
postAddRecoveryPhone-title-v2 = Вы дадалі нумар тэлефона для аднаўлення
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = Вы дадалі { $maskedLastFourPhoneNumber } у якасці нумара тэлефона для аднаўлення
postAddRecoveryPhone-enabled-device = Вы ўключылі яе з:
postAddRecoveryPhone-action = Кіраванне ўліковым запісам
postAddTwoStepAuthentication-title-2 = Вы ўключылі двухэтапную аўтэнтыфікацыю
postAddTwoStepAuthentication-action = Кіраванне ўліковым запісам
postChangeAccountRecovery-subject = Ключ аднаўлення ўліковага запісу зменены
postChangeAccountRecovery-body-part2 = Захавайце гэты новы ключ у надзейным месцы — ён спатрэбіцца вам для аднаўлення зашыфраваных звестак аглядання, калі вы забудзеце пароль.
postChangeAccountRecovery-action = Кіраванне ўліковым запісам
postChangePrimary-subject = Асноўны адрас эл.пошты зменены
postChangePrimary-title = Новы асноўны адрас эл.пошты
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = Вы паспяхова змянілі свой асноўны адрас электроннай пошты на { $email }. Гэты адрас цяпер - ваша імя карыстальніка пры ўваходзе ў ваш уліковы запіс { -product-mozilla-account }, а таксама для атрымання абвестак бяспекі
postChangePrimary-action = Кіраванне ўліковым запісам
postChangeTwoStepAuthentication-action = Кіраваць уліковым запісам
postConsumeRecoveryCode-action = Кіраванне ўліковым запісам
postNewRecoveryCodes-subject-2 = Створаны новыя рэзервовыя коды аўтэнтыфікацыі
postNewRecoveryCodes-title-2 = Вы стварылі новыя рэзервовыя коды аўтэнтыфікацыі
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = Яны былі створаны на:
postNewRecoveryCodes-action = Кіраванне ўліковым запісам
postRemoveAccountRecovery-subject-2 = Ключ аднаўлення ўліковага запісу выдалены
postRemoveAccountRecovery-title-3 = Вы выдалілі ключ аднаўлення ўліковага запісу
postRemoveAccountRecovery-action = Кіраванне ўліковым запісам
postRemoveRecoveryPhone-subject = Нумар тэлефона для аднаўлення выдалены
postRemoveRecoveryPhone-title = Нумар тэлефона для аднаўлення выдалены
postRemoveRecoveryPhone-requested-device = Вы запыталі гэта з:
postRemoveSecondary-subject = Другі адрас эл.пошты выдалены
postRemoveSecondary-title = Другі адрас эл.пошты выдалены
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = Вы паспяхова выдалілі другі адрас { $secondaryEmail } з вашага ўліковага запісу { -product-mozilla-account }. Абвесткі бяспекі і пацвярджэнні ўваходу больш на гэты адрас дасылацца не будуць.
postRemoveSecondary-action = Кіраванне ўліковым запісам
postRemoveTwoStepAuthentication-subject-line-2 = Двухэтапная аўтарызацыя выключана
postRemoveTwoStepAuthentication-title-2 = Вы адключылі двухэтапную аўтэнтыфікацыю
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = Вы адключылі яе з:
postRemoveTwoStepAuthentication-action = Кіраванне ўліковым запісам
postRemoveTwoStepAuthentication-not-required-2 = Вам больш не трэба будзе ўводзіць коды бяспекі з праграмы аўтэнтыфікацыі пры ўваходзе.
postSigninRecoveryCode-preview = Пацвердзіце дзеянні ўліковага запісу
postSigninRecoveryCode-action = Кіраваць уліковым запісам
postSigninRecoveryPhone-preview = Пацвердзіце дзеянні ўліковага запісу
postSigninRecoveryPhone-action = Кіраваць уліковым запісам
postVerify-sub-title-3 = Мы рады вас бачыць!
postVerify-title-2 = Хочаце бачыць адну і тую ж картку на дзвюх прыладах?
postVerify-description-2 = Гэта лёгка! Проста ўсталюйце { -brand-firefox } на іншую прыладу і ўвайдзіце ў свой уліковы запіс для сінхранізацыі. Гэта як магія!
postVerify-sub-description = (Псст… Гэта таксама азначае, што вы можаце атрымаць свае закладкі, паролі і іншыя даныя { -brand-firefox } усюды, дзе вы ўвайшлі ў свой уліковы запіс.)
postVerify-subject-4 = Вітаем у { -brand-mozilla }!
postVerify-setup-2 = Злучыць іншую прыладу:
postVerify-action-2 = Злучыць іншую прыладу
postVerifySecondary-subject = Дададзены другі адрас эл.пошты
postVerifySecondary-title = Дададзены другі адрас эл.пошты
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = Вы паспяхова пацвердзілі другі адрас { $secondaryEmail } для вашага ўліковага запісу { -product-mozilla-account }. Абвесткі бяспекі і пацвярджэнні ўваходу цяпер будуць дасылацца на абодва адрасы электроннай пошты.
postVerifySecondary-action = Кіраванне ўліковым запісам
recovery-subject = Скінуць пароль
recovery-title-2 = Забылі свой пароль?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = Мы атрымалі запыт на змену пароля для вашага { -product-mozilla-account } ад:
recovery-new-password-button = Стварыце новы пароль, націснуўшы кнопку ніжэй. Тэрмін дзеяння гэтай спасылкі скончыцца на працягу наступнай гадзіны.
recovery-copy-paste = Стварыце новы пароль, скапіраваўшы і ўставіўшы прыведзены ніжэй URL-адрас у свой браўзер. Тэрмін дзеяння гэтай спасылкі скончыцца на працягу наступнай гадзіны.
recovery-action = Стварыць новы пароль
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Ваша падпіска на { $productName } была скасавана
subscriptionAccountDeletion-title = Шкада, што вы сыходзіце
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Вы нядаўняе выдалілі свой { -product-mozilla-account }. У выніку, мы скасавалі вашу падпіску на { $productName }. Ваш апошні плацеж у памеры { $invoiceTotal } быў зроблены { $invoiceDateOnly }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = Вітаем у { $productName }: Калі ласка, усталюйце пароль.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = Вітаем у { $productName }
subscriptionAccountFinishSetup-content-processing = Ваш плацеж апрацоўваецца. Гэта можа заняць да чатырох працоўных дзён. Ваша падпіска будзе аўтаматычна падаўжацца кожны разліковы перыяд, пакуль вы не вырашыце яе скасаваць.
subscriptionAccountFinishSetup-content-create-3 = Далей вы створыце пароль для { -product-mozilla-account }, каб пачаць выкарыстоўваць сваю новую падпіску.
subscriptionAccountFinishSetup-action-2 = Пачаць
subscriptionAccountReminderFirst-subject = Напамін: Скончыце наладку вашага ўліковага запісу
subscriptionAccountReminderFirst-title = Вы пакуль не можаце атрымаць доступ да сваёй падпіскі
subscriptionAccountReminderFirst-content-info-3 = Некалькі дзён таму вы стварылі { -product-mozilla-account }, але гэтак і не пацвердзілі яго. Мы спадзяемся, што вы скончыце наладу свайго ўліковага запісу, каб мець магчымасць карыстацца новай падпіскай.
subscriptionAccountReminderFirst-content-select-2 = Выберыце «Стварыць пароль», каб усталяваць новы пароль і скончыць пацвярджэнне ўліковага запісу.
subscriptionAccountReminderFirst-action = Стварыць пароль
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = Апошні напамін: Наладзьце свой уліковы запіс
subscriptionAccountReminderSecond-title-2 = Вітаем у { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = Некалькі дзён таму вы стварылі { -product-mozilla-account }, але гэтак і не пацвердзілі яго. Мы спадзяемся, што вы скончыце наладу свайго ўліковага запісу, каб мець магчымасць карыстацца новай падпіскай.
subscriptionAccountReminderSecond-content-select-2 = Выберыце «Стварыць пароль», каб усталяваць новы пароль і скончыць пацвярджэнне ўліковага запісу.
subscriptionAccountReminderSecond-action = Стварыць пароль
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = Ваша падпіска на { $productName } была скасавана
subscriptionCancellation-title = Шкада, што вы сыходзіце

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = Мы скасавалі вашу падпіску на { $productName }. Ваш апошні плацеж у памеры { $invoiceTotal } быў выплачаны { $invoiceDateOnly }.
subscriptionCancellation-outstanding-content-2 = Мы скасавалі вашу падпіску на { $productName }. Ваш апошні плацеж у памеры { $invoiceTotal } будзе выплачаны { $invoiceDateOnly }.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = Ваша абслугоўванне будзе працягвацца да канца вашага бягучага разліковага перыяду, да { $serviceLastActiveDateOnly }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = Вы перайшлі на { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = Вы паспяхова перайшлі з { $productNameOld } на { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = Пачынаючы з наступнага перыяду аплаты, ваш плацеж складзе { $paymentAmountNew } за { $productPaymentCycleNew } замест { $paymentAmountOld } за { $productPaymentCycleOld }. Адначасова вы таксама атрымаеце аднаразовы бонус у памеры { $paymentProrated } для пакрыцця ніжэйшага кошту за гэты { $productPaymentCycleOld }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = Калі вам будзе неабходна ўсталяваць новае праграмнае забеспячэнне, каб выкарыстоўваць { $productName }, вы атрымаеце асобны ліст з інструкцыямі па сцягванні.
subscriptionDowngrade-content-auto-renew = Ваша падпіска будзе аўтаматычна падаўжацца кожны плацежны перыяд, пакуль вы не вырашыце яе скасаваць.
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = Ваша падпіска на { $productName } была скасавана
subscriptionFailedPaymentsCancellation-title = Ваша падпіска была скасавана
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = Мы скасавалі вашу падпіску на { $productName }, таму што некалькі спроб аплаты не ўдаліся. Каб зноў атрымаць доступ, стварыце новую падпіску з абноўленым спосабам аплаты.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = Аплата { $productName } пацверджана
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = Дзякуй за падпіску на { $productName }
subscriptionFirstInvoice-content-processing = Ваш плацеж зараз апрацоўваецца і гэта можа заняць да чатырох працоўных дзён.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = Вы атрымаеце асобны электронны ліст аб тым, як пачаць выкарыстоўваць { $productName }.
subscriptionFirstInvoice-content-auto-renew = Ваша падпіска будзе аўтаматычна падаўжацца кожны плацежны перыяд, пакуль вы не вырашыце яе скасаваць.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = Не атрымалася аплаціць { $productName }
subscriptionPaymentFailed-title = На жаль, у нас узнікла праблема з вашым плацяжом
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = У нас узніклі праблемы з вашым апошнім плацяжом за { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = Неабходна абнавіць плацежную інфармацыю для { $productName }
subscriptionPaymentProviderCancelled-title = На жаль, у нас узніклі праблемы з вашым спосабам аплаты
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = Мы выявілі праблему з вашым спосабам аплаты для { $productName }.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = Падпіска на { $productName } адноўлена
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = Дзякуй за аднаўленне вашай падпіскі на { $productName }!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = Ваш плацежны цыкл і памер плацяжу застануцца ранейшымі. Ваш наступны плацеж складзе { $invoiceTotal } і здзейсніцца { $nextInvoiceDateOnly }. Ваша падпіска будзе аўтаматычна падаўжацца кожны разліковы перыяд, пакуль вы не вырашыце яе скасаваць.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = Паведамленне пра аўтаматычнае падаўжэнне { $productName }
subscriptionRenewalReminder-title = Ваша падпіска хутка будзе падоўжана
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = Шаноўны кліент { $productName },
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = Ваша бягучая падпіска наладжана на аўтаматычнае падаўжэнне праз { $reminderLength } дзён. У азначаны час { -brand-mozilla } падоўжыць вашу падпіску на { $planIntervalCount } { $planInterval }, і спіша суму ў памеры { $invoiceTotal } з выкарыстаннем спосабу аплаты, абранага ў вашым уліковым запісе.
subscriptionRenewalReminder-content-closing = З павагай,
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = Каманда { $productName }
subscriptionsPaymentProviderCancelled-subject = Неабходна абнавіць плацежную інфармацыю для падпісак { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = На жаль, у нас узніклі праблемы з вашым спосабам аплаты
subscriptionsPaymentProviderCancelled-content-detected = Мы выявілі праблему з вашым спосабам аплаты для наступных падпісак.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = Плацеж { $productName } атрыманы
subscriptionSubsequentInvoice-title = Дзякуй за падпіску!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = Мы атрымалі ваш апошні плацеж за { $productName }.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = Вы перайшлі на { $productName }
subscriptionUpgrade-title = Дзякуй за абнаўленне!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = Ваша падпіска будзе аўтаматычна падаўжацца кожны плацежны перыяд, пакуль вы не вырашыце яе скасаваць.
unblockCode-title = Гэта вы ўваходзіце?
unblockCode-prompt = Калі так, вось код аўтарызацыі, які вам патрэбен:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = Калі так, вось код аўтарызацыі, які вам патрэбен: { $unblockCode }
unblockCode-report = Калі не, дапамажыце нам стрымліваць зламыснікаў і <a data-l10n-name="reportSignInLink">паведаміце нам аб гэтым.</a>
unblockCode-report-plaintext = Калі не, дапамажыце нам стрымліваць зламыснікаў і паведамце нам аб гэтым.
verificationReminderFinal-subject = Апошні напамін аб праверцы вашага ўліковага запісу
verificationReminderFinal-description-2 = Пару тыдняў таму вы стварылі { -product-mozilla-account }, але так і не пацвердзілі яго. У мэтах вашай бяспекі мы выдалім уліковы запіс, калі вы не пацвердзіце яго на працягу наступных 24 гадзін.
confirm-account = Пацвердзіць уліковы запіс
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = Не забудзьцеся пацвердзіць свой уліковы запіс
verificationReminderFirst-title-3 = Вітаем у { -brand-mozilla }!
verificationReminderFirst-description-3 = Некалькі дзён таму вы стварылі { -product-mozilla-account }, але так і не пацвердзілі яго. Калі ласка, пацвердзіце свой уліковы запіс на працягу наступных 15 дзён, інакш ён будзе аўтаматычна выдалены.
verificationReminderFirst-sub-description-3 = Не прапусціце браўзер, які ставіць вас і вашу прыватнасць на першае месца.
confirm-email-2 = Пацвердзіць уліковы запіс
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = Пацвердзіць уліковы запіс
verificationReminderSecond-subject-2 = Не забудзьцеся пацвердзіць свой уліковы запіс
verificationReminderSecond-title-3 = Не прапусціце { -brand-mozilla }!
verificationReminderSecond-description-4 = Некалькі дзён таму вы стварылі { -product-mozilla-account }, але так і не пацвердзілі яго. Калі ласка, пацвердзіце свой уліковы запіс на працягу наступных 10 дзён, інакш ён будзе аўтаматычна выдалены.
verificationReminderSecond-sub-description-2 = Станьце часткай нашай місіі па пераўтварэнні Інтэрнэту ў месца, адкрытае для ўсіх.
verificationReminderSecond-action-2 = Пацвердзіць уліковы запіс
verify-title-3 = Адкрыйце Інтэрнэт з дапамогай { -brand-mozilla }
verify-description-2 = Пацвердзіце свой уліковы запіс і атрымайце максімальную аддачу ад { -brand-mozilla } усюды, дзе ўвайшлі, пачынаючы з:
verify-subject = Скончыце стварэнне ўліковага запісу
verify-action-2 = Пацвердзіць уліковы запіс
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = Вы ўваходзілі ў { $clientName }?
verifyLogin-description-2 = Дапамажыце нам захаваць ваш уліковы запіс у бяспецы, пацвердзіўшы, што вы ўвайшлі ў сістэму:
verifyLogin-subject-2 = Пацвердзіць уваход
verifyLogin-action = Пацвердзіць уваход
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = Вы ўвайшлі ў { $serviceName }?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = Дапамажыце нам захаваць ваш уліковы запіс у бяспецы, пацвердзіўшы, што вы ўвайшлі ў сістэму:
verifyLoginCode-prompt-3 = Калі так, вось ваш код аўтарызацыі:
verifyLoginCode-expiry-notice = Тэрмін яго дзеяння скончыцца праз 5 хвілін.
verifyPrimary-title-2 = Пацвердзіце асноўную электронную пошту
verifyPrimary-description = Запыт на змену ўліковага запісу быў зроблены з наступнай прылады:
verifyPrimary-subject = Пацвердзіце асноўную электронную пошту
verifyPrimary-action-2 = Пацвердзіце электронную пошту
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = Пасля пацверджання з гэтай прылады стануць магчымымі змены ўліковага запісу, такія як даданне другога адрасу электроннай пошты.
verifySecondaryCode-title-2 = Пацвердзіце альтэрнатыўную электронную пошту
verifySecondaryCode-action-2 = Пацвердзіце электронную пошту
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = Запыт на выкарыстанне { $email } у якасці другога адрасу электроннай пошты быў зроблены з наступнага { -product-mozilla-account }:
verifySecondaryCode-prompt-2 = Выкарыстайце гэты код пацверджання:
verifySecondaryCode-expiry-notice-2 = Яго тэрмін дзеяння мінае праз 5 хвілін. Пасля пацверджання, гэты адрас пачне атрымліваць абвесткі бяспекі і пацвярджэнні.
verifyShortCode-title-3 = Адкрыйце Інтэрнэт з дапамогай { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = Пацвердзіце свой уліковы запіс і атрымайце максімальную аддачу ад { -brand-mozilla } усюды, дзе ўвайшлі, пачынаючы з:
verifyShortCode-prompt-3 = Выкарыстайце гэты код пацверджання:
verifyShortCode-expiry-notice = Тэрмін яго дзеяння скончыцца праз 5 хвілін.
