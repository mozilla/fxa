export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getApp } = await import('@fxa/payments/ui/server');

    await getApp().initialize();
  }
}
