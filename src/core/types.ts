import type { Feature, GeoJSON, LineString, Polygon, Point } from 'geojson';
import type { Map } from 'maplibre-gl';

export type DrawMode = 'line' | 'dashed-line' | 'freehand' | 'freehand-dashed' | 'polygon' | 'select';

export interface DrawOptions {
  color?: string;
  thickness?: number;
  dashArray?: number[];
  lineCap?: 'round' | 'butt' | 'square';
  lineJoin?: 'round' | 'bevel' | 'miter';
}

export interface MapDrawOptions extends DrawOptions {
  defaultMode?: DrawMode;
  enabled?: boolean;
}

export interface DrawFeature extends Feature {
  id?: string;
  properties: {
    mode: DrawMode;
    color: string;
    thickness: number;
    dashArray?: number[];
    [key: string]: any;
  };
}

export type DrawLineString = DrawFeature & { geometry: LineString };
export type DrawPolygon = DrawFeature & { geometry: Polygon };
export type DrawPoint = DrawFeature & { geometry: Point };

export interface ModeContext {
  map: Map;
  store: FeatureStore;
  options: DrawOptions;
}

export interface FeatureStore {
  addFeature(feature: DrawFeature): string;
  updateFeature(id: string, feature: DrawFeature): void;
  removeFeature(id: string): void;
  getFeature(id: string): DrawFeature | undefined;
  getAllFeatures(): DrawFeature[];
  clear(): void;
  getGeoJSON(): GeoJSON;
}

