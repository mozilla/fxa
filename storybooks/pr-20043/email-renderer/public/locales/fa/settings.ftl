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
    .alt = { -brand-mozilla } چ آرم

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = بازگشت
button-back-title = بازگشت

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = بارگیری و ادامه
    .title = بارگیری و ادامه
recovery-key-pdf-heading = کلید بازیابی حساب کاربری
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = تولید شده: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = کلید بازیابی حساب کاربری
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = این کلید به شما اجازه می‌دهد تا در صورت فراموشی گذرواژه‌ها، داده‌های رمزگذاری‌شده مرورگر خود (شامل گذرواژه‌ها، نشانک‌ها و تاریخچه) را بازیابی کنید. آن را در محلی نگه‌دارید که به خاطر می‌آورید.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = مکان‌هایی برای نگه‌داری کلید شما
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = بیشتر در مورد کلید بازیابی حساب خود بدانید
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = متاسفیم، مشکلی در بارگیری کلید بازیابی حساب شما وجود داشت.

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
device-info-browser-os = { $browserName } بر روی { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = نشانی IP: { $ipAddress }

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

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = کلید بازیابی حساب { -brand-firefox }
get-data-trio-title-backup-verification-codes = کدهای احراز هویت بازیابی
get-data-trio-download-2 =
    .title = بارگیری
    .aria-label = بارگیری
get-data-trio-copy-2 =
    .title = رونوشت
    .aria-label = رونوشت
get-data-trio-print-2 =
    .title = چاپ
    .aria-label = چاپ

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
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = بستن پیام
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = کد
error-icon-aria-label =
    .aria-label = خطا
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = اطلاعات
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = پرچم ایالات متحده آمریکا

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

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

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = پنهان کردن گذرواژه
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = نمایش گذرواژه

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = کشور را انتخاب کنید
input-phone-number-enter-number = شماره تلفن را وارد کنید
input-phone-number-country-united-states = ایالات متحده
input-phone-number-country-canada = کانادا
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = بازگشت

## LinkRememberPassword component

# link navigates to the sign in page
remember-password-signin-link = ورود

## Notification Promo Banner component

account-recovery-notification-cta = ایجاد

## Ready component

ready-continue = ادامه

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = پایان

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = هشدار

## User's avatar

avatar-your-avatar =
    .alt = چهرک شما
avatar-default-avatar =
    .alt = چهرک پیش‌فرض

##


# BentoMenu component

bento-menu-title-3 = محصولات { -brand-mozilla }
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = { -brand-firefox } مرورگر برای میزکار
bento-menu-firefox-mobile = { -brand-firefox } مرورگر برای موبایل
bento-menu-made-by-mozilla = ساخته شده توسط { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = { -brand-firefox } را برای موبایل یا تلبت دریافت کنید

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-duplicate = تکراری

##

cs-sign-out-button = خروج از حساب کاربری

## Data collection section

dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = مرورگر { -brand-firefox }
dc-learn-more = بیشتر بدانید

# DropDownAvatarMenu component

drop-down-menu-title-2 = منوی { -product-mozilla-account }
drop-down-menu-sign-out = خروج

## Flow Container

flow-container-back = بازگشت

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = آغاز کنید
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = انصراف

## FlowSetup2faApp

flow-setup-2fa-button = ادامه

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = پایان

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-button-continue = ادامه

##

flow-setup-2fa-prompt-continue-button = ادامه

## FlowSetupPhoneConfirmCode

flow-setup-phone-confirm-code-button = تایید
flow-setup-phone-confirm-code-resend-code-success = کد ارسال شد

## HeaderLockup component, the header in account settings

header-menu-open = بستن منو
header-menu-closed = منوی پیمایش وبگاه
header-back-to-top-link =
    .title = برگشت به بالا
header-title-2 = { -product-mozilla-account }
header-help = راهنما

## Linked Accounts section

la-heading = حساب‌های مرتبط
la-description = شما مجوز دسترسی به حساب‌های زیر را دارید.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = بستن
modal-cancel-button = لغو
modal-default-confirm-button = تایید

## ModalMfaProtected

modal-mfa-protected-confirm-button = تایید

## Modal Verify Session

msv-cancel-button = انصراف
msv-submit-button-2 = تایید

## Settings Nav

nav-settings = تنظیمات
nav-profile = نمایه
nav-security = امنیت
nav-connected-services = خدمات متصل
nav-paid-subs = اشتراک‌های پولی

## Avatar change page

avatar-page-title =
    .title = تصویر نمایه
avatar-page-add-photo = اضافه کردن تصویر
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = عکس گرفتن
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = عکس تصویر
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

## Password change page

pw-change-header =
    .title = تغییر گذرواژه
pw-change-cancel-button = انصراف
pw-change-save-button = ذخیره
pw-change-forgot-password-link = گذرواژه را فراموش کرده‌اید؟
pw-change-current-password =
    .label = گذرواژهٔ فعلی را وارد کنید
pw-change-new-password =
    .label = یک گذرواژه جدید وارد کنید
pw-change-confirm-password =
    .label = تایید گذرواژه جدید
pw-change-success-alert-2 = گذرواژه به‌روزرسانی شد

## Password create page

pw-create-header =
    .title = ایجاد گذرواژه

## Delete account page

delete-account-header =
    .title = حذف حساب کاربری
delete-account-step-1-2 = مرحله ۱ از ۲
delete-account-step-2-2 = مرحله ۲ از ۲
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-acknowledge = لطفا در تایید کنید که با حذف حساب کاربری خود:
delete-account-continue-button = ادامه
delete-account-password-input =
    .label = گذرواژه را وارد کنید
delete-account-cancel-button = لغو
delete-account-delete-button-2 = حذف

## Display name page

submit-display-name = ذخیره
cancel-display-name = انصراف

## Add secondary email page

add-secondary-email-step-1 = مرحله ۱ از ۲
add-secondary-email-cancel-button = لغو
add-secondary-email-save-button = ذخیره

## Verify secondary email page

add-secondary-email-step-2 = مرحلهٔ ۲ از ۲
verify-secondary-email-cancel-button = لغو

## Profile section

profile-heading = نمایه
profile-picture =
    .header = تصویر

## Security section of Setting

security-heading = امنیت
security-password =
    .header = گذرواژه
security-action-create = ایجاد

## SubRow component

# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = افزودن
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = تغییر
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = افزودن
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = حذف

## Sub-section row Defaults

row-defaults-action-add = افزودن
row-defaults-action-change = تغییر

## Account recovery key sub-section on main Settings page

rk-action-create = ایجاد
rk-action-remove = برداشتن
