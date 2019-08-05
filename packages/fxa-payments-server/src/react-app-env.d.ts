/// <reference types="react-scripts" />
import 'redux';
import 'react-redux';

declare module 'react-redux' {
  // TODO: quick & dirty patch for new react-redux hooks - plain Dispatch doesn't support our AsyncThunk as action creator
  export function useDispatch(): Function;
}
