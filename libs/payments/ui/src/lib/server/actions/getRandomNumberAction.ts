'use server';

const waitFor = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export async function getRandomNumberAction(formData: FormData) {
  console.log(
    'Received data from client',
    formData.get('min'),
    formData.get('max')
  );

  // It takes a really long time to generate this super secure random number...
  await waitFor(2000);

  const min = formData.get('min') as unknown as number;
  const max = formData.get('max') as unknown as number;

  const random = Math.floor(Math.random() * (max - min + 1) + min);

  return {
    randomNumber: random,
  };
}
