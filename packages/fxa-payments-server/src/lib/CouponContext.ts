import React from 'react';

export const CouponContext = React.createContext({
  coupon: null,
  setCoupon: () => {},
});
