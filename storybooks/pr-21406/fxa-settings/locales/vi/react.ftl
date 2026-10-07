## FxA React - Strings shared between multiple FxA products for application error dialog

app-something-went-wrong-heading = Có gì đó không ổn
app-something-went-wrong-message = Chúng tôi đã nhận được thông báo về sự cố. Vui lòng làm mới trang để thử lại.
# $errorId (String) - Unique identifier for the error report, used to look it up in our monitoring system
app-error-id = ID lỗi: { $errorId }
# Expandable toggle that reveals technical details about the error
app-error-details-summary = Chi tiết lỗi
# Specific handling for issues when bad or missing query parameters are detected
app-query-parameter-err-heading = Yêu cầu không hợp lệ: Tham số truy vấn không hợp lệ

## FxA React - Strings shared between multiple FxA products for application footer

app-footer-mozilla-logo-label = Biểu tượng { -brand-mozilla }
app-footer-privacy-notice = Thông báo bảo mật trang web
app-footer-terms-of-service = Điều khoản dịch vụ

## FxA React - Strings shared between multiple FxA products for application page title

# This string is used as the default title for pages, displayed in the browser tab.
app-default-title-2 = { -product-mozilla-accounts }
# This string is used as the title of the page, displayed in the browser tab.
# Variables:
#   $title (String) - the name of the current page
#                      (for example: "Two-step authentication")
app-page-title-2 = { $title } | { -product-mozilla-accounts }

## FxA React - Strings shared between multiple FxA products for external link

# Message for screen readers, to announce that external link will open in new window
link-sr-new-window = Mở trong cửa sổ mới

## FxA React - Strings shared between multiple FxA products for loading spinner

# Aria label for spinner image indicating data is loading
app-loading-spinner-aria-label-loading = Đang tải…

## FxA React - Strings shared between multiple FxA products for logo lockup

app-logo-alt-3 =
    .alt = Logo m của { -brand-mozilla }
