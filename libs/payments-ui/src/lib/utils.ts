/**
 * DEMO IMPLEMENTATION ONLY
 * This was thrown together to make the demo work
 * Do Not Review
 */
export function getConfig() {
  return {
    contentServerURL: 'https://accounts.stage.mozaws.net',
  };
}

export async function fetchGraphQl(query: string, variables: any) {
  try {
    const result = await fetch('http://localhost:8290/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const { errors, data } = await result.json();

    if (errors) {
      throw new Error(errors[0].message);
    }

    return data;
  } catch (err) {
    console.error(err);
  }
}
