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
payment-details = جزئیات پرداخت:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = شماره فاکتور: { $invoiceNumber }

## $paymentProviderName (String) - The brand name of the payment method, e.g. PayPal, Apple Pay, Google Pay, Link

payment-method-payment-provider-plaintext = روش پرداخت: { $paymentProviderName }

##

#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = به { $productName } خوش آمدید
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = به { $productName } خوش آمدید
