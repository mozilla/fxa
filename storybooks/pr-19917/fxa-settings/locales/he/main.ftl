



-brand-mozilla = Mozilla
-brand-firefox = Firefox
-product-firefox-accounts = Firefox accounts
-product-mozilla-account =
    { $case ->
        [the] חשבון ה־Mozilla
       *[a] חשבון Mozilla
    }
-product-mozilla-accounts = חשבונות Mozilla
-product-firefox-account =
    { $case ->
        [the] חשבון ה־Firefox
       *[a] חשבון Firefox
    }
-product-mozilla-vpn = Mozilla VPN
-product-mozilla-vpn-short = VPN
-product-mozilla-hubs = Mozilla Hubs
-product-mdn = MDN
-product-mdn-plus = MDN Plus
-product-firefox-cloud = Firefox Cloud
-product-mozilla-monitor = Mozilla Monitor
-product-mozilla-monitor-short = Monitor
-product-firefox-relay = Firefox Relay
-product-firefox-relay-short = Relay
-brand-apple = Apple
-brand-apple-pay = Apple Pay
-brand-google = Google
-brand-google-pay = Google Pay
-brand-paypal = PayPal
-brand-name-stripe = Stripe
-brand-amex = American Express
-brand-diners = Diners Club
-brand-discover = Discover
-brand-jcb = JCB
-brand-link = Link
-brand-mastercard = Mastercard
-brand-unionpay = UnionPay
-brand-visa = Visa
-app-store = App Store
-google-play = Google Play

app-general-err-heading = שגיאת יישום כללית
app-general-err-message = משהו השתבש. נא לנסות שוב מאוחר יותר.
app-query-parameter-err-heading = בקשה שגויה: פרמטרי שאילתה לא חוקיים


app-footer-mozilla-logo-label = הסמל של { -brand-mozilla }
app-footer-privacy-notice = הצהרת הפרטיות של האתר
app-footer-terms-of-service = תנאי השירות


app-default-title-2 = { -product-mozilla-accounts }
app-page-title-2 = ‏{ $title } | ‏{ -product-mozilla-accounts }


link-sr-new-window = נפתח בחלון חדש


app-loading-spinner-aria-label-loading = בטעינה…


app-logo-alt-3 =
    .alt = סמל ה־m של { -brand-mozilla }



resend-code-success-banner-heading = קוד חדש נשלח לדוא״ל שלך.
resend-link-success-banner-heading = קישור חדש נשלח לדוא״ל שלך.
resend-success-banner-description = מומלץ להוסיף את { $accountsEmail } לרשימת אנשי הקשר שלך כדי לוודא העברה חלקה.


brand-prelaunch-title = { -product-firefox-accounts } ישונו ל{ -product-mozilla-accounts } ב־1 בנובמבר
brand-prelaunch-subtitle = הכניסה לחשבון עדיין תהיה עם אותם פרטי שם משתמש וססמה, ואין שינויים אחרים במוצרים שבהם אתם משתמשים.
brand-postlaunch-title = שינינו את { -product-firefox-accounts } ל{ -product-mozilla-accounts }. הכניסה לחשבון עדיין תהיה עם אותם פרטי שם משתמש וססמה, ואין שינויים אחרים במוצרים שבהם אתם משתמשים.
brand-learn-more = מידע נוסף
brand-close-banner =
    .alt = סגירת באנר
brand-m-logo =
    .alt = סמל ה־m של { -brand-mozilla }


button-back-aria-label = חזרה
button-back-title = חזרה


recovery-key-download-button-v3 = הורדה והמשך
    .title = הורדה והמשך
recovery-key-pdf-heading = מפתח שחזור חשבון
recovery-key-pdf-download-date = נוצר בתאריך: { $date }
recovery-key-pdf-key-legend = מפתח שחזור חשבון
recovery-key-pdf-instructions = מפתח זה מאפשר לך לשחזר את נתוני הדפדפן המוצפנים שלך (הכוללים ססמאות, סימניות והיסטוריה) למקרה שהססמה שלך תישכח. יש לאחסן אותו במקום שקל לזכור.
recovery-key-pdf-storage-ideas-heading = מקומות לאחסון המפתח שלך
recovery-key-pdf-support = מידע נוסף על מפתח שחזור החשבון שלך
recovery-key-pdf-download-error = אירעה שגיאה בהורדת מפתח שחזור החשבון, עמך הסליחה.


choose-newsletters-prompt-2 = קבלו יותר מ־{ -brand-mozilla }:
choose-newsletters-option-latest-news =
    .label = קבלת חדשות ועדכונים למוצרים שלנו
choose-newsletters-option-test-pilot =
    .label = גישה מוקדמת לבדיקת מוצרים חדשים


datablock-download =
    .message = הוּרד
datablock-copy =
    .message = הועתק
datablock-print =
    .message = הודפס


datablock-copy-success =
    { $count ->
        [one] הקוד הועתק
       *[other] הקודים הועתקו
    }
datablock-download-success =
    { $count ->
        [one] הקוד הורד
       *[other] הקודים הורדו
    }
datablock-print-success =
    { $count ->
        [one] הקוד הודפס
       *[other] הקודים הודפסו
    }


datablock-inline-copy =
    .message = הועתק


device-info-block-location-city-region-country = { $city }, { $region }, { $country } (משוער)
device-info-block-location-region-country = ‏{ $region }, { $country } (משוער)
device-info-block-location-city-country = ‏{ $city }, { $country } (משוער)
device-info-block-location-country = { $country } (משוער)
device-info-block-location-unknown = מיקום לא ידוע
device-info-browser-os = ‏{ $browserName } ב־{ $genericOSName }
device-info-ip-address = כתובת IP:‏ { $ipAddress }


form-password-with-inline-criteria-signup-new-password-label =
    .label = ססמה
form-password-with-inline-criteria-signup-confirm-password-label =
    .label = חזרה על הססמה
form-password-with-inline-criteria-signup-submit-button = יצירת חשבון
form-password-with-inline-criteria-reset-new-password =
    .label = ססמה חדשה
form-password-with-inline-criteria-confirm-password =
    .label = אימות ססמה
form-password-with-inline-criteria-reset-submit-button = יצירת ססמה חדשה
form-password-with-inline-criteria-set-password-new-password-label =
    .label = ססמה
form-password-with-inline-criteria-set-password-confirm-password-label =
    .label = חזרה על הססמה
form-password-with-inline-criteria-set-password-submit-button = התחלה בסנכרון
form-password-with-inline-criteria-match-error = הססמאות אינן תואמות
form-password-with-inline-criteria-sr-too-short-message = הססמה חייבת להכיל לפחות 8 תווים.ת
form-password-with-inline-criteria-sr-not-email-message = הססמה אינה יכולה להכיל את כתובת הדוא״ל שלך.
form-password-with-inline-criteria-sr-not-common-message = אסור שהססמה תהיה ססמה נפוצה.
form-password-with-inline-criteria-sr-requirements-met = הססמה שהוזנה מכבדת את כל הדרישות לססמה תקינה.
form-password-with-inline-criteria-sr-passwords-match = הססמאות שהוזנו תואמות.


form-verify-code-default-error = שדה זה נדרש


form-verify-totp-disabled-button-title-numeric = יש להזין קוד בן { $codeLength } ספרות כדי להמשיך
form-verify-totp-disabled-button-title-alphanumeric = יש להזין קוד בן { $codeLength } תווים כדי להמשיך


get-data-trio-title-firefox = { -brand-firefox }
get-data-trio-title-firefox-recovery-key = מפתח לשחזור חשבון { -brand-firefox }
get-data-trio-download-2 =
    .title = הורדה
    .aria-label = הורדה
get-data-trio-copy-2 =
    .title = העתקה
    .aria-label = העתקה
get-data-trio-print-2 =
    .title = הדפסה
    .aria-label = הדפסה


alert-icon-aria-label =
    .aria-label = התרעה
icon-attention-aria-label =
    .aria-label = לתשומת ליבך
icon-warning-aria-label =
    .aria-label = אזהרה
authenticator-app-aria-label =
    .aria-label = יישום מאמת
backup-recovery-sms-icon-aria-label =
    .aria-label = הודעת SMS לשחזור מופעלת
backup-recovery-sms-disabled-icon-aria-label =
    .aria-label = הודעת SMS לשחזור מושבתת
canadian-flag-icon-aria-label =
    .aria-label = דגל קנדי
checkmark-success-icon-aria-label =
    .aria-label = הצלחה
checkmark-enabled-icon-aria-label =
    .aria-label = מופעל
close-icon-aria-label =
    .aria-label = סגירת הודעה
code-icon-aria-label =
    .aria-label = קוד
error-icon-aria-label =
    .aria-label = שגיאה
info-icon-aria-label =
    .aria-label = מידע
usa-flag-icon-aria-label =
    .aria-label = דגל ארצות הברית


hearts-broken-image-aria-label =
    .aria-label = מחשב וטלפון נייד עם תמונה של לב שבור על כל אחד
hearts-verified-image-aria-label =
    .aria-label = מחשב, טלפון נייד ומחשב לוח עם תמונה של לב פועם על כל אחד
signin-recovery-code-image-description =
    .aria-label = מסמך המכיל טקסט מוסתר.
signin-totp-code-image-label =
    .aria-label = מכשיר עם קוד נסתר בן 6 ספרות.
confirm-signup-aria-label =
    .aria-label = מעטפה המכילה קישור
security-shield-aria-label =
    .aria-label = איור המייצג מפתח שחזור חשבון.
recovery-key-image-aria-label =
    .aria-label = איור המייצג מפתח שחזור חשבון.
password-image-aria-label =
    .aria-label = איור המייצג הקלדת ססמה.
lightbulb-aria-label =
    .aria-label = איור המייצג יצירת רמז לאחסון.
email-code-image-aria-label =
    .aria-label = איור המייצג מייל המכיל קוד.
recovery-phone-image-description =
    .aria-label = מכשיר נייד המקבל קוד בהודעת טקסט.
recovery-phone-code-image-description =
    .aria-label = קוד שהתקבל במכשיר נייד.
backup-recovery-phone-image-aria-label =
    .aria-label = מכשיר נייד עם יכולות של הודעות SMS
backup-authentication-codes-image-aria-label =
    .aria-label = מסך מכשיר עם קודים
sync-clouds-image-aria-label =
    .aria-label = עננים עם סמל של סנכרון
confetti-falling-image-aria-label =
    .aria-label = קונפטי נופל מונפש


inline-recovery-key-setup-signed-in-firefox-2 = התחברת ל־{ -brand-firefox }.
inline-recovery-key-setup-create-header = אבטחת החשבון שלך
inline-recovery-key-setup-create-subheader = יש לך רגע להגן על הנתונים שלך?
inline-recovery-key-setup-info = ניתן ליצור מפתח לשחזור חשבון כדי לשחזר את נתוני הגלישה המסונכרנים שלך אם הססמה שלך תישכח.
inline-recovery-key-setup-start-button = יצירת מפתח שחזור חשבון
inline-recovery-key-setup-later-button = אעשה זאת מאוחר יותר


input-password-hide = הסתרת ססמה
input-password-show = הצגת ססמה
input-password-hide-aria-2 = הססמה שלך גלויה כרגע על המסך.
input-password-show-aria-2 = הססמה שלך מוסתרת כרגע.
input-password-sr-only-now-visible = הססמה שלך עכשיו גלויה על המסך.
input-password-sr-only-now-hidden = הססמה שלך עכשיו מוסתרת.


input-phone-number-country-list-aria-label = בחירת מדינה
input-phone-number-enter-number = נא להכניס מספר טלפון
input-phone-number-country-united-states = ארצות הברית
input-phone-number-country-canada = קנדה
legal-back-button = חזרה


reset-pwd-link-damaged-header = קישור לאיפוס ססמה פגום
signin-link-damaged-header = קישור האימות פגום
report-signin-link-damaged-header = קישור פגום
reset-pwd-link-damaged-message = לקישור שלחצת חסרים תווים, ויתכן שנפגם על־ידי לקוח הדואר האלקטרוני שלך. יש להעתיק את כתובת הקישור בזהירות, ולנסות שוב.


link-expired-new-link-button = קבלת קישור חדש


remember-password-text = נזכרת בססמה שלך?
remember-password-signin-link = כניסה


primary-email-confirmation-link-reused = כתובת הדוא״ל הראשית כבר עברה אימות
signin-confirmation-link-reused = ההתחברות כבר אושרה
confirmation-link-reused-message = נעשה שימוש קודם בקישור האימות, וניתן להשתמש בו רק פעם אחת.


locale-toggle-select-label = בחירת שפה
locale-toggle-browser-default = ברירת המחדל של הדפדפן
error-bad-request = בקשה שגויה


password-info-balloon-why-password-info = יש לך צורך בססמה זו כדי לגשת לכל מידע מוצפן שבחרת לאחסן אצלנו.
password-info-balloon-reset-risk-info = איפוס פירושו פוטנציאל לאבד נתונים כמו ססמאות וסימניות.


password-strength-long-instruction = יש לבחור בססמה חזקה שלא השתמשת בה באתרים אחרים. יש לוודא כי עומדת בדרישות האבטחה:
password-strength-short-instruction = יש לבחור בססמה חזקה:
password-strength-inline-min-length = לפחות 8 תווים
password-strength-inline-not-email = לא כתובת הדוא״ל שלך
password-strength-inline-not-common = לא ססמה נפוצה
password-strength-inline-confirmed-must-match = האימות מתאים לססמה החדשה
password-strength-inline-passwords-match = הססמאות תואמות


account-recovery-notification-cta = יצירה
account-recovery-notification-header-value = לא לאבד את הנתונים שלך אם הססמה שלך תישכח
account-recovery-notification-header-description = ניתן ליצור מפתח לשחזור חשבון כדי לשחזר את נתוני הגלישה המסונכרנים שלך אם הססמה שלך תישכח.
recovery-phone-promo-cta = הוספת טלפון לשחזור
recovery-phone-promo-heading = הוספת הגנה נוספת לחשבון שלך באמצעות טלפון לשחזור
recovery-phone-promo-description = כעת ניתן להתחבר עם ססמה חד פעמית באמצעות SMS אם אין באפשרותך להשתמש ביישומון האימות הדו־שלבי שלך.
recovery-phone-promo-info-link = מידע נוסף על שחזור וסיכון החלפת כרטיס SIM
promo-banner-dismiss-button =
    .aria-label = סגירת באנר


ready-complete-set-up-instruction = ניתן להשלים את ההתקנה על ידי הקלדת הססמה החדשה שלך במכשירי ה־{ -brand-firefox } הנוספים שלך.
manage-your-account-button = ניהול החשבון שלך
ready-use-service = כעת ניתן להשתמש ב־{ $serviceName }
ready-use-service-default = כעת באפשרותך להשתמש בהגדרות החשבון
ready-account-ready = החשבון שלך מוכן!
ready-continue = המשך
sign-in-complete-header = ההתחברות אומתה
sign-up-complete-header = החשבון מאומת
primary-email-verified-header = כתובת הדוא״ל הראשית עברה אימות


flow-recovery-key-download-storage-ideas-heading-v2 = מקומות לאחסון המפתח שלך:
flow-recovery-key-download-storage-ideas-folder-v2 = תיקייה במכשיר מאובטח
flow-recovery-key-download-storage-ideas-cloud = אחסון ענן מהימן
flow-recovery-key-download-storage-ideas-print-v2 = עותק פיזי מודפס
flow-recovery-key-download-storage-ideas-pwd-manager = מנהל ססמאות


flow-recovery-key-hint-header-v2 = הוספת רמז שיעזור למצוא את המפתח שלך
flow-recovery-key-hint-message-v3 = רמז זה אמור לעזור לך לזכור היכן שמרת את מפתח שחזור החשבון שלך. נוכל להראות לך אותו במהלך איפוס ססמה כדי לשחזר את הנתונים שלך.
flow-recovery-key-hint-input-v2 =
    .label = נא להכיס רמז (אופציונלי)
flow-recovery-key-hint-cta-text = סיום
flow-recovery-key-hint-char-limit-error = הרמז חייב להכיל פחות מ־255 תווים.
flow-recovery-key-hint-unsafe-char-error = הרמז אינו יכול להכיל תווי יוניקוד שלא בטוחים. רק אותיות, מספרים, סימני פיסוק וסמלים מותרים.


password-reset-warning-icon = אזהרה
password-reset-chevron-expanded = צמצום האזהרה
password-reset-chevron-collapsed = הרחבת האזהרה
password-reset-data-may-not-be-recovered = ייתכן שנתוני הדפדפן שלך לא ישוחזרו
password-reset-previously-signed-in-device-2 = יש לך מכשיר כלשהו שבו התחברת בעבר?
password-reset-data-may-be-saved-locally-2 = ייתכן שנתוני הדפדפן שלך שמורים במכשיר ההוא. יש לאפס את הססמה שלך ולאחר מכן להתחבר שם כדי לשחזר ולסנכרן את הנתונים שלך.
password-reset-no-old-device-2 = יש לך מכשיר חדש אבל אין לך גישה לאף אחד מהקודמים שלך?
password-reset-encrypted-data-cannot-be-recovered-2 = אנו מצטערים, אך לא ניתן לשחזר את נתוני הדפדפן המוצפנים שלך שנמצאים בשרתי { -brand-firefox }.
password-reset-warning-have-key = יש לך מפתח לשחזור החשבון?
password-reset-warning-use-key-link = ניתן להשתמש בו כעת כדי לאפס את הססמה שלך ולשמור את נתונים שלך


alert-bar-close-message = סגירת הודעה


avatar-your-avatar =
    .alt = הדמות המייצגת שלך
avatar-default-avatar =
    .alt = דמות מייצגת ברירת מחדל




bento-menu-title-3 = מוצרי { -brand-mozilla }
bento-menu-tagline = מוצרים נוספים מ־{ -brand-mozilla } שמגנים על הפרטיות שלך
bento-menu-vpn-2 = { -product-mozilla-vpn }
bento-menu-monitor-3 = { -product-mozilla-monitor }
bento-menu-firefox-relay-2 = { -product-firefox-relay }
bento-menu-firefox-desktop = דפדפן ‏{ -brand-firefox } למחשבים שולחניים
bento-menu-firefox-mobile = דפדפן ‏{ -brand-firefox } לטלפונים ניידים
bento-menu-made-by-mozilla = נוצר על־ידי { -brand-mozilla }


connect-another-fx-mobile = קבלת { -brand-firefox } לנייד או למחשב לוח
connect-another-find-fx-mobile-2 = ניתן למצוא את { -brand-firefox } ב־{ -google-play } וב־{ -app-store }.
connect-another-play-store-image-2 =
    .alt = הורדת { -brand-firefox } מה־{ -google-play }
connect-another-app-store-image-3 =
    .alt = הורדת { -brand-firefox } מה־{ -app-store }


cs-heading = שירותים מחוברים
cs-description = כל מה שמשמש אותך והתחברת אליו.
cs-cannot-refresh = הייתה בעיה בריענון רשימת השירותים המחוברים, עמך הסליחה.
cs-cannot-disconnect = הלקוח לא נמצא, לא ניתן להתנתק
cs-logged-out-2 = נותקת מ־{ $service }
cs-refresh-button =
    .title = ריענון שירותים מחוברים
cs-missing-device-help = פריטים חסרים או כפולים?
cs-disconnect-sync-heading = ניתוק מ־Sync


cs-disconnect-sync-content-3 = נתוני הגלישה שלך יישארו ב־<span>{ $device }</span>, אך לא יסתנכרנו עוד עם החשבון שלך.
cs-disconnect-sync-reason-3 = מהי הסיבה העיקרית לניתוק <span>{ $device }</span>?


cs-disconnect-sync-opt-prefix = מכשיר זה:
cs-disconnect-sync-opt-suspicious = חשוד
cs-disconnect-sync-opt-lost = אבוד או גנוב
cs-disconnect-sync-opt-old = ישן או שהוחלף
cs-disconnect-sync-opt-duplicate = כפול
cs-disconnect-sync-opt-not-say = אעדיף שלא לומר


cs-disconnect-advice-confirm = בסדר, הבנתי
cs-disconnect-lost-advice-heading = המכשיר האבוד או הגנוב נותק
cs-disconnect-lost-advice-content-3 = מכיוון שהמכשיר שלך אבד או נגנב, על מנת לשמור על בטיחות המידע שלך, עליך לשנות את ססמת { -product-mozilla-account(case: "the") } שלך בהגדרות החשבון שלך. כדאי גם לחפש מידע מאת יצרן המכשיר שלך לגבי מחיקת הנתונים שלך מרחוק.
cs-disconnect-suspicious-advice-heading = מכשיר חשוד נותק
cs-disconnect-suspicious-advice-content-2 = אם המכשיר המנותק אכן חשוד, כדי לשמור על בטיחות המידע שלך, עליך לשנות את ססמת { -product-mozilla-account(case: "the") } שלך בהגדרות החשבון שלך. יש גם לשנות את כל שאר הססמאות ששמרת ב־{ -brand-firefox } על־ידי הקלדת about:logins בשורת הכתובת.
cs-sign-out-button = התנתקות


dc-heading = איסוף ושימוש בנתונים
dc-subheader-moz-accounts = { -product-mozilla-accounts }
dc-subheader-ff-browser = דפדפן { -brand-firefox }
dc-subheader-content-2 = לאפשר ל{ -product-mozilla-accounts } לשלוח נתונים טכניים אל { -brand-mozilla }.
dc-subheader-ff-content = כדי לסקור או לעדכן את הגדרות הנתונים הטכניים והאינטראקטיביים של דפדפן ה־{ -brand-firefox } שלך, יש לפתוח את הגדרות { -brand-firefox } ולנווט אל פרטיות ואבטחה.
dc-opt-out-success-2 = ביטול ההצטרפות הצליח. { -product-mozilla-accounts } לא ישלחו נתונים טכניים אל { -brand-mozilla }.
dc-opt-in-success-2 = תודה! שיתוף הנתונים האלה עוזר לנו לשפר את { -product-mozilla-accounts }.
dc-opt-in-out-error-2 = הייתה בעיה בשינוי העדפת איסוף הנתונים שלך, עמך הסליחה
dc-learn-more = מידע נוסף


drop-down-menu-title-2 = תפריט { -product-mozilla-account(case: "a") }
drop-down-menu-signed-in-as-v2 = מחובר בתור
drop-down-menu-sign-out = התנתקות
drop-down-menu-sign-out-error-2 = הייתה בעיה בהתנתקות מהחשבון שלך, עמך הסליחה


flow-container-back = חזרה


flow-recovery-key-confirm-pwd-heading-v2 = נא להכניס מחדש את הססמה שלך לצורך אבטחה
flow-recovery-key-confirm-pwd-input-label = נא להכניס את הססמה שלך
flow-recovery-key-confirm-pwd-submit-button = יצירת מפתח שחזור חשבון
flow-recovery-key-confirm-pwd-submit-button-change-key = יצירת מפתח שחזור חשבון חדש


flow-recovery-key-download-heading-v2 = מפתח שחזור חשבון נוצר — יש להוריד ולאחסן אותו כעת במקום בטוח
flow-recovery-key-download-info-v2 = מפתח זה מאפשר לך לשחזר את הנתונים שלך אם הססמה שלך תישכח. יש להוריד אותו עכשיו ולשמור אותו במקום שקל לזכור — לא תהיה לך אפשרות לחזור לדף זה מאוחר יותר.
flow-recovery-key-download-next-link-v2 = המשך ללא הורדה


flow-recovery-key-success-alert = נוצר מפתח לשחזור החשבון


flow-recovery-key-info-header = יצירת מפתח לשחזור החשבון למקרה שהססמה שלך תישכח
flow-recovery-key-info-header-change-key = שינוי מפתח שחזור החשבון שלך
flow-recovery-key-info-shield-bullet-point-v2 = אנו מצפינים נתוני גלישה – ססמאות, סימניות ועוד. זה נהדר לפרטיות, אבל ייתכן שהנתונים שלך יאבדו אם הססמה שלך תישכח.
flow-recovery-key-info-key-bullet-point-v2 = לכן יצירת מפתח שחזור חשבון היא כל כך חשובה - באפשרותך להשתמש בו כדי לשחזר את הנתונים שלך.
flow-recovery-key-info-cta-text-v3 = תחילת עבודה
flow-recovery-key-info-cancel-link = ביטול


flow-setup-2fa-qr-heading = חיבור ליישומון המאמת שלך
flow-setup-2a-qr-instruction = <strong>שלב 1:</strong> יש לסרוק את קוד ה־QR הזה באמצעות כל יישומון מאמת, כמו Duo או Google Authenticator.
flow-setup-2fa-qr-alt-text =
    .alt = קוד QR להגדרת אימות דו־שלבי. יש לסרוק אותו, או לבחור באפשרות ״אין לך אפשרות לסרוק קוד QR?״ כדי לקבל מפתח סודי להגדרה במקום זאת.
flow-setup-2fa-cant-scan-qr-button = אין לך אפשרות לסרוק קוד QR?
flow-setup-2fa-manual-key-heading = הזנת הקוד באופן ידני
flow-setup-2fa-manual-key-instruction = <strong>שלב 1:</strong> יש להזין את הקוד הזה ביישומון המאמת המועדף עליך.
flow-setup-2fa-scan-qr-instead-button = האם לסרוק קוד QR במקום?
flow-setup-2fa-more-info-link = מידע נוסף על יישומוני אימות
flow-setup-2fa-button = המשך
flow-setup-2fa-step-2-instruction = <strong>שלב 2:</strong> יש להזין את הקוד מיישומון האימות שלך.
flow-setup-2fa-input-label = נא להזין קוד בן 6 ספרות
flow-setup-2fa-code-error = הקוד לא חוקי או שפג תוקפו. נא לבדוק את היישומון המאמת שלך ולנסות שוב.


flow-setup-2fa-backup-choice-heading = בחירת אמצעי לשחזור
flow-setup-2fa-backup-choice-description = שיטה זו מאפשרת לך להתחבר אם אין באפשרותך לגשת למכשיר הנייד או ליישומון המאמת שלך.
flow-setup-2fa-backup-choice-phone-title = טלפון לשחזור
flow-setup-2fa-backup-choice-phone-badge = הכי קל
flow-setup-2fa-backup-choice-phone-info = קבלת קוד לשחזור באמצעות הודעת טקסט. כרגע זמין בארה״ב ובקנדה.
flow-setup-2fa-backup-choice-code-badge = הכי בטוח
flow-setup-2fa-backup-choice-code-info = יצירה ושמירה של קודי אימות לשימוש חד פעמי.
flow-setup-2fa-backup-choice-learn-more-link = מידע על שחזור וסיכון החלפת כרטיס SIM


flow-setup-2fa-backup-code-confirm-confirm-saved = נא לאשר ששמרת את הקודים שלך על־ידי הזנת אחד מהם. ללא קודים אלה, ייתכן שלא יהיה באפשרותך להתחבר אם אין לך את היישומון המאמת שלך.
flow-setup-2fa-backup-code-confirm-code-input = נא להזין קוד בן 10 תווים
flow-setup-2fa-backup-code-confirm-button-finish = סיום


flow-setup-2fa-backup-code-dl-save-these-codes = יש לשמור אותם במקום שקל לזכור. אם אין לך גישה ליישומון המאמת שלך, יהיה עליך להזין אחד מהם כדי להיכנס.
flow-setup-2fa-backup-code-dl-button-continue = המשך


flow-setup-2fa-inline-complete-success-banner = אימות דו־שלבי הופעל
flow-setup-2fa-inline-complete-success-banner-description = כדי להגן על כל המכשירים המחוברים שלך, עליך להתנתק מכל מקום שבו חשבון זה נמצא בשימוש, ולאחר מכן להתחבר שוב באמצעות האימות הדו־שלבי החדש שלך.
flow-setup-2fa-inline-complete-backup-phone = טלפון לשחזור
flow-setup-2fa-inline-complete-backup-code-info =
    { $count ->
        [one] נותר קוד אחד
       *[other] נותרו { $count } קודים
    }
flow-setup-2fa-inline-complete-backup-code-description = זוהי שיטת השחזור הבטוחה ביותר אם אין באפשרותך להתחבר באמצעות המכשיר הנייד או היישומון המאמת שלך.
flow-setup-2fa-inline-complete-backup-phone-description = זוהי שיטת השחזור הקלה ביותר אם אין באפשרותך להתחבר באמצעות היישומון המאמת שלך.
flow-setup-2fa-inline-complete-learn-more-link = כיצד זה מגן על החשבון שלך
flow-setup-2fa-inline-complete-continue-button = המשך אל { $serviceName }
flow-setup-2fa-prompt-heading = הגדרת אימות דו־שלבי
flow-setup-2fa-prompt-description = ‏{ $serviceName } דורש שיוגדר אימות דו־שלבי כדי לשמור על אבטחת החשבון שלך.
flow-setup-2fa-prompt-use-authenticator-apps = באפשרותך להשתמש בכל אחת מ<authenticationAppsLink>יישומוני האימות האלו</authenticationAppsLink> כדי להמשיך.
flow-setup-2fa-prompt-continue-button = המשך


flow-setup-phone-confirm-code-heading = נא להכניס את קוד האימות
flow-setup-phone-confirm-code-instruction = קוד בן שש ספרות נשלח אל <span>{ $phoneNumber }</span> בהודעת טקסט. קוד זה יפוג לאחר 5 דקות.
flow-setup-phone-confirm-code-input-label = נא להזין קוד בן 6 ספרות
flow-setup-phone-confirm-code-button = אישור
flow-setup-phone-confirm-code-expired = פג תוקף הקוד?
flow-setup-phone-confirm-code-resend-code-button = שליחת הקוד מחדש
flow-setup-phone-confirm-code-resend-code-success = הקוד נשלח
flow-setup-phone-confirm-code-success-message-v2 = נוסף טלפון לשחזור
flow-change-phone-confirm-code-success-message = טלפון לשחזור השתנה


flow-setup-phone-submit-number-heading = אימות מספר הטלפון שלך
flow-setup-phone-verify-number-instruction = תישלח אליך הודעת טקסט מ־{ -brand-mozilla } עם קוד לאימות המספר שלך. אין לשתף את הקוד הזה עם אף אחד.
flow-setup-phone-submit-number-info-message-v2 = טלפון לשחזור זמין רק בארצות הברית ובקנדה. מספרי VoIP ומסכות טלפון אינם מומלצים.
flow-setup-phone-submit-number-legal = מסירת המספר שלך מהווה הסכמה שנשמור אותו כדי שנוכל לשלוח לך הודעת טקסט לצורך אימות החשבון בלבד. ייתכן שיחולו תעריפי הודעות ונתונים.
flow-setup-phone-submit-number-button = שליחת קוד


header-menu-open = סגירת תפריט
header-menu-closed = תפריט ניווט באתר
header-back-to-top-link =
    .title = חזרה למעלה
header-back-to-settings-link =
    .title = חזרה להגדרות של { -product-mozilla-account(case: "a") }
header-title-2 = { -product-mozilla-account(case: "a") }
header-help = עזרה


la-heading = חשבונות מקושרים
la-description = יש לך גישה מורשית לחשבונות הבאים.
la-set-password-button = הגדרת ססמה
la-unlink-heading = ביטול קישור מחשבון צד שלישי
la-unlink-content-3 = האם ברצונך לבטל את קישור החשבון שלך? ביטול קישור החשבון שלך אינו מנתק אותך אוטומטית מהשירותים המחוברים שלך. כדי לעשות זאת, יהיה עליך להתנתק באופן ידני מאזור 'שירותים מחוברים'.
la-unlink-content-4 = לפני ביטול קישור החשבון שלך, עליך להגדיר ססמה. ללא ססמה, לא יהיה באפשרותך להיכנס לאחר ביטול קישור החשבון שלך.
nav-linked-accounts = { la-heading }


modal-close-title = סגירה
modal-cancel-button = ביטול


modal-mfa-protected-title = נא להכניס את קוד האימות
modal-mfa-protected-subtitle = נא לעזור לנו לוודא ששינוי פרטי החשבון שלך מתבצע על ידך
modal-mfa-protected-instruction =
    { $expirationTime ->
        [one] נא להכניס את הקוד שנשלח אל <email>{ $email }</email> תוך דקה אחת.
       *[other] נא להכניס את הקוד שנשלח אל <email>{ $email }</email> תוך { $expirationTime } דקות.
    }
modal-mfa-protected-input-label = נא להזין קוד בן 6 ספרות
modal-mfa-protected-cancel-button = ביטול
modal-mfa-protected-confirm-button = אישור
modal-mfa-protected-code-expired = פג תוקף הקוד?
modal-mfa-protected-resend-code-link = שליחת קוד חדש בדוא״ל.


mvs-verify-your-email-2 = אימות כתובת הדוא״ל שלך
mvs-enter-verification-code-2 = נא להכניס את קוד האימות שלך
mvs-enter-verification-code-desc-2 = נא להכניס את קוד האימות שנשלח אל <email>{ $email }</email> תוך 5 דקות.
msv-cancel-button = ביטול
msv-submit-button-2 = אימות


nav-settings = הגדרות
nav-profile = פרופיל
nav-security = אבטחה
nav-connected-services = שירותים מחוברים
nav-data-collection = איסוף ושימוש בנתונים
nav-paid-subs = מינויים בתשלום
nav-email-comm = תקשורת בדוא״ל


page-2fa-change-title = שינוי אימות דו־שלבי
page-2fa-change-success = האימות הדו־שלבי עודכן
page-2fa-change-success-additional-message = כדי להגן על כל המכשירים המחוברים שלך, עליך להתנתק מכל מקום שבו חשבון זה נמצא בשימוש, ולאחר מכן להתחבר שוב באמצעות האימות הדו־שלבי החדש שלך.
page-2fa-change-totpinfo-error = אירעה שגיאה בהחלפת יישומון האימות הדו־שלבי שלך. נא לנסות שוב מאוחר יותר.
page-2fa-change-qr-instruction = <strong>שלב 1:</strong> יש לסרוק את קוד QR זה באמצעות כל יישומון מאמת, כמו Duo או Google Authenticator. פעולה זו תיצור חיבור חדש, חיבורים ישנים לא יעבדו יותר.


tfa-replace-code-download-description = יש לשמור את הקודים האלו במקום שקל לזכור. הקודים הישנים שלך יוחלפו לאחר שהשלב הבא יושלם.


page-2fa-setup-title = אימות דו־שלבי
page-2fa-setup-totpinfo-error = אירעה שגיאה בהגדרת האימות הדו־שלבי. נא לנסות שוב מאוחר יותר.
page-2fa-setup-incorrect-backup-code-error = הקוד הזה שגוי. נא לנסות שוב.
page-2fa-setup-success = אימות דו־שלבי הופעל
page-2fa-setup-success-additional-message = כדי להגן על כל המכשירים המחוברים שלך, עליך להתנתק מכל מקום שבו חשבון זה נמצא בשימוש, ולאחר מכן להתחבר שוב באמצעות אימות דו־שלבי.


avatar-page-title =
    .title = תמונת פרופיל
avatar-page-add-photo = הוספת תמונה
avatar-page-add-photo-button =
    .title = { avatar-page-add-photo }
avatar-page-take-photo = צילום תמונה
avatar-page-take-photo-button =
    .title = { avatar-page-take-photo }
avatar-page-remove-photo = הסרת תמונה
avatar-page-remove-photo-button =
    .title = { avatar-page-remove-photo }
avatar-page-retake-photo = צילום תמונה מחדש
avatar-page-cancel-button = ביטול
avatar-page-save-button = שמירה
avatar-page-saving-button = מתבצעת שמירה…
avatar-page-zoom-out-button =
    .title = התרחקות
avatar-page-zoom-in-button =
    .title = התקרבות
avatar-page-rotate-button =
    .title = סיבוב
avatar-page-camera-error = לא ניתן לאתחל את המצלמה
avatar-page-new-avatar =
    .alt = תמונת פרופיל חדשה
avatar-page-file-upload-error-3 = הייתה בעיה בהעלאת תמונת הפרופיל שלך
avatar-page-delete-error-3 = הייתה בעיה במחיקת תמונת הפרופיל שלך
avatar-page-image-too-large-error-2 = גודל קובץ התמונה גדול מדי להעלאה


pw-change-header =
    .title = שינוי ססמה
pw-8-chars = לפחות 8 תווים
pw-not-email = לא כתובת הדוא״ל שלך
pw-change-must-match = הססמה החדשה צריכה להיות תואמת לשדה אימות הססמה
pw-commonly-used = לא ססמה נפוצה
pw-tips = שמרו על עצמכם — אל תשתמשו באותה הססמה במקומות שונים. ניתן לעיין בעצות נוספות <linkExternal>ליצירת ססמאות חזקות</linkExternal>.
pw-change-cancel-button = ביטול
pw-change-save-button = שמירה
pw-change-forgot-password-link = שכחת את הססמה?
pw-change-current-password =
    .label = נא להכניס את הססמה הנוכחית
pw-change-new-password =
    .label = נא להכניס ססמה חדשה
pw-change-confirm-password =
    .label = נא לאמת את הססמה החדשה
pw-change-success-alert-2 = הססמה עודכנה


pw-create-header =
    .title = יצירת ססמה
pw-create-success-alert-2 = הססמה הוגדרה
pw-create-error-2 = הייתה בעיה בהגדרת הססמה שלך, עמך הסליחה


delete-account-header =
    .title = מחיקת חשבון
delete-account-step-1-2 = שלב 1 מתוך 2
delete-account-step-2-2 = שלב 2 מתוך 2
delete-account-confirm-title-4 = ייתכן שחיברת את { -product-mozilla-account(case: "the") } שלך לאחד או יותר מהמוצרים או השירותים הבאים של { -brand-mozilla } השומרים על הבטיחות והפרודוקטיביות שלך ברשת:
delete-account-product-mozilla-account = { -product-mozilla-account(case: "a") }
delete-account-product-mozilla-vpn = { -product-mozilla-vpn }
delete-account-product-mdn-plus = { -product-mdn-plus }
delete-account-product-mozilla-hubs = { -product-mozilla-hubs }
delete-account-product-mozilla-monitor = { -product-mozilla-monitor }
delete-account-product-firefox-relay = { -product-firefox-relay }
delete-account-product-firefox-sync = בתהליך סנכרון נתוני { -brand-firefox }
delete-account-product-firefox-addons = תוספות של { -brand-firefox }
delete-account-acknowledge = נא לאשר שבעצם מחיקת החשבון שלך:
delete-account-chk-box-1-v4 =
    .label = כל המנויים בתשלום שיש לך יבוטלו
delete-account-chk-box-2 =
    .label = מידע ותכונות שנשמרו במוצרי { -brand-mozilla } עלולים להיאבד
delete-account-chk-box-3 =
    .label = הפעלת החשבון מחדש עם דוא״ל זה לא תשחזר את המידע השמור שלך
delete-account-chk-box-4 =
    .label = כל ההרחבות וערכות הנושא שפרסמת ב־addons.mozilla.org יימחקו
delete-account-continue-button = המשך
delete-account-password-input =
    .label = נא להכניס ססמה
delete-account-cancel-button = ביטול
delete-account-delete-button-2 = מחיקה


display-name-page-title =
    .title = שם תצוגה
display-name-input =
    .label = נא להכניס שם תצוגה
submit-display-name = שמירה
cancel-display-name = ביטול
display-name-update-error-2 = הייתה בעיה בעדכון שם התצוגה שלך
display-name-success-alert-2 = שם התצוגה עודכן


recent-activity-title = פעילות אחרונה בחשבון
recent-activity-account-create-v2 = החשבון נוצר
recent-activity-account-disable-v2 = החשבון הושבת
recent-activity-account-enable-v2 = החשבון הופעל
recent-activity-account-two-factor-added = אימות דו־שלבי הופעל
recent-activity-account-two-factor-requested = התבקש אימות דו־שלבי
recent-activity-account-two-factor-failure = אימות דו־שלבי נכשל
recent-activity-account-two-factor-success = אימות דו־שלבי הצליח
recent-activity-account-two-factor-removed = אימות דו־שלבי הוסר
recent-activity-account-password-reset-requested = החשבון ביקש איפוס ססמה
recent-activity-account-password-reset-success = איפוס ססמת החשבון הצליחה
recent-activity-account-recovery-key-added = מפתח לשחזור החשבון הופעל
recent-activity-account-recovery-key-verification-failure = אימות המפתח לשחזור החשבון נכשל
recent-activity-account-recovery-key-verification-success = אימות המפתח לשחזור החשבון הצליח
recent-activity-account-recovery-key-removed = מפתח לשחזור החשבון הוסר
recent-activity-account-password-added = נוספה ססמה חדשה
recent-activity-account-password-changed = הססמה שונתה
recent-activity-account-secondary-email-added = נוספה כתובת דוא״ל משנית
recent-activity-account-secondary-email-removed = הוסרה כתובת דוא״ל משנית
recent-activity-account-emails-swapped = הוחלפה כתובת הדוא״ל הראשית במשנית
recent-activity-session-destroy = התנתקת מההפעלה
recent-activity-account-recovery-phone-send-code = נשלח קוד לטלפון השחזור
recent-activity-account-recovery-phone-setup-complete = הגדרת טלפון השחזור הושלמה
recent-activity-account-recovery-phone-signin-complete = התחברות עם טלפון השחזור הושלמה
recent-activity-account-recovery-phone-signin-failed = התחברות עם טלפון השחזור נכשלה
recent-activity-account-recovery-phone-removed = הוסר טלפון לשחזור
recent-activity-account-recovery-codes-replaced = הוחלפו קודים לשחזור
recent-activity-account-recovery-codes-created = נוצרו קודים לשחזור
recent-activity-account-recovery-codes-signin-complete = התחברות עם קודים לשחזור הושלמה
recent-activity-password-reset-otp-sent = קוד אימות לאיפוס הססמה נשלח
recent-activity-password-reset-otp-verified = קוד האימות לאיפוס הססמה אומת
recent-activity-must-reset-password = נדרש איפוס ססמה
recent-activity-unknown = פעילות אחרת בחשבון


recovery-key-create-page-title = מפתח שחזור חשבון
recovery-key-create-back-button-title = חזרה להגדרות


recovery-phone-remove-header = הסרת מספר טלפון לשחזור
settings-recovery-phone-remove-info = פעולה זו תסיר את <strong>{ $formattedFullPhoneNumber }</strong> כטלפון השחזור שלך.
settings-recovery-phone-remove-button = הסרת מספר טלפון
settings-recovery-phone-remove-cancel = ביטול
settings-recovery-phone-remove-success = הוסר טלפון לשחזור


page-setup-recovery-phone-heading = הוספת טלפון לשחזור
page-change-recovery-phone = שינוי טלפון השחזור
page-setup-recovery-phone-back-button-title = חזרה להגדרות
page-setup-recovery-phone-step2-back-button-title = שינוי מספר טלפון


add-secondary-email-step-1 = שלב 1 מתוך 2
add-secondary-email-error-2 = הייתה בעיה ביצירת דוא״ל זה
add-secondary-email-page-title =
    .title = כתובת דוא״ל משנית
add-secondary-email-enter-address =
    .label = נא להכניס כתובת דוא״ל
add-secondary-email-cancel-button = ביטול
add-secondary-email-save-button = שמירה
add-secondary-email-mask = לא ניתן להשתמש במסכות דוא״ל כדוא"ל משני


add-secondary-email-step-2 = שלב 2 מתוך 2
verify-secondary-email-page-title =
    .title = כתובת דוא״ל משנית
verify-secondary-email-verification-code-2 =
    .label = נא להכניס את קוד האימות שלך
verify-secondary-email-cancel-button = ביטול
verify-secondary-email-verify-button-2 = אימות
verify-secondary-email-please-enter-code-2 = נא להכניס את קוד האימות שנשלח אל <strong>{ $email }</strong> תוך 5 דקות.
verify-secondary-email-success-alert-2 = הכתובת { $email } נוספה בהצלחה
verify-secondary-email-resend-code-button = שליחה חוזרת של קוד האימות


delete-account-link = מחיקת חשבון
inactive-update-status-success-alert = התחברת בהצלחה. { -product-mozilla-account(case: "the") } שלך והנתונים שלו יישארו פעילים.


product-promo-monitor =
    .alt = { -product-mozilla-monitor }
product-promo-monitor-cta = קבלת סריקה בחינם


profile-heading = פרופיל
profile-picture =
    .header = תמונה
profile-display-name =
    .header = שם תצוגה
profile-primary-email =
    .header = כתובת דוא״ל ראשית


progress-bar-aria-label-v2 = שלב { $currentStep } מתוך { $numberOfSteps }.


security-heading = אבטחה
security-password =
    .header = ססמה
security-password-created-date = נוצר ב־{ $date }
security-not-set = לא מוגדר
security-action-create = יצירה
security-recent-activity-link = הצגת פעילות אחרונה בחשבון
signout-sync-header = פג תוקף ההפעלה
signout-sync-session-expired = משהו השתמש, עמך הסליחה. נא להתנתק מתפריט הדפדפן ולנסות שוב.


tfa-row-backup-codes-not-available = אין קודים זמינים
tfa-row-backup-codes-available-v2 =
    { $numCodesAvailable ->
        [one] נותר קוד אחד
       *[other] נותרו { $numCodesAvailable } קודים
    }
tfa-row-backup-codes-get-new-cta-v2 = יצירת קודים חדשים
tfa-row-backup-codes-add-cta = הוספה
tfa-row-backup-codes-description-2 = זוהי שיטת השחזור הבטוחה ביותר אם אין באפשרותך להשתמש במכשיר הנייד או ביישומון המאמת שלך.
tfa-row-backup-phone-title-v2 = טלפון לשחזור
tfa-row-backup-phone-not-available-v2 = לא נוסף מספר טלפון
tfa-row-backup-phone-change-cta = שינוי
tfa-row-backup-phone-add-cta = הוספה
tfa-row-backup-phone-delete-button = הסרה
tfa-row-backup-phone-delete-title-v2 = הסרת טלפון לשחזור
tfa-row-backup-phone-description-v2 = זוהי שיטת השחזור הקלה ביותר אם אין באפשרותך להשתמש ביישומון המאמת שלך.
tfa-row-backup-phone-sim-swap-risk-link = מידע נוסף על סיכון בהחלפת סים


switch-turn-off = כיבוי
switch-turn-on = הפעלה
switch-submitting = מתבצעת שליחה…
switch-is-on = פעיל
switch-is-off = כבוי


row-defaults-action-add = הוספה
row-defaults-action-change = שינוי
row-defaults-action-disable = השבתה
row-defaults-status = ללא


rk-header-1 = מפתח שחזור חשבון
rk-enabled = מופעל
rk-not-set = לא מוגדר
rk-action-create = יצירה
rk-action-change-button = שינוי
rk-action-remove = הסרה
rk-key-removed-2 = מפתח לשחזור החשבון הוסר
rk-cannot-remove-key = לא ניתן היה להסיר את מפתח שחזור החשבון שלך.
rk-refresh-key-1 = ריענון מפתח שחזור חשבון
rk-content-explain = שחזור המידע שלך כאשר הססמה שלך נשכחה.
rk-cannot-verify-session-4 = הייתה בעיה באימות ההפעלה שלך, עמך הסליחה
rk-remove-modal-heading-1 = להסיר את מפתח שחזור החשבון?
rk-remove-modal-content-1 = במקרה שהססמה שלך תאופס, לא תהיה לך אפשרות להשתמש במפתח שחזור החשבון שלך כדי לגשת לנתונים שלך. לא ניתן לבטל פעולה זו.
rk-remove-error-2 = לא ניתן היה להסיר את מפתח שחזור החשבון שלך
unit-row-recovery-key-delete-icon-button-title = מחיקת מפתח שחזור חשבון


se-heading = כתובת דוא״ל משנית
    .header = כתובת דוא״ל משנית
se-cannot-refresh-email = אירעה שגיאה בריענון דוא״ל זה, עמך הסליחה.
se-cannot-resend-code-3 = הייתה בעיה בשליחת קוד האימות מחדש, עמך הסליחה
se-set-primary-successful-2 = ‏{ $email } היא כעת כתובת הדוא״ל הראשית שלך
se-set-primary-error-2 = הייתה בעיה בשינוי כתובת הדוא״ל הראשית שלך, עמך הסליחה
se-delete-email-successful-2 = הכתובת { $email } נמחקה בהצלחה
se-delete-email-error-2 = הייתה בעיה במחיקת דוא״ל זה, עמך הסליחה
se-verify-session-3 = יהיה עליך לאמת את ההפעלה הנוכחית שלך כדי לבצע פעולה זו
se-verify-session-error-3 = הייתה בעיה באימות ההפעלה שלך, עמך הסליחה
se-remove-email =
    .title = הסרת דוא״ל
se-refresh-email =
    .title = ריענון דוא״ל
se-unverified-2 = לא מאומת
se-resend-code-2 = נדרש אימות. ניתן <button>לשלוח מחדש את קוד האימות</button> אם הוא לא נמצא בתיבת הדואר הנכנס או בתיקיית הספאם שלך.
se-make-primary = הפיכה לכתובת הראשית
se-default-content = קבלת גישה לחשבון שלך אם אין באפשרותך להתחבר לדוא״ל הראשי שלך.
se-content-note-1 = הערה: דוא"ל משני לא ישחזר את המידע שלך — יש צורך <a>במפתח שחזור חשבון</a> לשם כך.
se-secondary-email-none = ללא


tfa-row-header = אימות דו־שלבי
tfa-row-enabled = מופעל
tfa-row-disabled-status = מושבת
tfa-row-action-add = הוספה
tfa-row-action-disable = השבתה
tfa-row-action-change = שינוי
tfa-row-button-refresh =
    .title = ריענון אימות דו־שלבי
tfa-row-cannot-refresh = אירעה שגיאה בריענון אימות דו־שלבי, עמך הסליחה.
tfa-row-enabled-description = החשבון שלך מוגן על־ידי אימות דו־שלבי. יהיה עליך להכניס קוד גישה חד פעמי מהיישומון המאמת שלך בעת הכניסה ל{ -product-mozilla-account(case: "the") } שלך.
tfa-row-enabled-info-link = כיצד זה מגן על החשבון שלך
tfa-row-disabled-description-v2 = כדאי לאבטח את החשבון שלך על־ידי שימוש ביישומון מאמת (גורם צד שלישי) כשלב שני להתחברות.
tfa-row-cannot-verify-session-4 = הייתה בעיה באימות ההפעלה שלך, עמך הסליחה
tfa-row-disable-modal-heading = להשבית אימות דו־שלבי?
tfa-row-disable-modal-confirm = השבתה
tfa-row-disabled-2 = אימות דו־שלבי הושבת
tfa-row-cannot-disable-2 = לא ניתן היה להשבית את האימות הדו־שלבי
tfa-row-verify-session-info = עליך לאמת את ההפעלה הנוכחית שלך כדי להגדיר אימות דו־שלבי


terms-privacy-agreement-default-2 = המשך התהליך מהווה הסכמה ל<mozillaAccountsTos>תנאי השירות</mozillaAccountsTos> ו<mozillaAccountsPrivacy>הצהרת הפרטיות</mozillaAccountsPrivacy>.


third-party-auth-options-or = או
third-party-auth-options-sign-in-with = כניסה באמצעות
continue-with-google-button = המשך באמצעות { -brand-google }
continue-with-apple-button = המשך באמצעות { -brand-apple }


auth-error-102 = חשבון לא ידוע
auth-error-103 = ססמה שגויה
auth-error-105-2 = קוד אימות שגוי
auth-error-110 = אסימון לא חוקי
auth-error-114-generic = ניסית  יותר מידי פעמים. נא לנסות שוב מאוחר יותר.
auth-error-114 = ניסית להתחבר יותר מידי פעמים. נא לנסות שוב { $retryAfter }.
auth-error-125 = הבקשה נחסמה מסיבות אבטחה
auth-error-129-2 = הכנסת מספר טלפון לא חוקי. נא לבדוק אותו ולנסות שוב.
auth-error-138-2 = הפעלה בלתי מאומתת
auth-error-139 = כתובת הדוא״ל המשנית חייבת להיות שונה מכתובת הדוא״ל של החשבון שלך
auth-error-144 = כתובת דוא״ל זו שמורה על־ידי חשבון אחר. נא לנסות שוב מאוחר יותר או להשתמש בכתובת דוא״ל אחרת.
auth-error-155 = אסימון TOTP לא נמצא
auth-error-159 = מפתח שחזור חשבון שגוי
auth-error-183-2 = קוד אימות לא חוקי או שפג תוקפו
auth-error-202 = התכונה אינה מופעלת
auth-error-203 = המערכת אינה זמינה, נא לנסות שוב במועד מאוחר יותר
auth-error-206 = לא ניתן ליצור ססמה, הססמה כבר הוגדרה
auth-error-214 = מספר טלפון לשחזור כבר קיים
auth-error-215 = מספר טלפון לשחזור לא קיים
auth-error-216 = הושגה מכסת הודעות הטקסט
auth-error-219 = מספר טלפון זה נרשם עם יותר מדי חשבונות. נא לנסות מספר אחר.
auth-error-999 = שגיאה בלתי צפויה
auth-error-1001 = ניסיון ההתחברות בוטל
auth-error-1002 = פג תוקף ההפעלה. יש להתחבר כדי להמשיך.
auth-error-1003 = אחסון מקומי או עוגיות עדיין מושבתים
auth-error-1008 = הססמה החדשה שלך חייבת להיות שונה
auth-error-1010 = נדרשת ססמה חוקית
auth-error-1011 = נדרשת כתובת דוא״ל חוקית
auth-error-1018 = הודעת האימות שלך לא הגיעה ליעדה. האם כתובת הדוא״ל הוקלדה בצורה שגויה?
auth-error-1020 = האם כתובת הדוא״ל הוקלדה בצורה שגויה? firefox.com אינו שירות דוא״ל חוקי
auth-error-1031 = עליך להכניס את גילך כדי להשלים את ההרשמה
auth-error-1032 = עליך להקליד גיל תקני כדי להירשם
auth-error-1054 = קוד אימות דו־שלבי לא תקין
auth-error-1062 = הפניה לא חוקית
auth-error-1064 = האם כתובת הדוא״ל הוקלדה בצורה שגויה? { $domain } אינו שירות דוא״ל חוקי
auth-error-1066 = לא ניתן להשתמש במסכות דוא״ל ליצירת חשבון.
auth-error-1067 = טעות בהקלדת כתובת הדוא״ל?
recovery-phone-number-ending-digits = מספר המסתיים ב־{ $lastFourPhoneNumber }
oauth-error-1000 = משהו השתבש. נא לסגור לשונית זו ולנסות שוב.


connect-another-device-signed-in-header = התחברת ל־{ -brand-firefox }
connect-another-device-email-confirmed-banner = כתובת הדוא״ל אומתה
connect-another-device-signin-confirmed-banner = ההתחברות אומתה
connect-another-device-signin-to-complete-message = יש להיכנס ל־{ -brand-firefox } זה כדי להשלים את ההתקנה
connect-another-device-signin-link = כניסה
connect-another-device-still-adding-devices-message = עוד לא הוספת את כל המכשירים שלך? יש להיכנס ל־{ -brand-firefox } במכשיר נוסף כדי להשלים את ההתקנה
connect-another-device-signin-another-device-to-complete-message = יש להיכנס ל־{ -brand-firefox } במכשיר נוסף כדי להשלים את ההתקנה
connect-another-device-get-data-on-another-device-message = רוצה לקבל את הלשוניות, הסימניות והססמאות שלך במכשיר נוסף?
connect-another-device-cad-link = חיבור מכשיר נוסף
connect-another-device-not-now-link = לא כעת
connect-another-device-android-complete-setup-message = יש להיכנס ל־{ -brand-firefox } עבור Android כדי להשלים את ההתקנה
connect-another-device-ios-complete-setup-message = יש להיכנס ל־{ -brand-firefox } עבור iOS כדי להשלים את ההתקנה


cookies-disabled-header = אחסון מקומי ועוגיות נדרשים
cookies-disabled-enable-prompt-2 = נא להפעיל עוגיות ואחסון מקומי בדפדפן שלך על מנת לגשת ל{ -product-mozilla-account(case: "the") } שלך. הפעלתם תאפשר, לדוגמה, לזכור אותך בין הפעלות שונות.
cookies-disabled-button-try-again = לנסות שוב
cookies-disabled-learn-more = מידע נוסף


index-header = נא להכניס את כתובת הדוא״ל שלך
index-sync-header = המשך אל { -product-mozilla-account(case: "the") } שלך
index-sync-subheader = סנכרון הססמאות, הלשוניות פתוחות והסימניות שלך בכל מקום בו יש לך את { -brand-firefox }.
index-relay-header = יצירת מסכת דוא״ל
index-relay-subheader = נא לספק את כתובת הדוא״ל שאליה ברצונך להעביר הודעות דוא״ל מהדוא״ל המסוכה שלך.
index-subheader-with-servicename = המשך אל { $serviceName }
index-subheader-default = המשך אל הגדרות החשבון
index-cta = הרשמה או התחברות
index-account-info = { -product-mozilla-account(case: "a") } גם פותח גישה למוצרים נוספים המגנים על הפרטיות, מבית { -brand-mozilla }.
index-email-input =
    .label = נא להכניס את כתובת הדוא״ל שלך
index-account-delete-success = החשבון נמחק בהצלחה
index-email-bounced = הודעת האימות שלך לא הגיעה ליעדה. האם כתובת הדוא״ל הוקלדה בצורה שגויה?


inline-recovery-key-setup-create-error = אופס! לא הצלחנו ליצור מפתח לשחזור החשבון שלך. נא לנסות שוב מאוחר יותר.
inline-recovery-key-setup-recovery-created = נוצר מפתח לשחזור החשבון
inline-recovery-key-setup-download-header = אבטחת החשבון שלך
inline-recovery-key-setup-download-subheader = להוריד ולאחסן אותו כעת
inline-recovery-key-setup-download-info = יש לשמור את המפתח הזה במקום שקל לזכור — לא תהיה לך אפשרות לחזור לדף זה מאוחר יותר.
inline-recovery-key-setup-hint-header = המלצת אבטחה


inline-totp-setup-cancel-setup-button = ביטול ההגדרה
inline-totp-setup-continue-button = המשך
inline-totp-setup-add-security-link = ניתן להוסיף שכבת אבטחה לחשבון שלך על־ידי דרישת קודים של אימות מאחד <authenticationAppsLink>מיישומוני האימות האלו</authenticationAppsLink>.
inline-totp-setup-enable-two-step-authentication-default-header-2 = נא להפעיל אימות דו־שלבי <span>כדי להמשיך להגדרות החשבון</span>
inline-totp-setup-enable-two-step-authentication-custom-header-2 = נא להפעיל אימות דו־שלבי <span>כדי להמשיך אל { $serviceName }</span>
inline-totp-setup-ready-button = מוכן
inline-totp-setup-show-qr-custom-service-header-2 = נא לסרוק קוד אימות <span>כדי להמשיך אל { $serviceName }</span>
inline-totp-setup-no-qr-custom-service-header-2 = נא להכניס את הקוד באופן ידני <span>כדי להמשיך אל { $serviceName }</span>
inline-totp-setup-show-qr-default-service-header-2 = נא לסרוק קוד אימות <span>כדי להמשיך להגדרות החשבון</span>
inline-totp-setup-no-qr-default-service-header-2 = נא לסרוק את הקוד באופן ידני <span>כדי להמשיך להגדרות החשבון</span>
inline-totp-setup-enter-key-or-use-qr-instructions = יש להקליד את המפתח הסודי הזה ביישומון האימות שלך. <toggleToQRButton>לסרוק במקום זאת קוד QR?</toggleToQRButton>
inline-totp-setup-use-qr-or-enter-key-instructions = יש לסרוק את קוד ה־QR ביישומון האימות שלך ולאחר מכן להכניס את קוד האימות שהוא מספק. <toggleToManualModeButton>אין באפשרותך לסרוק את הקוד?</toggleToManualModeButton>
inline-totp-setup-on-completion-description = לאחר סיום התהליך, היישומון יתחיל לייצר עבורך קודי אימות שיהיו באפשרותך להזין.
inline-totp-setup-security-code-placeholder = קוד אימות
inline-totp-setup-code-required-error = נדרש קוד אימות
tfa-qr-code-alt = ניתן להשתמש בקוד { $code } כדי להגדיר אימות דו־שלבי ביישומים נתמכים.
inline-totp-setup-page-title = אימות דו־שלבי


legal-header = מידע משפטי
legal-terms-of-service-link = תנאי השירות
legal-privacy-link = הצהרת פרטיות


legal-privacy-heading = הצהרת פרטיות


legal-terms-heading = תנאי השירות


pair-auth-allow-heading-text = האם זה עתה התחברת ל־{ -product-firefox }?
pair-auth-allow-confirm-button = כן, לאשר את המכשיר
pair-auth-allow-refuse-device-link = אם לא ביצעת פעולה זו, <link>יש לשנות את הססמה שלך</link>


pair-auth-complete-heading = המכשיר מחובר
pair-auth-complete-now-syncing-device-text = כעת בסנכרון עם { $deviceFamily } ב־{ $deviceOS }
pair-auth-complete-sync-benefits-text = כעת באפשרותך לגשת ללשוניות הפתוחות, הססמאות והסימניות שלך בכל המכשירים שלך.
pair-auth-complete-see-tabs-button = הצגת לשוניות ממכשירים מסונכרנים
pair-auth-complete-manage-devices-link = ניהול מכשירים


auth-totp-heading-w-default-service = נא להכניס קוד אימות <span>כדי להמשיך להגדרות החשבון</span>
auth-totp-heading-w-custom-service = נא להכניס קוד אימות <span>כדי להמשיך אל { $serviceName }</span>
auth-totp-instruction = נא לפתוח את יישומון האימות שלך ולהקליד את קוד האימות שמופיע בו.
auth-totp-input-label = נא להכניס קוד בן 6 ספרות
auth-totp-confirm-button = אישור
auth-totp-code-required-error = נדרש קוד אימות


pair-wait-for-supp-heading-text = נדרש אישור <span>מהמכשיר האחר שלך</span>


pair-failure-header = הצימוד לא בוצע בהצלחה
pair-failure-message = תהליך ההגדרה הופסק.


pair-sync-header = סנכרון { -brand-firefox } עם הטלפון או מחשב הלוח שלך
pair-cad-header = חיבור { -brand-firefox } במכשיר נוסף
pair-already-have-firefox-paragraph = ‏{ -brand-firefox } כבר מותקן בטלפון או במחשב הלוח שלך?
pair-sync-your-device-button = סנכרון המכשיר שלך
pair-or-download-subheader = או הורדה
pair-scan-to-download-message = ניתן לסרוק כדי להוריד את { -brand-firefox } לנייד, או לשלוח לעצמך <linkExternal>קישור להורדה</linkExternal>.
pair-not-now-button = לא כעת
pair-take-your-data-message = לקחת את הלשוניות, הסימניות והססמאות שלך לכל מקום בו יש לך את { -brand-firefox }.
pair-get-started-button = תחילת עבודה
pair-qr-code-aria-label = קוד QR


pair-success-header-2 = המכשיר מחובר
pair-success-message-2 = הצימוד בוצע בהצלחה.


pair-supp-allow-heading-text = אישור צימוד<span>עבור { $email }</span>
pair-supp-allow-confirm-button = אישור צימוד
pair-supp-allow-cancel-link = ביטול


pair-wait-for-auth-heading-text = נדרש אישור <span>מהמכשיר האחר שלך</span>


pair-unsupported-header = ביצוע צימוד באמצעות יישומון
pair-unsupported-message = האם השתמשת במצלמת המערכת? יש לבצע צימוד מתוך היישומון של { -brand-firefox }.




set-password-heading-v2 = יצירת ססמה לסנכרון
set-password-info-v2 = ססמה זו מצפינה את הנתונים שלך. היא צריכה להיות שונה מססמת החשבון שלך ב־{ -brand-google } או ב־{ -brand-apple }.


account-recovery-confirm-key-heading = נא להכניס את המפתח לשחזור החשבון שלך
account-recovery-confirm-key-instruction = מפתח זה משחזר את נתוני הגלישה המוצפנים שלך, כגון ססמאות וסימניות, משרתי { -brand-firefox }.
account-recovery-confirm-key-input-label =
    .label = נא להכניס את המפתח לשחזור החשבון שלך בן 32 תווים
account-recovery-confirm-key-hint = רמז האחסון שלך הוא:
account-recovery-confirm-key-button-2 = המשך
account-recovery-lost-recovery-key-link-2 = לא הצלחת למצוא את מפתח שחזור החשבון שלך?


complete-reset-pw-header-v2 = יצירת ססמה חדשה
complete-reset-password-success-alert = הססמה הוגדרה
complete-reset-password-error-alert = הייתה בעיה בהגדרת הססמה שלך, עמך הסליחה
complete-reset-pw-recovery-key-link = שימוש במפתח לשחזור החשבון
reset-password-complete-banner-heading = הססמה שלך אופסה.
reset-password-complete-banner-message = מומלץ ליצור מפתח שחזור חשבון חדש מהגדרות { -product-mozilla-account(case: "the") } שלך כדי למנוע בעיות התחברות עתידיות.
complete-reset-password-desktop-relay = ‏{ -brand-firefox } ינסה לשלוח אותך בחזרה להשתמש במסכת דוא״ל לאחר ההתחברות.


confirm-backup-code-reset-password-input-label = נא להזין קוד בן 10 תווים
confirm-backup-code-reset-password-confirm-button = אישור
confirm-backup-code-reset-password-instruction = נא להכניס את אחד מהקודים החד־פעמיים ששמרת כשהגדרת את האימות הדו־שלבי.
confirm-backup-code-reset-password-locked-out-link = ננעלת מחוץ לחשבון?


confirm-reset-password-with-code-heading = נא לבדוק את הדוא״ל שלך
confirm-reset-password-with-code-instruction = שלחנו קוד אימות אל <span>{ $email }</span>.
confirm-reset-password-code-input-group-label = נא להכניס קוד בן 8 ספרות תוך 10 דקות
confirm-reset-password-otp-submit-button = המשך
confirm-reset-password-otp-resend-code-button = שליחת הקוד מחדש
confirm-reset-password-otp-different-account-link = שימוש בחשבון אחר


confirm-totp-reset-password-header = איפוס הססמה שלך
confirm-totp-reset-password-subheader-v2 = נא להכניס קוד אימות דו־שלבי
confirm-totp-reset-password-instruction-v2 = נא לפתוח את <strong>היישומון המאמת</strong> שלך כדי לאפס את הססמה שלך.
confirm-totp-reset-password-trouble-code = מתקשה בהזנת הקוד?
confirm-totp-reset-password-confirm-button = אישור
confirm-totp-reset-password-input-label-v2 = נא להזין קוד בן 6 ספרות
confirm-totp-reset-password-use-different-account = שימוש בחשבון אחר


password-reset-flow-heading = איפוס הססמה שלך
password-reset-body-2 = נשאל אותך כמה שאלות שהתשובות עליהן ידועות רק לך, כדי לשמור על החשבון שלך.
password-reset-email-input =
    .label = נא להכניס את כתובת הדוא״ל שלך
password-reset-submit-button-2 = המשך


reset-password-complete-header = הססמה שלך אופסה
reset-password-confirmed-cta = המשך אל { $serviceName }




password-reset-recovery-method-header = איפוס הססמה שלך
password-reset-recovery-method-subheader = בחירת אמצעי לשחזור
password-reset-recovery-method-details = בואו נוודא שזה אתה המשתמש בשיטות השחזור שלך.
password-reset-recovery-method-phone = טלפון לשחזור
password-reset-recovery-method-code-info =
    { $numBackupCodes ->
        [one] נשאר קוד אחד
       *[other] נשארו { $numBackupCodes } קודים
    }
password-reset-recovery-method-send-code-error-heading = הייתה בעיה בשליחת קוד לטלפון השחזור שלך


reset-password-recovery-phone-flow-heading = איפוס הססמה שלך
reset-password-recovery-phone-heading = נא להכניס קוד לשחזור
reset-password-recovery-phone-instruction-v3 = קוד בן 6 ספרות נשלח אל מספר הטלפון שמסתיים ב־<span>{ $lastFourPhoneDigits }</span> בהודעת טקסט. קוד זה יפוג לאחר 5 דקות. אין לשתף את הקוד הזה עם אף אחד.
reset-password-recovery-phone-input-label = נא להזין קוד בן 6 ספרות
reset-password-recovery-phone-code-submit-button = אישור
reset-password-recovery-phone-resend-code-button = שליחת הקוד מחדש
reset-password-recovery-phone-resend-success = הקוד נשלח
reset-password-recovery-phone-locked-out-link = ננעלת מחוץ לחשבון?
reset-password-recovery-phone-send-code-error-heading = הייתה בעיה בשליחת קוד
reset-password-recovery-phone-code-verification-error-heading = הייתה בעיה באימות הקוד שלך
reset-password-recovery-phone-general-error-description = נא לנסות שוב מאוחר יותר.
reset-password-recovery-phone-invalid-code-error-description = הקוד לא חוקי או שפג תוקפו.
reset-password-with-recovery-key-verified-page-title = הססמה אופסה בהצלחה
reset-password-complete-new-password-saved = הססמה החדשה נשמרה!
reset-password-complete-recovery-key-created = מפתח חדש לשחזור החשבון נוצר. יש להוריד ולאחסן אותו כעת במקום בטוח.
reset-password-complete-recovery-key-download-info = מפתח זה חיוני עבור שחזור נתונים אם הססמה שלך תישכח. <b>יש להוריד ולאחסן אותו במקום בטוח כעת, מכיוון שלא יהיה באפשרותך לגשת לדף זה שוב מאוחר יותר.</b>


error-label = שגיאה:
validating-signin = בתהליך אימות התחברות…
complete-signin-error-header = שגיאת אימות
signin-link-expired-header = פג תוקף קישור האימות
signin-link-expired-message-2 = פג תוקף הקישור עליו לחצת, או שכבר נעשה בו שימוש.


signin-password-needed-header-2 = נא להכניס את הססמה שלך <span>עבור { -product-mozilla-account(case: "the") } שלך</span>
signin-subheader-without-logo-with-servicename = המשך אל { $serviceName }
signin-subheader-without-logo-default = המשך אל הגדרות החשבון
signin-button = כניסה
signin-header = כניסה
signin-use-a-different-account-link = שימוש בחשבון אחר
signin-forgot-password-link = שכחת את הססמה?
signin-password-button-label = ססמה
signin-desktop-relay = ‏{ -brand-firefox } ינסה לשלוח אותך בחזרה להשתמש במסכת דוא״ל לאחר ההתחברות.
signin-code-expired-error = פג תוקף הקוד. נא להתחבר שוב.
signin-account-locked-banner-heading = איפוס הססמה שלך
signin-account-locked-banner-description = נעלנו את החשבון שלך כדי להגן עליו מפני פעילות חשודה.
signin-account-locked-banner-link = איפוס הססמה שלך כדי להיכנס


report-signin-link-damaged-body = לקישור שלחצת חסרים תווים, ויתכן שנפגם על־ידי לקוח הדואר האלקטרוני שלך. יש להעתיק את כתובת הקישור בזהירות, ולנסות שוב.
report-signin-header = לדווח על התחברות בלתי מורשית?
report-signin-body = קיבלת הודעת דוא״ל על ניסיון התחברות לחשבון שלך. האם ברצונך לדווח על פעילות זו כחשודה?
report-signin-submit-button = דיווח פעילות
report-signin-support-link = מדוע זה קורה?
report-signin-error = אירעה שגיאה בשליחת הדיווח, עמך הסליחה.
signin-bounced-header = מצטערים. חסמנו את החשבון שלך.
signin-bounced-message = הודעת האימות ששלחנו לכתובת { $email } חזרה וחסמנו את החשבון שלך כדי להגן על נתוני ה־{ -brand-firefox } שלך.
signin-bounced-help = אם זוהי כתובת דוא״ל תקנית, <linkExternal>נא ליצור איתנו קשר</linkExternal> ונעזור לשחרר את הנעילה מהחשבון שלך.
signin-bounced-create-new-account = כתובת דוא״ל זו כבר לא בבעלותך? יצירת חשבון חדש
back = חזרה


signin-push-code-heading-w-default-service = יש לאמת התחברות זו <span>כדי להמשיך להגדרות החשבון</span>
signin-push-code-heading-w-custom-service = יש לאמת התחברות זו <span>כדי להמשיך אל { $serviceName }</span>
signin-push-code-instruction = נא לבדוק את שאר המכשירים שלך ולאשר את ההתחברות הזו מדפדפן ה־ { -brand-firefox } שלך.
signin-push-code-did-not-recieve = לא קיבלת את ההודעה?
signin-push-code-send-email-link = שליחת הקוד בדוא״ל


signin-push-code-confirm-instruction = אימות ההתחברות שלך
signin-push-code-confirm-description = זיהינו ניסיון התחברות מהמכשיר הבא. אם פעולה זו בוצעה על ידך, נא לאשר את ההתחברות
signin-push-code-confirm-verifying = מתבצע אימות
signin-push-code-confirm-login = אימות ההתחברות
signin-push-code-confirm-wasnt-me = זה לא הייתי אני, ברצוני לשנות ססמה.
signin-push-code-confirm-login-approved = ההתחברות שלך אומתה. נא לסגור את החלון הזה.
signin-push-code-confirm-link-error = הקישור פגום. נא לנסות שוב.


signin-recovery-method-header = כניסה
signin-recovery-method-subheader = בחירת אמצעי לשחזור
signin-recovery-method-details = בואו נוודא שזה אתה המשתמש בשיטות השחזור שלך.
signin-recovery-method-phone = טלפון לשחזור
signin-recovery-method-code-info-v2 =
    { $numBackupCodes ->
        [one] נותר קוד אחד
       *[other] נותרו { $numBackupCodes } קודים
    }
signin-recovery-method-send-code-error-heading = הייתה בעיה בשליחת קוד לטלפון השחזור שלך


signin-recovery-code-heading = כניסה
signin-recovery-code-instruction-v3 = נא להכניס את אחד מהקודים החד־פעמיים ששמרת כשהגדרת את האימות הדו־שלבי.
signin-recovery-code-input-label-v2 = נא להזין קוד בן 10 תווים
signin-recovery-code-confirm-button = אישור
signin-recovery-code-phone-link = שימוש בטלפון לשחזור
signin-recovery-code-support-link = ננעלת מחוץ לחשבון?
signin-recovery-code-use-phone-failure = הייתה בעיה בשליחת קוד לטלפון השחזור שלך
signin-recovery-code-use-phone-failure-description = נא לנסות שוב מאוחר יותר.


signin-recovery-phone-flow-heading = כניסה
signin-recovery-phone-heading = נא להכניס קוד לשחזור
signin-recovery-phone-instruction-v3 = קוד בן שש ספרות נשלח אל מספר הטלפון שמסתיים ב־<span>{ $lastFourPhoneDigits }</span> בהודעת טקסט. קוד זה יפוג לאחר 5 דקות. אין לשתף את הקוד הזה עם אף אחד.
signin-recovery-phone-input-label = נא להזין קוד בן 6 ספרות
signin-recovery-phone-code-submit-button = אישור
signin-recovery-phone-resend-code-button = שליחת הקוד מחדש
signin-recovery-phone-resend-success = הקוד נשלח
signin-recovery-phone-locked-out-link = ננעלת מחוץ לחשבון?
signin-recovery-phone-send-code-error-heading = הייתה בעיה בשליחת קוד
signin-recovery-phone-code-verification-error-heading = הייתה בעיה באימות הקוד שלך
signin-recovery-phone-general-error-description = נא לנסות שוב מאוחר יותר.
signin-recovery-phone-invalid-code-error-description = הקוד לא חוקי או שפג תוקפו.
signin-recovery-phone-success-message = התחברת בהצלחה. עשויות לחול הגבלות אם ייעשה שימוש בטלפון השחזור שלך שוב.


signin-reported-header = תודה על הערנות שלך
signin-reported-message = נשלחה הודעה לצוות שלנו. דיווחים כאלה מסייעים לנו להישמר מתוקפים.


signin-token-code-heading-2 = נא להכניס קוד אימות <span>עבור { -product-mozilla-account(case: "the") } שלך</span>
signin-token-code-instruction-v2 = נא להכניס את הקוד שנשלח אל <email>{ $email }</email> תוך 5 דקות.
signin-token-code-input-label-v2 = נא להזין קוד בן 6 ספרות
signin-token-code-confirm-button = אישור
signin-token-code-code-expired = פג תוקף הקוד?
signin-token-code-resend-code-link = שליחת קוד חדש בדוא״ל.
signin-token-code-resend-code-countdown =
    { $seconds ->
        [one] שליחת קוד חדש בדוא״ל תוך שנייה אחת
       *[other] שליחת קוד חדש בדוא״ל תוך { $seconds } שניות
    }
signin-token-code-required-error = נדרש קוד אימות
signin-token-code-resend-error = משהו השתבש. לא ניתן היה לשלוח קוד חדש.
signin-token-code-instruction-desktop-relay = ‏{ -brand-firefox } ינסה לשלוח אותך בחזרה להשתמש במסכת דוא״ל לאחר ההתחברות.


signin-totp-code-header = כניסה
signin-totp-code-subheader-v2 = נא להכניס קוד אימות דו־שלבי
signin-totp-code-instruction-v4 = נא לפתוח את <strong>היישומון המאמת</strong> שלך ולאמת את ההתחברות שלך.
signin-totp-code-input-label-v4 = נא להזין קוד בן 6 ספרות
signin-totp-code-aal-banner-header = למה מבקשים ממך לבצע אימות?
signin-totp-code-aal-banner-content = הגדרת אימות דו־שלבי בחשבון שלך, אך עדיין לא התחברת באמצעות קוד במכשיר זה.
signin-totp-code-aal-sign-out = התנתקות במכשיר זה
signin-totp-code-aal-sign-out-error = הייתה בעיה בהתנתקות מהחשבון שלך, עמך הסליחה
signin-totp-code-confirm-button = אישור
signin-totp-code-other-account-link = שימוש בחשבון אחר
signin-totp-code-recovery-code-link = מתקשה בהזנת הקוד?
signin-totp-code-required-error = נדרש קוד אימות
signin-totp-code-desktop-relay = ‏{ -brand-firefox } ינסה לשלוח אותך בחזרה להשתמש במסכת דוא״ל לאחר ההתחברות.


signin-unblock-header = אישור התחברות זו
signin-unblock-body = נא לבדוק מהו קוד ההרשאה שנשלח לכתובת { $email } בהודעת דוא״ל.
signin-unblock-code-input = נא להכניס את קוד ההרשאה
signin-unblock-submit-button = המשך
signin-unblock-code-required-error = נדרש קוד הרשאה
signin-unblock-code-incorrect-length = קוד ההרשאה חייב להכיל 8 תווים
signin-unblock-code-incorrect-format-2 = קוד ההרשאה יכול להכיל רק אותיות ו/או מספרים
signin-unblock-resend-code-button = לא בתיקיית הדואר הנכנס או הספאם? שליחה חוזרת
signin-unblock-support-link = מדוע זה קורה?
signin-unblock-desktop-relay = ‏{ -brand-firefox } ינסה לשלוח אותך בחזרה להשתמש במסכת דוא״ל לאחר ההתחברות.




confirm-signup-code-page-title = נא להכניס את קוד האימות
confirm-signup-code-heading-2 = נא להכניס קוד אימות <span>עבור { -product-mozilla-account(case: "the") } שלך</span>
confirm-signup-code-instruction-v2 = נא להכניס את הקוד שנשלח אל <email>{ $email }</email> תוך 5 דקות.
confirm-signup-code-input-label = נא להזין קוד בן 6 ספרות
confirm-signup-code-confirm-button = אישור
confirm-signup-code-sync-button = התחלה בסנכרון
confirm-signup-code-code-expired = פג תוקף הקוד?
confirm-signup-code-resend-code-link = שליחת קוד חדש בדוא״ל.
confirm-signup-code-resend-code-countdown =
    { $seconds ->
        [one] שליחת קוד חדש בדוא״ל תוך שנייה אחת
       *[other] שליחת קוד חדש בדוא״ל תוך { $seconds } שניות
    }
confirm-signup-code-success-alert = החשבון אומת בהצלחה
confirm-signup-code-is-required-error = נדרש קוד אימות
confirm-signup-code-desktop-relay = ‏{ -brand-firefox } ינסה לשלוח אותך בחזרה להשתמש במסכת דוא״ל לאחר ההתחברות.


signup-heading-v2 = יצירת ססמה
signup-relay-info = יש צורך בססמה כדי לנהל בצורה מאובטחת את חשבונות הדוא״ל המסוכות שלך ולגשת לכלי האבטחה של { -brand-mozilla }.
signup-sync-info = סנכרון הססמאות, הסימניות ועוד, בכל מקום בו יש לך את { -brand-firefox }.
signup-sync-info-with-payment = סנכרון הססמאות, אמצעי התשלום, הסימניות ועוד, בכל מקום בו יש לך את { -brand-firefox }.
signup-change-email-link = שינוי כתובת דוא״ל


signup-confirmed-sync-header = הסנכרון מופעל
signup-confirmed-sync-success-banner = { -product-mozilla-account(case: "the") } אומת
signup-confirmed-sync-button = התחלת גלישה
signup-confirmed-sync-description-with-payment-v2 = ניתן לסנכרן את הססמאות, אמצעי התשלום, הכתובות, הסימניות, ההיסטוריה ועוד בכל מקום שבו משתמשים ב־{ -brand-firefox }.
signup-confirmed-sync-description-v2 = ניתן לסנכרן את הססמאות, הכתובות, הסימניות, ההיסטוריה ועוד בכל מקום שבו משתמשים ב־{ -brand-firefox }.
signup-confirmed-sync-add-device-link = הוספת מכשיר נוסף
signup-confirmed-sync-manage-sync-button = ניהול סנכרון
signup-confirmed-sync-set-password-success-banner = ססמת הסנכרון נוצרה
