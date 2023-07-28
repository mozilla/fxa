"use client";

import { ReactLocalization, useLocalization } from "@fluent/react";
import { useEffect, useState } from "react";

export type ExtendedReactLocalization = ReactLocalization & {
  getFragment: () => void,
}

export const usel10n = (): ExtendedReactLocalization => {
  const [bool, setBool] = useState(false);
  const {l10n} = useLocalization();

  useEffect(() => {
    setBool(true);
    console.log(bool);
  });

  const getFragment = () => {};

  const extendl10n: ExtendedReactLocalization =
  l10n as ExtendedReactLocalization;
  extendl10n.getFragment = getFragment;

  return extendl10n;
}
