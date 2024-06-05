// TBD - Might want to give more structure to this
export type NimbusContext = {
  language: string;
};

export async function initialzeNimbus(
  clientId: string,
  context: NimbusContext
) {
  const body = JSON.stringify({
    client_id: clientId,
    context,
  });

  const resp = await fetch('/nimbus-experiments', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // TODO: add error handling
  const experiments = await resp.json();
  console.log('!!!', experiments);

  return experiments;
}
