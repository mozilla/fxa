## Email content
## Emails do not contain buttons, only links. Emails have a rich HTML version and a plaintext
## version. The strings are usually identical but sometimes they differ slightly.

fxa-header-mozilla-logo = <img data-l10n-name="mozilla-logo" alt="โลโก้ { -brand-mozilla }">
fxa-header-sync-devices-image = <img data-l10n-name="sync-devices-image" alt="ซิงค์อุปกรณ์">
body-devices-image = <img data-l10n-name="devices-image" alt="อุปกรณ์">
fxa-privacy-url = นโยบายความเป็นส่วนตัวของ { -brand-mozilla }
moz-accounts-privacy-url-2 = ประกาศความเป็นส่วนตัวของ{ -product-mozilla-accounts(capitalization: "uppercase") }
moz-accounts-terms-url = เงื่อนไขการให้บริการของ { -product-mozilla-accounts(capitalization: "uppercase") }
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
change-password-plaintext = หากคุณสงสัยว่าใครพยายามเข้าถึงบัญชีของคุณ โปรดเปลี่ยนรหัสผ่านของคุณ
manage-account = จัดการบัญชี
manage-account-plaintext = { manage-account }:
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-3 = สำหรับข้อมูลเพิ่มเติม ให้ไปที่<a data-l10n-name="supportLink">ฝ่ายสนับสนุนของ { -brand-mozilla }</a>
# Variables:
#  $supportUrl (String) - Link to https://support.mozilla.org/kb/im-having-problems-my-firefox-account
support-message-plaintext = สำหรับข้อมูลเพิ่มเติม ให้ไปที่ฝ่ายสนับสนุนของ { -brand-mozilla }: { $supportUrl }
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
#  $city (String) - User's city
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-all = { $city }, { $stateCode }, { $country } (โดยประมาณ)
# Variables:
#  $city (String) - User's city
#  $country (String) - User's country
location-city-country = { $city }, { $country } (โดยประมาณ)
# Variables:
#  $stateCode (String) - User's state
#  $country (String) - User's country
location-state-country = { $stateCode }, { $country } (โดยประมาณ)
# Variables:
#  $country (stateCode) - User's country
location-country = { $country } (โดยประมาณ)
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
passwordChangeRequired-subject = ตรวจพบกิจกรรมที่น่าสงสัย
passwordChangeRequired-preview = เปลี่ยนรหัสผ่านของคุณทันที
passwordChangeRequired-title-2 = ตั้งรหัสผ่านของคุณใหม่
passwordChangeRequired-suspicious-activity-3 = เราได้ล็อกบัญชีของคุณเพื่อป้องกันกิจกรรมที่น่าสงสัย คุณได้ลงชื่อออกในทุกอุปกรณ์ของคุณแล้ว และข้อมูลที่ซิงค์ไว้ทั้งหมดถูกลบออกเพื่อเป็นการป้องกันไว้ก่อน
passwordChangeRequired-sign-in-3 = ถ้าต้องการลงชื่อเข้าสู่บัญชีของคุณอีกครั้ง สิ่งที่คุณต้องทำก็คือตั้งรหัสผ่านของคุณใหม่
passwordChangeRequired-different-password-2 = <b>สำคัญ:</b> เลือกใช้รหัสผ่านที่ปลอดภัยและแตกต่างจากรหัสผ่านที่คุณเคยใช้ในอดีต
passwordChangeRequired-different-password-plaintext-2 = สำคัญ: เลือกใช้รหัสผ่านที่ปลอดภัยและแตกต่างจากรหัสผ่านที่คุณเคยใช้ในอดีต
passwordChangeRequired-action = ตั้งรหัสผ่านใหม่
passwordChangeRequired-action-plaintext = { passwordChangeRequired-action }:
passwordChanged-subject = รหัสผ่านได้ถูกเปลี่ยนแล้ว
passwordChanged-title = เปลี่ยนรหัสผ่านสำเร็จแล้ว
passwordChanged-description-2 = เปลี่ยนรหัสผ่าน{ -product-mozilla-account } ของคุณบนอุปกรณ์ต่อไปนี้เรียบร้อย:
# Variables:
#  $code (String) - The confirmation code for sign-in
password-forgot-otp-subject-2 = ใช้ { $code } เพื่อเปลี่ยนรหัสผ่านของคุณ
password-forgot-otp-preview = รหัสนี้จะหมดอายุใน 10 นาที
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
postAddTwoStepAuthentication-preview = บัญชีของคุณได้รับการปกป้องแล้ว
postAddTwoStepAuthentication-subject-v3 = การยืนยันตัวตนสองขั้นตอนเปิดอยู่
postAddTwoStepAuthentication-title-2 = คุณเปิดการยืนยันตัวตนสองขั้นตอนแล้ว
# After the colon, there is a description of the device that the user used to enable two-step authentication
postAddTwoStepAuthentication-from-device-v2 = คุณขอสิ่งนี้จาก:
postAddTwoStepAuthentication-action = จัดการบัญชี
postAddTwoStepAuthentication-code-required-v4 = ต่อจากนี้ไป คุณจะต้องใส่รหัสความปลอดภัยจากแอปยืนยันตัวตนทุกครั้งที่คุณลงชื่อเข้า
postAddTwoStepAuthentication-recovery-method-codes = นอกจากนี้ คุณยังได้เพิ่มรหัสยืนยันตัวตนสำรองเป็นวิธีการกู้คืนของคุณด้วย
# Variables:
#  $maskedPhoneNumber (String) - A bullet point mask with the last four digits of the user's phone number, e.g. ••••••1234
postAddTwoStepAuthentication-recovery-method-phone = นอกจากนี้ คุณยังได้เพิ่ม { $maskedLastFourPhoneNumber } เป็นเบอร์โทรศัพท์สำหรับกู้คืนของคุณด้วย
postAddTwoStepAuthentication-how-protects-link = สิ่งนี้ช่วยปกป้องบัญชีของคุณได้อย่างไร
postAddTwoStepAuthentication-how-protects-plaintext = สิ่งนี้ช่วยปกป้องบัญชีของคุณได้อย่างไร:
postAddTwoStepAuthentication-device-sign-out-message = เพื่อปกป้องอุปกรณ์ที่เชื่อมต่อทั้งหมดของคุณ คุณควรลงชื่อออกจากทุกอุปกรณ์ที่คุณใช้บัญชีนี้ จากนั้นลงชื่อเข้าอีกครั้งโดยใช้การยืนยันตัวตนสองขั้นตอน
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
postChangeTwoStepAuthentication-preview = บัญชีของคุณได้รับการปกป้องแล้ว
postChangeTwoStepAuthentication-subject = อัปเดตการยืนยันตัวตนสองขั้นตอนแล้ว
postChangeTwoStepAuthentication-title = อัปเดตการยืนยันตัวตนสองขั้นตอนแล้ว
postChangeTwoStepAuthentication-use-new-account = ตอนนี้คุณจะต้องใช้รายการ { -product-mozilla-account } ใหม่ในแอปยืนยันตัวตนของคุณ รายการเก่าจะไม่สามารถใช้งานได้อีกต่อไปและคุณสามารถลบออกได้
# After the colon, there is a description of the device that the user used to enable two-step authentication
postChangeTwoStepAuthentication-from-device = คุณขอสิ่งนี้จาก:
postChangeTwoStepAuthentication-action = จัดการบัญชี
postChangeTwoStepAuthentication-how-protects-link = สิ่งนี้ช่วยปกป้องบัญชีของคุณได้อย่างไร
postChangeTwoStepAuthentication-how-protects-plaintext = สิ่งนี้ช่วยปกป้องบัญชีของคุณได้อย่างไร:
postChangeTwoStepAuthentication-device-sign-out-message = เพื่อปกป้องอุปกรณ์ที่เชื่อมต่อทั้งหมดของคุณ คุณควรลงชื่อออกจากทุกอุปกรณ์ที่คุณใช้บัญชีนี้ จากนั้นลงชื่อเข้าอีกครั้งโดยใช้การยืนยันตัวตนสองขั้นตอนที่คุณตั้งค่าใหม่
postConsumeRecoveryCode-title-3 = รหัสยืนยันตัวตนสำรองของคุณถูกใช้เพื่อยืนยันการตั้งรหัสผ่านใหม่
# After the colon, there is description of the device that the backup authentication code was used on
# E.g., Firefox Nightly on Mac OSX, Thursday Sept 2, 2024
postConsumeRecoveryCode-description-3 = รหัสถูกใช้จาก:
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
