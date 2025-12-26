## Non-email strings

session-verify-send-push-title-2 = กำลังจะเข้าสู่ระบบ{ -product-mozilla-account } ของคุณใช่หรือไม่?
session-verify-send-push-body-2 = คลิกที่นี่เพื่อยืนยันว่าเป็นคุณ
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-body = { $code } คือรหัสยืนยัน { -brand-mozilla } ของคุณ ซึ่งจะหมดอายุใน 5 นาที
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to verify phone ownership when registering a recovery phone
recovery-phone-setup-sms-short-body = รหัสยืนยัน { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-body = { $code } คือรหัสกู้คืน { -brand-mozilla } ของคุณ ซึ่งจะหมดอายุใน 5 นาที
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for two-step authentication
recovery-phone-signin-sms-short-body = รหัส { -brand-mozilla }: { $code }
# Message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-sms-body = { $code } คือรหัสกู้คืน { -brand-mozilla } ของคุณ ซึ่งจะหมดอายุใน 5 นาที
# Shorter message sent by SMS with limited character length, please test translation with the messaging segment calculator
# https://twiliodeved.github.io/message-segment-calculator/
# Messages should be limited to one segment
# $code  - 6 digit code used to sign in with a recovery phone as backup for account password reset
recovery-phone-reset-password-short-body = รหัส { -brand-mozilla }: { $code }

## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="โลโก้ { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="ซิงค์อุปกรณ์">
body-devices-image = <img data-l10n-name="devices-image" alt="อุปกรณ์">
fxa-privacy-url = นโยบายความเป็นส่วนตัวของ { -brand-mozilla }
moz-accounts-privacy-url-2 = ประกาศความเป็นส่วนตัวของ{ -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = เงื่อนไขการให้บริการของ { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-header-mozilla-logo-2 = <img data-l10n-name="subplat-mozilla-logo" alt="{ -brand-mozilla } logo">
subplat-footer-mozilla-logo-2 = <img data-l10n-name="mozilla-logo-footer" alt="{ -brand-mozilla } logo">
subplat-automated-email = นี้เป็นอีเมลอัตโนมัติ ถ้าคุณได้รับเนื่องจากความผิดพลาด ไม่จำเป็นต้องทำอะไร
subplat-privacy-notice = ประกาศความเป็นส่วนตัว
subplat-privacy-plaintext = ประกาศความเป็นส่วนตัว:
subplat-update-billing-plaintext = { subplat-update-billing }:
# Variables:
#  $email (String) - A user's primary email address
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subplat-explainer-specific-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } มี{ -product-mozilla-account } และคุณได้ลงชื่อเข้าใช้ { $productName }
# Variables:
#  $email (String) - A user's primary email address
subplat-explainer-reminder-form-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } มี{ -product-mozilla-account }
subplat-explainer-multiple-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } มี{ -product-mozilla-account } และคุณได้สมัครสมาชิกผลิตภัณฑ์หลายอย่าง
subplat-explainer-was-deleted-2 = คุณได้รับอีเมลนี้เนื่องจาก { $email } ถูกลงทะเบียนสำหรับใช้กับ{ -product-mozilla-account }
subplat-manage-account-2 = จัดการการตั้งค่า{ -product-mozilla-account } ของคุณโดยไปที่<a data-l10n-name="subplat-account-page">หน้าบัญชี</a>ของคุณ
# Variables:
#  $accountSettingsUrl (String) - URL to Account Settings
subplat-manage-account-plaintext-2 = จัดการการตั้งค่า{ -product-mozilla-account } ของคุณโดยไปที่หน้าบัญชีของคุณ: { $accountSettingsUrl }
subplat-terms-policy = ข้อกำหนดและนโยบายการยกเลิก
subplat-terms-policy-plaintext = { subplat-terms-policy }:
subplat-cancel = ยกเลิกการสมัครสมาชิก
subplat-cancel-plaintext = { subplat-cancel }:
subplat-reactivate = ต่ออายุการสมัครสมาชิก
subplat-reactivate-plaintext = { subplat-reactivate }:
subplat-update-billing = อัปเดตข้อมูลการเรียกเก็บเงิน
subplat-privacy-policy = นโยบายความเป็นส่วนตัวของ { -brand-mozilla }
subplat-privacy-policy-2 = ประกาศความเป็นส่วนตัวของ{ -product-mozilla-accounts(capitalization: "uppercase") }
subplat-privacy-policy-plaintext = { subplat-privacy-policy }:
subplat-privacy-policy-plaintext-2 = { subplat-privacy-policy-2 }:
subplat-moz-terms = เงื่อนไขการให้บริการของ { -product-mozilla-accounts(capitalization: "uppercase") }
subplat-moz-terms-plaintext = { subplat-moz-terms }:
subplat-legal = ข้อกฎหมาย
subplat-legal-plaintext = { subplat-legal }:
subplat-privacy = ความเป็นส่วนตัว
subplat-privacy-website-plaintext = { subplat-privacy }:
account-deletion-info-block-communications = ถ้าบัญชีของคุณถูกลบแล้ว คุณจะยังคงได้รับอีเมลจาก Mozilla Corporation และ Mozilla Foundation เว้นแต่คุณจะ<a data-l10n-name="unsubscribeLink">เลิกบอกรับ</a>
account-deletion-info-block-support = ถ้าคุณมีคำถามใดๆ หรือต้องการความช่วยเหลือ โปรดติดต่อ<a data-l10n-name="supportLink">ทีมสนับสนุน</a>ของเรา
account-deletion-info-block-communications-plaintext = ถ้าบัญชีของคุณถูกลบแล้ว คุณจะยังคงได้รับอีเมลจาก Mozilla Corporation และ Mozilla Foundation เว้นแต่คุณจะเลิกบอกรับ:
account-deletion-info-block-support-plaintext = ถ้าคุณมีคำถามใดๆ หรือต้องการความช่วยเหลือ โปรดติดต่อทีมสนับสนุนของเรา:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-android-badge = <img data-l10n-name="google-play-badge" alt="ดาวน์โหลด { $productName } บน { -google-play }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
body-ios-badge = <img data-l10n-name="apple-app-badge" alt="ดาวน์โหลด { $productName } บน { -app-store }">
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-desktop-device-2 = ติดตั้ง { $productName } บน<a data-l10n-name="anotherDeviceLink">อุปกรณ์เดสก์ท็อปอื่น</a>
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-2 = ติดตั้ง { $productName } บน<a data-l10n-name="anotherDeviceLink">อุปกรณ์อื่น</a>
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
android-download-plaintext = รับ { $productName } บน Google Play:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
ios-download-plaintext = ดาวน์โหลด { $productName } บน App Store:
# Variables:
#  $productName (String) - The name of the product to be downloaded, e.g. Mozilla VPN, or Firefox
another-device-plaintext = ติดตั้ง{ $productName } บนอุปกรณ์อื่น:
automated-email-change-2 = หากคุณไม่ดำเนินการนี้ ให้<a data-l10n-name="passwordChangeLink">เปลี่ยนรหัสผ่านของคุณ</a>ทันที
automated-email-support = สำหรับข้อมูลเพิ่มเติม ให้ไปที่<a data-l10n-name="supportLink">ฝ่ายช่วยเหลือของ { -brand-mozilla }</a>
# After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-change-plaintext-2 = หากคุณไม่ดำเนินการนี้ ให้เปลี่ยนรหัสผ่านของคุณทันที:
#  After the colon, there's a link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-support-plaintext = สำหรับข้อมูลเพิ่มเติม ให้ไปที่ฝ่ายช่วยเหลือของ { -brand-mozilla }:
automated-email-inactive-account = นี่เป็นอีเมลอัตโนมัติ คุณได้รับอีเมลนี้เนื่องจากคุณมี{ -product-mozilla-account } และผ่านไป 2 ปีแล้วนับตั้งแต่คุณลงชื่อเข้าใช้ครั้งล่าสุด
# supportLink - https://support.mozilla.org/kb/im-having-problems-my-firefox-account
automated-email-no-action = { automated-email-no-action-plaintext } สำหรับข้อมูลเพิ่มเติม ให้ไปที่<a data-l10n-name="supportLink">ฝ่ายช่วยเหลือของ { -brand-mozilla }</a>:
automated-email-no-action-plaintext = นี่เป็นอีเมลที่ส่งแบบอัตโนมัติ ถ้าคุณได้รับอีเมลนี้เนื่องจากความผิดพลาด คุณไม่จำเป็นต้องทำสิ่งใด
#  After the colon, there's a link to https://accounts.firefox.com/settings/change_password
automated-email-not-authorized-plaintext = นี่เป็นอีเมลอัตโนมัติ; หากคุณไม่ได้อนุญาตให้ดำเนินการนี้ โปรดเปลี่ยนรหัสผ่านของคุณ:
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-all = คำขอนี้มาจาก { $uaBrowser } บน { $uaOS } { $uaOSVersion }
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-browser-os = คำขอนี้มาจาก { $uaBrowser } บน { $uaOS }
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaBrowser: the user agent's browser (e.g., Firefox Nightly)
automatedEmailRecoveryKey-origin-device-browser-only = คำขอนี้มาจาก { $uaBrowser }
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
# - $uaOSVersion - the user agent's operating system version
automatedEmailRecoveryKey-origin-device-OS-version-only = คำขอนี้มาจาก { $uaOS } { $uaOSVersion }
# "This request" refers to a modification (addition, change or removal) to the account recovery key.
# Variables:
# - $uaOS: the user agent's operating system (e.g, MacOS)
automatedEmailRecoveryKey-origin-device-OS-only = คำขอนี้มาจาก { $uaOS }
automatedEmailRecoveryKey-delete-key-change-pwd = ถ้านี่ไม่ใช่คุณ ให้<a data-l10n-name="revokeAccountRecoveryLink">ลบคีย์ใหม่</a>และ<a data-l10n-name="passwordChangeLink">เปลี่ยนรหัสผ่านของคุณ</a>
automatedEmailRecoveryKey-change-pwd-only = ถ้านี่ไม่ใช่คุณ ให้<a data-l10n-name="passwordChangeLink">เปลี่ยนรหัสผ่านของคุณ</a>
automatedEmailRecoveryKey-more-info = สำหรับข้อมูลเพิ่มเติม ให้ไปที่<a data-l10n-name="supportLink">ฝ่ายช่วยเหลือของ { -brand-mozilla }</a>
# Colon is followed by user device info on a separate line (e.g., "Firefox Nightly on Mac OSX 10.11")
automatedEmailRecoveryKey-origin-plaintext = คำขอนี้มาจาก:
# Colon is followed by a URL to the account recovery key section of account settings
automatedEmailRecoveryKey-notyou-delete-key-plaintext = ถ้านี่ไม่ใช่คุณ ให้ลบคีย์ใหม่:
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-only-plaintext = ถ้านี่ไม่ใช่คุณ ให้เปลี่ยนรหัสผ่านของคุณ:
# This string is shown on its own line, after automatedEmailRecoveryKey-notyou-delete-key-plaintext and its URL
# Colon is followed by a URL to the change password section of account settings
automatedEmailRecoveryKey-notyou-change-pwd-plaintext = และเปลี่ยนรหัสผ่านของคุณ:
# Colon is followed by a URL to Mozilla Support's "I'm having problems with my account" page
automatedEmailRecoveryKey-more-info-plaintext = สำหรับข้อมูลเพิ่มเติม ให้ไปที่ฝ่ายช่วยเหลือของ { -brand-mozilla }:
automated-email-reset =
    นี่เป็นอีเมลอัตโนมัติ; หากคุณไม่อนุญาตให้ดำเนินการนี้ <a data-l10n-name="resetLink">โปรดตั้งค่ารหัสผ่านของคุณใหม่</a>
    สำหรับข้อมูลเพิ่มเติม โปรดไปที่<a data-l10n-name="supportLink">ฝ่ายสนับสนุนของ { -brand-mozilla }</a>
# Variables:
#  $resetLink (String) - Link to https://accounts.firefox.com/reset_password
automated-email-reset-plaintext-v2 = ถ้าคุณไม่ได้อนุญาตการกระทำนี้ กรุณาตั้งรหัสผ่านของคุณใหม่ที่ { $resetLink }
# This message is used by multiple automated emails that notify users of security events on their account
# "this action" is meant to be a generic term, and could, for example, refer to using a backup authentication code to confirm a password reset
automated-email-reset-pwd-two-factor =
    ถ้าคุณไม่ได้ทำสิ่งนี้ ให้<a data-l10n-name="resetLink">ตั้งรหัสผ่านของคุณใหม่</a>และ<a data-l10n-name="twoFactorSettingsLink">ตั้งค่าการยืนยันตัวตนสองขั้นตอนใหม่</a>ทันที
    สำหรับข้อมูลเพิ่มเติม โปรดไปที่<a data-l10n-name="supportLink">ฝ่ายสนับสนุนของ { -brand-mozilla }</a>
# Followed by link to https://accounts.firefox.com/reset_password
automated-email-reset-pwd-plaintext-v3 = ถ้าคุณไม่ได้ทำสิ่งนี้ ให้ตั้งรหัสผ่านใหม่ของคุณได้เลยที่:
# Followed by link to https://accounts.firefox.com/settings#two-step-authentication
automated-email-reset-two-factor-plaintext = นอกจากนั้น ให้ตั้งค่าการยืนยันตัวตนสองขั้นตอนใหม่ที่:
brand-banner-message = คุณรู้หรือไม่ว่าเราเปลี่ยนชื่อของเราจาก { -product-firefox-accounts } เป็น { -product-mozilla-accounts } แล้ว? <a data-l10n-name="learnMore">เรียนรู้เพิ่มเติม</a>
cancellationSurvey = โปรดช่วยเราปรับปรุงบริการของเราโดยทำ<a data-l10n-name="cancellationSurveyUrl">แบบสำรวจสั้น ๆ</a> นี้
# After the colon, there's a link to https://survey.alchemer.com/s3/6534408/Privacy-Security-Product-Cancellation-of-Service-Q4-21
cancellationSurvey-plaintext = โปรดช่วยเราปรับปรุงบริการของเราโดยทำแบบสำรวจสั้น ๆ นี้:
change-password-plaintext = หากคุณสงสัยว่าใครพยายามเข้าถึงบัญชีของคุณ โปรดเปลี่ยนรหัสผ่านของคุณ
manage-account = จัดการบัญชี
manage-account-plaintext = { manage-account }:
payment-details = รายละเอียดการชำระเงิน:
# Variables:
#  $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
payment-plan-invoice-number = หมายเลขใบแจ้งหนี้: { $invoiceNumber }
# Variables:
#  $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
payment-plan-charged = วันที่เรียกเก็บเงิน: { $invoiceTotal } เมื่อ { $invoiceDateOnly }
# Variables
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
payment-plan-next-invoice = ใบแจ้งหนี้ถัดไป: { $nextInvoiceDateOnly }

## $invoiceNumber (String) - The invoice number of the subscription invoice, e.g. 8675309
## $invoiceDateOnly (String) - The date of the next invoice, e.g. August 28, 2025

# $invoiceSubtotal (String) - The amount, before discount, of the subscription invoice, including currency, e.g. $10.00
subscriptionFirstInvoiceDiscount-content-subtotal = รวมเงิน: { $invoiceSubtotal }

##

subscriptionSupport = มีคำถามเกี่ยวกับการสมัครสมาชิกของคุณหรือไม่? <a data-l10n-name="subscriptionSupportUrl">ทีมสนับสนุน</a>ของเราพร้อมช่วยคุณ
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupport-plaintext = มีคำถามเกี่ยวกับการสมัครสมาชิกของคุณหรือไม่? ทีมสนับสนุนของเราพร้อมช่วยคุณ:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSupportContact = ขอบคุณที่สมัครสมาชิก { $productName } หากคุณมีคำถามใด ๆ เกี่ยวกับการสมัครสมาชิกของคุณหรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับ { $productName } โปรด<a data-l10n-name="subscriptionSupportUrl">ติดต่อเรา</a>
# After the colon, there's a link to https://accounts.firefox.com/support
subscriptionSupportContact-plaintext = ขอบคุณที่สมัครสมาชิก { $productName } หากคุณมีคำถามใด ๆ เกี่ยวกับการสมัครสมาชิกของคุณหรือต้องการข้อมูลเพิ่มเติมเกี่ยวกับ { $productName } โปรดติดต่อเรา:
subscriptionUpdateBillingEnsure = คุณสามารถตรวจสอบว่าวิธีการชำระเงินและข้อมูลบัญชีของคุณเป็นปัจจุบันได้<a data-l10n-name="updateBillingUrl">ที่นี่</a>
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingEnsure-plaintext = คุณสามารถตรวจสอบว่าวิธีการชำระเงินและข้อมูลบัญชีของคุณเป็นปัจจุบันได้ที่นี่:
subscriptionUpdateBillingTry = เราจะลองทำการชำระเงินอีกครั้งในอีกไม่กี่วันข้างหน้า แต่คุณอาจต้องช่วยเราแก้ไขปัญหานี้โดย<a data-l10n-name="updateBillingUrl">อัปเดตข้อมูลการชำระเงินของคุณ</a>
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdateBillingTry-plaintext = เราจะลองทำการชำระเงินอีกครั้งในอีกไม่กี่วันข้างหน้า แต่คุณอาจต้องช่วยเราแก้ไขปัญหานี้โดยอัปเดตข้อมูลการชำระเงินของคุณ:
subscriptionUpdatePayment = เพื่อป้องกันการหยุดให้บริการของคุณ โปรด<a data-l10n-name="updateBillingUrl">อัปเดตข้อมูลการชำระเงินของคุณ</a>โดยเร็วที่สุด
# After the colon, there's a link to https://accounts.firefox.com/subscriptions
subscriptionUpdatePayment-plaintext = เพื่อป้องกันการหยุดให้บริการของคุณ โปรดอัปเดตข้อมูลการชำระเงินของคุณโดยเร็วที่สุด:
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
#  $uaOSVersion (String) - User's OS version, e.g. 10.11
device-all = { $uaBrowser } บน { $uaOS } { $uaOSVersion }
# Variables:
#  $uaBrowser (String) - User's browser, e.g. Firefox
#  $uaOS (String) - User's OS, e.g. Mac OSX
device-browser-os = { $uaBrowser } บน { $uaOS }
# Variables:
#  $invoiceLink (String) - The link to the invoice
# After the colon, there's a link to https://pay.stripe.com/
view-invoice-plaintext = ดูใบแจ้งหนี้: { $invoiceLink }
cadReminderFirst-subject-1 = จดหมายเตือน! มาเริ่มซิงค์ { -brand-firefox } กันเถอะ
cadReminderFirst-action = ซิงค์กับอุปกรณ์อื่น
cadReminderFirst-action-plaintext = { cadReminderFirst-action }:
# In the title of the email, "It takes two to sync", "two" refers to syncing two devices
cadReminderFirst-title-1 = ต้องใช้อุปกรณ์สองเครื่องในการซิงค์
cadReminderFirst-description-v2 = นำแท็บของคุณติดตัวไปกับทุกอุปกรณ์ของคุณ รับที่คั่นหน้า รหัสผ่าน และข้อมูลอื่นๆ ของคุณในทุกที่ที่คุณใช้ { -brand-firefox }
cadReminderSecond-subject-2 = อย่าพลาด! มาตั้งค่าการซิงค์ของคุณให้เสร็จกันเถอะ
cadReminderSecond-action = ซิงค์กับอุปกรณ์อื่น
cadReminderSecond-title-2 = อย่าลืมซิงค์!
cadReminderSecond-description-sync = ซิงค์ที่คั่นหน้า รหัสผ่าน แท็บที่เปิดอยู่ และอื่น ๆ ของคุณในทุกที่ที่คุณใช้ { -brand-firefox }
cadReminderSecond-description-plus = นอกจากนี้ ข้อมูลของคุณจะถูกเข้ารหัสอยู่เสมอ ซึ่งจะมีเพียงคุณและอุปกรณ์ที่คุณอนุมัติเท่านั้นที่จะสามารถเห็นได้
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-subject = ยินดีต้อนรับสู่ { $productName }
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
downloadSubscription-title = ยินดีต้อนรับสู่ { $productName }
downloadSubscription-content-2 = เริ่มต้นใช้คุณลักษณะทั้งหมดที่รวมอยู่ในการสมัครสมาชิกของคุณ:
downloadSubscription-link-action-2 = เริ่มต้น
fraudulentAccountDeletion-subject-2 = ลบ{ -product-mozilla-account } ของคุณแล้ว
fraudulentAccountDeletion-title = ลบบัญชีของคุณแล้ว
fraudulentAccountDeletion-content-part1-v2 = เมื่อเร็วๆ นี้ { -product-mozilla-account } ได้ถูกสร้างขึ้นและได้มีการเรียกเก็บเงินค่าสมัครสมาชิกโดยใช้ที่อยู่อีเมลนี้ เช่นเดียวกับที่เราดำเนินการกับบัญชีใหม่ทั้งหมด เราขอให้คุณยืนยันบัญชีของคุณโดยตรวจสอบความถูกต้องของที่อยู่อีเมลนี้ก่อน
fraudulentAccountDeletion-content-part2-v2 = ปัจจุบันเราเห็นว่าบัญชีนี้ยังไม่ได้ผ่านการยืนยัน เนื่องจากขั้นตอนนี้ยังไม่เสร็จสมบูรณ์ เราจึงไม่แน่ใจว่านี่เป็นการสมัครสมาชิกที่ได้รับอนุญาตหรือไม่ ด้วยเหตุนี้ { -product-mozilla-account } ที่ลงทะเบียนกับที่อยู่อีเมลนี้จึงถูกลบออก และการสมัครสมาชิกของคุณก็ได้ถูกยกเลิกพร้อมกับคืนเงินค่าบริการทั้งหมดแล้ว
fraudulentAccountDeletion-contact = หากคุณมีคำถามใดๆ โปรดติดต่อ<a data-l10n-name="mozillaSupportUrl">ทีมช่วยเหลือ</a>ของเรา
# Variables:
#  $mozillaSupportUrl (String) - Link to https://support.mozilla.org
fraudulentAccountDeletion-contact-plaintext = หากคุณมีคำถามใดๆ โปรดติดต่อทีมสนับสนุนของเรา: { $mozillaSupportUrl }
inactiveAccountFinalWarning-subject = โอกาสสุดท้ายที่จะรักษา{ -product-mozilla-account } ของคุณไว้
inactiveAccountFinalWarning-title = บัญชี { -brand-mozilla } และข้อมูลของคุณจะถูกลบ
inactiveAccountFinalWarning-preview = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ
inactiveAccountFinalWarning-account-description = { -product-mozilla-account } ของคุณถูกใช้เพื่อเข้าถึงผลิตภัณฑ์ความเป็นส่วนตัวและการเรียกดูฟรี เช่น { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } และ { -product-mdn }
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFinalWarning-impact = ในวันที่ <strong>{ $deletionDate }</strong> บัญชีของคุณและข้อมูลส่วนตัวของคุณจะถูกลบถาวร เว้นแต่คุณจะลงชื่อเข้าใช้
inactiveAccountFinalWarning-action = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ
# followed by link to sign in
inactiveAccountFinalWarning-action-plaintext = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ:
inactiveAccountFirstWarning-subject = อย่าให้บัญชีของคุณหายไป
inactiveAccountFirstWarning-title = คุณต้องการเก็บบัญชี { -brand-mozilla } และข้อมูลของคุณไว้หรือไม่?
inactiveAccountFirstWarning-account-description-v2 = { -product-mozilla-account } ของคุณถูกใช้เพื่อเข้าถึงผลิตภัณฑ์ความเป็นส่วนตัวและการเรียกดูฟรี เช่น { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } และ { -product-mdn }
inactiveAccountFirstWarning-inactive-status = เราสังเกตว่าคุณไม่ได้ลงชื่อเข้าใช้มา 2 ปีแล้ว
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
# This date will already be formatted with moment.js into Thursday, Jan 9, 2025 format
inactiveAccountFirstWarning-impact = บัญชีของคุณและข้อมูลส่วนตัวของคุณจะถูกลบถาวรในวันที่ <strong>{ $deletionDate }</strong> เนื่องจากคุณไม่มีความเคลื่อนไหวเลย
inactiveAccountFirstWarning-action = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ
inactiveAccountFirstWarning-preview = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ
# followed by link to sign in
inactiveAccountFirstWarning-action-plaintext = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ:
inactiveAccountSecondWarning-subject = ต้องดำเนินการ: การลบบัญชีใน 7 วัน
inactiveAccountSecondWarning-title = บัญชี { -brand-mozilla } และข้อมูลของคุณจะถูกลบใน 7 วัน
inactiveAccountSecondWarning-account-description-v2 = { -product-mozilla-account } ของคุณถูกใช้เพื่อเข้าถึงผลิตภัณฑ์ความเป็นส่วนตัวและการเรียกดูฟรี เช่น { -brand-firefox } Sync, { -product-mozilla-monitor }, { -product-firefox-relay } และ { -product-mdn }
# $deletionDate - the date when the account will be deleted if the user does not take action to-reactivate their account
inactiveAccountSecondWarning-impact = บัญชีของคุณและข้อมูลส่วนตัวของคุณจะถูกลบถาวรในวันที่ <strong>{ $deletionDate }</strong> เนื่องจากคุณไม่มีความเคลื่อนไหวเลย
inactiveAccountSecondWarning-action = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ
inactiveAccountSecondWarning-preview = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ
# followed by link to sign in
inactiveAccountSecondWarning-action-plaintext = ลงชื่อเข้าใช้เพื่อรักษาบัญชีของคุณ:
# The user has a low number of valid recovery codes remaining for use
codes-reminder-title-zero = คุณไม่มีรหัสยืนยันตัวตนสำรองเหลืออีกแล้ว!
codes-reminder-title-one = คุณเหลือรหัสยืนยันตัวตนสำรองเพียงรหัสเดียวเท่านั้น
codes-reminder-title-two = ได้เวลาสร้างรหัสยืนยันตัวตนเพิ่มแล้ว
codes-reminder-description-part-one = รหัสยืนยันตัวตนสำรองช่วยคุณเรียกคืนข้อมูลของคุณเมื่อคุณลืมรหัสผ่านได้
codes-reminder-description-part-two = สร้างรหัสใหม่ตอนนี้เลยเพื่อไม่ให้ข้อมูลสูญหายในภายหลัง
codes-reminder-description-two-left = คุณเหลือรหัสอีกแค่สองรหัสเท่านั้น
codes-reminder-description-create-codes = สร้างรหัสยืนยันตัวตนสำรองใหม่เพื่อช่วยคุณกลับเข้าใช้บัญชีหากคุณถูกล็อกไม่ให้เข้าใช้ได้
lowRecoveryCodes-action-2 = สร้างรหัส
codes-create-plaintext = { lowRecoveryCodes-action-2 }:
lowRecoveryCodes-subject-2 =
    { $numberRemaining ->
        [0] ไม่มีรหัสยืนยันตัวตนสำรองเหลืออีกแล้ว
        [one] เหลือรหัสยืนยันตัวตนสำรองอีกเพียง { $numberRemaining } รหัสเท่านั้น!
       *[other] เหลือรหัสยืนยันตัวตนสำรองอีกเพียง { $numberRemaining } รหัสเท่านั้น!
    }
# Variables:
# $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
newDeviceLogin-subject = มีการลงชื่อเข้าใช้ใหม่ที่ { $clientName }
newDeviceLogin-subjectForMozillaAccount = มีการลงชื่อเข้าใช้{ -product-mozilla-account } ของคุณครั้งใหม่
newDeviceLogin-title-3 = { -product-mozilla-account } ของคุณถูกใช้ในการลงชื่อเข้า
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password = ไม่ใช่คุณหรือ? <a data-l10n-name="passwordChangeLink">เปลี่ยนรหัสผ่านของคุณ</a>
# The "Not you?" question is asking whether the recipient of the email is the
# person who performed the action that triggered the email.
newDeviceLogin-change-password-plain = ไม่ใช่คุณหรือ? เปลี่ยนรหัสผ่านของคุณ:
newDeviceLogin-action = จัดการบัญชี
passwordChanged-subject = รหัสผ่านได้ถูกเปลี่ยนแล้ว
passwordChanged-title = เปลี่ยนรหัสผ่านสำเร็จแล้ว
passwordChanged-description-2 = เปลี่ยนรหัสผ่าน{ -product-mozilla-account } ของคุณบนอุปกรณ์ต่อไปนี้เรียบร้อย:
passwordChangeRequired-subject = ตรวจพบกิจกรรมที่น่าสงสัย
password-forgot-otp-title = ลืมรหัสผ่านของคุณใช่หรือไม่?
password-forgot-otp-request = เราได้รับคำขอเปลี่ยนรหัสผ่านใน{ -product-mozilla-account } ของคุณจาก:
password-forgot-otp-code-2 = ถ้าเป็นตัวคุณ นี่คือรหัสยืนยันของคุณเพื่อดำเนินการต่อ:
password-forgot-otp-expiry-notice = รหัสนี้จะหมดอายุใน 10 นาที
passwordReset-subject-2 = ตั้งรหัสผ่านของคุณใหม่แล้ว
passwordReset-title-2 = ตั้งรหัสผ่านของคุณใหม่แล้ว
# This sentence is followed by information about the device and time of the password reset
passwordReset-description-2 = คุณตั้งรหัสผ่าน{ -product-mozilla-account } ใหม่บน:
passwordResetAccountRecovery-subject-2 = ตั้งรหัสผ่านของคุณใหม่แล้ว
passwordResetAccountRecovery-title-3 = ตั้งรหัสผ่านของคุณใหม่แล้ว
# Followed by details on the device, location, and date/time of the password reset.
passwordResetAccountRecovery-description-3 = คุณใช้คีย์กู้คืนบัญชีเพื่อตั้งรหัสผ่าน{ -product-mozilla-account } ใหม่บน:
passwordResetAccountRecovery-information = เราได้นำคุณออกจากระบบในอุปกรณ์ที่ซิงค์ทั้งหมดแล้ว เราได้สร้างคีย์กู้คืนบัญชีใหม่เพื่อแทนที่คีย์เดิมที่คุณใช้ คุณสามารถเปลี่ยนได้ในหน้าการตั้งค่าบัญชีของคุณ
# After the colon there is a link to account settings
passwordResetAccountRecovery-information-txt = เราได้นำคุณออกจากระบบในอุปกรณ์ที่ซิงค์ทั้งหมดแล้ว เราได้สร้างคีย์กู้คืนบัญชีใหม่เพื่อแทนที่คีย์เดิมที่คุณใช้ คุณสามารถเปลี่ยนได้ในหน้าการตั้งค่าบัญชีของคุณ:
passwordResetAccountRecovery-action-4 = จัดการบัญชี
passwordResetRecoveryPhone-subject = ใช้เบอร์โทรศัพท์สำหรับกู้คืนแล้ว
passwordResetRecoveryPhone-preview = ตรวจสอบให้แน่ใจว่านี่คือคุณ
passwordResetRecoveryPhone-title = เบอร์โทรศัพท์สำหรับกู้คืนของคุณถูกใช้เพื่อยืนยันการตั้งรหัสผ่านใหม่
passwordResetRecoveryPhone-device = เบอร์โทรศัพท์สำหรับกู้คืนถูกใช้จาก:
passwordResetRecoveryPhone-action = จัดการบัญชี
passwordResetWithRecoveryKeyPrompt-subject = ตั้งรหัสผ่านของคุณใหม่แล้ว
passwordResetWithRecoveryKeyPrompt-title = ตั้งรหัสผ่านของคุณใหม่แล้ว
# Details of the device and date/time where the password was reset
passwordResetWithRecoveryKeyPrompt-description = คุณตั้งรหัสผ่าน{ -product-mozilla-account } ใหม่บน:
# Text for button action to create a new account recovery key
passwordResetWithRecoveryKeyPrompt-action = สร้างคีย์กู้คืนบัญชี
# colon is followed by a link to create an account recovery key from the account settings page
passwordResetWithRecoveryKeyPrompt-action-txt = สร้างคีย์กู้คืนบัญชี:
passwordResetWithRecoveryKeyPrompt-cta-description = คุณจะต้องลงชื่อเข้าอีกครั้งบนอุปกรณ์ที่ซิงค์ทั้งหมด ปกป้องข้อมูลของคุณให้ปลอดภัยในครั้งถัดไปได้ด้วยคีย์กู้คืนบัญชี ซึ่งช่วยให้คุณกู้คืนข้อมูลได้ถ้าคุณลืมรหัสผ่าน
postAddAccountRecovery-subject-3 = สร้างคีย์กู้คืนบัญชีใหม่แล้ว
postAddAccountRecovery-title2 = คุณสร้างคีย์การกู้คืนบัญชีใหม่แล้ว
# Key here refers to account recovery key
postAddAccountRecovery-body-part1 = เก็บคีย์นี้ไว้ในที่ปลอดภัย คุณจะต้องใช้คีย์นี้เพื่อเรียกคืนข้อมูลการเรียกดูที่ถูกเข้ารหัสของคุณหากคุณลืมรหัสผ่าน
# Key here refers to account recovery key
postAddAccountRecovery-body-part2 = คีย์นี้สามารถใช้ได้เพียงครั้งเดียวเท่านั้น หลังจากที่คุณใช้คีย์นี้ไปแล้ว เราจะสร้างคีย์ใหม่ให้คุณโดยอัตโนมัติ หรือคุณสามารถสร้างคีย์ใหม่เมื่อใดก็ได้จากการตั้งค่าบัญชีของคุณ
postAddAccountRecovery-action = จัดการบัญชี
postAddLinkedAccount-subject-2 = มีบัญชีใหม่เชื่อมโยงกับ{ -product-mozilla-account } ของคุณ
#  Variables:
#  $providerName (String) - The name of the provider, e.g. Apple, Google
postAddLinkedAccount-title-2 = ได้เชื่อมโยงบัญชี { $providerName } ของคุณกับ{ -product-mozilla-account } ของคุณแล้ว
postAddLinkedAccount-action = จัดการบัญชี
postAddRecoveryPhone-subject = เพิ่มเบอร์โทรศัพท์สำหรับกู้คืนแล้ว
postAddRecoveryPhone-preview = บัญชีที่ปกป้องโดยการยืนยันตัวตนสองขั้นตอน
postAddRecoveryPhone-title-v2 = คุณได้เพิ่มเบอร์โทรศัพท์สำหรับกู้คืน
# Variables:
#  $maskedLastFourPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddRecoveryPhone-description-v2 = คุณได้เพิ่ม { $maskedLastFourPhoneNumber } เป็นเบอร์โทรศัพท์สำหรับกู้คืนของคุณ
# Links out to a support article about two factor authentication
postAddRecoveryPhone-how-protect = สิ่งนี้ช่วยปกป้องบัญชีของคุณได้อย่างไร
postAddRecoveryPhone-how-protect-plaintext = สิ่งนี้ช่วยปกป้องบัญชีของคุณได้อย่างไร:
postAddRecoveryPhone-enabled-device = คุณเปิดใช้งานจาก:
postAddRecoveryPhone-action = จัดการบัญชี
postAddTwoStepAuthentication-subject-v3 = การยืนยันตัวตนสองขั้นตอนเปิดอยู่
postAddTwoStepAuthentication-title-2 = คุณเปิดการยืนยันตัวตนสองขั้นตอนแล้ว
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = คุณขอสิ่งนี้จาก:
postAddTwoStepAuthentication-action = จัดการบัญชี
postChangeAccountRecovery-subject = เปลี่ยนคีย์กู้คืนบัญชีแล้ว
postChangeAccountRecovery-title = คุณเปลี่ยนคีย์กู้คืนบัญชีของคุณแล้ว
postChangeAccountRecovery-body-part1 = ตอนนี้คุณมีคีย์กู้คืนบัญชีใหม่แล้ว คีย์ก่อนหน้าของคุณถูกลบแล้ว
postChangeAccountRecovery-body-part2 = เก็บคีย์ใหม่นี้ไว้ในที่ปลอดภัย คุณจะต้องใช้คีย์นี้เพื่อเรียกคืนข้อมูลการเรียกดูที่ถูกเข้ารหัสของคุณหากคุณลืมรหัสผ่าน
postChangeAccountRecovery-action = จัดการบัญชี
postChangePrimary-subject = อีเมลหลักได้รับการปรับปรุงแล้ว
postChangePrimary-title = อีเมลหลักใหม่
# Variables:
#  $email (String) - A user's email address
postChangePrimary-description-2 = คุณได้เปลี่ยนแปลงอีเมลหลักเป็น { $email } สำเร็จแล้ว ที่อยู่นี้จะเป็นชื่อผู้ใช้ของคุณสำหรับการลงชื่อเข้าใน{ -product-mozilla-account } ของคุณ รวมถึงการรับการแจ้งเตือนความปลอดภัยและการยืนยันการลงชื่อเข้า
postChangePrimary-action = จัดการบัญชี
postChangeRecoveryPhone-subject = อัปเดตเบอร์โทรศัพท์สำหรับกู้คืนแล้ว
postChangeRecoveryPhone-preview = บัญชีที่ปกป้องโดยการยืนยันตัวตนสองขั้นตอน
postChangeRecoveryPhone-title = คุณเปลี่ยนเบอร์โทรศัพท์สำหรับกู้คืนของคุณแล้ว
postChangeRecoveryPhone-description = ตอนนี้คุณมีเบอร์โทรศัพท์สำหรับกู้คืนใหม่แล้ว เบอร์โทรศัพท์ก่อนหน้าของคุณถูกลบแล้ว
postChangeRecoveryPhone-requested-device = คุณขอเบอร์นี้จาก:
postConsumeRecoveryCode-action = จัดการบัญชี
postNewRecoveryCodes-subject-2 = สร้างรหัสยืนยันตัวตนสำรองใหม่แล้ว
postNewRecoveryCodes-title-2 = คุณได้สร้างรหัสยืนยันตัวตนสำรองใหม่แล้ว
# After the colon, there is information about the device that the authentication codes were created on
postNewRecoveryCodes-description-2 = รหัสเหล่านั้นถูกสร้างขึ้นใน:
postNewRecoveryCodes-action = จัดการบัญชี
postRemoveAccountRecovery-subject-2 = ลบคีย์กู้คืนบัญชีแล้ว
postRemoveAccountRecovery-title-3 = คุณลบคีย์กู้คืนบัญชีของคุณแล้ว
postRemoveAccountRecovery-body-part1 = คุณจำเป็นต้องใช้คีย์กู้คืนบัญชีของคุณเพื่อเรียกคืนข้อมูลการเรียกดูที่เข้ารหัสลับของคุณหากคุณลืมรหัสผ่าน
postRemoveAccountRecovery-body-part2 = หากคุณยังไม่ได้สร้างคีย์กู้คืนบัญชี ให้สร้างคีย์กู้คืนบัญชีใหม่ในการตั้งค่าบัญชีของคุณ เพื่อป้องกันการสูญเสียรหัสผ่าน ที่คั่นหน้า ประวัติการเข้าชม และอื่นๆ อีกมากมาย
postRemoveAccountRecovery-action = จัดการบัญชี
postRemoveRecoveryPhone-subject = ลบเบอร์โทรศัพท์สำหรับกู้คืนแล้ว
postRemoveRecoveryPhone-title = ลบเบอร์โทรศัพท์สำหรับกู้คืนแล้ว
postRemoveRecoveryPhone-requested-device = คุณขอเบอร์นี้จาก:
postRemoveSecondary-subject = อีเมลสำรองถูกลบแล้ว
postRemoveSecondary-title = อีเมลสำรองถูกลบแล้ว
# Variables:
#  $secondaryEmail (String) - A user's email address
postRemoveSecondary-description-2 = คุณได้ลบ { $secondaryEmail } จากอีเมลสำรองจาก{ -product-mozilla-account } ของคุณสำเร็จแล้ว การแจ้งเตือนความปลอดภัยและการยืนยันการลงชื่อเข้าใช้จะไม่มีการส่งไปยังที่อยู่นี้อีก
postRemoveSecondary-action = จัดการบัญชี
postRemoveTwoStepAuthentication-subject-line-2 = ปิดการยืนยันตัวตนสองขั้นตอนแล้ว
postRemoveTwoStepAuthentication-title-2 = คุณได้ปิดการยืนยันตัวตนสองขั้นตอนแล้ว
# After the colon is a description of the device the user used to disable two-step authentication
postRemoveTwoStepAuthentication-from-device = คุณได้ปิดใช้งานจาก:
postRemoveTwoStepAuthentication-action = จัดการบัญชี
postRemoveTwoStepAuthentication-not-required-2 = ไม่ต้องใช้รหัสความปลอดภัยจากแอปยืนยันตัวตนของคุณอีกต่อไปเมื่อคุณลงชื่อเข้า
postSigninRecoveryPhone-device = คุณลงชื่อเข้าใช้จาก:
postSigninRecoveryPhone-action = จัดการบัญชี
postVerify-sub-title-3 = เราดีใจที่ได้พบคุณ!
postVerify-title-2 = ต้องการดูแท็บเดียวกันบนอุปกรณ์สองเครื่องไหม?
postVerify-description-2 = ง่ายมาก! เพียงติดตั้ง { -brand-firefox } บนอุปกรณ์อีกเครื่องแล้วเข้าระบบเพื่อซิงค์ ง่ายเหมือนเสกเวทมนตร์เลย!
postVerify-sub-description = (และยังหมายความว่าคุณสามารถนำที่คั่นหน้า รหัสผ่าน และข้อมูลอื่นๆ ใน { -brand-firefox } ของคุณไปได้ทุกที่ที่คุณลงชื่อเข้า)
postVerify-subject-4 = ยินดีต้อนรับสู่ { -brand-mozilla }!
postVerify-setup-2 = เชื่อมต่ออุปกรณ์อื่น:
postVerify-action-2 = เชื่อมต่ออุปกรณ์อื่น
postVerifySecondary-subject = เพิ่มอีเมลสำรองแล้ว
postVerifySecondary-title = เพิ่มอีเมลสำรองแล้ว
# Variables:
#  $secondaryEmail (String) - A user's secondary email address
postVerifySecondary-content-3 = คุณได้ยืนยัน { $secondaryEmail } เป็นอีเมลสำรองสำหรับ{ -product-mozilla-account } ของคุณสำเร็จแล้ว ตอนนี้การแจ้งเตือนความปลอดภัยและการยืนยันการลงชื่อเข้าจะส่งไปยังอีเมลทั้งสอง
postVerifySecondary-action = จัดการบัญชี
recovery-subject = ตั้งรหัสผ่านใหม่
recovery-title-2 = ลืมรหัสผ่านของคุณใช่หรือไม่?
# Information on the device, location, and date and time of the request that triggered the email follows.
recovery-request-origin-2 = เราได้รับคำขอเปลี่ยนรหัสผ่านใน{ -product-mozilla-account } ของคุณจาก:
recovery-new-password-button = สร้างรหัสผ่านใหม่โดยคลิกที่ปุ่มด้านล่าง ลิงก์นี้จะหมดอายุภายในชั่วโมงถัดไป
recovery-copy-paste = สร้างรหัสผ่านใหม่โดยคัดลอกและวาง URL ด้านล่างลงในเบราว์เซอร์ของคุณ ลิงก์นี้จะหมดอายุภายในชั่วโมงถัดไป
recovery-action = สร้างรหัสผ่านใหม่
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountDeletion-subject = การสมัครสมาชิก { $productName } ของคุณถูกยกเลิกแล้ว
subscriptionAccountDeletion-title = เสียใจที่เห็นคุณจากไป
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $invoiceDateOnly (String) - The date of the next invoice, e.g. 01/20/2016
subscriptionAccountDeletion-content-cancelled-2 = คุณเพิ่งลบ{ -product-mozilla-account } ของคุณ ด้วยเหตุนี้ เราจึงได้ยกเลิกการสมัครสมาชิก { $productName } ของคุณ การชำระเงินครั้งสุดท้ายจำนวน { $invoiceTotal } ของคุณได้จ่ายแล้วเมื่อ { $invoiceDateOnly }
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-subject = ยินดีต้อนรับสู่ { $productName }: โปรดตั้งรหัสผ่านของคุณ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionAccountFinishSetup-title = ยินดีต้อนรับสู่ { $productName }
subscriptionAccountFinishSetup-content-processing = ระบบกำลังประมวลผลการชำระเงินของคุณซึ่งอาจต้องใช้เวลาสี่วันทำการจึงจะเสร็จสมบูรณ์ โดยจะต่ออายุการสมัครสมาชิกของคุณในระยะเวลาการเรียกเก็บเงินแต่ละระยะให้โดยอัตโนมัติเว้นแต่คุณเลือกที่จะยกเลิก
subscriptionAccountFinishSetup-content-create-3 = ถัดไป คุณจะต้องสร้างรหัสผ่าน{ -product-mozilla-account } เพื่อเริ่มใช้การสมัครสมาชิกใหม่ของคุณ
subscriptionAccountFinishSetup-action-2 = เริ่มต้นใช้งาน
subscriptionAccountReminderFirst-subject = แจ้งเตือน: ตั้งค่าบัญชีของคุณให้เสร็จ
subscriptionAccountReminderFirst-title = คุณยังไม่สามารถเข้าถึงการสมัครสมาชิกของคุณได้
subscriptionAccountReminderFirst-content-info-3 = เมื่อไม่กี่วันก่อน คุณได้สร้าง{ -product-mozilla-account } แต่ยังไม่เคยยืนยันเลย เราหวังว่าคุณจะตั้งค่าบัญชีของคุณให้เสร็จสิ้น เพื่อให้คุณสามารถใช้การสมัครสมาชิกใหม่ของคุณได้
subscriptionAccountReminderFirst-content-select-2 = เลือก “สร้างรหัสผ่าน” เพื่อตั้งค่ารหัสผ่านใหม่และยืนยันบัญชีของคุณให้เสร็จ
subscriptionAccountReminderFirst-action = สร้างรหัสผ่าน
subscriptionAccountReminderFirst-action-plaintext = { subscriptionAccountReminderFirst-action }:
subscriptionAccountReminderSecond-subject = การแจ้งเตือนครั้งสุดท้าย: ตั้งค่าบัญชีของคุณ
subscriptionAccountReminderSecond-title-2 = ยินดีต้อนรับสู่ { -brand-mozilla }!
subscriptionAccountReminderSecond-content-info-3 = เมื่อไม่กี่วันก่อน คุณได้สร้าง{ -product-mozilla-account } แต่ยังไม่เคยยืนยันเลย เราหวังว่าคุณจะตั้งค่าบัญชีของคุณให้เสร็จสิ้น เพื่อให้คุณสามารถใช้การสมัครสมาชิกใหม่ของคุณได้
subscriptionAccountReminderSecond-content-select-2 = เลือก “สร้างรหัสผ่าน” เพื่อตั้งค่ารหัสผ่านใหม่และยืนยันบัญชีของคุณให้เสร็จ
subscriptionAccountReminderSecond-action = สร้างรหัสผ่าน
subscriptionAccountReminderSecond-action-plaintext = { subscriptionAccountReminderSecond-action }:
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionCancellation-subject = การสมัครสมาชิก { $productName } ของคุณถูกยกเลิกแล้ว
subscriptionCancellation-title = เสียใจที่เห็นคุณจากไป

## Variables
##   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
##   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
##   $invoiceDateOnly (String) - The date of the invoice, e.g. 01/20/2016

subscriptionCancellation-content-2 = เรายกเลิกการสมัครสมาชิก { $productName } ของคุณแล้ว ยอดชำระรอบสุดท้ายจำนวน { $invoiceTotal } ของคุณได้ถูกชำระแล้วเมื่อวันที่ { $invoiceDateOnly }
subscriptionCancellation-outstanding-content-2 = เรายกเลิกการสมัครสมาชิก { $productName } ของคุณแล้ว ยอดชำระรอบสุดท้ายจำนวน { $invoiceTotal } ของคุณจะถูกชำระในวันที่ { $invoiceDateOnly }
# Variables
#   $serviceLastActiveDateOnly (String) - The date of last active service, e.g. 01/20/2016
subscriptionCancellation-content-continue = บริการของคุณจะยังใช้ได้ต่อไปจนกระทั่งสิ้นสุดระยะเวลาเรียกเก็บเงินปัจจุบัน ซึ่งจะตรงกับวันที่ { $serviceLastActiveDateOnly }
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-subject = คุณได้เปลี่ยนเป็น { $productName }
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-switch = คุณเปลี่ยนจาก { $productNameOld } เป็น { $productName } เรียบร้อยแล้ว
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionDowngrade-content-charge-info = ตั้งแต่การเรียกเก็บเงินครั้งถัดไป ค่าบริการของคุณจะเปลี่ยนจาก { $paymentAmountOld } ต่อ { $productPaymentCycleOld } เป็น { $paymentAmountNew } ต่อ { $productPaymentCycleNew } เมื่อถึงเวลานั้น คุณจะได้รับเครดิตแบบจ่ายครั้งเดียวจำนวน { $paymentProrated } เพื่อให้สอดคล้องกับค่าใช้จ่ายที่ต่ำลงสำหรับส่วนที่เหลือของ { $productPaymentCycleOld } นี้
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionDowngrade-content-install = หากมีซอฟต์แวร์ใหม่ให้คุณติดตั้งเพื่อใช้ { $productName } คุณจะได้รับอีเมลแยกต่างหากพร้อมคำแนะนำในการดาวน์โหลด
subscriptionDowngrade-content-auto-renew = การสมัครของคุณจะต่ออายุโดยอัตโนมัติในแต่ละรอบการเรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-subject = การสมัครสมาชิก { $productName } ของคุณถูกยกเลิกแล้ว
subscriptionFailedPaymentsCancellation-title = การสมัครสมาชิกของคุณถูกยกเลิกแล้ว
#  Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFailedPaymentsCancellation-content = เราได้ยกเลิกการสมัครสมาชิก { $productName } ของคุณแล้ว เนื่องจากพยายามชำระเงินหลายครั้งไม่สำเร็จ หากต้องการรับสิทธิ์เข้าถึงอีกครั้ง ให้เริ่มการสมัครสมาชิกใหม่ด้วยวิธีการชำระเงินที่อัปเดต
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-subject = ยืนยันการชำระเงิน { $productName } แล้ว
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-title = ขอบคุณที่สมัครสมาชิก { $productName }
subscriptionFirstInvoice-content-processing = การชำระเงินของคุณกำลังดำเนินการอยู่และอาจใช้เวลาถึงสี่วันทำการ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionFirstInvoice-content-install-2 = คุณจะได้รับอีเมลแยกต่างหากเกี่ยวกับการเริ่มใช้งาน { $productName }
subscriptionFirstInvoice-content-auto-renew = การสมัครสมาชิกของคุณจะต่ออายุโดยอัตโนมัติในแต่ละรอบการเรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-subject = การชำระเงิน { $productName } ล้มเหลว
subscriptionPaymentFailed-title = ขออภัย เราประสบปัญหากับการชำระเงินของคุณ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentFailed-content-problem = เราประสบปัญหากับการชำระเงินสำหรับ { $productName } ล่าสุดของคุณ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-subject = จำเป็นต้องปรับปรุงข้อมูลการชำระเงินสำหรับ { $productName }
subscriptionPaymentProviderCancelled-title = ขออภัย เราประสบปัญหากับวิธีการชำระเงินของคุณ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionPaymentProviderCancelled-content-detect = เราพบปัญหากับวิธีการชำระเงินสำหรับ { $productName } ของคุณ
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-subject = ต่ออายุการสมัครสมาชิก { $productName } ใหม่แล้ว
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionReactivation-title = ขอบคุณที่ต่ออายุการสมัครสมาชิก { $productName } ใหม่ของคุณ!
# Variables:
#  $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#  $nextInvoiceDateOnly (String) - The date of the next invoice, e.g. 2016/01/20
subscriptionReactivation-content = รอบบิลและการชำระเงินของคุณจะยังคงเหมือนเดิม การเรียกเก็บเงินครั้งถัดไปของคุณจะเป็นจำนวน { $invoiceTotal } ในวันที่ { $nextInvoiceDateOnly } การสมัครสมาชิกของคุณจะต่ออายุโดยอัตโนมัติในแต่ละช่วงเวลาที่เรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-subject = แจ้งการต่ออายุอัตโนมัติของ { $productName }
subscriptionRenewalReminder-title = การสมัครสมาชิกของคุณจะได้รับการต่ออายุในไม่ช้า
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-greeting = เรียน ลูกค้า { $productName }
# Variables
#   $invoiceTotal (String) - The amount of the subscription invoice, including currency, e.g. $10.00
#   $planIntervalCount (String) - The interval count of subscription plan, e.g. 2
#   $planInterval (String) - The interval of time of the subscription plan, e.g. week
#   $reminderLength (String) - The number of days until the current subscription is set to automatically renew, e.g. 14
subscriptionRenewalReminder-content-current = การสมัครสมาชิกปัจจุบันของคุณถูกกำหนดให้ต่ออายุโดยอัตโนมัติใน { $reminderLength } วัน ในเวลานั้น { -brand-mozilla } จะต่ออายุการสมัครสมาชิกเวลา { $planIntervalCount } { $planInterval }ของคุณ และการเรียกเก็บเงินจำนวน { $invoiceTotal } จะถูกนำไปใช้กับวิธีการชำระเงินในบัญชีของคุณ
subscriptionRenewalReminder-content-closing = ขอแสดงความนับถือ
# Variables
#   $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionRenewalReminder-content-signature = ทีมงาน { $productName }
subscriptionsPaymentProviderCancelled-subject = จำเป็นต้องปรับปรุงข้อมูลการชำระเงินสำหรับการสมัครสมาชิก { -brand-mozilla }
subscriptionsPaymentProviderCancelled-title = ขออภัย เราประสบปัญหากับวิธีการชำระเงินของคุณ
subscriptionsPaymentProviderCancelled-content-detected = เราพบปัญหากับวิธีการชำระเงินของคุณสำหรับการสมัครสมาชิกต่อไปนี้
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-subject = ได้รับการชำระเงิน { $productName } แล้ว
subscriptionSubsequentInvoice-title = ขอบคุณที่สมัครเป็นสมาชิก!
# Variables:
#  $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionSubsequentInvoice-content-received = เราได้รับการชำระเงินสำหรับ { $productName } ครั้งล่าสุดของคุณแล้ว
# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = คุณได้อัปเกรดเป็น { $productName }
subscriptionUpgrade-title = ขอบคุณสำหรับการอัปเกรด!

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00

subscriptionUpgrade-auto-renew = การสมัครของคุณจะต่ออายุโดยอัตโนมัติในแต่ละรอบการเรียกเก็บเงิน เว้นแต่คุณเลือกที่จะยกเลิก
unblockCode-title = ใช่คุณที่ลงชื่อเข้าหรือไม่?
unblockCode-prompt = ถ้าใช่ นี่คือรหัสอนุญาตที่คุณต้องการ:
# Variables:
#  $unblockCode (String) - An alphanumeric code
unblockCode-prompt-plaintext = ถ้าใช่ นี่คือรหัสอนุญาตที่คุณต้องการ: { $unblockCode }
unblockCode-report = ถ้าไม่ใช่ ช่วยเรากำจัดผู้บุกรุกและ<a data-l10n-name="reportSignInLink">รายงานมายังเรา</a>
unblockCode-report-plaintext = ถ้าไม่ใช่ ช่วยเรากำจัดผู้บุกรุกและรายงานมายังเรา
verificationReminderFinal-subject = การแจ้งเตือนครั้งสุดท้ายให้ยืนยันบัญชีของคุณ
verificationReminderFinal-description-2 = เมื่อไม่กี่สัปดาห์ก่อน คุณได้สร้าง{ -product-mozilla-account } แต่ไม่เคยยืนยันบัญชีเลย เพื่อความปลอดภัยของคุณ เราจะลบบัญชีนี้ออกหากยังไม่ยืนยันในอีก 24 ชั่วโมงข้างหน้า
confirm-account = ยืนยันบัญชี
confirm-account-plaintext = { confirm-account }:
verificationReminderFirst-subject-2 = อย่าลืมยืนยันบัญชีของคุณ
verificationReminderFirst-title-3 = ยินดีต้อนรับสู่ { -brand-mozilla }!
verificationReminderFirst-description-3 = เมื่อไม่กี่วันที่ผ่านมา คุณได้สร้าง{ -product-mozilla-account } แต่ไม่เคยยืนยันบัญชีเลย โปรดยืนยันบัญชีของคุณภายใน 15 วันข้างหน้า ไม่เช่นนั้นบัญชีจะถูกลบโดยอัตโนมัติ
verificationReminderFirst-sub-description-3 = อย่าพลาดเบราว์เซอร์ที่ให้ความสำคัญกับตัวคุณและความเป็นส่วนตัวของคุณเป็นอันดับแรก
confirm-email-2 = ยืนยันบัญชี
confirm-email-plaintext-2 = { confirm-email-2 }:
verificationReminderFirst-action-2 = ยืนยันบัญชี
verificationReminderSecond-subject-2 = อย่าลืมยืนยันบัญชีของคุณ
verificationReminderSecond-title-3 = อย่าพลาดสิ่งดีๆ จาก { -brand-mozilla }!
verificationReminderSecond-description-4 = เมื่อไม่กี่วันที่ผ่านมา คุณได้สร้าง{ -product-mozilla-account } แต่ไม่เคยยืนยันบัญชีเลย โปรดยืนยันบัญชีของคุณภายใน 10 วันข้างหน้า ไม่เช่นนั้นบัญชีจะถูกลบโดยอัตโนมัติ
verificationReminderSecond-second-description-3 = { -product-mozilla-account } ของคุณช่วยให้คุณสามารถซิงค์ประสบการณ์ { -brand-firefox } ของคุณบนอุปกรณ์ต่างๆ และปลดล็อกการเข้าถึงผลิตภัณฑ์ที่มีการปกป้องความเป็นส่วนตัวเพิ่มเติมจาก { -brand-mozilla }
verificationReminderSecond-sub-description-2 = ร่วมเป็นส่วนหนึ่งของภารกิจของเราในการเปลี่ยนอินเทอร์เน็ตให้เป็นสถานที่ที่เปิดกว้างสำหรับทุกคน
verificationReminderSecond-action-2 = ยืนยันบัญชี
verify-title-3 = ร่วมเปิดกว้างอินเทอร์เน็ตไปกับ { -brand-mozilla }
verify-description-2 = ยืนยันบัญชีของคุณและรับประโยชน์สูงสุดจาก { -brand-mozilla } ทุกที่ที่คุณลงชื่อเข้าไม่ว่าจะเป็น:
verify-subject = สร้างบัญชีของคุณให้เสร็จ
verify-action-2 = ยืนยันบัญชี
# Variables:
#  $clientName (String) - A client the user hasn't signed into before (e.g. Firefox, Sync)
verifyLogin-title-2 = คุณได้ลงชื่อเข้า { $clientName } หรือไม่?
verifyLogin-description-2 = ช่วยเรารักษาบัญชีของคุณให้ปลอดภัยโดยยืนยันว่าคุณลงชื่อเข้าใน:
verifyLogin-subject-2 = ยืนยันการลงชื่อเข้า
verifyLogin-action = ยืนยันการลงชื่อเข้า
# Variables:
#  $serviceName (String) - A service the user hasn't signed into before (e.g. Firefox)
verifyLoginCode-title-2 = คุณได้ลงชื่อเข้า { $serviceName } หรือไม่?
# After the colon is a description of the device used to sign in to the service
verifyLoginCode-safe = ช่วยเรารักษาบัญชีของคุณให้ปลอดภัยโดยอนุมัติการลงชื่อเข้าใน:
verifyLoginCode-prompt-3 = ถ้าใช่ นี่คือรหัสอนุญาตของคุณ:
verifyLoginCode-expiry-notice = จะหมดอายุใน 5 นาที
verifyPrimary-title-2 = ยืนยันอีเมลหลัก
verifyPrimary-description = คำขอเพื่อทำการเปลี่ยนแปลงบัญชีได้ถูกสร้างขึ้นจากอุปกรณ์เหล่านี้:
verifyPrimary-subject = ยืนยันอีเมลหลัก
verifyPrimary-action-2 = ยืนยันอีเมล
verifyPrimary-action-plaintext-2 = { verifyPrimary-action-2 }:
verifyPrimary-post-verify-2 = เมื่อยืนยันแล้ว การเปลี่ยนแปลงบัญชีอย่างการเพิ่มอีเมลสำรองจะทำได้บนอุปกรณ์นี้
verifySecondaryCode-title-2 = ยืนยันอีเมลสำรอง
verifySecondaryCode-action-2 = ยืนยันอีเมล
# Variables:
#  $email (string) A user's unverified secondary email address
verifySecondaryCode-explainer-2 = คำขอเพื่อใช้ { $email } เป็นที่อยู่อีเมลสำรองถูกสร้างขึ้นจาก{ -product-mozilla-account } นี้:
verifySecondaryCode-prompt-2 = ใช้รหัสยืนยันนี้:
verifySecondaryCode-expiry-notice-2 = จะหมดอายุใน 5 นาที เมื่อยืนยันแล้ว ที่อยู่นี้จะเริ่มได้รับการแจ้งเตือนด้านความปลอดภัยและการยืนยันต่างๆ
verifyShortCode-title-3 = ร่วมเปิดกว้างอินเทอร์เน็ตไปกับ { -brand-mozilla }
# Information on the browser and device triggering this confirmation email follows below this string.
verifyShortCode-title-subtext-2 = ยืนยันบัญชีของคุณและรับประโยชน์สูงสุดจาก { -brand-mozilla } ทุกที่ที่คุณลงชื่อเข้าไม่ว่าจะเป็น:
verifyShortCode-prompt-3 = ใช้รหัสยืนยันนี้:
verifyShortCode-expiry-notice = จะหมดอายุใน 5 นาที
