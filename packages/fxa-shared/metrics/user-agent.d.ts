export type ParsedUa = {
  family: string | null;
  major: string | null;
  minor: string | null;
  patch: string | null;
  toVersionString: () => string;
};
export type ParsedOs = ParsedUa & {
  patchMinor: string | null;
};
export type ParsedDevice = {
  family: string | null;
  brand: string | null;
  model: string | null;
};

export type ParsedUserAgentProperties = {
  ua: ParsedUa;
  os: ParsedOs;
  device: ParsedDevice;
};

export function parse(uaString: string | undefined): ParsedUserAgentProperties;

export function isToVersionStringSupported(ua: ParsedUa): boolean;
