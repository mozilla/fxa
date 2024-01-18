'use client';

import { useState } from 'react';
import { getRandomNumberAction } from '../server/actions/getRandomNumberAction';

export function ServerActionTest() {
  const [loading, setLoading] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(10);
  const [serverRandomValue, setServerRandomValue] = useState<
    number | undefined
  >();

  const callServer = () => {
    setLoading(true);
    getRandomNumberAction(min, max)
      .then((result) => {
        setServerRandomValue(result.randomNumber);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      Random value from server is: {serverRandomValue}
      <br />
      <br />
      <b>Min:</b>
      <br />
      <input
        value={min}
        onChange={(event) => setMin(parseInt(event.target.value))}
        disabled={loading}
        type="number"
      ></input>
      <br />
      <br />
      <b>Max:</b>
      <br />
      <input
        value={max}
        onChange={(event) => setMax(parseInt(event.target.value))}
        disabled={loading}
        type="number"
      ></input>
      <br />
      <br />
      <button onClick={callServer} disabled={loading}>
        Submit Test
      </button>
      <br />
      {loading && <>Loading...</>}
    </div>
  );
}
