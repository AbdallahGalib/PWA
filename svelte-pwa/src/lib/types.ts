import type { Layer } from 'leaflet';

export interface Position {
  lat: number;
  lng: number;
}

export interface CircleCoordinate extends Position {
  radius: number;
}

export interface Geofence {
  id: string;
  name: string;
  type: string;
  coordinates: Position[] | [Position, CircleCoordinate];
  layer: Layer;
}
