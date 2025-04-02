import { GeocodeRequest } from '@googlemaps/google-maps-services-js';

export type GeocodeRequestParamsOnly = Pick<
  GeocodeRequest['params'],
  'place_id' | 'address' | 'bounds' | 'region' | 'language' | 'components'
>;
