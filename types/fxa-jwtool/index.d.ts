declare module 'fxa-jwtool' {
  export = fxa_jwtool;
}

declare class fxa_jwtool {
  constructor(trusted: any);

  fetch(jku: any, kid: any): any;

  verify(str: any, defaults: any): any;

  static JWTVerificationError(msg: any): void;

  static sign(jwt: any, pem: any): any;

  static unverify(str: any): any;

  static verify(str: any, pem: any): any;
}

declare namespace fxa_jwtool {
  class BN {
    constructor(number: any, base: any, endian: any);

    abs(): any;

    add(num: any): any;

    addn(num: any): any;

    and(num: any): any;

    andln(num: any): any;

    bincn(bit: any): any;

    bitLength(): any;

    byteLength(): any;

    clone(): any;

    cmp(num: any): any;

    cmpn(num: any): any;

    copy(dest: any): void;

    div(num: any): any;

    divRound(num: any): any;

    divmod(num: any, mode: any): any;

    divn(num: any): any;

    forceRed(ctx: any): any;

    fromRed(): any;

    gcd(num: any): any;

    iabs(): any;

    iadd(num: any): any;

    iaddn(num: any): any;

    iand(num: any): any;

    idivn(num: any): any;

    imaskn(bits: any): any;

    imul(num: any): any;

    imuln(num: any): any;

    inspect(): any;

    invm(num: any): any;

    ior(num: any): any;

    isEven(): any;

    isOdd(): any;

    ishln(bits: any): any;

    ishrn(bits: any, hint: any, extended: any): any;

    isqr(): any;

    isub(num: any): any;

    isubn(num: any): any;

    ixor(num: any): any;

    maskn(bits: any): any;

    mod(num: any): any;

    modn(num: any): any;

    mul(num: any): any;

    mulTo(num: any, out: any): any;

    neg(): any;

    or(num: any): any;

    redAdd(num: any): any;

    redIAdd(num: any): any;

    redIMul(num: any): any;

    redISqr(): any;

    redISub(num: any): any;

    redInvm(): any;

    redMul(num: any): any;

    redNeg(): any;

    redPow(num: any): any;

    redShl(num: any): any;

    redSqr(): any;

    redSqrt(): any;

    redSub(num: any): any;

    setn(bit: any, val: any): any;

    shln(bits: any): any;

    shrn(bits: any): any;

    sqr(): any;

    strip(): any;

    sub(num: any): any;

    subn(num: any): any;

    testn(bit: any): any;

    toArray(): any;

    toJSON(): any;

    toRed(ctx: any): any;

    toString(base: any, padding: any): any;

    ucmp(num: any): any;

    xor(num: any): any;

    static BN: any;

    static mont(num: any): any;

    static red(num: any): any;

    static wordSize: number;
  }

  type PublicKeyType = {
    e: string;
    'fxa-createdAt'?: number;
    kty: string;
    kid?: string;
    n: string;
  };

  type PrivateKeyTye = PublicKeyType & {
    d: string;
    p: string;
    dp: string;
    dq: string;
    qi: string;
  };

  class JWK {
    constructor(jwk: any, pem: any);

    toJSON(): any;

    static fromFile<PrivateJWK>(filename: any, extras: any): PrivateJWK;
    static fromFile<PublicJWK>(filename: any, extras: any): PublicJWK;

    static fromObject(obj: PrivateKeyTye, extras?: any): PrivateJWK;
    static fromObject(obj: PublicKeyType, extras?: any): PublicJWK;

    static fromPEM<PrivateJWK>(pem: any, extras: any): PrivateJWK;
    static fromPEM<PublicJWK>(pem: any, extras: any): PublicJWK;
  }

  class PrivateJWK {
    constructor(jwk: any, pem: any);

    sign(data: any): Promise<any>;

    signSync(data: any): Promise<any>;
  }

  class PublicJWK {
    constructor(jwk: any, pem: any);

    verify(str: any): Promise<any>;

    verifySync(str: any): any;
  }
}
