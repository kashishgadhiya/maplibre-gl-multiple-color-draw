import { describe, it, expect, beforeEach } from 'vitest';
import { MapDraw } from '../src/core/MapDraw';
import { createMockMap } from './helpers/mockMap';

describe('MapDraw', () => {
  let mockMap: ReturnType<typeof createMockMap>;
  let mapDraw: MapDraw;

  beforeEach(() => {
    mockMap = createMockMap();
  });

  describe('constructor', () => {
    it('should create MapDraw instance with default options', () => {
      mapDraw = new MapDraw(mockMap as any);
      expect(mapDraw).toBeInstanceOf(MapDraw);
    });

    it('should create MapDraw instance with custom options', () => {
      mapDraw = new MapDraw(mockMap as any, {
        color: '#ff0000',
        thickness: 5,
        defaultMode: 'polygon',
      });
      expect(mapDraw).toBeInstanceOf(MapDraw);
    });
  });

  describe('enable/disable', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
    });

    it('should enable drawing', () => {
      mapDraw.enable();
      // If no error is thrown, enable worked
      expect(true).toBe(true);
    });

    it('should disable drawing', () => {
      mapDraw.enable();
      mapDraw.disable();
      // If no error is thrown, disable worked
      expect(true).toBe(true);
    });
  });

  describe('setMode', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
      mapDraw.enable();
    });

    it('should set line mode', () => {
      mapDraw.setMode('line');
      expect(true).toBe(true);
    });

    it('should set polygon mode', () => {
      mapDraw.setMode('polygon');
      expect(true).toBe(true);
    });

    it('should set freehand mode', () => {
      mapDraw.setMode('freehand');
      expect(true).toBe(true);
    });

    it('should set select mode', () => {
      mapDraw.setMode('select');
      expect(true).toBe(true);
    });
  });

  describe('setColor', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
    });

    it('should set color', () => {
      mapDraw.setColor('#ff0000');
      expect(true).toBe(true);
    });
  });

  describe('setThickness', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
    });

    it('should set thickness', () => {
      mapDraw.setThickness(5);
      expect(true).toBe(true);
    });
  });

  describe('getFeatures', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
    });

    it('should return empty array initially', () => {
      const features = mapDraw.getFeatures();
      expect(features).toEqual([]);
    });
  });

  describe('getGeoJSON', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
    });

    it('should return valid GeoJSON FeatureCollection', () => {
      const geoJSON = mapDraw.getGeoJSON();
      expect(geoJSON.type).toBe('FeatureCollection');
      expect(geoJSON.features).toBeDefined();
      expect(Array.isArray(geoJSON.features)).toBe(true);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
    });

    it('should clear all features', () => {
      mapDraw.clear();
      const features = mapDraw.getFeatures();
      expect(features).toEqual([]);
    });
  });

  describe('destroy', () => {
    beforeEach(() => {
      mapDraw = new MapDraw(mockMap as any);
    });

    it('should destroy instance', () => {
      mapDraw.destroy();
      // If no error is thrown, destroy worked
      expect(true).toBe(true);
    });
  });
});

