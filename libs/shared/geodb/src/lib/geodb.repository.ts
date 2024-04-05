import maxmind from 'maxmind';
import { GeodbFetchDataFailed, GeodbInvalidIp } from './geodb.error';
import { GeodbCityReader } from './geodb.provider';

export function getLocationData(reader: GeodbCityReader, ip: string) {
  if (!maxmind.validate(ip)) {
    throw new GeodbInvalidIp();
  }

  const locationData = reader.get(ip);
  if (!locationData) {
    throw new GeodbFetchDataFailed();
  }

  return locationData;
}
