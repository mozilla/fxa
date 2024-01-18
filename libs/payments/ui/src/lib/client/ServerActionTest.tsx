'use server';

import { getRandomNumberAction } from '../server/actions/getRandomNumberAction';

export async function ServerActionTest() {
  return (
    <form action={getRandomNumberAction}>
      <input defaultValue="0" name="min" type="number"></input>
      <br />
      <br />
      <b>Max:</b>
      <br />
      <input defaultValue="10" name="max" type="number"></input>
      <br />
      <br />
      <button type="submit">Submit Test</button>
    </form>
  );
}
