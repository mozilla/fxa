# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.


## Banner component

resend-code-success-banner-heading = Một mã mới đã được gửi đến email của bạn.
resend-link-success-banner-heading = Một liên kết mới đã được gửi đến email của bạn.
# $accountsEmail is the Mozilla accounts sender email address (e.g. accounts@firefox.com)
resend-success-banner-description = Thêm { $accountsEmail } vào liên hệ của bạn để đảm bảo quá trình gửi diễn ra suôn sẻ.

## Brand Messaging component
## Used to show in product messaging about upcoming brand changes

# This aria-label applies to the dismiss/close button of the banner
# This text is for screen-readers
brand-banner-dismiss-button-2 =
    .aria-label = Đóng biểu ngữ
# This message is displayed as the title element in the banner, prior to actually launching the new brand
brand-prelaunch-title = { -product-firefox-accounts } sẽ được đổi tên thành { -product-mozilla-accounts } vào ngày 1 tháng 11
# This message is displayed as sub title element in the banner, giving a it more context about the brand changes.
brand-prelaunch-subtitle = Bạn sẽ vẫn đăng nhập với tên người dùng và mật khẩu hiện tại và không có thay đổi nào khác đối với các sản phẩm bạn sử dụng.
# This message is displayed as title element in the banner, after the brand changes take affect letting the user know that
# no action is required on their part
brand-postlaunch-title = Chúng tôi đã đổi tên { -product-firefox-accounts } thành { -product-mozilla-accounts }. Bạn sẽ vẫn đăng nhập với tên người dùng và mật khẩu hiện tại và không có thay đổi nào khác đối với các sản phẩm bạn sử dụng.
# This is an extra link element, that directs users to a page where they can learn more about the branding changes.
brand-learn-more = Tìm hiểu thêm
# Alt text for close banner image
brand-close-banner =
    .alt = Đóng biểu ngữ
# Alt text for 'm' logo in banner header
brand-m-logo =
    .alt = Logo m của { -brand-mozilla }

## ButtonBack component
## Allows users to click a back arrow to navigate to the previous page

button-back-aria-label = Quay lại
button-back-title = Quay lại

## ButtonDownloadRecoveryKeyPDF
## Clicking on this button downloads a PDF file that contains the user's account recovery key
## The account recovery key can be used to recover data when users forget their account password

# Button to download the account recovery key as a PDF file and navigate to the next step
# The next (and final) step is an optional prompt to save a storage hint
# .title will displayed as a tooltip on the button
recovery-key-download-button-v3 = Tải xuống và tiếp tục
    .title = Tải xuống và tiếp tục
recovery-key-pdf-heading = Khóa khôi phục tài khoản
# Date when the account recovery key was created and this file was downloaded
# { $date }: formatted date with 'medium' dateStyle format (e.g., for 'en': Jul 31, 2023)
recovery-key-pdf-download-date = Đã tạo: { $date }
# Shown directly above recovery key value and preceeded by a key icon
recovery-key-pdf-key-legend = Khóa khôi phục tài khoản
# Instructions in the text file to prompt the user to keep this information in a secure, easy to remember location.
# Password resets without this account recovery key can result in data loss.
# "key" here refers to "account recovery key"
recovery-key-pdf-instructions = Khóa này cho phép bạn khôi phục dữ liệu trình duyệt đã mã hóa (bao gồm mật khẩu, dấu trang và lịch sử) nếu bạn quên mật khẩu. Lưu trữ nó ở một nơi bạn sẽ nhớ.
# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
recovery-key-pdf-storage-ideas-heading = Nơi lưu trữ khóa của bạn
# Followed by a link (https://mzl.la/3bNrM1I) to get more information and support
recovery-key-pdf-support = Tìm hiểu thêm về khóa khôi phục tài khoản của bạn
# Error message displayed in an alert bar if the PDF download failed.
recovery-key-pdf-download-error = Rất tiếc, đã xảy ra sự cố khi tải xuống khóa khôi phục tài khoản của bạn.

## ChooseNewsletters component
## Checklist of newsletters that the user can choose to sign up to

# Prompt above a checklist of newsletters
choose-newsletters-prompt-2 = Nhận thêm từ { -brand-mozilla }:
# Newsletter checklist item
choose-newsletters-option-latest-news =
    .label = Nhận tin tức và cập nhật sản phẩm mới nhất của chúng tôi
# Newsletter checklist item
choose-newsletters-option-test-pilot =
    .label = Truy cập sớm để kiểm tra sản phẩm mới
# Newsletter checklist item. This for a Mozilla Foundation newsletters,
# "Action alerts" can be interpreted as "Calls to action"
choose-newsletters-option-reclaim-the-internet =
    .label = Cảnh báo hành động để lấy lại môi trường trực tuyến

## Tooltip notifications for actions performed on account recovery keys or one-time use codes

datablock-download =
    .message = Đã tải xuống
datablock-copy =
    .message = Đã sao chép
datablock-print =
    .message = Đã in

## Success banners for datablock actions.
## $count – number of codes

datablock-copy-success = Đã sao chép mã
datablock-download-success = Đã tải xuống mã
datablock-print-success = Đã in mã

##

# Tooltip notification when an account recovery key or one-time use code is copied.
datablock-inline-copy =
    .message = Đã sao chép

## DeviceInfoBlock component
## The strings here are used to display information about the origin of activity happening on a user's account
## For example, when connecting another device to the user's account

# Variables { $city }, { $region }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, British Columbia, Canada (estimated)'
device-info-block-location-city-region-country = { $city }, { $region }, { $country } (ước tính)
# Variables { $region }, { $country } represent the estimated location of the user's device
# For example, 'British Columbia, Canada (estimated)'
device-info-block-location-region-country = { $region }, { $country } (ước tính)
# Variables { $city }, { $country } represent the estimated location of the user's device
# For example, 'Vancouver, Canada (estimated)'
device-info-block-location-city-country = { $city }, { $country } (ước tính)
# Variable { $country } represent the estimated location of the user's device
# For example, 'Canada (estimated)'
device-info-block-location-country = { $country } (ước tính)
# When an approximate location for the user's device could not be determined
device-info-block-location-unknown = Vị trí không xác định
# Variable { $browserName } is the browser that created the request (e.g., Firefox)
# Variable { $genericOSName } is the name of the operating system that created the request (e.g., MacOS, Windows, iOS)
device-info-browser-os = { $browserName } trên { $genericOSName }
# Variable { $ipAddress } represents the IP address where the request originated
# The IP address is a string of numbers separated by periods (e.g., 192.158.1.38)
device-info-ip-address = Địa chỉ IP: { $ipAddress }

## FormPasswordInlineCriteria

form-password-with-inline-criteria-signup-new-password-label =
    .label = Mật khẩu
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = Nhập lại mật khẩu
form-password-with-inline-criteria-signup-submit-button = Tạo tài khoản
form-password-with-inline-criteria-reset-new-password =
    .label = Mật khẩu mới
form-password-with-inline-criteria-confirm-password =
    .label = Xác nhận mật khẩu
form-password-with-inline-criteria-reset-submit-button = Tạo mật khẩu mới
form-password-with-inline-criteria-set-password-new-password-label =
    .label = Mật khẩu
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = Nhập lại mật khẩu
form-password-with-inline-criteria-set-password-submit-button = Bắt đầu đồng bộ hóa
form-password-with-inline-criteria-match-error = Mật khẩu không khớp
form-password-with-inline-criteria-sr-too-short-message = Mật khẩu phải chứa ít nhất 8 ký tự.
form-password-with-inline-criteria-sr-not-email-message = Mật khẩu không được chứa địa chỉ email của bạn.
form-password-with-inline-criteria-sr-not-common-message = Mật khẩu không trùng với các mật khẩu được sử dụng phổ biến.
form-password-with-inline-criteria-sr-requirements-met = Mật khẩu đã nhập cần đáp ứng tất cả các yêu cầu về mật khẩu.
form-password-with-inline-criteria-sr-passwords-match = Mật khẩu đã nhập đã khớp.

## FormVerifyCode

# Fallback default localized error message for empty input field
form-verify-code-default-error = Trường này là bắt buộc

## FormVerifyTotp component
## Form to enter a time-based one-time-passcode (e.g., 6-digit numeric code or 8-digit alphanumeric code)

# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may only contain numbers
# $codeLength : number of digits in a valid code
form-verify-totp-disabled-button-title-numeric = Nhập mã { $codeLength } chữ số để tiếp tục
# Information explaining why button is disabled, also read to screen readers
# Submit button is disabled unless a valid code format is entered
# Used when the code may contain numbers and/or letters
# $codeLength : number of characters in a valid code
form-verify-totp-disabled-button-title-alphanumeric = Nhập mã { $codeLength } ký tự để tiếp tục

# GetDataTrio component, part of Account Recovery Key flow

get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = Khóa khôi phục tài khoản { -brand-firefox }
get-data-trio-title-backup-verification-codes = Mã xác thực dự phòng
get-data-trio-download-2 =
    .title = Tải xuống
    .aria-label = Tải xuống
get-data-trio-copy-2 =
    .title = Sao chép
    .aria-label = Sao chép
get-data-trio-print-2 =
    .title = In
    .aria-label = In

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

# Aria-label option for an alert symbol
alert-icon-aria-label =
    .aria-label = Cảnh báo
# Aria-label option for an alert symbol
icon-attention-aria-label =
    .aria-label = Chú ý
# Aria-label option for an alert symbol
icon-warning-aria-label =
    .aria-label = Cảnh báo
authenticator-app-aria-label =
    .aria-label = Ứng dụng xác thực
backup-codes-icon-aria-label-v2 =
    .aria-label = Đã bật mã xác thực dự phòng
backup-codes-disabled-icon-aria-label-v2 =
    .aria-label = Đã tắt mã xác thực dự phòng
# An icon of phone with text message. A back recovery phone number
backup-recovery-sms-icon-aria-label =
    .aria-label = Đã bật SMS khôi phục
# Disabled version of backup-recovery-sms-icon-aria-label
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = Đã tắt SMS khôi phục
# Used to select Canada as country code for phone number
canadian-flag-icon-aria-label =
    .aria-label = Cờ Canada
# Used to  indicate a general checkmark, as in something checked off in a list!
checkmark-icon-aria-label =
    .aria-label = Chọn
# Used to  indicate a check mark for a successful state/action
checkmark-success-icon-aria-label =
    .aria-label = Thành công
# Used to indicate a check mark for an enabled state/option
checkmark-enabled-icon-aria-label =
    .aria-label = Đã bật
# Used on X icon to dismiss a message such as an alert or banner
close-icon-aria-label =
    .aria-label = Đóng thông báo
# Used to decorate a code you enter for verification purposes
code-icon-aria-label =
    .aria-label = Mã xác minh
error-icon-aria-label =
    .aria-label = Lỗi
# Used as information icon for informative messaging
info-icon-aria-label =
    .aria-label = Thông tin
# Used to select United States as a country code for phone number
usa-flag-icon-aria-label =
    .aria-label = Cờ Hoa Kỳ

## Images - these are all aria labels used for illustrations
## Aria labels are used as alternate text that can be read aloud by screen readers.

hearts-broken-image-aria-label =
    .aria-label = Một máy tính và một điện thoại di động và hình ảnh một trái tim tan vỡ trên mỗi nó
hearts-verified-image-aria-label =
    .aria-label = Một chiếc máy tính, một chiếc điện thoại di động và một chiếc máy tính bảng có hình trái tim đang đập trên mỗi nó
signin-recovery-code-image-description =
    .aria-label = Tài liệu chứa văn bản ẩn.
signin-totp-code-image-label =
    .aria-label = Một thiết bị có mã gồm 6 chữ số.
confirm-signup-aria-label =
    .aria-label = Một phong bì chứa một liên kết
# Used for an image of a key on a shield surrounded by 5 other icons representing information that can be recovered with the account recovery key.
# Other icons and their meaning: Gear (settings), star (favorites), clock (history), magnifying glass (search) and lock (passwords).
security-shield-aria-label =
    .aria-label = Hình minh họa đại diện cho khóa khôi phục tài khoản.
# Used for an image of a single key.
recovery-key-image-aria-label =
    .aria-label = Hình minh họa đại diện cho khóa khôi phục tài khoản.
password-image-aria-label =
    .aria-label = Hình minh họa thể hiện việc gõ mật khẩu.
lightbulb-aria-label =
    .aria-label = Hình minh họa đại diện cho việc tạo gợi ý lưu trữ.
email-code-image-aria-label =
    .aria-label = Hình minh họa thể hiện một email có chứa mã.
recovery-phone-image-description =
    .aria-label = Thiết bị di động nhận mã qua tin nhắn văn bản.
recovery-phone-code-image-description =
    .aria-label = Mã xác minh nhận được trên thiết bị di động.
backup-recovery-phone-image-aria-label =
    .aria-label = Thiết bị di động có khả năng nhắn tin văn bản SMS
backup-authentication-codes-image-aria-label =
    .aria-label = Màn hình thiết bị có mã
sync-clouds-image-aria-label =
    .aria-label = Đám mây có biểu tượng đồng bộ
confetti-falling-image-aria-label =
    .aria-label = Hoạt ảnh những mảnh giấy rơi

## InlineRecoveryKeySetupCreate component
## Users see this view when we prompt them to generate an account recovery key
## after signing in.

inline-recovery-key-setup-signed-in-firefox-2 = Bạn đã đăng nhập vào { -brand-firefox }.
inline-recovery-key-setup-create-header = Bảo mật tài khoản của bạn
# This is a subheader asking users to create an account recovery key, indicating it will only take a moment to complete.
inline-recovery-key-setup-create-subheader = Dành vài phút để bảo vệ dữ liệu của bạn?
inline-recovery-key-setup-info = Tạo khóa khôi phục tài khoản để bạn có thể khôi phục dữ liệu đồng bộ hóa của mình nếu bạn quên mật khẩu.
inline-recovery-key-setup-start-button = Tạo khóa khôi phục tài khoản
inline-recovery-key-setup-later-button = Để sau

## Input Password

# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will hide the password.
input-password-hide = Ẩn mật khẩu
# Tooltip displayed on a password input visibility toggle. Expresses the toggle action, where clicking on the toggle will show the password.
input-password-show = Hiện mật khẩu
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (visible) state of the textbox content.
input-password-hide-aria-2 = Mật khẩu của bạn hiện đang được hiển thị trên màn hình.
# Message read by screen readers when focus is on a password input visibility toggle. Expresses current (hidden) state of the textbox content.
input-password-show-aria-2 = Mật khẩu của bạn hiện đang bị ẩn.
# Message read by screen readers after clicking on a password input visibility toggle to show the password. Expresses the new (visible) state of the textbox content.
input-password-sr-only-now-visible = Mật khẩu của bạn bây giờ được hiển thị trên màn hình.
# Message read by screen readers after clicking on a password input visibility toggle to hide the password. Expresses the new (hidden) state of the textbox content.
input-password-sr-only-now-hidden = Mật khẩu của bạn bây giờ đã bị ẩn.

## Phone number component

# This is an aria-label available to screen readers for a selection list that includes country flags, country name and country code
input-phone-number-country-list-aria-label = Chọn quốc gia
input-phone-number-enter-number = Nhập số điện thoại
input-phone-number-country-united-states = Hoa Kỳ
input-phone-number-country-canada = Canada
# Back button on legal/terms or legal/privacy that takes users to the previous page
legal-back-button = Quay lại

## LinkDamaged component

# The user followed a password reset link that was received by email
# but the link is damaged (for example mistyped or broken by the email client)
reset-pwd-link-damaged-header = Liên kết đặt lại mật khẩu đã bị hỏng
# The user followed a link to signin that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
signin-link-damaged-header = Liên kết xác minh bị hỏng
# The user followed a link to report an invalid signin attempt that was received by email
# but the link was damaged (for example mistyped or broken by the email client).
report-signin-link-damaged-header = Liên kết bị hỏng
# The user followed a link received by email, but the link was damaged.
reset-pwd-link-damaged-message = Liên kết bạn nhấp vào bị thiếu ký tự và có thể đã bị ứng dụng email khách của bạn phá vỡ. Sao chép địa chỉ một cách cẩn thận và thử lại.

## LinkExpired component

# Button to request a new link if the previous link that was emailed to the user is expired
link-expired-new-link-button = Nhận liên kết mới

## LinkRememberPassword component

# immediately before remember-password-signin-link
remember-password-text = Bạn đã nhớ mật khẩu của bạn?
# link navigates to the sign in page
remember-password-signin-link = Đăng nhập

## LinkUsed component

# The user followed a primary email confirmation link, but that link is has been used and is no longer valid
primary-email-confirmation-link-reused = Email chính đã được xác minh trước đó
# The user followed a sign-in confirmation link, but that link has been used and is no longer valid
signin-confirmation-link-reused = Đăng nhập đã được xác nhận trước đó
confirmation-link-reused-message = Liên kết xác nhận đó đã được sử dụng và chỉ có thể được sử dụng một lần.

## Locale Toggle Component

locale-toggle-select-label = Chọn ngôn ngữ
locale-toggle-browser-default = Trình duyệt mặc định
# Users will see this heading when the URL or network request is malformed, e.g. a query parameter is required and is invalid
error-bad-request = Yêu cầu không hợp lệ

## PasswordInfoBalloon
## Balloon displayed next to password input field

password-info-balloon-why-password-info = Bạn cần mật khẩu này để truy cập mọi dữ liệu được mã hóa mà bạn lưu trữ với chúng tôi.
password-info-balloon-reset-risk-info = Đặt lại có nghĩa là có khả năng mất dữ liệu như mật khẩu và dấu trang.

## PasswordStrengthInline component
## These strings are conditions that need to be met to qualify as a strong password

password-strength-long-instruction = Chọn một mật khẩu mạnh mà bạn chưa từng sử dụng trên các trang web khác. Đảm bảo nó đáp ứng các yêu cầu bảo mật:
password-strength-short-instruction = Chọn một mật khẩu mạnh:
password-strength-inline-min-length = Ít nhất 8 ký tự
password-strength-inline-not-email = Không phải địa chỉ email của bạn
password-strength-inline-not-common = Không phải mật khẩu thường được sử dụng
password-strength-inline-confirmed-must-match = Xác nhận khớp với mật khẩu mới
password-strength-inline-passwords-match = Mật khẩu trùng khớp

## Notification Promo Banner component

account-recovery-notification-cta = Tạo
account-recovery-notification-header-value = Đừng để mất dữ liệu nếu bạn quên mật khẩu
account-recovery-notification-header-description = Tạo khóa khôi phục tài khoản để khôi phục dữ liệu đồng bộ hóa của bạn nếu bạn quên mật khẩu.
recovery-phone-promo-cta = Thêm số điện thoại khôi phục
recovery-phone-promo-heading = Thêm lớp bảo vệ bổ sung cho tài khoản của bạn bằng số điện thoại khôi phục
recovery-phone-promo-description = Bây giờ bạn có thể đăng nhập bằng mật khẩu một lần qua SMS nếu bạn không thể sử dụng ứng dụng xác thực hai bước.
recovery-phone-promo-info-link = Tìm hiểu thêm về khôi phục và rủi ro hoán đổi SIM
promo-banner-dismiss-button =
    .aria-label = Loại bỏ biểu ngữ

## Ready component

ready-complete-set-up-instruction = Hoàn tất thiết lập bằng cách nhập mật khẩu mới của bạn trên các thiết bị { -brand-firefox } khác của bạn.
manage-your-account-button = Quản lý tài khoản của bạn
# This is a string that tells the user they can use whatever service prompted them to reset their password or to verify their email
# Variables:
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
ready-use-service = Bạn hiện đã sẵn sàng sử dụng { $serviceName }
# The user successfully accomplished a task (password reset, confirm email) that lets them use their account
ready-use-service-default = Bạn hiện đã sẵn sàng để sử dụng cài đặt tài khoản
# Message shown when the account is ready but the user is not signed in
ready-account-ready = Tài khoản của bạn đã sẵn sàng!
ready-continue = Tiếp tục
sign-in-complete-header = Đã xác nhận đăng nhập
sign-up-complete-header = Tài khoản đã xác minh
primary-email-verified-header = Email chính đã xác minh

## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

# This heading is shown above a list of options for storing the account recovery key
# "key" here refers to "account recovery key"
flow-recovery-key-download-storage-ideas-heading-v2 = Nơi lưu trữ khóa của bạn:
flow-recovery-key-download-storage-ideas-folder-v2 = Thư mục trên thiết bị an toàn
flow-recovery-key-download-storage-ideas-cloud = Lưu trữ đám mây đáng tin cậy
flow-recovery-key-download-storage-ideas-print-v2 = Bản in vật lý
flow-recovery-key-download-storage-ideas-pwd-manager = Trình quản lý mật khẩu

## RecoveryKeySetupHint
## This is the final step in the account recovery key creation flow after a Sync signin or in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# The header of the last step in the account recovery key creation flow
# "key" here refers to the "account recovery key"
flow-recovery-key-hint-header-v2 = Thêm gợi ý để giúp tìm khóa của bạn
# This message explains why saving a storage hint can be helpful. The account recovery key could be "stored" in a physical (e.g., printed) or virtual location (e.g., in a device folder or in the cloud).
# "it" here refers to the storage hint, NOT the "account recovery key"
flow-recovery-key-hint-message-v3 = Gợi ý này sẽ giúp bạn nhớ nơi bạn đã lưu khóa khôi phục tài khoản của mình. Chúng tôi có thể hiển thị nó cho bạn trong lúc bạn đặt lại mật khẩu để khôi phục dữ liệu của bạn.
# The label for the text input where the user types in the storage hint they want to save.
# The storage hint is optional, and users can leave this blank.
flow-recovery-key-hint-input-v2 =
    .label = Nhập gợi ý (không bắt buộc)
# The text of the "submit" button. Clicking on this button will save the hint (if provided) and exit the account recovery key creation flow.
# "Finish" refers to "Finish the account recovery key creation process"
flow-recovery-key-hint-cta-text = Hoàn thành
# Error displayed in a tooltip if the hint entered by the user exceeds the character limit.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-char-limit-error = Chuỗi gợi ý phải chứa ít hơn 255 kí tự.
# Error displayed in a tooltip if the user included unsafe unicode characters in their hint.
# "Hint" refers to "storage hint"
flow-recovery-key-hint-unsafe-char-error = Gợi ý không được chứa các ký tự unicode không an toàn. Chỉ cho phép các chữ cái, số, dấu chấm câu và ký hiệu.

## ResetPasswordWarning component
## Warning shown to sync users that reset their password without using an account recovery key

password-reset-warning-icon = Cảnh báo
password-reset-chevron-expanded = Thu gọn cảnh báo
password-reset-chevron-collapsed = Mở rộng cảnh báo
password-reset-data-may-not-be-recovered = Dữ liệu trình duyệt của bạn có thể không được phục hồi
password-reset-previously-signed-in-device-2 = Bạn có thiết bị nào đã đăng nhập trước đó không?
password-reset-data-may-be-saved-locally-2 = Dữ liệu trình duyệt của bạn có thể được lưu trên thiết bị đó. Đặt lại mật khẩu của bạn, sau đó đăng nhập vào đó để khôi phục và đồng bộ hóa dữ liệu của bạn.
password-reset-no-old-device-2 = Bạn có thiết bị mới nhưng không có quyền truy cập vào bất kỳ thiết bị nào trước đây của bạn?
password-reset-encrypted-data-cannot-be-recovered-2 = Chúng tôi rất tiếc, dữ liệu trình duyệt được mã hóa của bạn trên máy chủ { -brand-firefox } không thể khôi phục được.
password-reset-warning-have-key = Bạn đã có khóa khôi phục tài khoản?
password-reset-warning-use-key-link = Sử dụng nó ngay bây giờ để đặt lại mật khẩu và giữ lại dữ liệu của bạn

## Alert Bar

alert-bar-close-message = Đóng thông báo

## User's avatar

avatar-your-avatar =
    .alt = Ảnh đại diện của bạn
avatar-default-avatar =
    .alt = Ảnh đại diện mặc định

##


# BentoMenu component

bento-menu-title-3 = Các sản phẩm { -brand-mozilla }
bento-menu-tagline = Các sản phẩm khác từ { -brand-mozilla } bảo vệ quyền riêng tư của bạn
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = Trình duyệt { -brand-firefox } dành cho máy tính để bàn
bento-menu-firefox-mobile = Trình duyệt { -brand-firefox } dành cho di động
bento-menu-made-by-mozilla = Được tạo bởi { -brand-mozilla }

## Connect another device promo

connect-another-fx-mobile = Tải xuống { -brand-firefox } trên điện thoại di động hoặc máy tính bảng
connect-another-find-fx-mobile-2 = Tìm kiếm { -brand-firefox } trong { -google-play } và { -app-store }.
# Alt text for Google Play and Apple App store images that will be shown if the image can't be loaded.
# These images are used to encourage users to download Firefox on their mobile devices.
connect-another-play-store-image-2 =
    .alt = Tải xuống { -brand-firefox } trên { -google-play }
connect-another-app-store-image-3 =
    .alt = Tải xuống { -brand-firefox } trên { -app-store }

## Connected services section

cs-heading = Dịch vụ đã kết nối
cs-description = Mọi thứ bạn đang sử dụng và đã đăng nhập.
cs-cannot-refresh =
    Xin lỗi, đã có sự cố khi tải lại danh sách dịch vụ
    đã kết nối.
cs-cannot-disconnect = Không tìm thấy ứng dụng khách, không ngắt kết nối được.
# This string is used in a notification message near the top of the page.
# Variables:
#   $service (String) - the name of a device or service that uses Mozilla accounts
#                       (for example: "Firefox Lockwise")
cs-logged-out-2 = Đã đăng xuất khỏi { $service }
cs-refresh-button =
    .title = Tải lại dịch vụ đã kết nối
# Link text to a support page on missing or duplicate devices
cs-missing-device-help = Các mục bị thiếu hoặc trùng lặp?
cs-disconnect-sync-heading = Ngắt kết nối khỏi đồng bộ hóa

## This string is used in a modal dialog when the user starts the disconnect from
## Sync process.
## Variables:
##   $device (String) - the name of a device using Mozilla accounts
##                      (for example: "Firefox Nightly on Google Pixel 4a")

cs-disconnect-sync-content-3 =
    Dữ liệu duyệt web của bạn sẽ vẫn còn trên <span>{ $device }</span>,
    nhưng sẽ không còn đồng bộ hóa với tài khoản của bạn.
cs-disconnect-sync-reason-3 = Lý do chính để ngắt kết nối <span>{ $device }</span> là gì?

## The following are the options for selecting a reason for disconnecting the
## device

cs-disconnect-sync-opt-prefix = Thiết bị là:
cs-disconnect-sync-opt-suspicious = Khả nghi
cs-disconnect-sync-opt-lost = Mất hoặc bị đánh cắp
cs-disconnect-sync-opt-old = Cũ hoặc thay thế
cs-disconnect-sync-opt-duplicate = Trùng lặp
cs-disconnect-sync-opt-not-say = Không có câu trả lời

##

cs-disconnect-advice-confirm = Ok, đã hiểu
cs-disconnect-lost-advice-heading = Đã ngắt kết nối khỏi thiết bị đã mất hoặc bị đánh cắp
cs-disconnect-lost-advice-content-3 = Vì thiết bị của bạn bị mất hoặc bị đánh cắp nên để giữ an toàn cho thông tin của bạn, bạn nên thay đổi mật khẩu { -product-mozilla-account } trong cài đặt tài khoản của mình. Bạn cũng nên tìm kiếm thông tin từ nhà sản xuất thiết bị về việc xóa dữ liệu của bạn từ xa.
cs-disconnect-suspicious-advice-heading = Đã ngắt kết nối thiết bị khả nghi
cs-disconnect-suspicious-advice-content-2 = Nếu thiết bị bị ngắt kết nối thực sự đáng ngờ, để giữ an toàn cho thông tin của bạn, bạn nên thay đổi mật khẩu { -product-mozilla-account } trong cài đặt tài khoản của mình. Bạn cũng nên thay đổi bất kỳ mật khẩu nào khác mà bạn đã lưu trong { -brand-firefox } bằng cách nhập about:logins vào thanh địa chỉ.
cs-sign-out-button = Đăng xuất

## Data collection section

dc-heading = Thu thập và sử dụng dữ liệu
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = Trình duyệt { -brand-firefox }
dc-subheader-content-2 = Cho phép { -product-mozilla-accounts } để gửi dữ liệu kỹ thuật và tương tác tới { -brand-mozilla }.
dc-subheader-ff-content = Để xem lại hoặc cập nhật cài đặt dữ liệu kỹ thuật và tương tác của trình duyệt { -brand-firefox } của bạn, hãy mở cài đặt { -brand-firefox } và điều hướng đến Riêng tư và bảo mật.
dc-opt-out-success-2 = Đã tắt thành công. { -product-mozilla-accounts } sẽ không gửi dữ liệu kỹ thuật hoặc tương tác tới { -brand-mozilla }.
dc-opt-in-success-2 = Cảm ơn! Chia sẻ dữ liệu này sẽ giúp chúng tôi cải thiện { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = Xin lỗi, đã xảy ra sự cố khi thay đổi tùy chọn thu thập dữ liệu của bạn
dc-learn-more = Tìm hiểu thêm

# DropDownAvatarMenu component

drop-down-menu-title-2 = Menu { -product-mozilla-account }
# This is displayed in the Settings menu after user's click on their profile icon.
# Following this string on a new line will be their display name (user's name or email)
drop-down-menu-signed-in-as-v2 = Đã đăng nhập với tài khoản
drop-down-menu-sign-out = Đăng xuất
drop-down-menu-sign-out-error-2 = Xin lỗi, đã xảy ra sự cố khi đăng xuất cho bạn

## Flow Container

flow-container-back = Quay lại

## FlowRecoveryKeyConfirmPwd - Second view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen asks the user to confirm their password before generating a new key

flow-recovery-key-confirm-pwd-heading-v2 = Nhập lại mật khẩu của bạn vì lý do bảo mật
flow-recovery-key-confirm-pwd-input-label = Nhập mật khẩu của bạn
# Clicking on this button will check the password and create an account recovery key
flow-recovery-key-confirm-pwd-submit-button = Tạo khóa khôi phục tài khoản
# For users with an existing account recovery key, clicking on this button will
# check the password, delete the existing key and create a new account recovery key
flow-recovery-key-confirm-pwd-submit-button-change-key = Tạo khóa khôi phục tài khoản mới

## FlowRecoveryKeyDownload - Third view in the PageRecoveryKeyCreate flow
## Users see this view when they are generating a new account recovery key
## This screen displays the generated key and allows users to download or copy the key

flow-recovery-key-download-heading-v2 = Đã tạo khóa khôi phục tài khoản — Tải xuống và lưu trữ ngay bây giờ
# The "key" here refers to the term "account recovery key"
flow-recovery-key-download-info-v2 = Khóa này cho phép bạn khôi phục dữ liệu nếu bạn quên mật khẩu. Tải xuống ngay bây giờ và lưu trữ ở đâu đó bạn sẽ nhớ — bạn sẽ không thể quay lại trang này sau này.
# This link allows user to proceed to the next step without clicking the download button
flow-recovery-key-download-next-link-v2 = Tiếp tục mà không tải xuống

## FlowRecoveryKeyHint
## This is the fourth and final step in the account recovery key creation flow in account settings
## Prompts the user to save an (optional) storage hint about the location of their account recovery key.

# Success message displayed in alert bar after the user has finished creating an account recovery key.
flow-recovery-key-success-alert = Đã tạo khóa khôi phục tài khoản

## FlowRecoveryKeyInfo - First view in the PageRecoveryKeyCreate flow

# The header of the first view in the Recovery Key Create flow
flow-recovery-key-info-header = Tạo khóa khôi phục tài khoản trong trường hợp bạn quên mật khẩu
# The header of the first view in the Recovery Key Create flow when replacing an existing recovery key
flow-recovery-key-info-header-change-key = Thay đổi khóa khôi phục tài khoản của bạn
# In the first view of the PageRecoveryKeyCreate flow, this is the first of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-shield-bullet-point-v2 = Chúng tôi mã hóa dữ liệu duyệt web –– mật khẩu, dấu trang, v.v. Điều này rất tốt cho quyền riêng tư, nhưng bạn có thể mất dữ liệu nếu quên mật khẩu.
# In the first view of the PageRecoveryKeyCreate flow, this is the second of two bullet points explaining why the user should create an account recovery key
flow-recovery-key-info-key-bullet-point-v2 = Đó là lý do tại sao việc tạo khóa khôi phục tài khoản lại quan trọng đến vậy –– bạn có thể sử dụng nó để khôi phục dữ liệu của mình.
# The text of the "submit" button to start creating (or changing) an account recovery key
flow-recovery-key-info-cta-text-v3 = Bắt đầu
# Link to cancel account recovery key change and return to settings
flow-recovery-key-info-cancel-link = Hủy bỏ

## FlowSetup2faApp

flow-setup-2fa-qr-heading = Kết nối với ứng dụng xác thực của bạn
# DEV NOTE: "2a" in the id should be "2fa". This typo is kept intentionally to
# avoid losing existing translations; fix it when creating a new version of
# this string.
flow-setup-2a-qr-instruction = <strong>Bước 1:</strong> Quét mã QR này bằng bất kỳ ứng dụng xác thực nào, như Duo hoặc Google Authenticator.
# Alt text for the QR-code image shown during two-step authentication setup.
# “setup secret key” refers to the long code you can copy instead of scanning.
# Not to be confused with the 6-digit codes generated by the authenticator app.
flow-setup-2fa-qr-alt-text =
    .alt = Mã QR để thiết lập xác thực hai bước. Quét mã hoặc chọn “Không thể quét mã QR?” để xem khóa bí mật thiết lập thay thế.
flow-setup-2fa-cant-scan-qr-button = Không thể quét mã QR?
flow-setup-2fa-manual-key-heading = Nhập mã thủ công
flow-setup-2fa-manual-key-instruction = <strong>Bước 1:</strong> Nhập mã này vào ứng dụng xác thực mà bạn đang sử dụng.
flow-setup-2fa-scan-qr-instead-button = Thay vào đó, sử dụng quét mã QR?
# links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication#w_step-one
flow-setup-2fa-more-info-link = Tìm hiểu thêm về ứng dụng xác thực
flow-setup-2fa-button = Tiếp tục
flow-setup-2fa-step-2-instruction = <strong>Bước 2:</strong> Nhập mã từ ứng dụng xác thực của bạn.
flow-setup-2fa-input-label = Nhập mã gồm 6 chữ số
flow-setup-2fa-code-error = Mã không hợp lệ hoặc đã hết hạn. Hãy kiểm tra ứng dụng xác thực của bạn và thử lại.

## The step to choose the two step authentication method in the two step
## authentication setup flow.

flow-setup-2fa-backup-choice-heading = Chọn phương pháp khôi phục
flow-setup-2fa-backup-choice-description = Tính năng này cho phép bạn đăng nhập nếu bạn không thể truy cập thiết bị di động hoặc ứng dụng xác thực.
flow-setup-2fa-backup-choice-phone-title = Số điện thoại khôi phục
flow-setup-2fa-backup-choice-phone-badge = Dễ nhất
flow-setup-2fa-backup-choice-phone-info = Nhận mã khôi phục qua tin nhắn văn bản. Hiện tại chỉ có sẵn tại Hoa Kỳ và Canada.
flow-setup-2fa-backup-choice-code-title = Mã xác thực dự phòng
flow-setup-2fa-backup-choice-code-badge = An toàn nhất
flow-setup-2fa-backup-choice-code-info = Tạo và lưu mã xác thực sử dụng một lần.
# This link points to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
flow-setup-2fa-backup-choice-learn-more-link = Tìm hiểu về khôi phục và rủi ro hoán đổi SIM

## The backup code confirm step of the setup 2 factor authentication flow,
## where the user confirm that they have saved their backup authentication codes
## by entering one of them.

flow-setup-2fa-backup-code-confirm-heading = Nhập mã xác thực dự phòng
# codes here refers to backup authentication codes
flow-setup-2fa-backup-code-confirm-confirm-saved = Xác nhận bạn đã lưu mã của bạn bằng cách nhập một. Nếu không có các mã này, bạn có thể không đăng nhập nếu bạn không có ứng dụng xác thực của mình.
flow-setup-2fa-backup-code-confirm-code-input = Nhập mã gồm 10 ký tự
# Clicking on this button finishes the whole flow upon success.
flow-setup-2fa-backup-code-confirm-button-finish = Hoàn thành

## The backup codes download step of the setup 2 factor authentication flow

flow-setup-2fa-backup-code-dl-heading = Lưu mã xác thực dự phòng
flow-setup-2fa-backup-code-dl-save-these-codes = Hãy giữ chúng ở nơi bạn dễ nhớ. Nếu bạn không có quyền truy cập vào ứng dụng xác thực, bạn sẽ cần các mã đó để đăng nhập.
flow-setup-2fa-backup-code-dl-button-continue = Tiếp tục

##

flow-setup-2fa-inline-complete-success-banner = Đã bật xác thực hai bước
flow-setup-2fa-inline-complete-success-banner-description = Để bảo vệ tất cả các thiết bị được kết nối, bạn nên đăng xuất ở mọi nơi bạn sử dụng tài khoản này, sau đó đăng nhập lại bằng xác thực hai bước mới.
flow-setup-2fa-inline-complete-backup-code = Mã xác thực dự phòng
flow-setup-2fa-inline-complete-backup-phone = Số điện thoại khôi phục
# $count (Number) - an integer representing the number of backup
# authentication codes remaining
flow-setup-2fa-inline-complete-backup-code-info = { $count } mã còn lại
flow-setup-2fa-inline-complete-backup-code-description = Đây là phương pháp khôi phục an toàn nhất nếu bạn không thể đăng nhập bằng thiết bị di động hoặc ứng dụng xác thực.
flow-setup-2fa-inline-complete-backup-phone-description = Đây là phương pháp khôi phục dễ nhất nếu bạn không thể đăng nhập bằng ứng dụng xác thực.
flow-setup-2fa-inline-complete-learn-more-link = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn
# $serviceName (String) - the name of the product that the user will be
# redirected to.
flow-setup-2fa-inline-complete-continue-button = Tiếp tục đến { $serviceName }
flow-setup-2fa-prompt-heading = Thiết lập xác thực hai bước
# Variable { $serviceName } is the name of the product (e.g. Firefox Add-ons)
# that requests two-step authentication setup.
flow-setup-2fa-prompt-description = { $serviceName } yêu cầu bạn thiết lập xác thực hai bước để giữ an toàn cho tài khoản của bạn.
# "these authenticator apps" links to https://support.mozilla.org/kb/secure-firefox-account-two-step-authentication
flow-setup-2fa-prompt-use-authenticator-apps = Bạn có thể sử dụng bất kỳ <authenticationAppsLink>ứng dụng xác thực nào</authenticationAppsLink> để tiếp tục.
flow-setup-2fa-prompt-continue-button = Tiếp tục

## FlowSetupPhoneConfirmCode

# verification code refers to a code sent by text message to confirm phone number ownership
# and complete setup
flow-setup-phone-confirm-code-heading = Nhập mã xác minh
# $phoneNumber is a partially obfuscated phone number with only the last 4 digits showing (e.g., *** *** 1234)
# span element applies formatting to ensure the number is always displayed left-to-right
flow-setup-phone-confirm-code-instruction = Một mã gồm sáu chữ số đã được gửi đến <span>{ $phoneNumber }</span> bằng tin nhắn văn bản. Mã này hết hạn sau 5 phút.
flow-setup-phone-confirm-code-input-label = Nhập mã gồm 6 chữ số
flow-setup-phone-confirm-code-button = Xác nhận
# button to resend a code by text message to the user's phone
# followed by a button to resend a code
flow-setup-phone-confirm-code-expired = Mã đã hết hạn?
flow-setup-phone-confirm-code-resend-code-button = Gửi lại mã
flow-setup-phone-confirm-code-resend-code-success = Đã gửi mã
flow-setup-phone-confirm-code-success-message-v2 = Đã thêm số điện thoại khôi phục
flow-change-phone-confirm-code-success-message = Đã thay đổi số điện thoại khôi phục

## FlowSetupPhoneConfirmCode

flow-setup-phone-submit-number-heading = Xác minh số điện thoại của bạn
# The code is a 6-digit code send by text message/SMS
flow-setup-phone-verify-number-instruction = Bạn sẽ nhận được tin nhắn văn bản từ { -brand-mozilla } kèm theo mã để xác minh số của bạn. Không chia sẻ mã này với bất kỳ ai.
# The initial rollout of the recovery phone is only available to users with US and Canada mobile phone numbers.
# Voice over Internet Protocol (VoIP), is a technology that uses a broadband Internet connection instead of a regular (or analog) phone line to make calls.
# Phone mask services (for example Relay) provide a temporary virtual number to avoid providing a real phone number.
# Both VoIP and phone masks can be unreliable for one-time-passcode (OTP) verification
flow-setup-phone-submit-number-info-message-v2 = Số điện thoại khôi phục chỉ khả dụng ở Hoa Kỳ và Canada. Không khuyến khích số VoIP và số điện thoại ẩn danh.
flow-setup-phone-submit-number-legal = Bằng cách cung cấp số của bạn, bạn đồng ý cho chúng tôi lưu trữ số đó để chúng tôi có thể nhắn tin cho bạn chỉ để xác minh tài khoản. Tốc độ tin nhắn và dữ liệu có thể được áp dụng.
# cliking on the button sends a code by text message to the phone number typed in by the user
flow-setup-phone-submit-number-button = Gửi mã

## HeaderLockup component, the header in account settings

header-menu-open = Đóng menu
header-menu-closed = Menu dẫn hướng trang mạng
header-back-to-top-link =
    .title = Về đầu trang
header-back-to-settings-link =
    .title = Quay lại cài đặt { -product-mozilla-account }
header-title-2 = { -product-mozilla-account }
header-help = Trợ giúp

## Linked Accounts section

la-heading = Tài khoản được liên kết
la-description = Bạn có quyền truy cập vào các tài khoản sau.
la-unlink-button = Hủy liên kết
la-unlink-account-button = Hủy liên kết
la-set-password-button = Đặt mật khẩu
la-unlink-heading = Hủy liên kết khỏi tài khoản của bên thứ ba
la-unlink-content-3 = Bạn có chắc chắn muốn hủy liên kết tài khoản của mình không? Việc hủy liên kết tài khoản của bạn không tự động đăng xuất bạn khỏi dịch vụ được kết nối của bạn. Để làm điều đó, bạn sẽ cần đăng xuất theo cách thủ công từ phần dịch vụ được kết nối.
la-unlink-content-4 = Trước khi hủy liên kết tài khoản của bạn, bạn sẽ phải đặt mật khẩu. Nếu không có mật khẩu, bạn sẽ không thể đăng nhập sau khi hủy liên kết tài khoản của mình.
nav-linked-accounts = { la-heading }

## Modal - Default values for a message directed at the user where the user can typically Confirm or Cancel.

modal-close-title = Đóng
modal-cancel-button = Huỷ bỏ
modal-default-confirm-button = Xác nhận

## ModalMfaProtected

modal-mfa-protected-title = Nhập mã xác nhận
modal-mfa-protected-subtitle = Hãy giúp chúng tôi đảm bảo rằng bạn là người thay đổi thông tin tài khoản của mình
# This string is used to show a notification to the user for them to enter
# email confirmation code to update their multi-factor-authentication-protected
# account settings
# Variables:
#   email (String) - the user's email
#   expirationTime (Number) - the expiration time in minutes
modal-mfa-protected-instruction = Nhập mã đã được gửi tới <email>{ $email }</email> trong vòng { $expirationTime } phút.
modal-mfa-protected-input-label = Nhập mã gồm 6 chữ số
modal-mfa-protected-cancel-button = Hủy bỏ
modal-mfa-protected-confirm-button = Xác nhận
modal-mfa-protected-code-expired = Mã đã hết hạn?
# Link to resend a new code to the user's email.
modal-mfa-protected-resend-code-link = Gửi mã mới qua email.

## Modal Verify Session

mvs-verify-your-email-2 = Xác minh email của bạn
mvs-enter-verification-code-2 = Nhập mã xác minh của bạn
# This string is used to show a notification to the user for them to enter confirmation code to confirm their email.
# Variables:
#   email (String) - the user's email
mvs-enter-verification-code-desc-2 = Vui lòng nhập mã xác minh đã được gửi đến <email>{ $email }</email> trong vòng 5 phút.
msv-cancel-button = Hủy bỏ
msv-submit-button-2 = Xác nhận

## Settings Nav

nav-settings = Cài đặt
nav-profile = Hồ sơ
nav-security = Bảo mật
nav-connected-services = Dịch vụ đã kết nối
nav-data-collection = Thu thập và sử dụng dữ liệu
nav-paid-subs = Thuê bao đã trả phí
nav-email-comm = Truyền thông email

## Page2faChange

page-2fa-change-title = Thay đổi xác thực hai bước
page-2fa-change-success = Xác thực hai bước đã được cập nhật
page-2fa-change-success-additional-message = Để bảo vệ tất cả các thiết bị được kết nối, bạn nên đăng xuất ở mọi nơi bạn sử dụng tài khoản này, sau đó đăng nhập lại bằng xác thực hai bước mới.
page-2fa-change-totpinfo-error = Đã xảy ra lỗi khi thay thế ứng dụng xác thực hai bước của bạn. Vui lòng thử lại sau.
page-2fa-change-qr-instruction = <strong>Bước 1:</strong> Quét mã QR này bằng bất kỳ ứng dụng xác thực nào, chẳng hạn như Duo hoặc Google Authenticator. Thao tác này sẽ tạo một kết nối mới, mọi kết nối cũ sẽ không còn hoạt động.

## Two Step Authentication - replace backup authentication code

# Page title
tfa-backup-codes-page-title = Mã xác thực dự phòng
# Error shown when API call fails while replacing existing backup codes
tfa-replace-code-error-3 = Đã xảy ra sự cố khi thay thế mã xác thực dự phòng của bạn
# Error shown when API call fails while creating new backup codes (user had none)
tfa-create-code-error = Đã xảy ra sự cố khi tạo mã xác thực dự phòng của bạn
# Success message shown in alert bar after successfully replacing existing backup codes
tfa-replace-code-success-alert-4 = Đã cập nhật mã xác thực dự phòng
# Success message shown after creating backup codes for the first time
tfa-create-code-success-alert = Đã tạo mã xác thực dự phòng
# Custom messaging for users replacing existing backup codes - Download step (1 of 2)
# On this step, the codes are not yet replaced in the database - the old codes are still valid until step 2 is completed.
tfa-replace-code-download-description = Hãy giữ chúng ở nơi bạn dễ nhớ. Mã cũ sẽ được thay thế sau khi bạn hoàn tất bước tiếp theo.
# Custom messaging for users replacing existing backup codes - Confirm step (2 of 2)
# Until this confirmation step is successfully completed, the old codes are still active and the new codes are not saved in the database.
tfa-replace-code-confirm-description = Xác nhận bạn đã lưu mã bằng cách nhập một mã. Mã xác thực dự phòng cũ của bạn sẽ bị vô hiệu hóa sau khi hoàn tất bước này.
# Error shown when the entered backup code does not match any of the generated codes
tfa-incorrect-recovery-code-1 = Mã xác thực dự phòng không chính xác

## Page2faSetup

page-2fa-setup-title = Xác thực hai bước
page-2fa-setup-totpinfo-error = Đã xảy ra lỗi khi thiết lập xác thực hai bước. Hãy thử lại sau.
# code here refers to "backup authentication code"
page-2fa-setup-incorrect-backup-code-error = Mã đó không đúng. Hãy thử lại.
page-2fa-setup-success = Xác thực hai bước đã được bật
page-2fa-setup-success-additional-message = Để bảo vệ tất cả các thiết bị được kết nối, bạn nên đăng xuất ở mọi nơi bạn sử dụng tài khoản này, sau đó đăng nhập lại bằng xác thực hai bước.

## Avatar change page

avatar-page-title =
    .title = Hình ảnh hồ sơ
avatar-page-add-photo = Thêm ảnh
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = Chụp hình
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = Xóa ảnh
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = Chụp hình lại
avatar-page-cancel-button = Hủy bỏ
avatar-page-save-button = Lưu
avatar-page-saving-button = Đang lưu…
avatar-page-zoom-out-button =
    .title = Thu nhỏ
avatar-page-zoom-in-button =
    .title = Phóng to
avatar-page-rotate-button =
    .title = Xoay
avatar-page-camera-error = Không thể khởi tạo máy ảnh
avatar-page-new-avatar =
    .alt = hình hồ sơ mới
avatar-page-file-upload-error-3 = Đã xảy ra sự cố khi tải lên ảnh hồ sơ của bạn
avatar-page-delete-error-3 = Đã xảy ra sự cố khi xóa ảnh hồ sơ của bạn
avatar-page-image-too-large-error-2 = Không thể tải lên ảnh có kích thước tập tin quá lớn

## Password change page

pw-change-header =
    .title = Thay đổi mật khẩu
pw-8-chars = Ít nhất 8 ký tự
pw-not-email = Không phải địa chỉ email của bạn
pw-change-must-match = Mật khẩu mới khớp với xác nhận mật khẩu
pw-commonly-used = Không phải mật khẩu thường được sử dụng
# linkExternal is a link to a mozilla.org support article on password strength
pw-tips = Giữ an toàn — không sử dụng lại mật khẩu. Xem thêm các mẹo để <linkExternal>tạo mật khẩu mạnh</linkExternal>.
pw-change-cancel-button = Huỷ bỏ
pw-change-save-button = Lưu
pw-change-forgot-password-link = Quên mật khẩu?
pw-change-current-password =
    .label = Nhập mật khẩu hiện tại:
pw-change-new-password =
    .label = Nhập mật khẩu mới:
pw-change-confirm-password =
    .label = Xác nhận mật khẩu mới
pw-change-success-alert-2 = Đã cập nhật mật khẩu

## Password create page

pw-create-header =
    .title = Tạo mật khẩu
pw-create-success-alert-2 = Đã đặt mật khẩu
pw-create-error-2 = Xin lỗi, đã xảy ra sự cố khi đặt mật khẩu của bạn

## Delete account page

delete-account-header =
    .title = Xóa tài khoản
delete-account-step-1-2 = Bước 1/2
delete-account-step-2-2 = Bước 2/2
delete-account-confirm-title-4 = Bạn có thể đã kết nối { -product-mozilla-account } của mình với một hoặc nhiều sản phẩm hoặc dịch vụ { -brand-mozilla } sau đây để giúp bạn an toàn và làm việc hiệu quả trên web:
delete-account-product-mozilla-account = { -product-mozilla-account }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = Đang đồng bộ hóa dữ liệu { -brand-firefox }
delete-account-product-firefox-addons = Tiện ích { -brand-firefox }
delete-account-acknowledge = Vui lòng xác nhận nếu bạn thực sự muốn xóa tài khoản của mình:
delete-account-chk-box-1-v4 =
    .label = Mọi gói đăng ký trả phí bạn có sẽ bị hủy
delete-account-chk-box-2 =
    .label = Bạn có thể sẽ mất thông tin và tính năng đã lưu trong các sản phẩm của { -brand-mozilla }
delete-account-chk-box-3 =
    .label = Kích hoạt lại với email này có thể không khôi phục thông tin đã lưu của bạn
delete-account-chk-box-4 =
    .label = Mọi tiện ích mở rộng và chủ đề mà bạn đã xuất bản lên addons.mozilla.org sẽ bị xóa
delete-account-continue-button = Tiếp tục
delete-account-password-input =
    .label = Nhập mật khẩu
delete-account-cancel-button = Hủy bỏ
delete-account-delete-button-2 = Xóa

## Display name page

display-name-page-title =
    .title = Tên hiển thị
display-name-input =
    .label = Nhập tên hiển thị
submit-display-name = Lưu
cancel-display-name = Huỷ bỏ
display-name-update-error-2 = Đã xảy ra sự cố trong khi cập nhật tên hiển thị của bạn
display-name-success-alert-2 = Đã cập nhật tên hiển thị

## Recent account activity
## All strings except title indicate an event that occurred from the user's account
## These are displayed as a list with the date when the event occured

recent-activity-title = Hoạt động tài khoản gần đây
recent-activity-account-create-v2 = Đã tạo tài khoản
recent-activity-account-disable-v2 = Tài khoản đã bị vô hiệu hóa
recent-activity-account-enable-v2 = Đã kích hoạt tài khoản
recent-activity-account-login-v2 = Đã bắt đầu đăng nhập tài khoản
recent-activity-account-reset-v2 = Đã bắt đầu đặt lại mật khẩu
# This string appears under recent account activity when there were email bounces associated with the account, but those were recently cleared (i.e. removed/deleted).
# An email bounce is when an email is sent to an email address and fails/receives a non-delivery receipt from the recipient's mail server.
recent-activity-emails-clearBounces-v2 = Đã xóa email bị trả lại
recent-activity-account-login-failure = Nỗ lực đăng nhập không thành công
recent-activity-account-two-factor-added = Đã bật xác thực hai bước
recent-activity-account-two-factor-requested = Đã yêu cầu xác thực hai bước
recent-activity-account-two-factor-failure = Xác thực hai bước không thành công
recent-activity-account-two-factor-success = Xác thực hai bước thành công
recent-activity-account-two-factor-removed = Đã xóa xác thực hai bước
recent-activity-account-password-reset-requested = Đã yêu cầu đặt lại mật khẩu tài khoản
recent-activity-account-password-reset-success = Đặt lại mật khẩu tài khoản thành công
recent-activity-account-recovery-key-added = Đã bật khóa khôi phục tài khoản
recent-activity-account-recovery-key-verification-failure = Xác minh khóa khôi phục tài khoản không thành công
recent-activity-account-recovery-key-verification-success = Xác minh khóa khôi phục tài khoản thành công
recent-activity-account-recovery-key-removed = Đã xóa khóa khôi phục tài khoản
recent-activity-account-password-added = Đã thêm mật khẩu mới
recent-activity-account-password-changed = Đã thay đổi mật khẩu
recent-activity-account-secondary-email-added = Đã thêm địa chỉ email phụ
recent-activity-account-secondary-email-removed = Đã xóa địa chỉ email phụ
recent-activity-account-emails-swapped = Đã hoán đổi giữa địa chỉ email chính và địa chỉ email phụ
recent-activity-session-destroy = Đã đăng xuất khỏi phiên
recent-activity-account-recovery-phone-send-code = Mã đã được gửi đến số điện thoại khôi phục
recent-activity-account-recovery-phone-setup-complete = Đã hoàn tất thiết lập số điện thoại khôi phục
recent-activity-account-recovery-phone-signin-complete = Đã hoàn tất đăng nhập với số điện thoại khôi phục
recent-activity-account-recovery-phone-signin-failed = Đăng nhập với số điện thoại khôi phục không thành công
recent-activity-account-recovery-phone-removed = Đã xóa số điện thoại khôi phục
recent-activity-account-recovery-codes-replaced = Đã thay thế mã khôi phục
recent-activity-account-recovery-codes-created = Đã tạo mã khôi phục
recent-activity-account-recovery-codes-signin-complete = Đã hoàn tất đăng nhập với mã khôi phục
recent-activity-password-reset-otp-sent = Đã gửi mã xác minh để đặt lại mật khẩu
recent-activity-password-reset-otp-verified = Đã xác minh mã để đặt lại mật khẩu
recent-activity-must-reset-password = Yêu cầu đặt lại mật khẩu
# Security event was recorded, but the activity details are unknown or not shown to user
recent-activity-unknown = Hoạt động tài khoản khác

## PageRecoveryKeyCreate

# The page title displayed at the top of the flow container
recovery-key-create-page-title = Khóa khôi phục tài khoản
# Tooltip text and aria label for back arrow that takes users out of the account recovery key generation flow
# and back to account settings
recovery-key-create-back-button-title = Quay lại cài đặt

## PageRecoveryPhoneRemove
## Users reach this page from account settings when they want to remove a backup phone number.

recovery-phone-remove-header = Xóa số điện thoại khôi phục
# Variables:
#   $formattedFullPhoneNumber (String) - the user's full phone number
settings-recovery-phone-remove-info = Điều này sẽ xoá <strong>{ $formattedFullPhoneNumber }</strong> khỏi số điện thoại khôi phục của bạn.
settings-recovery-phone-remove-recommend = Chúng tôi khuyên bạn nên giữ lại phương pháp này vì nó dễ dàng hơn việc lưu mã xác thực dự phòng.
# "Saved backup authentication codes" refers to previously saved backup authentication codes
settings-recovery-phone-remove-recovery-methods = Nếu bạn xóa nó, hãy đảm bảo rằng bạn vẫn còn mã xác thực dự phòng đã lưu. <linkExternal>So sánh các phương pháp phục hồi</linkExternal>
settings-recovery-phone-remove-button = Xoá số điện thoại
settings-recovery-phone-remove-cancel = Hủy bỏ
settings-recovery-phone-remove-success = Đã xóa số điện thoại khôi phục

## PageSetupRecoveryPhone

page-setup-recovery-phone-heading = Thêm số điện thoại khôi phục
page-change-recovery-phone = Thay đổi số điện thoại khôi phục
page-setup-recovery-phone-back-button-title = Quay lại cài đặt
# Back arrow to return to step 1 of recovery phone setup flow
page-setup-recovery-phone-step2-back-button-title = Thay đổi số điện thoại

## Add secondary email page

add-secondary-email-step-1 = Bước 1/2
add-secondary-email-error-2 = Đã xảy ra sự cố khi tạo email này
add-secondary-email-page-title =
    .title = Email phụ
add-secondary-email-enter-address =
    .label = Nhập địa chỉ email
add-secondary-email-cancel-button = Hủy bỏ
add-secondary-email-save-button = Lưu
# This message is shown when a user tries to add a secondary email that is a
# Firefox Relay email mask (generated email address that can be used in place of
# your real email address)
add-secondary-email-mask = Không thể sử dụng email ẩn danh làm email phụ

## Verify secondary email page

add-secondary-email-step-2 = Bước 2/2
verify-secondary-email-page-title =
    .title = Email phụ
verify-secondary-email-verification-code-2 =
    .label = Nhập mã xác minh của bạn
verify-secondary-email-cancel-button = Huỷ bỏ
verify-secondary-email-verify-button-2 = Xác nhận
# This string is an instruction in a form.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-please-enter-code-2 = Vui lòng nhập mã xác minh đã được gửi tới <strong>{ $email }</strong> trong vòng 5 phút.
# This string is a confirmation message shown after verifying an email.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
verify-secondary-email-success-alert-2 = Đã thêm { $email } thành công
verify-secondary-email-resend-code-button = Gửi lại mã xác nhận

##

# Link to delete account on main Settings page
delete-account-link = Xóa tài khoản
# Success message displayed in alert bar after the user has successfully confirmed their account is not inactive.
inactive-update-status-success-alert = Đã đăng nhập thành công. { -product-mozilla-account } và dữ liệu của bạn sẽ duy trì hoạt động.

## Product promotion

product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-description-v2 = Tìm nơi thông tin cá nhân của bạn bị lộ và kiểm soát chúng
# Links out to the Monitor site
product-promo-monitor-cta = Quét miễn phí

## Profile section

profile-heading = Hồ sơ
profile-picture =
    .header = Hình ảnh
profile-display-name =
    .header = Tên hiển thị
profile-primary-email =
    .header = Email chính

## Progress bar

# This is the aria-label text for the progress bar. The progress bar is meant to visually show the user how much progress they have made through the steps of a given flow.
# Variables:
#   $currentStep (number) - the step which the user is currently on
#   $numberOfSteps (number) - the total number of steps in a given flow
progress-bar-aria-label-v2 = Bước { $currentStep }/{ $numberOfSteps }.

## Security section of Setting

security-heading = Bảo mật
security-password =
    .header = Mật khẩu
# This is a string that shows when the user's password was created.
# Variables:
#   $date (String) - a localized date and time string
security-password-created-date = Đã tạo { $date }
security-not-set = Chưa đặt
security-action-create = Tạo
security-set-password = Đặt mật khẩu để đồng bộ hóa và sử dụng các tính năng bảo mật tài khoản nhất định.
# Link opens a list of recent account activity (e.g., login attempts, password changes, etc.)
security-recent-activity-link = Xem hoạt động tài khoản gần đây
signout-sync-header = Phiên đã hết hạn
signout-sync-session-expired = Xin lỗi, đã có lỗi xảy ra. Vui lòng đăng xuất từ menu trình duyệt và thử lại.

## SubRow component

tfa-row-backup-codes-title = Mã xác thực dự phòng
# Only shown for users that have 2FA enabled and verified, but all backup authentication codes have been consumed
# Users that have not enabled or verified 2FA will not see this
tfa-row-backup-codes-not-available = Không còn mã nào khả dụng
# $numCodesRemaining - the number of backup authentication codes that have not yet been used (generally between 1 to 5)
# A different message is shown when no codes are available
tfa-row-backup-codes-available-v2 = { $numCodesAvailable } mã còn lại
# Shown to users who have backup authentication codes - this will allow them to generate new codes to replace the previous ones
tfa-row-backup-codes-get-new-cta-v2 = Tạo mã mới
# Shown to users who have no backup authentication codes
# Button to add backup authentication codes when none are configured
tfa-row-backup-codes-add-cta = Thêm
# 'This' refers to 'backup authentication codes', used as a recovery method for two-step authentication
tfa-row-backup-codes-description-2 = Đây là phương pháp khôi phục an toàn nhất nếu bạn không thể sử dụng thiết bị di động hoặc ứng dụng xác thực của mình.
# Recovery phone is a recovery method for two-step authentication
# A recovery code can be sent to the user's phone
tfa-row-backup-phone-title-v2 = Số điện thoại khôi phục
# Shown with an alert icon to indicate that no recovery phone is configured
tfa-row-backup-phone-not-available-v2 = Không có số điện thoại được thêm vào
# button to change the configured recovery phone
tfa-row-backup-phone-change-cta = Thay đổi
# button to add/configure a recovery phone
tfa-row-backup-phone-add-cta = Thêm
# Button to remove a recovery phone from the user's account
tfa-row-backup-phone-delete-button = Xóa
# Shown in tooltip on delete button or delete icon
tfa-row-backup-phone-delete-title-v2 = Xoá số điện thoại khôi phục
tfa-row-backup-phone-delete-restriction-v2 = Nếu bạn muốn xóa số điện thoại khôi phục của mình, hãy thêm mã xác thực dự phòng hoặc tắt xác thực hai bước trước để tránh bị khóa tài khoản.
# "this" refers to recovery phone
tfa-row-backup-phone-description-v2 = Đây là phương pháp khôi phục dễ dàng nhất nếu bạn không thể sử dụng ứng dụng xác thực của mình.
# A SIM swap attack is a type of identity theft where an attacker tricks or bribes a mobile carrier
# into transferring a victim's phone number to their own SIM card, enabling access to accounts secured
# with SMS-based two-factor authentication.
tfa-row-backup-phone-sim-swap-risk-link = Tìm hiểu về rủi ro hoán đổi SIM

## Switch component

# Used as "title" attribute when the switch is "on" and interaction turns the switch to "off"
switch-turn-off = Tắt
# Used as "title" attribute when the switch is "off" and interaction turns the switch to "on"
switch-turn-on = Bật
# Used as "title" attribute when switch has been interacted with and form is submitting
switch-submitting = Đang gửi…
switch-is-on = bật
switch-is-off = tắt

## Sub-section row Defaults

row-defaults-action-add = Thêm
row-defaults-action-change = Thay đổi
row-defaults-action-disable = Vô hiệu hóa
row-defaults-status = Không có

## Account recovery key sub-section on main Settings page

rk-header-1 = Khóa khôi phục tài khoản
rk-enabled = Đã bật
rk-not-set = Chưa tạo
rk-action-create = Tạo
# Button to delete the existing account recovery key and create a new one
rk-action-change-button = Thay đổi
rk-action-remove = Xóa
rk-key-removed-2 = Đã xóa khóa khôi phục tài khoản
rk-cannot-remove-key = Không thể xóa khóa khôi phục tài khoản của bạn.
rk-refresh-key-1 = Làm mới khóa khôi phục tài khoản
rk-content-explain = Khôi phục thông tin của bạn khi bạn quên mật khẩu.
rk-cannot-verify-session-4 = Xin lỗi, đã xảy ra sự cố khi xác minh phiên của bạn
rk-remove-modal-heading-1 = Xóa khóa khôi phục tài khoản?
rk-remove-modal-content-1 =
    Trong trường hợp bạn đặt lại mật khẩu của mình, bạn sẽ không
    có thể sử dụng khóa khôi phục tài khoản để truy cập dữ liệu của bạn. Bạn không thể hoàn tác hành động này.
rk-remove-error-2 = Không thể xóa khóa khôi phục của tài khoản của bạn
# Icon button to delete user's account recovery key. Text appears in tooltip on hover and as alt text for screen readers.
unit-row-recovery-key-delete-icon-button-title = Xóa khóa khôi phục tài khoản

## Secondary email sub-section on main Settings page

se-heading = Email phụ
    .header = Email phụ
se-cannot-refresh-email = Xin lỗi, đã xảy ra sự cố khi làm mới email đó.
se-cannot-resend-code-3 = Xin lỗi, đã xảy ra sự cố khi gửi lại mã xác minh
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-set-primary-successful-2 = { $email } hiện là email chính của bạn
se-set-primary-error-2 = Xin lỗi, đã có sự cố khi đang thay đổi email chính của bạn
# This string is used in a notification message near the top of the page.
# Variables:
#   $email (String) - the user's email address, which does not need translation.
se-delete-email-successful-2 = Đã xóa thành công { $email }
se-delete-email-error-2 = Xin lỗi, đã xảy ra sự cố khi xóa email này
se-verify-session-3 = Bạn cần xác minh phiên hiện tại của mình để thực hiện hành động này
se-verify-session-error-3 = Xin lỗi, đã xảy ra sự cố khi xác minh phiên của bạn
# Button to remove the secondary email
se-remove-email =
    .title = Xóa email
# Button to refresh secondary email status
se-refresh-email =
    .title = Làm mới email
se-unverified-2 = chưa xác minh
se-resend-code-2 =
    Cần xác minh. <button>Gửi lại mã xác minh</button>
    nếu nó không có trong hộp thư đến hoặc thư mục spam của bạn.
# Button to make secondary email the primary
se-make-primary = Đặt làm email chính
se-default-content = Truy cập tài khoản của bạn nếu bạn không thể đăng nhập vào email chính của mình.
se-content-note-1 =
    Lưu ý: email phụ sẽ không khôi phục thông tin của bạn — bạn sẽ
    cần có <a>khóa khôi phục tài khoản</a> cho việc đó.
# Default value for the secondary email
se-secondary-email-none = Không có

## Two Step Auth sub-section on Settings main page

tfa-row-header = Xác thực hai bước
tfa-row-enabled = Đã bật
tfa-row-disabled-status = Đã tắt
tfa-row-action-add = Thêm
tfa-row-action-disable = Vô hiệu hóa
tfa-row-action-change = Thay đổi
tfa-row-button-refresh =
    .title = Làm mới xác thực hai bước
tfa-row-cannot-refresh = Xin lỗi, đã xảy ra sự cố khi làm mới xác thực hai bước.
tfa-row-enabled-description = Tài khoản của bạn được bảo vệ bằng xác thực hai bước. Bạn sẽ cần nhập mật mã một lần từ ứng dụng xác thực của mình khi đăng nhập vào { -product-mozilla-account } của bạn.
# "this" refers to two-step authentication
# Link goes to https://support.mozilla.org/kb/secure-mozilla-account-two-step-authentication
tfa-row-enabled-info-link = Tìm hiểu cách mà nó bảo vệ tài khoản của bạn
tfa-row-disabled-description-v2 = Giúp bảo mật tài khoản của bạn bằng cách sử dụng ứng dụng xác thực của bên thứ ba làm bước thứ hai để đăng nhập.
tfa-row-cannot-verify-session-4 = Xin lỗi, đã xảy ra sự cố khi xác minh phiên của bạn
tfa-row-disable-modal-heading = Tắt xác thực hai bước?
tfa-row-disable-modal-confirm = Tắt
tfa-row-disable-modal-explain-1 =
    Bạn sẽ không thể hoàn tác hành động này. Bạn cũng
    có tùy chọn <linkExternal>thay thế mã xác thực dự phòng của bạn</linkExternal>.
# Shown in an alert bar after two-step authentication is disabled
tfa-row-disabled-2 = Đã tắt xác thực hai bước
tfa-row-cannot-disable-2 = Không thể tắt xác thực hai bước
tfa-row-verify-session-info = Bạn cần xác nhận phiên hiện tại của mình để thiết lập xác thực hai bước

## TermsPrivacyAgreement
## These terms are used in signin and signup for Firefox account

# This message is followed by a bulleted list
terms-privacy-agreement-intro-2 = Bằng cách tiếp tục, bạn đồng ý với:
# link to Monitor's Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-monitor-3 = <mozSubscriptionTosLink>Điều khoản dịch vụ</mozSubscriptionTosLink> và <mozSubscriptionPrivacyLink>thông báo về quyền riêng tư</mozSubscriptionPrivacyLink> của Dịch vụ thuê bao { -brand-mozilla }
# links to Mozilla Accounts Terms of Service and Privacy Notice, part of a bulleted list
terms-privacy-agreement-mozilla = <mozillaAccountsTos>Điều khoản dịch vụ</mozillaAccountsTos> và <mozillaAccountsPrivacy>thông báo về quyền riêng tư</mozillaAccountsPrivacy> của { -product-mozilla-accounts(capitalization: "uppercase") }
# links to Mozilla Account's Terms of Service and Privacy Notice
terms-privacy-agreement-default-2 = Bằng cách tiếp tục, bạn đồng ý với <mozillaAccountsTos>điều khoản dịch vụ</mozillaAccountsTos> và <mozillaAccountsPrivacy>thông báo về quyền riêng tư</mozillaAccountsPrivacy>.

## ThirdPartyAuth component
## This is a component that is used to display a list of third party providers (Apple, Google, etc.)

# This appears when a user has the option to authenticate via third party accounts in addition to their Firefox account.
# Firefox account login appears on top, and third party options appear on bottom.
# This string appears as a separation between the two, in the following order: "Enter your password" "Or"(this string) (continue-with-google-button with aria equivalent text) / (continue-with-apple-button with aria equivalent text)
third-party-auth-options-or = Hoặc
# For the sign-in page, when 3rd-party auth is the only option, this string appears with a divider line between the user's avatar on top and 3rd-party authentication buttons (continue-with-google continue-with-apple buttons) on bottom.
# This could also be translated as "Sign in with the following" or "Sign in with the below".
third-party-auth-options-sign-in-with = Đăng nhập bằng
continue-with-google-button = Tiếp tục với { -brand-google }
continue-with-apple-button = Tiếp tục với { -brand-apple }

## Auth-server based errors that originate from backend service

auth-error-102 = Tài khoản không xác định
auth-error-103 = Mật khẩu không đúng
auth-error-105-2 = Mã xác minh không hợp lệ
auth-error-110 = Mã không hợp lệ
# Error shown to users when they have attempted a request (e.g., requesting a password reset) too many times
# and their requests have been throttled, but the specific amount of time before they can retry is unknown.
auth-error-114-generic = Bạn đã thử quá nhiều lần. Hãy thử lại sau.
# This string is the amount of time required before a user can attempt another request.
# Variables:
#   $retryAfter (String) - Time required before retrying a request. The variable is localized by our
#                          formatting library (momentjs) as a "time from now" and automatically includes
#                          the prefix as required by the current locale (for example, "in 15 minutes", "dans 15 minutes").
auth-error-114 = Bạn đã thử quá nhiều lần. Vui lòng thử lại { $retryAfter }.
auth-error-125 = Yêu cầu đã bị chặn vì lý do bảo mật
auth-error-129-2 = Bạn đã nhập số điện thoại không hợp lệ. Vui lòng kiểm tra và thử lại.
auth-error-138-2 = Phiên chưa được xác minh
auth-error-139 = Email phụ phải khác với email chính của bạn
# (Email) address has been added as a secondary email for another account and cannot be used to register a new account.
# The reservation may be temporary. If the reservation is not confirmed before the reservation expires (~10 min), the email will become available again.
auth-error-144 = Email này đã tạm thời được sử dụng cho một tài khoản khác. Vui lòng thử lại sau hoặc sử dụng địa chỉ email khác.
auth-error-155 = Không tìm thấy token TOTP
# Error shown when the user submits an invalid backup authentication code
auth-error-156 = Không tìm thấy mã xác thực dự phòng
auth-error-159 = Khóa khôi phục tài khoản không hợp lệ
auth-error-183-2 = Mã xác minh không hợp lệ hoặc đã hết hạn
auth-error-202 = Tính năng không được bật
auth-error-203 = Hệ thống không khả dụng, hãy thử lại sau
auth-error-206 = Không tạo được mật khẩu, mật khẩu đã được đặt trước đó
auth-error-214 = Số điện thoại khôi phục đã tồn tại
auth-error-215 = Số điện thoại khôi phục không tồn tại
auth-error-216 = Đã đạt giới hạn gửi tin nhắn văn bản
auth-error-218 = Không thể xóa số điện thoại khôi phục, chưa có mã xác thực dự phòng.
auth-error-219 = Số điện thoại này đã được đăng ký cho quá nhiều tài khoản. Vui lòng thử số khác.
auth-error-999 = Lỗi không xác định
auth-error-1001 = Đã hủy đăng nhập
auth-error-1002 = Phiên đã hết hạn. Đăng nhập để tiếp tục.
auth-error-1003 = Bộ nhớ cục bộ hoặc cookie vẫn bị tắt
auth-error-1008 = Mật khẩu mới của bạn phải khác
auth-error-1010 = Yêu cầu mật khẩu hợp lệ
auth-error-1011 = Yêu cầu email hợp lệ
auth-error-1018 = Email xác minh của bạn vừa được trả lại. Bạn đã nhập sai địa chỉ email?
auth-error-1020 = Bạn đã nhập sai email? firefox.com không phải là dịch vụ email hợp lệ
auth-error-1031 = Bạn phải nhập tuổi của bạn để đăng ký
auth-error-1032 = Bạn phải nhập tuổi hợp lệ để đăng ký
auth-error-1054 = Mã xác thực hai bước không hợp lệ
auth-error-1056 = Mã xác thực dự phòng không hợp lệ
auth-error-1062 = Chuyển hướng không hợp lệ
# Shown when a user tries to sign up with an email address with a domain that doesn't receive emails
auth-error-1064 = Bạn đã nhập sai email? { $domain } không phải là dịch vụ email hợp lệ
auth-error-1066 = Không thể sử dụng email ẩn danh để tạo tài khoản.
auth-error-1067 = Nhập sai email?
# Displayed when we want to reference a user's previously set up recovery phone
# number, but they are not completely signed in yet. We'll only show the last 4 digits.
# Variables:
#  $lastFourPhoneNumber (Number) - The last 4 digits of the user's recovery phone number
recovery-phone-number-ending-digits = Số kết thúc bằng { $lastFourPhoneNumber }
oauth-error-1000 = Đã xảy ra lỗi. Vui lòng đóng thẻ này và thử lại.

## Connect Another Device page

# A user will only see this header if they are signed in. The header will be preceded by a green checkmark (rtl/ltr sensitive)
connect-another-device-signed-in-header = Bạn đã đăng nhập vào { -brand-firefox }
# A "success" message visible to users who verified via email
connect-another-device-email-confirmed-banner = Đã xác minh email
# A "success" message visible to users who verified via sign-in
connect-another-device-signin-confirmed-banner = Đã xác nhận đăng nhập
# A message prompts the user to sign in to this instance of the Firefox browser so as to complete device sync. This is followed by a link labeled "Sign in"
connect-another-device-signin-to-complete-message = Đăng nhập vào { -brand-firefox } này để hoàn tất thiết lập
# A link for the user to sign in to the current Firefox browser, preceded by a message prompting the user to sign in so as to complete the device sync setup
connect-another-device-signin-link = Đăng nhập
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-still-adding-devices-message = Vẫn đang thêm thiết bị? Đăng nhập vào { -brand-firefox } trên một thiết bị khác để hoàn tất thiết lập
# A message prompting the user to sign in via a different device than the current one so as to complete the device-syncing process
connect-another-device-signin-another-device-to-complete-message = Đăng nhập vào { -brand-firefox } trên một thiết bị khác để hoàn tất thiết lập
# This message is a value-proposition prompting the user to sync another device so as to get tabs, bookmarks, and passwords shared between devices
connect-another-device-get-data-on-another-device-message = Bạn muốn nhận các thẻ, dấu trang và mật khẩu của mình trên một thiết bị khác?
# This link leads the user back to the `/pair` page so as to connect another device
connect-another-device-cad-link = Kết nối thiết bị khác
# This link cancels the process of connecting another device, and takes the user back to Account Settings
connect-another-device-not-now-link = Không phải bây giờ
# This is a message for Firefox Android users, prompting them to complete the process of connecting another device by signing into Firefox for Android
connect-another-device-android-complete-setup-message = Đăng nhập vào { -brand-firefox } dành cho Android để hoàn tất thiết lập
# This is a message for Firefox iOS users, prompting them to complete the process of connecting another device by signing into Firefox for iOS
connect-another-device-ios-complete-setup-message = Đăng nhập vào { -brand-firefox } dành cho iOS để hoàn tất thiết lập

## Cookies disabled page
## Users will see this page if they have local storage or cookies disabled.

cookies-disabled-header = Yêu cầu bộ nhớ cục bộ và cookie
cookies-disabled-enable-prompt-2 = Vui lòng bật cookie và bộ nhớ cục bộ trong trình duyệt của bạn để truy cập vào { -product-mozilla-account } của bạn. Làm như vậy sẽ kích hoạt chức năng như ghi nhớ bạn giữa các phiên.
# A button users may click to check if cookies and local storage are enabled and be directed to the previous page if so.
cookies-disabled-button-try-again = Thử lại
# An external link going to: https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer
cookies-disabled-learn-more = Tìm hiểu thêm

## Index / home page

index-header = Nhập email của bạn
index-sync-header = Tiếp tục với { -product-mozilla-account } của bạn
index-sync-subheader = Đồng bộ hóa mật khẩu, thẻ và dấu trang của bạn ở mọi nơi bạn sử dụng { -brand-firefox }.
index-relay-header = Tạo email ẩn danh
index-relay-subheader = Vui lòng cung cấp địa chỉ email mà bạn muốn chuyển tiếp email từ email ẩn danh của mình.
# $serviceName - the service (e.g., Pontoon) that the user is signing into with a Mozilla account
index-subheader-with-servicename = Tiếp tục đến { $serviceName }
index-subheader-default = Tiếp tục đến cài đặt tài khoản
index-cta = Đăng ký hoặc đăng nhập
index-account-info = Một { -product-mozilla-account } cũng mở khóa quyền truy cập vào nhiều sản phẩm bảo vệ quyền riêng tư hơn từ { -brand-mozilla }.
index-email-input =
    .label = Nhập email của bạn
# When users delete their Mozilla account inside account Settings, they are redirected to this page with a success message
index-account-delete-success = Đã xóa tài khoản thành công
# Displayed when users try to sign up for an account and their confirmation code email bounces
index-email-bounced = Email xác minh của bạn vừa được trả lại. Bạn đã nhập sai địa chỉ email?

## InlineRecoveryKeySetup page component

inline-recovery-key-setup-create-error = Rất tiếc! Chúng tôi không thể tạo khóa khôi phục tài khoản của bạn. Vui lòng thử lại sau.
inline-recovery-key-setup-recovery-created = Đã tạo khóa khôi phục tài khoản
inline-recovery-key-setup-download-header = Bảo mật tài khoản của bạn
inline-recovery-key-setup-download-subheader = Tải xuống và lưu trữ ngay bây giờ
inline-recovery-key-setup-download-info = Hãy lưu trữ khóa này ở nơi bạn dễ nhớ — bạn sẽ không thể quay lại trang để lấy nó sau này.
inline-recovery-key-setup-hint-header = Đề xuất bảo mật

## InlineTotpSetup page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).

inline-totp-setup-cancel-setup-button = Hủy thiết lập
inline-totp-setup-continue-button = Tiếp tục
# <authenticationAppsLink> links to a list of security apps
inline-totp-setup-add-security-link = Thêm một lớp bảo mật vào tài khoản của bạn bằng cách yêu cầu mã xác thực từ một trong <authenticationAppsLink>các ứng dụng xác thực này</authenticationAppsLink>.
#  The <enable2StepDefaultSpan> elements are just visual separation here
inline-totp-setup-enable-two-step-authentication-default-header-2 = Bật xác thực hai bước <span>để tiếp tục đến cài đặt tài khoản</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enable2StepCustomServiceSpan> elements are just visual separation
inline-totp-setup-enable-two-step-authentication-custom-header-2 = Bật xác thực hai bước <span>để tiếp tục đến { $serviceName }</span>
inline-totp-setup-ready-button = Sẵn sàng
# The authentication code a user is scanning is a QR code.
# { $serviceName } is the name of the service which the user wants to authenticate to. The <scanAuthCodeHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-custom-service-header-2 = Quét mã xác thực <span>để tiếp tục đến { $serviceName }</span>
# { $serviceName } is the name of the service which the user wants to authenticate to. The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-custom-service-header-2 = Nhập mã theo cách thủ công <span>để tiếp tục đến { $serviceName }</span>
# The authentication code a user is scanning is a QR code.
# The <scanAuthHeaderSpan> elements are just visual separation
inline-totp-setup-show-qr-default-service-header-2 = Quét mã xác thực <span>để tiếp tục đến cài đặt tài khoản</span>
# The <enterCodeManuallyHeaderSpan> elements are just visual separation
inline-totp-setup-no-qr-default-service-header-2 = Nhập mã theo cách thủ công <span>để tiếp tục đến cài đặt tài khoản</span>
# The <toggleToQRButton> allows the user to use a QR code instead of manually entering a secret key
inline-totp-setup-enter-key-or-use-qr-instructions = Nhập khóa bí mật này vào ứng dụng xác thực của bạn. <toggleToQRButton>Thay vào đó, hãy quét mã QR?</toggleToQRButton>
# The <toggleToManualModeButton> allows the user to manually enter a secret key instead of scanning a QR code
inline-totp-setup-use-qr-or-enter-key-instructions = Quét mã QR trong ứng dụng xác thực của bạn rồi nhập mã xác thực mà ứng dụng cung cấp. <toggleToManualModeButton>Không thể quét mã?</toggleToManualModeButton>
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-on-completion-description = Sau khi hoàn tất, nó sẽ bắt đầu tạo mã xác thực để bạn nhập.
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-security-code-placeholder = Mã xác thực
# The "authentication code" here refers to the code provided by an authentication app.
inline-totp-setup-code-required-error = Yêu cầu mã xác thực
tfa-qr-code-alt = Sử dụng mã { $code } để thiết lập xác thực hai bước trong các ứng dụng được hỗ trợ.
inline-totp-setup-page-title = Xác thực hai bước

## Legal page. This page contains simply a header and links to pages that display
## content from https://github.com/mozilla/legal-docs

legal-header = Pháp lý
# Links to our internal "Firefox Cloud" /legal/terms page
legal-terms-of-service-link = Điều khoản dịch vụ
# Links to our internal "Firefox Cloud" /legal/terms page
legal-privacy-link = Thông báo bảo mật

## Legal privacy notice page. Most content comes from https://github.com/mozilla/legal-docs

legal-privacy-heading = Thông báo bảo mật

## Legal terms of service page. Most content comes from https://github.com/mozilla/legal-docs

legal-terms-heading = Điều khoản dịch vụ

## AuthAllow page - Part of the device pairing flow

pair-auth-allow-heading-text = Bạn vừa đăng nhập vào { -product-firefox } phải không?
# Submit button to confirm that the user initiated the device pairing
# and that they approve of the new device being added to their account
pair-auth-allow-confirm-button = Có, phê duyệt thiết bị
# "If this wasn't you" means "If it wasn't you that just signed in to Firefox"
# The text with the <link> tags links to a `reset password` page
pair-auth-allow-refuse-device-link = Nếu đây không phải là bạn, hãy <link>thay đổi mật khẩu của bạn</link>

## PairAuthComplete page - part of the device pairing flow

# Heading to confirm the successful pairing of a new device with the user's account
# Device here is non specific (could be a laptop, tablet, phone, etc.)
pair-auth-complete-heading = Đã kết nối thiết bị
# Variable { $deviceFamily } is generally a browser name, for example "Firefox"
# Variable { $deviceOS } is an operating system short name, for example "iOS", "Android"
pair-auth-complete-now-syncing-device-text = Bạn hiện đang đồng bộ hóa với: { $deviceFamily } trên { $deviceOS }
pair-auth-complete-sync-benefits-text = Giờ đây, bạn có thể truy cập các thẻ đang mở, mật khẩu và dấu trang trên tất cả các thiết bị của mình.
pair-auth-complete-see-tabs-button = Xem các thẻ từ các thiết bị được đồng bộ hóa
pair-auth-complete-manage-devices-link = Quản lý thiết bị

## AuthTotp page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during device pairing.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to account settings" can stand alone as "Continue to account settings"
auth-totp-heading-w-default-service = Nhập mã xác thực <span>để tiếp tục đến cài đặt tài khoản</span>
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "to continue to { $serviceName }" can stand alone as "Continue to { $serviceName }"
# { $serviceName } represents a product name (e.g., Mozilla VPN) that will be passed in as a variable
auth-totp-heading-w-custom-service = Nhập mã xác thực <span>để tiếp tục đến { $serviceName }</span>
auth-totp-instruction = Mở ứng dụng xác thực của bạn và nhập mã xác thực mà nó cung cấp.
auth-totp-input-label = Nhập mã gồm 6 chữ số
# Form button to confirm if the authentication code entered by the user is valid
auth-totp-confirm-button = Xác nhận
# Error displayed in a tooltip when the form is submitted without a code
auth-totp-code-required-error = Yêu cầu mã xác thực

## WaitForSupp page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-supp-heading-text = Hiện yêu cầu phê duyệt <span>từ thiết bị khác của bạn</span>

## PairFailure - a view which displays on failure of the device pairing process

pair-failure-header = Ghép nối không thành công
pair-failure-message = Quá trình thiết lập đã hủy bỏ.

## Pair index page

pair-sync-header = Đồng bộ hóa { -brand-firefox } trên điện thoại hoặc máy tính bảng của bạn
pair-cad-header = Kết nối { -brand-firefox } trên thiết bị khác
pair-already-have-firefox-paragraph = Đã có { -brand-firefox } trên điện thoại hoặc máy tính bảng?
# Clicking this button initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-sync-your-device-button = Đồng bộ hóa thiết bị của bạn
# This is a heading element immediately preceded by "Sync your device" and followed by a link and QR code to download Firefox
pair-or-download-subheader = Hoặc tải xuống
# Directs user to scan a QR code to download Firefox. <linkExternal> is an anchor tag that directs the user to where they can download the { -brand-firefox } app
pair-scan-to-download-message = Quét để tải xuống { -brand-firefox } cho điện thoại di động hoặc gửi cho bạn <linkExternal>liên kết tải xuống</linkExternal>.
# This allows the user to exit the sync/pair flow, and redirects them back to Settings
pair-not-now-button = Không phải bây giờ
pair-take-your-data-message = Mang các thẻ, dấu trang và mật khẩu của bạn đến bất cứ nơi nào bạn sử dụng { -brand-firefox }.
# This initiates the pairing process, usually by directing the user to the `about:preferences` page in Firefox
pair-get-started-button = Bắt đầu
# This is the aria label on the QR code image
pair-qr-code-aria-label = Mã QR

## PairSuccess - a view which displays  on successful completion of the device pairing process

pair-success-header-2 = Đã kết nối thiết bị
pair-success-message-2 = Ghép nối thành công.

## SuppAllow page - Part of the device pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be confirmed from both devices to succeed

# Strings within the <span> elements appear as a subheading.
# Variable $email is the user's email address
pair-supp-allow-heading-text = Xác nhận ghép nối <span>cho { $email }</span>
pair-supp-allow-confirm-button = Xác nhận ghép nối
pair-supp-allow-cancel-link = Hủy bỏ

## WaitForAuth page - Part of the devide pairing flow
## Users see this page when they have started to pair a second (or more) device to their account
## The pairing must be approved from both devices to succeed

# The "other device" is non-specific and could be a desktop computer, laptop, tablet, mobile phone, etc.
# Strings within the <span> elements appear as a subheading.
pair-wait-for-auth-heading-text = Hiện tại cần chấp nhận <span>từ thiết bị khác của bạn</span>

## PairUnsupported - a view which is shown when the user tries to scan the pairing QR code any way other than through a Firefox app

pair-unsupported-header = Ghép nối bằng ứng dụng
pair-unsupported-message = Bạn đã sử dụng máy ảnh hệ thống? Bạn phải ghép nối từ bên trong ứng dụng { -brand-firefox }.

## SetPassword page
## Third party auth users that do not have a password set yet are prompted for a


# password to complete their sign-in when they want to login to a service requiring it.

set-password-heading-v2 = Tạo mật khẩu để đồng bộ
# "This" refers to the heading, "Create password to sync"
set-password-info-v2 = Điều này sẽ mã hóa dữ liệu của bạn. Mật khẩu này phải khác với mật khẩu tài khoản { -brand-google } hoặc { -brand-apple } của bạn.

## ThirdPartyAuthCallback Page
## This page is called after a user completes the third party authentication flow from Google or Apple.

third-party-auth-callback-message = Vui lòng đợi, bạn đang được chuyển hướng đến ứng dụng được ủy quyền.

## AccountRecoveryConfirmKey page

account-recovery-confirm-key-heading = Nhập khóa khôi phục tài khoản của bạn
account-recovery-confirm-key-instruction = Khóa này khôi phục dữ liệu duyệt web được mã hóa của bạn, chẳng hạn như mật khẩu và dấu trang, từ máy chủ { -brand-firefox }.
# Prompts the user to enter their account recovery key
# Account recovery key contains a mix of letters and numbers, no special characters
account-recovery-confirm-key-input-label =
    .label = Nhập khóa khôi phục tài khoản gồm 32 ký tự của bạn
# When setting up an account recovery key, users have the option of storing an account recovery key hint that is shown during password reset
account-recovery-confirm-key-hint = Gợi ý khoá của bạn là:
# Clicking this button checks if the recovery key provided by the user is correct and associated with their account
account-recovery-confirm-key-button-2 = Tiếp tục
# Link that leads to the password reset page (without recovery code)
account-recovery-lost-recovery-key-link-2 = Không thể tìm thấy khóa khôi phục tài khoản của bạn?

## CompleteResetPassword component
## User followed a password reset link and is now prompted to create a new password

complete-reset-pw-header-v2 = Tạo mật khẩu mới
# A new password was successfully set for the user's account
# Displayed in an alert bar
complete-reset-password-success-alert = Đã đặt mật khẩu
# An error occurred while attempting to set a new password (password reset flow)
# Displayed in an alert bar
complete-reset-password-error-alert = Xin lỗi, đã xảy ra sự cố khi đặt mật khẩu của bạn
# Link to go back and use an account recovery key before resetting the password
complete-reset-pw-recovery-key-link = Sử dụng khóa khôi phục tài khoản
# A message informing the user that the password reset was successful and reminding them to create another recovery key
# Displayed on the sign in page
reset-password-complete-banner-heading = Mật khẩu của bạn đã được đặt lại.
reset-password-complete-banner-message = Đừng quên tạo khóa khôi phục tài khoản mới từ cài đặt { -product-mozilla-account } của bạn để tránh các vấn đề đăng nhập về sau.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
complete-reset-password-desktop-relay = { -brand-firefox } sẽ điều hướng bạn quay trở lại để sử dụng email ẩn danh sau khi bạn đăng nhập.

# ConfirmBackupCodeResetPassword page

confirm-backup-code-reset-password-input-label = Nhập mã gồm 10 ký tự
confirm-backup-code-reset-password-confirm-button = Xác nhận
confirm-backup-code-reset-password-subheader = Nhập mã xác thực dự phòng
confirm-backup-code-reset-password-instruction = Nhập một trong các mã sử dụng một lần bạn đã lưu khi bạn thiết lập xác thực hai bước.
# Link out to support article: https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
confirm-backup-code-reset-password-locked-out-link = Tài khoản của bạn đang bị khóa?

## Confirm Reset Password With Code

confirm-reset-password-with-code-heading = Kiểm tra email của bạn
# Text within span appears in bold
# $email - email address for which a password reset was requested
confirm-reset-password-with-code-instruction = Chúng tôi đã gửi mã xác minh tới <span>{ $email }</span>.
# Shown above a group of 8 single-digit input boxes
# Only numbers allowed
confirm-reset-password-code-input-group-label = Nhập mã 8 chữ số trong vòng 10 phút
# Clicking the button submits and verifies the code
# If succesful, continues to the next step of the password reset
confirm-reset-password-otp-submit-button = Tiếp tục
# Button to request a new reset password confirmation code
confirm-reset-password-otp-resend-code-button = Gửi lại mã
# Link to cancel the password reset and sign in with a different account
confirm-reset-password-otp-different-account-link = Sử dụng tài khoản khác

## PasswordResetConfirmTotp Page

confirm-totp-reset-password-header = Đặt lại mật khẩu của bạn
confirm-totp-reset-password-subheader-v2 = Nhập mã xác thực hai bước
confirm-totp-reset-password-instruction-v2 = Kiểm tra <strong>ứng dụng xác thực</strong> của bạn để đặt lại mật khẩu.
confirm-totp-reset-password-trouble-code = Khó khăn khi nhập mã?
confirm-totp-reset-password-confirm-button = Xác nhận
confirm-totp-reset-password-input-label-v2 = Nhập mã gồm 6 chữ số
confirm-totp-reset-password-use-different-account = Sử dụng một tài khoản khác

## ResetPassword start page

password-reset-flow-heading = Đặt lại mật khẩu của bạn
password-reset-body-2 =
    Chúng tôi sẽ yêu cầu một số điều chỉ bạn biết để giữ tài khoản của bạn
    an toàn.
password-reset-email-input =
    .label = Nhập email của bạn
password-reset-submit-button-2 = Tiếp tục

## ResetPasswordConfirmed

reset-password-complete-header = Mật khẩu của bạn đã được đặt lại
# $serviceName is a product name such as Monitor, Relay
reset-password-confirmed-cta = Tiếp tục đến { $serviceName }

## Reset password recovery method page
## This page is shown to users when they are having trouble resetting their


# password, and they previously had set up an account recovery method.

password-reset-recovery-method-header = Đặt lại mật khẩu của bạn
password-reset-recovery-method-subheader = Chọn phương pháp khôi phục
# This is displayed to the user when they are choosing an alternative method to authenticate themself in the password reset process when they do not have access to their two-factor authenticator application
password-reset-recovery-method-details = Hãy đảm bảo rằng bạn chính là người đang sử dụng phương thức khôi phục của mình.
password-reset-recovery-method-phone = Số điện thoại khôi phục
password-reset-recovery-method-code = Mã xác thực dự phòng
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
password-reset-recovery-method-code-info = { $numBackupCodes } còn lại
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
password-reset-recovery-method-send-code-error-heading = Có sự cố khi gửi mã đến số điện thoại khôi phục của bạn
password-reset-recovery-method-send-code-error-description = Vui lòng thử lại sau hoặc sử dụng mã xác thực dự phòng của bạn.

## ResetPasswordRecoveryPhone page

reset-password-recovery-phone-flow-heading = Đặt lại mật khẩu của bạn
# A recovery code in context of this page is a one time code sent to the user's phone
reset-password-recovery-phone-heading = Nhập mã khôi phục
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
reset-password-recovery-phone-instruction-v3 = Một mã 6 chữ số đã được gửi đến số điện thoại kết thúc bằng <span>{ $lastFourPhoneDigits }</span> bằng tin nhắn văn bản. Mã này hết hạn sau 5 phút. Đừng chia sẻ mã này với bất cứ ai.
reset-password-recovery-phone-input-label = Nhập mã gồm 6 chữ số
reset-password-recovery-phone-code-submit-button = Xác nhận
reset-password-recovery-phone-resend-code-button = Gửi lại mã
reset-password-recovery-phone-resend-success = Mã đã được gửi
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
reset-password-recovery-phone-locked-out-link = Tài khoản của bạn đang bị khóa?
reset-password-recovery-phone-send-code-error-heading = Có vấn đề khi gửi mã
reset-password-recovery-phone-code-verification-error-heading = Có vấn đề khi xác minh mã của bạn.
# Follows the error message (e.g, "There was a problem sending a code")
reset-password-recovery-phone-general-error-description = Vui lòng thử lại sau.
reset-password-recovery-phone-invalid-code-error-description = Mã không hợp lệ hoặc đã hết hạn.
reset-password-recovery-phone-invalid-code-error-link = Bạn muốn sử dụng mã xác thực dự phòng?
reset-password-with-recovery-key-verified-page-title = Đặt lại mật khẩu thành công
reset-password-complete-new-password-saved = Đã đặt mật khẩu mới!
reset-password-complete-recovery-key-created = Đã tạo khóa khôi phục tài khoản mới. Tải xuống và lưu trữ ngay bây giờ.
reset-password-complete-recovery-key-download-info =
    Khóa này rất cần thiết cho việc khôi phục dữ liệu
    nếu bạn quên mật khẩu. <b>Tải xuống và lưu trữ an toàn bây giờ,
    vì bạn sẽ không thể truy cập lại trang này sau này.</b>

## CompleteSignin component

# This is a label that precedes any error which could arise from trying to validate the user's signin
error-label = Lỗi:
# This is a message that is shown to users along with a "Loading" spinner while the site tries to check their signin
validating-signin = Đang xác thực đăng nhập…
# Shown above an error banner (e.g., invalid confirmation code, unexpected error)
complete-signin-error-header = Lỗi xác minh
# The user followed a signin confirmation link, but that link is expired and no longer valid
signin-link-expired-header = Liên kết xác minh đã hết hạn
signin-link-expired-message-2 = Liên kết bạn nhấp vào đã hết hạn hoặc đã được sử dụng.

## Signin page

# Strings within the <span> elements appear as a subheading.
signin-password-needed-header-2 = Nhập mật khẩu của bạn <span>cho { -product-mozilla-account } của bạn</span>
# $serviceName - the name of the service which the user authenticating for
# For languages structured like English, the phrase can read "to continue to { $serviceName }"
signin-subheader-without-logo-with-servicename = Tiếp tục đến { $serviceName }
signin-subheader-without-logo-default = Tiếp tục đến cài đặt tài khoản
signin-button = Đăng nhập
signin-header = Đăng nhập
signin-use-a-different-account-link = Sử dụng một tài khoản khác
signin-forgot-password-link = Đã quên mật khẩu?
signin-password-button-label = Mật khẩu
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-desktop-relay = { -brand-firefox } sẽ điều hướng bạn quay trở lại để sử dụng email ẩn danh sau khi bạn đăng nhập.
signin-code-expired-error = Mã đã hết hạn. Vui lòng đăng nhập lại.
signin-account-locked-banner-heading = Đặt lại mật khẩu của bạn
signin-account-locked-banner-description = Chúng tôi đã khóa tài khoản của bạn để bảo vệ tài khoản khỏi hoạt động đáng ngờ.
# This link points to https://accounts.firefox.com/reset_password
signin-account-locked-banner-link = Đặt lại mật khẩu để đăng nhập

## ReportSignin Page
## When users receive an "Is this you signing in?" email with an unblock code,
## they can click "report it to us" if they did not attempt to sign in.
## This will be the page shown to users to block the sign in and report it.

report-signin-link-damaged-body = Liên kết bạn nhấp vào bị thiếu ký tự và có thể đã bị ứng dụng email của bạn làm hỏng. Hãy sao chép địa chỉ một cách cẩn thận và thử lại.
report-signin-header = Báo cáo đăng nhập không được phép?
report-signin-body = Bạn đã nhận được email về việc cố gắng truy cập vào tài khoản của bạn. Bạn có muốn báo cáo hoạt động này là đáng ngờ không?
report-signin-submit-button = Báo cáo hoạt động
report-signin-support-link = Tại sao chuyện này xảy ra?
report-signin-error = Rất tiếc, đã xảy ra sự cố khi gửi báo cáo.
signin-bounced-header = Rất tiếc. Chúng tôi đã khóa tài khoản của bạn.
# $email (string) - The user's email.
signin-bounced-message = Email xác nhận chúng tôi gửi tới { $email } đã bị trả lại và chúng tôi đã khóa tài khoản của bạn để bảo vệ dữ liệu { -brand-firefox } của bạn.
# linkExternal is button which logs the user's action and navigates them to mozilla support
signin-bounced-help = Nếu đây là địa chỉ email hợp lệ, hãy <linkExternal>cho chúng tôi biết</linkExternal> và chúng tôi có thể giúp mở khóa tài khoản của bạn.
signin-bounced-create-new-account = Không còn sở hữu email đó nữa? Tạo tài khoản mới
back = Quay lại

## SigninPushCode page
## This page is used to send a push notification to the user's device for two-factor authentication (2FA).

signin-push-code-heading-w-default-service = Xác minh đăng nhập này <span>để tiếp tục cài đặt tài khoản</span>
signin-push-code-heading-w-custom-service = Xác minh đăng nhập này <span>để tiếp tục đến với { $serviceName }</span>
signin-push-code-instruction = Vui lòng kiểm tra các thiết bị khác của bạn và phê duyệt thông tin đăng nhập này từ trình duyệt { -brand-firefox } của bạn.
signin-push-code-did-not-recieve = Không nhận được thông báo?
signin-push-code-send-email-link = Mã từ email

## SigninPushCodeConfirmPage

signin-push-code-confirm-instruction = Xác nhận đăng nhập của bạn
signin-push-code-confirm-description = Chúng tôi đã phát hiện lần thử đăng nhập từ thiết bị sau. Nếu đây là bạn, vui lòng phê duyệt đăng nhập
signin-push-code-confirm-verifying = Đang xác minh
signin-push-code-confirm-login = Xác nhận đăng nhập
signin-push-code-confirm-wasnt-me = Không phải tôi, hãy đổi mật khẩu.
signin-push-code-confirm-login-approved = Đăng nhập của bạn đã được phê duyệt. Hãy đóng cửa sổ này lại.
signin-push-code-confirm-link-error = Liên kết đã bị hỏng. Hãy thử lại.

## Signin recovery method page
## This page is shown to users when they are having trouble signing in with
## their password, and they previously had set up an account recovery method.

signin-recovery-method-header = Đăng nhập
signin-recovery-method-subheader = Chọn phương pháp khôi phục
signin-recovery-method-details = Hãy đảm bảo rằng bạn chính là người đang sử dụng phương thức khôi phục của mình.
signin-recovery-method-phone = Số điện thoại khôi phục
signin-recovery-method-code-v2 = Mã xác thực dự phòng
# Variable: $numBackupCodes (String) - The number of backup authentication codes the user has left, e.g., 4
signin-recovery-method-code-info-v2 = { $numBackupCodes } còn lại
# Shown when a backend service fails and a code cannot be sent to the user's recovery phone.
signin-recovery-method-send-code-error-heading = Có sự cố khi gửi mã đến số điện thoại khôi phục của bạn
signin-recovery-method-send-code-error-description = Vui lòng thử lại sau hoặc sử dụng mã xác thực dự phòng của bạn.

## SigninRecoveryCode page
## Users are prompted to enter a backup authentication code
## (provided to the user when they first set up two-step authentication)
## when they are unable to sign in with two-step authentication (e.g., Authy, Duo, etc.)

signin-recovery-code-heading = Đăng nhập
signin-recovery-code-sub-heading = Nhập mã xác thực dự phòng
# codes here refers to backup authentication codes
signin-recovery-code-instruction-v3 = Nhập một trong các mã sử dụng một lần bạn đã lưu khi bạn thiết lập xác thực hai bước.
# code here refers to backup authentication code
signin-recovery-code-input-label-v2 = Nhập mã gồm 10 ký tự
# Form button to confirm if the backup authentication code entered by the user is valid
signin-recovery-code-confirm-button = Xác nhận
# Link to go to the page to use recovery phone instead
signin-recovery-code-phone-link = Sử dụng số điện thoại khôi phục
# External link for support if the user can't use two-step autentication or a backup authentication code
# https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-code-support-link = Tài khoản của bạn đang bị khóa?
# Error displayed in a tooltip when form is submitted witout a code
signin-recovery-code-required-error = Cần có mã xác thực dự phòng
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-recovery-code-use-phone-failure = Có sự cố khi gửi mã đến số điện thoại khôi phục của bạn
signin-recovery-code-use-phone-failure-description = Vui lòng thử lại sau.

## SigninRecoveryPhone page

signin-recovery-phone-flow-heading = Đăng nhập
# A recovery code in context of this page is a one time code sent to the user's phone
signin-recovery-phone-heading = Nhập mã khôi phục
# Text that explains the user should check their phone for a recovery code
# $maskedPhoneNumber - The users masked phone number
signin-recovery-phone-instruction-v3 = Một mã sáu chữ số đã được gửi đến số điện thoại kết thúc bằng <span>{ $lastFourPhoneDigits }</span> bằng tin nhắn văn bản. Mã này hết hạn sau 5 phút. Đừng chia sẻ mã này với bất cứ ai.
signin-recovery-phone-input-label = Nhập mã gồm 6 chữ số
signin-recovery-phone-code-submit-button = Xác nhận
signin-recovery-phone-resend-code-button = Gửi lại mã
signin-recovery-phone-resend-success = Mã đã được gửi
# links to https://support.mozilla.org/kb/what-if-im-locked-out-two-step-authentication
signin-recovery-phone-locked-out-link = Tài khoản của bạn đang bị khóa?
signin-recovery-phone-send-code-error-heading = Có vấn đề khi gửi mã
signin-recovery-phone-code-verification-error-heading = Có vấn đề khi xác minh mã của bạn.
# Follows the error message (e.g, "There was a problem sending a code")
signin-recovery-phone-general-error-description = Vui lòng thử lại sau.
signin-recovery-phone-invalid-code-error-description = Mã không hợp lệ hoặc đã hết hạn.
signin-recovery-phone-invalid-code-error-link = Bạn muốn sử dụng mã xác thực dự phòng?
# "Limits" refers to potential restrictions on how often a recovery phone number can be used for signing in within a given time period.
# If limits are reached, users may have to use an alternate two-step authentication method or wait until the restriction period is over.
signin-recovery-phone-success-message = Đã đăng nhập thành công. Có thể áp dụng giới hạn nếu bạn sử dụng lại số điện thoại khôi phục.

## Signin reported page: this page is shown when a user receives an email notifying them of a new account signin, and the user clicks a button indicating that the signin was not them so that we know it was someone trying to break into their account.

signin-reported-header = Cảm ơn vì sự cảnh giác của bạn
signin-reported-message = Nhóm của chúng tôi đã được thông báo. Các báo cáo như thế này giúp chúng tôi chống lại những kẻ xâm nhập.

## SigninTokenCode page
## Users see this page during the signin process. In this instance, the confirmation code is
## a 6-digit code that is sent to the user's email address.

# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
signin-token-code-heading-2 = Nhập mã xác minh<span> cho { -product-mozilla-account } của bạn</span>
# { $email } represents the email that the user entered to sign in
signin-token-code-instruction-v2 = Nhập mã đã được gửi tới <email>{ $email }</email> trong vòng 5 phút.
signin-token-code-input-label-v2 = Nhập mã gồm 6 chữ số
# Form button to confirm if the confirmation code entered by the user is valid
signin-token-code-confirm-button = Xác nhận
signin-token-code-code-expired = Mã đã hết hạn?
# Link to resend a new code to the user's email.
signin-token-code-resend-code-link = Gửi mã mới qua email.
# Error displayed in a tooltip when the form is submitted without a code
signin-token-code-required-error = Yêu cầu mã xác nhận
signin-token-code-resend-error = Đã xảy ra sự cố. Không thể gửi mã mới.
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-token-code-instruction-desktop-relay = { -brand-firefox } sẽ điều hướng bạn quay trở lại để sử dụng email ẩn danh sau khi bạn đăng nhập.

## SigninTOTPCode page
## TOTP (time-based one-time password) is a form of two-factor authentication (2FA).
## Users that have set up two-factor authentication land on this page during sign-in.

signin-totp-code-header = Đăng nhập
signin-totp-code-subheader-v2 = Nhập mã xác thực hai bước
signin-totp-code-instruction-v4 = Kiểm tra <strong>ứng dụng xác thực</strong> của bạn để xác nhận thông tin đăng nhập của bạn.
signin-totp-code-input-label-v4 = Nhập mã gồm 6 chữ số
# Shown to users when they need to re-enter their authentication code, for their current device
signin-totp-code-aal-banner-header = Tại sao bạn được yêu cầu thực?
signin-totp-code-aal-banner-content = Bạn đã thiết lập xác thực hai bước trên tài khoản của mình nhưng vẫn chưa đăng nhập bằng mã trên thiết bị này.
signin-totp-code-aal-sign-out = Đăng xuất trên thiết bị này
signin-totp-code-aal-sign-out-error = Xin lỗi, đã xảy ra sự cố khi đăng xuất cho bạn
# Form button to confirm if the authentication code entered by the user is valid
signin-totp-code-confirm-button = Xác nhận
signin-totp-code-other-account-link = Sử dụng một tài khoản khác
signin-totp-code-recovery-code-link = Sự cố khi nhập mã?
# Error displayed in a tooltip when the form is submitted without a code
signin-totp-code-required-error = Yêu cầu mã xác thực
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-totp-code-desktop-relay = { -brand-firefox } sẽ điều hướng bạn quay trở lại để sử dụng email ẩn danh sau khi bạn đăng nhập.

## Signin Unblock Page
## Page shown when signin has been blocked by rate limiting (too many requests)

signin-unblock-header = Cho phép lần đăng nhập này
# Where $email is the email address entered for the sign-in attempt
signin-unblock-body = Kiểm tra email của bạn để xem mã xác minh được gửi tới { $email }.
signin-unblock-code-input = Nhập mã xác minh
signin-unblock-submit-button = Tiếp tục
# Shown when the user attempts to submit the form without including a code
signin-unblock-code-required-error = Yêu cầu mã xác minh
signin-unblock-code-incorrect-length = Mã xác minh phải chứa 8 ký tự
signin-unblock-code-incorrect-format-2 = Mã xác minh chỉ có thể chứa chữ cái và/hoặc số
signin-unblock-resend-code-button = Không có trong hộp thư đến hoặc thư mục spam? Gửi lại
signin-unblock-support-link = Tại sao chuyện này xảy ra?
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
signin-unblock-desktop-relay = { -brand-firefox } sẽ điều hướng bạn quay trở lại để sử dụng email ẩn danh sau khi bạn đăng nhập.

## ConfirmSignupCode page
## Users see this page after they have initiated account sign up,


# and a confirmation code has been sent to their email address.

# Page title show in browser title bar or page tab
confirm-signup-code-page-title = Nhập mã xác nhận
# String within the <span> element appears on a separate line
# If more appropriate in a locale, the string within the <span>, "for your { -product-mozilla-account }"
# can stand alone as "{ -product-mozilla-account }"
confirm-signup-code-heading-2 = Nhập mã xác minh <span>cho { -product-mozilla-account } của bạn</span>
# { $email } represents the email that the user entered to sign in
confirm-signup-code-instruction-v2 = Nhập mã đã được gửi tới <email>{ $email }</email> trong vòng 5 phút.
confirm-signup-code-input-label = Nhập mã gồm 6 chữ số
# Form button to confirm if the confirmation code entered by the user is valid
confirm-signup-code-confirm-button = Xác nhận
confirm-signup-code-sync-button = Bắt đầu đồng bộ hóa
confirm-signup-code-code-expired = Mã đã hết hạn?
# Link to resend a new code to the user's email.
confirm-signup-code-resend-code-link = Gửi mã mới qua email.
confirm-signup-code-success-alert = Đã xác minh tài khoản thành công
# Error displayed in tooltip.
confirm-signup-code-is-required-error = Yêu cầu mã xác nhận
# Message to user after they were redirected to the Mozilla account sign-in page in a new browser
# tab. Firefox will attempt to send the user back to their original tab to use an email mask after
# they successfully sign in or sign up for a Mozilla account to receive a free email mask.
confirm-signup-code-desktop-relay = { -brand-firefox } sẽ điều hướng bạn quay trở lại để sử dụng email ẩn danh sau khi bạn đăng nhập.

## Account Signup page
## This is the second page of the sign up flow, users have already entered their email

signup-heading-v2 = Tạo một mật khẩu
signup-relay-info = Cần có mật khẩu để quản lý an toàn các email ẩn danh và quyền truy cập vào các công cụ bảo mật của { -brand-mozilla } của bạn.
signup-sync-info = Đồng bộ hóa mật khẩu, dấu trang và nhiều thứ khác ở mọi nơi bạn sử dụng { -brand-firefox }.
signup-sync-info-with-payment = Đồng bộ hóa mật khẩu, phương thức thanh toán, dấu trang và nhiều thông tin khác ở mọi nơi bạn sử dụng { -brand-firefox }.
# Clicking on this link returns the user to the beginning of the flow so they can enter a new email address
signup-change-email-link = Thay đổi email

## SignupConfirmedSync page
## Shown to users when they finish confirming their account through Sync

signup-confirmed-sync-header = Đồng bộ hoá đang được bật
signup-confirmed-sync-success-banner = Đã xác nhận { -product-mozilla-account }
signup-confirmed-sync-button = Bắt đầu duyệt web
# Shown when payment methods are also synced
signup-confirmed-sync-description-with-payment-v2 = Mật khẩu, phương thức thanh toán, địa chỉ, dấu trang, lịch sử và nhiều thông tin khác của bạn có thể đồng bộ hóa ở mọi nơi bạn sử dụng { -brand-firefox }.
signup-confirmed-sync-description-v2 = Mật khẩu, địa chỉ, dấu trang, lịch sử và nhiều thông tin khác của bạn có thể đồng bộ hóa ở mọi nơi bạn sử dụng { -brand-firefox }.
signup-confirmed-sync-add-device-link = Thêm thiết bị khác
signup-confirmed-sync-manage-sync-button = Quản lý đồng bộ hoá
signup-confirmed-sync-set-password-success-banner = Đã tạo mật khẩu đồng bộ hoá
