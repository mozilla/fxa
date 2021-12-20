import React from 'react';

type CouponContextType = {
  coupon: any;
  setCoupon: any;
};

export const CouponContext = React.createContext<CouponContextType>({
  coupon: null,
  setCoupon: null,
});
