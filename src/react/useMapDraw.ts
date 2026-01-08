import { useEffect, useRef, useState } from 'react';
import type { Map } from 'maplibre-gl';
import { MapDraw } from '../core/MapDraw';
import type { DrawMode, MapDrawOptions, DrawFeature } from '../core/types';
import type { GeoJSON } from 'geojson';

export interface UseMapDrawReturn {
  mapDraw: MapDraw | null;
  enable: () => void;
  disable: () => void;
  setMode: (mode: DrawMode) => void;
  setColor: (color: string) => void;
  setThickness: (thickness: number) => void;
  getFeatures: () => DrawFeature[];
  getGeoJSON: () => GeoJSON;
  clear: () => void;
}

export function useMapDraw(
  map: Map | null,
  options: MapDrawOptions = {}
): UseMapDrawReturn {
  const mapDrawRef = useRef<MapDraw | null>(null);
  const [mapDraw, setMapDraw] = useState<MapDraw | null>(null);

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!mapDrawRef.current) {
      mapDrawRef.current = new MapDraw(map, options);
      setMapDraw(mapDrawRef.current);
    }

    return () => {
      if (mapDrawRef.current) {
        mapDrawRef.current.destroy();
        mapDrawRef.current = null;
        setMapDraw(null);
      }
    };
  }, [map]);

  const enable = () => {
    mapDrawRef.current?.enable();
  };

  const disable = () => {
    mapDrawRef.current?.disable();
  };

  const setMode = (mode: DrawMode) => {
    mapDrawRef.current?.setMode(mode);
  };

  const setColor = (color: string) => {
    mapDrawRef.current?.setColor(color);
  };

  const setThickness = (thickness: number) => {
    mapDrawRef.current?.setThickness(thickness);
  };

  const getFeatures = (): DrawFeature[] => {
    return mapDrawRef.current?.getFeatures() || [];
  };

  const getGeoJSON = (): GeoJSON => {
    return mapDrawRef.current?.getGeoJSON() || { type: 'FeatureCollection', features: [] };
  };

  const clear = () => {
    mapDrawRef.current?.clear();
  };

  return {
    mapDraw,
    enable,
    disable,
    setMode,
    setColor,
    setThickness,
    getFeatures,
    getGeoJSON,
    clear,
  };
}

