# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = รหัสใหม่ถูกส่งไปทางอีเมลของคุณแล้ว
resend-link-success-banner-heading = ลิงก์ใหม่ถูกส่งไปทางอีเมลของคุณแล้ว
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = เพิ่ม { $accountsEmail } ในรายชื่อติดต่อของคุณเพื่อให้แน่ใจว่ามีการส่งมอบอย่างราบรื่น

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = ปิดแบนเนอร์
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } จะถูกเปลี่ยนชื่อเป็น { -product-mozilla-accounts } ในวันที่ 1 พ.ย. นี้
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = คุณจะยังลงชื่อเข้าด้วยชื่อผู้ใช้และรหัสผ่านเดียวกันอยู่ และจะไม่มีการเปลี่ยนแปลงอื่นใดกับผลิตภัณฑ์ที่คุณใช้
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = เราได้เปลี่ยนชื่อ{ -product-firefox-accounts } เป็น{ -product-mozilla-accounts } แล้ว คุณจะยังลงชื่อเข้าด้วยชื่อผู้ใช้และรหัสผ่านเดียวกันอยู่ และจะไม่มีการเปลี่ยนแปลงอื่นใดกับผลิตภัณฑ์ที่คุณใช้
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = เรียนรู้เพิ่มเติม
# Alt text for close banner image
brand-close-banner =
    .alt = ปิดแบนเนอร์
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = โลโก้รูปตัว m ของ { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = ย้อนกลับ
button-back-title = ย้อนกลับ

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = ดาวน์โหลดและดำเนินการต่อ
    .title = ดาวน์โหลดและดำเนินการต่อ
recovery-key-pdf-heading = คีย์กู้คืนบัญชี
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = สร้างเมื่อ: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = คีย์กู้คืนบัญชี
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = คีย์นี้ช่วยให้คุณสามารถกู้คืนข้อมูลเบราว์เซอร์ที่มีการเข้ารหัสลับไว้ (รวมถึงรหัสผ่าน ที่คั่นหน้า และประวัติ) ในกรณีที่คุณลืมรหัสผ่านได้ โปรดเก็บคีย์นี้ไว้ในตำแหน่งที่คุณสามารถจำได้
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = ตำแหน่งที่จะเก็บคีย์ของคุณ
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = เรียนรู้เพิ่มเติมเกี่ยวกับคีย์กู้คืนบัญชีของคุณ
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = ขออภัย เกิดปัญหาในการดาวน์โหลดคีย์กู้คืนบัญชีของคุณ

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = รับประโยชน์เพิ่มเติมจาก { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = รับข่าวสารล่าสุดและข้อมูลอัปเดตผลิตภัณฑ์จากเรา
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = ทดสอบผลิตภัณฑ์ใหม่ๆ ก่อนใคร
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = โฆษณากระตุ้นการตัดสินใจเพื่อร่วมปฏิรูปอินเทอร์เน็ต

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = ดาวน์โหลดแล้ว
datablock-copy =
    .message = คัดลอกแล้ว
datablock-print =
    .message = พิมพ์แล้ว

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (โดยประมาณ)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (โดยประมาณ)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (โดยประมาณ)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (โดยประมาณ)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = ไม่ทราบตำแหน่งที่ตั้ง
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } ใน { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = ที่อยู่ IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = รหัสผ่าน
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = ทวนรหัสผ่าน
form-password-with-inline-criteria-signup-submit-button = สร้างบัญชี
form-password-with-inline-criteria-reset-new-password =
    .label = รหัสผ่านใหม่
form-password-with-inline-criteria-confirm-password =
    .label = ยืนยันรหัสผ่าน
form-password-with-inline-criteria-reset-submit-button = สร้างรหัสผ่านใหม่
form-password-with-inline-criteria-match-error = รหัสผ่านไม่ตรงกัน
form-password-with-inline-criteria-sr-too-short-message = รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
form-password-with-inline-criteria-sr-not-email-message = รหัสผ่านต้องไม่มีที่อยู่อีเมลของคุณ
form-password-with-inline-criteria-sr-not-common-message = รหัสผ่านต้องไม่ใช่รหัสผ่านที่ใช้กันทั่วไป
form-password-with-inline-criteria-sr-requirements-met = รหัสผ่านที่ใส่เป็นไปตามเงื่อนไขทั้งหมด
form-password-with-inline-criteria-sr-passwords-match = รหัสผ่านที่ใส่ตรงกัน

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = จำเป็นต้องกรอกช่องนี้

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = ใส่รหัส { $codeLength } หลักเพื่อดำเนินการต่อ
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = ใส่รหัส { $codeLength } ตัวอักขระเพื่อดำเนินการต่อ

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = คีย์กู้คืนบัญชี { -brand-firefox }
get-data-trio-title-backup-verification-codes = รหัสยืนยันตัวตนสำรอง
get-data-trio-download-2 =
    .title = ดาวน์โหลด
    .aria-label = ดาวน์โหลด
get-data-trio-copy-2 =
    .title = คัดลอก
    .aria-label = คัดลอก
get-data-trio-print-2 =
    .title = พิมพ์
    .aria-label = พิมพ์

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = สัญลักษณ์เตือน
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = คำเตือน
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = คำเตือน
authenticator-app-aria-label =
    .aria-label = แอปพลิเคชันเครื่องมือยืนยันตัวตน
backup-codes-icon-aria-label-v2 =
    .aria-label = เปิดใช้งานรหัสยืนยันตัวตนสำรองแล้ว
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = ปิดใช้งานรหัสยืนยันตัวตนสำรองแล้ว
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = เปิดใช้งาน SMS กู้คืนแล้ว
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = ปิดใช้งาน SMS กู้คืนแล้ว
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = ธงชาติแคนาดา
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = กาเครื่องหมาย
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = สำเร็จ
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = เปิดใช้งาน
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = ปิดข้อความ
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = รหัส
error-icon-aria-label =
    .aria-label = ข้อผิดพลาด
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = ข้อมูล
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = ธงชาติสหรัฐอเมริกา

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = คอมพิวเตอร์และโทรศัพท์มือถือ ซึ่งมีภาพหัวใจสลายอยู่บนหน้าจอของแต่ละเครื่อง
hearts-verified-image-aria-label =
    .aria-label = คอมพิวเตอร์ โทรศัพท์มือถือ และแท็บเล็ต ซึ่งมีภาพหัวใจเต้นอยู่บนหน้าจอของแต่ละเครื่อง
signin-recovery-code-image-description =
    .aria-label = เอกสารที่มีข้อความที่ซ่อนอยู่
signin-totp-code-image-label =
    .aria-label = อุปกรณ์ที่มีรหัส 6 หลักซ่อนอยู่
confirm-signup-aria-label =
    .aria-label = ซองจดหมายซึ่งประกอบด้วยลิงก์
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = ภาพประกอบที่สื่อถึงคีย์กู้คืนบัญชี
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = ภาพประกอบที่สื่อถึงคีย์กู้คืนบัญชี
password-image-aria-label =
    .aria-label = ภาพประกอบสื่อถึงการพิมพ์รหัสผ่าน
lightbulb-aria-label =
    .aria-label = ภาพประกอบที่สื่อถึงการสร้างคำใบ้ที่เก็บ
email-code-image-aria-label =
    .aria-label = ภาพประกอบที่สื่อถึงอีเมลที่ประกอบด้วยรหัส
recovery-phone-image-description =
    .aria-label = อุปกรณ์มือถือที่รับรหัสจากข้อความตัวอักษร
recovery-phone-code-image-description =
    .aria-label = รหัสที่ได้รับบนอุปกรณ์มือถือ

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = คุณได้ลงชื่อเข้า { -brand-firefox } แล้ว
inline-recovery-key-setup-create-header = ปกป้องความปลอดภัยให้กับบัญชีของคุณ
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = พอมีเวลาที่จะปกป้องข้อมูลของคุณไหม?
inline-recovery-key-setup-info = สร้างคีย์กู้คืนบัญชีเพื่อให้คุณสามารถเรียกคืนข้อมูลการเรียกดูที่ซิงค์ไว้ของคุณกลับมาได้ในกรณีที่คุณเกิดลืมรหัสผ่าน
inline-recovery-key-setup-start-button = สร้างคีย์กู้คืนบัญชี
inline-recovery-key-setup-later-button = ทำภายหลัง

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = ซ่อนรหัสผ่าน
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = แสดงรหัสผ่าน
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = ตอนนี้รหัสผ่านของคุณสามารถมองเห็นได้บนหน้าจอ
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = ตอนนี้รหัสผ่านของคุณถูกซ่อนอยู่
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = รหัสผ่านของคุณสามารถมองเห็นได้บนหน้าจอแล้ว
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = รหัสผ่านของคุณถูกซ่อนแล้ว

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = เลือกประเทศ
input-phone-number-enter-number = กรอกหมายเลขโทรศัพท์
input-phone-number-country-united-states = สหรัฐอเมริกา
input-phone-number-country-canada = แคนาดา
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = ย้อนกลับ

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = ลิงก์สำหรับตั้งรหัสผ่านใหม่เสียหาย
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = ลิงก์สำหรับยืนยันเสียหาย
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = ลิงก์เสียหาย
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = ลิงก์ที่คุณคลิกมีอักขระไม่ครบซึ่งอาจจะเพราะโปรแกรมอ่านอีเมลของคุณ คัดลอกที่อยู่อย่างระมัดระวัง และลองอีกครั้งหนึ่ง

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = รับลิงก์ใหม่

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = จำรหัสผ่านของคุณได้ใช่ไหม?
# link navigates to the sign in page
remember-password-signin-link = ลงชื่อเข้าใช้

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = ยืนยันอีเมลหลักไปแล้ว
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = ยืนยันการลงชื่อเข้าไปแล้ว
confirmation-link-reused-message = ลิงก์ยืนยันนั้นถูกใช้ไปแล้ว และสามารถใช้ได้แค่ครั้งเดียว

## Locale Toggle Component

# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = คำขอไม่ถูกต้อง

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = คุณต้องใช้รหัสผ่านนี้เพื่อเข้าถึงข้อมูลที่เข้ารหัสใดๆ ที่คุณเก็บไว้กับเรา
password-info-balloon-reset-risk-info = การตั้งรหัสผ่านใหม่อาจทำให้สูญเสียข้อมูล เช่น รหัสผ่าน ที่คั่นหน้า

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-inline-min-length = อย่างน้อย 8 ตัวอักษร
password-strength-inline-not-email = ไม่ใช่ที่อยู่อีเมลของคุณ
password-strength-inline-not-common = ไม่ใช่รหัสผ่านที่พบบ่อย
password-strength-inline-confirmed-must-match = รหัสยืนยันตรงกับรหัสผ่านใหม่

## Notification Promo Banner component

account-recovery-notification-cta = สร้าง
account-recovery-notification-header-value = ไม่ต้องสูญเสียข้อมูลของคุณถ้าลืมรหัสผ่าน
account-recovery-notification-header-description = สร้างคีย์กู้คืนบัญชีเพื่อเรียกคืนข้อมูลการเรียกดูที่ซิงค์ไว้ของคุณกลับมาในกรณีที่คุณเกิดลืมรหัสผ่าน

## Ready component

ready-complete-set-up-instruction = ตั้งค่าให้เสร็จสมบูรณ์โดยการใส่รหัสผ่านใหม่ของคุณบน { -brand-firefox } ในอุปกรณ์อื่นๆ
manage-your-account-button = จัดการบัญชีของคุณ
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = ขณะนี้คุณพร้อมใช้ { $serviceName } แล้ว
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = คุณสามารถเข้าสู่การตั้งค่าบัญชีได้แล้ว
# Message shown when the account is ready but the user is not signed in
ready-account-ready = บัญชีของคุณพร้อมแล้ว!
ready-continue = ดำเนินการต่อ
sign-in-complete-header = ยืนยันการลงชื่อเข้าแล้ว
sign-up-complete-header = ยืนยันบัญชีแล้ว
primary-email-verified-header = ยืนยันอีเมลหลักแล้ว

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = ตำแหน่งที่จะเก็บคีย์ของคุณ:
flow-recovery-key-download-storage-ideas-folder-v2 = โฟลเดอร์บนอุปกรณ์ที่ปลอดภัย
flow-recovery-key-download-storage-ideas-cloud = ที่เก็บข้อมูลบนคลาวด์ที่เชื่อถือได้
flow-recovery-key-download-storage-ideas-print-v2 = พิมพ์ลงบนกระดาษ
flow-recovery-key-download-storage-ideas-pwd-manager = ตัวจัดการรหัสผ่าน

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = เพิ่มคำใบ้สำหรับช่วยหาคีย์ของคุณ
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = คำใบนี้ควรเป็นคำใบ้ที่สามารถช่วยคุณจำตำแหน่งที่คุณเก็บคีย์กู้คืนบัญชีของคุณได้ โดยเราจะแสดงให้คุณเห็นระหว่างที่ตั้งรหัสผ่านใหม่เพื่อกู้คืนข้อมูลของคุณ
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = ใส่คำใบ้ (ไม่บังคับ)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = เสร็จสิ้น
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = คำใบ้จะต้องมีอักขระน้อยกว่า 255 ตัว
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = คำใบ้จะต้องไม่มีอักขระ Unicode ที่ไม่ปลอดภัย โดยให้ใช้ได้เฉพาะตัวอักษร ตัวเลข เครื่องหมายวรรคตอน และเครื่องหมายทั่วไปเท่านั้น

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = คำเตือน
password-reset-chevron-expanded = ยุบคำเตือน
password-reset-chevron-collapsed = ขยายคำเตือน
password-reset-data-may-not-be-recovered = ข้อมูลเบราว์เซอร์ของคุณอาจไม่สามารถกู้คืนได้
password-reset-previously-signed-in-device-2 = มีอุปกรณ์ใดๆ ที่คุณลงชื่อเข้าก่อนหน้านี้หรือไม่?
password-reset-data-may-be-saved-locally-2 = ข้อมูลเบราว์เซอร์ของคุณอาจถูกบันทึกไว้ในอุปกรณ์นั้น ให้ตั้งรหัสผ่านของคุณใหม่ จากนั้นลงชื่อเข้าเพื่อเรียกคืนและซิงค์ข้อมูลของคุณ
password-reset-no-old-device-2 = มีอุปกรณ์ใหม่แต่ไม่สามารถเข้าถึงอุปกรณ์เดิมของคุณได้เลยใช่หรือไม่?
password-reset-encrypted-data-cannot-be-recovered-2 = เราขออภัยด้วย แต่ข้อมูลเบราว์เซอร์ที่เข้ารหัสลับของคุณบนเซิร์ฟเวอร์ { -brand-firefox } ไม่สามารถกู้คืนได้
password-reset-warning-have-key = มีคีย์กู้คืนบัญชีใช่หรือไม่?
password-reset-warning-use-key-link = ใช้คีย์กู้คืนบัญชีเลยเพื่อตั้งรหัสผ่านของคุณใหม่และเก็บข้อมูลของคุณ

## Alert Bar

alert-bar-close-message = ปิดข้อความ

## User's avatar

avatar-your-avatar =
    .alt = อวตารของคุณ
avatar-default-avatar =
    .alt = อวตารเริ่มต้น

##


# BentoMenu component

bento-menu-title-3 = ผลิตภัณฑ์ของ { -brand-mozilla }
bento-menu-tagline = ผลิตภัณฑ์เพิ่มเติมจาก { -brand-mozilla } ที่ปกป้องความเป็นส่วนตัวของคุณ
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = เบราว์เซอร์ { -brand-firefox } สำหรับเดสก์ท็อป
bento-menu-firefox-mobile = เบราว์เซอร์ { -brand-firefox } สำหรับมือถือ
bento-menu-made-by-mozilla = สร้างโดย { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = รับ { -brand-firefox } บนมือถือหรือแท็บเล็ต
connect-another-find-fx-mobile-2 = หาคำว่า { -brand-firefox } ใน { -google-play } และ { -app-store }

## Connected services section

cs-heading = บริการที่เชื่อมต่อ
cs-description = ทุกสิ่งที่คุณใช้และลงชื่อเข้า
cs-cannot-refresh = ขออภัย เกิดปัญหาในการรีเฟรชรายการบริการที่เชื่อมต่อ
cs-cannot-disconnect = ไม่พบไคลเอ็นต์ ไม่สามารถยกเลิกการเชื่อมต่อได้
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = ลงชื่อออกจาก { $service } แล้ว
cs-refresh-button =
    .title = รีเฟรชบริการที่เชื่อมต่อ
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = รายการขาดหายหรือซ้ำ?
cs-disconnect-sync-heading = ตัดการเชื่อมต่อจาก Sync

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    ข้อมูลการเรียกดูจะยังคงอยู่บน <span>{ $device }</span>
    แต่จะไม่ซิงค์กับบัญชีของคุณอีกต่อไป
cs-disconnect-sync-reason-3 = เหตุผลหลักที่ตัดการเชื่อมต่อ <span>{ $device }</span> มีอะไรบ้าง?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = อุปกรณ์คือ:
cs-disconnect-sync-opt-suspicious = น่าสงสัย
cs-disconnect-sync-opt-lost = สูญหายหรือถูกขโมย
cs-disconnect-sync-opt-old = เก่าหรือถูกแทนที่
cs-disconnect-sync-opt-duplicate = ทำซ้ำ
cs-disconnect-sync-opt-not-say = ไม่ระบุ

##

cs-disconnect-advice-confirm = ตกลง เข้าใจแล้ว
cs-disconnect-lost-advice-heading = อุปกรณ์ที่สูญหายหรือถูกขโมยถูกตัดการเชื่อมต่อ
cs-disconnect-lost-advice-content-3 = เนื่องจากอุปกรณ์ของคุณสูญหายหรือถูกขโมย เพื่อให้ข้อมูลของคุณปลอดภัย คุณควรเปลี่ยนรหัสผ่านสำหรับ{ -product-mozilla-account } ของคุณในหน้าการตั้งค่าบัญชี และคุณก็ควรค้นหาข้อมูลเกี่ยวกับการลบข้อมูลของคุณจากระยะไกลจากบริษัทผู้ผลิตอุปกรณ์ของคุณด้วย
cs-disconnect-suspicious-advice-heading = อุปกรณ์ที่น่าสงสัยถูกตัดการเชื่อมต่อ
cs-disconnect-suspicious-advice-content-2 = หากอุปกรณ์ที่ตัดการเชื่อมต่อนั้นน่าสงสัย เพื่อให้ข้อมูลของคุณปลอดภัย คุณควรเปลี่ยนรหัสผ่านสำหรับ{ -product-mozilla-account } ของคุณในหน้าการตั้งค่าบัญชี และคุณก็ควรเปลี่ยนรหัสผ่านอื่นๆ ทั้งหมดที่คุณบันทึกไว้ใน { -brand-firefox } ด้วย โดยพิมพ์ว่า about:logins ลงในแถบที่อยู่
cs-sign-out-button = ลงชื่อออก

## Data collection section

dc-heading = การเก็บรวบรวมและใช้ข้อมูล
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = เบราว์เซอร์ { -brand-firefox }
dc-subheader-content-2 = อนุญาตให้{ -product-mozilla-accounts } ส่งข้อมูลด้านเทคนิคและการโต้ตอบไปยัง { -brand-mozilla }
dc-subheader-ff-content = ถ้าต้องการตรวจสอบหรือปรับปรุงการตั้งค่าด้านเทคนิคและข้อมูลการโต้ตอบในเบราว์เซอร์ { -brand-firefox } ของคุณ ให้เปิดการตั้งค่า { -brand-firefox } และไปยัง “ความเป็นส่วนตัวและความปลอดภัย”
dc-opt-out-success-2 = ยกเลิกสำเร็จแล้ว { -product-mozilla-accounts } จะไม่ส่งข้อมูลด้านเทคนิคหรือการโต้ตอบให้กับ { -brand-mozilla }
dc-opt-in-success-2 = ขอบคุณ! การร่วมให้ข้อมูลนี้ช่วยเราปรับปรุง { -product-mozilla-accounts } ให้ดีขึ้นได้
dc-opt-in-out-error-2 = ขออภัย มีปัญหาในการเปลี่ยนการกำหนดลักษณะการรวบรวมข้อมูลของคุณ
dc-learn-more = เรียนรู้เพิ่มเติม

# DropDownAvatarMenu component

drop-down-menu-title-2 = เมนู { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = ลงชื่อเข้าเป็น
drop-down-menu-sign-out = ลงชื่อออก
drop-down-menu-sign-out-error-2 = ขออภัย เกิดปัญหาในการลงชื่อออก

## Flow Container

flow-container-back = กลับ

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = ใส่รหัสผ่านของคุณอีกครั้งเพื่อความปลอดภัย
flow-recovery-key-confirm-pwd-input-label = ใส่รหัสผ่านของคุณ
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = สร้างคีย์กู้คืนบัญชี
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = สร้างคีย์กู้คืนบัญชีใหม่

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = สร้างคีย์กู้คืนบัญชีแล้ว กรุณาดาวน์โหลดและเก็บคีย์นี้ไว้ทันที
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = คีย์นี้ช่วยให้คุณสามารถกู้คืนข้อมูลในกรณีที่ลืมรหัสผ่านได้ กรุณาดาวน์โหลดคีย์นี้ทันที แล้วเก็บไว้ในที่ที่คุณสามารถจำได้ เพราะคุณจะไม่สามารถกลับมายังหน้านี้ได้อีก
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = ดำเนินการต่อโดยไม่ดาวน์โหลด

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = สร้างคีย์กู้คืนบัญชีแล้ว

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = สร้างคีย์กู้คืนบัญชีเผื่อไว้ใช้ในกรณีที่คุณลืมรหัสผ่าน
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = เปลี่ยนคีย์กู้คืนบัญชีของคุณ
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = เราจะเข้ารหัสลับข้อมูลการเรียกดู ไม่ว่าจะเป็นรหัสผ่าน ที่คั่นหน้า และอื่นๆ การเข้ารหัสลับนั้นให้ผลดีต่อความเป็นส่วนตัว แต่คุณอาจสูญเสียข้อมูลได้หากคุณลืมรหัสผ่าน
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = นั่นคือเหตุผลที่การสร้างคีย์กู้คืนบัญชีนั้นสำคัญมาก เพราะคุณสามารถใช้คีย์นั้นเรียกคืนข้อมูลของคุณได้
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = เริ่ม
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = ยกเลิก

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = กรอกรหัสยืนยัน
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = รหัส 6 หลักถูกส่งไปยัง <span>{ $phoneNumber }</span> ทางข้อความแล้ว รหัสนี้จะหมดอายุหลังจาก 5 นาที
flow-setup-phone-confirm-code-input-label = ใส่รหัส 6 หลัก
flow-setup-phone-confirm-code-button = ยืนยัน
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = รหัสหมดอายุใช่หรือไม่?
flow-setup-phone-confirm-code-resend-code-button = ส่งรหัสอีกครั้ง
flow-setup-phone-confirm-code-resend-code-success = ส่งรหัสแล้ว

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = ยืนยันหมายเลขโทรศัพท์ของคุณ
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = ส่งรหัส

## HeaderLockup component, the header in account settings

header-menu-open = ปิดเมนู
header-menu-closed = เมนูนำทางไซต์
header-back-to-top-link =
    .title = กลับขึ้นด้านบน
header-title-2 = { -product-mozilla-account }
header-help = ช่วยเหลือ

## Linked Accounts section

la-heading = บัญชีที่เชื่อมโยง
la-description = คุณได้รับอนุญาตให้เข้าถึงบัญชีต่อไปนี้แล้ว
la-unlink-button = เลิกเชื่อมโยง
la-unlink-account-button = เลิกเชื่อมโยง
la-set-password-button = ตั้งรหัสผ่าน
la-unlink-heading = เลิกลิงก์จากบัญชีบุคคลที่สาม
la-unlink-content-3 = คุณแน่ใจหรือไม่ว่าต้องการเลิกลิงก์บัญชีของคุณ? การเลิกลิงก์บัญชีของคุณไม่ได้ทำให้คุณลงชื่อออกจากบริการที่เชื่อมต่อของคุณโดยอัตโนมัติ หากต้องการทำเช่นนั้น คุณจะต้องลงชื่อออกด้วยตนเองจากส่วน “บริการที่เชื่อมต่อ”
la-unlink-content-4 = ก่อนที่จะยกเลิกการเชื่อมโยงบัญชีของคุณ คุณต้องตั้งรหัสผ่าน หากไม่มีรหัสผ่าน คุณจะไม่มีทางเข้าสู่ระบบได้เลยหลังจากยกเลิกการเชื่อมโยงบัญชีของคุณแล้ว
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = ปิด
modal-cancel-button = ยกเลิก
modal-default-confirm-button = ยืนยัน

## Modal Verify Session

mvs-verify-your-email-2 = ยืนยันอีเมลของคุณ
mvs-enter-verification-code-2 = ใส่รหัสยืนยันของคุณ
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = โปรดใส่รหัสยืนยันที่ส่งไปยัง <email>{ $email }</email> ภายใน 5 นาที
msv-cancel-button = ยกเลิก
msv-submit-button-2 = ยืนยัน

## Settings Nav

nav-settings = การตั้งค่า
nav-profile = โปรไฟล์
nav-security = ความปลอดภัย
nav-connected-services = บริการที่เชื่อมต่อ
nav-data-collection = การเก็บรวบรวมและใช้ข้อมูล
nav-paid-subs = การสมัครสมาชิกแบบเสียค่าใช้จ่าย
nav-email-comm = การติดต่อสื่อสารทางอีเมล

## Two Step Authentication - replace backup authentication code

# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = มีปัญหาขณะแทนที่รหัสยืนยันตัวตนสำรองของคุณ
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = มีปัญหาขณะสร้างรหัสยืนยันตัวตนสำรองของคุณ

## Avatar change page

avatar-page-title =
    .title = รูปโปรไฟล์
avatar-page-add-photo = เพิ่มรูปภาพ
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = ถ่ายภาพ
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = ลบรูปภาพ
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = ถ่ายภาพใหม่
avatar-page-cancel-button = ยกเลิก
avatar-page-save-button = บันทึก
avatar-page-saving-button = กำลังบันทึก…
avatar-page-zoom-out-button =
    .title = ขยายออก
avatar-page-zoom-in-button =
    .title = ขยายเข้า
avatar-page-rotate-button =
    .title = หมุน
avatar-page-camera-error = ไม่สามารถเริ่มใช้กล้องได้
avatar-page-new-avatar =
    .alt = รูปโปรไฟล์ใหม่
avatar-page-file-upload-error-3 = เกิดปัญหาในการอัปโหลดรูปโปรไฟล์ของคุณ
avatar-page-delete-error-3 = เกิดปัญหาในการลบรูปโปรไฟล์ของคุณ
avatar-page-image-too-large-error-2 = ไฟล์ภาพมีขนาดใหญ่เกินกว่าจะอัปโหลดได้

## Password change page

pw-change-header =
    .title = เปลี่ยนรหัสผ่าน
pw-8-chars = อย่างน้อย 8 ตัวอักษร
pw-not-email = ไม่ใช่ที่อยู่อีเมลของคุณ
pw-change-must-match = รหัสผ่านใหม่ตรงกับการยืนยัน
pw-commonly-used = ไม่ใช่รหัสผ่านที่พบบ่อย
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = รักษาความปลอดภัยด้วยการไม่ใช้รหัสผ่านซ้ำ ดูเคล็ดลับในการ<linkExternal>สร้างรหัสผ่านที่รัดกุม</linkExternal>เพิ่ม
pw-change-cancel-button = ยกเลิก
pw-change-save-button = บันทึก
pw-change-forgot-password-link = ลืมรหัสผ่าน?
pw-change-current-password =
    .label = ใส่รหัสผ่านปัจจุบัน
pw-change-new-password =
    .label = ใส่รหัสผ่านใหม่
pw-change-confirm-password =
    .label = ยืนยันรหัสผ่านใหม่
pw-change-success-alert-2 = ปรับปรุงรหัสผ่านแล้ว

## Password create page

pw-create-header =
    .title = สร้างรหัสผ่าน
pw-create-success-alert-2 = ตั้งรหัสผ่านแล้ว
pw-create-error-2 = ขออภัย เกิดปัญหาในการตั้งรหัสผ่านของคุณ

## Delete account page

delete-account-header =
    .title = ลบบัญชี
delete-account-step-1-2 = ขั้นตอนที่ 1 จาก 2
delete-account-step-2-2 = ขั้นตอนที่ 2 จาก 2
delete-account-confirm-title-4 = คุณอาจได้เชื่อมต่อ{ -product-mozilla-account } ของคุณกับผลิตภัณฑ์หรือบริการของ { -brand-mozilla } ซึ่งช่วยให้คุณปลอดภัยและทำงานอย่างได้ผลบนเว็บต่อไปนี้อย่างน้อยหนึ่งอย่าง:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = การซิงค์ข้อมูลใน { -brand-firefox }
delete-account-product-firefox-addons = ส่วนเสริมใน { -brand-firefox }
delete-account-acknowledge = โปรดรับทราบว่าการลบบัญชีของคุณ:
delete-account-chk-box-2 =
    .label = คุณอาจสูญเสียข้อมูลและคุณลักษณะต่าง ๆ ที่บันทึกไว้ภายในผลิตภัณฑ์ของ { -brand-mozilla }
delete-account-chk-box-3 =
    .label = การเปิดใช้งานอีเมลนี้ใหม่อาจไม่คืนค่าข้อมูลที่บันทึกไว้ของคุณ
delete-account-chk-box-4 =
    .label = ส่วนขยายและชุดตกแต่งใด ๆ ที่คุณเผยแพร่ไปยัง addons.mozilla.org จะถูกลบ
delete-account-continue-button = ดำเนินการต่อ
delete-account-password-input =
    .label = ใส่รหัสผ่าน
delete-account-cancel-button = ยกเลิก
delete-account-delete-button-2 = ลบ

## Display name page

display-name-page-title =
    .title = ชื่อที่ใช้แสดง
display-name-input =
    .label = ใส่ชื่อที่ใช้แสดง
submit-display-name = บันทึก
cancel-display-name = ยกเลิก
display-name-update-error-2 = เกิดปัญหาในการปรับปรุงชื่อที่ใช้แสดงของคุณ
display-name-success-alert-2 = ปรับปรุงชื่อที่ใช้แสดงแล้ว

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = กิจกรรมในบัญชีล่าสุด
recent-activity-account-create-v2 = สร้างบัญชีแล้ว
recent-activity-account-disable-v2 = ปิดใช้งานบัญชีแล้ว
recent-activity-account-enable-v2 = เปิดใช้งานบัญชีแล้ว
recent-activity-account-login-v2 = เรียกการเข้าสู่ระบบบัญชีแล้ว
recent-activity-account-reset-v2 = เรียกการตั้งรหัสผ่านใหม่แล้ว
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = ล้างการตีกลับของอีเมลแล้ว
recent-activity-account-login-failure = การพยายามเข้าสู่ระบบบัญชีล้มเหลว
recent-activity-account-two-factor-added = เปิดใช้งานการยืนยันตัวตนสองขั้นตอนแล้ว
recent-activity-account-two-factor-requested = ร้องขอการยืนยันตัวตนสองขั้นตอนแล้ว
recent-activity-account-two-factor-failure = การยืนยันตัวตนสองขั้นตอนล้มเหลว
recent-activity-account-two-factor-success = การยืนยันตัวตนสองขั้นตอนสำเร็จแล้ว
recent-activity-account-two-factor-removed = ลบการยืนยันตัวตนสองขั้นตอนออกแล้ว
recent-activity-account-password-reset-requested = บัญชีร้องขอการตั้งรหัสผ่านใหม่แล้ว
recent-activity-account-password-reset-success = การตั้งรหัสผ่านบัญชีใหม่สำเร็จแล้ว
recent-activity-account-recovery-key-added = เปิดใช้งานคีย์กู้คืนบัญชีแล้ว
recent-activity-account-recovery-key-verification-failure = การยืนยันคีย์กู้คืนบัญชีล้มเหลว
recent-activity-account-recovery-key-verification-success = การยืนยันคีย์กู้คืนบัญชีสำเร็จแล้ว
recent-activity-account-recovery-key-removed = ลบคีย์กู้คืนบัญชีแล้ว
recent-activity-account-password-added = เพิ่มรหัสผ่านใหม่แล้ว
recent-activity-account-password-changed = เปลี่ยนรหัสผ่านแล้ว
recent-activity-account-secondary-email-added = เพิ่มที่อยู่อีเมลสำรองแล้ว
recent-activity-account-secondary-email-removed = ลบที่อยู่อีเมลสำรองแล้ว
recent-activity-account-emails-swapped = สลับที่อยู่อีเมลหลักและสำรองแล้ว
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = กิจกรรมอื่นๆ ของบัญชี

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = คีย์กู้คืนบัญชี
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = กลับไปยังการตั้งค่า

## Add secondary email page

add-secondary-email-step-1 = ขั้นตอนที่ 1 จาก 2
add-secondary-email-error-2 = เกิดปัญหาในการสร้างอีเมลนี้
add-secondary-email-page-title =
    .title = อีเมลสำรอง
add-secondary-email-enter-address =
    .label = ใส่ที่อยู่อีเมล
add-secondary-email-cancel-button = ยกเลิก
add-secondary-email-save-button = บันทึก
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = ไม่สามารถใช้ตัวปกปิดอีเมลเป็นอีเมลสำรองได้

## Verify secondary email page

add-secondary-email-step-2 = ขั้นตอนที่ 2 จาก 2
verify-secondary-email-page-title =
    .title = อีเมลสำรอง
verify-secondary-email-verification-code-2 =
    .label = ใส่รหัสยืนยันของคุณ
verify-secondary-email-cancel-button = ยกเลิก
verify-secondary-email-verify-button-2 = ยืนยัน
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = โปรดใส่รหัสยืนยันที่ส่งไปยัง <strong>{ $email }</strong> ภายใน 5 นาที
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = เพิ่ม { $email } เรียบร้อยแล้ว

##

# Link to delete account on main Settings page
delete-account-link = ลบบัญชี

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
# Links out to the Monitor site
product-promo-monitor-cta = รับการสแกนฟรี

## Profile section

profile-heading = โปรไฟล์
profile-picture =
    .header = รูปภาพ
profile-display-name =
    .header = ชื่อที่แสดงผล
profile-primary-email =
    .header = อีเมลหลัก

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = ขั้นที่ { $currentStep } จาก { $numberOfSteps }

## Security section of Setting

security-heading = ความปลอดภัย
security-password =
    .header = รหัสผ่าน
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = สร้างเมื่อ { $date }
security-not-set = ไม่ได้ตั้งไว้
security-action-create = สร้าง
security-set-password = ตั้งรหัสผ่านเพื่อซิงค์และใช้คุณลักษณะด้านความปลอดภัยของบัญชีบางอย่าง
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = ดูกิจกรรมบัญชีล่าสุด
signout-sync-header = วาระหมดอายุ
signout-sync-session-expired = ขออภัย มีบางอย่างผิดพลาด กรุณาลงชื่อออกจากเมนูเบราว์เซอร์แล้วลองอีกครั้ง

## SubRow component

# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = ไม่มีรหัสที่ใช้ได้
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = เพิ่ม
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = เปลี่ยน
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = เพิ่ม
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = ลบ

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = ปิด
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = เปิด
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = กำลังส่ง…
switch-is-on = เปิด
switch-is-off = ปิด

## Sub-section row Defaults

row-defaults-action-add = เพิ่ม
row-defaults-action-change = เปลี่ยน
row-defaults-action-disable = ปิดใช้งาน
row-defaults-status = ไม่มี

## Account recovery key sub-section on main Settings page

rk-header-1 = คีย์กู้คืนบัญชี
rk-enabled = ถูกเปิดใช้งาน
rk-not-set = ไม่ได้ตั้งค่า
rk-action-create = สร้าง
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = เปลี่ยน
rk-action-remove = เอาออก
rk-key-removed-2 = ลบคีย์กู้คืนบัญชีแล้ว
rk-cannot-remove-key = ไม่สามารถลบกุญแจกู้คืนบัญชีของคุณ
rk-refresh-key-1 = รีเฟรชคีย์กู้คืนบัญชี
rk-content-explain = เรียกคืนข้อมูลของคุณเมื่อคุณลืมรหัสผ่าน
rk-cannot-verify-session-4 = ขออภัย เกิดปัญหาในการยืนยันวาระของคุณ
rk-remove-modal-heading-1 = ลบคีย์กู้คืนบัญชีหรือไม่?
rk-remove-modal-content-1 = ในกรณีที่คุณตั้งรหัสผ่านของคุณใหม่ คุณจะไม่สามารถใช้คีย์กู้คืนบัญชีเพื่อเข้าถึงข้อมูลของคุณได้ คุณไม่สามารถยกเลิกการกระทำนี้ได้
rk-remove-error-2 = ไม่สามารถลบคีย์กู้คืนบัญชีของคุณได้
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = ลบคีย์กู้คืนบัญชี

## Secondary email sub-section on main Settings page

se-heading = อีเมลสำรอง
    .header = อีเมลสำรอง
se-cannot-refresh-email = ขออภัย เกิดปัญหาในการรีเฟรชอีเมลนั้น
se-cannot-resend-code-3 = ขออภัย เกิดปัญหาในการส่งรหัสยืนยันใหม่
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } เป็นอีเมลหลักของคุณแล้ว
se-set-primary-error-2 = ขออภัย เกิดปัญหาในการเปลี่ยนอีเมลหลักของคุณ
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = ลบ { $email } เรียบร้อยแล้ว
se-delete-email-error-2 = ขออภัย เกิดปัญหาในการลบอีเมลนี้
se-verify-session-3 = คุณจะต้องยืนยันวาระปัจจุบันของคุณเพื่อดำเนินการนี้
se-verify-session-error-3 = ขออภัย เกิดปัญหาในการยืนยันวาระของคุณ
# Button to remove the secondary email
se-remove-email =
    .title = ลบอีเมล
# Button to refresh secondary email status
se-refresh-email =
    .title = เรียกอีเมลใหม่
se-unverified-2 = ยังไม่ยืนยัน
se-resend-code-2 =
    จำเป็นต้องมีการยืนยัน <button>ส่งรหัสยืนยันอีกครั้ง</button>
    หากไม่ได้อยู่ในกล่องจดหมายหรือโฟลเดอร์สแปมของคุณ
# Button to make secondary email the primary
se-make-primary = ทำให้เป็นหลัก
se-default-content = เข้าถึงบัญชีของคุณหากคุณไม่สามารถเข้าสู่ระบบอีเมลหลักของคุณได้
se-content-note-1 =
    หมายเหตุ: อีเมลสำรองจะไม่กู้คืนข้อมูลของคุณ คุณจะ
    ต้องมี<a>คีย์กู้คืนบัญชี</a>จึงจะกู้คืนได้
# Default value for the secondary email
se-secondary-email-none = ไม่มี

## Two Step Auth sub-section on Settings main page

tfa-row-header = การยืนยันตัวตนสองขั้นตอน
tfa-row-enabled = เปิดใช้งานอยู่
tfa-row-disabled-status = ปิดใช้งาน
tfa-row-action-add = เพิ่ม
tfa-row-action-disable = ปิดใช้งาน
tfa-row-button-refresh =
    .title = เรียกการยืนยันตัวตนสองขั้นตอนใหม่
tfa-row-cannot-refresh = ขออภัย เกิดปัญหาในการเรียกการยืนยันตัวตนสองขั้นตอนใหม่
tfa-row-enabled-description = บัญชีของคุณมีการปกป้องด้วยการยืนยันตัวตนสองขั้นตอน คุณจะต้องใส่รหัสผ่านแบบใช้ครั้งเดียวจากแอปยืนยันตัวตนของคุณเมื่อเข้าสู่ระบบ{ -product-mozilla-account } ของคุณ
tfa-row-cannot-verify-session-4 = ขออภัย เกิดปัญหาในการยืนยันวาระของคุณ
tfa-row-disable-modal-heading = ต้องการปิดใช้งานการยืนยันตัวตนสองขั้นตอนหรือไม่?
tfa-row-disable-modal-confirm = ปิดใช้งาน
tfa-row-disable-modal-explain-1 =
    คุณจะไม่สามารถยกเลิกการกระทำนี้ได้ คุณยัง
    มีตัวเลือกในการ<linkExternal>แทนที่รหัสยืนยันตัวตนสำรองของคุณ</linkExternal>
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = ปิดใช้งานการยืนยันตัวตนสองขั้นตอนแล้ว
tfa-row-cannot-disable-2 = ไม่สามารถปิดใช้งานการยืนยันตัวตนสองขั้นตอนได้

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = เมื่อดำเนินการต่อ จะถือว่าคุณยอมรับ:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>เงื่อนไขการให้บริการ</mozSubscriptionTosLink>และ<mozSubscriptionPrivacyLink>ประกาศความเป็นส่วนตัว</mozSubscriptionPrivacyLink>สำหรับบริการแบบสมัครสมาชิกของ { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>เงื่อนไขการให้บริการ</mozillaAccountsTos>และ<mozillaAccountsPrivacy>ประกาศความเป็นส่วนตัว</mozillaAccountsPrivacy>สำหรับ{ -product-mozilla-accounts(capitalization: "uppercase") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = เมื่อดำเนินการต่อ จะถือว่าคุณยอมรับ<mozillaAccountsTos>เงื่อนไขการให้บริการ</mozillaAccountsTos>และ<mozillaAccountsPrivacy>ประกาศความเป็นส่วนตัว</mozillaAccountsPrivacy>

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = หรือ
continue-with-google-button = ดำเนินการต่อด้วย { -brand-google }
continue-with-apple-button = ดำเนินการต่อด้วย { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = บัญชีที่ไม่รู้จัก
auth-error-103 = รหัสผ่านไม่ถูกต้อง
auth-error-105-2 = รหัสยืนยันไม่ถูกต้อง
auth-error-110 = โทเคนไม่ถูกต้อง
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = คุณได้พยายามหลายครั้งเกินไป โปรดลองอีกครั้งในภายหลัง
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = คุณได้พยายามหลายครั้งเกินไป โปรดลองอีกครั้ง{ $retryAfter }
auth-error-125 = การร้องขอถูกปิดกั้นด้วยเหตุผลด้านความปลอดภัย
auth-error-138-2 = วาระที่ยังไม่ยืนยัน
auth-error-139 = อีเมลสำรองต้องแตกต่างจากอีเมลของบัญชีคุณ
auth-error-155 = ไม่พบโทเค็น TOTP
auth-error-159 = คีย์การกู้คืนบัญชีไม่ถูกต้อง
auth-error-183-2 = รหัสยืนยันไม่ถูกต้องหรือหมดอายุ
auth-error-206 = ไม่สามารถสร้างรหัสผ่านได้ เนื่องจากรหัสผ่านถูกตั้งไปแล้ว
auth-error-999 = ข้อผิดพลาดที่ไม่คาดคิด
auth-error-1001 = ความพยายามในการเข้าสู่ระบบถูกยกเลิก
auth-error-1002 = วาระหมดอายุ ลงชื่อเข้าใหม่เพื่อดำเนินการต่อ
auth-error-1003 = การเข้าถึงที่เก็บข้อมูลภายในเครื่องหรือคุกกี้ถูกปิดใช้งานอยู่
auth-error-1008 = รหัสผ่านใหม่ของคุณต้องไม่เหมือนเดิม
auth-error-1010 = ต้องการรหัสผ่านที่ถูกต้อง
auth-error-1011 = ต้องการอีเมลที่ถูกต้อง
auth-error-1031 = คุณต้องใส่อายุของคุณเพื่อลงทะเบียน
auth-error-1032 = คุณต้องใส่อายุที่ถูกต้องเพื่อลงทะเบียน
auth-error-1062 = การเปลี่ยนเส้นทางไม่ถูกต้อง
oauth-error-1000 = มีความผิดพลาดบางประการ โปรดปิดแท็บนี้และลองใหม่อีกครั้ง

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = คุณได้ลงชื่อเข้า { -brand-firefox } แล้ว
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = ยืนยันอีเมลแล้ว
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = ยืนยันการลงชื่อเข้าใช้แล้ว
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = ลงชื่อเข้าใช้ { -brand-firefox } ตัวนี้เพื่อตั้งค่าให้เสร็จสิ้น
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = ลงชื่อเข้าใช้
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = ยังเพิ่มอุปกรณ์อยู่ใช่ไหม? ลงชื่อเข้าใช้ { -brand-firefox } บนอุปกรณ์อื่นเพื่อตั้งค่าให้เสร็จสิ้น
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = ลงชื่อเข้าใช้ { -brand-firefox } บนอุปกรณ์เครื่องอื่นเพื่อตั้งค่าให้เสร็จสิ้น
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = ต้องการนำแท็บ ที่คั่นหน้า และรหัสผ่านจากอุปกรณ์อื่นเข้ามาใช่ไหม?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = เชื่อมต่ออุปกรณ์อื่น
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = ยังไม่ทำตอนนี้
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = ลงชื่อเข้าใช้ { -brand-firefox } สำหรับ Android เพื่อตั้งค่าให้เสร็จสิ้น
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = ลงชื่อเข้าใช้ { -brand-firefox } สำหรับ iOS เพื่อตั้งค่าให้เสร็จสิ้น

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = จำเป็นต้องเปิดการเข้าถึงที่เก็บข้อมูลภายในเครื่องและคุกกี้
cookies-disabled-enable-prompt-2 = กรุณาเปิดการเข้าถึงคุกกี้และที่เก็บข้อมูลภายในเครื่องจากเบราว์เซอร์ที่คุณใช้เพื่อเข้าถึง{ -product-mozilla-account } ของคุณ การกระทำนี้จะเปิดใช้งานฟังก์ชันการทำงาน เช่น การจดจำคุณระหว่างวาระต่างๆ
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = ลองอีกครั้ง
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = เรียนรู้เพิ่มเติม

## Index / home page

index-header = ใส่อีเมลของคุณ
index-sync-header = ดำเนินการต่อไปยัง { -product-mozilla-account }
index-sync-subheader = ซิงค์รหัสผ่าน แท็บ และที่คั่นหน้าของคุณในทุกที่ที่คุณใช้ { -brand-firefox }
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = ดำเนินการต่อไปยัง { $serviceName }
index-subheader-default = ดำเนินการต่อไปยังการตั้งค่าบัญชี
index-cta = ลงทะเบียนหรือลงชื่อเข้า
index-account-info = { -product-mozilla-account } จะช่วยปลดล็อกสิทธิ์เข้าถึงผลิตภัณฑ์ที่ปกป้องความเป็นส่วนตัวจาก { -brand-mozilla } เช่นกัน
index-email-input =
    .label = ใส่อีเมลของคุณ

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = ขออภัย! เราไม่สามารถสร้างคีย์กู้คืนบัญชีของคุณ โปรดลองอีกครั้งในภายหลัง
inline-recovery-key-setup-recovery-created = สร้างคีย์กู้คืนบัญชีแล้ว
inline-recovery-key-setup-download-header = ปกป้องความปลอดภัยให้กับบัญชีของคุณ
inline-recovery-key-setup-download-subheader = ดาวน์โหลดและเก็บตอนนี้
inline-recovery-key-setup-download-info = โปรดเก็บคีย์นี้ไว้ในที่ที่คุณสามารถจำได้ เนื่องจากคุณจะไม่สามารถกลับมาที่หน้านี้ได้อีก
inline-recovery-key-setup-hint-header = คำแนะนำด้านความปลอดภัย

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = ยกเลิกการตั้งค่า
inline-totp-setup-continue-button = ดำเนินการต่อ
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = ปกป้องบัญชีของคุณให้ปลอดภัยอีกขั้นโดยกำหนดรหัสยืนยันตัวตนจากหนึ่งใน<authenticationAppsLink>แอปยืนยันตัวตนเหล่านี้</authenticationAppsLink>
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = เปิดใช้งานการยืนยันตัวตนสองขั้นตอน<span>เพื่อไปยังการตั้งค่าบัญชี</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = เปิดใช้งานการยืนยันตัวตนสองขั้นตอน<span>เพื่อไปยัง { $serviceName }</span>
inline-totp-setup-ready-button = พร้อม
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = สแกนรหัสยืนยันตัวตน<span>เพื่อไปยัง { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = ใส่รหัสด้วยตนเอง<span>เพื่อไปยัง { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = สแกนรหัสยืนยันตัวตน<span>เพื่อไปยังการตั้งค่าบัญชี</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = ใส่รหัสด้วยตนเอง<span>เพื่อไปยังการตั้งค่าบัญชี</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = พิมพ์คีย์ลับนี้ในแอปพลิเคชันยืนยันตัวตนของคุณ <toggleToQRButton>ต้องการสแกนรหัส QR แทนใช่หรือไม่?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = สแกนคิวอาร์โค้ดในแอปยืนยันตัวตนของคุณแล้วใส่รหัสยืนยันตัวตนที่ได้มา <toggleToManualModeButton>ไม่สามารถสแกนได้ใช่หรือไม่?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = เมื่อเสร็จสมบูรณ์แล้ว ระบบจะเริ่มสร้างรหัสยืนยันตัวตนให้คุณใส่
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = รหัสยืนยันตัวตน
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = ต้องใส่รหัสยืนยันตัวตน
tfa-qr-code-alt = ใช้รหัส { $code } เพื่อตั้งค่าการยืนยันตัวตนสองขั้นตอนในแอปพลิเคชันที่รองรับ

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = ข้อกฎหมาย
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = เงื่อนไขการให้บริการ
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = ประกาศความเป็นส่วนตัว

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = ประกาศความเป็นส่วนตัว

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = เงื่อนไขการให้บริการ

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = คุณเพิ่งลงชื่อเข้าใช้ { -product-firefox } หรือเปล่า?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = ใช่ อนุมัติอุปกรณ์
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = ถ้านี่ไม่ใช่คุณ ให้<link>เปลี่ยนรหัสผ่านของคุณ</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = เชื่อมต่ออุปกรณ์แล้ว
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = ตอนนี้คุณกำลังซิงค์กับ: { $deviceFamily } บน { $deviceOS }
pair-auth-complete-sync-benefits-text = ตอนนี้คุณสามารถเข้าถึงแท็บที่เปิดอยู่ รหัสผ่าน และที่คั่นหน้าของคุณได้แล้วจากอุปกรณ์ทั้งหมดของคุณ
pair-auth-complete-see-tabs-button = ดูแท็บจากอุปกรณ์ที่ซิงค์
pair-auth-complete-manage-devices-link = จัดการอุปกรณ์

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = ใส่รหัสยืนยันตัวตน<span>เพื่อไปยังการตั้งค่าบัญชี</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = ใส่รหัสยืนยันตัวตน<span>เพื่อไปยัง { $serviceName }</span>
auth-totp-instruction = เปิดแอปยืนยันตัวตนของคุณและใส่รหัสยืนยันตัวตนที่ได้มา
auth-totp-input-label = ใส่รหัส 6 หลัก
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = ยืนยัน
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = ต้องใส่รหัสยืนยันตัวตน

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = ตอนนี้ต้องรอการอนุมัติ<span>จากอุปกรณ์อื่นของคุณ</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = การจับคู่ไม่สำเร็จ
pair-failure-message = กระบวนการตั้งค่าถูกยกเลิก

## Pair index page

pair-sync-header = ซิงค์ { -brand-firefox } บนโทรศัพท์หรือแท็บเล็ตของคุณ
pair-cad-header = เชื่อมต่อ { -brand-firefox } บนอุปกรณ์อื่น
pair-already-have-firefox-paragraph = มี { -brand-firefox } อยู่แล้วบนโทรศัพท์หรือแท็บเล็ตใช่หรือไม่?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = ซิงค์อุปกรณ์ของคุณ
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = หรือดาวน์โหลด
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = สแกนเพื่อดาวน์โหลด { -brand-firefox } สำหรับมือถือ หรือส่ง<linkExternal>ลิงก์ดาวน์โหลด</linkExternal>ให้ตัวคุณเอง
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = ยังไม่ทำตอนนี้
pair-take-your-data-message = นำแท็บ ที่คั่นหน้า และรหัสผ่านของคุณไปด้วยในทุกที่ที่ใช้ { -brand-firefox }
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = เริ่มต้น
# This is the aria label on the QR code image
pair-qr-code-aria-label = คิวอาร์โค้ด

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = เชื่อมต่ออุปกรณ์แล้ว
pair-success-message-2 = การจับคู่สำเร็จแล้ว

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = ยืนยันการจับคู่<span>สำหรับ { $email }</span>
pair-supp-allow-confirm-button = ยืนยันการจับคู่
pair-supp-allow-cancel-link = ยกเลิก

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = ตอนนี้ต้องรอการอนุมัติ<span>จากอุปกรณ์อื่นของคุณ</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = จับคู่โดยใช้แอป
pair-unsupported-message = คุณใช้กล้องระบบหรือไม่? คุณต้องจับคู่จากภายในแอป { -brand-firefox }

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = กรุณารอ ระบบกำลังเปลี่ยนเส้นทางให้คุณไปยังแอปพลิเคชันที่อนุญาต

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = ใส่คีย์กู้คืนบัญชีของคุณ
account-recovery-confirm-key-instruction = คีย์นี้จะกู้คืนข้อมูลการเรียกดูที่เข้ารหัสลับของคุณ เช่น รหัสผ่าน และที่คั่นหน้า จากเซิร์ฟเวอร์ { -brand-firefox }
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = ใส่คีย์กู้คืนบัญชี 32 อักขระของคุณ
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = คำใบ้สำหรับการจัดเก็บของคุณคือ:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = ดำเนินการต่อ
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = ไม่พบคีย์กู้คืนบัญชีของคุณใช่หรือไม่?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = สร้างรหัสผ่านใหม่
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = ตั้งรหัสผ่านแล้ว
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = ขออภัย เกิดปัญหาในการตั้งรหัสผ่านของคุณ
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = ใช้คีย์กู้คืนบัญชี
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = รหัสผ่านของคุณได้ถูกตั้งใหม่แล้ว
reset-password-complete-banner-message = อย่าลืมสร้างคีย์กู้คืนบัญชีใหม่จากหน้าการตั้งค่า{ -product-mozilla-account } ของคุณเพื่อป้องกันปัญหาการลงชื่อเข้าในอนาคต
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } จะลองนำคุณกลับไปเพื่อใช้ตัวปกปิดอีเมลหลังจากที่คุณลงชื่อเข้า

# ConfirmBackupCodeResetPassword page


## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = ตรวจดูอีเมลของคุณ
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = เราส่งรหัสยืนยันไปยัง <span>{ $email }</span> แล้ว
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = ใส่รหัส 8 หลักภายใน 10 นาที
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = ดำเนินการต่อ
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = ส่งรหัสอีกครั้ง
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = ใช้บัญชีอื่น

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = ตั้งรหัสผ่านของคุณใหม่
confirm-totp-reset-password-subheader-v2 = ใส่รหัสยืนยันตัวตนสองขั้นตอน
confirm-totp-reset-password-instruction-v2 = ตรวจดู<strong>แอปยืนยันตัวตน</strong>ของคุณเพื่อตั้งรหัสผ่านใหม่
confirm-totp-reset-password-trouble-code = มีปัญหาในการใส่รหัสใช่หรือไม่?
confirm-totp-reset-password-confirm-button = ยืนยัน
confirm-totp-reset-password-input-label-v2 = ใส่รหัส 6 หลัก
confirm-totp-reset-password-use-different-account = ใช้บัญชีอื่น

## ResetPassword start page

password-reset-flow-heading = ตั้งรหัสผ่านของคุณใหม่
password-reset-body-2 = เราจะสอบถามข้อมูลจำนวนหนึ่งซึ่งคุณทราบอยู่เพียงคนเดียว เพื่อปกป้องบัญชีของคุณให้ปลอดภัย
password-reset-email-input =
    .label = ใส่อีเมลของคุณ
password-reset-submit-button-2 = ดำเนินการต่อ

## ResetPasswordConfirmed

reset-password-complete-header = ตั้งรหัสผ่านของคุณใหม่แล้ว
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = ดำเนินการต่อไปยัง { $serviceName }

## ResetPasswordRecoveryPhone page

reset-password-with-recovery-key-verified-page-title = ตั้งรหัสผ่านใหม่สำเร็จแล้ว
reset-password-complete-new-password-saved = บันทึกรหัสผ่านใหม่แล้ว!
reset-password-complete-recovery-key-created = สร้างคีย์กู้คืนบัญชีใหม่แล้ว กรุณาดาวน์โหลดและจัดเก็บคีย์นี้ทันที
reset-password-complete-recovery-key-download-info = คีย์นี้จำเป็นต่อการกู้คืนข้อมูลถ้าคุณลืมรหัสผ่านของคุณ <b>กรุณาดาวน์โหลดและจัดเก็บคีย์นี้ไว้ในที่ปลอดภัยทันที เนื่องจากทีหลังคุณจะไม่สามารถเข้าถึงหน้านี้ได้อีก</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = ข้อผิดพลาด:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = กำลังยืนยันการลงชื่อเข้า…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = การยืนยันผิดพลาด
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = ลิงก์ยืนยันหมดอายุ
signin-link-expired-message-2 = ลิงก์ที่คุณคลิกหมดอายุแล้วหรือถูกใช้ไปแล้ว

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = ใส่รหัสผ่านของคุณ<span>สำหรับ{ -product-mozilla-account } ของคุณ</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = ดำเนินการต่อไปยัง { $serviceName }
signin-subheader-without-logo-default = ดำเนินการต่อไปยังการตั้งค่าบัญชี
signin-button = ลงชื่อเข้า
signin-header = ลงชื่อเข้า
signin-use-a-different-account-link = ใช้บัญชีอื่น
signin-forgot-password-link = ลืมรหัสผ่านใช่หรือไม่?
signin-password-button-label = รหัสผ่าน
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } จะลองนำคุณกลับไปเพื่อใช้ตัวปกปิดอีเมลหลังจากที่คุณลงชื่อเข้า

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = ลิงก์ที่คุณคลิกมีอักขระไม่ครบซึ่งอาจจะเพราะโปรแกรมอ่านอีเมลของคุณ คัดลอกที่อยู่อย่างระมัดระวัง และลองอีกครั้งหนึ่ง
report-signin-header = รายงานการลงชื่อเข้าใช้ที่ไม่ได้รับอนุญาตใช่หรือไม่?
report-signin-body = คุณได้รับอีเมลเกี่ยวกับความพยายามเข้าถึงบัญชีของคุณ คุณต้องการรายงานกิจกรรมนี้เป็นสิ่งน่าสงสัยหรือไม่?
report-signin-submit-button = รายงานกิจกรรม
report-signin-support-link = ทำไมสิ่งนี้จึงเกิดขึ้น?
report-signin-error = ขออภัย เกิดปัญหาในการส่งรายงาน
signin-bounced-header = ขออภัย เราได้ล็อกบัญชีของคุณแล้ว
# $email (string) - The user's email.
signin-bounced-message = อีเมลยืนยันที่เราส่งไปยัง { $email } ถูกตีกลับ เราจึงล็อกบัญชีของคุณเพื่อปกป้องข้อมูลใน { -brand-firefox } ของคุณ
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = ถ้านี่เป็นที่อยู่อีเมลที่ถูกต้อง โปรด<linkExternal>แจ้งเราให้ทราบ</linkExternal>และเราก็อาจจะช่วยปลดล็อกบัญชีของคุณได้
signin-bounced-create-new-account = ไม่ได้เป็นเจ้าของอีเมลนั้นแล้วใช่หรือไม่? สร้างบัญชีใหม่
back = ย้อนกลับ

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = ยืนยันการเข้าสู่ระบบนี้<span>เพื่อไปยังการตั้งค่าบัญชี</span>
signin-push-code-heading-w-custom-service = ยืนยันการเข้าสู่ระบบนี้<span>เพื่อไปยัง { $serviceName }</span>
signin-push-code-instruction = โปรดตรวจสอบอุปกรณ์อื่นๆ ของคุณและอนุมัติการเข้าสู่ระบบนี้จากเบราว์เซอร์ { -brand-firefox } ของคุณ
signin-push-code-did-not-recieve = ไม่ได้รับการแจ้งเตือนใช่หรือไม่?
signin-push-code-send-email-link = ส่งรหัสทางอีเมล

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = ยืนยันการเข้าสู่ระบบของคุณ
signin-push-code-confirm-description = เราตรวจพบความพยายามเข้าสู่ระบบจากอุปกรณ์ต่อไปนี้ ถ้าเป็นตัวคุณ โปรดอนุมัติการเข้าสู่ระบบ
signin-push-code-confirm-verifying = กำลังยืนยัน
signin-push-code-confirm-login = ยืนยันการเข้าสู่ระบบ
signin-push-code-confirm-wasnt-me = นี่ไม่ใช่ฉัน เปลี่ยนรหัสผ่าน
signin-push-code-confirm-login-approved = การเข้าสู่ระบบของคุณได้ถูกอนุมัติแล้ว โปรดปิดหน้าต่างนี้
signin-push-code-confirm-link-error = ลิงก์เสียหาย โปรดลองใหม่อีกครั้ง

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = ลงชื่อเข้า

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = ลงชื่อเข้า
signin-recovery-code-sub-heading = ใส่รหัสยืนยันตัวตนสำรอง
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = ยืนยัน
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = คุณถูกล็อกใช่หรือไม่?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = ต้องใส่รหัสยืนยันตัวตน

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = ขอบคุณที่เฝ้าระวังอยู่เสมอ
signin-reported-message = ทีมงานของเราได้รับแจ้งรายงานแล้ว รายงานในลักษณะนี้สามารถช่วยเรากำจัดผู้บุกรุกได้

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = ใส่รหัสยืนยัน<span>สำหรับ{ -product-mozilla-account } ของคุณ</span>
signin-token-code-input-label-v2 = ใส่รหัส 6 หลัก
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = ยืนยัน
signin-token-code-code-expired = รหัสหมดอายุใช่หรือไม่?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = ส่งรหัสใหม่ทางอีเมล
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = ต้องใส่รหัสยืนยัน
signin-token-code-resend-error = มีบางอย่างผิดพลาด ไม่สามารถส่งรหัสใหม่ได้
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } จะลองนำคุณกลับไปเพื่อใช้ตัวปกปิดอีเมลหลังจากที่คุณลงชื่อเข้า

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = ลงชื่อเข้าใช้
signin-totp-code-subheader-v2 = ใส่รหัสยืนยันตัวตนสองขั้นตอน
signin-totp-code-instruction-v4 = ตรวจดู<strong>แอปยืนยันตัวตน</strong>ของคุณเพื่อยืนยันการลงชื่อเข้า
signin-totp-code-input-label-v4 = ใส่รหัส 6 หลัก
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = ยืนยัน
signin-totp-code-other-account-link = ใช้บัญชีอื่น
signin-totp-code-recovery-code-link = มีปัญหาในการใส่รหัสใช่หรือไม่?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = ต้องใส่รหัสยืนยันตัวตน
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } จะลองนำคุณกลับไปเพื่อใช้ตัวปกปิดอีเมลหลังจากที่คุณลงชื่อเข้า

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = อนุญาตการลงชื่อเข้านี้
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = ตรวจดูรหัสยืนยันที่ส่งไปยัง { $email } ทางอีเมลของคุณ
signin-unblock-code-input = ใส่รหัสอนุญาต
signin-unblock-submit-button = ดำเนินการต่อ
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = ต้องใส่รหัสอนุญาต
signin-unblock-code-incorrect-length = รหัสอนุญาตต้องมี 8 ตัวอักขระ
signin-unblock-code-incorrect-format-2 = รหัสอนุญาตต้องมีเฉพาะตัวอักษรและ/หรือตัวเลข
signin-unblock-resend-code-button = ไม่อยู่ในโฟลเดอร์กล่องขาเข้าหรือสแปมใช่หรือไม่? ส่งใหม่
signin-unblock-support-link = ทำไมถึงเกิดเหตุการณ์นี้?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } จะลองนำคุณกลับไปเพื่อใช้ตัวปกปิดอีเมลหลังจากที่คุณลงชื่อเข้า

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = ใส่รหัสยืนยัน
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = ใส่รหัสยืนยัน<span>สำหรับ{ -product-mozilla-account } ของคุณ</span>
confirm-signup-code-input-label = ใส่รหัส 6 หลัก
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = ยืนยัน
confirm-signup-code-code-expired = รหัสหมดอายุใช่หรือไม่?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = ส่งรหัสใหม่ทางอีเมล
confirm-signup-code-success-alert = ยืนยันบัญชีสำเร็จแล้ว
# Error displayed in tooltip.
confirm-signup-code-is-required-error = ต้องใส่รหัสยืนยัน
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } จะลองนำคุณกลับไปเพื่อใช้ตัวปกปิดอีเมลหลังจากที่คุณลงชื่อเข้า

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-relay-info = คุณต้องใส่รหัสผ่านเพื่อที่จะจัดการอีเมลที่ปกปิดของคุณและเข้าถึงเครื่องมือความปลอดภัยของ { -brand-mozilla } ได้อย่างปลอดภัย
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = เปลี่ยนอีเมล
