import { describe, it, expect, beforeEach } from 'vitest';
import { Store } from '../src/core/store';
import type { DrawFeature } from '../src/core/types';

describe('Store', () => {
  let store: Store;

  beforeEach(() => {
    store = new Store();
  });

  describe('addFeature', () => {
    it('should add a feature and return an ID', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      const id = store.addFeature(feature);
      expect(id).toBeDefined();
      expect(id).toMatch(/^feature-\d+$/);
    });

    it('should use provided feature ID if available', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        id: 'custom-id',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      const id = store.addFeature(feature);
      expect(id).toBe('custom-id');
    });

    it('should increment ID counter for multiple features', () => {
      const feature1: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      const feature2: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[2, 2], [3, 3]],
        },
        properties: {
          mode: 'line',
          color: '#ff0000',
          thickness: 3,
        },
      };

      const id1 = store.addFeature(feature1);
      const id2 = store.addFeature(feature2);

      expect(id1).not.toBe(id2);
    });
  });

  describe('getFeature', () => {
    it('should retrieve a feature by ID', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      const id = store.addFeature(feature);
      const retrieved = store.getFeature(id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(id);
      expect(retrieved?.geometry).toEqual(feature.geometry);
      expect(retrieved?.properties).toEqual(feature.properties);
    });

    it('should return undefined for non-existent feature', () => {
      const retrieved = store.getFeature('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('updateFeature', () => {
    it('should update an existing feature', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      const id = store.addFeature(feature);

      const updatedFeature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [2, 2]],
        },
        properties: {
          mode: 'line',
          color: '#ff0000',
          thickness: 4,
        },
      };

      store.updateFeature(id, updatedFeature);
      const retrieved = store.getFeature(id);

      expect(retrieved?.geometry.coordinates).toEqual([[0, 0], [2, 2]]);
      expect(retrieved?.properties.color).toBe('#ff0000');
      expect(retrieved?.properties.thickness).toBe(4);
    });

    it('should not update non-existent feature', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      store.updateFeature('non-existent', feature);
      const retrieved = store.getFeature('non-existent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('removeFeature', () => {
    it('should remove a feature by ID', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      const id = store.addFeature(feature);
      store.removeFeature(id);

      const retrieved = store.getFeature(id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllFeatures', () => {
    it('should return all features', () => {
      const feature1: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      const feature2: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
        },
        properties: {
          mode: 'polygon',
          color: '#ff0000',
          thickness: 3,
        },
      };

      store.addFeature(feature1);
      store.addFeature(feature2);

      const allFeatures = store.getAllFeatures();
      expect(allFeatures.length).toBe(2);
    });

    it('should return empty array when no features', () => {
      const allFeatures = store.getAllFeatures();
      expect(allFeatures).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should remove all features', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      store.addFeature(feature);
      store.clear();

      const allFeatures = store.getAllFeatures();
      expect(allFeatures.length).toBe(0);
    });
  });

  describe('getGeoJSON', () => {
    it('should return valid GeoJSON FeatureCollection', () => {
      const feature: DrawFeature = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[0, 0], [1, 1]],
        },
        properties: {
          mode: 'line',
          color: '#3388ff',
          thickness: 2,
        },
      };

      store.addFeature(feature);
      const geoJSON = store.getGeoJSON();

      expect(geoJSON.type).toBe('FeatureCollection');
      expect(geoJSON.features).toBeDefined();
      expect(geoJSON.features.length).toBe(1);
      expect(geoJSON.features[0].type).toBe('Feature');
      expect(geoJSON.features[0].id).toBeUndefined(); // ID should be removed
    });

    it('should return empty FeatureCollection when no features', () => {
      const geoJSON = store.getGeoJSON();
      expect(geoJSON.type).toBe('FeatureCollection');
      expect(geoJSON.features).toEqual([]);
    });
  });
});

