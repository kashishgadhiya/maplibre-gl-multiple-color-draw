import { LineMode } from './LineMode';
import type { DrawLineString } from '../types';

export class DashedLineMode extends LineMode {
  protected startLine(coords: [number, number]): void {
    this.currentFeature = {
      type: 'Feature',
      id: undefined,
      geometry: {
        type: 'LineString',
        coordinates: [coords, coords],
      },
      properties: {
        mode: 'dashed-line',
        color: this.options.color || '#3388ff',
        thickness: this.options.thickness || 2,
        dashArray: this.options.dashArray || [5, 5],
      },
    };
    const id = this.store.addFeature(this.currentFeature);
    this.currentFeature.id = id;
    this.updateMapLayers(this.store.getAllFeatures());
  }
}

