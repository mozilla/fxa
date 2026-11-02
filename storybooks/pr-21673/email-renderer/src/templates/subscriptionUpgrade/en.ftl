# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = You have upgraded to { $productName }
subscriptionUpgrade-title = Thank you for upgrading!

# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info-2 = You have successfully upgraded to { $productName }.

## Variables:
## $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
## $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
## $paymentTaxOld (String) - The tax amount of the previous subscription payment, including currency, e.g. $1.00
## $paymentTaxNew (String) - The tax amount of the new subscription payment, including currency, e.g. $1.00
## $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
## $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
## $invoiceAmountDue (String) - The total that the customer owes after all credits, discounts, and taxes have been applied
## $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionUpgrade-content-charge-prorated-1 = You have been charged a one-time fee of { $invoiceAmountDue } to reflect your subscription’s higher price for the remainder of this billing period ({ $productPaymentCycleOld }).
subscriptionUpgrade-content-charge-credit = You have received an account credit in the amount of { $paymentProrated }.
subscriptionUpgrade-content-subscription-next-bill-change = Starting with your next bill, the price of your subscription will change.
subscriptionUpgrade-content-old-price-day = The previous rate was { $paymentAmountOld } per day.
subscriptionUpgrade-content-old-price-week = The previous rate was { $paymentAmountOld } per week.
subscriptionUpgrade-content-old-price-month = The previous rate was { $paymentAmountOld } per month.
subscriptionUpgrade-content-old-price-halfyear = The previous rate was { $paymentAmountOld } per six months.
subscriptionUpgrade-content-old-price-year = The previous rate was { $paymentAmountOld } per year.
subscriptionUpgrade-content-old-price-default = The previous rate was { $paymentAmountOld } per billing interval.
subscriptionUpgrade-content-old-price-day-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per day.
subscriptionUpgrade-content-old-price-week-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per week.
subscriptionUpgrade-content-old-price-month-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per month.
subscriptionUpgrade-content-old-price-halfyear-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per six months.
subscriptionUpgrade-content-old-price-year-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per year.
subscriptionUpgrade-content-old-price-default-tax = The previous rate was { $paymentAmountOld } + { $paymentTaxOld } tax per billing interval.
subscriptionUpgrade-content-new-price-day = Going forward, you will be charged { $paymentAmountNew } per day, excluding discounts.
subscriptionUpgrade-content-new-price-week = Going forward, you will be charged { $paymentAmountNew } per week, excluding discounts.
subscriptionUpgrade-content-new-price-month = Going forward, you will be charged { $paymentAmountNew } per month, excluding discounts.
subscriptionUpgrade-content-new-price-halfyear = Going forward, you will be charged { $paymentAmountNew } per six months, excluding discounts.
subscriptionUpgrade-content-new-price-year = Going forward, you will be charged { $paymentAmountNew } per year, excluding discounts.
subscriptionUpgrade-content-new-price-default = Going forward, you will be charged { $paymentAmountNew } per billing interval, excluding discounts.
subscriptionUpgrade-content-new-price-day-dtax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per day, excluding discounts.
subscriptionUpgrade-content-new-price-week-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per week, excluding discounts.
subscriptionUpgrade-content-new-price-month-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per month, excluding discounts.
subscriptionUpgrade-content-new-price-halfyear-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per six months, excluding discounts.
subscriptionUpgrade-content-new-price-year-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per year, excluding discounts.
subscriptionUpgrade-content-new-price-default-tax = Going forward, you will be charged { $paymentAmountNew } + { $paymentTaxNew } tax per billing interval, excluding discounts.
subscriptionUpgrade-existing = If any of your existing subscriptions overlap with this upgrade, we’ll handle them and send you a separate email with the details. If your new plan includes products that require installation, we’ll send you a separate email with setup instructions.
subscriptionUpgrade-auto-renew = Your subscription will automatically renew each billing period unless you choose to cancel.
