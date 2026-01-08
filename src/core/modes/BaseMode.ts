import type { Map } from 'maplibre-gl';
import type { DrawFeature, ModeContext, DrawOptions } from '../types';
import type { FeatureStore } from '../types';

export abstract class BaseMode {
  protected map: Map;
  protected store: FeatureStore;
  protected options: DrawOptions;
  protected isActive: boolean = false;
  protected eventHandlers: globalThis.Map<string, (e: any) => void> = new globalThis.Map();

  constructor(context: ModeContext) {
    this.map = context.map;
    this.store = context.store;
    this.options = context.options;
  }

  abstract enable(): void;
  abstract disable(): void;

  protected addEventHandler(event: string, handler: (e: any) => void): void {
    this.eventHandlers.set(event, handler);
    this.map.on(event, handler);
  }

  protected removeEventHandlers(): void {
    this.eventHandlers.forEach((handler, event) => {
      this.map.off(event, handler);
    });
    this.eventHandlers.clear();
  }

  protected updateMapLayers(features: DrawFeature[]): void {
    const source = this.map.getSource('mapdraw-features') as any;
    if (source) {
      const featureCollection = {
        type: 'FeatureCollection' as const,
        features: features.map((f) => {
          const { id, ...feature } = f;
          return feature;
        }),
      };
      source.setData(featureCollection);
    }
  }

  protected getCoordinatesFromEvent(e: any): [number, number] {
    return [e.lngLat.lng, e.lngLat.lat];
  }

  setOptions(options: DrawOptions): void {
    this.options = { ...this.options, ...options };
  }
}

