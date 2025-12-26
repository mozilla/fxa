## Non-email strings

session-verify-send-push-title-2 = به { -product-mozilla-account } خود وارد می‌شوید؟
session-verify-send-push-body-2 = برای تأیید این‌که شما هستید، اینجا کلیک کنید
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

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="آرم { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="Sync devices">
body-devices-image = <img data-l10n-name="devices-image" alt="Devices">
fxa-privacy-url = سیاست‌های حریم‌خصوصی { -brand-mozilla }
moz-accounts-privacy-url-2 = { -product-mozilla-accounts(capitalization: "uppercase") } نکات حفظ محرمانگی
moz-accounts-terms-url = { -product-mozilla-accounts(capitalization: "uppercase") } شرایط ارائهٔ خدمات
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
account-deletion-info-block-communications = اگر حساب کاربری شما حذف شود، همچنان رایانامه‌هایی از Mozilla Corporation و Mozilla Foundation دریافت خواهید کرد، مگر اینکه <a data-l10n-name="unsubscribeLink">درخواست لغو اشتراک</a> دهید.
account-deletion-info-block-support = اگر سوالی دارید یا به کمک نیاز دارید، لطفا با <a data-l10n-name="supportLink">تیم پشتیبانی</a> ما تماس بگیرید.
account-deletion-info-block-communications-plaintext = اگر حساب کاربری شما حذف شود، همچنان رایانامه‌هایی از Mozilla Corporation و Mozilla Foundation دریافت خواهید کرد، مگر اینکه درخواست لغو اشتراک دهید:
account-deletion-info-block-support-plaintext = اگر سوالی دارید یا به کمک نیاز دارید، لطفا با تیم پشتیبانی ما تماس بگیرید:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="بارگیری { $productName } از { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="بارگیری { $productName } از { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = نصب { $productName } روی <a data-l10n-name="anotherDeviceLink">دستگاه رومیزی دیگر</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = نصب { $productName } روی <a data-l10n-name="anotherDeviceLink">دستگاه دیگر</a>.
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = { $productName } را از Google Play دریافت نمایید:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = { $productName } را از App Store بارگیری نمایید:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = { $productName } را روی دستگاه دیگری نصب نمایید:
automated-email-change-2 = اگر این اقدام را انجام نداده‌اید، <a data-l10n-name="passwordChangeLink">گذرواژه خود را تغییر دهید</a>.
automated-email-support = برای اطلاعات بیشتر، به <a data-l10n-name="supportLink">پشتیبانی { -brand-mozilla }</a> مراجعه کنید.
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } برای اطلاعات بیشتر، به <a data-l10n-name="supportLink">{ -brand-mozilla } پشتیبانی</a> مراجعه کنید.
change-password-plaintext = اگر شما مشکوک هستید که فرد دیگری قصد ورود به حساب‌کاربری شما را دارد، لطفا کلمه عبور خود را تغییر دهید.
manage-account = مدیریت حساب‌کاربری
manage-account-plaintext = { manage-account }:
payment-details = جزئیات پرداخت:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = شماره فاکتور: { $invoiceNumber }

##

cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = به { $productName } خوش آمدید
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = به { $productName } خوش آمدید
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
newDeviceLogin-action = مدیریت حساب‌کاربری
passwordChanged-title = گذرواژه با موفقیت تغییر کرد
postAddAccountRecovery-action = مدیریت حساب‌کاربری
postAddTwoStepAuthentication-action = مدیریت حساب‌کاربری
postChangePrimary-subject = رایانامهٔ اصلی بروزرسانی شد
postChangePrimary-action = مدیریت حساب‌کاربری
postConsumeRecoveryCode-action = مدیریت حساب‌کاربری
postNewRecoveryCodes-action = مدیریت حساب‌کاربری
postRemoveAccountRecovery-action = مدیریت حساب‌کاربری
postRemoveSecondary-subject = رایانامه دوم حذف شد
postRemoveSecondary-title = رایانامه دوم حذف شد
postRemoveSecondary-action = مدیریت حساب‌کاربری
postRemoveTwoStepAuthentication-action = مدیریت حساب‌کاربری
postVerifySecondary-subject = رایانامه دوم افزوده شد
postVerifySecondary-title = رایانامه دوم افزوده شد
postVerifySecondary-action = مدیریت حساب‌کاربری
recovery-subject = بازنشانی گذرواژه

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

unblockCode-title = این شما هستید که وارد می‌شوید؟
unblockCode-prompt = اگر جواب شما بله هست در ادامه می‌توانید کد تاییدیه را مشاهده کنید:
unblockCode-report-plaintext = اگر خیر، به ما کمک کنید تا مزاحمان را پیدا کنیم و این فعالیت‌ها را به ما گزارش کنید.
verifyLogin-action = تایید ورود
verifyLoginCode-expiry-notice = 5 دقیقه دیگر منقضی می‌شود.
verifyShortCode-expiry-notice = 5 دقیقه دیگر منقضی می‌شود.
