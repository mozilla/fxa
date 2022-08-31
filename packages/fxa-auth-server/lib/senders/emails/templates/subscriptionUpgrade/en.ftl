# Variables:
# $productName (String) - The name of the subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-subject = You have upgraded to { $productName }
subscriptionUpgrade-title = Thank you for upgrading!
# Variables:
# $productNameOld (String) - The name of the previously subscribed product, e.g. Mozilla VPN
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-upgrade-info = You have successfully upgraded from { $productNameOld } to { $productName }.
# Variables:
# $paymentAmountOld (String) - The amount of the previous subscription payment, including currency, e.g. $10.00
# $paymentAmountNew (String) - The amount of the new subscription payment, including currency, e.g. $10.00
# $productPaymentCycleNew (String) - The interval of time from the end of one payment statement date to the next payment statement date of the new subscription, e.g. month
# $productPaymentCycleOld (String) - The interval of time from the end of one payment statement date to the next payment statement date of the old subscription, e.g. month
# $paymentProrated (String) - The one time fee to reflect the higher charge for the remainder of the payment cycle, including currency, e.g. $10.00
subscriptionUpgrade-content-charge-info = Starting with your next bill, your charge will change from { $paymentAmountOld } per { $productPaymentCycleOld } to { $paymentAmountNew } per { $productPaymentCycleNew }. At that time you will also be charged a one-time fee of { $paymentProrated } to reflect the higher charge for the remainder of this { $productPaymentCycleOld }.
subscriptionUpgrade-content-charge-info-different-cycle = You will be charged a one-time fee of { $paymentProrated } to reflect your subscription’s higher price for the remainder of this { $productPaymentCycleOld }. Starting with your next bill, your charge will change from { $paymentAmountOld } per { $productPaymentCycleOld } to { $paymentAmountNew } per { $productPaymentCycleNew }.
# Variables:
# $productName (String) - The name of the new subscribed product, e.g. Mozilla VPN
subscriptionUpgrade-install = If there is new software for you to install in order to use { $productName }, you will receive a separate email with download instructions.
subscriptionUpgrade-auto-renew = Your subscription will automatically renew each billing period unless you choose to cancel.
