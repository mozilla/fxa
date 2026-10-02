## FxA React - Strings shared between multiple FxA products for application error dialog

app-something-went-wrong-heading = 有些東西不對勁
app-something-went-wrong-message = 系統已自動通知我們這個問題，請重新整理頁面後再試一次。
# $errorId (String) - Unique identifier for the error report, used to look it up in our monitoring system
app-error-id = 錯誤 ID：{ $errorId }
# Expandable toggle that reveals technical details about the error
app-error-details-summary = 錯誤詳細資訊
# Specific handling for issues when bad or missing query parameters are detected
app-query-parameter-err-heading = 請求錯誤：查詢參數無效

## FxA React - Strings shared between multiple FxA products for application footer

app-footer-mozilla-logo-label = { -brand-mozilla } 圖示
app-footer-privacy-notice = 網站隱私權公告
app-footer-terms-of-service = 服務條款

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
link-sr-new-window = 會用新視窗開啟

## FxA React - Strings shared between multiple FxA products for loading spinner

# Aria label for spinner image indicating data is loading
app-loading-spinner-aria-label-loading = 載入中…

## FxA React - Strings shared between multiple FxA products for logo lockup

app-logo-alt-3 =
    .alt = { -brand-mozilla } m 標誌
