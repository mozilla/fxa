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
cancellationSurvey = Будь ласка, допоможіть вдосконалити наші послуги, долучившись до цього <a data-l10n-name="cancellationSurveyUrl">простого опитування</a>.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = Будь ласка, допоможіть нам вдосконалити наші послуги, взявши участь в цьому швидкому опитуванні:
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
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = Переглянути рахунок: { $invoiceLink }
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
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = Вашу передплату { $productName } було скасовано
subscriptionAccountDeletion-title = Шкода, що ви йдете
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = Ви нещодавно видалили свій { -product-mozilla-account }, тому ми скасували вашу передплату { $productName }. Ваш останній рахунок на суму { $invoiceTotal } був сплачений { $invoiceDateOnly }.
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
subscriptionsPaymentProviderCancelled-subject = Для передплат { -brand-mozilla } необхідно оновити платіжну інформацію
subscriptionsPaymentProviderCancelled-title = Перепрошуємо, але у нас виникли проблеми з вашим способом оплати
subscriptionsPaymentProviderCancelled-content-detected = Ми виявили проблему з вашим способом оплати для таких передплат.
