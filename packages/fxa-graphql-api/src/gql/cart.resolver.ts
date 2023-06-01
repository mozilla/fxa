import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Cart as CartType } from './model/cart';
import {
  AddCartInput,
  CheckPromotionCodeInput,
  SingleCartInput,
  UpdateCartInput,
} from './dto/input/cart';

export interface CouponDetails {
  promotionCode: string;
  type: string;
  durationInMonths: number | null;
  valid: boolean;
  discountAmount?: number;
  expired: boolean;
  maximallyRedeemed: boolean;
}

export const checkPromotionCode = async (
  priceId: string,
  promotionCode?: string
) => {
  const couponDetailsResult = await fetch(
    `http://localhost:9000/v1/oauth/subscriptions/coupon`,
    {
      mode: 'cors',
      credentials: 'omit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ priceId, promotionCode }),
    }
  );

  const couponDetails = (await couponDetailsResult.json()) as CouponDetails;

  if (couponDetails?.expired) {
    throw new Error('Expired');
  }

  if (couponDetails?.maximallyRedeemed) {
    throw new Error('Limit Reached');
  }

  if (!couponDetails.valid || !couponDetails?.discountAmount) {
    throw new Error('Invalid');
  }

  return true;
};

@Resolver((of: any) => CartType)
export class CartResolver {
  private carts: CartType[] = [
    {
      id: 1,
      promotionCode: 'CODE',
    },
    {
      id: 2,
      promotionCode: '',
    },
  ];

  @Query((returns) => [CartType], { name: 'allCarts' })
  getAllCarts() {
    return this.carts;
  }

  @Query((returns) => CartType, { name: 'singleCart' })
  getSingleCart(
    @Args('input', { type: () => SingleCartInput }) input: SingleCartInput
  ) {
    const { id } = input;
    const cart = this.carts.find((cart) => cart.id === id);

    if (!cart) throw new Error(`Could not find cart with id: ${id}`);

    return cart;
  }

  @Mutation((returns) => CartType)
  addCart(@Args('input', { type: () => AddCartInput }) input: AddCartInput) {
    const { promotionCode } = input;

    const newCart = {
      id: this.carts.length + 1,
      promotionCode,
    };

    this.carts.push(newCart);

    return newCart;
  }

  @Mutation((returns) => CartType, { name: 'updateCart' })
  async updateCart(
    @Args('input', { type: () => UpdateCartInput }) input: UpdateCartInput
  ) {
    const { id, promotionCode } = input;
    let returnCart = null;
    this.carts.forEach((cart) => {
      if (cart.id === id) {
        cart.promotionCode = promotionCode;
        returnCart = cart;
      }
    });

    await new Promise((resolve) => {
      setTimeout(() => resolve(null), 2000);
    });

    return returnCart;
  }

  @Mutation((returns) => CartType, { name: 'checkPromotionCode' })
  async checkPromotionCode(
    @Args('input', { type: () => CheckPromotionCodeInput })
    input: CheckPromotionCodeInput
  ) {
    const { id, promotionCode } = input;
    try {
      await checkPromotionCode('plan_GqM9N6qyhvxaVk', promotionCode);
    } catch (err) {
      console.error(err);
      throw err;
    }

    let returnCart = null;
    this.carts.forEach((cart) => {
      if (cart.id === id) {
        cart.promotionCode = promotionCode;
        returnCart = cart;
      }
    });

    await new Promise((resolve) => {
      setTimeout(() => resolve(null), 2000);
    });

    return returnCart;
  }
}
