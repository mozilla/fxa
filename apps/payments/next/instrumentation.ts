export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { app } = await import('@fxa/payments/ui/server');

    await app.initialize();
  }
}
