const data = {
  global: {
    title: 'Firefox Fortress',
    tagline: 'Achieve your fortress dreams',
    planPicker: 'Select your plan',
    congrats: 'You are a hero of time and space',
    paymentsUrl: '//localhost:3030/subscriptions/products',
  },
  products: [
    {
      title: 'Pro',
      slug: 'pro',
      productId: 'prod_HCMYHnbyGyRNJf',
      upgradeTo: 1,
      sellingPoints: [
        'Limited breadsticks',
        'Smug sense of superiority',
        'Impress your friends',
        'No electrolytes',
      ],
      plans: [
        {
          title: 'One Month Plan',
          cycle: 'monthly',
          price: '$5.99',
          monthPrice: '$5.99',
          planId: 'plan_HCMZcjgOeiSMch',
        },
        {
          title: 'One Year Plan',
          cycle: 'yearly',
          price: '$49.99',
          monthPrice: '$4.17',
          planId: 'plan_HCMZQPj8pn1s8J',
          savings: '30%',
          base: '$71.88',
          popular: true,
        },
      ],
    },
    {
      title: 'Pro Plus',
      slug: 'pro-plus',
      productId: 'prod_HCQGV1E3N5llAX',
      sellingPoints: [
        'Unlimited breadsticks',
        'Smugger sense of superiority',
        'Impress your friends + enemies',
        'Has electrolytes',
      ],
      plans: [
        {
          title: 'One Month Plan',
          cycle: 'monthly',
          price: '$10.99',
          monthPrice: '$10.99',
          planId: 'plan_HCQGYwmhOtIsyk',
        },
        {
          title: 'One Year Plan',
          cycle: 'yearly',
          price: '$99.99',
          monthPrice: '$8.33',
          savings: '35%',
          base: '$131.88',
          planId: 'plan_HCQHoVGIoB3Hfj',
          popular: true,
        },
      ],
    },
  ],
};

exports.data = data;
