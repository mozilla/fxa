



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



settings-project-header-title = { -product-mozilla-account(case: "a") }


coupon-promo-code-applied = קוד הקופון הוחל
coupon-submit = החלה
coupon-remove = הסרה
coupon-error = הקוד שהזנת אינו חוקי או שפג תוקפו.
coupon-error-generic = אירעה שגיאה בעיבוד הקוד. נא לנסות שוב.
coupon-error-expired = פג תוקף הקוד שהזנת.
coupon-error-limit-reached = הקוד שהזנת הגיע למגבלה שלו.
coupon-error-invalid = הקוד שהזנת אינו חוקי.
coupon-enter-code =
    .placeholder = נא להזין קוד


default-input-error = שדה זה נדרש
input-error-is-required = ‏{ $label } נדרש


brand-name-mozilla-logo = הסמל של { -brand-mozilla }


new-user-sign-in-link-2 = כבר יש לך חשבון { -product-mozilla-account }? <a>כניסה</a>
new-user-enter-email =
    .label = נא להכניס את כתובת הדוא״ל שלך
new-user-confirm-email =
    .label = אימות כתובת הדוא״ל שלך
new-user-subscribe-product-updates-mozilla = ברצוני לקבל חדשות ועדכונים על מוצרים מ־{ -brand-mozilla }
new-user-subscribe-product-updates-snp = ברצוני לקבל חדשות ועדכונים על פרטיות ואבטחה מ־{ -brand-mozilla }
new-user-subscribe-product-updates-hubs = ברצוני לקבל חדשות ועדכונים על מוצרים מ־{ -product-mozilla-hubs } ו־{ -brand-mozilla }
new-user-subscribe-product-updates-mdnplus = ברצוני לקבל חדשות ועדכונים על מוצרים מ־{ -product-mdn-plus } ו־{ -brand-mozilla }
new-user-subscribe-product-assurance = אנו משתמשים בדוא״ל שלך רק ליצירת החשבון שלך. לעולם לא נמכור אותו לצד שלישי.
new-user-email-validate = כתובת הדוא״ל אינה תקינה
new-user-email-validate-confirm = כתובות הדוא״ל אינן תואמות
new-user-already-has-account-sign-in = כבר יש לך חשבון. <a>כניסה</a>
new-user-invalid-email-domain = האם הייתה לך טעות בהקלדת הדוא״ל? { $domain } לא מציע שירותי דוא״ל.


payment-confirmation-thanks-heading = תודה רבה!
payment-confirmation-thanks-heading-account-exists = תודה, עכשיו יש לבדוק את הדוא״ל שלך!
payment-confirmation-thanks-subheading = דוא״ל לאימות נשלח אל { $email } עם פרטים כיצד להתחיל עם { $product_name }.
payment-confirmation-thanks-subheading-account-exists = תתקבל הודעת דוא״ל לכתובת { $email } עם הוראות להגדרת החשבון שלך, כמו גם פרטי התשלום שלך.
payment-confirmation-order-heading = פרטי הזמנה
payment-confirmation-invoice-number = חשבונית מס' { $invoiceNumber }
payment-confirmation-invoice-date = { $invoiceDate }
payment-confirmation-details-heading-2 = פרטי תשלום
payment-confirmation-amount = { $amount } כל { $interval }
payment-confirmation-amount-day =
    { $intervalCount ->
        [one] { $amount } כל יום
        [two] { $amount } כל יומיים
       *[other] { $amount } כל { $intervalCount } ימים
    }
payment-confirmation-amount-week =
    { $intervalCount ->
        [one] { $amount } כל שבוע
        [two] { $amount } כל שבועיים
       *[other] { $amount } כל { $intervalCount } שבועות
    }
payment-confirmation-amount-month =
    { $intervalCount ->
        [one] { $amount } כל חודש
        [two] { $amount } כל חודשיים
       *[other] { $amount } כל { $intervalCount } חודשים
    }
payment-confirmation-amount-year =
    { $intervalCount ->
        [one] { $amount } כל שנה
        [two] { $amount } כל שנתיים
       *[other] { $amount } כל { $intervalCount } שנים
    }


payment-confirm-checkbox-error = עליך להשלים זאת לפני שיהיה באפשרותך להתקדם


payment-error-retry-button = ניסיון חוזר
payment-error-manage-subscription-button = ניהול המינוי שלי


iap-upgrade-already-subscribed-2 = כבר יש לך מינוי ל־{ $productName } דרך חנויות האפליקציות { -brand-google } או { -brand-apple }.
iap-upgrade-no-bundle-support = איננו תומכים בשדרוגים עבור המינויים האלה, אבל נתמוך בכך בקרוב.
iap-upgrade-contact-support = באפשרותך עדיין להשיג את המוצר הזה — נא ליצור קשר עם התמיכה כדי שנוכל לעזור לך.
iap-upgrade-get-help-button = קבלת עזרה


payment-name =
    .placeholder = שם מלא
    .label = השם כפי שמופיע על הכרטיס
payment-cc =
    .label = הכרטיס שלך
payment-cancel-btn = ביטול
payment-update-btn = עדכון
payment-pay-btn = לשלם כעת
payment-pay-with-paypal-btn-2 = תשלום באמצעות { -brand-paypal }
payment-validate-name-error = נא להכניס את השם שלך


payment-legal-copy-stripe-and-paypal-3 = ‏{ -brand-mozilla } משתמש ב־{ -brand-name-stripe } וב־{ -brand-paypal } לצורך עיבוד תשלומים מאובטח.
payment-legal-link-stripe-paypal-2 = <stripePrivacyLink>מדיניות הפרטיות של { -brand-name-stripe }</stripePrivacyLink> ו<paypalPrivacyLink>מדיניות הפרטיות של { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-paypal-2 = ‏{ -brand-mozilla } משתמש ב־{ -brand-paypal } לצורך עיבוד תשלומים מאובטח.
payment-legal-link-paypal-3 = <paypalPrivacyLink>מדיניות הפרטיות של { -brand-paypal }</paypalPrivacyLink>
payment-legal-copy-stripe-3 = ‏{ -brand-mozilla } משתמש ב־{ -brand-name-stripe } לצורך עיבוד תשלומים מאובטח.
payment-legal-link-stripe-3 = <stripePrivacyLink>מדיניות הפרטיות של { -brand-name-stripe }</stripePrivacyLink>.


payment-method-header = נא לבחור את שיטת התשלום שלך
payment-method-header-second-step = 2. { payment-method-header }
payment-method-first-approve = ראשית יש לאשר את המינוי שלך


payment-processing-message = נא להמתין בעת עיבוד התשלום שלך…


payment-confirmation-cc-card-ending-in = כרטיס המסתיים ב־{ $last4 }


pay-with-heading-paypal-2 = תשלום באמצעות { -brand-paypal }


plan-details-header = פרטי מוצר
plan-details-show-button = הצגת פרטים
plan-details-hide-button = הסתרת פרטים
plan-details-total-label = סה״כ
plan-details-tax = מיסים ועמלות


product-no-such-plan = אין תוכנית כזו למוצר הזה.


price-details-no-tax = { $priceAmount }
price-details-tax = ‏{ $priceAmount } + מס בסך { $taxAmount }
price-details-no-tax-day =
    { $intervalCount ->
        [one] ‏{ $priceAmount } כל יום
        [two] ‏{ $priceAmount } כל יומיים
       *[other] ‏{ $priceAmount } כל { $intervalCount } ימים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } כל יום
            [two] ‏{ $priceAmount } כל יומיים
           *[other] ‏{ $priceAmount } כל { $intervalCount } ימים
        }
price-details-no-tax-week =
    { $intervalCount ->
        [one] ‏{ $priceAmount } כל שבוע
        [two] ‏{ $priceAmount } כל שבועיים
       *[other] ‏{ $priceAmount } כל { $intervalCount } שבועות
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } כל שבוע
            [two] ‏{ $priceAmount } כל שבועיים
           *[other] ‏{ $priceAmount } כל { $intervalCount } שבועות
        }
price-details-no-tax-month =
    { $intervalCount ->
        [one] ‏{ $priceAmount } כל חודש
        [two] ‏{ $priceAmount } כל חודשיים
       *[other] ‏{ $priceAmount } כל { $intervalCount } חודשים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } כל יום
            [two] ‏{ $priceAmount } כל חודשיים
           *[other] ‏{ $priceAmount } כל { $intervalCount } חודשים
        }
price-details-no-tax-year =
    { $intervalCount ->
        [one] ‏{ $priceAmount } כל שנה
        [two] ‏{ $priceAmount } כל שנתיים
       *[other] ‏{ $priceAmount } כל { $intervalCount } שנים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } כל שנה
            [two] ‏{ $priceAmount } כל שנתיים
           *[other] ‏{ $priceAmount } כל { $intervalCount } שנים
        }
price-details-tax-day =
    { $intervalCount ->
        [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל יום
        [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל יומיים
       *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } ימים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל יום
            [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל יומיים
           *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } ימים
        }
price-details-tax-week =
    { $intervalCount ->
        [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שבוע
        [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שבועיים
       *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } שבועות
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שבוע
            [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שבועיים
           *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } שבועות
        }
price-details-tax-month =
    { $intervalCount ->
        [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל חודש
        [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל חודשיים
       *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } חודשים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל חודש
            [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל חודשיים
           *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } חודשים
        }
price-details-tax-year =
    { $intervalCount ->
        [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שנה
        [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שנתיים
       *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } שנים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שנה
            [two] ‏{ $priceAmount } + מס בסך { $taxAmount } כל שנתיים
           *[other] ‏{ $priceAmount } + מס בסך { $taxAmount } כל { $intervalCount } שנים
        }


subscription-create-title = הגדרת המינוי שלך
subscription-processing-title = המינוי מועבר לאישור…
subscription-noplanchange-title = שינוי תוכנית המינוי הזה אינו נתמך
subscription-iapsubscribed-title = כבר רשום כמינוי
sub-guarantee = החזר כספי מובטח תוך 30 יום


subplat-mozilla-accounts-legal-heading = { -product-mozilla-accounts }
terms = תנאי השירות
privacy = הצהרת פרטיות
terms-download = תנאי הורדה


document =
    .title = Firefox Accounts
close-aria =
    .aria-label = סגירת החלונית
settings-subscriptions-title = מינויים
coupon-promo-code = קוד קופון


plan-price-interval-day =
    { $intervalCount ->
        [one] ‏{ $amount } כל יום
        [two] ‏{ $amount } כל יומיים
       *[other] ‏{ $amount } כל { $intervalCount } ימים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $amount } כל יום
            [two] ‏{ $amount } כל יומיים
           *[other] ‏{ $amount } כל { $intervalCount } ימים
        }
plan-price-interval-week =
    { $intervalCount ->
        [one] ‏{ $amount } כל שבוע
        [two] ‏{ $amount } כל שבועיים
       *[other] ‏{ $amount } כל { $intervalCount } שבועות
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $amount } כל שבוע
            [two] ‏{ $amount } כל שבועיים
           *[other] ‏{ $amount } כל { $intervalCount } שבועות
        }
plan-price-interval-month =
    { $intervalCount ->
        [one] ‏{ $amount } כל חודש
        [two] ‏{ $amount } כל חודשיים
       *[other] ‏{ $amount } כל { $intervalCount } חודשים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $amount } כל חודש
            [two] ‏{ $amount } כל חודשיים
           *[other] ‏{ $amount } כל { $intervalCount } חודשים
        }
plan-price-interval-year =
    { $intervalCount ->
        [one] ‏{ $amount } כל שנה
        [two] ‏{ $amount } כל שנתיים
       *[other] ‏{ $amount } כל { $intervalCount } שנים
    }
    .title =
        { $intervalCount ->
            [one] ‏{ $amount } כל שנה
            [two] ‏{ $amount } כל שנתיים
           *[other] ‏{ $amount } כל { $intervalCount } שנים
        }


general-error-heading = שגיאת יישום כללית
basic-error-message = משהו השתבש. נא לנסות שוב מאוחר יותר.
payment-error-3b = אירעה שגיאה לא צפויה בעת עיבוד התשלום שלך, נא לנסות שוב.
expired-card-error = נראה שפג תוקף הכרטיס אשראי שלך. נא לנסות כרטיס אחר.
insufficient-funds-error = נראה שבכרטיס שלך אין יתרה מספיקה. נא לנסות כרטיס אחר.
withdrawal-count-limit-exceeded-error = נראה שעסקה זו תחריג אותך מעבר למסגרת האשראי שלך. נא לנסות כרטיס אחר.
charge-exceeds-source-limit = נראה שעסקה זו תחריג אותך מעבר למסגרת האשראי היומית שלך. נא לנסות כרטיס אחר או לנסות שוב תוך 24 שעות.
instant-payouts-unsupported = נראה כי כרטיס החיוב שלך לא מוגדר לתשלומים מיידיים. נא לנסות כרטיס חיוב או אשראי אחר.
card-error = לא ניתן היה לעבד את העסקה שלך. נא לאמת את פרטי כרטיס האשראי שלך ולנסות שוב.
country-currency-mismatch = המטבע של מינוי זה אינו תקף למדינה המשויכת לתשלום שלך.
currency-currency-mismatch = מצטערים. אין לך אפשרות לעבור בין מטבעות.
location-unsupported = המיקום הנוכחי שלך אינו נתמך בהתאם לתנאי השירות שלנו.
no-subscription-change = מצטערים. אין לך אפשרות לשנות את תוכנית המינוי שלך.
iap-already-subscribed = כבר קיים לך מינוי דרך { $mobileAppStore }.
fxa-account-signup-error-2 = שגיאת מערכת גרמה לכשל בהרשמה שלך ל־{ $productName }. אמצעי התשלום שלך לא חויב. נא לנסות שוב.
fxa-post-passwordless-sub-error = המינוי אושר, אך טעינת עמוד האישור נכשלה. נא לחפש בתיבת הדוא״ל שלך אם יש הודעה להקמת חשבון.
newsletter-signup-error = לא נרשמת להודעות דוא״ל עבור עדכוני מוצר. באפשרותך לנסות שוב בהגדרות החשבון שלך.
product-plan-error =
    .title = בעיה בטעינת תוכניות
product-profile-error =
    .title = בעיה בטעינת פרופיל
product-customer-error =
    .title = בעיה בטעינת לקוח
product-plan-not-found = תוכנית לא נמצאה
product-location-unsupported-error = המיקום אינו נתמך


coupon-success = התוכנית שלך תתחדש אוטומטית עם המחיר המוצע.


new-user-card-title = נא להכניס את פרטי הכרטיס שלך
new-user-submit = הרשמה כמינוי כעת


sub-update-payment-title = פרטי תשלום


pay-with-heading-card-only = תשלום באמצעות כרטיס
product-invoice-preview-error-title = בעיה בטעינת תצוגה מקדימה של החשבונית
product-invoice-preview-error-text = לא ניתן לטעון תצוגה מקדימה של החשבונית


subscription-iaperrorupgrade-title = אנחנו לא יכולים לשדרג אותך עדיין


brand-name-google-play-2 = חנות { -google-play }
brand-name-apple-app-store-2 = { -app-store }


product-plan-change-heading = סקירת השינוי שלך
sub-change-failed = שינוי התוכנית נכשל
sub-change-submit = אישור השינוי
sub-update-current-plan-label = תוכנית נוכחית
sub-update-new-plan-label = תוכנית חדשה
sub-update-total-label = סה״כ חדש


sub-update-new-plan-daily = { $productName } (יומי)
sub-update-new-plan-weekly = { $productName } (שבועי)
sub-update-new-plan-monthly = { $productName } (חודשי)
sub-update-new-plan-yearly = { $productName } (שנתי)
sub-update-prorated-upgrade-credit = יתרה שלילית המוצגת תחול כזיכוי בחשבון שלך ותשמש לחשבוניות עתידיות.


sub-item-cancel-sub = ביטול מינוי
sub-item-stay-sub = להישאר רשום כמינוי


sub-item-cancel-msg =
    לא תהיה לך עוד אפשרות להשתמש ב־{ $name } אחרי
    { $period }, היום האחרון של מחזור החיוב שלך.
sub-item-cancel-confirm =
    בטלו את הגישה ואת המידע השמור שלי
    בתוך { $name } בתאריך { $period }
sub-promo-coupon-applied = קופון של { $promotion_name } הוחל: <priceDetails></priceDetails>
subscription-management-account-credit-balance = תשלום מינוי זה הביא לזיכוי ביתרת החשבון שלך: <priceDetails></priceDetails>


sub-route-idx-reactivating = הפעלת המינוי מחדש נכשלה
sub-route-idx-cancel-failed = ביטול המינוי נכשל
sub-route-idx-contact = יצירת קשר עם התמיכה
sub-route-idx-cancel-msg-title = עצוב לנו שבחרת לעזוב
sub-route-idx-cancel-msg =
    המינוי שלך ל־{ $name } בוטל.
          <br />
          תהיה לך עדיין גישה ל־{ $name } עד { $date }.
sub-route-idx-cancel-aside-2 = יש שאלות? ניתן לבקר ב<a>תמיכה של { -brand-mozilla }</a>.


sub-customer-error =
    .title = בעיה בטעינת לקוח
sub-invoice-error =
    .title = בעיה בטעינת חשבוניות
sub-billing-update-success = פרטי החיוב שלך עודכנו בהצלחה
sub-invoice-previews-error-title = בעיה בטעינת תצוגות מקדימות של חשבוניות
sub-invoice-previews-error-text = לא ניתן לטעון תצוגות מקדימות של חשבוניות


pay-update-change-btn = עדכון
pay-update-manage-btn = ניהול


sub-next-bill = החיוב הבא בתאריך { $date }
sub-next-bill-due-date = החשבון הבא לתשלום בתאריך { $date }
sub-expires-on = יפוג בתאריך { $date }




sub-route-idx-updating = בתהליך עדכון פרטי החיוב…
sub-route-payment-modal-heading = פרטי חיוב שגויים
sub-route-payment-modal-message-2 = נראה שיש שגיאה בחשבון ה־{ -brand-paypal } שלך, אנחנו צריכים שתנקוט בצעדים הדרושים כדי לפתור בעיית תשלום זו.
sub-route-missing-billing-agreement-payment-alert = פרטי חיוב שגויים; אירעה שגיאה בחשבון שלך. <div>ניהול</div>
sub-route-funding-source-payment-alert = פרטי תשלום לא חוקיים; יש שגיאה עם החשבון שלך. ייתכן שהתראה זו תופיע למשך זמן מה לאחר שהמידע שלך יעודכן בהצלחה. <div>ניהול</div>


sub-item-no-such-plan = אין תוכנית כזו למנוי הזה.
sub-invoice-preview-error-title = תצוגה מקדימה של החשבונית לא נמצאה
sub-invoice-preview-error-text = תצוגה מקדימה של החשבונית לא נמצאה עבור מינוי זה


reactivate-confirm-dialog-header = רוצה להמשיך להשתמש ב־{ $name }?
reactivate-confirm-copy =
    הגישה שלך ל־{ $name } תימשך, ומחזור החיוב
    והתשלום שלך יישארו כפי שהם. החיוב הבא שלך יהיה
    { $amount } לכרטיס שמסתיים ב־{ $last } בתאריך { $endDate }.
reactivate-confirm-without-payment-method-copy =
    הגישה שלך ל־{ $name } תימשך, ומחזור החיוב
    והתשלום שלך יישארו כפי שהם. החיוב הבא שלך יהיה
    { $amount } בתאריך { $endDate }.
reactivate-confirm-button = חידוש מינוי


reactivate-panel-copy = הגישה שלך ל־{ $name } תאבד בתאריך <strong>{ $date }</strong>.
reactivate-success-copy = תודה! הכול מוכן.
reactivate-success-button = סגירה


sub-iap-item-google-purchase-2 = ‏{ -brand-google }: רכישה מתוך היישומון
sub-iap-item-apple-purchase-2 = ‏{ -brand-apple }: רכישה מתוך היישומון
sub-iap-item-manage-button = ניהול
