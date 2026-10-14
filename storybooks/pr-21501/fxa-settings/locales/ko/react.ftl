## FxA React - Strings shared between multiple FxA products for application error dialog

app-something-went-wrong-heading = 오류가 발생하였습니다
app-something-went-wrong-message = 문제에 대해 안내를 받았습니다. 페이지를 새로고침해서 다시 시도하세요.
# $errorId (String) - Unique identifier for the error report, used to look it up in our monitoring system
app-error-id = 오류 ID: { $errorId }
# Expandable toggle that reveals technical details about the error
app-error-details-summary = 오류 세부 정보
# Specific handling for issues when bad or missing query parameters are detected
app-query-parameter-err-heading = 잘못된 요청: 유효하지 않은 쿼리 파라미터

## FxA React - Strings shared between multiple FxA products for application footer

app-footer-mozilla-logo-label = { -brand-mozilla } 로고
app-footer-privacy-notice = 웹 사이트 개인정보 보호정책
app-footer-terms-of-service = 이용 약관

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
link-sr-new-window = 새 창에서 열림

## FxA React - Strings shared between multiple FxA products for loading spinner

# Aria label for spinner image indicating data is loading
app-loading-spinner-aria-label-loading = 로드 중…

## FxA React - Strings shared between multiple FxA products for logo lockup

app-logo-alt-3 =
    .alt = { -brand-mozilla } m 로고
