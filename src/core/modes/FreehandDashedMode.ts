import { FreehandMode } from './FreehandMode';
import type { DrawLineString } from '../types';

export class FreehandDashedMode extends FreehandMode {
    protected startLine(coords: [number, number]): void {
        this.currentFeature = {
            type: 'Feature',
            id: undefined,
            geometry: {
                type: 'LineString',
                coordinates: [coords],
            },
            properties: {
                mode: 'freehand-dashed',
                color: this.options.color || '#3388ff',
                thickness: this.options.thickness || 2,
                dashArray: this.options.dashArray || [5, 5],
            },
        } as DrawLineString;
        const id = this.store.addFeature(this.currentFeature);
        this.currentFeature.id = id;
        this.updateMapLayers(this.store.getAllFeatures());
    }
}

