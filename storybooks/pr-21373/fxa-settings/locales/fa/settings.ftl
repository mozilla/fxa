# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = یک کد جدید به رایانامه شما ارسال شد.
resend-link-success-banner-heading = یک پیوند جدید به رایانامه شما ارسال شد.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = { $accountsEmail } را به مخاطبین خود اضافه کنید تا از تحویل روان رایانامه‌ها اطمینان حاصل کنید.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = بستن بنر
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } در تاریخ ۱ نوامبر به { -product-mozilla-accounts } تغییر نام خواهد یافت.
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = شما همچنان با همان نام‌کاربری و گذرواژه وارد حساب خود خواهید شد و هیچ تغییر دیگری در محصولات استفاده‌ شده شما وجود نخواهد داشت.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = ما نام { -product-firefox-accounts } را به { -product-mozilla-accounts } تغییر داده‌ایم. شما همچنان با همان نام‌کاربری و گذرواژه وارد حساب خود خواهید شد و هیچ تغییر دیگری در محصولات استفاده‌ شده شما وجود نخواهد داشت.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = بیشتر بدانید
# Alt text for close banner image
brand-close-banner =
    .alt = بستن بنر
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = آرم { -brand-mozilla } m

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = بازگشت
button-back-title = بازگشت

## ButtonDownloadRecoveryKey
## Clicking on this button downloads a plain text file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a plain text file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
recovery-key-download-button-v4 = بارگیری و ادامه
# Error message shown in a banner if the account recovery key download failed.
# The id keeps "pdf" from when this was a PDF, to preserve existing translations.
recovery-key-pdf-download-error = متاسفیم، مشکلی در بارگیری کلید بازیابی حساب شما وجود داشت.

## ButtonPasskeySignin

button-passkey-signin = ورود با کلید عبور
# This is a loading state indicating that we are waiting for the user to
# interact with their authenticator to approve the sign-in. They should see a
# device prompt/pop-up with authentication options (or message indicating that
# no passkeys are available).
button-passkey-signin-loading = در حال ورود امن…

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = بیشتر از { -brand-mozilla } دریافت کنید:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = اخبار و به‌روزرسانی‌های محصول جدید ما
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = دسترسی اولیه به آزمایش محصولات جدید
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = هشدارهای عملی برای بازپس‌گیری اینترنت

## Dark mode toggle

dark-mode-toggle-light = روشن
dark-mode-toggle-dark = تیره
dark-mode-toggle-system = سیستم
dark-mode-toggle-label = تغییر پوسته

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = دریافت شد
datablock-copy =
    .message = رونوشت شد
datablock-print =
    .message = چاپ شد

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success =
    { $count ->
        [one] کد رونوشت شد
       *[other] کدها رونوشت شدند
    }
datablock-download-success =
    { $count ->
        [one] کد بارگیری شد
       *[other] کدها بارگیری شدند
    }
datablock-print-success =
    { $count ->
        [one] کد چاپ شد
       *[other] کدها چاپ شدند
    }

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = رونوشت شد

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }، { $region }، { $country } (تخمین زده‌شده)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (تخمین زده‌شده)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (تخمین زده‌شده)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (تخمین زده‌شده)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = مکان ناشناخته
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } روی { $genericOSName }
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $deviceName } is the user-chosen name of the device that created the request (e.g., Laurel's MacBook Pro)
device-info-browser-device = { $browserName } روی { $deviceName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = نشانی IP: { $ipAddress }

## Firefox Promo Banner component
## Shown at the top of settings to promote installing Firefox on mobile (when
## the user is on Firefox) or switching to Firefox (on other browsers).

firefox-promo-banner-mobile-heading = { -brand-firefox } را هر جا که هستید همراه داشته باشید
firefox-promo-banner-mobile-description = زبانه‌ها، نشانک‌ها و گذرواژه‌هایتان را بین همهٔ دستگاه‌هایتان همگام کنید. تازه همه‌چیز هم به‌صورت امن رمزگذاری‌شده باقی می‌ماند.
firefox-promo-banner-mobile-cta = اتصال یک دستگاه
firefox-promo-banner-switch-heading = جابه‌جایی سریع، شروعی راحت.
firefox-promo-banner-switch-description = وقتی به { -brand-firefox } کوچ می‌کنید، می‌توانید نشانک‌ها، گذرواژه‌ها، تاریخچه و چیزهای دیگر را هم با خودتان بیاورید تا بی‌وقفه به مرور ادامه دهید.
firefox-promo-banner-switch-cta = کوچ به { -brand-firefox }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = گذرواژه
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = تکرار گذرواژه
form-password-with-inline-criteria-signup-submit-button = ساخت حساب کاربری
form-password-with-inline-criteria-reset-new-password =
    .label = گذرواژه جدید
form-password-with-inline-criteria-confirm-password =
    .label = تأیید گذرواژه
form-password-with-inline-criteria-reset-submit-button = ایجاد گذرواژه جدید
form-password-with-inline-criteria-old-password-label =
    .label = گذرواژهٔ قدیمی
form-password-with-inline-criteria-change-password-submit-button = تغییر گذرواژه
form-password-with-inline-criteria-set-password-new-password-label =
    .label = گذرواژه
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = تکرار گذرواژه
form-password-with-inline-criteria-set-password-submit-button = آغاز همگام‌سازی
form-password-with-inline-criteria-match-error = گذرواژه‌ها منطبق نیستند
form-password-with-inline-criteria-sr-too-short-message = گذرواژه باید حداقل حاوی ۸ نویسه باشد.
form-password-with-inline-criteria-sr-not-email-message = گذرواژه نباید حاوی نشانی رایانامه شما باشد.
form-password-with-inline-criteria-sr-not-common-message = گذرواژه نباید یک گذرواژه رایج باشد.
form-password-with-inline-criteria-sr-requirements-met = گذرواژه وارد شده همه الزامات گذرواژه را رعایت می‌کند.
form-password-with-inline-criteria-sr-passwords-match = گذرواژه‌های وارد شده با هم مطابقت دارند.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = این قسمت الزامی است.

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = وارد کردن کد { $codeLength } رقمی برای ادامه
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = وارد کردن کد { $codeLength } نویسه‌ای برای ادامه
get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = کلید بازیابی حساب { -brand-firefox }
get-data-trio-title-backup-verification-codes = کدهای احراز هویت بازیابی
get-data-trio-download-2 =
    .aria-label = بارگیری
    .title = بارگیری
get-data-trio-copy-2 =
    .aria-label = رونوشت
    .title = رونوشت
get-data-trio-print-2 =
    .aria-label = چاپ
    .title = چاپ

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = هشدار
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = توجه
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = اخطار
authenticator-app-aria-label =
    .aria-label = برنامه احراز هویت
backup-codes-icon-aria-label-v2 =
    .aria-label = کدهای احراز هویت بازیابی فعال شده‌اند
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = کدهای احراز هویت بازیابی غیرفعال شده‌اند
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = پیامک بازیابی فعال شده است
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = پیامک بازیابی غیرفعال شده است
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = پرچم کانادا
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = بررسی
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = موفق
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = فعال شد
# Used to indicate that an action will navigate forward or open a detail view
chevron-right-icon-aria-label =
    .aria-label = پیکان به راست
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = بستن پیام
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = کد
# Used to decorate an edit or rename control
edit-icon-aria-label =
    .aria-label = ویرایش
error-icon-aria-label =
    .aria-label = خطا
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = اطلاعات
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = پرچم ایالات متحده آمریکا
# Used for loading arrow icon
icon-loading-arrow-aria-label =
    .aria-label = در حال بار کردن
# Used for passkey icon
icon-passkey-aria-label =
    .aria-label = کلید عبور
hearts-broken-image-aria-label =
    .aria-label = یک رایانه و یک تلفن همراه و تصویری از یک قلب شکسته روی هر کدام
hearts-verified-image-aria-label =
    .aria-label = یک رایانه و یک تلفن همراه و یک تبلت با یک قلب تپنده روی هر کدام
signin-recovery-code-image-description =
    .aria-label = سندی که دارای متن پنهان است.
signin-totp-code-image-label =
    .aria-label = یک دستگاه با کد ۶ رقمی پنهان.
confirm-signup-aria-label =
    .aria-label = یک پاکت حاوی پیوند
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = تصویری که نشان‌دهندهٔ کلید بازیابی حساب است.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = تصویری که نشان‌دهندهٔ کلید بازیابی حساب است.
password-image-aria-label =
    .aria-label = تصویری که نشان‌دهندهٔ وارد کردن گذرواژه است.
lightbulb-aria-label =
    .aria-label = تصویری که نشان‌دهندهٔ ساختن یادآور محل نگهداری است.
email-code-image-aria-label =
    .aria-label = تصویری که نشان‌دهندهٔ رایانامه‌ای حاوی یک کد است.
recovery-phone-image-description =
    .aria-label = دستگاه همراهی که کدی را از طریق پیامک دریافت می‌کند.
recovery-phone-code-image-description =
    .aria-label = کدی که روی دستگاه همراه دریافت شده است.
backup-recovery-phone-image-aria-label =
    .aria-label = دستگاه همراه با قابلیت دریافت پیامک
backup-authentication-codes-image-aria-label =
    .aria-label = صفحهٔ نمایش دستگاه با چند کد
sync-clouds-image-aria-label =
    .aria-label = ابرهایی با نماد همگام‌سازی
confetti-falling-image-aria-label =
    .aria-label = پویانمایی ریزش کاغذرنگی‌ها
# In this context, “VPN” is a VPN service built into the Firefox browser, and generally isn't localized differently than “VPN”
vpn-welcome-image-aria-label =
    .aria-label = پنجرهٔ { -brand-firefox } با نشانی دایره‌ای که تیک سبز و عبارت «VPN» را نشان می‌دهد؛ یعنی VPN فعال است.
sync-devices-image-aria-label =
    .aria-label = پنجرهٔ مرورگر رایانه و یک تلفن همراه که هر دو در حال همگام‌سازی‌اند و نماد { -brand-firefox } هم کنارشان است
# Aria label for the Firefox logo and wordmark shown together as a brand lockup
firefox-wordmark-image-aria-label =
    .aria-label = آرم { -brand-firefox }
# This id is referenced by `PasswordSuccessImage` but was never added here, so
# the aria-label has been falling back to English in every locale.
password-success-image-aria-label =
    .aria-label = تصویری که نشان‌دهندهٔ تغییر موفق گذرواژه است.

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = وارد { -brand-firefox } شده‌اید.
inline-recovery-key-setup-create-header = از حسابتان محافظت کنید
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = یک دقیقه وقت دارید تا از داده‌هایتان محافظت کنید؟
inline-recovery-key-setup-info = یک کلید بازیابی حساب بسازید تا اگر روزی گذرواژه‌تان را فراموش کردید، بتوانید داده‌های مرور همگام‌شده‌تان را بازگردانید.
inline-recovery-key-setup-start-button = ساخت کلید بازیابی حساب
inline-recovery-key-setup-later-button = بعداً انجام می‌دهم

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = پنهان کردن گذرواژه
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = نمایش گذرواژه
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = گذرواژهٔ شما هم‌اکنون روی صفحه نمایان است.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = گذرواژهٔ شما هم‌اکنون پنهان است.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = گذرواژهٔ شما اکنون روی صفحه نمایان شد.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = گذرواژهٔ شما اکنون پنهان شد.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = کشور را انتخاب کنید
input-phone-number-enter-number = شماره تلفن را وارد کنید
input-phone-number-country-united-states = ایالات متحده
input-phone-number-country-canada = کانادا

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = پیوند بازنشانی گذرواژه خراب است
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = پیوند تأیید خراب است
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = پیوند خراب است
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = پیوندی که روی آن کلیک کردید چند نویسه کم دارد و ممکن است برنامهٔ رایانامهٔ شما آن را خراب کرده باشد. نشانی را با دقت رونوشت کنید و دوباره امتحان کنید.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = دریافت پیوند جدید

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = گذرواژه‌تان یادتان هست؟
# shown in the password reset flow when the account may have a passkey; immediately before remember-password-signin-link
remember-password-passkey-text = کلید عبور دارید یا گذرواژه‌تان یادتان هست؟
# link navigates to the sign in page
remember-password-signin-link = ورود

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = رایانامهٔ اصلی قبلاً تأیید شده است
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = ورود قبلاً تأیید شده است
confirmation-link-reused-message = این پیوند تأیید قبلاً استفاده شده و فقط یک بار قابل استفاده است.

## Locale Toggle Component

locale-toggle-select-label = انتخاب زبان
locale-toggle-browser-default = پیش‌فرض مرورگر
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = درخواست نامعتبر

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = برای دسترسی به هر دادهٔ رمزگذاری‌شده‌ای که نزد ما نگه می‌دارید، به این گذرواژه نیاز دارید.
password-info-balloon-reset-risk-info = بازنشانی ممکن است به از دست رفتن داده‌هایی مثل گذرواژه‌ها و نشانک‌ها منجر شود.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = گذرواژهٔ قوی‌ای انتخاب کنید که در وبگاه‌های دیگر از آن استفاده نکرده‌اید. مطمئن شوید که الزامات امنیتی زیر را رعایت می‌کند:
password-strength-short-instruction = یک گذرواژهٔ قوی انتخاب کنید:
password-strength-inline-min-length = دست‌کم ۸ نویسه
password-strength-inline-not-email = نشانی رایانامهٔ شما نباشد
password-strength-inline-not-common = گذرواژهٔ رایجی نباشد
password-strength-inline-confirmed-must-match = تکرار گذرواژه با گذرواژهٔ جدید یکسان باشد
password-strength-inline-passwords-match = گذرواژه‌ها یکسان‌اند

## PromoQrMobile component
## Promotional aside encouraging users to download the Firefox mobile app via QR code.

# "Your phone. Your rules." refers to the user being able to control what browser they use on their own phone.
promo-qr-mobile-heading = تلفن شما، قوانین شما.
# Value proposition variant. Refers to resuming browsing on another device.
promo-qr-mobile-heading-treatment-a = هر جا رفتید، از همان جایی که ماندید ادامه دهید
# Value proposition variant. "tabs" are the open pages in a browser.
promo-qr-mobile-heading-treatment-b = زبانه‌هایتان و خیلی چیزهای دیگر، آماده روی تلفنتان
# Value proposition variant. Refers to using the same trusted browser on a phone.
promo-qr-mobile-heading-treatment-c = مرورگری که به آن اعتماد دارید، روی تلفنتان
# Value proposition variant. "Different screen" refers to the phone rather than the desktop.
promo-qr-mobile-heading-treatment-d = همان { -brand-firefox }، صفحه‌ای دیگر.
# Value proposition variant. "stop here" means privacy protection should continue onto the phone.
promo-qr-mobile-heading-treatment-e = حریم خصوصی شما نباید همین‌جا متوقف شود
# Value proposition variant. Refers to keeping browsing activity private.
promo-qr-mobile-heading-treatment-f = بخش بیشتری از مرورتان را برای خودتان نگه دارید
# Value proposition variant. "noise" refers to distractions and clutter.
promo-qr-mobile-heading-treatment-g = تلفنتان کمی آرامش بیشتر لازم دارد
# Value proposition variant. Refers to a calmer browsing experience on the phone.
promo-qr-mobile-heading-treatment-h = مرور آرام‌تر را با خودتان همه‌جا ببرید
# Appears below a QR code that a user can scan to download the Firefox mobile app
promo-qr-mobile-description-v2 = برای بارگیری برنامهٔ همراه، اسکن کنید
# Note that for RTL languages, this should be translated as "the lower-left corner of your screen," instead of "the lower-right corner."
promo-qr-mobile-qr-alt =
    .alt = کد QR برای بارگیری برنامهٔ همراه { -brand-firefox }. برای اسکن، دوربین تلفنتان را روی گوشهٔ پایین سمت چپ صفحه بگیرید.

## Notification Promo Banner component

account-recovery-notification-cta = ایجاد
account-recovery-notification-header-value = با فراموش کردن گذرواژه، داده‌هایتان را از دست ندهید
account-recovery-notification-header-description = یک کلید بازیابی حساب بسازید تا اگر روزی گذرواژه‌تان را فراموش کردید، بتوانید داده‌های مرور همگام‌شده‌تان را بازگردانید.
recovery-phone-promo-cta = افزودن تلفن بازیابی
recovery-phone-promo-heading = با یک تلفن بازیابی، از حسابتان بیشتر محافظت کنید
recovery-phone-promo-description = حالا اگر نتوانید از برنامهٔ احراز هویت دو مرحله‌ای‌تان استفاده کنید، می‌توانید با یک رمز یک‌بارمصرف که از طریق پیامک فرستاده می‌شود وارد شوید.
recovery-phone-promo-info-link = دربارهٔ بازیابی و خطر تعویض سیم‌کارت بیشتر بدانید
promo-banner-dismiss-button =
    .aria-label = بستن بنر

## Ready component

ready-complete-set-up-instruction = برای تکمیل راه‌اندازی، گذرواژهٔ جدیدتان را در دیگر دستگاه‌های { -brand-firefox } خود وارد کنید.
manage-your-account-button = مدیریت حساب
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = اکنون آماده‌اید که از { $serviceName } استفاده کنید
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = اکنون آماده‌اید که از تنظیمات حساب استفاده کنید
# Message shown when the account is ready but the user is not signed in
ready-account-ready = حساب شما آماده است!
ready-continue = ادامه
sign-in-complete-header = ورود تأیید شد
sign-up-complete-header = حساب تأیید شد
primary-email-verified-header = رایانامهٔ اصلی تأیید شد

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = جاهایی برای نگهداری کلیدتان:
flow-recovery-key-download-storage-ideas-folder-v2 = پوشه‌ای در یک دستگاه امن
flow-recovery-key-download-storage-ideas-cloud = فضای ابری مطمئن
flow-recovery-key-download-storage-ideas-print-v2 = نسخهٔ چاپی
flow-recovery-key-download-storage-ideas-pwd-manager = مدیر گذرواژه

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = یک یادآور اضافه کنید تا کلیدتان را راحت‌تر پیدا کنید
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = این یادآور کمک می‌کند به خاطر بیاورید کلید بازیابی حسابتان را کجا نگه داشته‌اید. هنگام بازنشانی گذرواژه می‌توانیم آن را به شما نشان دهیم تا داده‌هایتان را بازیابی کنید.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = یک یادآور وارد کنید (اختیاری)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = پایان
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = یادآور باید کمتر از ۲۵۵ نویسه داشته باشد.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = یادآور نمی‌تواند نویسه‌های یونیکد ناامن داشته باشد. فقط حروف، اعداد، علائم نگارشی و نمادها مجازند.

## ResetPasswordWarning component
## Warning shown to users resetting their password without an account recovery key,
## surfacing options to keep their browser data

password-reset-warning-icon = هشدار
password-reset-chevron-expanded = جمع کردن هشدار
password-reset-chevron-collapsed = باز کردن هشدار
password-reset-warning-review-sign-in-options = برای حفظ داده‌های مرورگر، گزینه‌های ورود را بررسی کنید
password-reset-warning-have-key = کلید بازیابی حساب دارید؟
# "it" refers to the user's account recovery key.
password-reset-warning-use-key-link-v2 = با آن گذرواژه‌تان را بازنشانی کنید و داده‌های مرورگرتان را نگه دارید
password-reset-warning-signed-in-device = هنوز در دستگاه دیگری وارد حسابتان هستید؟
password-reset-warning-signed-in-device-description = ممکن است داده‌های مرورگرتان هنوز در دسترس باشد. گذرواژه‌تان را بازنشانی کنید، سپس در آن دستگاه وارد شوید تا داده‌هایتان بازگردانده و همگام شوند.
password-reset-warning-restore-data-link = ببینید چطور داده‌های مرورگر را از دستگاهی که وارد آن شده‌اید بازگردانید
password-reset-warning-new-device = از دستگاه جدیدی استفاده می‌کنید و به دستگاه‌های قبلی دسترسی ندارید؟
password-reset-warning-new-device-description = پس از بازنشانی گذرواژه، داده‌های رمزگذاری‌شدهٔ مرورگرتان روی کارسازهای { -brand-firefox } در این دستگاه در دسترس نخواهد بود.

## Alert Bar

alert-bar-close-message = بستن پیام

## User's avatar

avatar-your-avatar =
    .alt = تصویر نمایه شما
avatar-default-avatar =
    .alt = تصویر نمایه پیش‌فرض

##

bento-menu-title-3 = محصولات { -brand-mozilla }
bento-menu-tagline = محصولات دیگری از { -brand-mozilla } که از حریم خصوصی شما محافظت می‌کنند
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } مرورگر برای میزکار
bento-menu-firefox-mobile = { -brand-firefox } مرورگر برای موبایل
bento-menu-made-by-mozilla = ساخته شده توسط { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = { -brand-firefox } را برای موبایل یا تبلت دریافت کنید
connect-another-find-fx-mobile-2 = { -brand-firefox } را در { -google-play } و { -app-store } پیدا کنید.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = بارگیری { -brand-firefox } از { -google-play }
connect-another-app-store-image-3 =
    .alt = بارگیری { -brand-firefox } از { -app-store }

## Connected services section

cs-heading = خدمات متصل
cs-description = همهٔ چیزهایی که از آن‌ها استفاده می‌کنید و واردشان شده‌اید.
cs-cannot-refresh = متأسفیم، در تازه‌سازی فهرست خدمات متصل مشکلی پیش آمد.
cs-cannot-disconnect = کارخواه پیدا نشد؛ قطع اتصال ممکن نیست
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = از { $service } خارج شدید
cs-refresh-button =
    .title = تازه‌سازی خدمات متصل
# Button under the "Connected services" header that starts the flow to pair
# another device to the user's account.
cs-connect-device-button = اتصال یک دستگاه
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = مواردی گم شده یا تکراری‌اند؟
cs-disconnect-sync-heading = قطع اتصال از همگام‌سازی

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 = داده‌های مرور شما روی <span>{ $device }</span> باقی می‌ماند، اما دیگر با حسابتان همگام نمی‌شود.
cs-disconnect-sync-reason-3 = دلیل اصلی قطع اتصال <span>{ $device }</span> چیست؟

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = این دستگاه:
cs-disconnect-sync-opt-suspicious = مشکوک است
cs-disconnect-sync-opt-lost = گم یا دزدیده شده است
cs-disconnect-sync-opt-old = قدیمی است یا جایگزین شده است
cs-disconnect-sync-opt-duplicate = تکراری
cs-disconnect-sync-opt-not-say = ترجیح می‌دهم نگویم

##

cs-disconnect-advice-confirm = باشه، متوجه شدم
cs-disconnect-lost-advice-heading = اتصال دستگاه گم‌شده یا دزدیده‌شده قطع شد
cs-disconnect-lost-advice-content-3 = از آنجا که دستگاهتان گم یا دزدیده شده، برای حفظ امنیت اطلاعاتتان بهتر است گذرواژهٔ { -product-mozilla-account } خود را از بخش تنظیمات حساب تغییر دهید. همچنین بهتر است دربارهٔ پاک کردن داده‌ها از راه دور، اطلاعات لازم را از سازندهٔ دستگاهتان بگیرید.
cs-disconnect-suspicious-advice-heading = اتصال دستگاه مشکوک قطع شد
cs-disconnect-suspicious-advice-content-2 = اگر دستگاهی که اتصالش را قطع کردید واقعاً مشکوک است، برای حفظ امنیت اطلاعاتتان بهتر است گذرواژهٔ { -product-mozilla-account } خود را از بخش تنظیمات حساب تغییر دهید. همچنین بهتر است همهٔ گذرواژه‌های دیگری را که در { -brand-firefox } ذخیره کرده‌اید، با نوشتن about:logins در نوار نشانی تغییر دهید.
cs-sign-out-button = خروج از حساب کاربری

## Sub-rows shown beneath a connected browser entry to indicate which Mozilla
## services that browser is currently authorized to access via its refresh token.

# Shown as a read-only sub-row under a browser device entry to indicate that
# the device's refresh token is authorized for Firefox’s built-in VPN.
# In this context, "VPN" is a VPN service built into the Firefox browser, and
# generally isn’t localized differently than "VPN".
cs-scope-firefox-vpn = VPN داخلی { -brand-firefox }

## Data collection section

dc-heading = جمع‌آوری و استفاده از داده‌ها
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = مرورگر { -brand-firefox }
dc-subheader-content-2 = به { -product-mozilla-accounts } اجازه دهید داده‌های فنی و تعاملی را برای { -brand-mozilla } بفرستد.
dc-subheader-ff-content = برای بررسی یا تغییر تنظیمات داده‌های فنی و تعاملی مرورگر { -brand-firefox }، تنظیمات { -brand-firefox } را باز کنید و به بخش «حریم خصوصی و امنیت» بروید.
dc-opt-out-success-2 = انصراف با موفقیت انجام شد. { -product-mozilla-accounts } دیگر داده‌های فنی یا تعاملی را برای { -brand-mozilla } نمی‌فرستد.
dc-opt-in-success-2 = سپاسگزاریم! هم‌رسانی این داده‌ها به ما کمک می‌کند { -product-mozilla-accounts } را بهتر کنیم.
dc-opt-in-out-error-2 = متأسفیم، در تغییر ترجیح جمع‌آوری داده‌هایتان مشکلی پیش آمد
dc-learn-more = بیشتر بدانید
drop-down-menu-title-2 = منوی { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = واردشده با
drop-down-menu-sign-out = خروج
drop-down-menu-sign-out-error-2 = متأسفیم، در خروج شما از حساب مشکلی پیش آمد

## Flow Container

flow-container-back = بازگشت

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = برای حفظ امنیت، گذرواژه‌تان را دوباره وارد کنید
flow-recovery-key-confirm-pwd-input-label = گذرواژه‌تان را وارد کنید
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = ساخت کلید بازیابی حساب
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = ساخت کلید بازیابی حساب جدید

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = کلید بازیابی حساب ساخته شد؛ همین حالا آن را بارگیری و نگهداری کنید
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = این کلید به شما امکان می‌دهد اگر گذرواژه‌تان را فراموش کردید، داده‌هایتان را بازیابی کنید. همین حالا آن را بارگیری کنید و جایی نگه دارید که یادتان بماند؛ بعداً نمی‌توانید به این صفحه برگردید.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = ادامه بدون بارگیری

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = کلید بازیابی حساب ساخته شد

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = برای روزی که گذرواژه‌تان را فراموش کنید، یک کلید بازیابی حساب بسازید
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = تغییر کلید بازیابی حساب
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = ما داده‌های مرور شما را رمزگذاری می‌کنیم؛ گذرواژه‌ها، نشانک‌ها و چیزهای دیگر. این برای حریم خصوصی عالی است، اما اگر گذرواژه‌تان را فراموش کنید ممکن است داده‌هایتان از دست برود.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = به همین دلیل ساختن کلید بازیابی حساب این‌قدر مهم است؛ با آن می‌توانید داده‌هایتان را بازگردانید.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = آغاز کنید
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = انصراف

## FlowSetup2faApp

flow-setup-2fa-qr-heading = اتصال به برنامهٔ احراز هویت
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>گام ۱:</strong> این کد QR را با یک برنامهٔ احراز هویت، مثل Duo یا Google Authenticator، اسکن کنید.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = کد QR برای راه‌اندازی احراز هویت دو مرحله‌ای. آن را اسکن کنید یا برای دریافت کلید محرمانهٔ راه‌اندازی، گزینهٔ «نمی‌توانید کد QR را اسکن کنید؟» را انتخاب کنید.
flow-setup-2fa-cant-scan-qr-button = نمی‌توانید کد QR را اسکن کنید؟
flow-setup-2fa-manual-key-heading = وارد کردن دستی کد
flow-setup-2fa-manual-key-instruction = <strong>گام ۱:</strong> این کد را در برنامهٔ احراز هویت دلخواهتان وارد کنید.
flow-setup-2fa-scan-qr-instead-button = به‌جای آن کد QR را اسکن می‌کنید؟
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = دربارهٔ برنامه‌های احراز هویت بیشتر بدانید
flow-setup-2fa-button = ادامه
flow-setup-2fa-step-2-instruction = <strong>گام ۲:</strong> کدی را که برنامهٔ احراز هویتتان نشان می‌دهد وارد کنید.
flow-setup-2fa-input-label = کد ۶ رقمی را وارد کنید
flow-setup-2fa-code-error = کد نامعتبر است یا منقضی شده. برنامهٔ احراز هویتتان را بررسی کنید و دوباره امتحان کنید.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = یک روش بازیابی انتخاب کنید
flow-setup-2fa-backup-choice-description = با این روش، اگر به دستگاه همراه یا برنامهٔ احراز هویتتان دسترسی نداشتید، باز هم می‌توانید وارد شوید.
flow-setup-2fa-backup-choice-phone-title = تلفن بازیابی
flow-setup-2fa-backup-choice-phone-badge = ساده‌ترین
flow-setup-2fa-backup-choice-phone-info = کد بازیابی را از طریق پیامک دریافت کنید. فعلاً فقط در آمریکا و کانادا در دسترس است.
flow-setup-2fa-backup-choice-code-title = کدهای احراز هویت بازیابی
flow-setup-2fa-backup-choice-code-badge = امن‌ترین
flow-setup-2fa-backup-choice-code-info = کدهای احراز هویت یک‌بارمصرف بسازید و نگهشان دارید.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = دربارهٔ بازیابی و خطر تعویض سیم‌کارت بدانید

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = کد احراز هویت بازیابی را وارد کنید
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = با وارد کردن یکی از کدها، تأیید کنید که آن‌ها را ذخیره کرده‌اید. اگر برنامهٔ احراز هویتتان در دسترس نباشد، بدون این کدها ممکن است نتوانید وارد شوید.
flow-setup-2fa-backup-code-confirm-code-input = کد ۱۰ نویسه‌ای را وارد کنید
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = پایان

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = ذخیرهٔ کدهای احراز هویت بازیابی
flow-setup-2fa-backup-code-dl-save-these-codes = این کدها را جایی نگه دارید که یادتان بماند. اگر به برنامهٔ احراز هویتتان دسترسی نداشته باشید، برای ورود باید یکی از آن‌ها را وارد کنید.
flow-setup-2fa-backup-code-dl-button-continue = ادامه

##

flow-setup-2fa-inline-complete-success-banner = احراز هویت دو مرحله‌ای فعال شد
flow-setup-2fa-inline-complete-success-banner-description = برای محافظت از همهٔ دستگاه‌های متصل، بهتر است از همهٔ جاهایی که از این حساب استفاده می‌کنید خارج شوید و سپس با احراز هویت دو مرحله‌ای جدیدتان دوباره وارد شوید.
flow-setup-2fa-inline-complete-backup-code = کدهای احراز هویت بازیابی
flow-setup-2fa-inline-complete-backup-phone = تلفن بازیابی
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] { $count } کد باقی مانده
       *[other] { $count } کد باقی مانده
    }
flow-setup-2fa-inline-complete-backup-code-description = اگر نتوانید با دستگاه همراه یا برنامهٔ احراز هویتتان وارد شوید، این امن‌ترین روش بازیابی است.
flow-setup-2fa-inline-complete-backup-phone-description = اگر نتوانید با برنامهٔ احراز هویتتان وارد شوید، این ساده‌ترین روش بازیابی است.
flow-setup-2fa-inline-complete-learn-more-link = این روش چطور از حسابتان محافظت می‌کند
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = ادامه به { $serviceName }
flow-setup-2fa-prompt-heading = راه‌اندازی احراز هویت دو مرحله‌ای
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } برای حفظ امنیت حسابتان از شما می‌خواهد احراز هویت دو مرحله‌ای را راه‌اندازی کنید.
# Success banner shown at the top of the page when the user signed in with a passkey.
flow-setup-2fa-prompt-passkey-success-banner = با موفقیت با کلید عبور وارد شدید
# Body copy shown when the user signed in with a passkey and the service still
# requires two-step authentication setup.
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-passkey-description = { $serviceName } برای { -product-mozilla-account } شما احراز هویت دو مرحله‌ای را هم لازم می‌داند. پس از راه‌اندازی، هنگام ورود با کلید عبور دیگر به آن نیازی نخواهید داشت.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = برای ادامه می‌توانید از هر یک از <authenticationAppsLink>این برنامه‌های احراز هویت</authenticationAppsLink> استفاده کنید.
flow-setup-2fa-prompt-continue-button = ادامه

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = کد تأیید را وارد کنید
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = یک کد ۶ رقمی با پیامک به <span>{ $phoneNumber }</span> فرستاده شد. این کد پس از ۵ دقیقه منقضی می‌شود.
flow-setup-phone-confirm-code-input-label = کد ۶ رقمی را وارد کنید
flow-setup-phone-confirm-code-button = تأیید
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = کد منقضی شده؟
flow-setup-phone-confirm-code-resend-code-button = ارسال دوبارهٔ کد
flow-setup-phone-confirm-code-resend-code-success = کد ارسال شد
flow-setup-phone-confirm-code-success-message-v2 = تلفن بازیابی اضافه شد
flow-change-phone-confirm-code-success-message = تلفن بازیابی تغییر کرد
flow-setup-phone-submit-number-heading = شماره تلفنتان را تأیید کنید
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = پیامکی از { -brand-mozilla } دریافت می‌کنید که کدی برای تأیید شماره‌تان در آن است. این کد را به هیچ‌کس ندهید.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = تلفن بازیابی فقط در ایالات متحده و کانادا در دسترس است. استفاده از شماره‌های VoIP و شماره‌های پوششی توصیه نمی‌شود.
flow-setup-phone-submit-number-legal = با وارد کردن شماره‌تان، موافقت می‌کنید که آن را نگه داریم تا فقط برای تأیید حساب به شما پیامک بفرستیم. ممکن است هزینهٔ پیامک و اینترنت از شما دریافت شود.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = ارسال کد

## HeaderLockup component, the header in account settings

header-menu-open = بستن منو
header-menu-closed = منوی پیمایش وبگاه
header-back-to-top-link =
    .title = برگشت به بالا
header-back-to-settings-link =
    .title = بازگشت به تنظیمات { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = راهنما

## Linked Accounts section

la-heading = حساب‌های مرتبط
la-description = شما مجوز دسترسی به حساب‌های زیر را دارید.
la-unlink-button = لغو پیوند
la-unlink-account-button = لغو پیوند
la-set-password-button = تعیین گذرواژه
la-unlink-heading = لغو پیوند با حساب شخص ثالث
la-unlink-content-3 = مطمئنید که می‌خواهید پیوند حسابتان را لغو کنید؟ با لغو پیوند حساب، به‌طور خودکار از خدمات متصل خارج نمی‌شوید. برای این کار باید خودتان از بخش «خدمات متصل» خارج شوید.
la-unlink-content-4 = پیش از لغو پیوند حسابتان، باید یک گذرواژه تعیین کنید. بدون گذرواژه، پس از لغو پیوند هیچ راهی برای ورود به حسابتان نخواهید داشت.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = بستن
modal-cancel-button = لغو
modal-default-confirm-button = تأیید

## ModalMfaProtected

modal-mfa-protected-title = کد تأیید را وارد کنید
modal-mfa-protected-subtitle = کمکمان کنید مطمئن شویم که خود شما اطلاعات حسابتان را تغییر می‌دهید
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] کدی را که به <email>{ $email }</email> فرستاده شده، ظرف { $expirationTime } دقیقه وارد کنید.
       *[other] کدی را که به <email>{ $email }</email> فرستاده شده، ظرف { $expirationTime } دقیقه وارد کنید.
    }
modal-mfa-protected-input-label = کد ۶ رقمی را وارد کنید
modal-mfa-protected-cancel-button = انصراف
modal-mfa-protected-confirm-button = تأیید
modal-mfa-protected-code-expired = کد منقضی شده؟
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = ارسال کد جدید به رایانامه.

## Modal Verify Session

mvs-verify-your-email-2 = رایانامه‌تان را تأیید کنید
mvs-enter-verification-code-2 = کد تأیید خود را وارد کنید
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = لطفاً کد تأییدی را که به <email>{ $email }</email> فرستاده شده، ظرف ۵ دقیقه وارد کنید.
msv-cancel-button = انصراف
msv-submit-button-2 = تأیید

## Settings Nav

nav-settings = تنظیمات
nav-profile = نمایه
nav-security = امنیت
nav-connected-services = خدمات متصل
nav-data-collection = جمع‌آوری و استفاده از داده‌ها
nav-paid-subs = اشتراک‌های پولی
nav-email-comm = ارتباطات رایانامه‌ای

## Page2faChange

page-2fa-change-title = تغییر احراز هویت دو مرحله‌ای
page-2fa-change-success = احراز هویت دو مرحله‌ای به‌روزرسانی شد
page-2fa-change-success-additional-message = برای محافظت از همهٔ دستگاه‌های متصل، بهتر است از همهٔ جاهایی که از این حساب استفاده می‌کنید خارج شوید و سپس با احراز هویت دو مرحله‌ای جدیدتان دوباره وارد شوید.
page-2fa-change-totpinfo-error = در جایگزینی برنامهٔ احراز هویت دو مرحله‌ای‌تان خطایی رخ داد. بعداً دوباره امتحان کنید.
page-2fa-change-qr-instruction = <strong>گام ۱:</strong> این کد QR را با یک برنامهٔ احراز هویت، مثل Duo یا Google Authenticator، اسکن کنید. با این کار اتصال جدیدی ساخته می‌شود و اتصال‌های قبلی دیگر کار نخواهند کرد.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = کدهای احراز هویت بازیابی
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = در جایگزینی کدهای احراز هویت بازیابی‌تان مشکلی پیش آمد
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = در ساختن کدهای احراز هویت بازیابی‌تان مشکلی پیش آمد
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = کدهای احراز هویت بازیابی به‌روزرسانی شدند
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = کدهای احراز هویت بازیابی ساخته شدند
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = این کدها را جایی نگه دارید که یادتان بماند. کدهای قبلی‌تان پس از انجام گام بعدی جایگزین می‌شوند.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = با وارد کردن یکی از کدها، تأیید کنید که آن‌ها را ذخیره کرده‌اید. با انجام این گام، کدهای احراز هویت بازیابی قبلی‌تان غیرفعال می‌شوند.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = کد احراز هویت بازیابی نادرست است

## Page2faSetup

page-2fa-setup-title = احراز هویت دو مرحله‌ای
page-2fa-setup-totpinfo-error = در راه‌اندازی احراز هویت دو مرحله‌ای خطایی رخ داد. بعداً دوباره امتحان کنید.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = این کد درست نیست. دوباره امتحان کنید.
page-2fa-setup-success = احراز هویت دو مرحله‌ای فعال شد
page-2fa-setup-success-additional-message = برای محافظت از همهٔ دستگاه‌های متصل، بهتر است از همهٔ جاهایی که از این حساب استفاده می‌کنید خارج شوید و سپس با احراز هویت دو مرحله‌ای دوباره وارد شوید.

## Avatar change page

avatar-page-title =
    .title = تصویر نمایه
avatar-page-add-photo = اضافه کردن تصویر
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = عکس گرفتن
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = حذف تصویر
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = گرفتن دوباره تصویر
avatar-page-cancel-button = انصراف
avatar-page-save-button = ذخیره
avatar-page-saving-button = در حال ذخیره…
avatar-page-zoom-out-button =
    .title = کوچک‌نمایی
avatar-page-zoom-in-button =
    .title = بزرگنمایی
avatar-page-rotate-button =
    .title = چرخش
avatar-page-camera-error = نمی‌توان دوربین را راه‌اندازی کرد
avatar-page-new-avatar =
    .alt = تصویر نمایه جدید
avatar-page-file-upload-error-3 = در بارگذاری تصویر نمایه‌تان مشکلی پیش آمد
avatar-page-delete-error-3 = در حذف تصویر نمایه‌تان مشکلی پیش آمد
avatar-page-image-too-large-error-2 = حجم پروندهٔ تصویر برای بارگذاری بیش از حد زیاد است

## Password change page

pw-change-header =
    .title = تغییر گذرواژه
pw-8-chars = دست‌کم ۸ نویسه
pw-not-email = نشانی رایانامهٔ شما نباشد
pw-change-must-match = گذرواژهٔ جدید با تکرار آن یکسان باشد
pw-commonly-used = گذرواژهٔ رایجی نباشد
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = امن بمانید؛ از یک گذرواژه چند بار استفاده نکنید. نکته‌های بیشتری برای <linkExternal>ساختن گذرواژه‌های قوی</linkExternal> ببینید.
pw-change-cancel-button = انصراف
pw-change-save-button = ذخیره
pw-change-forgot-password-link = گذرواژه را فراموش کرده‌اید؟
pw-change-current-password =
    .label = گذرواژهٔ فعلی را وارد کنید
pw-change-new-password =
    .label = یک گذرواژه جدید وارد کنید
pw-change-confirm-password =
    .label = تأیید گذرواژه جدید
pw-change-success-alert-2 = گذرواژه به‌روزرسانی شد

## Password create page

pw-create-header =
    .title = ایجاد گذرواژه
pw-create-success-alert-2 = گذرواژه تعیین شد
pw-create-error-2 = متأسفیم، در تعیین گذرواژه‌تان مشکلی پیش آمد

## Delete account page

delete-account-header =
    .title = حذف حساب کاربری
delete-account-step-1-2 = مرحله ۱ از ۲
delete-account-step-2-2 = مرحله ۲ از ۲
delete-account-confirm-title-4 = ممکن است { -product-mozilla-account } خود را به یک یا چند مورد از محصولات یا خدمات زیر از { -brand-mozilla } متصل کرده باشید؛ محصولاتی که شما را در وب امن و پربازده نگه می‌دارند:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = همگام‌سازی داده‌های { -brand-firefox }
delete-account-product-firefox-addons = افزونه‌های { -brand-firefox }
delete-account-acknowledge = لطفا در تأیید کنید که با حذف حساب کاربری خود:
delete-account-chk-box-1-v4 =
    .label = همهٔ اشتراک‌های پولی‌تان لغو خواهند شد
delete-account-chk-box-2 =
    .label = ممکن است اطلاعات ذخیره‌شده و ویژگی‌هایتان را در محصولات { -brand-mozilla } از دست بدهید
delete-account-chk-box-3 =
    .label = فعال‌سازی دوباره با همین رایانامه ممکن است اطلاعات ذخیره‌شده‌تان را بازنگرداند
delete-account-chk-box-4 =
    .label = همهٔ افزونه‌ها و پوسته‌هایی که در addons.mozilla.org منتشر کرده‌اید حذف خواهند شد
delete-account-continue-button = ادامه
delete-account-delete-button-passwordless = حذف حساب
delete-account-password-input =
    .label = گذرواژه را وارد کنید
delete-account-cancel-button = لغو
delete-account-delete-button-2 = حذف

## Display name page

display-name-page-title =
    .title = نام نمایشی
display-name-input =
    .label = نام نمایشی را وارد کنید
submit-display-name = ذخیره
cancel-display-name = انصراف
display-name-update-error-2 = در به‌روزرسانی نام نمایشی‌تان مشکلی پیش آمد
display-name-success-alert-2 = نام نمایشی به‌روزرسانی شد

## PagePasskeyAdd - Loading page shown during passkey creation

page-passkey-add-creating-heading = در حال ساختن کلید عبور…
page-passkey-add-follow-prompts = دستورهایی را که روی دستگاهتان نمایش داده می‌شود دنبال کنید.
page-passkey-add-cancel = انصراف

## Success / Error messages (shown in alert bar after returning to settings)

page-passkey-add-success = کلید عبور ساخته شد
page-passkey-add-error-system-v2 = در ساختن کلید عبورتان مشکلی پیش آمد. بعداً دوباره امتحان کنید.

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = فعالیت‌های اخیر حساب
# Clicking this button reveals the older account activity that is hidden at first.
recent-activity-show-more-button = نمایش بیشتر
recent-activity-account-create-v2 = حساب ساخته شد
recent-activity-account-disable-v2 = حساب غیرفعال شد
recent-activity-account-enable-v2 = حساب فعال شد
recent-activity-account-login-v2 = ورود به حساب آغاز شد
recent-activity-account-reset-v2 = بازنشانی گذرواژه آغاز شد
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = رایانامه‌های برگشتی پاک شدند
recent-activity-account-login-failure = تلاش برای ورود به حساب ناموفق بود
recent-activity-account-two-factor-added = احراز هویت دو مرحله‌ای فعال شد
recent-activity-account-two-factor-requested = احراز هویت دو مرحله‌ای درخواست شد
recent-activity-account-two-factor-failure = احراز هویت دو مرحله‌ای ناموفق بود
recent-activity-account-two-factor-success = احراز هویت دو مرحله‌ای موفق بود
recent-activity-account-two-factor-removed = احراز هویت دو مرحله‌ای برداشته شد
recent-activity-account-password-reset-requested = بازنشانی گذرواژهٔ حساب درخواست شد
recent-activity-account-password-reset-success = گذرواژهٔ حساب با موفقیت بازنشانی شد
recent-activity-account-recovery-key-added = کلید بازیابی حساب فعال شد
recent-activity-account-recovery-key-verification-failure = تأیید کلید بازیابی حساب ناموفق بود
recent-activity-account-recovery-key-verification-success = کلید بازیابی حساب با موفقیت تأیید شد
recent-activity-account-recovery-key-removed = کلید بازیابی حساب برداشته شد
recent-activity-account-password-added = گذرواژهٔ جدید اضافه شد
recent-activity-account-password-changed = گذرواژه تغییر کرد
recent-activity-account-secondary-email-added = نشانی رایانامهٔ دوم اضافه شد
recent-activity-account-secondary-email-removed = نشانی رایانامهٔ دوم برداشته شد
recent-activity-account-emails-swapped = جای رایانامه‌های اصلی و دوم عوض شد
recent-activity-session-destroy = از نشست خارج شد
recent-activity-account-recovery-phone-send-code = کد تلفن بازیابی فرستاده شد
recent-activity-account-recovery-phone-setup-complete = راه‌اندازی تلفن بازیابی کامل شد
recent-activity-account-recovery-phone-signin-complete = ورود با تلفن بازیابی انجام شد
recent-activity-account-recovery-phone-signin-failed = ورود با تلفن بازیابی ناموفق بود
recent-activity-account-recovery-phone-removed = تلفن بازیابی برداشته شد
recent-activity-account-recovery-codes-replaced = کدهای بازیابی جایگزین شدند
recent-activity-account-recovery-codes-created = کدهای بازیابی ساخته شدند
recent-activity-account-recovery-codes-signin-complete = ورود با کدهای بازیابی انجام شد
recent-activity-password-reset-otp-sent = کد تأیید بازنشانی گذرواژه فرستاده شد
recent-activity-password-reset-otp-verified = کد تأیید بازنشانی گذرواژه تأیید شد
recent-activity-must-reset-password = بازنشانی گذرواژه الزامی است
recent-activity-account-recovery-phone-replace-complete = تلفن بازیابی جایگزین شد
recent-activity-account-recovery-phone-replace-failure = جایگزینی تلفن بازیابی ناموفق بود
recent-activity-account-two-factor-replace-success = احراز هویت دو مرحله‌ای جایگزین شد
recent-activity-account-two-factor-replace-failure = جایگزینی احراز هویت دو مرحله‌ای ناموفق بود
recent-activity-account-recovery-phone-setup-failed = راه‌اندازی تلفن بازیابی ناموفق بود
recent-activity-account-recovery-phone-reset-password-complete = بازنشانی گذرواژه با تلفن بازیابی انجام شد
recent-activity-account-recovery-phone-reset-password-failed = بازنشانی گذرواژه با تلفن بازیابی ناموفق بود
# A code was emailed to the user to authorize a sensitive account change (e.g. removing 2FA, deleting the account).
recent-activity-account-mfa-otp-sent = مجوز تغییر حساب درخواست شد
# The user successfully entered the code emailed to authorize a sensitive account change.
recent-activity-account-mfa-otp-verified = تغییر حساب مجاز شد
# The user entered an incorrect or expired code when trying to authorize a sensitive account change.
recent-activity-account-mfa-otp-failed = صدور مجوز تغییر حساب ناموفق بود
recent-activity-account-passkey-registration-success = کلید عبور اضافه شد
recent-activity-account-passkey-registration-failure = ثبت کلید عبور ناموفق بود
recent-activity-account-passkey-removed = کلید عبور برداشته شد
recent-activity-account-passkey-authentication-success = ورود با کلید عبور انجام شد
recent-activity-account-passkey-authentication-failure = ورود با کلید عبور ناموفق بود
recent-activity-account-passwordless-login-otp-sent = کد ورود بدون گذرواژه فرستاده شد
recent-activity-account-passwordless-login-otp-failed = کد ورود بدون گذرواژه ناموفق بود
recent-activity-account-passwordless-login-otp-verified = کد ورود بدون گذرواژه تأیید شد
recent-activity-account-passwordless-registration-complete = ثبت‌نام حساب بدون گذرواژه کامل شد
recent-activity-account-recovery-codes-set = کدهای بازیابی تنظیم شدند
# A passkey is a sign-in method that replaces a password. This string is shown when a passkey was set up so it can also unlock the user's synced browser data (bookmarks, history, open tabs), which previously required their password.
recent-activity-account-passkey-wrap-created = کلید عبور برای همگام‌سازی فعال شد
# A passkey is a sign-in method that replaces a password. This string is shown when an attempt to set a passkey up to unlock the user's synced browser data did not complete.
recent-activity-account-passkey-wrap-creation-failure = راه‌اندازی همگام‌سازی با کلید عبور ناموفق بود
# A passkey is a sign-in method that replaces a password. This string is shown when a passkey that could unlock the user's synced browser data had that access turned off, leaving the passkey itself usable for signing in.
recent-activity-account-passkey-wrap-deleted = دسترسی همگام‌سازی کلید عبور برداشته شد
# A passkey is a sign-in method that replaces a password. This string is shown when an attempt to turn off a passkey's access to the user's synced browser data did not complete.
recent-activity-account-passkey-wrap-deletion-failure = برداشتن دسترسی همگام‌سازی کلید عبور ناموفق بود
# A passkey is a sign-in method that replaces a password. Resetting a forgotten password re-encrypts the user's synced browser data, which their passkeys can no longer unlock. This string is shown when that happened and the passkeys need to be set up for syncing again.
recent-activity-account-passkey-wrap-invalidated = دسترسی همگام‌سازی کلید عبور پس از بازنشانی گذرواژه برداشته شد
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = فعالیت‌های دیگر حساب

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = کلید بازیابی حساب
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = بازگشت به تنظیمات

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = برداشتن شمارهٔ تلفن بازیابی
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = با این کار، <strong>{ $formattedFullPhoneNumber }</strong> دیگر تلفن بازیابی شما نخواهد بود.
settings-recovery-phone-remove-recommend = پیشنهاد می‌کنیم این روش را نگه دارید، چون از نگهداری کدهای احراز هویت بازیابی ساده‌تر است.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = اگر آن را حذف می‌کنید، مطمئن شوید که کدهای احراز هویت بازیابی ذخیره‌شده‌تان را هنوز دارید. <linkExternal>مقایسهٔ روش‌های بازیابی</linkExternal>
settings-recovery-phone-remove-button = برداشتن شماره تلفن
settings-recovery-phone-remove-cancel = انصراف
settings-recovery-phone-remove-success = تلفن بازیابی برداشته شد

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = افزودن تلفن بازیابی
page-change-recovery-phone = تغییر تلفن بازیابی
page-setup-recovery-phone-back-button-title = بازگشت به تنظیمات
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = تغییر شماره تلفن

## Add secondary email page

add-secondary-email-step-1 = مرحله ۱ از ۲
add-secondary-email-error-2 = در ساختن این رایانامه مشکلی پیش آمد
add-secondary-email-page-title =
    .title = رایانامهٔ دوم
add-secondary-email-enter-address =
    .label = نشانی رایانامه را وارد کنید
add-secondary-email-cancel-button = لغو
add-secondary-email-save-button = ذخیره
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = از رایانامه‌های پوششی نمی‌توان به‌عنوان رایانامهٔ دوم استفاده کرد

## Verify secondary email page

add-secondary-email-step-2 = مرحلهٔ ۲ از ۲
verify-secondary-email-page-title =
    .title = رایانامهٔ دوم
verify-secondary-email-verification-code-2 =
    .label = کد تأیید خود را وارد کنید
verify-secondary-email-cancel-button = لغو
verify-secondary-email-verify-button-2 = تأیید
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = لطفاً کد تأییدی را که به <strong>{ $email }</strong> فرستاده شده، ظرف ۵ دقیقه وارد کنید.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = { $email } با موفقیت اضافه شد
verify-secondary-email-resend-code-button = ارسال دوبارهٔ کد تأیید

##

# Link to delete account on main Settings page
delete-account-link = حذف حساب
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = با موفقیت وارد شدید. { -product-mozilla-account } و داده‌هایتان فعال باقی می‌مانند.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = ببینید اطلاعات خصوصی‌تان کجا فاش شده و کنترل آن را به دست بگیرید
# Links out to the Monitor site
product-promo-monitor-cta = اسکن رایگان
product-promo-vpn =
    .alt = { -product-mozilla-vpn }
product-promo-vpn-description = یک لایهٔ اضافه از مرور ناشناس و محافظت را تجربه کنید.
# Links out to the VPN site
product-promo-vpn-cta = دریافت { -product-mozilla-vpn-short }

## Profile section

profile-heading = نمایه
profile-picture =
    .header = تصویر
profile-display-name =
    .header = نام نمایشی
profile-primary-email =
    .header = رایانامهٔ اصلی

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = گام { $currentStep } از { $numberOfSteps }.

## Security section of Setting

security-heading = امنیت
security-password =
    .header = گذرواژه
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = ساخته‌شده در { $date }
security-not-set = تنظیم نشده
security-action-create = ایجاد
security-set-password = برای همگام‌سازی و استفاده از برخی ویژگی‌های امنیتی حساب، یک گذرواژه تعیین کنید.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = مشاهدهٔ فعالیت‌های اخیر حساب
signout-sync-header = نشست منقضی شد
signout-sync-session-expired = متأسفیم، مشکلی پیش آمد. لطفاً از منوی مرورگر خارج شوید و دوباره امتحان کنید.

## SubRow component

tfa-row-backup-codes-title = کدهای احراز هویت بازیابی
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = هیچ کدی در دسترس نیست
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] { $numCodesAvailable } کد باقی مانده
       *[other] { $numCodesAvailable } کد باقی مانده
    }
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = ساخت کدهای جدید
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = افزودن
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = اگر نتوانید از دستگاه همراه یا برنامهٔ احراز هویتتان استفاده کنید، این امن‌ترین روش بازیابی است.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = تلفن بازیابی
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = هیچ شماره تلفنی اضافه نشده
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = تغییر
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = افزودن
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = حذف
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = برداشتن تلفن بازیابی
tfa-row-backup-phone-delete-restriction-v2 = اگر می‌خواهید تلفن بازیابی‌تان را بردارید، برای اینکه دسترسی‌تان به حساب قطع نشود، اول کدهای احراز هویت بازیابی اضافه کنید یا احراز هویت دو مرحله‌ای را غیرفعال کنید.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = اگر نتوانید از برنامهٔ احراز هویتتان استفاده کنید، این ساده‌ترین روش بازیابی است.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = دربارهٔ خطر تعویض سیم‌کارت بدانید
# This is a string that shows when the user's passkey was created.
# Variables:
#   $createdDate (String) - a localized date string
passkey-sub-row-created-date = ساخته‌شده در: { $createdDate }
# This is a string that shows when the user's passkey was last used.
# Variables:
#   $lastUsedDate (String) - a localized date string
passkey-sub-row-last-used-date = آخرین استفاده: { $lastUsedDate }
passkey-sub-row-delete-title = حذف کلید عبور
passkey-delete-modal-heading = کلید عبورتان حذف شود؟
passkey-delete-modal-content-v2 = این کلید عبور از حسابتان برداشته می‌شود. برای ورود باید از روش دیگری استفاده کنید (گذرواژه، کلید عبور دیگر یا حساب پیوندشده).
passkey-delete-modal-cancel-button = انصراف
passkey-delete-modal-confirm-button = حذف کلید عبور
passkey-delete-success = کلید عبور حذف شد
passkey-delete-error = در حذف کلید عبورتان مشکلی پیش آمد. چند دقیقهٔ دیگر دوباره امتحان کنید.
passkey-sub-row-rename-title = تغییر نام کلید عبور
passkey-rename-modal-heading = تغییر نام کلید عبور
passkey-rename-modal-description = یک نام جدید برای این کلید عبور وارد کنید.
passkey-rename-input-label = نام کلید عبور
passkey-rename-save-button = ذخیره
passkey-rename-cancel-button = انصراف
passkey-rename-error-empty = یک نام برای این کلید عبور وارد کنید
passkey-rename-error-too-long = نام باید کمتر از ۲۵۶ نویسه داشته باشد.
passkey-rename-error-invalid = فقط حروف، اعداد، علائم نگارشی و نمادها مجازند.
passkey-rename-error-duplicate = کلید عبوری با این نام از قبل وجود دارد
passkey-rename-success = نام کلید عبور تغییر کرد
passkey-rename-error = در تغییر نام کلید عبورتان مشکلی پیش آمد. چند دقیقهٔ دیگر دوباره امتحان کنید.

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = خاموش کردن
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = روشن کردن
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = در حال ارسال…
switch-is-on = روشن
switch-is-off = خاموش

## Sub-section row Defaults

row-defaults-action-add = افزودن
row-defaults-action-change = تغییر
row-defaults-action-disable = غیرفعال کردن
row-defaults-status = هیچ

## UnitRowPasskey

passkey-row-header = کلیدهای عبور
passkey-row-enabled = فعال
passkey-row-not-set = تنظیم نشده
passkey-row-action-create = ساختن
passkey-row-description = با استفاده از تلفن یا دستگاه پشتیبانی‌شدهٔ دیگری برای ورود به حسابتان، ورود را ساده‌تر و امن‌تر کنید.
# External link to a support article about passkeys.
passkey-row-info-link-2 = بیشتر بدانید
# Shown as a warning banner when the user has registered the maximum number of passkeys.
# Variables:
#   $count (Number) - the maximum number of passkeys allowed (defaults to 10 allowed)
passkey-row-max-limit-banner =
    { $count ->
       *[other] از همهٔ { $count } کلید عبور خود استفاده کرده‌اید. برای ساختن کلید عبور جدید، یکی از آن‌ها را حذف کنید.
    }
# Tooltip shown on the disabled Create button when the passkey limit is reached
passkey-row-max-limit-disabled-reason = به حداکثر تعداد کلیدهای عبور رسیده‌اید.

## Account recovery key sub-section on main Settings page

rk-header-1 = کلید بازیابی حساب
rk-enabled = فعال
rk-not-set = تنظیم نشده
rk-action-create = ایجاد
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = تغییر
rk-action-remove = برداشتن
rk-key-removed-2 = کلید بازیابی حساب برداشته شد
rk-cannot-remove-key = کلید بازیابی حسابتان برداشته نشد.
rk-refresh-key-1 = تازه‌سازی کلید بازیابی حساب
rk-content-explain = وقتی گذرواژه‌تان را فراموش کردید، اطلاعاتتان را بازگردانید.
rk-cannot-verify-session-4 = متأسفیم، در تأیید نشست شما مشکلی پیش آمد
rk-remove-modal-heading-1 = کلید بازیابی حساب برداشته شود؟
rk-remove-modal-content-1 = اگر گذرواژه‌تان را بازنشانی کنید، دیگر نمی‌توانید با کلید بازیابی حسابتان به داده‌هایتان دسترسی پیدا کنید. این کار برگشت‌پذیر نیست.
rk-remove-error-2 = کلید بازیابی حسابتان برداشته نشد
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = حذف کلید بازیابی حساب

## Secondary email sub-section on main Settings page

se-heading = رایانامهٔ دوم
    .header = رایانامهٔ دوم
se-cannot-refresh-email = متأسفیم، در تازه‌سازی این رایانامه مشکلی پیش آمد.
se-cannot-resend-code-3 = متأسفیم، در ارسال دوبارهٔ کد تأیید مشکلی پیش آمد
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } اکنون رایانامهٔ اصلی شماست
se-set-primary-error-2 = متأسفیم، در تغییر رایانامهٔ اصلی‌تان مشکلی پیش آمد
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = { $email } با موفقیت حذف شد
se-delete-email-error-2 = متأسفیم، در حذف این رایانامه مشکلی پیش آمد
se-verify-session-3 = برای انجام این کار باید نشست فعلی‌تان را تأیید کنید
se-verify-session-error-3 = متأسفیم، در تأیید نشست شما مشکلی پیش آمد
# Button to remove the secondary email
se-remove-email =
    .title = برداشتن رایانامه
# Button to refresh secondary email status
se-refresh-email =
    .title = تازه‌سازی رایانامه
se-unverified-2 = تأییدنشده
se-resend-code-2 = تأیید لازم است. اگر رایانامه در صندوق ورودی یا پوشهٔ هرزنامه نیست، <button>کد تأیید را دوباره بفرستید</button>.
# Button to make secondary email the primary
se-make-primary = تبدیل به اصلی
se-default-content = اگر نتوانستید وارد رایانامهٔ اصلی‌تان شوید، از این راه به حسابتان دسترسی پیدا کنید.
se-content-note-1 = توجه: رایانامهٔ دوم اطلاعاتتان را بازنمی‌گرداند؛ برای این کار به یک <a>کلید بازیابی حساب</a> نیاز دارید.
# Default value for the secondary email
se-secondary-email-none = هیچ

## Two Step Auth sub-section on Settings main page

tfa-row-header = احراز هویت دو مرحله‌ای
tfa-row-enabled = فعال
tfa-row-disabled-status = غیرفعال
tfa-row-action-add = افزودن
tfa-row-action-disable = غیرفعال کردن
tfa-row-action-change = تغییر
tfa-row-button-refresh =
    .title = تازه‌سازی احراز هویت دو مرحله‌ای
tfa-row-cannot-refresh = متأسفیم، در تازه‌سازی احراز هویت دو مرحله‌ای مشکلی پیش آمد.
tfa-row-enabled-description = حساب شما با احراز هویت دو مرحله‌ای محافظت می‌شود. هنگام ورود به { -product-mozilla-account } باید یک رمز یک‌بارمصرف از برنامهٔ احراز هویتتان وارد کنید.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = این روش چطور از حسابتان محافظت می‌کند
tfa-row-disabled-description-v2 = با استفاده از یک برنامهٔ احراز هویت شخص ثالث به‌عنوان گام دوم ورود، به امنیت حسابتان کمک کنید.
tfa-row-cannot-verify-session-4 = متأسفیم، در تأیید نشست شما مشکلی پیش آمد
tfa-row-disable-modal-heading = احراز هویت دو مرحله‌ای غیرفعال شود؟
tfa-row-disable-modal-confirm = غیرفعال کردن
tfa-row-disable-modal-explain-1 = این کار برگشت‌پذیر نیست. می‌توانید به‌جای آن <linkExternal>کدهای احراز هویت بازیابی‌تان را جایگزین کنید</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = احراز هویت دو مرحله‌ای غیرفعال شد
tfa-row-cannot-disable-2 = احراز هویت دو مرحله‌ای غیرفعال نشد
tfa-row-verify-session-info = برای راه‌اندازی احراز هویت دو مرحله‌ای باید نشست فعلی‌تان را تأیید کنید

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list of <serviceName>: Terms of Service, Privacy Notice
terms-privacy-agreement-intro-3 = با ادامه دادن، با موارد زیر موافقت می‌کنید:
# This item is part of a bulleted list and follows terms-privacy-agreement-intro
# $serviceName (String) - The name of the service (e.g., "Mozilla Subscription Services")
# $serviceName is customizable via Strapi and will be localized separately
terms-privacy-agreement-customized-terms = { $serviceName }: <termsLink>شرایط خدمات</termsLink> و <privacyLink>اطلاعیهٔ حریم خصوصی</privacyLink>
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla-2 = { -product-mozilla-accounts(capitalization: "uppercase") }: <mozillaAccountsTos>شرایط خدمات</mozillaAccountsTos> و <mozillaAccountsPrivacy>اطلاعیهٔ حریم خصوصی</mozillaAccountsPrivacy>
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = با ادامه دادن، با <mozillaAccountsTos>شرایط خدمات</mozillaAccountsTos> و <mozillaAccountsPrivacy>اطلاعیهٔ حریم خصوصی</mozillaAccountsPrivacy> موافقت می‌کنید.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button) / (continue-with-apple-button). The two buttons show their label as visible text.
third-party-auth-options-or = یا
continue-with-google-button = ادامه با { -brand-google }
continue-with-apple-button = ادامه با { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = حساب ناشناخته
auth-error-103 = گذرواژه نادرست است
auth-error-105-2 = کد تأیید نامعتبر است
auth-error-110 = توکن نامعتبر است
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = تعداد تلاش‌هایتان بیش از حد شده است. لطفاً بعداً دوباره امتحان کنید.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = تعداد تلاش‌هایتان بیش از حد شده است. لطفاً { $retryAfter } دوباره امتحان کنید.
auth-error-125 = درخواست به دلایل امنیتی مسدود شد
auth-error-129-2 = شماره تلفنی که وارد کردید نامعتبر است. لطفاً آن را بررسی کنید و دوباره امتحان کنید.
auth-error-138-2 = نشست تأیید نشده است
auth-error-139 = رایانامهٔ دوم باید با رایانامهٔ حسابتان متفاوت باشد
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = این رایانامه توسط حساب دیگری رزرو شده است. بعداً دوباره امتحان کنید یا از نشانی رایانامهٔ دیگری استفاده کنید.
auth-error-155 = توکن TOTP پیدا نشد
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = کد احراز هویت بازیابی پیدا نشد
auth-error-159 = کلید بازیابی حساب نامعتبر است
auth-error-183-2 = کد تأیید نامعتبر است یا منقضی شده
auth-error-202 = این ویژگی فعال نیست
auth-error-203 = سامانه در دسترس نیست، کمی بعد دوباره امتحان کنید
auth-error-206 = نمی‌توان گذرواژه ساخت، گذرواژه از قبل تعیین شده است
auth-error-214 = شمارهٔ تلفن بازیابی از قبل وجود دارد
auth-error-215 = شمارهٔ تلفن بازیابی وجود ندارد
auth-error-216 = به سقف تعداد پیامک‌ها رسیده‌اید
auth-error-218 = نمی‌توان تلفن بازیابی را برداشت، چون کدهای احراز هویت بازیابی ندارید.
auth-error-219 = این شماره تلفن با تعداد بیش از حدی حساب ثبت شده است. لطفاً شمارهٔ دیگری را امتحان کنید.
auth-error-224 = کلید عبور پیدا نشد
auth-error-225 = کلید عبور قبلاً ثبت شده است
auth-error-226 = به سقف تعداد کلیدهای عبور رسیده‌اید
auth-error-227 = احراز هویت با کلید عبور ناموفق بود
auth-error-228 = ثبت کلید عبور ناموفق بود
auth-error-233 = برای ساختن کلید عبور، روی دستگاه یا کلید امنیتی‌تان قفل صفحه، PIN، اثر انگشت یا تشخیص چهره را راه‌اندازی کنید. سپس دوباره امتحان کنید.
auth-error-238 = چالش کلید عبور ناموفق بود
auth-error-239 = متأسفیم، نتوانستیم حسابتان را حذف کنیم. لطفاً دوباره امتحان کنید و اگر مشکل ادامه داشت، با پشتیبانی تماس بگیرید.
auth-error-240 = این حساب غیرفعال شده است
auth-error-999 = خطای غیرمنتظره
auth-error-1001 = تلاش برای ورود لغو شد
auth-error-1002 = نشست منقضی شد. برای ادامه وارد شوید.
auth-error-1003 = فضای ذخیره‌سازی محلی یا کوکی‌ها هنوز غیرفعال‌اند
auth-error-1008 = گذرواژهٔ جدیدتان باید متفاوت باشد
auth-error-1010 = گذرواژهٔ معتبر لازم است
auth-error-1011 = رایانامهٔ معتبر لازم است
auth-error-1018 = رایانامهٔ تأییدتان همین الان برگشت خورد. رایانامه را اشتباه نوشته‌اید؟
auth-error-1020 = رایانامه را اشتباه نوشته‌اید؟ firefox.com یک سرویس رایانامهٔ معتبر نیست
auth-error-1031 = برای ثبت‌نام باید سنتان را وارد کنید
auth-error-1032 = برای ثبت‌نام باید سن معتبری وارد کنید
auth-error-1054 = کد احراز هویت دو مرحله‌ای نامعتبر است
auth-error-1056 = کد احراز هویت بازیابی نامعتبر است
auth-error-1062 = تغییر مسیر نامعتبر است
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = رایانامه را اشتباه نوشته‌اید؟ { $domain } یک سرویس رایانامهٔ معتبر نیست
auth-error-1066 = از رایانامه‌های پوششی نمی‌توان برای ساختن حساب استفاده کرد.
auth-error-1067 = رایانامه را اشتباه نوشته‌اید؟
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = شماره‌ای که به { $lastFourPhoneNumber } ختم می‌شود
oauth-error-1000 = مشکلی پیش آمد. لطفاً این زبانه را ببندید و دوباره امتحان کنید.

## Passkey error messages
## Surfaced when a WebAuthn ceremony (registration or sign-in) fails.

# User cancelled or dismissed the browser prompt, or the authenticator could not satisfy the options
passkey-registration-error-not-allowed = راه‌اندازی کلید عبور ناموفق بود یا در دسترس نیست. دوباره امتحان کنید یا روش دیگری انتخاب کنید.
# Shown on NotAllowedError when the account already has passkeys (excludeCredentials was sent).
# Firefox collapses user-cancel and duplicate-authenticator into the same error, but duplicate is
# the far more likely cause when the user has existing passkeys, so we state it plainly.
passkey-registration-error-not-allowed-existing = راه‌اندازی کلید عبور با این دستگاه ممکن نیست. یا این دستگاه قبلاً ثبت شده یا فرایند راه‌اندازی لغو شده است.
# The ceremony timed out before the user responded
passkey-registration-error-timeout = راه‌اندازی کلید عبور لغو شد. دوباره امتحان کنید.
passkey-registration-canceled-v2 = زمان راه‌اندازی کلید عبور به پایان رسید یا لغو شد.
# Link label appended after passkey-registration-canceled-v2, opens a SUMO support article.
passkey-registration-canceled-link = بیشتر بدانید
# Browser or platform does not support passkeys or the requested options (e.g., user verification, discoverable credential).
passkey-registration-error-not-supported-v2 = مرورگر یا دستگاه شما از کلید عبور پشتیبانی نمی‌کند.
# Link label appended after passkey-registration-error-not-supported-v2, opens a SUMO support article.
passkey-registration-error-not-supported-link = بیشتر بدانید
# Generic fallback shown when passkey setup fails for an indeterminate reason.
# Keep the tone neutral; do not imply the device is unsupported or that the user cancelled.
# "method" here means an alternative way to create the passkey (e.g. another password manager or security key), not a different account or sign-in option.
passkey-registration-error-could-not-complete = راه‌اندازی کلید عبور کامل نشد. روش یا دستگاه دیگری را امتحان کنید.
# Link label appended after passkey-registration-error-could-not-complete, opens a SUMO support article.
passkey-registration-error-could-not-complete-link = بیشتر بدانید
# RP ID / origin mismatch, or insecure context (e.g., embedded iframe, wrong domain)
passkey-registration-error-security = در این صفحه نمی‌توان کلید عبور راه‌اندازی کرد. از وبگاه امن استفاده کنید و دوباره امتحان کنید.
# A credential for this RP already exists on the authenticator (excludeCredentials match)
passkey-registration-error-invalid-state = این کلید عبور قبلاً ثبت شده است. با آن وارد شوید یا کلید عبور دیگری اضافه کنید.
# Authenticator I/O failure (e.g., security key disconnected mid-ceremony)
passkey-registration-error-not-readable = نتوانستیم به احرازگر دسترسی پیدا کنیم. دوباره امتحان کنید یا روش دیگری انتخاب کنید.
# Attestation constraints or device-specific restrictions can't be met
passkey-registration-error-constraint = راه‌اندازی کلید عبور با این دستگاه ممکن نیست. روش یا دستگاه دیگری را امتحان کنید.
# Catch-all for unexpected errors during registration (TypeError, DataError, EncodingError, OperationError, UnknownError)
passkey-registration-error-unexpected = راه‌اندازی کلید عبور ناموفق بود. دوباره امتحان کنید یا روش دیگری انتخاب کنید.
# Shown as a warning (not error) banner when a passkey sign-in is cancelled, no passkey is
# available on this device, or the authenticator can't satisfy the request. Copy stays neutral and
# points the user to another way to sign in.
passkey-authentication-trouble-heading = ورود با کلید عبور ممکن نشد
# Shown when a passkey sign-in doesn't complete. "Try again" means retry signing in with the
# passkey; "another sign-in option" means one of the other sign-in methods offered alongside it.
passkey-authentication-trouble-description = دوباره امتحان کنید یا از روش دیگری برای ورود استفاده کنید.
# Label for the support link in the passkey sign-in trouble message; opens a SUMO article about
# using passkeys.
passkey-authentication-trouble-link = چطور از کلید عبور استفاده کنیم
# User cancelled or dismissed the browser prompt, or no passkey is available / verification failed
passkey-authentication-error-not-allowed = ورود با کلید عبور ناموفق بود یا در دسترس نیست. دوباره امتحان کنید یا روش دیگری انتخاب کنید.
# User already registered a device
passkey-authentication-error-not-allowed-existing = راه‌اندازی کلید عبور با این دستگاه ممکن نیست. لطفاً دوباره امتحان کنید یا روش دیگری انتخاب کنید.
# The ceremony timed out before the user responded
passkey-authentication-error-timeout = زمان درخواست کلید عبور به پایان رسید. لطفاً دوباره امتحان کنید.
# Shown in a warning (not error) banner when the passkey sign-in ceremony times out.
passkey-authentication-error-timeout-v2 = زمان ورود با کلید عبور به پایان رسید. دوباره امتحان کنید.
# Browser or platform does not support passkeys
passkey-authentication-error-not-supported-v2 = مرورگر یا دستگاه شما از کلید عبور پشتیبانی نمی‌کند.
# RP ID / origin mismatch, or insecure context (e.g., embedded iframe)
passkey-authentication-error-security = در این صفحه نمی‌توان از کلید عبور استفاده کرد. مطمئن شوید در وبگاه امن درست هستید و دوباره امتحان کنید.
# Unexpected credential state during authentication
passkey-authentication-error-invalid-state = مشکلی در کلید عبورتان پیش آمد. دوباره امتحان کنید یا از روش دیگری برای ورود استفاده کنید.
# Authenticator I/O failure (e.g., security key disconnected mid-ceremony)
passkey-authentication-error-not-readable = نتوانستیم به احرازگر دسترسی پیدا کنیم. دوباره امتحان کنید یا از روش دیگری برای ورود استفاده کنید.
# Catch-all for unexpected errors during authentication (TypeError, DataError, EncodingError, ConstraintError, OperationError, UnknownError)
passkey-authentication-error-unexpected = مشکلی پیش آمد. دوباره امتحان کنید یا روش دیگری برای ورود انتخاب کنید.
# Server returned 404 PASSKEY_NOT_FOUND — the assertion was for a credential
# that no longer exists on the account (e.g., the user deleted the passkey
# from their account but the authenticator still has the credential).
passkey-authentication-error-not-found = کلید عبور شناسایی نشد. از روش دیگری برای ورود استفاده کنید.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = وارد { -brand-firefox } شده‌اید
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = رایانامه تأیید شد
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = ورود تأیید شد
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = برای تکمیل راه‌اندازی، وارد این { -brand-firefox } شوید
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = ورود
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = هنوز دستگاه اضافه می‌کنید؟ برای تکمیل راه‌اندازی، در دستگاه دیگری وارد { -brand-firefox } شوید
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = برای تکمیل راه‌اندازی، در دستگاه دیگری وارد { -brand-firefox } شوید
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = می‌خواهید زبانه‌ها، نشانک‌ها و گذرواژه‌هایتان را در دستگاه دیگری هم داشته باشید؟
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = اتصال دستگاهی دیگر
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = الان نه
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = برای تکمیل راه‌اندازی، وارد { -brand-firefox } برای اندروید شوید
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = برای تکمیل راه‌اندازی، وارد { -brand-firefox } برای iOS شوید

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = فضای ذخیره‌سازی محلی و کوکی‌ها لازم‌اند
cookies-disabled-enable-prompt-2 = برای دسترسی به { -product-mozilla-account } خود، لطفاً کوکی‌ها و فضای ذخیره‌سازی محلی را در مرورگرتان فعال کنید. با این کار امکاناتی مثل به خاطر سپردن شما بین نشست‌ها فعال می‌شود.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = تلاش دوباره
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = بیشتر بدانید

## Index / home page

index-header = رایانامه‌تان را وارد کنید
index-sync-header = ادامه به { -product-mozilla-account }
index-sync-subheader = گذرواژه‌ها، زبانه‌ها و نشانک‌هایتان را در هر جایی که از { -brand-firefox } استفاده می‌کنید همگام کنید.
index-relay-header = ساختن رایانامهٔ پوششی
index-relay-subheader = لطفاً نشانی رایانامه‌ای را بدهید که می‌خواهید رایانامه‌های نشانی پوششی‌تان به آن هدایت شوند.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = ادامه به { $serviceName }
index-subheader-default = ادامه به تنظیمات حساب
index-cta = ثبت‌نام یا ورود
index-account-info = با { -product-mozilla-account } به محصولات بیشتری از { -brand-mozilla } که از حریم خصوصی‌تان محافظت می‌کنند هم دسترسی پیدا می‌کنید.
index-email-input =
    .label = رایانامه‌تان را وارد کنید
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = حساب با موفقیت حذف شد
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = رایانامهٔ تأییدتان همین الان برگشت خورد. رایانامه را اشتباه نوشته‌اید؟

## Page offering to store a passkey so that later Firefox Sync sign-ins skip the password.

# Browser tab title.
inline-passwordless-sync-setup-page-title = دفعهٔ بعد بدون گذرواژه وارد شوید؟
# Success banner after signing in.
inline-passwordless-sync-setup-success-banner = وارد { -brand-firefox } شدید
inline-passwordless-sync-setup-heading = دفعهٔ بعد بدون گذرواژه وارد شوید؟
inline-passwordless-sync-setup-description = با این کلید عبور سریع‌تر وارد شوید.
inline-passwordless-sync-setup-enable-button = فعال کردن کلید عبور
# Button label while the passkey is stored.
inline-passwordless-sync-setup-enabling = در حال فعال‌سازی…
inline-passwordless-sync-setup-not-now-button = الان نه
# Success message shown in the Settings alert bar after the passkey was stored.
inline-passwordless-sync-setup-success-alert = این کلید عبور برای ورود به همگام‌سازی آماده است
# Error banner shown on the page when the passkey confirmation prompt was dismissed or timed out. The button below it tries again.
inline-passwordless-sync-setup-error-cancelled = تأیید کلید عبور کامل نشد
inline-passwordless-sync-setup-error-cancelled-description = با کلید عبورتان تأیید کنید تا دفعهٔ بعد بدون گذرواژه وارد شوید.
# Error shown in the Settings alert bar when storing the passkey failed. The user is already signed in; only the password-free setup failed, so the next sign-in still asks for a password.
inline-passwordless-sync-setup-error-generic = مشکلی پیش آمد؛ دفعهٔ بعد هم باید گذرواژه‌تان را وارد کنید

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = ای وای! نتوانستیم کلید بازیابی حسابتان را بسازیم. لطفاً بعداً دوباره امتحان کنید.
inline-recovery-key-setup-recovery-created = کلید بازیابی حساب ساخته شد
inline-recovery-key-setup-download-header = از حسابتان محافظت کنید
inline-recovery-key-setup-download-subheader = همین حالا آن را بارگیری و نگهداری کنید
inline-recovery-key-setup-download-info = این کلید را جایی نگه دارید که یادتان بماند؛ بعداً نمی‌توانید به این صفحه برگردید.
inline-recovery-key-setup-hint-header = توصیهٔ امنیتی

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = لغو راه‌اندازی
inline-totp-setup-continue-button = ادامه
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = با الزام به وارد کردن کدهای احراز هویت از یکی از <authenticationAppsLink>این برنامه‌های احراز هویت</authenticationAppsLink>، یک لایهٔ امنیتی به حسابتان اضافه کنید.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = احراز هویت دو مرحله‌ای را فعال کنید <span>تا به تنظیمات حساب بروید</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = احراز هویت دو مرحله‌ای را فعال کنید <span>تا به { $serviceName } بروید</span>
inline-totp-setup-ready-button = آماده
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = کد احراز هویت را اسکن کنید <span>تا به { $serviceName } بروید</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = کد را دستی وارد کنید <span>تا به { $serviceName } بروید</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = کد احراز هویت را اسکن کنید <span>تا به تنظیمات حساب بروید</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = کد را دستی وارد کنید <span>تا به تنظیمات حساب بروید</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = این کلید محرمانه را در برنامهٔ احراز هویتتان وارد کنید. <toggleToQRButton>به‌جای آن کد QR را اسکن می‌کنید؟</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = کد QR را در برنامهٔ احراز هویتتان اسکن کنید و سپس کد احراز هویتی را که نشان می‌دهد وارد کنید. <toggleToManualModeButton>نمی‌توانید کد را اسکن کنید؟</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = پس از تکمیل، برنامه شروع به ساختن کدهای احراز هویت می‌کند تا آن‌ها را وارد کنید.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = کد احراز هویت
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = کد احراز هویت لازم است
tfa-qr-code-alt = برای راه‌اندازی احراز هویت دو مرحله‌ای در برنامه‌های پشتیبانی‌شده، از کد { $code } استفاده کنید.
inline-totp-setup-page-title = احراز هویت دو مرحله‌ای

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = همین حالا وارد { -brand-firefox } شدید؟
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = بله، دستگاه را تأیید می‌کنم
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = اگر شما نبودید، <a>گذرواژه‌تان را تغییر دهید</a>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = دستگاه متصل شد
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = اکنون در حال همگام‌سازی با این دستگاه هستید: { $deviceFamily } روی { $deviceOS }
pair-auth-complete-sync-benefits-text = حالا می‌توانید در همهٔ دستگاه‌هایتان به زبانه‌های باز، گذرواژه‌ها و نشانک‌هایتان دسترسی داشته باشید.
pair-auth-complete-see-tabs-button = دیدن زبانه‌های دستگاه‌های همگام‌شده
pair-auth-complete-manage-devices-link = مدیریت دستگاه‌ها

## Alternate "Send Tab" variant — shown when the pair was initiated from a Send Tab entrypoint (toolbar icon, app menu, etc.)

# Heading
pair-auth-complete-send-tab-heading = آماده‌اید که زبانه بفرستید
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-send-tab-device-connected = { $deviceFamily } برای { $deviceOS } متصل شد.
pair-auth-complete-send-tab-benefits = حالا می‌توانید زبانه‌های باز، گذرواژه‌ها و نشانک‌ها را فوراً بین دستگاه‌هایتان بفرستید.

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = کد احراز هویت را وارد کنید <span>تا به تنظیمات حساب بروید</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = کد احراز هویت را وارد کنید <span>تا به { $serviceName } بروید</span>
auth-totp-instruction = برنامهٔ احراز هویتتان را باز کنید و کد احراز هویتی را که نشان می‌دهد وارد کنید.
auth-totp-input-label = کد ۶ رقمی را وارد کنید
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = تأیید
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = کد احراز هویت لازم است

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = اکنون تأیید لازم است <span>از دستگاه دیگرتان</span>

## PairFailure - a view which displays on failure of the device pairing process

# v2: Updated wording to align with the legacy Backbone pair/failure copy.
pair-failure-header-v2 = جفت‌سازی دستگاه ناموفق بود
pair-failure-message-v2 = راه‌اندازی کامل نشد. لطفاً با رایانامه‌تان وارد شوید.
pair-failure-try-again-link = تلاش دوباره

## Pair index page

pair-sync-header = { -brand-firefox } را روی تلفن یا تبلتتان همگام کنید
pair-cad-header-v2 = اتصال دستگاهی دیگر
pair-already-have-firefox-paragraph = { -brand-firefox } را روی تلفن یا تبلت دارید؟
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = همگام‌سازی دستگاه
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = یا بارگیری کنید
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = برای بارگیری { -brand-firefox } نسخهٔ همراه اسکن کنید، یا یک <linkExternal>پیوند بارگیری</linkExternal> برای خودتان بفرستید.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = الان نه
pair-take-your-data-message = زبانه‌ها، نشانک‌ها و گذرواژه‌هایتان را به هر جایی که از { -brand-firefox } استفاده می‌کنید ببرید.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = شروع کنید
# This is the aria label on the QR code image
pair-qr-code-aria-label = کد QR

## Choice screen — "Do you have Firefox for mobile?"

# Subheader shown on the choice screen
pair-choice-subheader = تجربهٔ { -brand-firefox } خود را همگام کنید
# Description shown on the choice screen
pair-choice-description = گذرواژه‌های ذخیره‌شده، زبانه‌ها، تاریخچهٔ مرور و چیزهای دیگرتان را در همهٔ دستگاه‌هایتان ببینید.
# Heading shown on the choice screen when the user arrived via a Send Tab entrypoint
pair-choice-header-send-tab = { -brand-firefox } را روی دستگاهی که می‌خواهید زبانه‌ها را به آن بفرستید، بارگیری یا باز کنید
# Legend for the radio button fieldset
pair-choice-legend = برای ادامه یک گزینه را انتخاب کنید:
# Radio option: user already has Firefox for mobile — title
pair-choice-has-mobile-title = { -brand-firefox } نسخهٔ همراه را دارم
# Radio option: user already has Firefox for mobile — description
pair-choice-has-mobile-description = اگر { -brand-firefox } را روی دستگاه همراهتان دارید، همین حالا همگام‌سازی را شروع کنید.
# Radio option: user does not have Firefox for mobile — title
pair-choice-needs-mobile-title = { -brand-firefox } نسخهٔ همراه را ندارم
# Radio option: user does not have Firefox for mobile — description
pair-choice-needs-mobile-description = { -brand-firefox } را روی دستگاه همراهتان بارگیری کنید، سپس همگام‌سازی را شروع کنید.
# Continue button on choice screen (disabled until a radio option is selected)
pair-choice-continue-button = ادامه
# Success banner shown after signing in
pair-signed-in-successfully = با موفقیت وارد شدید!
# Success banner shown after signing up and verifying email via a Send Tab flow
pair-account-created-now-syncing = حساب ساخته شد. اکنون در حال همگام‌سازی هستید.
# Success banner shown after creating a password for a passwordless account via a Send Tab flow
pair-password-created-now-syncing = گذرواژه ساخته شد. اکنون در حال همگام‌سازی هستید.

## Download screen — shown after selecting "I don’t have Firefox for mobile"

# Subheader for the download screen
pair-download-subheader = بارگیری { -brand-firefox } نسخهٔ همراه
# Description for the download screen
pair-download-description = برای همگام‌سازی { -brand-firefox } روی تلفن یا تبلتتان، اول باید { -brand-firefox } نسخهٔ همراه را بارگیری کنید. روش کار این است:
# Step 1: scan QR code. $stepNumber is the step number (1)
pair-download-step-scan-qr = <b>گام { $stepNumber }</b>: با اسکن این کد QR با دوربین دستگاه همراهتان، { -brand-firefox } را بارگیری کنید:
# Step 2: continue to sync. $stepNumber is the step number (2)
pair-download-step-continue-sync = <b>گام { $stepNumber }</b>: گزینهٔ «ادامه به همگام‌سازی» را انتخاب کنید تا تجربهٔ { -brand-firefox } روی دستگاه همراهتان همگام شود.
# Button on the download screen that opens about:preferences for pairing
pair-continue-to-sync-button = ادامه به همگام‌سازی

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = دستگاه متصل شد
pair-success-message-2 = جفت‌سازی با موفقیت انجام شد.
pair-success-tab-close-message = این زبانه به‌طور خودکار توسط { -brand-firefox } بسته می‌شود.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = تأیید جفت‌سازی <span>برای { $email }</span>
pair-supp-allow-confirm-button = تأیید جفت‌سازی
pair-supp-allow-cancel-link = انصراف

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = اکنون تأیید لازم است <span>از دستگاه دیگرتان</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = جفت‌سازی با استفاده از برنامه
pair-unsupported-message = از دوربین سیستم استفاده کردید؟ باید از داخل برنامهٔ { -brand-firefox } جفت‌سازی کنید.
# Shown as heading when a desktop user visits from a non-Firefox browser
pair-unsupported-oops-header = ای وای! به نظر می‌رسد از { -brand-firefox } استفاده نمی‌کنید.
# Shown below the heading on desktop non-Firefox, prompting the user to switch browsers
pair-unsupported-switch-to-firefox = برای اتصال دستگاهی دیگر، به { -brand-firefox } بروید و این صفحه را باز کنید.
# Shown inline on mobile non-Firefox browsers before the download link
pair-unsupported-oops-mobile = ای وای! به نظر می‌رسد از { -brand-firefox } استفاده نمی‌کنید.
# v2: Heading for the mobile instructional message, shown on all mobile devices
# (Firefox and non-Firefox) when the URL is NOT a system camera pair URL.
pair-unsupported-connecting-mobile-header-v2 = اتصال دستگاه همراه به { -product-mozilla-account }
# v2: Instructions shown below the mobile heading. `<b>` wraps the firefox.com/pair
# URL so the domain does not wrap to a new line on narrow screens.
pair-unsupported-connecting-mobile-instructions-v2 = { -brand-firefox } را روی رایانه‌تان باز کنید، به <b>firefox.com/pair</b> بروید و برای اتصال دستگاه همراهتان دستورهای روی صفحه را دنبال کنید.
# v2: "Learn more" link below the mobile instructions; links to a Mozilla support article.
pair-unsupported-learn-more-link-v2 = بیشتر بدانید
# v2: Fallback shown to a desktop Firefox user who somehow reaches /pair/unsupported.
# Matches the legacy Backbone "Oops! Something went wrong." message.
pair-unsupported-desktop-firefox-fallback-header-v2 = ای وای! مشکلی پیش آمد.
pair-unsupported-desktop-firefox-fallback-message-v2 = لطفاً این زبانه را ببندید و دوباره امتحان کنید.

## ApproveSignIn page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer, which is already signed in, after their
## mobile device scans the pairing QR code. It asks them to approve the
## sign-in, and shows the requesting device's details so they can verify it.

# Asks the user to confirm the sign-in that another one of their devices just started
pair2-authority-approve-sign-in-heading = ورود را تأیید می‌کنید؟
# Submit button confirming that the user started the pairing and approves the
# other device being added to their account
pair2-authority-approve-sign-in-confirm-button = بله، ورود را تأیید می‌کنم
# "Not you?" asks whether someone other than the user started this sign-in.
# The text inside <changePassword> links to the page for changing the password.
pair2-authority-approve-sign-in-change-password = شما نبودید؟ <changePassword>گذرواژه‌تان را تغییر دهید</changePassword>

## ContinueOnMobile page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer after scanning the pairing QR code with
## their phone. It confirms the flow has moved to the mobile device and waits
## for the remaining steps to be completed there.

pair2-authority-continue-on-mobile-heading = در دستگاه همراهتان ادامه دهید
pair2-authority-continue-on-mobile-description = گام‌ها را روی تلفن یا تبلتتان دنبال کنید.
# Dismisses the pairing attempt
pair2-authority-continue-on-mobile-cancel-button = انصراف

## DownloadFirefox page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer when Firefox is needed to continue pairing.
## It points them at firefox.com/pair and offers a download link for Firefox.

# "sync" is a verb here, referring to syncing data between the user's devices
pair2-authority-download-firefox-heading = برای همگام‌سازی، { -brand-firefox } را باز کنید
# "firefox.com/pair" is a URL and should not be translated
pair2-authority-download-firefox-instruction = برای راه‌اندازی همگام‌سازی بین دستگاه‌ها، { -brand-firefox } را روی این دستگاه باز کنید و به <b>firefox.com/pair</b> بروید
# Links out to the Firefox download page
pair2-authority-download-firefox-cta = بارگیری { -brand-firefox }

## ScanQR page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer. It shows a QR code that they scan with
## their phone or tablet to connect the two devices and start syncing.

pair2-authority-scan-qr-heading = برای اتصال دستگاه همراهتان اسکن کنید
# "sync" is a verb here, referring to syncing data between the user's devices
pair2-authority-scan-qr-instruction = کد QR را با تلفن یا تبلتتان اسکن کنید تا نشانک‌ها، زبانه‌ها و چیزهای دیگر { -brand-firefox } همگام شوند.
# Accessible label describing the QR code image shown on this page
pair2-authority-scan-qr-code-aria-label = کد QR برای اتصال دستگاه همراه
# Link to a support article for users having trouble scanning the QR code
pair2-authority-scan-qr-help-link = راهنمایی برای اسکن
# Button shown below the QR code card. Leaves the pairing flow and takes the user to their account settings.
pair2-authority-scan-qr-skip-button = فعلاً رد شوید

## SyncSuccess page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer once the mobile device has been paired.
## It confirms that sync is on and links to sync settings.

pair2-authority-sync-success-heading-v2 = دستگاه شما متصل شد
# "Syncing" here means copying data between the user's devices
pair2-authority-sync-success-description-v2 = همگام‌سازی در جریان است. ممکن است کمی طول بکشد تا داده‌های همگام‌شده‌تان نمایان شوند. می‌توانید به مرور ادامه دهید.
# Opens the browser settings that control what is synced
pair2-authority-sync-success-sync-settings-button-v2 = مدیریت تنظیمات همگام‌سازی

## TimeoutAndCancel page - Part of the desktop-to-mobile pairing flow
## Users see this on their computer when pairing stopped without succeeding,
## either because it timed out or because it was canceled. Both cases offer to
## start pairing over again.

# Shown when the pairing attempt expired before it was approved
pair2-authority-timeout-and-cancel-timeout-heading = هنوز می‌خواهید دستگاهی را متصل کنید؟
pair2-authority-timeout-and-cancel-timeout-description = به نظر می‌رسد زمان به پایان رسید. اگر هنوز می‌خواهید دستگاه همراهتان را متصل کنید و داده‌های { -brand-firefox } را همگام کنید، دوباره امتحان کنید.
# Shown when the pairing attempt was canceled, on either device
pair2-authority-timeout-and-cancel-cancelled-heading = لغو شد
pair2-authority-timeout-and-cancel-canceled-description = اگر نظرتان عوض شد یا می‌خواهید دستگاه دیگری را متصل کنید، دوباره امتحان کنید.
# Restarts the pairing flow
pair2-authority-timeout-and-cancel-try-again-button = تلاش دوباره
# Takes the user to their Sync settings. "Sync" names the Firefox feature here, not the action.
pair2-authority-timeout-and-cancel-sync-settings-button = تنظیمات همگام‌سازی

## ApproveSignIn page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device after scanning the pairing QR code
## shown on their computer. It waits for them to approve the sign-in on the
## computer, and shows that computer's details so they can verify the request.

# "sync" is a verb here, referring to syncing data between the user's devices
pair2-supplicant-approve-sign-in-heading = یک گام دیگر تا همگام‌سازی
pair2-supplicant-approve-sign-in-instruction = ورود را روی رایانه‌تان تأیید کنید.
# Dismisses the pairing attempt
pair2-supplicant-approve-sign-in-cancel-button = انصراف

## ConnectThisDevice page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device after scanning the pairing QR code
## shown on their computer. It asks them to confirm connecting the mobile
## device to their account, and shows that computer's details so they can
## verify the request.

# "this device" is the mobile device the user is holding, not the computer
# whose details are shown below the heading
pair2-supplicant-connect-this-device-heading = این دستگاه به حسابتان متصل شود؟
# Confirms the pairing attempt
pair2-supplicant-connect-this-device-connect-button = اتصال
# Dismisses the pairing attempt
pair2-supplicant-connect-this-device-cancel-button = انصراف

## DownloadFirefox page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device when pairing reaches a browser that is
## not Firefox. It offers to open the Firefox app to finish pairing, and to
## install it first when the user does not have it yet.

pair2-supplicant-download-firefox-heading-v2 = { -brand-firefox } را روی این دستگاه باز کنید
# "sync" is a verb here, referring to syncing data between the user's devices.
pair2-supplicant-download-firefox-description-v2 = { -brand-firefox } را بارگیری کنید تا نشانک‌ها، تاریخچه و چیزهای دیگر بین دستگاه‌هایتان همگام شوند.
# Primary action. Opens the Firefox app to finish pairing, or sends the user to
# the Firefox download page when there is no pairing link to hand over.
pair2-supplicant-download-firefox-continue-button = ادامه در { -brand-firefox }
# Replaces the button label while waiting for the Firefox app to take over
pair2-supplicant-download-firefox-opening-button = در حال باز کردن { -brand-firefox }…
# Primary action shown in Safari on iOS. Opens the App Store page for Firefox.
pair2-supplicant-download-firefox-download-button = بارگیری { -brand-firefox }
# Secondary action shown in Safari on iOS, below the download button. Opens the
# Firefox app when it is already installed.
pair2-supplicant-download-firefox-have-firefox-button = { -brand-firefox } را دارم
# Opens a page explaining what sync does
pair2-supplicant-download-firefox-learn-more-link = بیش‌تر بدانید

## PairConnectHint page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device after scanning the pairing QR code
## with the phone's camera app instead of with Firefox. They already have
## Firefox installed, so it tells them how to scan the code again from inside
## Firefox.

pair2-supplicant-connect-hint-heading-v2 = جفت‌سازی را در برنامه تمام کنید
# <b> emphasises the name of the button the user taps in Firefox
pair2-supplicant-connect-hint-step-app-menu = روی <b>منوی برنامه</b> در نوار ابزار بزنید
# <b> emphasises the name of the menu item the user taps in Firefox
pair2-supplicant-connect-hint-step-sign-in = روی <b>ورود</b> بزنید، سپس کد را اسکن کنید
# Opens a Mozilla support article about connecting a device without a QR code
pair2-supplicant-connect-hint-learn-more-link = بیش‌تر بدانید

## ReadyToScan page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device before pairing starts. It tells them
## to open firefox.com/pair on their computer, which is where the QR code they
## scan with the mobile device comes from.

pair2-supplicant-ready-to-scan-heading = برای اتصال یک دستگاه
# <b> emphasises the address the user types on their computer. It is not a link,
# and the address itself must not be translated.
pair2-supplicant-ready-to-scan-instruction = روی رایانه‌تان { -brand-firefox } را باز کنید، به <b>firefox.com/pair</b> بروید و برای اتصال این دستگاه همراه، دستورهای روی صفحه را دنبال کنید.
# Opens a Mozilla support article about setting up sync
pair2-supplicant-ready-to-scan-learn-more-link = بیشتر بدانید

## SyncSuccess page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device once pairing has completed: the device
## is signed in and syncing with the computer they paired it with.

pair2-supplicant-sync-success-heading = دستگاه شما متصل شد
# "Syncing" here means copying data between the user's devices
pair2-supplicant-sync-success-description-v2 = همگام‌سازی در جریان است. ممکن است کمی طول بکشد تا داده‌های همگام‌شده‌تان نمایان شوند. می‌توانید به مرور ادامه دهید.
# Opens the browser's sync settings, where the user chooses what to sync
pair2-supplicant-sync-success-sync-settings-button-v2 = مدیریت تنظیمات همگام‌سازی

## TimeoutAndCancel page - Part of the desktop-to-mobile pairing flow
## Users see this on their mobile device when pairing ends without connecting,
## either because the attempt timed out or because it was canceled. Both states
## are informational and offer no on-screen action, so the copy points the user
## back to their computer to start again.

# Shown when the pairing attempt expired before it completed. "we" is Firefox.
pair2-supplicant-timeout-and-cancel-timeout-heading = به نظر می‌رسد زمان به پایان رسید
# "firefox.com/pair" is a URL and should not be translated
pair2-supplicant-timeout-and-cancel-timeout-description = برای اتصال دستگاه همراهتان و همگام‌سازی داده‌های { -brand-firefox }، روی رایانه‌تان به <b>firefox.com/pair</b> بروید.
# Shown after the pairing attempt was canceled
pair2-supplicant-timeout-and-cancel-cancelled-heading = لغو شد
# "firefox.com/pair" is a URL and should not be translated
pair2-supplicant-timeout-and-cancel-canceled-description = هر وقت خواستید دستگاهی را متصل کنید، روی رایانه‌تان به <b>firefox.com/pair</b> بروید.

## Permissions page
## Users see this page during sign-in or sign-up when a relying party is not a
## trusted Mozilla application, or when it asks for consent explicitly.
## The page informs the user which profile information the relying party can
## read. It does not offer a choice.

# Variable $serviceName is the name of the relying party, e.g. "321Done"
permissions-heading = { $serviceName } می‌خواهد به این موارد دسترسی داشته باشد:
permissions-label-email = نشانی رایانامه
permissions-label-display-name = نام نمایشی
permissions-continue-button = ادامه
permissions-cancel-button = انصراف

## ForcePasswordChange page
## Users are sent here when suspicious activity on the account requires a new password before they can continue.

force-password-change-heading = لطفاً گذرواژه‌تان را تغییر دهید
force-password-change-info = رفتار مشکوکی در { -product-mozilla-account } شما شناسایی کردیم. برای محافظت از حسابتان، لطفاً یک گذرواژهٔ جدید بسازید. از این گذرواژه برای ورود دوباره به همهٔ خدمات { -product-mozilla-account } خود استفاده خواهید کرد.
force-password-change-data-info = تاریخچه، نشانک‌ها، اطلاعات ورود و دیگر داده‌های شخصی همگام‌شده‌تان از بین نمی‌روند.

## ServiceWelcome page
## Shown to users after signup/signin for services like VPN

service-welcome-signup-success-banner = { -product-mozilla-account } تأیید شد
service-welcome-signin-success-banner = با موفقیت وارد شدید!
# In this context, "VPN" is a VPN service built into the Firefox browser, and generally isn't localized differently than "VPN"
service-welcome-vpn-heading = گام بعدی: روشن کردن VPN
service-welcome-vpn-description = یک گام دیگر تا حریم خصوصی بیشتر در مرورگرتان. به تابلوی باز بروید و آن را روشن کنید.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a

set-password-heading-v2 = برای همگام‌سازی، گذرواژه بسازید
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = این گذرواژه داده‌هایتان را رمزگذاری می‌کند و باید با گذرواژهٔ حساب { -brand-google } یا { -brand-apple } شما متفاوت باشد.

## SetPassword page for passwordless flow
## Users who signed in via passwordless OTP and need to create a password for Sync

set-password-passwordless-info = این گذرواژه داده‌های همگام‌شده‌تان را رمزگذاری و امن نگه می‌دارد.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = لطفاً صبر کنید، در حال هدایت شما به برنامهٔ مجاز هستیم.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = کلید بازیابی حسابتان را وارد کنید
account-recovery-confirm-key-instruction = این کلید داده‌های مرور رمزگذاری‌شدهٔ شما، مثل گذرواژه‌ها و نشانک‌ها، را از کارسازهای { -brand-firefox } بازیابی می‌کند.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = کلید بازیابی حساب ۳۲ نویسه‌ای‌تان را وارد کنید
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = یادآور محل نگهداری شما:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = ادامه
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = کلید بازیابی حسابتان را پیدا نمی‌کنید؟

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = ساختن گذرواژهٔ جدید
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = گذرواژه تعیین شد
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = متأسفیم، در تعیین گذرواژه‌تان مشکلی پیش آمد
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = استفاده از کلید بازیابی حساب
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = گذرواژهٔ شما بازنشانی شد.
reset-password-complete-banner-message = فراموش نکنید که برای جلوگیری از مشکلات ورود در آینده، از تنظیمات { -product-mozilla-account } یک کلید بازیابی حساب جدید بسازید.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = پس از ورود، { -brand-firefox } تلاش می‌کند شما را برگرداند تا از رایانامهٔ پوششی استفاده کنید.
confirm-backup-code-reset-password-input-label = کد ۱۰ نویسه‌ای را وارد کنید
confirm-backup-code-reset-password-confirm-button = تأیید
confirm-backup-code-reset-password-subheader = کد احراز هویت بازیابی را وارد کنید
confirm-backup-code-reset-password-instruction = یکی از کدهای یک‌بارمصرفی را که هنگام راه‌اندازی احراز هویت دو مرحله‌ای ذخیره کردید وارد کنید.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = دسترسی‌تان قطع شده؟

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = رایانامه‌تان را بررسی کنید
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = یک کد تأیید به <span>{ $email }</span> فرستادیم.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = کد ۸ رقمی را ظرف ۱۰ دقیقه وارد کنید
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = ادامه
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = ارسال دوبارهٔ کد
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = استفاده از حسابی دیگر

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = بازنشانی گذرواژه
confirm-totp-reset-password-subheader-v2 = کد احراز هویت دو مرحله‌ای را وارد کنید
confirm-totp-reset-password-instruction-v2 = برای بازنشانی گذرواژه‌تان، <strong>برنامهٔ احراز هویت</strong> خود را بررسی کنید.
confirm-totp-reset-password-trouble-code = در وارد کردن کد مشکل دارید؟
confirm-totp-reset-password-confirm-button = تأیید
confirm-totp-reset-password-input-label-v2 = کد ۶ رقمی را وارد کنید
confirm-totp-reset-password-use-different-account = استفاده از حسابی دیگر

## ResetPassword start page

password-reset-flow-heading = بازنشانی گذرواژه
password-reset-body-3 = بازنشانی گذرواژه ممکن است روی داده‌های همگام‌شدهٔ مرورگرتان اثر بگذارد.
password-reset-email-input =
    .label = رایانامه‌تان را وارد کنید
password-reset-submit-button-2 = ادامه

## ResetPasswordConfirmed

reset-password-complete-header = گذرواژهٔ شما بازنشانی شد
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = ادامه به { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their

password-reset-recovery-method-header = بازنشانی گذرواژه
password-reset-recovery-method-subheader = یک روش بازیابی انتخاب کنید
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = بیایید با روش‌های بازیابی‌تان مطمئن شویم که خودتان هستید.
password-reset-recovery-method-phone = تلفن بازیابی
password-reset-recovery-method-code = کدهای احراز هویت بازیابی
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] { $numBackupCodes } کد باقی مانده
       *[other] { $numBackupCodes } کد باقی مانده
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = در ارسال کد به تلفن بازیابی‌تان مشکلی پیش آمد
password-reset-recovery-method-send-code-error-description = لطفاً بعداً دوباره امتحان کنید یا از کدهای احراز هویت بازیابی‌تان استفاده کنید.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = بازنشانی گذرواژه
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = کد بازیابی را وارد کنید
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = یک کد ۶ رقمی با پیامک به شماره‌ای که به <span>{ $lastFourPhoneDigits }</span> ختم می‌شود فرستاده شد. این کد پس از ۵ دقیقه منقضی می‌شود. آن را به هیچ‌کس ندهید.
reset-password-recovery-phone-input-label = کد ۶ رقمی را وارد کنید
reset-password-recovery-phone-code-submit-button = تأیید
reset-password-recovery-phone-resend-code-button = ارسال دوبارهٔ کد
reset-password-recovery-phone-resend-success = کد فرستاده شد
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = دسترسی‌تان قطع شده؟
reset-password-recovery-phone-send-code-error-heading = در ارسال کد مشکلی پیش آمد
reset-password-recovery-phone-code-verification-error-heading = در تأیید کدتان مشکلی پیش آمد
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = لطفاً بعداً دوباره امتحان کنید.
reset-password-recovery-phone-invalid-code-error-description = کد نامعتبر است یا منقضی شده.
reset-password-recovery-phone-invalid-code-error-link = به‌جای آن از کدهای احراز هویت بازیابی استفاده می‌کنید؟
reset-password-with-recovery-key-verified-page-title = گذرواژه با موفقیت بازنشانی شد
reset-password-complete-new-password-saved = گذرواژهٔ جدید ذخیره شد!
reset-password-complete-recovery-key-created = کلید بازیابی حساب جدید ساخته شد. همین حالا آن را بارگیری و نگهداری کنید.
reset-password-complete-recovery-key-download-info = اگر گذرواژه‌تان را فراموش کنید، این کلید برای بازیابی داده‌ها ضروری است. <b>همین حالا آن را بارگیری کنید و جای امنی نگه دارید، چون بعداً دیگر به این صفحه دسترسی نخواهید داشت.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = خطا:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = در حال بررسی ورود…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = خطا در تأیید
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = پیوند تأیید منقضی شده است
signin-link-expired-message-2 = پیوندی که روی آن کلیک کردید منقضی شده یا قبلاً استفاده شده است.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = گذرواژه‌تان را وارد کنید <span>برای { -product-mozilla-account }</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = ادامه به { $serviceName }
signin-subheader-without-logo-default = ادامه به تنظیمات حساب
signin-button = ورود
signin-header = ورود
signin-use-a-different-account-link = استفاده از حسابی دیگر
signin-forgot-password-link = گذرواژه را فراموش کرده‌اید؟
signin-password-button-label = گذرواژه
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = پس از ورود، { -brand-firefox } تلاش می‌کند شما را برگرداند تا از رایانامهٔ پوششی استفاده کنید.
signin-code-expired-error = کد منقضی شده است. لطفاً دوباره وارد شوید.
# Error message displayed when OAuth native flow recovery fails
signin-recovery-error = مشکلی پیش آمد. لطفاً دوباره وارد شوید.
signin-account-locked-banner-heading = بازنشانی گذرواژه
signin-account-locked-banner-description = برای محافظت از حسابتان در برابر فعالیت‌های مشکوک، آن را قفل کردیم.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = برای ورود، گذرواژه‌تان را بازنشانی کنید

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = پیوندی که روی آن کلیک کردید چند نویسه کم دارد و ممکن است برنامهٔ رایانامهٔ شما آن را خراب کرده باشد. نشانی را با دقت رونوشت کنید و دوباره امتحان کنید.
report-signin-header = گزارش ورود غیرمجاز؟
report-signin-body = رایانامه‌ای دربارهٔ تلاش برای دسترسی به حسابتان دریافت کرده‌اید. می‌خواهید این فعالیت را مشکوک گزارش کنید؟
report-signin-submit-button = گزارش فعالیت
report-signin-support-link = چرا این اتفاق می‌افتد؟
report-signin-error = متأسفیم، در ارسال گزارش مشکلی پیش آمد.
signin-bounced-header = متأسفیم. حسابتان را قفل کرده‌ایم.
# $email (string) - The user's email.
signin-bounced-message = رایانامهٔ تأییدی که به { $email } فرستادیم برگشت خورد و برای محافظت از داده‌های { -brand-firefox } شما، حسابتان را قفل کردیم.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = اگر این نشانی رایانامهٔ معتبری است، <linkExternal>به ما خبر دهید</linkExternal> تا در باز کردن قفل حسابتان کمکتان کنیم.
signin-bounced-create-new-account = دیگر آن رایانامه را ندارید؟ یک حساب جدید بسازید
back = بازگشت

## SigninPasskeyFallback page
## Users who authenticate with a passkey to access Sync must also enter their password.

signin-passkey-fallback-header = تکمیل ورود
signin-passkey-fallback-heading = برای همگام‌سازی، گذرواژه‌تان را وارد کنید
signin-passkey-fallback-body = برای امن نگه داشتن داده‌هایتان، هنگام استفاده از این کلید عبور باید گذرواژه‌تان را وارد کنید.
signin-passkey-fallback-password-label = گذرواژه
signin-passkey-fallback-continue = ادامه
signin-passkey-fallback-forgot-password-link = گذرواژه را فراموش کرده‌اید؟

## SigninPasswordlessCode page
## Users are prompted to enter a code sent to their email for passwordless authentication.

signin-passwordless-code-heading = کد تأیید را وارد کنید
signin-passwordless-code-subheading = با این کد، ورود فقط یک گام دارد.
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationMinutes (Number) - the expiration time in minutes
signin-passwordless-code-instruction =
    { $expirationMinutes ->
        [one] کدی را که به <email>{ $email }</email> فرستاده شده، ظرف { $expirationMinutes } دقیقه وارد کنید.
       *[other] کدی را که به <email>{ $email }</email> فرستاده شده، ظرف { $expirationMinutes } دقیقه وارد کنید.
    }
signin-passwordless-code-input-label-v2 = کد ۶ رقمی را وارد کنید
signin-passwordless-code-confirm-button = تأیید
signin-passwordless-code-required-error = کد تأیید لازم است
signin-passwordless-code-expired = کد منقضی شده؟
# { $seconds } - countdown timer showing seconds until user can request a new code
signin-passwordless-code-resend-countdown =
    { $seconds ->
        [one] ارسال کد جدید به رایانامه تا { $seconds } ثانیهٔ دیگر
       *[other] ارسال کد جدید به رایانامه تا { $seconds } ثانیهٔ دیگر
    }
signin-passwordless-code-resend-link = ارسال کد جدید به رایانامه.
signin-passwordless-code-resend-error = مشکلی پیش آمد. کد جدید فرستاده نشد.
signin-passwordless-code-other-account-link = استفاده از حسابی دیگر

## SignupPasswordlessCode page
## Users are prompted to enter a code sent to their email to create a new account without a password.

signup-passwordless-code-subheading = با این کد، ثبت‌نام فقط یک گام دارد.

## Error messages

# Shown when a user with 2FA enabled tries to use passwordless flow
# They are redirected to password signin instead
signin-passwordless-totp-required = احراز هویت دو مرحله‌ای روی حسابتان فعال است. لطفاً با گذرواژه‌تان وارد شوید.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = ورود
signin-recovery-method-subheader = یک روش بازیابی انتخاب کنید
signin-recovery-method-details = بیایید با روش‌های بازیابی‌تان مطمئن شویم که خودتان هستید.
signin-recovery-method-phone = تلفن بازیابی
signin-recovery-method-code-v2 = کدهای احراز هویت بازیابی
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] { $numBackupCodes } کد باقی مانده
       *[other] { $numBackupCodes } کد باقی مانده
    }
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = در ارسال کد به تلفن بازیابی‌تان مشکلی پیش آمد
signin-recovery-method-send-code-error-description = لطفاً بعداً دوباره امتحان کنید یا از کدهای احراز هویت بازیابی‌تان استفاده کنید.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = ورود
signin-recovery-code-sub-heading = کد احراز هویت بازیابی را وارد کنید
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = یکی از کدهای یک‌بارمصرفی را که هنگام راه‌اندازی احراز هویت دو مرحله‌ای ذخیره کردید وارد کنید.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = کد ۱۰ نویسه‌ای را وارد کنید
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = تأیید
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = استفاده از تلفن بازیابی
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = دسترسی‌تان قطع شده؟
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = کد احراز هویت بازیابی لازم است
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = در ارسال کد به تلفن بازیابی‌تان مشکلی پیش آمد
signin-recovery-code-use-phone-failure-description = لطفاً بعداً دوباره امتحان کنید.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = ورود
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = کد بازیابی را وارد کنید
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = یک کد ۶ رقمی با پیامک به شماره‌ای که به <span>{ $lastFourPhoneDigits }</span> ختم می‌شود فرستاده شد. این کد پس از ۵ دقیقه منقضی می‌شود. آن را به هیچ‌کس ندهید.
signin-recovery-phone-input-label = کد ۶ رقمی را وارد کنید
signin-recovery-phone-code-submit-button = تأیید
signin-recovery-phone-resend-code-button = ارسال دوبارهٔ کد
signin-recovery-phone-resend-success = کد فرستاده شد
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = دسترسی‌تان قطع شده؟
signin-recovery-phone-send-code-error-heading = در ارسال کد مشکلی پیش آمد
signin-recovery-phone-code-verification-error-heading = در تأیید کدتان مشکلی پیش آمد
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = لطفاً بعداً دوباره امتحان کنید.
signin-recovery-phone-invalid-code-error-description = کد نامعتبر است یا منقضی شده.
signin-recovery-phone-invalid-code-error-link = به‌جای آن از کدهای احراز هویت بازیابی استفاده می‌کنید؟
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = با موفقیت وارد شدید. اگر دوباره از تلفن بازیابی‌تان استفاده کنید، ممکن است محدودیت‌هایی اعمال شود.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = از هوشیاری‌تان سپاسگزاریم
signin-reported-message = تیم ما در جریان قرار گرفت. گزارش‌هایی مثل این به ما کمک می‌کنند جلوی نفوذگران را بگیریم.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = کد تأیید را وارد کنید<span> برای { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = کدی را که به <email>{ $email }</email> فرستاده شده، ظرف ۵ دقیقه وارد کنید.
signin-token-code-input-label-v2 = کد ۶ رقمی را وارد کنید
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = تأیید
signin-token-code-code-expired = کد منقضی شده؟
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = ارسال کد جدید به رایانامه.
# Countdown message shown when user must wait before resending code
# { $seconds } represents the number of seconds remaining
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] ارسال کد جدید به رایانامه تا { $seconds } ثانیهٔ دیگر
       *[other] ارسال کد جدید به رایانامه تا { $seconds } ثانیهٔ دیگر
    }
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = کد تأیید لازم است
signin-token-code-resend-error = مشکلی پیش آمد. کد جدید فرستاده نشد.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = پس از ورود، { -brand-firefox } تلاش می‌کند شما را برگرداند تا از رایانامهٔ پوششی استفاده کنید.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = ورود
signin-totp-code-subheader-v2 = کد احراز هویت دو مرحله‌ای را وارد کنید
signin-totp-code-instruction-v4 = برای تأیید ورودتان، <strong>برنامهٔ احراز هویت</strong> خود را بررسی کنید.
signin-totp-code-input-label-v4 = کد ۶ رقمی را وارد کنید
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = چرا از شما خواسته می‌شود هویتتان را تأیید کنید؟
signin-totp-code-aal-banner-content = احراز هویت دو مرحله‌ای را روی حسابتان راه‌اندازی کرده‌اید، اما هنوز در این دستگاه با کد وارد نشده‌اید.
signin-totp-code-aal-sign-out = خروج در این دستگاه
signin-totp-code-aal-sign-out-error = متأسفیم، در خروج شما از حساب مشکلی پیش آمد
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = تأیید
signin-totp-code-other-account-link = استفاده از حسابی دیگر
signin-totp-code-recovery-code-link = در وارد کردن کد مشکل دارید؟
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = کد احراز هویت لازم است
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = پس از ورود، { -brand-firefox } تلاش می‌کند شما را برگرداند تا از رایانامهٔ پوششی استفاده کنید.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = این ورود را مجاز کنید
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = رایانامه‌تان را برای کد مجوزی که به { $email } فرستاده شده بررسی کنید.
signin-unblock-code-input = کد مجوز را وارد کنید
signin-unblock-submit-button = ادامه
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = کد مجوز لازم است
signin-unblock-code-incorrect-length = کد مجوز باید ۸ نویسه داشته باشد
signin-unblock-code-incorrect-format-2 = کد مجوز فقط می‌تواند شامل حروف و/یا اعداد باشد
signin-unblock-resend-code-button = در صندوق ورودی یا پوشهٔ هرزنامه نیست؟ دوباره بفرستید
signin-unblock-support-link = چرا این اتفاق می‌افتد؟
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = پس از ورود، { -brand-firefox } تلاش می‌کند شما را برگرداند تا از رایانامهٔ پوششی استفاده کنید.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = کد تأیید را وارد کنید
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = کد تأیید را وارد کنید <span>برای { -product-mozilla-account }</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = کدی را که به <email>{ $email }</email> فرستاده شده، ظرف ۵ دقیقه وارد کنید.
confirm-signup-code-input-label = کد ۶ رقمی را وارد کنید
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = تأیید
confirm-signup-code-sync-button = شروع همگام‌سازی
confirm-signup-code-code-expired = کد منقضی شده؟
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = ارسال کد جدید به رایانامه.
# Countdown message shown when user must wait before resending code
# { $seconds } represents the number of seconds remaining
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] ارسال کد جدید به رایانامه تا { $seconds } ثانیهٔ دیگر
       *[other] ارسال کد جدید به رایانامه تا { $seconds } ثانیهٔ دیگر
    }
confirm-signup-code-success-alert = حساب با موفقیت تأیید شد
# Error displayed in tooltip.
confirm-signup-code-is-required-error = کد تأیید لازم است
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = پس از ورود، { -brand-firefox } تلاش می‌کند شما را برگرداند تا از رایانامهٔ پوششی استفاده کنید.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = ساختن گذرواژه
signup-relay-info = برای مدیریت امن رایانامه‌های پوششی و دسترسی به ابزارهای امنیتی { -brand-mozilla }، به یک گذرواژه نیاز دارید.
signup-sync-info = گذرواژه‌ها، نشانک‌ها و چیزهای دیگرتان را در هر جایی که از { -brand-firefox } استفاده می‌کنید همگام کنید.
signup-sync-info-with-payment = گذرواژه‌ها، روش‌های پرداخت، نشانک‌ها و چیزهای دیگرتان را در هر جایی که از { -brand-firefox } استفاده می‌کنید همگام کنید.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = تغییر رایانامه

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = همگام‌سازی روشن است
signup-confirmed-sync-success-banner = { -product-mozilla-account } تأیید شد
signup-confirmed-sync-button = شروع مرور
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = گذرواژه‌ها، روش‌های پرداخت، نشانی‌ها، نشانک‌ها، تاریخچه و چیزهای دیگرتان می‌توانند در هر جایی که از { -brand-firefox } استفاده می‌کنید همگام شوند.
signup-confirmed-sync-description-v2 = گذرواژه‌ها، نشانی‌ها، نشانک‌ها، تاریخچه و چیزهای دیگرتان می‌توانند در هر جایی که از { -brand-firefox } استفاده می‌کنید همگام شوند.
signup-confirmed-sync-add-device-link = افزودن دستگاهی دیگر
signup-confirmed-sync-manage-sync-button = مدیریت همگام‌سازی
signup-confirmed-sync-set-password-success-banner = گذرواژهٔ همگام‌سازی ساخته شد

## UpdateFirefox page
## Shown when the browser is too old to use a Mozilla account

update-firefox-heading = به‌روزرسانی { -brand-firefox } لازم است
update-firefox-description = { -product-mozilla-account } شما از ویژگی‌هایی استفاده می‌کند که نسخهٔ فعلی { -brand-firefox } شما از آن‌ها پشتیبانی نمی‌کند. برای ادامه، لطفاً جدیدترین نسخهٔ { -brand-firefox } را بارگیری و نصب کنید.
update-firefox-download-button = بارگیری جدیدترین نسخه
