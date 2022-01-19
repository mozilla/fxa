export type Coupon = {
  promotionCode: string;
  type: string;
  valid: boolean;
  discountAmount?: number;
  expired?: boolean;
  maximallyRedeemed?: boolean;
};
