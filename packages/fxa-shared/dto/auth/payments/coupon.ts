import joi from 'typesafe-joi';

export interface CouponDetails {
  promotionCode: string;
  type: string;
  durationInMonths: number | null;
  valid: boolean;
  discountAmount?: number;
  expired?: boolean;
  maximallyRedeemed?: boolean;
}

export const couponDetailsSchema = joi.object({
  promotionCode: joi.string().required(),
  type: joi.string().required(),
  durationInMonths: joi.number().required().allow(null),
  valid: joi.boolean().required(),
  discountAmount: joi.number().optional(),
  expired: joi.boolean().optional(),
  maximallyRedeemed: joi.boolean().optional(),
});

export type couponDetailsSchema = joi.Literal<typeof couponDetailsSchema>;
