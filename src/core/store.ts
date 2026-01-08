import type { GeoJSON, Feature } from 'geojson';
import type { DrawFeature, FeatureStore } from './types';

export class Store implements FeatureStore {
  private features: Map<string, DrawFeature> = new Map();
  private nextId: number = 1;

  addFeature(feature: DrawFeature): string {
    const id = feature.id || `feature-${this.nextId++}`;
    const featureWithId: DrawFeature = {
      ...feature,
      id,
      properties: {
        ...feature.properties,
      },
    };
    this.features.set(id, featureWithId);
    return id;
  }

  updateFeature(id: string, feature: DrawFeature): void {
    if (this.features.has(id)) {
      this.features.set(id, { ...feature, id });
    }
  }

  removeFeature(id: string): void {
    this.features.delete(id);
  }

  getFeature(id: string): DrawFeature | undefined {
    return this.features.get(id);
  }

  getAllFeatures(): DrawFeature[] {
    return Array.from(this.features.values());
  }

  clear(): void {
    this.features.clear();
  }

  getGeoJSON(): GeoJSON {
    return {
      type: 'FeatureCollection',
      features: this.getAllFeatures().map((f) => {
        const { id, ...feature } = f;
        return feature as Feature;
      }),
    };
  }
}

