'use server';

const waitFor = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export async function getRandomNumberAction(min: number, max: number) {
  console.log('Received data from client', min, max);

  // It takes a really long time to generate this super secure random number...
  await waitFor(2000);

  const random = Math.floor(Math.random() * (max - min + 1) + min);

  return {
    randomNumber: random,
  };
}
