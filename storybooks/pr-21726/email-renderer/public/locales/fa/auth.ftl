## Non-email strings

# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } کد تایید { -brand-mozilla } شما است. این کد در ۵ دقیقه منقضی می‌شود.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = کد تایید { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } کد بازیابی { -brand-mozilla } شما است. این کد در ۵ دقیقه منقضی می‌شود.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = کد { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } کد بازیابی { -brand-mozilla } شما است. این کد در ۵ دقیقه منقضی می‌شود.
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = کد { -brand-mozilla }: { $code }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="آرم { -brand-mozilla }">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="آرم { -brand-mozilla }">
subplat-automated-email = این ایمیل به صورت خودکار ارسال شده؛ اگر اشتباها آن را دریافت کرده‌اید، نیاز به انجام کار خاصی نیست.
subplat-privacy-notice = نکات حفظ حریم خصوصی
subplat-privacy-plaintext = نکات حفظ حریم خصوصی:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = شما این رایانامه را دریافت می‌کنید، زیرا { $email } یک { -product-mozilla-account } دارد و شما برای { $productName } نام‌نویسی کرده‌اید.
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = شما این رایانامه را دریافت می‌کنید، زیرا { $email } یک { -product-mozilla-account } دارد.
subplat-explainer-multiple-2 = شما این رایانامه را دریافت می‌کنید، زیرا { $email } یک { -product-mozilla-account } دارد و شما برای چندین محصول مشترک شده‌اید.
subplat-explainer-was-deleted-2 = شما این ایمیل را دریافت می‌کنید، زیرا { $email } برای یک { -product-mozilla-account } نام‌نویسی شده است.
subplat-manage-account-2 = تنظیمات { -product-mozilla-account } خود را با مراجعه به <a data-l10n-name="subplat-account-page">صفحه حساب کاربری</a> مدیریت کنید.
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = تنظیمات { -product-mozilla-account } خود را با مراجعه به صفحه حساب کاربری خود مدیریت کنید: { $accountSettingsUrl }
subplat-terms-policy = چگونگی و سیاست لغو
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = لغو اشتراک
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = فعال‌سازی دوبارهٔ اشتراک
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = اطلاعات صورتحساب را به‌روز کنید
subplat-privacy-policy = سیاست حفظ حریم خصوصی { -brand-mozilla }
subplat-privacy-policy-2 = { -product-mozilla-accounts(capitalization: "uppercase") } نکات حفظ محرمانگی
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = { -product-mozilla-accounts(capitalization: "uppercase") } شرایط ارائهٔ خدمات
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = ملاحظات حقوقی
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = محرمانگی
subplat-privacy-website-plaintext = { subplat-privacy }:
cancellationSurvey = لطفاً با شرکت در این <a data-l10n-name="cancellationSurveyUrl">نظرسنجی کوتاه</a> به ما کمک کنید خدماتمان را بهتر کنیم.
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = لطفاً با شرکت در این نظرسنجی کوتاه به ما کمک کنید خدماتمان را بهتر کنیم:
payment-details = جزئیات پرداخت:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = شماره فاکتور: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = مبلغ پرداخت‌شده: { $invoiceTotal } در تاریخ { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = فاکتور بعدی: { $nextInvoiceDateOnly }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider = <b>روش پرداخت:</b> { $paymentProviderName }
payment-method-payment-provider-plaintext = روش پرداخت: { $paymentProviderName }

## This string displays when the type of credit card is known
## https://stripe.com/docs/payments/cards/supported-card-brands
## Variables:
##  $cardName (String) - The brand name of the credit card, e.g. American Express
##  $lastFour (String) - The last four digits of the credit card, e.g. 5309

payment-provider-card-name-ending-in-plaintext = روش پرداخت: { $cardName } با شمارهٔ پایانی { $lastFour }
payment-provider-card-ending-in-plaintext = روش پرداخت: کارت با شمارهٔ پایانی { $lastFour }
payment-provider-card-ending-in = <b>روش پرداخت:</b> کارت با شمارهٔ پایانی { $lastFour }
payment-provider-card-ending-in-card-name = <b>روش پرداخت:</b> { $cardName } با شمارهٔ پایانی { $lastFour }
subscription-charges-invoice-summary = خلاصهٔ فاکتور

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

subscription-charges-invoice-number = <b>شمارهٔ فاکتور:</b> { $invoiceNumber }
subscription-charges-invoice-number-plaintext = شمارهٔ فاکتور: { $invoiceNumber }
subscription-charges-invoice-date = <b>تاریخ:</b> { $invoiceDateOnly }
subscription-charges-invoice-date-plaintext = تاریخ: { $invoiceDateOnly }
subscription-charges-prorated-price = قیمت به نسبت زمان
# $remainingAmountTotal (String) - The prorated amount of the subscription invoice, including currency, e.g. $4.00
subscription-charges-prorated-price-plaintext = قیمت به نسبت زمان: { $remainingAmountTotal }
subscription-charges-list-price = قیمت پایه
# $offeringPrice (String) - The list price of the subscription offering, including currency, e.g. $10.00
subscription-charges-list-price-plaintext = قیمت پایه: { $offeringPrice }
subscription-charges-credit-from-unused-time = اعتبار زمان استفاده‌نشده
# $unusedAmountTotal (String) - The credit amount from unused time of the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-from-unused-time-plaintext = اعتبار زمان استفاده‌نشده: { $unusedAmountTotal }
subscription-charges-subtotal = <b>جمع جزء</b>
# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = جمع جزء: { $invoiceSubtotal }

## $invoiceDiscountAmount (String) - The amount of the discount of the subscription invoice, including currency, e.g. $2.00
## $discountDuration - The duration of the discount in number of months, e.g. "3" if the discount is 3-months

subscription-charges-one-time-discount = تخفیف یک‌باره
subscription-charges-one-time-discount-plaintext = تخفیف یک‌باره: { $invoiceDiscountAmount }
subscription-charges-repeating-discount =
    { $discountDuration ->
       *[other] تخفیف { $discountDuration } ماهه
    }
subscription-charges-repeating-discount-plaintext =
    { $discountDuration ->
       *[other] تخفیف { $discountDuration } ماهه: { $invoiceDiscountAmount }
    }
subscription-charges-discount = تخفیف
subscription-charges-discount-plaintext = تخفیف: { $invoiceDiscountAmount }
subscription-charges-taxes = مالیات و هزینه‌ها
# $invoiceTaxAmount (String) - The amount of the tax of the subscription invoice, including currency, e.g. $2.00
subscriptionCharges-content-tax-plaintext = مالیات و هزینه‌ها: { $invoiceTaxAmount }
subscription-charges-total = <b>جمع کل</b>
# $invoiceTotal (String) - The total amount of the subscription invoice, including currency, e.g. $10.00
subscription-charges-total-plaintext = جمع کل: { $invoiceTotal }
subscription-charges-credit-applied = اعتبار اعمال‌شده
# $creditApplied (String) - The amount of credit applied to the subscription invoice, including currency, e.g. $2.00
subscription-charges-credit-applied-plaintext = اعتبار اعمال‌شده: { $creditApplied }
subscription-charges-amount-paid = <b>مبلغ پرداخت‌شده</b>
# $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied, including currency, e.g. $8.00
subscription-charges-amount-paid-plaintext = مبلغ پرداخت‌شده: { $invoiceAmountDue }
# $creditReceived (String) - The amount, after discount, of the subscription invoice, including currency, e.g. $8.00
subscription-charges-credit-received = { $creditReceived } اعتبار به حسابتان اضافه شد که در فاکتورهای آینده‌تان اعمال می‌شود.

##

subscriptionSupport = دربارهٔ اشتراکتان سؤالی دارید؟ <a data-l10n-name="subscriptionSupportUrl">تیم پشتیبانی</a> ما آمادهٔ کمک به شماست.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = دربارهٔ اشتراکتان سؤالی دارید؟ تیم پشتیبانی ما آمادهٔ کمک به شماست:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = از اینکه مشترک { $productName } شدید سپاسگزاریم. اگر دربارهٔ اشتراکتان سؤالی دارید یا اطلاعات بیشتری دربارهٔ { $productName } می‌خواهید، لطفاً <a data-l10n-name="subscriptionSupportUrl">با ما تماس بگیرید</a>.
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = از اینکه مشترک { $productName } شدید سپاسگزاریم. اگر دربارهٔ اشتراکتان سؤالی دارید یا اطلاعات بیشتری دربارهٔ { $productName } می‌خواهید، لطفاً با ما تماس بگیرید:
subscription-support-get-help = دریافت کمک دربارهٔ اشتراک
subscription-support-manage-your-subscription = <a data-l10n-name="manageSubscriptionUrl">مدیریت اشتراک</a>
# After the colon, there's a link to https://payments.firefox.com/subscriptions
subscription-support-manage-your-subscription-plaintext = مدیریت اشتراک:
subscription-support-contact-support = <a data-l10n-name="subscriptionSupportUrl">تماس با پشتیبانی</a>
# After the colon, there's a link to https://support.mozilla.com/products
subscription-support-contact-support-plaintext = تماس با پشتیبانی:
subscriptionUpdateBillingEnsure = می‌توانید <a data-l10n-name="updateBillingUrl">از اینجا</a> مطمئن شوید که روش پرداخت و اطلاعات حسابتان به‌روز است.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = می‌توانید از اینجا مطمئن شوید که روش پرداخت و اطلاعات حسابتان به‌روز است:
subscriptionUpdateBillingTry = طی چند روز آینده دوباره برای دریافت پرداخت تلاش می‌کنیم، اما ممکن است لازم باشد با <a data-l10n-name="updateBillingUrl">به‌روزرسانی اطلاعات پرداختتان</a> به ما کمک کنید مشکل را برطرف کنیم.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = طی چند روز آینده دوباره برای دریافت پرداخت تلاش می‌کنیم، اما ممکن است لازم باشد با به‌روزرسانی اطلاعات پرداختتان به ما کمک کنید مشکل را برطرف کنیم:
subscriptionUpdatePayment = برای اینکه خدماتتان قطع نشود، لطفاً هر چه زودتر <a data-l10n-name="updateBillingUrl">اطلاعات پرداختتان را به‌روز کنید</a>.
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = برای اینکه خدماتتان قطع نشود، لطفاً هر چه زودتر اطلاعات پرداختتان را به‌روز کنید:
view-invoice-link-action = مشاهدهٔ فاکتور
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = مشاهدهٔ فاکتور: { $invoiceLink }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = به { $productName } خوش آمدید
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = به { $productName } خوش آمدید
downloadSubscription-content-2 = بیایید استفاده از همهٔ امکاناتی را که اشتراکتان شامل آن‌هاست شروع کنیم:
downloadSubscription-link-action-2 = شروع کنید
fraudulentAccountDeletion-subject-2 = { -product-mozilla-account } شما حذف شد
fraudulentAccountDeletion-title = حساب شما حذف شد
fraudulentAccountDeletion-content-part1-v2 = به‌تازگی یک { -product-mozilla-account } با این نشانی رایانامه ساخته شد و هزینهٔ یک اشتراک پرداخت شد. همان‌طور که برای همهٔ حساب‌های جدید انجام می‌دهیم، از شما خواستیم ابتدا با تأیید این نشانی رایانامه، حسابتان را تأیید کنید.
fraudulentAccountDeletion-content-part2-v2 = در حال حاضر می‌بینیم که این حساب هرگز تأیید نشده است. چون این گام انجام نشده، مطمئن نیستیم که این اشتراک مجاز بوده باشد. به همین دلیل، { -product-mozilla-account } ثبت‌شده با این نشانی رایانامه حذف شد، اشتراکتان لغو شد و همهٔ مبالغ پرداختی بازگردانده شد.
fraudulentAccountDeletion-contact = اگر سؤالی دارید، لطفاً با <a data-l10n-name="mozillaSupportUrl">تیم پشتیبانی</a> ما تماس بگیرید.
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = اگر سؤالی دارید، لطفاً با تیم پشتیبانی ما تماس بگیرید: { $mozillaSupportUrl }
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-subject = دورهٔ آزمایشی رایگان { $productName } به‌زودی تمام می‌شود
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-greeting = مشترک گرامی { $productName }،
# Variables:
#   $serviceLastActiveDateOnly (String) - The date the free trial ends, e.g. January 20, 2016
freeTrialEndingReminder-content-trial-ending = دورهٔ آزمایشی رایگان شما قرار است در تاریخ <strong>{ $serviceLastActiveDateOnly }</strong> تمام شود.
freeTrialEndingReminder-content-trial-ending-plaintext = دورهٔ آزمایشی رایگان شما قرار است در تاریخ { $serviceLastActiveDateOnly } تمام شود.
# Variables:
#   $invoiceTotal (String) - The total amount that will be charged, e.g. $9.99
#   $serviceLastActiveDateOnly (String) - The date the charge will occur, e.g. January 20, 2016
freeTrialEndingReminder-content-auto-charge = اگر تا آن زمان لغو نکنید، اشتراکتان خودبه‌خود آغاز می‌شود و در تاریخ <strong>{ $serviceLastActiveDateOnly }</strong> مبلغ <strong>{ $invoiceTotal }</strong> از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
freeTrialEndingReminder-content-auto-charge-plaintext = اگر تا آن زمان لغو نکنید، اشتراکتان خودبه‌خود آغاز می‌شود و در تاریخ { $serviceLastActiveDateOnly } مبلغ { $invoiceTotal } از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
freeTrialEndingReminder-content-charge-heading = جزئیات هزینه
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $invoiceSubtotal (String) - The subtotal amount of the subscription, e.g. $12.99
freeTrialEndingReminder-content-charge-subscription = اشتراک { $productName }: { $invoiceSubtotal }
freeTrialEndingReminder-content-charge-subscription-2 = اشتراک { $productName }
# Variables:
#   $invoiceDiscountAmount (String) - The discount amount, as a negative number, e.g. -$3.00
freeTrialEndingReminder-content-charge-discount = تخفیف: { $invoiceDiscountAmount }
freeTrialEndingReminder-content-charge-discount-2 = تخفیف
# Variables:
#   $invoiceTaxAmount (String) - The tax amount, e.g. $1.20
freeTrialEndingReminder-content-charge-tax = مالیات: { $invoiceTaxAmount }
freeTrialEndingReminder-content-charge-tax-2 = مالیات
# Variables:
#   $serviceLastActiveDateOnly (String) - The date the charge will occur, e.g. January 20, 2016
#   $invoiceTotal (String) - The total amount due, e.g. $9.99
freeTrialEndingReminder-content-charge-total = مبلغ قابل پرداخت در { $serviceLastActiveDateOnly }: { $invoiceTotal }
freeTrialEndingReminder-content-charge-total-2 = مبلغ قابل پرداخت در { $serviceLastActiveDateOnly }
freeTrialEndingReminder-content-account-link = می‌توانید روش پرداخت و اطلاعات حسابتان را <a data-l10n-name="freeTrialEndingReminder-update-billing">از اینجا</a> بررسی یا به‌روز کنید.
freeTrialEndingReminder-content-account-link-plaintext = می‌توانید روش پرداخت و اطلاعات حسابتان را از اینجا بررسی یا به‌روز کنید:
# Variables:
#   $serviceLastActiveDateOnly (String) - The date the trial ends, e.g. January 20, 2016
freeTrialEndingReminder-content-cancel-link = برای اینکه هزینه‌ای از شما کسر نشود، پیش از <strong>{ $serviceLastActiveDateOnly }</strong> لغو کنید: <a data-l10n-name="freeTrialEndingReminder-cancel-subscription">لغو اشتراک</a>
freeTrialEndingReminder-content-cancel-link-plaintext = برای اینکه هزینه‌ای از شما کسر نشود، پیش از { $serviceLastActiveDateOnly } لغو کنید:
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-thanks = از اینکه { $productName } را امتحان کردید سپاسگزاریم. اگر دربارهٔ دورهٔ آزمایشی یا اشتراکتان سؤالی دارید، لطفاً <a data-l10n-name="freeTrialEndingReminder-contact-support">با ما تماس بگیرید</a>.
freeTrialEndingReminder-content-thanks-plaintext = از اینکه { $productName } را امتحان کردید سپاسگزاریم. اگر دربارهٔ دورهٔ آزمایشی یا اشتراکتان سؤالی دارید، لطفاً با ما تماس بگیرید.
freeTrialEndingReminder-content-closing = با احترام،
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
freeTrialEndingReminder-content-signature = تیم { $productName }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
freeTrialEndingReminder-content-support-plaintext = تماس با ما: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = اشتراک { $productName } شما لغو شد
subscriptionAccountDeletion-title = از رفتنتان متأسفیم
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = شما به‌تازگی { -product-mozilla-account } خود را حذف کردید. به همین دلیل، اشتراک { $productName } شما را لغو کردیم. آخرین پرداخت شما به مبلغ { $invoiceTotal } در تاریخ { $invoiceDateOnly } انجام شد.
subscriptionAccountReminderFirst-subject = یادآوری: راه‌اندازی حسابتان را کامل کنید
subscriptionAccountReminderFirst-title = هنوز نمی‌توانید به اشتراکتان دسترسی داشته باشید
subscriptionAccountReminderFirst-content-info-3 = چند روز پیش یک { -product-mozilla-account } ساختید اما هیچ‌وقت آن را تأیید نکردید. امیدواریم راه‌اندازی حسابتان را کامل کنید تا بتوانید از اشتراک جدیدتان استفاده کنید.
subscriptionAccountReminderFirst-content-select-2 = گزینهٔ «ساختن گذرواژه» را انتخاب کنید تا یک گذرواژهٔ جدید تعیین کنید و تأیید حسابتان را به پایان برسانید.
subscriptionAccountReminderFirst-action = ساختن گذرواژه
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = آخرین یادآوری: حسابتان را راه‌اندازی کنید
subscriptionAccountReminderSecond-title-2 = به { -brand-mozilla } خوش آمدید!
subscriptionAccountReminderSecond-content-info-3 = چند روز پیش یک { -product-mozilla-account } ساختید اما هیچ‌وقت آن را تأیید نکردید. امیدواریم راه‌اندازی حسابتان را کامل کنید تا بتوانید از اشتراک جدیدتان استفاده کنید.
subscriptionAccountReminderSecond-content-select-2 = گزینهٔ «ساختن گذرواژه» را انتخاب کنید تا یک گذرواژهٔ جدید تعیین کنید و تأیید حسابتان را به پایان برسانید.
subscriptionAccountReminderSecond-action = ساختن گذرواژه
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = اشتراک { $productName } شما لغو شد
subscriptionCancellation-title = از رفتنتان متأسفیم

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = اشتراک { $productName } شما را لغو کردیم. آخرین پرداخت شما به مبلغ { $invoiceTotal } در تاریخ { $invoiceDateOnly } انجام شد.
subscriptionCancellation-outstanding-content-2 = اشتراک { $productName } شما را لغو کردیم. آخرین پرداخت شما به مبلغ { $invoiceTotal } در تاریخ { $invoiceDateOnly } انجام خواهد شد.
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = خدمات شما تا پایان دورهٔ صورتحساب فعلی، یعنی تا { $serviceLastActiveDateOnly }، ادامه خواهد داشت.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-freeTrial-subject = دورهٔ آزمایشی رایگان { $productName } شما لغو شد
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $trialEndDateOnly (String) - The date when the free trial ends, e.g. 01/20/2016
subscriptionCancellation-freeTrial-content = دورهٔ آزمایشی رایگان { $productName } شما لغو شد. دسترسی‌تان در تاریخ { $trialEndDateOnly } پایان می‌یابد. هیچ هزینه‌ای از شما کسر نخواهد شد.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = به { $productName } تغییر وضعیت دادید
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = با موفقیت از { $productNameOld } به { $productName } تغییر وضعیت دادید.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = از صورتحساب بعدی، هزینهٔ شما از { $paymentAmountOld } در هر { $productPaymentCycleOld } به { $paymentAmountNew } در هر { $productPaymentCycleNew } تغییر می‌کند. در همان زمان، یک اعتبار یک‌باره به مبلغ { $paymentProrated } هم دریافت می‌کنید که نشان‌دهندهٔ هزینهٔ کمتر برای باقی‌ماندهٔ این { $productPaymentCycleOld } است.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = اگر برای استفاده از { $productName } لازم باشد نرم‌افزار جدیدی نصب کنید، رایانامهٔ جداگانه‌ای با دستورالعمل بارگیری دریافت خواهید کرد.
subscriptionDowngrade-content-auto-renew = اشتراک شما در هر دورهٔ صورتحساب خودبه‌خود تمدید می‌شود، مگر اینکه آن را لغو کنید.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionEndingReminder-subject = اشتراک { $productName } شما به‌زودی منقضی می‌شود
subscriptionEndingReminder-title = اشتراک { $productName } شما به‌زودی منقضی می‌شود
# Variables:
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionEndingReminder-content-line1 = دسترسی شما به { $productName } در تاریخ <strong>{ $serviceLastActiveDateOnly }</strong> پایان می‌یابد.
subscriptionEndingReminder-content-line2-v2 = اگر می‌خواهید همچنان از { $productName } استفاده کنید، می‌توانید پیش از <strong>{ $serviceLastActiveDateOnly }</strong> از بخش <a data-l10n-name="subscriptionEndingReminder-subscription-management">مدیریت اشتراک</a> اشتراکتان را حفظ کنید. اگر به کمک نیاز دارید، <a data-l10n-name="subscriptionEndingReminder-contact-support">با تیم پشتیبانی ما تماس بگیرید</a>.
subscriptionEndingReminder-content-line1-plaintext = دسترسی شما به { $productName } در تاریخ { $serviceLastActiveDateOnly } پایان می‌یابد.
subscriptionEndingReminder-content-line2-plaintext-v2 = اگر می‌خواهید همچنان از { $productName } استفاده کنید، می‌توانید پیش از { $serviceLastActiveDateOnly } از بخش مدیریت اشتراک اشتراکتان را حفظ کنید. اگر به کمک نیاز دارید، با تیم پشتیبانی ما تماس بگیرید.
subscriptionEndingReminder-content-closing = از اینکه مشترک ارزشمند ما هستید سپاسگزاریم!
subscriptionEndingReminder-churn-title = می‌خواهید دسترسی‌تان را حفظ کنید؟
subscriptionEndingReminder-churn-terms = <a data-l10n-name="subscriptionEndingReminder-churn-terms">شرایط و محدودیت‌های خاصی اعمال می‌شود</a>
# Variables:
#  $churnTermsUrlWithUtm (String) - URL to the terms and restrictions page applied to this promotion
subscriptionEndingReminder-churn-terms-plaintext = شرایط و محدودیت‌های خاصی اعمال می‌شود: { $churnTermsUrlWithUtm }
# Variables:
#  $subscriptionSupportUrlWithUtm (String) - URL to the subscription products support page
subscriptionEndingReminder-content-support-plaintext = تماس با تیم پشتیبانی: { $subscriptionSupportUrlWithUtm }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = اشتراک { $productName } شما لغو شد
subscriptionFailedPaymentsCancellation-title = اشتراک شما لغو شد
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = چون چند بار تلاش برای دریافت پرداخت ناموفق بود، اشتراک { $productName } شما را لغو کردیم. برای دسترسی دوباره، با یک روش پرداخت به‌روز، اشتراک جدیدی بگیرید.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = پرداخت { $productName } تأیید شد
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = از اینکه مشترک { $productName } شدید سپاسگزاریم
subscriptionFirstInvoice-content-processing = پرداخت شما در حال پردازش است و ممکن است تا چهار روز کاری طول بکشد.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = رایانامهٔ جداگانه‌ای دربارهٔ نحوهٔ شروع استفاده از { $productName } دریافت خواهید کرد.
subscriptionFirstInvoice-content-auto-renew = اشتراک شما در هر دورهٔ صورتحساب خودبه‌خود تمدید می‌شود، مگر اینکه آن را لغو کنید.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionFirstInvoice-content-your-next-invoice = فاکتور بعدی شما در تاریخ { $nextInvoiceDateOnly } صادر می‌شود.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-subject-2 = روش پرداخت { $productName } منقضی شده یا به‌زودی منقضی می‌شود
subscriptionPaymentExpired-title-2 = روش پرداخت شما منقضی شده یا در آستانهٔ انقضاست
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentExpired-content-2 = روش پرداختی که برای { $productName } استفاده می‌کنید منقضی شده یا در آستانهٔ انقضاست.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = پرداخت { $productName } ناموفق بود
subscriptionPaymentFailed-title = متأسفیم، در دریافت پرداخت شما به مشکل خورده‌ایم
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = در آخرین پرداخت شما برای { $productName } مشکلی پیش آمد.
subscriptionPaymentFailed-content-outdated-1 = ممکن است روش پرداختتان منقضی شده یا اطلاعات آن قدیمی باشد.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = به‌روزرسانی اطلاعات پرداخت برای { $productName } لازم است
subscriptionPaymentProviderCancelled-title = متأسفیم، روش پرداخت شما با مشکل مواجه شده است
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = مشکلی در روش پرداخت شما برای { $productName } شناسایی کرده‌ایم.
subscriptionPaymentProviderCancelled-content-reason-1 = ممکن است روش پرداختتان منقضی شده یا اطلاعات آن قدیمی باشد.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject-2 = اشتراک { $productName } شما دوباره فعال شد
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-free-trial-subject = دورهٔ آزمایشی رایگان { $productName } شما دوباره فعال شد
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = از اینکه اشتراک { $productName } خود را دوباره فعال کردید سپاسگزاریم!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-free-trial-title = از اینکه دورهٔ آزمایشی رایگان { $productName } خود را دوباره فعال کردید سپاسگزاریم!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = دورهٔ صورتحساب و مبلغ پرداختی شما تغییری نمی‌کند. پرداخت بعدی شما { $invoiceTotal } در تاریخ { $nextInvoiceDateOnly } خواهد بود. اشتراک شما در هر دورهٔ صورتحساب خودبه‌خود تمدید می‌شود، مگر اینکه آن را لغو کنید.
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = اطلاعیهٔ تمدید خودکار { $productName }
subscriptionRenewalReminder-title = اشتراک شما به‌زودی تمدید می‌شود
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = مشترک گرامی { $productName }،
# Variables
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-intro = اشتراک فعلی شما قرار است { $reminderLength } روز دیگر خودبه‌خود تمدید شود.
subscriptionRenewalReminder-content-discount-change = فاکتور بعدی شما تغییر قیمت را نشان می‌دهد، چون تخفیف قبلی به پایان رسیده و تخفیف جدیدی اعمال شده است.
subscriptionRenewalReminder-content-discount-ending = چون تخفیف قبلی به پایان رسیده، اشتراک شما با قیمت عادی تمدید می‌شود.
# Variables
#   $invoiceTotalExcludingTax (String) - The amount of the subscription invoice before tax, including currency, e.g. $10.00
#   $invoiceTax (String) - The tax amount of the subscription invoice, including currency, e.g. $1.29
subscriptionRenewalReminder-content-charge-with-tax-day = در آن زمان، { -brand-mozilla } اشتراک روزانهٔ شما را تمدید می‌کند و مبلغ { $invoiceTotalExcludingTax } به‌علاوهٔ { $invoiceTax } مالیات از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-with-tax-week = در آن زمان، { -brand-mozilla } اشتراک هفتگی شما را تمدید می‌کند و مبلغ { $invoiceTotalExcludingTax } به‌علاوهٔ { $invoiceTax } مالیات از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-with-tax-month = در آن زمان، { -brand-mozilla } اشتراک ماهانهٔ شما را تمدید می‌کند و مبلغ { $invoiceTotalExcludingTax } به‌علاوهٔ { $invoiceTax } مالیات از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-with-tax-halfyear = در آن زمان، { -brand-mozilla } اشتراک شش‌ماههٔ شما را تمدید می‌کند و مبلغ { $invoiceTotalExcludingTax } به‌علاوهٔ { $invoiceTax } مالیات از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-with-tax-year = در آن زمان، { -brand-mozilla } اشتراک سالانهٔ شما را تمدید می‌کند و مبلغ { $invoiceTotalExcludingTax } به‌علاوهٔ { $invoiceTax } مالیات از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-with-tax-default = در آن زمان، { -brand-mozilla } اشتراک شما را تمدید می‌کند و مبلغ { $invoiceTotalExcludingTax } به‌علاوهٔ { $invoiceTax } مالیات از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
subscriptionRenewalReminder-content-charge-invoice-total-day = در آن زمان، { -brand-mozilla } اشتراک روزانهٔ شما را تمدید می‌کند و مبلغ { $invoiceTotal } از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-invoice-total-week = در آن زمان، { -brand-mozilla } اشتراک هفتگی شما را تمدید می‌کند و مبلغ { $invoiceTotal } از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-invoice-total-month = در آن زمان، { -brand-mozilla } اشتراک ماهانهٔ شما را تمدید می‌کند و مبلغ { $invoiceTotal } از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-invoice-total-halfyear = در آن زمان، { -brand-mozilla } اشتراک شش‌ماههٔ شما را تمدید می‌کند و مبلغ { $invoiceTotal } از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-invoice-total-year = در آن زمان، { -brand-mozilla } اشتراک سالانهٔ شما را تمدید می‌کند و مبلغ { $invoiceTotal } از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-charge-invoice-total-default = در آن زمان، { -brand-mozilla } اشتراک شما را تمدید می‌کند و مبلغ { $invoiceTotal } از روش پرداخت ثبت‌شده در حسابتان کسر می‌شود.
subscriptionRenewalReminder-content-closing = با احترام،
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = تیم { $productName }
subscriptionReplaced-subject = اشتراک شما در پی ارتقا به‌روز شد
subscriptionReplaced-title = اشتراک شما به‌روز شد
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReplaced-content-replaced = اشتراک جداگانهٔ { $productName } شما جایگزین شده و اکنون در بستهٔ جدیدتان گنجانده شده است.
subscriptionReplaced-content-credit = برای زمان استفاده‌نشده از اشتراک قبلی‌تان اعتبار دریافت می‌کنید. این اعتبار خودبه‌خود به حسابتان اضافه می‌شود و برای پرداخت‌های آینده به کار می‌رود.
subscriptionReplaced-content-no-action = لازم نیست کاری انجام دهید.
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = پرداخت { $productName } دریافت شد
subscriptionSubsequentInvoice-title = از اینکه مشترک ما هستید سپاسگزاریم!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = آخرین پرداخت شما برای { $productName } را دریافت کردیم.
# Variables:
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025
subscriptionSubsequentInvoice-content-your-next-invoice = فاکتور بعدی شما در تاریخ { $nextInvoiceDateOnly } صادر می‌شود.
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = اشتراکتان را به { $productName } ارتقا دادید
subscriptionUpgrade-title = از اینکه ارتقا دادید سپاسگزاریم!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = با موفقیت به { $productName } ارتقا دادید.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-content-charge-prorated-1 = مبلغ یک‌بارهٔ { $invoiceAmountDue } از شما دریافت شد تا قیمت بالاتر اشتراکتان برای باقی‌ماندهٔ این دورهٔ صورتحساب ({ $productPaymentCycleOld }) پوشش داده شود.
subscriptionUpgrade-content-charge-credit = اعتباری به مبلغ { $paymentProrated } به حسابتان اضافه شد.
subscriptionUpgrade-content-subscription-next-bill-change = از صورتحساب بعدی، قیمت اشتراکتان تغییر می‌کند.
subscriptionUpgrade-content-old-price-day = نرخ قبلی { $paymentAmountOld } در روز بود.
subscriptionUpgrade-content-old-price-week = نرخ قبلی { $paymentAmountOld } در هفته بود.
subscriptionUpgrade-content-old-price-month = نرخ قبلی { $paymentAmountOld } در ماه بود.
subscriptionUpgrade-content-old-price-halfyear = نرخ قبلی { $paymentAmountOld } برای هر شش ماه بود.
subscriptionUpgrade-content-old-price-year = نرخ قبلی { $paymentAmountOld } در سال بود.
subscriptionUpgrade-content-old-price-default = نرخ قبلی { $paymentAmountOld } برای هر دورهٔ صورتحساب بود.
subscriptionUpgrade-content-old-price-day-tax = نرخ قبلی { $paymentAmountOld } به‌علاوهٔ { $paymentTaxOld } مالیات در روز بود.
subscriptionUpgrade-content-old-price-week-tax = نرخ قبلی { $paymentAmountOld } به‌علاوهٔ { $paymentTaxOld } مالیات در هفته بود.
subscriptionUpgrade-content-old-price-month-tax = نرخ قبلی { $paymentAmountOld } به‌علاوهٔ { $paymentTaxOld } مالیات در ماه بود.
subscriptionUpgrade-content-old-price-halfyear-tax = نرخ قبلی { $paymentAmountOld } به‌علاوهٔ { $paymentTaxOld } مالیات برای هر شش ماه بود.
subscriptionUpgrade-content-old-price-year-tax = نرخ قبلی { $paymentAmountOld } به‌علاوهٔ { $paymentTaxOld } مالیات در سال بود.
subscriptionUpgrade-content-old-price-default-tax = نرخ قبلی { $paymentAmountOld } به‌علاوهٔ { $paymentTaxOld } مالیات برای هر دورهٔ صورتحساب بود.
subscriptionUpgrade-content-new-price-day = از این پس، بدون احتساب تخفیف‌ها، روزانه { $paymentAmountNew } از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-week = از این پس، بدون احتساب تخفیف‌ها، هفته‌ای { $paymentAmountNew } از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-month = از این پس، بدون احتساب تخفیف‌ها، ماهانه { $paymentAmountNew } از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-halfyear = از این پس، بدون احتساب تخفیف‌ها، هر شش ماه { $paymentAmountNew } از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-year = از این پس، بدون احتساب تخفیف‌ها، سالانه { $paymentAmountNew } از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-default = از این پس، بدون احتساب تخفیف‌ها، برای هر دورهٔ صورتحساب { $paymentAmountNew } از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-day-dtax = از این پس، بدون احتساب تخفیف‌ها، روزانه { $paymentAmountNew } به‌علاوهٔ { $paymentTaxNew } مالیات از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-week-tax = از این پس، بدون احتساب تخفیف‌ها، هفته‌ای { $paymentAmountNew } به‌علاوهٔ { $paymentTaxNew } مالیات از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-month-tax = از این پس، بدون احتساب تخفیف‌ها، ماهانه { $paymentAmountNew } به‌علاوهٔ { $paymentTaxNew } مالیات از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-halfyear-tax = از این پس، بدون احتساب تخفیف‌ها، هر شش ماه { $paymentAmountNew } به‌علاوهٔ { $paymentTaxNew } مالیات از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-year-tax = از این پس، بدون احتساب تخفیف‌ها، سالانه { $paymentAmountNew } به‌علاوهٔ { $paymentTaxNew } مالیات از شما دریافت می‌شود.
subscriptionUpgrade-content-new-price-default-tax = از این پس، بدون احتساب تخفیف‌ها، برای هر دورهٔ صورتحساب { $paymentAmountNew } به‌علاوهٔ { $paymentTaxNew } مالیات از شما دریافت می‌شود.
subscriptionUpgrade-existing = اگر هر یک از اشتراک‌های فعلی‌تان با این ارتقا هم‌پوشانی داشته باشد، آن را رسیدگی می‌کنیم و جزئیاتش را در رایانامهٔ جداگانه‌ای برایتان می‌فرستیم. اگر طرح جدیدتان شامل محصولاتی باشد که نیاز به نصب دارند، دستورالعمل راه‌اندازی را هم در رایانامهٔ جداگانه‌ای برایتان می‌فرستیم.
subscriptionUpgrade-auto-renew = اشتراک شما در هر دورهٔ صورتحساب خودبه‌خود تمدید می‌شود، مگر اینکه آن را لغو کنید.
subscriptionsPaymentExpired-subject-2 = روش پرداخت اشتراک‌های شما منقضی شده یا به‌زودی منقضی می‌شود
subscriptionsPaymentExpired-title-2 = روش پرداخت شما منقضی شده یا در آستانهٔ انقضاست
subscriptionsPaymentExpired-content-2 = روش پرداختی که برای پرداخت اشتراک‌های زیر استفاده می‌کنید منقضی شده یا در آستانهٔ انقضاست.
subscriptionsPaymentProviderCancelled-subject = به‌روزرسانی اطلاعات پرداخت برای اشتراک‌های { -brand-mozilla } لازم است
subscriptionsPaymentProviderCancelled-title = متأسفیم، روش پرداخت شما با مشکل مواجه شده است
subscriptionsPaymentProviderCancelled-content-detected = مشکلی در روش پرداخت شما برای اشتراک‌های زیر شناسایی کرده‌ایم.
subscriptionsPaymentProviderCancelled-content-payment-1 = ممکن است روش پرداختتان منقضی شده یا اطلاعات آن قدیمی باشد.
